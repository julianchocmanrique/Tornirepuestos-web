const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33227';

// All event API calls use fixtures, including when checking the published UI.
const snapshot = {
  user: { id: 'test-admin', name: 'Prueba', role: 'superadmin' },
  settings: { name: 'Evento de prueba', demo: false, fullPassFee: 180000 },
  participants: [], payments: [], categories: [], enrollments: [], scores: [],
  judges: [], audit: [], accreditations: [], notes: [], schedule: [], exampleCreated: true,
};

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  try {
    for (const width of [375, 1280]) for (const event of ['', '/eventos/thesunfest']) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/baile/**', route => {
        assert.equal(route.request().method(), 'GET');
        assert.ok(new URL(route.request().url()).pathname.endsWith('/snapshot'));
        return route.fulfill({ json: snapshot });
      });
      await page.goto(`${root}/prueba-baile${event}/admin#acreditacion`);
      await page.getByRole('heading', { name: 'Tu evento, bajo control.', exact: true }).waitFor();
      await page.waitForURL('**#resumen');
      const nav = page.locator('nav[aria-label="Módulos administrativos"]');
      assert.equal(await nav.locator('a[href="#acreditacion"]').count(), 0);
      assert.equal(await page.locator('option[value="acreditacion"]').count(), 0);
      assert.equal(await nav.locator('a').count(), 11);
      if (width < 768) await page.getByLabel('Sección del panel').selectOption('inscripciones');
      else await nav.getByRole('link', { name: /Inscripciones/ }).click();
      await page.getByRole('heading', { name: 'Inscripciones', exact: true }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      console.log(`OK ${event || 'original'} ${width}px: menú sin Acreditación, enlace antiguo y navegación`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
