import {
  allocateVlsm,
  availableAddresses,
  findGaps,
  findNextFree,
  findOverlaps,
  formatCount,
  parseCidr,
  parseNetworks,
  toCsv
} from './network.mjs';

const byId = id => document.getElementById(id);
const controls = {
  pool: byId('pool'),
  nextPrefix: byId('nextPrefix'),
  occupied: byId('occupied'),
  vlsm: byId('vlsm'),
  cloud: byId('cloud')
};
const status = byId('status');
let exportRows = [];
const awsConflictRange = parseCidr('172.17.0.0/16');

function setStatus(message, kind = '') {
  status.textContent = message;
  status.className = `status${kind ? ` ${kind}` : ''}`;
}

function appendElement(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  parent.append(element);
  return element;
}

function parseRequests(text) {
  const lines = text.split(/\r?\n/);
  if (lines.filter(line => line.trim()).length > 200) throw new Error('Enter no more than 200 VLSM host requests at a time.');
  return lines.map((line, index) => {
    const value = line.trim();
    if (!value) return null;
    const match = value.match(/^(.*?)(?:\s*,\s*|\s+)(\d+)$/);
    if (!match) {
      if (/^\d+$/.test(value)) return { name: `Request ${index + 1}`, hosts: Number(value) };
      throw new Error(`VLSM line ${index + 1} must be "name, host-count" or a host-count.`);
    }
    return { name: match[1].trim() || `Request ${index + 1}`, hosts: Number(match[2]) };
  }).filter(Boolean);
}

function renderSummary(pool, existing, gaps, next, cloud) {
  const target = byId('summary');
  target.replaceChildren();
  const totalFree = gaps.reduce((total, gap) => total + gap.end - gap.start + 1n, 0n);
  const metrics = [
    ['Address family', pool.family],
    ['Pool', pool.network],
    ['Total addresses', formatCount(pool.size)],
    ['Free addresses', formatCount(totalFree)],
    ['Existing networks', String(existing.length)],
    ['Next free subnet', next ? next.network : 'No matching block']
  ];
  for (const [label, value] of metrics) {
    const card = appendElement(target, 'div', 'metric');
    appendElement(card, 'strong', '', label);
    appendElement(card, 'span', '', value);
  }
  const warnings = byId('warnings');
  warnings.replaceChildren();
  if (pool.input !== pool.network) {
    appendElement(warnings, 'p', 'warning', `Pool normalized to ${pool.network}; the entered address included host bits.`);
  }
  const outside = existing.filter(network => network.end < pool.start || network.start > pool.end);
  const partial = existing.filter(network =>
    (network.start < pool.start && network.end >= pool.start) ||
    (network.start <= pool.end && network.end > pool.end)
  );
  const intersectsAwsConflict = [pool, ...existing].some(network =>
    network.start <= awsConflictRange.end && network.end >= awsConflictRange.start
  );
  if (outside.length) appendElement(warnings, 'p', 'warning', `${outside.length} existing network(s) are outside this pool and do not reduce its free space.`);
  if (partial.length) appendElement(warnings, 'p', 'warning', `${partial.length} existing network(s) cross the pool boundary; only the intersecting addresses are counted as occupied.`);
  if (cloud === 'aws' && intersectsAwsConflict) {
    appendElement(warnings, 'p', 'warning', 'AWS note: ranges overlapping 172.17.0.0/16 can conflict with service-managed networking. Review your AWS service topology before using this range.');
  }
  if (pool.family === 'IPv6' && cloud !== 'standard') {
    appendElement(warnings, 'p', 'warning', 'Cloud reserved-address counts are IPv4-only; IPv6 availability is shown as not defined.');
  }
}

function renderNetworks(networks, overlaps, cloud) {
  const target = byId('networkResults');
  target.replaceChildren();
  if (!networks.length) {
    appendElement(target, 'p', 'muted', 'No existing networks were entered.');
    return;
  }
  const overlapPartners = new Map(networks.map(network => [network, new Set()]));
  for (const [left, right] of overlaps) {
    overlapPartners.get(left).add(right.label);
    overlapPartners.get(right).add(left.label);
  }
  networks.forEach(network => {
    const card = appendElement(target, 'article', 'result');
    appendElement(card, 'strong', '', network.label);
    appendElement(card, 'code', '', network.network);
    appendElement(card, 'p', '', `Range: ${network.range}`);
    appendElement(card, 'p', '', `Addresses: ${formatCount(network.size)}`);
    const available = availableAddresses(network, cloud);
    appendElement(card, 'p', '', `Available (${cloud.toUpperCase()}): ${available == null ? 'not defined for IPv6' : formatCount(available)}`);
    const partners = [...overlapPartners.get(network)];
    if (partners.length) appendElement(card, 'p', 'warning', `Overlaps: ${partners.join(', ')}`);
    if (network.input !== network.network) appendElement(card, 'p', 'muted', `Normalized from ${network.input}`);
  });
}

