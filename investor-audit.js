(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const main=document.querySelector('main#top');if(!main||document.body.dataset.rhkInvestorAudit==='2')return;document.body.dataset.rhkInvestorAudit='2';

// Keep the investor logic in the organization, not in visible "investor" copy.
// Technology comes before the demonstrator so the visitor understands what is
// being shown before interacting with it.
const system=document.getElementById('system'),mission=document.getElementById('mission'),market=document.getElementById('market');
if(system&&mission)main.insertBefore(system,mission);
if(market)main.appendChild(market);
const setIndex=(section,text)=>{const el=q('.section-index',section);if(el)el.textContent=text;};
setIndex(system,'01 // Technology');setIndex(mission,'02 // Demonstrator');setIndex(market,'03 // Applications');

const nav=q('.toplinks');if(nav)nav.innerHTML='<a href="#system">Technology</a><a href="#mission">Demonstrator</a><a href="#market">Applications</a><a href="#evidence">Evidence</a>';

// Hero remains concise and technical.
const eyebrow=q('.cinematic-copy .eyebrow');if(eyebrow)eyebrow.textContent='NRL PATENT FAMILY // INDEPENDENT COMMERCIALIZATION EVALUATION';
const lede=q('.cinematic-copy .lede');if(lede)lede.textContent='The Navy patents describe compact particle-motion vector sensing for low-frequency direction of arrival. A microfabricated mesh prototype showed dipole-type directional response in air; RHKEARTH is evaluating whether the disclosed underwater architectures can become a practical maritime sensing product.';
const actions=q('.hero-actions');if(actions)actions.innerHTML='<a class="hero-link primary" href="#system">Review the technology →</a><a class="hero-link" href="#mission">Run the demonstrator →</a>';

// Remove the prior pitch-deck-style block if a cached module already inserted it.
q('.investor-lens')?.remove();

if(system){const h=q('.section-title h2',system),p=q('.section-title p',system);if(h)h.textContent='Low-frequency sensing, made local.';if(p)p.textContent='Start with the disclosed architecture, then inspect the mesh physics. Patent-reported measurements are separated from analytical relationships and illustrative geometry.';}
if(mission){const h=q('.section-title h2',mission),p=q('.section-title p',mission);if(h)h.textContent='Move the source. Inspect the bearing geometry.';if(p)p.textContent='Configure a patent-described deployment context and place a generic source around it. The demonstrator explains architecture and direction-of-arrival geometry only; it does not calculate sonar performance.';}
if(market){const h=q('.section-title h2',market),p=q('.section-title p',market);if(h)h.textContent='Defense first. Dual-use second.';if(p)p.textContent='Patent-described deployment contexts are separated from commercialization hypotheses. No existing customer deployment, program-of-record status, detection range or fielded Navy capability is claimed.';
  const thesis=q('.thesis-grid',market);if(thesis)thesis.innerHTML=`
    <div class="thesis"><div class="tag">PATENT-DESCRIBED DEFENSE CONTEXTS</div><h3>Moored, hull-mounted, towed and sonobuoy architectures</h3><p>The specifications discuss shallow-water mooring, submarine/AUV hull mounting, neutrally buoyant towed arrays, positively buoyant sonobuoy use and external receiver/controller links.</p></div>
    <div class="thesis"><div class="tag">EVALUATION PATHS</div><h3>Ports, offshore systems and environmental observation</h3><p>These are potential RHKEARTH applications, not patent deployment claims. They remain contingent on technical validation, customer need and appropriate rights.</p></div>`;
}

// Evidence is kept at the bottom as diligence, not as a pitch block in the main flow.
q('#evidence')?.remove();
const evidence=document.createElement('section');evidence.id='evidence';evidence.className='section evidence-investor';evidence.innerHTML=`
  <div class="section-head"><div class="section-index">04 // Evidence + rights</div><div class="section-title"><h2>Evidence boundary.</h2><p>What the public patents report, what they describe, and what still requires validation.</p></div></div>
  <div class="ei-grid">
    <article><span class="ei-tag">REPORTED</span><h3>Prototype evidence</h3><ul><li>6 mm OD silicon-nitride spider-web prototype</li><li>20 μm released-web separation and ≈2.7 m total fiber length</li><li>Dipole-type directionality observed in air</li><li>&gt;20 nm/Pa peak responsivity at 90 Hz</li><li>530 Hz fundamental frequency for the first mesh prototype</li></ul></article>
    <article><span class="ei-tag">DESCRIBED / PROJECTED</span><h3>Patent boundary</h3><ul><li>≈76 dB re 1 μPa/√Hz equivalent water MDP is a patent projection</li><li>Floating/moored, hull/AUV, towed and sonobuoy configurations are specification embodiments</li><li>External devices may include ships, buoys, land receivers or a central controller</li><li>Context media on this site does not depict a validated sensor installation</li></ul></article>
    <article><span class="ei-tag">OPEN</span><h3>Validation work</h3><ul><li>In-water sensitivity and usable bandwidth</li><li>Bearing error and calibration stability</li><li>Platform, flow and tether self-noise</li><li>Operational range or classification performance</li><li>Packaging, biofouling and manufacturing repeatability</li></ul></article>
  </div>
  <div class="ei-rights"><div><span>IP STATUS</span><b>U.S. Navy / government patent rights</b><p>US11287508B2 and US11408961B2 are assigned to the United States of America, as represented by the Secretary of the Navy. RHKEARTH currently claims no patent ownership, license, exclusivity, Navy sponsorship or operational deployment.</p></div><div class="ei-links"><a href="https://patents.google.com/patent/US11287508B2/en" target="_blank" rel="noopener">US11287508B2 ↗</a><a href="https://patents.google.com/patent/US11408961B2/en" target="_blank" rel="noopener">US11408961B2 ↗</a></div></div>`;
main.appendChild(evidence);
const oldSources=document.getElementById('sources');if(oldSources){oldSources.hidden=true;oldSources.setAttribute('aria-hidden','true');}

// Keep the applications operating picture clean and non-performative.
const polishMarket=()=>{const mm=q('.market-motion');if(!mm)return false;qa('.mm-alert',mm).forEach(el=>el.remove());const top=q('.mm-hud-top',mm);if(top)top.textContent='MARITIME SENSOR ARCHITECTURE // ILLUSTRATIVE CONTEXT';const right=q('.mm-hud-right',mm);if(right)right.innerHTML='SOURCE TO SENSOR<br>BEARING GEOMETRY';const left=q('.mm-hud-left',mm);if(left)left.innerHTML='PATENT CORE<br>102 BASE<br>104 FLOW METERS<br>106 TETHER<br>108 ANCHOR';return true;};
if(!polishMarket()){const mo=new MutationObserver(()=>{if(polishMarket())mo.disconnect();});mo.observe(market||document.body,{childList:true,subtree:true});}

const style=document.createElement('style');style.textContent=`
.evidence-investor{padding-bottom:52px}.ei-tag,.ei-rights span{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:#a9b59b}.ei-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:rgba(169,181,155,.15);border:1px solid rgba(169,181,155,.15)}.ei-grid article{background:#080a08;padding:22px}.ei-grid h3{margin:9px 0 13px;font-size:20px}.ei-grid ul{margin:0;padding-left:17px;color:#909890;font-size:10px;line-height:1.65}.ei-rights{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:end;padding:20px 22px;border:1px solid rgba(169,181,155,.15);border-top:0;background:#0a0c0a}.ei-rights b{display:block;margin:7px 0 5px;font-size:16px}.ei-rights p{max-width:800px;margin:0;color:#858e85;font-size:10px;line-height:1.55}.ei-links{display:flex;gap:12px}.ei-links a{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;color:#e5e8e1;border-bottom:1px solid rgba(229,232,225,.35);padding-bottom:4px;white-space:nowrap}.market-motion .mm-hud-top{top:11%!important;left:19%!important;max-width:60%!important}.market-motion .mm-hud-left{left:16%!important;bottom:22%!important}.market-motion .mm-hud-right{right:16%!important;top:23%!important}.market-motion .mm-hud-bottom{bottom:9.5%!important;width:60%!important}.market-motion .mm-hud-legend{bottom:14%!important;width:62%!important}
@media(max-width:980px){.ei-grid{grid-template-columns:1fr}.ei-rights{grid-template-columns:1fr}.ei-links{margin-top:6px}}@media(max-width:600px){.ei-grid article{padding:17px}}
`;document.head.appendChild(style);
})();