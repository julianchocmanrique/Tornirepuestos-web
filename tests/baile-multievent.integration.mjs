import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

test('Eventos independientes: permisos, registros, pagos, archivos y sesiones', { timeout: 120000 }, async t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'baile-multievent-'));
  const port = 33221, root = `http://127.0.0.1:${port}`;
  const env = { ...process.env, BAILE_DATA_DIR: dir, NODE_ENV: 'production' };
  let logs = '';
  const start = () => {
    const process_ = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    process_.stdout.on('data', d => logs += d); process_.stderr.on('data', d => logs += d);
    return process_;
  };
  let server = start(); t.after(() => server.kill('SIGTERM'));
  async function ready() {
    for (let i = 0; i < 80; i++) { try { if ((await fetch(root + '/api/baile/public')).ok) return; } catch {} await new Promise(r => setTimeout(r, 200)); }
    throw new Error(logs);
  }
  await ready();
  const credentials = JSON.parse(execFileSync(process.execPath, ['scripts/baile-admin.cjs'], { env, encoding: 'utf8' }).trim());
  const source = readFileSync('src/lib/baile/registration.ts','utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { waiverText } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
  function client(eventId = '') {
    const api = root + '/api/baile' + (eventId ? '/eventos/' + eventId : '');
    let cookie = '';
    return {
      cookie: () => cookie,
      async post(action, fields = {}, expected = 200) {
        if (action === 'register') {
          const settings = (await (await fetch(api + '/public')).json()).settings;
          const [firstName, ...last] = fields.name.split(' ');
          const chosen = settings.passPlans?.find(p => p.id === fields.passId);
          const acceptedFee = fields.fullPassFee ?? chosen?.fee ?? settings.fullPassFee;
          fields = { ...fields, firstName, lastName: last.join(' '), sex: 'Otro', country: 'Colombia', callingCode: '+57', salsa: 'Amateur', bachata: 'No aplica', documentType: 'CC', documentConfirm: fields.document, passwordConfirm: fields.password, guardianName: '', guardianDocument: '', waiverAccepted: 'on', signature: JSON.stringify([[[10,20],[40,50],[80,20]]]), waiverText: waiverText(settings, fields.name, fields.document, chosen), fullPassFee: String(acceptedFee), reference: 'TEST-REF', receipt: receipt(), photo: receipt() };
        }
        const body = new FormData();
        for (const [k, v] of Object.entries(fields)) Array.isArray(v) ? v.forEach(x => body.append(k, x)) : body.append(k, v);
        const res = await fetch(api + '/' + action, { method: 'POST', body, headers: { origin: root, cookie } });
        const out = await res.json(); assert.equal(res.status, expected, `${eventId}/${action}: ${JSON.stringify(out)}`);
        if (res.headers.get('set-cookie')) cookie = res.headers.get('set-cookie').split(';')[0];
        return out;
      },
      async snapshot() { const res = await fetch(api + '/snapshot', { headers: { cookie } }); assert.equal(res.status, 200); return res.json(); },
      get(action) { return fetch(api + '/' + action, { headers: { cookie } }); },
    };
  }
  const a = 'encuentro-salsa', b = 'encuentro-bachata';
  const owner = client(), adminA = client(a), adminB = client(b), participantA = client(a), participantB = client(b);
  const info = { name: 'Prueba aislada', email: 'persona@example.test', document: '123456789', birthDate: '2000-01-01', phone: '3000000000', city: 'Ciudad de prueba', academy: '', extra: '', password: 'PruebaPrivada1234', consent: 'on' };
  const receipt = () => new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64')], 'comprobante.png', { type: 'image/png' });
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  let original, payment, entry, trackId;
  await t.test('eventos nuevos vacíos, original intacto y superadministrador global', async () => {
    await owner.post('login', credentials); original = await owner.snapshot();
    for (const admin of [adminA, adminB]) { await admin.post('login', credentials); const s = await admin.snapshot(); assert.equal(s.user.role, 'superadmin'); for (const key of ['participants','enrollments','payments','scores','judges']) assert.deepEqual(s[key], []); }
    assert.equal((await adminA.snapshot()).settings.name, 'Caribe Salsa Festival');
    assert.ok((await adminA.snapshot()).categories.every(c => c.rhythm === 'Salsa'));
    assert.ok((await adminB.snapshot()).categories.every(c => c.rhythm === 'Bachata'));
    assert.match(adminA.cookie(), /^baile_session_encuentro-salsa=/);
    assert.match(adminB.cookie(), /^baile_session_encuentro-bachata=/);
  });
  await t.test('registros concurrentes independientes y protección de correos de administración', async () => {
    await participantA.post('register', { ...info, email: credentials.email }, 409);
    // Concurrent password hashing must preserve the event context across awaits.
    await Promise.all([participantA.post('register', info, 201), participantB.post('register', info, 201)]);
    const sa = await participantA.snapshot(), sb = await participantB.snapshot();
    assert.notEqual(sa.user.id, sb.user.id); assert.equal(sa.participants[0].email, sb.participants[0].email);
    await client(a).post('register', info, 409);
    assert.equal((await owner.snapshot()).participants.length, original.participants.length);
  });
  await t.test('cookies y archivos no se aceptan en otro evento, incluso cambiando el nombre de cookie', async () => {
    for (const cookie of [participantA.cookie(), participantA.cookie().replace(a, b), owner.cookie()]) {
      const s = await (await fetch(root + '/api/baile/eventos/' + b + '/snapshot', { headers: { cookie } })).json();
      assert.equal(s.user, null);
    }
    await participantA.post('payment', { enrollmentId: '', amount: '180000', date, file: receipt() });
    payment = (await participantA.snapshot()).payments[0];
    assert.equal((await participantA.get('files/' + payment.receiptId)).status, 200);
    assert.equal((await adminA.get('files/' + payment.receiptId)).status, 200);
    assert.equal((await adminB.get('files/' + payment.receiptId)).status, 404);
    assert.equal((await participantB.get('files/' + payment.receiptId)).status, 404);
    assert.equal((await owner.get('files/' + payment.receiptId)).status, 404);
    const person = (await participantA.snapshot()).participants[0];
    assert.ok(person.registration.waiver.text.includes('Caribe Salsa Festival'));
    assert.ok(!person.registration.waiver.text.includes('Bachata al Mar'));
    for (const who of [adminB, participantB, owner]) assert.equal((await who.get('files/' + person.registration.photoId)).status, 404);
    assert.equal((await participantA.get('files/' + person.registration.photoId)).status, 200);
  });
  await t.test('aprobar Full Pass y categoría en A no habilita B', async () => {
    await adminB.post('review', { paymentId: payment.id, status: 'approved', note: '' }, 404);
    await adminA.post('review', { paymentId: payment.id, status: 'approved', note: '' });
    entry = await participantA.post('enroll', { categoryId: 'salsa-solista', team: '', members: '' }, 201);
    await participantB.post('enroll', { categoryId: 'bachata-parejas', team: 'Equipo', members: 'Persona 1 y persona 2' }, 403);
    assert.equal((await participantB.snapshot()).payments[0].status, 'pending');
    await participantA.post('payment', { enrollmentId: entry.id, amount: '60000', date, file: receipt() });
    const cp = (await participantA.snapshot()).payments.find(p => p.enrollmentId === entry.id);
    await adminA.post('review', { paymentId: cp.id, status: 'approved', note: '' });
    const wave = Buffer.alloc(16044); wave.write('RIFF'); wave.writeUInt32LE(16036,4); wave.write('WAVEfmt ',8); wave.writeUInt32LE(16,16); wave.writeUInt16LE(1,20); wave.writeUInt16LE(1,22); wave.writeUInt32LE(8000,24); wave.writeUInt32LE(16000,28); wave.writeUInt16LE(2,32); wave.writeUInt16LE(16,34); wave.write('data',36); wave.writeUInt32LE(16000,40);
    await participantA.post('music', { enrollmentId: entry.id, file: new File([wave], 'pista.wav', { type: 'audio/wav' }) });
    trackId = (await participantA.snapshot()).enrollments[0].musicId;
    assert.equal((await adminA.get('files/' + trackId)).status, 200); assert.equal((await adminB.get('files/' + trackId)).status, 404);
    assert.equal((await adminA.get('music-export')).status, 200); assert.equal((await adminB.get('music-export')).status, 404);
  });
  await t.test('contratistas y jurados propios con permisos restringidos', async () => {
    const account = { name: 'Contratista A', email: 'staff@example.test', password: 'Contratista1234' };
    await participantA.post('contractor', account, 403);
    await adminA.post('contractor', { ...account, email: info.email }, 409);
    await adminA.post('contractor', { ...account, email: credentials.email }, 409);
    await adminA.post('contractor', account);
    const contractor = client(a); await contractor.post('login', account);
    assert.equal((await contractor.snapshot()).user.role, 'contractor');
    assert.equal((await contractor.snapshot()).payments.length, 2);
    await contractor.post('settings', {}, 403); await contractor.post('contractor', account, 403);
    await client(b).post('login', account, 401); await client().post('login', account, 401);
    await adminA.post('contractor', { ...account, password: 'OtraContratista1234' });
    assert.equal((await contractor.snapshot()).user, null);
    const judgeAccount = { id: '', name: 'Jurado A', email: 'judge@example.test', password: 'JuradoPrueba1234', categories: ['salsa-solista'] };
    await adminA.post('judge', judgeAccount);
    const judge = client(a); await judge.post('login', judgeAccount);
    assert.equal((await judge.snapshot()).user.role, 'judge');
    await client(b).post('login', judgeAccount, 401);
    assert.equal((await judge.get('files/' + payment.receiptId)).status, 403);
  });
  await t.test('tarifas y categorías se modifican únicamente en el evento elegido', async () => {
    const beforeB = await adminB.snapshot();
    await adminA.post('settings', { ...(await adminA.snapshot()).settings, fullPassFee: '210000', registrationOpen: 'on', categoryRegistrationOpen: 'on' });
    await adminA.post('category', { id: 'especial-a', name: 'Especial A', rhythm: 'Salsa', modality: 'Solista', division: 'Abierta', fee: 75000, deadline: '', active: 'on' });
    const afterB = await adminB.snapshot(); assert.deepEqual(afterB.settings, beforeB.settings); assert.deepEqual(afterB.categories, beforeB.categories);
    assert.equal((await participantA.snapshot()).participants[0].fullPassFee, 180000);
    const afterRoot = await owner.snapshot(); for (const key of ['settings','participants','enrollments','payments','scores','categories','judges','audit']) assert.deepEqual(afterRoot[key], original[key]);
  });
  await t.test('calificaciones, programación y resultados definitivos no se comparten', async () => {
    const judge = client(a); await judge.post('login', { email: 'judge@example.test', password: 'JuradoPrueba1234' });
    await adminA.post('schedule', { id: '', categoryId: 'salsa-solista', startAt: '2027-01-10T18:00:00-05:00', duration: '15', stage: 'Principal', status: 'planned', note: '' });
    const slot = (await adminA.snapshot()).schedule[0];
    await adminA.post('schedule', { ...slot, status: 'live' });
    await judge.post('score', { enrollmentId: entry.id, values: JSON.stringify([9,9,9,9,9,9]) });
    await adminA.post('schedule', { ...slot, status: 'finished' });
    const results = await (await client(a).get('results')).json();
    assert.equal(results.categories[0].rows[0].value, 9);
    assert.equal(results.categories[0].rows[0].position, 1);
    assert.deepEqual((await adminB.snapshot()).scores, []);
    assert.deepEqual((await adminB.snapshot()).schedule, []);
    assert.deepEqual((await (await client(b).get('results')).json()).categories, []);
    assert.deepEqual((await owner.snapshot()).scores, original.scores);
  });
  await t.test('rutas dedicadas, eventos inválidos y páginas públicas sin datos privados', async () => {
    for (const suffix of ['', '/registro','/acceso','/admin','/participante','/resultados','/inscripciones/' + entry.id]) assert.equal((await fetch(root + '/j2rankia/eventos/' + a + suffix)).status, 200);
    assert.equal((await fetch(root + '/j2rankia/eventos/no-existe')).status, 404);
    assert.equal((await fetch(root + '/api/baile/eventos/no-existe/snapshot')).status, 404);
    assert.equal(existsSync(path.join(dir,'events','no-existe')), false);
    assert.equal((await fetch(root + '/api/baile/eventos/' + a)).status, 404);
    const publicState = await client(a).snapshot(); assert.equal(publicState.user, null); assert.deepEqual(publicState.participants, []); assert.deepEqual(publicState.payments, []);
    const results = await (await client(b).get('results')).json(); assert.deepEqual(results.categories, []);
  });
  await t.test('The Sun Fest: planes, precios históricos, permisos y pases de acompañante', async () => {
    const event = 'thesunfest', admin = client(event);
    await admin.post('login', credentials);
    const initial = await admin.snapshot(), originalOther = await adminB.snapshot();
    assert.deepEqual(initial.settings.passPlans.map(p => [p.id, p.fee, p.canCompete]), [['competidor',70000,true],['congreso',95000,true],['acompanante',20000,false]]);
    assert.deepEqual(initial.categories.map(c => c.fee), [80000,105000,250000]);
    assert.match(initial.settings.pricingNote, /prueba/);
    const people = {};
    for (const [index, plan] of initial.settings.passPlans.entries()) {
      const who = client(event), person = { ...info, email: 'plan'+index+'@example.test', document: 'SUNFEST'+index, passId: plan.id };
      await who.post('register', person, 201);
      const state = await who.snapshot(), p = state.participants[0];
      assert.equal(p.fullPassFee, plan.fee); assert.equal(p.pass.id, plan.id);
      assert.equal(state.payments[0].amount, plan.fee);
      await admin.post('review', { paymentId: state.payments[0].id, status: 'approved', note: '' });
      people[plan.id] = who;
      if (!plan.canCompete) {
        assert.doesNotMatch(p.registration.waiver.text, /suscrito COMPETIDOR/);
        assert.match(p.registration.waiver.text, /acompañante/);
        await who.post('enroll', { categoryId:'solista',team:'',members:'' },403);
      } else {
        assert.match(p.registration.waiver.text, new RegExp(plan.name));
        for (const cat of initial.categories) {
          const entry = await who.post('enroll', { categoryId: cat.id, team:'Equipo prueba',members:'Integrantes de prueba' },201);
          assert.equal(entry.fee, cat.fee);
        }
      }
    }
    await client(event).post('register', { ...info, document:'INVALID123',passId:'no-existe' },400);
    await client(event).post('register', { ...info, document:'STALE123',passId:'congreso',fullPassFee:20000 },409);
    await people.competidor.post('pass-plan', {},403);
    await admin.post('contractor', { name:'Gestor', email:'gestor@example.test', password:'GestorPrueba1234' });
    const staff=client(event); await staff.post('login',{email:'gestor@example.test', password:'GestorPrueba1234'});
    await staff.post('pass-plan',{},403);
    const plan = initial.settings.passPlans[0];
    const fields = { ...plan, benefits: plan.benefits.join('\n'), active:'on',canCompete:'on',fee:71000 };
    await admin.post('pass-plan', fields);
    assert.equal((await people.competidor.snapshot()).participants[0].fullPassFee,70000);
    assert.equal((await people.competidor.snapshot()).payments[0].amount,70000);
    assert.equal((await admin.snapshot()).settings.passPlans[0].fee,71000);
    await admin.post('pass-plan', {...fields,canCompete:'',benefits:'Nuevo beneficio'});
    assert.equal((await people.competidor.snapshot()).participants[0].pass.canCompete,true);
    await admin.post('pass-plan',{...fields,active:''});
    await client(event).post('register',{...info,document:'CLOSED123',passId:'competidor'},400);
    await admin.post('pass-plan',fields);
    await admin.post('pass-plan',{...fields,validUntil:'2026-02-30'},400);
    await admin.post('pass-plan',{...fields,fee:-1},400);
    const newPerson = client(event);
    await newPerson.post('register',{...info,document:'NEWPRICE123',passId:'competidor'},201);
    assert.equal((await newPerson.snapshot()).participants[0].fullPassFee,71000);
    const manual = await admin.post('admin-register',{...info,email:'manual@example.test',document:'MANUAL123',passId:'acompanante'},201);
    assert.equal((await admin.snapshot()).participants.find(p => p.id===manual.participantId).fullPassFee,20000);
    assert.deepEqual((await adminB.snapshot()).settings,originalOther.settings);
    assert.deepEqual((await adminB.snapshot()).participants,originalOther.participants);
    assert.deepEqual((await owner.snapshot()).settings,original.settings);
    // Real registrations may not reuse expired reference rates, even with forged client values.
    const db = new DatabaseSync(path.join(dir,'events',event,'event.sqlite'));
    const saved = JSON.parse(db.prepare('SELECT data FROM state WHERE id=1').get().data);
    saved.settings.demo=false;
    db.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(saved));
    await client(event).post('register',{...info,email:'expired@example.test',document:'EXPIRED123',passId:'competidor'},400);
    saved.settings.demo=true; db.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(saved)); db.close();
  });
  await t.test('persistencia por evento tras reinicio y revocación del administrador global', async () => {
    const sa = await adminA.snapshot(), sb = await adminB.snapshot();
    const stopped = new Promise(r => server.once('exit', r)); server.kill('SIGTERM'); await stopped; server = start(); await ready();
    assert.deepEqual((await adminA.snapshot()).participants, sa.participants); assert.deepEqual((await adminB.snapshot()).participants, sb.participants);
    assert.equal((await participantA.get('files/' + trackId)).status, 200);
    const db = new DatabaseSync(path.join(dir,'event.sqlite')); const state = JSON.parse(db.prepare('SELECT data FROM state WHERE id=1').get().data);
    state.users.find(u => u.id === original.user.id).passwordHash += 'changed';
    db.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(state)); db.close();
    assert.equal((await adminA.snapshot()).user, null); assert.equal((await adminB.snapshot()).user, null);
    assert.equal((await participantA.snapshot()).user.role, 'participant');
  });
});
