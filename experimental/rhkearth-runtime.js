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

  const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
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
    } catch (error) {
      console.warn('[RHKEARTH] Compatibility route failed:', path, error);
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

  const removeSetupPrompts = () => {
    document.getElementById('key-setup')?.remove();
    document.getElementById('key-setup-chip')?.remove();
    document.getElementById('first-run-launcher')?.remove();
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
    });
  };

  new MutationObserver(refreshChrome).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', () => {
    removeSetupPrompts();
    cleanLayerIcons();
    ensureClearViewEmblem();
  });
})();

// RHKEARTH shell revision 3: idempotent UI cleanup, login-free direct entry.
