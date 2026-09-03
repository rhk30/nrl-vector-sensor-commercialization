from pathlib import Path
import re

ROOT = Path.cwd()


def replace(path, old, new, *, required=True, count=1):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        if required:
            raise SystemExit(f'Patch target missing in {path}: {old[:120]!r}')
        return False
    p.write_text(text.replace(old, new, count), encoding='utf-8')
    return True


# -----------------------------------------------------------------------------
# Civilian LIVE FLIGHTS: static hosting means there is no Vite /api/opensky
# proxy in production. Try browser-CORS regional providers first. If the browser
# blocks or those providers are unavailable, use RHKEARTH's own hourly OpenSky
# global snapshot from /experimental-data/flights.json. The same-origin fallback
# is intentionally cached in memory so a provider outage does not redownload a
# ~1.6 MB snapshot on every normal refresh tick.
# -----------------------------------------------------------------------------
flights = ROOT / 'src/data/flights.js'
text = flights.read_text(encoding='utf-8')

if 'const FLIGHT_API_PROVIDERS = [' not in text:
    import_anchor = "import * as Cesium from 'cesium';\n"
    adsb_import = "import { normalizeAdsbLolPointResponse } from './adsbLolFallback.js';\n"
    if adsb_import not in text:
        if import_anchor not in text:
            raise SystemExit('Flights Cesium import anchor missing')
        text = text.replace(import_anchor, import_anchor + adsb_import, 1)

    text = text.replace("const API_URL = '/api/opensky';", "const API_URL = 'https://api.airplanes.live/v2/point';", 1)
    text = text.replace("let _lastSource = 'OpenSky Network';", "let _lastSource = 'Airplanes.live';", 1)
    text = text.replace("let _lastCoverage = 'worldwide upstream snapshot';", "let _lastCoverage = 'viewport · up to 250 nm';", 1)

    flight_url_pattern = re.compile(
        r"function _flightApiUrl\(viewer\) \{.*?\n\}",
        re.S,
    )
    flight_url_replacement = r'''function _flightCenter(viewer) {
  const cartographic = viewer?.camera?.positionCartographic;
  if (!cartographic) return { latitude: 41.8781, longitude: -87.6298 };
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { latitude: 41.8781, longitude: -87.6298 };
  }
  return { latitude, longitude };
}

function _flightApiUrl(viewer) {
  const { latitude, longitude } = _flightCenter(viewer);
  return `${API_URL}/${latitude.toFixed(4)}/${longitude.toFixed(4)}/250`;
}

const FLIGHT_API_PROVIDERS = [
  {
    name: 'Airplanes.live',
    url: (lat, lon) => `https://api.airplanes.live/v2/point/${lat}/${lon}/250`,
  },
  {
    name: 'adsb.lol',
    url: (lat, lon) => `https://api.adsb.lol/v2/point/${lat}/${lon}/250`,
  },
  {
    name: 'adsb.fi',
    url: (lat, lon) => `https://opendata.adsb.fi/api/v3/lat/${lat}/lon/${lon}/dist/250`,
  },
];

let _staticFlightSnapshot = null;
let _staticFlightSnapshotLoadedAt = 0;
const STATIC_FLIGHT_CACHE_MS = 15 * 60 * 1000;

async function _staticFlightResponse(signal) {
  const now = Date.now();
  if (!_staticFlightSnapshot || now - _staticFlightSnapshotLoadedAt > STATIC_FLIGHT_CACHE_MS) {
    const snapshotResponse = await fetch('/experimental-data/flights.json', {
      signal,
      cache: 'no-store',
    });
    if (!snapshotResponse.ok) {
      throw new Error(`RHKEARTH aircraft snapshot HTTP ${snapshotResponse.status}`);
    }
    const snapshot = await snapshotResponse.json();
    if (!snapshot || !Array.isArray(snapshot.states)) {
      throw new Error('RHKEARTH aircraft snapshot malformed');
    }
    _staticFlightSnapshot = snapshot;
    _staticFlightSnapshotLoadedAt = now;
  }

  return new Response(JSON.stringify(_staticFlightSnapshot), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'x-flight-source': 'OpenSky · RHKEARTH snapshot',
      'x-flight-coverage': 'global · scheduled OpenSky snapshot',
      'x-flight-fallback': 'same-origin',
    },
  });
}

async function _fetchFlightResponse(viewer, signal) {
  const { latitude, longitude } = _flightCenter(viewer);
  const lat = latitude.toFixed(4);
  const lon = longitude.toFixed(4);
  let lastError = null;

  for (const provider of FLIGHT_API_PROVIDERS) {
    try {
      const upstream = await fetch(provider.url(lat, lon), {
        signal,
        cache: 'no-store',
        mode: 'cors',
      });
      if (!upstream.ok) {
        throw new Error(`${provider.name} HTTP ${upstream.status}`);
      }
      const payload = await upstream.json();
      const adapted = Array.isArray(payload?.aircraft)
        ? { ...payload, ac: payload.aircraft }
        : payload;
      const normalized = Array.isArray(adapted?.ac)
        ? normalizeAdsbLolPointResponse(adapted)
        : adapted;
      if (!normalized || !Array.isArray(normalized.states)) {
        throw new Error(`${provider.name} malformed response`);
      }
      return new Response(JSON.stringify(normalized), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'x-flight-source': provider.name,
          'x-flight-coverage': 'viewport · up to 250 nm',
        },
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
      console.warn(`[Data:Flights] ${provider.name} failed, trying fallback`, error);
    }
  }

  try {
    console.warn('[Data:Flights] Browser ADS-B providers unavailable; using RHKEARTH same-origin OpenSky snapshot', lastError);
    return await _staticFlightResponse(signal);
  } catch (snapshotError) {
    if (signal?.aborted) throw snapshotError;
    console.warn('[Data:Flights] Same-origin aircraft snapshot unavailable', snapshotError);
    throw lastError || snapshotError || new Error('All civilian flight sources unavailable');
  }
}'''
    text, n = flight_url_pattern.subn(flight_url_replacement, text, count=1)
    if n != 1:
        raise SystemExit('Could not replace Flights API URL builder')

    old_fetch = "      const response = await fetch(_flightApiUrl(viewer || _viewer), { signal: updateSignal });"
    new_fetch = "      const response = await _fetchFlightResponse(viewer || _viewer, updateSignal);"
    if old_fetch not in text:
        raise SystemExit('Could not locate Flights fetch call')
    text = text.replace(old_fetch, new_fetch, 1)

    old_payload = '''      const data = await response.json();
      updateSignal.throwIfAborted();
      if (!data || !Array.isArray(data.states)) {'''
    new_payload = '''      const rawData = await response.json();
      updateSignal.throwIfAborted();
      const data = Array.isArray(rawData?.ac)
        ? normalizeAdsbLolPointResponse(rawData)
        : rawData;
      if (!data || !Array.isArray(data.states)) {'''
    if old_payload not in text:
        raise SystemExit('Could not locate Flights response normalization block')
    text = text.replace(old_payload, new_payload, 1)

    # The upstream renderer marks any source timestamp older than two minutes as
    # unavailable/backoff. That is correct for a supposedly-live direct feed but
    # wrong for our explicitly-labeled scheduled fallback. Keep its actual source
    # timestamp for honesty while allowing those real state vectors to render.
    old_stale = "      const sourceStale = sourceAgeMs > SOURCE_STALE_MS;"
    new_stale = "      const sameOriginFallback = response.headers.get('x-flight-fallback') === 'same-origin';\n      const sourceStale = !sameOriginFallback && sourceAgeMs > SOURCE_STALE_MS;"
    if old_stale not in text:
        raise SystemExit('Could not locate Flights source staleness gate')
    text = text.replace(old_stale, new_stale, 1)

    text = text.replace("_lastError = 'Malformed OpenSky response';", "_lastError = 'Malformed civilian ADS-B response';", 1)
    text = text.replace("_lastSource = responseSource || 'OpenSky Network';", "_lastSource = responseSource || 'Airplanes.live';", 1)
    text = text.replace("_lastCoverage = responseCoverage || 'worldwide upstream snapshot';", "_lastCoverage = responseCoverage || 'viewport · up to 250 nm';", 1)
    text = text.replace('`OpenSky HTTP ${response.status}`', '`Civilian ADS-B HTTP ${response.status}`')
    text = text.replace('[Data:Flights] OpenSky unavailable', '[Data:Flights] civilian ADS-B unavailable')
    text = text.replace("source: 'OpenSky Network',", "source: 'Airplanes.live',", 1)
    text = text.replace("reason: 'OpenSky snapshot unavailable'", "reason: 'Civilian ADS-B snapshot unavailable'")

    flights.write_text(text, encoding='utf-8')


