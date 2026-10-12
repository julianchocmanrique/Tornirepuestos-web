import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/baile/registration-report.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { registrationRhythm } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const s = {
  enrollments: [{ participantId: 'one', categoryId: 's1' }, { participantId: 'one', categoryId: 's2' }, { participantId: 'other', categoryId: 'b1' }],
  categories: [{ id: 's1', rhythm: 'Salsa', division: 'Abierta' }, { id: 's2', rhythm: 'SALSA', division: 'Abierta' }, { id: 'b1', rhythm: 'Bachata', division: 'Principiantes' }],
};
test('muestra divisiones reales sin duplicados ni inventar niveles', () => {
  assert.equal(registrationRhythm(s, 'one', 'Salsa'), 'Abierta');
  assert.equal(registrationRhythm(s, 'one', 'Bachata'), 'Sin inscripción');
  assert.equal(registrationRhythm(s, 'other', 'Bachata'), 'Principiantes');
});
test('registros sin categorías y datos incompletos tienen texto explícito', () => {
  assert.equal(registrationRhythm(s, 'unknown', 'Salsa'), 'Sin inscripción');
  assert.equal(registrationRhythm({ ...s, categories: [{ id: 's1', rhythm: 'Salsa', division: '' }] }, 'one', 'Salsa'), 'Sin definir');
});
