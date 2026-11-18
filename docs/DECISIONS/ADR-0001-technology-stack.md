# ADR-0001: Static-first technology stack

- **Status:** Proposed — replaces the earlier server-backed proposal
- **Date:** 2026-11-18

## Context
Growvidence must run on GitHub Pages using static files only. Pages cannot execute application servers, runtime SSR, dynamic API routes or PostgreSQL. The MVP must work without accounts or a backend and keep learner records in the browser.

## Decision
**Proposed: Astro in static output mode, strict TypeScript, and React islands only for interactive application features.** Use Tailwind CSS and shadcn/ui-compatible Radix primitives selectively. Do not include Prisma, Auth.js server sessions, PostgreSQL or API routes in the Pages MVP.

- Generate crawlable HTML at build time.
- Persist learner data in IndexedDB through a typed repository abstraction.
- Provide versioned JSON backup/restore and selected CSV export.
- Add PWA/offline capability after storage lifecycle and service-worker behavior are tested.
- Evaluate Supabase or another backend only in a separate optional future phase for accounts and sync.

## Framework evaluation

| Option | SEO/static output | Trade-off | Decision |
|---|---|---|---|
| Next.js App Router static export | Emits HTML per route; static export excludes server-dependent features such as request-dependent handlers, cookies, Server Actions and runtime rewrites. | Familiar React ecosystem but server/client concepts and export limitations add complexity for Pages-only hosting. | Not selected for current constraint. |
| **Astro static output** | Static HTML-first output with selective hydration of interactive islands. | Adds Astro concepts, but keeps content pages light and interactive code isolated. | **Selected** for public content plus local-first app shell. |
| Vite + React | Static assets; a typical SPA needs client routing and extra pre-rendering work for public routes. | Familiar and simple, but SEO across multiple public pages needs more discipline/tooling. | Viable alternative, not preferred. |

Sources: [Next.js static export](https://nextjs.org/docs/app/guides/static-exports), [Astro configuration](https://docs.astro.build/en/reference/configuration-reference/), [Vite guide](https://vite.dev/guide/).

## Consequences
- No accounts, cross-device sync, cloud backup, server-side authorization, server API or database in MVP.
- IndexedDB is browser-profile/device-specific, subject to quota and user clearing; export/import is essential.
- Future backend migration requires explicit account linking, schema versioning, conflict handling, consent and security review.
- Production readiness still requires accessibility, privacy, performance, recovery and deployment gates.

## Deferred
Next.js server runtime, Auth.js, Prisma, PostgreSQL, Supabase, mandatory login, native mobile and server APIs.

## Review triggers
Revisit if hosting changes, multi-device sync becomes necessary, or validated user needs justify a backend.
