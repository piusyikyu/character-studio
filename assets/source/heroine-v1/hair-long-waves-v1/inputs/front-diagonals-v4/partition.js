import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const require=createRequire(process.cwd()+'/tools/asset-validator/package.json');
const {decode,encode}=require('fast-png');
const base=resolve('assets/source/heroine-v1/hair-long-waves-v1');
const inputs=resolve(base,'inputs/front-diagonals-v4');
await mkdir(inputs,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
const defs={
 SE:{skinROI:[[475,110],[631,110],[639,280],[571,292],[488,291]],eyes:[[[519,155],[540,156],[560,162],[574,169],[573,181],[565,187],[550,185],[533,177],[522,174]],[[600,172],[618,163],[620,181],[610,193],[603,195]]],front:[[[414,0],[682,0],[681,218],[629,244],[562,235],[498,229],[482,205],[410,164]],[[480,154],[516,188],[510,230],[527,254],[530,287],[540,318],[520,333],[502,318],[486,310],[479,275],[468,267],[471,223]],[[611,169],[642,207],[628,235],[650,270],[650,286],[659,295],[671,327],[672,340],[650,349],[622,345],[603,322],[591,285],[572,274],[566,246],[596,221]]]},
 SW:{skinROI:[[390,110],[545,110],[557,304],[524,333],[489,322],[456,296],[395,262]],eyes:[[[435,172],[457,172],[478,166],[492,172],[488,187],[473,195],[453,202],[440,201]],[[400,190],[411,190],[419,197],[428,209],[427,216],[416,217],[406,205]]],front:[[[338,0],[613,0],[626,184],[562,209],[537,205],[483,232],[444,244],[390,233],[337,185]],[[381,153],[411,184],[420,225],[434,248],[432,281],[417,310],[423,337],[431,354],[416,377],[387,381],[362,352],[350,317],[360,279],[364,241]],[[502,170],[523,183],[514,224],[522,255],[529,276],[522,300],[523,324],[511,352],[491,363],[474,357],[458,336],[454,314],[468,294],[484,266],[480,241],[493,209]]]},
};
function inside(x,y,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}

const derivations=[];
for(const [direction,def] of Object.entries(defs)){
 const bytes=await readFile(resolve(base,direction+'-master-v4.png')),master=decode(bytes);
 const layers=Object.fromEntries(['head','front','rear'].map(p=>[p,new Uint8Array(master.data.length)]));
 const masks=Object.fromEntries(['head','front','rear'].map(p=>[p,new Uint8Array(master.data.length)]));
 const counts={head:0,front:0,rear:0};
 for(let y=0;y<1536;y++)for(let x=0;x<1024;x++){
 const i=(y*1024+x)*4;if(!master.data[i+3])continue;
 const px=x+.5,py=y+.5;
 // Manual skin ROI and individual eye selections. Chroma guard prevents pale hair inside the head ROI being mistaken for skin.
 const skin=inside(px,py,def.skinROI)&&master.data[i]-master.data[i+2]>15&&master.data[i]>=master.data[i+1];
 const eye=def.eyes.some(p=>inside(px,py,p));
 const dark=inside(px,py,def.skinROI)&&master.data[i]<90&&master.data[i+1]<85&&master.data[i+2]<130;
 const part=skin||eye||dark?'head':def.front.some(p=>inside(px,py,p))?'front':'rear';
 layers[part].set(master.data.subarray(i,i+4),i);masks[part].set([255,255,255,255],i);counts[part]++;
 }
 const files=[];
 for(const part of ['head','front','rear']){
 const name=direction+'-'+(part==='rear'?'rear-drape':part==='head'?'review-head':part)+'-v4.png';
 const png=encode({width:1024,height:1536,channels:4,depth:8,data:layers[part]});await writeFile(resolve(base,name),png);
 const maskName=direction+'-'+part+'-mask.png';
 const mask=encode({width:1024,height:1536,channels:4,depth:8,data:masks[part]});await writeFile(resolve(inputs,maskName),mask);
 files.push({part,source:name,sourceSha256:hash(png),mask:'inputs/front-diagonals-v4/'+maskName,maskSha256:hash(mask)});
 }
 derivations.push({direction,master:direction+'-master-v4.png',masterSha256:hash(bytes),pixelCounts:counts,files,manualRegions:def});
}
await writeFile(resolve(inputs,'partition-v4.json'),JSON.stringify({schemaVersion:1,method:'manual-native-mask-partition',authorization:'User chose manually drawn masks to preserve study pixels.',minimumVisibleAlpha:8,skinSelection:'Manually bounded head/neck ROI; R-B > 15 and R >= G selects warm skin only inside that ROI. Manually drawn eye polygons retain eye pixels. Dark head outlines within the same ROI (R < 90, G < 85, B < 130) also belong to the head. Remaining manually drawn crown and short-lock polygons select front hair; all remaining visible master pixels select rear hair.',pixelPolicy:'Every normalized master pixel belongs to exactly one layer; copy all four RGBA channels without transforms, interpolation or recolouring. Hidden scalp/root completion is pending; the head contains only visible reference-study anatomy.',derivations},null,2)+'\n');
console.log(JSON.stringify(derivations.map(({direction,pixelCounts,files})=>({direction,pixelCounts,files})),null,2));
