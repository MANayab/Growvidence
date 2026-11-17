# ADR-0002: License strategy and future commercialization

- **Status:** **Proposed** — maintainer decision required; obtain jurisdiction-specific legal advice before adopting a license or accepting material third-party contributions
- **Date:** 2026-11-18
- **Scope:** Repository source code and contributions. Product services, trademarks, certification claims, hosted data, and customer contracts may require separate terms and review.

## Context and goals

Growvidence should be genuinely open source now and remain free for learners to use, modify, self-host, and share. The maintainer may later fund development through paid cloud sync, classroom/team plans, and certificates or assessment services.

The project also wants to reduce the risk that a third party takes the application, makes private modifications, and sells a closed hosted clone. That goal must be balanced against student/community trust, contributor friendliness, broad adoption, and the ability to build a sustainable service.

These goals are not all achievable through one license:

- An OSI-approved open-source license cannot prohibit commercial use, paid hosting, or competition. The Open Source Definition explicitly disallows restrictions by field of endeavor and permits selling open-source software.
- Copyleft can require source availability for covered modifications in specified circumstances; it does not reserve the right to operate a paid service to the original maintainer.
- A paid service can charge for hosting, reliability, support, administration, convenience, or human services while the underlying software remains open source, subject to the selected license.
- “Open core” describes a product/licensing strategy, not a license. Its closed components must be clearly separated and disclosed as such.

The project should not promise that any license can prevent all competing hosted offerings.

## Evaluation criteria

1. Keep a useful learner-facing product genuinely open and free to use.
2. Make it practical for students, educators, contributors, and self-hosters to inspect, fork, and improve the core.
3. Reduce the ability to make private modifications to covered application code and offer those modifications only as a hosted service.
4. Preserve a viable path to charge for optional cloud operations, collaboration administration, support, and assessment services.
5. Avoid unnecessary contribution barriers and avoid implying that contributors have surrendered ownership.
6. Be explicit about what can and cannot be relicensed later.

## License and model comparison

| Option | What it means for Growvidence | Paid hosted clone / competitor risk | Trust and contributor trade-offs |
|---|---|---|---|
| **MIT** | Very short permissive license. Reusers may modify, redistribute, sublicense, and sell the software while preserving required notices. | **High.** A competitor may make private modifications and sell a hosted version. MIT does not require publication of those modifications. | Familiar, low-friction, and attractive to contributors and commercial adopters. It offers no express patent grant comparable to Apache-2.0. |
| **Apache-2.0** | Permissive license with copyright and express patent grants, notice requirements, and terms for contributions. | **High.** Like MIT, it permits proprietary derivatives and paid hosting; it does not require competitors to publish their private modifications. | Strong commercial and institutional adoption profile; clearer express patent provisions than MIT. More notice/compliance text than MIT. |
| **AGPL-3.0** | Strong copyleft with an additional network-interaction source-offer condition for a modified version: remote users must be offered the corresponding source of that version. | **Medium, not zero.** A competitor modifying covered Growvidence code for its hosted service generally cannot keep those covered modifications closed from remote users. However, the competitor may host an unmodified version, charge for hosting, and compete. Whether separate modules form a covered combined work is fact-specific. | Preserves user access to source for covered network modifications and aligns with a self-hostable community product. Some organizations, integrators, and contributors avoid AGPL because of copyleft/compliance concerns. |
| **BSL 1.1** | Source is visible, but production rights may be limited by an Additional Use Grant; each version has a Change Date and a Change License. It is source-available, not OSI open source during its restricted period. | **Potentially lower during the restriction period**, depending on the precise Additional Use Grant and Change Date. It can restrict production use in ways an open-source license cannot. It does not eliminate competition after the Change Date. | Poor fit for the stated promise “open source now and free for learners.” Learners, schools, and community users may have difficulty understanding production-use boundaries. Delayed conversion can be reassuring, but the restrictions reduce trust and compatibility. |
| **Open-core model** | Keep a defined core under an open-source license and develop separate proprietary modules/services. This is a business/product model, not a license. | **Depends on the core license.** Proprietary extensions may differentiate the official service, but an open core can still be hosted by competitors. Pairing with AGPL can require source for covered modifications; pairing with MIT/Apache cannot. | Can fund hosted operations and advanced services while keeping a useful core open. Risk: community distrust if essential learner workflows are moved behind a paywall or the boundary is unclear. Requires architecture, contribution, and licensing discipline. |

