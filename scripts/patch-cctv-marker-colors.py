from pathlib import Path
import re

ROOT = Path.cwd()
CCTV = '#56C8BE'
ACTIVE = '#F0C66F'
DARK = '#07100E'


def replace_once(path, old, new, label):
    target = ROOT / path
    text = target.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'RHKEARTH CCTV color patch target missing ({label}) in {path}')
    target.write_text(text.replace(old, new, 1), encoding='utf-8')


def replace_color_constant(path, name, css, alpha):
    target = ROOT / path
    text = target.read_text(encoding='utf-8')
    pattern = rf"const {re.escape(name)} = Cesium\.Color\.fromCssColorString\('[^']+'\)\.withAlpha\([^)]+\);"
    replacement = f"const {name} = Cesium.Color.fromCssColorString('{css}').withAlpha({alpha});"
    text, count = re.subn(pattern, replacement, text, count=1)
    if count != 1:
        raise SystemExit(f'RHKEARTH CCTV color constant missing: {name}')
    target.write_text(text, encoding='utf-8')


# Base CCTV cameras: a distinct, readable turquoise at rest; amber only for the
# actively selected camera. Keep coverage geometry subdued so the globe does
# not become visually noisy when the layer is dense.
replace_color_constant('src/data/cctv.js', 'IDLE_CAMERA_COLOR', CCTV, '0.88')
replace_color_constant('src/data/cctv.js', 'ACTIVE_CAMERA_COLOR', ACTIVE, '0.96')

# Chicago live cameras use the same CCTV language as the worldwide catalog.
replace_once(
    'src/data/chicagoLiveCameras.js',
    """        pixelSize: 5.5,
        color: Cesium.Color.fromCssColorString('#c3c8c2').withAlpha(0.66),
        outlineColor: Cesium.Color.fromCssColorString('#101210').withAlpha(0.76),
        outlineWidth: 1,""",
    """        pixelSize: 6.0,
        color: Cesium.Color.fromCssColorString('#56C8BE').withAlpha(0.84),
        outlineColor: Cesium.Color.fromCssColorString('#07100E').withAlpha(0.94),
        outlineWidth: 1.4,""",
    'Chicago marker treatment',
)

# Worldwide points previously used pale gray-green and gave rolling-video feeds
# slightly stronger visual weight. Make every camera the same readable marker;
# feed type belongs in the camera panel, not in globe prominence.
replace_once(
    'src/data/worldwideCameras.js',
    """      pixelSize: hasVideo ? 4.8 : 4.2,
      color: Cesium.Color.fromCssColorString('#c7cbc5').withAlpha(hasVideo ? 0.72 : 0.58),
      outlineColor: Cesium.Color.fromCssColorString('#101210').withAlpha(0.74),
      outlineWidth: 0.8,""",
    """      pixelSize: 5.3,
      color: Cesium.Color.fromCssColorString('#56C8BE').withAlpha(0.82),
      outlineColor: Cesium.Color.fromCssColorString('#07100E').withAlpha(0.94),
      outlineWidth: 1.3,""",
    'worldwide marker treatment',
)

# The variable may still be useful for viewer behavior, but marker prominence no
# longer depends on media type. Silence lint/minifier concerns explicitly.
world = ROOT / 'src/data/worldwideCameras.js'
world_text = world.read_text(encoding='utf-8')
world_text = world_text.replace(
    "    const hasVideo = !!availableVideoUrl(row);\n    _points.add({",
    "    const hasVideo = !!availableVideoUrl(row);\n    void hasVideo; // media type is intentionally not encoded in marker prominence\n    _points.add({",
    1,
)
world.write_text(world_text, encoding='utf-8')

checks = {
    'base turquoise': "IDLE_CAMERA_COLOR = Cesium.Color.fromCssColorString('#56C8BE')" in (ROOT / 'src/data/cctv.js').read_text(encoding='utf-8'),
    'active amber': "ACTIVE_CAMERA_COLOR = Cesium.Color.fromCssColorString('#F0C66F')" in (ROOT / 'src/data/cctv.js').read_text(encoding='utf-8'),
    'Chicago turquoise': "Cesium.Color.fromCssColorString('#56C8BE').withAlpha(0.84)" in (ROOT / 'src/data/chicagoLiveCameras.js').read_text(encoding='utf-8'),
    'worldwide turquoise': "Cesium.Color.fromCssColorString('#56C8BE').withAlpha(0.82)" in (ROOT / 'src/data/worldwideCameras.js').read_text(encoding='utf-8'),
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('RHKEARTH CCTV marker color validation failed: ' + ', '.join(failed))

print('RHKEARTH CCTV markers recolored: readable muted turquoise + dark outline; selected camera amber')
