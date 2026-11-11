const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("mobile menu closes on link, outside click, Escape and desktop resize", () => {
  const handlers = {};
  const mediaHandlers = {};
  let focused = false;
  const menu = {
    open: true,
    querySelector: () => ({ focus() { focused = true; } }),
    addEventListener(type, handler) { handlers[`menu:${type}`] = handler; },
    contains(target) { return target.inside; }
  };
  const document = {
    querySelector: () => menu,
    addEventListener(type, handler) { handlers[type] = handler; }
  };
  const matchMedia = () => ({ addEventListener(type, handler) { mediaHandlers[type] = handler; } });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "navigation.js"), "utf8"), { document, matchMedia });

  handlers["menu:click"]({ target: { closest: () => true } });
  assert.equal(menu.open, false);
  menu.open = true;
  handlers.click({ target: { inside: true } });
  assert.equal(menu.open, true);
  handlers.click({ target: { inside: false } });
  assert.equal(menu.open, false);
  menu.open = true;
  handlers.keydown({ key: "Escape" });
  assert.equal(menu.open, false);
  assert.equal(focused, true);
  menu.open = true;
  mediaHandlers.change({ matches: true });
  assert.equal(menu.open, false);
});

test("generated headers use content-versioned assets", () => {
  const version = require("../scripts/site-assets");
  for (const file of ["index.html", "en/index.html", "predlozi/index.html", "en/suggest/index.html", "blog/index.html"]) {
    const html = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    assert.ok(html.includes(`site.css?v=${version("site.css")}`), file);
    assert.ok(html.includes(`navigation.js?v=${version("navigation.js")}`), file);
    assert.match(html, /class="mobile-menu-panel"/);
  }
});
