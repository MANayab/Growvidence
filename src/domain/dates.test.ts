import { describe, expect, it } from "vitest";
import { addLocalDays, dateRangeFor, endOfMonth, isDateInRange, localDateKey, parseLocalDate, startOfWeekMonday } from "./dates";

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
    expect(dateRangeFor("2026-11-22", "weekly")).toEqual({ start: "2026-11-16", end: "2026-11-22" });
  });
  it("handles month boundaries and leap years", () => {
    expect(endOfMonth("2026-11-01")).toBe("2026-11-30");
    expect(endOfMonth("2028-02-01")).toBe("2028-02-29");
    expect(dateRangeFor("2026-12-31", "monthly")).toEqual({ start: "2026-12-01", end: "2026-12-31" });
  });
  it("does not shift date-only values over DST transitions", () => {
    const spring = addLocalDays("2026-03-07", 1);
    const autumn = addLocalDays("2026-10-31", 1);
    expect(spring).toBe("2026-03-08");
    expect(autumn).toBe("2026-11-01");
    expect(isDateInRange(spring, { start: spring, end: spring })).toBe(true);
  });
  it("rejects impossible dates", () => {
    expect(() => parseLocalDate("2026-02-30")).toThrow("Invalid calendar date");
  });
});
