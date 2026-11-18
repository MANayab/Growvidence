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


## Contribution and commercialization model decision table

The project currently has **no outside contributors**. Therefore, choosing between these models is a low-cost governance decision today, provided the maintainer owns or controls the copyright in all project-authored code and has not incorporated third-party code on incompatible terms. The absence of outside contributors does not remove third-party dependency obligations, and it does not mean the project owns dependency code.

| Model | Core and commercial rights | Contribution method normally needed | Fit for Growvidence's goals | Main trade-off |
|---|---|---|---|---|
| **Open-core + DCO** | Keep the learner-facing core under one public open-source license (the current proposal is AGPL-3.0). Build paid cloud hosting/sync, classroom operations, support, and certificate services as separate offerings; only genuinely separate proprietary code stays closed. | **DCO** is normally sufficient for an inbound-equals-outbound contribution model: contributors certify they have the right to submit code under the project's public license. It does not assign copyright or grant a general right to relicense their contributions. | **Best current fit.** Learners can use and self-host the core for free. Revenue can come from hosted convenience, operations, collaboration services, and human assessment while the useful core remains open. | AGPL's copyleft boundary may make tightly integrated proprietary extensions difficult. DCO does not give the maintainer unilateral dual-licensing rights over outside contributions. |
| **Dual licensing + CLA** | Offer the same project code under AGPL-3.0 for community use and a separate commercial license to customers who need different terms (for example, proprietary integration or removal of AGPL obligations). | A **carefully drafted CLA** is normally used to obtain the necessary copyright license and explicit sublicensing/relicensing permission from contributors. A CLA is not automatically a copyright assignment; its exact grant controls. | Could support enterprise licensing and proprietary integrations later, while free AGPL use remains available. It may fit if customers specifically need a commercial license to the same core code. | More legal administration and contributor friction; broad relicensing rights can reduce community confidence. It does not itself create demand for a commercial license, and it does not make independently developed paid services proprietary by magic. |
| **Open-core + CLA** | Same open core and separate commercial services as above, but with broader contributor rights reserved for future relicensing or proprietary reuse. | CLA granting only the rights actually needed; DCO may still be used for sign-off but does not replace the CLA's relicensing grant. | Provides more future flexibility if the maintainer later wants to move selected contributions into a commercial edition. | More contributor paperwork and trust cost than the current project needs. Do not collect broad rights “just in case.” |
| **Dual licensing + DCO only** | Maintainer can dual-license code whose rights they control, but cannot assume they can offer third-party contributions under a second license. | DCO supports contribution under the public license; it is **not sufficient by itself** to grant broad dual-licensing authority over contributors' code. | Possible while the code is entirely maintainer-authored, but becomes difficult as external contributions accumulate. | Future permissions may need to be requested contributor by contributor; some contributions may need to be excluded or rewritten. |

### Proposed choice for now

**Proposed: open-core with AGPL-3.0 core + DCO, not dual licensing + CLA at this stage.**

This matches the present goal: keep the core genuinely open and free for learners, while charging later for the managed service, sync convenience, classroom/team operations, support, and transparent human assessment/certificate services. Keep essential learning, practice, evidence recording, and learner data export in the open core.

Because there are no outside contributors yet, this choice is **not costly or difficult to change today**. Before accepting outside contributions, publish the selected license and contribution process. If a concrete customer later requires proprietary licensing of the same core, revisit dual licensing and introduce a narrowly drafted CLA prospectively, after legal review and clear contributor communication. Do not imply that DCO sign-offs already grant those rights.

The distinction is important: **open-core + DCO** is a product strategy with one open license for the core; **dual licensing + CLA** is a rights strategy that may let the copyright holder offer the same code under multiple licenses. A CLA is not required merely to sell hosting, support, classroom administration, or a separate assessment service.

## Mobile distribution: AGPL and app stores

AGPL-3.0 does not contain a blanket statement that an app may never be distributed through an app store. The practical issue is whether the store's developer/distribution agreement and end-user terms impose additional restrictions that conflict with the freedoms and conditions required by AGPL-3.0, and whether the app conveys the corresponding source and any required installation information. This needs a review of the exact store terms, release method, app packaging, and user-product status at the time of submission.

- **Apple App Store:** Apple's developer agreement controls distribution through the App Store and includes program, distribution, and end-user licensing terms. Some standard store terms may conflict with the rights an AGPL recipient must retain (for example, restrictions on copying, modification, or redistribution). Do not assume an AGPL app will be accepted or that the standard agreement is compatible. Obtain specialist legal review and review the then-current Apple agreement and applicable EULA before submission.
- **Google Play:** Google Play distribution is governed by Google's Developer Distribution Agreement and related program policies and user-facing terms. Do not assume compatibility or incompatibility from the store name alone; compare the current terms with AGPL-3.0 and the actual distribution arrangement before release. The exact app licensing, signing, update, and redistribution restrictions need review.
- **Other distribution:** Direct downloads, alternative Android stores, or open-source app catalogs may provide different terms, but each channel still needs a license and compliance review. Do not treat an alternative store as automatically compatible.

### Why PWA-first reduces the risk

The current PWA-first roadmap reduces this particular distribution risk because the first installable experience is delivered through the web, rather than being packaged and submitted under Apple App Store or Google Play distribution agreements. A PWA can be accessed through a browser and, where supported, installed from the browser without app-store listing approval.

