(()=>{'use strict';
const physics=document.getElementById('physics');
if(!physics||physics.querySelector('.sensor-directivity-unified'))return;
const q=(s,r=physics)=>r.querySelector(s);
const angle=document.getElementById('angle');
const angleControl=angle?.closest('.control');
const geometry=q('.patent-geometry-strip');
const cutaway=q('.sensor-engineering');
const caption=q('.sensor-cutaway-caption');
const plot=q('.patent-directivity-panel');
const readouts=q('.audited-reference-grid');
const results=q('.results');
if(!angle||!angleControl||!cutaway||!plot||!results)return;

// Remove technical material that is valid but not necessary for the public story.
// The site should explain the disclosed sensor, not behave like an academic appendix.
q('.vector-reconstruction-panel')?.remove();
physics.querySelectorAll('.exhibit-purpose,.expert-audit,.formula-boundary-note').forEach(el=>el.remove());
q('.formulas')?.remove();

// Find and collapse the legacy control rail. The angle control is moved into the
// integrated exhibit first so its existing listeners continue to work.
const layout=results.parentElement;
let sidebar=null;
if(layout&&layout!==physics){sidebar=Array.from(layout.children).find(el=>el!==results&&el.contains(angle))||null;}

const unified=document.createElement('section');
unified.className='sensor-directivity-unified';
unified.innerHTML=`
  <div class="sdu-head">
    <div>
      <span class="sdu-kicker">US11287508B2 // SENSOR DIRECTIVITY</span>
      <h3>One control connects the physical mesh to its directional response.</h3>
      <p>Change the incidence angle relative to the mesh normal. The cutaway shows the same orientation while the graph shows the patent-described signed cosine response.</p>
    </div>
    <div class="sdu-live"><span>NORMALIZED RESPONSE</span><b id="sduResponse">+0.940</b><small>R / Rmax = cos θ</small></div>
  </div>
  <div class="sdu-main">
    <aside class="sdu-control">
      <div class="sdu-angle-slot"></div>
      <div class="sdu-geometry-slot"></div>
      <div class="sdu-note"><b>PATENT BOUNDARY</b><span>The angle control changes normalized directivity only. It does not predict sensitivity, range, SNR, bearing error or underwater performance.</span></div>
    </aside>
    <div class="sdu-cutaway-slot"></div>
  </div>
  <div class="sdu-facts-slot"></div>
  <div class="sdu-plot-slot"></div>
  <div class="sdu-three">
    <div><span class="sdu-kicker">WHY MULTIPLE MESHES MATTER</span><h4>One mesh measures one signed projection. Orthogonal meshes provide independent directional components.</h4></div>
    <p>US11287508B2 states that three co-located orthogonal mesh transducers can reconstruct the sound-wave vector in 3-D. That is the system-level reason the cosine response matters. No separate 3-D calculator is needed here.</p>
  </div>`;

cutaway.insertAdjacentElement('beforebegin',unified);
unified.querySelector('.sdu-angle-slot').appendChild(angleControl);
if(geometry)unified.querySelector('.sdu-geometry-slot').appendChild(geometry);
unified.querySelector('.sdu-cutaway-slot').appendChild(cutaway);
if(caption)unified.querySelector('.sdu-cutaway-slot').appendChild(caption);
if(readouts)unified.querySelector('.sdu-facts-slot').appendChild(readouts);
unified.querySelector('.sdu-plot-slot').appendChild(plot);

if(sidebar)sidebar.style.display='none';
if(layout){layout.style.display='block';layout.style.gridTemplateColumns='1fr';}
results.style.width='100%';results.style.maxWidth='none';

// Strip repeated explanatory copy now that the whole relationship has one header.
const plotHead=plot.querySelector('.directivity-head');
if(plotHead){
  const title=plotHead.querySelector('h3');if(title)title.textContent='Signed cosine response';
  const p=plotHead.querySelector('p');if(p)p.textContent='Analytical relation stated by the patent. The patent reports dipole-type directionality at 90 Hz but does not tabulate a measured point series, so no measured points are invented.';
}

const style=document.createElement('style');
style.textContent=`
.sensor-directivity-unified{border:1px solid rgba(169,181,155,.18);background:#080a08;overflow:hidden;margin:0 0 24px}.sdu-head{display:flex;justify-content:space-between;gap:26px;align-items:flex-start;padding:20px 22px;border-bottom:1px solid rgba(169,181,155,.14)}.sdu-kicker{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:#a9b59b}.sdu-head h3{margin:6px 0 8px;font-size:23px;line-height:1.07;letter-spacing:-.025em}.sdu-head p{margin:0;max-width:760px;color:#929a91;font-size:11px;line-height:1.55}.sdu-live{min-width:160px;padding:10px 12px;border:1px solid rgba(169,181,155,.16);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.sdu-live span,.sdu-live small{display:block;font-size:9px;color:#7d867d}.sdu-live b{display:block;margin:7px 0;color:#edf0e9;font-size:18px}.sdu-main{display:grid;grid-template-columns:250px minmax(0,1fr);border-bottom:1px solid rgba(169,181,155,.14)}.sdu-control{padding:20px;border-right:1px solid rgba(169,181,155,.14);background:#090b09}.sdu-control .control{margin:0!important;padding:0 0 18px!important}.sdu-control .control label{margin-bottom:10px!important}.sdu-geometry-slot{margin-top:2px}.sdu-geometry-slot .patent-geometry-strip{grid-template-columns:1fr!important;margin:0!important;border-top:1px solid rgba(169,181,155,.13)!important}.sdu-geometry-slot .patent-geometry-strip>div{padding:12px 0!important;border-right:0!important;border-bottom:1px solid rgba(169,181,155,.10)!important}.sdu-note{margin-top:16px;padding-top:14px;border-top:1px solid rgba(169,181,155,.13)}.sdu-note b,.sdu-note span{display:block}.sdu-note b{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;color:#a9b59b}.sdu-note span{margin-top:7px;color:#7f887f;font-size:9px;line-height:1.5}.sdu-cutaway-slot{padding:8px 12px 0;min-width:0}.sdu-cutaway-slot .sensor-engineering{margin:0!important;border:0!important}.sdu-cutaway-slot .sensor-cutaway-caption{margin:0!important;padding:12px 12px 15px!important;border-top:1px solid rgba(169,181,155,.10)!important}.sdu-facts-slot{padding:0 14px 14px}.sdu-facts-slot .audited-reference-grid{margin:0!important;grid-template-columns:repeat(4,minmax(0,1fr))!important}.sdu-plot-slot{padding:0 14px 14px}.sdu-plot-slot .patent-directivity-panel{margin:0!important;border-color:rgba(169,181,155,.14)!important}.sdu-three{display:grid;grid-template-columns:minmax(260px,.8fr) minmax(0,1.2fr);gap:28px;padding:18px 22px;border-top:1px solid rgba(169,181,155,.14);align-items:start}.sdu-three h4{font-size:17px;line-height:1.15;margin:6px 0 0;max-width:520px}.sdu-three p{margin:0;color:#858e85;font-size:10px;line-height:1.55;max-width:700px}
@media(max-width:900px){.sdu-main{grid-template-columns:1fr}.sdu-control{border-right:0;border-bottom:1px solid rgba(169,181,155,.14)}.sdu-geometry-slot .patent-geometry-strip{grid-template-columns:repeat(3,1fr)!important}.sdu-facts-slot .audited-reference-grid{grid-template-columns:repeat(2,1fr)!important}.sdu-three{grid-template-columns:1fr}.sdu-head{display:block}.sdu-live{margin-top:14px;max-width:180px}}
@media(max-width:560px){.sdu-head,.sdu-control{padding:15px}.sdu-head h3{font-size:20px}.sdu-geometry-slot .patent-geometry-strip,.sdu-facts-slot .audited-reference-grid{grid-template-columns:1fr!important}.sdu-plot-slot,.sdu-facts-slot{padding-left:8px;padding-right:8px}.sdu-three{padding:15px}}
`;
document.head.appendChild(style);

function signed(v){return (v>=0?'+':'')+v.toFixed(3);}
function update(){const a=+(angle.value||0),r=Math.cos(a*Math.PI/180);const out=document.getElementById('sduResponse');if(out)out.textContent=signed(r);}
angle.addEventListener('input',update);update();
})();