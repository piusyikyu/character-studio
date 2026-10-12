import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head-soft-oval-v1/', hairRoot = 'assets/source/heroine-v1/hair-long-waves-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const input = async (source, directory = root) => ({ source, sourceSha256: hash(await readFile(directory + source)) });
const load = async (source, directory = root) => {
  const image = decode(await readFile(directory + source));
  if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 artwork required.');
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4);
  return image;
};
const inside = (x, y, polygon) => {
  let result = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [xa, ya] = polygon[a], [xb, yb] = polygon[b];
    if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) result = !result;
  }
  return result;
};
const save = async (source, data) => {
  const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data });
  await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) };
};
const baseline = JSON.parse(await readFile(root + 'front-diagonals-authoring-v2.json'));
const settingsSource = 'inputs/front-diagonals-v3/repair-settings.json', settings = JSON.parse(await readFile(root + settingsSource));
const hair = JSON.parse(await readFile(hairRoot + baseline.hairConfig.source));
const planes = { skin: await load(baseline.frames.SW.master.source), 'hair-front': await load(baseline.localFitRepair.frames.SW.front.source), 'hair-rear': await load(hair.frames.SW.rear.source, hairRoot) };
const operations = [];
for (const op of settings.operations) {
  const directory = op.directory === 'head' ? root : hairRoot, study = await load(op.source, directory), image = planes[op.plane];
  const mask = new Uint8Array(image.data.length); let pixelCount = 0;
  for (let i = 0; i < image.data.length; i += 4) {
    const x = i / 4 % 1024 + 0.5, y = Math.floor(i / 4 / 1024) + 0.5;
    const selected = inside(x, y, op.region) && !op.excludeRegions.some((p) => inside(x, y, p)) && (op.color === 'all' || study.data[i + 3] >= 8 && (study.data[i] - study.data[i + 2] > 18) === (op.color === 'skin'));
    if (selected) { image.data.set(study.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); pixelCount++; }
  }
  const { source, ...descriptor } = op;
  operations.push({ ...descriptor, study: await input(source, directory), selection: await save(`inputs/front-diagonals-v3/SW-${op.name}-mask.png`, mask), pixelCount });
}
const frame = { ...baseline.frames.SW, master: await save('SW-master-v3.png', planes.skin.data) };
for (const part of ['head', 'neck']) {
  const data = new Uint8Array(planes.skin.data.length), mask = new Uint8Array(data.length); let pixelCount = 0;
  for (let i = 0; i < data.length; i += 4) if (planes.skin.data[i + 3] >= 8 && (Math.floor(i / 4 / 1024) < frame.cutY) === (part === 'head')) { data.set(planes.skin.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); pixelCount++; }
  frame[part] = { ...await save(`SW-${part}-v3.png`, data), origin: baseline.frames.SW[part].origin, selection: await save(`inputs/front-diagonals-v3/SW-${part}-mask.png`, mask), pixelCount };
}
const config = { ...baseline, assetVersion: 3, frames: { SE: baseline.frames.SE, SW: frame }, knownReviewIssues: [
  'SE v2 anatomy and fit remain byte-for-byte unchanged. SW has its own local face/neck study, original native nose and jaw ownership, restored near strand/rear jaw continuity and authored lower-neck curl repair.',
  'All source artwork and anchors remain unchanged; only bounded same-facing native study pixels enter the new correction. Visual review must assess nose exposure, continuous jaw/neck hair contours and skin transitions.',
  'Unapproved standing-reference fit only, not runtime publication or production T-pose assets. Separate facial/ear variants, NE/NW heads, body/clothing, concealed hair and material maps remain unfinished. Step 6D has not started.',
], swCorrection: { baseline: await input('front-diagonals-authoring-v2.json'), settings: await input(settingsSource), operations, front: await save('SW-front-fit-v3.png', planes['hair-front'].data), rear: await save('SW-rear-fit-v3.png', planes['hair-rear'].data), approved: false } };
await writeFile(root + 'front-diagonals-authoring-v3.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared local SW nose, jaw and neck-curl correction; SE and all previous sources remain unchanged.');
