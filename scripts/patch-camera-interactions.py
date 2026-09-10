from pathlib import Path
import re

ROOT = Path.cwd()


# -----------------------------------------------------------------------------
# Base CCTV presentation: calm the camera layer regardless of whether the
# tactical-palette patch has already changed the upstream colors. Match visual
# constants by semantic name instead of by their previous literal hex values.
# -----------------------------------------------------------------------------
cctv = ROOT / 'src/data/cctv.js'
cctv_text = cctv.read_text(encoding='utf-8')


def replace_color_constant(text, name, css, alpha):
    pattern = rf"const {re.escape(name)} = Cesium\.Color\.fromCssColorString\('[^']+'\)\.withAlpha\([^)]+\);"
    replacement = f"const {name} = Cesium.Color.fromCssColorString('{css}').withAlpha({alpha});"
    updated, count = re.subn(pattern, replacement, text, count=1)
    if count != 1:
        raise SystemExit(f'RHKEARTH CCTV color constant missing: {name}')
    return updated


for name, css, alpha in [
    ('IDLE_CAMERA_COLOR', '#c3c8c2', '0.68'),
    ('ACTIVE_CAMERA_COLOR', '#eee9dc', '0.90'),
    ('IDLE_COVERAGE_COLOR', '#aeb8b0', '0.10'),
    ('IDLE_COVERAGE_CENTER_MUTED', '#aeb8b0', '0.08'),
    ('IDLE_COVERAGE_EDGE_MUTED', '#aeb8b0', '0.07'),
    ('ACTIVE_COVERAGE_EDGE', '#d8ddd7', '0.28'),
    ('ACTIVE_COVERAGE_CENTER', '#eee9dc', '0.42'),
    ('ACTIVE_COVERAGE_EDGE_DEPTHFAIL', '#d8ddd7', '0.10'),
    ('ACTIVE_COVERAGE_CENTER_DEPTHFAIL', '#eee9dc', '0.14'),
    ('PLANE_OUTLINE_COLOR', '#c3c8c2', '0.34'),
]:
    cctv_text = replace_color_constant(cctv_text, name, css, alpha)

for old, new, label in [
    ("        width: 24,\n        height: 24,", "        width: 18,\n        height: 18,", 'billboard size'),
    ("      record.billboard.scale = isActive ? 1.25 : 1.0;", "      record.billboard.scale = isActive ? 1.12 : 0.92;", 'active scale'),
]:
    if old not in cctv_text:
        raise SystemExit(f'RHKEARTH CCTV calm-visual patch target missing: {label}')
    cctv_text = cctv_text.replace(old, new, 1)
cctv.write_text(cctv_text, encoding='utf-8')


# -----------------------------------------------------------------------------
# Chicago live-camera add-on: same semantics, less glare. This layer is already
# viewport-scoped to Chicagoland, so keep its current depth policy but reduce
# dot/outline/label intensity substantially.
# -----------------------------------------------------------------------------
chicago = ROOT / 'src/data/chicagoLiveCameras.js'
chicago_text = chicago.read_text(encoding='utf-8')
chicago_old = """      point: {
        pixelSize: 9,
        color: Cesium.Color.fromCssColorString('#9fc5ad'),
        outlineColor: Cesium.Color.fromCssColorString('#111511'),
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: String(row.name || 'LIVE CCTV'),
        font: '10px Inter, sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#efefe9'),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0c0b').withAlpha(0.80),
        pixelOffset: new Cesium.Cartesian2(0, -18),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 60000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },"""
chicago_new = """      point: {
        pixelSize: 5.5,
        color: Cesium.Color.fromCssColorString('#c3c8c2').withAlpha(0.66),
        outlineColor: Cesium.Color.fromCssColorString('#101210').withAlpha(0.76),
        outlineWidth: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: String(row.name || 'LIVE CCTV'),
        font: '9px Inter, sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#e5e7e1').withAlpha(0.80),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0c0b').withAlpha(0.68),
        pixelOffset: new Cesium.Cartesian2(0, -14),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },"""
