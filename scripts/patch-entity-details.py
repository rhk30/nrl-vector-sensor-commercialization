from pathlib import Path

ROOT = Path.cwd()


def replace(path, old, new, *, count=1):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'Patch target missing in {path}: {old[:140]!r}')
    p.write_text(text.replace(old, new, count), encoding='utf-8')


# -----------------------------------------------------------------------------
# AIRCRAFT SELECTED READOUT
# Keep the compact first line, then expose identification and motion fields that
# already exist in the live ADS-B/OpenSky + adsbdb metadata. Never infer missing
# registration/operator/type data.
# -----------------------------------------------------------------------------
replace(
    'src/data/flights.js',
    """  if (info.route && _routeIsPlausible(icao24, info.route)) {
    lines.push(`${info.route.origin.code} → ${info.route.destination.code}`);
  }
  return lines.join('\\n');
""",
    """  if (info.route && _routeIsPlausible(icao24, info.route)) {
    lines.push(`${info.route.origin.code} → ${info.route.destination.code}`);
  }

  const identifiers = [
    info.registration ? `REG ${String(info.registration).trim().toUpperCase()}` : '',
    `ICAO ${String(icao24).trim().toUpperCase()}`,
    info.originCountry ? String(info.originCountry).trim() : '',
  ].filter(Boolean);
  if (identifiers.length) lines.push(identifiers.join(' · '));

  const heading = Number.isFinite(info.true_track) ? `HDG ${Math.round(info.true_track)}°` : '';
  const verticalFpm = Number.isFinite(info.verticalRate)
    ? Math.round(info.verticalRate * 196.850394)
    : null;
  const vertical = verticalFpm === null
    ? ''
    : verticalFpm > 50
      ? `CLIMB +${verticalFpm.toLocaleString('en-US')} fpm`
      : verticalFpm < -50
        ? `DESCENT ${verticalFpm.toLocaleString('en-US')} fpm`
        : 'LEVEL';
  const motion = [heading, vertical].filter(Boolean);
  if (motion.length) lines.push(motion.join(' · '));

  return lines.join('\\n');
""",
)

# Expand the shared selected-aircraft context payload as well, so any detail
# drawer/assistant surface has the same real fields as the visual readout.
replace(
    'src/data/flights.js',
    """      heading: Number.isFinite(described.track) ? `${Math.round(described.track)}°` : '',
      route: route || '',
      icao24,
""",
    """      heading: Number.isFinite(described.track) ? `${Math.round(described.track)}°` : '',
      verticalRate: Number.isFinite(described.verticalRateMps)
        ? `${Math.round(described.verticalRateMps * 196.850394)} fpm`
        : '',
      aircraftClass: described.aircraftClass || '',
      originCountry: described.originCountry || '',
      route: route || '',
      icao24,
""",
)


# -----------------------------------------------------------------------------
# SHIP DATA + SELECTED READOUT
# Preserve additional fields when Open Waters exposes them. The normalizer and
# card only display values actually present in the provider payload.
# -----------------------------------------------------------------------------
replace(
    'src/data/aisLiveVessels.js',
    """          mmsi: p.mmsi ?? feature?.id ?? '',
          name: p.name || '',
          type: p.type ?? p.kind ?? '',
          speed: p.sog,
          course: p.cog,
          heading: p.heading,
          last_position_UTC: p.seen || '',
""",
    """          mmsi: p.mmsi ?? feature?.id ?? '',
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
          last_position_UTC: p.seen || '',
""",
)

replace(
    'src/data/aisLiveVessels.js',
    """    imo: String(row.imo || ''),
    type: String(row.type_specific || row.type || ''),
    destination: String(row.destination || ''),
    speed: finiteNumber(row.speed),
""",
    """    imo: String(row.imo || ''),
    callsign: String(row.callsign || row.call_sign || ''),
    type: String(row.type_specific || row.type || ''),
    destination: String(row.destination || ''),
    length: finiteNumber(row.length),
    width: finiteNumber(row.width),
    draught: finiteNumber(row.draught),
    speed: finiteNumber(row.speed),
""",
)

