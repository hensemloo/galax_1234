# CLAUDE.md: CocoaCheck Sabah (pod disease version)

> Context for Claude Code. Last updated 14 Oct 2026.
> Labels: **[Decided]**, **[Working assumption]** (current plan, may change after the LKM field trip), **[Open]** (not decided).
> Do NOT treat working assumptions or open items as final. Keep values (labels, thresholds, disease list) in data/config so the field trip changes data, not structure.
> **The bean version is dead.** Never build anything about beans, batches, moisture, bean count, grades, suppliers, rules engine or cut tests.

---

## 1. How to work with me (Sebastian)

- Final-year SE student, team lead for the frontend foundation, backend lead later. Teammates are bootcamp beginners.
- Explain in **simple language** but keep the **correct technical terms**.
- Give **step-by-step guidance with the "why"**.
- For code changes, always say **which file and which line** to edit.
- Prefer **simple, conventional** solutions. Don't expand scope; ask first.
- Never commit, push, merge or delete branches unless I ask.

---

## 2. What CocoaCheck is [Decided]

A web app that helps **field officers** check cocoa trees for **pod disease**:
1. The officer photographs the pods of **one tree** (1–10 photos, **one pod per photo**).
2. **AI suggests** a label per pod (e.g. Healthy / Black pod rot) with a confidence.
3. The officer **reviews and confirms** every result (human-in-the-loop).
4. The app calculates **% pods infected → severity** and shows a **recommended action** (from a disease table, never from AI).
5. The officer confirms → inspection is **locked** → a **PDF report** exists.
6. A **supervisor** monitors everything on a desktop dashboard.

**Positioning:** decision support / preliminary screening. **Not an official diagnosis.** The AI suggests; the officer decides.

**Context:** Gamuda AI Academy Sabah, Cohort 5 (Demo Day early Dec 2026, live demo). Team: Synergy IT Team (Sebastian, Daus, Jax, Anisa, Ain). Pivoted from beans after meeting Lembaga Koko Malaysia (LKM) on 9 Oct 2026. LKM field trip ~late Oct.

---

## 3. Roles [Decided]

| Code value (unchanged) | UI label | Device | Home route |
|---|---|---|---|
| `staff` | **Field officer** | Mobile-first | `/staff` |
| `admin` | **Supervisor** | Desktop | `/admin` |

- Keep `staff` / `admin` in code (auth, routes, ProtectedRoute, mock users). Show "Field officer" / "Supervisor" in the UI.
- **One login page for both.** No role picker; the role comes from the account.
- Officers see **only their own** inspections. Supervisors see all.

---

## 4. Words to use [Decided]

| Use | Not |
|---|---|
| inspection | assessment, batch |
| farm → **block** → **tree** (tree code e.g. `A-01`) | plot, supplier, batch ID |
| pod, pod photo | bean, sample |
| AI label, confidence, **final label** | prediction result, grade |
| severity: None / Low / Medium / High | passed / further inspection / grade A/B/C |
| excluded (unclear photo) | rejected |
| draft → completed (locked) | |

---

## 5. Officer flow [Decided for now: one tree per inspection]

```
Login → Home (drafts + recent)
→ New inspection: Farm → Block → Tree code → Visit date (default today, no future) → Notes
→ Pod photos: [Take photo] or [Choose from gallery] (multiple; 1–10)   ← saved as draft
→ Analyse (needs internet) → AI label + confidence per pod
→ Review pods: confidence < 0.70 (DEMO) = "AI unsure, please check" → must be checked one by one
   (change label, or "Unclear photo, exclude"); Continue disabled until all flagged pods are checked
→ Summary: counted / infected / excluded, % infected, severity (DEMO), disease(s), recommended action (DEMO)
→ Confirm (dialog: "can't be edited after") → status completed, locked
→ Report screen (O6): preview card, Download PDF, Back to Home, Start next inspection
```

Rules:
- **Tree code is "find or create"**: existing → show "Existing tree · last inspected <date>"; new → created.
- **No internet in the field:** officer takes photos with the phone camera, then later (with signal) creates the inspection and adds photos **from the gallery**. Creating the draft, adding photos and Analyse all need internet. **No offline mode in the app.**
- **Drafts** can be resumed from Home and History. Before confirm, photos/labels can change.
- Store **both** `aiLabel` and `finalLabel` per pod. Show "AI agreed on X of Y pods".
- **Download PDF:** officers can download **only on the Report screen right after confirming (O6)**. The Full report (O7) is view-only. Supervisors can download any report. **No Share button.**
- Backend rule later: officer may only read/download **their own** inspections (403 otherwise). Hiding buttons is not security.

---

## 6. Result logic [Working assumption]

