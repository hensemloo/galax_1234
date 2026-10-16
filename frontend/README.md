# CocoaCheck Sabah: Frontend

React 19 + Vite 8 web app that helps field officers check cocoa trees for **pod disease**.
The officer photographs the pods of one tree, the AI **suggests** a label per pod, the officer
reviews and confirms every result, and the app calculates % pods infected, severity and a
recommended action. Supervisors monitor everything on a desktop dashboard.

Preliminary screening only, not an official diagnosis. Severity thresholds and recommended
actions are **DEMO** values until verified by Lembaga Koko Malaysia (LKM).

Field officer screens (`/staff`) are mobile-first; supervisor screens (`/admin`) are desktop.

## Requirements

- Node.js 22
- npm

## Getting started

```bash
cd frontend
npm install
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
npm run dev            # http://localhost:5173
```

## Scripts

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with hot reload |
| `npm run lint`    | Run ESLint                           |
| `npm run format`  | Format `src/` with Prettier          |
| `npm run build`   | Build for production into `dist/`    |
| `npm run preview` | Serve the production build locally   |

Run `npm run lint` and `npm run build` before every commit.

## Environment variables

| Name                | Example                 | Purpose                                   |
| ------------------- | ----------------------- | ----------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | FastAPI backend URL                       |
| `VITE_USE_MOCK`     | `true`                  | `true` = use mock data, no backend needed |

Env vars are read only in `src/services/apiClient.js`.

## Demo accounts (mock mode only)

| Role (UI)     | Role (code) | Name            | Email               | Password |
| ------------- | ----------- | --------------- | ------------------- | -------- |
| Field officer | `staff`     | Aina            | staff@cocoacheck.my | demo1234 |
| Field officer | `staff`     | Hafiz           | hafiz@cocoacheck.my | demo1234 |
| Supervisor    | `admin`     | Supervisor Demo | admin@cocoacheck.my | demo1234 |

Officers see only their own inspections; the supervisor sees all. The mock login is for demos
only. It is not real security. Mock data changes (new drafts, photos) last until you refresh.

## Folder structure

```
frontend/
├── _archive/              Old code, never import (bean-version/ = the old bean app)
├── public/images/         cocoa-pattern.webp (page background pattern)
└── src/
    ├── main.jsx           Entry point
    ├── App.jsx            AuthProvider + AppRouter
    ├── styles/index.css   Tailwind + design tokens (brand + sev-* severity colours, cc-bg)
    ├── routes/            AppRouter, ProtectedRoute, homePath
    ├── context/           AuthContext (logged-in user)
    ├── layouts/           StaffLayout (header + tab bar), StaffWizardLayout (4 steps), AdminLayout
    ├── components/
    │   ├── navigation/    BottomTabBar (Home · New · History), AdminSidebar
    │   └── ui/            Button, Card, SeverityBadge, PodLabel, InspectionCard, StatusChip, ...
    ├── pages/
    │   ├── auth/          LoginPage (one login for both roles)
    │   ├── staff/         Home, History, Profile, wizard (O2–O5), Report (O6), Full report (O7)
    │   ├── admin/         Dashboard, Inspections, Blocks, Trees, Disease info
    │   └── dev/           /dev/components preview (dev server only)
    ├── services/          apiClient, authService, inspectionService (mock or real API)
    ├── mocks/             mockUsers.js, mockData.js (farms, trees, diseases, inspections)
    └── utils/             format, severity, inspectionRules, inspectionRoutes
```

Many screens are still placeholders (they show their screen ID and a TODO list).
See `CLAUDE.md` section 13b for who builds which screen, and `docs/design/pod/` for the mockups.

## Conventions

- Pages call **services**, never axios or the mocks directly.
- Severity, % infected and counts come from **one function**: `summarisePods` in
  `src/utils/severity.js`. Don't recalculate them in a page.
- DEMO numbers (severity thresholds, "AI unsure" confidence, max photos) live in
  `src/utils/severity.js` and `src/utils/inspectionRules.js`.
- Use the design tokens from `src/styles/index.css` (e.g. `bg-primary`, `text-text-muted`,
  `bg-sev-medium-bg`). No raw hex colours in components. Severity is always text + colour.
- API data uses camelCase field names (shapes in `CLAUDE.md` section 11).
- Every page handles loading (Skeleton), empty (EmptyState) and error (ErrorState).
- Router imports come from `react-router` (not `react-router-dom`).
