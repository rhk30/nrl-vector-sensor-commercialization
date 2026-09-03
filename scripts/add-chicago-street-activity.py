from pathlib import Path

ROOT = Path.cwd()

module = r'''import * as Cesium from 'cesium';
import { governorRequestRender } from '../renderGovernor.js';

const API_URL = '/experimental/live-data/chicago-street-activity.json';
const ENTITY_PREFIX = 'rhk-chicago-street:';
const CHICAGO_RECT = Cesium.Rectangle.fromDegrees(-88.55, 41.45, -87.45, 42.55);
const MAX_RENDERED = 1400;

let _viewer = null;
let _dataSource = null;
let _moveEndHandler = null;
let _enabled = false;
let _rows = [];
let _visibleCount = 0;
let _lastUpdate = null;
let _lastError = null;

function compact(value, max = 96) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function currentViewRectangle() {
  if (!_viewer) return null;
  try {
    return _viewer.camera.computeViewRectangle(Cesium.Ellipsoid.WGS84) || null;
  } catch {
    return null;
  }
}

function intersectsChicago(rect) {
  if (!rect) return false;
  try {
    return Boolean(Cesium.Rectangle.intersection(rect, CHICAGO_RECT, new Cesium.Rectangle()));
  } catch {
    return false;
  }
}

function pointInRect(lat, lon, rect) {
  if (!rect) return false;
  const latitude = Cesium.Math.toRadians(Number(lat));
  const longitude = Cesium.Math.toRadians(Number(lon));
  return latitude >= rect.south && latitude <= rect.north
    && longitude >= rect.west && longitude <= rect.east;
}

function activityColor(kind) {
  const key = String(kind || '').toLowerCase();
  if (key.includes('closure') || key.includes('block')) return Cesium.Color.fromCssColorString('#c97868');
  if (key.includes('lane') || key.includes('traffic')) return Cesium.Color.fromCssColorString('#d3b36a');
  if (key.includes('sidewalk')) return Cesium.Color.fromCssColorString('#9fb8c5');
  return Cesium.Color.fromCssColorString('#a9b59b');
}

function clearRendered() {
  _dataSource?.entities.removeAll();
  _visibleCount = 0;
  if (_dataSource) _dataSource.show = false;
}

function renderForCurrentView() {
  const rect = currentViewRectangle();
  if (!_enabled || !intersectsChicago(rect)) {
    clearRendered();
    governorRequestRender('rhk-chicago-street-out-of-frame');
    return;
  }

  _dataSource.entities.removeAll();
  const visible = _rows.filter((row) => pointInRect(row.lat, row.lon, rect)).slice(0, MAX_RENDERED);
  for (const row of visible) {
    const lat = Number(row.lat);
    const lon = Number(row.lon);
    const id = String(row.id || `${lat},${lon}`);
    const kind = compact(row.kind || row.type || 'Street activity', 42);
    const street = compact(row.street || row.location || 'Chicago street', 72);
    const description = compact(row.description || '', 120);
    const color = activityColor(kind);
    _dataSource.entities.add({
      id: ENTITY_PREFIX + id,
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 4),
      point: {
        pixelSize: 7,
        color,
        outlineColor: Cesium.Color.fromCssColorString('#121512'),
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: street,
        font: '10px Inter, sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#efefe9'),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0c0b').withAlpha(0.76),
        pixelOffset: new Cesium.Cartesian2(0, -16),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 22000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: {
        rhkLayer: 'traffic', regionalSource: 'chicago-street-activity', kind, street, description,
        start: row.start || null, end: row.end || null,
        applicationNumber: row.applicationNumber || null,
        source: 'City of Chicago CDOT',
      },
    });
  }

  _visibleCount = visible.length;
  _dataSource.show = true;
  governorRequestRender('rhk-chicago-street-render');
}

const addon = {
  id: 'rhk-chicago-street-addon',

  init(viewer) {
    _viewer = viewer;
    _dataSource = new Cesium.CustomDataSource('rhk-chicago-street-activity');
    _dataSource.show = false;
    viewer.dataSources.add(_dataSource);
    _moveEndHandler = () => renderForCurrentView();
    viewer.camera.moveEnd.addEventListener(_moveEndHandler);
  },

  async enable() {
    _enabled = true;
    if (!_lastUpdate) await this.update();
    else renderForCurrentView();
  },

  disable() {
    _enabled = false;
    clearRendered();
  },

  async update() {
    const rect = currentViewRectangle();
    if (!_enabled || !intersectsChicago(rect)) {
      clearRendered();
      return true;
    }
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      _rows = (Array.isArray(payload?.activities) ? payload.activities : []).filter((row) => {
        const lat = Number(row?.lat);
        const lon = Number(row?.lon);
        return Number.isFinite(lat) && Number.isFinite(lon)
          && lat >= 41.60 && lat <= 42.05 && lon >= -87.95 && lon <= -87.50;
      });
      _lastUpdate = Number(payload?.fetchedAt) || Date.now();
      _lastError = null;
      renderForCurrentView();
      return true;
    } catch (error) {
      _lastError = String(error?.message || error);
      console.warn('[RHKEARTH:Traffic:Chicago] update failed:', error);
      clearRendered();
      return false;
    }
  },

  destroy(viewer = _viewer) {
    this.disable();
    if (_moveEndHandler && viewer) viewer.camera.moveEnd.removeEventListener(_moveEndHandler);
    _moveEndHandler = null;
    if (_dataSource && viewer) viewer.dataSources.remove(_dataSource, true);
    _dataSource = null;
    _viewer = null;
    _rows = [];
  },

  getStats() {
    return {
      count: _visibleCount,
      visibleCount: _visibleCount,
      lastUpdate: _lastUpdate,
      error: _lastError,
      status: !_enabled || !intersectsChicago(currentViewRectangle()) ? 'idle' : (_lastError && !_visibleCount ? 'degraded' : 'nominal'),
      source: 'Chicago CDOT current/future street impacts',
    };
  },
};

export default addon;
'''

