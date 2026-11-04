// Generates the bilingual portfolio homepage (/ and /en/) and the "suggest an app" pages (/predlozi/ and /en/suggest/).
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const SITE = "https://zrina.app";
const LINKEDIN = "https://www.linkedin.com/in/vedran-zrinski";
const MAIL = "kontakt@zrina.app";

const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const tools = [
  ["speedcalc", "SpeedCalc"], ["cidr", "CIDR"], ["json", "JSON"], ["timestamp", "Timestamp"], ["cron", "Cron"],
  ["myip", "My IP"], ["uuid", "UUID"], ["netplanner", "NetPlanner"], ["qr", "QR"], ["password", "Password"],
  ["base64", "Base64"], ["regex", "Regex"], ["unit", "Unit"], ["hostvitals", "HostVitals"]
];

const copy = {
  hr: {
    lang: "hr",
    title: "Vedran Zrinski — developer, AI graditelj i dizajner aplikacija | zrina.app",
    description: "Portfolio Vedrana Zrinskog: gradim web aplikacije od ideje do objave — PWA, React, TypeScript, Firebase i AI. Gljivobook, DroneLogbook, Mamina Teka i drugi projekti.",
    ogTitle: "Vedran Zrinski — gradim aplikacije od ideje do objave",
    nav: { work: "Radovi", about: "O meni", tools: "Alati", suggest: "Predloži aplikaciju", contact: "Kontakt" },
    skip: "Preskoči na sadržaj",
    pill: "Developer · AI graditelj · Dizajner aplikacija",
    h1: "Gradim aplikacije od ideje do objave.",
    lead: "Zovem se Vedran Zrinski. Dvadeset godina radim u servisnoj struci, a u slobodno vrijeme dizajniram, programiram i objavljujem vlastite web aplikacije — od terenskog vodiča za gljive do obiteljskog trezora recepata.",
    ai: "AI mi je alat, ne zamjena za razmišljanje: zahtjeve, odluke, dizajn, testiranje i sigurnost vodim sam, a AI ubrzava izradu.",
    ctaWork: "Pogledaj radove",
    ctaSuggest: "Predloži aplikaciju",
    ctaContact: "Javi se",
    stats: [["10", "projekata"], ["14", "besplatnih alata"], ["PWA", "rad bez mreže"], ["20+", "godina u servisnoj struci"]],
    flagshipTitle: "Tri vodeća projekta",
    flagshipLead: "Svaki ima studiju slučaja: problem, rješenje, ključne odluke i što sam naučio.",
    openCase: "Pročitaj studiju slučaja",
    launch: "Pokreni aplikaciju",
    demo: "Javi se za demo",
    othersTitle: "Ostali projekti",
    othersLead: "Manje, fokusirane aplikacije izrađene za konkretnu potrebu.",
    open: "Otvori projekt",
    workshopTitle: "Iz servisne radionice",
    workshopLead: "Studije slučaja alata za auto-praonice i vulkanizere, nastale iz mog stvarnog radnog iskustva.",
    openStudy: "Otvori studiju slučaja",
    toolsTitle: "Besplatni online alati",
    toolsLead: "Mali, brzi alati koji rade u pregledniku i ne traže registraciju.",
    toolsAll: "Svi alati",
    processTitle: "Kako radim",
    process: [
      ["Slušam", "Počnem od stvarnog problema i osobe koja ga ima, ne od tehnologije."],
      ["Dizajniram", "Skiciram tijek i sučelje koje je razumljivo i starijima i na terenu."],
      ["Gradim s AI-jem", "Brzo izrađujem prototip, a svaku odluku, test i sigurnosno pravilo provjeravam sam."],
      ["Objavljujem", "PWA koja radi izvan mreže, jasna privatnost i objava koju netko doista može koristiti."]
    ],
    aboutTitle: "O meni",
    about: [
      "Više od dvadeset godina radim s ljudima i procesima u automobilskoj servisnoj struci. Danas sam certificirani servisni savjetnik, senior specijalist: svaki dan pretvaram tuđe probleme u jasan plan popravka. Tamo sam shvatio koliko dobrih ideja strada zbog neprikladnih alata.",
      "Zato sam počeo graditi vlastite. Većina projekata nastala je iz konkretne potrebe — moje, moje obitelji ili ljudi s kojima radim. Naučio sam React, TypeScript, PWA, Firebase i rad s AI modelima, a posebno me zanima kako od ideje doći do proizvoda koji je jednostavan, siguran i koristan.",
      "Trenutačno aktivno ne tražim novi posao, ali sam otvoren za zanimljive uloge i projekte u razvoju aplikacija, AI-ju i dizajnu proizvoda."
    ],
    skillsTitle: "Čime radim",
    skills: ["React 19", "TypeScript", "Tailwind CSS", "PWA · Workbox", "Firebase Auth · Firestore", "IndexedDB", "Gemini API", "Cloudflare Pages", "Leaflet · karte", "UX i dizajn sučelja"],
    suggestTitle: "Imaš problem za koji ne postoji gotova aplikacija?",
    suggestText: "Opiši mi ga. Ako ga mogu riješiti, pokušat ćemo zajedno izraditi aplikaciju točno onako kako si je zamislio. Sve što objavljujem je besplatno. Za aplikaciju prilagođenu samo tebi javi se na e-poštu.",
    suggestBtn: "Predloži aplikaciju",
    contactTitle: "Kontakt",
    contactText: "Za suradnju, pitanja o projektima ili prijedlog aplikacije.",
    linkedin: "LinkedIn",
    footer: "Autorski projekti Vedrana Zrinskog.",
    privacy: "Privatnost",
    legalTitle: "Privatnost i uvjeti",
    legal: [
      "Ova stranica je osobni portfolio. Ne koristi kolačiće za praćenje ni analitiku, ne učitava vanjske fontove i ne prikazuje oglase.",
      "Odabir jezika pamti se lokalno u pregledniku. Pojedine aplikacije i alati mogu koristiti lokalnu pohranu ili vanjske servise za svoje funkcije; pojedinosti su navedene u samoj aplikaciji.",
      "E-poštu koju mi pošalješ koristim samo za odgovor na tvoj upit.",
      "Sadržaj i izvorni kod autorski su rad. Aplikacije se nude „kakve jesu”, bez jamstva."
    ],
    close: "Zatvori",
    types: { demo: "Demo na upit", public: "Javna aplikacija", case: "Studija slučaja" },
    altLang: { label: "EN", title: "English version", href: "en/" }
  },
  en: {
    lang: "en",
    title: "Vedran Zrinski — developer, AI builder and app designer | zrina.app",
    description: "Portfolio of Vedran Zrinski: I build web apps from idea to launch — PWA, React, TypeScript, Firebase and AI. Gljivobook, DroneLogbook, Mamina Teka and more.",
    ogTitle: "Vedran Zrinski — I build apps from idea to launch",
    nav: { work: "Work", about: "About", tools: "Tools", suggest: "Suggest an app", contact: "Contact" },
    skip: "Skip to content",
    pill: "Developer · AI builder · App designer",
    h1: "I build apps from idea to launch.",
    lead: "I’m Vedran Zrinski. I’ve worked in the automotive service trade for twenty years, and in my spare time I design, code and publish my own web apps — from a field guide for mushrooms to a family recipe vault.",
    ai: "AI is a tool, not a substitute for thinking: I own the requirements, decisions, design, testing and security, and AI speeds up the building.",
    ctaWork: "See my work",
    ctaSuggest: "Suggest an app",
    ctaContact: "Get in touch",
    stats: [["10", "projects"], ["14", "free tools"], ["PWA", "works offline"], ["20+", "years in the service trade"]],
    flagshipTitle: "Three flagship projects",
    flagshipLead: "Each has a case study: the problem, the solution, key decisions and what I learned.",
    openCase: "Read the case study",
    launch: "Launch the app",
    demo: "Ask for a demo",
    othersTitle: "More projects",
    othersLead: "Smaller, focused apps built for a specific need.",
    open: "Open project",
    workshopTitle: "From the service workshop",
    workshopLead: "Case studies of tools for car washes and tyre shops, born from my real working experience.",
    openStudy: "Open case study",
    toolsTitle: "Free online tools",
    toolsLead: "Small, fast tools that run in your browser and need no sign-up.",
    toolsAll: "All tools",
    processTitle: "How I work",
    process: [
      ["Listen", "I start from a real problem and the person who has it, not from the technology."],
      ["Design", "I sketch a flow and interface that makes sense for older users and in the field."],
      ["Build with AI", "I prototype fast, and I check every decision, test and security rule myself."],
      ["Ship", "An offline-capable PWA, clear privacy and a release someone can actually use."]
    ],
    aboutTitle: "About me",
    about: [
      "For over twenty years I’ve worked with people and processes in the automotive service trade, and today I am a certified service advisor, senior specialist: every day I turn other people’s problems into a clear repair plan. There I saw how many good ideas die because of unsuitable tools.",
      "So I started building my own. Most projects came from a concrete need — mine, my family’s or my colleagues’. I’ve learned React, TypeScript, PWAs, Firebase and working with AI models, and I’m especially interested in turning an idea into a product that is simple, safe and useful.",
      "I’m not actively job-hunting right now, but I’m open to interesting roles and projects in app development, AI and product design."
    ],
    skillsTitle: "What I work with",
    skills: ["React 19", "TypeScript", "Tailwind CSS", "PWA · Workbox", "Firebase Auth · Firestore", "IndexedDB", "Gemini API", "Cloudflare Pages", "Leaflet · maps", "UX and interface design"],
    suggestTitle: "Have a problem no ready-made app solves?",
    suggestText: "Describe it to me. If I can solve it, we’ll try to build the app exactly the way you imagined it. Everything I publish is free. If you want an app tailored just for you, get in touch by email.",
    suggestBtn: "Suggest an app",
    contactTitle: "Contact",
    contactText: "For collaboration, questions about the projects or an app suggestion.",
    linkedin: "LinkedIn",
    footer: "Independent projects by Vedran Zrinski.",
    privacy: "Privacy",
    legalTitle: "Privacy and terms",
    legal: [
      "This site is a personal portfolio. It uses no tracking cookies or analytics, loads no external fonts and shows no ads.",
      "The selected language is stored locally in your browser. Individual apps and tools may use local storage or external services for their features; details are given in each app.",
      "I only use the email you send me to reply to your enquiry.",
      "Content and source code are original work. Apps are provided “as is”, without warranty."
    ],
    close: "Close",
    types: { demo: "Demo on request", public: "Public app", case: "Case study" },
    altLang: { label: "HR", title: "Hrvatska verzija", href: "../" }
  }
};

