# SafeBank API (backend)

Express + JSON-file store + a trainable ScamShield model. Runs on Node 20+ with no native dependencies (installs cleanly on Windows).

```powershell
npm install
npm run train      # trains the ScamShield classifier -> model/scam-model.json
npm test           # 7 API tests
npm start          # http://localhost:4000/api
```

Config (optional): copy `.env.example` values into your shell, e.g. `$env:PORT=4000; $env:JWT_SECRET="something-long"`.

## Endpoints (prefix `/api`)

Auth = `Authorization: Bearer <token>`. "Public" works without login.

| Area | Endpoints |
|---|---|
| Health | `GET /health` (public) |
| Auth | `POST /auth/signup` `login` `demo` `forgot-password` (public) - `GET/PATCH/DELETE /auth/me` - `POST /auth/onboarding` `change-password` `reset-demo-data` - `PUT /auth/prefs` |
| SmartBudget | CRUD `/income`, `/expenses` (filter `?month=2026-10&category=Food`) - `GET /budget/summary` - `GET/PUT /budget/limits` - `GET /budget/irregular` |
| SafePocket | CRUD `/goals` + `POST /goals/:id/contribute` - `POST /calculators/savings` |
| Overview | `GET /overview?month=` (totals, category breakdown, trend, goals, insights) |
| ScamShield | `POST /scamshield/analyse` - `GET /scamshield/education` `quiz` `model` - `POST /scamshield/quiz/submit` (public) |
| MoneyWise | `GET /moneywise/lessons` `lessons/:id` `progress` - `POST /moneywise/lessons/:id/quiz` (public; saves progress when logged in) |
| Financial Safety | `POST /safety/safe-exit` (stateless, nothing stored) - `GET /safety/items` |
| Rebuild | CRUD `/debts`, `/recovery-goals` (+ `/contribute`) - `GET /rebuild/debt-plan?extra=300` (avalanche vs snowball) `summary` `resources` |
| Support | `GET /support?category=&region=&q=` (public, sample listings) |

## Privacy rules kept from the frontend
- ScamShield message text is analysed in memory and never stored or logged.
- Safe Exit numbers are calculated and returned, never saved. There are deliberately **no** endpoints for the Safety Circle - keep it in the browser.
- ScamShield never returns "safe": a low score still says the message may not be safe.

## Training the model
`npm run train` builds a Naive Bayes text classifier (unigrams + bigrams) from `ml/data/training.csv`
(generated synthetic South African SMS examples) and prints holdout accuracy/precision/recall.
Those numbers are optimistic because the data is synthetic. To use real data:

```powershell
npm run train -- --data C:\path\to\labelled.csv
```

CSV/TSV rows are `label,text` with label `scam`/`ham` (the public SMS Spam Collection `spam`/`ham` TSV works as is).
The final ScamShield score blends the transparent rules (65%) with the model (35%); the rule explanations are always returned.

## Wiring the frontend
Point the app at `http://localhost:4000/api` (e.g. `VITE_API_URL`), call `POST /auth/demo` for a token, then replace the
local store actions in `src/store/store.tsx` with `fetch` calls to the routes above. CORS already allows ports 3000, 5173 and 8080.
