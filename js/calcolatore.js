/* War Inc Calcolatore — Pagina Calcolatore (modalità semplice) */
"use strict";
/* =====================================================================
   CALCOLATORE — interfaccia
   ===================================================================== */
function renderInputs(){
  $("#hGems").value=ui.gems||""; $("#hScrolls").value=ui.scrolls||""; $("#hForge").value=ui.forge||"";
  const lv=Object.keys(cfg.hq.rates).map(Number).sort((a,b)=>a-b);
  if(!lv.includes(+ui.hqLevel)) ui.hqLevel=lv.includes(5)?5:(lv[0]||5);
  $("#hHq").innerHTML=lv.map(l=>`<option value="${l}" ${l===+ui.hqLevel?"selected":""}>Livello ${l} · ${fmt(cfg.hq.rates[l])} gemme/ora</option>`).join("");
  let g=""; for(let L=1;L<=cfg.maxLevel;L++) g+=`<div class="field"><label>L${L}</label><input type="number" min="0" data-l="${L}" value="${ui.inv[L]||""}" placeholder="0"></div>`;
  $("#hInv").innerHTML=g;
  $("#wRarity").innerHTML=RAR.map(r=>`<option value="${r}" ${ui.rarity===r?"selected":""}>${RAR_IT[r]}</option>`).join("");
  if(+ui.target>cfg.maxLevel) ui.target=cfg.maxLevel;
  let t=""; for(let L=2;L<=cfg.maxLevel;L++) t+=`<option value="${L}" ${+ui.target===L?"selected":""}>Livello ${L} (${fmt(cardsForLevel(L))} carte)</option>`;
  $("#wTarget").innerHTML=t;
  $("#wQty").value=ui.qty||1;
  if(ui.dateIso){ const d=Math.round((new Date(ui.dateIso+"T00:00:00")-today())/864e5); ui.days=Math.max(1,d); }
  $("#wDays").value=ui.days||30; $("#wDate").value=isoDate(addDays(ui.days||30)); $("#wEnd").value=isoDate(addDays((ui.now?0:(ui.days||30))+evDur())); $("#wPlay").value=ui.playLast?"last":"first"; $("#wDate").min=isoDate(addDays(1)); $("#wNow").checked=!!ui.now; $("#wDays").disabled=$("#wDate").disabled=!!ui.now;
  $("#wDisc").checked=!!ui.disc; $("#discPctLbl").textContent=cfg.discount.pct;
  renderModeOptions();
  renderPasses();
  applyAdvVisibility();
}
// sorgente tabellone scelta a mano nella modalità (serve per la casella ×5)
function boardMode(){ const m=String(ui.mode).match(/^(\d+)@/); const s=m&&cfg.sources[+m[1]]; return s&&s.type==="board"?s:null; }
const useX5=()=>!!(ui.x5&&boardMode());
function updateX5Field(){ const b=boardMode(); $("#x5Field").style.display=b?"":"none"; $("#x5Lbl").textContent=b?(b.multi||5):5; $("#wX5").checked=!!ui.x5; }
function renderModeOptions(){
  const opts=[`<option value="auto">Automatica (la più conveniente)</option>`];
  cfg.sources.forEach((s,i)=>{ if(!s.on) return;
    const vs=stopVariants(s);
    vs.forEach(st=>{
      const suf=stopLabel(s,st);
      opts.push(`<option value="${i}@${st}">${esc(s.name)}${suf}</option>`);
    }); });
  $("#wMode").innerHTML=opts.join("");
  $("#wMode").value=ui.mode; if($("#wMode").value!==String(ui.mode)){ ui.mode="auto"; $("#wMode").value="auto"; }
  updateX5Field();
}
const bindNum=(sel,key,min=0)=>$(sel).addEventListener("input",e=>{ ui[key]=num(e.target.value,min); saveUi(); recalc(); });
bindNum("#hGems","gems"); bindNum("#hScrolls","scrolls"); bindNum("#hForge","forge"); bindNum("#wQty","qty",1);
$("#wNow").onchange=e=>{ ui.now=e.target.checked; $("#wDays").disabled=$("#wDate").disabled=ui.now; $("#wEnd").value=isoDate(addDays((ui.now?0:num(ui.days,1))+evDur())); saveUi(); recalc(); };
$("#wDays").addEventListener("input",e=>{ ui.days=num(e.target.value,1); ui.dateIso=""; $("#wDate").value=isoDate(addDays(ui.days)); $("#wEnd").value=isoDate(addDays(ui.days+evDur())); saveUi(); recalc(); });
$("#wEnd").addEventListener("change",e=>{ if(!e.target.value) return; const end=Math.round((new Date(e.target.value+"T00:00:00")-today())/864e5), st=ui.now?0:num(ui.days,1); ui.dur=Math.max(0,end-st); $("#wEnd").value=isoDate(addDays(st+ui.dur)); saveUi(); recalc(); });
$("#wPlay").onchange=e=>{ ui.playLast=e.target.value==="last"; $("#advPlay").value=e.target.value; saveUi(); recalc(); };
$("#wDate").addEventListener("change",e=>{ if(!e.target.value) return; const d=Math.round((new Date(e.target.value+"T00:00:00")-today())/864e5); ui.days=Math.max(1,d); ui.dateIso=e.target.value; $("#wDays").value=ui.days; $("#wEnd").value=isoDate(addDays(ui.days+evDur())); saveUi(); recalc(); });
$("#hHq").onchange=e=>{ ui.hqLevel=+e.target.value; saveUi(); recalc(); };
$("#hInv").addEventListener("input",e=>{ const l=e.target.dataset.l; if(!l) return; ui.inv[l]=num(e.target.value); saveUi(); recalc(); });
$("#invReset").onclick=()=>{ ui.inv={}; saveUi(); renderInputs(); recalc(); };
$("#wRarity").onchange=e=>{ ui.rarity=e.target.value; saveUi(); recalc(); };
$("#wTarget").onchange=e=>{ ui.target=+e.target.value; saveUi(); recalc(); };
$("#wMode").onchange=e=>{ ui.mode=e.target.value; updateX5Field(); saveUi(); recalc(); };
$("#wX5").onchange=e=>{ ui.x5=e.target.checked; saveUi(); recalc(); };
$("#wDisc").onchange=e=>{ ui.disc=e.target.checked; saveUi(); recalc(); };

