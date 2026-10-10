import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { decode, encode } = require('fast-png');
const root = 'assets/source/heroine-v1/head-soft-oval-v1/';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const records = [];
for (const [direction, cutY] of [['S', 278], ['N', 265]]) {
  const bytes = await readFile(`${root}${direction}-master-v1.png`), master = decode(bytes);
  if (master.width !== 1024 || master.height !== 1536 || master.channels !== 4 || master.depth !== 8) throw new Error('Expected native RGBA8.');
  const expected = direction === 'S' ? 'd4b443961d2653cc596f5f5ddb0d970aeef685b34db1a4922616e6e1f01c4633' : '2e80960dd9cc147ee12408df6105890e9a074a47d0d6054538d42bf66187419d';
  if (sha256(bytes) !== expected) throw new Error('Master changed; create a new reviewed version.');
  const record = { direction, master: `${direction}-master-v1.png`, masterSha256: expected, cutY, minimumVisibleAlpha: 8, parts: {} };
  for (const part of ['head', 'neck']) {
    const data = new Uint8Array(master.data.length), mask = new Uint8Array(master.data.length);
    let pixels = 0;
    for (let p = 0; p < 1024 * 1536; p++) {
      const i = p * 4;
      if (master.data[i + 3] < 8 || (Math.floor(p / 1024) < cutY) !== (part === 'head')) continue;
      data.set(master.data.subarray(i, i + 4), i); mask.fill(255, i, i + 4); pixels++;
    }
    const png = (data) => encode({ width: 1024, height: 1536, channels: 4, depth: 8, data });
    const partBytes = png(data), maskBytes = png(mask), source = `${direction}-${part}-v1.png`, selection = `inputs/${direction}-${part}-mask-v1.png`;
    await writeFile(root + source, partBytes, { flag: 'wx' });
    await writeFile(root + selection, maskBytes, { flag: 'wx' });
    record.parts[part] = { source, sourceSha256: sha256(partBytes), selection, selectionSha256: sha256(maskBytes), pixelCount: pixels };
  }
  records.push(record);
}
await writeFile(`${root}inputs/partition-v1.json`, `${JSON.stringify({ schemaVersion: 1, method: 'native-head-neck-partition', policy: 'Normalized visible master pixels have exactly one owner. Full-canvas positions remain unchanged. No scaling, mirroring, recolouring or invented production rig.', records }, null, 2)}\n`, { flag: 'wx' });
