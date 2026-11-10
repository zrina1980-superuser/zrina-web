const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "suggest.js"), "utf8");

function formHarness(problem, response) {
  let handler;
  let calls = 0;
  let focused = false;
  let reset = false;
  const status = { className: "", textContent: "" };
  const button = { disabled: false, textContent: "" };
  const problemField = {
    focus() { focused = true; },
    labels: [{ textContent: "Problem" }]
  };
  const form = {
    dataset: {
      problemShort: "At least 10 characters",
      ok: "Sent",
      error: "Error",
      fallback: "Email",
      mail: "kontakt@zrina.app",
      sending: "Sending",
      send: "Send",
      subject: "Suggestion"
    },
    querySelector(selector) {
      return selector === "#problem" ? problemField : button;
    },
    addEventListener(_type, callback) { handler = callback; },
    reportValidity() { return true; },
    reset() { reset = true; }
  };
  class FormDataMock {
    entries() { return Object.entries({ problem }); }
  }
  vm.runInNewContext(source, {
    document: {
      getElementById(id) { return id === "suggest-form" ? form : status; },
      documentElement: { lang: "hr" }
    },
    FormData: FormDataMock,
    fetch: async () => { calls += 1; return response; },
    location: {}
  });
  return {
    submit: () => handler({ preventDefault() {} }),
    status,
    get calls() { return calls; },
    get focused() { return focused; },
    get reset() { return reset; }
  };
}

test("short or whitespace-padded descriptions show a specific error without sending", async () => {
  for (const problem of ["short", "  123456789  ", "          "]) {
    const form = formHarness(problem);
    await form.submit();
    assert.equal(form.status.textContent, "At least 10 characters");
    assert.equal(form.status.className, "status err");
    assert.equal(form.calls, 0);
    assert.equal(form.focused, true);
    assert.equal(form.reset, false);
  }
});

test("a ten-character description submits and is cleared after success", async () => {
  const form = formHarness("1234567890", { status: 200, ok: true });
  await form.submit();
  assert.equal(form.calls, 1);
  assert.equal(form.status.textContent, "Sent");
  assert.equal(form.reset, true);
});

test("server-side short-description rejection remains understandable", async () => {
  const form = formHarness("1234567890", {
    status: 400,
    ok: false,
    json: async () => ({ error: "problem_required" })
  });
  await form.submit();
  assert.equal(form.status.textContent, "At least 10 characters");
  assert.equal(form.reset, false);
  assert.equal(form.focused, true);
});
