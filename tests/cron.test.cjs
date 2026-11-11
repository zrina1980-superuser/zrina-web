const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "..", "cron", "index.html"), "utf8");
const script = html.slice(html.lastIndexOf("<script>") + 8, html.indexOf("$('cron').addEventListener"));
const context = vm.createContext({ Intl, Date });
vm.runInContext(script, context);

function next(expression, zone, now, count = 5) {
  const parsed = context.parseCron(expression, "linux");
  return Array.from(context.nextRuns(parsed, zone, count, new Date(now)).dates, date => date.toISOString());
}

test("repeated daylight-saving hour is ordered by actual instant", () => {
  assert.deepEqual(next("* 1 * * *", "America/New_York", "2026-11-01T04:59:00Z"), [
    "2026-11-01T05:00:00.000Z",
    "2026-11-01T05:01:00.000Z",
    "2026-11-01T05:02:00.000Z",
    "2026-11-01T05:03:00.000Z",
    "2026-11-01T05:04:00.000Z"
  ]);
  assert.deepEqual(next("0 1 * * *", "America/New_York", "2026-11-01T04:59:00Z", 2), [
    "2026-11-01T05:00:00.000Z", "2026-11-01T06:00:00.000Z"
  ]);
});

test("nonexistent spring local times are skipped", () => {
  assert.deepEqual(next("30 2 * * *", "America/New_York", "2026-03-08T05:00:00Z", 1), ["2026-03-09T06:30:00.000Z"]);
});
