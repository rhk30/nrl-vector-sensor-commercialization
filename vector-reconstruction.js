(()=>{'use strict';
const physics=document.getElementById('physics');
const anchor=physics?.querySelector('.patent-directivity-panel');
if(!physics||!anchor)return;

const card=document.createElement('section');
card.className='vector-extension-card';
card.innerHTML=`
  <div class="vec-copy">
    <span class="vec-kicker">WHY THREE MESHES MATTER // US11287508B2</span>
    <h3>One mesh measures a projection. Three orthogonal meshes resolve direction.</h3>
    <p>The cosine plot above describes a single mesh. The patent then states that three co-located orthogonal mesh transducers can reconstruct the sound-wave vector in 3-D. Each mesh supplies one signed directional projection; together those three projections define the incoming unit vector.</p>
    <div class="vec-formula"><code>k̂ = [Rₓ, Rᵧ, R_z] / √(Rₓ² + Rᵧ² + R_z²)</code><span>Normalized geometry only. A real instrument still requires calibration, alignment, phase convention and measured error characterization.</span></div>
  </div>
  <div class="vec-visual" aria-label="Animated three-axis vector projection explanation">
    <svg viewBox="0 0 520 310" role="img" aria-label="Three orthogonal mesh projections reconstructing an incoming unit vector">
      <defs><marker id="vecArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#dce2d8"/></marker></defs>
      <circle cx="250" cy="153" r="108" class="vec-ring"/>
      <circle cx="250" cy="153" r="72" class="vec-ring inner"/>
      <line x1="250" y1="153" x2="398" y2="153" class="vec-axis"/><text x="409" y="157" class="vec-label">X</text>
      <line x1="250" y1="153" x2="250" y2="42" class="vec-axis"/><text x="245" y="30" class="vec-label">Z</text>
      <line x1="250" y1="153" x2="158" y2="245" class="vec-axis"/><text x="143" y="259" class="vec-label">Y</text>
      <line id="vecIncoming" x1="250" y1="153" x2="340" y2="78" class="vec-incoming" marker-end="url(#vecArrow)"/>
      <circle id="vecTip" cx="340" cy="78" r="5" class="vec-tip"/>
      <line id="vecProjX" x1="250" y1="153" x2="340" y2="153" class="vec-proj"/>
      <line id="vecProjZ" x1="340" y1="153" x2="340" y2="78" class="vec-proj"/>
      <g transform="translate(22 56)"><text class="vec-small">SIGNED NORMALIZED CHANNELS</text><text id="vecRx" y="28" class="vec-value">Rₓ +0.707</text><text id="vecRy" y="50" class="vec-value">Rᵧ -0.354</text><text id="vecRz" y="72" class="vec-value">R_z +0.612</text></g>
      <g transform="translate(338 225)"><text class="vec-small">VECTOR NORM</text><text id="vecNorm" y="28" class="vec-value big">1.000</text></g>
    </svg>
    <div class="vec-caption">Animation is a unit-vector geometry example, not a measured NRL data trace.</div>
  </div>`;
anchor.insertAdjacentElement('afterend',card);

const style=document.createElement('style');
style.textContent=`
.vector-extension-card{display:grid;grid-template-columns:minmax(280px,.82fr) minmax(0,1.18fr);gap:1px;margin-top:18px;border:1px solid rgba(169,181,155,.16);background:rgba(169,181,155,.13)}.vec-copy,.vec-visual{background:#080a08}.vec-copy{padding:24px 22px;display:flex;flex-direction:column;justify-content:center}.vec-kicker{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;color:#a9b59b}.vec-copy h3{font-size:21px;line-height:1.12;margin:7px 0 10px}.vec-copy p{margin:0;color:#8e978e;font-size:10px;line-height:1.58}.vec-formula{margin-top:18px;padding-top:13px;border-top:1px solid rgba(169,181,155,.14)}.vec-formula code,.vec-formula span{display:block}.vec-formula code{color:#e7ebe3;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}.vec-formula span{margin-top:7px;color:#747d74;font:9px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.vec-visual{padding:12px 14px 10px;display:flex;flex-direction:column;justify-content:center}.vec-visual svg{width:100%;height:auto;display:block}.vec-ring{fill:none;stroke:#252b25;stroke-width:1}.vec-ring.inner{opacity:.55}.vec-axis{stroke:#596159;stroke-width:1}.vec-incoming{stroke:#e0e5dc;stroke-width:1.7}.vec-proj{stroke:#8f998c;stroke-width:1;stroke-dasharray:4 5}.vec-tip{fill:#eef1ea}.vec-label,.vec-small,.vec-value{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.vec-label{fill:#9ca69a;font-size:10px}.vec-small{fill:#727b72;font-size:8px}.vec-value{fill:#cfd6cb;font-size:10px}.vec-value.big{font-size:15px}.vec-caption{padding:8px 4px 0;border-top:1px solid rgba(169,181,155,.10);color:#747d74;font:8px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;text-align:right}@media(max-width:820px){.vector-extension-card{grid-template-columns:1fr}.vec-copy{padding:18px}.vec-visual{padding:8px 10px}}
`;
document.head.appendChild(style);

const rx=document.getElementById('vecRx'),ry=document.getElementById('vecRy'),rz=document.getElementById('vecRz'),normEl=document.getElementById('vecNorm'),line=document.getElementById('vecIncoming'),tip=document.getElementById('vecTip'),px=document.getElementById('vecProjX'),pz=document.getElementById('vecProjZ');
const signed=v=>(v>=0?'+':'')+v.toFixed(3);
const start=performance.now();
function animate(now){
  const t=(now-start)/1000;
  const beta=.65+Math.sin(t*.22)*.8;
  const elev=.38+Math.sin(t*.16+.9)*.34;
  const X=Math.cos(elev)*Math.cos(beta),Y=Math.cos(elev)*Math.sin(beta),Z=Math.sin(elev),norm=Math.hypot(X,Y,Z);
  if(rx)rx.textContent='Rₓ '+signed(X);if(ry)ry.textContent='Rᵧ '+signed(Y);if(rz)rz.textContent='R_z '+signed(Z);if(normEl)normEl.textContent=norm.toFixed(3);
  const ox=250,oy=153,s=116,tx=ox+X*s,ty=oy-Z*s;
  line?.setAttribute('x2',tx.toFixed(1));line?.setAttribute('y2',ty.toFixed(1));tip?.setAttribute('cx',tx.toFixed(1));tip?.setAttribute('cy',ty.toFixed(1));px?.setAttribute('x2',tx.toFixed(1));pz?.setAttribute('x1',tx.toFixed(1));pz?.setAttribute('x2',tx.toFixed(1));pz?.setAttribute('y2',ty.toFixed(1));
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
})();