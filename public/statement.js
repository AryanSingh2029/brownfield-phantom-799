const eventLabels = {
  authorisation: 'Authorised',
  capture: 'Posted',
  refund: 'Refunded',
};

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

const statementTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatMoney(paise) {
  return currency.format(paise / 100);
}

export function formatStatementTime(timestamp) {
  return statementTime.format(new Date(timestamp));
}

// A statement row describes one event received by the existing app.
export function buildStatement(events) {
  return events
    .map((event) => ({ ...event, label: eventLabels[event.type] ?? 'Unknown event' }))
    .sort((first, second) => Date.parse(second.occurredAt) - Date.parse(first.occurredAt));
}
