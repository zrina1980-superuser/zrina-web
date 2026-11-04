// One-off/idempotent image optimiser: shrinks oversized PNG/JPEG assets in place (same file names).
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const skip = /node_modules|[\\/]\.wrangler|[\\/]dist[\\/]|[\\/]\.git[\\/]/;
const MIN_BYTES = 60 * 1024;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (skip.test(full)) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(png|jpe?g)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function maxWidthFor(file, width) {
  const name = path.basename(file).toLowerCase();
  if (/-logo\.png$|^zrina-icon|icon/.test(name)) return Math.min(width, 512);
  if (/preview|dashboard|screenshot/.test(name)) return Math.min(width, 1200);
  return width;
}

(async () => {
  let before = 0;
  let after = 0;
  for (const file of walk(root)) {
    const size = fs.statSync(file).size;
    if (size < MIN_BYTES) continue;
    const isPng = /\.png$/i.test(file);
    const input = fs.readFileSync(file);
    const meta = await sharp(input).metadata();
    const width = maxWidthFor(file, meta.width);
    let pipeline = sharp(input).resize({ width, withoutEnlargement: true });
    pipeline = isPng
      ? pipeline.png({ palette: true, quality: 82, effort: 10, compressionLevel: 9 })
      : pipeline.jpeg({ quality: 78, mozjpeg: true });
    const buffer = await pipeline.toBuffer();
    if (buffer.length < size * 0.92) {
      try {
        fs.writeFileSync(file, buffer);
      } catch (error) {
        console.warn(`Skipped (locked?): ${path.relative(root, file)} — ${error.code}`);
        continue;
      }
      before += size;
      after += buffer.length;
      console.log(`${Math.round(size / 1024)}KB -> ${Math.round(buffer.length / 1024)}KB  ${path.relative(root, file)}`);
    }
  }
  console.log(`Saved ${Math.round((before - after) / 1024)} KB (${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB).`);
})();
