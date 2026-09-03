(() => {
  'use strict';

  const SOURCE = Object.freeze({
    radar: {
      label: 'NOAA / NWS NEXRAD',
      service: 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer',
      capabilities: 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer?service=WMS&request=GetCapabilities&version=1.3.0',
      layer: '1',
      refreshMs: 120000,
    },
    alerts: {
      label: 'NOAA / National Weather Service',
      url: 'https://api.weather.gov/alerts/active?status=actual',
      refreshMs: 60000,
    },
    storms: {
      label: 'NOAA / National Hurricane Center',
      url: 'https://www.nhc.noaa.gov/CurrentStorms.json',
      refreshMs: 300000,
    },
    lightning: {
      label: 'NOAA nowCOAST / NWS OPC',
      service: 'https://nowcoast.noaa.gov/geoserver/observations/lightning_detection/ows',
      capabilities: 'https://nowcoast.noaa.gov/geoserver/observations/lightning_detection/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities',
      titlePattern: /lightning(?: strike)? density|lightning detection|lightning/i,
      refreshMs: 300000,
    },
    satellite: {
      label: 'NOAA / NESDIS via nowCOAST',
      service: 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WMSServer',
      capabilities: 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WMSServer?service=WMS&request=GetCapabilities&version=1.3.0',
      titlePattern: /longwave infrared|infrared.*mosaic|geostationary.*infrared/i,
      refreshMs: 300000,
    },
  });

  const state = {
    active: false,
    priorLayerIds: [],
    imagery: new Map(),
    dataSources: new Map(),
    stormKmlSources: [],
    timers: new Map(),
    radarTimes: [],
    radarFrame: 0,
    radarLoopTimer: null,
    radarLoopEnabled: true,
    layerNames: new Map(),
    lastSuccess: new Map(),
    latestProductTime: new Map(),
    failures: new Map(),
    entering: false,
  };

  const layerConfig = Object.freeze({
    radar: { label: 'RADAR LOOP', icon: 'radar', defaultOn: true },
    alerts: { label: 'STORM ALERTS', icon: 'warning', defaultOn: true },
    storms: { label: 'HURRICANES', icon: 'cyclone', defaultOn: true },
    lightning: { label: 'LIGHTNING DENSITY', icon: 'bolt', defaultOn: true },
    satellite: { label: 'SATELLITE IR', icon: 'satellite_alt', defaultOn: false },
  });

  function gev() { return window.__godsEyeView || null; }
  function cesium() { return window.Cesium || null; }
  function viewer() { return gev()?.viewer || null; }

  function fmtTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) return '—';
    return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function setStatus(id, status, detail = '') {
    const row = document.querySelector(`[data-rhk-weather-layer="${id}"]`);
    if (!row) return;
    const statusEl = row.querySelector('.rhk-weather-layer-status');
    if (statusEl) statusEl.textContent = status;
    if (detail) row.title = detail;
  }

  function markSuccess(id, productTime = null) {
    state.lastSuccess.set(id, new Date());
    state.failures.delete(id);
    if (productTime) state.latestProductTime.set(id, productTime);
    const product = state.latestProductTime.get(id);
    setStatus(id, product ? `LIVE · ${fmtTime(product)}` : `LIVE · ${fmtTime(new Date())}`);
    renderSourceLedger();
  }

  function markFailure(id, error) {
    state.failures.set(id, error instanceof Error ? error.message : String(error));
    setStatus(id, 'UNAVAILABLE', state.failures.get(id));
    renderSourceLedger();
  }

  function directChildText(element, tagName) {
    if (!element) return '';
    const wanted = tagName.toLowerCase();
    for (const child of element.children) {
      if (child.localName?.toLowerCase() === wanted) return (child.textContent || '').trim();
    }
    return '';
  }

  function layerTimeText(layer) {
    if (!layer) return '';
    for (const child of layer.children) {
      const local = child.localName?.toLowerCase();
      if (local !== 'dimension' && local !== 'extent') continue;
      if ((child.getAttribute('name') || '').toLowerCase() !== 'time') continue;
      return (child.textContent || '').trim();
    }
    return '';
  }

  function parseDurationMs(iso) {
    const match = /^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i.exec(String(iso || '').trim());
    if (!match) return null;
    const h = Number(match[1] || 0);
    const m = Number(match[2] || 0);
    const s = Number(match[3] || 0);
    const ms = ((h * 60 + m) * 60 + s) * 1000;
    return ms > 0 ? ms : null;
  }

  function parseTimeStops(text, max = 18) {
    const raw = String(text || '').trim();
    if (!raw) return [];
    const output = [];
    if (raw.includes(',')) {
      for (const token of raw.split(',')) {
        const d = new Date(token.trim());
        if (Number.isFinite(d.getTime())) output.push(d.toISOString());
      }
      return output.slice(-max);
    }
    const parts = raw.split('/');
    if (parts.length === 3) {
      const start = new Date(parts[0]);
      const end = new Date(parts[1]);
      const step = parseDurationMs(parts[2]);
      if (Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && step) {
        const endMs = end.getTime();
        const startMs = Math.max(start.getTime(), endMs - step * (max - 1));
        const alignedStart = endMs - Math.floor((endMs - startMs) / step) * step;
        for (let t = alignedStart; t <= endMs; t += step) output.push(new Date(t).toISOString());
        return output.slice(-max);
      }
    }
    const single = new Date(raw);
    return Number.isFinite(single.getTime()) ? [single.toISOString()] : [];
  }

  async function discoverWms(id, source, explicitLayer = null) {
    const response = await fetch(source.capabilities, { cache: 'no-store', mode: 'cors' });
    if (!response.ok) throw new Error(`${source.label} capabilities HTTP ${response.status}`);
    const xmlText = await response.text();
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    if (doc.querySelector('parsererror')) throw new Error(`${source.label} returned invalid WMS capabilities`);
    const layers = [...doc.querySelectorAll('Layer')];
    let chosen = null;
    if (explicitLayer) chosen = layers.find((layer) => directChildText(layer, 'Name') === explicitLayer) || null;
    else chosen = layers.find((layer) => source.titlePattern?.test(directChildText(layer, 'Title'))) || null;
    if (!chosen) throw new Error(`${source.label} target layer not found in current capabilities`);
    const name = directChildText(chosen, 'Name');
    const title = directChildText(chosen, 'Title') || name;
    if (!name) throw new Error(`${source.label} target WMS layer has no machine name`);
    const times = parseTimeStops(layerTimeText(chosen));
    state.layerNames.set(id, { name, title });
    if (times.length) state.latestProductTime.set(id, times.at(-1));
    return { name, title, times };
  }

  function removeImagery(id) {
    const v = viewer();
    const layer = state.imagery.get(id);
    if (v && layer) {
      try { v.imageryLayers.remove(layer, true); } catch { /* already removed */ }
    }
    state.imagery.delete(id);
  }

  async function setWmsImagery(id, source, layerName, time = null, alpha = 0.78) {
    const C = cesium();
    const v = viewer();
    if (!C || !v) throw new Error('Cesium viewer is not ready');
    const provider = new C.WebMapServiceImageryProvider({
      url: source.service,
      layers: layerName,
      parameters: { transparent: true, format: 'image/png', ...(time ? { time } : {}) },
      enablePickFeatures: false,
      credit: source.label,
    });
    const next = v.imageryLayers.addImageryProvider(provider);
    next.alpha = alpha;
    const prior = state.imagery.get(id);
    state.imagery.set(id, next);
    if (prior) {
      try { v.imageryLayers.remove(prior, true); } catch { /* ignore */ }
    }
    v.scene.requestRender?.();
  }

  function layerToggleOn(id) {
    return document.querySelector(`[data-rhk-weather-layer="${id}"] .rhk-weather-toggle`)?.getAttribute('aria-pressed') === 'true';
  }

  function setLayerToggle(id, on) {
    const button = document.querySelector(`[data-rhk-weather-layer="${id}"] .rhk-weather-toggle`);
    if (!button) return;
    button.setAttribute('aria-pressed', String(Boolean(on)));
    button.textContent = on ? 'ON' : 'OFF';
    button.classList.toggle('active', Boolean(on));
  }

  async function enableRadar() {
    setStatus('radar', 'CONNECTING');
    try {
      const info = await discoverWms('radar', SOURCE.radar, SOURCE.radar.layer);
      state.radarTimes = info.times;
      state.radarFrame = Math.max(0, state.radarTimes.length - 1);
      await setWmsImagery('radar', SOURCE.radar, info.name, state.radarTimes.at(-1) || null, 0.76);
      markSuccess('radar', state.radarTimes.at(-1) || null);
      syncRadarLoop();
    } catch (error) {
      try {
        await setWmsImagery('radar', SOURCE.radar, SOURCE.radar.layer, null, 0.76);
        state.radarTimes = [];
        markSuccess('radar');
      } catch (fallbackError) {
        markFailure('radar', fallbackError || error);
      }
    }
  }

  function syncRadarLoop() {
    clearInterval(state.radarLoopTimer);
    state.radarLoopTimer = null;
    if (!state.active || !state.radarLoopEnabled || !layerToggleOn('radar') || state.radarTimes.length < 2) return;
    const recent = state.radarTimes.slice(-12);
    let index = recent.length - 1;
    state.radarLoopTimer = setInterval(async () => {
      if (!state.active || !layerToggleOn('radar')) return;
      index = (index + 1) % recent.length;
      try {
        await setWmsImagery('radar', SOURCE.radar, state.layerNames.get('radar')?.name || SOURCE.radar.layer, recent[index], 0.76);
        state.latestProductTime.set('radar', recent[index]);
        setStatus('radar', `LOOP · ${fmtTime(recent[index])}`);
      } catch (error) {
        markFailure('radar', error);
      }
    }, 3000);
  }

  async function enableGenericWms(id, source, alpha) {
    setStatus(id, 'CONNECTING');
    try {
      const info = await discoverWms(id, source);
      await setWmsImagery(id, source, info.name, info.times.at(-1) || null, alpha);
      markSuccess(id, info.times.at(-1) || null);
    } catch (error) {
      markFailure(id, error);
      removeImagery(id);
    }
  }

  function stormAlertFeature(feature) {
    const event = String(feature?.properties?.event || '');
    return /(tornado|severe thunderstorm|flash flood|hurricane|tropical storm|storm surge|special marine warning)/i.test(event);
  }

  function alertColor(event) {
    const C = cesium();
    if (!C) return null;
    const text = String(event || '').toLowerCase();
    if (text.includes('tornado')) return C.Color.fromCssColorString('#ff3b30');
    if (text.includes('severe thunderstorm')) return C.Color.fromCssColorString('#ff9f0a');
    if (text.includes('flash flood')) return C.Color.fromCssColorString('#ff2d92');
    if (text.includes('hurricane')) return C.Color.fromCssColorString('#bf5af2');
    if (text.includes('tropical storm')) return C.Color.fromCssColorString('#64d2ff');
    if (text.includes('special marine')) return C.Color.fromCssColorString('#30d158');
    return C.Color.fromCssColorString('#ffd60a');
  }

  async function enableAlerts() {
    const C = cesium();
    const v = viewer();
    if (!C || !v) return;
    setStatus('alerts', 'CONNECTING');
    try {
      const response = await fetch(SOURCE.alerts.url, { cache: 'no-store', headers: { Accept: 'application/geo+json' } });
      if (!response.ok) throw new Error(`NWS alerts HTTP ${response.status}`);
      const payload = await response.json();
      const all = Array.isArray(payload?.features) ? payload.features : [];
      const stormAlerts = all.filter(stormAlertFeature);
      const mapped = stormAlerts.filter((f) => f?.geometry);
      const geojson = { type: 'FeatureCollection', features: mapped };
      const next = await C.GeoJsonDataSource.load(geojson, {
        clampToGround: true,
        stroke: C.Color.WHITE.withAlpha(0.9),
        fill: C.Color.WHITE.withAlpha(0.10),
        strokeWidth: 2,
      });
      next.name = 'RHKEARTH WEATHER · NWS ACTIVE STORM ALERTS';
      for (const entity of next.entities.values) {
        const props = entity.properties;
        const event = props?.event?.getValue?.() || '';
        const color = alertColor(event);
        if (entity.polygon && color) {
          entity.polygon.material = color.withAlpha(0.13);
          entity.polygon.outline = true;
          entity.polygon.outlineColor = color.withAlpha(0.95);
        }
        if (entity.polyline && color) entity.polyline.material = color.withAlpha(0.95);
      }
      const prior = state.dataSources.get('alerts');
      v.dataSources.add(next);
      state.dataSources.set('alerts', next);
      if (prior) v.dataSources.remove(prior, true);
      const newest = stormAlerts.map((f) => f?.properties?.sent || f?.properties?.effective || null).filter(Boolean).sort().at(-1) || null;
      state.alertSnapshot = stormAlerts;
      markSuccess('alerts', newest);
      setStatus('alerts', `LIVE · ${stormAlerts.length} ACTIVE · ${mapped.length} MAPPED`);
      renderWeatherSummary();
    } catch (error) {
      markFailure('alerts', error);
    }
  }

  function removeDataSource(id) {
    const v = viewer();
    const ds = state.dataSources.get(id);
    if (v && ds) {
      try { v.dataSources.remove(ds, true); } catch { /* ignore */ }
    }
    state.dataSources.delete(id);
  }

  function clearStormKml() {
    const v = viewer();
    if (!v) return;
    for (const ds of state.stormKmlSources) {
      try { v.dataSources.remove(ds, true); } catch { /* ignore */ }
    }
    state.stormKmlSources = [];
  }

  async function loadOfficialStormKml(url, name) {
    const C = cesium();
    const v = viewer();
    if (!C || !v || !url) return false;
    try {
      const ds = await C.KmlDataSource.load(url, { camera: v.scene.camera, canvas: v.scene.canvas, clampToGround: true });
      ds.name = name;
      await v.dataSources.add(ds);
      state.stormKmlSources.push(ds);
      return true;
    } catch (error) {
      console.warn('[RHKEARTH WEATHER] Official NHC KML unavailable', url, error);
      return false;
    }
  }

  async function enableStorms() {
    const C = cesium();
    const v = viewer();
    if (!C || !v) return;
    setStatus('storms', 'CONNECTING');
    try {
      const response = await fetch(SOURCE.storms.url, { cache: 'no-store', mode: 'cors' });
      if (!response.ok) throw new Error(`NHC CurrentStorms HTTP ${response.status}`);
      const payload = await response.json();
      const storms = Array.isArray(payload?.activeStorms) ? payload.activeStorms : [];
      const next = new C.CustomDataSource('RHKEARTH WEATHER · NHC ACTIVE CYCLONES');
      for (const storm of storms) {
        const lat = Number(storm.latitudeNumeric);
        const lon = Number(storm.longitudeNumeric);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        const intensity = Number(storm.intensity);
        const pressure = Number(storm.pressure);
        const motion = Number(storm.movementDir);
        const motionSpeed = Number(storm.movementSpeed);
        const summary = [
          storm.classification ? `CLASS ${storm.classification}` : null,
          Number.isFinite(intensity) ? `${intensity} KT` : null,
          Number.isFinite(pressure) ? `${pressure} MB` : null,
          Number.isFinite(motion) && Number.isFinite(motionSpeed) ? `MOV ${motion}° @ ${motionSpeed} KT` : null,
          storm.lastUpdate ? `NHC ${fmtTime(storm.lastUpdate)}` : null,
        ].filter(Boolean).join(' · ');
        next.entities.add({
          id: `nhc-${storm.id}`,
          position: C.Cartesian3.fromDegrees(lon, lat, 0),
          point: { pixelSize: 11, color: C.Color.WHITE, outlineColor: C.Color.BLACK, outlineWidth: 3, disableDepthTestDistance: Number.POSITIVE_INFINITY },
          label: {
            text: `${String(storm.name || storm.id).toUpperCase()} · ${storm.classification || 'TC'}${Number.isFinite(intensity) ? ` · ${intensity} KT` : ''}`,
            font: '600 12px JetBrains Mono, monospace', fillColor: C.Color.WHITE, outlineColor: C.Color.BLACK, outlineWidth: 3,
            style: C.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new C.Cartesian2(0, -24), disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          description: `<strong>${escapeHtml(storm.name || storm.id)}</strong><br>${escapeHtml(summary)}<br>Source: NOAA / National Hurricane Center`,
          properties: { source: SOURCE.storms.label, raw: JSON.stringify(storm) },
        });
      }
      const prior = state.dataSources.get('storms');
      await v.dataSources.add(next);
      state.dataSources.set('storms', next);
      if (prior) v.dataSources.remove(prior, true);
      clearStormKml();
      let kmlLoaded = 0;
      for (const storm of storms) {
        if (storm?.forecastTrack?.kmzFile && await loadOfficialStormKml(storm.forecastTrack.kmzFile, `NHC ${storm.name} forecast track`)) kmlLoaded += 1;
        if (storm?.trackCone?.kmzFile && await loadOfficialStormKml(storm.trackCone.kmzFile, `NHC ${storm.name} forecast cone`)) kmlLoaded += 1;
      }
      state.stormSnapshot = storms;
      const newest = storms.map((s) => s.lastUpdate).filter(Boolean).sort().at(-1) || null;
      markSuccess('storms', newest);
      setStatus('storms', `LIVE · ${storms.length} ACTIVE · ${kmlLoaded} NHC GIS LAYERS`);
      renderWeatherSummary();
    } catch (error) {
      markFailure('storms', error);
    }
  }

  async function disableWeatherLayer(id) {
    if (id === 'radar') {
      removeImagery('radar');
      clearInterval(state.radarLoopTimer);
      state.radarLoopTimer = null;
    } else if (id === 'lightning' || id === 'satellite') removeImagery(id);
    else if (id === 'alerts') { removeDataSource('alerts'); state.alertSnapshot = []; }
    else if (id === 'storms') { removeDataSource('storms'); clearStormKml(); state.stormSnapshot = []; }
    clearInterval(state.timers.get(id));
    state.timers.delete(id);
    setStatus(id, 'OFF');
    renderWeatherSummary();
  }

  async function refreshWeatherLayer(id) {
    if (!state.active || !layerToggleOn(id)) return;
    if (id === 'radar') return enableRadar();
    if (id === 'alerts') return enableAlerts();
    if (id === 'storms') return enableStorms();
    if (id === 'lightning') return enableGenericWms('lightning', SOURCE.lightning, 0.82);
    if (id === 'satellite') return enableGenericWms('satellite', SOURCE.satellite, 0.58);
  }

  async function enableWeatherLayer(id) {
    setLayerToggle(id, true);
    await refreshWeatherLayer(id);
    clearInterval(state.timers.get(id));
    const interval = SOURCE[id]?.refreshMs;
    if (interval) state.timers.set(id, setInterval(() => refreshWeatherLayer(id), interval));
  }

  async function toggleWeatherLayer(id) {
    const next = !layerToggleOn(id);
    setLayerToggle(id, next);
    if (next) await enableWeatherLayer(id);
    else await disableWeatherLayer(id);
  }

  async function saveAndClearOperationalLayers() {
    const dm = gev()?.dataManager;
    if (!dm?.layers || typeof dm.setEnabled !== 'function') return;
    state.priorLayerIds = [...dm.layers.entries()].filter(([, entry]) => entry?.enabled === true).map(([id]) => id);
    for (const id of state.priorLayerIds) {
      try { await dm.setEnabled(id, false, { origin: 'programmatic' }); } catch (error) { console.warn('[RHKEARTH WEATHER] Could not suspend layer', id, error); }
    }
  }

  async function restoreOperationalLayers() {
    const dm = gev()?.dataManager;
    if (!dm?.layers || typeof dm.setEnabled !== 'function') return;
    for (const id of state.priorLayerIds) {
      if (!dm.layers.has(id)) continue;
      try { await dm.setEnabled(id, true, { origin: 'programmatic' }); } catch (error) { console.warn('[RHKEARTH WEATHER] Could not restore layer', id, error); }
    }
    state.priorLayerIds = [];
  }

  function setBrand(weatherOn) {
    const h1 = document.querySelector('#title-bar h1');
    if (h1) {
      const spans = [...h1.children].filter((el) => !el.classList.contains('title-logo'));
      if (spans[0]) spans[0].textContent = weatherOn ? 'RHKEARTH WEATHER' : 'RHKEARTH';
    }
    const subtitle = document.querySelector('#title-bar .subtitle');
    if (subtitle) subtitle.textContent = weatherOn ? 'LIVE METEOROLOGICAL DASHBOARD' : 'INTELLIGENCE CONSOLE';
    const clear = document.querySelector('#rhkearth-clear-emblem span');
    if (clear) clear.textContent = weatherOn ? 'RHKEARTH WEATHER' : 'RHKEARTH';
    document.title = weatherOn ? 'RHKEARTH WEATHER' : 'RHKEARTH // Intelligence Console';
  }

  function renderSourceLedger() {
    const ledger = document.getElementById('rhk-weather-ledger');
    if (!ledger) return;
    ledger.innerHTML = Object.entries(SOURCE).map(([id, source]) => {
      const success = state.lastSuccess.get(id);
      const product = state.latestProductTime.get(id);
      const failure = state.failures.get(id);
      return `<div class="rhk-weather-source-row"><span>${escapeHtml(source.label)}</span><strong>${failure ? 'FEED ERROR' : product ? fmtTime(product) : success ? fmtTime(success) : 'NOT SYNCED'}</strong></div>`;
    }).join('');
  }

  function renderWeatherSummary() {
    const box = document.getElementById('rhk-weather-summary');
    if (!box) return;
    const storms = Array.isArray(state.stormSnapshot) ? state.stormSnapshot : [];
    const alerts = Array.isArray(state.alertSnapshot) ? state.alertSnapshot : [];
    const stormLines = storms.slice(0, 6).map((storm) => {
      const intensity = Number(storm.intensity);
      return `<div class="rhk-weather-event"><strong>${escapeHtml(String(storm.name || storm.id).toUpperCase())}</strong><span>${escapeHtml(storm.classification || 'TC')}${Number.isFinite(intensity) ? ` · ${intensity} KT` : ''}${storm.lastUpdate ? ` · ${fmtTime(storm.lastUpdate)}` : ''}</span></div>`;
    });
    const alertLines = alerts.slice(0, 6).map((feature) => {
      const p = feature.properties || {};
      return `<div class="rhk-weather-event"><strong>${escapeHtml(p.event || 'NWS ALERT')}</strong><span>${escapeHtml(p.areaDesc || '')}${p.expires ? ` · EXP ${fmtTime(p.expires)}` : ''}</span></div>`;
    });
    box.innerHTML = [...stormLines, ...alertLines].join('') || '<div class="rhk-weather-empty">NO ACTIVE TROPICAL CYCLONES OR SELECTED STORM WARNINGS IN CURRENT FEEDS</div>';
  }

  function ensureWeatherPanel() {
    if (document.getElementById('rhk-weather-panel')) return;
    const stack = document.getElementById('left-panel-stack') || document.body;
    const panel = document.createElement('div');
    panel.id = 'rhk-weather-panel';
    panel.innerHTML = `
      <div class="rhk-weather-panel-header"><div><span class="material-symbols-outlined" aria-hidden="true">cloud</span><strong>WEATHER</strong></div><span id="rhk-weather-live-chip">OFFICIAL LIVE FEEDS</span></div>
      <div class="rhk-weather-layer-list">${Object.entries(layerConfig).map(([id, config]) => `<div class="rhk-weather-layer" data-rhk-weather-layer="${id}"><div class="rhk-weather-layer-main"><span class="material-symbols-outlined">${config.icon}</span><span>${config.label}</span></div><button class="rhk-weather-toggle" type="button" aria-pressed="false">OFF</button><div class="rhk-weather-layer-status">OFF</div></div>`).join('')}</div>
      <div class="rhk-weather-tools"><button id="rhk-weather-radar-loop" type="button" aria-pressed="true"><span class="material-symbols-outlined">pause_circle</span>RADAR ANIMATION ON</button><button id="rhk-weather-refresh" type="button"><span class="material-symbols-outlined">refresh</span>REFRESH ALL</button></div>
      <div class="rhk-weather-section-label">ACTIVE WEATHER</div><div id="rhk-weather-summary"></div>
      <div class="rhk-weather-section-label">SOURCE / PRODUCT TIME</div><div id="rhk-weather-ledger"></div>
      <div class="rhk-weather-disclaimer">PUBLIC NOAA / NWS / NHC DATA. PRODUCT TIMES ARE SHOWN WHEN THE SOURCE EXPOSES THEM. UNAVAILABLE FEEDS ARE MARKED UNAVAILABLE — NEVER SIMULATED.</div>`;
    stack.prepend(panel);
    panel.querySelectorAll('[data-rhk-weather-layer]').forEach((row) => {
      const id = row.dataset.rhkWeatherLayer;
      row.querySelector('.rhk-weather-toggle')?.addEventListener('click', () => toggleWeatherLayer(id));
    });
    document.getElementById('rhk-weather-radar-loop')?.addEventListener('click', () => {
      state.radarLoopEnabled = !state.radarLoopEnabled;
      const button = document.getElementById('rhk-weather-radar-loop');
      button?.setAttribute('aria-pressed', String(state.radarLoopEnabled));
      if (button) button.innerHTML = `<span class="material-symbols-outlined">${state.radarLoopEnabled ? 'pause_circle' : 'play_circle'}</span>RADAR ANIMATION ${state.radarLoopEnabled ? 'ON' : 'OFF'}`;
      if (state.radarLoopEnabled) syncRadarLoop();
      else { clearInterval(state.radarLoopTimer); state.radarLoopTimer = null; if (layerToggleOn('radar')) refreshWeatherLayer('radar'); }
    });
    document.getElementById('rhk-weather-refresh')?.addEventListener('click', async () => {
      for (const id of Object.keys(layerConfig)) if (layerToggleOn(id)) await refreshWeatherLayer(id);
    });
    renderSourceLedger();
    renderWeatherSummary();
  }

  function ensureWeatherButton() {
    if (document.getElementById('rhk-weather-mode-toggle')) return;
    const display = document.getElementById('pp-toggles');
    if (!display) return;
    const cleanButton = document.getElementById('clean-view-toggle');
    const group = document.createElement('div');
    group.className = 'pp-toggle-group rhk-weather-mode-group';
    group.innerHTML = `<button class="pp-toggle-btn" id="rhk-weather-mode-toggle" type="button" aria-pressed="false" title="Switch to RHKEARTH Weather live dashboard"><span class="pp-icon material-symbols-outlined" aria-hidden="true">cloud</span><span class="pp-label">Weather</span></button>`;
    if (cleanButton?.parentElement === display) display.insertBefore(group, cleanButton);
    else cleanButton?.parentElement?.insertAdjacentElement('afterend', group) || display.appendChild(group);
    document.getElementById('rhk-weather-mode-toggle')?.addEventListener('click', toggleWeatherMode);
  }

  async function enterWeatherMode() {
    if (state.active || state.entering) return;
    state.entering = true;
    try {
      ensureWeatherPanel();
      document.body.classList.add('rhk-weather-mode');
      setBrand(true);
      const modeButton = document.getElementById('rhk-weather-mode-toggle');
      modeButton?.classList.add('active');
      modeButton?.setAttribute('aria-pressed', 'true');
      await saveAndClearOperationalLayers();
      state.active = true;
      for (const [id, config] of Object.entries(layerConfig)) {
        setLayerToggle(id, config.defaultOn);
        if (config.defaultOn) await enableWeatherLayer(id);
      }
      renderSourceLedger();
      renderWeatherSummary();
    } finally { state.entering = false; }
  }

  async function exitWeatherMode() {
    if (!state.active || state.entering) return;
    state.entering = true;
    try {
      state.active = false;
      for (const id of Object.keys(layerConfig)) await disableWeatherLayer(id);
      for (const timer of state.timers.values()) clearInterval(timer);
      state.timers.clear();
      clearInterval(state.radarLoopTimer);
      state.radarLoopTimer = null;
      document.body.classList.remove('rhk-weather-mode');
      setBrand(false);
      const modeButton = document.getElementById('rhk-weather-mode-toggle');
      modeButton?.classList.remove('active');
      modeButton?.setAttribute('aria-pressed', 'false');
      await restoreOperationalLayers();
    } finally { state.entering = false; }
  }

  async function toggleWeatherMode() {
    if (state.entering) return;
    if (state.active) await exitWeatherMode();
    else await enterWeatherMode();
  }

  function boot() {
    ensureWeatherButton();
    ensureWeatherPanel();
    if (!gev()?.viewer || !gev()?.dataManager) return false;
    window.__rhkearthWeather = {
      enter: enterWeatherMode,
      exit: exitWeatherMode,
      toggle: toggleWeatherMode,
      refresh: () => document.getElementById('rhk-weather-refresh')?.click(),
      getState: () => ({
        active: state.active,
        enabled: Object.keys(layerConfig).filter(layerToggleOn),
        lastSuccess: Object.fromEntries([...state.lastSuccess.entries()].map(([k, v]) => [k, v.toISOString()])),
        latestProductTime: Object.fromEntries(state.latestProductTime),
        failures: Object.fromEntries(state.failures),
      }),
      sources: SOURCE,
    };
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    ensureWeatherButton();
    ensureWeatherPanel();
    if (boot() || attempts > 240) clearInterval(timer);
  }, 250);
  window.addEventListener('DOMContentLoaded', () => { ensureWeatherButton(); ensureWeatherPanel(); boot(); });
})();
