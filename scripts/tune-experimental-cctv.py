from pathlib import Path
import re

# -----------------------------------------------------------------------------
# RHKEARTH full-frame globe: remove the upstream circular scope mask entirely.
# This both increases usable map area and creates a more distinct visual identity.
# -----------------------------------------------------------------------------
main = Path('src/main.js')
main_text = main.read_text(encoding='utf-8')
scope_import = "import { installScopeMask } from './scopeMask.js';\n"
if scope_import in main_text:
    main_text = main_text.replace(scope_import, '', 1)

scope_install = """    // The explicit scope mask replaces the emergent six-pass artifact —
    // see src/scopeMask.js. Installed before the UI so the DISPLAY-rail
    // toggle finds it live.
    installScopeMask(viewer);

"""
if scope_install in main_text:
    main_text = main_text.replace(
        scope_install,
        "    // RHKEARTH intentionally uses the full rectangular viewport; no circular scope mask.\n\n",
        1,
    )

# RHKEARTH is a live operating console, not a prerecorded scene-capture tool.
scene_import = "import { SceneDirector } from './scenes/director.js';\n"
if scene_import in main_text:
    main_text = main_text.replace(scene_import, '', 1)
scene_init = """    // Initialize deterministic scene playback for social clip capture
    const sceneDirector = new SceneDirector(viewer, styleManager, dataManager);

"""
if scene_init in main_text:
    main_text = main_text.replace(scene_init, '', 1)
main_text = main_text.replace('      sceneDirector,\n', '', 1)

# -----------------------------------------------------------------------------
# Arrow-key camera navigation
# Keep Cesium's native mouse/touch controls untouched. Arrow keys are an
# additional smooth pan scheme: ↑/↓ forward/back, ←/→ lateral. Movement scales
# with camera altitude so it remains useful at street, regional and orbital
# zoom. Shift accelerates. Text inputs/editors retain normal arrow behavior.
# -----------------------------------------------------------------------------
arrow_anchor = """    viewer.targetFrameRate = 60;
"""
arrow_patch = """    viewer.targetFrameRate = 60;

    // RHKEARTH keyboard navigation — additive to Cesium's native controls.
    (() => {
      const pressed = new Set();
      const arrows = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
      let raf = 0;
      let lastAt = 0;

      const isEditing = (target) => {
        if (!(target instanceof Element)) return false;
        if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
        return false;
      };

      const stopLoopIfIdle = () => {
        if ([...arrows].some((key) => pressed.has(key))) return false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        lastAt = 0;
        return true;
      };

      const tick = (now) => {
        raf = 0;
        if (stopLoopIfIdle()) return;
        const dt = lastAt ? Math.min(0.05, Math.max(0.001, (now - lastAt) / 1000)) : 1 / 60;
        lastAt = now;
        const height = Math.max(1, Number(viewer.camera.positionCartographic?.height) || 1000);
        const metresPerSecond = Math.max(35, Math.min(1800000, height * 0.16));
        const boost = pressed.has('Shift') ? 3 : 1;
        const distance = metresPerSecond * boost * dt;

        if (pressed.has('ArrowUp')) viewer.camera.moveForward(distance);
        if (pressed.has('ArrowDown')) viewer.camera.moveBackward(distance);
        if (pressed.has('ArrowLeft')) viewer.camera.moveLeft(distance);
        if (pressed.has('ArrowRight')) viewer.camera.moveRight(distance);
        viewer.scene.requestRender?.();
        raf = requestAnimationFrame(tick);
      };

      const ensureLoop = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };

      document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey || event.altKey) || isEditing(event.target)) return;
        if (event.key === 'Shift') {
          pressed.add('Shift');
          return;
        }
        if (!arrows.has(event.key)) return;
        event.preventDefault();
        pressed.add(event.key);
        ensureLoop();
      }, { passive: false });

      document.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') pressed.delete('Shift');
        if (arrows.has(event.key)) {
          pressed.delete(event.key);
          event.preventDefault();
        }
        stopLoopIfIdle();
      }, { passive: false });

      window.addEventListener('blur', () => {
        pressed.clear();
        stopLoopIfIdle();
      });
    })();
"""
if 'RHKEARTH keyboard navigation' not in main_text:
    if arrow_anchor not in main_text:
        raise SystemExit('RHKEARTH arrow navigation anchor missing')
    main_text = main_text.replace(arrow_anchor, arrow_patch, 1)
