from pathlib import Path
import re

index = Path('experimental/index.html')
html = index.read_text(encoding='utf-8')

html = html.replace('<title>RHKEARTH // Experimental</title>', '<title>RHKEARTH // Intelligence Console</title>')
html = html.replace('<span>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></span>', '<span>RHKEARTH</span>')
html = html.replace('<p class="subtitle">EXPERIMENTAL SYSTEMS</p>', '<p class="subtitle">INTELLIGENCE CONSOLE</p>')
html = html.replace('<h2>RHKEARTH <span class="title-accent">EXPERIMENTAL</span></h2>', '<h2>RHKEARTH</h2>')
html = html.replace('<span class="share-icon" aria-hidden="true">&#x1F517;</span>', '<span class="material-symbols-outlined" aria-hidden="true">link</span>')

# Never load third-party AI/login surfaces in the public RHKEARTH console.
html = re.sub(r'\s*<script[^>]*src=["\']https://js\.puter\.com/v2/?["\'][^>]*></script>\s*', '\n', html, flags=re.I)

runtime_tag = '<script src="/experimental/rhkearth-runtime.js?v=3"></script>'
theme_tag = '<link rel="stylesheet" href="/experimental/rhkearth-theme.css?v=2">'

if '/experimental/rhkearth-runtime.js' in html:
    html = re.sub(r'/experimental/rhkearth-runtime\.js(?:\?v=\d+)?', '/experimental/rhkearth-runtime.js?v=3', html)
else:
    module_match = re.search(r'<script type="module"[^>]+src="/experimental/assets/[^"]+\.js"></script>', html)
    if module_match:
        html = html[:module_match.start()] + runtime_tag + '\n  ' + html[module_match.start():]
    else:
        html = html.replace('</head>', f'  {runtime_tag}\n</head>', 1)

if '/experimental/rhkearth-theme.css' in html:
    html = re.sub(r'/experimental/rhkearth-theme\.css(?:\?v=\d+)?', '/experimental/rhkearth-theme.css?v=2', html)
else:
    html = html.replace('</head>', f'  {theme_tag}\n</head>', 1)

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
    'RHKEARTH subtitle': 'INTELLIGENCE CONSOLE' in html,
    'runtime v3': '/experimental/rhkearth-runtime.js?v=3' in html,
    'theme v2': '/experimental/rhkearth-theme.css?v=2' in html,
    'clear emblem': 'rhkearth-clear-emblem' in html,
    'no Puter': 'js.puter.com' not in html,
    'no visible Experimental title accent': 'title-accent">EXPERIMENTAL' not in html,
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('Experimental finalizer validation failed: ' + ', '.join(failed))

print('PASS: RHKEARTH Experimental shell finalized')
