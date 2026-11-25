const fs = require("node:fs");
const path = require("node:path");
const assetVersion = require("./site-assets");
const englishPosts = require("./blog-english");

const root = path.resolve(__dirname, "..");
const site = "https://zrina.app";
const posts = [
  {
    slug: "kako-sam-izgradio-aplikaciju-za-praonicu",
    title: "Kako sam izgradio aplikaciju za praćenje vozila u praonici",
    description: "Od traženja vozila i papirnatih evidencija do aplikacije za praonicu: lokacije, ključevi, obračun i tehničke odluke.",
    date: "2026-11-11",
    dateLabel: "11. studenoga 2026.",
    modifiedDate: "2026-11-12",
    category: "Iza aplikacije",
    accent: "#40d9d0",
    icon: "carwash/carwash-logo.png",
    imageAlt: "carwash.app — aplikacija za praćenje tijeka vozila u praonici",
    facebook: "Kako od traženja vozila i papirnatih evidencija doći do zajedničkog pregleda praonice? Pišem o stvarnom problemu i tehničkim odlukama iza aplikacije. https://zrina.app/blog/kako-sam-izgradio-aplikaciju-za-praonicu/",
    body: `
      <p class="article-lead">„Gdje je auto? Gdje je ključ? Je li pranje gotovo?” To nisu bila pitanja na koja smo odgovarali jednim pogledom. Često su značila hodanje, telefonske pozive i potragu po više parkirališta. Upravo zato počeo sam razvijati aplikaciju za praonicu.</p>
      <p>Izvorna verzija nastala je uz Google Apps Script i Google Sheets te je isprobana u stvarnom radnom procesu. U ovom tekstu namjerno izostavljam naziv organizacije, prepoznatljivu kartu i poslovne podatke, ali želim dočarati problem zbog kojeg je aplikacija nastala.</p>
      <h2>Projekt koji je počeo iz svakodnevnog rada</h2>
      <p>Kao servisni savjetnik problem sam upoznao iz svakodnevnog rada s kolegama. Odlučio sam samoinicijativno potražiti rješenje i razvijati aplikaciju u slobodno vrijeme, na vlastitim resursima, uz pomoć AI alata poput Geminija i razvojno okruženje Visual Studio Code.</p>
      <p>Zatim sam je ponudio za korištenje u radnom procesu. Tijekom probnog korištenja dobio sam pozitivne povratne informacije, no projekt nije došao do konačnog uvođenja niti prelaska na infrastrukturu organizacije. Danas se ondje više ne koristi. Iskustvo mi je ipak pokazalo koliko je vrijedno razumjeti svakodnevni posao ljudi prije nego što se krene pisati rješenje.</p>
      <h2>Zašto je bilo teško pronaći jedan auto?</h2>
      <p>Praonica je radila u sklopu većeg servisnog kompleksa, odvojena od prijema vozila. Koristio ju je servis, ali i drugi interni i vanjski korisnici. Automobili su tijekom dana mogli biti na različitim parkiralištima ili u različitim dijelovima kompleksa; ključ nije nužno bio ondje gdje i automobil.</p>
      <p>Prije probnog korištenja aplikacije kolege servisni savjetnici i ja tijekom radnog dana radili smo u prosjeku oko 15.000 koraka. U to su ulazili i traženje vozila i ključeva te prevoženje vozila za isporuku. Broj je približna procjena ukupnih koraka, ne izmjerena ušteda zahvaljujući aplikaciji.</p>
      <h2>Desetak listova papira svaki dan</h2>
      <p>Popis opranih vozila vodio se na ispisanim tablicama koje su se ispunjavale rukom — prema mojem iskustvu, oko deset A4 listova dnevno. Podatke je zatim trebalo prepisivati, razvrstavati i računati ručno. Na kraju mjeseca količine i različite vrste pranja obračunavale su se uz papir, olovku i kalkulator.</p>
      <p>Servis je bio najveći korisnik. Pranje servisnog vozila u tom se procesu nije naplaćivalo kupcu, nego se obračun vodio interno između praonice i servisa. Trebalo je razlikovati naručitelje i vrste usluga kako bi evidencija poslužila kao podloga za odgovarajući obračun, ne samo kao popis automobila.</p>
      <p>Aplikacija je zato povezala dnevni rad i evidenciju: podaci uneseni uz vozilo mogu se kasnije pregledavati po razdoblju, odjelu i vrsti pranja, uz pripadajući cjenik. Izvorna izvedba nudi pregled količina i iznosa te izvoz podataka kao podlogu za pripremu obračuna.</p>
      <h2>Jedan zapis, različiti poslovi</h2>
      <p>Vozilo prolazi kroz nekoliko koraka, a različitim ljudima trebaju različite informacije. Nekome je važan prijem, drugome redoslijed pranja, parkirno mjesto ili ključ. Zato su prikazi i dostupne radnje prilagođeni radnoj ulozi, dok svi rade nad zajedničkim zapisima.</p>
      <p>Primjerice, osoba u praonici može označiti da je vozilo u pranju ili gotovo i zabilježiti gdje je ostavljeno. Savjetniku su zatim na raspolaganju status, posljednja upisana lokacija i podatak o ključu. Lokaciju upisuju ljudi, pa je za dobar pregled važno redovito je ažurirati.</p>
      <p>U originalu je za odabir lokacije korištena i karta radnog prostora, s dodatnim opisima pojedinih zona. Ona ovdje nije objavljena jer prikazuje stvarnu lokaciju. Važna ideja nije sama fotografija, nego mogućnost da tim koristi zajedničke, razumljive oznake umjesto neodređenog „tamo iza”.</p>
      <h2>Kako sam razmišljao o rješenju</h2>
      <p>U nastavku pokazujem nekoliko kratkih isječaka iz izvornog koda, bez podataka o korisnicima ili organizaciji. Primjer izvještaja prikazan je kao pojednostavljeni pseudokod.</p>
      <h2>Sinkronizacija preko Google Sheets i Apps Scripta</h2>
      <p>U izvornoj izvedbi Google Sheets služi kao zajedničko spremište, a Apps Script obrađuje zahtjeve klijenata. Nakon izmjena ažurira se oznaka verzije; otvoreni ekran periodički provjerava postoje li noviji podaci i po potrebi osvježava popis.</p>
      <p>Ovo je stvarna funkcija koja pokreće provjeru na klijentu:</p>
      <pre><code>function pokreniSmartSync() {
    if (window.isSyncRunning &amp;&amp; smartSyncTimer) return;
    if (smartSyncTimer) clearInterval(smartSyncTimer);
    smartSyncTimer = setInterval(osvjeziRadionicu, 3000);
    window.isSyncRunning = true;
}</code></pre>
      <p>A ovo je funkcija u Apps Scriptu koja postavlja oznaku verzije u privremenu pohranu:</p>
      <pre><code>function bumpVersion() {
  let cache = CacheService.getScriptCache();
  if(cache) cache.put('db_verzija', Date.now().toString(), 21600);
}</code></pre>
      <p>Prva funkcija postavlja periodično osvježavanje i izbjegava pokretanje dodatnog timera ako već radi. Druga sprema vremensku oznaku kao verziju podataka, s rokom od 21.600 sekundi u predmemoriji.</p>
      <p>Ideja je da ekran ne mora svaki put ponovo preuzimati cijeli popis kad se ništa nije promijenilo. Nakon uspješne promjene u izvornom kodu ažurira se oznaka verzije; na sljedećoj provjeri poslužitelj može vratiti podatke ili odgovor da nema promjene.</p>
      <p>To je <em>polling</em>, a ne push veza: provjera se pokreće približno svake tri sekunde, uz dodatno vrijeme mreže i obrade. Lokalna kopija može ubrzati početni prikaz dok se čeka odgovor poslužitelja.</p>
      <h2>Od zapisa do pripreme obračuna</h2>
      <p>Umjesto ponovnog ručnog prebrojavanja papira, izvještaj prolazi kroz evidentirana vozila za odabrano razdoblje, razvrstava ih prema naručitelju i vrsti usluge te pridružuje cijenu iz cjenika. Pojednostavljeno:</p>
      <pre><code>// Ilustracija: grupiranje stavki izvještaja
za svaki zapis u odabranomRazdoblju:
    grupa = dohvatiGrupu(zapis.odjel, zapis.vrstaPranja)
    grupa.kolicina += 1
    grupa.iznos += cijenaZa(grupa)</code></pre>
      <p>U izvornom kodu izvještaj čita aktivne i arhivirane zapise, grupira ih po odjelu i vrsti pranja te koristi cjenik. Tako podaci prikupljeni tijekom dana postaju pregledna podloga za obračun.</p>
      <h2>Bez signala: važna razlika između prikaza i spremanja</h2>
      <p>Zadnje poznate podatke korisno je vidjeti i kada veza oslabi. No prikaz spremljenog stanja nije isto što i pouzdano spremanje novih radnji bez interneta. U pregledanoj verziji klijent pri prekidu veze onemogućuje određene akcije; nisam potvrdio postojanje trajnog reda izmjena koji bi ih kasnije automatski poslao.</p>
      <p>To je za mene važna lekcija: offline mogućnost treba opisati i testirati po pojedinoj radnji, a ne obećavati je samo zato što je aplikacija dostupna na mobitelu.</p>
      <h2>Uloge nisu zamjena za sigurnu prijavu</h2>
      <p>Izvorna verzija koristi identifikator pohranjen u pregledniku i postupak odobravanja korisnika i dodjele uloge. To olakšava organizaciju prikaza, ali identifikator preglednika sam po sebi nije pouzdana potvrda identiteta. Kod nove izvedbe takav pristup treba zamijeniti odgovarajućom autentifikacijom i provjerama ovlasti na poslužitelju.</p>
      <h2>OCR očitavanje tablica i VIN-a</h2>
      <p>U originalnom Android okruženju fotografija se obrađuje prepoznavanjem teksta, a rezultat se dodatno prilagođava pravilima za podatke o vozilu. Prepoznavanje može pogriješiti — zato je rezultat pomoć pri unosu, ne zamjena za provjeru osobe koja radi s vozilom.</p>
      <p>Na primjer, slovo O i znamenka 0 na fotografiji mogu izgledati vrlo slično. Kod VIN-a aplikacija može usporediti više mogućih zapisa, primijeniti pravila dopuštenih znakova i uzeti u obzir kontrolnu znamenku pri rangiranju. Kod registarske oznake ispravci ovise i o položaju znaka.</p>
      <p>Ovaj stvarni dio petlje za odabir VIN kandidata prikazuje provjeru formata i dodatno bodovanje kontrolne znamenke:</p>
      <pre><code>let komad = cisto.substring(i, i + 17);
let popravljeno = popraviVINOCR(komad);
if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(popravljeno)) continue;

let score = 0;
if (isValidVINChecksum(popravljeno)) score += 100;</code></pre>
      <p>Ostatak funkcije priprema tekst, razmatra različite kandidate i dodatno ih boduje. Kontrolna znamenka povećava broj bodova kandidata, a osoba koja unosi podatke provjerava rezultat prije potvrde.</p>
      <h2>Tri izvedbe, jedan problem</h2>
      <p>Od izvorne verzije nastala je i zasebna web-izvedba s drukčijim poslužiteljem i bazom, a kasnije eksperimentalna PWA verzija razvijena uz AI Studio. To nisu iste implementacije i ne treba pretpostaviti da svaka funkcija originala radi jednako u novijim verzijama.</p>
      <h2>Od iskustva iz servisa do rješenja uz AI</h2>
      <p>Kao servisni savjetnik, problem nisam upoznao iz opisa zadatka. Radio sam s kolegama koji su svakodnevno tražili vozila i ključeve, usklađivali predaju i prepisivali podatke. Iskustvo iz operative pomoglo mi je prepoznati gdje proces zapinje i koje informacije ljudima trebaju baš u trenutku kad su im ruke i dan već puni posla.</p>
      <p>Uz vlastiti angažman, tehničko znanje i pomoć AI alata tu sam ideju pretvorio u aplikaciju koju su kolege isprobali u stvarnom radnom procesu i za koju sam dobio pozitivne povratne informacije. AI mi je pomogao u izradi, ali nije mogao umjesto mene upoznati taj posao, odrediti što je korisno ili potvrditi da je svaka funkcija ispravna.</p>
      <p>Zato mi je važnije od samog izbora tehnologije pitanje: pomaže li rješenje čovjeku da obavi posao jednostavnije? Treba misliti i na rubne slučajeve: što kad veza nestane, podatak nije ažuriran ili se isti unos pokuša napraviti dvaput? Kod koji izgleda uredno još uvijek treba provjeriti, a kad nešto pođe po zlu, poruka o grešci treba pomoći pronaći uzrok.</p>
      <p>Izvorna aplikacija isprobana je u konkretnom radnom okruženju, ali nije konačno uvedena. Za širu upotrebu potrebne su dodatne provjere, osobito prijave, ovlasti, pouzdanosti i zaštite podataka. Eksperimentalnu PWA izvedbu također treba promatrati zasebno, a ne kao potvrđeno gotov proizvod.</p>
      <aside class="article-note"><strong>Što nosim dalje:</strong> razumjeti posao, slušati ljude koji ga rade i koristiti tehnologiju kao pomoć da se stvarni problemi pretvore u provjerena, korisna rješenja.</aside>
      <p>Više o tijeku rada i originalnoj arhitekturi nalazi se na <a href="/carwash/">stranici projekta carwash.app</a>.</p>
    `
  },
  {
    slug: "obiteljski-recepti-sacuvati-price",
    title: "Obiteljski recept nije samo popis sastojaka",
    description: "Kako sačuvati obiteljske recepte zajedno s rukopisom, pričom i malim detaljima koji se ne mogu izmjeriti žlicom.",
    date: "2026-11-11",
    dateLabel: "11. studenoga 2026.",
    modifiedDate: "2026-11-12",
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
      <h2>Mamina Teka s AI-jem i bez njega</h2>
      <p>Već spremljene recepte možeš pregledavati i uređivati, a prijavom Google računom sinkronizirati ih i podijeliti s obitelji. Za te korake ne trebaš Gemini API ključ.</p>
      <p>Kad želiš dodati recept fotografiranjem rukopisa, vlastiti Gemini API ključ omogućuje AI-ju da predloži prepis i složi podatke za pregled. Prije spremanja usporedi tekst i količine s izvornikom, osobito ako je rukopis nejasan.</p>
      <p>Uz ključ možeš pokušati izraditi i ilustraciju jela prema receptu. To je AI prikaz, ne fotografija stvarno pripremljenog jela; dostupnost generiranja i eventualni trošak ovise o Googleovu modelu, računu i kvotama. AI obrada traži internetsku vezu.</p>
      <p><a href="https://mamina-teka.zrina.app/">Otvori Maminu Teku</a> ili pogledaj <a href="/teka/">kako je projekt nastao</a>.</p>
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
      <aside class="safety-note"><strong>Važno za sigurnost:</strong> Nikad ne jedi gljivu na temelju aplikacije ili fotografije. Ako je ne poznaješ, nemoj je konzumirati bez potvrde pouzdanog poznavatelja koji je pregledao primjerak uživo — bez obzira na to koliko si siguran. Ako i dalje postoji dvojba, nemoj je jesti.</aside>
      <h2>Tehnologija kao bilježnica, ne kao sudac</h2>
      <p><a href="/gljivobook/">Gljivobook</a> spaja vodič za vrste, morfološki filtar i osobni dnevnik. Lokalni determinator može pomoći suziti izbor prema opaženim obilježjima i fotografijama, bez Gemini API ključa i internetske veze.</p>
      <p>Uz internet i vlastiti Gemini API ključ možeš odabrati i AI skener koji predlaže moguće vrste na temelju fotografija i opažanja. To može ubrzati početnu pretragu: zatim pročitaj opise, usporedi obilježja i moguće dvojnice te zabilježi ono što si uočio. AI prijedlog nije potvrda vrste ni jestivosti.</p>
      <p><a href="https://gljivobook.zrina.app/">Otvori Gljivobook</a> i koristi ga kao pomoć pri učenju i vođenju terenskih bilješki.</p>
      <p>Prije fotografiranja i bilježenja poštuj prirodu, lokalna pravila i privatnost drugih posjetitelja. Ne ostavljaj otpad i ne uništavaj stanište radi bolje fotografije.</p>
      <p class="article-question">Vodite li dnevnik nalaza ili se oslanjate na fotografije u mobitelu?</p>
    `
  },
  {
    slug: "od-starog-mini-pc-ja-do-kucnog-servera",
    title: "Od starog mini PC-ja do kućnog servera: AdGuard, razvojne baze, retro igre i alati bez pretplate",
    description: "Kako sam rabljeni poslovni mini PC pretvorio u tihi Debian kućni server s Dockerom — od blokiranja reklama u mreži i razvojnih baza do retro igara i rada u Termiusu.",
    date: "2026-12-02",
    dateLabel: "2. prosinca 2026.",
    category: "Iza kulisa",
    accent: "#38bdf8",
    icon: "assets/blog/home-server.jpg",
    imageAlt: "Kućni server na mini PC-ju — Debian, Docker, AdGuard i razvojni alati",
    facebook: "Većina nas doma ima neko starije računalo koje je presporo za današnji Windows, ali potpuno ispravno za tihi kućni server. Napisao sam kako sam posložio Debian 12, Docker, AdGuard za cijelu kuću, lokalne baze za razvoj i rad iz terminala preko Termiusa. https://zrina.app/blog/od-starog-mini-pc-ja-do-kucnog-servera/",
    body: `
      <p class="article-lead">Većina nas doma ima neko starije računalo koje je presporo za današnji Windows, ali potpuno ispravno da bi završilo u ladici ili na otpadu. Umjesto plaćanja nekoliko različitih mjesečnih pretplata za pohranu datoteka, pametni dom, multimediju ili razvojna okruženja, odlučio sam jednom takvom računalu dati novu ulogu — pretvoriti ga u tihi kućni server koji radi 24 sata dnevno.</p>
      <p>U igri je bio rabljeni uredski <strong>Lenovo ThinkCentre M73</strong> (Intel Core i3 procesor i interni disk od 500 GB) uz dodatni prijenosni vanjski USB 3.0 hard disk za veću arhivu. U nastavku donosim konkretan tehnički pregled kako sam posložio sustav, kako izgleda svakodnevni rad iz terminala te koje servise vrtim u Dockeru za posao, razvoj novih projekata i zabavu.</p>
      <h2>1. Temelj sustava: Debian 12, statička adresa i CasaOS</h2>
      <p>Na početku sam vagao isplati li se za kućni server iskoristiti stari mobitel ili kupovati Raspberry Pi. Rabljeni poslovni mini PC pokazao se kao najstabilnije rješenje: napravljen je da godinama radi uključen u struju bez brige oko baterije, ima prave USB 3.0 i SATA priključke, a standardna x86 arhitektura znači da svaki moderni Docker paket radi iz prve.</p>
      <p>Prije podizanja servisa odradio sam tri osnovne stvari koje kasnije štede hrpu živaca:</p>
      <ul>
        <li><strong>Čisti Debian 12 bez grafičkog sučelja:</strong> Minimalna instalacija troši zanemarivu količinu radne memorije i procesora, pa gotovo svi resursi ostaju slobodni za kontejnere. Sva administracija odrađuje se iz daljine putem SSH veze.</li>
        <li><strong>Rezervacija statičke IP adrese na routeru:</strong> Kako se lokalna adresa servera nikad ne bi promijenila nakon nestanka struje ili ponovnog pokretanja routera, vezao sam njegovu MAC adresu uz fiksnu IP adresu u lokalnoj mreži.</li>
        <li><strong>Trajno montiranje vanjskog diska preko UUID-a:</strong> Vanjski disk dodao sam u <code>/etc/fstab</code> koristeći njegov jedinstveni UUID umjesto oznake poput <code>/dev/sdb1</code>, čime je osigurano da se disk nakon svakog restarta uvijek montira na točno istu putanju.</li>
      </ul>
      <p>Na takvu podlogu instalirao sam <strong>CasaOS</strong> — lagano web-sučelje koje radi iznad <strong>Dockera</strong>. Omogućuje pregledno upravljanje kontejnerima, mapiranje mapa (volumena) i praćenje zauzeća resursa kroz preglednik, uz potpunu slobodu da za specifične stvari podigneš vlastiti <code>docker-compose.yml</code> konfiguracijski fajl.</p>
      <h2>2. Rad u terminalu i Termius: administracija s laptopa ili mobitela</h2>
      <p>Iako CasaOS nudi pregledno grafičko sučelje u pregledniku, pravi nadzor nad Linux serverom počinje tek u terminalu. Za spajanje sa svog Windows laptopa i s Android mobitela koristim <strong>Termius</strong> — moderan SSH klijent koji pamti spremljene hostove, SSH ključeve i gotove isječke naredbi (<em>Snippets</em>), pa ne moram svaki put ručno tipkati dugačke putanje kad sam u pokretu.</p>
      <p>Ovo je nekoliko osnovnih naredbi koje najčešće koristim za brzu provjeru stanja servera, diskova i Docker kontejnera:</p>
      <pre><code># Spajanje na server iz terminala
ssh korisnik@lokalna-ip-adresa

# Provjera zauzeća diskova i montiranih particija (interni + vanjski USB disk)
df -h
lsblk -f

# Dohvaćanje UUID oznake vanjskog diska prije upisa u /etc/fstab
sudo blkid

# Pregled svih aktivnih Docker kontejnera, portova i potrošnje resursa
docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
docker stats --no-stream

# Podizanje ili ažuriranje vlastitog servisa iz docker-compose.yml datoteke
docker compose pull &amp;&amp; docker compose up -d

# Provjera statusa privatne Tailscale mreže
tailscale status</code></pre>
      <p>Kad jednom spremiš ove naredbe kao brze prečace u Termiusu, provjera stanja cijelog servera ili pokretanje novog testnog okruženja traje doslovno pet sekundi, čak i s ekrana mobitela.</p>
      <h2>3. AdGuard Home: blokiranje reklama na razini cijele mreže</h2>
      <p>Jedan od najkorisnijih servisa na serveru je <strong>AdGuard Home</strong>. Umjesto instaliranja dodataka za blokiranje oglasa na svaki mobitel, tablet i računalo u kući posebno, AdGuard preuzima ulogu lokalnog DNS poslužitelja (na standardnom portu <code>53</code>) za cijelu kućnu mrežu.</p>
      <ul>
        <li><strong>Preusmjeravanje prometa na routeru:</strong> U DHCP postavkama glavnog kućnog routera postavi se lokalna IP adresa kućnog servera kao primarni DNS poslužitelj. Čim se bilo koji uređaj spoji na kućni Wi-Fi, svi njegovi DNS upiti automatski prolaze kroz AdGuard.</li>
        <li><strong>Šifrirani upstream DNS (DoH):</strong> AdGuard samostalno prosljeđuje legitimne upite prema vanjskim poslužiteljima (poput Cloudflare <code>1.1.1.1</code> ili Quad9 <code>9.9.9.9</code>) koristeći <em>DNS-over-HTTPS</em> (DoH), čime se sprječava prisluškivanje i mijenjanje DNS odgovora na razini operatera.</li>
        <li><strong>Filter liste i ručne iznimke:</strong> Uz osnovne liste za blokiranje oglasa i trackera (poput OISD liste), u sučelju u realnom vremenu vidiš koji uređaj u kući šalje kakve zahtjeve. Ako neka domaća aplikacija ili servis zapne zbog preagresivnog filtra, jednim klikom dodaješ domenu na <em>whitelistu</em>.</li>
      </ul>
      <p>Zanimljiva nuspojava u praksi: kad ti se ponekad učini da neka web-stranica ne radi, dobar dio razloga zna biti upravo lokalni DNS blok ili zastarjeli DNS cache — za brzu provjeru je li problem lokalno ili na samom serveru stranice složio sam i alat <a href="/hostvitals/">HostVitals</a>.</p>
      <h2>4. Lokalni razvojni sandbox: baze podataka i Webtop</h2>
      <p>Kad u slobodno vrijeme razvijaš nove web-aplikacije, najgore je zatrpati glavni laptop raznim servisima koji stalno rade u pozadini, troše bateriju i međusobno si smetaju. Kućni server ovdje služi kao izolirani testni poligon:</p>
      <ul>
        <li><strong>Lokalne baze podataka za projekte u izradi:</strong> Za nove aplikacije koje su tek u fazi razvoja i testiranja u par sekundi podignem Docker kontejner s <strong>PostgreSQL</strong> ili <strong>MariaDB</strong> bazom na zasebnom lokalnom portu i s mapiranim volumenom za podatke. Tako aplikaciju u nastajanju mogu testirati u realnim uvjetima s mobitela, tableta i računala unutar kućne mreže, a kad testiranje završi, kontejner se ugasi bez ikakvog traga na glavnom računalu.</li>
        <li><strong>Webtop:</strong> Puni Linux desktop s grafičkim sučeljem koji se vrti unutar Docker kontejnera i otvara izravno u kartici web-preglednika. Odličan je kad s bilo kojeg uređaja u kući (ili izvana) trebaš izolirano radno okruženje, testni preglednik ili preuzimanje većih datoteka izravno na diskove servera.</li>
      </ul>
      <h2>5. Red u mreži: Homarr, PairDrop i MySpeed</h2>
      <p>Kad na serveru imaš desetak aktivnih servisa na različitim portovima, pamćenje brojeva iza dvotočke brzo postane naporno. Zato sam dodao tri mala alata koji svakodnevno štede vrijeme:</p>
      <ul>
        <li><strong>Homarr:</strong> Čista, prilagodljiva početna nadzorna ploča (<em>dashboard</em>). Na jednom ekranu okuplja prečace prema svim servisima na serveru, uz osnovne indikatore stanja i brzi pregled resursa.</li>
        <li><strong>PairDrop:</strong> Lokalna zamjena za AirDrop koja radi u pregledniku na svim sustavima. Kad trebaš u sekundi prebaciti fotografiju, video ili dokument s Android mobitela na Windows laptop (ili obrnuto), otvoriš lokalnu adresu i pošalješ datoteku izravno preko kućnog Wi-Fi-ja — bez kablova, bez kompresije i bez slanja podataka u vanjske oblake.</li>
        <li><strong>MySpeed:</strong> Alat koji u pozadini automatski svakih nekoliko sati mjeri brzinu preuzimanja, slanja i ping prema internetu te crta pregledne grafikone. Umjesto nagađanja je li internet navečer spor, imaš konkretan povijesni zapis s točnim vremenom i brojkama.</li>
      </ul>
      <h2>6. Multimedija, retro gaming i siguran pristup izvana</h2>
      <p>Uz tehničke i razvojne alate, server je preuzeo i zabavni te arhivski dio kućne mreže:</p>
      <ul>
        <li><strong>Jellyfin i kućni streamovi:</strong> Vlastiti medijski server koji sve filmove, serije i videozapise drži organizirane s naslovnicama i metapodacima te ih bez problema šalje na pametni TV, mobitel ili tablet (uz vlastiti web player <a href="/">zrinaTV</a> za lokalne streamove).</li>
        <li><strong>Retro game server:</strong> Putem Docker kontejnera (poput <em>EmulatorJS</em> / <em>RomM</em> sučelja) na serveru je složena mala arhiva starih klasika. Igre se pokreću izravno u web-pregledniku na bilo kojem računalu ili tabletu u kući, a spremljene pozicije ostaju pohranjene na serveru.</li>
        <li><strong>Home Assistant i Syncthing:</strong> Home Assistant lokalno upravlja pametnim utičnicama i senzorima bez ovisnosti o vanjskim serverima proizvođača, dok Syncthing tiho u pozadini sinkronizira važne radne mape između laptopa i servera.</li>
        <li><strong>Tailscale za siguran pristup izvan kuće:</strong> Umjesto otvaranja portova na routeru i izlaganja kućne mreže javnom internetu, Tailscale povezuje server, laptop i mobitel u privatnu šifriranu WireGuard mrežu. Gdje god se nalazio, kućnim servisima i razvojnim bazama pristupam jednako sigurno kao da sjedim u dnevnom boravku.</li>
      </ul>
      <h2>7. Mala Python skripta koja je spasila sate posla</h2>
      <p>Jedan od najkorisnijih trenutaka cijelog projekta nije bio veliki sustav, nego obična <strong>Python skripta od pedesetak redaka</strong>. Tijekom godina na starim diskovima nakupilo se više od <strong>12.500 razbacanih datoteka</strong> — duplikata fotografija, instalacijskih paketa i starih sigurnosnih kopija.</p>
      <p>Umjesto ručnog klikanja po mapama danima, skripta je u par sekundi prošla kroz cijelu strukturu, razvrstala datoteke po vrsti i datumu te ih uredno složila na vanjski arhivski disk. Upravo takve situacije najbolje pokazuju zašto volim kombinaciju malih skripti i fokusiranih web-alata koje gradim na <a href="/">zrina.app</a> — kad automatiziraš dosadan posao, ostane ti vremena za pametnije stvari.</p>
      <aside class="article-note"><strong>Lekcija iz prakse:</strong> Za dobar kućni server ne treba ti skupi hardver iz trgovine. Rabljeni mini PC, čisti Linux, Docker i par dobro odabranih servisa daju ti potpunu kontrolu nad vlastitim podacima, mrežom i razvojem — bez ijedne mjesečne pretplate.</aside>
      <p class="article-question">Imaš li i ti kod kuće neko staro računalo koje skuplja prašinu ili već vrtiš svoj kućni server? Koji se servis tebi u praksi pokazao najkorisnijim?</p>
    `
  },
  {
    "slug": "izrada-aplikacija-uz-pomoc-ai-ja-iskustvo",
    "title": "Između radionice i koda: Kako danas izgleda graditi softver kad ti programiranje nije struka",
    "description": "Iskreno iskustvo iz prakse: kako AI ubrzava izradu prototipa, zašto lijep ekran nije isto što i gotov proizvod i što iskustvo rada s ljudima znači u razvoju alata.",
    "date": "2026-12-09",
    "dateLabel": "9. prosinca 2026.",
    "category": "Iza kulisa",
    "accent": "#38bdf8",
    "icon": "assets/blog/ai-radionica.jpg",
    "imageAlt": "Između radionice i koda — razvoj web aplikacija uz AI alate",
    "facebook": "Prije samo nekoliko godina postojao je jasan zid između ljudi koji vide problem u praksi i ljudi koji znaju napisati program da ga riješe. Danas se taj zid ozbiljno stanjuje — ali ne onako kako obećavaju naslovi o gotovoj aplikaciji u pet minuta. Napisao sam kako stvarno izgleda graditi softver kad dolaziš iz operative, a AI koristiš kao alat. https://zrina.app/blog/izrada-aplikacija-uz-pomoc-ai-ja-iskustvo/",
    "body": "\n      <p class=\"article-lead\">Prije samo nekoliko godina postojao je jasan zid između ljudi koji vide problem u praksi i ljudi koji znaju napisati program da ga riješe. Onaj tko je svaki dan radio sa strankama, robom, papirima ili terenom točno je znao gdje sustav puca, ali nije imao vremena ni formalnog znanja da sjedne i mjesecima uči sintaksu programskih jezika. S druge strane, oni koji su znali programirati često nikad nisu stali za pult ili u pogon da vide kako taj njihov program izgleda kad ispred tebe stoji desetero ljudi, telefon zvoni, a internet na mobitelu jedva lovi jednu crticu.</p>\n      <p>Danas se taj zid ozbiljno stanjuje — ali ne onako kako to prikazuju naslovi na društvenim mrežama.</p>\n      <p>Posljednjih mjeseci teško je otvoriti internet a da ti netko ne obeća kako jednim upitom umjetnoj inteligenciji možeš napraviti gotovu aplikaciju u pet minuta. Kao netko tko više od dvadeset godina radi u automobilskoj servisnoj struci, a navečer i vikendom gradi vlastite web-aplikacije uz pomoć AI alata, mogu reći da su takve priče istovremeno i podcjenjivanje i precjenjivanje onoga što se stvarno događa.</p>\n      <h2>Prototip u jednoj večeri nije isto što i gotov proizvod</h2>\n      <p>Istina je da AI danas radi nešto što je donedavno bilo nezamislivo. Kad u glavi imaš jasan tijek nekog posla — recimo, kako zaprimiti vozilo, zabilježiti stanje opreme ili sačuvati stari recept iz bilježnice — više ne moraš tjednima slagati osnovnu strukturu ekrana. U jednoj večeri možeš dobiti radni prototip na mobitelu, kliknuti po njemu i odmah vidjeti ima li ta ideja smisla u stvarnom životu.</p>\n      <p>No upravo tu nastaje najveća zabluda. Ljudi vide ekran koji lijepo izgleda na laptopu i pomisle da je posao gotov. U stvarnosti, tek tu počinje onaj teži dio — sve ono što se ne vidi na lijepoj snimci zaslona.</p>\n      <p>AI će ti bez problema napisati obrazac za unos podataka koji savršeno radi dok sjediš doma na brzom Wi-Fi-ju i upisuješ uredne testne primjere. Ali čim taj isti alat odneseš u stvarni svijet, stvari se mijenjaju. Što se dogodi kad korisnik uđe u podzemnu garažu ili duboku šumu gdje nema signala? Što kad netko u žurbi dvaput stisne isti gumb jer ekran nije reagirao u stotinki sekunde? Što kad starija osoba otvori stranicu na mobitelu s povećanim slovima pa se pola sučelja preklopi?</p>\n      <p>Umjetna inteligencija o tim stvarima ne razmišlja sama od sebe. Ona generira najvjerojatniji nastavak koda na temelju onoga što si joj rekao. Ako ti ne znaš postaviti pravo pitanje, ako ne razumiješ kako se podaci spremaju u pregledniku ili što se događa kad veza pukne usred slanja, dobit ćeš samo lijepu fasadu iza koje nema nosivih zidova.</p>\n      <h2>Iskustvo iz posla vrijedi više od savršene sintakse</h2>\n      <p>Upravo tu ljudi izvan klasičnog IT svijeta imaju jednu prednost koje često nisu ni svjesni.</p>\n      <p>Kad dvadeset godina radiš s ljudima i rješavaš tuđe probleme pod pritiskom vremena, razviješ osjećaj za to što u praksi prolazi, a što je samo ukras. U servisu vrlo brzo naučiš da nitko u gužvi neće čitati upute od trideset stranica niti klikati pet podizbornika da bi upisao jednu informaciju. Ako alat ne pomaže čovjeku u prvih deset sekundi, ljudi će ga zaobići i vratiti se papiru i olovci — ma koliko moderno izgledao.</p>\n      <p>Tu lekciju nosim u svaki projekt koji gradim na <a href=\"/\">zrina.app</a>. Kad sam radio <a href=\"/carwash/\">carwash.app</a>, nisam krenuo od pitanja koju bazu podataka koristiti, nego od činjenice da ljudi gube vrijeme tražeći gdje je ostavljen auto i kod koga je ključ. Kad je nastajao <a href=\"/drone-logbook/\">DroneLogbook</a>, cilj nije bio napraviti sustav za kontrolu zračnog prometa, nego pregledno mjesto gdje nakon slijetanja u dvije minute upišeš bateriju, uvjete i servisnu napomenu prije nego što zaboraviš. A kod <a href=\"/teka/\">Mamine Teke</a> najvažnije pitanje nije bilo koji AI model čita rukopis, nego kako sačuvati priču i napomenu uz recept da se ne izgube kad bilježnica jednom nestane.</p>\n      <p>U svim tim projektima AI mi služi kao izvrstan alat i ubrzivač — kao netko tko brzo reže materijal i slaže grubu konstrukciju. Ali nacrt, mjere, provjera svakog spoja i odluka gdje treba ojačati konstrukciju i dalje ostaju na čovjeku.</p>\n      <h2>Kamo ovo vodi male autore i neovisne alate</h2>\n      <p>Vjerujem da ulazimo u razdoblje u kojem će nastajati sve više malih, fokusiranih alata koje ne rade velike korporacije, nego pojedinci za svoje struke, hobije i obitelji. Velike softverske tvrtke rijetko imaju interesa rješavati male, specifične probleme — njima trebaju masovni proizvodi, korisnički računi i mjesečne pretplate.</p>\n      <p>Tu se otvara prostor za neovisne graditelje. Ne da bi se natjecali s velikim sustavima u broju opcija, nego da bi ponudili pošten, brz i razumljiv alat koji rješava jednu konkretnu stvar bez suvišnog kompliciranja.</p>\n      <aside class=\"article-note\"><strong>Misao za kraj:</strong> Alati se mijenjaju iz mjeseca u mjesec — danas koristimo jedne modele, sutra će doći brži i pametniji. Ali ono što se ne mijenja jest potreba da iza svakog dobrog softvera stoji netko tko razumije stvarnog čovjeka s druge strane ekrana.</aside>\n    "
  },
  {
    "slug": "umor-od-mjesecnih-pretplata-mali-web-alati",
    "title": "Umor od mjesečnih pretplata: Zašto se vraćamo malim web-alatima u pregledniku?",
    "description": "Kako smo došli do toga da za svaku sitnicu na mobitelu otvaramo korisnički račun i plaćamo mjesečni najam — i zašto tihi povratak jednostavnih web-alata ima sve više smisla.",
    "date": "2026-12-16",
    "dateLabel": "16. prosinca 2026.",
    "category": "Praktični alati",
    "accent": "#40d9d0",
    "icon": "assets/blog/web-alati.jpg",
    "imageAlt": "Mali web alati u pregledniku bez pretplate i registracije — zrina.app",
    "facebook": "Nekad si kupio alat, spremio ga u kutiju i znao da je tvoj. Danas za popis za dućan, QR kod ili običnu bilješku prvo traže registraciju, instalaciju od 200 MB i mjesečnu pretplatu. Napisao sam zašto sve više cijenim tihe, male web-alate koji rade odmah u pregledniku i ostavljaju tvoje podatke tebi. https://zrina.app/blog/umor-od-mjesecnih-pretplata-mali-web-alati/",
    "body": "\n      <p class=\"article-lead\">Nekad je odnos između čovjeka i alata bio jednostavan: kupiš čekić, bilježnicu ili program na disku, staviš ga na policu i znaš da je tvoj. Radi danas, radit će za pet godina i nitko ti usred posla neće ugasiti pristup jer si zaboravio obnoviti karticu ili zato što je netko promijenio uvjete korištenja.</p>\n      <p>U digitalnom svijetu taj se odnos posljednjih desetak godina gotovo potpuno izokrenuo. Danas za najjednostavniju svakodnevnu radnju — zapisati tri stavke za trgovinu, pretvoriti sliku, provjeriti radi li neka web-stranica ili zabilježiti osnovne podatke o opremi — prvo dobiješ zid: preuzmi aplikaciju od dvjesto megabajta, otvori korisnički račun, potvrdi e-mail, prihvati obavijesti i odaberi mjesečni paket nakon sedam dana besplatnog roka.</p>\n      <h2>Kad softver prestane služiti tebi i počne služiti naplati</h2>\n      <p>Nije problem u tome da se dobar rad plati — svatko tko je ikad nešto izradio zna koliko truda stoji iza stabilnog sustava. Problem je u tome što su se i najmanji, jednokratni alati pretvorili u strojeve za zadržavanje pažnje i stalnu naplatu.</p>\n      <p>Kad aplikacija živi od pretplate, njezin glavni cilj više nije da ti pomogne u deset sekundi i pusti te na miru. Cilj postaje da te zadrži unutra, da ti šalje podsjetnike, da te tjera da svoje podatke držiš isključivo na njezinim poslužiteljima i da izlazak iz sustava učini što neugodnijim. Onog trenutka kad prestaneš plaćati, tvoje vlastite bilješke, popisi ili evidencije odjednom postaju zaključani u tuđem oblaku.</p>\n      <p>Uz to ide i tihi digitalni zamor. Mobiteli su nam puni desetaka ikona koje otvorimo dvaput godišnje, svaka traži svoje ažuriranje, svaka ima svoju lozinku i svaka u pozadini troši bateriju i memoriju za posao koji bi se mogao obaviti u jednoj kartici preglednika.</p>\n      <h2>Tihi povratak preglednika i local-first pristupa</h2>\n      <p>Zanimljivo je da se upravo sada, dok komercijalni softver postaje sve teži i skuplji, događa tiha promjena u suprotnom smjeru. Web-preglednik na današnjem mobitelu više nije onaj spori prozor od prije deset godina. Moderne web-aplikacije, poznate kao PWA (<em>Progressive Web App</em>), danas mogu raditi iznimno brzo, spremiti se kao ikona na početni zaslon i funkcionirati čak i kad nestane internetske veze.</p>\n      <p>Još važniji pomak leži u načinu na koji se čuvaju podaci. Kroz takozvani <em>local-first</em> pristup, sve što upišeš ostaje pohranjeno izravno u memoriji tvog uređaja. Nema potrebe da se tvoj popis za dućan ili bilješka s terena šalju na neki udaljeni server samo zato da bi ih ti mogao pročitati pet minuta kasnije.</p>\n      <p>Takav način rada vraća povjerenje jer su pravila čista od prvog sekunda: nema skrivenog prikupljanja podataka, nema profiliranja, nema zaključavanja iza pretplate i nema straha da će tvoj zapis nestati ako se sutra ugasi nečiji startup.</p>\n      <h2>Vizija malog, poštenog alata</h2>\n      <p>Kad sam počeo slagati projekte na <a href=\"/\">zrina.app</a>, vodila me upravo ta ideja — napraviti digitalni ekvivalent dobrog ručnog alata iz garaže. Uzmeš ga kad ti treba, odradi točno onu jednu stvar za koju je napravljen, ne traži ništa zauzvrat i vratiš ga na mjesto.</p>\n      <p>Bilo da netko otvori <a href=\"/hostvitals/\">HostVitals</a> da u trideset sekundi provjeri je li problem u njegovoj vezi ili u poslužitelju neke stranice, ili koristi <a href=\"/drone-logbook/\">DroneLogbook</a> za evidenciju baterija i letova, osjećaj treba biti isti: otvorio si stranicu i odmah radiš.</p>\n      <aside class=\"article-note\"><strong>Pogled unaprijed:</strong> Budućnost weba ne pripada samo ogromnim platformama koje pokušavaju zamijeniti cijeli život jednom pretplatom. Sve više ljudi ponovno cijeni male, brze i neovisne alate koji poštuju njihovo vrijeme, uređaj i privatnost.</aside>\n    "
  }
];

const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[c]);

function header(language = "hr") {
  const en = language === "en";
  const blogHref = en ? "/en/blog/" : "/blog/";
  const home = en ? "/en/" : "/";
  const work = "radovi";
  const about = "o-meni";
  const tools = "alati";
  const contact = "kontakt";
  const suggest = en ? "/en/suggest/" : "/predlozi/";
  return `<header class="topbar has-mobile-menu">
    <a class="brand" href="${home}"><img src="/assets/brand/zrinaapp_min.png" alt="" width="32" height="32"><span>zrina<b>.app</b></span></a>
    <nav class="nav" aria-label="${en ? "Main navigation" : "Glavna navigacija"}">
      <a class="nav-work" href="${home}#${work}">${en ? "Work" : "Radovi"}</a><a href="${home}#${about}">${en ? "About" : "O meni"}</a><a class="nav-blog" href="${blogHref}" aria-current="page">Blog</a>
      <a href="${home}#${tools}">${en ? "Tools" : "Alati"}</a><a href="${suggest}">${en ? "Suggest an app" : "Predloži aplikaciju"}</a><a class="nav-cta" href="${home}#${contact}">${en ? "Contact" : "Kontakt"}</a>
    </nav>
    <div class="mobile-nav">
      <a class="mobile-contact" href="${home}#${contact}">${en ? "Contact" : "Kontakt"}</a>
      <details class="mobile-menu">
        <summary>${en ? "Menu" : "Izbornik"} <span aria-hidden="true">☰</span></summary>
        <nav class="mobile-menu-panel" aria-label="${en ? "Mobile navigation" : "Mobilna navigacija"}">
          <a href="${home}#${work}">${en ? "Work" : "Radovi"}</a>
          <a href="${home}#${about}">${en ? "About" : "O meni"}</a>
          <a href="${home}#${tools}">${en ? "Tools" : "Alati"}</a>
          <a href="${blogHref}" aria-current="page">Blog</a>
          <a href="${suggest}">${en ? "Suggest an app" : "Predloži aplikaciju"}</a>
          <a href="${home}#${contact}">${en ? "Contact" : "Kontakt"}</a>
        </nav>
      </details>
    </div>
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
  return posts
    .map((post, index) => ({ post, index }))
    .filter(({ post }) => post.date <= today)
    .sort((a, b) => b.post.date.localeCompare(a.post.date) || b.index - a.index)
    .map(({ post }) => post);
}

function postForLanguage(post, language) {
  if (language === "hr") return post;
  const translation = englishPosts[post.slug];
  if (!translation) throw new Error(`Missing English translation for ${post.slug}`);
  return {
    ...post,
    ...translation,
    dateLabel: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
      .format(new Date(`${post.date}T12:00:00Z`))
  };
}

function languageLinks(hrPath, enPath, language) {
  return `<nav class="blog-languages" aria-label="${language === "en" ? "Language" : "Jezik"}">
    <a href="${hrPath}" hreflang="hr" lang="hr" aria-label="Hrvatski"${language === "hr" ? ' aria-current="page"' : ""}>HR</a>
    <a href="${enPath}" hreflang="en" lang="en" aria-label="English"${language === "en" ? ' aria-current="page"' : ""}>EN</a>
  </nav>`;
}

function head(title, description, canonical, image, imageAlt, hrPath, enPath, language, type = "website", jsonLd = null) {
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | zrina.app</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="hr" href="${site}${hrPath}">
  <link rel="alternate" hreflang="en" href="${site}${enPath}">
  <link rel="alternate" hreflang="x-default" href="${site}${hrPath}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(imageAlt)}">
  <meta property="og:locale" content="${language === "en" ? "en_GB" : "hr_HR"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="theme-color" content="#050811">
  <link rel="icon" type="image/png" sizes="96x96" href="/assets/brand/zrinaapp_min.png">
  <link rel="stylesheet" href="/site.css?v=${assetVersion("site.css")}">
  <script src="/navigation.js?v=${assetVersion("navigation.js")}" defer></script>
  <link rel="stylesheet" href="/blog.css?v=${assetVersion("blog.css")}">
  <script>try { localStorage.setItem("zrina_lang", "${language}"); } catch (error) { console.warn("Could not save the language preference.", error); }</script>
${jsonLd ? `  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n` : ""}</head>`;
}

function postCard(post, language = "hr") {
  const en = language === "en";
  const href = `${en ? "/en/blog/" : "/blog/"}${post.slug}/`;
  return `<article class="blog-card">
    <p class="blog-meta">${esc(post.category)} <span aria-hidden="true">·</span> <time datetime="${post.date}">${post.dateLabel}</time></p>
    <h2><a href="${href}">${esc(post.title)}</a></h2>
    <p>${esc(post.description)}</p>
    <a class="blog-read" href="${href}">${en ? "Read the article" : "Pročitaj članak"} <span aria-hidden="true">→</span></a>
  </article>`;
}

function article(original, language = "hr") {
  const post = postForLanguage(original, language);
  const en = language === "en";
  const hrPath = `/blog/${original.slug}/`;
  const enPath = `/en/blog/${postForLanguage(original, "en").slug}/`;
  const blogPath = en ? "/en/blog/" : "/blog/";
  const url = `${site}${en ? enPath : hrPath}`;
  const image = `${site}/assets/share-cards/blog/${post.slug}.png`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.modifiedDate || post.date,
    inLanguage: language,
    mainEntityOfPage: url,
    image,
    author: { "@type": "Person", name: "Vedran Zrinski", url: `${site}/` },
    publisher: { "@type": "Organization", name: "zrina.app", url: `${site}/` }
  };
  return `${head(post.title, post.description, url, image, post.imageAlt, hrPath, enPath, language, "article", jsonLd)}
<body class="blog-page">
  ${header(language)}
  <main id="main" class="article-main">
    ${languageLinks(hrPath, enPath, language)}
    <a class="blog-back" href="${blogPath}">${en ? "← All articles" : "← Sve objave"}</a>
    <article>
      <header class="article-header">
        <p class="blog-meta">${esc(post.category)} <span aria-hidden="true">·</span> <time datetime="${post.date}">${post.dateLabel}</time></p>
        <h1>${esc(post.title)}</h1>
        <p class="article-summary">${esc(post.description)}</p>
      </header>
      <div class="article-content">${post.body}</div>
      <footer class="article-footer">
        <p>${en ? 'This article is part of the notes on <a href="/en/">zrina.app</a> — a portfolio of independent projects, apps and free tools.' : 'Članak je dio bilješki na <a href="/">zrina.app</a> — portfolio osobnih projekata, aplikacija i besplatnih alata.'}</p>
        <a class="btn ghost" href="${blogPath}">${en ? "Explore more articles" : "Pogledaj ostale članke"}</a>
      </footer>
    </article>
  </main>
  <footer class="footer"><span>© ${new Date().getFullYear()} zrina.app · ${en ? "Independent projects by Vedran Zrinski." : "Autorski projekti Vedrana Zrinskog."}</span><a href="${en ? "/en/#kontakt" : "/#kontakt"}">${en ? "Contact" : "Kontakt"}</a></footer>
</body>
</html>
`;
}

function indexPage(publishedPosts, language = "hr") {
  const en = language === "en";
  const canonical = `${site}${en ? "/en/blog/" : "/blog/"}`;
  const description = en ? "Practical notes on family memories, nature, drones and building useful apps." : "Praktične bilješke o obiteljskim uspomenama, prirodi, dronovima i izradi korisnih aplikacija.";
  const localizedPosts = publishedPosts.map((post) => postForLanguage(post, language));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: en ? "Notes from zrina.app" : "Bilješke sa zrina.app",
    description,
    url: canonical,
    inLanguage: language,
    blogPost: localizedPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${canonical}${post.slug}/`,
      datePublished: post.date
    }))
  };
  return `${head(en ? "Notes — ideas, tools and apps" : "Bilješke — ideje, alati i aplikacije", description, canonical, `${site}/assets/share-cards/blog/${en ? "blog-en.png" : "blog.png"}`, en ? "zrina.app — notes on apps, tools and ideas" : "zrina.app — bilješke o aplikacijama, alatima i idejama", "/blog/", "/en/blog/", language, "website", jsonLd)}
<body class="blog-page">
  ${header(language)}
  <main id="main" class="blog-main">
    ${languageLinks("/blog/", "/en/blog/", language)}
    <section class="blog-intro">
      <p class="blog-eyebrow">${en ? "NOTES FROM ZRINA.APP" : "BILJEŠKE SA ZRINA.APP"}</p>
      <h1>${en ? "Ideas from real life.<br><span>Tools that help.</span>" : "Ideje iz stvarnog života.<br><span>Alati koji pomažu.</span>"}</h1>
      <p>${en ? "Practical notes on family memories, time outdoors, drones and how an everyday problem can become a useful app." : "Ovdje dijelim praktične zapise o obiteljskim uspomenama, boravku u prirodi, dronovima i tome kako svakodnevni problem može postati korisna aplikacija."}</p>
    </section>
    <section class="blog-list" aria-label="${en ? "Articles" : "Članci"}">
      ${localizedPosts.length
        ? localizedPosts.map((post) => postCard(post, language)).join("\n")
        : `<p class="blog-empty">${en ? "More notes coming soon." : "Nove bilješke stižu uskoro."}</p>`}
    </section>
  </main>
  <footer class="footer"><span>© ${new Date().getFullYear()} zrina.app · ${en ? "Independent projects by Vedran Zrinski." : "Autorski projekti Vedrana Zrinskog."}</span><a href="${en ? "/en/#kontakt" : "/#kontakt"}">${en ? "Contact" : "Kontakt"}</a></footer>
</body>
</html>
`;
}

