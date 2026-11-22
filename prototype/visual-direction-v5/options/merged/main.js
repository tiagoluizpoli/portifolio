// PROTOTYPE option J: G's giant name behind him + I's tilting photo card, head breaking out over its top edge.
const C = window.CONTENT.en, P = window.CONTENT.pt, L = window.CONTENT.links;
const reduced = window.PROTOTYPE_REDUCED;
const fine = matchMedia("(pointer: fine)").matches;
document.head.insertAdjacentHTML("beforeend",
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap">');

// Prototype-only palette switch (?palette=ink|slate|forest).
const PALETTES = ["ink", "slate", "forest"];
const params = new URLSearchParams(location.search);
const setPalette = p => {
  document.documentElement.dataset.palette = p;
  params.set("palette", p); history.replaceState(null, "", "?" + params);
  document.querySelectorAll("[data-pal]").forEach(b => b.setAttribute("aria-pressed", b.dataset.pal === p));
};
document.documentElement.dataset.palette = PALETTES.includes(params.get("palette")) ? params.get("palette") : "ink";

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const svg = d => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  arrow: svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  ne: svg('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>'),
  down: svg('<path d="M12 4v12"/><path d="m6 11 6 6 6-6"/><path d="M5 20h14"/>'),
  chat: svg('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
  menu: svg('<path d="M4 9h16M4 15h16"/>')
};
const sample = '<span class="sample" title="Placeholder data">sample</span>';
const statusText = { en: { "live-evolving": "In production · Actively developed", live: "In production", soon: "Coming soon" }, pt: P.statusLabels };
const stats = C.stats.items;
const fmt = n => n.toLocaleString("en-US");
const navKeys = ["projects", "experience", "skills", "about", "contact"];
const langs = (sep) => stats[2].text.replace(/ · /g, ", ").replace(/, (?=[^,]*$)/, sep);
const statsSentence = {
  en: n => `Over the last year: <b data-count="${stats[0].value}">${n ? fmt(stats[0].value) : 0}</b> contributions across <b>${stats[1].value}</b> public repos, mostly <b>${langs(" and ")}</b>.`,
  pt: n => `No último ano: <b data-count="${stats[0].value}">${n ? fmt(stats[0].value) : 0}</b> contribuições em <b>${stats[1].value}</b> repositórios públicos, principalmente <b>${langs(" e ")}</b>.`
};

document.getElementById("app").innerHTML = `
<header class="hdr" data-hdr>
  <a class="hdr__name" href="#top">Tiago Luiz Poli</a>
  <nav class="hdr__nav" aria-label="Sections">${navKeys.map(k => `<a href="#${k}" data-nav="${k}">${C.nav[k]}</a>`).join("")}</nav>
  <div class="lang" role="group" aria-label="Language"><button data-lang="en" aria-pressed="true">EN</button><button data-lang="pt" aria-pressed="false">PT</button></div>
  <button class="hdr__menu" data-menu aria-label="Menu" aria-expanded="false">${I.menu}</button>
</header>

<main>
<section class="hero" id="top" data-hero>
  <div class="hero__field">
    <div class="stage" aria-hidden="true">
      <p class="bigname" data-name><span>Tiago</span> <span>Luiz Poli</span></p>
      <div class="cardwrap">
        <div class="card" data-card>
          <div class="card__face"><img class="card__img" src="options/merged/plate.jpg" alt=""><div class="card__sheen"></div><div class="card__edge"></div></div>
          <div class="card__pop"><img src="cutout.png" alt=""></div>
        </div>
        <div class="shadow" data-shadow></div>
      </div>
    </div>
    <div class="hero__text">
      <h1 class="hero__h1"><span class="vh">Tiago Luiz Poli, </span><span data-t="role">${C.role}</span></h1>
      <p class="hero__pitch" data-t="pitch">${C.pitch}</p>
      <p class="hero__loc"><span data-t="location">${C.location}</span><span class="hero__time"><b data-clock>--:--</b> <span data-local>local time</span></span></p>
      <div class="hero__cta">
        <a class="btn btn--main" href="${L.whatsapp}">${I.chat}<span data-t="cta.whatsapp">${C.cta.whatsapp}</span></a>
        <a class="btn btn--soft" href="${L.cv}">${I.down}<span data-t="cta.cv">${C.cta.cv}</span></a>
      </div>
      <p class="hero__stats"><span data-stats>${statsSentence.en(reduced)}</span> ${sample}</p>
    </div>
  </div>
</section>

<section class="sec" id="projects">
  <h2 class="sec__h" data-reveal>${C.projectsTitle}</h2>
  <div class="projects">
    ${C.projects.map(p => `
    <article class="proj" data-reveal>
      <div class="proj__text">
        <p class="proj__status proj__status--${p.status}"><span class="dot"></span><span data-status="${p.status}">${statusText.en[p.status]}</span>${p.sample ? " " + sample : ""}</p>
        <h3 class="proj__title">${esc(p.title)}</h3>
        <p class="proj__sum">${esc(p.summary)}</p>
        ${p.now ? `<p class="proj__now"><b>Now</b> ${esc(p.now.replace(/^Now:\s*/, ""))}</p>` : ""}
        <p class="proj__meta">${esc(p.role)} · ${p.stack.map(esc).join(", ")}</p>
        <a class="more" href="${p.link}">Learn more ${I.ne}</a>
      </div>
      <div class="proj__strip">
        ${Array.from({ length: Math.min(3, Math.max(2, p.images)) }, (_, k) => `<figure class="shot"><span>${esc(p.title)} · ${k + 1}</span></figure>`).join("")}
      </div>
    </article>`).join("")}
  </div>
</section>

<section class="sec" id="experience">
  <h2 class="sec__h" data-reveal>${C.experienceTitle}</h2>
  <ol class="xp">
    ${C.experience.map(x => `
    <li class="xp__row" data-reveal>
      <div class="xp__head"><h3>${esc(x.company)}</h3><p>${esc(x.role)}</p><p class="xp__when">${esc(x.period)} · ${esc(x.place)}</p></div>
      <ul class="xp__what">${x.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
    </li>`).join("")}
  </ol>
</section>

<section class="sec" id="skills">
  <h2 class="sec__h" data-reveal>${C.skillsTitle}</h2>
  <div class="skills">
    ${C.skills.map(g => `<div class="skills__row" data-reveal><h3>${esc(g.group)}</h3><p>${g.items.map(esc).join('<span class="sep" aria-hidden="true"></span>')}</p></div>`).join("")}
  </div>
</section>

<section class="sec about" id="about">
  <h2 class="sec__h" data-reveal>${C.aboutTitle}</h2>
  <div class="about__grid">
    <p class="about__text" data-reveal>${esc(C.about)}</p>
    <div class="about__edu" data-reveal>
      <h3>Education</h3>
      <p class="about__school">${esc(C.education.school)}</p>
      <p>${esc(C.education.degree)}</p>
      <p class="about__when">${esc(C.education.period)}</p>
    </div>
  </div>
</section>
</main>

<footer class="contact" id="contact">
  <div class="contact__field">
    <div class="contact__head">
      <h2 class="contact__h" data-reveal>Get in touch</h2>
      <p class="contact__lead" data-reveal>Open to senior roles, remote. WhatsApp is the fastest way to reach me.</p>
    </div>
    <ul class="ways">
      <li><a href="${L.whatsapp}"><span>WhatsApp</span><em>Fastest reply</em>${I.arrow}</a></li>
      <li><a href="${L.linkedin}"><span>LinkedIn</span><em>tiago-seuaciuc</em>${I.arrow}</a></li>
      <li><a href="${L.email}"><span>Email</span><em>Write me anytime</em>${I.arrow}</a></li>
      <li><a href="${L.github}"><span>GitHub</span><em>tiagoluizpoli</em>${I.arrow}</a></li>
      <li><a href="${L.cv}"><span>CV</span><em>PDF download</em>${I.arrow}</a></li>
    </ul>
    <div class="foot"><p>São Paulo · <span data-clock>--:--</span></p><p>© 2026 Tiago Luiz Poli</p></div>
  </div>
</footer>

<div class="palx" role="group" aria-label="Prototype palette">${PALETTES.map(p => `<button data-pal="${p}">${p}</button>`).join("")}</div>`;

document.querySelectorAll("[data-pal]").forEach(b => b.onclick = () => setPalette(b.dataset.pal));
setPalette(document.documentElement.dataset.palette);

// Language: header, hero, statuses, stats sentence.
const setLang = l => {
  const src = l === "pt" ? P : C;
  document.documentElement.lang = l === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-t]").forEach(el => { const v = el.dataset.t.split(".").reduce((o, k) => o && o[k], src); if (v) el.textContent = v; });
  document.querySelectorAll("[data-nav]").forEach(el => el.textContent = src.nav[el.dataset.nav]);
  document.querySelectorAll("[data-status]").forEach(el => el.textContent = statusText[l][el.dataset.status]);
  document.querySelector("[data-stats]").innerHTML = statsSentence[l](true);
  document.querySelector("[data-local]").textContent = l === "pt" ? "em São Paulo" : "local time";
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === l));
};
document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));

