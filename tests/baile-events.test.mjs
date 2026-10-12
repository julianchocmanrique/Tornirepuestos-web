import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/lib/baile/event-catalog.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { eventCatalog, latestEvents, upcomingEvents, colombiaDay, eventDate, eventHref, findEvent, slideOffset } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
test('agenda cronológica sin modificar el catálogo', () => {
  const before = JSON.stringify(eventCatalog);
  assert.deepEqual(upcomingEvents(eventCatalog, '2026-10-11').map(e => e.date), ['2026-10-24', '2026-11-14', '2026-12-05']);
  assert.equal(JSON.stringify(eventCatalog), before);
});
test('oculta eventos pasados y conserva el día completo en Colombia', () => {
  assert.equal(colombiaDay(new Date('2026-10-25T04:59:59Z')), '2026-10-24');
  assert.equal(colombiaDay(new Date('2026-10-25T05:00:00Z')), '2026-10-25');
  assert.equal(upcomingEvents(eventCatalog, '2026-10-24').length, 3);
  assert.equal(upcomingEvents(eventCatalog, '2026-10-25').length, 2);
  assert.equal(upcomingEvents(eventCatalog, '2027-01-01').length, 0);
});
test('carrusel ordenado por publicación, no por fecha de celebración', () => {
  assert.equal(latestEvents([...eventCatalog].reverse())[0].id, 'encuentro-salsa');
  assert.deepEqual(latestEvents([]), []);
});
test('fechas de calendario sin desplazamiento de zona horaria', () => {
  assert.match(eventDate('2026-11-14'), /14/);
  assert.match(eventDate('2026-11-14'), /noviembre/);
});
test('ejemplos identificados y fotografías locales disponibles', () => {
  assert.equal(new Set(eventCatalog.map(e => e.id)).size, eventCatalog.length);
  for (const e of eventCatalog) {
    assert.equal(e.demo, true);
    assert.ok(existsSync(new URL('../public' + e.image, import.meta.url)));
    assert.match(e.imageAlt, /ilustrativa/);
  }
  assert.equal(eventCatalog.filter(e => !e.demo).length, 0);
});

test('enlaces de eventos y posiciones cíclicas del carrusel', () => {
  assert.equal(eventHref('encuentro-salsa'), '/prueba-baile/eventos/encuentro-salsa');
  assert.equal(findEvent('no-existe'), undefined);
  for (const event of eventCatalog) assert.equal(findEvent(event.id), event);
  assert.deepEqual([0,1,2].map(i => slideOffset(i, 0, 3)), [0,1,-1]);
  assert.deepEqual([0,1,2].map(i => slideOffset(i, 2, 3)), [1,-1,0]);
  assert.equal(slideOffset(0,0,1), 0);
  assert.deepEqual([0,1,2,3,4].map(i => slideOffset(i,0,5)), [0,1,2,-2,-1]);
});
