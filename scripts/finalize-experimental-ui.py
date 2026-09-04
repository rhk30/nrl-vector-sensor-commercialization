from pathlib import Path
import re

index = Path('experimental/index.html')
html = index.read_text(encoding='utf-8')

theme = Path('experimental/rhkearth-theme.css')
css = theme.read_text(encoding='utf-8')
logo_fix_marker = 'RHKEARTH square-logo normalization v1'
logo_fix = r'''

/* RHKEARTH square-logo normalization v1
   The inherited GEV shell assumes a 775:520 eye logo. RHKEARTH is a 1:1 mark,
   so lock every shell presentation to square geometry and remove inherited
   radio-eye ornamentation that otherwise appears in some operating modes. */
.brand-logo {
  aspect-ratio: 1 / 1 !important;
}

#title-bar .title-logo {
  width: 42px !important;
  height: 42px !important;
  flex: 0 0 42px !important;
  aspect-ratio: 1 / 1 !important;
  filter: none !important;
}

#title-bar .title-logo > img,
#title-bar .title-logo > svg {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  object-fit: contain !important;
  object-position: center !important;
}

/* The upstream eye mark grows radio arcs in broadcast mode. Those arcs are not
   part of the RHKEARTH identity and make the replacement mark look malformed. */
#title-bar .title-logo::before,
#title-bar .title-logo::after,
#title-bar.radio-broadcasting .title-logo::before,
#title-bar.radio-broadcasting .title-logo::after {
  content: none !important;
  display: none !important;
  animation: none !important;
}

/* Keep the clear-view mark visually consistent with the standard title mark. */
#rhkearth-clear-emblem {
  opacity: .82 !important;
  gap: 8px !important;
}

#rhkearth-clear-emblem img {
  width: 27px !important;
  height: 27px !important;
  aspect-ratio: 1 / 1 !important;
  object-fit: contain !important;
  object-position: center !important;
}

#rhkearth-clear-emblem::before {
  content: none !important;
  display: none !important;
}

@media (max-width: 700px) {
  #title-bar .title-logo {
    width: 36px !important;
    height: 36px !important;
    flex-basis: 36px !important;
  }
}
'''
if logo_fix_marker not in css:
    css += logo_fix
theme.write_text(css, encoding='utf-8')

# Install the separate, source-locked Weather operating surface and automatic
# mobile UI from durable source files. The build deletes/replaces experimental/,
# so these copies happen after every native bundle publish rather than relying
# on generated files that would disappear on the next rebuild.
weather_js_src = Path('scripts/rhkearth-weather.js')
weather_css_src = Path('scripts/rhkearth-weather.css')
weather_fallback_src = Path('scripts/rhkearth-weather-fallback.js')
weather_world_src = Path('scripts/rhkearth-weather-worldwide.js')
mobile_js_src = Path('scripts/rhkearth-mobile.js')
mobile_css_src = Path('scripts/rhkearth-mobile.css')
required_sources = [
    weather_js_src,
    weather_css_src,
    weather_fallback_src,
    weather_world_src,
    mobile_js_src,
    mobile_css_src,
]
if not all(path.exists() for path in required_sources):
    missing = [str(path) for path in required_sources if not path.exists()]
    raise SystemExit('RHKEARTH durable source files are missing: ' + ', '.join(missing))
Path('experimental/rhkearth-weather.js').write_text(weather_js_src.read_text(encoding='utf-8'), encoding='utf-8')
Path('experimental/rhkearth-weather.css').write_text(weather_css_src.read_text(encoding='utf-8'), encoding='utf-8')
Path('experimental/rhkearth-weather-fallback.js').write_text(weather_fallback_src.read_text(encoding='utf-8'), encoding='utf-8')
Path('experimental/rhkearth-weather-worldwide.js').write_text(weather_world_src.read_text(encoding='utf-8'), encoding='utf-8')
Path('experimental/rhkearth-mobile.js').write_text(mobile_js_src.read_text(encoding='utf-8'), encoding='utf-8')
Path('experimental/rhkearth-mobile.css').write_text(mobile_css_src.read_text(encoding='utf-8'), encoding='utf-8')

