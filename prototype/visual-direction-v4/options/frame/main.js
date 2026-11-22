// PROTOTYPE option I · Out of the frame. The photo is a physical card; his head breaks out over its top edge.
const font = document.createElement("link");
font.rel = "stylesheet";
font.href = "https://fonts.googleapis.com/css2?family=Figtree:wght@400..900&display=swap";
document.head.appendChild(font);

const C = window.CONTENT.en, P = window.CONTENT.pt, L = window.CONTENT.links;
const reduced = window.PROTOTYPE_REDUCED;
const fine = matchMedia("(pointer: fine)").matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const svg = d => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  chat: svg('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
  down: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'),
  arrow: svg('<path d="M7 7h10v10"/><path d="M7 17 17 7"/>'),
  mail: svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
  gh: svg('<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>'),
  in: svg('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>'),
  menu: svg('<path d="M4 8h16M4 16h16"/>')
};
const sample = `<span class="sample" title="Placeholder data">sample</span>`;
const [sContrib, sRepos, sLangs] = C.stats.items;
const statsText = {
  en: `Over the last year: <strong data-count="${sContrib.value}">${sContrib.value.toLocaleString("en-US")}</strong> contributions on GitHub across <strong data-count="${sRepos.value}">${sRepos.value}</strong> public repositories, mostly ${esc(sLangs.text.replace(/ · /g, ", ").replace(/, ([^,]*)$/, " and $1"))}. <a class="link" href="${L.github}">github.com/tiagoluizpoli</a> ${sample}`,
  pt: `No último ano: <strong data-count="${sContrib.value}">${sContrib.value.toLocaleString("pt-BR")}</strong> contribuições no GitHub em <strong data-count="${sRepos.value}">${sRepos.value}</strong> repositórios públicos, principalmente ${esc(sLangs.text.replace(/ · /g, ", ").replace(/, ([^,]*)$/, " e $1"))}. <a class="link" href="${L.github}">github.com/tiagoluizpoli</a> ${sample}`
};
const statusText = { en: { "live-evolving": "In production · Actively developed", live: "In production", soon: "Coming soon" }, pt: P.statusLabels };
const navKeys = ["projects", "experience", "skills", "about", "contact"];

