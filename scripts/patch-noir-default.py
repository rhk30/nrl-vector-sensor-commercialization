from pathlib import Path

ROOT = Path.cwd()
ui = ROOT / 'src/ui.js'
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
index.write_text(html, encoding='utf-8')

checks = {
    'StyleManager baseline': "this.activeStyle = 'noir';" in ui_text,
    'Noir stage lit at construction': "this._setStageIntensity(this.stages[this.activeStyle], 1);" in ui_text,
    'first-paint indicator': 'id="active-style-name">NOIR<' in html,
    'Noir button active': 'class="style-btn active" data-style="noir"' in html,
    'Normal button inactive': 'class="style-btn active" data-style="normal"' not in html,
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit('RHKEARTH Noir baseline validation failed: ' + ', '.join(failed))

print('RHKEARTH Noir is now the true factory visual baseline')
