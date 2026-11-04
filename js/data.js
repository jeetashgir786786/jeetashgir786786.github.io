/* Project + certificate content. Add a new project by copying one object. */
const IMG = "assets/img/projects/";

window.PROJECTS = [
  {
    id: "bldc",
    title: "1.5 kW Sensorless BLDC Solar Pump Controller",
    tagline: "Industrial motor controller running straight off 60–200 V DC solar panels.",
    cats: ["pcb", "embedded", "power"],
    client: "Freelance client",
    cover: IMG + "bldc-2.webp",
    images: ["bldc-2.webp", "bldc-4.webp", "bldc-1.webp", "bldc-3.webp"].map(i => IMG + i),
    stats: [["1.5 kW", "Output power"], ["200 V", "Max DC input"], ["20 kHz", "PWM, dead-time"], ["15 A", "Continuous"]],
    stack: ["STM32F103", "C / HAL", "STM32CubeIDE", "EasyEDA Pro", "IRFB4115", "FD2606S", "LNK306", "DMA ADC"],
    summary: "End-to-end product development of a controller for a 1 HP submersible solar water pump: high-voltage hardware architecture, schematic capture, 2-layer PCB layout and embedded C firmware for an STM32, driving a 72 V / 13.5 A sensorless BLDC motor (4- and 6-pole).",
    highlights: [
      "Input protection stage with cartridge fuse, MOV, Y-caps to earth for surge/lightning, and MUR3060P reverse-polarity diode.",
      "Custom non-isolated LNK306PN buck SMPS stepping 200 V DC to a 15 V bus, cascaded into 5 V / 3.3 V rails for clean logic power.",
      "3-phase inverter with six IRFB4115 MOSFETs on an external heatsink, FD2606S bootstrap gate drivers and fast-turn-off gate networks.",
      "TIM1 complementary 6-channel PWM at 20 kHz with hardware dead-time; continuous DMA ADC scanning of phase currents, voltage, temperature and speed.",
      "Low-side dual-shunt current sensing with LM324 amplification and RC anti-aliasing; NTC heatsink monitoring and 16×2 I²C telemetry display.",
      "Custom diagnostic .hex builds so the client could verify logic and PWM carriers on a scope before PCB manufacture."
    ]
  },
  {
    id: "oil",
    title: "Smart Cooking-Oil Dispenser Controller",
    tagline: "High-current, mixed-signal ESP32-S3 board for an automated dispensing machine.",
    cats: ["pcb", "embedded", "iot", "power"],
    client: "Freelance client",
    cover: IMG + "oil-3.webp",
    images: ["oil-3.webp", "oil-1.webp", "oil-2.webp", "oil-schematic.webp"].map(i => IMG + i),
    stats: [["15 A", "Pump H-bridge"], ["24-bit", "Dual load cells"], ["150 W", "Heater drive"], ["100×120", "mm, 2-layer"]],
    stack: ["ESP32-S3", "EasyEDA Pro", "HX711", "INA180", "CAN (SN65HVD230)", "LM2596", "UART HMI", "LCSC BOM"],
    summary: "Central control PCB bridging a UART touchscreen HMI with heavy 24 V industrial actuators, while measuring microvolt-level load-cell signals for sub-gram dispensing precision.",
    highlights: [
      "Strict board zoning: 24 V power switching on one edge, 3.3 V logic in the centre, quiet analog load-cell zone on the far edge.",
      "Hybrid dual-relay + MOSFET pump driver giving forward, suck-back reverse and PWM speed — with shoot-through made physically impossible.",
      "Hardware E-stop that kills 24 V actuators instantly while keeping logic alive so the MCU can log the fault and notify the UI.",
      "Pump stall / dry-run detection via 10 mΩ shunt + INA180, powered from 3.3 V to hard-clamp the ESP32 ADC.",
      "CAN bus with switchable termination and ESD protection for future multi-pump networks; ToF bottle detection and DS18B20 oil temperature.",
      "Delivered hierarchical schematic, Gerbers + drill, LCSC-matched BOM, CPL for SMT assembly and 3D STEP."
    ],
    links: [["View schematic (PDF)", "assets/docs/oil-dispenser-schematic.pdf"]]
  },
  {
    id: "helmet",
    title: "Dawlance Smart Motorcycle Safety System",
    tagline: "IoT ignition interlock — the bike will not start until the smart helmet is worn.",
    cats: ["iot", "embedded", "pcb"],
    client: "Dawlance",
    cover: IMG + "helmet-3.webp",
    images: ["helmet-3.webp", "helmet-1.webp", "helmet-4.webp", "helmet-2.webp"].map(i => IMG + i),
    stats: [["2", "Wireless bands (AND)"], ["ESP-NOW", "+ 38 kHz IR"], ["BLE", "Live telemetry app"], ["10 s", "Fault-tolerant latch"]],
    stack: ["ESP32-S3", "ESP-NOW", "BLE", "IR 38 kHz", "FSR sensing", "TP5100", "LM3914", "Custom PCB"],
    summary: "A dual-node system that physically intercepts the motorcycle CDI ignition. The engine stays immobilised until a paired helmet confirms the rider's presence through two independent wireless channels.",
    highlights: [
      "Helmet node on a compact custom PCB: ESP32-S3, dual FSRs, Type-C 2S Li-ion charging, buck + LDO rails and a zero-standby LED battery gauge.",
      "Base node drives an open-drain relay on the CDI kill switch, with an IR receiver mounted for line-of-sight to the rider.",
      "Strict AND-logic authentication: ESP-NOW sensor packets plus a directional IR beam carrying a unique rider ID.",
      "Hardware decoupling and expanded hex whitelist to survive Wi-Fi/IR interference and corrupted packets.",
      "Rider-safe logic: 10 s latch through brief signal drops, then a 30 s warning countdown before a graceful cut — never an abrupt stall.",
      "Concurrent BLE server streaming FSR states, IR health, relay state and countdowns to a companion mobile app."
    ]
  },
  {
    id: "optera",
    title: "OPTERA — RF Ablation Medical Controller",
    tagline: "Embedded controller and touchscreen UI for bipolar electrosurgical procedures.",
    cats: ["embedded", "software"],
    client: "Medical device prototype",
    cover: IMG + "optera-1.webp",
    images: ["optera-1.webp", "optera-4.webp", "optera-2.webp", "optera-3.webp"].map(i => IMG + i),
    stats: [["<50 ms", "Contact → display"], ["16-bit", "ADS1115 AFE"], ["5", "State machine stages"], ["Pi 5", "Kiosk-mode Linux"]],
    stack: ["Raspberry Pi 5", "Python", "WebSocket", "HTML5 Canvas", "ADS1115", "I²C", "MIPI DSI", "Chromium Kiosk"],
    summary: "The central intelligence of an electrosurgical generator: millisecond-level tissue-impedance capture, strict surgical safety interlocks and a low-latency visualisation interface on an integrated touchscreen.",
    highlights: [
      "Protected analog front-end (series limiting + Zener clamp) feeding a 16-bit ADS1115 over a dedicated I²C bus.",
      "Safety interlocks: short-circuit lockout (Z < 40 Ω), anti-tie-down pedal logic, tissue confirmation window and endpoint auto-cutoff (Z > 225 Ω).",
      "Event-driven Python backend streaming telemetry over WebSockets to a zero-dependency HTML5/Canvas frontend.",
      "Clinical view (traffic-light status, Joules, time, session logs) and Engineering view (Z, dZ/dt, efficiency, live impedance trace).",
      "Diagnosed and eliminated Pi 5 brownouts with a tuned 5.15 V CC/CV buck stage and low-impedance bus wiring.",
      "Brushed-aluminium enclosure with 4 mm safety banana jacks and GX16 foot-switch connector."
    ]
  },
  {
    id: "atmega",
    title: "Custom ATmega2560 Integration PCB",
    tagline: "Turned a wire-harness Arduino Mega prototype into one manufacturable, battery-powered board.",
    cats: ["pcb", "embedded", "power"],
    client: "Client: Kola",
    cover: IMG + "atmega-1.webp",
    images: [IMG + "atmega-1.webp"],
    stats: [["102×64", "mm, 2-layer FR4"], ["18650", "Li-ion powered"], ["5.1 V", "MT3608 boost"], ["USB-C", "1 A charging"]],
    stack: ["ATmega2560", "TP4056", "MT3608", "AO3401", "HX711", "HC-06", "I²C OLED", "EasyEDA Pro"],
    summary: "Replicated the Arduino Mega 2560 core on a compact custom board with Li-ion charging, a high-efficiency boost converter and dedicated headers for OLED, load-cell and Bluetooth modules — designed around the client's 3D-printed enclosure.",
    highlights: [
      "Replaced the requested 7 V linear approach with a direct-to-5 V MT3608 boost for much better battery life.",
      "USB-C charge port with CC pull-downs for PD-adapter compatibility; TP4056 charging at 1 A.",
      "P-MOSFET high-side switch lets firmware cut power to all peripherals during sleep.",
      "Plug-detect, charge-detect and filtered battery-voltage sensing routed to the MCU for accurate battery percentage.",
      "Hardware pull-down wake buttons for deep-sleep interrupts; FTDI + ICSP programming headers.",
      "Full GND pours, 0.6 mm+ power traces, six M3 mounts and a 1 mm USB-C overhang to fit the enclosure."
    ]
  },
  {
    id: "ansys",
    fit: "contain",
    title: "PMSM for Electric Aircraft — EM & Thermal Verification",
    tagline: "MATLAB analytical model verified with Ansys Maxwell 2D FEA and Icepak 3D thermal.",
    cats: ["matlab", "power"],
    client: "Research project",
    cover: IMG + "ansys-3.webp",
    images: ["ansys-3.webp", "ansys-1.webp", "ansys-2.webp"].map(i => IMG + i),
    stats: [["<2.5%", "FEA vs analytical"], ["65 kW", "Takeoff output"], ["6", "Flight profiles"], ["141 °C", "Transient peak"]],
    stack: ["MATLAB", "Ansys Maxwell 2D", "RMxprt", "Ansys Icepak", "FEA", "Thermal analysis"],
    summary: "Finite-element verification of a permanent-magnet synchronous motor for electric aircraft propulsion (KLA-100X reference), moving a 1D MATLAB model into 2D/3D FEA across Preflight, Takeoff, Climb, Cruise, Descent and Landing.",
    highlights: [
      "Torque, power, core losses and efficiency matched analytical targets within 2.5% across all flight phases (93.7–96.1% efficiency).",
      "Calibrated for real magnetic saturation in 20PNF1500 steel to hit the exact 65 kW / 206.9 Nm takeoff point.",
      "End-winding losses captured by applying the MATLAB-derived AC resistance multiplier to 2D copper loss.",
      "No-load test: 55.2 Vrms back-EMF vs 52.1 V target; cogging torque matched ~1.04 Nm after skew correction.",
      "3D Icepak model with Maxwell loss coupling, liquid-cooling jacket boundary and hex-dominant meshing of the 1 mm airgap.",
      "90 s transient takeoff simulation peaked at ~141 °C — replicating the 141.8 °C experimental benchmark, safely under the 180 °C Class H limit."
    ]
  },
  {
    id: "dfim",
    fit: "contain",
    title: "Vector Control of a Doubly-Fed Induction Machine",
    tagline: "MATLAB/Simulink drive model with dq current control and FFT/THD analysis.",
    cats: ["matlab", "power"],
    client: "Academic / research",
    cover: IMG + "motor-2.webp",
    images: ["motor-circuit.webp", "motor-2.webp", "motor-7.webp", "motor-3.webp", "motor-1.webp", "motor-4.webp", "motor-5.webp", "motor-8.webp"].map(i => IMG + i),
    stats: [["10 µs", "Discrete solver"], ["dq0", "Stator + rotor"], ["2", "Inverters modelled"], ["FFT", "THD analysis"]],
    stack: ["MATLAB", "Simulink", "Simscape Electrical", "MATLAB Function blocks", "PID(z)", "powergui FFT"],
    summary: "A discrete-time Simulink model of a doubly-fed induction machine driven by separate stator and rotor inverters, with field-oriented current controllers, slip-frequency calculation and a speed loop — followed by harmonic analysis of stator and rotor currents.",
    highlights: [
      "abc → dq0 transforms on stator and rotor voltages/currents, with rotor angle and speed feedback.",
      "Custom MATLAB Function blocks for current references, slip frequency and dq current controllers parameterised by Rs, Rr, Ls, Lr, M, Kp and Ki.",
      "Discrete PID speed loop generating torque/current references.",
      "Scope capture of transient and steady-state rotor/stator current waveforms.",
      "FFT Analyzer sweeps across operating frequencies to quantify fundamental magnitude and THD (e.g. 6.67% THD at 125 Hz rotor current)."
    ]
  },
  {
    id: "tripack",
    fit: "contain",
    title: "Cloud SCADA Energy Management Dashboard",
    tagline: "Bridged plant OT data to the cloud for remote, real-time energy monitoring.",
    cats: ["iot", "software"],
    client: "Internship — Tri-Pack Films Ltd.",
    cover: IMG + "tripack-1.webp",
    images: ["tripack-1.webp", "tripack-2.webp"].map(i => IMG + i),
    stats: [["Live", "Plant telemetry"], ["CI/CD", "GitHub → Railway"], ["99.9%", "Uptime target"], ["6 wk", "Delivery"]],
    stack: ["SCADA", "JavaScript", "HTML/CSS", "Charting", "GitHub Actions", "Railway", "REST API", "Auth"],
    summary: "An end-to-end pipeline extracting voltage, current, power factor and kWh from the plant's SCADA network, shipping it securely to a cloud database and visualising it in a custom web dashboard for plant engineers.",
    highlights: [
      "Audited the local SCADA network to map data tags and registers.",
      "Backend ingestion scripts and API endpoints for high-frequency time-series data.",
      "Automated CI/CD: every merge to main builds and deploys on Railway; dev/prod branching kept production stable.",
      "Historical trending filtered by date, shift and machine zone to expose energy inefficiencies.",
      "Payload batching and database indexing cut API load and query latency.",
      "Secure authentication; handed over with full documentation and a live demo to management."
    ]
  }
];

