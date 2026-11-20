# Growvidence project memory

**Last updated:** 2026-11-20 — Phase 1 foundation implementation and latest-head CI verified; PR review remains open  
**Current phase:** Phase 1 — static site and quality-tooling foundation  
**Current branch:** feat/phase-1-astro-foundation  
**PR:** https://github.com/MANayab/Growvidence/pull/3  
**PR head at last verification:** 10af1bf8893ce88b0688cc287101a6196c2ff358  
**Base main at last verification:** 2efa1e5d323f6efbde85d43a7bd07410a97450c5  
**Next action:** Maintainer review of PR #3 and dependency-audit findings; no merge or release is performed by automation.

## Repository and product

- MANayab/Growvidence; audience: IT beginners, students, self-taught learners.
- Working name not legally cleared.
- Evidence-based competency tracking is the differentiator.
- Product promise: “Don't just learn. Prove your progress.”

## Phase 1 implementation on PR #3

- Astro static output, strict TypeScript, site origin https://manayab.github.io and base /Growvidence/.
- Public homepage and generated static 404 page.
- Shared layout and typed SEO helper with per-page title, description, canonical, robots, keywords, Open Graph/Twitter metadata and Organization/WebSite JSON-LD.
- Public robots.txt, homepage-only sitemap.xml, llms.txt and SVG favicon.
- Responsive semantic HTML, skip link, system-preference light/dark styling and reduced-motion handling; no interactive learner application code.
- Vitest tests cover canonical/robots metadata and structured-data types.
- ESLint, Prettier, Astro diagnostics, Vitest, static build and built-HTML verification are configured in GitHub Actions.
- Maintainer-generated package-lock.json is committed. CI uses npm ci; the earlier missing-lockfile blocker is resolved.
- No GitHub Pages deployment workflow in this phase.

## Latest verified CI and dependency status

- Latest verified PR-head commit: 10af1bf8893ce88b0688cc287101a6196c2ff358.
- Pull-request CI and push CI passed on that commit.
- Astro diagnostics reported 0 errors, warnings or hints; lint, formatting, unit tests (3/3), build and built SEO verification passed.
- The production dependency audit reported 0 vulnerabilities.
- The full dependency audit reported 20 development-tree findings (14 high, 6 moderate) in the latest inspected CI log. The audit is informational/non-blocking; this is not a clean full dependency audit. Re-run it before making a current security decision because advisory data changes.
- Do not use npm audit fix --force or accept a breaking downgrade without review. No dependency remediation is claimed in this phase.

## Product and platform constraints

- Production MVP on GitHub Pages, static files only.
- No server, database, runtime SSR, API routes, accounts or cloud sync in MVP.
- IndexedDB local data; versioned JSON backup/restore and selected CSV export are later work.
- PWA/offline planned; browser storage is not cloud backup.
- Public marketing/docs pages indexable; private app/workspace routes must be noindex.
- Optional backend is separate future scope.
- No LICENSE file or license field is added; license decision remains separate.

## Product invariants

Task status differs from competency status. Every learning record captures AI-use disclosure, including unknown/not recorded where applicable. Checkboxes/streaks never establish mastery. Competency claims require criteria and evidence. User data remains local in MVP with explicit export/import/deletion. No analytics or third-party scripts by default.

## Workflow

Only this repository. Never push to main; use branch + PR. User merges. No force-push or history rewrite. No secrets. No LICENSE until the license decision is explicitly approved. Small changes; stop after each phase until the maintainer says next. Mark unverified claims; never claim checks or deployments without evidence.

## Commands

- npm ci — clean reproducible installation from package-lock.json.
- npm install — only for intentional dependency changes; review and commit lockfile changes.
- npm run dev — local Astro development server.
- npm run check — Astro/TypeScript diagnostics.
- npm run lint — ESLint.
- npm run format — Prettier formatting.
- npm run format:check — Prettier check for source/config files.
- npm test — Vitest.
- npm run build — static build.
- node scripts/verify-build.mjs — built HTML/SEO smoke check.
- npm run preview — preview built output.

## Limitations and open work

- PR #3 is not merged; main remains unchanged.
- No Pages deployment workflow or verified live deployment.
- No learner workspace, domain services, IndexedDB, PWA/service worker, import/export, authentication, sync, analytics or payments.
- The sitemap currently contains only the public homepage; update it when indexable public routes are added.
- No social preview image is included; OG/Twitter text metadata is present.
- Accessibility foundations exist, but automated and manual keyboard/screen-reader review remain.
- SEO schema validation, Lighthouse, Core Web Vitals and Search Console checks remain launch tasks.
- Full development dependency audit findings remain unresolved or unaccepted; inspect patched compatible versions before production release.

## Handoff

Review PR #3, including the informational full dependency audit findings. Do not merge or tag on the maintainer's behalf. After the foundation is merged and the maintainer says “next”, finalize the learner-domain model and application architecture before implementing workspace features.
