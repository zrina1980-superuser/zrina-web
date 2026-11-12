(() => {
  const copy = {
    hr: {
      home: "← Svi projekti",
      brandTag: "zrina.app · Autorski projekt",
      navLabel: "Glavna navigacija",
      langLabel: "Odabir jezika",
      systemLabel: "Sažetak toka aplikacije",
      contextLabel: "01 / KONTEKST",
      workflowLabel: "02 / TIJEK RADA",
      capabilitiesLabel: "03 / MOGUĆNOSTI",
      architectureLabel: "04 / ARHITEKTURA",
      kicker: "Autorski projekt · Tehnički pregled",
      openApp: "Pokreni aplikaciju",
      videos: "Videozapisi",
      videosIntro: "Pogledaj aplikaciju na djelu. Videozapisi se otvaraju na YouTubeu.",
      video: "Video prikaz",
      short: "YouTube Shorts",
      watchOnYouTube: "Pogledaj na YouTubeu",
      overview: "O projektu",
      workflow: "Kako se aplikacija koristi",
      workflowIntro: "Od početnog unosa do pregleda rezultata, korak po korak.",
      modules: "Što aplikacija obuhvaća",
      modulesIntro: "Ključne cjeline koje zajedno čine cjeloviti tijek rada.",
      architecture: "Arhitektura i tok podataka",
      architectureIntro: "Pojednostavljen prikaz načina na koji su povezani korisnički unos, logika aplikacije i pohrana ili vanjski servisi.",
      stack: "Tehnologije",
      privacy: "Podaci i privatnost",
      contactTitle: "Pitanja o projektu?",
      contactText: "Ovdje predstavljam projekt i objašnjavam kako sam ga osmislio i razvio.",
      requestAccess: "Javi se za isprobavanje",
      step: "KORAK",
      stage: "MODUL",
      footer: "Autorski projekt u mom inženjerskom portfelju.",
      systemState: "Projektni pregled",
      caseLabel: "STUDIJA SLUČAJA",
      caseTitle: "Problem, rješenje i što sam naučio",
      caseProblem: "Problem",
      caseSolution: "Rješenje",
      caseDecisions: "Ključne odluke",
      caseLearned: "Što sam naučio"
    },
    en: {
      home: "← All projects",
      brandTag: "zrina.app · Independent project",
      navLabel: "Main navigation",
      langLabel: "Language selector",
      systemLabel: "Application flow summary",
      contextLabel: "01 / CONTEXT",
      workflowLabel: "02 / WORKFLOW",
      capabilitiesLabel: "03 / CAPABILITIES",
      architectureLabel: "04 / ARCHITECTURE",
      kicker: "Independent project · Technical overview",
      openApp: "Launch app",
      videos: "Videos",
      videosIntro: "See the app in action. Videos open on YouTube.",
      video: "Video overview",
      short: "YouTube Shorts",
      watchOnYouTube: "Watch on YouTube",
      overview: "About the project",
      workflow: "How the application is used",
      workflowIntro: "From the first input to reviewing the result, step by step.",
      modules: "What the application covers",
      modulesIntro: "Core areas that work together to form the complete workflow.",
      architecture: "Architecture and data flow",
      architectureIntro: "A simplified view of how user input, application logic, storage and external services fit together.",
      stack: "Tech stack",
      privacy: "Data and privacy",
      contactTitle: "Questions about the project?",
      contactText: "This page introduces the project and explains how I designed and built it.",
      requestAccess: "Ask to try the app",
      step: "STEP",
      stage: "MODULE",
      footer: "An independent project in my engineering portfolio.",
      systemState: "Project overview",
      caseLabel: "CASE STUDY",
      caseTitle: "Problem, solution and what I learned",
      caseProblem: "The problem",
      caseSolution: "The solution",
      caseDecisions: "Key decisions",
      caseLearned: "What I learned"
    }
  };

  (async function loadProject() {
    let project;
    try {
      const embeddedData = document.getElementById("project-data");
      let record;
      if (embeddedData?.textContent.trim()) {
        record = JSON.parse(embeddedData.textContent);
      } else {
        const response = await fetch("../projects.json");
        if (!response.ok) throw new Error(`Project data request failed: ${response.status} ${response.statusText}`);
        const catalog = await response.json();
        record = catalog.find((item) => item.id === document.body.dataset.project);
      }
      if (!record || !record.projectPage) throw new Error(`Missing technical project page: ${document.body.dataset.project || "(missing data-project)"}`);
      if (record.id !== document.body.dataset.project) {
        throw new Error(`Project data does not match page: ${document.body.dataset.project || "(missing data-project)"}`);
      }
      project = {
        ...record.projectPage,
        name: record.name,
        appUrl: record.launchUrl,
        email: record.email,
        icon: `../${record.icon}`,
        tech: record.projectPage.tech,
        accent: record.accent,
        caseStudy: record.caseStudy,
        videos: record.videos
      };
    } catch (error) {
      console.error("Could not load project data.", error);
      document.querySelector("main").textContent = "Project data is unavailable. Please refresh the page or try again later.";
      return;
    }

    const language = (localStorage.getItem("zrina_lang") || localStorage.getItem("gljivobook_lang") || localStorage.getItem("drone_lang")) === "en" ? "en" : "hr";
    function render(lang) {
      const labels = copy[lang];
      document.documentElement.lang = lang;
      document.title = `${project.name} — ${lang === "hr" ? "Projektni pregled" : "Project overview"} | zrina.app`;
      document.querySelector('meta[name="description"]').content = project.lead[lang];
      document.documentElement.style.setProperty("--page-accent", project.accent);
      document.querySelectorAll("[data-copy]").forEach((element) => {
        element.textContent = labels[element.dataset.copy];
        if (element.classList.contains("page-home")) element.setAttribute("aria-label", labels.home.replace(/^←\s*/, ""));
      });
      document.querySelectorAll("[data-lang]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
      });
      document.querySelector(".page-topbar").setAttribute("aria-label", labels.navLabel);
      document.querySelector(".page-language").setAttribute("aria-label", labels.langLabel);
      document.querySelector(".system-card").setAttribute("aria-label", labels.systemLabel);
      document.querySelector(".page-brand small").textContent = labels.brandTag;
      const sectionLabels = document.querySelectorAll(".page-section:not(.case-section) .page-label");
      sectionLabels[0].textContent = labels.contextLabel;
      sectionLabels[1].textContent = labels.workflowLabel;
      sectionLabels[2].textContent = labels.capabilitiesLabel;
      sectionLabels[3].textContent = labels.architectureLabel;
      document.getElementById("project-logo").src = project.icon;
      document.getElementById("project-name").textContent = project.name;
      document.getElementById("project-kicker").textContent = labels.kicker;
      document.getElementById("project-title").textContent = project.title[lang];
      document.getElementById("project-lead").textContent = project.lead[lang];
      const appLink = document.getElementById("project-app-link");
      appLink.href = project.appUrl.startsWith("mailto:")
        ? `mailto:${project.email}?subject=${encodeURIComponent(`${project.name} — ${lang === "hr" ? "Upit za isprobavanje" : "Request to try the app"}`)}`
        : project.appUrl;
      if (project.appUrl.startsWith("https://")) {
        document.getElementById("project-app-link").target = "_blank";
        document.getElementById("project-app-link").rel = "noopener noreferrer";
      }
      document.getElementById("project-app-link").textContent = project.appUrl.startsWith("mailto:") ? labels.requestAccess : labels.openApp;
      document.getElementById("system-state").textContent = labels.systemState;
      document.getElementById("system-flow").innerHTML = project.flow.map((step, index) => `
        <div class="system-step">
          <span class="system-step-index">0${index + 1}</span>
          <span class="system-step-name">${step[lang][0]}</span>
          <span class="system-step-arrow" aria-hidden="true">${index < project.flow.length - 1 ? "↓" : "✓"}</span>
        </div>
      `).join("");
      document.getElementById("project-overview").innerHTML = project.overview[lang].map((paragraph) => `<p>${paragraph}</p>`).join("");
      document.getElementById("project-workflow").innerHTML = project.workflow.map((step, index) => `
        <article class="workflow-step" data-index="0${index + 1}">
          <span class="workflow-index">${String(index + 1).padStart(2, "0")}</span>
          <h3>${step[lang][0]}</h3>
          <p>${step[lang][1]}</p>
        </article>
      `).join("");
      document.getElementById("project-modules").innerHTML = project.modules.map((module, index) => `
        <article class="module-card">
          <span class="module-card-index">${String(index + 1).padStart(2, "0")} / ${labels.stage}</span>
          <h3>${module[lang][0]}</h3>
          <p>${module[lang][1]}</p>
        </article>
      `).join("");
      document.getElementById("project-flow").innerHTML = project.flow.map((step, index) => `
        <article class="architecture-step">
          <span>${labels.step} 0${index + 1}</span>
          <h3>${step[lang][0]}</h3>
          <p>${step[lang][1]}</p>
        </article>
      `).join("");
      document.getElementById("project-tech").textContent = project.tech[lang];
      document.getElementById("project-privacy").textContent = project.privacy[lang];
      document.getElementById("contact-email").href = `mailto:${project.email}?subject=${encodeURIComponent(`${project.name} — ${lang === "hr" ? "Tehnički upit" : "Technical inquiry"}`)}`;
      document.getElementById("contact-email").textContent = project.email;
      document.getElementById("page-year").textContent = new Date().getFullYear();
      document.getElementById("page-footer-copy").textContent = labels.footer;
      document.getElementById("page-overview-title").textContent = labels.overview;
      document.getElementById("page-workflow-title").textContent = labels.workflow;
      document.getElementById("page-workflow-intro").textContent = labels.workflowIntro;
      document.getElementById("page-modules-title").textContent = labels.modules;
      document.getElementById("page-modules-intro").textContent = labels.modulesIntro;
      document.getElementById("page-architecture-title").textContent = labels.architecture;
      document.getElementById("page-architecture-intro").textContent = labels.architectureIntro;
      document.getElementById("page-stack-title").textContent = labels.stack;
      document.getElementById("page-privacy-title").textContent = labels.privacy;
      document.getElementById("contact-title").textContent = labels.contactTitle;
      document.getElementById("contact-text").textContent = labels.contactText;
      document.querySelectorAll('a[href$="index.html"]').forEach((link) => {
        if (link.getAttribute("href").startsWith("../")) link.href = lang === "en" ? "../en/" : "../";
      });
      renderCaseStudy(lang, labels);
      renderVideos(lang, labels);
    }

    function renderVideos(lang, labels) {
      if (!project.videos?.length) return;
      let section = document.getElementById("project-videos");
      if (!section) {
        section = document.createElement("section");
        section.id = "project-videos";
        section.className = "page-section video-section";
        section.setAttribute("aria-labelledby", "project-videos-title");
        (document.getElementById("case-study") || document.querySelector(".page-hero"))
          .insertAdjacentElement("afterend", section);
        const jump = document.createElement("a");
        jump.href = "#project-videos";
        jump.className = "page-button secondary";
        jump.id = "project-videos-link";
        document.getElementById("project-app-link").insertAdjacentElement("afterend", jump);
      }
      document.getElementById("project-videos-link").textContent = labels.videos;
      section.replaceChildren();
      const heading = document.createElement("div");
      heading.className = "page-section-head";
      const title = document.createElement("h2");
      title.id = "project-videos-title";
      title.textContent = labels.videos;
      const intro = document.createElement("p");
      intro.textContent = labels.videosIntro;
      heading.append(title, intro);
      section.append(heading);
      const grid = document.createElement("div");
      grid.className = "video-grid";
      for (const video of project.videos) {
        const link = document.createElement("a");
        link.className = "video-card";
        link.href = video.kind === "short"
          ? `https://www.youtube.com/shorts/${video.id}`
          : `https://www.youtube.com/watch?v=${video.id}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const image = document.createElement("img");
        image.src = `../assets/portfolio/video-thumbnails/${video.id}.webp`;
        image.alt = "";
        image.width = 800;
        image.height = 450;
        image.loading = "lazy";
        image.decoding = "async";
        const thumbnail = document.createElement("span");
        thumbnail.className = "video-card-image";
        thumbnail.append(image);
        const details = document.createElement("div");
        details.className = "video-card-details";
        const kind = document.createElement("span");
        kind.className = "video-card-kind";
        kind.textContent = labels[video.kind];
        const name = document.createElement("strong");
        name.textContent = video.title[lang];
        const watch = document.createElement("span");
        watch.className = "video-card-watch";
        watch.textContent = `${labels.watchOnYouTube} ↗`;
        details.append(kind, name, watch);
        link.append(thumbnail, details);
        grid.append(link);
      }
      section.append(grid);
    }

    function renderCaseStudy(lang, labels) {
      const study = project.caseStudy;
      let section = document.getElementById("case-study");
      if (!study) return;
      if (!section) {
        section = document.createElement("section");
        section.id = "case-study";
        section.className = "page-section case-section";
        const anchor = document.querySelector(".page-hero");
        anchor.insertAdjacentElement("afterend", section);
      }
      const paragraphs = (items) => items[lang].map((text) => `<p>${text}</p>`).join("");
      section.innerHTML = `
        <div class="page-section-head"><div><span class="page-label">${labels.caseLabel}</span><h2>${labels.caseTitle}</h2></div><p>${study.role[lang]}</p></div>
        <div class="case-facts">${study.facts.map((fact) => `<div class="case-fact"><span>${fact[lang][0]}</span><strong>${fact[lang][1]}</strong></div>`).join("")}</div>
        <div class="case-columns">
          <article class="case-block"><h3>${labels.caseProblem}</h3>${paragraphs(study.problem)}</article>
          <article class="case-block"><h3>${labels.caseSolution}</h3>${paragraphs(study.solution)}</article>
        </div>
        <h3 class="case-subhead">${labels.caseDecisions}</h3>
        <div class="module-grid">${study.decisions.map((item, index) => `
          <article class="module-card"><span class="module-card-index">${String(index + 1).padStart(2, "0")}</span><h3>${item[lang][0]}</h3><p>${item[lang][1]}</p></article>`).join("")}</div>
        <article class="case-block case-learned"><h3>${labels.caseLearned}</h3>${paragraphs(study.learned)}</article>
        ${study.gallery ? `<div class="case-gallery">${study.gallery.map((shot) => `<figure><img src="../${shot.src}" alt="${shot.alt[lang]}" loading="lazy" decoding="async"><figcaption>${shot.caption[lang]}</figcaption></figure>`).join("")}</div>` : ""}`;
    }
  
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        localStorage.setItem("zrina_lang", button.dataset.lang);
        if (document.body.dataset.project === "gljivobook") localStorage.setItem("gljivobook_lang", button.dataset.lang);
        if (document.body.dataset.project === "drone") localStorage.setItem("drone_lang", button.dataset.lang);
        render(button.dataset.lang);
      });
    });
  
    render(language);
  })();
})();
