const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "hostvitals", "index.html"), "utf8");
const start = source.indexOf("    function diagnosticNextSteps(report) {");
const end = source.indexOf("    function renderLiveHeroResult(report) {", start);
assert.ok(start !== -1 && end > start);
const nextSteps = vm.runInNewContext(`(${source.slice(start, end).trim()})`);

test("recommendations distinguish DNS and specific HTTP status cases", () => {
  assert.match(nextSteps({ dnsStatus: "NXDOMAIN", hostResponded: false }), /another DNS resolver/);
  assert.match(nextSteps({ gatewayResponded: true, gatewayHttpCode: 404 }), /this path/);
  assert.match(nextSteps({ gatewayResponded: true, gatewayHttpCode: 503 }), /server and upstream logs/);
  assert.match(nextSteps({ gatewayResponded: true, gatewayHttpCode: 429 }), /rate limits/);
  assert.match(nextSteps({ gatewayResponded: true, gatewayHttpCode: 403 }), /does not identify/);
});

test("recommendations do not present incomplete or differing probes as a global outage", () => {
  assert.match(nextSteps({ gatewayResponded: false }), /avoid treating this result as proof/);
  assert.match(nextSteps({ gatewayResponded: true, gatewayHttpCode: 200, localResponded: false }), /another network or device/);
  assert.match(nextSteps({ gatewayResponded: true, gatewayHttpCode: 200, localResponded: true }), /cannot establish availability everywhere/);
  assert.doesNotMatch(nextSteps({ dnsStatus: "NXDOMAIN", hostResponded: true, gatewayResponded: true, gatewayHttpCode: 200 }), /domain registration/);
});
