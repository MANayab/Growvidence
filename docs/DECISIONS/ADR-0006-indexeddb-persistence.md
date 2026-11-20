# ADR-0006: Browser-local persistence with IndexedDB

- **Status:** Proposed — maintainer approval required before implementation
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

Use **`idb` behind a typed repository/storage adapter**. UI and domain services must not import `idb` or access `indexedDB` directly. Keep schema definitions and migrations in one persistence module. This is a proposal only; do not add the package until a separate implementation PR is approved.

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
- Show last successful export date (or “No backup yet”) and a dismissible reminder when the user has meaningful unsaved local history. Proposed default reminder threshold: 30 days after last successful export; maintainer approval required.
- Offer export before destructive reset. Provide a clear “Delete all local data” action with explicit confirmation and a post-delete verification result.
- Explain during onboarding and in settings that clearing browser site data, uninstalling the browser, private browsing cleanup or device loss can remove records. Growvidence cannot recover them.
- Import must validate the complete package and relationships before writing. Apply all records in one transaction where feasible; failure must leave existing data unchanged.
- The MVP's default import mode is **preview then merge by stable ID**: new IDs are added; matching IDs require a field-level conflict preview and explicit user choice. No silent last-write-wins. Full replace is a separate explicit destructive action.
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
