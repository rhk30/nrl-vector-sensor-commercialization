(()=>{'use strict';
const svg=document.querySelector('.scene-panel svg');
if(!svg)return;
const NS='http://www.w3.org/2000/svg';
const make=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e};

// Shared defs for subtle fades. Keep this lightweight and entirely illustrative.
let defs=svg.querySelector('defs');
if(!defs){defs=make('defs');svg.insertBefore(defs,svg.firstChild)}
const grad=make('linearGradient',{id:'rhkWakeFade',x1:'0%',y1:'0%',x2:'100%',y2:'0%'});
grad.append(make('stop',{offset:'0%','stop-color':'#cfd4cc','stop-opacity':'0'}),make('stop',{offset:'55%','stop-color':'#cfd4cc','stop-opacity':'.16'}),make('stop',{offset:'100%','stop-color':'#cfd4cc','stop-opacity':'0'}));defs.appendChild(grad);

function addWake(sceneSel,x,y,w=120,rot=0){const g=svg.querySelector(sceneSel);if(!g)return;const p=make('path',{d:`M ${x-w} ${y} Q ${x-w*.55} ${y-4} ${x} ${y}`,'class':'rhk-wake','stroke':'url(#rhkWakeFade)','stroke-width':'1.2','fill':'none','transform':`rotate(${rot} ${x} ${y})`});g.insertBefore(p,g.firstChild)}
function addDepthBand(sceneSel,y,opacity=.08){const g=svg.querySelector(sceneSel);if(!g)return;const band=make('rect',{x:'40',y:String(y),width:'720',height:'1',fill:'#d7d9d2',opacity:String(opacity),'class':'rhk-depth-band'});g.insertBefore(band,g.firstChild)}
function addBearingGlow(sceneSel,x1,y1,x2,y2){const g=svg.querySelector(sceneSel);if(!g)return;const l=make('line',{x1,y1,x2,y2,'class':'rhk-bearing-glow','stroke':'#d2d5cd','stroke-width':'1','stroke-dasharray':'3 10','opacity':'.2'});g.appendChild(l)}

// Do NOT touch the wind scene: user prefers its current composition.
addWake('.scene-group[data-scene="fleet"]',510,164,150,0);
addWake('.scene-group[data-scene="swcc"]',510,266,95,0);
addWake('.scene-group[data-scene="harbor"]',450,269,125,0);
addWake('.scene-group[data-scene="subsea"]',665,142,105,0);

addDepthBand('.scene-group[data-scene="subsea"]',360,.055);
addDepthBand('.scene-group[data-scene="fleet"]',410,.05);
addDepthBand('.scene-group[data-scene="swcc"]',390,.04);
addDepthBand('.scene-group[data-scene="harbor"]',370,.04);

addBearingGlow('.scene-group[data-scene="subsea"]','280','455','565','445');
addBearingGlow('.scene-group[data-scene="fleet"]','510','278','230','520');
addBearingGlow('.scene-group[data-scene="swcc"]','355','470','510','250');
addBearingGlow('.scene-group[data-scene="harbor"]','275','430','450','245');

// Gentle camera drift applied only to non-wind scenes. It changes the group as a whole,
// so the craft's native SVG transforms remain intact.
const drifting=[
  ['subsea',0.65,0.18,14],
  ['fleet',0.45,0.12,16],
  ['swcc',0.4,0.16,15],
  ['harbor',0.32,0.1,17]
];
let raf=0,start=performance.now();
function tick(now){const t=(now-start)/1000;drifting.forEach(([id,dx,dy,period])=>{const g=svg.querySelector(`.scene-group[data-scene="${id}"]`);if(!g)return;const x=Math.sin((t/period)*Math.PI*2)*dx;const y=Math.cos((t/period)*Math.PI*2)*dy;g.style.translate=`${x}px ${y}px`;});raf=requestAnimationFrame(tick)}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)raf=requestAnimationFrame(tick);
window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});
})();