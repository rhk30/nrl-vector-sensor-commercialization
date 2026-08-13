(()=>{'use strict';
const panel=document.querySelector('.scene-panel');
const svg=panel?.querySelector('svg');
if(!panel||!svg||panel.dataset.rhkPatentOverlay==='1')return;
panel.dataset.rhkPatentOverlay='1';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

// The background media supplies the real platform imagery. The SVG overlay is
// deliberately limited to patent architecture, source-bearing geometry and
// clearly labeled illustrative context. It does not represent measured range,
// classification, SNR or an NRL-validated operational system.
const style=document.createElement('style');
style.textContent=`
.scene-panel svg .patent-node circle,.scene-panel svg .patent-node rect,.scene-panel svg .patent-node path{fill:rgba(12,16,13,.72);stroke:#d8dfd4;stroke-width:1.2}.scene-panel svg .patent-node .meter{fill:rgba(185,197,181,.14);stroke:#b9c4b5}.scene-panel svg .patent-tether{stroke:#b7c2b3;stroke-width:1;stroke-dasharray:5 6;opacity:.78}.scene-panel svg .bearing-line{stroke:#d5dccf;stroke-width:1.15;stroke-dasharray:6 7;fill:none;opacity:.72}.scene-panel svg .receiver-path{stroke:#9eaa9d;stroke-width:1.05;fill:none;opacity:.54}.scene-panel svg .source-marker{fill:rgba(10,13,11,.70);stroke:#e0e5dc;stroke-width:1.15}.scene-panel svg .source-ring{fill:none;stroke:#aeb9aa;stroke-width:1;opacity:.28}.scene-panel svg .patent-label{fill:#e2e6de;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.035em}.scene-panel svg .patent-sub{fill:#8d968d;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.035em}.scene-panel svg .context-tag{fill:#a9b59b;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.075em}.scene-panel svg .anchor-shape{fill:rgba(20,24,20,.70);stroke:#8f9a8d;stroke-width:1}.scene-panel svg .waterline-label{fill:#768078;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}
`;
document.head.appendChild(style);

const node=(x,y,s=1)=>`<g class="patent-node" transform="translate(${x} ${y}) scale(${s})"><circle r="21"/><rect class="meter" x="-6" y="-38" width="12" height="15"/><rect class="meter" x="-6" y="23" width="12" height="15"/><rect class="meter" x="-38" y="-6" width="15" height="12"/><rect class="meter" x="23" y="-6" width="15" height="12"/><circle r="4" fill="#dce3d9"/></g>`;
const anchor=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect class="anchor-shape" x="-25" y="-8" width="50" height="16" rx="2"/><path class="anchor-shape" d="M-18 8L-31 22H31L18 8Z"/></g>`;
const source=(x,y,r=58)=>`<g transform="translate(${x} ${y})"><circle class="source-marker" r="7"/><line x1="-15" y1="0" x2="15" y2="0" class="scene-accent"/><line x1="0" y1="-15" x2="0" y2="15" class="scene-accent"/><circle class="source-ring hero-wave" r="${r}"/><circle class="source-ring hero-wave" r="${r}"/><circle class="source-ring hero-wave" r="${r}"/></g>`;

const groups={
  subsea:q('.scene-group[data-scene="subsea"]',svg),
  fleet:q('.scene-group[data-scene="fleet"]',svg),
  swcc:q('.scene-group[data-scene="swcc"]',svg),
  harbor:q('.scene-group[data-scene="harbor"]',svg),
  wind:q('.scene-group[data-scene="wind"]',svg)
};

if(groups.subsea)groups.subsea.innerHTML=`
  <text x="34" y="205" class="context-tag">PATENT-DESCRIBED ARCHITECTURE + ILLUSTRATIVE SOURCE CONTEXT</text>
  ${node(285,470,1)}
  <line x1="285" y1="492" x2="285" y2="590" class="patent-tether"/>
  ${anchor(285,610,.9)}
  <text x="118" y="415" class="patent-label">MOORED VECTOR SENSOR</text>
  <text x="118" y="433" class="patent-sub">FLOATING BASE + FLOW METERS + TETHER + ANCHOR // US11287508B2</text>
  ${source(570,450,72)}
  <text x="488" y="405" class="patent-label">SUBMERGED ACOUSTIC SOURCE</text>
  <text x="488" y="423" class="patent-sub">ILLUSTRATIVE OPERATING CONTEXT</text>
  <line x1="307" y1="470" x2="563" y2="450" class="bearing-line"/>
  <text x="382" y="445" class="patent-sub">SOURCE BEARING</text>
  <g transform="translate(610 245)"><circle r="9" class="source-marker"/><path d="M-15 0H15M0-15V15" class="scene-accent"/></g>
  <line x1="285" y1="470" x2="610" y2="245" class="receiver-path"/>
  <text x="530" y="215" class="patent-label">EXTERNAL RECEIVER / CONTROLLER</text>
  <text x="530" y="233" class="patent-sub">PATENT-DESCRIBED DATA-RECEIVER CONCEPT</text>`;

if(groups.fleet)groups.fleet.innerHTML=`
  <text x="34" y="205" class="context-tag">PATENT-DESCRIBED TOWED APPLICATION // US11408961B2</text>
  <text x="465" y="235" class="patent-label">SURFACE SHIP</text>
  <text x="465" y="253" class="patent-sub">ILLUSTRATIVE OPERATING CONTEXT / REAL NAVY FOOTAGE</text>
  <path d="M520 270 C505 315 480 350 445 390" class="receiver-path"/>
  ${node(430,410,.72)}
  ${node(390,445,.58)}
  ${node(350,478,.48)}
  <text x="445" y="410" class="patent-label">TOWED / NEUTRALLY BUOYANT AVS APPLICATION</text>
  <text x="445" y="428" class="patent-sub">MULTIPLE SENSOR ELEMENTS SHOWN CONCEPTUALLY</text>
  ${source(205,545,66)}
  <text x="92" y="505" class="patent-label">ACOUSTIC SOURCE</text>
  <text x="92" y="523" class="patent-sub">ILLUSTRATIVE</text>
  <line x1="212" y1="538" x2="350" y2="478" class="bearing-line"/>
  <text x="250" y="492" class="patent-sub">SOURCE-TO-SENSOR BEARING</text>`;

if(groups.swcc)groups.swcc.innerHTML=`
  <text x="34" y="205" class="context-tag">SHALLOW-WATER EMBODIMENT // PLATFORM IMAGE IS ILLUSTRATIVE CONTEXT</text>
  <text x="488" y="262" class="patent-label">SURFACE CRAFT CONTEXT</text>
  <text x="488" y="280" class="patent-sub">SENSOR INSTALLATION ON THIS CRAFT IS NOT CLAIMED</text>
  ${node(350,485,.88)}
  <line x1="350" y1="505" x2="350" y2="590" class="patent-tether"/>
  ${anchor(350,610,.82)}
  <text x="185" y="445" class="patent-label">MOORED VECTOR SENSOR</text>
  <text x="185" y="463" class="patent-sub">SHALLOW WATER + RETAINING THREAD + ANCHOR // US11287508B2</text>
  ${source(540,310,58)}
  <line x1="372" y1="475" x2="533" y2="315" class="bearing-line"/>
  <text x="415" y="405" class="patent-sub">ILLUSTRATIVE SOURCE BEARING</text>`;

if(groups.harbor)groups.harbor.innerHTML=`
  <text x="34" y="205" class="context-tag">DUAL-USE EVALUATION // HARBOR DEPLOYMENT IS NOT A PATENT CLAIM</text>
  ${source(455,290,66)}
  <text x="388" y="247" class="patent-label">VESSEL / ACOUSTIC SOURCE</text>
  <text x="388" y="265" class="patent-sub">ILLUSTRATIVE COMMERCIAL CONTEXT</text>
  ${node(270,470,.70)}
  <line x1="270" y1="487" x2="270" y2="560" class="patent-tether"/>
  ${anchor(270,575,.65)}
  ${node(565,480,.70)}
  <line x1="565" y1="497" x2="565" y2="570" class="patent-tether"/>
  ${anchor(565,585,.65)}
  <line x1="286" y1="458" x2="448" y2="296" class="bearing-line"/>
  <line x1="550" y1="466" x2="462" y2="297" class="bearing-line"/>
  <text x="275" y="635" class="patent-label">POTENTIAL DUAL-USE LOCALIZATION NETWORK</text>
  <text x="275" y="653" class="patent-sub">PATENT-DESCRIBED SENSOR GEOMETRY APPLIED AS A COMMERCIALIZATION HYPOTHESIS</text>`;

if(groups.wind){
  groups.wind.dataset.scene='wind';
  groups.wind.innerHTML=`
    <text x="34" y="205" class="context-tag">SONOBUOY / AVS TOWER EMBODIMENT // US11408961B2</text>
    <line x1="0" y1="250" x2="800" y2="250" stroke="#4a534b"/>
    <text x="34" y="238" class="waterline-label">SEA SURFACE</text>
    <g transform="translate(365 265)"><ellipse rx="46" ry="13" class="scene-fill"/><rect x="-7" y="-42" width="14" height="34" class="scene-infra"/><line x1="0" y1="13" x2="0" y2="92" class="patent-tether"/></g>
    <g transform="translate(365 390)"><rect x="-22" y="-62" width="44" height="124" rx="12" fill="rgba(12,16,13,.72)" stroke="#d8dfd4"/><rect class="meter" x="-42" y="-35" width="18" height="13"/><rect class="meter" x="24" y="-35" width="18" height="13"/><rect class="meter" x="-42" y="22" width="18" height="13"/><rect class="meter" x="24" y="22" width="18" height="13"/></g>
    <line x1="365" y1="452" x2="365" y2="570" class="patent-tether"/>
    ${anchor(365,595,.9)}
    <text x="120" y="330" class="patent-label">POSITIVELY BUOYANT AVS TOWER / SONOBUOY</text>
    <text x="120" y="348" class="patent-sub">PATENT-DESCRIBED EMBODIMENT WITH MOORING / ANCHOR</text>
    ${source(610,440,70)}
    <text x="545" y="395" class="patent-label">ACOUSTIC SOURCE</text>
    <text x="545" y="413" class="patent-sub">ILLUSTRATIVE</text>
    <line x1="388" y1="410" x2="603" y2="440" class="bearing-line"/>
    <text x="455" y="421" class="patent-sub">SOURCE BEARING</text>`;
}

const nav=qa('.scene-nav .scene-btn',panel);
['Subsea','Towed AVS','Littoral','Harbor','Sonobuoy'].forEach((label,i)=>{if(nav[i])nav[i].textContent=label;});

const capability=qa('.capability-strip .capability');
const cap=[
  ['Undersea','Moored / hull-mounted directional sensing'],
  ['Surface fleet','Towed AVS application'],
  ['Littoral','Shallow-water moored architecture'],
  ['Ports','Dual-use localization hypothesis'],
  ['Sonobuoy','Positively buoyant AVS tower embodiment']
];
capability.forEach((el,i)=>{if(!cap[i])return;const b=q('b',el),s=q('span',el);if(b)b.textContent=cap[i][0];if(s)s.textContent=cap[i][1];});

const copy={
  subsea:{k:'PATENT-DESCRIBED // MOORED UNDERSEA ARCHITECTURE',t:'Source bearing from a compact vector sensor',c:'The overlay separates the patent-described floating/moored sensor, retaining thread and anchor from an illustrative submerged acoustic source. The dashed line is source-bearing geometry only; the solid path represents the patent-described external receiver/controller concept.'},
  fleet:{k:'PATENT-DESCRIBED // TOWED AVS APPLICATION',t:'Directional sensing in a towed architecture',c:'US11408961B2 identifies towed-array applications for neutrally buoyant AVS embodiments. The Navy footage is operating context. The sensor train and source-bearing line are conceptual and do not represent a fielded installation.'},
  swcc:{k:'PATENT-DESCRIBED // SHALLOW-WATER MOORING',t:'A moored vector sensor in littoral water',c:'US11287508B2 describes a floating base coupled by retaining thread to an anchor, including shallow-water use near a pressure-release boundary. The surface craft is illustrative context, not a claimed sensor installation.'},
  harbor:{k:'DUAL-USE EVALUATION // NOT A PATENT CLAIM',t:'Applying bearing geometry to harbor monitoring',c:'This scene is a commercialization hypothesis: multiple patent-style moored directional sensors could provide bearing geometry to an illustrative vessel source. No harbor deployment, accuracy, range or validated network performance is claimed.'},
  wind:{k:'PATENT-DESCRIBED // SONOBUOY / AVS TOWER',t:'Positively buoyant AVS tower with mooring',c:'US11408961B2 describes a positively buoyant AVS tower configured as a sonobuoy and moored above an anchor. The source and bearing line are illustrative; the embodiment relationship is the patent-grounded element.'}
};
function syncInfo(){const active=q('.scene-group.active',panel)?.dataset.scene||'subsea';const d=copy[active]||copy.subsea;const k=q('#sceneKicker'),t=q('#sceneTitle'),c=q('#sceneCopy');if(k)k.textContent=d.k;if(t)t.textContent=d.t;if(c)c.textContent=d.c;}
new MutationObserver(syncInfo).observe(svg,{subtree:true,attributes:true,attributeFilter:['class']});
syncInfo();
})();