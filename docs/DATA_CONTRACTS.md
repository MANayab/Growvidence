# Growvidence learner data contracts

- **Status:** Track/task workflows and journal workflows are implemented in the Slice 3 review branch; competency, evidence, review and backup/import remain proposals.
- **Runtime validation:** Zod at persistence/domain boundaries for track/task/journal records.
- **Persistence:** IndexedDB through the typed `idb` adapter in ADR-0006; database schema version 4 in Slice 3.
- **Contract version:** `1` (proposed export format)

These contracts define the shape and invariants for local learner records. Track, Task and Journal portions are implemented on the Slice 3 review branch and remain unmerged until maintainer review. Competency, evidence, review and backup/import records are design baselines, not claims that their workflows or storage exist. Keep TypeScript types inferred from runtime schemas rather than maintaining duplicate hand-written types.

## Shared conventions

- IDs: UUID v4 strings generated with `crypto.randomUUID()`; never use names, email addresses or evidence content as IDs.
- Record metadata timestamps: ISO 8601 UTC strings, normalized to UTC on write. Task due dates are a separate local-calendar date-only value (`YYYY-MM-DD`) and are not converted to UTC.
- Every mutable user-owned record includes `id`, `schemaVersion`, `createdAt`, `updatedAt`, and `deletedAt` (nullable).
- Timestamps are system metadata, not proof of when a learner performed work.
- Soft deletion sets `deletedAt`; normal views exclude deleted records. Soft-deleted records remain in JSON backups until permanently deleted. Provide per-record “Permanently delete” and “Delete all local data”; permanently deleted records are excluded from future backups.
- No account/user identity field is defined for the local-only MVP.
- Reject unknown enum values and malformed references. Unknown future contract versions must not be silently coerced.
- Store text as plain text/Markdown only; render safely. Do not execute imported HTML or scripts.
- No binary artifact attachments in v1. Evidence stores descriptive metadata and an optional external URL. Accept only HTTP/HTTPS; reject javascript:, data: and all other schemes. External links use rel="noopener noreferrer". Never fetch, preview or embed URLs.


## Slice 2 implementation contract — tracks and tasks

The implementation branch uses these task statuses exactly: `backlog` (Backlog), `today` (Today), `in_progress` (In progress), `review` (Review) and `done` (Done). A Task extends the shared mutable-record fields and contains:

- `trackId`: UUID reference to an active track when creating a task; existing tasks may still be edited after their track is archived.
- `title` (1–160 characters), `description` (up to 5,000 characters), `priority` (`low`, `normal`, `high`).
- `dueDate`: nullable local calendar date in `YYYY-MM-DD` format, not an instant and never converted through UTC.
- `estimatedMinutes` and `actualMinutes`: nullable integer minutes from 0 to 10,080.
- `tags`: up to 20 trimmed labels, each 1–40 characters.

Track/task records use Zod 4 schemas in `src/persistence/schemas.ts`. Database version 3 adds the `tasks` object store and indexes by `trackId`, `status`, `dueDate` and `updatedAt`; the v2-to-v3 migration preserves existing settings and tracks. Soft-deleting a track soft-deletes its tasks in one transaction. Permanently deleting a track permanently deletes its tasks in one transaction. Soft-deleted records remain in future JSON backups until permanently deleted; backup implementation is still Slice 5.

Calendar views use the browser's local calendar date. Weeks start Monday. Record metadata remains ISO UTC timestamps. Date-only due dates are stable when the browser timezone changes; calendar arithmetic uses local noon and clamps month navigation to the target month's last day. DST changes do not convert or shift date-only values.

The earlier proposed Task schema block below predates Slice 2; use this implementation addendum and the source Zod schemas as the current Track/Task contract. Other entity sketches remain proposals.

## Slice 3 journal implementation contract

The journal record extends the shared mutable-record metadata and includes:

