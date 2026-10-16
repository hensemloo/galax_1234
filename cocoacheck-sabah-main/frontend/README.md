# CocoaCheck Sabah — Frontend

React 19 + Vite 8 web app for AI-assisted cocoa bean quality screening.
Staff screens are mobile-first; admin screens are desktop-only.

## Requirements

- Node.js 20 or newer
- npm

## Getting started

```bash
cd frontend
npm install
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
npm run dev            # http://localhost:5173
```

## Scripts

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Start the dev server with hot reload      |
| `npm run lint`   | Run ESLint                                |
| `npm run format` | Format `src/` with Prettier               |
| `npm run build`  | Build for production into `dist/`         |
| `npm run preview`| Serve the production build locally        |

## Environment variables

| Name                | Example                 | Purpose                                         |
| ------------------- | ----------------------- | ----------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | FastAPI backend URL                             |
| `VITE_USE_MOCK`     | `true`                  | `true` = use mock data, no backend needed       |

## Demo accounts (mock mode only)

| Role  | Email                  | Password   |
| ----- | ---------------------- | ---------- |
| Staff | staff@cocoacheck.my    | demo1234   |
| Admin | admin@cocoacheck.my    | demo1234   |

The mock login is for demos only. It is not real security.

## Folder structure

```
frontend/
├── _archive/            Old prototype components (not used, do not import)
├── public/              Static files served as-is
└── src/
    ├── main.jsx         Entry point
    ├── App.jsx          AuthProvider + AppRouter
    ├── styles/          Tailwind setup and design tokens (index.css)
    ├── routes/          AppRouter and ProtectedRoute
    ├── context/         AuthContext (logged-in user)
    ├── layouts/         StaffLayout, StaffWizardLayout, AdminLayout
    ├── components/
    │   ├── navigation/  BottomTabBar, AdminSidebar
    │   └── ui/          Button, TextField
    ├── pages/
    │   ├── auth/        LoginPage
    │   ├── staff/       Staff screens (dashboard, 6-step wizard, history, profile)
    │   └── admin/       Admin screens
    ├── services/        apiClient + one file per API area
    └── mocks/           Mock users and assessment data
```

## Conventions

- Use the design tokens from `src/styles/index.css` (e.g. `bg-primary`, `text-text-muted`). No raw hex colours in components.
- Staff screens: write mobile styles first. Desktop (`lg:`) styles come later.
- API data uses snake_case field names to match FastAPI (e.g. `batch_id`, `moisture_pct`).
- Router imports come from `react-router` (not `react-router-dom`).
