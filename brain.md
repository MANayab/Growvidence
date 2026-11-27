# Growvidence project memory

**Last updated:** 2026-11-25 — Slice 3 merged; license/privacy PR in progress  
**Current phase:** Legal, license and privacy documentation  
**Latest verified main:** 8353d82752f99c729de87a8eb700196235c6741a
**Current branch:** legal/mit-license-privacy
**Current PR:** legal/mit-license-privacy — license, privacy page and public-site truth updates (draft)

## Repository and product

- Repository: MANayab/Growvidence; audience: IT beginners, students and self-taught learners.
- Working name only; trademark, domain, company and app-store availability are not cleared.
- Product promise: “Don't just learn. Prove your progress.”
- Differentiator: evidence-based competency tracking, not task completion or streaks.
- Product flow: learn → practice → create → independently demonstrate → review.
- Six competency areas: independent coding, debugging, architecture, testing, commercial validation and technical fundamentals. Criteria and both competency-level definitions remain subject to explicit rubric approval.

## Delivery status

### Phase 0 — complete and merged
- Product principles, architecture direction, draft data model, ADRs, roadmap, quality gates and repository contribution rules.

### Phase 1 — complete and merged
- PR #3 merged; Astro static output, strict TypeScript, shared layout, public homepage and generated 404.
- SEO metadata helper/tests, canonical metadata, Organization and WebSite JSON-LD, robots.txt, homepage sitemap, llms.txt and favicon.
- GitHub Actions CI, lint/format/type diagnostics/tests/build and generated HTML verification.
- Committed package-lock.json and reproducible npm ci.
- PR #4 merged; Astro static build deployed to GitHub Pages through .github/workflows/deploy.yml.
- PR #5 merged; Google Search Console verification meta tag added to shared head.
- PR #7 merged; `typescript-eslint` updated to 8.73.0 with maintainer-generated lockfile. The maintainer reported `npm audit --omit=dev` and `npm audit` both found zero vulnerabilities; CI passed on the latest PR head.
- Live site: https://manayab.github.io/Growvidence/

### Current product reality
- The public landing page is live.
- Slice 1 is merged in PR #10 at commit `c93c5e89b67194fcf6c08bca00e0d01c73347660`; merge commit on main: `8e61768fc0db709c7b6db047d0f0dc8035200dee`. It adds the `/app/` shell, React island, hash navigation, theme preference, IndexedDB v2 adapter, settings/minimal tracks repositories and initial persistence tests. Deployment of this merged app shell has not been independently verified in this update.
- The measured JavaScript loaded by `/app/` is **95.51 KiB gzip of the 200 KiB budget**, including the workspace island, Astro renderer and React runtime. CI bundle-size check passed on the PR #10 head.
- Track/task management from Slice 2 is merged in PR #12. Slice 3 journal and AI-use disclosure are merged and available in the workspace. Exact-head CI run 45515783505 is green; maintainer reports 46 tests, build/verify-build passed and bundle 102.31 KiB gzip. Competency assessment, evidence manager, backup/import/export and dashboard remain unimplemented.
- No authentication, backend, cloud sync, analytics or payments.
- PWA/offline remains optional future scope and requires explicit confirmation.
- Sitemap includes the homepage and indexable public pages; `/app/` remains noindex and excluded from sitemap. Do not disallow it in robots.txt.

## Slice 3 implementation (merged)

- Journal entries use canonical local date-only `date` (replaces `attemptedAt`), `learned`, `blocked`, `next`, confidence, minutes, optional track/task context, and AI-use disclosure.
- Disclosure modes: assisted, unassisted, partially_assisted, unknown and not_recorded. Unknown/not_recorded remain separate from unassisted in filters and summaries.
- IndexedDB schema v4 journal store and migration; migration tests cover success and abort safety.
- Latest exact-head CI run 45515783505 passed all jobs and steps. Maintainer reports local checks and 46 tests passed with no unhandled errors; bundle-size 102.31 KiB gzip.
- No backup, export, import or delete-all workflow is implemented.


## Slice 2 implementation (merged in PR #12)