- `title`: trimmed, required, 1–160 characters.
- `learned`, `blocked`, `next`: plain text, each up to 5,000 characters.
- Optional `trackId` and `taskId`: nullable UUID references. Deleted/unavailable linked records are retained safely; deletion does not cascade into journal entries.
- `confidence`: integer 1–5.
- `minutesSpent`: integer 0–10,080, default 0.
- `date`: the single canonical learning date, local date-only `YYYY-MM-DD`. It is never converted through UTC. **The earlier `attemptedAt` field is removed and must not be stored.** Do not add a second date field.
- `aiUse`: disclosure object with `mode`, `tool` and `whatWasGenerated`. The five modes are `assisted`, `unassisted`, `partially_assisted`, `unknown`, and `not_recorded`. The default is `not_recorded`; imported records lacking disclosure remain `not_recorded` until explicitly updated. Unknown and not recorded remain distinct from unassisted in filters, summaries and exports.

Database schema version 4 adds `journalEntries` with indexes for trackId, taskId, date and updatedAt. The v1/v2/v3-to-v4 migrations preserve existing stores and records. A failed upgrade must abort transactionally and leave the previous schema/data available; the failure must not leak an unhandled rejection. This version bump does not rewrite Slice 1/2 track/task records.

## Zod contract proposal

The following historical proposal is retained for context only; its older JournalEntry and AI-disclosure sketches are superseded by the Slice 3 implementation contract above and by runtime schemas in `src/persistence/schemas.ts`. Track/Task proposals are also superseded by their implementation addendum.

```ts
import { z } from "zod";

const Id = z.string().uuid();
const IsoDateTime = z.string().datetime({ offset: true });
const BaseRecord = z.object({
  id: Id,
  schemaVersion: z.number().int().positive(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
  deletedAt: IsoDateTime.nullable().default(null),
});

export const TrackSchema = BaseRecord.extend({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(2000).default(""),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  archivedAt: IsoDateTime.nullable().default(null),
});
export type Track = z.infer<typeof TrackSchema>;

export const TaskStatusSchema = z.enum([
  "backlog", "planned", "in_progress", "blocked", "done", "cancelled"
]);
export const TaskSchema = BaseRecord.extend({
  trackId: Id,
  title: z.string().trim().min(1).max(160),
  description: z.string().max(5000).default(""),
  status: TaskStatusSchema,
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  dueAt: IsoDateTime.nullable().default(null),
  completedAt: IsoDateTime.nullable().default(null),
  estimatedMinutes: z.number().int().positive().max(10080).nullable().default(null),
});
export type Task = z.infer<typeof TaskSchema>;

export const AiUseModeSchema = z.enum([
  "assisted", "unassisted", "partially_assisted", "unknown", "not_recorded"
]);
export const AiUseDisclosureSchema = z.object({
  mode: AiUseModeSchema,
  toolsUsed: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  whatWasGenerated: z.string().max(3000).default(""),
  whatTheLearnerDid: z.string().max(3000).default(""),
  disclosureNote: z.string().max(2000).default(""),
});
export type AiUseDisclosure = z.infer<typeof AiUseDisclosureSchema>;

export const JournalEntrySchema = BaseRecord.extend({
  taskId: Id.nullable().default(null),
  title: z.string().trim().min(1).max(160),
  summary: z.string().max(4000).default(""),
  reflection: z.string().max(10000),
  // Removed in Slice 3: attemptedAt. The canonical date is date-only YYYY-MM-DD.\n  date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  aiUse: AiUseDisclosureSchema,
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const CompetencySlugSchema = z.enum([
  "independent_coding", "debugging", "architecture",
  "testing", "commercial_validation", "technical_fundamentals"
]);
export const CompetencySchema = z.object({
  id: Id,
  slug: CompetencySlugSchema,
  title: z.string().min(1).max(120),
  description: z.string().max(2000),
  rubricVersion: z.number().int().positive(),
  criteria: z.array(z.object({
    id: Id,
    key: z.string().regex(/^[a-z0-9-]{2,60}$/),
    statement: z.string().min(1).max(1000),
    evidenceRules: z.array(z.string().min(1).max(500)).min(1),
    approvalStatus: z.enum(["needs_approval", "approved", "retired"]),
  })).min(1),
});

export const EvidenceKindSchema = z.enum([
  "repository", "code_sample", "test_report", "design_document",
  "demo", "written_explanation", "review_record", "other"
]);
export const EvidenceSchema = BaseRecord.extend({
  journalEntryId: Id.nullable().default(null),
  title: z.string().trim().min(1).max(160),
  kind: EvidenceKindSchema,
  description: z.string().max(4000).default(""),
  externalUrl: z.string().url().max(2048).refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Only http and https URLs are allowed").nullable().default(null),
  artifactReference: z.string().max(500).nullable().default(null),
  independentDemonstration: z.boolean().default(false),
  aiUse: AiUseDisclosureSchema,
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const EvidenceLinkSchema = BaseRecord.extend({
  evidenceId: Id,
  competencySlug: CompetencySlugSchema,
  criterionKey: z.string().regex(/^[a-z0-9-]{2,60}$/),
  rationale: z.string().min(1).max(2000),
});

export const AssessmentStatusSchema = z.enum([
  "not_assessed", "emerging", "developing", "demonstrated", "consistent", "needs_more_evidence"
]);
export const CompetencyAssessmentSchema = BaseRecord.extend({
  competencySlug: CompetencySlugSchema,
  rubricVersion: z.number().int().positive(),
  status: AssessmentStatusSchema,
  rationale: z.string().max(3000),
  evidenceLinkIds: z.array(Id).max(200),
  assessedAt: IsoDateTime.nullable().default(null),
});
export type CompetencyAssessment = z.infer<typeof CompetencyAssessmentSchema>;

export const ReviewSchema = BaseRecord.extend({
  evidenceId: Id,
  reviewerLabel: z.string().trim().min(1).max(120),
  reviewerType: z.enum(["self", "external"]),
  relationship: z.enum(["mentor", "peer", "instructor", "other"]).nullable().default(null),
  feedback: z.string().min(1).max(5000),
  outcome: z.enum(["positive", "mixed", "needs_revision", "informational"]),
  reviewedAt: IsoDateTime,
});
export type Review = z.infer<typeof ReviewSchema>;

export const ExportPayloadSchema = z.object({
  format: z.literal("growvidence-backup"),
  formatVersion: z.literal(1),
  exportedAt: IsoDateTime,
  appVersion: z.string().min(1).max(40),
  databaseSchemaVersion: z.number().int().positive(),
  records: z.object({
    tracks: z.array(TrackSchema),
    tasks: z.array(TaskSchema),
    journalEntries: z.array(JournalEntrySchema),
    competencies: z.array(CompetencySchema),
    assessments: z.array(CompetencyAssessmentSchema),
    evidence: z.array(EvidenceSchema),
    evidenceLinks: z.array(EvidenceLinkSchema),
    reviews: z.array(ReviewSchema),
  }),
});
export type ExportPayload = z.infer<typeof ExportPayloadSchema>;
```

