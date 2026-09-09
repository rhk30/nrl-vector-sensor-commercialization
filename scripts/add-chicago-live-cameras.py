from pathlib import Path

ROOT = Path.cwd()

module = r'''import * as Cesium from 'cesium';
import { governorRequestRender } from '../renderGovernor.js';

const API_URL = '/experimental/live-data/chicago-live-cameras.json';
const ENTITY_PREFIX = 'rhk-chicago-livecam:';
const CHICAGO_RECT = Cesium.Rectangle.fromDegrees(-88.55, 41.45, -87.45, 42.55);

let _viewer = null;
let _dataSource = null;
let _handler = null;
let _moveEndHandler = null;
let _enabled = false;
let _rows = [];
let _sources = new Map();
let _visibleCount = 0;
let _lastUpdate = null;
let _lastError = null;
let _activeSource = null;

function isMobileUi() {
  return document.body.classList.contains('rhk-mobile-ui') || matchMedia('(max-width: 760px) and (pointer: coarse)').matches;
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

function panelButton(label, id) {
  return `<button id="${id}" type="button" style="height:30px;padding:0 10px;border:1px solid rgba(169,181,155,.20);border-radius:4px;background:rgba(255,255,255,.025);color:#cfd3c7;font:600 9px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;">${label}</button>`;
}

function makePanel() {
  let panel = document.getElementById('rhk-live-camera-panel');
  if (panel) return panel;
  panel = document.createElement('section');
  panel.id = 'rhk-live-camera-panel';
  panel.setAttribute('aria-label', 'RHKEARTH public camera viewer');
  Object.assign(panel.style, {
    position: 'fixed', right: isMobileUi() ? '10px' : '22px', bottom: isMobileUi() ? '44px' : '24px',
    width: isMobileUi() ? 'calc(100vw - 20px)' : 'min(540px, calc(100vw - 44px))',
    maxHeight: isMobileUi() ? 'min(64vh, 520px)' : 'min(74vh, 620px)',
    background: 'rgba(8,10,9,.97)', border: '1px solid rgba(169,181,155,.28)',
    borderRadius: '7px', overflow: 'hidden',
    boxShadow: '0 18px 55px rgba(0,0,0,.46)', zIndex: '1200', display: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
  });
  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:11px 12px;border-bottom:1px solid rgba(169,181,155,.16);">
      <div style="min-width:0;flex:1;">
        <div style="display:flex;align-items:center;gap:7px;min-width:0;">
          <span style="width:6px;height:6px;border-radius:50%;background:#A7D7B6;box-shadow:0 0 8px rgba(167,215,182,.35);flex:0 0 auto;"></span>
          <div id="rhk-live-camera-title" style="font-size:12px;letter-spacing:.10em;text-transform:uppercase;color:#efefe9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">PUBLIC CAMERA</div>
        </div>
        <div id="rhk-live-camera-meta" style="margin-top:4px;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#9fc5ad;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">CHICAGO · PUBLIC SOURCE</div>
      </div>
      <button id="rhk-live-camera-close" type="button" aria-label="Close camera" style="border:0;background:transparent;color:#d8dacc;font-size:21px;line-height:1;cursor:pointer;padding:2px 4px;">×</button>
    </div>
    <div id="rhk-live-camera-media" style="position:relative;width:100%;aspect-ratio:16/9;background:#050606;display:grid;place-items:center;overflow:hidden;">
      <iframe id="rhk-live-camera-frame" title="Chicago public camera" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="no-referrer-when-downgrade" style="position:absolute;inset:0;width:100%;height:100%;border:0;background:#050606;"></iframe>
    </div>
    <div style="display:flex;gap:6px;padding:8px 10px 0;flex-wrap:wrap;">
      ${panelButton('Refresh', 'rhk-live-camera-refresh')}
    </div>
    <div style="display:flex;justify-content:space-between;gap:12px;padding:8px 11px;font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:#777d6d;">
      <span id="rhk-live-camera-semantics">CONTINUOUS / ROLLING LIVE FEED</span><span id="rhk-live-camera-provider">RHKEARTH // CCTV</span>
    </div>`;
  panel.querySelector('#rhk-live-camera-close')?.addEventListener('click', closePanel);
  panel.querySelector('#rhk-live-camera-refresh')?.addEventListener('click', () => {
    if (_activeSource) openFeed(_activeSource, true);
  });
  document.body.appendChild(panel);
  return panel;
}

function closePanel() {
  const frame = document.getElementById('rhk-live-camera-frame');
  const panel = document.getElementById('rhk-live-camera-panel');
  if (frame) frame.src = 'about:blank';
  if (panel) panel.style.display = 'none';
  _activeSource = null;
}

function openFeed(source, force = false) {
  if (!source?.embedUrl || !_enabled) return;
  _activeSource = source;
  const panel = makePanel();
  const title = panel.querySelector('#rhk-live-camera-title');
  const meta = panel.querySelector('#rhk-live-camera-meta');
  const provider = panel.querySelector('#rhk-live-camera-provider');
  const semantics = panel.querySelector('#rhk-live-camera-semantics');
  const frame = panel.querySelector('#rhk-live-camera-frame');
  if (title) title.textContent = source.name || 'PUBLIC CAMERA';
  if (meta) meta.textContent = ['CHICAGO', source.category].filter(Boolean).join(' · ').toUpperCase();
  if (provider) provider.textContent = String(source.provider || 'PUBLIC SOURCE').toUpperCase();
  if (semantics) semantics.textContent = 'CONTINUOUS / ROLLING LIVE FEED';
  if (frame) {
    const url = String(source.embedUrl);
    const separator = url.includes('?') ? '&' : '?';
    frame.src = force ? `${url}${separator}rhk=${Date.now()}` : url;
  }
  panel.style.display = 'block';
}

function clearRendered() {
  _dataSource?.entities.removeAll();
  _sources.clear();
  _visibleCount = 0;
  if (_dataSource) _dataSource.show = false;
  closePanel();
}

function renderForCurrentView() {
  const rect = currentViewRectangle();
  if (!_enabled || !intersectsChicago(rect)) {
    clearRendered();
    governorRequestRender('rhk-chicago-cctv-out-of-frame');
    return;
  }

  _dataSource.entities.removeAll();
  _sources.clear();
  let count = 0;
  for (const row of _rows) {
    if (!pointInRect(row.lat, row.lon, rect)) continue;
    const key = String(row.id || `${row.lat},${row.lon}`);
    _sources.set(key, row);
    _dataSource.entities.add({
      id: ENTITY_PREFIX + key,
      position: Cesium.Cartesian3.fromDegrees(Number(row.lon), Number(row.lat), 8),
      point: {
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
      },
      properties: {
        rhkLayer: 'cctv', regionalSource: 'chicago-live', name: row.name || 'Live CCTV',
        category: row.category || 'camera', feedType: row.feedType || 'live',
        provider: row.provider || 'public source',
      },
    });
    count += 1;
  }
  _visibleCount = count;
  _dataSource.show = true;
  governorRequestRender('rhk-chicago-cctv-render');
}

const addon = {
  id: 'rhk-chicago-cctv-addon',

  init(viewer) {
    _viewer = viewer;
    _dataSource = new Cesium.CustomDataSource('rhk-chicago-live-cameras');
    _dataSource.show = false;
    viewer.dataSources.add(_dataSource);

    _handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    _handler.setInputAction((movement) => {
      if (!_enabled || !_dataSource?.show) return;
      const picked = viewer.scene.pick(movement.position);
      const id = String(picked?.id?.id || picked?.id || '');
      if (!id.startsWith(ENTITY_PREFIX)) return;
      const source = _sources.get(id.slice(ENTITY_PREFIX.length));
      if (source) openFeed(source);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

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
      const rows = Array.isArray(payload?.sources) ? payload.sources : [];
      _rows = rows.filter((row) => {
        const type = String(row?.feedType || '').toLowerCase();
        return ['hls', 'm3u8', 'iframe', 'mjpeg', 'mp4', 'webm'].includes(type)
          && Number.isFinite(Number(row?.lat)) && Number.isFinite(Number(row?.lon))
          && /^https:\/\//i.test(String(row?.embedUrl || ''));
      });
      _lastUpdate = Number(payload?.fetchedAt) || Date.now();
      _lastError = null;
      renderForCurrentView();
      return true;
    } catch (error) {
      _lastError = String(error?.message || error);
      console.warn('[RHKEARTH:CCTV:Chicago] update failed:', error);
      clearRendered();
      return false;
    }
  },

  destroy(viewer = _viewer) {
    this.disable();
    if (_moveEndHandler && viewer) viewer.camera.moveEnd.removeEventListener(_moveEndHandler);
    _moveEndHandler = null;
    _handler?.destroy();
    _handler = null;
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
      source: 'Chicago public continuous live CCTV',
    };
  },
};

export default addon;
'''

