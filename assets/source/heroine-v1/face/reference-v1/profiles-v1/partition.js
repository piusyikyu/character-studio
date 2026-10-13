// Replay only in an isolated repository copy; versioned inputs are never overwritten.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(process.cwd() + '/tools/asset-validator/package.json')('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/profiles-v1/', headRoot = 'assets/source/heroine-v1/head/soft-oval-v1/', refs = 'assets/staging/heroine-v1/references/import-v1/transparent/', hash = bytes => createHash('sha256').update(bytes).digest('hex');
const headBytes = await readFile(headRoot + 'profiles-authoring-v3.json'), head = JSON.parse(headBytes), approvalBytes = await readFile(headRoot + 'profiles-review-fit-v3.json'), approval = JSON.parse(approvalBytes);
if (approval.configSha256 !== hash(headBytes) || approval.status !== 'approved-standing-reference-fit-candidate') throw Error('Approved profile baseline changed.');
const selectionBytes = await readFile(root + 'selections.json'), settings = JSON.parse(selectionBytes), frames = {};
const contains = (x, y, polygon) => { let inside = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside; } return inside; };
for (const direction of ['E', 'W']) {
  const refBytes = await readFile(refs + direction + '.png'); if (hash(refBytes) !== head.frames[direction].referenceSha256) throw Error('Reference changed: ' + direction);
  const reference = decode(refBytes); if (reference.width !== 1024 || reference.height !== 1536 || reference.channels !== 4 || reference.depth !== 8) throw Error('Native RGBA8 reference required.');
  for (let i = 0; i < reference.data.length; i += 4) if (reference.data[i + 3] < 8) reference.data.fill(0, i, i + 4);
  const features = {}, nearSide = direction === 'E' ? 'right' : 'left';
  for (const [name, polygon] of Object.entries(settings.frames[direction])) {
    const data = new Uint8Array(reference.data.length), mask = new Uint8Array(reference.data.length); let pixelCount = 0;
    const xs = polygon.map(p => p[0]), ys = polygon.map(p => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      let samples = 0; for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, polygon)) samples++;
      const coverage = Math.round(samples * 255 / 16), i = (y * 1024 + x) * 4, alpha = Math.round(reference.data[i + 3] * coverage / 255); mask.fill(coverage, i, i + 4);
      if (alpha >= 8) { data.set(reference.data.subarray(i, i + 4), i); data[i + 3] = alpha; pixelCount++; }
    }
    const save = async (source, rgba) => { const bytes = encode({ width: 1024, height: 1536, channels: 4, depth: 8, data: rgba }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
    const label = name === 'mouth' ? 'mouth' : nearSide + (name === 'eye' ? 'Eye' : 'Brow');
    features[name] = { ...await save(direction + '-' + label + '.png', data), selection: await save(direction + '-' + label + '-mask.png', mask), plane: name === 'eye' ? 'eyes' : name === 'brow' ? 'eyebrows' : 'mouth', side: name === 'mouth' ? 'center' : nearSide, owner: 'reference', pixelCount, origin: head.frames[direction].candidateHeadAnchor };
  }
  frames[direction] = { reference: { source: direction + '.png', sourceSha256: hash(refBytes) }, features, hiddenFeatures: direction === 'E' ? ['leftEye', 'leftBrow'] : ['rightEye', 'rightBrow'] };
}
const config = { schemaVersion: 1, id: 'face.reference.v1', scope: 'profiles', assetVersion: 1, target: 'detailed', nativeSize: { width: 1024, height: 1536 }, sourcePose: 'standing-reference', intendedRuntimePose: 'tpose', published: false, paletteReady: false, status: 'draft-needs-human-review', headConfig: { source: 'profiles-authoring-v3.json', sourceSha256: hash(headBytes) }, headApproval: { source: 'profiles-review-fit-v3.json', sourceSha256: hash(approvalBytes) }, settings: { source: 'selections.json', sourceSha256: hash(selectionBytes) }, frames, knownReviewIssues: settings.limitations };
await writeFile(root + 'authoring.json', JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log('Authored six independent native E/W facial layers and masks.');
