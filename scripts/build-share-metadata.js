const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const cardRoot = path.join(root, "assets", "share-cards", "tools");
const toolIcons = {
  hostvitals: "hostvitals-512.png",
  speedcalc: "speedcalc-512.png",
  cidr: "cidr-512.png",
  json: "json-512.png",
  timestamp: "timestamp-512.png",
  cron: "cron-512.png",
  myip: "myip-512.png",
  uuid: "uuid-512.png",
  netplanner: "netplanner-512.png",
  qr: "qr-512.png",
  password: "password-512.png",
  base64: "base64-512.png",
  regex: "regex-512.png",
  unit: "unit-512.png",
  tools: "tools-512.png"
};
const pageCards = {
  "base64/index.html": "base64",
  "cidr/index.html": "cidr",
  "cron/index.html": "cron",
  "hostvitals/about.html": "hostvitals",
  "hostvitals/index.html": "hostvitals",
  "hostvitals/guides/dns-vs-server-outage.html": "hostvitals",
  "hostvitals/guides/flush-dns.html": "hostvitals",
  "hostvitals/guides/http-status-codes.html": "hostvitals",
  "json/index.html": "json",
  "myip/index.html": "myip",
  "netplanner/index.html": "netplanner",
  "password/index.html": "password",
  "qr/index.html": "qr",
  "regex/index.html": "regex",
  "speedcalc/index.html": "speedcalc",
  "timestamp/index.html": "timestamp",
  "tools/about.html": "tools",
  "tools/index.html": "tools",
  "tools/privacy.html": "tools",
  "tools/terms.html": "tools",
  "tools/guides/cidr-subnetting-explained.html": "cidr",
  "tools/guides/cron-time-zones.html": "cron",
  "tools/guides/gb-vs-gib-download-time.html": "speedcalc",
  "tools/guides/index.html": "tools",
  "tools/guides/unix-timestamps-seconds-milliseconds.html": "timestamp",
  "unit/index.html": "unit",
  "uuid/index.html": "uuid"
};
const privacyPages = [
  {
    file: "drone-logbook/privacy.html",
    canonical: "https://zrina.app/drone-logbook/privacy.html",
    title: "DroneLogbook · Privatnost / Privacy",
    description: "Saznaj kako DroneLogbook obrađuje podatke o računu, letovima, održavanju i dokumentima.",
    image: "https://zrina.app/drone-logbook/share-card.png",
    alt: "dronelogbook.app — dnevnik letova i alati za pilote dronova",
    width: "1200",
    height: "630"
  },
  {
    file: "teka/privacy.html",
    canonical: "https://zrina.app/teka/privacy.html",
    title: "Mamina Teka · Privatnost / Privacy",
    description: "Saznaj kako Mamina Teka obrađuje recepte, slike rukopisa, obiteljske podatke i AI zahtjeve.",
    image: "https://zrina.app/teka/share-card.png",
    alt: "Mamina Teka by Zrina — obiteljski trezor recepata",
    width: "1200",
    height: "630"
  },
  {
    file: "hostvitals/privacy.html",
    canonical: "https://zrina.app/tools/privacy.html",
    title: "Tools Privacy Policy · zrina.app",
    description: "Privacy information for the browser-based utilities published by zrina.app.",
    image: "https://zrina.app/assets/share-cards/tools/tools-privacy.png",
    alt: "zrina.app web tools",
    width: "1200",
    height: "630"
  },
  {
    file: "hostvitals/terms.html",
    canonical: "https://zrina.app/tools/terms.html",
    title: "Tools Terms of Use · zrina.app",
    description: "Terms for the browser-based utilities published by zrina.app.",
    image: "https://zrina.app/assets/share-cards/tools/tools-terms.png",
    alt: "zrina.app web tools",
    width: "1200",
    height: "630"
  }
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function insertMeta(html, tag) {
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function setMeta(html, attribute, name, content) {
  const selector = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}=["']${escapeRegExp(name)}["'])[^>]*>`,
    "i"
  );
  const match = html.match(selector);
  if (!match) {
    const safeName = escapeHtml(name);
    const safeContent = escapeHtml(content);
    return insertMeta(html, `<meta ${attribute}="${safeName}" content="${safeContent}" />`);
  }

  if (!/\bcontent=(["']).*?\1/i.test(match[0])) {
    throw new Error(`Metadata ${attribute}="${name}" has no content attribute.`);
  }
  const updatedTag = match[0].replace(
    /\bcontent=(["'])(.*?)\1/i,
    (_tag, quote) => `content=${quote}${escapeHtml(content)}${quote}`
  );
  return html.replace(selector, updatedTag);
}

function wrapText(value, maxLength, maxLines) {
  const words = value.split(/\s+/);
  const lines = [];
  let line = "";

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > maxLength) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) {
        const remaining = [line, ...words.slice(index + 1)].join(" ");
        const shortened = remaining.length > maxLength
          ? `${remaining.slice(0, maxLength - 1).replace(/\s+\S*$/, "").trim()}…`
          : remaining;
        lines.push(shortened);
        return lines;
      }
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function cardSvg(title, description) {
  const titleLines = wrapText(title, 24, 3);
  const descriptionLines = wrapText(description, 48, 2);
  const titleStart = titleLines.length === 1 ? 258 : titleLines.length === 2 ? 220 : 184;
  const descriptionStart = Math.max(350, titleStart + titleLines.length * 58 + 20);
  const titleText = titleLines.map((line, index) =>
    `<tspan x="96" dy="${index === 0 ? 0 : 58}">${escapeXml(line)}</tspan>`
  ).join("");
  const descriptionText = descriptionLines.map((line, index) =>
    `<tspan x="96" dy="${index === 0 ? 0 : 30}">${escapeXml(line)}</tspan>`
  ).join("");

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#070b16"/>
          <stop offset="1" stop-color="#101b2e"/>
        </linearGradient>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="#1b3851" stroke-width="1"/>
        </pattern>
        <radialGradient id="glow">
          <stop offset="0" stop-color="#00e5f4" stop-opacity=".2"/>
          <stop offset="1" stop-color="#00e5f4" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect width="1200" height="630" fill="url(#grid)" opacity=".55"/>
      <circle cx="1020" cy="320" r="330" fill="url(#glow)"/>
      <rect x="64" y="58" width="1072" height="514" rx="28" fill="#08101e" fill-opacity=".72" stroke="#23415a" stroke-width="2"/>
      <text x="96" y="128" fill="#00e5f4" font-family="Segoe UI, Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="3">ZRINA.APP  /  WEB TOOL</text>
      <text x="96" y="${titleStart}" fill="#f3f7fc" font-family="Segoe UI, Arial, sans-serif" font-size="50" font-weight="750">${titleText}</text>
      <text x="96" y="${descriptionStart}" fill="#b5c3d4" font-family="Segoe UI, Arial, sans-serif" font-size="23">
        ${descriptionText}
      </text>
      <path d="M96 448H666" stroke="#00e5f4" stroke-width="3" opacity=".8"/>
      <text x="96" y="500" fill="#72859d" font-family="Segoe UI, Arial, sans-serif" font-size="20" letter-spacing="2">FAST  ·  PRIVATE  ·  IN YOUR BROWSER</text>
      <rect x="814" y="158" width="262" height="262" rx="44" fill="#0b1425" stroke="#24415a" stroke-width="2"/>
    </svg>
  `);
}

function updateSharing(html, page) {
  html = setMeta(html, "name", "description", page.description);
  html = setMeta(html, "property", "og:type", "website");
  html = setMeta(html, "property", "og:site_name", "zrina.app");
  html = setMeta(html, "property", "og:url", page.canonical);
  html = setMeta(html, "property", "og:title", page.title);
  html = setMeta(html, "property", "og:description", page.description);
  html = setMeta(html, "property", "og:image", page.image);
  html = setMeta(html, "property", "og:image:width", page.width);
  html = setMeta(html, "property", "og:image:height", page.height);
  html = setMeta(html, "property", "og:image:alt", page.alt);
  html = setMeta(html, "name", "twitter:card", "summary_large_image");
  html = setMeta(html, "name", "twitter:title", page.title);
  html = setMeta(html, "name", "twitter:description", page.description);
  html = setMeta(html, "name", "twitter:image", page.image);
  return html;
}

async function build() {
  fs.mkdirSync(cardRoot, { recursive: true });
  for (const key of Object.keys(toolIcons)) {
    fs.rmSync(path.join(cardRoot, `${key}.png`), { force: true });
  }

  for (const [file, key] of Object.entries(pageCards)) {
    const filePath = path.join(root, file);
    const sourceHtml = fs.readFileSync(filePath, "utf8");
    const canonicalMatch = sourceHtml.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i);
    const canonicalValue = canonicalMatch?.[0].match(/\bhref=(["'])(.*?)\1/i);
    const titleMatch = sourceHtml.match(/<title>([^<]*)<\/title>/i);
    const descriptionTag = sourceHtml.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i);
    const descriptionValue = descriptionTag?.[0].match(/\bcontent=(["'])(.*?)\1/i);
    if (!canonicalValue || !titleMatch || !descriptionValue) {
      throw new Error(`Cannot build share metadata for ${file}: missing canonical URL, title or description.`);
    }

    const title = titleMatch[1]
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/\s*[|·]\s*zrina\.app\s*$/i, "");
    const description = descriptionValue[2]
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    const cardName = file.replace(/\\/g, "/").replace(/\.html$/i, "").replace(/\//g, "-") + ".png";
    const imagePath = path.join(cardRoot, cardName);
    const iconPath = path.join(root, "assets", "tool-icons", toolIcons[key]);
    const icon = await sharp(iconPath).resize(224, 224, { fit: "contain" }).png().toBuffer();
    await sharp(cardSvg(title, description))
      .composite([{ input: icon, left: 833, top: 177 }])
      .png()
      .toFile(imagePath);

    const page = {
      canonical: canonicalValue[2],
      title: titleMatch[1].replace(/&amp;/g, "&"),
      description,
      image: `https://zrina.app/assets/share-cards/tools/${cardName}`,
      alt: `${title} — ${description}`,
      width: "1200",
      height: "630"
    };
    const html = updateSharing(fs.readFileSync(filePath, "utf8"), page);
    fs.writeFileSync(filePath, html, "utf8");
  }

  for (const page of privacyPages) {
    const filePath = path.join(root, page.file);
    const html = updateSharing(fs.readFileSync(filePath, "utf8"), page);
    fs.writeFileSync(filePath, html, "utf8");
  }

  console.log(`Generated ${Object.keys(pageCards).length} unique tool share cards and updated ${privacyPages.length} privacy pages.`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
