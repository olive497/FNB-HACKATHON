<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- SafeBank is a frontend-only hackathon prototype (FNB App of the Year, Team Finovators). Never add real banking, payments or a production backend; all financial figures are simulated demo data in ZAR formatted as `R1,250.00` (use `formatZAR` from `src/lib/format.ts`).
- Routing is TanStack Router (`src/routes/`), not React Router. Dashboard pages are children of `/dashboard` (layout in `src/routes/dashboard.tsx`), named `dashboard.<feature>.tsx`.
- Design tokens live only in `src/styles.css` (oklch, light + `.dark`). Never hardcode color utilities in components.
- The SafeBank app store (`src/store/store.tsx`) persists only non-sensitive demo data to `localStorage` (`safebank-demo-v1`). Financial Safety planning data (SafeExit entries, Safety Circle contacts) must stay in-memory only — never persisted, never auto-shared.
- The ScamShield checker must stay transparent and rule-based (`SCAM_RULES` in `src/lib/demo-data.ts`) and must never declare a message "safe" when no indicators are found.
