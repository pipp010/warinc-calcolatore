/* War Inc Calcolatore — Modalità Zero shopping */
"use strict";
/* =====================================================================
   ZERO SHOPPING — nessun acquisto, solo tempistiche con le risorse gratuite
   ===================================================================== */
const incFree=t=>num(ui.gems)+Math.floor(freeAt(Math.max(0,t)));
function readyDay(G,from=0){ if(G<=0) return Math.max(0,from); for(let t=Math.max(0,from);t<=3650;t++) if(incFree(t)>=G) return t; return null; }
const dayTxt=t=>t==null?"mai (servono più di 10 anni)":t<=0?"già adesso":`il ${itDate(addDays(t))} (tra ${gg(t)})`;
function zeroPlan(row,key,D){
  const ED=evDays(), need=row?Math.ceil(row[key]||0):0;
  if(!row||need<=0) return {need:0,ok:true,short:0,ready:D+ED,P:D+ED,have:incFree(D+ED)};
  if(!row.stop){ const P=D+ED, have=incFree(P), short=Math.max(0,need-have);
    return {need,P,have,short,ok:short<=0,ready:short<=0?P:readyDay(need,P)}; }
  const C=Math.max(1,key==="typ"?row.cycT:row.cycB), every=Math.max(1,row.every||30), evs=[]; let j=0, skipped=0;
  for(let k=1;k<=C;k++){ const cum=Math.min(k*row.perCycle,need); let guard=0;
    while(incFree(D+j*every+ED)<cum&&guard++<200){ j++; skipped++; }
    evs.push({k,t:D+j*every,spend:Math.max(0,Math.min(row.perCycle,need-(k-1)*row.perCycle)),cum,have:incFree(D+j*every+ED)}); j++; }
  const last=evs[evs.length-1];
  let short=0; for(let k=1;k<=C;k++) short=Math.max(short,Math.min(k*row.perCycle,need)-incFree(D+(k-1)*every+ED));
  return {need,cycle:true,evs,skipped,C,P:last.t+ED,have:incFree(last.t+ED),short:Math.max(0,short),ok:skipped===0,ready:last.t+ED};
}
function zeroTable(z,row){
  if(!z||z.need<=0) return `<tr><td class="good">Hai già tutto: non servono gemme.</td></tr>`;
  const nome=row&&row.src.type==="board"?"Evento":"Ruota";
  if(!z.cycle) return `<tr><th class="l" colspan="2">📆 Un solo evento</th></tr>
    <tr><td class="l">Gemme da spendere</td><td>${fmt(z.need)}</td></tr>
    <tr><td class="l">Gemme che avrai il giorno in cui giochi (${z.P<=0?"oggi":itDate(addDays(z.P))})</td><td>${fmt(z.have)}</td></tr>
    <tr><td class="l">Esito</td><td class="${z.ok?"good":"bad"}"><b>${z.ok?"✅ Ce la fai":"❌ Mancano "+fmt(z.short)+" gemme"}</b></td></tr>
    <tr class="best"><td class="l">Con le sole gratis le avresti</td><td>${dayTxt(z.ok?readyDay(z.need):z.ready)}</td></tr>${z.ok?"":`<tr><td class="l muted" colspan="2">Troppo tardi per questo evento: senza acquisti punta al primo evento uguale dopo quella data, oppure scegli Ruota/Asso carte «100» e fai un evento alla volta.</td></tr>`}`;
  return `<tr><th class="l">${nome}</th><th>Quando</th><th>Spendi</th><th>Gemme gratis pronte</th></tr>`+
    z.evs.map(e=>`<tr><td class="l">${nome} ${e.k}</td><td>${e.t<=0?"subito":itDate(addDays(e.t))}</td><td>${fmt(e.spend)}</td><td>${fmt(e.have-(e.cum-e.spend))}</td></tr>`).join("")+
    `<tr><td class="l" colspan="3">${z.skipped?`${nome==="Ruota"?"Ruote":"Eventi"} da saltare per accumulare gemme`:"Nessun"+(nome==="Ruota"?"a ruota":" evento")+" da saltare"}</td><td class="${z.skipped?"bad":"good"}">${z.skipped?fmt(z.skipped):"✅"}</td></tr>`+
    `<tr class="best"><td class="l" colspan="3">Truppa completa con le sole gratis</td><td>${dayTxt(z.ready)}</td></tr>`;
}
function renderZeroSimple(o){
  const {chosen,N,D,sc}=o, ev=!!(chosen&&chosen.stop);
  const zs=["typ","bad"].map(k=>N>0&&chosen?zeroPlan(chosen,k,D):null);
  $("#summary").innerHTML=zs.map((z,i)=>{ const ok=i===0, s=sc[i];
    return `<div class="scen ${ok?"ok":"ko"}"><h4>${ok?"Se va normalmente":"Se va male"}</h4><div class="hint">${ok?"basta 1 volta su 2":"basta 9 volte su 10 — sei tranquillo"}</div>
      <div class="kv"><div>Copie L1 da ottenere</div><div>${fmt(N)}</div>
        <div>Gemme da spendere in tutto</div><div>${fmt(z?z.need:0)}</div>
        ${z&&z.cycle?`<div>${chosen.src.type==="board"?"Eventi":"Ruote"} da fare / da saltare</div><div>${fmt(z.C)} / ${fmt(z.skipped)}</div>`:""}
        <div>Gemme che mancano all'evento</div><div class="${z&&z.short>0?"bad":"good"}">${fmt(z?z.short:0)}</div>
        <div>Pietre forgia mancanti</div><div class="${s.forgeMiss>0?"bad":"good"}">${fmt(s.forgeMiss)}</div>
        <div>Pronto con le sole gratis</div><div class="big" style="font-size:18px">${z?(z.ready<=0?"già adesso":itDate(addDays(z.ready))):"—"}</div>
      </div></div>`; }).join("");
  $("#zeroTyp").innerHTML=zeroTable(zs[0],chosen); $("#zeroBad").innerHTML=zeroTable(zs[1],chosen);
  const when=z=>(ev?(chosen.src.type==="board"?"all'ultimo evento ":"all'ultima ruota "):"al giorno in cui giochi ")+"("+(z.P<=0?"oggi":itDate(addDays(z.P)))+")";
  const fl=zs.map(z=>z?gemFlow(null,z.need,z.P):null);
  renderFlow("#flowTyp",fl[0],zs[0]?when(zs[0]):""); renderFlow("#flowBad",fl[1],zs[1]?when(zs[1]):"");
  const steps=zs[1]&&zs[1].cycle?zs[1].evs.map(e=>({t:e.t+evDays(),v:e.spend})):[];
  renderHow("#planHow",zs[1]?{typ:fl[0],bad:fl[1],plan:null,when:when(zs[1]),steps}:null);
}
function renderZeroAdv(sc,evs){
  const rows=sc.map(s=>{ const sched=s.plan?s.plan.sched:[]; let short=0; sched.forEach(e=>{ short=Math.max(short,e.cum-incFree(e.tp)); }); return {short,ready:readyDay(Math.ceil(s.need)),H:sched.reduce((m,e)=>Math.max(m,e.tp),0),need:Math.ceil(s.need),sched}; });
  $("#advSummary").querySelectorAll(".scen").forEach((el,i)=>{ const r=rows[i], kv=el.querySelector(".kv"); if(!kv) return; const d=kv.children;
    d[2].textContent="Gemme che mancano agli eventi"; d[3].textContent=fmt(r.short); d[3].className=r.short>0?"bad":"good";
    d[6].textContent="Tutte le gemme pronte con le sole gratis"; d[7].textContent=r.ready==null?"—":r.ready<=0?"già adesso":itDate(addDays(r.ready)); d[7].className="big"; d[7].style.fontSize="18px"; });
  const B=rows[1], T=rows[0];
  $("#advZero").innerHTML=`<tr><th class="l">Evento</th><th>Quando giochi</th><th>Gemme che servono (normale / male)</th><th>Gemme gratis pronte</th><th>Esito se va male</th></tr>`+
    B.sched.map((e,i)=>{ const have=incFree(e.tp), te=T.sched[i]||e, ok=have>=e.cum, okT=have>=te.cum, ev=evs[i];
      return `<tr><td class="l">${esc(ev.p.src.name)}</td><td>${e.tp<=0?"oggi":itDate(addDays(e.tp))}</td><td>${fmt(te.cum)} / ${fmt(e.cum)}</td><td>${fmt(have)}</td><td class="${ok?"good":okT?"":"bad"}">${ok?"✅ ok":okT?"⚠️ solo se va bene":"❌ mancano "+fmt(e.cum-have)}</td></tr>`; }).join("");
  const fl=rows.map(r=>gemFlow(null,r.need,r.H)), whenA=r=>"all'ultimo evento ("+(r.H<=0?"oggi":itDate(addDays(r.H)))+")";
  renderFlow("#advFlowTyp",fl[0],whenA(T)); renderFlow("#advFlowBad",fl[1],whenA(B));
  let prev=0; const steps=B.sched.map(e=>{ const v=e.cum-prev; prev=e.cum; return {t:e.tp,v}; }).filter(x=>x.v>0);
  renderHow("#advPlanHow",{typ:fl[0],bad:fl[1],plan:null,when:whenA(B),steps});
}
function renderWait(sc,D){
  if(sc[0].miss==null){ $("#waitTable").innerHTML=""; return; }
  if(sc[1].miss<=0){ $("#waitTable").innerHTML=`<tr><td class="good">Non ti mancano gemme in nessuna delle due ipotesi.</td></tr>`; return; }
  const ds=[...new Set([0,7,14,30,60,90,D])].sort((a,b)=>a-b);
  const what=p=>[...p.used.filter(u=>u.buys>0).map(u=>`${u.c.name}${u.buys>1?` ×${u.buys}`:""}`), ...p.bp.gemItems.map(x=>`${x.q} × ${x.p.name}`), ...(p.bp.r.items.length?["Eternity Stone"]:[])];
  $("#waitTable").innerHTML=`<tr><th>Se puoi aspettare</th><th>Se va normalmente</th><th>Se va male</th><th class="l">Cosa comprare (se va male)</th></tr>`+ds.map(d=>{
    const a=spendPlan(sc[0].miss,d), b=spendPlan(sc[1].miss,d); if(!a||!b) return "";
    const w=what(b);
    return `<tr${d===D?' class="best"':""}><td>${d===0?"Subito":gg(d)}</td><td>${eur(a.cost)}</td><td>${eur(b.cost)}</td><td class="l">${w.length?esc(w.join(" + ")):"niente, bastano le gemme gratis"}</td></tr>`;
  }).join("");
}
function renderExtr(sorted,chosen,N){
  if(N<=0){ $("#extrTable").innerHTML=`<tr><td class="good">Hai già le copie per il livello scelto: non serve estrarre.</td></tr>`; return; }
  if(!sorted.length){ $("#extrTable").innerHTML=`<tr><td class="muted">Nessuna fonte attiva dà truppe di questa rarità.</td></tr>`; return; }
  const best=sorted[0], own=num(ui.gems);
  $("#extrTable").innerHTML=`<tr><th>#</th><th>Modalità</th><th>Gemme<br>normale</th><th>Gemme<br>se va male</th><th>Rischio</th><th>Ruote / eventi</th><th>Ultimo evento</th><th>€<br>normale</th><th>€<br>se va male</th>${own?"<th>Bastano le tue gemme</th>":""}</tr>`+
    sorted.map((x,i)=>`<tr${x===chosen?' class="best"':""}><td>${medal(i)}</td><td>${esc(x.label)}${x===chosen?" ✔":""}</td><td>${fmt(x.typ)}</td><td>${fmt(x.bad)}</td><td>${x.typ?pct(x.bad/x.typ-1):"—"}</td><td>${x.cycT!=null?(x.cycT===x.cycB?fmt(x.cycT):`${fmt(x.cycT)}–${fmt(x.cycB)}`):"—"}</td><td>${x.stop?durTxt(x):"un evento"}</td><td>${eur(x.eurT)}</td><td>${eur(x.eurB)}</td>${own?`<td>${fmt(x.pOwned*100,0)}%</td>`:""}</tr>`).join("");
}
function renderMergeTable(mp){
  $("#mergeTable").innerHTML=`<tr><th>Livello</th><th>Servono</th><th>Già hai</th><th>Da creare / ottenere</th><th>Pietre per fusione</th><th>Pietre totali</th></tr>`+
    mp.rows.map(r=>`<tr><td>L${r.L}</td><td>${fmt(r.need)}</td><td>${fmt(r.use)}</td><td>${fmt(r.miss)} ${r.L===1?"carte":"fusioni"}</td><td>${r.L>1?fmt(r.each):"—"}</td><td>${r.L>1?fmt(r.fs):"—"}</td></tr>`).join("")+
    `<tr class="best"><td>Totale</td><td></td><td></td><td>${fmt(mp.merges)} fusioni</td><td></td><td>${fmt(mp.forge)}</td></tr>`;
}
function renderGemRank(){
  $("#gemRank").innerHTML=`<tr><th>#</th><th>Fonte</th><th>€ ogni 1.000 gemme</th><th>Gemme al mese (max)</th><th class="l">Come</th></tr>`+
    gemSources().map((x,i)=>`<tr${i<3?' class="best"':""}><td>${medal(i)}</td><td>${esc(x.n)}</td><td>${x.v?eur(x.v):"gratis"}</td><td>${isFinite(x.month)?fmt(x.month):"illimitate"}</td><td class="l muted">${x.how}</td></tr>`).join("");
}
// costo per copia di una ruota/evento dentro i traguardi e dopo
function stopAdvice(src){
  const stops=parseStops(src.stops); if(!stops.length) return null;
  const first=stops[0], ms=parseMilestones(src.milestones);
  const msCopies=ms.filter(m=>m.type==="card"&&m.rarity==="mythic"&&m.at<=first).reduce((s,m)=>s+m.copies,0);
  const refund=ms.filter(m=>m.type==="gems"&&m.at<=first).reduce((s,m)=>s+m.amount,0);
  let perUnit;
  if(src.type==="board"){ const d=boardFirstHit(+src.cards||12,+src.hits||1); perUnit=1/d.reduce((a,p,k)=>a+p*k,0); }
  else perUnit=(src.rates.mythic||[]).reduce((a,e)=>a+e.p*e.c,0)/Math.max(1,+src.pool.mythic||1);
  if(!perUnit) return null;
  const inCopies=first*perUnit+msCopies, inCost=(first*src.cost-refund)/inCopies, outCost=src.cost/perUnit;
  return {first,inCost,outCost,fs:ms.filter(m=>m.type==="fs").map(m=>m)};
}
function renderTips(c){
  const t=[], add=(cls,html)=>t.push(`<li class="${cls}">${html}</li>`);
  const [A,B]=c.sc;
  if(c.N<=0){
    add("good",`Hai già le copie necessarie: restano ${fmt(c.mp.merges)} fusioni e ${fmt(c.mp.forge)} pietre forgia.`);
  } else if(!c.chosen){
    add("bad","Nessuna fonte attiva dà truppe di questa rarità: controlla le Impostazioni.");
  } else {
    const b=c.sorted[0];
    add("good",`Per ${fmt(c.N)} copie il percorso più economico è <b>${esc(b.label)}</b>: <b>${fmt(b.typ)}</b> gemme se va normalmente (${eur(b.eurT)}), <b>${fmt(b.bad)}</b> se va male (${eur(b.eurB)}).`);
    if(c.chosen!==b) add("",`Hai scelto <b>${esc(c.chosen.label)}</b>: ${eur(c.chosen.eurT)} se va normalmente, contro ${eur(b.eurT)} del percorso migliore.`);
    if(c.chosen.cycT!=null) add("",`Servono <b>${fmt(c.chosen.cycT)}</b> ${c.chosen.src.type==="board"?"eventi":"ruote"} (${stopLabel(c.chosen.src,c.chosen.stop).slice(3)}) se va normalmente, <b>${fmt(c.chosen.cycB)}</b> se va male.`);
  }
  // fermarsi ai traguardi
  cfg.sources.filter(s=>s.on&&(s.type!=="board"||c.rar==="mythic")).forEach(s=>{
    const a=stopAdvice(s); if(!a) return;
    const fs=a.fs.find(m=>m.at>a.first);
    add("",`<b>${esc(s.name)}: fermati a ${a.first} ${s.unit||""}.</b> Fino a ${a.first} una copia costa circa ${fmt(a.inCost)} gemme grazie ai traguardi, dopo circa ${fmt(a.outCost)}. ${fs?`Andare oltre (a oltranza) conviene solo se ti servono le pietre forgia del giro ${fs.at} (+${fmt(fs.amount)}).`:"Poi aspetta l'evento successivo."}`);
  });
  if(c.rows.some(r=>r.multi)) add("",`Asso carte: il ×5 <b>non fa risparmiare gemme</b> (stesso costo per carta e per i traguardi) ma rende il risultato più variabile. Serve solo a fare prima.`);
  if(c.rows.some(r=>r.src.scrolls)&&num(ui.scrolls)) add("",`Le tue ${fmt(ui.scrolls)} pergamene valgono ${fmt(ui.scrolls)} evocazioni gratis nell'Evocazione limitata (già conteggiate).`);
  if(c.chosen&&c.chosen.stop&&c.N>0){
    const ev=c.chosen, fm=freeDaily()*ev.every, nome=ev.src.type==="board"?"evento":"ruota";
    add(fm>=ev.perCycle?"good":"",`Ogni ${nome} (${stopLabel(ev.src,ev.stop).slice(3)}) costa circa <b>${fmt(ev.perCycle)}</b> gemme. Tra un${nome==="ruota"?"a ruota":" evento"} e l'altr${nome==="ruota"?"a":"o"} (~${gg(ev.every)}) accumuli <b>${fmt(fm)}</b> gemme gratis${fm>=ev.perCycle?": bastano da sole, ogni "+nome+" la fai senza spendere.":", ne mancano "+fmt(ev.perCycle-fm)+" a "+nome+" (i pass mensili ne coprono gran parte)."}`);
  }
  if(B.miss>0&&B.plan&&!(c.chosen&&c.chosen.stop)){
    if(c.D<30){ const p30=spendPlan(B.miss,30); if(p30&&p30.cost<B.plan.cost-0.5) add("good",`Se l'evento fosse tra 30 giorni, anche se va male spenderesti <b>${eur(p30.cost)}</b> invece di ${eur(B.plan.cost)}.`); }
    const on=cfg.cards.filter(x=>x.on&&x.upfront+x.daily*x.days>0);
    if(on.length){ const best=on.map(x=>({x,v:x.eur/(x.upfront+x.daily*x.days)*1000})).sort((a,b)=>a.v-b.v)[0]; const g=bestGemsPerStone(), es=cfg.packs.filter(p=>p.gems>0).map(p=>p.eur/p.gems/(g||1)*1000), esMin=es.length?Math.min(...es):null;
      add("",`I pass sono il modo più economico di comprare gemme: <b>${esc(best.x.name)}</b> costa ${eur(best.v)} ogni 1.000 gemme${esMin?`, circa ${fmt(esMin/best.v,1)} volte meno delle Eternity Stone`:""}. Conviene solo se entri in gioco ogni giorno.`); }
    const fd=freeDaily();
    if(fd>0) add("",`Senza spendere niente (QG livello ${ui.hqLevel}${otherDaily()?" + "+(cfg.free||[]).filter(f=>f.on).map(f=>esc(f.name)).join(" + "):""} = ${fmt(fd)} gemme al giorno) ti servono <b>${gg(daysToFree(A.miss))}</b> se va normalmente, <b>${gg(daysToFree(B.miss))}</b> se va male.`);
  } else if(c.N>0&&B.miss===0){
    add("good",`Le gemme che hai bastano anche se va male (${fmt(ui.gems)} su ${fmt(B.need)}).`);
  } else if(c.N>0&&A.miss===0){
    add("good",`Le gemme che hai bastano se va normalmente; se va male te ne mancano ${fmt(B.miss)}.`);
  }
  if(B.forgeMiss>0){
    add("bad",`Ti mancano fino a <b>${fmt(B.forgeMiss)}</b> pietre forgia per le fusioni.`);
    if(!ui.disc){ const md=planMerge(ui.inv,c.target,c.qty,c.rar,true); if(md.forge<c.mp.forge) add("",`Con l'evento sconto (${cfg.discount.pct}%) ne risparmieresti ${fmt(c.mp.forge-md.forge)}: se non hai fretta, fai le fusioni durante l'evento.`); }
  }
  $("#tips").innerHTML=tipsHtml(t);
}

