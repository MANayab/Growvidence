# Growvidence testing plan and implementation slices

- **Status:** Slice 1 implementation is proposed in `feat/slice-1-app-shell`; later app workflows and Playwright tests are not implemented.
- **Release posture:** Phase 2 design decisions were accepted on 2026-11-21. One slice PR is active at a time; stop after this PR for maintainer review.

## Test strategy

### 1. Unit and domain tests (Vitest)

Test pure domain rules and Zod schemas:

- Track/task/journal/evidence/review schema acceptance and rejection boundaries.
- AI-use disclosure modes, required fields and explicit unknown/not-recorded states.
- Task lifecycle and date/status invariants.
- Competency assessment invariants: task completion and streaks never create mastery; unapproved criteria cannot support “Demonstrated”; missing evidence yields “Needs more evidence”.
- Cross-record referential integrity, duplicate IDs and timestamp consistency.
- Export serialization, stable IDs, format version and round-trip.
- CSV escaping and formula-injection neutralization; unit-test cells beginning with =, +, - and @.
- Import preview, the two approved modes (Replace everything; Merge using newer updatedAt), atomic rollback and unsupported version handling; confirm per-record choices are absent from MVP.

Aim for at least 80% statement coverage in core domain modules as a diagnostic target; prioritize meaningful assertions and boundary cases over a percentage.

### 2. Persistence integration tests

Use `fake-indexeddb` for deterministic repository and migration integration tests in Vitest. Follow with real-browser IndexedDB checks during the dedicated E2E slice; fake-indexeddb does not replace browser quota/private-mode testing.

- Fresh database creation and expected stores/indexes.
- Upgrade fixtures from every supported prior schema version.
- Migration preserves IDs, timestamps, links and deleted records.
- Upgrade blocked by another open connection and stale connection closure.
- Aborted migration leaves previous database intact.
- Transaction rollback on a failed multi-record import.
- Quota/unavailable-storage errors produce recoverable UI states and do not silently discard data.
- Per-record permanent deletion removes the record from future backups; soft-deleted records remain in backups; delete-all clears all user-owned records and metadata.
- Reload persistence works for records saved successfully.

### 3. Component and accessibility tests

- Labels, descriptions, validation messages and status announcements.
- Keyboard operation for task list and Kanban without drag-and-drop.
- Focus management for dialogs, route changes, error states and destructive confirmation.
- No color-only state; contrast and reduced-motion behavior.
- Empty, loading, no-results, save-failure and import-conflict states.
- Automated axe checks for representative routes, followed by manual keyboard and screen-reader review.

### 4. Playwright end-to-end tests

Playwright is not currently installed. Add it only in the dedicated E2E slice with pinned versions and a maintainer-generated lockfile. Cover these user journeys in a real browser:

1. First use with no account: app loads under `/Growvidence/app/`, shows local-storage/backup explanation, creates a track and task.
2. Task lifecycle: create, edit, filter, move through statuses and reload; task completion does not alter competency status.
3. Journal and AI disclosure: save unassisted, assisted, partially assisted, unknown and not-recorded examples; verify missing disclosure is never interpreted as unassisted.
4. Evidence and competency: attach evidence, link criteria, add review, verify unapproved criteria and insufficient evidence block demonstrated status.
5. Export/import: preview, then Replace everything and Merge (newer updatedAt wins); verify atomic rollback, 10 MiB rejection, malformed/unsupported files and no per-record choices in MVP.
6. CSV: verify headers, quoting, line breaks and unit-test neutralization of cells beginning with =, +, - and @.
7. Delete: soft delete and backup retention, per-record Permanently delete, delete-all confirmation and empty-state reload.
8. Accessibility: keyboard-only critical journey, focus behavior, axe scan and responsive viewports.
9. SEO/static: public pages indexable, app HTML has noindex, app absent from sitemap, robots.txt does not disallow app, app direct refresh works on Pages.

### 5. Security and privacy tests

