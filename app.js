(()=>{'use strict';
const $=id=>document.getElementById(id);

// Applications bootstrap. The loaded presentation is illustrative context, not a
// performance model.
const marketSection=document.getElementById('market');
if(marketSection&&!document.body.dataset.rhkApplicationsAppBootstrap){
  document.body.dataset.rhkApplicationsAppBootstrap='1';
  import('./market-bridge-v4.js?v=10').catch(err=>{
    console.warn('RHKEARTH Applications visualization fallback:',err);
    if(!marketSection.querySelector('.market-motion')){
      const fallback=document.createElement('section');fallback.className='market-motion market-motion-fallback';fallback.innerHTML='<div style="margin:28px 0 42px;padding:32px;border:1px solid rgba(170,180,168,.18);color:#8e978e;font:11px/1.7 ui-monospace,monospace">MARITIME OPERATING PICTURE UNAVAILABLE IN THIS BROWSER SESSION</div>';marketSection.querySelector('.section-head')?.insertAdjacentElement('afterend',fallback);
    }
  });
}

// Navigation / technology tabs.
const tabs=document.querySelectorAll('.tab'),views=document.querySelectorAll('.view');
tabs.forEach(btn=>btn.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));views.forEach(x=>x.classList.remove('active'));btn.classList.add('active');$(btn.dataset.view)?.classList.add('active');}));

// Patent-described analytical signed cosine relation. This is normalized
// directivity, not a calibrated sensitivity calculation.
const angle=$('angle');
function updatePatentDirectivity(){const a=+(angle?.value||0),r=Math.cos(a*Math.PI/180);if($('angleText'))$('angleText').textContent=Math.round(a);if($('deflectionOut'))$('deflectionOut').textContent=(r>=0?'+':'')+r.toFixed(3);if($('directionSvg'))$('directionSvg').textContent='R/Rmax = cos θ = '+(r>=0?'+':'')+r.toFixed(3);}
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
const signalSteps=document.querySelectorAll('#architecture .signal-step'),chain=['Low-frequency acoustic field','Particle motion / relative flow','Micro-mesh or channel flow response','Displacement / flow-sensor readout','Directional vector information'];signalSteps.forEach((el,i)=>{if(chain[i])el.textContent=chain[i];});

// Patent-described application contexts only.
const patentContexts=[
  ['Acoustic source localization','Particle-velocity orientation can provide wave-vector / DOA information and assist source localization.','US11287508B2'],
  ['Submarine / AUV hull mounting','The specification explicitly describes mounting on a submarine or AUV hull.','US11287508B2'],
  ['Shallow-water mooring','The specification describes mooring in shallow water close to an air/water boundary.','US11287508B2'],
  ['Sonobuoy component','A positively buoyant AVS tower is expressly described as a component of a sonobuoy.','US11408961B2'],
  ['Towed-array application','Applications for neutrally buoyant AVS embodiments expressly include towed arrays; website tow geometry is schematic context.','US11408961B2'],
  ['DC / slowly varying flow','The mesh-type transducer is described for DC and slowly varying viscous-flow sensing.','US11287508B2'],
  ['Multi-sensor aggregation','A central controller may aggregate data from multiple floating-base vector sensors.','US11287508B2'],
  ['Surfacing + telemetry','An embodiment may detach, float to the surface, and transmit stored information.','US11408961B2']
];
const opportunityList=$('opportunityList');if(opportunityList){opportunityList.innerHTML='';patentContexts.forEach(c=>{const row=document.createElement('div');row.className='op';row.innerHTML='<div class="name">'+c[0]+'</div><div class="why">'+c[1]+'</div><div class="buyer">'+c[2]+'</div>';opportunityList.appendChild(row);});}

// Direction concept demonstrator. Numerical geometry depends only on source
// bearing. Source radius is a fixed drawing radius with no physical distance.
const M={target:$('targetType'),config:$('sensorConfig'),bearing:$('missionBearing')};
const DISPLAY_RADIUS=173;
let running=true,phase=0,last=performance.now();
['missionSource','missionNoise','missionFreq'].forEach(id=>$(id)?.closest('.control-group')?.remove());
const range=$('missionRange');if(range){range.value='6';range.tabIndex=-1;const g=range.closest('.control-group');if(g){g.style.display='none';g.setAttribute('aria-hidden','true');}}

const missionReadout=document.querySelector('.mission-readout');if(missionReadout){missionReadout.innerHTML=`
  <div class="readout-block"><span>Concept boundary</span><b>Geometry only</b><small>No detection-performance model.</small></div>
  <div class="readout-block"><span>Source bearing</span><b id="fallbackBearing">000°</b><small>Sensor → source, clockwise from north.</small></div>
  <div class="readout-block"><span>Incoming east component</span><b id="fallbackX">0.000</b><small>Signed normalized propagation-direction component.</small></div>
  <div class="readout-block"><span>Incoming north component</span><b id="fallbackY">−1.000</b><small>Signed normalized propagation-direction component.</small></div>
  <div class="readout-block"><span>Direction norm</span><b id="fallbackNorm">1.000</b><small>√(E² + N²), a geometry identity.</small></div>
  <div class="readout-block"><span>Direction convention</span><b>k̂ points source → sensor</b><small>Opposite the geometric sensor → source bearing.</small></div>`;}

