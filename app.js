(()=>{'use strict';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// ---------------------------------------------------------------------------
// Navigation / technology tabs
// ---------------------------------------------------------------------------
const tabs=document.querySelectorAll('.tab');
const views=document.querySelectorAll('.view');
tabs.forEach(btn=>btn.addEventListener('click',()=>{
  tabs.forEach(x=>x.classList.remove('active'));
  views.forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  $(btn.dataset.view)?.classList.add('active');
}));

// ---------------------------------------------------------------------------
// Patent-described directional relationship only.
// US11287508B2 states that out-of-plane mesh displacement is expected to give
// a natural cos(theta) directivity relative to the mesh normal. This is a
// normalized geometry display, not a calibrated sensitivity model.
// ---------------------------------------------------------------------------
const angle=$('angle');
function updatePatentDirectivity(){
  const a=+(angle?.value||0);
  const pct=Math.abs(Math.cos(a*Math.PI/180))*100;
  if($('angleText'))$('angleText').textContent=Math.round(a);
  if($('deflectionOut'))$('deflectionOut').textContent=pct.toFixed(0)+'%';
  if($('directionSvg'))$('directionSvg').textContent='NORMALIZED |cos θ| ≈ '+pct.toFixed(0)+'%';
}
angle?.addEventListener('input',updatePatentDirectivity);
updatePatentDirectivity();

// ---------------------------------------------------------------------------
// Patent architecture switcher. Copy below is limited to embodiments actually
// described in US11287508B2 / US11408961B2.
// ---------------------------------------------------------------------------
const modes={
  base:[
    'Floating-base embodiment',
    'US11287508B2 describes a floating base carrying one or more flow meters, coupled by a retaining thread to an anchor. The base is suspended in water and free to move in directions of interest.'
  ],
  tower:[
    'Viscous-channel tower embodiment',
    'US11408961B2 describes a tower with multiple flow channels containing viscous liquid, flow sensors inside channel cavities, channels with different orientations, and tethered / recoverable embodiments.'
  ],
  hull:[
    'Hull / AUV mounting described in specification',
    'US11287508B2 states that implementations can mount the vector sensor on the hull of a vessel such as a submarine or AUV, or moor the sensor in shallow water near an air/water boundary.'
  ]
};
const modeButtons=document.querySelectorAll('.mode');
function setMode(mode){
  modeButtons.forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  ['base','tower','hull'].forEach(name=>{const el=$(name+'Diagram');if(el)el.style.display=name===mode?'block':'none';});
  if($('modeTitle'))$('modeTitle').textContent=modes[mode][0];
  if($('modeDescription'))$('modeDescription').textContent=modes[mode][1];
}
modeButtons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
setMode('base');

// ---------------------------------------------------------------------------
// Applications fallback. These are patent-described contexts, not ranked market
// opportunities. patent-strict.js refines the presentation when available.
// ---------------------------------------------------------------------------
const patentContexts=[
  ['Acoustic source localization','The patent describes using particle-velocity orientation for wave-vector / DOA information and assisting localization of a sound source.','US11287508B2'],
  ['Submarine / AUV hull mounting','The specification explicitly describes mounting on a vessel hull such as a submarine or AUV.','US11287508B2'],
  ['Shallow-water mooring','The specification describes mooring in shallow water close to an air/water boundary.','US11287508B2'],
  ['Sonobuoy component','A positively buoyant AVS tower is expressly described as a component of a sonobuoy.','US11408961B2'],
  ['Towed array','Applications for neutrally buoyant AVS embodiments expressly include towed arrays.','US11408961B2'],
  ['DC / slowly varying flow','The mesh-type transducer is described for DC flow measurement and slowly varying viscous flow.','US11287508B2'],
  ['Multi-sensor aggregation','A central controller may aggregate data from multiple floating-base vector sensors.','US11287508B2'],
  ['Surface recovery + telemetry','The tower may detach, float to the surface, and transmit information stored in memory.','US11408961B2']
];
const opportunityList=$('opportunityList');
if(opportunityList){
  opportunityList.innerHTML='';
  patentContexts.forEach(c=>{
    const row=document.createElement('div');row.className='op';
    row.innerHTML='<div class="name">'+c[0]+'</div><div class="why">'+c[1]+'</div><div class="buyer">'+c[2]+'</div>';
    opportunityList.appendChild(row);
  });
}

// ---------------------------------------------------------------------------
// Mission concept demonstrator.
// Controls change source geometry and patent-described architecture only.
// There is no sonar equation, SNR, detection range, bearing-error model,
// platform signature, source-level model or sensitivity prediction.
// ---------------------------------------------------------------------------
const M={
  target:$('targetType'),
  config:$('sensorConfig'),
  range:$('missionRange'),
  bearing:$('missionBearing'),
  freq:$('missionFreq')
};
let running=true,phase=0,last=performance.now();

// Old prototype source-level and noise controls are intentionally disabled even
// if the higher-level patent presentation scripts fail to load.
const fallbackStyle=document.createElement('style');
fallbackStyle.textContent='.rhke-perf-control-hidden{display:none!important}';
document.head.appendChild(fallbackStyle);
['missionSource','missionNoise'].forEach(id=>$(id)?.closest('.control-group')?.classList.add('rhke-perf-control-hidden'));

const missionReadout=document.querySelector('.mission-readout');
if(missionReadout){
  missionReadout.innerHTML=`
    <div class="readout-block"><span>Concept boundary</span><b>Geometry only</b><small>No range, SNR or platform-signature model.</small></div>
    <div class="readout-block"><span>Source bearing</span><b id="fallbackBearing">000°</b><small>Sensor to source, clockwise from north.</small></div>
    <div class="readout-block"><span>Incoming X projection</span><b id="fallbackX">0.000</b><small>Signed normalized east-axis component.</small></div>
    <div class="readout-block"><span>Incoming Y projection</span><b id="fallbackY">-1.000</b><small>Signed normalized north-axis component.</small></div>
    <div class="readout-block"><span>2-D vector norm</span><b id="fallbackNorm">1.000</b><small>Geometry check only.</small></div>
    <div class="readout-block"><span>Direction convention</span><b>Propagation is opposite source bearing</b><small>Incoming wave / particle-motion vector points source to sensor.</small></div>`;
}

function targetLabel(v){return v==='surface'?'Surface vessel context':v==='submarine'?'Submerged vessel context':'Generic acoustic source';}
function updateTargetGraphic(type){
  if($('surfaceTarget'))$('surfaceTarget').style.display=type==='surface'?'block':'none';
  if($('subTarget'))$('subTarget').style.display=type==='submarine'?'block':'none';
  if($('sourceTarget'))$('sourceTarget').style.display=type==='source'?'block':'none';
}
function updateSensorGraphic(config){
  ['floatingSensor','towerSensor','platformSensor'].forEach(id=>{if($(id))$(id).style.display='none';});
  const map={floating:'floatingSensor',tower:'towerSensor',platform:'platformSensor'};
  if($(map[config]))$(map[config]).style.display='block';
}
function drawMission(){
  if(!M.bearing||!M.range)return;
  const bearing=+M.bearing.value;
  const spacing=clamp(+M.range.value/8.5,0,.98);
  const cx=400,cy=300,rad=245,rr=Math.max(70,spacing*rad);
  const ang=bearing*Math.PI/180;
  const tx=cx+rr*Math.sin(ang),ty=cy-rr*Math.cos(ang);
  const target=$('targetGroup');if(target)target.setAttribute('transform','translate('+tx+' '+ty+') rotate('+bearing+')');
  const line=$('trueBearingLine');if(line){line.setAttribute('x1',cx);line.setAttribute('y1',cy);line.setAttribute('x2',tx);line.setAttribute('y2',ty);}
  if($('northBearing'))$('northBearing').textContent=('000'+Math.round(bearing)).slice(-3)+'°';
  if($('stageRangeLabel'))$('stageRangeLabel').textContent='';
  if($('stageTargetLabel')){$('stageTargetLabel').setAttribute('x',tx+16);$('stageTargetLabel').setAttribute('y',ty+3);$('stageTargetLabel').textContent=targetLabel(M.target?.value||'source').toUpperCase();}
  document.querySelectorAll('.wave-ring').forEach(r=>{r.setAttribute('cx',tx);r.setAttribute('cy',ty);});

  // Bearing is sensor -> source. Incoming propagation / particle motion is the
  // opposite direction, source -> sensor. Bars show the incoming vector.
  const xComp=-Math.sin(ang),yComp=-Math.cos(ang);
  const sx=$('sensorXbar'),sy=$('sensorYbar');
  if(sx){const w=75*Math.abs(xComp);sx.setAttribute('width',String(w));sx.setAttribute('x',xComp>=0?'400':String(400-w));}
  if(sy){const h=75*Math.abs(yComp);sy.setAttribute('height',String(h));sy.setAttribute('y',yComp>=0?String(300-h):'300');}
  if($('fallbackBearing'))$('fallbackBearing').textContent=String(Math.round(bearing)).padStart(3,'0')+'°';
  if($('fallbackX'))$('fallbackX').textContent=(xComp>=0?'+':'')+xComp.toFixed(3);
  if($('fallbackY'))$('fallbackY').textContent=(yComp>=0?'+':'')+yComp.toFixed(3);
  if($('fallbackNorm'))$('fallbackNorm').textContent=Math.hypot(xComp,yComp).toFixed(3);
}
function updateMission(){
  const f=+(M.freq?.value||90),b=+(M.bearing?.value||0),r=+(M.range?.value||3.2);
  if($('missionFreqText'))$('missionFreqText').textContent=f+' Hz';
  if($('missionBearingText'))$('missionBearingText').textContent=Math.round(b)+'°';
  if($('missionRangeText'))$('missionRangeText').textContent=r<3?'Near':r<6?'Mid':'Far';
  if($('targetLabel'))$('targetLabel').textContent=targetLabel(M.target?.value||'source');
  updateTargetGraphic(M.target?.value||'source');
  updateSensorGraphic(M.config?.value||'floating');
  drawMission();
}
Object.values(M).forEach(el=>{if(!el)return;el.addEventListener('input',updateMission);el.addEventListener('change',updateMission);});

// Make the original scenario buttons functional as a safe fallback. The patent
// presentation layer replaces these with disclosed deployment presets.
const scenarioMap={
  surface:{target:'surface',config:'floating',bearing:62,range:3.2},
  submerged:{target:'submarine',config:'floating',bearing:218,range:4.6},
  monitor:{target:'source',config:'floating',bearing:42,range:3.0}
};
document.querySelectorAll('.scenario-btn').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.scenario-btn').forEach(b=>b.classList.toggle('active',b===btn));
  const key=btn.dataset.scenario||(/surface/i.test(btn.textContent)?'surface':/submerged/i.test(btn.textContent)?'submerged':'monitor');
  const p=scenarioMap[key];if(!p)return;
  if(M.target){M.target.value=p.target;M.target.dispatchEvent(new Event('change',{bubbles:true}));}
  if(M.config){M.config.value=p.config;M.config.dispatchEvent(new Event('change',{bubbles:true}));}
  if(M.bearing){M.bearing.value=String(p.bearing);M.bearing.dispatchEvent(new Event('input',{bubbles:true}));}
  if(M.range){M.range.value=String(p.range);M.range.dispatchEvent(new Event('input',{bubbles:true}));}
}));