if chicago_old not in chicago_text:
    raise SystemExit('RHKEARTH Chicago camera presentation patch target missing')
chicago.write_text(chicago_text.replace(chicago_old, chicago_new, 1), encoding='utf-8')


# -----------------------------------------------------------------------------
# Worldwide camera add-on: fix the actual far-side bleed-through. The generated
# layer deliberately puts points above the depth test, but unlike the base CCTV
# layer it did not have the base layer's ellipsoidal horizon-culling pass.
# Add the same mathematical horizon test so Asia cannot draw through the Earth
# while viewing North America, including in the Google-3D regime where the
# Cesium globe itself is intentionally hidden.
# -----------------------------------------------------------------------------
world = ROOT / 'src/data/worldwideCameras.js'
world_text = world.read_text(encoding='utf-8')

imports_old = """import * as Cesium from 'cesium';
import { governorRequestRender } from '../renderGovernor.js';"""
imports_new = """import * as Cesium from 'cesium';
import { governorRequestRender } from '../renderGovernor.js';
import { horizonOccluder } from './iconOrientation.js';"""
if imports_old not in world_text:
    raise SystemExit('RHKEARTH worldwide CCTV import patch target missing')
world_text = world_text.replace(imports_old, imports_new, 1)

rect_old = """function pointInRect(lat, lon, rect) {
  if (!rect) return true;
  const y = Cesium.Math.toRadians(Number(lat));
  const x = Cesium.Math.toRadians(Number(lon));
  if (!(y >= rect.south && y <= rect.north)) return false;
  if (rect.west <= rect.east) return x >= rect.west && x <= rect.east;
  return x >= rect.west || x <= rect.east;
}
"""
rect_new = rect_old + """
function cameraPosition(row) {
  return Cesium.Cartesian3.fromDegrees(Number(row.lon), Number(row.lat), 12);
}
"""
if rect_old not in world_text:
    raise SystemExit('RHKEARTH worldwide CCTV position-helper target missing')
world_text = world_text.replace(rect_old, rect_new, 1)

render_anchor = """function renderCatalogPoints() {
"""
horizon_block = """function refreshHorizonCulling() {
  if (!_enabled || !_viewer || !_points || _viewer.isDestroyed?.()) return;
  const occluder = horizonOccluder(_viewer.camera);
  for (let i = 0; i < _points.length; i += 1) {
    const point = _points.get(i);
    if (!point) continue;
    const visible = occluder.isPointVisible(point.position);
    if (point.show !== visible) point.show = visible;
  }
  governorRequestRender('rhk-world-cctv-horizon');
}

"""
if render_anchor not in world_text:
    raise SystemExit('RHKEARTH worldwide CCTV horizon insertion target missing')
world_text = world_text.replace(render_anchor, horizon_block + render_anchor, 1)

points_old = """    const hasVideo = !!availableVideoUrl(row);
    _points.add({
      id: PICK_PREFIX + id,
      position: Cesium.Cartesian3.fromDegrees(Number(row.lon), Number(row.lat), 12),
      pixelSize: hasVideo ? 7 : 5.5,
      color: Cesium.Color.fromCssColorString(hasVideo ? '#B8D9C4' : '#93BDA3'),
      outlineColor: Cesium.Color.fromCssColorString('#0b0e0c'),
      outlineWidth: 1.25,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });"""
points_new = """    const hasVideo = !!availableVideoUrl(row);
    _points.add({
      id: PICK_PREFIX + id,
      position: cameraPosition(row),
      pixelSize: hasVideo ? 4.8 : 4.2,
      color: Cesium.Color.fromCssColorString('#c7cbc5').withAlpha(hasVideo ? 0.72 : 0.58),
      outlineColor: Cesium.Color.fromCssColorString('#101210').withAlpha(0.74),
      outlineWidth: 0.8,
      scaleByDistance: new Cesium.NearFarScalar(250, 1.0, 18000000, 0.60),
      translucencyByDistance: new Cesium.NearFarScalar(1000, 0.94, 18000000, 0.30),
      // Keep markers from being swallowed by coarse Google-3D tiles; explicit
      // ellipsoidal horizon culling below is what prevents far-side bleed.
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });"""
if points_old not in world_text:
    raise SystemExit('RHKEARTH worldwide CCTV marker-style patch target missing')
