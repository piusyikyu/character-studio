import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face-reference-v1/', guide = decode(await readFile(root + 'inputs/alignment-v4/S-head-alignment-guide.png'));
const shape = [[575, 190], [580, 187], [583, 184], [588, 183], [592, 185], [596, 188], [598, 192], [597, 199], [593, 207], [587, 214], [581, 219], [577, 220], [575, 215], [575, 208], [577, 200]];
const contains = (x, y) => { let selected = false; for (let a = 0, b = shape.length - 1; a < shape.length; b = a++) { const [ax, ay] = shape[a], [bx, by] = shape[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected; } return selected; };
for (let y = 180; y < 230; y++) for (let x = 574; x < 608; x++) { const i = (y * 1024 + x) * 4; guide.data.fill(0, i, i + 4); if (contains(x + .5, y + .5)) guide.data.set([255, 208, 181, 255], i); }
for (let n = 0; n < shape.length; n++) { const a = shape[n], b = shape[(n + 1) % shape.length], steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); for (let j = 0; j <= steps; j++) { const x = Math.round(a[0] + (b[0] - a[0]) * j / steps), y = Math.round(a[1] + (b[1] - a[1]) * j / steps); guide.data.set([168, 69, 66, 255], (y * 1024 + x) * 4); } }
await writeFile(root + 'inputs/alignment-v4/S-left-ear-guide.png', encode(guide), { flag: 'wx' });
await writeFile(root + 'inputs/alignment-v4/left-ear-guide-settings.json', JSON.stringify({ schemaVersion: 1, purpose: 'Manual anatomy silhouette guide only', side: 'character-left / screen-right', shape }, null, 2) + '\n', { flag: 'wx' });
