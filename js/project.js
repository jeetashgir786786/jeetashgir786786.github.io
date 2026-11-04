/* Case-study page: project.html?p=<id> */
(() => {
  "use strict";
  const { $, $$ } = window.__site;
  const P = window.PROJECTS || [];
  const catName = Object.fromEntries(window.CATEGORIES || []);
  const id = new URLSearchParams(location.search).get("p");
  const i = Math.max(0, P.findIndex(p => p.id === id));
  const p = P[i];
  const main = $("#case");
  if (!p || (id && P.findIndex(x => x.id === id) < 0)) {
    main.innerHTML = `<div class="not-found"><h1 class="case-title">Project not found</h1><p><a class="ul" href="./#work">← Back to all work</a></p></div>`;
    return;
  }
  const num = n => String(n + 1).padStart(2, "0");
  document.title = `${p.title} — Jeetash Goswami`;
  const md = document.querySelector('meta[name="description"]'); if (md) md.content = p.tagline;

  $("#cIndex").textContent = `Case study ${num(i)} / ${num(P.length - 1)}`;
  $("#cTitle").textContent = p.title;
  $("#cLead").textContent = p.tagline;
  $("#cFacts").innerHTML = `
    <div><dt>Client</dt><dd>${p.client}</dd></div>
    <div><dt>Discipline</dt><dd>${p.cats.map(c => catName[c]).join(", ")}</dd></div>
    <div><dt>Tools</dt><dd>${p.stack.slice(0, 5).join(", ")}${p.stack.length > 5 ? "…" : ""}</dd></div>`;
  $("#cHero").innerHTML = `<img src="${p.images[0]}" alt="${p.title}">`;
  $("#cSummary").textContent = p.summary;
  $("#cStats").innerHTML = p.stats.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join("");
  $("#cList").innerHTML = p.highlights.map(h => `<li><span>${h}</span></li>`).join("") +
    `<li><span><span class="muted">Full stack:</span> ${p.stack.join(", ")}</span></li>`;
  if (p.links && p.links.length) $("#cLinks").innerHTML = p.links.map(([t, u]) => `<a class="ul" href="${u}" target="_blank" rel="noopener">${t} ↗</a>`).join("");
  else $("#cLinksWrap").remove();

  const rest = p.images.slice(1);
  $("#cGallery").innerHTML = rest.map((src, k) => {
    const wide = rest.length % 2 === 1 && k === rest.length - 1;
    return `<figure class="fade${wide ? " wide" : ""}"><img src="${src}" alt="${p.title} — image ${k + 2}" loading="lazy"></figure>`;
  }).join("");
  if (!rest.length) $("#cGallery").remove();

  const nx = P[(i + 1) % P.length], nextEl = $("#cNext");
  nextEl.href = `project.html?p=${nx.id}`; $("b", nextEl).textContent = nx.title + " →";

  $$(".case-gallery .fade").forEach(el => window.__site.observe(el));

  // lightbox
  const lb = $("#lightbox"), lbImg = $("img", lb);
  main.addEventListener("click", e => {
    const img = e.target.closest(".case-hero img, .case-gallery img"); if (!img) return;
    lbImg.src = img.src; lbImg.alt = img.alt; lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
  });
  const close = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); };
  lb.addEventListener("click", close);
  addEventListener("keydown", e => e.key === "Escape" && close());
})();
