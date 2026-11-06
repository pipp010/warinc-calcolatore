/* ===== Formazioni: lettura automatica da screenshot =====
   Nessuna AI: ogni casella della griglia viene confrontata, pixel per pixel, con i ritratti in img/truppe
   (escludendo lo stemma della classe e il cerchio del livello); il livello si legge confrontando la cifra
   bianca con dei modelli ricavati da screenshot veri del gioco. Tutto avviene nel browser: l'immagine non
   viene inviata da nessuna parte. */
// modelli delle cifre 1-9 (griglia 10×14, valori 0-9)
const FM_DIGITS=Object.fromEntries(Object.entries({"1":"00047999201699999991399999999329999999920200599991000039999300003999930000399993000039999300003999930000399993000039999300003999930000289992","2":"47999996408999999997554336878900000029990000000999000000799900000799980002999971004999960037999730008999710000999973523399999999999999999999","3":"16889885107999999982887778999732111399990000019998013348999504999999500499999992001114999900000079995310038999987668999899999999811689987510","4":"00003999410006999993005999999702999999972999769997699933999799951399979971039997999767999999999999999999999999333336999800000399970000018994","5":"38999999958999999997999998898399940000009994010000999877763099999999947997789998132002799900000069996210018999999889999899999999943889998610","6":"00268998610599999996599998789599983000109994011000999789985199999999989999658999999300399999920029999996105999799988999917999999940047998510","7":"99999999989999999999868879999900000399990000079995000039999200008999600005999910001899970000699991000099997000069999200007999600000279920000","8":"03789987306999999995999956999999930049999992004999899855999839999999938999999996999512699999700018999981002999999856899979999999971489999830","9":"03789975004999999971999978999799940169999981003999999300399999996699996999999999159998799900000039991100038998786679999479999999501789986200"}).map(([k,v])=>[k,[...v].map(c=>+c/9)]));
const FN=40, FDW=10, FDH=14;
function fmSample(src,sx,sy,sw,sh,n){ const c=document.createElement("canvas"); c.width=c.height=n; const g=c.getContext("2d",{willReadFrequently:true}); g.imageSmoothingQuality="high"; g.drawImage(src,sx,sy,sw,sh,0,0,n,n); return g.getImageData(0,0,n,n).data; }
const FMASK=(()=>{ const m=[]; for(let y=0;y<FN;y++)for(let x=0;x<FN;x++){ const b=4; if(x<b||y<b||x>=FN-b||y>=FN-b) continue; if(x<15&&y<13) continue; if(x<15&&y>26) continue; m.push(y*FN+x);} return m; })();
function fmDist(a,b,dx,dy){ let s=0,n=0; for(const p of FMASK){ const x=p%FN+dx,y=(p/FN|0)+dy; if(x<0||y<0||x>=FN||y>=FN) continue; const q=(y*FN+x)*4,i=p*4; s+=Math.abs(a[i]-b[q])+Math.abs(a[i+1]-b[q+1])+Math.abs(a[i+2]-b[q+2]); n++; } return s/n/3; }
// casella vuota: quasi grigia
function fmEmpty(d){ let s=0; for(const p of FMASK){ const i=p*4; s+=Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2]); } return s/FMASK.length<22; }
// il ritaglio è spostato di (dx,dy) rispetto al ritratto: il pixel (x,y) del ritaglio corrisponde a (x+dx,y+dy) del ritratto
function fmMatch(d,P){ let best=[1e9,null,0,0], second=1e9; const all=[];
  for(const p of P){ let b=[1e9,0,0]; for(let dy=-6;dy<=6;dy+=2)for(let dx=-6;dx<=6;dx+=2){ const v=fmDist(d,p.d,dx,dy); if(v<b[0]) b=[v,dx,dy]; }
    const [,cx,cy]=b; for(let dy=cy-1;dy<=cy+1;dy++)for(let dx=cx-1;dx<=cx+1;dx++){ if(dx===cx&&dy===cy) continue; const v=fmDist(d,p.d,dx,dy); if(v<b[0]) b=[v,dx,dy]; }
    if(b[0]<best[0]){ second=best[0]; best=[b[0],p.slug,b[1],b[2]]; } else if(b[0]<second) second=b[0]; all.push([b[0],p.slug]); }
  return {slug:best[1],d:best[0],d2:second,dx:best[2],dy:best[3],top:all.sort((a,b)=>a[0]-b[0]).slice(0,4).map(x=>x[1])}; }
