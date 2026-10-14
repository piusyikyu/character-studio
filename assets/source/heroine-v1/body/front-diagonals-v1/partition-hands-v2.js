// Replay only in scratch. Restore SE's own native study pixels inside two hand windows.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const { decode, encode } = createRequire(resolve(root, '../../../../../tools/asset-validator/package.json'))('fast-png');
const study = decode(await readFile(resolve(root, 'inputs/SE-body-study-v1.png'))), body = decode(await readFile(resolve(root, 'SE-body-v1.png'))), mask = decode(await readFile(resolve(root, 'SE-body-mask-v1.png'))), settings = JSON.parse(await readFile(resolve(root, 'hand-repair-settings-v2.json'), 'utf8'));
if ([study, body, mask].some(im => im.width !== 1024 || im.height !== 1536 || im.channels !== 4)) throw new Error('Native SE repair inputs required.');
const contains = (x, y, polygon) => { let inside = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside; } return inside; };
for (const { window, polygons } of Object.values(settings.hands)) for (let y = window.y; y < window.y + window.height; y++) for (let x = window.x; x < window.x + window.width; x++) {
 const i = (y * 1024 + x) * 4; let samples = 0;
 for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (polygons.some(polygon => contains(x + (sx + .5) / 4, y + (sy + .5) / 4, polygon))) samples++;
 const coverage = Math.round(samples * 255 / 16), alpha = Math.round(study.data[i + 3] * coverage / 255);
 mask.data.fill(0, i, i + 4); body.data.fill(0, i, i + 4);
 if (coverage) { mask.data.fill(255, i, i + 3); mask.data[i + 3] = coverage; }
 if (alpha >= 8) { body.data.set(study.data.subarray(i, i + 3), i); body.data[i + 3] = alpha; }
}
for (const [name, image] of [['SE-body-v2.png', body], ['SE-body-mask-v2.png', mask]]) await writeFile(resolve(root, name), encode({ ...image, depth: 8 }, { zlib: { level: 9 } }), { flag: 'wx' });
console.log('Replayed bounded SE hand silhouettes at native coordinates.');
