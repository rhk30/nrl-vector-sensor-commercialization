/* RHKEARTH source-attributed U.S.–Iran conflict reports. No AI inference. */
(() => {
  "use strict";
  const URL = "/experimental-data/iran-conflict.json";
  const escape = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const fmt = (v) => { const d = new Date(v); return isNaN(d.getTime()) ? "UNKNOWN" : d.toLocaleString(undefined, {timeZone:"UTC", year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"}) + " UTC"; };
  const age = v => { const dt = Date.now()-Date.parse(v); return !Number.isFinite(dt) ? Infinity : dt/3600000; };
  const CATEGORIES = ["ALL","DIPLOMACY","CONFLICT REPORTING","HUMANITARIAN","ENERGY & SHIPPING"];
  const state = {category:"ALL",query:"",items:[],data:null};
  function init(){
    if(document.getElementById("rhk-iran-monitor")) return;
    const btn = document.createElement("button");
    btn.id="rhk-iran-toggle"; btn.type="button"; btn.textContent="IRAN / CONFLICT";
    btn.setAttribute("aria-controls","rhk-iran-monitor");
    btn.setAttribute("aria-expanded","false");
    const panel=document.createElement("section");
    panel.id="rhk-iran-monitor";panel.hidden=true;panel.setAttribute("aria-label","US Iran public reporting monitor");
    panel.innerHTML='<header><strong>US–IRAN / OPEN-SOURCE REPORTING</strong><button id="rhk-iran-close" type="button">CLOSE ×</button></header><div id="rhk-iran-status">Loading source inventory…</div><p class="rhk-iran-warning">PUBLIC REPORTS, NOT VERIFIED EVENTS. No precise military asset tracking. Verify claims with original sources.</p><div class="rhk-iran-controls"><select id="rhk-iran-category" aria-label="Report category"></select><input id="rhk-iran-search" type="search" placeholder="Filter headlines or publishers" aria-label="Search reports"/><button id="rhk-iran-reload" type="button">RECHECK</button></div><div id="rhk-iran-list" role="list"></div><footer>Source: public Google News RSS results. Publisher, report time, retrieval time and source link retained. Not an independently corroborated conflict-event dataset.</footer>';
    document.body.append(btn,panel);
    document.getElementById("rhk-iran-category").innerHTML=CATEGORIES.map(x=>'<option>'+escape(x)+'</option>').join("");
    const toggle=(open)=>{panel.hidden=!open;btn.setAttribute("aria-expanded",String(open));};
    btn.addEventListener("click",()=>toggle(panel.hidden));
    document.getElementById("rhk-iran-close").addEventListener("click",()=>toggle(false));
    document.getElementById("rhk-iran-category").addEventListener("change",e=>{state.category=e.target.value;render();});
    document.getElementById("rhk-iran-search").addEventListener("input",e=>{state.query=e.target.value.toLowerCase().trim();render();});
    document.getElementById("rhk-iran-reload").addEventListener("click",load);
    load();
  }
  function render(){
    const d=state.data;
    const status=document.getElementById("rhk-iran-status");
    const rows=document.getElementById("rhk-iran-list");
    if(!status||!rows) return;
    if(!d){status.textContent="SOURCE DATA UNAVAILABLE";rows.textContent="No validated snapshot available.";return;}
    const hours=age(d.lastSuccessfulFetchAt);
    const freshness=hours<=2?"CURRENT SNAPSHOT":hours<=24?"DELAYED":"STALE / HISTORICAL";
    status.textContent='FEED '+String(d.status||"UNKNOWN").toUpperCase()+' · '+freshness+' · '+(d.itemCount||0)+' REPORTS · SUCCESSFUL FETCH '+fmt(d.lastSuccessfulFetchAt);
    const filtered=state.items.filter(x=>(state.category==="ALL"||(x.categories||[]).includes(state.category))&&(!state.query||(x.headline+" "+x.publisher).toLowerCase().includes(state.query)));
    rows.replaceChildren();
    if(!filtered.length){rows.textContent="No matching reports. This is not evidence that no events occurred.";return;}
    for(const x of filtered.slice(0,100)){
      const el=document.createElement("article");el.className="rhk-iran-item";el.setAttribute("role","listitem");
      const h=document.createElement("a");h.textContent=x.headline||"Untitled report";
      try{const u=new URL(x.articleUrl);if(u.protocol!=="https:")continue;h.href=u.href;}catch{continue;}
      h.target="_blank";h.rel="noopener noreferrer";
      const meta=document.createElement("div");meta.className="rhk-iran-meta";
      meta.textContent=(x.publisher||"Unknown publisher")+" · "+fmt(x.publishedAt)+" · "+(x.categories||[]).join(" / ")+" · NOT INDEPENDENTLY VERIFIED";
      el.append(h,meta);rows.append(el);
    }
  }
  async function load(){
    const status=document.getElementById("rhk-iran-status");if(status)status.textContent="CHECKING SNAPSHOT…";
    try{
      const res=await fetch(URL,{cache:"no-store",signal:AbortSignal.timeout(15000)});
      if(!res.ok)throw new Error("HTTP "+res.status);
      const d=await res.json();
      if(d.schemaVersion!==1||!Array.isArray(d.items))throw Error("Invalid schema");
      state.data=d;state.items=d.items;render();
    }catch(e){if(status)status.textContent="SOURCE UNAVAILABLE · "+String(e.message||e);if(!state.data)render();}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();