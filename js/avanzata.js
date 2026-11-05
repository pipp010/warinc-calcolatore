/* War Inc Calcolatore — Pianificazione avanzata */
"use strict";
/* =====================================================================
   PIANIFICAZIONE AVANZATA — più truppe, più eventi (simulazione)
   ===================================================================== */
function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const qtl=(arr,p)=>{ const a=Array.from(arr).sort((x,y)=>x-y); return a.length?a[Math.min(a.length-1,Math.floor(p*(a.length-1)+0.5))]:0; };
const evDurOf=e=>Math.max(0,Math.round(e.dur!=null?num(e.dur):num(cfg.eventDays,1)));
const evDaysOf=e=>e.dateIso?Math.max(0,Math.round((new Date(e.dateIso+"T00:00:00")-today())/864e5)):num(e.days);
let nextId=1;
function ensureAdvDefaults(){
  ui.goals=ui.goals||[]; ui.events=ui.events||[];
  ui.goals.concat(ui.events).forEach(x=>{ if(x.id>=nextId) nextId=x.id+1; });
  if(!ui.goals.length){ ui.goals.push({id:nextId++,name:"Truppa 1",rarity:ui.rarity||"mythic",target:ui.target||6,qty:ui.qty||1,inv:clone(ui.inv||{})}); }
  if(!ui.events.length){ const w=cfg.sources.findIndex(s=>s.on); ui.events.push({id:nextId++,src:Math.max(0,w),goal:ui.goals[0].id,days:ui.now?0:(ui.days||30),dateIso:"",stop:null,x5:false}); }
}
function srcModes(src){ return stopVariants(src).map(st=>({v:st,l:stopLabel(src,st).slice(3)||"finché serve"})); }

function renderAdvForms(){
  ensureAdvDefaults();
  $("#advGoals").innerHTML=ui.goals.map(g=>{
    let inv=""; for(let L=1;L<=cfg.maxLevel;L++) inv+=`<div class="field"><label>L${L}</label><input type="number" min="0" data-g="${g.id}" data-l="${L}" value="${(g.inv||{})[L]||""}" placeholder="0"></div>`;
    let lv=""; for(let L=2;L<=cfg.maxLevel;L++) lv+=`<option value="${L}" ${+g.target===L?"selected":""}>Livello ${L}</option>`;
    return `<div class="box2" style="margin:0 0 12px">
      <div class="fields">
        <div class="field"><label>Nome</label><input data-g="${g.id}" data-k="name" value="${esc(g.name)}"></div>
        <div class="field"><label>Rarità</label><select data-g="${g.id}" data-k="rarity">${RAR.map(r=>`<option value="${r}" ${g.rarity===r?"selected":""}>${RAR_IT[r]}</option>`).join("")}</select></div>
        <div class="field"><label>Livello da raggiungere</label><select data-g="${g.id}" data-k="target">${lv}</select></div>
        <div class="field"><label>Quante copie a quel livello</label><input type="number" min="1" data-g="${g.id}" data-k="qty" value="${g.qty||1}"></div>
      </div>
      <h3 style="margin-top:12px">Copie già possedute</h3>
      <div class="inv">${inv}</div>
      <div class="row" style="margin-top:8px">${ui.goals.length>1?`<button class="btn" data-delgoal="${g.id}">Elimina truppa</button>`:""}</div>
    </div>`; }).join("");
  const goalOpts=sel=>ui.goals.map(g=>`<option value="${g.id}" ${+sel===g.id?"selected":""}>${esc(g.name)}</option>`).join("");
  $("#advEvents").innerHTML=`<tr><th>Evento</th><th>Truppa</th><th>Inizia tra (giorni)</th><th>oppure il</th><th>Finisce il</th><th>Come giocarlo</th><th>×5</th><th></th></tr>`+
    ui.events.map(e=>{ const src=cfg.sources[e.src]||cfg.sources[0]; const modes=srcModes(src); if(e.stop==null||!modes.some(m=>m.v===e.stop)) e.stop=modes[0].v; const d=evDaysOf(e);
      return `<tr>
        <td><select data-e="${e.id}" data-k="src">${cfg.sources.map((s,i)=>s.on?`<option value="${i}" ${+e.src===i?"selected":""}>${esc(s.name)}</option>`:"").join("")}</select></td>
        <td><select data-e="${e.id}" data-k="goal">${goalOpts(e.goal)}</select></td>
        <td><input type="number" min="0" data-e="${e.id}" data-k="days" value="${d}" style="max-width:90px"></td>
        <td><input type="date" data-e="${e.id}" data-k="dateIso" value="${isoDate(addDays(d))}" min="${isoDate(today())}"></td>
        <td><input type="date" data-e="${e.id}" data-k="end" value="${isoDate(addDays(d+evDurOf(e)))}" min="${isoDate(addDays(d))}"></td>
        <td><select data-e="${e.id}" data-k="stop">${modes.map(m=>`<option value="${m.v}" ${m.v===e.stop?"selected":""}>${esc(m.l)}</option>`).join("")}</select></td>
        <td>${src.type==="board"&&(+src.multi||1)>1?`<input type="checkbox" data-e="${e.id}" data-k="x5" ${e.x5?"checked":""}>`:"—"}</td>
        <td><button class="btn" data-delev="${e.id}">✕</button></td></tr>`; }).join("");
}
$("#advGoals").addEventListener("input",e=>{ const g=ui.goals.find(x=>x.id===+e.target.dataset.g); if(!g) return;
  if(e.target.dataset.l){ g.inv=g.inv||{}; g.inv[e.target.dataset.l]=num(e.target.value); }
  else if(e.target.dataset.k==="name"){ g.name=e.target.value; }
  else if(e.target.dataset.k==="qty"){ g.qty=num(e.target.value,1); }
  saveUi(); recalc(); });
