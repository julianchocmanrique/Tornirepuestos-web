import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/baile/types.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { initialState, migrateState } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));

test('RANKIA es la identidad predeterminada', () => {
  assert.equal(initialState().settings.name, 'RANKIA');
  assert.equal(initialState().settings.tagline, 'Tu talento en el podio.');
});

test('la migración conserva usuarios, pagos, firmas y demás datos históricos', () => {
  const s = initialState();
  s.settings.name = 'Ritmo Caribe';
  s.settings.tagline = 'Tu talento tiene escenario.';
  s.users.push({ id: 'same-user', role: 'participant', passwordHash: 'unchanged' });
  s.participants.push({ id: 'same-user', fullPassFee: 180000, registration: { waiver: { text: 'Carta firmada de Ritmo Caribe', acceptedAt: '2026-10-11' } } });
  s.payments.push({ id: 'same-payment', amount: 180000, receiptId: 'same-file' });
  const expected = structuredClone(s);
  expected.settings.name = 'RANKIA';
  expected.settings.tagline = 'Tu talento en el podio.';
  assert.deepEqual(migrateState(s), expected);
  assert.deepEqual(migrateState(s), expected);
});

test('no cambia nombres ni lemas personalizados de los eventos', () => {
  for (const name of ['Caribe Salsa Festival', 'Mi evento', 'RANKIA']) {
    const s = initialState();
    s.settings.name = name;
    s.settings.tagline = 'Lema del organizador';
    assert.deepEqual(migrateState(structuredClone(s)), s);
  }
  const s = initialState();
  s.settings.name = 'Ritmo Caribe';
  s.settings.tagline = 'Lema del organizador';
  assert.equal(migrateState(s).settings.tagline, 'Lema del organizador');
});

test('marca compartida en inicio y eventos, sin estilos globales sobre la tienda', () => {
  for (const file of ['DanceApp.tsx', 'eventos/[eventId]/page.tsx']) {
    const content = readFileSync(new URL('../src/app/prueba-baile/' + file, import.meta.url), 'utf8');
    assert.match(content, /<RankiaBrand \/>/);
    assert.doesNotMatch(content, /Ritmo Caribe/);
  }
  const css = readFileSync(new URL('../src/app/prueba-baile/rankia.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /(?:^|\n)(?:body|html|:root)\s*\{/);
  assert.match(css, /prefers-reduced-motion/);
});