html = html.replace('<title>RHKEARTH // Experimental</title>', '<title>RHKEARTH // Intelligence Console</title>')
html = html.replace('<span>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></span>', '<span>RHKEARTH</span>')
html = html.replace('<p class="subtitle">EXPERIMENTAL SYSTEMS</p>', '<p class="subtitle">INTELLIGENCE CONSOLE</p>')
html = html.replace('<h2>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></h2>', '<h2>RHKEARTH</h2>')
html = html.replace('<span class="share-icon" aria-hidden="true">&#x1F517;</span>', '<span class="material-symbols-outlined" aria-hidden="true">link</span>')

# Never load third-party AI/login surfaces in the public RHKEARTH console.
html = re.sub(r'\s*<script[^>]*src=["\']https://js\.puter\.com/v2/?["\'][^>]*></script>\s*', '\n', html, flags=re.I)

# Increment these whenever the RHKEARTH compatibility layer or typography theme
# changes so browsers/CDNs cannot retain a visually or functionally stale copy.
runtime_tag = '<script src="/experimental/rhkearth-runtime.js?v=9"></script>'
theme_tag = '<link rel="stylesheet" href="/experimental/rhkearth-theme.css?v=5">'
mobile_script_tag = '<script src="/experimental/rhkearth-mobile.js?v=1"></script>'
mobile_style_tag = '<link rel="stylesheet" href="/experimental/rhkearth-mobile.css?v=1">'
weather_fallback_tag = '<script src="/experimental/rhkearth-weather-fallback.js?v=1"></script>'
weather_script_tag = '<script src="/experimental/rhkearth-weather.js?v=1" defer></script>'
weather_world_tag = '<script src="/experimental/rhkearth-weather-worldwide.js?v=1" defer></script>'
weather_style_tag = '<link rel="stylesheet" href="/experimental/rhkearth-weather.css?v=1">'

if '/experimental/rhkearth-mobile.js' in html:
    html = re.sub(r'/experimental/rhkearth-mobile\.js(?:\?v=\d+)?', '/experimental/rhkearth-mobile.js?v=1', html)
else:
    # Load before the main runtime/module so the phone class exists before the
    # application becomes visible; desktop sessions simply receive no class.
    runtime_match = re.search(r'<script[^>]+src="/experimental/rhkearth-runtime\.js(?:\?v=\d+)?"[^>]*></script>', html)
    if runtime_match:
        html = html[:runtime_match.start()] + mobile_script_tag + '\n  ' + html[runtime_match.start():]
    else:
        module_match = re.search(r'<script type="module"[^>]+src="/experimental/assets/[^"]+\.js"></script>', html)
        if module_match:
            html = html[:module_match.start()] + mobile_script_tag + '\n  ' + html[module_match.start():]
        else:
            html = html.replace('</head>', f'  {mobile_script_tag}\n</head>', 1)

if '/experimental/rhkearth-runtime.js' in html:
    html = re.sub(r'/experimental/rhkearth-runtime\.js(?:\?v=\d+)?', '/experimental/rhkearth-runtime.js?v=9', html)
else:
    module_match = re.search(r'<script type="module"[^>]+src="/experimental/assets/[^"]+\.js"></script>', html)
    if module_match:
        html = html[:module_match.start()] + runtime_tag + '\n  ' + html[module_match.start():]
    else:
        html = html.replace('</head>', f'  {runtime_tag}\n</head>', 1)

if '/experimental/rhkearth-theme.css' in html:
    html = re.sub(r'/experimental/rhkearth-theme\.css(?:\?v=\d+)?', '/experimental/rhkearth-theme.css?v=5', html)
else:
    html = html.replace('</head>', f'  {theme_tag}\n</head>', 1)

if '/experimental/rhkearth-mobile.css' in html:
    html = re.sub(r'/experimental/rhkearth-mobile\.css(?:\?v=\d+)?', '/experimental/rhkearth-mobile.css?v=1', html)
else:
    # Mobile CSS is inert unless rhkearth-mobile.js adds .rhk-mobile-ui, so it
    # is safe to load universally and cannot alter desktop geometry.
    html = html.replace('</head>', f'  {mobile_style_tag}\n</head>', 1)

if '/experimental/rhkearth-weather-fallback.js' in html:
    html = re.sub(r'/experimental/rhkearth-weather-fallback\.js(?:\?v=\d+)?', '/experimental/rhkearth-weather-fallback.js?v=1', html)
else:
    runtime_pos = html.find(runtime_tag)
    if runtime_pos >= 0:
        end = runtime_pos + len(runtime_tag)
        html = html[:end] + '\n  ' + weather_fallback_tag + html[end:]
    else:
        html = html.replace('</head>', f'  {weather_fallback_tag}\n</head>', 1)

