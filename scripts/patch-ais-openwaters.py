from pathlib import Path
import re

ROOT = Path.cwd()
path = ROOT / 'src/data/aisLiveVessels.js'
text = path.read_text(encoding='utf-8')

# RHKEARTH production AIS uses Open Waters' public CORS GeoJSON snapshot.
# Never request the provider's unbounded global snapshot from the browser: at
# globe scale that can be large enough to hit the layer's request timeout.
text = text.replace("const REFRESH_MS = 60000;", "const REFRESH_MS = 20000;", 1)
text = text.replace("  source: 'AISStream',", "  source: 'Open Waters AIS',", 1)
text = text.replace("AbortSignal.timeout(10000)", "AbortSignal.timeout(15000)", 1)

old_url = '''function liveApiUrl() {
  const base = import.meta.env?.VITE_AIS_LIVE_API_URL || DEFAULT_API_URL;
  if (String(base).startsWith('https://ais.openwaters.io/')) return String(base);
  const url = new URL(base, window.location.origin);
  url.searchParams.set('maxRows', String(renderRowLimit()));
  return url.toString();
}'''

new_url = '''function liveApiUrl(viewer) {
  const base = import.meta.env?.VITE_AIS_LIVE_API_URL || DEFAULT_API_URL;
  const url = new URL(base, window.location.origin);

  if (String(base).startsWith('https://ais.openwaters.io/')) {
    // Bound each browser request to the current operating area. At orbital
    // zoom the raw Cesium view rectangle can approach a hemisphere, so cap the
    // request to a 40° x 70° box around the camera center. From the RHKEARTH
    // U.S. startup pose this still includes both coasts and the Gulf while
    // avoiding the provider's full-world payload. At local zoom the actual
    // viewport is used, padded slightly so vessels do not pop at the edges.
    let centerLat = 39.5;
    let centerLon = -98.35;
    let latSpan = 40;
    let lonSpan = 70;

    try {
      const carto = viewer?.camera?.positionCartographic;
      if (carto) {
        const lat = Cesium.Math.toDegrees(carto.latitude);
        const lon = Cesium.Math.toDegrees(carto.longitude);
        if (Number.isFinite(lat)) centerLat = Math.max(-80, Math.min(80, lat));
        if (Number.isFinite(lon)) centerLon = lon;
      }

      const rect = viewer?.camera?.computeViewRectangle?.(Cesium.Ellipsoid.WGS84);
      if (rect) {
        const south = Cesium.Math.toDegrees(rect.south);
        const north = Cesium.Math.toDegrees(rect.north);
        const west = Cesium.Math.toDegrees(rect.west);
        const east = Cesium.Math.toDegrees(rect.east);
        const visibleLatSpan = Math.max(0, north - south);
        let visibleLonSpan = east - west;
        if (visibleLonSpan < 0) visibleLonSpan += 360;
        if (Number.isFinite(visibleLatSpan) && visibleLatSpan > 0) {
          latSpan = Math.min(40, Math.max(4, visibleLatSpan * 1.15));
        }
        if (Number.isFinite(visibleLonSpan) && visibleLonSpan > 0) {
          lonSpan = Math.min(70, Math.max(8, visibleLonSpan * 1.15));
        }
      }
    } catch {
      // Keep the safe U.S.-wide default if Cesium cannot resolve a view rect.
    }

    const halfLat = latSpan / 2;
    const halfLon = lonSpan / 2;
    const minLat = Math.max(-85, centerLat - halfLat);
    const maxLat = Math.min(85, centerLat + halfLat);
    // Open Waters expects minLat,minLon,maxLat,maxLon. Clamp at the dateline;
    // the next camera move refreshes the opposite side if the operator crosses.
    const minLon = Math.max(-180, centerLon - halfLon);
    const maxLon = Math.min(180, centerLon + halfLon);
    url.searchParams.set('bbox', [minLat, minLon, maxLat, maxLon]
      .map((value) => Number(value).toFixed(4)).join(','));
    return url.toString();
  }

  url.searchParams.set('maxRows', String(renderRowLimit()));
  return url.toString();
}'''

if old_url not in text:
    raise SystemExit('RHKEARTH AIS patch: Open Waters liveApiUrl target missing')
text = text.replace(old_url, new_url, 1)

if 'const url = liveApiUrl();' not in text:
    raise SystemExit('RHKEARTH AIS patch: loadLivePositions URL call missing')
text = text.replace('const url = liveApiUrl();', 'const url = liveApiUrl(viewer);', 1)

# Make the Open Waters adapter preserve provider freshness instead of stamping
# every returned point with the browser's current time.
old_snapshot = '''      payload = {
        status: 'live',
        rows,
        lastMessageAt: Date.now(),
        newestPositionAt: Date.now(),
        refreshing: false,
        source: 'Open Waters AIS',
      };'''
new_snapshot = '''      const newestSeenMs = rows.reduce((latest, row) => {
        const epoch = Number(row.last_position_epoch);
        return Number.isFinite(epoch) ? Math.max(latest, epoch * 1000) : latest;
      }, 0);
      payload = {
        status: 'live',
        rows,
        lastMessageAt: newestSeenMs || Date.now(),
        newestPositionAt: newestSeenMs || null,
        refreshing: false,
        source: 'Open Waters AIS · viewport',
      };'''
if old_snapshot not in text:
    raise SystemExit('RHKEARTH AIS patch: Open Waters snapshot adapter target missing')
text = text.replace(old_snapshot, new_snapshot, 1)

path.write_text(text, encoding='utf-8')
print('RHKEARTH AIS repaired: bounded Open Waters viewport requests, 20 s refresh, true provider freshness')