let recalcTimer=null;
function recalc(){ clearTimeout(recalcTimer); recalcTimer=setTimeout(recalcNow,80); }

// date: l'evento inizia tra D giorni; con le modalità a eventi i successivi arrivano ogni "every" giorni
let LIMIT=0;
// giorni dell'evento in cui si possono ancora spendere gemme guadagnate (es. 7 giorni di durata = 6 giorni in più)
const evDur=()=>Math.max(0,Math.round(ui.dur!=null&&ui.dur!==""?num(ui.dur):num(cfg.eventDays,1)));
// giorni dopo l'inizio in cui si gioca: 0 = primo giorno, durata = ultimo giorno
const evDays=()=>ui.playLast?Math.max(0,evDur()-1):0;   // l'evento si chiude alla data di fine: ultimo giorno giocabile = fine - 1
const playTxt=()=>ui.playLast?"l'ultimo giorno dell'evento (il giorno prima della fine)":"il primo giorno dell'evento";
const today=()=>{ const d=new Date(); d.setHours(0,0,0,0); return d; };
const addDays=n=>{ const d=today(); d.setDate(d.getDate()+n); return d; };
const isoDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const itDate=d=>d.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"});
const evRange=(d,dur)=>`${d<=0?"oggi":itDate(addDays(d))} → ${itDate(addDays(d+dur))}`;
const quando=d=>d<=0?"subito":`tra ${gg(d)} (${itDate(addDays(d))})`;
const lastDay=(r,key)=>LIMIT+(r&&r.stop?(((key==="typ"?r.cycT:r.cycB)||1)-1)*r.every:0);
const durTxt=r=>{ const a=lastDay(r,"typ"), b=lastDay(r,"bad"); const f=d=>d<=0?"subito":itDate(addDays(d)); return a===b?f(a):`${f(a)} – ${f(b)}`; };

// piano a eventi: le gemme servono solo quando arriva ogni ruota/evento (il primo tra D0 giorni)
function eventPlan(row,key,need,D0){
  const C=Math.max(1,key==="typ"?row.cycT:row.cycB), every=row.every, H=D0+(C-1)*every, own=num(ui.gems);
  const cards=cfg.cards.filter(c=>c.on&&c.days>0), fd=freeDaily();
  const sched=[]; for(let k=1;k<=C;k++){ const t=D0+(k-1)*every; sched.push({k,t,spend:Math.max(0,Math.min(row.perCycle,need-(k-1)*row.perCycle)),cum:Math.min(k*row.perCycle,need)}); }
  let best=null;
  for(let mask=0;mask<(1<<cards.length);mask++){
    const used=cards.filter((c,i)=>mask&(1<<i));
    const inc=t=>own+freeAt(t)+used.reduce((s,c)=>s+cardGems(c,t).gems,0), ED=evDays();
    let R=0; sched.forEach(e=>{ R=Math.max(R,e.cum-inc(e.t+ED)); });
    const bp=buyPlan(Math.ceil(R),H+ED); if(!bp) continue;
    const eurC=used.reduce((s,c)=>s+cardGems(c,H+ED).eur,0), tot=eurC+bp.cost;
    if(!best||tot<best.cost-1e-9) best={cost:tot,free:Math.floor(freeAt(H+ED)),used:used.map(c=>({c,...cardGems(c,H+ED)})),bp,fromCards:0,events:true,H,HZ:H+ED,C,sched,R};
  }
  return best;
}
// percorso più economico per una modalità e un'ipotesi
function planFor(row,key,D){
  const need=row[key];
  return row.stop? eventPlan(row,key,need,D) : spendPlan(Math.max(0,need-num(ui.gems)),D+evDays());
}

