# RHKEARTH

RHKEARTH is an independent technical and commercialization evaluation of U.S. Naval Research Laboratory low-frequency acoustic vector-sensor patents.

Live site: https://rhkearth.com

## Repository structure

- `index.html` — public page markup
- `site.css`, `cinematic.css`, `professional.css` — core presentation styles
- `landing.js` — page initialization and enhancement loading
- `app.js` — technology tabs and source-bearing demonstrator logic
- `applications-visualization.js` — maritime applications visualization
- `demo-mechanics.js` — demonstrator interaction and deployment views
- `technology-unified.js` — technology exhibit presentation
- `sensor-realism.js` — mesh-sensor exhibit
- `site-integrity.js` — public technical-claim guardrails
- `PATENT_AUDIT.md` — detailed source and wording audit

The site is intentionally dependency-free and runs as static files on GitHub Pages.

## Technical basis

The evaluation centers on:

- US11287508B2
- US11408961B2
- the published 2017 NRL mesh-type acoustic vector sensor prototype work

The public site distinguishes reported prototype measurements, patent-described architectures, analytical relationships, and RHKEARTH commercialization hypotheses.

## Development

Run a local server from the repository root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

Browser and release integrity checks live in `.github/workflows/`.

## Project status

RHKEARTH does not claim ownership of the underlying Navy patents, a patent license, Navy or NRL sponsorship, or an operational deployment. Detailed evidence and wording boundaries are maintained in `PATENT_AUDIT.md` rather than duplicated throughout this README.
