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

# Space Missions — Launch Library 2 + the same locally refreshed CelesTrak
# active catalog. Launches remain recent while avoiding an unavailable /api route.
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

# Correct the visible attribution for the fallback build.
credits = Path('src/data/dataCredits.js')
credit_text = credits.read_text()
credit_text = credit_text.replace(
    "'Active fires: NASA FIRMS — we acknowledge the use of data and/or imagery ' +\n      'from NASA’s Fire Information for Resource Management System ' +\n      '(<a href=\"https://earthdata.nasa.gov/firms\" target=\"_blank\" rel=\"noopener\">earthdata.nasa.gov/firms</a>), ' +\n      'part of NASA’s Earth Observing System Data and Information System (EOSDIS)'",
    "'Wildfire events: NASA EONET — Earth Observatory Natural Event Tracker ' +\n      '(<a href=\"https://eonet.gsfc.nasa.gov/\" target=\"_blank\" rel=\"noopener\">eonet.gsfc.nasa.gov</a>)'",
)
credits.write_text(credit_text)

# Keyless road simulation: the upstream server only proxied Overpass for CORS,
# caching and resilience. Public Overpass supports browser POST requests, so use
# it directly in this static build. TomTom remains optional; if its status route
# is absent the existing code falls back to simulated flow.
replace(
    'src/data/traffic.js',
    "const OVERPASS_URL = '/api/overpass';",
    "const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';",
)

print('RHKEARTH Experimental static data adapters applied')