### Cross-record invariants

Zod shape validation is necessary but not sufficient. A domain validation pass must verify:

1. Every task's `trackId` references an included, non-deleted track (or an explicitly retained archived track).
2. Every journal entry's optional `taskId` references an included task.
3. Every evidence record's optional `journalEntryId` references an included journal entry.
4. Every evidence link references an existing evidence ID and a criterion key present in the matching competency rubric version.
5. Every assessment references a known competency slug and supported rubric version; every `evidenceLinkId` exists.
6. Every review references an existing evidence record.
7. IDs are unique within each entity collection; duplicate cross-entity IDs are not accepted where entity type is not part of the key.
8. `updatedAt` is not earlier than `createdAt`; `deletedAt`, when present, is not earlier than `createdAt`.
9. `completedAt` is set only when a task is done; changing a task back to another status clears or preserves completion history only under an explicit domain rule.
10. A competency assessment cannot become `demonstrated` merely because a task is done, a streak exists, or evidence is linked. It requires approved criteria and sufficient independently demonstrated evidence; review is contextual support, not an automatic score.

## AI-use disclosure rules

Every journal entry and evidence record contains an AI-use disclosure. Modes are:

- `unassisted`: learner states no AI assistance was used for the recorded work.
- `assisted`: AI generated or materially contributed to the recorded work.
- `partially_assisted`: learner and AI each contributed meaningful parts.
- `unknown`: learner cannot reliably determine or reconstruct assistance.
- `not_recorded`: disclosure has not yet been supplied; must remain visibly incomplete.

