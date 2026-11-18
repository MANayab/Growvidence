# ADR-0004: GitHub Pages hosting and local-first data

- **Status:** Proposed
- **Date:** 2026-11-18

## Decision
1. Build static output and deploy to GitHub Pages through GitHub Actions.
2. Store learner data in IndexedDB; provide versioned JSON export/import and selected CSV export.
3. Add offline PWA behavior only after data lifecycle and cache update tests.
4. Keep public marketing, learning and documentation pages indexable; app/workspace pages emit robots noindex.
5. Use the project-site base path /Growvidence/ for assets, links, manifest, service worker and canonicals.
6. Generate physical HTML for public routes and include a static 404.html. Do not assume server rewrites or history fallback; app navigation must use generated entry points or a tested hash-route strategy.
7. A custom domain is a later optional migration requiring maintainer domain ownership, Pages configuration, DNS, canonical updates and Search Console verification.
8. Supabase or another backend is optional future scope only; no account or sync requirement in MVP.

## Deployment verification
Use official Pages Actions with least-privilege permissions. After deployment, check HTTP success for the site, public routes, robots.txt, sitemap.xml, llms.txt, manifest and service worker. Inspect canonical and robots directives in generated HTML. Do not claim deployment success until workflow and live checks pass.

## Consequences
Pages is static hosting, not a database or backend. Static files are public. Never publish secrets or learner data. IndexedDB is not cloud backup. App deep links and base paths require live Pages tests. PWA caches can become stale and must be restricted to public app-shell resources.

## Sources
- [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)
- [Custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Custom Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
