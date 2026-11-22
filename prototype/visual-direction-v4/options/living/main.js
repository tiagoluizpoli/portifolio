// PROTOTYPE · H · Living photo. The real photo split into background plate + subject, parallaxed in WebGL.
const C = window.CONTENT.en, P = window.CONTENT.pt, L = window.CONTENT.links;
const reduced = window.PROTOTYPE_REDUCED;
const BASE = "options/living/";
document.head.insertAdjacentHTML("beforeend",
  `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600&display=swap">`);
if (!reduced) document.documentElement.classList.add("motion");

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const svg = d => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  arrow: svg('<path d="M7 7h10v10"/><path d="M7 17 17 7"/>'),
  down: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'),
  chat: svg('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
  pin: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
  menu: svg('<path d="M4 8h16M4 16h16"/>')
};
const sample = `<span class="sample">sample</span>`;
const fmt = n => n.toLocaleString("en-US");
const [sContrib, sRepos, sLangs] = C.stats.items;
const statusText = { en: { "live-evolving": "In production · Actively developed", live: "In production", soon: "Coming soon" }, pt: P.statusLabels };
let d = 0;
const letters = ["Tiago", "Luiz Poli"].map(r => `<span class="ln" aria-hidden="true">${[...r].map(c => c === " " ? " " : `<span class="ch" style="--d:${(d += 42) + 250}">${c}</span>`).join("")}</span>`).join("");