// cifra del livello: macchia bianca più grande nel riquadro in basso a sinistra
function fmGlyph(src,sx,sy,sw,sh,minTh=90){ const S=64; const d=fmSample(src,sx,sy,sw,sh,S);
  const L=new Float32Array(S*S); let mx=0; for(let i=0;i<S*S;i++){ const r=d[i*4],g=d[i*4+1],b=d[i*4+2]; const sat=Math.max(r,g,b)-Math.min(r,g,b); L[i]=sat<50?(r+g+b)/3:0; }
  // massimo vicino al centro, per non farsi ingannare da bianchi del ritratto ai bordi
  for(let y=12;y<52;y++)for(let x=12;x<52;x++) mx=Math.max(mx,L[y*S+x]);
  const th=Math.max(minTh,mx*0.78), lab=new Int32Array(S*S).fill(-1); let comps=[];
  for(let i=0;i<S*S;i++){ if(L[i]<=th||lab[i]>=0) continue; const st=[i]; lab[i]=comps.length; let n=0,x0=S,y0=S,x1=0,y1=0;
    while(st.length){ const j=st.pop(); n++; const x=j%S,y=j/S|0; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;
      for(const k of [j-1,j+1,j-S,j+S]){ if(k<0||k>=S*S) continue; if(Math.abs((k%S)-x)>1) continue; if(L[k]>th&&lab[k]<0){ lab[k]=comps.length; st.push(k);} } }
    comps.push({id:comps.length,n,x0,y0,x1,y1}); }
  comps=comps.filter(c=>c.y1-c.y0>=S*0.25&&c.y1-c.y0<=S*0.8&&c.x1-c.x0<=S*0.7);
  if(!comps.length) return null;
  const cx0=S/2,cy0=S/2; comps.sort((a,b)=>b.n-a.n); const c=comps[0];
  const h=c.y1-c.y0+1, sc=h/FDH, cx=(c.x0+c.x1+1)/2, v=new Array(FDW*FDH);
  for(let j=0;j<FDH;j++)for(let i=0;i<FDW;i++){ let s=0; for(let yy=0;yy<3;yy++)for(let xx=0;xx<3;xx++){ const X=Math.floor(cx+(i-FDW/2+(xx+.5)/3)*sc), Y=Math.floor(c.y0+(j+(yy+.5)/3)*sc); if(X>=0&&Y>=0&&X<S&&Y<S&&lab[Y*S+X]===c.id) s++; } v[j*FDW+i]=s/9; }
  return v; }
function fmDigit(v,T){ let best=[1e9,0]; for(const L in T){ let d=0; const t=T[L]; for(let i=0;i<v.length;i++) d+=(v[i]-t[i])**2; if(d<best[0]) best=[d,+L]; } return best; }
// Analisi completa: rect = [x0,y0,x1,y1] della griglia (bordo esterno delle icone), cols×rows
function fmCellBox(G,c,r){ const pw=(G[2]-G[0])/G.cols, ph=(G[3]-G[1])/G.rows, s=Math.min(pw,ph)*0.93; return [G[0]+c*pw+(pw-s)/2, G[1]+r*ph+(ph-s)/2, s]; }
// prev: risultati del giro precedente; se c'è, ogni casella si confronta solo con i suoi 4 candidati migliori (molto più veloce)
async function fmPass(im,G,P,prog,prev){ const out=[]; for(let r=0;r<G.rows;r++){ for(let c=0;c<G.cols;c++){ const [sx,sy,s]=fmCellBox(G,c,r); const d=fmSample(im,sx,sy,s,s,FN);
    if(fmEmpty(d)){ out.push({r,c,empty:true}); continue; } const pv=prev&&prev[out.length], Q=pv&&pv.top?P.filter(p=>pv.top.includes(p.slug)):P;
    const m=fmMatch(d,Q.length?Q:P); out.push({r,c,sx,sy,s,...m,top:pv&&pv.top||m.top}); }
    if(prog) prog((r+1)/G.rows); await new Promise(f=>setTimeout(f)); } return out; }
