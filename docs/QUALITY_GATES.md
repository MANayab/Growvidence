# Quality gates

**Status:** Acceptance targets for implementation phases. These checks are not yet configured or run.

## Definition of done

- Scope matches the approved issue / PR.
- TypeScript strict mode and lint/format checks pass.
- Unit and integration tests cover domain invariants and failure paths.
- Playwright covers critical user journeys.
- Accessibility checks include automated scans and manual keyboard review.
- Security review covers authentication, authorization, input validation, data exposure, dependencies, and secrets.
- Performance and responsive behavior are checked on representative devices.
- Documentation, environment examples, and migration instructions are accurate.
- Latest-head CI is green before a PR is called ready.
- Known limitations and untested areas are explicit.

## Proposed test targets

| Area | Initial target |
|---|---|
| Unit / domain logic | Test all critical invariants; aim for at least 80% statement coverage in core domain modules |
| Critical user journeys | Playwright tests for sign-in, task lifecycle, learning entry, evidence association, export, and deletion |
| API boundaries | Valid, invalid, unauthorized, cross-user, and malformed payload cases |
| Data integrity | Migration, uniqueness, ownership, deletion, and transaction behavior |
| Regression | Every fixed defect gains a regression test where practical |

Coverage is a diagnostic target, not a substitute for meaningful assertions. Do not inflate coverage with tests that merely execute lines.

## Accessibility targets

- WCAG 2.2 AA target.
- Keyboard-only completion of all primary workflows.
- Visible focus and logical focus order.
- Correct names, roles, labels, and status announcements.
- Sufficient contrast and no color-only meaning.
- Reduced-motion support.
- Charts have text or table alternatives.
- Automated axe checks plus manual review with at least one screen reader before release.

## Performance targets

- Lighthouse performance score 90+ on representative production-like routes and test conditions.
- Also review Core Web Vitals, bundle size, server response, and low-end mobile behavior.
- Record URL, device/emulation, network profile, build, date, and tool version with results.
- A Lighthouse score alone does not prove real-user performance.

## Security checklist

- Authentication and session lifecycle reviewed.
- Authorization checked for every user-owned resource and export.
- CSRF, XSS, injection, SSRF, open redirect, and IDOR risks considered as applicable.
- Rate limiting and abuse controls on sensitive endpoints.
- Secure cookies, headers, and deployment configuration.
- Secrets and dependency scans run; no secret values in repository history.
- Upload validation, malware controls, private object access, and deletion propagation reviewed before enabling uploads.
- Logs exclude tokens, full request bodies, and private learning/evidence content.
- Data export, account deletion, backups, retention, and offline storage documented.
- Threat model updated for new integrations or data flows.

## Release gate

Do not label a release production-ready while a critical/high security issue is unresolved, a critical journey is broken, required checks are failing, or privacy/data deletion behavior is unknown. Exceptions require an explicit, documented risk acceptance by the maintainer.
