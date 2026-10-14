import { z } from 'zod';
import type { RgbaImage } from '@character-studio/render-utils';

export const seHandRepairWindows = { physicalRight: { x: 35, y: 315, width: 160, height: 90 }, physicalLeft: { x: 875, y: 330, width: 130, height: 85 } } as const;
const polygon = z.array(z.tuple([z.number().int(), z.number().int()])).min(3);
const window = z.strictObject({ x: z.number().int(), y: z.number().int(), width: z.number().int().positive(), height: z.number().int().positive() });
const hand = z.strictObject({ window, polygons: z.array(polygon).min(1) });
const settingsSchema = z.strictObject({ schemaVersion: z.literal(1), method: z.literal('native-local-se-hand-silhouettes'), direction: z.literal('SE'), coverageSamples: z.literal(4), hands: z.strictObject({ physicalRight: hand, physicalLeft: hand }) });
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let inside = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
};

/** Replace only the two local ownership masks, keeping study colour and interior alpha. */
export function repairSeHandSilhouettes(study: RgbaImage, originalBody: RgbaImage, originalMask: RgbaImage, input: unknown) {
  const settings = settingsSchema.parse(input);
  if ([study, originalBody, originalMask].some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native SE hand repair inputs required.');
  const body = { ...originalBody, data: originalBody.data.slice() }, mask = { ...originalMask, data: originalMask.data.slice() };
  let restoredPixels = 0, strengthenedPixels = 0, removedPixels = 0;
  for (const side of ['physicalRight', 'physicalLeft'] as const) {
    const { window, polygons } = settings.hands[side];
    if (JSON.stringify(window) !== JSON.stringify(seHandRepairWindows[side]) || polygons.some(polygon => polygon.some(([x, y]) => x < window.x || x > window.x + window.width || y < window.y || y > window.y + window.height))) throw new Error('SE hand repair must stay inside its two native windows.');
    for (let y = window.y; y < window.y + window.height; y++) for (let x = window.x; x < window.x + window.width; x++) {
      const i = (y * 1024 + x) * 4; let samples = 0;
      for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (polygons.some(polygon => contains(x + (sx + .5) / 4, y + (sy + .5) / 4, polygon))) samples++;
      const coverage = Math.round(samples * 255 / 16), alpha = Math.round(study.data[i + 3]! * coverage / 255);
      mask.data.fill(0, i, i + 4); body.data.fill(0, i, i + 4);
      if (coverage) { mask.data.fill(255, i, i + 3); mask.data[i + 3] = coverage; }
      if (alpha >= 8) { body.data.set(study.data.subarray(i, i + 3), i); body.data[i + 3] = alpha; }
      if (!originalBody.data[i + 3] && body.data[i + 3]) restoredPixels++;
      else if (body.data[i + 3]! > originalBody.data[i + 3]!) strengthenedPixels++;
      else if (originalBody.data[i + 3] && !body.data[i + 3]) removedPixels++;
    }
  }
  return { body, mask, measurements: { restoredPixels, strengthenedPixels, removedPixels, changedOutsideHandWindows: 0, generatedAnatomy: false, shiftedScaledOrMirrored: false } };
}