### Key distinction: AGPL does not ban paid hosting

AGPL-3.0 is the strongest fit among the listed open-source licenses for requiring publication of modifications to covered code used in a network service. Section 13 applies when the operator modifies the program; it does not simply make every operator publish source merely because they run an unmodified copy. The source offer is for the corresponding source of the modified version to users interacting with it remotely.

Therefore, AGPL reduces the closed-modification advantage of a hosted competitor, but cannot stop a competitor from charging for an unmodified deployment, hosting, support, or a separately developed service. It also cannot prevent a fork that complies with the license from competing with the official hosted service.

## Proposed recommendation

**Proposed: AGPL-3.0 for the Growvidence application core, with a carefully bounded open-core services strategy.**

This recommendation best balances the stated wish to keep the product genuinely open source while reducing the ability to keep modifications to the hosted core private. It is not a guarantee against competing hosted products.

### What should stay open

The following should remain in the AGPL-licensed core and available to self-hosters:

- The learner-facing task, planning, learning-log, and evidence workflows.
- The competency model, criteria, and evidence-status rules.
- Core data model, migrations, and documented integration interfaces.
- Import, export, and user data portability.
- Core privacy, security, and accessibility improvements.
- A usable single-learner experience that does not require a paid subscription.
- Modifications to the covered core, including those deployed as a network service, to the extent required by AGPL-3.0.

Do not make basic learning, recording evidence, or exporting a learner's own data dependent on a paid cloud plan.

### What may be commercial

The business may charge for services and genuinely separate components, subject to license review:

- Managed hosting, backups, operations, uptime commitments, and support.
- Optional cloud sync and multi-device convenience.
- Classroom/team administration, onboarding, support, and organization operations.
- Paid assessment, human review, certificate issuance, verification, and related services.
- Billing, customer support operations, and other independent business systems.

A separate service is not automatically outside AGPL merely because it runs in another process, repository, or server. Tight integration, shared code, linking, and whether components form a work based on the AGPL program are legal and technical questions. Keep boundaries explicit, document APIs, avoid copying AGPL code into proprietary components, and obtain legal review before shipping closed modules that interact closely with the core.

For certificates, keep the rubric, evidence expectations, and meaning of a credential transparent. A paid certificate must not be represented as an accredited qualification unless the relevant accreditation actually exists.

### Why not MIT or Apache-2.0?

They would maximize permissive adoption and reduce contributor friction. Apache-2.0 is preferable to MIT if a permissive license is selected because it includes an express patent grant. But neither addresses the stated concern about a competitor keeping modifications to a hosted clone private. They remain valid alternatives if future research shows that adoption and integration matter more than network copyleft.

### Why not BSL?

BSL could impose production-use limits, but it would make the restricted code source-available rather than open source during the restriction period. That conflicts with the current public goal. Reconsider only if the maintainer intentionally changes the promise from “open source now” to a source-available commercial model and clearly communicates that change.

### Why not open-core alone?

Open-core can describe how paid services are built, but it does not answer what rights users have to the core. It must be paired with a license. The proposed combination is AGPL-licensed core plus separate commercial services, not a promise that every future feature can be proprietary.

## Contributor policy: DCO first; CLA only for a deliberate change

**Proposed initial approach: use the Developer Certificate of Origin (DCO), not a broad CLA.**

- Ask contributors to sign off each commit (for example, a `Signed-off-by:` line) to certify that they have the right to submit the contribution under the project's stated license.
- A DCO is lightweight and does not transfer copyright or, by itself, grant the project broad relicensing rights.
- This is easier to explain to student and community contributors and better matches an inbound-equals-outbound model: contributions are accepted under the same public license as the project.
- Do not describe a DCO as a copyright assignment or as permission to relicense contributions under proprietary terms.

A CLA can be useful if the project later has a clear need for dual licensing or broader relicensing authority. But the exact CLA matters: it may grant the project a broad right to sublicense/relicense while the contributor retains copyright, or it may use a different structure. That additional control can create a trust cost and deter contributors. If a CLA is ever considered, explain its rights in plain language, obtain legal advice, and do not introduce it retroactively as though existing DCO contributions already grant those rights.

