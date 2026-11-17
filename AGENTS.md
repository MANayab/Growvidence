# Agent and engineering rules

These rules apply to all automated and human contributors.

## Repository boundaries

- Work only in `MANayab/Growvidence` unless the user explicitly changes this instruction.
- Do not access or modify other repositories or account settings.
- Never push directly to `main`.
- Start every phase from the latest fetched `main`.
- Use a focused feature branch and pull request for each phase/slice.
- The repository owner reviews and merges. Do not merge PRs or mark them approved on the owner's behalf.
- Do not force-push, rewrite shared history, or delete/recreate tags.

## Truth and evidence

- Do not invent test results, CI status, research, competitor facts, prices, market size, or user validation.
- Distinguish implemented, proposed, tested, and unverified behavior.
- Cite authoritative sources for externally sourced claims.
- If a check cannot be run, say why and do not call it passed.
- No placeholders, TODOs, or pseudo-code in delivered implementation.
- Do not claim trademark, domain, or app-store clearance.

## Security and privacy

- Never commit secrets, tokens, private keys, or real credentials.
- Commit `.env.example` with safe variable names and descriptions only.
- Validate untrusted input at server boundaries and enforce authorization separately.
- Avoid logging sensitive user content or evidence.
- Minimize collection and document retention, export, deletion, and offline storage behavior.
- Do not weaken security checks to make CI pass.

## Product invariants

- A completed task is not proof of competency.
- Every learning record must disclose AI assistance, including unknown/not recorded where applicable.
- Competency claims require criteria and evidence.
- Preserve uncertainty and “needs more evidence” states.
- Keep commercial validation distinct from technical competency.

## Implementation quality

- TypeScript strict mode for TypeScript code.
- ESLint and Prettier checks.
- Unit/integration tests for domain behavior.
- Playwright tests for critical end-to-end journeys.
- Accessibility checks plus manual keyboard/screen-reader review.
- Dependency and secret scanning; OWASP-oriented threat review.
- No merge-ready claim until required CI checks pass on the latest PR head.
- Keep dependencies pinned through a committed lockfile and use reproducible installs.

## Pull request discipline

Each PR should:
1. Have one clear purpose and a descriptive title.
2. Explain scope, design choices, and user impact.
3. List changed files and verification performed.
4. Include tests with code changes.
5. State limitations and follow-up work.
6. Update `brain.md` when project state or decisions change.
7. Be based on current `main` and contain no unrelated changes.

## Phase discipline

Work in small phases. Stop after each phase and wait for the user to say **“next”** before beginning another. Phase 0 is documentation only; do not add app code in that phase.

## Definition of done

A change is done only when its scope is complete, docs are accurate, tests/checks have real successful evidence, security and accessibility implications are considered, the PR is reviewable, and unresolved limitations are clearly stated.
