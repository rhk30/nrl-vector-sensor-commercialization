from pathlib import Path


def replace(path, old, new, *, required=True):
    p = Path(path)
    text = p.read_text()
    if old not in text:
        if required:
            raise SystemExit(f"Could not locate expected text in {path}: {old[:90]!r}")
        return False
    p.write_text(text.replace(old, new))
    return True

# ---------------------------------------------------------------------------
# RHKEARTH Experimental static-data adapters.
#
# GitHub Pages cannot run the Vite proxy routes used by the upstream project.
# These replacements keep the frontend native/static while reading snapshots
# refreshed by .github/workflows/refresh-experimental-data.yml.
# ---------------------------------------------------------------------------

# Military ADS-B — ODbL source, refreshed into the RHKEARTH repository.
replace(
    'src/data/militaryFlights.js',
    "const API_URL = '/api/adsblol/mil';",
    "const API_URL = '/experimental-data/military.json';",
)
replace(
    'src/data/militaryFlights.js',
    "name: 'Military Flights',",
    "name: 'Military Flights · Snapshot',",
)
replace(
    'src/data/militaryFlights.js',
    'updateInterval: 15000,',
    'updateInterval: 300000,',
)

# CelesTrak TLEs — static snapshots still propagate continuously client-side,
# so the satellites themselves keep moving between catalog refreshes.
sat = Path('src/data/satellites.js')
sat_text = sat.read_text()
sat_text = sat_text.replace('/api/celestrak/${DENSE_GROUP_PATH}', '/experimental-data/celestrak/${DENSE_GROUP_PATH}')
sat_text = sat_text.replace('/api/celestrak/${groupDef.path}', '/experimental-data/celestrak/${groupDef.path}')
if '/api/celestrak/${' in sat_text:
    raise SystemExit('Unpatched CelesTrak route remains in satellites.js')
sat.write_text(sat_text)

# Space Missions — Launch Library 2 + locally refreshed CelesTrak active catalog.
replace('src/data/rocketLaunches.js', "const API_URL = '/api/launches';", "const API_URL = '/experimental-data/launches.json';")
replace('src/data/rocketLaunches.js', "fetch('/api/celestrak/active')", "fetch('/experimental-data/celestrak/active')")

# NASA EONET is the honest no-key wildfire fallback. It is an event catalog,
# not FIRMS thermal-detection telemetry, so rename the layer instead of implying
# FRP precision that the fallback does not provide.
replace('src/data/firmsHeatmap.js', "const FIRMS_API_URL = '/api/firms';", "const FIRMS_API_URL = '/experimental-data/fires.json';")
replace('src/data/firmsHeatmap.js', "source: 'NASA FIRMS',", "source: 'NASA EONET',", required=False)
replace('src/data/firmsHeatmap.js', "loadingLabel = `LIVE · updated ${formatAgoMinutes(now - _lastUpdate)}`;", "loadingLabel = `SNAPSHOT · updated ${formatAgoMinutes(now - _lastUpdate)}`;")
replace('src/data/localLayers.js', "name: 'FIRMS Active Fires',", "name: 'Wildfire Events',")
replace('src/data/localLayers.js', "source: 'NASA FIRMS · LIVE',", "source: 'NASA EONET · KEYLESS',")

# Correct visible attribution for the fallback build.
credits = Path('src/data/dataCredits.js')
credit_text = credits.read_text()
credit_text = credit_text.replace(
    "'Active fires: NASA FIRMS — we acknowledge the use of data and/or imagery ' +\n      'from NASA’s Fire Information for Resource Management System ' +\n      '(<a href=\"https://earthdata.nasa.gov/firms\" target=\"_blank\" rel=\"noopener\">earthdata.nasa.gov/firms</a>), ' +\n      'part of NASA’s Earth Observing System Data and Information System (EOSDIS)'",
    "'Wildfire events: NASA EONET — Earth Observatory Natural Event Tracker ' +\n      '(<a href=\"https://eonet.gsfc.nasa.gov/\" target=\"_blank\" rel=\"noopener\">eonet.gsfc.nasa.gov</a>)'",
)
credits.write_text(credit_text)

# Keyless road simulation: browser-safe public Overpass replaces the missing
# Vite proxy. TomTom remains optional; without it the upstream simulated-flow
# mode continues to animate the real OSM road network.
replace(
    'src/data/traffic.js',
    "const OVERPASS_URL = '/api/overpass';",
    "const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';",
)

# CCTV / traffic cameras -----------------------------------------------------
# The catalog is refreshed from Transport for London's public JamCam feed.
# Each source contains the official public S3 still-image URL, so the static
# build can render real camera frames without the original Node frame proxy.
replace('src/data/cctv.js', "const SOURCE_ENDPOINT = '/api/cctv/sources';", "const SOURCE_ENDPOINT = '/experimental-data/cctv.json';")
replace('src/data/cctv.js', "const HEALTH_ENDPOINT = '/api/cctv/health';", "const HEALTH_ENDPOINT = '/experimental-data/cctv-health.json';")

# Preserve direct public frame URLs on the camera records.
replace(
    'src/data/cctv.js',
    "      feedConfigured: typeof source.url === 'string' && !!source.url.trim(),\n      lat,",
    "      feedConfigured: typeof source.url === 'string' && !!source.url.trim(),\n      snapshotUrl: String(source.snapshotUrl || source.url || '').trim(),\n      lat,",
)

# Prefer a direct provider frame when one exists; fall back to the original
# backend-shaped URL for seed cameras that have no public feed.
replace(
    'src/data/cctv.js',
    "  return `${FRAME_ENDPOINT}/${encodeURIComponent(camera.id)}?${params.toString()}`;",
    "  const direct = String(camera?.snapshotUrl || '').trim();\n  if (/^https:\\/\\//i.test(direct)) {\n    const sep = direct.includes('?') ? '&' : '?';\n    return `${direct}${sep}rhkTs=${tick}`;\n  }\n  return `${FRAME_ENDPOINT}/${encodeURIComponent(camera.id)}?${params.toString()}`;",
)

# Static RHKEARTH does not have the original terrain-height proxy. Do not let
# CCTV initialization wait eight seconds for that missing endpoint; the layer
# already has catalog/ellipsoid fallbacks and refines geometry when available.
replace('src/data/cctv.js', 'const GROUND_PRIOR_INIT_WAIT_MS = 8000;', 'const GROUND_PRIOR_INIT_WAIT_MS = 100;')

# Google-Earth-style navigation ---------------------------------------------
# Explicitly allow an orbital/full-Earth pullback. This changes navigation
# limits only; it does not change RHKEARTH imagery, HUD, or intelligence layers.
main = Path('src/main.js')
main_text = main.read_text()
zoom_anchor = "    viewer.targetFrameRate = 60;\n"
zoom_patch = """    viewer.targetFrameRate = 60;\n\n    // RHKEARTH Experimental: allow a true orbital/full-Earth pullback.\n    // Cesium remains the renderer; this only relaxes camera navigation range.\n    const rhkCameraController = viewer.scene.screenSpaceCameraController;\n    if (rhkCameraController) {\n      rhkCameraController.minimumZoomDistance = 1;\n      rhkCameraController.maximumZoomDistance = 150_000_000;\n      rhkCameraController.enableCollisionDetection = true;\n    }\n"""
if zoom_anchor not in main_text:
    raise SystemExit('Could not locate viewer.targetFrameRate camera anchor')
main.write_text(main_text.replace(zoom_anchor, zoom_patch, 1))

print('RHKEARTH Experimental static data, CCTV, traffic, and globe-navigation adapters applied')
