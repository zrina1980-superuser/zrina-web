(() => {
  const dialog = document.getElementById("legal");
  const open = document.getElementById("legal-open");
  if (dialog && open && typeof dialog.showModal === "function") open.addEventListener("click", () => dialog.showModal());

  const canvas = document.getElementById("bg-canvas");
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dots = [];
  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    dots = Array.from({ length: Math.min(60, Math.round(w * h / 28000)) }, () => ({
      x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25
    }));
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const a of dots) {
      a.x = (a.x + a.vx + w) % w;
      a.y = (a.y + a.vy + h) % h;
      ctx.fillStyle = "rgba(0,240,255,.7)";
      ctx.fillRect(a.x, a.y, 1.6, 1.6);
      for (const b of dots) {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120 && a !== b) {
          ctx.strokeStyle = `rgba(168,85,247,${(1 - d / 120) * .25})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  addEventListener("resize", resize);
  resize();
  frame();
})();
