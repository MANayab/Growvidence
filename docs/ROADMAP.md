# Growvidence roadmap

**Last updated:** 2026-11-25  
**Current state:** Phase 1, Slice 1, Slice 2 and Slice 3 (journal and AI-use disclosure) are merged and available in the browser-local workspace. Competency tracking, evidence review, backup/export/import and dashboard remain planned.

## Completed

### Phase 0 — Product and repository foundation
- Product vision, principles, audience and initial competency areas.
- Static-first / local-first architecture direction, draft data model and ADRs.
- Roadmap, quality gates and repository contribution rules.
- Main-branch protection configured for this repository.

### Phase 1 — Astro static foundation and publishing
- **PR #3 merged:** Astro static output, strict TypeScript, shared layout, homepage and generated 404.
- SEO metadata helper/tests, canonical URLs, Organization and WebSite JSON-LD.
- robots.txt, homepage-only sitemap.xml, llms.txt and favicon.
- ESLint, Prettier, Astro diagnostics, Vitest, static build and generated HTML verification in CI.
- Reproducible dependency installation with committed package-lock.json.
- **PR #4 merged:** Astro-native GitHub Pages deployment workflow publishes dist/.
- **PR #5 merged:** Google Search Console verification meta tag in shared layout.
- **PR #7 merged:** exact `typescript-eslint` pin updated to 8.73.0 with matching committed lockfile; maintainer reported both local npm audits at zero vulnerabilities and latest-head CI passed.
- Live site: https://manayab.github.io/Growvidence/

## Current product status

The public landing page and publishing pipeline exist. Slice 1 provides the `/app/` shell and IndexedDB v2 adapter; Slice 2 track/task workflows and v3 task store are merged in PR #12. Slice 3 journal workflows and AI-use disclosure are merged, including the v4 journal store. Competency assessment, evidence manager, backup/import/export and dashboard remain future slices.

## Slice 2 — Tracks and tasks (merged in PR #12)

Merged in PR #12; exact-head CI was green (runs 45498961099 push and 45498975171 pull_request):
- Track create/rename/archive/soft-delete/permanent-delete; optional six suggested learning-area tracks from `mind.md`, never automatically seeded.
- Task create/edit, list and status board; five statuses, priority, local due date, estimate/actual minutes and tags.
- Native labeled “Move to…” controls; no drag-and-drop dependency.
- Daily/weekly/monthly due-date views; Monday week start and local date-only storage.
- IndexedDB v3 migration, Zod contracts, repositories, repository/date/component tests.
- No journal, competency, evidence, dashboard, backup/import/export or PWA functionality was added by this slice.
- CI: check, lint, Prettier, tests (37), static build, verify-build, bundle-size and audits passed on head `54e15c95fe72f830c9c2b6458bfa6d47edae3`.
- Bundle: 99.39 KiB gzip total (32.31 KiB island, 64.14 KiB Astro client, 2.94 KiB React runtime), +3.88 KiB versus Slice 1's 95.51 KiB; within 200 KiB budget.

MVP platform constraints:
- GitHub Pages static files only; no server, runtime SSR, API routes or database server.
- No account system or cloud sync in the MVP.
- Learner records remain in browser IndexedDB; Slice 1 introduced IndexedDB v2 through a typed `idb` adapter. Slice 2 added the version-3 tasks store and typed track/task repositories; Slice 3 added the v4 journal store.
- Public content is indexable. `/app/` HTML carries build-time noindex and remains out of the sitemap. Do not disallow it in robots.txt because crawlers must be able to read the noindex directive.
- PWA/offline is optional future scope and must be explicitly confirmed before implementation.
- No analytics or third-party scripts by default.
- Browser storage is not encrypted storage or a backup; explain browser cleanup and device-loss risks.

## Phase 2 — Workspace design (documentation only)

The Phase 2 design package proposes:
1. **ADR-0005 (Accepted):** Astro static site with React islands for the interactive workspace; physical `/app/` entry, hash navigation, noindex on every app page, sitemap exclusion and no `/app/` disallow in robots.txt.
2. **ADR-0006 (Accepted):** IndexedDB through a typed adapter using `idb`; schema migrations, quota/error handling, 30-day backup reminders and browser cleanup behavior.
3. **DATA_CONTRACTS.md:** Zod schema proposals for tracks, tasks, journal entries, AI-use disclosure, competencies, criteria, assessments, evidence, evidence links and reviews; shared IDs/timestamps/soft deletion; versioned JSON backup/import.
4. **mind.md:** measurable evidence criteria for all six competency areas remain **NEEDS APPROVAL**; both Demonstrated and Consistent level definitions are also **NEEDS APPROVAL**.
5. **UX_SPEC.md:** overview, daily/weekly/monthly views, tracks, task list/Kanban, journal, competencies/evidence, data settings, accessibility, responsive behavior and Mermaid flows.
6. **TESTING_PLAN.md:** unit, persistence, E2E, accessibility, privacy/security and performance test plan; seven implementation slices plus optional PWA; each slice includes acceptance criteria and a learning exercise.
7. Decisions log recording twelve accepted recommendations and two competency definitions that remain NEEDS APPROVAL.

