from pathlib import Path

# -----------------------------------------------------------------------------
# Chicago / Chicagoland operating area
# -----------------------------------------------------------------------------
locations = Path('src/locations.js')
locations_text = locations.read_text(encoding='utf-8')

chicago_block = """  chicago: {
    name: 'Chicago',
    groundElevation: 181,
    // RHKEARTH intentionally treats Chicago as a metro operating area rather
    // than a downtown-only preset. These bounds cover the city plus the core
    // Chicagoland corridor across Cook, DuPage, Lake, Kane, McHenry and Will.
    viewBounds: { southwest: { lat: 41.45, lng: -88.55 }, northeast: { lat: 42.55, lng: -87.45 } },
    pois: [
      { name: 'Willis Tower', lat: 41.8789, lon: -87.6359, alt: 900, pitch: -20, heading: 45, buildingHeight: 220 },
      { name: '875 North Michigan', lat: 41.8988, lon: -87.6230, alt: 800, pitch: -22, heading: 180, buildingHeight: 170 },
      { name: 'Navy Pier', lat: 41.8917, lon: -87.6078, alt: 800, pitch: -28, heading: 270, buildingHeight: 30 },
      { name: 'Millennium Park', lat: 41.8826, lon: -87.6226, alt: 650, pitch: -32, heading: 225, buildingHeight: 20 },
      { name: 'Adler Planetarium', lat: 41.8663, lon: -87.6068, alt: 1300, pitch: -25, heading: 315, buildingHeight: 25 },
    ],
  },
"""

if "  chicago: {" not in locations_text:
    anchor = "  dc: {\n"
    if anchor not in locations_text:
        raise SystemExit('RHKEARTH Chicago patch target missing: Washington DC city block')
    locations_text = locations_text.replace(anchor, chicago_block + anchor, 1)
    locations.write_text(locations_text, encoding='utf-8')

# -----------------------------------------------------------------------------
# CCTV refresh cadence
# -----------------------------------------------------------------------------
cctv = Path('src/data/cctv.js')
text = cctv.read_text(encoding='utf-8')

replacements = {
    'const ACTIVE_FRAME_REFRESH_MS = 10000;': 'const ACTIVE_FRAME_REFRESH_MS = 4000;',
    'const PROJECTION_ACTIVE_REFRESH_MS = 10000;': 'const PROJECTION_ACTIVE_REFRESH_MS = 4000;',
}

for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f'RHKEARTH CCTV tune patch target missing: {old}')
    text = text.replace(old, new, 1)

cctv.write_text(text, encoding='utf-8')
print('RHKEARTH Chicago/Chicagoland operating area added; active CCTV frame cadence set to 4 seconds')