/* War Inc Calcolatore — Utilità, probabilità, confronto estrazioni, gemme → euro */
"use strict";
/* =====================================================================
   UTILITÀ
   ===================================================================== */
const $ = s => document.querySelector(s);
// "de-DE": stessi separatori dell'italiano, ma col punto anche sui numeri a 4 cifre (it-IT scrive 4200)
const fmt = (n,d=0) => (n==null||!isFinite(n)) ? "—" : n.toLocaleString("de-DE",{maximumFractionDigits:d,minimumFractionDigits:d});
const eur = n => (n==null||!isFinite(n)) ? "—" : n.toLocaleString("de-DE",{style:"currency",currency:"EUR"});
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const gg = d => fmt(d)+(d===1?" giorno":" giorni");
const pct = x => (x>=0?"+":"")+fmt(x*100)+"%";
const medal = i => ["🥇","🥈","🥉"][i]||String(i+1);
const num = (v,min=0) => Math.max(min, +v||0);
const stopLabel=(src,stop)=>{ const st=parseStops(src.stops), u=src.unit||"tentativi"; if(!stop) return st.length?` · ${st[st.length-1]}+ ${u} (a oltranza)`:""; const i=st.indexOf(stop); return i>0?` · ${st[i-1]}+ ${u} (fino a ${stop})`:` · ${stop} ${u}`; };
const stopVariants=src=>{ const st=parseStops(src.stops); return st.length?(src.continuous?st.concat(0):st):[0]; };
const parseStops = s => String(s||"").split(/[,;\s]+/).map(Number).filter(x=>x>0);

/* =====================================================================
   FUSIONE
   ===================================================================== */
const cardsForLevel = L => Math.pow(cfg.mergeSize, L-1);
function forgeCost(r,L,disc){ const b=(cfg.forge[r]||{})[L]||0; return disc ? Math.floor(b*(1-cfg.discount.pct/100)) : b; }
function planMerge(inv,target,qty,rarity,disc){
  const k=cfg.mergeSize, need=new Array(cfg.maxLevel+2).fill(0); need[target]=Math.max(1,qty|0);
  let forge=0, merges=0, cardsMissing=0; const rows=[];
  for(let L=target;L>=1;L--){
    const use=Math.min(+inv[L]||0, need[L]), miss=need[L]-use;
    if(L>1) need[L-1]+=miss*k; else cardsMissing=miss;
    const each=L>1?forgeCost(rarity,L,disc):0, fs=miss*each;
    forge+=fs; if(L>1) merges+=miss;
    rows.push({L,need:need[L],use,miss,each,fs});
  }
  return {rows,forge,merges,cardsMissing};
}

/* =====================================================================
   PROBABILITÀ — fonti a estrazione (ruota, evocazione)
   ===================================================================== */
function parseMilestones(txt){
  const out=[];
  (txt||"").split(/\n/).forEach(line=>{
    const m=line.trim().match(/^(\d+)\s*:\s*(\w+)\s*(.*)$/i); if(!m) return;
    const at=+m[1], kind=m[2].toLowerCase(), rest=m[3];
    if(kind.startsWith("cart")||kind==="card"){
      const r=(rest.match(/(mythic|legendary|epic|rare|common)/i)||[])[1];
      out.push({at,type:"card",rarity:r?r.toLowerCase():"mythic",copies:+((rest.match(/x\s*(\d+)/i)||[])[1]||1),choose:/scelt|choose/i.test(rest)});
    } else if(kind.startsWith("gem")) out.push({at,type:"gems",amount:+((rest.match(/\d+/)||[0])[0])});
    else if(kind.startsWith("forg")||kind==="fs") out.push({at,type:"fs",amount:+((rest.match(/\d+/)||[0])[0])});
  });
  return out;
}
const milestoneHits=(src,ms,a)=>ms.filter(m=>src.cycle>0?(((a-1)%src.cycle)+1===m.at):a===m.at);
// versione della fonte che si ferma dopo "stop" giri e ricomincia alla ruota/evento successivo
function withStop(src,stop){
  if(!stop) return src;
  const ms=(src.milestones||"").split("\n").filter(l=>{ const m=l.trim().match(/^(\d+)\s*:/); return m&&+m[1]<=stop; }).join("\n");
  return Object.assign({},src,{cycle:stop,milestones:ms,start:0});
}

