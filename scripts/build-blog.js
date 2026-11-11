const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const site = "https://zrina.app";
const posts = [
  {
    slug: "obiteljski-recepti-sacuvati-price",
    title: "Obiteljski recept nije samo popis sastojaka",
    description: "Kako sačuvati obiteljske recepte zajedno s rukopisom, pričom i malim detaljima koji se ne mogu izmjeriti žlicom.",
    date: "2026-11-11",
    dateLabel: "11. studenoga 2026.",
    category: "Obiteljske uspomene",
    accent: "#d9694b",
    icon: "teka/teka-logo.png",
    imageAlt: "Mamina Teka — obiteljski recepti, rukopis i uspomene",
    facebook: "Imate li doma bilježnicu recepata u kojoj piše „od oka”, „dok ne bude gusto” i „koliko treba”? 🙂 Napisao sam zašto vrijedi sačuvati i priču iza recepta — ne samo sastojke. https://zrina.app/blog/obiteljski-recepti-sacuvati-price/",
    body: `
      <p class="article-lead">U mnogim obiteljima recepti žive na požutjelom papiru, u bilježnici zamrljanoj brašnom ili u nečijem sjećanju. A uz sastojke često ostanu i sitnice koje recept čine baš našim: tko ga je pripremao, za koju prigodu i što znači ono „dodaj malo, znaš već koliko”.</p>
      <p>Digitalizirati recept zato ne znači samo prepisati grame u tablicu. Cilj je sačuvati dovoljno konteksta da ga netko drugi može pripremiti — i osjetiti nešto od priče koja ide uz njega.</p>
      <h2>1. Sačuvaj izvornik prije prepisivanja</h2>
      <p>Fotografiraj cijelu stranicu, uključujući rubove, dopisane napomene i rukopis. Nemoj baciti ili prepraviti original čim napraviš čistu digitalnu verziju. Fotografija čuva izgled i tragove korištenja, a prepis olakšava čitanje i pretraživanje.</p>
      <h2>2. Odvoji ono što piše od onoga što pretpostavljaš</h2>
      <p>Ako je riječ nečitka ili mjera nejasna, označi je kao neizvjesnu umjesto da nagađanje predstaviš kao original. Možeš dodati vlastitu napomenu — primjerice kako si ti protumačio „šalicu” — ali jasno naznači da je to dopuna.</p>
      <h2>3. Zapiši priču i praktične detalje</h2>
      <p>Kome je recept pripadao? Je li se pripremao za Božić, nedjeljni ručak ili kad bi se obitelj okupila? Koji se sastojak danas zove drukčije? Zabilježi i redoslijed, veličinu posude, temperaturu pećnice ili znak po kojem se vidi da je jelo gotovo — ako ih znaš.</p>
      <h2>4. Dopusti da se obiteljska verzija mijenja</h2>
      <p>Recepti se prilagođavaju: netko smanji šećer, netko doda začin, a netko napokon otkrije koliko dugo se tijesto stvarno mijesi. Umjesto da se raspravlja koja je verzija „prava”, sačuvaj izvornu i zabilježi izmjene kao nove obiteljske varijante.</p>
      <h2>5. Podijeli promišljeno</h2>
      <p>Prije dijeljenja provjeri s obitelji što žele učiniti javnim. Fotografije rukopisa mogu sadržavati imena, adrese ili druge privatne bilješke. Privatna obiteljska zbirka ne mora biti javna da bi bila dostupna onima kojima je namijenjena.</p>
      <p>Upravo iz te ideje nastala je <a href="/teka/">Mamina Teka</a>: mjesto za fotografiju starog recepta, čitljiv prepis, obiteljske varijante i uspomenu uz jelo. Tehnologija ovdje ne zamjenjuje bilježnicu — pomaže da se njezin sadržaj sačuva i pronađe.</p>
      <aside class="article-note"><strong>Mali početak:</strong> odaberi jedan recept koji bi bilo šteta izgubiti. Fotografiraj ga, prepiši bez uljepšavanja nejasnih dijelova i dodaj jednu rečenicu o osobi koja ga je kuhala.</aside>
      <p class="article-question">Koji obiteljski recept biste vi prvo sačuvali — i čija je priča uz njega?</p>
    `
  },
  {
    slug: "sto-zabiljeziti-nakon-leta-dronom",
    title: "Što vrijedi zabilježiti nakon leta dronom?",
    description: "Kratka rutina za uredan dnevnik leta: uvjeti, baterije, oprema, uočeni problemi i sljedeći koraci za održavanje.",
    date: "2026-11-18",
    dateLabel: "18. studenoga 2026.",
    category: "Praktični alati",
    accent: "#38bdf8",
    icon: "drone-logbook/droneapp-logo.png",
    imageAlt: "DroneLogbook — digitalni dnevnik letova i opreme",
    facebook: "Poslije leta dronom lako ostane samo hrpa fotografija — a zaborave se baterija, uvjeti i sitnica koju treba provjeriti prije idućeg polijetanja. Složio sam kratku listu što zabilježiti, bez kompliciranja. https://zrina.app/blog/sto-zabiljeziti-nakon-leta-dronom/",
    body: `
      <p class="article-lead">Nakon leta obično želimo pogledati snimke i krenuti dalje. No upravo tada je najlakše zabilježiti detalje koji će kasnije pomoći: koliko je let trajao, kako se ponašala baterija, kakvi su bili uvjeti i je li oprema spremna za sljedeći put.</p>
      <p>Ne treba pisati dugačak izvještaj. Dovoljno je nekoliko dosljednih bilješki — važnije je da ih vodiš redovito nego da svaki zapis bude savršen.</p>
      <h2>Sažetak leta</h2>
      <ul>
        <li><strong>Datum i lokacija:</strong> zabilježi mjesto i, ako ti je korisno, približne koordinate.</li>
        <li><strong>Vrijeme leta:</strong> trajanje i svrha leta, primjerice vježba, snimanje ili pregled terena.</li>
        <li><strong>Uvjeti:</strong> vjetar, vidljivost i druge okolnosti koje su utjecale na upravljanje.</li>
        <li><strong>Oprema:</strong> letjelica, kontroler i oznake korištenih baterija ako su važne za tvoju evidenciju.</li>
      </ul>
      <h2>Baterije i oprema</h2>
      <p>Zapiši koju si bateriju koristio, početno stanje ako ga pratiš i sve neuobičajeno što si primijetio tijekom leta ili nakon slijetanja. Kratka napomena poput „provjeriti konektor” korisnija je od oslanjanja na pamćenje. Nakon leta obavi pregled prema uputama proizvođača i zabilježi što je potrebno servisirati ili zamijeniti.</p>
      <h2>Problemi, odluke i sljedeći korak</h2>
      <p>Je li prekinut planirani let? Je li se pojavio upozoravajući signal, problem s vezom ili neobično ponašanje? Zapiši što se dogodilo i što si poduzeo. Ako nešto zahtijeva pregled, označi to kao otvorenu stavku umjesto da pretpostaviš kako je problem nestao.</p>
      <h2>Dokumenti i privatnost</h2>
      <p>Vodi evidenciju dokumenata i rokova koji su relevantni za tvoju opremu i način letenja. Pravila ovise o lokaciji, kategoriji leta i mogu se mijenjati, zato za odluke uvijek provjeri aktualne službene izvore i lokalne zahtjeve. Nemoj dijeliti javno lokacije ili podatke koji bi mogli ugroziti privatnost ljudi ili osjetljivih mjesta.</p>
      <p><a href="/drone-logbook/">DroneLogbook</a> nastao je iz želje da podaci o letovima, baterijama, opremi, dokumentaciji i održavanju budu pregledni na jednom mjestu — umjesto razbacani po bilješkama i tablicama.</p>
      <aside class="article-note"><strong>Rutina od dvije minute:</strong> nakon leta upiši osnovne podatke, zabilježi neuobičajeno ponašanje i dodaj jednu konkretnu stavku za pregled ili sljedeći let.</aside>
      <p class="article-question">Što je vama najteže pratiti: letove, baterije, održavanje ili dokumentaciju?</p>
    `
  },
  {
    slug: "biljeske-s-terena-gljivarenje",
    title: "Gljivarenje: bilješke koje vrijedi ponijeti kući",
    description: "Kako fotografirati i zabilježiti nalaz u prirodi, sačuvati opažanja i pritom odgovorno postupati s nepoznatim gljivama.",
    date: "2026-11-25",
    dateLabel: "25. studenoga 2026.",
    category: "Priroda i tehnologija",
    accent: "#34d399",
    icon: "gljivobook/gljivobook-logo.png",
    imageAlt: "Gljivobook — terenski vodič i dnevnik nalaza gljiva",
    facebook: "Kad pronađete gljivu, fotografija izbliza nije uvijek cijela priča. Okolina, donja strana klobuka i kratka bilješka mogu puno značiti kad se kasnije vraćate svojim opažanjima. Evo jednostavnog načina za vođenje dnevnika — uz važan podsjetnik o sigurnosti. https://zrina.app/blog/biljeske-s-terena-gljivarenje/",
    body: `
      <p class="article-lead">Šetnja šumom lako se pretvori u niz fotografija bez konteksta: gdje je nalaz bio, kakvo je bilo stanište i što si uočio na licu mjesta? Nekoliko pažljivih bilješki može pomoći da se kasnije prisjetiš opažanja i bolje pratiš što nalaziš kroz sezonu.</p>
      <p>Dnevnik nalaza služi učenju i bilježenju doživljaja. Fotografija ili aplikacija same po sebi ne mogu potvrditi da je gljiva sigurna za jelo.</p>
      <h2>Fotografiraj više od klobuka</h2>
      <p>Ako je sigurno i možeš to učiniti bez oštećivanja staništa, zabilježi cijeli primjerak, klobuk, stručak i donju stranu. Dodaj i kadar šire okoline. Svjetlo, kut i mjerilo mogu pomoći da fotografija bude korisnija kasnije.</p>
      <h2>Zapiši kontekst</h2>
      <ul>
        <li><strong>Datum i približna lokacija:</strong> odaberi razinu preciznosti koja ti odgovara; ne moraš javno objavljivati osjetljive lokacije.</li>
        <li><strong>Stanište:</strong> opiši okolinu i vegetaciju koju možeš prepoznati, bez nagađanja.</li>
        <li><strong>Uvjeti:</strong> zabilježi vrijeme, vlagu ili druge okolnosti koje su ti se učinile važnima.</li>
        <li><strong>Opažanja:</strong> boja, oblik i vidljive promjene koje možeš usporediti na fotografijama.</li>
      </ul>
      <h2>Ostavi prostor za nesigurnost</h2>
      <p>Ako nisi siguran u naziv, napiši „nepoznata gljiva” ili zabilježi samo opažanja. To je odgovornije nego zaključati pogrešnu identifikaciju u dnevnik. Za učenje usporedi izvore i razgovaraj s iskusnom, pouzdanom osobom.</p>
      <aside class="safety-note"><strong>Važno za sigurnost:</strong> Gljivobook je informativni vodič i dnevnik, a ne zamjena za stručnu determinaciju. Nikad ne konzumiraj gljivu na temelju procjene aplikacije, fotografije ili ovog članka. Ako postoji dvojba, nemoj je jesti.</aside>
      <h2>Tehnologija kao bilježnica, ne kao sudac</h2>
      <p><a href="/gljivobook/">Gljivobook</a> spaja vodič za vrste, terenska opažanja i osobni dnevnik koji može raditi i bez internetske veze. Koristi ga za organiziranje bilješki i učenje — ne za odluku o jestivosti.</p>
      <p>Prije fotografiranja i bilježenja poštuj prirodu, lokalna pravila i privatnost drugih posjetitelja. Ne ostavljaj otpad i ne uništavaj stanište radi bolje fotografije.</p>
      <p class="article-question">Vodite li dnevnik nalaza ili se oslanjate na fotografije u mobitelu?</p>
    `
  }
];

