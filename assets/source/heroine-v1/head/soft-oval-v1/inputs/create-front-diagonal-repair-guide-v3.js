import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head/soft-oval-v1/';
const image = decode(await readFile(`${root}SW-master-v2.png`));
const face = [[406, 181], [410, 196], [414, 210], [419, 220], [424, 237], [432, 247], [444, 258], [456, 263], [468, 258], [482, 249], [497, 239], [510, 218], [519, 198]];
const inside = (x, y) => {
  let result = false;
  for (let a = 0, b = face.length - 1; a < face.length; b = a++) {
    const [xa, ya] = face[a], [xb, yb] = face[b];
    if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) result = !result;
  }
  return result;
};
for (let y = 181; y < 264; y++) for (let x = 395; x < 520; x++) {
  const i = (y * 1024 + x) * 4;
  if (inside(x + 0.5, y + 0.5)) image.data.set([249, 204, 179, 255], i);
  else if (x < 445) image.data.fill(0, i, i + 4);
}
for (let y = 221; y < 226; y++) for (let x = 419; x < 424; x++) if ((x - 421) ** 2 + (y - 223) ** 2 <= 4) image.data.set([255, 245, 225, 255], (y * 1024 + x) * 4);
await writeFile(`${root}inputs/front-diagonals-v3/SW-face-guide.png`, encode(image), { flag: 'wx' });
await writeFile(`${root}inputs/front-diagonals-v3/guide-settings.json`, `${JSON.stringify({ purpose: 'Synthetic native SW face framing only, not skin artwork.', face, nose: [421, 223] }, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared native SW face guide without altering prior artwork.');
