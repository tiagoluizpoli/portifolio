// PROTOTYPE option E · Studio: dark, sharp grid; hero portrait rebuilt as a 3D point cloud.
const C = window.CONTENT.en, P = window.CONTENT.pt, L = window.CONTENT.links;
const reduced = window.PROTOTYPE_REDUCED;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const svg = d => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true">${d}</svg>`;
const arrow = svg('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>');
const fmt = n => n.toLocaleString("en-US");
const sample = `<span class="sample">sample</span>`;
const statusText = { en: { "live-evolving": "In production · Actively developed", live: "In production", soon: "Coming soon" }, pt: P.statusLabels };
const [st0, st1, st2] = C.stats.items;

document.getElementById("app").innerHTML = `
<header class="hd" data-hd>
  <a class="hd__name" href="#top">Tiago Luiz Poli</a>
  <nav class="hd__nav" aria-label="Sections">${["projects", "experience", "skills", "about", "contact"].map(k => `<a href="#${k}" data-nav="${k}">${C.nav[k]}</a>`).join("")}</nav>
  <div class="lang" role="group" aria-label="Language"><button data-lang="en" aria-pressed="true">EN</button><span>/</span><button data-lang="pt" aria-pressed="false">PT</button></div>
  <button class="hd__menu" data-menu aria-expanded="false">Menu</button>
</header>
<main>
<section class="hero" id="top">
  <div class="hero__cloud" data-cloud aria-hidden="true"></div>
  <div class="hero__inner">
    <p class="hero__meta"><span data-t="location">${C.location}</span><span><b data-clock>--:--</b> in São Paulo</span></p>
    <div class="hero__main">
      <h1 class="hero__name" data-r>Tiago Luiz<br>Poli</h1>
      <p class="hero__role" data-r data-t="role">${C.role}</p>
      <p class="hero__pitch" data-r data-t="pitch">${C.pitch}</p>
      <div class="hero__cta" data-r>
        <a class="btn btn--solid" href="${L.whatsapp}"><span data-t="cta.whatsapp">${C.cta.whatsapp}</span>${arrow}</a>
        <a class="btn" href="${L.cv}"><span data-t="cta.cv">${C.cta.cv}</span>${arrow}</a>
      </div>
    </div>
    <div class="hero__foot">
      <p><span data-stats-en>On GitHub: <strong class="tab" data-count="${st0.value}">${fmt(st0.value)}</strong> contributions in the last year across <strong class="tab" data-count="${st1.value}">${st1.value}</strong> public repos, mostly <strong>${esc(st2.text.replace(/ · /g, ", ").replace(/, (?=[^,]*$)/, " and "))}</strong>.</span>${sample}</p>
      <p class="hero__hint" aria-hidden="true">Move the cursor across the portrait</p>
    </div>
  </div>
</section>

<section class="sec wrap" id="projects">
  <div class="sec__h" data-r><h2>${C.projectsTitle}</h2><p>Products I build and run myself, on infrastructure I operate.</p></div>
  ${C.projects.map(p => `
  <article class="pj">
    <div class="pj__frame" data-frame><div class="pj__frame-in"><span>${esc(p.title)}</span></div><p class="pj__frame-tag">Screenshot pending</p></div>
    <div class="pj__row">
      <div data-r>
        <h3 class="pj__title">${esc(p.title)}${p.sample ? sample : ""}</h3>
        <p class="pj__status${p.status === "soon" ? " pj__status--soon" : ""}"><i></i><span data-status="${p.status}"></span></p>
      </div>
      <div data-r>
        <p class="pj__sum">${esc(p.summary)}</p>
        ${p.now ? `<p class="pj__now"><b>Now</b> · ${esc(p.now.replace(/^Now:\s*/, ""))}</p>` : ""}
      </div>
      <div data-r>
        <dl class="pj__facts"><div><dt>Role</dt><dd>${esc(p.role)}</dd></div><div><dt>Stack</dt><dd>${p.stack.map(esc).join(", ")}</dd></div></dl>
        <a class="lnk" href="${p.link}">Learn more ${arrow}</a>
      </div>
    </div>
  </article>`).join("")}
</section>

<section class="sec wrap" id="experience">
  <div class="sec__h" data-r><h2>${C.experienceTitle}</h2><p>Since 2015. Senior engineer on SaaS platforms since 2023.</p></div>
  <ol class="xp">${C.experience.map(x => `
    <li data-r>
      <p class="xp__when tab">${esc(x.period)}</p>
      <div><h3>${esc(x.company)}</h3><p class="xp__role">${esc(x.role)} · ${esc(x.place)}</p></div>
      <ul>${x.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
    </li>`).join("")}
  </ol>
</section>

<section class="sec wrap" id="skills">
  <div class="sec__h" data-r><h2>${C.skillsTitle}</h2><p>What I reach for, grouped by where it sits in the stack.</p></div>
  <div class="sk">${C.skills.map(g => `<div data-r><h3>${esc(g.group)}</h3><p>${g.items.map(esc).join(", ")}</p></div>`).join("")}</div>
</section>

<section class="sec wrap" id="about">
  <div class="sec__h" data-r><h2>${C.aboutTitle}</h2></div>
  <div class="ab">
    <p class="ab__edu" data-r><strong>${esc(C.education.school)}</strong>${esc(C.education.degree)}<br>${esc(C.education.period)}</p>
    <p class="ab__text" data-r>${esc(C.about)}</p>
  </div>
</section>
</main>

<footer class="ct wrap" id="contact">
  <div class="ct__grid">
    <div data-r>
      <h2>Work together</h2>
      <p class="ct__lead">Open to senior roles, remote. WhatsApp is the fastest way to reach me.</p>
      <div class="ct__cta">
        <a class="btn btn--solid" href="${L.whatsapp}">${C.cta.whatsapp}${arrow}</a>
        <a class="btn" href="${L.cv}">${C.cta.cv}${arrow}</a>
      </div>
    </div>
    <ul class="ct__links" data-r>
      <li><a href="${L.linkedin}">LinkedIn ${arrow}</a></li>
      <li><a href="${L.github}">GitHub ${arrow}</a></li>
      <li><a href="${L.email}">Email ${arrow}</a></li>
    </ul>
  </div>
  <div class="ft"><p>© 2026 Tiago Luiz Poli</p><p>Built by hand. Served from my own server.</p></div>
</footer>`;

// language (header + hero + statuses)
const setLang = lang => {
  const src = lang === "pt" ? P : C;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-t]").forEach(el => { const v = el.dataset.t.split(".").reduce((o, k) => o && o[k], src); if (v) el.textContent = v; });
  document.querySelectorAll("[data-nav]").forEach(el => el.textContent = src.nav[el.dataset.nav]);
  document.querySelectorAll("[data-status]").forEach(el => el.textContent = statusText[lang][el.dataset.status]);
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
};
document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));
setLang("en");

