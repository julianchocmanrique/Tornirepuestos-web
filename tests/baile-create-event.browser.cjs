const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33230';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(root).hostname));

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  try {
    for (const width of [320, 375, 768, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      const data = { user: { id: 'admin', role: 'superadmin', name: 'Prueba' }, settings: { name: 'RANKIA', demo: true, fullPassFee: 70000 }, participants: [], payments: [], categories: [], enrollments: [], scores: [], judges: [], audit: [], accreditations: [], notes: [], schedule: [], events: [], exampleCreated: true };
      let payload = null;
      await page.route('**/api/baile/**', async route => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith('/snapshot')) return route.fulfill({ json: data });
        assert.ok(url.pathname.endsWith('/create-event'));
        payload = route.request().postData();
        data.events = [{ id: 'evento-nuevo', name: 'Evento nuevo', date: '2099-11-10', city: 'Santa Marta', demo: true }];
        return route.fulfill({ status: 201, json: { ok: true, eventId: 'evento-nuevo', eventUrl: '/prueba-baile/eventos/evento-nuevo' } });
      });
      await page.goto(root + '/prueba-baile/admin#crear-evento');
      await page.getByRole('heading', { name: 'Evento', exact: true }).waitFor();
      async function fits() { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); }
      async function next(title) { await fits(); await page.getByRole('button', { name: 'Continuar', exact: true }).click(); await page.getByRole('heading', { name: title, exact: true }).waitFor(); }
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      assert.equal(await page.getByRole('heading', { name: 'Evento', exact: true }).count(), 1);
      for (const [label,value] of Object.entries({ 'Nombre del evento': 'Evento nuevo', 'Identificador del enlace': 'evento-nuevo', 'Ritmos o disciplinas': 'Salsa', 'Frase del evento': 'Tu talento en el podio', 'Resumen para la página de inicio': 'Un encuentro independiente para bailar y competir.' })) await page.getByLabel(label, {exact:true}).fill(value);
      await next('Fecha y portada');
      await page.getByLabel('Fecha inicial', {exact:true}).fill('2099-11-10'); await page.getByLabel('Fecha final', {exact:true}).fill('2099-11-11');
      await page.getByLabel('Ciudad', {exact:true}).fill('Santa Marta'); await page.getByLabel('Sede y dirección', {exact:true}).fill('Teatro de prueba');
      await page.getByRole('button', {name:'Anterior',exact:true}).click();
      assert.equal(await page.getByLabel('Nombre del evento',{exact:true}).inputValue(), 'Evento nuevo');
      await next('Fecha y portada');
      assert.equal(await page.getByLabel('Sede y dirección',{exact:true}).inputValue(), 'Teatro de prueba');
      await next('Pases y pagos');
      await page.getByLabel('Precio del pase 1 (COP)', {exact:true}).fill('70000');
      await page.getByLabel('Instrucciones y medios de pago', {exact:true}).fill('Solo comprobantes ficticios. No pagar.');
      await next('Categorías');
      await page.getByLabel('Nombre de categoría 1', {exact:true}).fill('Salsa solista');
      await page.getByLabel('Ritmo o disciplina 1', {exact:true}).fill('Salsa');
      await page.getByLabel('Tarifa de categoría 1 (COP)', {exact:true}).fill('80000');
      await next('Calificación');
      await page.getByRole('combobox', {name: /Sistema de calificación/}).selectOption('sunfest-v1');
      assert.equal(await page.getByText('25%', {exact:true}).count(), 1);
      await next('Equipo');
      await page.getByLabel('Crear acceso para el contratista', {exact:true}).check();
      await page.getByLabel('Nombre del contratista', {exact:true}).fill('Organizador de prueba');
      await page.getByLabel('Correo del contratista', {exact:true}).fill('prueba@example.test');
      await page.getByLabel('Contraseña del contratista', {exact:true}).fill('Prueba-segura-123');
      await page.getByRole('button', {name:'Añadir jurado',exact:true}).click();
      await page.getByLabel('Nombre del jurado 1', {exact:true}).fill('Jurado de prueba');
      await page.getByLabel('Correo del jurado 1', {exact:true}).fill('jurado@example.test');
      await page.getByLabel('Contraseña del jurado 1', {exact:true}).fill('Jurado-seguro-123');
      await page.getByLabel('Jurado 1: Salsa solista', {exact:true}).check();
      await next('Revisar'); await fits();
      assert.equal(payload, null);
      assert.ok(await page.getByRole('button', {name:'Crear y publicar evento',exact:true}).isDisabled());
      await page.screenshot({ path: `/tmp/baile-create-event-${width}.png`, fullPage: true });
      await page.getByLabel('He revisado los datos y quiero crear y publicar este evento.', {exact:true}).check();
      await page.getByRole('button', {name:'Crear y publicar evento',exact:true}).click();
      await page.getByRole('heading', {name:'Evento nuevo ya tiene su espacio',exact:true}).waitFor();
      assert.ok(payload.includes('sunfest-v1') && payload.includes('Prueba-segura-123'));
      assert.deepEqual(errors, []); await fits();
      console.log(`OK ${width}px: siete pasos, validaciones, volver sin perder datos, revisión y creación`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
