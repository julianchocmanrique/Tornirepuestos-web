import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

const moduleUrl = text => 'data:text/javascript;base64,' + Buffer.from(text).toString('base64');
const compile = name => ts.transpileModule(readFileSync(`src/lib/baile/${name}.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const typesUrl = moduleUrl(compile('types'));
const { SUNFEST_CRITERIA, weightedScore } = await import(typesUrl);
const { ranking, resultBreakdown } = await import(moduleUrl(compile('results').replace('from "./types"', `from "${typesUrl}"`)));
const notes = [[7.50, 7.52, 7.52, 7.67, 7.48], [8.06, 8.01, 8.01, 8.03, 8.00], [7.56, 8.05, 7.96, 8.01, 8.05]];

test('cinco pesos y totales de la referencia, sin redondeos intermedios', () => {
  assert.deepEqual(SUNFEST_CRITERIA.map(c => c.weight), [25, 15, 20, 30, 10]);
  assert.equal(SUNFEST_CRITERIA.reduce((sum, c) => sum + c.weight, 0), 100);
  assert.deepEqual(notes.map(v => weightedScore(v).toFixed(2)), ['7.56', '8.03', '7.90']);
  assert.equal((notes.reduce((sum, v) => sum + weightedScore(v), 0) / 3).toFixed(2), '7.83');
  assert.equal(weightedScore([10, 10, 10, 10, 10]), 10);
  assert.equal(weightedScore([1, 1, 1, 1, 1]), 1);
});

test('desglose público: ponderaciones, fórmulas anteriores y notas privadas', () => {
  const s = {
    settings: { scoringScheme: 'sunfest-v1', formula: 'average' },
    judges: notes.map((_, i) => ({ id: `j${i}`, name: `Jurado ${i}`, email: 'privado@example.test', passwordHash: 'secreto', categories: ['cat'] })),
    scores: notes.map((values, i) => ({ judgeId: `j${i}`, enrollmentId: 'entry', values, locked: true })),
  };
  const detail = resultBreakdown(s, 'cat', 'entry');
  assert.equal(detail.mode, 'weighted');
  assert.deepEqual(detail.judges.map(j => j.total.toFixed(2)), ['7.56', '8.03', '7.90']);
  assert.deepEqual(detail.contributions.map(v => v.toFixed(2)), ['1.93', '1.18', '1.57', '2.37', '0.78']);
  assert.equal(detail.contributions.reduce((a, b) => a + b, 0).toFixed(2), '7.83');
  for (const judge of detail.judges) assert.deepEqual(Object.keys(judge).sort(), ['name', 'total', 'values']);
  s.scores[0].locked = false;
  assert.equal(resultBreakdown(s, 'cat', 'entry'), null, 'No incluye borradores ni publica desgloses incompletos');
  assert.equal(resultBreakdown(s, 'otra-categoria', 'entry'), null);
  s.scores[0].locked = true;
  s.settings = { formula: 'average' };
  s.scores.forEach(score => { score.values = [8, 8, 8, 8, 8, 8]; });
  let legacy = resultBreakdown(s, 'cat', 'entry');
  assert.equal(legacy.mode, 'average');
  assert.deepEqual(legacy.judges.map(j => j.total), [8, 8, 8]);
  assert.equal(legacy.contributions.reduce((a, b) => a + b, 0).toFixed(2), '8.00');
  s.settings.formula = 'sum';
  legacy = resultBreakdown(s, 'cat', 'entry');
  assert.deepEqual(legacy.judges.map(j => j.total), [48, 48, 48]);
  assert.equal(legacy.contributions.reduce((a, b) => a + b, 0), 144);
});

test('Sun Fest: valida cinco notas, conserva historia y publica el promedio ponderado', { timeout: 90000 }, async t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'sunfest-scoring-'));
  const root = 'http://127.0.0.1:33228', env = { ...process.env, BAILE_DATA_DIR: dir, NODE_ENV: 'production' };
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '33228'], { env, stdio: 'ignore' });
  t.after(() => server.kill('SIGTERM'));
  let ready = false;
  for (let i = 0; i < 100; i++) { try { if ((await fetch(root + '/api/baile/public')).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
  assert.ok(ready);
  const credentials = JSON.parse(execFileSync(process.execPath, ['scripts/baile-admin.cjs'], { env, encoding: 'utf8' }));
  function client(event = 'thesunfest') {
    let cookie = ''; const api = root + '/api/baile' + (event ? '/eventos/' + event : '');
    return {
      async post(action, fields = {}, status = 200) {
        const f = new FormData(); for (const [k, v] of Object.entries(fields)) f.append(k, v);
        const r = await fetch(api + '/' + action, { method: 'POST', headers: { origin: root, cookie }, body: f });
        const data = await r.json(); assert.equal(r.status, status, `${action}: ${JSON.stringify(data)}`);
        if (r.headers.get('set-cookie')) cookie = r.headers.get('set-cookie').split(';')[0]; return data;
      },
      async get(action) { const r = await fetch(api + '/' + action, { headers: { cookie } }); assert.equal(r.status, 200); return r.json(); },
    };
  }
  const original = client(''), admin = client(), guest = client();
  await original.post('login', credentials); const before = await original.get('snapshot');
  await admin.post('login', credentials);
  const initial = await admin.get('snapshot'); assert.equal(initial.settings.scoringScheme, 'sunfest-v1');
  await admin.post('settings', { ...initial.settings, formula: 'sum', registrationOpen: 'on', categoryRegistrationOpen: 'on' }, 400);
  const { access } = await admin.post('example');
  const entry = (await admin.get('snapshot')).enrollments[0];
  const dancer = client(); await dancer.post('login', { email: access[0].email, password: access[0].password });
  await dancer.post('music', { enrollmentId: entry.id, file: new File([Buffer.from('RIFF0000WAVE000000000000')], 'ejemplo.wav', { type: 'audio/wav' }) });
  const judges = [];
  for (let i = 0; i < 3; i++) {
    const judge = client(); judges.push(judge); await judge.post('login', { email: access[i + 2].email, password: access[i + 2].password });
    await judge.post('score', { enrollmentId: entry.id, values: JSON.stringify([8, 8, 8, 8, 8, 8]) }, 400);
    await judge.post('score', { enrollmentId: entry.id, values: JSON.stringify([8, 8, 8, 8]) }, 400);
    for (const invalid of [0, 11, -1, 10.01, 0.99, 8.123, null, '8']) await judge.post('score', { enrollmentId: entry.id, values: JSON.stringify([invalid, 8, 8, 8, 8]) }, 400);
    await judge.post('score', { enrollmentId: entry.id, values: JSON.stringify(notes[i]) });
    await judge.post('score', { enrollmentId: entry.id, values: JSON.stringify(notes[i]) }, 409);
    const own = await judge.get('snapshot'); assert.equal(own.scores.length, 1); assert.deepEqual(own.scores[0].values, notes[i]);
    const s = await admin.get('snapshot'), row = ranking(s, entry.categoryId)[0];
    assert.equal(row.complete, i === 2); assert.equal(row.position, i === 2 ? 1 : null);
    if (i === 2) assert.equal(row.value.toFixed(2), '7.83');
    assert.equal((await guest.get('results')).categories.length, 0);
  }
  const beforeUnlock = await admin.get('snapshot');
  await admin.post('unlock', { scoreId: beforeUnlock.scores[0].id, note: 'Prueba de corrección' });
  assert.equal(ranking(await admin.get('snapshot'), entry.categoryId)[0].complete, false);
  const beforeInvalidEdit = await admin.get('snapshot');
  for (const invalid of [0, 11, 7.555]) {
    await judges[0].post('score', { enrollmentId: entry.id, values: JSON.stringify([invalid, 8, 8, 8, 8]) }, 400);
    assert.deepEqual((await admin.get('snapshot')).scores, beforeInvalidEdit.scores, 'La edición inválida no cambia ni vuelve a bloquear las notas');
  }
  await judges[0].post('score', { enrollmentId: entry.id, values: JSON.stringify(notes[0]) });
  await admin.post('schedule', { id: '', categoryId: entry.categoryId, startAt: '2027-01-10T18:00:00-05:00', duration: '15', stage: 'Principal', status: 'planned', note: '' });
  const slot = (await admin.get('snapshot')).schedule[0];
  await admin.post('schedule', { ...slot, status: 'live' }); await admin.post('schedule', { ...slot, status: 'finished' });
  const published = await guest.get('results'); assert.equal(published.scoringScheme, 'sunfest-v1');
  assert.equal(published.categories[0].rows[0].value.toFixed(2), '7.83');
  assert.deepEqual(Object.keys(published.categories[0].rows[0]).sort(), ['breakdown', 'name', 'number', 'position', 'value']);
  const breakdown = published.categories[0].rows[0].breakdown;
  assert.deepEqual(breakdown.judges.map(j => j.values), notes);
  assert.deepEqual(breakdown.criteria, SUNFEST_CRITERIA);
  assert.deepEqual(breakdown.contributions.map(v => v.toFixed(2)), ['1.93', '1.18', '1.57', '2.37', '0.78']);
  for (const judge of breakdown.judges) assert.deepEqual(Object.keys(judge).sort(), ['name', 'total', 'values']);
  assert.deepEqual(await original.get('snapshot'), before, 'Otros eventos no cambian');
  const db = new DatabaseSync(path.join(dir, 'events', 'thesunfest', 'event.sqlite')); t.after(() => db.close());
  const saved = JSON.parse(db.prepare('SELECT data FROM state WHERE id=1').get().data);
  assert.equal(saved.settings.scoringScheme, 'sunfest-v1', 'El esquema queda persistido junto a las notas');
  // Simulate a pre-existing event that had already been scored with six equal criteria.
  delete saved.settings.scoringScheme;
  for (const score of saved.scores) score.values = [8, 8, 8, 8, 8, 8];
  db.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(saved));
  const legacy = await admin.get('snapshot');
  assert.equal(legacy.settings.scoringScheme, undefined); assert.deepEqual(legacy.scores, saved.scores);
  assert.equal(ranking(legacy, entry.categoryId)[0].value, 8);
});
