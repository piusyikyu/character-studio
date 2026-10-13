import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const baselineBytes = await readFile(`${root}authoring-v4.json`), config = JSON.parse(baselineBytes);
const previous = config.coherentFit;
const settingsBytes = await readFile(`${root}inputs/coherent-fit-v5.json`), settings = JSON.parse(settingsBytes);
const read = async (input) => {
  const bytes = await readFile(`${root}${input.source}`);
  if (hash(bytes) !== input.sourceSha256) throw new Error(`${input.source}: baseline source changed.`);
  const image = decode(bytes);
  if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 inputs required.');
  return image;
};
const front = await read(previous.front), rear = await read(previous.rear), master = await read(previous.master);
const inside = (x, y, polygon) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
};
const frontMask = new Uint8Array(front.data.length), rearMask = new Uint8Array(front.data.length);
let moved = 0, frontPixelCount = 0, rearPixelCount = 0;
for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
  const i = (y * 1024 + x) * 4;
  if (front.data[i + 3] && inside(x + 0.5, y + 0.5, settings.posteriorEarRegion)) {
    if (rear.data[i + 3]) throw new Error('Hair owners overlap.');
    rear.data.set(front.data.subarray(i, i + 4), i); front.data.fill(0, i, i + 4); moved++;
  }
  const owner = front.data[i + 3] ? front : rear;
  for (let c = 0; c < 4; c++) if (owner.data[i + c] !== master.data[i + c]) throw new Error('The complete hair drawing changed.');
  if (front.data[i + 3]) { frontMask.fill(255, i, i + 4); frontPixelCount++; }
  if (rear.data[i + 3]) { rearMask.fill(255, i, i + 4); rearPixelCount++; }
}
const save = async (source, data) => {
  const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data });
  await writeFile(`${root}${source}`, bytes, { flag: 'wx' });
  return { source, sourceSha256: hash(bytes) };
};
config.assetVersion = 5;
config.coherentFit = {
  ...previous,
  ownershipBaseline: { source: 'authoring-v4.json', sourceSha256: hash(baselineBytes) },
  settings: { source: 'inputs/coherent-fit-v5.json', sourceSha256: hash(settingsBytes) },
  front: await save('S-front-fit-v5.png', front.data), rear: await save('S-rear-fit-v5.png', rear.data),
  frontSelection: await save('inputs/S-front-fit-mask-v5.png', frontMask), rearSelection: await save('inputs/S-rear-fit-mask-v5.png', rearMask),
  frontPixelCount, rearPixelCount,
};
config.knownReviewIssues[1] = 'Revision 4 hair contours looked acceptable to the user, but lower left-ear skin remained obscured in the assembled overview. Revision 5 moves 247 existing hair pixels behind the complete ear using a contour-shaped ownership region. The complete revision-4 hair drawing, all retained RGBA, head/neck, approved sources and N remain unchanged. Ear depth and complete anatomy still require visual review.';
await writeFile(`${root}authoring-v5.json`, `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log(`Moved ${moved} existing hair pixels behind the ear; unchanged complete hair drawing. Front ${frontPixelCount}, rear ${rearPixelCount}.`);
