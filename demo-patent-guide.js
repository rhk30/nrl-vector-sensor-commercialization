(()=>{'use strict';
const $=id=>document.getElementById(id),q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

// ---------------------------------------------------------------------------
// Mission demonstrator: make the patent logic explicit as the user interacts.
// ---------------------------------------------------------------------------
const mission=q('.mission-shell');
if(mission&&!q('.patent-demo-guide',mission)){
  const guide=document.createElement('section');guide.className='patent-demo-guide';
  guide.innerHTML=`
    <div class="pdg-head"><div><span class="pdg-kicker">WHAT THIS DEMONSTRATOR IS SHOWING</span><h3>From disclosed architecture to directional vector.</h3></div><div class="pdg-status"><span>PATENT BASIS</span><b id="pdgPatent">US11287508B2</b></div></div>
    <div class="pdg-steps">
      <article class="active" data-step="1"><span>01</span><div><b>Deployment architecture</b><p id="pdgArchitecture">Floating base, flow meters, retaining thread and anchor.</p></div></article>
      <article data-step="2"><span>02</span><div><b>Source-bearing geometry</b><p>The dashed line is the geometric bearing from the sensor to the source.</p></div></article>
      <article data-step="3"><span>03</span><div><b>Incoming vector components</b><p>Signed east and north components resolve the opposite source-to-sensor wave-vector direction.</p></div></article>
      <article data-step="4"><span>04</span><div><b>Three-axis reconstruction</b><p>The Technology section extends the same direction-cosine logic to three orthogonal meshes in 3-D.</p></div></article>
    </div>
    <div class="pdg-live">
      <div><span>Selected embodiment</span><b id="pdgEmbodiment">Floating / moored</b></div>
      <div><span>What the patent supports</span><p id="pdgSupport">One or more flow meters on a floating base coupled by a retaining thread to an anchor; four flow meters are shown in FIG. 1.</p></div>
      <div><span>What this demo does not claim</span><p>No detection range, SNR, bearing accuracy, source signature, underwater sensitivity, or operational performance.</p></div>
    </div>`;
  const grid=q('.mission-grid',mission);if(grid)mission.insertBefore(guide,grid);else mission.appendChild(guide);

  const style=document.createElement('style');style.textContent=`
  .patent-demo-guide{border-bottom:1px solid rgba(169,181,155,.16);background:#080a08;padding:18px 20px}.pdg-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.pdg-kicker{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:#a9b59b}.pdg-head h3{margin:5px 0 0;font-size:19px}.pdg-status{min-width:132px;padding:8px 10px;border:1px solid rgba(169,181,155,.16);font:9px ui-monospace,SFMono-Regular,Menlo,monospace;color:#7f887f}.pdg-status span,.pdg-status b{display:block}.pdg-status b{margin-top:5px;color:#e9ece5;font-size:11px}.pdg-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:rgba(169,181,155,.13);margin-top:15px;border:1px solid rgba(169,181,155,.13)}.pdg-steps article{display:grid;grid-template-columns:auto 1fr;gap:9px;padding:12px;background:#0b0d0b;min-height:92px}.pdg-steps article>span{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;color:#7c857c}.pdg-steps b{display:block;font-size:11px;color:#dfe3da}.pdg-steps p{margin:5px 0 0;font-size:9px;line-height:1.42;color:#7f887f}.pdg-steps article.active{background:#101410;box-shadow:inset 0 2px 0 #a9b59b}.pdg-live{display:grid;grid-template-columns:.8fr 1.35fr 1.35fr;gap:18px;margin-top:14px}.pdg-live span{display:block;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.06em;color:#7d867d}.pdg-live b{display:block;margin-top:5px;color:#e9ece5;font-size:11px}.pdg-live p{margin:5px 0 0;color:#8a938a;font-size:9px;line-height:1.45}@media(max-width:900px){.pdg-steps{grid-template-columns:repeat(2,1fr)}.pdg-live{grid-template-columns:1fr}}@media(max-width:560px){.pdg-head{display:block}.pdg-status{margin-top:10px;max-width:150px}.pdg-steps{grid-template-columns:1fr}}
  .exhibit-purpose{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;margin:0 0 12px;padding:10px 12px;border:1px solid rgba(169,181,155,.14);background:#0a0c0a}.exhibit-purpose b{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;color:#a9b59b;white-space:nowrap}.exhibit-purpose span{font-size:10px;line-height:1.45;color:#8b948b}
  `;document.head.appendChild(style);

  const bases={
    floating:{patent:'US11287508B2',name:'Floating / moored',short:'Floating base, flow meters, retaining thread and anchor.',support:'One or more flow meters on a floating base coupled by a retaining thread to an anchor; four flow meters are shown in FIG. 1.'},
    hull:{patent:'US11287508B2',name:'Hull / AUV mounting',short:'Specification-described hull-mounted vector sensing.',support:'The specification states that implementations may mount the vector sensor on the hull of a vessel such as a submarine or AUV.'},
    platform:{patent:'US11287508B2',name:'Hull / AUV mounting',short:'Specification-described hull-mounted vector sensing.',support:'The specification states that implementations may mount the vector sensor on the hull of a vessel such as a submarine or AUV.'},
    sonobuoy:{patent:'US11408961B2',name:'Sonobuoy tower',short:'Positively buoyant AVS tower moored above an anchor.',support:'FIG. 5 and the specification describe a positively buoyant AVS tower configured as a sonobuoy and moored above an anchor.'},
    towed:{patent:'US11408961B2',name:'Towed array',short:'Neutrally buoyant AVS deployment context.',support:'The specification expressly lists towed arrays among applications for neutrally buoyant AVS embodiments.'},
    tower:{patent:'US11408961B2',name:'Viscous-channel tower',short:'Differently oriented viscous-liquid channels with flow sensors.',support:'The tower embodiment uses liquid-filled channels that may have different orientations, with flow sensors positioned in channel cavities.'}
  };
  function mode(){return mission.dataset.deployment||q('.patent-demo-presets button.active',mission)?.dataset.preset||($('sensorConfig')?.value==='platform'?'platform':$('sensorConfig')?.value==='tower'?'tower':'floating');}
  function update(){const b=bases[mode()]||bases.floating;if($('pdgPatent'))$('pdgPatent').textContent=b.patent;if($('pdgArchitecture'))$('pdgArchitecture').textContent=b.short;if($('pdgEmbodiment'))$('pdgEmbodiment').textContent=b.name;if($('pdgSupport'))$('pdgSupport').textContent=b.support;}
  ['sensorConfig','missionBearing','missionRange','targetType'].forEach(id=>{const el=$(id);el?.addEventListener('input',update);el?.addEventListener('change',update);});window.addEventListener('rhk-deployment-change',update);qa('.patent-demo-presets button',mission).forEach(b=>b.addEventListener('click',()=>queueMicrotask(update)));update();
}

// ---------------------------------------------------------------------------
// Label each technical exhibit by the engineering question it answers.
// ---------------------------------------------------------------------------
function purpose(target,label,text){if(!target||target.previousElementSibling?.classList?.contains('exhibit-purpose'))return;const p=document.createElement('div');p.className='exhibit-purpose';p.innerHTML=`<b>${label}</b><span>${text}</span>`;target.insertAdjacentElement('beforebegin',p);}
const cutaway=q('.sensor-engineering');purpose(cutaway,'ENGINEERING QUESTION 01','What is the physical transducer and readout mechanism? This cutaway shows the patent-described microfabricated mesh, normal deformation, center mirror and optical displacement readout. Geometry outside the labeled prototype dimensions is illustrative.');
const directivity=q('.patent-directivity-panel');purpose(directivity,'ENGINEERING QUESTION 02','How does one planar mesh encode direction? The signed cosine curve shows the patent-described dipole relationship between mesh-normal orientation and normalized response, including the phase reversal across 90°.');
const reconstruction=q('.vector-reconstruction-panel');purpose(reconstruction,'ENGINEERING QUESTION 03','How can local directional channels become a 3-D wave vector? Three orthogonal normalized responses are treated as direction cosines and recombined into a unit vector, matching the patent statement about three co-located orthogonal mesh transducers.');
const architecture=q('#architecture .arch-grid');purpose(architecture,'ENGINEERING QUESTION 04','How can the sensing principle be deployed without implying an operational sonar package? These views show only patent-described mechanical architectures and signal-flow concepts, not performance.');
})();