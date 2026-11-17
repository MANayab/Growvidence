# ADR-0002: License strategy and monetization options

- **Status:** Proposed — maintainer approval and, if needed, legal advice required
- **Date:** 2026-11-18

## Context

The project should be open source initially while preserving the possibility of sustainable commercial offerings later. A license must be selected deliberately; “open source” and “open core” are not interchangeable, and changing license strategy later can be difficult when outside contributions exist.

## Options

| Option | What it generally permits / requires | Commercial implications |
|---|---|---|
| MIT | Permissive reuse, modification, distribution, sublicensing, and sale, subject to retaining copyright and license notices | Low friction for commercial use, including competing hosted offerings; does not reserve proprietary extensions |
| Apache-2.0 | Permissive use with explicit patent license and notice / attribution requirements | Commercial-friendly; more detailed compliance obligations than MIT |
| AGPL-3.0 | Strong copyleft; modified covered software offered for network interaction generally triggers source-offer obligations to those users | Can discourage closed hosted forks, but imposes obligations on a commercial operator and downstream integrators |
| BSL (Business Source License) | Source-available with time-limited or field-of-use restrictions and a change license; not OSI-approved open source during the restricted period | May protect a business model, but should not be described as open source while restrictions apply |
| Open-core model | Product strategy: an open-licensed core plus separately licensed proprietary additions | Not itself a software license; requires clear boundaries, contributor/IP policy, and careful license compatibility |

License summaries above are high-level orientation, not legal advice. Exact terms depend on the selected license text, version, notices, dependencies, and distribution model.

## Recommendation for discussion

If the priority is a genuinely open-source project with the broadest adoption and a later ability to sell hosted services, support, or separately developed commercial services, **Apache-2.0** is a reasonable default candidate. It includes an express patent grant and permits commercial use, but it does not prevent others from offering competing services.

If preventing closed hosted modifications is more important than permissive adoption, evaluate **AGPL-3.0** with legal advice. If the priority is proprietary control during an initial period, BSL may fit a source-available strategy, but it conflicts with describing the restricted version as open source.

An open-core strategy can be paired with a license for the core, but requires a deliberate contribution and ownership policy. Do not assume a permissive license automatically protects future paid features.

## Approval required

No license has been selected. Do not add a `LICENSE` file, badge, or “open source” legal claim until the maintainer approves a license and confirms all contributors can grant the necessary rights. Review official license texts and dependency compatibility before release.

## Reference texts

- MIT License: https://opensource.org/license/mit/
- Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0
- GNU AGPL v3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
- Business Source License: https://mariadb.com/bsl11/
- Open Source Definition: https://opensource.org/osd/
