import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import ts from 'typescript';

test('Crear eventos: publicación, aislamiento, accesos, tarifas y persistencia', { timeout: 120000 }, async t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'baile-create-event-'));
  const root = 'http://127.0.0.1:33229', env = { ...process.env, BAILE_DATA_DIR: dir, NODE_ENV: 'production' };
  let server;
  async function start() {
    server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '33229'], { env, stdio: 'ignore' });
    for (let i = 0; i < 100; i++) { try { if ((await fetch(root + '/api/baile/public')).ok) return; } catch {} await new Promise(r => setTimeout(r, 100)); }
    throw Error('Server did not start');
  }
  await start(); t.after(() => server.kill('SIGTERM'));
  const credentials = JSON.parse(execFileSync(process.execPath, ['scripts/baile-admin.cjs'], { env, encoding: 'utf8' }));
  function client(event = '') {
    let cookie = ''; const api = root + '/api/baile' + (event ? '/eventos/' + event : '');
    return {
      async post(action, fields = {}, status = 200, origin = root) {
        const f = new FormData(); for (const [k, v] of Object.entries(fields)) f.append(k, v);
        const r = await fetch(api + '/' + action, { method: 'POST', headers: { origin, cookie }, body: f });
        const data = await r.json(); assert.equal(r.status, status, `${action}: ${JSON.stringify(data)}`);
        if (r.headers.get('set-cookie')) cookie = r.headers.get('set-cookie').split(';')[0]; return data;
      },
      async get(action = 'snapshot') { const r = await fetch(api + '/' + action, { headers: { cookie } }); assert.equal(r.status, 200); return r.json(); },
    };
  }
  const guest = client(), admin = client(); await admin.post('login', credentials);
  const before = await admin.get();
  const draft = {
    id: 'festival-prueba-2099', name: 'Festival de integración', category: 'Danza', genre: 'Salsa', tagline: 'Prueba de aislamiento', description: 'Un evento independiente para pruebas.',
    start: '2099-11-10', end: '2099-11-12', city: 'Santa Marta', venue: 'Teatro de prueba, calle 10', imageAlt: 'Portada de prueba', demo: false,
    registrationOpen: false, categoryRegistrationOpen: false, paymentInstructions: 'Usar únicamente comprobantes ficticios.', scoring: 'sunfest-v1',
    passes: [{ name: 'Competidor', fee: '32000', benefits: 'Talleres\nDerecho de competidor', canCompete: true, validUntil: '' }, { name: 'Acompañante', fee: '12000', benefits: 'Ver competencia', canCompete: false, validUntil: '' }],
    categories: [{ name: 'Salsa solista', modality: 'Solista', rhythm: 'Salsa', division: 'Amateur', fee: '88000', deadline: '2099-11-09T18:00', validUntil: '2099-11-10' }],
    contractor: { name: 'Contratista', email: 'contratista@example.test', password: 'prueba-contratista-123' },
    judges: [{ name: 'Jurado', email: 'jurado@example.test', password: 'prueba-jurado-123', categories: [0] }],
  };
  const fields = d => ({ event: JSON.stringify(d), confirm: 'publish', cover: file() });
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64');
  const file = () => new File([png], 'portada.png', { type: 'image/png' });
  await t.test('sin autorización, sin confirmación o con datos inválidos no crea nada', async () => {
    await guest.post('create-event', fields(draft), 401);
    await admin.post('create-event', fields(draft), 403, 'https://otro.example');
    await admin.post('create-event', { event: JSON.stringify(draft) }, 400);
    await admin.post('create-event', { event: 'bad json', confirm: 'publish' }, 400);
    await admin.post('create-event', { event: JSON.stringify(draft), confirm: 'publish' }, 400);
    for (const delta of [{ id: '../escape' }, { id: 'ab' }, { end: '2099-11-01' }, { passes: [] }, { categories: [] }, { scoring: 'inventado' }, { demo: 'false' }, { contractor: { ...draft.contractor, password: '123' } }, { passes: [{ ...draft.passes[0], fee: '12.5' }] }, { passes: [{ ...draft.passes[0], canCompete: false }] }, { categories: [{ ...draft.categories[0], deadline: '2099-11-09T25:99' }] }]) {
      await admin.post('create-event', fields({ ...draft, ...delta }), 400);
    }
    await admin.post('create-event', fields({ ...draft, id: 'thesunfest' }), 409);
    await admin.post('create-event', { ...fields(draft), cover: new File(['<svg/>'], 'unsafe.png', { type: 'image/png' }) }, 400);
    assert.equal((await guest.get()).events.length, before.events.length);
  });
  await t.test('crea página, portada, pases, categorías y cuentas sin filtrar secretos', async () => {
    const created = await admin.post('create-event', { ...fields(draft), cover: file() }, 201);
    assert.equal(created.eventUrl, '/prueba-baile/eventos/' + draft.id);
    await admin.post('create-event', fields(draft), 409);
    const publicState = await client(draft.id).get();
    assert.equal(publicState.settings.name, draft.name);
    assert.equal(publicState.settings.scoringScheme, 'sunfest-v1');
    assert.equal(publicState.settings.registrationOpen, false);
    assert.equal(publicState.categories[0].fee, 88000);
    assert.equal(publicState.categories[0].deadline, '2099-11-09T23:00:00.000Z');
    assert.deepEqual(publicState.settings.passPlans.map(p => p.fee), [32000, 12000]);
    assert.ok((await guest.get()).events.some(e => e.id === draft.id));
    assert.ok(!JSON.stringify(publicState).includes(draft.contractor.password));
    assert.ok(!JSON.stringify(publicState).includes('passwordHash'));
    assert.deepEqual(publicState.participants, []);
    const landing = await fetch(root + created.eventUrl); assert.equal(landing.status, 200);
    const html = await landing.text(); assert.ok(html.includes(draft.venue)); assert.ok(html.includes(draft.name));
    const cover = await fetch(root + '/api/baile/event-cover/' + draft.id);
    assert.equal(cover.headers.get('content-type'), 'image/png'); assert.deepEqual(Buffer.from(await cover.arrayBuffer()), png);
    const owner = client(draft.id); await owner.post('login', credentials);
    assert.equal((await owner.get()).judges.length, 1);
    assert.equal((await owner.get()).payments.length, 0);
    const contractor = client(draft.id); await contractor.post('login', draft.contractor);
    assert.equal((await contractor.get()).user.role, 'contractor');
    await contractor.post('create-event', fields({ ...draft, id: 'denied-event' }), 403);
    const judge = client(draft.id); await judge.post('login', draft.judges[0]);
    assert.deepEqual((await judge.get()).user.categories, ['categoria-1']);
    await judge.post('create-event', fields({ ...draft, id: 'denied-event' }), 403);
    await client('encuentro-salsa').post('login', draft.contractor, 401);
  });
  await t.test('registro real del flujo, precio correcto y comprobantes aislados', async () => {
    const owner = client(draft.id); await owner.post('login', credentials);
    const source = readFileSync('src/lib/baile/registration.ts', 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
    const { waiverText } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
    let settings = (await owner.get()).settings;
    const dancer = client(draft.id), plan = settings.passPlans[0];
    const registration = { name: 'Persona Prueba', firstName: 'Persona', lastName: 'Prueba', email: 'persona@example.test', document: 'TESTNEW01', documentConfirm: 'TESTNEW01', documentType: 'CC', birthDate: '2000-01-01', city: 'Santa Marta', phone: '3053560953', callingCode: '+57', country: 'Colombia', sex: 'Otro', academy: 'Academia de prueba', salsa: 'Amateur', bachata: 'No aplica', extra: '', guardianName: '', guardianDocument: '', password: 'Prueba-persona-123', passwordConfirm: 'Prueba-persona-123', waiverAccepted: 'on', signature: JSON.stringify([[[10,20],[40,50],[80,20]]]), waiverText: waiverText(settings, 'Persona Prueba', 'TESTNEW01', plan), fullPassFee: '32000', passId: 'pase-1', reference: 'PRUEBA', receipt: file(), photo: file() };
    await dancer.post('register', registration, 400);
    await owner.post('settings', { ...settings, registrationOpen: 'on', categoryRegistrationOpen: 'on' });
    settings = (await owner.get()).settings;
    await dancer.post('register', { ...registration, consent: 'on' }, 201);
    const s = await owner.get(); assert.equal(s.participants.length, 1); assert.equal(s.payments[0].amount, 32000);
    await dancer.post('create-event', fields({ ...draft, id: 'denied-event' }), 403);
    await owner.post('review', { paymentId: s.payments[0].id, status: 'approved', note: 'Prueba' });
    await dancer.post('enroll', { categoryId: 'categoria-1', team: '', members: '' }, 201);
    assert.equal((await owner.get()).enrollments[0].fee, 88000);
    const after = await admin.get();
    for (const key of ['settings','participants','enrollments','payments','scores','categories','judges','audit']) assert.deepEqual(after[key], before[key]);
  });
  await t.test('reiniciar conserva el evento, cuentas, cambios y compras; no reinicializa', async () => {
    const done = once(server, 'exit'); server.kill('SIGTERM'); await done; await start();
    const owner = client(draft.id); await owner.post('login', credentials);
    const s = await owner.get(); assert.equal(s.participants.length, 1); assert.equal(s.enrollments.length, 1); assert.equal(s.settings.registrationOpen, true);
    const contractor = client(draft.id); await contractor.post('login', draft.contractor);
    assert.ok((await guest.get()).events.some(e => e.id === draft.id));
    assert.equal((await fetch(root + '/api/baile/eventos/no-existe/public')).status, 404);
  });
  await t.test('evento nuevo admite parámetros propios y jurados sin selección de categorías', async () => {
    const custom = {...draft, id:'evento-personalizado', scoring:'custom-v1', criteria:[{name:'Técnica',weight:60},{name:'Estilo',weight:40}], categories:[...draft.categories, {...draft.categories[0], modality:'Pareja'}], judges:[{...draft.judges[0],categories:[]}]};
    await admin.post('create-event',fields({...custom, criteria:[{name:'Incorrecto',weight:70}]}),400);
    await admin.post('create-event',fields(custom),201);
    const owner=client(custom.id); await owner.post('login',credentials); const state=await owner.get();
    assert.deepEqual(state.settings.criteria,custom.criteria); assert.equal(state.categories.length,2);
    assert.deepEqual(state.judges[0].categories,state.categories.map(c=>c.id));
  });
});
