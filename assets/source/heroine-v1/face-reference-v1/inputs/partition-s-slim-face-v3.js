import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face-reference-v1/', earRoot = 'assets/source/heroine-v1/ears-human-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const baselineBytes = await readFile(root + 'authoring-v1.json'), baseline = JSON.parse(baselineBytes), previousBytes = await readFile(root + 'authoring-v2.json');
const ears = JSON.parse(await readFile(earRoot + 'authoring-v2.json')), prompts = JSON.parse(await readFile(root + 'prompts-v3.json'));
const load = async (directory, pin) => {
  const bytes = await readFile(directory + pin.source);
  if (hash(bytes) !== pin.sourceSha256) throw new Error(`${pin.source}: native input changed.`);
  const image = decode(bytes);
  if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 required.');
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4);
  return image;
};
const studyPin = { source: prompts.selected.output, sourceSha256: prompts.selected.sourceSha256 };
const original = await load(earRoot, ears.head), study = await load(root, studyPin), reference = await load('assets/staging/heroine-v1/reference-import-v1/transparent/', baseline.reference);
const data = new Uint8Array(original.data), mask = new Uint8Array(data.length), nose = new Uint8Array(data.length), retention = new Uint8Array(data.length); retention.fill(255);
for (let y = 170; y < 278; y++) for (let x = 435; x < 592; x++) { const i = (y * 1024 + x) * 4; data.set(study.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); }
for (let y = 207; y < 234; y++) for (let x = 504; x < 518; x++) { const i = (y * 1024 + x) * 4; data.set(reference.data.subarray(i, i + 4), i); nose.fill(255, i, i + 4); }
const save = async (source, pixels) => { const bytes = encode({ width: 1024, height: 1536, data: pixels, channels: 4, depth: 8 }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
const contains = (x, y, polygon) => {
  let selected = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected; }
  return selected;
};
const polygons = { right: [[423, 183], [440, 183], [453, 222], [451, 225], [438, 225], [426, 213], [423, 201]], left: [[580, 183], [600, 183], [602, 201], [590, 224], [574, 226], [574, 218], [580, 204]] }, selections = {};
for (const side of ['right', 'left']) {
  const source = await load(earRoot, ears.sides[side]), pixels = new Uint8Array(data.length), selected = new Uint8Array(data.length);
  for (let y = 183; y < 227; y++) for (let x = 422; x < 603; x++) { const i = (y * 1024 + x) * 4; if (source.data[i + 3] >= 8 && contains(x + 0.5, y + 0.5, polygons[side])) { pixels.set(source.data.subarray(i, i + 4), i); selected.fill(255, i, i + 4); retention.fill(0, i, i + 4); } }
  selections[side] = { ...await save(`S-${side}-ear-fit-v3.png`, pixels), selection: await save(`inputs/S-${side}-ear-fit-mask-v3.png`, selected) };
}
const headFit = { ...await save('S-head-slim-underlay-v3.png', data), selection: await save('inputs/S-slim-face-mask-v3.png', mask), noseSelection: await save('inputs/S-reference-nose-mask-v3.png', nose), retention: await save('inputs/S-slim-head-retention-v3.png', retention), rightEar: selections.right, leftEar: selections.left };
const settingsSource = 'inputs/slim-face-features-v3.json', settingsBytes = await readFile(root + settingsSource), settings = JSON.parse(settingsBytes);
const config = { ...baseline, assetVersion: 3, method: settings.method, baseline: { source: 'authoring-v1.json', sourceSha256: hash(baselineBytes) }, previous: { source: 'authoring-v2.json', sourceSha256: hash(previousBytes) }, study: studyPin, headFit, settings: { source: settingsSource, sourceSha256: hash(settingsBytes) }, features: Object.fromEntries(Object.entries(baseline.features).map(([name, value]) => [name, { ...value, owner: 'reference' }])), knownReviewIssues: settings.limitations };
await writeFile(root + 'authoring-v3.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared local slimmer S face with original reference features and retained native ear geometry.');
