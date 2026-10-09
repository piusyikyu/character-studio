import { blankImage, validateImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import type { BackgroundCorrection, Rectangle, ReferenceImportSettings } from './schema';

export function inside(index: number, width: number, rectangles: readonly Rectangle[]): boolean {
  const x = index % width, y = Math.floor(index / width);
  return rectangles.some((r) => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height);
}

/** Deterministic Manhattan nearest-seed propagation, bounded to a narrow edge band. */
function nearestSeeds(width: number, height: number, seeds: Uint8Array, radius: number) {
  const length = width * height, owner = new Int32Array(length).fill(-1), distance = new Uint8Array(length).fill(255), queue = new Int32Array(length);
  let head = 0, tail = 0;
  for (let p = 0; p < length; p++) if (seeds[p]) { owner[p] = p; distance[p] = 0; queue[tail++] = p; }
  while (head < tail) {
    const p = queue[head++]!;
    if (distance[p]! >= radius) continue;
    const x = p % width;
    for (const q of [x > 0 ? p - 1 : -1, x + 1 < width ? p + 1 : -1, p - width, p + width]) {
      if (q < 0 || q >= length || owner[q] !== -1) continue;
      owner[q] = owner[p]!; distance[q] = distance[p]! + 1; queue[tail++] = q;
    }
  }
  return { owner, distance };
}

export interface MatteResult {
  readonly image: RgbaImage;
  readonly reviewMask: Uint8Array; // 1: estimated edge, 2: uncertain foreground, 4: residual green
  readonly labelsRemoved: number;
  readonly changedRgbPixels: number;
  readonly fallbackBackgroundPixels: number;
  readonly backgroundColour: readonly number[];
  readonly backgroundSeeds: Uint8Array;
}

/** Conservative chroma matte; never filters, moves, resizes or fills foreground artwork. */
export function matteReference(source: RgbaImage, labels: readonly Rectangle[], settings: ReferenceImportSettings['matte'], corrections: readonly BackgroundCorrection[] = []): MatteResult {
  validateImage(source);
  const { width, height, data } = source, length = width * height;
  const foreground = new Uint8Array(length), screen = new Uint8Array(length);
  let labelsRemoved = 0;
  for (let p = 0; p < length; p++) {
    const i = p * 4, r = data[i]!, g = data[i + 1]!, b = data[i + 2]!, excess = g - Math.max(r, b);
    if (inside(p, width, labels)) { if (data[i + 3] && excess <= settings.greenExcess) labelsRemoved++; continue; }
    if (!data[i + 3]) continue;
    if (excess <= settings.greenExcess) foreground[p] = 1;
    else {
      const correction = corrections.find((c) => inside(p, width, [c.region]));
      if (g >= settings.backgroundMinGreen && Math.max(r, b) <= (correction?.maxRedBlue ?? settings.backgroundMaxRedBlue)) screen[p] = 1;
    }
  }
  const nearForeground = nearestSeeds(width, height, foreground, settings.edgeRadius);
  const backgroundSeeds = new Uint8Array(length), histogram = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  let sampleCount = 0;
  for (let p = 0; p < length; p++) if (screen[p] && nearForeground.distance[p]! > 3) {
    backgroundSeeds[p] = 1; sampleCount++;
    for (let c = 0; c < 3; c++) histogram[c]![data[p * 4 + c]!]!++;
  }
  if (sampleCount < 100) throw new Error('Insufficient unambiguous green-screen samples; supply a manually reviewed mask instead.');
  const backgroundColour = histogram.map((h) => {
    let sum = 0;
    for (let v = 0; v < 256; v++) { sum += h[v]!; if (sum >= sampleCount / 2) return v; }
    return 0;
  });
  const nearBackground = nearestSeeds(width, height, backgroundSeeds, settings.edgeRadius * 2);
  const result = blankImage(width, height), reviewMask = new Uint8Array(length);
  let changedRgbPixels = 0, fallbackBackgroundPixels = 0;
  for (let p = 0; p < length; p++) {
    const i = p * 4;
    if (!data[i + 3] || inside(p, width, labels)) continue;
    const f = nearForeground.owner[p]!, bg = nearBackground.owner[p]!;
    if (foreground[p]) { result.data.set(data.subarray(i, i + 4), i); continue; }
    if (f === -1) {
      if (!screen[p]) { result.data.set(data.subarray(i, i + 4), i); reviewMask[p] = 2; }
      continue;
    }
    // C = aF + (1-a)B. Local F/B are observed colours, not generated anatomy.
    // Only green-dominant boundary pixels are unmixed. Core foreground is byte-preserved.
    let numerator = 0, denominator = 0;
    for (let c = 0; c < 3; c++) {
      const background = bg === -1 ? backgroundColour[c]! : data[bg * 4 + c]!;
      const vector = data[f * 4 + c]! - background;
      numerator += (data[i + c]! - background) * vector; denominator += vector * vector;
    }
    const coverage = Math.max(0, Math.min(1, numerator / Math.max(1, denominator)));
    if (coverage <= settings.minimumCoverage) continue;
    const alpha = Math.round(data[i + 3]! * coverage);
    if (!alpha) continue;
    reviewMask[p] = 1;
    if (bg === -1) { fallbackBackgroundPixels++; reviewMask[p] = reviewMask[p]! | 2; }
    let residual = 0;
    for (let c = 0; c < 3; c++) {
      const background = bg === -1 ? backgroundColour[c]! : data[bg * 4 + c]!;
      result.data[i + c] = Math.round(Math.max(0, Math.min(255, (data[i + c]! - (1 - coverage) * background) / coverage)));
      residual += Math.abs(data[i + c]! - (coverage * data[f * 4 + c]! + (1 - coverage) * background));
    }
    result.data[i + 3] = alpha;
    // Reviewed local screen variations can leave green spill after the RGB fit.
    // Despill only estimated edge pixels inside that correction; core hair stays byte-identical.
    if (corrections.some((c) => inside(p, width, [c.region]))) result.data[i + 1] = Math.min(result.data[i + 1]!, Math.max(result.data[i]!, result.data[i + 2]!));
    if (residual > 35 || coverage < 0.08) reviewMask[p] = reviewMask[p]! | 2;
    if (result.data[i + 1]! - Math.max(result.data[i]!, result.data[i + 2]!) > 20) reviewMask[p] = reviewMask[p]! | 4;
    if (result.data[i] !== data[i] || result.data[i + 1] !== data[i + 1] || result.data[i + 2] !== data[i + 2]) changedRgbPixels++;
  }
  // Retained off-band green pixels must also be reported, never silently removed.
  for (let p = 0; p < length; p++) {
    const i = p * 4;
    if (result.data[i + 3] && result.data[i + 1]! - Math.max(result.data[i]!, result.data[i + 2]!) > 20) reviewMask[p] = reviewMask[p]! | 4;
  }
  return { image: result, reviewMask, labelsRemoved, changedRgbPixels, fallbackBackgroundPixels, backgroundColour, backgroundSeeds };
}
