import pkg from '/Users/mi1k/node_modules/playwright/index.js';
const { chromium } = pkg;
const b=await chromium.launch();
const errs=[];
const ctx=await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1.5});
const p=await ctx.newPage();
p.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,100)); });
p.on('pageerror',e=>errs.push('PE:'+e.message.slice(0,100)));
await p.goto('http://localhost:8210/home.html',{waitUntil:'networkidle'});
await p.waitForTimeout(3200);
const d=await p.evaluate(()=>({ fit:getComputedStyle(document.documentElement).getPropertyValue('--fit').trim(),
  ver:document.querySelector('.hm-ver')?.textContent,
  factsFS:document.querySelector('.facts li')?getComputedStyle(document.querySelector('.facts li')).fontSize:'n/a' }));
await p.screenshot({path:'/Users/mi1k/.claude/jobs/bf7c708e/tmp/home-v22.png'});
console.log('home v2.2:', JSON.stringify(d), '(prev fit ~0.426)', 'errors:', errs.length?errs:'none');
await b.close();
