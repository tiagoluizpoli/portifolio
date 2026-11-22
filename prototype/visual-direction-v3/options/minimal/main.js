// PROTOTYPE option F · Design engineer. One column; the craft lives in the interactions.
document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=switzer@400,500&display=swap">
<style>.shot--0{background:#1F3A30;color:#E8F1EC}.shot--1{background:#2B2D42;color:#E9E9F2}.shot b{position:absolute;left:18px;bottom:14px;font:500 26px/1 var(--font);letter-spacing:-.02em}.shot small{position:absolute;right:12px;top:10px;font-size:10px;opacity:.6}</style>`);

const C = window.CONTENT.en, P = window.CONTENT.pt, L = window.CONTENT.links;
const reduced = window.PROTOTYPE_REDUCED;
const root = document.documentElement;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const icon = d => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ARROW = icon('<path d="M5 11 11 5M6 5h5v5"/>'), DOWN = icon('<path d="M8 3v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10"/>');
const theme = new URLSearchParams(location.search).get("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
root.dataset.theme = theme;
let lang = "en";

// Odometer: each digit is a column 0–9 that rolls into place.
const odo = (n, sep) => [...n.toLocaleString(sep === "." ? "pt-BR" : "en-US")].map((ch, i) =>
  /\d/.test(ch) ? `<span class="d"><span style="--delay:${(i * 0.07).toFixed(2)}s" data-to="${ch}">${"0123456789".split("").map(x => `<i>${x}</i>`).join("")}</span></span>` : `<span>${ch}</span>`
).join("");
const [contrib, repos] = C.stats.items;

const T = {
  en: { role: C.role, pitch: C.pitch, place: "São Paulo, Brazil · Remote", local: "local", wa: C.cta.whatsapp, cv: C.cta.cv,
        stats: (a, b) => `Over the last year: <strong class="odo tnum" aria-label="${contrib.value}">${a}</strong> contributions across <strong class="odo tnum" aria-label="${repos.value}">${b}</strong> public repositories, mostly TypeScript, C# and Go.`, sep: "," },
  pt: { role: P.role, pitch: P.pitch, place: "São Paulo, Brasil · Remoto", local: "horário local", wa: P.cta.whatsapp, cv: P.cta.cv,
        stats: (a, b) => `No último ano: <strong class="odo tnum" aria-label="${contrib.value}">${a}</strong> contribuições em <strong class="odo tnum" aria-label="${repos.value}">${b}</strong> repositórios públicos, principalmente TypeScript, C# e Go.`, sep: "." }
};
const statusLabel = { en: { "live-evolving": "In production · Actively developed", live: "In production", soon: "Coming soon" }, pt: P.statusLabels };

const shot = (p, k) => `<div class="shot shot--${k % 2}"><small>sample</small><b>${esc(p.title)}</b></div>`;

const hero = () => {
  const t = T[lang];
  return `
  <div class="who" data-in style="--i:0">
    <img src="photo.jpg" alt="Tiago Luiz Poli" width="44" height="44">
    <div><h1>Tiago Luiz Poli</h1><p>${t.role}</p></div>
  </div>
  <p class="pitch" data-in style="--i:1">${t.pitch}</p>
  <p class="place" data-in style="--i:2"><span class="live" aria-hidden="true"></span>${t.place} · <span class="clock tnum" data-clock></span> ${t.local}</p>
  <div class="actions" data-in style="--i:3">
    <a class="act" href="${L.whatsapp}">${t.wa}${ARROW.replace("<svg", '<svg class="arrow"')}</a>
    <a class="act" href="${L.cv}">${t.cv}${DOWN.replace("<svg", '<svg class="down"')}</a>
  </div>
  <p class="stats" data-in style="--i:4">${t.stats(odo(contrib.value, t.sep), odo(repos.value, t.sep))}<span class="sample">sample</span></p>`;
};

const projects = C.projects.map((p, i) => `
  <li class="proj" data-preview="${i}">
    <div class="proj__head"><h3 class="proj__title">${esc(p.title)}${p.sample ? '<span class="sample">sample</span>' : ""}</h3><span class="st ${p.status === "soon" ? "st--soon" : ""}"><i></i><span data-status="${p.status}"></span></span></div>
    <p class="proj__sum">${esc(p.summary)}</p>
    ${p.now ? `<p class="proj__now"><b>Now</b> · ${esc(p.now.replace(/^Now:\s*/, ""))}</p>` : ""}
    <p class="proj__meta">${esc(p.role)} · ${p.stack.map(esc).join(", ")}</p>
    <p class="proj__foot"><a class="u" href="${p.link}">Learn more${ARROW}</a></p>
    <div class="thumbs">${Array.from({ length: p.images }, (_, k) => shot(p, i + k)).join("")}</div>
  </li>`).join("");

const xp = C.experience.map(x => `
  <li class="xp">
    <p class="xp__when tnum">${esc(x.period.replace(/ – /, "–"))}</p>
    <p class="xp__who"><b>${esc(x.company)}</b> <span>· ${esc(x.role)}</span></p>
    <ul class="xp__what">${x.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
  </li>`).join("");

document.getElementById("app").innerHTML = `
<div class="page">
  <header class="top" data-in style="--i:0">
    <nav aria-label="Sections">${["projects", "experience", "about", "contact"].map(k => `<a href="#${k}">${C.nav[k]}</a>`).join("")}</nav>
    <div class="tools">
      <span><button class="tog" data-lang="en" aria-pressed="true">EN</button> <button class="tog tog--sep" data-lang="pt" aria-pressed="false">PT</button></span>
      <button class="tog" data-theme-toggle>${theme === "dark" ? "Light" : "Dark"}</button>
    </div>
  </header>
  <section id="top" data-hero>${hero()}</section>

  <section class="sec" id="projects" data-in style="--i:5">
    <h2>${C.projectsTitle}</h2>
    <ul class="rows">${projects}</ul>
  </section>

  <section class="sec" id="experience">
    <h2>${C.experienceTitle}</h2>
    <ul class="rows">${xp}</ul>
  </section>

  <section class="sec" id="skills">
    <h2>${C.skillsTitle}</h2>
    <dl class="kv">${C.skills.map(g => `<dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join(", ")}</dd>`).join("")}</dl>
  </section>

  <section class="sec" id="about">
    <h2>${C.aboutTitle}</h2>
    <p class="about">${esc(C.about)}</p>
    <dl class="kv edu"><dt>Education</dt><dd>${esc(C.education.degree)}, ${esc(C.education.school)} <span style="color:var(--ink2)">· ${esc(C.education.period)}</span></dd></dl>
  </section>

  <section class="sec" id="contact">
    <h2>${C.nav.contact}</h2>
    <p>Open to senior roles, remote. WhatsApp is the fastest way to reach me.</p>
    <dl class="links">
      <dt>Message</dt><dd><a class="u" href="${L.whatsapp}">WhatsApp${ARROW}</a></dd>
      <dt>Elsewhere</dt><dd><a class="u" href="${L.linkedin}">LinkedIn${ARROW}</a>, <a class="u" href="${L.github}">GitHub${ARROW}</a>, <a class="u" href="${L.email}">Email${ARROW}</a></dd>
      <dt>Résumé</dt><dd><a class="u" href="${L.cv}">Download CV (PDF)${DOWN}</a></dd>
    </dl>
  </section>

  <footer class="foot"><span>Tiago Luiz Poli · 2026</span><span>Built by hand, served from my own server.</span></footer>
</div>
<div class="preview" aria-hidden="true"></div>`;
document.title = "PROTOTYPE · F · Design engineer";

// --- live bits: clock, statuses, odometers ---
const tickClock = () => {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date()).split(":");
  document.querySelectorAll("[data-clock]").forEach(el => el.innerHTML = `${h}<span class="colon">:</span>${m}`);
};
const fillStatus = () => document.querySelectorAll("[data-status]").forEach(el => el.textContent = statusLabel[lang][el.dataset.status]);
const roll = () => document.querySelectorAll(".odo [data-to]").forEach(col => {
  const go = () => col.style.transform = `translateY(-${col.dataset.to * 1.6}em)`;
  if (reduced) { col.style.transition = "none"; go(); } else requestAnimationFrame(() => requestAnimationFrame(go));
});
tickClock(); setInterval(tickClock, 15000); fillStatus();

