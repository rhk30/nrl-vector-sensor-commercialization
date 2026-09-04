from pathlib import Path

ROOT = Path.cwd()

# This script is already part of every integrated Experimental source pass via
# tune-experimental-cctv.py. Apply the independent aircraft-motion integrity
# patch first so it survives every rebuild even if the Chicago module below is
# already patched/no-op. Keeping the call here avoids another fragile duplicate
# source-rewrite stage in the workflow.
motion_patch = ROOT.parent / 'scripts' / 'patch-aircraft-motion.py'
if not motion_patch.exists():
    raise SystemExit('RHKEARTH aircraft motion integrity patch script missing')
exec(compile(motion_patch.read_text(encoding='utf-8'), str(motion_patch), 'exec'))

target = ROOT / 'src/data/chicagoStreetActivity.js'

# The Chicago CDOT feed can contain repeated activity IDs and, in some cases,
# repeated rows for the same activity/coordinate. Cesium EntityCollection IDs
# must be unique; blindly using only row.id can therefore stop the entire globe
# renderer with DeveloperError. Keep distinct geometries for the same activity,
# collapse exact duplicates, and retain a final getById guard.
if not target.exists():
    print('RHKEARTH Chicago street duplicate guard: module not present in this source build; no-op')
    raise SystemExit(0)

text = target.read_text(encoding='utf-8')
old = '''  _dataSource.entities.removeAll();
  const visible = _rows.filter((row) => pointInRect(row.lat, row.lon, rect)).slice(0, MAX_RENDERED);
  for (const row of visible) {
    const lat = Number(row.lat);
    const lon = Number(row.lon);
    const id = String(row.id || `${lat},${lon}`);
    const kind = compact(row.kind || row.type || 'Street activity', 42);
    const street = compact(row.street || row.location || 'Chicago street', 72);
    const description = compact(row.description || '', 120);
    const color = activityColor(kind);
    _dataSource.entities.add({
      id: ENTITY_PREFIX + id,
'''
new = '''  _dataSource.entities.removeAll();
  const visible = [];
  const seenRenderKeys = new Set();
  for (const row of _rows) {
    if (!pointInRect(row.lat, row.lon, rect)) continue;
    const lat = Number(row.lat);
    const lon = Number(row.lon);
    const rawId = String(row.id || `${lat},${lon}`);
    // One CDOT activity can legitimately appear at multiple coordinates.
    // Coordinate-qualified IDs preserve those separate map points while exact
    // duplicate rows collapse to one Cesium entity.
    const renderId = `${rawId}:${lat.toFixed(6)}:${lon.toFixed(6)}`;
    if (seenRenderKeys.has(renderId)) continue;
    seenRenderKeys.add(renderId);
    visible.push({ row, renderId });
    if (visible.length >= MAX_RENDERED) break;
  }

  for (const { row, renderId } of visible) {
    const lat = Number(row.lat);
    const lon = Number(row.lon);
    const kind = compact(row.kind || row.type || 'Street activity', 42);
    const street = compact(row.street || row.location || 'Chicago street', 72);
    const description = compact(row.description || '', 120);
    const color = activityColor(kind);
    const entityId = ENTITY_PREFIX + renderId;
    // Last-resort invariant guard: a bad provider row must never be allowed to
    // terminate Cesium's render loop for the entire RHKEARTH dashboard.
    if (_dataSource.entities.getById(entityId)) continue;
    _dataSource.entities.add({
      id: entityId,
'''

if old not in text:
    if 'seenRenderKeys' in text and 'getById(entityId)' in text:
        print('RHKEARTH Chicago street duplicate guard already applied')
        raise SystemExit(0)
    raise SystemExit('Could not locate Chicago street entity render block')

target.write_text(text.replace(old, new, 1), encoding='utf-8')
print('RHKEARTH Chicago street duplicate entity guard applied')
