/* War Inc Calcolatore — Dati di gioco predefiniti, configurazione e salvataggio */
"use strict";
/* =====================================================================
   DATI
   ===================================================================== */
const RAR = ["mythic","legendary","epic","rare","common"];
const RAR_IT = {mythic:"Mitico",legendary:"Leggendario",epic:"Epico",rare:"Raro",common:"Comune"};
const LS_KEY = "warinc-calc-v2";
const MS_ASSO = "10: carta mythic x1 scelta\n30: carta mythic x1 scelta\n60: carta mythic x1 scelta\n100: carta mythic x1 scelta";

const DEFAULTS = {
  ver: 19,
  maxLevel: 9,
  mergeSize: 2,
  forge: { // pietre forgia per creare 1 unità del livello indicato (7 = fusione L6+L6)
    mythic:{7:2560,8:5920,9:9600},
    legendary:{7:1920,8:4400,9:7200},
    epic:{7:960,8:2220,9:3600},
    rare:{7:64,8:160,9:480},
    common:{7:32,8:80,9:240}
  },
  discount: { pct:15 },
  sources: [
    { name:"Ruota", unit:"giri", cost:100, on:true, start:0, cycle:0, stops:"100", continuous:true, every:30, scrolls:false,
      rates:{mythic:[{p:.035,c:1},{p:.005,c:2}],legendary:[{p:.15,c:1}],epic:[{p:.16,c:1}],rare:[{p:.40,c:1}],common:[]},
      pool:{mythic:1,legendary:1,epic:1,rare:1,common:1},
      milestones:"10: carta mythic x1 scelta\n25: gemme 500\n50: carta mythic x1 scelta\n100: carta mythic x2 scelta\n200: forgia 500",
      note:"Il mitico in palio è noto in anticipo; i traguardi danno lo stesso mitico." },
    { name:"Evocazione limitata", unit:"evocazioni", cost:100, on:true, start:0, cycle:0, stops:"", scrolls:true,
      rates:{mythic:[{p:.12,c:1}],legendary:[],epic:[],rare:[],common:[]},
      pool:{mythic:3,legendary:1,epic:1,rare:1,common:1},
      milestones:"", note:"3 mitici al 4% ciascuno (12% in tutto). Prima si usano le pergamene." },
    { type:"board", name:"Asso carte", unit:"carte", cost:250, cards:12, hits:1, multi:5, on:true, start:0, stops:"100", continuous:true, every:30,
      milestones:MS_ASSO,
      note:"12 carte coperte, 1 mitico. Trovato il mitico il tabellone si rimescola. ×5: costo, premio e traguardi ×5." }
  ],
  packs: [ // Eternity Stone
    {name:"60", eur:4.99, gems:60, max:0},
    {name:"120", eur:9.99, gems:120, max:0},
    {name:"250", eur:18.99, gems:250, max:0},
    {name:"650", eur:46.99, gems:650, max:0},
    {name:"1.400", eur:92.99, gems:1400, max:0},
    {name:"2.800", eur:184.99, gems:2800, max:0},
    {name:"7.000", eur:460.99, gems:7000, max:0},
    {name:"14.000", eur:920.99, gems:14000, max:0}
  ],
  conv: [ {stones:100, gems:1000}, {stones:500, gems:5000}, {stones:1000, gems:12000} ],
  gemPacks: [ {name:"Pacchetto fornitura avanzata", eur:5.49, gems:1000, perDay:2, max:0, extra:"120.000 monete"} ],
  cards: [
    {name:"Pass mensile base", eur:4.99, upfront:600, daily:100, days:30, on:true},
    {name:"Pass mensile avanzato", eur:13.99, upfront:2000, daily:320, days:30, on:true},
    // le 1.900 gemme del pass battaglia arrivano salendo di livello: qui sono spalmate sui 14 giorni
    {name:"Pass battaglia premium", eur:4.99, upfront:0, daily:1900/14, days:14, on:true}
  ],
  hq: { rates:{5:16, 6:18, 7:20} },
  // entrate gratuite: "gems" ogni "every" giorni (1 = al giorno, 7 = a settimana, 14 = ogni 2 settimane)
  free: [
    {name:"Guerra infinita", gems:400, every:1, on:true},
    {name:"Missioni giornaliere", gems:120, every:1, on:true},
    {name:"Missioni settimanali", gems:400, every:7, on:true},
    {name:"Missioni bisettimanali", gems:500, every:14, on:true},
    {name:"Pass battaglia (ricompense gratis)", gems:510, every:14, on:true},
    {name:"Caccia", gems:500, every:7, on:true},
    {name:"Co-op", gems:600, every:7, on:true},
    {name:"Arena", gems:1000, every:14, on:true},
    {name:"Guerra tra clan", gems:1500, every:14, on:true},
    {name:"Caccia al clan", gems:500, every:14, on:true}
  ],
  eventDays: 7
};
const UI_DEFAULTS = {gems:0, scrolls:0, forge:0, hqLevel:5, inv:{}, name:"", rarity:"mythic", target:6, qty:1, days:30, now:false, mode:"auto", disc:false, x5:false, playLast:false, dur:null, adv:false, zero:false, goals:[], events:[], passes:{}};

const clone = o => JSON.parse(JSON.stringify(o));
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

