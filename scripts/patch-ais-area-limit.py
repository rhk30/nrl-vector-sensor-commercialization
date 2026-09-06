from pathlib import Path
import re

ROOT = Path.cwd()
TARGET = ROOT / 'src/data/aisLiveVessels.js'
text = TARGET.read_text(encoding='utf-8')

marker = 'RHKEARTH_AIS_ANON_AREA_LIMIT_V2'
if marker not in text:
    pattern = re.compile(r"function currentAisViewportBbox\(\) \{.*?\n\}\n\nfunction liveApiUrl\(\)", re.S)
    replacement = r'''// RHKEARTH_AIS_ANON_AREA_LIMIT_V2
// Open Waters anonymous subscriptions/queries are limited to 100 square
// degrees. Never send an oversized viewport box: use the exact visible
// rectangle only when it is within budget, otherwise sample a compact box
// around the camera target. This keeps the layer worldwide as the operator
// moves while preventing provider-side HTTP 400 failures.
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

  // 9.6° × 9.6° = 92.16 square degrees, leaving margin below the
  // anonymous 100-square-degree provider ceiling.
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
    text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit('RHKEARTH AIS area-limit patch target missing')

# Increase timeout slightly for live GeoJSON while still bounding hangs.
text = text.replace('AbortSignal.timeout(10000)', 'AbortSignal.timeout(15000)', 1)

TARGET.write_text(text, encoding='utf-8')

checks = [marker, 'area <= 96', 'const half = 4.8;', 'AbortSignal.timeout(15000)']
for needle in checks:
    if needle not in TARGET.read_text(encoding='utf-8'):
        raise SystemExit('AIS area-limit contract missing: ' + needle)

print('RHKEARTH AIS anonymous-area limit enforced; oversized viewport HTTP 400 prevented')
