import { z } from 'zod';
import { assetSourceSchema } from '@character-studio/core';
import type { RgbaImage } from '@character-studio/render-utils';

const pin = z.strictObject({ source: assetSourceSchema, sourceSha256: z.string().regex(/^[a-f0-9]{64}$/) });
export const faceProportionSchema = pin.extend({ selection: pin, noseSelection: pin, retention: pin, rightEar: pin.extend({ selection: pin }), leftEar: pin.extend({ selection: pin }),
  joinStudy: pin.optional(), headJoinSelection: pin.optional(), neck: pin.optional(), neckSelection: pin.optional(),
}).refine((d) => (!d.joinStudy && !d.headJoinSelection && !d.neck && !d.neckSelection) || (!!d.joinStudy && !!d.headJoinSelection && !!d.neck && !!d.neckSelection), 'Face join revision must declare complete native head/neck study ownership.');
export const faceProportionWindow = { x: 435, y: 170, width: 157, height: 108 } as const;
export const faceEarPolygons = {
  right: [[423, 183], [440, 183], [453, 222], [451, 225], [438, 225], [426, 213], [423, 201]],
  left: [[580, 183], [600, 183], [602, 201], [590, 224], [574, 226], [574, 218], [580, 204]],
} as const;
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let selected = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected;
  }
  return selected;
};

/** Verify native local face ownership and retained same-side ear geometry; no transformations. */
export function validateFaceProportionRepair(images: {
  original: RgbaImage; study: RgbaImage; reference: RgbaImage; head: RgbaImage; selection: RgbaImage; noseSelection: RgbaImage; retention: RgbaImage;
  rightEar: RgbaImage; rightSelection: RgbaImage; originalRightEar: RgbaImage; leftEar: RgbaImage; leftSelection: RgbaImage; originalLeftEar: RgbaImage;
  joinStudy?: RgbaImage | undefined; headJoinSelection?: RgbaImage | undefined; neck?: RgbaImage | undefined; neckSelection?: RgbaImage | undefined; originalNeck: RgbaImage;
}) {
  const counts = { right: 0, left: 0 };
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    const local = x >= 435 && x < 592 && y >= 170 && y < 278;
    const nose = x >= 504 && x < 518 && y >= 207 && y < 234;
    if (images.selection.data.subarray(i, i + 4).some((v) => v !== (local ? 255 : 0)) || images.noseSelection.data.subarray(i, i + 4).some((v) => v !== (nose ? 255 : 0))) throw new Error('Face proportion masks must retain their bounded native face/nose windows.');
    const headJoin = (x >= 436 && x < 449 && y >= 200 && y < 216) || (x >= 436 && x < 455 && y >= 216 && y < 226) || (x >= 568 && x < 584 && y >= 200 && y < 226) || (x >= 478 && x < 550 && y >= 263 && y < 278);
    const neckJoin = x >= 478 && x < 550 && y >= 278 && y < 293;
    if (images.joinStudy) {
      if (images.headJoinSelection!.data.subarray(i, i + 4).some((v) => v !== (headJoin ? 255 : 0)) || images.neckSelection!.data.subarray(i, i + 4).some((v) => v !== (neckJoin ? 255 : 0))) throw new Error('Root/neck joins must retain their bounded native masks.');
      const neckOwner = neckJoin ? images.joinStudy : images.originalNeck;
      if (images.neck!.data.subarray(i, i + 4).some((v, c) => v !== neckOwner.data[i + c])) throw new Error('Slim-face neck must preserve native source outside its local join.');
    }
    const owner = nose ? images.reference : images.joinStudy && headJoin ? images.joinStudy : local ? images.study : images.original;
    if (images.head.data.subarray(i, i + 4).some((v, c) => v !== owner.data[i + c])) throw new Error('Slim head must preserve approved skin outside its local window and native study/reference ownership inside.');
    let earSelected = false;
    for (const side of ['right', 'left'] as const) {
      const original = side === 'right' ? images.originalRightEar : images.originalLeftEar;
      const ear = side === 'right' ? images.rightEar : images.leftEar, mask = side === 'right' ? images.rightSelection : images.leftSelection;
      const selected = original.data[i + 3]! >= 8 && contains(x + 0.5, y + 0.5, faceEarPolygons[side]);
      if (mask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0)) || ear.data.subarray(i, i + 4).some((v, c) => v !== (selected ? original.data[i + c] : 0))) throw new Error(`${side}: slim-face ears must retain their approved native size and same-side pixels.`);
      if (selected) { earSelected = true; counts[side]++; }
    }
    if (images.retention.data.subarray(i, i + 4).some((v) => v !== (earSelected ? 0 : 255))) throw new Error('Slim-face retention must clear only active ear pixels.');
  }
  return counts;
}
