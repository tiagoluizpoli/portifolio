// PROTOTYPE shared page: every section except the Hero centrepiece, which heroes/<variant>.js mounts.
(function () {
  window.PROTOTYPE_VARIANTS = [["object", "3D object"], ["field", "Living field"], ["type", "Kinetic type"]];
  const params = new URLSearchParams(location.search);
  const variant = window.PROTOTYPE_VARIANTS.some(v => v[0] === params.get("variant")) ? params.get("variant") : "object";
  window.PROTOTYPE_VARIANT = variant;
  const defaultTheme = { object: "light", field: "dark", type: "light" }[variant];
  document.documentElement.dataset.theme = params.get("theme") || defaultTheme;
  document.documentElement.dataset.hero = variant;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.PROTOTYPE_REDUCED = reduced;

  const C = window.CONTENT.en, P = window.CONTENT.pt, L = window.CONTENT.links;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = (d, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    arrow: svg('<path d="M7 7h10v10"/><path d="M7 17 17 7"/>'),
    down: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'),
    chat: svg('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
    mail: svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
    pin: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    gh: svg('<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>'),
    in: svg('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    menu: svg('<path d="M4 8h16M4 16h16"/>')
  };
  const sample = `<span class="sample" title="Placeholder data">sample</span>`;
  const statusDot = s => `<span class="status status--${s}"><span class="status__dot"></span><span data-status="${s}"></span></span>`;
  const fmt = n => n.toLocaleString("en-US");

  const header = `
  <header class="hdr" data-hdr>
    <a class="hdr__name" href="#top">Tiago Luiz Poli</a>
    <nav class="hdr__nav" aria-label="Sections">
      ${["projects", "experience", "skills", "about", "contact"].map(k => `<a href="#${k}" data-nav="${k}">${C.nav[k]}</a>`).join("")}
    </nav>
    <div class="hdr__tools">
      <div class="seg" role="group" aria-label="Language"><button aria-pressed="true" data-lang="en">EN</button><button aria-pressed="false" data-lang="pt">PT</button></div>
      <button class="iconbtn" data-theme-toggle aria-label="Toggle light/dark">${I.sun}${I.moon}</button>
      <button class="iconbtn hdr__menu" data-menu aria-label="Menu" aria-expanded="false">${I.menu}</button>
    </div>
  </header>`;

  const hero = `
  <section class="hero" id="top">
    <div class="hero__stage" id="hero-stage" aria-hidden="true"></div>
    <div class="hero__copy">
      <div class="hero__id">
        <img class="photo" src="photo.jpg" alt="Tiago Luiz Poli" width="56" height="56">
        <p class="hero__loc">${I.pin}<span data-t="location">${C.location}</span></p>
      </div>
      <h1 class="hero__name" data-hero-name>Tiago Luiz Poli</h1>
      <p class="hero__role" data-t="role">${C.role}</p>
      <p class="hero__pitch" data-t="pitch" data-hero-pitch>${C.pitch}</p>
      <div class="hero__cta">
        <a class="btn btn--primary" data-magnetic href="${L.whatsapp}">${I.chat}<span data-t="cta.whatsapp">${C.cta.whatsapp}</span></a>
        <a class="btn btn--ghost" data-magnetic href="${L.cv}">${I.down}<span data-t="cta.cv">${C.cta.cv}</span></a>
      </div>
      <dl class="stats" data-stats>
        ${C.stats.items.map((s, i) => `<div class="stat"><dt data-statlabel="${i}">${s.label}</dt><dd>${s.value == null ? esc(s.text) : `<span data-count="${s.value}">${fmt(s.value)}</span>`}</dd></div>`).join("")}
        <div class="stat stat--src"><a href="${L.github}">${I.gh}github.com/tiagoluizpoli</a>${sample}</div>
      </dl>
    </div>
  </section>`;

  const projects = `
  <section class="sec" id="projects">
    <div class="sec__head" data-reveal><h2>${C.projectsTitle}</h2><p class="sec__count">${C.projects.length} live or on the way</p></div>
    <div class="stack">
      ${C.projects.map((p, i) => `
      <article class="proj" data-proj style="--i:${i}">
        <div class="proj__body">
          <div class="proj__meta">${statusDot(p.status)}${p.sample ? sample : ""}</div>
          <h3 class="proj__title">${esc(p.title)}</h3>
          <p class="proj__sum">${esc(p.summary)}</p>
          ${p.now ? `<p class="proj__now"><span>Now</span>${esc(p.now.replace(/^Now:\s*/, ""))}</p>` : ""}
          <dl class="proj__facts"><div><dt>Role</dt><dd>${esc(p.role)}</dd></div><div><dt>Stack</dt><dd>${p.stack.map(esc).join(" · ")}</dd></div></dl>
          <a class="link" href="${p.link}">Learn more ${I.arrow}</a>
        </div>
        <div class="proj__media">
          ${Array.from({ length: Math.min(p.images, 2) }, (_, k) => `
          <figure class="shot shot--${k}"><div class="shot__bar"><i></i><i></i><i></i><span>${esc(p.title.toLowerCase().replace(/\s+/g, ""))}.app</span></div><div class="shot__img"><span>screenshot ${k + 1}</span></div></figure>`).join("")}
        </div>
      </article>`).join("")}
    </div>
  </section>`;

  const experience = `
  <section class="sec" id="experience">
    <div class="sec__head" data-reveal><h2>${C.experienceTitle}</h2><p class="sec__count">2015 – today</p></div>
    <ol class="xp">
      ${C.experience.map(x => `
      <li class="xp__row" data-reveal>
        <p class="xp__when">${esc(x.period)}</p>
        <div class="xp__who"><h3>${esc(x.company)}</h3><p>${esc(x.role)} · ${esc(x.place)}</p></div>
        <ul class="xp__what">${x.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
      </li>`).join("")}
    </ol>
  </section>`;

  const skills = `
  <section class="sec" id="skills">
    <div class="sec__head" data-reveal><h2>${C.skillsTitle}</h2></div>
    <div class="skills">
      ${C.skills.map(g => `<div class="skills__grp" data-reveal><h3>${esc(g.group)}</h3><ul>${g.items.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>`).join("")}
    </div>
  </section>`;

  const about = `
  <section class="sec sec--about" id="about">
    <div class="sec__head" data-reveal><h2>${C.aboutTitle}</h2></div>
    <p class="about__text" data-scrub>${C.about.split(" ").map(w => `<span>${esc(w)}</span>`).join(" ")}</p>
    <div class="edu" data-reveal><p class="edu__k">Education</p><p><strong>${esc(C.education.school)}</strong> · ${esc(C.education.degree)}</p><p class="edu__when">${esc(C.education.period)}</p></div>
  </section>`;

  const contact = `
  <section class="contact" id="contact">
    <h2 class="contact__big" data-reveal>${C.contactTitle}.</h2>
    <p class="contact__lead" data-reveal>Open to senior roles, remote. The fastest way to reach me is WhatsApp.</p>
    <div class="contact__cta" data-reveal>
      <a class="btn btn--primary btn--xl" data-magnetic href="${L.whatsapp}">${I.chat}${C.cta.whatsapp}</a>
      <a class="btn btn--ghost btn--xl" data-magnetic href="${L.cv}">${I.down}${C.cta.cv}</a>
    </div>
    <ul class="contact__links">
      <li><a href="${L.linkedin}">${I.in}LinkedIn</a></li>
      <li><a href="${L.github}">${I.gh}GitHub</a></li>
      <li><a href="${L.email}">${I.mail}Email</a></li>
    </ul>
    <footer class="foot">
      <p>São Paulo · <span data-clock>--:--</span> local time</p>
      <p>Built by hand. Served from my own server.</p>
      <p>© 2026 Tiago Luiz Poli</p>
    </footer>
  </section>`;

  document.getElementById("app").innerHTML = header + `<main>${hero}${projects}${experience}${skills}${about}</main>` + contact;
  document.title = `PROTOTYPE · ${window.PROTOTYPE_VARIANTS.find(v => v[0] === variant)[1]}`;

  // Language: header + hero + statuses (sections stay EN in the prototype).
  const statusText = { en: { "live-evolving": "In production · Actively developed", live: "In production", soon: "Coming soon" }, pt: P.statusLabels };
  const setLang = lang => {
    const src = lang === "pt" ? P : C;
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.querySelectorAll("[data-t]").forEach(el => { const v = el.dataset.t.split(".").reduce((o, k) => o && o[k], src); if (v) el.textContent = v; });
    document.querySelectorAll("[data-nav]").forEach(el => el.textContent = src.nav[el.dataset.nav]);
    document.querySelectorAll("[data-statlabel]").forEach(el => el.textContent = lang === "pt" ? P.statLabels[+el.dataset.statlabel] : C.stats.items[+el.dataset.statlabel].label);
    document.querySelectorAll("[data-status]").forEach(el => el.textContent = statusText[lang][el.dataset.status]);
    document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  };
  document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));
  setLang("en");

  // Theme toggle keeps ?theme in the URL so reloads stick.
  document.querySelector("[data-theme-toggle]").onclick = () => {
    const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    params.set("theme", t); history.replaceState(null, "", "?" + params);
    document.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  };

  // Mobile menu
  const menuBtn = document.querySelector("[data-menu]"), hdr = document.querySelector("[data-hdr]");
  menuBtn.onclick = () => { const o = hdr.classList.toggle("is-open"); menuBtn.setAttribute("aria-expanded", o); };
  hdr.querySelectorAll(".hdr__nav a").forEach(a => a.addEventListener("click", () => { hdr.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", false); }));
  addEventListener("scroll", () => hdr.classList.toggle("is-scrolled", scrollY > 8), { passive: true });

  // Reveals: visible by default; JS adds the pre-state only when motion is allowed.
  if (!reduced) {
    document.documentElement.classList.add("motion");
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
  }

  // Count-up for hero stats (shared; heroes may also read window.PROTOTYPE_STATS).
  window.PROTOTYPE_STATS = C.stats.items;
  const countUp = () => document.querySelectorAll("[data-count]").forEach(el => {
    const to = +el.dataset.count; if (reduced) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 1600;
    const tick = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(2, -10 * k); el.textContent = fmt(Math.round(to * (k === 1 ? 1 : e))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  setTimeout(countUp, 500);

  // Project stack: the card underneath scales back as the next one slides over it.
  const cards = [...document.querySelectorAll("[data-proj]")];
  // About: words light up as the paragraph scrolls through the viewport.
  const words = [...document.querySelectorAll("[data-scrub] span")];
  const scrub = document.querySelector("[data-scrub]");
  const onScroll = () => {
    if (reduced) return;
    cards.forEach((c, i) => {
      const next = cards[i + 1]; if (!next) return;
      const r = next.getBoundingClientRect(), k = Math.min(1, Math.max(0, 1 - (r.top - innerHeight * 0.12) / (innerHeight * 0.75)));
      c.style.setProperty("--push", k.toFixed(3));
    });
    const r = scrub.getBoundingClientRect(), k = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
    const lit = Math.round(k * words.length);
    words.forEach((w, i) => w.classList.toggle("lit", i < lit));
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (reduced) words.forEach(w => w.classList.add("lit"));

  // Magnetic buttons: pull toward the pointer within their own box, spring back on leave.
  if (!reduced && matchMedia("(pointer:fine)").matches) document.querySelectorAll("[data-magnetic]").forEach(b => {
    b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`; });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });

  // São Paulo clock
  const clock = document.querySelector("[data-clock]");
  const tickClock = () => clock.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date());
  tickClock(); setInterval(tickClock, 20000);

  import(`./heroes/${variant}.js`).catch(e => console.error("hero failed", e));
})();
