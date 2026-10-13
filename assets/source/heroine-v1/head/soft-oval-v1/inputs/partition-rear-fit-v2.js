import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const raw = await readFile(`${root}S-rear-fit-master-v2.png`);
const referenceBytes = await readFile('assets/staging/heroine-v1/references/import-v1/transparent/S.png');
if (hash(referenceBytes) !== '4d835a1da05ab36992d3b97dad400233b81e1a6ad8d8f4872ed5353b771707c6') throw new Error('Native S reference changed.');
const master = decode(raw), reference = decode(referenceBytes);
for (const image of [master, reference]) if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 required.');
const data = new Uint8Array(master.data.length), mask = new Uint8Array(master.data.length);
// Reviewed upper-crown fragments detached by the reference-envelope cut, not lower fine strands.
const exclusions = [{ x: 370, y: 234, width: 11, height: 3 }, { x: 633, y: 246, width: 1, height: 1 }];
let pixelCount = 0;
for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
  const i = (y * 1024 + x) * 4;
  if (master.data[i + 3] < 8 || (y < 290 && reference.data[i + 3] < 8)) continue;
  if (exclusions.some((r) => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height)) continue;
  data.set(master.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); pixelCount++;
}
const png = (data) => encode({ width: 1024, height: 1536, channels: 4, depth: 8, data });
const imageBytes = png(data), maskBytes = png(mask);
await writeFile(`${root}S-rear-fit-v2.png`, imageBytes, { flag: 'wx' });
await writeFile(`${root}inputs/S-rear-fit-mask-v2.png`, maskBytes, { flag: 'wx' });
await writeFile(`${root}inputs/rear-fit-v2-provenance.json`, `${JSON.stringify({ schemaVersion: 1, direction: 'S', method: 'authored-rear-native-reference-envelope', reference: 'S.png', referenceSha256: hash(referenceBytes), master: 'S-rear-fit-master-v2.png', masterSha256: hash(raw), source: 'S-rear-fit-v2.png', sourceSha256: hash(imageBytes), selection: 'inputs/S-rear-fit-mask-v2.png', selectionSha256: hash(maskBytes), pixelCount, minimumVisibleAlpha: 8, referenceEnvelopeUntilY: 290, exclusions, excludedDetachedPixels: 24, policy: 'Above y290 keep authored rear pixels within the own-facing reference silhouette except two reviewed detached upper fragments. Below retain every visible master pixel, including fine strands. Exact RGBA; no translation, scaling or reflection. Approved rear art remains unchanged.' }, null, 2)}\n`, { flag: 'wx' });
console.log(`Prepared ${pixelCount} authored native S rear-fit pixels.`);
