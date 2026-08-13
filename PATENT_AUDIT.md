# RHKEARTH Patent / Evidence Audit

This file is the public-site wording boundary for the RHKEARTH evaluation of US11287508B2 and US11408961B2.

It is not a legal claim-construction opinion, freedom-to-operate analysis, or engineering validation report. It is a source-control document intended to prevent the website from presenting illustrative or projected material as measured performance.

Primary technical sources:

- US11287508B2: https://patents.google.com/patent/US11287508B2/en
- US11408961B2: https://patents.google.com/patent/US11408961B2/en
- J. Appl. Phys. 122, 034504 (2017), “Mesh-type acoustic vector sensor,” DOI 10.1063/1.4994174

## Evidence classes

Every technical statement on the public site should fit one of four classes.

### A. Reported prototype evidence

These may be presented as reported / measured prototype facts, with the stated test context preserved.

- 6 mm outer diameter spider-web prototype.
- 1 μm-thick LPCVD ultra-low-stress silicon nitride film.
- 20 μm released-web filament / beam separation.
- Approximately 2.7 m total fiber length in the 6 mm spider-web prototype geometry.
- 3.6 μm × 1 μm prototype filament cross-section.
- 30 nm-thick aluminum film used for the prototype center mirror.
- 530 Hz fundamental frequency for the first mesh prototype.
- In-air evaluation showing dipole-type directionality.
- Peak responsivity in excess of 20 nm/Pa at 90 Hz in the in-air prototype evaluation.

Required wording rule: never describe the in-air responsivity result as underwater sensitivity.

### B. Patent / paper estimates and projections

These may be shown only when explicitly labeled estimate, projected, equivalent, or analytical.

- Interferometer displacement-noise spectral density of approximately 2 pm/√Hz used in the MDP estimate.
- Estimated minimum detectable sound-pressure spectral density in air of approximately 100 μPa/√Hz. This follows dimensionally from approximately 2 pm/√Hz divided by approximately 20 nm/Pa; the 2017 NRL paper states the spectral-density unit explicitly.
- Projected equivalent water pressure spectral density of approximately 76 dB re 1 μPa/√Hz. This is a projection, not an in-water validation result.
- Projected water responsivity of approximately 0.3 nm/Pa in the 2017 paper. This is not a measured in-water sensitivity result.
- Floating-base size estimate of approximately 10 mm radius for operation in the 10 Hz range.
- FIG. 4 condition of 100 μPa air pressure corresponding to approximately 0.24 μm/s flow velocity.

Required wording rules:

- Never show the air MDP as a broadband 100 μPa threshold; retain `/√Hz` when the value is displayed.
- Never present the 76 dB water value or approximately 0.3 nm/Pa water responsivity as demonstrated underwater performance.

### C. Patent-described mechanisms and embodiments

These may be described as disclosed / described / contemplated by the specification. Do not imply that each embodiment was built or field-tested.

US11287508B2 includes or describes:

- particle-motion / flow sensing with a two-dimensional micro- or nano-scale mesh;
- optical detection of mesh deformation;
- natural signed cosine-type directivity relative to the mesh normal;
- three co-located orthogonal mesh transducers described as sufficient to reconstruct the sound-wave vector in 3-D;
- floating base 102 with one or more flow meters 104, retaining thread 106, and anchor 108;
- four flow meters shown in FIG. 1;
- optional controller / transmitter / battery / processor / memory associated with the anchor;
- communication of measurement information to an external device 214;
- external devices including a ship, floating buoy, land receiver, or central controller capable of aggregating multiple sensor outputs;
- submarine or AUV hull-mounting implementations;
- shallow-water mooring close to an air/water boundary;
- DC / slowly varying viscous-flow monitoring.

US11408961B2 additionally describes:

- a tower with viscous-liquid channels and flow sensors positioned in channel cavities;
- channels having different orientations;
- neutrally buoyant AVS embodiments including hull-mounted sensors and/or towed arrays;
- a positively buoyant AVS tower used as a sonobuoy component;
- a positively buoyant tower moored above an anchor;
- optional tower power, memory, transmitter, detachment from the retaining thread, surfacing, and transmission of stored information.

Required wording rules:

- Use “patent-described,” “the specification describes,” or “an embodiment contemplates” unless a specific prototype measurement is being discussed.
- Do not turn “towed arrays” into a claim about a specific tow-body or multi-element geometry unless the drawing is explicitly labeled schematic context.
- Do not imply that the sonobuoy embodiment requires a separate surface float; the patent describes the AVS tower itself as positively buoyant and tethered to the anchor.
- Prefer “surfacing + telemetry” over “surface recovery” unless physical recovery is separately evidenced.

### D. RHKEARTH illustrative / commercialization hypotheses

These must never be attributed to the patents as validated systems.

Examples include:

