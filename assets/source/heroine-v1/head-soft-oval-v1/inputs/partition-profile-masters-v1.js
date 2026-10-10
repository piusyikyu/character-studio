import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head-soft-oval-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const input = async (source) => ({ source, sourceSha256: hash(await readFile(root + source)) });
const prior = JSON.parse(await readFile(root + 'authoring-v1.json'));
const config = { ...prior, assetVersion: 1, hairConfig: { source: 'profiles-authoring-v1.json', sourceSha256: hash(await readFile('assets/source/heroine-v1/hair-long-waves-v1/profiles-authoring-v1.json')) }, hairApproval: { source: 'profiles-review-v1.json', sourceSha256: hash(await readFile('assets/source/heroine-v1/hair-long-waves-v1/profiles-review-v1.json')) }, knownReviewIssues: [
  'New independent E/W concealed scalp, profile jaw/nose, near ear and neck require anatomy review. Synthetic silhouette guides are framing aids only.',
  'E faces screen-right and W screen-left. Each uses its own reference and raw generation, never a reflected or reused opposite facing. No eyes/brows/mouth lines are baked into the skin base; nose/lip boundary contours require visual review.',
  'Approved profile hair has recorded scale/placement differences from its original references. This review exposes actual anatomy/hair overlap; approval of hair design did not certify anatomical fit.',
  'Human near ears remain embedded in the head bases. Independent ear/facial layers, four diagonal heads, body/clothing, other presets and production T-pose fit remain unfinished. Final Step 6C approval precedes Step 6D.',
], frames: {} };
const profiles = JSON.parse(await readFile('assets/source/heroine-v1/hair-long-waves-v1/profiles-authoring-v1.json'));
for (const [direction, cutY, neckOrigin, allowedBounds] of [
  ['E', 268, { x: 541, y: 290 }, { x: 470, y: 65, width: 170, height: 265 }],
  ['W', 270, { x: 467, y: 295 }, { x: 370, y: 75, width: 175, height: 255 }],
]) {
  const master = decode(await readFile(root + `${direction}-master-v1.png`));
  if (master.width !== 1024 || master.height !== 1536 || master.channels !== 4 || master.depth !== 8) throw new Error('Native RGBA8 inputs required.');
  const frame = profiles.frames[direction];
  const record = { reference: frame.reference, referenceSha256: frame.referenceSha256, candidateHeadAnchor: frame.candidateHeadAnchor, candidateNeckAnchor: neckOrigin, master: await input(`${direction}-master-v1.png`), guide: await input(`inputs/profiles-v1/${direction}-placement-guide.png`), cutY, allowedBounds };
  for (const part of ['head', 'neck']) {
    const data = new Uint8Array(master.data.length), mask = new Uint8Array(master.data.length);
    let pixelCount = 0;
    for (let p = 0; p < 1024 * 1536; p++) {
      const i = p * 4;
      if (master.data[i + 3] < 8 || (Math.floor(p / 1024) < cutY) !== (part === 'head')) continue;
      data.set(master.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); pixelCount++;
    }
    const save = async (source, data) => { const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
    record[part] = { ...await save(`${direction}-${part}-v1.png`, data), origin: part === 'head' ? frame.candidateHeadAnchor : neckOrigin, selection: await save(`inputs/profiles-v1/${direction}-${part}-mask-v1.png`, mask), pixelCount };
  }
  config.frames[direction] = record;
}
await writeFile(root + 'profiles-authoring-v1.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared independent E/W native head/neck parts and review configuration.');
