import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/inputs/profiles-v1/';
const shapes = {
  E: { skull: [555, 156, 70, 82], jaw: [[488, 188], [605, 147], [614, 170], [615, 186], [623, 198], [627, 202], [622, 210], [617, 216], [614, 222], [611, 228], [605, 236], [599, 249], [590, 250], [555, 238], [518, 224], [497, 210]], neck: [[519, 219], [566, 241], [558, 265], [562, 290], [578, 310], [506, 310], [514, 282], [518, 249]] },
  W: { skull: [461, 166, 69, 81], jaw: [[521, 191], [414, 152], [402, 172], [399, 190], [388, 204], [380, 209], [385, 218], [391, 227], [392, 237], [399, 253], [408, 255], [449, 241], [493, 223], [516, 207]], neck: [[489, 222], [442, 245], [444, 271], [440, 294], [429, 317], [503, 317], [495, 290], [490, 252]] },
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
  for (let y = 65; y < 330; y++) for (let x = 370; x < 640; x++) {
    const scalp = y < 207 && ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    if (scalp || inside(x + 0.5, y + 0.5, shape.jaw) || inside(x + 0.5, y + 0.5, shape.neck)) data.set([245, 211, 186, 255], (y * 1024 + x) * 4);
  }
  await writeFile(`${root}${direction}-placement-guide.png`, encode({ width: 1024, height: 1536, channels: 4, depth: 8, data }), { flag: 'wx' });
}
await writeFile(`${root}guide-shapes.json`, `${JSON.stringify({ purpose: 'Synthetic native framing guide, not approved anatomy. Independently traced reference profile silhouettes and concealed scalp envelopes; never mirrored.', shapes }, null, 2)}\n`, { flag: 'wx' });
