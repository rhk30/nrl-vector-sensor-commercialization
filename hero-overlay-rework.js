(()=>{'use strict';
const panel=document.querySelector('.scene-panel');
const svg=panel?.querySelector('svg');
if(!panel||!svg||panel.dataset.rhkPatentOverlay==='2')return;
panel.dataset.rhkPatentOverlay='2';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

const style=document.createElement('style');
style.textContent=`
.scene-panel svg .rhk-node-base{fill:rgba(8,11,9,.80);stroke:#dce2d8;stroke-width:1.35}.scene-panel svg .rhk-node-hub{fill:#dce2d8}.scene-panel svg .rhk-meter{fill:rgba(194,205,190,.16);stroke:#c5cec1;stroke-width:1.05}.scene-panel svg .rhk-tether{stroke:#b9c4b5;stroke-width:1.05;stroke-dasharray:5 5;opacity:.82}.scene-panel svg .rhk-anchor{fill:rgba(9,12,10,.78);stroke:#9ca797;stroke-width:1}.scene-panel svg .rhk-source circle,.scene-panel svg .rhk-source line{fill:rgba(8,10,9,.42);stroke:#e0e5dc;stroke-width:1.1}.scene-panel svg .rhk-receiver rect,.scene-panel svg .rhk-receiver circle,.scene-panel svg .rhk-receiver line{fill:rgba(7,9,8,.60);stroke:#d7ddd3;stroke-width:1.05}.scene-panel svg .rhk-receiver circle{fill:#d7ddd3}.scene-panel svg .rhk-bearing{stroke:#d5dccf;stroke-width:1.15;stroke-dasharray:6 7;fill:none;opacity:.72}.scene-panel svg .rhk-data{stroke:#aeb9aa;stroke-width:1.25;fill:none;opacity:.72}.scene-panel svg .rhk-label{fill:#e4e8e1;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.035em;text-shadow:0 1px 7px rgba(0,0,0,.98)}.scene-panel svg .rhk-sub{fill:#929c90;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.035em;text-shadow:0 1px 7px rgba(0,0,0,.98)}.scene-panel svg .rhk-kicker{fill:#b0bbac;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;text-shadow:0 1px 7px rgba(0,0,0,.98)}.scene-panel svg .rhk-plain{fill:#838d82;font:7.5px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.035em;text-shadow:0 1px 6px rgba(0,0,0,.98)}.scene-panel svg .rhk-callout-bg{fill:rgba(5,8,6,.52);stroke:rgba(183,195,180,.18);stroke-width:.8}.scene-panel svg .rhk-water{stroke:#6e7c71;stroke-width:1;opacity:.55}.scene-panel svg .rhk-bearing{animation:rhkBearingShift 7s linear infinite}@keyframes rhkBearingShift{to{stroke-dashoffset:-52}}@media(prefers-reduced-motion:reduce){.scene-panel svg .rhk-bearing{animation:none}}
`;
document.head.appendChild(style);

const node=(x,y,s=1)=>`<g class="rhk-node" transform="translate(${x} ${y}) scale(${s})"><circle class="rhk-node-base" r="19"/><circle class="rhk-node-hub" r="4"/><rect class="rhk-meter" x="-5" y="-37" width="10" height="15" rx="1"/><rect class="rhk-meter" x="-5" y="22" width="10" height="15" rx="1"/><rect class="rhk-meter" x="-37" y="-5" width="15" height="10" rx="1"/><rect class="rhk-meter" x="22" y="-5" width="15" height="10" rx="1"/><line class="rhk-tether" x1="0" y1="19" x2="0" y2="72"/><path class="rhk-anchor" d="M-18 72H18L25 84H-25Z"/><circle class="hero-wave" r="49"/><circle class="hero-wave" r="49"/><circle class="hero-wave" r="49"/></g>`;
const source=(x,y)=>`<g class="rhk-source" transform="translate(${x} ${y})"><circle r="7"/><line x1="-15" y1="0" x2="15" y2="0"/><line x1="0" y1="-15" x2="0" y2="15"/><circle class="hero-wave" r="46"/><circle class="hero-wave" r="46"/><circle class="hero-wave" r="46"/></g>`;
const receiver=(x,y)=>`<g class="rhk-receiver" transform="translate(${x} ${y})"><rect x="-11" y="-11" width="22" height="22" rx="2"/><circle r="3"/><line x1="-17" y1="0" x2="-11" y2="0"/><line x1="11" y1="0" x2="17" y2="0"/></g>`;
const box=(x,y,w,title,sub)=>`<g transform="translate(${x} ${y})"><rect class="rhk-callout-bg" x="0" y="0" width="${w}" height="42" rx="2"/><text x="12" y="17" class="rhk-label">${title}</text><text x="12" y="32" class="rhk-sub">${sub}</text></g>`;
const legend=`<text x="760" y="683" text-anchor="end" class="rhk-plain">DASHED = SOURCE TO SENSOR BEARING / SOLID = SENSOR TO RECEIVER DATA PATH</text>`;

const groups={subsea:q('.scene-group[data-scene="subsea"]',svg),fleet:q('.scene-group[data-scene="fleet"]',svg),swcc:q('.scene-group[data-scene="swcc"]',svg),harbor:q('.scene-group[data-scene="harbor"]',svg),wind:q('.scene-group[data-scene="wind"]',svg)};

if(groups.subsea)groups.subsea.innerHTML=`
  <text x="34" y="205" class="rhk-kicker">WHAT THE PATENT ADDS // HULL OR PLATFORM-INTEGRATED VECTOR SENSING</text>
  ${source(570,444)}${node(300,466,.92)}${receiver(648,236)}
  <line x1="563" y1="444" x2="320" y2="466" class="rhk-bearing"/><line x1="300" y1="466" x2="648" y2="236" class="rhk-data"/>
  ${box(92,525,250,'PATENT-DESCRIBED SENSOR','PARTICLE-MOTION VECTOR SENSOR / US11287508B2')}
  ${box(480,382,212,'ILLUSTRATIVE ACOUSTIC SOURCE','REAL PLATFORM IMAGE IS CONTEXT ONLY')}
  ${box(525,176,220,'EXTERNAL RECEIVER / CONTROLLER','PATENT-DESCRIBED RECEIVER CONCEPT')}
  ${legend}`;

if(groups.fleet)groups.fleet.innerHTML=`
  <text x="34" y="205" class="rhk-kicker">WHAT THE PATENT ADDS // TOWED OR NEUTRALLY BUOYANT AVS ARCHITECTURE</text>
  ${source(215,535)}${node(430,420,.72)}${node(390,456,.58)}${node(352,489,.48)}${receiver(612,245)}
  <path d="M612 245 C560 302 500 354 430 420" class="rhk-data"/><line x1="208" y1="535" x2="352" y2="489" class="rhk-bearing"/>
  ${box(84,570,210,'ILLUSTRATIVE ACOUSTIC SOURCE','NO RANGE OR SOURCE LEVEL MODELED')}
  ${box(420,475,285,'PATENT-DESCRIBED TOWED AVS CONCEPT','SENSOR ELEMENTS SHOWN SCHEMATICALLY / US11408961B2')}
  ${box(500,188,245,'SHIP / CONTROLLER RECEIVER CONTEXT','REAL NAVY FOOTAGE IS NOT A SENSOR INSTALLATION')}
  ${legend}`;

if(groups.swcc)groups.swcc.innerHTML=`
  <text x="34" y="205" class="rhk-kicker">WHAT THE PATENT ADDS // SHALLOW-WATER MOORED DIRECTIONAL SENSOR</text>
  ${source(566,332)}${node(350,492,.90)}${receiver(610,260)}
  <line x1="559" y1="336" x2="368" y2="484" class="rhk-bearing"/><line x1="350" y1="492" x2="610" y2="260" class="rhk-data"/>
  ${box(168,558,292,'PATENT-DESCRIBED MOORING','102 BASE / 104 FLOW METERS / 106 TETHER / 108 ANCHOR')}
  ${box(462,286,218,'ILLUSTRATIVE SOURCE / CRAFT CONTEXT','NO SENSOR INSTALLATION ON THE CRAFT IS CLAIMED')}
  ${legend}`;

if(groups.harbor)groups.harbor.innerHTML=`
  <text x="34" y="205" class="rhk-kicker">DUAL-USE HYPOTHESIS // MULTIPLE PATENT-STYLE NODES PROVIDE BEARING GEOMETRY</text>
  ${source(450,292)}${node(280,460,.70)}${node(555,472,.70)}${receiver(678,565)}
  <line x1="443" y1="297" x2="294" y2="451" class="rhk-bearing"/><line x1="457" y1="298" x2="544" y2="459" class="rhk-bearing"/>
  <line x1="280" y1="460" x2="678" y2="565" class="rhk-data"/><line x1="555" y1="472" x2="678" y2="565" class="rhk-data"/>
  ${box(337,226,252,'ILLUSTRATIVE VESSEL / ACOUSTIC SOURCE','HARBOR USE IS NOT A PATENT DEPLOYMENT CLAIM')}
  ${box(188,560,300,'PATENT-STYLE MOORED SENSOR NODES','DISTRIBUTED LOCALIZATION IS A COMMERCIALIZATION HYPOTHESIS')}
  ${box(548,604,205,'EXTERNAL RECEIVER / CONTROLLER','ILLUSTRATIVE AGGREGATION CONTEXT')}
  ${legend}`;

if(groups.wind)groups.wind.innerHTML=`
  <text x="34" y="205" class="rhk-kicker">PATENT-DESCRIBED EMBODIMENT // POSITIVELY BUOYANT AVS TOWER / SONOBUOY</text>
  <line x1="0" y1="260" x2="800" y2="260" class="rhk-water"/><text x="34" y="248" class="rhk-plain">SEA SURFACE</text>
  <g transform="translate(370 298)"><ellipse rx="42" ry="12" class="rhk-node-base"/><rect x="-6" y="-39" width="12" height="30" class="rhk-meter"/><line x1="0" y1="12" x2="0" y2="66" class="rhk-tether"/></g>
  ${node(370,420,.88)}${source(610,450)}${receiver(620,260)}
  <line x1="603" y1="450" x2="389" y2="422" class="rhk-bearing"/><line x1="370" y1="420" x2="620" y2="260" class="rhk-data"/>
  ${box(118,330,286,'PATENT-DESCRIBED AVS TOWER / SONOBUOY','POSITIVELY BUOYANT SENSOR WITH MOORING / US11408961B2')}
  ${box(520,392,194,'ILLUSTRATIVE ACOUSTIC SOURCE','BEARING GEOMETRY ONLY')}
  ${legend}`;

const nav=qa('.scene-nav .scene-btn',panel);['Subsea','Towed AVS','Littoral','Harbor','Sonobuoy'].forEach((label,i)=>{if(nav[i])nav[i].textContent=label;});

const copy={
  subsea:{k:'PATENT IN CONTEXT // UNDERSEA',t:'Platform context, sensor architecture, receiver path',c:'The real image supplies the submarine/platform context. The overlay adds only the patent-relevant logic: a vector sensor, source-bearing geometry and a path to an external receiver or controller. It does not depict a validated installation.'},
  fleet:{k:'PATENT IN CONTEXT // TOWED AVS',t:'Directional sensing behind a surface platform',c:'The real Navy footage supplies the ship context. The overlay shows the patent-described towed or neutrally buoyant AVS concept and an illustrative acoustic source. No fielded configuration or detection performance is claimed.'},
  swcc:{k:'PATENT IN CONTEXT // SHALLOW WATER',t:'Moored vector sensing near the surface',c:'The overlay isolates the patent-described floating base, flow meters, retaining thread and anchor from the real littoral craft image. The craft is operating context only.'},
  harbor:{k:'DUAL-USE EVALUATION // HARBOR',t:'A commercialization hypothesis using bearing geometry',c:'Two moored sensor nodes are shown to explain how multiple directional bearings could support localization. This is an evaluation concept, not a patent claim or validated harbor system.'},
  wind:{k:'PATENT IN CONTEXT // SONOBUOY',t:'Positively buoyant AVS tower with mooring',c:'US11408961B2 describes a positively buoyant AVS tower configured as a sonobuoy. The overlay shows that embodiment and separates it from the illustrative source and receiver context.'}
};
function syncInfo(){const active=q('.scene-group.active',panel)?.dataset.scene||'subsea';const d=copy[active]||copy.subsea;const k=q('#sceneKicker'),t=q('#sceneTitle'),c=q('#sceneCopy');if(k)k.textContent=d.k;if(t)t.textContent=d.t;if(c)c.textContent=d.c;}
new MutationObserver(syncInfo).observe(svg,{subtree:true,attributes:true,attributeFilter:['class']});syncInfo();
})();