// header + menu
const hd = document.querySelector("[data-hd]"), menu = document.querySelector("[data-menu]");
menu.onclick = () => { const o = hd.classList.toggle("open"); menu.setAttribute("aria-expanded", o); menu.textContent = o ? "Close" : "Menu"; };
hd.querySelectorAll(".hd__nav a").forEach(a => a.addEventListener("click", () => { hd.classList.remove("open"); menu.setAttribute("aria-expanded", false); menu.textContent = "Menu"; }));

// clock
const clock = document.querySelector("[data-clock]");
const tick = () => clock.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date());
tick(); setInterval(tick, 20000);

// reveals (wipe) + count-up
if (!reduced) {
  document.documentElement.classList.add("motion");
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-r]").forEach((el, i) => { if (el.closest(".hero")) el.style.transitionDelay = `${120 + i * 90}ms`; io.observe(el); });
  setTimeout(() => document.querySelectorAll("[data-count]").forEach(el => {
    const to = +el.dataset.count, t0 = performance.now();
    const f = t => { const k = Math.min(1, (t - t0) / 1800); el.textContent = fmt(Math.round(to * (1 - Math.pow(2, -10 * k)))); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }), 700);
}

// project frames open up (clip + scale) as they cross the viewport
const frames = [...document.querySelectorAll("[data-frame]")];
const onScroll = () => {
  hd.classList.toggle("solid", scrollY > 20);
  if (reduced) return;
  for (const f of frames) {
    const r = f.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (r.top - innerHeight * 0.15) / (innerHeight * 0.7)));
    f.style.setProperty("--k", k.toFixed(3));
  }
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();
if (reduced) frames.forEach(f => f.style.setProperty("--k", 0));

// --- hero point cloud ---
const host = document.querySelector("[data-cloud]");
const still = () => host.innerHTML = `<img class="hero__still" src="photo.jpg" alt="">`;
const gl = (() => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } })();
if (reduced || !gl) still();
else (window.requestIdleCallback || (f => setTimeout(f, 200)))(() => startCloud().catch(e => { console.error(e); still(); }));

