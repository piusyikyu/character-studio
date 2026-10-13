import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/', hash = bytes => createHash('sha256').update(bytes).digest('hex');
const previousBytes = await readFile(root + 'authoring-v5.json'), previous = JSON.parse(previousBytes), approvalBytes = await readFile(root + 'review-fit-v5.json'), approval = JSON.parse(approvalBytes);
if (approval.decision !== 'approved-standing-reference-fit' || approval.configSha256 !== hash(previousBytes)) throw Error('Approved native S baseline required.');
const settingsSource = 'inputs/brows-v10/ownership-settings.json', settingsBytes = await readFile(root + settingsSource), geometry = JSON.parse(settingsBytes);
const referenceBytes = await readFile('assets/staging/heroine-v1/references/import-v1/transparent/' + previous.reference.source);
if (hash(referenceBytes) !== previous.reference.sourceSha256) throw Error('Native S reference changed.');
const reference = decode(referenceBytes); if (reference.width !== 1024 || reference.height !== 1536 || reference.channels !== 4 || reference.depth !== 8) throw Error('Native RGBA8 required.');
for (let i = 0; i < reference.data.length; i += 4) if (reference.data[i + 3] < 8) reference.data.fill(0, i, i + 4);
const contains = (x, y, polygon) => { let s = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) s = !s; } return s; };
const save = async (source, data) => { const bytes = encode({ width: 1024, height: 1536, depth: 8, channels: 4, data }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
const studySource = 'inputs/brows-v10/S-brow-tail-open-study.png', studyBytes = await readFile(root + studySource), study = decode(studyBytes);
if (study.width !== 1024 || study.height !== 1536 || study.channels !== 4 || study.depth !== 8) throw Error('Native junction study RGBA8 required.');
const coverage = (x, y, polygon) => { let n = 0; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) if (contains(x + (a + .5) / 4, y + (b + .5) / 4, polygon)) n++; return Math.round(n * 255 / 16); };
const features = { ...previous.features };
for (const name of ['rightBrow', 'leftBrow']) {
  const data = new Uint8Array(study.data.length), mask = new Uint8Array(study.data.length); let count = 0;
  for (let y = 159; y <= 186; y++) for (let x = 446; x <= 555; x++) {
    const i = (y * 1024 + x) * 4, value = coverage(x, y, geometry[name]), owner = study; mask.fill(value, i, i + 4);
    if (value) { data.set(owner.data.subarray(i, i + 4), i); data[i + 3] = Math.round(owner.data[i + 3] * value / 255); if (data[i + 3] < 8) data.fill(0, i, i + 4); else count++; }
  }
  features[name] = { ...previous.features[name], ...await save(`S-${name}-v10.png`, data), selection: await save(`inputs/brows-v10/S-${name}-mask.png`, mask), pixelCount: count, owner: 'study' };
}
const originalFrontBytes = await readFile(root + previous.neckEdgeRepair.front.source);
if (hash(originalFrontBytes) !== previous.neckEdgeRepair.front.sourceSha256) throw Error('Approved front source changed.');
const front = decode(originalFrontBytes), reveal = new Uint8Array(front.data.length);
for (let y = 157; y <= 168; y++) for (let x = 543; x <= 556; x++) {
  const i = (y * 1024 + x) * 4, value = Math.min(coverage(x, y, geometry.leftBrow), coverage(x, y, geometry.frontReveal));
  reveal.fill(value, i, i + 4); front.data[i + 3] = Math.round(front.data[i + 3] * (255 - value) / 255); if (front.data[i + 3] < 8) front.data.fill(0, i, i + 4);
}
for (let i = 0; i < front.data.length; i += 4) if (front.data[i + 3] < 8) front.data.fill(0, i, i + 4);
const correctedFront = { ...await save('S-front-fit-v10.png', front.data), selection: await save('inputs/brows-v10/S-front-reveal-mask.png', reveal) };
const config = { ...previous, assetVersion: 10, previous: { source: 'authoring-v5.json', sourceSha256: hash(previousBytes) }, features,
  browRepair: { study: { source: studySource, sourceSha256: hash(studyBytes) }, coverageSamples: 4, front: correctedFront, rejected: { source: 'authoring-v9.json', sourceSha256: hash(await readFile(root + 'authoring-v9.json')) }, settings: { source: settingsSource, sourceSha256: hash(settingsBytes) }, approval: { source: 'review-fit-v5.json', sourceSha256: hash(approvalBytes) } },
  knownReviewIssues: [
    'Revision 10 restores fuller right brow thickness and a complete clean left tail from a same-facing open-forehead study. Both bands retain native study RGB and authored 4x4 alpha coverage.',
    'A narrow mask attenuates foreground-hair alpha only inside the left tail/brow intersection, exposing the missing length while the composition order stays unchanged. All approved source files are preserved.',
    'Head/ears/neck/rear hair, original eyes/mouth/nose, eyelid folds and native anchors remain exact. Study background, temporary forehead window and all unselected generated changes are discarded. No image shifts, scaling, mirroring or colour keys.',
    'Review thickness, curve length, colours, tail point and local fringe junction. This unapproved offline S standing-reference candidate does not certify hidden surfaces, variants/facings, materials, T-pose, independent pixel artwork or final Step 6C acceptance. Step 6D has not started.'
  ] };
await writeFile(root + 'authoring-v10.json', JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log('Prepared native S reference eyebrow separation, preserving approved baseline and eyelid folds.');
