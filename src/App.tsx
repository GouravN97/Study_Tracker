import React, { useState, useEffect, useMemo, useRef } from "react";
import { Navbar } from "./components/Navbar";
import { CountdownCard } from "./components/CountdownCard";
import { OverviewMetrics } from "./components/OverviewMetrics";
import { CourseCard } from "./components/CourseCard";
import { CourseModal } from "./components/CourseModal";
import { EmailReportModal } from "./components/EmailReportModal";
import { WeeklyHistoryModal } from "./components/WeeklyHistoryModal";
import { ResetConfirmModal } from "./components/ResetConfirmModal";
import { SettingsModal } from "./components/SettingsModal";
import { AppearanceModal } from "./components/AppearanceModal";
import { DailyNotepad } from "./components/DailyNotepad";
import { PreviousWeeksDashboardModal } from "./components/PreviousWeeksDashboardModal";
import { Course, WeeklyReport, UserSettings } from "./types";
import { INITIAL_COURSES, DEFAULT_USER_SETTINGS } from "./data/defaultCourses";
import { PIXEL_FONT_FAMILY, BackgroundPreset, resolveBackgroundPreset } from "./data/themes";
import { generateReportHtml, generatePlainTextSummary } from "./utils/emailTemplate";
import { 
  getWeekId, 
  getWeekRangeLabel, 
  getCountdownToNextMonday, 
  getMondayOfCurrentWeek,
  getPreviousWeekId,
  getPreviousWeekRangeLabel,
  getPreviousMondayMidnight
} from "./utils/dateUtils";
import { safeStorage, safeSaveWeeklyReports, STORAGE_KEYS } from "./utils/storageUtils";
import { Plus, BookOpen, Sparkles, Check, AlertCircle, Palette, History } from "lucide-react";
import confetti from "canvas-confetti";

