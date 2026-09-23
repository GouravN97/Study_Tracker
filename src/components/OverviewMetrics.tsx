import React, { useState } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  Flame, 
  Target, 
  TrendingUp, 
  Search,
  Filter,
  BarChart2
} from "lucide-react";
import { Course } from "../types";
import { getDaysElapsedInCurrentWeek, getDaysRemainingInCurrentWeek } from "../utils/dateUtils";

interface OverviewMetricsProps {
  courses: Course[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  courses,
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
}) => {
  const [paceMode, setPaceMode] = useState<"elapsed" | "full">("elapsed");

  const safeCourses = Array.isArray(courses) ? courses : [];
  const totalHoursCompleted = safeCourses.reduce((sum, c) => sum + (Number(c?.hoursCompleted) || 0), 0);
  const totalTargetHours = safeCourses.reduce((sum, c) => sum + (Number(c?.targetHours) || 0), 0);
  const overallPercentage = totalTargetHours > 0 
    ? Math.round((totalHoursCompleted / totalTargetHours) * 100) 
    : 0;

  const completedCourses = safeCourses.filter(c => c && (Number(c.hoursCompleted) || 0) >= (Number(c.targetHours) || 0));
  const inProgressCourses = safeCourses.filter(c => c && (Number(c.hoursCompleted) || 0) > 0 && (Number(c.hoursCompleted) || 0) < (Number(c.targetHours) || 0));
  const behindCourses = safeCourses.filter(c => c && (Number(c.hoursCompleted) || 0) < ((Number(c.targetHours) || 0) / 2));

  const hoursRemaining = Math.max(0, totalTargetHours - totalHoursCompleted);

  // Accurate daily pace calculations based on days elapsed so far in the current Monday-to-Sunday cycle
  const daysElapsed = getDaysElapsedInCurrentWeek(); // 1 (Mon) to 7 (Sun)
  const daysRemaining = getDaysRemainingInCurrentWeek(); // remaining days in week including today

  const paceElapsed = daysElapsed > 0 ? (totalHoursCompleted / daysElapsed) : 0;
  const paceFullWeek = totalHoursCompleted / 7;
  const activePace = paceMode === "elapsed" ? paceElapsed : paceFullWeek;

  const targetDailyPace = totalTargetHours > 0 ? totalTargetHours / 7 : 0;
  const neededDailyPace = hoursRemaining > 0 ? (hoursRemaining / daysRemaining) : 0;

  return (
    <div className="space-y-6 mb-8">
      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hours */}
        <div className="bg-white/95 backdrop-blur-xs rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Hours
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalHoursCompleted.toFixed(1)}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-400">
              / {totalTargetHours}h target
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 font-medium">
            <span className="text-indigo-600 font-semibold">{hoursRemaining.toFixed(1)}h</span>
            <span className="ml-1">remaining to complete all</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white/95 backdrop-blur-xs rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completion Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {overallPercentage}%
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              overallPercentage >= 80 ? "bg-emerald-100 text-emerald-800" :
              overallPercentage >= 50 ? "bg-indigo-100 text-indigo-800" :
              "bg-amber-100 text-amber-800"
            }`}>
              {overallPercentage >= 80 ? "Excellent" : overallPercentage >= 50 ? "On Track" : "Building"}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>

        {/* Courses Completed */}
        <div className="bg-white/95 backdrop-blur-xs rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Goals Reached
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {completedCourses.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-400">
              / {courses.length} courses
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            {completedCourses.length === courses.length && courses.length > 0 
              ? "All subject targets met! 🎉" 
              : `${courses.length - completedCourses.length} subject(s) in progress`}
          </div>
        </div>

        {/* Study Velocity / Daily Pace */}
        <div className="bg-white/95 backdrop-blur-xs rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Avg Pace / Day
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {activePace.toFixed(1)}h
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400">
                / day
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activePace >= targetDailyPace && totalHoursCompleted > 0
                  ? "bg-emerald-100 text-emerald-800"
                  : totalHoursCompleted === 0
                  ? "bg-slate-100 text-slate-600"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {paceMode === "elapsed" ? `Day ${daysElapsed} of 7` : "7-day avg"}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium flex items-center justify-between pt-1">
            <span className="truncate">
              {hoursRemaining <= 0 ? (
                <span className="text-emerald-600 font-semibold">Weekly target met! 🎉</span>
              ) : paceMode === "elapsed" ? (
                <span>
                  Target: ~{targetDailyPace.toFixed(1)}h/d
                  {daysElapsed < 7 && (
                    <span className="text-slate-400 ml-1">
                      (need ~{neededDailyPace.toFixed(1)}h/d left)
                    </span>
                  )}
                </span>
              ) : (
                <span>Spread across full 7 days</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setPaceMode((prev) => (prev === "elapsed" ? "full" : "elapsed"))}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold ml-1.5 shrink-0 cursor-pointer underline decoration-dotted"
              title={paceMode === "elapsed" ? "Switch to 7-day flat average" : "Switch to elapsed days pace"}
            >
              {paceMode === "elapsed" ? "7d view" : "elapsed"}
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-xs p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            id="filter-all"
            onClick={() => onSelectFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            id="filter-in-progress"
            onClick={() => onSelectFilter("in-progress")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedFilter === "in-progress"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            In Progress ({inProgressCourses.length})
          </button>
          <button
            id="filter-completed"
            onClick={() => onSelectFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedFilter === "completed"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Target Reached ({completedCourses.length})
          </button>
          <button
            id="filter-behind"
            onClick={() => onSelectFilter("behind")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedFilter === "behind"
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Needs Focus (&lt;50%) ({behindCourses.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-courses"
            type="text"
            placeholder="Search by name, code, instructor..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>
    </div>
  );
};
