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
# Civilian LIVE FLIGHTS: use adsb.lol directly in the browser. The military
# layer already uses adsb.lol successfully; its public v2 point endpoint is
# CORS-enabled and returns the ADS-B Exchange-style `ac` records handled by the
# upstream adsbLolFallback normalizer. Keep requests regional to the current
# camera view so RHKEARTH is responsive and does not need a global snapshot.
# -----------------------------------------------------------------------------
flights = ROOT / 'src/data/flights.js'
text = flights.read_text(encoding='utf-8')

import_anchor = "import * as Cesium from 'cesium';\n"
adsb_import = "import { normalizeAdsbLolPointResponse } from './adsbLolFallback.js';\n"
if adsb_import not in text:
    if import_anchor not in text:
        raise SystemExit('Flights Cesium import anchor missing')
    text = text.replace(import_anchor, import_anchor + adsb_import, 1)

text = text.replace("const API_URL = '/api/opensky';", "const API_URL = 'https://api.adsb.lol/v2/point';", 1)
text = text.replace("let _lastSource = 'OpenSky Network';", "let _lastSource = 'adsb.lol';", 1)
text = text.replace("let _lastCoverage = 'worldwide upstream snapshot';", "let _lastCoverage = 'viewport · up to 250 nm';", 1)

flight_url_pattern = re.compile(
    r"function _flightApiUrl\(viewer\) \{.*?\n\}",
    re.S,
)
flight_url_replacement = r'''function _flightApiUrl(viewer) {
  const cartographic = viewer?.camera?.positionCartographic;
  if (!cartographic) return `${API_URL}/41.8781/-87.6298/250`;
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return `${API_URL}/41.8781/-87.6298/250`;
  }
  // adsb.lol caps point searches at 250 nautical miles. That is a useful
  // regional operating picture and avoids downloading a global aircraft set.
  return `${API_URL}/${latitude.toFixed(4)}/${longitude.toFixed(4)}/250`;
}'''
text, n = flight_url_pattern.subn(flight_url_replacement, text, count=1)
if n != 1:
    raise SystemExit('Could not replace Flights API URL builder')

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

text = text.replace("_lastError = 'Malformed OpenSky response';", "_lastError = 'Malformed adsb.lol response';", 1)
text = text.replace("_lastSource = responseSource || 'OpenSky Network';", "_lastSource = responseSource || 'adsb.lol';", 1)
text = text.replace("_lastCoverage = responseCoverage || 'worldwide upstream snapshot';", "_lastCoverage = responseCoverage || 'viewport · up to 250 nm';", 1)
text = text.replace('`OpenSky HTTP ${response.status}`', '`adsb.lol HTTP ${response.status}`')
text = text.replace('[Data:Flights] OpenSky unavailable', '[Data:Flights] adsb.lol unavailable')
text = text.replace("source: 'OpenSky Network',", "source: 'adsb.lol',", 1)
text = text.replace("source: _lastSource,", "source: _lastSource,", 1)
text = text.replace("reason: 'OpenSky snapshot unavailable'", "reason: 'adsb.lol snapshot unavailable'")

flights.write_text(text, encoding='utf-8')


# -----------------------------------------------------------------------------
# STREET TRAFFIC: the static GitHub Pages build cannot use the upstream Vite
# Overpass proxy. A single public browser endpoint was too brittle, so try a
# small ordered mirror pool before declaring road geometry unavailable.
# -----------------------------------------------------------------------------
traffic = ROOT / 'src/data/traffic.js'
text = traffic.read_text(encoding='utf-8')

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

print('RHKEARTH live runtime repaired: adsb.lol civilian flights, Overpass mirror failover, TfL rolling-video CCTV')