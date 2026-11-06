/* War Inc Calcolatore — Tier list: dati (da completare) e pagina */
"use strict";
/* Nomi e ritratti: warincwiz.com (sito di fan). Ritratti in img/truppe/<slug>.webp */
const TROOPS=[
  {slug:"gryphon-knight",name:"Gryphon Knight",rarity:"mythic",cls:"guerriero",attr:"vento"},
  {slug:"geomancer",name:"Geomancer",rarity:"mythic",cls:"mago",attr:"terra"},
  {slug:"scarlet-spark",name:"Scarlet Spark",rarity:"mythic",cls:"guerriero",attr:"fuoco"},
  {slug:"ocean-voice",name:"Ocean Voice",rarity:"mythic",cls:"mago",attr:"acqua"},
  {slug:"ghost-claw",name:"Ghost Claw",rarity:"mythic",cls:"difensore",attr:"acqua"},
  {slug:"fleet-commander",name:"Fleet Commander",rarity:"mythic",cls:"guerriero",attr:"acqua"},
  {slug:"raging-waves",name:"Raging Waves",rarity:"mythic",cls:"difensore",attr:"acqua"},
  {slug:"frost-queen",name:"Frost Queen",rarity:"mythic",cls:"mago",attr:"acqua"},
  {slug:"storm-maiden",name:"Storm Maiden",rarity:"mythic",cls:"mago",attr:"vento"},
  {slug:"blazewing-lord",name:"Blazewing Lord",rarity:"mythic",cls:"mago",attr:"fuoco"},
  {slug:"starlight-apostle",name:"Starlight Apostle",rarity:"mythic",cls:"supporto",attr:"vento"},
  {slug:"darkmoon-queen",name:"Darkmoon Queen",rarity:"mythic",cls:"supporto",attr:"acqua"},
  {slug:"bone-marksman",name:"Bone Marksman",rarity:"mythic",cls:"arciere",attr:"fuoco"},
  {slug:"the-blade-of-earth",name:"The Blade of Earth",rarity:"mythic",cls:"difensore",attr:"terra"},
  {slug:"nine-tailed-fox",name:"Nine-Tailed Fox",rarity:"mythic",cls:"mago",attr:"fuoco"},
  {slug:"woodland-guardian",name:"Woodland Guardian",rarity:"mythic",cls:"difensore",attr:"legno"},
  {slug:"melody-weaver",name:"Melody Weaver",rarity:"mythic",cls:"supporto",attr:"vento"},
  {slug:"ripple-wizard",name:"Ripple Wizard",rarity:"mythic",cls:"supporto",attr:"acqua"},
  {slug:"fury-cannoneer",name:"Fury Cannoneer",rarity:"mythic",cls:"arciere",attr:"fisico"},
  {slug:"firepower-vanguard",name:"Firepower Vanguard",rarity:"mythic",cls:"arciere",attr:"fisico"},
  {slug:"mist-archer",name:"Mist Archer",rarity:"mythic",cls:"arciere",attr:"fisico"},
  {slug:"jungle-ranger",name:"Jungle Ranger",rarity:"mythic",cls:"arciere",attr:"fisico"},
  {slug:"barbarian-tyrant",name:"Barbarian Tyrant",rarity:"mythic",cls:"difensore",attr:"fisico"},
  {slug:"flame-duelist",name:"Flame Duelist",rarity:"mythic",cls:"difensore",attr:"fuoco"},
  {slug:"night-scion",name:"Night Scion",rarity:"mythic",cls:"guerriero",attr:"fisico"},
  {slug:"goddess-of-war",name:"Goddess of War",rarity:"mythic",cls:"guerriero",attr:"fisico"},
  {slug:"venospore-killer",name:"Venospore Killer",rarity:"mythic",cls:"guerriero",attr:"fisico"},
  {slug:"the-knight-king",name:"The Knight King",rarity:"mythic",cls:"difensore",attr:"fisico"},
  {slug:"radiant-warrior",name:"Radiant Warrior",rarity:"mythic",cls:"difensore",attr:"fisico"},
  {slug:"seraph",name:"Seraph",rarity:"mythic",cls:"guerriero",attr:"fuoco"},
  {slug:"necromancer",name:"Necromancer",rarity:"mythic",cls:"mago",attr:"terra"},
  {slug:"tide-lord",name:"Tide Lord",rarity:"mythic",cls:"mago",attr:"acqua"},
  {slug:"blazeking",name:"Blazeking",rarity:"mythic",cls:"mago",attr:"fuoco"},
  {slug:"red-blade",name:"Red Blade",rarity:"mythic",cls:"guerriero",attr:"vento"},
  {slug:"light-seeker",name:"Light Seeker",rarity:"mythic",cls:"arciere",attr:"fuoco"},
  {slug:"solar-sage",name:"Solar Sage",rarity:"mythic",cls:"mago",attr:"fuoco"},
  {slug:"shadow-witch",name:"Shadow Witch",rarity:"mythic",cls:"mago",attr:"fisico"},
  {slug:"rock-warlord",name:"Rock Warlord",rarity:"mythic",cls:"guerriero",attr:"terra"},
  {slug:"sakura-ronin",name:"Sakura Ronin",rarity:"legendary",cls:"difensore",attr:"legno"},
  {slug:"ghost-assassin",name:"Ghost Assassin",rarity:"legendary",cls:"guerriero",attr:"fisico"},
  {slug:"ursa-champion",name:"Ursa Champion",rarity:"legendary",cls:"supporto",attr:"legno"},
  {slug:"wind-apostle",name:"Wind Apostle",rarity:"legendary",cls:"mago",attr:"vento"},
  {slug:"ashen-arcanist",name:"Ashen Arcanist",rarity:"legendary",cls:"mago",attr:"fuoco"},
  {slug:"shell-guard",name:"Shell Guard",rarity:"legendary",cls:"difensore",attr:"acqua"},
  {slug:"hydromancer",name:"Hydromancer",rarity:"legendary",cls:"mago",attr:"acqua"},
  {slug:"iron-bulwark",name:"Iron Bulwark",rarity:"legendary",cls:"difensore",attr:"fisico"},
  {slug:"bone-gunner",name:"Bone Gunner",rarity:"legendary",cls:"arciere",attr:"acqua"},
  {slug:"grace-priest",name:"Grace Priest",rarity:"legendary",cls:"supporto",attr:"fisico"},
  {slug:"blast-dwarf",name:"Blast Dwarf",rarity:"legendary",cls:"arciere",attr:"fisico"},
  {slug:"ironguard",name:"Ironguard",rarity:"legendary",cls:"difensore",attr:"fisico"},
  {slug:"windlord",name:"Windlord",rarity:"legendary",cls:"mago",attr:"vento"},
  {slug:"elven-archer",name:"Elven Archer",rarity:"legendary",cls:"arciere",attr:"fisico"},
  {slug:"great-axe-warrior",name:"Great Axe Warrior",rarity:"legendary",cls:"guerriero",attr:"terra"}
];
/* ===== Classifiche predefinite =====
   Si creano dalla pagina (✏️ Modifica → 💾 Scarica) e il file scaricato si incolla qui.
   skill4: mitici con la seconda abilità al livello 4 (slug).
   lists.<id>.<tier>: elenco di {slug, lv: livello consigliato, n: copie a quel livello, note} */
