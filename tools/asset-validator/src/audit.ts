import type { RgbaImage } from '@character-studio/render-utils';
import type { Rectangle } from './schema';

export function alphaStatistics(image: RgbaImage) {
  const histogram = new Array<number>(256).fill(0);
  let total = 0;
  for (let i = 3; i < image.data.length; i += 4) { histogram[image.data[i]!]!++; total += image.data[i]!; }
  return { transparent: histogram[0]!, opaque: histogram[255]!, partial: image.width * image.height - histogram[0]! - histogram[255]!, mean: total / (image.width * image.height), histogram };
}

export function characterBounds(image: RgbaImage, minimumAlpha = 1): Rectangle | null {
  let minX = image.width, minY = image.height, maxX = -1, maxY = -1;
  for (let p = 0; p < image.width * image.height; p++) if (image.data[p * 4 + 3]! >= minimumAlpha) {
    const x = p % image.width, y = Math.floor(p / image.width);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return maxX === -1 ? null : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

export function backgroundStatistics(image: RgbaImage, seeds: Uint8Array) {
  const colours = new Map<string, number>(), min = [255, 255, 255], max = [0, 0, 0], sums = [0, 0, 0];
  let pixels = 0, pureGreen = 0;
  for (let p = 0; p < seeds.length; p++) if (seeds[p]) {
    pixels++;
    const colour = [image.data[p * 4]!, image.data[p * 4 + 1]!, image.data[p * 4 + 2]!];
    const key = colour.join(','); colours.set(key, (colours.get(key) ?? 0) + 1);
    if (key === '0,255,0') pureGreen++;
    for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c]!, colour[c]!); max[c] = Math.max(max[c]!, colour[c]!); sums[c]! += colour[c]!; }
  }
  return { samplePixels: pixels, distinctColours: colours.size, pureGreen, channelMin: min, channelMax: max, channelMean: sums.map((s) => s / pixels), mostFrequent: [...colours].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'en')).slice(0, 8).map(([rgb, count]) => ({ rgb: rgb.split(',').map(Number), count })) };
}

/** Screen-space review tiles, not auto-repair instructions or segmentation masks. */
export function reviewRegions(mask: Uint8Array, width: number, bit: number) {
  const tiles = new Map<string, { x: number; y: number; width: number; height: number; pixels: number }>();
  for (let p = 0; p < mask.length; p++) if (mask[p]! & bit) {
    const x = Math.floor((p % width) / 32) * 32, y = Math.floor(Math.floor(p / width) / 32) * 32, key = `${x},${y}`;
    const tile = tiles.get(key) ?? { x, y, width: 32, height: 32, pixels: 0 };
    tile.pixels++; tiles.set(key, tile);
  }
  return { pixels: [...tiles.values()].reduce((sum, t) => sum + t.pixels, 0), tiles: [...tiles.values()].sort((a, b) => a.y - b.y || a.x - b.x) };
}

export function approximateBaseline(image: RgbaImage, regions: readonly Rectangle[]) {
  const observations = regions.map((region) => {
    let bottom: number | null = null;
    for (let y = region.y; y < region.y + region.height; y++) {
      let count = 0;
      for (let x = region.x; x < region.x + region.width; x++) if (image.data[(y * image.width + x) * 4 + 3]! >= 128) count++;
      if (count >= 3) bottom = y;
    }
    return { region, y: bottom, confidence: 'low', note: 'Bottom of observed opaque pixels inside a reviewed shoe region; clothing may overlap. No translation or baseline normalization applied.' };
  });
  const values = observations.flatMap((o) => o.y === null ? [] : [o.y]);
  return { y: values.length ? Math.max(...values) : null, observations };
}

/** Report disconnected retained fragments; fine curls may be legitimate. Never delete them. */
export function foregroundFragments(image: RgbaImage) {
  const length = image.width * image.height, visited = new Uint8Array(length), queue = new Int32Array(length);
  const fragments: { pixels: number; bounds: Rectangle }[] = [];
  let components = 0;
  for (let p = 0; p < length; p++) {
    if (visited[p] || image.data[p * 4 + 3]! < 32) continue;
    let head = 0, tail = 1, minX = image.width, minY = image.height, maxX = 0, maxY = 0;
    queue[0] = p; visited[p] = 1; components++;
    while (head < tail) {
      const q = queue[head++]!, x = q % image.width, y = Math.floor(q / image.width);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, next = ny * image.width + nx;
        if (nx < 0 || nx >= image.width || ny < 0 || ny >= image.height || visited[next] || image.data[next * 4 + 3]! < 32) continue;
        visited[next] = 1; queue[tail++] = next;
      }
    }
    if (tail < 64) fragments.push({ pixels: tail, bounds: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } });
  }
  return { components, smallFragments: fragments };
}
