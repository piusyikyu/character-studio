import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/', hash = bytes => createHash('sha256').update(bytes).digest('hex');
const config = JSON.parse(await readFile(root + 'authoring-v4.json')), r = config.alignmentRepair;
const load = async pin => { const bytes = await readFile(root + pin.source); if (hash(bytes) !== pin.sourceSha256) throw Error('Pinned guide input changed.'); const image = decode(bytes); for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4); return image; };
const head = await load(r.head), retention = await load(r.retention);
for (let i = 0; i < head.data.length; i += 4) if (!retention.data[i + 3]) head.data.fill(0, i, i + 4);
const parts = [await load(r.rear), await load(r.neck), head, await load(config.headFit.rightEar), await load(r.leftEar), ...await Promise.all(Object.values(config.features).map(load)), await load(r.front)];
const image = { width: 1024, height: 1536, channels: 4, depth: 8, data: new Uint8Array(1024 * 1536 * 4) };
for (const part of parts) for (let i = 0; i < image.data.length; i += 4) {
  const sa = part.data[i + 3], da = image.data[i + 3]; if (!sa) continue;
  if (sa === 255 || !da) { image.data.set(part.data.subarray(i, i + 4), i); continue; }
  const n = sa * 255 + da * (255 - sa); for (let c = 0; c < 3; c++) image.data[i + c] = Math.round((part.data[i + c] * sa * 255 + image.data[i + c] * da * (255 - sa)) / n); image.data[i + 3] = Math.round(n / 255);
}
if (hash(encode(image, { zlib: { level: 9 } })) !== 'e850aca7d6ae7f04c503524dd472a3f9a8bc1b6cd84695650bff24099b202545') throw Error('Native revision-4 guide baseline changed.');
const g = JSON.parse(await readFile(root + 'inputs/neck-edges-v5/guide-settings.json'));
const contains = (x, y) => { let s = false; for (let a = 0, b = g.polygon.length - 1; a < g.polygon.length; b = a++) { const [ax, ay] = g.polygon[a], [bx, by] = g.polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) s = !s; } return s; };
for (let y = 240; y < 330; y++) for (let x = 470; x < 565; x++) if (contains(x + .5, y + .5)) image.data.set([255, 0, 170, 255], (y * 1024 + x) * 4);
await writeFile(root + 'inputs/neck-edges-v5/S-hair-backing-guide.png', encode(image), { flag: 'wx' });
console.log('Replayed native concealed-hair guide from pinned revision-4 layers.');
