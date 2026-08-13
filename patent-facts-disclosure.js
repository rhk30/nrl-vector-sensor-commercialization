(()=>{'use strict';
const grid=document.querySelector('.patent-fact-grid');
if(!grid||grid.dataset.rhkDisclosure==='1')return;
grid.dataset.rhkDisclosure='1';
const items=Array.from(grid.children);
if(items.length<=6)return;

// Keep the most decision-useful prototype facts in the first scan. All values
// remain on the page and are unchanged; secondary fabrication/model details are
// simply disclosed on demand.
const keyIndexes=[0,1,2,5,6,8];
const key=new Set(keyIndexes);
items.forEach((item,i)=>item.classList.toggle('patent-fact-extended',!key.has(i)));

const control=document.createElement('div');
control.className='patent-fact-disclosure';
control.innerHTML=`
  <div><span>KEY PATENT-REPORTED VALUES</span><small>Six primary facts are shown by default. Extended fabrication, readout and projected-model details remain available below.</small></div>
  <button type="button" aria-expanded="false">View extended patent data</button>`;
grid.insertAdjacentElement('afterend',control);

const style=document.createElement('style');
style.textContent=`
.patent-fact-grid .patent-fact-extended{display:none!important}.patent-fact-grid.show-extended .patent-fact-extended{display:block!important}.patent-fact-disclosure{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 0 2px}.patent-fact-disclosure span,.patent-fact-disclosure small{display:block}.patent-fact-disclosure span{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;color:#a9b59b}.patent-fact-disclosure small{margin-top:4px;max-width:720px;color:#777f77;font:9px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.patent-fact-disclosure button{appearance:none;border:1px solid rgba(169,181,155,.24);background:#0b0d0b;color:#d7dcd4;padding:9px 12px;white-space:nowrap;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em;cursor:pointer}.patent-fact-disclosure button:hover{border-color:rgba(205,216,201,.46);background:#101310}@media(max-width:680px){.patent-fact-disclosure{display:block}.patent-fact-disclosure button{margin-top:10px}}
`;
document.head.appendChild(style);

const button=control.querySelector('button');
button.addEventListener('click',()=>{
  const open=!grid.classList.contains('show-extended');
  grid.classList.toggle('show-extended',open);
  button.setAttribute('aria-expanded',String(open));
  button.textContent=open?'Hide extended patent data':'View extended patent data';
});
})();