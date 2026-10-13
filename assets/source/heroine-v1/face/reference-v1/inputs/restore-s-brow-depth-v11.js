import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = 'assets/source/heroine-v1/face/reference-v1/', hash = bytes => createHash('sha256').update(bytes).digest('hex');
const priorBytes = await readFile(root + 'authoring-v10.json'), prior = JSON.parse(priorBytes), feedback = JSON.parse(await readFile(root + 'review-fit-v10.json'));
if (feedback.configSha256 !== hash(priorBytes)) throw Error('Revision-10 feedback/configuration mismatch.');
const settingsSource = 'inputs/brows-v11/ownership-settings.json', settingsBytes = await readFile(root + settingsSource);
const repair = { ...prior.browRepair, settings: { source: settingsSource, sourceSha256: hash(settingsBytes) }, rejected: { source: 'authoring-v10.json', sourceSha256: hash(priorBytes) } }; delete repair.front;
const config = { ...prior, assetVersion: 11, browRepair: repair, knownReviewIssues: [
  "Revision 11 preserves both exact revision-10 fuller brow layers and removes its foreground-fringe attenuation, so the left tail lies behind the original hair. The right brow assembly remains unchanged.",
  "Approved-v5 front/rear hair, head/ears/neck, native eyes/mouth/nose, eyelid folds and anchors remain exact. The full left curve is retained beneath normal foreground occlusion.",
  "No artwork generation, source-pixel edits, transforms, resampling, mirroring or colour keys. Earlier source/config/mask baselines remain pinned.",
  "Review left-tail depth and the local fringe transition. This unapproved offline standing-reference candidate does not certify hidden geometry, variants/facings, materials, T-pose, independent pixel assets or final Step 6C acceptance. Step 6D has not started."
] };
await writeFile(root + 'authoring-v11.json', JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log('Prepared native fringe-depth selection; both revision-10 brow layers remain pinned.');
