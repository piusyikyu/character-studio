import { DIRECTIONS, RENDER_TARGETS, BODY_PRESETS, HEAD_SHAPES, HAIR_STYLES, FACIAL_EXPRESSIONS, BACK_DIRECTIONS, RENDER_TARGET_SPECS } from '@character-studio/core';
import type { Direction, RenderTarget, RenderPlane, Material } from '@character-studio/core';
import { assetCatalogSchema } from '@character-studio/asset-registry';
import type { AssetCatalog, AssetManifest, AssetFrame, RigProfile } from '@character-studio/asset-registry';
import { blankImage, OUTLINE } from '@character-studio/render-utils';
import type { RgbaImage, Rgb } from '@character-studio/render-utils';

// Independent native authoring tables. No target derives art by scaling another,
// and no facing derives pixels by reflecting another facing.
const PIXEL = {
  N: [64, 36, 26, 20, 0], NE: [61, 37, 24, 19, -2], E: [68, 38, 18, 16, 4],
  SE: [66, 36, 24, 19, 2], S: [64, 35, 28, 20, 0], SW: [62, 36, 24, 19, -2],
  W: [59, 38, 19, 17, -4], NW: [67, 37, 24, 19, 2],
} as const;
const DETAILED = {
  N: [512, 298, 240, 136, 0], NE: [488, 306, 206, 124, -16], E: [550, 314, 148, 110, 30],
  SE: [538, 298, 218, 128, 15], S: [512, 292, 244, 140, 0], SW: [484, 302, 220, 130, -18],
  W: [472, 310, 154, 112, -32], NW: [542, 304, 208, 126, 18],
} as const;
type Brush = ReturnType<typeof brush>;
function brush(width: number, height: number) {
  const image = blankImage(width, height), map = blankImage(width, height);
  function dot(x: number, y: number, code: number, colour: Rgb = code === 0 ? OUTLINE : [150, 150, 150], alpha = 255) {
    if (x < 0 || y < 0 || x >= width || y >= height) throw new Error('Placeholder brush crossed its native bounds.');
    const i = (y * width + x) * 4;
    image.data.set([...colour, alpha], i); map.data.set([code, 0, 0, alpha], i);
  }
  function rect(x: number, y: number, w: number, h: number, code = 2, colour?: Rgb, alpha = 255) {
    for (let row = y; row < y + h; row++) for (let column = x; column < x + w; column++) dot(column, row, code, colour, alpha);
  }
  function box(x: number, y: number, w: number, h: number, border = 1) {
    rect(x, y, w, h, 0); rect(x + border, y + border, w - 2 * border, h - 2 * border);
    if (w > border * 4) rect(x + border, y + border, border, h - border * 2, 3);
  }
  function oval(border = 1) {
    const rx = width / 2, ry = height / 2;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (((x + .5 - rx) / rx) ** 2 + ((y + .5 - ry) / ry) ** 2 > 1) continue;
      const inside = ((x + .5 - rx) / Math.max(1, rx - border)) ** 2 + ((y + .5 - ry) / Math.max(1, ry - border)) ** 2 <= 1;
      dot(x, y, inside ? (x < width / 3 ? 3 : x > width * .7 ? 1 : 2) : 0);
    }
  }
  return { image, map, dot, rect, box, oval };
}

