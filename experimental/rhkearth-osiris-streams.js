/*
 * RHKEARTH live streams — OSIRIS-derived data/display pack.
 *
 * Adapted from simplifaisoul/osiris (MIT): USGS seismic feed, NASA FIRMS
 * active-fire feed, NOAA SWPC space-weather feed, live-news catalog and the
 * close-zoom pinned broadcast-preview concept. RHKEARTH implementation is
 * Cesium-native and keeps each source explicitly labelled.
 *
 * OSIRIS copyright (c) 2026 simplifaisoul.
 * See /experimental/OSIRIS_LICENSE.txt.
 */
(() => {
  'use strict';

  if (window.__rhkOsirisStreamsInstalled) return;
  window.__rhkOsirisStreamsInstalled = true;

  const state = {
    viewer: null,
    Cesium: null,
    sources: {},
    enabled: { seismic: false, fires: false, news: false },
    newsFeeds: [],
    panelOpen: false,
    previewEnabled: true,
    previewIds: '',
    refreshTimer: null,
    pickHandler: null,
    last: { seismic: null, fires: null, news: null, space: null },
  };

  const $ = (id) => document.getElementById(id);
  const text = (id, value) => { const el = $(id); if (el) el.textContent = value; };
  const nowIso = () => new Date().toISOString();
  const stamp = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toISOString().slice(11, 19) + 'Z';
  };

  async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { cache: 'no-store', ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchJson(url, timeout = 10000) {
    const r = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, timeout);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  async function fetchText(url, timeout = 15000) {
    const r = await fetchWithTimeout(url, { headers: { Accept: 'text/csv,text/plain,*/*' } }, timeout);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  }

  function installUi() {
    if ($('rhk-streams-btn')) return;
    const actions = $('top-center-actions');
    const btn = document.createElement('button');
    btn.id = 'rhk-streams-btn';
    btn.type = 'button';
    btn.title = 'Live source streams';
    btn.setAttribute('aria-label', 'Open live source streams');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">sensors</span>';
    (actions || document.body).appendChild(btn);

    const panel = document.createElement('aside');
    panel.id = 'rhk-streams-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Live source streams');
    panel.innerHTML = `
      <header class="rhk-stream-header">
        <div><small>LIVE SOURCE</small><strong>STREAMS</strong></div>
        <button id="rhk-streams-close" type="button" aria-label="Close"><span class="material-symbols-outlined">close</span></button>
      </header>
      <section class="rhk-stream-switches">
        <button type="button" data-stream="seismic" aria-pressed="false"><span class="material-symbols-outlined">vibration</span><b>SEISMIC</b><small>USGS M2.5+</small><i id="rhk-seismic-count">OFF</i></button>
        <button type="button" data-stream="fires" aria-pressed="false"><span class="material-symbols-outlined">local_fire_department</span><b>FIRES</b><small>NASA FIRMS</small><i id="rhk-fires-count">OFF</i></button>
        <button type="button" data-stream="news" aria-pressed="false"><span class="material-symbols-outlined">live_tv</span><b>BROADCAST</b><small>GLOBAL LIVE TV</small><i id="rhk-news-count">OFF</i></button>
      </section>
      <section class="rhk-stream-monitor">
        <div class="rhk-monitor-head"><span>SOURCE MONITOR</span><button id="rhk-stream-refresh" type="button">REFRESH</button></div>
        <div class="rhk-monitor-row"><span>USGS</span><strong id="rhk-seismic-status">STANDBY</strong><time id="rhk-seismic-time">—</time></div>
        <div class="rhk-monitor-row"><span>NASA FIRMS</span><strong id="rhk-fires-status">STANDBY</strong><time id="rhk-fires-time">—</time></div>
        <div class="rhk-monitor-row"><span>NOAA SWPC</span><strong id="rhk-space-status">ACQUIRING</strong><time id="rhk-space-time">—</time></div>
        <div class="rhk-space-summary">
          <div><span>KP</span><strong id="rhk-kp-index">—</strong></div>
          <div><span>GEOMAG</span><strong id="rhk-kp-level">—</strong></div>
          <div><span>FLARES</span><strong id="rhk-flare-count">—</strong></div>
        </div>
      </section>
      <section class="rhk-broadcast-options">
        <div><span>MAP-PINNED VIDEO</span><small>OSIRIS-style close-zoom previews · max 2</small></div>
        <button id="rhk-preview-toggle" type="button" aria-pressed="true">PREVIEWS ON</button>
      </section>
      <footer>DIRECT PUBLIC SOURCES FIRST · SAME-ORIGIN SNAPSHOT FALLBACKS · NO SYNTHETIC EVENTS</footer>`;
    document.body.appendChild(panel);

    const viewer = document.createElement('aside');
    viewer.id = 'rhk-broadcast-viewer';
    viewer.hidden = true;
    viewer.innerHTML = `
      <header><div><small>LIVE BROADCAST</small><strong id="rhk-broadcast-name">—</strong><span id="rhk-broadcast-place">—</span></div><button id="rhk-broadcast-close" type="button"><span class="material-symbols-outlined">close</span></button></header>
      <div id="rhk-broadcast-media"></div>
      <div class="rhk-broadcast-footer"><span id="rhk-broadcast-mode">—</span><a id="rhk-broadcast-open" href="#" target="_blank" rel="noopener noreferrer">OPEN SOURCE</a></div>`;
    document.body.appendChild(viewer);

    const previews = document.createElement('div');
    previews.id = 'rhk-news-previews';
    previews.setAttribute('aria-hidden', 'true');
    document.body.appendChild(previews);

    btn.addEventListener('click', () => setPanel(!state.panelOpen));
    $('rhk-streams-close')?.addEventListener('click', () => setPanel(false));
    $('rhk-stream-refresh')?.addEventListener('click', () => refresh(true));
    $('rhk-broadcast-close')?.addEventListener('click', closeBroadcast);
    $('rhk-preview-toggle')?.addEventListener('click', () => {
      state.previewEnabled = !state.previewEnabled;
      const toggle = $('rhk-preview-toggle');
      if (toggle) {
        toggle.setAttribute('aria-pressed', String(state.previewEnabled));
        toggle.textContent = state.previewEnabled ? 'PREVIEWS ON' : 'PREVIEWS OFF';
      }
      if (!state.previewEnabled) clearPreviews();
      else updatePreviews(true);
    });
    panel.querySelectorAll('[data-stream]').forEach((el) => {
      el.addEventListener('click', () => toggleStream(el.getAttribute('data-stream')));
    });
  }

  function setPanel(open) {
    state.panelOpen = !!open;
    const panel = $('rhk-streams-panel');
    const btn = $('rhk-streams-btn');
    if (panel) panel.hidden = !state.panelOpen;
    if (btn) btn.setAttribute('aria-expanded', String(state.panelOpen));
  }

  function createSources() {
    const { viewer, Cesium } = state;
    if (!viewer || !Cesium) return;
    for (const [key, label] of [['seismic', 'USGS Seismic'], ['fires', 'NASA FIRMS'], ['news', 'Live Broadcasts']]) {
      if (state.sources[key]) continue;
      const ds = new Cesium.CustomDataSource(`RHKEARTH · ${label}`);
      ds.show = false;
      state.sources[key] = ds;
      viewer.dataSources.add(ds);
    }
  }

  async function toggleStream(kind) {
    if (!state.sources[kind]) return;
    state.enabled[kind] = !state.enabled[kind];
    state.sources[kind].show = state.enabled[kind];
    const button = document.querySelector(`[data-stream="${kind}"]`);
    button?.setAttribute('aria-pressed', String(state.enabled[kind]));
    button?.classList.toggle('active', state.enabled[kind]);

    if (!state.enabled[kind]) {
      text(`rhk-${kind}-count`, 'OFF');
      if (kind === 'news') clearPreviews();
      return;
    }
    text(`rhk-${kind}-count`, 'LOADING');
    if (kind === 'seismic') await loadSeismic();
    if (kind === 'fires') await loadFires();
    if (kind === 'news') await loadNews();
  }

  function pointColor(css, alpha = 1) {
    return state.Cesium.Color.fromCssColorString(css).withAlpha(alpha);
  }

  async function loadSeismic() {
    if (!state.viewer) return;
    text('rhk-seismic-status', 'ACQUIRING');
    let payload;
    let source = 'USGS LIVE';
    try {
      payload = await fetchJson('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', 10000);
    } catch (err) {
      source = 'USGS SNAPSHOT';
      payload = await fetchJson('/experimental/live-data/earthquakes.json', 7000);
    }
    const features = Array.isArray(payload?.features) ? payload.features : Array.isArray(payload?.earthquakes) ? payload.earthquakes : [];
    const ds = state.sources.seismic;
    ds.entities.removeAll();
    const { Cesium } = state;
    let count = 0;
    for (const row of features.slice(0, 1000)) {
      let lon, lat, depth, mag, place, time, url, id;
      if (row?.geometry?.coordinates) {
        [lon, lat, depth] = row.geometry.coordinates;
        mag = row.properties?.mag;
        place = row.properties?.place;
        time = row.properties?.time;
        url = row.properties?.url;
        id = row.id;
      } else {
        lon = row.lng ?? row.lon; lat = row.lat; depth = row.depth; mag = row.magnitude; place = row.place; time = row.time; url = row.url; id = row.id;
      }
      lon = Number(lon); lat = Number(lat); depth = Number(depth || 0); mag = Number(mag || 0);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
      count += 1;
      const size = Math.max(5, Math.min(16, 4 + mag * 1.8));
      ds.entities.add({
        id: `rhk-usgs-${id || count}`,
        name: `M${mag.toFixed(1)} · ${place || 'Earthquake'}`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, Math.max(0, -depth * 1000) + 800),
        point: { pixelSize: size, color: pointColor('#F0C36E', 0.92), outlineColor: pointColor('#111111', 0.75), outlineWidth: 1, disableDepthTestDistance: 2500000 },
        label: mag >= 5 ? { text: `M${mag.toFixed(1)}`, font: '600 10px monospace', fillColor: pointColor('#F0C36E', 0.92), outlineColor: Cesium.Color.BLACK, outlineWidth: 3, pixelOffset: new Cesium.Cartesian2(0, -14), disableDepthTestDistance: 2500000 } : undefined,
        properties: { rhkStreamType: 'seismic', magnitude: mag, place: place || '', source: source, sourceUrl: url || '' },
      });
    }
    state.last.seismic = payload?.metadata?.generated || payload?.timestamp || Date.now();
    text('rhk-seismic-count', String(count));
    text('rhk-seismic-status', source);
    text('rhk-seismic-time', stamp(state.last.seismic));
  }

  function parseCsvLine(line) {
    const out = [];
    let field = '', quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') { field += '"'; i += 1; }
        else quoted = !quoted;
      } else if (ch === ',' && !quoted) { out.push(field); field = ''; }
      else field += ch;
    }
    out.push(field);
    return out;
  }

  function parseFirmsCsv(csv) {
    const lines = String(csv || '').trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const header = parseCsvLine(lines[0]).map(v => v.trim());
    const idx = (name) => header.indexOf(name);
    const latI = idx('latitude'), lonI = idx('longitude');
    const brI = idx('bright_ti4') >= 0 ? idx('bright_ti4') : idx('brightness');
    const confI = idx('confidence'), frpI = idx('frp'), dateI = idx('acq_date'), timeI = idx('acq_time');
    if (latI < 0 || lonI < 0) return [];
    const max = 1800;
    const step = Math.max(1, Math.ceil((lines.length - 1) / max));
    const rows = [];
    for (let i = 1; i < lines.length; i += step) {
      const c = parseCsvLine(lines[i]);
      const lat = Number(c[latI]), lon = Number(c[lonI]);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      rows.push({ lat, lon, brightness: Number(c[brI] || 0), confidence: c[confI] || 'unknown', frp: Number(c[frpI] || 0), acqDate: c[dateI] || '', acqTime: c[timeI] || '' });
    }
    return rows;
  }

  async function loadFires() {
    text('rhk-fires-status', 'ACQUIRING');
    let rows = [];
    let source = 'NASA FIRMS LIVE';
    try {
      const csv = await fetchText('https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv', 15000);
      rows = parseFirmsCsv(csv);
      if (!rows.length) throw new Error('No FIRMS rows');
    } catch (err) {
      const payload = await fetchJson('/experimental/live-data/fires.json', 7000);
      rows = Array.isArray(payload?.fires) ? payload.fires : [];
      source = String(payload?.source || 'NASA SNAPSHOT').toUpperCase();
    }
    const ds = state.sources.fires;
    ds.entities.removeAll();
    const { Cesium } = state;
    let count = 0;
    for (const row of rows.slice(0, 2000)) {
      const lat = Number(row.lat), lon = Number(row.lon ?? row.lng), frp = Number(row.frp || 0);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      count += 1;
      ds.entities.add({
        id: `rhk-fire-${count}-${lat.toFixed(3)}-${lon.toFixed(3)}`,
        name: row.title || `Thermal detection · ${frp ? `${frp.toFixed(1)} MW` : source}`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 900),
        point: { pixelSize: Math.max(4, Math.min(11, 5 + Math.sqrt(Math.max(0, frp)) / 3)), color: pointColor('#EF7B62', 0.88), outlineColor: pointColor('#18120F', 0.8), outlineWidth: 1, disableDepthTestDistance: 2200000 },
        properties: { rhkStreamType: 'fire', frp, confidence: String(row.confidence || ''), source },
      });
    }
    state.last.fires = Date.now();
    text('rhk-fires-count', String(count));
    text('rhk-fires-status', source);
    text('rhk-fires-time', stamp(state.last.fires));
  }

  async function loadNews() {
    const payload = await fetchJson('/experimental/osiris-live-news.json', 7000);
    const feeds = Array.isArray(payload?.feeds) ? payload.feeds : [];
    state.newsFeeds = feeds;
    const ds = state.sources.news;
    ds.entities.removeAll();
    const { Cesium } = state;
    for (const feed of feeds) {
      const lat = Number(feed.lat), lon = Number(feed.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      ds.entities.add({
        id: `rhk-news-${feed.id}`,
        name: `${feed.name} · LIVE BROADCAST`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 1000),
        point: { pixelSize: 8, color: pointColor('#D88AA6', 0.94), outlineColor: Cesium.Color.BLACK.withAlpha(0.78), outlineWidth: 1, disableDepthTestDistance: 3500000 },
        label: { text: feed.name, font: '600 9px monospace', fillColor: pointColor('#E7E3D6', 0.8), outlineColor: Cesium.Color.BLACK, outlineWidth: 3, pixelOffset: new Cesium.Cartesian2(0, -13), distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1300000), disableDepthTestDistance: 3500000 },
        properties: { rhkStreamType: 'news', rhkStreamFeedId: feed.id, source: 'OSIRIS live-news catalog' },
      });
    }
    state.last.news = payload?.timestamp || Date.now();
    text('rhk-news-count', String(feeds.length));
    updatePreviews(true);
  }

  function stormLevel(kp) {
    if (kp >= 8) return 'EXTREME G5';
    if (kp >= 7) return 'SEVERE G4';
    if (kp >= 6) return 'STRONG G3';
    if (kp >= 5) return 'MODERATE G2';
    if (kp >= 4) return 'MINOR G1';
    if (kp >= 3) return 'UNSETTLED';
    return 'QUIET';
  }

  async function loadSpaceWeather() {
    text('rhk-space-status', 'ACQUIRING');
    try {
      let kp, alerts, flares;
      try {
        [kp, alerts, flares] = await Promise.all([
          fetchJson('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json', 8000),
          fetchJson('https://services.swpc.noaa.gov/json/alerts.json', 8000),
          fetchJson('https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json', 8000),
        ]);
      } catch (liveError) {
        const fallback = await fetchJson('/experimental/live-data/space-weather.json', 7000);
        const value = Number(fallback?.kp_index || 0);
        text('rhk-kp-index', value.toFixed(1));
        text('rhk-kp-level', fallback?.storm_level || stormLevel(value));
        text('rhk-flare-count', String((fallback?.solar_flares || []).length));
        state.last.space = fallback?.timestamp || Date.now();
        text('rhk-space-status', 'NOAA SNAPSHOT');
        text('rhk-space-time', stamp(state.last.space));
        return;
      }
      const latest = Array.isArray(kp) && kp.length ? kp[kp.length - 1] : {};
      const value = Number(latest?.kp_index ?? latest?.Kp ?? 0);
      const recentFlares = Array.isArray(flares) ? flares.filter(f => f?.max_class).slice(0, 5) : [];
      text('rhk-kp-index', value.toFixed(1));
      text('rhk-kp-level', stormLevel(value));
      text('rhk-flare-count', String(recentFlares.length));
      state.last.space = latest?.time_tag || Date.now();
      text('rhk-space-status', 'NOAA LIVE');
      text('rhk-space-time', stamp(state.last.space));
      state.spaceWeather = { kp_index: value, alerts: Array.isArray(alerts) ? alerts.slice(0, 10) : [], solar_flares: recentFlares, timestamp: nowIso() };
    } catch (err) {
      text('rhk-space-status', 'UNAVAILABLE');
    }
  }

  function findFeed(id) {
    return state.newsFeeds.find((f) => String(f.id) === String(id));
  }

  function embedUrl(feed) {
    if (!feed?.embed_allowed) return null;
    try {
      const u = new URL(feed.url);
      if (!/^(www\.)?youtube(-nocookie)?\.com$/i.test(u.hostname)) return null;
      if (!u.pathname.startsWith('/embed/')) return null;
      u.searchParams.set('autoplay', '1');
      u.searchParams.set('mute', '1');
      u.searchParams.set('playsinline', '1');
      u.searchParams.set('rel', '0');
      return u.toString();
    } catch (_) { return null; }
  }

  function openBroadcast(feed) {
    if (!feed) return;
    const box = $('rhk-broadcast-viewer');
    const media = $('rhk-broadcast-media');
    const link = $('rhk-broadcast-open');
    if (!box || !media || !link) return;
    text('rhk-broadcast-name', feed.name || 'LIVE BROADCAST');
    text('rhk-broadcast-place', `${feed.city || '—'} · ${feed.country || '—'} · ${(feed.category || 'news').toUpperCase()}`);
    link.href = feed.url || '#';
    const embed = embedUrl(feed);
    media.innerHTML = '';
    if (embed) {
      const frame = document.createElement('iframe');
      frame.src = embed;
      frame.title = feed.name || 'Live broadcast';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allowFullscreen = true;
      media.appendChild(frame);
      text('rhk-broadcast-mode', 'EMBEDDABLE LIVE CHANNEL · MUTED AUTOPLAY');
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'rhk-broadcast-external';
      fallback.innerHTML = '<span class="material-symbols-outlined">open_in_new</span><strong>OPERATOR BLOCKS EMBED</strong><small>Open the source directly to watch the live channel.</small>';
      media.appendChild(fallback);
      text('rhk-broadcast-mode', 'EXTERNAL-ONLY SOURCE');
    }
    box.hidden = false;
  }

  function closeBroadcast() {
    const box = $('rhk-broadcast-viewer');
    const media = $('rhk-broadcast-media');
    if (box) box.hidden = true;
    if (media) media.innerHTML = '';
  }

  function installNewsPicking() {
    if (state.pickHandler) return;
    const { viewer, Cesium } = state;
    state.pickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    state.pickHandler.setInputAction((movement) => {
      let picked;
      try { picked = viewer.scene.pick(movement.position); } catch (_) { return; }
      const entity = picked?.id;
      if (!entity?.properties) return;
      let props;
      try { props = entity.properties.getValue(Cesium.JulianDate.now()); } catch (_) { return; }
      if (props?.rhkStreamType !== 'news' || !props?.rhkStreamFeedId) return;
      const feed = findFeed(props.rhkStreamFeedId);
      if (feed) openBroadcast(feed);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  function clearPreviews() {
    const root = $('rhk-news-previews');
    if (root) root.innerHTML = '';
    state.previewIds = '';
  }

  function visiblePreviewCandidates() {
    const { viewer, Cesium } = state;
    if (!viewer || !Cesium || !state.enabled.news || !state.previewEnabled || document.body.classList.contains('rhk-mobile-ui')) return [];
    const height = Number(viewer.camera.positionCartographic?.height || Infinity);
    if (height > 450000) return [];
    const canvas = viewer.scene.canvas;
    const cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2;
    const candidates = [];
    for (const feed of state.newsFeeds) {
      const embed = embedUrl(feed);
      if (!embed) continue;
      const world = Cesium.Cartesian3.fromDegrees(Number(feed.lng), Number(feed.lat), 1200);
      let pt;
      try { pt = viewer.scene.cartesianToCanvasCoordinates(world); } catch (_) { continue; }
      if (!pt || pt.x < 100 || pt.y < 80 || pt.x > canvas.clientWidth - 100 || pt.y > canvas.clientHeight - 120) continue;
      candidates.push({ feed, embed, world, x: pt.x, y: pt.y, d: (pt.x - cx) ** 2 + (pt.y - cy) ** 2 });
    }
    candidates.sort((a, b) => a.d - b.d);
    const picked = [];
    for (const candidate of candidates) {
      if (picked.length >= 2) break;
      if (picked.some((p) => Math.abs(p.x - candidate.x) < 230 && Math.abs(p.y - candidate.y) < 155)) continue;
      picked.push(candidate);
    }
    return picked;
  }

  function updatePreviews(force = false) {
    const root = $('rhk-news-previews');
    if (!root) return;
    const candidates = visiblePreviewCandidates();
    const ids = candidates.map((c) => c.feed.id).join('|');
    if (force || ids !== state.previewIds) {
      root.innerHTML = '';
      state.previewIds = ids;
      for (const c of candidates) {
        const tile = document.createElement('div');
        tile.className = 'rhk-news-preview';
        tile.dataset.feedId = c.feed.id;
        tile.innerHTML = `<div class="rhk-news-video"><iframe title="${String(c.feed.name).replace(/"/g, '&quot;')}" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe><button type="button">OPEN</button></div><div class="rhk-news-label"><i></i><span></span></div><div class="rhk-news-stem"></div>`;
        tile.querySelector('iframe').src = c.embed;
        tile.querySelector('.rhk-news-label span').textContent = c.feed.name;
        tile.querySelector('button').addEventListener('click', () => openBroadcast(c.feed));
        root.appendChild(tile);
      }
    }
    for (const c of candidates) {
      const tile = root.querySelector(`[data-feed-id="${CSS.escape(String(c.feed.id))}"]`);
      if (!tile) continue;
      let pt;
      try { pt = state.viewer.scene.cartesianToCanvasCoordinates(c.world); } catch (_) { continue; }
      if (!pt) continue;
      tile.style.transform = `translate3d(${Math.round(pt.x - 104)}px, ${Math.round(pt.y - 166)}px, 0)`;
    }
  }

  async function refresh(manual = false) {
    const jobs = [loadSpaceWeather()];
    if (state.enabled.seismic) jobs.push(loadSeismic());
    if (state.enabled.fires) jobs.push(loadFires());
    if (state.enabled.news && !state.newsFeeds.length) jobs.push(loadNews());
    await Promise.allSettled(jobs);
    if (manual) {
      const toast = $('toast');
      if (toast) {
        toast.textContent = 'LIVE SOURCES REFRESHED';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1600);
      }
    }
  }

  function startRefreshLoop() {
    if (state.refreshTimer) return;
    state.refreshTimer = setInterval(() => {
      if (document.hidden) return;
      refresh(false);
    }, 120000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refresh(false);
    });
  }

  function init() {
    installUi();
    const start = Date.now();
    const wait = () => {
      const viewer = window.__godsEyeView?.viewer;
      const Cesium = window.Cesium;
      if (viewer && Cesium) {
        state.viewer = viewer;
        state.Cesium = Cesium;
        createSources();
        installNewsPicking();
        viewer.scene.postRender.addEventListener(() => {
          if (state.enabled.news && state.previewEnabled) updatePreviews(false);
        });
        loadSpaceWeather();
        startRefreshLoop();
        window.__rhkLiveStreams = {
          open: () => setPanel(true),
          refresh: () => refresh(true),
          enable: async (kind) => { if (!state.enabled[kind]) await toggleStream(kind); },
          disable: async (kind) => { if (state.enabled[kind]) await toggleStream(kind); },
          getState: () => ({ enabled: { ...state.enabled }, last: { ...state.last }, newsFeeds: state.newsFeeds.length }),
        };
        console.info('RHKEARTH live streams ready · OSIRIS-derived data/display pack');
        return;
      }
      if (Date.now() - start < 30000) setTimeout(wait, 250);
    };
    wait();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
