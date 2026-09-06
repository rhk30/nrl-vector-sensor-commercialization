from pathlib import Path

ROOT = Path.cwd()

module = r'''import * as Cesium from 'cesium';
import { governorRequestRender } from '../renderGovernor.js';

const API_URL = '/experimental/live-data/worldwide-cameras.json';
const PICK_PREFIX = 'rhk-worldcam:';
const MAX_VISIBLE_POINTS = 1200;
const LABEL_NEAR_M = 85000;

let _viewer = null;
let _points = null;
let _labels = null;
let _handler = null;
let _moveEndHandler = null;
let _enabled = false;
let _rows = [];
let _visibleRows = new Map();
let _lastUpdate = null;
let _lastError = null;
let _imageTimer = 0;

function currentViewRectangle() {
  if (!_viewer) return null;
  try {
    return _viewer.camera.computeViewRectangle(Cesium.Ellipsoid.WGS84) || null;
  } catch {
    return null;
  }
}

function pointInRect(lat, lon, rect) {
  if (!rect) return true;
  const y = Cesium.Math.toRadians(Number(lat));
  const x = Cesium.Math.toRadians(Number(lon));
  if (!(y >= rect.south && y <= rect.north)) return false;
  if (rect.west <= rect.east) return x >= rect.west && x <= rect.east;
  return x >= rect.west || x <= rect.east; // antimeridian-crossing view
}

function cameraCenterDegrees() {
  const carto = _viewer?.camera?.positionCartographic;
  return {
    lat: carto ? Cesium.Math.toDegrees(carto.latitude) : 0,
    lon: carto ? Cesium.Math.toDegrees(carto.longitude) : 0,
  };
}

function angularDistanceSq(row, center) {
  let dLon = Math.abs(Number(row.lon) - center.lon);
  dLon = Math.min(dLon, 360 - dLon);
  const dLat = Number(row.lat) - center.lat;
  return dLat * dLat + dLon * dLon;
}

function makePanel() {
  let panel = document.getElementById('rhk-world-camera-panel');
  if (panel) return panel;
  panel = document.createElement('section');
  panel.id = 'rhk-world-camera-panel';
  panel.setAttribute('aria-label', 'RHKEARTH live camera');
  Object.assign(panel.style, {
    position: 'fixed', right: '22px', bottom: '24px',
    width: 'min(540px, calc(100vw - 44px))',
    background: 'rgba(8,10,9,.97)', border: '1px solid rgba(169,181,155,.28)',
    boxShadow: '0 18px 55px rgba(0,0,0,.46)', zIndex: '1200', display: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
  });
  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:11px 12px;border-bottom:1px solid rgba(169,181,155,.16);">
      <div style="min-width:0;flex:1;">
        <div id="rhk-world-camera-title" style="font-size:12px;letter-spacing:.10em;text-transform:uppercase;color:#efefe9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">LIVE CAMERA</div>
        <div id="rhk-world-camera-meta" style="margin-top:3px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9fc5ad;">PUBLIC SOURCE</div>
      </div>
      <button id="rhk-world-camera-close" type="button" aria-label="Close camera" style="border:0;background:transparent;color:#d8dacc;font-size:21px;line-height:1;cursor:pointer;padding:2px 4px;">×</button>
    </div>
    <div id="rhk-world-camera-media" style="position:relative;width:100%;aspect-ratio:16/9;background:#050606;display:grid;place-items:center;overflow:hidden;"></div>
    <div style="display:flex;justify-content:space-between;gap:12px;padding:8px 11px;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#777d6d;">
      <span id="rhk-world-camera-semantics">LIVE PUBLIC CAMERA</span><span>RHKEARTH // CCTV</span>
    </div>`;
  panel.querySelector('#rhk-world-camera-close')?.addEventListener('click', closePanel);
  document.body.appendChild(panel);
  return panel;
}

function stopMediaRefresh() {
  if (_imageTimer) window.clearInterval(_imageTimer);
  _imageTimer = 0;
}

function closePanel() {
  stopMediaRefresh();
  const panel = document.getElementById('rhk-world-camera-panel');
  const media = document.getElementById('rhk-world-camera-media');
  if (media) media.replaceChildren();
  if (panel) panel.style.display = 'none';
}

function cacheBust(url) {
  const sep = String(url).includes('?') ? '&' : '?';
  return `${url}${sep}rhk=${Date.now()}`;
}

function openFeed(source) {
  if (!source || !_enabled) return;
  const panel = makePanel();
  const title = panel.querySelector('#rhk-world-camera-title');
  const meta = panel.querySelector('#rhk-world-camera-meta');
  const semantics = panel.querySelector('#rhk-world-camera-semantics');
  const media = panel.querySelector('#rhk-world-camera-media');
  if (!media) return;

  stopMediaRefresh();
  media.replaceChildren();
  if (title) title.textContent = source.name || 'LIVE CAMERA';
  if (meta) meta.textContent = [source.city, source.country, source.provider].filter(Boolean).join(' · ').toUpperCase();

  const type = String(source.feedType || 'image').toLowerCase();
  const url = String(source.mediaUrl || source.snapshotUrl || source.url || '').trim();
  const continuous = ['mp4', 'webm', 'hls', 'm3u8', 'iframe'].includes(type);
  if (semantics) semantics.textContent = continuous
    ? 'CONTINUOUS / ROLLING LIVE FEED'
    : 'NEAR REAL-TIME · PROVIDER-REFRESHED IMAGE';

  if (type === 'iframe') {
    const frame = document.createElement('iframe');
    frame.src = url;
    frame.title = source.name || 'Live camera';
    frame.allow = 'autoplay; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    Object.assign(frame.style, { width: '100%', height: '100%', border: '0', background: '#050606' });
    media.appendChild(frame);
  } else if (type === 'mp4' || type === 'webm') {
    const video = document.createElement('video');
    video.src = url;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    Object.assign(video.style, { width: '100%', height: '100%', objectFit: 'contain', background: '#050606' });
    media.appendChild(video);
  } else {
    const image = document.createElement('img');
    image.alt = source.name || 'Live camera';
    image.referrerPolicy = 'no-referrer-when-downgrade';
    Object.assign(image.style, { width: '100%', height: '100%', objectFit: 'contain', background: '#050606' });
    const refresh = () => { image.src = cacheBust(url); };
    refresh();
    _imageTimer = window.setInterval(refresh, Math.max(10000, Number(source.refreshMs) || 20000));
    media.appendChild(image);
  }
  panel.style.display = 'block';
}

function clearRendered() {
  _points?.removeAll();
  _labels?.removeAll();
  _visibleRows.clear();
}

function renderForCurrentView() {
  if (!_enabled || !_viewer || !_points || !_labels) {
    clearRendered();
    return;
  }
  const rect = currentViewRectangle();
  const center = cameraCenterDegrees();
  const height = Number(_viewer.camera.positionCartographic?.height) || 1e9;
  let visible = _rows.filter((row) => pointInRect(row.lat, row.lon, rect));
  if (visible.length > MAX_VISIBLE_POINTS) {
    visible.sort((a, b) => angularDistanceSq(a, center) - angularDistanceSq(b, center));
    visible = visible.slice(0, MAX_VISIBLE_POINTS);
  }

  clearRendered();
  for (const row of visible) {
    const id = String(row.id || `${row.lat},${row.lon}`);
    _visibleRows.set(id, row);
    _points.add({
      id: PICK_PREFIX + id,
      position: Cesium.Cartesian3.fromDegrees(Number(row.lon), Number(row.lat), 12),
      pixelSize: 7,
      color: Cesium.Color.fromCssColorString('#A7D7B6'),
      outlineColor: Cesium.Color.fromCssColorString('#0b0e0c'),
      outlineWidth: 1.5,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });

    if (height <= LABEL_NEAR_M && _labels.length < 80) {
      _labels.add({
        id: PICK_PREFIX + id,
        position: Cesium.Cartesian3.fromDegrees(Number(row.lon), Number(row.lat), 12),
        text: String(row.name || 'CAMERA'),
        font: '10px Inter, sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#efefe9'),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0c0b').withAlpha(0.80),
        pixelOffset: new Cesium.Cartesian2(0, -15),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    }
  }
  _points.show = true;
  _labels.show = true;
  governorRequestRender('rhk-world-cctv-render');
}

const addon = {
  id: 'rhk-worldwide-cctv-addon',

  init(viewer) {
    _viewer = viewer;
    _points = new Cesium.PointPrimitiveCollection();
    _labels = new Cesium.LabelCollection();
    viewer.scene.primitives.add(_points);
    viewer.scene.primitives.add(_labels);

    _handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    _handler.setInputAction((movement) => {
      if (!_enabled) return;
      const picked = viewer.scene.pick(movement.position);
      const raw = String(picked?.id || '');
      if (!raw.startsWith(PICK_PREFIX)) return;
      const source = _visibleRows.get(raw.slice(PICK_PREFIX.length));
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
    closePanel();
  },

  async update() {
    if (!_enabled) return true;
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const rows = Array.isArray(payload?.sources) ? payload.sources : [];
      _rows = rows.filter((row) => {
        const lat = Number(row?.lat);
        const lon = Number(row?.lon);
        const url = String(row?.mediaUrl || row?.snapshotUrl || row?.url || '');
        return Number.isFinite(lat) && Number.isFinite(lon)
          && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
          && /^https:\/\//i.test(url);
      });
      _lastUpdate = Number(payload?.fetchedAt) || Date.now();
      _lastError = null;
      renderForCurrentView();
      return true;
    } catch (error) {
      _lastError = String(error?.message || error);
      console.warn('[RHKEARTH:CCTV:Worldwide] update failed:', error);
      return false;
    }
  },

  destroy(viewer = _viewer) {
    this.disable();
    if (_moveEndHandler && viewer) viewer.camera.moveEnd.removeEventListener(_moveEndHandler);
    _moveEndHandler = null;
    _handler?.destroy();
    _handler = null;
    if (_points && viewer) viewer.scene.primitives.remove(_points);
    if (_labels && viewer) viewer.scene.primitives.remove(_labels);
    _points = null;
    _labels = null;
    _viewer = null;
    _rows = [];
  },

  getStats() {
    return {
      count: _visibleRows.size,
      visibleCount: _visibleRows.size,
      catalogCount: _rows.length,
      lastUpdate: _lastUpdate,
      error: _lastError,
      status: _lastError && !_rows.length ? 'degraded' : 'nominal',
      source: 'Worldwide public camera networks',
    };
  },
};

export default addon;
'''

