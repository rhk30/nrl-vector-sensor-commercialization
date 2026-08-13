(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const main=document.querySelector('main#top');if(!main||document.body.dataset.rhkInvestorAudit==='4')return;document.body.dataset.rhkInvestorAudit='4';

const system=document.getElementById('system'),mission=document.getElementById('mission'),market=document.getElementById('market');
if(system&&mission)main.insertBefore(system,mission);
if(market)main.appendChild(market);
const setIndex=(section,text)=>{const el=q('.section-index',section);if(el)el.textContent=text;};
setIndex(system,'01 // Technology');setIndex(mission,'02 // Demonstrator');setIndex(market,'03 // Applications');

const nav=q('.toplinks');if(nav)nav.innerHTML='<a href="#system">Technology</a><a href="#mission">Demonstrator</a><a href="#market">Applications</a>';

const eyebrow=q('.cinematic-copy .eyebrow');if(eyebrow)eyebrow.textContent='NRL PATENTS // INDEPENDENT COMMERCIALIZATION EVALUATION';
const lede=q('.cinematic-copy .lede');if(lede)lede.textContent='The Navy patents describe compact particle-motion vector sensing for low-frequency direction of arrival. A microfabricated mesh prototype showed dipole-type directional response in air; RHKEARTH is evaluating whether the disclosed underwater architectures can become a practical maritime sensing product.';
const actions=q('.hero-actions');if(actions)actions.innerHTML='<a class="hero-link primary" href="#system">Review the technology →</a><a class="hero-link" href="#mission">Run the demonstrator →</a>';

q('.investor-lens')?.remove();
q('#evidence')?.remove();
const oldSources=document.getElementById('sources');if(oldSources){oldSources.hidden=true;oldSources.setAttribute('aria-hidden','true');}

if(system){const h=q('.section-title h2',system),p=q('.section-title p',system);if(h)h.textContent='Low-frequency sensing, made local.';if(p)p.textContent='Start with the disclosed architecture, then inspect the mesh physics. Patent-reported measurements are separated from analytical relationships and illustrative geometry.';}
if(mission){const h=q('.section-title h2',mission),p=q('.section-title p',mission);if(h)h.textContent='Move the source. Inspect the bearing geometry.';if(p)p.textContent='Configure a patent-described deployment context and place a generic source around it. The demonstrator explains architecture and direction-of-arrival geometry only; it does not calculate sonar performance.';}
if(market){const h=q('.section-title h2',market),p=q('.section-title p',market);if(h)h.textContent='Defense first. Dual-use second.';if(p)p.textContent='Patent-described deployment contexts are separated from commercialization hypotheses. No existing customer deployment, program-of-record status, detection range or fielded Navy capability is claimed.';
  const thesis=q('.thesis-grid',market);if(thesis)thesis.innerHTML=`
    <div class="thesis"><div class="tag">PATENT-DESCRIBED DEFENSE CONTEXTS</div><h3>Moored, hull-mounted, towed and sonobuoy architectures</h3><p>The specifications discuss shallow-water mooring, submarine/AUV hull mounting, neutrally buoyant towed arrays, positively buoyant sonobuoy use and external receiver/controller links.</p></div>
    <div class="thesis"><div class="tag">EVALUATION PATHS</div><h3>Ports, offshore systems and environmental observation</h3><p>These are potential RHKEARTH applications, not patent deployment claims. They remain contingent on technical validation, customer need and appropriate rights.</p></div>`;
  import('./commercial-context-media.js?v=1').catch(err=>console.warn('RHKEARTH commercial context media fallback:',err));
}

// Applications visualization is intentionally loaded independently from the rest of the enhancement chain.
if(market&&!document.body.dataset.rhkApplicationsBootstrap){
  document.body.dataset.rhkApplicationsBootstrap='1';
  import('./market-bridge-v4.js?v=9').catch(err=>{
    console.warn('RHKEARTH Applications visualization fallback:',err);
    if(!q('.market-motion',market)){
      const fallback=document.createElement('section');
      fallback.className='market-motion market-motion-fallback';
      fallback.innerHTML='<div style="margin:28px 0 42px;padding:32px;border:1px solid rgba(170,180,168,.18);color:#8e978e;font:11px/1.7 ui-monospace,monospace">MARITIME OPERATING PICTURE UNAVAILABLE IN THIS BROWSER SESSION</div>';
      q('.section-head',market)?.insertAdjacentElement('afterend',fallback);
    }
  });
}

const cleanMarket=()=>{const mm=q('.market-motion');if(!mm)return false;qa('.mm-alert',mm).forEach(el=>el.remove());return true;};
if(!cleanMarket()){const mo=new MutationObserver(()=>{if(cleanMarket())mo.disconnect();});mo.observe(market||document.body,{childList:true,subtree:true});}
})();