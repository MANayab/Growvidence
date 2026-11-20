# Growvidence project memory

**Last updated:** 2026-11-21 — PR #9 merged; Slice 1 implementation in progress  
**Current phase:** Slice 1 — app shell and persistence layer (open implementation PR)  
**Latest verified main:** b928bb7017b40ce98c0da343753a6ee710cbb649  
**Current branch:** feat/slice-1-app-shell  
**Current PR:** Slice 1 app shell and persistence (not merged)

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
- The current Slice 1 branch proposes the `/app/` shell, React island, hash navigation, theme preference, IndexedDB v2 adapter, settings/minimal tracks repositories and initial persistence tests; this is not yet merged or deployed.
- Track CRUD, task manager, journal, competency assessment, evidence manager, exports and dashboard are not implemented.
- No authentication, backend, cloud sync, analytics or payments.
- PWA/offline remains optional future scope and requires explicit confirmation.
- The current sitemap contains only the public homepage. Future app routes must be noindex and excluded from sitemap; robots.txt must not disallow them.

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
- No LICENSE file, package.json license field, license badge, SPDX header, or edit to ADR-0002. The maintainer decides later.
- Never claim tests, formatting, deployment or live behavior passed without evidence.
- Assistant does not run Prettier or tests in this workflow; maintainer runs local commands before final push.

## Previous handoff (superseded)

PR #8 established the Phase 2 design package and has been merged. Its open-decision review is superseded by the accepted decisions recorded below and in follow-up PR #9.

## Current handoff

PR #9 is merged at main `b928bb7017b40ce98c0da343753a6ee710cbb649`. Slice 1 is being implemented on `feat/slice-1-app-shell`. Do not merge or begin another PR; wait for maintainer review and **“next”** after this PR.

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
| 11 | Bundle/charts | Accepted: 200 KiB gzip initial workspace JS excluding Astro-shared assets; hand-built SVG or lazy-loaded charts; bundle-size check required. |
| 12 | Deletion | Accepted: soft-deleted records remain in JSON backups; per-record Permanently delete and Delete all local data; no timed purge. |

### Competency levels — NEEDS APPROVAL

- **Demonstrated (NEEDS APPROVAL):** every mandatory criterion has at least one independent artifact.
- **Consistent (NEEDS APPROVAL):** the demonstration is repeated in a different task or context.
- Proposed Consistent corroboration: external review weight 2, self review weight 1. Reviews cannot replace the required independent artifact or repeated demonstration.
