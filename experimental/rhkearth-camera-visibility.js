(() => {
  'use strict';

  const CAMERA_PREFIX = 'rhk-worldcam:';
  const CHECK_INTERVAL_MS = 120;
  const RESCAN_INTERVAL_MS = 1000;
  const STYLE = {
    global: { minHeight: 7000000, size: 4.9, alpha: 0.72, outline: 1.3 },
    regional: { minHeight: 1500000, size: 5.6, alpha: 0.82, outline: 1.45 },
    local: { minHeight: 0, size: 6.3, alpha: 0.90, outline: 1.6 },
  };

  let viewer = null;
  let pointCollection = null;
  let labelCollection = null;
  let detachPreRender = null;
  let lastCheckAt = 0;
  let lastScanAt = 0;
  let lastStyleBand = '';

  const styledPoints = new WeakSet();
  const styledLabels = new WeakSet();

  function isCameraItem(item) {
    return String(item?.id || '').startsWith(CAMERA_PREFIX);
  }

  function collectionKind(collection) {
    if (!collection || typeof collection.length !== 'number' || typeof collection.get !== 'function') return '';
    const sampleCount = Math.min(collection.length, 12);
    for (let i = 0; i < sampleCount; i += 1) {
      const item = collection.get(i);
      if (!isCameraItem(item)) continue;
      if ('pixelSize' in item) return 'points';
      if ('text' in item) return 'labels';
    }
    return '';
  }

  function discoverCameraCollections(now) {
    if (!viewer || now - lastScanAt < RESCAN_INTERVAL_MS) return;
    lastScanAt = now;
    const primitives = viewer.scene?.primitives;
    if (!primitives || typeof primitives.length !== 'number' || typeof primitives.get !== 'function') return;

    for (let i = 0; i < primitives.length; i += 1) {
      const primitive = primitives.get(i);
      const kind = collectionKind(primitive);
      if (kind === 'points') pointCollection = primitive;
      if (kind === 'labels') labelCollection = primitive;
    }
  }

  function styleBand() {
    const height = Number(viewer?.camera?.positionCartographic?.height) || 1e9;
    if (height >= STYLE.global.minHeight) return ['global', STYLE.global];
    if (height >= STYLE.regional.minHeight) return ['regional', STYLE.regional];
    return ['local', STYLE.local];
  }

  function rgbaFromCss(css, alpha) {
    const Cesium = window.Cesium;
    if (!Cesium?.Color?.fromCssColorString) return null;
    return Cesium.Color.fromCssColorString(css).withAlpha(alpha);
  }

  function applyPointStyle(point, style, force = false) {
    if (!point || !isCameraItem(point)) return;
    if (!force && styledPoints.has(point) && lastStyleBand) return;

    // CCTV owns a distinct muted-turquoise channel. It reads clearly against
    // both the Noir land surface and dark ocean without the glare of white.
    point.pixelSize = style.size;
    const fill = rgbaFromCss('#56C8BE', style.alpha);
    const outline = rgbaFromCss('#06100E', Math.min(0.98, style.alpha + 0.12));
    if (fill) point.color = fill;
    if (outline) point.outlineColor = outline;
    point.outlineWidth = style.outline;

    // Never bypass depth testing for CCTV. The source addon previously used
    // POSITIVE_INFINITY, allowing opposite-side cameras to bleed through Earth.
    if ('disableDepthTestDistance' in point) point.disableDepthTestDistance = 0;
    styledPoints.add(point);
  }

  function applyLabelStyle(label) {
    if (!label || !isCameraItem(label) || styledLabels.has(label)) return;
    const fill = rgbaFromCss('#CDEAE6', 0.88);
    const background = rgbaFromCss('#07100E', 0.76);
    if (fill) label.fillColor = fill;
    if (background) label.backgroundColor = background;
    if ('disableDepthTestDistance' in label) label.disableDepthTestDistance = 0;
    styledLabels.add(label);
  }

  function cameraOccluder() {
    const Cesium = window.Cesium;
    const position = viewer?.camera?.positionWC;
    if (!Cesium?.EllipsoidalOccluder || !Cesium?.Ellipsoid?.WGS84 || !position) return null;
    try {
      return new Cesium.EllipsoidalOccluder(Cesium.Ellipsoid.WGS84, position);
    } catch (error) {
      console.warn('[RHKEARTH:CCTV] Could not create ellipsoid occluder', error);
      return null;
    }
  }

  function updateCollectionVisibility(collection, occluder, kind, style, forceStyle) {
    if (!collection || typeof collection.length !== 'number' || typeof collection.get !== 'function') return;
    for (let i = 0; i < collection.length; i += 1) {
      const item = collection.get(i);
      if (!isCameraItem(item)) continue;
      if (kind === 'points') applyPointStyle(item, style, forceStyle);
      else applyLabelStyle(item);

      // Explicit ellipsoid occlusion is the final guard. It remains effective
      // when Google Photorealistic 3D Tiles are active and Cesium's globe itself
      // is hidden, so a camera in Asia cannot draw through the planet while the
      // user is viewing North America.
      if (occluder && item.position) {
        try {
          item.show = !!occluder.isPointVisible(item.position);
        } catch {
          // If a provider creates an unusual position object, ordinary Cesium
          // depth testing still applies because disableDepthTestDistance is zero.
        }
      }
    }
  }

  function renderPass() {
    if (!viewer) return;
    const now = performance.now();
    discoverCameraCollections(now);
    if (now - lastCheckAt < CHECK_INTERVAL_MS) return;
    lastCheckAt = now;

    const [band, style] = styleBand();
    const forceStyle = band !== lastStyleBand;
    const occluder = cameraOccluder();

    updateCollectionVisibility(pointCollection, occluder, 'points', style, forceStyle);
    updateCollectionVisibility(labelCollection, occluder, 'labels', style, forceStyle);
    lastStyleBand = band;
  }

  function install() {
    const app = window.__godsEyeView;
    if (!app?.viewer || !window.Cesium) return false;
    if (window.__RHK_CCTV_VISIBILITY_FIX__) return true;

    viewer = app.viewer;
    const scene = viewer.scene;
    if (!scene?.preRender?.addEventListener) return false;

    const listener = () => renderPass();
    scene.preRender.addEventListener(listener);
    detachPreRender = () => scene.preRender.removeEventListener(listener);
    window.__RHK_CCTV_VISIBILITY_FIX__ = {
      version: 3,
      refresh: () => {
        lastCheckAt = 0;
        lastScanAt = 0;
        lastStyleBand = '';
        renderPass();
        scene.requestRender?.();
      },
      destroy: () => {
        detachPreRender?.();
        detachPreRender = null;
        pointCollection = null;
        labelCollection = null;
        viewer = null;
        delete window.__RHK_CCTV_VISIBILITY_FIX__;
      },
    };

    renderPass();
    scene.requestRender?.();
    console.info('[RHKEARTH:CCTV] Turquoise camera readability + Earth occlusion guard active');
    return true;
  }

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (install() || attempts >= 240) window.clearInterval(timer);
  }, 250);
  install();
})();