# Growvidence testing plan and implementation slices

- **Status:** Proposed acceptance plan; app workflows and Playwright tests are not implemented.
- **Release posture:** No learner feature slice starts until the Phase 2 design PR is reviewed and merged.

## Test strategy

### 1. Unit and domain tests (Vitest)

Test pure domain rules and Zod schemas:

- Track/task/journal/evidence/review schema acceptance and rejection boundaries.
- AI-use disclosure modes, required fields and explicit unknown/not-recorded states.
- Task lifecycle and date/status invariants.
- Competency assessment invariants: task completion and streaks never create mastery; unapproved criteria cannot support “Demonstrated”; missing evidence yields “Needs more evidence”.
- Cross-record referential integrity, duplicate IDs and timestamp consistency.
- Export serialization, stable IDs, format version and round-trip.
- CSV escaping and formula-injection neutralization.
- Import preview/conflict decisions and unsupported version handling.

Aim for at least 80% statement coverage in core domain modules as a diagnostic target; prioritize meaningful assertions and boundary cases over a percentage.

### 2. Persistence integration tests

Use a real IndexedDB implementation in a controlled browser/test environment or a purpose-built IndexedDB test adapter; do not rely only on mocked happy paths.

- Fresh database creation and expected stores/indexes.
- Upgrade fixtures from every supported prior schema version.
- Migration preserves IDs, timestamps, links and deleted records.
- Upgrade blocked by another open connection and stale connection closure.
- Aborted migration leaves previous database intact.
- Transaction rollback on a failed multi-record import.
- Quota/unavailable-storage errors produce recoverable UI states and do not silently discard data.
- Explicit deletion clears all user-owned records and metadata.
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
5. Export/import: export valid JSON, import preview, merge new records, resolve conflicts, reject malformed/oversized/unsupported files and preserve prior data on failure.
6. CSV: verify headers, quoting, line breaks and formula-leading values are neutralized.
7. Delete: export prompt, explicit confirmation, full local-data deletion and empty-state reload.
8. Accessibility: keyboard-only critical journey, focus behavior, axe scan and responsive viewports.
9. SEO/static: public pages indexable, app HTML has noindex, app absent from sitemap, robots.txt does not disallow app, app direct refresh works on Pages.

### 5. Security and privacy tests

- Imported JSON is untrusted: enforce byte limit, parse errors, schema validation, referential integrity and safe text rendering.
- Reject javascript/data URLs and unsafe protocols for external artifact links; only allow explicitly supported http/https URLs.
- Ensure no learner records are written to URLs, localStorage, sessionStorage, Cache Storage, service-worker caches or logs.
- Verify no analytics, third-party scripts or remote network calls are introduced by the app.
- Verify generated static output contains no sample/private learner data, secrets or imported content.
- Test deletion and backup behavior; document that browser storage is not encrypted and can be cleared by browser/device actions.

### 6. Performance and deployment

- Record route, commit, device/emulation, network profile, browser, build and tool version for Lighthouse/measurement results.
- Inspect initial public-page JS to ensure the workspace runtime is not shipped on unrelated pages.
- Measure app initial JS and deferred feature chunks; proposed budget for maintainer approval: 200 KiB gzip initial workspace JS excluding Astro-shared assets.
- Target Lighthouse 90+ as a diagnostic goal, not a guarantee; inspect Core Web Vitals and low-end mobile behavior.
- Test actual GitHub Pages base path and direct refresh. No server fallback assumptions.
- Test latest PR head CI; earlier-head results do not qualify.

## Build-slice PR breakdown

Each slice is one focused PR, based on freshly verified main, and must stop for maintainer review before the next slice. Every slice includes tests and docs updates. No automatic merges.

| Slice | Scope | Acceptance criteria | “Write this yourself” exercise |
|---|---|---|---|
| 1. App shell + persistence | Astro `/app/` entry, React island per approved ADR, hash navigation, noindex, typed storage adapter, IndexedDB schema and migrations. | App direct-load/refresh works at Pages base path; app noindex and sitemap exclusion verified; public pages do not hydrate React; migration/rollback tests pass; storage failures are recoverable; no learner data in forbidden storage locations. | Write a typed repository interface for tracks and explain why UI components must not call IndexedDB directly. |
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

## Consolidated open decisions (recommendations, not approvals)

1. **Workspace UI framework — NEEDS APPROVAL.** Recommend React islands inside Astro (ADR-0005); keep public pages HTML-first. Use Preact only if bundle measurements justify it.
2. **IndexedDB wrapper — NEEDS APPROVAL.** Recommend `idb` behind a repository adapter (ADR-0006); reconsider Dexie if query/migration needs grow.
3. **Rubric approval threshold — NEEDS APPROVAL.** Recommend “Demonstrated” requires every mandatory approved criterion to have at least one recent independent artifact plus a repeat demonstration in a distinct task/context; reviewer feedback is supporting context, not mandatory for every learner. Keep status “Needs more evidence” when a criterion is unapproved or evidence is missing.
4. **Import file-size limit — NEEDS APPROVAL.** Recommend 10 MiB initially, with a clear error and no partial writes; raise only with browser/device testing.
5. **Import conflict UX — NEEDS APPROVAL.** Recommend preview then merge by stable ID, with per-record keep-existing/replace/skip choices and one atomic transaction; keep full replace as a separate destructive path.
6. **Backup reminder cadence — NEEDS APPROVAL.** Recommend a dismissible reminder after 30 days since last successful export, plus a first-export prompt after meaningful data has accumulated.
7. **Evidence URL policy — NEEDS APPROVAL.** Recommend allow only http/https external references; do not fetch, preview or embed them automatically. No file uploads or binary attachments in MVP.
8. **Reviewer identity — NEEDS APPROVAL.** Recommend free-text reviewer label and relationship only; no reviewer accounts, email collection or signatures.
9. **CSV scope — NEEDS APPROVAL.** Recommend task-centric CSV first (one row per task with track, status, due date and linked journal/evidence counts); JSON remains the only full-fidelity backup.
10. **PWA/offline — NEEDS APPROVAL.** Recommend defer until after Slice 7 and require explicit approval; do not add service worker/cache behavior during the initial workspace slices.
11. **Initial workspace JS budget — NEEDS APPROVAL.** Recommend 200 KiB gzip initial app JS as a measurement gate, then revise only with recorded low-end-device evidence.
12. **Soft delete retention — NEEDS APPROVAL.** Recommend retain soft-deleted records in JSON backups and provide explicit hard delete for all local data; no timed automatic purge in MVP.
