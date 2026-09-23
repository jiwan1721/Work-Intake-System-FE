# TriageDesk — Frontend

React 19 + TypeScript (Vite) frontend for the AI-Assisted Work Intake System.

---

## Setup

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>. Vite proxies `/api` to
`http://localhost:8000`, so the browser only ever talks to one origin and there
is no CORS configuration to get wrong.

The backend must be running separately for API calls to work. See the root
`README.md` for full-stack setup instructions.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (watch mode) |
| `npm run test:ci` | Vitest (single run, for CI) |

---

## Quality gate

```bash
./scripts/verify.sh frontend   # eslint, tsc, vitest, vite build
```

Exit code 0 means green.

---

## Architecture

```
src/
├── api/             client.ts (ApiError / NetworkError), types.ts, workItems.ts
├── hooks/           useWorkItems, useWorkItem, useWorkItemActions
├── components/      StatusFilter, WorkItemTable, AnalysisCard, FailureCard,
│                    ActionButtons, TransitionHistory, feedback/
└── pages/           WorkItemsPage.tsx
```

**State management**

- Server state lives only in TanStack Query — no `useState` copy of API data.
- Filter, page and selection live in the URL, so a filtered view is shareable,
  survives a refresh, and the back button works.
- No optimistic updates for workflow actions. The server is authoritative and an
  analysis can come back `FAILED`; showing a result that then flips is worse
  than a spinner.
- Polling at 2 s happens only while something visible is `ANALYSING`.

Action buttons are driven by `item.allowedActions` returned by the API, so the
UI and backend cannot disagree about what is legal.

---

## Testing

31 tests using Vitest + React Testing Library + MSW.

```bash
npm run test:ci
```
