const IPV4_BITS = 32;
const IPV6_BITS = 128;

function parseIpv4(text) {
  const parts = text.split('.');
  if (parts.length !== 4 || parts.some(part => !/^\d{1,3}$/.test(part))) {
    throw new Error(`Invalid IPv4 address: ${text}`);
  }
  const octets = parts.map(Number);
  if (octets.some(octet => octet > 255)) throw new Error(`Invalid IPv4 address: ${text}`);
  return octets.reduce((value, octet) => (value << 8n) | BigInt(octet), 0n);
}

function parseIpv6(text) {
  if (text.includes('%')) throw new Error('IPv6 zone identifiers are not supported.');
  let source = text.toLowerCase();
  if (source.includes('.')) {
    const lastColon = source.lastIndexOf(':');
    if (lastColon < 0) throw new Error(`Invalid IPv6 address: ${text}`);
    const ipv4 = parseIpv4(source.slice(lastColon + 1));
    source = `${source.slice(0, lastColon + 1)}${(ipv4 >> 16n).toString(16)}:${(ipv4 & 0xffffn).toString(16)}`;
  }

  const compressed = source.includes('::');
  if (compressed && source.indexOf('::') !== source.lastIndexOf('::')) {
    throw new Error(`Invalid IPv6 address: ${text}`);
  }
  const [leftText, rightText = ''] = compressed ? source.split('::') : [source, ''];
  const left = leftText ? leftText.split(':') : [];
  const right = rightText ? rightText.split(':') : [];
  const missing = IPV6_BITS / 16 - left.length - right.length;
  if ((compressed && missing < 1) || (!compressed && missing !== 0)) {
    throw new Error(`Invalid IPv6 address: ${text}`);
  }
  const groups = compressed ? [...left, ...Array(missing).fill('0'), ...right] : left;
  if (groups.length !== 8 || groups.some(group => !/^[\da-f]{1,4}$/.test(group))) {
    throw new Error(`Invalid IPv6 address: ${text}`);
  }
  return groups.reduce((value, group) => (value << 16n) | BigInt(`0x${group}`), 0n);
}

function ipv4Text(value) {
  return [24n, 16n, 8n, 0n].map(shift => Number((value >> shift) & 255n)).join('.');
}

function ipv6Text(value) {
  const groups = Array.from({ length: 8 }, (_, index) =>
    Number((value >> BigInt((7 - index) * 16)) & 0xffffn)
  );
  let bestStart = -1;
  let bestLength = 1;
  for (let index = 0; index < groups.length;) {
    if (groups[index] !== 0) {
      index++;
      continue;
    }
    let end = index + 1;
    while (end < groups.length && groups[end] === 0) end++;
    if (end - index > bestLength) {
      bestStart = index;
      bestLength = end - index;
    }
    index = end;
  }
  if (bestStart < 0) return groups.map(group => group.toString(16)).join(':');
  const before = groups.slice(0, bestStart).map(group => group.toString(16)).join(':');
  const after = groups.slice(bestStart + bestLength).map(group => group.toString(16)).join(':');
  return `${before}::${after}`;
}

export function parseCidr(text) {
  const input = text.trim();
  const match = input.match(/^(.+?)\/(\d{1,3})$/);
  if (!match) throw new Error(`Enter a CIDR block with a prefix: ${text}`);
  const addressText = match[1].trim();
  const ipv4 = !addressText.includes(':');
  const bits = ipv4 ? IPV4_BITS : IPV6_BITS;
  const prefix = Number(match[2]);
  if (prefix < 0 || prefix > bits) throw new Error(`Prefix must be between 0 and ${bits}: ${text}`);
  const address = ipv4 ? parseIpv4(addressText) : parseIpv6(addressText);
  const size = 1n << BigInt(bits - prefix);
  const start = (address / size) * size;
  const end = start + size - 1n;
  const addressFormatter = ipv4 ? ipv4Text : ipv6Text;
  return {
    input,
    family: ipv4 ? 'IPv4' : 'IPv6',
    bits,
    prefix,
    start,
    end,
    size,
    network: `${addressFormatter(start)}/${prefix}`,
    range: `${addressFormatter(start)} – ${addressFormatter(end)}`,
    addressFormatter
  };
}

