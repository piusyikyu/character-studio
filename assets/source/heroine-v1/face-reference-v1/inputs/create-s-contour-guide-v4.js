import{createRequire}from'node:module';import{readFile,writeFile}from'node:fs/promises';const{decode,encode}=createRequire(`${process.cwd()}/tools/asset-validator/package.json`)('fast-png');
const root='assets/source/heroine-v1/face-reference-v1/',cfg=JSON.parse(await readFile(root+'authoring-v3.json')),g=JSON.parse(await readFile(root+'inputs/alignment-v4/ownership-settings.json'));
const head=decode(await readFile(root+cfg.headFit.source)),neck=decode(await readFile(root+cfg.headFit.neck.source)),right=decode(await readFile(root+cfg.headFit.rightEar.source)),ear=decode(await readFile(root+'inputs/alignment-v4/S-left-ear-study.png'));
const data=new Uint8Array(1024*1536*4);for(const a of[neck,head,right])for(let i=0;i<data.length;i+=4)if(a.data[i+3]>=8)data.set(a.data.subarray(i,i+4),i);
const contains=(x,y,p)=>{let s=false;for(let a=0,b=p.length-1;a<p.length;b=a++){const[ax,ay]=p[a],[bx,by]=p[b];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)s=!s;}return s};
const face=[[437,170],[440,197],[447,214],[455,229],[468,241],[482,251],[496,260],[512,267],[526,259],[541,246],[554,231],[566,213],[577,198],[588,170]],neckShape=[[492,254],[536,253],[536,268],[537,280],[542,293],[484,293],[490,278]];
for(let y=170;y<293;y++)for(let x=435;x<609;x++){const i=(y*1024+x)*4;data.fill(0,i,i+4);if(contains(x+.5,y+.5,face)||contains(x+.5,y+.5,neckShape))data.set([255,218,194,255],i);}
for(let y=180;y<224;y++)for(let x=574;x<602;x++){const i=(y*1024+x)*4;if(contains(x+.5,y+.5,g.leftEar)&&ear.data[i+3]>=8)data.set(ear.data.subarray(i,i+4),i);}
await writeFile(root+'inputs/alignment-v4/S-contour-fill-guide.png',encode({width:1024,height:1536,data,channels:4,depth:8}),{flag:'wx'});
const ref=decode(await readFile('assets/staging/heroine-v1/reference-import-v1/transparent/S.png'));for(let y=0;y<1536;y++)for(let x=0;x<1024;x++)if(x<416||x>608||y<85||y>322)ref.data.fill(0,(y*1024+x)*4,(y*1024+x)*4+4);
await writeFile(root+'inputs/alignment-v4/S-reference-face-neck.png',encode(ref),{flag:'wx'});
await writeFile(root+'inputs/alignment-v4/contour-fill-settings.json',JSON.stringify({schemaVersion:1,purpose:'Manual silhouette guide only; flat fill is not production artwork',face,neckShape},null,2)+'\n',{flag:'wx'});
