module.exports = {
  "kako-sam-izgradio-aplikaciju-za-praonicu": {
    slug: "building-a-car-wash-vehicle-tracking-app",
    title: "How I built a vehicle tracking app for a car wash",
    description: "From searching for vehicles and keeping paper records to a car wash app: locations, keys, billing and technical decisions.",
    category: "Behind the app",
    imageAlt: "carwash.app — an app for tracking vehicles through a car wash",
    body: `
      <p class="article-lead">“Where's the car? Where's the key? Is the wash finished?” These weren't questions we could answer at a glance. They often meant walking around, making phone calls and searching several parking areas. That's why I started building an app for the car wash.</p>
      <p>The original version was built with Google Apps Script and Google Sheets and tried out in a real workplace. I've deliberately left out the organisation's name, identifiable maps and business data, but I want to show the problem that led to the app.</p>
      <h2>A project rooted in everyday work</h2>
      <p>As a service advisor, I came to know the problem through daily work with my colleagues. I decided to look for a solution on my own initiative and build the app in my spare time, using my own resources, AI tools such as Gemini and the Visual Studio Code development environment.</p>
      <p>I then offered it for use in the workplace. Colleagues gave me positive feedback during the trial, but the project was never formally adopted or moved onto the organisation's infrastructure. It is no longer used there. The experience showed me how valuable it is to understand people's daily work before building a solution.</p>
      <h2>Why was it so hard to find one car?</h2>
      <p>The car wash was part of a larger service complex, separate from the vehicle reception area. The service department used it, as did other internal and external customers. During the day, cars could be in different parking areas or parts of the complex; the key wasn't necessarily where the car was.</p>
      <p>Before the app trial, my fellow service advisors and I averaged around 15,000 steps during a working day. That included looking for vehicles and keys and moving cars for collection. The figure is an approximate total, not a measured saving from the app.</p>
      <h2>About ten sheets of paper a day</h2>
      <p>Washed vehicles were recorded by hand on printed tables — in my experience, about ten A4 sheets a day. The information then had to be copied, sorted and calculated manually. At the end of the month, quantities and different types of wash were tallied with paper, a pen and a calculator.</p>
      <p>The service department was the largest user. In that process, a wash for a service vehicle wasn't billed to the customer; it was accounted for internally between the car wash and the service department. The records needed to distinguish who requested each wash and which service was performed, so they could support the appropriate billing rather than simply list cars.</p>
      <p>The app connected daily work with record-keeping: information entered for each vehicle can later be reviewed by period, department and wash type, alongside the relevant price list. The original implementation provides quantity and cost summaries and exports data to help prepare billing.</p>
      <h2>One record, different jobs</h2>
      <p>A vehicle passes through several stages, and different people need different information. One person needs the intake details; another needs the wash queue, parking location or key. The views and available actions were tailored to each role, while everyone worked from shared records.</p>
      <p>For example, someone at the car wash can mark a vehicle as being washed or finished and record where it was left. The service advisor can then see its status, last recorded location and key information. People enter the location, so keeping it up to date matters.</p>
      <p>The original also used a map of the workplace to select locations, with descriptions of individual zones. It isn't published here because it shows the real site. The important idea isn't the photograph itself, but giving the team shared, understandable labels instead of a vague “over there”.</p>
      <h2>Thinking through the solution</h2>
      <p>Below are a few short excerpts from the original code, without user or organisation data. The reporting example is simplified pseudocode.</p>
      <h2>Synchronising with Google Sheets and Apps Script</h2>
      <p>In the original implementation, Google Sheets is the shared data store and Apps Script handles client requests. A version marker is updated after changes; an open screen periodically checks for newer data and refreshes the list when needed.</p>
      <p>This is the actual function that starts the client-side check:</p>
      <pre><code>function pokreniSmartSync() {
    if (window.isSyncRunning &amp;&amp; smartSyncTimer) return;
    if (smartSyncTimer) clearInterval(smartSyncTimer);
    smartSyncTimer = setInterval(osvjeziRadionicu, 3000);
    window.isSyncRunning = true;
}</code></pre>
      <p>And this Apps Script function stores the version marker in the cache:</p>
      <pre><code>function bumpVersion() {
  let cache = CacheService.getScriptCache();
  if(cache) cache.put('db_verzija', Date.now().toString(), 21600);
}</code></pre>
      <p>The first function sets up periodic refreshes and avoids starting another timer if one is already running. The second stores a timestamp as the data version, with a cache lifetime of 21,600 seconds.</p>
      <p>The idea is that the screen doesn't have to download the whole list again when nothing has changed. After a successful change, the original code updates the version marker; at the next check, the server can return data or indicate that nothing has changed.</p>
      <p>This is <em>polling</em>, not a push connection: the check starts approximately every three seconds, plus network and processing time. A local copy can make the initial display faster while the server response is pending.</p>
      <h2>From records to billing preparation</h2>
      <p>Instead of recounting paper records, the report goes through vehicles recorded in the selected period, groups them by requesting department and service type, and applies the price list. Simplified:</p>
      <pre><code>// Illustration: grouping report items
for each record in selectedPeriod:
    group = getGroup(record.department, record.washType)
    group.quantity += 1
    group.amount += priceFor(group)</code></pre>
      <p>In the original code, the report reads active and archived records, groups them by department and wash type, and uses the price list. This turns the data collected throughout the day into a clearer basis for billing.</p>
      <h2>Offline: displaying data isn't the same as saving it</h2>
      <p>Seeing the last known data is useful when the connection drops. But displaying cached information isn't the same as reliably saving new actions offline. In the version I reviewed, the client disables certain actions when the connection is lost; I haven't confirmed a persistent queue that sends them automatically later.</p>
      <p>For me, the lesson is to describe and test offline support for each action, rather than promise it simply because the app is available on a phone.</p>
      <h2>Roles aren't a substitute for secure sign-in</h2>
      <p>The original version uses an identifier stored in the browser, along with a process for approving users and assigning roles. That helps organise the interface, but a browser identifier alone is not reliable proof of identity. A new implementation would need proper authentication and server-side authorisation checks instead.</p>
      <h2>OCR for licence plates and VINs</h2>
      <p>In the original Android environment, text is recognised from a photo and the result is further processed using rules for vehicle data. Recognition can make mistakes, so the result assists data entry rather than replacing a check by the person handling the vehicle.</p>
      <p>For example, the letter O and the digit 0 can look very similar in a photo. For a VIN, the app can compare possible readings, apply allowed-character rules and take a check digit into account when ranking candidates. Licence plate corrections also depend on a character's position.</p>
      <p>This actual excerpt from the VIN candidate loop checks the format and adds points for a matching check digit:</p>
      <pre><code>let komad = cisto.substring(i, i + 17);
let popravljeno = popraviVINOCR(komad);
if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(popravljeno)) continue;

let score = 0;
if (isValidVINChecksum(popravljeno)) score += 100;</code></pre>
      <p>The rest of the function prepares the text, considers different candidates and scores them further. A matching check digit increases a candidate's score; the person entering the data checks the result before confirming it.</p>
      <h2>Three implementations, one problem</h2>
      <p>The original was followed by a separate web version with a different server and database, and later by an experimental PWA built with AI Studio. They are different implementations, so we shouldn't assume every original feature works the same way in the newer versions.</p>
      <h2>From service experience to a solution built with AI</h2>
      <p>As a service advisor, I didn't learn about the problem from a project brief. I worked with colleagues who looked for cars and keys, coordinated handovers and copied information every day. That hands-on experience helped me see where the process stalled and what information people needed when their hands and their day were already full.</p>
      <p>With my own effort and technical knowledge, and help from AI tools, I turned the idea into an app that colleagues tried in a real workflow and responded to positively. AI helped me build it, but it couldn't learn the job for me, decide what was useful or confirm that every feature was correct.</p>
      <p>That's why a more important question than the choice of technology is: does the solution make someone's work easier? Edge cases matter too: what happens when the connection drops, information is out of date or the same entry is submitted twice? Neat-looking code still needs checking, and when something goes wrong, an error message should help identify the cause.</p>
      <p>The original app was tried in a specific workplace, but it was never formally adopted. Wider use would require further checks, particularly of sign-in, permissions, reliability and data protection. The experimental PWA also needs to be considered separately, not treated as a confirmed finished product.</p>
      <aside class="article-note"><strong>What I'll carry forward:</strong> understand the work, listen to the people doing it, and use technology to turn real problems into useful, tested solutions.</aside>
      <p>For more on the workflow and original architecture, visit the <a href="/carwash/">carwash.app project page</a>.</p>
    `
  },
  "obiteljski-recepti-sacuvati-price": {
    slug: "family-recipes-preserving-the-stories",
    title: "A family recipe is more than a list of ingredients",
    description: "How to preserve family recipes along with the handwriting, stories and little details that can't be measured with a spoon.",
    category: "Family memories",
    imageAlt: "Mamina Teka — family recipes, handwriting and memories",
    body: `
      <p class="article-lead">In many families, recipes live on yellowing paper, in a flour-stained notebook or in someone's memory. Alongside the ingredients are the little things that make a recipe ours: who made it, for which occasion, and what “add a little — you know how much” actually means.</p>
      <p>Digitising a recipe isn't just about putting measurements in a table. It's about keeping enough context for someone else to make it — and feel a little of the story that goes with it.</p>
      <h2>1. Keep the original before transcribing it</h2>
      <p>Photograph the whole page, including its edges, added notes and handwriting. Don't throw away or alter the original as soon as you've made a clean digital copy. The photograph preserves its appearance and signs of use; the transcription makes it easier to read and search.</p>
      <h2>2. Separate what is written from what you assume</h2>
      <p>If a word is illegible or a measurement is unclear, mark it as uncertain instead of presenting a guess as the original. You can add your own note — for example, how you interpreted “a cup” — but make it clear that it's an addition.</p>
      <h2>3. Record the story and practical details</h2>
      <p>Who did the recipe belong to? Was it made for Christmas, Sunday lunch or family gatherings? Does an ingredient go by a different name today? If you know them, record the order of steps, pan size, oven temperature or the sign that tells you the dish is ready.</p>
      <h2>4. Let the family version evolve</h2>
      <p>Recipes change: someone uses less sugar, someone adds a spice, and someone finally discovers how long the dough really needs kneading. Instead of arguing over which version is “right”, keep the original and record changes as new family variations.</p>
      <h2>5. Share thoughtfully</h2>
      <p>Before sharing, ask your family what they're happy to make public. Photos of handwritten pages may contain names, addresses or other private notes. A family collection doesn't have to be public to be available to the people it's meant for.</p>
      <p>That idea inspired <a href="/teka/">Mamina Teka</a>: a place for a photo of an old recipe, a readable transcription, family variations and the memory behind a dish. Technology doesn't replace the notebook — it helps preserve and find what's inside it.</p>
      <h2>Mamina Teka with and without AI</h2>
      <p>You can browse and edit recipes you've already saved and, by signing in with Google, sync and share them with your family. Those steps don't require a Gemini API key.</p>
      <p>When you add a recipe from a photo of handwriting, your own Gemini API key lets AI suggest a transcription and organise the details for review. Before saving, compare the text and quantities with the original, especially when the handwriting is unclear.</p>
      <p>With a key, you can also try generating an illustration of the dish from the recipe. It's an AI illustration, not a photograph of the actual prepared dish; availability and any cost depend on Google's model, your account and quotas. AI processing requires an internet connection.</p>
      <p><a href="https://mamina-teka.zrina.app/">Open Mamina Teka</a> or explore <a href="/teka/">the story behind the project</a>.</p>
      <aside class="article-note"><strong>Start small:</strong> choose one recipe you'd hate to lose. Photograph it, transcribe it without hiding the unclear parts, and add one sentence about the person who made it.</aside>
      <p class="article-question">Which family recipe would you save first — and whose story goes with it?</p>
    `
  },
  "sto-zabiljeziti-nakon-leta-dronom": {
    slug: "what-to-record-after-a-drone-flight",
    title: "What should you record after a drone flight?",
    description: "A simple flight log routine: conditions, batteries, equipment, issues and the next maintenance steps.",
    category: "Practical tools",
    imageAlt: "DroneLogbook — a digital log for flights and equipment",
    body: `
      <p class="article-lead">After a flight, we usually want to look at the footage and move on. But that's also the easiest time to record details that may help later: how long the flight lasted, how the battery behaved, what conditions were like and whether the equipment is ready for next time.</p>
      <p>You don't need a long report. A few consistent notes are enough — keeping them regularly matters more than making every entry perfect.</p>
      <h2>Flight summary</h2>
      <ul>
        <li><strong>Date and location:</strong> note the place and, if useful, approximate coordinates.</li>
        <li><strong>Flight time:</strong> record the duration and purpose, such as practice, filming or surveying a site.</li>
        <li><strong>Conditions:</strong> note wind, visibility and anything else that affected the flight.</li>
        <li><strong>Equipment:</strong> record the aircraft, controller and battery identifiers if they matter to your log.</li>
      </ul>
      <h2>Batteries and equipment</h2>
      <p>Record which battery you used, its starting state if you track it, and anything unusual you noticed during the flight or after landing. A short note like “check connector” is more useful than relying on memory. After the flight, inspect the equipment according to the manufacturer's instructions and note anything that needs servicing or replacement.</p>
      <h2>Problems, decisions and the next step</h2>
      <p>Was a planned flight cut short? Did a warning, connection issue or unusual behaviour appear? Record what happened and what you did. If something needs inspection, leave it as an open item rather than assuming the problem has disappeared.</p>
      <h2>Documents and privacy</h2>
      <p>Keep track of documents and deadlines relevant to your equipment and the way you fly. Rules depend on the location and flight category and can change, so always check current official sources and local requirements before making decisions. Don't publicly share locations or information that could compromise people's privacy or sensitive sites.</p>
      <p><a href="/drone-logbook/">DroneLogbook</a> grew from a desire to keep flights, batteries, equipment, documents and maintenance information together instead of scattered across notes and spreadsheets.</p>
      <aside class="article-note"><strong>A two-minute routine:</strong> after landing, enter the basics, note anything unusual and add one specific item to check before the next flight.</aside>
      <p class="article-question">What do you find hardest to keep track of: flights, batteries, maintenance or documents?</p>
    `
  },
  "biljeske-s-terena-gljivarenje": {
    slug: "mushroom-foraging-field-notes",
    title: "Mushroom foraging: field notes worth taking home",
    description: "How to photograph and record a find, preserve your observations and act responsibly around unfamiliar mushrooms.",
    category: "Nature and technology",
    imageAlt: "Gljivobook — a field guide and mushroom journal",
    body: `
      <p class="article-lead">A walk in the woods can easily leave you with a collection of photos and no context: where was the find, what was its habitat like and what did you notice at the time? A few careful notes can help you remember your observations and follow what you find throughout the season.</p>
      <p>A field journal is for learning and recording the experience. A photograph or an app alone cannot confirm that a mushroom is safe to eat.</p>
      <h2>Photograph more than the cap</h2>
      <p>If it's safe and you can do so without damaging the habitat, record the whole specimen, the cap, stem and underside. Include a wider view of the surroundings too. Light, angle and a sense of scale can make the photos more useful later.</p>
      <h2>Note the context</h2>
      <ul>
        <li><strong>Date and approximate location:</strong> choose the level of detail that suits you; you don't have to publish sensitive locations.</li>
        <li><strong>Habitat:</strong> describe the surroundings and vegetation you can recognise, without guessing.</li>
        <li><strong>Conditions:</strong> note the weather, moisture or anything else that seemed important.</li>
        <li><strong>Observations:</strong> record colour, shape and visible changes you can compare with your photos.</li>
      </ul>
      <h2>Leave room for uncertainty</h2>
      <p>If you're unsure of the name, write “unknown mushroom” or record only your observations. That's more responsible than locking an incorrect identification into your journal. To learn, compare sources and speak with an experienced, trusted person.</p>
      <aside class="safety-note"><strong>Safety matters:</strong> Never eat a mushroom based on an app or a photograph. If you don't know it, don't eat it unless a trusted expert has examined the specimen in person and confirmed it, however confident you feel. If any doubt remains, don't eat it.</aside>
      <h2>Technology as a notebook, not a judge</h2>
      <p><a href="/gljivobook/">Gljivobook</a> combines a species guide, a morphology filter and a personal journal. Its on-device identifier can help narrow the possibilities using observed features and photos, without a Gemini API key or an internet connection.</p>
      <p>With an internet connection and your own Gemini API key, you can also choose an AI scanner that suggests possible species from photos and observations. It can speed up the initial search: then read the descriptions, compare features and possible lookalikes, and record what you observed. An AI suggestion does not confirm the species or its edibility.</p>
      <p><a href="https://gljivobook.zrina.app/">Open Gljivobook</a> and use it to support learning and field notes.</p>
      <p>When taking photos and making notes, respect nature, local rules and other visitors' privacy. Don't leave litter or damage the habitat for a better photo.</p>
      <p class="article-question">Do you keep a field journal, or rely on the photos on your phone?</p>
    `
  },
  "od-starog-mini-pc-ja-do-kucnog-servera": {
    slug: "from-old-mini-pc-to-home-server",
    title: "From an Old Mini PC to a Home Server: AdGuard, Dev Databases, Retro Games, and Zero Subscriptions",
    description: "How I turned a used office mini PC into a silent Debian home server running Docker — from network-wide ad blocking and dev databases to retro games and Termius workflows.",
    category: "Behind the Scenes",
    imageAlt: "Home server on a mini PC — Debian, Docker, AdGuard and development tools",
    body: `
      <p class="article-lead">Most of us have an older computer sitting around at home that feels too sluggish for modern Windows, yet is completely functional and far too good to end up in a drawer or e-waste bin. Instead of paying multiple monthly subscriptions for file storage, smart home control, media streaming, and development environments, I decided to give one such machine a new job — running 24/7 as a quiet home server.</p>
      <p>The hardware of choice was a used office <strong>Lenovo ThinkCentre M73</strong> (Intel Core i3 processor and a 500 GB internal drive) paired with an external USB 3.0 portable hard drive for larger archives. Below is a practical technical breakdown of how the system is set up, how I manage it from the terminal, and which Docker services I run for daily tasks, testing new projects, and entertainment.</p>
      <h2>1. The Foundation: Debian 12, Static IP, and CasaOS</h2>
      <p>At the start, I weighed whether to repurpose an old Android phone or buy a Raspberry Pi. A used business mini PC turned out to be the most reliable option: it is built to run plugged in for years without battery swelling or thermal throttling, comes with proper USB 3.0 and SATA ports, and uses standard x86 architecture so virtually every modern Docker image runs out of the box.</p>
      <p>Before deploying any containers, I took care of three fundamentals that save plenty of headaches later:</p>
      <ul>
        <li><strong>Clean headless Debian 12:</strong> A minimal installation without a desktop environment uses negligible RAM and CPU, leaving almost all hardware resources free for containers. All administration happens remotely over SSH.</li>
        <li><strong>Static IP reservation on the router:</strong> To ensure the server's local address never changes after a power outage or router reboot, I bound its MAC address to a fixed IP address in the router's DHCP settings.</li>
        <li><strong>Persistent external drive mounting via UUID:</strong> I added the external USB drive to <code>/etc/fstab</code> using its unique UUID rather than a shifting device label like <code>/dev/sdb1</code>, guaranteeing it mounts to the exact same path after every reboot.</li>
      </ul>
      <p>On top of Debian, I installed <strong>CasaOS</strong> — a lightweight web dashboard built on top of <strong>Docker</strong>. It makes managing containers, mapping storage volumes, and monitoring resource usage effortless in a browser, while still letting you spin up custom <code>docker-compose.yml</code> stacks whenever needed.</p>
      <h2>2. Terminal Workflow and Termius: Managing Everything from Laptop or Phone</h2>
      <p>While CasaOS provides a clean web overview, real control over a Linux server happens in the terminal. To connect from both my Windows laptop and Android phone, I rely on <strong>Termius</strong> — a clean SSH client that syncs saved hosts, SSH keys, and reusable command snippets so I never have to type long paths manually on the go.</p>
      <p>Here are a few core terminal commands I use regularly to check system health, storage mounts, and running Docker containers:</p>
      <pre><code># Connecting to the server over SSH
ssh user@local-ip-address

# Checking disk usage and mounted partitions (internal + external USB drive)
df -h
lsblk -f

# Finding the external drive's UUID before configuring /etc/fstab
sudo blkid

# Listing active Docker containers, ports, and live resource usage
docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
docker stats --no-stream

# Deploying or updating a custom stack from a docker-compose.yml file
docker compose pull &amp;&amp; docker compose up -d

# Checking private Tailscale mesh status
tailscale status</code></pre>
      <p>Once these commands are saved as quick snippets in Termius, checking the health of the entire server or spinning up a fresh test container takes literally five seconds — even from a phone screen.</p>
      <h2>3. AdGuard Home: Network-Wide Ad and Tracker Blocking</h2>
      <p>One of the most immediately noticeable services on the server is <strong>AdGuard Home</strong>. Rather than installing ad blockers separately on every phone, tablet, and computer in the house, AdGuard acts as the local DNS server (on standard port <code>53</code>) for the entire home network.</p>
      <ul>
        <li><strong>Router-level DNS redirection:</strong> In the main router's DHCP configuration, the home server's static local IP is set as the primary DNS server. The moment any device joins the home Wi-Fi, its DNS queries are routed through AdGuard automatically.</li>
        <li><strong>Encrypted upstream DNS (DoH):</strong> AdGuard forwards legitimate lookups to upstream resolvers (such as Cloudflare <code>1.1.1.1</code> or Quad9 <code>9.9.9.9</code>) over <em>DNS-over-HTTPS</em> (DoH), preventing ISP-level snooping or DNS tampering.</li>
        <li><strong>Blocklists and instant exceptions:</strong> Alongside curated ad and tracker lists (such as OISD), the dashboard shows live query logs per device. If a legitimate app or local service gets blocked by an aggressive rule, whitelisting the domain takes a single click.</li>
      </ul>
      <p>A practical side note: whenever a website suddenly refuses to load on one device, a local DNS block or stale DNS cache is often the culprit — to quickly compare whether an issue is local or server-side, I also built <a href="/en/hostvitals/">HostVitals</a>.</p>
      <h2>4. Local Development Sandbox: Databases and Webtop</h2>
      <p>When building new web applications in your spare time, cluttering your daily laptop with background services drains battery life and leads to port conflicts. The home server acts as an isolated testing ground:</p>
      <ul>
        <li><strong>Local databases for projects in progress:</strong> For new applications still in active development and testing, I spin up a Docker container running <strong>PostgreSQL</strong> or <strong>MariaDB</strong> on a dedicated local port with a mapped data volume. That lets me test apps under realistic network conditions from phones, tablets, and laptops around the house — and once testing is done, the container shuts down cleanly without leaving leftovers on my main workstation.</li>
        <li><strong>Webtop:</strong> A full Linux desktop environment running inside a Docker container and accessible directly in a browser tab. It comes in handy whenever you need an isolated workspace, a clean test browser, or a way to download large files straight onto server storage from any device.</li>
      </ul>
      <h2>5. Keeping the Network Organized: Homarr, PairDrop, and MySpeed</h2>
      <p>Once a dozen services are running across different ports, remembering port numbers quickly gets old. Three lightweight tools keep everyday workflows smooth:</p>
      <ul>
        <li><strong>Homarr:</strong> A clean, customizable start dashboard that brings shortcuts to every self-hosted service onto a single screen alongside basic status indicators.</li>
        <li><strong>PairDrop:</strong> A local browser-based alternative to AirDrop that works across every operating system. Whenever I need to send photos, videos, or documents from an Android phone to a Windows laptop (or vice versa), I open the local address and transfer files directly over home Wi-Fi — no cables, no compression, and no third-party cloud uploads.</li>
        <li><strong>MySpeed:</strong> A background utility that automatically runs internet speed and ping tests every few hours and logs historical charts. Instead of guessing whether the connection slows down in the evening, you get concrete numbers and timestamps.</li>
      </ul>
      <h2>6. Media, Retro Gaming, and Secure Remote Access</h2>
      <p>Beyond development and network utilities, the server also handles media and archiving duties:</p>
      <ul>
        <li><strong>Jellyfin and local streams:</strong> A personal media server that organizes movies, shows, and videos with metadata and streams smoothly to smart TVs, phones, and tablets (pairing nicely with my own web player <a href="/en/">zrinaTV</a> for local streams).</li>
        <li><strong>Retro game server:</strong> Using Docker containers (such as <em>EmulatorJS</em> / <em>RomM</em>), the server hosts a compact archive of classic retro games that launch straight inside a web browser on any computer or tablet at home, keeping save states stored centrally.</li>
        <li><strong>Home Assistant and Syncthing:</strong> Home Assistant manages smart plugs and sensors locally without depending on external vendor clouds, while Syncthing quietly syncs key project folders between my laptop and the server in the background.</li>
        <li><strong>Tailscale for secure remote access:</strong> Instead of opening ports on the router and exposing the home network to the public internet, Tailscale connects the server, laptop, and phone into a private encrypted WireGuard mesh. Wherever I am, I can reach home services and dev databases just as securely as sitting in the living room.</li>
      </ul>
      <h2>7. A Small Python Script That Saved Hours of Manual Work</h2>
      <p>One of the most rewarding moments of the whole build wasn't a massive platform, but a <strong>50-line Python script</strong>. Over the years, old drives had accumulated more than <strong>12,500 scattered files</strong> — duplicate photos, installers, and legacy backups.</p>
      <p>Instead of spending days sorting folders manually, the script scanned the entire directory tree in seconds, categorized files by type and date, and organized them cleanly onto the external archive drive. Moments like that are exactly why I enjoy combining small automation scripts with focused web utilities on <a href="/en/">zrina.app</a> — automate the repetitive work so you have more time to build things that matter.</p>
      <aside class="article-note"><strong>Practical Takeaway:</strong> You don't need expensive brand-new hardware to run a capable home server. A used mini PC, clean Linux, Docker, and a handful of well-chosen services give you full control over your data, network, and development workflow — without a single monthly subscription.</aside>
      <p class="article-question">Do you have an old computer gathering dust at home, or are you already running your own home server? Which self-hosted service has proven most useful in your daily setup?</p>
    `
  },
  "izrada-aplikacija-uz-pomoc-ai-ja-iskustvo": {
    "slug": "between-the-workshop-and-the-code-building-with-ai",
    "title": "Between the Workshop and the Code: What Building Software Looks Like When Programming Isn't Your Day Job",
    "description": "A candid look from the field: how AI speeds up prototypes, why a nice screen is nowhere near a finished product, and why real-world domain experience still wins.",
    "category": "Behind the Scenes",
    "imageAlt": "Between the workshop and the code — building web apps with AI tools",
    "body": "\n      <p class=\"article-lead\">Only a few years ago, there was a thick wall between the people who spotted a problem in daily operations and the people who knew how to write software to fix it. Anyone working with customers, inventory, paperwork, or field equipment knew exactly where workflows broke down, yet lacked the time or formal training to spend months learning syntax. Meanwhile, many people writing code had never stood at a service counter while ten people waited, the phone rang, and mobile signal dropped to one bar.</p>\n      <p>That wall is thinning fast — just not in the way social media headlines like to claim.</p>\n      <p>Over the past few months, it has been nearly impossible to open a browser without seeing promises that anyone can build a finished app in five minutes from a single prompt. Having spent more than twenty years in the automotive service industry while building web apps in the evenings with AI tools, I have found the reality to be both more grounded and far more interesting.</p>\n      <h2>A Prototype in One Evening Is Not a Finished Product</h2>\n      <p>It is true that AI can now do things that were unthinkable a short while ago. Once you have a clear mental picture of a workflow — checking in a vehicle, logging equipment maintenance, or preserving a handwritten family recipe — you no longer spend weeks wiring basic layouts. In a single evening, you can have a working prototype on your phone, tap through it, and see whether the idea actually holds up.</p>\n      <p>Yet that is precisely where the biggest misconception begins. People see a clean screen on a laptop and assume the hard part is over. In practice, that is where the real work starts — everything that never shows up in a screenshot.</p>\n      <p>AI will happily generate a data entry form that works flawlessly while you sit at home on fast Wi-Fi typing neat test entries. Take that same tool into the real world and everything changes. What happens when a user walks into an underground garage or deep forest with zero signal? What if someone in a rush double-taps a submit button because the screen took a fraction of a second to respond? What if an older user opens the page with enlarged system fonts and half the layout overlaps?</p>\n      <p>Artificial intelligence does not anticipate those situations on its own. It predicts the most probable code based on what you asked for. If you do not know how to ask the right question, how browser storage behaves, or what happens when a connection drops mid-save, you end up with a polished facade with no load-bearing walls behind it.</p>\n      <h2>Operational Experience Beats Textbook Syntax</h2>\n      <p>This is where builders coming from outside traditional software backgrounds hold an advantage they often underestimate.</p>\n      <p>When you spend twenty years solving problems for real people under time pressure, you develop an instinct for what works in practice and what is merely decoration. In a busy workshop, nobody reads a thirty-page manual or clicks through five submenus just to log one note. If a tool does not help within the first ten seconds, people will bypass it and go straight back to pen and paper — no matter how modern it looks.</p>\n      <p>That lesson shapes everything I build on <a href=\"/en/\">zrina.app</a>. When creating <a href=\"/en/carwash/\">carwash.app</a>, the starting point was never which database to pick, but the simple fact that staff wasted time walking across lots looking for cars and keys. With <a href=\"/en/drone-logbook/\">DroneLogbook</a>, the goal was never air-traffic control, just a clean place to record battery health, weather, and maintenance notes in two minutes before you forget them. And with <a href=\"/en/teka/\">Mamina Teka</a>, the core challenge was not which AI model reads handwriting, but preserving the story and margin notes behind a family recipe before the paper fades.</p>\n      <p>Across all of those projects, AI works as an extraordinary accelerator — like a workshop tool that cuts material quickly and assembles the rough frame. Still, the blueprint, the measurements, checking every joint, and deciding where to reinforce the structure remain human responsibilities.</p>\n      <h2>Where Independent Builders Go From Here</h2>\n      <p>We are entering a period where more small, focused tools will be created not by large corporations, but by individuals for their own trades, hobbies, and families. Large software companies rarely care about narrow, everyday bottlenecks — they need mass-market products, user accounts, and recurring subscriptions.</p>\n      <p>That leaves wide open space for independent builders: not to compete on bloated feature lists, but to offer honest, fast, understandable tools that solve one real problem cleanly.</p>\n      <aside class=\"article-note\"><strong>Closing thought:</strong> Tools change month by month — today we use one generation of models, tomorrow faster ones will arrive. What never changes is the need for someone behind the screen who genuinely understands the person using the software.</aside>\n    "
  },
  "umor-od-mjesecnih-pretplata-mali-web-alati": {
    "slug": "subscription-fatigue-why-small-browser-tools-are-coming-back",
    "title": "Subscription Fatigue: Why Small Browser-Based Web Tools Are Making a Comeback",
    "description": "How everyday utilities turned into accounts, 200 MB downloads, and monthly rentals — and why quiet, browser-based tools are regaining ground.",
    "category": "Practical Tools",
    "imageAlt": "Small browser web tools without registration or subscriptions — zrina.app",
    "body": "\n      <p class=\"article-lead\">There was a time when the relationship between a person and a tool was straightforward: you bought a hammer, a notebook, or software on a disc, put it on a shelf, and knew it was yours. It worked today, it would work five years from now, and nobody could lock you out mid-task because a card expired or terms of service changed overnight.</p>\n      <p>Over the past decade, the digital world quietly flipped that relationship upside down. Today, for the simplest everyday action — jotting down three grocery items, converting an image, checking whether a website is down, or logging basic gear notes — you hit a wall first: download a 200 MB app, create an account, verify your email, accept notifications, and choose a monthly plan after a seven-day trial.</p>\n      <h2>When Software Stops Serving You and Starts Serving Billing</h2>\n      <p>Paying for good work has never been the issue — anyone who has ever built something knows how much effort goes into keeping a system reliable. The real issue is that even tiny, single-purpose utilities have been redesigned around attention retention and recurring billing.</p>\n      <p>Once an app depends on subscriptions, its primary goal is no longer to help you in ten seconds and get out of the way. The goal becomes keeping you inside, sending reminders, keeping your records exclusively on company servers, and making it inconvenient to leave. The moment you cancel, your own notes, lists, or logs are suddenly trapped behind a paywall.</p>\n      <p>Alongside that comes quiet digital clutter. Our phones are packed with dozens of icons opened twice a year, each demanding updates, separate passwords, and background battery for tasks that could easily happen inside a single browser tab.</p>\n      <h2>The Quiet Return of the Browser and Local-First Tools</h2>\n      <p>Interestingly, just as commercial software grows heavier and more expensive, a quieter shift is happening in the opposite direction. A modern mobile browser is far more capable than it was ten years ago. Through Progressive Web Apps (<strong>PWAs</strong>), a lightweight web page opens instantly, can be pinned straight to your home screen, and keeps working even when your connection drops.</p>\n      <p>An even bigger shift lies in how data is stored. With a <em>local-first</em> approach, everything you enter stays directly on your own device. There is no reason for your grocery list or field note to travel to a remote server just so you can read it five minutes later.</p>\n      <p>That model restores trust because the rules are clear from the first second: no hidden tracking, no profiling, no subscription lock-in, and no worry that your records will vanish if a startup shuts down tomorrow.</p>\n      <h2>The Case for Small, Honest Tools</h2>\n      <p>When I started putting projects together on <a href=\"/en/\">zrina.app</a>, that exact idea guided every decision — building the digital equivalent of a reliable hand tool from the garage. You pick it up when needed, it does the one job it was made for, asks for nothing in return, and goes right back on the shelf.</p>\n      <p>Whether someone opens <a href=\"/en/hostvitals/\">HostVitals</a> to check in thirty seconds if a connection issue is local or server-side, or uses <a href=\"/en/drone-logbook/\">DroneLogbook</a> to keep track of batteries and flights, the experience should stay the same: open the page and get straight to work.</p>\n      <aside class=\"article-note\"><strong>Looking ahead:</strong> The future of the web does not belong solely to giant platforms trying to bundle your entire life into one subscription. More and more people are rediscovering small, fast, independent tools that respect their time, device, and privacy.</aside>\n    "
  }
};
