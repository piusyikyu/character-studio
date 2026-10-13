export const reviewedHeadAlignments = [
  { id: 'rotation-only', label: '1: Rotation only', rotationDegrees: -5, offsetX: 0, offsetY: 0 },
  { id: 'translation-only', label: '2: Chin offset only', rotationDegrees: 0, offsetX: 3.3333, offsetY: -3 },
  { id: 'rotation-and-chin', label: '3: Rotation + chin offset', rotationDegrees: -5, offsetX: -0.245, offsetY: -2.945 },
] as const;

/** Offline detailed-art inspection only. No transforms are exported to source or recipes. */
export function faceAlignmentViewer(assets: Record<string, string>, crop: { x: number; y: number; width: number; height: number }, revision = 3) {
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>S head alignment — revision ${revision} review</title>
<style>body{margin:24px;background:#202025;color:#eee;font:16px system-ui}main{max-width:1100px}h1{font-size:22px}label,button{margin-right:12px}input,select,button{vertical-align:middle}button,select{padding:6px}input[type=number]{width:72px}canvas{display:block;margin-top:20px;image-rendering:pixelated}fieldset{border:1px solid #666;margin:14px 0;padding:12px}p{line-height:1.5}.cyan{color:#00d2ff}.orange{color:#ffb000}.pink{color:#ff0080}</style>
<main><h1>S anatomy over the reference face</h1>
<p>Adjust rotation and position together. The chin is one alignment landmark, not a fixed pivot. Add corresponding jaw landmarks to compare both sides. All transforms are temporary inspection settings; artwork stays at its native coordinates.</p>
<fieldset><legend>Comparison</legend><label>View <select id="mode"><option value="overlay">Reference overlay</option><option value="assembly">Assembled cheek gaps</option></select></label>
<label>Head opacity <input id="opacity" type="range" min="0" max="100" value="50"><output id="value">50%</output></label>
<label><input id="outline" type="checkbox" checked>Head outline</label><label><input id="gaps" type="checkbox">Gap markers</label>
<label>Zoom <select id="zoom"><option value="1">1×</option><option value="2">2×</option><option value="3" selected>3×</option><option value="4">4×</option></select></label>
<button id="reference-only">Reference only</button><button id="half">50% overlay</button></fieldset>
<fieldset id="alignment"><legend>Temporary head alignment</legend>
<label>Rotation ° <input id="rotation" type="number" step="0.1" value="0"></label><label>X offset <input id="offset-x" type="number" step="0.1" value="0"></label><label>Y offset <input id="offset-y" type="number" step="0.1" value="0"></label><button id="reset-alignment">Reset alignment</button>
${revision === 3 ? `<p><label>Reviewed comparison <select id="reviewed-comparison">${reviewedHeadAlignments.map((item) => `<option value="${item.id}">${item.label}</option>`).join('')}</select></label><button id="apply-comparison">Apply comparison</button></p>
<p>Comparison 3 is the working jaw alignment from your review. The character-left ear (screen-right) still needs fit/size review. Saved comparisons contain transforms only, not your clicked landmarks.</p>` : '<p>This is the newly authored native fit. Start at zero rotation/offset. The previous revision’s −5° comparison guided authoring; its preview transform has not been applied to these layers.</p>'}
<p><label>Landmark <select id="landmark"><option value="chin">Chin</option><option value="screen-left-jaw">Screen-left jaw</option><option value="screen-right-jaw">Screen-right jaw</option></select></label><button id="pick-reference">Mark reference point</button><button id="pick-head">Mark head point</button><button id="fit">Fit marked points</button><button id="clear-points">Clear points</button></p>
<p id="landmark-status">Pick the same anatomical locations in the reference and head. No landmarks are assumed.</p></fieldset>
<p><span class="cyan">Cyan: head/ear contour and head landmarks.</span> <span class="orange">Orange: reference landmarks.</span> The horizontal line below the chin is the head layer's lower edge, not the chin. <span class="pink">Magenta: native assembled cheek gaps.</span> Screen-right is the character's left in S. Rotation cannot repair local cheek shape or missing hair coverage. Revision ${revision} remains unapproved.</p>
<canvas id="preview" width="${crop.width}" height="${crop.height}" aria-label="Head anatomy alignment over the reference"></canvas><p id="coordinates">Coordinates are native reference coordinates; zoom changes only the display.</p></main>
<script>
const assets=${JSON.stringify(assets)},region=${JSON.stringify(crop)},reviewedComparisons=${JSON.stringify(reviewedHeadAlignments)},images={},center={x:region.x+region.width/2,y:region.y+region.height/2},points={};
const get=id=>document.getElementById(id),canvas=get('preview'),ctx=canvas.getContext('2d');
const mode=get('mode'),opacity=get('opacity'),outline=get('outline'),gaps=get('gaps'),zoom=get('zoom'),rotation=get('rotation'),offsetX=get('offset-x'),offsetY=get('offset-y');
let picking=null;
const state=()=>({angle:(Number(rotation.value)||0)*Math.PI/180,x:Number(offsetX.value)||0,y:Number(offsetY.value)||0});
function transform(p,inverse=false){const s=state(),c=Math.cos(s.angle),t=Math.sin(s.angle);if(inverse){const x=p.x-center.x-s.x,y=p.y-center.y-s.y;return{x:center.x+c*x+t*y,y:center.y-t*x+c*y}}const x=p.x-center.x,y=p.y-center.y;return{x:center.x+c*x-t*y+s.x,y:center.y+t*x+c*y+s.y}}
const draw=image=>ctx.drawImage(image,-region.x,-region.y);
function drawHead(image){const s=state();ctx.save();ctx.translate(center.x-region.x+s.x,center.y-region.y+s.y);ctx.rotate(s.angle);ctx.drawImage(image,-center.x,-center.y);ctx.restore()}
function marker(p,colour){ctx.strokeStyle=colour;ctx.lineWidth=1;const x=p.x-region.x,y=p.y-region.y;ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.stroke()}
function render(){ctx.imageSmoothingEnabled=false;ctx.globalAlpha=1;for(let y=0;y<region.height;y+=8)for(let x=0;x<region.width;x+=8){ctx.fillStyle=((x/8+y/8)%2)?'#c3c3c3':'#ebebeb';ctx.fillRect(x,y,8,8)}
const overlay=mode.value==='overlay';get('alignment').disabled=!overlay;
if(overlay){draw(images.reference);ctx.globalAlpha=Number(opacity.value)/100;drawHead(images.head);ctx.globalAlpha=1;if(outline.checked)drawHead(images.contour);for(const pair of Object.values(points)){if(pair.reference)marker(pair.reference,'#ffb000');if(pair.head)marker(transform(pair.head),'#00d2ff')}}else{draw(images.assembled);if(gaps.checked)draw(images.gaps)}
canvas.style.width=region.width*Number(zoom.value)+'px';canvas.style.height=region.height*Number(zoom.value)+'px';get('value').value=opacity.value+'%';
const descriptions=Object.entries(points).map(([name,pair])=>{if(!pair.head||!pair.reference)return name+': mark both points';const p=transform(pair.head);return name+': '+Math.hypot(p.x-pair.reference.x,p.y-pair.reference.y).toFixed(2)+' px residual'});
get('landmark-status').textContent=picking?'Click the '+picking+' '+get('landmark').selectedOptions[0].text.toLowerCase()+'.':descriptions.join(' · ')||'Pick corresponding chin and jaw locations. Fit uses all completed pairs equally; it does not resize or deform the head.';window.reviewReady=true}
function fit(){const pairs=Object.values(points).filter(p=>p.head&&p.reference);if(!pairs.length)return;const mean=side=>pairs.reduce((a,p)=>({x:a.x+p[side].x/pairs.length,y:a.y+p[side].y/pairs.length}),{x:0,y:0}),h=mean('head'),r=mean('reference');let angle=state().angle;
if(pairs.length>1){let dot=0,cross=0;for(const p of pairs){const hx=p.head.x-h.x,hy=p.head.y-h.y,rx=p.reference.x-r.x,ry=p.reference.y-r.y;dot+=hx*rx+hy*ry;cross+=hx*ry-hy*rx}if(Math.hypot(dot,cross)<1e-8){picking=null;get('landmark-status').textContent='Use distinct corresponding locations to estimate rotation.';return}angle=Math.atan2(cross,dot)}
rotation.value=(angle*180/Math.PI).toFixed(4);const c=Math.cos(angle),t=Math.sin(angle);offsetX.value=(r.x-center.x-c*(h.x-center.x)+t*(h.y-center.y)).toFixed(4);offsetY.value=(r.y-center.y-t*(h.x-center.x)-c*(h.y-center.y)).toFixed(4);picking=null;render()}
Promise.all(Object.entries(assets).map(([name,url])=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{images[name]=image;resolve()};image.onerror=reject;image.src=url}))).then(()=>{for(const control of[mode,opacity,outline,gaps,zoom,rotation,offsetX,offsetY])control.addEventListener('input',render);mode.addEventListener('change',()=>{picking=null;gaps.checked=mode.value==='assembly';outline.checked=mode.value==='overlay';render()});
get('reference-only').onclick=()=>{mode.value='overlay';opacity.value='0';outline.checked=false;gaps.checked=false;render()};get('half').onclick=()=>{mode.value='overlay';opacity.value='50';outline.checked=true;gaps.checked=false;render()};get('reset-alignment').onclick=()=>{rotation.value=offsetX.value=offsetY.value='0';picking=null;render()};get('pick-reference').onclick=()=>{picking='reference';render()};get('pick-head').onclick=()=>{picking='head';render()};get('fit').onclick=fit;get('clear-points').onclick=()=>{for(const key of Object.keys(points))delete points[key];picking=null;render()};render()});
if(get('apply-comparison'))get('apply-comparison').onclick=()=>{const saved=reviewedComparisons.find(item=>item.id===get('reviewed-comparison').value);rotation.value=String(saved.rotationDegrees);offsetX.value=String(saved.offsetX);offsetY.value=String(saved.offsetY);picking=null;render()};
function pointer(event){const box=canvas.getBoundingClientRect();return{x:region.x+(event.clientX-box.left)*region.width/box.width,y:region.y+(event.clientY-box.top)*region.height/box.height}}
canvas.addEventListener('pointermove',event=>{const p=pointer(event);get('coordinates').textContent='Native reference coordinate: ('+p.x.toFixed(1)+', '+p.y.toFixed(1)+').'});
canvas.addEventListener('click',event=>{if(!picking||mode.value!=='overlay')return;const name=get('landmark').value,p=pointer(event);(points[name]??={})[picking]=picking==='head'?transform(p,true):p;picking=null;render()});
</script></html>`;
}
