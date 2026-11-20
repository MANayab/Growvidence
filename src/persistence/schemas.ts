import { z } from "zod";

export const IsoDateTimeSchema = z.iso.datetime({ offset: true });

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

export const ThemePreferenceSchema = z.enum(["system", "light", "dark"]);
export type ThemePreference = z.infer<typeof ThemePreferenceSchema>;

export const SettingsSchema = BaseRecordSchema.extend({
  id: z.literal("user-settings"),
  theme: ThemePreferenceSchema,
});

export type Track = z.infer<typeof TrackSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
