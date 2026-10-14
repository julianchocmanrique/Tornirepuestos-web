import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const { outputText } = ts.transpileModule(readFileSync(new URL('../src/lib/baile/judge-workspace.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { judgeQueue, searchText } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const snapshot = () => ({ user: { id: 'judge' }, categories: [{ id: 'empty' }, { id: 'salsa' }, { id: 'bachata' }], enrollments: [
  { id: 'a', categoryId: 'salsa', competitionNumber: 2 },
  { id: 'b', categoryId: 'bachata', competitionNumber: 1 },
], scores: [{ enrollmentId: 'b', judgeId: 'judge', locked: true }] });

test('abre una categoría pendiente, omitiendo categorías vacías y enviadas', () => {
  const s = snapshot(), before = structuredClone(s), queue = judgeQueue(s);
  assert.equal(queue.initialCategory, 'salsa');
  assert.deepEqual(queue.pending.map(e => e.id), ['a']);
  assert.equal(queue.completed, 1);
  assert.deepEqual(s, before);
});
test('notas ajenas, desbloqueadas o de inscripciones no habilitadas no inflan el progreso', () => {
  const s = snapshot();
  s.scores.push({ enrollmentId: 'a', judgeId: 'other', locked: true }, { enrollmentId: 'a', judgeId: 'judge', locked: false }, { enrollmentId: 'missing', judgeId: 'judge', locked: true });
  assert.equal(judgeQueue(s).completed, 1);
  assert.equal(judgeQueue(s).pending.length, 1);
});
test('sin pendientes abre una categoría con competidores; sin competidores conserva acceso a las categorías', () => {
  const s = snapshot();
  s.scores.push({ enrollmentId: 'a', judgeId: 'judge', locked: true });
  assert.equal(judgeQueue(s).initialCategory, 'bachata');
  s.enrollments = [];
  assert.equal(judgeQueue(s).initialCategory, 'empty');
  assert.equal(judgeQueue(s).completed, 0);
  s.categories = [];
  assert.equal(judgeQueue(s).initialCategory, '');
});
test('busca categorías sin distinguir tildes, espacios exteriores o mayúsculas', () => {
  assert.equal(searchText('  TÉCNICA y Proyección  '), 'tecnica y proyeccion');
});
