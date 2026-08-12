(()=>{'use strict';
const $=id=>document.getElementById(id);
const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const q=(sel,root=document)=>root.querySelector(sel);

// Public page stays focused. Patent provenance remains in diligence + README.
qa('.toplinks a').forEach(a=>{if(a.getAttribute('href')==='#sources')a.remove();});
const sources=$('sources');if(sources)sources.setAttribute('aria-hidden','true');

// ---------------------------------------------------------------------------
// TECHNOLOGY — patent-reported facts + one normalized directivity interaction.
// ---------------------------------------------------------------------------
const controls=q('#physics .controls');
let selectedReference='90';
if(controls){
  controls.classList.add('patent-strict-controls');
  const h=q('h3',controls);if(h)h.textContent='Patent-described directivity';
  const helper=q('.helper',controls);if(helper)helper.textContent='Explore the cosine-type directional response described in US11287508B2. Reference conditions below are values expressly stated in the patent; they are not a performance sweep.';

  const allControls=qa('.control',controls);
  allControls.forEach(c=>c.classList.add('patent-strict-hidden'));

  // Keep incidence angle as the primary interaction.
  const angleGroup=$('angle')?.closest('.control');
  if(angleGroup){
    angleGroup.classList.remove('patent-strict-hidden');
    const label=q('label span',angleGroup);if(label)label.textContent='Incidence angle';
  }

  // Re-use the original frequency input invisibly so the engineering illustration
  // can react to patent-stated reference frequencies without exposing arbitrary
  // frequencies as though they were measured performance data.
  const freq=$('freq');
  if(freq){freq.min='10';freq.max='530';freq.step='1';freq.value='90';}

  const reference=document.createElement('div');
  reference.className='patent-reference-control';
  reference.innerHTML=`
    <div class="patent-control-label"><span>Patent reference condition</span><small>Changes visualization context only</small></div>
    <div class="patent-reference-options" role="group" aria-label="Patent reference frequency">
      <button type="button" data-ref="10"><b>10 Hz</b><span>floating-base size estimate</span></button>
      <button type="button" class="active" data-ref="90"><b>90 Hz</b><span>in-air responsivity test</span></button>
      <button type="button" data-ref="530"><b>530 Hz</b><span>prototype fundamental</span></button>
    </div>`;
  angleGroup?.insertAdjacentElement('beforebegin',reference);

  const geometry=document.createElement('div');
  geometry.className='patent-geometry-strip';
  geometry.innerHTML=`
    <div><span>Prototype OD</span><b>6 mm</b></div>
    <div><span>Beam separation</span><b>≈20 μm</b></div>
    <div><span>Total fiber</span><b>≈2.7 m</b></div>`;
  angleGroup?.insertAdjacentElement('afterend',geometry);

  qa('.patent-reference-options button',reference).forEach(btn=>btn.addEventListener('click',()=>{
    selectedReference=btn.dataset.ref;
    qa('.patent-reference-options button',reference).forEach(b=>b.classList.toggle('active',b===btn));
    if(freq){freq.value=selectedReference;freq.dispatchEvent(new Event('input',{bubbles:true}));}
    lockPatentReadouts();
  }));
}

const readouts=q('#physics .readouts');
if(readouts)readouts.classList.add('patent-strict-readouts');

function directivityPct(){const a=+$('angle')?.value||0;return Math.abs(Math.cos(a*Math.PI/180))*100;}
function lockPatentReadouts(){
  const blocks=readouts?qa('.readout',readouts):[];
  const data=[
    ['Peak responsivity — air','>20 nm/Pa @ 90 Hz','In-air prototype evaluation reported in US11287508B2.'],
    ['Prototype fundamental','530 Hz','Fundamental frequency reported for the first mesh prototype.'],
    ['Estimated MDP — air','≈100 μPa','Patent estimate using an interferometer noise floor of approximately 2 pm/√Hz.'],
    ['Directional projection',directivityPct().toFixed(0)+'%','Normalized cos θ relationship described in the patent; not a sensitivity prediction.']
  ];
  blocks.forEach((b,i)=>{
    if(!data[i])return;
    const span=q('span',b),val=q('b',b),small=q('small',b);
    if(span&&span.textContent!==data[i][0])span.textContent=data[i][0];
    if(val&&val.textContent!==data[i][1])val.textContent=data[i][1];
    if(small&&small.textContent!==data[i][2])small.textContent=data[i][2];
  });
  const angleText=$('angleText');if(angleText)angleText.textContent=Math.round(+$('angle')?.value||0);
  const interp=$('modelInterpretation');
  if(interp){
    const ref=selectedReference==='10'?'10 Hz floating-base size estimate':selectedReference==='530'?'530 Hz prototype fundamental':'90 Hz in-air responsivity evaluation';
    interp.textContent='Patent basis: out-of-plane mesh displacement is expected to produce a natural cos θ directivity relative to the mesh normal. Three co-located orthogonal mesh transducers are described as sufficient to reconstruct the sound-wave vector in 3-D. Selected reference: '+ref+'.';
  }
}
['angle','freq','spl','diameter','spacing'].forEach(id=>$(id)?.addEventListener('input',()=>queueMicrotask(lockPatentReadouts)));
lockPatentReadouts();

// The legacy calculator also listens to these inputs. Guard the patent cards from
// being overwritten after any future input event.
if(readouts){
  const guard=new MutationObserver(()=>queueMicrotask(lockPatentReadouts));
  qa('.readout b',readouts).slice(0,3).forEach(el=>guard.observe(el,{childList:true,characterData:true,subtree:true}));
}

// Relationships stated in the patent text.
const formulas=qa('#physics .formula');
const formulaData=[
  ['Mesh fiber length','2L² / d','Square L × L mesh with unit size d; patent-stated total fiber-length relationship.'],
  ['Directional response','cos θ','Natural directivity relative to the mesh normal described in the patent.'],
  ['Fiber-length gain','2L / d','Patent-stated increase versus a single cantilever of length L.']
];
formulas.forEach((f,i)=>{if(formulaData[i])f.innerHTML='<b>'+formulaData[i][0]+'</b><code>'+formulaData[i][1]+'</code><small>'+formulaData[i][2]+'</small>';});

// ---------------------------------------------------------------------------
// MISSION — clean professional concept demo. Architecture + geometry only.
// ---------------------------------------------------------------------------
const mission=q('.mission-shell');
if(mission){
  mission.classList.add('patent-concept-mode');
  const title=q('.mission-top h3',mission);if(title)title.textContent='Patent concept demonstrator';
  const desc=q('.mission-top p',mission);if(desc)desc.textContent='Configure a disclosed architecture and source geometry. The scene demonstrates direction-of-arrival concepts, not detection performance.';

  // Remove the old generic scenario preset UI and replace it with patent-described
  // deployment contexts that simply configure the visualization.
  const firstGroup=q('.control-group',mission);
  if(firstGroup){
    firstGroup.classList.remove('patent-strict-hidden');
    firstGroup.innerHTML=`
      <label><span>Deployment preset</span></label>
      <div class="patent-demo-presets">
        <button type="button" class="active" data-preset="floating">Floating / moored</button>
        <button type="button" data-preset="hull">Hull / AUV</button>
        <button type="button" data-preset="sonobuoy">Sonobuoy</button>
        <button type="button" data-preset="towed">Towed array</button>
      </div>`;
  }

  // Show only controls that improve the conceptual demo.
  qa('.control-group',mission).forEach(group=>{
    if(group===firstGroup)return;
    const t=group.textContent.toLowerCase();
    const keep=t.includes('acoustic source')||t.includes('patent architecture')||t.includes('bearing from sensor')||t.includes('range')||t.includes('frequency');
    group.classList.toggle('patent-strict-hidden',!keep);
  });

  const sourceLabel=$('targetType')?.closest('.control-group')?.querySelector('label span');if(sourceLabel)sourceLabel.textContent='Acoustic source';
  const archLabel=$('sensorConfig')?.closest('.control-group')?.querySelector('label span');if(archLabel)archLabel.textContent='Patent architecture';
  const bearingLabel=$('missionBearing')?.closest('.control-group')?.querySelector('label span');if(bearingLabel)bearingLabel.textContent='Illustrative source bearing';

  // Frequency is restricted to patent-stated reference conditions rather than an
  // arbitrary slider. Keep the existing input hidden for the 3-D scene logic.
  const missionFreq=$('missionFreq');
  const freqGroup=missionFreq?.closest('.control-group');
  if(freqGroup){
    missionFreq.style.display='none';
    const label=q('label span',freqGroup);if(label)label.textContent='Patent reference';
    const strong=q('label strong',freqGroup);if(strong)strong.textContent='90 Hz';
    const opts=document.createElement('div');opts.className='mission-reference-options';
    opts.innerHTML='<button type="button" data-f="10">10 Hz</button><button type="button" class="active" data-f="90">90 Hz</button><button type="button" data-f="530">530 Hz</button>';
    freqGroup.appendChild(opts);
    qa('button',opts).forEach(btn=>btn.addEventListener('click',()=>{
      qa('button',opts).forEach(b=>b.classList.toggle('active',b===btn));
      if(strong)strong.textContent=btn.dataset.f+' Hz';
      missionFreq.value=btn.dataset.f;missionFreq.dispatchEvent(new Event('input',{bubbles:true}));
    }));
  }

  // Range is useful for the visualization, but do not present it as a claimed
  // detection distance. Display only normalized scene spacing.
  const range=$('missionRange');
  const rangeGroup=range?.closest('.control-group');
  const rangeStrong=q('label strong',rangeGroup||document);
  if(rangeGroup){const lab=q('label span',rangeGroup);if(lab)lab.textContent='Scene separation';}
  function updateSeparationLabel(){
    if(!range||!rangeStrong)return;
    const v=+range.value;
    rangeStrong.textContent=v<3?'Near':v<6?'Mid':'Far';
  }
  range?.addEventListener('input',()=>queueMicrotask(updateSeparationLabel));updateSeparationLabel();

  // Patent-described deployment presets. These only set visualization controls.
  const presetMap={
    floating:{target:'source',config:'floating',bearing:42,range:3.0},
    hull:{target:'submarine',config:'platform',bearing:218,range:4.8},
    sonobuoy:{target:'submarine',config:'tower',bearing:135,range:5.5},
    towed:{target:'surface',config:'tower',bearing:305,range:6.4}
  };
  function setInput(id,value,event='input'){const el=$(id);if(!el)return;el.value=value;el.dispatchEvent(new Event(event,{bubbles:true}));}
  qa('.patent-demo-presets button',mission).forEach(btn=>btn.addEventListener('click',()=>{
    qa('.patent-demo-presets button',mission).forEach(b=>b.classList.toggle('active',b===btn));
    const p=presetMap[btn.dataset.preset];if(!p)return;
    setInput('targetType',p.target,'change');setInput('sensorConfig',p.config,'change');setInput('missionBearing',p.bearing);setInput('missionRange',p.range);
    updateSeparationLabel();
  }));

  // Remove performance-looking chart cues.
  qa('.mission-stage svg text').forEach(t=>{if(/KM/i.test(t.textContent||''))t.style.display='none';});
  const cone=$('bearingCone');if(cone)cone.style.display='none';
  const scan=$('scanLine');if(scan)scan.style.display='none';
  const rlabel=$('stageRangeLabel');if(rlabel)rlabel.style.display='none';
  const legend=q('.legend',mission);if(legend)legend.innerHTML='<div><i></i> ILLUSTRATIVE ACOUSTIC WAVEFRONT</div><div><i class="dashed"></i> SOURCE-BEARING GEOMETRY</div>';

  const readout=q('.mission-readout',mission);
  if(readout)readout.innerHTML=`
    <div class="readout-block"><span>Sensing principle</span><b>Particle-motion DOA</b><small>Particle-velocity orientation provides wave-vector and direction-of-arrival information.</small></div>
    <div class="readout-block"><span>Floating-base embodiment</span><b>Base + flow meters + thread + anchor</b><small>FIG. 1 discloses one or more flow meters; four are shown.</small></div>
    <div class="readout-block"><span>Mesh directivity</span><b>Natural cos θ</b><small>Expected out-of-plane displacement response relative to mesh normal.</small></div>
    <div class="readout-block"><span>3-D direction</span><b>3 orthogonal meshes</b><small>Patent describes reconstructing the sound-wave vector in three dimensions.</small></div>
    <div class="readout-block"><span>Prototype geometry</span><b>6 mm OD</b><small>≈20 μm separation and ≈2.7 m total fiber length reported.</small></div>
    <div class="readout-block"><span>In-air prototype</span><b>&gt;20 nm/Pa @ 90 Hz</b><small>Peak responsivity reported in the patent's in-air evaluation.</small></div>
    <div class="readout-block"><span>Prototype fundamental</span><b>530 Hz</b><small>Reported for the first mesh prototype.</small></div>
    <div class="readout-block"><span>Water projection</span><b>≈76 dB re 1 μPa/√Hz</b><small>Patent projection; not an in-water validation result.</small></div>`;

  const note=q('.mission-model-boundary',mission);
  if(note)note.innerHTML='<b>PATENT CONCEPT VIEW</b><span>Controls change source geometry and disclosed architecture only. No NRL detection range, SNR, bearing error, confidence score, propagation-loss curve or platform signature is represented.</span>';
}

// ---------------------------------------------------------------------------
// APPLICATIONS — patent-described contexts only; no unsupported ranking score.
// ---------------------------------------------------------------------------
const opportunities=$('opportunityList');
if(opportunities){
  opportunities.classList.add('patent-strict-applications');
  const contexts=[
    ['Acoustic source localization','The patent identifies compact low-frequency directional acoustic sensors as enabling source localization and target-bearing information.','US11287508B2'],
    ['Submarine / AUV hull mounting','The specification explicitly states that implementations can mount the vector sensor on the hull of a vessel such as a submarine or AUV.','US11287508B2'],
    ['Shallow-water mooring','The specification describes mooring in shallow waters close to an air/water boundary.','US11287508B2'],
    ['Sonobuoy component','A positively buoyant AVS tower is expressly disclosed as a component of a sonobuoy.','US11408961B2'],
    ['Towed array','Applications for neutrally buoyant AVS embodiments expressly include towed arrays.','US11408961B2'],
    ['DC / slowly varying flow','The mesh-type transducer is disclosed as a DC flow meter and for monitoring slowly varying viscous flow.','US11287508B2'],
    ['Multi-sensor aggregation','An external central controller may aggregate data from multiple floating-base vector sensors.','US11287508B2'],
    ['Surface recovery + telemetry','The tower can detach, float to the surface and transmit stored information.','US11408961B2']
  ];
  opportunities.innerHTML='';
  contexts.forEach(c=>{const row=document.createElement('div');row.className='op';row.innerHTML='<div class="name">'+c[0]+'</div><div class="why">'+c[1]+'</div><div class="buyer">'+c[2]+'</div>';opportunities.appendChild(row);});
}
})();