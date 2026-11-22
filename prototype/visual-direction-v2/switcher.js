// PROTOTYPE switcher: ?variant=object|field|type, ←/→ cycle. Not part of any design.
(function () {
  const V = window.PROTOTYPE_VARIANTS;
  const p = new URLSearchParams(location.search);
  const cur = V.findIndex(v => v[0] === window.PROTOTYPE_VARIANT);
  const go = d => { p.set("variant", V[(cur + d + V.length) % V.length][0]); p.delete("theme"); location.search = p.toString(); };
  const bar = document.createElement("div");
  bar.setAttribute("style", "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;display:flex;gap:10px;align-items:center;background:#ff00aa;color:#fff;font:600 13px/1 system-ui,sans-serif;padding:8px 10px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.35)");
  bar.innerHTML = `<button aria-label="Previous variant">←</button><span>PROTOTYPE ${cur + 1}/${V.length} · ${V[cur][1]}</span><button aria-label="Next variant">→</button>`;
  bar.querySelectorAll("button").forEach((b, i) => { b.setAttribute("style", "all:unset;cursor:pointer;padding:2px 8px"); b.onclick = () => go(i ? 1 : -1); });
  document.addEventListener("keydown", e => {
    if (e.target.closest("input,textarea,[contenteditable]")) return;
    if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1);
  });
  document.body.appendChild(bar);
})();
