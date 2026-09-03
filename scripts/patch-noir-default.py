from pathlib import Path

ROOT = Path.cwd()
ui = ROOT / 'src/ui.js'
hud = ROOT / 'src/hud.js'
main = ROOT / 'src/main.js'
index = ROOT / 'index.html'

ui_text = ui.read_text(encoding='utf-8')

# RHKEARTH should be born in Noir, not initialize as Normal and then switch
# after the StyleManager/share machinery has already started. This makes Noir
# the actual factory baseline while later share-link restoration remains free
# to replace it with any explicitly encoded style.
old_active = "    this.activeStyle = 'normal';"
new_active = "    this.activeStyle = 'noir';"
if old_active not in ui_text:
    if new_active not in ui_text:
        raise SystemExit('Could not locate StyleManager activeStyle factory baseline')
else:
    ui_text = ui_text.replace(old_active, new_active, 1)

# Every post-process stage is created at intensity 0 upstream. Because Noir is
# now the factory activeStyle, light that stage immediately during construction
# so the first rendered frame and the visible UI agree before any async restore.
old_stage_init = "    this._initStages();\n    this._initBloomSharpen();"
new_stage_init = """    this._initStages();
    if (this.stages[this.activeStyle]) {
      this._setStageIntensity(this.stages[this.activeStyle], 1);
    }
    this._initBloomSharpen();"""
if old_stage_init not in ui_text:
    if "this._setStageIntensity(this.stages[this.activeStyle], 1);" not in ui_text:
        raise SystemExit('Could not locate StyleManager stage initialization')
else:
    ui_text = ui_text.replace(old_stage_init, new_stage_init, 1)

ui.write_text(ui_text, encoding='utf-8')

# Secondary runtime guard only: the real baseline is above in StyleManager.
# This keeps the deployment integrity assertion explicit and protects against a
# future upstream constructor regression without causing the old late-switch
# behavior during normal operation.
main_text = main.read_text(encoding='utf-8')
main_anchor = "    const styleManager = new StyleManager(viewer, { mapStackController });\n"
main_guard = """    const styleManager = new StyleManager(viewer, { mapStackController });
    if (!styleManager.hasShareState && styleManager.activeStyle !== 'noir') {
      styleManager.setStyle('noir');
    }
"""
if main_anchor in main_text:
    main_text = main_text.replace(main_anchor, main_guard, 1)
elif "styleManager.setStyle('noir')" not in main_text:
    raise SystemExit('Could not install Noir runtime fallback guard')
main.write_text(main_text, encoding='utf-8')

# The inherited HUD changes cyan/green/amber with the visual preset. RHKEARTH's
# chrome is intentionally neutral; data geometry can retain semantic colors,
# but the instrument/readout chrome should not look like a different product in
# each mode.
hud_text = hud.read_text(encoding='utf-8')
old_hud_colors = """const HUD_COLORS = {
  surveillance: { main: 'rgba(51, 255, 51, 0.8)',  glow: 'rgba(51, 255, 51, 0.5)',  border: 'rgba(51, 255, 51, 0.2)' },
  thermal:      { main: 'rgba(255, 255, 255, 0.7)', glow: 'rgba(255, 255, 255, 0.4)', border: 'rgba(255, 255, 255, 0.15)' },
  retro:        { main: 'rgba(255, 170, 0, 0.8)',   glow: 'rgba(255, 170, 0, 0.5)',   border: 'rgba(255, 170, 0, 0.2)' },
  _default:     { main: 'rgba(0, 255, 255, 0.6)',   glow: 'rgba(0, 255, 255, 0.4)',   border: 'rgba(0, 255, 255, 0.15)' },
};"""
new_hud_colors = """const HUD_COLORS = {
  surveillance: { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
  thermal:      { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
  retro:        { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
  noir:         { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
  _default:     { main: 'rgba(239, 239, 233, 0.82)', glow: 'rgba(239, 239, 233, 0.12)', border: 'rgba(169, 181, 155, 0.24)' },
};"""
if old_hud_colors not in hud_text:
    if "rgba(239, 239, 233, 0.82)" not in hud_text:
        raise SystemExit('Could not locate HUD_COLORS palette')
