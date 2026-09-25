# Graph Report - Work-Intake-System-FE  (2026-09-25)

## Corpus Check
- Corpus is ~12,859 words - fits in a single context window. You may not need a graph.

## Summary
- 309 nodes · 615 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.83)
- Token cost: 41,717 input · 3,000 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `compilerOptions` - 17 edges
3. `react` - 16 edges
4. `react-router` - 13 edges
5. `useAuth()` - 13 edges
6. `ApiError` - 12 edges
7. `request()` - 10 edges
8. `scripts` - 9 edges
9. `useToast()` - 9 edges
10. `statusLabel()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `index.html (Vite entry HTML)` --conceptually_related_to--> `TriageDesk Frontend`  [INFERRED]
  index.html → README.md
- `favicon link /favicon.svg` --references--> `TriageDesk favicon (purple lightning/T mark)`  [EXTRACTED]
  index.html → public/favicon.svg
- `TriageDesk favicon (purple lightning/T mark)` --semantically_similar_to--> `SVG sprite icon set`  [INFERRED] [semantically similar]
  public/favicon.svg → public/icons.svg
- `useWorkItemActions()` --calls--> `useToast()`  [EXTRACTED]
  src/hooks/useWorkItemActions.ts → src/components/feedback/toastContext.ts
- `WorkItemsPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/WorkItemsPage.tsx → src/contexts/authContextDef.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **src/ layered architecture (api -> hooks -> components -> pages)** — readme_api_module, readme_hooks_module, readme_components_module, readme_pages_module [EXTRACTED 0.95]
- **Server state discipline: TanStack Query only, URL as state, no optimistic updates, targeted polling, allowedActions-driven buttons** — readme_tanstack_query, readme_url_as_state, readme_no_optimistic_updates, readme_polling_analysing, readme_allowed_actions_driven [EXTRACTED 0.95]
- **Social/community icon sprite (bluesky, discord, github, x, plus documentation and social decoration)** — public_icons_svg_bluesky_icon, public_icons_svg_discord_icon, public_icons_svg_github_icon, public_icons_svg_x_icon, public_icons_svg_documentation_icon, public_icons_svg_social_icon [EXTRACTED 0.95]

## Communities (14 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (48): @tanstack/react-query, Analysis, AnalysisAttempt, ApiErrorBody, AuthTokens, CATEGORIES, Category, isWorkItemStatus() (+40 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (31): react, react-dom, react-router, authApi, ApiError, AuthUser, RegisterRequest, RegisterResponse (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (22): msw, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, vitest, api, API_BASE, Paginated (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (25): dependencies, react, react-dom, react-router, @tanstack/react-query, name, private, type (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (22): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (21): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (20): Buttons driven by item.allowedActions, src/api (client.ts, types.ts, workItems.ts), Frontend Architecture, src/components (StatusFilter, WorkItemTable, AnalysisCard, FailureCard, ActionButtons, TransitionHistory, feedback/), src/hooks (useWorkItems, useWorkItem, useWorkItemActions), MSW (Mock Service Worker), No optimistic updates for workflow actions, src/pages (WorkItemsPage.tsx) (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+10 more)

### Community 8 - "Community 8"
Cohesion: 0.26
Nodes (14): doFetch(), isApiErrorBody(), isDetailErrorBody(), NetworkError, NO_AUTH_PATHS, refreshAccessToken(), request(), clearTokens() (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.21
Nodes (12): index.html (Vite entry HTML), favicon link /favicon.svg, /src/main.tsx module script, <div id="root"> mount point, TriageDesk favicon (purple lightning/T mark), SVG sprite icon set, bluesky-icon symbol, discord-icon symbol (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, lint, preview, test, test:ci (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

## Knowledge Gaps
- **111 isolated node(s):** `semi`, `singleQuote`, `printWidth`, `trailingComma`, `name` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 124 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 4` to `Community 3`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `react` connect `Community 1` to `Community 0`, `Community 8`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `react-router` connect `Community 1` to `Community 8`, `Community 0`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `printWidth` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06760316066725197 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11594202898550725 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11586452762923351 - nodes in this community are weakly interconnected._