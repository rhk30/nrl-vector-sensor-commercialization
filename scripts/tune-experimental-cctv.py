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

# RHKEARTH is a live operating console, not a prerecorded scene-capture tool.
scene_import = "import { SceneDirector } from './scenes/director.js';\n"
if scene_import in main_text:
    main_text = main_text.replace(scene_import, '', 1)
scene_init = """    // Initialize deterministic scene playback for social clip capture
    const sceneDirector = new SceneDirector(viewer, styleManager, dataManager);

"""
if scene_init in main_text:
    main_text = main_text.replace(scene_init, '', 1)
main_text = main_text.replace('      sceneDirector,\n', '', 1)
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

scene_panel_pattern = re.compile(
    r'\s*<!-- Scene Director Panel -->\s*<div id="scene-panel".*?</div>\s*</div>\s*(?=\s*</div>\s*<!-- Global Context)',
    re.S,
)
index_text, removed_scene_panels = scene_panel_pattern.subn('\n', index_text, count=1)
if removed_scene_panels != 1:
    scene_panel_pattern = re.compile(
        r'\s*<!-- Scene Director Panel -->\s*<div id="scene-panel".*?</div>\s*</div>',
        re.S,
    )
    index_text, removed_scene_panels = scene_panel_pattern.subn('', index_text, count=1)
if 'id="scene-panel"' in index_text:
    raise SystemExit('RHKEARTH Scenes panel removal failed')
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

# Add RHKEARTH's Chicago-only continuous live camera layer. This intentionally
# excludes JPEG/still feeds and uses only public HLS/iframe/video sources.
live_patch = Path('../scripts/add-chicago-live-cameras.py')
if not live_patch.exists():
    raise SystemExit('RHKEARTH Chicago live CCTV patch script missing')
exec(compile(live_patch.read_text(encoding='utf-8'), str(live_patch), 'exec'))

# Add current/future Chicago street impacts from the City of Chicago CDOT feed.
street_patch = Path('../scripts/add-chicago-street-activity.py')
if not street_patch.exists():
    raise SystemExit('RHKEARTH Chicago street-activity patch script missing')
exec(compile(street_patch.read_text(encoding='utf-8'), str(street_patch), 'exec'))

# The Chicago source can repeat activity IDs. Cesium EntityCollection requires
# unique IDs, so qualify geometry IDs and collapse exact duplicates before the
# first render. A bad provider row must never stop the entire globe renderer.
duplicate_guard_patch = Path('../scripts/fix-chicago-street-duplicates.py')
if not duplicate_guard_patch.exists():
    raise SystemExit('RHKEARTH Chicago duplicate-entity guard script missing')
exec(compile(duplicate_guard_patch.read_text(encoding='utf-8'), str(duplicate_guard_patch), 'exec'))

# Repair the three core live-source paths in the static/native build:
# civilian adsb.lol flights, TfL rolling-video CCTV, and Overpass mirror failover.
live_runtime_patch = Path('../scripts/patch-live-runtime.py')
if not live_runtime_patch.exists():
    raise SystemExit('RHKEARTH live runtime repair patch missing')
exec(compile(live_runtime_patch.read_text(encoding='utf-8'), str(live_runtime_patch), 'exec'))

# Rebuild marker: 2026-09-03 live flights / London video / traffic repair.
print('RHKEARTH Chicago/Chicagoland operating area added; circular scope and Scenes removed; live flights/CCTV/traffic runtime repaired')