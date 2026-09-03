from pathlib import Path
import json
import re

# Vite subpath build.
p = Path('vite.config.js')
s = p.read_text()
needle = "  return {\n    plugins: ["
if needle not in s:
    raise SystemExit('Could not locate Vite config return block')
s = s.replace(needle, "  return {\n    base: '/experimental/',\n    plugins: [", 1)
p.write_text(s)

# RHKEARTH branding.
index = Path('index.html')
html = index.read_text()
html = html.replace("<title>God's Eye View</title>", '<title>RHKEARTH // Experimental</title>')
html = html.replace("<span>GOD'S EYE <span class=\"title-accent\">VIEW</span></span>", '<span>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></span>')
html = html.replace('<p class="subtitle">NO PLACE LEFT BEHIND</p>', '<p class="subtitle">EXPERIMENTAL SYSTEMS</p>')
html = html.replace("<h2>GOD'S EYE <span class=\"title-accent\">VIEW</span></h2>", '<h2>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></h2>')
html = html.replace('Initializing photorealistic world...', 'Initializing intelligence console...')
index.write_text(html)

brand = Path('../rhkearth-logo.svg')
if not brand.exists():
    raise SystemExit('RHKEARTH logo not found')
Path('public/logo.svg').write_text(brand.read_text())

# Fast keyless satellite base map + immediate ellipsoid terrain.
stack = Path('src/mapStackController.js')
stack_text = stack.read_text()
old_esri = "\n".join([
    "provider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(ESRI_WORLD_IMAGERY_URL, {",
    "          credit: ESRI_IMAGERY_CREDIT,",
    "          enablePickFeatures: false,",
    "        });",
])
new_esri = "\n".join([
    "provider = new Cesium.UrlTemplateImageryProvider({",
    "          url: `${ESRI_WORLD_IMAGERY_URL}/tile/{z}/{y}/{x}`,",
    "          credit: ESRI_IMAGERY_CREDIT,",
    "          maximumLevel: 19,",
    "        });",
])
if old_esri not in stack_text:
    raise SystemExit('Could not locate Esri startup provider block')
stack_text = stack_text.replace(old_esri, new_esri, 1)
terrain_replacement = "\n".join([
    "  async _getKeylessTerrainProvider() {",
    "    if (!this._reearthTerrainProvider) {",
    "      this._reearthTerrainProvider = new Cesium.EllipsoidTerrainProvider();",
    "    }",
    "    return this._reearthTerrainProvider;",
    "  }",
    "",
    "  _emitChange",
])
stack_text, count = re.subn(
    r"  async _getKeylessTerrainProvider\(\) \{.*?\n  \}\n\n  _emitChange",
    terrain_replacement,
    stack_text,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit('Could not replace keyless terrain startup block')
stack.write_text(stack_text)

# Bound first reveal time so optional initialization cannot hold the splash.
main = Path('src/main.js')
main_text = main.read_text()
old_restore = "\n".join([
    "    void Promise.all([",
    "      styleManager.initialRestorePromise,",
    "      new Promise((resolve) => setTimeout(resolve, 1000)),",
    "    ]).finally(() => {",
])
new_restore = "\n".join([
    "    void Promise.all([",
    "      Promise.race([",
    "        styleManager.initialRestorePromise,",
    "        new Promise((resolve) => setTimeout(resolve, 1500)),",
    "      ]),",
    "      new Promise((resolve) => setTimeout(resolve, 500)),",
    "    ]).finally(() => {",
])
if old_restore not in main_text:
    raise SystemExit('Could not locate startup reveal block')
main.write_text(main_text.replace(old_restore, new_restore, 1))

# Do not publish the upstream noncommercial TeleGeography dataset in RHKEARTH.
blank = {'type': 'FeatureCollection', 'features': []}
cable_dir = Path('src/data/local_data/telegeography_submarine_cables')
for name in ('cable-geo.json', 'landing-point-geo.json'):
    (cable_dir / name).write_text(json.dumps(blank, separators=(',', ':')))

print('RHKEARTH Experimental source preparation complete')
