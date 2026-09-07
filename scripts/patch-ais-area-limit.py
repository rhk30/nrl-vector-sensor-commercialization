from pathlib import Path
import re

ROOT = Path.cwd()
TARGET = ROOT / 'src/data/aisLiveVessels.js'
text = TARGET.read_text(encoding='utf-8')

marker = 'RHKEARTH_AIS_GLOBAL_TILE_CACHE_V4'

bbox_pattern = re.compile(
    r"// RHKEARTH_AIS_ANON_AREA_LIMIT_V3.*?\nfunction currentAisViewportBbox\(\) \{.*?\n\}\n\nfunction liveApiUrl\(\) \{.*?\n\}",
    re.S,
)
replacement = r'''// RHKEARTH_AIS_GLOBAL_TILE_CACHE_V4
// Open Waters anonymous requests are capped at 100 square degrees. Build a
// deterministic worldwide grid of 9°×9° cells (81 sq° each), fetch them in
// batches, and merge vessel state by MMSI. The active viewport is prioritized,
// but vessels from already fetched cells remain rendered instead of disappearing
// when the operator pans away.
const AIS_TILE_DEG = 9;
const AIS_TILE_BATCH = 6;
const AIS_GLOBAL_REFRESH_MS = 180000;
const aisGlobalRows = new Map();
let aisTileCursor = 0;
let aisLastGlobalSweepAt = 0;

function aisWorldTiles() {
  const tiles = [];
  for (let south = -81; south < 90; south += AIS_TILE_DEG) {
    const north = Math.min(90, south + AIS_TILE_DEG);
    for (let west = -180; west < 180; west += AIS_TILE_DEG) {
      const east = Math.min(180, west + AIS_TILE_DEG);
      tiles.push([south, west, north, east]);
    }
  }
  return tiles;
}

const AIS_WORLD_TILES = aisWorldTiles();

function tileContains(tile, lat, lon) {
  return lat >= tile[0] && lat <= tile[2] && lon >= tile[1] && lon <= tile[3];
}

function currentAisViewportCenter() {
  const viewer = state.viewer;
  const camera = viewer?.camera;
  const ellipsoid = viewer?.scene?.globe?.ellipsoid || Cesium.Ellipsoid.WGS84;
  try {
    const canvas = viewer?.scene?.canvas;
    const center = canvas
      ? camera?.pickEllipsoid?.(
          new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2),
          ellipsoid,
        )
      : null;
    const carto = center ? ellipsoid.cartesianToCartographic(center) : camera?.positionCartographic;
    if (carto) {
      const lat = Cesium.Math.toDegrees(carto.latitude);
      const lon = Cesium.Math.toDegrees(carto.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return [lat, lon];
    }
  } catch { /* fall through */ }
  return [39.5, -98.35];
}

function orderedAisTiles() {
  const [lat, lon] = currentAisViewportCenter();
  const local = AIS_WORLD_TILES.findIndex((tile) => tileContains(tile, lat, lon));
  if (local < 0) return AIS_WORLD_TILES;
  return [
    AIS_WORLD_TILES[local],
    ...AIS_WORLD_TILES.slice(local + 1),
    ...AIS_WORLD_TILES.slice(0, local),
  ];
}

function aisUrlForTile(tile) {
  const base = import.meta.env?.VITE_AIS_LIVE_API_URL || DEFAULT_API_URL;
  const url = new URL(base, window.location.origin);
  if (url.hostname === 'ais.openwaters.io' && url.pathname === '/v1/vessels') {
    url.searchParams.set('bbox', tile.map((n) => Number(n).toFixed(4)).join(','));
    return url.toString();
  }
  url.searchParams.set('maxRows', String(renderRowLimit()));
  return url.toString();
}

function mergeGlobalAisRows(rows) {
  for (const row of rows || []) {
    const key = String(row?.mmsi || row?.id || '').trim();
    if (!key) continue;
    const previous = aisGlobalRows.get(key);
    const nextSeen = Number(row?.last_position_epoch || 0);
    const prevSeen = Number(previous?.last_position_epoch || 0);
    if (!previous || nextSeen >= prevSeen) aisGlobalRows.set(key, row);
  }
  return Array.from(aisGlobalRows.values());
}

async function fetchAisTile(tile, signal) {
  const response = await fetch(aisUrlForTile(tile), { signal, cache: 'no-store', mode: 'cors' });
  if (!response.ok) throw new Error(`AIS HTTP ${response.status}`);
  const geo = await response.json();
  return (geo?.features || []).map((feature) => {
    const p = feature?.properties || {};
    const c = feature?.geometry?.coordinates || [];
    return {
      mmsi: p.mmsi ?? feature?.id ?? '',
      name: p.name || '',
      imo: p.imo ?? p.imo_number ?? '',
      callsign: p.callsign ?? p.call_sign ?? '',
      type: p.type ?? p.kind ?? '',
      destination: p.destination ?? p.dest ?? '',
      length: p.length ?? p.length_m ?? null,
      width: p.width ?? p.beam ?? p.beam_m ?? null,
      draught: p.draught ?? p.draft ?? p.draught_m ?? null,
      speed: p.sog,
      course: p.cog,
      heading: p.heading,
      lon: Number(c[0]),
      lat: Number(c[1]),
      last_position_UTC: p.seen || '',
      last_position_epoch: p.seen ? Date.parse(p.seen) / 1000 : 0,
    };
  }).filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon));
}

async function fetchGlobalAisBatch(signal) {
  const ordered = orderedAisTiles();
  const now = Date.now();
  if (now - aisLastGlobalSweepAt > AIS_GLOBAL_REFRESH_MS) {
    aisTileCursor = 0;
    aisLastGlobalSweepAt = now;
  }
  const tiles = [];
  for (let i = 0; i < AIS_TILE_BATCH; i += 1) {
    tiles.push(ordered[(aisTileCursor + i) % ordered.length]);
  }
  aisTileCursor = (aisTileCursor + AIS_TILE_BATCH) % ordered.length;
  const settled = await Promise.allSettled(tiles.map((tile) => fetchAisTile(tile, signal)));
  const fresh = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') fresh.push(...result.value);
    else console.warn('[Data:ais] global tile fetch failed', result.reason);
  }
  return mergeGlobalAisRows(fresh);
}

function liveApiUrl() {
  const ordered = orderedAisTiles();
  return aisUrlForTile(ordered[0]);
}'''
text, count = bbox_pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit('RHKEARTH AIS V3 helper block not found')