const TIER_DEFAULT={v:1,skill4:[],lists:{pvp:{S:[],A:[],B:[],C:[]},iw:{S:[],A:[],B:[],C:[]},boss:{S:[],A:[],B:[],C:[]},forge:{S:[],A:[],B:[],C:[]}}};
const TIER_META=[
  {id:"pvp",  title:"⚔️ PvP (Arena)",                     sub:"I personaggi da ottenere per vincere contro gli altri giocatori."},
  {id:"iw",   title:"♾️ Guerra infinita",                 sub:"I personaggi da ottenere per andare avanti nella Guerra infinita."},
  {id:"boss", title:"🐉 Boss",                            sub:"I personaggi da ottenere per fare più danni ai boss."},
  {id:"forge",title:"🔨 Da fondere con le pietre forgia", sub:"A chi dare per primi le pietre forgia, e fino a che livello."}
];
const TIERS=["S","A","B","C"], TL_KEY=LS_KEY+"-tiers";
// classifiche correnti: quelle salvate nel browser (se le hai modificate) oppure le predefinite
function tlNormalize(o){
  const d=JSON.parse(JSON.stringify(TIER_DEFAULT)); if(!o||typeof o!=="object") return d;
  const ok=new Set(TROOPS.map(t=>t.slug));
  d.skill4=Array.isArray(o.skill4)?o.skill4.filter(x=>ok.has(x)):[];
  TIER_META.forEach(m=>TIERS.forEach(k=>{ const l=o.lists&&o.lists[m.id]&&o.lists[m.id][k];
    d.lists[m.id][k]=Array.isArray(l)?l.filter(e=>e&&ok.has(e.slug)).map(e=>({slug:e.slug,lv:Math.min(9,Math.max(1,+e.lv||4)),n:Math.max(1,+e.n||1),note:String(e.note||"")})):[]; }));
  return d;
}
let TL=(()=>{ try{ const r=lsGet(TL_KEY); return tlNormalize(r?JSON.parse(r):TIER_DEFAULT); }catch(e){ return tlNormalize(TIER_DEFAULT); } })();
let tlEdit=false, tlPickTo=null;
const tlSave=()=>{ lsSet(TL_KEY,JSON.stringify(TL)); renderTierList(); };
const troopBy=Object.fromEntries(TROOPS.map(t=>[t.slug,t]));

