from pathlib import Path

ROOT = Path.cwd()
ui = ROOT / 'src/ui.js'
hud = ROOT / 'src/hud.js'
main = ROOT / 'src/main.js'
index = ROOT / 'index.html'

ui_text = ui.read_text(encoding='utf-8')

# RHKEARTH factory state is Noir. Keep that state from the first paint, but do
# NOT render the full-screen shader while the loading cover is still masking
# the globe; Cesium/data startup is most expensive during that interval.
ui_text = ui_text.replace("    this.activeStyle = 'normal';", "    this.activeStyle = 'noir';", 1)

# Remove the earlier eager-shader patch if present. Stages should exist but stay
# dormant until the app is about to become visible.
eager = """    this._initStages();
    if (this.stages[this.activeStyle]) {
      this._setStageIntensity(this.stages[this.activeStyle], 1);
    }
    this._initBloomSharpen();"""
ui_text = ui_text.replace(eager, "    this._initStages();\n    this._initBloomSharpen();", 1)
ui.write_text(ui_text, encoding='utf-8')

main_text = main.read_text(encoding='utf-8')
# Keep a harmless invariant guard: ordinary sessions should leave construction
# already set to Noir; shared links remain authoritative.
anchor = "    const styleManager = new StyleManager(viewer, { mapStackController });\n"
guarded = """    const styleManager = new StyleManager(viewer, { mapStackController });
    if (!styleManager.hasShareState && styleManager.activeStyle !== 'noir') {
      styleManager.activeStyle = 'noir';
      document.documentElement.dataset.gevStyle = 'noir';
    }
"""
if anchor in main_text:
    main_text = main_text.replace(anchor, guarded, 1)

# Turn on the selected visual stage at the last possible moment before the
# loading screen disappears. If a share link restored Normal there is no stage;
# if it restored another preset, that preset is the one activated.
handoff = """    ]).finally(() => {
      loadingScreen.classList.add('hidden');"""
handoff_repl = """    ]).finally(() => {
      // RHKEARTH startup-performance handoff: expensive post-FX stays dormant
      // under the loading cover, then becomes visible exactly as the UI opens.
      const startupStage = styleManager.stages?.[styleManager.activeStyle];
      if (startupStage && Number(startupStage.uniforms?.intensity || 0) < 0.999) {
        styleManager._setStageIntensity(startupStage, 1);
      }
      loadingScreen.classList.add('hidden');"""
if handoff in main_text:
    main_text = main_text.replace(handoff, handoff_repl, 1)
elif 'RHKEARTH startup-performance handoff' not in main_text:
    raise SystemExit('Could not locate startup loading-cover handoff')
main.write_text(main_text, encoding='utf-8')

# Neutral instrument chrome. Asset/data colors are handled separately so the
# menus remain calm while contacts on the globe can use tactical color coding.
hud_text = hud.read_text(encoding='utf-8')
start = hud_text.find('const HUD_COLORS = {')
end = hud_text.find('\n};', start)
if start < 0 or end < 0:
    raise SystemExit('Could not locate HUD_COLORS')
end += 3
neutral_hud = """const HUD_COLORS = {
  surveillance: { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
  thermal:      { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
  retro:        { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
  noir:         { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
  _default:     { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
};"""
hud_text = hud_text[:start] + neutral_hud + hud_text[end:]
hud.write_text(hud_text, encoding='utf-8')

html = index.read_text(encoding='utf-8')
html = html.replace('<span class="indicator-value" id="active-style-name">NORMAL</span>', '<span class="indicator-value" id="active-style-name">NOIR</span>', 1)
html = html.replace('<button class="style-btn active" data-style="normal">', '<button class="style-btn" data-style="normal">', 1)
html = html.replace('<button class="style-btn" data-style="noir">', '<button class="style-btn active" data-style="noir">', 1)

palette_marker = 'RHKEARTH neutral instrument chrome v3'
palette_css = r'''
<style id="rhkearth-neutral-instrument-chrome">
/* RHKEARTH neutral instrument chrome v3 */
#intel-hud {
  --hud-color: rgba(239,239,233,.82) !important;
  --hud-glow: rgba(239,239,233,.10) !important;
  --hud-border: rgba(169,181,155,.24) !important;
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
#style-indicator .indicator-label { color: rgba(143,151,143,.76) !important; }
#style-indicator .indicator-value { color: #efefe9 !important; }
#pp-toggles, #param-slider-panel {
  --accent: #efefe9 !important;
  color: #efefe9 !important;
  background: rgba(8,10,9,.92) !important;
  border-color: rgba(169,181,155,.22) !important;
}
#pp-toggles .pp-toggle-btn,
#pp-toggles .pp-mode-btn,
#param-slider-panel .pp-mode-btn {
  color: rgba(239,239,233,.72) !important;
  background: rgba(169,181,155,.025) !important;
  border-color: rgba(169,181,155,.20) !important;
  box-shadow: none !important;
}
#pp-toggles .pp-toggle-btn:hover,
#pp-toggles .pp-mode-btn:hover,
#param-slider-panel .pp-mode-btn:hover {
  color: #efefe9 !important;
  background: rgba(169,181,155,.07) !important;
  border-color: rgba(169,181,155,.42) !important;
}
#pp-toggles .pp-toggle-btn.active,
#pp-toggles .pp-toggle-btn[aria-pressed="true"],
#pp-toggles .pp-mode-btn.active,
#pp-toggles .pp-mode-btn[aria-checked="true"],
#param-slider-panel .pp-mode-btn.active,
#param-slider-panel .pp-mode-btn[aria-checked="true"] {
  color: #efefe9 !important;
  background: rgba(169,181,155,.13) !important;
  border-color: rgba(169,181,155,.58) !important;
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
#data-panel .data-toggle-meta, #data-panel .data-count, #data-panel .data-toggle-legend-item { color: rgba(143,151,143,.72) !important; }
</style>
'''
# Replace an earlier injected version rather than stacking duplicate CSS.
old_start = html.find('<style id="rhkearth-neutral-instrument-chrome">')
if old_start >= 0:
    old_end = html.find('</style>', old_start)
    if old_end >= 0:
        html = html[:old_start] + palette_css + html[old_end + len('</style>'):]
else:
    html = html.replace('</head>', palette_css + '\n</head>', 1)
index.write_text(html, encoding='utf-8')

checks = {
    'Noir factory baseline': "this.activeStyle = 'noir';" in ui_text,
    'No eager full-screen Noir': "this._setStageIntensity(this.stages[this.activeStyle], 1);" not in ui_text,
    'Deferred startup shader': 'RHKEARTH startup-performance handoff' in main_text,
    'Neutral HUD': "rgba(239, 239, 233, 0.82)" in hud_text,
    'Noir first-paint indicator': 'id="active-style-name">NOIR<' in html,
    'Noir button active': 'class="style-btn active" data-style="noir"' in html,
    'Neutral chrome': palette_marker in html,
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('RHKEARTH Noir/palette validation failed: ' + ', '.join(failed))

print('RHKEARTH Noir default retained, startup shader deferred, chrome neutralized')