const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[c]);

function header(blogIndex = false) {
  const blogHref = blogIndex ? "./" : "/blog/";
  return `<header class="topbar">
    <a class="brand" href="/"><img src="/assets/brand/zrinaapp_min.png" alt="" width="32" height="32"><span>zrina<b>.app</b></span></a>
    <nav class="nav" aria-label="Glavna navigacija">
      <a class="nav-work" href="/#radovi">Radovi</a><a href="/#o-meni">O meni</a><a class="nav-blog" href="${blogHref}" aria-current="page">Blog</a>
      <a href="/#alati">Alati</a><a href="/predlozi/">Predloži aplikaciju</a><a class="nav-cta" href="/#kontakt">Kontakt</a>
    </nav>
  </header>`;
}

function getTodayInZagreb(now = new Date()) {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zagreb",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);
  const date = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));
  return `${date.year}-${date.month}-${date.day}`;
}

function getPublishedPosts(now = new Date()) {
  const today = getTodayInZagreb(now);
  return posts.filter((post) => post.date <= today);
}

function head(title, description, canonical, image, type = "website", jsonLd = null) {
  return `<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | zrina.app</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(posts.find((post) => image.endsWith(`${post.slug}.png`))?.imageAlt || "zrina.app — bilješke o aplikacijama, alatima i idejama")}">
  <meta property="og:locale" content="hr_HR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="theme-color" content="#050811">
  <link rel="icon" type="image/png" sizes="96x96" href="/assets/brand/zrinaapp_min.png">
  <link rel="stylesheet" href="/site.css">
  <link rel="stylesheet" href="/blog.css">
${jsonLd ? `  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n` : ""}</head>`;
}