main.write_text(main_text, encoding='utf-8')

index = Path('index.html')
index_text = index.read_text(encoding='utf-8')
scope_button_pattern = re.compile(
    r'\s*<button class="pp-toggle-btn active" id="scope-toggle".*?</button>',
    re.S,
)
index_text, removed_scope_buttons = scope_button_pattern.subn('', index_text, count=1)
if removed_scope_buttons != 1 and 'id="scope-toggle"' in index_text:
    raise SystemExit('RHKEARTH scope toggle removal failed')

scene_panel_pattern = re.compile(
    r'\s*<!-- Scene Director Panel -->\s*<div id="scene-panel".*?</div>\s*</div>\s*(?=\s*</div>\s*<!-- Global Context)',
    re.S,
)
index_text, removed_scene_panels = scene_panel_pattern.subn('\n', index_text, count=1)
if removed_scene_panels != 1:
    scene_panel_pattern = re.compile(
        r'\s*<!-- Scene Director Panel -->\s*<div id="scene-panel".*?</div>\s*</div>',
        re.S,
    )
    index_text, removed_scene_panels = scene_panel_pattern.subn('', index_text, count=1)
if 'id="scene-panel"' in index_text:
    raise SystemExit('RHKEARTH Scenes panel removal failed')
index.write_text(index_text, encoding='utf-8')

# -----------------------------------------------------------------------------
# Accuracy-first HUD cleanup
# The upstream demo invents KH11/OPS mission IDs, orbit/pass numbers and a
# blinking REC state at runtime. RHKEARTH does not present generated operational
# identifiers as telemetry. Keep only real camera-derived summary + UTC time in
# the two top corner readouts, and simplify their visual treatment.
# -----------------------------------------------------------------------------
hud = Path('src/hud.js')
hud_text = hud.read_text(encoding='utf-8')
old_top_left = """      <div class=\"hud-corner hud-top-left\">
        <div class=\"hud-bracket\">┌</div>
        <div class=\"hud-content\">
          <div class=\"hud-classification\">TOP SECRET // SI-TK // NOFORN</div>
          <div class=\"hud-system\">${this._missionId}  ${this._sensorId}</div>
          <div class=\"hud-mode\" id=\"hud-mode\">NORMAL</div>
          <div class=\"hud-summary-wrap\">
            <div class=\"hud-summary-label\">SUMMARY</div>
            <div class=\"hud-summary\" id=\"hud-summary\">Awaiting telemetry...</div>
          </div>
        </div>
      </div>
"""
new_top_left = """      <div class=\"hud-corner hud-top-left rhk-hud-compact\">
        <div class=\"hud-content\">
          <div class=\"hud-system\">RHKEARTH · MULTI-DOMAIN AWARENESS</div>
          <div class=\"hud-mode\" id=\"hud-mode\">NOIR</div>
          <div class=\"hud-summary-wrap\">
            <div class=\"hud-summary\" id=\"hud-summary\">Awaiting camera telemetry...</div>
          </div>
        </div>
      </div>
"""
old_top_right = """      <div class=\"hud-corner hud-top-right\">
        <div class=\"hud-content\" style=\"text-align:right\">
          <div class=\"hud-rec\"><span id=\"hud-rec-dot\">●</span> REC  <span id=\"hud-timestamp\">2026-01-01 00:00:00Z</span></div>
          <div class=\"hud-orbital\">ORB: ${this._orbitNum}  PASS: DESC-${this._passNum}</div>
        </div>
        <div class=\"hud-bracket\">┐</div>
      </div>
"""
new_top_right = """      <div class=\"hud-corner hud-top-right rhk-hud-compact rhk-hud-time\">
        <div class=\"hud-content\" style=\"text-align:right\">
          <div class=\"hud-rec\">UTC · <span id=\"hud-timestamp\">2026-01-01 00:00:00Z</span></div>
        </div>
      </div>
"""
if 'RHKEARTH · MULTI-DOMAIN AWARENESS' not in hud_text:
    if old_top_left not in hud_text or old_top_right not in hud_text:
        raise SystemExit('RHKEARTH compact HUD patch target missing')
    hud_text = hud_text.replace(old_top_left, new_top_left, 1)
    hud_text = hud_text.replace(old_top_right, new_top_right, 1)
