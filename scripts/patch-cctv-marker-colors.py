from pathlib import Path
import re

ROOT = Path.cwd()
CCTV = '#A8B989'
ACTIVE = '#E5C777'
DARK = '#0C1009'


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


# CCTV should be obvious without becoming the loudest layer on the globe.
# A subdued sage channel separates cameras from cyan aircraft, amber military,
# teal vessels and violet space assets without the neon-blue cast of the prior
# treatment. Selected cameras use a warm gold accent.
replace_color_constant('src/data/cctv.js', 'IDLE_CAMERA_COLOR', CCTV, '0.86')
replace_color_constant('src/data/cctv.js', 'ACTIVE_CAMERA_COLOR', ACTIVE, '0.96')

# Regional cameras use the same restrained visual language.
replace_once(
    'src/data/chicagoLiveCameras.js',
    """        pixelSize: 5.5,
        color: Cesium.Color.fromCssColorString('#c3c8c2').withAlpha(0.66),
        outlineColor: Cesium.Color.fromCssColorString('#101210').withAlpha(0.76),
        outlineWidth: 1,""",
    """        pixelSize: 5.5,
        color: Cesium.Color.fromCssColorString('#A8B989').withAlpha(0.82),
        outlineColor: Cesium.Color.fromCssColorString('#0C1009').withAlpha(0.94),
        outlineWidth: 1.2,""",
    'regional marker treatment',
)

# Worldwide CCTV is intentionally a little smaller and calmer than before.
# Thousands of cameras should read as a layer, not a field of glowing pixels.
replace_once(
    'src/data/worldwideCameras.js',
    """      pixelSize: hasVideo ? 4.8 : 4.2,
      color: Cesium.Color.fromCssColorString('#c7cbc5').withAlpha(hasVideo ? 0.72 : 0.58),
      outlineColor: Cesium.Color.fromCssColorString('#101210').withAlpha(0.74),
      outlineWidth: 0.8,""",
    """      pixelSize: 4.8,
      color: Cesium.Color.fromCssColorString('#A8B989').withAlpha(0.76),
      outlineColor: Cesium.Color.fromCssColorString('#0C1009').withAlpha(0.94),
      outlineWidth: 1.1,""",
    'worldwide marker treatment',
)

# Media format belongs in the details panel, not in marker prominence.
world = ROOT / 'src/data/worldwideCameras.js'
world_text = world.read_text(encoding='utf-8')
world_text = world_text.replace(
    "    const hasVideo = !!availableVideoUrl(row);\n    _points.add({",
    "    const hasVideo = !!availableVideoUrl(row);\n    void hasVideo; // media type is intentionally not encoded in marker prominence\n    _points.add({",
    1,
)
world.write_text(world_text, encoding='utf-8')

checks = {
    'base sage': "IDLE_CAMERA_COLOR = Cesium.Color.fromCssColorString('#A8B989')" in (ROOT / 'src/data/cctv.js').read_text(encoding='utf-8'),
    'active gold': "ACTIVE_CAMERA_COLOR = Cesium.Color.fromCssColorString('#E5C777')" in (ROOT / 'src/data/cctv.js').read_text(encoding='utf-8'),
    'regional sage': "Cesium.Color.fromCssColorString('#A8B989').withAlpha(0.82)" in (ROOT / 'src/data/chicagoLiveCameras.js').read_text(encoding='utf-8'),
    'worldwide sage': "Cesium.Color.fromCssColorString('#A8B989').withAlpha(0.76)" in (ROOT / 'src/data/worldwideCameras.js').read_text(encoding='utf-8'),
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('RHKEARTH CCTV marker color validation failed: ' + ', '.join(failed))

print('RHKEARTH CCTV markers refined: subdued sage + dark outline; selected camera warm gold')