$("#advGoals").addEventListener("change",e=>{ const g=ui.goals.find(x=>x.id===+e.target.dataset.g); if(!g) return; const k=e.target.dataset.k;
  if(k==="rarity") g.rarity=e.target.value; else if(k==="target") g.target=+e.target.value; else if(k==="name"){ renderAdvForms(); }
  saveUi(); recalc(); });
$("#advGoals").addEventListener("click",e=>{ const id=+e.target.dataset.delgoal; if(!id) return; ui.goals=ui.goals.filter(g=>g.id!==id);
  ui.events.forEach(ev=>{ if(ev.goal===id) ev.goal=ui.goals[0].id; }); saveUi(); renderAdvForms(); recalc(); });
$("#addGoal").onclick=()=>{ ensureAdvDefaults(); ui.goals.push({id:nextId++,name:`Truppa ${ui.goals.length+1}`,rarity:"mythic",target:6,qty:1,inv:{}}); saveUi(); renderAdvForms(); recalc(); };
$("#advEvents").addEventListener("change",e=>{ const ev=ui.events.find(x=>x.id===+e.target.dataset.e); if(!ev) return; const k=e.target.dataset.k, v=e.target.value;
  if(k==="src"){ ev.src=+v; ev.stop=null; ev.x5=false; }
  else if(k==="goal") ev.goal=+v;
  else if(k==="days"){ ev.days=num(v); ev.dateIso=""; }
  else if(k==="dateIso"){ if(v){ ev.dateIso=v; } }
  else if(k==="end"){ if(v){ const end=Math.round((new Date(v+"T00:00:00")-today())/864e5); ev.dur=Math.max(0,end-evDaysOf(ev)); } }
  else if(k==="stop") ev.stop=+v;
  else if(k==="x5") ev.x5=e.target.checked;
  saveUi(); renderAdvForms(); recalc(); });
$("#advEvents").addEventListener("click",e=>{ const id=+e.target.dataset.delev; if(!id) return; ui.events=ui.events.filter(x=>x.id!==id); saveUi(); renderAdvForms(); recalc(); });
$("#addEvent").onclick=()=>{ ensureAdvDefaults(); const last=ui.events[ui.events.length-1]; ui.events.push({id:nextId++,src:last?last.src:0,goal:ui.goals[ui.goals.length-1].id,days:(last?evDaysOf(last):0)+30,dateIso:"",stop:null,x5:false}); saveUi(); renderAdvForms(); recalc(); };

