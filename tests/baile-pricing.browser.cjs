// Local browser QA: all submissions use isolated test data and fictitious receipts.
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33220';
assert.ok(['localhost','127.0.0.1'].includes(new URL(root).hostname));
(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || undefined});
 try {
  const page = await browser.newPage({reducedMotion:'reduce'}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const base=root+'/j2rankia/eventos/thesunfest';
  mkdirSync('/tmp/baile-pricing-screenshots',{recursive:true});
  async function fits(label){ const width=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);assert.ok(width[1]<=width[0]+1, label+': '+width); }
  for(const width of [320,375,768,1440]){
   await page.setViewportSize({width,height:900}); await page.goto(base+'#pases');
   assert.equal(await page.locator('.pass-card').count(),3);await fits('pricing '+width);
   await page.locator('#pases').scrollIntoViewIfNeeded();
   await page.screenshot({path:'/tmp/baile-pricing-screenshots/plans-'+width+'.png',fullPage:true});
   await page.getByRole('link',{name:'Probar este pase'}).nth(2).click();
   await page.getByRole('radio',{name:/Acompañante/}).waitFor();
   assert.equal(await page.locator('[value="acompanante"]').isChecked(),true);
   await fits('registration '+width);
   await page.screenshot({path:'/tmp/baile-pricing-screenshots/register-'+width+'.png',fullPage:true});
   console.log('OK plans, deep link, mobile layout '+width+'px');
  }
  await page.setViewportSize({width:375,height:812});
  for(const [name,value] of Object.entries({firstName:'Invitado',lastName:'Prueba',birthDate:'2000-01-01',city:'Santa Marta',phone:'3000000000',email:`guest-${Date.now()}@example.test`})) await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('[name="sex"]').selectOption('Otro');
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  await page.locator('[name="salsa"]').selectOption('No aplica'); await page.locator('[name="bachata"]').selectOption('No aplica');
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  const doc='GUEST'+Date.now();
  for(const [name,value] of Object.entries({document:doc,documentConfirm:doc,password:'PruebaInvitado123',passwordConfirm:'PruebaInvitado123'})) await page.locator(`[name="${name}"]`).fill(value);
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  assert.match(await page.locator('.registration-letter').innerText(),/acompañante/);
  assert.doesNotMatch(await page.locator('.registration-letter').innerText(),/suscrito COMPETIDOR/);
  const pad=page.locator('.registration-signature svg');await pad.scrollIntoViewIfNeeded();const box=await pad.boundingBox();
  await page.mouse.move(box.x+10,box.y+20);await page.mouse.down();await page.mouse.move(box.x+65,box.y+70,{steps:12});await page.mouse.move(box.x+130,box.y+20,{steps:12});await page.mouse.up();
  await page.locator('[name="waiverAccepted"]').check();await page.locator('[name="consent"]').check();
  // Changing pass changes the declaration and invalidates its prior acceptance.
  await page.locator('[value="competidor"]').check();
  await page.waitForFunction(() => !document.querySelector('[name="waiverAccepted"]').checked);
  assert.equal(await page.locator('[name="waiverAccepted"]').isChecked(),false);
  assert.equal(await page.locator('.registration-signature polyline').count(),0);
  await page.locator('[value="acompanante"]').check();
  await pad.scrollIntoViewIfNeeded();const b=await pad.boundingBox();
  await page.mouse.move(b.x+10,b.y+20);await page.mouse.down();await page.mouse.move(b.x+65,b.y+70,{steps:12});await page.mouse.move(b.x+130,b.y+20,{steps:12});await page.mouse.up();
  await page.locator('[name="waiverAccepted"]').check();
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  assert.match(await page.locator('.registration-pass').innerText(),/20.000/);
  const file={name:'ficticio.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==','base64')};
  await page.locator('[name="receipt"]').setInputFiles(file);await page.locator('[name="photo"]').setInputFiles(file);await page.locator('[name="reference"]').fill('NO-PAGO-REAL');
  const response=page.waitForResponse(r=>r.url().endsWith('/thesunfest/register')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Enviar registro',exact:true}).click();assert.equal((await response).status(),201);
  await page.waitForURL(base+'/participante');await page.getByRole('heading',{name:'Acompañante',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Crear inscripción'}).count(),0);await fits('attendee');
  await page.screenshot({path:'/tmp/baile-pricing-screenshots/attendee-375.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log('OK attendee registration, correct price, document acceptance reset and no competition form');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
