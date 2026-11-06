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
/* ===== Lista predefinita =====
   Si crea dalla pagina (✏️ Modifica → 💾 Scarica) e il file scaricato si incolla qui.
   Per ogni personaggio: slug, lv (livello consigliato), n (quante copie a quel livello),
   campi in cui è utile (pvp, iw = Guerra infinita, boss), su cosa investire (gems, forge),
   s4 (seconda abilità al livello 4), note. */
const TIER_DEFAULT={v:2,list:[]};
const TL_FIELDS=[
  {k:"pvp", ico:"⚔️", lab:"PvP"},
  {k:"iw",  ico:"♾️", lab:"Guerra infinita"},
  {k:"boss",ico:"🐉", lab:"Boss"}
];
const TL_INV=[
  {k:"gems", ico:"💎", lab:"Gemme"},
  {k:"forge",ico:"🔨", lab:"Pietre forgia"}
];
const TL_KEY=LS_KEY+"-tiers2";
const troopBy=Object.fromEntries(TROOPS.map(t=>[t.slug,t]));
function tlNormalize(o){
  const L=o&&Array.isArray(o.list)?o.list:[], seen=new Set();
  return {v:2,list:L.filter(e=>e&&troopBy[e.slug]&&!seen.has(e.slug)&&seen.add(e.slug)).map(e=>({slug:e.slug,
    lv:Math.min(9,Math.max(1,+e.lv||4)), n:Math.max(1,+e.n||1),
    pvp:!!e.pvp, iw:!!e.iw, boss:!!e.boss, gems:!!e.gems, forge:!!e.forge, s4:!!e.s4, note:String(e.note||"")}))};
}
// lista corrente: quella salvata nel browser (se l'hai modificata) oppure la predefinita
let TL=(()=>{ try{ const r=lsGet(TL_KEY); return tlNormalize(r?JSON.parse(r):TIER_DEFAULT); }catch(e){ return tlNormalize(TIER_DEFAULT); } })();
let tlEdit=false, tlFilter="all";
const tlSave=()=>{ lsSet(TL_KEY,JSON.stringify(TL)); renderTierList(); };

