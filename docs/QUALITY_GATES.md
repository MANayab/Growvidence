# Quality gates

**Status:** Phase 1 foundation checks (Astro diagnostics, ESLint, Prettier, Vitest, static build and built-HTML smoke verification) are configured in CI; Phase 1 is merged. GitHub Pages deployment is configured through the Astro workflow and the public landing page has been published. The product-level acceptance tests below remain targets; they are not yet implemented or run.

## Definition of done

- Scope matches the approved issue / PR.
- TypeScript strict mode and lint/format checks pass.
- Unit and integration tests cover domain invariants and failure paths.
- Playwright covers critical local-first user journeys when those workflows exist.
- Accessibility checks include automated scans and manual keyboard review.
- Security review covers untrusted input, data exposure, dependencies and secrets; authentication/authorization controls apply only if a future authenticated service is approved.
- Performance and responsive behavior are checked on representative devices.
- Documentation, environment examples and migration instructions are accurate.
- Latest-head CI is green before a PR is called ready.
- Known limitations and untested areas are explicit.

## Proposed test targets

| Area | Initial target |
|---|---|
| Unit / domain logic | Test all critical invariants; aim for at least 80% statement coverage in core domain modules |
| Critical user journeys | Playwright journeys for first use without an account, task lifecycle, learning entry, AI-use disclosure, evidence association, competency review, export, import and local-data deletion |
| Local input boundaries | Valid, invalid, oversized, malformed and unsupported import files; invalid record relationships and unsafe rendered content |
| Data integrity | Schema migration, stable ID uniqueness, reference integrity, atomic import behavior, persistence after reload and deletion behavior |
| Regression | Every fixed defect gains a regression test where practical |

Coverage is a diagnostic target, not a substitute for meaningful assertions. Do not inflate coverage with tests that merely execute lines.

## Accessibility targets

- WCAG 2.2 AA target.
- Keyboard-only completion of all primary workflows.
- Visible focus and logical focus order.
- Correct names, roles, labels and status announcements.
- Sufficient contrast and no color-only meaning.
- Reduced-motion support.
- Charts have text or table alternatives.
- Automated axe checks plus manual review with at least one screen reader before release.

## Performance targets

- Lighthouse performance score 90+ on representative production-like routes and test conditions.
- Also review Core Web Vitals, bundle size, server response and low-end mobile behavior.
- Record URL, device/emulation, network profile, build, date and tool version with results.
- A Lighthouse score alone does not prove real-user performance.

## Security checklist

- Validate untrusted text and imported files, including size, encoding, schema and record references.
- Render learner-authored content safely; test XSS and injection risks in applicable client-side contexts.
- Do not place private learner evidence in public assets, URLs, logs or default Cache Storage.
- Secrets and dependency scans run; no secret values in repository history.
- Review dependency advisories and distinguish production dependencies from build/test tooling; document any accepted residual risk.
- Document local-data export, import, deletion, retention and browser-storage limitations.
- Upload malware scanning and private object access are out of MVP scope unless file uploads/storage are introduced.
- Authentication, authorization, sessions, CSRF, rate limiting and secure cookies are not MVP requirements while the product remains a static local-only application; reassess them before introducing any authenticated backend or sync.
- Update the threat model for new integrations or data flows.

## Release gate

Do not label a release production-ready while a critical/high security issue is unresolved, a critical journey is broken, required checks are failing, or privacy/data deletion behavior is unknown. Exceptions require an explicit, documented risk acceptance by the maintainer.
