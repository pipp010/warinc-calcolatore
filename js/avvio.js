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

function renderAll(){ renderInputs(); renderSettings(); recalcNow(); renderTierList(); }
renderAll();
// all'avvio si apre sempre il Calcolatore; la sezione nascosta Formazioni si apre con #formazioni nell'indirizzo
// (funziona con #formazioni o ?formazioni, anche cambiando l'indirizzo a pagina già aperta; dopo la prima volta la scheda resta visibile in questo browser)
const fmWanted=()=>/formazioni/i.test(location.hash+location.search);
const fmReveal=()=>{ $('#tabs [data-p="form"]').hidden=false; lsSet(LS_KEY+"-showform","1"); };
if(lsGet(LS_KEY+"-showform")==="1") $('#tabs [data-p="form"]').hidden=false;
if(fmWanted()){ fmReveal(); showPage("form"); } else showPage("calc");
addEventListener("hashchange",()=>{ if(fmWanted()){ fmReveal(); showPage("form"); window.scrollTo(0,0); } });

// messaggio di benvenuto: suggerisce la guida a ogni avvio, finché non si spunta «Non mostrare più»
{ const dlg=$("#guideDlg"), close=()=>{ if($("#guideDlgHide").checked) lsSet(LS_KEY+"-noguide","1"); dlg.close(); };
  $("#guideDlgClose").onclick=close;
  $("#guideDlgGo").onclick=()=>{ close(); showPage("info"); window.scrollTo(0,0); };
  dlg.addEventListener("cancel",()=>{ if($("#guideDlgHide").checked) lsSet(LS_KEY+"-noguide","1"); });   // tasto Esc
  if(lsGet(LS_KEY+"-noguide")!=="1"&&dlg.showModal) dlg.showModal(); }

/* ===== Installazione come app (banner in alto) ===== */
if("serviceWorker" in navigator&&location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
{
  const bar=$("#instBar"), KEY=LS_KEY+"-noinstall";
  const installed=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  let evt=null;
  const show=()=>{ if(!installed&&lsGet(KEY)!=="1") bar.hidden=false; };
  const hide=()=>{ bar.hidden=true; };
  // Chrome, Edge, Android: il browser ci dà l'evento e il tasto apre la sua finestra di installazione
  addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); evt=e; show(); });
  addEventListener("appinstalled",()=>{ hide(); lsSet(KEY,"1"); });
  // iPhone/iPad: Safari non permette di chiederlo, spieghiamo come fare
  if(ios&&!installed){ $("#instTxt").innerHTML="Tocca <b>Condividi</b> <span aria-hidden=\"true\">⬆️</span> in basso e poi <b>«Aggiungi alla schermata Home»</b>."; $("#instGo").hidden=true; $("#instNo").textContent="Ho capito"; show(); }
  $("#instGo").onclick=async()=>{ if(!evt) return; evt.prompt(); const r=await evt.userChoice.catch(()=>null); evt=null; hide(); if(r&&r.outcome==="dismissed") lsSet(KEY,"1"); };
  $("#instNo").onclick=()=>{ hide(); lsSet(KEY,"1"); };
}
