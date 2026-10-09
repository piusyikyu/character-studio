import { z } from 'zod';
import { characterRecipeSchema, directionSchema, renderTargetSchema, renderPlanSchema, RENDER_TARGET_SPECS, RENDER_TARGETS, DIRECTIONS, BACK_DIRECTIONS, MATERIALS, recipePalettes, compareRenderLayers, RENDER_PLAN_VERSION } from '@character-studio/core';
import type { CharacterRecipe, Direction, RenderTarget, RenderPlan, RenderLayer, Material } from '@character-studio/core';
import { assetCatalogSchema, rigProfileKey } from './manifests';
import type { AssetManifest } from './manifests';

export type PlanningIssueCode = 'invalid-catalog' | 'invalid-request' | 'missing-binding' | 'missing-asset' | 'missing-target' | 'missing-direction' | 'missing-rig' | 'incompatible-asset' | 'missing-source' | 'invalid-plan';
export interface PlanningIssue {
  readonly code: PlanningIssueCode;
  readonly path: readonly (string | number)[];
  readonly message: string;
}
export class AssetPlanningError extends Error {
  readonly issues: readonly PlanningIssue[];
  constructor(issues: readonly PlanningIssue[]) {
    super(issues.map((issue) => `${issue.code} at ${issue.path.join('.')}: ${issue.message}`).join('\n'));
    this.name = 'AssetPlanningError';
    this.issues = Object.freeze(issues.map((issue) => Object.freeze({ ...issue, path: Object.freeze([...issue.path]) })));
  }
}
function parse<T>(schema: z.ZodType<T>, input: unknown, code: PlanningIssueCode): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new AssetPlanningError(result.error.issues.map((issue) => ({ code, path: issue.path.map((part) => typeof part === 'number' ? part : String(part)), message: issue.message })));
  return result.data;
}

/** Bindings are explicit semantic selections, never first-match/fallback artwork. */
export function recipeAssetKeys(recipe: CharacterRecipe): readonly string[] {
  return Object.freeze([
    `body.${recipe.anatomy.bodyPreset}`, `head.${recipe.anatomy.headShape}`, 'eyes',
    `face.${recipe.expression}`, `ears.${recipe.visibleTraits.includes('pointed-ears') ? 'pointed-ears' : 'rounded-ears'}`,
    `hair.${recipe.hair.style}`, `outfit.${recipe.outfit.id}.${recipe.outfit.fit}`,
    ...recipe.visibleTraits.filter((trait) => trait === 'fangs').map((trait) => `trait.${trait}`),
  ]);
}

export interface ManifestRegistryOptions {
  /** Optional complete inventory from an external loader/auditor. No file I/O occurs here. */
  readonly availableSources?: readonly string[];
}
export interface ManifestFilter {
  readonly category?: AssetManifest['category'];
  readonly target?: RenderTarget;
  readonly direction?: Direction;
  readonly pose?: 'tpose' | 'idle';
  readonly rig?: CharacterRecipe['anatomy']['family'];
  readonly bodyPreset?: CharacterRecipe['anatomy']['bodyPreset'];
}

