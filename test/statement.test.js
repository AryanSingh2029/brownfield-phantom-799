import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildStatement, formatMoney, formatStatementTime } from '../public/statement.js';

const [ananya, kabir] = JSON.parse(await readFile(new URL('../data/cases.json', import.meta.url)));

test('shows both original pizza entries and retains their distinct event labels', () => {
  const pizza = buildStatement(ananya.events).filter(({ merchant }) => merchant === 'Little Oven Pizza');
  assert.deepEqual(pizza.map(({ id, label }) => [id, label]), [
    ['evt-214-2', 'Posted'],
    ['evt-214-1', 'Authorised'],
  ]);
  assert.deepEqual(pizza.map(({ paymentRef }) => paymentRef), ['PAY-A208', 'PAY-A208']);
});

test('keeps matching charges from separate payment references visible', () => {
  const pizza = buildStatement(kabir.events).filter(({ merchant }) => merchant === 'Little Oven Pizza');
  assert.deepEqual(pizza.map(({ paymentRef }) => paymentRef), ['PAY-B312', 'PAY-B311']);
});

test('sorts newest first without changing the source array', () => {
  const before = structuredClone(ananya.events);
  const rows = buildStatement(ananya.events);
  assert.equal(rows[0].id, 'evt-214-2');
  assert.equal(rows.at(-1).id, 'evt-214-4');
  assert.deepEqual(ananya.events, before);
  assert.deepEqual(buildStatement([]), []);
});

test('displays integer paise as INR and uses conference time regardless of host timezone', () => {
  assert.equal(formatMoney(79900), '₹799.00');
  assert.equal(formatMoney(125), '₹1.25');
  assert.match(formatStatementTime('2026-11-25T13:14:00Z'), /25 Nov.*18:44/);
});
