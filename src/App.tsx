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
import { Course, WeeklyReport, UserSettings } from "./types";
import { INITIAL_COURSES, DEFAULT_USER_SETTINGS } from "./data/defaultCourses";
import { FONT_OPTIONS, BACKGROUND_PRESETS } from "./data/themes";
import { 
  getWeekId, 
  getWeekRangeLabel, 
  getCountdownToNextMonday, 
  getMondayOfCurrentWeek 
} from "./utils/dateUtils";
import { Plus, BookOpen, Sparkles, Check, AlertCircle, Palette } from "lucide-react";
import confetti from "canvas-confetti";

export default function App() {
  // Flags and refs to track change state and prevent unnecessary saves
  const [isDataLoadedFromServer, setIsDataLoadedFromServer] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const lastSavedSnapshotRef = useRef<string>("");

  // State initialization with localStorage fallback
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("uni_courses_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved courses", e);
      }
    }
    return INITIAL_COURSES;
  });

  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(() => {
    const saved = localStorage.getItem("uni_weekly_reports");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved reports", e);
      }
    }
    return [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem("uni_user_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved settings", e);
      }
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

          if (json.exists && json.data) {
            if (Array.isArray(json.data.courses) && json.data.courses.length > 0) {
              effectiveCourses = json.data.courses;
              setCourses(json.data.courses);
              localStorage.setItem("uni_courses_data", JSON.stringify(json.data.courses));
            }
            if (Array.isArray(json.data.weeklyReports)) {
              effectiveReports = json.data.weeklyReports;
              setWeeklyReports(json.data.weeklyReports);
              localStorage.setItem("uni_weekly_reports", JSON.stringify(json.data.weeklyReports));
            }
            if (json.data.settings) {
              effectiveSettings = { ...DEFAULT_USER_SETTINGS, ...json.data.settings };
              setSettings(prev => ({ ...prev, ...json.data.settings }));
              localStorage.setItem("uni_user_settings", JSON.stringify(effectiveSettings));
            }
            if (json.data.lastSaved) {
              setLastSavedTime(json.data.lastSaved);
            }
          }

          // Initialize snapshot ref with loaded state so initial load does not trigger auto-save
          lastSavedSnapshotRef.current = JSON.stringify({
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

    // Save to localStorage immediately on modification
    localStorage.setItem("uni_courses_data", JSON.stringify(courses));
    localStorage.setItem("uni_weekly_reports", JSON.stringify(weeklyReports));
    localStorage.setItem("uni_user_settings", JSON.stringify(settings));

    // Debounced disk save after user stops typing/dragging
    const timeout = setTimeout(async () => {
      const saved = await saveStateToLocalDisk(courses, weeklyReports, settings);
      if (saved) {
        lastSavedSnapshotRef.current = currentSnapshot;
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [courses, weeklyReports, settings, isDataLoadedFromServer]);

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
        localStorage.setItem("uni_courses_data", JSON.stringify(parsed.courses));
      }
      if (Array.isArray(parsed.weeklyReports)) {
        setWeeklyReports(parsed.weeklyReports);
        localStorage.setItem("uni_weekly_reports", JSON.stringify(parsed.weeklyReports));
      }
      if (parsed.settings) {
        setSettings(prev => ({ ...prev, ...parsed.settings }));
        localStorage.setItem("uni_user_settings", JSON.stringify({ ...DEFAULT_USER_SETTINGS, ...parsed.settings }));
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
      const updated = getCountdownToNextMonday();
      setCountdown(updated);

      // Check if timer just rolled over to Monday 12 AM (totalSeconds <= 0)
      if (updated.totalSeconds === 0 && stateRef.current.settings.autoResetMonday) {
        performWeeklyReset(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check if a new week began since the app was last opened
  useEffect(() => {
    const savedLastWeek = settings.lastResetWeekId;
    if (savedLastWeek && savedLastWeek !== currentWeekId && settings.autoResetMonday) {
      console.log(`New week detected (${currentWeekId} vs ${savedLastWeek}). Performing automatic reset...`);
      performWeeklyReset(false);
    } else if (!savedLastWeek) {
      setSettings(prev => ({ ...prev, lastResetWeekId: currentWeekId }));
    }
  }, []);

  // Weekly Reset Execution Handler
  const performWeeklyReset = (isManual: boolean = true) => {
    const totalHours = courses.reduce((sum, c) => sum + c.hoursCompleted, 0);
    const totalTargetHours = courses.reduce((sum, c) => sum + c.targetHours, 0);
    const completionPercentage = totalTargetHours > 0 ? Math.round((totalHours / totalTargetHours) * 100) : 0;

    // 1. Create archived WeeklyReport
    const newReport: WeeklyReport = {
      id: "report-" + Date.now(),
      weekId: currentWeekId,
      weekStartDate: getMondayOfCurrentWeek().toISOString(),
      weekEndDate: new Date().toISOString(),
      weekLabel: currentWeekLabel,
      archivedAt: new Date().toISOString(),
      totalHours,
      totalTargetHours,
      completionPercentage,
      coursesSnapshot: JSON.parse(JSON.stringify(courses)),
      emailSentTo: settings.studentEmail,
      emailSentAt: new Date().toISOString(),
    };

    setWeeklyReports(prev => [newReport, ...prev.filter(r => r.weekId !== currentWeekId)]);

    // 2. Reset active hours for all courses to 0 for incoming week
    setCourses(prev => prev.map(c => ({ ...c, hoursCompleted: 0, notes: "" })));

    // 3. Update last reset week ID in settings
    setSettings(prev => ({ ...prev, lastResetWeekId: currentWeekId }));

    showToast(
      isManual 
        ? "Monday 12 AM Reset executed! Progress archived and sliders reset to 0h." 
        : "Automatic Monday 12 AM rollover executed! Fresh weekly cycle started.",
      "success"
    );

    // Open email report modal automatically if configured
    if (settings.autoEmailReport || isManual) {
      setSelectedReportForView(newReport);
      setIsEmailModalOpen(true);
    }
  };

  // Course Handlers
  const handleUpdateHours = (id: string, hours: number) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, hoursCompleted: hours, lastUpdated: new Date().toISOString() } : c))
    );
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, notes, lastUpdated: new Date().toISOString() } : c))
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
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      // Category / Status filter
      if (selectedFilter === "completed" && c.hoursCompleted < c.targetHours) return false;
      if (selectedFilter === "in-progress" && (c.hoursCompleted === 0 || c.hoursCompleted >= c.targetHours)) return false;
      if (selectedFilter === "behind" && c.hoursCompleted >= (c.targetHours / 2)) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesInstructor = c.instructor?.toLowerCase().includes(q);
        const matchesCategory = c.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesInstructor && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [courses, selectedFilter, searchQuery]);

  const completedCount = courses.filter(c => c.hoursCompleted >= c.targetHours).length;

  // Resolve Active Font
  const activeFont = useMemo(() => {
    return FONT_OPTIONS.find(f => f.id === (settings.fontFamily || "plus-jakarta")) || FONT_OPTIONS[0];
  }, [settings.fontFamily]);

  // Resolve Active Background Theme
  const activeBgPreset = useMemo(() => {
    return BACKGROUND_PRESETS.find(b => b.id === (settings.backgroundStyle || "slate")) || BACKGROUND_PRESETS[0];
  }, [settings.backgroundStyle]);

  const isCustomBg = settings.backgroundStyle === "custom" && Boolean(settings.customBackgroundUrl);
  const isWallpaper = isCustomBg || activeBgPreset.category === "Immersive Wallpaper";

  const dimOpacity = (settings.backgroundDim ?? 65) / 100;
  const blurAmount = settings.backgroundBlur ?? 0;

  return (
    <div 
      className="min-h-screen relative flex flex-col transition-all duration-300 selection:bg-indigo-500 selection:text-white"
      style={{
        fontFamily: activeFont.family,
        backgroundColor: activeBgPreset.style.backgroundColor || "#0f172a",
      }}
    >
      {/* Background Image Layer if preset wallpaper or custom */}
      {isWallpaper && (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{
            backgroundImage: isCustomBg 
              ? `url("${settings.customBackgroundUrl}")` 
              : activeBgPreset.style.backgroundImage,
            filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
            transform: blurAmount > 0 ? "scale(1.03)" : "none",
          }}
        />
      )}

      {/* Background Gradient Layer for Non-Wallpaper presets */}
      {!isWallpaper && activeBgPreset.style.backgroundImage && (
        <div 
          className="fixed inset-0 z-0 transition-all duration-500"
          style={{
            backgroundImage: activeBgPreset.style.backgroundImage,
          }}
        />
      )}

      {/* Dimming & Contrast Overlay */}
      {isWallpaper && (
        <div 
          className="fixed inset-0 z-0 bg-slate-950 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: dimOpacity }}
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2 drop-shadow-xs">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>University Courses ({filteredCourses.length})</span>
              </h2>

              <div className="flex items-center space-x-2">
                <button
                  id="btn-add-subject-body"
                  onClick={() => {
                    setEditingCourse(null);
                    setIsAddModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-12 text-center border border-slate-700/80 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">No courses match your filter</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try clearing search terms or adding a new university course to your weekly tracker.
                </p>
                <button
                  onClick={() => {
                    setSelectedFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
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
        <footer className="bg-slate-950/90 backdrop-blur-md border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Settings & Preferences
              </button>
            </div>
            <p className="text-slate-400 font-medium">
              University Course Weekly Progress Tracker • Customizable Study Targets
            </p>
            <p className="text-slate-600">
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

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 bg-slate-900 text-white border border-slate-700 shadow-xl rounded-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toastMessage.type === "success" && <Check className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === "info" && <AlertCircle className="w-4 h-4 text-indigo-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
