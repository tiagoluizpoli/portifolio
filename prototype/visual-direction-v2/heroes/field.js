// PROTOTYPE hero B: thousands of particles assemble the name; the cursor scatters them, click to burst.
const css = `
[data-hero="field"] .hero { grid-template-columns: 1fr; align-items: end; min-height: 100svh; padding-bottom: 48px; }
[data-hero="field"] .hero__stage { position: absolute; top: 0; bottom: 0; left: calc(50% - 50vw); width: 100vw; }
[data-hero="field"] .hero__stage canvas { width: 100%; height: 100%; display: block; }
[data-hero="field"] .hero__name { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
[data-hero="field"] .hero__copy { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "id id" "role cta" "pitch cta" "stats stats"; column-gap: 40px; align-items: end; pointer-events: none; }
[data-hero="field"] .hero__copy a, [data-hero="field"] .hero__copy button { pointer-events: auto; }
[data-hero="field"] .hero__id { grid-area: id; margin-bottom: 18px; }
[data-hero="field"] .hero__role { grid-area: role; margin-top: 0; }
[data-hero="field"] .hero__pitch { grid-area: pitch; }
[data-hero="field"] .hero__cta { grid-area: cta; margin-top: 0; }
[data-hero="field"] .stats { grid-area: stats; margin-top: 32px; }
.field-hint { position: absolute; right: var(--pad); top: 96px; font: 400 12px/1.5 var(--mono); color: var(--ink2); text-align: right; z-index: 2; }
@media (max-width: 760px) {
  [data-hero="field"] .hero__copy { grid-template-columns: 1fr; grid-template-areas: "id" "role" "pitch" "cta" "stats"; }
  [data-hero="field"] .hero__cta { margin-top: 24px; }
  .field-hint { display: none; }
}
`;
document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

const stage = document.getElementById("hero-stage");
const hero = stage.parentElement;
hero.insertAdjacentHTML("beforeend", `<p class="field-hint" aria-hidden="true">move the cursor through the name<br>click to burst</p>`);
const cv = document.createElement("canvas"); stage.appendChild(cv);
const ctx = cv.getContext("2d");
const reduced = window.PROTOTYPE_REDUCED;
let W = 0, H = 0, dpr = 1, parts = [], colors = {};
const mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0 };

const readColors = () => {
  const s = getComputedStyle(document.documentElement);
  colors = { ink: s.getPropertyValue("--ink").trim(), accent: s.getPropertyValue("--accent").trim() };
};

const layout = () => {
  dpr = Math.min(devicePixelRatio, 2);
  W = stage.clientWidth; H = stage.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Sample the name from an offscreen canvas into target points.
  const pad = Math.max(20, Math.min(72, W * 0.05));
  const narrow = W < 760;
  const rows = narrow ? ["TIAGO", "LUIZ", "POLI"] : ["TIAGO LUIZ", "POLI"];
  const off = document.createElement("canvas"); off.width = W; off.height = H;
  const o = off.getContext("2d");
  let size = 400; o.font = `600 ${size}px "Clash Grotesk"`;
  const widest = Math.max(...rows.map(r => o.measureText(r).width));
  let fit = size * (W - pad * 2) / widest;
  if (narrow) {
    // Phones: the name takes its own band at the top and pushes the copy below it.
    size = fit; hero.style.paddingTop = `${Math.round(96 + rows.length * size * 0.84 + 24)}px`;
  } else {
    hero.style.paddingTop = "";
    const copyH = hero.querySelector(".hero__copy").offsetHeight;
    size = Math.min(fit, (H - 96 - copyH - 40) / (rows.length * 0.84));
  }
  o.font = `600 ${size}px "Clash Grotesk"`; o.fillStyle = "#000"; o.textBaseline = "alphabetic";
  rows.forEach((r, i) => o.fillText(r, pad - size * 0.04, 96 + size * 0.74 + i * size * 0.84));
  const data = o.getImageData(0, 0, W, H).data;
  const step = narrow ? 4 : (W > 1500 ? 6 : 5);
  const targets = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 128) targets.push([x + (Math.random() - .5) * 1.2, y + (Math.random() - .5) * 1.2]);
  // Reuse existing particles where possible so resizes morph instead of resetting.
  const next = targets.map((t, i) => {
    const p = parts[i] || { x: reduced ? t[0] : Math.random() * W, y: reduced ? t[1] : H + Math.random() * H * 0.5, vx: 0, vy: 0, a: Math.random() < 0.07, d: 0.6 + Math.random() * 0.8 };
    p.tx = t[0]; p.ty = t[1]; return p;
  });
  parts = next;
  if (reduced) draw();
};

const draw = () => {
  ctx.clearRect(0, 0, W, H);
  const s = 1.7;
  ctx.fillStyle = colors.ink;
  for (const p of parts) if (!p.a) ctx.fillRect(p.x, p.y, s, s);
  ctx.fillStyle = colors.accent;
  for (const p of parts) if (p.a) ctx.fillRect(p.x - .3, p.y - .3, s + .6, s + .6);
};

const R = 110;
let last = 0;
const step = (now) => {
  requestAnimationFrame(step);
  if (!visible) { last = now; return; }
  // Fixed 60Hz substeps so slow machines assemble the name as fast as quick ones.
  const n = Math.min(4, Math.max(1, Math.round((now - (last || now - 16.7)) / 16.7))); last = now;
  for (let i = 0; i < n; i++) integrate(now);
  mouse.vx *= 0.8; mouse.vy *= 0.8;
  draw();
};
const integrate = (now) => {
  const t = now * 0.001;
  for (const p of parts) {
    let fx = (p.tx - p.x) * 0.018 * p.d, fy = (p.ty - p.y) * 0.018 * p.d;
    const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
    if (d2 < R * R) {
      const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 5.5;
      fx += dx / d * f + mouse.vx * 0.06 * (1 - d / R); fy += dy / d * f + mouse.vy * 0.06 * (1 - d / R);
    }
    fx += Math.sin(t * 1.3 + p.ty * 0.02) * 0.05; fy += Math.cos(t * 1.1 + p.tx * 0.02) * 0.05;
    p.vx = (p.vx + fx) * 0.86; p.vy = (p.vy + fy) * 0.86;
    p.x += p.vx; p.y += p.vy;
  }
};

let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);
addEventListener("pointermove", e => {
  const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  mouse.vx = x - mouse.x; mouse.vy = y - mouse.y; if (Math.abs(mouse.vx) > 200) mouse.vx = mouse.vy = 0;
  mouse.x = x; mouse.y = y;
}, { passive: true });
document.addEventListener("pointerleave", () => { mouse.x = mouse.y = -1e4; });
hero.addEventListener("click", e => {
  if (reduced || e.target.closest("a,button")) return;
  const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  for (const p of parts) { const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / 420) * 38; p.vx += dx / d * f; p.vy += dy / d * f; }
});
document.addEventListener("themechange", () => { readColors(); if (reduced) draw(); });

await document.fonts.load('600 100px "Clash Grotesk"');
readColors(); layout();
let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(layout, 120); }).observe(stage);
if (!reduced) requestAnimationFrame(step);
