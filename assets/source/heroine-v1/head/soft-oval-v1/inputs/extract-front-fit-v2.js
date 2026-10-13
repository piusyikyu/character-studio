import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const config = JSON.parse(await readFile(`${root}inputs/S-front-fit-mask-v2.json`, 'utf8'));
const bytes = await readFile(`assets/staging/heroine-v1/references/import-v1/transparent/${config.reference}`);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
if (hash(bytes) !== config.referenceSha256) throw new Error('Reference changed; regenerate its approved staging first.');
const reference = decode(bytes);
if (reference.width !== 1024 || reference.height !== 1536 || reference.channels !== 4 || reference.depth !== 8) throw new Error('Native RGBA8 reference required.');
const inside = (x, y, polygon) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
};
const data = new Uint8Array(reference.data.length), mask = new Uint8Array(reference.data.length);
let pixelCount = 0;
for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
  const i = (y * 1024 + x) * 4;
  if (reference.data[i + 3] < 8 || !config.polygons.some((p) => inside(x + 0.5, y + 0.5, p)) || config.exclusions.some((p) => inside(x + 0.5, y + 0.5, p))) continue;
  if (reference.data[i] - reference.data[i + 2] > config.warmBoundaryExclusion.minimumRedMinusBlue && reference.data[i + 1] - reference.data[i + 2] > config.warmBoundaryExclusion.minimumGreenMinusBlue) continue;
  data.set(reference.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); pixelCount++;
}
const png = (data) => encode({ width: 1024, height: 1536, channels: 4, depth: 8, data });
const imageBytes = png(data), maskBytes = png(mask);
await writeFile(`${root}S-front-fit-v2.png`, imageBytes, { flag: 'wx' });
await writeFile(`${root}inputs/S-front-fit-mask-v2.png`, maskBytes, { flag: 'wx' });
await writeFile(`${root}inputs/front-fit-v2-provenance.json`, `${JSON.stringify({ ...config, polygonSource: 'inputs/S-front-fit-mask-v2.json', polygonSourceSha256: hash(await readFile(`${root}inputs/S-front-fit-mask-v2.json`)), source: 'S-front-fit-v2.png', sourceSha256: hash(imageBytes), selection: 'inputs/S-front-fit-mask-v2.png', selectionSha256: hash(maskBytes), pixelCount, policy: 'Every selected pixel is copied from S at its original native coordinate. No transform, mirroring, recolouring or generated replacement.' }, null, 2)}\n`, { flag: 'wx' });
console.log(`Extracted ${pixelCount} native S front-hair pixels for fit review.`);