function tlRowView(e){
  const t=troopBy[e.slug], chips=TL_FIELDS.filter(f=>e[f.k]).map(f=>`<span class="tchip">${f.ico} ${f.lab}</span>`).join("")||`<span class="muted">—</span>`;
  const inv=TL_INV.filter(f=>e[f.k]).map(f=>`<span class="tchip tinv">${f.ico} ${f.lab}</span>`).join("");
  return `<div class="tlrow">
    <img src="img/truppe/${t.slug}.webp" alt="" width="56" height="56" loading="lazy">
    <div class="tlmain"><div class="tname"><span class="r-${t.rarity}">${esc(t.name)}</span>${e.s4?` <span class="s4b">2ª abilità al Lv4</span>`:""}</div>
      <div class="tlv">Livello ${e.lv}${e.n>1?" × "+e.n:""} · ${fmt(cardsForLevel(e.lv)*e.n)} copie</div>${e.note?`<div class="tnote">${esc(e.note)}</div>`:""}</div>
    <div class="tlchips"><div>${chips}</div>${inv?`<div>${inv}</div>`:""}</div></div>`;
}
function tlRowEdit(e,i){
  const t=troopBy[e.slug], a=`data-i="${i}"`; let lv=""; for(let L=1;L<=9;L++) lv+=`<option ${L===e.lv?"selected":""}>${L}</option>`;
  const cb=f=>`<label class="check"><input type="checkbox" ${a} data-f="${f.k}" ${e[f.k]?"checked":""}> ${f.ico} ${f.lab}</label>`;
  return `<div class="tlrow ed">
    <img src="img/truppe/${t.slug}.webp" alt="" width="56" height="56" loading="lazy">
    <div class="tlmain"><div class="tname r-${t.rarity}">${esc(t.name)}</div>
      <div class="tedit"><label>Livello <select ${a} data-f="lv">${lv}</select></label><label>Copie <input type="number" min="1" value="${e.n}" ${a} data-f="n"></label></div>
      <input class="tnotein" placeholder="nota (facoltativa)" value="${esc(e.note)}" ${a} data-f="note"></div>
    <div class="tlcbs"><div><span class="muted">Utile per</span>${TL_FIELDS.map(cb).join("")}</div>
      <div><span class="muted">Investi</span>${TL_INV.map(cb).join("")}<label class="check"><input type="checkbox" ${a} data-f="s4" ${e.s4?"checked":""}> 2ª abilità al Lv4</label></div></div>
    <div class="tmove"><button ${a} data-act="up" title="Su">▲</button><button ${a} data-act="down" title="Giù">▼</button><button ${a} data-act="del" class="tdel" title="Togli">✕</button></div></div>`;
}
function renderTierList(){
  const el=$("#tierLists"); if(!el) return;
  const bar=`<div class="card tlbar"><div><b>${tlEdit?"✏️ Stai modificando la lista":"🏆 Su chi investire"}</b><div class="muted">${tlEdit
      ?"Aggiungi i personaggi con «＋ Aggiungi», poi per ognuno scegli livello, copie e le caselle. Le modifiche restano salvate in questo browser: quando hai finito, scarica il file."
      :"I personaggi su cui conviene spendere gemme o pietre forgia, fino a che livello e in quali modalità di gioco sono utili."}</div></div>
    <div class="tlbtns"><button class="btn ${tlEdit?"primary":""}" data-act="edit">${tlEdit?"✓ Fine":"✏️ Modifica"}</button>${tlEdit?`<button class="btn" data-act="export">💾 Scarica</button><button class="btn" data-act="import">📂 Carica</button><button class="btn" data-act="reset">↺ Predefinita</button>`:""}</div></div>`;
  let body;
  if(tlEdit){
    body=`<div class="card">${TL.list.map(tlRowEdit).join("")||`<p class="muted">Lista vuota.</p>`}<button class="btn primary" data-act="add" style="margin-top:10px">＋ Aggiungi personaggio</button></div>`;
  } else {
    const F=[{k:"all",ico:"",lab:"Tutti"}].concat(TL_FIELDS,TL_INV), L=TL.list.filter(e=>tlFilter==="all"||e[tlFilter]);
    const tot=L.reduce((s,e)=>s+cardsForLevel(e.lv)*e.n,0);
    body=`<nav class="ginav">${F.map(f=>`<a href="#" data-act="filter" data-k="${f.k}" class="${tlFilter===f.k?"on":""}">${f.ico} ${f.lab}</a>`).join("")}</nav>
      <div class="card">${L.map(tlRowView).join("")||`<p class="muted">${TL.list.length?"Nessun personaggio per questo filtro.":"La lista è ancora vuota: premi «✏️ Modifica» per crearla."}</p>`}
      ${L.length?`<p class="muted" style="margin:10px 0 0">${L.length} ${L.length===1?"personaggio":"personaggi"} · in tutto ${fmt(tot)} copie singole.</p>`:""}</div>`;
  }
  el.innerHTML=bar+body+`<p class="muted" style="margin:4px 4px 16px">Nomi e ritratti da <a href="https://warincwiz.com/troops" target="_blank" rel="noopener">warincwiz.com</a>.</p>`;
}
function tlPickOpen(){
  const have=new Set(TL.list.map(e=>e.slug)); $("#tlPickQ").value="";
  $("#tlPickGrid").innerHTML=["mythic","legendary"].map(r=>`<h3>${r==="mythic"?"Mitici":"Leggendari"}</h3><div class="tcards">`+TROOPS.filter(x=>x.rarity===r).sort((a,b)=>a.name.localeCompare(b.name)).map(x=>
    `<button class="tpick${have.has(x.slug)?" used":""}" data-s="${x.slug}" data-n="${esc(x.name.toLowerCase())}" ${have.has(x.slug)?'disabled title="Già nella lista"':""}><div class="tcard"><img src="img/truppe/${x.slug}.webp" alt="" width="64" height="64" loading="lazy"><div class="tname">${esc(x.name)}</div></div></button>`).join("")+`</div>`).join("");
  $("#tlPick").showModal(); setTimeout(()=>$("#tlPickQ").focus(),30);
}
$("#tierLists").addEventListener("click",e=>{
  const b=e.target.closest("[data-act]"); if(!b) return; const act=b.dataset.act, i=+b.dataset.i;
  if(act==="filter"){ e.preventDefault(); tlFilter=b.dataset.k; renderTierList(); return; }
  if(act==="edit"){ tlEdit=!tlEdit; renderTierList(); window.scrollTo(0,0); return; }
  if(act==="export"){ const blob=new Blob([JSON.stringify(TL,null,1)],{type:"application/json"}), a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download=`tierlist-${isoDate(today())}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); return; }
  if(act==="import"){ $("#tlFile").click(); return; }
  if(act==="reset"){ if(confirm("Tornare alla lista predefinita? Le tue modifiche in questo browser andranno perse (scaricale prima se ti servono).")){ TL=tlNormalize(TIER_DEFAULT); try{ localStorage.removeItem(TL_KEY); }catch(_){} renderTierList(); } return; }
  if(act==="add"){ tlPickOpen(); return; }
  const L=TL.list;
  if(act==="del") L.splice(i,1);
  else if(act==="up"&&i>0) [L[i-1],L[i]]=[L[i],L[i-1]];
  else if(act==="down"&&i<L.length-1) [L[i+1],L[i]]=[L[i],L[i+1]];
  tlSave();
});
$("#tierLists").addEventListener("change",e=>{
  const x=e.target, f=x.dataset.f; if(!f) return; const en=TL.list[+x.dataset.i]; if(!en) return;
  if(f==="lv") en.lv=+x.value; else if(f==="n") en.n=Math.max(1,parseInt(x.value)||1); else if(f==="note") en.note=x.value.trim(); else en[f]=x.checked;
  tlSave();
});
$("#tlPickGrid").addEventListener("click",e=>{
  const b=e.target.closest(".tpick"); if(!b||b.disabled) return; const s=b.dataset.s;
  TL.list.push({slug:s,lv:troopBy[s].rarity==="mythic"?4:3,n:1,pvp:false,iw:false,boss:false,gems:true,forge:false,s4:false,note:""});
  $("#tlPick").close(); tlSave();
});
$("#tlPickQ").addEventListener("input",e=>{ const q=e.target.value.trim().toLowerCase(); document.querySelectorAll("#tlPickGrid .tpick").forEach(b=>b.hidden=!!q&&!b.dataset.n.includes(q)); });
$("#tlPickClose").onclick=()=>$("#tlPick").close();
$("#tlFile").addEventListener("change",e=>{
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  f.text().then(txt=>{ TL=tlNormalize(JSON.parse(txt)); tlSave(); }).catch(()=>alert("Il file non è una lista valida."));
});
