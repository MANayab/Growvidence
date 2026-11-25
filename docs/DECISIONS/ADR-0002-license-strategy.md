# ADR-0002: License strategy and future commercialization

- **Status:** **Accepted — MIT License**
- **Date:** 2026-11-25
- **Scope:** Repository source code and contributions. Future hosted services, commercial features, customer contracts, and trademarks may require separate terms and review.

## Decision

Growvidence is licensed under the standard MIT License. This permissive license supports adoption, reuse, contributions, educational use, self-hosting, and commercial use with minimal friction. Users may modify, distribute, sublicense, and sell copies or derivatives, subject to retaining the copyright and license notice.

## Rationale

- Familiar and short, easy for learners, educators, contributors, and commercial adopters to understand.
- Fits the current local-first static application, which is hosted as a static site and stores learner records in the browser's IndexedDB rather than a service operated by the project.
- Supports a future business model in which optional paid services or features can be developed as separate code later, with their own clearly stated terms and boundaries. The MIT license does not require that later separate code be open source, nor does it reserve exclusive rights to host or sell the current MIT-covered code.
- Low contributor friction and clear inbound = outbound contribution terms.

## Alternatives considered and rejected

- **AGPL-3.0 / open-core proposal:** Previously proposed to reduce the ability to privately modify and commercially host the core. Rejected because Growvidence prioritizes broad adoption and a simple permissive license. AGPL would not prohibit paid hosting, but its copyleft and network source-offer requirements can add compliance friction. Open-core is a product strategy, not a license, and can be considered later for genuinely separate services/code.
- **Apache-2.0:** Considered as a permissive alternative with express patent terms, but MIT's simplicity was preferred.
- **BSL 1.1:** Rejected because source-available production-use restrictions would not fit the project's adoption goal.

## Contributions

Contributions are licensed under MIT on an inbound = outbound basis. This does not transfer contributor copyright. No DCO or CLA requirement is adopted by this ADR.

## Commercialization boundary

The current project is local-first and static. Paid services or features may be built as separate code later and may have separate terms. The MIT license already permits anyone to commercially reuse, host, modify, or sell the current licensed code. The license does not prevent competing forks or hosted offerings.

## Trademark

The MIT License grants copyright permission, not trademark rights. Growvidence is a working name that has not been cleared; see the README note.

## Legal note

This is not legal advice. The maintainer should obtain qualified legal advice before accepting material third-party contributions, introducing paid services, analytics, accounts, or other significant legal/privacy changes.