// stima la griglia vera dagli spostamenti trovati (minimi quadrati: centro = a + b·colonna, a + b·riga)
function fmFit(G,cells){ const ok=cells.filter(x=>!x.empty&&x.d<40); if(ok.length<4) return G;
  const fit=pts=>{ const n=pts.length, sx=pts.reduce((a,p)=>a+p[0],0), sy=pts.reduce((a,p)=>a+p[1],0), sxx=pts.reduce((a,p)=>a+p[0]*p[0],0), sxy=pts.reduce((a,p)=>a+p[0]*p[1],0); const den=n*sxx-sx*sx; if(!den) return null; const b=(n*sxy-sx*sy)/den; return [(sy-b*sx)/n,b]; };
  const fx=fit(ok.map(x=>[x.c,x.sx-x.dx*x.s/FN+x.s/2])), fy=fit(ok.map(x=>[x.r,x.sy-x.dy*x.s/FN+x.s/2]));
  const N=Object.assign([...G],{cols:G.cols,rows:G.rows});
  if(fx&&new Set(ok.map(x=>x.c)).size>1){ N[0]=fx[0]-fx[1]/2; N[2]=N[0]+fx[1]*G.cols; }
  if(fy&&new Set(ok.map(x=>x.r)).size>1){ N[1]=fy[0]-fy[1]/2; N[3]=N[1]+fy[1]*G.rows; } return N; }
async function fmAnalyze(im,G,P,T,prog){ let cells=await fmPass(im,G,P,f=>prog&&prog(f/3));
  for(let k=1;k<3;k++){ G=fmFit(G,cells); cells=await fmPass(im,G,P,f=>prog&&prog((k+f)/3),cells); }
  for(const x of cells){ if(x.empty) continue; const s=x.s, sx=x.sx-x.dx*s/FN, sy=x.sy-x.dy*s/FN; const v=fmGlyph(im,sx-s*0.03,sy+s*0.64,s*0.34,s*0.38); if(v&&T){ const b=fmDigit(v,T); x.lv=b[1]; x.ld=b[0]; } }
  return {G,cells}; }

/* ===== Pagina Formazioni ===== */
const FM_KEY=LS_KEY+"-forms";
const FM_MODES=[{k:"",lab:"—"},{k:"pvp",lab:"⚔️ PvP"},{k:"iw",lab:"♾️ Guerra infinita"},{k:"boss",lab:"🐉 Boss"}];
let FMS=(()=>{ try{ const r=JSON.parse(lsGet(FM_KEY)||"[]"); return Array.isArray(r)?r:[]; }catch(e){ return []; } })();
const fmNew=()=>({id:null,name:"",mode:"",cols:7,rows:6,cells:Array(42).fill(null)});
let FM={img:null,rect:null,drag:null,busy:false,cur:fmNew(),sel:-1,unsure:new Set(),P:null};
const fmSaveAll=()=>lsSet(FM_KEY,JSON.stringify(FMS));

