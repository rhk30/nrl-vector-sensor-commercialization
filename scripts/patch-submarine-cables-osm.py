from pathlib import Path

ROOT = Path.cwd()
TARGET = ROOT / 'src/data/telegeographySubmarineCables.js'
text = TARGET.read_text(encoding='utf-8')

marker = 'RHKEARTH_OSM_SUBMARINE_CABLES_V1'
if marker not in text:
    old_fetch = '''      const [cableJson, landingJson] = await Promise.all([
        fetchJson(cableUrl, abort.signal),
        fetchJson(landingPointUrl, abort.signal),
      ]);'''
    new_fetch = '''      const [cableJson, landingJson] = await Promise.all([
        fetchSubmarineCableJson(cableUrl, abort.signal, 'cable'),
        fetchSubmarineCableJson(landingPointUrl, abort.signal, 'landing'),
      ]);'''
    if old_fetch not in text:
        raise SystemExit('Submarine-cable load fetch block not found')
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
  // RHKEARTH_OSM_SUBMARINE_CABLES_V1
  // The upstream TeleGeography files are intentionally blanked by RHKEARTH
  // because their license is NonCommercial. Populate the layer instead from
  // OpenStreetMap's ODbL telecom mapping through redundant Overpass mirrors.
  const OSM_SUBMARINE_OVERPASS_URLS = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ];

  function submarineOverpassQuery(kind) {
    if (kind === 'landing') {
      return `[out:json][timeout:45];
        node["telecom"="cable_landing_station"];
        out tags;`;
    }
    return `[out:json][timeout:45];
      (
        way["communication"="line"]["submarine"="yes"];
        way["communication"="line"]["location"="underwater"];
        way["communication"="line"]["seamark:type"="cable_submarine"];
        way["seamark:type"="cable_submarine"]["seamark:cable_submarine:category"~"telephone|fibre_optic"];
        relation["communication"="line"]["submarine"="yes"];
        relation["communication"="line"]["location"="underwater"];
        relation["communication"="line"]["seamark:type"="cable_submarine"];
        relation["seamark:type"="cable_submarine"]["seamark:cable_submarine:category"~"telephone|fibre_optic"];
      );
      out tags geom;`;
  }

  function overpassFeature(element, kind) {
    if (!element || !element.type || !Number.isFinite(Number(element.id))) return null;
    const tags = element.tags || {};
    const id = `osm-${element.type}-${element.id}`;
    const name = String(
      tags.name || tags.ref || (kind === 'landing' ? 'Cable landing station' : 'Submarine cable')
    ).trim();
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
      return {
        type: 'Feature', id, properties,
        geometry: { type: 'Point', coordinates: [lon, lat] },
      };
    }

    const lineFromGeometry = (geometry) => (Array.isArray(geometry) ? geometry : [])
      .map((point) => [Number(point?.lon), Number(point?.lat)])
      .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));

    if (element.type === 'way') {
      const coordinates = lineFromGeometry(element.geometry);
      if (coordinates.length < 2) return null;
      return {
        type: 'Feature', id, properties,
        geometry: { type: 'LineString', coordinates },
      };
    }

    if (element.type === 'relation') {
      const lines = (element.members || [])
        .map((member) => lineFromGeometry(member?.geometry))
        .filter((coordinates) => coordinates.length >= 2);
      if (!lines.length) return null;
      return {
        type: 'Feature', id, properties,
        geometry: lines.length === 1
          ? { type: 'LineString', coordinates: lines[0] }
          : { type: 'MultiLineString', coordinates: lines },
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
        if (!response.ok) {
          throw new Error(`Overpass ${response.status} from ${new URL(endpoint).host}`);
        }
        const payload = await response.json();
        const features = (payload?.elements || [])
          .map((element) => overpassFeature(element, kind))
          .filter(Boolean);
        if (!features.length) {
          throw new Error(`OpenStreetMap ${kind} query returned no usable features`);
        }
        return {
          type: 'FeatureCollection',
          features,
          attribution: '© OpenStreetMap contributors',
          license: 'ODbL-1.0',
          rhkSource: 'OpenStreetMap via Overpass',
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
    try {
      const bundled = await fetchJson(url, signal);
      if (Array.isArray(bundled?.features) && bundled.features.length > 0) return bundled;
    } catch (error) {
      if (signal?.aborted) throw error;
      console.warn('[Data:submarine-cables] bundled snapshot unavailable; using OSM', error);
    }
    return fetchOpenStreetMapSubmarine(kind, signal);
  }
'''
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
        if old not in text:
            raise SystemExit('Submarine-cable source patch target missing: ' + old)
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
if old_credit not in credit_text:
    raise SystemExit('Submarine-cable attribution block not found')
credits.write_text(credit_text.replace(old_credit, new_credit, 1), encoding='utf-8')

patched = TARGET.read_text(encoding='utf-8')
for needle in [marker, 'fetchSubmarineCableJson', 'OSM_SUBMARINE_OVERPASS_URLS', "source: 'OpenStreetMap · ODbL',"]:
    if needle not in patched:
        raise SystemExit('Submarine-cable OSM contract missing: ' + needle)
if "key: 'submarine-cables-osm'" not in credits.read_text(encoding='utf-8'):
    raise SystemExit('Submarine-cable OSM attribution missing')

print('RHKEARTH submarine cables repaired with OpenStreetMap/Overpass ODbL fallback')
