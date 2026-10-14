import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function moduleUrl(source) {
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
}
const draftUrl = moduleUrl(readFileSync(new URL('../src/lib/baile/event-draft.ts', import.meta.url), 'utf8'));
const { newEventDraft } = await import(draftUrl);
const paymentUrl = moduleUrl(readFileSync(new URL("../src/lib/baile/payment-method.ts", import.meta.url), "utf8"));
const storageSource = readFileSync(new URL('../src/lib/baile/event-draft-storage.ts', import.meta.url), 'utf8').replace('"./event-draft"', JSON.stringify(draftUrl)).replace('"./payment-method"', JSON.stringify(paymentUrl));
const { withoutPasswords, restoreDraft } = await import(moduleUrl(storageSource));

test('payment method draft survives refresh, accepts incomplete fields and keeps legacy drafts', () => {
  const draft = newEventDraft();
  draft.paymentMethod = { type: 'Llave', entity: '', holder: '', destination: '@PRUEBA', accountType: '' };
  assert.deepEqual(restoreDraft({ version: 1, draft: withoutPasswords(draft) }).draft.paymentMethod, draft.paymentMethod);
  delete draft.paymentMethod;
  assert.equal(restoreDraft({ version: 1, draft }).draft.paymentMethod, null);
  assert.throws(() => restoreDraft({ version: 1, draft: { ...draft, paymentMethod: { type: 'wrong' } } }));
});

test('draft persists incomplete data but never team passwords', () => {
  const draft = newEventDraft();
  draft.name = 'Festival';
  draft.contractor = { name: 'Organizer', email: 'organizer@example.test', password: 'private-secret' };
  draft.judges = [{ name: 'Judge', email: 'judge@example.test', password: 'another-secret', categories: [0] }];
  const stored = withoutPasswords(draft);
  assert.ok(!JSON.stringify(stored).includes('secret'));
  assert.equal(draft.contractor.password, 'private-secret');
  const restored = restoreDraft({ version: 1, draft: stored, step: 5 });
  assert.equal(restored.step, 5);
  assert.equal(restored.draft.name, 'Festival');
  assert.equal(restored.draft.contractor.password, '');
  assert.equal(restored.draft.judges[0].password, '');
  assert.deepEqual(restored.draft.judges[0].categories, [0]);
});

test('legacy credentials are ignored and step is bounded', () => {
  const draft = newEventDraft();
  draft.contractor = { name: '', email: '', password: 'legacy-secret' };
  assert.equal(restoreDraft({ version: 1, draft, step: 99 }).step, 6);
  assert.equal(restoreDraft({ version: 1, draft, step: -2 }).step, 0);
  assert.equal(restoreDraft({ version: 1, draft }).draft.contractor.password, '');
});

test('malformed browser records fail safely', () => {
  for (const row of [null, {}, { version: 2, draft: newEventDraft() },
    { version: 1, draft: { ...newEventDraft(), passes: [] } },
    { version: 1, draft: { ...newEventDraft(), categories: null } },
    { version: 1, draft: { ...newEventDraft(), name: 123 } },
    { version: 1, draft: { ...newEventDraft(), judges: [{ name: '', email: '', categories: [999] }] } },
  ]) assert.throws(() => restoreDraft(row));
});

test('custom criteria survive reload; old drafts keep preset behavior', () => {
  const draft = newEventDraft(); draft.scoring = 'custom-v1'; draft.criteria = [{name:'Técnica',weight:75},{name:'Proyección',weight:25}];
  assert.deepEqual(restoreDraft({version:1, draft:withoutPasswords(draft), step:4}).draft.criteria, draft.criteria);
  delete draft.criteria; draft.scoring = 'average';
  assert.equal(restoreDraft({version:1, draft, step:4}).draft.criteria, null);
});
