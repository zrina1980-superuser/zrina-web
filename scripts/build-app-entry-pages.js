const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const entries = [
  {
    slug: "gljivobook",
    source: "gljivobook/project.html",
    destination: "gljivobook/index.html",
    archive: "content/archive/gljivobook-index-before-project-root.html",
    title: "gljivobook.app by Zrina — Terenski vodič i dnevnik gljiva",
    description: "169 vrsta, vizualni ključ, vremenski barometar i GPS dnevnik — osmišljeno za istraživanje hrvatskih šuma.",
    imageAlt: "gljivobook.app by Zrina — terenski vodič za gljive"
  },
  {
    slug: "drone-logbook",
    source: "drone-logbook/project.html",
    destination: "drone-logbook/index.html",
    archive: "content/archive/drone-logbook-index-before-project-root.html",
    title: "dronelogbook.app — Dnevnik leta spreman za teren",
    description: "Planiraj let, pregledaj kartu i vrijeme, vodi evidenciju flote te provjeri regulatorne reference za 195 država.",
    imageAlt: "dronelogbook.app — dnevnik letova i alati za pilote dronova"
  },
  {
    slug: "teka",
    source: "teka/project.html",
    destination: "teka/index.html",
    title: "Mamina Teka by Zrina — Digitalni obiteljski trezor recepata",
    description: "Sačuvaj obiteljske recepte uz AI prepis rukopisa, zajednički trezor i uspomene koje ostaju uz svaki recept.",
    imageAlt: "Mamina Teka by Zrina — obiteljski trezor recepata"
  },
  {
    slug: "shoplist",
    source: "shoplist/project.html",
    destination: "shoplist/index.html",
    archive: "content/archive/shoplist-index-before-project-root.html",
    title: "shoplist.app — Zajednički popis za kupovinu",
    description: "Zajednički popis, glasovni unos i sinkronizacija pomažu obitelji organizirati kupnju na jednom mjestu.",
    imageAlt: "shoplist.app — zajednički popis za kupovinu"
  },
  {
    slug: "wood",
    source: "wood/project.html",
    destination: "wood/index.html",
    archive: "content/archive/wood-index-before-project-root.html",
    title: "wood.app — Stolarski nacrti od mjere do krojne liste",
    description: "Pretvori mjere projekta u 3D model, tehničke nacrte i krojnu listu u milimetrima.",
    imageAlt: "wood.app — stolarski nacrti i krojna lista"
  },
  {
    slug: "radio",
    source: "radio/project.html",
    destination: "radio/index.html",
    archive: "content/archive/radio-index-before-project-root.html",
    title: "zrinaFM — Internetski radio po tvom izboru",
    description: "Pretraži javne radio postaje, slušaj streamove i spremi favorite uz kontrole zvuka.",
    imageAlt: "zrinaFM — internetski radio player"
  },
  {
    slug: "tv",
    source: "tv/project.html",
    destination: "tv/index.html",
    archive: "content/archive/tv-index-before-project-root.html",
    title: "zrinaTV — Web player za HLS streamove i M3U popise",
    description: "Pregledaj kanale iz kataloga ili svojih M3U popisa te pokreni podržane HLS streamove.",
    imageAlt: "zrinaTV — web player za TV streamove"
  }
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function updateMeta(html, attribute, name, content) {
  const selector = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}="${escapeRegExp(name)}")[^>]*>`,
    "i"
  );
  const match = html.match(selector);
  if (!match) {
    const tag = `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(content)}">`;
    return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
  }
  const updatedTag = match[0].replace(/\bcontent="[^"]*"/i, `content="${escapeHtml(content)}"`);
  return html.replace(selector, updatedTag);
}

for (const entry of entries) {
  const sourcePath = path.join(root, entry.source);
  const destinationPath = path.join(root, entry.destination);
  const archivePath = entry.archive && path.join(root, entry.archive);

  if (archivePath && fs.existsSync(destinationPath) && !fs.existsSync(archivePath)) {
    fs.mkdirSync(path.dirname(archivePath), { recursive: true });
    fs.copyFileSync(destinationPath, archivePath);
  }

  const canonical = `https://zrina.app/${entry.slug}/`;
  let html = fs.readFileSync(sourcePath, "utf8");
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(entry.title)}</title>`);
  html = html.replace(
    /<link\b(?=[^>]*\brel="canonical")[^>]*>/i,
    `<link rel="canonical" href="${canonical}">`
  );
  html = updateMeta(html, "name", "description", entry.description);
  html = updateMeta(html, "property", "og:title", entry.title);
  html = updateMeta(html, "property", "og:description", entry.description);
  html = updateMeta(html, "property", "og:url", canonical);
  html = updateMeta(html, "property", "og:image:alt", entry.imageAlt);
  html = updateMeta(html, "name", "twitter:title", entry.title);
  html = updateMeta(html, "name", "twitter:description", entry.description);

  if (!/<meta\b(?=[^>]*\bproperty="og:locale")/i.test(html)) {
    html = html.replace(/(<meta\b[^>]*property="og:type"[^>]*>)/i, '$1\n  <meta property="og:locale" content="hr_HR">');
  }

  fs.writeFileSync(sourcePath, html, "utf8");
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.writeFileSync(destinationPath, html, "utf8");
  console.log(`Built ${entry.destination} from ${entry.source}.`);
}
