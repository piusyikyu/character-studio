import { z } from 'zod';
import { directionSchema } from '@character-studio/core';
import { blankImage, drawRgba } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { validateAuthoredWardrobeCompatibility } from './wardrobe-compatibility';

/** Offline fitting contracts; these do not add CharacterRecipe fields or publish assets. */
export const wardrobeSurfaceSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().min(1), bodyId: z.string().min(1), direction: directionSchema,
  replacements: z.array(z.strictObject({ regionId: z.string().min(1), surfaceId: z.string().min(1) })).min(1),
}).refine(value => new Set(value.replacements.map(p => p.regionId)).size === value.replacements.length, 'Surface replacement regions must be unique.');

export interface AuthoredSurfacePart {
  bodyId: string;
  direction: string;
  image: RgbaImage;
}
export interface AssembledWardrobeSurface extends AuthoredSurfacePart {
  id: string;
  surfaceParts: Record<string,string>;
  replacedPixels: Record<string,number>;
}
const sameSize = (reference: RgbaImage, image: RgbaImage) => {
  if (image.width !== reference.width || image.height !== reference.height || image.data.length !== reference.data.length) throw new Error('WARDROBE_NATIVE_SIZE_MISMATCH: independently author this part at the surface canvas size.');
};

/** Replace owned chest/pelvis pixels once, independently of which garment will later be selected. */
export function assembleWardrobeSurface(input: unknown, context: {
  bodyId: string; direction: string; baseSkin: RgbaImage; bodyFootprint: RgbaImage;
  regions: ReadonlyMap<string,RgbaImage>; parts: ReadonlyMap<string,AuthoredSurfacePart>;
}): AssembledWardrobeSurface {
  const spec = wardrobeSurfaceSchema.parse(input), { bodyFootprint,baseSkin } = context;
  if (spec.direction !== context.direction) throw new Error('WARDROBE_FACING_MISMATCH: surface requires its own facing.');
  if (spec.bodyId !== context.bodyId) throw new Error('WARDROBE_BODY_MISMATCH: surface requires its fitted body.');
  sameSize(bodyFootprint,baseSkin);
  const image = { ...baseSkin,data: baseSkin.data.slice() }, owners = new Set<number>(), replacedPixels: Record<string,number> = {};
  for (const replacement of spec.replacements) {
    const region = context.regions.get(replacement.regionId), part = context.parts.get(replacement.surfaceId);
    if (!region) throw new Error('WARDROBE_SURFACE_REGION_MISSING: ' + replacement.regionId);
    if (!part) throw new Error('WARDROBE_SURFACE_MISSING: ' + replacement.surfaceId + ' needs independently authored ' + spec.direction + ' artwork.');
    if (part.direction !== spec.direction) throw new Error('WARDROBE_FACING_MISMATCH: ' + replacement.surfaceId);
    if (part.bodyId !== spec.bodyId) throw new Error('WARDROBE_BODY_MISMATCH: ' + replacement.surfaceId);
    sameSize(bodyFootprint,region); sameSize(bodyFootprint,part.image);
    let count = 0;
    for (let p = 3; p < region.data.length; p += 4) if (region.data[p]) {
      if (owners.has(p)) throw new Error('WARDROBE_SURFACE_REGION_OVERLAP: assign each pixel to one body surface.');
      if (!bodyFootprint.data[p]) throw new Error('WARDROBE_SURFACE_OUTSIDE_BODY: ' + replacement.regionId);
      if (part.image.data[p]! < bodyFootprint.data[p]!) throw new Error('WARDROBE_SURFACE_GAP: ' + replacement.surfaceId + ' has incomplete native coverage.');
      owners.add(p); count++;
      image.data.set(part.image.data.subarray(p - 3,p),p - 3);
      // New RGB, original body silhouette/edge alpha; never transform approved geometry.
      image.data[p] = bodyFootprint.data[p]!;
    }
    if (!count) throw new Error('WARDROBE_SURFACE_REGION_EMPTY: ' + replacement.regionId);
    replacedPixels[replacement.regionId] = count;
  }
  for (let p = 3; p < image.data.length; p += 4) if (image.data[p] !== bodyFootprint.data[p]) throw new Error('WARDROBE_SURFACE_GAP: complete the body surface before fitting different underwear cuts.');
  return { id: spec.id,bodyId: spec.bodyId,direction: spec.direction,image,surfaceParts: Object.fromEntries(spec.replacements.map(p => [p.regionId,p.surfaceId])),replacedPixels };
}

export interface AuthoredWardrobeGarment extends AuthoredSurfacePart {
  id: string;
  requiredSurfaceIds: readonly string[];
  role: 'underwear' | 'outerwear';
}

/** Fit discrete underwear cuts to actual surfaces, then validate optional concealment under open outfits. */
export function fitWardrobeOnSurface(input: unknown, context: {
  surface: AssembledWardrobeSurface; garments: readonly AuthoredWardrobeGarment[];
  masks: ReadonlyMap<string,RgbaImage>; concealUnderwear: boolean;
}) {
  const { surface,garments } = context;
  const available = new Set([surface.id,...Object.values(surface.surfaceParts)]);
  for (const garment of garments) {
    if (garment.direction !== surface.direction) throw new Error('WARDROBE_FACING_MISMATCH: ' + garment.id);
    if (garment.bodyId !== surface.bodyId) throw new Error('WARDROBE_BODY_MISMATCH: ' + garment.id);
    if (!garment.requiredSurfaceIds.length || garment.requiredSurfaceIds.some(id => !available.has(id))) throw new Error('WARDROBE_GARMENT_FIT_MISSING: ' + garment.id + ' needs a fitted variant for the selected body surfaces.');
    sameSize(surface.image,garment.image);
  }
  const coverage = validateAuthoredWardrobeCompatibility(input,{ direction: surface.direction,availableSurfaceIds: [surface.id],masks: context.masks,clothing: garments.map(g => g.image) });
  const outer = blankImage(surface.image.width,surface.image.height);
  for (const garment of garments) if (garment.role === 'outerwear') drawRgba(outer,garment.image,0,0);
  if (context.concealUnderwear) for (const garment of garments) if (garment.role === 'underwear') {
    for (let p = 3; p < garment.image.data.length; p += 4) if (garment.image.data[p] && outer.data[p]! < 250) throw new Error('WARDROBE_UNDERLAYER_PEEK: ' + garment.id + ' needs a different cut or fitted lining for this opening.');
  }
  // Body → underwear → outerwear, regardless of the caller's garment list order.
  const image = { ...surface.image,data: surface.image.data.slice() };
  for (const role of ['underwear','outerwear'] as const) for (const garment of garments) if (garment.role === role) drawRgba(image,garment.image,0,0);
  return { image,coverage,garmentIds: garments.map(g => g.id),underwearConcealed: context.concealUnderwear };
}