function animate(now){
  const dt=(now-last)/1000;last=now;
  if(running)phase=(phase+dt*.28)%1;
  document.querySelectorAll('.wave-ring').forEach((ring,i)=>{const q=(phase+i/4)%1;ring.setAttribute('r',String(18+96*q));ring.setAttribute('opacity',String(.34*(1-q)));});
  requestAnimationFrame(animate);
}
const runBtn=$('runMission');if(runBtn)runBtn.addEventListener('click',()=>{running=!running;runBtn.textContent=running?'Pause animation':'Resume animation';});
const resetBtn=$('resetMission');if(resetBtn)resetBtn.addEventListener('click',()=>{if(M.target){M.target.value='source';M.target.dispatchEvent(new Event('change',{bubbles:true}));}if(M.config){M.config.value='floating';M.config.dispatchEvent(new Event('change',{bubbles:true}));}if(M.bearing){M.bearing.value='42';M.bearing.dispatchEvent(new Event('input',{bubbles:true}));}if(M.range){M.range.value='3';M.range.dispatchEvent(new Event('input',{bubbles:true}));}if(M.freq){M.freq.value='90';M.freq.dispatchEvent(new Event('input',{bubbles:true}));}});

// Remove performance-looking elements in the base layer as a fail-safe.
if($('bearingCone'))$('bearingCone').style.display='none';
if($('scanLine'))$('scanLine').style.display='none';
document.querySelectorAll('.mission-stage svg text').forEach(t=>{if(/KM/i.test(t.textContent||''))t.style.display='none';});
const legend=document.querySelector('.mission-shell .legend');if(legend)legend.innerHTML='<div><i></i> ILLUSTRATIVE ACOUSTIC WAVEFRONT</div><div><i class="dashed"></i> SOURCE-BEARING GEOMETRY</div>';
updateMission();requestAnimationFrame(animate);
})();