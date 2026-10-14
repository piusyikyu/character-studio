import { z } from 'zod';
import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

// Manually traced native SW contours; these are local ownership masks, not colour keys.
const polygon = z.array(z.tuple([z.number().int(), z.number().int()])).min(3);
const window = z.strictObject({ x: z.number().int(), y: z.number().int(), width: z.number().int().positive(), height: z.number().int().positive() });
export const southwestFitRepairSchema = z.strictObject({
  schemaVersion: z.literal(1), method: z.literal('native-sw-eye-and-curl-ownership'), direction: z.literal('SW'), coverageSamples: z.literal(4),
  eyeWindow: window, hairWindows: z.array(window).length(2), rearWindow: window,
  geometry: z.strictObject({ eye: polygon, rightCurl: polygon, rightWisp: polygon, leftCurl: polygon, rearDiscard: polygon }),
});
const insidePolygon = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let inside = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
};
const coverage = (x: number, y: number, polygons: readonly (readonly (readonly [number, number])[])[]) => {
  let count = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (polygons.some(p => insidePolygon(x + (sx + .5) / 4, y + (sy + .5) / 4, p))) count++;
  return Math.round(count * 255 / 16);
};

/** Study supplies a complete SW eye; SW reference supplies only selected native curl pixels. */
export function repairSouthwestEyeAndHair(oldFront: RgbaImage, oldRear: RgbaImage, reference: RgbaImage, eyeStudy: RgbaImage, input: unknown) {
  const settings = southwestFitRepairSchema.parse(input);
  if (JSON.stringify(settings.eyeWindow) !== JSON.stringify({ x: 396, y: 184, width: 36, height: 38 }) || JSON.stringify(settings.hairWindows) !== JSON.stringify([{ x: 448, y: 286, width: 80, height: 88 }, { x: 340, y: 314, width: 104, height: 70 }]) || JSON.stringify(settings.rearWindow) !== JSON.stringify({ x: 518, y: 282, width: 30, height: 20 })) throw new Error('SW repair must retain the bounded native eye/curl windows.');
  for (const [name, points] of Object.entries(settings.geometry)) for (const [x, y] of points) {
    const windows = name === 'eye' ? [settings.eyeWindow] : name === 'rearDiscard' ? [settings.rearWindow] : settings.hairWindows;
    if (!windows.some(w => x >= w.x && x <= w.x + w.width && y >= w.y && y <= w.y + w.height)) throw new Error('SW repair contours must remain inside their native windows.');
  }
  if ([oldFront, oldRear, reference, eyeStudy].some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native SW repair inputs required.');
  const front = { ...oldFront, data: oldFront.data.slice() }, rear = { ...oldRear, data: oldRear.data.slice() }, rearEraseMask = blankImage(1024, 1536), eye = blankImage(1024, 1536), eyeMask = blankImage(1024, 1536), hairMask = blankImage(1024, 1536), eraseMask = blankImage(1024, 1536);
  let eyePixels = 0, hairPixels = 0, removedFrontPixels = 0, removedRearPixels = 0;
  const select = (output: RgbaImage, mask: RgbaImage, source: RgbaImage, i: number, retained: number) => {
    if (retained) { mask.data.fill(255, i, i + 3); mask.data[i + 3] = retained; }
    const alpha = Math.round(source.data[i + 3]! * retained / 255);
    if (alpha >= 8) { output.data.set(source.data.subarray(i, i + 3), i); output.data[i + 3] = alpha; }
    return alpha >= 8;
  };
  const e = settings.eyeWindow;
  for (let y = e.y; y < e.y + e.height; y++) for (let x = e.x; x < e.x + e.width; x++) {
    const i = (y * 1024 + x) * 4;
    if (select(eye, eyeMask, eyeStudy, i, coverage(x, y, [settings.geometry.eye]))) eyePixels++;
  }
  for (const w of settings.hairWindows) for (let y = w.y; y < w.y + w.height; y++) for (let x = w.x; x < w.x + w.width; x++) {
    const i = (y * 1024 + x) * 4;
    if (oldFront.data[i + 3]) removedFrontPixels++;
    front.data.fill(0, i, i + 4); eraseMask.data.fill(255, i, i + 4);
    if (select(front, hairMask, reference, i, coverage(x, y, [settings.geometry.rightCurl, settings.geometry.rightWisp, settings.geometry.leftCurl]))) hairPixels++;
  }
  const d = settings.rearWindow;
  for (let y = d.y; y < d.y + d.height; y++) for (let x = d.x; x < d.x + d.width; x++) {
    const i = (y * 1024 + x) * 4;
    const retained = coverage(x, y, [settings.geometry.rearDiscard]);
    if (!retained) continue;
    rearEraseMask.data.fill(255, i, i + 3); rearEraseMask.data[i + 3] = retained;
    const alpha = Math.round(oldRear.data[i + 3]! * (255 - retained) / 255);
    rear.data[i + 3] = alpha;
    if (alpha < 8) rear.data.fill(0, i, i + 4);
    if (oldRear.data[i + 3] !== rear.data[i + 3]) removedRearPixels++;
  }
  return { front, rear, rearEraseMask, eye, eyeMask, hairMask, eraseMask, measurements: { eyePixels, hairPixels, removedFrontPixels, removedRearPixels, bodyChanged: false, shiftedScaledOrMirrored: false, globalColorKey: false } };
}
