/* Shared site script: config links, header, nav, fade-ins, and home-page rendering */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.SITE_CONFIG || {};
  const isSet = v => typeof v === "string" && v.trim() !== "" && !/YOUR-/i.test(v);
  window.__site = { $, $$, CFG, isSet };

  /* ---------- Config → links ---------- */
  const href = {
    email: v => "mailto:" + v.trim(),
    whatsapp: v => "https://wa.me/" + v.replace(/\D/g, ""),
  };
  ["email", "linkedin", "github", "whatsapp", "upwork", "fiverr", "instagram", "cv"].forEach(k => {
    const v = CFG[k];
    $$(`[data-link="${k}"]`).forEach(a => {
      if (isSet(v)) a.href = (href[k] || (x => x))(v);
      else (a.closest("li") || a).style.display = "none";
    });
  });
  $$('[data-text="email"]').forEach(el => { if (isSet(CFG.email)) el.textContent = CFG.email.trim(); });
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Local time (Karachi) ---------- */
  const lt = $("#localTime");
  if (lt) {
    const tick = () => {
      try { lt.textContent = "Karachi " + new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit" }).format(new Date()); }
      catch { lt.textContent = "Karachi, PK"; }
    };
    tick(); setInterval(tick, 30000);
  }

  /* ---------- Header + menu ---------- */
  const top = $("#top"), nav = $("#nav"), btn = $("#menuBtn");
  const onScroll = () => top && top.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (btn) {
    btn.addEventListener("click", () => {
      const open = !nav.classList.contains("open");
      nav.classList.toggle("open", open); btn.setAttribute("aria-expanded", open); btn.textContent = open ? "Close" : "Menu";
    });
    $$("a", nav).forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); btn.setAttribute("aria-expanded", false); btn.textContent = "Menu"; }));
  }
  const secs = $$("main section[id]");
  if (secs.length && nav) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) $$("a", nav).forEach(a => a.classList.toggle("active", a.getAttribute("href").endsWith("#" + e.target.id)));
    }), { rootMargin: "-40% 0px -55% 0px" });
    secs.forEach(s => spy.observe(s));
  }

  /* ---------- Fade-in on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08, rootMargin: "0px 0px -30px 0px" });
  window.__site.observe = el => io.observe(el);
  const observeAll = () => $$(".fade:not(.in)").forEach(el => io.observe(el));

  /* ---------- Home page ---------- */
  const P = window.PROJECTS || [];
  const catName = Object.fromEntries(window.CATEGORIES || []);
  const num = i => String(i + 1).padStart(2, "0");
  const grid = $("#workGrid");
  if (grid) {
    $("#workCount").textContent = `(${num(P.length - 1)})`;
    $("#filters").innerHTML = window.CATEGORIES.map(([k, v], i) => {
      const n = k === "all" ? P.length : P.filter(p => p.cats.includes(k)).length;
      return `<button class="filter${i ? "" : " active"}" data-f="${k}" role="tab" aria-selected="${!i}">${v}<sup>${n}</sup></button>`;
    }).join("");
    grid.innerHTML = P.map((p, i) => `
      <a class="card fade" href="project.html?p=${p.id}" data-cats="${p.cats.join(" ")}" style="--d:${(i % 2) * .08}s">
        <div class="card-img${p.fit === "contain" ? " contain" : ""}"><img src="${p.cover}" alt="${p.title}" loading="lazy"></div>
        <div class="card-meta">
          <span class="card-no">${num(i)}</span>
          <h3 class="card-title">${p.title}</h3>
          <span class="card-arrow" aria-hidden="true">→</span>
          <p class="card-sub">${p.tagline}</p>
          <span class="card-tags">${p.cats.map(c => catName[c]).join(" / ")} — ${p.client}</span>
        </div>
      </a>`).join("");
    $("#filters").addEventListener("click", e => {
      const b = e.target.closest(".filter"); if (!b) return;
      $$("#filters .filter").forEach(x => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b); });
      $$("#workGrid .card").forEach(c => c.classList.toggle("hidden", b.dataset.f !== "all" && !c.dataset.cats.split(" ").includes(b.dataset.f)));
    });
  }

  const svcList = $("#servicesList");
  if (svcList) {
    const S = [
      ["PCB Design & Layout", "Schematic capture to production-ready files for mixed-signal, high-current and power boards — designed for manufacture from the start.", "Schematic PDF · Gerber + drill · BOM with LCSC parts · CPL for SMT · 3D STEP"],
      ["Embedded Firmware", "Reliable bare-metal and HAL firmware for STM32, ESP32 and AVR: timers, PWM with dead-time, DMA, interrupts, low-power modes and communications.", "C / C++ source · I²C, SPI, UART, CAN, BLE drivers · test builds · bring-up support"],
      ["IoT & Connected Devices", "End-to-end connected products — the device, a wireless link that survives dropouts, a backend, and a dashboard your team will use.", "ESP-NOW / BLE / Wi-Fi · MQTT / REST / WebSocket · web dashboard · CI/CD deployment"],
      ["MATLAB & Simulink", "Models that answer engineering questions before hardware exists: motor drives, converters, control loops, renewables and signal processing.", "Documented .m / .slx · parameter sweeps · FFT / THD reports · controller gains"],
      ["Power Electronics & Motor Control", "High-voltage, high-current design done carefully: inverters, SMPS, gate drive, protection and current sensing.", "Sensorless BLDC · buck / boost SMPS · 3-phase inverters · solar pump drives"],
      ["Simulation & Verification", "Finite-element checks of electromagnetic and thermal behaviour in Ansys, cross-checked against analytical models.", "Maxwell 2D / RMxprt · Icepak steady & transient · loss and efficiency maps"]
    ];
    svcList.innerHTML = S.map(([t, d, x], i) => `
      <li class="svc fade"><span class="svc-no">${num(i)}</span><h3>${t}</h3><div><p>${d}</p><div class="deliv">${x}</div></div></li>`).join("");
  }

  const certList = $("#certList");
  if (certList) {
    const C = window.CERTS || [];
    $("#certCount").textContent = `(${C.length})`;
    certList.innerHTML = C.map(c => `
      <li class="fade"><a class="row" href="${c.pdf}" target="_blank" rel="noopener">
        <span class="row-b">${c.title}</span><span class="row-c muted">${c.issuer}</span><span class="row-date muted mono small">${c.date}</span><span class="row-d">View ↗</span>
      </a></li>`).join("");
  }

  const form = $("#contactForm");
  if (form) form.addEventListener("submit", async e => {
    e.preventDefault();
    const note = $("#formNote"), d = Object.fromEntries(new FormData(form));
    note.className = "form-note small";
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || !d.message.trim()) { note.textContent = "Please add your name, a valid email and a few project details."; note.classList.add("err"); return; }
    const subject = `Project enquiry: ${d.type} — ${d.name}`;
    const body = `Name: ${d.name}\nEmail: ${d.email}\nProject type: ${d.type}\n\n${d.message}`;
    if (isSet(CFG.formspreeId)) {
      note.textContent = "Sending…";
      try {
        const r = await fetch("https://formspree.io/f/" + CFG.formspreeId, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ ...d, _subject: subject }) });
        if (!r.ok) throw 0;
        form.reset(); note.textContent = "Thanks — your message is on its way. I'll reply within 24 hours."; note.classList.add("ok");
      } catch { note.textContent = "Couldn't send right now — please email me directly."; note.classList.add("err"); }
    } else if (isSet(CFG.email)) {
      location.href = `mailto:${CFG.email.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      note.textContent = "Opening your email app…"; note.classList.add("ok");
    } else { note.textContent = "Please reach me on LinkedIn for now."; note.classList.add("err"); }
  });

  // intro reveals immediately
  requestAnimationFrame(() => $$(".intro .fade").forEach((el, i) => { el.style.setProperty("--d", i * .08 + "s"); el.classList.add("in"); }));
  observeAll();
})();
