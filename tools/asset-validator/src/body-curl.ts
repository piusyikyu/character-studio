import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { bodyJointGeometry } from './body-joint-geometry';

type Point = readonly [number, number];
type Polygon = readonly Point[];
const geometry = { rearWindow: bodyJointGeometry.rearWindow, frontCurls: bodyJointGeometry.frontCurls, curlVoids: bodyJointGeometry.curlVoids, curlTips: bodyJointGeometry.curlTips };
const contains = (x: number, y: number, p: Polygon) => { let yes = false; for (let a = 0, b = p.length - 1; a < p.length; b = a++) { const [ax, ay] = p[a]!, [bx, by] = p[b]!; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) yes = !yes; } return yes; };
const rounded = (p: Polygon): Polygon => p.flatMap((b, i) => { const a = p[(i + p.length - 1) % p.length]!, c = p[(i + 1) % p.length]!, la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]), d = Math.min(.75, la / 2, lc / 2), entry: Point = [b[0] + (a[0] - b[0]) * d / la, b[1] + (a[1] - b[1]) * d / la], exit: Point = [b[0] + (c[0] - b[0]) * d / lc, b[1] + (c[1] - b[1]) * d / lc]; return Array.from({ length: 9 }, (_, j): Point => { const t = j / 8; return [(1 - t) ** 2 * entry[0] + 2 * t * (1 - t) * b[0] + t * t * exit[0], (1 - t) ** 2 * entry[1] + 2 * t * (1 - t) * b[1] + t * t * exit[1]]; }); });
const borderNear = (x: number, y: number, polygons: readonly Polygon[]) => polygons.some(p => p.some((a, j) => { const b = p[(j + 1) % p.length]!, dx = b[0] - a[0], dy = b[1] - a[1], n = dx * dx + dy * dy, t = n ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / n)) : 0; return (x - a[0] - t * dx) ** 2 + (y - a[1] - t * dy) ** 2 <= .71 ** 2; }));
const drawPixel = (dst: Uint8Array, src: Uint8Array, i: number) => { const sa = src[i + 3]!, da = dst[i + 3]!; if (!sa) return; if (sa === 255 || !da) { dst.set(src.subarray(i, i + 4), i); return; } const n = sa * 255 + da * (255 - sa); for (let c = 0; c < 3; c++) dst[i + c] = Math.round((src[i + c]! * sa * 255 + dst[i + c]! * da * (255 - sa)) / n); dst[i + 3] = Math.round(n / 255); };
const clean = (im: RgbaImage) => { for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3]! < 8) im.data.fill(0, i, i + 4); };

/** Antialias native ownership masks only; retain original same-facing colour and canvas. */
export function validateCurlEdges(inputs: { oldFront: RgbaImage; oldRear: RgbaImage; front: RgbaImage; rear: RgbaImage; toRear: RgbaImage; toFront: RgbaImage; settings: unknown }) {
  const s = inputs.settings as { method?: string; coverageSamples?: number; cornerRadius?: number; curveSteps?: number; minimumAlpha?: number; geometry?: unknown };
  if (s.method !== 'native-rounded-curl-ownership' || s.coverageSamples !== 8 || s.cornerRadius !== .75 || s.curveSteps !== 8 || s.minimumAlpha !== 8 || JSON.stringify(s.geometry) !== JSON.stringify(geometry)) throw new Error('Native rounded curl contours changed.');
  const front = { ...inputs.oldFront, data: inputs.oldFront.data.slice() }, rear = { ...inputs.oldRear, data: inputs.oldRear.data.slice() }, toRear = blankImage(1024, 1536), toFront = blankImage(1024, 1536), moved = blankImage(1024, 1536), curls = geometry.frontCurls.map(rounded), voids = geometry.curlVoids.map(rounded), tips = geometry.curlTips.map(rounded);
  const coverage = (n: number) => { const a = Math.round(n * 255 / 64); return a < 8 ? 0 : a > 247 ? 255 : a; };
  const keep = (x: number, y: number) => curls.some(p => contains(x, y, p)) && !voids.some(p => contains(x, y, p));
  let fractionalRearPixels = 0, fractionalFrontPixels = 0;
  for (let y = 302; y < 355; y++) for (let x = 325; x < 765; x++) {
    const i = (y * 1024 + x) * 4; let nr = 0, nf = 0;
    if (inputs.oldFront.data[i + 3] && y < 350) {
      if (x < 436 || x > 598 || !borderNear(x + .5, y + .5, [...curls, ...voids])) nr = keep(x + .5, y + .5) ? 0 : 64;
      else for (let sy = 0; sy < 8; sy++) for (let sx = 0; sx < 8; sx++) if (!keep(x + (sx + .5) / 8, y + (sy + .5) / 8)) nr++;
    }
    if (inputs.oldRear.data[i + 3] && y >= 350 && ((x >= 442 && x <= 467) || (x >= 569 && x <= 591))) {
      if (!borderNear(x + .5, y + .5, tips)) nf = tips.some(p => contains(x + .5, y + .5, p)) ? 64 : 0;
      else for (let sy = 0; sy < 8; sy++) for (let sx = 0; sx < 8; sx++) if (tips.some(p => contains(x + (sx + .5) / 8, y + (sy + .5) / 8, p))) nf++;
    }
    const ar = coverage(nr), af = coverage(nf);
    if (ar) { toRear.data.fill(255, i, i + 3); toRear.data[i + 3] = ar; moved.data.set(inputs.oldFront.data.subarray(i, i + 4), i); moved.data[i + 3] = Math.round(inputs.oldFront.data[i + 3]! * ar / 255); front.data[i + 3] = Math.round(inputs.oldFront.data[i + 3]! * (255 - ar) / 255); drawPixel(rear.data, moved.data, i); if (ar < 255) fractionalRearPixels++; }
    if (af) { toFront.data.fill(255, i, i + 3); toFront.data[i + 3] = af; moved.data.set(inputs.oldRear.data.subarray(i, i + 4), i); moved.data[i + 3] = Math.round(inputs.oldRear.data[i + 3]! * af / 255); rear.data[i + 3] = Math.round(inputs.oldRear.data[i + 3]! * (255 - af) / 255); drawPixel(front.data, moved.data, i); if (af < 255) fractionalFrontPixels++; }
  }
  clean(front); clean(rear);
  for (const [actual, expected, message] of [[inputs.toRear, toRear, 'Rear curl ownership mask changed.'], [inputs.toFront, toFront, 'Front curl ownership mask changed.'], [inputs.front, front, 'Front hair must retain native rounded curl ownership.'], [inputs.rear, rear, 'Rear hair must retain native rounded curl ownership.']] as const) if (actual.data.some((v, i) => v !== expected.data[i])) throw new Error(message);
  return { fractionalRearPixels, fractionalFrontPixels, coverageSamples: 8, cornerRadius: .75, generatedHair: false, shiftedScaledOrMirrored: false };
}