function fmInit(){
  $("#fmRoot").innerHTML=`
  <div class="card"><h2>📷 Leggi una formazione da screenshot</h2>
    <p class="muted">Carica lo screenshot della formazione, poi trascina un rettangolo attorno alla griglia dei personaggi: dal bordo della prima icona in alto a sinistra all'ultima in basso a destra. Non serve essere precisi, la griglia si allinea da sola. L'immagine resta nel tuo browser.</p>
    <div class="fmbar"><button class="btn primary" id="fmPickImg">🖼️ Scegli screenshot</button>
      <label>Colonne <input type="number" id="fmCols" min="1" max="12" value="7"></label><label>Righe <input type="number" id="fmRows" min="1" max="12" value="6"></label>
      <button class="btn" id="fmRun" disabled>🔍 Riconosci</button><span class="muted" id="fmStatus">Oppure incolla l'immagine con Ctrl+V.</span></div>
    <div class="fmcanvas" id="fmCanvasWrap" hidden><canvas id="fmCanvas"></canvas></div>
  </div>
  <div class="card" id="fmEdit"></div>
  <div class="card" id="fmSaved"></div>`;
  $("#fmPickImg").onclick=()=>$("#fmFile").click();
  $("#fmFile").onchange=e=>{ const f=e.target.files[0]; e.target.value=""; if(f) fmLoadImg(f); };
  document.addEventListener("paste",e=>{ if(!$("#p-form").classList.contains("on")) return; const it=[...(e.clipboardData||{}).items||[]].find(x=>x.type.startsWith("image/")); if(it) fmLoadImg(it.getAsFile()); });
  const wrap=$("#fmCanvasWrap"); wrap.addEventListener("dragover",e=>e.preventDefault()); wrap.addEventListener("drop",e=>{ e.preventDefault(); const f=e.dataTransfer.files[0]; if(f) fmLoadImg(f); });
  const cv=$("#fmCanvas");
  const pt=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*FM.img.width,(e.clientY-r.top)/r.height*FM.img.height]; };
  cv.addEventListener("pointerdown",e=>{ if(!FM.img||FM.busy) return; cv.setPointerCapture(e.pointerId); FM.drag=pt(e); FM.rect=[...FM.drag,...FM.drag]; fmDraw(); });
  cv.addEventListener("pointermove",e=>{ if(!FM.drag) return; const p=pt(e); FM.rect=[Math.min(FM.drag[0],p[0]),Math.min(FM.drag[1],p[1]),Math.max(FM.drag[0],p[0]),Math.max(FM.drag[1],p[1])]; fmDraw(); });
  cv.addEventListener("pointerup",()=>{ FM.drag=null; const ok=FM.rect&&FM.rect[2]-FM.rect[0]>20&&FM.rect[3]-FM.rect[1]>20; if(!ok) FM.rect=null; $("#fmRun").disabled=!ok; fmDraw(); });
  ["#fmCols","#fmRows"].forEach(s=>$(s).oninput=fmDraw);
  $("#fmRun").onclick=fmRun;
  $("#fmEdit").addEventListener("click",fmEditClick);
  $("#fmEdit").addEventListener("change",fmEditChange);
  $("#fmSaved").addEventListener("click",fmSavedClick);
  $("#fmJson").onchange=e=>{ const f=e.target.files[0]; e.target.value=""; if(!f) return;
    f.text().then(t=>{ const a=JSON.parse(t), L=Array.isArray(a)?a:[a]; let n=0; for(const x of L){ const f2=fmClean(x); if(f2){ f2.id=Date.now()+"-"+(n++); FMS.push(f2); } } fmSaveAll(); fmRenderSaved(); }).catch(()=>alert("Il file non contiene formazioni valide.")); };
  fmRenderEdit(); fmRenderSaved();
}
function fmClean(x){ if(!x||!Array.isArray(x.cells)) return null; const cols=Math.max(1,Math.min(12,+x.cols||7)), rows=Math.max(1,Math.min(12,+x.rows||6));
  const cells=Array.from({length:cols*rows},(_,i)=>{ const c=x.cells[i]; return c&&troopBy[c.slug]?{slug:c.slug,lv:Math.max(1,Math.min(9,+c.lv||1))}:null; });
  return {id:x.id||null,name:String(x.name||""),mode:FM_MODES.some(m=>m.k===x.mode)?x.mode:"",cols,rows,cells}; }
