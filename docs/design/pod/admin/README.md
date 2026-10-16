# CocoaCheck pod mockups: reference markup (admin / supervisor, desktop)

Same format as the staff mockups — read `docs/design/pod/README.md` first (how to read `sc-for`,
`sc-if`, `{{values}}`, `renderVals()`, `cc-bg`, and the mockup hex → Tailwind token mapping).
These files are REFERENCE ONLY: not React, they won't run on their own.

Extra mockup hex → token for admin: `#66574D` → text-muted · severity pill colours (bg/border/fg/dot
in `renderVals()`) → `sev-*` tokens · blue "Changed by officer" tag → `primary-soft` / `primary`
(we don't use blue).

Links inside the files use the old canvas names: `Main.dc.html` = A1 dashboard,
`Inspection.dc.html` = A3 detail, `Block.dc.html` / `TreeHistory.dc.html` = Layer 2.
`<dc-import name="ReportA4">` in A4 = the A4 report in `../staff/PDF-report-A4.html`
(in the app: the existing `components/inspection/InspectionReport.jsx`).

| File | Screen | Route | Layer |
|---|---|---|---|
| A0-login-desktop.html | Login, desktop layout (same LoginPage, wider) | /login | done already |
| A1-dashboard.html | Dashboard | /admin | 1 (block tiles + charts in this file are Layer 2/3, skip for now) |
| (no file) | Inspections list = the dashboard's "Recent inspections" table + filters | /admin/inspections | 1 |
| A3-inspection-detail.html | Inspection detail | /admin/inspections/:id | 1 |
| A4-report-view.html | Report view (A4 preview + print) | /admin/inspections/:id/report | 1 |
| L2-block-detail.html | Block detail (tree tiles) | /admin/blocks/:blockId | 2 (later) |
| L2-tree-history.html | Tree history | /admin/trees/:treeId | 2 (later) |
| L2-disease-info.html | Disease info | /admin/diseases | 2 (later) |