replace(
    'src/data/aisLiveVessels.js',
    """export function buildSelectedVesselCard(record) {
  const direction = record.heading ?? record.course;
  const details = [[
    vesselTypeShort(record) || 'VESSEL',
    formatSpeed(record.speed),
    Number.isFinite(direction) ? `${Math.round(direction)}°` : '--°',
  ].join(' · ')];
  const destination = String(record.destination || '').trim();
  if (destination) details.push(`→ ${trimHudValue(destination, 24)}`);
  const stale = (record.missedRefreshes || 0) > 0;
  details.push(`MMSI ${record.mmsi || '--'} · ${formatPositionTime(record)}${stale ? ' · STALE' : ''}`);
""",
    """export function buildSelectedVesselCard(record) {
  const direction = record.heading ?? record.course;
  const directionLabel = Number.isFinite(record.heading)
    ? `HDG ${Math.round(record.heading)}°`
    : Number.isFinite(record.course)
      ? `COG ${Math.round(record.course)}°`
      : '';
  const details = [[
    vesselTypeShort(record) || 'VESSEL',
    formatSpeed(record.speed),
    directionLabel,
  ].filter(Boolean).join(' · ')];

  const destination = String(record.destination || '').trim();
  if (destination) details.push(`DEST ${trimHudValue(destination, 24)}`);

  const identifiers = [
    record.mmsi ? `MMSI ${record.mmsi}` : '',
    String(record.imo || '').trim() ? `IMO ${String(record.imo).trim()}` : '',
    String(record.callsign || '').trim() ? `CALL ${String(record.callsign).trim().toUpperCase()}` : '',
  ].filter(Boolean);
  if (identifiers.length) details.push(identifiers.join(' · '));

  const dimensions = [
    Number.isFinite(record.length) ? `L ${Math.round(record.length)} m` : '',
    Number.isFinite(record.width) ? `B ${Math.round(record.width)} m` : '',
    Number.isFinite(record.draught) ? `DRAFT ${record.draught.toFixed(1)} m` : '',
  ].filter(Boolean);
  if (dimensions.length) details.push(dimensions.join(' · '));

  if (Number.isFinite(record.lat) && Number.isFinite(record.lon)) {
    details.push(`${record.lat.toFixed(4)}, ${record.lon.toFixed(4)}`);
  }
  const stale = (record.missedRefreshes || 0) > 0;
  details.push(`${formatPositionTime(record)}${stale ? ' · STALE' : ''}`);
""",
)

replace(
    'src/data/aisLiveVessels.js',
    """        mmsi: record.mmsi,
        type: record.type,
        speedKt: record.speed,
        course: record.course,
        destination: record.destination,
""",
    """        mmsi: record.mmsi,
        imo: record.imo,
        callsign: record.callsign,
        type: record.type,
        speedKt: record.speed,
        course: record.course,
        heading: record.heading,
        destination: record.destination,
        lengthM: record.length,
        widthM: record.width,
        draughtM: record.draught,
        lastPositionUtc: record.lastPositionUtc,
""",
)


# -----------------------------------------------------------------------------
# LIVE AIS TRANSPORT REPAIR
# The earlier static-host adapter requested Open Waters' entire worldwide vessel
# cache in one browser fetch. That is unnecessarily large and can exceed the
# layer's 10-second request timeout. Query the current map window instead, while
# retaining worldwide availability as the operator pans around the globe.
# Open Waters documents GET /v1/vessels?bbox=minLat,minLon,maxLat,maxLon and
# exposes it with browser CORS enabled. No synthetic vessel positions are used.
# -----------------------------------------------------------------------------
replace(
    'src/data/aisLiveVessels.js',
    "const REFRESH_MS = 60000;",
    "const REFRESH_MS = 20000;",
)

