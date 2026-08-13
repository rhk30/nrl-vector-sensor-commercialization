(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const NS='http://www.w3.org/2000/svg';
const P=Object.freeze({thetaDeg:20,airNoisePmPerRootHz:2,airResponsivityNmPerPa:20,airMdpMicroPaPerRootHz:100,waterResponsivityNmPerPa:0.3,waterMdpDb:76});

function replaceExactText(root,from,to){qa('*',root||document).forEach(el=>{if(el.children.length===0&&(el.textContent||'').trim()===from)el.textContent=to;});}

function fixEvidence(){
  const system=q('#system');if(!system)return;
  qa('.audit-readout',system).forEach(card=>{
    const label=q('span',card),value=q('b',card),small=q('small',card);
    if(/estimated air mdp/i.test(label?.textContent||'')){
      if(value)value.textContent='≈100 μPa/√Hz';
      if(small)small.textContent='Spectral-density estimate from ≈2 pm/√Hz interferometer noise and ≈20 nm/Pa in-air responsivity; not underwater performance.';
    }
  });
  qa('.patent-fact-grid>div',system).forEach(row=>{
    const text=(row.textContent||'').toLowerCase(),b=q('b',row),span=q('span',row);
    if(text.includes('minimum detectable sound pressure in air')){
      if(b)b.textContent='≈100 μPa/√Hz';
      if(span)span.textContent='estimated air MDP spectral density; not a broadband threshold';
    }
  });
  const boundary=q('.patent-boundary-kicker',system);if(boundary&&/patent-reported/i.test(boundary.textContent))boundary.textContent='PATENT-STATED // MEASUREMENTS + ESTIMATES';
  const disclosure=q('.patent-fact-disclosure span',system);if(disclosure)disclosure.textContent='KEY PATENT-STATED VALUES';
}

function fixTechnologyGeometry(){
  const field=q('#engField');if(!field)return;
  replaceExactText(field,'INCIDENT PLANE-WAVE DIRECTION k','INCIDENT PLANE-WAVE FIELD');
  replaceExactText(field,'WAVE / PARTICLE-VELOCITY DIRECTION','PROPAGATION / PARTICLE-VELOCITY AXIS');
  qa('.flow',field).forEach(path=>path.setAttribute('display','none'));
  const inner=q('g[transform="translate(56 98)"]',field);if(!inner||q('#integrityPlaneWave',inner))return;
  const g=document.createElementNS(NS,'g');g.id='integrityPlaneWave';
  const a=P.thetaDeg*Math.PI/180,kx=Math.cos(a),ky=Math.sin(a),px=-ky,py=kx;
  [0,58,116].forEach((d,i)=>{
    const cx=38+d*kx,cy=38+d*ky,half=38;
    const line=document.createElementNS(NS,'line');
    line.setAttribute('x1',(cx-px*half).toFixed(1));line.setAttribute('y1',(cy-py*half).toFixed(1));
    line.setAttribute('x2',(cx+px*half).toFixed(1));line.setAttribute('y2',(cy+py*half).toFixed(1));
    line.setAttribute('class','integrity-phase-front');line.setAttribute('opacity',String(.34+i*.12));g.appendChild(line);
  });
  const arrow=document.createElementNS(NS,'line');arrow.setAttribute('x1','42');arrow.setAttribute('y1','142');arrow.setAttribute('x2',(42+kx*104).toFixed(1));arrow.setAttribute('y2',(142+ky*104).toFixed(1));arrow.setAttribute('class','integrity-k-arrow');arrow.setAttribute('marker-end','url(#engArrow)');g.appendChild(arrow);
  const label=document.createElementNS(NS,'text');label.setAttribute('x','50');label.setAttribute('y','169');label.setAttribute('class','eng-small');label.textContent='PROPAGATION DIRECTION k̂';g.appendChild(label);
  inner.insertBefore(g,inner.firstChild);
}

function fixTechnologyWording(){
  const mode=q('#modeDescription');
  if(mode&&/surface recovery|buoyancy control/i.test(mode.textContent||''))mode.textContent='Tower 504 contains viscous-liquid channels with flow sensors in channel cavities. Channels may have different orientations. The specification also describes positive, neutral or negative buoyancy configurations, internal power / memory / transmitter options, and embodiments that detach, surface and transmit stored information.';
  qa('#opportunityList .op',document).forEach(row=>{
    const name=q('.name',row);if(name&&/surface recovery/i.test(name.textContent||''))name.textContent='Surfacing + telemetry';
  });
}

function strictSonobuoyArt(){
  const mission=q('.mission-shell');if(!mission)return;
  const panel=q('.deployment-visual',mission),art=q('#deploymentVisualArt',mission);if(!panel||!art)return;
  const isSonobuoy=panel.dataset.mode==='sonobuoy'||mission.dataset.deployment==='sonobuoy';if(!isSonobuoy||art.dataset.integritySonobuoy==='1')return;
  art.dataset.integritySonobuoy='1';
  art.innerHTML=`<svg viewBox="0 0 220 112" aria-hidden="true">
    <line class="deploy-water" x1="8" y1="24" x2="212" y2="24"/><line class="deploy-bed" x1="8" y1="98" x2="212" y2="98"/>
    <g class="deploy-animate deploy-bob"><rect class="deploy-tower" x="103" y="34" width="14" height="40" rx="3"/><line class="deploy-accent" x1="97" y1="46" x2="123" y2="46"/><line class="deploy-accent" x1="97" y1="63" x2="123" y2="63"/><path class="deploy-line" d="M110 74 C108 82 112 88 110 94"/></g>
    <path class="deploy-anchor" d="M101 98 L119 98 L114 91 L106 91 Z"/><text class="deploy-tag" x="128" y="48">POSITIVE-BUOYANCY AVS</text><text class="deploy-caption" x="128" y="63">tower itself + mooring</text><text class="deploy-caption" x="128" y="76">sonobuoy component context</text>
  </svg>`;
}

function fixHero(){
  const panel=q('.scene-panel');if(!panel)return;
  const subsea=q('.scene-group[data-scene="subsea"]',panel),fleet=q('.scene-group[data-scene="fleet"]',panel),wind=q('.scene-group[data-scene="wind"]',panel);
  if(subsea){
    replaceExactText(subsea,'WHAT THE PATENT ADDS // HULL OR PLATFORM-INTEGRATED VECTOR SENSING','UNDERSEA CONTEXT // SPECIFICATION ALSO DESCRIBES HULL / AUV MOUNTING');
    replaceExactText(subsea,'PATENT-DESCRIBED SENSOR','PATENT-DESCRIBED VECTOR-SENSOR CONCEPT');
  }
  if(fleet)replaceExactText(fleet,'PATENT-DESCRIBED TOWED AVS CONCEPT','PATENT-DESCRIBED TOWED-ARRAY APPLICATION CONTEXT');
  if(wind&&wind.dataset.integritySonobuoy!=='1'){
    wind.dataset.integritySonobuoy='1';
    wind.innerHTML=`
      <text x="34" y="205" class="rhk-kicker">PATENT-DESCRIBED EMBODIMENT // POSITIVELY BUOYANT AVS TOWER / SONOBUOY</text>
      <line x1="0" y1="260" x2="800" y2="260" class="rhk-water"/><text x="34" y="248" class="rhk-plain">SEA SURFACE</text>
      <g transform="translate(370 398)"><rect x="-11" y="-82" width="22" height="76" rx="4" class="rhk-node-base"/><line x1="-18" y1="-61" x2="18" y2="-45" class="rhk-meter"/><line x1="-18" y1="-33" x2="18" y2="-49" class="rhk-meter"/><circle class="rhk-node-hub" cy="-45" r="4"/><line class="rhk-tether" x1="0" y1="-6" x2="0" y2="118"/><path class="rhk-anchor" d="M-18 118H18L25 132H-25Z"/></g>
      <g class="rhk-source" transform="translate(610 450)"><circle r="7"/><line x1="-15" y1="0" x2="15" y2="0"/><line x1="0" y1="-15" x2="0" y2="15"/><circle class="hero-wave" r="46"/><circle class="hero-wave" r="46"/><circle class="hero-wave" r="46"/></g>
      <g class="rhk-receiver" transform="translate(620 260)"><rect x="-11" y="-11" width="22" height="22" rx="2"/><circle r="3"/><line x1="-17" y1="0" x2="-11" y2="0"/><line x1="11" y1="0" x2="17" y2="0"/></g>
      <line x1="603" y1="450" x2="385" y2="365" class="rhk-bearing"/><line x1="370" y1="360" x2="620" y2="260" class="rhk-data"/>
      <g transform="translate(112 330)"><rect class="rhk-callout-bg" width="310" height="42" rx="2"/><text x="12" y="17" class="rhk-label">PATENT-DESCRIBED POSITIVELY BUOYANT AVS TOWER</text><text x="12" y="32" class="rhk-sub">TOWER TETHERED TO ANCHOR / SONOBUOY COMPONENT / US11408961B2</text></g>
      <g transform="translate(520 392)"><rect class="rhk-callout-bg" width="194" height="42" rx="2"/><text x="12" y="17" class="rhk-label">ILLUSTRATIVE ACOUSTIC SOURCE</text><text x="12" y="32" class="rhk-sub">BEARING GEOMETRY ONLY</text></g>
      <text x="760" y="683" text-anchor="end" class="rhk-plain">DASHED = SOURCE TO SENSOR BEARING / SOLID = SENSOR TO RECEIVER DATA PATH</text>`;
  }
}

function fixMarket(){
  const market=q('#market');if(!market)return;
  qa('.mm10-node .ring',market).forEach(el=>el.remove());
  const copy=q('.mm10-copy p',market);if(copy&&/animated rings show qualitative acoustic fields/i.test(copy.textContent||''))copy.textContent='The patent-described node is enlarged for legibility. Dashed lines show source-bearing geometry; qualitative source wavefronts show acoustic-field context reaching the nodes. Platforms, motion and bathymetry are illustrative only.';
}

function fixDemoBoundary(){
  const mission=q('.mission-shell');if(!mission)return;
  qa('.control-group,.readout-block',mission).forEach(el=>{if(/scene separation/i.test(el.textContent||'')){el.style.display='none';el.setAttribute('aria-hidden','true');}});
  const range=q('#missionRange',mission);if(range){const group=range.closest('.control-group');if(group){group.style.display='none';group.setAttribute('aria-hidden','true');}}
  strictSonobuoyArt();
}

function mathChecks(){
  const eps=1e-10,cos20=Math.cos(20*Math.PI/180),air=(2e-12)/(20e-9),water=(2e-12)/(0.3e-9),waterDb=20*Math.log10(water/1e-6);
  console.assert(Math.abs(cos20-0.9396926207859084)<eps,'RHKEARTH integrity: cos20');
  console.assert(Math.abs(air-100e-6)<1e-12,'RHKEARTH integrity: air MDP spectral density');
  console.assert(Math.abs(waterDb-76.47817481888637)<1e-9,'RHKEARTH integrity: projected water MDP');
  for(const deg of [0,45,90,180,270,315]){const b=deg*Math.PI/180,e=-Math.sin(b),n=-Math.cos(b);console.assert(Math.abs(Math.hypot(e,n)-1)<1e-12,'RHKEARTH integrity: unit direction norm');}
  window.RHKEARTH_INTEGRITY=Object.freeze({cos20,airMdpPaPerRootHz:air,projectedWaterMdpDb:waterDb,checked:true});
}

function run(){fixEvidence();fixTechnologyGeometry();fixTechnologyWording();fixDemoBoundary();fixHero();fixMarket();}
mathChecks();run();
[250,800,1800,3500].forEach(ms=>setTimeout(run,ms));
window.addEventListener('rhk-deployment-change',()=>setTimeout(()=>{fixDemoBoundary();},0));
})();