# Replace the single-request Open Waters fetch path with progressive worldwide batches.
fetch_pattern = re.compile(
    r"const response = await fetch\(liveApiUrl\(\), \{.*?payload = \{\n        status: 'live',\n        rows,",
    re.S,
)
fetch_replacement = r'''const rows = await fetchGlobalAisBatch(AbortSignal.timeout(15000));
      const newestSeenAt = rows.reduce((latest, row) => {
        const ms = Number(row.last_position_epoch) * 1000;
        return Number.isFinite(ms) && ms > latest ? ms : latest;
      }, 0);
      payload = {
        status: 'live',
        rows,'''
text, fetch_count = fetch_pattern.subn(fetch_replacement, text, count=1)
if fetch_count != 1:
    raise SystemExit('RHKEARTH AIS single-fetch block not found')

# Remove duplicate newestSeenAt declaration left by the previous V3 patch if present.
text = re.sub(
    r"\n      const newestSeenAt = rows\.reduce\(\(latest, row\) => \{\n        const ms = Number\(row\.last_position_epoch\) \* 1000;\n        return Number\.isFinite\(ms\) && ms > latest \? ms : latest;\n      \}, 0\);\n      payload = \{\n        status: 'live',\n        rows,\n      const newestSeenAt = rows\.reduce.*?\n      payload = \{\n        status: 'live',\n        rows,",
    "\n      const newestSeenAt = rows.reduce((latest, row) => {\n        const ms = Number(row.last_position_epoch) * 1000;\n        return Number.isFinite(ms) && ms > latest ? ms : latest;\n      }, 0);\n      payload = {\n        status: 'live',\n        rows,",
    text,
    flags=re.S,
)

text = text.replace("buildTag: 'RHKEARTH_AIS_ANON_AREA_LIMIT_V3',", "buildTag: 'RHKEARTH_AIS_GLOBAL_TILE_CACHE_V4',")
TARGET.write_text(text, encoding='utf-8')

patched = TARGET.read_text(encoding='utf-8')
checks = [marker, 'AIS_WORLD_TILES', 'AIS_TILE_BATCH', 'fetchGlobalAisBatch', 'mergeGlobalAisRows', "buildTag: 'RHKEARTH_AIS_GLOBAL_TILE_CACHE_V4'"]
for needle in checks:
    if needle not in patched:
        raise SystemExit('AIS global tile contract missing: ' + needle)

print('RHKEARTH AIS repaired: progressive global tiles retained and deduped by MMSI')