function renderGaps(pool, gaps) {
  const target = byId('gaps');
  target.replaceChildren();
  if (!gaps.length) {
    appendElement(target, 'p', 'muted', 'No free addresses remain in this pool.');
    return;
  }
  gaps.slice(0, 30).forEach(gap => {
    const count = gap.end - gap.start + 1n;
    const card = appendElement(target, 'article', 'result');
    appendElement(card, 'strong', '', `${formatCount(count)} free address(es)`);
    appendElement(card, 'code', '', `${pool.addressFormatter(gap.start)} – ${pool.addressFormatter(gap.end)}`);
  });
  if (gaps.length > 30) appendElement(target, 'p', 'muted', `${gaps.length - 30} additional gaps omitted from this view.`);
}

function renderVlsm(allocations, cloud) {
  const target = byId('vlsmResults');
  target.replaceChildren();
  if (!allocations.length) {
    const row = appendElement(target, 'tr');
    appendElement(row, 'td', 'muted', 'No VLSM host requests were entered.');
    row.firstChild.colSpan = 5;
    return;
  }
  allocations.forEach(network => {
    const row = appendElement(target, 'tr');
    appendElement(row, 'td', '', network.label);
    appendElement(row, 'td', '', formatCount(BigInt(network.hosts)));
    const subnet = appendElement(row, 'td');
    appendElement(subnet, 'code', '', network.network);
    appendElement(row, 'td', '', network.range);
    const available = availableAddresses(network, cloud);
    appendElement(row, 'td', '', available == null ? 'not defined for IPv6' : formatCount(available));
  });
}

function analyze() {
  try {
    const pool = parseCidr(controls.pool.value);
    const existing = parseNetworks(controls.occupied.value, pool.family);
    const overlaps = findOverlaps(existing);
    const requests = parseRequests(controls.vlsm.value);
    const cloud = controls.cloud.value;
    const allocations = allocateVlsm(pool, existing, requests, cloud);
    const gaps = findGaps(pool, existing);
    if (!controls.nextPrefix.value.trim()) throw new Error('Enter the prefix to find, from 0 to 128.');
    const prefix = Number(controls.nextPrefix.value);
    const next = findNextFree(pool, existing, prefix);

    renderSummary(pool, existing, gaps, next, cloud);
    renderNetworks(existing, overlaps, cloud);
    renderGaps(pool, gaps);
    renderVlsm(allocations, cloud);
    exportRows = [
      { ...pool, label: 'Pool', available: availableAddresses(pool, cloud) },
      ...existing.map(network => ({ ...network, available: availableAddresses(network, cloud) })),
      ...allocations.map(network => ({ ...network, available: availableAddresses(network, cloud) }))
    ];
    byId('downloadCsv').disabled = false;
    setStatus(overlaps.length ? `${overlaps.length} overlap(s) found. VLSM avoids the entered ranges, but resolve conflicts before using the plan.` : 'Analysis complete. No overlaps found among the entered networks.', overlaps.length ? 'error' : 'success');
    return true;
  } catch (error) {
    exportRows = [];
    byId('downloadCsv').disabled = true;
    byId('summary').replaceChildren();
    byId('networkResults').replaceChildren();
    byId('gaps').replaceChildren();
    byId('vlsmResults').replaceChildren();
    setStatus(error.message || 'Could not analyze this plan.', 'error');
    return false;
  }
}

async function copyShareLink() {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('pool', controls.pool.value);
  url.searchParams.set('used', controls.occupied.value);
  url.searchParams.set('need', controls.vlsm.value);
  url.searchParams.set('prefix', controls.nextPrefix.value);
  url.searchParams.set('cloud', controls.cloud.value);
  if (!navigator.clipboard?.writeText) {
    setStatus('Clipboard access is unavailable; the share link could not be copied.', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(url.href);
    setStatus('Share link copied. It includes the entered network details.', 'success');
  } catch {
    setStatus('Clipboard access is unavailable; the share link could not be copied.', 'error');
  }
}

function downloadCsv() {
  if (!exportRows.length) return;
  const blob = new Blob([`\uFEFF${toCsv(exportRows)}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'network-plan.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

byId('analyze').addEventListener('click', analyze);
byId('copyLink').addEventListener('click', copyShareLink);
byId('downloadCsv').addEventListener('click', downloadCsv);

for (const control of Object.values(controls)) {
  control.addEventListener('input', () => setStatus('Inputs changed. Analyze again to refresh the results.'));
}

const query = new URLSearchParams(location.search);
if (query.has('pool')) controls.pool.value = query.get('pool');
if (query.has('used')) controls.occupied.value = query.get('used');
if (query.has('need')) controls.vlsm.value = query.get('need');
if (query.has('prefix')) controls.nextPrefix.value = query.get('prefix');
if (['standard', 'aws', 'azure', 'gcp'].includes(query.get('cloud'))) controls.cloud.value = query.get('cloud');
analyze();
