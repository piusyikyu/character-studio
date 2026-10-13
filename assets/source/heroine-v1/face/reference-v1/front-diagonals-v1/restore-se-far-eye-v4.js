// Replay only in a scratch repository copy; versioned inputs are immutable.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(process.cwd() + '/tools/asset-validator/package.json')('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/front-diagonals-v1/', hash = bytes => createHash('sha256').update(bytes).digest('hex');
const previousBytes = await readFile(root + 'authoring-v3.json'), previous = JSON.parse(previousBytes);
if (previous.assetVersion !== 3) throw Error('Rejected far-eye revision-3 baseline required.');
const approvedBytes = await readFile(root + previous.previous.source);
if (hash(approvedBytes) !== previous.previous.sourceSha256) throw Error('Pinned revision-2 baseline changed.');
const approved = JSON.parse(approvedBytes);
if (approved.assetVersion !== 2) throw Error('Approved native feature revision 2 required.');
const readPinned = async item => { const bytes = await readFile(root + item.source); if (hash(bytes) !== item.sourceSha256) throw Error('Pinned source changed: ' + item.source); return bytes; };
const headRoot = 'assets/source/heroine-v1/head/soft-oval-v1/', headBytes = await readFile(headRoot + previous.headConfig.source);
if (hash(headBytes) !== previous.headConfig.sourceSha256) throw Error('Pinned approved head changed.');
const head = JSON.parse(headBytes), originalFront = head.localFitRepair.frames.SE.front, frontBytes = await readFile(headRoot + originalFront.source);
if (hash(frontBytes) !== originalFront.sourceSha256) throw Error('Pinned approved front hair changed.');
const front = decode(frontBytes);
for (let i = 0; i < front.data.length; i += 4) if (front.data[i + 3] < 8) front.data.fill(0, i, i + 4);
const original = approved.frames.SE.features.leftEye, settings = JSON.parse(await readPinned(approved.settings)), eye = decode(await readPinned(original)), mask = decode(await readPinned(original.selection));
settings.farEyeTrim = {
  direction: 'SE', feature: 'leftEye', coverageSamples: 4,
  polygon: [[598,170],[607,170],[611.5,170],[611.5,174],[613,176.5],[610.5,178.5],[608.5,180],[607.5,181.5],[606.5,183],[606.5,185],[606,187],[603,189],[600,189],[597,188],[595.5,185.5],[595.5,182],[597.5,180],[597,177],[596.5,174],[597,172]],
};
settings.farEyeHairOwnership = {
  direction: 'SE', feature: 'leftEye',
  outer: [[611.5,169],[620,169],[620,201],[603,201],[604,196],[604.5,192],[605.5,188],[606.5,185],[607.5,182],[609,180],[611,178],[613,176.5],[611.5,174]],
  inner: [[593,169],[598,169],[597,172],[596.5,174],[597,177],[598.5,179],[600.5,182],[601.5,185],[602.5,187],[598,187],[592,177]],
};
settings.limitations = [
  'A separate bounded release mask removes foreground coverage from the newly recovered opaque eye arc; the native reference eye layer owns those pixels.',
  'Removed same-facing fringe/outer-strand pixels return to a bounded front-hair layer; original front hair remains exact outside the local ownership mask.',
  'SE left/far-eye revision 4 restores the visible lower-left iris/lid arc cut by revision 3, excluding only locally traced hair. Only alpha coverage changes; retained iris/lash RGB and coordinates remain native.',
  'This is the visible same-facing eye extraction, not newly authored concealed eye geometry. Human review of bare and current-hair fits is pending.',
  ...settings.limitations,
];
const contains = (x, y, polygon) => { let inside = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a], [bx, by] = polygon[b]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside; } return inside; };
const originalEye = decode(await readPinned(original)), originalMask = decode(await readPinned(original.selection)), hairMask = new Uint8Array(mask.data.length);
const previousEyeMask = decode(await readPinned(previous.frames.SE.features.leftEye.selection)), eyeReleaseMask = new Uint8Array(mask.data.length);
let pixelCount = 0, hairPixels = 0, eyeReleasePixels = 0;
for (let p = 0; p < 1024 * 1536; p++) {
  const i = p * 4; if (!mask.data[i + 3]) continue;
  const x = p % 1024, y = Math.floor(p / 1024); let samples = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, settings.farEyeTrim.polygon)) samples++;
  const coverage = Math.round(samples * 255 / 16); mask.data.fill(coverage, i, i + 4); eye.data[i + 3] = Math.round(eye.data[i + 3] * coverage / 255);
  if (eye.data[i + 3] < 8) eye.data.fill(0, i, i + 4); else pixelCount++;
}
for (let p = 0; p < 1024 * 1536; p++) {
  const i = p * 4, x = p % 1024, y = Math.floor(p / 1024), polygons = settings.farEyeHairOwnership;
  const selected = originalMask.data[i + 3] > 0 && mask.data[i + 3] < 255 && (contains(x + .5, y + .5, polygons.outer) || contains(x + .5, y + .5, polygons.inner));
  if (!selected) continue;
  hairMask.fill(255, i, i + 4); hairPixels++;
  // Original eye pixels are opaque. Preserve exact old source-over colour beneath original hair.
  const alpha = front.data[i + 3] / 255;
  for (let c = 0; c < 3; c++) front.data[i + c] = Math.round(front.data[i + c] * alpha + originalEye.data[i + c] * (1 - alpha));
  front.data[i + 3] = 255;
}
// Release opaque foreground pixels that had covered the newly recovered native eye arc.
// All coordinates belong to the current traced eye mask and were absent from revision 3.
for (let p = 0; p < 1024 * 1536; p++) {
  const i = p * 4;
  if (mask.data[i + 3] === 255 && previousEyeMask.data[i + 3] < 8 && front.data[i + 3] >= 8) {
    eyeReleaseMask.fill(255, i, i + 4); front.data.fill(0, i, i + 4); eyeReleasePixels++;
  }
}
const save = async (source, bytes) => { await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
const imagePin = await save('SE-leftEye-v4.png', encode(eye)), maskPin = await save('SE-leftEye-mask-v4.png', encode(mask)), settingsPin = await save('selections-v4.json', Buffer.from(JSON.stringify(settings, null, 2) + '\n'));
const config = { ...previous, assetVersion: 4, settings: settingsPin, previous: { source: 'authoring-v3.json', sourceSha256: hash(previousBytes) }, frames: structuredClone(previous.frames), knownReviewIssues: settings.limitations };
config.hairRepair = { original: originalFront, ...await save('SE-front-hair-v4.png', encode(front)), selection: await save('SE-front-hair-mask-v4.png', encode({ width: 1024, height: 1536, channels: 4, depth: 8, data: hairMask })), pixelCount: hairPixels, eyeReleaseSelection: await save('SE-eye-release-mask-v4.png', encode({ width: 1024, height: 1536, channels: 4, depth: 8, data: eyeReleaseMask })), eyeReleasePixels };
config.frames.SE.features.leftEye = { ...original, ...imagePin, selection: maskPin, pixelCount };
await save('authoring-v4.json', Buffer.from(JSON.stringify(config, null, 2) + '\n'));
console.log('Authored bounded SE far-eye ownership trim; all nine other features retain approved revision-2 pins.');
