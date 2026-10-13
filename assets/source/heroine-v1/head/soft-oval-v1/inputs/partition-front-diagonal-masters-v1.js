import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hairRoot = 'assets/source/heroine-v1/hair/long-waves-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const input = async (source, directory = root) => ({ source, sourceSha256: hash(await readFile(directory + source)) });
const prior = JSON.parse(await readFile(root + 'authoring-v1.json'));
const hair = JSON.parse(await readFile(hairRoot + 'front-diagonals-authoring-v5.json'));
const config = { ...prior, hairConfig: await input('front-diagonals-authoring-v5.json', hairRoot), hairApproval: await input('front-diagonals-review-v2.json', hairRoot), knownReviewIssues: [
  'Independently authored SE/SW complete bald head and neck drafts: three-quarter front right/left. Visible ear pixels retain the same-facing approved design study; concealed ear anatomy still needs review.',
  'Native skin studies drift from synthetic jaw/neck guides. Actual approved-hair fit is displayed without transforms or substitutions; visible jaw/nose geometry and original hair-mask seams require visual inspection.',
  'Approved front-diagonal hair remains unchanged. Existing tiny skin-mask cuts, residual noise and hair roots around the neck may need a later versioned fit correction; design approval does not certify this anatomy fit.',
  'Human ears remain embedded; NE/NW heads, separate facial/ear variants, concealed hair, body/clothing and production T-pose fit remain unfinished. This is not final Step 6C approval; Step 6D has not started.',
], frames: {}, nativeEarOwnership: { method: 'authored-skin/same-facing-study-visible-ear', frames: {} } };
const inside = (x, y, polygon) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
};
const save = async (source, data) => { const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
for (const [direction, cutY, neckOrigin, allowedBounds, region] of [
  ['SE', 265, { x: 545, y: 283 }, { x: 470, y: 45, width: 170, height: 285 }, [[479, 158], [489, 155], [494, 160], [491, 174], [485, 187], [481, 182], [478, 171]]],
  ['SW', 280, { x: 484, y: 299 }, { x: 390, y: 60, width: 165, height: 270 }, [[523, 170], [533, 166], [540, 170], [540, 181], [535, 190], [528, 200], [523, 194]]],
]) {
  const study = await input(`inputs/front-diagonals-v1/${direction}-skin-study.png`), master = decode(await readFile(root + study.source));
  if (master.width !== 1024 || master.height !== 1536 || master.channels !== 4 || master.depth !== 8) throw new Error('Native RGBA8 study required.');
  const frame = hair.frames[direction], baseline = decode(await readFile(hairRoot + frame.designMaster.source));
  const repairStudy = await input(`inputs/front-diagonals-v1/${direction}-ear-study.png`), repair = decode(await readFile(root + repairStudy.source));
  const repairRegion = direction === 'SE' ? [[477, 141], [522, 141], [527, 159], [525, 205], [485, 205], [477, 189]] : [[504, 144], [544, 144], [547, 171], [545, 218], [514, 218], [505, 200]];
  const selection = new Uint8Array(master.data.length), repairMask = new Uint8Array(master.data.length); let earPixels = 0;
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4;
    if (master.data[i + 3] < 8) master.data.fill(0, i, i + 4);
    if (inside(p % 1024 + 0.5, Math.floor(p / 1024) + 0.5, repairRegion)) {
      if (repair.data[i + 3] < 8) master.data.fill(0, i, i + 4);
      else master.data.set(repair.data.subarray(i, i + 4), i);
      repairMask.fill(255, i, i + 4);
    }
    if (inside(p % 1024 + 0.5, Math.floor(p / 1024) + 0.5, region) && baseline.data[i + 3] >= 8 && baseline.data[i] - baseline.data[i + 2] > 18) {
      master.data.set(baseline.data.subarray(i, i + 4), i); selection.fill(255, i, i + 4); earPixels++;
    }
  }
  config.nativeEarOwnership.frames[direction] = { study, repairStudy, repairSelection: await save(`inputs/front-diagonals-v1/${direction}-ear-repair-mask.png`, repairMask), repairRegion, selection: await save(`inputs/front-diagonals-v1/${direction}-visible-ear-mask.png`, selection), region, pixelCount: earPixels };
  const record = { reference: frame.reference, referenceSha256: frame.referenceSha256, candidateHeadAnchor: frame.candidateHeadAnchor, candidateNeckAnchor: neckOrigin, master: await save(`${direction}-master-v1.png`, master.data), guide: await input(`inputs/front-diagonals-v1/${direction}-placement-guide.png`), cutY, allowedBounds };
  for (const part of ['head', 'neck']) {
    const data = new Uint8Array(master.data.length), mask = new Uint8Array(master.data.length); let pixelCount = 0;
    for (let p = 0; p < 1024 * 1536; p++) {
      const i = p * 4;
      if (master.data[i + 3] < 8 || (Math.floor(p / 1024) < cutY) !== (part === 'head')) continue;
      data.set(master.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); pixelCount++;
    }
    record[part] = { ...await save(`${direction}-${part}-v1.png`, data), origin: part === 'head' ? frame.candidateHeadAnchor : neckOrigin, selection: await save(`inputs/front-diagonals-v1/${direction}-${part}-mask-v1.png`, mask), pixelCount };
  }
  config.frames[direction] = record;
}
await writeFile(root + 'front-diagonals-authoring-v1.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared independent SE/SW native skin and canonical visible-ear ownership.');
