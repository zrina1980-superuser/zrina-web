'use strict';
(() => {
const $ = id => document.getElementById(id);
const WORDS = window.ZRINA_WORDS;
const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/~'
};
const AMBIGUOUS = /[Il1O0o]/g;
let current = [];

function hasCrypto() { return !!(globalThis.crypto && crypto.getRandomValues); }

// Uniform integer in [0, n) via rejection sampling over 32-bit values.
function randInt(n) {
  if (!Number.isInteger(n) || n < 1 || n > 0x100000000) throw new RangeError('Invalid range');
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % n;
  }
}

function clampInt(el, min, max, fallback) {
  let v = parseInt(el.value, 10);
  if (!Number.isFinite(v)) v = fallback;
  return Math.min(max, Math.max(min, v));
}

function buildPools() {
  const pools = [];
  for (const k of Object.keys(SETS)) {
    if (!$(k).checked) continue;
    let chars = SETS[k];
    if ($('ambiguous').checked) chars = chars.replace(AMBIGUOUS, '');
    pools.push(chars);
  }
  return pools;
}

function pickChars(all, len) {
  let s = '';
  for (let i = 0; i < len; i++) s += all[randInt(all.length)];
  return s;
}

function generatePassword(pools, len) {
  const all = pools.join('');
  for (;;) {
    const pw = pickChars(all, len);
    if (pools.every(p => [...p].some(c => pw.includes(c)))) return pw;
  }
}

function generatePassphrase(n, sep, cap) {
  const out = [];
  for (let i = 0; i < n; i++) {
    let w = WORDS[randInt(WORDS.length)];
    if (cap) w = w[0].toUpperCase() + w.slice(1);
    out.push(w);
  }
  return out.join(sep);
}

// log2 of a positive BigInt without converting huge values to Number.
function log2Big(x) {
  const bits = x.toString(2).length;
  if (bits <= 52) return Math.log2(Number(x));
  return bits - 53 + Math.log2(Number(x >> BigInt(bits - 53)));
}

// Exact count of length-L strings over the union that include >=1 char from every pool (inclusion-exclusion).
function passwordEntropy(pools, len) {
  const sizes = pools.map(p => BigInt(p.length));
  const total = sizes.reduce((a, b) => a + b, 0n);
  const m = sizes.length;
  let count = 0n;
  for (let mask = 0; mask < (1 << m); mask++) {
    let removed = 0n, bits = 0;
    for (let i = 0; i < m; i++) if (mask & (1 << i)) { removed += sizes[i]; bits++; }
    const term = (total - removed) ** BigInt(len);
    count += bits % 2 ? -term : term;
  }
  return count > 0n ? log2Big(count) : 0;
}

function fmtDuration(log2Guesses, rate) {
  // Average case: half the search space.
  const log10Sec = (log2Guesses - 1) * Math.log10(2) - Math.log10(rate);
  if (log10Sec < -3) return 'under a millisecond';
  const units = [['seconds', 1], ['minutes', 60], ['hours', 3600], ['days', 86400], ['years', 31557600]];
  if (log10Sec > 12) return `~10^${Math.round(log10Sec - Math.log10(31557600))} years`;
  const sec = Math.pow(10, log10Sec);
  let best = units[0];
  for (const u of units) if (sec >= u[1]) best = u;
  const v = sec / best[1];
  return `~${v >= 100 ? Math.round(v).toLocaleString('en') : v.toPrecision(2)} ${best[0]}`;
}

function setStatus(msg, isError) {
  const s = $('status');
  s.textContent = msg || '';
  s.classList.toggle('error', !!isError);
}

function render() {
  const box = $('results');
  box.replaceChildren();
  current.forEach((val, i) => {
    const row = document.createElement('div');
    row.className = 'out';
    const code = document.createElement('code');
    code.textContent = val;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn secondary';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', `Copy result ${i + 1}`);
    btn.addEventListener('click', () => copy(val, `Result ${i + 1} copied.`));
    row.append(code, btn);
    box.append(row);
  });
}

async function copy(text, okMsg) {
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard is unavailable in this context.');
    await navigator.clipboard.writeText(text);
    setStatus(okMsg);
  } catch (e) {
    setStatus('Copy failed: ' + (e.message || 'permission denied') + ' Select the text and copy it manually.', true);
  }
}

function setMeter(bits) {
  if (bits == null) { $('entropy').textContent = '–'; $('t1').textContent = '–'; $('t2').textContent = '–'; return; }
  $('entropy').textContent = `~${bits.toFixed(1)} bits`;
  $('t1').textContent = fmtDuration(bits, 1e10);
  $('t2').textContent = fmtDuration(bits, 1e12);
}

function generate() {
  setStatus('');
  current = [];
  try {
    if (!hasCrypto()) throw new Error('Secure random generation (crypto.getRandomValues) is unavailable in this browser.');
    const count = clampInt($('count'), 1, 20, 1);
    if ($('mode').value === 'password') {
      const len = clampInt($('length'), 8, 128, 20);
      const pools = buildPools();
      if (!pools.length) throw new Error('Select at least one character set.');
      for (let i = 0; i < count; i++) current.push(generatePassword(pools, len));
      setMeter(passwordEntropy(pools, len));
    } else {
      const n = clampInt($('words'), 4, 8, 5);
      if (!Array.isArray(WORDS) || WORDS.length !== 7776) throw new Error('Bundled word list failed to load.');
      for (let i = 0; i < count; i++) current.push(generatePassphrase(n, $('sep').value, $('cap').checked));
      setMeter(n * Math.log2(WORDS.length));
    }
  } catch (e) {
    setMeter(null);
    setStatus(e.message, true);
  }
  render();
}

function toggleMode() {
  const pw = $('mode').value === 'password';
  $('pwOpts').hidden = !pw;
  $('ppOpts').hidden = pw;
}

$('lengthRange').addEventListener('input', () => { $('length').value = $('lengthRange').value; generate(); });
$('length').addEventListener('input', () => {
  const v = parseInt($('length').value, 10);
  if (Number.isFinite(v)) $('lengthRange').value = Math.min(128, Math.max(8, v));
  generate();
});
$('length').addEventListener('change', () => { $('length').value = clampInt($('length'), 8, 128, 20); $('lengthRange').value = $('length').value; });
$('count').addEventListener('change', () => { $('count').value = clampInt($('count'), 1, 20, 1); });
$('words').addEventListener('change', () => { $('words').value = clampInt($('words'), 4, 8, 5); });
['count', 'words', 'sep', 'cap', 'lower', 'upper', 'digits', 'symbols', 'ambiguous'].forEach(id => $(id).addEventListener('input', generate));
$('mode').addEventListener('change', () => { toggleMode(); generate(); });
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  const phrase = button.dataset.preset === 'phrase';
  $('mode').value = phrase ? 'passphrase' : 'password';
  if (phrase) { $('words').value = '6'; $('sep').value = '-'; $('cap').checked = false; }
  else {
    $('length').value = $('lengthRange').value = '20';
    ['lower', 'upper', 'digits', 'symbols'].forEach(id => { $(id).checked = true; });
    $('ambiguous').checked = false;
  }
  toggleMode();
  generate();
}));
$('generate').addEventListener('click', generate);
$('copyAll').addEventListener('click', () => {
  if (!current.length) { setStatus('Nothing to copy.', true); return; }
  copy(current.join('\n'), `Copied ${current.length} result${current.length > 1 ? 's' : ''}.`);
});
window.addEventListener('pagehide', () => { current = []; $('results').replaceChildren(); });

toggleMode();
generate();
})();