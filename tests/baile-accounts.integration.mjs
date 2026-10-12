import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes, scryptSync } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

test('desactivar cuentas conserva historial y revoca todos sus accesos', { timeout: 90000 }, async t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'rankia-accounts-'));
  const root = 'http://127.0.0.1:33226';
  const env = { ...process.env, BAILE_DATA_DIR: dir, NODE_ENV: 'production' };
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '33226'], { env, stdio: 'ignore' });
  t.after(() => server.kill('SIGTERM'));
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(root + '/api/baile/public')).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Servidor de prueba disponible');
  const original = JSON.parse(execFileSync(process.execPath, ['scripts/baile-admin.cjs'], { env, encoding: 'utf8' }));
  const password = randomBytes(18).toString('hex'), salt = randomBytes(16).toString('hex');
  const hash = salt + ':' + scryptSync(password, salt, 64).toString('hex');
  execFileSync(process.execPath, ['scripts/baile-test-profiles.cjs'], { env: { ...env, BAILE_TEST_PROFILE_HASHES: JSON.stringify({ superadmin: hash, admin: hash, participante1: hash, jurado1: hash }) } });
  function client(base = '/api/baile') {
    let cookie = '';
    return {
      async post(action, fields = {}, expected = 200) {
        const form = new FormData();
        for (const [key, value] of Object.entries(fields)) for (const v of Array.isArray(value) ? value : [value]) form.append(key, v);
        const response = await fetch(root + base + '/' + action, { method: 'POST', headers: { origin: root, cookie }, body: form });
        assert.equal(response.status, expected, `${action}: ${response.status}`);
        const data = await response.json();
        if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
        return data;
      },
      async get(action) { const r = await fetch(root + base + '/' + action, { headers: { cookie } }); return { status: r.status, data: await r.json() }; },
    };
  }
  const admin = client(), oldAdmin = client(), globalAdmin = client('/api/baile/eventos/encuentro-salsa'), contractor = client(), outsider = client();
  await admin.post('login', { email: 'superadmin', password });
  await oldAdmin.post('login', original);
  await globalAdmin.post('login', original);
  await contractor.post('login', { email: 'admin', password });
  const { access } = await admin.post('example');
  const participant = client(), judge = client();
  await participant.post('login', { email: access[0].email, password: access[0].password });
  await judge.post('login', { email: access[2].email, password: access[2].password });
  const entry = (await admin.get('snapshot')).data.enrollments[0];
  await judge.post('score', { enrollmentId: entry.id, values: JSON.stringify([8,8,8,8,8,8]) });
  const db = new DatabaseSync(path.join(dir, 'event.sqlite'));
  t.after(() => db.close());
  const read = () => JSON.parse(db.prepare('SELECT data FROM state WHERE id=1').get().data);
  const before = read();
  const targets = before.users.filter(u => u.email === original.email || access.some(a => a.email === u.email)).map(u => u.id);
  const filesBefore = db.prepare('SELECT * FROM files ORDER BY id').all();
  const fields = { userId: targets, confirm: 'disable', reason: 'Retirar ejemplos sin borrar el historial' };
  await outsider.post('disable-accounts', fields, 401);
  await contractor.post('disable-accounts', fields, 403);
  await participant.post('disable-accounts', fields, 403);
  await judge.post('disable-accounts', fields, 403);
  await admin.post('disable-accounts', { ...fields, confirm: '' }, 400);
  await admin.post('disable-accounts', { ...fields, userId: [...targets, 'missing'] }, 409);
  await admin.post('disable-accounts', { ...fields, userId: [...targets, 'test-profile-superadmin'] }, 409);
  assert.deepEqual(read(), before, 'Solicitudes inválidas no alteran usuarios ni historial');
  await admin.post('disable-accounts', fields);
  const after = read();
  for (const key of ['participants', 'payments', 'enrollments', 'scores', 'categories', 'notes', 'accreditations', 'schedule', 'settings']) assert.deepEqual(after[key], before[key], key);
  assert.deepEqual(db.prepare('SELECT * FROM files ORDER BY id').all(), filesBefore);
  for (const user of before.users) {
    const current = after.users.find(u => u.id === user.id);
    const expected = targets.includes(user.id) ? { ...user, disabledAt: current.disabledAt, categories: user.role === "judge" ? user.categories.filter(id => id === entry.categoryId) : user.categories } : user;
    assert.deepEqual(current, expected);
    if (targets.includes(user.id)) assert.ok(current.disabledAt);
  }
  const profiles = (await admin.get('profiles')).data.profiles;
  assert.equal(profiles.length, 4);
  assert.ok(profiles.every(p => !targets.includes(p.id)));
  for (const client of [oldAdmin, globalAdmin, participant, judge]) assert.equal((await client.get('snapshot')).data.user, null);
  await oldAdmin.post('login', original, 401);
  await globalAdmin.post('login', original, 401);
  await participant.post('login', { email: access[0].email, password: access[0].password }, 401);
  await participant.post('login', { email: 'DEMO1', password: access[0].password }, 401);
  await admin.post('switch-profile', { profileId: targets.find(id => before.users.find(u => u.id === id)?.email === access[2].email) }, 401);
  assert.equal((await admin.get('snapshot')).data.user.username, 'superadmin');
  assert.equal((await contractor.get('snapshot')).data.user.username, 'admin');
  await admin.post('disable-accounts', fields);
  assert.deepEqual(read(), after, 'Operación idempotente');
  assert.ok((await admin.get('users')).data.users.filter(u => u.disabledAt).length === targets.length);
});
