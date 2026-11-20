# Growvidence project memory

**Last updated:** 2026-11-20 — Phase 1 merged and published; README and project-state synchronization in PR A  
**Current phase:** Phase 2 preparation — README/docs synchronization first; learner workspace design follows in a separate docs-only PR  
**Latest main:** 70224f6611dc955fa21b8822e5ef43a824a9a22f  
**Current documentation branch:** docs/readme-and-sync  
**Current PR:** To be created after documentation changes are committed

## Repository and product

- Repository: MANayab/Growvidence; audience: IT beginners, students and self-taught learners.
- Working name only; trademark, domain, company and app-store availability are not cleared.
- Product promise: “Don't just learn. Prove your progress.”
- Differentiator: evidence-based competency tracking, not task completion or streaks.
- Product flow: learn → practice → create → independently demonstrate → review.
- Six initial competency areas in mind.md: independent coding, debugging, architecture, testing, commercial validation and technical fundamentals. Measurable criteria require maintainer review.

## Delivery status

### Phase 0 — complete and merged
- Product principles, architecture direction, draft data model, ADRs, roadmap, quality gates and repository contribution rules.

### Phase 1 — complete and merged
- PR #3 merged; Astro static output, strict TypeScript, shared layout, public homepage and generated 404.
- SEO metadata helper and tests, canonical metadata, Organization and WebSite JSON-LD, robots.txt, homepage sitemap, llms.txt and favicon.
- GitHub Actions CI, lint/format/type diagnostics/tests/build and generated HTML verification.
- Committed package-lock.json and reproducible npm ci.
- PR #4 merged; Astro static build deployed to GitHub Pages through .github/workflows/deploy.yml.
- PR #5 merged; Google Search Console verification meta tag added to shared page head.
- Live site: https://manayab.github.io/Growvidence/

### Current product reality
- The public landing page is live.
- The interactive learner application is not built.
- No app dashboard, task manager, journal, competency assessment, evidence manager or IndexedDB data layer exists.
- No authentication, backend, cloud sync, analytics or payments.
- PWA/offline remains optional future scope and requires confirmation.
- The current sitemap contains only the public homepage. App routes, when implemented, must be noindex and excluded from the sitemap.

## Technical baseline

- Astro static output; site origin https://manayab.github.io; base /Growvidence/; trailingSlash always.
- Node .nvmrc: 26.7.0.
- package.json engines: Node >=26.7.0 and npm >=11.19.0.
- Direct development dependencies are pinned in package.json; package-lock.json is committed.
- Existing CI checks: npm ci, npm run check, npm run lint, npm run format:check, npm test, npm run build, node scripts/verify-build.mjs.
- Deployment workflow builds dist/ and publishes with GitHub Pages Actions.
- No runtime SSR, API routes or server database in the MVP.

## SEO / structured data

- BaseLayout builds the project URL from Astro base path /Growvidence/.
- Organization and WebSite JSON-LD are expected to use https://manayab.github.io/Growvidence/, not the origin alone.
- src/lib/seo.test.ts checks both structured-data URLs.
- scripts/verify-build.mjs parses built JSON-LD and asserts both URLs equal the project URL.
- Google Search Console verification meta tag is present in the shared head.
- The sitemap is homepage-only until additional indexable public routes are implemented.

## Dependency audit status

The repository CI has informational npm audit steps: npm audit --omit=dev and npm audit. They use continue-on-error, so workflow success does not mean zero vulnerabilities. I cannot execute npm audit in this GitHub-only change session. Current severity counts are therefore **not verified**; maintainer should run both audit commands locally on the latest main checkout and share the output before dependency remediation decisions. Do not use npm audit fix --force or major upgrades without approval.

## Product invariants

- Task status is distinct from competency status.
- Checkboxes and streaks never establish mastery.
- Competency claims require measurable criteria and reviewable evidence.
- Learning records must disclose AI use, including unknown/not recorded where applicable.
- Browser-local data must have explicit export/import/deletion behavior; browser storage is not cloud backup.
- Never put learner evidence in URLs, localStorage/sessionStorage or default public caches.
- No analytics or third-party scripts by default.

## Workflow and safety

- Work only in MANayab/Growvidence.
- Start each phase from the latest main.
- Never push directly to main, merge PRs, force-push or rewrite shared history.
- One PR at a time; maintainer reviews and merges.
- Stop after each PR and wait for “next”.
- No secrets or real credentials.
- No LICENSE file, package.json license field, license badge, SPDX header, or edit to ADR-0002. The maintainer decides later.
- Never claim tests, formatting, deployment or live behavior passed without evidence.
- The assistant cannot run Prettier or tests in this workflow; maintainer runs local commands before final push.

## Current handoff

PR A is a documentation-only README and state synchronization change. It must not implement learner application code or change dependencies. After PR A is reviewed and merged, wait for the maintainer to say “next” before starting PR B (Phase 2 design). PR B is docs-only and must define architecture, IndexedDB decision, data contracts, competency criteria requiring approval, UX, testing and build-slice breakdown before any feature slice starts.