const suggestCopy = {
  hr: {
    title: "Predloži aplikaciju | zrina.app",
    description: "Opiši problem za koji nisi našao gotovo rješenje. Probat ćemo zajedno izraditi aplikaciju točno onako kako si je zamislio.",
    h1: "Predloži aplikaciju",
    lead: "Postoji li nešto što ti treba, a nisi našao gotovo rješenje? Opiši mi to. Ako ga mogu riješiti, pokušat ćemo zajedno izraditi aplikaciju točno onako kako si je zamislio.",
    free: "Sve što objavljujem je besplatno. Ako želiš aplikaciju prilagođenu samo sebi, slobodno se javi na e-poštu.",
    fields: {
      problem: ["Koji problem želiš riješiti?", "Što trenutačno radiš ručno ili nezgrapno?"],
      who: ["Tko bi je koristio?", "Ti sam, obitelj, tvrtka, hobi grupa…"],
      tried: ["Što si već probao?", "Koje aplikacije ili alate i zašto ti nisu odgovarali?"],
      email: ["Tvoja e-pošta (neobavezno)", "Samo ako želiš odgovor."],
      name: ["Ime (neobavezno)", ""]
    },
    send: "Pošalji prijedlog",
    sending: "Šaljem…",
    ok: "Hvala! Prijedlog je poslan. Ako si ostavio e-poštu, javit ću ti se.",
    fallback: "Slanje trenutačno nije dostupno. Otvaram tvoj program za e-poštu s ispunjenim prijedlogom.",
    error: "Nešto je pošlo po zlu. Pokušaj ponovno ili piši na",
    privacy: "Podaci iz obrasca koriste se samo za odgovor na tvoj prijedlog i ne dijele se s trećima.",
    back: "← Natrag na portfolio",
    hp: "Ne popunjavaj ovo polje",
    subject: "Prijedlog aplikacije"
  },
  en: {
    title: "Suggest an app | zrina.app",
    description: "Describe a problem you couldn’t find a ready-made solution for. We’ll try to build the app exactly the way you imagined it.",
    h1: "Suggest an app",
    lead: "Is there something you need but couldn’t find a ready-made solution for? Describe it to me. If I can solve it, we’ll try to build the app exactly the way you imagined it.",
    free: "Everything I publish is free. If you want an app tailored just for you, feel free to get in touch by email.",
    fields: {
      problem: ["What problem do you want to solve?", "What are you doing by hand or awkwardly right now?"],
      who: ["Who would use it?", "Just you, family, a company, a hobby group…"],
      tried: ["What have you already tried?", "Which apps or tools, and why didn’t they fit?"],
      email: ["Your email (optional)", "Only if you want a reply."],
      name: ["Name (optional)", ""]
    },
    send: "Send suggestion",
    sending: "Sending…",
    ok: "Thank you! Your suggestion was sent. If you left an email, I’ll get back to you.",
    fallback: "Sending is not available right now. Opening your email app with the suggestion filled in.",
    error: "Something went wrong. Please try again or write to",
    privacy: "Form data is used only to reply to your suggestion and is never shared with third parties.",
    back: "← Back to portfolio",
    hp: "Leave this field empty",
    subject: "App suggestion"
  }
};

