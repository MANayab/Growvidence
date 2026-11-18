# Growvidence project memory

**Last updated:** Phase 0 foundation draft  
**Current phase:** Phase 0 — documentation only  
**Current branch:** `docs/phase-0-foundation`  
**Next action:** Review and approve Phase 0 pull request before starting implementation.

## Project identity

- Repository: `MANayab/Growvidence`
- Product category: skill tracker and learning task manager
- Intended audience: IT beginners, students, self-taught learners
- Working name: Growvidence (not legally cleared)
- Tagline candidate: “Don't just learn. Prove your progress.”
- Initial platform: web / PWA
- Business model: open source initially; commercial options may be evaluated later

## Core product idea

Track the path from learning activity to practice, artifact, independent demonstration, and feedback. A checkbox, course completion, streak, or AI-generated result must never be treated as sufficient proof of mastery.

## Agreed workflow constraints

- Work only in this repository.
- Never push directly to `main`; use feature branches and pull requests.
- User reviews and merges; assistant does not merge.
- Work in small phases and stop after each phase until user says “next”.
- No secrets in commits; provide `.env.example` only.
- Do not buy domains/assets or publish app/site listings.
- Do not claim trademark, domain, or store availability.
- No fabricated research, metrics, competitors, prices, or validation.
- Mark unverified claims and distinguish plans from implemented features.
- No placeholders, TODOs, or pseudo-code in delivered implementation.
- Each implementation slice must include tests, verification instructions, limitations, and this file updated.
- Independent practice exercises should be labelled “I should write this myself”.

## Branch protection read-back (2026-11-18)

Repository ruleset `Protect main` (ID `27489632`) is Active and targets `~DEFAULT_BRANCH`, which resolves to `main`. Rules read from GitHub:
- Pull request required; required approving review count: 0
- Deletion rule enabled
- Non-fast-forward rule enabled (blocks force pushes)
- Bypass actors empty; current user cannot bypass
- No status-check rule configured

The branch endpoint reports `protected: true`. No repository settings outside Growvidence were changed.

## Product decisions / working assumptions

- Evidence-based competency tracking is the differentiator.
- Task status and competency status are separate.
- Every learning record captures AI-use disclosure.
- Initial competency areas: independent coding, debugging, architecture, testing, commercial validation, technical fundamentals.
- Responsive web/PWA before a separate native app.
- PostgreSQL + Prisma, Next.js App Router, strict TypeScript, Tailwind, shadcn/ui, Zod, Auth.js are proposed, not yet implemented or fully approved.
- Prefer REST initially; defer SSE/WebSockets until a real workflow requires them.
- Prefer artifact links before introducing file uploads.
- No `LICENSE` file until the license ADR is approved.

## Repository map

- `README.md` — project overview and navigation
- `mind.md` — product vision and principles
- `brain.md` — operational project memory
- `AGENTS.md` — agent and contribution rules
- `CONTRIBUTING.md` — contributor workflow
- `CODE_OF_CONDUCT.md` — community expectations
- `SECURITY.md` — vulnerability reporting
- `docs/ROADMAP.md` — milestones and scope
- `docs/ARCHITECTURE.md` — proposed system architecture
- `docs/DATA_MODEL.md` — proposed entities and schema
- `docs/QUALITY_GATES.md` — definition of done
- `docs/RESEARCH.md` — research log template
- `docs/DECISIONS/` — ADRs

## Commands

No app/tooling exists yet, so there are no project build, test, lint, or development commands. Add verified commands when the tooling phase creates them.

## Known limitations / unresolved decisions

- License selection and legal review
- Naming clearance
- Market and user validation
- Authentication/session strategy and deployment provider
- Evidence upload/storage and retention policy
- Offline draft storage and sync conflict model
- Reviewer permissions and collaboration
- Competency rubric wording and assessment governance
- Analytics and privacy approach
- CI, test tooling, dependency versions, and deployment are not yet implemented

## Phase handoff rule

At the end of each phase, update current branch, status, verified results, changed files, decisions, open issues, and the exact next action. Never describe planned functionality as shipped.
