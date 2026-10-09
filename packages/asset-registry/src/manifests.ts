import { z } from 'zod';
import { anatomyFamilySchema, bodyPresetSchema, visibleTraitSchema, renderTargetSchema, directionSchema, DIRECTIONS, RENDER_TARGETS, RENDER_TARGET_SPECS, BACK_DIRECTIONS, pointSchema, nativeSizeSchema, anchorSchema, anchorTableSchema, renderPlaneSchema, materialSchema, materialMapSchema, imageMaskSchema, assetSourceSchema, semanticIdSchema, poseSchema } from '@character-studio/core';
import type { RenderTarget } from '@character-studio/core';

export const ASSET_MANIFEST_VERSION = 1;
export const ASSET_CATALOG_VERSION = 1;
export const ASSET_CATEGORIES = ['base-body', 'body-variant', 'head', 'facial-feature', 'ears', 'horns', 'wings', 'tail', 'hair', 'outfit', 'outfit-piece'] as const;
export const assetCategorySchema = z.enum(ASSET_CATEGORIES);
const uniqueIds = z.array(semanticIdSchema).min(1).refine((ids) => new Set(ids).size === ids.length, 'IDs must be unique.').readonly();
const traits = z.array(visibleTraitSchema).refine((ids) => new Set(ids).size === ids.length, 'Traits must be unique.').readonly();

export const assetFrameSchema = z.strictObject({
  id: semanticIdSchema, sprite: assetSourceSchema, size: nativeSizeSchema,
  plane: renderPlaneSchema, order: z.number().int(),
  visibility: z.enum(['visible', 'hidden', 'front-only']),
  attachTo: anchorSchema, origin: pointSchema, offset: pointSchema,
  materialMap: materialMapSchema.optional(), occlusionMask: imageMaskSchema.optional(),
}).superRefine((frame, ctx) => {
  if (frame.origin.x < 0 || frame.origin.y < 0 || frame.origin.x >= frame.size.width || frame.origin.y >= frame.size.height) ctx.addIssue({ code: 'custom', path: ['origin'], message: 'Origin must lie inside the source image.' });
  for (const [key, image] of [['materialMap', frame.materialMap], ['occlusionMask', frame.occlusionMask]] as const) {
    if (image && (image.size.width !== frame.size.width || image.size.height !== frame.size.height)) ctx.addIssue({ code: 'custom', path: [key, 'size'], message: 'Map/mask dimensions must equal source dimensions.' });
  }
}).readonly();

const assetVariantSchema = z.strictObject({
  pose: poseSchema,
  // An empty list explicitly declares no visible part in a facing. Omitted keys are gaps.
  frames: z.partialRecord(directionSchema, z.array(assetFrameSchema).readonly()).readonly(),
}).readonly();

