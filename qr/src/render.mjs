import qrcodeCore from "qrcode/lib/core/qrcode.js";

export const LEVELS = ["L", "M", "Q", "H"];

export function makeMatrix(text, level) {
  if (!LEVELS.includes(level)) throw new Error("Invalid error correction level.");
  let qr;
  try {
    qr = qrcodeCore.create(text, { errorCorrectionLevel: level });
  } catch (error) {
    throw new Error(/too big|large|capacity|amount of data/i.test(error.message)
      ? "That content is too long for a QR code at this error-correction level. Shorten it or choose a lower level."
      : `Could not create QR code: ${error.message}`);
  }
  return { size: qr.modules.size, get: (x, y) => qr.modules.data[y * qr.modules.size + x] === 1, version: qr.version };
}

export function layout(n, size, margin, print) {
  const total = n + margin * 2;
  if (print) {
    const scale = Math.floor(size / total);
    if (scale < 1) throw new Error("This content is too dense to print at that size with whole-pixel modules. Increase the size or shorten the content.");
    // Whole-pixel modules; leftover pixels widen the quiet zone so the image is exactly size x size.
    return { scale, px: size, total, offset: Math.floor((size - scale * total) / 2) };
  }
  return { scale: size / total, px: size, total, offset: 0 };
}

export function logoBox(n, scale, margin, offset = 0) {
  const side = Math.max(1, Math.round(n * 0.2));
  const pad = 1;
  const symbolStart = offset + margin * scale;
  const center = symbolStart + (n * scale) / 2;
  const plate = (side + pad * 2) * scale;
  return { center, side: side * scale, plate };
}

export function inLogoPlate(n, x, y, hasLogo) {
  if (!hasLogo) return false;
  const side = Math.max(1, Math.round(n * 0.2)) + 2;
  const start = (n - side) / 2;
  return x + 0.5 > start && x + 0.5 < start + side && y + 0.5 > start && y + 0.5 < start + side;
}

const HEX = /^#[0-9a-f]{6}$/i;
export function checkColor(value) {
  if (!HEX.test(value)) throw new Error("Colors must be in #RRGGBB format.");
  return value.toLowerCase();
}

export function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const xmlEscape = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Plain-text caption band below the QR symbol; long lines are hard-wrapped to the image width.
export function captionBand(captions, px) {
  const fs = Math.max(11, Math.min(48, Math.round(px / 20)));
  const lh = Math.round(fs * 1.45);
  const maxChars = Math.max(8, Math.floor((px * 0.92) / (fs * 0.6)));
  const lines = [];
  for (const text of captions) {
    const chars = Array.from(text);
    for (let i = 0; i < chars.length; i += maxChars) lines.push(chars.slice(i, i + maxChars).join(""));
  }
  const pad = Math.round(fs * 0.6);
  return { fs, lh, lines, pad, height: pad * 2 + lines.length * lh };
}

