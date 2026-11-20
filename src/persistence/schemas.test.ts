import { describe, expect, it } from "vitest";

import { SettingsSchema, TrackSchema } from "./schemas";

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

describe("TrackSchema", () => {
  it("accepts the agreed track contract and applies defaults", () => {
    const result = TrackSchema.parse({ ...validTrack, description: undefined, archivedAt: undefined });
    expect(result.description).toBe("");
    expect(result.archivedAt).toBeNull();
  });

  it("rejects invalid IDs, blank titles and malformed colors", () => {
    expect(TrackSchema.safeParse({ ...validTrack, id: "not-a-uuid" }).success).toBe(false);
    expect(TrackSchema.safeParse({ ...validTrack, title: "  " }).success).toBe(false);
    expect(TrackSchema.safeParse({ ...validTrack, color: "red" }).success).toBe(false);
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
    expect(SettingsSchema.safeParse({ ...settings, theme: "auto-magical" }).success).toBe(false);
  });
});
