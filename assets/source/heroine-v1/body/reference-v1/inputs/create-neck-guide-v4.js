// Replay only in scratch: crop a native revision-3 composition by transparency, never transform art.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const { decode, encode } = createRequire(resolve(root, '../../../../../tools/asset-validator/package.json'))('fast-png');
const cfg = JSON.parse(await readFile(resolve(root, 'authoring-v3.json'), 'utf8'));
const im = { width: 1024, height: 1536, channels: 4, depth: 8, data: new Uint8Array(1024 * 1536 * 4) };
for (const p of [cfg.body.source, cfg.jointRepair.head.source]) {
  const layer = decode(await readFile(resolve(root, p)), { checkCrc: true });
  if (layer.width !== 1024 || layer.height !== 1536 || layer.channels !== 4) throw new Error('Native RGBA required.');
  for (let i = 0; i < im.data.length; i += 4) { const sa = layer.data[i + 3], da = im.data[i + 3]; if (sa < 8) continue; if (sa === 255 || !da) { im.data.set(layer.data.subarray(i, i + 4), i); continue; } const n = sa * 255 + da * (255 - sa); for (let c = 0; c < 3; c++) im.data[i + c] = Math.round((layer.data[i + c] * sa * 255 + im.data[i + c] * da * (255 - sa)) / n); im.data[i + 3] = Math.round(n / 255); }
}
im.data.fill(0, 350 * 1024 * 4);
for (let y = 0; y < 350; y++) { im.data.fill(0, y * 1024 * 4, (y * 1024 + 350) * 4); im.data.fill(0, (y * 1024 + 680) * 4, (y + 1) * 1024 * 4); }
await writeFile(resolve(root, 'inputs/S-neck-guide-v4.png'), encode(im, { zlib: { level: 9 } }), { flag: 'wx' });
