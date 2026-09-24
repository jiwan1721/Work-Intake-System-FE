# Design

<!-- impeccable:design-schema 1 -->

The world is **a metropolitan transit diagram fired as midnight-blue enamel**. The thesis: the
workflow _is_ a line diagram. `RECEIVED → ANALYSING → READY FOR REVIEW → COMPLETED` is a route,
`FAILED` is a branch off `ANALYSING`, and every work item is a service travelling it. Status is
position on a network, not a pill glued to a row.

Written from the built surface after the finish review. Tokens live in `src/index.css`; the machine
copy is `.impeccable/design.json`. Direction contract:
`.impeccable/surfaces/src-pages-workitemspage-tsx.md`.

## Surfaces

Two, and only two. No cards, no uniform rounded rectangles, no drop shadows.

|                                     |                                                                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Enamel** `--enamel #0b1230`       | The ground. Carries the network band, the queue and all chrome. One radial gradient at the top-right edge; `--enamel-raised #121b41` marks a selected row. |
| **Porcelain** `--porcelain #ffffff` | The reading plate. Used only for the opened item, because that is where an operator reads several hundred words of customer prose for a whole shift.       |

Light/dark was decided from the use scene, not category habit: an insurance office in daylight,
seven-hour shifts, dense prose. The queue scans better on enamel; the prose reads better on
porcelain. Both own whole regions.

## Line inks

One ink per status, bound to meaning and **never used decoratively**. Each clears 4.5:1 as text and
3:1 as a mark on the enamel ground.

| Status             | Token             | Value     | On enamel |
| ------------------ | ----------------- | --------- | --------- |
| `RECEIVED`         | `--ink-received`  | `#ffffff` | 18.4:1    |
| `ANALYSING`        | `--ink-analysing` | `#6fa2ff` | 7.25:1    |
| `READY_FOR_REVIEW` | `--ink-ready`     | `#ffc20e` | 11.35:1   |
| `FAILED`           | `--ink-failed`    | `#ff6b74` | 6.65:1    |
| `COMPLETED`        | `--ink-completed` | `#45d989` | 10.09:1   |

Saturated fills need a deeper scarlet to carry white text at AA: `--scarlet-fill #be1622` (6.31:1
with white). It is the only saturated fill on the surface and marks the primary action.

On porcelain the inks are re-tuned rather than reused — the enamel set is too light on white:
`#6b7690` · `#1e5bff` · `#a06f00` · `#c8102e` · `#0f7a45`.

## Geometry

- Lines bend only at **45°** and **90°**. The `FAILED` branch is a fixed-size SVG so the angle stays
  exactly 45° at every viewport; it hangs off the `ANALYSING` cell so the diagonal meets the trunk
  at that station's centre.
- The trunk runs through the band **and continues down the queue**: every item's marker sits on one
  2px line, terminating at the first and last station rather than the cell edge. The queue is a
  diagram, not a table with a glyph in it.
- One modulus rules alignment; no half-pixels. The queue's `max-width: 1062px` lands the status
  column under the last station on the trunk above.

## Markers

Every variant occupies the same **18px slot** so each centres on the trunk. Ink carries status;
ring weight carries priority, because the inks are already spent on the five statuses.

| Priority           | Mark                                             |
| ------------------ | ------------------------------------------------ |
| `URGENT`           | interchange — ring with a second ring outside it |
| `HIGH`             | filled                                           |
| `MEDIUM`           | 14px ring                                        |
| `LOW`              | 9px ring                                         |
| _not yet analysed_ | 10px **dashed** ring                             |

Unrated is deliberately not the same mark as `LOW`; sharing one would make the queue silently
report every unanalysed item as low priority.

## Type

| Role                                             | Face                    | Notes                                                                                                                                                                      |
| ------------------------------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display, labels, chrome, prose in the queue      | **Overpass** (variable) | Highway Gothic lineage — actual wayfinding ancestry, not a vibe. Carries the display voice at the wordmark: `clamp(1.9rem, 1.2rem + 2.4vw, 3.1rem)`, `-0.04em`, uppercase. |
| IDs, times, error codes, counts, tabular figures | **Overpass Mono**       | Measurement only. Column heads, buttons, alert titles and labels are tracked Overpass — monospace as a costume for "technical" is a tell, not a style.                     |
| Customer prose on the plate                      | **Literata**            | Reserved for description, summary and recommended action. Not preloaded; it is below the fold of the first paint.                                                          |

Self-hosted from `public/fonts/`, 143 KB total, latin subset. The two faces that set first-viewport
metrics are preloaded. Logged in `../docs/decisions.md` as a PLAN §2 deviation.

## Motion

One authored moment, not scattered effects.

- **The arrival.** When a poll returns a landed verdict, that item's marker travels 30px in along
  its row (`--ease-travel`, 0.55s) and a ring expands out of it in its new line ink (0.8s). It fires
  **only on a real status change** — `WorkItemTable` keeps a presentation-only ref of the previous
  status — because playing it on first paint would spend the gesture.
- Position and ink only on the marker itself; never an opacity fade, which is what a status pill
  does.
- `ANALYSING` pulses on the marker's `::before`.
- `prefers-reduced-motion: reduce` collapses every animation to its destination state; the working
  indicator stays legible as "working" rather than vanishing.

## States

- **Empty** — the trunk continues to an open terminus ring: a route with nothing on it. Never a
  dashed card outline.
- **Loading** — ghost rows at the height real rows will occupy, so the queue does not jump when data
  lands.
- **Failure** — a scarlet top rule, the error code in a mono chip, attempt count, and the retry the
  server says is legal. A failure is domain state and gets as much design as a success.
- **Network vs API error** — worded differently and always distinguishable.

## Non-negotiables held

- **WCAG 2.2 AA**, computed rather than eyeballed: every token pair checked numerically. Focus rings
  are amber on enamel (11.35:1) and navy on porcelain (18.37:1), because amber is 1.62:1 on white.
- The title is the row's control — a full-width target, not a 13px identifier (2.5.8).
- Browser surfaces are themed, not inherited: `::selection`, `scrollbar-color`, `accent-color`,
  `font-variant-numeric: tabular-nums` on every figure.
- No horizontal overflow at 390px. The band becomes a vertical corridor with the branch redrawn as
  an in-flow 45° spur; it is never a shrunken network.

## Known open

- **Enamel and porcelain are named as materials but render as flat fills.** The world's own craft
  bar gives both real depth and grain. Recorded by the finish review as unresolved, not hidden.
