import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/head-soft-oval-v1/';
const directory = `${root}inputs/front-diagonals-v2/`;
const guides = { SE: { ear: [489, 171, 12, 21] }, SW: { ear: [531, 182, 14, 21] } };
for (const [direction, { ear: [cx, cy, rx, ry] }] of Object.entries(guides)) {
  const image = decode(await readFile(`${root}${direction}-master-v1.png`));
  for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) image.data.set([245, 190, 166, 255], (y * 1024 + x) * 4);
  await writeFile(`${directory}${direction}-ear-guide.png`, encode(image), { flag: 'wx' });
}
await writeFile(`${directory}guide-settings.json`, `${JSON.stringify({ purpose: 'Native complete ear envelopes; synthetic framing only, not artwork.', guides }, null, 2)}\n`, { flag: 'wx' });
const image = decode(await readFile(`${root}SE-master-v1.png`));
const face = [[509, 140], [566, 133], [608, 152], [612, 165], [610, 177], [606, 189], [602, 201], [599, 214], [592, 225], [579, 236], [567, 244], [556, 241], [534, 228], [521, 218], [510, 205]];
const inside = (x, y) => {
  let result = false;
  for (let a = 0, b = face.length - 1; a < face.length; b = a++) {
    const [xa, ya] = face[a], [xb, yb] = face[b];
    if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) result = !result;
  }
  return result;
};
for (let y = 140; y < 246; y++) for (let x = 510; x < 635; x++) {
  const i = (y * 1024 + x) * 4;
  if (inside(x + 0.5, y + 0.5)) image.data.set([248, 206, 180, 255], i);
  else if (x >= 565 || y < 220) image.data.fill(0, i, i + 4);
}
for (let y = 199; y <= 203; y++) for (let x = 589; x <= 593; x++) if ((x - 591) ** 2 + (y - 201) ** 2 <= 5) image.data.set([255, 242, 222, 255], (y * 1024 + x) * 4);
await writeFile(`${directory}SE-face-guide.png`, encode(image), { flag: 'wx' });
await writeFile(`${directory}SE-face-guide.json`, `${JSON.stringify({ purpose: 'Synthetic native jaw silhouette tracing the approved SE design; interior nose highlight at original three-quarter position. Not anatomy/art.', face, nose: [591, 201] }, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared native framing guides only; source anatomy remains unapproved.');
