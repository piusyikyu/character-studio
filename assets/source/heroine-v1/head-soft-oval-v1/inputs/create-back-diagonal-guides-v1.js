import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const { encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head-soft-oval-v1/inputs/back-diagonals-v1/';
await mkdir(root, { recursive: true });
const shapes = {
  NE: { skull: [581, 154, 64, 87], jaw: [[529, 170], [545, 214], [566, 237], [587, 252], [612, 249], [634, 232], [642, 217], [639, 196], [625, 174]], neck: [[578, 231], [618, 226], [622, 255], [609, 277], [600, 298], [558, 306], [565, 283], [575, 259]] },
  NW: { skull: [450, 147, 64, 86], jaw: [[393, 163], [391, 196], [399, 216], [413, 239], [431, 250], [456, 243], [482, 225], [505, 197]], neck: [[414, 230], [450, 236], [466, 252], [467, 281], [468, 303], [418, 296], [414, 280], [413, 258]] },
};
const inside = (x, y, polygon) => {
  let result = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [xa, ya] = polygon[a], [xb, yb] = polygon[b];
    if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) result = !result;
  }
  return result;
};
for (const [direction, shape] of Object.entries(shapes)) {
  const data = new Uint8Array(1024 * 1536 * 4), [cx, cy, rx, ry] = shape.skull;
  for (let y = 50; y < 320; y++) for (let x = 380; x < 660; x++) {
    const scalp = y < 222 && ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    if (scalp || inside(x + 0.5, y + 0.5, shape.jaw) || inside(x + 0.5, y + 0.5, shape.neck)) data.set([245, 211, 186, 255], (y * 1024 + x) * 4);
  }
  await writeFile(`${root}${direction}-placement-guide.png`, encode({ width: 1024, height: 1536, data, channels: 4, depth: 8 }), { flag: 'wx' });
}
await writeFile(`${root}guide-shapes.json`, `${JSON.stringify({ purpose: 'Independent native framing aids for posterior three-quarter NE/NW skull/nape/neck; not approved anatomy. No mirroring.', shapes }, null, 2)}\n`, { flag: 'wx' });