// prepara un evento per la simulazione
function prepEvent(e,goal){
  const src=cfg.sources[e.src], stop=+e.stop||0, rar=goal.rarity;
  const ms=parseMilestones(src.milestones).filter(m=>!stop||m.at<=stop), at=new Map();
  ms.forEach(m=>{ if(!at.has(m.at)) at.set(m.at,[]); at.get(m.at).push(m); });
  if(src.type==="board"){
    const bonus=new Map(); ms.filter(m=>m.type==="card"&&m.rarity==="mythic").forEach(m=>bonus.set(m.at,(bonus.get(m.at)||0)+m.copies));
    return {board:true,src,stop,ok:rar==="mythic",M:Math.max(1,+src.cards||12),h:Math.max(1,+src.hits||1),m:e.x5?Math.max(1,+src.multi||1):1,bonus,cost:+src.cost||0};
  }
  const pool=Math.max(1,+src.pool[rar]||1), P=(src.rates[rar]||[]).map(x=>({p:x.p/pool,c:x.c})).filter(x=>x.p>0);
  const hasMs=ms.some(m=>m.type==="card"&&m.rarity===rar);
  return {board:false,src,stop,ok:P.length>0||hasMs,P,at,pool,rar,cost:+src.cost||0};
}
function simulateAdv(goals,evs,runs){
  const R=rng(20261105), nE=evs.length;
  const spend=evs.map(()=>new Float64Array(runs)), cum=evs.map(()=>new Float64Array(runs)), done=new Float64Array(nE);
  const fin=goals.map(()=>0); let allDone=0; const fsArr=new Float64Array(runs), tot=new Float64Array(runs);
  for(let r=0;r<runs;r++){
    const c=goals.map(()=>0); let scrolls=num(ui.scrolls), acc=0, fs=0;
    for(let i=0;i<nE;i++){
      const e=evs[i], gi=e.gi, N=goals[gi].N; let cost=0;
      if(e.p.ok&&c[gi]<N){
        if(e.p.board){
          const P=e.p; let u=0,j=0;
          while(c[gi]<N&&(!P.stop||u<P.stop)&&u<200000){
            let k=(P.m>1&&N-c[gi]>=P.m)?P.m:1; if(P.stop&&k>P.stop-u) k=1;
            cost+=k*P.cost; for(let x=u+1;x<=u+k;x++){ const b=P.bonus.get(x); if(b) c[gi]+=b; }
            u+=k; if(R()<P.h/(P.M-j)){ c[gi]+=k; j=0; } else j++;
          }
        } else {
          const P=e.p; let s=0;
          while(c[gi]<N&&(!P.stop||s<P.stop)&&s<200000){
            s++; if(P.src.scrolls&&scrolls>0) scrolls--; else cost+=P.cost;
            let u=R(), a=0; for(const o of P.P){ a+=o.p; if(u<a){ c[gi]+=o.c; break; } }
            const ms=P.at.get(s); if(ms) for(const m of ms){
              if(m.type==="card"){ if(m.rarity===P.rar&&(m.choose||R()<1/P.pool)) c[gi]+=m.copies; }
              else if(m.type==="gems") cost-=m.amount; else if(m.type==="fs") fs+=m.amount; }
          }
        }
      }
      cost=Math.max(0,cost); spend[i][r]=cost; acc+=cost; cum[i][r]=acc; if(c[gi]>=N) done[i]++;
    }
    let all=true; goals.forEach((g,gi)=>{ if(c[gi]>=g.N) fin[gi]++; else all=false; }); if(all) allDone++;
    fsArr[r]=fs; tot[r]=acc;
  }
  return {spend,cum,done:Array.from(done,x=>x/runs),fin:fin.map(x=>x/runs),allDone:allDone/runs,fsArr,tot};
}
// piano di spesa con le gemme che servono a ogni data (cumulative)
function cashPlan(sched){
  const own=num(ui.gems), ED=0, H=sched.reduce((m,e)=>Math.max(m,e.tp),0);
  const cards=cfg.cards.filter(c=>c.on&&c.days>0); let best=null;
  for(let mask=0;mask<(1<<cards.length);mask++){
    const used=cards.filter((c,i)=>mask&(1<<i));
    const inc=t=>own+freeAt(t)+used.reduce((s,c)=>s+cardGems(c,t).gems,0);
    let R=0; sched.forEach(e=>{ R=Math.max(R,e.cum-inc(e.tp)); });
    const bp=buyPlan(Math.ceil(R),H); if(!bp) continue;
    const eurC=used.reduce((s,c)=>s+cardGems(c,H+ED).eur,0), tot=eurC+bp.cost;
    if(!best||tot<best.cost-1e-9) best={cost:tot,free:Math.floor(freeAt(H+ED)),used:used.map(c=>({c,...cardGems(c,H+ED)})),bp,events:true,H,HZ:H,R,sched};
  }
  return best;
}
function advRecalc(){
  ensureAdvDefaults();
  const goals=ui.goals.map(g=>{ const mp=planMerge(g.inv||{},Math.min(+g.target||2,cfg.maxLevel),Math.max(1,g.qty|0),g.rarity,ui.disc); return {...g,mp,N:mp.cardsMissing}; });
  const evs=ui.events.map((e,idx)=>{ const gi=ui.goals.findIndex(g=>g.id===e.goal); const g=goals[gi<0?0:gi]; return {e,idx,gi:gi<0?0:gi,t:evDaysOf(e),dur:evDurOf(e),p:prepEvent(e,g)}; })
    .sort((a,b)=>a.t-b.t||a.idx-b.idx);
  const runs=Math.max(500,Math.min(3000,Math.floor(4e6/Math.max(1,goals.reduce((s,g)=>s+g.N,0)*40))));
  const S=simulateAdv(goals,evs,runs);
  const sc=[["typ",.5],["bad",.9]].map(([key,p])=>{
    const sched=evs.map((ev,i)=>({t:ev.t,tp:ev.t+(ui.playLast?Math.max(0,ev.dur-1):0),cum:qtl(S.cum[i],p)}));
    const plan=cashPlan(sched); const need=qtl(S.tot,p);
    return {key,p,need,plan};
  });
  const forgeNeed=goals.reduce((s,g)=>s+g.mp.forge,0), fsMed=qtl(S.fsArr,.5), forgeMiss=Math.max(0,forgeNeed-num(ui.forge)-fsMed);
  $("#advTitle").innerHTML=`${goals.length} ${goals.length===1?"truppa":"truppe"}, ${evs.length} ${evs.length===1?"evento":"eventi"} · simulazione di ${fmt(runs)} partite complete.`;
  $("#advSummary").innerHTML=sc.map(s=>{ const ok=s.key==="typ", buy=s.plan?Math.ceil(s.plan.R):null;
    return `<div class="scen ${ok?"ok":"ko"}"><h4>${ok?"Se va normalmente":"Se va male"}</h4><div class="hint">${ok?"basta 1 volta su 2":"basta 9 volte su 10 — sei tranquillo"}</div>
      <div class="kv">
        <div>Gemme da spendere in tutto</div><div>${fmt(s.need)}</div>
        <div>Gemme che non arrivano da gratis/pass</div><div class="${buy>0?"bad":"good"}">${fmt(buy)}</div>
        <div>Pietre forgia mancanti</div><div class="${forgeMiss>0?"bad":"good"}">${fmt(forgeMiss)}</div>
        <div>Spesa minima per arrivare carico</div><div class="big">${s.plan?eur(s.plan.cost):"—"}</div>
      </div></div>`; }).join("");
  // calendario
  $("#advCal").innerHTML=`<tr><th>Dal → al</th><th>Evento</th><th>Truppa</th><th>Gemme se va normalmente</th><th>Gemme se va male</th><th>Gemme gratis accumulate</th><th>Truppa completa</th></tr>`+
    evs.map((ev,i)=>{ const g=goals[ev.gi], src=ev.p.src, mode=stopLabel(src,ev.p.stop).slice(3)||"finché serve";
      return `<tr><td>${evRange(ev.t,ev.dur)}</td><td class="l">${esc(src.name)} · ${esc(mode)}${ev.e.x5&&src.type==="board"?" · ×"+(src.multi||5):""}${ev.p.ok?"":` <span class="bad">(non dà truppe ${RAR_IT[g.rarity]})</span>`}</td><td>${esc(g.name)}</td><td>${fmt(qtl(S.spend[i],.5))}</td><td>${fmt(qtl(S.spend[i],.9))}</td><td>${fmt(num(ui.gems)+freeAt(ev.t))}</td><td class="${S.done[i]>=.9?"good":S.done[i]<.5?"bad":""}">${fmt(S.done[i]*100,0)}%</td></tr>`; }).join("")+
    `<tr class="best"><td colspan="3">Totale</td><td>${fmt(sc[0].need)}</td><td>${fmt(sc[1].need)}</td><td></td><td>${fmt(S.allDone*100,0)}% tutte</td></tr>`;
  $("#advPlanNote").innerHTML=planNoteTxt(0,true);
  renderPlan("#advPlanTyp",sc[0].plan,0,Math.max(1,sc[0].need-num(ui.gems)));
  renderPlan("#advPlanBad",sc[1].plan,0,Math.max(1,sc[1].need-num(ui.gems)));
  if(sc[0].plan&&sc[0].plan.R<=0) $("#advPlanTyp").innerHTML=`<tr><td class="good">Bastano le gemme gratis e quelle che hai: non serve comprare niente.</td></tr>`;
  { const hz=p=>p?p.HZ:0, whenOf=p=>{ const h=hz(p); return "all'ultimo evento ("+(h<=0?"oggi":itDate(addDays(h)))+")"; };
    const fl=sc.map(x=>x.plan?gemFlow(x.plan,x.need,hz(x.plan)):null);
    renderFlow("#advFlowTyp",fl[0],whenOf(sc[0].plan)); renderFlow("#advFlowBad",fl[1],whenOf(sc[1].plan));
    const P=sc[1].plan; let prev=0; const steps=P&&P.sched?[...P.sched].sort((a,b)=>a.tp-b.tp).map(e=>{ const v=e.cum-prev; prev=e.cum; return {t:e.tp,v}; }).filter(x=>x.v>0):[];
    renderHow("#advPlanHow",{typ:fl[0],bad:fl[1],plan:P,when:whenOf(P),steps}); }
  if(sc[1].plan&&sc[1].plan.R<=0) $("#advPlanBad").innerHTML=`<tr><td class="good">Bastano le gemme gratis e quelle che hai: non serve comprare niente.</td></tr>`;
  $("#advGoalTable").innerHTML=`<tr><th>Truppa</th><th>Obiettivo</th><th>Copie L1 da ottenere</th><th>Eventi</th><th>Pietre forgia</th><th>Probabilità di completarla</th></tr>`+
    goals.map((g,gi)=>`<tr><td>${esc(g.name)}</td><td><span class="r-${g.rarity}">${RAR_IT[g.rarity]}</span> · ${g.qty}× L${g.target}</td><td>${fmt(g.N)}</td><td>${evs.filter(e=>e.gi===gi).length}</td><td>${fmt(g.mp.forge)}</td><td class="${S.fin[gi]>=.9?"good":S.fin[gi]<.5?"bad":""}">${g.N<=0?"già fatta":fmt(S.fin[gi]*100,0)+"%"}</td></tr>`).join("");
  // suggerimenti
  const t=[], add=(cls,h)=>t.push(`<li class="${cls}">${h}</li>`);
  goals.forEach((g,gi)=>{
    const n=evs.filter(e=>e.gi===gi).length;
    if(g.N<=0) add("good",`<b>${esc(g.name)}</b>: hai già le copie, restano solo le fusioni.`);
    else if(!n) add("bad",`<b>${esc(g.name)}</b>: nessun evento assegnato. Aggiungine uno nella tabella degli eventi.`);
    else if(S.fin[gi]<.9) add(S.fin[gi]<.5?"bad":"",`<b>${esc(g.name)}</b>: con questi eventi la completi solo il <b>${fmt(S.fin[gi]*100,0)}%</b> delle volte. Aggiungi un evento, oppure gioca l'ultimo «a oltranza».`);
    else add("good",`<b>${esc(g.name)}</b>: la completi il ${fmt(S.fin[gi]*100,0)}% delle volte.`);
  });
  const same=new Map(); evs.forEach(e=>{ const w=Math.floor(e.t/7); same.set(w,(same.get(w)||0)+1); });
  if([...same.values()].some(v=>v>1)) add("",`Ci sono più eventi nella stessa settimana: il calendario tiene conto che le gemme sono le stesse per tutti.`);
  if(evs.some(e=>e.e.x5&&e.p.src.type==="board")) add("",`Asso carte ×5: non fa risparmiare gemme ma rende il risultato più variabile (un tabellone sfortunato costa fino a ${fmt((+cfg.sources.find(s=>s.type==="board").cards||12)*(+cfg.sources.find(s=>s.type==="board").cost||250)*5)} gemme).`);
  if(Object.values(ui.passes||{}).some(v=>v>0)) add("","I pass già attivi sono contati: le gemme giornaliere fino alla scadenza sono gratis, il rinnovo si paga solo dopo.");
  if(forgeMiss>0) add("bad",`Ti mancano circa <b>${fmt(forgeMiss)}</b> pietre forgia per tutte le fusioni.`);
  $("#advTips").innerHTML=tipsHtml(t);
  if(ui.zero) renderZeroAdv(sc,evs);
}
function applyAdvVisibility(){
  const on=!!ui.adv;
  $("#advOn").checked=on; $("#zeroOn").checked=!!ui.zero; document.body.classList.toggle("zero",!!ui.zero);
  $("#advSection").style.display=on?"":"none";
  $("#cardWant").style.display=on?"none":"";
  $("#cardRes").style.display=on?"none":"";
  $("#invBlock").style.display=on?"none":"";
  $("#calcCols").classList.toggle("one",on);
  $("#advPlay").value=ui.playLast?"last":"first";
  if(on) renderAdvForms();
}
$("#advPlay").onchange=e=>{ ui.playLast=e.target.value==="last"; $("#wPlay").value=e.target.value; saveUi(); recalc(); };
$("#zeroOn").onchange=e=>{ ui.zero=e.target.checked; saveUi(); renderPasses(); applyAdvVisibility(); recalc(); };
$("#advOn").onchange=e=>{ ui.adv=e.target.checked; saveUi(); applyAdvVisibility(); recalc(); };

