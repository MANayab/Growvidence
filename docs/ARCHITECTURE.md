# Architecture proposal — static, local-first

**Status:** Proposed. Supersedes the earlier server-backed architecture; no application code is implemented.

## Constraints
- Production MVP on GitHub Pages, static files only.
- No server, database, runtime SSR, dynamic API routes, accounts or cloud sync in MVP.
- IndexedDB local data with JSON export/import and CSV export.
- Public pages indexable; app/workspace pages noindex.
- Project URL base path: /Growvidence/. Custom domain later if approved.

## Proposed stack

| Layer | Choice | Trade-off |
|---|---|---|
| Static site | Astro static output | HTML-first public pages and selective hydration; adds Astro concepts. |
| Interactive UI | React islands, strict TypeScript | React only where needed; client boundaries require discipline. |
| Styling | Tailwind; shadcn/ui-compatible Radix components selectively | Accessible primitives still require testing and maintenance. |
| Charts | Recharts only when justified | Bundle cost; provide text/table alternatives. |
| Validation | Zod | Validate imports and domain boundaries; not a substitute for authorization. |
| Persistence | IndexedDB via repository abstraction | Async structured browser storage, not backup or cross-device sync. |
| Export | Versioned JSON backup/restore and selected CSV | User portability; CSV is not a lossless backup. |
| Tests | Vitest + Playwright | Domain tests and real browser journeys. |
| Hosting | GitHub Pages | Static only; no runtime backend. |
| Future sync | Optional Supabase or alternative, separate phase | Adds identity, privacy, security, cost and conflict responsibilities. |

## System context

```mermaid
flowchart TD
 Visitor[Visitor or learner] --> Pages[GitHub Pages static hosting]
 Pages --> Public[Public indexable HTML]
 Pages --> App[App shell noindex]
 Public --> SEO[Metadata, JSON-LD, sitemap, llms.txt]
 App --> UI[React interactive islands]
 UI --> Domain[Typed domain services and Zod]
 Domain --> DB[(IndexedDB)]
 DB --> Export[JSON backup and CSV export]
 Import[Validated JSON import] --> DB
 SW[Service worker and PWA cache] --> Pages
 Future[Optional future sync] -. separate phase .-> API[Supabase or alternative]
 CI[GitHub Actions] --> Build[Static build and checks]
 Build --> Deploy[Pages deployment]
 Deploy --> Check[Post-deploy smoke checks]
```

## Routing and base path
- Centralize the base path as /Growvidence/ for the GitHub project site.
- Generate physical HTML for public routes so each page works when opened directly.
- Include a 404 page linking to the project base path.
- Do not rely on server rewrites, middleware, API routes or history fallback. Use generated app entry points or hash routing and test direct refresh on the live Pages URL.
- Canonical URLs include the base path until a custom domain is approved.
- Custom-domain migration requires DNS/Pages configuration and updating canonical URLs, sitemap, links and Search Console.

## Local data lifecycle
1. Browser loads public static assets; no login required.
2. Domain services validate user actions and persist records in IndexedDB.
3. Records have stable IDs, schema versions and created/updated timestamps.
4. JSON export contains all supported stores; import validates format, shape and references, previews changes and requires confirmation.
5. CSV is convenience export, not complete backup.
6. User can explicitly export or clear local data.
7. Cache only the app shell and public assets by default; do not cache private evidence in Cache Storage.

## Indexing
Public marketing, product, guide and documentation pages have unique build-time metadata and remain crawlable. App/workspace pages have a robots noindex directive in generated HTML. Do not disallow those pages in robots.txt if crawlers need to read their noindex. Never rely on JavaScript-only metadata changes.

## SEO/AEO/GEO
See SEO_AEO_GEO.md. Structured data must match visible content; it does not guarantee rich results. No ranking position is guaranteed.

## Optional future backend — not MVP
A separate ADR must assess Supabase or alternatives for account linking, authentication, authorization, encryption, retention, backups, data residency, cost, incident response, AGPL boundaries and conflict resolution. Local-only operation and export remain available.

## Security and accessibility
Validate imported files, sizes, encodings and relationships. Render learner-authored content safely. Never embed secrets in client assets. No analytics/third-party scripts by default. Target WCAG 2.2 AA with keyboard, focus, labels, semantic structure and reduced motion.