document.getElementById("app").innerHTML = `
<header class="hdr" data-hdr>
  <div class="wrap hdr__in">
    <a class="hdr__name" href="#top">Tiago Luiz Poli</a>
    <nav class="hdr__nav" aria-label="Sections">${navKeys.map(k => `<a href="#${k}" data-nav="${k}">${C.nav[k]}</a>`).join("")}</nav>
    <div class="lang" role="group" aria-label="Language"><button data-lang="en" aria-pressed="true">EN</button><button data-lang="pt" aria-pressed="false">PT</button></div>
    <button class="menu" data-menu aria-label="Menu" aria-expanded="false">${I.menu}</button>
  </div>
</header>
<main>
  <section class="wrap hero" id="top">
    <div class="stage" aria-hidden="true">
      <div class="card" data-card>
        <div class="card__face"><img class="card__img" src="options/frame/plate.jpg" alt=""><div class="card__sheen"></div><div class="card__edge"></div></div>
        <div class="card__pop"><img src="cutout.png" alt=""></div>
      </div>
      <div class="shadow" data-shadow></div>
    </div>
    <div class="copy">
      <h1 class="copy__name" style="--k:0">Tiago Luiz Poli</h1>
      <p class="copy__role" style="--k:1" data-t="role">${C.role}</p>
      <p class="copy__pitch" style="--k:2" data-t="pitch">${C.pitch}</p>
      <p class="copy__where" style="--k:3"><span data-t="location">${C.location}</span><span><b data-clock>--:--</b> <span data-local>local time</span></span></p>
      <div class="copy__cta" style="--k:4">
        <a class="btn btn--main" href="${L.whatsapp}">${I.chat}<span data-t="cta.whatsapp">${C.cta.whatsapp}</span></a>
        <a class="btn btn--alt" href="${L.cv}">${I.down}<span data-t="cta.cv">${C.cta.cv}</span></a>
      </div>
      <p class="copy__stats" style="--k:5" data-stats>${statsText.en}</p>
    </div>
  </section>

  <section class="wrap sec" id="projects">
    <div class="sec__top" data-reveal><h2 class="sec__h">${C.projectsTitle}</h2><p class="sec__lead">Products I build and run myself, live on my own infrastructure.</p></div>
    <div class="projects">
      ${C.projects.map(p => `
      <article class="proj" data-reveal>
        <div class="proj__media"><div class="shot" data-tilt><div class="shot__face"><span>Screenshot pending</span></div><div class="shot__sheen"></div></div></div>
        <div class="proj__body">
          <div class="proj__head"><span class="status status--${p.status}" data-status="${p.status}">${p.statusLabel}</span>${p.sample ? sample : ""}</div>
          <h3 class="proj__title">${esc(p.title)}</h3>
          <p class="proj__sum">${esc(p.summary)}</p>
          ${p.now ? `<p class="proj__now"><b>Now</b>${esc(p.now.replace(/^Now:\s*/, ""))}</p>` : ""}
          <dl class="proj__facts"><div><b>Role</b> · ${esc(p.role)}</div><div><b>Stack</b> · ${p.stack.map(esc).join(", ")}</div></dl>
          <a class="link" href="${p.link}">Learn more ${I.arrow}</a>
        </div>
      </article>`).join("")}
    </div>
  </section>

  <section class="wrap sec" id="experience">
    <div class="sec__top" data-reveal><h2 class="sec__h">${C.experienceTitle}</h2><p class="sec__lead">From freelance systems in 2015 to large SaaS platforms today.</p></div>
    <ol class="xp">
      ${C.experience.map(x => `
      <li class="row" data-reveal>
        <p class="xp__when">${esc(x.period)}</p>
        <div><h3 class="xp__co">${esc(x.company)}</h3><p class="xp__role">${esc(x.role)} · ${esc(x.place)}</p></div>
        <ul class="xp__what">${x.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
      </li>`).join("")}
    </ol>
  </section>

  <section class="wrap sec" id="skills">
    <div class="sec__top" data-reveal><h2 class="sec__h">${C.skillsTitle}</h2></div>
    <div class="skills">${C.skills.map(g => `<div class="skills__g" data-reveal><h3>${esc(g.group)}</h3><p>${g.items.map(esc).join(", ")}</p></div>`).join("")}</div>
  </section>

  <section class="wrap sec" id="about">
    <div class="sec__top" data-reveal><h2 class="sec__h">${C.aboutTitle}</h2></div>
    <div class="about">
      <p class="about__p" data-reveal>${esc(C.about)}</p>
      <aside class="edu" data-reveal><h3>Education</h3><p class="s">${esc(C.education.school)}</p><p class="d">${esc(C.education.degree)}</p><p class="w">${esc(C.education.period)}</p></aside>
    </div>
  </section>
</main>

<section class="wrap contact" id="contact">
  <div class="contact__panel" data-reveal>
    <div><h2 class="sec__h">Want to work together?</h2><p class="sec__lead">Open to senior roles, remote. WhatsApp is the fastest way to reach me.</p></div>
    <div class="contact__cta">
      <a class="btn btn--main" href="${L.whatsapp}">${I.chat}${C.cta.whatsapp}</a>
      <a class="btn btn--alt" href="${L.cv}">${I.down}${C.cta.cv}</a>
    </div>
    <ul class="contact__links">
      <li><a href="${L.linkedin}">${I.in}LinkedIn</a></li>
      <li><a href="${L.github}">${I.gh}GitHub</a></li>
      <li><a href="${L.email}">${I.mail}Email</a></li>
    </ul>
  </div>
  <footer class="foot"><p>Tiago Luiz Poli · São Paulo, Brazil</p><p>Built by hand, served from my own server.</p></footer>
</section>`;

// Language: header, hero and statuses (sections stay EN in the prototype).
const setLang = lang => {
  const src = lang === "pt" ? P : C;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-t]").forEach(el => { const v = el.dataset.t.split(".").reduce((o, k) => o && o[k], src); if (v) el.textContent = v; });
  document.querySelectorAll("[data-nav]").forEach(el => el.textContent = src.nav[el.dataset.nav]);
  document.querySelectorAll("[data-status]").forEach(el => el.textContent = statusText[lang][el.dataset.status]);
  document.querySelector("[data-stats]").innerHTML = statsText[lang];
  document.querySelector("[data-local]").textContent = lang === "pt" ? "em São Paulo" : "local time";
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
};
document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));

// Header + menu
const hdr = document.querySelector("[data-hdr]"), menu = document.querySelector("[data-menu]");
menu.onclick = () => menu.setAttribute("aria-expanded", hdr.classList.toggle("is-open"));
hdr.querySelectorAll(".hdr__nav a").forEach(a => a.addEventListener("click", () => { hdr.classList.remove("is-open"); menu.setAttribute("aria-expanded", false); }));
addEventListener("scroll", () => hdr.classList.toggle("is-scrolled", scrollY > 8), { passive: true });

