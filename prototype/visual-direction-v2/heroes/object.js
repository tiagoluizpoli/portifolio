// PROTOTYPE hero A: a small 3D server you can rotate; its screen prints the live GitHub numbers.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const css = `
[data-hero="object"] .hero__stage { grid-column: 2; grid-row: 1; height: min(76vh, 700px); }
[data-hero="object"] .hero__copy { grid-column: 1; grid-row: 1; }
[data-hero="object"] canvas { width: 100%; height: 100%; display: block; cursor: grab; touch-action: pan-y; }
[data-hero="object"] canvas:active { cursor: grabbing; }
.obj-hint { position: absolute; left: 50%; bottom: 4%; transform: translateX(-50%); font: 400 12px/1 var(--mono); color: var(--ink2); display: flex; gap: 8px; align-items: center; white-space: nowrap; }
.obj-hint i { width: 18px; height: 1px; background: currentColor; }
@media (max-width: 960px) { [data-hero="object"] .hero__stage { grid-column: 1; grid-row: 2; height: 54svh; margin: -10px -20px 0; } }
`;
document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

const stage = document.getElementById("hero-stage");
stage.removeAttribute("aria-hidden");
stage.setAttribute("role", "img");
stage.setAttribute("aria-label", "A small server rendered in 3D; its screen shows the GitHub numbers listed below.");
stage.insertAdjacentHTML("beforeend", `<p class="obj-hint"><i></i>drag to rotate<i></i></p>`);

const reduced = window.PROTOTYPE_REDUCED;
const stats = window.PROTOTYPE_STATS;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
camera.position.set(0, 0.55, 8.2);
camera.lookAt(0, -0.05, 0);

const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 4); scene.add(key);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

// --- the machine ---
const rig = new THREE.Group(); scene.add(rig);
const shell = new THREE.Mesh(new RoundedBoxGeometry(2.6, 1.6, 1.8, 8, 0.16),
  new THREE.MeshPhysicalMaterial({ metalness: 0.8, roughness: 0.34, clearcoat: 0.4, clearcoatRoughness: 0.3 }));
rig.add(shell);
const dark = new THREE.MeshStandardMaterial({ color: 0x0c0d0f, roughness: 0.6, metalness: 0.2 });
const front = 0.9;
const bezel = new THREE.Mesh(new RoundedBoxGeometry(1.62, 1.04, 0.04, 4, 0.04), dark);
bezel.position.set(-0.36, 0.06, front); rig.add(bezel);

const sc = document.createElement("canvas"); sc.width = 1024; sc.height = 640;
const sx = sc.getContext("2d");
const screenTex = new THREE.CanvasTexture(sc); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8;
const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9375), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
screen.position.set(-0.36, 0.06, front + 0.022); rig.add(screen);
const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9375), new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0, clearcoat: 1 }));
glass.position.copy(screen.position); glass.position.z += 0.002; rig.add(glass);

for (let k = 0; k < 8; k++) {
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.035, 0.03), dark);
  slot.position.set(0.82, 0.42 - k * 0.085, front + 0.002); rig.add(slot);
}
const ledGreen = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), new THREE.MeshBasicMaterial({ color: 0x3ccb86, toneMapped: false }));
ledGreen.position.set(0.66, -0.5, front + 0.012); rig.add(ledGreen);
const ledBlue = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), new THREE.MeshBasicMaterial({ color: 0x6c78ff, toneMapped: false }));
ledBlue.position.set(0.76, -0.5, front + 0.012); rig.add(ledBlue);
const power = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 32), new THREE.MeshPhysicalMaterial({ color: 0xbdbdb8, metalness: 1, roughness: 0.25 }));
power.rotation.x = Math.PI / 2; power.position.set(0.98, -0.5, front + 0.01); rig.add(power);
const label = document.createElement("canvas"); label.width = 512; label.height = 64;
const lx = label.getContext("2d");
const labelTex = new THREE.CanvasTexture(label); labelTex.colorSpace = THREE.SRGBColorSpace;
const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.0775), new THREE.MeshBasicMaterial({ map: labelTex, transparent: true }));
plate.position.set(-0.81, -0.66, front + 0.003); rig.add(plate);
[[-1.05, -0.65], [1.05, -0.65], [-1.05, 0.65], [1.05, 0.65]].forEach(([x, z]) => {
  const f = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.06, 24), dark); f.position.set(x, -0.83, z); rig.add(f);
});

// soft contact shadow
const sh = document.createElement("canvas"); sh.width = sh.height = 256;
const shx = sh.getContext("2d"); const g = shx.createRadialGradient(128, 128, 10, 128, 128, 128);
g.addColorStop(0, "rgba(0,0,0,.55)"); g.addColorStop(1, "rgba(0,0,0,0)"); shx.fillStyle = g; shx.fillRect(0, 0, 256, 256);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.87; scene.add(shadow);

const applyTheme = () => {
  const darkTheme = document.documentElement.dataset.theme === "dark";
  shell.material.color.set(darkTheme ? 0x3a3b40 : 0xd9d9d4);
  shadow.material.opacity = darkTheme ? 0.9 : 0.45;
  lx.clearRect(0, 0, 512, 64);
  lx.font = '500 30px "JetBrains Mono"'; lx.fillStyle = darkTheme ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.5)";
  lx.fillText("TLP-01 · SÃO PAULO", 4, 42); labelTex.needsUpdate = true;
};

// --- the screen: a tiny terminal that types the stats ---
const fmt = n => n.toLocaleString("en-US");
const contrib = stats[0].value, repos = stats[1].value, langs = stats[2].text;
const lines = [
  ["$ ", "#6c78ff", "portfolio --stats", "#e8e8e2"],
  ["contributions, last year", "#8a8f98", "{c}", "#ffffff"],
  ["public repos", "#8a8f98", String(repos), "#ffffff"],
  ["top languages", "#8a8f98", langs, "#ffffff"],
  ["$ ", "#6c78ff", "services", "#e8e8e2"],
  ["● church", "#3ccb86", "in production", "#e8e8e2"],
  ["● portfolio", "#3ccb86", "in production", "#e8e8e2"]
];
const total = lines.reduce((n, l) => n + l[0].length + l[2].length, 0);
let typed = reduced ? total : 0, t0 = 0;
const drawScreen = (now) => {
  sx.fillStyle = "#06070a"; sx.fillRect(0, 0, 1024, 640);
  const vg = sx.createRadialGradient(512, 300, 100, 512, 320, 640); vg.addColorStop(0, "rgba(108,120,255,.10)"); vg.addColorStop(1, "rgba(0,0,0,0)");
  sx.fillStyle = vg; sx.fillRect(0, 0, 1024, 640);
  sx.font = '400 24px "JetBrains Mono"'; sx.fillStyle = "#5b6069";
  sx.fillText("tiago@vps", 56, 70); sx.textAlign = "right"; sx.fillText("sample data", 968, 70); sx.textAlign = "left";
  sx.fillStyle = "#1c1f26"; sx.fillRect(56, 92, 912, 2);
  let left = typed, y = 160;
  const k = Math.min(1, Math.max(0, (now - t0 - 900) / 1600)), eased = reduced ? 1 : 1 - Math.pow(2, -10 * k);
  let cursor = null;
  for (const [a, ca, b, cb] of lines) {
    if (left <= 0) break;
    const isCmd = a === "$ ";
    sx.font = (isCmd ? "500 " : "400 ") + '34px "JetBrains Mono"';
    const sa = a.slice(0, left); left -= a.length;
    sx.fillStyle = ca; sx.fillText(sa, 56, y);
    let x = 56 + sx.measureText(sa).width;
    if (left > 0) {
      let vb = b === "{c}" ? fmt(Math.round(contrib * eased)) : b;
      const sb = vb.slice(0, Math.max(0, left));
      sx.fillStyle = cb; sx.font = '500 34px "JetBrains Mono"';
      if (isCmd) { sx.fillText(sb, x, y); x += sx.measureText(sb).width; }
      else { sx.textAlign = "right"; sx.fillText(sb, 968, y); sx.textAlign = "left"; x = 968; }
      left -= b.length;
    }
    cursor = [isCmd ? x + 6 : 56, isCmd ? y : y];
    y += isCmd ? 64 : 54;
  }
  if (typed >= total) cursor = [56, y];
  if (cursor && Math.floor(now / 530) % 2 === 0) { sx.fillStyle = "#e8e8e2"; sx.fillRect(cursor[0], cursor[1] - 28, 18, 34); }
  // scanline texture
  sx.fillStyle = "rgba(255,255,255,.025)"; for (let yy = 0; yy < 640; yy += 4) sx.fillRect(0, yy, 1024, 1);
  screenTex.needsUpdate = true;
};

// --- interaction: drag to spin with inertia, gentle tilt toward the pointer ---
let rotY = -0.42, rotX = 0.06, velY = 0, dragging = false, lastX = 0, pointer = { x: 0, y: 0 };
const el = renderer.domElement;
el.addEventListener("pointerdown", e => { dragging = true; lastX = e.clientX; el.setPointerCapture(e.pointerId); });
el.addEventListener("pointermove", e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; velY = dx * 0.006; rotY += velY; });
el.addEventListener("pointerup", () => { dragging = false; });
addEventListener("pointermove", e => { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5; }, { passive: true });

const resize = () => {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.position.z = w / h < 0.9 ? 10.5 : 8.2; camera.updateProjectionMatrix();
};
new ResizeObserver(resize).observe(stage);

let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);
document.addEventListener("themechange", applyTheme);

await document.fonts.load('500 34px "JetBrains Mono"');
applyTheme(); resize();
t0 = performance.now();
const intro = reduced ? 1 : 0; let introK = intro;
const loop = (now) => {
  requestAnimationFrame(loop);
  if (!visible) return;
  if (!reduced) typed = Math.max(0, Math.min(total, Math.floor((now - t0 - 700) / 26)));
  drawScreen(now);
  if (!dragging) { velY *= 0.94; rotY += velY; if (!reduced) rotY += Math.sin(now / 2400) * 0.0009; }
  introK += (1 - introK) * 0.04;
  rig.rotation.y += ((rotY + pointer.x * 0.25) - rig.rotation.y) * 0.08;
  rig.rotation.x += ((rotX + pointer.y * 0.12) - rig.rotation.x) * 0.08;
  rig.position.y = (1 - introK) * -0.6 + (reduced ? 0 : Math.sin(now / 1800) * 0.03);
  rig.scale.setScalar(0.88 + introK * 0.12);
  ledGreen.material.color.setHex(Math.floor(now / 900) % 4 === 0 ? 0x1d5c3d : 0x3ccb86);
  ledBlue.material.color.setHex(Math.random() < 0.08 ? 0x2a326b : 0x6c78ff);
  renderer.render(scene, camera);
};
requestAnimationFrame(loop);
