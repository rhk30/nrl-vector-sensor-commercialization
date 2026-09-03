from pathlib import Path
import re

ROOT = Path.cwd()


def replace(path, old, new, *, count=1):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'Patch target missing in {path}: {old[:120]!r}')
    p.write_text(text.replace(old, new, count), encoding='utf-8')


# -----------------------------------------------------------------------------
# SPACE MISSIONS + SATELLITES: keep the satellite constellation visible while
# Space Missions is active. Upstream intentionally hid points/orbits when the
# mission layer borrowed the dense catalog; RHKEARTH treats them as two visible
# layers that can coexist.
# -----------------------------------------------------------------------------
replace(
    'src/data/rocketLaunches.js',
    """    ...(currentParams || {}),
    catalog: 'dense',
    showPoints: false,
    showOrbits: false,
""",
    """    ...(currentParams || {}),
    catalog: 'dense',
    showPoints: true,
    showOrbits: true,
""",
)


# -----------------------------------------------------------------------------
# TYPE-AWARE 3D AIRCRAFT: the upstream build already ships real class models
# for helicopters, light aircraft, business jets, UAVs, widebodies and
# turboprops. Add the shipped jet.glb as the real fast-jet model instead of
# letting civilian high-performance contacts fall back to airplane.glb.
# Unknown/uncovered ICAO types still use the existing safe generic fallback.
# -----------------------------------------------------------------------------
aircraft_class = ROOT / 'src/data/aircraftClass.js'
text = aircraft_class.read_text(encoding='utf-8')
if "fastjet:    { url: '/models/jet.glb'" not in text:
    anchor = "export const CLASS_MODEL_REAL = {\n"
    if anchor not in text:
        raise SystemExit('CLASS_MODEL_REAL anchor missing')
    text = text.replace(
        anchor,
        anchor + "  fastjet:    { url: '/models/jet.glb',       bellyM: 5.631, radiusM: 29.83 },\n",
        1,
    )
aircraft_class.write_text(text, encoding='utf-8')


# -----------------------------------------------------------------------------
# CIVILIAN FLIGHT PATHS: the original browser app backfilled a selected plane's
# trail through a local Vite OpenSky proxy, which does not exist on GitHub Pages.
# Use the public tar1090 trace stores directly (best effort, with two providers)
# and keep the existing local fix-history trail as the automatic fallback.
# -----------------------------------------------------------------------------
flights = ROOT / 'src/data/flights.js'
text = flights.read_text(encoding='utf-8')
pattern = re.compile(
    r"async function _backfillTrail\(icao24, token, oldestFixEpochSec\) \{.*?\n\}\n\n/\*\*\n \* Clear the rendered trail",
    re.S,
)
replacement = r'''async function _backfillTrail(icao24, token, oldestFixEpochSec) {
  const hex = String(icao24 || '').trim().toLowerCase();
  if (!/^[0-9a-f~]{6,7}$/.test(hex)) return;

  const tail = hex.slice(-2);
  const traceUrls = [
    `https://adsb.lol/data/traces/${tail}/trace_full_${hex}.json`,
    `https://globe.airplanes.live/data/traces/${tail}/trace_full_${hex}.json`,
  ];

  let baseEpochSec = null;
  let trace = null;
  for (const url of traceUrls) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
        mode: 'cors',
      });
      if (!response.ok) continue;
      const data = await response.json();
      const timestamp = Number(data?.timestamp);
      if (!Number.isFinite(timestamp) || !Array.isArray(data?.trace)) continue;
      baseEpochSec = timestamp;
      trace = data.trace;
      break;
    } catch {
      // Try the next public trace store. Local accumulated history remains the
      // final fallback, so a CORS/provider failure never removes the trail.
    }
  }

  if (!trace || !Number.isFinite(baseEpochSec)) return;
  if (token !== _trailBackfillToken || icao24 !== _trackedIcao) return;

  // readsb trace point: [secondsAfterTimestamp, lat, lon, alt_ft|'ground'|null, ...]
  const parsed = [];
  for (const point of trace) {
    if (!Array.isArray(point)) continue;
    const t = baseEpochSec + Number(point[0]);
    const lat = Number(point[1]);
    const lon = Number(point[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (!Number.isFinite(t) || t >= oldestFixEpochSec) continue;
    parsed.push({ lat, lon, altFt: point[3] });
  }
  if (!parsed.length) return;

  await ensureGeoidReady().catch(() => {});
  await resolveGroundFloorCellsBounded(parsed);
  if (token !== _trailBackfillToken || icao24 !== _trackedIcao) return;

  const older = [];
  let lastAltM = null;
  for (const { lat, lon, altFt } of parsed) {
    const numericAltFt = Number(altFt);
    const baroM = Number.isFinite(numericAltFt)
      ? numericAltFt * 0.3048 + geoidHeight(lat, lon)
      : null;
    let altM = floorAltitudeM(baroM, cachedGroundFloor(lat, lon));
    if (altM == null) altM = lastAltM != null ? lastAltM : 10000;
    lastAltM = altM;
    older.push(Cesium.Cartesian3.fromDegrees(lon, lat, altM));
  }

  _trailPositions = older.concat(_trailPositions);
  if (_trailPositions.length > TRAIL_MAX_POINTS) {
    _trailPositions = _trailPositions.slice(_trailPositions.length - TRAIL_MAX_POINTS);
  }
  _refreshTrailDisplay();
}

/**
 * Clear the rendered trail'''
text, n = pattern.subn(replacement, text, count=1)
if n != 1:
    raise SystemExit(f'Could not replace civilian flight trail backfill (matches={n})')
flights.write_text(text, encoding='utf-8')

print('RHKEARTH flight/satellite patch applied: concurrent satellites, type-aware models, selected-aircraft trace backfill')
