// PROTOTYPE option G · Behind the name: giant name sits behind the cut-out figure; layered mouse parallax.
const C = window.CONTENT.en, P = window.CONTENT.pt, L = window.CONTENT.links;
const reduced = window.PROTOTYPE_REDUCED;
document.head.insertAdjacentHTML("beforeend",
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap">');

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
const statusText = {
  en: { "live-evolving": "In production · Actively developed", live: "In production", soon: "Coming soon" },
  pt: P.statusLabels
};
const stats = C.stats.items;
const fmt = n => n.toLocaleString("en-US");
const navKeys = ["projects", "experience", "skills", "about", "contact"];

const statsSentence = {
  en: n => `Over the last year: <b data-count="${stats[0].value}">${n ? fmt(stats[0].value) : 0}</b> contributions across <b>${stats[1].value}</b> public repos, mostly <b>${stats[2].text.replace(/ · /g, ", ").replace(/, (?=[^,]*$)/, " and ")}</b>.`,
  pt: n => `No último ano: <b data-count="${stats[0].value}">${n ? fmt(stats[0].value) : 0}</b> contribuições em <b>${stats[1].value}</b> repositórios públicos, principalmente <b>${stats[2].text.replace(/ · /g, ", ").replace(/, (?=[^,]*$)/, " e ")}</b>.`
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
      <div class="layer layer--sun" data-depth="0.25"><div class="sun"></div></div>
      <div class="layer layer--name" data-depth="0.55"><p class="bigname"><span>Tiago</span> <span>Luiz Poli</span></p></div>
      <div class="layer layer--me" data-depth="1"><img class="me" src="cutout.png" alt="" width="400" height="400"></div>
    </div>
    <div class="hero__text">
      <h1 class="hero__h1"><span class="vh">Tiago Luiz Poli, </span><span data-t="role">${C.role}</span></h1>
      <p class="hero__pitch" data-t="pitch">${C.pitch}</p>
      <p class="hero__loc" data-t="location">${C.location}</p>
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
    ${C.projects.map((p, i) => `
    <article class="proj ${i % 2 ? "proj--flip" : ""}" data-reveal>
      <div class="proj__text">
        <p class="proj__status proj__status--${p.status}"><span class="dot"></span><span data-status="${p.status}">${statusText.en[p.status]}</span>${p.sample ? " " + sample : ""}</p>
        <h3 class="proj__title">${esc(p.title)}</h3>
        <p class="proj__sum">${esc(p.summary)}</p>
        ${p.now ? `<p class="proj__now"><b>Now</b> ${esc(p.now.replace(/^Now:\s*/, ""))}</p>` : ""}
        <p class="proj__meta">${esc(p.role)}</p>
        <ul class="proj__stack">${p.stack.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
        <a class="more" href="${p.link}">Learn more ${I.ne}</a>
      </div>
      <div class="proj__media">
        ${Array.from({ length: Math.min(p.images, 2) }, (_, k) => `<figure class="shot shot--${k}"><span>${esc(p.title)} · screenshot ${k + 1}</span></figure>`).join("")}
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
</footer>`;

// Language: header, hero, statuses, stats sentence.
let lang = "en";
const setLang = l => {
  lang = l;
  const src = l === "pt" ? P : C;
  document.documentElement.lang = l === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-t]").forEach(el => { const v = el.dataset.t.split(".").reduce((o, k) => o && o[k], src); if (v) el.textContent = v; });
  document.querySelectorAll("[data-nav]").forEach(el => el.textContent = src.nav[el.dataset.nav]);
  document.querySelectorAll("[data-status]").forEach(el => el.textContent = statusText[l][el.dataset.status]);
  document.querySelector("[data-stats]").innerHTML = statsSentence[l](true);
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === l));
};
document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));

// Header + mobile menu
const hdr = document.querySelector("[data-hdr]"), menu = document.querySelector("[data-menu]");
menu.onclick = () => menu.setAttribute("aria-expanded", hdr.classList.toggle("is-open"));
hdr.querySelectorAll(".hdr__nav a").forEach(a => a.addEventListener("click", () => { hdr.classList.remove("is-open"); menu.setAttribute("aria-expanded", false); }));
addEventListener("scroll", () => hdr.classList.toggle("is-scrolled", scrollY > 24), { passive: true });

// Clock
const clock = document.querySelector("[data-clock]");
const tick = () => clock.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date());
tick(); setInterval(tick, 20000);

if (!reduced) {
  const root = document.documentElement;
  root.classList.add("motion");
  // Load moment: the name rises from behind the shoulders once the cut-out is decoded.
  const me = document.querySelector(".me");
  const start = () => requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector("[data-hero]").classList.add("is-in")));
  me.decode ? me.decode().then(start, start) : start();

  // Count-up inside the stats sentence.
  setTimeout(() => {
    const el = document.querySelector("[data-count]"); if (!el) return;
    const to = +el.dataset.count, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(2, -10 * k); el.textContent = fmt(Math.round(to * (k === 1 ? 1 : e))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, 900);

  // Layered parallax: each layer drifts by its depth; the stage tilts a few degrees.
  if (matchMedia("(pointer:fine)").matches) {
    const hero = document.querySelector("[data-hero]");
    const stage = hero.querySelector(".stage");
    const layers = [...hero.querySelectorAll("[data-depth]")].map(el => ({ el, d: +el.dataset.depth }));
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.07; y += (ty - y) * 0.07;
      layers.forEach(({ el, d }) => el.style.transform = `translate3d(${x * d * 26}px, ${y * d * 16}px, 0)`);
      stage.style.transform = `rotateY(${x * 2.2}deg) rotateX(${-y * 1.6}deg)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener("pointerleave", () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  // Reveals
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
}
