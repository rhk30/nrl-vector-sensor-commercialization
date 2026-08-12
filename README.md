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

## Patent-strict quantitative policy

The public website separates **patent-reported facts** from **conceptual visualization**.

Visible quantitative technology readouts are limited to values and relationships stated in the patent family, including:

- 6 mm outer-diameter spider-web prototype
- 1 μm-thick LPCVD ultra-low-stress silicon nitride film
- approximately 20 μm released-web beam separation
- approximately 2.7 m total fiber length in the 6 mm prototype geometry
- 3.6 μm × 1 μm prototype filaments
- 30 nm-thick aluminum center mirror
- optical interferometric detection of center-mirror displacement
- peak responsivity in excess of 20 nm/Pa at 90 Hz in the disclosed in-air evaluation
- 530 Hz fundamental frequency for the first mesh prototype
- interferometer noise floor of approximately 2 pm/√Hz
- estimated minimum detectable pressure in air of approximately 100 μPa
- projected equivalent minimum detectable pressure in water of approximately 76 dB re 1 μPa/√Hz; this is a patent projection, not an in-water validation result
- mesh fiber-length relation 2L²/d for a square L × L mesh of unit size d
- fiber-length increase factor 2L/d versus a single cantilever of length L
- natural cos θ directivity relative to the mesh normal
- three co-located orthogonal mesh transducers described as sufficient to reconstruct a sound-wave vector in 3-D space

The public mission demonstrator no longer presents site-generated SNR, detection range, confidence, propagation loss, bearing error, or modeled sensor sensitivity as performance outputs. Its remaining range/bearing geometry is illustrative only and is not an NRL performance claim.

## Patent-described architectures represented

- floating base with one or more flow meters, retaining thread, and anchor
- optical readout of mesh deformation
- optional anchor electronics including controller, transmitter, battery, processor, and memory
- external receivers including ships, floating buoys, land-based receivers, and central controllers capable of aggregating multiple sensor outputs
- hull mounting on a vessel such as a submarine or AUV, and shallow-water mooring near an air/water boundary
- tower with multiple viscous-liquid flow channels and sensors in channel cavities
- channels having different orientations
- positively buoyant AVS used as a sonobuoy component
- neutrally buoyant embodiments including hull-mounted sensors and/or towed arrays
- tower embodiments with transmitter, memory, battery, and detachable surface recovery followed by transmission of stored information

## Live experience

The GitHub Pages site includes:

- a passive cinematic military / commercial use-case sequence
- a conceptual 3-D patent-architecture and source-direction demonstrator
- a patent-grounded prototype cutaway
- patent-reported quantitative facts and relationships
- patent architecture visualizations
- qualitative commercialization discussion
- technical and IP diligence questions

## Cover media

The landing page uses public maritime media as atmospheric context only. Sensor overlays are conceptual and do not imply that any photographed or filmed platform uses the NRL technology.

- submarine-force media: U.S. Navy public-domain footage
- surface-fleet media: U.S. Navy public-domain destroyer footage
- littoral media: U.S. Navy public-domain SWCC photograph
- harbor media: CCGS McIntyre Bay harbor-transit footage, CC0 — intentionally retained
- offshore-wind scene: original RHKEARTH engineering animation retained

All hero video elements are programmatically hard-muted (`muted`, `defaultMuted`, and `volume = 0`) and display no audio controls.

Media credits are retained here in repository documentation rather than overlaid on the landing-page visual.

## Important technical limitation

The interactive visuals are not validated NRL engineering simulations and are not operational sonar-performance models. Vessel positions, bearings, wavefront animation, 3-D geometry, and exaggerated mesh deformation are used to explain disclosed concepts only.

No real submarine, ship, special-operations, or other platform acoustic-signature data is included.

## Run locally

No build system is required. Open `index.html` directly or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

The repository can be published from the `main` branch at `/ (root)` using **Settings → Pages → Deploy from a branch**.

## Technical sources

- US11287508B2
- US11408961B2

## Disclaimer

Independent research and commercialization screening only. Not an NRL, Department of the Navy, or Department of Defense website. Not legal advice, a freedom-to-operate opinion, an engineering qualification report, or evidence of patent ownership or licensing.