function tlCard(t,e,pos){
  const s4=TL.skill4.includes(t.slug), ed=tlEdit&&pos;
  let h=`<div class="tcard${ed?" ed":""}" title="${esc(t.name)} · ${RAR_IT[t.rarity]} · ${esc(t.cls)} · ${esc(t.attr)}">
    <img src="img/truppe/${t.slug}.webp" alt="" width="64" height="64" loading="lazy"><div class="tname">${esc(t.name)}</div>`;
  if(e&&!ed) h+=`<div class="tlv">Lv ${e.lv}${e.n>1?" ×"+e.n:""} · ${fmt(cardsForLevel(e.lv)*e.n)} copie</div>${e.note?`<div class="tnote">${esc(e.note)}</div>`:""}`;
  if(ed){ const a=`data-l="${pos.l}" data-t="${pos.t}" data-i="${pos.i}"`;
    let lv=""; for(let L=1;L<=9;L++) lv+=`<option ${L===e.lv?"selected":""}>${L}</option>`;
    h+=`<div class="tedit"><label>Lv <select ${a} data-f="lv">${lv}</select></label><label>× <input type="number" min="1" value="${e.n}" ${a} data-f="n"></label></div>
      <input class="tnotein" placeholder="nota" value="${esc(e.note)}" ${a} data-f="note">
      <div class="tmove"><button ${a} data-act="left" title="Sposta a sinistra">◀</button><button ${a} data-act="up" title="Tier più alto">▲</button><button ${a} data-act="down" title="Tier più basso">▼</button><button ${a} data-act="right" title="Sposta a destra">▶</button><button ${a} data-act="del" title="Togli" class="tdel">✕</button></div>`; }
  if(s4) h+=`<span class="s4b" title="Seconda abilità al livello 4">2ª al Lv4</span>`;
  return h+`</div>`;
}
function renderTierList(){
  const el=$("#tierLists"); if(!el) return;
  const bar=`<div class="card tlbar"><div><b>${tlEdit?"✏️ Stai modificando le classifiche":"🏆 Tier list"}</b><div class="muted">${tlEdit
      ?"Aggiungi con ＋, scegli livello e copie, sposta con le frecce. Nei mitici in fondo tocca un ritratto per segnare la «2ª abilità al Lv4». Le modifiche restano salvate in questo browser: quando hai finito, scarica il file."
      :"Chi conviene ottenere e fino a che livello. Puoi creare le tue classifiche con «Modifica»."}</div></div>
    <div class="tlbtns"><button class="btn ${tlEdit?"primary":""}" data-act="edit">${tlEdit?"✓ Fine":"✏️ Modifica"}</button>${tlEdit?`<button class="btn" data-act="export">💾 Scarica</button><button class="btn" data-act="import">📂 Carica</button><button class="btn" data-act="reset">↺ Predefinite</button>`:""}</div></div>`;
  const lists=TIER_META.map(m=>{
    const rows=TIERS.map(k=>{ const list=TL.lists[m.id][k];
      const cards=list.map((e,i)=>tlCard(troopBy[e.slug],e,{l:m.id,t:k,i})).join("");
      return `<div class="trow"><div class="tlab t-${k}">${k}</div><div class="tcards">${cards||(tlEdit?"":`<span class="muted">da completare</span>`)}${tlEdit?`<button class="tadd" data-act="add" data-l="${m.id}" data-t="${k}" title="Aggiungi a ${k}">＋</button>`:""}</div></div>`; }).join("");
    return `<div class="card" id="tl-${m.id}"><h2>${m.title}</h2><p class="sub">${m.sub}</p><div class="tiers">${rows}</div></div>`;
  }).join("");
  const pool=["mythic","legendary"].map(r=>{ const L=TROOPS.filter(t=>t.rarity===r).sort((a,b)=>a.name.localeCompare(b.name));
    return `<div class="card"><h2>${r==="mythic"?"Tutti i mitici":"Tutti i leggendari"} <span class="muted" style="font-size:14px">(${L.length})</span></h2><div class="tcards">${L.map(t=>tlEdit&&r==="mythic"?`<button class="tpick${TL.skill4.includes(t.slug)?" on":""}" data-act="s4" data-s="${t.slug}" title="Seconda abilità al livello 4: sì/no">${tlCard(t)}</button>`:tlCard(t)).join("")}</div></div>`; }).join("");
  el.innerHTML=bar+lists+pool+`<p class="muted" style="margin:4px 4px 16px">Nomi e ritratti da <a href="https://warincwiz.com/troops" target="_blank" rel="noopener">warincwiz.com</a>.</p>`;
}
function tlPickOpen(l,t){
  tlPickTo={l,t}; const m=TIER_META.find(x=>x.id===l), have=new Set(TIERS.flatMap(k=>TL.lists[l][k].map(e=>e.slug)));
  $("#tlPickT").textContent=`Aggiungi a ${m.title.replace(/^\S+\s/,"")} · tier ${t}`; $("#tlPickQ").value="";
  $("#tlPickGrid").innerHTML=["mythic","legendary"].map(r=>`<h3>${r==="mythic"?"Mitici":"Leggendari"}</h3><div class="tcards">`+TROOPS.filter(x=>x.rarity===r).sort((a,b)=>a.name.localeCompare(b.name)).map(x=>
    `<button class="tpick${have.has(x.slug)?" used":""}" data-s="${x.slug}" data-n="${esc(x.name.toLowerCase())}" title="${have.has(x.slug)?"Già in questa classifica: lo sposti qui":""}">${tlCard(x)}</button>`).join("")+`</div>`).join("");
  $("#tlPick").showModal(); setTimeout(()=>$("#tlPickQ").focus(),30);
}
$("#tierLists").addEventListener("click",e=>{
  const b=e.target.closest("[data-act]"); if(!b) return; const {act,l,t}=b.dataset, i=+b.dataset.i;
  if(act==="edit"){ tlEdit=!tlEdit; renderTierList(); return; }
  if(act==="export"){ const blob=new Blob([JSON.stringify(TL,null,1)],{type:"application/json"}), a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download=`tierlist-${isoDate(today())}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); return; }
  if(act==="import"){ $("#tlFile").click(); return; }
  if(act==="reset"){ if(confirm("Tornare alle classifiche predefinite? Le tue modifiche in questo browser andranno perse (scaricale prima se ti servono).")){ TL=tlNormalize(TIER_DEFAULT); try{ localStorage.removeItem(TL_KEY); }catch(_){} renderTierList(); } return; }
  if(act==="add"){ tlPickOpen(l,t); return; }
  if(act==="s4"){ const s=b.dataset.s; TL.skill4=TL.skill4.includes(s)?TL.skill4.filter(x=>x!==s):TL.skill4.concat(s); tlSave(); return; }
  const list=TL.lists[l][t], ti=TIERS.indexOf(t);
  if(act==="del") list.splice(i,1);
  else if(act==="left"&&i>0) [list[i-1],list[i]]=[list[i],list[i-1]];
  else if(act==="right"&&i<list.length-1) [list[i+1],list[i]]=[list[i],list[i+1]];
  else if((act==="up"&&ti>0)||(act==="down"&&ti<TIERS.length-1)) TL.lists[l][TIERS[ti+(act==="up"?-1:1)]].push(list.splice(i,1)[0]);
  tlSave();
});
$("#tierLists").addEventListener("change",e=>{
  const x=e.target, f=x.dataset.f; if(!f) return; const en=TL.lists[x.dataset.l][x.dataset.t][+x.dataset.i]; if(!en) return;
  if(f==="lv") en.lv=+x.value; else if(f==="n") en.n=Math.max(1,parseInt(x.value)||1); else en.note=x.value.trim();
  tlSave();
});
$("#tlPickGrid").addEventListener("click",e=>{
  const b=e.target.closest(".tpick"); if(!b||!tlPickTo) return; const {l,t}=tlPickTo, s=b.dataset.s;
  let old=null; TIERS.forEach(k=>{ const j=TL.lists[l][k].findIndex(x=>x.slug===s); if(j>=0) old=TL.lists[l][k].splice(j,1)[0]; });   // una sola volta per classifica
  TL.lists[l][t].push(old||{slug:s,lv:troopBy[s].rarity==="mythic"?4:3,n:1,note:""});
  $("#tlPick").close(); tlSave();
});
$("#tlPickQ").addEventListener("input",e=>{ const q=e.target.value.trim().toLowerCase(); document.querySelectorAll("#tlPickGrid .tpick").forEach(b=>b.hidden=!!q&&!b.dataset.n.includes(q)); });
$("#tlPickClose").onclick=()=>$("#tlPick").close();
$("#tlFile").addEventListener("change",e=>{
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  f.text().then(txt=>{ TL=tlNormalize(JSON.parse(txt)); tlSave(); }).catch(()=>alert("Il file non è una classifica valida."));
});
