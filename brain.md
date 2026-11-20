# Growvidence project memory

**Last updated:** 2026-11-21 — PR #7 merged; Phase 2 workspace design documentation proposed in PR #8  
**Current phase:** Phase 2 design review — docs-only package; no learner app implementation  
**Latest main at Phase 2 branch start:** 400ad98cf2c746f34817e8f0c2fb94afe3d31fca  
**Current documentation branch:** docs/phase-2-workspace-design  
**Current PR:** https://github.com/MANayab/Growvidence/pull/8 (awaiting maintainer review and CI)

## Repository and product

- Repository: MANayab/Growvidence; audience: IT beginners, students and self-taught learners.
- Working name only; trademark, domain, company and app-store availability are not cleared.
- Product promise: “Don't just learn. Prove your progress.”
- Differentiator: evidence-based competency tracking, not task completion or streaks.
- Product flow: learn → practice → create → independently demonstrate → review.
- Six competency areas: independent coding, debugging, architecture, testing, commercial validation and technical fundamentals. Proposed measurable criteria are in mind.md and all require maintainer approval.

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
- The interactive learner application is not built.
- No app dashboard, task manager, journal, competency assessment, evidence manager or IndexedDB data layer exists.
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

## Phase 2 design package in PR #8

Docs-only changes on `docs/phase-2-workspace-design`, based on main SHA `400ad98cf2c746f34817e8f0c2fb94afe3d31fca`:
- ADR-0005 proposes Astro + React islands, a physical `/app/` entry with hash navigation, build-time noindex and sitemap exclusion; Preact and separate SPA are compared.
- ADR-0006 proposes IndexedDB behind a typed adapter using `idb`; Dexie/raw IndexedDB are compared; migration, quota, backup and browser cleanup behaviors are specified.
- DATA_CONTRACTS.md proposes Zod schemas, stable UUIDs, timestamps, soft deletion, cross-record validation and versioned JSON export/import.
- mind.md proposes measurable criteria for six competencies; all criteria and mastery threshold are **NEEDS APPROVAL**.
- UX_SPEC.md defines dashboard, daily/weekly/monthly views, tracks, task list/Kanban, journal, competency/evidence, settings, accessibility and Mermaid flows.
- TESTING_PLAN.md defines unit, persistence, E2E, accessibility, security and performance plans plus seven build slices and optional PWA; every slice has acceptance criteria and a learning exercise.
- No source code, dependencies, license policy, workflows, site config or deployed behavior changed.

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

## Current handoff

PR #8 is the Phase 2 workspace design documentation package. Wait for maintainer review, responses to Open decisions and merge. Do not begin Slice 1 or any other PR until the maintainer says **“next”** after merging.
