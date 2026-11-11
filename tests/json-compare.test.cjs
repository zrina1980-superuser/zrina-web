const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "..", "json", "index.html"), "utf8");
const script = html.slice(html.lastIndexOf("<script>") + 8, html.indexOf("$('fmt').onclick"));
const context = vm.createContext({ document: { getElementById: () => ({}) }, TextEncoder });
vm.runInContext(script, context);

function compare(first, second, limit) {
  const left = context.parseJson(first);
  const right = context.parseJson(second);
  return context.compareNodes(left.root, right.root, limit);
}

test("comparison preserves number spelling and reports large integer differences", () => {
  const result = compare('{"n":9007199254740993}', '{"n":9007199254740992}');
  assert.match(result.differences[0], /9007199254740993 → 9007199254740992/);
  assert.match(compare('1', '1.0').differences[0], /number spelling changed/);
});

test("comparison ignores key order and string escapes but compares arrays and paths", () => {
  assert.equal(compare('{"a":"A","b":1}', '{"b":1,"a":"\\u0041"}').differences.length, 0);
  const result = compare('{"a/b":[1,2],"removed":true}', '{"a/b":[1,3,4],"added":false}');
  assert.deepEqual(Array.from(result.differences), ['/a~1b/1: value or number spelling changed (2 → 3)', '/a~1b/2: added', '/removed: removed', '/added: added']);
});

test("duplicate keys are detected and comparison output is bounded", () => {
  assert.equal(context.parseJson('{"x":1,"x":2}').duplicates.length, 1);
  const result = compare('[1,2,3]', '[4,5,6]', 2);
  assert.equal(result.differences.length, 2);
  assert.equal(result.truncated, true);
});