world_text = world_text.replace(points_old, points_new, 1)

show_old = """  _points.show = true;
  renderLabelsForCurrentView();"""
show_new = """  _points.show = true;
  refreshHorizonCulling();
  renderLabelsForCurrentView();"""
if show_old not in world_text:
    raise SystemExit('RHKEARTH worldwide CCTV initial-cull target missing')
world_text = world_text.replace(show_old, show_new, 1)

visible_old = """  const rect = currentViewRectangle();
  const height = Number(_viewer.camera.positionCartographic?.height) || 1e9;
  const visible = _rows.filter((row) => pointInRect(row.lat, row.lon, rect));"""
visible_new = """  const rect = currentViewRectangle();
  const height = Number(_viewer.camera.positionCartographic?.height) || 1e9;
  const occluder = horizonOccluder(_viewer.camera);
  const visible = _rows.filter((row) => (
    pointInRect(row.lat, row.lon, rect) && occluder.isPointVisible(cameraPosition(row))
  ));"""
if visible_old not in world_text:
    raise SystemExit('RHKEARTH worldwide CCTV label-visibility target missing')
world_text = world_text.replace(visible_old, visible_new, 1)

labels_old = """      position: Cesium.Cartesian3.fromDegrees(Number(row.lon), Number(row.lat), 12),
      text: String(row.name || 'CAMERA'),
      font: '10px Inter, sans-serif',
      fillColor: Cesium.Color.fromCssColorString('#efefe9'),
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('#0a0c0b').withAlpha(0.80),
      pixelOffset: new Cesium.Cartesian2(0, -15),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,"""
labels_new = """      position: cameraPosition(row),
      text: String(row.name || 'CAMERA'),
      font: '9px Inter, sans-serif',
      fillColor: Cesium.Color.fromCssColorString('#e5e7e1').withAlpha(0.78),
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('#0a0c0b').withAlpha(0.66),
      pixelOffset: new Cesium.Cartesian2(0, -13),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,"""
if labels_old not in world_text:
    raise SystemExit('RHKEARTH worldwide CCTV label-style target missing')
world_text = world_text.replace(labels_old, labels_new, 1)

move_old = """    _moveEndHandler = () => renderLabelsForCurrentView();
    viewer.camera.moveEnd.addEventListener(_moveEndHandler);"""
move_new = """    _moveEndHandler = () => {
      refreshHorizonCulling();
      renderLabelsForCurrentView();
    };
    viewer.camera.moveEnd.addEventListener(_moveEndHandler);"""
if move_old not in world_text:
    raise SystemExit('RHKEARTH worldwide CCTV move-end culling target missing')
world_text = world_text.replace(move_old, move_new, 1)
world.write_text(world_text, encoding='utf-8')


