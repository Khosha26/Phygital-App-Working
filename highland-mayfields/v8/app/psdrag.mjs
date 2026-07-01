import pkg from '/Users/mi1k/node_modules/playwright/index.js';
const { chromium } = pkg;
const b=await chromium.launch();
const errs=[];
const ctx=await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
const p=await ctx.newPage();
p.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,100)); });
p.on('pageerror',e=>errs.push('PE:'+e.message.slice(0,100)));
await p.goto('http://localhost:8210/home.html',{waitUntil:'networkidle'});
await p.waitForTimeout(3000);
await p.click('#fabToggle',{force:true}); await p.waitForTimeout(300);
await p.click('#fabEmi',{force:true}); await p.waitForTimeout(700);
const open1=await p.evaluate(()=>document.querySelector('#hmps-root')?.classList.contains('hmps-open'));
// click on the screen area away from window (persistent? should stay open)
await p.mouse.click(120,400); await p.waitForTimeout(300);
const openAfterOutside=await p.evaluate(()=>document.querySelector('#hmps-root')?.classList.contains('hmps-open'));
// drag the header
const head=await p.$('.hmps-head, [class*="hmps-head"]');
let moved='no-head';
if(head){ const bb=await head.boundingBox();
  const before=await p.$eval('#hmps-drawer',el=>el.getBoundingClientRect().left);
  await p.mouse.move(bb.x+bb.width/2, bb.y+10); await p.mouse.down();
  await p.mouse.move(bb.x+bb.width/2-220, bb.y+120,{steps:10}); await p.mouse.up();
  await p.waitForTimeout(300);
  const after=await p.$eval('#hmps-drawer',el=>el.getBoundingClientRect().left);
  moved=Math.abs(after-before)>80?('moved '+Math.round(before)+'->'+Math.round(after)):('did-not-move '+Math.round(before)+'->'+Math.round(after)); }
console.log('open:',open1,'| stays open after outside click:',openAfterOutside,'| drag:',moved);
console.log('errors:', errs.length?errs:'none');
await b.close();
