import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face-reference-v1/';
const guide = JSON.parse(await readFile(root + 'inputs/eye-fit-guide-v2.json')), bytes = await readFile(guide.head.source);
if (createHash('sha256').update(bytes).digest('hex') !== guide.head.sourceSha256) throw new Error('Approved native head assembly changed; rebuild pinned ear review staging.');
const image = decode(bytes);
for (const points of [...Object.values(guide.eyeGuide), ...Object.values(guide.browGuides)]) for (let n = 0; n < points.length; n++) {
  const a = points[n], b = points[(n + 1) % points.length], steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
  for (let j = 0; j <= steps; j++) {
    const x = Math.round(a[0] + (b[0] - a[0]) * j / steps), y = Math.round(a[1] + (b[1] - a[1]) * j / steps);
    image.data.set([0, 200, 255, 255], (y * 1024 + x) * 4);
  }
}
for (const [x, y] of Object.values(guide.pupilTargets)) for (let t = -2; t <= 2; t++) {
  image.data.set([0, 200, 255, 255], (y * 1024 + x + t) * 4);
  image.data.set([0, 200, 255, 255], ((y + t) * 1024 + x) * 4);
}
await writeFile(root + 'inputs/S-eye-fit-guide-v2.png', encode(image), { flag: 'wx' });
