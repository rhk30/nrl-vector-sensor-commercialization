from pathlib import Path

main = Path('src/main.js')
text = main.read_text(encoding='utf-8')

voice_import = "import { initGevVoiceCommands } from './voice/gevRealtime.js';\n"
voice_init = "    window.__godsEyeView.voiceCommands = initGevVoiceCommands({ viewer, styleManager, dataManager, sceneDirector, annotations });\n"

if voice_import not in text:
    raise SystemExit('RHKEARTH voice-removal patch: voice import not found')
if voice_init not in text:
    raise SystemExit('RHKEARTH voice-removal patch: voice initialization not found')

text = text.replace(voice_import, '', 1)
text = text.replace(voice_init, "    // RHKEARTH intentionally omits upstream microphone / Realtime voice control.\n    window.__godsEyeView.voiceCommands = null;\n", 1)
main.write_text(text, encoding='utf-8')

mic_asset = Path('public/mic.svg')
if mic_asset.exists():
    mic_asset.unlink()

print('RHKEARTH Experimental voice module and microphone asset removed')