/**
 * Utility functions for weekly date calculations and Monday 12:00 AM countdown & reset logic
 */

/**
 * Gets the Monday of the week containing the given date at 00:00:00.000 local time
 */
export function getMondayOfCurrentWeek(d: Date = new Date()): Date {
  const date = new Date(d.getTime());
  const day = date.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  // Distance to Monday: if Sunday (0) go back 6 days; otherwise 1 - day
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Gets the upcoming Monday at 00:00:00 (which is the reset point for the current week)
 */
export function getNextMondayMidnight(d: Date = new Date()): Date {
  const currentMonday = getMondayOfCurrentWeek(d);
  const nextMonday = new Date(currentMonday.getTime());
  nextMonday.setDate(nextMonday.getDate() + 7);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * Gets the previous Monday at 00:00:00 (for referencing the just-ended week)
 */
export function getPreviousMondayMidnight(d: Date = new Date()): Date {
  const currentMonday = getMondayOfCurrentWeek(d);
  const prevMonday = new Date(currentMonday.getTime());
  prevMonday.setDate(prevMonday.getDate() - 7);
  prevMonday.setHours(0, 0, 0, 0);
  return prevMonday;
}

/**
 * Gets a standard ISO week identifier string, e.g. "2026-W35"
 */
export function getWeekId(d: Date = new Date()): string {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year according to ISO 8601
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and calculate number of full 7-day cycles
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Gets the previous week's ISO identifier string
 */
export function getPreviousWeekId(d: Date = new Date()): string {
  const prevMonday = getPreviousMondayMidnight(d);
  return getWeekId(prevMonday);
}

/**
 * Formats weekly range label e.g., "Aug 17 – Aug 23, 2026"
 */
export function getWeekRangeLabel(d: Date = new Date()): string {
  const monday = getMondayOfCurrentWeek(d);
  const sunday = new Date(monday.getTime());
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const startMonth = monday.toLocaleString("en-US", { month: "short" });
  const endMonth = sunday.toLocaleString("en-US", { month: "short" });
  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  const year = sunday.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

/**
 * Formats the previous week's date range label
 */
export function getPreviousWeekRangeLabel(d: Date = new Date()): string {
  const prevMonday = getPreviousMondayMidnight(d);
  return getWeekRangeLabel(prevMonday);
}

/**
 * Computes remaining time until next Monday 12:00 AM
 */
export function getCountdownToNextMonday(now: Date = new Date()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  percentageElapsed: number;
} {
  const nextMonday = getNextMondayMidnight(now);
  const currentMonday = getMondayOfCurrentWeek(now);

  const totalWeekMs = nextMonday.getTime() - currentMonday.getTime(); // 7 days in ms
  const remainingMs = Math.max(0, nextMonday.getTime() - now.getTime());
  const elapsedMs = totalWeekMs - remainingMs;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const percentageElapsed = Math.min(100, Math.max(0, Math.round((elapsedMs / totalWeekMs) * 100)));

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    percentageElapsed,
  };
}
