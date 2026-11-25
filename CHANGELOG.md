# Changelog

All notable changes to Growvidence will be documented here. This project follows Keep a Changelog. Versions use Semantic Versioning while the project is pre-1.0.

## [Unreleased]

### Added
- Slice 2: local learning-track and task management, list/status-board views, date-based views, and task/track lifecycle actions. Merged in PR #12.
- Slice 3 (PR #13 review branch): learning journal with local canonical `date` (replaces and removes `attemptedAt`), learned/blocked/next fields, AI-use disclosure modes, filters, summaries, delete lifecycle and IndexedDB v4 migration. Exact-head CI passed; maintainer reports 46 tests and bundle 102.31 KiB gzip. Not merged or deployed
- Draft release notes for proposed 0.2.0 milestone.

## [0.2.0] — Draft

### Added
- Phase 0: product principles, initial scope, architecture direction, data-model/ADR groundwork, quality gates and repository governance.
- Phase 1: public static Astro site, responsive layout, metadata and structured data, crawler files, GitHub Actions CI and Pages deployment.
- Slice 1: /app/ shell, React island/hash navigation, local theme preference, IndexedDB v2 persistence foundation and settings/track repository groundwork.
- Slice 2 (PR #12 merged): track management, optional user-added starter tracks, task create/edit/statuses, list and status-board views, daily/weekly/monthly due-date views, IndexedDB v3 task store and migrations.
- Slice 3 (PR #13 review branch): Journal workflow, AI-use disclosures, filters/summaries, and IndexedDB v4 migration; CI green, awaiting review.

### Changed
- CI verification and app bundle-size reporting for the Slice 2 review branch.

### Known status
- Version 0.2.0 is a proposed release milestone only. Slice 2 is merged. Slice 3 is implemented and CI-verified in draft PR #13 but remains under review and is not yet released; inclusion in a published 0.3.0 release depends on maintainer merge and final verification.
- Competency assessment, evidence manager, backup/import/export, dashboard and PWA remain unimplemented.
- License remains undecided.
