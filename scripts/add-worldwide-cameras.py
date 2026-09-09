from pathlib import Path

ROOT = Path.cwd()

module = r'''import * as Cesium from 'cesium';
import { governorRequestRender } from '../renderGovernor.js';

const API_URL = '/experimental/live-data/worldwide-cameras.json';
const PICK_PREFIX = 'rhk-worldcam:';
const LABEL_NEAR_M = 85000;
const MAX_LABELS_DESKTOP = 120;
const MAX_LABELS_MOBILE = 48;

let _viewer = null;
let _points = null;
let _labels = null;
let _handler = null;
let _moveEndHandler = null;
let _enabled = false;
let _rows = [];
let _rowById = new Map();
let _lastUpdate = null;
let _lastError = null;
let _imageTimer = 0;
let _activeSource = null;
let _activeMode = null;
let _visibleCount = 0;

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

function pointInRect(lat, lon, rect) {
  if (!rect) return true;
  const y = Cesium.Math.toRadians(Number(lat));
  const x = Cesium.Math.toRadians(Number(lon));
  if (!(y >= rect.south && y <= rect.north)) return false;
  if (rect.west <= rect.east) return x >= rect.west && x <= rect.east;
  return x >= rect.west || x <= rect.east;
}

function panelButton(label, id) {
  return `<button id="${id}" type="button" style="height:30px;padding:0 10px;border:1px solid rgba(169,181,155,.20);border-radius:4px;background:rgba(255,255,255,.025);color:#cfd3c7;font:600 9px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;">${label}</button>`;
}

function makePanel() {
  let panel = document.getElementById('rhk-world-camera-panel');
  if (panel) return panel;
  panel = document.createElement('section');
  panel.id = 'rhk-world-camera-panel';
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
          <span id="rhk-world-camera-status" style="width:6px;height:6px;border-radius:50%;background:#A7D7B6;box-shadow:0 0 8px rgba(167,215,182,.35);flex:0 0 auto;"></span>
          <div id="rhk-world-camera-title" style="font-size:12px;letter-spacing:.10em;text-transform:uppercase;color:#efefe9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">PUBLIC CAMERA</div>
        </div>
        <div id="rhk-world-camera-meta" style="margin-top:4px;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#9fc5ad;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">PUBLIC SOURCE</div>
      </div>
      <button id="rhk-world-camera-close" type="button" aria-label="Close camera" style="border:0;background:transparent;color:#d8dacc;font-size:21px;line-height:1;cursor:pointer;padding:2px 4px;">×</button>
    </div>
    <div id="rhk-world-camera-media" style="position:relative;width:100%;aspect-ratio:16/9;background:#050606;display:grid;place-items:center;overflow:hidden;"></div>
    <div id="rhk-world-camera-actions" style="display:flex;gap:6px;padding:8px 10px 0;flex-wrap:wrap;">
      ${panelButton('Refresh', 'rhk-world-camera-refresh')}
      ${panelButton('Snapshot', 'rhk-world-camera-snapshot')}
      ${panelButton('Rolling video', 'rhk-world-camera-video')}
    </div>
    <div style="display:flex;justify-content:space-between;gap:12px;padding:8px 11px;font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:#777d6d;">
      <span id="rhk-world-camera-semantics">PUBLIC CAMERA</span><span id="rhk-world-camera-provider">RHKEARTH // CCTV</span>
    </div>`;
  panel.querySelector('#rhk-world-camera-close')?.addEventListener('click', closePanel);
  panel.querySelector('#rhk-world-camera-refresh')?.addEventListener('click', () => renderActiveFeed(true));
  panel.querySelector('#rhk-world-camera-snapshot')?.addEventListener('click', () => {
    if (_activeSource) renderFeed(_activeSource, 'snapshot');
  });
  panel.querySelector('#rhk-world-camera-video')?.addEventListener('click', () => {
    if (_activeSource) renderFeed(_activeSource, 'video');
  });
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
  _activeSource = null;
  _activeMode = null;
}

function cacheBust(url) {
  const sep = String(url).includes('?') ? '&' : '?';
  return `${url}${sep}rhk=${Date.now()}`;
}

function mediaError(message) {
  const media = document.getElementById('rhk-world-camera-media');
  if (!media) return;
  const error = document.createElement('div');
  error.textContent = message;
  Object.assign(error.style, {
    padding: '18px', color: '#a8ab9f', fontSize: '10px', lineHeight: '1.5',
    letterSpacing: '.07em', textTransform: 'uppercase', textAlign: 'center',
  });
  media.replaceChildren(error);
}

function availableVideoUrl(source) {
  const type = String(source?.feedType || '').toLowerCase();
  if (source?.videoUrl) return String(source.videoUrl).trim();
  if (['mp4', 'webm', 'hls', 'm3u8', 'iframe'].includes(type)) {
    return String(source.mediaUrl || source.url || '').trim();
  }
  return '';
}

function availableSnapshotUrl(source) {
  return String(source?.snapshotUrl || (String(source?.feedType || '').toLowerCase() === 'image' ? source?.mediaUrl : '') || source?.url || '').trim();
}

function renderActiveFeed(force = false) {
  if (!_activeSource) return;
  renderFeed(_activeSource, _activeMode || 'auto', force);
}

function renderFeed(source, requestedMode = 'auto', force = false) {
  const panel = makePanel();
  const title = panel.querySelector('#rhk-world-camera-title');
  const meta = panel.querySelector('#rhk-world-camera-meta');
  const semantics = panel.querySelector('#rhk-world-camera-semantics');
  const provider = panel.querySelector('#rhk-world-camera-provider');
  const media = panel.querySelector('#rhk-world-camera-media');
  const snapshotBtn = panel.querySelector('#rhk-world-camera-snapshot');
  const videoBtn = panel.querySelector('#rhk-world-camera-video');
  if (!media) return;

  _activeSource = source;
  stopMediaRefresh();
  media.replaceChildren();

  if (title) title.textContent = source.name || 'PUBLIC CAMERA';
  if (meta) meta.textContent = [source.city, source.country].filter(Boolean).join(' · ').toUpperCase() || 'PUBLIC CAMERA';
  if (provider) provider.textContent = String(source.provider || 'PUBLIC SOURCE').toUpperCase();

  const snapshotUrl = availableSnapshotUrl(source);
  const videoUrl = availableVideoUrl(source);
  const sourceType = String(source.feedType || 'image').toLowerCase();
  let mode = requestedMode;
  if (mode === 'auto') mode = videoUrl && sourceType !== 'image' ? 'video' : 'snapshot';
  if (mode === 'video' && !videoUrl) mode = 'snapshot';
  if (mode === 'snapshot' && !snapshotUrl && videoUrl) mode = 'video';
  _activeMode = mode;

  if (snapshotBtn) snapshotBtn.style.display = snapshotUrl ? '' : 'none';
  if (videoBtn) {
    videoBtn.style.display = videoUrl ? '' : 'none';
    // TfL's rolling MP4 JamCams remain a UK-specific extra feature while the
    // surrounding viewer chrome stays identical to every other camera.
    videoBtn.textContent = String(source.country || '').toUpperCase().includes('UK') || String(source.provider || '').toLowerCase().includes('transport for london')
      ? 'TfL rolling video'
      : 'Rolling video';
  }

  if (mode === 'video' && videoUrl) {
    const type = sourceType === 'iframe' ? 'iframe' : (videoUrl.toLowerCase().includes('.webm') ? 'webm' : 'mp4');
    if (semantics) semantics.textContent = String(source.provider || '').toLowerCase().includes('transport for london')
      ? 'UK SPECIAL · TFL ROLLING VIDEO'
      : 'CONTINUOUS / ROLLING LIVE FEED';
    if (type === 'iframe') {
      const frame = document.createElement('iframe');
      frame.src = videoUrl;
      frame.title = source.name || 'Live camera';
      frame.allow = 'autoplay; fullscreen; picture-in-picture';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      Object.assign(frame.style, { width: '100%', height: '100%', border: '0', background: '#050606' });
      media.appendChild(frame);
    } else {
      const video = document.createElement('video');
      video.src = force ? cacheBust(videoUrl) : videoUrl;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = true;
      video.addEventListener('error', () => mediaError('Provider video is temporarily unavailable'));
      Object.assign(video.style, { width: '100%', height: '100%', objectFit: 'contain', background: '#050606' });
      media.appendChild(video);
    }
  } else if (snapshotUrl) {
    if (semantics) semantics.textContent = 'NEAR REAL-TIME · PROVIDER-REFRESHED IMAGE';
    const image = document.createElement('img');
    image.alt = source.name || 'Public camera';
    image.referrerPolicy = 'no-referrer-when-downgrade';
    image.addEventListener('error', () => mediaError('Provider image is temporarily unavailable'));
    Object.assign(image.style, { width: '100%', height: '100%', objectFit: 'contain', background: '#050606' });
    const refresh = () => { image.src = cacheBust(snapshotUrl); };
    refresh();
    _imageTimer = window.setInterval(refresh, Math.max(10000, Number(source.refreshMs) || 20000));
    media.appendChild(image);
  } else {
    if (semantics) semantics.textContent = 'SOURCE UNAVAILABLE';
    mediaError('This public camera currently has no usable media URL');
  }
  panel.style.display = 'block';
}

function openFeed(source) {
  if (!source || !_enabled) return;
  renderFeed(source, 'auto');
}

function clearRendered() {
  _points?.removeAll();
  _labels?.removeAll();
  _rowById.clear();
  _visibleCount = 0;
}

function renderCatalogPoints() {
  if (!_enabled || !_viewer || !_points) return;
  _points.removeAll();
  _rowById.clear();

  // PointPrimitiveCollection is GPU batched and Cesium culls off-screen points.
  // Keep the entire valid catalog resident instead of arbitrarily discarding
  // cameras at 1,200/2,000. Labels and media remain viewport/on-click only.
  for (const row of _rows) {
    const id = String(row.id || `${row.lat},${row.lon}`);
    _rowById.set(id, row);
    const hasVideo = !!availableVideoUrl(row);
    _points.add({
      id: PICK_PREFIX + id,
      position: Cesium.Cartesian3.fromDegrees(Number(row.lon), Number(row.lat), 12),
      pixelSize: hasVideo ? 7 : 5.5,
      color: Cesium.Color.fromCssColorString(hasVideo ? '#B8D9C4' : '#93BDA3'),
      outlineColor: Cesium.Color.fromCssColorString('#0b0e0c'),
      outlineWidth: 1.25,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
  }
  _points.show = true;
  renderLabelsForCurrentView();
  governorRequestRender('rhk-world-cctv-catalog');
}

function renderLabelsForCurrentView() {
  if (!_enabled || !_viewer || !_labels) return;
  _labels.removeAll();
  const rect = currentViewRectangle();
  const height = Number(_viewer.camera.positionCartographic?.height) || 1e9;
  const visible = _rows.filter((row) => pointInRect(row.lat, row.lon, rect));
  _visibleCount = visible.length;
  if (height > LABEL_NEAR_M) {
    governorRequestRender('rhk-world-cctv-labels');
    return;
  }

  const maxLabels = isMobileUi() ? MAX_LABELS_MOBILE : MAX_LABELS_DESKTOP;
  for (const row of visible.slice(0, maxLabels)) {
    const id = String(row.id || `${row.lat},${row.lon}`);
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
  _labels.show = true;
  governorRequestRender('rhk-world-cctv-labels');
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
      const source = _rowById.get(raw.slice(PICK_PREFIX.length));
      if (source) openFeed(source);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    _moveEndHandler = () => renderLabelsForCurrentView();
    viewer.camera.moveEnd.addEventListener(_moveEndHandler);
  },

  async enable() {
    _enabled = true;
    if (!_lastUpdate) await this.update();
    else renderCatalogPoints();
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
        const url = availableSnapshotUrl(row) || availableVideoUrl(row);
        return Number.isFinite(lat) && Number.isFinite(lon)
          && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
          && /^https:\/\//i.test(url);
      });
      _lastUpdate = Number(payload?.fetchedAt) || Date.now();
      _lastError = null;
      renderCatalogPoints();
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
      count: _rows.length,
      visibleCount: _visibleCount,
      catalogCount: _rows.length,
      lastUpdate: _lastUpdate,
      error: _lastError,
      status: _lastError && !_rows.length ? 'degraded' : 'nominal',
      source: 'Worldwide public camera networks',
      renderMode: 'full-catalog GPU points; viewport-only labels/media',
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
      return { ...base, count: (Number(base.count) || 0) + (Number(extra.catalogCount ?? extra.count) || 0), worldwide: extra };
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
print('RHKEARTH worldwide public camera addon installed with full-catalog GPU points and unified viewer')