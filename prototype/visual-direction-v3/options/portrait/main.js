// PROTOTYPE option D · Portrait: editorial spread led by the real photo; palette taken from his room.
const C = window.CONTENT.en, P = window.CONTENT.pt, L = window.CONTENT.links;
const reduced = window.PROTOTYPE_REDUCED;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sample = `<span class="sample">sample</span>`;
const fmt = n => n.toLocaleString("en-US");
const [contrib, repos, langs] = C.stats.items;
const statusText = { en: { "live-evolving": "In production · Actively developed", live: "In production", soon: "Coming soon" }, pt: P.statusLabels };
const note = {
  en: `Over the last year: <b data-count="${contrib.value}">${fmt(contrib.value)}</b> contributions on GitHub, across <b>${repos.value}</b> public repositories, mostly in ${esc(langs.text.replace(/ · /g, ", ").replace(/, (?=[^,]*$)/, " and "))}.`,
  pt: `No último ano: <b data-count="${contrib.value}">${fmt(contrib.value)}</b> contribuições no GitHub, em <b>${repos.value}</b> repositórios públicos, principalmente ${esc(langs.text.replace(/ · /g, ", ").replace(/, (?=[^,]*$)/, " e "))}.`
};

const app = document.getElementById("app");
app.innerHTML = `
<header class="hdr" data-hdr>
  <a class="hdr__mark" href="#top">Tiago Luiz Poli</a>
  <nav class="hdr__nav" aria-label="Sections">
    ${["projects", "experience", "skills", "about", "contact"].map(k => `<a href="#${k}" data-nav="${k}">${C.nav[k]}</a>`).join("")}
  </nav>
  <div class="lang" role="group" aria-label="Language"><button data-lang="en" aria-pressed="true">EN</button> / <button data-lang="pt" aria-pressed="false">PT</button></div>
  <button class="hdr__menu" data-menu aria-expanded="false">Menu</button>
</header>
<main>
  <section class="hero" id="top">
    <figure class="hero__photo">
      <img src="photo.jpg" alt="Portrait of Tiago Luiz Poli at home, a guitar on the wall behind him." fetchpriority="high">
      <figcaption data-t="location">${C.location}</figcaption>
    </figure>
    <div class="hero__wall">
      <h1 class="hero__name"><span>Tiago</span><span>Luiz Poli</span></h1>
      <p class="hero__role" data-t="role">${C.role}</p>
      <p class="hero__pitch" data-t="pitch">${C.pitch}</p>
      <div class="hero__cta">
        <a class="cta" href="${L.whatsapp}"><span data-t="cta.whatsapp">${C.cta.whatsapp}</span><span class="arr" aria-hidden="true">→</span></a>
        <a class="cta cta--minor" href="${L.cv}"><span data-t="cta.cv">${C.cta.cv}</span> (PDF)</a>
      </div>
      <p class="hero__note"><span data-note>${note.en}</span> <a href="${L.github}">github.com/tiagoluizpoli</a>${sample}</p>
    </div>
  </section>

  <section class="sec" id="projects">
    <div class="sec__head"><h2>${C.projectsTitle}</h2></div>
    <div class="sec__body work">
      ${C.projects.map((p, i) => `
      <article class="proj">
        <figure class="proj__fig">
          <div class="frame${i % 2 ? " frame--b" : ""}"><span>${esc(p.title)}: screenshot to come</span></div>
          ${p.images > 1 ? `<div class="frame frame--b"><span>Detail</span></div>` : ""}
          <figcaption>Fig. ${i + 1}. ${esc(p.title)}${p.sample ? " (placeholder images and text)" : ""}</figcaption>
        </figure>
        <div>
          <p class="status${p.status === "soon" ? " status--soon" : ""}" data-status="${p.status}"></p>
          <h3 class="proj__title">${esc(p.title)}${p.sample ? sample : ""}</h3>
          <p class="proj__sum">${esc(p.summary)}</p>
          ${p.now ? `<p class="proj__now">${esc(p.now)}</p>` : ""}
          <dl class="proj__facts"><dt>Role</dt> <dd>${esc(p.role)}</dd><dt>Stack</dt> <dd>${p.stack.map(esc).join(", ")}</dd></dl>
          <a class="more" href="${p.link}">Learn more →</a>
        </div>
      </article>`).join("")}
    </div>
  </section>

  <section class="sec" id="experience">
    <div class="sec__head"><h2>${C.experienceTitle}</h2></div>
    <ol class="sec__body xp">
      ${C.experience.map(x => {
        const [from, to] = x.period.split(" – ");
        return `<li>
          <p class="xp__yr">${from.slice(-4)}<small>${esc(from)} – ${esc(to)}</small></p>
          <div><h3>${esc(x.company)}</h3><p class="xp__role">${esc(x.role)}, ${esc(x.place)}</p></div>
          <ul class="xp__what">${x.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
        </li>`;
      }).join("")}
    </ol>
  </section>

  <section class="sec" id="skills">
    <div class="sec__head"><h2>${C.skillsTitle}</h2></div>
    <div class="sec__body idx">
      ${C.skills.map(g => `<p><b>${esc(g.group)}</b>${g.items.map(esc).join(", ")}.</p>`).join("")}
    </div>
  </section>

  <section class="sec" id="about">
    <div class="sec__head"><h2>${C.aboutTitle}</h2></div>
    <div class="sec__body about">
      <p class="lede">${esc(C.about)}</p>
      <aside class="side">Education<b>${esc(C.education.school)}</b>${esc(C.education.degree)}<br>${esc(C.education.period)}</aside>
    </div>
  </section>
</main>
<footer class="close" id="contact">
  <h2>${C.contactTitle}</h2>
  <div>
    <p class="close__lead">Open to senior roles, remote. WhatsApp is the quickest way to reach me.</p>
    <nav class="ways" aria-label="Contact">
      <a href="${L.whatsapp}">WhatsApp <small>Message →</small></a>
      <a href="${L.linkedin}">LinkedIn <small>Profile →</small></a>
      <a href="${L.email}">Email <small>Write →</small></a>
      <a href="${L.github}">GitHub <small>Code →</small></a>
      <a href="${L.cv}">Curriculum <small>PDF ↓</small></a>
    </nav>
  </div>
  <p class="colophon"><span>Set in Gambarino and Switzer. Colours taken from the wall behind the photo.</span><span>São Paulo, <span data-clock>--:--</span></span><span>© 2026 Tiago Luiz Poli</span></p>
</footer>`;

// Language: header + hero + statuses (sections stay EN in the prototype).
const setLang = lang => {
  const src = lang === "pt" ? P : C;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  app.querySelectorAll("[data-t]").forEach(el => { const v = el.dataset.t.split(".").reduce((o, k) => o && o[k], src); if (v) el.textContent = v; });
  app.querySelectorAll("[data-nav]").forEach(el => el.textContent = src.nav[el.dataset.nav]);
  app.querySelectorAll("[data-status]").forEach(el => el.textContent = statusText[lang][el.dataset.status]);
  app.querySelector("[data-note]").innerHTML = note[lang];
  app.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
};
app.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));
setLang("en");

const hdr = app.querySelector("[data-hdr]"), menu = app.querySelector("[data-menu]");
menu.onclick = () => { const o = hdr.classList.toggle("is-open"); menu.setAttribute("aria-expanded", o); };
hdr.querySelectorAll(".hdr__nav a").forEach(a => a.addEventListener("click", () => { hdr.classList.remove("is-open"); menu.setAttribute("aria-expanded", false); }));
// On desktop the header sits over photo + wall until the hero scrolls away.
const hero = app.querySelector(".hero");
const onScroll = () => hdr.classList.toggle("is-scrolled", scrollY > hero.offsetHeight - 70);
addEventListener("scroll", onScroll, { passive: true }); onScroll();

if (!reduced) document.documentElement.classList.add("motion");

const clock = app.querySelector("[data-clock]");
const tick = () => clock.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date());
tick(); setInterval(tick, 20000);
