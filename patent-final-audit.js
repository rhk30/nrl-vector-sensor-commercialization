(()=>{'use strict';
const $=id=>document.getElementById(id);
const q=(sel,root=document)=>root.querySelector(sel);
const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));

// ---------------------------------------------------------------------------
// Single source of truth for values expressly stated in US11287508B2 / US11408961B2.
// Values below are not product specifications and are not extrapolated performance.
// ---------------------------------------------------------------------------
const P=Object.freeze({
  prototypeODmm:6,
  separationUm:20,
  totalFiberM:2.7,
  filamentWidthUm:3.6,
  filamentThicknessUm:1,
  mirrorAlNm:30,
  fundamentalHz:530,
  responsivityTestHz:90,
  responsivityNmPerPaLowerBound:20,
  interferometerNoisePmPerRootHz:2,
  mdpAirMicroPa:100,
  mdpWaterDbRe1uPaPerRootHz:76,
  floatingBaseRadiusMmAt10Hz:10,
  fig4PressureAirMicroPa:100,
  fig4FlowVelocityAirUmPerS:0.24,
  fig1FlowMetersShown:4
});
window.RHKEARTH_PATENT_DATA=P;

// ---------------------------------------------------------------------------
// Remove legacy pre-audit performance language that can otherwise flash before
// the enhancement layers settle. These values were never patent measurements.
// ---------------------------------------------------------------------------
const metrics=qa('.metrics .metric');
const metricData=[
  ['NRL patents evaluated','02','No ownership or license claimed'],
  ['Prototype mesh OD','6 mm','Spider-web prototype reported in US11287508B2'],
  ['Prototype total fiber','≈2.7 m','Reported for the 6 mm spider-web geometry'],
  ['Prototype fundamental','530 Hz','Reported for the first mesh prototype']
];
metrics.forEach((m,i)=>{
  if(!metricData[i])return;
  const [a,b,c]=metricData[i];
  const l=q('.label',m),v=q('.value',m),s=q('.sub',m);
  if(l)l.textContent=a;if(v)v.textContent=b;if(s)s.textContent=c;
});

const missionSection=$('mission');
if(missionSection){
  const p=q('.section-head .section-title p',missionSection);
  if(p)p.textContent='Choose a patent-described deployment context, place a generic acoustic source around the sensor, and inspect the horizontal bearing geometry. The demonstrator does not calculate detection performance.';
  const note=q('.note',missionSection);
  if(note)note.innerHTML='<strong>Patent concept view:</strong> source position, wavefront motion and vehicle silhouettes are illustrative. No source level, ambient-noise model, detection range, SNR, bearing-error model, propagation loss, platform signature or NRL-validated operational performance is represented.';
}

// ---------------------------------------------------------------------------
// Exact patent fact boundary.
// ---------------------------------------------------------------------------
const factGrid=q('.patent-fact-grid');
if(factGrid){
  factGrid.innerHTML=`
    <div><b>${P.prototypeODmm} mm</b><span>outer diameter of the disclosed spider-web prototype</span></div>
    <div><b>${P.separationUm} μm</b><span>released-web filament / beam separation reported for the prototype</span></div>
    <div><b>≈${P.totalFiberM} m</b><span>total fiber length reported for the 6 mm spider-web prototype geometry</span></div>
    <div><b>${P.filamentWidthUm} μm × ${P.filamentThicknessUm} μm</b><span>prototype filament cross-section</span></div>
    <div><b>${P.mirrorAlNm} nm Al</b><span>aluminum film used on the prototype center mirror</span></div>
    <div><b>&gt;${P.responsivityNmPerPaLowerBound} nm/Pa @ ${P.responsivityTestHz} Hz</b><span>peak responsivity reported in the in-air prototype evaluation</span></div>
    <div><b>${P.fundamentalHz} Hz</b><span>fundamental frequency reported for the first mesh prototype</span></div>
    <div><b>≈${P.interferometerNoisePmPerRootHz} pm/√Hz</b><span>interferometer noise floor used in the patent MDP estimate</span></div>
    <div><b>≈${P.mdpAirMicroPa} μPa</b><span>minimum detectable sound pressure in air estimated in the patent</span></div>
    <div><b>≈${P.mdpWaterDbRe1uPaPerRootHz} dB re 1 μPa/√Hz</b><span>projected equivalent water pressure spectral density, not an in-water validation result</span></div>
    <div><b>≈${P.floatingBaseRadiusMmAt10Hz} mm radius @ 10 Hz</b><span>floating-base size estimate stated in the patent</span></div>
    <div><b>${P.fig4PressureAirMicroPa} μPa → ${P.fig4FlowVelocityAirUmPerS} μm/s</b><span>air pressure / flow-velocity condition stated for FIG. 4</span></div>`;
}

