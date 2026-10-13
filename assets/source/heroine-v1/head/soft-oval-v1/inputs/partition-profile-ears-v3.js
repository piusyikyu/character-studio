import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const input = async (source) => ({ source, sourceSha256: hash(await readFile(root + source)) });
const load = async (item) => {
  const bytes = await readFile(root + item.source);
  if (hash(bytes) !== item.sourceSha256) throw new Error('Pinned source changed.');
  const image = decode(bytes);
  if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 source required.');
  return image;
};
const save = async (source, data) => { const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
const inside = (x, y, polygon) => {
  let selected = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) selected = !selected;
  }
  return selected;
};
const baseline = await input('profiles-authoring-v2.json'), result = JSON.parse(await readFile(root + baseline.source));
result.assetVersion = 3;
result.earRepair = { method: 'local-authored-skin/reference-ear-native-fit', baseline, frames: {}, approved: false };
result.knownReviewIssues = [
  'Visible E/W ear pixels retain each own reference RGBA and native placement. Local authored skin removes the larger displaced ears and supplies a bounded concealed ear root; these concealed surfaces still need human approval.',
  'Outside each native ear repair region, original head/scalp/face/neck/anchors remain unchanged. Hair matte is unchanged except selected ear highlights; depth ownership follows the reference-visible ear rather than exposing the old large ear.',
  'Human ears remain embedded. Ear variants, four diagonal heads, facial parts, complete hidden hair/body/clothing/material maps and production T-pose fit remain unfinished. This is not final Step6C approval; Step6D has not started.',
];
for (const direction of ['E', 'W']) {
  const frame = result.frames[direction], prior = await load(frame.master), reference = await load(result.profileFit.frames[direction].study);
  const prefix = `inputs/profiles-v3/${direction}`;
  const regions = JSON.parse(await readFile(root + `${prefix}-ear-regions.json`));
  // The W guide's initial contour omitted 18 warm rim pixels. This final local
  // region retains the entire reference ear; the warm-skin guard rejects hair.
  if (direction === 'W') regions.referenceEarRegion = [[476, 180], [503, 180], [503, 220], [476, 220]];
  const skinStudy = await input(`${prefix}-skin-study.png`), earStudy = await input(`${prefix}-ear-study.png`);
  const skin = await load(skinStudy), ear = await load(earStudy);
  const master = new Uint8Array(prior.data.length), repairMask = new Uint8Array(prior.data.length), referenceMask = new Uint8Array(prior.data.length);
  // Pale inner-ear highlights would otherwise be retained as hair by the warm-skin guard.
  const referenceHighlights = direction === 'E' ? [{ x: 525, y: 194 }] : [];
  const highlights = new Set(referenceHighlights.map(({ x, y }) => y * 1024 + x));
  let changedPixelCount = 0, referencePixelCount = 0;
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    const selected = inside(x + .5, y + .5, regions.repairRegion) && prior.data[i + 3] >= 8;
    const fromReference = inside(x + .5, y + .5, regions.referenceEarRegion) && reference.data[i + 3] >= 8 && (reference.data[i] - reference.data[i + 2] > 18 || highlights.has(p));
    if (fromReference && !selected) throw new Error('Reference ear leaves local repair.');
    const drawing = fromReference ? reference : selected ? (inside(x + .5, y + .5, regions.earEnvelope) ? ear : skin) : prior;
    if (drawing.data[i + 3] >= 8) master.set(drawing.data.subarray(i, i + 4), i);
    if (selected) repairMask.fill(255, i, i + 4);
    if (fromReference) { referenceMask.fill(255, i, i + 4); referencePixelCount++; }
    if (master.subarray(i, i + 4).some((v, c) => v !== (prior.data[i + 3] >= 8 ? prior.data[i + c] : 0))) changedPixelCount++;
  }
  frame.master = await save(`${direction}-master-v3.png`, master);
  const head = new Uint8Array(master.length), headMask = new Uint8Array(master.length);
  let headPixelCount = 0;
  for (let p = 0; p < 1024 * frame.cutY; p++) if (master[p * 4 + 3] >= 8) { head.set(master.subarray(p * 4, p * 4 + 4), p * 4); headMask.fill(255, p * 4, p * 4 + 4); headPixelCount++; }
  frame.head = { ...frame.head, ...await save(`${direction}-head-v3.png`, head), selection: await save(`${prefix}-head-mask.png`, headMask), pixelCount: headPixelCount };
  result.earRepair.frames[direction] = { skinStudy, earStudy, selection: await save(`${prefix}-ear-repair-mask.png`, repairMask), referenceSelection: await save(`${prefix}-reference-ear-mask.png`, referenceMask), ...regions, referenceSkinMinimumRedMinusBlue: 18, referenceHighlights, changedPixelCount, referencePixelCount };
  const fit = result.profileFit.frames[direction];
  const settings = JSON.parse(await readFile(root + fit.settings.source));
  // There are no authored concealed strands in this visible-reference matte. Do not
  // send source-visible sidebangs behind skin simply to expose the full bald ear.
  settings.posteriorEarRegion = direction === 'E' ? [[520, 183], [522, 183], [522, 186]] : [[488, 190], [490, 190], [490, 194]];
  settings.excludedPixels.push(...referenceHighlights.map(({ x, y }) => [x, y]));
  settings.note = 'Revision3 local ear fit: preserve visible reference ear at native size/placement, keep crossing reference fringe in front. Only the pale ear highlight is removed from the previous matte. Concealed ear and hidden hair still need approval.';
  await writeFile(root + `${prefix}-fit.json`, JSON.stringify(settings, null, 2) + '\n', { flag: 'wx' });
  const hair = await load(fit.master), front = new Uint8Array(hair.data.length), rear = new Uint8Array(hair.data.length), frontMask = new Uint8Array(hair.data.length), rearMask = new Uint8Array(hair.data.length);
  let frontPixelCount = 0, rearPixelCount = 0;
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    if (highlights.has(p)) { hair.data.fill(0, i, i + 4); continue; }
    if (hair.data[i + 3] < 8) continue;
    const posterior = y >= settings.rearFromY || inside(x + .5, y + .5, settings.posteriorEarRegion);
    (posterior ? rear : front).set(hair.data.subarray(i, i + 4), i);
    (posterior ? rearMask : frontMask).fill(255, i, i + 4);
    if (posterior) rearPixelCount++; else frontPixelCount++;
  }
  Object.assign(fit, { settings: await input(`${prefix}-fit.json`), master: highlights.size ? await save(`${direction}-hair-coherent-master-v3.png`, hair.data) : fit.master, front: await save(`${direction}-front-fit-v3.png`, front), rear: await save(`${direction}-rear-fit-v3.png`, rear), frontSelection: await save(`${prefix}-front-mask.png`, frontMask), rearSelection: await save(`${prefix}-rear-mask.png`, rearMask), frontPixelCount, rearPixelCount });
}
await writeFile(root + 'profiles-authoring-v3.json', JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log('Prepared versioned local E/W ear and hair depth candidates.');
