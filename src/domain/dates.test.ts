import { describe, expect, it } from "vitest";
import {
  addLocalDays,
  addLocalMonths,
  dateRangeFor,
  endOfMonth,
  isDateInRange,
  localDateKey,
  parseLocalDate,
  startOfWeekMonday,
} from "./dates";

describe("local calendar date helpers", () => {
  it("uses the local calendar date, not UTC", () => {
    const local = new Date(2026, 10, 21, 0, 5);
    expect(localDateKey(local)).toBe("2026-11-21");
  });
  it("handles midnight and date rollover", () => {
    expect(addLocalDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addLocalDays("2026-12-01", -1)).toBe("2026-11-30");
  });
  it("starts weeks on Monday and includes Sunday", () => {
    expect(startOfWeekMonday("2026-11-22")).toBe("2026-11-16");
    expect(dateRangeFor("2026-11-22", "weekly")).toEqual({
      start: "2026-11-16",
      end: "2026-11-22",
    });
  });
  it("handles month boundaries and leap years", () => {
    expect(addLocalMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addLocalMonths("2028-01-31", 1)).toBe("2028-02-29");
    expect(addLocalMonths("2026-03-31", -1)).toBe("2026-02-28");
    expect(endOfMonth("2026-11-01")).toBe("2026-11-30");
    expect(endOfMonth("2028-02-01")).toBe("2028-02-29");
    expect(dateRangeFor("2026-12-31", "monthly")).toEqual({
      start: "2026-12-01",
      end: "2026-12-31",
    });
  });
  it("keeps date-only values stable across real DST transitions", () => {
    const previousZone = process.env.TZ;
    process.env.TZ = "America/New_York";
    try {
      const springStart = new Date(2026, 2, 8, 0, 30);
      const autumnEnd = new Date(2026, 10, 1, 0, 30);
      expect(addLocalDays(localDateKey(springStart), 1)).toBe("2026-03-09");
      expect(addLocalDays(localDateKey(autumnEnd), 1)).toBe("2026-11-02");
      expect(
        isDateInRange("2026-03-08", { start: "2026-03-08", end: "2026-03-08" }),
      ).toBe(true);
    } finally {
      if (previousZone === undefined) delete process.env.TZ;
      else process.env.TZ = previousZone;
    }
  });
  it("rejects impossible dates", () => {
    expect(() => parseLocalDate("2026-02-30")).toThrow("Invalid calendar date");
  });
});
