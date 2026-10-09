import { z } from 'zod';
import { anatomyFamilySchema, bodyPresetSchema } from './anatomy';
import { directionSchema, renderTargetSchema, RENDER_TARGET_SPECS } from './domains';
import type { Direction } from './domains';
import { characterRecipeSchema } from './recipe';
import type { CharacterRecipe } from './recipe';

export const RENDER_PLAN_VERSION = 1;
export const ANCHORS = ['head_center', 'neck_base', 'shoulder_left', 'shoulder_right', 'chest_center', 'waist_center', 'hip_left', 'hip_right', 'hand_left', 'hand_right', 'foot_left', 'foot_right', 'ground_baseline'] as const;
export const RENDER_PLANES = ['body-back-leg', 'body-back-arm', 'body-torso', 'body-front-leg', 'body-front-arm', 'neck', 'head', 'ears', 'eyes', 'eyebrows', 'mouth', 'horns', 'wing-rear', 'wing-front', 'tail-rear', 'tail-front', 'hair-rear', 'hair-front', 'outfit-torso', 'outfit-back', 'outfit-front'] as const;
export const MATERIALS = ['skin', 'hair', 'left-eye', 'right-eye', 'outfit'] as const;
export const anchorSchema = z.enum(ANCHORS);
export const renderPlaneSchema = z.enum(RENDER_PLANES);
export const materialSchema = z.enum(MATERIALS);
export const poseSchema = z.enum(['tpose', 'idle']);
export const pointSchema = z.strictObject({ x: z.number().finite(), y: z.number().finite() }).readonly();
export const nativeSizeSchema = z.strictObject({ width: z.number().int().positive(), height: z.number().int().positive() }).readonly();
export const anchorTableSchema = z.record(anchorSchema, pointSchema).readonly();
// Package-relative PNG references: no absolute paths, URLs, traversal or implicit transforms.
export const assetSourceSchema = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+\.png$/)
  .refine((source) => !source.split('/').some((part) => part === '.' || part === '..'), 'Use a package-relative PNG path.');
export const semanticIdSchema = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
export const materialMapSchema = z.strictObject({
  source: assetSourceSchema,
  size: nativeSizeSchema,
  regions: z.array(z.strictObject({
    index: z.number().int().min(1).max(255),
    material: materialSchema,
    shade: z.enum(['shadow-deep', 'shadow', 'base', 'highlight', 'highlight-bright']),
  }).readonly()).min(1).readonly(),
}).superRefine((map, ctx) => {
  if (new Set(map.regions.map((region) => region.index)).size !== map.regions.length) {
    ctx.addIssue({ code: 'custom', path: ['regions'], message: 'Material map indices must be unique.' });
  }
}).readonly();
export const imageMaskSchema = z.strictObject({ source: assetSourceSchema, size: nativeSizeSchema }).readonly();

const frontPlanes = ['tail-rear', 'wing-rear', 'hair-rear', 'body-back-leg', 'body-back-arm', 'outfit-back', 'body-torso', 'body-front-leg', 'neck', 'outfit-torso', 'head', 'ears', 'eyes', 'eyebrows', 'mouth', 'horns', 'outfit-front', 'body-front-arm', 'hair-front', 'tail-front', 'wing-front'] as const;
const backPlanes = ['tail-front', 'wing-front', 'hair-front', 'body-back-leg', 'body-back-arm', 'outfit-front', 'body-torso', 'body-front-leg', 'neck', 'outfit-torso', 'head', 'ears', 'eyes', 'eyebrows', 'mouth', 'horns', 'outfit-back', 'body-front-arm', 'hair-rear', 'tail-rear', 'wing-rear'] as const;
const profilePlanes = ['wing-rear', 'tail-rear', 'body-back-leg', 'body-back-arm', 'hair-rear', 'outfit-back', 'body-torso', 'body-front-leg', 'neck', 'outfit-torso', 'head', 'ears', 'eyes', 'eyebrows', 'mouth', 'horns', 'outfit-front', 'body-front-arm', 'hair-front', 'tail-front', 'wing-front'] as const;
export const DIRECTION_PLANE_ORDER: Readonly<Record<Direction, readonly RenderPlane[]>> = Object.freeze({
  N: Object.freeze(backPlanes), NE: backPlanes, E: Object.freeze(profilePlanes), SE: Object.freeze(frontPlanes),
  S: frontPlanes, SW: frontPlanes, W: profilePlanes, NW: backPlanes,
});
export const BACK_DIRECTIONS: readonly Direction[] = Object.freeze(['N', 'NE', 'NW']);
export type RenderPlane = z.infer<typeof renderPlaneSchema>;
export type Material = z.infer<typeof materialSchema>;

export function recipePalettes(recipe: CharacterRecipe): Readonly<Record<Material, string>> {
  return Object.freeze({ skin: recipe.skinTone, hair: recipe.hair.colour, 'left-eye': recipe.eyes.leftColour, 'right-eye': recipe.eyes.rightColour, outfit: recipe.outfit.colour });
}