export function drawToCanvas(canvas, matrix, opts) {
  const { fg, bg, transparent, margin, size, print, logo, caption } = opts;
  const { scale, px, offset } = layout(matrix.size, size, margin, print);
  const band = caption && caption.length ? captionBand(caption, px) : null;
  const height = px + (band ? band.height : 0);
  canvas.width = px;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, px, height);
  if (!transparent) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, px, height);
  }
  ctx.fillStyle = fg;
  const edge = (i) => Math.round(offset + (margin + i) * scale);
  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (!matrix.get(x, y) || inLogoPlate(matrix.size, x, y, !!logo)) continue;
      ctx.fillRect(edge(x), edge(y), edge(x + 1) - edge(x), edge(y + 1) - edge(y));
    }
  }
  if (logo) {
    const box = logoBox(matrix.size, scale, margin, offset);
    ctx.fillStyle = transparent ? "#ffffff" : bg;
    ctx.fillRect(box.center - box.plate / 2, box.center - box.plate / 2, box.plate, box.plate);
    const ratio = Math.min(box.side / logo.width, box.side / logo.height);
    const w = logo.width * ratio;
    const h = logo.height * ratio;
    ctx.drawImage(logo.source, box.center - w / 2, box.center - h / 2, w, h);
  }
  if (band) {
    ctx.fillStyle = fg;
    ctx.font = `${band.fs}px ui-monospace, Consolas, "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    band.lines.forEach((line, i) => ctx.fillText(line, px / 2, px + band.pad + band.lh * (i + 0.5)));
  }
  return px;
}

export function toSvg(matrix, opts) {
  const { fg, bg, transparent, margin, print, size, logo, caption } = opts;
  checkColor(fg);
  checkColor(bg);
  const n = matrix.size;
  const lay = layout(n, size, margin, print);
  // Print mode uses pixel units so modules stay whole pixels; otherwise one unit per module.
  const unit = print ? lay.scale : 1;
  const off = print ? lay.offset : 0;
  const view = print ? lay.px : lay.total;
  const at = (i) => off + (i + margin) * unit;
  let d = "";
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      if (!matrix.get(x, y) || inLogoPlate(n, x, y, !!logo)) { x++; continue; }
      const start = x;
      while (x < n && matrix.get(x, y) && !inLogoPlate(n, x, y, !!logo)) x++;
      d += `M${at(start)} ${at(y)}h${(x - start) * unit}v${unit}h${(start - x) * unit}z`;
    }
  }
  const band = caption && caption.length ? captionBand(caption, lay.px) : null;
  const k = lay.px / view;
  let svg;
  if (band) {
    const h = lay.px + band.height;
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${lay.px}" height="${h}" viewBox="0 0 ${lay.px} ${h}" role="img" aria-label="QR code with caption">`;
    if (!transparent) svg += `<rect width="${lay.px}" height="${h}" fill="${bg}"/>`;
    svg += `<g${k === 1 ? "" : ` transform="scale(${k})"`}>`;
  } else {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${lay.px}" height="${lay.px}" viewBox="0 0 ${view} ${view}" role="img" aria-label="QR code">`;
  }
  if (!transparent && !band) svg += `<rect width="${view}" height="${view}" fill="${bg}"/>`;
  svg += `<path d="${d}" fill="${fg}" shape-rendering="crispEdges"/>`;
  if (logo && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(logo.dataUrl)) {
    const side = Math.max(1, Math.round(n * 0.2));
    const plate = (side + 2) * unit;
    const c = off + (n / 2 + margin) * unit;
    const ratio = Math.min(side * unit / logo.width, side * unit / logo.height);
    const w = logo.width * ratio;
    const h = logo.height * ratio;
    svg += `<rect x="${c - plate / 2}" y="${c - plate / 2}" width="${plate}" height="${plate}" fill="${transparent ? "#ffffff" : bg}"/>`;
    svg += `<image x="${c - w / 2}" y="${c - h / 2}" width="${w}" height="${h}" href="${logo.dataUrl}"/>`;
  }
  if (band) {
    svg += "</g>";
    svg += `<g fill="${fg}" font-family="ui-monospace,Consolas,'Courier New',monospace" font-size="${band.fs}" text-anchor="middle" dominant-baseline="central">`;
    band.lines.forEach((line, i) => { svg += `<text x="${lay.px / 2}" y="${lay.px + band.pad + band.lh * (i + 0.5)}">${xmlEscape(line)}</text>`; });
    svg += "</g>";
  }
  return `${svg}</svg>`;
}
let crcTable;
function crc32(bytes) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const b of bytes) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// Inserts a pHYs chunk (11811 px/m = 300 DPI) right after IHDR.
export function setPngDpi300(png) {
  const sig = 8;
  const ihdrEnd = sig + 8 + 13 + 4;
  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4);
  view.setUint32(8, 11811);
  view.setUint32(12, 11811);
  chunk[16] = 1;
  view.setUint32(17, crc32(chunk.subarray(4, 17)));
  const out = new Uint8Array(png.length + chunk.length);
  out.set(png.subarray(0, ihdrEnd), 0);
  out.set(chunk, ihdrEnd);
  out.set(png.subarray(ihdrEnd), ihdrEnd + chunk.length);
  return out;
}