When a tool is used, record its name where known and a concise account of what it generated and what the learner personally did. Do not infer independent work from a blank field. Editing the disclosure later must preserve normal updated timestamps; an audit/history log is not part of MVP unless approved separately.

## Versioned JSON backup

The canonical backup envelope is the `ExportPayloadSchema` above:

- `format`: fixed discriminator `growvidence-backup`.
- `formatVersion`: independently versioned interchange format (starts at 1).
- `databaseSchemaVersion`: local IndexedDB schema version represented by the export.
- `appVersion`: application version that produced it.
- `exportedAt`: timestamp generated at export time.
- `records`: full-fidelity arrays for all supported stores, including soft-deleted records so backups can faithfully restore user data.

Export must be UTF-8 JSON with a clear filename, e.g. `growvidence-backup-YYYY-MM-DD.json`. Do not embed user data in the filename beyond the date.

### Import process

1. Enforce a 10 MiB file-size ceiling before parsing; reject larger files without parsing or writing.
2. Parse JSON as untrusted input; reject malformed JSON, unsupported `format` or `formatVersion`, invalid schemas, duplicate IDs, invalid timestamps and broken references.
3. Preview record counts and the effects of each available mode, including additions, matching IDs, newer imported records, equal timestamps, and soft-deleted records. Do not write during preview.
4. Offer exactly two modes:
   - **Replace everything:** replace the complete local dataset with the validated imported dataset. Require explicit destructive confirmation and offer a pre-import export.
   - **Merge (newer `updatedAt` wins):** add IDs that do not exist locally; replace a matching local record only when the imported record's `updatedAt` is newer; retain the local record when timestamps are equal or the imported timestamp is older.
5. Do not offer per-record keep, replace or skip choices in the MVP; per-record conflict resolution is deferred.
6. Apply the selected, fully validated mode atomically. If any write fails, abort and preserve the prior dataset.
7. Show a completion summary and retain no imported file contents beyond the user-selected workflow.

## CSV export

CSV is a convenience export, not a backup. Initial proposal: one row per task, with track title, task title/status/due date, linked journal count, linked evidence count and competency links. A separate evidence CSV can be considered later. Escape commas, quotes and line breaks according to RFC 4180. Neutralize formula injection by prefixing an apostrophe or equivalent safe text encoding to every cell whose first meaningful character is `=`, `+`, `-` or `@`. Unit-test all four prefixes, ordinary values and leading whitespace. Do not strip legitimate content without telling the user.

## Deletion and retention

- Soft delete supports undo and normal filtering; it is not a privacy-erasure guarantee.
- “Delete all local data” removes all user-owned records, metadata and local database state. Seeded rubric definitions can be recreated on next app load.
- Show a confirmation describing irreversibility and offer JSON export first.
- Verify the database is empty/recreated after deletion and show a clear result.
- Explain that deletion cannot remove copies the user exported, copied externally, or stored in browser/device backups.

## Open contract decisions

See the consolidated Open decisions section in `docs/TESTING_PLAN.md` and PR description. The CSV column set and whether journal/evidence disclosures should share one reusable object remain recommendations pending maintainer approval. The 10 MiB import ceiling and the two import modes are accepted decisions.

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
| 11 | Bundle/charts | Accepted: 200 KiB gzip for all JavaScript loaded by `/app/`, including the Astro renderer, React runtime, island and shared/imported chunks; hand-built SVG or lazy-loaded charts; bundle-size check required. |
| 12 | Deletion | Accepted: soft-deleted records remain in JSON backups; per-record Permanently delete and Delete all local data; no timed purge. |

### Competency levels — NEEDS APPROVAL

- **Demonstrated (NEEDS APPROVAL):** every mandatory criterion has at least one independent artifact.
- **Consistent (NEEDS APPROVAL):** the demonstration is repeated in a different task or context.
- Proposed Consistent corroboration: external review weight 2, self review weight 1. Reviews cannot replace the required independent artifact or repeated demonstration.