// cdf[k] = probabilità di avere almeno N copie dopo k tentativi
function solve(src,rarity,N){
  const pool=Math.max(1,+src.pool[rarity]||1);
  const q=[0]; let pos=0;
  (src.rates[rarity]||[]).forEach(e=>{ const p=e.p/pool; q[e.c]=(q[e.c]||0)+p; pos+=p; });
  for(let i=0;i<q.length;i++) q[i]=q[i]||0; q[0]=Math.max(0,1-pos);
  const ms=parseMilestones(src.milestones).filter(m=>m.type==="card"&&m.rarity===rarity);
  if(N<=0) return {cdf:[1]};
  if(pos<=0&&!ms.length) return null;
  let st=new Float64Array(N+1), nx=new Float64Array(N+1); st[0]=1;
  const cdf=[0], start=+src.start||0;
  for(let k=1;k<=300000;k++){
    nx.fill(0);
    for(let i=0;i<N;i++){ const v=st[i]; if(!v) continue; for(let c=0;c<q.length;c++) if(q[c]) nx[Math.min(N,i+c)]+=v*q[c]; }
    nx[N]+=st[N]; [st,nx]=[nx,st];
    for(const m of milestoneHits(src,ms,start+k)){
      const p=m.choose?1:1/pool; nx.fill(0);
      for(let i=0;i<=N;i++){ const v=st[i]; if(!v) continue; nx[Math.min(N,i+m.copies)]+=v*p; nx[i]+=v*(1-p); }
      [st,nx]=[nx,st];
    }
    cdf.push(st[N]);
    if(st[N]>=0.9995) break;
    if(pos<=0&&k>start+5000) break;
  }
  return cdf[cdf.length-1]>0.5?{cdf}:null;
}
function gemCost(src,k){
  const free=src.scrolls?Math.min(k,num(ui.scrolls)):0;
  const ms=parseMilestones(src.milestones).filter(m=>m.type==="gems");
  let refund=0; const start=+src.start||0;
  for(let a=start+1;a<=start+k;a++) for(const m of milestoneHits(src,ms,a)) refund+=m.amount;
  return Math.max(0,(k-free)*src.cost-refund);
}
function fsGained(src,k){
  const ms=parseMilestones(src.milestones).filter(m=>m.type==="fs");
  let s=0; const start=+src.start||0;
  for(let a=start+1;a<=start+k;a++) for(const m of milestoneHits(src,ms,a)) s+=m.amount;
  return s;
}
function pctl(cdf,p){ for(let k=0;k<cdf.length;k++) if(cdf[k]>=p) return k; return null; }
const meanOf=cdf=>cdf.reduce((s,c)=>s+(1-c),0);

/* =====================================================================
   PROBABILITÀ — tabellone (Asso carte), calcolo esatto con traguardi
   Unità = 1 carta girata a ×1; a ×m una carta vale m unità (anche per i traguardi).
   Con "stop": dopo stop unità si ricomincia con un evento nuovo (tabellone e traguardi da capo).
   ===================================================================== */
