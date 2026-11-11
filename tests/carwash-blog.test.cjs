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
  const project = fs.readFileSync(path.join(root, "carwash", "index.html"), "utf8");
  assert.match(project, /href="\.\.\/blog\/kako-sam-izgradio-aplikaciju-za-praonicu\/"/);
  assert.doesNotMatch(project, /efac|emil[\s-]*frey/i);
});
