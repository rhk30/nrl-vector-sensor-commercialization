# RHKEARTH: NRL Low-Frequency Vector Sensor Assessment

Independent technical and commercialization evaluation of a Naval Research Laboratory low-frequency acoustic vector-sensor patent family.

## Status

This repository is an **independent evaluation project**.

- The relevant patents are assigned to the **United States of America, as represented by the Secretary of the Navy**.
- RHKEARTH does **not** claim patent ownership, a patent license, exclusivity, Navy / NRL / DoD sponsorship, or an operational Navy deployment.
- Any future commercialization using protected patent rights would require the appropriate rights and agreements.

## Patents under evaluation

- US11287508B2: https://patents.google.com/patent/US11287508B2/en
- US11408961B2: https://patents.google.com/patent/US11408961B2/en

See [`PATENT_AUDIT.md`](PATENT_AUDIT.md) for the public-site evidence and wording boundary.

## What the patents publicly support

### Reported prototype evidence

- 6 mm OD spider-web prototype
- 1 μm-thick LPCVD ultra-low-stress silicon nitride film
- 20 μm released-web filament / beam separation
- approximately 2.7 m total fiber length in the 6 mm prototype geometry
- 3.6 μm × 1 μm prototype filaments
- 30 nm aluminum center mirror
- 530 Hz fundamental frequency for the first mesh prototype
- in-air dipole-type directionality
- peak responsivity in excess of 20 nm/Pa at 90 Hz in the in-air prototype evaluation

### Patent estimates / projections

- interferometer noise floor of approximately 2 pm/√Hz used in the MDP estimate
- estimated air MDP of approximately 100 μPa
- projected equivalent water pressure spectral density of approximately 76 dB re 1 μPa/√Hz
- approximately 10 mm floating-base radius estimate for 10 Hz operation

The water MDP value is a **patent projection, not an in-water validation result**.

### Patent-described mechanisms and embodiments

- two-dimensional micro/nano mesh particle-motion / flow sensing
- optical readout of mesh deformation
- natural signed cosine-type directivity relative to the mesh normal
- three co-located orthogonal mesh transducers described as sufficient to reconstruct a 3-D sound-wave vector
- floating base with one or more flow meters, retaining thread, and anchor
- optional anchor electronics and communication to an external device
- external receivers including ships, floating buoys, land receivers, and a central controller capable of aggregating multiple sensor outputs
- submarine / AUV hull-mounting implementations
- shallow-water mooring close to an air/water boundary
- viscous-liquid channel tower embodiments
- neutrally buoyant hull-mounted and/or towed-array applications
- positively buoyant AVS / sonobuoy embodiment
- optional tower power, memory, transmitter, and surface recovery / telemetry

## What the public patents do not establish

The website does not present the following as known product specifications:

- demonstrated in-water sensitivity or bandwidth
- measured underwater bearing error
- platform / tether / flow self-noise
- operational detection range or probability of detection
- vessel classification performance
- long-duration corrosion / biofouling performance
- qualified packaging, manufacturing yield, or calibration drift
- fielded Navy deployment

## Public-site organization

The public presentation is intentionally compact:

1. thesis and maritime context;
2. technology / system architecture with patent-reported evidence;
3. patent-grounded bearing-geometry demonstrator;
4. defense and dual-use application evaluation.

System architecture is the default Technology view; the physical mesh / directivity model is the second view.

## Demonstrators

The public site contains:

- cinematic maritime context media with patent-specific overlays;
- a 2-D deployment / source-bearing demonstrator focused on geometry rather than sonar performance;
- patent-grounded floating-base, tower, hull/AUV, towed, and sonobuoy context views;
- a micro-mesh cutaway and signed cosine directivity visualization;
- progressive disclosure of patent-reported quantitative values;
- an illustrative maritime operating picture for application context;
- a commercial-context media reel separating evaluation hypotheses from patent deployment claims.

The visualizations are **not validated NRL engineering simulations** and are not operational sonar-performance models. Source positions, bearings, wavefront animation, vehicle motion, and scene geometry explain disclosed concepts or clearly labeled evaluation hypotheses only.

No real submarine, ship, special-operations, commercial-vessel, or other platform acoustic-signature data is included.

## Landing-page media

Real maritime photos / video are used only as operating context. The overlay supplies the patent-relevant sensor architecture and information flow. The site does not imply that a photographed or filmed platform uses the NRL technology.

Current context media includes:

- U.S. Navy submarine imagery
- U.S. Navy surface-fleet footage
- U.S. Navy Special Warfare craft imagery
- harbor-transit footage

The fifth hero state is a patent-focused sonobuoy / AVS-tower schematic rather than a claim of a real deployment.

Hero video elements are muted and preloaded to make scene transitions smoother. The scene tabs can also be selected manually.

## Quantitative display policy

The site may show relationships expressly stated in the patents, including:

- `R / Rmax = cos θ`
- ideal square-mesh fiber length `2L² / d`
- ideal square-mesh length gain `2L / d`

The square-mesh relation is not used to back-calculate the reported ≈2.7 m fiber length of the separate truncated spider-web prototype.

The mission demonstrator does not present site-generated sonar SNR, detection range, confidence, propagation-loss-derived performance, bearing error, target classification, or modeled sensor sensitivity as NRL performance outputs.

## Run locally

No build system is required. Open `index.html` directly or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

The repository can be published from the `main` branch at `/ (root)` using **Settings → Pages → Deploy from a branch**.

## Disclaimer

Independent research and commercialization screening only. Not an NRL, Department of the Navy, or Department of Defense website. Not legal advice, a freedom-to-operate opinion, an engineering qualification report, or evidence of patent ownership or licensing.