const ratesToStr=a=>(a||[]).map(e=>`${+(e.p*100).toFixed(4)}%x${e.c}`).join(" + ");
function strToRates(s){ const out=[]; (s||"").split(/[+;]/).forEach(t=>{ const m=t.trim().replace(",",".").match(/^([\d.]+)\s*%?\s*(?:x\s*(\d+))?$/i); if(m) out.push({p:(+m[1])/100,c:+(m[2]||1)}); }); return out; }
const changed=()=>{ save(); renderModeOptions(); recalc(); };

function renderSettings(){
  $("#sEventDays").value=cfg.eventDays;
  $("#sMaxLevel").value=cfg.maxLevel; $("#sMergeSize").value=cfg.mergeSize; $("#sDiscPct").value=cfg.discount.pct;
  renderForge(); renderSources(); renderHq(); renderFree(); renderCards(); renderGp(); renderPacks(); renderConv();
}
$("#sEventDays").oninput=e=>{ cfg.eventDays=Math.max(1,+e.target.value||7); save(); recalc(); };
$("#sMaxLevel").onchange=e=>{ cfg.maxLevel=Math.max(2,Math.min(15,+e.target.value||9)); save(); renderForge(); renderInputs(); recalc(); };
$("#sMergeSize").onchange=e=>{ cfg.mergeSize=Math.max(2,+e.target.value||2); save(); renderInputs(); recalc(); };
$("#sDiscPct").oninput=e=>{ cfg.discount.pct=Math.max(0,Math.min(100,+e.target.value||0)); save(); $("#discPctLbl").textContent=cfg.discount.pct; recalc(); };