else:
    hud_text = hud_text.replace(old_hud_colors, new_hud_colors, 1)
hud.write_text(hud_text, encoding='utf-8')

html = index.read_text(encoding='utf-8')
# Make first-paint chrome truthful too; JS will keep it synchronized afterward.
html = html.replace(
    '<span class="indicator-value" id="active-style-name">NORMAL</span>',
    '<span class="indicator-value" id="active-style-name">NOIR</span>',
    1,
)
html = html.replace(
    '<button class="style-btn active" data-style="normal">',
    '<button class="style-btn" data-style="normal">',
    1,
)
html = html.replace(
    '<button class="style-btn" data-style="noir">',
    '<button class="style-btn active" data-style="noir">',
    1,
)

# Explicit shell overrides for the areas called out in the RHKEARTH screenshot:
# HUD corners/readouts, Display/detection controls, segmented controls, sliders
# and muted data-panel metadata. This is chrome-only; it does not desaturate map
# objects, radar, alert polygons, traffic severity, or other semantic data.
palette_marker = 'RHKEARTH neutral instrument chrome v2'
palette_css = r'''
<style id="rhkearth-neutral-instrument-chrome">
/* RHKEARTH neutral instrument chrome v2 */
#intel-hud {
  --hud-color: rgba(239,239,233,.82) !important;
  --hud-glow: rgba(239,239,233,.12) !important;
  --hud-border: rgba(169,181,155,.24) !important;
  color: #efefe9 !important;
  text-shadow: none !important;
}
#intel-hud *,
#style-indicator,
#style-indicator *,
#pp-toggles,
#pp-toggles *,
#param-slider-panel,
#param-slider-panel * {
  text-shadow: none !important;
}
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
#intel-hud [id^="hud-"] {
  color: rgba(239,239,233,.82) !important;
}
#intel-hud .hud-bracket,
#intel-hud .hud-corner,
#intel-hud .hud-edge,
#intel-hud .hud-top-bar,
#intel-hud .hud-bottom-bar {
  border-color: rgba(169,181,155,.24) !important;
}
#style-indicator .indicator-label { color: rgba(143,151,143,.76) !important; }
#style-indicator .indicator-value { color: #efefe9 !important; }

#pp-toggles,
#param-slider-panel {
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
#param-slider-panel .pp-slider-value {
  color: inherit !important;
}
#pp-toggles input[type="range"],
#param-slider-panel input[type="range"] {
  accent-color: #efefe9 !important;
}
#pp-toggles input[type="range"]::-webkit-slider-thumb,
#param-slider-panel input[type="range"]::-webkit-slider-thumb {
  background: #efefe9 !important;
  box-shadow: none !important;
}
#data-panel .data-toggle-meta,
#data-panel .data-count,
#data-panel .data-toggle-legend-item {
  color: rgba(143,151,143,.72) !important;
}
</style>
'''
if palette_marker not in html:
    html = html.replace('</head>', palette_css + '\n</head>', 1)

index.write_text(html, encoding='utf-8')

checks = {
    'StyleManager baseline': "this.activeStyle = 'noir';" in ui_text,
    'Noir stage lit at construction': "this._setStageIntensity(this.stages[this.activeStyle], 1);" in ui_text,
    'Noir fallback guard': "styleManager.setStyle('noir')" in main_text,
    'neutral HUD source palette': "rgba(239, 239, 233, 0.82)" in hud_text,
    'first-paint indicator': 'id="active-style-name">NOIR<' in html,
    'Noir button active': 'class="style-btn active" data-style="noir"' in html,
    'Normal button inactive': 'class="style-btn active" data-style="normal"' not in html,
    'neutral chrome CSS': palette_marker in html,
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('RHKEARTH Noir/palette baseline validation failed: ' + ', '.join(failed))

print('RHKEARTH Noir factory baseline + neutral instrument chrome installed')
