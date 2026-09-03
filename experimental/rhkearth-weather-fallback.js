(() => {
  'use strict';

  const upstreamFetch = window.fetch.bind(window);
  const snapshotRoot = '/experimental-data/weather';
  const maxSnapshotAgeMs = 12 * 60 * 1000;
  const transports = Object.create(null);

  const routes = new Map([
    ['https://api.weather.gov/alerts/active?status=actual', 'nws-alerts.json'],
    ['https://www.nhc.noaa.gov/CurrentStorms.json', 'nhc-current-storms.json'],
  ]);

  async function freshSnapshot(filename, init) {
    const manifestResponse = await upstreamFetch(`${snapshotRoot}/manifest.json`, { cache: 'no-store' });
    if (!manifestResponse.ok) throw new Error(`weather snapshot manifest HTTP ${manifestResponse.status}`);
    const manifest = await manifestResponse.json();
    const record = manifest?.sources?.[filename];
    const fetchedAt = Date.parse(record?.fetchedAt || manifest?.generatedAt || '');
    if (record?.status !== 'ok' || !Number.isFinite(fetchedAt)) {
      throw new Error(`weather snapshot ${filename} is not marked current`);
    }
    const ageMs = Date.now() - fetchedAt;
    if (ageMs < -60000 || ageMs > maxSnapshotAgeMs) {
      throw new Error(`weather snapshot ${filename} is stale (${Math.round(ageMs / 60000)} min)`);
    }
    const response = await upstreamFetch(`${snapshotRoot}/${filename}`, { ...init, cache: 'no-store' });
    if (!response.ok) throw new Error(`weather snapshot ${filename} HTTP ${response.status}`);
    transports[filename] = { mode: 'snapshot', fetchedAt: new Date(fetchedAt).toISOString(), ageMs };
    return response;
  }

  window.fetch = async (input, init = {}) => {
    const raw = typeof input === 'string' ? input : input?.url;
    if (!raw) return upstreamFetch(input, init);

    let absolute;
    try { absolute = new URL(raw, window.location.href).toString(); }
    catch { return upstreamFetch(input, init); }

    const filename = routes.get(absolute);
    if (!filename) return upstreamFetch(input, init);

    try {
      const response = await upstreamFetch(input, init);
      if (response.ok) {
        transports[filename] = { mode: 'direct', checkedAt: new Date().toISOString() };
        return response;
      }
      throw new Error(`official endpoint HTTP ${response.status}`);
    } catch (directError) {
      try {
        const fallback = await freshSnapshot(filename, init);
        console.warn(`[RHKEARTH WEATHER] Direct official request failed; using fresh official snapshot for ${filename}`, directError);
        return fallback;
      } catch (snapshotError) {
        transports[filename] = {
          mode: 'unavailable',
          checkedAt: new Date().toISOString(),
          directError: String(directError?.message || directError),
          snapshotError: String(snapshotError?.message || snapshotError),
        };
        throw directError;
      }
    }
  };

  window.__rhkearthWeatherTransport = {
    getState: () => JSON.parse(JSON.stringify(transports)),
    maxSnapshotAgeMs,
  };
})();
