// Replay only in scratch; retain the complete approved N head at native framing.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const {decode,encode}=createRequire(process.cwd()+'/tools/asset-validator/package.json')('fast-png'),root='assets/source/heroine-v1/head/soft-oval-v1/',config=JSON.parse(await readFile(root+'authoring-v5.json')),p=config.frames.N.head,bytes=await readFile(root+p.source);
if(createHash('sha256').update(bytes).digest('hex')!==p.sourceSha256)throw Error('Approved N head changed');
await writeFile('assets/source/heroine-v1/ears/human-v1/north-v1/inputs/N-earless-guide.png',encode(decode(bytes)),{flag:'wx'});
