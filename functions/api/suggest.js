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

  if (!response.ok) return json({ error: "send_failed" }, 502);

  // Best-effort confirmation to the sender; a failure here must not fail the submission.
  if (validEmail) {
    const en = data.lang === "en";
    const ack = en
      ? {
          subject: "We received your app suggestion — zrina.app",
          lines: [
            "Hi,",
            "thank you for getting in touch. Your suggestion has arrived and I am glad you shared it with me.",
            "I will read it carefully and get back to you as soon as I can. Not every idea can be built, but I will always reply honestly.",
            "This is an automatic message from a no-reply address. To add something, just write to kontakt@zrina.app.",
            "Vedran, zrina.app"
          ]
        }
      : {
          subject: "Zaprimili smo tvoj prijedlog aplikacije — zrina.app",
          lines: [
            "Bok,",
            "hvala ti što si se javio. Tvoj prijedlog je stigao i veseli me što si ga podijelio sa mnom.",
            "Pročitat ću ga pažljivo i javiti ti se što prije mogu. Ne mogu izraditi baš svaku ideju, ali ti uvijek odgovaram iskreno.",
            "Ovo je automatska poruka, pa na nju nemoj odgovarati. Ako želiš nešto dodati, piši na kontakt@zrina.app.",
            "Vedran, zrina.app"
          ]
        };
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: env.SUGGEST_FROM,
          to: [validEmail],
          reply_to: "kontakt@zrina.app",
          subject: ack.subject,
          text: ack.lines.join("\n\n"),
          html: ack.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")
        })
      });
    } catch {}
  }

  return json({ ok: true });
}

export const onRequest = () => json({ error: "method_not_allowed" }, 405);