PWA-first does **not** remove AGPL obligations for the server-side application, nor does it resolve every browser, hosting, or platform policy issue. If a native iOS or Android wrapper is later considered, treat store distribution as a separate legal and release gate. Re-check the current terms and obtain advice before building the wrapper around an AGPL-covered client.

## Preliminary dependency-license compatibility screen

This is a **pre-implementation screening of the proposed architecture**, not a completed software bill of materials (SBOM), legal opinion, or guarantee that every package/version is compatible. The repository has no application dependencies or lockfile yet. Exact versions, transitive dependencies, optional packages, generated code, fonts, icons, templates, and assets have not been selected or scanned. The license shown is the upstream project's currently published repository/package license located during this review; verify the exact package artifact and version at implementation time.

| Proposed component | Upstream license found | Preliminary AGPL-3.0 core assessment | Evidence / status |
|---|---|---|---|
| Next.js | MIT | **Generally compatible** as permissive code; retain required notices. | [Next.js license](https://github.com/vercel/next.js/blob/canary/license.md) — checked. |
| React | MIT | **Generally compatible** as permissive code; retain required notices. | [React repository](https://github.com/facebook/react) — repository identifies MIT; checked. |
| Tailwind CSS | MIT | **Generally compatible** as permissive code; retain required notices. | [Tailwind license](https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE) — checked. |
| shadcn/ui | MIT for the upstream component collection/repository | **Generally compatible** for components copied/used under that license; check each copied component, generated file, icon, and any separately sourced asset. | [shadcn/ui license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) — checked at repository level; generated/copied output still needs provenance review. |
| Radix UI Primitives | MIT | **Generally compatible** as permissive code; retain required notices. | [Radix Primitives license](https://github.com/radix-ui/primitives/blob/main/LICENSE) — checked. |
| Recharts | MIT | **Generally compatible** as permissive code; retain required notices. | [Recharts license](https://github.com/recharts/recharts/blob/main/LICENSE) — checked. |
| Prisma ORM | Apache-2.0 | **Generally compatible with AGPL-3.0** when incorporated in an AGPLv3-covered combined work, subject to Apache notice, attribution, and patent terms. GNU guidance says Apache-2.0 is compatible with GNU licenses version 3 and later; keep Prisma's license and notices. | [Prisma license](https://github.com/prisma/prisma/blob/main/LICENSE), [GNU license compatibility](https://www.gnu.org/licenses/license-compatibility.en.html) — checked at repository level. |
| Zod | MIT | **Generally compatible** as permissive code; retain required notices. | [Zod license](https://github.com/colinhacks/zod/blob/main/LICENSE) — checked. |
| Auth.js / NextAuth.js | ISC | **Generally compatible** as permissive code; retain required notices. | [Auth.js license](https://github.com/nextauthjs/next-auth/blob/main/LICENSE) — checked. |
| PostgreSQL | PostgreSQL License (permissive, similar to BSD/MIT) | **Generally compatible** as a separately licensed database dependency; preserve notices. A database server used as infrastructure is distinct from bundling its code into the application. | [PostgreSQL license](https://www.postgresql.org/about/licence/) — checked. |
| tRPC (optional API layer in the architecture proposal) | **Unverified in this review** | Do not approve for inclusion until the exact package and version's license and all relevant package subcomponents are checked. | Upstream license evidence not confirmed in this review. |

### Compatibility interpretation and implementation gate

- The permissive MIT and ISC licenses generally allow redistribution as part of a larger AGPL-licensed work, provided their notices and conditions are preserved.
- Apache-2.0 is compatible with GNU version 3 copyleft according to GNU's compatibility guidance; AGPLv3/GPLv3 compatibility is addressed in GNU's licensing guidance. Preserve Apache license copies, copyright notices, modification notices, and applicable NOTICE material.
- A dependency's permissive license does **not** mean the dependency itself is relicensed as AGPL when distributed separately. Preserve component-level license notices and identify third-party code.
- This review does not decide whether a particular integration, plugin, generated artifact, or service forms a derivative/combined work. Linking, bundling, generated code, and service boundaries need fact-specific review.
- Before the first implementation release, generate an SBOM from the committed lockfile (including production and development dependencies), scan every direct and transitive package, review licenses and notices, and resolve unknown, dual, custom, or source-available licenses. Record the tool, date, package version, detected license, and disposition.
- Re-run the review on dependency changes and before each release. Do not rely solely on package metadata; inspect the actual license text and notices for packages whose metadata is missing, ambiguous, or inconsistent.
- Keep this as a preliminary screen. It does not approve any dependency or replace counsel's review of the final distribution model.

### Sources for this screen

- GNU Project — [License compatibility and relicensing](https://www.gnu.org/licenses/license-compatibility.en.html)
- Apache Software Foundation — [Apache-2.0 and GPL compatibility explanation](https://www.apache.org/licenses/GPL-compatibility.html)
- Apple — [Apple Developer Program License Agreement](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- Google — [Google Play Developer Distribution Agreement](https://play.google.com/about/developer-distribution-agreement.html)
- GNU Project — [GNU AGPL version 3](https://www.gnu.org/licenses/agpl-3.0.en.html)

**Verification limitation:** The proposed stack is a design list, not a dependency manifest. Except for the upstream project licenses linked above, exact package versions and transitive dependency compatibility remain unverified. No dependency was installed, no SBOM was generated, and no license scanner was run in this documentation-only phase.
