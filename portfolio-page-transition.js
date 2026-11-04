(() => {
  const nav = document.querySelector(".topbar-inner");
  const actions = nav?.querySelector(".topbar-actions");

  if (!nav || !actions) return;

  const link = document.createElement("a");
  link.className = "portfolio-return";
  link.href = "../index.html";
  const mobileView = window.matchMedia("(max-width: 520px)");

  const updateLabel = () => {
    let language = "hr";
    try {
      language = localStorage.getItem("zrina_lang")
        || localStorage.getItem("gljivobook_lang")
        || localStorage.getItem("drone_lang")
        || "hr";
    } catch (error) {
      console.warn("Could not read the saved language preference.", error);
    }
    const isEnglish = language === "en";
    const label = isEnglish ? "← zrina.app" : "← Svi projekti";
    link.textContent = mobileView.matches ? "←" : label;
    link.setAttribute("aria-label", label);
    link.title = label;
  };

  updateLabel();
  nav.insertBefore(link, actions);
  mobileView.addEventListener("change", updateLabel);
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => window.setTimeout(updateLabel, 0));
  });
})();
