/* RHKEARTH Evidence Desk: public-source metadata, never live tactical intelligence. */
(() => {
  'use strict';
  const FEED='/experimental-data/iran-conflict.json';
  const TOPICS=['ALL','CONFLICT REPORTING','DIPLOMACY','HUMANITARIAN','ENERGY & SHIPPING','REGIONAL COVERAGE'];
  const TYPES=['ALL INDEXES','GOOGLE NEWS RSS','GDELT DOC'];
  const watchKey='rhk-iran-watch-terms-v1';
  const state={feed:null,items:[],topic:'ALL',type:'ALL INDEXES',hours:168,query:'',watchOnly:false,limit:70};
  const $=id=>document.getElementById(id);
  const text=x=>String(x??'');
  const date=x=>{const d=new Date(x);return Number.isFinite(d.getTime())?d:null;};
  const fmt=x=>date(x)?date(x).toLocaleString('en-GB',{timeZone:'UTC',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})+' UTC':'UNKNOWN';
  const safeUrl=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}};
  const make=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=text(value);return n;};
  const terms=()=>{try{return JSON.parse(localStorage.getItem(watchKey)||'[]').filter(x=>typeof x==='string');}catch{return [];}};
  const observed=x=>x.observedAt||x.publishedAt||x.indexedAt;
  const watched=x=>terms().some(t=>(text(x.headline)+' '+text(x.publisher)).toLowerCase().includes(t));
  const age=x=>date(x)?Math.max(0,(Date.now()-date(x).getTime())/3600000):Infinity;

  function setup(){
    if($('rhk-iran-monitor'))return;
    const toggle=make('button','rhk-ed-toggle','IRAN / EVIDENCE DESK');
    toggle.id='rhk-iran-toggle';toggle.type='button';toggle.setAttribute('aria-expanded','false');
    const panel=make('section','rhk-ed-root');panel.id='rhk-iran-monitor';panel.hidden=true;
    panel.setAttribute('aria-label','RHKEARTH public reporting evidence desk');
    panel.innerHTML=[
      '<header class="rhk-ed-header"><div><small>RHKEARTH // PUBLIC-SOURCE MONITOR</small>',
      '<strong>US–IRAN <span>/ EVIDENCE DESK</span></strong></div>',
      '<button id="rhk-ed-close" type="button" aria-label="Close">×</button></header>',
      '<section id="rhk-ed-status" class="rhk-ed-status" aria-live="polite">FETCHING SOURCE RECORDS</section>',
      '<section id="rhk-ed-kpis" class="rhk-ed-kpis" aria-label="Reporting metrics"></section>',
      '<section class="rhk-ed-chart"><div class="rhk-ed-heading"><b>REPORTING FREQUENCY</b>',
      '<small>7 UTC DAYS · INDEX ENTRIES, NOT EVENTS</small></div>',
      '<div id="rhk-ed-bars" class="rhk-ed-bars" role="img"></div></section>',
      '<section class="rhk-ed-controls">',
      '<div class="rhk-ed-windows" id="rhk-ed-windows">',
      '<button type="button" data-hours="24">24H</button><button type="button" data-hours="72">72H</button>',
      '<button type="button" data-hours="168">7D</button></div>',
      '<div class="rhk-ed-filter-row"><select id="rhk-ed-topic" aria-label="Topic"></select>',
      '<select id="rhk-ed-type" aria-label="Discovery index"></select>',
      '<input id="rhk-ed-search" type="search" aria-label="Search headlines and publishers" placeholder="SEARCH HEADLINES, PUBLISHERS"></div>',
      '<div class="rhk-ed-filter-row">',
      '<button id="rhk-ed-reload" type="button">RECHECK SOURCES</button>',
      '<button id="rhk-ed-export" type="button">EXPORT CSV</button>',
      '<button id="rhk-ed-digest" type="button">COPY DIGEST</button>',
      '<button id="rhk-ed-health-button" type="button">SOURCE HEALTH ▾</button></div>',
      '<div class="rhk-ed-filter-row rhk-ed-watch">',
      '<label for="rhk-ed-watch-input">LOCAL WATCH TERMS</label>',
      '<input id="rhk-ed-watch-input" type="text" maxlength="160" placeholder="e.g. ceasefire, sanctions, oil">',
      '<button id="rhk-ed-watch-save" type="button">SAVE</button>',
      '<label><input type="checkbox" id="rhk-ed-watch-only"> WATCH ONLY</label></div>',
      '<div id="rhk-ed-health" class="rhk-ed-health" hidden></div></section>',
      '<section class="rhk-ed-ledger"><div class="rhk-ed-heading"><b>ATTRIBUTED REPORTING LEDGER</b>',
      '<small id="rhk-ed-count">—</small></div><div id="rhk-ed-list" role="list"></div>',
      '<button id="rhk-ed-more" type="button" hidden>LOAD MORE REPORTS</button></section>',
      '<footer>Discovery indexes are not eyewitness evidence. Multiple indexed reports do not establish independent corroboration.',
      ' Source time can mean publication or first indexing. No tactical unit, route, or asset tracking.</footer>'
    ].join('');
    document.body.append(toggle,panel);
    const show=open=>{panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));};
    toggle.addEventListener('click',()=>show(panel.hidden));
    $('rhk-ed-close').addEventListener('click',()=>show(false));
    TOPICS.forEach(v=>$('rhk-ed-topic').add(new Option(v,v)));
    TYPES.forEach(v=>$('rhk-ed-type').add(new Option(v,v)));
    $('rhk-ed-topic').addEventListener('change',e=>{state.topic=e.target.value;state.limit=70;render();});
    $('rhk-ed-type').addEventListener('change',e=>{state.type=e.target.value;state.limit=70;render();});
    $('rhk-ed-search').addEventListener('input',e=>{state.query=e.target.value.trim().toLowerCase();state.limit=70;render();});
    $('rhk-ed-windows').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.hours=Number(b.dataset.hours);state.limit=70;render();}));
    $('rhk-ed-reload').addEventListener('click',load);
    $('rhk-ed-export').addEventListener('click',exportCsv);
    $('rhk-ed-digest').addEventListener('click',copyDigest);
    $('rhk-ed-more').addEventListener('click',()=>{state.limit+=70;renderLedger();});
    $('rhk-ed-health-button').addEventListener('click',()=>{$('rhk-ed-health').hidden=!$('rhk-ed-health').hidden;});
    $('rhk-ed-watch-input').value=terms().join(', ');
    $('rhk-ed-watch-save').addEventListener('click',()=>{
      const value=$('rhk-ed-watch-input').value.split(',').map(v=>v.trim().toLowerCase()).filter(v=>v.length>=3).slice(0,8);
      try{localStorage.setItem(watchKey,JSON.stringify(value));}catch(e){$('rhk-ed-watch-save').title='Browser storage unavailable';}
      render();
    });
    $('rhk-ed-watch-only').addEventListener('change',e=>{state.watchOnly=e.target.checked;state.limit=70;render();});
    load();
  }

  function filter(){
    const start=Date.now()-state.hours*3600000;
    return state.items.filter(x=>{
      const d=date(observed(x));
      if(!d||d.getTime()<start)return false;
      if(state.topic!=='ALL'&&!(x.categories||[]).includes(state.topic))return false;
      if(state.type==='GDELT DOC'&&x.sourceType!=='gdelt-doc-index')return false;
      if(state.type==='GOOGLE NEWS RSS'&&x.sourceType==='gdelt-doc-index')return false;
      if(state.query&&!(text(x.headline)+' '+text(x.publisher)+' '+text(x.sourceDomain)).toLowerCase().includes(state.query))return false;
      return !state.watchOnly||watched(x);
    }).sort((a,b)=>Date.parse(observed(b))-Date.parse(observed(a)));
  }

  function chart(){
    const host=$('rhk-ed-bars');host.replaceChildren();
    const days=new Map();
    for(let n=6;n>=0;n--){
      const d=new Date();d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-n);
      days.set(d.toISOString().slice(0,10),0);
    }
    for(const x of state.items){const d=text(observed(x)).slice(0,10);if(days.has(d))days.set(d,days.get(d)+1);}
    const highest=Math.max(1,...days.values());
    for(const [d,n] of days){
      const cell=make('div','rhk-ed-day');cell.title=d+' UTC / '+n+' indexed reports';
      const bar=make('div','rhk-ed-bar');bar.style.height=Math.max(4,n/highest*100)+'%';
      cell.append(make('b','',n),bar,make('small','',d.slice(5)));host.append(cell);
    }
    host.setAttribute('aria-label',Array.from(days,([d,n])=>d+' '+n+' reports').join('; '));
  }
  function sourceHealth(){
    const host=$('rhk-ed-health');host.replaceChildren();
    for(const [name,info] of Object.entries(state.feed.sources||{})){
      const row=make('div','rhk-ed-source-row');
      row.append(make('span','',name),make('strong','',info.status==='ok'?'ONLINE / '+info.itemsFetched:'DEGRADED / '+(info.reason||'unavailable')));
      host.append(row);
    }
  }
  function renderLedger(){
    const reports=filter(), host=$('rhk-ed-list');host.replaceChildren();
    $('rhk-ed-count').textContent=reports.length+' REPORTS';
    if(!reports.length)host.append(make('p','rhk-ed-empty','NO MATCHING REPORTS. THIS DOES NOT PROVE NO EVENTS OCCURRED.'));
    for(const r of reports.slice(0,state.limit)){
      const link=safeUrl(r.articleUrl);if(!link)continue;
      const box=make('article','rhk-ed-report'+(watched(r)?' rhk-ed-watched':''));box.setAttribute('role','listitem');
      const header=make('div','rhk-ed-report-header');
      header.append(make('span','rhk-ed-source-chip',r.sourceType==='gdelt-doc-index'?'GDELT DOC':'GOOGLE RSS'),make('time','',fmt(observed(r))));
      const title=make('a','rhk-ed-title',r.headline);title.href=link;title.target='_blank';title.rel='noopener noreferrer';
      const meta=make('div','rhk-ed-meta',text(r.publisher)+' · '+(r.timestampBasis==='gdelt-first-seen-not-publication'?'INDEX FIRST SEEN':'PUBLISHER DATE')+' · '+(r.categories||[]).join(' / '));
      box.append(header,title,meta,make('small','rhk-ed-unverified','UNVERIFIED REPORT · '+(r.sourceDomain||'SOURCE DOMAIN UNAVAILABLE')));
      host.append(box);
    }
    $('rhk-ed-more').hidden=reports.length<=state.limit;
  }
  function render(){
    if(!state.feed)return;
    const feed=state.feed, hours=age(feed.lastSuccessfulFetchAt);
    const broken=Object.values(feed.sources||{}).filter(x=>x.status!=='ok').length;
    const status=$('rhk-ed-status');
    status.textContent='● '+text(feed.status).toUpperCase()+' / '+(hours<=2?'RECENT':hours<=24?'DELAYED':'STALE')+
      ' · LAST SUCCESSFUL INGEST '+fmt(feed.lastSuccessfulFetchAt)+(broken?' · '+broken+' INDEX(ES) DEGRADED':'');
    status.dataset.health=hours>24?'stale':broken?'partial':'ok';
    const result=filter(), publisherCount=new Set(result.map(x=>text(x.publisher).toLowerCase())).size;
    const gdelt=result.filter(x=>x.sourceType==='gdelt-doc-index').length;
    const stats=[['REPORTS IN WINDOW',result.length],['PUBLISHERS / DOMAINS',publisherCount],['GOOGLE RSS',result.length-gdelt],['GDELT DOC',gdelt]];
    $('rhk-ed-kpis').replaceChildren(...stats.map(([label,count])=>{const v=make('div','rhk-ed-kpi');v.append(make('small','',label),make('strong','',count));return v;}));
    $('rhk-ed-windows').querySelectorAll('button').forEach(b=>b.classList.toggle('active',Number(b.dataset.hours)===state.hours));
    chart();sourceHealth();renderLedger();
  }
  function csvField(v){return '"'+text(v).replace(/"/g,'""')+'"';}
  function exportCsv(){
    const data=filter();if(!data.length)return;
    const keys=['headline','publisher','sourceType','categories','observedAt','timestampBasis','publishedAt','indexedAt','articleUrl','verification'];
    const lines=[keys.join(',')];
    for(const r of data)lines.push(keys.map(k=>csvField(k==='categories'?(r.categories||[]).join('|'):r[k])).join(','));
    const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
    const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='rhkearth-iran-ledger-'+new Date().toISOString().slice(0,10)+'.csv';
    document.body.append(a);a.click();a.remove();URL.revokeObjectURL(u);
  }
  async function copyDigest(){
    const list=filter().slice(0,20);
    const summary=['RHKEARTH // SOURCE DIGEST','Generated '+new Date().toISOString(),'Snapshot '+text(state.feed?.lastSuccessfulFetchAt),
      'Reported coverage only. No independent event verification.','',...list.map((r,i)=>(i+1)+'. '+r.headline+' | '+r.publisher+' | '+observed(r)+' | '+r.articleUrl)].join('\n');
    try{await navigator.clipboard.writeText(summary);$('rhk-ed-digest').textContent='COPIED';setTimeout(()=>$('rhk-ed-digest').textContent='COPY DIGEST',1400);}
    catch(e){$('rhk-ed-digest').textContent='COPY UNAVAILABLE';}
  }
  async function load(){
    $('rhk-ed-status').textContent='FETCHING PUBLIC REPORTING INDEX…';
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
      const res=await fetch(FEED,{cache:'no-store',signal:controller.signal});
      if(!res.ok)throw Error('HTTP '+res.status);
      const data=await res.json();
      if(![1,2].includes(data.schemaVersion)||!Array.isArray(data.items)||!data.sources)throw Error('Invalid snapshot schema');
      state.feed=data;state.items=data.items.filter(x=>x&&typeof x.headline==='string'&&safeUrl(x.articleUrl));render();
    }catch(e){$('rhk-ed-status').textContent='INDEX REQUEST FAILED · '+text(e.message||e)+(state.feed?' · PREVIOUS SNAPSHOT RETAINED':'');}
    finally{clearTimeout(timer);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();