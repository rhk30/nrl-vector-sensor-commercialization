(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const main=document.querySelector('main#top');if(!main||document.body.dataset.rhkInvestorAudit==='1')return;document.body.dataset.rhkInvestorAudit='1';

// ---------------------------------------------------------------------------
// 1. INVESTOR FLOW
// Hero already establishes the thesis visually. Explain the technology before
// asking a visitor to operate the demonstrator, then move into applications and
// finish with a concise evidence / rights boundary.
// ---------------------------------------------------------------------------
const system=document.getElementById('system'),mission=document.getElementById('mission'),market=document.getElementById('market');
if(system&&mission)main.insertBefore(system,mission);
if(market)main.appendChild(market);

const setIndex=(section,text)=>{const el=q('.section-index',section);if(el)el.textContent=text;};
setIndex(system,'01 // Technology');setIndex(mission,'02 // Demonstrator');setIndex(market,'03 // Applications');

const nav=q('.toplinks');
if(nav)nav.innerHTML='<a href="#system">Technology</a><a href="#mission">Demonstrator</a><a href="#market">Applications</a><a href="#evidence">Evidence</a>';

// ---------------------------------------------------------------------------
// 2. HERO: ONE INVESTABLE THESIS, WITHOUT CLAIMING UNDERWATER VALIDATION.
// ---------------------------------------------------------------------------
const eyebrow=q('.cinematic-copy .eyebrow');if(eyebrow)eyebrow.textContent='NRL PATENT FAMILY // INDEPENDENT COMMERCIALIZATION EVALUATION';
const lede=q('.cinematic-copy .lede');if(lede)lede.textContent='The Navy patents describe compact particle-motion vector sensing for low-frequency direction of arrival. A microfabricated mesh prototype showed dipole-type directional response in air; RHKEARTH is evaluating whether the disclosed underwater architectures can become a practical maritime sensing product.';
const actions=q('.hero-actions');if(actions)actions.innerHTML='<a class="hero-link primary" href="#system">Review the technology →</a><a class="hero-link" href="#mission">Run the demonstrator →</a>';

// ---------------------------------------------------------------------------
// 3. INVESTOR LENS: WHAT IS INTERESTING / WHAT IS EVIDENCE / WHAT IS NOT YET PROVEN.
// No TAM, customer, program, range or performance claims are invented.
// ---------------------------------------------------------------------------
const metrics=q('.metrics');
if(metrics&&!q('.investor-lens')){
  const lens=document.createElement('section');lens.className='investor-lens';lens.innerHTML=`
    <div class="il-head"><span>INVESTOR LENS</span><h2>Why this patent family is worth evaluating.</h2><p>The opportunity is the combination of compact directional sensing, measured prototype evidence and multiple maritime deployment embodiments. The central technical question is whether those concepts survive in-water integration.</p></div>
    <div class="il-grid">
      <article><span>01 // DIFFERENTIATION</span><h3>Direction from local particle motion</h3><p>The mesh is described as a particle-velocity directional sensor with a natural signed cosine response. The patent states that three co-located orthogonal meshes can reconstruct a 3-D sound-wave vector.</p></article>
      <article><span>02 // PUBLIC EVIDENCE</span><h3>A fabricated prototype exists in the record</h3><p>The patents report a 6 mm silicon-nitride spider-web prototype, dipole-type directionality in air, peak responsivity above 20 nm/Pa at 90 Hz and a 530 Hz fundamental frequency.</p></article>
      <article><span>03 // DEPLOYMENT BREADTH</span><h3>Several maritime embodiments are described</h3><p>The specifications discuss floating/moored sensing, submarine or AUV hull mounting, neutrally buoyant towed arrays, a positively buoyant sonobuoy tower and communication to external receivers or controllers.</p></article>
      <article><span>04 // DE-RISKING</span><h3>Underwater performance is the key open question</h3><p>These patents do not establish in-water sensitivity, bearing error, platform self-noise, operational range or qualified packaging. The published water MDP value is a projection, not an in-water validation result.</p></article>
    </div>`;
  metrics.insertAdjacentElement('afterend',lens);
}

// ---------------------------------------------------------------------------
// 4. SECTION COPY: separate patent disclosure from product/commercial hypotheses.
// ---------------------------------------------------------------------------
if(system){const h=q('.section-title h2',system),p=q('.section-title p',system);if(h)h.textContent='Low-frequency sensing, made local.';if(p)p.textContent='Start with the disclosed architecture, then inspect the mesh physics. Patent-reported measurements are separated from analytical relationships and illustrative geometry.';}
if(mission){const h=q('.section-title h2',mission),p=q('.section-title p',mission);if(h)h.textContent='Move the source. Inspect the bearing geometry.';if(p)p.textContent='Configure a patent-described deployment context and place a generic source around it. The demonstrator explains architecture and direction-of-arrival geometry only; it does not calculate sonar performance.';}
if(market){const h=q('.section-title h2',market),p=q('.section-title p',market);if(h)h.textContent='Defense first. Dual-use second.';if(p)p.textContent='Patent-described deployment contexts are separated from commercialization hypotheses. No existing customer deployment, program-of-record status, detection range or fielded Navy capability is claimed.';
  const thesis=q('.thesis-grid',market);if(thesis)thesis.innerHTML=`
    <div class="thesis"><div class="tag">PATENT-DESCRIBED DEFENSE CONTEXTS</div><h3>Moored, hull-mounted, towed and sonobuoy architectures</h3><p>The specifications explicitly discuss shallow-water mooring, submarine/AUV hull mounting, neutrally buoyant towed arrays, positively buoyant sonobuoy use and external receiver/controller links.</p></div>
    <div class="thesis"><div class="tag">COMMERCIALIZATION HYPOTHESES</div><h3>Ports, offshore systems and environmental observation</h3><p>These are RHKEARTH evaluation paths, not patent deployment claims. They would require technical validation, a defensible customer problem and appropriate rights before becoming a product thesis.</p></div>`;
}

// ---------------------------------------------------------------------------
// 5. EVIDENCE + RIGHTS: concise close for an investor. The old diligence section
// is intentionally not restored; this keeps only decision-useful evidence.
// ---------------------------------------------------------------------------
q('#evidence')?.remove();
const evidence=document.createElement('section');evidence.id='evidence';evidence.className='section evidence-investor';evidence.innerHTML=`
  <div class="section-head"><div class="section-index">04 // Evidence + rights</div><div class="section-title"><h2>What is measured, what is disclosed, what remains.</h2><p>A clean boundary between public prototype evidence, patent-described embodiments and the work still required to establish a product.</p></div></div>
  <div class="ei-grid">
    <article><span class="ei-tag">MEASURED / REPORTED</span><h3>Public prototype evidence</h3><ul><li>6 mm OD silicon-nitride spider-web prototype</li><li>20 μm released-web separation and ≈2.7 m total fiber length</li><li>Dipole-type directionality observed in air</li><li>&gt;20 nm/Pa peak responsivity at 90 Hz</li><li>530 Hz fundamental frequency for the first mesh prototype</li></ul></article>
    <article><span class="ei-tag">PROJECTED / DESCRIBED</span><h3>Do not confuse with validation</h3><ul><li>≈76 dB re 1 μPa/√Hz equivalent water MDP is a patent projection</li><li>Floating/moored, hull/AUV, towed and sonobuoy configurations are specification embodiments</li><li>External devices may include ships, buoys, land receivers or a central controller</li><li>No photographed platform on this site is represented as carrying the sensor</li></ul></article>
    <article><span class="ei-tag">NOT ESTABLISHED BY THESE PATENTS</span><h3>Core product de-risking</h3><ul><li>In-water sensitivity and usable bandwidth</li><li>Bearing error and calibration stability</li><li>Platform, flow and tether self-noise</li><li>Operational detection range or classification performance</li><li>Long-duration packaging, biofouling and manufacturing yield</li></ul></article>
  </div>
  <div class="ei-rights"><div><span>IP STATUS</span><b>U.S. Navy / government patent rights</b><p>US11287508B2 and US11408961B2 are assigned to the United States of America, as represented by the Secretary of the Navy. RHKEARTH currently claims no patent ownership, license, exclusivity, Navy sponsorship or operational deployment.</p></div><div class="ei-links"><a href="https://patents.google.com/patent/US11287508B2/en" target="_blank" rel="noopener">US11287508B2 ↗</a><a href="https://patents.google.com/patent/US11408961B2/en" target="_blank" rel="noopener">US11408961B2 ↗</a></div></div>`;
main.appendChild(evidence);

// Hide the legacy evidence section if it survives another enhancement layer.
const oldSources=document.getElementById('sources');if(oldSources){oldSources.hidden=true;oldSources.setAttribute('aria-hidden','true');}

// ---------------------------------------------------------------------------
// 6. VISUAL DISCIPLINE FOR THE APPLICATIONS 3-D OPERATING PICTURE.
// The prior floating contact-alert boxes looked like detection claims and cluttered
// the circular safe area. Keep geometry lines, remove alert cards.
// ---------------------------------------------------------------------------
const polishMarket=()=>{
  const mm=q('.market-motion');if(!mm)return false;
  qa('.mm-alert',mm).forEach(el=>el.remove());
  const top=q('.mm-hud-top',mm);if(top)top.textContent='MARITIME SENSOR ARCHITECTURE // ILLUSTRATIVE CONTEXT';
  const right=q('.mm-hud-right',mm);if(right)right.innerHTML='SOURCE TO SENSOR<br>BEARING GEOMETRY';
  const left=q('.mm-hud-left',mm);if(left)left.innerHTML='PATENT CORE<br>102 BASE<br>104 FLOW METERS<br>106 TETHER<br>108 ANCHOR';
  return true;
};
if(!polishMarket()){
  const mo=new MutationObserver(()=>{if(polishMarket())mo.disconnect();});mo.observe(market||document.body,{childList:true,subtree:true});
}

const style=document.createElement('style');style.textContent=`
.investor-lens{margin:0 0 18px;border-top:1px solid rgba(169,181,155,.18);border-bottom:1px solid rgba(169,181,155,.18);padding:34px 0 30px}.il-head{display:grid;grid-template-columns:160px minmax(260px,.75fr) minmax(320px,1fr);gap:28px;align-items:start;margin-bottom:25px}.il-head>span,.il-grid article>span,.ei-tag,.ei-rights span{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:#a9b59b}.il-head h2{margin:0;font-size:28px;line-height:1.05;letter-spacing:-.035em}.il-head p{margin:0;color:#929a91;font-size:12px;line-height:1.6}.il-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid rgba(169,181,155,.16);background:rgba(169,181,155,.12);gap:1px}.il-grid article{background:#080a08;padding:19px;min-height:205px}.il-grid h3{font-size:17px;line-height:1.12;margin:12px 0 9px}.il-grid p{margin:0;color:#858e85;font-size:10px;line-height:1.55}.evidence-investor{padding-bottom:52px}.ei-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:rgba(169,181,155,.15);border:1px solid rgba(169,181,155,.15)}.ei-grid article{background:#080a08;padding:22px}.ei-grid h3{margin:9px 0 13px;font-size:20px}.ei-grid ul{margin:0;padding-left:17px;color:#909890;font-size:10px;line-height:1.65}.ei-rights{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:end;padding:20px 22px;border:1px solid rgba(169,181,155,.15);border-top:0;background:#0a0c0a}.ei-rights b{display:block;margin:7px 0 5px;font-size:16px}.ei-rights p{max-width:800px;margin:0;color:#858e85;font-size:10px;line-height:1.55}.ei-links{display:flex;gap:12px}.ei-links a{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;color:#e5e8e1;border-bottom:1px solid rgba(229,232,225,.35);padding-bottom:4px;white-space:nowrap}.market-motion .mm-hud-top{top:11%!important;left:19%!important;max-width:60%!important}.market-motion .mm-hud-left{left:16%!important;bottom:22%!important}.market-motion .mm-hud-right{right:16%!important;top:23%!important}.market-motion .mm-hud-bottom{bottom:9.5%!important;width:60%!important}.market-motion .mm-hud-legend{bottom:14%!important;width:62%!important}
@media(max-width:980px){.il-head{grid-template-columns:1fr}.il-grid{grid-template-columns:repeat(2,1fr)}.ei-grid{grid-template-columns:1fr}.ei-rights{grid-template-columns:1fr}.ei-links{margin-top:6px}}
@media(max-width:600px){.il-grid{grid-template-columns:1fr}.investor-lens{padding:24px 0}.il-head h2{font-size:24px}.ei-grid article{padding:17px}}
`;document.head.appendChild(style);
})();