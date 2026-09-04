from pathlib import Path

ROOT = Path.cwd()
MILITARY = ROOT / 'src/data/militaryFlights.js'
text = MILITARY.read_text(encoding='utf-8')

MARKER = 'RHKEARTH_MILITARY_LIVE_PRIMARY'
if MARKER not in text:
    old_api = "const API_URL = '/experimental/live-data/military.json';"
    new_api = r'''// RHKEARTH_MILITARY_LIVE_PRIMARY
// Use the real adsb.lol military feed in the browser whenever CORS/network
// policy allows it. The hourly same-origin snapshot is only a continuity
// fallback. Critically, fallback motion is timestamped from the snapshot's
// own `now` field below — never from browser receipt time — so an old file
// cannot masquerade as a fresh moving aircraft feed.
const API_URL = 'https://api.adsb.lol/v2/mil';
const FALLBACK_API_URL = '/experimental/live-data/military.json';
let _lastFeedSource = 'adsb.lol live';
let _lastFeedFallback = false;

async function _fetchMilitaryResponse(signal) {
  let liveError = null;
  try {
    const response = await fetch(API_URL, {
      signal,
      cache: 'no-store',
      mode: 'cors',
    });
    if (!response.ok) throw new Error(`adsb.lol live HTTP ${response.status}`);
    _lastFeedSource = 'adsb.lol live';
    _lastFeedFallback = false;
    return response;
  } catch (error) {
    if (signal?.aborted) throw error;
    liveError = error;
    console.warn('[Data:Military] live adsb.lol unavailable; trying same-origin snapshot', error);
  }

  const fallback = await fetch(FALLBACK_API_URL, {
    signal,
    cache: 'no-store',
  });
  if (!fallback.ok) {
    throw liveError || new Error(`Military fallback HTTP ${fallback.status}`);
  }
  _lastFeedSource = 'adsb.lol · RHKEARTH snapshot fallback';
  _lastFeedFallback = true;
  return fallback;
}'''
    if old_api not in text:
        raise SystemExit('Military API anchor missing before motion patch')
    text = text.replace(old_api, new_api, 1)

    old_fetch = "      const response = await fetch(API_URL, { signal: updateSignal });"
    new_fetch = "      const response = await _fetchMilitaryResponse(updateSignal);"
    if old_fetch not in text:
        raise SystemExit('Military fetch call missing before motion patch')
    text = text.replace(old_fetch, new_fetch, 1)

    old_receipt = "      const receiptNowMs = Date.now();"
    new_receipt = r'''      // adsb.lol `seen` / `seen_pos` are ages relative to the feed's own
      // response clock. Use payload.now when supplied so a cached/hourly fallback
      // retains its REAL source epoch instead of becoming artificially fresh each
      // time the browser re-reads the same file.
      const payloadNow = _toFiniteNumber(data?.now);
      const receiptNowMs = Number.isFinite(payloadNow)
        ? (payloadNow > 10_000_000_000 ? payloadNow : payloadNow * 1000)
        : Date.now();
      const sourceAgeMs = Math.max(0, Date.now() - receiptNowMs);
      if (_lastFeedFallback && sourceAgeMs > 5 * 60 * 1000) {
        _lastError = `Military fallback snapshot ${Math.max(1, Math.round(sourceAgeMs / 60000))} min old`;
      }'''
    if old_receipt not in text:
        raise SystemExit('Military receipt clock anchor missing before motion patch')
    text = text.replace(old_receipt, new_receipt, 1)

    old_update = "      _lastUpdate = Date.now();"
    new_update = "      _lastUpdate = receiptNowMs;"
    if old_update not in text:
        raise SystemExit('Military lastUpdate anchor missing before motion patch')
    text = text.replace(old_update, new_update, 1)

    old_outcome = """      _lastTrackingRefreshOutcome = {
        epoch: trackingRefreshEpoch,
        status: 'accepted',
        ids: currentIcaos,
        source: 'adsb.lol',
      };"""
    new_outcome = """      _lastTrackingRefreshOutcome = {
        epoch: trackingRefreshEpoch,
        status: 'accepted',
        ids: currentIcaos,
        source: _lastFeedSource,
      };"""
    if old_outcome not in text:
        raise SystemExit('Military accepted tracking outcome anchor missing')
    text = text.replace(old_outcome, new_outcome, 1)

    old_stats = """      source: 'adsb.lol',
      fallback: false,"""
    new_stats = """      source: _lastFeedSource,
      fallback: _lastFeedFallback,"""
    if old_stats not in text:
        raise SystemExit('Military stats source anchor missing')
    text = text.replace(old_stats, new_stats, 1)

    old_log = "      console.log(`[Data:Military] Updated: ${_count} aircraft`);"
    new_log = "      console.log(`[Data:Military] Updated: ${_count} aircraft · ${_lastFeedSource}`);"
    if old_log in text:
        text = text.replace(old_log, new_log, 1)

MILITARY.write_text(text, encoding='utf-8')

# Guard the civilian movement contract as well. RHKEARTH intentionally keeps
# the upstream render-behind smoother: 30 s polling, 30 s display delay, and
# position history/dead reckoning between true feed-stamped fixes.
FLIGHTS = ROOT / 'src/data/flights.js'
flights = FLIGHTS.read_text(encoding='utf-8')
required = [
    'const RENDER_DELAY_SEC = 30;',
    'const POSITION_HISTORY_LIMIT = 5;',
    'updateInterval: 30000,',
    'function _deadReckon(icao24, result)',
]
missing = [needle for needle in required if needle not in flights]
if missing:
    raise SystemExit('Civilian motion contract missing: ' + ', '.join(missing))

required_military = [
    MARKER,
    "const API_URL = 'https://api.adsb.lol/v2/mil';",
    "const FALLBACK_API_URL = '/experimental/live-data/military.json';",
    'const payloadNow = _toFiniteNumber(data?.now);',
    '_lastUpdate = receiptNowMs;',
    'updateInterval: 15000,',
    'function _deadReckon(icao24, result)',
]
missing = [needle for needle in required_military if needle not in text]
if missing:
    raise SystemExit('Military motion contract missing: ' + ', '.join(missing))

print('RHKEARTH aircraft motion integrity applied: live military ADS-B primary, honest fallback epochs, civilian/military smoothing guards')