(ROOT / 'src/data/chicagoLiveCameras.js').write_text(module, encoding='utf-8')

main = ROOT / 'src/main.js'
text = main.read_text(encoding='utf-8')
import_anchor = "import cctvLayer from './data/cctv.js';\n"
addon_import = "import chicagoLiveCamerasAddon from './data/chicagoLiveCameras.js';\n"
if addon_import not in text:
    if import_anchor not in text:
        raise SystemExit('Chicago CCTV import anchor missing')
    text = text.replace(import_anchor, import_anchor + addon_import, 1)

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
        return result.then(async (value) => {
          await runAddon();
          return value;
        });
      }
      Promise.resolve(runAddon()).catch((error) => console.warn(`[RHKEARTH:${label}] ${method} failed`, error));
      return result;
    };
  };

  wrapAsyncTail('init');
  wrapAsyncTail('enable');
  wrapAsyncTail('update');

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
    anchor = "initLogoGaze();\n"
    if anchor not in text:
        raise SystemExit('Regional addon helper anchor missing')
    text = text.replace(anchor, helper + "\n" + anchor, 1)

manager_anchor = "    dataManager.register(cctvLayer);\n"
bind = "    attachRhkRegionalAddon(cctvLayer, chicagoLiveCamerasAddon, 'CCTV:Chicago');\n"
if bind not in text:
    if manager_anchor not in text:
        raise SystemExit('Chicago CCTV registration anchor missing')
    text = text.replace(manager_anchor, bind + manager_anchor, 1)

# Defensive cleanup for earlier iterations that registered Chicago as its own row.
text = text.replace("import chicagoLiveCamerasLayer from './data/chicagoLiveCameras.js';\n", addon_import)
text = text.replace("    dataManager.register(chicagoLiveCamerasLayer);\n", '')
main.write_text(text, encoding='utf-8')

# No city-specific layer-state token: Chicago is owned by the existing CCTV toggle.
state = ROOT / 'src/data/layerState.js'
state_text = state.read_text(encoding='utf-8')
state_text = state_text.replace("  Object.freeze({ id: 'chicago-live-cameras', token: 'v', disposition: 'enabled-only' }),\n", '')
state.write_text(state_text, encoding='utf-8')

print('RHKEARTH Chicago continuous-live cameras folded into existing CCTV layer with globally unified viewer')