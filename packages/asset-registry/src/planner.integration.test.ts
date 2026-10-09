import { describe, expect, it } from 'vitest';
import { createCharacterRecipe, DIRECTIONS, RENDER_TARGETS, EXAMPLE_CHARACTER_RECIPES, renderPlanSchema, DIRECTION_PLANE_ORDER } from '@character-studio/core';
import { createManifestRegistry, resolveRenderPlan, AssetPlanningError, assetManifestSchema, ASSET_CATEGORIES } from './index';
import type { AssetCatalog } from './index';
import { createSyntheticCatalog } from './testing/synthetic-catalog';

type Mutable<T> = { -readonly [K in keyof T]: Mutable<T[K]> };
function editable(): Mutable<AssetCatalog> { return JSON.parse(JSON.stringify(createSyntheticCatalog())) as Mutable<AssetCatalog>; }
function diagnostics(run: () => unknown) {
  try { run(); } catch (error) {
    expect(error).toBeInstanceOf(AssetPlanningError);
    if (error instanceof AssetPlanningError) return error.issues;
    throw error;
  }
  throw new Error('Expected planning to fail.');
}

describe('asset catalog to composition plan workflows', () => {
  it('resolves every example, body, native target and facing into immutable reproducible plans', () => {
    const catalog = editable();
    const registry = createManifestRegistry(catalog);
    const reordered = editable();
    for (const asset of reordered.assets) for (const target of RENDER_TARGETS) for (const direction of DIRECTIONS) {
      asset.variants[target]?.frames[direction]?.reverse();
    }
    for (const binding of reordered.bindings) binding.assetIds.reverse();
    const reversed = createManifestRegistry({ ...reordered, assets: [...reordered.assets].reverse(), bindings: [...reordered.bindings].reverse(), rigs: [...reordered.rigs].reverse() });
    expect(registry.coverageIssues()).toEqual([]);
    expect(new Set(registry.list().map((asset) => asset.category))).toEqual(new Set(ASSET_CATEGORIES));
    for (const { recipe } of EXAMPLE_CHARACTER_RECIPES) for (const target of RENDER_TARGETS) for (const direction of DIRECTIONS) {
      const plan = resolveRenderPlan(registry, recipe, target, direction);
      expect(renderPlanSchema.parse(JSON.parse(JSON.stringify(plan)))).toEqual(plan);
      expect(JSON.stringify(reversed.resolve(recipe, target, direction))).toBe(JSON.stringify(plan));
      expect(plan.size).toEqual(target === 'pixel' ? { width: 128, height: 192 } : { width: 1024, height: 1536 });
      expect(Object.isFrozen(plan.layers[0]?.position)).toBe(true);
      expect(Object.isFrozen(plan.anchors.head_center)).toBe(true);
    }
    catalog.assets[0]!.assetVersion = 99;
    expect(registry.get('body.balanced.v1')!.assetVersion).toBe(1);
    expect(Object.isFrozen(registry.get('body.balanced.v1')!.variants.pixel!.frames.S)).toBe(true);
    expect(registry.list({ category: 'hair', target: 'pixel', direction: 'E', pose: 'idle', rig: 'female-humanoid-v1', bodyPreset: 'balanced' })).toHaveLength(2);
  });

  it('attaches native cells with exact offsets and preserves the foot baseline', () => {
    const catalog = editable();
    const head = catalog.assets.find((asset) => asset.id === 'head.soft-oval.v1')!;
    head.variants.pixel!.frames.S![0]!.offset = { x: 3, y: -2 };
    const registry = createManifestRegistry(catalog);
    const recipe = createCharacterRecipe();
    const plan = registry.resolve(recipe, 'pixel', 'S');
    const layer = plan.layers.find((cell) => cell.assetId === head.id)!;
    expect(layer.position).toEqual({ x: 63, y: 28 });
    const body = plan.layers.find((cell) => cell.plane === 'body-torso')!;
    expect(body.position.y + body.size.height).toBe(plan.anchors.ground_baseline.y);
    expect(plan.anchors.foot_left.y).toBe(plan.anchors.ground_baseline.y);
    expect(plan.layers.every((cell) => Number.isInteger(cell.position.x) && Number.isInteger(cell.position.y))).toBe(true);
    expect(registry.resolve(recipe, 'detailed', 'S').anchors.head_center).toEqual({ x: 512, y: 300 });
    head.variants.pixel!.frames.S![0]!.offset.x = 500;
    expect(diagnostics(() => createManifestRegistry(catalog).resolve(recipe, 'pixel', 'S'))).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'invalid-plan', message: expect.stringContaining('beyond') })]));
    head.variants.pixel!.frames.S![0]!.offset.x = 0.5;
    expect(() => createManifestRegistry(catalog)).toThrow(AssetPlanningError);
  });

  it('changes draw order and visibility by facing while retaining independent profile sources', () => {
    const catalog = editable();
    const eyes = catalog.assets.find((asset) => asset.id === 'eyes.v1')!;
    eyes.variants.pixel!.frames.S![0]!.order = 2;
    const registry = createManifestRegistry(catalog);
    const recipe = createCharacterRecipe({ ancestry: { primary: 'elf', secondary: 'vampire' } });
    const front = registry.resolve(recipe, 'pixel', 'S');
    const rear = registry.resolve(recipe, 'pixel', 'N');
    const hairIds = (plan: typeof front) => plan.layers.filter((cell) => cell.assetId.startsWith('hair.')).map((cell) => cell.frameId);
    expect(hairIds(front)).toEqual(['rear', 'front']);
    expect(hairIds(rear)).toEqual(['front', 'rear']);
    expect(front.layers.filter((cell) => cell.plane === 'eyes').map((cell) => cell.frameId)).toEqual(['right', 'left']);
    for (const direction of ['N', 'NE', 'NW'] as const) {
      const plan = registry.resolve(recipe, 'pixel', direction);
      expect(plan.layers.some((cell) => cell.plane === 'eyes' || cell.frameId === 'front-opening' || cell.assetId === 'fangs.v1')).toBe(false);
      const ranks = plan.layers.map((cell) => DIRECTION_PLANE_ORDER[direction].indexOf(cell.plane));
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    }
    const east = registry.resolve(recipe, 'pixel', 'E');
    const west = registry.resolve(recipe, 'pixel', 'W');
    expect(east.layers.find((cell) => cell.plane === 'eyes')?.frameId).toBe('left');
    expect(west.layers.find((cell) => cell.plane === 'eyes')?.frameId).toBe('right');
    expect(east.layers.every((cell) => cell.sprite.includes('/E-'))).toBe(true);
    expect(west.layers.every((cell) => cell.sprite.includes('/W-'))).toBe(true);
    expect(front.layers.find((cell) => cell.frameId === 'back')?.occlusionMask?.source).toContain('/S-mask.png');
  });

  it('assigns independent eye and hair palettes only to declared material regions', () => {
    const registry = createManifestRegistry(createSyntheticCatalog());
    const recipe = createCharacterRecipe({ eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.crimson' }, hair: { colour: 'hair.silver' } });
    const before = registry.resolve(recipe, 'pixel', 'S');
    const after = registry.resolve(createCharacterRecipe({ eyes: recipe.eyes, hair: { colour: 'hair.gold' } }), 'pixel', 'S');
    expect(before.layers.find((cell) => cell.assetId === 'eyes.v1' && cell.frameId === 'left')?.palettes).toEqual({ 'left-eye': 'eyes.blue' });
    expect(before.layers.find((cell) => cell.assetId === 'eyes.v1' && cell.frameId === 'right')?.palettes).toEqual({ 'right-eye': 'eyes.crimson' });
    expect(before.layers.filter((cell) => cell.plane !== 'hair-front' && cell.plane !== 'hair-rear')).toEqual(after.layers.filter((cell) => cell.plane !== 'hair-front' && cell.plane !== 'hair-rear'));
    expect(after.layers.find((cell) => cell.plane === 'hair-front')?.palettes).toEqual({ hair: 'hair.gold' });
  });

  it('reports trait and body conflicts instead of choosing substitute artwork', () => {
    const catalog = editable();
    catalog.assets.find((asset) => asset.id === 'head.soft-oval.v1')!.requiresTraits = ['fangs'];
    catalog.assets.find((asset) => asset.id === 'hair.short-bob.v1')!.excludesTraits = ['rounded-ears'];
    catalog.assets.find((asset) => asset.id === 'body.balanced.v1')!.compatibleBodies = ['slender'];
    const issues = diagnostics(() => createManifestRegistry(catalog).resolve(createCharacterRecipe(), 'pixel', 'S'));
    expect(issues.filter((issue) => issue.code === 'incompatible-asset')).toHaveLength(3);
    expect(issues.map((issue) => issue.message).join('\n')).toContain('requires visible trait fangs');
    expect(issues.map((issue) => issue.message).join('\n')).toContain('conflicts with visible trait rounded-ears');
    expect(issues.map((issue) => issue.message).join('\n')).toContain('body balanced is unsupported');
    const contradictory = catalog.assets[0]!;
    contradictory.requiresTraits = ['fangs']; contradictory.excludesTraits = ['fangs'];
    expect(assetManifestSchema.safeParse(contradictory).success).toBe(false);
  });

  it('reports missing bindings, manifests, targets, facings, rigs and PNG inventories explicitly', () => {
    const catalog = editable();
    catalog.bindings = catalog.bindings.filter((binding) => binding.key !== 'eyes');
    catalog.assets = catalog.assets.filter((asset) => asset.id !== 'face.neutral.v1');
    delete catalog.assets.find((asset) => asset.id === 'head.soft-oval.v1')!.variants.pixel;
    delete catalog.assets.find((asset) => asset.id === 'hair.short-bob.v1')!.variants.pixel!.frames.W;
    catalog.rigs = catalog.rigs.filter((rig) => !(rig.target === 'pixel' && rig.bodyPreset === 'balanced'));
    const registry = createManifestRegistry(catalog);
    expect(registry.coverageIssues().some((issue) => issue.code === 'missing-direction' && issue.path.includes('W'))).toBe(true);
    const issues = diagnostics(() => registry.resolve(createCharacterRecipe(), 'pixel', 'E'));
    expect(new Set(issues.map((issue) => issue.code))).toEqual(new Set(['missing-binding', 'missing-asset', 'missing-target', 'missing-direction', 'missing-rig']));
    expect(issues.some((issue) => issue.path.includes('W'))).toBe(true);
    const emptySources = createManifestRegistry(createSyntheticCatalog(), { availableSources: [] });
    expect(diagnostics(() => emptySources.resolve(createCharacterRecipe(), 'pixel', 'S')).every((issue) => issue.code === 'missing-source')).toBe(true);
    expect(diagnostics(() => registry.resolve({ schemaVersion: 2 }, 'pixel', 'S'))[0]?.code).toBe('invalid-request');
  });

  it('rejects publication gaps, unsafe source metadata and malformed native anchors', () => {
    const catalog = editable();
    const hair = catalog.assets.find((asset) => asset.id === 'hair.short-bob.v1')!;
    delete hair.variants.pixel!.frames.NW;
    hair.status = 'published';
    expect(assetManifestSchema.safeParse(hair).success).toBe(false);
    const head = catalog.assets.find((asset) => asset.id === 'head.soft-oval.v1')!;
    head.variants.pixel!.frames.S![0]!.sprite = '../outside.png';
    expect(assetManifestSchema.safeParse(head).success).toBe(false);
    head.variants.pixel!.frames.S![0]!.sprite = 'safe.png';
    head.variants.pixel!.frames.S![0]!.materialMap!.size.width++;
    expect(assetManifestSchema.safeParse(head).success).toBe(false);
    const eyes = catalog.assets.find((asset) => asset.id === 'eyes.v1')!;
    eyes.variants.pixel!.frames.N![0]!.visibility = 'visible';
    expect(assetManifestSchema.safeParse(eyes).success).toBe(false);
    const fresh = editable();
    fresh.rigs[0]!.frames.S!.head_center.x = 0.5;
    expect(() => createManifestRegistry(fresh)).not.toThrow(); // detailed permits native fractional anchors
    fresh.rigs.find((rig) => rig.target === 'pixel')!.frames.S!.head_center.x = 0.5;
    expect(() => createManifestRegistry(fresh)).toThrow(AssetPlanningError);
    const missingAnchor = JSON.parse(JSON.stringify(createSyntheticCatalog()));
    delete missingAnchor.rigs[0].frames.S.head_center;
    expect(() => createManifestRegistry(missingAnchor)).toThrow(AssetPlanningError);
    const duplicate = editable(); duplicate.assets.push(duplicate.assets[0]!);
    expect(() => createManifestRegistry(duplicate)).toThrow('Duplicate assets');
  });
});
