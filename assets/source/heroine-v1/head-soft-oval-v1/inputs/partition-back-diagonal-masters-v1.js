import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head-soft-oval-v1/', hairRoot = 'assets/source/heroine-v1/hair-long-waves-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const input = async (source, directory = root) => ({ source, sourceSha256: hash(await readFile(directory + source)) });
const baseline = JSON.parse(await readFile(root + 'authoring-v1.json'));
const hair = JSON.parse(await readFile(hairRoot + 'back-diagonals-authoring-v1.json'));
const prompts = JSON.parse(await readFile(root + 'back-diagonals-prompts-v1.json'));
const config = { ...baseline, frames: {}, hairConfig: await input('back-diagonals-authoring-v1.json', hairRoot), hairApproval: await input('back-diagonals-review-v1.json', hairRoot), knownReviewIssues: [
  'Independent NE/NW posterior three-quarter bald anatomy candidates. No eyes, eyebrows or mouth are authored; human review must confirm facing and absence of frontal features.',
  'Existing approved rear hair stays unchanged and renders above the head/neck in the actual back-facing plane order. Foreground fringe is explicitly hidden.',
  'Complete near human ears are embedded in the initial head bases. Ear geometry, scalp coverage, nape/neck transitions and native fit require visual review; separate ear variants remain unfinished.',
  'Native placement guides are framing aids, not approved anatomy. No study is moved, resampled, reflected or clipped to make a fit appear successful.',
  'Standing-reference fit only. Check abrupt neck/shoulder hair starts with real future same-facing body/clothing occlusion, as required by the qualified SE/SW approval. Concealed hair, facial/ear variants, body/clothing, material maps and production T-pose remain unfinished; final Step 6C approval precedes Step 6D.',
] };
const save = async (source, data) => {
  const bytes = encode({ width: 1024, height: 1536, data, channels: 4, depth: 8 });
  await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) };
};
for (const [direction, cutY, neckOrigin, allowedBounds] of [
  ['NE', 260, { x: 590, y: 285 }, { x: 505, y: 60, width: 160, height: 260 }],
  ['NW', 255, { x: 438, y: 275 }, { x: 375, y: 50, width: 155, height: 270 }],
]) {
  const source = `${direction}-master-v1.png`, bytes = await readFile(root + source);
  if (hash(bytes) !== prompts.selected.find((p) => p.direction === direction)?.sourceSha256) throw new Error(`${direction}: selected raw study changed.`);
  const master = decode(bytes);
  if (master.width !== 1024 || master.height !== 1536 || master.channels !== 4 || master.depth !== 8) throw new Error('Native RGBA8 anatomy study required.');
  for (let i = 0; i < master.data.length; i += 4) if (master.data[i + 3] < 8) master.data.fill(0, i, i + 4);
  const hairFrame = hair.frames[direction];
  if (hairFrame.front.visibility !== 'hidden') throw new Error('Posterior frontal fringe must be hidden.');
  const guideSource = direction === 'NW' ? 'inputs/back-diagonals-v1/NW-ear-placement-guide-v2.png' : 'inputs/back-diagonals-v1/NE-placement-guide.png';
  const frame = { reference: hairFrame.reference, referenceSha256: hairFrame.referenceSha256, candidateHeadAnchor: hairFrame.candidateHeadAnchor, candidateNeckAnchor: neckOrigin, master: await input(source), guide: await input(guideSource), cutY, allowedBounds };
  for (const part of ['head', 'neck']) {
    const data = new Uint8Array(master.data.length), mask = new Uint8Array(data.length); let pixelCount = 0;
    for (let i = 0; i < data.length; i += 4) if (master.data[i + 3] >= 8 && (Math.floor(i / 4 / 1024) < cutY) === (part === 'head')) { data.set(master.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); pixelCount++; }
    frame[part] = { ...await save(`${direction}-${part}-v1.png`, data), origin: part === 'head' ? hairFrame.candidateHeadAnchor : neckOrigin, selection: await save(`inputs/back-diagonals-v1/${direction}-${part}-mask.png`, mask), pixelCount };
  }
  config.frames[direction] = frame;
}
await writeFile(root + 'back-diagonals-authoring-v1.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared independent posterior NE/NW head/neck partitions; approved hair unchanged.');
