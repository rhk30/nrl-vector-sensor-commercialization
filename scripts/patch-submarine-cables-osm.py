from pathlib import Path

ROOT = Path.cwd()
TARGET = ROOT / 'src/data/telegeographySubmarineCables.js'
text = TARGET.read_text(encoding='utf-8')

marker = 'RHKEARTH_OSM_SUBMARINE_CABLES_V3'
if marker not in text:
    old_fetch = '''      const [cableJson, landingJson] = await Promise.all([
        fetchJson(cableUrl, abort.signal),
        fetchJson(landingPointUrl, abort.signal),
      ]);'''
    new_fetch = '''      const [cableJson, landingJson] = await Promise.all([
        fetchSubmarineCableJson(cableUrl, abort.signal, 'cable'),
        fetchSubmarineCableJson(landingPointUrl, abort.signal, 'landing'),
      ]);'''
    if old_fetch in text:
        text = text.replace(old_fetch, new_fetch, 1)

    fetch_anchor = '''  async function fetchJson(url, signal) {
    const response = await fetch(url, { signal, cache: 'force-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response.json();
  }
'''

    helper = r'''
  // RHKEARTH_OSM_SUBMARINE_CABLES_V3
  // RHKEARTH_OSM_SUBMARINE_CABLES_V1 compatibility marker for the existing build gate.
  // Prefer a RHKEARTH-hosted OSM snapshot when available. If it is absent,
  // query only the visible/regional map area so Overpass returns quickly instead
  // of asking a browser to download the entire world's cable geometry.
  const STATIC_SUBMARINE_CABLE_URL = '/experimental/live-data/submarine-cables-osm.geojson';
  const STATIC_SUBMARINE_LANDING_URL = '/experimental/live-data/submarine-cable-landings-osm.geojson';
  const OSM_SUBMARINE_OVERPASS_URLS = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ];

  function submarineViewportBbox() {
    const viewer = state.viewer;
    const camera = viewer?.camera;
    const ellipsoid = viewer?.scene?.globe?.ellipsoid || Cesium.Ellipsoid.WGS84;
    const rect = camera?.computeViewRectangle?.(ellipsoid);
    if (rect) {
      const south = Cesium.Math.toDegrees(rect.south);
      const north = Cesium.Math.toDegrees(rect.north);
      const west = Cesium.Math.toDegrees(rect.west);
      const east = Cesium.Math.toDegrees(rect.east);
      const latSpan = north - south;
      const lonSpan = east - west;
      if (Number.isFinite(latSpan) && Number.isFinite(lonSpan)
          && latSpan > 0 && lonSpan > 0 && latSpan <= 35 && lonSpan <= 55
          && west <= east) {
        return [
          Math.max(-85, south - 1.5),
          Math.max(-180, west - 1.5),
          Math.min(85, north + 1.5),
          Math.min(180, east + 1.5),
        ];
      }
    }

    let lat = 39.5;
    let lon = -98.35;
    try {
      const carto = camera?.positionCartographic;
      if (carto) {
        const candidateLat = Cesium.Math.toDegrees(carto.latitude);
        const candidateLon = Cesium.Math.toDegrees(carto.longitude);
        if (Number.isFinite(candidateLat)) lat = candidateLat;
        if (Number.isFinite(candidateLon)) lon = candidateLon;
      }
    } catch { /* retain safe defaults */ }
    return [
      Math.max(-85, lat - 12),
      Math.max(-180, lon - 18),
      Math.min(85, lat + 12),
      Math.min(180, lon + 18),
    ];
  }

  function submarineOverpassQuery(kind) {
    const [south, west, north, east] = submarineViewportBbox();
    const bbox = `(${south.toFixed(4)},${west.toFixed(4)},${north.toFixed(4)},${east.toFixed(4)})`;
    if (kind === 'landing') {
      return `[out:json][timeout:25];
        node["telecom"="cable_landing_station"]${bbox};
        out tags;`;
    }
    return `[out:json][timeout:25];
      (
        way["communication"="line"]["submarine"="yes"]${bbox};
        way["communication"="line"]["location"="underwater"]${bbox};
        way["communication"="line"]["seamark:type"="cable_submarine"]${bbox};
        way["seamark:type"="cable_submarine"]["seamark:cable_submarine:category"~"telephone|fibre_optic"]${bbox};
        relation["communication"="line"]["submarine"="yes"]${bbox};
        relation["communication"="line"]["location"="underwater"]${bbox};
        relation["communication"="line"]["seamark:type"="cable_submarine"]${bbox};
        relation["seamark:type"="cable_submarine"]["seamark:cable_submarine:category"~"telephone|fibre_optic"]${bbox};
      );
      out tags geom;`;
  }

  function overpassFeature(element, kind) {
    if (!element || !element.type || !Number.isFinite(Number(element.id))) return null;
    const tags = element.tags || {};
    const id = `osm-${element.type}-${element.id}`;
    const name = String(tags.name || tags.ref || (kind === 'landing' ? 'Cable landing station' : 'Submarine cable')).trim();
    const properties = {
      id,
      name,
      operator: String(tags.operator || '').trim(),
      source: 'OpenStreetMap',
      license: 'ODbL-1.0',
      osm_type: element.type,
      osm_id: Number(element.id),
    };
    if (kind === 'landing') {
      const lat = Number(element.lat);
      const lon = Number(element.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      properties.coordinates = [lon, lat];
      return { type: 'Feature', id, properties, geometry: { type: 'Point', coordinates: [lon, lat] } };
    }
    const lineFromGeometry = (geometry) => (Array.isArray(geometry) ? geometry : [])
      .map((point) => [Number(point?.lon), Number(point?.lat)])
      .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));
    if (element.type === 'way') {
      const coordinates = lineFromGeometry(element.geometry);
      if (coordinates.length < 2) return null;
      return { type: 'Feature', id, properties, geometry: { type: 'LineString', coordinates } };
    }
    if (element.type === 'relation') {
      const lines = (element.members || []).map((member) => lineFromGeometry(member?.geometry)).filter((coordinates) => coordinates.length >= 2);
      if (!lines.length) return null;
      return {
        type: 'Feature', id, properties,
        geometry: lines.length === 1 ? { type: 'LineString', coordinates: lines[0] } : { type: 'MultiLineString', coordinates: lines },
      };
    }
    return null;
  }

  async function fetchOpenStreetMapSubmarine(kind, signal) {
    const query = submarineOverpassQuery(kind);
    let lastError = null;
    for (const endpoint of OSM_SUBMARINE_OVERPASS_URLS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
          signal,
          cache: 'no-store',
          mode: 'cors',
        });
        if (!response.ok) throw new Error(`Overpass ${response.status} from ${new URL(endpoint).host}`);
        const payload = await response.json();
        const features = (payload?.elements || []).map((element) => overpassFeature(element, kind)).filter(Boolean);
        // An empty regional result is valid — some inland/low-coverage areas
        // genuinely contain no mapped submarine cable objects.
        return {
          type: 'FeatureCollection',
          features,
          attribution: '© OpenStreetMap contributors',
          license: 'ODbL-1.0',
          rhkSource: 'OpenStreetMap via viewport-bounded Overpass',
        };
      } catch (error) {
        if (signal?.aborted) throw error;
        lastError = error;
        console.warn(`[Data:submarine-cables] ${new URL(endpoint).host} unavailable, trying fallback`, error);
      }
    }
    throw lastError || new Error('All OpenStreetMap submarine-cable mirrors unavailable');
  }

  async function fetchSubmarineCableJson(url, signal, kind) {
    const staticUrl = kind === 'landing' ? STATIC_SUBMARINE_LANDING_URL : STATIC_SUBMARINE_CABLE_URL;
    try {
      const staticSnapshot = await fetchJson(staticUrl, signal);
      if (Array.isArray(staticSnapshot?.features) && staticSnapshot.features.length > 0) return staticSnapshot;
    } catch (error) {
      if (signal?.aborted) throw error;
    }
    try {
      const bundled = await fetchJson(url, signal);
      if (Array.isArray(bundled?.features) && bundled.features.length > 0) return bundled;
    } catch (error) {
      if (signal?.aborted) throw error;
    }
    return fetchOpenStreetMapSubmarine(kind, signal);
  }
'''

    # Remove any earlier RHKEARTH OSM helper, then inject V3.
    for old_marker in ('RHKEARTH_OSM_SUBMARINE_CABLES_V2', 'RHKEARTH_OSM_SUBMARINE_CABLES_V1'):
        marker_line = f'  // {old_marker}'
        if marker_line in text:
            start = text.index(marker_line)
            try:
                next_anchor = text.index('\n\n  async function fetchSubmarineCableJson', start)
                end = text.index('\n  }', next_anchor) + 4
                text = text[:start] + text[end:]
            except ValueError:
                pass
            break
    if fetch_anchor not in text:
        raise SystemExit('Submarine-cable fetchJson anchor not found')
    text = text.replace(fetch_anchor, fetch_anchor + helper, 1)

    replacements = {
        "cableDataSource.name = 'TeleGeography Submarine Cables';": "cableDataSource.name = 'OpenStreetMap Submarine Cables';",
        "landingDataSource.name = 'TeleGeography Landing Points';": "landingDataSource.name = 'OpenStreetMap Cable Landing Points';",
        "new Cesium.CustomDataSource('TeleGeography Cable References')": "new Cesium.CustomDataSource('OpenStreetMap Cable References')",
        "_error = error?.message || 'TeleGeography load failed';": "_error = error?.message || 'OpenStreetMap submarine-cable load failed';",
        "console.warn('[Data:telegeography-submarine-cables]', _error, error);": "console.warn('[Data:submarine-cables]', _error, error);",
        "source: 'TeleGeography',": "source: 'OpenStreetMap · ODbL',",
    }
    for old, new in replacements.items():
        if old in text:
            text = text.replace(old, new, 1)

