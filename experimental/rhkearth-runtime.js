(() => {
  const nativeFetch = window.fetch.bind(window);
  const DATA_ROOT = '/experimental-data';

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

  async function puterSummary(init) {
    try {
      if (!window.puter?.ai?.chat) {
        return jsonResponse({ configured: false, code: 'PUTER_UNAVAILABLE', error: null, summary: null });
      }
      const context = init?.body ? JSON.parse(init.body) : {};
      const prompt = `You are the RHKEARTH intelligence-console analyst. Write one concise factual situational-awareness sentence, maximum 28 words. Do not invent facts, threats, classifications, capabilities, or certainty. Use only this telemetry/context: ${JSON.stringify(context)}`;
      const result = await window.puter.ai.chat(prompt, { model: 'gpt-5-nano' });
      const summary = typeof result === 'string'
        ? result
        : (result?.message?.content || result?.text || '').toString();
      if (!summary.trim()) throw new Error('Empty AI response');
      return jsonResponse({ configured: true, code: 'PUTER', error: null, summary: summary.trim() });
    } catch (error) {
      console.warn('[RHKEARTH] Puter AI summary unavailable:', error);
      return jsonResponse({ configured: false, code: 'PUTER_ERROR', error: null, summary: null });
    }
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
        return puterSummary(init);
      }
    } catch (error) {
      console.warn('[RHKEARTH] Compatibility route failed:', path, error);
    }

    return nativeFetch(input, init);
  };

  // Replace decorative emoji in the data-layer rail with restrained system glyphs.
  const glyphs = {
    flights: 'FL', military: 'MIL', satellites: 'SAT', earthquakes: 'EQ',
    cctv: 'CAM', traffic: 'TRF', fires: 'FIR', vessels: 'AIS',
    'space-missions': 'SPC', radio: 'RF', bikeshare: 'BIK', weather: 'WX',
  };
  const cleanLayerIcons = () => {
    document.querySelectorAll('[data-layer], [data-layer-id]').forEach((row) => {
      const id = (row.dataset.layer || row.dataset.layerId || '').toLowerCase();
      if (!id) return;
      const icon = row.querySelector('.layer-icon, .data-layer-icon, .icon, [class*="emoji"]');
      if (icon && glyphs[id]) {
        icon.textContent = glyphs[id];
        icon.classList.add('rhk-glyph');
      }
    });
    document.querySelectorAll('button, .layer-item, .data-layer-item').forEach((el) => {
      const txt = (el.textContent || '').trim();
      if (/^[\p{Extended_Pictographic}\uFE0F\u200D]+$/u.test(txt)) {
        el.textContent = '•';
        el.classList.add('rhk-glyph');
      }
    });
  };

  const ensureClearViewEmblem = () => {
    if (document.getElementById('rhkearth-clear-emblem')) return;
    const emblem = document.createElement('div');
    emblem.id = 'rhkearth-clear-emblem';
    emblem.setAttribute('aria-hidden', 'true');
    emblem.innerHTML = '<img src="/experimental/logo.svg" alt="" /><span>RHKEARTH</span>';
    document.body.appendChild(emblem);
  };

  new MutationObserver(cleanLayerIcons).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', () => {
    cleanLayerIcons();
    ensureClearViewEmblem();
  });
})();
