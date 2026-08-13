(()=>{'use strict';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// Navigation / technology tabs.
const tabs=document.querySelectorAll('.tab'),views=document.querySelectorAll('.view');
tabs.forEach(btn=>btn.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));views.forEach(x=>x.classList.remove('active'));btn.classList.add('active');$(btn.dataset.view)?.classList.add('active');}));

// Patent-described signed cosine directivity. This is a normalized directional
// relation, never a calibrated sensitivity calculation.
const angle=$('angle');
function updatePatentDirectivity(){
  const a=+(angle?.value||0),r=Math.cos(a*Math.PI/180);
  if($('angleText'))$('angleText').textContent=Math.round(a);
  if($('deflectionOut'))$('deflectionOut').textContent=(r>=0?'+':'')+r.toFixed(3);
  if($('directionSvg'))$('directionSvg').textContent='R/Rmax = cos θ = '+(r>=0?'+':'')+r.toFixed(3);
}
if(angle){angle.min='0';angle.max='180';angle.step='1';angle.addEventListener('input',updatePatentDirectivity);}updatePatentDirectivity();

// Patent architecture switcher.
const modes={
  base:['Floating-base embodiment','US11287508B2 describes a floating base carrying one or more flow meters, coupled by a retaining thread to an anchor. The base is suspended in water and free to move in directions of interest.'],
  tower:['Tower-with-channels embodiment','US11408961B2 describes a tower with multiple viscous-liquid flow channels, flow sensors in channel cavities, and channels that may have different orientations.'],
  hull:['Hull / AUV mounting described in specification','US11287508B2 states that implementations can mount the vector sensor on a submarine or AUV hull, or moor it in shallow water near an air/water boundary.']
};
const modeButtons=document.querySelectorAll('.mode');
function setMode(mode){modeButtons.forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));['base','tower','hull'].forEach(name=>{const el=$(name+'Diagram');if(el)el.style.display=name===mode?'block':'none';});if($('modeTitle'))$('modeTitle').textContent=modes[mode][0];if($('modeDescription'))$('modeDescription').textContent=modes[mode][1];}
modeButtons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));setMode('base');

// Replace architecture chain wording that could imply an unvalidated intensity
// product. The patent supports directional sensing; product-level performance is unknown.
const signalSteps=document.querySelectorAll('#architecture .signal-step');
const chain=['Low-frequency acoustic field','Particle motion / relative flow','Micro-mesh or channel flow response','Displacement / flow-sensor readout','Directional vector information'];
signalSteps.forEach((el,i)=>{if(chain[i])el.textContent=chain[i];});

// Patent-described application contexts only.
const patentContexts=[
  ['Acoustic source localization','Particle-velocity orientation can provide wave-vector / DOA information and assist source localization.','US11287508B2'],
  ['Submarine / AUV hull mounting','The specification explicitly describes mounting on a submarine or AUV hull.','US11287508B2'],
  ['Shallow-water mooring','The specification describes mooring in shallow water close to an air/water boundary.','US11287508B2'],
  ['Sonobuoy component','A positively buoyant AVS tower is expressly described as a component of a sonobuoy.','US11408961B2'],
  ['Towed array','Applications for neutrally buoyant AVS embodiments expressly include towed arrays.','US11408961B2'],
  ['DC / slowly varying flow','The mesh-type transducer is described for DC and slowly varying viscous-flow sensing.','US11287508B2'],
  ['Multi-sensor aggregation','A central controller may aggregate data from multiple floating-base vector sensors.','US11287508B2'],
  ['Surface recovery + telemetry','The tower may detach, float to the surface, and transmit stored information.','US11408961B2']
];
const opportunityList=$('opportunityList');if(opportunityList){opportunityList.innerHTML='';patentContexts.forEach(c=>{const row=document.createElement('div');row.className='op';row.innerHTML='<div class="name">'+c[0]+'</div><div class="why">'+c[1]+'</div><div class="buyer">'+c[2]+'</div>';opportunityList.appendChild(row);});}

// Mission concept demonstrator. Geometry only. No source level, ambient noise,
// propagation loss, SNR, range, sensitivity or uncertainty model exists here.
const M={target:$('targetType'),config:$('sensorConfig'),range:$('missionRange'),bearing:$('missionBearing')};
let running=true,phase=0,last=performance.now();
['missionSource','missionNoise','missionFreq'].forEach(id=>$(id)?.closest('.control-group')?.remove());

const missionReadout=document.querySelector('.mission-readout');if(missionReadout){missionReadout.innerHTML=`
  <div class="readout-block"><span>Concept boundary</span><b>Geometry only</b><small>No detection-performance model.</small></div>
  <div class="readout-block"><span>Source bearing</span><b id="fallbackBearing">000°</b><small>Sensor → source, clockwise from north.</small></div>
  <div class="readout-block"><span>Incoming east component</span><b id="fallbackX">0.000</b><small>Signed horizontal unit-vector component.</small></div>
  <div class="readout-block"><span>Incoming north component</span><b id="fallbackY">−1.000</b><small>Signed horizontal unit-vector component.</small></div>
  <div class="readout-block"><span>Horizontal vector norm</span><b id="fallbackNorm">1.000</b><small>√(E² + N²), geometry identity.</small></div>
  <div class="readout-block"><span>Direction convention</span><b>k̂ points source → sensor</b><small>Opposite the displayed geometric bearing to the source.</small></div>`;}

