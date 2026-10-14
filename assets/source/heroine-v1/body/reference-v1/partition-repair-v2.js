// Replay only in a scratch copy. All outputs are new revisions; writes never replace source files.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = fileURLToPath(new URL('.', import.meta.url)), assets = resolve(root, '../..');
const { decode, encode } = createRequire(resolve(root, '../../../../../tools/asset-validator/package.json'))('fast-png');
const load = async p => { const im = decode(await readFile(p), { checkCrc: true }); if (im.width !== 1024 || im.height !== 1536 || im.channels !== 4) throw new Error('Native RGBA framing required.'); for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3] < 8) im.data.fill(0, i, i + 4); return im; };
const config = JSON.parse(await readFile(resolve(root, 'authoring.json'), 'utf8')), settings = JSON.parse(await readFile(resolve(root, 'settings-v2.json'), 'utf8')), g = settings.geometry;
const [original, stencil, study, oldFront, oldRear] = await Promise.all([load(resolve(root, config.body.source)), load(resolve(root, config.selection.source)), load(resolve(root, 'inputs/S-underwear-study-v2.png')), load(resolve(assets, config.frontHair.source)), load(resolve(assets, config.rearHair.source))]);
const empty = () => ({ width: 1024, height: 1536, channels: 4, depth: 8, data: new Uint8Array(1024 * 1536 * 4) });
const body = { ...original, data: original.data.slice() }, front = { ...oldFront, data: oldFront.data.slice() }, rear = { ...oldRear, data: oldRear.data.slice() }, torsoMask = empty(), toRear = empty(), toFront = empty();
const contains = (x, y, polygon) => { let yes = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) yes = !yes; } return yes; };
const drawPixel = (destination, source, i) => { const sa = source[i + 3], da = destination[i + 3]; if (!sa) return; if (sa === 255 || !da) { destination.set(source.subarray(i, i + 4), i); return; } const n = sa * 255 + da * (255 - sa); for (let c = 0; c < 3; c++) destination[i + c] = Math.round((source[i + c] * sa * 255 + destination[i + c] * da * (255 - sa)) / n); destination[i + 3] = Math.round(n / 255); };
for (let y = 324; y < 737; y++) for (let x = 371; x < 652; x++) {
  let samples = 0; for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, g.torso)) samples++;
  if (!samples) continue;
  const i = (y * 1024 + x) * 4, coverage = Math.round(samples * 255 / 16), alpha = Math.round(study.data[i + 3] * stencil.data[i + 3] / 255), newAlpha = alpha < 8 ? 0 : alpha;
  torsoMask.data.fill(255, i, i + 3); torsoMask.data[i + 3] = coverage;
  for (let c = 0; c < 4; c++) { const incoming = c === 3 ? newAlpha : newAlpha ? study.data[i + c] : 0; body.data[i + c] = Math.round((original.data[i + c] * (255 - coverage) + incoming * coverage) / 255); }
  if (body.data[i + 3] < 8) body.data.fill(0, i, i + 4);
}
for (let y = 323; y < 355; y++) for (let x = 325; x < 765; x++) {
  const i = (y * 1024 + x) * 4;
  if (contains(x + .5, y + .5, g.rearWindow) && (!g.frontCurls.some(p => contains(x + .5, y + .5, p)) || g.curlVoids.some(p => contains(x + .5, y + .5, p))) && oldFront.data[i + 3]) { toRear.data.fill(255, i, i + 4); drawPixel(rear.data, oldFront.data, i); front.data.fill(0, i, i + 4); }
  if (g.curlTips.some(p => contains(x + .5, y + .5, p)) && oldRear.data[i + 3]) { toFront.data.fill(255, i, i + 4); drawPixel(front.data, oldRear.data, i); rear.data.fill(0, i, i + 4); }
}
for (const [name, image] of [['S-body-v2.png', body], ['S-torso-mask-v2.png', torsoMask], ['S-front-body-fit-v2.png', front], ['S-rear-body-fit-v2.png', rear], ['S-hair-to-rear-mask-v2.png', toRear], ['S-hair-to-front-mask-v2.png', toFront]]) await writeFile(resolve(root, name), encode(image, { zlib: { level: 9 } }), { flag: 'wx' });
console.log('Selected native two-piece torso repair and same-facing hair depth masks.');
