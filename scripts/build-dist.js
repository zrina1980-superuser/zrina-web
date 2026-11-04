// Copies only publishable files into dist/ so dev files (scripts, prompts, package.json, ...) are never served.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const excludedTop = new Set([
  "dist", "node_modules", ".wrangler", ".git", "scripts", "functions", "projects.json",
  "package.json", "package-lock.json", "README.md", "content",
]);
const excludedNames = /^(GOOGLE-AI-STUDIO-PROMPT\.txt|README\.md|package(-lock)?\.json|\.DS_Store|Thumbs\.db)$/i;
const excludedPaths = /(^|[\\/])(tests?|scripts|node_modules)([\\/]|$)/i;

function copyDir(src, dest, rel) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (!rel && excludedTop.has(entry.name)) continue;
    if (excludedNames.test(entry.name) || excludedPaths.test(relPath)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to, relPath);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
copyDir(root, dist, "");

let files = 0;
(function count(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) count(path.join(d, e.name)); else files++;
  }
})(dist);
console.log(`dist: ${files} files`);
