# Growvidence — product mind

## Vision
Help learners turn practice into demonstrable capability with transparent evidence of independent work, AI assistance and remaining learning needs.

## Promise
**Don't just learn. Prove your progress.** Not a certification or employment guarantee.

## Personas
- IT beginner/student: needs structure and evidence.
- Self-taught learner/career changer: needs credible artifacts.
- Mentor/reviewer: needs context for useful feedback.

## Principles
1. Evidence before scores.
2. AI-assisted and independent work are distinguished.
3. Streaks and task completion never establish mastery.
4. Learners own their data; export is planned but not implemented.
5. Local-first; useful without account or cloud.
6. Accessible, responsive, low-bandwidth and beginner-friendly.
7. Public content is accurate, attributable and citable.
8. Be honest about uncertainty and product status.

## Six initial competency areas and proposed measurable criteria

**Important:** Every criterion below is a proposal and is marked **NEEDS APPROVAL**. These are internal learning rubrics, not external certifications. Until the maintainer approves a criterion and its rubric version, it must not be used to set a competency to “Demonstrated” or “Consistent”.

### 1. Independent coding
- **IC-1 — Implement from a requirement (NEEDS APPROVAL):** From a written requirement and acceptance examples, produce a working implementation; explain key decisions and demonstrate it without relying on generated code during the demonstration.
- **IC-2 — Modify unfamiliar code (NEEDS APPROVAL):** Make a scoped change in an unfamiliar codebase, identify affected files, and show a passing regression test or equivalent verification.
- **IC-3 — Explain and adapt (NEEDS APPROVAL):** Explain the implementation's inputs, outputs, edge cases and trade-offs, then make a small unprepared change and verify it.

Evidence: versioned source diff/repository reference, runnable demo or test output, short explanation, and an independently performed follow-up task. A repository link alone is insufficient.

### 2. Debugging
- **DB-1 — Reproduce and isolate (NEEDS APPROVAL):** Reproduce a defect with a minimal case and record expected versus actual behavior.
- **DB-2 — Form and test hypotheses (NEEDS APPROVAL):** Record at least two plausible causes, use logs/tests/debugger evidence to narrow them, and explain why the selected cause fits.
- **DB-3 — Verify the fix (NEEDS APPROVAL):** Implement a fix, add a regression test, and show that the test fails before the fix and passes after it where practical.

Evidence: issue/reproduction steps, failing/passing test output, focused diff and reasoning. A claim that “it works now” without a reproducible check is insufficient.

### 3. Architecture
- **AR-1 — Describe system boundaries (NEEDS APPROVAL):** Create a component/data-flow diagram identifying responsibilities, trust boundaries and external dependencies.
- **AR-2 — Compare alternatives (NEEDS APPROVAL):** Write a decision record comparing at least two feasible options against explicit constraints and trade-offs.
- **AR-3 — Evolve safely (NEEDS APPROVAL):** Demonstrate a backward-compatible change or documented migration, including failure/rollback considerations and tests.

Evidence: versioned architecture/decision document, diagrams, migration or compatibility tests, and explanation of a trade-off. Diagram aesthetics alone are not evidence.

### 4. Testing
- **TE-1 — Test behavior and boundaries (NEEDS APPROVAL):** Write automated tests for normal, invalid and boundary inputs around a meaningful behavior.
- **TE-2 — Diagnose a regression (NEEDS APPROVAL):** Demonstrate a test that fails for a known defect, then passes after a focused fix.
- **TE-3 — Verify a user journey (NEEDS APPROVAL):** Automate a critical browser journey and record environment, command and result; identify what remains untested.

Evidence: test source, repeatable command/output, test fixture or defect reference and explanation of coverage limitations. A green badge without test context is insufficient.

### 5. Commercial validation
- **CV-1 — Identify a specific problem (NEEDS APPROVAL):** Define a target user segment, problem statement and assumptions without presenting guesses as facts.
- **CV-2 — Gather ethical user evidence (NEEDS APPROVAL):** Conduct and summarize a small set of consent-based interviews/usability sessions; separate direct observations from interpretation and protect personal data.
- **CV-3 — Test a value proposition (NEEDS APPROVAL):** Run a low-cost, non-deceptive validation experiment with a predeclared success/stop criterion and report negative as well as positive results.

Evidence: anonymized research plan/notes, consent-aware methodology, experiment artifacts and decision summary. Likes, views, waitlist counts or founder opinion alone do not establish demand or willingness to pay.

### 6. Technical fundamentals
- **TF-1 — Explain core concepts (NEEDS APPROVAL):** Explain a relevant language/runtime, browser/network or data concept accurately in the learner's own words and connect it to a working example.
- **TF-2 — Apply the concept (NEEDS APPROVAL):** Implement a small example and demonstrate expected behavior with a test, trace or inspection.
- **TF-3 — Reason about failure and safety (NEEDS APPROVAL):** Identify a realistic failure/security/performance boundary and demonstrate a mitigation or clearly bounded limitation.

Evidence: concise explanation, executable example, test/trace and a failure-case analysis. Memorized definitions without application are insufficient.

## Proposed competency assessment rule

**NEEDS APPROVAL — Demonstrated:** every mandatory criterion has at least one independent artifact.

**NEEDS APPROVAL — Consistent:** the demonstration is repeated in a different task or context.

Proposed Consistent corroboration weights: external review = 2; self review = 1. Reviews cannot replace the independent artifact or repeat demonstration. Evidence must disclose AI assistance; AI-assisted work cannot alone prove independent implementation.