// "Carte da girare", "Giri da fare", "Evocazioni da fare"
function unitAction(r){ const u=(r.unit||"tentativi").toLowerCase(); const v=r.src.type==="board"?"da girare":"da fare"; return u[0].toUpperCase()+u.slice(1)+" "+v; }
function planNoteTxt(Dp,isEv){
  const gp=cfg.gemPacks.filter(p=>p.perDay>0).map(p=>`${esc(p.name)}: max ${p.perDay} al giorno`).join(", ");
  return `ℹ️ Conti fatti per giocare <b>${playTxt()}</b>${isEv?" di ogni evento":` (${Dp<=0?"oggi":itDate(addDays(Dp))})`}. Prima si contano le gemme che hai, quelle gratis (QG, altre entrate, pass già attivi) e quelle dei pass mensili; solo il resto si compra. ${gp?gp+", da oggi fino al giorno in cui giochi.":""}`;
}
// Consiglio sui mitici che sbloccano la seconda abilità al livello 4
const MYTH4_TIP=`<b>Squadra equilibrata: sfrutta i mitici forti già al livello 4.</b> Alcuni mitici sbloccano la seconda abilità al livello 4, altri solo al 6. Mentre stai crescendo i primi sono preziosissimi: danno il meglio di sé con 8 copie invece di 32. Tienili al livello 4 e portali più su solo quando anche il resto della squadra è all'altezza: un mitico al 6 o al 7 circondato da truppe deboli è come un campione in una squadra di dilettanti, da solo non vince la partita. Meglio una squadra che cresce tutta insieme che puntare tutto su un solo mitico.`;
function tipsHtml(t){
  if(ui.zero) t=t.filter(x=>!/€|compr|pacchett|eternity/i.test(x.replace(/<[^>]+>/g,"")));
  const top=x=>/class="(good|key)"/.test(x), good=t.filter(top), other=t.filter(x=>!top(x));
  return good.join("")+(other.length?`<li class="more"><details><summary>Mostra altri ${other.length} suggeriment${other.length===1?"o":"i"}</summary><ul class="tips" style="margin-top:8px">${other.join("")}</ul></details></li>`:"");
}
function recalcNow(){
  planCache.clear();
  if(ui.adv){ advRecalc(); return; }
  const rar=ui.rarity, target=Math.min(+ui.target||2,cfg.maxLevel), qty=Math.max(1,ui.qty|0), D=ui.now?0:Math.max(1,num(ui.days,1));
  LIMIT=D;
  const who=`truppa <b class="r-${rar}">${RAR_IT[rar]}</b>`;
  const mp=planMerge(ui.inv,target,qty,rar,ui.disc), N=mp.cardsMissing;
  $("#resTitle").innerHTML=`Obiettivo: <b>${qty}</b> ${qty===1?"copia":"copie"} di ${who} a livello <b>${target}</b>. Evento: <b>${evRange(D,evDur())}</b>, conti fatti per giocare <b>${playTxt()}</b>.`;

  const rows=extractionRows(N,rar,num(ui.gems));
  rows.forEach(r=>{ const a=planFor(r,"typ",D), b=planFor(r,"bad",D); r.eurT=a?a.cost:Infinity; r.eurB=b?b.cost:Infinity; });
  // percorso migliore = meno euro (se va normalmente), poi meno euro se va male, poi meno gemme
  if(ui.zero) rows.forEach(r=>{ const a=zeroPlan(r,"typ",D), b=zeroPlan(r,"bad",D); r.zT=a.ready==null?1e9:a.ready; r.zB=b.ready==null?1e9:b.ready; });
  const sorted=ui.zero?[...rows].sort((a,b)=>a.zT-b.zT||a.zB-b.zB||a.typ-b.typ):[...rows].sort((a,b)=>a.eurT-b.eurT||a.eurB-b.eurB||a.typ-b.typ);
  let chosen=ui.mode==="auto"?sorted[0]:rows.find(r=>r.id===String(ui.mode));
  if(!chosen) chosen=sorted[0];
  const ev=!!(chosen&&chosen.stop);

  const sc=["typ","bad"].map(key=>{
    const need=N<=0?0:(chosen?chosen[key]:null);
    const miss=need==null?null:Math.max(0,need-num(ui.gems));
    const fsGot=chosen?(key==="typ"?chosen.fsT:chosen.fsB):0;
    const forgeMiss=Math.max(0,mp.forge-num(ui.forge)-fsGot);
    const plan=miss==null?null:(N>0&&chosen?planFor(chosen,key,D):spendPlan(miss,D));
    return {key,need,miss,plan,forgeMiss,fsGot,last:lastDay(chosen,key),cyc:chosen?(key==="typ"?chosen.cycT:chosen.cycB):null,n:chosen?(key==="typ"?chosen.nT:chosen.nB):null};
  });

  $("#head").innerHTML=
    `<span class="pill">Copie L1 da ottenere: <b>${fmt(N)}</b></span>`+
    `<span class="pill">Fusioni: <b>${fmt(mp.merges)}</b></span>`+
    `<span class="pill">Pietre forgia per le fusioni: <b>${fmt(mp.forge)}</b></span>`+
    (N>0&&chosen?`<span class="pill">Percorso: <b>${esc(chosen.label)}</b></span>`:"")+
    (N>0&&ev?`<span class="pill">Un evento ogni <b>${gg(chosen.every)}</b>, circa <b>${fmt(chosen.perCycle)}</b> gemme a evento</span>`:"");
  const nomeEv=chosen&&chosen.src.type==="board"?"Eventi":"Ruote";
  $("#summary").innerHTML=sc.map(s=>{
    const ok=s.key==="typ";
    const cyc=ev&&N>0?`<div>${nomeEv} da fare (${stopLabel(chosen.src,chosen.stop).slice(3)})</div><div>${fmt(s.cyc)}</div><div>${nomeEv==="Ruote"?"Ultima ruota":"Ultimo evento"}</div><div>${s.last<=0?"subito":itDate(addDays(s.last))}</div>`
      :(s.n!=null&&N>0&&chosen?`<div>${unitAction(chosen)}${chosen.multi?" (a ×"+(chosen.src.multi||5)+" ogni carta vale "+(chosen.src.multi||5)+")":""}</div><div>${fmt(chosen.multi?Math.round(s.n/(+chosen.src.multi||5)):s.n)}</div>`:"");
    const buy=ev&&N>0?(s.plan?Math.ceil(s.plan.R):null):s.miss;
    return `<div class="scen ${ok?"ok":"ko"}"><h4>${ok?"Se va normalmente":"Se va male"}</h4><div class="hint">${ok?"basta 1 volta su 2":"basta 9 volte su 10 — sei tranquillo"}</div>
      <div class="kv"><div>Copie L1 da ottenere</div><div>${fmt(N)}</div>${cyc}
        <div>Gemme da spendere in tutto</div><div>${fmt(s.need)}</div>
        <div>${ev&&N>0?"Gemme che non arrivano da gratis/pass":"Gemme che ti mancano oggi"}</div><div class="${buy>0?"bad":"good"}">${fmt(buy)}</div>
        <div>Pietre forgia mancanti${s.fsGot?` (dopo le ${fmt(s.fsGot)} della ruota)`:""}</div><div class="${s.forgeMiss>0?"bad":"good"}">${fmt(s.forgeMiss)}</div>
        <div>Spesa minima per arrivare carico</div><div class="big">${s.plan?eur(s.plan.cost):"—"}</div>
      </div></div>`;
  }).join("");
  $("#timeWarn").innerHTML="";

  $("#planNote").innerHTML=planNoteTxt(D+evDays(),ev&&N>0);
  renderRiskWarn(chosen,rows,N);
  renderSpinOut(chosen,N,D,rar);
  renderPlan("#planTyp",sc[0].plan,D+evDays(),sc[0].miss);
  renderPlan("#planBad",sc[1].plan,D+evDays(),sc[1].miss);
  { const hz=p=>ev&&N>0&&p?(p.HZ!=null?p.HZ:p.H+evDays()):D+evDays();
    const fl=sc.map(x=>x.need==null||N<=0?null:gemFlow(x.plan,x.need,hz(x.plan)));
    const whenOf=p=>{ const h=hz(p); return (ev&&N>0?(chosen.src.type==="board"?"all'ultimo evento ":"all'ultima ruota "):"al giorno in cui giochi ")+"("+(h<=0?"oggi":itDate(addDays(h)))+")"; };
    renderFlow("#flowTyp",fl[0],whenOf(sc[0].plan)); renderFlow("#flowBad",fl[1],whenOf(sc[1].plan));
    const P=sc[1].plan, steps=ev&&N>0&&P&&P.sched?P.sched.filter(e=>e.spend>0).map(e=>({t:e.t+evDays(),v:e.spend})):[];
    renderHow("#planHow",{typ:fl[0],bad:fl[1],plan:P,when:whenOf(P),steps}); }
  if(ev&&N>0) renderSchedule(sc,chosen); else { $("#waitTitle").textContent="⏳ Quanto spendi in base a quando inizia l'evento"; renderWait(sc,D); }
  renderExtr(sorted,chosen,N);
  renderMergeTable(mp);
  renderGemRank();
  renderTips({N,mp,rows,sorted,chosen,sc,D,rar,target,qty});
  if(ui.zero) renderZeroSimple({chosen,N,D,sc});
}

