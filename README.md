# RHKEARTH — NRL Low-Frequency Vector Sensor Assessment

Interactive technical and commercialization assessment of a Naval Research Laboratory low-frequency acoustic vector-sensor patent family.

## Project status

This repository is an **independent evaluation project**. The patents and underlying government intellectual property are not owned by this repository's author.

- The relevant patents are assigned to the **United States of America, as represented by the Secretary of the Navy**.
- This project does **not** claim a patent license, exclusive rights, Navy sponsorship, NRL sponsorship, or an operational Navy deployment.
- Any future commercialization rights would require the appropriate license or other agreement with the responsible government technology-transfer office.

## Patents under evaluation

- US11287508B2 — https://patents.google.com/patent/US11287508
- US11408961B2 — https://patents.google.com/patent/US11408961

## Patent-accuracy policy

The website now separates **patent-reported facts** from **site models / visualizations**.

Patent-reported prototype details used on the site include:

- 6 mm outer diameter spider-web mesh prototype
- approximately 20 μm released-web beam / filament separation
- approximately 2.7 m total fiber length in the 6 mm prototype geometry
- 3.6 μm × 1 μm prototype filaments
- 1 μm-thick LPCVD ultra-low-stress silicon nitride film
- 30 nm-thick aluminum film used for the center mirror
- optical interferometric detection of center-mirror displacement
- dipole-type directionality with peak responsivity in excess of 20 nm/Pa at 90 Hz in air
- 530 Hz fundamental frequency reported for the first mesh prototype
- projected equivalent minimum detectable pressure in water of approximately 76 dB re 1 μPa/√Hz; this is a projection in the patent, not an in-water validation result
- floating-base embodiments using one or more flow meters, retaining thread and anchor
- tower embodiments using multiple viscous-liquid flow channels, flow sensors in channel cavities, different channel orientations, and disclosed power / memory / transmitter / detachable-recovery configurations
- specification language describing possible hull mounting on a vessel such as a submarine or AUV and shallow-water mooring near an air/water boundary

Any geometry, range, SNR, confidence, bearing-error, propagation-loss or animated-deformation outputs produced by the site are clearly labeled as **illustrative site calculations**, not patent performance data.

## Live experience

The GitHub Pages site includes:

- A cinematic military and commercial use-case landing sequence with public-domain / CC0 maritime media behind conceptual system overlays
- A configurable vessel / submerged-source mission demonstrator
- A low-frequency acoustic screening model
- Patent architecture visualizations
- Commercial opportunity ranking
- Technical and IP diligence questions
- A proposed 90-day de-risking plan

## Important technical limitation

The interactive models are **illustrative screening models**, not validated NRL engineering simulations and not operational sonar-performance models. They use basic acoustic relationships, generic user-selected inputs, patent-described mechanisms, and transparent heuristics to explain the concepts.

No real submarine, ship, special-operations, or other platform acoustic-signature data is included.

## Cover media

The landing page uses real public maritime media as atmospheric context only. The linework, bearing vectors, acoustic rings and sensor overlays are conceptual and do not imply that the photographed or filmed platforms use the NRL sensor.

Current media sources include:

- U.S. Navy submarine-force video — public domain
- U.S. Navy fleet video — public domain
- U.S. Navy SWCC / Special Boat Team photograph — public domain
- CCGS McIntyre Bay harbor-transit footage — CC0

The wind scene retains the site's original animated engineering composition.

## Run locally

No build system is required. Open `index.html` directly or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

The repository can be published from the `main` branch at `/ (root)` using **Settings → Pages → Deploy from a branch**.

## Primary technical sources

- US11287508B2
- US11408961B2
- NRL / Journal of Applied Physics: *Mesh-type acoustic vector sensor*
- TechLink / Defense Patent Holiday materials

## Disclaimer

Independent research and commercialization screening only. Not an NRL, Department of the Navy, or Department of Defense website. Not legal advice, a freedom-to-operate opinion, an engineering qualification report, or evidence of patent ownership or licensing.