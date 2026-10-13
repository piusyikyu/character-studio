import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face-reference-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const baselineBytes = await readFile(root + 'authoring-v1.json'), baseline = JSON.parse(baselineBytes);
const prompts = JSON.parse(await readFile(root + 'prompts-v2.json')), studyBytes = await readFile(root + prompts.selected.output);
if (hash(studyBytes) !== prompts.selected.sourceSha256) throw new Error('Pinned native study changed.');
const study = decode(studyBytes);
if (study.width !== 1024 || study.height !== 1536 || study.channels !== 4 || study.depth !== 8) throw new Error('Native RGBA8 study required without transformations.');
for (let i = 0; i < study.data.length; i += 4) if (study.data[i + 3] < 8) study.data.fill(0, i, i + 4);
const settingsSource = 'inputs/eye-fit-selections-v2.json', settingsBytes = await readFile(root + settingsSource), settings = JSON.parse(settingsBytes);
const contains = (x, y, polygon) => {
  let selected = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ax, ay] = polygon[a], [bx, by] = polygon[b];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected;
  }
  return selected;
};
const save = async (source, data) => {
  const bytes = encode({ width: 1024, height: 1536, data, channels: 4, depth: 8 });
  await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) };
};
const features = {};
for (const [name, selection] of Object.entries(settings.features)) {
  if (name === 'mouth') { features[name] = { ...baseline.features.mouth, owner: 'reference' }; continue; }
  const data = new Uint8Array(study.data.length), mask = new Uint8Array(data.length); let pixelCount = 0;
  for (let y = 172; y < 226; y++) for (let x = 450; x < 573; x++) if (contains(x + 0.5, y + 0.5, selection.polygon)) {
    const i = (y * 1024 + x) * 4; mask.fill(255, i, i + 4); data.set(study.data.subarray(i, i + 4), i); if (data[i + 3] >= 8) pixelCount++;
  }
  features[name] = { ...await save(`S-${name}-v3.png`, data), plane: selection.plane, side: selection.side, selection: await save(`inputs/S-${name}-mask-v3.png`, mask), origin: baseline.features[name].origin, pixelCount, owner: 'study' };
}
const config = { ...baseline, assetVersion: 2, method: settings.method, baseline: { source: 'authoring-v1.json', sourceSha256: hash(baselineBytes) }, study: { source: prompts.selected.output, sourceSha256: hash(studyBytes) }, settings: { source: settingsSource, sourceSha256: hash(settingsBytes) }, features, knownReviewIssues: settings.limitations };
await writeFile(root + 'authoring-v2.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared native local S eye/brow fit; prior candidate, mouth and approved anatomy remain unchanged.');
