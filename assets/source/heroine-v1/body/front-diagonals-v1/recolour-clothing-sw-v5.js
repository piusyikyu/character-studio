// Replay only in scratch. Keep the pinned original body and settings at their relative paths.
import{readFile,writeFile}from'node:fs/promises';import{fileURLToPath}from'node:url';import{resolve}from'node:path';import{createRequire}from'node:module';const root=fileURLToPath(new URL('.',import.meta.url)),{decode,encode}=createRequire(resolve(root,'../../../../../tools/asset-validator/package.json'))('fast-png');
const blankImage=(width,height)=>({width,height,channels:4,depth:8,data:new Uint8Array(width*height*4)});





/** Local fabric RGB only: retain native geometry, alpha, outlines and original shade variation. */
export function recolourSouthwestClothing(original           , input         ) {
  const settings = input;
  if (original.width !== 1024 || original.height !== 1536) throw new Error('Native SW body required for clothing colour correction.');
  const body = { ...original, data: original.data.slice() }, mask = blankImage(1024, 1536);
  let changedPixels = 0, braPixels = 0, briefsPixels = 0;
  for (let y = 294; y < 721; y++) for (let x = 320; x < 620; x++) {
    const bra = y < 499 && x < 570, briefs = y >= 595 && x >= 350;
    if (!bra && !briefs) continue;
    const p = (y * 1024 + x) * 4, r = original.data[p] , g = original.data[p + 1] , b = original.data[p + 2] ;
    // These bounded material tests separate the grey/mauve cloth from warm skin. No alpha is keyed or changed.
    if (original.data[p + 3]  < 8 || r >= settings.maximumFabricRed || b < g || Math.max(r, g, b) - Math.min(r, g, b) > settings.maximumFabricChroma) continue;
    const luminance = (54 * r + 183 * g + 19 * b) / 256;
    const weight = Math.max(0, Math.min(1, (luminance - settings.outlineThreshold) / (settings.fullToneThreshold - settings.outlineThreshold)));
    if (weight === 0) continue;
    const offset = bra ? settings.braOffset : settings.briefsOffset;
    for (let c = 0; c < 3; c++) body.data[p + c] = Math.min(255, original.data[p + c]  + Math.round(offset[c]  * weight));
    mask.data.fill(255, p, p + 3); mask.data[p + 3] = Math.round(weight * 255);
    changedPixels++; if (bra) braPixels++; else briefsPixels++;
  }
  if (braPixels < 10_000 || briefsPixels < 3000) throw new Error('Complete SW bra and brief fabric selections required.');
  return { body, mask, measurements: { changedPixels, braPixels, briefsPixels, sourceAlphaPreserved: true, geometryChanged: false } };
}

const body=decode(await readFile(resolve(root,'SW-body-v1.png'))),settings=JSON.parse(await readFile(resolve(root,'clothing-settings-sw-v5.json'),'utf8')),result=recolourSouthwestClothing(body,settings);for(const[name,im]of[['SW-body-v5.png',result.body],['SW-clothing-mask-v5.png',result.mask]])await writeFile(resolve(root,name),encode({...im,channels:4,depth:8},{zlib:{level:9}}),{flag:'wx'});
