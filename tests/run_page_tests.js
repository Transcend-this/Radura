// Loads index.html in a simulated browser, runs its built-in tests, and checks the storage scenarios.
// Setup once:  npm install      Run:  node run_page_tests.js
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');const wait=ms=>new Promise(r=>setTimeout(r,ms));
function page(db,pre){return new JSDOM(html,{runScripts:'dangerously',url:'https://dayguard.test/#am',pretendToBeVisual:true,beforeParse(w){
 if(pre)w.localStorage.setItem('dg-tracker-v1',pre);if(!db)return;const st=w.__st={};
 const col={where:()=>({limit:()=>({get:async()=>({docs:Object.values(st).filter(v=>v.kind==='day').map(v=>({exists:true,data:()=>v}))})})}),doc:id=>({get:async()=>({exists:!!st[id],data:()=>st[id]}),set:b=>db==='refuse'?Promise.reject({code:'invalid_argument'}):(st[id]=b,Promise.resolve())})};
 w.claude={use:async n=>n==='db'?{collection:()=>col}:n==='user'?{id:async()=>'u1'}:null}}})}
let fails=0;const check=(name,ok)=>{console.log((ok?'PASS ':'FAIL ')+name);if(!ok)fails++};
(async()=>{
 let d=page(null),w=d.window,doc=w.document;await wait(300);
 const rows=[...doc.querySelectorAll('#tbody tr')];rows.forEach(r=>check('built-in: '+r.cells[0].textContent,/PASS/.test(r.cells[1].textContent)));
 doc.querySelector('#save').click();await wait(200);
 check('standalone: a saved check-in is kept in this browser',Object.keys(JSON.parse(w.localStorage.getItem('dg-tracker-v1')).days).length===1);
 const pre=w.localStorage.getItem('dg-tracker-v1');
 d=page('refuse',pre);w=d.window;doc=w.document;await wait(300);doc.querySelector('#save').click();await wait(300);
 check('shared link (account refuses writes): entries stay on the device',JSON.parse(w.localStorage.getItem('dg-tracker-v1')).days[Object.keys(w.__DG.S.days)[0]].checkins.length===2);
 d=page('ok',pre);w=d.window;await wait(300);check('owner: device history uploads to the account',Object.keys(w.__st).some(k=>k.startsWith('day-')));
 check('no "undefined" or "NaN" shown on the page',!/undefined|NaN/.test(w.document.body.textContent));
 console.log(fails?`\n${fails} FAILED`:'\nALL PASSED');process.exit(fails?1:0)})();
