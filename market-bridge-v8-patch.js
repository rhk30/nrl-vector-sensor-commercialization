(()=>{
'use strict';
const section=document.querySelector('.market-motion-v8');
if(!section||section.dataset.v9Patch==='1')return;
section.dataset.v9Patch='1';
const svg=section.querySelector('.mm-scene');
if(!svg)return;

// --- Readability / circular safe area -------------------------------------------------
const style=document.createElement('style');
style.textContent=`
.market-motion-v8 .op-title{font-size:13px!important;font-weight:700;letter-spacing:.07em;fill:#d6e0da!important}
.market-motion-v8 .micro{font-size:9px!important;letter-spacing:.045em;fill:#94a39b!important}
.market-motion-v8 .legend text{font-size:8.5px!important;fill:#aab7b0!important}
.market-motion-v8 .legend circle{r:4.5px;fill:#d2ddd7!important;opacity:.88!important}
.market-motion-v8 .depth-marks text{font-size:8px!important;fill:#829189!important}
.market-motion-v8 .node-label{font-size:10px!important;font-weight:700;fill:#edf3ef!important}
.market-motion-v8 .node-micro{font-size:8px!important;fill:#b8c5be!important}
.market-motion-v8 .node.secondary{opacity:.82!important}
.market-motion-v8 .node.primary .node-base{stroke-width:2.3!important;stroke-opacity:1!important}
.market-motion-v8 .node.primary .meter{fill:#d4ded8!important;stroke:#fff!important;stroke-opacity:.95!important}
.market-motion-v8 .node.primary .node-ring{stroke-opacity:.52!important}
.market-motion-v8 .node.primary .node-ring.outer{stroke-opacity:.24!important}
.market-motion-v8 .node-pulse{display:none!important}
.market-motion-v8 .v9-wave{fill:none;stroke:#c8d6ce;stroke-width:1.25;stroke-opacity:.2}
.market-motion-v8 .v9-wave.w2{stroke-opacity:.13}
.market-motion-v8 .v9-wave.w3{stroke-opacity:.08}
.market-motion-v8 .v9-wave-label{font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;fill:#9baaa2}
.market-motion-v8 .v9-source-dot{fill:#e2ebe5;opacity:.88}
`;
document.head.appendChild(style);

// Move all important HUD text away from the circular crop.
const title=svg.querySelector('.op-title');
if(title){title.setAttribute('x','120');title.setAttribute('y','102');title.textContent='HYPOTHETICAL NAVAL OPERATING PICTURE';}
const micros=[...svg.querySelectorAll('text.micro')];
for(const t of micros){
  const txt=(t.textContent||'').trim();
  if(txt.startsWith('ILLUSTRATIVE VIEW')){t.setAttribute('x','120');t.setAttribute('y','126');t.textContent='ILLUSTRATIVE CONTEXT // NOT A NAVY UI // NOT A DETECTION-RANGE DISPLAY';}
  if(txt.startsWith('DASHED =')){t.setAttribute('x','120');t.setAttribute('y','151');t.textContent='DASHED = SOURCE-TO-NODE BEARING // SOLID = RECEIVER / DATA PATH';}
  if(txt.startsWith('SEA SURFACE')){t.setAttribute('x','120');t.setAttribute('y','238');t.textContent='SEA SURFACE // ILLUSTRATIVE';}
  if(txt.startsWith('BATHYMETRY')){t.setAttribute('x','120');t.setAttribute('y','720');t.textContent='SEABED // ILLUSTRATIVE BATHYMETRY';}
}
const legend=svg.querySelector('.legend');
if(legend){legend.setAttribute('transform','translate(50 10)');}

// Move the primary node annotation to a readable position that stays inside the circle.
const primary=svg.querySelector('#v8PrimaryNode');
if(primary){
  const texts=[...primary.querySelectorAll('text')];
  texts.forEach((t,i)=>{t.setAttribute('x','72');t.setAttribute('y',String(-70+i*18));});
}

// --- Acoustic wavefronts: source emits; sensor receives --------------------------------
const ns='http://www.w3.org/2000/svg';
const layer=document.createElementNS(ns,'g');
layer.setAttribute('id','v9AcousticLayer');
const circles=[];
for(let i=0;i<3;i++){
  const c=document.createElementNS(ns,'circle');
  c.setAttribute('class','v9-wave w'+(i+1));
  layer.appendChild(c);circles.push(c);
}
const sourceDot=document.createElementNS(ns,'circle');
sourceDot.setAttribute('r','3.4');sourceDot.setAttribute('class','v9-source-dot');layer.appendChild(sourceDot);
const waveLabel=document.createElementNS(ns,'text');
waveLabel.setAttribute('class','v9-wave-label');
waveLabel.textContent='ILLUSTRATIVE ACOUSTIC WAVEFRONTS';layer.appendChild(waveLabel);
// Insert behind the patent nodes but above water/bathymetry.
const primaryNode=svg.querySelector('#v8PrimaryNode');
(primaryNode?.parentNode||svg).insertBefore(layer,primaryNode||null);

const war=svg.querySelector('#v8Warship');
const fast=svg.querySelector('#v8Fastcraft');
const sub=svg.querySelector('#v8Submarine');
const bw=svg.querySelector('#v8BearingWar'),bf=svg.querySelector('#v8BearingFast'),bs=svg.querySelector('#v8BearingSub');
let prevWar=null,prevFast=null,prevSub=null;

function num(el,a){return Number(el?.getAttribute(a)||0)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function orientSideProfile(el,x,y,prev,scale,allowPitch){
  if(!el)return {x,y};
  let dir=1,pitch=0;
  if(prev){
    const dx=x-prev.x,dy=y-prev.y;
    if(Math.abs(dx)>.02)dir=dx>=0?1:-1; else dir=prev.dir||1;
    if(allowPitch&&Math.abs(dx)>.04)pitch=clamp(Math.atan2(dy,Math.abs(dx))*180/Math.PI,-4,4);
  }
  el.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(dir*scale).toFixed(3)} ${scale.toFixed(3)}) rotate(${pitch.toFixed(2)})`);
  return {x,y,dir};
}

function patchFrame(now){
  // Bearing endpoints are updated by the original renderer every frame, so they are a
  // reliable source for the current platform positions without starting a second motion model.
  const wx=num(bw,'x2'),wy=num(bw,'y2');
  const fx=num(bf,'x2'),fy=num(bf,'y2');
  const sx=num(bs,'x2'),sy=num(bs,'y2');

  // Surface vessels remain upright. They face left/right by mirroring rather than rotating
  // through 180 degrees, which previously made them appear upside down.
  prevWar=orientSideProfile(war,wx,wy,prevWar,.78,false);
  prevFast=orientSideProfile(fast,fx,fy,prevFast,.72,false);
  prevSub=orientSideProfile(sub,sx,sy,prevSub,.77,true);

  // Wavefronts originate at the submerged source and expand through the water toward the node.
  // They are qualitative field cues only: no range or source level is encoded.
  const t=(now/1000)%9;
  circles.forEach((c,i)=>{
    const phase=((t+i*3)/9)%1;
    const r=18+phase*155;
    c.setAttribute('cx',sx.toFixed(1));c.setAttribute('cy',sy.toFixed(1));c.setAttribute('r',r.toFixed(1));
    c.style.opacity=String((1-phase)*.42);
  });
  sourceDot.setAttribute('cx',sx.toFixed(1));sourceDot.setAttribute('cy',sy.toFixed(1));
  waveLabel.setAttribute('x',String(clamp(sx-104,135,555)));
  waveLabel.setAttribute('y',String(clamp(sy-62,330,485)));

  requestAnimationFrame(patchFrame);
}
requestAnimationFrame(patchFrame);
})();