function fmLoadImg(file){
  const url=URL.createObjectURL(file), im=new Image();
  im.onload=()=>{ FM.img=im; FM.rect=null; $("#fmRun").disabled=true; $("#fmCanvasWrap").hidden=false; const cv=$("#fmCanvas"); cv.width=im.width; cv.height=im.height; fmDraw(); $("#fmStatus").textContent="Ora trascina il rettangolo attorno alla griglia."; };
  im.onerror=()=>alert("Non riesco ad aprire questa immagine."); im.src=url;
}
function fmGridSize(){ return [Math.max(1,Math.min(12,+$("#fmCols").value||7)),Math.max(1,Math.min(12,+$("#fmRows").value||6))]; }
function fmDraw(){
  const cv=$("#fmCanvas"), g=cv.getContext("2d"), im=FM.img; if(!im) return; g.drawImage(im,0,0);
  const R=FM.rect; if(!R) return; const [cols,rows]=fmGridSize(), lw=Math.max(2,im.width/300);
  g.fillStyle="rgba(0,0,0,.45)"; g.fillRect(0,0,im.width,R[1]); g.fillRect(0,R[3],im.width,im.height-R[3]); g.fillRect(0,R[1],R[0],R[3]-R[1]); g.fillRect(R[2],R[1],im.width-R[2],R[3]-R[1]);
  g.strokeStyle="#3ee07a"; g.lineWidth=lw; g.strokeRect(R[0],R[1],R[2]-R[0],R[3]-R[1]); g.lineWidth=lw/2; g.beginPath();
  for(let i=1;i<cols;i++){ const x=R[0]+(R[2]-R[0])*i/cols; g.moveTo(x,R[1]); g.lineTo(x,R[3]); }
  for(let j=1;j<rows;j++){ const y=R[1]+(R[3]-R[1])*j/rows; g.moveTo(R[0],y); g.lineTo(R[2],y); } g.stroke();
}
async function fmPortraits(){
  if(FM.P) return FM.P;
  const load=t=>new Promise(r=>{ const i=new Image(); i.onload=()=>r({slug:t.slug,d:fmSample(i,0,0,i.width,i.height,FN)}); i.onerror=()=>r(null); i.src=`img/truppe/${t.slug}.webp`; });
  FM.P=(await Promise.all(TROOPS.map(load))).filter(Boolean); return FM.P;
}
async function fmRun(){
  if(!FM.img||!FM.rect||FM.busy) return; FM.busy=true; $("#fmRun").disabled=true; const st=$("#fmStatus");
  try{
    st.textContent="Preparo i ritratti…"; const P=await fmPortraits(); const [cols,rows]=fmGridSize();
    const G=Object.assign([...FM.rect],{cols,rows});
    const R=await fmAnalyze(FM.img,G,P,FM_DIGITS,f=>st.textContent=`Riconosco… ${Math.round(f*100)}%`);
    FM.rect=[R.G[0],R.G[1],R.G[2],R.G[3]]; fmDraw();
    const cur=FM.cur; cur.cols=cols; cur.rows=rows; cur.cells=Array(cols*rows).fill(null); FM.unsure=new Set(); FM.sel=-1;
    for(const x of R.cells){ const i=x.r*cols+x.c; if(x.empty) continue; cur.cells[i]={slug:x.slug,lv:x.lv||1}; if(x.d>38||x.d2-x.d<10||!x.lv) FM.unsure.add(i); }
    const n=cur.cells.filter(Boolean).length;
    st.textContent=`Fatto: ${n} ${n===1?"personaggio":"personaggi"}`+(FM.unsure.size?`, ${FM.unsure.size} da controllare (bordo arancione).`:".")+" Controlla qui sotto e correggi toccando una casella.";
    fmRenderEdit(); $("#fmEdit").scrollIntoView({behavior:"smooth",block:"start"});
  }catch(e){ st.textContent="Qualcosa è andato storto: "+e.message; }
  FM.busy=false; $("#fmRun").disabled=false;
}
function fmCellHtml(c,i,small){
  if(!c) return `<button class="fmcell empty${FM.sel===i&&!small?" sel":""}" data-i="${i}" ${small?"disabled":""}></button>`;
  const t=troopBy[c.slug];
  return `<button class="fmcell${FM.unsure.has(i)&&!small?" unsure":""}${FM.sel===i&&!small?" sel":""}" data-i="${i}" ${small?"disabled":""} title="${esc(t.name)} · Lv ${c.lv}"><img src="img/truppe/${c.slug}.webp" alt="" loading="lazy"><span class="fmlv">${c.lv}</span></button>`;
}
function fmSummary(f){
  const m=new Map(); f.cells.forEach(c=>{ if(!c) return; const e=m.get(c.slug)||{n:0,lv:[]}; e.n++; e.lv.push(c.lv); m.set(c.slug,e); });
  return [...m].sort((a,b)=>b[1].n-a[1].n||troopBy[a[0]].name.localeCompare(troopBy[b[0]].name)).map(([s,e])=>{
    const lv=[...new Set(e.lv)].sort((a,b)=>b-a).map(l=>`Lv ${l}${e.lv.filter(x=>x===l).length>1&&new Set(e.lv).size>1?" ×"+e.lv.filter(x=>x===l).length:""}`).join(", ");
    return `<div class="fmsum"><img src="img/truppe/${s}.webp" alt="" loading="lazy"><span><b class="r-${troopBy[s].rarity}">${esc(troopBy[s].name)}</b> × ${e.n}<br><span class="muted">${lv}</span></span></div>`; }).join("");
}
function fmRenderEdit(){
  const f=FM.cur, sel=FM.sel>=0?f.cells[FM.sel]:undefined; let ed="";
  if(FM.sel>=0){ let lv=""; for(let L=1;L<=9;L++) lv+=`<option ${sel&&sel.lv===L?"selected":""}>${L}</option>`;
    ed=`<div class="fmed">${sel?`<img src="img/truppe/${sel.slug}.webp" alt=""><b>${esc(troopBy[sel.slug].name)}</b><label>Livello <select data-f="lv">${lv}</select></label>`:`<b class="muted">Casella vuota</b>`}
      <button class="btn" data-act="pick">${sel?"Cambia personaggio":"＋ Metti un personaggio"}</button>${sel?`<button class="btn" data-act="clear">Svuota</button>`:""}<button class="btn" data-act="desel">Chiudi</button></div>`; }
  const n=f.cells.filter(Boolean).length;
  $("#fmEdit").innerHTML=`<h2>🧩 ${f.id?"Modifica formazione":"Formazione"}</h2>
    <div class="fmbar"><input class="tnotein fmname" data-f="name" placeholder="Nome della formazione" value="${esc(f.name)}">
      <select data-f="mode">${FM_MODES.map(m=>`<option value="${m.k}" ${m.k===f.mode?"selected":""}>${m.lab}</option>`).join("")}</select></div>
    <div class="fmgrid" style="grid-template-columns:repeat(${f.cols},minmax(0,1fr))">${f.cells.map((c,i)=>fmCellHtml(c,i)).join("")}</div>
    ${ed}
    <div class="fmbar"><button class="btn primary" data-act="save" ${n?"":"disabled"}>💾 ${f.id?"Salva modifiche":"Salva formazione"}</button><button class="btn" data-act="new">Nuova vuota</button><span class="muted">${n} ${n===1?"personaggio":"personaggi"}</span></div>
    ${n?`<h3>Chi c'è dentro</h3><div class="fmsums">${fmSummary(f)}</div>`:""}`;
}
function fmEditClick(e){
  const cell=e.target.closest(".fmcell"); if(cell){ FM.sel=+cell.dataset.i===FM.sel?-1:+cell.dataset.i; fmRenderEdit(); return; }
  const b=e.target.closest("[data-act]"); if(!b) return; const a=b.dataset.act, f=FM.cur;
  if(a==="desel"){ FM.sel=-1; }
  else if(a==="clear"){ f.cells[FM.sel]=null; FM.unsure.delete(FM.sel); }
  else if(a==="pick"){ const i=FM.sel; troopPick("Scegli personaggio",new Set(),s=>{ const old=f.cells[i]; f.cells[i]={slug:s,lv:old?old.lv:(troopBy[s].rarity==="mythic"?4:6)}; FM.unsure.delete(i); fmRenderEdit(); }); return; }
  else if(a==="new"){ FM.cur=fmNew(); FM.unsure=new Set(); FM.sel=-1; }
  else if(a==="save"){ const c=JSON.parse(JSON.stringify(f)); if(!c.name.trim()) c.name="Formazione "+(FMS.length+1);
    if(c.id){ const k=FMS.findIndex(x=>x.id===c.id); if(k>=0) FMS[k]=c; else FMS.push(c); } else { c.id=Date.now()+""; FMS.push(c); }
    fmSaveAll(); FM.cur=fmNew(); FM.unsure=new Set(); FM.sel=-1; fmRenderSaved(); }
  fmRenderEdit();
}
function fmEditChange(e){ const x=e.target, f=x.dataset.f; if(!f) return;
  if(f==="name") FM.cur.name=x.value; else if(f==="mode") FM.cur.mode=x.value;
  else if(f==="lv"&&FM.sel>=0&&FM.cur.cells[FM.sel]){ FM.cur.cells[FM.sel].lv=+x.value; FM.unsure.delete(FM.sel); fmRenderEdit(); } }
