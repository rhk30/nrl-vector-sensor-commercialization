# NRL Low-Frequency Vector Sensor — Commercialization Lab

Interactive static website for evaluating commercialization pathways around the Naval Research Laboratory low-frequency acoustic vector sensor patent family.

## Patents

- US11287508B2 — https://patents.google.com/patent/US11287508
- US11408961B2 — https://patents.google.com/patent/US11408961

## What the site includes

- Interactive low-frequency acoustic screening model
- Mesh geometry and wavelength comparison
- Patent architecture visualization
- Commercial opportunity ranking
- IP / technical diligence checklist
- 90-day de-risking plan

## Important limitation

The physics panel is a **screening model**, not a validated engineering simulation. It uses basic plane-wave acoustic equations and heuristic geometry scaling anchored to publicly described NRL prototype parameters. It should not be presented as NRL-validated performance data.

## Run locally

No build system is required.

Open `index.html` directly in a browser, or run a tiny local web server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Publish with GitHub Pages

1. Create a new public GitHub repository.
2. Upload `index.html`, `README.md`, and `.nojekyll`.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save.

GitHub will provide a public URL similar to:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

## Suggested repository name

`nrl-vector-sensor-commercialization`

## Primary sources

- NRL / Journal of Applied Physics: *Mesh-type acoustic vector sensor*
- US11287508B2
- US11408961B2
- TechLink / Defense Patent Holiday material

For an external investor, government, or partner-facing version, add the full source list and citations for all market and procurement claims before publishing.

## Disclaimer

Research and commercialization screening only. Not legal advice, a freedom-to-operate opinion, an engineering qualification report, or an investment recommendation.
