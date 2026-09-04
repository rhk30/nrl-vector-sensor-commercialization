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

# -----------------------------------------------------------------------------
# Desktop interaction performance governor
# -----------------------------------------------------------------------------
# The static RHKEARTH build combines Google Photorealistic 3D Tiles, a full-
# screen Noir post-process stage and live overlays. Rendering every camera-move
# frame at native desktop pixel density while the 3D tileset aggressively
# refines can make wheel/pan navigation feel much slower than the configured
# 60-fps target. During active camera movement only, reduce the shaded pixel
# count and loosen 3D-tile refinement. Restore full quality immediately after
# movement settles. This is intentionally desktop/fine-pointer only.
MAIN = ROOT / 'src/main.js'
main_text = MAIN.read_text(encoding='utf-8')
PERF_MARKER = 'RHKEARTH_DESKTOP_INTERACTION_PERF_V1'
if PERF_MARKER not in main_text:
    anchor = '    viewer.targetFrameRate = 60;\n'
    perf = r'''    viewer.targetFrameRate = 60;

    // RHKEARTH_DESKTOP_INTERACTION_PERF_V1
    // Preserve full visual quality at rest, but spend fewer GPU cycles while
    // the user is actively panning/zooming. High-DPI desktop displays benefit
    // the most because Noir is a full-screen post-process pass.
    (() => {
      const finePointer = window.matchMedia?.('(pointer: fine)');
      const desktopInteraction = (finePointer?.matches ?? true) && window.innerWidth >= 900;
      if (!desktopInteraction) return;

      const dpr = Math.max(1, Number(window.devicePixelRatio) || 1);
      const restingScale = Math.max(0.5, Number(viewer.resolutionScale) || 1);
      const movingScale = Math.min(
        restingScale,
        dpr >= 2 ? 0.70 : dpr >= 1.5 ? 0.76 : dpr >= 1.2 ? 0.80 : 0.84,
      );
      let restoreTimer = 0;
      let tileset = null;
      let restingSse = null;

      const findPhotorealisticTileset = () => {
        const primitives = viewer.scene?.primitives;
        if (!primitives) return null;
        for (let i = 0; i < primitives.length; i += 1) {
          const primitive = primitives.get(i);
          if (!primitive) continue;
          if (typeof primitive.maximumScreenSpaceError === 'number' && primitive.root) {
            return primitive;
          }
        }
        return null;
      };

      const beginInteraction = () => {
        if (restoreTimer) {
          clearTimeout(restoreTimer);
          restoreTimer = 0;
        }
        if (viewer.resolutionScale !== movingScale) viewer.resolutionScale = movingScale;

        tileset ||= findPhotorealisticTileset();
        if (tileset) {
          if (!Number.isFinite(restingSse)) restingSse = Number(tileset.maximumScreenSpaceError) || 16;
          const movingSse = Math.max(restingSse, 24);
          if (tileset.maximumScreenSpaceError !== movingSse) {
            tileset.maximumScreenSpaceError = movingSse;
          }
        }
        viewer.scene?.requestRender?.();
      };

      const restoreQuality = () => {
        if (restoreTimer) clearTimeout(restoreTimer);
        restoreTimer = window.setTimeout(() => {
          restoreTimer = 0;
          if (viewer.resolutionScale !== restingScale) viewer.resolutionScale = restingScale;
          if (tileset && Number.isFinite(restingSse) && tileset.maximumScreenSpaceError !== restingSse) {
            tileset.maximumScreenSpaceError = restingSse;
          }
          viewer.scene?.requestRender?.();
        }, 160);
      };

      viewer.camera.moveStart.addEventListener(beginInteraction);
      viewer.camera.moveEnd.addEventListener(restoreQuality);
      window.addEventListener('blur', restoreQuality, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) restoreQuality();
      }, { passive: true });

      console.log(`[RHKEARTH] Desktop movement governor active · ${movingScale.toFixed(2)} render scale while moving`);
    })();
'''
    if anchor not in main_text:
        raise SystemExit('RHKEARTH desktop performance anchor missing: viewer.targetFrameRate')
    main_text = main_text.replace(anchor, perf, 1)
    MAIN.write_text(main_text, encoding='utf-8')

main_check = MAIN.read_text(encoding='utf-8')
for needle in [
    PERF_MARKER,
    'viewer.camera.moveStart.addEventListener(beginInteraction)',
    'viewer.camera.moveEnd.addEventListener(restoreQuality)',
    'primitive.maximumScreenSpaceError',
    'viewer.resolutionScale = movingScale',
]:
    if needle not in main_check:
        raise SystemExit('Desktop interaction performance contract missing: ' + needle)

print('RHKEARTH aircraft motion integrity + desktop interaction performance applied: live military ADS-B primary, honest fallback epochs, movement-time adaptive render quality')