// --- language + theme ---
document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => {
  lang = b.dataset.lang;
  root.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-lang]").forEach(x => x.setAttribute("aria-pressed", x === b));
  document.querySelector("[data-hero]").innerHTML = hero();
  tickClock(); fillStatus(); roll();
});
document.querySelector("[data-theme-toggle]").onclick = e => {
  const t = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = t; e.currentTarget.textContent = t === "dark" ? "Light" : "Dark";
};

// --- page-load blur-in ---
if (!reduced) { root.classList.add("motion"); requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("ready"))); }
setTimeout(roll, reduced ? 0 : 450);

// --- floating project preview: follows the cursor on a spring, leans with velocity ---
const pv = document.querySelector(".preview");
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, active = false, raf = 0;
  const K = 0.12, D = 0.72; // spring stiffness, damping
  const frame = () => {
    vx = (vx + (tx - x) * K) * D; vy = (vy + (ty - y) * K) * D; x += vx; y += vy;
    pv.style.transform = `translate(${x + 24}px, ${y - 90}px) rotate(${Math.max(-6, Math.min(6, vx * 0.35))}deg)`;
    raf = active || Math.abs(vx) + Math.abs(vy) > 0.05 ? requestAnimationFrame(frame) : 0;
  };
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; if (reduced) { x = tx; y = ty; } if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  document.querySelectorAll("[data-preview]").forEach(li => {
    li.addEventListener("pointerenter", e => {
      const p = C.projects[+li.dataset.preview];
      pv.innerHTML = shot(p, +li.dataset.preview);
      if (!active) { x = tx = e.clientX; y = ty = e.clientY; }
      active = true; pv.classList.add("on");
      if (!raf) raf = requestAnimationFrame(frame);
    });
    li.addEventListener("pointerleave", () => { active = false; pv.classList.remove("on"); });
  });
}