function renderForge(){
  let h=`<tr><th>Rarità</th>`; for(let L=2;L<=cfg.maxLevel;L++) h+=`<th>L${L-1}→L${L}</th>`; h+="</tr>";
  RAR.forEach(r=>{ h+=`<tr><td class="r-${r}"><b>${RAR_IT[r]}</b></td>`; for(let L=2;L<=cfg.maxLevel;L++) h+=`<td><input type="number" min="0" data-r="${r}" data-l="${L}" value="${(cfg.forge[r]||{})[L]||0}"></td>`; h+="</tr>"; });
  $("#forgeTable").innerHTML=h;
}
$("#forgeTable").addEventListener("change",e=>{ const r=e.target.dataset.r,L=e.target.dataset.l; if(!r) return; (cfg.forge[r]=cfg.forge[r]||{})[L]=num(e.target.value); changed(); });

function renderSources(){
  $("#srcList").innerHTML=cfg.sources.map((s,i)=>s.type==="board"?boardSrcHtml(s,i):`
  <details class="box2"><summary>${esc(s.name)} · ${fmt(s.cost)} 💎 a tentativo ${s.on?"":"· disattivata"}</summary>
    <div class="fields" style="margin-top:12px">
      <div class="field"><label>Nome</label><input data-s="${i}" data-k="name" value="${esc(s.name)}"></div>
      <div class="field"><label>Gemme per tentativo</label><input type="number" data-s="${i}" data-k="cost" value="${s.cost}"></div>
      <div class="field"><label>Fermati a (es. 100)</label><input data-s="${i}" data-k="stops" value="${esc(s.stops||"")}" placeholder="non fermarti"></div>
      <div class="field"><label>Giorni tra un evento e l'altro</label><input type="number" min="1" data-s="${i}" data-k="every" value="${s.every||30}"></div>
      <div class="field"><label>Nome dei tentativi</label><input data-s="${i}" data-k="unit" value="${esc(s.unit||"")}" placeholder="giri"></div>
      <div class="field"><label class="check"><input type="checkbox" data-s="${i}" data-k="on" ${s.on?"checked":""}> Attiva</label></div>
      <div class="field"><label class="check"><input type="checkbox" data-s="${i}" data-k="continuous" ${s.continuous?"checked":""}> Proponi anche «a oltranza»</label></div>
      <div class="field"><label class="check"><input type="checkbox" data-s="${i}" data-k="scrolls" ${s.scrolls?"checked":""}> Usa le pergamene</label></div>
    </div>
    <div class="tw" style="margin-top:12px"><table><tr><th>Rarità</th><th>Probabilità × copie</th><th>Pool</th><th>Per la truppa che vuoi</th></tr>
    ${RAR.map(r=>{ const tot=(s.rates[r]||[]).reduce((a,e)=>a+e.p*e.c,0); return `<tr><td class="r-${r}">${RAR_IT[r]}</td><td><input data-s="${i}" data-rate="${r}" value="${ratesToStr(s.rates[r])}" placeholder="—"></td><td><input type="number" min="1" data-s="${i}" data-pool="${r}" value="${s.pool[r]||1}"></td><td>${tot?fmt(tot/(s.pool[r]||1)*100,3)+"% copie a tentativo":"—"}</td></tr>`; }).join("")}
    </table></div>
    <div class="field" style="margin-top:12px"><label>Traguardi</label><textarea rows="5" data-s="${i}" data-k="milestones">${esc(s.milestones||"")}</textarea></div>
    <div class="field" style="margin-top:8px"><label>Note</label><input data-s="${i}" data-k="note" value="${esc(s.note||"")}"></div>
    <div class="row" style="margin-top:10px"><button class="btn" data-delsrc="${i}">Elimina fonte</button></div>
  </details>`).join("");
}
function boardSrcHtml(s,i){
  const d=boardFirstHit(Math.max(1,+s.cards||12),Math.max(1,+s.hits||1)), mf=d.reduce((a,p,k)=>a+p*k,0);
  return `
  <details class="box2"><summary>${esc(s.name)} · tabellone · ${fmt(s.cost)} 💎 a carta ${s.on?"":"· disattivata"}</summary>
    <div class="fields" style="margin-top:12px">
      <div class="field"><label>Nome</label><input data-s="${i}" data-k="name" value="${esc(s.name)}"></div>
      <div class="field"><label>Gemme per carta girata (×1)</label><input type="number" data-s="${i}" data-k="cost" value="${s.cost}"></div>
      <div class="field"><label>Carte nel tabellone</label><input type="number" min="1" data-s="${i}" data-k="cards" value="${s.cards}"></div>
      <div class="field"><label>Carte col mitico</label><input type="number" min="1" data-s="${i}" data-k="hits" value="${s.hits}"></div>
      <div class="field"><label>Moltiplicatore (costo, premio, traguardi)</label><input type="number" min="1" data-s="${i}" data-k="multi" value="${s.multi}"></div>
      <div class="field"><label>Fermati a (carte girate)</label><input data-s="${i}" data-k="stops" value="${esc(s.stops||"")}" placeholder="non fermarti"></div>
      <div class="field"><label>Giorni tra un evento e l'altro</label><input type="number" min="1" data-s="${i}" data-k="every" value="${s.every||30}"></div>
      <div class="field"><label class="check"><input type="checkbox" data-s="${i}" data-k="continuous" ${s.continuous?"checked":""}> Proponi anche «a oltranza»</label></div>
      <div class="field"><label class="check"><input type="checkbox" data-s="${i}" data-k="on" ${s.on?"checked":""}> Attiva</label></div>
    </div>
    <p class="muted">In media servono <b>${fmt(mf,2)}</b> carte per trovare il mitico → ${fmt(mf*s.cost)} gemme a copia senza traguardi.</p>
    <div class="field"><label>Traguardi (carte girate: premio)</label><textarea rows="4" data-s="${i}" data-k="milestones">${esc(s.milestones||"")}</textarea></div>
    <div class="field" style="margin-top:8px"><label>Note</label><input data-s="${i}" data-k="note" value="${esc(s.note||"")}"></div>
    <div class="row" style="margin-top:10px"><button class="btn" data-delsrc="${i}">Elimina fonte</button></div>
  </details>`;
}
$("#srcList").addEventListener("change",e=>{
  const t=e.target,i=t.dataset.s; if(i==null) return; const s=cfg.sources[i];
  if(t.dataset.rate) s.rates[t.dataset.rate]=strToRates(t.value);
  else if(t.dataset.pool) s.pool[t.dataset.pool]=Math.max(1,+t.value||1);
  else { const k=t.dataset.k; s[k]=(k==="on"||k==="scrolls"||k==="continuous")?t.checked:(["cost","start","cycle","cards","hits","multi","every"].includes(k)?num(t.value):t.value); }
  const open=[...document.querySelectorAll("#srcList details")].map(d=>d.open);
  renderSources(); document.querySelectorAll("#srcList details").forEach((d,j)=>d.open=open[j]);
  changed();
});
$("#srcList").addEventListener("click",e=>{ const d=e.target.dataset.delsrc; if(d==null) return; cfg.sources.splice(+d,1); ui.mode="auto"; saveUi(); renderSources(); changed(); });
$("#addSrc").onclick=()=>{ cfg.sources.push({name:"Nuova fonte",unit:"tentativi",cost:100,on:true,start:0,cycle:0,stops:"",scrolls:false,rates:{mythic:[],legendary:[],epic:[],rare:[],common:[]},pool:{mythic:1,legendary:1,epic:1,rare:1,common:1},milestones:"",note:""}); renderSources(); changed(); };