document.getElementById("app").innerHTML = `
<header class="hdr" data-hdr>
  <a class="hdr__name" href="#top">Tiago Luiz Poli</a>
  <nav class="hdr__nav" aria-label="Sections">${["projects", "experience", "skills", "about", "contact"].map(k => `<a href="#${k}" data-nav="${k}">${C.nav[k]}</a>`).join("")}</nav>
  <div class="lang" role="group" aria-label="Language"><button data-lang="en" aria-pressed="true">EN</button><button data-lang="pt" aria-pressed="false">PT</button></div>
  <button class="menu" data-menu aria-label="Menu" aria-expanded="false">${I.menu}</button>
</header>
<main>
  <section class="hero" id="top">
    <figure class="portrait" data-portrait>
      <img src="photo.jpg" alt="Portrait of Tiago Luiz Poli">
      <figcaption class="portrait__cap">${I.pin}<span data-t="location">${C.location}</span></figcaption>
    </figure>
    <div class="hero__text">
      <h1 class="hero__name" data-name aria-label="Tiago Luiz Poli">${letters}</h1>
      <p class="hero__role fade" style="--fd:700ms" data-t="role">${C.role}</p>
      <p class="hero__pitch fade" style="--fd:800ms" data-t="pitch">${C.pitch}</p>
      <div class="hero__cta fade" style="--fd:900ms">
        <a class="btn btn--main" href="${L.whatsapp}">${I.chat}<span data-t="cta.whatsapp">${C.cta.whatsapp}</span></a>
        <a class="btn btn--soft" href="${L.cv}">${I.down}<span data-t="cta.cv">${C.cta.cv}</span></a>
      </div>
      <p class="hero__stats fade" style="--fd:1000ms">Over the last year, <strong data-count="${sContrib.value}">${fmt(sContrib.value)}</strong> contributions on <a href="${L.github}">GitHub</a>, across <strong data-count="${sRepos.value}">${sRepos.value}</strong> public repositories, mostly ${esc(sLangs.text.replace(/ · /g, ", ").replace(/, ([^,]*)$/, " and $1"))}. ${sample}</p>
    </div>
  </section>

  <section class="sec" id="projects">
    <h2 class="sec__title rv">${C.projectsTitle}</h2>
    <div class="projects">
      ${C.projects.map(p => `
      <article class="proj rv">
        <div class="proj__img" role="img" aria-label="${esc(p.title)} screenshot placeholder"><span>Screenshot to be supplied</span></div>
        <div class="proj__body">
          <p class="status status--${p.status === "soon" ? "soon" : "live"}"><i></i><span data-status="${p.status}">${p.statusLabel}</span>${p.sample ? " " + sample : ""}</p>
          <h3 class="proj__title">${esc(p.title)}</h3>
          <p class="proj__sum">${esc(p.summary)}</p>
          ${p.now ? `<p class="proj__now"><b>Now:</b> ${esc(p.now.replace(/^Now:\s*/, ""))}</p>` : ""}
          <p class="proj__facts"><span>${esc(p.role)}</span>${p.stack.map(esc).join(" · ")}</p>
          <a class="btn btn--main proj__more" href="${p.link}">Learn more ${I.arrow}</a>
        </div>
      </article>`).join("")}
    </div>
  </section>

  <section class="sec" id="experience">
    <h2 class="sec__title rv">${C.experienceTitle}</h2>
    <ol class="xp">${C.experience.map(x => `
      <li class="row rv"><p class="xp__when">${esc(x.period)}</p>
        <div><h3 class="xp__co">${esc(x.company)}</h3><p class="xp__role">${esc(x.role)} · ${esc(x.place)}</p></div>
        <ul class="xp__pts">${x.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul></li>`).join("")}
    </ol>
  </section>

  <section class="sec" id="skills">
    <h2 class="sec__title rv">${C.skillsTitle}</h2>
    <div class="skills">${C.skills.map(g => `<div class="skills__g rv"><h3>${esc(g.group)}</h3><p>${g.items.map(esc).join(", ")}</p></div>`).join("")}</div>
  </section>

  <section class="sec" id="about">
    <h2 class="sec__title rv">${C.aboutTitle}</h2>
    <div class="about">
      <p class="about__p rv">${esc(C.about)}</p>
      <div class="edu rv"><h3>Education</h3><p><strong>${esc(C.education.school)}</strong></p><p>${esc(C.education.degree)}</p><p class="when">${esc(C.education.period)}</p></div>
    </div>
  </section>
</main>
<section class="contact" id="contact">
  <div>
    <h2 class="rv">Want to work together?</h2>
    <p class="contact__lead rv">Open to senior roles, remote. WhatsApp is the fastest way to reach me.</p>
    <p class="contact__time rv">It's <span data-clock>--:--</span> in São Paulo right now.</p>
  </div>
  <ul class="ways rv">
    <li><a href="${L.whatsapp}">${I.chat}WhatsApp <small>fastest</small><span class="go">${I.arrow}</span></a></li>
    <li><a href="${L.linkedin}">LinkedIn<span class="go">${I.arrow}</span></a></li>
    <li><a href="${L.email}">Email<span class="go">${I.arrow}</span></a></li>
    <li><a href="${L.github}">GitHub<span class="go">${I.arrow}</span></a></li>
    <li><a href="${L.cv}">${I.down}CV <small>PDF</small><span class="go">${I.arrow}</span></a></li>
  </ul>
  <footer class="foot"><p>© 2026 Tiago Luiz Poli</p><p>Built by hand, served from my own server.</p></footer>
</section>`;

// Language (header + hero + statuses; sections stay EN in the prototype)
const setLang = lang => {
  const src = lang === "pt" ? P : C;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-t]").forEach(el => { const v = el.dataset.t.split(".").reduce((o, k) => o && o[k], src); if (v) el.textContent = v; });
  document.querySelectorAll("[data-nav]").forEach(el => el.textContent = src.nav[el.dataset.nav]);
  document.querySelectorAll("[data-status]").forEach(el => el.textContent = statusText[lang][el.dataset.status]);
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
};
document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));

