const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function harness(name, initial, presets = []) {
  const html = fs.readFileSync(path.join(__dirname, "..", name, "index.html"), "utf8");
  const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
  const elements = {};
  function element(id) {
    if (!elements[id]) {
      elements[id] = {
        value: "", textContent: "", innerHTML: "", hidden: false, options: [], handlers: {},
        add(option) { this.options.push(option); if (!this.value) this.value = String(option.value); },
        addEventListener(type, handler) {
          const previous = this.handlers[type];
          this.handlers[type] = previous ? () => { previous(); handler(); } : handler;
        }
      };
    }
    return elements[id];
  }
  for (const [id, value] of Object.entries(initial)) element(id).value = String(value);
  const buttons = presets.map(dataset => ({
    dataset, handlers: {},
    addEventListener(type, handler) { this.handlers[type] = handler; }
  }));
  const context = vm.createContext({
    document: {
      getElementById: element,
      querySelectorAll: () => buttons
    },
    Option: function(text, value) { this.textContent = text; this.value = value; }
  });
  if (name === "speedcalc") {
    element("sizeUnit").options = ["MB", "GB", "TB"].map(value => ({ value }));
  }
  vm.runInContext(script, context);
  return { element, buttons, evaluate: expression => vm.runInContext(expression, context) };
}

test("CIDR rejects additional slashes and clears stale results", () => {
  const h = harness("cidr", { ip: "192.168.10.1/24" });
  assert.match(h.element("res").innerHTML, /192\.168\.10\.0/);
  h.element("ip").value = "192.168.10.1/24/garbage";
  h.element("ip").handlers.input();
  assert.match(h.element("err").textContent, /one IPv4 address and one prefix/);
  assert.equal(h.element("res").innerHTML, "");
});

test("CIDR handles boundary prefixes and does not claim unclassified addresses are routable", () => {
  const h = harness("cidr", { ip: "192.0.2.1/24" });
  assert.match(h.element("res").innerHTML, /Other \(not classified\)/);
  for (const [address, expectedLast, expectedHosts] of [
    ["10.0.0.1/31", "10.0.0.1", "2"],
    ["10.0.0.1/32", "10.0.0.1", "1"]
  ]) {
    h.element("ip").value = address;
    h.element("ip").handlers.input();
    assert.match(h.element("res").innerHTML, /Last address \(no broadcast\)/);
    assert.match(h.element("res").innerHTML, new RegExp(expectedLast.replace(/\./g, "\\.")));
    assert.match(h.element("res").innerHTML, new RegExp("Usable hosts</small><b>" + expectedHosts));
  }
});

test("download presets use their labelled decimal units and calculation", () => {
  const h = harness("speedcalc", {
    size: 120, speed: 300, mode: "time", ovh: 0, cong: 100,
    sizeBase: 1024, sizeUnit: "GB", speedUnit: "Mbps", windowHours: 8
  }, [{ s: "150", u: "GB" }]);
  h.buttons[0].handlers.click();
  assert.equal(h.element("sizeBase").value, "1000");
  assert.equal(h.element("sizeUnit").options[1].textContent, "GB");
  assert.equal(h.element("out").textContent, "1 h 6 min 40 s");
  h.element("sizeBase").value = "1024";
  h.element("sizeBase").handlers.change();
  assert.equal(h.element("sizeUnit").options[1].textContent, "GiB");
  assert.equal(h.element("out").textContent, "1 h 11 min 35 s");
});