/** Three hand-traced spill regions outside the native strand outlines. */
export const curlSpillRegions = [
  [[437,319],[446,319],[448,321],[449,322],[452,323],[452,324],[449,325],[447,326],[444,327],[442,328],[437,330]],
  [[548,315],[553,315],[554,317],[555,318],[556,320],[558,322],[560,324],[562,325],[564,326],[566,327],[568,328],[571,329],[574,330],[576,331],[577,332],[548,332]],
  [[591,312],[588,313],[585,314],[580,315],[578,316],[578,317],[579,318],[580,319],[581,320],[582,321],[583,322],[584,324],[594,324],[594,312]],
] as const;

/** Move marked native patches behind the body; never recolour or shift a strand. */
export function validateCurlSpill(inputs: { oldFront: RgbaImage; oldRear: RgbaImage; front: RgbaImage; rear: RgbaImage; mask: RgbaImage; settings: unknown }) {
  const settings = inputs.settings as { method?: string; coverageSamples?: number; minimumAlpha?: number; regions?: unknown };
  if (settings.method !== 'native-local-curl-spill-to-rear' || settings.coverageSamples !== 8 || settings.minimumAlpha !== 8 || JSON.stringify(settings.regions) !== JSON.stringify(curlSpillRegions)) throw new Error('Native curl spill contours changed.');
  const front = { ...inputs.oldFront, data: inputs.oldFront.data.slice() }, rear = { ...inputs.oldRear, data: inputs.oldRear.data.slice() }, mask = blankImage(1024, 1536), moved = blankImage(1024, 1536);
  let selectedSpillPixels = 0;
  for (const p of curlSpillRegions) {
    const x0 = Math.floor(Math.min(...p.map(v => v[0]))), x1 = Math.ceil(Math.max(...p.map(v => v[0]))), y0 = Math.floor(Math.min(...p.map(v => v[1]))), y1 = Math.ceil(Math.max(...p.map(v => v[1])));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y * 1024 + x) * 4; if (!front.data[i + 3]) continue;
      let n = 0; for (let sy = 0; sy < 8; sy++) for (let sx = 0; sx < 8; sx++) if (contains(x + (sx + .5) / 8, y + (sy + .5) / 8, p)) n++;
      let a = Math.round(n * 255 / 64); if (a < 8) continue; if (a > 247) a = 255;
      mask.data.fill(255, i, i + 3); mask.data[i + 3] = a; moved.data.set(front.data.subarray(i, i + 4), i); moved.data[i + 3] = Math.round(front.data[i + 3]! * a / 255); front.data[i + 3] = Math.round(front.data[i + 3]! * (255 - a) / 255); drawPixel(rear.data, moved.data, i); selectedSpillPixels++;
    }
  }
  clean(front); clean(rear);
  for (const [actual, expected, message] of [[inputs.mask, mask, 'Native curl spill ownership mask changed.'], [inputs.front, front, 'Front hair must retain native local spill ownership.'], [inputs.rear, rear, 'Rear hair must retain native local spill ownership.']] as const) if (actual.data.some((v, i) => v !== expected.data[i])) throw new Error(message);
  return { selectedSpillPixels, selectedRegions: 3, generatedHair: false, shiftedScaledOrMirrored: false };
}