const hdr = document.querySelector("[data-hdr]"), menu = document.querySelector("[data-menu]");
menu.onclick = () => menu.setAttribute("aria-expanded", hdr.classList.toggle("is-open"));
hdr.querySelectorAll(".hdr__nav a").forEach(a => a.onclick = () => { hdr.classList.remove("is-open"); menu.setAttribute("aria-expanded", false); });
addEventListener("scroll", () => hdr.classList.toggle("is-scrolled", scrollY > 4), { passive: true });

const clock = document.querySelector("[data-clock]");
const tick = () => clock.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date());
tick(); setInterval(tick, 20000);

// Intro + reveals
const portrait = document.querySelector("[data-portrait]");
requestAnimationFrame(() => requestAnimationFrame(() => {
  portrait.classList.add("on");
  document.querySelector("[data-name]").classList.add("on");
  document.querySelectorAll(".hero .fade").forEach(el => el.classList.add("on"));
}));
if (!reduced) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".rv").forEach(el => io.observe(el));
  setTimeout(() => document.querySelectorAll("[data-count]").forEach(el => {
    const to = +el.dataset.count, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = fmt(Math.round(to * (1 - Math.pow(2, -10 * k)))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), 1000);
}

// --- Living photo: background plate and subject as two layers in one shader ---
const startGL = async () => {
  const THREE = await import("three");
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // pass photo colours through untouched
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const load = src => new Promise((res, rej) => new THREE.TextureLoader().load(src, t => { t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; res(t); }, undefined, rej));
  const [bg, sub] = await Promise.all([load(BASE + "bg.jpg"), load("cutout.png")]);
  const uniforms = { uBg: { value: bg }, uSub: { value: sub }, uOff: { value: new THREE.Vector2() }, uT: { value: 0 }, uAspect: { value: 1 }, uIntro: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uBg, uSub; uniform vec2 uOff; uniform float uT, uAspect, uIntro; varying vec2 vUv;
      void main(){
        vec2 s = uAspect > 1. ? vec2(1., 1. / uAspect) : vec2(uAspect, 1.);
        vec2 uv = (vUv - .5) * s + .5;                       // cover-crop the square photo
        vec2 breathe = vec2(sin(uT * .31), cos(uT * .23)) * .005;
        float bz = 1.09 + uIntro * .07;                      // background sits deeper: zoomed, moves more, opposite way
        vec2 bgUv = (uv - .5) / bz + .5 - uOff * .021 - breathe;
        float sz = 1.025 + sin(uT * .5) * .003;              // subject: near layer, barely moves
        vec2 sUv = (uv - .5) / sz + .5 + uOff * .007 + breathe * .25;
        sUv.x += (sUv.y - .5) * uOff.x * .006;               // hint of perspective
        vec3 b = texture2D(uBg, bgUv).rgb * (.94 + .06 * (1. - length(uOff) * .5));
        vec4 f = texture2D(uSub, sUv);
        gl_FragColor = vec4(mix(b, f.rgb, f.a), 1.);
      }`
  });
  const scene = new THREE.Scene(); scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const cam = new THREE.Camera();
  portrait.prepend(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const size = () => { const w = portrait.clientWidth, h = portrait.clientHeight; renderer.setSize(w, h, false); uniforms.uAspect.value = w / h; };
  new ResizeObserver(size).observe(portrait); size();
  const target = new THREE.Vector2();
  addEventListener("pointermove", e => target.set((e.clientX / innerWidth - .5) * 2, -(e.clientY / innerHeight - .5) * 2), { passive: true });
  let visible = true, t0 = performance.now();
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(portrait);
  const loop = now => {
    requestAnimationFrame(loop);
    if (!visible) return;
    uniforms.uT.value = (now - t0) / 1000;
    uniforms.uIntro.value = Math.max(0, 1 - (now - t0) / 1800) ** 3;
    uniforms.uOff.value.lerp(target, .05);
    renderer.render(scene, cam);
  };
  requestAnimationFrame(loop);
  portrait.classList.add("gl");
};
if (!reduced) startGL().catch(e => console.warn("living photo fell back to the static image", e));