(ROOT / 'src/data/worldwideCameras.js').write_text(module, encoding='utf-8')

main = ROOT / 'src/main.js'
text = main.read_text(encoding='utf-8')
import_anchor = "import cctvLayer from './data/cctv.js';\n"
addon_import = "import worldwideCamerasAddon from './data/worldwideCameras.js';\n"
if addon_import not in text:
    if import_anchor not in text:
        raise SystemExit('Worldwide CCTV import anchor missing')
    text = text.replace(import_anchor, import_anchor + addon_import, 1)

# The Chicago patch normally installs this helper first. Keep this script safe
# when run independently in development by injecting the same minimal wrapper.
if 'function attachRhkRegionalAddon(' not in text:
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
      const extra = addon.getStats?.() || {};
      return { ...base, count: (Number(base.count) || 0) + (Number(extra.visibleCount ?? extra.count) || 0), worldwide: extra };
    };
  }
}
'''
    anchor = "initLogoGaze();\n"
    if anchor not in text:
        raise SystemExit('Worldwide CCTV helper anchor missing')
    text = text.replace(anchor, helper + "\n" + anchor, 1)

manager_anchor = "    dataManager.register(cctvLayer);\n"
bind = "    attachRhkRegionalAddon(cctvLayer, worldwideCamerasAddon, 'CCTV:Worldwide');\n"
if bind not in text:
    if manager_anchor not in text:
        raise SystemExit('Worldwide CCTV registration anchor missing')
    text = text.replace(manager_anchor, bind + manager_anchor, 1)

main.write_text(text, encoding='utf-8')
print('RHKEARTH worldwide public camera addon installed with viewport gating and live-image refresh')
