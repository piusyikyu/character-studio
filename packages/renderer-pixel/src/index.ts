import { blankImage, drawRgba, prepareLayer, validateImage, validateRenderRequest, DEFAULT_PALETTES, decorateExport, encodePng, createPixelSheet } from '@character-studio/render-utils';
import type { ImageLoader, PaletteBank, RgbaImage, ExportOptions } from '@character-studio/render-utils';
import type { RenderPlan, Direction } from '@character-studio/core';

export async function renderPixel(input: RenderPlan, load: ImageLoader, bank: PaletteBank = DEFAULT_PALETTES): Promise<RgbaImage> {
  const plan = validateRenderRequest(input, 'pixel');
  const result = blankImage(128, 192);
  for (const layer of plan.layers) drawRgba(result, await prepareLayer(layer, load, bank), layer.position.x, layer.position.y);
  return result;
}
export async function exportPixelPng(plan: RenderPlan, load: ImageLoader, options: ExportOptions = {}): Promise<Uint8Array> {
  return encodePng(decorateExport(await renderPixel(plan, load), plan.direction, options));
}
export async function exportPixelSheet(plans: readonly RenderPlan[], load: ImageLoader, options: ExportOptions = {}): Promise<Uint8Array> {
  const validated = plans.map((plan) => validateRenderRequest(plan, 'pixel'));
  const first = validated[0];
  if (!first || validated.length !== 8 || new Set(validated.map((plan) => plan.direction)).size !== 8) throw new Error('A pixel sheet requires eight unique directional plans.');
  const identity = JSON.stringify(first.recipe);
  if (validated.some((plan) => plan.catalogVersion !== first.catalogVersion || JSON.stringify(plan.recipe) !== identity)) throw new Error('All pixel sheet plans must use the same recipe and catalog version.');
  const frames: { direction: Direction; image: RgbaImage }[] = [];
  for (const plan of validated) frames.push({ direction: plan.direction, image: await renderPixel(plan, load) });
  return encodePng(createPixelSheet(frames, options));
}

/** Display-only integer nearest-neighbour enlargement; native exports stay unchanged. */
export function scalePixelPreview(image: RgbaImage, scale: number): RgbaImage {
  validateImage(image);
  if (!Number.isInteger(scale) || scale < 1 || scale > 16) throw new Error('Pixel display scale must be an integer from 1 to 16.');
  const output = blankImage(image.width * scale, image.height * scale);
  for (let y = 0; y < output.height; y++) for (let x = 0; x < output.width; x++) {
    const index = (Math.floor(y / scale) * image.width + Math.floor(x / scale)) * 4;
    output.data.set(image.data.subarray(index, index + 4), (y * output.width + x) * 4);
  }
  return output;
}
