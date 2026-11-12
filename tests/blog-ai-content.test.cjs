const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { posts, getPublishedPosts } = require("../scripts/build-blog");

const root = path.join(__dirname, "..");

test("Gljivobook article retains its scheduled release and in-person safety guidance", () => {
  const post = posts.find((item) => item.slug === "biljeske-s-terena-gljivarenje");
  assert.ok(post);
  assert.ok(!getPublishedPosts(new Date("2026-11-24T12:00:00Z")).includes(post));
  assert.ok(getPublishedPosts(new Date("2026-11-25T12:00:00Z")).includes(post));
  assert.match(post.body, /primjerak uživo pregleda|pregledao primjerak uživo/i);
  assert.match(post.body, /vlastiti Gemini API ključ/);
});

test("generated project pages include both language versions of optional AI information", () => {
  for (const [slug, hr, en] of [
    ["gljivobook", "Opcionalni Gemini AI skener", "Optional Gemini AI scanner"],
    ["teka", "AI ilustracija jela", "AI dish illustration"]
  ]) {
    const html = fs.readFileSync(path.join(root, slug, "index.html"), "utf8");
    const match = html.match(/<script type="application\/json" id="project-data">([\s\S]*?)<\/script>/);
    assert.ok(match, `${slug} has embedded project data`);
    const project = JSON.parse(match[1]);
    assert.ok(project.projectPage.modules.some((item) => item.hr[0] === hr && item.en[0] === en));
  }
});