export const renderLayerSchema = z.strictObject({
  assetId: semanticIdSchema, assetVersion: z.number().int().positive(), frameId: semanticIdSchema,
  plane: renderPlaneSchema, order: z.number().int(),
  visibility: z.enum(['visible', 'front-only']),
  sprite: assetSourceSchema, size: nativeSizeSchema,
  attachTo: anchorSchema, origin: pointSchema, offset: pointSchema, position: pointSchema,
  materialMap: materialMapSchema.optional(), occlusionMask: imageMaskSchema.optional(),
  palettes: z.partialRecord(materialSchema, z.string().min(1)).readonly(),
}).readonly();
export type RenderLayer = z.infer<typeof renderLayerSchema>;

function compareText(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
export function compareRenderLayers(direction: Direction, a: RenderLayer, b: RenderLayer): number {
  const planes = DIRECTION_PLANE_ORDER[direction];
  return planes.indexOf(a.plane) - planes.indexOf(b.plane) || a.order - b.order || compareText(a.assetId, b.assetId) || compareText(a.frameId, b.frameId);
}

export const renderPlanSchema = z.strictObject({
  schemaVersion: z.literal(RENDER_PLAN_VERSION), catalogVersion: semanticIdSchema,
  recipe: characterRecipeSchema, target: renderTargetSchema, direction: directionSchema, pose: poseSchema,
  size: nativeSizeSchema, rig: anatomyFamilySchema, bodyPreset: bodyPresetSchema,
  anchors: anchorTableSchema, layers: z.array(renderLayerSchema).min(1).readonly(),
}).superRefine((plan, ctx) => {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
  const spec = RENDER_TARGET_SPECS[plan.target];
  if (plan.size.width !== spec.width || plan.size.height !== spec.height || plan.pose !== spec.pose) issue(['target'], 'Canvas dimensions and pose must match the native rendering target.');
  if (plan.rig !== plan.recipe.anatomy.family || plan.bodyPreset !== plan.recipe.anatomy.bodyPreset) issue(['rig'], 'Rig and body preset must match the character recipe.');
  for (const [key, anchor] of Object.entries(plan.anchors)) {
    if (anchor.x < 0 || anchor.x >= spec.width || anchor.y < 0 || anchor.y >= spec.height) issue(['anchors', key], 'Anchor must lie within the native canvas.');
    if (plan.target === 'pixel' && (!Number.isInteger(anchor.x) || !Number.isInteger(anchor.y))) issue(['anchors', key], 'Pixel anchors must use integer coordinates.');
  }
  const palette = recipePalettes(plan.recipe);
  const ids = new Set<string>();
  plan.layers.forEach((layer, index) => {
    const path = ['layers', index];
    const identity = `${layer.assetId}/${layer.frameId}`;
    if (ids.has(identity)) issue(path, 'Each asset frame may appear only once.');
    ids.add(identity);
    const anchor = plan.anchors[layer.attachTo];
    if (layer.position.x !== anchor.x - layer.origin.x + layer.offset.x || layer.position.y !== anchor.y - layer.origin.y + layer.offset.y) issue([...path, 'position'], 'Position must equal rig anchor minus asset origin plus offset.');
    if (layer.origin.x < 0 || layer.origin.x >= layer.size.width || layer.origin.y < 0 || layer.origin.y >= layer.size.height) issue([...path, 'origin'], 'Attachment origin must lie within the source image.');
    if (layer.position.x < 0 || layer.position.y < 0 || layer.position.x + layer.size.width > spec.width || layer.position.y + layer.size.height > spec.height) issue([...path, 'position'], 'Asset rectangle extends beyond the native canvas.');
    if (plan.target === 'pixel' && [layer.position, layer.origin, layer.offset].some((point) => !Number.isInteger(point.x) || !Number.isInteger(point.y))) issue(path, 'Pixel placement, origin and offsets must use integer coordinates.');
    if (BACK_DIRECTIONS.includes(plan.direction) && layer.plane === 'eyes') issue([...path, 'plane'], 'Eyes cannot be visible in N, NE or NW.');
    if (BACK_DIRECTIONS.includes(plan.direction) && layer.visibility === 'front-only') issue([...path, 'visibility'], 'Front-only details cannot be visible in N, NE or NW.');
    for (const [kind, image] of [['materialMap', layer.materialMap], ['occlusionMask', layer.occlusionMask]] as const) {
      if (image && (image.size.width !== layer.size.width || image.size.height !== layer.size.height)) issue([...path, kind], 'Map/mask dimensions must equal source dimensions.');
    }
    for (const region of layer.materialMap?.regions ?? []) {
      if (layer.palettes[region.material] !== palette[region.material]) issue([...path, 'palettes', region.material], 'Each material region must use its recipe palette.');
    }
    for (const material of MATERIALS) {
      if (layer.palettes[material] !== undefined && layer.palettes[material] !== palette[material]) issue([...path, 'palettes', material], 'Palette assignment must preserve the recipe material identity.');
    }
    const previous = plan.layers[index - 1];
    if (previous && compareRenderLayers(plan.direction, previous, layer) > 0) issue(path, 'Layers must be sorted by direction plane, local order, asset ID and frame ID.');
  });
}).readonly();
export type RenderPlan = z.infer<typeof renderPlanSchema>;