function boardFirstHit(M,h){
  const C=(n,k)=>{ if(k<0||k>n) return 0; let r=1; for(let i=1;i<=k;i++) r=r*(n-k+i)/i; return r; };
  const d=[0]; for(let k=1;k<=M-h+1;k++) d[k]=C(M-k,h-1)/C(M,h); return d;
}
function solveBoard(src,N,useMulti,stop){
  const M=Math.max(1,+src.cards||12), h=Math.max(1,Math.min(M,+src.hits||1)), m=useMulti?Math.max(1,+src.multi||1):1;
  const J=M-h+1, S=(N+1)*J, start=stop?0:num(src.start);
  const ms=parseMilestones(src.milestones||"").filter(x=>x.type==="card"&&x.rarity==="mythic"&&(!stop||x.at<=stop));
  const pos=t=>stop?((start+t)%stop):start+t;          // posizione nell'evento corrente
  const bonus=(t,k)=>{ let b=0; for(let u=1;u<=k;u++){ const p=stop?(((start+t+u-1)%stop)+1):start+t+u; for(const x of ms) if(x.at===p) b+=x.copies; } return b; };
  if(N<=0) return {cdf:[1],m};
  const ring=new Map(), absAt=new Map(), get=t=>{ if(!ring.has(t)) ring.set(t,new Float64Array(S)); return ring.get(t); };
  get(0)[0]=1;
  const cdf=[]; let done=0;
  for(let t=0;t<200000;t++){
    const cur=ring.get(t); ring.delete(t);
    if(cur){
      for(let c=0;c<N;c++) for(let j=0;j<J;j++){
        const v=cur[c*J+j]; if(!v) continue;
        let k=(useMulti&&N-c>=m)?m:1;
        if(stop){ const left=stop-pos(t); if(k>left) k=1; }      // a fine evento non si può superare lo stop
        const pHit=h/(M-j), b=bonus(t,k), nxt=get(t+k);
        const reset=stop&&pos(t+k)===0;                          // evento finito: tabellone nuovo
        const add=p=>absAt.set(t+k,(absAt.get(t+k)||0)+p);
        const cH=Math.min(N,c+k+b), cM=Math.min(N,c+b);
        if(cH>=N) add(v*pHit); else nxt[cH*J]+=v*pHit;
        if(pHit<1){ if(cM>=N) add(v*(1-pHit)); else nxt[cM*J+(reset?0:j+1)]+=v*(1-pHit); }
      }
    }
    done+=absAt.get(t)||0; absAt.delete(t);
    cdf.push(done);
    if(done>=0.99995||(!ring.size&&!absAt.size)) break;
  }
  return {cdf,m};
}

/* =====================================================================
   CONFRONTO MODALITÀ DI ESTRAZIONE
   ===================================================================== */
function extractionRows(N,rar,owned){
  const rows=[];
  if(N<=0) return rows;
  cfg.sources.forEach((src,si)=>{
    if(!src.on) return;
    const variants=stopVariants(src), unit=src.unit||"tentativi";
    if(src.type==="board"){
      if(rar!=="mythic") return;
      const ms=[useX5()&&boardMode()===src&&(+src.multi||1)>1&&N>=(+src.multi)];
      variants.forEach(stop=>ms.forEach(multi=>{
        const r=solveBoard(src,N,multi,stop), u=+src.cost||0;
        const uT=pctl(r.cdf,.5), uB=pctl(r.cdf,.9); if(uT==null) return;
        const pOwned=r.cdf[Math.min(r.cdf.length-1,Math.floor(owned/(u||1)))]||0;
        rows.push({id:`${si}@${stop}`, src, stop, multi, unit,
          label:`${src.name}${multi?" ×"+r.m:""}`+stopLabel(src,stop),
          mean:meanOf(r.cdf)*u, typ:uT*u, bad:uB*u, nT:uT, nB:uB,
          cycT:stop?Math.ceil(uT/stop):null, cycB:stop?Math.ceil(uB/stop):null, fsT:0, fsB:0, pOwned, perCycle:stop?stop*u:null, every:+src.every||30});
      }));
    } else {
      variants.forEach(stop=>{
        const s=withStop(src,stop), r=solve(s,rar,N); if(!r) return;
        const kT=pctl(r.cdf,.5), kB=pctl(r.cdf,.9); if(kT==null) return;
        let k=0; while(k+1<r.cdf.length&&gemCost(s,k+1)<=owned) k++;
        const fsMs=parseMilestones(s.milestones).filter(m=>m.type==="fs"), fsTxt=stop?fsGained(s,stop):0;
        rows.push({id:`${si}@${stop}`, src, stop, unit,
          label:src.name+stopLabel(src,stop)+(stop&&fsTxt?` +${fmt(fsTxt)} pietre forgia a ruota`:"")+(!stop&&fsMs.length?` · +${fmt(fsMs[0].amount)} pietre forgia al giro ${fsMs[0].at}`:""),
          mean:gemCost(s,Math.round(meanOf(r.cdf))), typ:gemCost(s,kT), bad:gemCost(s,kB), nT:kT, nB:kB,
          cycT:stop?Math.ceil(kT/stop):null, cycB:stop?Math.ceil(kB/stop):null, fsT:fsGained(s,kT), fsB:fsGained(s,kB), pOwned:r.cdf[k]||0, perCycle:stop?gemCost(s,stop):null, every:+src.every||30});
      });
    }
  });
  return rows;
}

/* =====================================================================
   GEMME → EURO
   ===================================================================== */