// Exact wording for the small geometry strip.
const geometry=q('.patent-geometry-strip');
if(geometry){
  geometry.innerHTML=`
    <div><span>Prototype OD</span><b>${P.prototypeODmm} mm</b></div>
    <div><span>Filament separation</span><b>${P.separationUm} μm</b></div>
    <div><span>Total fiber</span><b>≈${P.totalFiberM} m</b></div>`;
}

// Reference-frequency buttons were visually interactive but did not represent a
// patent frequency-response sweep. Remove them rather than imply nonexistent data.
q('.patent-reference-control')?.remove();

// ---------------------------------------------------------------------------
// Patent directivity: R/Rmax = cos(theta), including sign / phase reversal.
// The patent reports a measured dipole at 90 Hz, but does not tabulate the measured
// point series. Therefore this plot shows ONLY the stated analytical relationship.
// ---------------------------------------------------------------------------
const physics=$('physics');
const angle=$('angle');
const angleGroup=angle?.closest('.control');
if(angle){
  angle.min='0';angle.max='180';angle.step='1';
  if(+angle.value>180||+angle.value<0)angle.value='20';
}
if(angleGroup){
  const lab=q('label span',angleGroup);if(lab)lab.textContent='Incidence angle θ from mesh normal';
}

// Hide legacy readouts that are maintained by older fallback code. A clean audited
// set is inserted next to them so mutation observers cannot overwrite it.
const legacyReadouts=q('#physics .readouts');
if(legacyReadouts)legacyReadouts.style.display='none';
const legacyInterp=$('modelInterpretation');if(legacyInterp)legacyInterp.style.display='none';

let auditReadouts=q('.audited-reference-grid',physics||document);
if(physics&&!auditReadouts){
  auditReadouts=document.createElement('div');
  auditReadouts.className='audited-reference-grid';
  auditReadouts.innerHTML=`
    <div class="audit-readout"><span>Normalized signed response</span><b id="auditDirectivity">+1.000</b><small>R/Rmax = cos θ. Negative sign denotes the opposite dipole phase.</small></div>
    <div class="audit-readout"><span>In-air peak responsivity</span><b>&gt;${P.responsivityNmPerPaLowerBound} nm/Pa @ ${P.responsivityTestHz} Hz</b><small>Reported prototype measurement, not underwater sensitivity.</small></div>
    <div class="audit-readout"><span>Prototype fundamental</span><b>${P.fundamentalHz} Hz</b><small>Reported for the first mesh prototype.</small></div>
    <div class="audit-readout"><span>Estimated air MDP</span><b>≈${P.mdpAirMicroPa} μPa</b><small>Patent estimate using an interferometer noise floor of ≈${P.interferometerNoisePmPerRootHz} pm/√Hz.</small></div>`;
  const results=q('.results',physics);
  if(results)results.insertBefore(auditReadouts,results.firstChild);
}

const formulas=qa('#physics .formula');
const formulaData=[
  ['Normalized mesh directivity','R / Rmax = cos θ','θ is measured from the mesh normal. The sign is part of the dipole response.'],
  ['Ideal square-mesh fiber length','L_fiber = 2L² / d','Patent scaling relation for a square L × L mesh with unit spacing d.'],
  ['Ideal square-mesh length gain','L_fiber / L = 2L / d','Patent-stated increase in total fiber length relative to one cantilever of length L.']
];
formulas.forEach((f,i)=>{if(!formulaData[i])return;const [a,b,c]=formulaData[i];f.innerHTML=`<b>${a}</b><code>${b}</code><small>${c}</small>`;});
let formulaBoundary=q('.formula-boundary-note',physics||document);
if(physics&&!formulaBoundary){
  formulaBoundary=document.createElement('div');formulaBoundary.className='formula-boundary-note';
  formulaBoundary.innerHTML='<b>GEOMETRY BOUNDARY</b><span>The 2L²/d relationship is stated for an ideal square mesh. The reported ≈2.7 m fiber length belongs to the separate 6 mm OD spider-web prototype with truncated branches. The square-mesh equation is not used here to back-calculate the spider-web fiber length.</span>';
  q('.formulas',physics)?.insertAdjacentElement('afterend',formulaBoundary);
}

