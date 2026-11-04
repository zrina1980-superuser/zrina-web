import { PayloadError, buildText, buildUrl, buildWifi, wifiWarning, buildVcard, buildEmail, buildSms, parseBatch, safeFileName } from "./payload.mjs";
import { makeMatrix, drawToCanvas, captionBand, toSvg, checkColor, contrast, layout, setPngDpi300 } from "./render.mjs";
import { zipSync, strToU8 } from "fflate";

const $ = (id) => document.getElementById(id);
const modes = ["text", "url", "wifi", "vcard", "email", "sms", "batch"];
const canvas = $("preview");
let logo = null;
let lastState = null;

const val = (id) => $(id).value;
const setStatus = (message, type = "") => { const s = $("status"); s.textContent = message; s.className = `status ${type}`; };

function currentMode() { return val("mode"); }

function payloadFor(mode) {
  switch (mode) {
    case "text": return buildText(val("text"));
    case "url": return buildUrl(val("url"));
    case "wifi": return buildWifi({ ssid: val("wifiSsid"), password: val("wifiPass"), security: val("wifiSec"), hidden: $("wifiHidden").checked });
    case "vcard": return buildVcard({ firstName: val("vcFirst"), lastName: val("vcLast"), org: val("vcOrg"), title: val("vcTitle"), phone: val("vcPhone"), email: val("vcEmail"), url: val("vcUrl"), street: val("vcStreet"), city: val("vcCity"), region: val("vcRegion"), postal: val("vcPostal"), country: val("vcCountry"), note: val("vcNote") });
    case "email": return buildEmail({ to: val("mailTo"), subject: val("mailSubject"), body: val("mailBody") });
    case "sms": return buildSms({ number: val("smsNumber"), message: val("smsMessage") });
    default: throw new PayloadError("Unknown mode.");
  }
}

function options(overrides = {}) {
  const print = $("print").checked;
  const transparent = $("transparent").checked && !print;
  let margin = Math.max(0, Math.min(16, Math.round(Number(val("margin")))));
  if (!Number.isFinite(margin)) margin = 4;
  if (print) margin = Math.max(4, margin);
  const size = Math.max(128, Math.min(1024, Math.round(Number(val("size")) || 0)));
  if (!size) throw new PayloadError("Size must be between 128 and 1024.");
  let level = val("level");
  if (logo && level !== "H") level = "H";
  return { fg: checkColor(val("fg")), bg: checkColor(val("bg")), transparent, margin, size, print, level, logo, ...overrides };
}

function updateModeUi() {
  const mode = currentMode();
  for (const m of modes) $(`panel-${m}`).hidden = m !== mode;
  $("single-actions").hidden = mode === "batch";
  $("batch-actions").hidden = mode !== "batch";
  $("previewCard").hidden = mode === "batch";
  if (mode === "batch") { setStatus(""); return; }
  render();
}

function updateWifiUi() {
  const sec = val("wifiSec");
  $("wifiPassRow").hidden = sec === "nopass";
  $("wifiWarn").textContent = wifiWarning(sec);
  $("wifiPass").type = $("showPass").checked ? "text" : "password";
  $("wifiCaptionWarn").hidden = !$("wifiCaption").checked;
  $("wifiCaptionWarn").textContent = sec === "nopass"
    ? "The caption prints the network name in plain text on the image."
    : "The caption prints the network name and password in plain text on the PNG/SVG. Anyone who sees the image or print can read it.";
}

function render() {
  const mode = currentMode();
  if (mode === "batch") return;
  $("download-png").disabled = $("download-svg").disabled = $("copy-image").disabled = true;
  try {
    const opts = options();
    const payload = payloadFor(mode);
    if (mode === "wifi" && $("wifiCaption").checked && val("wifiSec") !== "nopass") {
      opts.caption = [`Network: ${val("wifiSsid")}`, `Password: ${val("wifiPass")}`];
    } else if (mode === "wifi" && $("wifiCaption").checked) {
      opts.caption = [`Network: ${val("wifiSsid")}`];
    }
    const matrix = makeMatrix(payload, opts.level);
    const px = drawToCanvas(canvas, matrix, opts);
    lastState = { payload, matrix, opts, px };
    canvas.setAttribute("aria-label", `QR code preview, ${matrix.size} by ${matrix.size} modules`);
    $("download-png").disabled = $("download-svg").disabled = false;
    $("copy-image").disabled = !(navigator.clipboard && window.ClipboardItem);
    const notes = [`${px}×${px + (opts.caption ? captionBand(opts.caption, px).height : 0)}px`, `version ${matrix.version}`, `level ${opts.level}${logo && val("level") !== "H" ? " (raised to H for the logo)" : ""}`];
    let smallCaption = false;
    if (opts.print) {
      notes.push(`prints ≈${(px / 300 * 2.54).toFixed(2)} cm wide at 300 DPI`);
      if (opts.caption) {
        const pt = captionBand(opts.caption, px).fs * 72 / 300;
        notes.push(`caption ≈${pt.toFixed(1)} pt`);
        smallCaption = pt < 7;
      }
    }
    $("meta").textContent = notes.join(" · ");
    const ratio = contrast(opts.fg, opts.bg);
    if (smallCaption) setStatus("The caption will print smaller than 7 pt and may be hard to read. Choose a larger size.", "warn");
    else if (!opts.transparent && ratio < 3) setStatus("Low contrast between the colors: this code may not scan. Dark modules on a light background work best.", "error");
    else if (opts.fg !== "#000000" && luminanceInverted(opts)) setStatus("Light modules on a dark background (inverted) are not read by some scanners.", "warn");
    else setStatus("QR code ready.");
  } catch (error) {
    lastState = null;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.height = 1;
    $("meta").textContent = "";
    setStatus(error.message, "error");
  }
}

