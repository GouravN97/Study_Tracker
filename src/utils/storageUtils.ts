import { WeeklyReport, Course } from "../types";

/**
 * Key identifiers used for localStorage caching
 */
export const STORAGE_KEYS = {
  COURSES: "uni_courses_data",
  WEEKLY_REPORTS: "uni_weekly_reports",
  USER_SETTINGS: "uni_user_settings",
  DAILY_NOTEPAD: "uni_daily_notepad_tasks",
  LOCAL_MODIFIED_AT: "uni_local_modified_at",
} as const;

/**
 * Checks whether an error is a browser storage quota exceeded error
 */
export function isQuotaExceededError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof DOMException) {
    return (
      err.name === "QuotaExceededError" ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      err.code === 22 ||
      err.code === 1014
    );
  }
  const str = String(err).toLowerCase();
  return str.includes("quota") && (str.includes("exceeded") || str.includes("storage"));
}

/**
 * Lightweight course representation for localStorage history cache.
 * Strips heavy wallpaper/background image data from archived course snapshots.
 */
function sanitizeCoursesForCache(courses: Course[]): Course[] {
  if (!Array.isArray(courses)) return [];
  return courses.map(c => ({
    id: c.id,
    name: c.name,
    code: c.code,
    instructor: c.instructor,
    hoursCompleted: Number(c.hoursCompleted) || 0,
    targetHours: Number(c.targetHours) || 0,
    color: c.color,
    category: c.category,
    notes: typeof c.notes === "string" ? c.notes.slice(0, 1000) : "",
    lastUpdated: c.lastUpdated,
    // Do not keep heavy background images in historical snapshots in localStorage
    backgroundImage: undefined,
    backgroundDim: c.backgroundDim,
  }));
}

/**
 * Sanitizes an array of WeeklyReports to only retain lightweight essential data for offline cache
 */
function sanitizeReportsForCache(reports: WeeklyReport[], maxItems: number = 8): WeeklyReport[] {
  if (!Array.isArray(reports)) return [];
  return reports.slice(0, maxItems).map(r => ({
    id: r.id,
    weekId: r.weekId,
    weekStartDate: r.weekStartDate,
    weekEndDate: r.weekEndDate,
    weekLabel: r.weekLabel,
    archivedAt: r.archivedAt,
    totalHours: Number(r.totalHours) || 0,
    totalTargetHours: Number(r.totalTargetHours) || 0,
    completionPercentage: Number(r.completionPercentage) || 0,
    coursesSnapshot: sanitizeCoursesForCache(r.coursesSnapshot || []),
    emailSentTo: r.emailSentTo,
    emailSentAt: r.emailSentAt,
    deliveryId: r.deliveryId,
    aiSummary: r.aiSummary,
  }));
}

/**
 * Safe localStorage wrapper that guarantees operations never throw unhandled
 * QuotaExceededError or security exceptions that crash the application.
 */
export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Failed to getItem('${key}'):`, e);
    }
    return null;
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Failed to removeItem('${key}'):`, e);
    }
  },

  setItem(key: string, value: string): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      if (isQuotaExceededError(e)) {
        console.warn(`[SafeStorage] Quota exceeded while setting '${key}'. Attempting self-healing cleanup...`);
        // Free space by clearing non-essential historical cache in localStorage
        try {
          if (key !== STORAGE_KEYS.WEEKLY_REPORTS) {
            window.localStorage.removeItem(STORAGE_KEYS.WEEKLY_REPORTS);
            window.localStorage.setItem(key, value);
            console.log(`[SafeStorage] Successfully saved '${key}' after evicting weekly reports cache.`);
            return true;
          }
        } catch (innerErr) {
          console.warn(`[SafeStorage] Failed to recover from quota error for key '${key}':`, innerErr);
        }
      } else {
        console.warn(`[SafeStorage] Error setting '${key}':`, e);
      }
      return false;
    }
  },
};

/**
 * Specialized safe saver for Weekly Reports.
 * Full reports are stored on the server file system (data/study-tracker-data.json and data/archives/).
 * In localStorage, only a small lightweight cache of the latest reports is kept.
 * Progressively scales down to prevent QuotaExceededError.
 */
export function safeSaveWeeklyReports(reports: WeeklyReport[]): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;

  const candidateCounts = [8, 4, 2];

  for (const count of candidateCounts) {
    try {
      const sanitized = sanitizeReportsForCache(reports, count);
      const jsonStr = JSON.stringify(sanitized);
      window.localStorage.setItem(STORAGE_KEYS.WEEKLY_REPORTS, jsonStr);
      return true;
    } catch (err) {
      if (isQuotaExceededError(err)) {
        console.warn(`[SafeStorage] Quota exceeded saving ${count} weekly reports. Reducing cache size...`);
        continue;
      } else {
        console.warn("[SafeStorage] Unexpected error saving weekly reports cache:", err);
        return false;
      }
    }
  }

  // If even 2 reports cannot fit in localStorage, remove the key so it doesn't block other operations.
  // Full reports will still be loaded dynamically from the server /api/data.
  console.warn("[SafeStorage] Quota critically low. Evicting local weekly reports cache. Data remains intact on server disk.");
  safeStorage.removeItem(STORAGE_KEYS.WEEKLY_REPORTS);
  return false;
}

/**
 * Self-healing routine run on startup:
 * If an existing oversized `uni_weekly_reports` is in localStorage, optimize it immediately
 * so the user doesn't hit a quota error on their first Monday load.
 */
export function initializeStorageOptimization(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const existing = window.localStorage.getItem(STORAGE_KEYS.WEEKLY_REPORTS);
    if (existing && existing.length > 100_000) {
      // Over 100KB: sanitize and trim cache to free up space immediately
      console.log(`[SafeStorage] Optimizing existing weekly reports cache (${(existing.length / 1024).toFixed(1)} KB)...`);
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed)) {
        safeSaveWeeklyReports(parsed);
      }
    }
  } catch (err) {
    console.warn("[SafeStorage] Error during startup cache optimization:", err);
    // If parsing or accessing fails, purge the overgrown key safely
    safeStorage.removeItem(STORAGE_KEYS.WEEKLY_REPORTS);
  }
}
