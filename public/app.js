import { buildStatement, formatMoney, formatStatementTime } from './statement.js';

const $ = (id) => document.getElementById(id);
const caseButtons = new Map();
let cases = [];
let activeCase;
let selectedEventId;

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderCaseButtons() {
  $('case-list').replaceChildren();
  caseButtons.clear();

  for (const supportCase of cases) {
    const button = element('button', '', 'case-button');
    button.type = 'button';
    button.append(
      element('span', supportCase.label, 'case-number'),
      element('span', supportCase.customer, 'case-customer'),
    );
    button.addEventListener('click', () => selectCase(supportCase));
    $('case-list').append(button);
    caseButtons.set(supportCase.id, button);
  }
}

function selectCase(supportCase) {
  activeCase = supportCase;
  selectedEventId = undefined;
  $('case-meta').textContent = `${supportCase.label} · ${supportCase.customer} · Card ending ${supportCase.cardEnding}`;
  $('case-report').textContent = `“${supportCase.report}”`;

  for (const [id, button] of caseButtons) {
    button.setAttribute('aria-pressed', String(id === supportCase.id));
  }

  renderStatement();
}

function renderStatement() {
  const entries = buildStatement(activeCase.events);
  const statement = $('statement');
  statement.replaceChildren();
  $('empty-statement').hidden = entries.length > 0;
  $('entry-count').textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · IST`;

  const selected = entries.find(({ id }) => id === selectedEventId) ?? entries[0];
  selectedEventId = selected?.id;

  for (const entry of entries) {
    const row = document.createElement('li');
    const button = element('button', '', 'statement-row');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(entry.id === selectedEventId));
    const merchant = element('span', '', 'merchant');
    merchant.append(element('span', entry.merchant), element('span', formatStatementTime(entry.occurredAt), 'row-time'));
    button.append(merchant, element('span', entry.label, 'entry-status'), element('span', displayAmount(entry), 'row-amount'));
    button.addEventListener('click', () => {
      selectedEventId = entry.id;
      for (const sibling of statement.querySelectorAll('button')) {
        sibling.setAttribute('aria-pressed', String(sibling === button));
      }
      renderEntry(entry);
      if (window.matchMedia('(max-width: 680px)').matches) $('entry-title').focus();
    });
    row.append(button);
    statement.append(row);
  }

  renderEntry(selected);
}

function displayAmount({ amountPaise, type }) {
  return (type === 'refund' ? '+' : '') + formatMoney(amountPaise);
}

function renderEntry(entry) {
  const detail = $('entry-detail');
  if (!entry) {
    detail.replaceChildren(element('p', 'Choose an entry to see its payment reference.', 'muted'));
    return;
  }

  const fields = [
    ['Event', entry.label],
    ['Payment reference', entry.paymentRef],
    ['Event ID', entry.id],
    ['Event time (IST)', formatStatementTime(entry.occurredAt)],
  ];
  const facts = document.createElement('dl');
  for (const [label, value] of fields) {
    const field = document.createElement('div');
    field.append(element('dt', label), element('dd', value));
    facts.append(field);
  }

  const amount = element('p', displayAmount(entry), 'detail-amount');
  detail.replaceChildren(amount, element('p', entry.merchant, 'detail-merchant'), facts);
}

async function loadCases() {
  $('load-error').hidden = true;
  $('case-meta').textContent = 'Loading support cases…';
  try {
    const response = await fetch('/api/cases');
    if (!response.ok) throw new Error('Case endpoint unavailable');
    cases = await response.json();
    if (cases.length === 0) {
      $('case-meta').textContent = 'No support cases are available.';
      return;
    }
    renderCaseButtons();
    selectCase(cases[0]);
    $('case-content').hidden = false;
  } catch (error) {
    console.error(error);
    $('case-meta').textContent = 'Support simulator';
    const retry = element('button', 'Retry', 'retry');
    retry.type = 'button';
    retry.addEventListener('click', loadCases);
    $('load-error').replaceChildren(element('p', 'Could not load the workshop cases.'), retry);
    $('load-error').hidden = false;
  }
}

loadCases();