function luminanceInverted(opts) {
  return !opts.transparent && contrast(opts.fg, "#ffffff") < contrast(opts.bg, "#ffffff");
}

// toDataURL is synchronous, which keeps batch export reliable even in throttled background tabs.
function canvasToBytes(c) {
  const binary = atob(c.toDataURL("image/png").split(",")[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function canvasToPng(c) {
  return Promise.resolve(new Blob([canvasToBytes(c)], { type: "image/png" }));
}

async function pngBytes(c, print) {
  const bytes = canvasToBytes(c);
  return print ? setPngDpi300(bytes) : bytes;
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileBase() { return `qr-${currentMode()}`; }

async function onDownloadPng() {
  if (!lastState) return;
  try {
    const bytes = await pngBytes(canvas, lastState.opts.print);
    download(new Blob([bytes], { type: "image/png" }), `${fileBase()}.png`);
    setStatus("PNG downloaded.");
  } catch (error) { setStatus(error.message, "error"); }
}

function onDownloadSvg() {
  if (!lastState) return;
  const svg = toSvg(lastState.matrix, lastState.opts);
  download(new Blob([svg], { type: "image/svg+xml" }), `${fileBase()}.svg`);
  setStatus("SVG downloaded.");
}

async function onCopy() {
  if (!lastState) return;
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": canvasToPng(canvas) })]);
    setStatus("QR image copied to the clipboard.");
  } catch (error) {
    setStatus("The browser refused to copy the image. Download the PNG instead.", "error");
  }
}

async function onBatch() {
  const button = $("batch-zip");
  try {
    const opts = options();
    const { items, errors } = parseBatch(val("batchText"));
    $("batchErrors").replaceChildren(...errors.map((e) => Object.assign(document.createElement("li"), { textContent: `Line ${e.line}: ${e.message}` })));
    if (!items.length) throw new PayloadError(errors.length ? "No valid lines to convert." : "Enter at least one line.");
    button.disabled = true;
    const files = {};
    const work = document.createElement("canvas");
    const skipped = [];
    let index = 0;
    for (const item of items) {
      index++;
      setStatus(`Rendering ${index} of ${items.length}…`);
      try {
        const matrix = makeMatrix(item.payload, opts.level);
        drawToCanvas(work, matrix, opts);
        const name = safeFileName(item.label, index);
        files[`${name}.png`] = [await pngBytes(work, opts.print), { level: 0 }];
        if ($("batchSvg").checked) files[`${name}.svg`] = [strToU8(toSvg(matrix, opts)), { level: 6 }];
      } catch (error) {
        skipped.push(`Line ${item.line}: ${error.message}`);
      }
      if (index % 5 === 0) await new Promise((r) => setTimeout(r));
    }
    const failedAll = Object.keys(files).length === 0;
    $("batchErrors").append(...skipped.map((m) => Object.assign(document.createElement("li"), { textContent: m })));
    if (failedAll) throw new PayloadError("None of the lines could be encoded.");
    download(new Blob([zipSync(files)], { type: "application/zip" }), "qr-codes.zip");
    const bad = errors.length + skipped.length;
    setStatus(`ZIP created with ${items.length - skipped.length} QR code(s)${bad ? `; ${bad} line(s) skipped, see the list below` : ""}.`, bad ? "warn" : "");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    button.disabled = false;
  }
}

function loadLogo(file) {
  if (!file) { logo = null; $("logoInfo").textContent = "No logo selected."; render(); return; }
  if (!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(file.type)) { $("logoFile").value = ""; setStatus("Choose a PNG, JPEG, WebP, GIF or SVG image.", "error"); return; }
  if (file.size > 5 * 1024 * 1024) { $("logoFile").value = ""; setStatus("Logo is larger than 5 MB.", "error"); return; }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const w = img.naturalWidth || 256, h = img.naturalHeight || 256;
    const r = Math.min(1, 256 / Math.max(w, h));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * r)); c.height = Math.max(1, Math.round(h * r));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    logo = { source: c, width: c.width, height: c.height, dataUrl: c.toDataURL("image/png") };
    $("logoInfo").textContent = `${file.name} (processed locally, error correction forced to H).`;
    render();
  };
  img.onerror = () => { URL.revokeObjectURL(url); $("logoFile").value = ""; logo = null; setStatus("That image could not be read.", "error"); render(); };
  img.src = url;
}

$("mode").addEventListener("change", updateModeUi);
for (const el of document.querySelectorAll("[data-live]")) {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
}
$("wifiSec").addEventListener("change", updateWifiUi);
$("showPass").addEventListener("change", updateWifiUi);
$("wifiCaption").addEventListener("change", updateWifiUi);
$("print").addEventListener("change", () => {
  $("transparent").disabled = $("print").checked;
  $("printNote").hidden = !$("print").checked;
  render();
});
$("logoFile").addEventListener("change", (e) => loadLogo(e.target.files[0]));
$("logoClear").addEventListener("click", () => { $("logoFile").value = ""; loadLogo(null); });
$("download-png").addEventListener("click", onDownloadPng);
$("download-svg").addEventListener("click", onDownloadSvg);
$("copy-image").addEventListener("click", onCopy);
$("batch-zip").addEventListener("click", onBatch);
$("reset").addEventListener("click", () => { for (const el of document.querySelectorAll("textarea,input[type=text],input[type=email],input[type=tel],input[type=password]")) el.value = ""; render(); });

updateWifiUi();
updateModeUi();