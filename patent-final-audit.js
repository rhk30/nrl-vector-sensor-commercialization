(()=>{'use strict';
const $=id=>document.getElementById(id),q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

// Source-grounded values. Measured prototype facts, estimates and projections are
// labeled separately in the rendered copy; none is a RHKEARTH product specification.
const P=Object.freeze({prototypeODmm:6,separationUm:20,totalFiberM:2.7,filamentWidthUm:3.6,filamentThicknessUm:1,mirrorAlNm:30,fundamentalHz:530,responsivityTestHz:90,responsivityNmPerPaLowerBound:20,interferometerNoisePmPerRootHz:2,mdpAirMicroPaPerRootHz:100,projectedWaterResponsivityNmPerPa:.3,projectedWaterMdpDb:76,floatingBaseRadiusMmAt10Hz:10,fig4PressureAirMicroPa:100,fig4FlowVelocityAirUmPerS:.24,fig1FlowMetersShown:4});
window.RHKEARTH_PATENT_DATA=P;

// Landing summary: only unambiguous source-grounded facts.
const metrics=qa('.metrics .metric');
const metricData=[['NRL patents evaluated','02','No ownership or license claimed'],['Prototype mesh OD','6 mm','Spider-web prototype reported in US11287508B2'],['Prototype total fiber','≈2.7 m','Reported for the 6 mm spider-web geometry'],['Prototype fundamental','530 Hz','Reported for the first mesh prototype']];
metrics.forEach((m,i)=>{const d=metricData[i];if(!d)return;const l=q('.label',m),v=q('.value',m),s=q('.sub',m);if(l)l.textContent=d[0];if(v)v.textContent=d[1];if(s)s.textContent=d[2];});

const factGrid=q('.patent-fact-grid');
if(factGrid)factGrid.innerHTML=`
  <div><b>${P.prototypeODmm} mm</b><span>outer diameter of the reported spider-web prototype</span></div>
  <div><b>${P.separationUm} μm</b><span>released-web filament / beam separation reported for the prototype</span></div>
  <div><b>≈${P.totalFiberM} m</b><span>total fiber length reported for the 6 mm spider-web geometry</span></div>
  <div><b>${P.filamentWidthUm} μm × ${P.filamentThicknessUm} μm</b><span>prototype filament cross-section</span></div>
  <div><b>${P.mirrorAlNm} nm Al</b><span>aluminum film used on the prototype center mirror</span></div>
  <div><b>&gt;${P.responsivityNmPerPaLowerBound} nm/Pa @ ${P.responsivityTestHz} Hz</b><span>peak responsivity reported in the in-air prototype evaluation</span></div>
  <div><b>${P.fundamentalHz} Hz</b><span>fundamental frequency reported for the first mesh prototype</span></div>
  <div><b>≈${P.interferometerNoisePmPerRootHz} pm/√Hz</b><span>interferometer displacement-noise spectral density used in the MDP estimate</span></div>
  <div><b>≈${P.mdpAirMicroPaPerRootHz} μPa/√Hz</b><span>estimated air minimum-detectable-pressure spectral density; not a broadband threshold</span></div>
  <div><b>≈${P.projectedWaterMdpDb} dB re 1 μPa/√Hz</b><span>projected equivalent water pressure spectral density; not in-water validation</span></div>
  <div><b>≈${P.floatingBaseRadiusMmAt10Hz} mm radius @ 10 Hz</b><span>floating-base size estimate stated for operation in the 10 Hz range</span></div>
  <div><b>${P.fig4PressureAirMicroPa} μPa → ${P.fig4FlowVelocityAirUmPerS} μm/s</b><span>air pressure / particle-velocity condition stated for FIG. 4</span></div>`;

const physics=$('physics'),angle=$('angle');
if(!physics||!angle)return;
angle.min='0';angle.max='180';angle.step='1';if(+angle.value<0||+angle.value>180)angle.value='20';
q('.patent-reference-control',physics)?.remove();
const legacyReadouts=q('.readouts',physics);if(legacyReadouts){legacyReadouts.style.display='none';legacyReadouts.setAttribute('aria-hidden','true');}
const legacyInterp=$('modelInterpretation');if(legacyInterp){legacyInterp.style.display='none';legacyInterp.setAttribute('aria-hidden','true');}

let auditReadouts=q('.audited-reference-grid',physics);
if(!auditReadouts){auditReadouts=document.createElement('div');auditReadouts.className='audited-reference-grid';const results=q('.results',physics);results?.insertBefore(auditReadouts,results.firstChild);}
auditReadouts.innerHTML=`
  <div class="audit-readout"><span>Normalized signed response</span><b id="auditDirectivity">+0.940</b><small>Analytical R/Rmax = cos θ. Negative sign denotes the opposite dipole phase.</small></div>
  <div class="audit-readout"><span>In-air peak responsivity</span><b>&gt;${P.responsivityNmPerPaLowerBound} nm/Pa @ ${P.responsivityTestHz} Hz</b><small>Reported prototype measurement; not underwater sensitivity.</small></div>
  <div class="audit-readout"><span>Prototype fundamental</span><b>${P.fundamentalHz} Hz</b><small>Reported for the first mesh prototype.</small></div>
  <div class="audit-readout"><span>Estimated air MDP spectral density</span><b>≈${P.mdpAirMicroPaPerRootHz} μPa/√Hz</b><small>Estimate from ≈${P.interferometerNoisePmPerRootHz} pm/√Hz displacement noise and ≈${P.responsivityNmPerPaLowerBound} nm/Pa in-air responsivity.</small></div>`;

const formulas=qa('.formula',physics),formulaData=[['Normalized mesh directivity','R / Rmax = cos θ','θ is measured from the mesh normal; the sign is part of the dipole response.'],['Ideal square-mesh fiber length','L_fiber = 2L² / d','Patent scaling relation for an ideal square L × L mesh with spacing d.'],['Ideal square-mesh length gain','L_fiber / L = 2L / d','Patent-stated gain relative to one cantilever of length L.']];
formulas.forEach((f,i)=>{const d=formulaData[i];if(d)f.innerHTML=`<b>${d[0]}</b><code>${d[1]}</code><small>${d[2]}</small>`;});
let formulaBoundary=q('.formula-boundary-note',physics);
if(!formulaBoundary){formulaBoundary=document.createElement('div');formulaBoundary.className='formula-boundary-note';q('.formulas',physics)?.insertAdjacentElement('afterend',formulaBoundary);}
if(formulaBoundary)formulaBoundary.innerHTML='<b>GEOMETRY BOUNDARY</b><span>The 2L²/d relation is for an ideal square mesh. The reported ≈2.7 m fiber length belongs to the separate 6 mm OD truncated spider-web prototype and is not back-calculated from the square-mesh equation.</span>';

let plot=q('.patent-directivity-panel',physics);
if(!plot){plot=document.createElement('section');plot.className='patent-directivity-panel';const caption=q('.sensor-cutaway-caption',physics);if(caption)caption.insertAdjacentElement('afterend',plot);else q('.results',physics)?.appendChild(plot);}
plot.innerHTML=`
  <div class="directivity-head"><div><span class="directivity-kicker">ANALYTICAL RELATION // US11287508B2</span><h3>Normalized cosine directivity</h3><p>The source states a natural cos θ response relative to the mesh normal and reports dipole-type directionality at 90 Hz. No measured point series is tabulated here, so the curve is analytical rather than reconstructed test data.</p></div><div class="directivity-live"><span>θ</span><b id="plotAngle">20°</b><span>R/Rmax</span><b id="plotResponse">+0.940</b></div></div>
  <svg id="directivitySvg" viewBox="0 0 760 300" role="img" aria-label="Analytical normalized cosine directivity from zero to 180 degrees">
    <g class="plot-grid"><line x1="64" y1="42" x2="64" y2="250"/><line x1="64" y1="146" x2="720" y2="146"/><line x1="64" y1="42" x2="720" y2="42"/><line x1="64" y1="250" x2="720" y2="250"/><line x1="228" y1="42" x2="228" y2="250"/><line x1="392" y1="42" x2="392" y2="250"/><line x1="556" y1="42" x2="556" y2="250"/><line x1="720" y1="42" x2="720" y2="250"/></g>
    <g class="plot-labels"><text x="50" y="47">+1</text><text x="55" y="151">0</text><text x="50" y="255">−1</text><text x="60" y="278">0°</text><text x="218" y="278">45°</text><text x="380" y="278">90°</text><text x="540" y="278">135°</text><text x="700" y="278">180°</text><text x="392" y="297" text-anchor="middle">INCIDENCE ANGLE FROM MESH NORMAL</text></g>
    <path id="directivityCurve" class="directivity-curve" d=""/><line id="directivityGuide" class="directivity-guide" x1="0" y1="42" x2="0" y2="250"/><circle id="directivityPoint" class="directivity-point" cx="0" cy="0" r="5"/><text x="82" y="67" class="lobe-label">IN-PHASE LOBE</text><text x="570" y="232" class="lobe-label">180° PHASE-REVERSED LOBE</text>
  </svg>
  <div class="directivity-foot"><span>Curve: R/Rmax = cos θ</span><span>Negative response indicates dipole polarity / phase reversal, not negative sensitivity.</span></div>`;

const xForAngle=a=>64+(Math.max(0,Math.min(180,a))/180)*(720-64),yForResponse=r=>146-r*104,signed=v=>(Math.abs(v)<5e-4?'+0.000':(v>=0?'+':'')+v.toFixed(3));
function buildCurve(){let d='';for(let a=0;a<=180;a+=2){const x=xForAngle(a),y=yForResponse(Math.cos(a*Math.PI/180));d+=(a?' L ':'M ')+x.toFixed(2)+' '+y.toFixed(2);}const path=$('directivityCurve');if(path)path.setAttribute('d',d);}
function updateDirectivity(){const a=+angle.value,r=Math.cos(a*Math.PI/180),x=xForAngle(a),y=yForResponse(r);if($('auditDirectivity'))$('auditDirectivity').textContent=signed(r);if($('plotAngle'))$('plotAngle').textContent=Math.round(a)+'°';if($('plotResponse'))$('plotResponse').textContent=signed(r);const pt=$('directivityPoint'),guide=$('directivityGuide');if(pt){pt.setAttribute('cx',x);pt.setAttribute('cy',y);}if(guide){guide.setAttribute('x1',x);guide.setAttribute('x2',x);}if($('angleText'))$('angleText').textContent=Math.round(a);}
buildCurve();angle.addEventListener('input',()=>queueMicrotask(updateDirectivity));updateDirectivity();

const style=document.createElement('style');style.textContent=`.audited-reference-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:rgba(169,181,155,.18);border:1px solid rgba(169,181,155,.18);margin-bottom:18px}.audit-readout{background:#0b0d0b;padding:16px 17px;min-height:108px}.audit-readout span,.audit-readout small{display:block;color:#8f978f;font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.audit-readout span{letter-spacing:.08em;text-transform:uppercase}.audit-readout b{display:block;color:#f0f1ec;font:600 19px/1.2 system-ui,sans-serif;margin:8px 0}.formula-boundary-note{display:flex;gap:14px;padding:12px 14px;margin:10px 0 22px;border:1px solid rgba(169,181,155,.18);background:#0b0d0b;color:#9da59c;font:10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}.formula-boundary-note b{color:#eef0ea;white-space:nowrap}.patent-directivity-panel{margin-top:18px;border:1px solid rgba(169,181,155,.18);background:#080a08;padding:20px}.directivity-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.directivity-head h3{margin:5px 0 7px;font-size:22px}.directivity-head p{max-width:760px;margin:0;color:#929a91;font-size:12px;line-height:1.55}.directivity-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;color:#a9b59b}.directivity-live{display:grid;grid-template-columns:auto auto;gap:5px 12px;min-width:140px;padding:10px 12px;border:1px solid rgba(169,181,155,.18);font:10px ui-monospace,SFMono-Regular,Menlo,monospace;color:#8f978f}.directivity-live b{color:#edf0e9;font-size:13px;text-align:right}.patent-directivity-panel svg{width:100%;height:auto;display:block;margin-top:12px}.plot-grid line{stroke:#252b25;stroke-width:1}.plot-labels text,.lobe-label{fill:#7f887f;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}.directivity-curve{fill:none;stroke:#dfe4da;stroke-width:2}.directivity-guide{stroke:#a9b59b;stroke-width:1;stroke-dasharray:4 5;opacity:.55}.directivity-point{fill:#f0f1eb;stroke:#090b09;stroke-width:2}.directivity-foot{display:flex;justify-content:space-between;gap:16px;padding-top:10px;border-top:1px solid rgba(169,181,155,.13);color:#858e85;font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}@media(max-width:900px){.audited-reference-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.directivity-head{display:block}.directivity-live{margin-top:14px;max-width:180px}}@media(max-width:560px){.audited-reference-grid{grid-template-columns:1fr}.formula-boundary-note,.directivity-foot{display:block}.formula-boundary-note b{display:block;margin-bottom:6px}.patent-directivity-panel{padding:14px}}`;document.head.appendChild(style);

// Arithmetic / dimensional sanity checks only; these do not create performance claims.
const eps=1e-10,cos20=Math.cos(20*Math.PI/180),airMdp=(P.interferometerNoisePmPerRootHz*1e-12)/(P.responsivityNmPerPaLowerBound*1e-9),waterMdp=(P.interferometerNoisePmPerRootHz*1e-12)/(P.projectedWaterResponsivityNmPerPa*1e-9),waterDb=20*Math.log10(waterMdp/1e-6);
console.assert(Math.abs(cos20-.9396926207859084)<eps,'RHKEARTH audit: cos20');
console.assert(Math.abs(airMdp-100e-6)<1e-12,'RHKEARTH audit: air MDP unit');
console.assert(Math.abs(waterDb-76.47817481888637)<1e-9,'RHKEARTH audit: projected water MDP');
})();
