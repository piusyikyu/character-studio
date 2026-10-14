import { z } from 'zod';
import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

const polygon = z.array(z.tuple([z.number().int(), z.number().int()])).min(3);
const schema = z.strictObject({ schemaVersion: z.literal(1), method: z.literal('native-sw-head-hair-quality'), direction: z.literal('SW'), coverageSamples: z.literal(4), regions: z.array(z.strictObject({ name: z.string(), layer: z.enum(['head', 'front', 'rear']), window: z.strictObject({ x: z.number().int(), y: z.number().int(), width: z.number().int().positive(), height: z.number().int().positive() }), erase: z.array(polygon), retain: z.array(polygon), joins: z.array(z.strictObject({ side: z.enum(['top', 'bottom', 'left', 'right']), pixels: z.number().int().min(1).max(12) })) })).length(5) });
const windows = [
  { name: 'jaw', layer: 'head', window: { x: 406, y: 222, width: 98, height: 54 } },
  { name: 'jaw-outline', layer: 'head', window: { x: 416, y: 230, width: 68, height: 35 } },
  { name: 'fringe', layer: 'front', window: { x: 395, y: 135, width: 60, height: 74 } },
  { name: 'neck-lock', layer: 'front', window: { x: 475, y: 217, width: 53, height: 78 } },
  { name: 'jaw-underlap', layer: 'rear', window: { x: 438, y: 246, width: 42, height: 29 } },
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
const interiorJoin = (x: number, y: number, polygons: readonly (readonly (readonly [number, number])[])[]) => {
  let distance = 0;
  for (const p of polygons) if (contains(x, y, p)) {
    let edge = Infinity;
    for (let a = 0, b = p.length - 1; a < p.length; b = a++) {
      const [ax, ay] = p[a]!, [bx, by] = p[b]!, dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
      edge = Math.min(edge, Math.hypot(x - ax - t * dx, y - ay - t * dy));
    }
    distance = Math.max(distance, edge);
  }
  return Math.min(1, distance / 4);
};

/** An enlarged authoring guide makes this tiny detailed-art repair visible to the artist. */
export function southwestRearDetailGuide(rear: RgbaImage) {
  const guide = blankImage(1024, 1536);
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    const i = ((220 + Math.floor(y / 16)) * 1024 + 424 + Math.floor(x / 16)) * 4;
    guide.data.set(rear.data.subarray(i, i + 4), (y * 1024 + x) * 4);
  }
  return guide;
}

/** Area-sample a detailed painting into its explicit 64x96 native authoring window. Never a pixel asset. */
function placeRearDetail(study: RgbaImage) {
  const native = blankImage(1024, 1536);
  for (let y = 0; y < 96; y++) for (let x = 0; x < 64; x++) {
    let alpha = 0; const rgb = [0, 0, 0];
    for (let sy = 0; sy < 16; sy++) for (let sx = 0; sx < 16; sx++) {
      const i = ((y * 16 + sy) * 1024 + x * 16 + sx) * 4, a = study.data[i + 3]!;
      alpha += a; for (let c = 0; c < 3; c++) rgb[c]! += study.data[i + c]! * a;
    }
    const i = ((220 + y) * 1024 + 424 + x) * 4;
    if (Math.round(alpha / 256) >= 8) { for (let c = 0; c < 3; c++) native.data[i + c] = Math.round(rgb[c]! / alpha); native.data[i + 3] = Math.round(alpha / 256); }
  }
  return native;
}