hud.write_text(hud_text, encoding='utf-8')

index_text = index.read_text(encoding='utf-8')
hud_css_marker = 'RHKEARTH compact truthful HUD v1'
hud_css = r'''
<style id="rhkearth-compact-truthful-hud">
/* RHKEARTH compact truthful HUD v1 */
#intel-hud .rhk-hud-compact {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  padding: 0 !important;
  min-width: 0 !important;
  text-shadow: none !important;
}
#intel-hud .rhk-hud-compact .hud-content {
  padding: 0 !important;
  background: rgba(7,9,8,.44) !important;
  border: 1px solid rgba(205,211,201,.12) !important;
  border-radius: 4px !important;
  box-shadow: 0 8px 28px rgba(0,0,0,.16) !important;
}
#intel-hud .rhk-hud-compact .hud-system {
  padding: 7px 9px 0 !important;
  font-size: 10px !important;
  letter-spacing: .105em !important;
  color: rgba(239,239,233,.80) !important;
}
#intel-hud .rhk-hud-compact .hud-mode {
  padding: 2px 9px 4px !important;
  font-size: 9px !important;
  letter-spacing: .14em !important;
  color: rgba(158,168,157,.62) !important;
}
#intel-hud .rhk-hud-compact .hud-summary-wrap {
  margin: 0 !important;
  padding: 0 9px 7px !important;
  border: 0 !important;
  background: transparent !important;
}
#intel-hud .rhk-hud-compact .hud-summary {
  font-size: 9px !important;
  line-height: 1.35 !important;
  color: rgba(214,218,211,.67) !important;
}
#intel-hud .rhk-hud-time .hud-content {
  padding: 7px 9px !important;
}
#intel-hud .rhk-hud-time .hud-rec {
  font-size: 10px !important;
  letter-spacing: .08em !important;
  color: rgba(239,239,233,.76) !important;
}
</style>
'''
if hud_css_marker not in index_text:
    index_text = index_text.replace('</head>', hud_css + '\n</head>', 1)
index.write_text(index_text, encoding='utf-8')

# -----------------------------------------------------------------------------
# CCTV refresh cadence
# -----------------------------------------------------------------------------
cctv = Path('src/data/cctv.js')
text = cctv.read_text(encoding='utf-8')

replacements = {
    'const ACTIVE_FRAME_REFRESH_MS = 10000;': 'const ACTIVE_FRAME_REFRESH_MS = 4000;',
    'const PROJECTION_ACTIVE_REFRESH_MS = 10000;': 'const PROJECTION_ACTIVE_REFRESH_MS = 4000;',
}

for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f'RHKEARTH CCTV tune patch target missing: {old}')
    text = text.replace(old, new, 1)

cctv.write_text(text, encoding='utf-8')

# Repair the three core live-source paths in the static/native build:
# civilian adsb.lol flights, TfL rolling-video CCTV, and Overpass mirror failover.
live_runtime_patch = Path('../scripts/patch-live-runtime.py')
if not live_runtime_patch.exists():
    raise SystemExit('RHKEARTH live runtime repair patch missing')
exec(compile(live_runtime_patch.read_text(encoding='utf-8'), str(live_runtime_patch), 'exec'))

# AIS viewport transport repair is owned by patch-entity-details.py, which runs
# earlier in the integrated build. Do not apply a second patch here.

# Rebuild marker: 2026-09-04 live AIS viewport + controls/HUD cleanup.
print('RHKEARTH circular scope and Scenes removed; AIS/flights/CCTV/traffic runtime repaired; arrow navigation + truthful compact HUD installed')
