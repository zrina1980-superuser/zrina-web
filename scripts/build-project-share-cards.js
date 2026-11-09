const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const projects = JSON.parse(fs.readFileSync(path.join(root, "projects.json"), "utf8"));
const cardDetails = {
  shoplist: "ZAJEDNIČKA KUPOVINA · GLASOVNI UNOS · BY ZRINA",
  wood: "3D MODELI · NACRTI · KROJNE LISTE · BY ZRINA",
  fm: "INTERNETSKI RADIO · FAVORITI · BY ZRINA",
  tv: "WEB TV PLAYER · HLS · M3U · BY ZRINA",
  carwash: "OPERATIVNI TIJEK · TIMSKI RAD · BY ZRINA",
  tirehotel: "EVIDENCIJA GUMA · SKLADIŠTENJE · BY ZRINA",
  alatnica: "KATALOG ALATA · ZADUŽENJA · BY ZRINA"
};
const descriptionOverrides = {
  alatnica: "Katalog alata, zaduživanje i inventura u radionicama."
};
const cardIds = Object.keys(cardDetails);

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
  })[character]);
}

function wrapText(value, maxLength, maxLines) {
  const words = value.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[,.!?;:]?$/, "")}…`;
  }
  return lines;
}

function cardBackground(project) {
  const descriptionLines = wrapText(descriptionOverrides[project.id] || project.description.hr, 34, 3);
  const description = descriptionLines.map((line, index) =>
    `<tspan x="104" dy="${index === 0 ? 0 : 38}">${escapeXml(line)}</tspan>`
  ).join("");
  const titleSize = project.name.length > 14 ? 48 : 56;

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#08111f"/>
          <stop offset="1" stop-color="#101c2d"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${project.accent}" stop-opacity=".24"/>
          <stop offset="1" stop-color="${project.accent}" stop-opacity=".02"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="#050912"/>
      <rect x="44" y="38" width="1112" height="554" rx="4" fill="url(#background)"/>
      <path d="M650 39h505v553H650z" fill="url(#accent)"/>
      <circle cx="1114" cy="96" r="205" fill="${project.accent}" opacity=".07"/>
      <text x="104" y="121" fill="${project.accent}" font-family="Arial, sans-serif" font-size="26" font-weight="700">zrina.app</text>
      <text x="104" y="244" fill="#f7fafc" font-family="Arial, sans-serif" font-size="${titleSize}" font-weight="700">${escapeXml(project.name)}</text>
      <text x="104" y="310" fill="#c2ccd8" font-family="Arial, sans-serif" font-size="26">${description}</text>
      <rect x="104" y="442" width="468" height="3" rx="1.5" fill="${project.accent}" opacity=".85"/>
      <text x="104" y="494" fill="${project.accent}" font-family="Arial, sans-serif" font-size="17" font-weight="700" letter-spacing=".5">${escapeXml(cardDetails[project.id])}</text>
    </svg>
  `);
}

async function buildCard(project) {
  const logoPath = path.join(root, project.icon);
  const cardPath = project.preview.src.replace(/share-card(?:-v2)?\.png$/, "share-card-v2.png");
  const outputPath = path.join(root, cardPath);
  const oldCardPath = project.preview.src.replace(/share-card-v2\.png$/, "share-card.png");
  const oldCardUrl = `https://zrina.app/${oldCardPath}`;
  const newCardUrl = `https://zrina.app/${cardPath}`;

  if (!fs.existsSync(logoPath)) throw new Error(`Missing logo for "${project.id}": ${project.icon}`);
  await sharp(cardBackground(project))
    .composite([{
      input: await sharp(logoPath).resize(500, 500, { fit: "contain" }).png().toBuffer(),
      left: 650,
      top: 65
    }])
    .png()
    .toFile(outputPath);

  const pages = new Set([
    project.projectPageSource,
    `${path.posix.dirname(project.preview.src)}/index.html`
  ].filter(Boolean));
  for (const page of pages) {
    const pagePath = path.join(root, page);
    if (!fs.existsSync(pagePath)) throw new Error(`Missing share metadata page for "${project.id}": ${page}`);
    const html = fs.readFileSync(pagePath, "utf8");
    if (!html.includes(oldCardUrl) && !html.includes(newCardUrl)) {
      throw new Error(`Expected old share card URL in ${page}: ${oldCardUrl}`);
    }
    fs.writeFileSync(pagePath, html.replaceAll(oldCardUrl, newCardUrl));
  }

  console.log(`Generated ${path.relative(root, outputPath)}`);
}

async function main() {
  for (const id of cardIds) {
    const project = projects.find((item) => item.id === id);
    if (!project) throw new Error(`Missing project data for "${id}".`);
    await buildCard(project);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
