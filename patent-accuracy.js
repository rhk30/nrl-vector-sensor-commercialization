(()=>{'use strict';
const $=id=>document.getElementById(id),q=(sel,root=document)=>root.querySelector(sel);

document.querySelectorAll('.metrics .metric').forEach(metric=>{
  const label=metric.querySelector('.label');
  if(label&&/modeled water response/i.test(label.textContent)){
    label.textContent='Patent prototype fundamental';
    const value=metric.querySelector('.value'),sub=metric.querySelector('.sub');
    if(value)value.textContent='530 Hz';
    if(sub)sub.textContent='reported for the first mesh prototype';
  }
});

const system=$('system');
if(system&&!q('.patent-boundary',system)){
  const boundary=document.createElement('div');boundary.className='patent-boundary';
  boundary.innerHTML=`
    <div class="patent-boundary-col patent-facts">
      <div class="patent-boundary-kicker">PATENT-STATED // MEASUREMENTS + ESTIMATES</div>
      <div class="patent-fact-grid">
        <div><b>6 mm</b><span>outer diameter of the disclosed spider-web prototype</span></div>
        <div><b>20 μm</b><span>released-web filament / beam separation reported for the prototype</span></div>
        <div><b>≈2.7 m</b><span>total fiber length reported for the 6 mm prototype geometry</span></div>
        <div><b>3.6 μm × 1 μm</b><span>prototype filament cross-section</span></div>
        <div><b>30 nm Al</b><span>aluminum film used for the prototype center mirror</span></div>
        <div><b>&gt;20 nm/Pa @ 90 Hz</b><span>peak responsivity reported from the in-air prototype evaluation</span></div>
        <div><b>530 Hz</b><span>fundamental frequency reported for the first mesh prototype</span></div>
        <div><b>≈76 dB re 1 μPa/√Hz</b><span>projected equivalent water pressure spectral density; not an in-water validation result</span></div>
      </div>
    </div>
    <div class="patent-boundary-col model-boundary">
      <div class="patent-boundary-kicker">VISUALIZATION BOUNDARY</div>
      <p>Displayed geometry and analytical relationships do not calculate or claim NRL detection range, sonar SNR, bearing accuracy, platform performance or operational capability.</p>
      <p>Mesh displacement, wavefront motion and deployment drawings are schematic unless explicitly identified as reported prototype data.</p>
      <div class="patent-links"><a href="https://patents.google.com/patent/US11287508" target="_blank" rel="noopener">US11287508B2 ↗</a><a href="https://patents.google.com/patent/US11408961" target="_blank" rel="noopener">US11408961B2 ↗</a></div>
    </div>`;
  const tabs=q('.tabs',system);if(tabs)system.insertBefore(boundary,tabs);else system.appendChild(boundary);
}

const modeCopy={
  base:['Floating-base embodiment','Floating base 102 carries one or more flow meters 104 and is coupled by retaining thread 106 to anchor 108. The base is suspended in water and free to move in directions of interest; relative motion between the base and surrounding medium is sensed by attached flow sensors.'],
  tower:['Tower-with-channels embodiment','Tower 504 contains viscous-liquid channels 506 with flow sensors positioned in channel cavities. Channels may have different orientations. The specification describes positive, neutral or negative buoyancy configurations, internal power / memory / transmitter options, and embodiments that detach from the retaining thread, surface and transmit stored information.'],
  hull:['Hull / AUV mounting described in specification','The specification states that implementations may mount the vector sensor on the hull of a vessel such as a submarine or AUV, or moor it in shallow water near an air/water boundary. The site drawing is illustrative rather than patent CAD.']
};
function applyModeCopy(mode){const m=modeCopy[mode];if(!m)return;if($('modeTitle'))$('modeTitle').textContent=m[0];if($('modeDescription'))$('modeDescription').textContent=m[1];}
document.querySelectorAll('.mode').forEach(btn=>btn.addEventListener('click',()=>queueMicrotask(()=>applyModeCopy(btn.dataset.mode))));applyModeCopy('base');

const eng=document.querySelector('.sensor-engineering');
if(eng){const caption=eng.nextElementSibling?.classList?.contains('sensor-cutaway-caption')?eng.nextElementSibling:null;if(caption){const title=caption.querySelector('.cutaway-title'),copy=caption.querySelector('.cutaway-note');if(title)title.textContent='Micro-mesh particle-motion transducer with optical displacement readout.';if(copy)copy.textContent='Mechanism and labeled prototype dimensions follow the source material. Overall package geometry and visible deformation are schematic; the cosine relationship is analytical rather than reconstructed measurement data.';}}
})();
