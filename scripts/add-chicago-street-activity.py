from pathlib import Path

ROOT = Path.cwd()

module = r'''import * as Cesium from 'cesium';
import { governorRequestRender } from '../renderGovernor.js';

const API_URL = '/experimental/live-data/chicago-street-activity.json';
const ENTITY_PREFIX = 'rhk-chicago-street:';

function compact(value, max = 96) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function activityColor(kind) {
  const key = String(kind || '').toLowerCase();
  if (key.includes('closure') || key.includes('block')) return Cesium.Color.fromCssColorString('#e0dfd1');
  if (key.includes('lane') || key.includes('traffic')) return Cesium.Color.fromCssColorString('#c4c8b3');
  return Cesium.Color.fromCssColorString('#aeb49f');
}

const layer = {
  id: 'chicago-street-activity',
  name: 'Chicago Street Activity',
  icon: '◆',
  source: 'City of Chicago CDOT · current/future',
  updateInterval: 300000,

  _dataSource: null,
  _count: 0,
  _lastUpdate: null,
  _lastError: null,
  _enabled: false,

  init(viewer) {
    this._dataSource = new Cesium.CustomDataSource('rhk-chicago-street-activity');
    this._dataSource.show = false;
    viewer.dataSources.add(this._dataSource);
  },

  async enable(viewer) {
    this._enabled = true;
    if (this._dataSource) this._dataSource.show = true;
    if (!this._lastUpdate) await this.update(viewer);
    governorRequestRender('chicago-street-activity-enable');
  },

  disable() {
    this._enabled = false;
    if (this._dataSource) this._dataSource.show = false;
  },

  async update() {
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const rows = Array.isArray(payload?.activities) ? payload.activities : [];

      this._dataSource?.entities.removeAll();
      let count = 0;
      for (const row of rows) {
        const lat = Number(row?.lat);
        const lon = Number(row?.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        if (lat < 41.60 || lat > 42.05 || lon < -87.95 || lon > -87.50) continue;

        const id = String(row.id || count);
        const kind = compact(row.kind || row.type || 'Street activity', 42);
        const street = compact(row.street || row.location || 'Chicago street', 72);
        const description = compact(row.description || '', 120);
        const color = activityColor(kind);

        this._dataSource?.entities.add({
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
            fillColor: Cesium.Color.fromCssColorString('#e5e7d9'),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('#0a0c0b').withAlpha(0.74),
            pixelOffset: new Cesium.Cartesian2(0, -16),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 22000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: {
            rhkLayer: 'chicago-street-activity',
            kind,
            street,
            description,
            start: row.start || null,
            end: row.end || null,
            applicationNumber: row.applicationNumber || null,
            source: 'City of Chicago CDOT',
          },
        });
        count += 1;
      }

      this._count = count;
      this._lastUpdate = Number(payload?.fetchedAt) || Date.now();
      this._lastError = null;
      governorRequestRender('chicago-street-activity-update');
      return true;
    } catch (error) {
      this._lastError = String(error?.message || error);
      console.warn('[RHKEARTH:ChicagoStreetActivity] update failed:', error);
      return false;
    }
  },

  destroy(viewer) {
    this.disable();
    if (this._dataSource) viewer.dataSources.remove(this._dataSource, true);
    this._dataSource = null;
    this._count = 0;
  },

  getStats() {
    return {
      count: this._count,
      lastUpdate: this._lastUpdate,
      error: this._lastError,
      status: this._lastError && !this._count ? 'unavailable' : 'nominal',
      source: 'City of Chicago CDOT current/future street impacts',
    };
  },
};

export default layer;
'''

(ROOT / 'src/data/chicagoStreetActivity.js').write_text(module, encoding='utf-8')

main = ROOT / 'src/main.js'
text = main.read_text(encoding='utf-8')
anchor = "import trafficLayer from './data/traffic.js';\n"
if "./data/chicagoStreetActivity.js" not in text:
    if anchor not in text:
        raise SystemExit('Chicago street activity import anchor missing')
    text = text.replace(anchor, anchor + "import chicagoStreetActivityLayer from './data/chicagoStreetActivity.js';\n", 1)

register_anchor = "    dataManager.register(trafficLayer);\n"
if "dataManager.register(chicagoStreetActivityLayer);" not in text:
    if register_anchor not in text:
        raise SystemExit('Chicago street activity registration anchor missing')
    text = text.replace(register_anchor, register_anchor + "    dataManager.register(chicagoStreetActivityLayer);\n", 1)
main.write_text(text, encoding='utf-8')

state = ROOT / 'src/data/layerState.js'
text = state.read_text(encoding='utf-8')
registry_anchor = "  Object.freeze({ id: 'cctv', token: 'c', disposition: 'enabled+options', optionOwner: 'cctv' }),\n"
entry = "  Object.freeze({ id: 'chicago-street-activity', token: 'y', disposition: 'enabled-only' }),\n"
if "id: 'chicago-street-activity'" not in text:
    if registry_anchor not in text:
        raise SystemExit('Chicago street activity layer-state anchor missing')
    text = text.replace(registry_anchor, registry_anchor + entry, 1)
state.write_text(text, encoding='utf-8')

print('RHKEARTH native Chicago street-activity layer added')
