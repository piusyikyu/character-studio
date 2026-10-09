import { blankImage, decorateExport, drawRgba } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import type { Direction } from '@character-studio/core';
import type { AnchorCandidate } from './schema';

export function checkerPreview(image: RgbaImage, direction: Direction): RgbaImage {
  const result = blankImage(image.width, image.height);
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
    const value = (Math.floor(x / 24) + Math.floor(y / 24)) % 2 ? 195 : 235;
    result.data.set([value, value, value, 255], (y * image.width + x) * 4);
  }
  drawRgba(result, image, 0, 0);
  return decorateExport(result, direction, { transparent: true });
}

export function reviewPreview(checker: RgbaImage, mask: Uint8Array) {
  const image = { ...checker, data: checker.data.slice() };
  for (let p = 0; p < mask.length; p++) {
    if (mask[p]! & 4) image.data.set([255, 0, 64, 255], p * 4);
    else if (mask[p]! & 2) image.data.set([255, 165, 0, 255], p * 4);
    else if (mask[p]! & 1) image.data.set([0, 180, 255, 255], p * 4);
  }
  return image;
}

export function anchorPreview(checker: RgbaImage, anchors: readonly AnchorCandidate[], baseline: number | null) {
  const image = { ...checker, data: checker.data.slice() };
  const put = (x: number, y: number, colour: readonly number[]) => {
    if (x >= 0 && y >= 0 && x < image.width && y < image.height) image.data.set(colour, (y * image.width + x) * 4);
  };
  for (const a of anchors) if (a.position) for (let offset = -10; offset <= 10; offset++) {
    put(a.position.x + offset, a.position.y, [0, 220, 255, 255]);
    put(a.position.x, a.position.y + offset, [0, 220, 255, 255]);
  }
  if (baseline !== null) for (let x = 0; x < image.width; x++) if (x % 12 < 6) put(x, baseline, [255, 170, 0, 255]);
  return image;
}

/** Native contact sheets preserve every original pixel; no facing is reflected. */
export function contactSheet(frames: readonly RgbaImage[]): RgbaImage {
  if (frames.length !== 8) throw new Error('A contact sheet requires eight frames.');
  const first = frames[0]!, sheet = blankImage(first.width * 4, first.height * 2);
  frames.forEach((frame, index) => drawRgba(sheet, frame, (index % 4) * first.width, Math.floor(index / 4) * first.height));
  return sheet;
}

/** Inspection-only thumbnail, never a production pixel sprite or published asset. */
export function overview(image: RgbaImage): RgbaImage {
  const result = blankImage(image.width / 4, image.height / 4);
  for (let y = 0; y < result.height; y++) for (let x = 0; x < result.width; x++) {
    const sums = [0, 0, 0, 0];
    for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) for (let c = 0; c < 4; c++) sums[c]! += image.data[((y * 4 + dy) * image.width + x * 4 + dx) * 4 + c]!;
    result.data.set(sums.map((s) => Math.round(s / 16)), (y * result.width + x) * 4);
  }
  return result;
}
