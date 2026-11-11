'use strict';
(() => {
const $ = id => document.getElementById(id);
const MAX_FILE_ENCODE = 20 * 1024 * 1024;
const MAX_B64_DECODE = 28 * 1024 * 1024;
const MAX_TEXT_CHARS = 5000000;
const MAX_DISPLAY = 200000;
const STD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'];
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp' };

let fileBytes = null, fileName = '';
let outBytes = null;      // decoded bytes
let outString = '';       // full output text for copy / download
let outKind = '';         // 'encode' | 'decode'
let outExt = 'bin';
let previewUrl = null;
let timer = 0;
let token = 0;

class UserError extends Error {}

function fmtBytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KiB';
  return (n / 1048576).toFixed(2) + ' MiB';
}

function encodeBytes(bytes, alphabet, pad, pretty) {
  const tbl = new Uint8Array(64);
  for (let i = 0; i < 64; i++) tbl[i] = alphabet.charCodeAt(i);
  const n = bytes.length;
  const full = Math.floor(n / 3) * 3;
  const rem = n - full;
  const outLen = (full / 3) * 4 + (rem ? (pad ? 4 : rem + 1) : 0);
  const out = new Uint8Array(outLen);
  let o = 0;
  for (let i = 0; i < full; i += 3) {
    const v = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out[o++] = tbl[v >> 18]; out[o++] = tbl[(v >> 12) & 63]; out[o++] = tbl[(v >> 6) & 63]; out[o++] = tbl[v & 63];
  }
  if (rem === 1) {
    const v = bytes[full] << 16;
    out[o++] = tbl[v >> 18]; out[o++] = tbl[(v >> 12) & 63];
    if (pad) { out[o++] = 61; out[o++] = 61; }
  } else if (rem === 2) {
    const v = (bytes[full] << 16) | (bytes[full + 1] << 8);
    out[o++] = tbl[v >> 18]; out[o++] = tbl[(v >> 12) & 63]; out[o++] = tbl[(v >> 6) & 63];
    if (pad) out[o++] = 61;
  }
  let s = new TextDecoder('ascii').decode(out);
  if (pretty) {
    const lines = [];
    for (let i = 0; i < s.length; i += 76) lines.push(s.slice(i, i + 76));
    s = lines.join('\n');
  }
  return s;
}

// Strict decoder. Returns { bytes, mime } or throws UserError with a position-aware message.
function decodeString(input, urlSafe) {
  let s = input;
  let mime = '';
  const m = /^\s*data:([^,;]*)((?:;[^,;]*)*?);base64,/i.exec(s);
  if (m) { mime = m[1].toLowerCase(); s = s.slice(m[0].length); }
  s = s.replace(/\s+/g, '');
  if (!s) throw new UserError('Nothing to decode.');
  const alpha = urlSafe ? URL : STD;
  const rev = new Int16Array(128).fill(-1);
  for (let i = 0; i < 64; i++) rev[alpha.charCodeAt(i)] = i;
  let end = s.length;
  let padCount = 0;
  while (end > 0 && s.charCodeAt(end - 1) === 61) { end--; padCount++; }
  if (padCount > 2) throw new UserError('Too many "=" padding characters (maximum 2).');
  for (let i = 0; i < end; i++) {
    const c = s.charCodeAt(i);
    if (c === 61) throw new UserError(`Padding "=" appears in the middle of the data (position ${i + 1}).`);
    if (c >= 128 || rev[c] < 0) {
      const ch = s[i];
      const other = urlSafe ? (ch === '+' || ch === '/') : (ch === '-' || ch === '_');
      throw new UserError(other
        ? `Character "${ch}" belongs to the ${urlSafe ? 'standard' : 'URL-safe'} alphabet; switch the Alphabet option.`
        : `Invalid character ${JSON.stringify(ch)} at position ${i + 1}.`);
    }
  }
  const len = end;
  if (len % 4 === 1) throw new UserError('Invalid length: a Base64 string cannot have 1 leftover character.');
  if (padCount && (len + padCount) % 4 !== 0) throw new UserError('Padding does not match the data length.');
  const outLen = Math.floor(len / 4) * 3 + (len % 4 === 2 ? 1 : len % 4 === 3 ? 2 : 0);
  if (outLen > MAX_FILE_ENCODE * 1.5) throw new UserError('Decoded data would be too large for this browser tool.');
  const out = new Uint8Array(outLen);
  let o = 0, i = 0;
  for (; i + 4 <= len; i += 4) {
    const v = (rev[s.charCodeAt(i)] << 18) | (rev[s.charCodeAt(i + 1)] << 12) | (rev[s.charCodeAt(i + 2)] << 6) | rev[s.charCodeAt(i + 3)];
    out[o++] = v >> 16; out[o++] = (v >> 8) & 255; out[o++] = v & 255;
  }
  const left = len - i;
  if (left === 2) {
    const v = (rev[s.charCodeAt(i)] << 18) | (rev[s.charCodeAt(i + 1)] << 12);
    if (v & 0xffff) throw new UserError('Non-canonical trailing bits in the last character.');
    out[o++] = v >> 16;
  } else if (left === 3) {
    const v = (rev[s.charCodeAt(i)] << 18) | (rev[s.charCodeAt(i + 1)] << 12) | (rev[s.charCodeAt(i + 2)] << 6);
    if (v & 0xff) throw new UserError('Non-canonical trailing bits in the last character.');
    out[o++] = v >> 16; out[o++] = (v >> 8) & 255;
  }
  return { bytes: out, mime };
}

function sniffImage(b) {
  const eq = (off, arr) => arr.every((v, i) => b[off + i] === v);
  if (b.length >= 8 && eq(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (b.length >= 3 && eq(0, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (b.length >= 6 && (eq(0, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || eq(0, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))) return 'image/gif';
  if (b.length >= 12 && eq(0, [0x52, 0x49, 0x46, 0x46]) && eq(8, [0x57, 0x45, 0x42, 0x50])) return 'image/webp';
  if (b.length >= 26 && eq(0, [0x42, 0x4d])) return 'image/bmp';
  return '';
}

function tryUtf8(b) {
  try {
    const t = new TextDecoder('utf-8', { fatal: true }).decode(b);
    return /[\u0000-\u0008\u000e-\u001f]/.test(t.slice(0, 4096)) ? null : t;
  } catch { return null; }
}

function clearPreview() {
  if (previewUrl) URL_.revokeObjectURL(previewUrl);
  previewUrl = null;
  $('img').removeAttribute('src');
  $('preview').hidden = true;
}
const URL_ = window.URL;

function setStatus(msg, cls) {
  const s = $('status');
  s.textContent = msg || '';
  s.className = 'status' + (cls ? ' ' + cls : '');
}
function setValidity(msg, cls) {
  const s = $('validity');
  s.textContent = msg || '';
  s.className = 'status' + (cls ? ' ' + cls : '');
}

function resetOutput() {
  clearPreview();
  outBytes = null; outString = ''; outKind = ''; outExt = 'bin';
  $('output').value = '';
  $('truncNote').hidden = true;
  ['sOrig', 'sEnc', 'sRatio', 'sType'].forEach(id => { $(id).textContent = '–'; });
  $('sizeExplanation').textContent = '';
  $('copy').disabled = true;
  $('download').disabled = true;
}

function showOutputText(full) {
  outString = full;
  const trunc = full.length > MAX_DISPLAY;
  $('output').value = trunc ? full.slice(0, MAX_DISPLAY) : full;
  $('truncNote').hidden = !trunc;
  if (trunc) $('truncNote').textContent = `Showing the first ${MAX_DISPLAY.toLocaleString('en')} of ${full.length.toLocaleString('en')} characters. Copy and Download use the full output.`;
}

function setStats(orig, enc, type) {
  $('sOrig').textContent = fmtBytes(orig);
  $('sEnc').textContent = fmtBytes(enc);
  $('sRatio').textContent = orig ? (enc / orig).toFixed(2) + '×' : '–';
  $('sType').textContent = type;
  $('sizeExplanation').textContent = outKind === 'encode'
    ? `${orig.toLocaleString('en')} input bytes → ${enc.toLocaleString('en')} output characters (including any padding and line breaks). Base64 turns groups of 3 bytes into 4 characters; it does not encrypt the input.`
    : `${enc.toLocaleString('en')} encoded characters → ${orig.toLocaleString('en')} decoded bytes. The count excludes whitespace but may include a data URL prefix; Base64 does not encrypt the content.`;
}

function currentSource() {
  const isFile = $('source').value === 'file';
  return { isFile, action: $('action').value, urlSafe: $('variant').value === 'url', pad: $('pad').checked, pretty: $('pretty').checked };
}

function run() {
  const my = ++token;
  resetOutput();
  setStatus('');
  const o = currentSource();
  try {
    if (o.action === 'encode') {
      let bytes;
      if (o.isFile) {
        if (!fileBytes) { setValidity('Choose a file to encode.'); return; }
        bytes = fileBytes;
      } else {
        const t = $('text').value;
        if (t.length > MAX_TEXT_CHARS) throw new UserError(`Text is too long (limit ${MAX_TEXT_CHARS.toLocaleString('en')} characters). Use file mode instead.`);
        if (!t) { setValidity('Enter some text to encode.'); return; }
        bytes = new TextEncoder().encode(t);
      }
      const enc = encodeBytes(bytes, o.urlSafe ? URL : STD, o.pad, o.pretty);
      if (my !== token) return;
      outKind = 'encode';
      showOutputText(enc);
      setStats(bytes.length, enc.length, o.isFile ? (sniffImage(bytes) || 'binary / unknown') : 'UTF-8 text');
      setValidity('Encoded successfully.', 'ok');
      $('copy').disabled = false; $('download').disabled = false;
    } else {
      let src;
      if (o.isFile) {
        if (fileBytes === null) { setValidity('Choose a file containing Base64 text.'); return; }
        src = fileBytes;
      } else {
        src = $('text').value;
        if (src.length > MAX_TEXT_CHARS) throw new UserError(`Input is too long for the text box (limit ${MAX_TEXT_CHARS.toLocaleString('en')} characters). Use file mode instead.`);
        if (!src.trim()) { setValidity('Paste Base64 to decode.'); return; }
      }
      const str = typeof src === 'string' ? src : new TextDecoder('utf-8').decode(src);
      const { bytes, mime } = decodeString(str, o.urlSafe);
      outBytes = bytes;
      outKind = 'decode';
      const sniffed = sniffImage(bytes);
      const text = tryUtf8(bytes);
      let type = sniffed || (text !== null ? 'UTF-8 text' : 'binary / unknown');
      if (mime && sniffed && mime !== sniffed) {
        setStatus(`Warning: the data URI declares ${mime} but the content looks like ${sniffed}.`, 'error');
      } else if (mime && !sniffed && IMAGE_TYPES.includes(mime)) {
        setStatus(`Warning: the data URI declares ${mime} but the content is not a recognised image, so no preview is shown.`, 'error');
      }
      outExt = sniffed ? EXT[sniffed] : (text !== null ? 'txt' : 'bin');
      if (text !== null) showOutputText(text);
      else $('output').value = `[Binary data, ${bytes.length.toLocaleString('en')} bytes. Use Download to save it.]`;
      setStats(bytes.length, str.replace(/\s+/g, '').length, type);
      $('sOrig').textContent = fmtBytes(bytes.length) + ' (decoded)';
      setValidity(`Valid Base64 (${o.urlSafe ? 'URL-safe' : 'standard'}).`, 'ok');
      $('download').disabled = false;
      $('copy').disabled = text === null;
      if (sniffed) {
        previewUrl = URL_.createObjectURL(new Blob([bytes], { type: sniffed }));
        $('img').onerror = () => { clearPreview(); setStatus('The data has an image signature but the browser could not render it.', 'error'); };
        $('img').src = previewUrl;
        $('preview').hidden = false;
      }
    }
  } catch (e) {
    if (e instanceof UserError) setValidity(e.message, 'error');
    else setValidity('Unexpected error: ' + (e && e.message || e), 'error');
    outBytes = null;
  }
}

function schedule() { clearTimeout(timer); timer = setTimeout(run, 150); }

function updateUi() {
  const o = currentSource();
  $('textBox').hidden = o.isFile;
  $('fileBox').hidden = !o.isFile;
  $('prettyWrap').hidden = o.action === 'decode';
  $('pad').disabled = o.action === 'decode';
  $('limitNote').textContent = o.action === 'encode'
    ? `Maximum ${fmtBytes(MAX_FILE_ENCODE)} to encode.` : `Text file with Base64, maximum ${fmtBytes(MAX_B64_DECODE)}.`;
}

async function loadFile(f) {
  const o = currentSource();
  const limit = o.action === 'encode' ? MAX_FILE_ENCODE : MAX_B64_DECODE;
  if (f.size > limit) {
    fileBytes = null; fileName = '';
    resetOutput();
    setValidity(`"${f.name}" is ${fmtBytes(f.size)}, above the ${fmtBytes(limit)} limit.`, 'error');
    return;
  }
  try {
    setValidity('Reading file…');
    const buf = await f.arrayBuffer();
    fileBytes = new Uint8Array(buf);
    fileName = f.name;
    $('drop').firstChild.textContent = `${f.name} (${fmtBytes(f.size)}) — click or drop to replace`;
    run();
  } catch (e) {
    fileBytes = null;
    resetOutput();
    setValidity('Could not read the file: ' + (e && e.message || 'read error'), 'error');
  }
}

function saveBlob(blob, name) {
  const u = URL_.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u; a.download = name; a.rel = 'noopener';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL_.revokeObjectURL(u), 10000);
}

$('download').addEventListener('click', () => {
  if (outKind === 'encode') saveBlob(new Blob([outString], { type: 'text/plain;charset=utf-8' }), 'encoded-base64.txt');
  else if (outBytes) saveBlob(new Blob([outBytes], { type: 'application/octet-stream' }), `decoded.${outExt}`);
});
$('copy').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard is unavailable in this context.');
    await navigator.clipboard.writeText(outString);
    setStatus('Copied.', 'ok');
  } catch (e) { setStatus('Copy failed: ' + (e.message || 'permission denied'), 'error'); }
});
$('clear').addEventListener('click', () => {
  $('text').value = ''; fileBytes = null; fileName = ''; $('file').value = '';
  $('drop').firstChild.textContent = 'Drop a file here or click to choose';
  resetOutput(); setStatus(''); setValidity('');
});

const drop = $('drop');
drop.addEventListener('click', () => $('file').click());
drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => {
  const files = e.dataTransfer && e.dataTransfer.files;
  if (files && files.length > 1) setStatus('Only the first dropped file is used.', 'error');
  if (files && files[0]) loadFile(files[0]);
});
$('file').addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
// Stop stray drops from navigating away from the page.
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => e.preventDefault());

$('text').addEventListener('input', schedule);
['variant', 'pad', 'pretty'].forEach(id => $(id).addEventListener('input', run));
['source', 'action'].forEach(id => $(id).addEventListener('change', () => {
  if (id === 'action') { fileBytes = null; $('file').value = ''; $('drop').firstChild.textContent = 'Drop a file here or click to choose'; }
  updateUi(); run();
}));
window.addEventListener('pagehide', clearPreview);

window.__b64 = { encodeBytes, decodeString, sniffImage, STD, URL };
updateUi();
run();
})();