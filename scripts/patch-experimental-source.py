from pathlib import Path
import json
import re

ROOT = Path.cwd()


def patch(path, old, new, *, count=1, required=True):
    p = ROOT / path
    text = p.read_text()
    if old not in text:
        if required:
            raise SystemExit(f"Patch target not found in {path}: {old[:100]!r}")
        return False
    p.write_text(text.replace(old, new, count))
    return True


def regex_patch(path, pattern, replacement, *, count=1, flags=re.S):
    p = ROOT / path
    text = p.read_text()
    out, n = re.subn(pattern, replacement, text, count=count, flags=flags)
    if n != count:
        raise SystemExit(f"Regex patch failed in {path}: expected {count}, got {n}")
    p.write_text(out)


# -----------------------------------------------------------------------------
# Native /experimental/ base + RHKEARTH branding
# -----------------------------------------------------------------------------
vite = ROOT / 'vite.config.js'
text = vite.read_text()
needle = "  return {\n    plugins: ["
if needle in text:
    text = text.replace(needle, "  return {\n    base: '/experimental/',\n    plugins: [", 1)
elif "base: '/experimental/'" not in text:
    raise SystemExit('Could not locate Vite config return block')
vite.write_text(text)

index = ROOT / 'index.html'
html = index.read_text()
html = html.replace("<title>God's Eye View</title>", '<title>RHKEARTH // Experimental</title>')
html = html.replace(
    '<span>GOD\'S EYE <span class="title-accent">VIEW</span></span>',
    '<span>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></span>',
)
html = html.replace('<p class="subtitle">NO PLACE LEFT BEHIND</p>', '<p class="subtitle">EXPERIMENTAL SYSTEMS</p>')
html = html.replace(
    '<h2>GOD\'S EYE <span class="title-accent">VIEW</span></h2>',
    '<h2>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></h2>',
)
html = html.replace('Initializing photorealistic world...', 'Initializing intelligence console...')
index.write_text(html)

brand = ROOT.parent / 'rhkearth-logo.svg'
if not brand.exists():
    raise SystemExit('RHKEARTH logo not found')
(ROOT / 'public' / 'logo.svg').write_text(brand.read_text())

# -----------------------------------------------------------------------------
# Fast first paint, then non-blocking keyless terrain enhancement.
# Keep Esri satellite imagery as the keyless visual default.
# -----------------------------------------------------------------------------
stack = ROOT / 'src/mapStackController.js'
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
if old_esri in stack_text:
    stack_text = stack_text.replace(old_esri, new_esri, 1)

terrain_method = '''  async _getKeylessTerrainProvider() {
    // RHKEARTH: never block first paint on remote terrain. Install the flat
    // ellipsoid immediately, then upgrade to Re:Earth Terrain in the background.
    if (!this._reearthTerrainProvider) {
      this._reearthTerrainProvider = new Cesium.EllipsoidTerrainProvider();
      if (!this._rhkTerrainUpgradePromise) {
        this._rhkTerrainUpgradePromise = Cesium.CesiumTerrainProvider.fromUrl(REEARTH_TERRAIN_URL)
          .then((provider) => {
            this._reearthTerrainProvider = provider;
            if (this._terrainMode === 'keyless' && this.viewer?.scene?.globe?.show) {
              this.viewer.terrainProvider = provider;
              governorRequestRender('rhkearth-terrain-upgrade');
            }
            return provider;
          })
          .catch((error) => {
            console.warn('[RHKEARTH] Re:Earth terrain upgrade unavailable:', error?.message || error);
            return this._reearthTerrainProvider;
          });
      }
    }
    return this._reearthTerrainProvider;
  }

  _emitChange'''
