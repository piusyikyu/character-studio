import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/ears-human-v1/', headRoot = 'assets/source/heroine-v1/head-soft-oval-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const input = async (source, directory = root) => ({ source, sourceSha256: hash(await readFile(directory + source)) });
const headConfig = JSON.parse(await readFile(headRoot + 'authoring-v5.json'));
const approval = JSON.parse(await readFile(headRoot + 'review-fit-v5.json'));
if (approval.configSha256 !== (await input('authoring-v5.json', headRoot)).sourceSha256) throw new Error('Accepted S revision-5 configuration changed.');
const load = async (pin, directory = root) => {
  const bytes = await readFile(directory + pin.source);
  if (hash(bytes) !== pin.sourceSha256) throw new Error(`${pin.source}: pinned input changed.`);
  const image = decode(bytes);
  if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 input required.');
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4);
  return image;
};
const prompts = JSON.parse(await readFile(root + 'prompts-v1.json'));
const studyPin = { source: prompts.selected.output, sourceSha256: prompts.selected.sourceSha256 };
const original = await load(headConfig.frames.S.head, headRoot), study = await load(studyPin);
const settingsSource = 'inputs/ownership-v1.json', settings = JSON.parse(await readFile(root + settingsSource));
const regions = { right: [[422, 183], [455, 183], [455, 241], [422, 241]], left: [[568, 183], [603, 183], [603, 241], [568, 241]] };
if (settings.method !== 'native-ear-patches/authored-concealed-skin/variant-retention' || JSON.stringify(settings.regions) !== JSON.stringify(regions)) throw new Error('Native ear windows changed.');
const head = new Uint8Array(original.data), retention = new Uint8Array(head.length); retention.fill(255);
const save = async (source, data) => {
  const bytes = encode({ width: 1024, height: 1536, data, channels: 4, depth: 8 });
  await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) };
};
const sides = {};
for (const side of ['right', 'left']) {
  const region = regions[side], [x0, y0] = region[0], [x1, y1] = region[2], ear = new Uint8Array(head.length), mask = new Uint8Array(head.length); let pixelCount = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * 1024 + x) * 4;
    ear.set(original.data.subarray(i, i + 4), i); head.set(study.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); retention.fill(0, i, i + 4);
    if (ear[i + 3] >= 8) pixelCount++;
  }
  sides[side] = { ...await save(`S-${side}-ear-v1.png`, ear), region, selection: await save(`inputs/S-${side}-mask-v1.png`, mask), origin: headConfig.frames.S.candidateHeadAnchor, pixelCount };
}
const config = { schemaVersion: 1, id: 'ears.human.v1', assetVersion: 1, target: 'detailed', status: 'draft-needs-human-review', sourcePose: 'standing-reference', intendedRuntimePose: 'tpose', rigCompatibility: 'unverified', paletteReady: false, published: false, nativeSize: { width: 1024, height: 1536 }, minimumVisibleAlpha: 8, direction: 'S', method: settings.method,
  headConfig: await input('authoring-v5.json', headRoot), headApproval: await input('review-fit-v5.json', headRoot), study: studyPin, settings: await input(settingsSource),
  head: await save(prompts.selected.underlayOutput, head), headRetention: await save('inputs/S-human-head-retention-v1.png', retention), sides,
  knownReviewIssues: [
    'First S-only human-ear separation: exact accepted native ear/attachment RGBA, with newly authored concealed scalp/root skin in bounded local windows. Complete root anatomy and ear-free contours require visual approval.',
    'The human-ear retention mask preserves the accepted partial-alpha head and S hair fit exactly. The ear-free preview uses the full skin underlay without that mask. Future ear variants need their own authored geometry, attachment compatibility and reviewed masks.',
    'Physical right/left identity is retained. Other seven facings, elf/vampire ear variants, independent facial features, concealed hair, body/clothing, material maps and production T-pose remain unfinished. Final Step 6C approval precedes Step 6D.',
    'Accepted abrupt shoulder hair starts remain on the future real body/clothing occlusion checklist; no synthetic body certifies that fit.',
  ],
};
await writeFile(root + 'authoring-v1.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared native S human ear patches, concealed head and variant retention mask without overwriting approved artwork.');