function renderHq(){
  const lv=Object.keys(cfg.hq.rates).map(Number).sort((a,b)=>a-b);
  $("#hqTable").innerHTML=`<tr><th>Livello</th><th>Gemme all'ora</th><th>Al giorno</th><th>In 30 giorni</th><th></th></tr>`+
    lv.map(l=>`<tr><td>Livello ${l}</td><td><input type="number" min="0" data-hq="${l}" value="${cfg.hq.rates[l]}"></td><td>${fmt(cfg.hq.rates[l]*24)}</td><td>${fmt(cfg.hq.rates[l]*24*30)}</td><td><button class="btn" data-delhq="${l}">✕</button></td></tr>`).join("")+
    `<tr><td colspan="5"><button class="btn" id="addHq">+ Aggiungi livello</button></td></tr>`;
}
$("#hqTable").addEventListener("change",e=>{ const l=e.target.dataset.hq; if(!l) return; cfg.hq.rates[l]=num(e.target.value); renderHq(); renderInputs(); changed(); });
$("#hqTable").addEventListener("click",e=>{
  if(e.target.id==="addHq"){ const lv=Object.keys(cfg.hq.rates).map(Number); cfg.hq.rates[(lv.length?Math.max(...lv):4)+1]=0; renderHq(); renderInputs(); changed(); return; }
  const d=e.target.dataset.delhq; if(!d) return; delete cfg.hq.rates[d]; renderHq(); renderInputs(); saveUi(); changed();
});

