# Changelog

All notable changes to Growvidence will be documented here. This project follows Keep a Changelog. Versions use Semantic Versioning while the project is pre-1.0.

## [Unreleased]

### Added
- Root MIT License and `package.json` license metadata.
- Public `/privacy/` page documenting browser-local storage and site hosting/privacy boundaries.
- Slice 2: local learning-track and task management, list/status-board views, date-based views, and task/track lifecycle actions. Merged in PR #12.
- Slice 3 (PR #13 merged): learning journal with local canonical `date`, learned/blocked/next fields, AI-use disclosure modes, filters, summaries, delete lifecycle and IndexedDB v4 migration.
- Draft release notes for proposed 0.2.0 milestone.

## [0.2.0] — Draft

### Added
- Phase 0: product principles, initial scope, architecture direction, data-model/ADR groundwork, quality gates and repository governance.
- Phase 1: public static Astro site, responsive layout, metadata and structured data, crawler files, GitHub Actions CI and Pages deployment.
- Slice 1: /app/ shell, React island/hash navigation, local theme preference, IndexedDB v2 persistence foundation and settings/track repository groundwork.
- Slice 2 (PR #12 merged): track management, optional user-added starter tracks, task create/edit/statuses, list and status-board views, daily/weekly/monthly due-date views, IndexedDB v3 task store and migrations.
- Slice 3 (PR #13 merged): journal workflow, AI-use disclosures, filters/summaries, and IndexedDB v4 migration.

### Changed
- CI verification and app bundle-size reporting for the Slice 2 review branch.

### Known status
- Version 0.2.0 remains a historical draft milestone. Slice 2 and Slice 3 are merged. The v0.3.0 tag and published GitHub pre-release already exist; this PR does not change either
- Competency assessment, evidence manager, backup/import/export, dashboard and PWA remain unimplemented.
- License status in this draft is historical; the MIT license decision is adopted in the current legal/privacy PR.
## Unreleased — Slice 4 draft
- Add competency rubric configuration, evidence and review records, computed statuses, and v5 migration.
- Add tests for status boundaries and migration behavior.
- Add a separate privacy wording proposal; privacy page unchanged.



## Unreleased — Slice 4 draft integrity work (2026-11-27)
- Correct competency calculation to exclude future-dated/invalid evidence from qualifying and progress, and require chronological repeats at least 14 days later in distinct task/context.
- Remove competency elevation based on self-entered external-review labels.
- Validate evidence criterion and active journal/task links; validate review-to-active-evidence relationships.
- Add restore operations and deleted evidence/review recovery UI; permanent evidence deletion cascades to reviews.
- Add domain and repository regression tests. All changes remain draft and pending maintainer-local verification.
