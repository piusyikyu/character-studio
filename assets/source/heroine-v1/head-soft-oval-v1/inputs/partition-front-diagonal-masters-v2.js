import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head-soft-oval-v1/';
const hairRoot = 'assets/source/heroine-v1/hair-long-waves-v1/';
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
const baseline = JSON.parse(await readFile(root + 'front-diagonals-authoring-v1.json'));
const settingsSource = 'inputs/front-diagonals-v2/repair-settings.json';
const settings = JSON.parse(await readFile(root + settingsSource));
const hair = JSON.parse(await readFile(hairRoot + baseline.hairConfig.source));
const config = { ...baseline, assetVersion: 2, knownReviewIssues: [
  'Complete independently authored SE/SW ears replace the clipped visible-only fragments. Local SE cheek/jaw geometry and original native nose position are corrected; anatomy requires visual review.',
  'SW front-hair cleanup removes manually selected face/neck fragments only. Approved hair sources and rear layers remain unchanged. No global white key or image transformations.',
  'Standing-reference anatomy studies, not production T-pose assets. Human ears remain embedded; separate facial/ear variants, NE/NW heads, concealed hair, body/clothing and palettes remain unfinished.',
  'This is an unapproved Step 6C correction, not final milestone completion. Step 6D has not started.',
], frames: {}, localFitRepair: { method: settings.method, baseline: await input('front-diagonals-authoring-v1.json'), settings: await input(settingsSource), approved: false, frames: {} } };
delete config.nativeEarOwnership;
for (const direction of ['SE', 'SW']) {
  const original = baseline.frames[direction], plan = settings.frames[direction];
  const master = await load(original.master.source), patches = [];
  for (const patch of plan.patches) {
    const directory = patch.directory === 'head' ? root : hairRoot;
    const study = await load(patch.source, directory), selection = new Uint8Array(master.data.length); let pixelCount = 0;
    for (let i = 0; i < master.data.length; i += 4) {
      const p = i / 4;
      if (!inside(p % 1024 + 0.5, Math.floor(p / 1024) + 0.5, patch.region) || (patch.minimumRedMinusBlue !== undefined && (study.data[i + 3] < 8 || study.data[i] - study.data[i + 2] <= patch.minimumRedMinusBlue))) continue;
      master.data.set(study.data.subarray(i, i + 4), i); selection.fill(255, i, i + 4); pixelCount++;
    }
    patches.push({ name: patch.name, directory: patch.directory, study: await input(patch.source, directory), region: patch.region, ...(patch.minimumRedMinusBlue !== undefined ? { minimumRedMinusBlue: patch.minimumRedMinusBlue } : {}), selection: await save(`inputs/front-diagonals-v2/${direction}-${patch.name}-mask.png`, selection), pixelCount });
  }
  const record = { ...original, master: await save(`${direction}-master-v2.png`, master.data) };
  for (const part of ['head', 'neck']) {
    const data = new Uint8Array(master.data.length), selection = new Uint8Array(master.data.length); let pixelCount = 0;
    for (let i = 0; i < master.data.length; i += 4) {
      if (master.data[i + 3] < 8 || (Math.floor(i / 4 / 1024) < original.cutY) !== (part === 'head')) continue;
      data.set(master.data.subarray(i, i + 4), i); selection.fill(255, i, i + 4); pixelCount++;
    }
    if (part === 'neck' && hash(encode({ width: 1024, height: 1536, channels: 4, depth: 8, data })) === original.neck.sourceSha256) record.neck = original.neck;
    else record[part] = { ...await save(`${direction}-${part}-v2.png`, data), origin: original[part].origin, selection: await save(`inputs/front-diagonals-v2/${direction}-${part}-mask.png`, selection), pixelCount };
  }
  const front = await load(hair.frames[direction].front.artwork.source, hairRoot), mask = new Uint8Array(front.data.length); let removedPixelCount = 0;
  for (let i = 0; i < front.data.length; i += 4) if (front.data[i + 3] >= 8 && plan.frontRegions.some((region) => inside(i / 4 % 1024 + 0.5, Math.floor(i / 4 / 1024) + 0.5, region))) { front.data.fill(0, i, i + 4); mask.fill(255, i, i + 4); removedPixelCount++; }
  config.frames[direction] = record;
  config.localFitRepair.frames[direction] = { patches, front: await save(`${direction}-front-fit-v2.png`, front.data), frontSelection: await save(`inputs/front-diagonals-v2/${direction}-front-cleanup-mask.png`, mask), frontRegions: plan.frontRegions, removedPixelCount };
}
await writeFile(root + 'front-diagonals-authoring-v2.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared complete SE/SW ears, native SE face repair and local SW hair cleanup without transforming approved artwork.');
