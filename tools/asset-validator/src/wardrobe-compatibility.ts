import { z } from 'zod';
import { directionSchema } from '@character-studio/core';
import { blankImage, drawRgba } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

/** Offline authored coverage profiles belong to an outfit, body surface and facing; never infer universal anatomy. */
export const wardrobeCompatibilitySchema = z.strictObject({
  schemaVersion: z.literal(1), outfitId: z.string().min(1), surfaceId: z.string().min(1), direction: directionSchema,
  requiredZones: z.array(z.strictObject({ id: z.string().min(1), maskId: z.string().min(1) })).min(1),
  minimumOpaqueAlpha: z.number().int().min(250).max(255),
});
export function validateAuthoredWardrobeCompatibility(input: unknown, context: {
  direction: string; availableSurfaceIds: readonly string[]; masks: ReadonlyMap<string,RgbaImage>; clothing: readonly RgbaImage[];
}) {
  const profile = wardrobeCompatibilitySchema.parse(input);
  if (profile.direction !== context.direction) throw new Error('WARDROBE_FACING_MISMATCH: author this outfit and its coverage masks for ' + context.direction + '.');
  if (!context.availableSurfaceIds.includes(profile.surfaceId)) throw new Error('WARDROBE_SURFACE_MISSING: ' + profile.surfaceId + ' must be independently authored for ' + profile.outfitId + ' / ' + profile.direction + '.');
  const first = context.clothing[0];
  if (!first) throw new Error('WARDROBE_COVERAGE_MISSING: fitted opaque clothing/lining required.');
  const composite = blankImage(first.width,first.height);
  for (const clothing of context.clothing) {
    if (clothing.width !== first.width || clothing.height !== first.height) throw new Error('Wardrobe coverage images must have matching native dimensions.');
    drawRgba(composite,clothing,0,0);
  }
  const coveredPixels: Record<string,number> = {};
  for (const zone of profile.requiredZones) {
    const mask = context.masks.get(zone.maskId);
    if (!mask) throw new Error('WARDROBE_COVERAGE_MASK_MISSING: ' + zone.maskId + ' needs authored same-facing coverage.');
    if (mask.width !== first.width || mask.height !== first.height) throw new Error('Wardrobe coverage mask must match the native clothing canvas.');
    let count = 0;
    for (let p = 3; p < mask.data.length; p += 4) if (mask.data[p]) {
      count++;
      if (composite.data[p]! < profile.minimumOpaqueAlpha) throw new Error('WARDROBE_COVERAGE_MISSING: ' + zone.id + ' needs opaque underwear or fitted lining/clothing.');
    }
    if (!count) throw new Error('WARDROBE_COVERAGE_MASK_EMPTY: ' + zone.maskId + ' cannot certify an outfit.');
    coveredPixels[zone.id] = count;
  }
  return { outfitId: profile.outfitId,surfaceId: profile.surfaceId,direction: profile.direction,coveredPixels };
}
