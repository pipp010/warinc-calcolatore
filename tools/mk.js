const fs=require('fs');
const asso="const o=[...document.querySelectorAll('#wMode option')].find(o=>/Asso carte.*oltranza/.test(o.textContent)); ui.mode=o.value; renderInputs(); recalcNow();";
const S=[
{"name":"passo01","clip":[".top",".modebar"],"marks":[["#tabs","1"],["#saveFileBtn","2"],["#themeBtn","3"],[".modeopt:nth-child(2) .check","4"]],"extra":24},
{"name":"passo02","clip":["#calcCols > .card:first-child"],"marks":[["#hGems","1"],["#hHq","2"],["#hPasses","3"],["#hInv","4"]]},
{"name":"passo03","clip":["#cardWant"],"marks":[[".want","1"],["#wDays","2"],["#wPlay","3"],["#wMode","4"]]},
{"name":"passo04","clip":["#cardRes > h2","#summary"],"marks":[["#head","1"],["#summary .scen.ok","2"],["#summary .scen.ko","3"]]},
{"name":"passo05","clip":["#tips"],"extra":30},
{"name":"passo06","ui":{"now":true},"js":asso,"clip":["#cardRes .shop h3.bigtitle","#planTyp","#planBad"],"marks":[["#planBad tr:last-child","1"]]},
{"name":"passo07","ui":{"now":true},"js":asso,"clip":["#waitTitle","#waitTable"],"marks":[["#waitTable tr:nth-child(2)","1"],["#waitTable tr:nth-child(5)","2"]]},
{"name":"passo08","w":900,"css":".cols:has(#flowTyp)>div:first-child{display:none!important}.cols:has(#flowTyp){grid-template-columns:1fr!important}","clip":["#flowBad","#planHow"],"marks":[["#flowBad tr:last-child","1"],["#planHow","2"]]},
{"name":"passo09","clip":["#extrTable"],"marks":[["#extrTable tr:nth-child(2)","1"]]},
{"name":"passo10","ui":{"zero":true},"clip":["#summary","#zeroTyp","#zeroBad"],"marks":[["#summary .scen.ko .kv div:last-child","1"]]},
{"name":"passo11","page":"set","clip":["#s-free"],"marks":[["#freeTable","1"]]}];
fs.writeFileSync(__dirname+'/shots.json',JSON.stringify(S,null,1));
