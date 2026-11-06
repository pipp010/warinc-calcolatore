// Screenshot della guida (Chrome headless). Uso: node tools/mk.js && node tools/cdp.js [passoNN]
const fs=require('fs'),{spawn}=require('child_process'),path=require('path'),http=require('http');
const DIR=path.join(__dirname,'..'), CH='C:/Program Files/Google/Chrome/Application/chrome.exe', PORT=9333;
const demoUi=JSON.parse(fs.readFileSync(__dirname+'/demo.json','utf8'));
const shots=JSON.parse(fs.readFileSync(process.env.SHOTS||__dirname+'/shots.json','utf8'));
const only=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const getJSON=u=>new Promise((res,rej)=>http.get(u,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}})}).on('error',rej));
(async()=>{
  const ch=spawn(CH,['--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port='+PORT,'--user-data-dir='+path.join(require('os').tmpdir(),'warinc-shots'),'about:blank'],{stdio:'ignore'});
  let list; for(let i=0;i<40;i++){ try{ list=await getJSON(`http://127.0.0.1:${PORT}/json`); if(list.find(t=>t.type==='page')) break; }catch(e){} await sleep(250); }
  const ws=new WebSocket(list.find(t=>t.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0; const pend={}; ws.onmessage=m=>{ const d=JSON.parse(m.data); if(d.id&&pend[d.id]){ pend[d.id](d); delete pend[d.id]; } };
  const send=(method,params={})=>new Promise(r=>{ const i=++id; pend[i]=r; ws.send(JSON.stringify({id:i,method,params})); });
  const ev=async expr=>{ const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true}); if(r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,400)); return r.result.result.value; };
  await send('Page.enable'); await send('Runtime.enable');
  const url=require('url').pathToFileURL(DIR+'/index.html').href;
  for(const s of shots){ if(only&&!s.name.startsWith(only)) continue;
    const W=s.w||1100;
    await send('Emulation.setDeviceMetricsOverride',{width:W,height:s.vh||900,deviceScaleFactor:s.dpr||1.5,mobile:!!s.mobile});
    await send('Page.navigate',{url}); await sleep(600);
    const ui=Object.assign({},demoUi,s.ui||{});
    await ev(`localStorage.clear();localStorage.setItem("warinc-calc-v2-ui2",${JSON.stringify(JSON.stringify(ui))});localStorage.setItem("warinc-calc-v2-theme",${JSON.stringify(s.theme||"light")});localStorage.setItem("warinc-calc-v2-page",${JSON.stringify(s.page||"calc")});true`);
    await send('Page.reload',{ignoreCache:true}); await sleep(1500);
    await ev(`document.fonts.ready.then(()=>true)`);
    await ev(`(()=>{ recalcNow(); ${s.js||""}; return true; })()`); await sleep(400);
    const rect=await ev(`(()=>{
      const st=document.createElement("style"); st.textContent='.hl{outline:3px solid #e0482f!important;outline-offset:3px;border-radius:8px}.badge{position:absolute;z-index:999;background:#e0482f;color:#fff;font:700 15px/28px Inter,sans-serif;width:28px;height:28px;border-radius:50%;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.35)} ${(s.css||"").replace(/'/g,"\'")}'; document.head.appendChild(st);
      ${JSON.stringify(s.marks||[])}.forEach(([sel,lab])=>{ const el=document.querySelector(sel); if(!el) throw new Error("manca "+sel); el.classList.add("hl"); const r=el.getBoundingClientRect(); const b=document.createElement("div"); b.className="badge"; b.textContent=lab; b.style.left=(r.left+scrollX-16)+"px"; b.style.top=(r.top+scrollY-16)+"px"; document.body.appendChild(b); });
      const els=${JSON.stringify(s.clip)}.map(q=>{ const e=document.querySelector(q); if(!e) throw new Error("manca clip "+q); return e.getBoundingClientRect(); });
      const x=Math.min(...els.map(r=>r.left)), y=Math.min(...els.map(r=>r.top)), r=Math.max(...els.map(r=>r.right)), b=Math.max(...els.map(r=>r.bottom));
      return {x:Math.max(0,x-20+scrollX), y:Math.max(0,y-20+scrollY), width:Math.min(innerWidth,r-x+40), height:b-y+${s.extra??40}};
    })()`);
    if(s.maxH) rect.height=Math.min(rect.height,s.maxH);
    const shot=await send('Page.captureScreenshot',{format:'png',clip:{...rect,scale:1},captureBeyondViewport:true});
    const out=path.join(process.env.SHOT_OUT||path.join(DIR,'img','guida'),s.name+'.png'); fs.mkdirSync(path.dirname(out),{recursive:true});
    fs.writeFileSync(out,Buffer.from(shot.result.data,'base64')); console.log(s.name,Math.round(rect.width)+'x'+Math.round(rect.height),fs.statSync(out).size);
  }
  ws.close(); ch.kill();
})().catch(e=>{ console.error(e); process.exit(1); });
