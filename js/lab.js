/* Interactive engineering lab — FFT/THD, PID, PCB inspector, IoT node */
(() => {
  "use strict";
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const COL = { grid: "rgba(26,26,24,.07)", axis: "rgba(26,26,24,.25)", text: "#77746d", copper: "#c4501b", signal: "#1a1a18", blue: "#8f9aa6", red: "#b42318" };

  const setupCanvas = cv => {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return null;
    if (cv.width !== w * dpr || cv.height !== h * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
    const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    return { c, w, h };
  };
  const gridLines = (c, x0, y0, w, h, nx, ny) => {
    c.strokeStyle = COL.grid; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i <= nx; i++) { const x = x0 + (w * i) / nx; c.moveTo(x, y0); c.lineTo(x, y0 + h); }
    for (let j = 0; j <= ny; j++) { const y = y0 + (h * j) / ny; c.moveTo(x0, y); c.lineTo(x0 + w, y); }
    c.stroke();
  };
  const fillRange = el => { const p = ((el.value - el.min) / (el.max - el.min)) * 100; el.style.setProperty("--p", p + "%"); };
  $$('input[type=range]').forEach(el => { fillRange(el); el.addEventListener("input", () => fillRange(el)); });

  /* ======================= Tabs ======================= */
  const draws = {};
  $$(".lab-tab").forEach(t => t.addEventListener("click", () => {
    $$(".lab-tab").forEach(x => { x.classList.toggle("active", x === t); x.setAttribute("aria-selected", x === t); });
    $$(".lab-panel").forEach(p => p.classList.toggle("active", p.id === "lab-" + t.dataset.lab));
    requestAnimationFrame(() => draws[t.dataset.lab] && draws[t.dataset.lab]());
  }));
  addEventListener("resize", () => { const a = $(".lab-tab.active"); a && draws[a.dataset.lab] && draws[a.dataset.lab](); });

  /* ======================= FFT / THD ======================= */
  const fftIn = { f: $("#fftF"), h3: $("#fftH3"), h5: $("#fftH5"), h7: $("#fftH7"), h11: $("#fftH11"), n: $("#fftN") };
  const N = 1024, CYC = 8;
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
          re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }
  let noiseSeed = [];
  const regenNoise = () => { noiseSeed = Array.from({ length: N }, () => (Math.random() * 2 - 1) + (Math.random() * 2 - 1)); };
  regenNoise();
  function drawFFT() {
    const f0 = +fftIn.f.value, H = { 3: +fftIn.h3.value / 100, 5: +fftIn.h5.value / 100, 7: +fftIn.h7.value / 100, 11: +fftIn.h11.value / 100 }, nz = +fftIn.n.value / 100;
    ["h3", "h5", "h7", "h11"].forEach(k => ($("#o-" + k).textContent = fftIn[k].value + "%"));
    $("#o-noise").textContent = fftIn.n.value + "%";
    const A = 10, ph = { 3: 0, 5: Math.PI, 7: 0, 11: Math.PI };
    const x = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const th = 2 * Math.PI * CYC * i / N;
      let v = Math.sin(th);
      for (const h in H) v += H[h] * Math.sin(h * th + ph[h]);
      x[i] = A * (v + nz * .5 * noiseSeed[i]);
    }
    const re = Float64Array.from(x), im = new Float64Array(N); fft(re, im);
    const mag = h => (2 / N) * Math.hypot(re[h * CYC], im[h * CYC]);
    const fund = mag(1); let hs = 0; const bars = [];
    for (let h = 0; h <= 25; h++) { const m = mag(h) * (h === 0 ? .5 : 1); bars.push(m / fund * 100); }
    for (let h = 2; h < N / (2 * CYC); h++) hs += mag(h) ** 2;
    const thd = Math.sqrt(hs) / fund * 100;
    let pk = 0, rms = 0; for (const v of x) { pk = Math.max(pk, Math.abs(v)); rms += v * v; } rms = Math.sqrt(rms / N);
    const tEl = $("#thdOut"); tEl.textContent = thd.toFixed(2) + "%"; tEl.className = thd <= 5 ? "good" : thd <= 8 ? "warn" : "bad";
    $("#fundOut").textContent = `${fund.toFixed(2)} A`;
    $("#crestOut").textContent = (pk / rms).toFixed(2);
    const ie = $("#ieeeOut"); ie.textContent = thd <= 8 ? "Pass" : "Fail"; ie.className = thd <= 8 ? "good" : "bad";

    // time plot
    let s = setupCanvas($("#fftTime"));
    if (s) {
      const { c, w, h } = s, L = 44, T = 26, R = 12, B = 22, pw = w - L - R, phh = h - T - B;
      gridLines(c, L, T, pw, phh, 12, 4);
      const lim = Math.max(15, Math.ceil(pk / 5) * 5), n3 = Math.round(N * 3 / CYC);
      c.fillStyle = COL.text; c.font = "10px IBM Plex Mono, monospace"; c.textAlign = "right";
      [lim, 0, -lim].forEach((v, i) => c.fillText(v, L - 6, T + (phh * i) / 2 + 3));
      c.textAlign = "center"; [0, 1, 2, 3].forEach(k => c.fillText((k * 1000 / f0).toFixed(0) + " ms", L + pw * k / 3, h - 6));
      // ideal sine
      c.strokeStyle = "rgba(26,26,24,.25)"; c.setLineDash([3, 4]); c.beginPath();
      for (let i = 0; i <= n3; i++) { const X = L + pw * i / n3, Y = T + phh / 2 - (A * Math.sin(2 * Math.PI * CYC * i / N)) / lim * phh / 2; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }
      c.stroke(); c.setLineDash([]);
      c.strokeStyle = COL.copper; c.lineWidth = 1.6; c.beginPath();
      for (let i = 0; i <= n3; i++) { const X = L + pw * i / n3, Y = T + phh / 2 - x[i % N] / lim * phh / 2; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }
      c.stroke(); c.shadowBlur = 0;
    }
    // spectrum
    s = setupCanvas($("#fftSpec"));
    if (s) {
      const { c, w, h } = s, L = 44, T = 26, R = 12, B = 22, pw = w - L - R, phh = h - T - B;
      const bmax = Math.max(10, Math.ceil(Math.max(...bars.slice(2)) / 10) * 10);
      gridLines(c, L, T, pw, phh, 5, 4);
      c.fillStyle = COL.text; c.font = "10px IBM Plex Mono, monospace"; c.textAlign = "right";
      for (let j = 0; j <= 4; j++) c.fillText(Math.round(bmax * (4 - j) / 4) + "%", L - 6, T + phh * j / 4 + 3);
      const bw = pw / bars.length;
      c.textAlign = "center";
      bars.forEach((v, hI) => {
        if (hI === 1) return; // fundamental is 100% — omitted to show harmonics
        const bh = Math.min(1, v / bmax) * phh, X = L + bw * hI + bw * .18;
        c.fillStyle = COL.signal; c.fillRect(X, T + phh - bh, bw * .64, bh);
        if (hI % 5 === 0) { c.fillStyle = COL.text; c.fillText(hI * f0, L + bw * hI + bw / 2, h - 6); }
      });
      c.fillStyle = COL.text; c.textAlign = "left";
      c.fillText(`fundamental (${f0} Hz) = 100% · not drawn`, L + bw * 1.2, T + 12);
    }
  }
  Object.values(fftIn).forEach(el => el.addEventListener("input", drawFFT));
  fftIn.n.addEventListener("change", regenNoise);
  const presets = { clean: [0, 1, 1, 0, 1], vfd: [2, 22, 13, 8, 3], smps: [48, 30, 18, 6, 4] };
  $$("[data-preset]").forEach(b => b.addEventListener("click", () => {
    const [a, b5, c7, d, n] = presets[b.dataset.preset];
    fftIn.h3.value = a; fftIn.h5.value = b5; fftIn.h7.value = c7; fftIn.h11.value = d; fftIn.n.value = n;
    Object.values(fftIn).forEach(el => el.type === "range" && fillRange(el)); regenNoise(); drawFFT();
  }));
  draws.fft = drawFFT;

  /* ======================= PID ======================= */
  const kp = $("#kp"), ki = $("#ki"), kd = $("#kd");
  function simPID(Kp, Ki, Kd) {
    const dt = .001, T = 4, n = T / dt, y = new Float64Array(n + 1), tau1 = .5, tau2 = .1, Nf = 60;
    let x1 = 0, yy = 0, I = 0, D = 0, ePrev = 1;
    for (let i = 1; i <= n; i++) {
      const e = 1 - yy;
      I += e * dt;
      D += (Nf * (Kd * (e - ePrev) / dt - D)) * dt; D = isFinite(D) ? D : 0; ePrev = e;
      const u = Kp * e + Ki * I + D;
      x1 += (u - x1) / tau1 * dt; yy += (x1 - yy) / tau2 * dt;
      if (!isFinite(yy) || Math.abs(yy) > 1e3) { for (let k = i; k <= n; k++) y[k] = NaN; return { y, dt, unstable: true }; }
      y[i] = yy;
    }
    return { y, dt, unstable: Math.abs(y[n] - y[n - 400]) > .05 && Math.abs(y[n] - 1) > .5 };
  }
  function drawPID() {
    const Kp = +kp.value, Ki = +ki.value, Kd = +kd.value;
    $("#o-kp").textContent = Kp.toFixed(1); $("#o-ki").textContent = Ki.toFixed(1); $("#o-kd").textContent = Kd.toFixed(2);
    const { y, dt, unstable } = simPID(Kp, Ki, Kd), n = y.length - 1;
    const fin = y[n];
    let t10 = null, t90 = null, ymax = -Infinity, settle = 0;
    for (let i = 0; i <= n; i++) {
      const v = y[i]; if (isNaN(v)) break;
      if (t10 === null && v >= .1) t10 = i * dt; if (t90 === null && v >= .9) t90 = i * dt;
      ymax = Math.max(ymax, v); if (Math.abs(v - 1) > .02) settle = i * dt;
    }
    const set = (id, txt, cls) => { const el = $(id); el.textContent = txt; el.className = cls || ""; };
    if (unstable || isNaN(fin)) { ["#pidRise", "#pidOs", "#pidSettle", "#pidSse"].forEach(id => set(id, "Unstable", "bad")); }
    else {
      set("#pidRise", t10 !== null && t90 !== null ? ((t90 - t10) * 1000).toFixed(0) + " ms" : "> 4 s", t90 !== null && t90 - t10 < .6 ? "good" : "warn");
      const os = Math.max(0, (ymax - 1) * 100); set("#pidOs", os.toFixed(1) + "%", os < 10 ? "good" : os < 25 ? "warn" : "bad");
      set("#pidSettle", settle < 3.99 ? settle.toFixed(2) + " s" : "> 4 s", settle < 1.5 ? "good" : "warn");
      const sse = Math.abs(1 - fin) * 100; set("#pidSse", sse.toFixed(2) + "%", sse < 2 ? "good" : "bad");
    }
    const s = setupCanvas($("#pidPlot")); if (!s) return;
    const { c, w, h } = s, L = 44, T = 30, R = 14, B = 26, pw = w - L - R, phh = h - T - B;
    const top = Math.min(2.5, Math.max(1.4, isFinite(ymax) ? Math.ceil(ymax * 5 + .5) / 5 : 1.4)), bot = -0.1;
    const Y = v => T + phh * (top - v) / (top - bot), X = t => L + pw * t / 4;
    gridLines(c, L, T, pw, phh, 8, 5);
    c.fillStyle = COL.text; c.font = "10px IBM Plex Mono, monospace"; c.textAlign = "right";
    for (let j = 0; j <= 5; j++) { const v = bot + (top - bot) * (5 - j) / 5; c.fillText(v.toFixed(1), L - 6, T + phh * j / 5 + 3); }
    c.textAlign = "center"; for (let t = 0; t <= 4; t++) c.fillText(t + " s", X(t), h - 8);
    // 2% band
    c.fillStyle = "rgba(196,80,27,.07)"; c.fillRect(L, Y(1.02), pw, Y(.98) - Y(1.02));
    // reference
    c.strokeStyle = "rgba(26,26,24,.45)"; c.setLineDash([4, 4]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(0), Y(1)); c.lineTo(X(4), Y(1)); c.stroke(); c.setLineDash([]);
    // response
    c.save(); c.beginPath(); c.rect(L, T, pw, phh); c.clip();
    c.strokeStyle = unstable ? COL.red : COL.copper; c.lineWidth = 1.8; c.beginPath();
    for (let i = 0; i <= n; i += 4) { const v = y[i]; if (isNaN(v)) break; const px = X(i * dt), py = Y(Math.max(bot - 1, Math.min(top + 1, v))); i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke(); c.restore();
    c.textAlign = "left"; c.fillStyle = COL.copper; c.fillText("● y(t)", L + 10, T + 14); c.fillStyle = COL.text; c.fillText("- - r(t) step", L + 70, T + 14); c.fillStyle = COL.copper; c.fillText("▮ ±2% band", L + 170, T + 14);
  }
  [kp, ki, kd].forEach(el => el.addEventListener("input", drawPID));
  $$("[data-pid]").forEach(b => b.addEventListener("click", () => {
    const [a, i, d] = b.dataset.pid.split(",").map(Number); kp.value = a; ki.value = i; kd.value = d; [kp, ki, kd].forEach(fillRange); drawPID();
  }));
  draws.pid = drawPID;

  /* ======================= PCB inspector ======================= */
  const svg = $("#pcbSvg");
  const parts = [
    { id: "U1", x: 330, y: 30, w: 120, h: 150, name: "ESP32-S3-WROOM-1", info: "Dual-core Wi-Fi/BLE MCU module. Antenna overhangs the board edge with a copper keep-out zone for maximum RF range.", kind: "module" },
    { id: "J1", x: 28, y: 168, w: 34, h: 54, name: "USB-C receptacle", info: "Power + programming. 5.1 kΩ CC pull-downs for PD-charger compatibility; USBLC6 ESD protection on data lines.", kind: "conn" },
    { id: "U3", x: 96, y: 160, w: 44, h: 40, name: "Buck / charger IC", info: "Switch-mode stage with a tight input-cap → IC → inductor loop to keep EMI low.", kind: "ic" },
    { id: "L1", x: 98, y: 228, w: 40, h: 40, name: "Power inductor", info: "Shielded inductor placed right next to the switch node to minimise loop area.", kind: "ind" },
    { id: "U2", x: 168, y: 84, w: 40, h: 34, name: "AMS1117-3.3 LDO", info: "Low-noise 3.3 V rail for logic and analog references, fed from the 5 V buck output.", kind: "ic" },
    { id: "K1", x: 424, y: 244, w: 86, h: 100, name: "30 A relay", info: "Switches the 24 V pump load. Driven by Q1 with a flyback diode across the coil.", kind: "relay" },
    { id: "Q1", x: 372, y: 272, w: 34, h: 32, name: "AOD4184A N-MOSFET", info: "Logic-level low-side switch with gate resistor and pull-down so the load stays off during boot.", kind: "ic" },
    { id: "J2", x: 520, y: 252, w: 40, h: 84, name: "Screw terminal", info: "High-current field wiring. 4 mm traces and copper pours carry the load current.", kind: "term" },
    { id: "J3", x: 146, y: 324, w: 100, h: 22, name: "Sensor header", info: "I²C + 1-Wire header with 4.7 kΩ pull-ups for ToF and DS18B20 sensors.", kind: "hdr" },
    { id: "SW1", x: 250, y: 296, w: 30, h: 30, name: "BOOT button", info: "Tactile switch for bench flashing; hardware-debounced into a GPIO.", kind: "btn" },
    { id: "D1", x: 300, y: 300, w: 16, h: 10, name: "Status LED", info: "Heartbeat / Wi-Fi status indicator driven from a spare GPIO.", kind: "led" },
    { id: "C1", x: 214, y: 132, w: 22, h: 14, name: "Decoupling capacitors", info: "0.1 µF + 10 µF placed at every supply pin, shortest possible path to ground.", kind: "cap" }
  ];
  const top = [
    [[62, 182], [80, 182], [96, 172]], [[140, 180], [150, 190], [150, 228], [138, 240]],
    [[118, 268], [118, 290], [150, 290], [160, 280], [160, 104], [168, 101]],
    [[208, 101], [258, 101], [276, 119], [330, 119]], [[208, 108], [225, 125], [225, 132]],
    [[450, 140], [476, 140], [494, 158], [494, 220], [470, 244]],
    [[450, 160], [466, 176], [466, 222], [404, 272]],
    [[406, 290], [424, 290]], [[330, 170], [306, 194], [306, 300]],
    [[330, 150], [300, 150], [265, 185], [265, 296]]
  ];
  const power = [[[510, 262], [520, 262]], [[510, 326], [520, 326]], [[62, 206], [80, 206], [80, 230], [98, 240]]];
  const bottom = [
    [[170, 324], [170, 240], [190, 220], [300, 220], [340, 180]],
    [[190, 324], [190, 256], [206, 240], [310, 240], [360, 190], [360, 180]],
    [[210, 324], [210, 272], [222, 260], [330, 260], [380, 210], [380, 180]],
    [[230, 324], [230, 290], [245, 276], [360, 276], [372, 288]]
  ];
  const vias = [[340, 180], [360, 180], [380, 180], [372, 288], [170, 324], [190, 324], [210, 324], [230, 324], [225, 132], [306, 300], [265, 296]];
  const path = pts => "M" + pts.map(p => p.join(",")).join("L");
  const INK = "#1a1a18", PAPER = "#fbfaf7", CU = "#c4501b", CU2 = "#8f9aa6";
  const partSVG = p => {
    const box = (fill = PAPER) => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="2" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>`;
    let inner = box();
    if (p.kind === "module") inner = box("#efede8") + `<rect x="${p.x + 8}" y="${p.y + 42}" width="${p.w - 16}" height="${p.h - 52}" fill="none" stroke="${INK}" stroke-width=".8"/><path d="M${p.x + 10} ${p.y + 12}h20v12h14v-12h14v12h14v-12h14v12h14" stroke="${INK}" stroke-width="1.2" fill="none"/><text x="${p.x + p.w / 2}" y="${p.y + 100}" font-size="9" fill="${INK}" text-anchor="middle">ESP32-S3</text>`;
    if (p.kind === "relay") inner = box() + `<text x="${p.x + p.w / 2}" y="${p.y + p.h / 2 + 3}" font-size="9" fill="${INK}" text-anchor="middle">24 V · 30 A</text>`;
    if (p.kind === "term") inner = box() + `<circle cx="${p.x + 20}" cy="${p.y + 20}" r="7" fill="none" stroke="${INK}"/><circle cx="${p.x + 20}" cy="${p.y + 64}" r="7" fill="none" stroke="${INK}"/>`;
    if (p.kind === "conn") inner = box("#efede8") + `<rect x="${p.x + 5}" y="${p.y + 14}" width="9" height="26" rx="4" fill="none" stroke="${INK}"/>`;
    if (p.kind === "ind") inner = box() + `<circle cx="${p.x + p.w / 2}" cy="${p.y + p.h / 2}" r="12" fill="none" stroke="${INK}"/>`;
    if (p.kind === "hdr") inner = box() + [0, 1, 2, 3].map(i => `<rect x="${p.x + 18 + i * 20}" y="${p.y + 6}" width="8" height="10" fill="none" stroke="${INK}"/>`).join("");
    if (p.kind === "btn") inner = box() + `<circle cx="${p.x + 15}" cy="${p.y + 15}" r="8" fill="none" stroke="${INK}"/>`;
    if (p.kind === "led") inner = box(CU);
    if (p.kind === "cap") inner = [0, 1].map(i => `<rect x="${p.x + i * 13}" y="${p.y}" width="9" height="${p.h}" fill="${PAPER}" stroke="${INK}"/>`).join("");
    if (p.kind === "ic") inner += `<circle cx="${p.x + 6}" cy="${p.y + 6}" r="1.8" fill="${INK}"/>` + [0, 1, 2].map(i => `<rect x="${p.x - 4}" y="${p.y + 6 + i * (p.h - 12) / 2 - 2}" width="4" height="4" fill="${INK}"/><rect x="${p.x + p.w}" y="${p.y + 6 + i * (p.h - 12) / 2 - 2}" width="4" height="4" fill="${INK}"/>`).join("");
    return `<g class="part" data-id="${p.id}" tabindex="0">${inner}</g>`;
  };
  svg.innerHTML = `
    <defs>
      <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="rgba(26,26,24,.12)" stroke-width="1"/></pattern>
      <pattern id="keep" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="5" stroke="rgba(196,80,27,.45)" stroke-width="1"/></pattern>
    </defs>
    <rect x="40" y="30" width="520" height="340" rx="10" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>
    <g class="layer" data-l="bottom">
      <rect x="54" y="220" width="300" height="136" rx="4" fill="url(#hatch)"/>
      ${bottom.map(p => `<path d="${path(p)}" stroke="${CU2}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 0"/>`).join("")}
    </g>
    <g class="layer" data-l="top">
      <rect x="318" y="22" width="144" height="46" fill="url(#keep)" stroke="${CU}" stroke-width=".8" stroke-dasharray="3 3"/>
      ${top.map(p => `<path d="${path(p)}" stroke="${CU}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}
      ${power.map(p => `<path d="${path(p)}" stroke="${CU}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join("")}
      ${vias.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>`).join("")}
      ${[[62, 48], [538, 48], [62, 352], [538, 352]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${INK}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${INK}" stroke-width=".8"/>`).join("")}
    </g>
    <g class="layer" data-l="parts">${parts.map(partSVG).join("")}</g>
    <g class="layer" data-l="silk" font-family="IBM Plex Mono, monospace" font-size="9" fill="${INK}">
      ${parts.map(p => `<text x="${p.x}" y="${p.y - 4}">${p.id}</text>`).join("")}
      <text x="80" y="362" font-size="8" fill="#77746d">RF keep-out (top edge) · 24 V zone (right)</text>
      <text x="470" y="60" font-size="10">JG-NODE v1.2</text>
      <text x="470" y="73" font-size="8" fill="#77746d">2L · 1.6 mm FR4</text>
      <rect x="418" y="238" width="148" height="112" fill="none" stroke="${INK}" stroke-dasharray="2 3" opacity=".5"/>
    </g>`;
  $$("[data-layer]").forEach(cb => cb.addEventListener("change", () => svg.querySelector(`[data-l="${cb.dataset.layer}"]`).classList.toggle("off", !cb.checked)));
  const info = $("#pcbInfo");
  const showPart = id => {
    const p = parts.find(x => x.id === id); if (!p) return;
    $$("#pcbSvg .part").forEach(g => g.classList.toggle("hl", g.dataset.id === id));
    info.innerHTML = `<span class="mono label">${p.id}</span><b>${p.name}</b><p class="muted small">${p.info}</p>`;
  };
  svg.addEventListener("pointerover", e => { const g = e.target.closest(".part"); g && showPart(g.dataset.id); });
  svg.addEventListener("focusin", e => { const g = e.target.closest(".part"); g && showPart(g.dataset.id); });
  svg.addEventListener("click", e => { const g = e.target.closest(".part"); g && showPart(g.dataset.id); });
  const stage = $("#pcbStage");
  $("#drcBtn").addEventListener("click", () => {
    const scan = $("#drcScan"), log = $("#drcLog");
    scan.classList.remove("run"); void scan.offsetWidth; scan.classList.add("run"); log.className = "drc-log mono";
    const steps = ["Checking copper clearance (0.152 mm)…", "Checking trace widths vs current…", "Checking RF keep-out zone…", "Checking drill & annular rings…", "✓ DRC passed — 0 errors · 0 warnings · " + (top.length + bottom.length + power.length) + " nets routed"];
    steps.forEach((s, i) => setTimeout(() => { log.textContent = s; if (i === steps.length - 1) log.classList.add("ok"); }, i * 420));
  });

  /* ======================= IoT node ======================= */
  const iot = { relay: false, online: true, buf: 0, temp: 31, hum: 55, cur: .18, series: [], retry: 0, timer: null, retryT: null };
  const log = (html) => { const m = $("#mqttLog"), d = document.createElement("div"); d.innerHTML = html; m.appendChild(d); while (m.children.length > 9) m.firstChild.remove(); };
  const ts = () => new Date().toLocaleTimeString([], { hour12: false });
  const gauge = (id, v, min, max, dec) => { const el = $(id), f = Math.max(0, Math.min(1, (v - min) / (max - min))); el.querySelector(".g-fg").style.strokeDashoffset = 157 * (1 - f); el.querySelector("b").textContent = v.toFixed(dec); };
  function iotTick() {
    iot.cur += ((iot.relay ? 6.4 : .18) - iot.cur) * .35 + (iot.relay ? (Math.random() - .5) * .5 : (Math.random() - .5) * .04);
    iot.temp += ((iot.relay ? 46 : 31) - iot.temp) * .04 + (Math.random() - .5) * .25;
    iot.hum += (55 - iot.hum) * .05 + (Math.random() - .5) * 1.2;
    iot.series.push({ t: iot.temp, i: Math.max(0, iot.cur), off: !iot.online }); if (iot.series.length > 60) iot.series.shift();
    gauge("#gTemp", iot.temp, 20, 60, 1); gauge("#gCur", Math.max(0, iot.cur), 0, 10, 2); gauge("#gHum", iot.hum, 0, 100, 0);
    const payload = `{"t":${iot.temp.toFixed(1)},"i":${Math.max(0, iot.cur).toFixed(2)},"h":${iot.hum.toFixed(0)}}`;
    if (iot.online) log(`<span class="t">${ts()} →</span> plant/node07/telemetry ${payload}`);
    else { iot.buf++; $("#iotBuf").textContent = iot.buf; }
    if (iot.relay && iot.cur > 7.2) log(`<span class="e">${ts()} ⚠</span> overcurrent watch: ${iot.cur.toFixed(2)} A`);
    drawIoT();
  }
  function drawIoT() {
    const s = setupCanvas($("#iotPlot")); if (!s) return;
    const { c, w, h } = s, L = 40, T = 46, R = 40, B = 20, pw = w - L - R, phh = h - T - B, n = 60;
    gridLines(c, L, T, pw, phh, 12, 5);
    c.font = "10px IBM Plex Mono, monospace"; c.fillStyle = COL.copper; c.textAlign = "right";
    for (let j = 0; j <= 5; j++) c.fillText(60 - j * 8, L - 6, T + phh * j / 5 + 3);
    c.fillStyle = COL.signal; c.textAlign = "left";
    for (let j = 0; j <= 5; j++) c.fillText(10 - j * 2, w - R + 6, T + phh * j / 5 + 3);
    const X = i => L + pw * (i + (n - iot.series.length)) / (n - 1);
    iot.series.forEach((p, i) => { if (p.off) { c.fillStyle = "rgba(180,35,24,.06)"; c.fillRect(X(i) - pw / n / 2, T, pw / n + 1, phh); } });
    const line = (key, min, max, col) => {
      c.strokeStyle = col; c.lineWidth = 1.6; c.beginPath();
      iot.series.forEach((p, i) => { const y = T + phh * (1 - (p[key] - min) / (max - min)); i ? c.lineTo(X(i), y) : c.moveTo(X(i), y); });
      c.stroke(); c.shadowBlur = 0;
      const lp = iot.series[iot.series.length - 1]; if (lp) { c.fillStyle = col; c.beginPath(); c.arc(X(iot.series.length - 1), T + phh * (1 - (lp[key] - min) / (max - min)), 3.5, 0, 7); c.fill(); }
    };
    line("t", 20, 60, COL.copper); line("i", 0, 10, COL.signal);
    c.textAlign = "right"; c.fillStyle = COL.red; c.fillText("▮ offline", w - R, 32);
    c.fillStyle = COL.signal; c.fillText("● Current A", w - R - 70, 32); c.fillStyle = COL.copper; c.fillText("● Temp °C", w - R - 160, 32);
  }
  $("#iotRelay").addEventListener("click", () => {
    iot.relay = !iot.relay;
    $("#iotRelayState").textContent = iot.relay ? "ON" : "OFF"; $("#iotRelayState").className = iot.relay ? "warn" : "";
    const cmd = `{"relay":"${iot.relay ? "ON" : "OFF"}"}`;
    if (iot.online) { log(`<span class="c">${ts()} ←</span> plant/node07/cmd ${cmd}`); setTimeout(() => iot.online && log(`<span class="t">${ts()} →</span> plant/node07/ack ${cmd} ok`), 250); }
    else log(`<span class="e">${ts()} ✕</span> cmd queued locally (link down) — applied via physical override`);
  });
  const goOnline = () => {
    iot.online = true; clearTimeout(iot.retryT);
    $("#iotLink").textContent = "● Online"; $("#iotLink").className = "ok"; $("#iotWifi").textContent = "Drop Wi‑Fi";
    log(`<span class="t">${ts()} ✓</span> wifi: reconnected, MQTT session resumed`);
    if (iot.buf) log(`<span class="t">${ts()} →</span> flushed ${iot.buf} buffered samples (QoS 1)`);
    iot.buf = 0; $("#iotBuf").textContent = 0;
  };
  const retry = () => {
    if (iot.online) return; iot.retry++;
    const d = Math.min(8, 2 ** (iot.retry - 1));
    log(`<span class="e">${ts()} ↻</span> wifi: reconnect attempt ${iot.retry} (backoff ${d}s)`);
    if (iot.retry >= 4) { iot.retryT = setTimeout(goOnline, 1200); return; }
    iot.retryT = setTimeout(retry, d * 700);
  };
  $("#iotWifi").addEventListener("click", () => {
    if (iot.online) {
      iot.online = false; iot.retry = 0;
      $("#iotLink").textContent = "● Offline"; $("#iotLink").className = "bad"; $("#iotWifi").textContent = "Restore Wi‑Fi";
      log(`<span class="e">${ts()} ✕</span> wifi: link lost — buffering to flash`);
      iot.retryT = setTimeout(retry, 700);
    } else goOnline();
  });
  // run only while visible
  const iotPanel = $("#lab-iot");
  const iotRun = () => {
    const vis = iotPanel.classList.contains("active") && labVisible && !document.hidden;
    if (vis && !iot.timer) { iotTick(); iot.timer = setInterval(iotTick, 800); }
    if (!vis && iot.timer) { clearInterval(iot.timer); iot.timer = null; }
  };
  let labVisible = false;
  new IntersectionObserver(([e]) => { labVisible = e.isIntersecting; iotRun(); if (labVisible) { const a = $(".lab-tab.active"); draws[a.dataset.lab] && draws[a.dataset.lab](); } }).observe($(".lab"));
  $$(".lab-tab").forEach(t => t.addEventListener("click", () => setTimeout(iotRun, 30)));
  document.addEventListener("visibilitychange", iotRun);
  for (let i = 0; i < 25; i++) { iot.cur += (.18 - iot.cur) * .35; iot.temp += (31 - iot.temp) * .04 + (Math.random() - .5) * .25; iot.hum += (Math.random() - .5); iot.series.push({ t: iot.temp, i: iot.cur, off: false }); }
  log(`<span class="t">${ts()} ✓</span> node07 booted · fw 1.4.2 · RSSI -58 dBm`);
  log(`<span class="t">${ts()} ✓</span> MQTT connected · broker.plant.local:8883 (TLS)`);
  draws.iot = drawIoT;

  drawFFT();
})();