// Header + mobile menu
const hdr = document.querySelector("[data-hdr]"), menu = document.querySelector("[data-menu]");
menu.onclick = () => menu.setAttribute("aria-expanded", hdr.classList.toggle("is-open"));
hdr.querySelectorAll(".hdr__nav a").forEach(a => a.addEventListener("click", () => { hdr.classList.remove("is-open"); menu.setAttribute("aria-expanded", false); }));
addEventListener("scroll", () => hdr.classList.toggle("is-scrolled", scrollY > 24), { passive: true });

// Clocks
const tick = () => { const t = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date()); document.querySelectorAll("[data-clock]").forEach(c => c.textContent = t); };
tick(); setInterval(tick, 20000);

// --- Card physics (from I): springs for tilt, drop-in and the head popping out ---
const spring = (x, k = 0.075, d = 0.8) => ({ x, v: 0, t: x, k, d, step() { this.v = (this.v + (this.t - this.x) * this.k) * this.d; this.x += this.v; } });
const card = document.querySelector("[data-card]"), shadow = document.querySelector("[data-shadow]");
const nameEl = document.querySelector("[data-name]");
const POP = 56, PERSP = 1200, MAX = 13;
const s = {
  rx: spring(reduced ? 0 : 22), ry: spring(reduced ? 0 : -18), y: spring(reduced ? 0 : 70, 0.06, 0.8),
  pz: spring(reduced ? POP : 0, 0.05, 0.78), nx: spring(0, 0.06, 0.82), ny: spring(0, 0.06, 0.82), hover: false, visible: true
};
s.rx.t = s.ry.t = s.y.t = 0;

