from pathlib import Path
import shutil

# This script runs from the upstream _gev checkout after `vite build`.
dist = Path('dist')
nested_cesium = dist / 'experimental' / 'cesium'
target_cesium = dist / 'cesium'
if nested_cesium.exists():
    if target_cesium.exists():
        shutil.rmtree(target_cesium)
    shutil.move(str(nested_cesium), str(target_cesium))
    try:
        (dist / 'experimental').rmdir()
    except OSError:
        pass
if not (target_cesium / 'Cesium.js').exists():
    raise SystemExit('Cesium runtime was not published to dist/cesium')

text_ext = {'.html', '.js', '.css', '.json', '.svg', '.txt', '.md'}
replacements = {
    '/models/': '/experimental/models/',
    '"/logo.svg"': '"/experimental/logo.svg"',
    "'/logo.svg'": "'/experimental/logo.svg'",
    '"/mic.svg"': '"/experimental/mic.svg"',
    "'/mic.svg'": "'/experimental/mic.svg'",
    '"/pin.svg"': '"/experimental/pin.svg"',
    "'/pin.svg'": "'/experimental/pin.svg'",
    '"/location.svg"': '"/experimental/location.svg"',
    "'/location.svg'": "'/experimental/location.svg'",
    '"/visual-presets.svg"': '"/experimental/visual-presets.svg"',
    "'/visual-presets.svg'": "'/experimental/visual-presets.svg'",
}
for path in dist.rglob('*'):
    if not path.is_file() or path.suffix.lower() not in text_ext:
        continue
    try:
        text = path.read_text()
    except UnicodeDecodeError:
        continue
    new = text
    for old, repl in replacements.items():
        new = new.replace(old, repl)
    new = new.replace("GOD'S EYE VIEW", 'RHKEARTH EXPERIMENTAL')
    new = new.replace("God's Eye View", 'RHKEARTH Experimental')
    if new != text:
        path.write_text(new)

index = dist / 'index.html'
html = index.read_text()
html = html.replace('<head>', '<head>\n<meta name="robots" content="noindex,nofollow,noarchive">', 1)
index.write_text(html)

brand = Path('../rhkearth-logo.svg')
(dist / 'logo.svg').write_text(brand.read_text())

for source, target in [
    ('LICENSE', 'UPSTREAM_LICENSE.txt'),
    ('DATA_SOURCES.md', 'DATA_SOURCES.md'),
    ('public/models/README.md', 'MODEL_ATTRIBUTIONS.md'),
]:
    src = Path(source)
    if src.exists():
        (dist / target).write_text(src.read_text())

print('RHKEARTH Experimental bundle adaptation complete')
