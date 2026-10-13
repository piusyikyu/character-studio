import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face/reference-v1/', earRoot = 'assets/source/heroine-v1/ears/human-v1/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const pin = async (source, directory = root) => ({ source, sourceSha256: hash(await readFile(directory + source)) });
const ears = JSON.parse(await readFile(earRoot + 'authoring-v2.json'));
const head = JSON.parse(await readFile('assets/source/heroine-v1/head/soft-oval-v1/' + ears.headConfig.source));
const reference = decode(await readFile('assets/staging/heroine-v1/references/import-v1/transparent/' + head.frames.S.reference));
if (reference.width !== 1024 || reference.height !== 1536 || reference.channels !== 4 || hash(await readFile('assets/staging/heroine-v1/references/import-v1/transparent/S.png')) !== head.frames.S.referenceSha256) throw new Error('Native same-facing reference changed.');
const settingsSource = 'inputs/feature-selections-v2.json', settings = JSON.parse(await readFile(root + settingsSource));
const contains = (x, y, polygon) => {
  let selected = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ax, ay] = polygon[a], [bx, by] = polygon[b];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected;
  }
  return selected;
};
const save = async (source, data) => {
  const bytes = encode({ width: 1024, height: 1536, data, channels: 4, depth: 8 });
  await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) };
};
const features = {};
for (const [name, selection] of Object.entries(settings.features)) {
  const data = new Uint8Array(reference.data.length), mask = new Uint8Array(data.length); let pixelCount = 0;
  for (let y = 170; y < 250; y++) for (let x = 440; x < 580; x++) if (contains(x + 0.5, y + 0.5, selection.polygon)) {
    const i = (y * 1024 + x) * 4; mask.fill(255, i, i + 4);
    if (reference.data[i + 3] >= 8) { data.set(reference.data.subarray(i, i + 4), i); pixelCount++; }
  }
  features[name] = { ...await save(`S-${name}-v2.png`, data), plane: selection.plane, side: selection.side, selection: await save(`inputs/S-${name}-mask-v2.png`, mask), origin: { x: 511, y: 169 }, pixelCount };
}
const config = { schemaVersion: 1, id: 'face.reference.v1', assetVersion: 1, direction: 'S', target: 'detailed', sourcePose: 'standing-reference', intendedRuntimePose: 'tpose', published: false, paletteReady: false, status: 'draft-needs-human-review', method: settings.method,
  nativeSize: { width: 1024, height: 1536 }, earConfig: await pin('authoring-v2.json', earRoot), earApproval: await pin('review-fit-v2.json', earRoot), reference: { source: head.frames.S.reference, sourceSha256: head.frames.S.referenceSha256 }, settings: await pin(settingsSource), features, knownReviewIssues: settings.limitations,
};
await writeFile(root + 'authoring-v1.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Separated native S reference eyes, brows and mouth using independent local masks.');
