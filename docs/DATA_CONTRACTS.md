# Growvidence learner data contracts

- **Status:** Design proposal for Phase 2; schemas are not implemented.
- **Runtime validation proposal:** Zod at UI/domain/import boundaries.
- **Persistence proposal:** IndexedDB through the adapter in ADR-0006.
- **Contract version:** `1` (proposed export format)

These contracts define the shape and invariants for local learner records. They are a design baseline, not a claim that the app or storage exists. The eventual implementation must keep TypeScript types inferred from runtime schemas rather than maintaining duplicate hand-written types.

## Shared conventions

- IDs: UUID v4 strings generated with `crypto.randomUUID()`; never use names, email addresses or evidence content as IDs.
- Dates: ISO 8601 UTC strings. Validate parseability and normalize to UTC on write.
- Every mutable user-owned record includes `id`, `schemaVersion`, `createdAt`, `updatedAt`, and `deletedAt` (nullable).
- Timestamps are system metadata, not proof of when a learner performed work.
- Soft deletion sets `deletedAt`; normal views exclude deleted records. Explicit “delete all data” performs hard deletion of all application stores and metadata.
- No account/user identity field is defined for the local-only MVP.
- Reject unknown enum values and malformed references. Unknown future contract versions must not be silently coerced.
- Store text as plain text/Markdown only; render safely. Do not execute imported HTML or scripts.
- No binary artifact attachments in v1. Evidence stores descriptive metadata and an optional external URL; never fetch that URL automatically.

## Zod contract proposal

The following TypeScript is the normative schema sketch. It is intended to be copied into a future implementation module and then covered by tests; it is not executable in the current repository because Zod is not installed.

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
  attemptedAt: IsoDateTime.nullable().default(null),
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
  externalUrl: z.string().url().max(2048).nullable().default(null),
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
  "not_assessed", "emerging", "developing", "demonstrated", "needs_more_evidence"
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
  relationship: z.enum(["mentor", "peer", "instructor", "self", "other"]),
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

1. Enforce a configurable file-size ceiling before parsing (initial proposal: 10 MiB; **NEEDS APPROVAL**).
2. Parse JSON as untrusted input; reject malformed JSON, unsupported `format` or `formatVersion`, invalid schemas, duplicate IDs, invalid timestamps and broken references.
3. Preview record counts, conflicts, soft-deleted records and any records that will be skipped; do not write during preview.
4. Default mode: merge by stable ID. New IDs are additions. Matching IDs require a conflict resolution preview; user chooses keep existing, replace with imported, or skip that record. Dependent records must be handled consistently.
5. Provide a separate full-replace flow with explicit destructive confirmation and a pre-import export prompt.
6. Apply the validated operation transactionally. If any write fails, abort and preserve the prior dataset.
7. Show a completion summary and retain no imported file contents beyond the user-selected workflow.

Do not silently apply last-write-wins, silently overwrite, or partially import a package.

## CSV export

CSV is a convenience export, not a backup. Initial proposal: one row per task, with track title, task title/status/due date, linked journal count, linked evidence count and competency links. A separate evidence CSV can be considered later. Escape commas, quotes and line breaks according to RFC 4180. Neutralize formula injection by prefixing an apostrophe to cells beginning (after leading whitespace/control characters) with `=`, `+`, `-` or `@`. Do not strip legitimate content without telling the user.

## Deletion and retention

- Soft delete supports undo and normal filtering; it is not a privacy-erasure guarantee.
- “Delete all local data” removes all user-owned records, metadata and local database state. Seeded rubric definitions can be recreated on next app load.
- Show a confirmation describing irreversibility and offer JSON export first.
- Verify the database is empty/recreated after deletion and show a clear result.
- Explain that deletion cannot remove copies the user exported, copied externally, or stored in browser/device backups.

## Open contract decisions

See the consolidated Open decisions section in `docs/TESTING_PLAN.md` and PR description. The 10 MiB import ceiling, conflict UX, CSV column set and whether journal/evidence disclosures should share one reusable object are recommendations pending maintainer approval.
