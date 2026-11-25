import { describe, expect, it } from "vitest";
import { filterJournalEntries, summarizeJournal } from "./journal";
import type { JournalEntry } from "../persistence/schemas";
const base: JournalEntry = {
  id: "aab6e5e8-fd34-4ad1-9f02-1dd44c80a231",
  schemaVersion: 1,
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  deletedAt: null,
  title: "Entry",
  learned: "",
  blocked: "",
  next: "",
  trackId: "4b6b3c1e-43a7-4c31-9e6e-b2d62d9e4c4f",
  taskId: null,
  confidence: 3,
  minutesSpent: 10,
  date: "2026-11-21",
  aiUse: { mode: "not_recorded", tool: "", whatWasGenerated: "" },
};
describe("journal filter and summary", () => {
  const entries = (
    [
      "assisted",
      "unassisted",
      "partially_assisted",
      "unknown",
      "not_recorded",
    ] as const
  ).map((mode, index) => ({
    ...base,
    id: `00000000-0000-4000-8000-00000000000${index}`,
    aiUse: { ...base.aiUse, mode },
    minutesSpent: index * 10,
    date: `2026-11-2${index}`,
  }));
  it("filters independently by track, date window and disclosure state", () => {
    expect(
      filterJournalEntries(entries, {
        trackId: "all",
        startDate: "2026-11-21",
        endDate: "2026-11-23",
        aiUseMode: "unknown",
      }),
    ).toHaveLength(1);
    const unassistedOnly = filterJournalEntries(entries, {
      trackId: base.trackId!,
      startDate: "",
      endDate: "",
      aiUseMode: "unassisted",
    });
    expect(unassistedOnly).toHaveLength(1);
    expect(unassistedOnly.map((entry) => entry.aiUse.mode)).toEqual([
      "unassisted",
    ]);
    expect(
      unassistedOnly.some(
        (entry) =>
          entry.aiUse.mode === "unknown" || entry.aiUse.mode === "not_recorded",
      ),
    ).toBe(false);
  });
  it("keeps unknown and not_recorded separate and sums counts/minutes by state", () => {
    const summary = summarizeJournal(entries);
    expect(summary).toHaveLength(5);
    expect(summary.find((x) => x.mode === "unknown")).toEqual({
      mode: "unknown",
      count: 1,
      minutes: 30,
    });
    expect(summary.find((x) => x.mode === "not_recorded")).toEqual({
      mode: "not_recorded",
      count: 1,
      minutes: 40,
    });
    expect(summary.find((x) => x.mode === "unassisted")).toEqual({
      mode: "unassisted",
      count: 1,
      minutes: 10,
    });
    expect(
      summary.filter((x) => x.mode === "unknown" || x.mode === "not_recorded"),
    ).toHaveLength(2);
    expect(
      summary
        .filter((x) => x.mode === "unknown" || x.mode === "not_recorded")
        .reduce((sum, item) => sum + item.count, 0),
    ).toBe(2);
  });
});
