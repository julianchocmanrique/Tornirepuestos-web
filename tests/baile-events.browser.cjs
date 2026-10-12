// Local production build only; isolated BAILE_DATA_DIR required on the test server.
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33220';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(root).hostname));
const output = '/tmp/baile-events-screenshots'; mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    async function fits(label) {
      const size = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
      assert.ok(size.page <= size.viewport + 1, `${label}: ${JSON.stringify(size)}`);
    }
    for (const width of [320,375,768,1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(root + '/prueba-baile');
      await page.locator('.event-cover-card[data-position="active"]').waitFor();
      await fits(`home ${width}`);
      await page.screenshot({ path: `${output}/home-${width}.png`, fullPage: false });
      const initial = await page.locator('.event-cover-card[data-position="active"]').getAttribute('href');
      await page.getByRole('button', { name: 'Evento siguiente', exact: true }).click();
      const target = await page.locator('.event-cover-card[data-position="active"]').getAttribute('href');
      assert.notEqual(initial, target);
      await page.locator('.event-cover-card[data-position="active"]').focus();
      await page.keyboard.press('ArrowLeft');
      assert.equal(await page.locator('.event-cover-card[data-position="active"]').getAttribute('href'), initial);
      await page.locator('.event-feature-info').getByRole('link', { name: 'Conocer el evento' }).click();
      await page.waitForURL(root + initial); await fits(`landing ${width}`);
      await page.screenshot({ path: `${output}/landing-${width}.png`, fullPage: true });
      await page.locator('.event-page-header').getByRole('link', { name: 'Registrarse' }).click();
      await page.waitForURL(root + initial + '/registro');
      await page.getByRole('button', { name: 'Crear mi registro', exact: true }).waitFor();
      await fits(`registration ${width}`);
      assert.match(await page.locator('h1').innerText(), /Caribe Salsa Festival/);
      await page.screenshot({ path: `${output}/registration-${width}.png`, fullPage: true });
      console.log(`OK carousel, landing and registration ${width}px`);
    }
    await page.setViewportSize({ width: 375, height: 812 });
    const email = `browser-${Date.now()}@example.test`;
    for (const id of ['encuentro-salsa','encuentro-bachata']) {
      await page.goto(root + '/prueba-baile/eventos/' + id + '/registro');
      for (const [name,value] of Object.entries({ name: 'Persona de prueba', document: 'BROWSER12345', birthDate: '2000-01-01', city: 'Santa Marta', phone: '3000000000', email, password: 'BrowserPrueba1234' })) await page.locator(`[name="${name}"]`).fill(value);
      await page.locator('[name="consent"]').check();
      const request = page.waitForResponse(r => r.url().endsWith(`/api/baile/eventos/${id}/register`) && r.request().method() === 'POST');
      await page.getByRole('button', { name: 'Crear mi registro', exact: true }).click();
      assert.equal((await request).status(), 201);
      await page.waitForURL(root + '/prueba-baile/eventos/' + id + '/participante');
      await page.getByRole('heading', { name: 'Tu Full Pass', exact: true }).waitFor();
      await fits('participant ' + id);
    }
    const cookies = await context.cookies();
    assert.ok(cookies.some(c => c.name === 'baile_session_encuentro-salsa'));
    assert.ok(cookies.some(c => c.name === 'baile_session_encuentro-bachata'));
    await page.goto(root + '/prueba-baile/eventos/encuentro-salsa/participante');
    await page.getByRole('heading', { name: 'Tu Full Pass', exact: true }).waitFor();
    assert.deepEqual(errors, []); console.log('OK same-browser independent registration and persistent sessions; no browser errors');
    await context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