- Imported JSON is untrusted: enforce byte limit, parse errors, schema validation, referential integrity and safe text rendering.
- Accept only HTTP/HTTPS evidence URLs; reject javascript:, data: and other schemes; verify rel="noopener noreferrer" and no fetch/preview/embed.
- Ensure no learner records are written to URLs, localStorage, sessionStorage, Cache Storage, service-worker caches or logs.
- Verify no analytics, third-party scripts or remote network calls are introduced by the app.
- Verify generated static output contains no sample/private learner data, secrets or imported content.
- Test deletion and backup behavior; document that browser storage is not encrypted and can be cleared by browser/device actions.

### 6. Performance and deployment

- Record route, commit, device/emulation, network profile, browser, build and tool version for Lighthouse/measurement results.
- Inspect initial public-page JS to ensure the workspace runtime is not shipped on unrelated pages.
- Enforce 200 KiB gzip for every JavaScript file loaded by the initial workspace, including the React runtime, Astro renderer, island and shared assets; report each file and the total; add a bundle-size CI check and verify charts are lightweight SVG or lazy-loaded.
- Target Lighthouse 90+ as a diagnostic goal, not a guarantee; inspect Core Web Vitals and low-end mobile behavior.
- Test actual GitHub Pages base path and direct refresh. No server fallback assumptions.
- Test latest PR head CI; earlier-head results do not qualify.

## Build-slice PR breakdown

Each slice is one focused PR, based on freshly verified main, and must stop for maintainer review before the next slice. Every slice includes tests and docs updates. No automatic merges.

| Slice | Scope | Acceptance criteria | “Write this yourself” exercise |
|---|---|---|---|
| 1. App shell + persistence | Astro `/app/` entry, one React island, hash navigation, noindex, typed `idb` adapter, Zod settings/track schemas, versioned migrations and settings/minimal tracks repositories. | App direct-load/refresh works at Pages base path; app noindex and sitemap exclusion verified; public pages do not hydrate React; fake-indexeddb repository/schema/upgrade/failure tests pass; storage failures are recoverable; all JavaScript loaded by `/app/`, including React runtime, Astro renderer, island and shared assets, is at most 200 KiB gzip. | Write a typed repository interface for tracks and explain why UI components must not call IndexedDB directly. |
| 2. Tracks + tasks | Track CRUD/archive; task list and Kanban; daily/weekly/monthly task views and filters. | Task lifecycle persists across reload; keyboard alternative to drag; responsive layout; track/task reference integrity; completion does not change competency state. | Implement a pure task transition function and write tests for every allowed and rejected transition. |
| 3. Journal + AI disclosure | Journal CRUD, task linking, reflection and disclosure form. | Every entry stores one of the five disclosure modes; assisted/partial fields capture tool and contribution; unknown/not-recorded are visibly incomplete; validation and persistence tests pass. | Write a Zod schema for AI-use disclosure and test the difference between unknown and unassisted. |
| 4. Competency + evidence | Six rubric definitions, criteria, evidence, links, reviews and assessment engine. | Criteria carry approval status; unapproved criteria cannot produce demonstrated; evidence links are referentially valid; assessment is independent of task completion; unit and integration tests pass. | Write one criterion evidence evaluator that returns explicit reasons rather than a numeric mastery score. |
| 5. Export/import/delete | Versioned JSON backup, validated preview/merge, conflict choices, CSV convenience export, full local deletion and backup UX. | Valid round-trip; invalid/oversized/unsupported imports make no writes; transaction failure preserves old data; formula injection neutralized; deletion is verified and explained. | Write a pure import planner that returns additions, conflicts, invalid references and a user-confirmation summary without writing to storage. |
| 6. Dashboard | Overview, activity summaries, upcoming tasks, recent journal/evidence and competency states. | Dashboard derives from domain data; task/streak counts never imply mastery; charts have text/table alternatives; empty states and responsive/accessibility checks pass. | Write a dashboard view-model function and tests proving competency state is not calculated from task counts. |
| 7. E2E + accessibility + release review | Playwright, axe, keyboard/screen-reader review, performance, privacy/security threat review and deployment smoke checks. | Critical journeys pass on latest head; keyboard-only flow works; manual review recorded; performance measurements include conditions; threat review and privacy checklist are complete; Pages direct-load and SEO checks pass. | Write one Playwright test for import failure that proves pre-existing user data remains unchanged. |
| 8. Optional PWA/offline | Service worker, manifest, offline shell and cache lifecycle only if explicitly approved. | Separate maintainer approval; cache only public app shell/assets; never cache learner data; stale update, offline, quota and recovery behavior tested. | Write a cache allowlist test and explain why private evidence must never enter Cache Storage. |

