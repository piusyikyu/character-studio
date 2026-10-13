import fs from 'node:fs';
import { createRequire } from 'node:module';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const inside = (x, y, polygon) => {
  let selected = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) selected = !selected;
  }
  return selected;
};
const load = (source) => {
  const image = decode(fs.readFileSync(root + source));
  if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 guide input required.');
  return image;
};
// Framing guides only: local earless study plus original reference ear context.
// The final W extraction region was expanded after these guides were generated;
// partition-profile-ears-v3.js records that correction without altering tool inputs.
for (const direction of ['E', 'W']) {
  const prefix = `inputs/profiles-v3/${direction}`;
  const shapes = JSON.parse(fs.readFileSync(root + `${prefix}-ear-regions.json`));
  const guide = load(`${direction}-master-v1.png`), skin = load(`${prefix}-skin-study.png`), reference = load(`${direction}-fit-reference-master-v2.png`);
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    if (inside(x + .5, y + .5, shapes.repairRegion) && guide.data[i + 3] >= 8) guide.data.set(skin.data.subarray(i, i + 4), i);
    if (inside(x + .5, y + .5, shapes.referenceEarRegion)) guide.data.set(reference.data.subarray(i, i + 4), i);
  }
  fs.writeFileSync(root + `${prefix}-ear-placement-guide.png`, encode({ width: 1024, height: 1536, channels: 4, data: guide.data }), { flag: 'wx' });
}
