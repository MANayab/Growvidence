# Growvidence roadmap

**Status:** Phase 1 static foundation is implemented on a review branch; merge and reproducible-install verification are pending. Remaining milestones are planning goals, not commitments.

## Milestone 1 — Static MVP on GitHub Pages

**Foundation delivered in Phase 1:** Astro static output, strict TypeScript configuration, shared page layout, public homepage and 404 page, SEO metadata helper/tests, robots.txt, sitemap.xml, llms.txt, lint/format/typecheck/test/build scripts and CI guardrails.

**Still required:** Maintainer-generated committed package-lock.json; green CI on the latest PR head; remaining public routes; client-side learner workspace; IndexedDB tasks/log/evidence/competencies; JSON backup/restore; selected CSV export; accessibility/security review; Pages deployment workflow and post-deploy checks.

**Scope:** No backend, login, database, runtime SSR, API routes or cloud sync in MVP.

**Exit measures:** Public routes load directly under /Growvidence/; task-to-evidence workflow works without account; data survives reload in supported browsers; JSON round-trip preserves records; users can export and clear data; offline behavior is documented; no unresolved critical/high data-loss or security defects; CI and post-deploy checks pass on deployed commit.

## Milestone 2 — SEO/AEO/GEO launch readiness

Unique title/description, canonical, OG/Twitter metadata, robots.txt, sitemap.xml, relevant JSON-LD, llms.txt, semantic HTML, answer-first public guides and FAQ. App routes noindex.

**Targets:** Lighthouse 95+ target on agreed representative mobile/desktop profiles; Core Web Vitals pass at 75th percentile when field data is sufficient; no structured-data validation errors for supported types; Search Console verified and sitemap submitted; no accidental noindex on public pages. No #1 ranking promise.

## Milestone 3 — Content and evidence expansion
Publish original beginner guides, FAQ and HowTo content only where genuinely useful, and citable methodology pages for competencies and AI-use disclosure. Keep sources, author and review dates clear.

## Milestone 4 — Optional backend and sync (not MVP)
Only after research supports demand, evaluate Supabase or alternatives for accounts, opt-in sync, backup and classroom/team collaboration. Separate ADR must cover auth, authorization, privacy, retention, residency, cost, security, AGPL boundaries and conflict resolution. Preserve local-only mode and export.

## Milestone 5 — Commercial readiness (conditional)
Potential paid cloud sync, classroom/team administration, support and assessment/certificate services. Keep useful learner core accessible without payment. Validate willingness to pay and legal implications before commitment; no prices or market claims asserted.

## Risks
Browser data can be cleared or quota-limited: backup/restore and warnings. Pages base paths can break routes: centralized config and live tests. SPA deep links may 404: generated pages or hash routing. Metadata injected late: inspect generated HTML. Schema may be ineligible: validate visible content. Sync conflicts: separate phase with stable IDs and conflict UI.

Update this roadmap through PRs and record architecture changes in ADRs.
