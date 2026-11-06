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
/* Mitici che sbloccano la seconda abilità al livello 4 (slug) */
const SKILL4=[];
/* Classifiche: per ogni tier un elenco di {slug, lv: livello consigliato, n: quante copie a quel livello, note}
   es. S:[{slug:"gryphon-knight",lv:6,n:1,note:"tank principale"}] */
const TIER_LISTS=[
  {id:"pvp",  title:"⚔️ PvP (Arena)",                 sub:"I personaggi da ottenere per vincere contro gli altri giocatori.", tiers:{S:[],A:[],B:[],C:[]}},
  {id:"iw",   title:"♾️ Guerra infinita",             sub:"I personaggi da ottenere per andare avanti nella Guerra infinita.", tiers:{S:[],A:[],B:[],C:[]}},
  {id:"boss", title:"🐉 Boss",                        sub:"I personaggi da ottenere per fare più danni ai boss.", tiers:{S:[],A:[],B:[],C:[]}},
  {id:"forge",title:"🔨 Da fondere con le pietre forgia", sub:"A chi dare per primi le pietre forgia, e fino a che livello.", tiers:{S:[],A:[],B:[],C:[]}}
];

function renderTierList(){
  const el=$("#tierLists"); if(!el) return;
  const by=Object.fromEntries(TROOPS.map(t=>[t.slug,t]));
  const card=(t,e)=>`<div class="tcard${SKILL4.includes(t.slug)?" s4":""}" title="${esc(t.name)} · ${RAR_IT[t.rarity]} · ${esc(t.cls)} · ${esc(t.attr)}">
      <img src="img/truppe/${t.slug}.webp" alt="" width="64" height="64" loading="lazy">
      <div class="tname">${esc(t.name)}</div>
      ${e?`<div class="tlv">Lv ${e.lv}${e.n>1?" ×"+e.n:""} · ${fmt(cardsForLevel(e.lv)*(e.n||1))} copie</div>${e.note?`<div class="tnote">${esc(e.note)}</div>`:""}`:""}
      ${SKILL4.includes(t.slug)?`<span class="s4b" title="Seconda abilità al livello 4">2ª al Lv4</span>`:""}
    </div>`;
  el.innerHTML=TIER_LISTS.map(L=>{
    const rows=Object.entries(L.tiers).map(([k,list])=>`<div class="trow"><div class="tlab t-${k}">${k}</div><div class="tcards">${
      list.length?list.map(e=>by[e.slug]?card(by[e.slug],e):`<div class="tcard">${esc(e.slug)}?</div>`).join(""):`<span class="muted">da completare</span>`}</div></div>`).join("");
    return `<div class="card" id="tl-${L.id}"><h2>${L.title}</h2><p class="sub">${L.sub}</p><div class="tiers">${rows}</div></div>`;
  }).join("")+
  ["mythic","legendary"].map(r=>`<div class="card"><h2>${r==="mythic"?"Tutti i mitici":"Tutti i leggendari"} <span class="muted" style="font-size:14px">(${TROOPS.filter(t=>t.rarity===r).length})</span></h2><div class="tcards">${TROOPS.filter(t=>t.rarity===r).sort((a,b)=>a.name.localeCompare(b.name)).map(t=>card(t)).join("")}</div></div>`).join("")+
  `<p class="muted" style="margin:4px 4px 16px">Nomi e ritratti da <a href="https://warincwiz.com/troops" target="_blank" rel="noopener">warincwiz.com</a>.</p>`;
}
