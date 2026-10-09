import { decode, encode } from 'fast-png';
import { DIRECTIONS, renderPlanSchema } from '@character-studio/core';
import type { Direction, RenderLayer, RenderPlan } from '@character-studio/core';

export interface RgbaImage { readonly width: number; readonly height: number; readonly data: Uint8Array }
export type ImageLoader = (source: string) => Promise<RgbaImage>;
export type Rgb = readonly [number, number, number];
export type Shade = NonNullable<RenderLayer['materialMap']>['regions'][number]['shade'];
export type Palette = Readonly<Record<Shade, Rgb>>;
export type PaletteBank = Readonly<Record<string, Palette>>;
const ramp = (deep: Rgb, shadow: Rgb, base: Rgb, highlight: Rgb, bright: Rgb): Palette => Object.freeze({ 'shadow-deep': Object.freeze(deep), shadow: Object.freeze(shadow), base: Object.freeze(base), highlight: Object.freeze(highlight), 'highlight-bright': Object.freeze(bright) });
export const DEFAULT_PALETTES: PaletteBank = Object.freeze({
  'skin.light': ramp([99, 65, 77], [181, 121, 111], [241, 195, 165], [255, 219, 186], [255, 237, 212]),
  'skin.warm': ramp([80, 48, 66], [158, 92, 76], [218, 150, 106], [245, 184, 134], [255, 214, 169]),
  'skin.deep': ramp([42, 31, 55], [77, 43, 47], [130, 77, 59], [166, 105, 73], [204, 146, 103]),
  'hair.black': ramp([17, 17, 40], [28, 27, 50], [44, 40, 65], [67, 59, 83], [98, 82, 113]),
  'hair.chestnut': ramp([40, 26, 45], [73, 36, 43], [117, 61, 47], [163, 91, 56], [199, 124, 80]),
  'hair.gold': ramp([58, 39, 57], [132, 83, 48], [216, 161, 62], [248, 208, 105], [255, 234, 158]),
  'hair.silver': ramp([45, 38, 74], [105, 92, 136], [176, 169, 207], [221, 215, 239], [245, 239, 255]),
  'eyes.brown': ramp([27, 21, 46], [62, 37, 35], [114, 72, 42], [174, 123, 61], [229, 185, 105]),
  'eyes.blue': ramp([24, 23, 58], [36, 68, 116], [66, 143, 215], [116, 199, 245], [194, 235, 255]),
  'eyes.green': ramp([21, 26, 46], [36, 74, 65], [64, 149, 94], [116, 197, 126], [187, 233, 162]),
  'eyes.gold': ramp([46, 24, 49], [118, 65, 31], [229, 163, 38], [255, 206, 95], [255, 238, 174]),
  'eyes.crimson': ramp([43, 20, 46], [114, 31, 57], [208, 55, 77], [241, 115, 130], [255, 184, 191]),
  'outfit.charcoal': ramp([19, 19, 44], [37, 36, 60], [66, 65, 87], [99, 96, 120], [141, 135, 161]),
  'outfit.ink': ramp([16, 17, 43], [29, 33, 70], [47, 61, 107], [71, 100, 148], [113, 151, 196]),
});
export const OUTLINE: Rgb = Object.freeze([26, 24, 53]);

export function validateImage(image: RgbaImage, source = 'image'): void {
  if (!Number.isSafeInteger(image.width) || !Number.isSafeInteger(image.height) || image.width <= 0 || image.height <= 0 || !(image.data instanceof Uint8Array) || image.data.length !== image.width * image.height * 4) throw new Error(`${source}: expected native RGBA8 data matching width × height.`);
}
export function blankImage(width: number, height: number): RgbaImage {
  const image = { width, height, data: new Uint8Array(width * height * 4) };
  validateImage(image);
  return image;
}
export function encodePng(image: RgbaImage): Uint8Array {
  validateImage(image);
  return encode({ width: image.width, height: image.height, data: image.data, channels: 4, depth: 8 }, { zlib: { level: 9 } });
}
export function decodePng(bytes: Uint8Array): RgbaImage {
  const image = decode(bytes, { checkCrc: true });
  if (image.channels !== 4 || image.depth !== 8 || image.palette) throw new Error('Assets must be non-indexed RGBA8 PNGs; material indices live in the material-map red channel.');
  const result = { width: image.width, height: image.height, data: new Uint8Array(image.data) };
  validateImage(result);
  return result;
}
export function validateRenderRequest(input: unknown, target: RenderPlan['target']): RenderPlan {
  const plan = renderPlanSchema.parse(input);
  if (plan.target !== target) throw new Error(`The ${target} renderer cannot consume a ${plan.target} plan.`);
  return plan;
}

