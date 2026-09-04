from pathlib import Path

ROOT = Path.cwd()


def replace(path, old, new, *, required=True, count=1):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        if required:
            raise SystemExit(f'Patch target missing in {path}: {old[:110]!r}')
        return False
    p.write_text(text.replace(old, new, count), encoding='utf-8')
    return True


# -----------------------------------------------------------------------------
# NOIR: keep the basemap strongly muted, but preserve highly chromatic tactical
# symbology. The previous shader desaturated every Cesium pixel equally, which
# washed asset colors out together with imagery. A chroma mask lets cyan/amber/
# teal/violet contact colors survive while ordinary aerial imagery stays Noir.
# -----------------------------------------------------------------------------
replace(
    'src/styles/noir.js',
    """      // Desaturate
      float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 gray = vec3(luma);
      vec3 desaturated = mix(color.rgb, gray, intensity);
""",
    """      // RHKEARTH selective Noir: heavily desaturate ordinary imagery,
      // while preserving saturated tactical contacts and source symbology.
      float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 gray = vec3(luma);
      float hi = max(max(color.r, color.g), color.b);
      float lo = min(min(color.r, color.g), color.b);
      float chroma = hi - lo;
      float tacticalAccent = smoothstep(0.24, 0.58, chroma);
      float desatAmount = intensity * mix(0.94, 0.20, tacticalAccent);
      vec3 desaturated = mix(color.rgb, gray, desatAmount);
""",
)
replace(
    'src/styles/noir.js',
    """      contrasted += grain;
""",
    """      contrasted += grain * (1.0 - tacticalAccent * 0.75);
""",
)
replace(
    'src/styles/noir.js',
    """      vec3 tinted = mix(contrasted, sepia, 0.15 * intensity);

      vec3 result = tinted * vig;
""",
    """      vec3 tinted = mix(contrasted, sepia, 0.15 * intensity * (1.0 - tacticalAccent * 0.90));

      // Keep edge-of-screen contacts readable; the basemap still receives the
      // full Noir vignette while tactical accents only receive a light vignette.
      float contactVig = mix(vig, 1.0, tacticalAccent * 0.68);
      vec3 result = tinted * contactVig;
""",
)


# -----------------------------------------------------------------------------
# AIR: soft cyan civilian, amber military, brighter selected. These are designed
# to separate classes at a glance without the eye-searing pure #00ffff/#ffb800
# look. Flight trails use the same family as the owning contact.
# -----------------------------------------------------------------------------
flights = ROOT / 'src/data/flights.js'
f = flights.read_text(encoding='utf-8')
f = f.replace(
    "const MIL_TINT = Cesium.Color.fromCssColorString('#FFB800');",
    "const CIV_TINT = Cesium.Color.fromCssColorString('#72C9D8');\nconst TRACKED_TINT = Cesium.Color.fromCssColorString('#9BE7F2');\nconst MIL_TINT = Cesium.Color.fromCssColorString('#D8A84E');",
    1,
)
f = f.replace(
    "  return isMilitaryIcao(icao24) ? MIL_TINT : Cesium.Color.WHITE;",
    "  return isMilitaryIcao(icao24) ? MIL_TINT : CIV_TINT;",
    1,
)
f = f.replace("const CYAN_TRANSPARENT = Cesium.Color.CYAN.withAlpha(0);", "const CYAN_TRANSPARENT = TRACKED_TINT.withAlpha(0);", 1)
f = f.replace(
    "  if (icao24 === _trackedIcao) return Cesium.Color.CYAN;\n  return isMilitaryIcao(icao24) ? MIL_TINT : Cesium.Color.WHITE;",
    "  if (icao24 === _trackedIcao) return TRACKED_TINT;\n  return isMilitaryIcao(icao24) ? MIL_TINT : CIV_TINT;",
    1,
)
f = f.replace("const TRAIL_COLOR = '#00d4ff';", "const TRAIL_COLOR = '#72C9D8';", 1)
if "const CIV_TINT = Cesium.Color.fromCssColorString('#72C9D8');" not in f:
    raise SystemExit('Civilian tactical flight tint did not install')
flights.write_text(f, encoding='utf-8')

mil = ROOT / 'src/data/militaryFlights.js'
m = mil.read_text(encoding='utf-8')
m = m.replace("const MIL_ICON_COLOR = Cesium.Color.fromCssColorString('#FFB800');", "const MIL_ICON_COLOR = Cesium.Color.fromCssColorString('#D8A84E');", 1)
m = m.replace("const TRACKED_ICON_COLOR = Cesium.Color.fromCssColorString('#FFD166');", "const TRACKED_ICON_COLOR = Cesium.Color.fromCssColorString('#F0CA78');", 1)
m = m.replace("const TRAIL_COLOR = '#FFB800';", "const TRAIL_COLOR = '#D8A84E';", 1)
if "#D8A84E" not in m:
    raise SystemExit('Military tactical tint did not install')
mil.write_text(m, encoding='utf-8')


