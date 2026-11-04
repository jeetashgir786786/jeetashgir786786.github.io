# Jeetash Goswami — Portfolio Website

Static site (HTML + CSS + vanilla JS, no build step). Works on GitHub Pages as-is.
Minimal light design: paper background, ink text, one copper accent, IBM Plex Sans / Mono.

```
website/
├── index.html          ← home: intro, work, services, lab, about, certificates, contact
├── project.html        ← case-study page (project.html?p=<id>)
├── css/style.css       ← all styling (colours at the top in :root)
├── js/config.js        ← YOUR LINKS (email, LinkedIn, WhatsApp, …)
├── js/data.js          ← projects + certificates content
├── js/main.js          ← header, links, home-page rendering, contact form
├── js/project.js       ← fills the case-study page
├── js/lab.js           ← interactive demos (FFT, PID, PCB, IoT)
├── assets/             ← images, certificate PDFs, docs
└── .nojekyll
```

## Shareable case-study links
Every project has its own page you can send to a client directly:

| Project | Link (add after your site URL) |
|---|---|
| Solar BLDC controller | `project.html?p=bldc` |
| Oil dispenser controller | `project.html?p=oil` |
| Smart helmet (Dawlance) | `project.html?p=helmet` |
| OPTERA medical controller | `project.html?p=optera` |
| ATmega2560 custom PCB | `project.html?p=atmega` |
| PMSM / Ansys verification | `project.html?p=ansys` |
| DFIM vector control (Simulink) | `project.html?p=dfim` |
| Tri-Pack SCADA dashboard | `project.html?p=tripack` |

e.g. `https://jeetashgoswami786.github.io/JeetashGoswami/project.html?p=bldc`

## Links
Edit `js/config.js`. Any link that is empty, missing or still contains `YOUR-` is hidden automatically.
Optional keys you can add: `github`, `upwork`, `fiverr`, `cv` (e.g. `"assets/docs/cv.pdf"`), `formspreeId`.

## Updating GitHub
Upload the contents of this folder to your repo (replace the old files), commit, and GitHub Pages redeploys in about a minute.
Files from the old design that are no longer used and can be deleted from the repo: none are required, but `assets/img/hero-bg.webp` is no longer referenced.

## Adding a project
Copy one object in `js/data.js` → `PROJECTS`, put images in `assets/img/projects/`, and set `cats` using:
`pcb`, `embedded`, `iot`, `matlab`, `power`, `software`. Add `fit: "contain"` for screenshots/plots so they aren't cropped.