function postCard(post) {
  return `<article class="blog-card">
    <p class="blog-meta">${esc(post.category)} <span aria-hidden="true">·</span> <time datetime="${post.date}">${post.dateLabel}</time></p>
    <h2><a href="/blog/${post.slug}/">${esc(post.title)}</a></h2>
    <p>${esc(post.description)}</p>
    <a class="blog-read" href="/blog/${post.slug}/">Pročitaj članak <span aria-hidden="true">→</span></a>
  </article>`;
}

function article(post) {
  const url = `${site}/blog/${post.slug}/`;
  const image = `${site}/assets/share-cards/blog/${post.slug}.png`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "hr",
    mainEntityOfPage: url,
    image,
    author: { "@type": "Person", name: "Vedran Zrinski", url: `${site}/` },
    publisher: { "@type": "Organization", name: "zrina.app", url: `${site}/` }
  };
  return `${head(post.title, post.description, url, image, "article", jsonLd)}
<body class="blog-page">
  ${header()}
  <main id="main" class="article-main">
    <a class="blog-back" href="/blog/">← Sve objave</a>
    <article>
      <header class="article-header">
        <p class="blog-meta">${esc(post.category)} <span aria-hidden="true">·</span> <time datetime="${post.date}">${post.dateLabel}</time></p>
        <h1>${esc(post.title)}</h1>
        <p class="article-summary">${esc(post.description)}</p>
      </header>
      <div class="article-content">${post.body}</div>
      <footer class="article-footer">
        <p>Članak je dio bilješki na <a href="/">zrina.app</a> — portfolio osobnih projekata, aplikacija i besplatnih alata.</p>
        <a class="btn ghost" href="/blog/">Pogledaj ostale članke</a>
      </footer>
    </article>
  </main>
  <footer class="footer"><span>© ${new Date().getFullYear()} zrina.app · Autorski projekti Vedrana Zrinskog.</span><a href="/#kontakt">Kontakt</a></footer>
</body>
</html>
`;
}

