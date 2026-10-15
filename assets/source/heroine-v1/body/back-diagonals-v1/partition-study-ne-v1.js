// Replay only in an isolated scratch copy. Native versioned source outputs use exclusive writes.
import{readFile,writeFile}from'node:fs/promises';import{resolve}from'node:path';import{fileURLToPath}from'node:url';import{createRequire}from'node:module';const root=fileURLToPath(new URL('.',import.meta.url));const{decode,encode}=createRequire(resolve(root,'../../../../../tools/asset-validator/package.json'))('fast-png');const blankImage=(width,height)=>({width,height,channels:4,depth:8,data:new Uint8Array(width*height*4)});
function selectNativeBodySilhouette(study           , settings                                                                                                                                                                                                                                                                                  ) {
  if (study.width !== 1024 || study.height !== 1536) throw new Error('Native body study required.');
  const polygons = [settings.bodyPolygon, settings.handPolygons.physicalLeft, settings.handPolygons.physicalRight];
  const samples = new Uint8Array(1024 * 1536);
  for (let row = settings.cutY * 4; row < 1536 * 4; row++) {
    const y = (row + .5) / 4, intervals             = [];
    for (const points of polygons) {
      const crossings           = [];
      for (let a = 0, b = points.length - 1; a < points.length; b = a++) {
        const [ax, ay] = points[a] , [bx, by] = points[b] ;
        if ((ay > y) !== (by > y)) crossings.push(ax + (y - ay) * (bx - ax) / (by - ay));
      }
      crossings.sort((a, b) => a - b);
      for (let j = 0; j < crossings.length; j += 2) intervals.push([crossings[j] , crossings[j + 1] ]);
    }
    intervals.sort((a, b) => a[0]  - b[0] );
    const union             = [];
    for (const span of intervals) {
      const last = union.at(-1);
      if (last && span[0]  <= last[1] ) last[1] = Math.max(last[1] , span[1] ); else union.push([...span]);
    }
    for (const [left, right] of union) {
      const end = Math.min(4096, Math.ceil(right  * 4 - .5));
      for (let column = Math.max(0, Math.ceil(left  * 4 - .5)); column < end; column++) {
        const p = Math.floor(row / 4) * 1024 + Math.floor(column / 4); samples[p] = samples[p]  + 1;
      }
    }
  }
  const tolerance = settings.contourTolerancePixels, horizontal = new Uint8Array(samples.length), envelope = new Uint8Array(samples.length);
  for (let y = settings.cutY; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    let largest = 0;
    for (let k = Math.max(0, x - tolerance); k <= Math.min(1023, x + tolerance); k++) largest = Math.max(largest, samples[y * 1024 + k] );
    horizontal[y * 1024 + x] = largest;
  }
  for (let y = settings.cutY; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    let largest = 0;
    for (let k = Math.max(settings.cutY, y - tolerance); k <= Math.min(1535, y + tolerance); k++) largest = Math.max(largest, horizontal[k * 1024 + x] );
    envelope[y * 1024 + x] = largest;
  }
  const mask = blankImage(1024, 1536), body = blankImage(1024, 1536);
  for (let p = 0; p < samples.length; p++) {
    const i = p * 4, coverage = Math.round(envelope[p]  * 255 / 16), alpha = Math.round(study.data[i + 3]  * coverage / 255);
    if (coverage) { mask.data.fill(255, i, i + 3); mask.data[i + 3] = coverage; }
    if (alpha >= 8) { body.data.set(study.data.subarray(i, i + 3), i); body.data[i + 3] = alpha; }
  }
  return { body, mask };
}

const study=decode(await readFile(resolve(root,'inputs/NE-body-study-v1.png')),{checkCrc:true}),settings=JSON.parse(await readFile(resolve(root,'selections-ne-v1.json'),'utf8'));if(study.channels!==4||settings.direction!=='NE'||settings.cutY!==294||settings.coverageSamples!==4||settings.contourTolerancePixels!==0||settings.minimumStudyAlpha!==8)throw new Error('Native NE selection settings required.');const result=selectNativeBodySilhouette(study,settings);const neck=decode(await readFile(resolve(root,'../../head/soft-oval-v1/NE-neck-v1.png')),{checkCrc:true});for(let i=0;i<neck.data.length;i+=4)if(neck.data[i+3]<8)neck.data.fill(0,i,i+4);const posedNeck={...neck,data:neck.data.slice()},neckMask=blankImage(1024,1536);for(let y=294;y<308;y++)for(let x=0;x<1024;x++){const i=(y*1024+x)*4;if(neck.data[i+3]>=8&&result.body.data[i+3]>=8){posedNeck.data.fill(0,i,i+4);neckMask.data.fill(255,i,i+4);}}for(const[name,im]of[['NE-body-v1.png',result.body],['NE-body-mask-v1.png',result.mask],['NE-neck-body-fit-v1.png',posedNeck],['NE-neck-to-body-v1.png',neckMask]])await writeFile(resolve(root,name),encode({...im,channels:4,depth:8},{zlib:{level:9}}),{flag:'wx'});let interior=0,lost=0;const examples=[];for(let y=294;y<1536;y++)for(let x=0;x<1024;x++){const i=(y*1024+x)*4;if(study.data[i+3]>=245){interior++;if(result.body.data[i+3]!==study.data[i+3]){lost++;if(examples.length<30)examples.push([x,y]);}}}console.log(JSON.stringify({nativeInteriors:interior,lostInteriors:lost,examples}));
