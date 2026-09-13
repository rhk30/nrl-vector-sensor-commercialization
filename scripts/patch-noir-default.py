from pathlib import Path

ROOT = Path.cwd()
ui = ROOT / 'src/ui.js'
hud = ROOT / 'src/hud.js'
index = ROOT / 'index.html'

ui_text = ui.read_text(encoding='utf-8')

# Keep the unfiltered Cesium scene as the factory/default view. The full-screen
# Noir shader remains available as an optional preset, but forcing it at startup
# was adding desaturation, grain, contrast and vignette to every globe pixel and
# making the underlying imagery look degraded.
ui_text = ui_text.replace("    this.activeStyle = 'noir';", "    this.activeStyle = 'normal';", 1)
if "    this.activeStyle = 'normal';" not in ui_text:
    raise SystemExit('Could not establish Normal as the factory visual style')

# Remove any legacy eager-style activation block if it somehow exists. Normal
# has no full-screen post-processing stage and should open at native clarity.
eager = """    this._initStages();
    if (this.stages[this.activeStyle]) {
      this._setStageIntensity(this.stages[this.activeStyle], 1);
    }
    this._initBloomSharpen();"""
ui_text = ui_text.replace(eager, "    this._initStages();\n    this._initBloomSharpen();", 1)
ui.write_text(ui_text, encoding='utf-8')

# Keep the instrument chrome neutral and low-noise. This only affects UI chrome;
# tactical/data colors on the globe remain controlled by their own layers.
hud_text = hud.read_text(encoding='utf-8')
start = hud_text.find('const HUD_COLORS = {')
end = hud_text.find('\n};', start)
if start < 0 or end < 0:
    raise SystemExit('Could not locate HUD_COLORS')
end += 3
neutral_hud = """const HUD_COLORS = {
  surveillance: { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.10)', border: 'rgba(169, 181, 155, 0.22)' },
  thermal:      { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.10)', border: 'rgba(169, 181, 155, 0.22)' },
  retro:        { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.10)', border: 'rgba(169, 181, 155, 0.22)' },
  noir:         { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.10)', border: 'rgba(169, 181, 155, 0.22)' },
  _default:     { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.10)', border: 'rgba(169, 181, 155, 0.22)' },
};"""
hud_text = hud_text[:start] + neutral_hud + hud_text[end:]
hud.write_text(hud_text, encoding='utf-8')

html = index.read_text(encoding='utf-8')
# Normalize any previously patched first-paint state back to Normal.
html = html.replace('<span class="indicator-value" id="active-style-name">NOIR</span>', '<span class="indicator-value" id="active-style-name">NORMAL</span>')
html = html.replace('<button class="style-btn" data-style="normal">', '<button class="style-btn active" data-style="normal">', 1)
html = html.replace('<button class="style-btn active" data-style="noir">', '<button class="style-btn" data-style="noir">', 1)

palette_marker = 'RHKEARTH neutral instrument chrome v4'
palette_css = r'''
<style id="rhkearth-neutral-instrument-chrome">
/* RHKEARTH neutral instrument chrome v4 */
#intel-hud {
  --hud-color: rgba(239,239,233,.82) !important;
  --hud-glow: rgba(239,239,233,.08) !important;
  --hud-border: rgba(169,181,155,.22) !important;
  color: #efefe9 !important;
  text-shadow: none !important;
}
#intel-hud *, #style-indicator *, #pp-toggles *, #param-slider-panel * { text-shadow: none !important; }
#intel-hud .hud-system,
#intel-hud .hud-mode,
#intel-hud .hud-rec,
#intel-hud .hud-orbital,
#intel-hud .hud-bottom-left,
#intel-hud .hud-bottom-right,
#intel-hud .hud-left-edge,
#intel-hud .hud-right-edge,
#intel-hud .hud-bottom-bar,
#intel-hud .hud-top-bar,
#intel-hud [id^="hud-"] { color: rgba(239,239,233,.82) !important; }
#style-indicator .indicator-label { color: rgba(143,151,143,.72) !important; }
#style-indicator .indicator-value { color: #efefe9 !important; }
#pp-toggles, #param-slider-panel {
  --accent: #efefe9 !important;
  color: #efefe9 !important;
  background: rgba(8,10,9,.90) !important;
  border-color: rgba(169,181,155,.20) !important;
}
#pp-toggles .pp-toggle-btn,
#pp-toggles .pp-mode-btn,
#param-slider-panel .pp-mode-btn {
  color: rgba(239,239,233,.72) !important;
  background: rgba(169,181,155,.02) !important;
  border-color: rgba(169,181,155,.18) !important;
  box-shadow: none !important;
}
#pp-toggles .pp-toggle-btn:hover,
#pp-toggles .pp-mode-btn:hover,
#param-slider-panel .pp-mode-btn:hover {
  color: #efefe9 !important;
  background: rgba(169,181,155,.06) !important;
  border-color: rgba(169,181,155,.38) !important;
}
#pp-toggles .pp-toggle-btn.active,
#pp-toggles .pp-toggle-btn[aria-pressed="true"],
#pp-toggles .pp-mode-btn.active,
#pp-toggles .pp-mode-btn[aria-checked="true"],
#param-slider-panel .pp-mode-btn.active,
#param-slider-panel .pp-mode-btn[aria-checked="true"] {
  color: #efefe9 !important;
  background: rgba(169,181,155,.11) !important;
  border-color: rgba(169,181,155,.52) !important;
}
#pp-toggles .pp-toggle-btn.active .pp-label,
#pp-toggles .pp-toggle-btn[aria-pressed="true"] .pp-label,
#pp-toggles .pp-icon,
#pp-toggles .pp-label,
#pp-toggles .pp-slider-mini-label,
#pp-toggles .pp-slider-value,
#param-slider-panel .pp-slider-mini-label,
#param-slider-panel .pp-slider-value { color: inherit !important; }
#pp-toggles input[type="range"], #param-slider-panel input[type="range"] { accent-color: #efefe9 !important; }
#data-panel .data-toggle-meta, #data-panel .data-count, #data-panel .data-toggle-legend-item { color: rgba(143,151,143,.70) !important; }
</style>
'''
old_start = html.find('<style id="rhkearth-neutral-instrument-chrome">')
if old_start >= 0:
    old_end = html.find('</style>', old_start)
    if old_end >= 0:
        html = html[:old_start] + palette_css + html[old_end + len('</style>'):]
else:
    html = html.replace('</head>', palette_css + '\n</head>', 1)
index.write_text(html, encoding='utf-8')

checks = {
    'Normal factory baseline': "this.activeStyle = 'normal';" in ui_text,
    'No eager post-FX': "this._setStageIntensity(this.stages[this.activeStyle], 1);" not in ui_text,
    'Neutral HUD': "rgba(239, 239, 233, 0.82)" in hud_text,
    'Normal first-paint indicator': 'id="active-style-name">NORMAL<' in html,
    'Normal button active': 'class="style-btn active" data-style="normal"' in html,
    'Noir remains selectable': 'data-style="noir"' in html,
    'Neutral chrome': palette_marker in html,
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('RHKEARTH visual baseline validation failed: ' + ', '.join(failed))

print('RHKEARTH visual baseline restored: native-clear Normal globe + optional Noir preset + calm chrome')
