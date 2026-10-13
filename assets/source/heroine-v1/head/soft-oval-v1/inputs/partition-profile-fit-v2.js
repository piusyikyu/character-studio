import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const input = async (source) => ({ source, sourceSha256: hash(await readFile(root + source)) });
const inside = (x, y, polygon) => {
  let selected = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) selected = !selected;
  }
  return selected;
};
const baselineBytes = await readFile(root + 'profiles-authoring-v1.json');
const baseline = JSON.parse(baselineBytes);
const result = { ...baseline, assetVersion: 2, knownReviewIssues: [
  'Independent E/W complete skin masters remain unchanged. Visible hair is extracted from each facing\'s own native reference using manual regions. This is a fit candidate, not completion of concealed reusable hair anatomy.',
  'Hair design, native strand edges, ears, cheeks and neck need human visual review. Complete hidden lower hair behind the standing guide arm remains unverified for interchangeable body/T-pose fits.',
  'No mirroring, resampling, translation, recolouring, blur or combination of different facing drawings. One same-facing reference supplies each visible hair matte and both depth layers.',
  'Human ears remain embedded in the skin base. Facial/ear variants, four diagonal heads, body/clothing, material maps and production fit remain unfinished. Step 6C needs final approval before 6D.',
], profileFit: { method: 'single-study/native-hair-partition', baseline: { source: 'profiles-authoring-v1.json', sourceSha256: hash(baselineBytes) }, frames: {} } };
for (const direction of ['E', 'W']) {
  const fit = `inputs/profiles-v2/${direction}-fit.json`, settings = JSON.parse(await readFile(root + fit));
  const studySource = `${direction}-fit-reference-master-v2.png`, bytes = await readFile(root + studySource), study = decode(bytes);
  if (hash(bytes) !== settings.studySha256 || study.width !== 1024 || study.height !== 1536 || study.channels !== 4 || study.depth !== 8) throw new Error('Expected pinned native same-facing study.');
  for (const item of [baseline.frames[direction].master, baseline.frames[direction].head, baseline.frames[direction].neck]) if (hash(await readFile(root + item.source)) !== item.sourceSha256) throw new Error('Anatomy baseline changed.');
  const exclusions = new Set(settings.excludedPixels.map(([x, y]) => y * 1024 + x));
  const master = new Uint8Array(study.data.length), front = new Uint8Array(study.data.length), rear = new Uint8Array(study.data.length), frontMask = new Uint8Array(study.data.length), rearMask = new Uint8Array(study.data.length);
  let frontPixelCount = 0, rearPixelCount = 0;
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    if (study.data[i + 3] < 8 || !settings.hairRegions.some((polygon) => inside(x + 0.5, y + 0.5, polygon)) || exclusions.has(p)) continue;
    if (settings.excludedRegions.some((polygon) => inside(x + 0.5, y + 0.5, polygon)) || (inside(x + 0.5, y + 0.5, settings.skinRegion) && study.data[i] - study.data[i + 2] > settings.skinMinimumRedMinusBlue)) continue;
    const posterior = y >= settings.rearFromY || inside(x + 0.5, y + 0.5, settings.posteriorEarRegion);
    master.set(study.data.subarray(i, i + 4), i);
    (posterior ? rear : front).set(study.data.subarray(i, i + 4), i);
    (posterior ? rearMask : frontMask).fill(255, i, i + 4);
    if (posterior) rearPixelCount++; else frontPixelCount++;
  }
  const save = async (source, data) => { const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
  result.profileFit.frames[direction] = {
    study: await input(studySource), settings: await input(fit),
    master: await save(`${direction}-hair-coherent-master-v2.png`, master),
    front: await save(`${direction}-front-fit-v2.png`, front), rear: await save(`${direction}-rear-fit-v2.png`, rear),
    frontSelection: await save(`inputs/profiles-v2/${direction}-front-mask.png`, frontMask), rearSelection: await save(`inputs/profiles-v2/${direction}-rear-mask.png`, rearMask), frontPixelCount, rearPixelCount,
    facialLandmarks: (direction === 'E' ? [['near-eye', 594, 180], ['nose-tip', 627, 202], ['chin', 596, 249]] : [['near-eye', 414, 186], ['nose-tip', 380, 209], ['chin', 403, 254]]).map(([name, x, y]) => ({ name, position: { x, y } })),
  };
}
await writeFile(root + 'profiles-authoring-v2.json', `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared native profile hair partitions from independent single studies.');