# -----------------------------------------------------------------------------
# Precision-trackpad navigation. Cesium's stock wheel mapping is mouse-centric:
# precision two-finger wheel deltas tend to become zoom rather than map pan.
# Intercept only trackpad-like pixel deltas over the globe. Two-finger scroll
# pans, ctrl+wheel pinch zooms, click-drag remains Cesium-native, and coarse
# mouse-wheel ticks continue through to Cesium unchanged.
# -----------------------------------------------------------------------------
main = ROOT / 'src/main.js'
main_text = main.read_text(encoding='utf-8')
trackpad_marker = 'RHKEARTH precision trackpad navigation'
if trackpad_marker not in main_text:
    anchor = """    // Register per-layer data attribution into the \"Data attribution\" popover.
"""
    if anchor not in main_text:
        raise SystemExit('RHKEARTH trackpad insertion anchor missing')
    trackpad = r'''    // RHKEARTH precision trackpad navigation — two-finger scroll pans the
    // globe, pinch zooms, and normal click-drag / coarse mouse-wheel behavior
    // remains Cesium-native. This also explicitly keeps every native camera
    // controller lane enabled after upstream/custom UI initialization.
    (() => {
      const canvas = viewer.scene.canvas;
      const controller = viewer.scene.screenSpaceCameraController;
      if (!canvas || !controller) return;

      controller.enableInputs = true;
      controller.enableRotate = true;
      controller.enableTranslate = true;
      controller.enableZoom = true;
      controller.enableTilt = true;
      controller.enableLook = true;
      canvas.style.touchAction = 'none';

      let lastWheelAt = 0;
      const isPrecisionWheel = (event) => {
        if (event.ctrlKey) return true; // browser trackpad pinch gesture
        if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) return false;
        const ax = Math.abs(event.deltaX);
        const ay = Math.abs(event.deltaY);
        const fractional = Math.abs(event.deltaX - Math.round(event.deltaX)) > 0.001
          || Math.abs(event.deltaY - Math.round(event.deltaY)) > 0.001;
        const now = performance.now();
        const rapid = lastWheelAt > 0 && now - lastWheelAt < 75;
        lastWheelAt = now;
        // Precision touchpads emit small/fractional pixel deltas in rapid
        // succession; coarse wheel mice generally emit a large integer Y tick.
        return ax > 0 || fractional || ay < 24 || (rapid && ay < 80);
      };

      const panByPixels = (dx, dy) => {
        if (!dx && !dy) return;
        const rect = canvas.getBoundingClientRect();
        const camera = viewer.camera;
        const ellipsoid = Cesium.Ellipsoid.WGS84;
        const center = new Cesium.Cartesian2(rect.width * 0.5, rect.height * 0.5);
        const shifted = new Cesium.Cartesian2(center.x + dx, center.y + dy);
        const start = camera.pickEllipsoid(center, ellipsoid);
        const end = camera.pickEllipsoid(shifted, ellipsoid);

        if (start && end) {
          const worldDelta = Cesium.Cartesian3.subtract(start, end, new Cesium.Cartesian3());
          Cesium.Cartesian3.add(camera.position, worldDelta, camera.position);
        } else {
          // Near-horizon / street-level fallback where one sample misses the
          // ellipsoid. Keep motion screen-relative and altitude-scaled.
          const height = Math.max(1, Number(camera.positionCartographic?.height) || 1000);
          const metresPerPixel = Math.max(0.20, Math.min(50000, height * 0.0012));
          if (dx) camera.moveRight(dx * metresPerPixel);
          if (dy) camera.moveUp(-dy * metresPerPixel);
        }
        governorRequestRender('rhk-trackpad-pan');
      };

      const zoomByPinch = (deltaY) => {
        const camera = viewer.camera;
        const height = Math.max(1, Number(camera.positionCartographic?.height) || 1000);
        const fraction = Math.min(0.22, Math.max(0.004, Math.abs(deltaY) * 0.010));
        const distance = Math.max(0.5, height * fraction);
        if (deltaY < 0) camera.moveForward(distance);
        else if (deltaY > 0) camera.moveBackward(distance);
        governorRequestRender('rhk-trackpad-pinch');
      };

      canvas.addEventListener('wheel', (event) => {
        if (viewer.trackedEntity || document.body.classList.contains('cockpit-mode')) return;
        if (!isPrecisionWheel(event)) return; // preserve ordinary mouse-wheel zoom

        // Capture before Cesium's target wheel handler so trackpad scroll does
        // not simultaneously pan and zoom. Prevent browser page pinch-zoom too.
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.ctrlKey) zoomByPinch(event.deltaY);
        else panByPixels(event.deltaX, event.deltaY);
      }, { capture: true, passive: false });
    })();

'''
    main_text = main_text.replace(anchor, trackpad + anchor, 1)
main.write_text(main_text, encoding='utf-8')

print('RHKEARTH camera visibility, calmer CCTV presentation, and precision-trackpad navigation patched')