function targetLabel(v){return v==='surface'?'Surface vessel context':v==='submarine'?'Submerged vessel context':'Generic acoustic source';}
function updateTargetGraphic(type){if($('surfaceTarget'))$('surfaceTarget').style.display=type==='surface'?'block':'none';if($('subTarget'))$('subTarget').style.display=type==='submarine'?'block':'none';if($('sourceTarget'))$('sourceTarget').style.display=type==='source'?'block':'none';}
function updateSensorGraphic(config){['floatingSensor','towerSensor','platformSensor'].forEach(id=>{if($(id))$(id).style.display='none';});const map={floating:'floatingSensor',tower:'towerSensor',platform:'platformSensor'};if($(map[config]))$(map[config]).style.display='block';}
function signed(v){if(Math.abs(v)<5e-4)v=0;return(v<0?'−':'+')+Math.abs(v).toFixed(3);}
function drawMission(){
  if(!M.bearing)return;
  const bearing=+M.bearing.value,cx=400,cy=300,ang=bearing*Math.PI/180,tx=cx+DISPLAY_RADIUS*Math.sin(ang),ty=cy-DISPLAY_RADIUS*Math.cos(ang),target=$('targetGroup');if(target)target.setAttribute('transform','translate('+tx+' '+ty+') rotate('+bearing+')');
  const line=$('trueBearingLine');if(line){line.setAttribute('x1',cx);line.setAttribute('y1',cy);line.setAttribute('x2',tx);line.setAttribute('y2',ty);}if($('northBearing'))$('northBearing').textContent=String(Math.round(bearing)).padStart(3,'0')+'°';
  if($('stageRangeLabel'))$('stageRangeLabel').textContent='';if($('stageTargetLabel')){$('stageTargetLabel').setAttribute('x',tx+16);$('stageTargetLabel').setAttribute('y',ty+3);$('stageTargetLabel').textContent=targetLabel(M.target?.value||'source').toUpperCase();}
  document.querySelectorAll('.wave-ring').forEach(r=>{r.setAttribute('cx',tx);r.setAttribute('cy',ty);});
  const east=-Math.sin(ang),north=-Math.cos(ang);if($('fallbackBearing'))$('fallbackBearing').textContent=String(Math.round(bearing)).padStart(3,'0')+'°';if($('fallbackX'))$('fallbackX').textContent=signed(east);if($('fallbackY'))$('fallbackY').textContent=signed(north);if($('fallbackNorm'))$('fallbackNorm').textContent=Math.hypot(east,north).toFixed(3);
}
function updateMission(){const b=+(M.bearing?.value||0);if($('missionBearingText'))$('missionBearingText').textContent=Math.round(b)+'°';updateTargetGraphic(M.target?.value||'source');updateSensorGraphic(M.config?.value||'floating');drawMission();}
Object.values(M).forEach(el=>{if(!el)return;el.addEventListener('input',updateMission);el.addEventListener('change',updateMission);});

// Legacy scenario buttons alter illustration context only; never geometry values.
const scenarioContext={surface:{target:'surface',config:'floating'},submerged:{target:'submarine',config:'floating'},monitor:{target:'source',config:'floating'}};
document.querySelectorAll('.scenario-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.scenario-btn').forEach(b=>b.classList.toggle('active',b===btn));const p=scenarioContext[btn.dataset.scenario||'monitor'];if(!p)return;if(M.target){M.target.value=p.target;M.target.dispatchEvent(new Event('change',{bubbles:true}));}if(M.config){M.config.value=p.config;M.config.dispatchEvent(new Event('change',{bubbles:true}));}}));

function animate(now){const dt=(now-last)/1000;last=now;if(running)phase=(phase+dt*.28)%1;document.querySelectorAll('.wave-ring').forEach((ring,i)=>{const q=(phase+i/4)%1;ring.setAttribute('r',String(18+96*q));ring.setAttribute('opacity',String(.34*(1-q)));});requestAnimationFrame(animate);}
const runBtn=$('runMission');if(runBtn)runBtn.addEventListener('click',()=>{running=!running;runBtn.textContent=running?'Pause animation':'Resume animation';});
const resetBtn=$('resetMission');if(resetBtn)resetBtn.addEventListener('click',()=>{if(M.target){M.target.value='source';M.target.dispatchEvent(new Event('change',{bubbles:true}));}if(M.config){M.config.value='floating';M.config.dispatchEvent(new Event('change',{bubbles:true}));}if(M.bearing){M.bearing.value='315';M.bearing.dispatchEvent(new Event('input',{bubbles:true}));}});
if($('bearingCone'))$('bearingCone').style.display='none';if($('scanLine'))$('scanLine').style.display='none';document.querySelectorAll('.mission-stage svg text').forEach(t=>{if(/KM/i.test(t.textContent||''))t.style.display='none';});const legend=document.querySelector('.mission-shell .legend');if(legend)legend.innerHTML='<div><i></i> ILLUSTRATIVE ACOUSTIC WAVEFRONT</div><div><i class="dashed"></i> SENSOR → SOURCE BEARING</div>';
updateMission();requestAnimationFrame(animate);
})();
