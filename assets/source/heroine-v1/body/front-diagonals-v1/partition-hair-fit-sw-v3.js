// Replay only in an isolated scratch copy; never overwrite versioned source artwork.
import {readFile,writeFile}from'node:fs/promises';
import{resolve}from'node:path';
import{fileURLToPath}from'node:url';
import{createRequire}from'node:module';
const root=fileURLToPath(new URL('.',import.meta.url));
const{decode,encode}=createRequire(resolve(root,'../../../../../tools/asset-validator/package.json'))('fast-png');
const blankImage=(width,height)=>({width,height,channels:4,depth:8,data:new Uint8Array(width*height*4)});
const drawRgba=(dest,layer)=>{for(let i=0;i<dest.data.length;i+=4){const sa=layer.data[i+3];if(!sa)continue;const da=dest.data[i+3];if(sa===255||da===0){dest.data.set(layer.data.subarray(i,i+4),i);continue;}const n=sa*255+da*(255-sa);for(let c=0;c<3;c++)dest.data[i+c]=Math.round((layer.data[i+c]*sa*255+dest.data[i+c]*da*(255-sa))/n);dest.data[i+3]=Math.round(n/255);}};
const windows = [
  { name: 'far-eye-fringe', plane: 'front', window: { x: 382, y: 178, width: 48, height: 64 } },
  { name: 'chest-lock', plane: 'front', window: { x: 340, y: 278, width: 110, height: 100 } },
  { name: 'detached-shoulder-wisp', plane: 'front', window: { x: 498, y: 270, width: 52, height: 54 } },
  { name: 'rear-neck-boundary', plane: 'rear', window: { x: 515, y: 270, width: 50, height: 44 } },
];
const contains = (x, y, p) => {
  let inside = false;
  for (let a = 0, b = p.length - 1; a < p.length; b = a++) {
    const [ax, ay] = p[a], [bx, by] = p[b];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
};
const coverage = (x, y, polygons) => {
  let samples = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (polygons.some(p => contains(x + (sx + .5) / 4, y + (sy + .5) / 4, p))) samples++;
  return Math.round(samples * 255 / 16);
};

/** Only local SW hair pixels change; anatomy is never an input to the repair. */
function repairSouthwestHairFit(oldFront, oldRear, study, input) {
  const settings = input;
  if (JSON.stringify(settings.regions.map(({ name, plane, window }) => ({ name, plane, window }))) !== JSON.stringify(windows)) throw new Error('SW hair fit must retain its bounded native regions.');
  if ([oldFront, oldRear, study].some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native SW hair-fit inputs required.');
  const front = { ...oldFront, data: oldFront.data.slice() }, rear = { ...oldRear, data: oldRear.data.slice() }, frontErase = blankImage(1024, 1536), frontSelection = blankImage(1024, 1536), rearErase = blankImage(1024, 1536), rearSelection = blankImage(1024, 1536);
  let selectedHairPixels = 0;
  for (const region of settings.regions) {
    const w = region.window;
    for (const p of [...region.erase, ...region.retain]) for (const [x, y] of p) if (x < w.x || x > w.x + w.width || y < w.y || y > w.y + w.height) throw new Error('SW hair contours must remain inside their native regions.');
    const output = region.plane === 'front' ? front : rear, eraseMask = region.plane === 'front' ? frontErase : rearErase, retainMask = region.plane === 'front' ? frontSelection : rearSelection, insert = blankImage(1024, 1536);
    for (let y = w.y; y < w.y + w.height; y++) for (let x = w.x; x < w.x + w.width; x++) {
      const i = (y * 1024 + x) * 4, rootJoin = region.retain.length > 0 && y < w.y + settings.joinRows;
      const erased = rootJoin ? 0 : coverage(x, y, region.erase), retained = Math.round(coverage(x, y, region.retain) * (rootJoin ? (y - w.y + .5) / settings.joinRows : 1));
      if (erased) { eraseMask.data.fill(255, i, i + 3); eraseMask.data[i + 3] = Math.max(eraseMask.data[i + 3], erased); output.data[i + 3] = Math.round(output.data[i + 3] * (255 - erased) / 255); if (output.data[i + 3] < 8) output.data.fill(0, i, i + 4); }
      if (retained) { retainMask.data.fill(255, i, i + 3); retainMask.data[i + 3] = Math.max(retainMask.data[i + 3], retained); const alpha = Math.round(study.data[i + 3] * retained / 255); if (alpha >= 8) { insert.data.set(study.data.subarray(i, i + 3), i); insert.data[i + 3] = alpha; selectedHairPixels++; } }
    }
    drawRgba(output, insert, 0, 0);
  }
  let changedFrontPixels = 0, changedRearPixels = 0;
  for (let i = 0; i < front.data.length; i += 4) {
    if (front.data.subarray(i, i + 4).some((v, c) => v !== oldFront.data[i + c])) changedFrontPixels++;
    if (rear.data.subarray(i, i + 4).some((v, c) => v !== oldRear.data[i + c])) changedRearPixels++;
  }
  return { front, rear, frontErase, frontSelection, rearErase, rearSelection, measurements: { selectedHairPixels, changedFrontPixels, changedRearPixels, anatomyChanged: false, shiftedScaledOrMirrored: false, globalColorKey: false } };
}

const load=async p=>{const im=decode(await readFile(resolve(root,p)),{checkCrc:true});for(let i=0;i<im.data.length;i+=4)if(im.data[i+3]<8)im.data.fill(0,i,i+4);return im;};
const result=repairSouthwestHairFit(await load('SW-front-body-fit-v2.png'),await load('SW-rear-body-fit-v2.png'),await load('inputs/SW-hair-study-v3.png'),JSON.parse(await readFile(resolve(root,'hair-fit-settings-sw-v3.json'),'utf8')));
for(const[name,im]of [['SW-front-body-fit-v3.png',result.front],['SW-rear-body-fit-v3.png',result.rear],['SW-front-erase-mask-v3.png',result.frontErase],['SW-front-hair-mask-v3.png',result.frontSelection],['SW-rear-erase-mask-v3.png',result.rearErase],['SW-rear-hair-mask-v3.png',result.rearSelection]])await writeFile(resolve(root,name),encode({...im,channels:4,depth:8},{zlib:{level:9}}),{flag:'wx'});
console.log(JSON.stringify(result.measurements));
