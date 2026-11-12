const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { posts, postForLanguage, article, indexPage, getPublishedPosts } = require("../scripts/build-blog");

const root = path.join(__dirname, "..");
const site = "https://zrina.app";

test("each article links to its matching translation with localised metadata", () => {
  const slugs = new Set();
  for (const post of posts) {
    const translated = postForLanguage(post, "en");
    assert.ok(translated.title && translated.description && translated.body && translated.imageAlt);
    assert.ok(!slugs.has(translated.slug), `duplicate English slug: ${translated.slug}`);
    slugs.add(translated.slug);
    const hrPath = `/blog/${post.slug}/`;
    const enPath = `/en/blog/${translated.slug}/`;
    for (const [language, html, ownPath] of [
      ["hr", article(post, "hr"), hrPath],
      ["en", article(post, "en"), enPath]
    ]) {
      assert.ok(html.includes(`<html lang="${language}">`));
      assert.ok(html.includes(`<link rel="canonical" href="${site}${ownPath}">`));
      for (const [code, url] of [["hr", hrPath], ["en", enPath]]) {
        assert.ok(html.includes(`hreflang="${code}" href="${site}${url}"`));
        assert.ok(html.includes(`href="${url}" hreflang="${code}"`));
      }
      const json = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
      assert.equal(json.inLanguage, language);
      assert.equal(json.datePublished, post.date);
      assert.equal(json.mainEntityOfPage, `${site}${ownPath}`);
    }
  }
  assert.match(postForLanguage(posts.find(p => p.slug === "biljeske-s-terena-gljivarenje"), "en").body, /examined the specimen in person/i);
});

test("scheduled articles appear in both indexes only from their Zagreb publication dates", () => {
  for (const [before, after, slug] of [
    ["2026-11-17T22:59:59Z", "2026-11-17T23:00:00Z", "sto-zabiljeziti-nakon-leta-dronom"],
    ["2026-11-24T22:59:59Z", "2026-11-24T23:00:00Z", "biljeske-s-terena-gljivarenje"]
  ]) {
    const post = posts.find(p => p.slug === slug);
    for (const language of ["hr", "en"]) {
      const title = postForLanguage(post, language).title;
      assert.ok(!indexPage(getPublishedPosts(new Date(before)), language).includes(title));
      assert.ok(indexPage(getPublishedPosts(new Date(after)), language).includes(title));
    }
  }
});

test("the built site includes published translations and excludes future articles from both sitemap and output", () => {
  const published = new Set(getPublishedPosts().map(post => post.slug));
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  assert.equal((sitemap.match(/<loc>https:\/\/zrina\.app\/en\/blog\/<\/loc>/g) || []).length, 1);
  for (const post of posts) {
    const translated = postForLanguage(post, "en");
    const file = path.join(root, "dist", "en", "blog", translated.slug, "index.html");
    const url = `${site}/en/blog/${translated.slug}/`;
    assert.equal(fs.existsSync(file), published.has(post.slug), file);
    assert.equal(sitemap.includes(url), published.has(post.slug), url);
    if (published.has(post.slug)) {
      assert.ok(fs.existsSync(path.join(root, "dist", "assets", "share-cards", "blog", `${translated.slug}.png`)));
      assert.match(fs.readFileSync(file, "utf8"), /<html lang="en">/);
    }
  }
  const englishHome = fs.readFileSync(path.join(root, "dist", "en", "index.html"), "utf8");
  assert.match(englishHome, /href="\/en\/blog\/">Blog<\/a>/);
});
