# Data model proposal — IndexedDB first

**Status:** Draft; no browser schema or database migration is implemented.

## Principles
- Task completion is activity, not proof of mastery.
- Learning entries record attempts and AI-use disclosure.
- Evidence and competency assessments are separate.
- Local records have stable IDs and schema versions for export/import and future sync.
- MVP has no server User row: the browser profile is the local data container, not an authenticated identity.

## Local entity relationship diagram

```mermaid
erDiagram
 LEARNING_TRACK ||--o{ TASK : groups
 TASK ||--o{ LEARNING_ENTRY : prompts
 LEARNING_ENTRY ||--o{ EVIDENCE : produces
 COMPETENCY ||--o{ COMPETENCY_CRITERION : defines
 COMPETENCY ||--o{ COMPETENCY_ASSESSMENT : assessed
 COMPETENCY_ASSESSMENT }o--o{ EVIDENCE : supported_by
 EVIDENCE ||--o{ REVIEW : receives
 LEARNING_TRACK { string id PK; string name; int schemaVersion }
 TASK { string id PK; string trackId FK; string title; string status; datetime updatedAt }
 LEARNING_ENTRY { string id PK; string taskId FK; string aiUse; string reflection; datetime createdAt }
 EVIDENCE { string id PK; string entryId FK; string kind; string uri; datetime createdAt }
 COMPETENCY { string id PK; string slug; int version; string title }
 COMPETENCY_CRITERION { string id PK; string competencyId FK; string key; string description }
 COMPETENCY_ASSESSMENT { string id PK; string competencyId FK; string status; datetime assessedAt }
 REVIEW { string id PK; string evidenceId FK; string feedback; datetime createdAt }
```

## Proposed IndexedDB stores

| Store | Key | Important fields and indexes |
|---|---|---|
| meta | key | schemaVersion, exportVersion |
| tracks | id | name, createdAt, updatedAt |
| tasks | id | trackId, title, status, dueAt; indexes trackId/status/updatedAt |
| learningEntries | id | taskId, summary, reflection, aiUse, independentWorkDescription; indexes taskId/createdAt |
| evidence | id | learningEntryId, kind, title, uri, description |
| competencies | id | slug, version, title, description, criteria |
| assessments | id | competencyId, status, rationale, evidenceIds, assessedAt |
| reviews | id | evidenceId, feedback, reviewerLabel, createdAt |
| tombstones | id | entityType, entityId, deletedAt; reserved for future sync |

Mutable records include schemaVersion, createdAt and updatedAt. Prefer links over binary attachments initially. IndexedDB is not proposed as encrypted storage and is not protection against compromised same-origin scripts or devices.

## Backup format
JSON backup includes format identifier, export version, timestamp, app schema version and arrays for supported stores. Validate all records and relationships before import; preview both modes and require confirmation. Reject unsupported versions, malformed records, duplicate IDs and broken references. The accepted modes are “Replace everything” and “Merge (newer updatedAt wins)”: merge adds new IDs, replaces matching records only when the imported `updatedAt` is newer, and retains local records when timestamps are equal or imported timestamps are older. Apply either mode atomically; per-record conflict choices are deferred. Reject files above 10 MiB before parsing. CSV is not full-fidelity backup; escape formula-leading cells.

## Optional future sync schema — not MVP
If approved, add Account and Device models. Candidate sync envelope fields: ownerId, deviceId, clientMutationId, serverVersion, baseVersion, syncedAt and deletedAt. Require explicit opt-in account linking, idempotent mutations, owner-scoped authorization and conflict detection. Preserve local-only use and export. This is conceptual, not a selected Supabase schema.

## Open questions
Attachment blobs; rubric migration; reviewer identity; browser data deletion limitations.
