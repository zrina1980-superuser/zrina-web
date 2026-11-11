const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'timestamp', 'index.html'), 'utf8');
const source = html.slice(html.indexOf('function partsAt('), html.indexOf('function epConv('));
const context = vm.createContext({ Intl, Date });
vm.runInContext(source, context);

test('ambiguous wall times show both possible instants in chronological order', () => {
  const result = Array.from(context.dateInZone('2026-11-01T01:30:00', 'America/New_York'));
  assert.deepEqual(result.map(ms => new Date(ms).toISOString()), ['2026-11-01T05:30:00.000Z', '2026-11-01T06:30:00.000Z']);
});

test('skipped wall times and invalid dates are rejected', () => {
  assert.throws(() => context.dateInZone('2026-03-08T02:30:00', 'America/New_York'), /does not exist/);
  assert.throws(() => context.dateInZone('2026-02-30T12:00:00', 'UTC'), /valid calendar date/);
  const result = Array.from(context.dateInZone('2026-11-11T08:00:00', 'Europe/Zagreb'));
  assert.deepEqual(result.map(ms => new Date(ms).toISOString()), ['2026-11-11T07:00:00.000Z']);
});