const gcd=(a,b)=>b?gcd(b,a%b):a;
function bestGemsPerStone(){ const v=cfg.conv.filter(c=>c.stones>0).map(c=>c.gems/c.stones); return v.length?Math.max(...v):null; }
function convPlan(G){
  const tiers=cfg.conv.filter(c=>c.stones>0&&c.gems>0);
  if(G<=0) return {stones:0,gems:0,items:[]};
  if(!tiers.length) return null;
  let g=0; tiers.forEach(t=>g=gcd(g,t.gems));
  const U=Math.ceil(G/g); if(U>3e6) return null;
  const dp=new Float64Array(U+1).fill(Infinity), par=new Int32Array(U+1).fill(-1); dp[0]=0;
  for(let x=1;x<=U;x++) for(let j=0;j<tiers.length;j++){ const c=dp[Math.max(0,x-tiers[j].gems/g)]+tiers[j].stones; if(c<dp[x]){dp[x]=c;par[x]=j;} }
  const cnt=new Map(); let x=U, gems=0;
  while(x>0&&par[x]>=0){ const t=tiers[par[x]]; cnt.set(t,(cnt.get(t)||0)+1); gems+=t.gems; x=Math.max(0,x-t.gems/g); }
  return {stones:dp[U],gems,items:[...cnt].map(([t,q])=>({t,q}))};
}
function cheapestStones(S){
  const packs=cfg.packs.filter(p=>p.gems>0&&p.eur>=0);
  if(S<=0) return {cost:0,items:[]};
  const unl=packs.filter(p=>!p.max), lim=packs.filter(p=>p.max>0);
  let g=0; packs.forEach(p=>g=gcd(g,p.gems)); g=g||1;
  const U=Math.ceil(S/g); if(U>3e6) return null;
  const dp=new Float64Array(U+1).fill(Infinity), par=new Int32Array(U+1).fill(-1); dp[0]=0;
  for(let x=1;x<=U;x++) for(let j=0;j<unl.length;j++){ const c=dp[Math.max(0,x-unl[j].gems/g)]+unl[j].eur; if(c<dp[x]){dp[x]=c;par[x]=j;} }
  let combos=[[]]; for(const p of lim){ const n=[]; for(const c of combos) for(let q=0;q<=p.max;q++) n.push(c.concat(q)); combos=n; if(combos.length>50000) return null; }
  let best=null;
  for(const c of combos){
    let s=0,e=0; c.forEach((q,i)=>{s+=q*lim[i].gems;e+=q*lim[i].eur});
    const rem=Math.max(0,Math.ceil((S-s)/g)), tot=e+dp[rem];
    if(isFinite(tot)&&(!best||tot<best.cost-1e-9)) best={cost:tot,c,rem};
  }
  if(!best) return null;
  const cnt=new Map(); best.c.forEach((q,i)=>{ if(q) cnt.set(lim[i],q); });
  let x=best.rem; while(x>0&&par[x]>=0){ const p=unl[par[x]]; cnt.set(p,(cnt.get(p)||0)+1); x=Math.max(0,x-p.gems/g); }
  return {cost:best.cost,items:[...cnt].map(([p,q])=>({p,q}))};
}
function buyPlan(G,D=0){
  G=Math.max(0,Math.ceil(G));
  const gp=cfg.gemPacks.filter(p=>p.gems>0&&p.eur>=0);
  let combos=[[]];
  for(const p of gp){ let cap=Math.ceil(G/p.gems); if(p.perDay>0) cap=Math.min(cap,p.perDay*(Math.max(0,D)+1)); if(p.max>0) cap=Math.min(cap,p.max);
    const n=[]; for(const c of combos) for(let q=0;q<=cap;q++){ n.push(c.concat(q)); if(n.length>20000) break; } combos=n; }
  const memo=new Map(), stoneCost=S=>{ if(!memo.has(S)) memo.set(S,cheapestStones(S)); return memo.get(S); };
  let best=null;
  for(const c of combos){
    let g=0,e=0; c.forEach((q,i)=>{g+=q*gp[i].gems;e+=q*gp[i].eur});
    const cp=convPlan(Math.max(0,G-g)); if(!cp) continue;
    const r=stoneCost(cp.stones); if(!r) continue;
    const tot=e+r.cost;
    if(!best||tot<best.cost-1e-9) best={cost:tot,gemItems:c.map((q,i)=>({p:gp[i],q})).filter(x=>x.q),gemsDirect:g,cp,r};
  }
  return best;
}
const hqDaily=()=>((cfg.hq.rates||{})[ui.hqLevel]||0)*24;
const fRate=f=>num(f.gems)/Math.max(1,num(f.every)||1);           // gemme al giorno in media
const freeOn=()=>(cfg.free||[]).filter(f=>f.on&&num(f.gems)>0);
const everyTxt=n=>{ n=Math.max(1,num(n)||1); return n===1?"al giorno":n===7?"a settimana":n===14?"ogni 2 settimane":n===30?"al mese":n%7===0?`ogni ${n/7} settimane`:`ogni ${n} giorni`; };
const otherDaily=()=>freeOn().reduce((s,f)=>s+fRate(f),0);
const freeDaily=()=>hqDaily()+otherDaily();
const freeGems=D=>D*freeDaily();
function cardGems(c,D){
  const left=passLeft(c);
  if(left>0){ // già attivo: le gemme fino alla scadenza sono in freeAt(); qui solo il rinnovo
    if(D<=left) return {buys:0,gems:0,eur:0};
    const buys=Math.ceil((D-left)/c.days); return {buys,gems:buys*c.upfront+(D-left)*c.daily,eur:buys*c.eur};
  }
  if(D<=0) return {buys:1,gems:c.upfront,eur:c.eur}; const buys=Math.ceil(D/c.days); return {buys,gems:buys*c.upfront+Math.min(D,buys*c.days)*c.daily,eur:buys*c.eur}; }
