from __future__ import annotations

import json
import os
import tempfile
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'experimental-data' / 'weather'
OUT.mkdir(parents=True, exist_ok=True)

USER_AGENT = 'RHKEARTH/1.0 (public weather dashboard; github.com/rhk30/nrl-vector-sensor-commercialization)'

SOURCES = {
    'nws-alerts.json': {
        'url': 'https://api.weather.gov/alerts/active?status=actual',
        'accept': 'application/geo+json',
        'agency': 'NOAA / National Weather Service',
    },
    'nhc-current-storms.json': {
        'url': 'https://www.nhc.noaa.gov/CurrentStorms.json',
        'accept': 'application/json',
        'agency': 'NOAA / National Hurricane Center',
    },
}


def fetch_json(url: str, accept: str) -> object:
    request = urllib.request.Request(
        url,
        headers={
            'User-Agent': USER_AGENT,
            'Accept': accept,
            'Cache-Control': 'no-cache',
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(f'HTTP {response.status} from {url}')
        return json.load(response)


def atomic_write_json(path: Path, payload: object) -> None:
    fd, temp_name = tempfile.mkstemp(prefix=path.name + '.', dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as handle:
            json.dump(payload, handle, separators=(',', ':'), ensure_ascii=False)
            handle.write('\n')
        os.replace(temp_name, path)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)


def main() -> None:
    fetched_at = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    manifest = {
        'generatedAt': fetched_at,
        'sources': {},
    }
    failures: list[str] = []

    for filename, config in SOURCES.items():
        try:
            payload = fetch_json(config['url'], config['accept'])
            atomic_write_json(OUT / filename, payload)
            manifest['sources'][filename] = {
                'agency': config['agency'],
                'url': config['url'],
                'fetchedAt': fetched_at,
                'status': 'ok',
            }
            print(f"PASS {filename} <- {config['url']}")
        except Exception as error:
            failures.append(f'{filename}: {error}')
            manifest['sources'][filename] = {
                'agency': config['agency'],
                'url': config['url'],
                'fetchedAt': fetched_at,
                'status': 'error',
                'error': str(error),
            }
            print(f"ERROR {filename}: {error}")

    atomic_write_json(OUT / 'manifest.json', manifest)
    if failures:
        # Do not overwrite a previously valid snapshot on a failed fetch. The
        # manifest exposes the failure and timestamp; dashboard code applies a
        # strict age limit before using any fallback file.
        raise SystemExit('Weather refresh incomplete: ' + '; '.join(failures))


if __name__ == '__main__':
    main()
