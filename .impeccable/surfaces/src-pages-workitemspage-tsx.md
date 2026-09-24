---
version: 1
slug: 'src-pages-workitemspage-tsx'
primary_target: 'src/pages/WorkItemsPage.tsx'
related_targets:
  [
    'src/components/WorkItemTable.tsx',
    'src/components/WorkItemDetail.tsx',
    'src/components/StatusFilter.tsx',
    'src/index.css',
  ]
---

# Work queue — surface brief

Scope: the operator work queue and item detail (`src/pages/WorkItemsPage.tsx` and the components it
renders). Visitor mode: **Operate**.

Audience: intake operators working an insurance correspondence queue for a full shift, and hiring
reviewers assessing this as a technical submission — equal weight, confirmed by the user.
Task: filter the queue, read what came in, judge the AI's verdict, and analyse / retry / complete.
Proof: real transition and attempt history per item; `allowedActions` from the server.
Constraints: TanStack Query owns server state; filter, page and selection live in the URL; no
optimistic updates; buttons render from `allowedActions`; WCAG 2.2 AA; self-hosted fonts only, noted
in `docs/decisions.md`.

## Direction contract

**THESIS.** The workflow is a line diagram, and every work item is a service travelling it.
RECEIVED → ANALYSING → READY FOR REVIEW → COMPLETED is a route; FAILED is a branch; retry is a
reversal. Status stops being a pill glued to a row and becomes _position on a network_. This refuses
the operations-console arrangement the category always ships — left rail, filter bar, uniform table,
right drawer — which is precisely what this app is today.

**OWN-WORLD.** Midnight-blue enamel ground (#0B1230) with porcelain white (#FFFFFF) tile. Four line
inks, each bound to a status and never used decoratively: cobalt #1E5BFF ANALYSING, amber #FFC20E
READY FOR REVIEW, scarlet #E21D2D FAILED, green #22B14C COMPLETED; porcelain for RECEIVED. Lines bend
only at 45° and 90° — one modulus rules every alignment, no half-pixels. Interchange circles mark
items; weight carries priority (double ring URGENT, filled HIGH, ring MEDIUM, tick LOW). Type is
Overpass (Highway Gothic lineage) for display, station labels and chrome, Overpass Mono for times,
IDs and codes, Literata for customer prose. Enamel owns the queue and all chrome; porcelain owns the
reading plate. No cards, no uniform rounded rectangles, no drop shadows — enamel and tile are the
only surfaces.

**STORY.** The operator arrives at a live network and sees, without reading a word, where the work
is massed and what is stuck. They trace one service to its station, read the machine's verdict on a
porcelain plate, and either pass it forward or send it back round. They understand that the machine
is a service on a line — fallible, reversible, logged — not an oracle.

**FIRST VIEWPORT.** A full-bleed enamel plane, no page margin and no sidebar. Across the top, the
network band: the five statuses as fixed stations on one route, FAILED branching below at 45°. It is
the filter — clicking a station filters the queue, replacing the pill row entirely. The selected
station carries the authoritative count for the corridor in view. **Amended again after the verdict
pass:** that figure was briefly set at display scale beneath the band; a large number over a small
label is the hero-metric template the craft floor refuses, and it restated the total Pagination
already prints in the same viewport. It is now a quiet station figure, and the display voice sits
where it is not a duplicated number — the wordmark. **Amended after the first finish review:** this block originally promised a live
count on _each_ station. The v1 list endpoint returns `count` only for the status actually queried,
so six per-station counts would take six requests per render (which breaks the polling contract the
tests pin) or a new aggregate endpoint, which is a backend change outside this work. A fabricated
count derived from the page in hand would be a smaller and different truth, so the single
authoritative figure stands in its place. Beneath it, the queue on enamel: interchange marker
(ink = status, ring weight = priority), item ID in mono, title in Overpass, logged time beneath it
in mono. Selecting an item marks its route with its own line ink and unfolds a porcelain plate over
the right two-fifths, carrying description, the AI verdict, and history. The primary action sits at
the foot of that plate as a scarlet enamel button, the only saturated fill on the surface.

**FORM.** Metropolitan transit diagram fired as midnight-blue enamel
(`wayfinding-cartography-signage-midnight-transit-diagram`), chosen by the user from the bolder
re-roll hand over the dealt leader (one-bit desktop) and Night Atlas. Seed key **6246435e**,
re-roll round 1, bolder register. Three disciplines carried from the round's declined cards: absence
drawn as deliberately as presence (ghosted field cells at final size, so nothing reflows when a
verdict lands); composition as stacked mass with real voids rather than uniform gutters; one modulus
ruling every alignment. Signature interaction: when a poll returns a completed analysis, the item's
interchange marker re-forms in its new line ink — travelling in along its row and ringing out from
the station like an arrival — so a landed verdict is visible in peripheral vision across a long
queue instead of being a pill quietly changing colour. **Amended after the first finish review:**
the first build made this a 14px nudge under an exponential ease-out, over before it could
register, and it faded opacity, which the motion grammar below forbids. Both were corrected: a
30px travel, a 0.55s arrival, and a ring that expands out of the marker in its own ink. Motion
grammar: position and ink only, never an opacity fade on the marker itself;
`prefers-reduced-motion` jumps instantly to the destination state.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Mobile: the network band must degrade to a focused corridor, never a shrunken unreadable network.
  The incumbent's 390px table overflow is a defect to fix here, not inherit.