## Release gates

A slice is not ready for review until:
- All required CI checks pass on its latest PR head.
- Tests cover success, invalid input and failure/recovery paths.
- Accessibility and responsive implications are checked.
- Privacy/security boundaries are reviewed.
- Documentation and known limitations are updated.
- No unrelated dependencies or files are included.
- No license policy changes occur.

## Decisions log — 2026-11-21

| # | Decision | Outcome |
|---|---|---|
| 1 | Workspace UI | Accepted: Astro static site with React islands; Preact only if measured bundle constraints justify it. |
| 2 | IndexedDB | Accepted: idb behind a typed repository adapter. |
| 3 | Competency levels | NEEDS APPROVAL: Demonstrated and Consistent definitions remain proposed. |
| 4 | Import limit | Accepted: 10 MiB; reject larger files before parsing/writing. |
| 5 | Import modes | Accepted: preview, then “Replace everything” or “Merge (newer updatedAt wins)”; atomic application. Per-record choices deferred. |
| 6 | Backup reminders | Accepted: dismissible reminder 30 days after last successful export, plus first-export prompt after meaningful data accumulates. |
| 7 | Evidence URLs | Accepted: HTTP/HTTPS only; reject other schemes; external links use rel="noopener noreferrer"; never fetch, preview or embed. |
| 8 | Reviews | Accepted: reviewerType is self or external; clearly distinguish in UI. Proposed Consistent corroboration weight: external 2, self 1. |
| 9 | CSV | Accepted: task-centric convenience export; neutralize cells beginning with =, +, - or @; unit tests required. JSON is full backup. |
| 10 | PWA | Accepted: defer until after Slice 7; separate explicit approval required. |
| 11 | Bundle/charts | Accepted: 200 KiB gzip for all JavaScript loaded by the initial workspace, including React runtime, Astro renderer, island and shared assets; hand-built SVG or lazy-loaded charts; bundle-size check required. |
| 12 | Deletion | Accepted: soft-deleted records remain in JSON backups; per-record Permanently delete and Delete all local data; no timed purge. |

### Competency levels — NEEDS APPROVAL

- **Demonstrated (NEEDS APPROVAL):** every mandatory criterion has at least one independent artifact.
- **Consistent (NEEDS APPROVAL):** the demonstration is repeated in a different task or context.
- Proposed Consistent corroboration: external review weight 2, self review weight 1. Reviews cannot replace the required independent artifact or repeated demonstration.

### Additional required tests

- Every /app/ page has build-time noindex meta; no app URL in sitemap.xml; robots.txt does not disallow /app/.
- reviewerType self/external is clearly and accessibly distinguished.
- Verify 10 MiB ceiling, both import modes, newer-updatedAt merge semantics and atomic rollback.
- Verify per-record permanent deletion, soft-delete backup retention and delete-all.
- Bundle-size check lists every JavaScript file loaded by `/app/`, reports each file's gzip size and the summed total, and fails when the total exceeds 200 KiB.
- Slice 1 smoke test renders workspace navigation and an honest initial storage state.
- Storage error mapping covers quota exhaustion, unavailable storage and unexpected database closure; blocked-upgrade and migration-failure messages must not imply data was deleted.
