/* War Inc Calcolatore — Impostazioni e pass già attivi */
"use strict";
/* =====================================================================
   IMPOSTAZIONI
   ===================================================================== */
/* =====================================================================
   PASS GIÀ ATTIVI
   ===================================================================== */
const passLeft=c=>ui.zero?0:num((ui.passes||{})[c.name]);
// gemme giornaliere dei pass già attivi fino alla scadenza (gratis: già pagati)
const activeGems=t=>cfg.cards.reduce((s,c)=>s+(passLeft(c)>0?Math.min(Math.max(0,t),passLeft(c))*c.daily:0),0);
const freeAt=t=>freeGems(t)+activeGems(t);
function renderPasses(){
  $("#hPasses").innerHTML=cfg.cards.map((c,i)=>{ const l=passLeft(c); return `<div class="passrow ${l>0?"":"off"}">
    <label class="check"><input type="checkbox" data-pa="${i}" ${l>0?"checked":""}> ${esc(c.name)}</label>
    <span class="when">scade tra <input type="number" min="1" max="${c.days}" data-pl="${i}" value="${l||""}" ${l>0?"":"disabled"}> giorni</span></div>`; }).join("");
}
$("#hPasses").addEventListener("change",e=>{ const i=e.target.dataset.pa; if(i==null) return; const c=cfg.cards[i]; ui.passes=ui.passes||{};
  ui.passes[c.name]=e.target.checked?c.days:0; saveUi(); renderPasses(); recalc(); });
$("#hPasses").addEventListener("input",e=>{ const i=e.target.dataset.pl; if(i==null) return; const c=cfg.cards[i]; ui.passes=ui.passes||{};
  ui.passes[c.name]=Math.max(1,Math.min(c.days,num(e.target.value,1))); saveUi(); recalc(); });