# -----------------------------------------------------------------------------
# STREET TRAFFIC: the static GitHub Pages build cannot use the upstream Vite
# Overpass proxy. A single public browser endpoint was too brittle, so try a
# small ordered mirror pool before declaring road geometry unavailable.
# -----------------------------------------------------------------------------
traffic = ROOT / 'src/data/traffic.js'
text = traffic.read_text(encoding='utf-8')

if 'const OVERPASS_URLS = [' not in text:
    old_const = "const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';"
    if old_const not in text:
        old_const = "const OVERPASS_URL = '/api/overpass';"
    new_const = '''const OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

async function fetchOverpass(query, signal) {
  let lastError = null;
  for (const url of OVERPASS_URLS) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal,
      });
      if (response.ok) return response;
      lastError = new Error(`Overpass ${response.status} from ${new URL(url).host}`);
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }
  throw lastError || new Error('All Overpass mirrors unavailable');
}'''
    if old_const not in text:
        raise SystemExit('Traffic Overpass constant not found')
    text = text.replace(old_const, new_const, 1)

    old_fetch = '''  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal,
  });'''
    if old_fetch not in text:
        raise SystemExit('Traffic Overpass fetch block not found')
    text = text.replace(old_fetch, '  const response = await fetchOverpass(query, signal);', 1)
    traffic.write_text(text, encoding='utf-8')


