(()=>{'use strict';
const panel=document.querySelector('.scene-panel');
const svg=panel?.querySelector('svg');
if(!panel||!svg||panel.dataset.rhkOverlayAudit==='1')return;
panel.dataset.rhkOverlayAudit='1';

const node=(x,y,s=1)=>`
  <g class="rhk-patent-node" transform="translate(${x} ${y}) scale(${s})">
    <circle r="18" class="rhk-node-base"/>
    <circle r="5" class="rhk-node-hub"/>
    <rect x="-4" y="-39" width="8" height="16" rx="1" class="rhk-flow-meter"/>
    <rect x="-4" y="23" width="8" height="16" rx="1" class="rhk-flow-meter"/>
    <rect x="-39" y="-4" width="16" height="8" rx="1" class="rhk-flow-meter"/>
    <rect x="23" y="-4" width="16" height="8" rx="1" class="rhk-flow-meter"/>
    <line x1="0" y1="18" x2="0" y2="67" class="rhk-tether"/>
    <path d="M-17 67 L17 67 L24 78 L-24 78 Z" class="rhk-anchor"/>
    <circle class="hero-wave" r="50"/><circle class="hero-wave" r="50"/><circle class="hero-wave" r="50"/>
  </g>`;

const source=(x,y)=>`
  <g class="rhk-source-marker" transform="translate(${x} ${y})">
    <circle r="14"/><line x1="-22" y1="0" x2="-8" y2="0"/><line x1="8" y1="0" x2="22" y2="0"/><line x1="0" y1="-22" x2="0" y2="-8"/><line x1="0" y1="8" x2="0" y2="22"/>
    <circle class="hero-wave" r="42"/><circle class="hero-wave" r="42"/><circle class="hero-wave" r="42"/>
  </g>`;

const receiver=(x,y)=>`
  <g class="rhk-receiver-marker" transform="translate(${x} ${y})">
    <rect x="-12" y="-12" width="24" height="24" rx="2"/>
    <circle r="3"/><line x1="-18" y1="0" x2="-12" y2="0"/><line x1="12" y1="0" x2="18" y2="0"/>
  </g>`;

const footer=`<text x="760" y="685" text-anchor="end" class="rhk-overlay-legend">DASHED: SOURCE TO SENSOR BEARING  /  SOLID: SENSOR TO EXTERNAL RECEIVER</text>`;

const scenes={
subsea:`
  ${source(565,442)}
  ${node(292,448,.96)}
  ${receiver(664,174)}
  <line x1="565" y1="442" x2="292" y2="448" class="rhk-bearing-path"/>
  <line x1="292" y1="448" x2="664" y2="174" class="rhk-data-path"/>
  <g class="rhk-overlay-label"><text x="438" y="414">ILLUSTRATIVE UNDERSEA PLATFORM CONTEXT</text><text x="438" y="430" class="sub">PHOTO / VIDEO DOES NOT DEPICT THE NRL SENSOR</text></g>
  <g class="rhk-overlay-label"><text x="205" y="548">PATENT-DESCRIBED VECTOR-SENSOR NODE</text><text x="205" y="564" class="sub">102 BASE / 104 FLOW METERS / 106 TETHER / 108 ANCHOR</text></g>
  <g class="rhk-overlay-label"><text x="590" y="134">EXTERNAL RECEIVER / CONTROLLER</text><text x="590" y="150" class="sub">PATENT-DESCRIBED RECEIVER PATH</text></g>
  ${footer}`,
fleet:`
  ${source(238,505)}
  ${node(492,362,.94)}
  ${receiver(610,188)}
  <line x1="238" y1="505" x2="492" y2="362" class="rhk-bearing-path"/>
  <line x1="492" y1="362" x2="610" y2="188" class="rhk-data-path"/>
  <g class="rhk-overlay-label"><text x="86" y="550">ILLUSTRATIVE ACOUSTIC SOURCE</text><text x="86" y="566" class="sub">SOURCE LEVEL / RANGE NOT MODELED</text></g>
  <g class="rhk-overlay-label"><text x="380" y="456">PATENT-DESCRIBED SENSOR NODE</text><text x="380" y="472" class="sub">DIRECTIONAL PARTICLE-MOTION SENSING</text></g>
  <g class="rhk-overlay-label"><text x="515" y="138">SHIP / CONTROLLER AS EXTERNAL RECEIVER CONTEXT</text><text x="515" y="154" class="sub">REAL FOOTAGE IS OPERATING CONTEXT ONLY</text></g>
  ${footer}`,
swcc:`
  ${source(625,492)}
  ${node(355,462,.98)}
  ${receiver(540,248)}
  <line x1="625" y1="492" x2="355" y2="462" class="rhk-bearing-path"/>
  <line x1="355" y1="462" x2="540" y2="248" class="rhk-data-path"/>
  <g class="rhk-overlay-label"><text x="451" y="206">SURFACE CRAFT / EXTERNAL RECEIVER CONTEXT</text><text x="451" y="222" class="sub">ILLUSTRATIVE LITTORAL OPERATING CONTEXT</text></g>
  <g class="rhk-overlay-label"><text x="224" y="558">SHALLOW-WATER MOORING / PATENT-DESCRIBED</text><text x="224" y="574" class="sub">102 BASE / 104 FLOW METERS / 106 TETHER / 108 ANCHOR</text></g>
  <g class="rhk-overlay-label"><text x="558" y="540">ILLUSTRATIVE ACOUSTIC SOURCE</text><text x="558" y="556" class="sub">BEARING GEOMETRY ONLY</text></g>
  ${footer}`,
harbor:`
  ${source(444,244)}
  ${node(285,440,.82)}
  ${node(548,456,.82)}
  ${receiver(684,560)}
  <line x1="444" y1="244" x2="285" y2="440" class="rhk-bearing-path"/>
  <line x1="444" y1="244" x2="548" y2="456" class="rhk-bearing-path"/>
  <line x1="285" y1="440" x2="684" y2="560" class="rhk-data-path"/>
  <line x1="548" y1="456" x2="684" y2="560" class="rhk-data-path"/>
  <g class="rhk-overlay-label"><text x="348" y="192">ILLUSTRATIVE VESSEL / ACOUSTIC SOURCE CONTEXT</text><text x="348" y="208" class="sub">NO CLASSIFICATION OR DETECTION RANGE CLAIM</text></g>
  <g class="rhk-overlay-label"><text x="226" y="548">PATENT-DESCRIBED MOORING GEOMETRY</text><text x="226" y="564" class="sub">TWO NODES SHOWN TO EXPLAIN A DISTRIBUTED CONCEPT</text></g>
  <g class="rhk-overlay-label"><text x="578" y="612">EXTERNAL RECEIVER / CONTROLLER</text><text x="578" y="628" class="sub">ILLUSTRATIVE AGGREGATION CONTEXT</text></g>
  ${footer}`,
wind:`
  ${source(492,306)}
  ${node(382,506,.92)}
  ${receiver(650,518)}
  <line x1="492" y1="306" x2="382" y2="506" class="rhk-bearing-path"/>
  <line x1="382" y1="506" x2="650" y2="518" class="rhk-data-path"/>
  <g class="rhk-overlay-label"><text x="420" y="260">ILLUSTRATIVE OFFSHORE ACOUSTIC SOURCE</text><text x="420" y="276" class="sub">DUAL-USE EVALUATION / NOT A PATENT DEPLOYMENT CLAIM</text></g>
  <g class="rhk-overlay-label"><text x="236" y="602">PATENT-DESCRIBED SENSOR CORE IN AN OFFSHORE CONTEXT</text><text x="236" y="618" class="sub">MOORING / DIRECTIONAL RESPONSE CONCEPT ONLY</text></g>
  <g class="rhk-overlay-label"><text x="548" y="558">EXTERNAL MONITORING SYSTEM</text><text x="548" y="574" class="sub">ILLUSTRATIVE RECEIVER CONTEXT</text></g>
  ${footer}`
};

Object.entries(scenes).forEach(([id,markup])=>{
  const g=svg.querySelector(`.scene-group[data-scene="${id}"]`);
  if(g)g.innerHTML=markup;
});

const style=document.createElement('style');
style.textContent=`
.scene-panel.has-live-media .scene-group{filter:none!important}.rhk-patent-node .rhk-node-base{fill:rgba(9,12,10,.72);stroke:#d7ddd3;stroke-width:1.4}.rhk-patent-node .rhk-node-hub{fill:#d7ddd3}.rhk-patent-node .rhk-flow-meter{fill:rgba(207,215,204,.18);stroke:#c9d1c6;stroke-width:1.1}.rhk-patent-node .rhk-tether{stroke:#c0c9bd;stroke-width:1.15;stroke-dasharray:4 4}.rhk-patent-node .rhk-anchor{fill:rgba(8,10,9,.78);stroke:#aab4a7;stroke-width:1}.rhk-source-marker circle,.rhk-source-marker line{fill:none;stroke:#d6ddd2;stroke-width:1.2}.rhk-receiver-marker rect,.rhk-receiver-marker circle,.rhk-receiver-marker line{fill:rgba(7,9,8,.56);stroke:#d4dbd0;stroke-width:1.1}.rhk-receiver-marker circle{fill:#d4dbd0}.rhk-bearing-path{stroke:#d3dacd;stroke-width:1.15;stroke-dasharray:5 7;fill:none;opacity:.76;animation:rhkBearingFlow 6s linear infinite}.rhk-data-path{stroke:#b7c2b3;stroke-width:1.35;fill:none;opacity:.72}.rhk-overlay-label text{fill:#e0e5dc;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.045em;text-shadow:0 1px 7px rgba(0,0,0,.98)}.rhk-overlay-label text.sub{fill:#929d90;font-size:8px;letter-spacing:.035em}.rhk-overlay-legend{fill:#7f8a7e;font:7.5px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.035em;text-shadow:0 1px 6px rgba(0,0,0,.98)}@keyframes rhkBearingFlow{to{stroke-dashoffset:-48}}
@media(max-width:800px){.rhk-overlay-label text{font-size:9px}.rhk-overlay-label text.sub{font-size:7px}.rhk-overlay-legend{font-size:6.5px}.rhk-bearing-path,.rhk-data-path{stroke-width:1}}
@media(prefers-reduced-motion:reduce){.rhk-bearing-path{animation:none}}
`;
document.head.appendChild(style);
})();