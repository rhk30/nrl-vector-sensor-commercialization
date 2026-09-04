from pathlib import Path
import re

ROOT = Path.cwd()

# Remove pictographic emoji used as layer/control metadata. RHKEARTH injects
# restrained Material Symbols in its runtime shell, so keeping upstream emoji
# fallbacks only creates inconsistent duplicate styling in secondary surfaces.
emoji_re = re.compile(r"[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F]")
icon_re = re.compile(r"(\bicon\s*:\s*)'([^'\n]*)'")

changed = 0
for path in (ROOT / 'src').rglob('*.js'):
    text = path.read_text(encoding='utf-8')

    def clean_icon(match):
        value = match.group(2)
        if not emoji_re.search(value):
            return match.group(0)
        return f"{match.group(1)}''"

    new = icon_re.sub(clean_icon, text)
    if new != text:
        path.write_text(new, encoding='utf-8')
        changed += 1

index = ROOT / 'index.html'
html = index.read_text(encoding='utf-8')

# Static shell text should not carry emoji either. This does not touch SVG or
# Material Symbol icon names.
html = emoji_re.sub('', html)

cleanup_script = r'''<script id="rhkearth-chrome-cleanup">
(() => {
  const emoji = /[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu;
  let queued = false;

  function scrub() {
    queued = false;

    // RHKEARTH identity: keep the main console subtitle concise and domain-led.
    const subtitle = document.querySelector('#title-bar .subtitle');
    if (subtitle && subtitle.textContent.trim() !== 'MULTI-DOMAIN AWARENESS') {
      subtitle.textContent = 'MULTI-DOMAIN AWARENESS';
    }

    const selectors = [
      '#title-bar', '#style-indicator', '#global-loading-status',
      '#traffic-sync-chip', '#cctv-sync-chip', 'nav', 'aside',
      '[data-layer-id]', 'button', '[class*="chip"]', '[class*="control"]'
    ].join(',');

    for (const root of document.querySelectorAll(selectors)) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const next = node.nodeValue.replace(emoji, '').replace(/\s{2,}/g, ' ');
        if (next !== node.nodeValue) node.nodeValue = next;
      }
    }

    // Remove the leftover upstream TSC chrome label only. Scope the rule to
    // control-ish surfaces so an aircraft/place identifier of TSC is untouched.
    for (const el of document.querySelectorAll(
      'button, [class*="chip"], [class*="control"] span, [class*="control"] small, [class*="label"]'
    )) {
      if (el.children.length === 0 && el.textContent.trim().toUpperCase() === 'TSC') {
        el.remove();
      }
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(scrub);
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrub, { once: true });
  } else {
    scrub();
  }
})();
</script>'''

if 'id="rhkearth-chrome-cleanup"' not in html:
    html = html.replace('</body>', cleanup_script + '\n</body>', 1)

index.write_text(html, encoding='utf-8')
print(f'RHKEARTH chrome cleanup applied; emoji metadata removed from {changed} source files')