function renderFree(){
  $("#freeTable").innerHTML=`<tr><th>Attiva</th><th>Nome</th><th>Gemme al giorno</th><th>In 30 giorni</th><th></th></tr>`+
    (cfg.free||[]).map((f,i)=>`<tr><td><input type="checkbox" data-f="${i}" data-k="on" ${f.on?"checked":""}></td><td><input data-f="${i}" data-k="name" value="${esc(f.name)}"></td><td><input type="number" min="0" data-f="${i}" data-k="daily" value="${f.daily}"></td><td>${fmt(num(f.daily)*30)}</td><td><button class="btn" data-delf="${i}">✕</button></td></tr>`).join("");
}
$("#freeTable").addEventListener("change",e=>{ const i=e.target.dataset.f,k=e.target.dataset.k; if(i==null) return; const f=cfg.free[i]; f[k]=k==="on"?e.target.checked:(k==="name"?e.target.value:num(e.target.value)); renderFree(); changed(); });
$("#freeTable").addEventListener("click",e=>{ const d=e.target.dataset.delf; if(d==null) return; cfg.free.splice(+d,1); renderFree(); changed(); });
$("#addFree").onclick=()=>{ (cfg.free=cfg.free||[]).push({name:"Nuova entrata",daily:0,on:true}); renderFree(); save(); };

function renderCards(){
  $("#cardTable").innerHTML=`<tr><th>Usa</th><th>Nome</th><th>Prezzo €</th><th>Subito</th><th>Al giorno</th><th>Giorni</th><th>Totale</th><th>€ ogni 1.000 gemme</th></tr>`+
    cfg.cards.map((c,i)=>{ const tot=c.upfront+c.daily*c.days; return `<tr><td><input type="checkbox" data-c="${i}" data-k="on" ${c.on?"checked":""}></td><td><input data-c="${i}" data-k="name" value="${esc(c.name)}"></td><td><input type="number" step="0.01" data-c="${i}" data-k="eur" value="${c.eur}"></td><td><input type="number" data-c="${i}" data-k="upfront" value="${c.upfront}"></td><td><input type="number" data-c="${i}" data-k="daily" value="${c.daily}"></td><td><input type="number" data-c="${i}" data-k="days" value="${c.days}"></td><td>${fmt(tot)}</td><td class="good">${tot?eur(c.eur/tot*1000):"—"}</td></tr>`; }).join("");
}
$("#cardTable").addEventListener("change",e=>{ const i=e.target.dataset.c,k=e.target.dataset.k; if(i==null) return; const c=cfg.cards[i]; c[k]=k==="on"?e.target.checked:(k==="name"?e.target.value:num(e.target.value)); renderCards(); changed(); });

function renderGp(){
  $("#gpTable").innerHTML=`<tr><th>Nome</th><th>Prezzo €</th><th>Gemme</th><th>Contiene anche</th><th>Max al giorno</th><th>Max totale</th><th>€ ogni 1.000 gemme</th><th></th></tr>`+
    cfg.gemPacks.map((p,i)=>`<tr><td><input data-g="${i}" data-k="name" value="${esc(p.name)}"></td><td><input type="number" step="0.01" data-g="${i}" data-k="eur" value="${p.eur}"></td><td><input type="number" data-g="${i}" data-k="gems" value="${p.gems}"></td><td><input data-g="${i}" data-k="extra" value="${esc(p.extra||"")}" placeholder="—"></td><td><input type="number" min="0" data-g="${i}" data-k="perDay" value="${p.perDay||0}"></td><td><input type="number" min="0" data-g="${i}" data-k="max" value="${p.max||0}"></td><td>${p.gems>0?eur(p.eur/p.gems*1000):"—"}</td><td><button class="btn" data-delg="${i}">✕</button></td></tr>`).join("");
}
$("#gpTable").addEventListener("change",e=>{ const i=e.target.dataset.g,k=e.target.dataset.k; if(i==null) return; cfg.gemPacks[i][k]=(k==="name"||k==="extra")?e.target.value:num(e.target.value); renderGp(); changed(); });
$("#gpTable").addEventListener("click",e=>{ const d=e.target.dataset.delg; if(d==null) return; cfg.gemPacks.splice(+d,1); renderGp(); changed(); });
$("#addGp").onclick=()=>{ cfg.gemPacks.push({name:"Nuovo",eur:0,gems:0,perDay:0,max:0}); renderGp(); save(); };

