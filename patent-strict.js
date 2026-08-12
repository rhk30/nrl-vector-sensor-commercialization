(()=>{'use strict';
const $=id=>document.getElementById(id);
const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));

// Remove the public Sources navigation/section from the marketing page. Patent
// links remain inside diligence and in README for provenance.
qa('.toplinks a').forEach(a=>{if(a.getAttribute('href')==='#sources')a.remove();});
const sources=$('sources');if(sources)sources.setAttribute('aria-hidden','true');

// ---------------------------------------------------------------------------
// TECHNOLOGY — visible quantitative content comes only from the patent family.
// ---------------------------------------------------------------------------
const controls=document.querySelector('#physics .controls');
if(controls){
  controls.classList.add('patent-strict-controls');
  const h=controls.querySelector('h3');if(h)h.textContent='Patent-described directivity';
  const helper=controls.querySelector('.helper');if(helper)helper.textContent='US11287508B2 describes a natural cosine-type response relative to the mesh normal. The angle control below visualizes that stated relationship only.';
  qa('.control',controls).forEach(c=>{
    const txt=c.textContent.toLowerCase();
    if(!txt.includes('incidence angle'))c.classList.add('patent-strict-hidden');
  });
}

const readouts=document.querySelector('#physics .readouts');
if(readouts){
  readouts.classList.add('patent-strict-readouts');
  const blocks=qa('.readout',readouts);
  const data=[
    ['Peak responsivity — air','>20 nm/Pa @ 90 Hz','In-air prototype evaluation reported in US11287508B2.'],
    ['Prototype fundamental','530 Hz','Fundamental frequency reported for the first mesh prototype.'],
    ['Estimated MDP — air','≈100 μPa','Patent estimate using an interferometer noise floor of approximately 2 pm/√Hz.'],
    ['Normalized directivity','—','Natural cos θ relationship described in the patent; normalized display, not sensitivity.']
  ];
  blocks.forEach((b,i)=>{
    const span=b.querySelector('span'),val=b.querySelector('b'),small=b.querySelector('small');
    if(!data[i])return;
    if(span)span.textContent=data[i][0];if(val)val.textContent=data[i][1];if(small)small.textContent=data[i][2];
  });
}
function updateDirectivity(){
  const a=+$('angle')?.value||0;
  const out=$('deflectionOut');
  if(out)out.textContent=(Math.abs(Math.cos(a*Math.PI/180))*100).toFixed(0)+'%';
  const angleText=$('angleText');if(angleText)angleText.textContent=Math.round(a);
  const interp=$('modelInterpretation');
  if(interp)interp.textContent='Patent basis: the out-of-plane displacement of the mesh is expected to give a natural cos θ directivity relative to the mesh normal. US11287508B2 also states that three co-located orthogonal mesh transducers can reconstruct the sound-wave vector in three-dimensional space. This display is normalized and does not predict sensitivity or detection range.';
}
$('angle')?.addEventListener('input',()=>queueMicrotask(updateDirectivity));
updateDirectivity();

// Replace generic equations with relationships stated in US11287508B2.
const formulas=qa('#physics .formula');
const formulaData=[
  ['Mesh fiber length','2L² / d','Square L × L mesh with unit size d; patent-stated total fiber-length relationship.'],
  ['Directional response','cos θ','Natural directivity relative to the mesh normal described in the patent.'],
  ['Fiber-length gain','2L / d','Patent-stated increase versus a single cantilever of length L.']
];
formulas.forEach((f,i)=>{
  if(!formulaData[i])return;
  f.innerHTML='<b>'+formulaData[i][0]+'</b><code>'+formulaData[i][1]+'</code><small>'+formulaData[i][2]+'</small>';
});

