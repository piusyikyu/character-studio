import { z } from 'zod';
import { blankImage, drawRgba } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

const polygon = z.array(z.tuple([z.number().int(), z.number().int()])).min(3);
const schema = z.strictObject({ schemaVersion: z.literal(1), method: z.literal('native-sw-local-hair-fit'), direction: z.literal('SW'), coverageSamples: z.literal(4), joinRows: z.literal(6), regions: z.array(z.strictObject({ name: z.string(), plane: z.enum(['front', 'rear']), window: z.strictObject({ x: z.number().int(), y: z.number().int(), width: z.number().int().positive(), height: z.number().int().positive() }), erase: z.array(polygon), retain: z.array(polygon) })).length(4) });
const windows = [
  { name: 'far-eye-fringe', plane: 'front', window: { x: 382, y: 178, width: 48, height: 64 } },
  { name: 'chest-lock', plane: 'front', window: { x: 340, y: 278, width: 110, height: 100 } },
  { name: 'detached-shoulder-wisp', plane: 'front', window: { x: 498, y: 270, width: 52, height: 54 } },
  { name: 'rear-neck-boundary', plane: 'rear', window: { x: 515, y: 270, width: 50, height: 44 } },
] as const;
const contains = (x: number, y: number, p: readonly (readonly [number, number])[]) => {
  let inside = false;
  for (let a = 0, b = p.length - 1; a < p.length; b = a++) {
    const [ax, ay] = p[a]!, [bx, by] = p[b]!;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
};
const coverage = (x: number, y: number, polygons: readonly (readonly (readonly [number, number])[])[]) => {
  let samples = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (polygons.some(p => contains(x + (sx + .5) / 4, y + (sy + .5) / 4, p))) samples++;
  return Math.round(samples * 255 / 16);
};

/** Only local SW hair pixels change; anatomy is never an input to the repair. */
export function repairSouthwestHairFit(oldFront: RgbaImage, oldRear: RgbaImage, study: RgbaImage, input: unknown) {
  const settings = schema.parse(input);
  if (JSON.stringify(settings.regions.map(({ name, plane, window }) => ({ name, plane, window }))) !== JSON.stringify(windows)) throw new Error('SW hair fit must retain its bounded native regions.');
  if ([oldFront, oldRear, study].some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native SW hair-fit inputs required.');
  const front = { ...oldFront, data: oldFront.data.slice() }, rear = { ...oldRear, data: oldRear.data.slice() }, frontErase = blankImage(1024, 1536), frontSelection = blankImage(1024, 1536), rearErase = blankImage(1024, 1536), rearSelection = blankImage(1024, 1536);
  let selectedHairPixels = 0;
  for (const region of settings.regions) {
    const w = region.window;
    for (const p of [...region.erase, ...region.retain]) for (const [x, y] of p) if (x < w.x || x > w.x + w.width || y < w.y || y > w.y + w.height) throw new Error('SW hair contours must remain inside their native regions.');
    const output = region.plane === 'front' ? front : rear, eraseMask = region.plane === 'front' ? frontErase : rearErase, retainMask = region.plane === 'front' ? frontSelection : rearSelection, insert = blankImage(1024, 1536);
    for (let y = w.y; y < w.y + w.height; y++) for (let x = w.x; x < w.x + w.width; x++) {
      const i = (y * 1024 + x) * 4, rootJoin = region.retain.length > 0 && y < w.y + settings.joinRows;
      const erased = rootJoin ? 0 : coverage(x, y, region.erase), retained = Math.round(coverage(x, y, region.retain) * (rootJoin ? (y - w.y + .5) / settings.joinRows : 1));
      if (erased) { eraseMask.data.fill(255, i, i + 3); eraseMask.data[i + 3] = Math.max(eraseMask.data[i + 3]!, erased); output.data[i + 3] = Math.round(output.data[i + 3]! * (255 - erased) / 255); if (output.data[i + 3]! < 8) output.data.fill(0, i, i + 4); }
      if (retained) { retainMask.data.fill(255, i, i + 3); retainMask.data[i + 3] = Math.max(retainMask.data[i + 3]!, retained); const alpha = Math.round(study.data[i + 3]! * retained / 255); if (alpha >= 8) { insert.data.set(study.data.subarray(i, i + 3), i); insert.data[i + 3] = alpha; selectedHairPixels++; } }
    }
    drawRgba(output, insert, 0, 0);
  }
  let changedFrontPixels = 0, changedRearPixels = 0;
  for (let i = 0; i < front.data.length; i += 4) {
    if (front.data.subarray(i, i + 4).some((v, c) => v !== oldFront.data[i + c])) changedFrontPixels++;
    if (rear.data.subarray(i, i + 4).some((v, c) => v !== oldRear.data[i + c])) changedRearPixels++;
  }
  return { front, rear, frontErase, frontSelection, rearErase, rearSelection, measurements: { selectedHairPixels, changedFrontPixels, changedRearPixels, anatomyChanged: false, shiftedScaledOrMirrored: false, globalColorKey: false } };
}