const paint = () => {
  const rx = s.rx.x, ry = s.ry.x, pz = s.pz.x;
  card.style.transform = `translateY(${s.y.x}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  card.style.setProperty("--pz", `${pz}px`);
  card.style.setProperty("--ps", ((PERSP - pz) / PERSP).toFixed(4));
  card.style.setProperty("--sx", `${50 + ry * 3.2}%`);
  card.style.setProperty("--sy", `${42 - rx * 3.2}%`);
  card.style.setProperty("--dsx", `${(-ry * 0.9).toFixed(1)}px`);
  shadow.style.setProperty("--shx", `${(-ry * 2.2).toFixed(1)}px`);
  shadow.style.setProperty("--shs", (1 - Math.abs(rx) / 70 - s.y.x / 400).toFixed(3));
  // the name sits deeper than the card, so it drifts the other way
  nameEl.style.translate = `${(-s.nx.x * 22).toFixed(1)}px ${(-s.ny.x * 12).toFixed(1)}px`;
};

if (!reduced) {
  const root = document.documentElement;
  root.classList.add("motion");
  const heroEl = document.querySelector("[data-hero]");
  const me = document.querySelector(".card__pop img");
  const start = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    heroEl.classList.add("is-in");
    setTimeout(() => { s.pz.t = POP; }, 650); // head lifts out once the card has landed
  }));
  me.decode ? me.decode().then(start, start) : start();

  setTimeout(() => {
    const el = document.querySelector("[data-count]"); if (!el) return;
    const to = +el.dataset.count, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(2, -10 * k); el.textContent = fmt(Math.round(to * (k === 1 ? 1 : e))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, 1100);

  new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; }).observe(heroEl);
  if (fine) {
    heroEl.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const cx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 1.2)));
      const cy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.2)));
      s.hover = true; s.ry.t = cx * MAX; s.rx.t = -cy * MAX;
      const h = heroEl.getBoundingClientRect();
      s.nx.t = (e.clientX - h.left) / h.width - 0.5; s.ny.t = (e.clientY - h.top) / h.height - 0.5;
    });
    heroEl.addEventListener("pointerleave", () => { s.hover = false; s.rx.t = s.ry.t = s.nx.t = s.ny.t = 0; });
  }
  const loop = now => {
    requestAnimationFrame(loop);
    if (!s.visible) return;
    if (!s.hover) { s.ry.t = Math.sin(now / 2600) * 4; s.rx.t = Math.cos(now / 3400) * 2.2; } // idle sway
    for (const k of ["rx", "ry", "y", "pz", "nx", "ny"]) s[k].step();
    paint();
  };
  requestAnimationFrame(loop);

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
} else {
  paint();
}