let plot=q('.patent-directivity-panel',physics||document);
if(physics&&!plot){
  plot=document.createElement('section');plot.className='patent-directivity-panel';
  plot.innerHTML=`
    <div class="directivity-head"><div><span class="directivity-kicker">ANALYTICAL RELATION // US11287508B2</span><h3>Normalized dipole directivity</h3><p>The patent states a natural cos θ response relative to the mesh normal and reports an observed dipole-type directionality at 90 Hz. No measured point series is tabulated in the patent, so no measured points are invented here.</p></div><div class="directivity-live"><span>θ</span><b id="plotAngle">20°</b><span>R/Rmax</span><b id="plotResponse">+0.940</b></div></div>
    <svg id="directivitySvg" viewBox="0 0 760 300" role="img" aria-label="Analytical normalized cosine directivity from zero to 180 degrees">
      <g class="plot-grid">
        <line x1="64" y1="42" x2="64" y2="250"/><line x1="64" y1="146" x2="720" y2="146"/>
        <line x1="64" y1="42" x2="720" y2="42"/><line x1="64" y1="250" x2="720" y2="250"/>
        <line x1="228" y1="42" x2="228" y2="250"/><line x1="392" y1="42" x2="392" y2="250"/><line x1="556" y1="42" x2="556" y2="250"/><line x1="720" y1="42" x2="720" y2="250"/>
      </g>
      <g class="plot-labels">
        <text x="50" y="47">+1</text><text x="55" y="151">0</text><text x="50" y="255">−1</text>
        <text x="60" y="278">0°</text><text x="218" y="278">45°</text><text x="380" y="278">90°</text><text x="540" y="278">135°</text><text x="700" y="278">180°</text>
        <text x="392" y="297" text-anchor="middle">INCIDENCE ANGLE FROM MESH NORMAL</text>
      </g>
      <path id="directivityCurve" class="directivity-curve" d=""/>
      <line id="directivityGuide" class="directivity-guide" x1="0" y1="42" x2="0" y2="250"/>
      <circle id="directivityPoint" class="directivity-point" cx="0" cy="0" r="5"/>
      <text x="82" y="67" class="lobe-label">IN-PHASE LOBE</text><text x="570" y="232" class="lobe-label">180° PHASE-REVERSED LOBE</text>
    </svg>
    <div class="directivity-foot"><span>Curve: R/Rmax = cos θ</span><span>Negative response indicates dipole polarity / phase reversal, not negative sensitivity.</span></div>`;
  const caption=q('.sensor-cutaway-caption',physics);
  if(caption)caption.insertAdjacentElement('afterend',plot);else q('.results',physics)?.appendChild(plot);
}

