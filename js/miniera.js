/* War Inc Calcolatore — Pagina Miniera (nascosta) + tastierino numerico */
"use strict";
/* =====================================================================
   MINIERA — simulazione con monete da guadagnare prima di spenderle
   ===================================================================== */
const MINE_DEF={waves:90,waveSec:15,maxL:60,unlockSpend:false,gBase:1,gInc:1,gList:"",cBase:10,cGrow:10,cList:"",sel:0,
  slots:[{name:"Miniera 1",sec:15,unlock:0},{name:"Miniera 2",sec:12,unlock:9},{name:"Miniera 3",sec:9,unlock:150},{name:"Miniera 4",sec:6,unlock:500},{name:"Miniera 5",sec:3,unlock:1000}],
  strats:[{t:"5, 8, 11, 5, 21",on:true},{t:"3, 8, 9, 10, 20",on:true},{t:"3, 7, 10, 10, 20",on:true},{t:"5, 5, 5, 5, 30",on:true},{t:"5, 10, 10, 10, 15",on:true}]};
function mineSt(){ if(!ui.mine) ui.mine=clone(MINE_DEF); for(const k in MINE_DEF) if(ui.mine[k]==null) ui.mine[k]=clone(MINE_DEF[k]); return ui.mine; }
const numList=s=>String(s||"").split(/[,;\s]+/).map(x=>parseFloat(x.replace(",","."))).filter(x=>isFinite(x));
function mineModel(){
  const M=mineSt(), maxL=Math.max(1,Math.round(num(M.maxL,1))), gl=numList(M.gList), cl=numList(M.cList);
  const g=L=>L<=0?0:(gl.length?(gl[Math.min(L,gl.length)-1]):num(M.gBase)+num(M.gInc)*(L-1));
  const cost=L=>cl.length?(L-1<cl.length?cl[L-1]:Infinity):Math.round(num(M.cBase)*Math.pow(1+num(M.cGrow)/100,L-1));
  return {M,maxL,g,cost,slots:M.slots.map(s=>({name:s.name,sec:Math.max(1,num(s.sec,1)),unlock:num(s.unlock)})),T:Math.max(1,Math.round(num(M.waves,1)))*Math.max(1,num(M.waveSec,1)),wSec:Math.max(1,num(M.waveSec,1))};
}
function simMine(md,targets){
  const {slots,g,cost,maxL,T,wSec}=md, n=slots.length, lvl=slots.map(()=>0), next=slots.map(()=>Infinity);
  let coins=0, earned=0, spent=0; const log=[], curve=[0], reach=slots.map(()=>[]);
  const wave=t=>Math.max(1,Math.ceil(t/wSec));
  const open=(k,t)=>{ lvl[k]=1; next[k]=t+slots[k].sec; reach[k][1]=wave(t); };
  open(0,0); reach[0][1]=0;
  const want=k=>targets?Math.min(maxL,Math.round(targets[k]||0)):maxL;
  for(let t=1;t<=T;t++){
    for(let k=0;k<n;k++) while(lvl[k]>0&&t>=next[k]){ const v=g(lvl[k]); coins+=v; earned+=v; next[k]+=slots[k].sec; }
    if(!md.M.unlockSpend) for(let k=1;k<n;k++) if(!lvl[k]&&earned>=slots[k].unlock&&want(k)>0){ open(k,t); log.push({t,k,L:1,c:0}); }
    for(let guard=0;guard<500;guard++){
      const c=[];
      for(let k=0;k<n;k++){
        if(!lvl[k]){ if(md.M.unlockSpend&&want(k)>0) c.push({k,cost:slots[k].unlock,gain:g(1)/slots[k].sec,un:true}); }
        else if(lvl[k]<want(k)){ const cc=cost(lvl[k]); if(isFinite(cc)) c.push({k,cost:cc,gain:(g(lvl[k]+1)-g(lvl[k]))/slots[k].sec}); }
      }
      if(!c.length) break;
      let pick;
      if(targets) pick=c.reduce((a,b)=>b.cost<a.cost?b:a);
      else { const ok=c.filter(x=>x.gain>0&&x.cost/x.gain<=T-t); if(!ok.length) break; pick=ok.reduce((a,b)=>(b.gain/Math.max(b.cost,1e-9))>(a.gain/Math.max(a.cost,1e-9))?b:a); }
      if(coins<pick.cost) break;
      coins-=pick.cost; spent+=pick.cost;
      if(pick.un){ open(pick.k,t); log.push({t,k:pick.k,L:1,c:pick.cost}); }
      else { lvl[pick.k]++; reach[pick.k][lvl[pick.k]]=wave(t); log.push({t,k:pick.k,L:lvl[pick.k],c:pick.cost}); }
    }
    if(t%wSec===0) curve.push(earned);
  }
  const rate=slots.reduce((s,x,k)=>s+(lvl[k]?g(lvl[k])/x.sec:0),0);
  const done=targets?slots.every((x,k)=>lvl[k]>=want(k)):null;
  const doneWave=targets&&done?Math.max(0,...log.map(e=>wave(e.t))):null;
  return {lvl,coins,earned,spent,curve,log,reach,rate,done,doneWave};
}
function mineStrategies(){
  const M=mineSt(), md=mineModel(), list=[{name:"Migliore (calcolata)",best:true,r:simMine(md,null)}];
  M.strats.forEach((s,i)=>{ if(!s.on) return; const tg=numList(s.t); list.push({name:`S${i+1}: ${tg.join(", ")}`,i,r:simMine(md,md.slots.map((_,k)=>tg[k]||0))}); });
  return {md,list};
}
const MINE_COL=["#c96442","#5b8def","#d4a017","#4f9a5a","#9b6bd3","#d0607f","#3aa6a0","#8a8a8a"];
function mineChart(list,md){
  const W=760,H=300,L=56,B=34,Tp=12,Rp=12, waves=Math.round(num(md.M.waves,1));
  const max=Math.max(1,...list.map(x=>x.r.curve[x.r.curve.length-1]||0));
  const X=w=>L+(W-L-Rp)*w/Math.max(1,waves), Y=v=>Tp+(H-Tp-B)*(1-v/max);
  const ticks=[0,.25,.5,.75,1].map(f=>max*f);
  let svg=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Monete guadagnate per ondata">`;
  ticks.forEach(v=>{ svg+=`<line x1="${L}" x2="${W-Rp}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${fmt(v)}</text>`; });
  for(let w=0;w<=waves;w+=Math.max(1,Math.round(waves/6/5)*5)) svg+=`<text x="${X(w)}" y="${H-12}" text-anchor="middle" font-size="11" fill="var(--muted)">${w}</text>`;
  svg+=`<text x="${(W+L)/2}" y="${H}" text-anchor="middle" font-size="11" fill="var(--muted)">ondata</text>`;
  list.forEach((x,i)=>{ const pts=x.r.curve.map((v,w)=>`${X(w).toFixed(1)},${Y(v).toFixed(1)}`).join(" "); svg+=`<polyline fill="none" stroke="${MINE_COL[i%MINE_COL.length]}" stroke-width="${x.best?3:2}" points="${pts}"/>`; });
  svg+=`</svg><div class="row" style="gap:6px 16px;margin-top:6px">`+list.map((x,i)=>`<span class="muted" style="display:inline-flex;align-items:center;gap:6px"><span style="width:14px;height:3px;border-radius:2px;background:${MINE_COL[i%MINE_COL.length]}"></span>${esc(x.name)}</span>`).join("")+`</div>`;
  return svg;
}
function renderMineForm(){
  const M=mineSt();
  document.querySelectorAll("#p-mine [data-m]").forEach(el=>{ const k=el.dataset.m; if(el.type==="checkbox") el.checked=!!M[k]; else el.value=M[k]??""; });
  $("#mineSlots").innerHTML=`<tr><th>Miniera</th><th>Ciclo (secondi)</th><th id="mineUnlockTh">${M.unlockSpend?"Costo sblocco":"Si sblocca a (monete guadagnate)"}</th></tr>`+
    M.slots.map((s,i)=>`<tr><td><input data-ms="${i}" data-k="name" value="${esc(s.name)}"></td><td><input type="number" min="1" data-ms="${i}" data-k="sec" value="${s.sec}"></td><td><input type="number" min="0" data-ms="${i}" data-k="unlock" value="${s.unlock}" ${i===0?"disabled":""}></td></tr>`).join("");
  $("#mineStrats").innerHTML=M.strats.map((s,i)=>`<div class="passrow"><label class="check" style="flex:none"><input type="checkbox" data-st="${i}" data-k="on" ${s.on?"checked":""}> S${i+1}</label><input data-st="${i}" data-k="t" value="${esc(s.t)}" style="flex:1;min-width:0" placeholder="livello per miniera 1, 2, 3, 4, 5"><button class="btn small" data-delst="${i}">✕</button></div>`).join("");
  setInputModes(document.getElementById("p-mine"));
}
function renderMine(){
  const {md,list}=mineStrategies(), M=md.M, waves=Math.round(num(M.waves,1));
  const custom=numList(M.cList).length||numList(M.gList).length;
  $("#mineWarn").style.display=custom?"none":"";
  $("#mineSub").innerHTML=`${fmt(waves)} ondate da ${fmt(md.wSec)} secondi (${fmt(md.T/60,1)} minuti). Le monete guadagnate servono a sbloccare e potenziare: la curva mostra il totale guadagnato.`;
  $("#mineChartBox").innerHTML=mineChart(list,md);
  const sorted=[...list].sort((a,b)=>b.r.earned-a.r.earned);
  $("#mineRank").innerHTML=`<tr><th>#</th><th>Strategia</th><th>Monete guadagnate</th><th>Spese in potenziamenti</th><th>Monete al secondo a fine</th><th>Livelli finali</th><th>Obiettivo raggiunto</th></tr>`+
    sorted.map((x,i)=>`<tr${i===0?' class="best"':""}><td>${medal(i)}</td><td class="l">${esc(x.name)}</td><td>${fmt(x.r.earned)}</td><td>${fmt(x.r.spent)}</td><td>${fmt(x.r.rate,2)}</td><td>${x.r.lvl.join(" · ")}</td><td class="${x.best?"":x.r.done?"good":"bad"}">${x.best?"—":x.r.done?"ondata "+fmt(x.r.doneWave):"❌ non entro l'ondata "+fmt(waves)}</td></tr>`).join("");
  const sel=Math.min(num(M.sel),list.length-1);
  $("#mineStSel").innerHTML=list.map((x,i)=>`<option value="${i}" ${i===sel?"selected":""}>${esc(x.name)}</option>`).join("");
  const r=list[sel].r, top=Math.max(1,...r.lvl);
  let rows=""; for(let L=1;L<=top;L++) rows+=`<tr><td>Livello ${L}</td>${md.slots.map((s,k)=>{ const w=r.reach[k][L]; return `<td>${w==null?"—":w===0?"subito":"ondata "+w}</td>`; }).join("")}</tr>`;
  $("#mineLevels").innerHTML=`<tr><th>Livello</th>${md.slots.map(s=>`<th>${esc(s.name)}</th>`).join("")}</tr>`+rows;
  $("#mineOrder").innerHTML=`<tr><th>Ondata</th><th class="l">Cosa</th><th>Costo</th></tr>`+(r.log.length?r.log.map(e=>`<tr><td>${Math.max(1,Math.ceil(e.t/md.wSec))}</td><td class="l">${esc(md.slots[e.k].name)} → ${e.L===1?"sbloccata":"livello "+e.L}</td><td>${e.c?fmt(e.c):"—"}</td></tr>`).join(""):`<tr><td colspan="3" class="muted">Nessun potenziamento.</td></tr>`);
}
let mineTimer=null; const mineRecalc=()=>{ clearTimeout(mineTimer); mineTimer=setTimeout(()=>{ saveUi(); renderMine(); },120); };
$("#p-mine").addEventListener("input",e=>{ const M=mineSt(), el=e.target;
  if(el.dataset.m){ M[el.dataset.m]=el.type==="checkbox"?el.checked:(el.type==="number"?num(el.value):el.value); if(el.dataset.m==="unlockSpend") renderMineForm(); }
  else if(el.dataset.ms!=null){ const s=M.slots[+el.dataset.ms]; s[el.dataset.k]=el.type==="number"?num(el.value):el.value; }
  else if(el.dataset.st!=null){ const s=M.strats[+el.dataset.st]; s[el.dataset.k]=el.type==="checkbox"?el.checked:el.value; }
  else return;
  mineRecalc(); });
$("#p-mine").addEventListener("click",e=>{ const d=e.target.dataset.delst; if(d==null) return; mineSt().strats.splice(+d,1); renderMineForm(); mineRecalc(); });
$("#mineAddSt").onclick=()=>{ mineSt().strats.push({t:"5, 5, 5, 5, 5",on:true}); renderMineForm(); mineRecalc(); };
$("#mineStSel").onchange=e=>{ mineSt().sel=+e.target.value; saveUi(); renderMine(); };

/* tastierino numerico sugli smartphone */
function setInputModes(root){ (root||document).querySelectorAll('input[type=number]').forEach(i=>{ if(i.getAttribute("inputmode")) return; const st=i.getAttribute("step"); i.setAttribute("inputmode",(st&&st!=="1")||i.closest("#p-set")?"decimal":"numeric"); }); }
setInputModes(document);
new MutationObserver(()=>setInputModes(document)).observe(document.body,{childList:true,subtree:true});
