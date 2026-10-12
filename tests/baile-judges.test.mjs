import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/baile/judge-policy.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { judgeDeletionBlock } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const judge = { id: 'j1', categories: ['salsa'] };
const empty = { scores: [], enrollments: [{ id: 'entry', categoryId: 'salsa' }], schedule: [] };

test('permite eliminar cuentas sin competencias iniciadas ni calificaciones', () => {
  assert.equal(judgeDeletionBlock(empty, judge), '');
  assert.equal(judgeDeletionBlock({ ...empty, scores: [{ judgeId: 'otro', enrollmentId: 'otra' }] }, judge), '');
});
test('protege notas propias, incluso desbloqueadas o con asignaciones incompletas', () => {
  for (const locked of [true, false]) assert.match(judgeDeletionBlock({ ...empty, scores: [{ judgeId: 'j1', enrollmentId: 'missing', locked }] }, judge), /ya tiene calificaciones/);
});
test('no cambia el número de jurados esperado cuando otros ya calificaron', () => {
  assert.match(judgeDeletionBlock({ ...empty, scores: [{ judgeId: 'otro', enrollmentId: 'entry' }] }, judge), /otros jurados/);
});
test('protege competencias en curso y finalizadas, no las planeadas', () => {
  for (const status of ['live', 'finished']) assert.match(judgeDeletionBlock({ ...empty, schedule: [{ categoryId: 'salsa', status }] }, judge), /iniciada o finalizada/);
  for (const status of ['planned', 'backstage', 'cancelled']) assert.equal(judgeDeletionBlock({ ...empty, schedule: [{ categoryId: 'salsa', status }] }, judge), '');
});

test('una solicitud antigua no puede calificar después de eliminar o reasignar al jurado', async () => {
  const compile = name => ts.transpileModule(readFileSync(new URL(`../src/lib/baile/${name}.ts`, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const moduleUrl = text => `data:text/javascript;base64,${Buffer.from(text).toString('base64')}`;
  const domain = compile('domain').replace('from "./types"', `from "${moduleUrl(compile('types'))}"`);
  const { saveScore } = await import(moduleUrl(domain));
  const stale = { ...judge, role: 'judge' };
  assert.throws(() => saveScore({ ...empty, users: [] }, stale, 'entry', [8, 8, 8, 8, 8, 8]), /ya no está disponible/);
  assert.throws(() => saveScore({ ...empty, users: [{ ...stale, categories: [] }] }, stale, 'entry', [8, 8, 8, 8, 8, 8]), /no asignado/);
});
