const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const expected = {
  gljivo: ["6Sa-3Wy_1m4", "i6ouszfEcgM", "24lEeqiumMI"],
  drone: ["vRQWAitjkl4", "bK0m52f0DQA"],
  teka: ["uDqoAXDIoUY", "lukhTNnAr7Y"]
};

test("built project pages include their videos and locally hosted thumbnails", () => {
  const projects = JSON.parse(fs.readFileSync(path.join(root, "projects.json"), "utf8"));
  for (const project of projects.filter(p => p.projectPage)) {
    const page = fs.readFileSync(path.join(root, "dist", project.projectUrl, "index.html"), "utf8");
    const data = JSON.parse(page.match(/<script type="application\/json" id="project-data">([\s\S]*?)<\/script>/)[1]);
    if (!expected[project.id]) {
      assert.equal(data.videos, undefined, project.id);
      continue;
    }
    assert.deepEqual(data.videos.map(video => video.id), expected[project.id]);
    for (const video of data.videos) {
      assert.ok(video.title.hr && video.title.en);
      assert.ok(fs.existsSync(path.join(root, "dist", "assets", "portfolio", "video-thumbnails", `${video.id}.webp`)));
    }
  }
});
