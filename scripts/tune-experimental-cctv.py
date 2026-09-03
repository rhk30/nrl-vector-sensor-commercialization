from pathlib import Path
import re

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
# RHKEARTH full-frame globe: remove the upstream circular scope mask entirely.
# This both increases usable map area and creates a more distinct visual identity.
# -----------------------------------------------------------------------------
main = Path('src/main.js')
main_text = main.read_text(encoding='utf-8')
scope_import = "import { installScopeMask } from './scopeMask.js';\n"
if scope_import in main_text:
    main_text = main_text.replace(scope_import, '', 1)

scope_install = """    // The explicit scope mask replaces the emergent six-pass artifact —
    // see src/scopeMask.js. Installed before the UI so the DISPLAY-rail
    // toggle finds it live.
    installScopeMask(viewer);

"""
if scope_install in main_text:
    main_text = main_text.replace(
        scope_install,
        "    // RHKEARTH intentionally uses the full rectangular viewport; no circular scope mask.\n\n",
        1,
    )
main.write_text(main_text, encoding='utf-8')

index = Path('index.html')
index_text = index.read_text(encoding='utf-8')
scope_button_pattern = re.compile(
    r'\s*<button class="pp-toggle-btn active" id="scope-toggle".*?</button>',
    re.S,
)
index_text, removed_scope_buttons = scope_button_pattern.subn('', index_text, count=1)
if removed_scope_buttons != 1 and 'id="scope-toggle"' in index_text:
    raise SystemExit('RHKEARTH scope toggle removal failed')
index.write_text(index_text, encoding='utf-8')

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
print('RHKEARTH Chicago/Chicagoland operating area added; circular scope removed; active CCTV frame cadence set to 4 seconds')