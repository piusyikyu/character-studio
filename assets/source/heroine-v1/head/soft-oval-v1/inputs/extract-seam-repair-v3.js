import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const baselineBytes = await readFile(`${root}authoring-v2.json`);
const config = JSON.parse(baselineBytes);
const settingsBytes = await readFile(`${root}inputs/seam-repair-v3.json`);
const settings = JSON.parse(settingsBytes);
const read = async (path, expected) => {
  const bytes = await readFile(path);
  if (expected && hash(bytes) !== expected) throw new Error(`${path}: pinned input changed.`);
  const image = decode(bytes);
  if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 inputs required.');
  return image;
};
const front = await read(`${root}${config.fringeFit.front.source}`, config.fringeFit.front.sourceSha256);
const rear = await read(`${root}${config.fringeFit.rear.source}`, config.fringeFit.rear.sourceSha256);
const baselineRear = rear.data.slice();
const head = await read(`${root}${config.frames.S.head.source}`, config.frames.S.head.sourceSha256);
const neck = await read(`${root}${config.frames.S.neck.source}`, config.frames.S.neck.sourceSha256);
const studyBytes = await readFile(`${root}S-seam-study-master-v3.png`);
const study = await read(`${root}S-seam-study-master-v3.png`);
const reference = await read('assets/staging/heroine-v1/references/import-v1/transparent/S.png', config.frames.S.referenceSha256);
const inside = (x, y, polygon) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
};
const mask = new Uint8Array(front.data.length), earMask = new Uint8Array(front.data.length), neckMask = new Uint8Array(front.data.length);
let pixelCount = 0, earPixelCount = 0, neckPixelCount = 0;
for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
  const i = (y * 1024 + x) * 4;
  const exposedSkin = (head.data[i + 3] >= 8 || neck.data[i + 3] >= 8) && front.data[i + 3] < 8;
  const warmSkin = study.data[i] - study.data[i + 2] > 40 && study.data[i + 1] - study.data[i + 2] > 15;
  const selected = settings.polygons.some((p) => inside(x + 0.5, y + 0.5, p)) && !exposedSkin && !warmSkin;
  const earSelected = settings.earPolygons.some((p) => inside(x + 0.5, y + 0.5, p));
  const earHair = reference.data[i + 3] >= 8 && reference.data[i] - reference.data[i + 2] <= settings.earMaximumRedMinusBlue;
  const earFront = earSelected && earHair && settings.earFrontPolygons.some((p) => inside(x + 0.5, y + 0.5, p));
  const neckSelected = settings.neckPolygons.some((p) => inside(x + 0.5, y + 0.5, p));
  const neckHair = neckSelected && reference.data[i + 3] >= 8 && reference.data[i] - reference.data[i + 2] <= settings.neckMaximumRedMinusBlue && settings.neckFrontPolygons.some((p) => inside(x + 0.5, y + 0.5, p));
  if (selected) {
    mask.fill(255, i, i + 4); pixelCount++;
    if (study.data[i + 3] >= 8 && reference.data[i + 3] >= 8) front.data.set(study.data.subarray(i, i + 4), i);
    else front.data.fill(0, i, i + 4);
    rear.data.fill(0, i, i + 4);
  }
  if (earSelected) {
    earMask.fill(255, i, i + 4); earPixelCount++;
    if (earFront) front.data.set(reference.data.subarray(i, i + 4), i); else front.data.fill(0, i, i + 4);
    if (earHair) {
      if (earFront) rear.data.fill(0, i, i + 4); else rear.data.set(reference.data.subarray(i, i + 4), i);
    } else rear.data.set(baselineRear.subarray(i, i + 4), i);
  }
  if (neckSelected) {
    neckMask.fill(255, i, i + 4); neckPixelCount++;
    if (neckHair) front.data.set(reference.data.subarray(i, i + 4), i); else front.data.fill(0, i, i + 4);
    if (earSelected && neckHair) rear.data.fill(0, i, i + 4);
  }
}
const save = async (source, data) => {
  const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data });
  await writeFile(`${root}${source}`, bytes, { flag: 'wx' });
  return { source, sourceSha256: hash(bytes) };
};
config.assetVersion = 3;
config.seamRepair = {
  direction: 'S', method: settings.method,
  baseline: { source: 'authoring-v2.json', sourceSha256: hash(baselineBytes) },
  approval: { source: 'review-fit-v2.json', sourceSha256: hash(await readFile(`${root}review-fit-v2.json`)) },
  settings: { source: 'inputs/seam-repair-v3.json', sourceSha256: hash(settingsBytes) },
  study: { source: 'S-seam-study-master-v3.png', sourceSha256: hash(studyBytes) },
  selection: await save('inputs/S-seam-mask-v3.png', mask),
  earSelection: await save('inputs/S-left-ear-hair-mask-v3.png', earMask),
  neckSelection: await save('inputs/S-neck-hair-mask-v3.png', neckMask),
  front: await save('S-front-fit-v3.png', front.data), rear: await save('S-rear-fit-v3.png', rear.data),
  pixelCount, earPixelCount, neckPixelCount, approved: false,
};
config.knownReviewIssues[1] = 'Revision 3 splits S ear-area hair into reference-native foreground bang and posterior lock, with the complete head/ear rendering between them. Local neck masks clear skin-coloured contamination from reference curls. Temple study patches, full anatomy and future body/T-pose fit still require visual review. Approved revision-2 inputs, full head/neck anatomy and N remain unchanged.';
await writeFile(`${root}authoring-v3.json`, `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log(`Retained ${pixelCount} seam-mask pixels, ${earPixelCount} ear-depth mask pixels and ${neckPixelCount} neck-cleanup mask pixels.`);
