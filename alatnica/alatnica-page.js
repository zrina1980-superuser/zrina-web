(() => {
  const description = {
    hr: "alatnica.app je instalabilna PWA za katalog alata, zaduživanje, povrat, kalibraciju i inventuru u radionicama.",
    en: "alatnica.app is an installable PWA for tool catalogues, check-outs, returns, calibration and stocktaking in workshops."
  };
  const title = {
    hr: "alatnica.app — Digitalna alatnica | zrina.app",
    en: "alatnica.app — Digital Workshop | zrina.app"
  };
  const socialTitle = {
    hr: "alatnica.app — Digitalna alatnica",
    en: "alatnica.app — Digital Workshop"
  };

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.dataset.lang;
      document.documentElement.lang = language;
      document.title = title[language];
      const emailSubject = language === "hr"
        ? "alatnica.app — Upit za demo"
        : "alatnica.app — Demo inquiry";
      document.querySelectorAll('a[href^="mailto:alatnica@zrina.app?subject="]').forEach((link) => {
        link.href = `mailto:alatnica@zrina.app?subject=${encodeURIComponent(emailSubject)}`;
      });
      document.getElementById("meta-description").content = description[language];
      document.querySelector('meta[property="og:title"]').content = socialTitle[language];
      document.getElementById("og-description").content = description[language];
      document.querySelector('meta[name="twitter:title"]').content = socialTitle[language];
      document.querySelector('meta[name="twitter:description"]').content = description[language];
      document.querySelectorAll("[data-hr][data-en]").forEach((element) => {
        element.textContent = element.getAttribute(`data-${language}`);
      });
      document.querySelectorAll("[data-alt-hr][data-alt-en]").forEach((element) => {
        element.alt = element.getAttribute(`data-alt-${language}`);
      });
      document.querySelectorAll("[data-lang]").forEach((languageButton) => {
        languageButton.setAttribute("aria-pressed", String(languageButton === button));
      });
      document.querySelector(".language-switch").setAttribute(
        "aria-label",
        language === "hr" ? "Odabir jezika" : "Language selector"
      );
      document.getElementById("metrics").setAttribute(
        "aria-label",
        language === "hr" ? "Sažetak" : "At a glance"
      );
      document.querySelector(".top-actions").setAttribute(
        "aria-label",
        language === "hr" ? "Glavna navigacija" : "Main navigation"
      );
      document.querySelector(".brand").setAttribute(
        "aria-label",
        language === "hr" ? "zrina.app — svi projekti" : "zrina.app — all projects"
      );
    });
  });
})();
