// Replay only into an explicitly chosen directory; existing layer files are never overwritten.
import { readFile,writeFile,mkdir,realpath,lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { constructNorthWardrobe } from '../../../../../../tools/asset-validator/dist/body-north-wardrobe.js';
import { wardrobeLayerNames } from '../../../../../../tools/asset-validator/dist/body-wardrobe.js';
import { createRequire } from 'node:module';
const root = fileURLToPath(new URL('.',import.meta.url)),assets = resolve(root,'../../..');
const { decode,encode } = createRequire(resolve(root,'../../../../../../tools/asset-validator/package.json'))('fast-png');
if (process.argv.length !== 3) throw new Error('Supply an explicit output directory for native wardrobe construction.');
const out = resolve(process.argv[2]); await mkdir(out,{ recursive: true });
if (await realpath(out) !== out) throw new Error('Ordinary construction output directory required.');
const manifest = JSON.parse(await readFile(resolve(root,'inputs.json'),'utf8'));
const pinned = async (base,p) => { const bytes = await readFile(resolve(base,p.source)); if (createHash('sha256').update(bytes).digest('hex') !== p.sourceSha256) throw new Error('Pinned input changed: ' + p.source); return bytes; };
const config = JSON.parse((await pinned(assets,manifest.baselineConfiguration)).toString('utf8'));
const torso = decode(await pinned(resolve(assets,'body/parts-v1/north'),config.parts[0])),study = decode(await pinned(root,manifest.study));
const layers = constructNorthWardrobe(torso,study);
for (const name of wardrobeLayerNames) {
  try { await lstat(resolve(out,`N-${name}-v1.png`)); throw new Error('Refusing to overwrite an existing wardrobe layer: ' + name); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
for (const name of wardrobeLayerNames) await writeFile(resolve(out,`N-${name}-v1.png`),encode({ ...layers[name],channels: 4,depth: 8 },{zlib:{level:9}}),{flag:'wx'});
console.log('Constructed six native N wardrobe layers with covered assemblies required.');
