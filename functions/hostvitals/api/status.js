const STATUS_PAGES = {
  github: {
    name: 'GitHub',
    url: 'https://www.githubstatus.com/api/v2/summary.json',
    pageUrl: 'https://www.githubstatus.com/'
  },
  cloudflare: {
    name: 'Cloudflare',
    url: 'https://www.cloudflarestatus.com/api/v2/summary.json',
    pageUrl: 'https://www.cloudflarestatus.com/'
  },
  openai: {
    name: 'OpenAI',
    url: 'https://status.openai.com/api/v2/summary.json',
    pageUrl: 'https://status.openai.com/'
  }
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200 ? 'public, max-age=60' : 'no-store'
    }
  });

export async function onRequestGet({ request }) {
  const service = new URL(request.url).searchParams.get('service');
  const config = Object.hasOwn(STATUS_PAGES, service) ? STATUS_PAGES[service] : null;
  if (!config) return json({ error: 'unsupported status service' }, 400);

  try {
    const response = await fetch(config.url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) return json({ error: `Status provider returned HTTP ${response.status}` }, 502);

    const data = await response.json();
    if (!data?.status || !Array.isArray(data.components)) {
      return json({ error: 'Status provider returned an unexpected response' }, 502);
    }

    return json({
      service: config.name,
      indicator: String(data.status.indicator || 'unknown'),
      description: String(data.status.description || 'Status not provided'),
      updatedAt: data.page?.updated_at || null,
      sourceUrl: config.pageUrl,
      components: data.components
        .filter(component => component.showcase !== false)
        .map(component => ({
          name: String(component.name || 'Unnamed component'),
          status: String(component.status || 'unknown')
        })),
      incidents: (Array.isArray(data.incidents) ? data.incidents : []).slice(0, 3).map(incident => ({
        name: String(incident.name || 'Incident'),
        status: String(incident.status || 'unknown'),
        impact: String(incident.impact || 'unknown')
      }))
    });
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return json({ error: timedOut ? 'Status provider timed out' : 'Could not reach the status provider' }, 502);
  }
}