function indexPage(publishedPosts) {
  const canonical = `${site}/blog/`;
  const description = "Praktične bilješke o obiteljskim uspomenama, prirodi, dronovima i izradi korisnih aplikacija.";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Bilješke sa zrina.app",
    description,
    url: canonical,
    inLanguage: "hr",
    blogPost: publishedPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${site}/blog/${post.slug}/`,
      datePublished: post.date
    }))
  };
  return `${head("Bilješke — ideje, alati i aplikacije", description, canonical, `${site}/assets/share-cards/blog/blog.png`, "website", jsonLd)}
<body class="blog-page">
  ${header(true)}
  <main id="main" class="blog-main">
    <section class="blog-intro">
      <p class="blog-eyebrow">BILJEŠKE SA ZRINA.APP</p>
      <h1>Ideje iz stvarnog života.<br><span>Alati koji pomažu.</span></h1>
      <p>Ovdje dijelim praktične zapise o obiteljskim uspomenama, boravku u prirodi, dronovima i tome kako svakodnevni problem može postati korisna aplikacija.</p>
    </section>
    <section class="blog-list" aria-label="Članci">
      ${publishedPosts.length
        ? publishedPosts.map(postCard).join("\n")
        : '<p class="blog-empty">Nove bilješke stižu uskoro.</p>'}
    </section>
  </main>
  <footer class="footer"><span>© ${new Date().getFullYear()} zrina.app · Autorski projekti Vedrana Zrinskog.</span><a href="/#kontakt">Kontakt</a></footer>
</body>
</html>
`;
}

function shareCard(title, description, accent) {
  const wrap = (value, limit, maxLines) => {
    const lines = [];
    let line = "";
    for (const word of value.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && candidate.length > limit) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[,.!?;:]?$/, "")}…`;
    }
    return lines;
  };
  const titleLines = wrap(title, 25, 3);
  const descriptionLines = wrap(description, 52, 3);
  const titleSvg = titleLines.map((text, index) =>
    `<tspan x="92" dy="${index === 0 ? 0 : 58}">${esc(text)}</tspan>`
  ).join("");
  const descriptionSvg = descriptionLines.map((text, index) =>
    `<tspan x="92" dy="${index === 0 ? 0 : 32}">${esc(text)}</tspan>`
  ).join("");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#08111f"/><stop offset="1" stop-color="#111c2c"/></linearGradient></defs>
    <rect width="1200" height="630" fill="#050811"/><rect x="36" y="34" width="1128" height="562" rx="8" fill="url(#bg)"/>
    <circle cx="1065" cy="90" r="220" fill="${accent}" opacity=".09"/>
    <text x="92" y="112" fill="${accent}" font-family="Arial,sans-serif" font-size="26" font-weight="700">zrina.app · BILJEŠKE</text>
    <text x="92" y="230" fill="#f3f6fb" font-family="Arial,sans-serif" font-size="44" font-weight="700">${titleSvg}</text>
    <text x="92" y="420" fill="#c3ceda" font-family="Arial,sans-serif" font-size="22">${descriptionSvg}</text>
    <rect x="92" y="536" width="140" height="4" rx="2" fill="${accent}"/>
  </svg>`);
}

async function buildCard(post) {
  const sharp = require("sharp");
  const logo = await sharp(path.join(root, post.icon)).resize(360, 360, { fit: "contain" }).png().toBuffer();
  await sharp(shareCard(post.title, post.description, post.accent))
    .composite([{ input: logo, left: 780, top: 145 }])
    .png()
    .toFile(path.join(root, "assets", "share-cards", "blog", `${post.slug}.png`));
}

async function main() {
  const articleDir = path.join(root, "blog");
  fs.mkdirSync(articleDir, { recursive: true });
  fs.mkdirSync(path.join(root, "assets", "share-cards", "blog"), { recursive: true });
  const publishedPosts = getPublishedPosts();
  const publishedSlugs = new Set(publishedPosts.map((post) => post.slug));
  fs.writeFileSync(path.join(articleDir, "index.html"), indexPage(publishedPosts), "utf8");
  for (const post of posts) {
    const dir = path.join(articleDir, post.slug);
    const cardPath = path.join(root, "assets", "share-cards", "blog", `${post.slug}.png`);
    if (!publishedSlugs.has(post.slug)) {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.rmSync(cardPath, { force: true });
      continue;
    }
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), article(post), "utf8");
    await buildCard(post);
  }
  const sitemapPath = path.join(root, "sitemap.xml");
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const withoutBlogPosts = sitemap.replace(
    /^\s*<url><loc>https:\/\/zrina\.app\/blog\/(?:[^<]*)<\/loc><\/url>\r?\n/gm,
    ""
  );
  const blogUrls = [
    `${site}/blog/`,
    ...publishedPosts.map((post) => `${site}/blog/${post.slug}/`)
  ].map((url) => `  <url><loc>${url}</loc></url>`).join("\n");
  const insertionPoint = "  <url><loc>https://zrina.app/en/suggest/</loc></url>";
  if (!withoutBlogPosts.includes(insertionPoint)) {
    throw new Error("Cannot add blog URLs to sitemap: expected insertion point is missing.");
  }
  fs.writeFileSync(
    sitemapPath,
    withoutBlogPosts.replace(insertionPoint, `${insertionPoint}\n${blogUrls}`),
    "utf8"
  );
  const overviewSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#091322"/><stop offset="1" stop-color="#14213a"/></linearGradient></defs><rect width="1200" height="630" fill="#050811"/><rect x="36" y="34" width="1128" height="562" rx="8" fill="url(#g)"/><circle cx="1010" cy="100" r="230" fill="#00f0ff" opacity=".1"/><text x="92" y="135" fill="#00f0ff" font-family="Arial,sans-serif" font-size="28" font-weight="700">zrina.app</text><text x="92" y="275" fill="#f3f6fb" font-family="Arial,sans-serif" font-size="68" font-weight="700">Bilješke</text><text x="92" y="345" fill="#c3ceda" font-family="Arial,sans-serif" font-size="30">Ideje, alati i aplikacije iz stvarnog života.</text><rect x="92" y="450" width="180" height="4" fill="#00f0ff"/></svg>`);
  const sharp = require("sharp");
  await sharp(overviewSvg).png().toFile(path.join(root, "assets", "share-cards", "blog", "blog.png"));
  console.log(`Generated blog index, ${publishedPosts.length} published articles and share cards.`);
}

module.exports = { getPublishedPosts, getTodayInZagreb, posts };

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
