# Growvidence roadmap

**Status:** Phase 1 static Astro foundation is implemented on PR #3 and its latest verified CI is green. PR #3 remains open for maintainer review; it has not been merged. Remaining milestones are planning goals, not commitments.

## Milestone 1 — Static MVP on GitHub Pages

**Phase 1 foundation delivered on PR #3:** Astro static output, strict TypeScript configuration, shared page layout, public homepage and generated 404 page, SEO metadata helper/tests, robots.txt, homepage-only sitemap.xml, llms.txt, SVG favicon, ESLint/Prettier, Astro diagnostics, Vitest, static build verification, GitHub Actions CI and a maintainer-generated committed package-lock.json. The latest inspected PR-head CI passed clean installation, diagnostics, lint, format, tests, build and built-HTML verification.

**Still required to complete the MVP:** Maintainer review and merge of PR #3; review/remediation or explicit risk acceptance of development dependency audit findings; remaining public routes; client-side learner workspace; IndexedDB tasks/log/evidence/competencies; JSON backup/restore; selected CSV export; accessibility/security review; GitHub Pages deployment workflow and post-deploy checks.

**Scope:** No backend, login, database server, runtime SSR, API routes or cloud sync in MVP. Browser IndexedDB is planned local persistence, not cloud backup.

**Exit measures:** Public routes load directly under /Growvidence/; the task-to-evidence workflow works without an account; data survives reload in supported browsers; JSON round-trip preserves records; users can export and clear data; offline behavior is documented and tested if PWA is included; no unresolved critical/high data-loss or security defects unless explicitly accepted by the maintainer; CI and post-deploy checks pass on the deployed commit.

## Milestone 2 — SEO/AEO/GEO launch readiness

Unique title/description, canonical, OG/Twitter metadata, robots.txt, sitemap.xml, relevant JSON-LD, llms.txt, semantic HTML, answer-first public guides and FAQ. App routes noindex.

**Targets:** Lighthouse 95+ target on agreed representative mobile/desktop profiles; Core Web Vitals pass at 75th percentile when field data is sufficient; no structured-data validation errors for supported types; Search Console verified and sitemap submitted; no accidental noindex on public pages. No #1 ranking promise.

## Milestone 3 — Content and evidence expansion

Publish original beginner guides, FAQ and HowTo content only where genuinely useful, and citable methodology pages for competencies and AI-use disclosure. Keep sources, author and review dates clear.

## Milestone 4 — Optional backend and sync (not MVP)

Only after research supports demand, evaluate Supabase or alternatives for accounts, opt-in sync, backup and classroom/team collaboration. A separate ADR must cover authentication, authorization, privacy, retention, residency, cost, security, applicable license implications and conflict resolution. Preserve local-only mode and export.

## Milestone 5 — Commercial readiness (conditional)

Potential paid cloud sync, classroom/team administration, support and assessment/certificate services. Keep useful learner core accessible without payment. Validate willingness to pay and legal implications before commitment; no prices or market claims asserted.

## Risks

Browser data can be cleared or quota-limited: backup/restore and warnings. Pages base paths can break routes: centralized config and live tests. SPA deep links may 404: generated pages or hash routing. Metadata injected late: inspect generated HTML. Schema may be ineligible: validate visible content. Sync conflicts: separate phase with stable IDs and conflict UI.

Update this roadmap through PRs and record architecture changes in ADRs.
