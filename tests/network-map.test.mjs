import test from 'node:test';
import assert from 'node:assert/strict';
import { findGaps, mapGapPositions, parseCidr } from '../netplanner/network.mjs';

test('map shows free gaps after merging overlaps and clipping pool boundaries', () => {
  const pool = parseCidr('10.0.0.0/24');
  const occupied = ['10.0.0.0/26', '10.0.0.32/27', '10.0.0.128/25'].map(parseCidr);
  const gaps = findGaps(pool, occupied);
  assert.deepEqual(mapGapPositions(pool, gaps), [{ start: 25, end: 50 }]);
  const partial = findGaps(pool, [parseCidr('10.0.0.0/23')]);
  assert.deepEqual(mapGapPositions(pool, partial), []);
});

test('map handles very large IPv6 pools without precision overflow', () => {
  const pool = parseCidr('2001:db8::/32');
  const gaps = findGaps(pool, [parseCidr('2001:db8::/33')]);
  assert.deepEqual(mapGapPositions(pool, gaps), [{ start: 50, end: 100 }]);
  assert.deepEqual(mapGapPositions(pool, findGaps(pool, [])), [{ start: 0, end: 100 }]);
});