const auditStyle=document.createElement('style');
auditStyle.textContent=`
.audited-reference-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:rgba(169,181,155,.18);border:1px solid rgba(169,181,155,.18);margin-bottom:18px}
.audit-readout{background:#0b0d0b;padding:16px 17px;min-height:108px}.audit-readout span,.audit-readout small{display:block;color:#8f978f;font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.audit-readout span{letter-spacing:.08em;text-transform:uppercase}.audit-readout b{display:block;color:#f0f1ec;font:600 19px/1.2 system-ui,sans-serif;margin:8px 0}.formula-boundary-note{display:flex;gap:14px;padding:12px 14px;margin:10px 0 22px;border:1px solid rgba(169,181,155,.18);background:#0b0d0b;color:#9da59c;font:10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}.formula-boundary-note b{color:#eef0ea;white-space:nowrap;letter-spacing:.08em}.patent-directivity-panel{margin-top:18px;border:1px solid rgba(169,181,155,.18);background:#080a08;padding:20px}.directivity-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.directivity-head h3{margin:5px 0 7px;font-size:22px}.directivity-head p{max-width:760px;margin:0;color:#929a91;font-size:12px;line-height:1.55}.directivity-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;color:#a9b59b}.directivity-live{display:grid;grid-template-columns:auto auto;gap:5px 12px;min-width:140px;padding:10px 12px;border:1px solid rgba(169,181,155,.18);font:10px ui-monospace,SFMono-Regular,Menlo,monospace;color:#8f978f}.directivity-live b{color:#edf0e9;font-size:13px;text-align:right}.patent-directivity-panel svg{width:100%;height:auto;display:block;margin-top:12px}.plot-grid line{stroke:#252b25;stroke-width:1}.plot-labels text,.lobe-label{fill:#7f887f;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}.directivity-curve{fill:none;stroke:#dfe4da;stroke-width:2}.directivity-guide{stroke:#a9b59b;stroke-width:1;stroke-dasharray:4 5;opacity:.55}.directivity-point{fill:#f0f1eb;stroke:#090b09;stroke-width:2}.directivity-foot{display:flex;justify-content:space-between;gap:16px;padding-top:10px;border-top:1px solid rgba(169,181,155,.13);color:#858e85;font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}
@media(max-width:900px){.audited-reference-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.directivity-head{display:block}.directivity-live{margin-top:14px;max-width:180px}}
@media(max-width:560px){.audited-reference-grid{grid-template-columns:1fr}.formula-boundary-note,.directivity-foot{display:block}.formula-boundary-note b{display:block;margin-bottom:6px}.patent-directivity-panel{padding:14px}.directivity-head h3{font-size:19px}}
`;
document.head.appendChild(auditStyle);

function xForAngle(a){return 64+(a/180)*(720-64);}
function yForResponse(r){return 146-r*104;}
function buildCurve(){
  const path=$('directivityCurve');if(!path)return;
  let d='';
  for(let a=0;a<=180;a+=2){const x=xForAngle(a),y=yForResponse(Math.cos(a*Math.PI/180));d+=(a===0?'M':'L')+x.toFixed(2)+' '+y.toFixed(2)+' ';}
  path.setAttribute('d',d.trim());
}
buildCurve();

function signed3(v){return (v>=0?'+':'')+v.toFixed(3);}
function updateDirectivity(){
  const a=+(angle?.value||0),r=Math.cos(a*Math.PI/180);
  if($('auditDirectivity'))$('auditDirectivity').textContent=signed3(r);
  if($('plotAngle'))$('plotAngle').textContent=Math.round(a)+'°';
  if($('plotResponse'))$('plotResponse').textContent=signed3(r);
  const px=xForAngle(a),py=yForResponse(r),pt=$('directivityPoint'),guide=$('directivityGuide');
  if(pt){pt.setAttribute('cx',px);pt.setAttribute('cy',py);}if(guide){guide.setAttribute('x1',px);guide.setAttribute('x2',px);}
  const at=$('angleText');if(at)at.textContent=Math.round(a);

  // Correct the cutaway to show signed normalized displacement at a fixed phase.
  // The deformation scale is deliberately arbitrary; only the sign and cos(theta)
  // relationship are meaningful.
  const originX=150,originY=232,len=105,ar=a*Math.PI/180;
  const vec=$('engFlowVector');if(vec){vec.setAttribute('x1',originX);vec.setAttribute('y1',originY);vec.setAttribute('x2',(originX+Math.cos(ar)*len).toFixed(1));vec.setAttribute('y2',(originY+Math.sin(ar)*len).toFixed(1));}
  const shift=r*6;
  const mesh=$('engMesh');if(mesh){mesh.style.transform=`translateY(${shift.toFixed(1)}px) scale(1 ${(0.76+Math.abs(r)*.018).toFixed(3)})`;mesh.style.opacity=String(.82+Math.abs(r)*.18);}
  const point=$('engDeflectPoint');if(point){point.setAttribute('cy',shift.toFixed(1));point.setAttribute('r',(3+Math.abs(r)).toFixed(1));}
  const halo=$('engDeflectHalo');if(halo){halo.setAttribute('cy',shift.toFixed(1));halo.setAttribute('ry',(18+Math.abs(r)*4).toFixed(1));halo.setAttribute('opacity',(0.18+Math.abs(r)*.28).toFixed(2));}
  const spot=$('engProbeSpot');if(spot)spot.setAttribute('cy',(48+shift*.35).toFixed(1));
  const laser=$('engLaser');if(laser)laser.setAttribute('y2',(48+shift*.35).toFixed(1));
  const av=$('engAngleValue');if(av)av.textContent=Math.round(a)+'° incidence';
  const status=$('engVisualScale');if(status)status.textContent=`R/Rmax = cos θ = ${signed3(r)} · signed normalized display only`;
}
angle?.addEventListener('input',()=>queueMicrotask(updateDirectivity));
updateDirectivity();

