interface Frame {
  readonly direction: string;
  readonly order: readonly string[];
  readonly parts: readonly { readonly id: string; readonly plane: string; readonly url?: string }[];
  readonly anatomy: string;
  readonly hair: string;
  readonly unavailable: readonly string[];
}

/** Read-only review controls use existing native images; no duplicate layers or runtime catalog changes. */
export function bodyPartSetViewer(frames: readonly Frame[]) {
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Eight-facing body parts</title>
<style>body{margin:20px;background:#202124;color:#eee;font:16px system-ui}p{max-width:85ch;line-height:1.5}label{display:inline-block;margin:0 16px 12px 0}select,button{font:inherit;padding:4px}fieldset{margin:0 0 16px}#grid{display:grid;grid-template-columns:repeat(4,max-content);gap:16px;overflow:auto}article h2{color:#ff0;margin:0 0 8px}article p{font-size:14px;max-width:250px;min-height:44px;margin:4px 0}canvas{display:block;background:repeating-conic-gradient(#ebebeb 0% 25%,#c3c3c3 0% 50%) 0 0/24px 24px}article[hidden]{display:none}#error{color:#ffb0b0}#grid[data-background="black"] canvas{background:#111}#grid[data-background="green"] canvas{background:#00ff00}</style>
<h1>Eight-facing body parts</h1>
<p>Isolate visible parts to inspect the cuts. Compare anatomy or the approved hair fit. Profile views have unavailable far-side parts. This combined review awaits approval; concealed joints and separate underwear remain unfinished.</p>
<label>View <select id="mode"><option value="parts">Visible body parts</option><option value="anatomy">Anatomy</option><option value="hair">With hair</option></select></label>
<label>Facing <select id="direction"><option value="all">All eight</option>${frames.map(f => `<option value="${f.direction}">${f.direction}</option>`).join('')}</select></label>
<label>Zoom <select id="zoom"><option value="0.25">25%</option><option value="0.5">50%</option><option value="1">100% native</option></select></label>
<label>Background <select id="background"><option value="checker">Checker</option><option value="black">Black</option><option value="green">Green</option></select></label>
<fieldset id="parts"><legend>Visible parts — character's left and right</legend>${['torso','right-arm','left-arm','right-leg','left-leg'].map(id => `<label><input type="checkbox" data-part="${id}" checked>${id.replaceAll('-', ' ')}</label>`).join('')}<button id="reset" type="button">Show all parts</button></fieldset>
<p id="error" role="alert"></p><p id="status" role="status">Loading…</p><div id="grid" data-background="checker">${frames.map(f => `<article id="frame-${f.direction}" aria-label="${f.direction} body parts"><h2>${f.direction}</h2><canvas width="1024" height="1536" aria-label="${f.direction} native preview"></canvas><p>${f.unavailable.length ? 'Unavailable: ' + f.unavailable.map(p => p.replaceAll('-', ' ')).join(', ') : 'All five visible regions available.'}</p></article>`).join('')}</div>
<script>
const frames=${JSON.stringify(frames).replaceAll('<', '\\u003c')},mode=document.getElementById('mode'),direction=document.getElementById('direction'),zoom=document.getElementById('zoom'),background=document.getElementById('background'),grid=document.getElementById('grid'),parts=document.getElementById('parts'),checks=[...parts.querySelectorAll('input')],cache=new Map();let revision=0;
function load(url){if(!cache.has(url))cache.set(url,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Cannot load review image: '+url));image.src=url;}));return cache.get(url);}
async function update(){const current=++revision;grid.dataset.ready='false';parts.disabled=mode.value!=='parts';grid.dataset.background=background.value;document.getElementById('error').textContent='';try{const selected=checks.filter(c=>c.checked).map(c=>c.dataset.part);await Promise.all(frames.map(async frame=>{const article=document.getElementById('frame-'+frame.direction),canvas=article.querySelector('canvas');article.hidden=direction.value!=='all'&&direction.value!==frame.direction;canvas.style.width=1024*Number(zoom.value)+'px';canvas.style.height=1536*Number(zoom.value)+'px';if(article.hidden)return;const urls=mode.value==='parts'?frame.order.flatMap(plane=>frame.parts.filter(p=>p.plane===plane&&p.url&&selected.includes(p.id)).map(p=>p.url)):[frame[mode.value]],images=await Promise.all(urls.map(load));if(current!==revision)return;const context=canvas.getContext('2d');context.clearRect(0,0,1024,1536);context.imageSmoothingEnabled=false;for(const image of images)context.drawImage(image,0,0);}));if(current===revision){grid.dataset.ready='true';document.getElementById('status').textContent=(direction.value==='all'?'All eight facings':direction.value)+' — '+mode.options[mode.selectedIndex].text+' — '+Math.round(Number(zoom.value)*100)+'%';}}catch(error){if(current===revision){document.getElementById('error').textContent=error.message;document.getElementById('status').textContent='Review images unavailable.';}}}
for(const control of[mode,direction,zoom,background,...checks])control.addEventListener('change',update);document.getElementById('reset').addEventListener('click',()=>{for(const c of checks)c.checked=true;update();});update();
</script></html>\n`;
}
