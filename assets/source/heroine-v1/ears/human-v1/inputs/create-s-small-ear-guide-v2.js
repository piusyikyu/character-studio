import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/ears/human-v1/';
const image = decode(await readFile(root + 'S-head-underlay-v2.png'));
const outlines = [
  [[590, 189], [595, 190], [596, 197], [592, 208], [582, 218], [578, 215]],
  [[433, 189], [429, 191], [428, 197], [432, 208], [442, 218], [446, 215]],
];
for (const points of outlines) for (let n = 0; n < points.length; n++) {
  const a = points[n], b = points[(n + 1) % points.length], steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
  for (let j = 0; j <= steps; j++) {
    const x = Math.round(a[0] + (b[0] - a[0]) * j / steps), y = Math.round(a[1] + (b[1] - a[1]) * j / steps);
    image.data.set([0, 200, 255, 255], (y * 1024 + x) * 4);
  }
}
await writeFile(root + 'inputs/S-small-ear-guide-v2.png', encode(image), { flag: 'wx' });