function shareCard(title, description, accent, language = "hr", category = "") {
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
    <text x="92" y="112" fill="${accent}" font-family="Arial,sans-serif" font-size="26" font-weight="700">zrina.app · ${language === "en" ? "NOTES" : "BILJEŠKE"}${category ? ` · ${esc(category.toUpperCase())}` : ""}</text>
    <text x="92" y="230" fill="#f3f6fb" font-family="Arial,sans-serif" font-size="44" font-weight="700">${titleSvg}</text>
    <text x="92" y="420" fill="#c3ceda" font-family="Arial,sans-serif" font-size="22">${descriptionSvg}</text>
    <rect x="92" y="536" width="140" height="4" rx="2" fill="${accent}"/>
  </svg>`);
}

async function buildCard(post, language = "hr") {
  const sharp = require("sharp");
  const logo = await sharp(path.join(root, post.icon)).resize(360, 360, { fit: "contain" }).png().toBuffer();
  await sharp(shareCard(post.title, post.description, post.accent, language, post.category))
    .composite([{ input: logo, left: 780, top: 145 }])
    .png()
    .toFile(path.join(root, "assets", "share-cards", "blog", `${post.slug}.png`));
}

async function main() {
  const articleDir = path.join(root, "blog");
  const englishDir = path.join(root, "en", "blog");
  fs.mkdirSync(articleDir, { recursive: true });
  fs.mkdirSync(englishDir, { recursive: true });
  fs.mkdirSync(path.join(root, "assets", "share-cards", "blog"), { recursive: true });
  const publishedPosts = getPublishedPosts();
  const publishedSlugs = new Set(publishedPosts.map((post) => post.slug));
  fs.writeFileSync(path.join(articleDir, "index.html"), indexPage(publishedPosts), "utf8");
  fs.writeFileSync(path.join(englishDir, "index.html"), indexPage(publishedPosts, "en"), "utf8");
  for (const post of posts) {
    const dir = path.join(articleDir, post.slug);
    const cardPath = path.join(root, "assets", "share-cards", "blog", `${post.slug}.png`);
    const englishPost = postForLanguage(post, "en");
    const englishArticleDir = path.join(englishDir, englishPost.slug);
    const englishCardPath = path.join(root, "assets", "share-cards", "blog", `${englishPost.slug}.png`);
    if (!publishedSlugs.has(post.slug)) {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.rmSync(cardPath, { force: true });
      fs.rmSync(englishArticleDir, { recursive: true, force: true });
      fs.rmSync(englishCardPath, { force: true });
      continue;
    }
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), article(post), "utf8");
    await buildCard(post);
    fs.mkdirSync(englishArticleDir, { recursive: true });
    fs.writeFileSync(path.join(englishArticleDir, "index.html"), article(post, "en"), "utf8");
    await buildCard(englishPost, "en");
  }
  const sitemapPath = path.join(root, "sitemap.xml");
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const withoutBlogPosts = sitemap.replace(
    /^\s*<url><loc>https:\/\/zrina\.app\/(?:en\/)?blog\/(?:[^<]*)<\/loc><\/url>\r?\n/gm,
    ""
  );
  const blogUrls = [
    `${site}/blog/`,
    ...publishedPosts.map((post) => `${site}/blog/${post.slug}/`),
    `${site}/en/blog/`,
    ...publishedPosts.map((post) => `${site}/en/blog/${postForLanguage(post, "en").slug}/`)
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
  const englishOverview = overviewSvg.toString().replace("Bilješke", "Notes").replace("Ideje, alati i aplikacije iz stvarnog života.", "Ideas, tools and apps from real life.");
  await sharp(Buffer.from(englishOverview)).png().toFile(path.join(root, "assets", "share-cards", "blog", "blog-en.png"));
  console.log(`Generated blog index, ${publishedPosts.length} published articles and share cards.`);
}

module.exports = { getPublishedPosts, getTodayInZagreb, posts, postForLanguage, article, indexPage };

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