(ROOT / 'src/data/chicagoStreetActivity.js').write_text(module, encoding='utf-8')

main = ROOT / 'src/main.js'
text = main.read_text(encoding='utf-8')
anchor = "import trafficLayer from './data/traffic.js';\n"
addon_import = "import chicagoStreetActivityAddon from './data/chicagoStreetActivity.js';\n"
if addon_import not in text:
    if anchor not in text:
        raise SystemExit('Chicago street activity import anchor missing')
    text = text.replace(anchor, anchor + addon_import, 1)

# attachRhkRegionalAddon is installed by the Chicago CCTV patch. Keep this
# script independently safe in case patch order changes in a future build.
helper = r'''
function attachRhkRegionalAddon(baseLayer, addon, label) {
  if (!baseLayer || !addon) return;
  baseLayer.__rhkRegionalAddonIds ||= new Set();
  if (baseLayer.__rhkRegionalAddonIds.has(addon.id)) return;
  baseLayer.__rhkRegionalAddonIds.add(addon.id);
  const wrapAsyncTail = (method) => {
    const original = typeof baseLayer[method] === 'function' ? baseLayer[method] : null;
    if (!original) return;
    baseLayer[method] = function (...args) {
      const result = original.apply(this, args);
      const runAddon = () => addon[method]?.(...args);
      if (result && typeof result.then === 'function') {
        return result.then(async (value) => { await runAddon(); return value; });
      }
      Promise.resolve(runAddon()).catch((error) => console.warn(`[RHKEARTH:${label}] ${method} failed`, error));
      return result;
    };
  };
  wrapAsyncTail('init'); wrapAsyncTail('enable'); wrapAsyncTail('update');
  for (const method of ['disable', 'destroy']) {
    const original = typeof baseLayer[method] === 'function' ? baseLayer[method] : null;
    if (!original) continue;
    baseLayer[method] = function (...args) {
      try { addon[method]?.(...args); } catch (error) { console.warn(`[RHKEARTH:${label}] ${method} failed`, error); }
      return original.apply(this, args);
    };
  }
  const originalStats = typeof baseLayer.getStats === 'function' ? baseLayer.getStats.bind(baseLayer) : null;
  if (originalStats) {
    baseLayer.getStats = () => {
      const base = originalStats() || {};
      const regional = addon.getStats?.() || {};
      const baseCount = Number(base.count) || 0;
      const regionalCount = Number(regional.visibleCount ?? regional.count) || 0;
      return { ...base, count: baseCount + regionalCount, regional: { ...(base.regional || {}), [addon.id]: regional } };
    };
  }
}
'''
if 'function attachRhkRegionalAddon(' not in text:
    helper_anchor = "initLogoGaze();\n"
    if helper_anchor not in text:
        raise SystemExit('Regional addon helper anchor missing')
    text = text.replace(helper_anchor, helper + "\n" + helper_anchor, 1)

register_anchor = "    dataManager.register(trafficLayer);\n"
bind = "    attachRhkRegionalAddon(trafficLayer, chicagoStreetActivityAddon, 'Traffic:Chicago');\n"
if bind not in text:
    if register_anchor not in text:
        raise SystemExit('Chicago traffic registration anchor missing')
    text = text.replace(register_anchor, bind + register_anchor, 1)

# Defensive cleanup for earlier city-specific layer versions.
text = text.replace("import chicagoStreetActivityLayer from './data/chicagoStreetActivity.js';\n", addon_import)
text = text.replace("    dataManager.register(chicagoStreetActivityLayer);\n", '')
main.write_text(text, encoding='utf-8')

state = ROOT / 'src/data/layerState.js'
state_text = state.read_text(encoding='utf-8')
state_text = state_text.replace("  Object.freeze({ id: 'chicago-street-activity', token: 'y', disposition: 'enabled-only' }),\n", '')
state.write_text(state_text, encoding='utf-8')

print('RHKEARTH Chicago street activity folded into existing Traffic layer with viewport gating')
