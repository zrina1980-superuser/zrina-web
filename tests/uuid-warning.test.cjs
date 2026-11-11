const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'uuid', 'index.html'), 'utf8');
const script = html.slice(html.lastIndexOf('<script>') + 8, html.indexOf("$('generateV4').addEventListener"));
const context = vm.createContext({
  document: { getElementById: () => ({}) },
  btoa: text => Buffer.from(text, 'binary').toString('base64')
});
vm.runInContext(script, context);

test('all supported time-based identifiers explain timestamp limitations', () => {
  const uuid = context.inspectUuid(context.uuidBytes('018f3a2b-7c4d-7e5f-8a9b-0c1d2e3f4a5b'));
  const ulid = context.inspectUlid('01ARZ3NDEKTSV4RRFFQ69G5FAV');
  const objectId = context.inspectObjectId('507f1f77bcf86cd799439011');
  const snowflake = context.inspectSnowflake('175928847299117063', 'discord');
  for (const result of [uuid, ulid, objectId, snowflake]) {
    assert.match(result.warning, /does not prove creation time or origin/);
    assert.ok(result.rows.some(row => row[0] === 'Timestamp'));
  }
});