## Relicensing and future flexibility

- **Future versions:** The copyright holder(s) may license future versions under a different license only to the extent they control all relevant rights or have obtained the necessary permissions. Earlier releases remain available under the license terms already granted; changing the current repository license does not withdraw existing recipients' rights to copies already received.
- **DCO contributions:** With a DCO-only, inbound-equals-outbound policy, assume that permission from every relevant copyright holder is needed before relicensing their contributions under different or proprietary terms. A DCO does not provide a general relicensing grant.
- **CLA contributions:** A carefully drafted CLA may permit dual licensing or relicensing without obtaining fresh permission for each contribution. This is a material governance decision, not a formality.
- **Copyright assignment:** Assignment can centralize ownership and licensing control, but is a much stronger ask and may be unacceptable to community contributors.
- **Practical fallback:** If the project does not have the rights needed to relicense a contribution, retain it under its existing license, seek separate permission, or replace/rewrite it without copying protected expression. Do not assume a contributor's public pull request means the project owns the contribution.
- **Dual licensing:** Possible only where the project has sufficient rights in all code being offered under both licenses, and where third-party dependencies and notices permit the proposed distribution.

The safest way to preserve trust is to make the initial license and contribution policy explicit before accepting outside code, rather than relying on a later relicensing plan.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| AGPL deters some commercial adopters or contributors | Explain the license plainly; keep APIs documented; evaluate actual partner feedback before changing license strategy. |
| Competitor sells a compliant hosted fork | Compete on service quality, trust, support, integrations, and community; do not claim AGPL prevents paid hosting. |
| Proprietary service boundary is unclear | Maintain an architecture and dependency review for every proposed closed component; obtain legal review before release. |
| Essential features migrate behind a paywall | Keep the stated open-core commitments in product policy and review scope changes publicly. |
| Contributor rights are unclear | Adopt a written DCO process before accepting outside code; track provenance and third-party licenses. |
| Certificates are misunderstood as accreditation | Publish transparent criteria and state credential status and limitations accurately. |

## Decision and approval checklist

This ADR is **Proposed**, not an adopted license decision.

Before implementation begins accepting external contributions or publishing a release:

1. Maintainer decides whether AGPL-3.0 is acceptable for the core or whether permissive adoption is more important.
2. Obtain legal advice on the intended AGPL architecture, especially cloud sync and proprietary classroom/team services, in relevant jurisdictions.
3. Choose and publish the contribution mechanism (DCO or a reviewed CLA) before accepting external contributions.
4. Audit dependency licenses and third-party assets for compatibility.
5. If approved, add the exact canonical license text and update README, contribution guidance, and repository metadata consistently.
6. Keep this ADR and the product's open-core boundary current as commercial features are designed.

**No `LICENSE` file is added by this ADR update. No license has been selected or adopted.**

## Not legal advice

This document is a product and engineering decision aid, not legal advice. License interpretation, copyright ownership, derivative-work boundaries, patent rights, contributor agreements, privacy obligations, certification rules, and enforceability vary by facts and jurisdiction. Obtain advice from qualified counsel before adopting a license, accepting a CLA, or launching proprietary services alongside AGPL-licensed code.

## Reference texts and guidance

- Open Source Initiative — [Open Source Definition](https://opensource.org/osd/)
- Open Source Initiative — [FAQ: commercial use and open source](https://opensource.org/faq)
- Apache Software Foundation — [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) and [licensing FAQ](https://www.apache.org/foundation/license-faq.html)
- GNU Project — [GNU AGPL version 3](https://www.gnu.org/licenses/agpl-3.0.en.html)
- MariaDB — [Business Source License 1.1 text](https://mariadb.com/bsl11/) and [BSL adoption FAQ](https://mariadb.com/bsl-faq-adopting/)
- Eclipse Foundation — [Developer Certificate of Origin 1.1](https://www.eclipse.org/legal/dco/dco.html)
- Linux Foundation — [DCO and contribution mechanisms guidance](https://bestpractices.linuxfoundation.org/ip/contribution-mechanisms.html)
- European Commission Interoperable Europe — [Licences and complementary agreements](https://interoperable-europe.ec.europa.eu/collection/eupl/licences-complementary-agreements)
