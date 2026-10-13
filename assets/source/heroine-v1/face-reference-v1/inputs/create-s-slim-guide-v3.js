import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face-reference-v1/', guide = JSON.parse(await readFile(root + 'inputs/slim-face-guide-v3.json')), polygon = guide.contour;
const original = decode(await readFile('assets/source/heroine-v1/ears-human-v1/S-head-underlay-v2.png'));
const mark = (image) => {
  for (let n = 0; n < polygon.length - 1; n++) {
    const a = polygon[n], b = polygon[n + 1], steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    for (let j = 0; j <= steps; j++) { const x = Math.round(a[0] + (b[0] - a[0]) * j / steps), y = Math.round(a[1] + (b[1] - a[1]) * j / steps); image.data.set([0, 200, 255, 255], (y * 1024 + x) * 4); }
  }
  const [x, y] = guide.noseTarget;
  for (let t = -2; t <= 2; t++) { image.data.set([0, 200, 255, 255], (y * 1024 + x + t) * 4); image.data.set([0, 200, 255, 255], ((y + t) * 1024 + x) * 4); }
};
const initial = { ...original, data: new Uint8Array(original.data) }; mark(initial);
await writeFile(root + 'inputs/S-slim-face-guide-v3.png', encode(initial), { flag: 'wx' });
const contains = (x, y) => { let selected = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected; } return selected; };
const clipped = { ...original, data: new Uint8Array(original.data) };
for (let y = 170; y < 278; y++) for (let x = 420; x < 610; x++) {
  const i = (y * 1024 + x) * 4, neck = y >= 255 && x >= (y < 268 ? 493 : Math.round(493 - (y - 268) * 1.2)) && x < (y < 268 ? 538 : Math.round(538 + (y - 268) * 0.5));
  if (!contains(x + 0.5, y + 0.5) && !neck) clipped.data.fill(0, i, i + 4);
  if (neck && y >= 268) clipped.data.set([255, 218, 194, 255], i);
}
mark(clipped); await writeFile(root + 'inputs/S-slim-face-guide-v3-clipped.png', encode(clipped), { flag: 'wx' });
const reference = decode(await readFile('assets/staging/heroine-v1/reference-import-v1/transparent/S.png'));
for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) if (x < 430 || x > 605 || y < 85 || y >= 278) reference.data.fill(0, (y * 1024 + x) * 4, (y * 1024 + x) * 4 + 4);
await writeFile(root + 'inputs/S-native-face-reference-v3.png', encode(reference), { flag: 'wx' });
