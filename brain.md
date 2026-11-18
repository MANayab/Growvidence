# Growvidence project memory

**Last updated:** 2026-11-18 — Pages/local-first architecture proposal  
**Current phase:** Documentation revision before implementation  
**Current branch:** docs/pages-seo-architecture  
**Base main:** f8fc5699dad5c2387d4a0d7b4abfc782efb03248  
**Next action:** Maintainer reviews and merges documentation PR; implementation follows only after approval.

## Repository and product
- MANayab/Growvidence; audience: IT beginners, students, self-taught learners.
- Working name not legally cleared.
- Evidence-based competency tracking is the differentiator.

## Repository state
- PR #1 merged into main.
- Merge commit and current main at branch creation: f8fc5699dad5c2387d4a0d7b4abfc782efb03248.
- Phase 0 documentation is present on main.

## New platform requirements
- Production MVP on GitHub Pages, static files only.
- No server, database, runtime SSR, API routes, accounts or cloud sync in MVP.
- IndexedDB local data; versioned JSON export/import and selected CSV export.
- PWA/offline planned; browser storage is not cloud backup.
- Public marketing/docs indexable; app/workspace noindex.
- Project-site base path /Growvidence/; custom domain later.
- Optional backend (e.g. Supabase) is separate future scope.
- Current PR is documentation-only; no LICENSE file.

## Proposed architecture
- ADR-0001 proposes Astro static output, strict TypeScript and React islands, Tailwind, selective shadcn/Radix.
- Next.js static export, Astro and Vite+React compared; Astro selected for content-first static HTML.
- Prisma, PostgreSQL and Auth.js removed from MVP.
- ADR-0004 covers Pages and local-first data.
- SEO_AEO_GEO.md covers page metadata, schema, crawl files and verification.

## Product invariants
Task status differs from competency status. Every learning record captures AI-use disclosure. Checkboxes/streaks never establish mastery. User data remains local in MVP with explicit export/import/deletion. No analytics/third-party scripts by default.

## Workflow
Only this repository. Never push to main; use branch + PR. User merges. No secrets. No LICENSE until license ADR approved. Small changes; stop after phase until user says next. Mark unverified claims; never claim checks/deployments without evidence.

## Commands
No application implementation or verified development commands yet.

## Open questions
Exact route inventory; IndexedDB migrations; import merge/replace policy; app deep-link strategy on Pages; PWA cache updates; custom domain; future sync provider; keyword demand; license decision.

## Handoff
Documentation only. Verify links and architecture; do not describe app as implemented. Await maintainer approval before coding.
