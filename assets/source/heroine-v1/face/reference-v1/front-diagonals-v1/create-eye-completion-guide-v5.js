// Replay only in scratch. Native anatomy and the nine other facial features are pinned.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(process.cwd() + '/tools/asset-validator/package.json')('fast-png');
const root='assets/source/heroine-v1/face/reference-v1/front-diagonals-v1/',headRoot='assets/source/heroine-v1/head/soft-oval-v1/',hash=b=>createHash('sha256').update(b).digest('hex');
const previous=JSON.parse(await readFile(root+'authoring-v4.json','utf8'));
const readPinned=async(base,pin)=>{const b=await readFile(base+pin.source);if(hash(b)!==pin.sourceSha256)throw Error('Pinned guide input changed: '+pin.source);return decode(b);};
const headBytes=await readFile(headRoot+previous.headConfig.source);if(hash(headBytes)!==previous.headConfig.sourceSha256)throw Error('Head baseline changed');const head=JSON.parse(headBytes),guide={width:1024,height:1536,channels:4,depth:8,data:new Uint8Array(1024*1536*4)};
const over=layer=>{for(let i=0;i<guide.data.length;i+=4){const a=layer.data[i+3]/255;if(a<8/255)continue;const d=guide.data[i+3]/255,out=a+d*(1-a);for(let c=0;c<3;c++)guide.data[i+c]=Math.round((layer.data[i+c]*a+guide.data[i+c]*d*(1-a))/out);guide.data[i+3]=Math.round(out*255);}};
for(const item of [head.frames.SE.neck,head.frames.SE.head])over(await readPinned(headRoot,item));
for(const name of ['rightEye','rightBrow','leftBrow','mouth'])over(await readPinned(root,previous.frames.SE.features[name]));
await mkdir(root+'inputs',{recursive:true});await writeFile(root+'inputs/SE-left-eye-guide-v5.png',encode(guide),{flag:'wx'});console.log('Prepared native SE anatomy guide with the incomplete far eye omitted.');