// ---------------------------------------------------------------------------
// Mission demonstrator: geometry only, with explicit coordinate convention.
// ---------------------------------------------------------------------------
const mission=q('.mission-shell');
if(mission){
  // Frequency references are evidence, not a response control. Keep them in the
  // Technology section and remove this nonfunctional control from the mission demo.
  $('missionFreq')?.closest('.control-group')?.remove();

  const range=$('missionRange'),bearing=$('missionBearing'),target=$('targetType'),config=$('sensorConfig');
  const rangeGroup=range?.closest('.control-group');if(rangeGroup){const l=q('label span',rangeGroup);if(l)l.textContent='Scene separation';}
  const bearingGroup=bearing?.closest('.control-group');if(bearingGroup){const l=q('label span',bearingGroup);if(l)l.textContent='Display bearing to source';}

  // Remove every range-like / performance-looking cue from the 2-D graphic.
  qa('.mission-stage svg text').forEach(t=>{if(/KM|≈2\.5|≈5\.0|≈7\.5/i.test(t.textContent||''))t.style.display='none';});
  $('bearingCone')?.setAttribute('display','none');$('scanLine')?.setAttribute('display','none');$('stageRangeLabel')?.setAttribute('display','none');
  const firstGrid=q('.mission-stage svg > g');if(firstGrid)qa('circle',firstGrid).forEach(c=>c.style.display='none');
  const legend=q('.legend',mission);if(legend)legend.innerHTML='<div><i></i> ILLUSTRATIVE WAVEFRONT ANIMATION</div><div><i class="dashed"></i> GEOMETRIC BEARING TO SOURCE</div>';

  const readout=q('.mission-readout',mission);
  if(readout)readout.innerHTML=`
    <div class="readout-block"><span>Deployment context</span><b id="auditDeployment">Floating / moored</b><small id="auditDeploymentBasis">Patent-described deployment geometry.</small></div>
    <div class="readout-block"><span>Source context</span><b id="auditSource">Generic acoustic source</b><small>Vehicle type changes the illustration only. No acoustic signature is used.</small></div>
    <div class="readout-block"><span>Geometric source bearing</span><b id="auditBearing">000°</b><small>Clockwise from north, sensor → source.</small></div>
    <div class="readout-block"><span>Incoming wave-vector east component</span><b id="auditEast">0.000</b><small>Horizontal unit-vector component derived from display bearing.</small></div>
    <div class="readout-block"><span>Incoming wave-vector north component</span><b id="auditNorth">−1.000</b><small>Horizontal unit-vector component derived from display bearing.</small></div>
    <div class="readout-block"><span>Horizontal vector norm</span><b id="auditNorm">1.000</b><small>√(east² + north²). Geometry identity, not a sensor-performance metric.</small></div>
    <div class="readout-block"><span>Scene separation</span><b id="auditSep">Mid</b><small>Normalized visual spacing only. No physical range is assigned.</small></div>
    <div class="readout-block"><span>Display boundary</span><b>Horizontal bearing slice</b><small>The patent supports 3-D reconstruction with three orthogonal meshes; this panel intentionally shows only the horizontal projection.</small></div>`;

  const mech=q('.mission-mechanics-note',mission);
  if(mech)mech.innerHTML='<b>VECTOR CONVENTION</b><span>The dashed line is the geometric bearing from sensor to source. The incoming plane-wave vector k points in the opposite horizontal direction, source to sensor. Particle velocity is oscillatory but collinear with the wave-vector axis. The signed unit-vector components below describe geometry, not instantaneous fluid velocity or measured amplitude.</span>';

  const deploymentBasis={
    floating:['Floating / moored','Floating base with one or more flow meters, retaining thread and anchor. US11287508B2.'],
    hull:['Hull / AUV mounting','Specification-described hull mounting on a submarine or AUV. US11287508B2.'],
    sonobuoy:['Sonobuoy tower','Positive-buoyancy AVS tower moored above an anchor. US11408961B2.'],
    towed:['Towed array','Neutrally buoyant AVS embodiments are expressly described for towed-array use. US11408961B2.'],
    tower:['Viscous-channel tower','Tower with differently oriented liquid-filled channels and internal flow sensors. US11408961B2.'],
    platform:['Hull / AUV mounting','Specification-described hull mounting on a submarine or AUV. US11287508B2.']
  };
  const sourceNames={surface:'Surface vessel context',submarine:'Submerged vessel context',source:'Generic acoustic source'};
  function activeDeployment(){const preset=q('.patent-demo-presets button.active',mission)?.dataset.preset;if(preset)return preset;const v=config?.value||'floating';return v==='platform'?'platform':v==='tower'?'tower':'floating';}
  function sep(){const v=+(range?.value||3.2);return v<3?'Near':v<6?'Mid':'Far';}
  function updateMissionAudit(){
    const beta=+(bearing?.value||0)*Math.PI/180;
    // Source bearing unit vector is [sin beta, cos beta] in east/north axes.
    // Incoming k is the opposite vector.
    const east=-Math.sin(beta),north=-Math.cos(beta),norm=Math.hypot(east,north);
    const mode=activeDeployment(),basis=deploymentBasis[mode]||deploymentBasis.floating;
    if($('auditDeployment'))$('auditDeployment').textContent=basis[0];if($('auditDeploymentBasis'))$('auditDeploymentBasis').textContent=basis[1];
    if($('auditSource'))$('auditSource').textContent=sourceNames[target?.value||'source']||sourceNames.source;
    if($('auditBearing'))$('auditBearing').textContent=String(Math.round(+(bearing?.value||0))).padStart(3,'0')+'°';
    if($('auditEast'))$('auditEast').textContent=signed3(east);if($('auditNorth'))$('auditNorth').textContent=signed3(north);if($('auditNorm'))$('auditNorm').textContent=norm.toFixed(3);if($('auditSep'))$('auditSep').textContent=sep();
  }
  [bearing,range,target,config].forEach(el=>{if(!el)return;el.addEventListener('input',()=>queueMicrotask(updateMissionAudit));el.addEventListener('change',()=>queueMicrotask(updateMissionAudit));});

  // Deployment presets should not silently impose arbitrary target classes or
  // bearing/range values. Preserve the user's current geometry; let the older
  // preset handler change only the patent architecture, then restore geometry.
  qa('.patent-demo-presets button',mission).forEach(btn=>btn.addEventListener('click',()=>{
    const oldBearing=bearing?.value,oldRange=range?.value;
    queueMicrotask(()=>{
      if(target){target.value='source';target.dispatchEvent(new Event('change',{bubbles:true}));}
      if(bearing&&oldBearing!=null){bearing.value=oldBearing;bearing.dispatchEvent(new Event('input',{bubbles:true}));}
      if(range&&oldRange!=null){range.value=oldRange;range.dispatchEvent(new Event('input',{bubbles:true}));}
      updateMissionAudit();
    });
  },true));
  updateMissionAudit();
}

// Lightweight internal sanity checks. These never display as performance data.
const eps=1e-12;
console.assert(Math.abs(Math.cos(0)-1)<eps,'RHKEARTH audit: cos(0)');
console.assert(Math.abs(Math.cos(Math.PI/2))<eps,'RHKEARTH audit: cos(90)');
console.assert(Math.abs(Math.cos(Math.PI)+1)<eps,'RHKEARTH audit: cos(180)');
for(const deg of [0,42,90,218,305]){const b=deg*Math.PI/180,e=-Math.sin(b),n=-Math.cos(b);console.assert(Math.abs(Math.hypot(e,n)-1)<1e-12,'RHKEARTH audit: unit-vector norm');}
})();