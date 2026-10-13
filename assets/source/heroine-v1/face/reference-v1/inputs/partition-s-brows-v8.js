import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/', hash = bytes => createHash('sha256').update(bytes).digest('hex');
const previousBytes = await readFile(root + 'authoring-v5.json'), previous = JSON.parse(previousBytes), approvalBytes = await readFile(root + 'review-fit-v5.json'), approval = JSON.parse(approvalBytes);
if (approval.decision !== 'approved-standing-reference-fit' || approval.configSha256 !== hash(previousBytes)) throw Error('Approved native S baseline required.');
const settingsSource = 'inputs/brows-v8/ownership-settings.json', settingsBytes = await readFile(root + settingsSource), geometry = JSON.parse(settingsBytes);
const referenceBytes = await readFile('assets/staging/heroine-v1/references/import-v1/transparent/' + previous.reference.source);
if (hash(referenceBytes) !== previous.reference.sourceSha256) throw Error('Native S reference changed.');
const reference = decode(referenceBytes); if (reference.width !== 1024 || reference.height !== 1536 || reference.channels !== 4 || reference.depth !== 8) throw Error('Native RGBA8 required.');
for (let i = 0; i < reference.data.length; i += 4) if (reference.data[i + 3] < 8) reference.data.fill(0, i, i + 4);
const contains = (x, y, polygon) => { let s = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) s = !s; } return s; };
const save = async (source, data) => { const bytes = encode({ width: 1024, height: 1536, depth: 8, channels: 4, data }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
const studySource = 'inputs/brows-v8/S-brow-junction-study.png', studyBytes = await readFile(root + studySource), study = decode(studyBytes);
if (study.width !== 1024 || study.height !== 1536 || study.channels !== 4 || study.depth !== 8) throw Error('Native junction study RGBA8 required.');
const junctions = {}, features = { ...previous.features };
for (const name of ['rightBrow', 'leftBrow']) {
  const data = new Uint8Array(reference.data.length), mask = new Uint8Array(reference.data.length), junction = new Uint8Array(reference.data.length); let count = 0;
  for (let p = 0; p < 1024 * 1536; p++) if (contains(p % 1024 + .5, Math.floor(p / 1024) + .5, geometry[name])) { const i = p * 4; const local = contains(p % 1024 + .5, Math.floor(p / 1024) + .5, geometry.junctions[name]), owner = local ? study : reference; data.set(owner.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); if (local) junction.fill(255, i, i + 4); if (owner.data[i + 3] >= 8) count++; }
  features[name] = { ...previous.features[name], ...await save(`S-${name}-v8.png`, data), selection: await save(`inputs/brows-v8/S-${name}-mask.png`, mask), pixelCount: count, owner: 'reference-and-study' };
  junctions[name] = await save(`inputs/brows-v8/S-${name}-junction-mask.png`, junction);
}
const config = { ...previous, assetVersion: 8, previous: { source: 'authoring-v5.json', sourceSha256: hash(previousBytes) }, features,
  browRepair: { study: { source: studySource, sourceSha256: hash(studyBytes) }, junctions, rejected: { source: 'authoring-v7.json', sourceSha256: hash(await readFile(root + 'authoring-v7.json')) }, settings: { source: settingsSource, sourceSha256: hash(settingsBytes) }, approval: { source: 'review-fit-v5.json', sourceSha256: hash(approvalBytes) } },
  knownReviewIssues: [
    'Revision 8 removes the rejected revision-7 perpendicular fringe fragments from both brow contours. Two bounded study masks reconstruct the crossed junctions; other brow pixels retain native reference ownership.',
    'Approved revision-5 head, ears, nose, neck, hair, eyes, mouth, upper-eyelid folds and anchors are unchanged. Actual foreground hair occludes the brows; no transforms, mirroring or colour keys.',
    'Only selected study pixels inside the native brow bands are retained. Its background and all other generated edits are discarded. Review junction continuity, local colour joins and hair occlusion.',
    'This is an unapproved offline standing-reference candidate. Concealed geometry, expressions, other facings, materials, T-pose, independent pixel artwork and final Step 6C approval remain unfinished. Step 6D has not started.'
  ] };
await writeFile(root + 'authoring-v8.json', JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log('Prepared native S reference eyebrow separation, preserving approved baseline and eyelid folds.');
