/*
 * RHKEARTH analysis tools — OSIRIS-derived feature pack.
 *
 * Product/interaction patterns adapted from simplifaisoul/osiris (MIT):
 * keyboard shortcut discoverability, entity search, drawing/measurement,
 * AOI inspection, and GeoJSON export. RHKEARTH's implementation is Cesium-native
 * and intentionally omits OSIRIS heuristic threat scoring / guessed geolocation.
 *
 * OSIRIS copyright (c) 2026 simplifaisoul. See /experimental/OSIRIS_LICENSE.txt.
 */
(() => {
  'use strict';

  if (window.__rhkOsirisToolsInstalled) return;
  window.__rhkOsirisToolsInstalled = true;

  const TOOL_SOURCE = 'RHKEARTH Analysis Tools';
  const state = {
    viewer: null,
    Cesium: null,
    dataSource: null,
    handler: null,
    mode: null,
    points: [],
    hoverPoint: null,
    previewIds: [],
    shapes: [],
    nextId: 1,
    panelOpen: false,
  };

  const $ = (id) => document.getElementById(id);
  const isTyping = (target = document.activeElement) => {
    const tag = String(target?.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || !!target?.isContentEditable;
  };

  function toast(message) {
    const existing = $('toast');
    if (existing) {
      existing.textContent = message;
      existing.classList.add('show');
      window.setTimeout(() => existing.classList.remove('show'), 1800);
      return;
    }
    let el = $('rhk-tools-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'rhk-tools-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 1800);
  }

  function installUi() {
    if ($('rhk-analysis-tools-btn')) return;

    const actions = $('top-center-actions');
    const button = document.createElement('button');
    button.id = 'rhk-analysis-tools-btn';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open analysis tools');
    button.setAttribute('aria-expanded', 'false');
    button.title = 'Analysis tools · search, measure, AOI';
    button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">straighten</span>';
    if (actions) actions.appendChild(button);
    else document.body.appendChild(button);

    const panel = document.createElement('section');
    panel.id = 'rhk-analysis-tools-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Analysis tools');
    panel.innerHTML = `
      <header class="rhk-tools-header">
        <div><small>ANALYSIS</small><strong>TOOLS</strong></div>
        <button id="rhk-tools-close" type="button" aria-label="Close analysis tools"><span class="material-symbols-outlined">close</span></button>
      </header>
      <div class="rhk-tools-grid">
        <button type="button" data-rhk-tool="search"><span class="material-symbols-outlined">search</span><b>SEARCH</b><small>CTRL K</small></button>
        <button type="button" data-rhk-tool="path"><span class="material-symbols-outlined">timeline</span><b>PATH</b><small>DISTANCE</small></button>
        <button type="button" data-rhk-tool="area"><span class="material-symbols-outlined">pentagon</span><b>AREA</b><small>AOI</small></button>
        <button type="button" data-rhk-tool="radius"><span class="material-symbols-outlined">radio_button_unchecked</span><b>RADIUS</b><small>AOI</small></button>
      </div>
      <div id="rhk-tools-instruction" class="rhk-tools-instruction">Select a tool. Measurements are local analysis overlays, not source data.</div>
      <div class="rhk-tools-footer">
        <button id="rhk-tools-export" type="button">EXPORT GEOJSON</button>
        <button id="rhk-tools-clear" type="button">CLEAR</button>
        <button id="rhk-tools-help" type="button" aria-label="Keyboard shortcuts">?</button>
      </div>`;
    document.body.appendChild(panel);

    const search = document.createElement('div');
    search.id = 'rhk-asset-search';
    search.hidden = true;
    search.innerHTML = `
      <div class="rhk-search-shell" role="dialog" aria-modal="true" aria-label="Search loaded assets">
        <div class="rhk-search-row"><span class="material-symbols-outlined">search</span><input id="rhk-asset-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Search loaded callsign, vessel, satellite, ID, or lat, lon"/><kbd>ESC</kbd></div>
        <div id="rhk-asset-search-meta">SEARCHES CURRENTLY LOADED RHKEARTH ENTITIES</div>
        <div id="rhk-asset-search-results" role="listbox"></div>
      </div>`;
    document.body.appendChild(search);

    const help = document.createElement('div');
    help.id = 'rhk-shortcuts-overlay';
    help.hidden = true;
    help.innerHTML = `
      <section class="rhk-shortcuts-card" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <header><div><small>RHKEARTH</small><strong>KEYBOARD</strong></div><button id="rhk-shortcuts-close" type="button"><span class="material-symbols-outlined">close</span></button></header>
        <div class="rhk-shortcut-list">
          <div><kbd>CTRL</kbd><kbd>K</kbd><span>Search loaded assets</span></div>
          <div><kbd>?</kbd><span>Open this shortcut reference</span></div>
          <div><kbd>SHIFT</kbd><kbd>M</kbd><span>Start / cancel path measurement</span></div>
          <div><kbd>ENTER</kbd><span>Finish an active path or area</span></div>
          <div><kbd>BACKSPACE</kbd><span>Undo last measurement point</span></div>
          <div><kbd>ESC</kbd><span>Cancel tool or close overlay</span></div>
          <div><kbd>↑ ↓</kbd><span>Forward / backward globe navigation</span></div>
          <div><kbd>← →</kbd><span>Orbit left / right around Earth</span></div>
        </div>
        <footer>NUMBER KEYS AND EXISTING RHKEARTH CONTROLS ARE UNCHANGED.</footer>
      </section>`;
    document.body.appendChild(help);

    button.addEventListener('click', () => setPanelOpen(!state.panelOpen));
    $('rhk-tools-close')?.addEventListener('click', () => setPanelOpen(false));
    $('rhk-tools-clear')?.addEventListener('click', clearAll);
    $('rhk-tools-export')?.addEventListener('click', exportGeoJSON);
    $('rhk-tools-help')?.addEventListener('click', openHelp);
    $('rhk-shortcuts-close')?.addEventListener('click', closeHelp);

    panel.querySelectorAll('[data-rhk-tool]').forEach((el) => {
      el.addEventListener('click', () => {
        const tool = el.getAttribute('data-rhk-tool');
        if (tool === 'search') return openSearch();
        setMode(state.mode === tool ? null : tool);
      });
    });

    search.addEventListener('mousedown', (event) => {
      if (event.target === search) closeSearch();
    });
    help.addEventListener('mousedown', (event) => {
      if (event.target === help) closeHelp();
    });
    $('rhk-asset-search-input')?.addEventListener('input', renderSearchResults);
  }

  function setPanelOpen(open) {
    state.panelOpen = !!open;
    const panel = $('rhk-analysis-tools-panel');
    const btn = $('rhk-analysis-tools-btn');
    if (panel) panel.hidden = !state.panelOpen;
    if (btn) btn.setAttribute('aria-expanded', String(state.panelOpen));
  }

  function openHelp() {
    closeSearch();
    const el = $('rhk-shortcuts-overlay');
    if (el) el.hidden = false;
  }
  function closeHelp() {
    const el = $('rhk-shortcuts-overlay');
    if (el) el.hidden = true;
  }

  function openSearch() {
    cancelDraft(false);
    closeHelp();
    const overlay = $('rhk-asset-search');
    const input = $('rhk-asset-search-input');
    if (!overlay || !input) return;
    overlay.hidden = false;
    input.value = '';
    renderSearchResults();
    requestAnimationFrame(() => input.focus());
  }
  function closeSearch() {
    const overlay = $('rhk-asset-search');
    if (overlay) overlay.hidden = true;
  }

  function allEntities() {
    const viewer = state.viewer;
    if (!viewer) return [];
    const out = [];
    const seen = new Set();
    const addCollection = (collection) => {
      const values = collection?.values || [];
      for (const entity of values) {
        if (!entity || seen.has(entity)) continue;
        seen.add(entity);
        out.push(entity);
      }
    };
    addCollection(viewer.entities);
    const sources = viewer.dataSources;
    if (sources) {
      for (let i = 0; i < sources.length; i += 1) {
        const ds = sources.get(i);
        if (ds?.name === TOOL_SOURCE) continue;
        addCollection(ds?.entities);
      }
    }
    return out;
  }

  function entityText(entity) {
    const now = state.Cesium?.JulianDate?.now?.();
    let props = null;
    try { props = entity?.properties?.getValue?.(now) || null; } catch (_) {}
    const pieces = [entity?.name, entity?.id];
    if (props && typeof props === 'object') {
      for (const key of ['callsign', 'flight', 'icao24', 'registration', 'mmsi', 'imo', 'destination', 'satelliteName', 'title', 'type']) {
        if (props[key] != null) pieces.push(String(props[key]));
      }
    }
    return pieces.filter(Boolean).join(' · ');
  }

  function entityLabel(entity) {
    const text = entityText(entity).trim();
    return text || String(entity?.id || 'UNNAMED ENTITY');
  }

  function parseLatLon(query) {
    const m = String(query || '').trim().match(/^(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)$/);
    if (!m) return null;
    const lat = Number(m[1]);
    const lon = Number(m[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return { lat, lon };
  }

  function renderSearchResults() {
    const input = $('rhk-asset-search-input');
    const results = $('rhk-asset-search-results');
    const meta = $('rhk-asset-search-meta');
    if (!input || !results) return;
    const q = input.value.trim();
    results.innerHTML = '';
    const entities = allEntities();
    if (meta) meta.textContent = `${entities.length.toLocaleString()} LOADED ENTITIES · LOCAL INDEX`;

    const coordinate = parseLatLon(q);
    if (coordinate) {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'rhk-search-result';
      row.innerHTML = `<b>GO TO COORDINATES</b><span>${coordinate.lat.toFixed(5)}°, ${coordinate.lon.toFixed(5)}°</span>`;
      row.addEventListener('click', () => flyToCoordinates(coordinate.lat, coordinate.lon));
      results.appendChild(row);
    }

    if (q.length < 1) {
      const hint = document.createElement('div');
      hint.className = 'rhk-search-empty';
      hint.textContent = 'TYPE A CALLSIGN, MMSI, SATELLITE, ENTITY ID, OR “LAT, LON”';
      results.appendChild(hint);
      return;
    }

    const needle = q.toLowerCase();
    const matches = entities
      .map((entity) => ({ entity, text: entityText(entity) }))
      .filter((item) => item.text.toLowerCase().includes(needle))
      .slice(0, 14);

    for (const { entity, text } of matches) {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'rhk-search-result';
      const primary = String(entity?.name || entity?.id || 'ENTITY');
      row.innerHTML = `<b></b><span></span>`;
      row.querySelector('b').textContent = primary;
      row.querySelector('span').textContent = text === primary ? String(entity?.id || '') : text;
      row.addEventListener('click', () => focusEntity(entity));
      results.appendChild(row);
    }

    if (!matches.length && !coordinate) {
      const empty = document.createElement('div');
      empty.className = 'rhk-search-empty';
      empty.textContent = 'NO MATCH IN CURRENTLY LOADED ENTITIES';
      results.appendChild(empty);
    }
  }

  function focusEntity(entity) {
    const viewer = state.viewer;
    if (!viewer || !entity) return;
    closeSearch();
    try { viewer.selectedEntity = entity; } catch (_) {}
    Promise.resolve(viewer.flyTo(entity, { duration: 1.1 })).catch(() => {});
  }

  function flyToCoordinates(lat, lon) {
    const { Cesium, viewer } = state;
    if (!Cesium || !viewer) return;
    closeSearch();
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, 18_000),
      duration: 1.25,
    });
  }

  function installDataSource() {
    if (state.dataSource || !state.viewer || !state.Cesium) return;
    state.dataSource = new state.Cesium.CustomDataSource(TOOL_SOURCE);
    state.viewer.dataSources.add(state.dataSource);
  }

  function setMode(mode) {
    if (!['path', 'area', 'radius'].includes(mode)) mode = null;
    if (state.mode === mode && mode != null) mode = null;
    cancelDraft(false);
    state.mode = mode;
    state.points = [];
    state.hoverPoint = null;
    updateToolButtons();
    const instruction = $('rhk-tools-instruction');
    if (!instruction) return;
    if (mode === 'path') instruction.textContent = 'PATH · click points on the globe · ENTER finishes · BACKSPACE undoes · ESC cancels';
    else if (mode === 'area') instruction.textContent = 'AREA · click polygon vertices · ENTER closes AOI · BACKSPACE undoes · ESC cancels';
    else if (mode === 'radius') instruction.textContent = 'RADIUS · click center, then edge · ESC cancels';
    else instruction.textContent = 'Select a tool. Measurements are local analysis overlays, not source data.';
  }

  function updateToolButtons() {
    document.querySelectorAll('[data-rhk-tool]').forEach((el) => {
      el.classList.toggle('active', el.getAttribute('data-rhk-tool') === state.mode);
    });
    document.body.classList.toggle('rhk-analysis-drawing', !!state.mode);
  }

  function pickCartesian(position) {
    const { viewer, Cesium } = state;
    if (!viewer || !Cesium || !position) return null;
    const scene = viewer.scene;
    let point = null;
    try {
      if (scene.pickPositionSupported) point = scene.pickPosition(position);
    } catch (_) {}
    if (!Cesium.defined(point)) {
      try { point = viewer.camera.pickEllipsoid(position, scene.globe.ellipsoid); } catch (_) {}
    }
    return Cesium.defined(point) ? point : null;
  }

  function installDrawingHandler() {
    if (state.handler || !state.viewer || !state.Cesium) return;
    const { Cesium, viewer } = state;
    state.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    state.handler.setInputAction((movement) => {
      if (!state.mode) return;
      const point = pickCartesian(movement.position);
      if (!point) return;
      state.points.push(point);
      state.hoverPoint = null;
      if (state.mode === 'radius' && state.points.length >= 2) finishDraft();
      else renderDraft();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    state.handler.setInputAction((movement) => {
      if (!state.mode || !state.points.length) return;
      const point = pickCartesian(movement.endPosition);
      if (!point) return;
      state.hoverPoint = point;
      renderDraft();
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  function removePreview() {
    if (!state.dataSource) return;
    for (const id of state.previewIds) {
      const entity = state.dataSource.entities.getById(id);
      if (entity) state.dataSource.entities.remove(entity);
    }
    state.previewIds = [];
  }

  function addPreviewEntity(options) {
    const entity = state.dataSource.entities.add(options);
    state.previewIds.push(entity.id);
    return entity;
  }

  function analysisColor(alpha = 1) {
    return state.Cesium.Color.fromCssColorString('#E7E3D6').withAlpha(alpha);
  }

  function tacticalFill(alpha = 0.16) {
    return state.Cesium.Color.fromCssColorString('#72C9D8').withAlpha(alpha);
  }

  function renderDraft() {
    if (!state.mode || !state.dataSource) return;
    const { Cesium } = state;
    removePreview();
    const points = state.hoverPoint ? [...state.points, state.hoverPoint] : [...state.points];
    if (!points.length) return;

    for (let i = 0; i < state.points.length; i += 1) {
      addPreviewEntity({
        id: `rhk-tool-preview-point-${i}`,
        position: state.points[i],
        point: { pixelSize: 6, color: analysisColor(0.95), outlineColor: Cesium.Color.BLACK.withAlpha(0.7), outlineWidth: 1, disableDepthTestDistance: 3_000_000 },
      });
    }

    if ((state.mode === 'path' || state.mode === 'area') && points.length >= 2) {
      const linePositions = state.mode === 'area' && points.length >= 3 ? [...points, points[0]] : points;
      addPreviewEntity({
        id: 'rhk-tool-preview-line',
        polyline: { positions: linePositions, width: 2, material: analysisColor(0.9), clampToGround: false },
      });
    }

    if (state.mode === 'area' && points.length >= 3) {
      addPreviewEntity({
        id: 'rhk-tool-preview-area',
        polygon: { hierarchy: new Cesium.PolygonHierarchy(points), material: tacticalFill(0.12), outline: true, outlineColor: analysisColor(0.75), perPositionHeight: true },
      });
    }

    if (state.mode === 'radius' && points.length >= 2) {
      const radius = geodesicDistanceMeters(points[0], points[1]);
      if (radius > 0) {
        addPreviewEntity({
          id: 'rhk-tool-preview-radius',
          position: points[0],
          ellipse: { semiMajorAxis: radius, semiMinorAxis: radius, material: tacticalFill(0.12), outline: true, outlineColor: analysisColor(0.8) },
        });
      }
    }
  }

  function cartographic(cartesian) {
    return state.Cesium.Cartographic.fromCartesian(cartesian);
  }

  function geodesicDistanceMeters(a, b) {
    const { Cesium } = state;
    const ca = cartographic(a);
    const cb = cartographic(b);
    const geodesic = new Cesium.EllipsoidGeodesic(ca, cb);
    const surface = Number(geodesic.surfaceDistance || 0);
    const dh = Number(cb.height || 0) - Number(ca.height || 0);
    return Math.sqrt(surface * surface + dh * dh);
  }

  function pathDistanceMeters(points) {
    let total = 0;
    for (let i = 1; i < points.length; i += 1) total += geodesicDistanceMeters(points[i - 1], points[i]);
    return total;
  }

  function pointsToLonLat(points) {
    const { Cesium } = state;
    return points.map((point) => {
      const c = cartographic(point);
      return [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude), Number(c.height || 0)];
    });
  }

  // Spherical polygon area. This mirrors the OSIRIS drawing-tool approach while
  // keeping RHKEARTH independent of MapLibre/React and using Cesium picks.
  function polygonAreaKm2(points) {
    const coords = pointsToLonLat(points);
    if (coords.length < 3) return 0;
    const R = 6371.0088;
    let area = 0;
    for (let i = 0; i < coords.length; i += 1) {
      const j = (i + 1) % coords.length;
      const lat1 = coords[i][1] * Math.PI / 180;
      const lat2 = coords[j][1] * Math.PI / 180;
      let dLon = (coords[j][0] - coords[i][0]) * Math.PI / 180;
      if (dLon > Math.PI) dLon -= Math.PI * 2;
      if (dLon < -Math.PI) dLon += Math.PI * 2;
      area += dLon * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    return Math.abs(area * R * R / 2);
  }

  function formatDistance(meters) {
    if (!Number.isFinite(meters)) return '—';
    if (meters >= 1000) return `${(meters / 1000).toFixed(meters >= 100_000 ? 0 : 2)} km`;
    return `${Math.round(meters)} m`;
  }

  function labelOptions(text) {
    const { Cesium } = state;
    return {
      text,
      font: '600 12px monospace',
      fillColor: analysisColor(0.96),
      outlineColor: Cesium.Color.BLACK.withAlpha(0.95),
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -18),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      showBackground: true,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.68),
      backgroundPadding: new Cesium.Cartesian2(7, 5),
    };
  }

  function finishDraft() {
    const mode = state.mode;
    const points = [...state.points];
    if (mode === 'path' && points.length < 2) return toast('PATH NEEDS AT LEAST 2 POINTS');
    if (mode === 'area' && points.length < 3) return toast('AREA NEEDS AT LEAST 3 POINTS');
    if (mode === 'radius' && points.length < 2) return;

    removePreview();
    const { Cesium } = state;
    const id = state.nextId++;
    const prefix = `rhk-analysis-${id}`;
    const shape = { id: prefix, mode, createdAt: new Date().toISOString() };

    if (mode === 'path') {
      const distance = pathDistanceMeters(points);
      state.dataSource.entities.add({ id: `${prefix}-line`, polyline: { positions: points, width: 3, material: analysisColor(0.94) } });
      state.dataSource.entities.add({ id: `${prefix}-label`, position: points[points.length - 1], label: labelOptions(`PATH · ${formatDistance(distance)}`) });
      shape.distanceMeters = distance;
      shape.coordinates = pointsToLonLat(points);
      toast(`PATH ${formatDistance(distance)}`);
    } else if (mode === 'area') {
      const areaKm2 = polygonAreaKm2(points);
      const count = countEntitiesInPolygon(pointsToLonLat(points));
      state.dataSource.entities.add({
        id: `${prefix}-polygon`,
        polygon: { hierarchy: new Cesium.PolygonHierarchy(points), material: tacticalFill(0.16), outline: true, outlineColor: analysisColor(0.92), perPositionHeight: true },
      });
      state.dataSource.entities.add({ id: `${prefix}-label`, position: points[0], label: labelOptions(`AOI · ${areaKm2.toFixed(areaKm2 >= 100 ? 0 : 2)} km² · ${count} LOADED`) });
      shape.areaKm2 = areaKm2;
      shape.loadedEntities = count;
      shape.coordinates = pointsToLonLat(points);
      toast(`AOI ${areaKm2.toFixed(1)} km² · ${count} loaded entities`);
    } else if (mode === 'radius') {
      const radius = geodesicDistanceMeters(points[0], points[1]);
      const count = countEntitiesInRadius(points[0], radius);
      state.dataSource.entities.add({
        id: `${prefix}-circle`,
        position: points[0],
        ellipse: { semiMajorAxis: radius, semiMinorAxis: radius, material: tacticalFill(0.16), outline: true, outlineColor: analysisColor(0.92) },
      });
      state.dataSource.entities.add({ id: `${prefix}-label`, position: points[1], label: labelOptions(`RADIUS · ${formatDistance(radius)} · ${count} LOADED`) });
      shape.radiusMeters = radius;
      shape.loadedEntities = count;
      shape.center = pointsToLonLat([points[0]])[0];
      toast(`RADIUS ${formatDistance(radius)} · ${count} loaded entities`);
    }

    state.shapes.push(shape);
    state.mode = null;
    state.points = [];
    state.hoverPoint = null;
    updateToolButtons();
    const instruction = $('rhk-tools-instruction');
    if (instruction) instruction.textContent = 'Measurement saved in this session. Export GeoJSON or choose another tool.';
  }

  function cancelDraft(update = true) {
    removePreview();
    state.points = [];
    state.hoverPoint = null;
    if (update) {
      state.mode = null;
      updateToolButtons();
      const instruction = $('rhk-tools-instruction');
      if (instruction) instruction.textContent = 'Select a tool. Measurements are local analysis overlays, not source data.';
    }
  }

  function pointInPolygon(lon, lat, coords) {
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i][0], yi = coords[i][1];
      const xj = coords[j][0], yj = coords[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-12) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function entityLonLat(entity, now) {
    if (!entity?.position?.getValue) return null;
    let point = null;
    try { point = entity.position.getValue(now); } catch (_) { return null; }
    if (!point) return null;
    const c = cartographic(point);
    return [state.Cesium.Math.toDegrees(c.longitude), state.Cesium.Math.toDegrees(c.latitude)];
  }

  function countEntitiesInPolygon(coords3) {
    const coords = coords3.map(([lon, lat]) => [lon, lat]);
    const now = state.Cesium.JulianDate.now();
    let count = 0;
    for (const entity of allEntities()) {
      const ll = entityLonLat(entity, now);
      if (ll && pointInPolygon(ll[0], ll[1], coords)) count += 1;
    }
    return count;
  }

  function countEntitiesInRadius(centerCartesian, radiusMeters) {
    const center = cartographic(centerCartesian);
    const now = state.Cesium.JulianDate.now();
    let count = 0;
    for (const entity of allEntities()) {
      if (!entity?.position?.getValue) continue;
      let point = null;
      try { point = entity.position.getValue(now); } catch (_) { continue; }
      if (!point) continue;
      const p = cartographic(point);
      const g = new state.Cesium.EllipsoidGeodesic(center, p);
      if (Number(g.surfaceDistance || Infinity) <= radiusMeters) count += 1;
    }
    return count;
  }

  function clearAll() {
    cancelDraft(true);
    state.shapes = [];
    if (state.dataSource) state.dataSource.entities.removeAll();
    toast('ANALYSIS OVERLAYS CLEARED');
  }

  function exportGeoJSON() {
    if (!state.shapes.length) return toast('NO ANALYSIS SHAPES TO EXPORT');
    const features = state.shapes.map((shape) => {
      if (shape.mode === 'path') {
        return {
          type: 'Feature',
          properties: { kind: 'path', distance_m: shape.distanceMeters, created_at: shape.createdAt },
          geometry: { type: 'LineString', coordinates: shape.coordinates.map(([lon, lat, h]) => [lon, lat, h]) },
        };
      }
      if (shape.mode === 'area') {
        const ring = shape.coordinates.map(([lon, lat, h]) => [lon, lat, h]);
        if (ring.length && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) ring.push([...ring[0]]);
        return {
          type: 'Feature',
          properties: { kind: 'area', area_km2: shape.areaKm2, loaded_entities_at_creation: shape.loadedEntities, created_at: shape.createdAt },
          geometry: { type: 'Polygon', coordinates: [ring] },
        };
      }
      const [lon, lat, h] = shape.center;
      return {
        type: 'Feature',
        properties: { kind: 'radius', radius_m: shape.radiusMeters, loaded_entities_at_creation: shape.loadedEntities, created_at: shape.createdAt },
        geometry: { type: 'Point', coordinates: [lon, lat, h] },
      };
    });
    const blob = new Blob([JSON.stringify({ type: 'FeatureCollection', features }, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rhkearth-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.geojson`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`EXPORTED ${features.length} ANALYSIS SHAPE${features.length === 1 ? '' : 'S'}`);
  }

  function onKeyDown(event) {
    if (event.defaultPrevented) return;
    const key = event.key;

    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
      return;
    }
    if (!isTyping(event.target) && key === '?') {
      event.preventDefault();
      openHelp();
      return;
    }
    if (!isTyping(event.target) && event.shiftKey && key.toLowerCase() === 'm') {
      event.preventDefault();
      setPanelOpen(true);
      setMode(state.mode === 'path' ? null : 'path');
      return;
    }
    if (key === 'Escape') {
      if (!$('rhk-asset-search')?.hidden) return closeSearch();
      if (!$('rhk-shortcuts-overlay')?.hidden) return closeHelp();
      if (state.mode) return cancelDraft(true);
      if (state.panelOpen) return setPanelOpen(false);
      return;
    }
    if (isTyping(event.target) || !state.mode) return;
    if (key === 'Enter' && (state.mode === 'path' || state.mode === 'area')) {
      event.preventDefault();
      finishDraft();
      return;
    }
    if (key === 'Backspace') {
      event.preventDefault();
      state.points.pop();
      renderDraft();
    }
  }

  function initWhenReady() {
    installUi();
    const started = Date.now();
    const tick = () => {
      const viewer = window.__godsEyeView?.viewer;
      const Cesium = window.Cesium;
      if (viewer && Cesium) {
        state.viewer = viewer;
        state.Cesium = Cesium;
        installDataSource();
        installDrawingHandler();
        document.addEventListener('keydown', onKeyDown, true);
        window.__rhkAnalysisTools = {
          open: () => setPanelOpen(true),
          search: openSearch,
          clear: clearAll,
          exportGeoJSON,
          getShapes: () => state.shapes.map((shape) => ({ ...shape })),
          countLoadedEntities: () => allEntities().length,
        };
        console.info('RHKEARTH analysis tools ready · OSIRIS-derived interaction pack');
        return;
      }
      if (Date.now() - started < 30_000) setTimeout(tick, 250);
      else console.warn('RHKEARTH analysis tools: Cesium viewer unavailable after 30s');
    };
    tick();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initWhenReady, { once: true });
  else initWhenReady();
})();
