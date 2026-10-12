import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head-soft-oval-v1/inputs/front-diagonals-v1/';
const shapes = {
  SE: { skull: [548, 143, 70, 88], jaw: [[481, 160], [522, 137], [585, 137], [616, 170], [616, 188], [607, 206], [597, 224], [575, 241], [566, 244], [542, 232], [516, 217], [489, 193]], neck: [[519, 209], [557, 237], [549, 257], [555, 286], [578, 303], [520, 303], [520, 267], [511, 237]] },
  SW: { skull: [471, 161, 68, 92], jaw: [[409, 162], [447, 136], [501, 143], [528, 168], [523, 206], [507, 227], [479, 245], [456, 262], [444, 258], [422, 243], [412, 228], [412, 219], [405, 207], [408, 194]], neck: [[480, 236], [512, 221], [514, 252], [503, 279], [501, 316], [452, 316], [467, 290], [470, 264]] },
};
const inside = (x, y, polygon) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
};
for (const [direction, shape] of Object.entries(shapes)) {
  const data = new Uint8Array(1024 * 1536 * 4), [cx, cy, rx, ry] = shape.skull;
  for (let y = 45; y < 330; y++) for (let x = 395; x < 630; x++) {
    const scalp = y < 211 && ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    if (scalp || inside(x + 0.5, y + 0.5, shape.jaw) || inside(x + 0.5, y + 0.5, shape.neck)) data.set([245, 211, 186, 255], (y * 1024 + x) * 4);
  }
  await writeFile(`${root}${direction}-placement-guide.png`, encode({ width: 1024, height: 1536, channels: 4, depth: 8, data }), { flag: 'wx' });
}
await writeFile(`${root}guide-shapes.json`, `${JSON.stringify({ purpose: 'Synthetic native framing aids independently traced against each approved same-facing design study; not approved anatomy, not mirrored.', shapes }, null, 2)}\n`, { flag: 'wx' });