window.CATEGORIES = [
  ["all", "All"], ["pcb", "PCB Design"], ["embedded", "Embedded"], ["iot", "IoT"],
  ["matlab", "Simulation"], ["power", "Power"], ["software", "Software"]
];

const C = "assets/certs/";
window.CERTS = [
  ["Electrical Characterization: MOSFETs", "Arizona State University · Coursera", "Jul 2025", "eng", "electrical-characterization-mosfets"],
  ["Explore Electrical Engineering Job Simulation", "GE Aerospace · Forage", "Mar 2025", "eng", "ge-aerospace"],
  ["Supervised Machine Learning: Regression & Classification", "DeepLearning.AI · Stanford", "Jan 2025", "ai", "supervised-machine-learning"],
  ["Introduction to Deep Learning & Neural Networks with Keras", "IBM · Coursera", "Feb 2025", "ai", "introduction-to-deep-learning-neural-networks-with-keras"],
  ["Introduction to Neural Networks and PyTorch", "IBM · Coursera", "Mar 2025", "ai", "introduction-to-neural-network-and-pytorch"],
  ["Machine Learning with Python", "IBM · Coursera", "Jan 2025", "ai", "machine-learning-with-python-ibm"],
  ["Introduction to Model Context Protocol", "Anthropic Academy", "Aug 2025", "ai", "introduction-to-mcp-claude"],
  ["Mastering Conversation Modeling with LLMs", "Marktechpost · Workshop", "Apr 2025", "ai", "marktechpsot-ai"],
  ["Programming Fundamentals", "Duke University · Coursera", "Jul 2025", "code", "programming-fundamentals"],
  ["Programming for Everybody (Python)", "University of Michigan · Coursera", "Jan 2025", "code", "python-for-everbody"],
  ["Solving Problems with Creative & Critical Thinking", "IBM · Coursera", "Jan 2025", "code", "solving-problem-with-creative-and-critical-thinking-coursera"]
].map(([title, issuer, date, cat, slug]) => ({ title, issuer, date, cat, img: C + slug + ".webp", pdf: C + slug + ".pdf" }));
