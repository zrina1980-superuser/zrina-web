const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 5;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*'
    }
  });

function isBlockedHost(host) {
  const h = host.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (h.includes(':') || h.startsWith('[')) return true;
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  return !h.includes('.');
}

export async function onRequestGet({ request }) {
  const target = new URL(request.url).searchParams.get('url');
  if (!target || target.length > 2048) return json({ error: 'missing or too long url' }, 400);

  let current;
  try {
    current = new URL(target);
  } catch {
    return json({ error: 'invalid url' }, 400);
  }

  const start = Date.now();
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let redirects = 0;

  try {
    for (;;) {
      if (!['http:', 'https:'].includes(current.protocol) || isBlockedHost(current.hostname)) {
        return json({ error: 'target not allowed' }, 400);
      }

      const res = await fetch(current.href, {
        method: 'GET',
        redirect: 'manual',
        signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; HostVitalsProbe/1.0; +https://zrina.app/hostvitals/)',
          accept: 'text/html,*/*;q=0.8'
        }
      });

      const location = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && location && redirects < MAX_REDIRECTS) {
        res.body?.cancel();
        current = new URL(location, current);
        redirects++;
        continue;
      }

      res.body?.cancel();
      return json({
        status: res.status,
        finalUrl: current.href,
        redirects,
        server: res.headers.get('server') || null,
        timeMs: Date.now() - start
      });
    }
  } catch (err) {
    const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    return json({ error: timedOut ? 'timeout' : 'connection failed', timeMs: Date.now() - start }, 502);
  }
}
