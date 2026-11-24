export type CalendarView = "daily" | "weekly" | "monthly";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
export function parseLocalDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match)
    throw new RangeError(
      "Expected a local calendar date in YYYY-MM-DD format.",
    );
  const year = Number(match[1]),
    month = Number(match[2]),
    day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    throw new RangeError("Invalid calendar date.");
  return date;
}
export function addLocalDays(value: string, amount: number): string {
  if (!Number.isInteger(amount))
    throw new RangeError("Day offset must be an integer.");
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}
export function addLocalMonths(value: string, amount: number): string {
  if (!Number.isInteger(amount))
    throw new RangeError("Month offset must be an integer.");
  const date = parseLocalDate(value);
  const originalDay = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    12,
  ).getDate();
  date.setDate(Math.min(originalDay, lastDay));
  return localDateKey(date);
}
export function startOfWeekMonday(value: string): string {
  const date = parseLocalDate(value);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return localDateKey(date);
}
export function endOfWeekSunday(value: string): string {
  return addLocalDays(startOfWeekMonday(value), 6);
}
export function startOfMonth(value: string): string {
  const date = parseLocalDate(value);
  return localDateKey(new Date(date.getFullYear(), date.getMonth(), 1, 12));
}
export function endOfMonth(value: string): string {
  const date = parseLocalDate(value);
  return localDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0, 12));
}
export function dateRangeFor(
  value: string,
  view: CalendarView,
): { start: string; end: string } {
  if (view === "daily") return { start: value, end: value };
  if (view === "weekly")
    return { start: startOfWeekMonday(value), end: endOfWeekSunday(value) };
  return { start: startOfMonth(value), end: endOfMonth(value) };
}
export function isDateInRange(
  value: string | null,
  range: { start: string; end: string },
): boolean {
  return value !== null && value >= range.start && value <= range.end;
}
