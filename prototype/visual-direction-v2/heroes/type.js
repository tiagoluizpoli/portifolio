// PROTOTYPE hero C: kinetic type. Letters rise in, react to the cursor; pitch words sharpen from blur.
const css = `
[data-hero="type"] .hero { grid-template-columns: 1fr; align-content: center; }
[data-hero="type"] .hero__stage { display: none; }
[data-hero="type"] .hero__copy { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: "id id" "name name" "role cta" "pitch cta" "stats stats"; column-gap: 48px; }
[data-hero="type"] .hero__id { grid-area: id; }
[data-hero="type"] .hero__name { grid-area: name; font-size: clamp(4.2rem, 13.2vw, 13.5rem); line-height: .84; letter-spacing: -.05em; margin: 0 0 36px -.04em; }
[data-hero="type"] .hero__role { grid-area: role; margin-top: 0; }
[data-hero="type"] .hero__pitch { grid-area: pitch; max-width: 30ch; font-size: clamp(1.15rem, 1.6vw, 1.45rem); color: var(--ink); }
[data-hero="type"] .hero__cta { grid-area: cta; justify-content: flex-end; align-self: end; margin-top: 0; }
[data-hero="type"] .stats { grid-area: stats; }
.kt-line { display: block; overflow: hidden; padding-bottom: .04em; }
.kt-ch { display: inline-block; transform-origin: 50% 100%; transition: transform .6s var(--ease), color .3s; }
.motion .kt-ch { transform: translateY(105%) rotate(8deg); }
.motion .kt-on .kt-ch { transform: none; transition: transform 1.1s var(--ease) calc(var(--d) * 1ms); }
.kt-word { display: inline-block; transition: filter .9s var(--ease) calc(var(--d) * 1ms), opacity .9s var(--ease) calc(var(--d) * 1ms); }
.motion .kt-pitch .kt-word { filter: blur(10px); opacity: 0; }
.motion .kt-pitch.kt-on .kt-word { filter: none; opacity: 1; }
.kt-pill { border: 1.5px solid currentColor; border-radius: 999px; padding: 0 .38em .04em; margin: 0 .04em; }
.kt-cursor { position: fixed; left: 0; top: 0; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: var(--ink); pointer-events: none; z-index: 60; mix-blend-mode: difference; filter: invert(1); transition: scale .35s var(--ease); }
[data-theme="dark"] .kt-cursor { filter: none; background: #fff; }
.kt-cursor.is-link { scale: 4.6; }
@media (pointer: coarse) { .kt-cursor { display: none; } }
@media (max-width: 760px) {
  [data-hero="type"] .hero__copy { grid-template-columns: 1fr; grid-template-areas: "id" "name" "role" "pitch" "cta" "stats"; }
  [data-hero="type"] .hero__cta { justify-content: flex-start; margin-top: 28px; }
}
`;
document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

const reduced = window.PROTOTYPE_REDUCED;
const h1 = document.querySelector("[data-hero-name]");
h1.setAttribute("aria-label", h1.textContent);
const rows = ["Tiago Luiz", "Poli"];
let d = 0;
h1.innerHTML = rows.map(r => `<span class="kt-line" aria-hidden="true">${[...r].map(c => c === " " ? " " : `<span class="kt-ch" style="--d:${(d += 45)}">${c}</span>`).join("")}</span>`).join("");

// Pitch: words sharpen in sequence; the proof words get pills (ped.ro-style).
const pitchEl = document.querySelector("[data-hero-pitch]");
const renderPitch = () => {
  let i = 0;
  const words = pitchEl.textContent.split(" ");
  pitchEl.innerHTML = words.map(w => {
    const clean = w.replace(/[^\p{L}]/gu, "").toLowerCase();
    const pill = ["real", "reais", "products", "produtos"].includes(clean);
    return `<span class="kt-word${pill ? " kt-pill" : ""}" style="--d:${600 + (i++) * 55}">${w}</span>`;
  }).join(" ");
  pitchEl.classList.add("kt-pitch");
  requestAnimationFrame(() => requestAnimationFrame(() => pitchEl.classList.add("kt-on")));
};
renderPitch();
document.addEventListener("langchange", () => { pitchEl.classList.remove("kt-on"); renderPitch(); });

requestAnimationFrame(() => requestAnimationFrame(() => h1.querySelectorAll(".kt-line").forEach(l => l.classList.add("kt-on"))));

// Letters lean away from the cursor and pick up the accent nearby.
const chars = [...h1.querySelectorAll(".kt-ch")];
if (!reduced && matchMedia("(pointer:fine)").matches) {
  let mx = -1e4, my = -1e4, raf = 0;
  const update = () => {
    raf = 0;
    for (const c of chars) {
      const r = c.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = cx - mx, dy = cy - my, dist = Math.hypot(dx, dy), k = Math.max(0, 1 - dist / 260);
      c.style.transform = k ? `translate(${(dx / (dist || 1)) * k * 14}px, ${-k * 22}px) rotate(${(dx / (dist || 1)) * k * -6}deg)` : "";
      c.style.color = k > 0.55 ? "var(--accent)" : "";
    }
  };
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(update); }, { passive: true });

  // Custom cursor (dot that grows over links).
  const cur = document.createElement("div"); cur.className = "kt-cursor"; document.body.appendChild(cur);
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; cur.classList.toggle("is-link", !!e.target.closest("a,button")); }, { passive: true });
  const follow = () => { x += (tx - x) * 0.22; y += (ty - y) * 0.22; cur.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(follow); };
  follow();
}