# -----------------------------------------------------------------------------
# LONDON CCTV VIDEO: RHKEARTH's refreshed TfL catalog carries both the JPG
# poster and the official MP4 rolling clip. The upstream CCTV module already
# supports video textures; give it the direct media URL instead of its missing
# Node /api/cctv/media proxy. TfL updates the rolling clip every few minutes, so
# reload the active MP4 periodically instead of looping one stale clip forever.
# -----------------------------------------------------------------------------
cctv = ROOT / 'src/data/cctv.js'
text = cctv.read_text(encoding='utf-8')

if 'rhkLive=' not in text:
    frame_field = "      directFrameUrl: String(source.snapshotUrl || source.url || '').trim(),"
    if frame_field in text and 'directMediaUrl:' not in text:
        text = text.replace(
            frame_field,
            frame_field + "\n      directMediaUrl: String(source.mediaUrl || source.videoUrl || '').trim(),",
            1,
        )

    media_pattern = re.compile(
        r"function mediaUrlFor\(camera\) \{\n  return `\$\{MEDIA_ENDPOINT\}/\$\{encodeURIComponent\(camera\.id\)\}\?ts=\$\{Math\.floor\(Date\.now\(\) / 15000\)\}`;\n\}",
        re.S,
    )
    media_replacement = r'''function mediaUrlFor(camera) {
  const direct = String(camera?.directMediaUrl || '').trim();
  if (/^https:\/\//i.test(direct)) {
    const sep = direct.includes('?') ? '&' : '?';
    return `${direct}${sep}rhkLive=${Math.floor(Date.now() / 120000)}`;
  }
  return `${MEDIA_ENDPOINT}/${encodeURIComponent(camera.id)}?ts=${Math.floor(Date.now() / 15000)}`;
}'''
    text, n = media_pattern.subn(media_replacement, text, count=1)
    if n != 1:
        raise SystemExit('Could not patch CCTV direct media URL')

    video_anchor = '''    runtime.video = video;
  } else {'''
    video_patch = '''    runtime.video = video;
    // TfL JamCam MP4s are rolling recent clips at stable URLs. Reload every
    // two minutes with a cache-buster so an activated camera advances to the
    // newest provider clip instead of replaying the first clip indefinitely.
    if (record.camera.directMediaUrl) {
      runtime.mediaRefreshTimer = setInterval(() => {
        if (!runtime.video) return;
        const resume = !runtime.video.paused;
        runtime.video.src = mediaUrlFor(record.camera);
        runtime.video.load();
        if (resume) runtime.video.play().catch(() => {});
      }, 120000);
    }
  } else {'''
    if video_anchor not in text:
        raise SystemExit('Could not locate CCTV video runtime anchor')
    text = text.replace(video_anchor, video_patch, 1)

    destroy_anchor = '''function destroyProjectionRuntime(runtime) {
  if (!runtime) return;
  if (runtime.video) {'''
    destroy_patch = '''function destroyProjectionRuntime(runtime) {
  if (!runtime) return;
  if (runtime.mediaRefreshTimer) {
    clearInterval(runtime.mediaRefreshTimer);
    runtime.mediaRefreshTimer = null;
  }
  if (runtime.video) {'''
    if destroy_anchor not in text:
        raise SystemExit('Could not locate CCTV projection destroy anchor')
    text = text.replace(destroy_anchor, destroy_patch, 1)

    cctv.write_text(text, encoding='utf-8')

print('RHKEARTH live runtime repaired: browser ADS-B with same-origin OpenSky fallback, Overpass mirror failover, TfL rolling-video CCTV')
