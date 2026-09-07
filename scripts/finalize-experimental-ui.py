from pathlib import Path
import re
import shutil

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

#title-bar .title-logo::before,
#title-bar .title-logo::after,
#title-bar.radio-broadcasting .title-logo::before,
#title-bar.radio-broadcasting .title-logo::after {
  content: none !important;
  display: none !important;
  animation: none !important;
}

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

# Install durable RHKEARTH compatibility files after each native rebuild.
durable_files = {
    Path('scripts/rhkearth-weather.js'): Path('experimental/rhkearth-weather.js'),
    Path('scripts/rhkearth-weather.css'): Path('experimental/rhkearth-weather.css'),
    Path('scripts/rhkearth-weather-fallback.js'): Path('experimental/rhkearth-weather-fallback.js'),
    Path('scripts/rhkearth-weather-worldwide.js'): Path('experimental/rhkearth-weather-worldwide.js'),
    Path('scripts/rhkearth-mobile.js'): Path('experimental/rhkearth-mobile.js'),
    Path('scripts/rhkearth-mobile.css'): Path('experimental/rhkearth-mobile.css'),
    Path('scripts/rhkearth-osiris-tools.js'): Path('experimental/rhkearth-osiris-tools.js'),
    Path('scripts/rhkearth-osiris-tools.css'): Path('experimental/rhkearth-osiris-tools.css'),
    Path('scripts/rhkearth-osiris-streams.js'): Path('experimental/rhkearth-osiris-streams.js'),
    Path('scripts/rhkearth-osiris-streams.css'): Path('experimental/rhkearth-osiris-streams.css'),
    Path('scripts/osiris-live-news.json'): Path('experimental/osiris-live-news.json'),
    Path('scripts/OSIRIS_LICENSE.txt'): Path('experimental/OSIRIS_LICENSE.txt'),
}
missing = [str(path) for path in durable_files if not path.exists()]
if missing:
    raise SystemExit('RHKEARTH durable source files are missing: ' + ', '.join(missing))
for src, dst in durable_files.items():
    shutil.copyfile(src, dst)

html = html.replace('<title>RHKEARTH // Experimental</title>', '<title>RHKEARTH // Intelligence Console</title>')
html = html.replace('<span>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></span>', '<span>RHKEARTH</span>')
html = html.replace('<p class="subtitle">EXPERIMENTAL SYSTEMS</p>', '<p class="subtitle">INTELLIGENCE CONSOLE</p>')
html = html.replace('<h2>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></h2>', '<h2>RHKEARTH</h2>')
html = html.replace('<span class="share-icon" aria-hidden="true">&#x1F517;</span>', '<span class="material-symbols-outlined" aria-hidden="true">link</span>')
html = re.sub(r'\s*<script[^>]*src=["\']https://js\.puter\.com/v2/?["\'][^>]*></script>\s*', '\n', html, flags=re.I)

runtime_tag = '<script src="/experimental/rhkearth-runtime.js?v=9"></script>'
theme_tag = '<link rel="stylesheet" href="/experimental/rhkearth-theme.css?v=5">'
mobile_script_tag = '<script src="/experimental/rhkearth-mobile.js?v=1"></script>'
mobile_style_tag = '<link rel="stylesheet" href="/experimental/rhkearth-mobile.css?v=2">'
weather_fallback_tag = '<script src="/experimental/rhkearth-weather-fallback.js?v=1"></script>'
weather_script_tag = '<script src="/experimental/rhkearth-weather.js?v=1" defer></script>'
weather_world_tag = '<script src="/experimental/rhkearth-weather-worldwide.js?v=1" defer></script>'
weather_style_tag = '<link rel="stylesheet" href="/experimental/rhkearth-weather.css?v=1">'

if '/experimental/rhkearth-mobile.js' in html:
    html = re.sub(r'/experimental/rhkearth-mobile\.js(?:\?v=\d+)?', '/experimental/rhkearth-mobile.js?v=1', html)
