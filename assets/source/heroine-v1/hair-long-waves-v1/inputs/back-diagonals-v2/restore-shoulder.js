import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/hair-long-waves-v1/';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const baselineBytes = await readFile(`${root}NW-rear-v1.png`);
const referenceBytes = await readFile('assets/staging/heroine-v1/reference-import-v1/transparent/NW.png');
if (sha256(baselineBytes) !== 'd06640a3c244a19dfc8508faab4f04dc915d712717f95c5b636df04712828313' || sha256(referenceBytes) !== 'ec34f6f12044aaeeb649c320c17635470ec6aeb99cc50ff0da430e9d333dd11d') throw new Error('NW input changed; review a new version.');
const baseline = decode(baselineBytes), reference = decode(referenceBytes);
for (const image of [baseline, reference]) if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 inputs required.');
const polygon = [[377,286],[385,284],[378,294],[370,306],[367,313],[367,322],[372,334],[370,348],[368,358],[356,361],[345,358],[339,350],[338,339],[344,333],[347,342],[355,346],[360,341],[354,331],[349,322],[347,312],[350,302],[357,293],[365,288]];
function inside(x, y) {
  let yes = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) yes = !yes;
  }
  return yes;
}
const mask = new Uint8Array(baseline.data.length), selected = new Uint8Array(baseline.data.length);
let pixelCount = 0, addedPixels = 0, replacedPixels = 0;
for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
  const i = (y * 1024 + x) * 4;
  // Local exclusions follow the existing side-hair restoration policy.
  if (!inside(x + 0.5, y + 0.5) || reference.data[i + 3] < 8 || reference.data[i] - reference.data[i + 2] > 15 || reference.data[i + 1] - Math.max(reference.data[i], reference.data[i + 2]) > 20) continue;
  pixelCount++;
  if (baseline.data[i + 3] >= 8) replacedPixels++; else addedPixels++;
  mask.fill(255, i, i + 4);
  selected.set(reference.data.subarray(i, i + 4), i);
  baseline.data.set(reference.data.subarray(i, i + 4), i);
}
const png = (data) => encode({ width: 1024, height: 1536, channels: 4, depth: 8, data });
const output = png(baseline.data), maskBytes = png(mask);
const record = {
  schemaVersion: 1, direction: 'NW', method: 'manual-native-reference-hair-mask', minimumVisibleAlpha: 8,
  baseline: { source: 'NW-rear-v1.png', sha256: sha256(baselineBytes) },
  reference: { source: 'NW.png', sha256: sha256(referenceBytes) },
  selection: { source: 'inputs/back-diagonals-v2/NW-shoulder-mask.png', sha256: sha256(maskBytes) },
  output: { source: 'NW-rear-v2.png', sha256: sha256(output) },
  pixelCount, addedPixels, replacedPixels, polygon,
  policy: 'Copy exact NW reference RGBA inside the manually traced shoulder curl. Reject local warm skin (R-B >15) and green spill (G-max(R,B) >20). Preserve baseline RGBA everywhere outside the mask. No transformations or other-facing artwork.'
};
await writeFile(`${root}NW-rear-v2.png`, output, { flag: 'wx' });
await writeFile(`${root}inputs/back-diagonals-v2/NW-shoulder-mask.png`, maskBytes, { flag: 'wx' });
await writeFile(`${root}inputs/back-diagonals-v2/NW-shoulder-reference.png`, png(selected), { flag: 'wx' });
await writeFile(`${root}inputs/back-diagonals-v2/restoration-v2.json`, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx' });
console.log({ pixelCount, addedPixels, replacedPixels });
