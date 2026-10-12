import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/ears-human-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const baselineBytes = await readFile(root + 'authoring-v1.json'), baseline = JSON.parse(baselineBytes);
const prompts = JSON.parse(await readFile(root + 'prompts-v2.json'));
const studyPin = { source: prompts.selected.output, sourceSha256: prompts.selected.sourceSha256 };
const load = async (pin) => {
  const bytes = await readFile(root + pin.source);
  if (hash(bytes) !== pin.sourceSha256) throw new Error(`${pin.source}: pinned input changed.`);
  const image = decode(bytes);
  if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 study required.');
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4);
  return image;
};
const study = await load(studyPin), underlay = await load(baseline.head);
await load(baseline.headRetention);
const mask = new Uint8Array(study.data.length);
for (const [x0, x1] of [[424, 451], [574, 600]]) for (let y = 184; y < 224; y++) for (let x = x0; x < x1; x++) mask.fill(255, (y * 1024 + x) * 4, (y * 1024 + x) * 4 + 4);
const maskSource = 'inputs/S-small-ear-selection-v2.png', maskBytes = encode({ width: 1024, height: 1536, data: mask, channels: 4, depth: 8 });
await writeFile(root + maskSource, maskBytes, { flag: 'wx' });
const settingsSource = 'inputs/ownership-v2.json', settingsBytes = await readFile(root + settingsSource), settings = JSON.parse(settingsBytes);
if (settings.method !== 'locally-authored-smaller-ears/retained-concealed-skin/variant-retention' || Object.keys(baseline.sides).some((side) => JSON.stringify(settings.regions[side]) !== JSON.stringify(baseline.sides[side].region))) throw new Error('Bounded ear ownership changed.');
const sides = {};
for (const side of ['right', 'left']) {
  const previous = baseline.sides[side], [[x0, y0], , [x1, y1]] = previous.region, data = new Uint8Array(study.data.length); let pixelCount = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * 1024 + x) * 4, owner = mask[i + 3] ? study : underlay; data.set(owner.data.subarray(i, i + 4), i); if (data[i + 3] >= 8) pixelCount++;
  }
  const source = `S-${side}-ear-v2-masked.png`, bytes = encode({ width: 1024, height: 1536, data, channels: 4, depth: 8 });
  await writeFile(root + source, bytes, { flag: 'wx' });
  sides[side] = { ...previous, source, sourceSha256: hash(bytes), pixelCount };
}
const config = { ...baseline, assetVersion: 2, method: settings.method, baseline: { source: 'authoring-v1.json', sourceSha256: hash(baselineBytes) }, study: studyPin, underlayStudy: baseline.study,
  repairSelection: { source: maskSource, sourceSha256: hash(maskBytes) },
  settings: { source: settingsSource, sourceSha256: hash(settingsBytes) }, sides, knownReviewIssues: [
    'Smaller S human ears replace the inherited oversized anatomy using independently drawn local native study pixels. Size, contour joins and actual hair coverage require visual approval.',
    'The concealed skin, human retention mask, neck, face outside the two local ear/root windows and both hair layers remain unchanged. The new assembly intentionally differs from the accepted S5 ear anatomy.',
    ...baseline.knownReviewIssues.slice(2),
  ],
};
await writeFile(root + 'authoring-v2.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared new local S ear revision without transforming or overwriting prior artwork.');
