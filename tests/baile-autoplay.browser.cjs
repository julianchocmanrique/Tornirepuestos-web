// Local-only browser tests; the clock is advanced, no records or payments are submitted.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33220';
assert.ok(['localhost','127.0.0.1'].includes(new URL(root).hostname));
const settle = () => new Promise(r => setTimeout(r,100));
(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || undefined});
 try {
  for (const width of [375,1440]) {
   const page = await browser.newPage({viewport:{width,height:1000},reducedMotion:'no-preference',hasTouch:width===375});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.clock.install(); await page.goto(root+'/j2rankia');
   await page.getByRole('button',{name:'Pausar carrusel',exact:true}).waitFor();
   await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important}'});
   const card=page.locator('.event-cover-card[data-position="active"]');
   const active=()=>card.getAttribute('href');
   async function tick(ms=6600){await page.clock.fastForward(ms);await settle();}
   const first=await active(); await tick(); assert.notEqual(await active(),first,'starts automatically');
   const next=page.getByRole('button',{name:'Evento siguiente',exact:true});
   await next.click(); await settle(); const manual=await active();
   await tick(6000);assert.equal(await active(),manual,'new interval after manual arrow');
   await tick(700);assert.notEqual(await active(),manual,'manual arrow does not permanently pause');
   await page.locator('.event-dots button').first().click();await settle();
   const dot=await active();await tick();assert.notEqual(await active(),dot,'dots preserve autoplay');
   await page.getByRole('button',{name:'Pausar carrusel',exact:true}).click();await settle();
   const paused=await active();await tick(14000);assert.equal(await active(),paused,'explicit pause persists');
   await next.click();await settle();const manualPaused=await active();await tick();assert.equal(await active(),manualPaused,'arrows respect explicit pause');
   await page.getByRole('button',{name:'Reanudar carrusel',exact:true}).click();await settle();
   await tick();assert.notEqual(await active(),manualPaused,'play works without moving pointer away from play');
   if(width===1440){
    await card.hover();await settle();const hovered=await active();await tick();assert.equal(await active(),hovered,'hover temporarily pauses');
    await page.mouse.move(0,0);await settle();await tick();assert.notEqual(await active(),hovered,'leaving image resumes');
   }
   await card.focus();await page.keyboard.press('ArrowRight');await settle();
   const keyboard=await active();await tick();assert.equal(await active(),keyboard,'keyboard focus pauses reading');
   await page.locator('.dance-header a').first().focus();await page.mouse.move(0,0);await settle();await tick();assert.notEqual(await active(),keyboard,'leaving keyboard focus resumes');
   if(width===375){
    const cover=page.locator('.event-coverflow');
    await cover.evaluate(el => el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,changedTouches:[new Touch({identifier:1,target:el,clientX:250,clientY:300})]})));await settle();
    const touched=await active();await tick();assert.equal(await active(),touched,'touch hold pauses');
    await cover.evaluate(el => el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:el,clientX:80,clientY:300})]})));await settle();
    const swiped=await active();assert.notEqual(swiped,touched,'swipe advances');await tick();assert.notEqual(await active(),swiped,'autoplay resumes after swipe');
   }
   const beforeHidden=await active();
   await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await settle();await tick();assert.equal(await active(),beforeHidden,'background tab pauses');
   await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await settle();await tick();assert.notEqual(await active(),beforeHidden,'visible tab resumes');
   const count=await page.locator('.event-cover-card').count(),loopStart=await active();for(let i=0;i<count;i++)await tick();assert.equal(await active(),loopStart,'wraps around');
   await page.emulateMedia({reducedMotion:'reduce'});await settle();await page.getByRole('button',{name:'Reanudar carrusel',exact:true}).waitFor();
   const reduced=await active();await tick();assert.equal(await active(),reduced,'respects reduced motion by default');
   await page.getByRole('button',{name:'Reanudar carrusel',exact:true}).click();await settle();await tick();assert.notEqual(await active(),reduced,'reduced motion permits explicit playback');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no mobile overflow');
   assert.deepEqual(errors,[]);console.log(`OK ${width}px: inicio automático, flechas, puntos, pausa, reanudar, foco, pestaña, ciclo y movimiento reducido`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
