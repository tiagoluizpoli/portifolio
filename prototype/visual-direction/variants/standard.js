// PROTOTYPE variant: "Category standard". Vanilla, file:// safe.
(function () {
  const C = window.CONTENT, L = C.links;
  const fl = document.createElement("link");
  fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap";
  document.head.appendChild(fl);

  const P = {
    msg: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    up: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    img: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
    li: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>'
  };
  const ic = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const tag = s => s ? '<span class="sample">sample</span>' : "";

  const E = C.en, PT = C.pt;
  let lang = "en", first = true, menu = false;
  const t = () => lang === "pt" ? Object.assign({}, E, PT) : E;
  const fmt = n => n.toLocaleString("en-US");

  function render() {
    const d = t(), n = d.nav;
    const links = [["projects", n.projects], ["experience", n.experience], ["skills", n.skills], ["about", n.about], ["contact", n.contact]];
    const stLabel = k => (PT.statusLabels && lang === "pt" && PT.statusLabels[k]) || null;
    document.documentElement.lang = lang;
    document.getElementById("app").innerHTML = `
<a class="skip" href="#main">Skip to content</a>
<header class="hdr"><div class="wrap hdr-in">
  <a class="brand" href="#top">${esc(d.name)}</a>
  <nav class="nav ${menu ? "open" : ""}" id="nav" aria-label="Primary">
    ${links.map(l => `<a href="#${l[0]}">${esc(l[1])}</a>`).join("")}
  </nav>
  <div class="hdr-r">
    <div class="lang" role="group" aria-label="Language">
      <button data-l="en" aria-pressed="${lang === "en"}">EN</button><button data-l="pt" aria-pressed="${lang === "pt"}">PT</button>
    </div>
    <button class="burger" aria-label="Menu" aria-expanded="${menu}" aria-controls="nav">${ic(menu ? "x" : "menu", 22)}</button>
  </div>
</div></header>
<main id="main">
<section class="hero wrap" id="top">
  <div class="hero-txt">
    <h1>${esc(d.name)}</h1>
    <p class="role">${esc(d.role)}</p>
    <p class="pitch">${esc(d.pitch)}</p>
    <p class="loc">${ic("pin", 16)}${esc(d.location)}</p>
    <div class="ctas">
      <a class="btn primary" href="${L.whatsapp}">${ic("msg")}${esc(d.cta.whatsapp)}</a>
      <a class="btn" href="${L.cv}">${ic("dl")}${esc(d.cta.cv)}</a>
    </div>
  </div>
  <div class="photo" role="img" aria-label="Photo placeholder">${ic("user", 40)}<span>photo</span></div>
  <dl class="stats">
    ${E.stats.items.map((s, i) => `<div><dt>${esc(lang === "pt" ? PT.statLabels[i] : s.label)}${i === 0 ? tag(E.stats.sample) : ""}</dt>
      <dd>${s.value == null ? esc(s.text) : `<span class="count" data-to="${s.value}">${fmt(first ? 0 : s.value)}</span>`}</dd></div>`).join("")}
  </dl>
</section>

<section class="sec wrap" id="projects"><h2>${esc(E.projectsTitle)}</h2>
${E.projects.map(p => `<article class="proj">
  <div class="shots n${p.images}">${Array.from({ length: p.images }, (_, i) => `<div class="shot" role="img" aria-label="Screenshot placeholder ${i + 1}">${ic("img", 28)}<span>screenshot ${i + 1}</span></div>`).join("")}</div>
  <div class="proj-body">
    <div class="proj-top"><h3>${esc(p.title)}</h3>
      <span class="badge ${p.status}">${esc(stLabel(p.status) || p.statusLabel)}</span>${tag(p.sample)}</div>
    ${p.now ? `<p class="now">${esc(p.now)}</p>` : ""}
    <p>${esc(p.summary)}</p>
    <p class="meta">${esc(p.role)}</p>
    <ul class="tags">${p.stack.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
    <a class="more" href="${p.link}">Learn more ${ic("up", 16)}</a>
  </div></article>`).join("")}
</section>

<section class="sec wrap" id="experience"><h2>${esc(E.experienceTitle)}</h2>
<ol class="tl">${E.experience.map(x => `<li>
  <p class="when">${esc(x.period)}</p>
  <div><h3>${esc(x.role)} <span class="at">at ${esc(x.company)}</span></h3>
  <p class="meta">${esc(x.place)}</p>
  <ul class="bul">${x.bullets.slice(0, 2).map(b => `<li>${esc(b)}</li>`).join("")}</ul></div></li>`).join("")}</ol>
</section>

<section class="sec wrap" id="skills"><h2>${esc(E.skillsTitle)}</h2>
<div class="skills">${E.skills.map(g => `<div><h3>${esc(g.group)}</h3><ul class="tags">${g.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}</div>
</section>

<section class="sec wrap" id="about"><h2>${esc(E.aboutTitle)}</h2>
<div class="about"><p>${esc(E.about)}</p>
<div class="edu"><h3>Education</h3><p><strong>${esc(E.education.school)}</strong></p><p>${esc(E.education.degree)}</p><p class="meta">${esc(E.education.period)}</p></div></div>
</section>
</main>
<footer class="sec wrap foot" id="contact"><h2>${esc(E.contactTitle)}</h2>
<ul class="clinks">
  <li><a class="btn primary" href="${L.whatsapp}">${ic("msg")}${esc(E.contact.whatsapp)}</a></li>
  <li><a href="${L.linkedin}">${ic("li")}${esc(E.contact.linkedin)}</a></li>
  <li><a href="${L.email}">${ic("mail")}${esc(E.contact.email)}</a></li>
  <li><a href="${L.github}">${ic("github")}${esc(E.contact.github)}</a></li>
  <li><a href="${L.cv}">${ic("dl")}${esc(E.contact.cv)}</a></li>
</ul>
<p class="meta">&copy; ${esc(E.name)}</p></footer>`;

    document.querySelectorAll(".lang button").forEach(b => b.onclick = () => { lang = b.dataset.l; render(); });
    const bg = document.querySelector(".burger");
    bg.onclick = () => { menu = !menu; render(); document.querySelector(".burger").focus(); };
    document.querySelectorAll(".nav a").forEach(a => a.onclick = () => { if (menu) { menu = false; render(); } });
    if (first) { first = false; countUp(); }
  }

  function countUp() {
    const els = document.querySelectorAll(".count");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(e => e.textContent = fmt(+e.dataset.to)); return; }
    const t0 = performance.now(), dur = 1100;
    (function tick(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      els.forEach(el => { el.textContent = fmt(Math.round(el.dataset.to * e)); });
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }
  render();
})();