else:
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
    html = re.sub(r'/experimental/rhkearth-mobile\.css(?:\?v=\d+)?', '/experimental/rhkearth-mobile.css?v=2', html)
else:
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

# Install OSIRIS-derived analysis/live-stream tags idempotently in this same
# publish step. This prevents the follow-up installer from rewriting the bundle.
for stem in ('rhkearth-osiris-tools', 'rhkearth-osiris-streams'):
    html = re.sub(rf'\s*<link[^>]+href="/experimental/{stem}\.css(?:\?v=\d+)?"[^>]*>\s*', '\n', html)
    html = re.sub(rf'\s*<script[^>]+src="/experimental/{stem}\.js(?:\?v=\d+)?"[^>]*></script>\s*', '\n', html)
osiris_css_tags = (
    '  <link rel="stylesheet" href="/experimental/rhkearth-osiris-tools.css?v=1">\n'
    '  <link rel="stylesheet" href="/experimental/rhkearth-osiris-streams.css?v=1">\n'
)
osiris_js_tags = (
    '  <script src="/experimental/rhkearth-osiris-tools.js?v=1" defer></script>\n'
    '  <script src="/experimental/rhkearth-osiris-streams.js?v=1" defer></script>\n'
)
if '</head>' not in html or '</body>' not in html:
    raise SystemExit('Experimental shell is malformed')
html = html.replace('</head>', osiris_css_tags + '</head>', 1)
html = html.replace('</body>', osiris_js_tags + '</body>', 1)

emblem = '''  <div id="rhkearth-clear-emblem" aria-hidden="true">
    <img src="/experimental/logo.svg" alt="" />
    <span>RHKEARTH</span>
  </div>'''
if 'id="rhkearth-clear-emblem"' not in html:
    html = html.replace('  <div id="cesiumContainer"></div>', '  <div id="cesiumContainer"></div>\n' + emblem, 1)

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
    'mobile style v2': '/experimental/rhkearth-mobile.css?v=2' in html,
    'weather fallback v1': '/experimental/rhkearth-weather-fallback.js?v=1' in html,
    'weather runtime v1': '/experimental/rhkearth-weather.js?v=1' in html,
    'weather worldwide v1': '/experimental/rhkearth-weather-worldwide.js?v=1' in html,
    'weather style v1': '/experimental/rhkearth-weather.css?v=1' in html,
    'clear emblem': 'rhkearth-clear-emblem' in html,
    'square logo CSS': logo_fix_marker in css,
    'no Puter': 'js.puter.com' not in html,
    'no visible Experimental title accent': 'title-accent">EXPERIMENTAL' not in html,
    'analysis JS installed': Path('experimental/rhkearth-osiris-tools.js').stat().st_size > 5000,
    'analysis CSS installed': Path('experimental/rhkearth-osiris-tools.css').stat().st_size > 2000,
    'streams JS installed': Path('experimental/rhkearth-osiris-streams.js').stat().st_size > 8000,
    'streams CSS installed': Path('experimental/rhkearth-osiris-streams.css').stat().st_size > 3000,
    'live-news catalog installed': 'OSIRIS live-news v3' in Path('experimental/osiris-live-news.json').read_text(),
    'OSIRIS MIT license installed': 'Copyright (c) 2026 simplifaisoul' in Path('experimental/OSIRIS_LICENSE.txt').read_text(),
    'analysis JS linked once': html.count('/experimental/rhkearth-osiris-tools.js?v=1') == 1,
    'analysis CSS linked once': html.count('/experimental/rhkearth-osiris-tools.css?v=1') == 1,
    'streams JS linked once': html.count('/experimental/rhkearth-osiris-streams.js?v=1') == 1,
    'streams CSS linked once': html.count('/experimental/rhkearth-osiris-streams.css?v=1') == 1,
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('Experimental finalizer validation failed: ' + ', '.join(failed))

print('PASS: RHKEARTH Experimental shell finalized with mobile, Weather, and OSIRIS-derived tools in one publish')
