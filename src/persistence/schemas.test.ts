import { describe, expect, it } from "vitest";

import {
  IsoDateTimeSchema,
  LocalDateSchema,
  SettingsSchema,
  JournalEntrySchema,
  AiUseDisclosureSchema,
  TaskSchema,
  TrackSchema,
} from "./schemas";

const validTrack = {
  id: "4b6b3c1e-43a7-4c31-9e6e-b2d62d9e4c4f",
  schemaVersion: 1,
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  deletedAt: null,
  title: "Learn TypeScript",
  description: "Build small typed programs.",
  archivedAt: null,
};

describe("IsoDateTimeSchema", () => {
  it("accepts UTC and colon-form timezone offsets", () => {
    const utc = IsoDateTimeSchema.safeParse("2026-11-21T00:00:00.000Z");
    const positiveOffset = IsoDateTimeSchema.safeParse(
      "2026-11-21T05:30:00+05:30",
    );
    const negativeOffset = IsoDateTimeSchema.safeParse(
      "2026-11-20T19:00:00-05:00",
    );

    expect(utc.success).toBe(true);
    expect(positiveOffset.success).toBe(true);
    expect(negativeOffset.success).toBe(true);
  });

  it("rejects timestamps without an offset and basic offset forms", () => {
    const missing = IsoDateTimeSchema.safeParse("2026-11-21T00:00:00");
    const basic = IsoDateTimeSchema.safeParse("2026-11-21T05:30:00+0530");

    expect(missing.success).toBe(false);
    expect(basic.success).toBe(false);
  });
});

describe("TrackSchema", () => {
  it("accepts the agreed track contract and applies defaults", () => {
    const result = TrackSchema.parse({
      ...validTrack,
      description: undefined,
      archivedAt: undefined,
    });
    expect(result.description).toBe("");
    expect(result.archivedAt).toBeNull();
  });

  it("rejects invalid IDs, blank titles and malformed colors", () => {
    const invalidId = TrackSchema.safeParse({
      ...validTrack,
      id: "not-a-uuid",
    });
    const blank = TrackSchema.safeParse({ ...validTrack, title: "  " });
    const badColor = TrackSchema.safeParse({ ...validTrack, color: "red" });

    expect(invalidId.success).toBe(false);
    expect(blank.success).toBe(false);
    expect(badColor.success).toBe(false);
  });
});

describe("SettingsSchema", () => {
  const settings = {
    id: "user-settings",
    schemaVersion: 1,
    createdAt: "2026-11-21T00:00:00.000Z",
    updatedAt: "2026-11-21T00:00:00.000Z",
    deletedAt: null,
    theme: "dark",
  };

  it("accepts a versioned local theme preference", () => {
    expect(SettingsSchema.parse(settings).theme).toBe("dark");
  });

  it("rejects unknown theme values", () => {
    const unknownTheme = SettingsSchema.safeParse({
      ...settings,
      theme: "auto-magical",
    });

    expect(unknownTheme.success).toBe(false);
  });
});

describe("TaskSchema", () => {
  const validTask = {
    ...validTrack,
    trackId: validTrack.id,
    title: "Build a small feature",
    status: "today",
    priority: "high",
    dueDate: "2026-11-21",
    estimatedMinutes: 45,
    actualMinutes: 30,
    tags: ["practice", "portfolio"],
  };

  it("accepts all five workflow statuses and the full task contract", () => {
    expect(TaskSchema.parse(validTask)).toMatchObject({
      status: "today",
      estimatedMinutes: 45,
      actualMinutes: 30,
    });
    for (const status of [
      "backlog",
      "today",
      "in_progress",
      "review",
      "done",
    ]) {
      expect(TaskSchema.safeParse({ ...validTask, status }).success).toBe(true);
    }
  });

  it("rejects unknown statuses, invalid local dates and non-integer minutes", () => {
    expect(
      TaskSchema.safeParse({ ...validTask, status: "blocked" }).success,
    ).toBe(false);
    expect(
      TaskSchema.safeParse({ ...validTask, dueDate: "2026-02-30" }).success,
    ).toBe(false);
    expect(
      TaskSchema.safeParse({ ...validTask, estimatedMinutes: 1.5 }).success,
    ).toBe(false);
  });
});

describe("LocalDateSchema", () => {
  it("accepts a date-only calendar value and rejects a timestamp", () => {
    expect(LocalDateSchema.safeParse("2026-11-21").success).toBe(true);
    expect(LocalDateSchema.safeParse("2026-11-21T00:00:00.000Z").success).toBe(
      false,
    );
  });
});

describe("JournalEntrySchema and AI disclosure", () => {
  const base = {
    id: "aab6e5e8-fd34-4ad1-9f02-1dd44c80a231",
    schemaVersion: 1,
    createdAt: "2026-11-21T00:00:00.000Z",
    updatedAt: "2026-11-21T00:00:00.000Z",
    deletedAt: null,
    title: "Practice",
    learned: "I used a reducer.",
    blocked: "Typing issue.",
    next: "Add tests.",
    trackId: null,
    taskId: null,
    confidence: 4,
    minutesSpent: 25,
    date: "2026-11-21",
  };
  it("defaults disclosure to not_recorded and validates local date and confidence bounds", () => {
    const parsed = JournalEntrySchema.parse(base);
    expect(parsed.aiUse.mode).toBe("not_recorded");
    expect(parsed.date).toBe("2026-11-21");
    expect("attemptedAt" in parsed).toBe(false);
    const withLegacyField = JournalEntrySchema.parse({
      ...base,
      attemptedAt: "2026-11-21",
    });
    expect("attemptedAt" in withLegacyField).toBe(false);
    expect(
      JournalEntrySchema.safeParse({ ...base, confidence: 0 }).success,
    ).toBe(false);
    expect(
      JournalEntrySchema.safeParse({
        ...base,
        date: "2026-11-21T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });
  it("keeps all five AI-use states distinct and rejects unknown modes", () => {
    for (const mode of [
      "assisted",
      "unassisted",
      "partially_assisted",
      "unknown",
      "not_recorded",
    ]) {
      const result = AiUseDisclosureSchema.parse({ mode });
      expect(result.mode).toBe(mode);
    }
    expect(AiUseDisclosureSchema.safeParse({ mode: "none" }).success).toBe(
      false,
    );
  });
});
