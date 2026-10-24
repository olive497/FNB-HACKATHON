# SafeBank — build roadmap (Team Finovators prototype)

Frontend-only prototype per uploaded spec. TanStack Router + Tailwind v4 design tokens, Recharts, sonner toasts, mock data with local state. All items complete.

- [x] Design system tokens (brand green/teal/mint/gold, light+dark) in src/styles.css
- [x] Demo data + scam rule engine + lessons + sample support listings (src/lib/demo-data.ts)
- [x] App store: mock auth, onboarding state, budgets/goals CRUD, prefs, in-memory-only safety data (src/store/store.tsx)
- [x] Shared UI primitives (src/components/ui.tsx)
- [x] Public landing page (/)
- [x] Login / Sign-up / Forgot-password screens
- [x] Onboarding flow (5 steps)
- [x] Dashboard shell (sidebar, topbar, mobile bottom nav + More sheet)
- [x] Overview page (cards, charts, quick actions, insights)
- [x] SmartBudget (income/expense CRUD, calculator, limits, irregular mode, alerts)
- [x] SafePocket (goals CRUD, contributions, savings calculator, suggestions)
- [x] ScamShield (rule-based checker, education, scored quiz)
- [x] MoneyWise (4 lessons with quizzes, progress, badges)
- [x] Financial Safety (education, SafeExit calculator, Safety Circle, privacy controls, quick exit)
- [x] Rebuild (recovery dashboard, debt planner, recovery goals, resources)
- [x] Support Navigator (search + category/region filters, sample listings)
- [x] Settings (profile, language, theme, accessibility, privacy, notifications, reset, about)
- [x] Build green + vitest passing + Playwright click-through of full flow (landing → demo login → onboarding → dashboard → actions → quick exit) with zero console errors
