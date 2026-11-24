import type { JournalEntry, AiUseMode } from "../persistence/schemas";

export interface JournalFilters {
  trackId: string;
  startDate: string;
  endDate: string;
  aiUseMode: AiUseMode | "all";
}
export interface JournalSummaryItem {
  mode: AiUseMode;
  count: number;
  minutes: number;
}
export const AI_USE_MODES: AiUseMode[] = [
  "assisted",
  "unassisted",
  "partially_assisted",
  "unknown",
  "not_recorded",
];
export function filterJournalEntries(entries: JournalEntry[], filters: JournalFilters): JournalEntry[] {
  return entries.filter((entry) =>
    (filters.trackId === "all" || entry.trackId === filters.trackId) &&
    (!filters.startDate || entry.date >= filters.startDate) &&
    (!filters.endDate || entry.date <= filters.endDate) &&
    (filters.aiUseMode === "all" || entry.aiUse.mode === filters.aiUseMode),
  );
}
export function summarizeJournal(entries: JournalEntry[]): JournalSummaryItem[] {
  return AI_USE_MODES.map((mode) => {
    const selected = entries.filter((entry) => entry.aiUse.mode === mode);
    return { mode, count: selected.length, minutes: selected.reduce((sum, entry) => sum + entry.minutesSpent, 0) };
  });
}
