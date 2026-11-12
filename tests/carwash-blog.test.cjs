const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { posts, getPublishedPosts } = require("../scripts/build-blog");

const root = path.join(__dirname, "..");
const post = posts.find(item => item.slug === "kako-sam-izgradio-aplikaciju-za-praonicu");

test("carwash article is published with neutral text and a project link", () => {
  assert.ok(post);
  assert.ok(getPublishedPosts(new Date("2026-11-11T18:00:00Z")).includes(post));
  assert.match(post.body, /href="\/carwash\/"/);
  assert.doesNotMatch(JSON.stringify(post), /efac|emil[\s-]*frey/i);
  assert.match(post.body, /oko 15\.000 koraka/);
  assert.match(post.body, /ne izmjerena ušteda/i);
  assert.match(post.body, /deset A4 listova dnevno/);
  assert.match(post.body, /samoinicijativno/);
  assert.match(post.body, /danas se ondje više ne koristi/i);
  assert.match(post.body, /pomoć AI alata/);
  assert.match(post.body, /Od iskustva iz servisa do rješenja uz AI/);
  assert.match(post.body, /nije konačno uvedena/);
  assert.match(post.body, /function pokreniSmartSync\(\)/);
  assert.match(post.body, /setInterval\(osvjeziRadionicu, 3000\)/);
  assert.match(post.body, /cache\.put\('db_verzija', Date\.now\(\)\.toString\(\), 21600\)/);
  assert.match(post.body, /if \(isValidVINChecksum\(popravljeno\)\) score \+= 100/);
  assert.match(post.body, /pojednostavljeni pseudokod/);
  const project = fs.readFileSync(path.join(root, "carwash", "index.html"), "utf8");
  assert.match(project, /href="\.\.\/blog\/kako-sam-izgradio-aplikaciju-za-praonicu\/"/);
  assert.doesNotMatch(project, /efac|emil[\s-]*frey/i);
});