export function parseNetworks(text, family) {
  const lines = text.split(/\r?\n/);
  if (lines.filter(line => line.trim()).length > 500) throw new Error('Enter no more than 500 existing networks at a time.');
  return lines.map((line, index) => {
    const value = line.trim();
    if (!value) return null;
    const [cidr, ...labelParts] = value.split(/\s*(?:,|\|)\s*/);
    const network = parseCidr(cidr);
    if (network.family !== family) throw new Error(`Line ${index + 1} is ${network.family}; expected ${family}.`);
    return { ...network, label: labelParts.join(' ').trim() || `Network ${index + 1}` };
  }).filter(Boolean);
}

export function findOverlaps(networks) {
  const overlaps = [];
  for (let left = 0; left < networks.length; left++) {
    for (let right = left + 1; right < networks.length; right++) {
      const a = networks[left];
      const b = networks[right];
      if (a.start <= b.end && b.start <= a.end) overlaps.push([a, b]);
    }
  }
  return overlaps;
}

export function findGaps(pool, networks) {
  const intersections = networks
    .filter(network => network.start <= pool.end && network.end >= pool.start)
    .map(network => ({
      start: network.start > pool.start ? network.start : pool.start,
      end: network.end < pool.end ? network.end : pool.end
    }))
    .sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
  const merged = [];
  for (const range of intersections) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end + 1n) {
      if (range.end > last.end) last.end = range.end;
    } else {
      merged.push({ ...range });
    }
  }
  const gaps = [];
  let cursor = pool.start;
  for (const range of merged) {
    if (cursor < range.start) gaps.push({ start: cursor, end: range.start - 1n });
    if (range.end >= cursor) cursor = range.end + 1n;
  }
  if (cursor <= pool.end) gaps.push({ start: cursor, end: pool.end });
  return gaps;
}

export function findNextFree(pool, networks, prefix) {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > pool.bits) {
    throw new Error(`Requested prefix must be between 0 and ${pool.bits}.`);
  }
  const size = 1n << BigInt(pool.bits - prefix);
  for (const gap of findGaps(pool, networks)) {
    const start = ((gap.start + size - 1n) / size) * size;
    const end = start + size - 1n;
    if (end <= gap.end) {
      return {
        start,
        end,
        size,
        prefix,
        family: pool.family,
        bits: pool.bits,
        network: `${pool.addressFormatter(start)}/${prefix}`,
        range: `${pool.addressFormatter(start)} – ${pool.addressFormatter(end)}`
      };
    }
  }
  return null;
}

function requiredPrefix(hosts, bits, family, cloud = 'standard') {
  if (!Number.isSafeInteger(hosts) || hosts < 1) throw new Error('Each VLSM host request must be a positive whole number.');
  const reserved = family !== 'IPv4' ? 0n :
    cloud === 'gcp' ? 4n :
      cloud === 'aws' || cloud === 'azure' ? 5n : 2n;
  const addressCount = BigInt(hosts) + reserved;
  let requiredBits = 0;
  let capacity = 1n;
  while (capacity < addressCount) {
    capacity <<= 1n;
    requiredBits++;
  }
  return bits - requiredBits;
}

export function allocateVlsm(pool, occupied, requests, cloud = 'standard') {
  const sorted = requests.map((request, index) => {
    const prefix = requiredPrefix(request.hosts, pool.bits, pool.family, cloud);
    return { ...request, index, prefix };
  }).sort((a, b) => b.hosts - a.hosts);
  const allocated = [];
  for (const request of sorted) {
    const network = findNextFree(pool, [...occupied, ...allocated], request.prefix);
    if (!network) throw new Error(`No free /${request.prefix} block remains for "${request.name}".`);
    allocated.push({ ...network, label: request.name, hosts: request.hosts, requestedPrefix: request.prefix });
  }
  return allocated.sort((a, b) => a.index - b.index);
}

export function availableAddresses(network, cloud = 'standard') {
  if (cloud === 'standard') {
    if (network.family !== 'IPv4') return network.size;
    if (network.prefix >= 31) return network.size;
    return network.size - 2n;
  }
  if (network.family !== 'IPv4') return null;
  const reserved = cloud === 'gcp' ? 4n : 5n;
  return network.size > reserved ? network.size - reserved : 0n;
}

export function formatCount(value) {
  return value.toLocaleString('en-US');
}

export function toCsv(rows) {
  const quote = value => {
    let text = String(value);
    if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [
    ['Name', 'Input CIDR', 'Normalized network', 'Address range', 'Addresses', 'Available addresses'],
    ...rows.map(network => [
      network.label,
      network.input || network.network,
      network.network,
      network.range,
      network.size,
      network.available == null ? 'Not defined for IPv6 cloud reservations' : network.available
    ])
  ].map(row => row.map(quote).join(',')).join('\r\n');
}
