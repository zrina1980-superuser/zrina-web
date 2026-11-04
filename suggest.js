(() => {
  const form = document.getElementById("suggest-form");
  if (!form) return;
  const status = document.getElementById("suggest-status");
  const button = form.querySelector("button[type=submit]");
  const loadedAt = Date.now();
  const d = form.dataset;

  function mailto(data) {
    const body = [`${form.querySelector("#problem").labels[0].textContent}\n${data.problem}`, data.who && `\n${data.who}`, data.tried && `\n${data.tried}`, data.name && `\n${data.name}`, data.email && `\n${data.email}`].filter(Boolean).join("\n");
    return `mailto:${d.mail}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(body)}`;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "status";
    status.textContent = "";
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    data.elapsed = Date.now() - loadedAt;
    button.disabled = true;
    button.textContent = d.sending;
    try {
      const response = await fetch("/api/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (response.status === 503) {
        status.textContent = d.fallback;
        location.href = mailto(data);
      } else if (response.ok) {
        status.className = "status ok";
        status.textContent = d.ok;
        form.reset();
      } else {
        throw new Error(String(response.status));
      }
    } catch {
      status.className = "status err";
      status.textContent = `${d.error} ${d.mail}.`;
    } finally {
      button.disabled = false;
      button.textContent = d.send;
    }
  });
})();
