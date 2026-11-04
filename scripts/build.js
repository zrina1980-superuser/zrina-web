const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const projectFile = path.join(root, "projects.json");

const projects = JSON.parse(fs.readFileSync(projectFile, "utf8"));

const requiredProjects = ["shoplist", "wood", "gljivo", "drone", "fm", "tv", "carwash", "tirehotel", "alatnica", "teka"];
const ids = new Set();

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function validateProject(project) {
  if (!project || typeof project.id !== "string" || ids.has(project.id)) {
    throw new Error(`Project id is missing or duplicated: ${project && project.id}`);
  }
  ids.add(project.id);

  for (const field of ["name", "category", "status", "accent", "icon", "projectUrl", "launchUrl", "email", "preview"]) {
    if (!project[field]) throw new Error(`Project "${project.id}" is missing "${field}".`);
  }
  if (!["public", "b2b"].includes(project.category)) {
    throw new Error(`Project "${project.id}" has an invalid category.`);
  }
  if (!["public", "case", "demo"].includes(project.status)) {
    throw new Error(`Project "${project.id}" has an invalid status.`);
  }
  if (!/^#[\da-f]{6}$/i.test(project.accent)) {
    throw new Error(`Project "${project.id}" has an invalid accent color.`);
  }
  for (const language of ["hr", "en"]) {
    if (
      !project.description?.[language] ||
      !project.tech?.[language]?.length ||
      !project.techDescription?.[language]
    ) {
      throw new Error(`Project "${project.id}" is missing localized content for "${language}".`);
    }
  }
  const ratio = /^(\d+)\s*\/\s*(\d+)$/.exec(project.preview.aspectRatio);
  if (!ratio || Number(ratio[1]) < 1 || Number(ratio[2]) < 1) {
    throw new Error(`Project "${project.id}" has an invalid preview aspect ratio.`);
  }

  for (const asset of [project.icon, project.screenshot, project.preview.src]) {
    const absoluteAsset = path.resolve(root, asset);
    if (!absoluteAsset.startsWith(`${root}${path.sep}`) || !fs.existsSync(absoluteAsset)) {
      throw new Error(`Project "${project.id}" references a missing or out-of-root asset: ${asset}`);
    }
  }
}

projects.forEach(validateProject);
for (const id of requiredProjects) {
  if (!ids.has(id)) throw new Error(`Required project "${id}" is missing from projects.json.`);
}

for (const project of projects.filter((item) => item.projectPage)) {
  const projectPagePath = path.resolve(root, project.projectUrl);
  if (!projectPagePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(projectPagePath)) {
    throw new Error(`Project "${project.id}" references a missing or out-of-root project page: ${project.projectUrl}`);
  }

  let projectPageHtml = fs.readFileSync(projectPagePath, "utf8");
  const projectRecordPattern = /(<script type="application\/json" id="project-data">)[\s\S]*?(<\/script>)/;
  if (!projectRecordPattern.test(projectPageHtml)) {
    throw new Error(`Project data script block not found in ${project.projectUrl}.`);
  }
  projectPageHtml = projectPageHtml.replace(
    projectRecordPattern,
    `$1${JSON.stringify(project).replace(/</g, "\\u003c")}$2`
  );
  fs.writeFileSync(projectPagePath, projectPageHtml);
}

require("./build-home")();
console.log(`Updated project pages for ${projects.length} projects.`);
