(() => {
  const root = document.documentElement;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)');
  const noHover = window.matchMedia?.('(hover: none)');

  function viewportWidth() {
    const visual = Number(window.visualViewport?.width);
    return Number.isFinite(visual) && visual > 0 ? visual : window.innerWidth;
  }

  function shouldUseMobileUi() {
    const width = viewportWidth();
    const touchCapable = (navigator.maxTouchPoints || 0) > 0
      || coarsePointer?.matches
      || noHover?.matches;

    // Deliberately conservative: desktop keeps the exact existing layout even
    // in an ordinary resized window. The adaptive shell only activates when a
    // touch-oriented device is also phone-sized.
    return width <= 860 && touchCapable;
  }

  let lastState = null;
  function applyDeviceUi() {
    const mobile = shouldUseMobileUi();
    if (mobile === lastState) return;
    lastState = mobile;
    root.classList.toggle('rhk-mobile-ui', mobile);
    root.dataset.rhkDeviceUi = mobile ? 'mobile' : 'desktop';
    window.dispatchEvent(new CustomEvent('rhkearth:device-ui', {
      detail: { mode: mobile ? 'mobile' : 'desktop' },
    }));
  }

  applyDeviceUi();

  const schedule = () => window.requestAnimationFrame(applyDeviceUi);
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  window.addEventListener('pageshow', schedule, { passive: true });
  window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  coarsePointer?.addEventListener?.('change', schedule);
  noHover?.addEventListener?.('change', schedule);
})();

// Rebuild marker: aircraft motion integrity deployment 2026-09-04.
