(()=>{'use strict';
const grid=document.querySelector('.patent-fact-grid');
if(!grid||grid.dataset.rhkDisclosure==='1')return;
grid.dataset.rhkDisclosure='1';
const items=Array.from(grid.children);
if(items.length>6){
  const keyIndexes=[0,1,2,5,6,8];
  const key=new Set(keyIndexes);
  items.forEach((item,i)=>item.classList.toggle('patent-fact-extended',!key.has(i)));
}

const control=document.createElement('div');
control.className='patent-fact-disclosure';
control.innerHTML=`<div><span>KEY TECHNICAL VALUES</span><small>Prototype results and the air MDP estimate appear first. Expand for water projections and fabrication details.</small></div><button type="button" aria-expanded="false">View extended patent data</button>`;
grid.insertAdjacentElement('afterend',control);

const design=document.createElement('section');
design.className='patent-design-levers';
design.innerHTML=`
  <div class="patent-design-head">
    <div><span>PATENT-DESCRIBED DESIGN LEVERS</span><small>Options described in US11287508B2 and US11408961B2. These are patent disclosures, not measured RHKEARTH product specifications.</small></div>
    <button type="button" aria-expanded="false">View extended patent design levers</button>
  </div>
  <div class="patent-design-grid" hidden>
    <div><b>Viscous-scale fiber condition</b><span>US11287508B2 claim 11 specifies fiber cross-section dimensions smaller than the viscous penetration depth of the surrounding medium at the frequency of interest.</span></div>
    <div><b>Tension-tuned response</b><span>The specification describes using built-in tensile stress to tune mesh resonance, frequency response and bandwidth.</span></div>
    <div><b>2-D / nanoscale scaling rationale</b><span>The specification's scaling argument attributes large sensitivity gains over cantilever designs to the 2-D mesh and increased total fiber length. This is a patent-described scaling rationale, not a measured underwater product gain.</span></div>
    <div><b>Base recoil + far-field sampling</b><span>The floating-base concept combines acoustic-scattering recoil of the base with viscous sensing. Attached flow sensors can extend into surrounding medium intended to be less affected by base recoil.</span></div>
    <div><b>Controlled buoyancy / depth</b><span>Alternative embodiments include controlled-buoyancy support and positive or negative buoyancy for adjustable-depth operation. The continuation also describes adjustable anchor buoyancy for a predefined AVS depth.</span></div>
    <div><b>Directional base geometry</b><span>A non-spherical floating base may provide added directional selectivity. Multiple differently oriented flow sensors can form a higher-order vector sensor.</span></div>
    <div><b>Alternative transduction</b><span>Patent alternatives include mesh, cantilever, plate or porous-plate flow sensors with optical, interferometric, grating, piezoelectric, piezoresistive or capacitive readout concepts.</span></div>
    <div><b>Protected coupling / materials</b><span>The specification describes a sound-permeable enclosure filled with high-viscosity fluid acoustically matched to water. It also notes that mesh and optical readout can be implemented using corrosion-resistant materials.</span></div>
    <div><b>Acoustic-horn channels</b><span>US11408961B2 describes channel cavities shaped as acoustic horns with a flow sensor at the throat to enhance response. Channel orientation is used to tune directionality and dynamic range.</span></div>
    <div><b>Alternate channel fluids</b><span>Flexible membranes can separate the channel from seawater so liquids such as oil or ester may be used. Density and viscosity are described as response-design variables.</span></div>
    <div><b>Steady-flow rejection</b><span>Channels containing liquids of different densities may be paired so differential signals help mitigate steady, non-acoustic flow such as currents.</span></div>
    <div><b>Networked / secure telemetry</b><span>Optional anchor electronics include controller, battery, processor, memory and transmitter. The specification also describes aggregation across multiple sensors, encrypted output, verification of received information and commands that can reconfigure components or parameters.</span></div>
    <div><b>Conditional surfacing + telemetry</b><span>The tower may detach after a time, detected event or observation count, float to the surface and transmit stored information.</span></div>
    <div><b>Slow-flow use</b><span>The mesh velocimeter is also described for slowly varying viscous-flow monitoring down to the DC limit, separate from acoustic sensing.</span></div>
    <div><b>Pressure-release boundaries</b><span>The specification identifies low-frequency sensing near pressure-release boundaries, including the air/water interface and submerged-vessel hull contexts.</span></div>
  </div>`;
control.insertAdjacentElement('afterend',design);

const style=document.createElement('style');
style.textContent=`
.patent-fact-grid .patent-fact-extended{display:none!important}.patent-fact-grid.show-extended .patent-fact-extended{display:block!important}
.patent-fact-disclosure,.patent-design-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 0 2px}
.patent-fact-disclosure span,.patent-fact-disclosure small,.patent-design-head span,.patent-design-head small{display:block}
.patent-fact-disclosure span,.patent-design-head span{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;color:#a9b59b}
.patent-fact-disclosure small,.patent-design-head small{margin-top:4px;max-width:900px;color:#777f77;font:9px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}
.patent-fact-disclosure button,.patent-design-head button{appearance:none;border:1px solid rgba(169,181,155,.24);background:#0b0d0b;color:#d7dcd4;padding:9px 12px;white-space:nowrap;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em;cursor:pointer}
.patent-fact-disclosure button:hover,.patent-design-head button:hover{border-color:rgba(205,216,201,.46);background:#101310}
.patent-design-levers{margin-top:12px;border:1px solid rgba(169,181,155,.18);background:#090b09}.patent-design-head{padding:13px 14px}
.patent-design-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:rgba(169,181,155,.12);border-top:1px solid rgba(169,181,155,.14)}.patent-design-grid[hidden]{display:none!important}.patent-design-grid>div{background:#0b0d0b;padding:13px 14px}.patent-design-grid b,.patent-design-grid span{display:block}.patent-design-grid b{color:#e7eae3;font:600 11px/1.35 system-ui,sans-serif}.patent-design-grid span{margin-top:5px;color:#858d85;font:9px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
@media(max-width:680px){.patent-fact-disclosure,.patent-design-head{display:block}.patent-fact-disclosure button,.patent-design-head button{margin-top:10px}.patent-design-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

const button=control.querySelector('button');
button.addEventListener('click',()=>{
  const open=!grid.classList.contains('show-extended');
  grid.classList.toggle('show-extended',open);
  button.setAttribute('aria-expanded',String(open));
  button.textContent=open?'Hide extended patent data':'View extended patent data';
});

const designButton=design.querySelector('button');
const designGrid=design.querySelector('.patent-design-grid');
designButton.addEventListener('click',()=>{
  const open=designGrid.hidden;
  designGrid.hidden=!open;
  designButton.setAttribute('aria-expanded',String(open));
  designButton.textContent=open?'Hide extended patent design levers':'View extended patent design levers';
});
})();
