import { z } from 'zod';
import { blankImage, drawRgba } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

// Native W contours traced from the marked shoulder/hand and clothing fragment.
export const westHairRepairGeometry = {
  toRear: [[478, 286], [680, 286], [680, 351], [478, 351]],
  discard: [[536, 603], [542, 603], [545, 608], [548, 616], [550, 625], [553, 634], [557, 641], [559, 647], [558, 653], [554, 653], [538, 620]],
} as const;
const polygon = z.array(z.tuple([z.number().int(), z.number().int()])).min(3);
const settingsSchema = z.strictObject({ schemaVersion: z.literal(1), method: z.literal('native-w-hair-depth-and-clothing-fragment'), direction: z.literal('W'), geometry: z.strictObject({ toRear: polygon, discard: polygon }) });
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let inside = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
};

/** Change local depth/ownership only, retaining native same-facing RGB and highlights. */
export function repairWestProfileHair(oldFront: RgbaImage, oldRear: RgbaImage, input: unknown) {
  const settings = settingsSchema.parse(input);
  if (JSON.stringify(settings.geometry) !== JSON.stringify(westHairRepairGeometry)) throw new Error('W hair repair must retain the bounded native contours.');
  if ([oldFront, oldRear].some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native W hair layers required.');
  const front = { ...oldFront, data: oldFront.data.slice() }, rear = { ...oldRear, data: oldRear.data.slice() }, moved = blankImage(1024, 1536), toRear = blankImage(1024, 1536), discard = blankImage(1024, 1536);
  let transferredPixels = 0, discardedPixels = 0;
  for (let y = 286; y < 351; y++) for (let x = 478; x < 680; x++) {
    const i = (y * 1024 + x) * 4;
    if (oldFront.data[i + 3] && contains(x + .5, y + .5, settings.geometry.toRear)) {
      moved.data.set(oldFront.data.subarray(i, i + 4), i); front.data.fill(0, i, i + 4); toRear.data.fill(255, i, i + 4); transferredPixels++;
    }
  }
  drawRgba(rear, moved, 0, 0);
  for (let y = 603; y < 653; y++) for (let x = 536; x < 559; x++) {
    const i = (y * 1024 + x) * 4;
    if (oldRear.data[i + 3] && contains(x + .5, y + .5, settings.geometry.discard)) { rear.data.fill(0, i, i + 4); discard.data.fill(255, i, i + 4); discardedPixels++; }
  }
  return { front, rear, toRear, discard, measurements: { transferredPixels, discardedPixels, generatedHair: false, shiftedScaledOrMirrored: false } };
}
