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
    ['Peak responsivity — air','>20 nm/Pa @ 90 Hz','In-air prototype evaluation reported in the patent.'],
    ['Prototype fundamental','530 Hz','Fundamental frequency reported for the first mesh prototype.'],
    ['Estimated MDP — air','≈100 μPa','Patent estimate based on an interferometer noise floor of approximately 2 pm/√Hz.'],
    ['Normalized directivity','—','Natural cos θ relation described in the patent; normalized display, not a sensitivity measurement.']
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
  if(interp)interp.textContent='Patent basis: out-of-plane mesh displacement is expected to produce a natural cos θ directivity relative to the mesh normal. The patent also states that three co-located orthogonal mesh transducers can reconstruct the sound-wave vector in three-dimensional space. This display is normalized and does not predict sensitivity or detection range.';
}
$('angle')?.addEventListener('input',()=>queueMicrotask(updateDirectivity));
updateDirectivity();

// Replace generic equations with relationships stated in the patent text.
const formulas=qa('#physics .formula');
const formulaData=[
  ['Mesh fiber length','2L² / d','Square L × L mesh with unit size d; patent states this total fiber-length relationship.'],
  ['Directional response','cos θ','Natural directivity relative to the mesh normal described in the patent.'],
  ['Fiber-length gain','2L / d','Patent comparison of fine 2-D mesh fiber length with a single cantilever of length L.']
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

  // Remove visual cues that look like quantitative detection-range or uncertainty charts.
  qa('.mission-stage svg text').forEach(t=>{if(/KM/i.test(t.textContent||''))t.style.display='none';});
  const cone=$('bearingCone');if(cone)cone.style.display='none';
  const scan=$('scanLine');if(scan)scan.style.display='none';
  const rlabel=$('stageRangeLabel');if(rlabel)rlabel.style.display='none';
  const legend=mission.querySelector('.legend');
  if(legend)legend.innerHTML='<div><i></i> ILLUSTRATIVE ACOUSTIC WAVEFRONT</div><div><i class="dashed"></i> SOURCE-BEARING GEOMETRY</div>';

  const readout=mission.querySelector('.mission-readout');
  if(readout)readout.innerHTML=`
    <div class="readout-block"><span>Sensing principle</span><b>Particle-motion DOA</b><small>Patent describes using particle-velocity orientation to determine the acoustic wave vector and direction of arrival.</small></div>
    <div class="readout-block"><span>Floating-base embodiment</span><b>Base + flow meters + tether + anchor</b><small>FIG. 1 shows one or more flow meters; four are shown in the disclosed embodiment.</small></div>
    <div class="readout-block"><span>Mesh directivity</span><b>Natural cos θ</b><small>Out-of-plane mesh displacement relative to mesh-normal incidence.</small></div>
    <div class="readout-block"><span>3-D direction</span><b>3 orthogonal meshes</b><small>Patent states three co-located orthogonal mesh transducers can reconstruct a wave vector in 3-D.</small></div>
    <div class="readout-block"><span>Prototype geometry</span><b>6 mm OD</b><small>Spider-web prototype; ≈20 μm separation and ≈2.7 m total fiber length reported.</small></div>
    <div class="readout-block"><span>In-air prototype</span><b>&gt;20 nm/Pa @ 90 Hz</b><small>Peak responsivity reported in the patent's in-air evaluation.</small></div>
    <div class="readout-block"><span>Prototype resonance</span><b>530 Hz</b><small>Fundamental frequency reported for the first mesh prototype.</small></div>
    <div class="readout-block"><span>Water estimate</span><b>≈76 dB re 1 μPa/√Hz</b><small>Equivalent MDP projected in the patent; explicitly not an in-water validation result.</small></div>
    <div class="readout-block"><span>Tower embodiment</span><b>Multiple viscous-liquid channels</b><small>Channels may have different orientations; flow sensors may comprise two-dimensional meshes.</small></div>
    <div class="readout-block"><span>Recovery embodiment</span><b>Detach → surface → transmit</b><small>Patent discloses a tower with transmitter, memory and battery that can surface and send stored information.</small></div>`;

  const note=mission.querySelector('.mission-model-boundary');
  if(note)note.innerHTML='<b>PATENT CONCEPT VIEW</b><span>Only architecture and direction geometry are illustrated. The site does not display a claimed NRL detection range, SNR, bearing error, confidence score, propagation loss or real platform signature.</span>';
}

// ---------------------------------------------------------------------------
// APPLICATIONS — qualitative discussion, no unsupported numerical ranking.
// ---------------------------------------------------------------------------
const opportunities=$('opportunityList');
if(opportunities){
  opportunities.classList.add('patent-strict-applications');
  qa('.op',opportunities).forEach(op=>{
    op.querySelector('.score')?.remove();
    op.querySelector('.rank')?.remove();
  });
}

})();