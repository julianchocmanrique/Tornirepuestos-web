import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('RANKIA: nueva URL, redirecciones profundas, sesiones y datos intactos', { timeout: 90000 }, async t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'rankia-url-'));
  const root = 'http://127.0.0.1:33479';
  const env = { ...process.env, BAILE_DATA_DIR: dir, NODE_ENV: 'production' };
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '33479'], { env, stdio: 'ignore' });
  t.after(() => server.kill('SIGTERM'));
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(root + '/api/baile/public')).ok) { ready = true; break; } } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  assert.ok(ready);
  const credentials = JSON.parse(execFileSync(process.execPath, ['scripts/baile-admin.cjs'], {env, encoding:'utf8'}));
  const form = new FormData(); for (const [key, value] of Object.entries(credentials)) form.set(key, value);
  const login = await fetch(root + '/api/baile/login', { method:'POST', headers:{origin:root}, body:form });
  assert.equal(login.status, 200);
  assert.match(login.headers.get('set-cookie'), /Path=\//i);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const snapshot = () => fetch(root + '/api/baile/snapshot', {headers:{cookie}}).then(r => r.json());
  const before = await snapshot(); assert.equal(before.user.role, 'superadmin');
  const suffixes = ['', '/registro', '/acceso', '/participante', '/admin', '/contratista', '/jurado', '/resultados', '/inscripciones/prueba', '/eventos/encuentro-salsa', '/eventos/encuentro-salsa/registro', '/eventos/encuentro-salsa/acceso', '/eventos/encuentro-salsa/participante', '/eventos/encuentro-salsa/admin', '/eventos/encuentro-salsa/contratista', '/eventos/encuentro-salsa/jurado', '/eventos/encuentro-salsa/resultados', '/eventos/encuentro-salsa/inscripciones/prueba'];
  await t.test('cada enlace anterior redirige con estado permanente y conserva parámetros', async () => {
    for (const suffix of suffixes) {
      const old = await fetch(root + '/prueba-baile' + suffix + '?origen=enlace%20anterior&test=1', {redirect:'manual', headers:{cookie}});
      assert.equal(old.status, 308, suffix);
      const next = new URL(old.headers.get('location'), root);
      assert.equal(next.pathname, '/j2rankia' + suffix);
      assert.equal(next.searchParams.get('origen'), 'enlace anterior'); assert.equal(next.searchParams.get('test'), '1');
      const response = await fetch(next, {headers:{cookie}}); assert.equal(response.status, 200, next.href);
      assert.equal(response.redirected, false, 'La nueva ruta no depende de una redirección adicional');
    }
    assert.equal((await fetch(root + '/prueba-baile-otra', {redirect:'manual'})).status, 404);
    assert.equal((await fetch(root + '/j2rankia/vista-inexistente')).status, 404);
    assert.equal((await fetch(root + '/j2rankia/eventos/no-existe')).status, 404);
  });
  await t.test('metadatos y navegación usan la nueva URL sin cabecera comercial', async () => {
    const home = await (await fetch(root + '/j2rankia')).text();
    assert.match(home, /rel="canonical" href="https:\/\/tornirepuestos.com\/j2rankia"/);
    assert.match(home, /property="og:url" content="https:\/\/tornirepuestos.com\/j2rankia"/);
    assert.ok(!home.includes('href="/catalogo"'));
    assert.ok(!home.includes('/prueba-baile'));
    const event = await (await fetch(root + '/j2rankia/eventos/encuentro-salsa')).text();
    assert.ok(event.includes('href="/j2rankia/eventos/encuentro-salsa/registro"'));
    assert.ok(event.includes('href="/j2rankia"'));
    assert.ok(!event.includes('/prueba-baile'));
    assert.equal((await fetch(root + '/baile/rankia-mark.svg')).status, 200);
    assert.equal((await fetch(root + '/')).status, 200);
    assert.equal((await fetch(root + '/contacto')).status, 200);
  });
  await t.test('conserva API, sesión y estado del evento original', async () => {
    assert.deepEqual(await snapshot(), before);
    const result = await fetch(root + '/api/baile/results'); assert.equal(result.status, 200);
  });
});