export async function prepareLayer(layer: RenderLayer, load: ImageLoader, bank: PaletteBank = DEFAULT_PALETTES): Promise<RgbaImage> {
  const loadNative = async (source: string) => {
    let image: RgbaImage;
    try { image = await load(source); } catch (error) { throw new Error(`${layer.assetId}/${layer.frameId}: cannot load ${source}.`, { cause: error }); }
    validateImage(image, source);
    if (image.width !== layer.size.width || image.height !== layer.size.height) throw new Error(`${source}: decoded dimensions differ from the manifest.`);
    return image;
  };
  const [source, map, mask] = await Promise.all([
    loadNative(layer.sprite), layer.materialMap ? loadNative(layer.materialMap.source) : undefined,
    layer.occlusionMask ? loadNative(layer.occlusionMask.source) : undefined,
  ]);
  const result: RgbaImage = { width: source.width, height: source.height, data: source.data.slice() };
  const regions = new Map(layer.materialMap?.regions.map((region) => [region.index, region]));
  for (let i = 0; i < result.data.length; i += 4) {
    const alpha = source.data[i + 3]!;
    if (map) {
      const index = map.data[i]!;
      if (map.data[i + 1] !== 0 || map.data[i + 2] !== 0 || map.data[i + 3] !== alpha || (alpha === 0 && index !== 0)) throw new Error(`${layer.materialMap!.source}: material-map codes/alpha do not align with the source at pixel ${i / 4}.`);
      if (index !== 0) {
        const region = regions.get(index);
        if (!region) throw new Error(`${layer.materialMap!.source}: undeclared material index ${index}.`);
        const paletteId = layer.palettes[region.material];
        const colour = paletteId && bank[paletteId]?.[region.shade];
        if (!colour || colour.length !== 3 || colour.some((channel) => !Number.isInteger(channel) || channel < 0 || channel > 255)) throw new Error(`${layer.assetId}: missing/invalid ${paletteId} ${region.shade} palette.`);
        result.data.set(colour, i);
      }
    }
    // Layer-local retention mask: 255 keeps, 0 cuts; never erases earlier layers.
    result.data[i + 3] = mask ? Math.round(alpha * mask.data[i + 3]! / 255) : alpha;
    if (result.data[i + 3] === 0) result.data.fill(0, i, i + 4);
  }
  return result;
}

/** Integer source-over in straight RGBA, without sampling or transforms. */
export function drawRgba(destination: RgbaImage, source: RgbaImage, x: number, y: number): void {
  validateImage(destination); validateImage(source);
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x + source.width > destination.width || y + source.height > destination.height) throw new Error('Native draw rectangle must use integer coordinates and fit the canvas.');
  for (let row = 0; row < source.height; row++) for (let column = 0; column < source.width; column++) {
    const s = (row * source.width + column) * 4;
    const d = ((row + y) * destination.width + column + x) * 4;
    const sa = source.data[s + 3]!;
    if (sa === 0) continue;
    if (sa === 255 || destination.data[d + 3] === 0) { destination.data.set(source.data.subarray(s, s + 4), d); continue; }
    const da = destination.data[d + 3]!;
    const numerator = sa * 255 + da * (255 - sa);
    for (let channel = 0; channel < 3; channel++) destination.data[d + channel] = Math.round((source.data[s + channel]! * sa * 255 + destination.data[d + channel]! * da * (255 - sa)) / numerator);
    destination.data[d + 3] = Math.round(numerator / 255);
  }
}

const GLYPHS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  N: ['10001', '11001', '10101', '10011', '10001'], E: ['11111', '10000', '11110', '10000', '11111'],
  S: ['11111', '10000', '11111', '00001', '11111'], W: ['10001', '10001', '10101', '11011', '10001'],
});
export interface ExportOptions { readonly transparent?: boolean }
export function decorateExport(image: RgbaImage, direction: Direction, options: ExportOptions = {}): RgbaImage {
  validateImage(image);
  if (!DIRECTIONS.includes(direction)) throw new Error('Unknown export direction.');
  const result = blankImage(image.width, image.height);
  if (!options.transparent) for (let i = 0; i < result.data.length; i += 4) result.data.set([0, 255, 0, 255], i);
  drawRgba(result, image, 0, 0);
  const scale = image.width === 1024 ? 4 : 1;
  for (const [letterIndex, letter] of [...direction].entries()) for (const [row, line] of GLYPHS[letter]!.entries()) for (let column = 0; column < line.length; column++) {
    if (line[column] !== '1') continue;
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const x = (2 + letterIndex * 6 + column) * scale + dx;
      const y = (2 + row) * scale + dy;
      if (x >= result.width || y >= result.height) throw new Error('Direction label does not fit the export.');
      result.data.set([255, 255, 0, 255], (y * result.width + x) * 4);
    }
  }
  return result;
}
export function createPixelSheet(frames: readonly { readonly direction: Direction; readonly image: RgbaImage }[], options: ExportOptions = {}): RgbaImage {
  if (frames.length !== 8 || new Set(frames.map((frame) => frame.direction)).size !== 8) throw new Error('A pixel sheet requires exactly one frame for each of the eight directions.');
  const sheet = blankImage(512, 384);
  DIRECTIONS.forEach((direction, index) => {
    const frame = frames.find((entry) => entry.direction === direction);
    if (!frame || frame.image.width !== 128 || frame.image.height !== 192) throw new Error('Pixel sheet cells must be native 128 × 192 images.');
    drawRgba(sheet, decorateExport(frame.image, direction, options), (index % 4) * 128, Math.floor(index / 4) * 192);
  });
  return sheet;
}
