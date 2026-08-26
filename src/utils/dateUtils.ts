/**
 * Utility functions for weekly date calculations and Monday 12:00 AM countdown & reset logic
 */

/**
 * Gets the current week's Monday at 00:00:00
 */
export function getMondayOfCurrentWeek(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  // Distance to Monday: if day is 0 (Sunday), diff is -6 days; otherwise 1 - day
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Gets the upcoming Monday at 00:00:00 (which is the reset point for the current week)
 */
export function getNextMondayMidnight(d: Date = new Date()): Date {
  const currentMonday = getMondayOfCurrentWeek(d);
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(nextMonday.getDate() + 7);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * Gets a unique week identifier string, e.g. "2026-W34"
 */
export function getWeekId(d: Date = new Date()): string {
  const monday = getMondayOfCurrentWeek(d);
  const year = monday.getFullYear();
  
  // Calculate ISO week number
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (monday.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Formats weekly range label e.g., "Aug 17 – Aug 23, 2026"
 */
export function getWeekRangeLabel(d: Date = new Date()): string {
  const monday = getMondayOfCurrentWeek(d);
  const sunday = new Date(monday);
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
 * Computes remaining time until next Monday 12:00 AM
 */
export function getCountdownToNextMonday(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  percentageElapsed: number;
} {
  const now = new Date();
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
