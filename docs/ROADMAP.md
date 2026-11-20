# Growvidence roadmap

**Last updated:** 2026-11-21  
**Current state:** Phase 1 static foundation is complete, merged and deployed. PR #7 dependency remediation is merged. The public landing page is live. The interactive learner application has not been implemented. Phase 2 design is being proposed in a docs-only PR; architecture and rubric recommendations require maintainer approval.

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

The landing page and publishing pipeline exist. The learner-facing product does not yet exist. There is no dashboard, task manager, journal, competency assessment, evidence manager, IndexedDB persistence, JSON backup/restore or CSV export.

MVP platform constraints:
- GitHub Pages static files only; no server, runtime SSR, API routes or database server.
- No account system or cloud sync in the MVP.
- Learner records are intended to remain in browser storage; IndexedDB is proposed, not implemented.
- Public content is indexable. Future `/app/` HTML must carry build-time noindex and remain out of the sitemap. Do not disallow it in robots.txt because crawlers must be able to read the noindex directive.
- PWA/offline is optional future scope and must be explicitly confirmed before implementation.
- No analytics or third-party scripts by default.
- Browser storage is not encrypted storage or a backup; explain browser cleanup and device-loss risks.

## Phase 2 — Workspace design (documentation only)

The Phase 2 design package proposes:
1. **ADR-0005:** Astro static site with React islands for the interactive workspace; compare Preact and a separate SPA; physical `/app/` entry, hash navigation, noindex and sitemap exclusion.
2. **ADR-0006:** IndexedDB through a typed adapter using `idb`; compare Dexie and raw IndexedDB; define schema migrations, quota/error handling, backup reminders and browser cleanup behavior.
3. **DATA_CONTRACTS.md:** Zod schema proposals for tracks, tasks, journal entries, AI-use disclosure, competencies, criteria, assessments, evidence, evidence links and reviews; shared IDs/timestamps/soft deletion; versioned JSON backup/import.
4. **mind.md:** measurable evidence criteria proposed for all six competency areas. Every proposed criterion and the “Demonstrated” threshold is marked **NEEDS APPROVAL**.
5. **UX_SPEC.md:** overview, daily/weekly/monthly views, tracks, task list/Kanban, journal, competencies/evidence, data settings, accessibility, responsive behavior and Mermaid flows.
6. **TESTING_PLAN.md:** unit, persistence, E2E, accessibility, privacy/security and performance test plan; seven implementation slices plus optional PWA; each slice includes acceptance criteria and a learning exercise.
7. Consolidated open decisions with recommendations for maintainer response.

These ADRs and recommendations are proposals, not approved architecture. No app code, new dependency, IndexedDB schema or rubric behavior is implemented by the design package. Do not start a feature slice until the maintainer reviews and merges the design PR and answers or explicitly defers the open decisions.

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
