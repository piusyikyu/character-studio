// Replay in an isolated scratch copy. Never overwrite versioned source files.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const { decode, encode } = createRequire(resolve(root, '../../../../../tools/asset-validator/package.json'))('fast-png');
const input = await readFile(resolve(root, 'inputs/N-body-study.png'));
const study = decode(input, { checkCrc: true });
if (study.width !== 1024 || study.height !== 1536 || study.channels !== 4) throw new Error('Native 1024x1536 RGBA body study required.');
const selections = JSON.parse(await readFile(resolve(root, 'selections.json'), 'utf8'));
if (selections.method !== 'native-body-study-silhouette' || selections.coverageSamples !== 4) throw new Error('Four-sample native manual silhouette selection required.');
const polygons = [selections.bodyPolygon, selections.handPolygons.physicalRight, selections.handPolygons.physicalLeft];
const samples = new Uint8Array(1024 * 1536);
// Scanline union of the manually traced polygons; sixteen samples per native pixel.
for (let row = 312 * 4; row < 1536 * 4; row++) {
  const y = (row + .5) / 4, intervals = [];
  for (const polygon of polygons) {
    const crossings = [];
    for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
      const [ax, ay] = polygon[a], [bx, by] = polygon[b];
      if ((ay > y) !== (by > y)) crossings.push(ax + (y - ay) * (bx - ax) / (by - ay));
    }
    crossings.sort((a, b) => a - b);
    for (let i = 0; i < crossings.length; i += 2) intervals.push([crossings[i], crossings[i + 1]]);
  }
  intervals.sort((a, b) => a[0] - b[0]);
  const union = [];
  for (const span of intervals) {
    const last = union.at(-1);
    if (last && span[0] <= last[1]) last[1] = Math.max(last[1], span[1]); else union.push([...span]);
  }
  for (const [left, right] of union) {
    const end = Math.min(4096, Math.ceil(right * 4 - .5));
    for (let column = Math.max(0, Math.ceil(left * 4 - .5)); column < end; column++) samples[Math.floor(row / 4) * 1024 + Math.floor(column / 4)]++;
  }
}
// Bounded native contour tolerance preserves the selected study's existing outline/alpha.
// This expands selection masks only; source images remain at their native coordinates.
if (selections.contourTolerancePixels !== 8 || selections.minimumStudyAlpha !== 8) throw new Error('Pinned local contour tolerance required.');
const horizontal = new Uint8Array(samples.length), envelope = new Uint8Array(samples.length);
for (let y = 312; y < 1536; y++) for (let x = 0; x < 1024; x++) {
  let largest = 0;
  for (let k = Math.max(0, x - 8); k <= Math.min(1023, x + 8); k++) largest = Math.max(largest, samples[y * 1024 + k]);
  horizontal[y * 1024 + x] = largest;
}
for (let y = 312; y < 1536; y++) for (let x = 0; x < 1024; x++) {
  let largest = 0;
  for (let k = Math.max(312, y - 8); k <= Math.min(1535, y + 8); k++) largest = Math.max(largest, horizontal[k * 1024 + x]);
  envelope[y * 1024 + x] = largest;
}
const mask = { width: 1024, height: 1536, channels: 4, depth: 8, data: new Uint8Array(1024 * 1536 * 4) };
const body = { ...mask, data: new Uint8Array(mask.data.length) };
for (let p = 0; p < samples.length; p++) {
  const i = p * 4, coverage = Math.round(envelope[p] * 255 / 16), alpha = Math.round(study.data[i + 3] * coverage / 255);
  if (coverage) { mask.data.fill(255, i, i + 3); mask.data[i + 3] = coverage; }
  if (alpha >= 8) { body.data.set(study.data.subarray(i, i + 3), i); body.data[i + 3] = alpha; }
}
for (const [path, image] of [['N-body-mask-v1.png', mask], ['N-body-v1.png', body]]) await writeFile(resolve(root, path), encode(image, { zlib: { level: 9 } }), { flag: 'wx' });
console.log('Partitioned native N body study; generated head and background glow are unselected. SHA256 ' + createHash('sha256').update(input).digest('hex'));

// The accepted standing neck has a bottom outline. Two native attachment rows
// pass to this body only; the accepted source stays unchanged.
const neck = decode(await readFile(resolve(root, '../..', selections.neckOwnership.source)), { checkCrc: true });
const posed = { ...neck, data: neck.data.slice() }, neckMask = { ...mask, data: new Uint8Array(mask.data.length) };
for (let y = selections.neckOwnership.startY; y < selections.neckOwnership.endY; y++) for (let x = 0; x < 1024; x++) {
  const i = (y * 1024 + x) * 4;
  if (neck.data[i + 3] >= 8 && body.data[i + 3] >= 8) { posed.data.fill(0, i, i + 4); neckMask.data.fill(255, i, i + 4); }
}
for (const [p, im] of [['N-neck-body-fit-v1.png', posed], ['N-neck-to-body-v1.png', neckMask]]) await writeFile(resolve(root, p), encode(im, { zlib: { level: 9 } }), { flag: 'wx' });
