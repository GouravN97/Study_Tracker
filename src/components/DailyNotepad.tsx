import React, { useState, useEffect, useRef } from "react";
import {
  NotebookPen,
  X,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

const STORAGE_KEY = "uni_daily_notepad_tasks";

export function DailyNotepad() {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const notepadRef = useRef<HTMLDivElement>(null);

  // Today's date string YYYY-MM-DD
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Formatted date for notepad header
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // 1. Load tasks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: DailyTask[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to load daily tasks:", e);
    }

    // Default starter tasks for today
    const starterTasks: DailyTask[] = [
      {
        id: "task-1",
        text: "Review lecture slides & key concepts",
        completed: true,
        date: todayStr,
        createdAt: new Date().toISOString(),
      },
      {
        id: "task-2",
        text: "Complete 45-minute focused problem set",
        completed: false,
        date: todayStr,
        createdAt: new Date().toISOString(),
      },
      {
        id: "task-3",
        text: "Log today's study hours on tracker",
        completed: false,
        date: todayStr,
        createdAt: new Date().toISOString(),
      },
    ];
    setTasks(starterTasks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(starterTasks));
    } catch (_) {}
  }, [todayStr]);

  // Save tasks to localStorage whenever modified
  const saveTasks = (updated: DailyTask[]) => {
    setTasks(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist daily tasks:", e);
    }
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
        // Only close if target isn't the toggle trigger
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

  // Focus input when notepad opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Filter tasks for today
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const pendingCount = todayTasks.length - completedCount;

  // Check if there are uncompleted tasks from previous days to carry over
  const previousPendingTasks = tasks.filter(
    (t) => t.date !== todayStr && !t.completed
  );

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTaskText.trim();
    if (!trimmed) return;

    const newTask: DailyTask = {
      id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      text: trimmed,
      completed: false,
      date: todayStr,
      createdAt: new Date().toISOString(),
    };

    saveTasks([newTask, ...tasks]);
    setNewTaskText("");
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const handleClearCompleted = () => {
    const updated = tasks.filter((t) => !(t.date === todayStr && t.completed));
    saveTasks(updated);
  };

  const handleCarryOverUnfinished = () => {
    const updated = tasks.map((t) => {
      if (t.date !== todayStr && !t.completed) {
        return { ...t, date: todayStr };
      }
      return t;
    });
    saveTasks(updated);
  };

  return (
    <>
      {/* Pinned Notepad Icon Button on Left Edge Near Top */}
      <div className="fixed left-0 top-24 sm:top-28 z-40">
        <button
          id="notepad-toggle-btn"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group flex items-center bg-amber-50 hover:bg-amber-100 text-amber-900 border-y border-r border-amber-300/80 shadow-md hover:shadow-lg rounded-r-xl transition-all duration-200 cursor-pointer ${
            isOpen
              ? "pl-2 pr-3 py-2 ring-2 ring-amber-400 bg-amber-100"
              : "pl-2 pr-2.5 py-2 hover:translate-x-0.5"
          }`}
          title="Open Today's Handwritten To-Do Notepad"
          aria-label="Today's To-Do List Notepad"
        >
          {/* Mini notepad visual icon */}
          <div className="relative flex items-center justify-center">
            <NotebookPen className="w-5 h-5 text-amber-800 transition-transform group-hover:scale-110" />
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[17px] h-[17px] px-1 bg-amber-600 text-white text-[10px] font-bold rounded-full shadow-xs border border-white">
                {pendingCount}
              </span>
            )}
          </div>
          
          <span className="hidden md:inline-block ml-2 text-xs font-bold font-handwriting text-amber-950 tracking-wide text-base leading-none">
            To-Do
          </span>
        </button>
      </div>

      {/* Notepad-Shaped Box Modal / Drawer */}
      {isOpen && (
        <div
          ref={notepadRef}
          className="fixed left-2 sm:left-4 top-20 sm:top-24 z-50 w-[calc(100vw-1rem)] max-w-[390px] sm:max-w-[420px] max-h-[85vh] flex flex-col rounded-xl overflow-hidden shadow-2xl shadow-stone-800/25 border border-yellow-400/80 animate-in fade-in slide-in-from-left-4 duration-200"
          style={{
            transformOrigin: "top left",
          }}
        >
          {/* Monotonic Yellow Top Heading Frame */}
          <div className="bg-yellow-400 px-3.5 py-2 flex items-center justify-between border-b border-yellow-500 text-yellow-950">
            {/* Subtle left decorative touch or prior items */}
            <div className="flex items-center space-x-2">
              {previousPendingTasks.length > 0 && (
                <button
                  type="button"
                  onClick={handleCarryOverUnfinished}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-yellow-500/50 hover:bg-yellow-500/80 text-yellow-950 rounded flex items-center space-x-1 transition-colors cursor-pointer border border-yellow-600/30"
                  title={`Carry over ${previousPendingTasks.length} unfinished tasks from previous days`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>+{previousPendingTasks.length} prior</span>
                </button>
              )}
            </div>

            {/* Right: Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-yellow-900 hover:text-black hover:bg-yellow-500/50 rounded-md transition-colors cursor-pointer ml-auto"
              title="Close notepad (Esc)"
              aria-label="Close notepad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notepad Paper Body with Authentic Red Margin & Ruled Lines */}
          <div className="notepad-paper-lines flex-1 overflow-y-auto px-3 sm:px-4 py-3 flex flex-col relative min-h-[360px] max-h-[calc(85vh-90px)]">
            {/* Notepad Header: Handwritten Date & Completion Status */}
            <div className="pl-10 pr-1 mb-2">
              <div className="flex items-baseline justify-between border-b border-amber-300/40 pb-1">
                <span className="font-handwriting text-2xl font-bold text-slate-800 tracking-wide">
                  {formattedDate}
                </span>
                <span className="font-handwriting text-xl text-slate-600 font-semibold">
                  {todayTasks.length > 0 ? (
                    completedCount === todayTasks.length ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> All Done!
                      </span>
                    ) : (
                      <span>
                        {completedCount} of {todayTasks.length} done
                      </span>
                    )
                  ) : (
                    <span>No tasks yet</span>
                  )}
                </span>
              </div>
            </div>

            {/* Handwritten Task Input Field */}
            <form onSubmit={handleAddTask} className="relative pl-10 pr-1 mb-3">
              <div className="flex items-center space-x-2 border-b-2 border-slate-400/50 pb-0.5 focus-within:border-indigo-600 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Write a task for today..."
                  className="flex-1 bg-transparent font-handwriting text-2xl text-slate-800 placeholder:text-slate-400/80 placeholder:italic focus:outline-none leading-tight"
                  maxLength={120}
                />
                <button
                  type="submit"
                  disabled={!newTaskText.trim()}
                  className="px-2 py-0.5 bg-amber-800/90 hover:bg-amber-900 disabled:opacity-30 text-white rounded font-bold text-xs shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                  title="Add to today's list (Enter)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>

            {/* List of Tasks for Today */}
            <div className="flex-1 space-y-1 pl-1">
              {todayTasks.length === 0 ? (
                <div className="pl-10 pr-2 py-6 text-center">
                  <p className="font-handwriting text-2xl text-slate-500 italic">
                    Your notepad is clean for today!
                  </p>
                  <p className="font-handwriting text-lg text-slate-400 mt-1">
                    Write down lecture prep, assignments, or study targets above.
                  </p>
                </div>
              ) : (
                todayTasks.map((task) => (
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
                {pendingCount === 0 && todayTasks.length > 0
                  ? "Great job today! 🎉"
                  : `${pendingCount} item${pendingCount === 1 ? "" : "s"} left`}
              </div>

              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="font-handwriting text-lg text-amber-900 hover:text-rose-700 underline decoration-dotted transition-colors cursor-pointer"
                  title="Remove completed items for today"
                >
                  Tear off completed ({completedCount})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