stack_text, n = re.subn(
    r"  async _getKeylessTerrainProvider\(\) \{.*?\n  \}\n\n  _emitChange",
    terrain_method,
    stack_text,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit('Could not replace keyless terrain method')
stack.write_text(stack_text)

main = ROOT / 'src/main.js'
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
if old_restore in main_text:
    main_text = main_text.replace(old_restore, new_restore, 1)
main.write_text(main_text)

# -----------------------------------------------------------------------------
# Static RHKEARTH data endpoints. These files are refreshed by GitHub Actions.
# -----------------------------------------------------------------------------
patch('src/data/militaryFlights.js', "const API_URL = '/api/adsblol/mil';", "const API_URL = '/experimental/live-data/military.json';")

sat = ROOT / 'src/data/satellites.js'
sat_text = sat.read_text().replace('/api/celestrak/', '/experimental/live-data/celestrak/')
sat.write_text(sat_text)

patch('src/data/rocketLaunches.js', "const API_URL = '/api/launches';", "const API_URL = '/experimental/live-data/launches.json';")
rocket = ROOT / 'src/data/rocketLaunches.js'
rocket.write_text(rocket.read_text().replace('/api/celestrak/active', '/experimental/live-data/celestrak/active'))

# Earthquakes already use USGS directly; leave that source untouched.

# Keyless wildfire fallback. This is event-level EONET data, not FIRMS thermal
# detections, so make the visible layer/source label explicit.
patch('src/data/firmsHeatmap.js', "const FIRMS_API_URL = '/api/firms';", "const FIRMS_API_URL = '/experimental/live-data/fires.json';")
local_layers = ROOT / 'src/data/localLayers.js'
ll = local_layers.read_text()
ll = ll.replace("name: 'FIRMS Active Fires',", "name: 'NASA Wildfire Events',")
ll = ll.replace("source: 'NASA FIRMS · LIVE',", "source: 'NASA EONET · NEAR REAL-TIME',")
local_layers.write_text(ll)

# Keyless traffic: use the public Overpass endpoint directly. The original
# TomTom status probe is allowed to fail; traffic.js then stays in its built-in
# white-dot simulation mode instead of reporting the whole layer unavailable.
patch('src/data/traffic.js', "const OVERPASS_URL = '/api/overpass';", "const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';")

# -----------------------------------------------------------------------------
# Live vessels without AISStream: Open Waters publishes a no-token, CORS-open
# GeoJSON vessel snapshot. Adapt it into the existing AIS row schema so all of
# the original vessel rendering, selection, trails, HUD, and labels stay intact.
# -----------------------------------------------------------------------------
ais = ROOT / 'src/data/aisLiveVessels.js'
ais_text = ais.read_text()
ais_text = ais_text.replace("const DEFAULT_API_URL = '/api/ais-live';", "const DEFAULT_API_URL = 'https://ais.openwaters.io/v1/vessels';", 1)
old_payload = "    const payload = await response.json();\n    if (!ownsAisRequest(requestController, requestSessionId)) return;\n    applyAisFeedSnapshot(viewer, payload);"
new_payload = '''    let payload = await response.json();
    if (payload?.type === 'FeatureCollection' && Array.isArray(payload.features)) {
      const rows = payload.features.map((feature) => {
        const coords = feature?.geometry?.type === 'Point' ? feature.geometry.coordinates : null;
        const p = feature?.properties || {};
        const seenMs = Date.parse(p.seen || '');
        return {
          lat: Array.isArray(coords) ? Number(coords[1]) : NaN,
          lon: Array.isArray(coords) ? Number(coords[0]) : NaN,
          mmsi: p.mmsi ?? feature?.id ?? '',
          name: p.name || '',
          type: p.type ?? p.kind ?? '',
          speed: p.sog,
          course: p.cog,
          heading: p.heading,
          last_position_UTC: p.seen || '',
          last_position_epoch: Number.isFinite(seenMs) ? Math.floor(seenMs / 1000) : null,
        };
      }).filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon));
      payload = {
        status: 'live',
        rows,
        lastMessageAt: Date.now(),
        newestPositionAt: Date.now(),
        refreshing: false,
        source: 'Open Waters AIS',
      };
    }
    if (!ownsAisRequest(requestController, requestSessionId)) return;
    applyAisFeedSnapshot(viewer, payload);'''
if old_payload not in ais_text:
    raise SystemExit('Could not locate AIS payload application block')
ais_text = ais_text.replace(old_payload, new_payload, 1)
old_live_url = '''function liveApiUrl() {
  const base = import.meta.env?.VITE_AIS_LIVE_API_URL || DEFAULT_API_URL;
  const url = new URL(base, window.location.origin);
  url.searchParams.set('maxRows', String(renderRowLimit()));
  return url.toString();
}'''
new_live_url = '''function liveApiUrl() {
  const base = import.meta.env?.VITE_AIS_LIVE_API_URL || DEFAULT_API_URL;
  if (String(base).startsWith('https://ais.openwaters.io/')) return String(base);
  const url = new URL(base, window.location.origin);
  url.searchParams.set('maxRows', String(renderRowLimit()));
  return url.toString();
}'''
if old_live_url not in ais_text:
    raise SystemExit('Could not locate AIS liveApiUrl function')
ais.write_text(ais_text.replace(old_live_url, new_live_url, 1))

# -----------------------------------------------------------------------------
# CCTV: use RHKEARTH-refreshed TfL camera catalog + health snapshot, while
# loading the official public JamCam still directly whenever available.
# -----------------------------------------------------------------------------
cctv = ROOT / 'src/data/cctv.js'
cctv_text = cctv.read_text()
cctv_text = cctv_text.replace("const SOURCE_ENDPOINT = '/api/cctv/sources';", "const SOURCE_ENDPOINT = '/experimental/live-data/cctv.json';", 1)
cctv_text = cctv_text.replace("const HEALTH_ENDPOINT = '/api/cctv/health';", "const HEALTH_ENDPOINT = '/experimental/live-data/cctv-health.json';", 1)
feed_line = "      feedConfigured: typeof source.url === 'string' && !!source.url.trim(),"
if feed_line not in cctv_text:
    raise SystemExit('Could not locate CCTV feedConfigured field')
cctv_text = cctv_text.replace(
    feed_line,
    feed_line + "\n      directFrameUrl: String(source.snapshotUrl || source.url || '').trim(),",
    1,
)
old_frame_return = "  return `${FRAME_ENDPOINT}/${encodeURIComponent(camera.id)}?${params.toString()}`;"
new_frame_return = "  if (camera.directFrameUrl) {\n    const sep = camera.directFrameUrl.includes('?') ? '&' : '?';\n    return `${camera.directFrameUrl}${sep}rhk=${tick}`;\n  }\n  return `${FRAME_ENDPOINT}/${encodeURIComponent(camera.id)}?${params.toString()}`;"
if old_frame_return not in cctv_text:
    raise SystemExit('Could not locate CCTV frame URL return')
cctv_text = cctv_text.replace(old_frame_return, new_frame_return, 1)
cctv.write_text(cctv_text)

# -----------------------------------------------------------------------------
# Remove the TeleGeography NonCommercial bundle from the RHKEARTH build.
# -----------------------------------------------------------------------------
blank = {'type': 'FeatureCollection', 'features': []}
cable_dir = ROOT / 'src/data/local_data/telegeography_submarine_cables'
for name in ('cable-geo.json', 'landing-point-geo.json'):
    target = cable_dir / name
    if target.exists():
        target.write_text(json.dumps(blank, separators=(',', ':')))

print('RHKEARTH Experimental source patches applied')
