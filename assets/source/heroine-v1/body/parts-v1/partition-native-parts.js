// Replay only in scratch; create new parts without replacing accepted artwork.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url)), assets = resolve(root, '../..');
const { decode, encode } = createRequire(resolve(root, '../../../../../tools/asset-validator/package.json'))('fast-png');
const input = JSON.parse(await readFile(resolve(root, 'settings.json'), 'utf8')), g = input.geometry, body = decode(await readFile(resolve(assets, input.sourceBody)), { checkCrc: true });
if (body.width !== 1024 || body.height !== 1536 || body.channels !== 4) throw new Error('Native RGBA body required.');
for (let i = 0; i < body.data.length; i += 4) if (body.data[i + 3] < 8) body.data.fill(0, i, i + 4);
const names = ['torso','right-arm','left-arm','right-leg','left-leg'], parts = names.map(() => ({ width: 1024, height: 1536, channels: 4, depth: 8, data: new Uint8Array(1024 * 1536 * 4) }));
const line = (value, points, axis) => { const output = axis === 0 ? 1 : 0; if (value <= points[0][axis]) return points[0][output]; for (let j=1;j<points.length;j++){const a=points[j-1],b=points[j];if(value<=b[axis])return a[output]+(b[output]-a[output])*(value-a[axis])/(b[axis]-a[axis]);}return points.at(-1)[output]; };
for (let y=0;y<1536;y++) for(let x=0;x<1024;x++) { const i=(y*1024+x)*4;if(!body.data[i+3])continue;const px=x+.5,py=y+.5,owner=py<g.armBottom&&px<line(py,g.rightArmRoot,1)?1:py<g.armBottom&&px>=line(py,g.leftArmRoot,1)?2:px<g.legCenter&&py>=line(px,g.rightThighRoot,0)?3:px>=g.legCenter&&py>=line(px,g.leftThighRoot,0)?4:0;parts[owner].data.set(body.data.subarray(i,i+4),i); }
for (const [j, im] of parts.entries()) await writeFile(resolve(root,'S-'+names[j]+'-v1.png'),encode(im,{zlib:{level:9}}),{flag:'wx'});
console.log('Created five native body parts with exclusive source ownership.');
