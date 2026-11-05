/* War Inc Calcolatore — Navigazione e avvio: va caricato per ultimo */
"use strict";
/* =====================================================================
   NAVIGAZIONE E AVVIO
   ===================================================================== */
function showPage(p){
  document.querySelectorAll("#tabs button").forEach(x=>x.classList.toggle("on",x.dataset.p===p));
  document.querySelectorAll("section.page").forEach(s=>s.classList.toggle("on",s.id==="p-"+p));
  lsSet(LS_KEY+"-page",p);
  if(p==="mine"){ renderMineForm(); renderMine(); }
}
$("#tabs").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; showPage(b.dataset.p); window.scrollTo(0,0); });
$("#themeBtn").onclick=()=>{
  const r=document.documentElement, dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;
  r.dataset.theme=dark?"light":"dark"; lsSet(LS_KEY+"-theme",r.dataset.theme);
};
{ const t=lsGet(LS_KEY+"-theme"); if(t) document.documentElement.dataset.theme=t; }

function renderAll(){ renderInputs(); renderSettings(); recalcNow(); }
renderAll();
{ const p=lsGet(LS_KEY+"-page"); if(p&&["calc","set","info"].includes(p)) showPage(p); }
