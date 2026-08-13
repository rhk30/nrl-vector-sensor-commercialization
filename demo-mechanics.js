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
    <div class="readout-block"><span>Scene separation</span><b id="demoSeparation">Mid</b><small>Normalized display spacing, not detection range.</small></div>
    <div class="readout-block"><span>Patent reference</span><b id="demoReference">90 Hz</b><small id="demoReferenceBasis">In-air prototype evaluation.</small></div>`;
}

// Add a compact mechanics note to the stage. The bearing line points from the
// sensor to the source. The propagation / particle-motion vector points from
// the source toward the sensor, so its signed components have the opposite sign.
const stage=q('.mission-stage',mission);
let mechanics=q('.mission-mechanics-note',mission);
if(stage&&!mechanics){
  mechanics=document.createElement('div');
  mechanics.className='mission-mechanics-note';
  mechanics.innerHTML='<b>VECTOR MECHANICS</b><span>Source-bearing geometry points toward the source. The incoming propagation / particle-motion vector points back toward the sensor. Orthogonal normalized components follow the patent-described cosine relationship. No amplitude or detection-performance model is applied.</span>';
  stage.appendChild(mechanics);
}

// Minimal styling for the mechanics note. Re-use the existing visual system.
const style=document.createElement('style');
style.textContent=`
.mission-mechanics-note{position:absolute;left:18px;right:18px;bottom:16px;z-index:6;display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border:1px solid rgba(169,181,155,.22);background:rgba(5,6,5,.76);backdrop-filter:blur(8px);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.45;color:#9ea79d;pointer-events:none}
.mission-mechanics-note b{color:#e7e9e3;white-space:nowrap;font-size:10px;letter-spacing:.08em}
.mission-mechanics-note span{max-width:760px}
@media(max-width:760px){.mission-mechanics-note{position:relative;left:auto;right:auto;bottom:auto;margin:10px 0 0;display:block}.mission-mechanics-note b{display:block;margin-bottom:5px}}
`;
document.head.appendChild(style);

function signed(v){return (v>=0?'+':'')+v.toFixed(3);}
function separationLabel(){const v=+(range?.value||3.2);return v<3?'Near':v<6?'Mid':'Far';}
function referenceValue(){const v=Math.round(+(freq?.value||90));return refBasis[v]?v:90;}
function updateBars(x,y){
  // Existing 2-D bars now show the incoming propagation vector, not the source-bearing vector.
  const sx=$('sensorXbar'),sy=$('sensorYbar');
  if(sx){const w=75*Math.abs(x);sx.setAttribute('width',String(w));sx.setAttribute('x',x>=0?'400':String(400-w));}
  if(sy){const h=75*Math.abs(y);sy.setAttribute('height',String(h));sy.setAttribute('y',y>=0?String(300-h):'300');}
}
function update(){
  const beta=+(bearing?.value||0)*Math.PI/180;
  // Bearing is sensor -> source. Plane-wave propagation at the sensor is source -> sensor.
  const x=-Math.sin(beta);
  const y=-Math.cos(beta);
  const norm=Math.hypot(x,y);
  const mode=resolveDeployment();
  const basis=deploymentBasis[mode]||deploymentBasis.floating;
  const ref=referenceValue();
  if($('demoDeployment'))$('demoDeployment').textContent=basis[0];
  if($('demoDeploymentBasis'))$('demoDeploymentBasis').textContent=basis[1];
  if($('demoSource'))$('demoSource').textContent=sourceNames[target?.value||'source']||sourceNames.source;
  if($('demoBearing'))$('demoBearing').textContent=String(Math.round(+(bearing?.value||0))).padStart(3,'0')+'°';
  if($('demoX'))$('demoX').textContent=signed(x);
  if($('demoY'))$('demoY').textContent=signed(y);
  if($('demoNorm'))$('demoNorm').textContent=norm.toFixed(3);
  if($('demoSeparation'))$('demoSeparation').textContent=separationLabel();
  if($('demoReference'))$('demoReference').textContent=ref+' Hz';
  if($('demoReferenceBasis'))$('demoReferenceBasis').textContent=refBasis[ref];
  updateBars(x,y);
  setDeployment(mode);
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

update();
window.RHKEARTH_DEMO={update,resolveDeployment};
})();