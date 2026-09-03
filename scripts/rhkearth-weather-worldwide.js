(() => {
  'use strict';

  const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
  const EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms&status=open&limit=100';
  const CONDITIONS_REFRESH_MS = 120000;
  const STORMS_REFRESH_MS = 300000;

  const state = {
    installed: false,
    active: false,
    conditionsTimer: null,
    stormsTimer: null,
    moveTimer: null,
    cameraRemove: null,
    modeObserver: null,
    stormDataSource: null,
    conditionsRequest: 0,
    stormsRequest: 0,
    lastCenter: null,
    lastConditionsAt: null,
    lastStormsAt: null,
  };

  function gev() { return window.__godsEyeView || null; }
  function viewer() { return gev()?.viewer || null; }
  function C() { return window.Cesium || null; }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function fmtUtc(value) {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isFinite(d.getTime())
      ? d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z')
      : '—';
  }

  function weatherCodeLabel(code) {
    const n = Number(code);
    if (n === 0) return 'CLEAR';
    if ([1, 2].includes(n)) return 'PARTLY CLOUDY';
    if (n === 3) return 'OVERCAST';
    if ([45, 48].includes(n)) return 'FOG';
    if ([51, 53, 55, 56, 57].includes(n)) return 'DRIZZLE';
    if ([61, 63, 65, 66, 67].includes(n)) return 'RAIN';
    if ([71, 73, 75, 77].includes(n)) return 'SNOW';
    if ([80, 81, 82].includes(n)) return 'RAIN SHOWERS';
    if ([85, 86].includes(n)) return 'SNOW SHOWERS';
    if ([95, 96, 99].includes(n)) return 'THUNDERSTORM';
    return 'CONDITIONS';
  }

  function centeredCoordinates() {
    const v = viewer();
    const Cesium = C();
    if (!v || !Cesium) return null;
    const canvas = v.scene?.canvas;
    try {
      if (canvas) {
        const pixel = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
        const ray = v.camera.getPickRay(pixel);
        let point = ray && v.scene.globe?.show ? v.scene.globe.pick(ray, v.scene) : null;
        if (!point) point = v.camera.pickEllipsoid(pixel, Cesium.Ellipsoid.WGS84);
        if (point) {
          const carto = Cesium.Cartographic.fromCartesian(point);
          return {
            lat: Cesium.Math.toDegrees(carto.latitude),
            lon: Cesium.Math.toDegrees(carto.longitude),
          };
        }
      }
      const carto = v.camera.positionCartographic;
      if (carto) {
        return {
          lat: Cesium.Math.toDegrees(carto.latitude),
          lon: Cesium.Math.toDegrees(carto.longitude),
        };
      }
    } catch (error) {
      console.warn('[RHKEARTH WEATHER WORLD] Could not resolve map center', error);
    }
    return null;
  }

  function ensureStyle() {
    if (document.getElementById('rhk-weather-world-style')) return;
    const style = document.createElement('style');
    style.id = 'rhk-weather-world-style';
    style.textContent = `
      #rhk-weather-global-conditions,
      #rhk-weather-global-storms,
      #rhk-weather-world-ledger { padding: 0 11px 8px; }
      .rhk-weather-world-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0,1fr));
        gap: 1px;
        border: 1px solid rgba(169,181,155,.10);
        background: rgba(169,181,155,.06);
      }
      .rhk-weather-world-cell {
        min-width: 0;
        padding: 7px 8px;
        background: rgba(8,10,9,.96);
      }
      .rhk-weather-world-cell span,
      .rhk-weather-world-cell strong { display: block; }
      .rhk-weather-world-cell span {
        color: rgba(239,239,233,.38);
        font-size: 6.5px;
        letter-spacing: .09em;
      }
      .rhk-weather-world-cell strong {
        margin-top: 3px;
        overflow: hidden;
        color: rgba(239,239,233,.88);
        font-size: 8px;
        font-weight: 500;
        letter-spacing: .04em;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .rhk-weather-world-position {
        padding: 0 0 7px;
        color: rgba(239,239,233,.48);
        font-size: 7px;
        line-height: 1.4;
      }
      .rhk-weather-world-storm {
        display: grid;
        grid-template-columns: minmax(0,1fr) auto;
        gap: 4px 8px;
        padding: 7px 0;
        border-top: 1px solid rgba(169,181,155,.09);
      }
      .rhk-weather-world-storm strong {
        overflow: hidden;
        color: rgba(239,239,233,.88);
        font-size: 8px;
        font-weight: 500;
        letter-spacing: .05em;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .rhk-weather-world-storm time {
        color: rgba(239,239,233,.38);
        font-size: 6.5px;
      }
      .rhk-weather-world-storm span {
        grid-column: 1 / -1;
        color: rgba(239,239,233,.43);
        font-size: 6.8px;
        line-height: 1.35;
      }
      .rhk-weather-world-note {
        padding: 7px 0;
        color: rgba(239,239,233,.38);
        font-size: 6.8px;
        line-height: 1.45;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureUi() {
    const panel = document.getElementById('rhk-weather-panel');
    if (!panel) return false;
    ensureStyle();

    const liveChip = document.getElementById('rhk-weather-live-chip');
    if (liveChip) liveChip.textContent = 'WORLDWIDE CORE · REGIONAL OFFICIAL FEEDS';

    const relabel = [
      ['radar', 'RADAR LOOP · U.S. NEXRAD'],
      ['alerts', 'STORM ALERTS · U.S. NWS'],
      ['storms', 'HURRICANES · NHC BASINS'],
    ];
    for (const [id, label] of relabel) {
      const text = panel.querySelector(`[data-rhk-weather-layer="${id}"] .rhk-weather-layer-main span:last-child`);
      if (text) text.textContent = label;
    }

    if (!document.getElementById('rhk-weather-global-conditions')) {
      const tools = panel.querySelector('.rhk-weather-tools');
      const block = document.createElement('div');
      block.id = 'rhk-weather-world-block';
      block.innerHTML = `
        <div class="rhk-weather-section-label">WORLDWIDE CONDITIONS · MAP CENTER</div>
        <div id="rhk-weather-global-conditions"><div class="rhk-weather-world-note">MOVE THE MAP TO SAMPLE LIVE CONDITIONS ANYWHERE ON EARTH.</div></div>
        <div class="rhk-weather-section-label">GLOBAL SEVERE STORMS · NASA EONET</div>
        <div id="rhk-weather-global-storms"><div class="rhk-weather-world-note">NOT SYNCED</div></div>
        <div class="rhk-weather-section-label">WORLDWIDE SOURCE / PRODUCT TIME</div>
        <div id="rhk-weather-world-ledger">
          <div class="rhk-weather-source-row"><span>OPEN-METEO · GLOBAL CURRENT CONDITIONS</span><strong id="rhk-world-conditions-time">NOT SYNCED</strong></div>
          <div class="rhk-weather-source-row"><span>NASA EONET · GLOBAL SEVERE-STORM EVENTS</span><strong id="rhk-world-storms-time">NOT SYNCED</strong></div>
        </div>`;
      if (tools) tools.insertAdjacentElement('afterend', block);
      else panel.appendChild(block);
    }
    return true;
  }

  function renderConditions(payload, center) {
    const host = document.getElementById('rhk-weather-global-conditions');
    if (!host) return;
    const current = payload?.current || {};
    const units = payload?.current_units || {};
    const rows = [
      ['TEMP', Number.isFinite(Number(current.temperature_2m)) ? `${Number(current.temperature_2m).toFixed(1)}${units.temperature_2m || '°C'}` : '—'],
      ['FEELS', Number.isFinite(Number(current.apparent_temperature)) ? `${Number(current.apparent_temperature).toFixed(1)}${units.apparent_temperature || '°C'}` : '—'],
      ['WIND', Number.isFinite(Number(current.wind_speed_10m)) ? `${Number(current.wind_speed_10m).toFixed(0)} ${units.wind_speed_10m || 'kn'}` : '—'],
      ['GUST', Number.isFinite(Number(current.wind_gusts_10m)) ? `${Number(current.wind_gusts_10m).toFixed(0)} ${units.wind_gusts_10m || 'kn'}` : '—'],
      ['PRESSURE', Number.isFinite(Number(current.surface_pressure)) ? `${Number(current.surface_pressure).toFixed(0)} ${units.surface_pressure || 'hPa'}` : '—'],
      ['CLOUD', Number.isFinite(Number(current.cloud_cover)) ? `${Number(current.cloud_cover).toFixed(0)}${units.cloud_cover || '%'}` : '—'],
      ['PRECIP', Number.isFinite(Number(current.precipitation)) ? `${Number(current.precipitation).toFixed(1)} ${units.precipitation || 'mm'}` : '—'],
      ['SKY', weatherCodeLabel(current.weather_code)],
    ];
    const direction = Number(current.wind_direction_10m);
    host.innerHTML = `
      <div class="rhk-weather-world-position">${center.lat.toFixed(3)}°, ${center.lon.toFixed(3)}° · ${Number.isFinite(direction) ? `WIND ${Math.round(direction)}° · ` : ''}${fmtUtc(current.time || new Date())}</div>
      <div class="rhk-weather-world-grid">${rows.map(([label, value]) => `<div class="rhk-weather-world-cell"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>`;
  }

  async function refreshConditions() {
    if (!state.active) return;
    const center = centeredCoordinates();
    if (!center || !Number.isFinite(center.lat) || !Number.isFinite(center.lon)) return;
    state.lastCenter = center;
    const request = ++state.conditionsRequest;
    const host = document.getElementById('rhk-weather-global-conditions');
    if (host && !host.querySelector('.rhk-weather-world-grid')) host.innerHTML = '<div class="rhk-weather-world-note">SYNCING GLOBAL CONDITIONS…</div>';

    const url = new URL(OPEN_METEO_URL);
    url.searchParams.set('latitude', center.lat.toFixed(4));
    url.searchParams.set('longitude', center.lon.toFixed(4));
    url.searchParams.set('current', 'temperature_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m');
    url.searchParams.set('wind_speed_unit', 'kn');
    url.searchParams.set('timezone', 'UTC');

    try {
      const response = await fetch(url, { cache: 'no-store', mode: 'cors' });
      if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
      const payload = await response.json();
      if (request !== state.conditionsRequest || !state.active) return;
      renderConditions(payload, center);
      state.lastConditionsAt = payload?.current?.time || new Date().toISOString();
      const time = document.getElementById('rhk-world-conditions-time');
      if (time) time.textContent = fmtUtc(state.lastConditionsAt);
    } catch (error) {
      if (request !== state.conditionsRequest) return;
      if (host) host.innerHTML = `<div class="rhk-weather-world-note">GLOBAL CONDITIONS UNAVAILABLE · ${escapeHtml(error?.message || error)}</div>`;
      const time = document.getElementById('rhk-world-conditions-time');
      if (time) time.textContent = 'FEED ERROR';
    }
  }

  function flattenCoordinatePairs(value, out) {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]))) {
      out.push([Number(value[0]), Number(value[1])]);
      return;
    }
    for (const child of value) flattenCoordinatePairs(child, out);
  }

  function geometryCenter(geometry) {
    if (!geometry) return null;
    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
      const lon = Number(geometry.coordinates[0]);
      const lat = Number(geometry.coordinates[1]);
      return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
    }
    const pairs = [];
    flattenCoordinatePairs(geometry.coordinates, pairs);
    if (!pairs.length) return null;
    const lon = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length;
    const lat = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length;
    return { lat, lon };
  }

  function latestEventPosition(event) {
    const geometries = Array.isArray(event?.geometry) ? event.geometry : [];
    const sorted = [...geometries].sort((a, b) => Date.parse(a?.date || 0) - Date.parse(b?.date || 0));
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      const center = geometryCenter(sorted[i]);
      if (center) return { ...center, date: sorted[i]?.date || null };
    }
    return null;
  }

  async function installStormDataSource(events) {
    const v = viewer();
    const Cesium = C();
    if (!v || !Cesium) return;
    if (state.stormDataSource) {
      try { v.dataSources.remove(state.stormDataSource, true); } catch { /* ignore */ }
      state.stormDataSource = null;
    }
    const ds = new Cesium.CustomDataSource('RHKEARTH WEATHER · GLOBAL SEVERE STORMS · NASA EONET');
    for (const event of events) {
      const pos = latestEventPosition(event);
      if (!pos) continue;
      ds.entities.add({
        id: `rhk-world-storm-${event.id}`,
        position: Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, 0),
        point: {
          pixelSize: 9,
          color: Cesium.Color.WHITE.withAlpha(0.94),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: String(event.title || event.id || 'SEVERE STORM').toUpperCase(),
          font: '600 10px JetBrains Mono, monospace',
          fillColor: Cesium.Color.WHITE.withAlpha(0.92),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -19),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        description: `<strong>${escapeHtml(event.title || event.id)}</strong><br>${escapeHtml(event.description || 'NASA EONET open severe-storm event')}<br>Source: NASA EONET`,
        properties: { source: 'NASA EONET', eventId: event.id || '' },
      });
    }
    await v.dataSources.add(ds);
    if (!state.active) {
      try { v.dataSources.remove(ds, true); } catch { /* ignore */ }
      return;
    }
    state.stormDataSource = ds;
    v.scene.requestRender?.();
  }

  function renderGlobalStorms(events) {
    const host = document.getElementById('rhk-weather-global-storms');
    if (!host) return;
    const positioned = events
      .map((event) => ({ event, pos: latestEventPosition(event) }))
      .filter((item) => item.pos)
      .sort((a, b) => Date.parse(b.pos.date || 0) - Date.parse(a.pos.date || 0));
    host.innerHTML = positioned.length
      ? positioned.slice(0, 8).map(({ event, pos }) => `
          <div class="rhk-weather-world-storm">
            <strong>${escapeHtml(String(event.title || event.id || 'SEVERE STORM').toUpperCase())}</strong>
            <time>${escapeHtml(pos.date ? fmtUtc(pos.date) : 'OPEN')}</time>
            <span>${pos.lat.toFixed(2)}°, ${pos.lon.toFixed(2)}° · GLOBAL EVENT METADATA, NOT A LOCAL WARNING</span>
          </div>`).join('')
      : '<div class="rhk-weather-world-note">NO OPEN SEVERE-STORM EVENTS WITH MAPPABLE GEOMETRY IN THE CURRENT EONET FEED.</div>';
  }

  async function refreshStorms() {
    if (!state.active) return;
    const request = ++state.stormsRequest;
    const host = document.getElementById('rhk-weather-global-storms');
    if (host && !host.querySelector('.rhk-weather-world-storm')) host.innerHTML = '<div class="rhk-weather-world-note">SYNCING GLOBAL SEVERE STORMS…</div>';
    try {
      const response = await fetch(EONET_URL, { cache: 'no-store', mode: 'cors' });
      if (!response.ok) throw new Error(`NASA EONET HTTP ${response.status}`);
      const payload = await response.json();
      if (request !== state.stormsRequest || !state.active) return;
      const events = Array.isArray(payload?.events) ? payload.events : [];
      renderGlobalStorms(events);
      await installStormDataSource(events);
      const newest = events
        .flatMap((event) => Array.isArray(event?.geometry) ? event.geometry.map((g) => g?.date).filter(Boolean) : [])
        .sort()
        .at(-1) || new Date().toISOString();
      state.lastStormsAt = newest;
      const time = document.getElementById('rhk-world-storms-time');
      if (time) time.textContent = `${events.length} OPEN · ${fmtUtc(newest)}`;
    } catch (error) {
      if (request !== state.stormsRequest) return;
      if (host) host.innerHTML = `<div class="rhk-weather-world-note">GLOBAL STORM FEED UNAVAILABLE · ${escapeHtml(error?.message || error)}</div>`;
      const time = document.getElementById('rhk-world-storms-time');
      if (time) time.textContent = 'FEED ERROR';
    }
  }

  function scheduleCenterRefresh() {
    if (!state.active) return;
    clearTimeout(state.moveTimer);
    state.moveTimer = setTimeout(refreshConditions, 550);
  }

  function activate() {
    if (state.active) return;
    state.active = true;
    ensureUi();
    refreshConditions();
    refreshStorms();
    clearInterval(state.conditionsTimer);
    clearInterval(state.stormsTimer);
    state.conditionsTimer = setInterval(refreshConditions, CONDITIONS_REFRESH_MS);
    state.stormsTimer = setInterval(refreshStorms, STORMS_REFRESH_MS);
  }

  function deactivate() {
    if (!state.active) return;
    state.active = false;
    state.conditionsRequest += 1;
    state.stormsRequest += 1;
    clearTimeout(state.moveTimer);
    clearInterval(state.conditionsTimer);
    clearInterval(state.stormsTimer);
    state.conditionsTimer = null;
    state.stormsTimer = null;
    const v = viewer();
    if (v && state.stormDataSource) {
      try { v.dataSources.remove(state.stormDataSource, true); } catch { /* ignore */ }
    }
    state.stormDataSource = null;
  }

  function syncMode() {
    ensureUi();
    if (document.body.classList.contains('rhk-weather-mode')) activate();
    else deactivate();
  }

  function install() {
    if (state.installed) return true;
    if (!viewer() || !C() || !ensureUi()) return false;
    state.installed = true;
    const v = viewer();
    const remove = v.camera.moveEnd.addEventListener(scheduleCenterRefresh);
    state.cameraRemove = typeof remove === 'function' ? remove : null;
    state.modeObserver = new MutationObserver(syncMode);
    state.modeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.__rhkearthWeatherWorldwide = {
      refresh: async () => { await Promise.all([refreshConditions(), refreshStorms()]); },
      getState: () => ({
        active: state.active,
        center: state.lastCenter,
        conditionsTime: state.lastConditionsAt,
        stormsTime: state.lastStormsAt,
      }),
      sources: {
        conditions: 'Open-Meteo global current conditions',
        severeStorms: 'NASA EONET global severe-storm events',
      },
    };
    syncMode();
    return true;
  }

  let attempts = 0;
  const bootTimer = setInterval(() => {
    attempts += 1;
    if (install() || attempts > 240) clearInterval(bootTimer);
  }, 250);
  window.addEventListener('DOMContentLoaded', install);
})();