function renderPacks(){
  const g=bestGemsPerStone();
  $("#packTable").innerHTML=`<tr><th>Eternity Stone</th><th>Prezzo €</th><th>Quantità</th><th>Max acquisti</th><th>€ ogni 100 Eternity Stone</th><th>€ ogni 1.000 gemme</th><th></th></tr>`+
    cfg.packs.map((p,i)=>`<tr><td><input data-p="${i}" data-k="name" value="${esc(p.name)}"></td><td><input type="number" step="0.01" data-p="${i}" data-k="eur" value="${p.eur}"></td><td><input type="number" data-p="${i}" data-k="gems" value="${p.gems}"></td><td><input type="number" min="0" data-p="${i}" data-k="max" value="${p.max||0}"></td><td>${p.gems>0?eur(p.eur/p.gems*100):"—"}</td><td>${p.gems>0&&g?eur(p.eur/p.gems/g*1000):"—"}</td><td><button class="btn" data-delp="${i}">✕</button></td></tr>`).join("");
}
$("#packTable").addEventListener("change",e=>{ const i=e.target.dataset.p,k=e.target.dataset.k; if(i==null) return; cfg.packs[i][k]=k==="name"?e.target.value:num(e.target.value); renderPacks(); changed(); });
$("#packTable").addEventListener("click",e=>{ const d=e.target.dataset.delp; if(d==null) return; cfg.packs.splice(+d,1); renderPacks(); changed(); });
$("#addPack").onclick=()=>{ cfg.packs.push({name:"Nuovo",eur:0,gems:0,max:0}); renderPacks(); save(); };

function renderConv(){
  $("#convTable").innerHTML=`<tr><th>Eternity Stone</th><th>Gemme</th><th>Gemme per Eternity Stone</th><th></th></tr>`+
    cfg.conv.map((c,i)=>`<tr><td><input type="number" data-v="${i}" data-k="stones" value="${c.stones}"></td><td><input type="number" data-v="${i}" data-k="gems" value="${c.gems}"></td><td>${c.stones?fmt(c.gems/c.stones,1):"—"}</td><td><button class="btn" data-delv="${i}">✕</button></td></tr>`).join("");
}
$("#convTable").addEventListener("change",e=>{ const i=e.target.dataset.v; if(i==null) return; cfg.conv[i][e.target.dataset.k]=num(e.target.value); renderConv(); renderPacks(); changed(); });
$("#convTable").addEventListener("click",e=>{ const d=e.target.dataset.delv; if(d==null) return; cfg.conv.splice(+d,1); renderConv(); renderPacks(); changed(); });
$("#addConv").onclick=()=>{ cfg.conv.push({stones:0,gems:0}); renderConv(); save(); };

// salva / carica configurazione su file
function saveConfigFile(){
  const data={app:"warinc-calcolatore",version:cfg.ver,saved:new Date().toISOString(),settings:cfg,state:ui,prefs:{theme:lsGet(LS_KEY+"-theme")||"",page:lsGet(LS_KEY+"-page")||"calc"}};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download=`warinc-configurazione-${isoDate(today())}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  $("#fileMsg").textContent="Configurazione scaricata ✔";
}
function loadConfigText(txt){
  const o=JSON.parse(txt);
  const settings=o&&o.settings?o.settings:o;          // accetta anche il vecchio formato (solo impostazioni)
  if(!settings||typeof settings!=="object"||!("sources" in settings||"packs" in settings||"forge" in settings)) throw new Error("non sembra un file del calcolatore");
  cfg=loadCfg(JSON.stringify(settings)); save();
  if(o.state&&typeof o.state==="object"){ ui=Object.assign(clone(UI_DEFAULTS),o.state); saveUi(); }
  if(o.prefs&&o.prefs.theme){ document.documentElement.dataset.theme=o.prefs.theme; lsSet(LS_KEY+"-theme",o.prefs.theme); }
  renderAll();
}
$("#loadFile").addEventListener("change",e=>{
  const f=e.target.files&&e.target.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=()=>{ try{ loadConfigText(rd.result); $("#fileMsg").textContent="Configurazione caricata ✔ ("+f.name+")"; showPage("calc"); }
                 catch(err){ $("#fileMsg").textContent="File non valido: "+err.message; showPage("set"); } e.target.value=""; };
  rd.readAsText(f);
});
["#saveFileBtn","#saveFileBtn2"].forEach(id=>$(id).onclick=saveConfigFile);
["#loadFileBtn","#loadFileBtn2"].forEach(id=>$(id).onclick=()=>$("#loadFile").click());
$("#exportBtn").onclick=()=>{ $("#jsonBox").value=JSON.stringify(cfg,null,2); };
$("#importBtn").onclick=()=>{ try{ JSON.parse($("#jsonBox").value); cfg=loadCfg($("#jsonBox").value); save(); renderAll(); $("#jsonBox").value="Importato ✔"; }catch(e){ $("#jsonBox").value="Testo non valido: "+e.message; } };
$("#defaultsBtn").onclick=()=>{ cfg=clone(DEFAULTS); save(); renderAll(); };

