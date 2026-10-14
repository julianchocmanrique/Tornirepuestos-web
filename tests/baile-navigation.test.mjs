import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/app/j2rankia/admin-navigation.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { adminModules, contractorModules, normalizeModuleHash } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('organización y contratista no tienen un módulo Pagos duplicado', () => {
  for (const modules of [adminModules, contractorModules]) {
    assert.equal(modules.some(m => m.id === 'pagos' || m.name === 'Pagos'), false);
    assert.equal(modules.filter(m => m.id === 'inscripciones').length, 1);
    assert.equal(new Set(modules.map(m => m.id)).size, modules.length);
  }
});

test('los enlaces antiguos de pagos llevan a inscripciones', () => {
  assert.equal(normalizeModuleHash('#pagos'), 'inscripciones');
  assert.equal(normalizeModuleHash('pagos'), 'inscripciones');
  for (const id of ['registros', 'inscripciones', 'contabilidad', 'ajustes', '']) {
    assert.equal(normalizeModuleHash(`#${id}`), id);
  }
});

test('Full Pass y contabilidad conservan sus puntos de acceso', () => {
  assert.ok(adminModules.some(m => m.id === 'registros'));
  assert.ok(adminModules.some(m => m.id === 'contabilidad'));
  assert.ok(contractorModules.some(m => m.id === 'registros'));
});

test("Registro aparece antes de Inscripciones y conserva enlaces anteriores", () => {
  for (const modules of [adminModules, contractorModules]) {
    assert.equal(modules.find(m => m.id === "registros").name, "Registro");
    assert.ok(modules.findIndex(m => m.id === "registros") < modules.findIndex(m => m.id === "inscripciones"));
  }
  assert.equal(normalizeModuleHash("#participantes"), "registros");
  assert.equal(normalizeModuleHash("#registro"), "registros");
});

test('Jurados aparece debajo de Inscripciones sin ampliar permisos del contratista', () => {
  assert.equal(adminModules.findIndex(m => m.id === 'jurados'), adminModules.findIndex(m => m.id === 'inscripciones') + 1);
  assert.equal(contractorModules.some(m => m.id === 'jurados'), false);
});

test('superadministración no muestra Acreditación y sus enlaces antiguos abren Resumen', () => {
  assert.equal(adminModules.some(m => m.id === 'acreditacion' || m.name === 'Acreditación'), false);
  assert.equal(adminModules.findIndex(m => m.id === 'contabilidad'), adminModules.findIndex(m => m.id === 'jurados') + 1);
  assert.equal(normalizeModuleHash('#acreditacion'), 'resumen');
  assert.equal(normalizeModuleHash('acreditacion'), 'resumen');
});

test('Crear evento está disponible únicamente para superadministración', () => {
  assert.equal(adminModules.filter(m => m.id === 'crear-evento').length, 1);
  assert.equal(adminModules.findIndex(m => m.id === 'crear-evento'), 1);
  assert.equal(contractorModules.some(m => m.id === 'crear-evento'), false);
});