export default function App() {
  // Flags and refs to track change state and prevent unnecessary saves
  const [isDataLoadedFromServer, setIsDataLoadedFromServer] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const lastSavedSnapshotRef = useRef<string>("");

  // State initialization with localStorage fallback
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.COURSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(c => Boolean(c && typeof c === "object" && c.id && c.name));
          if (valid.length > 0) return valid;
        }
      }
    } catch (e) {
      console.error("Error parsing saved courses", e);
    }
    return INITIAL_COURSES;
  });

  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.WEEKLY_REPORTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(r => Boolean(r && typeof r === "object" && r.id));
        }
      }
    } catch (e) {
      console.error("Error parsing saved reports", e);
    }
    return [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return { ...DEFAULT_USER_SETTINGS, ...parsed };
        }
      }
    } catch (e) {
      console.error("Error parsing saved settings", e);
    }
    return DEFAULT_USER_SETTINGS;
  });

  // Keep stateRef up to date for background interval checks without re-creating timers
  const stateRef = useRef({ courses, weeklyReports, settings });
  useEffect(() => {
    stateRef.current = { courses, weeklyReports, settings };
  }, [courses, weeklyReports, settings]);

  // Modal visibility states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<WeeklyReport | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [isNotesDashboardModalOpen, setIsNotesDashboardModalOpen] = useState(false);

  // Filters & Search
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (text: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Realtime Countdown Engine
  const [countdown, setCountdown] = useState(getCountdownToNextMonday());
  const currentWeekId = useMemo(() => getWeekId(), []);
  const currentWeekLabel = useMemo(() => getWeekRangeLabel(), []);

  // Save payload to local server file system
  const saveStateToLocalDisk = async (
    currentCourses: Course[],
    currentReports: WeeklyReport[],
    currentSettings: UserSettings
  ) => {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: currentCourses,
          weeklyReports: currentReports,
          settings: currentSettings,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setLastSavedTime(json.savedAt || new Date().toISOString());
        return true;
      }
    } catch (err) {
      console.warn("Could not save to local disk server file:", err);
    }
    return false;
  };

  // 1. Initial Load: Retrieve persistent data from server local disk file once on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLocalDiskData = async () => {
      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const json = await res.json();
          let effectiveCourses = courses;
          let effectiveReports = weeklyReports;
          let effectiveSettings = settings;

          // If this browser holds edits newer than the disk file (e.g. the window was closed
          // before the debounced save reached the server), keep them instead of overwriting.
          const localModifiedAt = Date.parse(safeStorage.getItem(STORAGE_KEYS.LOCAL_MODIFIED_AT) || "");
          const serverSavedAt = Date.parse(json.data?.lastSaved || "");
          const localIsNewer =
            json.exists &&
            json.data &&
            !isNaN(localModifiedAt) &&
            (isNaN(serverSavedAt) || localModifiedAt > serverSavedAt);

          if (localIsNewer) {
            console.log("[Storage] Local changes are newer than the disk file. Restoring them and re-syncing.");
            // localStorage only caches a trimmed copy of weekly reports, so keep the full history from disk
            if (Array.isArray(json.data.weeklyReports)) {
              effectiveReports = json.data.weeklyReports;
              setWeeklyReports(json.data.weeklyReports);
            }
            if (json.data.lastSaved) {
              setLastSavedTime(json.data.lastSaved);
            }
          } else if (json.exists && json.data) {
            if (Array.isArray(json.data.courses)) {
              effectiveCourses = json.data.courses;
              setCourses(json.data.courses);
              safeStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(json.data.courses));
            }
            if (Array.isArray(json.data.weeklyReports)) {
              effectiveReports = json.data.weeklyReports;
              setWeeklyReports(json.data.weeklyReports);
              safeSaveWeeklyReports(json.data.weeklyReports);
            }
            if (json.data.settings) {
              effectiveSettings = { ...DEFAULT_USER_SETTINGS, ...json.data.settings };
              setSettings(prev => ({ ...prev, ...json.data.settings }));
              safeStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(effectiveSettings));
            }
            if (json.data.lastSaved) {
              setLastSavedTime(json.data.lastSaved);
            }
          }

          // Check if week boundary passed and auto-reset is enabled
          const thisWeekNow = getWeekId(new Date());
          if (
            effectiveSettings.autoResetMonday !== false &&
            effectiveSettings.lastResetWeekId &&
            effectiveSettings.lastResetWeekId !== thisWeekNow
          ) {
            console.log(`[AutoReset] New week detected on load (${thisWeekNow} vs ${effectiveSettings.lastResetWeekId}). Executing rollover...`);
            // Trigger server reset / archive
            try {
              const resetRes = await fetch("/api/trigger-reset", { method: "POST" });
              if (resetRes.ok) {
                const resetJson = await resetRes.json();
                if (resetJson.data) {
                  if (Array.isArray(resetJson.data.courses)) {
                    effectiveCourses = resetJson.data.courses;
                    setCourses(resetJson.data.courses);
                    safeStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(resetJson.data.courses));
                  }
                  if (Array.isArray(resetJson.data.weeklyReports)) {
                    effectiveReports = resetJson.data.weeklyReports;
                    setWeeklyReports(resetJson.data.weeklyReports);
                    safeSaveWeeklyReports(resetJson.data.weeklyReports);
                  }
                  if (resetJson.data.settings) {
                    effectiveSettings = { ...DEFAULT_USER_SETTINGS, ...resetJson.data.settings };
                    setSettings(prev => ({ ...prev, ...resetJson.data.settings }));
                    safeStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(effectiveSettings));
                  }
                }
              }
            } catch (err) {
              console.warn("Error running trigger-reset on startup:", err);
            }
          } else if (!effectiveSettings.lastResetWeekId) {
            setSettings(prev => ({ ...prev, lastResetWeekId: thisWeekNow }));
            effectiveSettings.lastResetWeekId = thisWeekNow;
          }

          // Initialize snapshot ref with loaded state so initial load does not trigger auto-save.
          // When restoring newer local edits, leave it empty so they are written back to disk.
          lastSavedSnapshotRef.current = localIsNewer
            ? ""
            : JSON.stringify({
                courses: effectiveCourses,
                weeklyReports: effectiveReports,
                settings: effectiveSettings,
              });
        }
      } catch (err) {
        console.warn("Error loading data from local disk:", err);
        lastSavedSnapshotRef.current = JSON.stringify({
          courses,
          weeklyReports,
          settings,
        });
      } finally {
        if (isMounted) {
          setIsDataLoadedFromServer(true);
        }
      }
    };

    fetchLocalDiskData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Change-driven auto-save: ONLY fires when user makes real changes to courses/reports/settings
  useEffect(() => {
    if (!isDataLoadedFromServer) return;

    const currentSnapshot = JSON.stringify({ courses, weeklyReports, settings });
    // If state hasn't changed compared to last saved snapshot, do nothing
    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    // Save to safe storage immediately on modification
    safeStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    safeSaveWeeklyReports(weeklyReports);
    safeStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    safeStorage.setItem(STORAGE_KEYS.LOCAL_MODIFIED_AT, new Date().toISOString());

    // Debounced disk save after user stops typing/dragging
    const timeout = setTimeout(async () => {
      const saved = await saveStateToLocalDisk(courses, weeklyReports, settings);
      if (saved) {
        lastSavedSnapshotRef.current = currentSnapshot;
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [courses, weeklyReports, settings, isDataLoadedFromServer]);

  // 3. Flush unsaved changes to disk when the window is closed or hidden,
  // so edits made within the debounce window are not lost.
  useEffect(() => {
    if (!isDataLoadedFromServer) return;

    const flushPendingChanges = () => {
      const { courses, weeklyReports, settings } = stateRef.current;
      const currentSnapshot = JSON.stringify({ courses, weeklyReports, settings });
      if (currentSnapshot === lastSavedSnapshotRef.current) return;

      try {
        const payload = new Blob([currentSnapshot], { type: "text/plain" });
        if (navigator.sendBeacon && navigator.sendBeacon("/api/data", payload)) {
          lastSavedSnapshotRef.current = currentSnapshot;
        }
      } catch (err) {
        console.warn("Could not flush pending changes on close:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushPendingChanges();
    };

    window.addEventListener("pagehide", flushPendingChanges);
    window.addEventListener("beforeunload", flushPendingChanges);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flushPendingChanges);
      window.removeEventListener("beforeunload", flushPendingChanges);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isDataLoadedFromServer]);

  // Export Backup File Handler
  const handleExportBackup = () => {
    try {
      const backupData = {
        courses,
        weeklyReports,
        settings,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `Study_Tracker_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Backup JSON file successfully exported.", "success");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Failed to export backup file.", "warning");
    }
  };

  // Import Backup File Handler
  const handleImportBackup = async (file: File): Promise<{ success: boolean; message?: string }> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || (!Array.isArray(parsed.courses) && !parsed.settings)) {
        return { success: false, message: "Invalid JSON format: missing courses or settings." };
      }

      if (Array.isArray(parsed.courses)) {
        setCourses(parsed.courses);
        safeStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(parsed.courses));
      }
      if (Array.isArray(parsed.weeklyReports)) {
        setWeeklyReports(parsed.weeklyReports);
        safeSaveWeeklyReports(parsed.weeklyReports);
      }
      if (parsed.settings) {
        setSettings(prev => ({ ...prev, ...parsed.settings }));
        safeStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify({ ...DEFAULT_USER_SETTINGS, ...parsed.settings }));
      }

      // Persist imported data to local disk file immediately
      await saveStateToLocalDisk(
        parsed.courses || courses,
        parsed.weeklyReports || weeklyReports,
        parsed.settings ? { ...settings, ...parsed.settings } : settings
      );

      showToast("Study data successfully imported and synced to disk!", "success");
      return { success: true };
    } catch (err: any) {
      console.error("Import error:", err);
      return { success: false, message: err?.message || "Failed to parse JSON file" };
    }
  };

  // Manual save to disk trigger
  const handleManualSaveToDisk = async (): Promise<boolean> => {
    const success = await saveStateToLocalDisk(courses, weeklyReports, settings);
    if (success) {
      showToast("Study data successfully flushed and saved to local disk file.", "success");
    }
    return success;
  };

  // Realtime timer ticker (mounted once)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updated = getCountdownToNextMonday(now);
      setCountdown(updated);

      const thisWeekNow = getWeekId(now);
      // Automatic Monday 12:00 AM Rollover Check:
      // If current time passed Monday 12 AM into a new ISO week, trigger weekly reset and disk archive
      if (
        stateRef.current.settings.autoResetMonday !== false &&
        stateRef.current.settings.lastResetWeekId &&
        thisWeekNow !== stateRef.current.settings.lastResetWeekId
      ) {
        console.log(`[AutoReset] Monday 12 AM boundary crossed (${thisWeekNow} vs ${stateRef.current.settings.lastResetWeekId}). Executing automatic rollover...`);
        performWeeklyReset(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Weekly Reset Execution Handler (Stores previous week to local folder and starts fresh)
  const performWeeklyReset = async (isManual: boolean = true) => {
    const currentCourses = stateRef.current.courses;
    const currentSettings = stateRef.current.settings;
    const currentReports = stateRef.current.weeklyReports;

    const now = new Date();
    const activeWeekId = getWeekId(now);
    // If manual or triggered immediately, the week being archived is either lastResetWeekId or previous week ID
    const archiveWeekId = currentSettings.lastResetWeekId || (isManual ? activeWeekId : getPreviousWeekId(now));
    const archiveWeekLabel = isManual ? getWeekRangeLabel(now) : getPreviousWeekRangeLabel(now);

    const totalHours = currentCourses.reduce((sum, c) => sum + (Number(c.hoursCompleted) || 0), 0);
    const totalTargetHours = currentCourses.reduce((sum, c) => sum + (Number(c.targetHours) || 0), 0);
    const completionPercentage = totalTargetHours > 0 ? Math.round((totalHours / totalTargetHours) * 100) : 0;

    // 1. Create comprehensive archived WeeklyReport
    const newReport: WeeklyReport = {
      id: `report-${archiveWeekId}-${Date.now()}`,
      weekId: archiveWeekId,
      weekStartDate: isManual ? getMondayOfCurrentWeek(now).toISOString() : getPreviousMondayMidnight(now).toISOString(),
      weekEndDate: now.toISOString(),
      weekLabel: archiveWeekLabel,
      archivedAt: now.toISOString(),
      totalHours,
      totalTargetHours,
      completionPercentage,
      coursesSnapshot: JSON.parse(JSON.stringify(currentCourses)),
      emailSentTo: currentSettings.studentEmail || "",
      emailSentAt: now.toISOString(),
    };

    // 2. Reset active hours and notes for all courses to 0 for the fresh week
    const resetCourses: Course[] = currentCourses.map(c => ({
      ...c,
      hoursCompleted: 0,
      notes: "",
      lastUpdated: now.toISOString(),
    }));

    // 3. Prepend to weekly reports
    const updatedReports = [newReport, ...currentReports.filter(r => r.weekId !== archiveWeekId)];

    // 4. Update settings with new active week ID
    const updatedSettings: UserSettings = {
      ...currentSettings,
      lastResetWeekId: activeWeekId,
    };

    // Update React states immediately
    setCourses(resetCourses);
    setWeeklyReports(updatedReports);
    setSettings(updatedSettings);

    // Sync to safe storage
    safeStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(resetCourses));
    safeSaveWeeklyReports(updatedReports);
    safeStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updatedSettings));

    // 5. Store archive to local folder file (data/archives/week-[ID].json) and save fresh state to disk
    try {
      const archiveRes = await fetch("/api/archive-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report: newReport,
          courses: resetCourses,
          weeklyReports: updatedReports,
          settings: updatedSettings,
        }),
      });
      if (archiveRes.ok) {
        const resJson = await archiveRes.json();
        setLastSavedTime(resJson.savedAt || new Date().toISOString());
        lastSavedSnapshotRef.current = JSON.stringify({
          courses: resetCourses,
          weeklyReports: updatedReports,
          settings: updatedSettings,
        });
      }
    } catch (err) {
      console.warn("Failed to archive week via server API:", err);
      // Fallback save
      saveStateToLocalDisk(resetCourses, updatedReports, updatedSettings);
    }

    showToast(
      isManual 
        ? `Monday 12 AM Reset executed! Previous week (${archiveWeekId}) stored in local archives folder & courses started afresh.` 
        : `Automatic Monday 12 AM rollover executed! Week ${archiveWeekId} archived to local disk & fresh week started.`,
      "success"
    );

    // Deliver email report automatically if configured
    if (updatedSettings.autoEmailReport || isManual) {
      if (!isManual && updatedSettings.studentEmail && updatedSettings.smtpConfig?.host && updatedSettings.smtpConfig?.user) {
        // Generate AI fallback summary so it's not empty
        const completionRate = newReport.totalTargetHours > 0 ? Math.round((newReport.totalHours / newReport.totalTargetHours) * 100) : 0;
        const grade = completionRate >= 90 ? "A" : completionRate >= 75 ? "B+" : completionRate >= 50 ? "B" : "C+";
        const topCourse = [...newReport.coursesSnapshot].sort((a, b) => b.hoursCompleted - a.hoursCompleted)[0];
        const aiSummary = {
          executiveSummary: `During ${archiveWeekLabel}, you logged ${newReport.totalHours} hours across ${newReport.coursesSnapshot.length} courses (${completionRate}% weekly target completion rate).`,
          grade,
          highlightSubject: topCourse ? `${topCourse.name} (${topCourse.hoursCompleted}h)` : "University Study",
          attentionSubject: newReport.coursesSnapshot.find(c => c.hoursCompleted < (c.targetHours || 12) * 0.6)?.name || "All courses in healthy pacing",
          strengths: [
            `Maintained tracking across ${newReport.coursesSnapshot.length} active courses.`,
            "Recorded study hours consistently before the weekly deadline."
          ],
          actionablePlan: [
            "Plan 2-hour morning deep work blocks for higher focus.",
            "Review key concept flashcards or problem sets within 24 hours of each lecture."
          ],
          encouragementQuote: "Consistency is the DNA of academic mastery.",
          aiGenerated: false,
        };
        const reportWithSummary = { ...newReport, aiSummary };
        const htmlContent = generateReportHtml(reportWithSummary, updatedSettings);
        const textContent = generatePlainTextSummary(reportWithSummary, updatedSettings);
        
        fetch("/api/send-email-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toEmail: updatedSettings.studentEmail,
            subject: `Weekly University Course Progress Report: ${archiveWeekLabel} - ${updatedSettings.studentName}`,
            htmlContent,
            textContent,
            weekLabel: archiveWeekLabel,
            smtpConfig: updatedSettings.smtpConfig,
            stats: {
              totalHours: newReport.totalHours,
              totalTargetHours: newReport.totalTargetHours,
              completionPercentage: completionRate,
            }
          })
        }).then(res => res.json()).then(data => {
            if (data.success) {
               showToast(`Automatic weekly report emailed to ${updatedSettings.studentEmail}`, "success");
            } else {
               setSelectedReportForView(newReport);
               setIsEmailModalOpen(true);
            }
        }).catch(() => {
           setSelectedReportForView(newReport);
           setIsEmailModalOpen(true);
        });
      } else {
        setSelectedReportForView(newReport);
        setIsEmailModalOpen(true);
      }
    }
  };

  // Course Handlers
  const handleUpdateHours = (id: string, hours: number) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, hoursCompleted: hours, lastUpdated: new Date().toISOString() } : c))
    );
  };

  const handleUpdateNotes = (id: string, noteList: import("./types").CourseNote[]) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, noteList, notes: undefined, lastUpdated: new Date().toISOString() } : c))
    );
    showToast("Study notes updated for course.", "info");
  };

  const handleSaveCourse = (courseData: Partial<Course>) => {
    if (editingCourse) {
      setCourses(prev =>
        prev.map(c => (c.id === editingCourse.id ? { ...c, ...courseData } : c))
      );
      showToast(`Updated course ${courseData.code || courseData.name}`, "success");
    } else {
      const newCourse: Course = {
        id: "course-" + Date.now(),
        name: courseData.name || "New Course",
        code: courseData.code || "SUBJ 101",
        instructor: courseData.instructor || "",
        hoursCompleted: courseData.hoursCompleted || 0,
        targetHours: courseData.targetHours || settings.defaultSubjectTarget || 12,
        color: courseData.color || "indigo",
        category: courseData.category || "Core Major",
        notes: courseData.notes || "",
        backgroundImage: courseData.backgroundImage,
        backgroundDim: courseData.backgroundDim ?? 50,
        lastUpdated: new Date().toISOString(),
      };
      setCourses(prev => [...prev, newCourse]);
      showToast(`Added new course: ${newCourse.code}`, "success");
    }
    setEditingCourse(null);
  };

  const handleDeleteCourse = (id: string) => {
    const course = courses.find(c => c.id === id);
    if (window.confirm(`Are you sure you want to delete ${course?.code || "this course"}?`)) {
      setCourses(prev => prev.filter(c => c.id !== id));
      showToast(`Course removed.`, "info");
    }
  };

  const handleArchiveReport = (report: WeeklyReport) => {
    setWeeklyReports(prev => {
      const exists = prev.some(r => r.id === report.id);
      if (exists) {
        return prev.map(r => (r.id === report.id ? report : r));
      }
      return [report, ...prev];
    });
    showToast(`Weekly report saved to history.`, "success");
  };

  const handleDeleteArchivedReport = (reportId: string) => {
    setWeeklyReports(prev => prev.filter(r => r.id !== reportId));
    showToast("Archived report deleted.", "info");
  };

  // Filtered & Searched Course list
  const safeCourses = Array.isArray(courses) ? courses : [];
  const filteredCourses = useMemo(() => {
    return safeCourses.filter(c => {
      if (!c) return false;
      const hoursCompleted = Number(c.hoursCompleted) || 0;
      const targetHours = Number(c.targetHours) || 12;

      // Category / Status filter
      if (selectedFilter === "completed" && hoursCompleted < targetHours) return false;
      if (selectedFilter === "in-progress" && (hoursCompleted === 0 || hoursCompleted >= targetHours)) return false;
      if (selectedFilter === "behind" && hoursCompleted >= (targetHours / 2)) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (c.name || "").toLowerCase().includes(q);
        const matchesCode = (c.code || "").toLowerCase().includes(q);
        const matchesInstructor = (c.instructor || "").toLowerCase().includes(q);
        const matchesCategory = (c.category || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesInstructor && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [safeCourses, selectedFilter, searchQuery]);

  const completedCount = safeCourses.filter(c => c && (Number(c.hoursCompleted) || 0) >= (Number(c.targetHours) || 12)).length;

  // Resolve Active Background Theme safely
  const activeBgPreset: BackgroundPreset = useMemo(
    () => resolveBackgroundPreset(settings?.backgroundStyle),
    [settings?.backgroundStyle]
  );

  const isCustomBg = settings?.backgroundStyle === "custom" && Boolean(settings?.customBackgroundUrl);

  const dimOpacity = (settings?.backgroundDim ?? 65) / 100;
  const blurAmount = settings?.backgroundBlur ?? 0;

  return (
    <div 
      className="min-h-screen relative flex flex-col text-ink"
      style={{
        fontFamily: PIXEL_FONT_FAMILY,
        backgroundColor: isCustomBg ? "#2a2140" : activeBgPreset.style.backgroundColor,
      }}
    >
      {isCustomBg ? (
        <>
          {/* Custom uploaded wallpaper */}
          <div 
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
            style={{
              backgroundImage: `url("${settings.customBackgroundUrl}")`,
              filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
              transform: blurAmount > 0 ? "scale(1.03)" : "none",
            }}
          />
          {/* Dimming & Contrast Overlay */}
          <div 
            className="fixed inset-0 z-0 bg-ink transition-opacity duration-300 pointer-events-none"
            style={{ opacity: dimOpacity }}
          />
        </>
      ) : (
        /* Tiled doodle pattern */
        <div 
          className="fixed inset-0 z-0 transition-colors duration-500"
          style={activeBgPreset.style}
        />
      )}

      {/* Content wrapper sitting above wallpaper background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Header */}
        <Navbar
          weekLabel={currentWeekLabel}
          countdown={countdown}
          settings={settings}
          lastSavedTime={lastSavedTime}
          onOpenAddCourse={() => {
            setEditingCourse(null);
            setIsAddModalOpen(true);
          }}
          onOpenEmailReport={() => {
            setSelectedReportForView(null);
            setIsEmailModalOpen(true);
          }}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          completedCoursesCount={completedCount}
          totalCoursesCount={courses.length}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Weekly Countdown & Automated Reset Status Banner */}
          <CountdownCard
            weekLabel={currentWeekLabel}
            countdown={countdown}
            settings={settings}
            onTriggerReset={() => setIsResetModalOpen(true)}
            onOpenEmailReport={() => {
              setSelectedReportForView(null);
              setIsEmailModalOpen(true);
            }}
          />

          {/* Global Statistics & Search / Filter Tabs */}
          <OverviewMetrics
            courses={courses}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Course Cards Grid */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="doodle-card inline-flex items-center gap-2 px-4 py-1.5 text-lg font-bold -rotate-1">
                <BookOpen className="w-5 h-5 text-pink-500" />
                <span className="doodle-squiggle">My Courses</span>
                <span className="doodle-chip bg-lemon">{filteredCourses.length}</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  id="btn-past-notes-dashboard"
                  onClick={() => setIsNotesDashboardModalOpen(true)}
                  className="doodle-btn bg-mint px-3 py-1.5 text-xs"
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Past Stats & Notes</span>
                  <span className="sm:hidden">Past Stats</span>
                </button>
                <button
                  id="btn-add-subject-body"
                  onClick={() => {
                    setEditingCourse(null);
                    setIsAddModalOpen(true);
                  }}
                  className="doodle-btn bg-bubblegum px-3 py-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="doodle-card p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-sky-pop border-2 border-ink shadow-doodle-sm flex items-center justify-center mx-auto rotate-6 animate-bob">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold">No courses match your filter</h3>
                <p className="text-sm text-ink/70 max-w-sm mx-auto">
                  Try clearing search terms or adding a new university course to your weekly tracker.
                </p>
                <button
                  onClick={() => {
                    setSelectedFilter("all");
                    setSearchQuery("");
                  }}
                  className="doodle-btn bg-lemon px-4 py-2 text-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onUpdateHours={handleUpdateHours}
                    onUpdateNotes={handleUpdateNotes}
                    onEditCourse={courseToEdit => {
                      setEditingCourse(courseToEdit);
                      setIsAddModalOpen(true);
                    }}
                    onDeleteCourse={handleDeleteCourse}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 mb-6 px-4">
          <div className="doodle-card max-w-3xl mx-auto px-6 py-5 text-center text-xs space-y-2 rotate-[0.4deg]">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="doodle-btn bg-white px-3 py-1 text-xs"
              >
                Settings & Preferences
              </button>
              <button
                type="button"
                onClick={() => setIsAppearanceModalOpen(true)}
                className="doodle-btn bg-grape px-3 py-1 text-xs"
              >
                <Palette className="w-3.5 h-3.5" />
                Doodle Themes
              </button>
            </div>
            <p className="font-semibold text-sm">
              University Course Weekly Progress Tracker ✦ Customizable Study Targets
            </p>
            <p className="text-ink/60">
              Automatic reset triggers every Monday at 12:00 AM. Reports auto-generated with Gemini Academic Insights.
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <CourseModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCourse(null);
          }}
          onSave={handleSaveCourse}
          initialCourse={editingCourse}
        />
      )}

      {isAppearanceModalOpen && (
        <AppearanceModal
          isOpen={isAppearanceModalOpen}
          onClose={() => setIsAppearanceModalOpen(false)}
          settings={settings}
          onUpdateSettings={(updated) => {
            setSettings(prev => ({ ...prev, ...updated }));
          }}
        />
      )}

      {isEmailModalOpen && (
        <EmailReportModal
          isOpen={isEmailModalOpen}
          onClose={() => {
            setIsEmailModalOpen(false);
            setSelectedReportForView(null);
          }}
          courses={selectedReportForView ? selectedReportForView.coursesSnapshot : courses}
          weekLabel={selectedReportForView ? selectedReportForView.weekLabel : currentWeekLabel}
          weekId={selectedReportForView ? selectedReportForView.weekId : currentWeekId}
          settings={settings}
          onUpdateEmail={newEmail => setSettings(prev => ({ ...prev, studentEmail: newEmail }))}
          onSaveReportToArchive={handleArchiveReport}
          existingReport={selectedReportForView}
        />
      )}

      {isHistoryModalOpen && (
        <WeeklyHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          reports={weeklyReports}
          settings={settings}
          onViewReport={rep => {
            setSelectedReportForView(rep);
            setIsEmailModalOpen(true);
          }}
          onDeleteReport={handleDeleteArchivedReport}
        />
      )}

      {isResetModalOpen && (
        <ResetConfirmModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirmReset={() => performWeeklyReset(true)}
          courses={courses}
          weekLabel={currentWeekLabel}
          settings={settings}
          countdown={countdown}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          lastSavedTime={lastSavedTime}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onManualSaveToDisk={handleManualSaveToDisk}
          onSaveSettings={(newSettings, applyToExistingCourses) => {
            setSettings(newSettings);
            if (applyToExistingCourses && newSettings.defaultSubjectTarget) {
              setCourses(prev =>
                prev.map(c => ({
                  ...c,
                  targetHours: newSettings.defaultSubjectTarget,
                  hoursCompleted: Math.min(c.hoursCompleted, newSettings.defaultSubjectTarget),
                  lastUpdated: new Date().toISOString(),
                }))
              );
              showToast(`Settings saved & target updated to ${newSettings.defaultSubjectTarget}h across all courses.`, "success");
            } else {
              showToast("Settings and report preferences saved.", "success");
            }
          }}
          onOpenAppearance={() => setIsAppearanceModalOpen(true)}
        />
      )}

      {isNotesDashboardModalOpen && (
        <PreviousWeeksDashboardModal
          isOpen={isNotesDashboardModalOpen}
          onClose={() => setIsNotesDashboardModalOpen(false)}
          reports={weeklyReports}
        />
      )}

      {/* Small Notepad on Left Edge for Daily Handwritten To-Do */}
      <DailyNotepad />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={`doodle-card fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 text-sm font-semibold animate-doodle-pop ${
          toastMessage.type === "success" ? "bg-mint" : toastMessage.type === "warning" ? "bg-tangerine" : "bg-sky-pop"
        }`}>
          {toastMessage.type === "success" && <Check className="w-4 h-4" />}
          {toastMessage.type !== "success" && <AlertCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
