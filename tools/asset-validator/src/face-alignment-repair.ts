import { z } from 'zod';
import { assetSourceSchema } from '@character-studio/core';
import type { RgbaImage } from '@character-studio/render-utils';

const pin = z.strictObject({ source: assetSourceSchema, sourceSha256: z.string().regex(/^[a-f0-9]{64}$/) });
const selected = pin.extend({ selection: pin });
export const faceAlignmentRepairSchema = z.strictObject({
  study: pin, settings: z.strictObject({ source: z.literal('inputs/alignment-v4/ownership-settings.json'), sourceSha256: z.string().regex(/^[a-f0-9]{64}$/) }), head: selected, neck: selected.extend({ referenceSelection: pin }),
  leftEar: selected.extend({ referenceSelection: pin }), retention: pin,
  front: selected, rear: selected,
});

export const faceAlignmentGeometry = {
  headWindow: { x: 435, y: 170, width: 168, height: 108 },
  neckWindow: { x: 478, y: 278, width: 77, height: 30 },
  leftEar: [[578, 183], [601, 183], [601, 202], [593, 213], [582, 223], [576, 223], [575, 218], [578, 207], [579, 197]],
  referenceLeftEar: [[588, 187], [593, 187], [597, 190], [598, 194], [596, 201], [592, 208], [587, 213], [581, 217], [582, 212], [585, 205], [587, 196]],
  referenceEarExclusions: [[588, 187], [589, 187], [584, 206], [584, 207]],
  referenceEarPixels: [[591, 212], [590, 213], [589, 214], [588, 215], [586, 216], [585, 217]],
  referenceNeckPixels: [[485, 286], [486, 286], [485, 287], [486, 287], [485, 288], [541, 281], [542, 282], [542, 283], [542, 285], [543, 287], [543, 288], [543, 289], [543, 290], [548, 295], [548, 296], [548, 297], [549, 298], [549, 299], [549, 300], [549, 301], [549, 305], [550, 306], [550, 307]],
  frontGapRegions: [{ x: 445, y: 211, width: 40, height: 56 }, { x: 542, y: 211, width: 50, height: 56 }],
  frontReferencePixels: [[569, 224], [568, 225], [569, 225], [567, 227], [566, 228], [565, 230], [564, 231], [563, 232], [562, 233], [562, 234], [561, 235], [560, 236], [559, 237], [558, 238], [557, 239], [556, 240], [555, 241], [554, 242], [553, 243], [552, 244], [550, 245], [551, 245], [549, 246], [550, 246], [548, 247], [549, 247], [547, 248], [548, 248], [546, 249], [547, 249], [545, 250], [544, 251], [543, 252], [542, 253]],
  rearGapRegions: [{ x: 477, y: 268, width: 17, height: 40 }, { x: 536, y: 268, width: 18, height: 40 }],
} as const;

const inBox = (x: number, y: number, b: { x: number; y: number; width: number; height: number }) => x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height;
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let selected = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected;
  }
  return selected;
};

/** Ordered native ownership checks, including repinned edits outside local windows. */
export function validateFaceAlignmentRepair(images: {
  study: RgbaImage; reference: RgbaImage; originalHead: RgbaImage; originalNeck: RgbaImage; originalFront: RgbaImage; originalRear: RgbaImage;
  previousFit: RgbaImage; beforeHairRepair: RgbaImage; rightEar: RgbaImage;
  head: RgbaImage; headSelection: RgbaImage; neck: RgbaImage; neckSelection: RgbaImage; neckReferenceSelection: RgbaImage;
  leftEar: RgbaImage; earSelection: RgbaImage; earReferenceSelection: RgbaImage; retention: RgbaImage;
  front: RgbaImage; frontSelection: RgbaImage; rear: RgbaImage; rearSelection: RgbaImage;
}) {
  const g = faceAlignmentGeometry, neckPixels = new Set(g.referenceNeckPixels.map(([x, y]) => y * 1024 + x)), earExclusions = new Set(g.referenceEarExclusions.map(([x, y]) => y * 1024 + x));
  const earPixels = new Set(g.referenceEarPixels.map(([x, y]) => y * 1024 + x)), frontPixels = new Set(g.frontReferencePixels.map(([x, y]) => y * 1024 + x));
  const counts = { leftEar: 0, referenceEar: 0, referenceNeck: 0, frontHair: 0, rearHair: 0 };
  const mask = (image: RgbaImage, i: number, selected: boolean) => { if (image.data.subarray(i, i + 4).some(v => v !== (selected ? 255 : 0))) throw new Error('Aligned face masks must preserve their bounded native ownership.'); };
  const owner = (image: RgbaImage, i: number, source: RgbaImage | undefined, name: string) => { if (image.data.subarray(i, i + 4).some((v, c) => v !== (source ? source.data[i + c] : 0))) throw new Error(`${name}: aligned fit must preserve native source ownership inside masks and unchanged pixels outside.`); };
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    const headSelected = inBox(x, y, g.headWindow), nose = x >= 504 && x < 518 && y >= 207 && y < 234;
    mask(images.headSelection, i, headSelected);
    owner(images.head, i, nose ? images.reference : headSelected ? images.study : images.originalHead, 'Head');
    const neckSelected = inBox(x, y, g.neckWindow), neckReference = neckPixels.has(p);
    mask(images.neckSelection, i, neckSelected); mask(images.neckReferenceSelection, i, neckReference);
    owner(images.neck, i, neckReference ? images.reference : neckSelected ? images.study : images.originalNeck, 'Neck');
    const earSelected = contains(x + .5, y + .5, g.leftEar) && images.study.data[i + 3]! >= 8;
    const earReference = (contains(x + .5, y + .5, g.referenceLeftEar) && !earExclusions.has(p)) || earPixels.has(p);
    mask(images.earSelection, i, earSelected); mask(images.earReferenceSelection, i, earReference);
    owner(images.leftEar, i, earReference ? images.reference : earSelected ? images.study : undefined, 'Character-left ear');
    mask(images.retention, i, !(images.rightEar.data[i + 3]! >= 8 || images.leftEar.data[i + 3]! >= 8));
    const frontSelected = (g.frontGapRegions.some(b => inBox(x, y, b)) && images.reference.data[i + 3]! >= 128 && images.previousFit.data[i + 3]! < 8) || frontPixels.has(p);
    const rearSelected = g.rearGapRegions.some(b => inBox(x, y, b)) && images.reference.data[i + 3]! >= 128 && images.beforeHairRepair.data[i + 3]! < 8;
    mask(images.frontSelection, i, frontSelected); mask(images.rearSelection, i, rearSelected);
    owner(images.front, i, frontSelected ? images.reference : images.originalFront, 'Front hair');
    owner(images.rear, i, rearSelected ? images.reference : images.originalRear, 'Rear hair');
    if (images.leftEar.data[i + 3]! >= 8) counts.leftEar++;
    if (earReference) counts.referenceEar++;
    if (neckReference) counts.referenceNeck++;
    if (frontSelected) counts.frontHair++;
    if (rearSelected) counts.rearHair++;
  }
  return counts;
}