if '/experimental/rhkearth-weather.js' in html:
    html = re.sub(r'/experimental/rhkearth-weather\.js(?:\?v=\d+)?', '/experimental/rhkearth-weather.js?v=1', html)
else:
    module_match = re.search(r'<script type="module"[^>]+src="/experimental/assets/[^"]+\.js"></script>', html)
    if module_match:
        html = html[:module_match.start()] + weather_script_tag + '\n  ' + html[module_match.start():]
    else:
        html = html.replace('</head>', f'  {weather_script_tag}\n</head>', 1)

if '/experimental/rhkearth-weather-worldwide.js' in html:
    html = re.sub(r'/experimental/rhkearth-weather-worldwide\.js(?:\?v=\d+)?', '/experimental/rhkearth-weather-worldwide.js?v=1', html)
else:
    weather_pos = html.find(weather_script_tag)
    if weather_pos >= 0:
        end = weather_pos + len(weather_script_tag)
        html = html[:end] + '\n  ' + weather_world_tag + html[end:]
    else:
        module_match = re.search(r'<script type="module"[^>]+src="/experimental/assets/[^"]+\.js"></script>', html)
        if module_match:
            html = html[:module_match.start()] + weather_world_tag + '\n  ' + html[module_match.start():]
        else:
            html = html.replace('</head>', f'  {weather_world_tag}\n</head>', 1)

if '/experimental/rhkearth-weather.css' in html:
    html = re.sub(r'/experimental/rhkearth-weather\.css(?:\?v=\d+)?', '/experimental/rhkearth-weather.css?v=1', html)
else:
    html = html.replace('</head>', f'  {weather_style_tag}\n</head>', 1)

emblem = '''  <div id="rhkearth-clear-emblem" aria-hidden="true">
    <img src="/experimental/logo.svg" alt="" />
    <span>RHKEARTH</span>
  </div>'''
if 'id="rhkearth-clear-emblem"' not in html:
    html = html.replace('  <div id="cesiumContainer"></div>', '  <div id="cesiumContainer"></div>\n' + emblem, 1)

# Remove the upstream onboarding card from the static shell as well as runtime suppression.
html = re.sub(
    r'\s*<!-- Explicit mission choice on a fresh session\.[\s\S]*?<aside id="first-run-launcher"[\s\S]*?</aside>\s*',
    '\n',
    html,
    count=1,
)

index.write_text(html, encoding='utf-8')

checks = {
    'RHKEARTH title': 'RHKEARTH // Intelligence Console' in html,
    'RHKEARTH subtitle': 'INTELLIGENCE CONSOLE' in html or 'MULTI-DOMAIN AWARENESS' in html,
    'runtime v9': '/experimental/rhkearth-runtime.js?v=9' in html,
    'theme v5': '/experimental/rhkearth-theme.css?v=5' in html,
    'mobile runtime v1': '/experimental/rhkearth-mobile.js?v=1' in html,
    'mobile style v1': '/experimental/rhkearth-mobile.css?v=1' in html,
    'weather fallback v1': '/experimental/rhkearth-weather-fallback.js?v=1' in html,
    'weather runtime v1': '/experimental/rhkearth-weather.js?v=1' in html,
    'weather worldwide v1': '/experimental/rhkearth-weather-worldwide.js?v=1' in html,
    'weather style v1': '/experimental/rhkearth-weather.css?v=1' in html,
    'mobile runtime installed': Path('experimental/rhkearth-mobile.js').exists(),
    'mobile style installed': Path('experimental/rhkearth-mobile.css').exists(),
    'weather fallback installed': Path('experimental/rhkearth-weather-fallback.js').exists(),
    'weather runtime installed': Path('experimental/rhkearth-weather.js').exists(),
    'weather worldwide installed': Path('experimental/rhkearth-weather-worldwide.js').exists(),
    'weather style installed': Path('experimental/rhkearth-weather.css').exists(),
    'clear emblem': 'rhkearth-clear-emblem' in html,
    'square logo CSS': logo_fix_marker in css,
    'no Puter': 'js.puter.com' not in html,
    'no visible Experimental title accent': 'title-accent">EXPERIMENTAL' not in html,
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('Experimental finalizer validation failed: ' + ', '.join(failed))

print('PASS: RHKEARTH Experimental shell finalized with automatic mobile UI and source-locked worldwide Weather mode')
