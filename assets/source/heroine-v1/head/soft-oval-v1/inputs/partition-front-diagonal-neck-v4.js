import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const baselineBytes = await readFile(root + 'front-diagonals-authoring-v3.json');
if (hash(baselineBytes) !== 'b720ebea895fef4026484f49442bd701e4eb72dd14935e927b998c7733e0ccaa') throw new Error('Revision-3 baseline changed.');
const baseline = JSON.parse(baselineBytes);
const input = async (source) => ({ source, sourceSha256: hash(await readFile(root + source)) });
const load = async (pin) => {
  const bytes = await readFile(root + pin.source);
  if (hash(bytes) !== pin.sourceSha256) throw new Error(`${pin.source}: pinned source changed.`);
  const image = decode(bytes);
  if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 artwork required.');
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4);
  return image;
};
const front = await load(baseline.swCorrection.front), rear = await load(baseline.swCorrection.rear);
const head = await load(baseline.frames.SW.head), neck = await load(baseline.frames.SW.neck);
const settingsSource = 'inputs/front-diagonals-v4/neck-ownership.json';
const settings = JSON.parse(await readFile(root + settingsSource));
const region = [[466, 263], [476, 263], [476, 287], [466, 287]];
if (settings.method !== 'duplicate-front-behind-skin' || JSON.stringify(settings.region) !== JSON.stringify(region)) throw new Error('Detached fragment envelope changed.');
const mask = new Uint8Array(front.data.length); let pixelCount = 0;
for (let y = 263; y < 287; y++) for (let x = 466; x < 476; x++) {
  const i = (y * 1024 + x) * 4;
  if (front.data[i + 3] < 8) continue;
  if (rear.data.subarray(i, i + 4).some((v, c) => v !== front.data[i + c]) || (!head.data[i + 3] && !neck.data[i + 3])) throw new Error('Fragment must already have identical rear ownership behind skin.');
  front.data.fill(0, i, i + 4); mask.fill(255, i, i + 4); pixelCount++;
}
if (pixelCount !== 157) throw new Error('Detached fragment coverage changed.');
const save = async (source, data) => {
  const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data });
  await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) };
};
const approvalSource = 'front-diagonals-review-fit-v3.json';
const approval = JSON.parse(await readFile(root + approvalSource));
if (approval.configSha256 !== hash(baselineBytes) || approval.status !== 'approved-standing-reference-fit-candidate') throw new Error('Revision-3 fit approval is required.');
const config = { ...baseline, assetVersion: 4, knownReviewIssues: [
  'Revision 3 generally approved with the circled abrupt neck hair join outstanding. Revision 4 clears 157 duplicate foreground pixels already retained in the rear behind head/neck skin.',
  'SE, SW anatomy, nose, rear hair, native anchors and all previous artwork are unchanged. Other inherited hair seams and mask transitions still require visual review.',
  'Standing-reference candidate only. Facial/ear variants, NE/NW heads, concealed hair, body/clothing, material maps, production T-pose and final Step 6C remain unfinished. Step 6D has not started.',
], neckOwnership: {
  method: settings.method, baseline: await input('front-diagonals-authoring-v3.json'), approval: await input(approvalSource), settings: await input(settingsSource), region,
  selection: await save('inputs/front-diagonals-v4/SW-neck-ownership-mask.png', mask), front: await save('SW-front-fit-v4.png', front.data), pixelCount, approved: false,
} };
await writeFile(root + 'front-diagonals-authoring-v4.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared 157-pixel SW neck ownership correction. Rear hair, anatomy, SE and prior sources unchanged.');
