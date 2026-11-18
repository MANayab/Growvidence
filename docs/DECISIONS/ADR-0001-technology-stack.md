# ADR-0001: Proposed technology stack

- **Status:** Proposed — approval required
- **Date:** 2026-11-18
- **Decision owners:** Project maintainer

## Context

Growvidence needs a maintainable web-first foundation, strong typing, accessible UI, a relational model for evidence and competency history, and a path to offline and mobile use without prematurely operating multiple clients.

## Proposed decision

- Next.js App Router
- TypeScript strict
- Tailwind CSS and shadcn/ui
- Recharts for data visualization
- Zod for runtime validation
- PostgreSQL with Prisma
- Auth.js for authentication integration
- REST route handlers initially
- Vitest and Playwright
- GitHub Actions and Docker
- Responsive PWA before React Native / Expo evaluation

## Alternatives considered

- A small Vite SPA: simpler client-only deployment, but would require separately designing server/API/auth infrastructure.
- tRPC from day one: excellent internal type sharing, but introduces a tighter client/server coupling than needed before API usage is understood.
- WebSockets for all live updates: flexible bidirectional transport, but operationally heavier than needed without a concrete real-time collaboration requirement.
- Native mobile immediately: duplicates platform work before PWA limitations are known.

## Consequences

The proposed stack has a relatively large ecosystem and deployment surface. Keep dependencies deliberate, pin versions, audit upgrades, and avoid adding real-time or mobile complexity until user needs justify it. This ADR does not approve dependency versions or a hosting provider.

## Review triggers

Revisit if deployment constraints, self-hosting requirements, offline complexity, team expertise, or user research materially changes the trade-offs.
