// Local-only API fixtures: verifies guest, loading, role and logout navigation without real accounts.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33220';
assert.ok(['localhost','127.0.0.1'].includes(new URL(root).hostname));
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  try {
    for (const width of [375,1280]) for (const eventId of ['', 'thesunfest']) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      const base = '/prueba-baile' + (eventId ? '/eventos/' + eventId : '');
      const api = '/api/baile' + (eventId ? '/eventos/' + eventId : '');
      let release; const loading = new Promise(r => release = r);
      const data = { user: null, settings: { name: 'Evento de prueba', tagline: 'Prueba', demo: false, fullPassFee: 180000, registrationOpen: true, categoryRegistrationOpen: true }, participants: [], categories: [], payments: [], enrollments: [], scores: [], judges: [], audit: [], notes: [], schedule: [], accreditations: [], exampleCreated: false };
      await page.route('**/api/baile/**', async route => {
        const endpoint = new URL(route.request().url()).pathname;
        if (endpoint === api + '/snapshot') { await loading; return route.fulfill({json:data}); }
        if (endpoint === api + '/logout') { data.user = null; return route.fulfill({json:{ok:true}}); }
        throw Error('Unexpected endpoint '+endpoint);
      });
      await page.goto(root + base + '/acceso', {waitUntil:'domcontentloaded'});
      const nav = page.getByRole('navigation', {name:'Navegación del evento'});
      await nav.waitFor();
      async function guest() {
        for (const name of ['El evento','Mi panel']) assert.equal(await nav.getByRole('link',{name,exact:true}).count(),0);
        assert.equal(await nav.getByRole('link',{name:'Ingresar',exact:true}).count(),1);
        assert.equal(await nav.getByRole('link',{name:'Resultados',exact:true}).count(),1);
        assert.equal(await nav.getByRole('link',{name:eventId?'Registrarse':'Inscribirme'}).count(),1);
      }
      await guest(); release();
      await page.getByRole('heading',{name:'Ingresa a tu cuenta',exact:true}).waitFor(); await guest();
      for (const [role,path] of Object.entries({superadmin:'admin',contractor:'contratista',participant:'participante',judge:'jurado'})) {
        data.user = {id:'test',name:'Prueba',role};
        await page.reload();
        await nav.getByRole('link',{name:'Mi panel',exact:true}).waitFor();
        assert.equal(await nav.getByRole('link',{name:'Mi panel',exact:true}).getAttribute('href'),base+'/'+path);
        assert.equal(await nav.getByRole('link',{name:'El evento',exact:true}).count(),0);
        assert.equal(await nav.getByRole('link',{name:'Ingresar',exact:true}).count(),0);
      }
      const logout = page.waitForResponse(r => r.url().endsWith(api+'/logout'));
      await nav.getByRole('button',{name:'Salir',exact:true}).click(); assert.equal((await logout).status(),200);
      await page.waitForURL(root+base);
      await page.goto(root+base+'/acceso');
      await page.getByRole('heading',{name:'Ingresa a tu cuenta',exact:true}).waitFor(); await guest();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      assert.deepEqual(errors,[]);
      console.log(`OK ${eventId || 'original'} ${width}px: carga, invitado, cuatro roles y cierre de sesión`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