- harbor monitoring networks;
- offshore infrastructure monitoring;
- distributed operational sensor fields shown in cinematic animations;
- specific vessel-to-node placements in website visuals;
- contact alerts;
- assumed detection envelopes or passive-node range rings;
- customer adoption, programs of record, procurement status, or fielded Navy use;
- product cost, SWaP, manufacturing yield, reliability, or environmental lifetime;
- performance of any photographed submarine, surface combatant, special-operations craft, commercial vessel, or other platform.

Required wording rule: label these “illustrative context,” “commercialization hypothesis,” or “evaluation concept.”

## Not established by these two public patents

The public site must not imply that these are known product specifications unless independently sourced evidence is added and cited:

- demonstrated in-water sensitivity;
- in-water usable bandwidth;
- measured underwater bearing error;
- platform / tether / flow self-noise;
- operational detection range;
- probability of detection;
- classification performance;
- source-level performance against real vessels;
- long-duration corrosion / biofouling performance;
- qualified packaging;
- manufacturing yield;
- calibration drift;
- fielded Navy deployment;
- Navy sponsorship of RHKEARTH;
- a RHKEARTH patent license, ownership position, or exclusivity.

## Mathematical display policy

The website may visualize mathematical relationships expressly stated in the patent / paper, provided they are not presented as measured data.

Allowed:

- normalized signed directivity: `R/Rmax = cos θ`;
- ideal square-mesh fiber-length relation: `L_fiber = 2L²/d`;
- ideal square-mesh fiber-length gain relative to one cantilever: `L_fiber/L = 2L/d`;
- 2-D bearing geometry with east / north coordinates, provided it is identified as geometry rather than sensor output.

For the demonstrator coordinate convention:

- source bearing β is clockwise from north, sensor → source;
- the source-direction unit vector in east / north coordinates is `(sin β, cos β)`;
- the incoming propagation-direction unit vector is the opposite direction, `k̂ = (−sin β, −cos β)`;
- therefore `||k̂|| = 1` by construction;
- the incoming propagation heading is `(β + 180°) mod 360°`.

Boundary:

- the square-mesh equations must not be used to back-calculate the reported ≈2.7 m spider-web fiber length because the reported prototype uses a separate truncated spider-web geometry;
- the cosine curve is an analytical relationship stated in the patent / paper; the site must not invent measured points that are not tabulated in the source;
- negative cosine response denotes dipole polarity / phase reversal, not negative sensitivity;
- a plane-wave illustration should use a straight propagation direction with phase fronts normal to that direction; decorative sinusoidal ray paths must not be presented as the physical path of sound;
- visible animation rates and displacement amplitudes are schematic and must not be interpreted as physical frequency or measured deformation.

## Numerical sanity checks

The following relationships are suitable for internal assertions because they check displayed mathematics without creating new performance claims:

- `cos(20°) = 0.9396926…`, displayed as `+0.940`.
- `(2 pm/√Hz) / (20 nm/Pa) = 1×10⁻⁴ Pa/√Hz = 100 μPa/√Hz`.
- A 100 μPa plane-wave pressure in air corresponds to approximately 0.24 μm/s particle velocity for standard room-temperature air impedance, consistent with the FIG. 4 condition quoted in the source.
- `20 log10[(2 pm/√Hz)/(0.3 nm/Pa)/(1 μPa)] ≈ 76.5 dB re 1 μPa/√Hz`, consistent with the approximately 76 dB projected water value after rounding / source approximations.

These checks validate arithmetic and units only. They do not convert estimates into measured performance.

## Visualization policy

The public demonstrators may show source bearing, direction arrows, qualitative source wavefronts, deployment geometry, and patent architecture relationships.

They must not display invented performance outputs such as:

- sonar SNR;
- detection probability;
- confidence score;
- propagation-loss-derived detection range;
- measured bearing error;
- target classification;
- vessel acoustic signatures.

Rules:

- The direction demonstrator uses a fixed visual source radius; it does not expose physical range.
- Passive sensor nodes should not carry unlabeled range rings that could be mistaken for detection envelopes.
- Wavefront rings are allowed only as clearly qualitative acoustic-source context.
- Photographed or filmed platforms are operating context, not evidence that the technology is installed on those platforms.

## IP / status wording

The patents are assigned to the United States of America, as represented by the Secretary of the Navy.

The RHKEARTH public site should continue to state that it is an independent evaluation and does not claim:

- patent ownership;
- a patent license;
- exclusivity;
- Navy / NRL / DoD sponsorship;
- an operational Navy deployment.

## Investor-facing order

The public website should tell the story in this order:

1. thesis / why the technology is interesting;
2. technology and architecture;
3. reported prototype evidence and separately labeled estimates / projections;
4. demonstrator of mechanism / geometry;
5. defense and dual-use application hypotheses;
6. evidence, technical gaps, and IP / rights status.

This order is intentional: understand the technology before operating the demo, and understand the evidence boundary before interpreting commercialization potential.
