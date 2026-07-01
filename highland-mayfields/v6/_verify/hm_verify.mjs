import { chromium } from 'playwright';
const BASE='http://localhost:8210/index.html';
const OUT='/Users/mi1k/Documents/Projects/highland-mayfields/sales-suite/_verify';
const errors=[];
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:2560,height:1600},deviceScaleFactor:1});
const p=await c.newPage();
p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
p.on('pageerror',e=>errors.push('PAGEERR:'+e.message));
await p.goto(BASE,{waitUntil:'domcontentloaded'});
const fresh=await p.evaluate(async()=>({ls:localStorage.length,cs:caches?(await caches.keys()).length:-1}));
console.log('FRESH localStorage=',fresh.ls,'caches=',fresh.cs);
await p.waitForSelector('#dlOffer:not([hidden]) #dlBtn',{timeout:15000});
console.log('OFFER shown');
await p.click('#dlBtn');
let mid=false,midInfo=null;
for(let i=0;i<600;i++){
  const st=await p.evaluate(()=>{
    const rows=[...document.querySelectorAll('#dlList .dl-row')].map(r=>({t:r.querySelector('.dl-rtype')?.textContent,n:r.querySelector('.dl-rname')?.textContent,s:r.querySelector('.dl-rsize')?.textContent}));
    return {n:rows.length,rows,count:document.getElementById('dlCount').textContent,now:document.getElementById('dlNowFile').textContent,nowVis:!document.getElementById('dlNow').hidden,pct:document.getElementById('dlPct').textContent,done:!document.getElementById('dlDone').hidden};
  });
  if(!mid && st.n>=8 && !st.done){midInfo=st;await p.locator('#dlGate').screenshot({path:OUT+'/hm-mid.png'});mid=true;console.log('MID n='+st.n+' count='+st.count+' now='+JSON.stringify(st.now)+' nowVis='+st.nowVis+' pct='+st.pct);console.log('  last rows:',JSON.stringify(st.rows.slice(-3)));}
  if(st.done)break;
  await p.waitForTimeout(40);
}
await p.waitForSelector('#dlDone:not([hidden])',{timeout:60000});
await p.waitForTimeout(500);
const d=await p.evaluate(()=>({msg:document.getElementById('dlDoneMsg').textContent,sum:document.getElementById('dlSummary').textContent,count:document.getElementById('dlCount').textContent}));
console.log('DONE',JSON.stringify(d));
await p.screenshot({path:OUT+'/hm-done.png'});
await p.click('#dlExpand');
await p.waitForTimeout(350);
const e=await p.evaluate(()=>({rows:document.querySelectorAll('#dlFullList .dl-row').length,hidden:document.getElementById('dlFullList').hidden,label:document.getElementById('dlExpand').textContent}));
console.log('EXPAND',JSON.stringify(e));
await p.screenshot({path:OUT+'/hm-expanded.png'});
console.log('CONSOLE ERRORS:',errors.length,errors.slice(0,6));
const prob=[];
if(!mid)prob.push('no mid frame');
if(midInfo&&!/(KB|MB)/.test(JSON.stringify(midInfo.rows)))prob.push('no sizes');
if(midInfo&&!/\.(webp|png|jpg|mp4|css|js|woff2|svg|json)/i.test(JSON.stringify(midInfo.rows)))prob.push('no real names');
if(!/works fully offline/i.test(d.sum))prob.push('summary offline missing');
if(!/\d+ assets/i.test(d.sum))prob.push('summary count missing');
if(e.rows<100)prob.push('expand rows low '+e.rows);
if(errors.length)prob.push('console errors '+errors.length);
console.log(prob.length?('FAIL: '+prob.join(' | ')):'ALL PASSED');
await b.close();
process.exit(prob.length?1:0);
