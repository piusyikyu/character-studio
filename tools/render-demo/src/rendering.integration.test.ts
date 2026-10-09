import { describe, expect, it } from 'vitest';
import { createCharacterRecipe, DIRECTIONS } from '@character-studio/core';
import type { RenderLayer } from '@character-studio/core';
import { createManifestRegistry } from '@character-studio/asset-registry';
import { renderPixel, exportPixelPng, exportPixelSheet, scalePixelPreview } from '@character-studio/renderer-pixel';
import { DEFAULT_PALETTES, OUTLINE, decodePng, encodePng, createPixelSheet } from '@character-studio/render-utils';
import type { RgbaImage, ImageLoader } from '@character-studio/render-utils';
import { createPlaceholderBundle } from './placeholders';

const bundle = createPlaceholderBundle();
const registry = createManifestRegistry(bundle.catalog, { availableSources: [...bundle.images.keys()] });
const load: ImageLoader = async (source) => {
  const image = bundle.images.get(source);
  if (!image) throw new Error(`Missing ${source}`);
  return image;
};
const recipe = createCharacterRecipe({ ancestry: { primary: 'elf', secondary: 'vampire' }, eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.crimson' }, hair: { style: 'long-waves', colour: 'hair.silver' } });
function at(image: RgbaImage, x: number, y: number): number[] { return [...image.data.subarray((y * image.width + x) * 4, (y * image.width + x) * 4 + 4)]; }
function count(image: RgbaImage, rgb: readonly number[]): number {
  let result = 0;
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i] === rgb[0] && image.data[i + 1] === rgb[1] && image.data[i + 2] === rgb[2] && image.data[i + 3] === 255) result++;
  return result;
}