- Pods counted = photos − excluded. Infected = counted pods whose final label is a disease.
- % infected = infected ÷ counted × 100.
- **Severity (DEMO, by % of pods):** None 0% · Low >0–<20% · Medium 20–49% · High ≥50%.
- Recommended action: looked up per disease from the disease table (DEMO text until LKM verifies).
- Compute severity in **one function** (`utils/severity.js` now, backend later) so summary, report and dashboard always match.
- Always show **DEMO** next to thresholds/actions. Severity always uses **text + colour**.

Example (Aina, Block A, tree A-01, 12 Oct 2026): 5 photos; Pod 4 AI "Black pod rot 52%" → officer changes to Healthy; Pod 5 blurry → excluded. Counted 4, infected 1 → **25% → Medium**. AI agreed 3 of 4.

Mock data dates are relative to today (daysAgo) so the demo always looks recent.

---

## 7. Screens

Design mockup: Claude Design canvas "CocoaCheck Admin Dashboard" (pages: Admin desktop / Officer mobile / PDF report A4). PNG exports go in `docs/design/pod/`. Build to match them, using **our tokens** (section 10), not the mockup hex values.

### Officer (mobile, `/staff`)
| ID | Screen | Route |
|---|---|---|
| O0 | Login (shared) | `/login` |
| O1 | Home: greeting, New inspection button, Drafts, Recent (last 3) + "See all in History" | `/staff` |
| O9 | History: search tree code, status chips All/Drafts/Completed (with counts), date chips This week/This month/Pick dates, grouped by day, newest first | `/staff/inspections` |
| O8 | Profile: avatar, name, "Field officer" badge, Staff ID, Email (read-only, "managed by your supervisor"), Change password, Photo tips, Disease guide, About, Log out | `/staff/profile` |
| O2 | New inspection (step 1 of 4: Details) | `/staff/inspections/new` |
| O3 | Pod photos (step 2: Photos) | `/staff/inspections/:id/photos` |
| O4 | Review pods (step 3: Review) + O4b "Check pod" bottom sheet | `/staff/inspections/:id/review` |
| O5 | Summary + Confirm (step 4: Summary) | `/staff/inspections/:id/summary` |
| O6 | Report (after confirm): success banner, preview card → O7, **Download PDF**, Back to Home, Start next inspection | `/staff/inspections/:id/report` |
| O7 | Full report (view-only, phone layout) | `/staff/inspections/:id` |

Navigation:
- **Bottom tab bar: Home · (+ New, raised, centre) · History.** No Profile tab.
- **Profile** opens from the **avatar in the header** (Home and History). Profile has a back arrow, no tab bar.
- Tab bar shows only on Home, History, Full report. **Hidden during the wizard (O2–O5)**; wizard uses back arrow + "Step X of 4" bar.
- Home tab shows a red badge with the number of drafts.
- Back on O7 uses `navigate(-1)` (fallback `/staff`).

### Supervisor (desktop, `/admin`), built in layers
| Layer | Screen | Route |
|---|---|---|
| 1 | Dashboard: 4 summary cards, **Trees needing attention** (latest = Medium/High), Recent inspections table (filters farm/period/officer; View · PDF) | `/admin` |
| 1 | Inspections: full table with filters | `/admin/inspections` |
| 1 | Inspection detail: summary, recommended action, pod cards (AI vs final, "Changed by officer", "Excluded"), AI agreement, "Download PDF report" → report view. Draft: header + "Draft — not confirmed yet" + photo count only (no severity, no PDF) | `/admin/inspections/:id` |
| 1 | Report view: A4 page preview + **one** "Print / Save as PDF" button (Print and Download PDF open the same browser dialog). Prints only the report. Draft → redirects to detail | `/admin/inspections/:id/report` |
| 2 | Block overview tiles on dashboard (colour = worst latest severity; not a map) + Blocks page (same tiles) + Block detail (tree tiles) | `/admin/blocks`, `/admin/blocks/:blockId` |
| 2 | Tree history (bar chart of % over time + table) | `/admin/trees/:treeId` |
| 2 | Disease info (read-only cards + severity table + AI limits) | `/admin/diseases` (officer: `/staff/diseases`) |
| 3 | Charts: weekly % infected, pods by final label | on dashboard |

Admin sidebar: Dashboard · Inspections · Blocks · Trees · Disease info. **Remove** Rules, Staff management, Activity logs (not in scope).

### PDF report (A4, 1 page)
Header (logo, "Cocoa Pod Inspection Report", report no., Completed) → details (farm, block, tree, date, officer, previous inspection) → severity box + counts → pod table (photo, AI suggestion, confidence, final label, note) → recommended action (DEMO) → officer notes → signature lines (officer, supervisor) → footer (severity scale, disclaimer, generated date, page 1 of 1). Print-friendly (black on white, readable in grayscale).

