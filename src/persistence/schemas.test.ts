import { describe, expect, it } from "vitest";

import { IsoDateTimeSchema, SettingsSchema, TrackSchema } from "./schemas";

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