function fmRenderSaved(){
  const mode=k=>(FM_MODES.find(m=>m.k===k)||{}).lab;
  $("#fmSaved").innerHTML=`<div class="tlbar"><div><b>📚 Formazioni salvate</b><div class="muted">Restano in questo browser. Scaricale in un file per tenerle al sicuro o passarle a qualcuno.</div></div>
    <div class="tlbtns"><button class="btn" data-act="export" ${FMS.length?"":"disabled"}>💾 Scarica</button><button class="btn" data-act="import">📂 Carica</button></div></div>
    ${FMS.length?FMS.map((f,k)=>`<div class="fmsaved"><div class="fmgrid mini" style="grid-template-columns:repeat(${f.cols},minmax(0,1fr))">${f.cells.map((c,i)=>fmCellHtml(c,i,true)).join("")}</div>
      <div><b>${esc(f.name)}</b>${f.mode?` <span class="tchip">${mode(f.mode)}</span>`:""}<div class="muted">${f.cells.filter(Boolean).length} personaggi</div>
      <div class="tlbtns"><button class="btn" data-act="open" data-k="${k}">Apri</button><button class="btn" data-act="del" data-k="${k}">Elimina</button></div></div></div>`).join("")
    :`<p class="muted">Nessuna formazione salvata.</p>`}`;
}
function fmSavedClick(e){ const b=e.target.closest("[data-act]"); if(!b) return; const a=b.dataset.act, k=+b.dataset.k;
  if(a==="export"){ const blob=new Blob([JSON.stringify(FMS,null,1)],{type:"application/json"}), l=document.createElement("a"); l.href=URL.createObjectURL(blob); l.download=`formazioni-${isoDate(today())}.json`; l.click(); setTimeout(()=>URL.revokeObjectURL(l.href),1000); }
  else if(a==="import") $("#fmJson").click();
  else if(a==="open"){ FM.cur=JSON.parse(JSON.stringify(FMS[k])); FM.unsure=new Set(); FM.sel=-1; fmRenderEdit(); $("#fmEdit").scrollIntoView({behavior:"smooth",block:"start"}); }
  else if(a==="del"){ if(confirm(`Eliminare «${FMS[k].name}»?`)){ FMS.splice(k,1); fmSaveAll(); fmRenderSaved(); } }
}
fmInit();
