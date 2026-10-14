// Run against a local build. All event APIs are mocked; no real records are changed.
// BAILE_TEST_URL=http://127.0.0.1:33220 PLAYWRIGHT_MODULE=/path/to/playwright node tests/baile-mobile.cjs
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.env.BAILE_TEST_URL || 'http://127.0.0.1:33220';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(root).hostname), 'Use a local test server');
const output = process.env.BAILE_SCREENSHOTS || '/tmp/baile-mobile-screenshots';
mkdirSync(output, { recursive: true });

function fixture(role) {
  const at = '2026-10-11T20:00:00Z';
  const participants = Array.from({ length: 11 }, (_, i) => ({ id: `p${i}`, name: `Participante ${i} Apellido de prueba`, document: `DEMO${i}`, birthDate: '2000-01-01', phone: '3053560953', email: 'prueba@example.test', city: 'Santa Marta', academy: 'Academia de prueba con nombre extenso', code: `PAR-${i}`, createdAt: at, extra: '' }));
  return {
    user: { id: 'staff', role, name: 'Pruebas' },
    settings: { name: 'Ritmo Caribe', tagline: 'Tu talento tiene escenario.', fullPassFee: 180000, demo: true, registrationOpen: true, categoryRegistrationOpen: true },
    participants,
    categories: [{ id: 'salsa', name: 'Salsa solista de prueba', modality: 'Solista', rhythm: 'Salsa', division: 'Abierta', active: true, fee: 60000, deadline: '' }],
    enrollments: [{ id: 'entry', participantId: 'p0', categoryId: 'salsa', code: 'INS-001', team: '', members: '', fee: 60000, createdAt: at, competitionNumber: 1, musicId: null, musicName: '' }],
    payments: [{ id: 'pass', participantId: 'p0', kind: 'fullpass', receiptId: 'receipt', status: 'approved', note: '', createdAt: at, date: '2026-10-11' }, { id: 'payment', participantId: 'p0', enrollmentId: 'entry', kind: 'category', receiptId: 'receipt', status: 'approved', note: '', createdAt: at, date: '2026-10-11' }],
    scores: [], schedule: [], judges: [], audit: [], notes: [], accreditations: [], exampleCreated: true,
  };
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  try {
    for (const role of ['superadmin', 'contractor']) {
      const context = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const data = fixture(role);
      let deleteAttempts = 0;
      await page.route('**/api/baile/**', async route => {
        const endpoint = new URL(route.request().url()).pathname;
        if (endpoint === '/api/baile/snapshot') return route.fulfill({ json: data });
        if (endpoint === '/api/baile/review') return route.fulfill({ json: { ok: true } });
        if (endpoint === '/api/baile/judge-delete') {
          deleteAttempts++;
          if (deleteAttempts % 2 === 1) return route.fulfill({ status: 409, json: { error: 'Prueba de error al eliminar' } });
          data.judges = data.judges.filter(judge => judge.id !== 'editable');
          return route.fulfill({ json: { ok: true } });
        }
        if (endpoint.includes('/files/')) return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64') });
        throw Error(`Unexpected API request: ${endpoint}`);
      });
      const panel = role === 'superadmin' ? 'admin' : 'contratista';
      async function fits(label) {
        const result = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
        assert.ok(result.scroll <= result.width + 1, `${role} ${label}: overflow ${JSON.stringify(result)}`);
      }
      for (const width of [320, 375, 430, 768, 1280]) {
        await page.setViewportSize({ width, height: 812 });
        await page.goto(`${root}/j2rankia/${panel}#registros`);
        await page.getByRole('heading', { name: 'Registro general' }).waitFor();
        await fits(`Registro ${width}`);
        assert.equal(await page.locator('.dance-card-table tbody tr').first().evaluate(el => getComputedStyle(el).display), width <= 750 ? 'grid' : 'table-row');
        await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
        assert.equal(await page.locator('.dance-card-table tbody tr').count(), 1);
        await page.getByRole('button', { name: 'Anterior', exact: true }).click();
        await page.getByRole('textbox', { name: 'Buscar registros' }).fill('DEMO0');
        assert.equal(await page.locator('.dance-card-table tbody tr').count(), 1);
        if (width === 375) await page.screenshot({ path: path.join(output, `${role}-registro.png`), fullPage: true });
        await page.getByRole('button', { name: 'Visualizar', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        const box = await dialog.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width + 1 && box.y >= 0 && box.height <= 812, 'Receipt fits viewport');
        await page.getByRole('button', { name: 'Cerrar comprobante' }).click();
        await page.getByRole('button', { name: /Cambiar estado de/ }).click();
        await page.getByRole('dialog').getByRole('combobox').selectOption('rejected');
        await page.getByLabel('Motivo del rechazo').fill('Prueba local');
        await fits(`Estado ${width}`);
        await page.getByRole('button', { name: 'Guardar estado', exact: true }).click();
        await page.waitForFunction(() => !document.querySelector('dialog[open]'));
        if (width <= 1050) await page.getByLabel('Sección del panel').selectOption('inscripciones');
        else await page.getByRole('navigation', { name: /Módulos/ }).getByRole(role === 'superadmin' ? 'link' : 'button', { name: /Inscripciones/ }).click();
        await page.getByRole('heading', { name: 'Inscripciones a categorías' }).waitFor();
        await fits(`Inscripciones ${width}`);
        if (width === 375) await page.screenshot({ path: path.join(output, `${role}-inscripciones.png`), fullPage: true });
        await page.getByRole('link', { name: /Ver ficha de/ }).click();
        await page.getByRole('heading', { name: 'Detalles de inscripción' }).waitFor();
        await fits(`Ficha ${width}`);
        if (role === 'superadmin') {
          await page.getByRole('button', { name: 'Editar datos', exact: true }).click();
          await page.getByRole('button', { name: 'Cambiar categoría', exact: true }).click();
          await page.getByText('Cargar música', { exact: true }).click();
          await fits(`Formulario ${width}`);
          if (width === 375) await page.screenshot({ path: path.join(output, `${role}-ficha.png`), fullPage: true });
        } else assert.equal(await page.getByRole('button', { name: 'Editar datos', exact: true }).count(), 0);
        console.log(`OK ${role}: ${width}px registro, filtros, paginación, visor, estado, navegación y ficha`);
      }
      if (role === 'superadmin') {
        data.categories.push({ ...data.categories[0], id: 'bachata', name: 'Bachata de prueba', rhythm: 'Bachata' });
        for (const width of [320, 1280]) {
          data.judges = [{ id: 'editable', role: 'judge', name: 'Jurado de prueba', email: 'jurado@example.test', categories: ['bachata'] }, { id: 'protected', role: 'judge', name: 'Jurado protegido', email: 'protegido@example.test', categories: ['salsa'] }];
          data.scores = [{ id: 'score', judgeId: 'protected', enrollmentId: 'entry', values: [8, 8, 8, 8, 8, 8], locked: true, submittedAt: '2026-10-11T20:00:00Z' }];
          await page.setViewportSize({ width, height: 812 });
          await page.goto(`${root}/j2rankia/admin#jurados`);
          await page.reload();
          await page.getByRole('button', { name: 'Visualizar a Jurado de prueba', exact: true }).waitFor();
          await fits(`Jurados ${width}`);
          assert.ok(await page.getByRole('button', { name: 'Eliminar a Jurado protegido', exact: true }).isDisabled());
          await page.getByRole('button', { name: 'Visualizar a Jurado de prueba', exact: true }).click();
          const dialog = page.getByRole('dialog');
          await dialog.waitFor();
          assert.ok(await dialog.getByText('jurado@example.test', { exact: true }).isVisible());
          await dialog.getByText('Editar datos y categorías del jurado', { exact: true }).click();
          const box = await dialog.boundingBox();
          assert.ok(box.x >= 0 && box.x + box.width <= width + 1 && box.height <= 812);
          if (width === 320) await page.screenshot({ path: path.join(output, 'jurado-ficha-mobile.png') });
          await page.getByRole('button', { name: 'Cerrar ficha de jurado' }).click();
          const remove = page.getByRole('button', { name: 'Eliminar a Jurado de prueba', exact: true });
          await remove.click();
          await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
          assert.equal(deleteAttempts, width === 320 ? 0 : 2);
          await remove.click();
          await page.getByRole('button', { name: 'Eliminar definitivamente', exact: true }).click();
          assert.equal(deleteAttempts, width === 320 ? 0 : 2, 'Confirmation required');
          await page.getByRole('checkbox', { name: 'Confirmo que deseo eliminar a este jurado.' }).check();
          await page.getByRole('button', { name: 'Eliminar definitivamente', exact: true }).click();
          await page.getByRole('dialog').getByRole('alert').waitFor();
          await page.getByRole('button', { name: 'Eliminar definitivamente', exact: true }).click();
          await page.waitForFunction(() => !document.querySelector('dialog[open]'));
          assert.equal(await remove.count(), 0);
          assert.ok(await page.getByRole('button', { name: 'Visualizar a Jurado protegido', exact: true }).isVisible());
          console.log(`OK jurados ${width}px: ficha, edición, bloqueo, cancelación, confirmación, error y eliminación`);
        }
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
