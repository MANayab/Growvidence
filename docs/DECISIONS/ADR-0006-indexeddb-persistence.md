# ADR-0006: Browser-local persistence with IndexedDB

- **Status:** Accepted — maintainer approved on 2026-11-21
- **Date:** 2026-11-21
- **Scope:** Local-only MVP persistence; no database package or schema is implemented by this ADR

## Context and constraints

The MVP is static on GitHub Pages and has no account, backend, server database or cloud sync. Learner records must remain on the user's device/browser profile. IndexedDB is asynchronous structured storage, but it is not encrypted storage, not a backup and not guaranteed to survive browser cleanup, profile loss, device failure or quota pressure.

Persistence must be hidden behind typed repositories so UI components do not issue raw IndexedDB requests. Schema evolution, failed upgrades, quota errors, export/import and explicit deletion must be designed before feature implementation.

## Library comparison

| Option | Advantages | Costs and risks | Assessment |
|---|---|---|---|
| **idb** | Small promise-based wrapper around native IndexedDB; exposes native transactions and upgrade hooks; relatively little abstraction. | Application owns query helpers, schema migration discipline and repository ergonomics. | **Recommended** for the initial bounded data model. |
| Dexie | Rich table API, indexes, query helpers, transaction ergonomics and mature migration patterns. | More abstraction and dependency surface than currently needed; query API may become a second domain language to learn. | Strong alternative if query complexity grows. |
| Raw IndexedDB | No additional dependency; full browser API control. | Verbose request/event handling; transaction lifecycle and error handling are easier to get wrong; more boilerplate and testing burden. | Not recommended for application-level direct use. |

## Proposed decision

Use **`idb` behind a typed repository/storage adapter**. UI and domain services must not import `idb` or access `indexedDB` directly. Keep schema definitions and migrations in one persistence module. Accepted on 2026-11-21 for implementation planning. Do not add the package until a separate implementation PR is approved.

Choose Dexie instead if implementation demonstrates that required multi-index queries, live queries or migration complexity materially exceed the small adapter's needs. Do not add both libraries. Raw IndexedDB is reserved for the adapter internals only if a narrowly scoped browser feature is unsupported by the wrapper.

## Database boundary and stores

Initial logical stores (subject to schema implementation tests):

| Store | Primary key | Indexes / purpose |
|---|---|---|
| `meta` | `key` | `schemaVersion`, export metadata, last successful backup timestamp |
| `tracks` | `id` | `updatedAt`; learner-defined learning tracks |
| `tasks` | `id` | `trackId`, `status`, `dueAt`, `updatedAt` |
| `journalEntries` | `id` | `taskId`, `createdAt` |
| `competencies` | `id` | `slug`, `rubricVersion`; seeded rubric definitions, not user mastery |
| `assessments` | `id` | `competencyId`, `status`, `updatedAt` |
| `evidence` | `id` | `journalEntryId`, `createdAt` |
| `evidenceLinks` | `id` | `evidenceId`, `criterionId` |
| `reviews` | `id` | `evidenceId`, `createdAt` |

All mutable user-owned records have stable IDs, `schemaVersion`, `createdAt`, `updatedAt` and nullable `deletedAt`. Static rubric definitions can be versioned as application data; learner assessment records reference a specific rubric version. No account/user table is needed in the local-only MVP. Tombstones for distributed sync are deferred until a separate sync ADR.

## Schema versioning and migrations

- Store a monotonically increasing integer database version in the IndexedDB database version and a matching metadata record.
- Each version upgrade is an ordered, deterministic migration in the single database-open adapter.
- Migrations must be synchronous within IndexedDB's `versionchange` transaction; do not await network requests or unrelated asynchronous work inside it.
- Migrations must preserve existing records, create required indexes, and be covered by fixtures for every supported prior version.
- If an upgrade fails or is blocked by another open tab, show a recoverable message; do not silently delete/recreate the database.
- Close connections on `versionchange` and prompt the user to reload stale tabs.
- Unsupported future versions must open in a read-only recovery/error state where possible; never downgrade by overwriting newer data.

## Quota, availability and failure behavior

- Catch `QuotaExceededError`, `UnknownError`, `AbortError`, `InvalidStateError` and unavailable/private-browsing storage failures at the repository boundary.
- Preserve unsaved form content in current in-memory UI state when a write fails; tell the user that the save did not complete and offer retry/export guidance.
- Never silently delete older records or evidence to free space.
- Where supported, use `navigator.storage.estimate()` for advisory usage information and consider `navigator.storage.persist()` only with clear explanation; neither guarantees permanent storage.
- Do not store binary attachments in the first MVP. Store descriptive metadata and user-provided external artifact references only. Warn that external references may be private, mutable or unavailable.
- No learner data in localStorage, sessionStorage, URLs, Cache Storage, service-worker caches, telemetry or logs. IndexedDB is the sole planned durable application store; in-memory state is allowed while editing.

## Backup, restore and browser cleanup

- JSON is the full-fidelity backup; CSV is a convenience export and must never be presented as a restorable backup.
- Show last successful export date (or “No backup yet”) and a dismissible reminder 30 days after the last successful export, plus a first-export prompt after meaningful local history accumulates.
- Offer export before destructive reset. Provide per-record “Permanently delete” and “Delete all local data” actions with explicit confirmation and post-delete verification. Soft-deleted records remain in JSON backups until permanently deleted.
- Explain during onboarding and in settings that clearing browser site data, uninstalling the browser, private browsing cleanup or device loss can remove records. Growvidence cannot recover them.
- Reject import files larger than 10 MiB before parsing, then validate the complete package and relationships.
- Show a preview, then offer exactly two modes: “Replace everything” and “Merge (newer updatedAt wins)”. Merge adds new IDs and replaces matching IDs only when imported updatedAt is newer; equal timestamps retain local records.
- Per-record conflict choices are deferred beyond MVP. Apply the selected mode atomically; any validation/write failure aborts and preserves the prior dataset. Replace everything requires explicit confirmation and a pre-import export prompt.
- Browser deletion is best-effort at the origin boundary; it cannot delete exported files, browser backups, screenshots or copies stored elsewhere.

## Security and privacy boundaries

IndexedDB is not encryption and does not protect data from malicious same-origin JavaScript, browser extensions with access, device compromise or another person using the same unlocked profile. Do not claim otherwise. Avoid third-party scripts and remote calls. Treat imported JSON as untrusted input: enforce size limits, schema validation, safe rendering and referential integrity before persistence.

## Consequences

- Local-only operation remains the default and only MVP mode.
- No sync protocol, account identity, cloud backup, multi-device conflict resolution or server authorization is defined here.
- Repository adapter and migration tests are required before app features depend on storage.
- A future sync feature needs a separate ADR and consent/security review.

## References

- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [idb documentation](https://github.com/jakearchibald/idb)
- [Dexie documentation](https://dexie.org/docs)

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
| 12 | Deletion | Accepted: soft-deleted records remain in JSON backups; per-record Permanently delete and Delete all local data; no timed purge. |

### Competency levels — NEEDS APPROVAL

- **Demonstrated (NEEDS APPROVAL):** every mandatory criterion has at least one independent artifact.
- **Consistent (NEEDS APPROVAL):** the demonstration is repeated in a different task or context.
- Proposed Consistent corroboration: external review weight 2, self review weight 1. Reviews cannot replace the required independent artifact or repeated demonstration.
