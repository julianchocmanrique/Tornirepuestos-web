import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync('src/lib/baile/registration.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { waiverText, validSignature, isMinor } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
test('carta usa el evento y la identidad, sin conservar nombres de la referencia', () => {
  const letter = waiverText({ name: 'Ritmo Caribe', eventStart: '2026-11-14', eventEnd: '2026-11-16', eventLocation: 'Santa Marta' }, 'Ana Ejemplo', 'TEST123');
  assert.match(letter, /ANA EJEMPLO/); assert.match(letter, /TEST123/);
  assert.match(letter, /14 de noviembre de 2026/); assert.match(letter, /16 de noviembre de 2026/);
  assert.match(letter, /Santa Marta/); assert.doesNotMatch(letter, /THE SUN FEST|Sogamoso|ASDA/);
  for (let i = 1; i <= 5; i++) assert.ok(letter.includes(`${i}. Que`));
});
test('sin fechas o ciudad configuradas no inventa datos', () => {
  assert.match(waiverText({ name: 'Ejemplo' }, 'Ana', 'TEST123'), /fechas que publique/);
});
test('firma vacía, puntos inválidos, desbordes y trazos mínimos', () => {
  assert.equal(validSignature([[[0,0],[20,30],[50,50]]]), true);
  for (const invalid of [[], [[[]]], [[[1,1]]], [[[1,1],[2,2],[3,3]]], [[[0,0],[NaN,0]]], [[[0,0],[900,0],[50,50]]], [[[0,0],[20,-1]]], [[[0,0],['10',3]]]]) assert.equal(validSignature(invalid), false);
  assert.equal(validSignature(Array(81).fill([[0,0],[20,30],[50,50]])), false);
});
test('representante solo para menores en fecha de Colombia', () => {
  assert.equal(isMinor('2008-10-11', '2026-10-11'), false);
  assert.equal(isMinor('2008-10-12', '2026-10-11'), true);
});
