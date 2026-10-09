import { DIRECTIONS, RENDER_TARGETS, RENDER_TARGET_SPECS, BODY_PRESETS, HEAD_SHAPES, HAIR_STYLES, FACIAL_EXPRESSIONS, BACK_DIRECTIONS } from '@character-studio/core';
import type { BodyPresetId, Direction, RenderTarget, RenderPlane, Material } from '@character-studio/core';
import { assetCatalogSchema } from '../manifests';
import type { AssetManifest, AssetFrame, RigProfile, AssetCatalog } from '../manifests';

/** Metadata fixtures only: referenced PNGs intentionally do not exist. */
export function createSyntheticCatalog(): AssetCatalog {
  const assets: AssetManifest[] = [];
  const bindings: { key: string; assetIds: string[] }[] = [];
  const rigs: RigProfile[] = [];
  for (const bodyPreset of BODY_PRESETS) {
    for (const target of RENDER_TARGETS) {
      const spec = RENDER_TARGET_SPECS[target];
      const detailed = target === 'detailed';
      const frames: Partial<Record<Direction, NonNullable<RigProfile['frames'][Direction]>>> = {};
      for (const direction of DIRECTIONS) {
        // Explicit native anchor tables per target; no sprite downsampling or flipping.
        const center = detailed ? 512 : 64;
        const rear = BACK_DIRECTIONS.includes(direction);
        const left = rear ? (detailed ? 650 : 82) : (detailed ? 374 : 46);
        const right = rear ? (detailed ? 374 : 46) : (detailed ? 650 : 82);
        frames[direction] = {
          head_center: { x: center, y: detailed ? 300 : 36 },
          neck_base: { x: center, y: detailed ? 432 : 54 },
          shoulder_left: { x: left, y: detailed ? 480 : 60 }, shoulder_right: { x: right, y: detailed ? 480 : 60 },
          chest_center: { x: center, y: detailed ? (bodyPreset === 'slender' ? 620 : 640) : (bodyPreset === 'slender' ? 76 : 80) },
          waist_center: { x: center, y: detailed ? 840 : 108 },
          hip_left: { x: left, y: detailed ? 960 : 122 }, hip_right: { x: right, y: detailed ? 960 : 122 },
          hand_left: { x: left, y: detailed ? 980 : 124 }, hand_right: { x: right, y: detailed ? 980 : 124 },
          foot_left: { x: left, y: detailed ? 1480 : 184 }, foot_right: { x: right, y: detailed ? 1480 : 184 },
          ground_baseline: { x: center, y: detailed ? 1480 : 184 },
        };
      }
      rigs.push({ rig: 'female-humanoid-v1', bodyPreset, target, pose: spec.pose, frames });
    }
  }

  function frame(id: string, frameId: string, target: RenderTarget, direction: Direction, plane: RenderPlane, material: Material, visibility: AssetFrame['visibility'] = 'visible'): AssetFrame {
    const size = target === 'detailed' ? { width: 64, height: 96 } : { width: 8, height: 12 };
    const path = `synthetic/${id}/${target}/${direction}-${frameId}`;
    return {
      id: frameId, sprite: `${path}.png`, size, plane, order: 0, visibility,
      attachTo: 'head_center', origin: target === 'detailed' ? { x: 32, y: 48 } : { x: 4, y: 6 }, offset: { x: 0, y: 0 },
      materialMap: { source: `${path}-materials.png`, size, regions: [
        { index: 1, material, shade: 'shadow' }, { index: 2, material, shade: 'base' }, { index: 3, material, shade: 'highlight' },
      ] },
    };
  }

  function add(key: string | undefined, id: string, category: AssetManifest['category'], makeFrames: (target: RenderTarget, direction: Direction) => AssetFrame[], bodies: readonly BodyPresetId[] = BODY_PRESETS, requiresTraits: AssetManifest['requiresTraits'] = []) {
    const variants: Partial<Record<RenderTarget, NonNullable<AssetManifest['variants'][RenderTarget]>>> = {};
    for (const target of RENDER_TARGETS) {
      variants[target] = { pose: RENDER_TARGET_SPECS[target].pose, frames: Object.fromEntries(DIRECTIONS.map((direction) => [direction, makeFrames(target, direction)])) };
    }
    assets.push({ schemaVersion: 1, id, assetVersion: 1, status: 'draft', category,
      compatibleRigs: ['female-humanoid-v1'], compatibleBodies: bodies, requiresTraits, excludesTraits: [],
      materialSlots: ['skin', 'hair', 'left-eye', 'right-eye', 'outfit'], variants });
    if (key) bindings.push({ key, assetIds: [id] });
  }

  for (const body of BODY_PRESETS) {
    const id = `body.${body}.v1`;
    add(`body.${body}`, id, body === 'balanced' ? 'base-body' : 'body-variant', (target, direction) => {
      const cell = frame(id, 'torso', target, direction, 'body-torso', 'skin');
      const size = target === 'detailed' ? { width: 480, height: 1104 } : { width: 48, height: 148 };
      return [{ ...cell, size, attachTo: 'chest_center', origin: target === 'detailed' ? { x: 240, y: body === 'slender' ? 244 : 264 } : { x: 24, y: body === 'slender' ? 40 : 44 }, materialMap: { ...cell.materialMap!, size } }];
    }, [body]);
  }
  for (const head of HEAD_SHAPES) {
    const id = `head.${head}.v1`;
    add(`head.${head}`, id, 'head', (target, direction) => [frame(id, 'head', target, direction, 'head', 'skin')]);
  }
  add('eyes', 'eyes.v1', 'facial-feature', (target, direction) => {
    const rear = BACK_DIRECTIONS.includes(direction);
    return [
      frame('eyes.v1', 'left', target, direction, 'eyes', 'left-eye', rear || direction === 'W' ? 'hidden' : 'visible'),
      frame('eyes.v1', 'right', target, direction, 'eyes', 'right-eye', rear || direction === 'E' ? 'hidden' : 'visible'),
    ];
  });
  for (const expression of FACIAL_EXPRESSIONS) {
    const id = `face.${expression}.v1`;
    add(`face.${expression}`, id, 'facial-feature', (target, direction) => [
      frame(id, 'brows', target, direction, 'eyebrows', 'skin', 'front-only'),
      frame(id, 'mouth', target, direction, 'mouth', 'skin', 'front-only'),
    ]);
  }
  for (const ears of ['rounded-ears', 'pointed-ears'] as const) {
    const id = `ears.${ears}.v1`;
    add(`ears.${ears}`, id, 'ears', (target, direction) => [frame(id, 'ears', target, direction, 'ears', 'skin')], BODY_PRESETS, [ears]);
  }
  add('trait.fangs', 'fangs.v1', 'facial-feature', (target, direction) => [frame('fangs.v1', 'fangs', target, direction, 'mouth', 'skin', 'front-only')], BODY_PRESETS, ['fangs']);
  for (const style of HAIR_STYLES) {
    const id = `hair.${style}.v1`;
    add(`hair.${style}`, id, 'hair', (target, direction) => [frame(id, 'rear', target, direction, 'hair-rear', 'hair'), frame(id, 'front', target, direction, 'hair-front', 'hair')]);
  }
  for (const body of BODY_PRESETS) {
    const id = `outfit.${body}.v1`;
    const key = `outfit.starter-outfit.${body}`;
    add(key, id, 'outfit', (target, direction) => [{ ...frame(id, 'torso', target, direction, 'outfit-torso', 'outfit'), attachTo: 'chest_center' }], [body]);
    const piece = `outfit-piece.${body}.v1`;
    add(undefined, piece, 'outfit-piece', (target, direction) => {
      const back = frame(piece, 'back', target, direction, 'outfit-back', 'outfit');
      return [
        { ...back, attachTo: 'waist_center', occlusionMask: { source: `synthetic/${piece}/${target}/${direction}-mask.png`, size: back.size } },
        { ...frame(piece, 'front-opening', target, direction, 'outfit-front', 'outfit', 'front-only'), attachTo: 'waist_center' },
      ];
    }, [body]);
    bindings.find((binding) => binding.key === key)!.assetIds.push(piece);
  }
  // Category fixtures only; the current recipe selects no horns, wings or tail.
  for (const [category, plane] of [['horns', 'horns'], ['wings', 'wing-rear'], ['tail', 'tail-rear']] as const) {
    const id = `${category}.fixture.v1`;
    add(undefined, id, category, (target, direction) => [frame(id, 'part', target, direction, plane, 'skin')]);
  }
  return assetCatalogSchema.parse({ schemaVersion: 1, catalogVersion: 'synthetic.v1', assets, bindings, rigs });
}
