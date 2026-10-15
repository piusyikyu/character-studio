import { z } from 'zod';
import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

const polygon = z.array(z.tuple([z.number().int().min(0).max(1024), z.number().int().min(312).max(1536)])).min(3);
export const northBodySelectionSchema = z.strictObject({
  schemaVersion: z.literal(1), method: z.literal('native-body-study-silhouette'), direction: z.literal('N'),
  cutY: z.literal(312), coverageSamples: z.literal(4), contourTolerancePixels: z.literal(8), minimumStudyAlpha: z.literal(8),
  bodyPolygon: polygon, handPolygons: z.strictObject({ physicalLeft: polygon, physicalRight: polygon }),
  neckOwnership: z.strictObject({ source: z.literal('head/soft-oval-v1/N-neck-v1.png'), startY: z.literal(312), endY: z.literal(314), method: z.literal('remove-native-neck-coverage-only-where-selected-body-supplies-skin') }),
});

/** Native manual selection only; preserve study RGB and alpha without transforming art. */
export function selectNorthBody(study: RgbaImage, input: unknown) {
  const settings = northBodySelectionSchema.parse(input);
  return selectNativeBodySilhouette(study, settings);
}
const profilePolygon = z.array(z.tuple([z.number().int().min(0).max(1024), z.number().int().min(299).max(1536)])).min(3);
export const profileBodySelectionSchema = northBodySelectionSchema.extend({
  direction: z.literal('E'), cutY: z.literal(300), bodyPolygon: profilePolygon,
  handPolygons: z.strictObject({ physicalLeft: profilePolygon, physicalRight: profilePolygon }),
  neckOwnership: z.strictObject({ source: z.literal('head/soft-oval-v1/E-neck-v1.png'), startY: z.literal(300), endY: z.literal(311), method: z.literal('remove-native-neck-coverage-only-where-selected-body-supplies-skin') }),
});
export const westBodySelectionSchema = profileBodySelectionSchema.extend({
  direction: z.literal('W'), cutY: z.literal(306),
  neckOwnership: z.strictObject({ source: z.literal('head/soft-oval-v1/W-neck-v1.png'), startY: z.literal(306), endY: z.literal(317), method: z.literal('remove-native-neck-coverage-only-where-selected-body-supplies-skin') }),
});
export function selectProfileBody(study: RgbaImage, input: unknown, direction: 'E' | 'W' = 'E') {
  if (direction !== 'E' && direction !== 'W') throw new Error('Independent profile body selections support E and W only.');
  return selectNativeBodySilhouette(study, direction === 'E' ? profileBodySelectionSchema.parse(input) : westBodySelectionSchema.parse(input));
}
const diagonalPolygon = z.array(z.tuple([z.number().int().min(0).max(1024), z.number().int().min(274).max(1536)])).min(3);
export const frontDiagonalBodySelectionSchema = profileBodySelectionSchema.extend({
  direction: z.literal('SE'), cutY: z.literal(274), contourTolerancePixels: z.literal(0), bodyPolygon: diagonalPolygon,
  handPolygons: z.strictObject({ physicalLeft: diagonalPolygon, physicalRight: diagonalPolygon }),
  neckOwnership: z.strictObject({ source: z.literal('head/soft-oval-v1/SE-neck-v1.png'), startY: z.literal(274), endY: z.literal(298), method: z.literal('remove-native-neck-coverage-only-where-selected-body-supplies-skin') }),
});
const southwestPolygon = z.array(z.tuple([z.number().int().min(0).max(1024), z.number().int().min(294).max(1536)])).min(3);
export const southwestBodySelectionSchema = frontDiagonalBodySelectionSchema.extend({
  direction: z.literal('SW'), cutY: z.literal(294), bodyPolygon: southwestPolygon,
  handPolygons: z.strictObject({ physicalLeft: southwestPolygon, physicalRight: southwestPolygon }),
  neckOwnership: z.strictObject({ source: z.literal('head/soft-oval-v1/SW-neck-v3.png'), startY: z.literal(294), endY: z.literal(317), method: z.literal('remove-native-neck-coverage-only-where-selected-body-supplies-skin') }),
});
export function selectFrontDiagonalBody(study: RgbaImage, input: unknown, direction: 'SE' | 'SW' = 'SE') {
  if (direction !== 'SE' && direction !== 'SW') throw new Error('Independent front-diagonal body selections support SE and SW only.');
  return selectNativeBodySilhouette(study, direction === 'SW' ? southwestBodySelectionSchema.parse(input) : frontDiagonalBodySelectionSchema.parse(input));
}
const backDiagonalPolygon = z.array(z.tuple([z.number().int().min(0).max(1024), z.number().int().min(294).max(1536)])).min(3);
export const northeastBodySelectionSchema = northBodySelectionSchema.extend({
  direction: z.literal('NE'), cutY: z.literal(294), contourTolerancePixels: z.literal(0), bodyPolygon: backDiagonalPolygon,
  handPolygons: z.strictObject({ physicalLeft: backDiagonalPolygon, physicalRight: backDiagonalPolygon }),
  neckOwnership: z.strictObject({ source: z.literal('head/soft-oval-v1/NE-neck-v1.png'), startY: z.literal(294), endY: z.literal(308), method: z.literal('remove-native-neck-coverage-only-where-selected-body-supplies-skin') }),
});
export function selectBackDiagonalBody(study: RgbaImage, input: unknown) {
  return selectNativeBodySilhouette(study, northeastBodySelectionSchema.parse(input));
}
function selectNativeBodySilhouette(study: RgbaImage, settings: z.infer<typeof northBodySelectionSchema> | z.infer<typeof profileBodySelectionSchema> | z.infer<typeof westBodySelectionSchema> | z.infer<typeof frontDiagonalBodySelectionSchema> | z.infer<typeof southwestBodySelectionSchema> | z.infer<typeof northeastBodySelectionSchema>) {
  if (study.width !== 1024 || study.height !== 1536) throw new Error('Native body study required.');
  const polygons = [settings.bodyPolygon, settings.handPolygons.physicalLeft, settings.handPolygons.physicalRight];
  const samples = new Uint8Array(1024 * 1536);
  for (let row = settings.cutY * 4; row < 1536 * 4; row++) {
    const y = (row + .5) / 4, intervals: number[][] = [];
    for (const points of polygons) {
      const crossings: number[] = [];
      for (let a = 0, b = points.length - 1; a < points.length; b = a++) {
        const [ax, ay] = points[a]!, [bx, by] = points[b]!;
        if ((ay > y) !== (by > y)) crossings.push(ax + (y - ay) * (bx - ax) / (by - ay));
      }
      crossings.sort((a, b) => a - b);
      for (let j = 0; j < crossings.length; j += 2) intervals.push([crossings[j]!, crossings[j + 1]!]);
    }
    intervals.sort((a, b) => a[0]! - b[0]!);
    const union: number[][] = [];
    for (const span of intervals) {
      const last = union.at(-1);
      if (last && span[0]! <= last[1]!) last[1] = Math.max(last[1]!, span[1]!); else union.push([...span]);
    }
    for (const [left, right] of union) {
      const end = Math.min(4096, Math.ceil(right! * 4 - .5));
      for (let column = Math.max(0, Math.ceil(left! * 4 - .5)); column < end; column++) {
        const p = Math.floor(row / 4) * 1024 + Math.floor(column / 4); samples[p] = samples[p]! + 1;
      }
    }
  }
  const tolerance = settings.contourTolerancePixels, horizontal = new Uint8Array(samples.length), envelope = new Uint8Array(samples.length);
  for (let y = settings.cutY; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    let largest = 0;
    for (let k = Math.max(0, x - tolerance); k <= Math.min(1023, x + tolerance); k++) largest = Math.max(largest, samples[y * 1024 + k]!);
    horizontal[y * 1024 + x] = largest;
  }
  for (let y = settings.cutY; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    let largest = 0;
    for (let k = Math.max(settings.cutY, y - tolerance); k <= Math.min(1535, y + tolerance); k++) largest = Math.max(largest, horizontal[k * 1024 + x]!);
    envelope[y * 1024 + x] = largest;
  }
  const mask = blankImage(1024, 1536), body = blankImage(1024, 1536);
  for (let p = 0; p < samples.length; p++) {
    const i = p * 4, coverage = Math.round(envelope[p]! * 255 / 16), alpha = Math.round(study.data[i + 3]! * coverage / 255);
    if (coverage) { mask.data.fill(255, i, i + 3); mask.data[i + 3] = coverage; }
    if (alpha >= 8) { body.data.set(study.data.subarray(i, i + 3), i); body.data[i + 3] = alpha; }
  }
  return { body, mask };
}
