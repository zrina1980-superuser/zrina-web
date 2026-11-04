// Pure payload builders: every function returns a string or throws PayloadError.
export class PayloadError extends Error {}

const fail = (message) => { throw new PayloadError(message); };
const noControl = (value, label) => {
  if (/[\u0000-\u001f\u007f]/.test(value)) fail(`${label} must not contain line breaks or control characters.`);
};

export function buildText(value) {
  if (!value || !value.trim()) fail("Enter some text or a URL.");
  return value;
}

// Only http(s) is accepted as a URL; scheme-less hosts get https://. No redirect service is involved.
export function buildUrl(value) {
  const raw = (value || "").trim();
  if (!raw) fail("Enter a URL.");
  noControl(raw, "URL");
  let candidate = raw;
  if (/^\/\//.test(raw)) candidate = `https:${raw}`;
  else if (!/^[a-z][a-z0-9+.-]*:/i.test(raw) || /^[^/?#\s:]+:\d+(?:[/?#]|$)/.test(raw)) candidate = `https://${raw}`;
  let url;
  try { url = new URL(candidate); } catch { fail("That is not a valid URL."); }
  if (!/^https?:$/.test(url.protocol)) fail("Only http:// and https:// URLs are allowed in URL mode. Use Text mode for anything else.");
  if (!url.hostname) fail("The URL has no host name.");
  if (url.username || url.password) fail("URLs with embedded credentials are not allowed.");
  return url.href;
}

const wifiEscape = (value) => value.replace(/([\\;,:"])/g, "\\$1");
// Scanners read a bare hex-only value as hex bytes, so a quoted form marks it as a string.
const wifiField = (value) => (/^[0-9a-f]+$/i.test(value) ? `"${value}"` : wifiEscape(value));

export function buildWifi({ ssid = "", password = "", security = "WPA", hidden = false }) {
  if (!ssid) fail("Enter the network name (SSID).");
  if (new TextEncoder().encode(ssid).length > 32) fail("SSID cannot be longer than 32 bytes.");
  noControl(ssid, "SSID");
  if (!["WPA", "WEP", "nopass"].includes(security)) fail("Choose WPA, WEP or no password.");
  let out = `WIFI:T:${security};S:${wifiField(ssid)};`;
  if (security !== "nopass") {
    if (!password) fail("Enter the network password or choose \"No password\".");
    noControl(password, "Password");
    if (security === "WPA" && !(password.length >= 8 && password.length <= 63) && !/^[0-9a-f]{64}$/i.test(password)) {
      fail("WPA passwords must be 8-63 characters (or 64 hex digits).");
    }
    if (security === "WEP" && !/^(?:.{5}|.{13}|.{16}|.{29}|[0-9a-f]{10}|[0-9a-f]{26}|[0-9a-f]{32}|[0-9a-f]{58})$/i.test(password)) {
      fail("WEP keys must be 5, 13, 16 or 29 characters, or 10, 26, 32 or 58 hex digits.");
    }
    out += `P:${wifiField(password)};`;
  }
  if (hidden) out += "H:true;";
  return `${out};`;
}

export function wifiWarning(security) {
  if (security === "nopass") return "Open networks are unencrypted. Anyone scanning this code can join, and traffic can be read.";
  if (security === "WEP") return "WEP is obsolete and easy to break. Use WPA if your router supports it. The key is also stored in plain text in the QR code.";
  return "The password is stored in plain text inside the QR code. Anyone who can scan or photograph it can read the password.";
}

const vEscape = (value) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");

function fold(line) {
  const encoder = new TextEncoder();
  const parts = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > 75) {
      parts.push(current);
      current = " ";
      bytes = 1;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n");
}

export function isEmail(value) {
  return value.length <= 254 && /^[^\s@<>()[\]\\,;:"]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(value);
}

export function buildVcard(f) {
  const v = Object.fromEntries(Object.entries(f).map(([k, x]) => [k, (x || "").trim()]));
  if (!v.firstName && !v.lastName && !v.org) fail("Enter a name or an organisation.");
  for (const key of ["firstName", "lastName", "org", "title", "phone", "email", "url", "street", "city", "region", "postal", "country"]) noControl(v[key] || "", key);
  if (v.email && !isEmail(v.email)) fail("The email address is not valid.");
  if (v.phone && !/^\+?[0-9 ()./-]{3,25}$/.test(v.phone)) fail("The phone number is not valid.");
  if (v.url) v.url = buildUrl(v.url);
  const full = [v.firstName, v.lastName].filter(Boolean).join(" ") || v.org;
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${vEscape(v.lastName || "")};${vEscape(v.firstName || "")};;;`, `FN:${vEscape(full)}`];
  if (v.org) lines.push(`ORG:${vEscape(v.org)}`);
  if (v.title) lines.push(`TITLE:${vEscape(v.title)}`);
  if (v.phone) lines.push(`TEL;TYPE=CELL:${vEscape(v.phone)}`);
  if (v.email) lines.push(`EMAIL:${vEscape(v.email)}`);
  if (v.url) lines.push(`URL:${v.url.replace(/[\\;,]/g, (c) => `\\${c}`)}`);
  if (v.street || v.city || v.region || v.postal || v.country) {
    lines.push(`ADR;TYPE=WORK:;;${vEscape(v.street || "")};${vEscape(v.city || "")};${vEscape(v.region || "")};${vEscape(v.postal || "")};${vEscape(v.country || "")}`);
  }
  if (v.note) lines.push(`NOTE:${vEscape(v.note)}`);
  lines.push("END:VCARD");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

export function buildEmail({ to = "", subject = "", body = "" }) {
  const address = to.trim();
  if (!address) fail("Enter the recipient email address.");
  if (!isEmail(address)) fail("The email address is not valid.");
  noControl(subject, "Subject");
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body.replace(/\r\n?/g, "\n")).replace(/%0A/g, "%0D%0A")}`);
  return `mailto:${address}${params.length ? `?${params.join("&")}` : ""}`;
}

export function buildSms({ number = "", message = "" }) {
  const cleaned = number.trim();
  if (!cleaned) fail("Enter the phone number.");
  if (!/^\+?[0-9 ()./-]{3,25}$/.test(cleaned) || (cleaned.match(/\d/g) || []).length < 3) fail("The phone number is not valid.");
  const digits = cleaned.replace(/[^\d+]/g, "");
  return `sms:${digits}${message ? `?body=${encodeURIComponent(message)}` : ""}`;
}

// Batch: one payload per non-empty line, treated as a URL if it starts with http(s):// or www., else as text.
export function parseBatch(raw, limit = 200) {
  const items = [];
  const errors = [];
  const lines = raw.split(/\r?\n/);
  if (lines.filter((line) => line.trim()).length > limit) fail(`Batch is limited to ${limit} lines.`);
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    try {
      const looksUrl = /^(?:https?:\/\/|www\.)/i.test(line.trim());
      items.push({ line: index + 1, label: line.trim(), payload: looksUrl ? buildUrl(line) : buildText(line.trim()) });
    } catch (error) {
      if (!(error instanceof PayloadError)) throw error;
      errors.push({ line: index + 1, message: error.message });
    }
  });
  return { items, errors };
}

export function safeFileName(label, index) {
  const slug = label.normalize("NFKD").replace(/^https?:\/\//i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 40).toLowerCase();
  return `${String(index).padStart(3, "0")}${slug ? `-${slug}` : ""}`;
}