export function createManifestRegistry(input: unknown, options: ManifestRegistryOptions = {}) {
  const catalog = parse(assetCatalogSchema, input, 'invalid-catalog');
  const assets = new Map(catalog.assets.map((asset) => [asset.id, asset]));
  const bindings = new Map(catalog.bindings.map((binding) => [binding.key, binding.assetIds]));
  const rigs = new Map(catalog.rigs.map((rig) => [rigProfileKey(rig.rig, rig.bodyPreset, rig.target), rig]));
  const sources = options.availableSources ? new Set(options.availableSources) : undefined;

  function coverageIssues(): readonly PlanningIssue[] {
    const issues: PlanningIssue[] = [];
    for (const binding of catalog.bindings) {
      for (const id of binding.assetIds) if (!assets.has(id)) issues.push({ code: 'missing-asset', path: ['bindings', binding.key, id], message: `Add manifest ${id} or repair this binding.` });
    }
    for (const asset of catalog.assets) {
      for (const target of RENDER_TARGETS) {
        const variant = asset.variants[target];
        if (!variant) continue;
        for (const direction of DIRECTIONS) {
          if (!variant.frames[direction]) issues.push({ code: 'missing-direction', path: ['assets', asset.id, 'variants', target, direction], message: `Author an explicit ${direction} frame list; an empty list is allowed for hidden parts.` });
        }
      }
    }
    for (const rig of catalog.rigs) {
      for (const direction of DIRECTIONS) if (!rig.frames[direction]) issues.push({ code: 'missing-direction', path: ['rigs', rigProfileKey(rig.rig, rig.bodyPreset, rig.target), direction], message: `Define native anchors for ${direction}.` });
    }
    return Object.freeze(issues.map((issue) => Object.freeze({ ...issue, path: Object.freeze([...issue.path]) })));
  }

  function resolve(recipeInput: unknown, targetInput: RenderTarget, directionInput: Direction): RenderPlan {
    const recipe = parse(characterRecipeSchema, recipeInput, 'invalid-request');
    const target = parse(renderTargetSchema, targetInput, 'invalid-request');
    const direction = parse(directionSchema, directionInput, 'invalid-request');
    const issues: PlanningIssue[] = [];
    const report = (code: PlanningIssueCode, path: (string | number)[], message: string) => issues.push({ code, path, message });
    const selected = new Map<string, AssetManifest>();
    for (const key of recipeAssetKeys(recipe)) {
      const ids = bindings.get(key);
      if (!ids) { report('missing-binding', ['bindings', key], `Map the recipe selection ${key} to explicitly authored assets.`); continue; }
      for (const id of ids) {
        const asset = assets.get(id);
        if (!asset) report('missing-asset', ['assets', id], `Required asset ${id} has no manifest in catalog ${catalog.catalogVersion}.`);
        else selected.set(id, asset);
      }
    }
    const rigKey = rigProfileKey(recipe.anatomy.family, recipe.anatomy.bodyPreset, target);
    const rig = rigs.get(rigKey);
    if (!rig) report('missing-rig', ['rigs', rigKey], 'Provide a native rig profile for this body, target and pose.');
    else for (const facing of DIRECTIONS) if (!rig.frames[facing]) report('missing-direction', ['rigs', rigKey, facing], `Rig ${rigKey} needs explicit ${facing} anchors.`);
    const anchors = rig?.frames[direction];
    const palette = recipePalettes(recipe);
    const layers: RenderLayer[] = [];
    // Stable asset iteration ensures stable diagnostic ordering as well as draw ordering.
    for (const id of [...selected.keys()].sort()) {
      const asset = selected.get(id)!;
      const path = ['assets', id];
      const reasons: string[] = [];
      if (!asset.compatibleRigs.includes(recipe.anatomy.family)) reasons.push(`rig ${recipe.anatomy.family} is unsupported`);
      if (!asset.compatibleBodies.includes(recipe.anatomy.bodyPreset)) reasons.push(`body ${recipe.anatomy.bodyPreset} is unsupported`);
      for (const trait of asset.requiresTraits) if (!recipe.visibleTraits.includes(trait)) reasons.push(`requires visible trait ${trait}`);
      for (const trait of asset.excludesTraits) if (recipe.visibleTraits.includes(trait)) reasons.push(`conflicts with visible trait ${trait}`);
      if (reasons.length) { report('incompatible-asset', path, `${id}: ${reasons.join('; ')}. Select a compatible authored asset.`); continue; }
      const variant = asset.variants[target];
      if (!variant) { report('missing-target', [...path, 'variants', target], `Author a ${target} variant; other targets cannot be resampled as substitutes.`); continue; }
      for (const facing of DIRECTIONS) if (!variant.frames[facing]) report('missing-direction', [...path, 'variants', target, facing], `Author the ${facing} facing for ${id}; mirroring is not supported.`);
      for (const frame of variant.frames[direction] ?? []) {
        if (frame.visibility === 'hidden' || (frame.visibility === 'front-only' && BACK_DIRECTIONS.includes(direction))) continue;
        for (const source of [frame.sprite, frame.materialMap?.source, frame.occlusionMask?.source]) {
          if (sources && source && !sources.has(source)) report('missing-source', [...path, 'variants', target, direction, frame.id], `Required PNG ${source} is absent from the supplied source inventory.`);
        }
        if (!anchors) continue;
        const anchor = anchors[frame.attachTo];
        const palettes: Partial<Record<Material, string>> = {};
        for (const material of MATERIALS) if (frame.materialMap?.regions.some((region) => region.material === material)) palettes[material] = palette[material];
        layers.push({
          assetId: id, assetVersion: asset.assetVersion, frameId: frame.id,
          plane: frame.plane, order: frame.order, visibility: frame.visibility, sprite: frame.sprite, size: frame.size,
          attachTo: frame.attachTo, origin: frame.origin, offset: frame.offset,
          position: { x: anchor.x - frame.origin.x + frame.offset.x, y: anchor.y - frame.origin.y + frame.offset.y },
          palettes,
          ...(frame.materialMap ? { materialMap: frame.materialMap } : {}),
          ...(frame.occlusionMask ? { occlusionMask: frame.occlusionMask } : {}),
        });
      }
    }
    if (issues.length) throw new AssetPlanningError(issues);
    return parse(renderPlanSchema, {
      schemaVersion: RENDER_PLAN_VERSION, catalogVersion: catalog.catalogVersion, recipe, target, direction,
      pose: RENDER_TARGET_SPECS[target].pose,
      size: { width: RENDER_TARGET_SPECS[target].width, height: RENDER_TARGET_SPECS[target].height },
      rig: recipe.anatomy.family, bodyPreset: recipe.anatomy.bodyPreset, anchors,
      layers: layers.sort((a, b) => compareRenderLayers(direction, a, b)),
    }, 'invalid-plan');
  }

  return Object.freeze({
    catalogVersion: catalog.catalogVersion,
    get(id: string): AssetManifest | undefined { return assets.get(id); },
    list(filter: ManifestFilter = {}): readonly AssetManifest[] {
      return Object.freeze(catalog.assets.filter((asset) => {
        if (filter.category && asset.category !== filter.category) return false;
        if (filter.rig && !asset.compatibleRigs.includes(filter.rig)) return false;
        if (filter.bodyPreset && !asset.compatibleBodies.includes(filter.bodyPreset)) return false;
        const targets = filter.target ? [filter.target] : RENDER_TARGETS;
        return targets.some((target) => {
          const variant = asset.variants[target];
          return variant && (!filter.pose || variant.pose === filter.pose) && (!filter.direction || variant.frames[filter.direction] !== undefined);
        });
      }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    },
    coverageIssues, resolve,
  });
}
export type ManifestRegistry = ReturnType<typeof createManifestRegistry>;
export function resolveRenderPlan(registry: ManifestRegistry, recipe: unknown, target: RenderTarget, direction: Direction): RenderPlan {
  return registry.resolve(recipe, target, direction);
}