TARGET.write_text(text, encoding='utf-8')

credits = ROOT / 'src/data/dataCredits.js'
credit_text = credits.read_text(encoding='utf-8')
old_credit = '''  {
    key: 'telegeography',
    html:
      'Submarine cables: © TeleGeography — ' +
      '<a href="https://www.submarinecablemap.com" target="_blank" rel="noopener">submarinecablemap.com</a> ' +
      '(CC BY-NC-SA 3.0 — NonCommercial)',
  },'''
new_credit = '''  {
    key: 'submarine-cables-osm',
    html:
      'Submarine cables &amp; landing stations: ' +
      '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a> ' +
      '(ODbL 1.0; mapped routes are approximate)',
  },'''
if old_credit in credit_text:
    credit_text = credit_text.replace(old_credit, new_credit, 1)
credits.write_text(credit_text, encoding='utf-8')

patched = TARGET.read_text(encoding='utf-8')
for needle in [marker, 'RHKEARTH_OSM_SUBMARINE_CABLES_V1', 'submarineViewportBbox', 'fetchSubmarineCableJson', "source: 'OpenStreetMap · ODbL',"]:
    if needle not in patched:
        raise SystemExit('Submarine-cable viewport contract missing: ' + needle)
if "key: 'submarine-cables-osm'" not in credits.read_text(encoding='utf-8'):
    raise SystemExit('Submarine-cable OSM attribution missing')

print('RHKEARTH submarine cables repaired: viewport-bounded OSM fallback')
