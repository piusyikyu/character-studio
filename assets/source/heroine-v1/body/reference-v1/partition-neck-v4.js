// Replay only in scratch. Writes create new outputs and never replace earlier revisions.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const { decode, encode } = createRequire(resolve(root, '../../../../../tools/asset-validator/package.json'))('fast-png');
const cfg = JSON.parse(await readFile(resolve(root, 'authoring-v3.json'), 'utf8')), settings = JSON.parse(await readFile(resolve(root, 'settings-v4.json'), 'utf8')), polygon = settings.polygon;
const load = async p => { const image = decode(await readFile(resolve(root, p)), { checkCrc: true }); if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4) throw new Error('Native RGBA required.'); for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4); return image; };
const [body, head, study] = await Promise.all([load(cfg.body.source), load(cfg.jointRepair.head.source), load('inputs/S-neck-study-v4.png')]);
const mask = { width: 1024, height: 1536, channels: 4, depth: 8, data: new Uint8Array(1024 * 1536 * 4) };
const contains = (x, y, p) => { let yes = false; for (let a = 0, b = p.length - 1; a < p.length; b = a++) { const [ax, ay] = p[a], [bx, by] = p[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) yes = !yes; } return yes; };
const distance = (x, y, p) => Math.min(...p.map((a, j) => { const b = p[(j + 1) % p.length], dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); }));
for (let y = 278; y < 323; y++) for (let x = 488; x < 546; x++) {
  if (!contains(x + .5, y + .5, polygon)) continue;
  const i = (y * 1024 + x) * 4, coverage = Math.round(255 * Math.min(1, distance(x + .5, y + .5, polygon) / settings.feather));
  if (coverage < 8) continue;
  if (study.data[i + 3] < 240) throw new Error('Opaque native interior skin required.');
  mask.data.fill(255, i, i + 3); mask.data[i + 3] = coverage;
  for (const image of [body, head]) if (image.data[i + 3]) for (let c = 0; c < 3; c++) image.data[i + c] = Math.round((image.data[i + c] * (255 - coverage) + study.data[i + c] * coverage) / 255);
}
for (const [name, image] of [['S-body-v4.png', body], ['S-head-body-fit-v4.png', head], ['S-neck-shading-mask-v4.png', mask]]) await writeFile(resolve(root, name), encode(image, { zlib: { level: 9 } }), { flag: 'wx' });
console.log('Selected local neck shading; all alpha silhouettes and outside-mask pixels retained.');
