import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/inputs/back-diagonals-v1/';
const image = decode(await readFile(root + 'NW-placement-guide.png'));
for (let y = 165; y <= 207; y++) for (let x = 416; x <= 434; x++) {
  const ellipse = ((x - 425) / 8) ** 2 + ((y - 186) / 20) ** 2;
  if (ellipse <= 1) image.data.set(ellipse > 0.78 ? [181, 121, 111, 255] : [255, 219, 186, 255], (y * 1024 + x) * 4);
}
await writeFile(root + 'NW-ear-placement-guide-v2.png', encode(image), { flag: 'wx' });
