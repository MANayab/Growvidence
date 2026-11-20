# ADR-0005: Learner workspace architecture on Astro static hosting

- **Status:** Proposed — maintainer approval required before implementation
- **Date:** 2026-11-21
- **Scope:** Phase 2 learner workspace MVP; no implementation or dependency changes in this ADR

## Context and constraints

Growvidence is deployed as static output to GitHub Pages at `https://manayab.github.io/Growvidence/`, with Astro `base: /Growvidence/`. GitHub Pages serves generated files; it does not provide runtime SSR, server routes, API handlers, rewrites, authentication or a database. Public marketing and documentation pages must remain crawlable. The future learner workspace must be noindex, excluded from the sitemap, and local-first.

The workspace needs interactive task, journal, evidence and competency screens, but those features do not justify turning the public site into a client-rendered application. No learner records may be uploaded silently, placed in URLs, or sent to analytics/third-party scripts.

## Options considered

| Option | Advantages | Costs and risks | Assessment |
|---|---|---|---|
| **Astro with React islands** | Preserves Astro's HTML-first public pages; hydrate only interactive workspace surfaces; broad React ecosystem and learning resources; shares one static build and deployment. | React runtime and hydration add bundle cost; island boundaries and shared state require discipline; React dependency is not installed today. | **Recommended** |
| Astro with Preact islands | Smaller runtime; similar island model; good fit for compact UI. | Smaller ecosystem and compatibility differences; fewer direct examples for beginner-friendly React ecosystem learning; migration friction if React-specific libraries are later needed. | Viable alternative if measured bundle constraints outweigh ecosystem benefits. |
| Separate Vite + React SPA | Simple app-centric build and familiar React tooling; app can be developed independently. | Adds a second build/deploy pipeline and routing/base-path coordination; public pages still need Astro; duplicated configuration and more operational surface. | Not recommended for this MVP. |
| Full client-side app for all routes | One client application can own all navigation. | Unnecessarily hydrates public content, weakens HTML-first content discipline and expands SEO/performance risk. | Reject. |

## Proposed decision

Use **Astro static output for the whole site and React islands only for interactive learner-workspace features**. Keep public pages as ordinary Astro-generated HTML. A workspace entry page should be generated at `/app/` under the project base path. React should hydrate only the workspace root, not the public marketing pages.

This is a recommendation, not an implementation decision until the maintainer approves this ADR. React, its renderer and any routing/state libraries must be added in a separate implementation PR with pinned versions and a maintainer-generated lockfile.

### Routing and GitHub Pages behavior

- Use physical static entry HTML for the app shell at `/Growvidence/app/`; do not depend on server rewrites or history fallback.
- Use hash-based in-app navigation for nested workspace views in the first release (for example, `/Growvidence/app/#/tasks`). This supports direct refresh on static hosting without generating a separate HTML file for every client-side view.
- Keep user content and evidence out of query strings, fragments and path segments. Route fragments may contain route names only.
- All links and assets must respect Astro's `/Growvidence/` base path.
- A later move to generated physical subroutes requires an explicit routing review and direct-refresh tests.

### Indexing requirements

- The generated `/app/` HTML must contain a build-time `<meta name="robots" content="noindex, nofollow">` (or a stricter equivalent) before any client JavaScript runs.
- Do **not** add `Disallow: /app/` to `robots.txt`: crawlers need to fetch the page to see its noindex directive.
- Keep `/app/` and every app-only URL out of `public/sitemap.xml`. The sitemap remains for public, indexable pages only.
- Noindex is not access control. Static assets and all published files are public; never place private learner records or secrets in the build output.
- Add build verification that inspects generated HTML for noindex and verifies app routes are absent from the sitemap.

## SEO, bundle and learning implications

Astro keeps public content server-rendered at build time and hydrates only the app island. The app bundle will still include React and workspace code, so measure compressed JS size and route-level loading rather than assuming islands are free. Load large optional views only when needed. Avoid charts and UI libraries until a concrete use case justifies their cost.

This choice keeps one toolchain and deployment model for a beginner contributor while teaching a useful combination of static content and selective client interactivity. Preact remains a possible measured optimization, not a parallel implementation target.

## Consequences and boundaries

- GitHub Pages remains static-only; no SSR, API routes, server database, accounts or cloud sync.
- Learner data belongs in browser IndexedDB through the persistence abstraction described by ADR-0006.
- No analytics or third-party scripts by default.
- The app must remain useful without login and must provide explicit export, import and deletion.
- React is proposed, not yet installed. This ADR adds no package or source code.
- Accessibility, privacy and bundle budgets remain release gates.

## Acceptance checks before app implementation

1. Build output contains the app entry route beneath `/Growvidence/app/`.
2. Generated app HTML includes noindex in the initial document head.
3. Public homepage and future public content remain indexable.
4. `robots.txt` does not disallow `/app/`.
5. Sitemap excludes `/app/`.
6. App route works when opened directly and refreshed on GitHub Pages.
7. All public pages remain usable without downloading the React workspace bundle.

## References

- [Astro islands](https://docs.astro.build/en/concepts/islands/)
- [Astro static output](https://docs.astro.build/en/guides/on-demand-rendering/)
- [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)
- [Google robots meta tag guidance](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