const projects = JSON.parse(fs.readFileSync(path.join(root, "projects.json"), "utf8"));

function head(c, { title, description, canonical, alternates, ogImage, prefix, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="${c.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
${alternates.map(([hl, href]) => `  <link rel="alternate" hreflang="${hl}" href="${href}">`).join("\n")}
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${c.lang === "hr" ? "hr_HR" : "en_US"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="theme-color" content="#050811">
  <meta name="google-adsense-account" content="ca-pub-8194219427036085">
${jsonLd ? `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n` : ""}  <link rel="icon" type="image/png" sizes="96x96" href="${prefix}assets/brand/zrinaapp_min.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${prefix}assets/brand/zrinaapp_new.png">
  <link rel="stylesheet" href="${prefix}site.css">
  <script>try{localStorage.setItem("zrina_lang","${c.lang}")}catch(e){}</script>
</head>`;
}

function topbar(c, prefix, homeHref, suggestHref, altHref) {
  return `<header class="topbar">
    <a class="brand" href="${homeHref}"><img src="${prefix}assets/brand/zrinaapp_min.png" alt="" width="32" height="32"><span>zrina<b>.app</b></span></a>
    <nav class="nav" aria-label="${c.lang === "hr" ? "Glavna navigacija" : "Main navigation"}">
      <a href="${homeHref}#radovi">${c.nav.work}</a>
      <a href="${homeHref}#o-meni">${c.nav.about}</a>
      <a href="${homeHref}#alati">${c.nav.tools}</a>
      <a href="${suggestHref}">${c.nav.suggest}</a>
      <a class="nav-cta" href="${homeHref}#kontakt">${c.nav.contact}</a>
      <a class="lang-link" href="${altHref}" hreflang="${c.lang === "hr" ? "en" : "hr"}" title="${c.altLang.title}">${c.altLang.label}</a>
    </nav>
  </header>`;
}

function card(c, p, prefix, flagship) {
  const href = `${prefix}${p.projectUrl}`;
  const type = p.status === "demo" ? c.types.demo : p.category === "b2b" ? c.types.case : c.types.public;
  const tags = p.tech[c.lang].slice(0, flagship ? 5 : 3).map((t) => `<li>${esc(t)}</li>`).join("");
  const isMail = p.launchUrl.startsWith("mailto:");
  const launch = p.category === "public"
    ? isMail
      ? `<a class="btn ghost" href="${esc(p.launchUrl)}?subject=${encodeURIComponent(p.subject)}">${c.demo}</a>`
      : `<a class="btn ghost" href="${esc(p.launchUrl)}" target="_blank" rel="noopener noreferrer">${c.launch} <span aria-hidden="true">↗</span></a>`
    : "";
  const label = flagship ? c.openCase : p.category === "b2b" ? c.openStudy : c.open;
  return `<article class="card${flagship ? " flagship" : ""}" style="--accent:${esc(p.accent)}">
        <a class="card-shot" href="${href}" tabindex="-1" aria-hidden="true"><img src="${prefix}${p.screenshot}" alt="" loading="lazy" decoding="async"></a>
        <div class="card-body">
          <div class="card-head"><img class="card-icon" src="${prefix}${p.icon}" alt="" width="44" height="44" loading="lazy"><div><h3><a href="${href}">${esc(p.name)}</a></h3><span class="card-type">${type}</span></div></div>
          <p>${esc(p.description[c.lang])}</p>
          <ul class="tags">${tags}</ul>
          <div class="card-actions"><a class="btn primary" href="${href}">${label} <span aria-hidden="true">→</span></a>${launch}</div>
        </div>
      </article>`;
}

function homePage(c) {
  const en = c.lang === "en";
  const prefix = en ? "../" : "";
  const selfUrl = en ? `${SITE}/en/` : `${SITE}/`;
  const suggestHref = en ? "suggest/" : "predlozi/";
  const flagship = projects.filter((p) => p.featuredRank).sort((a, b) => a.featuredRank - b.featuredRank);
  const others = projects.filter((p) => !p.featuredRank && p.category === "public");
  const workshop = projects.filter((p) => !p.featuredRank && p.category === "b2b");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "zrina.app", url: `${SITE}/`, inLanguage: c.lang },
      {
        "@type": "Person", name: "Vedran Zrinski", url: `${SITE}/`, sameAs: [LINKEDIN],
        jobTitle: en ? "Developer, AI builder, app designer" : "Developer, AI graditelj, dizajner aplikacija",
        knowsAbout: ["React", "TypeScript", "Progressive Web Apps", "Firebase", "AI-assisted development", "UX design"]
      }
    ]
  };
  const alternates = [["hr", `${SITE}/`], ["en", `${SITE}/en/`], ["x-default", `${SITE}/`]];
  return `${head(c, { title: c.title, description: c.description, canonical: selfUrl, alternates, ogImage: `${SITE}/assets/portfolio/share-card.png`, prefix, jsonLd })}
<body>
  <canvas id="bg-canvas" aria-hidden="true"></canvas>
  <a class="skip" href="#main">${c.skip}</a>
  ${topbar(c, prefix, en ? "./" : "./", suggestHref, en ? "../" : "en/")}
  <main id="main">
    <section class="hero">
      <span class="pill">${c.pill}</span>
      <h1>${c.h1}</h1>
      <p class="lead">${c.lead}</p>
      <p class="ai-note">${c.ai}</p>
      <div class="hero-actions">
        <a class="btn primary" href="#radovi">${c.ctaWork}</a>
        <a class="btn ghost" href="${suggestHref}">${c.ctaSuggest}</a>
        <a class="btn ghost" href="#kontakt">${c.ctaContact}</a>
      </div>
      <ul class="stats">${c.stats.map(([n, l]) => `<li><strong>${n}</strong><span>${l}</span></li>`).join("")}</ul>
    </section>

    <section id="radovi" class="section">
      <div class="section-head"><h2>${c.flagshipTitle}</h2><p>${c.flagshipLead}</p></div>
      <div class="grid flagship-grid">
      ${flagship.map((p) => card(c, p, prefix, true)).join("\n      ")}
      </div>
    </section>

    <section id="ostalo" class="section">
      <div class="section-head"><h2>${c.othersTitle}</h2><p>${c.othersLead}</p></div>
      <div class="grid">
      ${others.map((p) => card(c, p, prefix, false)).join("\n      ")}
      </div>
    </section>

    <section id="radionica" class="section">
      <div class="section-head"><h2>${c.workshopTitle}</h2><p>${c.workshopLead}</p></div>
      <div class="grid">
      ${workshop.map((p) => card(c, p, prefix, false)).join("\n      ")}
      </div>
    </section>

    <section id="alati" class="section">
      <div class="section-head"><h2>${c.toolsTitle}</h2><p>${c.toolsLead}</p></div>
      <ul class="tool-chips">${tools.map(([slug, name]) => `<li><a href="${prefix}${slug}/">${name}</a></li>`).join("")}</ul>
      <p><a class="btn ghost" href="${prefix}tools/">${c.toolsAll} <span aria-hidden="true">→</span></a></p>
    </section>

    <section id="proces" class="section">
      <div class="section-head"><h2>${c.processTitle}</h2></div>
      <ol class="steps">${c.process.map(([t, d], i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><h3>${t}</h3><p>${d}</p></li>`).join("")}</ol>
    </section>

    <section id="o-meni" class="section about">
      <div class="section-head"><h2>${c.aboutTitle}</h2></div>
      <div class="about-grid">
        <div>${c.about.map((t) => `<p>${t}</p>`).join("")}</div>
        <div><h3>${c.skillsTitle}</h3><ul class="tags big">${c.skills.map((s) => `<li>${s}</li>`).join("")}</ul></div>
      </div>
    </section>

    <section class="section cta-band">
      <h2>${c.suggestTitle}</h2>
      <p>${c.suggestText}</p>
      <a class="btn primary" href="${suggestHref}">${c.suggestBtn} <span aria-hidden="true">→</span></a>
    </section>

    <section id="kontakt" class="section contact">
      <div class="section-head"><h2>${c.contactTitle}</h2><p>${c.contactText}</p></div>
      <div class="contact-links">
        <a class="btn primary" href="mailto:${MAIL}">${MAIL}</a>
        <a class="btn ghost" href="${LINKEDIN}" target="_blank" rel="noopener noreferrer">${c.linkedin} <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </main>
  <footer class="footer">
    <span>© <span id="year">${new Date().getFullYear()}</span> zrina.app · ${c.footer}</span>
    <button type="button" class="link-btn" id="legal-open">${c.privacy}</button>
  </footer>
  <dialog id="legal" aria-labelledby="legal-title">
    <h2 id="legal-title">${c.legalTitle}</h2>
    ${c.legal.map((t) => `<p>${t}</p>`).join("\n    ")}
    <form method="dialog"><button class="btn primary">${c.close}</button></form>
  </dialog>
  <script src="${prefix}site.js" defer></script>
</body>
</html>
`;
}

function suggestPage(lang) {
  const c = copy[lang];
  const s = suggestCopy[lang];
  const en = lang === "en";
  const prefix = en ? "../../" : "../";
  const selfUrl = en ? `${SITE}/en/suggest/` : `${SITE}/predlozi/`;
  const alternates = [["hr", `${SITE}/predlozi/`], ["en", `${SITE}/en/suggest/`], ["x-default", `${SITE}/predlozi/`]];
  const field = (id, type, [label, hint], required, rows) => `<div class="field"><label for="${id}">${label}${required ? " *" : ""}</label>${hint ? `<small id="${id}-hint">${hint}</small>` : ""}${rows
    ? `<textarea id="${id}" name="${id}" rows="${rows}" maxlength="2000"${required ? " required" : ""}${hint ? ` aria-describedby="${id}-hint"` : ""}></textarea>`
    : `<input id="${id}" name="${id}" type="${type}" maxlength="200"${required ? " required" : ""}${hint ? ` aria-describedby="${id}-hint"` : ""}>`}</div>`;
  return `${head(c, { title: s.title, description: s.description, canonical: selfUrl, alternates, ogImage: `${SITE}/assets/portfolio/share-card.png`, prefix })}
<body class="suggest-page">
  ${topbar(c, prefix, en ? "../" : "../", "./", en ? "../../predlozi/" : "../en/suggest/")}
  <main id="main" class="narrow">
    <a class="back" href="${en ? "../" : "../"}">${s.back}</a>
    <h1>${s.h1}</h1>
    <p class="lead">${s.lead}</p>
    <p class="muted">${s.free}</p>
    <form id="suggest-form" novalidate data-ok="${esc(s.ok)}" data-fallback="${esc(s.fallback)}" data-error="${esc(s.error)}" data-sending="${esc(s.sending)}" data-send="${esc(s.send)}" data-subject="${esc(s.subject)}" data-mail="${MAIL}">
      ${field("problem", "text", s.fields.problem, true, 5)}
      ${field("who", "text", s.fields.who, false, 2)}
      ${field("tried", "text", s.fields.tried, false, 3)}
      ${field("name", "text", s.fields.name, false)}
      ${field("email", "email", s.fields.email, false)}
      <div class="hp" aria-hidden="true"><label>${s.hp}<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
      <button class="btn primary" type="submit">${s.send}</button>
      <p class="status" id="suggest-status" role="status" aria-live="polite"></p>
    </form>
    <p class="muted small">${s.privacy}</p>
  </main>
  <footer class="footer"><span>© ${new Date().getFullYear()} zrina.app · ${c.footer}</span></footer>
  <script src="${prefix}suggest.js" defer></script>
</body>
</html>
`;
}

function write(rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

module.exports = function buildHome() {
  write("index.html", homePage(copy.hr));
  write("en/index.html", homePage(copy.en));
  write("predlozi/index.html", suggestPage("hr"));
  write("en/suggest/index.html", suggestPage("en"));
  console.log("Generated homepage (HR/EN) and suggest pages.");
};

if (require.main === module) module.exports();