function loadCfg(raw){
  let c=clone(DEFAULTS);
  try{ const s=raw!=null?raw:lsGet(LS_KEY); if(s) c=Object.assign(clone(DEFAULTS), JSON.parse(s)); }catch(e){}
  // migrazioni dalle bozze precedenti
  const v=c.ver||0;
  if(v<6||!Array.isArray(c.sources)) c.sources=clone(DEFAULTS.sources);
  if(!c.sources.some(x=>x.type==="board")) c.sources.push(clone(DEFAULTS.sources[2]));
  c.sources.forEach(x=>{
    if(x.type==="board"&&x.milestones==null){ x.milestones=MS_ASSO; x.start=0; }
    if(x.name==="Ruota (Wheel)") x.name="Ruota";
    if(v<11){
      if(x.name==="Ruota"){ x.stops="100, 200"; x.unit="giri"; }
      if(x.type==="board"){ x.stops="100"; x.unit="carte"; }
      if(x.name==="Evocazione limitata"){ x.unit="evocazioni"; x.stops=""; const m=(x.rates.mythic||[])[0]; if(m&&m.p===0.04){ m.p=0.12; x.note=DEFAULTS.sources[1].note; } }
    }
  });
  (c.gemPacks||[]).forEach(p=>{ if(p.perDay==null) p.perDay=(p.eur===5.49&&p.gems===1000)?2:0; });
  if(!c.hq||!c.hq.rates) c.hq=clone(DEFAULTS.hq);
  [1,2,3,4,8].forEach(l=>delete c.hq.rates[l]); if(c.hq.rates[7]==null) c.hq.rates[7]=20;
  delete c.hq.level;
  if(!c.discount||c.discount.pct==null) c.discount={pct:15};
  (c.packs||[]).forEach(p=>{ p.name=String(p.name).replace(/\s*pietre$/i,""); });
  if(v<11){ c.free=clone(DEFAULTS.free); if(+c.freeDaily>0) c.free.push({name:"Altre entrate",daily:+c.freeDaily,on:true}); }
  delete c.freeDaily; delete c.funds;
  if(v<12) c.sources.forEach(x=>{ if(x.name==="Ruota"){ x.stops="100"; x.continuous=true; } });
  if(v<13) (c.gemPacks||[]).forEach(p=>{ if(p.name==="Pacchetto in gioco"){ p.name="Pacchetto fornitura avanzata"; p.extra="120.000 monete"; } });
  if(v<14) c.sources.forEach(x=>{ if(x.type==="board"){ x.stops="100"; x.continuous=true; } });
  if(v<15) (c.cards||[]).forEach(x=>{ if(x.name==="Carta mensile gemme") x.name="Pass mensile gemme"; });
  c.sources.forEach(x=>{ if(/d/.test(String(x.stops||""))&&!(x.every>0)) x.every=30; });
  if(!(c.eventDays>0)) c.eventDays=7;
  const PASS_REN={"Carta mensile gemme":"Pass mensile base","Pass mensile gemme":"Pass mensile base","Carta mensile (avanzata)":"Pass mensile avanzato"};
  (c.cards||[]).forEach(x=>{ if(PASS_REN[x.name]) x.name=PASS_REN[x.name]; });
  (c.free||[]).forEach(f=>{ if(f.gems==null){ f.gems=+f.daily||0; f.every=1; } delete f.daily; if(!(f.every>0)) f.every=1; });
  if(v<18){
    const have=new Set((c.free||[]).map(f=>f.name)); c.free=c.free||[];
    DEFAULTS.free.forEach(f=>{ if(!have.has(f.name)) c.free.push(clone(f)); });
    if(!(c.cards||[]).some(x=>/battaglia/i.test(x.name))) c.cards.push(clone(DEFAULTS.cards.find(x=>/battaglia/i.test(x.name))));
  }
  if(v<19) (c.free||[]).forEach(f=>{ if(f.name==="Missioni settimanali"&&!(+f.gems>0)) f.gems=400; });
  c.ver=19;
  return c;
}
const PASS_REN_UI={"Carta mensile gemme":"Pass mensile base","Pass mensile gemme":"Pass mensile base","Carta mensile (avanzata)":"Pass mensile avanzato"};
function loadUi(){
  const u=clone(UI_DEFAULTS);
  try{ const s=lsGet(LS_KEY+"-ui2"); if(s){ const o=JSON.parse(s); Object.assign(u,o); if(u.passes) Object.keys(u.passes).forEach(k=>{ if(PASS_REN_UI[k]){ u.passes[PASS_REN_UI[k]]=u.passes[k]; delete u.passes[k]; } }); if(o.now==null){ u.now=false; if(!o.days) u.days=30; } delete u.risk; return u; } }catch(e){}
  try{ const o=JSON.parse(lsGet(LS_KEY+"-ui")||"null"); if(o){ ["inv","name","rarity","target","scrolls"].forEach(k=>{ if(o[k]!=null) u[k]=o[k]; }); if(o.eurOwned) u.gems=o.eurOwned; } }catch(e){}
  return u;
}
let cfg=loadCfg(), ui=loadUi();
const save=()=>lsSet(LS_KEY, JSON.stringify(cfg));
const saveUi=()=>lsSet(LS_KEY+"-ui2", JSON.stringify(ui));
save();