Use “Not assessed”, “Emerging”, “Developing”, “Demonstrated”, “Consistent” and “Needs more evidence”. Demonstrated and Consistent remain NEEDS APPROVAL. Keep rationale and missing criteria visible. Do not produce a single opaque score or infer mastery from task counts, streaks, time spent or AI confidence.

## Evidence record
Capture attempted work, understanding, AI-use disclosure, independent implementation, artifact/test/reviewer evidence, linked criteria and remaining uncertainty. Every journal/evidence record must disclose AI assistance as unassisted, assisted, partially assisted, unknown or not recorded.

## Platform constraints
- GitHub Pages static hosting only in MVP; no server, database, runtime SSR, API routes or account system.
- Tracks, tasks and journal data are stored locally in IndexedDB. JSON backup/export, import and CSV export are planned, not implemented.
- Public pages indexable; app pages noindex and excluded from sitemap.
- PWA/offline is optional future scope; requires explicit approval.
- Optional future backend for opt-in sync/accounts requires a separate decision.
- Never silently upload learner data or place it in URLs, localStorage/sessionStorage, Cache Storage or telemetry.

## Content principles
Semantic HTML, unique accurate metadata, canonical URLs, answer-first explanations, visible relevant FAQs and structured data matching visible content. No ranking guarantees.

## Non-goals
Guaranteed rankings, employment or accreditation; opaque AI mastery scores; mandatory cloud accounts in MVP; native app before PWA evidence; paid gates before license and market validation.

## Decisions log — 2026-11-21

| # | Decision | Outcome |
|---|---|---|
| 1 | Workspace UI | Accepted: Astro static site with React islands; Preact only if measured bundle constraints justify it. |
| 2 | IndexedDB | Accepted: idb behind a typed repository adapter. |
| 3 | Competency levels | NEEDS APPROVAL: Demonstrated and Consistent definitions remain proposed. |
| 4 | Import limit | Accepted: 10 MiB; reject larger files before parsing/writing. |
| 5 | Import modes | Accepted: preview, then “Replace everything” or “Merge (newer updatedAt wins)”; atomic application. Per-record choices deferred. |
| 6 | Backup reminders | Accepted: dismissible reminder 30 days after last successful export, plus first-export prompt after meaningful data accumulates. |
| 7 | Evidence URLs | Accepted: HTTP/HTTPS only; reject other schemes; external links use rel="noopener noreferrer"; never fetch, preview or embed. |
| 8 | Reviews | Accepted: reviewerType is self or external; clearly distinguish in UI. Proposed Consistent corroboration weight: external 2, self 1. |
| 9 | CSV | Accepted: task-centric convenience export; neutralize cells beginning with =, +, - or @; unit tests required. JSON is full backup. |
| 10 | PWA | Accepted: defer until after Slice 7; separate explicit approval required. |
| 11 | Bundle/charts | Accepted: 200 KiB gzip initial workspace JS excluding Astro-shared assets; hand-built SVG or lazy-loaded charts; bundle-size check required. |
| 12 | Deletion | Per-record soft-delete and permanent-delete are implemented for tracks, tasks and journal. Delete-all is not implemented; no timed purge. |
| 13 | License strategy | Accepted: MIT; earlier AGPL/open-core proposal considered and rejected for broad adoption and simple permissive licensing. |

### Competency levels — NEEDS APPROVAL

- **Demonstrated (NEEDS APPROVAL):** every mandatory criterion has at least one independent artifact.
- **Consistent (NEEDS APPROVAL):** the demonstration is repeated in a different task or context.
- Proposed Consistent corroboration: external review weight 2, self review weight 1. Reviews cannot replace the required independent artifact or repeated demonstration.


## Slice 3 journal contract
- Journal learning date is the single canonical `date` field: local date-only `YYYY-MM-DD`, never converted through UTC. `attemptedAt` is removed and must not be stored.
- Entries include title, learned, blocked, next, optional trackId/taskId, confidence 1–5, minutesSpent, and AI-use disclosure.
- AI disclosure states are assisted, unassisted, partially_assisted, unknown and not_recorded. New/imported entries default to not_recorded; unknown and not_recorded remain separate and are never treated as unassisted.

## Slice 4 competency defaults — NEEDS APPROVAL
All six criterion rubrics and assessment thresholds are defaults marked **NEEDS APPROVAL** in this file and `docs/DATA_CONTRACTS.md`. Rules are centralized in `src/domain/competencyRules.ts`. Computed levels: Not started, In progress, Demonstrated, Consistent. Demonstrated requires all mandatory criteria with valid evidence. Consistent requires a repeat in a distinct task/context at least 14 days later or an external confirmation. Self reviews cannot establish Consistent. IC-1 and IC-3 require a linked journal entry explicitly marked unassisted; unknown/not_recorded never qualify. Task completion is irrelevant. Evidence does not expire; show a may-be-stale hint after 180 days.


## Slice 4 implementation trust boundary — updated 2026-11-27
Competency status is calculated from qualifying evidence, not completed tasks. Future-dated evidence is excluded from qualification and consistency repeats must be chronological, at least 14 days apart, and differ by task/context. Review labels are self-entered, not authenticated: a record labeled external is not independently verified and cannot by itself elevate status to Consistent. Rubric criteria and status thresholds remain **NEEDS APPROVAL**. Do not claim certification, job readiness or independent verification from this app's local review form.


### Linked-record integrity update — 2026-11-27
Competency computation now guards active linked journal/task references: missing or deleted linked records are excluded from status progress and qualifying evidence. This does not change rubric thresholds; they remain NEEDS APPROVAL. Tests await local verification.
