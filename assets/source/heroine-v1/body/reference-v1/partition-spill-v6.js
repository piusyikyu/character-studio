// Replay only in scratch; all outputs are new revisions.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = fileURLToPath(new URL('.', import.meta.url));
const { decode, encode } = createRequire(resolve(root, '../../../../../tools/asset-validator/package.json'))('fast-png');
const cfg = JSON.parse(await readFile(resolve(root, 'authoring-v5.json'), 'utf8')), settings = JSON.parse(await readFile(resolve(root, 'settings-v6.json'), 'utf8'));
const load = async p => { const im = decode(await readFile(resolve(root, p)), { checkCrc: true }); if (im.width !== 1024 || im.height !== 1536 || im.channels !== 4) throw new Error('Native RGBA required.'); for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3] < 8) im.data.fill(0, i, i + 4); return im; };
const [front, rear] = await Promise.all([load(cfg.curlRepair.front.source), load(cfg.curlRepair.rear.source)]), blank = () => ({ width: 1024, height: 1536, channels: 4, depth: 8, data: new Uint8Array(1024 * 1536 * 4) }), mask = blank(), moved = blank();
const contains = (x,y,p) => { let yes = false; for(let a=0,b=p.length-1;a<p.length;b=a++){ const [ax,ay]=p[a],[bx,by]=p[b]; if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)yes=!yes; } return yes; };
const draw = (dst,src,i) => { const sa=src[i+3],da=dst[i+3];if(!sa)return;if(sa===255||!da){dst.set(src.subarray(i,i+4),i);return;}const n=sa*255+da*(255-sa);for(let c=0;c<3;c++)dst[i+c]=Math.round((src[i+c]*sa*255+dst[i+c]*da*(255-sa))/n);dst[i+3]=Math.round(n/255); };
for(const p of settings.regions){const x0=Math.floor(Math.min(...p.map(v=>v[0]))),x1=Math.ceil(Math.max(...p.map(v=>v[0]))),y0=Math.floor(Math.min(...p.map(v=>v[1]))),y1=Math.ceil(Math.max(...p.map(v=>v[1])));for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*1024+x)*4;if(!front.data[i+3])continue;let n=0;for(let sy=0;sy<8;sy++)for(let sx=0;sx<8;sx++)if(contains(x+(sx+.5)/8,y+(sy+.5)/8,p))n++;let a=Math.round(n*255/64);if(a<8)continue;if(a>247)a=255;mask.data.fill(255,i,i+3);mask.data[i+3]=a;moved.data.set(front.data.subarray(i,i+4),i);moved.data[i+3]=Math.round(front.data[i+3]*a/255);front.data[i+3]=Math.round(front.data[i+3]*(255-a)/255);draw(rear.data,moved.data,i);}}
for (const [name, im] of [['S-front-body-fit-v6.png', front], ['S-rear-body-fit-v6.png', rear], ['S-curl-spill-mask-v6.png', mask]]) { for (let i=0;i<im.data.length;i+=4) if(im.data[i+3]<8) im.data.fill(0,i,i+4); await writeFile(resolve(root,name),encode(im,{zlib:{level:9}}),{flag:'wx'}); }
console.log('Selected three local curl spills for rear ownership.');
