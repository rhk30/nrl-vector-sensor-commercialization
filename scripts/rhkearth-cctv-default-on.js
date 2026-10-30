(() => {
  'use strict';

  // One-time migration after the Oct. 27 CCTV retirement was reversed.
  // A normal RHKEARTH visit should visibly restore the public-camera layer,
  // but an explicit shared layer-state URL remains authoritative.
  const MIGRATION_KEY = 'rhkearth:cctv-restored-default-on:v1';
  const MAX_ATTEMPTS = 240;
  const POLL_MS = 250;

  function hasExplicitSharedLayerState() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('v') === '2' && params.has('l');
    } catch {
      return false;
    }
  }

  function migrationDone() {
    try { return localStorage.getItem(MIGRATION_KEY) === '1'; } catch { return false; }
  }

  function markDone() {
    try { localStorage.setItem(MIGRATION_KEY, '1'); } catch { /* best effort */ }
  }

  async function restoreCctvOnce() {
    if (hasExplicitSharedLayerState() || migrationDone()) return true;

    const manager = window.__godsEyeView?.dataManager;
    if (!manager?.layers?.has?.('cctv') || typeof manager.setEnabled !== 'function') return false;

    if (manager.isEnabled?.('cctv')) {
      markDone();
      return true;
    }

    try {
      // Explicit origin intentionally supersedes any stale local OFF snapshot
      // left behind while CCTV was retired. Subsequent user toggles are normal.
      const result = await manager.setEnabled('cctv', true, { origin: 'user' });
      if (result === false || !manager.isEnabled?.('cctv')) return false;
      markDone();
      manager._refreshTogglePanel?.();
      window.__godsEyeView?.requestRender?.('rhkearth-cctv-restored-default-on');
      console.info('[RHKEARTH:CCTV] Restored public-camera layer ON after retirement migration');
      return true;
    } catch (error) {
      console.warn('[RHKEARTH:CCTV] One-time default-on migration failed', error);
      return false;
    }
  }

  if (hasExplicitSharedLayerState() || migrationDone()) return;

  let attempts = 0;
  let busy = false;
  const timer = window.setInterval(async () => {
    if (busy) return;
    attempts += 1;
    busy = true;
    const done = await restoreCctvOnce();
    busy = false;
    if (done || attempts >= MAX_ATTEMPTS) window.clearInterval(timer);
  }, POLL_MS);

  void restoreCctvOnce().then((done) => {
    if (done) window.clearInterval(timer);
  });
})();
