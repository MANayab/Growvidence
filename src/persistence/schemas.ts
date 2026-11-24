import { z } from "zod";

export const IsoDateTimeSchema = z.iso.datetime({ offset: true });
export const LocalDateSchema = z.iso.date();
const BaseRecordSchema = z.object({
  id: z.uuid(),
  schemaVersion: z.number().int().positive(),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  deletedAt: IsoDateTimeSchema.nullable().default(null),
});

export const TrackSchema = BaseRecordSchema.extend({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(2000).default(""),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  archivedAt: IsoDateTimeSchema.nullable().default(null),
});
export const TaskStatusSchema = z.enum([
  "backlog",
  "today",
  "in_progress",
  "review",
  "done",
]);
export const TaskPrioritySchema = z.enum(["low", "normal", "high"]);
export const TaskSchema = BaseRecordSchema.extend({
  trackId: z.uuid(),
  title: z.string().trim().min(1).max(160),
  description: z.string().max(5000).default(""),
  status: TaskStatusSchema.default("backlog"),
  priority: TaskPrioritySchema.default("normal"),
  dueDate: LocalDateSchema.nullable().default(null),
  estimatedMinutes: z.number().int().min(0).max(10080).nullable().default(null),
  actualMinutes: z.number().int().min(0).max(10080).nullable().default(null),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
});
export const ThemePreferenceSchema = z.enum(["system", "light", "dark"]);
export type ThemePreference = z.infer<typeof ThemePreferenceSchema>;
export const SettingsSchema = BaseRecordSchema.extend({
  id: z.literal("user-settings"),
  theme: ThemePreferenceSchema,
});
export type Track = z.infer<typeof TrackSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type Settings = z.infer<typeof SettingsSchema>;

export const AiUseModeSchema = z.enum([
  "assisted",
  "unassisted",
  "partially_assisted",
  "unknown",
  "not_recorded",
]);
export const AiUseDisclosureSchema = z.object({
  mode: AiUseModeSchema.default("not_recorded"),
  tool: z.string().trim().max(120).default(""),
  whatWasGenerated: z.string().max(3000).default(""),
});
export type AiUseDisclosure = z.infer<typeof AiUseDisclosureSchema>;
export type AiUseMode = z.infer<typeof AiUseModeSchema>;
export const JournalEntrySchema = BaseRecordSchema.extend({
  title: z.string().trim().min(1).max(160),
  learned: z.string().max(5000).default(""),
  blocked: z.string().max(5000).default(""),
  next: z.string().max(5000).default(""),
  trackId: z.uuid().nullable().default(null),
  taskId: z.uuid().nullable().default(null),
  confidence: z.number().int().min(1).max(5),
  minutesSpent: z.number().int().min(0).max(10080).default(0),
  date: LocalDateSchema,
  aiUse: AiUseDisclosureSchema.default({ mode: "not_recorded", tool: "", whatWasGenerated: "" }),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