export const assetManifestSchema = z.strictObject({
  schemaVersion: z.literal(ASSET_MANIFEST_VERSION), id: semanticIdSchema, assetVersion: z.number().int().positive(),
  status: z.enum(['draft', 'published']), category: assetCategorySchema,
  compatibleRigs: z.array(anatomyFamilySchema).min(1).refine((ids) => new Set(ids).size === ids.length, 'Rig IDs must be unique.').readonly(),
  compatibleBodies: z.array(bodyPresetSchema).min(1).refine((ids) => new Set(ids).size === ids.length, 'Body IDs must be unique.').readonly(),
  requiresTraits: traits, excludesTraits: traits,
  materialSlots: z.array(materialSchema).refine((ids) => new Set(ids).size === ids.length, 'Material slots must be unique.').readonly(),
  // Variant keys are the authoritative declaration of supported targets.
  variants: z.partialRecord(renderTargetSchema, assetVariantSchema).readonly(),
}).superRefine((asset, ctx) => {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
  if (!RENDER_TARGETS.some((target) => asset.variants[target])) issue(['variants'], 'Declare at least one supported target.');
  if (asset.requiresTraits.some((trait) => asset.excludesTraits.includes(trait))) issue(['excludesTraits'], 'Required and excluded traits must not overlap.');
  for (const target of RENDER_TARGETS) {
    const variant = asset.variants[target];
    if (!variant) continue;
    if (variant.pose !== RENDER_TARGET_SPECS[target].pose) issue(['variants', target, 'pose'], `Use the ${RENDER_TARGET_SPECS[target].pose} pose for ${target}.`);
    for (const direction of DIRECTIONS) {
      const frames = variant.frames[direction];
      const path = ['variants', target, 'frames', direction];
      if (!frames) {
        if (asset.status === 'published') issue(path, 'Published assets require all eight explicit facings.');
        continue;
      }
      if (new Set(frames.map((frame) => frame.id)).size !== frames.length) issue(path, 'Frame IDs must be unique within each facing.');
      frames.forEach((frame, index) => {
        if (target === 'pixel' && [frame.origin, frame.offset].some((point) => !Number.isInteger(point.x) || !Number.isInteger(point.y))) issue([...path, index], 'Pixel origins and offsets must use integers.');
        if (BACK_DIRECTIONS.includes(direction) && frame.plane === 'eyes' && frame.visibility === 'visible') issue([...path, index, 'visibility'], 'Rear facings must hide eyes.');
        if (frame.materialMap?.regions.some((region) => !asset.materialSlots.includes(region.material))) issue([...path, index, 'materialMap'], 'Every mapped material must be declared in materialSlots.');
        if (asset.materialSlots.length > 0 && frame.visibility !== 'hidden' && !frame.materialMap) issue([...path, index, 'materialMap'], 'Palette-linked frames require an explicit material map.');
      });
    }
  }
}).readonly();
export type AssetManifest = z.infer<typeof assetManifestSchema>;
export type AssetFrame = z.infer<typeof assetFrameSchema>;

export const rigProfileSchema = z.strictObject({
  rig: anatomyFamilySchema, bodyPreset: bodyPresetSchema, target: renderTargetSchema, pose: poseSchema,
  frames: z.partialRecord(directionSchema, anchorTableSchema).readonly(),
}).superRefine((profile, ctx) => {
  const spec = RENDER_TARGET_SPECS[profile.target];
  if (profile.pose !== spec.pose) ctx.addIssue({ code: 'custom', path: ['pose'], message: 'Rig pose must match its target.' });
  for (const direction of DIRECTIONS) {
    for (const [name, point] of Object.entries(profile.frames[direction] ?? {})) {
      if (point.x < 0 || point.x >= spec.width || point.y < 0 || point.y >= spec.height) ctx.addIssue({ code: 'custom', path: ['frames', direction, name], message: 'Native anchors must lie inside the target canvas.' });
      if (profile.target === 'pixel' && (!Number.isInteger(point.x) || !Number.isInteger(point.y))) ctx.addIssue({ code: 'custom', path: ['frames', direction, name], message: 'Pixel rig anchors must use integers.' });
    }
  }
}).readonly();
export type RigProfile = z.infer<typeof rigProfileSchema>;
export function rigProfileKey(rig: string, body: string, target: RenderTarget): string { return `${rig}/${body}/${target}`; }

export const assetCatalogSchema = z.strictObject({
  schemaVersion: z.literal(ASSET_CATALOG_VERSION), catalogVersion: semanticIdSchema,
  assets: z.array(assetManifestSchema).readonly(), rigs: z.array(rigProfileSchema).readonly(),
  bindings: z.array(z.strictObject({ key: semanticIdSchema, assetIds: uniqueIds }).readonly()).readonly(),
}).superRefine((catalog, ctx) => {
  for (const [field, keys] of [
    ['assets', catalog.assets.map((asset) => asset.id)],
    ['rigs', catalog.rigs.map((rig) => rigProfileKey(rig.rig, rig.bodyPreset, rig.target))],
    ['bindings', catalog.bindings.map((binding) => binding.key)],
  ] as const) {
    if (new Set(keys).size !== keys.length) ctx.addIssue({ code: 'custom', path: [field], message: `Duplicate ${field} identifiers are forbidden.` });
  }
}).readonly();
export type AssetCatalog = z.infer<typeof assetCatalogSchema>;