describe('native placeholder rendering and export workflows', () => {
  it('renders all eight pixel facings with isolated palettes, transparency, exact display blocks and reproducible labelled exports', async () => {
    const plans = DIRECTIONS.map((direction) => registry.resolve(recipe, 'pixel', direction));
    expect(registry.coverageIssues()).toEqual([]);
    for (const plan of plans) {
      const image = await renderPixel(plan, load);
      expect([image.width, image.height]).toEqual([128, 192]);
      expect(at(image, 0, 0)).toEqual([0, 0, 0, 0]);
      expect(new Set(image.data.filter((_, i) => i % 4 === 3))).toEqual(new Set([0, 255]));
      expect(count(image, OUTLINE)).toBeGreaterThan(0);
      if (['N', 'NE', 'NW'].includes(plan.direction)) expect(count(image, DEFAULT_PALETTES['eyes.blue']!.base) + count(image, DEFAULT_PALETTES['eyes.crimson']!.base)).toBe(0);
      if (['S', 'SE', 'SW'].includes(plan.direction)) {
        expect(count(image, DEFAULT_PALETTES['eyes.blue']!.base)).toBeGreaterThan(0);
        expect(count(image, DEFAULT_PALETTES['eyes.crimson']!.base)).toBeGreaterThan(0);
        expect(plan.layers.some((layer) => layer.frameId === 'mouth')).toBe(true);
      }
      const exported = decodePng(await exportPixelPng(plan, load));
      expect(at(exported, 0, 0)).toEqual([0, 255, 0, 255]);
      expect(at(exported, 2, 2)).toEqual([255, 255, 0, 255]);
      expect(await exportPixelPng(plan, load)).toEqual(await exportPixelPng(plan, load));
      expect(decodePng(encodePng(image)).data.every((value, i) => value === image.data[i])).toBe(true);
    }
    const front = await renderPixel(plans[4]!, load);
    const alternate = await renderPixel(registry.resolve(createCharacterRecipe({ ancestry: recipe.ancestry, eyes: recipe.eyes, hair: { style: recipe.hair.style, colour: 'hair.gold' } }), 'pixel', 'S'), load);
    const hairColours = new Set(Object.values(DEFAULT_PALETTES['hair.silver']!).map((colour) => colour.join(',')));
    let changed = 0;
    for (let i = 0; i < front.data.length; i += 4) if (front.data.subarray(i, i + 4).some((value, c) => value !== alternate.data[i + c])) { changed++; expect(hairColours.has([...front.data.subarray(i, i + 3)].join(','))).toBe(true); expect(front.data[i + 3]).toBe(alternate.data[i + 3]); }
    expect(changed).toBeGreaterThan(0);
    const preview = scalePixelPreview(front, 3);
    expect([preview.width, preview.height]).toEqual([384, 576]);
    for (const [x, y] of [[0, 0], [64, 35], [64, 100], [50, 140]]) for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) expect(at(preview, x! * 3 + dx, y! * 3 + dy)).toEqual(at(front, x!, y!));
    const sheet = decodePng(await exportPixelSheet([...plans].reverse(), load));
    expect([sheet.width, sheet.height]).toEqual([512, 384]);
    for (let index = 0; index < plans.length; index++) {
      const frame = decodePng(await exportPixelPng(plans[index]!, load));
      let matches = true;
      for (let y = 0; y < 192; y++) {
        const start = ((Math.floor(index / 4) * 192 + y) * 512 + (index % 4) * 128) * 4;
        matches &&= sheet.data.subarray(start, start + 128 * 4).every((value, x) => value === frame.data[y * 128 * 4 + x]);
      }
      expect(matches).toBe(true);
    }
  }, 15_000);

  it('composes transparent layers and a retention mask in exact plan order without changing source buffers', async () => {
    const base = registry.resolve(recipe, 'pixel', 'S');
    const layer: RenderLayer = { assetId: 'probe', assetVersion: 1, frameId: 'bottom', plane: 'head', order: 0, visibility: 'visible', sprite: 'bottom.png', size: { width: 1, height: 1 }, attachTo: 'head_center', origin: { x: 0, y: 0 }, offset: { x: -base.anchors.head_center.x, y: -base.anchors.head_center.y }, position: { x: 0, y: 0 }, palettes: {} };
    const pixels = new Map<string, RgbaImage>([
      ['bottom.png', { width: 1, height: 1, data: new Uint8Array([255, 0, 0, 255]) }],
      ['top.png', { width: 1, height: 1, data: new Uint8Array([0, 0, 255, 128]) }],
      ['cut.png', { width: 1, height: 1, data: new Uint8Array([0, 0, 0, 0]) }],
    ]);
    const probe: ImageLoader = async (source) => pixels.get(source)!;
    const top = { ...layer, frameId: 'top', order: 1, sprite: 'top.png' };
    const image = await renderPixel({ ...base, layers: [layer, top] }, probe);
    expect(at(image, 0, 0)).toEqual([127, 0, 128, 255]);
    const masked = await renderPixel({ ...base, layers: [layer, { ...top, occlusionMask: { source: 'cut.png', size: { width: 1, height: 1 } } }] }, probe);
    expect(at(masked, 0, 0)).toEqual([255, 0, 0, 255]);
    expect([...pixels.get('top.png')!.data]).toEqual([0, 0, 255, 128]);
    expect(at(decodePng(await exportPixelPng({ ...base, layers: [layer] }, probe, { transparent: true })), 127, 191)).toEqual([0, 0, 0, 0]);
  });

  it('rejects missing/incorrect assets, malformed material maps, wrong targets, boundary violations and noninteger placement', async () => {
    const plan = registry.resolve(recipe, 'pixel', 'S');
    await expect(renderPixel(plan, async () => { throw new Error('not found'); })).rejects.toThrow('cannot load');
    await expect(renderPixel(plan, async () => ({ width: 1, height: 1, data: new Uint8Array(4) }))).rejects.toThrow('decoded dimensions');
    const corrupt: ImageLoader = async (source) => {
      const image = await load(source);
      if (!source.includes('materials')) return image;
      const data = image.data.slice(); data[1] = 1;
      return { ...image, data };
    };
    await expect(renderPixel(plan, corrupt)).rejects.toThrow('material-map');
    await expect(renderPixel(registry.resolve(recipe, 'detailed', 'S'), load)).rejects.toThrow('cannot consume');
    const first = plan.layers[0]!;
    await expect(renderPixel({ ...plan, layers: [{ ...first, position: { x: .5, y: 0 } }] }, load)).rejects.toThrow();
    await expect(renderPixel({ ...plan, layers: [{ ...first, position: { x: 128, y: 192 } }] }, load)).rejects.toThrow();
    expect(() => scalePixelPreview({ width: 128, height: 192, data: new Uint8Array(128 * 192 * 4) }, 1.5)).toThrow('integer');
    expect(() => createPixelSheet([])).toThrow('eight directions');
    const mixed = DIRECTIONS.map((direction) => registry.resolve(recipe, 'pixel', direction));
    mixed[0] = registry.resolve(createCharacterRecipe(), 'pixel', 'N');
    await expect(exportPixelSheet(mixed, load)).rejects.toThrow('same recipe');
  });
});