async function startCloud() {
  const THREE = await import("three");
  const img = new Image(); img.src = "photo.jpg"; await img.decode();
  const N = innerWidth < 760 ? 150 : 210;
  const cv = document.createElement("canvas"); cv.width = cv.height = N;
  const cx = cv.getContext("2d", { willReadFrequently: true }); cx.drawImage(img, 0, 0, N, N);
  const px = cx.getImageData(0, 0, N, N).data;
  const pos = [], col = [], rnd = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = (y * N + x) * 4, r = px[i] / 255, g = px[i + 1] / 255, b = px[i + 2] / 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const u = x / N - 0.5, v = 0.5 - y / N, rad = Math.hypot(u * 1.15, v + 0.05);
    const keep = 1 - smooth(0.36, 0.5, rad); // fade the room out, keep head and shoulders
    if (keep <= 0.02 || Math.random() > 0.35 + keep * 0.65) continue;
    pos.push(u * 3, v * 3, (lum - 0.45) * 0.55 + (1 - Math.min(1, rad / 0.42) ** 2) * 0.55);
    col.push(r, g, b);
    rnd.push(Math.random(), keep);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute("aRnd", new THREE.Float32BufferAttribute(rnd, 2));
  const uni = { uTime: { value: 0 }, uProg: { value: 0 }, uMouse: { value: new THREE.Vector2(9, 9) }, uSize: { value: innerWidth < 760 ? 26 : 34 }, uDpr: { value: Math.min(devicePixelRatio, 2) } };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false, vertexColors: true,
    vertexShader: `
      attribute vec2 aRnd; uniform float uTime, uProg, uSize, uDpr; uniform vec2 uMouse;
      varying vec3 vCol; varying float vA;
      void main() {
        vec3 p = position;
        float t = clamp((uProg - aRnd.x * .45) / .55, 0., 1.); t = 1. - pow(1. - t, 3.);
        vec3 from = p + vec3((aRnd.x - .5) * 1.4, (fract(aRnd.x * 7.3) - .5) * 1.4, -3. - aRnd.x * 5.);
        p = mix(from, p, t);
        p.z += sin(uTime * .9 + p.y * 3. + aRnd.x * 6.28) * .025;
        vec2 d = p.xy - uMouse; float m = smoothstep(.42, 0., length(d));
        p.xy += normalize(d + 1e-4) * m * .12; p.z += m * .35;
        vCol = color * (.55 + .6 * aRnd.y) + m * vec3(.35, .22, .05);
        vA = aRnd.y * t;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_PointSize = uSize * uDpr * (.6 + aRnd.x * .5) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vCol; varying float vA;
      void main() { float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .15, d) * vA; if (a < .01) discard; gl_FragColor = vec4(vCol, a); }`
  });
  const cloud = new THREE.Points(geo, mat);
  const scene = new THREE.Scene(); scene.add(cloud);
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50); cam.position.set(0, 0, 6.2);
  const ren = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  ren.setPixelRatio(Math.min(devicePixelRatio, 2)); host.appendChild(ren.domElement);
  const size = () => { const w = host.clientWidth, h = host.clientHeight; ren.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w / h < 1 ? 6.6 / Math.max(.62, w / h) : 6.2; cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(host); size();

  const ptr = { x: 0, y: 0, on: false }, ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  addEventListener("pointermove", e => {
    const r = host.getBoundingClientRect();
    ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1; ptr.on = true;
  }, { passive: true });
  let visible = true; new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(host);
  const t0 = performance.now(); let rx = 0, ry = 0;
  const loop = now => {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = (now - t0) / 1000;
    uni.uTime.value = t; uni.uProg.value = Math.min(1, t / 2.6);
    ry += ((ptr.on ? ptr.x * .38 : Math.sin(t * .3) * .18) - ry) * .05;
    rx += ((ptr.on ? -ptr.y * .16 : 0) - rx) * .05;
    cloud.rotation.set(rx, ry, 0);
    if (ptr.on) {
      ray.setFromCamera(new THREE.Vector2(ptr.x, ptr.y), cam);
      if (ray.ray.intersectPlane(plane, hit)) { cloud.worldToLocal(hit); uni.uMouse.value.set(hit.x, hit.y); }
    }
    ren.render(scene, cam);
  };
  requestAnimationFrame(loop);
}
function smooth(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
