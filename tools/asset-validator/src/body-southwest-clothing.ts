import { z } from 'zod';
import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

const offsets = z.tuple([z.number().int().min(0).max(65), z.number().int().min(0).max(65), z.number().int().min(0).max(65)]);
export const southwestClothingSettingsSchema = z.strictObject({
  schemaVersion: z.literal(1), direction: z.literal('SW'), method: z.literal('bounded-fabric-tone-transfer'),
  braOffset: offsets, briefsOffset: offsets,
  outlineThreshold: z.literal(85), fullToneThreshold: z.literal(125),
  maximumFabricRed: z.literal(220), maximumFabricChroma: z.literal(28),
  preserveSourceAlpha: z.literal(true),
});

/** Local fabric RGB only: retain native geometry, alpha, outlines and original shade variation. */
export function recolourSouthwestClothing(original: RgbaImage, input: unknown) {
  const settings = southwestClothingSettingsSchema.parse(input);
  if (original.width !== 1024 || original.height !== 1536) throw new Error('Native SW body required for clothing colour correction.');
  const body = { ...original, data: original.data.slice() }, mask = blankImage(1024, 1536);
  let changedPixels = 0, braPixels = 0, briefsPixels = 0;
  for (let y = 294; y < 721; y++) for (let x = 320; x < 620; x++) {
    const bra = y < 499 && x < 570, briefs = y >= 595 && x >= 350;
    if (!bra && !briefs) continue;
    const p = (y * 1024 + x) * 4, r = original.data[p]!, g = original.data[p + 1]!, b = original.data[p + 2]!;
    // These bounded material tests separate the grey/mauve cloth from warm skin. No alpha is keyed or changed.
    if (original.data[p + 3]! < 8 || r >= settings.maximumFabricRed || b < g || Math.max(r, g, b) - Math.min(r, g, b) > settings.maximumFabricChroma) continue;
    const luminance = (54 * r + 183 * g + 19 * b) / 256;
    const weight = Math.max(0, Math.min(1, (luminance - settings.outlineThreshold) / (settings.fullToneThreshold - settings.outlineThreshold)));
    if (weight === 0) continue;
    const offset = bra ? settings.braOffset : settings.briefsOffset;
    for (let c = 0; c < 3; c++) body.data[p + c] = Math.min(255, original.data[p + c]! + Math.round(offset[c]! * weight));
    mask.data.fill(255, p, p + 3); mask.data[p + 3] = Math.round(weight * 255);
    changedPixels++; if (bra) braPixels++; else briefsPixels++;
  }
  if (braPixels < 10_000 || briefsPixels < 3000) throw new Error('Complete SW bra and brief fabric selections required.');
  return { body, mask, measurements: { changedPixels, braPixels, briefsPixels, sourceAlphaPreserved: true, geometryChanged: false } };
}
