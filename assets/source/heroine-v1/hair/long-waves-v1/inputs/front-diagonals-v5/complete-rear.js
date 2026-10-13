import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// Run from the repository root. Writes new draft files only; never overwrites art.
const require = createRequire(resolve('tools/asset-validator/package.json'));
const { decode, encode } = require('fast-png');
const base = resolve('assets/source/heroine-v1/hair/long-waves-v1');
const inputs = resolve(base, 'inputs/front-diagonals-v5');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const regions = {
  SE: [
    [[450, 150], [597, 140], [630, 160], [636, 225], [623, 262], [596, 297], [525, 319], [475, 290], [452, 225]],
    [[588, 235], [635, 230], [680, 296], [710, 354], [751, 415], [775, 484], [773, 564], [762, 649], [742, 697], [720, 699], [705, 643], [683, 580], [644, 549], [618, 507], [596, 434], [573, 358], [563, 300]],
  ],
  SW: [
    [[376, 151], [551, 147], [578, 187], [575, 250], [551, 299], [509, 353], [457, 372], [409, 337], [373, 258]],
    [[400, 245], [432, 285], [432, 353], [404, 414], [375, 482], [369, 557], [347, 644], [318, 661], [293, 630], [280, 585], [284, 525], [286, 472], [304, 419], [331, 371], [347, 317], [362, 276]],
  ],
};
// Small join repairs may replace old cut-edge pixels in this NEW draft only.
const seams = {
  SE: [[[644, 398], [678, 398], [706, 422], [712, 470], [693, 479], [657, 456], [642, 433]]],
  SW: [
    [[334, 414], [365, 420], [381, 458], [365, 500], [347, 542], [323, 550], [310, 519], [323, 472]],
    [[306, 538], [342, 535], [352, 572], [346, 616], [341, 643], [317, 652], [296, 628], [290, 579]],
  ],
};
function inside(x, y, polygon) {
  let selected = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) selected = !selected;
  }
  return selected;
}
const config = JSON.parse(await readFile(resolve(base, 'front-diagonals-authoring-v4.json'), 'utf8'));
const records = [];
for (const direction of ['SE', 'SW']) {
  const baseSource = config.frames[direction].rear;
  const originalBytes = await readFile(resolve(base, baseSource.source));
  if (sha256(originalBytes) !== baseSource.sourceSha256) throw new Error('Accepted rear source hash changed.');
  const generatedSource = `inputs/front-diagonals-v5/${direction}-rear-completion-raw.png`;
  const generatedBytes = await readFile(resolve(base, generatedSource));
  const original = decode(originalBytes), generated = decode(generatedBytes);
  for (const image of [original, generated]) if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw new Error('Native RGBA8 artwork required; no resizing.');
  const data = new Uint8Array(original.data), mask = new Uint8Array(data.length);
  let pixelCount = 0, addedPixels = 0, changedPixels = 0;
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    const i = (y * 1024 + x) * 4;
    const selected = (original.data[i + 3] ? seams[direction] : regions[direction]).some((polygon) => inside(x + 0.5, y + 0.5, polygon));
    if (!selected || generated.data[i + 3] < 8) continue;
    if (original.data[i + 3]) changedPixels++;
    else addedPixels++;
    data.set(generated.data.subarray(i, i + 4), i);
    mask.set([255, 255, 255, 255], i);
    pixelCount++;
  }
  const maskSource = `inputs/front-diagonals-v5/${direction}-completion-mask.png`;
  const outputSource = `${direction}-rear-drape-v5.png`;
  const png = (pixels) => encode({ width: 1024, height: 1536, channels: 4, depth: 8, data: pixels });
  const maskBytes = png(mask), outputBytes = png(data);
  await writeFile(resolve(base, maskSource), maskBytes, { flag: 'wx' });
  await writeFile(resolve(base, outputSource), outputBytes, { flag: 'wx' });
  records.push({ direction, base: { source: baseSource.source, sourceSha256: sha256(originalBytes) }, artwork: { source: generatedSource, sourceSha256: sha256(generatedBytes) }, selection: { source: maskSource, sourceSha256: sha256(maskBytes) }, pixelCount, addedPixels, changedPixels, output: { source: outputSource, sourceSha256: sha256(outputBytes) }, additionPolygons: regions[direction], seamPolygons: seams[direction] });
}
await writeFile(resolve(inputs, 'completion-v5.json'), JSON.stringify({ schemaVersion: 1, method: 'manual-native-masked-rear-completion', minimumVisibleAlpha: 8, policy: 'Copy generated RGBA into selected alpha-zero locations and narrowly bounded cut-edge repairs in a new draft. Keep accepted rear pixels outside the masks exact, never erase restored reference coverage, and preserve front/head sources. Original approved files remain unchanged. No resampling, mirroring or recolouring.', records }, null, 2) + '\n', { flag: 'wx' });
console.log(records.map(({ direction, pixelCount, addedPixels, changedPixels }) => ({ direction, pixelCount, addedPixels, changedPixels })));
