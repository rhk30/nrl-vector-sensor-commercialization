(()=>{'use strict';
const $=id=>document.getElementById(id);
const q=(sel,root=document)=>root.querySelector(sel);
const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const mission=q('.mission-shell');
if(!mission)return;

const target=$('targetType');
const config=$('sensorConfig');
const bearing=$('missionBearing');
const range=$('missionRange');
const freq=$('missionFreq');
const VISUAL_SPACING=6; // normalized display radius only; not a physical range

// Make architecture labels match the patent language more closely.
if(config){
  const labels={floating:'Floating base / flow meters',tower:'Viscous-channel tower',platform:'Hull / AUV mounting'};
  Array.from(config.options).forEach(o=>{if(labels[o.value])o.textContent=labels[o.value];});
}

const deploymentBasis={
  floating:['Floating / moored','Floating base with one or more flow meters, retaining thread and anchor. US11287508B2.'],
  hull:['Hull / AUV mounting','The specification describes mounting the vector sensor on a submarine or AUV hull. US11287508B2.'],
  sonobuoy:['Sonobuoy tower','Positive-buoyancy AVS tower moored above an anchor. US11408961B2.'],
  towed:['Towed array','Neutrally buoyant AVS embodiments are expressly described for towed-array use. US11408961B2.'],
  tower:['Viscous-channel tower','Tower with multiple differently oriented liquid-filled channels and flow sensors. US11408961B2.'],
  platform:['Hull / AUV mounting','The specification describes mounting the vector sensor on a submarine or AUV hull. US11287508B2.']
};
const refBasis={
  10:'10 Hz: patent estimate of about 10 mm floating-base radius for operation in this frequency range.',
  90:'90 Hz: in-air prototype directionality and responsivity evaluation.',
  530:'530 Hz: reported fundamental frequency of the first mesh prototype.'
};
const sourceNames={surface:'Surface vessel context',submarine:'Submerged vessel context',source:'Generic acoustic source'};

function currentPreset(){return q('.patent-demo-presets button.active',mission)?.dataset.preset||null;}
function resolveDeployment(){
  const preset=currentPreset();
  if(preset)return preset;
  const v=config?.value||'floating';
  return v==='platform'?'platform':v==='tower'?'tower':'floating';
}
function setDeployment(mode){
  mission.dataset.deployment=mode;
  window.dispatchEvent(new CustomEvent('rhk-deployment-change',{detail:{mode}}));
}

// Visual spacing is intentionally not exposed as a model input. The hidden
// legacy range control is retained only so app.js can keep a stable scene radius.
const spacingControl=range?.closest('.control-group');
if(spacingControl){
  spacingControl.style.display='none';
  spacingControl.setAttribute('aria-hidden','true');
}
if(range){
  range.value=String(VISUAL_SPACING);
  range.tabIndex=-1;
}

// Replace static patent fact cards inside the mission demo with mechanics that
// actually respond to the user's geometry controls. Prototype facts remain in
// the Technology section where they belong.
const readout=q('.mission-readout',mission);
if(readout){
  readout.innerHTML=`
    <div class="readout-block"><span>Deployment context</span><b id="demoDeployment">Floating / moored</b><small id="demoDeploymentBasis">Patent-described deployment geometry.</small></div>
    <div class="readout-block"><span>Source context</span><b id="demoSource">Generic acoustic source</b><small>No platform acoustic signature is modeled.</small></div>
    <div class="readout-block"><span>Source bearing</span><b id="demoBearing">042°</b><small>Clockwise from north, sensor to source.</small></div>
    <div class="readout-block"><span>Incoming X projection</span><b id="demoX">-0.669</b><small>Signed normalized east-axis component.</small></div>
    <div class="readout-block"><span>Incoming Y projection</span><b id="demoY">-0.743</b><small>Signed normalized north-axis component.</small></div>
    <div class="readout-block"><span>2-D vector norm</span><b id="demoNorm">1.000</b><small>sqrt(X² + Y²), geometry check only.</small></div>
    <div class="readout-block"><span>Patent reference</span><b id="demoReference">90 Hz</b><small id="demoReferenceBasis">In-air prototype evaluation.</small></div>`;
}

const stage=q('.mission-stage',mission);
const svg=q('svg',stage);
const targetGroup=$('targetGroup');
let mechanics=q('.mission-mechanics-note',mission);
if(stage&&!mechanics){
  mechanics=document.createElement('div');
  mechanics.className='mission-mechanics-note';
  mechanics.innerHTML='<b>VECTOR MECHANICS</b><span>Dashed geometry points from sensor to source. The solid incoming-wave vector points source → sensor, matching the signs of the normalized X/Y components. Drag the source around the display or use the bearing slider. No amplitude, range or detection-performance model is applied.</span>';
  stage.appendChild(mechanics);
}

const style=document.createElement('style');
style.textContent=`
.mission-mechanics-note{position:absolute;left:18px;right:18px;bottom:16px;z-index:6;display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border:1px solid rgba(169,181,155,.22);background:rgba(5,6,5,.76);backdrop-filter:blur(8px);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.45;color:#9ea79d;pointer-events:none}
.mission-mechanics-note b{color:#e7e9e3;white-space:nowrap;font-size:10px;letter-spacing:.08em}
.mission-mechanics-note span{max-width:820px}
.mission-shell .legend i.incoming{background:#d6ddcf!important;border:0!important;height:2px!important;opacity:.9}
#targetGroup{cursor:grab;touch-action:none}
#targetGroup.is-dragging{cursor:grabbing}
#incomingWaveVector{filter:drop-shadow(0 0 3px rgba(214,221,207,.2))}
@media(max-width:760px){.mission-mechanics-note{position:relative;left:auto;right:auto;bottom:auto;margin:10px 0 0;display:block}.mission-mechanics-note b{display:block;margin-bottom:5px}}
`;
document.head.appendChild(style);

const SVG_NS='http://www.w3.org/2000/svg';
let incomingLine=null;
let incomingLabel=null;
function ensureIncomingVector(){
  if(!svg)return;
  let defs=q('defs',svg);
  if(!defs){
    defs=document.createElementNS(SVG_NS,'defs');
    svg.insertBefore(defs,svg.firstChild);
  }
  if(!$('incomingWaveArrowhead')){
    const marker=document.createElementNS(SVG_NS,'marker');
    marker.id='incomingWaveArrowhead';
    marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','8.5');
    marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','7');
    marker.setAttribute('markerHeight','7');
    marker.setAttribute('orient','auto-start-reverse');
    const path=document.createElementNS(SVG_NS,'path');
    path.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill','#d6ddcf');
    marker.appendChild(path);
    defs.appendChild(marker);
  }
  incomingLine=$('incomingWaveVector');
  if(!incomingLine){
    incomingLine=document.createElementNS(SVG_NS,'line');
    incomingLine.id='incomingWaveVector';
    incomingLine.setAttribute('stroke','#d6ddcf');
    incomingLine.setAttribute('stroke-width','2');
    incomingLine.setAttribute('opacity','.92');
    incomingLine.setAttribute('marker-end','url(#incomingWaveArrowhead)');
    incomingLine.setAttribute('pointer-events','none');
    const sensor=$('sensorRoot');
    svg.insertBefore(incomingLine,sensor||null);
  }
  incomingLabel=$('incomingWaveLabel');
  if(!incomingLabel){
    incomingLabel=document.createElementNS(SVG_NS,'text');
    incomingLabel.id='incomingWaveLabel';
    incomingLabel.setAttribute('fill','#d6ddcf');
    incomingLabel.setAttribute('font-family','monospace');
    incomingLabel.setAttribute('font-size','9');
    incomingLabel.setAttribute('letter-spacing','.06em');
    incomingLabel.setAttribute('text-anchor','middle');
    incomingLabel.setAttribute('pointer-events','none');
    incomingLabel.textContent='INCOMING WAVE VECTOR';
    const sensor=$('sensorRoot');
    svg.insertBefore(incomingLabel,sensor||null);
  }
}

function signed(v){return (v>=0?'+':'')+v.toFixed(3);}
function referenceValue(){const v=Math.round(+(freq?.value||90));return refBasis[v]?v:90;}
function geometry(){
  const degrees=+(bearing?.value||0);
  const beta=degrees*Math.PI/180;
  const spacing=Math.max(0,Math.min(.98,+(range?.value||VISUAL_SPACING)/8.5));
  const cx=400,cy=300,rad=245,rr=Math.max(70,spacing*rad);
  const tx=cx+rr*Math.sin(beta),ty=cy-rr*Math.cos(beta);
  return {degrees,beta,cx,cy,tx,ty};
}
function updateBars(x,y){
  const sx=$('sensorXbar'),sy=$('sensorYbar');
  if(sx){const w=75*Math.abs(x);sx.setAttribute('width',String(w));sx.setAttribute('x',x>=0?'400':String(400-w));}
  if(sy){const h=75*Math.abs(y);sy.setAttribute('height',String(h));sy.setAttribute('y',y>=0?String(300-h):'300');}
}
function updateIncomingVector(g){
  ensureIncomingVector();
  if(!incomingLine||!incomingLabel)return;
  const dx=g.cx-g.tx,dy=g.cy-g.ty,dist=Math.hypot(dx,dy)||1;
  const ux=dx/dist,uy=dy/dist;
  const startPad=24,endPad=38;
  const x1=g.tx+ux*startPad,y1=g.ty+uy*startPad;
  const x2=g.cx-ux*endPad,y2=g.cy-uy*endPad;
  incomingLine.setAttribute('x1',x1.toFixed(2));
  incomingLine.setAttribute('y1',y1.toFixed(2));
  incomingLine.setAttribute('x2',x2.toFixed(2));
  incomingLine.setAttribute('y2',y2.toFixed(2));
  const mx=(x1+x2)/2,my=(y1+y2)/2;
  const px=-uy,py=ux;
  incomingLabel.setAttribute('x',(mx+px*13).toFixed(2));
  incomingLabel.setAttribute('y',(my+py*13).toFixed(2));
}
function update(){
  const g=geometry();
  // Bearing is sensor -> source. Plane-wave propagation at the sensor is source -> sensor.
  const x=-Math.sin(g.beta);
  const y=-Math.cos(g.beta);
  const norm=Math.hypot(x,y);
  const mode=resolveDeployment();
  const basis=deploymentBasis[mode]||deploymentBasis.floating;
  const ref=referenceValue();
  if($('demoDeployment'))$('demoDeployment').textContent=basis[0];
  if($('demoDeploymentBasis'))$('demoDeploymentBasis').textContent=basis[1];
  if($('demoSource'))$('demoSource').textContent=sourceNames[target?.value||'source']||sourceNames.source;
  if($('demoBearing'))$('demoBearing').textContent=String(Math.round(g.degrees)).padStart(3,'0')+'°';
  if($('demoX'))$('demoX').textContent=signed(x);
  if($('demoY'))$('demoY').textContent=signed(y);
  if($('demoNorm'))$('demoNorm').textContent=norm.toFixed(3);
  if($('demoReference'))$('demoReference').textContent=ref+' Hz';
  if($('demoReferenceBasis'))$('demoReferenceBasis').textContent=refBasis[ref];
  updateBars(x,y);
  updateIncomingVector(g);
  setDeployment(mode);
}

function pointInSvg(event){
  if(!svg)return null;
  const matrix=svg.getScreenCTM();
  if(!matrix)return null;
  const p=svg.createSVGPoint();
  p.x=event.clientX;
  p.y=event.clientY;
  return p.matrixTransform(matrix.inverse());
}
function setBearingFromPointer(event){
  if(!bearing)return;
  const p=pointInSvg(event);
  if(!p)return;
  const dx=p.x-400,dy=p.y-300;
  if(Math.hypot(dx,dy)<34)return;
  const degrees=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;
  bearing.value=String(Math.round(degrees)%360);
  bearing.dispatchEvent(new Event('input',{bubbles:true}));
}

let dragPointer=null;
if(targetGroup&&svg&&bearing){
  targetGroup.setAttribute('tabindex','0');
  targetGroup.setAttribute('aria-label','Draggable acoustic source. Drag around the vector sensor to change source bearing.');
  let hit=q('.source-drag-hit',targetGroup);
  if(!hit){
    hit=document.createElementNS(SVG_NS,'circle');
    hit.setAttribute('class','source-drag-hit');
    hit.setAttribute('r','36');
    hit.setAttribute('fill','transparent');
    hit.setAttribute('stroke','none');
    hit.setAttribute('pointer-events','all');
    targetGroup.insertBefore(hit,targetGroup.firstChild);
  }
  targetGroup.addEventListener('pointerdown',event=>{
    if(event.button!==undefined&&event.button!==0)return;
    event.preventDefault();
    dragPointer=event.pointerId;
    targetGroup.classList.add('is-dragging');
    targetGroup.setPointerCapture?.(event.pointerId);
    setBearingFromPointer(event);
  });
  targetGroup.addEventListener('pointermove',event=>{
    if(dragPointer!==event.pointerId)return;
    event.preventDefault();
    setBearingFromPointer(event);
  });
  const endDrag=event=>{
    if(dragPointer!==event.pointerId)return;
    targetGroup.releasePointerCapture?.(event.pointerId);
    dragPointer=null;
    targetGroup.classList.remove('is-dragging');
  };
  targetGroup.addEventListener('pointerup',endDrag);
  targetGroup.addEventListener('pointercancel',endDrag);
}

// Preset buttons are deployment presets, not target-class claims. Keep their
// default source generic; users can separately select a surface or submerged
// vessel as contextual media after choosing an architecture.
qa('.patent-demo-presets button',mission).forEach(btn=>btn.addEventListener('click',()=>queueMicrotask(()=>{
  if(target&&target.value!=='source'){
    target.value='source';
    target.dispatchEvent(new Event('change',{bubbles:true}));
  }
  update();
})));
[target,config,bearing,range,freq].forEach(el=>{if(!el)return;el.addEventListener('input',()=>queueMicrotask(update));el.addEventListener('change',()=>queueMicrotask(update));});

// If a user manually selects an architecture that no longer matches the active
// preset, clear that preset so the UI does not imply a deployment combination
// the user has overridden.
config?.addEventListener('change',()=>{
  const active=q('.patent-demo-presets button.active',mission);if(!active)return;
  const expected={floating:'floating',hull:'platform',sonobuoy:'tower',towed:'tower'}[active.dataset.preset];
  if(expected&&config.value!==expected)active.classList.remove('active');
});

const reset=$('resetMission');
reset?.addEventListener('click',()=>queueMicrotask(()=>{
  if(!range)return;
  range.value=String(VISUAL_SPACING);
  range.dispatchEvent(new Event('input',{bubbles:true}));
}));

const legend=q('.legend',mission);
if(legend){
  legend.innerHTML='<div><i></i> ILLUSTRATIVE ACOUSTIC WAVEFRONT</div><div><i class="dashed"></i> GEOMETRIC BEARING TO SOURCE</div><div><i class="incoming"></i> INCOMING WAVE VECTOR (SOURCE → SENSOR)</div>';
}

update();
window.RHKEARTH_DEMO={update,resolveDeployment,setBearingFromPointer};
})();
