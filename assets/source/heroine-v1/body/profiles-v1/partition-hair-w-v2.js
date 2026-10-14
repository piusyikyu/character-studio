// Replay only in an isolated scratch copy; original head/hair sources are immutable.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const { decode, encode } = createRequire(resolve(root, '../../../../../tools/asset-validator/package.json'))('fast-png');
const assetRoot = resolve(root, '../..'), baseline = JSON.parse(await readFile(resolve(assetRoot, 'face/reference-v1/brows-v1/authoring.json'), 'utf8')).frames.W.baseline;
const load = async p => { const im = decode(await readFile(resolve(assetRoot, p))); if (im.width !== 1024 || im.height !== 1536 || im.channels !== 4) throw Error('Native W RGBA layer required.'); for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3] < 8) im.data.fill(0, i, i + 4); return im; };
const front = await load(baseline.front.source), rear = await load(baseline.rear.source), toRear = { width: 1024, height: 1536, channels: 4, data: new Uint8Array(1024 * 1536 * 4) }, discard = { ...toRear, data: toRear.data.slice() };
const settings = JSON.parse(await readFile(resolve(root, 'hair-repair-settings-w-v2.json'), 'utf8'));
const contains = (x, y, polygon) => { let yes = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) yes = !yes; } return yes; };
let transferredPixels = 0, discardedPixels = 0;
for (let y = 286; y < 351; y++) for (let x = 478; x < 680; x++) {
 const i = (y * 1024 + x) * 4, sa = front.data[i + 3];
 if (!sa || !contains(x + .5, y + .5, settings.geometry.toRear)) continue;
 const da = rear.data[i + 3];
 if (sa === 255 || !da) rear.data.set(front.data.subarray(i, i + 4), i);
 else { const numerator = sa * 255 + da * (255 - sa); for (let c = 0; c < 3; c++) rear.data[i + c] = Math.round((front.data[i + c] * sa * 255 + rear.data[i + c] * da * (255 - sa)) / numerator); rear.data[i + 3] = Math.round(numerator / 255); }
 front.data.fill(0, i, i + 4); toRear.data.fill(255, i, i + 4); transferredPixels++;
}
for (let y = 603; y < 653; y++) for (let x = 536; x < 559; x++) { const i = (y * 1024 + x) * 4; if (rear.data[i + 3] && contains(x + .5, y + .5, settings.geometry.discard)) { rear.data.fill(0, i, i + 4); discard.data.fill(255, i, i + 4); discardedPixels++; } }
for (const [name, im] of [['W-front-body-fit-v2.png', front], ['W-rear-body-fit-v2.png', rear], ['W-hair-to-rear-v2.png', toRear], ['W-reference-clothing-discard-v2.png', discard]]) await writeFile(resolve(root, name), encode({ ...im, depth: 8 }, { zlib: { level: 9 } }), { flag: 'wx' });
console.log({ transferredPixels, discardedPixels });
