const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33234';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(root).hostname));

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  try {
    for (const width of [375, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 950 } });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      const data = {
        settings: { name: 'Prueba', demo: true, scoringScheme: 'sunfest-v1', formula: 'average' },
        user: { id: 'judge-1', name: 'Jurado Demo', role: 'judge' },
        categories: Array.from({ length: 46 }, (_, i) => ({ id: `cat-${i+1}`, name: `${i+1}. Categoria`, modality: 'Solista', rhythm: 'Salsa', division: 'Amateur', active: false })),
        participants: [{ id: 'person', name: 'Persona Demo' }],
        enrollments: [{ id: 'entry', categoryId: 'cat-13', participantId: 'person', competitionNumber: 1 }],
        judges: [1,2,3].map(i => ({ id: `judge-${i}`, name: `Jurado ${i}`, categories: ['cat-13'] })),
        scores: [1,2,3].map(i => ({ id: `score-${i}`, enrollmentId: 'entry', judgeId: `judge-${i}`, values: [8,8,8,8,8], locked: true, submittedAt: '2026-10-13T12:00:00Z' })),
        payments: [{ participantId: 'person', kind: 'fullpass', status: 'approved' }, { enrollmentId: 'entry', kind: 'category', status: 'approved' }],
        schedule: [{ categoryId: 'cat-13', status: 'finished' }], audit: [], accreditations: [], notes: [], events: [],
      };
      await page.route('**/api/baile/snapshot', route => route.fulfill({ json: data.user.role === 'judge' ? { ...data, scores: data.scores.filter(s => s.judgeId === data.user.id) } : data }));
      await page.goto(root + '/j2rankia/jurado');
      await page.getByText('Enviada y bloqueada', { exact: true }).waitFor();
      assert.match(await page.getByRole('tab', { selected: true }).innerText(), /^13\./);
      assert.match(await page.locator('.dance-score-total').innerText(), /8\.00/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      data.user = { id: 'admin', role: 'superadmin', name: 'Organizacion' };
      await page.goto(root + '/j2rankia/admin#resultados');
      await page.getByText('Definitivo', { exact: true }).waitFor();
      assert.equal(await page.getByLabel('Categoría de resultados').inputValue(), 'cat-13');
      await page.getByText('Detalle por criterio · Competidor 001', { exact: true }).click();
      await page.getByText('Promedio ponderado', { exact: true }).last().waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Categoria con participantes seleccionada: jurado y resultados, ${width}px`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
