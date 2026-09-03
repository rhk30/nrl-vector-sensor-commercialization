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

print('RHKEARTH selected aircraft/vessel details expanded')
