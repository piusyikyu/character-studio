import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

export const eastBodyPartLayout = [
  { id: 'torso', plane: 'body-torso', characterSide: 'center', visibility: 'visible' },
  { id: 'right-arm', plane: 'body-front-arm', characterSide: 'right', visibility: 'visible' },
  { id: 'left-arm', plane: 'body-back-arm', characterSide: 'left', visibility: 'occluded-unavailable' },
  { id: 'right-leg', plane: 'body-front-leg', characterSide: 'right', visibility: 'visible' },
  { id: 'left-leg', plane: 'body-back-leg', characterSide: 'left', visibility: 'occluded-unavailable' },
] as const;
/** E-specific visible cuts, not concealed joint shapes or reusable rig anchors. */
export const eastBodyPartsGeometry = {
  arm: [[487,337],[513,331],[536,343],[549,365],[542,385],[528,396],[504,403],[480,443],[430,443],[430,337]],
  leg: [[469,680],[500,637],[540,627],[580,640],[610,666],[634,702]],
} as const;
const inPolygon = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!, b = polygon[j]!;
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
};
export const westBodyPartLayout = [
  { id: 'torso', plane: 'body-torso', characterSide: 'center', visibility: 'visible' },
  { id: 'left-arm', plane: 'body-front-arm', characterSide: 'left', visibility: 'visible' },
  { id: 'right-arm', plane: 'body-back-arm', characterSide: 'right', visibility: 'occluded-unavailable' },
  { id: 'left-leg', plane: 'body-front-leg', characterSide: 'left', visibility: 'visible' },
  { id: 'right-leg', plane: 'body-back-leg', characterSide: 'right', visibility: 'occluded-unavailable' },
] as const;
/** Independently traced W shoulder and brief opening; no E cut is reflected. */
export const westBodyPartsGeometry = {
  arm: [[499,329],[477,334],[461,350],[462,376],[480,396],[507,407],[553,413],[553,300],[520,300],[520,324]],
  leg: [[395,725],[420,673],[450,648],[485,648],[520,665],[550,698],[563,725]],
} as const;
export const partitionEastBody = (body: RgbaImage) => partitionProfileBody(body, eastBodyPartLayout, eastBodyPartsGeometry);
export const partitionWestBody = (body: RgbaImage) => partitionProfileBody(body, westBodyPartLayout, westBodyPartsGeometry);
function partitionProfileBody(body: RgbaImage, layout: typeof eastBodyPartLayout | typeof westBodyPartLayout, geometry: { readonly arm: readonly (readonly [number, number])[]; readonly leg: readonly (readonly [number, number])[] }) {
  if (body.width !== 1024 || body.height !== 1536) throw new Error('Native profile body required.');
  const parts = layout.map(() => blankImage(1024, 1536)), pixelCounts = layout.map(() => 0);
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    const p = (y * 1024 + x) * 4; if (body.data[p + 3]! < 8) continue;
    const line = geometry.leg, px = x + .5, py = y + .5;
    let legTop: number = line.at(-1)![1];
    if (px <= line[0]![0]) legTop = line[0]![1];
    else for (let i = 1; i < line.length; i++) {
      const a = line[i - 1]!, b = line[i]!;
      if (px <= b[0]) { legTop = a[1] + (b[1] - a[1]) * (px - a[0]) / (b[0] - a[0]); break; }
    }
    const owner = inPolygon(px, py, geometry.arm) ? 1 : py >= legTop ? 3 : 0;
    parts[owner]!.data.set(body.data.subarray(p, p + 4), p); pixelCounts[owner]!++;
  }
  return { parts, pixelCounts };
}
