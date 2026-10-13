import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(process.cwd() + '/tools/asset-validator/package.json')('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/front-diagonals-v1/', headRoot = 'assets/source/heroine-v1/head/soft-oval-v1/', refs = 'assets/staging/heroine-v1/references/import-v1/transparent/', hash = bytes => createHash('sha256').update(bytes).digest('hex');
const headBytes = await readFile(headRoot + 'front-diagonals-authoring-v4.json'), head = JSON.parse(headBytes), approvalBytes = await readFile(headRoot + 'front-diagonals-review-fit-v4.json'), approval = JSON.parse(approvalBytes);
if (approval.configSha256 !== hash(headBytes)) throw Error('Approved diagonal baseline changed.');
const selectionBytes = await readFile(root + 'selections.json'), settings = JSON.parse(selectionBytes), frames = {};
const contains = (x, y, polygon) => { let inside = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside; } return inside; };
for (const direction of ['SE', 'SW']) {
  const refBytes = await readFile(refs + direction + '.png'); if (hash(refBytes) !== head.frames[direction].referenceSha256) throw Error('Reference changed: ' + direction);
  const reference = decode(refBytes); if (reference.width !== 1024 || reference.height !== 1536 || reference.channels !== 4 || reference.depth !== 8) throw Error('Native RGBA8 reference required.');
  for (let i = 0; i < reference.data.length; i += 4) if (reference.data[i + 3] < 8) reference.data.fill(0, i, i + 4);
  const features = {};
  for (const [name, polygon] of Object.entries(settings.frames[direction])) {
    const data = new Uint8Array(reference.data.length), mask = new Uint8Array(reference.data.length); let pixelCount = 0;
    for (let p = 0; p < 1024 * 1536; p++) if (contains(p % 1024 + .5, Math.floor(p / 1024) + .5, polygon)) { const i = p * 4; data.set(reference.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); if (data[i + 3] >= 8) pixelCount++; }
    const save = async (source, rgba) => { const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data: rgba }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
    features[name] = { ...await save(direction + '-' + name + '.png', data), selection: await save(direction + '-' + name + '-mask.png', mask), plane: name.endsWith('Eye') ? 'eyes' : name.endsWith('Brow') ? 'eyebrows' : 'mouth', side: name.startsWith('right') ? 'right' : name.startsWith('left') ? 'left' : 'center', owner: 'reference', pixelCount, origin: head.frames[direction].candidateHeadAnchor };
  }
  frames[direction] = { reference: { source: direction + '.png', sourceSha256: hash(refBytes) }, features };
}
const config = { schemaVersion: 1, id: 'face.reference.v1', scope: 'front-diagonals', assetVersion: 1, target: 'detailed', nativeSize: { width: 1024, height: 1536 }, sourcePose: 'standing-reference', intendedRuntimePose: 'tpose', published: false, paletteReady: false, status: 'draft-needs-human-review', headConfig: { source: 'front-diagonals-authoring-v4.json', sourceSha256: hash(headBytes) }, headApproval: { source: 'front-diagonals-review-fit-v4.json', sourceSha256: hash(approvalBytes) }, settings: { source: 'selections.json', sourceSha256: hash(selectionBytes) }, frames, knownReviewIssues: settings.limitations };
await writeFile(root + 'authoring.json', JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log('Authored ten independent native SE/SW facial layers and masks.');
