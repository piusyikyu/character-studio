import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/', headRoot = 'assets/source/heroine-v1/head/soft-oval-v1/';
const hash = bytes => createHash('sha256').update(bytes).digest('hex'), previousBytes = await readFile(root + 'authoring-v3.json'), previous = JSON.parse(previousBytes);
const settingsSource = 'inputs/alignment-v4/ownership-settings.json', settingsBytes = await readFile(root + settingsSource), g = JSON.parse(settingsBytes);
const load = async (directory, pin) => {
  const bytes = await readFile(directory + pin.source); if (pin.sourceSha256 && hash(bytes) !== pin.sourceSha256) throw Error('Pinned input changed: ' + pin.source);
  const image = decode(bytes); if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4 || image.depth !== 8) throw Error('Native RGBA8 required.');
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4); return image;
};
const native = data => ({ width: 1024, height: 1536, channels: 4, depth: 8, data: data ?? new Uint8Array(1024 * 1536 * 4) });
const headConfig = JSON.parse(await readFile(headRoot + 'authoring-v5.json'));
const study = await load(root, { source: 'inputs/alignment-v4/S-contour-neck-study.png' }), reference = await load('assets/staging/heroine-v1/references/import-v1/transparent/', previous.reference);
const originalHead = await load(root, previous.headFit), originalNeck = await load(root, previous.headFit.neck), right = await load(root, previous.headFit.rightEar), originalLeft = await load(root, previous.headFit.leftEar), oldRetention = await load(root, previous.headFit.retention), originalFront = await load(headRoot, headConfig.coherentFit.front), originalRear = await load(headRoot, headConfig.coherentFit.rear);
const features = await Promise.all(Object.values(previous.features).map(pin => load(root, pin)));
const draw = (out, a) => { for (let i = 0; i < out.data.length; i += 4) { const sa = a.data[i + 3]; if (!sa) continue; if (sa === 255 || !out.data[i + 3]) { out.data.set(a.data.subarray(i, i + 4), i); continue; } const da = out.data[i + 3], numerator = sa * 255 + da * (255 - sa); for (let c = 0; c < 3; c++) out.data[i + c] = Math.round((a.data[i + c] * sa * 255 + out.data[i + c] * da * (255 - sa)) / numerator); out.data[i + 3] = Math.round(numerator / 255); } };
const compose = (head, neck, left, retention) => { const out = native(), masked = native(head.data.slice()); for (let i = 0; i < masked.data.length; i += 4) if (!retention.data[i + 3]) masked.data.fill(0, i, i + 4); for (const a of [originalRear, neck, masked, right, left, ...features, originalFront]) draw(out, a); return out; };
const previousFit = compose(originalHead, originalNeck, originalLeft, oldRetention);
const previousFitSha256 = hash(encode(previousFit, { zlib: { level: 9 } }));
if (previousFitSha256 !== '43ba5debb060717c6c92dcb34298a329e5ba8170d55198436c1de8be95291a6f') throw Error('Pinned previous native composition changed.');
const head = native(originalHead.data.slice()), neck = native(originalNeck.data.slice()), left = native(), retention = native(); retention.data.fill(255);
const masks = Object.fromEntries(['head', 'neck', 'neckReference', 'ear', 'earReference', 'front', 'rear'].map(name => [name, native()]));
const inBox = (x, y, b) => x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height;
const contains = (x, y, polygon) => { let s = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) s = !s; } return s; };
const neckPixels = new Set(g.referenceNeckPixels.map(([x, y]) => y * 1024 + x)), earExclusions = new Set(g.referenceEarExclusions.map(([x, y]) => y * 1024 + x));
const earPixels = new Set(g.referenceEarPixels.map(([x, y]) => y * 1024 + x)), frontPixels = new Set(g.frontReferencePixels.map(([x, y]) => y * 1024 + x));
for (let p = 0; p < 1024 * 1536; p++) {
  const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
  if (inBox(x, y, g.headWindow)) { head.data.set(study.data.subarray(i, i + 4), i); masks.head.data.fill(255, i, i + 4); }
  if (x >= 504 && x < 518 && y >= 207 && y < 234) head.data.set(reference.data.subarray(i, i + 4), i);
  if (inBox(x, y, g.neckWindow)) { neck.data.set(study.data.subarray(i, i + 4), i); masks.neck.data.fill(255, i, i + 4); }
  if (neckPixels.has(p)) { neck.data.set(reference.data.subarray(i, i + 4), i); masks.neckReference.data.fill(255, i, i + 4); }
  if (contains(x + .5, y + .5, g.leftEar) && study.data[i + 3] >= 8) { left.data.set(study.data.subarray(i, i + 4), i); masks.ear.data.fill(255, i, i + 4); }
  if ((contains(x + .5, y + .5, g.referenceLeftEar) && !earExclusions.has(p)) || earPixels.has(p)) { left.data.set(reference.data.subarray(i, i + 4), i); masks.earReference.data.fill(255, i, i + 4); }
  if (right.data[i + 3] >= 8 || left.data[i + 3] >= 8) retention.data.fill(0, i, i + 4);
}
const beforeHair = compose(head, neck, left, retention), front = native(originalFront.data.slice()), rear = native(originalRear.data.slice()); let rearSkin = 0;
for (let p = 0; p < 1024 * 1536; p++) {
  const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
  if ((g.frontGapRegions.some(b => inBox(x, y, b)) && reference.data[i + 3] >= 128 && previousFit.data[i + 3] < 8) || frontPixels.has(p)) { front.data.set(reference.data.subarray(i, i + 4), i); masks.front.data.fill(255, i, i + 4); }
  if (g.rearGapRegions.some(b => inBox(x, y, b)) && reference.data[i + 3] >= 128 && beforeHair.data[i + 3] < 8) { rear.data.set(reference.data.subarray(i, i + 4), i); masks.rear.data.fill(255, i, i + 4); const [r, green, b] = reference.data.subarray(i, i + 3); if (r > green + 10 && green > b && green > 90) rearSkin++; }
}
if (rearSkin) throw Error('Inspect rear-hair mask: reference skin found in selected corridor.');
const save = async (source, image) => { const bytes = encode(image); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
const alignmentRepair = {
  study: { source: 'inputs/alignment-v4/S-contour-neck-study.png', sourceSha256: hash(await readFile(root + 'inputs/alignment-v4/S-contour-neck-study.png')) }, settings: { source: settingsSource, sourceSha256: hash(settingsBytes) },
  head: { ...await save('S-head-aligned-v4.png', head), selection: await save('inputs/alignment-v4/S-head-mask.png', masks.head) },
  neck: { ...await save('S-neck-aligned-v4.png', neck), selection: await save('inputs/alignment-v4/S-neck-mask.png', masks.neck), referenceSelection: await save('inputs/alignment-v4/S-reference-neck-mask.png', masks.neckReference) },
  leftEar: { ...await save('S-left-ear-fit-v4.png', left), selection: await save('inputs/alignment-v4/S-left-ear-mask.png', masks.ear), referenceSelection: await save('inputs/alignment-v4/S-reference-left-ear-mask.png', masks.earReference) },
  retention: await save('inputs/alignment-v4/S-head-retention.png', retention),
  front: { ...await save('S-front-fit-v4.png', front), selection: await save('inputs/alignment-v4/S-front-hair-mask.png', masks.front) },
  rear: { ...await save('S-rear-fit-v4.png', rear), selection: await save('inputs/alignment-v4/S-rear-hair-mask.png', masks.rear) },
};
const config = { ...previous, assetVersion: 4, previous: { source: 'authoring-v3.json', sourceSha256: hash(previousBytes) }, alignmentRepair, knownReviewIssues: [
  'Revision 4 locally authors the jaw/upper-neck anatomy using the reviewed comparison-3 tilt as a guide and a smaller complete character-left ear. Original right ear, all reference-owned eyes/brows/mouth and native nose are preserved. This new fit requires visual approval.',
  'Seven bounded masks select native anatomy, reference-visible left-ear pixels, 23 manually inspected neck-edge skin pixels, and same-facing reference hair in the selected cheek/neck gaps. No layer rotation, translation, scaling, mirroring or global colour key is applied.',
  'The original upper skull and lower neck outside the repair windows, and all prior head/ear/hair source files, remain unchanged. Concealed skin/ear geometry, mask transitions, skin joins and inherited hair edge noise still require review.',
  'Only an offline S standing-reference study: other facings, expressions, palette maps, concealed hair/body/clothing, production T-pose and final Step 6C acceptance remain unfinished. No Step 6D approval is implied.'
] };
await writeFile(root + 'authoring-v4.json', JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log('Prepared bounded S alignment/left-ear/hair fit revision 4; native baseline hash preserved.');