// calendario evento per evento (ipotesi "se va male", che comprende anche quella normale)
function renderSchedule(sc,row){
  const nome=row.src.type==="board"?"Evento":"Ruota";
  $("#waitTitle").textContent=`📅 Calendario ${row.src.type==="board"?"degli eventi":"delle ruote"} (${stopLabel(row.src,row.stop).slice(3)})`;
  const P=sc[1].plan, T=sc[0].plan; if(!P){ $("#waitTable").innerHTML=""; return; }
  const fd=freeDaily();
  $("#waitTable").innerHTML=`<tr><th>#</th><th>Quando</th><th>Gemme da spendere</th><th>Gemme gratis accumulate</th><th>Totale speso</th><th class="l">Note</th></tr>`+
    P.sched.map(e=>{
      const extra=e.k>(T?T.C:0);
      return `<tr${extra?' style="opacity:.75"':""}><td>${nome} ${e.k}</td><td>${quando(e.t)}</td><td>${fmt(e.spend)}</td><td>${fmt(num(ui.gems)+freeAt(e.t))}</td><td>${fmt(e.cum)}</td><td class="l muted">${extra?"serve solo se va male":""}</td></tr>`;
    }).join("")+
    `<tr class="best"><td colspan="2">Da comprare in tutto</td><td colspan="4" class="l">se va normalmente <b>${fmt(T?Math.ceil(T.R):0)}</b> gemme (${eur(T?T.cost:0)}) · se va male <b>${fmt(Math.ceil(P.R))}</b> gemme (${eur(P.cost)}), pass mensili compresi</td></tr>`;
}