**PDF generation [Decided]:** Browser print-to-PDF via the InspectionReport component: officers `/staff/inspections/:id/print`, supervisors `/admin/inspections/:id/report` (`reportPathFor(role, id)` in `utils/inspectionRoutes.js`); backend does not generate PDFs in Phase 1.

---

## 8. Tech stack (actual) [Decided]

- **Frontend:** React 19 + Vite 8 (JavaScript), React Compiler (babel), Tailwind CSS v4 via `@tailwindcss/vite` (no tailwind.config), React Router 7, Axios, lucide-react, browser-image-compression. ESLint (flat) + Prettier (single quotes, semicolons, width 100). Node 22.
- **Backend:** FastAPI (Python) [Decided], not started. PostgreSQL, Google Cloud Storage for images [Working assumption].
- **AI:** Roboflow hosted image classification; Gemini API as backup; keys **only in backend**.
- **Deploy:** Firebase Hosting (frontend), Cloud Run (backend).

---

## 9. Repo structure (keep it) [Decided]

We **keep the existing structure**. No `features/` folders, no `@/` alias.

```
cocoacheck-sabah/
├── CLAUDE.md
├── backend/                     FastAPI (later)
├── docs/design/pod/             PNG exports of the mockups
├── docs/tasks/                  personal task trackers
└── frontend/
    ├── _archive/                old/unused code (never import, ignored by ESLint)
    ├── public/images/           cocoa-pattern.webp
    └── src/
        ├── components/ui/       shared, generic UI (Button, Card, ...)
        ├── components/navigation/  BottomTabBar, AdminSidebar
        ├── context/AuthContext.jsx
        ├── layouts/             StaffLayout, StaffWizardLayout, AdminLayout
        ├── mocks/               mockUsers.js, mockData.js
        ├── pages/auth|staff|admin|dev/
        ├── routes/              AppRouter.jsx, ProtectedRoute.jsx, homePath.js
        ├── services/            apiClient.js, authService.js, inspectionService.js
        ├── styles/index.css     Tailwind + @theme tokens
        └── utils/               format.js, severity.js, inspectionRoutes.js, ...
```

Rules:
- Pages call **services**, never axios or mocks directly. Services switch on `USE_MOCK` (`VITE_USE_MOCK`). Mock and real functions share names and return shapes.
- Env vars are read only in `services/apiClient.js`.
- Unused bean code goes to `frontend/_archive/` (not deleted).

---

## 10. Design system ("Cacao Lab")

Tokens live in `frontend/src/styles/index.css` (`@theme`). Use token classes (`bg-primary`, `text-text-muted`…), **never raw hex in components**.

Existing (keep): primary `#5a3825`, primary-dark `#2b1d16`, accent `#d9a441`, bg `#faf6f0`, surface `#ffffff`, border `#e8dfd3`, text `#2b1d16`, text-muted `#6b5b4e`, success `#3e6b48`, warning `#b8741a`, danger `#a63d32`. Fonts IBM Plex Sans / Mono. Radius 8px.

Severity tokens (bg / text / dot): none = green, low = yellow, medium = orange, high = red, plus neutral "not inspected" grey. **Brand = cocoa brown; status = traffic-light colours.** Healthy/None stays green on purpose.

Background: faint cocoa doodle pattern on page backgrounds only (class `cc-bg`, image `public/images/cocoa-pattern.webp`, opacity 0.08, blur 1.5px). Cards stay solid white. Not on the printed PDF.

Accessibility: tap targets ≥ 44px; every input has a `<label>`; status = text + colour; icon-only buttons need `aria-label`.

---

## 11. Data shapes (mock = future API)

```js
inspection = {
  id, status: 'draft' | 'completed',
  farm: { id, name }, block: { id, name }, tree: { id, code, isNew },
  visitDate: '2026-10-12', notes, officer: { id, name },
  pods: [{ id, photoUrl, aiLabel, aiConfidence, finalLabel, excluded, changedByOfficer, reviewed }],
  summary: { photos, counted, infected, excluded, percentInfected, severity, diseases: [{ code, count }], aiAgreed },
  previous: { visitDate, severity, percentInfected } | null,
  createdAt, confirmedAt,
}
disease = { code: 'healthy' | 'black_pod' | ..., nameEn, nameMs, cause, looks, action, source: 'DEMO' | 'LKM' }
```

