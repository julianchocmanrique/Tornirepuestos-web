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
      await page.getByRole('button', { name: 'Siguiente', exact: true }).waitFor();
      await fits(`registration ${width}`);
      assert.match(await page.locator('.registration-heading').innerText(), /Caribe Salsa Festival/i);
      await page.screenshot({ path: `${output}/registration-${width}.png`, fullPage: true });
      console.log(`OK carousel, landing and registration ${width}px`);
    }
    await page.setViewportSize({ width: 375, height: 812 });
    const email = `browser-${Date.now()}@example.test`;
    for (const id of ['encuentro-salsa','encuentro-bachata']) {
      await page.goto(root + '/prueba-baile/eventos/' + id + '/registro');
      for (const [name,value] of Object.entries({ firstName: 'Persona', lastName: 'Prueba', birthDate: '2000-01-01', city: 'Santa Marta', phone: '3000000000', email })) await page.locator('[name="' + name + '"]').fill(value);
      await page.locator('[name="sex"]').selectOption('Otro');
      await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
      await page.locator('[name="salsa"]').selectOption('Amateur');
      await page.locator('[name="bachata"]').selectOption('Amateur');
      await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
      for (const [name,value] of Object.entries({ document: 'BROWSER12345', documentConfirm: 'BROWSER12345', password: 'BrowserPrueba1234', passwordConfirm: 'BrowserPrueba1234' })) await page.locator('[name="' + name + '"]').fill(value);
      await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
      const pad = page.locator('.registration-signature svg'); await pad.scrollIntoViewIfNeeded();
      const rect = await pad.boundingBox();
      await page.mouse.move(rect.x + 15, rect.y + 35); await page.mouse.down();
      await page.mouse.move(rect.x + 60, rect.y + 70, { steps: 12 });
      await page.mouse.move(rect.x + 130, rect.y + 35, { steps: 12 }); await page.mouse.up();
      await page.locator('[name="waiverAccepted"]').check(); await page.locator('[name="consent"]').check();
      await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
      const file = { name: 'prueba.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==','base64') };
      await page.locator('[name="receipt"]').setInputFiles(file); await page.locator('[name="photo"]').setInputFiles(file);
      await page.locator('[name="reference"]').fill('BROWSER-TEST');
      const request = page.waitForResponse(r => r.url().endsWith(`/api/baile/eventos/${id}/register`) && r.request().method() === 'POST');
      await page.getByRole('button', { name: 'Enviar registro', exact: true }).click();
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
