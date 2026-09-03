from pathlib import Path
import re

main = Path('src/main.js')
text = main.read_text(encoding='utf-8')

text = text.replace("import { SceneDirector } from './scenes/director.js';\n", '', 1)
text = text.replace(
    "    // Initialize deterministic scene playback for social clip capture\n    const sceneDirector = new SceneDirector(viewer, styleManager, dataManager);\n\n",
    '',
    1,
)
# SceneDirector was also exported on the debug object. Leaving this reference
# after removing the constructor would crash bootstrap with ReferenceError.
text = text.replace('      sceneDirector,\n', '', 1)
main.write_text(text, encoding='utf-8')

index = Path('index.html')
html = index.read_text(encoding='utf-8')
start = html.find('  <!-- Scene Director Panel -->')
if start != -1:
    end_marker = '  <!-- Global Context is deliberately independent from the left layer accordion. -->'
    end = html.find(end_marker, start)
    if end == -1:
        raise SystemExit('RHKEARTH Scenes removal: end marker not found')
    block = html[start:end]
    # Preserve the final closing div for #left-panel-stack, while removing the
    # Scene Director panel itself.
    scene_end = block.rfind('\n  </div>')
    if scene_end == -1:
        raise SystemExit('RHKEARTH Scenes removal: left-panel-stack close not found')
    replacement = block[scene_end:]
    html = html[:start] + replacement + html[end:]

if 'id="scene-panel"' in html:
    raise SystemExit('RHKEARTH Scenes panel still present after patch')
index.write_text(html, encoding='utf-8')

print('RHKEARTH Experimental Scenes UI and SceneDirector removed')
