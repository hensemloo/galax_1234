// URLs for inspection screens (officer, and supervisor at the bottom).
// Keep in sync with routes/AppRouter.jsx.

// The 4 wizard steps. `label` is shown in "Step X of 4 · <label>", `title` in the header.
// Step 1 has no id yet (it creates the inspection).
export const WIZARD_STEPS = [
  { number: 1, key: 'details', label: 'Details', title: 'New inspection' },
  { number: 2, key: 'photos', label: 'Photos', title: 'Pod photos' },
  { number: 3, key: 'review', label: 'Review', title: 'Review pods' },
  { number: 4, key: 'summary', label: 'Summary', title: 'Summary' },
];

export const TOTAL_WIZARD_STEPS = WIZARD_STEPS.length;

export const NEW_INSPECTION_PATH = '/staff/inspections/new';

// O7 full report (view only): inspectionPath('INS-0012') -> "/staff/inspections/INS-0012"
export function inspectionPath(id) {
  return `/staff/inspections/${id}`;
}

// O6 report screen, shown right after confirming (the only place officers can download the PDF).
export function reportPath(id) {
  return `/staff/inspections/${id}/report`;
}

// wizardStepPath('INS-0008', 2) -> "/staff/inspections/INS-0008/photos"
// Step 1 always goes to the "new inspection" form.
export function wizardStepPath(id, step) {
  const found = WIZARD_STEPS.find((item) => item.number === step);
  if (!found || found.number === 1 || !id) return NEW_INSPECTION_PATH;
  return `/staff/inspections/${id}/${found.key}`;
}

// Has the AI labelled every pod photo?
export function isAnalysed(inspection) {
  const pods = inspection?.pods ?? [];
  return pods.length > 0 && pods.every((pod) => pod.aiLabel);
}

// Where a card should go when the officer taps an inspection:
// - completed -> full report (O7)
// - draft, not analysed (or new photos added since) -> photos step
// - draft, analysed -> review step
export function resumePath(inspection) {
  const id = inspection?.id;
  if (!id) return '/staff/inspections';
  if (inspection.status === 'completed') return inspectionPath(id);
  return wizardStepPath(id, isAnalysed(inspection) ? 3 : 2);
}

// Print page (A4 report, opens the browser's print dialog to save as PDF):
// printPath('INS-0012') -> "/staff/inspections/INS-0012/print"
export function printPath(id) {
  return `/staff/inspections/${id}/print`;
}

// ---------- Supervisor (admin) ----------

export const ADMIN_INSPECTIONS_PATH = '/admin/inspections';

// Inspection detail: adminInspectionPath('INS-0012') -> "/admin/inspections/INS-0012"
export function adminInspectionPath(id) {
  return `/admin/inspections/${id}`;
}

// Report view (A4 preview + "Print / Save as PDF"), completed inspections only.
export function adminReportPath(id) {
  return `/admin/inspections/${id}/report`;
}

// Where "Download PDF" goes for this role (both pages show the A4 report and print it):
// reportPathFor('staff', 'INS-0012') -> "/staff/inspections/INS-0012/print"
// reportPathFor('admin', 'INS-0012') -> "/admin/inspections/INS-0012/report"
export function reportPathFor(role, id) {
  return role === 'admin' ? adminReportPath(id) : printPath(id);
}

export const ADMIN_BLOCKS_PATH = '/admin/blocks';

// Block detail (tree tiles): adminBlockPath('BLK-A') -> "/admin/blocks/BLK-A"
export function adminBlockPath(blockId) {
  return `/admin/blocks/${blockId}`;
}

export const ADMIN_TREES_PATH = '/admin/trees';

// Tree history: adminTreePath('T-A-01') -> "/admin/trees/T-A-01"
export function adminTreePath(treeId) {
  return `/admin/trees/${treeId}`;
}