/** Selected native study pixels repair separate layers; body and facial features are not inputs. */
export function repairSouthwestQuality(oldHead: RgbaImage, oldFront: RgbaImage, oldRear: RgbaImage, headStudy: RgbaImage, reference: RgbaImage, rearStudy: RgbaImage, input: unknown) {
  const settings = schema.parse(input);
  if (JSON.stringify(settings.regions.map(({ name, layer, window }) => ({ name, layer, window }))) !== JSON.stringify(windows)) throw new Error('SW quality repair must retain its bounded native regions.');
  if ([oldHead, oldFront, oldRear, headStudy, reference, rearStudy].some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native SW quality inputs required.');
  const rearPatch = placeRearDetail(rearStudy);
  const head = { ...oldHead, data: oldHead.data.slice() }, front = { ...oldFront, data: oldFront.data.slice() }, rear = { ...oldRear, data: oldRear.data.slice() }, rearErase = blankImage(1024, 1536), rearSelection = blankImage(1024, 1536), headErase = blankImage(1024, 1536), headSelection = blankImage(1024, 1536), frontErase = blankImage(1024, 1536), frontSelection = blankImage(1024, 1536);
  let selectedHeadPixels = 0, selectedHairPixels = 0;
  for (const region of settings.regions) {
    const w = region.window;
    for (const p of [...region.erase, ...region.retain]) for (const [x, y] of p) if (x < w.x || x > w.x + w.width || y < w.y || y > w.y + w.height) throw new Error('SW quality contours must remain inside their native regions.');
    const output = region.layer === 'head' ? head : region.layer === 'front' ? front : rear, study = region.layer === 'rear' ? rearPatch : region.layer === 'head' && region.name !== 'jaw-outline' ? headStudy : reference, eraseMask = region.layer === 'head' ? headErase : region.layer === 'front' ? frontErase : rearErase, retainMask = region.layer === 'head' ? headSelection : region.layer === 'front' ? frontSelection : rearSelection;
    for (let y = w.y; y < w.y + w.height; y++) for (let x = w.x; x < w.x + w.width; x++) {
      const i = (y * 1024 + x) * 4;
      let join = 1;
      for (const j of region.joins) {
        const distance = j.side === 'top' ? y - w.y + .5 : j.side === 'bottom' ? w.y + w.height - y - .5 : j.side === 'left' ? x - w.x + .5 : w.x + w.width - x - .5;
        join = Math.min(join, distance / j.pixels);
      }
      if (output.data[i + 3]! >= 245 && study.data[i + 3]! >= 245 && coverage(x, y, region.retain)) join = Math.min(join, interiorJoin(x + .5, y + .5, region.retain));
      const erased = Math.round(coverage(x, y, region.erase) * join), retained = Math.round(coverage(x, y, region.retain) * join);
      if (retained > erased) throw new Error('Selected SW quality pixels must be owned by the replacement mask.');
      if (erased) { eraseMask.data.fill(255, i, i + 3); eraseMask.data[i + 3] = Math.max(eraseMask.data[i + 3]!, erased); }
      if (retained) { retainMask.data.fill(255, i, i + 3); retainMask.data[i + 3] = Math.max(retainMask.data[i + 3]!, retained); if (study.data[i + 3]! * retained / 255 >= 8) { if (region.layer === 'head') selectedHeadPixels++; else selectedHairPixels++; } }
      if (erased || retained) {
        // Premultiplied replacement keeps two opaque interiors opaque throughout a join.
        const oldWeight = output.data[i + 3]! * (255 - erased), newWeight = study.data[i + 3]! * retained, alpha = oldWeight + newWeight;
        if (Math.round(alpha / 255) < 8) output.data.fill(0, i, i + 4);
        else { for (let c = 0; c < 3; c++) output.data[i + c] = Math.round((output.data[i + c]! * oldWeight + study.data[i + c]! * newWeight) / alpha); output.data[i + 3] = Math.round(alpha / 255); }
      }
    }
  }
  let changedHeadPixels = 0, changedFrontPixels = 0, changedRearPixels = 0;
  for (let i = 0; i < head.data.length; i += 4) {
    if (head.data.subarray(i, i + 4).some((v, c) => v !== oldHead.data[i + c])) changedHeadPixels++;
    if (rear.data.subarray(i, i + 4).some((v, c) => v !== oldRear.data[i + c])) changedRearPixels++;
    if (front.data.subarray(i, i + 4).some((v, c) => v !== oldFront.data[i + c])) changedFrontPixels++;
  }
  return { head, front, rear, rearErase, rearSelection, headErase, headSelection, frontErase, frontSelection, measurements: { selectedHeadPixels, selectedHairPixels, changedHeadPixels, changedFrontPixels, changedRearPixels, bodyAndEyesChanged: false, shiftedScaledOrMirrored: false, globalColorKey: false } };
}
