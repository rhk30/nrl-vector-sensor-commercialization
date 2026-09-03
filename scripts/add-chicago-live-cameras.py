from pathlib import Path

ROOT = Path.cwd()

module = r'''import * as Cesium from 'cesium';
import { governorRequestRender } from '../renderGovernor.js';

const API_URL = '/experimental/live-data/chicago-live-cameras.json';
const ENTITY_PREFIX = 'rhk-chicago-livecam:';

function makePanel() {
  let panel = document.getElementById('rhk-live-camera-panel');
  if (panel) return panel;

  panel = document.createElement('section');
  panel.id = 'rhk-live-camera-panel';
  panel.setAttribute('aria-label', 'RHKEARTH live camera');
  Object.assign(panel.style, {
    position: 'fixed',
    right: '22px',
    bottom: '24px',
    width: 'min(520px, calc(100vw - 44px))',
    background: 'rgba(10,12,11,.96)',
    border: '1px solid rgba(220,222,205,.28)',
    boxShadow: '0 18px 55px rgba(0,0,0,.46)',
    zIndex: '1200',
    display: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
  });

  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:11px 12px;border-bottom:1px solid rgba(220,222,205,.16);">
      <div style="min-width:0;flex:1;">
        <div id="rhk-live-camera-title" style="font-size:12px;letter-spacing:.10em;text-transform:uppercase;color:#e7e8dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">LIVE CCTV</div>
        <div id="rhk-live-camera-meta" style="margin-top:3px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9ca18d;">CHICAGO</div>
      </div>
      <button id="rhk-live-camera-close" type="button" aria-label="Close live camera" style="border:0;background:transparent;color:#d8dacc;font-size:21px;line-height:1;cursor:pointer;padding:2px 4px;">×</button>
    </div>
    <div style="position:relative;width:100%;aspect-ratio:16/9;background:#050606;">
      <iframe id="rhk-live-camera-frame" title="Chicago live camera" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="no-referrer-when-downgrade" style="position:absolute;inset:0;width:100%;height:100%;border:0;background:#050606;"></iframe>
    </div>
    <div style="display:flex;justify-content:space-between;gap:12px;padding:8px 11px;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#777d6d;">
      <span>PUBLIC LIVE SOURCE</span><span>RHKEARTH // CHICAGO</span>
    </div>`;

  panel.querySelector('#rhk-live-camera-close')?.addEventListener('click', () => {
    const frame = panel.querySelector('#rhk-live-camera-frame');
    if (frame) frame.src = 'about:blank';
    panel.style.display = 'none';
  });
  document.body.appendChild(panel);
  return panel;
}

function openFeed(source) {
  if (!source?.embedUrl) return;
  const panel = makePanel();
  const title = panel.querySelector('#rhk-live-camera-title');
  const meta = panel.querySelector('#rhk-live-camera-meta');
  const frame = panel.querySelector('#rhk-live-camera-frame');
  if (title) title.textContent = source.name || 'LIVE CCTV';
  if (meta) meta.textContent = `${String(source.category || 'camera').toUpperCase()} · ${String(source.feedType || 'LIVE').toUpperCase()} · CHICAGO`;
  if (frame) frame.src = source.embedUrl;
  panel.style.display = 'block';
}

const layer = {
  id: 'chicago-live-cameras',
  name: 'Chicago Live CCTV',
  icon: '◉',
  source: 'Public continuous live feeds',
  updateInterval: 300000,

  _dataSource: null,
  _handler: null,
  _sources: new Map(),
  _count: 0,
  _lastUpdate: null,
  _lastError: null,
  _enabled: false,

  init(viewer) {
    this._dataSource = new Cesium.CustomDataSource('rhk-chicago-live-cameras');
    this._dataSource.show = false;
    viewer.dataSources.add(this._dataSource);

    this._handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    this._handler.setInputAction((movement) => {
      if (!this._enabled) return;
      const picked = viewer.scene.pick(movement.position);
      const id = String(picked?.id?.id || picked?.id || '');
      if (!id.startsWith(ENTITY_PREFIX)) return;
      const source = this._sources.get(id.slice(ENTITY_PREFIX.length));
      if (!source) return;
      openFeed(source);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  },

  async enable(viewer) {
    this._enabled = true;
    if (this._dataSource) this._dataSource.show = true;
    if (!this._lastUpdate) await this.update(viewer);
    governorRequestRender('chicago-live-cameras-enable');
  },

  disable() {
    this._enabled = false;
    if (this._dataSource) this._dataSource.show = false;
    const panel = document.getElementById('rhk-live-camera-panel');
    const frame = document.getElementById('rhk-live-camera-frame');
    if (frame) frame.src = 'about:blank';
    if (panel) panel.style.display = 'none';
  },

  async update() {
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const rows = Array.isArray(payload?.sources) ? payload.sources : [];
      const liveRows = rows.filter((row) => {
        const type = String(row?.feedType || '').toLowerCase();
        return ['hls', 'm3u8', 'iframe', 'mjpeg', 'mp4', 'webm'].includes(type)
          && Number.isFinite(Number(row?.lat))
          && Number.isFinite(Number(row?.lon))
          && /^https:\/\//i.test(String(row?.embedUrl || ''));
      });

      this._sources.clear();
      this._dataSource?.entities.removeAll();
      for (const row of liveRows) {
        const key = String(row.id || `${row.lat},${row.lon}`);
        this._sources.set(key, row);
        this._dataSource?.entities.add({
          id: ENTITY_PREFIX + key,
          position: Cesium.Cartesian3.fromDegrees(Number(row.lon), Number(row.lat), 8),
          point: {
            pixelSize: 9,
            color: Cesium.Color.fromCssColorString('#d9dcc9'),
            outlineColor: Cesium.Color.fromCssColorString('#111511'),
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: String(row.name || 'LIVE CCTV'),
            font: '10px Inter, sans-serif',
            fillColor: Cesium.Color.fromCssColorString('#e7e8dc'),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('#0a0c0b').withAlpha(0.78),
            pixelOffset: new Cesium.Cartesian2(0, -18),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 60000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: {
            rhkLayer: 'chicago-live-cameras',
            name: row.name || 'Live CCTV',
            category: row.category || 'camera',
            feedType: row.feedType || 'live',
            provider: row.provider || 'public source',
          },
        });
      }

      this._count = liveRows.length;
      this._lastUpdate = Date.now();
      this._lastError = null;
      governorRequestRender('chicago-live-cameras-update');
      return true;
    } catch (error) {
      this._lastError = String(error?.message || error);
      console.warn('[RHKEARTH:ChicagoLiveCCTV] update failed:', error);
      return false;
    }
  },

  destroy(viewer) {
    this.disable();
    this._handler?.destroy();
    this._handler = null;
    if (this._dataSource) viewer.dataSources.remove(this._dataSource, true);
    this._dataSource = null;
    this._sources.clear();
    document.getElementById('rhk-live-camera-panel')?.remove();
  },

  getStats() {
    return {
      count: this._count,
      lastUpdate: this._lastUpdate,
      error: this._lastError,
      status: this._lastError && !this._count ? 'unavailable' : 'nominal',
      source: 'OpenCCTV public continuous live feeds',
    };
  },
};

export default layer;
'''

