import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { randomBytes, scryptSync } from 'node:crypto';
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
      sessionCookie() { return cookie; },
      profiles() { return fetch(`${root}/api/baile/profiles`, { headers: { cookie } }); },
      file(id, extra = {}) { return fetch(`${root}/api/baile/files/${id}`, { headers: { cookie, ...extra } }); },
      zip(category = '') { return fetch(`${root}/api/baile/music-export?category=${encodeURIComponent(category)}`, { headers: { cookie } }); },
    };
  }
  const admin = client(); const p = client(); const stranger = client(); const judge1 = client(); const judge2 = client(); const outsider = client();
  const info = { name: 'Participante Prueba', document: '12345678', birthDate: '2000-01-01', city: 'Santa Marta', phone: '3000000000', email: 'participante@example.test', academy: 'Academia Prueba', extra: '', password: 'ClavePrueba12345', consent: 'on' };
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  const receipt = () => new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64')], 'recibo.png', { type: 'image/png' });
  const registrationSource = readFileSync('src/lib/baile/registration.ts', 'utf8');
  const registrationModule = ts.transpileModule(registrationSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { waiverText } = await import('data:text/javascript;base64,' + Buffer.from(registrationModule).toString('base64'));
  async function completeRegistration(fields) {
    const settings = (await outsider.snapshot()).settings;
    return { ...fields, firstName: 'Participante', lastName: 'Prueba', sex: 'Masculino', country: 'Colombia', callingCode: '+57', salsa: 'Amateur', bachata: 'No aplica', documentType: 'CC', documentConfirm: fields.document, passwordConfirm: fields.password, guardianName: '', guardianDocument: '', waiverAccepted: 'on', signature: JSON.stringify([[[10,20],[40,50],[80,20]]]), waiverText: waiverText(settings, fields.name, fields.document), fullPassFee: String(settings.fullPassFee), reference: 'DEMO-REF', receipt: receipt(), photo: receipt() };
  }
  const wave = Buffer.alloc(16044); wave.write('RIFF', 0); wave.writeUInt32LE(16036, 4); wave.write('WAVEfmt ', 8); wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22); wave.writeUInt32LE(8000, 24); wave.writeUInt32LE(16000, 28); wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34); wave.write('data', 36); wave.writeUInt32LE(16000, 40);
  const music = () => new File([wave], 'pista.wav', { type: 'audio/wav' });
  let passId; let entry; let entry2; let categoryPayment;
  await t.test('registro único, fecha de registro, acceso y protección del Full Pass', async () => {
    await admin.post('login', credentials);
    await p.post('register', await completeRegistration({ ...info, birthDate: '2000-02-30' }), 400);
    await p.post('register', await completeRegistration(info), 201);
    await stranger.post('register', await completeRegistration(info), 409);
    const s = await p.snapshot(); assert.match(s.participants[0].code, /^PAR-/); assert.ok(s.participants[0].createdAt); assert.equal(s.user.passwordHash, undefined);
    await p.post('enroll', { categoryId: 'salsa-solista', team: '', members: '' }, 403);
    await p.post('settings', {}, 403);
    await stranger.post('review', {}, 401);
    await p.post('logout', {}, 403, 'https://otro-sitio.example');
    await stranger.post('register', await completeRegistration({ ...info, document: '98765432', email: 'otro@example.test' }), 201);
  });
  await t.test('registro completo: firma, foto, referencia, privacidad y documento como usuario', async () => {
    const snapshot = await p.snapshot(), person = snapshot.participants[0];
    assert.equal(person.registration.salsa, 'Amateur');
    assert.equal(person.registration.waiver.version, '2026-10-v1');
    assert.ok(person.registration.waiver.acceptedAt);
    assert.match(person.registration.waiver.text, /RANKIA/);
    assert.equal(snapshot.payments[0].reference, 'DEMO-REF');
    assert.equal((await p.file(person.registration.photoId)).status, 200);
    assert.equal((await stranger.file(person.registration.photoId)).status, 403);
    assert.equal((await outsider.file(person.registration.photoId)).status, 401);
    assert.equal((await outsider.snapshot()).participants.length, 0);
    const docLogin = client(); await docLogin.post('login', { email: info.document, password: info.password });
    assert.equal((await docLogin.snapshot()).user.id, person.id);
    const payload = await completeRegistration({ ...info, document: 'NEGATIVE01', email: 'negative@example.test' });
    const before = (await admin.snapshot()).participants.length;
    await outsider.post('register', { ...payload, waiverAccepted: '' }, 400);
    await outsider.post('register', { ...payload, signature: '[]' }, 400);
    await outsider.post('register', { ...payload, documentConfirm: 'MISMATCH' }, 400);
    await outsider.post('register', { ...payload, photo: new File(['not-image'], 'x.png') }, 400);
    const connection = new DatabaseSync(path.join(dir, 'event.sqlite'));
    const fileCount = connection.prepare('SELECT count(*) AS n FROM files').get().n;
    const invalids = [
      [{ passwordConfirm: 'NoCoincide12345' }, 400],
      [{ waiverText: 'Carta anterior' }, 409],
      [{ fullPassFee: '1' }, 409],
      [{ birthDate: '2015-01-01' }, 400],
      [{ signature: JSON.stringify([[[0,0],[900,10],[20,30]]]) }, 400],
    ];
    for (const [i, [patch, expected]] of invalids.entries()) {
      const form = new FormData(); for (const [k,v] of Object.entries({ ...payload, ...patch })) form.append(k,v);
      const response = await fetch(root + '/api/baile/register', { method: 'POST', headers: { origin: root, 'x-forwarded-for': '198.51.100.' + (i + 1) }, body: form });
      assert.equal(response.status, expected, await response.text());
    }
    assert.equal(connection.prepare('SELECT count(*) AS n FROM files').get().n, fileCount);
    connection.close();
    assert.equal((await admin.snapshot()).participants.length, before);
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
  await t.test('cuatro estados editables del Full Pass, permisos y auditoría', async () => {
    const before = (await p.snapshot()).payments.find(x => x.id === passId);
    await p.post('review', { paymentId: passId, status: 'review', note: '' }, 403);
    await admin.post('review', { paymentId: passId, status: 'unknown', note: '' }, 400);
    for (const status of ['pending', 'review', 'rejected', 'approved']) {
      await admin.post('review', { paymentId: passId, status, note: 'Prueba de estados' });
      const snapshot = await admin.snapshot(), payment = snapshot.payments.find(x => x.id === passId);
      assert.equal(payment.status, status);
      assert.equal(payment.receiptId, before.receiptId);
      assert.equal(payment.amount, before.amount);
      assert.equal(payment.reviewedBy, snapshot.user.id);
      assert.ok(payment.reviewedAt);
      assert.ok(snapshot.audit.some(x => x.target === passId && x.action.includes('Pago')));
      if (status !== 'approved') await p.post('enroll', { categoryId: 'salsa-solista', team: '', members: '' }, 403);
    }
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
  await t.test('estados de inscripción independientes del Full Pass y de otras categorías', async () => {
    const before = await p.snapshot();
    await admin.post('review', { paymentId: categoryPayment.id, status: 'rejected', note: '   ' }, 400);
    for (const status of ['review', 'pending', 'rejected', 'approved']) {
      await admin.post('review', { paymentId: categoryPayment.id, status, note: 'Validación de categoría' });
      const s = await p.snapshot();
      assert.equal(s.payments.find(x => x.id === categoryPayment.id).status, status);
      assert.deepEqual(s.payments.find(x => x.id === passId), before.payments.find(x => x.id === passId));
      assert.deepEqual(s.enrollments.find(x => x.id === entry2.id), before.enrollments.find(x => x.id === entry2.id));
      assert.equal(s.enrollments.find(x => x.id === entry.id).competitionNumber, 1);
      if (status !== 'approved') await p.post('music', { enrollmentId: entry.id, file: music() }, 400);
    }
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
  await t.test('ficha editable: datos, categoría y archivos sin alterar pagos ajenos', async () => {
    const before = await admin.snapshot();
    await p.post('enrollment-edit', {}, 403);
    await admin.post('enrollment-edit', { enrollmentId: entry.id, team: 'Nombre de prueba', members: 'Integrante de prueba', school: 'Escuela de prueba', contactEmail: 'contacto@example.test' });
    await admin.post('enrollment-note', { enrollmentId: entry.id, note: 'Nota interna de prueba' });
    let s = await admin.snapshot();
    assert.equal(s.enrollments.find(x => x.id === entry.id).school, 'Escuela de prueba');
    assert.equal((await p.snapshot()).enrollments.find(x => x.id === entry.id).note, undefined);
    await admin.post('enrollment-category', { enrollmentId: entry.id, categoryId: 'bachata-parejas', reason: 'Duplicado' }, 409);
    await admin.post('enrollment-category', { enrollmentId: entry.id, categoryId: 'salsa-parejas', reason: 'Tarifa diferente' }, 409);
    await admin.post('enrollment-category', { enrollmentId: entry2.id, categoryId: 'salsa-parejas', reason: 'Cambio de prueba' });
    assert.equal((await admin.snapshot()).enrollments.find(x => x.id === entry2.id).categoryId, 'salsa-parejas');
    await admin.post('enrollment-category', { enrollmentId: entry2.id, categoryId: 'bachata-parejas', reason: 'Restaurar categoría' });
    await admin.post('enrollment-music', { enrollmentId: entry.id, file: music() });
    await admin.post('enrollment-receipt', { enrollmentId: entry.id, reason: 'Archivo de prueba', file: receipt() });
    s = await admin.snapshot();
    const payment = s.payments.find(x => x.id === categoryPayment.id);
    assert.equal(payment.status, 'review'); assert.equal(payment.amount, categoryPayment.amount);
    assert.notEqual(payment.receiptId, categoryPayment.receiptId);
    assert.notEqual(s.enrollments.find(x => x.id === entry.id).musicId, before.enrollments.find(x => x.id === entry.id).musicId);
    assert.deepEqual(s.payments.find(x => x.id === passId), before.payments.find(x => x.id === passId));
    await admin.post('review', { paymentId: payment.id, status: 'approved', note: 'Prueba validada' });
  });
  await t.test('jurados independientes, sin datos personales y notas bloqueadas', async () => {
    await admin.post('judge', { id: '', name: 'Jurado Uno', email: 'jurado1@example.test', password: info.password, categories: ['salsa-solista'] });
    await admin.post('judge', { id: '', name: 'Jurado Dos', email: 'jurado2@example.test', password: info.password, categories: ['salsa-solista'] });
    await judge1.post('login', { email: 'jurado1@example.test', password: info.password });
    await judge2.post('login', { email: 'jurado2@example.test', password: info.password });
    const s = await judge1.snapshot(); assert.equal(s.participants.length, 0); assert.equal(s.payments.length, 0); assert.equal(s.judges.length, 0); assert.equal(s.enrollments[0].participantId, ''); assert.equal(s.categories.length, (await admin.snapshot()).categories.length);
    await judge1.post('score', { enrollmentId: entry2.id, values: JSON.stringify([8,8,8,8,8,8]) }, 400);
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
    assert.deepEqual((await (await fetch(root + '/api/baile/results')).json()).categories, []);
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
    legacy.users.find(u => u.role === 'superadmin').role = 'admin';
    legacy.version = 1; delete legacy.accreditations; delete legacy.notes; delete legacy.schedule; delete legacy.settings.categoryRegistrationOpen;
    legacy.participants.forEach(p => delete p.fullPassFee);
    connection.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(legacy)); connection.close();
    const s = await admin.snapshot(); assert.deepEqual(s.payments, original.payments); assert.deepEqual(s.scores, original.scores); assert.deepEqual(s.enrollments, original.enrollments);
    assert.equal(s.participants.length, original.participants.length); assert.equal(s.participants[0].fullPassFee, 180000);
    assert.deepEqual(s.schedule, []); assert.deepEqual(s.accreditations, []); assert.deepEqual(s.notes, []); assert.equal(s.settings.categoryRegistrationOpen, true);
    assert.equal(s.user.role, 'superadmin');
    assert.equal((await admin.file(s.payments[0].receiptId)).status, 200);
  });
  await t.test('cierres independientes, tarifas históricas y saldos por concepto', async () => {
    const settings = (await admin.snapshot()).settings;
    const fields = { ...settings, fullPassFee: '250000', registrationOpen: '', categoryRegistrationOpen: 'on' };
    const fresh = client();
    await admin.post('settings', fields);
    await fresh.post('register', await completeRegistration({ ...info, document: '99887766', email: 'nuevo@example.test' }), 400);
    await p.post('enroll', { categoryId: 'salsa-parejas', team: 'Prueba', members: 'Dos personas' }, 201);
    await admin.post('settings', { ...fields, registrationOpen: 'on', categoryRegistrationOpen: '' });
    await p.post('enroll', { categoryId: 'urbana-grupal', team: 'Prueba', members: 'Tres personas' }, 400);
    await fresh.post('register', await completeRegistration({ ...info, document: '99887766', email: 'nuevo@example.test' }), 201);
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
    await admin.post('judge', { id: '', name: 'Tercero', email: 'tercero@example.test', password: info.password, categories: ['salsa-solista'] });
    assert.ok(!(await admin.snapshot()).judges.find(j => j.email === 'tercero@example.test').categories.includes('salsa-solista'));
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
  await t.test('registro administrativo conserva sesión, rol y validaciones', async () => {
    const before = await admin.snapshot();
    const fields = { ...info, name: 'Alta Manual', document: 'AD-90 001', email: 'MANUAL@example.test', role: 'admin' };
    await outsider.post('admin-register', fields, 401);
    await p.post('admin-register', fields, 403);
    await judge1.post('admin-register', fields, 403);
    await admin.post('admin-register', { ...fields, consent: '' }, 400);
    await admin.post('admin-register', { ...fields, birthDate: '2000-02-30' }, 400);
    await admin.post('admin-register', { ...fields, password: 'corta' }, 400);
    const result = await admin.post('admin-register', fields, 201);
    assert.ok(result.participantId); assert.match(result.code, /^PAR-/); assert.equal(result.role, undefined);
    const after = await admin.snapshot();
    assert.equal(after.user.id, before.user.id); assert.equal(after.user.role, 'superadmin');
    assert.equal(after.participants.length, before.participants.length + 1);
    assert.equal(after.payments.length, before.payments.length); assert.equal(after.enrollments.length, before.enrollments.length);
    const created = after.participants.find(x => x.id === result.participantId);
    assert.equal(created.document, 'AD90001'); assert.equal(created.email, 'manual@example.test'); assert.equal(created.fullPassFee, before.settings.fullPassFee);
    assert.ok(after.audit.some(x => x.actor === before.user.id && x.target === created.id && x.action === 'Participante registrado por organización'));
    await admin.post('admin-register', { ...fields, document: 'AD90002' }, 409);
    await admin.post('admin-register', { ...fields, email: 'otromanual@example.test' }, 409);
    const manual = client(); await manual.post('login', { email: created.email, password: fields.password });
    const own = await manual.snapshot(); assert.equal(own.user.role, 'participant'); assert.equal(own.participants.length, 1); assert.equal(own.participants[0].id, created.id);
    await manual.post('enroll', { categoryId: 'salsa-parejas', team: 'Pareja', members: 'Dos' }, 403);
  });
  await t.test('organización puede registrar con registro público cerrado', async () => {
    const settings = (await admin.snapshot()).settings;
    await admin.post('settings', { ...settings, registrationOpen: '', categoryRegistrationOpen: 'on' });
    await outsider.post('register', await completeRegistration({ ...info, document: 'AD90003', email: 'cerrado@example.test' }), 400);
    await admin.post('admin-register', { ...info, document: 'AD90003', email: 'cerrado@example.test' }, 201);
    assert.equal((await admin.snapshot()).user.role, 'superadmin');
    await admin.post('settings', { ...settings, registrationOpen: 'on', categoryRegistrationOpen: 'on' });
  });
  await t.test('perfiles por usuario: superadministrador, contratista y participante aislados', async () => {
    const before = await admin.snapshot();
    const hashes = {};
    for (const name of ['superadmin', 'admin', 'participante1']) { const salt = randomBytes(16).toString('hex'); hashes[name] = salt + ':' + scryptSync(name === 'admin' ? 'DemoKey99' : info.password, salt, 64).toString('hex'); }
    const seedEnv = { ...env, BAILE_TEST_PROFILE_HASHES: JSON.stringify(hashes) };
    execFileSync(process.execPath, ['scripts/baile-test-profiles.cjs'], { env: seedEnv });
    execFileSync(process.execPath, ['scripts/baile-test-profiles.cjs'], { env: seedEnv });
    const after = await admin.snapshot();
    assert.equal(after.participants.length, before.participants.length + 1);
    assert.deepEqual(after.payments, before.payments); assert.deepEqual(after.scores, before.scores);
    const owner = client(), contractor = client(), participant = client();
    assert.equal((await owner.post('login', { email: 'SUPERADMIN', password: info.password })).role, 'superadmin');
    assert.equal((await contractor.post('login', { email: 'admin', password: 'DemoKey99' })).role, 'contractor');
    assert.equal((await participant.post('login', { email: 'participante1', password: info.password })).role, 'participant');
    const limited = await contractor.snapshot();
    assert.equal(limited.participants.length, after.participants.length);
    for (const field of ['scores', 'judges', 'audit', 'notes', 'accreditations', 'schedule']) assert.deepEqual(limited[field], []);
    for (const action of ['settings', 'category', 'judge', 'unlock', 'reset-password', 'admin-register', 'participant-note', 'schedule', 'accredit', 'example']) await contractor.post(action, {}, 403);
    assert.equal((await contractor.zip()).status, 403);
    const musicId = after.enrollments.find(e => e.musicId)?.musicId; assert.ok(musicId);
    assert.equal((await contractor.file(musicId)).status, 200);
    assert.equal((await contractor.file(musicId, { Range: 'bytes=0-15' })).status, 206);
    assert.equal((await participant.file(musicId)).status, 403);
    assert.equal((await outsider.file(musicId)).status, 401);
    const fileDb = new DatabaseSync(path.join(dir, 'event.sqlite'));
    try { fileDb.prepare('INSERT INTO files VALUES (?,?,?,?,?,?)').run('orphan-music', 'no-participant', 'music', 'old.wav', 'audio/wav', wave); }
    finally { fileDb.close(); }
    assert.equal((await contractor.file('orphan-music')).status, 403);
    const own = await participant.snapshot(); assert.equal(own.participants.length, 1); assert.equal(own.user.username, 'participante1');
    await participant.post('payment', { enrollmentId: '', amount: String(own.participants[0].fullPassFee), date, file: receipt() });
    const payment = (await participant.snapshot()).payments[0];
    assert.equal((await contractor.file(payment.receiptId)).status, 200);
    await participant.post('review', { paymentId: payment.id, status: 'approved', note: '' }, 403);
    for (const status of ['review', 'pending']) {
      await contractor.post('review', { paymentId: payment.id, status, note: 'Por revisar' });
      assert.equal((await participant.snapshot()).payments[0].status, status);
    }
    await contractor.post('review', { paymentId: payment.id, status: 'rejected', note: 'Ejemplo incompleto' });
    assert.equal((await participant.snapshot()).payments[0].status, 'rejected');
    await contractor.post('review', { paymentId: payment.id, status: 'approved', note: 'Ejemplo validado' });
    assert.equal((await participant.snapshot()).payments[0].status, 'approved');
    await participant.post('music', { enrollmentId: entry.id, file: music() }, 404);
    await owner.post('admin-register', { ...info, document: 'OWNER001', email: 'owner-test@example.test' }, 201);
  });
  await t.test('jurado1 de prueba: creación aislada, acceso y listado privado', async () => {
    const connection = new DatabaseSync(path.join(dir, 'event.sqlite'));
    const read = () => JSON.parse(connection.prepare('SELECT data FROM state WHERE id=1').get().data);
    const before = read();
    const salt = randomBytes(16).toString('hex');
    const hash = salt + ':' + scryptSync('jurado1', salt, 64).toString('hex');
    const seedEnv = { ...env, BAILE_TEST_PROFILE_HASHES: JSON.stringify({ jurado1: hash }) };
    execFileSync(process.execPath, ['scripts/baile-test-profiles.cjs'], { env: seedEnv });
    execFileSync(process.execPath, ['scripts/baile-test-profiles.cjs'], { env: seedEnv });
    const after = read(), judge = after.users.find(u => u.username === 'jurado1');
    assert.equal(after.users.length, before.users.length + 1);
    assert.equal(judge.role, 'judge'); assert.equal(judge.demoOnly, true); assert.deepEqual(judge.categories, []);
    assert.deepEqual(after.users.filter(u => u.id !== judge.id), before.users);
    for (const key of ['participants','payments','enrollments','scores']) assert.deepEqual(after[key], before[key]);
    const freshJudge = client(); await freshJudge.post('login', { email: 'jurado1', password: 'jurado1' });
    const own = await freshJudge.snapshot(); assert.equal(own.user.role, 'judge'); assert.deepEqual(own.participants, []); assert.deepEqual(own.categories.map(c => c.id), (await admin.snapshot()).categories.filter(c => c.id !== 'salsa-solista').map(c => c.id));
    for (const [account,status] of [[outsider,401],[freshJudge,403],[p,403],[admin,200]]) {
      const r = await fetch(root + '/api/baile/users', { headers: { cookie: account.sessionCookie() } });
      assert.equal(r.status, status);
      if (r.ok) { const list = await r.json(); assert.equal(list.users.length, after.users.length); assert.ok(list.users.every(u => !('passwordHash' in u))); }
    }
    after.users.find(u => u.id === judge.id).categories = ['salsa-solista'];
    connection.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(after));
    execFileSync(process.execPath, ['scripts/baile-test-profiles.cjs'], { env: seedEnv });
    assert.deepEqual(read().users.find(u => u.id === judge.id).categories, ['salsa-solista']);
    assert.equal((await freshJudge.snapshot()).user, null);
    const disabled = read(); disabled.users.find(u => u.id === judge.id).categories = []; disabled.settings.demo = false;
    connection.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(disabled));
    await freshJudge.post('login', { email: 'jurado1', password: 'jurado1' }, 401);
    disabled.settings.demo = true; connection.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(disabled));
    connection.close();
  });
  await t.test('resultados públicos muestran solo posiciones definitivas y datos mínimos', async () => {
    const response = await fetch(root + '/api/baile/results'); assert.equal(response.status, 200);
    const data = await response.json(); assert.ok(data.categories.length > 0);
    assert.deepEqual(Object.keys(data).sort(), ['categories', 'formula']);
    for (const category of data.categories) {
      assert.ok((await admin.snapshot()).schedule.some(s => s.categoryId === category.id && s.status === 'finished'));
      for (const row of category.rows) assert.deepEqual(Object.keys(row).sort(), ['breakdown', 'name', 'number', 'position', 'value']);
    }
    assert.equal((await outsider.snapshot()).participants.length, 0);
  });
  await t.test('selector de pruebas entra sin clave desde una sesión, cambia permisos y revoca la anterior', async () => {
    assert.equal((await outsider.profiles()).status, 401);
    await outsider.post('switch-profile', { profileId: 'test-profile-superadmin' }, 401);
    await outsider.post('login', { email: credentials.email, password: '' }, 400);
    const switcher = client(); await switcher.post('login', credentials);
    const original = await switcher.snapshot();
    const response = await switcher.profiles(); assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
    const { profiles } = await response.json(); assert.ok(profiles.length >= 4);
    for (const profile of profiles) assert.deepEqual(Object.keys(profile).sort(), ['id', 'name', 'role']);
    const participant = (await p.snapshot()).user;
    const judge = (await judge1.snapshot()).user;
    await switcher.post('switch-profile', { profileId: 'inexistente' }, 401);
    await switcher.post('switch-profile', { profileId: participant.id }, 403, 'https://otro.example');
    assert.equal((await switcher.snapshot()).user.id, original.user.id);
    const oldCookie = switcher.sessionCookie();
    const changed = await switcher.post('switch-profile', { profileId: participant.id, role: 'admin' });
    assert.equal(changed.role, 'participant');
    let own = await switcher.snapshot(); assert.equal(own.user.id, participant.id); assert.equal(own.participants.length, 1);
    assert.equal((await (await fetch(`${root}/api/baile/snapshot`, { headers: { cookie: oldCookie } })).json()).user, null);
    await switcher.post('settings', {}, 403);
    assert.equal((await switcher.profiles()).status, 200);
    await switcher.post('switch-profile', { profileId: judge.id });
    own = await switcher.snapshot(); assert.equal(own.user.role, 'judge'); assert.equal(own.participants.length, 0);
    await switcher.post('switch-profile', { profileId: original.user.id });
    assert.equal((await switcher.snapshot()).user.role, 'superadmin');
    assert.ok((await admin.snapshot()).audit.some(x => x.action === 'Cambio de perfil de prueba' && x.target === participant.id));
    const demoAccount = client(); await demoAccount.post('login', { email: 'superadmin', password: info.password });
    const connection = new DatabaseSync(path.join(dir, 'event.sqlite'));
    const setDemo = value => { const state = JSON.parse(connection.prepare('SELECT data FROM state WHERE id=1').get().data); state.settings.demo = value; connection.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(state)); };
    try {
      setDemo(false);
      assert.equal((await demoAccount.snapshot()).user, null);
      await demoAccount.post('login', { email: 'superadmin', password: info.password }, 401);
      assert.equal((await switcher.profiles()).status, 403);
      await switcher.post('switch-profile', { profileId: participant.id }, 403);
      assert.equal((await switcher.snapshot()).user.role, 'superadmin');
    } finally { setDemo(true); connection.close(); }
    await switcher.post('logout'); assert.equal((await switcher.profiles()).status, 401);
  });
  await t.test('ficha editable: datos, categoría, archivos privados y bloqueos', async () => {
    const contractor = client(); await contractor.post('login', { email: 'admin', password: 'DemoKey99' });
    for (const action of ['enrollment-edit', 'enrollment-category', 'enrollment-note', 'enrollment-music', 'enrollment-receipt']) {
      await contractor.post(action, {}, 403); await p.post(action, {}, 403); await outsider.post(action, {}, 401);
    }
    const fresh = client();
    await admin.post('admin-register', { ...info, document: 'EDIT01', email: 'editar@example.test' }, 201);
    await fresh.post('login', { email: 'editar@example.test', password: info.password });
    const person = (await fresh.snapshot()).participants[0];
    await fresh.post('payment', { enrollmentId: '', amount: String(person.fullPassFee), date, file: receipt() });
    const pass = (await fresh.snapshot()).payments[0];
    await admin.post('review', { paymentId: pass.id, status: 'approved', note: 'Prueba' });
    const category = { name: 'Categoría de prueba de edición', rhythm: 'Salsa', modality: 'Solista', division: 'Abierto', active: 'on', deadline: '' };
    for (const [id, fee] of [['edit-a', 60000], ['edit-b', 90000], ['edit-c', 90000]]) await admin.post('category', { ...category, id, fee });
    const entry = await fresh.post('enroll', { categoryId: 'edit-a', team: '', members: '' }, 201);
    const fields = { enrollmentId: entry.id, team: 'Nombre artístico', members: '', school: 'Escuela nueva', contactEmail: 'contacto@example.test' };
    await admin.post('enrollment-edit', { ...fields, contactEmail: 'incorrecto' }, 400);
    await admin.post('enrollment-edit', fields);
    await admin.post('enrollment-note', { enrollmentId: entry.id, note: 'Nota interna de prueba' });
    let snapshot = await fresh.snapshot();
    assert.deepEqual(snapshot.participants[0], person);
    assert.equal(snapshot.enrollments[0].school, fields.school); assert.equal(snapshot.enrollments[0].note, undefined);
    assert.equal((await admin.snapshot()).enrollments.find(e => e.id === entry.id).note, 'Nota interna de prueba');
    await admin.post('enrollment-music', { enrollmentId: entry.id, file: music() }, 409);
    await admin.post('enrollment-category', { enrollmentId: entry.id, categoryId: 'edit-b', reason: 'Corrección' });
    snapshot = await fresh.snapshot(); assert.equal(snapshot.enrollments[0].fee, 90000);
    await fresh.post('payment', { enrollmentId: entry.id, amount: '90000', date, file: receipt() });
    const payment = (await fresh.snapshot()).payments.find(p => p.enrollmentId === entry.id);
    await admin.post('review', { paymentId: payment.id, status: 'approved', note: 'Prueba' });
    await admin.post('enrollment-music', { enrollmentId: entry.id, file: music() });
    const track = (await fresh.snapshot()).enrollments[0].musicId;
    assert.equal((await fresh.file(track)).status, 200); assert.equal((await contractor.file(track)).status, 200); assert.equal((await stranger.file(track)).status, 403);
    await admin.post('enrollment-category', { enrollmentId: entry.id, categoryId: 'edit-a', reason: 'Tarifa diferente' }, 409);
    await admin.post('enrollment-category', { enrollmentId: entry.id, categoryId: 'edit-c', reason: 'Misma tarifa' });
    assert.equal((await fresh.snapshot()).enrollments[0].musicId, track);
    await admin.post('category', { ...category, id: 'edit-c', fee: 90000, deadline: '2000-01-01T00:00:00Z' });
    await admin.post('enrollment-music', { enrollmentId: entry.id, file: music() }, 409);
    await admin.post('category', { ...category, id: 'edit-c', fee: 90000 });
    await admin.post('enrollment-music', { enrollmentId: entry.id, file: music() });
    assert.notEqual((await fresh.snapshot()).enrollments[0].musicId, track);
    await admin.post('enrollment-receipt', { enrollmentId: entry.id, file: receipt(), reason: 'Comprobante corregido' });
    const replaced = (await fresh.snapshot()).payments.find(p => p.id === payment.id);
    assert.equal(replaced.status, 'review'); assert.equal(replaced.amount, payment.amount); assert.equal(replaced.date, payment.date); assert.notEqual(replaced.receiptId, payment.receiptId);
    assert.equal((await fresh.file(replaced.receiptId)).status, 200);
    await admin.post('enrollment-music', { enrollmentId: entry.id, file: music() }, 409);
    await admin.post('review', { paymentId: payment.id, status: 'approved', note: 'Verificado' });
    const scored = (await admin.snapshot()).enrollments.find(e => e.id === categoryPayment.enrollmentId);
    await admin.post('enrollment-edit', { ...fields, enrollmentId: scored.id }, 409);
    await admin.post('enrollment-category', { enrollmentId: scored.id, categoryId: 'edit-c', reason: 'No permitido' }, 409);
    await admin.post('enrollment-music', { enrollmentId: scored.id, file: music() }, 409);
    await admin.post('enrollment-receipt', { enrollmentId: scored.id, file: receipt(), reason: 'No permitido' }, 409);
    await admin.post('enrollment-edit', { ...fields, enrollmentId: 'missing' }, 404);
    assert.equal((await fetch(root + '/j2rankia/inscripciones/' + entry.id)).status, 200);
  });
  await t.test('eliminar jurados exige confirmación, permisos y preserva calificaciones', async () => {
    const contractor = client(); await contractor.post('login', { email: 'admin', password: 'DemoKey99' });
    for (const who of [contractor, p, judge1]) await who.post('judge-delete', {}, 403);
    await outsider.post('judge-delete', {}, 401);
    const before = await admin.snapshot();
    const protectedJudge = before.judges.find(j => before.scores.some(score => score.judgeId === j.id));
    await admin.post('judge-delete', { judgeId: protectedJudge.id, confirmId: protectedJudge.id }, 409);
    await admin.post('judge-delete', { judgeId: before.user.id, confirmId: before.user.id }, 404);
    await admin.post('judge-delete', { judgeId: 'missing', confirmId: 'missing' }, 404);
    await admin.post('category', { id: 'judge-delete-test', name: 'Prueba de eliminación', rhythm: 'Salsa', modality: 'Solista', division: 'Abierta', fee: 60000, deadline: '', active: 'on' });
    const account = { id: '', name: 'Jurado eliminable', email: 'eliminable@example.test', password: info.password, categories: ['judge-delete-test'] };
    await admin.post('judge', account);
    const temporary = client(); await temporary.post('login', { email: account.email, password: account.password });
    const id = (await temporary.snapshot()).user.id;
    await admin.post('judge-delete', { judgeId: id, confirmId: 'otro' }, 400);
    assert.ok((await admin.snapshot()).judges.some(j => j.id === id));
    await admin.post('judge-delete', { judgeId: id, confirmId: id });
    const after = await admin.snapshot();
    assert.equal(after.judges.some(j => j.id === id), false);
    assert.ok(after.audit.some(a => a.target === id && a.action.includes('Jurado eliminado')));
    for (const key of ['participants', 'payments', 'enrollments', 'scores']) assert.deepEqual(after[key], before[key]);
    assert.equal((await temporary.snapshot()).user, null);
    await temporary.post('login', { email: account.email, password: account.password }, 401);
    await admin.post('judge-delete', { judgeId: id, confirmId: id }, 404);
    const connection = new DatabaseSync(path.join(dir, 'event.sqlite'));
    assert.equal(connection.prepare('SELECT count(*) AS n FROM sessions WHERE userId=?').get(id).n, 0); connection.close();
  });
  await t.test('el selector limita cambios sin bloquear la contraseña del acceso normal', async () => {
    const account = { ...info, document: 'LIMITE01', email: 'limite@example.test' };
    const created = await admin.post('admin-register', account, 201);
    const limited = client(); await limited.post('login', { email: account.email, password: info.password });
    for (let i = 0; i < 240; i++) await limited.post('switch-profile', { profileId: 'inexistente' }, 401);
    await limited.post('switch-profile', { profileId: created.participantId }, 429);
    assert.equal((await limited.snapshot()).user.id, created.participantId);
    await limited.post('logout');
    await limited.post('login', { email: account.email, password: info.password });
    await limited.post('logout');
    assert.equal((await admin.snapshot()).user.role, 'superadmin');
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
