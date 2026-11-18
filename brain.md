# Growvidence project memory

**Last updated:** 2026-11-18 — Phase 1 Astro static foundation committed for review  
**Current phase:** Phase 1 — static site and quality-tooling foundation  
**Current branch:** feat/phase-1-astro-foundation  
**Base main:** 2efa1e5d323f6efbde85d43a7bd07410a97450c5  
**Next action:** Maintainer generates and commits package-lock.json locally; review PR and CI evidence before merge.

## Repository and product
- MANayab/Growvidence; audience: IT beginners, students, self-taught learners.
- Working name not legally cleared.
- Evidence-based competency tracking is the differentiator.

## Phase 1 implementation
- Astro static output, strict TypeScript, site origin https://manayab.github.io and base /Growvidence/.
- Public homepage and static 404 page.
- Shared layout and typed SEO helper with per-page title, description, canonical, robots, keywords, OG/Twitter and Organization/WebSite JSON-LD.
- Public robots.txt, sitemap.xml, llms.txt and SVG favicon.
- Responsive semantic HTML, skip link, dark-mode color scheme, reduced-motion handling; no runtime app JavaScript.
- Vitest tests cover canonical/robots metadata and structured-data types.
- ESLint, Prettier, Astro check and GitHub Actions CI are configured.
- CI explicitly stops with a helpful error until package-lock.json is committed.
- No Pages deployment workflow in this phase.

## Product and platform constraints
- Production MVP on GitHub Pages, static files only.
- No server, database, runtime SSR, API routes, accounts or cloud sync in MVP.
- IndexedDB local data; versioned JSON backup/restore and selected CSV export are later work.
- PWA/offline planned; browser storage is not cloud backup.
- Public marketing/docs pages indexable; private app/workspace routes must be noindex.
- Optional backend is separate future scope.
- No LICENSE file or license field is added; license decision remains separate.

## Product invariants
Task status differs from competency status. Every learning record captures AI-use disclosure. Checkboxes/streaks never establish mastery. User data remains local in MVP with explicit export/import/deletion. No analytics or third-party scripts by default.

## Workflow
Only this repository. Never push to main; use branch + PR. User merges. No secrets. No LICENSE until license ADR approved. Small changes; stop after phase until user says next. Mark unverified claims; never claim checks/deployments without evidence.

## Commands
- npm install — resolve pinned dependencies and generate package-lock.json (maintainer must commit it).
- npm run dev — local Astro development server.
- npm run check — Astro/TypeScript diagnostics.
- npm run lint — ESLint.
- npm run format:check — Prettier check for source/config files.
- npm test — Vitest unit tests.
- npm run build — static build.
- npm run preview — preview built output.

## Limitations and open work
- No package-lock.json yet; clean install and all project commands have not been run in the authoring environment.
- GitHub Actions will fail intentionally until the maintainer commits the lockfile.
- No deployment workflow, IndexedDB, application workspace, PWA/service worker, import/export, authentication, sync, analytics or payments.
- The sitemap currently contains only the public homepage; update it when indexable public routes are added.
- No social preview image is included; OG/Twitter text metadata is present.
- Accessibility has semantic/keyboard foundations but still needs automated and manual keyboard/screen-reader review.
- SEO schema validation, Lighthouse, Core Web Vitals and Search Console checks remain launch tasks.

## Handoff
Review Phase 1 PR. Generate and commit package-lock.json on the same branch, then inspect the CI results. Do not begin Phase 2 until the maintainer says next.
