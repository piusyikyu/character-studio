// Replay in an isolated repository copy. Never overwrite versioned inputs.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(process.cwd() + '/tools/asset-validator/package.json')('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/front-diagonals-v1/', hash = bytes => createHash('sha256').update(bytes).digest('hex');
const readPinned = async item => { const bytes = await readFile(root + item.source); if (hash(bytes) !== item.sourceSha256) throw Error('Pinned source changed: ' + item.source); return bytes; };
const previousBytes = await readFile(root + 'authoring.json'), previous = JSON.parse(previousBytes), original = previous.frames.SE.features.rightEye;
if (previous.assetVersion !== 1) throw Error('Native revision-1 baseline required.');
const settings = JSON.parse(await readPinned(previous.settings)), eye = decode(await readPinned(original)), mask = decode(await readPinned(original.selection));
settings.cheekTrim = {
  direction: 'SE', feature: 'rightEye', coverageSamples: 4,
  polygon: [[520,150],[572,150],[572,176],[569,177],[566,179],[562,181],[558,182],[554,182],[550,182],[546,181.5],[542,180],[538,178],[534,176],[530,174],[526,171],[522,168],[520,166]],
};
settings.limitations = [
  'SE right-eye revision 2 excludes the broad rosy reference cheek tint through a locally traced lower-lid mask. Only native alpha coverage changes; eye RGB is not repainted or resampled.',
  ...settings.limitations,
];
const contains = (x, y, polygon) => { let inside = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside; } return inside; };
let pixelCount = 0;
for (let p = 0; p < 1024 * 1536; p++) {
  const i = p * 4; if (!mask.data[i + 3]) continue;
  const x = p % 1024, y = Math.floor(p / 1024); let samples = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, settings.cheekTrim.polygon)) samples++;
  const coverage = Math.round(samples * 255 / 16); mask.data.fill(coverage, i, i + 4); eye.data[i + 3] = Math.round(eye.data[i + 3] * coverage / 255);
  if (eye.data[i + 3] < 8) eye.data.fill(0, i, i + 4); else pixelCount++;
}
const save = async (source, bytes) => { await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
const imagePin = await save('SE-rightEye-v2.png', encode(eye)), maskPin = await save('SE-rightEye-mask-v2.png', encode(mask)), settingsPin = await save('selections-v2.json', Buffer.from(JSON.stringify(settings, null, 2) + '\n'));
const config = { ...previous, assetVersion: 2, settings: settingsPin, previous: { source: 'authoring.json', sourceSha256: hash(previousBytes) }, frames: structuredClone(previous.frames), knownReviewIssues: settings.limitations };
config.frames.SE.features.rightEye = { ...original, ...imagePin, selection: maskPin, pixelCount };
await save('authoring-v2.json', Buffer.from(JSON.stringify(config, null, 2) + '\n'));
console.log('Authored bounded SE right-eye cheek trim; all nine other features retain revision-1 pins.');
