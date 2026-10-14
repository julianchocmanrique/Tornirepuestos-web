import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import sharp from 'sharp';

test('Foto del competidor: miniatura privada, permisos y datos personales ocultos', { timeout: 90000 }, async t => {
  const probe = createServer(); await new Promise(r => probe.listen(0, '127.0.0.1', r));
  const port = probe.address().port; await new Promise(r => probe.close(r));
  const root = `http://127.0.0.1:${port}`, dir = mkdtempSync(path.join(tmpdir(), 'rankia-competitor-photo-'));
  const env = { ...process.env, BAILE_DATA_DIR: dir, NODE_ENV: 'production' };
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], { env, stdio: 'ignore' });
  t.after(() => server.kill('SIGTERM'));
  let ready = false;
  for (let i = 0; i < 100; i++) { try { if ((await fetch(root + '/api/baile/public')).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
  assert.ok(ready);
  const credentials = JSON.parse(execFileSync(process.execPath, ['scripts/baile-admin.cjs'], { env, encoding: 'utf8' }));
  function client(event = '') {
    let cookie = ''; const base = root + '/api/baile' + (event ? '/eventos/' + event : '');
    return {
      async post(action, values) { const body = new FormData(); for (const [k, v] of Object.entries(values)) body.set(k, v); const r = await fetch(base + '/' + action, { method: 'POST', headers: { origin: root, cookie }, body }); const data = await r.json(); assert.equal(r.status, 200, JSON.stringify(data)); if (r.headers.get('set-cookie')) cookie = r.headers.get('set-cookie').split(';')[0]; return data; },
      get(action) { return fetch(base + '/' + action, { headers: { cookie } }); },
    };
  }
  const admin = client(), judge = client(), guest = client(); await admin.post('login', credentials);
  await admin.post('judge', { id: '', name: 'Jurado', email: 'judge@test.example', password: 'JudgePhoto1234' });
  const db = new DatabaseSync(path.join(dir, 'event.sqlite')); t.after(() => db.close());
  const read = () => JSON.parse(db.prepare('SELECT data FROM state WHERE id=1').get().data);
  const write = s => db.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(s));
  const s = read(), categoryId = s.categories[0].id;
  s.participants.push({ id: 'private-person', name: 'Nombre reservado', document: 'PRIVATE-ID', registration: { photoId: 'private-photo' } });
  s.enrollments.push({ id: 'entry-photo', participantId: 'private-person', categoryId, competitionNumber: 1, team: '', members: '', musicId: null });
  s.payments.push({ id: 'pass', kind: 'fullpass', participantId: 'private-person', enrollmentId: null, status: 'approved' }, { id: 'fee', kind: 'category', participantId: 'private-person', enrollmentId: 'entry-photo', status: 'approved' });
  write(s);
  const photo = await sharp({ create: { width: 320, height: 420, channels: 3, background: '#ae3846' } }).jpeg().toBuffer();
  db.prepare('INSERT INTO files VALUES (?,?,?,?,?,?)').run('private-photo', 'private-person', 'photo', 'private-original.jpg', 'image/jpeg', photo);
  await judge.post('login', { email: 'judge@test.example', password: 'JudgePhoto1234' });
  const snapshot = await (await judge.get('snapshot')).json();
  assert.equal(snapshot.enrollments[0].hasParticipantPhoto, true);
  assert.deepEqual(snapshot.participants, []);
  for (const secret of ['private-person', 'private-photo', 'Nombre reservado', 'PRIVATE-ID']) assert.ok(!JSON.stringify(snapshot).includes(secret));
  const response = await judge.get('competitor-photo/entry-photo'); assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'private, no-store'); assert.equal(response.headers.get('content-type'), 'image/webp');
  const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata(); assert.equal(metadata.width, 512); assert.equal(metadata.exif, undefined);
  assert.equal((await guest.get('competitor-photo/entry-photo')).status, 401);
  assert.equal((await admin.get('competitor-photo/entry-photo')).status, 403);
  assert.equal((await judge.get('files/private-photo')).status, 403);
  assert.equal((await judge.get('competitor-photo/missing')).status, 404);
  assert.equal((await client('encuentro-salsa').get('competitor-photo/entry-photo')).status, 401);
  const missingPhoto = read(); delete missingPhoto.participants[0].registration; write(missingPhoto);
  assert.equal((await (await judge.get('snapshot')).json()).enrollments[0].hasParticipantPhoto, false);
  assert.equal((await judge.get('competitor-photo/entry-photo')).status, 404);
  write(s); const pending = read(); pending.payments[1].status = 'pending'; write(pending);
  assert.equal((await judge.get('competitor-photo/entry-photo')).status, 404);
  write(s); const unassigned = read(); unassigned.schedule.push({ categoryId, status: 'live' }); unassigned.users.find(u => u.role === 'judge').categories = []; write(unassigned);
  assert.equal((await judge.get('competitor-photo/entry-photo')).status, 404);
});
