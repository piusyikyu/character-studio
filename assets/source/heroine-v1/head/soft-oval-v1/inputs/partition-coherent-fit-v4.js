import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const baselineBytes = await readFile(`${root}authoring-v2.json`), config = JSON.parse(baselineBytes);
const settingsBytes = await readFile(`${root}inputs/coherent-fit-v4.json`), settings = JSON.parse(settingsBytes);
const studyBytes = await readFile(`${root}S-seam-study-master-v3.png`);
if (hash(studyBytes) !== settings.studySha256) throw new Error('The single study source changed.');
const study = decode(studyBytes);
if (study.width !== 1024 || study.height !== 1536 || study.channels !== 4 || study.depth !== 8) throw new Error('Native RGBA8 study required.');
const inside = (x, y, polygon) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
};
const master = new Uint8Array(study.data.length), front = new Uint8Array(study.data.length), rear = new Uint8Array(study.data.length);
const frontMask = new Uint8Array(study.data.length), rearMask = new Uint8Array(study.data.length);
const exclusions = new Set(settings.excludedPixels.map(([x, y]) => y * 1024 + x));
let frontPixelCount = 0, rearPixelCount = 0;
for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
  const p = y * 1024 + x, i = p * 4;
  const skin = inside(x + 0.5, y + 0.5, settings.skinRegion) && study.data[i] - study.data[i + 2] > settings.skinMinimumRedMinusBlue;
  if (study.data[i + 3] < settings.minimumVisibleAlpha || skin || exclusions.has(p)) continue;
  const posterior = y >= settings.rearFromY || inside(x + 0.5, y + 0.5, settings.posteriorEarRegion);
  master.set(study.data.subarray(i, i + 4), i);
  (posterior ? rear : front).set(study.data.subarray(i, i + 4), i);
  (posterior ? rearMask : frontMask).fill(255, i, i + 4);
  if (posterior) rearPixelCount++; else frontPixelCount++;
}
const save = async (source, data) => {
  const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data });
  await writeFile(`${root}${source}`, bytes, { flag: 'wx' });
  return { source, sourceSha256: hash(bytes) };
};
const landmarks = config.fringeFit.facialLandmarks;
delete config.fringeFit;
config.assetVersion = 4;
config.coherentFit = {
  direction: 'S', method: settings.method,
  baseline: { source: 'authoring-v2.json', sourceSha256: hash(baselineBytes) },
  approval: { source: 'review-fit-v2.json', sourceSha256: hash(await readFile(`${root}review-fit-v2.json`)) },
  study: { source: 'S-seam-study-master-v3.png', sourceSha256: hash(studyBytes) },
  settings: { source: 'inputs/coherent-fit-v4.json', sourceSha256: hash(settingsBytes) },
  master: await save('S-hair-coherent-master-v4.png', master),
  front: await save('S-front-fit-v4.png', front), rear: await save('S-rear-fit-v4.png', rear),
  frontSelection: await save('inputs/S-front-fit-mask-v4.png', frontMask), rearSelection: await save('inputs/S-rear-fit-mask-v4.png', rearMask),
  frontPixelCount, rearPixelCount, facialLandmarks: landmarks, approved: false,
};
config.knownReviewIssues[1] = 'Revision 3 local patches were visually rejected: different source contours left disjoint strokes and cropped cheeks. Revision 4 partitions the entire S hair from a single shared study at native coordinates. Complete head/neck anatomy, approved v2 and N remain unchanged. Ear depth, matte quality and full anatomy require human review; this is not production T-pose approval.';
await writeFile(`${root}authoring-v4.json`, `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log(`Partitioned one native S hair drawing: ${frontPixelCount} foreground and ${rearPixelCount} rear pixels.`);
