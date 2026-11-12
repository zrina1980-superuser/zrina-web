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
  }
};