`services/inspectionService.js` exports: `listInspections({ status, q, from, to, officerId, blockId, farmId })`, `getInspection(id)`, `createInspection({ blockId, treeCode, visitDate, notes })`, `lookupTree(blockId, code)`, `addPodPhotos(id, files)`, `removePodPhoto(id, podId)`, `analyseInspection(id)`, `updatePod(id, podId, { finalLabel, excluded })`, `confirmInspection(id)`, `downloadReport(id)`, `listFarms()`, `listDiseases()`, `listOfficers()`, `getDashboard(filters)`, `getTree(id)`, `listTrees({ farmId, blockId, q, status })`, `getBlock(id)`, `listBlocks({ farmId })`.

Block screens (rules [Working assumption, DEMO] in `utils/blockSummary.js`): tree status = its latest **completed** inspection (drafts don't count; none → `na` "Not inspected"); block severity = highest tree status. `getBlock(id)` → `{ block, farm, trees: [{ id, code, status, latest: { inspectionId, visitDate, officer, counted, infected, percentInfected } | null }], totals }`; `listBlocks({ farmId })` → `[{ block, farm, totals }]`; `totals = { severity, treesRegistered, treesInspected, podsChecked, podsInfected, percentInfected, treesMediumOrHigh, lastVisitDate }` (from each tree's latest completed inspection).

Tree screens (same rules): `getTree(id)` → `{ tree: { id, code }, block, farm, inspections: [{ id, visitDate, officer, counted, excluded, infected, percentInfected, severity, diseases: [{ code, count }] }] }`, **completed inspections only** (drafts are not history), **oldest → newest**. `listTrees({ farmId, blockId, q, status })` (status `all` | `attention` = Medium or High | `na` = not inspected) → `[{ id, code, block, farm, status, latest | null, inspectionCount }]` (latest as in `getBlock` trees; inspectionCount = completed only), sorted by block then tree code.

Draft API (FastAPI later): `POST /auth/login`, `GET /me`, `GET /farms`, `GET /officers`, `GET /blocks/{id}/trees?code=`, `GET /diseases`, `GET|POST /inspections`, `GET /inspections/{id}`, `POST /inspections/{id}/photos`, `DELETE /photos/{id}`, `POST /inspections/{id}/analyse`, `PATCH /photos/{id}`, `POST /inspections/{id}/confirm`, `GET /trees?farmId=&blockId=&q=&status=`, `GET /trees/{id}`, `GET /blocks?farmId=`, `GET /blocks/{id}`, `GET /dashboard`.

---

## 12. Coding rules

- JavaScript, function components, hooks. Reuse `components/ui/` before creating new ones.
- Each page handles **loading (Skeleton), empty (EmptyState) and error (ErrorState)**.
- Mobile-first for `/staff` (test at 360–390px); desktop for `/admin` (≥ 1280px) but must not break on small screens.
- Photos: validate jpeg/png/webp ≤ 5 MB, compress with browser-image-compression before upload.
- Run `npm run lint` and `npm run build` before every commit. Format with `npm run format`.
- Small commits, Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).

---

## 13. Git workflow

- `main` is protected by habit: work on a branch, open a PR, someone reviews, then merge.
- Branch names: `feat/<screen>`, `fix/<thing>`, `chore/<thing>`.
- Always `git pull origin main` before starting; rebase or merge main into your branch before the PR.
- Don't commit `.env`, `.firebase/`, `node_modules/`, `dist/`.

---

## 13b. Team ownership [Working assumption, confirm with team]

| Who | Screens |
|---|---|
| Sebastian | Foundation, Login, Home, History, Profile, StaffLayout/tab bar; backend lead |
| Ain | O2 New inspection + O3 Pod photos (camera/gallery, compression) |
| Jax | O4 Review pods + O4b Check pod sheet |
| Anisa | O5 Summary + O6 Report + O7 Full report + PDF |
| Daus | Admin Layer 1 (Dashboard, Inspections, Inspection detail, Report view) |

---

## 14. Out of scope (now)

Offline mode/PWA, on-device AI, multi-tree inspections (DB-ready, no screens), GIS map/GPS/QR tags, editing diseases or rules in the app, staff management, activity logs, IoT sensors, leaf/trunk diseases, Share button, self-service password reset (admin resets), language toggle (future: Bahasa Malaysia).

## 15. Claims to avoid

"AI diagnoses" (say "AI suggests") · "accurate" without test results · DEMO thresholds/actions or sample data presented as official · "replaces officers".

## 16. Open questions (LKM field trip)

Block/plot naming and tree tags · phone signal on plots · pods checked per tree · one or many trees per visit · real diseases in Sabah · how severity is judged · actions per disease · supervisor's priorities · their inspection form layout · local pod photos for AI testing.

- Do officers have signal at the tree? If not, later upgrade: keep photos on the phone and upload them all at Analyse (Phase 2+).