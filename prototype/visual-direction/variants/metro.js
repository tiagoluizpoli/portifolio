// PROTOTYPE, throwaway. Variant "Metrô Wayfinding": the page as a São Paulo Metrô line diagram.
(function () {
  const C = window.CONTENT, EN = C.en, PT = C.pt, LINKS = C.links;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap";
  document.head.appendChild(font);

  // Lucide icon paths (ISC licence), 24x24, stroke-based.
  const ICONS = {
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    out: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };
  const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
  const sample = (on, dark) => (on ? `<span class="sample${dark ? " sample--dark" : ""}">sample</span>` : "");

  // Each section is a numbered line, like SP Metrô Linha 1-Azul … 5-Lilás. The numbers are the nav.
  const LINES = [
    { id: "projects", n: 1, c: "blue" },
    { id: "experience", n: 2, c: "green" },
    { id: "skills", n: 3, c: "red" },
    { id: "about", n: 4, c: "yellow" },
    { id: "contact", n: 5, c: "lilac" }
  ];
  const roundel = (l, cls = "") => `<span class="roundel roundel--${l.c} ${cls}" aria-hidden="true">${l.n}</span>`;

  let lang = "en", counted = false;

  function header(L) {
    const nav = LINES.map((l) => `<li><a href="#${l.id}">${roundel(l, "roundel--sm")}<span>${L.nav[l.id]}</span></a></li>`).join("");
    return `<header class="hdr"><div class="wrap hdr__in">
      <a class="hdr__name" href="#top">${L.name}</a>
      <nav class="hdr__nav" id="nav" aria-label="Sections"><ul>${nav}</ul></nav>
      <div class="hdr__lang" role="group" aria-label="Language">
        <button type="button" data-lang="en" aria-pressed="${lang === "en"}">EN</button><button type="button" data-lang="pt" aria-pressed="${lang === "pt"}">PT</button>
      </div>
      <button type="button" class="hdr__menu" aria-expanded="false" aria-controls="nav">${icon("menu")}<span>Menu</span></button>
    </div></header>`;
  }

  function hero(L) {
    const labels = lang === "pt" ? PT.statLabels : EN.stats.items.map((s) => s.label);
    const rows = EN.stats.items.map((s, i) => `<tr>
        <td class="board__val">${s.value == null ? `<span class="board__txt">${s.text}</span>` : `<span class="num" data-to="${s.value}">${counted || reduce ? s.value.toLocaleString("en-US") : "0"}</span>`}</td>
        <td class="board__lbl">${labels[i]}</td></tr>`).join("");
    return `<section class="band" id="top" aria-label="Intro"><div class="wrap band__in">
      <div class="band__id">
        <h1 class="band__name">${L.name}</h1>
        <p class="band__role">${L.role}</p>
        <p class="band__pitch">${L.pitch}</p>
        <p class="band__loc">${icon("pin")}${L.location}</p>
        <div class="cta">
          <a class="cta__btn cta__btn--primary" href="${LINKS.whatsapp}">${icon("chat")}<span>${L.cta.whatsapp}</span>${icon("arrow")}</a>
          <a class="cta__btn" href="${LINKS.cv}" download>${icon("download")}<span>${L.cta.cv}</span></a>
        </div>
      </div>
      <div class="band__side"><div class="photo" role="img" aria-label="Photo placeholder"><span>photo</span></div>
      <div class="board" aria-label="GitHub activity">
        <div class="board__head"><span class="board__live" aria-hidden="true"></span><span>GitHub</span>${sample(EN.stats.sample, true)}<a href="${LINKS.github}" class="board__src">tiagoluizpoli ${icon("out")}</a></div>
        <table><tbody>${rows}</tbody></table>
      </div></div>
    </div></section>`;
  }

  function head(l, title) {
    return `<div class="sec__head">${roundel(l, "roundel--stop")}<h2>${title}</h2></div>`;
  }

  function projects() {
    const p = EN.projects.map((pr) => `<article class="stop proj${pr.status === "soon" ? " stop--planned" : ""}">
      <div class="proj__text">
        <h3>${pr.title} ${sample(pr.sample)}</h3>
        <p class="status status--${pr.status}"><span class="status__dot" aria-hidden="true"></span>${pr.statusLabel}</p>
        <p class="proj__sum">${pr.summary}</p>
        ${pr.now ? `<p class="proj__now">${pr.now}</p>` : ""}
        <dl class="proj__meta"><dt>Role</dt><dd>${pr.role}</dd><dt>Stack</dt><dd><ul class="tags">${pr.stack.map((s) => `<li>${s}</li>`).join("")}</ul></dd></dl>
        <a class="more" href="${pr.link}">Learn more<span class="sr"> about ${pr.title}</span>${icon("arrow")}</a>
      </div>
      <div class="proj__imgs proj__imgs--${pr.images}">${Array.from({ length: pr.images }, (_, i) => `<div class="ph" role="img" aria-label="Image placeholder ${i + 1}"><span>image ${i + 1}</span></div>`).join("")}</div>
    </article>`).join("");
    return `<section class="line line--blue" id="projects">${head(LINES[0], EN.projectsTitle)}${p}</section>`;
  }

  function experience() {
    const r = EN.experience.map((e, i) => `<li class="stop xp${i === 0 ? " stop--now" : ""}">
      <div class="xp__who"><h3>${e.company}</h3><p class="xp__role">${e.role}</p><p class="xp__when"><span class="num">${e.period}</span><span>${e.place}</span></p></div>
      <ul class="xp__did">${e.bullets.slice(0, 2).map((b) => `<li>${b}</li>`).join("")}</ul>
    </li>`).join("");
    return `<section class="line line--green" id="experience">${head(LINES[1], EN.experienceTitle)}<ol class="xps">${r}</ol></section>`;
  }

  function skills() {
    const rows = EN.skills.map((g) => `<tr><th scope="row">${g.group}</th><td><ul>${g.items.map((s) => `<li>${s}</li>`).join("")}</ul></td><td class="tt__n num">${String(g.items.length).padStart(2, "0")}</td></tr>`).join("");
    return `<section class="line line--red" id="skills">${head(LINES[2], EN.skillsTitle)}
      <table class="tt"><thead><tr><th scope="col">Group</th><th scope="col">Tools</th><th scope="col" class="tt__n">#</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  }

  function about() {
    const ed = EN.education;
    return `<section class="line line--yellow" id="about">${head(LINES[3], EN.aboutTitle)}
      <div class="about"><p class="about__p">${EN.about}</p>
      <div class="edu"><h3>Education</h3><dl><dt>School</dt><dd>${ed.school}</dd><dt>Degree</dt><dd>${ed.degree}</dd><dt>Period</dt><dd class="num">${ed.period}</dd></dl></div></div></section>`;
  }

  function contact() {
    const k = EN.contact;
    const items = [
      ["whatsapp", "chat", k.whatsapp, "+55 · message"],
      ["linkedin", "linkedin", k.linkedin, "in/tiago-seuaciuc"],
      ["email", "mail", k.email, LINKS.email.replace("mailto:", "")],
      ["github", "github", k.github, "tiagoluizpoli"],
      ["cv", "download", k.cv, "PDF"]
    ];
    return `<section class="line line--lilac line--end" id="contact">${head(LINES[4], EN.contactTitle)}
      <ul class="dest">${items.map(([key, ic, label, val]) => `<li><a href="${LINKS[key]}"${key === "cv" ? " download" : ""}>${icon(ic)}<span class="dest__l">${label}</span><span class="dest__v">${val}</span>${icon("arrow")}</a></li>`).join("")}</ul>
    </section>`;
  }

  function render() {
    const L = Object.assign({}, EN, lang === "pt" ? PT : {});
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.getElementById("app").innerHTML = `<div class="metro">${header(L)}<main>${hero(L)}<div class="wrap">${projects()}${experience()}${skills()}${about()}${contact()}</div></main>
      <footer class="foot"><div class="wrap foot__in"><span>${EN.name}</span><span>${L.location}</span></div></footer></div>`;
    wire();
    if (!counted && !reduce) countUp();
    counted = true;
  }

  function wire() {
    const app = document.getElementById("app");
    app.querySelectorAll("[data-lang]").forEach((b) => (b.onclick = () => { if (b.dataset.lang !== lang) { lang = b.dataset.lang; render(); } }));
    const menu = app.querySelector(".hdr__menu"), nav = app.querySelector("#nav");
    const set = (open) => { menu.setAttribute("aria-expanded", open); nav.classList.toggle("is-open", open); menu.innerHTML = icon(open ? "close" : "menu") + "<span>Menu</span>"; };
    menu.onclick = () => set(menu.getAttribute("aria-expanded") !== "true");
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  function countUp() {
    const els = document.querySelectorAll(".board .num[data-to]"), t0 = performance.now(), D = 1100;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3);
      els.forEach((el) => (el.textContent = Math.round(+el.dataset.to * e).toLocaleString("en-US")));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  render();
})();