The architecture, persistence approach and twelve product recommendations were accepted on 2026-11-21. The two competency-level definitions remain NEEDS APPROVAL. No app code, new dependency or IndexedDB schema is implemented by these documentation decisions. Implementation requires a separate focused PR and explicit “next” from the maintainer.

## Build slices — each a separate PR after Phase 2 design is approved and merged

| Slice | Scope | Key acceptance evidence |
|---|---|---|
| 1 | App shell, routing, layout, local persistence, migrations | Static `/app/` direct-load/refresh; noindex and sitemap exclusion; repository/migration/rollback tests |
| 2 | Learning tracks, task manager (list and Kanban), daily/weekly/monthly views | Task lifecycle, filtering, keyboard and responsive tests |
| 3 | Learning journal and AI-use disclosure | All five disclosure states and validation; no blank interpreted as unassisted |
| 4 | Competency and evidence engine | Approved criteria/evidence/review rules; competency status independent of task status |
| 5 | JSON export/import, CSV export, deletion and backup UX | Version validation, round-trip, conflict/rollback, malformed import, formula injection and deletion tests |
| 6 | Dashboard, progress and accessible summaries | Text/table alternatives; no chart, streak or task count implies mastery |
| 7 | Playwright E2E, accessibility audit, performance and security review | Critical journeys, keyboard/manual screen-reader review, measured performance and threat review |
| 8 | PWA/offline | Only after explicit maintainer confirmation; private evidence must never be cached |

Every slice is its own PR, based on latest main, with documentation updated and latest-head CI green before maintainer review. Stop after each PR.

## Later / conditional

### SEO, AEO and GEO launch readiness
- Add useful public guides and FAQ only when the content is original and genuinely useful.
- Keep public routes indexable with accurate metadata and structured data matching visible content.
- Validate sitemap, Search Console, structured data, Lighthouse and Core Web Vitals with recorded test conditions.
- No search ranking position is promised.

### Optional future sync
Accounts, cloud sync, classroom/team features or a backend require a separate ADR and approval covering authentication, authorization, privacy, retention, residency, cost, security, conflict resolution and legal implications. Preserve local-only operation and export.

### Commercial validation
Do not introduce payments or paid gates before user research, product validation and legal decisions. No pricing or demand claims are asserted.

## Risks and release gates

- Browser storage can be cleared or quota-limited; provide clear warnings and user-controlled backups.
- JSON import is an untrusted input boundary; validate size, schema, versions and references before applying changes.
- A task completion or streak must never be interpreted as proof of mastery.
- Dependency audit findings must be reviewed separately for production and development dependencies. CI audit steps are informational and may not fail the build.
- Do not call the product production-ready with unresolved critical/high security issues, data-loss risks or broken critical journeys unless the maintainer explicitly accepts a documented exception.
- Test latest PR head; do not infer success from an earlier commit.

Update this roadmap only through focused pull requests. The maintainer reviews and merges every PR.

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
| 12 | Deletion | Per-record soft-delete and permanent-delete are implemented for tracks, tasks and journal. Delete-all is not implemented; no timed purge. |
| 13 | License strategy | Accepted: MIT; earlier AGPL/open-core proposal considered and rejected for broad adoption and simple permissive licensing. |

### Competency levels — NEEDS APPROVAL

- **Demonstrated (NEEDS APPROVAL):** every mandatory criterion has at least one independent artifact.
- **Consistent (NEEDS APPROVAL):** the demonstration is repeated in a different task or context.
- Proposed Consistent corroboration: external review weight 2, self review weight 1. Reviews cannot replace the required independent artifact or repeated demonstration.

## Slice 4 — competency/evidence implementation (Draft PR)
Competency/evidence engine and v5 migration are being implemented for review. Criteria and assessment defaults remain **NEEDS APPROVAL**. No merge or release yet. Privacy policy proposal is separate; live page remains untouched.


## Slice 4 finishing work — 2026-11-27 (draft branch)

The competency integrity follow-up is in progress. A focused code update excludes future-dated evidence from qualification, requires chronological repeat evidence at least 14 days later with a distinct task/context, and prevents self-entered review labels (including "external") from independently elevating Consistent. Added domain tests cover the 13-day boundary and future-dated evidence/repeats, and updated the external-review test expectation. These changes are not yet locally tested or formatter-verified.

**Remaining Slice 4 work:** repository/domain cross-record validation (evidence ↔ journals/tasks and reviews ↔ evidence), deleted-records archive and restore/permanent deletion UI with evidence-review cascade, accessibility and focus behavior, repository CRUD/transaction tests, and complete documentation alignment. Do not mark Slice 4 complete until these items and exact-head CI are verified.


### Latest implementation update — 2026-11-27
The draft now contains active-record relationship checks for evidence and reviews, restore validation, deleted evidence/review archive controls, and regression tests for repository lifecycle and invalid references. These are implementation updates, not verified acceptance: local checks and CI on the final branch head are still required. Accessibility work remains partially done (status feedback is focusable/focused after updates); manual keyboard, screen-reader, reduced-motion and narrow viewport checks are still outstanding.


### Linked-record computation safeguard — 2026-11-27
The domain computation now also excludes evidence with missing or soft-deleted linked journal/task records from both qualifying evidence and progress counts. Regression test added. Awaiting local format/tests/build and exact-head CI.