// Clock
const clock = document.querySelector("[data-clock]");
const tick = () => clock.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date());
tick(); setInterval(tick, 20000);

// Reveals + hero entrance + count-up (content stays visible when motion is reduced).
if (!reduced) {
  document.documentElement.classList.add("motion");
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("loaded")));
  setTimeout(() => document.querySelectorAll("[data-count]").forEach(el => {
    const to = +el.dataset.count, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(2, -10 * k))).toLocaleString(document.documentElement.lang === "pt-BR" ? "pt-BR" : "en-US"); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), 900);
}

// --- Tilt physics: one spring per card, shared rAF loop ---
const spring = (x, k = 0.075, d = 0.8) => ({ x, v: 0, t: x, k, d, step() { this.v = (this.v + (this.t - this.x) * this.k) * this.d; this.x += this.v; } });
const card = document.querySelector("[data-card]"), shadow = document.querySelector("[data-shadow]"), stage = card.parentElement;
const POP = 56, PERSP = 1200, MAX = 14;
const hero = {
  rx: spring(reduced ? 0 : 24), ry: spring(reduced ? 0 : -20), y: spring(reduced ? 0 : 60, 0.06, 0.8),
  pz: spring(reduced ? POP : 0, 0.05, 0.78), hover: false, visible: true
};
hero.rx.t = 0; hero.ry.t = 0; hero.y.t = 0;
setTimeout(() => { hero.pz.t = POP; }, reduced ? 0 : 450); // the head lifts out after the card lands

const paintHero = () => {
  const rx = hero.rx.x, ry = hero.ry.x, pz = hero.pz.x;
  card.style.transform = `translateY(${hero.y.x}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  card.style.setProperty("--pz", `${pz}px`);
  card.style.setProperty("--ps", ((PERSP - pz) / PERSP).toFixed(4));
  card.style.setProperty("--sx", `${50 + ry * 3.2}%`);
  card.style.setProperty("--sy", `${42 - rx * 3.2}%`);
  card.style.setProperty("--dsx", `${(-ry * 0.9).toFixed(1)}px`);
  shadow.style.setProperty("--sw", `${card.offsetWidth * 0.92}px`);
  shadow.style.setProperty("--shx", `${(-ry * 2.2).toFixed(1)}px`);
  shadow.style.setProperty("--shs", (1 - Math.abs(rx) / 70 - hero.y.x / 400).toFixed(3));
};

const shots = [...document.querySelectorAll("[data-tilt]")].map(el => ({ el, rx: spring(0, 0.07, 0.8), ry: spring(0, 0.07, 0.8) }));

if (!reduced) {
  new IntersectionObserver(([e]) => { hero.visible = e.isIntersecting; }).observe(stage);
  if (fine) {
    const heroEl = document.getElementById("top");
    heroEl.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect(), nx = (e.clientX - (r.left + r.width / 2)) / (r.width * 1.1), ny = (e.clientY - (r.top + r.height / 2)) / (r.height * 1.1);
      const cx = Math.max(-1, Math.min(1, nx)), cy = Math.max(-1, Math.min(1, ny));
      hero.hover = true; hero.ry.t = cx * MAX; hero.rx.t = -cy * MAX;
    });
    heroEl.addEventListener("pointerleave", () => { hero.hover = false; hero.rx.t = 0; hero.ry.t = 0; });
    shots.forEach(s => {
      s.el.addEventListener("pointermove", e => { const r = s.el.getBoundingClientRect(); s.ry.t = ((e.clientX - r.left) / r.width - 0.5) * 9; s.rx.t = -((e.clientY - r.top) / r.height - 0.5) * 9; });
      s.el.addEventListener("pointerleave", () => { s.rx.t = 0; s.ry.t = 0; });
    });
  }
  const loop = now => {
    requestAnimationFrame(loop);
    if (hero.visible) {
      if (!hero.hover) { hero.ry.t = Math.sin(now / 2600) * 4.5; hero.rx.t = Math.cos(now / 3400) * 2.5; } // idle sway
      hero.rx.step(); hero.ry.step(); hero.y.step(); hero.pz.step();
      paintHero();
    }
    for (const s of shots) {
      s.rx.step(); s.ry.step();
      s.el.style.transform = `rotateX(${s.rx.x}deg) rotateY(${s.ry.x}deg)`;
      s.el.style.setProperty("--sx", `${50 + s.ry.x * 5}%`); s.el.style.setProperty("--sy", `${40 - s.rx.x * 5}%`);
    }
  };
  requestAnimationFrame(loop);
} else {
  paintHero();
}
