# CocoaCheck pod mockups: reference markup (staff / field officer)

These files are the **source of the design mockups**, exported from the Claude Design canvas.
They are REFERENCE ONLY: they are NOT React and will NOT run on their own.

How to read them:
- Layout, spacing, font sizes, text and icons are in plain HTML + inline `style="..."`.
- `<sc-for list="{{x}}">` = a loop (a .map() in React). `<sc-if>` = conditional rendering.
- `{{name}}` = a value; the sample data is in the `<script>` block at the bottom (`renderVals()`).
- `class="cc-bg"` = the faint cocoa background pattern (see CLAUDE.md section 10).
- `/_blob/...` image URLs = our `/images/cocoa-pattern.webp`.
- Hex colours are mockup values. In the app ALWAYS use our Tailwind tokens from
  frontend/src/styles/index.css (primary, bg, surface, border, text, text-muted, sev-*).
  Mockup → token: #3B2416 → primary-dark · #6B3A1F → primary · #F7F2EC → bg · #E3D9CE → border ·
  #24180F → text · #5E5048 → text-muted · green/yellow/orange/red pills → sev-* tokens.
- Links between files (href="OfficerHome.dc.html") show the navigation → use the routes in CLAUDE.md.

| File | Screen | Route |
|---|---|---|
| O0-login.html | Login (mobile) | /login |
| O1-home.html | Home | /staff |
| O9-history.html | History | /staff/inspections |
| O8-profile.html | Profile | /staff/profile |
| O2-new-inspection.html | Wizard 1: Details | /staff/inspections/new |
| O3-pod-photos.html | Wizard 2: Photos | /staff/inspections/:id/photos |
| O4-review-pods.html | Wizard 3: Review | /staff/inspections/:id/review |
| O4b-check-pod-sheet.html | Check-pod bottom sheet (opens from Review) | (modal) |
| O5-summary-confirm.html | Wizard 4: Summary + Confirm | /staff/inspections/:id/summary |
| O6-report.html | Report after confirm (Download PDF here only) | /staff/inspections/:id/report |
| O6b-downloaded-pdf.html | What the downloaded PDF looks like on a phone | (phone PDF viewer, not a route) |
| O7-full-report.html | Full report, view only | /staff/inspections/:id |
| PDF-report-A4.html | The PDF itself (A4, 1 page) | generated |
| disease-guide-desktop-version.html | Disease guide content (admin layout; reuse content for /staff/diseases) | /staff/diseases |
