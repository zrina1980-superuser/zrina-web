(() => {
  const themes = {
    shopping: ["192, 132, 252", "241, 157, 184"],
    wood: ["245, 184, 76", "203, 141, 65"],
    mycelium: ["16, 185, 129", "185, 231, 196"],
    flight: ["56, 189, 248", "16, 185, 129"],
    radio: ["247, 37, 133", "0, 242, 254"],
    broadcast: ["0, 242, 254", "59, 130, 246"],
    wash: ["64, 217, 208", "120, 170, 255"],
    tires: ["232, 185, 107", "181, 212, 192"],
    tools: ["128, 212, 163", "186, 242, 206"],
    heirloom: ["217, 105, 75", "245, 184, 76"]
  };
  const theme = document.body.dataset.atmosphere;
  if (!themes[theme]) return;

  const canvas = document.createElement("canvas");
  canvas.id = "portfolio-atmosphere";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const context = canvas.getContext("2d");
  if (!context) return;

  const colors = themes[theme];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: -1000, y: -1000 };
  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = 0;
  let lastFrame = 0;
  let phase = 0;

  function resize() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const count = Math.min(56, Math.max(20, Math.round(width * height / 26000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: .12 + Math.random() * .28,
      radius: 1 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      tone: Math.random() > .62 ? 1 : 0
    }));
    frame(phase);
  }

  function color(particle, alpha) {
    return `rgba(${colors[particle.tone]}, ${alpha})`;
  }

  function drawNetwork(time) {
    particles.forEach((particle, index) => {
      if (!reducedMotion.matches) {
        particle.y -= particle.speed;
        particle.x += Math.sin(time * .0004 + particle.phase) * .11;
        if (particle.y < -8) {
          particle.y = height + 8;
          particle.x = Math.random() * width;
        }
      }
      for (let next = index + 1; next < particles.length; next += 1) {
        const other = particles[next];
        const distance = Math.hypot(other.x - particle.x, other.y - particle.y);
        if (distance < 128) {
          context.strokeStyle = color(particle, .10 * (1 - distance / 128));
          context.lineWidth = .7;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
      const mouseDistance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
      if (mouseDistance < 145) {
        context.strokeStyle = color(particle, .2 * (1 - mouseDistance / 145));
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(pointer.x, pointer.y);
        context.stroke();
      }
      context.fillStyle = color(particle, .36);
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });
  }

  function drawWheels(time) {
    const size = Math.min(width, height);
    const hubs = [
      [width * .16, height * .35, size * .21],
      [width * .82, height * .72, size * .25]
    ];
    hubs.forEach(([x, y, radius], index) => {
      context.save();
      context.translate(x, y);
      context.rotate(reducedMotion.matches ? .25 * index : time * .00006 * (index ? -1 : 1));
      for (const scale of [1, .78, .2]) {
        context.beginPath();
        context.strokeStyle = `rgba(${colors[index % 2]}, ${scale === 1 ? .12 : .08})`;
        context.lineWidth = 1;
        context.arc(0, 0, radius * scale, 0, Math.PI * 2);
        context.stroke();
      }
      context.beginPath();
      context.strokeStyle = `rgba(${colors[index % 2]}, .09)`;
      for (let spoke = 0; spoke < 8; spoke += 1) {
        const angle = spoke * Math.PI / 4;
        context.moveTo(Math.cos(angle) * radius * .2, Math.sin(angle) * radius * .2);
        context.lineTo(Math.cos(angle) * radius * .78, Math.sin(angle) * radius * .78);
      }
      context.stroke();
      context.restore();
      if (index === 0) {
        const angle = reducedMotion.matches ? 0 : time * .00024;
        context.fillStyle = `rgba(${colors[0]}, .5)`;
        context.beginPath();
        context.arc(x + Math.cos(angle) * radius * .78, y + Math.sin(angle) * radius * .78, 2, 0, Math.PI * 2);
        context.fill();
      }
    });
    drawNetwork(time);
  }

  function drawMycelium(time) {
    function branch(x, y, angle, length, depth) {
      if (depth === 0) return;
      const sway = reducedMotion.matches ? 0 : Math.sin(time * .00035 + depth + x) * .035;
      const endX = x + Math.cos(angle + sway) * length;
      const endY = y + Math.sin(angle + sway) * length;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(endX, endY);
      context.strokeStyle = `rgba(${colors[depth % 2]}, ${.1 + depth * .018})`;
      context.lineWidth = Math.max(.7, depth * .55);
      context.stroke();
      branch(endX, endY, angle - .48, length * .72, depth - 1);
      branch(endX, endY, angle + .48, length * .72, depth - 1);
      if (depth > 2) branch(endX, endY, angle + .08, length * .66, depth - 2);
    }

    const roots = [
      [width * .12, height * .76, -Math.PI / 2],
      [width * .88, height * .48, Math.PI]
    ];
    roots.forEach(([x, y, angle]) => {
      branch(x, y, angle, Math.min(width, height) * .14, 6);
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.fillStyle = `rgba(${colors[1]}, .38)`;
      context.fill();
    });
    drawNetwork(time);
    particles.slice(0, 30).forEach((spore, index) => {
      const wobble = reducedMotion.matches ? 0 : Math.sin(time * .001 + spore.phase) * 4;
      const x = spore.x + wobble;
      const y = (spore.y + time * .006 * spore.speed) % height;
      const radius = 1.8 + (index % 3) * .75;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = color(spore, .48);
      context.fill();
      context.beginPath();
      context.arc(x - radius * .35, y - radius * .35, radius * .28, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, .28)`;
      context.fill();
    });
  }

  function drawRadar(time) {
    const x = width * .78;
    const y = height * .48;
    const radius = Math.min(width, height) * .37;
    const angle = reducedMotion.matches ? -.55 : time * .00018;
    context.save();
    context.translate(x, y);
    context.strokeStyle = `rgba(${colors[0]}, .18)`;
    context.lineWidth = 1;
    for (const ring of [.28, .53, .78, 1]) {
      context.beginPath();
      context.arc(0, 0, radius * ring, 0, Math.PI * 2);
      context.stroke();
    }
    for (const direction of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(Math.cos(direction) * radius, Math.sin(direction) * radius);
      context.stroke();
    }
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(${colors[0]}, .23)`);
    gradient.addColorStop(1, `rgba(${colors[0]}, .025)`);
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, angle - .38, angle + .025);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    context.strokeStyle = `rgba(${colors[0]}, .72)`;
    context.shadowBlur = 12;
    context.shadowColor = `rgba(${colors[0]}, .56)`;
    context.stroke();
    context.shadowBlur = 0;
    context.beginPath();
    context.arc(0, 0, 3, 0, Math.PI * 2);
    context.fillStyle = `rgba(${colors[0]}, .76)`;
    context.fill();
    context.restore();
    const route = [
      [width * .54, height * .68],
      [width * .68, height * .57],
      [width * .8, height * .39],
      [width * .94, height * .31]
    ];
    context.setLineDash([3, 8]);
    context.beginPath();
    route.forEach(([px, py], index) => index ? context.lineTo(px, py) : context.moveTo(px, py));
    context.strokeStyle = `rgba(${colors[1]}, .22)`;
    context.stroke();
    context.setLineDash([]);
    route.forEach(([px, py], index) => {
      context.beginPath();
      context.arc(px, py, index === 2 ? 3.5 : 2, 0, Math.PI * 2);
      context.fillStyle = `rgba(${colors[index % 2]}, .65)`;
      context.fill();
    });
    drawNetwork(time);
  }

  function drawShopping(time) {
    const x = width * .83;
    const y = height * .28;
    const sway = reducedMotion.matches ? 0 : Math.sin(time * .0005) * 5;
    context.save();
    context.translate(x + sway, y);
    context.strokeStyle = `rgba(${colors[0]}, .24)`;
    context.lineWidth = 2;
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(-53, -40);
    context.lineTo(-38, -40);
    context.lineTo(-22, 17);
    context.lineTo(34, 17);
    context.lineTo(49, -20);
    context.lineTo(-30, -20);
    context.stroke();
    context.beginPath();
    context.arc(-13, 31, 4, 0, Math.PI * 2);
    context.arc(31, 31, 4, 0, Math.PI * 2);
    context.stroke();
    for (let item = 0; item < 5; item += 1) {
      const bx = -8 + item * 11;
      const by = -48 - Math.sin(item * 1.7 + time * .0005) * 3;
      context.beginPath();
      context.roundRect(bx, by, 8, 14 + (item % 2) * 5, 2);
      context.fillStyle = `rgba(${colors[item % 2]}, .17)`;
      context.fill();
      context.strokeStyle = `rgba(${colors[item % 2]}, .4)`;
      context.stroke();
    }
    context.restore();
    drawNetwork(time);
  }

  function drawTools(time) {
    const scale = Math.min(width, height) * .22;
    const placements = [
      [width * .17, height * .28, -.55],
      [width * .83, height * .72, .6]
    ];
    placements.forEach(([x, y, baseAngle], index) => {
      const rotation = reducedMotion.matches ? baseAngle : baseAngle + Math.sin(time * .00018 + index) * .09;
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.strokeStyle = `rgba(${colors[index % 2]}, .13)`;
      context.lineWidth = 2.5;
      context.lineCap = "round";
      context.lineJoin = "round";
      const handle = scale * .09;
      const ring = scale * .27;
      const jaw = scale * .2;
      const jawX = scale * .66;
      context.beginPath();
      context.moveTo(-scale * .34, -handle);
      context.lineTo(scale * .34, -handle);
      context.moveTo(-scale * .34, handle);
      context.lineTo(scale * .34, handle);
      context.stroke();

      // Zatvoreno oko: šesterokut s otvorom za maticu
      context.beginPath();
      for (let side = 0; side < 6; side += 1) {
        const angle = Math.PI / 6 + side * Math.PI / 3;
        const px = -scale * .34 - Math.cos(angle) * ring * 1.1;
        const py = Math.sin(angle) * ring * 1.1;
        if (side === 0) context.moveTo(px, py); else context.lineTo(px, py);
      }
      context.closePath();
      context.stroke();
      context.beginPath();
      for (let side = 0; side < 6; side += 1) {
        const angle = side * Math.PI / 3;
        const px = -scale * .34 - Math.cos(angle) * ring * .55;
        const py = Math.sin(angle) * ring * .55;
        if (side === 0) context.moveTo(px, py); else context.lineTo(px, py);
      }
      context.closePath();
      context.stroke();

      // Otvoreni zev (viljuška)
      context.beginPath();
      context.moveTo(scale * .34, -handle);
      context.lineTo(scale * .46, -jaw * 1.35);
      context.lineTo(jawX, -jaw * 1.35);
      context.lineTo(jawX, -jaw * .55);
      context.lineTo(scale * .5, -jaw * .55);
      context.lineTo(scale * .5, jaw * .55);
      context.lineTo(jawX, jaw * .55);
      context.lineTo(jawX, jaw * 1.35);
      context.lineTo(scale * .46, jaw * 1.35);
      context.lineTo(scale * .34, handle);
      context.stroke();
      context.restore();
    });
    drawNetwork(time);
  }

  function drawBubbles(time) {
    drawNetwork(time);
    particles.forEach((bubble, index) => {
      const drift = reducedMotion.matches ? 0 : Math.sin(time * .0005 + bubble.phase) * 8;
      const x = bubble.x + drift;
      const y = (bubble.y - (reducedMotion.matches ? 0 : time * .012 * bubble.speed)) % height;
      const py = y < 0 ? y + height : y;
      const radius = 4 + (index % 5) * 3;
      context.beginPath();
      context.arc(x, py, radius, 0, Math.PI * 2);
      context.strokeStyle = `rgba(${colors[index % 2]}, .24)`;
      context.lineWidth = 1;
      context.stroke();
      context.beginPath();
      context.arc(x - radius * .32, py - radius * .33, Math.max(1, radius * .16), 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, .26)`;
      context.fill();
    });
  }

  function drawFlow(time) {
    const moving = reducedMotion.matches ? 0 : time * .00012;
    for (let line = 0; line < 7; line += 1) {
      const y = height * (.12 + line * .14);
      context.beginPath();
      for (let step = 0; step <= 50; step += 1) {
        const x = width * step / 50;
        const offset = Math.sin(x * .008 + moving + line) * (10 + line * 1.5);
        if (step === 0) context.moveTo(x, y + offset);
        else context.lineTo(x, y + offset);
      }
      context.strokeStyle = `rgba(${colors[line % 2]}, .12)`;
      context.lineWidth = 1.2;
      context.stroke();
    }
    drawBubbles(time);
  }

  function drawWood(time) {
    const movement = reducedMotion.matches ? 0 : time * .00012;
    for (let line = 0; line < 14; line += 1) {
      const x = width * line / 13;
      context.beginPath();
      for (let step = 0; step <= 36; step += 1) {
        const y = height * step / 36;
        const offset = Math.sin(step * .24 + movement + line * .7) * 16 + Math.sin(step * .08 + line) * 7;
        if (step === 0) context.moveTo(x + offset, y);
        else context.lineTo(x + offset, y);
      }
      context.strokeStyle = `rgba(${colors[line % 2]}, .095)`;
      context.lineWidth = line % 4 === 0 ? 1.5 : .8;
      context.stroke();
    }
    drawNetwork(time);
  }

  function drawEqualizer(time) {
    const bars = Math.min(64, Math.floor(width / 17));
    const spacing = width / bars;
    context.lineWidth = 1.5;
    for (let index = 0; index < bars; index += 1) {
      const envelope = Math.sin(index * .34 + (reducedMotion.matches ? 0 : time * .0015));
      const heightOfBar = 4 + Math.abs(envelope) * Math.min(height * .105, 58);
      const x = index * spacing + spacing / 2;
      context.strokeStyle = `rgba(${colors[index % 2]}, ${.08 + Math.abs(envelope) * .1})`;
      context.beginPath();
      context.moveTo(x, height - 25);
      context.lineTo(x, height - 25 - heightOfBar);
      context.stroke();
    }
    drawNetwork(time);
  }

  function drawBroadcast(time) {
    const progress = reducedMotion.matches ? .5 : (time * .00013) % 1;
    const beamY = height * progress;
    for (let line = 0; line < 8; line += 1) {
      const y = height * line / 8;
      context.strokeStyle = `rgba(${colors[line % 2]}, .045)`;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    const gradient = context.createLinearGradient(0, beamY - 80, 0, beamY + 80);
    gradient.addColorStop(0, `rgba(${colors[0]}, 0)`);
    gradient.addColorStop(.5, `rgba(${colors[0]}, .10)`);
    gradient.addColorStop(1, `rgba(${colors[0]}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(0, beamY - 80, width, 160);
    drawNetwork(time);
  }

  function frame(time) {
    animationFrame = 0;
    if (document.hidden) return;
    if (!reducedMotion.matches && time - lastFrame < 1000 / 60) {
      animationFrame = requestAnimationFrame(frame);
      return;
    }
    lastFrame = time;
    phase = time;
    context.clearRect(0, 0, width, height);
    if (theme === "tires") drawWheels(time);
    else if (theme === "mycelium") drawMycelium(time);
    else if (theme === "flight") drawRadar(time);
    else if (theme === "shopping") drawShopping(time);
    else if (theme === "wash") drawFlow(time);
    else if (theme === "tools") drawTools(time);
    else if (theme === "wood") drawWood(time);
    else if (theme === "radio") drawEqualizer(time);
    else if (theme === "broadcast") drawBroadcast(time);
    else drawNetwork(time);
    if (!reducedMotion.matches) animationFrame = requestAnimationFrame(frame);
  }

  function scheduleFrame() {
    if (!animationFrame) animationFrame = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    scheduleFrame();
  }, { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.x = -1000;
    pointer.y = -1000;
  }, { passive: true });
  document.addEventListener("visibilitychange", scheduleFrame);
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) scheduleFrame();
    else {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      frame(phase);
    }
  });
  resize();
  scheduleFrame();
})();
