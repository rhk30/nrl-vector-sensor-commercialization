(()=>{'use strict';
const physics=document.getElementById('physics');
const anchor=physics?.querySelector('.patent-directivity-panel');
if(!physics||!anchor)return;

const panel=document.createElement('section');
panel.className='vector-reconstruction-panel';
panel.innerHTML=`
  <div class="vr-head">
    <div>
      <span class="vr-kicker">3-AXIS GEOMETRY // US11287508B2</span>
      <h3>Orthogonal vector reconstruction</h3>
      <p>The patent states that three co-located orthogonal mesh transducers can reconstruct the sound-wave vector in 3-D. This demonstrator applies that statement as pure direction-cosine geometry. It does not model amplitude, calibration, noise, or bearing error.</p>
    </div>
    <div class="vr-norm"><span>VECTOR NORM</span><b id="vrNorm">1.000000</b><small>√(E² + N² + U²)</small></div>
  </div>
  <div class="vr-grid">
    <div class="vr-controls">
      <label><span>Source bearing β</span><strong id="vrAzText">45°</strong></label>
      <input id="vrAz" type="range" min="0" max="359" step="1" value="45">
      <small>Display convention: clockwise from north.</small>
      <label><span>Source elevation ε</span><strong id="vrElText">0°</strong></label>
      <input id="vrEl" type="range" min="-90" max="90" step="1" value="0">
      <small>Display convention: positive above the horizontal plane.</small>
      <div class="vr-formula"><b>Incoming unit wave vector</b><code>k̂ = −[cos ε sin β, cos ε cos β, sin ε]</code><small>East, north, up coordinate convention chosen only for this visualization.</small></div>
    </div>
    <div class="vr-results">
      <div class="vr-axis-row"><span>East-normal mesh</span><div class="vr-track"><i class="vr-zero"></i><b id="vrEastBar"></b></div><strong id="vrEast">−0.707</strong><small>k̂ · n̂E = cos θE</small></div>
      <div class="vr-axis-row"><span>North-normal mesh</span><div class="vr-track"><i class="vr-zero"></i><b id="vrNorthBar"></b></div><strong id="vrNorth">−0.707</strong><small>k̂ · n̂N = cos θN</small></div>
      <div class="vr-axis-row"><span>Up-normal mesh</span><div class="vr-track"><i class="vr-zero"></i><b id="vrUpBar"></b></div><strong id="vrUp">0.000</strong><small>k̂ · n̂U = cos θU</small></div>
      <div class="vr-check"><span>Reconstructed source bearing</span><b id="vrBearingCheck">045°</b><span>Reconstructed source elevation</span><b id="vrElevationCheck">0°</b></div>
    </div>
  </div>
  <div class="vr-foot"><span>Each channel is normalized to its own peak response.</span><span>Signed outputs preserve dipole polarity. A real instrument would additionally require calibration, phase convention, alignment knowledge, and measured noise/error characterization.</span></div>`;
anchor.insertAdjacentElement('afterend',panel);

const style=document.createElement('style');
style.textContent=`
.vector-reconstruction-panel{margin-top:18px;border:1px solid rgba(169,181,155,.18);background:#080a08;padding:20px}.vr-head{display:flex;justify-content:space-between;gap:24px}.vr-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;color:#a9b59b}.vr-head h3{margin:5px 0 7px;font-size:22px}.vr-head p{max-width:790px;margin:0;color:#929a91;font-size:12px;line-height:1.55}.vr-norm{min-width:170px;padding:11px 13px;border:1px solid rgba(169,181,155,.18);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.vr-norm span,.vr-norm small{display:block;font-size:9px;color:#858e85}.vr-norm b{display:block;margin:7px 0;color:#eef0ea;font-size:15px}.vr-grid{display:grid;grid-template-columns:minmax(210px,.72fr) minmax(0,1.28fr);gap:24px;margin-top:20px}.vr-controls label{display:flex;justify-content:space-between;gap:12px;color:#b8beb6;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:13px}.vr-controls label:first-child{margin-top:0}.vr-controls input{width:100%;margin:8px 0 4px}.vr-controls>small{display:block;color:#737c73;font:9px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}.vr-formula{margin-top:18px;padding:12px;border:1px solid rgba(169,181,155,.15);background:#0b0d0b}.vr-formula b,.vr-formula code,.vr-formula small{display:block}.vr-formula b{color:#aeb6ac;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}.vr-formula code{color:#eef0ea;font:13px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;margin:8px 0}.vr-formula small{color:#737c73;font:9px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.vr-results{border-left:1px solid rgba(169,181,155,.14);padding-left:22px}.vr-axis-row{display:grid;grid-template-columns:150px minmax(180px,1fr) 72px;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(169,181,155,.10)}.vr-axis-row>span{color:#aeb6ad;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}.vr-axis-row>strong{color:#eef0e9;font:12px ui-monospace,SFMono-Regular,Menlo,monospace;text-align:right}.vr-axis-row>small{grid-column:2/4;color:#6f776f;font:9px ui-monospace,SFMono-Regular,Menlo,monospace}.vr-track{position:relative;height:14px;background:#111411;border:1px solid #292e29;overflow:hidden}.vr-zero{position:absolute;left:50%;top:0;bottom:0;width:1px;background:#596159;z-index:2}.vr-track b{position:absolute;top:2px;bottom:2px;background:#cdd4c9}.vr-check{display:grid;grid-template-columns:1fr auto;gap:7px 14px;margin-top:16px;padding:12px;background:#0b0d0b;border:1px solid rgba(169,181,155,.12);font:10px ui-monospace,SFMono-Regular,Menlo,monospace;color:#858e85}.vr-check b{color:#edf0e9;text-align:right}.vr-foot{display:flex;justify-content:space-between;gap:20px;margin-top:17px;padding-top:10px;border-top:1px solid rgba(169,181,155,.12);color:#7d857d;font:9px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.vr-foot span:last-child{max-width:620px;text-align:right}
@media(max-width:850px){.vr-head{display:block}.vr-norm{margin-top:14px;max-width:190px}.vr-grid{grid-template-columns:1fr}.vr-results{border-left:0;padding-left:0;border-top:1px solid rgba(169,181,155,.14);padding-top:10px}}
@media(max-width:560px){.vector-reconstruction-panel{padding:14px}.vr-axis-row{grid-template-columns:1fr 62px}.vr-axis-row .vr-track{grid-column:1/3}.vr-axis-row>small{grid-column:1/3}.vr-foot{display:block}.vr-foot span{display:block}.vr-foot span:last-child{text-align:left;margin-top:6px}}
`;
document.head.appendChild(style);

const az=document.getElementById('vrAz'),el=document.getElementById('vrEl');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const signed=v=>(v>=0?'+':'')+v.toFixed(3);
function setBar(id,v){const b=document.getElementById(id);if(!b)return;const mag=clamp(Math.abs(v),0,1)*50;b.style.width=mag+'%';b.style.left=v>=0?'50%':(50-mag)+'%';}
function wrap360(d){return ((d%360)+360)%360;}
function update(){
  const beta=(+az.value)*Math.PI/180,eps=(+el.value)*Math.PI/180;
  const east=-Math.cos(eps)*Math.sin(beta);
  const north=-Math.cos(eps)*Math.cos(beta);
  const up=-Math.sin(eps);
  const norm=Math.hypot(east,north,up);
  document.getElementById('vrAzText').textContent=Math.round(+az.value)+'°';
  document.getElementById('vrElText').textContent=Math.round(+el.value)+'°';
  document.getElementById('vrEast').textContent=signed(east);document.getElementById('vrNorth').textContent=signed(north);document.getElementById('vrUp').textContent=signed(up);document.getElementById('vrNorm').textContent=norm.toFixed(6);
  setBar('vrEastBar',east);setBar('vrNorthBar',north);setBar('vrUpBar',up);
  // Reconstruct source direction from k = -s using atan2(East,North).
  const srcE=-east,srcN=-north,srcU=-up;
  let bearingDeg=wrap360(Math.atan2(srcE,srcN)*180/Math.PI);
  const elevationDeg=Math.atan2(srcU,Math.hypot(srcE,srcN))*180/Math.PI;
  // At exactly vertical incidence bearing is undefined; say so instead of inventing one.
  document.getElementById('vrBearingCheck').textContent=Math.hypot(srcE,srcN)<1e-9?'undefined':String(Math.round(bearingDeg)).padStart(3,'0')+'°';
  document.getElementById('vrElevationCheck').textContent=(elevationDeg>=0?'+':'')+Math.round(elevationDeg)+'°';
}
az.addEventListener('input',update);el.addEventListener('input',update);update();

// Mathematical invariants for the coordinate transform.
for(const [b,e] of [[0,0],[45,0],[90,0],[180,0],[315,30],[120,-45],[0,90],[0,-90]]){
  const br=b*Math.PI/180,er=e*Math.PI/180,E=-Math.cos(er)*Math.sin(br),N=-Math.cos(er)*Math.cos(br),U=-Math.sin(er);
  console.assert(Math.abs(Math.hypot(E,N,U)-1)<1e-12,'RHKEARTH audit: orthogonal unit-vector reconstruction');
}
})();