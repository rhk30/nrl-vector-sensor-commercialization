#!/usr/bin/env python3
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / 'experimental-data'
CABLE_OUT = OUT_DIR / 'submarine-cables-osm.geojson'
LANDING_OUT = OUT_DIR / 'submarine-cable-landings-osm.geojson'

MIRRORS = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass-api.de/api/interpreter',
]

# Six 60-degree longitude tiles keep individual Overpass responses bounded while
# still producing a global snapshot. Ways/relations are deduplicated by OSM id.
TILES = [(-85, west, 85, west + 60) for west in range(-180, 180, 60)]


def request_overpass(query: str, attempts: int = 3) -> dict:
    encoded = urllib.parse.urlencode({'data': query}).encode('utf-8')
    last_error: Exception | None = None
    for round_no in range(attempts):
        for endpoint in MIRRORS:
            try:
                req = urllib.request.Request(
                    endpoint,
                    data=encoded,
                    headers={
                        'User-Agent': 'RHKEARTH/1.0 submarine-cable-cache',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                    },
                    method='POST',
                )
                with urllib.request.urlopen(req, timeout=150) as response:
                    payload = json.load(response)
                if isinstance(payload, dict) and isinstance(payload.get('elements'), list):
                    return payload
                raise RuntimeError(f'invalid Overpass payload from {endpoint}')
            except Exception as exc:
                last_error = exc
                print(f'WARN Overpass failure {endpoint} round={round_no + 1}: {exc}')
                time.sleep(2 + round_no * 2)
    raise RuntimeError(f'all Overpass mirrors failed: {last_error}')


def cable_query(bbox: tuple[int, int, int, int]) -> str:
    south, west, north, east = bbox
    box = f'({south},{west},{north},{east})'
    return f'''[out:json][timeout:120];
(
  way["communication"="line"]["submarine"="yes"]{box};
  way["communication"="line"]["location"="underwater"]{box};
  way["communication"="line"]["seamark:type"="cable_submarine"]{box};
  way["seamark:type"="cable_submarine"]["seamark:cable_submarine:category"~"telephone|fibre_optic"]{box};
  relation["communication"="line"]["submarine"="yes"]{box};
  relation["communication"="line"]["location"="underwater"]{box};
  relation["communication"="line"]["seamark:type"="cable_submarine"]{box};
  relation["seamark:type"="cable_submarine"]["seamark:cable_submarine:category"~"telephone|fibre_optic"]{box};
);
out tags geom;'''


def landing_query() -> str:
    return '''[out:json][timeout:120];
node["telecom"="cable_landing_station"];
out tags;'''


def properties(element: dict, fallback: str) -> dict:
    tags = element.get('tags') or {}
    osm_type = str(element.get('type') or '')
    osm_id = element.get('id')
    name = str(tags.get('name') or tags.get('ref') or fallback).strip()
    return {
        'id': f'osm-{osm_type}-{osm_id}',
        'name': name,
        'operator': str(tags.get('operator') or '').strip(),
        'source': 'OpenStreetMap',
        'license': 'ODbL-1.0',
        'osm_type': osm_type,
        'osm_id': osm_id,
    }


def coords(geometry) -> list[list[float]]:
    result: list[list[float]] = []
    for point in geometry or []:
        try:
            lon = float(point['lon'])
            lat = float(point['lat'])
        except (KeyError, TypeError, ValueError):
            continue
        if -180 <= lon <= 180 and -90 <= lat <= 90:
            result.append([lon, lat])
    return result


def cable_feature(element: dict) -> dict | None:
    kind = element.get('type')
    prop = properties(element, 'Submarine cable')
    if kind == 'way':
        line = coords(element.get('geometry'))
        if len(line) < 2:
            return None
        geometry = {'type': 'LineString', 'coordinates': line}
    elif kind == 'relation':
        lines = [coords(member.get('geometry')) for member in element.get('members') or []]
        lines = [line for line in lines if len(line) >= 2]
        if not lines:
            return None
        geometry = (
            {'type': 'LineString', 'coordinates': lines[0]}
            if len(lines) == 1
            else {'type': 'MultiLineString', 'coordinates': lines}
        )
    else:
        return None
    return {'type': 'Feature', 'id': prop['id'], 'properties': prop, 'geometry': geometry}


def landing_feature(element: dict) -> dict | None:
    try:
        lat = float(element['lat'])
        lon = float(element['lon'])
    except (KeyError, TypeError, ValueError):
        return None
    if not (-180 <= lon <= 180 and -90 <= lat <= 90):
        return None
    prop = properties(element, 'Cable landing station')
    prop['coordinates'] = [lon, lat]
    return {
        'type': 'Feature',
        'id': prop['id'],
        'properties': prop,
        'geometry': {'type': 'Point', 'coordinates': [lon, lat]},
    }


def collection(features: list[dict], source: str) -> dict:
    return {
        'type': 'FeatureCollection',
        'features': features,
        'attribution': '© OpenStreetMap contributors',
        'license': 'ODbL-1.0',
        'rhkSource': source,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
    }


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + '.tmp')
    tmp.write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    tmp.replace(path)


def main() -> None:
    cable_elements: dict[tuple[str, int], dict] = {}
    for index, tile in enumerate(TILES, start=1):
        payload = request_overpass(cable_query(tile))
        for element in payload.get('elements') or []:
            try:
                key = (str(element['type']), int(element['id']))
            except (KeyError, TypeError, ValueError):
                continue
            cable_elements[key] = element
        print(f'Cable tile {index}/{len(TILES)}: {len(cable_elements)} unique OSM elements')

    cable_features = [feature for feature in map(cable_feature, cable_elements.values()) if feature]
    landing_payload = request_overpass(landing_query())
    landing_features = [feature for feature in map(landing_feature, landing_payload.get('elements') or []) if feature]

    if not cable_features:
        raise SystemExit('No usable OSM submarine cable features returned')
    if not landing_features:
        raise SystemExit('No usable OSM cable landing stations returned')

    write_json(CABLE_OUT, collection(cable_features, 'OpenStreetMap via Overpass; RHKEARTH cached snapshot'))
    write_json(LANDING_OUT, collection(landing_features, 'OpenStreetMap via Overpass; RHKEARTH cached snapshot'))
    print(f'WROTE {CABLE_OUT}: {len(cable_features)} features')
    print(f'WROTE {LANDING_OUT}: {len(landing_features)} features')


if __name__ == '__main__':
    main()