function targetLabel(v){return v==='surface'?'Surface vessel context':v==='submarine'?'Submerged vessel context':'Generic acoustic source';}
function updateTargetGraphic(type){if($('surfaceTarget'))$('surfaceTarget').style.display=type==='surface'?'block':'none';if($('subTarget'))$('subTarget').style.display=type==='submarine'?'block':'none';if($('sourceTarget'))$('sourceTarget').style.display=type==='source'?'block':'none';}
function updateSensorGraphic(config){['floatingSensor','towerSensor','platformSensor'].forEach(id=>{if($(id))$(id).style.display='none';});const map={floating:'floatingSensor',tower:'towerSensor',platform:'platformSensor'};if($(map[config]))$(map[config]).style.display='block';}
function drawMission(){
  if(!M.bearing||!M.range)return;
  const bearing=+M.bearing.value,spacing=clamp(+M.range.value/8.5,0,.98),cx=400,cy=300,rad=245,rr=Math.max(70,spacing*rad),ang=bearing*Math.PI/180;
  const tx=cx+rr*Math.sin(ang),ty=cy-rr*Math.cos(ang),target=$('targetGroup');if(target)target.setAttribute('transform','translate('+tx+' '+ty+') rotate('+bearing+')');
  const line=$('trueBearingLine');if(line){line.setAttribute('x1',cx);line.setAttribute('y1',cy);line.setAttribute('x2',tx);line.setAttribute('y2',ty);}if($('northBearing'))$('northBearing').textContent=String(Math.round(bearing)).padStart(3,'0')+'°';
  if($('stageRangeLabel'))$('stageRangeLabel').textContent='';if($('stageTargetLabel')){$('stageTargetLabel').setAttribute('x',tx+16);$('stageTargetLabel').setAttribute('y',ty+3);$('stageTargetLabel').textContent=targetLabel(M.target?.value||'source').toUpperCase();}
  document.querySelectorAll('.wave-ring').forEach(r=>{r.setAttribute('cx',tx);r.setAttribute('cy',ty);});
  const east=-Math.sin(ang),north=-Math.cos(ang),sx=$('sensorXbar'),sy=$('sensorYbar');if(sx){const w=75*Math.abs(east);sx.setAttribute('width',String(w));sx.setAttribute('x',east>=0?'400':String(400-w));}if(sy){const h=75*Math.abs(north);sy.setAttribute('height',String(h));sy.setAttribute('y',north>=0?String(300-h):'300');}
  if($('fallbackBearing'))$('fallbackBearing').textContent=String(Math.round(bearing)).padStart(3,'0')+'°';if($('fallbackX'))$('fallbackX').textContent=(east>=0?'+':'')+east.toFixed(3);if($('fallbackY'))$('fallbackY').textContent=(north>=0?'+':'')+north.toFixed(3);if($('fallbackNorm'))$('fallbackNorm').textContent=Math.hypot(east,north).toFixed(3);
}
function updateMission(){const b=+(M.bearing?.value||0),r=+(M.range?.value||3.2);if($('missionBearingText'))$('missionBearingText').textContent=Math.round(b)+'°';if($('missionRangeText'))$('missionRangeText').textContent=r<3?'Near':r<6?'Mid':'Far';if($('targetLabel'))$('targetLabel').textContent=targetLabel(M.target?.value||'source');updateTargetGraphic(M.target?.value||'source');updateSensorGraphic(M.config?.value||'floating');drawMission();}
Object.values(M).forEach(el=>{if(!el)return;el.addEventListener('input',updateMission);el.addEventListener('change',updateMission);});

// Legacy scenario buttons alter visual context only; they never choose numeric
// performance or geometry values.
const scenarioContext={surface:{target:'surface',config:'floating'},submerged:{target:'submarine',config:'floating'},monitor:{target:'source',config:'floating'}};
document.querySelectorAll('.scenario-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.scenario-btn').forEach(b=>b.classList.toggle('active',b===btn));const key=btn.dataset.scenario||'monitor',p=scenarioContext[key];if(!p)return;if(M.target){M.target.value=p.target;M.target.dispatchEvent(new Event('change',{bubbles:true}));}if(M.config){M.config.value=p.config;M.config.dispatchEvent(new Event('change',{bubbles:true}));}}));

function animate(now){const dt=(now-last)/1000;last=now;if(running)phase=(phase+dt*.28)%1;document.querySelectorAll('.wave-ring').forEach((ring,i)=>{const q=(phase+i/4)%1;ring.setAttribute('r',String(18+96*q));ring.setAttribute('opacity',String(.34*(1-q)));});requestAnimationFrame(animate);}
const runBtn=$('runMission');if(runBtn)runBtn.addEventListener('click',()=>{running=!running;runBtn.textContent=running?'Pause animation':'Resume animation';});
const resetBtn=$('resetMission');if(resetBtn)resetBtn.addEventListener('click',()=>{if(M.target){M.target.value='source';M.target.dispatchEvent(new Event('change',{bubbles:true}));}if(M.config){M.config.value='floating';M.config.dispatchEvent(new Event('change',{bubbles:true}));}if(M.bearing){M.bearing.value='42';M.bearing.dispatchEvent(new Event('input',{bubbles:true}));}if(M.range){M.range.value='3';M.range.dispatchEvent(new Event('input',{bubbles:true}));}});
if($('bearingCone'))$('bearingCone').style.display='none';if($('scanLine'))$('scanLine').style.display='none';document.querySelectorAll('.mission-stage svg text').forEach(t=>{if(/KM/i.test(t.textContent||''))t.style.display='none';});const legend=document.querySelector('.mission-shell .legend');if(legend)legend.innerHTML='<div><i></i> ILLUSTRATIVE ACOUSTIC WAVEFRONT</div><div><i class="dashed"></i> GEOMETRIC BEARING TO SOURCE</div>';
updateMission();requestAnimationFrame(animate);
})();