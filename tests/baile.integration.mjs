import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { DatabaseSync } from 'node:sqlite';
import JSZip from 'jszip';

test('Recorrido completo y aislamiento de la competencia', { timeout: 120000 }, async t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'baile-tests-'));
  const port = 33219;
  const root = `http://127.0.0.1:${port}`;
  const env = { ...process.env, BAILE_DATA_DIR: dir, NODE_ENV: 'production' };
  const start = () => spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let server = start(); let logs = '';
  const collect = p => { p.stdout.on('data', d => { logs += d; }); p.stderr.on('data', d => { logs += d; }); };
  collect(server);
  t.after(() => { server.kill('SIGTERM'); });
  async function ready() {
    for (let i = 0; i < 80; i++) { try { const r = await fetch(`${root}/api/baile/public`); if (r.ok) return; } catch {} await new Promise(r => setTimeout(r, 200)); }
    throw new Error(`El servidor no inició: ${logs}`);
  }
  await ready();
  const credentials = JSON.parse(execFileSync(process.execPath, ['scripts/baile-admin.cjs'], { env, encoding: 'utf8' }).trim());
  function client() {
    let cookie = '';
    return {
      async post(action, fields = {}, expected = 200, origin = root) {
        const form = new FormData();
        for (const [key, value] of Object.entries(fields)) { if (Array.isArray(value)) value.forEach(v => form.append(key, v)); else form.append(key, value); }
        const res = await fetch(`${root}/api/baile/${action}`, { method: 'POST', body: form, headers: { origin, cookie } });
        const data = await res.json(); assert.equal(res.status, expected, `${action}: ${JSON.stringify(data)}`);
        if (res.headers.get('set-cookie')) cookie = res.headers.get('set-cookie').split(';')[0];
        return data;
      },
      async snapshot() { return (await fetch(`${root}/api/baile/snapshot`, { headers: { cookie } })).json(); },
      file(id, extra = {}) { return fetch(`${root}/api/baile/files/${id}`, { headers: { cookie, ...extra } }); },
      zip(category = '') { return fetch(`${root}/api/baile/music-export?category=${encodeURIComponent(category)}`, { headers: { cookie } }); },
    };
  }
  const admin = client(); const p = client(); const stranger = client(); const judge1 = client(); const judge2 = client(); const outsider = client();
  const info = { name: 'Participante Prueba', document: '12345678', birthDate: '2000-01-01', city: 'Santa Marta', phone: '3000000000', email: 'participante@example.test', academy: 'Academia Prueba', extra: '', password: 'ClavePrueba12345', consent: 'on' };
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  const receipt = () => new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64')], 'recibo.png', { type: 'image/png' });
  const wave = Buffer.alloc(16044); wave.write('RIFF', 0); wave.writeUInt32LE(16036, 4); wave.write('WAVEfmt ', 8); wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22); wave.writeUInt32LE(8000, 24); wave.writeUInt32LE(16000, 28); wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34); wave.write('data', 36); wave.writeUInt32LE(16000, 40);
  const music = () => new File([wave], 'pista.wav', { type: 'audio/wav' });
  let passId; let entry; let entry2; let categoryPayment;
  await t.test('registro único, fecha de registro, acceso y protección del Full Pass', async () => {
    await admin.post('login', credentials);
    await p.post('register', { ...info, birthDate: '2000-02-30' }, 400);
    await p.post('register', info, 201);
    await stranger.post('register', info, 409);
    const s = await p.snapshot(); assert.match(s.participants[0].code, /^PAR-/); assert.ok(s.participants[0].createdAt); assert.equal(s.user.passwordHash, undefined);
    await p.post('enroll', { categoryId: 'salsa-solista', team: '', members: '' }, 403);
    await p.post('settings', {}, 403);
    await stranger.post('review', {}, 401);
    await p.post('logout', {}, 403, 'https://otro-sitio.example');
    await stranger.post('register', { ...info, document: '98765432', email: 'otro@example.test' }, 201);
  });
  await t.test('comprobantes privados, rechazo y nueva revisión', async () => {
    await p.post('payment', { enrollmentId: '', amount: '180000', date, file: new File(['html'], 'mal.png', { type: 'image/png' }) }, 400);
    await p.post('payment', { enrollmentId: '', amount: '1', date, file: receipt() }, 400);
    await p.post('payment', { enrollmentId: '', amount: '180000', date: '2026-02-30', file: receipt() }, 400);
    await p.post('payment', { enrollmentId: '', amount: '180000', date, file: receipt() });
    let s = await p.snapshot(); passId = s.payments[0].id;
    assert.equal((await p.file(s.payments[0].receiptId)).status, 200); assert.equal((await stranger.file(s.payments[0].receiptId)).status, 403); assert.equal((await outsider.file(s.payments[0].receiptId)).status, 401);
    await admin.post('review', { paymentId: passId, status: 'rejected', note: '' }, 400);
    await admin.post('review', { paymentId: passId, status: 'rejected', note: 'Comprobante ilegible' });
    await p.post('enroll', { categoryId: 'salsa-solista', team: '', members: '' }, 403);
    await p.post('payment', { enrollmentId: '', amount: '180000', date, file: receipt() });
    s = await p.snapshot(); assert.equal(s.payments[0].status, 'pending'); assert.equal(s.payments[0].id, passId);
    await admin.post('review', { paymentId: passId, status: 'approved', note: 'Validado' });
    await p.post('payment', { enrollmentId: '', amount: '180000', date, file: receipt() }, 409);
  });
  await t.test('categorías independientes, pagos y números estables', async () => {
    entry = await p.post('enroll', { categoryId: 'salsa-solista', team: '', members: '' }, 201);
    entry2 = await p.post('enroll', { categoryId: 'bachata-parejas', team: 'Pareja Prueba', members: 'Persona A, Persona B' }, 201);
    await p.post('enroll', { categoryId: 'salsa-solista', team: '', members: '' }, 409);
    await p.post('music', { enrollmentId: entry.id, file: music() }, 400);
    await p.post('payment', { enrollmentId: entry.id, amount: '60000', date, file: receipt() });
    categoryPayment = (await p.snapshot()).payments.find(x => x.enrollmentId === entry.id);
    assert.equal((await p.snapshot()).enrollments.find(x => x.id === entry.id).competitionNumber, null);
    await admin.post('review', { paymentId: categoryPayment.id, status: 'approved', note: 'OK' });
    await admin.post('review', { paymentId: categoryPayment.id, status: 'approved', note: 'OK' });
    const s = await p.snapshot(); assert.equal(s.enrollments.find(x => x.id === entry.id).competitionNumber, 1); assert.equal(s.enrollments.find(x => x.id === entry2.id).competitionNumber, null);
  });
  await t.test('pista por inscripción, reproducción y plazo obligatorio', async () => {
    await p.post('music', { enrollmentId: entry.id, file: music() });
    let s = await p.snapshot(); const track = s.enrollments.find(x => x.id === entry.id).musicId;
    assert.equal(s.enrollments.find(x => x.id === entry2.id).musicId, null);
    assert.equal((await admin.file(track)).status, 200); assert.equal((await stranger.file(track)).status, 403);
    const partial = await p.file(track, { range: 'bytes=0-43' }); assert.equal(partial.status, 206); assert.equal((await partial.arrayBuffer()).byteLength, 44);
    const c = s.categories.find(c => c.id === entry.categoryId);
    await admin.post('category', { ...c, active: 'on', fee: String(c.fee), deadline: '2020-01-01T00:00:00-05:00' });
    await p.post('music', { enrollmentId: entry.id, file: music() }, 400);
    await admin.post('category', { ...c, active: 'on', fee: String(c.fee), deadline: '' });
    await p.post('music', { enrollmentId: entry.id, file: music() });
    s = await p.snapshot(); assert.notEqual(s.enrollments.find(x => x.id === entry.id).musicId, track);
  });
  await t.test('jurados independientes, sin datos personales y notas bloqueadas', async () => {
    await admin.post('judge', { id: '', name: 'Jurado Uno', email: 'jurado1@example.test', password: info.password, categories: ['salsa-solista'] });
    await admin.post('judge', { id: '', name: 'Jurado Dos', email: 'jurado2@example.test', password: info.password, categories: ['salsa-solista'] });
    await judge1.post('login', { email: 'jurado1@example.test', password: info.password });
    await judge2.post('login', { email: 'jurado2@example.test', password: info.password });
    const s = await judge1.snapshot(); assert.equal(s.participants.length, 0); assert.equal(s.payments.length, 0); assert.equal(s.judges.length, 0); assert.equal(s.enrollments[0].participantId, ''); assert.equal(s.categories.length, 1);
    await judge1.post('score', { enrollmentId: entry2.id, values: JSON.stringify([8,8,8,8,8,8]) }, 403);
    await judge1.post('score', { enrollmentId: entry.id, values: JSON.stringify([0,11,8,8,8,8]) }, 400);
    await judge1.post('score', { enrollmentId: entry.id, values: JSON.stringify([8,8,8,8,8,8]) });
    await judge1.post('score', { enrollmentId: entry.id, values: JSON.stringify([9,9,9,9,9,9]) }, 409);
    assert.equal((await judge2.snapshot()).scores.length, 0);
    await admin.post('review', { paymentId: categoryPayment.id, status: 'rejected', note: 'No' }, 409);
    await p.post('music', { enrollmentId: entry.id, file: music() }, 400);
  });
  await t.test('resultados completos, autorización de cambios y empates', async () => {
    for (const name of ['types', 'results', 'reporting']) {
      const source = readFileSync(`src/lib/baile/${name}.ts`, 'utf8').replaceAll('"./types"', '"./types.mjs"');
      writeFileSync(path.join(dir, `${name}.mjs`), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
    }
    const { ranking } = await import(pathToFileURL(path.join(dir, 'results.mjs')));
    let s = await admin.snapshot(); assert.equal(ranking(s, entry.categoryId)[0].position, null);
    await judge2.post('score', { enrollmentId: entry.id, values: JSON.stringify([10,10,10,10,10,10]) });
    s = await admin.snapshot(); let r = ranking(s, entry.categoryId)[0]; assert.equal(r.total, 108); assert.equal(r.average, 9); assert.equal(r.position, 1);
    assert.equal(r.final, false);
    const score = s.scores.find(x => x.judgeId === s.judges.find(j => j.email === 'jurado1@example.test').id);
    await admin.post('unlock', { scoreId: score.id, note: 'Corrección autorizada' });
    s = await admin.snapshot(); assert.equal(ranking(s, entry.categoryId)[0].position, null);
    await judge1.post('score', { enrollmentId: entry.id, values: JSON.stringify([9,9,9,9,9,9]) });
    s = await admin.snapshot(); assert.equal(ranking(s, entry.categoryId)[0].average, 9.5); assert.ok(s.audit.some(a => a.action.includes('Corrección autorizada')));
    const copy = structuredClone(s); const clone = { ...copy.enrollments[0], id: 'tie-entry', competitionNumber: 2 }; copy.enrollments.push(clone); copy.payments.push({ ...categoryPayment, id: 'tie-payment', status: 'approved', enrollmentId: clone.id }); copy.scores.push(...copy.scores.filter(x => x.enrollmentId === entry.id).map(x => ({ ...x, id: `${x.id}-tie`, enrollmentId: clone.id })));
    assert.deepEqual(ranking(copy, entry.categoryId).map(x => x.position), [1,1]);
    copy.settings.formula = 'sum'; assert.equal(ranking(copy, entry.categoryId)[0].value, 114);
  });
  await t.test('migración de datos existentes sin perder cuentas, pagos ni notas', async () => {
    const connection = new DatabaseSync(path.join(dir, 'event.sqlite'));
    const legacy = JSON.parse(connection.prepare('SELECT data FROM state WHERE id=1').get().data);
    const original = structuredClone(legacy);
    legacy.version = 1; delete legacy.accreditations; delete legacy.notes; delete legacy.schedule; delete legacy.settings.categoryRegistrationOpen;
    legacy.participants.forEach(p => delete p.fullPassFee);
    connection.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(legacy)); connection.close();
    const s = await admin.snapshot(); assert.deepEqual(s.payments, original.payments); assert.deepEqual(s.scores, original.scores); assert.deepEqual(s.enrollments, original.enrollments);
    assert.equal(s.participants.length, original.participants.length); assert.equal(s.participants[0].fullPassFee, 180000);
    assert.deepEqual(s.schedule, []); assert.deepEqual(s.accreditations, []); assert.deepEqual(s.notes, []); assert.equal(s.settings.categoryRegistrationOpen, true);
    assert.equal((await admin.file(s.payments[0].receiptId)).status, 200);
  });
  await t.test('cierres independientes, tarifas históricas y saldos por concepto', async () => {
    const settings = (await admin.snapshot()).settings;
    const fields = { ...settings, fullPassFee: '250000', registrationOpen: '', categoryRegistrationOpen: 'on' };
    const fresh = client();
    await admin.post('settings', fields);
    await fresh.post('register', { ...info, document: '99887766', email: 'nuevo@example.test' }, 400);
    await p.post('enroll', { categoryId: 'salsa-parejas', team: 'Prueba', members: 'Dos personas' }, 201);
    await admin.post('settings', { ...fields, registrationOpen: 'on', categoryRegistrationOpen: '' });
    await p.post('enroll', { categoryId: 'urbana-grupal', team: 'Prueba', members: 'Tres personas' }, 400);
    await fresh.post('register', { ...info, document: '99887766', email: 'nuevo@example.test' }, 201);
    assert.equal((await fresh.snapshot()).participants[0].fullPassFee, 250000);
    const s = await admin.snapshot(), person = (await p.snapshot()).participants[0]; assert.equal(person.fullPassFee, 180000);
    const { charges, ageAt, whatsapp } = await import(pathToFileURL(path.join(dir, 'reporting.mjs')));
    assert.equal(ageAt('2000-09-26', '2026-09-25'), 25); assert.equal(ageAt('2000-09-25', '2026-09-25'), 26);
    assert.equal(whatsapp('305 356 0953'), 'https://wa.me/573053560953');
    assert.equal(whatsapp('0000000000'), null);
    const copy = structuredClone(s); copy.payments.find(p => p.id === passId).amount = 999999;
    const rows = charges(copy).filter(r => r.participant.id === person.id);
    assert.equal(rows.find(r => r.kind === 'fullpass').balance, 0); assert.equal(rows.find(r => r.id === entry2.id).balance, 90000);
    await admin.post('settings', { ...settings, fullPassFee: '180000', registrationOpen: 'on', categoryRegistrationOpen: 'on' });
    assert.equal((await fresh.snapshot()).participants[0].fullPassFee, 250000);
  });
  await t.test('acreditación única, anulación trazable y observaciones privadas', async () => {
    const person = (await p.snapshot()).participants[0], other = (await stranger.snapshot()).participants[0];
    await stranger.post('accredit', { participantId: other.id, code: 'RC-002' }, 403);
    await admin.post('accredit', { participantId: other.id, code: 'RC-002' }, 409);
    await admin.post('accredit', { participantId: person.id, code: 'rc-001' });
    await admin.post('accredit', { participantId: person.id, code: 'RC-003' }, 409);
    let s = await p.snapshot(); assert.equal(s.accreditations[0].code, 'RC-001');
    assert.equal((await stranger.snapshot()).accreditations.length, 0);
    const result = await admin.post('review', { paymentId: passId, status: 'rejected', note: 'Prueba' }, 409); assert.match(result.error, /acreditación/);
    await admin.post('revoke-accreditation', { id: s.accreditations[0].id, reason: '' }, 400);
    await admin.post('revoke-accreditation', { id: s.accreditations[0].id, reason: 'Cambio de manilla' });
    assert.equal((await p.snapshot()).accreditations.length, 0);
    await admin.post('accredit', { participantId: person.id, code: 'rc-001' }, 409);
    await admin.post('accredit', { participantId: person.id, code: 'RC-004' });
    await p.post('participant-note', { participantId: person.id, note: 'No autorizado' }, 403);
    await admin.post('participant-note', { participantId: person.id, note: 'Nota interna de prueba' });
    s = await admin.snapshot(); assert.equal(s.notes[0].text, 'Nota interna de prueba'); assert.ok(s.accreditations[0].revokedAt);
    for (const c of [p, stranger, judge1, outsider]) assert.equal((await c.snapshot()).notes.length, 0);
  });
  await t.test('cabina de música: exportación ZIP privada y filtrada', async () => {
    assert.equal((await outsider.zip()).status, 401); assert.equal((await p.zip()).status, 403); assert.equal((await judge1.zip()).status, 403);
    assert.equal((await admin.zip('bachata-parejas')).status, 404);
    const response = await admin.zip('salsa-solista'); assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'private, no-store');
    const zip = await JSZip.loadAsync(await response.arrayBuffer()), names = Object.keys(zip.files).filter(n => !zip.files[n].dir);
    assert.equal(names.length, 1); assert.match(names[0], /001-INS-.*pista.wav$/); assert.equal((await zip.file(names[0]).async('nodebuffer')).byteLength, wave.length);
  });
  await t.test('programación sin cruces, transiciones y cierre con resultados definitivos', async () => {
    const fields = { id: '', categoryId: 'salsa-solista', startAt: '2027-01-10T18:00:00-05:00', duration: '15', stage: 'Principal', status: 'planned', note: 'Observación interna de prueba' };
    await p.post('schedule', fields, 403); await admin.post('schedule', { ...fields, status: 'toString' }, 400);
    await admin.post('schedule', fields);
    let s = await admin.snapshot(); const slot = s.schedule[0], own = (await p.snapshot()).schedule[0];
    assert.equal(own.note, ''); assert.equal(own.startAt, '2027-01-10T23:00:00.000Z'); assert.equal((await stranger.snapshot()).schedule.length, 0);
    await admin.post('schedule', { ...fields, startAt: '2027-01-10T20:00:00-05:00' }, 409);
    await admin.post('schedule', { ...fields, categoryId: 'bachata-parejas', stage: 'principal', startAt: '2027-01-10T18:10:00-05:00' }, 409);
    await admin.post('schedule', { ...fields, categoryId: 'bachata-parejas', startAt: '2027-01-10T18:15:00-05:00' });
    const empty = (await admin.snapshot()).schedule.find(x => x.categoryId === 'bachata-parejas');
    await admin.post('schedule', { ...empty, status: 'live' }, 400);
    const score = s.scores.find(x => x.judgeId === s.judges.find(j => j.email === 'jurado1@example.test').id);
    await admin.post('unlock', { scoreId: score.id, note: 'Comprobar cierre con nota pendiente' });
    await admin.post('schedule', { ...slot, status: 'finished' }, 409);
    await admin.post('schedule', { ...slot, status: 'live' });
    await p.post('music', { enrollmentId: entry.id, file: music() }, 409);
    await admin.post('review', { paymentId: categoryPayment.id, status: 'approved', note: 'Prueba' }, 409);
    await admin.post('judge', { id: '', name: 'Tercero', email: 'tercero@example.test', password: info.password, categories: ['salsa-solista'] }, 409);
    await admin.post('schedule', { ...slot, status: 'finished' }, 409);
    await admin.post('schedule', { ...slot, status: 'planned' }, 409);
    await admin.post('schedule', { ...slot, status: 'live', duration: '20' }, 409);
    await judge1.post('score', { enrollmentId: entry.id, values: JSON.stringify([9,9,9,9,9,9]) });
    await admin.post('schedule', { ...slot, status: 'finished' });
    s = await admin.snapshot(); const { ranking } = await import(pathToFileURL(path.join(dir, 'results.mjs')));
    assert.equal(ranking(s, entry.categoryId)[0].final, true); assert.equal(s.categories.find(c => c.id === entry.categoryId).active, false);
    await admin.post('unlock', { scoreId: score.id, note: 'No permitido' }, 409);
    await judge1.post('score', { enrollmentId: entry.id, values: JSON.stringify([10,10,10,10,10,10]) }, 409);
    const category = s.categories.find(c => c.id === entry.categoryId);
    await admin.post('category', { ...category, active: 'on' }, 409);
    await admin.post('settings', { ...s.settings, formula: 'sum', registrationOpen: 'on', categoryRegistrationOpen: 'on' }, 409);
  });
  await t.test('persistencia después de reiniciar y cierre de sesión', async () => {
    const before = await admin.snapshot(); const stopped = new Promise(r => server.once('exit', r)); server.kill('SIGTERM'); await stopped;
    server = start(); collect(server); await ready();
    const after = await admin.snapshot(); assert.equal(after.enrollments.length, before.enrollments.length); assert.equal(after.scores.length, before.scores.length);
    assert.deepEqual(after.schedule, before.schedule); assert.deepEqual(after.accreditations, before.accreditations); assert.deepEqual(after.notes, before.notes);
    assert.equal((await admin.file(after.payments[0].receiptId)).status, 200);
    await p.post('logout'); assert.equal((await p.snapshot()).user, null);
    const connection = new DatabaseSync(path.join(dir, 'event.sqlite')); assert.equal(connection.prepare('PRAGMA integrity_check').get().integrity_check, 'ok'); connection.close();
  });
});