export function createPlaceholderBundle(): { readonly catalog: AssetCatalog; readonly images: ReadonlyMap<string, RgbaImage> } {
  const images = new Map<string, RgbaImage>();
  const assets: AssetManifest[] = [], rigs: RigProfile[] = [];
  const bindings: { key: string; assetIds: string[] }[] = [];
  function geometry(target: RenderTarget, direction: Direction, slender = false) {
    const detailed = target === 'detailed';
    const [hx, hy, torsoWidth, headWidth, faceShift] = detailed ? DETAILED[direction] : PIXEL[direction];
    return { detailed, hx, hy, faceShift, headWidth, headHeight: detailed ? 164 : 22,
      bodyWidth: torsoWidth - (slender ? detailed ? 20 : 2 : 0),
      cx: detailed ? 512 : 64, chestY: detailed ? 640 : 80, waistY: detailed ? 904 : 112,
      shoulderY: detailed ? 580 : 62, baseline: detailed ? 1480 : 184,
    };
  }
  for (const bodyPreset of BODY_PRESETS) for (const target of RENDER_TARGETS) {
    const frames: Partial<Record<Direction, NonNullable<RigProfile['frames'][Direction]>>> = {};
    for (const direction of DIRECTIONS) {
      const g = geometry(target, direction, bodyPreset === 'slender');
      const rear = BACK_DIRECTIONS.includes(direction);
      const left = g.cx + (rear ? 1 : -1) * Math.floor(g.bodyWidth / 2);
      const right = g.cx + (rear ? -1 : 1) * Math.floor(g.bodyWidth / 2);
      frames[direction] = {
        head_center: { x: g.hx, y: g.hy }, neck_base: { x: g.cx, y: g.detailed ? 432 : 54 },
        shoulder_left: { x: left, y: g.shoulderY }, shoulder_right: { x: right, y: g.shoulderY },
        chest_center: { x: g.cx, y: g.chestY }, waist_center: { x: g.cx, y: g.waistY },
        hip_left: { x: left, y: g.waistY + (g.detailed ? 50 : 6) }, hip_right: { x: right, y: g.waistY + (g.detailed ? 50 : 6) },
        hand_left: { x: g.detailed ? (rear ? 916 : 108) : left, y: g.detailed ? 580 : 118 },
        hand_right: { x: g.detailed ? (rear ? 108 : 916) : right, y: g.detailed ? 580 : 118 },
        foot_left: { x: left, y: g.baseline }, foot_right: { x: right, y: g.baseline }, ground_baseline: { x: g.cx, y: g.baseline },
      };
    }
    rigs.push({ rig: 'female-humanoid-v1', bodyPreset, target, pose: RENDER_TARGET_SPECS[target].pose, frames });
  }
  function add(key: string | undefined, id: string, category: AssetManifest['category'], body: AssetManifest['compatibleBodies'], material: Material, make: (target: RenderTarget, direction: Direction, cell: (frameId: string, plane: RenderPlane, x: number, y: number, w: number, h: number, draw: (b: Brush) => void, visibility?: AssetFrame['visibility'], role?: Material) => AssetFrame) => AssetFrame[], requiresTraits: AssetManifest['requiresTraits'] = []) {
    const variants: Partial<Record<RenderTarget, NonNullable<AssetManifest['variants'][RenderTarget]>>> = {};
    const materials = new Set<Material>();
    for (const target of RENDER_TARGETS) {
      const frames: Partial<Record<Direction, readonly AssetFrame[]>> = {};
      for (const direction of DIRECTIONS) {
        const g = geometry(target, direction);
        frames[direction] = make(target, direction, (frameId, plane, x, y, width, height, draw, visibility = 'visible', role = material) => {
          const b = brush(width, height); draw(b);
          const sprite = `${target}/placeholder-v1/${id}/${direction}-${frameId}.png`;
          const map = `${target}/placeholder-v1/${id}/${direction}-${frameId}-materials.png`;
          images.set(sprite, b.image); images.set(map, b.map); materials.add(role);
          const origin = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
          return { id: frameId, sprite, size: { width, height }, plane, order: 0, visibility, attachTo: 'head_center', origin,
            offset: { x: x + origin.x - g.hx, y: y + origin.y - g.hy },
            materialMap: { source: map, size: { width, height }, regions: [{ index: 1, material: role, shade: 'shadow' }, { index: 2, material: role, shade: 'base' }, { index: 3, material: role, shade: 'highlight' }] },
          };
        });
      }
      variants[target] = { pose: RENDER_TARGET_SPECS[target].pose, frames };
    }
    assets.push({ schemaVersion: 1, id, assetVersion: 1, status: 'draft', category, compatibleRigs: ['female-humanoid-v1'], compatibleBodies: body, requiresTraits, excludesTraits: [], materialSlots: [...materials], variants });
    if (key) bindings.push({ key, assetIds: [id] });
  }
  for (const body of BODY_PRESETS) {
    add(`body.${body}`, `body.${body}.placeholder`, body === 'balanced' ? 'base-body' : 'body-variant', [body], 'skin', (target, direction, cell) => {
      const g = geometry(target, direction, body === 'slender');
      const d = g.detailed, w = g.bodyWidth, border = d ? 5 : 1;
      const torsoTop = d ? 512 : 60, torsoHeight = d ? 410 : 56;
      const result = [
        cell('neck', 'neck', g.cx - (d ? 36 : 4), d ? 356 : 46, d ? 72 : 8, d ? 200 : 22, (b) => b.box(0, 0, b.image.width, b.image.height, border)),
        cell('torso', 'body-torso', g.cx - Math.floor(w / 2), torsoTop, w, torsoHeight, (b) => b.box(0, 0, w, torsoHeight, border)),
        cell('legs', 'body-front-leg', g.cx - (d ? 92 : 11), g.waistY, d ? 184 : 22, g.baseline - g.waistY, (b) => {
          const legW = d ? 76 : 9;
          b.box(0, 0, legW, b.image.height, border); b.box(b.image.width - legW, 0, legW, b.image.height, border);
        }),
      ];
      if (d) {
        const side = direction === 'E' || direction === 'W';
        const armW = side ? 220 : 410;
        result.push(cell('arms', 'body-front-arm', g.cx - armW, 536, armW * 2, 100, (b) => { b.box(0, 0, armW - Math.floor(w / 2) + 8, 100, 5); b.box(armW + Math.floor(w / 2) - 8, 0, armW - Math.floor(w / 2) + 8, 100, 5); }));
      } else {
        result.push(cell('arms', 'body-front-arm', g.cx - Math.floor(w / 2) - 7, 62, w + 14, 58, (b) => { b.box(0, 0, 7, 58); b.box(b.image.width - 7, 0, 7, 58); }));
      }
      return result;
    });
  }
  for (const shape of HEAD_SHAPES) add(`head.${shape}`, `head.${shape}.placeholder`, 'head', BODY_PRESETS, 'skin', (target, direction, cell) => {
    const g = geometry(target, direction), w = g.headWidth, h = g.headHeight;
    return [cell('head', 'head', g.hx - Math.floor(w / 2), g.hy - Math.floor(h / 2), w, h, (b) => shape === 'soft-oval' ? b.oval(g.detailed ? 5 : 1) : b.box(0, 0, w, h, g.detailed ? 5 : 1))];
  });
  for (const trait of ['rounded-ears', 'pointed-ears'] as const) add(`ears.${trait}`, `ears.${trait}.placeholder`, 'ears', BODY_PRESETS, 'skin', (target, direction, cell) => {
    const g = geometry(target, direction), ew = g.detailed ? (trait === 'pointed-ears' ? 30 : 20) : (trait === 'pointed-ears' ? 5 : 3), h = g.detailed ? 42 : 6;
    return [cell('ears', 'ears', g.hx - Math.floor(g.headWidth / 2) - ew, g.hy - Math.floor(h / 2), g.headWidth + ew * 2, h, (b) => { b.box(0, 0, ew, h, g.detailed ? 3 : 1); b.box(b.image.width - ew, 0, ew, h, g.detailed ? 3 : 1); })];
  }, [trait]);
  add('eyes', 'eyes.placeholder', 'facial-feature', BODY_PRESETS, 'left-eye', (target, direction, cell) => {
    const g = geometry(target, direction), d = g.detailed, rear = BACK_DIRECTIONS.includes(direction), w = d ? 16 : 3, h = d ? 12 : 3;
    return (['left', 'right'] as const).map((side) => cell(side, 'eyes', g.hx + g.faceShift + (side === 'left' ? -1 : 1) * (d ? 28 : 4) - Math.floor(w / 2), g.hy - (d ? 12 : 2), w, h,
      (b) => { b.rect(0, 0, w, h, 0, [243, 240, 250]); b.rect(d ? 4 : 1, 0, d ? 8 : 1, h); }, rear || (direction === 'E' && side === 'right') || (direction === 'W' && side === 'left') ? 'hidden' : 'visible', side === 'left' ? 'left-eye' : 'right-eye'));
  });
  for (const expression of FACIAL_EXPRESSIONS) add(`face.${expression}`, `face.${expression}.placeholder`, 'facial-feature', BODY_PRESETS, 'skin', (target, direction, cell) => {
    const g = geometry(target, direction), d = g.detailed, w = d ? 50 : 7, h = d ? 6 : 1;
    return [cell('mouth', 'mouth', g.hx + g.faceShift - Math.floor(w / 2), g.hy + (d ? 36 : 6), w, h, (b) => b.rect(0, 0, w, h, 0, expression === 'stern' ? OUTLINE : [134, 51, 75]), 'front-only')];
  });
  add('trait.fangs', 'fangs.placeholder', 'facial-feature', BODY_PRESETS, 'skin', (target, direction, cell) => {
    const g = geometry(target, direction), d = g.detailed, w = d ? 36 : 5, h = d ? 10 : 2;
    return [cell('fangs', 'mouth', g.hx + g.faceShift - Math.floor(w / 2), g.hy + (d ? 40 : 6), w, h, (b) => { b.rect(0, 0, d ? 8 : 1, h, 0, [248, 242, 224]); b.rect(w - (d ? 8 : 1), 0, d ? 8 : 1, h, 0, [248, 242, 224]); }, 'front-only')];
  }, ['fangs']);
  for (const style of HAIR_STYLES) add(`hair.${style}`, `hair.${style}.placeholder`, 'hair', BODY_PRESETS, 'hair', (target, direction, cell) => {
    const g = geometry(target, direction), d = g.detailed, w = g.headWidth + (d ? 30 : 6), top = g.hy - Math.floor(g.headHeight / 2) - (d ? 10 : 2), h = style === 'long-waves' ? (d ? 440 : 60) : (d ? 190 : 27);
    const rear = cell('rear', 'hair-rear', g.hx - Math.floor(w / 2), top, w, h, (b) => {
      b.box(0, 0, w, h, d ? 5 : 1);
      if (!BACK_DIRECTIONS.includes(direction)) { // transparent facial opening in front/profile artwork
        const cutX = d ? 18 : 4, cutY = d ? 44 : 6, cutH = d ? 134 : 18;
        for (let y = cutY; y < Math.min(h - 1, cutY + cutH); y++) for (let x = cutX; x < w - cutX; x++) { const i = (y * w + x) * 4; b.image.data.fill(0, i, i + 4); b.map.data.fill(0, i, i + 4); }
      }
    });
    const frontH = d ? 48 : 7;
    const front = cell('front', 'hair-front', g.hx - Math.floor(w / 2), top, w, frontH, (b) => b.box(0, 0, w, frontH, d ? 4 : 1));
    return [rear, front];
  });
  for (const body of BODY_PRESETS) {
    const key = `outfit.starter-outfit.${body}`, id = `outfit.${body}.placeholder`;
    add(key, id, 'outfit', [body], 'outfit', (target, direction, cell) => {
      const g = geometry(target, direction, body === 'slender'), d = g.detailed, w = g.bodyWidth + (d ? 8 : 2), h = d ? 374 : 47;
      return [cell('torso', 'outfit-torso', g.cx - Math.floor(w / 2), d ? 548 : 65, w, h, (b) => { b.box(0, 0, w, h, d ? 5 : 1); if (d) b.rect(6, 6, w - 12, 8, 3, undefined, 128); })];
    });
    const pieceId = `outfit-piece.${body}.placeholder`;
    add(undefined, pieceId, 'outfit-piece', [body], 'outfit', (target, direction, cell) => {
      const g = geometry(target, direction, body === 'slender'), d = g.detailed, w = g.bodyWidth + (d ? 56 : 10), h = d ? 432 : 45;
      const back = cell('skirt', BACK_DIRECTIONS.includes(direction) ? 'outfit-back' : 'outfit-front', g.cx - Math.floor(w / 2), g.waistY - (d ? 12 : 1), w, h, (b) => b.box(0, 0, w, h, d ? 5 : 1));
      const trimW = d ? 10 : 1;
      const trim = cell('front-pleat', 'outfit-front', g.cx + g.faceShift, g.waistY, trimW, h - (d ? 20 : 2), (b) => b.rect(0, 0, trimW, b.image.height, 3), 'front-only');
      return [back, trim];
    });
    bindings.find((binding) => binding.key === key)!.assetIds.push(pieceId);
  }
  return { catalog: assetCatalogSchema.parse({ schemaVersion: 1, catalogVersion: 'placeholder.v1', assets, bindings, rigs }), images };
}
