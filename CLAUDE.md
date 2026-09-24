# TriageDesk — Frontend (`Work-Intake-System-FE`)

React 19 + TypeScript (Vite) operator UI for the AI-Assisted Work Intake System. It renders a
paginated list of work items, a detail panel, and the three workflow actions (analyse / retry /
complete) against the Django `/api/v1/` backend.

This directory is the `frontend/` half of the parent repo. Read the root `CLAUDE.md` too —
its architecture and hard rules apply here. One correction: the root file says "nothing is
built yet"; the frontend is in fact built, tested (31 passing tests) and committed.

## Layout note

`../frontend` is a **symlink** to this directory (same for `../backend` → `Work-Intake-System-BE`).
`scripts/verify.sh`, `docker-compose.yml` and the `Makefile` all reference `frontend/`, so run them
from the parent directory, not from here. This is its own git repo (`main`, remote `origin`).

## Commands

Run from this directory:

| Command                            | What it does                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run dev`                      | Vite dev server on :5173, proxying `/api` → `$VITE_API_PROXY_TARGET` (default `http://localhost:8000`) |
| `npm run lint`                     | ESLint (flat config, type-checked rules)                                                               |
| `npm run typecheck`                | `tsc -b`                                                                                               |
| `npm run test` / `npm run test:ci` | Vitest watch / single run                                                                              |
| `npm run build`                    | `tsc -b && vite build`                                                                                 |
| `npm run format`                   | Prettier write                                                                                         |

The quality gate is `../scripts/verify.sh frontend` — lint, typecheck, `test:ci`, `build`, in that
order. Exit 0 means green. Never edit that script or loosen a lint/TS/test setting to pass it.

The backend must be running separately for the dev server to return real data; the Vite proxy keeps
everything on one origin so there is no CORS config anywhere.

## Architecture

```
src/
├── api/          client.ts (API_BASE, ApiError, NetworkError, api.get/post/patch)
│                 types.ts (the v1 wire contract), workItems.ts (endpoints + query keys)
├── hooks/        useWorkItems, useWorkItem, useWorkItemActions
├── components/   StatusFilter, WorkItemTable, StatusBadge, WorkItemDetail, AnalysisCard,
│                 FailureCard, ActionButtons, TransitionHistory, statusLabels, feedback/
├── pages/        WorkItemsPage.tsx
├── test/         setup.ts, server.ts, handlers.ts (MSW), utils.tsx (renderApp + factories)
└── main.tsx      QueryClientProvider + BrowserRouter; index.css is plain CSS, one file
```

Both routes (`/` and `/work-items`) render `WorkItemsPage`; the detail panel opens from the `item`
search param rather than a nested route.

## Rules that shape the code

These come from PLAN §9 and are load-bearing — don't "simplify" them away:

- **Server state lives only in TanStack Query.** There is no `useState` copy of API data anywhere.
- **Filter, page and selection live in the URL** (`?status=`, `?page=`, `?item=`), so views are
  bookmarkable and the back button works. `WorkItemsPage` owns the single `update()` helper that
  writes search params; changing the filter clears `page` and `item`.
- **No optimistic updates for workflow actions.** The server owns transitions and an analysis can
  come back `FAILED`; mutations show a pending state and invalidate list + detail `onSettled`.
- **Polling only while something visible is `ANALYSING`** — `refetchInterval` returns
  `ANALYSING_POLL_MS` (2 s) conditionally, else `false`. A list of completed items must not poll.
- **Buttons are rendered from `item.allowedActions`.** The UI never decides for itself whether an
  action is legal. While any action for an item is pending, all of its buttons are disabled.
- **`API_BASE` in `api/client.ts` is the only place the API version appears.** Call sites ask for
  `/work-items`, never `/api/v1/work-items`.
- **`ApiError` vs `NetworkError` are distinct and worded differently** (`feedback/describeError.ts`).
  A `409` from a mutation shows the `STALE_ITEM_MESSAGE` toast, then refetches.
- **Add query keys to `workItemKeys` in `api/workItems.ts`**, never inline — an invalidation must not
  miss a cache entry by spelling a key differently.
- `types.ts` mirrors the backend serializers by hand: API JSON is camelCase. Keep enums as
  `as const` arrays so `WORK_ITEM_STATUSES` can drive the filter UI and narrow via
  `isWorkItemStatus`.

## TypeScript / lint gotchas

- `@typescript-eslint/no-explicit-any` is an **error**. So is `consistent-type-imports` —
  type-only imports must be `import type`. `verbatimModuleSyntax` is on, so a value import of a type
  breaks the build.
- `strict` + `noUncheckedIndexedAccess` + `noUnusedLocals/Parameters` + `erasableSyntaxOnly`.
  Indexing an array yields `T | undefined`; handle it rather than asserting.
- ESLint uses `projectService`, so files must be inside `src/` (the `tsconfig.app.json` include) or
  linting fails with a "not found in project" error.
- No `// eslint-disable`, `@ts-ignore` or `@ts-expect-error` without a comment explaining why.
- Prettier: no semicolons, single quotes, width 100, trailing commas. Run `npm run format`.

## Testing

Vitest + jsdom + React Testing Library + MSW. 31 tests in
`api/client.test.ts`, `App.test.tsx`, `components/WorkItemDetail.test.tsx`,
`pages/WorkItemsPage.test.tsx`.

- Render with `renderApp(ui, { route })` from `src/test/utils.tsx` — it wraps a **fresh**
  `QueryClient` (no retries, `gcTime: 0`), `MemoryRouter` and `ToastProvider`.
- Build fixtures with `makeWorkItem` / `makeDetail` / `makePage` / `ANALYSED` / `errorBody`, not
  hand-written literals.
- MSW handlers match the **absolute** path (`/api/v1/work-items`), matching `API_BASE`.
  `onUnhandledRequest: 'error'` — every request a component makes must be declared, so a new fetch
  in a component means a new handler.
- `src/test/handlers.ts` holds only a trivial empty-list default; a test that depends on a specific
  payload declares it via `server.use(...)` in the test itself.
- Query by role / accessible name (the components carry `aria-pressed`, `aria-busy`,
  `aria-label`, `role="status"` for this reason). Never delete or weaken a test to get green.

## Conventions

- Plain CSS in `src/index.css` with CSS custom properties and BEM-ish class names
  (`panel__header`, `filter__button--active`). Styling is deliberately minimal — effort goes into
  states and structure, not polish.
- Comments explain _why_ a non-obvious choice was made, often citing the PLAN section. Match that
  density; don't narrate what the code already says.
- Named exports for components; `App` is the only default export.
- No new dependency beyond PLAN §2 without a note in `../docs/decisions.md`.
- Never `git push`; only the build-loop orchestrator commits. Never read or print `.env` — use
  `.env.example`.
