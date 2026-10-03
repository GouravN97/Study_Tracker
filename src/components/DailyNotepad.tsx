import React, { useState, useEffect, useRef } from "react";
import {
  NotebookPen,
  X,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { safeStorage, STORAGE_KEYS } from "../utils/storageUtils";

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
  date: string; // Exact calendar date in YYYY-MM-DD
  createdAt: string;
}

const STORAGE_KEY = STORAGE_KEYS.DAILY_NOTEPAD;

/** Helper: format Date to local YYYY-MM-DD string */
function getLocalDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Helper: parse YYYY-MM-DD string to Date in local time */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Helper: offset a YYYY-MM-DD string by a number of days */
function offsetDateStr(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return getLocalDateStr(date);
}

export function DailyNotepad() {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const notepadRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Today's exact calendar date (YYYY-MM-DD)
  const todayStr = getLocalDateStr(new Date());

  // Currently viewed date on the notepad (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Load and sanitize tasks from localStorage
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const sanitized: DailyTask[] = [];
            for (const item of parsed) {
              if (
                !item ||
                typeof item !== "object" ||
                typeof item.id !== "string" ||
                typeof item.text !== "string"
              ) {
                continue;
              }

              let taskDate = item.date;

              // Check if taskDate is a valid YYYY-MM-DD
              if (
                !taskDate ||
                typeof taskDate !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(taskDate)
              ) {
                // If it was keyed by day-of-week (e.g. "Monday") or missing,
                // map it to createdAt date or to the previous week so it does NOT pollute today's fresh Monday list!
                if (item.createdAt && !isNaN(new Date(item.createdAt).getTime())) {
                  taskDate = getLocalDateStr(new Date(item.createdAt));
                } else {
                  // Assign to last Monday (7 days before current Monday)
                  const now = new Date();
                  const day = now.getDay();
                  const diff = (day === 0 ? -6 : 1) - day - 7;
                  const prevMon = new Date(now);
                  prevMon.setDate(prevMon.getDate() + diff);
                  taskDate = getLocalDateStr(prevMon);
                }
              }

              sanitized.push({
                id: item.id,
                text: item.text,
                completed: Boolean(item.completed),
                date: taskDate,
                createdAt: item.createdAt || new Date().toISOString(),
              });
            }
            return sanitized;
          }
        }
    } catch (e) {
      console.warn("Failed to parse initial daily tasks:", e);
    }

    // Default sample starter tasks for brand-new users only
    return [
      {
        id: "task-init-1",
        text: "Review lecture slides & key concepts",
        completed: false,
        date: todayStr,
        createdAt: new Date().toISOString(),
      },
      {
        id: "task-init-2",
        text: "Complete 45-minute focused problem set",
        completed: false,
        date: todayStr,
        createdAt: new Date().toISOString(),
      },
      {
        id: "task-init-3",
        text: "Log study hours on tracker",
        completed: false,
        date: todayStr,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [newTaskText, setNewTaskText] = useState("");

  // Persist tasks to localStorage
  const saveTasks = (updated: DailyTask[]) => {
    const sanitized = (updated || []).filter(
      (t): t is DailyTask => Boolean(t && typeof t === "object" && t.id && t.text && t.date)
    );
    setTasks(sanitized);
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  };

  // Close notepad when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        notepadRef.current &&
        !notepadRef.current.contains(e.target as Node)
      ) {
        const trigger = document.getElementById("notepad-toggle-btn");
        if (trigger && trigger.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when notepad opens or when date changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, selectedDate]);

  // Derived task subsets
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Tasks for the currently viewed date
  const selectedDateTasks = safeTasks.filter((t) => t && t.date === selectedDate);
  const selectedCompletedCount = selectedDateTasks.filter((t) => Boolean(t?.completed)).length;
  const selectedPendingCount = Math.max(0, selectedDateTasks.length - selectedCompletedCount);

  // Today's tasks (for the pinned button counter)
  const todayTasks = safeTasks.filter((t) => t && t.date === todayStr);
  const todayCompletedCount = todayTasks.filter((t) => Boolean(t?.completed)).length;
  const todayPendingCount = Math.max(0, todayTasks.length - todayCompletedCount);

  // Check for unfinished tasks strictly prior to today
  const unfinishedPriorTasks = safeTasks.filter((t) => {
    if (!t || t.completed || !t.date) return false;
    return t.date < todayStr;
  });

  // Calculate 7 days of the current week surrounding selectedDate (Monday to Sunday)
  const currentWeekDays = React.useMemo(() => {
    const ref = parseLocalDate(selectedDate);
    const day = ref.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() + diff);

    const daysList = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = getLocalDateStr(d);
      const dayTasks = safeTasks.filter((t) => t && t.date === dStr);
      const hasTasks = dayTasks.length > 0;
      const allDone = hasTasks && dayTasks.every((t) => t.completed);

      daysList.push({
        dateStr: dStr,
        dayShort: d.toLocaleDateString("en-US", { weekday: "narrow" }), // M, T, W...
        dayAbbr: d.toLocaleDateString("en-US", { weekday: "short" }), // Mon, Tue...
        dayNum: d.getDate(),
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        hasTasks,
        allDone,
        taskCount: dayTasks.length,
      });
    }
    return daysList;
  }, [selectedDate, safeTasks, todayStr]);

  // Human friendly display title for selected date
  const selectedDateLabel = React.useMemo(() => {
    const dateObj = parseLocalDate(selectedDate);
    const formatted = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    if (selectedDate === todayStr) {
      return `Today • ${formatted}`;
    }

    const yesterdayStr = offsetDateStr(todayStr, -1);
    if (selectedDate === yesterdayStr) {
      return `Yesterday • ${formatted}`;
    }

    const tomorrowStr = offsetDateStr(todayStr, 1);
    if (selectedDate === tomorrowStr) {
      return `Tomorrow • ${formatted}`;
    }

    return formatted;
  }, [selectedDate, todayStr]);

  // Action: Add new task to currently selected date
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTaskText.trim();
    if (!trimmed) return;

    const newTask: DailyTask = {
      id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      text: trimmed,
      completed: false,
      date: selectedDate,
      createdAt: new Date().toISOString(),
    };

    saveTasks([newTask, ...safeTasks]);
    setNewTaskText("");
  };

  // Action: Toggle completed status of task
  const handleToggleTask = (id: string) => {
    const updated = safeTasks.map((t) =>
      t && t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  // Action: Delete task
  const handleDeleteTask = (id: string) => {
    const updated = safeTasks.filter((t) => Boolean(t && t.id !== id));
    saveTasks(updated);
  };

  // Action: Clear completed tasks for the current viewed day
  const handleClearCompleted = () => {
    const updated = safeTasks.filter(
      (t) => !(t && t.date === selectedDate && t.completed)
    );
    saveTasks(updated);
  };

  // Action: Carry over unfinished prior tasks into the currently viewed day (e.g. today)
  const handleCarryOverToCurrentView = () => {
    if (unfinishedPriorTasks.length === 0) return;
    const priorIds = new Set(unfinishedPriorTasks.map((t) => t.id));
    const updated = safeTasks.map((t) => {
      if (t && priorIds.has(t.id)) {
        return { ...t, date: selectedDate };
      }
      return t;
    });
    saveTasks(updated);
  };

  const isViewingToday = selectedDate === todayStr;

  return (
    <>
      {/* Pinned Notepad Icon Button on Left Edge Near Top */}
      <div className="fixed left-0 top-24 sm:top-28 z-40">
        <button
          id="notepad-toggle-btn"
          type="button"
          onClick={() => {
            setSelectedDate(todayStr); // Always open directly to today
            setIsOpen((prev) => !prev);
          }}
          className={`group flex items-center bg-lemon text-ink border-[2.5px] border-l-0 border-ink shadow-doodle rounded-r-xl transition-all duration-200 cursor-pointer ${
            isOpen
              ? "pl-2 pr-3 py-2 bg-tangerine"
              : "pl-2 pr-2.5 py-2 hover:translate-x-1"
          }`}
          title="Open Daily To-Do Notepad"
          aria-label="Daily To-Do List Notepad"
        >
          <div className="relative flex items-center justify-center">
            <NotebookPen className="w-5 h-5 transition-transform group-hover:-rotate-12 group-hover:scale-110" />
            {todayPendingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[17px] h-[17px] px-1 bg-bubblegum text-ink text-[10px] font-bold rounded-full border-2 border-ink">
                {todayPendingCount}
              </span>
            )}
          </div>

          <span className="hidden md:inline-block ml-2 font-bold text-sm leading-none">
            To-Do
          </span>
        </button>
      </div>

      {/* Notepad Box Modal / Drawer */}
      {isOpen && (
        <div
          ref={notepadRef}
          className="fixed left-2 sm:left-4 top-20 sm:top-24 z-50 w-[calc(100vw-1rem)] max-w-[390px] sm:max-w-[430px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden border-[3px] border-ink shadow-doodle-lg animate-doodle-pop"
          style={{
            transformOrigin: "top left",
          }}
        >
          {/* Top Yellow Bar with Date Navigation & Quick Day Switcher */}
          <div className="bg-lemon border-b-[3px] border-ink text-ink flex flex-col">
            {/* Top Row: Navigation Controls & Close */}
            <div className="px-3 py-2 flex items-center justify-between">
              {/* Day Nav: Prev, Today, Next */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setSelectedDate((prev) => offsetDateStr(prev, -1))}
                  className="p-1 hover:bg-yellow-500/50 rounded text-yellow-950 transition-colors cursor-pointer"
                  title="Previous Day"
                  aria-label="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-2 py-0.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                    isViewingToday
                      ? "bg-yellow-950 text-yellow-100 shadow-xs"
                      : "bg-yellow-500/40 hover:bg-yellow-500/80 text-yellow-950"
                  }`}
                  title="Jump to Today's To-Do List"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDate((prev) => offsetDateStr(prev, 1))}
                  className="p-1 hover:bg-yellow-500/50 rounded text-yellow-950 transition-colors cursor-pointer"
                  title="Next Day"
                  aria-label="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Date Picker Input */}
                <div className="relative inline-block ml-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (dateInputRef.current) {
                        try {
                          dateInputRef.current.showPicker();
                        } catch {
                          dateInputRef.current.focus();
                        }
                      }
                    }}
                    className="p-1 hover:bg-yellow-500/50 rounded text-yellow-950 transition-colors cursor-pointer"
                    title="Choose Date on Calendar"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) setSelectedDate(e.target.value);
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-auto"
                  />
                </div>
              </div>

              {/* Carry-over unfinished badge if viewing today */}
              {isViewingToday && unfinishedPriorTasks.length > 0 && (
                <button
                  type="button"
                  onClick={handleCarryOverToCurrentView}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-yellow-500/60 hover:bg-yellow-600/70 text-yellow-950 rounded flex items-center space-x-1 transition-colors cursor-pointer border border-yellow-600/30"
                  title={`Carry over ${unfinishedPriorTasks.length} unfinished tasks from past days to today`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>+{unfinishedPriorTasks.length} prior</span>
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-yellow-950 hover:text-black hover:bg-yellow-500/50 rounded-md transition-colors cursor-pointer ml-auto"
                title="Close notepad (Esc)"
                aria-label="Close notepad"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Strip: Mon to Sun for the selected week */}
            <div className="px-2 pb-1.5 pt-0.5 flex items-center justify-between gap-1 border-t border-yellow-500/40">
              {currentWeekDays.map((day) => (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`flex-1 py-1 px-0.5 rounded flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    day.isSelected
                      ? "bg-yellow-950 text-white font-bold shadow-xs scale-105"
                      : day.isToday
                      ? "bg-yellow-500/80 text-yellow-950 font-bold hover:bg-yellow-500"
                      : "hover:bg-yellow-500/40 text-yellow-900"
                  }`}
                  title={`${day.dayAbbr}, ${day.dayNum}${day.isToday ? " (Today)" : ""}`}
                >
                  <span className="text-[10px] uppercase tracking-tighter leading-none opacity-80">
                    {day.dayAbbr}
                  </span>
                  <span className="text-xs leading-tight font-sans mt-0.5">
                    {day.dayNum}
                  </span>

                  {/* Dot indicator if tasks exist on this day */}
                  {day.hasTasks && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        day.isSelected
                          ? day.allDone
                            ? "bg-emerald-400"
                            : "bg-amber-300"
                          : day.allDone
                          ? "bg-emerald-600"
                          : "bg-yellow-800"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notepad Paper Body with Authentic Red Margin & Ruled Lines */}
          <div className="notepad-paper-lines flex-1 overflow-y-auto px-3 sm:px-4 py-3 flex flex-col relative min-h-[360px] max-h-[calc(85vh-125px)]">
            {/* Notepad Header: Handwritten Date & Completion Status for This Specific Day */}
            <div className="pl-10 pr-1 mb-2">
              <div className="flex items-baseline justify-between border-b border-amber-300/40 pb-1">
                <span className="font-handwriting text-2xl font-bold text-slate-800 tracking-wide">
                  {selectedDateLabel}
                </span>
                <span className="font-handwriting text-xl text-slate-600 font-semibold">
                  {selectedDateTasks.length > 0 ? (
                    selectedCompletedCount === selectedDateTasks.length ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> All Done!
                      </span>
                    ) : (
                      <span>
                        {selectedCompletedCount} of {selectedDateTasks.length} done
                      </span>
                    )
                  ) : (
                    <span>No tasks yet</span>
                  )}
                </span>
              </div>
            </div>

            {/* Handwritten Task Input Field for This Specific Day */}
            <form onSubmit={handleAddTask} className="relative pl-10 pr-1 mb-3">
              <div className="flex items-center space-x-2 border-b-2 border-slate-400/50 pb-0.5 focus-within:border-indigo-600 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder={
                    isViewingToday
                      ? "Write a task for today..."
                      : `Write a task for ${parseLocalDate(selectedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}...`
                  }
                  className="flex-1 bg-transparent font-handwriting text-2xl text-slate-800 placeholder:text-slate-400/80 placeholder:italic focus:outline-none leading-tight"
                  maxLength={120}
                />
                <button
                  type="submit"
                  disabled={!newTaskText.trim()}
                  className="px-2 py-0.5 bg-amber-800/90 hover:bg-amber-900 disabled:opacity-30 text-white rounded font-bold text-xs shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                  title="Add task to this day (Enter)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>

            {/* List of Tasks for this specific Day */}
            <div className="flex-1 space-y-1 pl-1">
              {selectedDateTasks.length === 0 ? (
                <div className="pl-10 pr-2 py-6 text-center">
                  <p className="font-handwriting text-2xl text-slate-500 italic">
                    {isViewingToday
                      ? "Your notepad is clean for today!"
                      : `No tasks logged for this day.`}
                  </p>
                  <p className="font-handwriting text-lg text-slate-400 mt-1">
                    {isViewingToday
                      ? "Write down your assignments, study targets, or prep above."
                      : "Type a task above to plan ahead or log what you covered."}
                  </p>
                </div>
              ) : (
                selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start space-x-2.5 py-1 px-1 rounded hover:bg-amber-100/40 transition-colors"
                  >
                    {/* Hand-drawn style Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className={`mt-1.5 w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 border-2 ${
                        task.completed
                          ? "bg-indigo-600 border-indigo-700 text-white"
                          : "border-slate-600 bg-white/70 hover:border-indigo-600"
                      }`}
                      title={task.completed ? "Mark as pending" : "Mark as done"}
                      aria-label={`Toggle task: ${task.text}`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {/* Handwritten Task Text */}
                    <div
                      onClick={() => handleToggleTask(task.id)}
                      className={`flex-1 font-handwriting text-2xl select-text cursor-pointer leading-tight transition-all ${
                        task.completed
                          ? "line-through text-slate-400 decoration-slate-400 decoration-2"
                          : "text-slate-800 hover:text-indigo-900"
                      }`}
                    >
                      {task.text}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer shrink-0"
                      title="Remove task"
                      aria-label="Remove task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Notepad Tear-off Footer */}
            <div className="mt-4 pt-2 border-t border-amber-300/60 pl-10 pr-1 flex items-center justify-between text-xs">
              <div className="font-handwriting text-lg text-slate-500">
                {selectedPendingCount === 0 && selectedDateTasks.length > 0
                  ? "Great job! 🎉"
                  : `${selectedPendingCount} item${selectedPendingCount === 1 ? "" : "s"} left`}
              </div>

              <div className="flex items-center space-x-3">
                {!isViewingToday && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className="font-handwriting text-lg text-indigo-700 hover:text-indigo-900 underline decoration-dotted transition-colors cursor-pointer"
                    title="Return to Today"
                  >
                    Back to Today
                  </button>
                )}

                {selectedCompletedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="font-handwriting text-lg text-amber-900 hover:text-rose-700 underline decoration-dotted transition-colors cursor-pointer"
                    title="Remove completed items for this day"
                  >
                    Tear off completed ({selectedCompletedCount})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