const planCache=new Map();
function spendPlan(G,D){
  const key=G+"|"+D; if(planCache.has(key)) return planCache.get(key);
  const cards=cfg.cards.filter(c=>c.on&&c.days>0), free=Math.floor(freeAt(D));
  let best=null;
  for(let mask=0;mask<(1<<cards.length);mask++){
    let gems=free,eurC=0; const used=[];
    cards.forEach((c,i)=>{ if(mask&(1<<i)){ const r=cardGems(c,D); gems+=r.gems; eurC+=r.eur; used.push({c,...r}); } });
    const bp=buyPlan(Math.max(0,G-gems),D); if(!bp) continue;
    const tot=eurC+bp.cost;
    if(!best||tot<best.cost-1e-9) best={cost:tot,free,used,bp,fromCards:gems-free};
  }
  planCache.set(key,best); return best;
}
function daysToFree(G){
  if(G<=0) return 0; const fd=freeDaily(); if(fd<=0) return null;
  return Math.ceil(G/fd);
}
function gemSources(){
  const out=[], g=bestGemsPerStone();
  out.push({n:`Quartier generale (liv. ${ui.hqLevel})`, v:0, month:hqDaily()*30, how:`${fmt(hqDaily())} gemme al giorno, gratis`});
  freeOn().forEach(f=>out.push({n:f.name, v:0, month:fRate(f)*30, how:`circa ${fmt(f.gems)} gemme ${everyTxt(f.every)}, gratis`}));
  cfg.cards.forEach(c=>{ const t=c.upfront+c.daily*c.days; if(t) out.push({n:c.name, v:c.eur/t*1000, month:t, how:c.upfront?`${fmt(c.upfront)} subito + ${fmt(c.daily)} al giorno · bisogna entrare ogni giorno`:`${fmt(c.daily*c.days)} gemme in ${gg(c.days)} · arrivano man mano che giochi`}); });
  cfg.gemPacks.forEach(p=>{ if(p.gems>0) out.push({n:p.name, v:p.eur/p.gems*1000, month:p.perDay?p.perDay*30*p.gems:(p.max?p.max*p.gems:Infinity), how:"in gioco, subito"+(p.perDay?` · max ${p.perDay} al giorno`:"")+(p.extra?` · contiene anche ${esc(p.extra)}`:"")}); });
  cfg.packs.forEach(p=>{ if(p.gems>0&&g) out.push({n:`Eternity Stone ${p.name}`, v:p.eur/p.gems/g*1000, month:Infinity, how:"store web · si convertono in gemme in gioco"}); });
  return out.sort((a,b)=>a.v-b.v);
}