// "Cosa aspettarti dai N giri": traguardi sicuri + copie a caso, distribuzione esatta sui giri della prossima ruota
function spinDist(s,rar,n){
  const pool=Math.max(1,+s.pool[rar]||1), q=[]; let pos=0;
  (s.rates[rar]||[]).forEach(e=>{ q[e.c]=(q[e.c]||0)+e.p/pool; pos+=e.p/pool; });
  for(let i=0;i<q.length;i++) q[i]=q[i]||0; q[0]=Math.max(0,1-pos);
  const ms=parseMilestones(s.milestones).filter(m=>m.type==="card"&&m.rarity===rar), start=+s.start||0;
  const cap=n*(q.length-1)+ms.reduce((a,m)=>a+m.copies*Math.ceil(n/(s.cycle||n)),0)+1;
  let d=new Float64Array(cap+1), nx=new Float64Array(cap+1); d[0]=1;
  for(let k=1;k<=n;k++){
    nx.fill(0); for(let i=0;i<=cap;i++){ const v=d[i]; if(v) for(let c=0;c<q.length;c++) if(q[c]) nx[Math.min(cap,i+c)]+=v*q[c]; } [d,nx]=[nx,d];
    for(const m of milestoneHits(s,ms,start+k)){ const p=m.choose?1:1/pool; nx.fill(0); for(let i=0;i<=cap;i++){ const v=d[i]; if(v){ nx[Math.min(cap,i+m.copies)]+=v*p; nx[i]+=v*(1-p); } } [d,nx]=[nx,d]; }
  }
  let mean=0, acc=0; const P=[]; for(let i=0;i<=cap;i++){ mean+=i*d[i]; acc+=d[i]; P.push(acc); }   // P[x] = prob. di avere al massimo x copie
  // primo x con P[x] oltre la soglia: mediana; "se va male" = almeno x 9 volte su 10; "fortuna" = x o più 1 volta su 10
  const first=(p,strict)=>{ for(let x=0;x<P.length;x++) if(strict?P[x]>p:P[x]>=p) return x; return cap; };
  return {mean, randMean:n*q.reduce((a,v,c)=>a+v*c,0), typ:first(.5), bad:first(.1,true), luck:first(.9,true)};
}
function renderSpinOut(chosen,N,D,rar){
  const el=$("#spinOut"); if(!el) return;
  if(!(N>0&&chosen&&chosen.src.type!=="board"&&!chosen.src.scrolls)){ el.innerHTML=""; return; }
  const src=chosen.src, s=withStop(src,chosen.stop), n=chosen.stop||chosen.nT, u=src.unit||"giri";
  if(!(n>1)){ el.innerHTML=""; return; }
  const st=spinDist(s,rar,n), start=+s.start||0, pool=Math.max(1,+s.pool[rar]||1);
  const hits=[]; for(let a=start+1;a<=start+n;a++) milestoneHits(s,parseMilestones(s.milestones),a).forEach(m=>hits.push({a:a-start,m}));
  const RIT={mythic:"mitica",legendary:"leggendaria",epic:"epica",rare:"rara",common:"comune"};
  const msTxt=hits.map(({a,m})=>`giro ${a}: `+(m.type==="card"?`${m.copies} ${m.copies===1?"copia":"copie"}${m.rarity===rar?"":" "+(RIT[m.rarity]||"")}${!m.choose&&pool>1?" (se esce la tua)":""}`:m.type==="gems"?`${fmt(m.amount)} gemme indietro`:`${fmt(m.amount)} pietre forgia`));
  const sure=hits.filter(h=>h.m.type==="card"&&h.m.rarity===rar&&(h.m.choose||pool===1)).reduce((a,h)=>a+h.m.copies,0);
  const refund=hits.filter(h=>h.m.type==="gems").reduce((a,h)=>a+h.m.amount,0), cost=gemCost(s,n);
  const when=chosen.stop?(D<=0?"di oggi":`della prossima ruota (${itDate(addDays(D))})`):(D<=0?"da fare oggi":`da fare il ${itDate(addDays(D))}`);
  const c=x=>`<b>${fmt(x)}</b> ${x===1?"copia":"copie"}`;
  const li=[];
  if(hits.length) li.push(`<b>Traguardi:</b> ${msTxt.join(" · ")}${sure?` → ${c(sure)} sicure`:""}.`);
  li.push(`<b>Dai giri, a caso:</b> in media ${fmt(st.randMean,1).replace(/,0$/,"")} ${st.randMean===1?"copia":"copie"} in più.`);
  li.push(`<b>In tutto:</b> se va normalmente ${c(st.typ)}, se va male almeno ${c(st.bad)} (9 volte su 10), con un po' di fortuna ${c(st.luck)} o più (1 volta su 10).`);
  li.push(`<b>Costo:</b> ${fmt(n)} ${u} × ${fmt(src.cost)} = ${fmt(n*src.cost)} gemme${refund?`, meno ${fmt(refund)} di rimborso = <b>${fmt(cost)}</b>`:""}.`);
  if(chosen.stop&&N>st.typ) li.push(`Te ne servono ${fmt(N)}: dopo questa ruota, se va normalmente, ne mancano ancora circa <b>${fmt(N-st.typ)}</b>. Fermati a ${fmt(n)} ${u} e aspetta la ruota successiva.`);
  el.innerHTML=`<div class="howbox"><b>🎡 Cosa aspettarti dai ${fmt(n)} ${u} ${when}</b>${chosen.stop?"":`<span class="muted"> (se va male ne servono ${fmt(chosen.nB)})</span>`}<ul>${li.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
}
function renderRiskWarn(chosen,rows,N){
  const el=$("#riskWarn");
  if(!(N>0&&chosen&&chosen.multi)){ el.innerHTML=""; return; }
  const src=chosen.src, m=+src.multi||5, M=+src.cards||12, worst=M*src.cost*m;
  const r1=solveBoard(src,N,false,chosen.stop), b1=pctl(r1.cdf,.9), one=b1==null?null:{bad:b1*src.cost};
  el.innerHTML=`<div class="warn big"><b>⚠️ Attenzione: ${esc(src.name)} ×${m} è più rischioso del ×1.</b>
    <ul>
      <li><b>In media costa uguale:</b> ogni carta girata costa ${m} volte tanto ma il mitico vale ${m} copie, e anche per i traguardi conta ${m}.</li>
      <li><b>Ma fai ${m} volte meno tabelloni</b>, e ognuno è una scommessa: il mitico può uscire alla 1ª carta come alla ${M}ª. Un solo tabellone sfortunato (mitico all'ultima carta) costa <b>${fmt(worst)} gemme</b> e succede 1 volta su ${M}. Con ×1, per essere altrettanto sfortunato devi sbagliare ${m} tabelloni di fila: quasi impossibile.</li>
      <li>Se a fine evento lasci un tabellone a metà, con ×${m} perdi ${m} volte di più.</li>
      ${one?`<li>Per il tuo obiettivo, <b>se va male</b>: ×${m} = <b>${fmt(chosen.bad)}</b> gemme, ×1 = <b>${fmt(one.bad)}</b> gemme (${pct(chosen.bad/one.bad-1)}).</li>`:""}
    </ul>
    <div style="margin-top:6px">👉 Usa ×${m} solo se vuoi girare meno carte e fare prima: non fa risparmiare gemme.</div></div>`;
}
function renderPlan(id,plan,D,G){
  const ev=plan&&plan.events; if(ev) D=plan.HZ!=null?plan.HZ:plan.H+evDays();
  if(G==null){ $(id).innerHTML=`<tr><td class="muted">Nessuna fonte disponibile per questa rarità: controlla le Impostazioni.</td></tr>`; return; }
  if(G<=0){ $(id).innerHTML=`<tr><td class="good">Hai già abbastanza gemme 🎉</td></tr>`; return; }
  if(!plan){ $(id).innerHTML=`<tr><td class="muted">Impossibile calcolare: controlla pacchetti e conversioni nelle Impostazioni.</td></tr>`; return; }
  const r=[];
  if(false) r.push([ev?`🏰 Gratis accumulate fino all'ultimo evento (${gg(D)})`:`🏰 Gratis da oggi al giorno in cui giochi (${gg(D)}: QG${otherDaily()?" + altre entrate":""}${activeGems(1)?" + pass attivi":""})`, "—", `${fmt(ev?Math.max(0,Math.min(plan.free,G-Math.ceil(plan.R)-plan.used.reduce((a,u)=>a+u.gems,0))):Math.min(plan.free,G))} gemme`, eur(0)]);
  plan.used.filter(u=>u.buys>0).forEach(u=>r.push([`📅 ${esc(u.c.name)}`, `${u.buys}×`, `${fmt(u.gems)} gemme${D>0?"":" (solo quelle subito)"}`, eur(u.eur)]));
  plan.bp.gemItems.forEach(x=>r.push([`🎁 ${esc(x.p.name)}${x.p.perDay?`<div class="muted">max ${x.p.perDay} al giorno × ${gg(D+1)} = ${x.p.perDay*(D+1)} disponibili</div>`:""}`, `${x.q}×`, `${fmt(x.p.gems*x.q)} gemme`, eur(x.p.eur*x.q)]));
  plan.bp.r.items.forEach(x=>r.push([`💠 Pacchetto Eternity Stone da ${esc(x.p.name)}`, `${x.q}×`, `${fmt(x.p.gems*x.q)} Eternity Stone`, eur(x.p.eur*x.q)]));
  plan.bp.cp.items.forEach(x=>r.push([`🔁 Converti in gioco ${fmt(x.t.stones)} Eternity Stone → ${fmt(x.t.gems)} gemme`, `${x.q}×`, `${fmt(x.t.gems*x.q)} gemme`, "—"]));
  $(id).innerHTML=`<tr><th>Cosa</th><th>Q.tà</th><th>Ottieni</th><th>€</th></tr>`+
    (r.length?r.map(x=>`<tr><td class="l">${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td></tr>`).join("")+`<tr class="best"><td>Totale da comprare</td><td></td><td>${fmt(plan.used.reduce((a,u)=>a+u.gems,0)+plan.bp.gemsDirect+plan.bp.cp.items.reduce((a,x)=>a+x.t.gems*x.q,0))} gemme</td><td>${eur(plan.cost)}</td></tr>`
     :`<tr><td colspan="4" class="good">Bastano le gemme gratis, non serve comprare niente.</td></tr>`);
}
// composizione delle gemme: da dove arrivano (gratis, pass, acquisti) fino al giorno in cui si gioca
function gemFlow(plan,need,Dh){
  const own=num(ui.gems), d=Math.max(0,Math.round(Dh||0)), L=[];
  const add=(icon,name,formula,v,kind)=>{ v=Math.floor(v); if(v>0) L.push({icon,name,formula,v,kind}); };
  add("💼","Gemme che hai già","oggi",own,"own");
  add("🏰",`Quartier generale liv. ${ui.hqLevel}`,`${fmt(hqDaily())} al giorno × ${gg(d)}`,hqDaily()*d,"free");
  freeOn().forEach(f=>add("⚔️",esc(f.name),num(f.every)>1?`${fmt(f.gems)} ${everyTxt(f.every)} → in ${gg(d)} circa`:`${fmt(f.gems)} al giorno × ${gg(d)}`,fRate(f)*d,"free"));
  cfg.cards.forEach(c=>{ const l=passLeft(c); if(l>0){ const n=Math.min(d,l); add("📅",`${esc(c.name)} (già attivo)`,`${fmt(c.daily)} al giorno × ${gg(n)}${n<d?" (poi scade)":""}`,c.daily*n,"free"); } });
  if(plan) plan.used.filter(u=>u.buys>0).forEach(u=>{ const dd=u.c.daily?Math.round((u.gems-u.buys*u.c.upfront)/u.c.daily):0;
    add("🛒",`${esc(u.c.name)} (da comprare)`,`${u.buys>1?u.buys+" × ":""}${fmt(u.c.upfront)} all'acquisto${dd>0?` + ${fmt(u.c.daily)} al giorno × ${gg(dd)}`:""}`,u.gems,"pass"); });
  const bought=plan?plan.bp.gemsDirect+plan.bp.cp.items.reduce((s,x)=>s+x.t.gems*x.q,0):0;
  add("🛒","Gemme comprate","pacchetti nella tabella sopra",bought,"buy");
  const tot=L.reduce((s,x)=>s+x.v,0);
  return {L,tot,need:Math.ceil(need||0),left:tot-Math.ceil(need||0),d,free:L.filter(x=>x.kind==="free").reduce((s,x)=>s+x.v,0)};
}
function renderFlow(id,f,when){
  const el=$(id); if(!el) return;
  if(!f||f.need<=0){ el.innerHTML=""; return; }
  el.innerHTML=`<tr><th colspan="3" class="l">📆 Da oggi ${when}</th></tr>`+
    f.L.map(x=>`<tr><td class="l">${x.icon} ${x.name}</td><td class="l muted">${x.formula}</td><td>${fmt(x.v)}</td></tr>`).join("")+
    `<tr><td class="l"><b>Totale a disposizione</b></td><td></td><td><b>${fmt(f.tot)}</b></td></tr>`+
    `<tr><td class="l">🎯 Da spendere per l'obiettivo</td><td></td><td>− ${fmt(f.need)}</td></tr>`+
    (f.left<0?`<tr class="best"><td class="l">Mancano</td><td></td><td class="bad">${fmt(-f.left)}</td></tr>`:`<tr class="best"><td class="l">Avanzano (puoi usarle per altro)</td><td></td><td class="${f.left>0?"good":""}">${fmt(Math.max(0,f.left))}</td></tr>`);
}
// riquadro "come comportarti" (basato sull'ipotesi "se va male", la più prudente)
function renderHow(id,o){
  const el=$(id); if(!el) return;
  if(!o||!o.bad||o.bad.need<=0){ el.innerHTML=""; return; }
  const B=o.bad, T=o.typ, li=[];
  const per=freeOn().filter(f=>num(f.every)>1), d1=freeOn().filter(f=>num(f.every)<=1);
  const daily=[`QG ${fmt(hqDaily())}`].concat(d1.map(f=>`${esc(f.name)} ~${fmt(f.gems)}`))
    .concat(cfg.cards.filter(c=>passLeft(c)>0).map(c=>`${esc(c.name)} ${fmt(c.daily)}`))
    .concat(o.plan?o.plan.used.filter(u=>u.buys>0).map(u=>`${esc(u.c.name)} ${fmt(u.c.daily)}`):[]);
  const perDay=hqDaily()+d1.reduce((s,f)=>s+num(f.gems),0)+cfg.cards.filter(c=>passLeft(c)>0).reduce((s,c)=>s+c.daily,0)+(o.plan?o.plan.used.filter(u=>u.buys>0).reduce((s,u)=>s+u.c.daily,0):0);
  if(B.d>0) li.push(`<b>Ogni giorno entra e ritira tutto:</b> ${daily.join(" + ")} = circa <b>${fmt(perDay)} gemme al giorno</b>. Se salti giorni, i conti non tornano più.`);
  if(B.d>0&&per.length) li.push(`<b>Ritira anche le ricompense periodiche:</b> `+per.map(f=>`${esc(f.name)} ${fmt(f.gems)} ${everyTxt(f.every)}`).join(" · ")+` (in media circa <b>${fmt(per.reduce((s,f)=>s+fRate(f),0))} gemme al giorno</b>). Sono conteggiate nel piano: se ne salti una, mancano gemme.`);
  if(o.plan) o.plan.used.filter(u=>u.buys>0).forEach(u=>li.push(`Compra il <b>${esc(u.c.name)}</b> <b>subito</b>: le gemme giornaliere contano solo dal giorno in cui lo attivi.`));
  li.push(`${B.free>0?"<b>Non spendere le gemme gratis per altro:</b> mettile da parte":"<b>Tieni da parte le gemme</b>"} fino ${o.when}. Devi arrivarci con almeno <b>${fmt(B.need)}</b> gemme${T&&T.need<B.need?` (se va normalmente ne bastano ${fmt(T.need)}, ma per sicurezza conta sulla cifra più alta)`:""}.`);
  if(o.steps&&o.steps.length>1) li.push(`Gemme da avere pronte a ogni evento (se va male): `+o.steps.map(s=>`<b>${fmt(s.v)}</b> ${s.t<=0?"oggi":"il "+itDate(addDays(s.t))}`).join(" · ")+`. Tra un evento e l'altro le gemme gratis ricominciano ad accumularsi: non toccarle.`);
  if(o.plan) o.plan.bp.gemItems.filter(x=>x.p.perDay>0&&x.q>x.p.perDay).forEach(x=>{ const n=Math.ceil(x.q/x.p.perDay); li.push(`<b>${esc(x.p.name)}</b>: ne servono ${x.q}, massimo ${x.p.perDay} al giorno → inizia a comprarli almeno <b>${gg(n)}</b> prima di giocare.`); });
  if(o.plan&&o.plan.bp.r.items.length) li.push(`Le Eternity Stone si comprano sul sito e si convertono in gemme in gioco: fallo prima di giocare.`);
  li.push(B.left>0?`Puoi usare liberamente solo l'avanzo: <b>${fmt(B.left)}</b> gemme anche se va male${T&&T.left>B.left?` (se va normalmente ne avanzano ${fmt(T.left)}, ma lo saprai solo a fine evento)`:""}${o.steps&&o.steps.length>1?". L'avanzo si forma un po' alla volta: usalo solo dopo aver messo da parte le gemme del prossimo evento":""}.`
    :B.left<0?`Con le sole risorse gratuite <b>mancano ${fmt(-B.left)} gemme</b> entro quella data: guarda le «Tempistiche» per sapere quando ce la fai.`:`Non avanza niente: <b>ogni gemma gratis serve per l'evento</b>.`);
  el.innerHTML=`<div class="howbox"><b>📌 Come comportarti fino all'evento</b><ul>${li.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
}
