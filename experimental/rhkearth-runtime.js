(() => {
  const nativeFetch = window.fetch.bind(window);
  const DATA_ROOT = '/experimental-data';

  // RHKEARTH is a direct-entry console, not an onboarding demo. Suppress the
  // upstream first-run mission launcher before the application initializes.
  try {
    window.localStorage?.setItem('gev:first-run-mission:v1', 'suppressed');
    window.sessionStorage?.setItem('gev:first-run-mission-session:v1', 'dismissed');
  } catch {
    // Storage can be blocked in hardened/private browser contexts; DOM removal
    // below is the second line of defense.
  }

  // Force every text label drawn inside Cesium itself to use the same neutral
  // off-white/graphite palette as the RHKEARTH wordmark. CSS cannot affect
  // labels rendered into the WebGL canvas, so enforce this immediately before
  // each LabelCollection draw without changing geometry, imagery, swatches,
  // tracks, or other semantic map colors.
  const lockCesiumLabelPalette = () => {
    const Cesium = window.Cesium;
    const proto = Cesium?.LabelCollection?.prototype;
    if (!Cesium?.Color || !proto?.update || proto.__rhkearthNeutralLabels) return;

    const neutral = Cesium.Color.fromCssColorString('#efefe9');
    const outline = Cesium.Color.fromCssColorString('#090b0a');
    const nativeUpdate = proto.update;

    proto.update = function rhkearthNeutralLabelUpdate(frameState) {
      try {
        for (let i = 0; i < this.length; i += 1) {
          const label = this.get(i);
          if (!label) continue;
          if (!Cesium.Color.equals(label.fillColor, neutral)) label.fillColor = neutral;
          if (!Cesium.Color.equals(label.outlineColor, outline)) label.outlineColor = outline;
        }
      } catch (error) {
        console.warn('[RHKEARTH] Cesium label palette pass skipped', error);
      }
      return nativeUpdate.call(this, frameState);
    };
    proto.__rhkearthNeutralLabels = true;
  };
  lockCesiumLabelPalette();

  const jsonResponse = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });

  async function readJson(path) {
    const response = await nativeFetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Snapshot unavailable: ${path}`);
    return response.json();
  }

  async function cctvCamera(id) {
    const catalog = await readJson(`${DATA_ROOT}/cctv.json`);
    return (catalog.sources || []).find((camera) => camera.id === id) || null;
  }

  function celestrakGroup(url) {
    const fromQuery = url.searchParams.get('group') || url.searchParams.get('GROUP');
    if (fromQuery) return fromQuery.toLowerCase();
    const tail = url.pathname.split('/').filter(Boolean).pop();
    return tail && tail !== 'celestrak' ? tail.toLowerCase() : 'active';
  }

  const finiteNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };

  const emitterCategory = (value) => {
    const category = String(value || '').trim().toUpperCase();
    return ({
      A1: 2,
      A2: 3,
      A3: 4,
      A4: 5,
      A5: 6,
      A6: 7,
      A7: 8,
      B1: 9,
      B2: 10,
      B3: 11,
      B4: 12,
      B6: 14,
      B7: 15,
    })[category] || 0;
  };

  function normalizeAdsbLolAircraftState(aircraft, nowSeconds) {
    const hex = String(aircraft?.hex || '').trim().toLowerCase();
    const latitude = finiteNumber(aircraft?.lat);
    const longitude = finiteNumber(aircraft?.lon);
    if (!hex || latitude === null || longitude === null) return null;

    const seenPosition = Math.max(0, finiteNumber(aircraft?.seen_pos) ?? finiteNumber(aircraft?.seen) ?? 0);
    const seen = Math.max(0, finiteNumber(aircraft?.seen) ?? seenPosition);
    const onGround = aircraft?.alt_baro === 'ground';
    const barometricFeet = onGround ? null : finiteNumber(aircraft?.alt_baro);
    const geometricFeet = finiteNumber(aircraft?.alt_geom);
    const groundSpeedKnots = finiteNumber(aircraft?.gs);
    const verticalRateFpm = finiteNumber(aircraft?.baro_rate) ?? finiteNumber(aircraft?.geom_rate);
    const track = finiteNumber(aircraft?.track);

    return [
      hex,
      String(aircraft?.flight || aircraft?.r || '').trim() || null,
      null,
      Math.max(0, nowSeconds - seenPosition),
      Math.max(0, nowSeconds - seen),
      longitude,
      latitude,
      barometricFeet === null ? null : barometricFeet * 0.3048,
      onGround,
      groundSpeedKnots === null ? null : groundSpeedKnots * 0.514444,
      track,
      verticalRateFpm === null ? null : verticalRateFpm * 0.00508,
      null,
      geometricFeet === null ? null : geometricFeet * 0.3048,
      aircraft?.squawk || null,
      aircraft?.spi === 1,
      0,
      emitterCategory(aircraft?.category),
    ];
  }

  function normalizeAdsbLolPointResponse(payload) {
    const responseNow = finiteNumber(payload?.now);
    const nowSeconds = responseNow === null
      ? Math.floor(Date.now() / 1000)
      : Math.floor(responseNow > 10_000_000_000 ? responseNow / 1000 : responseNow);
    const states = (Array.isArray(payload?.ac) ? payload.ac : [])
      .map((aircraft) => normalizeAdsbLolAircraftState(aircraft, nowSeconds))
      .filter(Boolean);
    return { time: nowSeconds, states };
  }

  async function civilianFlightsResponse(url, init = {}, input = null) {
    const latitude = finiteNumber(url.searchParams.get('lat')) ?? 41.8781;
    const longitude = finiteNumber(url.searchParams.get('lon')) ?? -87.6298;
    const lat = Math.max(-90, Math.min(90, latitude));
    const lon = Math.max(-180, Math.min(180, longitude));
    const signal = init?.signal || (typeof input === 'object' ? input?.signal : undefined);
    const providers = [
      {
        name: 'Airplanes.live',
        endpoint: `https://api.airplanes.live/v2/point/${lat.toFixed(4)}/${lon.toFixed(4)}/250`,
      },
      {
        name: 'adsb.lol',
        endpoint: `https://api.adsb.lol/v2/point/${lat.toFixed(4)}/${lon.toFixed(4)}/250`,
      },
      {
        name: 'adsb.fi',
        endpoint: `https://opendata.adsb.fi/api/v3/lat/${lat.toFixed(4)}/lon/${lon.toFixed(4)}/dist/250`,
      },
    ];

    for (const provider of providers) {
      try {
        const response = await nativeFetch(provider.endpoint, {
          cache: 'no-store',
          mode: 'cors',
          signal,
        });
        if (!response.ok) throw new Error(`${provider.name} HTTP ${response.status}`);

        const payload = await response.json();
        const adapted = Array.isArray(payload?.aircraft) ? { ...payload, ac: payload.aircraft } : payload;
        const normalized = Array.isArray(adapted?.ac)
          ? normalizeAdsbLolPointResponse(adapted)
          : adapted;

        if (!normalized || !Array.isArray(normalized.states)) {
          throw new Error(`Malformed ${provider.name} response`);
        }

        return jsonResponse(normalized, 200, {
          'x-flight-source': provider.name,
          'x-flight-coverage': 'viewport · up to 250 nm',
        });
      } catch (error) {
        if (signal?.aborted) throw error;
        console.warn(`[RHKEARTH] ${provider.name} civilian flight route failed`, error);
      }
    }

    // Static-hosting fallback: this is same-origin and therefore cannot fail
    // because of third-party browser CORS policy. It is refreshed hourly by
    // GitHub Actions from OpenSky's current state-vector endpoint.
    const snapshot = await nativeFetch(`${DATA_ROOT}/flights.json`, {
      cache: 'no-store',
      signal,
    });
    if (!snapshot.ok) throw new Error(`RHKEARTH aircraft snapshot HTTP ${snapshot.status}`);
    const payload = await snapshot.json();
    if (!payload || !Array.isArray(payload.states)) {
      throw new Error('RHKEARTH aircraft snapshot malformed');
    }
    return jsonResponse(payload, 200, {
      'x-flight-source': 'OpenSky · RHKEARTH snapshot',
      'x-flight-coverage': 'global · scheduled refresh fallback',
      'x-flight-fallback': 'same-origin',
    });
  }

  function localSummary(init) {
    let context = {};
    try {
      context = init?.body ? JSON.parse(init.body) : {};
    } catch {
      context = {};
    }
    const text = JSON.stringify(context);
    const place = context?.place || context?.location || context?.label || context?.nearestPlace || '';
    const contacts = Number(context?.contacts ?? context?.count ?? context?.contactCount);
    const pieces = [];
    if (place) pieces.push(String(place));
    if (Number.isFinite(contacts) && contacts >= 0) pieces.push(`${contacts} observed contacts`);
    if (!pieces.length && text && text !== '{}') pieces.push('current map telemetry loaded');
    if (!pieces.length) pieces.push('current view ready');
    return `${pieces.join(' · ')}. Public-source situational context only.`;
  }

  window.fetch = async (input, init = {}) => {
    const raw = typeof input === 'string' ? input : input?.url;
    if (!raw) return nativeFetch(input, init);
    const url = new URL(raw, window.location.href);
    const path = url.pathname;

    try {
      // Backward-compatible repair for older integrated bundles. The old client
      // calls a Vite-only /api/opensky proxy, which cannot exist on GitHub Pages.
      // Route it through the live provider pool with a same-origin OpenSky
      // snapshot fallback so old cached bundles still receive aircraft data.
      if (path === '/api/opensky') {
        return await civilianFlightsResponse(url, init, input);
      }
      if (path === '/api/adsblol/mil' || path === '/api/adsblol/military') {
        return nativeFetch(`${DATA_ROOT}/military.json`, { cache: 'no-store' });
      }
      if (path.startsWith('/api/celestrak')) {
        const group = celestrakGroup(url);
        return nativeFetch(`${DATA_ROOT}/celestrak/${encodeURIComponent(group)}`, { cache: 'no-store' });
      }
      if (path === '/api/launches' || path.includes('/api/launch')) {
        return nativeFetch(`${DATA_ROOT}/launches.json`, { cache: 'no-store' });
      }
      if (path === '/api/firms' || path.includes('/api/fire')) {
        return nativeFetch(`${DATA_ROOT}/fires.json`, { cache: 'no-store' });
      }
      if (path === '/api/cctv/sources') {
        return nativeFetch(`${DATA_ROOT}/cctv.json`, { cache: 'no-store' });
      }
      if (path === '/api/cctv/health') {
        return nativeFetch(`${DATA_ROOT}/cctv-health.json`, { cache: 'no-store' });
      }
      if (path === '/api/cctv/frame' || path === '/api/cctv/media') {
        const id = url.searchParams.get('id') || url.searchParams.get('cameraId');
        const camera = id ? await cctvCamera(id) : null;
        if (!camera?.snapshotUrl) return jsonResponse({ error: 'Camera frame unavailable' }, 404);
        return nativeFetch(camera.snapshotUrl, { cache: 'no-store', mode: 'cors' });
      }
      if (path === '/api/openai/hud-summary') {
        return jsonResponse({
          configured: true,
          code: 'RHK_LOCAL_ANALYSIS',
          error: null,
          summary: localSummary(init),
        });
      }
      // Voice is intentionally not part of RHKEARTH. Do not allow an inherited
      // upstream Realtime route to trigger microphone/login/error behavior.
      if (path.startsWith('/api/realtime/')) {
        return jsonResponse({ configured: false, code: 'RHK_VOICE_REMOVED' }, 404);
      }
    } catch (error) {
      console.warn('[RHKEARTH] Compatibility route failed:', path, error);
      if (path === '/api/opensky') {
        return jsonResponse({ error: 'Aircraft feed temporarily unavailable' }, 503, {
          'x-flight-source': 'RHKEARTH aircraft sources',
          'x-flight-coverage': 'live providers + same-origin snapshot',
        });
      }
    }

    return nativeFetch(input, init);
  };

  const layerSymbols = {
    flights: 'flight',
    military: 'radar',
    satellites: 'satellite_alt',
    earthquakes: 'vibration',
    cctv: 'videocam',
    traffic: 'traffic',
    fires: 'local_fire_department',
    'local-firms': 'local_fire_department',
    vessels: 'directions_boat',
    'ais-live-vessels': 'directions_boat',
    'space-missions': 'rocket_launch',
    'rocket-launches': 'rocket_launch',
    radio: 'radio',
    bikeshare: 'pedal_bike',
    weather: 'cloud',
    'military-installations': 'shield',
  };

  function symbolForLayer(id) {
    const key = String(id || '').toLowerCase();
    if (layerSymbols[key]) return layerSymbols[key];
    if (key.includes('military') || key.includes('defense')) return 'shield';
    if (key.includes('satellite') || key.includes('space')) return 'satellite_alt';
    if (key.includes('ship') || key.includes('vessel') || key.includes('ais')) return 'directions_boat';
    if (key.includes('camera') || key.includes('cctv')) return 'videocam';
    if (key.includes('fire')) return 'local_fire_department';
    if (key.includes('traffic') || key.includes('road')) return 'traffic';
    if (key.includes('quake')) return 'vibration';
    if (key.includes('flight') || key.includes('air')) return 'flight';
    return 'adjust';
  }

  // IMPORTANT: this routine must be idempotent. A MutationObserver watches for
  // upstream rows being created; rewriting text that is already correct would
  // itself create another childList mutation and can lock the browser in a
  // self-triggering observer loop.
  const cleanLayerIcons = () => {
    document.querySelectorAll('[data-layer-id]').forEach((row) => {
      const id = row.dataset.layerId || '';
      const icon = row.querySelector('.data-icon');
      if (icon) {
        const symbol = symbolForLayer(id);
        if ((icon.textContent || '').trim() !== symbol) icon.textContent = symbol;
        if (!icon.classList.contains('material-symbols-outlined')) icon.classList.add('material-symbols-outlined');
        if (!icon.classList.contains('rhk-layer-symbol')) icon.classList.add('rhk-layer-symbol');
        if (icon.getAttribute('aria-hidden') !== 'true') icon.setAttribute('aria-hidden', 'true');
      }

      if (id === 'satellites') {
        const starlink = row.querySelector('.data-toggle-chip[data-chip-id="catalog"]');
        if (starlink && /DENSE/i.test(starlink.textContent || '')) {
          const label = (starlink.textContent || '').replace(/DENSE/g, 'STARLINK');
          if (starlink.textContent !== label) starlink.textContent = label;
          if (starlink.title !== 'Show the CelesTrak Starlink constellation shell') {
            starlink.title = 'Show the CelesTrak Starlink constellation shell';
          }
        }
      }
    });
  };

  const removeVoiceControls = () => {
    const controller = window.__godsEyeView?.voiceCommands || window.__gevVoiceCommands;
    if (controller && typeof controller.stop === 'function') {
      try {
        controller.stop({ removeUi: true });
      } catch {
        // The integrated RHKEARTH build removes voice at source; this is only a
        // safety net for an older cached upstream bundle.
      }
    }
    document.getElementById('gev-voice-control')?.remove();
    document.getElementById('gev-voice-button')?.remove();
  };

  const classificationPattern = /TOP\s*SECRET(?:\s*\/\/\s*SI[-\s]?TK)?(?:\s*\/\/\s*NOFORN)?/i;

  const removeClassificationLabel = () => {
    // Remove the inherited fake-classification banner even when the upstream UI
    // renders the words across nested spans instead of one leaf element.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const matches = [];
    let node;
    while ((node = walker.nextNode())) {
      if (classificationPattern.test((node.nodeValue || '').replace(/\s+/g, ' '))) {
        matches.push(node.parentElement);
      }
    }

    matches.filter(Boolean).forEach((element) => {
      let target = element;
      while (target.parentElement && target.parentElement !== document.body) {
        const parentText = (target.parentElement.textContent || '').replace(/\s+/g, ' ').trim();
        if (!classificationPattern.test(parentText) || parentText.length > 120) break;
        target = target.parentElement;
      }
      target.remove();
    });

    // Fallback for a banner whose text is assembled entirely from child nodes.
    document.querySelectorAll('body *').forEach((element) => {
      const label = (element.textContent || '').replace(/\s+/g, ' ').trim();
      if (!classificationPattern.test(label) || label.length > 120) return;
      const rect = element.getBoundingClientRect();
      if (rect.top < 200 && rect.left < 500) element.remove();
    });
  };

  const removeSetupPrompts = () => {
    document.getElementById('key-setup')?.remove();
    document.getElementById('key-setup-chip')?.remove();
    document.getElementById('first-run-launcher')?.remove();
    removeVoiceControls();
    removeClassificationLabel();
  };

  const ensureClearViewEmblem = () => {
    if (document.getElementById('rhkearth-clear-emblem')) return;
    const emblem = document.createElement('div');
    emblem.id = 'rhkearth-clear-emblem';
    emblem.setAttribute('aria-hidden', 'true');
    emblem.innerHTML = '<img src="/experimental/logo.svg" alt="" /><span>RHKEARTH</span>';
    document.body.appendChild(emblem);
  };

  let refreshScheduled = false;
  const refreshChrome = () => {
    if (refreshScheduled) return;
    refreshScheduled = true;
    requestAnimationFrame(() => {
      refreshScheduled = false;
      removeSetupPrompts();
      cleanLayerIcons();
      ensureClearViewEmblem();
    });
  };

  new MutationObserver(refreshChrome).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', () => {
    removeSetupPrompts();
    cleanLayerIcons();
    ensureClearViewEmblem();
  });
})();

// RHKEARTH shell revision 9: same-origin aircraft fallback plus neutral Cesium and DOM typography.