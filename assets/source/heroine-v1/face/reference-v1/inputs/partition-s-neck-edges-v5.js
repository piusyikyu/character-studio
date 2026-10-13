import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/', headRoot = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const previousBytes = await readFile(root + 'authoring-v4.json'), previous = JSON.parse(previousBytes), r = previous.alignmentRepair;
const settingsSource = 'inputs/neck-edges-v5/ownership-settings.json', settingsBytes = await readFile(root + settingsSource), g = JSON.parse(settingsBytes);
const prompts = JSON.parse(await readFile(root + 'prompts-v5.json'));
const load = async (directory, pin) => {
  const bytes = await readFile(directory + pin.source); if (hash(bytes) !== pin.sourceSha256) throw Error('Pinned input changed: ' + pin.source);
  const image = decode(bytes); if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw Error('Native RGBA8 required.');
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4); return image;
};
const headConfig = JSON.parse(await readFile(headRoot + 'authoring-v5.json'));
const study = await load(root, prompts.selected), anatomyStudy = await load(root, r.study);
const front = await load(root, r.front), rear = await load(root, r.rear), neck = await load(root, r.neck);
const originalRear = await load(headRoot, headConfig.coherentFit.rear), rearReset = await load(root, r.rear.selection), neckReset = await load(root, r.neck.referenceSelection);
const native = () => ({ width: 1024, height: 1536, channels: 4, depth: 8, data: new Uint8Array(1024 * 1536 * 4) });
const frontSelection = native(), rearSelection = native();
const contains = (x, y, polygon) => { let s = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) s = !s; } return s; };
const excluded = new Set(g.excludedStudyPixels.map(([x, y]) => y * 1024 + x)), fragments = new Set(g.frontFragmentPixels.map(([x, y]) => y * 1024 + x));
for (let p = 0; p < 1024 * 1536; p++) {
  const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
  if (rearReset.data[i + 3] === 255) rear.data.set(originalRear.data.subarray(i, i + 4), i);
  if (neckReset.data[i + 3] === 255) neck.data.set(anatomyStudy.data.subarray(i, i + 4), i);
  if (g.frontClearPolygons.some(polygon => contains(x + .5, y + .5, polygon)) || fragments.has(p)) { front.data.fill(0, i, i + 4); frontSelection.data.fill(255, i, i + 4); }
  if (g.backingPolygons.some(polygon => contains(x + .5, y + .5, polygon)) && !excluded.has(p)) { rear.data.set(study.data.subarray(i, i + 4), i); rearSelection.data.fill(255, i, i + 4); }
}
const save = async (source, image) => { const bytes = encode(image); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
const neckEdgeRepair = {
  study: { source: prompts.selected.source, sourceSha256: prompts.selected.sourceSha256 }, settings: { source: settingsSource, sourceSha256: hash(settingsBytes) },
  front: { ...await save('S-front-fit-v5.png', front), selection: await save('inputs/neck-edges-v5/S-front-clear-mask.png', frontSelection) },
  rear: { ...await save('S-rear-fit-v5.png', rear), selection: await save('inputs/neck-edges-v5/S-rear-backing-mask.png', rearSelection) },
  neck: { ...await save('S-neck-fit-v5.png', neck), selection: r.neck.referenceSelection },
};
const config = { ...previous, assetVersion: 5, previous: { source: 'authoring-v4.json', sourceSha256: hash(previousBytes) }, neckEdgeRepair, knownReviewIssues: [
  'Revision 5 replaces disconnected neck-side strips with bounded native S hair backing, clears proximal foreground selection fragments and restores the 23 reference-neck overrides to their original anatomy-study pixels.',
  'Head, both ears, nose, facial feature layers and native anchors remain byte-identical to revision 4. Original coherent hair outside the selected corridors is preserved; no shifts, scaling, mirroring or broad colour keys are applied.',
  'The generated study supplied only manually selected hair pixels. Its changed artwork and opaque background outside those masks are discarded. Source layers remain transparent.',
  'Review neck-side shading, alpha/skin joins and local hair ownership. Complete eyebrows, other facings/expressions/materials, concealed hair, body/clothing, production T-pose, independent pixel artwork and final Step 6C acceptance remain unfinished. Step 6D has not started.'
] };
await writeFile(root + 'authoring-v5.json', JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log('Prepared bounded native S neck-edge fit revision 5 without changing existing source files.');
