import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import XLSX from 'xlsx';

const rows = [['nombre', 'modalidad', 'categoria'], ['baby mixto abierto', 'solista', 'salsa'], ['principiante', 'pareja', 'salsa'], ['mixto abierto', 'pareja', 'urbano'], ['baby mixto abierto', 'grupo', 'bachata']];
const prices = [['precios modalidades', 'precio'], ['solista', 20000], ['pareja', 30000], ['grupo', 40000]];
function file(data = [...rows, [], ...prices], extra) {
  const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(data), 'Categorias');
  if (extra) XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(extra), 'Precios');
  return new File([XLSX.write(book, { bookType: 'xlsx', type: 'buffer' })], 'categorias.xlsx');
}
test('Excel y calificación personalizada por evento, jurados automáticos e historia', { timeout: 120000 }, async t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'baile-config-'));
  const root = 'http://127.0.0.1:33471', env = { ...process.env, BAILE_DATA_DIR: dir, NODE_ENV: 'production' };
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '33471'], { env, stdio: 'ignore' });
  t.after(() => server.kill('SIGTERM'));
  let ready = false;
  for (let i = 0; i < 100; i++) { try { if ((await fetch(root + '/api/baile/public')).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
  assert.ok(ready);
  const credentials = JSON.parse(execFileSync(process.execPath, ['scripts/baile-admin.cjs'], { env, encoding: 'utf8' }));
  function client(event = 'thesunfest') {
    let cookie = ''; const api = root + '/api/baile' + (event ? '/eventos/' + event : '');
    return {
      async post(action, fields = {}, status = 200) {
        const data = new FormData(); for (const [k, v] of Object.entries(fields)) data.append(k, v);
        const r = await fetch(api + '/' + action, { method: 'POST', headers: { origin: root, cookie }, body: data });
        const result = await r.json(); assert.equal(r.status, status, `${action}: ${JSON.stringify(result)}`);
        if (r.headers.get('set-cookie')) cookie = r.headers.get('set-cookie').split(';')[0]; return result;
      },
      async get(action = 'snapshot') { const r = await fetch(api + '/' + action, { headers: { cookie } }); assert.equal(r.status, 200); return r.json(); },
    };
  }
  const original = client(''), admin = client(), guest = client();
  await original.post('login', credentials); const before = await original.get();
  await admin.post('login', credentials);
  await t.test('vista previa sin mutar, precios en la misma hoja y separados', async () => {
    const before = await admin.get();
    await guest.post('categories-preview', { file: file() }, 401);
    const preview = await admin.post('categories-preview', { file: file() });
    assert.deepEqual(preview.categories.map(c => c.fee), ['20000', '30000', '30000', '40000']);
    assert.deepEqual(preview.categories.map(c => c.modality), ['Solista', 'Pareja', 'Pareja', 'Grupo']);
    assert.deepEqual((await admin.post('categories-preview', { file: file(rows, prices) })).categories, preview.categories);
    assert.deepEqual(await admin.get(), before);
    await admin.post('categories-import', { file: file() }, 400);
    await admin.post('categories-preview', { file: file(rows) }, 400);
    await admin.post('categories-preview', { file: file([...rows, rows[1], ...prices]) }, 400);
    await admin.post('categories-preview', { file: file([['nombre', 'modalidad', 'categoria', 'precio'], ['Formula', 'solista', 'salsa', { t: 'n', v: 20000, f: '10000*2' }]]) }, 400);
    await admin.post('categories-preview', { file: new File(['not an excel'], 'bad.xlsx') }, 400);
    assert.deepEqual(await admin.get(), before);
  });
  await t.test('importación idempotente y atómica, jurados presentes y futuros', async () => {
    await admin.post('judge', { id: '', name: 'Jurado inicial', email: 'judge@example.test', password: 'judge-password-123' });
    let s = await admin.get(); assert.equal(s.judges[0].categories.length, s.categories.length);
    const first = await admin.post('categories-import', { file: file(), confirm: 'import' }); assert.equal(first.added, 4);
    s = await admin.get(); assert.equal(s.judges[0].categories.length, s.categories.length);
    const again = await admin.post('categories-import', { file: file(), confirm: 'import' }); assert.equal(again.added, 0); assert.equal(again.skipped, 4);
    const conflict = [...rows, ['Nueva que no debe guardarse', 'solista', 'salsa'], [], ...prices.map((r, i) => i === 1 ? ['solista', 99999] : r)];
    await admin.post('categories-import', { file: file(conflict), confirm: 'import' }, 409);
    assert.deepEqual(await admin.get(), s);
    await admin.post('judge', { id: '', name: 'Segundo jurado', email: 'second@example.test', password: 'judge-password-123', categories: 'ignored' });
    s = await admin.get(); assert.ok(s.judges.every(j => j.categories.length === s.categories.length));
  });
  const criteria = [{ name: 'Técnica personal', weight: 70 }, { name: 'Expresión', weight: 30 }];
  await t.test('criterios y pesos válidos, modelos restaurables y aislamiento', async () => {
    for (const value of [[], [{ name: 'A', weight: 90 }], [{ name: 'A', weight: 100 }, { name: 'a', weight: 0 }], [{ name: 'A', weight: 50 }, { name: 'a', weight: 50 }], [{ name: 'A', weight: -2 }, { name: 'B', weight: 102 }]]) await admin.post('scoring-settings', { model: 'custom-v1', criteria: JSON.stringify(value) }, 400);
    await guest.post('scoring-settings', { model: 'average', criteria: 'null' }, 401);
    await admin.post('scoring-settings', { model: 'custom-v1', criteria: JSON.stringify(criteria) });
    assert.deepEqual((await admin.get()).settings.criteria, criteria);
    await admin.post('scoring-settings', { model: 'average', criteria: 'null' });
    assert.equal((await admin.get()).settings.scoringScheme, undefined, 'Sun Fest no reaplica su preset después de editarlo');
    assert.equal((await admin.get()).settings.criteria, undefined);
    await admin.post('scoring-settings', { model: 'custom-v1', criteria: JSON.stringify(criteria) });
    assert.deepEqual(await original.get(), before);
  });
  await t.test('notas con criterios propios; jurados nuevos no alteran categorías iniciadas', async () => {
    const { access } = await admin.post('example');
    let s = await admin.get(); const entry = s.enrollments[0];
    const dancer = client(); await dancer.post('login', access[0]);
    await dancer.post('music', { enrollmentId: entry.id, file: new File([Buffer.from('RIFF0000WAVE000000000000')], 'ejemplo.wav', { type: 'audio/wav' }) });
    const judge = client(); await judge.post('login', { email: 'judge@example.test', password: 'judge-password-123' });
    await judge.post('categories-import', { file: file(), confirm: 'import' }, 403);
    await judge.post('scoring-settings', { model: 'average', criteria: 'null' }, 403);
    await judge.post('score', { enrollmentId: entry.id, values: JSON.stringify([8, 9, 7]) }, 400);
    await judge.post('score', { enrollmentId: entry.id, values: JSON.stringify([8, 9]) });
    await admin.post('scoring-settings', { model: 'average', criteria: 'null' }, 409);
    s = await admin.get(); const panel = s.judges.filter(j => j.categories.includes(entry.categoryId)).map(j => j.id);
    await admin.post('judge', { id: '', name: 'Jurado tardío', email: 'late@example.test', password: 'judge-password-123' });
    s = await admin.get(); assert.deepEqual(s.judges.filter(j => j.categories.includes(entry.categoryId)).map(j => j.id), panel);
    assert.equal(s.judges.find(j => j.email === 'late@example.test').categories.length, s.categories.length - 1);
    assert.deepEqual(s.scores[0].values, [8, 9]);
    for (const credentials of [{email: 'second@example.test', password: 'judge-password-123'}, ...access.slice(2)]) {
      const other = client(); await other.post('login', credentials);
      await other.post('score', { enrollmentId: entry.id, values: JSON.stringify([8, 9]) });
    }
    await admin.post('schedule', {id:'',categoryId:entry.categoryId,startAt:'2099-01-01T18:00:00-05:00',duration:'15',stage:'Principal',status:'planned',note:''});
    const slot = (await admin.get()).schedule[0];
    await admin.post('schedule', {...slot,status:'live'}); await admin.post('schedule', {...slot,status:'finished'});
    const results = await guest.get('results');
    assert.equal(results.scoringScheme, 'custom-v1');
    assert.equal(results.categories[0].rows[0].value, 8.3);
    assert.deepEqual(results.categories[0].rows[0].breakdown.criteria, criteria);
    assert.ok(Math.abs(results.categories[0].rows[0].breakdown.contributions.reduce((a, b) => a + b, 0) - 8.3) < 1e-9);
    assert.equal(results.categories[0].rows[0].position, 1);
    assert.deepEqual(s.settings.criteria, criteria);
    assert.deepEqual(await original.get(), before);
  });
});
