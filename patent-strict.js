(()=>{'use strict';
const $=id=>document.getElementById(id),q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

qa('.toplinks a').forEach(a=>{if(a.getAttribute('href')==='#sources')a.remove();});
const sources=$('sources');if(sources){sources.hidden=true;sources.setAttribute('aria-hidden','true');}

// Technology: preserve only source-grounded architecture and analytical geometry.
// Later audit / exhibit modules own the static directivity presentation.
const physics=$('physics');
if(physics){
  const controls=q('.controls',physics);if(controls){controls.classList.add('patent-strict-controls');controls.setAttribute('aria-hidden','true');}
  const freq=$('freq');if(freq){freq.min='10';freq.max='530';freq.step='1';freq.value='90';}
  const angle=$('angle');if(angle){angle.min='0';angle.max='180';angle.step='1';if(+angle.value<0||+angle.value>180)angle.value='20';}
  const geometry=q('.patent-geometry-strip',physics)||document.createElement('div');
  if(!geometry.classList.contains('patent-geometry-strip'))geometry.className='patent-geometry-strip';
  geometry.innerHTML='<div><span>Prototype OD</span><b>6 mm</b></div><div><span>Filament separation</span><b>20 μm</b></div><div><span>Total fiber</span><b>≈2.7 m</b></div>';
  const angleGroup=angle?.closest('.control');if(angleGroup&&!geometry.isConnected)angleGroup.insertAdjacentElement('afterend',geometry);
  q('.patent-reference-control',physics)?.remove();
}

// Patent-grounded deployment controls. Deployment selection changes deployment
// only; it never imposes a source class, bearing, range or performance value.
const mission=q('.mission-shell');
if(mission){
  mission.classList.add('patent-concept-mode');
  const title=q('.mission-top h3',mission);if(title)title.textContent='Patent concept demonstrator';
  const desc=q('.mission-top p',mission);if(desc)desc.textContent='Choose a patent-described deployment context and inspect source-bearing geometry. No detection-performance model is applied.';

  const firstGroup=q('.control-group',mission);
  if(firstGroup){
    firstGroup.innerHTML='<label><span>Deployment context</span></label><div class="patent-demo-presets"><button type="button" class="active" data-preset="floating">Floating / moored</button><button type="button" data-preset="hull">Hull / AUV</button><button type="button" data-preset="sonobuoy">Sonobuoy</button><button type="button" data-preset="towed">Towed array</button></div>';
  }

  const target=$('targetType'),config=$('sensorConfig'),bearing=$('missionBearing'),range=$('missionRange');
  const targetLabel=target?.closest('.control-group')?.querySelector('label span');if(targetLabel)targetLabel.textContent='Source illustration';
  const configLabel=config?.closest('.control-group')?.querySelector('label span');if(configLabel)configLabel.textContent='Patent architecture';
  const bearingLabel=bearing?.closest('.control-group')?.querySelector('label span');if(bearingLabel)bearingLabel.textContent='Source bearing β';
  ['missionFreq','missionSource','missionNoise'].forEach(id=>$(id)?.closest('.control-group')?.remove());
  const rangeGroup=range?.closest('.control-group');if(rangeGroup){rangeGroup.style.display='none';rangeGroup.setAttribute('aria-hidden','true');}

  const configMap={floating:'floating',hull:'platform',sonobuoy:'tower',towed:'tower'};
  qa('.patent-demo-presets button',mission).forEach(btn=>btn.addEventListener('click',()=>{
    qa('.patent-demo-presets button',mission).forEach(b=>b.classList.toggle('active',b===btn));
    const v=configMap[btn.dataset.preset];if(config&&v){config.value=v;config.dispatchEvent(new Event('change',{bubbles:true}));}
    mission.dataset.deployment=btn.dataset.preset;
    window.dispatchEvent(new CustomEvent('rhk-deployment-change',{detail:{mode:btn.dataset.preset}}));
  }));

  qa('.mission-stage svg text').forEach(t=>{if(/KM|≈2\.5|≈5\.0|≈7\.5/i.test(t.textContent||''))t.style.display='none';});
  $('bearingCone')?.setAttribute('display','none');$('scanLine')?.setAttribute('display','none');$('stageRangeLabel')?.setAttribute('display','none');
  const legend=q('.legend',mission);if(legend)legend.innerHTML='<div><i class="dashed"></i> SENSOR → SOURCE BEARING</div><div><i class="incoming"></i> SOURCE → SENSOR PROPAGATION</div>';
  const note=q('.mission-model-boundary',mission);if(note)note.innerHTML='<b>PATENT CONCEPT VIEW</b><span>Source type and scene geometry are illustrative. No source level, physical range, SNR, bearing error, confidence score, propagation loss, platform signature or operational detection performance is represented.</span>';
}

// Patent-described application contexts only. Commercial hypotheses are handled
// separately by the Applications presentation.
const opportunities=$('opportunityList');
if(opportunities){
  opportunities.classList.add('patent-strict-applications');
  const contexts=[
    ['Acoustic source localization','Particle-motion orientation can provide wave-vector / direction-of-arrival information and support source localization.','US11287508B2'],
    ['Submarine / AUV hull mounting','The specification describes implementations mounted on a submarine or AUV hull.','US11287508B2'],
    ['Shallow-water mooring','The specification describes mooring in shallow water close to an air/water boundary.','US11287508B2'],
    ['Sonobuoy component','A positively buoyant AVS tower is described as a component of a sonobuoy.','US11408961B2'],
    ['Towed-array application','Applications for neutrally buoyant AVS embodiments expressly include towed arrays. The website tow-body geometry is schematic context.','US11408961B2'],
    ['DC / slowly varying flow','The mesh-type transducer is described for DC and slowly varying viscous-flow sensing.','US11287508B2'],
    ['Multi-sensor aggregation','An external central controller may aggregate measurement information from multiple floating-base sensors.','US11287508B2'],
    ['Surfacing + telemetry','An embodiment may detach from the retaining thread, float to the surface, and transmit stored information.','US11408961B2']
  ];
  opportunities.innerHTML='';
  contexts.forEach(c=>{const row=document.createElement('div');row.className='op';row.innerHTML='<div class="name">'+c[0]+'</div><div class="why">'+c[1]+'</div><div class="buyer">'+c[2]+'</div>';opportunities.appendChild(row);});
}
})();