// ---------------------------------------------------------------------------
// MISSION — geometry/architecture only; no invented sonar performance chart.
// ---------------------------------------------------------------------------
const mission=document.querySelector('.mission-shell');
if(mission){
  mission.classList.add('patent-concept-mode');
  qa('.control-group',mission).forEach(group=>{
    const t=group.textContent.toLowerCase();
    const keep=t.includes('acoustic source')||t.includes('patent architecture')||t.includes('bearing from sensor');
    if(!keep)group.classList.add('patent-strict-hidden');
  });
  const bearingLabel=$('missionBearing')?.closest('.control-group')?.querySelector('label span');
  if(bearingLabel)bearingLabel.textContent='Illustrative source bearing';
  const title=mission.querySelector('.mission-top h3');if(title)title.textContent='Patent concept demonstrator';
  const desc=mission.querySelector('.mission-top p');if(desc)desc.textContent='Explore source direction and disclosed deployment architectures. Geometry is illustrative; no detection-range or sonar-performance claim is modeled.';

  qa('.mission-stage svg text').forEach(t=>{if(/KM/i.test(t.textContent||''))t.style.display='none';});
  const cone=$('bearingCone');if(cone)cone.style.display='none';
  const scan=$('scanLine');if(scan)scan.style.display='none';
  const rlabel=$('stageRangeLabel');if(rlabel)rlabel.style.display='none';
  const legend=mission.querySelector('.legend');
  if(legend)legend.innerHTML='<div><i></i> ILLUSTRATIVE ACOUSTIC WAVEFRONT</div><div><i class="dashed"></i> SOURCE-BEARING GEOMETRY</div>';

  const readout=mission.querySelector('.mission-readout');
  if(readout)readout.innerHTML=`
    <div class="readout-block"><span>Sensing principle</span><b>Particle-motion DOA</b><small>The patent uses particle-velocity orientation to determine wave-vector direction and direction of arrival.</small></div>
    <div class="readout-block"><span>Floating-base embodiment</span><b>Base + flow meters + thread + anchor</b><small>FIG. 1 discloses one or more flow meters; four are shown.</small></div>
    <div class="readout-block"><span>Mesh directivity</span><b>Natural cos θ</b><small>Expected out-of-plane displacement response relative to the mesh normal.</small></div>
    <div class="readout-block"><span>3-D direction</span><b>3 orthogonal meshes</b><small>Patent states three co-located orthogonal mesh transducers can reconstruct a wave vector in 3-D.</small></div>
    <div class="readout-block"><span>Prototype geometry</span><b>6 mm OD</b><small>≈20 μm released-web beam separation and ≈2.7 m total fiber length are reported.</small></div>
    <div class="readout-block"><span>In-air prototype</span><b>&gt;20 nm/Pa @ 90 Hz</b><small>Peak responsivity reported in the patent's in-air evaluation.</small></div>
    <div class="readout-block"><span>Prototype resonance</span><b>530 Hz</b><small>Fundamental frequency reported for the first mesh prototype.</small></div>
    <div class="readout-block"><span>Water projection</span><b>≈76 dB re 1 μPa/√Hz</b><small>Equivalent MDP projected in US11287508B2; not an in-water validation result.</small></div>
    <div class="readout-block"><span>Tower embodiment</span><b>Multiple viscous-liquid channels</b><small>US11408961B2 discloses channels with different orientations and flow sensors in the cavities.</small></div>
    <div class="readout-block"><span>Recovery embodiment</span><b>Detach → surface → transmit</b><small>The patent discloses stored information being transmitted after the tower reaches the surface.</small></div>`;

  const note=mission.querySelector('.mission-model-boundary');
  if(note)note.innerHTML='<b>PATENT CONCEPT VIEW</b><span>Only disclosed architecture and source-direction geometry are illustrated. No NRL detection range, SNR, bearing error, confidence score, propagation-loss curve or real platform signature is displayed.</span>';
}

// ---------------------------------------------------------------------------
// APPLICATIONS — patent-described contexts only; no unsupported ranking score.
// ---------------------------------------------------------------------------
const opportunities=$('opportunityList');
if(opportunities){
  opportunities.classList.add('patent-strict-applications');
  const contexts=[
    ['Acoustic source localization','The patent identifies compact low-frequency directional acoustic sensors as enabling acoustic source localization and target-bearing information.','US11287508B2'],
    ['Submarine / AUV hull mounting','The specification explicitly states that implementations can mount the floating-base vector sensor on the hull of a vessel such as a submarine or AUV.','US11287508B2'],
    ['Shallow-water mooring','The specification explicitly describes mooring in shallow waters close to an air/water boundary.','US11287508B2'],
    ['Sonobuoy component','A positively buoyant AVS tower is expressly disclosed as a component of a sonobuoy.','US11408961B2'],
    ['Towed array','Applications for neutrally buoyant AVS embodiments expressly include towed arrays.','US11408961B2'],
    ['DC / slowly varying flow','The mesh-type micromechanical transducer is disclosed as a DC flow meter, and the patent describes monitoring slowly varying viscous flow down to the DC limit.','US11287508B2'],
    ['Multi-sensor aggregation','An external device may be a central controller configured to aggregate data from multiple floating-base vector sensors.','US11287508B2'],
    ['Surface recovery + telemetry','The tower can detach, float to the surface and activate its transmitter to send stored information.','US11408961B2']
  ];
  opportunities.innerHTML='';
  contexts.forEach(c=>{
    const row=document.createElement('div');row.className='op';
    row.innerHTML='<div class="name">'+c[0]+'</div><div class="why">'+c[1]+'</div><div class="buyer">'+c[2]+'</div>';
    opportunities.appendChild(row);
  });
}

})();