module_path = ROOT / 'src/data/chicagoLiveCameras.js'
module_path.write_text(module, encoding='utf-8')

main = ROOT / 'src/main.js'
text = main.read_text(encoding='utf-8')
import_anchor = "import cctvLayer from './data/cctv.js';\n"
if "./data/chicagoLiveCameras.js" not in text:
    if import_anchor not in text:
        raise SystemExit('Chicago live camera import anchor missing')
    text = text.replace(import_anchor, import_anchor + "import chicagoLiveCamerasLayer from './data/chicagoLiveCameras.js';\n", 1)

register_anchor = "    dataManager.register(cctvLayer);\n"
if "dataManager.register(chicagoLiveCamerasLayer);" not in text:
    if register_anchor not in text:
        raise SystemExit('Chicago live camera registration anchor missing')
    text = text.replace(register_anchor, register_anchor + "    dataManager.register(chicagoLiveCamerasLayer);\n", 1)
main.write_text(text, encoding='utf-8')

state = ROOT / 'src/data/layerState.js'
text = state.read_text(encoding='utf-8')
registry_anchor = "  Object.freeze({ id: 'cctv', token: 'c', disposition: 'enabled+options', optionOwner: 'cctv' }),\n"
entry = "  Object.freeze({ id: 'chicago-live-cameras', token: 'v', disposition: 'enabled-only' }),\n"
if "id: 'chicago-live-cameras'" not in text:
    if registry_anchor not in text:
        raise SystemExit('Chicago live camera layer-state anchor missing')
    text = text.replace(registry_anchor, registry_anchor + entry, 1)
state.write_text(text, encoding='utf-8')

print('RHKEARTH native Chicago continuous-live CCTV layer added')
