# Security policy

## Status

Growvidence is in the planning / foundation stage. There is no production application or supported release yet.

## Reporting a vulnerability

Please do not publish exploitable vulnerability details in a public issue. Use GitHub's private vulnerability reporting feature for this repository if it is enabled. If private reporting is unavailable, email the maintainer at manayab2@gmail.com. I cannot independently confirm whether GitHub private vulnerability reporting is enabled for this repository. Do not include secrets or real user evidence in the report.

Include, where safe:
- Affected component, commit, or version
- Impact and realistic attack scenario
- Reproduction steps or a minimal proof of concept
- Suggested mitigation, if known

## Response expectations

There is no formal response-time SLA yet. The maintainer will assess reports as capacity allows, acknowledge receipt where possible, and coordinate disclosure with the reporter.

## Scope

When software is released, security scope and supported versions will be documented here. Until then, report security concerns in repository infrastructure, documentation, or any prototype code responsibly.

Questions: open an issue at https://github.com/MANayab/Growvidence/issues or email manayab2@gmail.com

## Secure development expectations

- Keep dependencies updated and review advisories.
- Never commit credentials or production data.
- Validate input and enforce authorization server-side.
- Protect sessions, exports, uploads, and evidence links.
- Minimize logs and sensitive data retention.
- Review third-party integrations and permissions.