- Branch: `feat/slice-2-tracks-tasks`; base/main at creation: `ef58a84c86710cb79ca889d3c442e27a89e70bea`.
- Database schema version 3 adds the tasks store and indexes `by_trackId`, `by_status`, `by_dueDate` and `by_updatedAt`; migration path v2→v3 is covered, as is a failed upgrade preserving the prior database.
- Track and Task Zod schemas and typed IndexedDB repositories. Track soft-delete cascades task soft-delete; permanent track deletion permanently removes dependent tasks.
- Task statuses: backlog, today, in_progress, review, done. Task fields include track, title, description, priority, local due date, estimated/actual minutes and tags.
- Calendar due dates are local date-only `YYYY-MM-DD`; metadata timestamps remain UTC ISO strings. Monday is the week start. Date math uses local noon and clamps month ends; timezone changes do not rewrite due dates.
- Slice 2 source/tests/docs are merged in PR #12. The maintainer pushed Prettier formatting. CI runs 45498401417 (push) and 45498411745 (pull_request) passed on exact head `54e15c95fe72f830c9c2b6458bfa6d47eda844e3`. Bundle-size check reports 99.39 KiB gzip total across three files (32.31 KiB WorkspaceIsland, 64.14 KiB Astro client, 2.94 KiB React runtime), +3.88 KiB versus Slice 1 baseline 95.51 KiB. CI passed all required checks; npm audits reported zero vulnerabilities. The All dates view includes undated tasks; daily/weekly/monthly views filter by local due date.

## Technical baseline

- Astro static output; site origin https://manayab.github.io; base /Growvidence/; trailingSlash always.
- Node .nvmrc: 26.7.0.
- package.json engines: Node >=26.7.0 and npm >=11.19.0.
- Direct development dependencies are pinned in package.json; package-lock.json is committed.
- Existing CI checks: npm ci, npm run check, npm run lint, npm run format:check, npm test, npm run build, node scripts/verify-build.mjs.
- Deployment workflow builds dist/ and publishes with GitHub Pages Actions.
- No runtime SSR, API routes or server database in the MVP.

## Phase 2 design and approved decisions

PR #8 merged. This follow-up branch starts from main SHA `11dee6e216da49bdee3a6a27a3d885707d90d4dd`.
- ADR-0005 proposes Astro + React islands, a physical `/app/` entry with hash navigation, build-time noindex and sitemap exclusion; Preact and separate SPA are compared.
- ADR-0006 proposes IndexedDB behind a typed adapter using `idb`; Dexie/raw IndexedDB are compared; migration, quota, backup and browser cleanup behaviors are specified.
- DATA_CONTRACTS.md proposes Zod schemas, stable UUIDs, timestamps, soft deletion, cross-record validation and versioned JSON export/import.
- mind.md proposes measurable criteria for six competencies; all criteria and mastery threshold are **NEEDS APPROVAL**.
- UX_SPEC.md defines dashboard, daily/weekly/monthly views, tracks, task list/Kanban, journal, competency/evidence, settings, accessibility and Mermaid flows.
- TESTING_PLAN.md defines unit, persistence, E2E, accessibility, security and performance plans plus seven build slices and optional PWA; every slice has acceptance criteria and a learning exercise.
- This follow-up is docs-only; no source code, dependencies, license policy, workflows, site config or deployed behavior changes.

## SEO / structured data

- BaseLayout builds the project URL from Astro base path /Growvidence/.
- Organization and WebSite JSON-LD use https://manayab.github.io/Growvidence/.
- Google Search Console verification meta tag is present in shared head.
- Sitemap is homepage-only until additional indexable public routes are implemented.

## Product invariants

- Task status is distinct from competency status.
- Checkboxes and streaks never establish mastery.
- Competency claims require approved measurable criteria and reviewable evidence.
- Learning records must disclose AI use, including unknown/not recorded where applicable.
- Browser-local data must have explicit export/import/deletion behavior; browser storage is not encrypted storage or cloud backup.
- Never put learner evidence in URLs, localStorage/sessionStorage, Cache Storage, telemetry or logs.
- No analytics or third-party scripts by default.

## Workflow and safety

