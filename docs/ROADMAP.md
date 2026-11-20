# Growvidence roadmap

**Last updated:** 2026-11-20  
**Current state:** Phase 1 static foundation is complete, merged and deployed. The public landing page is live. The interactive learner application has not been implemented. Future milestones are plans and require maintainer review.

## Completed

### Phase 0 — Product and repository foundation
- Product vision, principles, audience and initial competency areas.
- Static-first / local-first architecture direction and draft data model.
- ADRs, roadmap, quality gates and repository contribution rules.
- Main-branch protection configured for this repository.

### Phase 1 — Astro static foundation and publishing
- **PR #3 merged:** Astro static output, strict TypeScript, shared layout, homepage and generated 404.
- SEO metadata helper/tests, canonical URLs, Organization and WebSite JSON-LD.
- robots.txt, homepage-only sitemap.xml, llms.txt and favicon.
- ESLint, Prettier, Astro diagnostics, Vitest, static build and generated HTML verification in CI.
- Reproducible dependency installation with committed package-lock.json.
- **PR #4 merged:** Astro-native GitHub Pages deployment workflow publishes dist/.
- **PR #5 merged:** Google Search Console verification meta tag in shared layout.
- Live site: https://manayab.github.io/Growvidence/

## Current product status

The landing page and publishing pipeline exist. The learner-facing product does not yet exist. In particular, there is no dashboard, task manager, journal, competency assessment, evidence manager, IndexedDB persistence, JSON backup/restore or CSV export.

MVP platform constraints:
- GitHub Pages static files only; no server, runtime SSR, API routes or database server.
- No account system or cloud sync in the MVP.
- Learner records are intended to remain in browser storage; IndexedDB is planned, not implemented.
- Public content is indexable. Future /app/ routes must carry noindex and stay out of the sitemap.
- PWA/offline is optional future scope and must be explicitly confirmed before implementation.
- No analytics or third-party scripts by default.

## Next — Phase 2 design (documentation only)

After the README/state-sync PR is merged, the next PR is a docs-only design package. It should resolve or present for maintainer approval:

1. Interactive app architecture inside Astro: Astro islands with React or Preact versus a separate SPA, bundle and SEO trade-offs, /app/ noindex routing and sitemap exclusion.
2. IndexedDB library comparison (Dexie, idb and raw IndexedDB), versioning/migrations, quota/error handling and backup reminders.
3. Typed data contracts for tracks, tasks, journal entries, AI-use disclosure, competencies, criteria, evidence and reviews.
4. Versioned JSON export/import format and import validation/merge policy.
5. Six competency rubrics with measurable evidence rules; any unapproved criteria remain clearly marked.
6. UX specifications for dashboard, daily/weekly/monthly views, task board, journal and competency pages.
7. Accessibility, empty states, keyboard flows, mobile layout and testing strategy.
8. Small build-slice PR plan and explicit open decisions for the maintainer.

No learner application implementation should begin until this design PR is reviewed and merged.

## Build slices — each a separate PR after Phase 2 design is merged

| Slice | Scope | Key acceptance evidence |
|---|---|---|
| 1 | App shell, routing, layout, local persistence, migrations | Strict types, storage/migration unit tests, /app/ noindex and sitemap exclusion |
| 2 | Learning tracks, task manager (list and Kanban), daily/weekly/monthly views | Task lifecycle, filtering, keyboard and responsive tests |
| 3 | Learning journal and AI-use disclosure | Assisted/unassisted/partially assisted records and validation |
| 4 | Competency and evidence engine | Criteria/evidence/review rules; competency status independent of task status |
| 5 | JSON export/import, CSV export, deletion and backup UX | Version validation, round-trip, malformed import, deletion tests |
| 6 | Dashboard, progress, streaks and accessible charts | Text/table alternatives; no chart or streak can imply mastery |
| 7 | Playwright E2E, accessibility audit, performance and security review | Critical journey coverage, WCAG-oriented manual and automated review, measured performance and threat review |
| 8 | PWA/offline | Only if the maintainer explicitly confirms this remains in scope |

Every slice is its own PR, based on latest main, with documentation updated and latest-head CI green before maintainer review.

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
