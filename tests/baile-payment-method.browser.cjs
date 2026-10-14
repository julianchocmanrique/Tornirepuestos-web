const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33234';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(root).hostname));

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  try {
    for (const width of [375, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 950 } });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      const data = { user: { id: 'organizer', role: 'contractor', name: 'Organizador' }, settings: { name: 'Evento de prueba', demo: true, fullPassFee: 70000, paymentInstructions: 'Solo comprobantes ficticios.', paymentMethod: null }, participants: [], payments: [], categories: [], enrollments: [], scores: [], judges: [], audit: [], accreditations: [], notes: [], schedule: [], events: [], exampleCreated: true };
      let saved = 0;
      await page.route('**/api/baile/**', async route => {
        const action = new URL(route.request().url()).pathname.split('/').pop();
        if (action === 'snapshot') return route.fulfill({ json: data });
        assert.equal(action, 'payment-settings');
        const request = route.request();
        const body = await new Response(request.postDataBuffer(), { headers: { 'Content-Type': request.headers()['content-type'] } }).formData();
        data.settings.paymentMethod = JSON.parse(body.get('paymentMethod'));
        data.settings.paymentInstructions = body.get('paymentInstructions'); saved++;
        return route.fulfill({ json: { ok: true } });
      });
      await page.goto(root + '/j2rankia/contratista#medios-de-pago');
      await page.getByLabel('Tipo de medio de pago').selectOption('Llave');
      await page.getByLabel('Titular o beneficiario').fill('Organizador ficticio');
      await page.getByLabel('Llave de pago', { exact: true }).fill('@LLAVE-PRUEBA');
      const refreshed = page.waitForResponse(r => r.url().endsWith('/snapshot'));
      await page.getByRole('button', { name: /Guardar medio de pago/ }).click();
      await refreshed;
      assert.equal(saved, 1);
      await page.reload();
      assert.equal(await page.getByLabel('Llave de pago', { exact: true }).inputValue(), '@LLAVE-PRUEBA');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: `/tmp/baile-payment-settings-${width}.png`, fullPage: true });
      data.user = { id: 'admin', name: 'Admin', role: 'superadmin' };
      await page.goto(root + '/j2rankia/admin#ajustes');
      assert.equal(await page.getByLabel('Llave de pago', { exact: true }).inputValue(), '@LLAVE-PRUEBA');
      data.user = { id: 'participant', name: 'Participante', role: 'participant' };
      data.participants = [{ id: 'participant', name: 'Participante Demo', code: 'PAR-001', createdAt: '2026-10-10T12:00:00Z' }];
      await page.goto(root + '/j2rankia/participante');
      await page.getByText('@LLAVE-PRUEBA', { exact: true }).waitFor();
      assert.equal(await page.getByLabel('Tipo de medio de pago').count(), 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      await page.close(); console.log(`Medio compartido, recarga y consulta del participante: ${width}px OK`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
