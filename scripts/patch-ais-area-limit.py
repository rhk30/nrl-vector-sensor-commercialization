from pathlib import Path
import re

ROOT = Path.cwd()
TARGET = ROOT / 'src/data/aisLiveVessels.js'
text = TARGET.read_text(encoding='utf-8')

marker = 'RHKEARTH_AIS_ANON_AREA_LIMIT_V3'

# patch-entity-details.py already installs currentAisViewportBbox(). Tighten that
# existing helper here instead of declaring a second function, which breaks Vite.
bbox_pattern = re.compile(
    r"function currentAisViewportBbox\(\) \{.*?\n\}\n\nfunction liveApiUrl\(\)",
    re.S,
)
bbox_replacement = r'''// RHKEARTH_AIS_ANON_AREA_LIMIT_V3
// Open Waters anonymous vessel snapshots require a bbox and cap it at 100
// square degrees. Use the visible rectangle only when it fits; otherwise use
// a compact box around the camera target. This keeps Maritime usable while
// panning worldwide and prevents anonymous HTTP 400 responses.
function currentAisViewportBbox() {
  const viewer = state.viewer;
  const camera = viewer?.camera;
  const ellipsoid = viewer?.scene?.globe?.ellipsoid || Cesium.Ellipsoid.WGS84;
  const rect = camera?.computeViewRectangle?.(ellipsoid);

  if (rect) {
    const minLat = Cesium.Math.toDegrees(rect.south);
    const maxLat = Cesium.Math.toDegrees(rect.north);
    const minLon = Cesium.Math.toDegrees(rect.west);
    const maxLon = Cesium.Math.toDegrees(rect.east);
    const latSpan = maxLat - minLat;
    const lonSpan = maxLon - minLon;
    const area = latSpan * lonSpan;
    if (Number.isFinite(area) && area > 0 && area <= 96 && minLon <= maxLon) {
      return [
        Math.max(-90, minLat),
        Math.max(-180, minLon),
        Math.min(90, maxLat),
        Math.min(180, maxLon),
      ];
    }
  }

  let centerLat = 39.5;
  let centerLon = -98.35;
  try {
    const canvas = viewer?.scene?.canvas;
    const center = canvas
      ? camera?.pickEllipsoid?.(
          new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2),
          ellipsoid,
        )
      : null;
    const carto = center
      ? ellipsoid.cartesianToCartographic(center)
      : camera?.positionCartographic;
    if (carto) {
      const lat = Cesium.Math.toDegrees(carto.latitude);
      const lon = Cesium.Math.toDegrees(carto.longitude);
      if (Number.isFinite(lat)) centerLat = lat;
      if (Number.isFinite(lon)) centerLon = lon;
    }
  } catch { /* retain safe defaults */ }

  // 9.6° × 9.6° = 92.16 square degrees, leaving margin under the cap.
  const half = 4.8;
  let minLat = Math.max(-90, centerLat - half);
  let maxLat = Math.min(90, centerLat + half);
  let minLon = centerLon - half;
  let maxLon = centerLon + half;

  if (minLon < -180) {
    maxLon += (-180 - minLon);
    minLon = -180;
  }
  if (maxLon > 180) {
    minLon -= (maxLon - 180);
    maxLon = 180;
  }
  minLon = Math.max(-180, minLon);
  maxLon = Math.min(180, maxLon);
  return [minLat, minLon, maxLat, maxLon];
}

function liveApiUrl()'''
text, bbox_count = bbox_pattern.subn(bbox_replacement, text, count=1)
if bbox_count != 1:
    raise SystemExit('RHKEARTH AIS bbox helper patch target missing')

live_pattern = re.compile(r"function liveApiUrl\(\) \{.*?\n\}", re.S)
live_replacement = r'''function liveApiUrl() {
  const base = import.meta.env?.VITE_AIS_LIVE_API_URL || DEFAULT_API_URL;
  const url = new URL(base, window.location.origin);
  if (url.hostname === 'ais.openwaters.io' && url.pathname === '/v1/vessels') {
    url.searchParams.set('bbox', currentAisViewportBbox().map((n) => n.toFixed(4)).join(','));
    return url.toString();
  }
  url.searchParams.set('maxRows', String(renderRowLimit()));
  return url.toString();
}'''
text, live_count = live_pattern.subn(live_replacement, text, count=1)
if live_count != 1:
    raise SystemExit('RHKEARTH AIS liveApiUrl patch target missing')

# Give the CORS GeoJSON snapshot enough time to return while still bounding hangs.
text = text.replace('AbortSignal.timeout(10000)', 'AbortSignal.timeout(15000)', 1)
TARGET.write_text(text, encoding='utf-8')

checks = [marker, "url.searchParams.set('bbox'", 'area <= 96', 'const half = 4.8;', 'AbortSignal.timeout(15000)']
patched = TARGET.read_text(encoding='utf-8')
for needle in checks:
    if needle not in patched:
        raise SystemExit('AIS area-limit contract missing: ' + needle)

if patched.count('function currentAisViewportBbox()') != 1:
    raise SystemExit('AIS bbox helper must be declared exactly once')

print('RHKEARTH AIS fixed: one bounded Open Waters viewport bbox helper, no duplicate declarations')
