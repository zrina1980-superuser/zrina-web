const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

const clean = (value, max) => String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
const escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: "forbidden" }, 403);

  if (!env.RESEND_API_KEY || !env.SUGGEST_TO || !env.SUGGEST_FROM) return json({ error: "not_configured" }, 503);

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  // Bots fill the hidden field or submit instantly; pretend success.
  if (data.website || Number(data.elapsed) < 3000) return json({ ok: true });

  const problem = clean(data.problem, 2000);
  if (problem.length < 10) return json({ error: "problem_required" }, 400);
  const who = clean(data.who, 2000);
  const tried = clean(data.tried, 2000);
  const name = clean(data.name, 200);
  const email = clean(data.email, 200);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";

  const text = [`Problem:\n${problem}`, who && `Tko:\n${who}`, tried && `Probano:\n${tried}`, name && `Ime: ${name}`, `E-pošta: ${validEmail || "(nije navedena)"}`].filter(Boolean).join("\n\n");
  const html = text.split("\n").map((line) => escapeHtml(line)).join("<br>");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.SUGGEST_FROM,
      to: [env.SUGGEST_TO],
      reply_to: validEmail || undefined,
      subject: "Prijedlog aplikacije — zrina.app",
      text,
      html
    })
  });

  return response.ok ? json({ ok: true }) : json({ error: "send_failed" }, 502);
}

export const onRequest = () => json({ error: "method_not_allowed" }, 405);