replace(
    'src/data/aisLiveVessels.js',
    "  source: 'AISStream',",
    "  source: 'Open Waters AIS · LIVE',",
)

replace(
    'src/data/aisLiveVessels.js',
    """function liveApiUrl() {
  const base = import.meta.env?.VITE_AIS_LIVE_API_URL || DEFAULT_API_URL;
  if (String(base).startsWith('https://ais.openwaters.io/')) return String(base);
  const url = new URL(base, window.location.origin);
  url.searchParams.set('maxRows', String(renderRowLimit()));
  return url.toString();
}""",
    """function currentAisViewportBbox() {
  const viewer = state.viewer;
  const camera = viewer?.camera;
  const ellipsoid = viewer?.scene?.globe?.ellipsoid;
  const rect = camera?.computeViewRectangle?.(ellipsoid);

  if (rect) {
    let minLat = Cesium.Math.toDegrees(rect.south);
    let maxLat = Cesium.Math.toDegrees(rect.north);
    let minLon = Cesium.Math.toDegrees(rect.west);
    let maxLon = Cesium.Math.toDegrees(rect.east);
    const latSpan = maxLat - minLat;
    let lonSpan = maxLon - minLon;
    if (lonSpan < 0) lonSpan += 360;

    // A near-global rectangle defeats the purpose of bounded live loading.
    // Use the camera center with a generous regional window instead. The feed
    // remains worldwide because this window follows the operator around Earth.
    if (Number.isFinite(latSpan) && Number.isFinite(lonSpan)
        && latSpan > 0 && latSpan <= 80 && lonSpan > 0 && lonSpan <= 140
        && minLon <= maxLon) {
      return [
        Math.max(-90, minLat),
        Math.max(-180, minLon),
        Math.min(90, maxLat),
        Math.min(180, maxLon),
      ];
    }
  }

  const carto = camera?.positionCartographic;
  const lat = carto ? Cesium.Math.toDegrees(carto.latitude) : 39.5;
  const lon = carto ? Cesium.Math.toDegrees(carto.longitude) : -98.35;
  const safeLat = Number.isFinite(lat) ? lat : 39.5;
  const safeLon = Number.isFinite(lon) ? lon : -98.35;
  return [
    Math.max(-90, safeLat - 32),
    Math.max(-180, safeLon - 55),
    Math.min(90, safeLat + 32),
    Math.min(180, safeLon + 55),
  ];
}

function liveApiUrl() {
  const base = import.meta.env?.VITE_AIS_LIVE_API_URL || DEFAULT_API_URL;
  if (String(base).startsWith('https://ais.openwaters.io/')) {
    const url = new URL(String(base));
    url.searchParams.set('bbox', currentAisViewportBbox().map((n) => n.toFixed(4)).join(','));
    return url.toString();
  }
  const url = new URL(base, window.location.origin);
  url.searchParams.set('maxRows', String(renderRowLimit()));
  return url.toString();
}""",
)

# Preserve the provider's real position freshness. /v1/vessels contains ships
# seen within the last 30 minutes; stamping Date.now() made old-but-valid fixes
# look instantaneous. Use the newest actual `seen` value in the returned box.
replace(
    'src/data/aisLiveVessels.js',
    """      payload = {
        status: 'live',
        rows,
        lastMessageAt: Date.now(),
        newestPositionAt: Date.now(),
        refreshing: false,
        source: 'Open Waters AIS',
      };""",
    """      const newestSeenAt = rows.reduce((latest, row) => {
        const ms = Number(row.last_position_epoch) * 1000;
        return Number.isFinite(ms) && ms > latest ? ms : latest;
      }, 0);
      payload = {
        status: 'live',
        rows,
        lastMessageAt: newestSeenAt || null,
        newestPositionAt: newestSeenAt || null,
        refreshing: false,
        source: 'Open Waters AIS',
      };""",
)

print('RHKEARTH selected aircraft/vessel details expanded; live AIS viewport loading repaired')
