import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/', hash = bytes => createHash('sha256').update(bytes).digest('hex');
const previousBytes = await readFile(root + 'authoring-v5.json'), previous = JSON.parse(previousBytes), approvalBytes = await readFile(root + 'review-fit-v5.json'), approval = JSON.parse(approvalBytes);
if (approval.decision !== 'approved-standing-reference-fit' || approval.configSha256 !== hash(previousBytes)) throw Error('Approved native S baseline required.');
const settingsSource = 'inputs/brows-v6/ownership-settings.json', settingsBytes = await readFile(root + settingsSource), geometry = JSON.parse(settingsBytes);
const referenceBytes = await readFile('assets/staging/heroine-v1/references/import-v1/transparent/' + previous.reference.source);
if (hash(referenceBytes) !== previous.reference.sourceSha256) throw Error('Native S reference changed.');
const reference = decode(referenceBytes); if (reference.width !== 1024 || reference.height !== 1536 || reference.channels !== 4 || reference.depth !== 8) throw Error('Native RGBA8 required.');
for (let i = 0; i < reference.data.length; i += 4) if (reference.data[i + 3] < 8) reference.data.fill(0, i, i + 4);
const contains = (x, y, polygon) => { let s = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) s = !s; } return s; };
const save = async (source, data) => { const bytes = encode({ width: 1024, height: 1536, depth: 8, channels: 4, data }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
const features = { ...previous.features };
for (const name of ['rightBrow', 'leftBrow']) {
  const data = new Uint8Array(reference.data.length), mask = new Uint8Array(reference.data.length); let count = 0;
  for (let p = 0; p < 1024 * 1536; p++) if (contains(p % 1024 + .5, Math.floor(p / 1024) + .5, geometry[name])) { const i = p * 4; data.set(reference.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); if (reference.data[i + 3] >= 8) count++; }
  features[name] = { ...previous.features[name], ...await save(`S-${name}-v6.png`, data), selection: await save(`inputs/brows-v6/S-${name}-mask.png`, mask), pixelCount: count };
}
const config = { ...previous, assetVersion: 6, previous: { source: 'authoring-v5.json', sourceSha256: hash(previousBytes) }, features,
  browRepair: { settings: { source: settingsSource, sourceSha256: hash(settingsBytes) }, approval: { source: 'review-fit-v5.json', sourceSha256: hash(approvalBytes) } },
  knownReviewIssues: [
    'Revision 6 separates actual visible purple S eyebrows from the native reference. Previous brow-labelled pale patches are retained as upper-eyelid folds on the eye plane.',
    'Approved revision-5 head, retention, ears, native nose, neck, hair, eyes, mouth and anchors remain unchanged. Only two reference brow curves are added before foreground hair; no transforms, mirroring or colour keys are used.',
    'Review brow contours, native placement, skin rims and actual fringe occlusion. The reference conceals some brow geometry; complete hidden surfaces, variants, material maps and other facings are still unfinished.',
    'This is an unapproved offline standing-reference candidate. Full body/clothing, complete concealed hair, production T-pose, independent pixel artwork and final Step 6C acceptance remain open. Step 6D has not started.'
  ] };
await writeFile(root + 'authoring-v6.json', JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log('Prepared native S reference eyebrow separation, preserving approved baseline and eyelid folds.');
