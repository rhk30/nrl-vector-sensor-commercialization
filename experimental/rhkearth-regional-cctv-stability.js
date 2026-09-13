(() => {
  'use strict';

  const DATA_SOURCE_NAME = 'rhk-illinois-indiana-roadway-cameras';
  const ENTITY_PREFIX = 'rhk-il-in-roadcam:';
  const POLL_MS = 250;
  const MAX_ATTEMPTS = 240;

  function normalizeEntityStyle(entity) {
    if (!entity || !String(entity.id || '').startsWith(ENTITY_PREFIX)) return;
    try {
      if (entity.point) {
        entity.point.pixelSize = 6.0;
        entity.point.color = Cesium.Color.fromCssColorString('#A8B989').withAlpha(0.84);
        entity.point.outlineColor = Cesium.Color.fromCssColorString('#0C1009').withAlpha(0.96);
        entity.point.outlineWidth = 1.3;
        entity.point.disableDepthTestDistance = 0;
      }
      if (entity.label) {
        entity.label.disableDepthTestDistance = 0;
      }
    } catch (error) {
      console.warn('[RHKEARTH:CCTV:IL-IN] Could not normalize entity style', error);
    }
  }

  function copyEntityState(target, incoming) {
    if (!target || !incoming) return target;
    for (const key of ['position', 'orientation', 'point', 'label', 'properties', 'name', 'description', 'show']) {
      if (incoming[key] !== undefined) target[key] = incoming[key];
    }
    normalizeEntityStyle(target);
    return target;
  }

  function patchDataSource(dataSource) {
    const entities = dataSource?.entities;
    if (!entities) return false;
    if (entities.__RHK_IL_IN_STABLE_RECONCILE__) return true;

    const originalAdd = entities.add.bind(entities);
    const originalRemoveAll = entities.removeAll.bind(entities);
    const originalRemoveById = entities.removeById.bind(entities);
    let generation = 0;
    let seenIds = null;

    // The native regional addon rebuilds the whole viewport with removeAll()+add().
    // Reconcile that pass in place instead so hundreds of markers never disappear
    // for a frame between refreshes. A microtask removes only genuinely stale ids.
    entities.removeAll = function rhkStableRemoveAll() {
      generation += 1;
      const thisGeneration = generation;
      seenIds = new Set();

      queueMicrotask(() => {
        if (generation !== thisGeneration) return;
        const keep = seenIds || new Set();
        const stale = entities.values
          .filter((entity) => String(entity?.id || '').startsWith(ENTITY_PREFIX) && !keep.has(String(entity.id)))
          .map((entity) => String(entity.id));
        for (const id of stale) originalRemoveById(id);
        seenIds = null;
      });
    };

    entities.add = function rhkStableAdd(entityLike) {
      const id = String(entityLike?.id || '');
      if (seenIds && id.startsWith(ENTITY_PREFIX)) seenIds.add(id);

      if (id.startsWith(ENTITY_PREFIX)) {
        const existing = entities.getById(id);
        if (existing) return copyEntityState(existing, entityLike);
      }

      const added = originalAdd(entityLike);
      normalizeEntityStyle(added);
      return added;
    };

    // Keep a real clear operation available for debugging/destruction without
    // exposing it to the addon's routine viewport refresh cycle.
    entities.__rhkOriginalRemoveAll = originalRemoveAll;
    entities.__RHK_IL_IN_STABLE_RECONCILE__ = true;
    for (const entity of entities.values) normalizeEntityStyle(entity);

    console.info('[RHKEARTH:CCTV:IL-IN] Stable incremental camera reconciliation active');
    return true;
  }

  function locateAndPatch() {
    const viewer = window.__godsEyeView?.viewer;
    const dataSources = viewer?.dataSources;
    if (!dataSources || typeof dataSources.length !== 'number') return false;

    for (let i = 0; i < dataSources.length; i += 1) {
      const dataSource = dataSources.get(i);
      if (dataSource?.name !== DATA_SOURCE_NAME) continue;
      return patchDataSource(dataSource);
    }
    return false;
  }

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (locateAndPatch() || attempts >= MAX_ATTEMPTS) window.clearInterval(timer);
  }, POLL_MS);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', locateAndPatch, { once: true });
  } else {
    locateAndPatch();
  }
})();
