import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const { outputText } = ts.transpileModule(readFileSync(new URL('../src/lib/baile/types.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { validScore, SCORE_SCALE } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('admite los extremos de la escala y todas las centésimas intermedias', () => {
  assert.deepEqual(SCORE_SCALE, { min: 1, max: 10, step: 0.01, decimals: 2 });
  for (let i = 100; i <= 1000; i++) assert.equal(validScore(i / 100), true, `Nota ${i / 100}`);
});
test('rechaza notas fuera de rango, precisión adicional y valores no numéricos', () => {
  for (const value of [-1, 0, 0.99, 10.01, 100, 8.001, 7.555, NaN, Infinity, null, undefined, '', '8', true, [], {}]) assert.equal(validScore(value), false, String(value));
});
