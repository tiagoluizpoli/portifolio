// PROTOTYPE: Status Page direction. Vanilla JS, no build; works from file://.
(function () {
  const C = window.CONTENT, L = C.links;
  const f = document.createElement("link");
  f.rel = "stylesheet";
  f.href = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap";
  document.head.appendChild(f);

  // Icon paths from lucide (ISC).
  const P = {
    menu: '<path class="m" d="M4 6h16M4 12h16M4 18h16"/><path class="x" d="M18 6 6 18M6 6l12 12"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    wa: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    li: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    gh: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4M9 18c-4.51 2-5-2-7-2"/>',
    up: '<path d="M7 7h10v10M7 17 17 7"/>'
  };
  const ic = k => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[k]}</svg>`;
  const sample = '<span class="tag">sample</span>';
  const MO = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  const start = p => { const [m, y] = p.split(" "); return +y * 12 + MO[m]; };
  const nowStamp = () => new Date().toISOString().slice(11, 19) + " UTC";

  const app = document.getElementById("app");
  let lang = "en", first = true;
  const orEn = (k, d) => (lang === "pt" && C.pt[k]) || d;

  function render() {
    const en = C.en, t = lang === "pt" ? { ...en, ...C.pt } : en;
    document.documentElement.lang = lang;
    const statusLabel = p => lang === "pt" ? C.pt.statusLabels[p.status] : p.statusLabel;
    const statLabel = (s, i) => lang === "pt" ? C.pt.statLabels[i] : s.label;
    // deterministic sample uptime: 90 days, two amber days
    const bars = Array.from({ length: 90 }, (_, i) => `<i${i === 31 || i === 62 ? ' class="a"' : ""}></i>`).join("");

    const projects = en.projects.map(p => {
      const live = p.status !== "soon";
      const n = p.images;
      return `<article class="row">
        <div class="imgs ${n === 1 ? "one" : n === 2 ? "two" : ""}" aria-label="Project images">${Array.from({ length: n }, (_, i) => `<div>image ${i + 1}</div>`).join("")}</div>
        <div class="col">
          <div class="rt"><h3>${p.title}</h3><span class="pill ${live ? "" : "soon"}"><span class="dot ${live ? "pulse" : "gray"}"></span>${statusLabel(p)}</span>${p.sample ? sample : ""}</div>
          <p class="sum">${p.summary}</p>
          ${p.now ? `<p class="now"><span class="dot amber"></span><span><b>${p.now.slice(0, 4)}</b>${p.now.slice(4)}</span></p>` : ""}
          <dl class="meta"><dt>Role</dt><dd>${p.role}</dd><dt>Stack</dt><dd class="tags">${p.stack.map(s => `<span>${s}</span>`).join("")}</dd></dl>
          ${live ? `<div class="up"><div class="uh"><span>Uptime, last 90 days</span>${sample}<span class="pc mono">99.98%</span></div><div class="bars" role="img" aria-label="Sample uptime, 90 days">${bars}</div></div>` : ""}
          <a class="learn" href="${p.link}">Learn more ${ic("up")}</a>
        </div></article>`;
    }).join("");

    const exp = [...en.experience].sort((a, b) => start(b.period) - start(a.period)).map(e => {
      const cur = /Present/.test(e.period);
      const [a, b] = e.period.split(" – ");
      return `<li><div class="d"><span class="mono">${a} →</span><span class="mono">${b}</span></div>
        <div><h3>${e.company}${cur ? '<span class="pill"><span class="dot pulse"></span>Current</span>' : ""}</h3>
        <div class="r">${e.role} · ${e.place}</div>
        <ul>${e.bullets.slice(0, 2).map(x => `<li>${x}</li>`).join("")}</ul></div></li>`;
    }).join("");

    const skills = en.skills.map(g => `<div class="sk"><h3>${g.group}</h3><div class="tags">${g.items.map(i => `<span>${i}</span>`).join("")}</div></div>`).join("");
    const nav = Object.entries({ projects: "projects", experience: "experience", skills: "skills", about: "about", contact: "contact" })
      .map(([k, id]) => `<a href="#${id}">${t.nav[k]}</a>`).join("");
    const stats = en.stats.items.map((s, i) => `<div class="m1"><div class="mv ${s.value == null ? "txt" : ""}" ${s.value != null ? `data-to="${s.value}"` : ""}>${s.value != null ? s.value.toLocaleString("en-US") : s.text}</div><div class="ml">${statLabel(s, i)}</div></div>`).join("");

    app.innerHTML = `
    <header class="hd"><div class="wrap">
      <a class="brand" href="#top"><span class="dot pulse"></span>${t.name}</a>
      <nav class="nav" id="nav" aria-label="Sections">${nav}</nav>
      <div class="lang" role="group" aria-label="Language"><button aria-pressed="${lang === "en"}" data-l="en">EN</button><button aria-pressed="${lang === "pt"}" data-l="pt">PT</button></div>
      <button class="burger" id="burger" aria-expanded="false" aria-controls="nav" aria-label="Menu"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P.menu}</svg></button>
    </div></header>
    <main id="top">
    <div class="wrap hero">
      <div class="banner">
        <div>
          <div class="state">${ic("check").replace('class="i"', 'class="i" style="width:22px;height:22px"')}${t.role}</div>
          <h1>${t.name}</h1>
          <p class="pitch">${t.pitch}</p>
          <p class="where">${ic("pin")}${t.location}</p>
          <div class="acts"><a class="btn pri" href="${L.whatsapp}">${ic("wa")}${t.cta.whatsapp}</a><a class="btn sec" href="${L.cv}">${ic("dl")}${t.cta.cv}</a></div>
        </div>
        <div class="photo"><span>photo</span></div>
      </div>
      <div class="metrics">
        <div class="mh"><b>GitHub activity</b>${en.stats.sample ? sample : ""}<span class="stamp"><span class="dot pulse"></span><span>Last updated <span class="mono" id="stamp">${nowStamp()}</span></span></span></div>
        <div class="mg">${stats}</div>
      </div>
    </div>
    <div class="wrap">
      <section id="projects"><div class="sh"><h2>${en.projectsTitle}</h2><span class="n">${en.projects.length} components</span></div>${projects}</section>
      <section id="experience"><div class="sh"><h2>${en.experienceTitle}</h2><span class="n">${en.experience.length} entries, newest first</span></div><ol class="log">${exp}</ol></section>
      <section id="skills"><div class="sh"><h2>${en.skillsTitle}</h2><span class="n">${en.skills.length} groups</span></div>${skills}</section>
      <section id="about"><div class="sh"><h2>${en.aboutTitle}</h2></div>
        <div class="ab"><h3>Profile</h3><p>${en.about}</p></div>
        <div class="ab"><h3>Education</h3><div class="edu" style="margin:0;padding:0;border:0"><b>${en.education.school}</b><span>${en.education.degree}</span><span class="mono">${en.education.period}</span></div></div></section>
      <section id="contact"><div class="sh"><h2>${en.contactTitle}</h2></div>
        <div class="ct"><a href="${L.whatsapp}">${ic("wa")}${en.contact.whatsapp}</a><a href="${L.linkedin}">${ic("li")}${en.contact.linkedin}</a><a href="${L.email}">${ic("mail")}${en.contact.email}</a><a href="${L.github}">${ic("gh")}${en.contact.github}</a><a href="${L.cv}">${ic("dl")}${en.contact.cv}</a></div></section>
    </div></main>
    <footer><div class="wrap"><span>${t.name}</span><span class="stamp"><span class="dot pulse"></span><span>All sections rendered. Prototype data marked sample.</span></span></div></footer>`;

    app.querySelectorAll(".lang button").forEach(b => b.onclick = () => { lang = b.dataset.l; render(); });
    const burger = document.getElementById("burger"), navEl = document.getElementById("nav");
    burger.onclick = () => { const o = navEl.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
    navEl.onclick = () => { navEl.classList.remove("open"); burger.setAttribute("aria-expanded", false); };
    if (first) countUp();
    first = false;
  }

  function countUp() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll("[data-to]").forEach(el => {
      const to = +el.dataset.to, t0 = performance.now();
      const step = now => {
        const k = Math.min(1, (now - t0) / 1100);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString("en-US");
        if (k < 1) requestAnimationFrame(step);
      };
      el.textContent = "0";
      requestAnimationFrame(step);
    });
  }

  setInterval(() => { const s = document.getElementById("stamp"); if (s) s.textContent = nowStamp(); }, 30000);
  render();
})();
