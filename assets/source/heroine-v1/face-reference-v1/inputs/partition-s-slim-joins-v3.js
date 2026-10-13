import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root = 'assets/source/heroine-v1/face-reference-v1/', prompts = JSON.parse(await readFile(root + 'prompts-v3.json'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const config = JSON.parse(await readFile(root + 'inputs/pre-join-authoring-v3.json'));
const load = async (path, expected) => {
  const bytes = await readFile(path); if (hash(bytes) !== expected) throw new Error(`Native input changed: ${path}`);
  const image = decode(bytes); if (image.width !== 1024 || image.height !== 1536 || image.channels !== 4) throw new Error('Native RGBA study required.');
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3] < 8) image.data.fill(0, i, i + 4); return image;
};
const head = await load(root + config.headFit.source, config.headFit.sourceSha256), study = await load(root + prompts.joinStudy.output, prompts.joinStudy.sourceSha256);
const ears = JSON.parse(await readFile('assets/source/heroine-v1/ears-human-v1/authoring-v2.json')), headConfig = JSON.parse(await readFile('assets/source/heroine-v1/head-soft-oval-v1/' + ears.headConfig.source)), neckPin = headConfig.frames.S.neck;
const neck = await load('assets/source/heroine-v1/head-soft-oval-v1/' + neckPin.source, neckPin.sourceSha256);
const headMask = new Uint8Array(head.data.length), neckMask = new Uint8Array(head.data.length);
for (let y = 200; y < 293; y++) for (let x = 436; x < 584; x++) {
  const i = (y * 1024 + x) * 4;
  const headJoin = (x >= 436 && x < 449 && y < 216) || (x >= 436 && x < 455 && y >= 216 && y < 226) || (x >= 568 && x < 584 && y < 226) || (x >= 478 && x < 550 && y >= 263 && y < 278);
  const neckJoin = x >= 478 && x < 550 && y >= 278;
  if (headJoin) { head.data.set(study.data.subarray(i, i + 4), i); headMask.fill(255, i, i + 4); }
  if (neckJoin) { neck.data.set(study.data.subarray(i, i + 4), i); neckMask.fill(255, i, i + 4); }
}
const save = async (source, data) => { const bytes = encode({ width: 1024, height: 1536, data, channels: 4, depth: 8 }); await writeFile(root + source, bytes, { flag: 'wx' }); return { source, sourceSha256: hash(bytes) }; };
config.headFit = { ...config.headFit, ...await save('S-head-slim-underlay-v3-joined.png', head.data), joinStudy: { source: prompts.joinStudy.output, sourceSha256: prompts.joinStudy.sourceSha256 }, headJoinSelection: await save('inputs/S-slim-root-neck-mask-v3.png', headMask), neck: await save('S-neck-fit-v3.png', neck.data), neckSelection: await save('inputs/S-neck-fit-mask-v3.png', neckMask) };
config.knownReviewIssues[1] = 'Only bounded face and root/neck-join windows supply new native study skin. Reference nose and all facial features retain their original source pixels. Approved upper skull, head/neck/hair/ear source files remain unchanged; the candidate contains new head and local neck-fit revisions.';
await writeFile(root + 'authoring-v3.json', `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
console.log('Prepared native root/neck join patches without changing original facial features or approved sources.');
