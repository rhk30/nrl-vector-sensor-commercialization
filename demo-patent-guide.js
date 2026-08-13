(()=>{'use strict';
const $=id=>document.getElementById(id),q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

// Keep only the demonstrator guidance that directly helps a reviewer understand
// what is patent-described and what is merely visual context.
const mission=q('.mission-shell');
if(mission&&!q('.patent-demo-guide',mission)){
  const guide=document.createElement('section');guide.className='patent-demo-guide';
  guide.innerHTML=`
    <div class="pdg-head">
      <div><span class="pdg-kicker">PATENT BASIS</span><h3>What the demonstrator is showing.</h3></div>
      <div class="pdg-status"><span>SELECTED DISCLOSURE</span><b id="pdgPatent">US11287508B2</b></div>
    </div>
    <div class="pdg-live">
      <div><span>Selected embodiment</span><b id="pdgEmbodiment">Floating / moored</b></div>
      <div><span>Patent-described basis</span><p id="pdgSupport">One or more flow meters on a floating base coupled by a retaining thread to an anchor; four flow meters are shown in FIG. 1.</p></div>
      <div><span>Boundary</span><p>No detection range, SNR, bearing accuracy, source signature, underwater sensitivity, or operational performance is modeled.</p></div>
    </div>`;
  const grid=q('.mission-grid',mission);if(grid)mission.insertBefore(guide,grid);else mission.appendChild(guide);

  const style=document.createElement('style');style.textContent=`
  .patent-demo-guide{border-bottom:1px solid rgba(169,181,155,.16);background:#080a08;padding:16px 20px}.pdg-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.pdg-kicker{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:#a9b59b}.pdg-head h3{margin:5px 0 0;font-size:18px}.pdg-status{min-width:142px;padding:8px 10px;border:1px solid rgba(169,181,155,.16);font:9px ui-monospace,SFMono-Regular,Menlo,monospace;color:#7f887f}.pdg-status span,.pdg-status b{display:block}.pdg-status b{margin-top:5px;color:#e9ece5;font-size:11px}.pdg-live{display:grid;grid-template-columns:.8fr 1.35fr 1.25fr;gap:18px;margin-top:14px}.pdg-live span{display:block;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.06em;color:#7d867d}.pdg-live b{display:block;margin-top:5px;color:#e9ece5;font-size:11px}.pdg-live p{margin:5px 0 0;color:#8a938a;font-size:9px;line-height:1.45}@media(max-width:820px){.pdg-live{grid-template-columns:1fr}.pdg-head{display:block}.pdg-status{margin-top:10px;max-width:170px}}
  `;document.head.appendChild(style);

  const bases={
    floating:{patent:'US11287508B2',name:'Floating / moored',support:'Floating base with one or more flow meters, retaining thread and anchor; FIG. 1 shows four flow meters.'},
    hull:{patent:'US11287508B2',name:'Hull / AUV mounting',support:'The specification states that implementations may mount the vector sensor on a submarine or AUV hull.'},
    platform:{patent:'US11287508B2',name:'Hull / AUV mounting',support:'The specification states that implementations may mount the vector sensor on a submarine or AUV hull.'},
    sonobuoy:{patent:'US11408961B2',name:'Sonobuoy tower',support:'The specification describes a positively buoyant AVS tower configured as a sonobuoy and moored above an anchor.'},
    towed:{patent:'US11408961B2',name:'Towed array',support:'The specification expressly lists towed arrays among applications for neutrally buoyant AVS embodiments.'},
    tower:{patent:'US11408961B2',name:'Viscous-channel tower',support:'The tower embodiment uses differently oriented liquid-filled channels with flow sensors positioned in channel cavities.'}
  };
  function mode(){return mission.dataset.deployment||q('.patent-demo-presets button.active',mission)?.dataset.preset||($('sensorConfig')?.value==='platform'?'platform':$('sensorConfig')?.value==='tower'?'tower':'floating');}
  function update(){const b=bases[mode()]||bases.floating;if($('pdgPatent'))$('pdgPatent').textContent=b.patent;if($('pdgEmbodiment'))$('pdgEmbodiment').textContent=b.name;if($('pdgSupport'))$('pdgSupport').textContent=b.support;}
  ['sensorConfig','missionBearing','missionRange','targetType'].forEach(id=>{const el=$(id);el?.addEventListener('input',update);el?.addEventListener('change',update);});window.addEventListener('rhk-deployment-change',update);qa('.patent-demo-presets button',mission).forEach(b=>b.addEventListener('click',()=>queueMicrotask(update)));update();
}
})();