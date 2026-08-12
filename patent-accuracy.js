(()=>{'use strict';
const $=id=>document.getElementById(id);
const q=(sel,root=document)=>root.querySelector(sel);

function setReadout(id,label,value,small){
  const el=$(id);if(!el)return;
  const block=el.closest('.readout,.readout-block');if(!block)return;
  const labelEl=block.querySelector('span');const smallEl=block.querySelector('small');
  if(labelEl)labelEl.textContent=label;
  el.textContent=value;
  if(smallEl)smallEl.textContent=small;
}

// Replace the one non-patent water responsivity metric with a value explicitly
// stated in both patents for the first mesh prototype.
document.querySelectorAll('.metrics .metric').forEach(metric=>{
  const label=metric.querySelector('.label');
  if(label && /modeled water response/i.test(label.textContent)){
    label.textContent='Patent prototype resonance';
    const value=metric.querySelector('.value');const sub=metric.querySelector('.sub');
    if(value)value.textContent='530 Hz';
    if(sub)sub.textContent='fundamental frequency reported for the first mesh prototype';
  }
});

// Patent/model boundary: every statement in the left column below is directly
// described in US11287508B2 and/or US11408961B2. The right column explicitly
// separates site calculations and illustrations from patent-reported results.
const system=$('system');
if(system && !q('.patent-boundary',system)){
  const boundary=document.createElement('div');
  boundary.className='patent-boundary';
  boundary.innerHTML=`
    <div class="patent-boundary-col patent-facts">
      <div class="patent-boundary-kicker">PATENT-REPORTED // US11287508B2 + US11408961B2</div>
      <div class="patent-fact-grid">
        <div><b>6 mm</b><span>outer diameter of the disclosed spider-web prototype</span></div>
        <div><b>20 μm</b><span>released-web beam / filament separation reported for the prototype</span></div>
        <div><b>≈2.7 m</b><span>total fiber length accommodated in the 6 mm prototype geometry</span></div>
        <div><b>3.6 μm × 1 μm</b><span>prototype filament cross-section</span></div>
        <div><b>30 nm Al</b><span>aluminum film used for the prototype center mirror</span></div>
        <div><b>&gt;20 nm/Pa @ 90 Hz</b><span>peak responsivity reported from in-air evaluation</span></div>
        <div><b>530 Hz</b><span>fundamental frequency reported for the first mesh prototype</span></div>
        <div><b>≈76 dB re 1 μPa/√Hz</b><span>patent projection for equivalent minimum detectable pressure in water; not an in-water measurement</span></div>
      </div>
    </div>
    <div class="patent-boundary-col model-boundary">
      <div class="patent-boundary-kicker">SITE MODEL // NOT PATENT PERFORMANCE DATA</div>
      <p>The sliders use basic acoustic relationships and transparent visualization heuristics. They do not predict qualified sensor sensitivity, detection range, bearing error, platform performance, or operational sonar capability.</p>
      <p>Animated deformation is intentionally exaggerated. Vessel, submarine, harbor and offshore scenes illustrate potential use contexts only.</p>
      <div class="patent-links"><a href="https://patents.google.com/patent/US11287508" target="_blank" rel="noopener">US11287508B2 ↗</a><a href="https://patents.google.com/patent/US11408961" target="_blank" rel="noopener">US11408961B2 ↗</a></div>
    </div>`;
  const tabs=q('.tabs',system);
  if(tabs)system.insertBefore(boundary,tabs);else system.appendChild(boundary);
}

// The patents describe natural cosine-type directivity from out-of-plane mesh
// displacement. Do not display a made-up underwater deflection number.
function updatePhysicsBoundary(){
  const angle=+$('angle')?.value||0;
  const projection=Math.abs(Math.cos(angle*Math.PI/180))*100;
  setReadout('deflectionOut','Directional projection',projection.toFixed(0)+'%','cosine-type directivity described in the patent; not a sensitivity prediction');
}
['freq','spl','angle','diameter','spacing'].forEach(id=>$(id)?.addEventListener('input',updatePhysicsBoundary));
updatePhysicsBoundary();

// The mission view is a conceptual geometry/propagation demonstrator. Replace
// the former literature-derived dynamic mesh value with the patent's own water
// projection and explicitly mark heuristic outputs.
function updateMissionBoundary(){
  setReadout('meshResponse','Patent water projection','≈76 dB','MDPwater re 1 μPa/√Hz projected in the patent; not an in-water test');
  const bearing=$('bearingEstimate')?.closest('.readout-block');
  if(bearing){const s=bearing.querySelector('span'),sm=bearing.querySelector('small');if(s)s.textContent='Model bearing';if(sm)sm.textContent='illustrative uncertainty heuristic — not patent performance';}
  const conf=$('missionConfidence')?.closest('.readout-block');
  if(conf){const s=conf.querySelector('span');if(s)s.textContent='Model confidence';}
  const received=$('receivedLevel')?.closest('.readout-block');
  if(received){const sm=received.querySelector('small');if(sm)sm.textContent='site spreading-loss model — not patent data';}
  const snr=$('missionSNR')?.closest('.readout-block');
  if(snr){const sm=snr.querySelector('small');if(sm)sm.textContent='site calculation from selected inputs';}
}
['missionFreq','missionRange','missionBearing','missionSource','missionNoise','targetType','sensorConfig'].forEach(id=>{
  $(id)?.addEventListener('input',updateMissionBoundary);
  $(id)?.addEventListener('change',updateMissionBoundary);
});
updateMissionBoundary();

// Add a persistent model-only label to the demonstrator.
const mission=document.querySelector('.mission-shell');
if(mission && !mission.querySelector('.mission-model-boundary')){
  const note=document.createElement('div');note.className='mission-model-boundary';
  note.innerHTML='<b>CONCEPTUAL MODEL</b><span>Geometry, propagation loss, SNR, confidence and bearing-error displays are illustrative site calculations. No real platform acoustic-signature data or NRL operational performance data is used.</span>';
  const top=mission.querySelector('.mission-top');if(top)top.insertAdjacentElement('afterend',note);else mission.prepend(note);
}

// Patent-ground architecture descriptions. These track the specification rather
// than presenting the drawings as product CAD.
const modeCopy={
  base:['Floating-base embodiment','Patent embodiment: floating base 102 carries one or more flow meters 104 and is coupled by retaining thread 106 to anchor 108. The base is suspended in water and free to move in directions of interest; relative recoil motion can be detected by attached velocity sensors.'],
  tower:['Viscous-channel tower embodiment','Patent embodiment: tower 504 contains multiple flow channels 506 filled with viscous liquid, with flow sensors inside channel cavities. Channels may have different orientations; disclosed embodiments include power, memory, transmission, anchoring and detachable surface recovery.'],
  hull:['Hull / AUV mounting described in specification','The specification states that the vector sensor may be mounted on the hull of a vessel such as a submarine or AUV, or moored in shallow water near an air/water boundary. The site drawing is illustrative and is not patent CAD.']
};
function applyModeCopy(mode){const m=modeCopy[mode];if(!m)return;if($('modeTitle'))$('modeTitle').textContent=m[0];if($('modeDescription'))$('modeDescription').textContent=m[1];}
document.querySelectorAll('.mode').forEach(btn=>btn.addEventListener('click',()=>queueMicrotask(()=>applyModeCopy(btn.dataset.mode))));
applyModeCopy('base');

// Clarify the public prototype cutaway itself.
const eng=document.querySelector('.sensor-engineering');
if(eng){
  const caption=eng.nextElementSibling?.classList?.contains('sensor-caption')?eng.nextElementSibling:null;
  if(caption){
    const title=caption.querySelector('.sensor-caption-title');
    const copy=caption.querySelector('.sensor-caption-copy');
    if(title)title.textContent='Patent-grounded prototype cutaway';
    if(copy)copy.textContent='The cutaway uses dimensions and mechanisms stated in the patents: a 6 mm spider-web prototype in 1 μm ultra-low-stress silicon nitride, approximately 20 μm filament separation, roughly 2.7 m total fiber length, 3.6 μm × 1 μm filaments, a 30 nm aluminum center mirror, and optical interferometric displacement readout. Overall package geometry and displayed deformation remain illustrative.';
  }
}
})();