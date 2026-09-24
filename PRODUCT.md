# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences of equal weight, confirmed by the user, which this product must satisfy
simultaneously:

1. **Hiring reviewers** assessing a technical submission. They arrive cold, spend a short first
   session forming an impression, and are explicitly grading decisions, structure, edge cases and
   trade-offs over feature count (`docs/PLAN.md` §1). They also read the repo's documents.
2. **Intake operators** working a claims/correspondence queue in an insurance context. They triage
   inbound customer work items for a full shift: read what came in, check what the AI concluded,
   and either action it or send it back. Volume and repetition are the situation; a single item is
   never the whole job.

Neither audience is decorative. The design has to survive a reviewer's first thirty seconds _and_
hold up as something a person could use for seven hours. The user acknowledged these pull in
opposite directions on density and drama and chose both anyway.

## Product Purpose

TriageDesk takes unstructured inbound work items, runs an AI analysis that classifies each one
(category, priority, summary, recommended action), and presents the result to a human who stays the
decision-maker. Success is an operator who can trust, correct, or retry the machine's judgement
without leaving the queue — and a reviewer who can see why the system was built this way.

## Positioning

The AI is explicitly fallible and the product is designed around that fact rather than hiding it.
A failed analysis is domain state, not an error page: `/analyse` returns 200 with a `FAILED` item
carrying an error code, an attempt count and a retry affordance. Unknown enum values from the model
are rejected outright rather than silently coerced to `OTHER`. Every status change is recorded in an
audit trail with actor and reason. A competitor that treats the LLM as authoritative could not
truthfully make the same claim.

## Operating Context

- Insurance / claims correspondence: duplicate collections, policy document requests, complaints
  about handling, coverage and excess queries, named-driver and address changes, renewal disputes.
- A regulated domain. Audit trail, attempt history and defensible decisions are product features,
  not nice-to-haves.
- The operator works a filtered list, opens one item, acts, and returns to the list. Filter, page
  and selection all live in the URL, so a view is shareable and survives refresh.
- Items in `ANALYSING` resolve on their own; the UI polls only while something visible is in that
  state.

## Capabilities and Constraints

- Five statuses: `RECEIVED` → `ANALYSING` → `READY_FOR_REVIEW` | `FAILED` → `COMPLETED`.
- Three operator actions: analyse, retry, complete. The server decides which are legal and sends
  them as `allowedActions`; the UI never infers legality itself.
- Six categories, four priorities. Priority is absent until an analysis exists.
- No optimistic updates: the server owns transitions and an analysis can come back `FAILED`.
- A `409` means the item changed underneath the operator; the UI says so and refetches.
- API JSON is camelCase under `/api/v1/`; every error uses `{"error": {code, message, details}}`.
- Server state lives only in TanStack Query. No `useState` copy of API data.
- No new runtime dependency outside `docs/PLAN.md` §2 without a note in `docs/decisions.md`.
  **Decided this session:** self-hosted font assets are permitted on that condition.

## Brand Commitments

- Name: **TriageDesk**. Current tagline in the UI: "AI-assisted work intake".
- No logo, wordmark, brand palette or typeface exists yet. Nothing is inherited and nothing is
  binding.

## Evidence on Hand

- `docs/PLAN.md` — architecture, API contract, workflow, and the reviewer-grading rationale.
- `src/api/types.ts` — the exact v1 wire contract the UI can rely on.
- Realistic insurance intake content written this session for rendering:
  `/tmp/triage-mock/server.mjs` (10 items across all five statuses, real failure codes, attempt
  and transition history). This is fixture content for design work, not seeded product data.
- Baseline screenshots of the incumbent UI at desktop and mobile: `/tmp/triage-mock/shots/`.
- **No** real customer data, logos, photography, testimonials, usage metrics or press exist. Future
  work must not fabricate them.

## Product Principles

1. **The human decides; the machine advises.** Never present an AI conclusion with more confidence
   than it has earned. Attempt count, model and timestamp are part of the claim.
2. **Failure is a first-class state.** A `FAILED` item deserves as much design attention as a
   successful one, and must always offer the way forward.
3. **The server is the authority on what is legal.** Affordances are rendered from
   `allowedActions`, never guessed.
4. **A view is an address.** Filter, page and selection are URL state, so any screen can be shared
   or restored exactly.
5. **Built to be read.** This codebase is a reviewed artifact; clarity of decision beats cleverness,
   in the interface as much as in the code.

## Accessibility & Inclusion

WCAG 2.2 AA, stated in the README as a deliberate commitment and verified against the rendered
result: contrast in every state, visible keyboard focus, full keyboard operation of the queue and
its actions, and honored `prefers-reduced-motion`.

**Known defect, present before this work:** at 390px the work-item table overflows horizontally —
the `PRIORITY` and `CREATED` columns are unreachable and the status badge is clipped. Any design
direction must fix this, not inherit it.