- Work only in MANayab/Growvidence.
- Start each phase from latest main.
- Never push directly to main, merge PRs, force-push or rewrite shared history.
- One PR at a time; maintainer reviews and merges.
- Stop after each PR and wait for “next”.
- No secrets or real credentials.
- MIT License adopted in this legal/privacy PR; keep the exact root license and package metadata synchronized.
- Never claim tests, formatting, deployment or live behavior passed without evidence.
- Assistant does not run Prettier or tests in this workflow; maintainer runs local commands before final push.

## Previous handoff (superseded)

PR #8 established the Phase 2 design package and has been merged. Its open-decision review is superseded by the accepted decisions recorded below and in follow-up PR #9.

## Current handoff

PR #13 (Slice 3) and PR #14 (README SVG visuals) are merged. Latest verified `main` is `8353d82752f99c729de87a8eb700196235c6741a`. Current work is the legal/privacy Draft PR on `legal/mit-license-privacy`; do not merge or push to `main`.

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
| 11 | Bundle/charts | Accepted: 200 KiB gzip for all JavaScript loaded by `/app/`, including Astro renderer, React runtime, island and shared/imported chunks; measured Slice 1 total is 95.51 KiB gzip. Hand-built SVG or lazy-loaded charts; bundle-size check required. |
| 12 | Deletion | Per-record soft-delete and permanent-delete are implemented for tracks, tasks and journal. Delete-all is not implemented; no timed purge. |
| 13 | License strategy | Accepted: MIT; earlier AGPL/open-core proposal considered and rejected for broad adoption and simple permissive licensing. |

### Competency levels — NEEDS APPROVAL

- **Demonstrated (NEEDS APPROVAL):** every mandatory criterion has at least one independent artifact.
- **Consistent (NEEDS APPROVAL):** the demonstration is repeated in a different task or context.
- Proposed Consistent corroboration: external review weight 2, self review weight 1. Reviews cannot replace the required independent artifact or repeated demonstration.


## License decision — MIT
- Adopt MIT for the repository core, with copyright notice and license text preserved.
- This supports broad adoption of a local-first static application; paid services may be separate code later.
- The earlier AGPL/open-core recommendation was considered and rejected in favor of a simple permissive license. MIT does not prevent commercial reuse or competing hosted forks.
- Contributions use inbound = outbound MIT licensing. No DCO or CLA requirement is currently documented.
- Privacy page work must state only code-audited facts; local browser data is IndexedDB. No accounts, analytics, app-set cookies, uploads or third-party runtime requests were found in the source files reviewed; this was not a full built-output/network audit.

## Slice 4 status (draft branch)
Competency status is computed from evidence/reviews, not stored and never task-derived. v5 adds evidence/reviews IndexedDB stores. Criteria/defaults remain NEEDS APPROVAL. Privacy page untouched; see docs/PRIVACY_UPDATE_PROPOSAL.md.


## Slice 4 integrity follow-up — 2026-11-27
PR #16 remains a Draft. New commits on `feat/slice-4-competencies-evidence`:
- `54bdf069`: exclude future evidence dates from qualification; enforce chronological 14-day repeat; reviews are self-entered and no longer elevate competency status.
- `708f0f7`: explicitly mark the review argument unused in computation (follow-up clean-up).
- `abf951f`: domain regression tests for 13-day boundary, future evidence, and external-labelled self-entered reviews.
These commits were written through GitHub file updates; the code has not yet been run through local TypeScript, lint, Prettier, test, build, or CI. Repository relationship checks, deleted-record recovery UI, accessibility, persistence tests and docs synchronization remain to do. Do not claim merge-ready.


### Follow-up update — 2026-11-27 (after integrity/recovery implementation)
Additional draft commits add repository checks for active evidence references, criterion membership, and reviews bound to active evidence; evidence restore checks linked records; and the competency UI has an archive for soft-deleted evidence/reviews with restore and permanent-delete controls. Evidence permanent deletion cascades review deletion. The component now focuses its status feedback after updates and the review restore control is disabled when its parent evidence is deleted. These updates have not been locally tested or CI-verified. The GitHub file-update API created a no-op commit when a test edit failed to match; that commit has no content diff.
