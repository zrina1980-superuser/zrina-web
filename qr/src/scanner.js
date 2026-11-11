import jsQR from "jsqr";

const $ = (id) => document.getElementById(id);
const video = $("scanVideo");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
let stream = null;
let session = 0;
let timer = null;

function message(text, type = "") {
  const status = $("scanStatus");
  status.textContent = text;
  status.className = `status ${type}`;
}

function stopCamera() {
  session++;
  clearTimeout(timer);
  if (stream) stream.getTracks().forEach((track) => track.stop());
  stream = null;
  video.srcObject = null;
  video.hidden = true;
  $("scanStop").disabled = true;
  $("scanStart").disabled = false;
}

function decode(source, width, height) {
  if (!width || !height) throw new Error("The image has no readable dimensions.");
  const scale = Math.min(1, 1280 / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(image.data, image.width, image.height);
}

function showResult(value) {
  $("scanResult").value = value;
  $("scanResultSection").hidden = false;
  message("QR code read. Check the content before using it.");
}

async function startCamera() {
  stopCamera();
  const id = session;
  $("scanResultSection").hidden = true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    message("Camera access is unavailable in this browser. You can scan an image instead.", "error");
    return;
  }
  $("scanStart").disabled = true;
  message("Requesting camera permission…");
  try {
    const requested = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    if (id !== session) { requested.getTracks().forEach((track) => track.stop()); return; }
    stream = requested;
    video.srcObject = stream;
    video.hidden = false;
    $("scanStop").disabled = false;
    await video.play();
    if (id !== session) return;
    message("Point the camera at a QR code.");
    const scanFrame = () => {
      if (id !== session) return;
      try {
        if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
          const result = decode(video, video.videoWidth, video.videoHeight);
          if (result) { stopCamera(); showResult(result.data); return; }
        }
        timer = setTimeout(scanFrame, 250);
      } catch (error) {
        stopCamera();
        message(`Could not read the camera image: ${error.message}`, "error");
      }
    };
    scanFrame();
  } catch (error) {
    if (id !== session) return;
    stopCamera();
    message(`Camera unavailable or permission denied: ${error.message}. Try an image instead.`, "error");
  }
}

function scanFile(file) {
  stopCamera();
  $("scanResultSection").hidden = true;
  if (!file) return;
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
    message("Choose a PNG, JPEG, WebP or GIF image up to 10 MB.", "error");
    return;
  }
  const id = session;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    if (id !== session) return;
    try {
      const result = decode(image, image.naturalWidth, image.naturalHeight);
      if (result) showResult(result.data);
      else message("No QR code found. Try a clearer image with the entire code visible.", "error");
    } catch (error) {
      message(`Could not read the image: ${error.message}`, "error");
    }
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    if (id === session) message("The selected image could not be opened.", "error");
  };
  image.src = url;
}

$("scanStart").addEventListener("click", startCamera);
$("scanStop").addEventListener("click", () => { stopCamera(); message("Camera stopped."); });
$("scanFile").addEventListener("change", (event) => {
  scanFile(event.target.files[0]);
  event.target.value = "";
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && (stream || $("scanStart").disabled)) {
    stopCamera();
    message("Camera stopped when the page was hidden.");
  }
});
window.addEventListener("pagehide", stopCamera);
