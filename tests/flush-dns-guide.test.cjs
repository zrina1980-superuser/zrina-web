const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("DNS guide uses the served canonical URL and linked device sections", () => {
  const html = read("hostvitals/guides/flush-dns.html");
  const url = "https://zrina.app/hostvitals/guides/flush-dns";
  assert.ok(html.includes(`rel="canonical" href="${url}"`));
  assert.ok(html.includes(`property="og:url" content="${url}"`));
  assert.ok(html.includes(`"url": "${url}"`));
  assert.ok(read("sitemap.xml").includes(`<loc>${url}</loc>`));
  for (const id of ["windows", "macos", "linux", "browser", "mobile"]) {
    assert.ok(html.includes(`href="#${id}"`));
    assert.ok(html.includes(`id="${id}"`));
  }
  assert.equal((html.match(/class="copy-command"/g) || []).length, 4);
  assert.equal((html.match(/class="copy-status" role="status"/g) || []).length, 4);
});

test("internal links use the non-redirecting DNS guide URL", () => {
  for (const file of ["hostvitals/index.html", "hostvitals/guides/http-status-codes.html", "hostvitals/guides/dns-vs-server-outage.html", "tools/guides/index.html"]) {
    const html = read(file);
    assert.doesNotMatch(html, /href="[^"]*flush-dns\.html"/);
    assert.match(html, /href="[^"]*flush-dns"/);
  }
});