# -----------------------------------------------------------------------------
# SEA: retain vessel-type information, but use a softer tactical family so the
# globe reads as one coherent system instead of multiple neon app colors.
# -----------------------------------------------------------------------------
replace(
    'src/data/vesselLabels.js',
    """const TYPE_STYLES = [
  { pattern: /tanker/i, css: '#ffb347', accent: '255, 179, 71' },
  { pattern: /cargo|container|bulk|carrier/i, css: '#39d5ff', accent: '57, 213, 255' },
  { pattern: /passenger|ferry|cruise/i, css: '#ff7adf', accent: '255, 122, 223' },
  { pattern: /fishing/i, css: '#7cff9b', accent: '124, 255, 155' },
  { pattern: /tug|tow|pilot|supply|service/i, css: '#f7f0a3', accent: '247, 240, 163' },
];
const DEFAULT_STYLE = { css: '#39d5ff', accent: '57, 213, 255' };
""",
    """const TYPE_STYLES = [
  { pattern: /tanker/i, css: '#D39A58', accent: '211, 154, 88' },
  { pattern: /cargo|container|bulk|carrier/i, css: '#63C5D0', accent: '99, 197, 208' },
  { pattern: /passenger|ferry|cruise/i, css: '#B98DB3', accent: '185, 141, 179' },
  { pattern: /fishing/i, css: '#7FBF97', accent: '127, 191, 151' },
  { pattern: /tug|tow|pilot|supply|service/i, css: '#C7BC7D', accent: '199, 188, 125' },
];
const DEFAULT_STYLE = { css: '#63C5D0', accent: '99, 197, 208' };
""",
)
replace('src/data/aisLiveVessels.js', "const TRAIL_COLOR = '#39ffd5';", "const TRAIL_COLOR = '#63C5D0';")


# -----------------------------------------------------------------------------
# SPACE: maintain class distinctions but bring them into the same restrained
# tactical system. Dense comms are deliberately dimmer than NAV/GEO/stations.
# -----------------------------------------------------------------------------
sat = ROOT / 'src/data/satelliteClass.js'
s = sat.read_text(encoding='utf-8')
for old, new in {
    "color: '#fff6e5'": "color: '#F2EEDC'",
    "color: '#4fd8ff'": "color: '#78CFE0'",
    "color: '#c89bff'": "color: '#B4A0D8'",
    "color: '#9fb3c4'": "color: '#9EAFBC'",
    "color: '#54697f'": "color: '#66798A'",
}.items():
    s = s.replace(old, new, 1)
if "color: '#78CFE0'" not in s:
    raise SystemExit('Satellite tactical palette did not install')
sat.write_text(s, encoding='utf-8')


# -----------------------------------------------------------------------------
# CCTV: neutral tactical cyan at rest, warm amber for the active camera.
# -----------------------------------------------------------------------------
replace(
    'src/data/cctv.js',
    "const IDLE_CAMERA_COLOR = Cesium.Color.fromCssColorString('#6be8ff').withAlpha(0.88);\nconst ACTIVE_CAMERA_COLOR = Cesium.Color.fromCssColorString('#ffd97a').withAlpha(0.95);",
    "const IDLE_CAMERA_COLOR = Cesium.Color.fromCssColorString('#78C8D4').withAlpha(0.90);\nconst ACTIVE_CAMERA_COLOR = Cesium.Color.fromCssColorString('#DDB76A').withAlpha(0.96);",
)


# -----------------------------------------------------------------------------
# DETECTION/WORLD OVERLAY: this canvas composites ABOVE Cesium post-FX, so an
# explicit Noir theme guarantees class colors remain literal screen RGB even
# while the underlying globe is monochrome. This is the most important visual
# distinction at orbital scale where thousands of contacts are on screen.
# -----------------------------------------------------------------------------
tokens = ROOT / 'src/overlays/worldOverlayTokens.js'
t = tokens.read_text(encoding='utf-8')
if '  noir: {' not in t:
    anchor = "  _default: {\n"
    noir_theme = """  noir: {
    line: 'rgba(232, 238, 236, 0.82)',
    label: 'rgba(238, 241, 236, 0.96)',
    labelBg: 'rgba(5, 9, 10, 0.76)',
    calloutPlate: 'rgba(5, 9, 10, 0.56)',
    calloutPlateSpace: 'rgba(5, 9, 10, 0.62)',
    glow: 'rgba(190, 210, 212, 0.16)',
    dim: 'rgba(166, 178, 178, 0.70)',
    cardBorder: 'rgba(205, 216, 212, 0.18)',
    blend: 'normal',
    filter: 'none',
    scanline: 0.0,
    tiers: {
      civil: '#72C9D8', military: '#D8A84E', sea: '#63C5D0', space: '#B4A0D8', vehicle: '#91A4AF',
      veh_jam: '#D96868', veh_slow: '#D7A45A', veh_free: '#69B58A', veh_nodata: '#A5ADB0',
    },
  },
"""
    if anchor not in t:
        raise SystemExit('Could not locate detection default theme anchor')
    t = t.replace(anchor, noir_theme + anchor, 1)
tokens.write_text(t, encoding='utf-8')

checks = {
    'selective Noir': 'tacticalAccent = smoothstep' in (ROOT / 'src/styles/noir.js').read_text(),
    'civil cyan': '#72C9D8' in flights.read_text(),
    'mil amber': '#D8A84E' in mil.read_text(),
    'sea teal': '#63C5D0' in (ROOT / 'src/data/vesselLabels.js').read_text(),
    'space violet': '#B4A0D8' in sat.read_text(),
    'Noir detection theme': '  noir: {' in tokens.read_text(),
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('Tactical map palette validation failed: ' + ', '.join(failed))

print('RHKEARTH tactical map palette installed: muted Noir basemap + readable class-colored assets')
