// Rebuild only in scratch; the guide is annotation, never source anatomy.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const { decode, encode } = createRequire(resolve(root, '../../../../../tools/asset-validator/package.json'))('fast-png');
const cfg = JSON.parse(await readFile(resolve(root, 'authoring-v2.json'), 'utf8'));
const layers = await Promise.all([cfg.body.source, cfg.headGuide.source].map(async p => decode(await readFile(resolve(root, p)))));
const im = { width: 1024, height: 1536, channels: 4, depth: 8, data: new Uint8Array(1024 * 1536 * 4) };
for (const layer of layers) for (let i = 0; i < im.data.length; i += 4) { const sa = layer.data[i + 3], da = im.data[i + 3]; if (sa < 8) continue; if (sa === 255 || !da) { im.data.set(layer.data.subarray(i, i + 4), i); continue; } const n = sa * 255 + da * (255 - sa); for (let c = 0; c < 3; c++) im.data[i + c] = Math.round((layer.data[i + c] * sa * 255 + im.data[i + c] * da * (255 - sa)) / n); im.data[i + 3] = Math.round(n / 255); }
const outlines=[[[350,337],[375,320],[397,308],[413,303],[426,302],[440,304],[455,307],[470,306]],[[553,306],[574,306],[596,302],[610,303],[627,307],[649,321],[675,337]]];
const point=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const i=((y+dy)*1024+x+dx)*4;im.data.set([0,200,255,255],i);}};for(const p of outlines)for(let j=1;j<p.length;j++){const a=p[j-1],b=p[j],steps=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let k=0;k<=steps;k++)point(Math.round(a[0]+(b[0]-a[0])*k/steps),Math.round(a[1]+(b[1]-a[1])*k/steps));}
await writeFile(resolve(root, 'inputs/S-shoulder-guide-v3.png'), encode(im, { zlib: { level: 9 } }), { flag: 'wx' });
