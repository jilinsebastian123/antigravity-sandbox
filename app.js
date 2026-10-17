const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Physics parameters
let gravity = -0.35;
let drag = 0.985;
let repelMode = true;
const mouse = { x: -1000, y: -1000, active: false };

const PARTICLE_COUNT = 140;
const particles = [];
const hues = [180, 200, 220, 280, 310];

class Particle {
  constructor(x, y) {
    this.x = x || Math.random() * width;
    this.y = y || Math.random() * height;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = Math.random() * 4 + 2;
    this.baseHue = hues[Math.floor(Math.random() * hues.length)];
  }

  update() {
    this.vy += gravity;

    // Localized cursor influence
    if (mouse.active) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 220 && dist > 1) {
        const force = (repelMode ? 1 : -1) * (180 / dist);
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }

    // Apply fluid damping
    this.vx *= drag;
    this.vy *= drag;

    this.x += this.vx;
    this.y += this.vy;

    // Boundary bounces with energy loss
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -0.7;
    } else if (this.x + this.radius > width) {
      this.x = width - this.radius;
      this.vx *= -0.7;
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -0.7;
    } else if (this.y + this.radius > height) {
      this.y = height - this.radius;
      this.vy *= -0.7;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${this.baseHue}, 85%, 65%)`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `hsl(${this.baseHue}, 85%, 55%)`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function init() {
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
}

// Interaction Listeners
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

window.addEventListener("mouseleave", () => {
  mouse.active = false;
});

window.addEventListener("click", (e) => {
  for (let i = 0; i < 8; i++) {
    const p = new Particle(e.clientX, e.clientY);
    p.vx = (Math.random() - 0.5) * 8;
    p.vy = (Math.random() - 0.5) * 8;
    particles.push(p);
  }
});

// UI Controls
document.getElementById("gravity").addEventListener("input", (e) => {
  gravity = parseFloat(e.target.value);
  document.getElementById("grav-val").textContent = gravity.toFixed(2);
});

document.getElementById("drag").addEventListener("input", (e) => {
  drag = parseFloat(e.target.value);
  document.getElementById("drag-val").textContent = drag.toFixed(3);
});

const toggleBtn = document.getElementById("toggle-mode");
toggleBtn.addEventListener("click", () => {
  repelMode = !repelMode;
  toggleBtn.textContent = repelMode ? "Mode: Repel Cursor" : "Mode: Attract Cursor";
});

document.getElementById("reset-btn").addEventListener("click", init);

// Physics loop
function loop() {
  ctx.fillStyle = "rgba(13, 17, 23, 0.28)";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  requestAnimationFrame(loop);
}

init();
loop();