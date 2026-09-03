from pathlib import Path

ROOT = Path.cwd()
main = ROOT / 'src/main.js'
text = main.read_text()

needle = "    const styleManager = new StyleManager(viewer, { mapStackController });\n"
replacement = """    const styleManager = new StyleManager(viewer, { mapStackController });
    // RHKEARTH visual baseline: start every ordinary session in Noir. Shared
    // links remain authoritative and can restore any explicitly encoded style.
    if (!styleManager.hasShareState) {
      styleManager.setStyle('noir');
    }
"""

if needle not in text:
    if "styleManager.setStyle('noir');" in text:
        print('RHKEARTH Noir startup default already installed')
    else:
        raise SystemExit('Could not locate StyleManager initialization in src/main.js')
else:
    main.write_text(text.replace(needle, replacement, 1))
    print('RHKEARTH Noir startup default installed')
