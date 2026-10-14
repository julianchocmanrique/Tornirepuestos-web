const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33234';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(root).hostname));
const notes = [[7.50, 7.52, 7.52, 7.67, 7.48], [8.06, 8.01, 8.01, 8.03, 8.00], [7.56, 8.05, 7.96, 8.01, 8.05]];
const weights = [25, 15, 20, 30, 10];
const criteria = ['Técnica', 'Musicalidad', 'Coreografía y dificultad', 'Tiempo', 'Presencia escénica y proyección'].map((name, i) => ({ name, weight: weights[i] }));
const breakdown = {
  mode: 'weighted', criteria,
  judges: ['ADRIANITA AVILA', 'KIKE ALAR', 'LAURA'].map((name, i) => ({ name, values: notes[i], total: notes[i].reduce((sum, v, n) => sum + v * weights[n] / 100, 0) })),
  contributions: weights.map((w, i) => notes.reduce((sum, values) => sum + values[i], 0) / 3 * w / 100),
};
const data = { scoringScheme: 'sunfest-v1', formula: 'average', categories: [{ id: 'demo', name: '2. Salsa Solista Infantil Masculino', rows: [{ name: 'Dylan Agudelo', number: 1, position: 1, value: breakdown.contributions.reduce((a, b) => a + b, 0), breakdown }] }] };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  try {
    for (const width of [375, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 950 } });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/baile/results', route => route.fulfill({ json: data }));
      await page.goto(root + '/j2rankia/resultados');
      const trigger = page.getByRole('button', { name: 'Ver detalle de Dylan Agudelo' });
      await trigger.click();
      const modal = page.getByRole('dialog');
      await modal.getByRole('heading', { name: 'Dylan Agudelo' }).waitFor();
      assert.equal(await modal.locator('.dance-result-score strong').innerText(), '7.83');
      assert.deepEqual(await modal.locator('tbody tr td:last-child').allTextContents(), ['7.56', '8.03', '7.90']);
      assert.deepEqual(await modal.locator('tfoot td').allTextContents(), ['1.93', '1.18', '1.57', '2.37', '0.78', '7.83']);
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const box = await modal.boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= width);
      const table = modal.getByRole('region', { name: 'Desglose de calificaciones' });
      if (width < 600) assert.ok(await table.evaluate(el => el.scrollWidth > el.clientWidth));
      await page.screenshot({ path: `/tmp/baile-result-modal-${width}.png`, fullPage: true });
      await page.keyboard.press('Escape');
      assert.equal(await modal.count(), 0);
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-haspopup') === 'dialog');
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
      await trigger.click(); await page.getByRole('button', { name: 'Cerrar resultado' }).click();
      assert.equal(await modal.count(), 0);
      await trigger.click(); await page.mouse.click(2, 2);
      assert.equal(await modal.count(), 0);
      assert.deepEqual(errors, []); await page.close();
      console.log(`Modal público, referencia 7.83, X/Escape/fondo y móvil: ${width}px OK`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
