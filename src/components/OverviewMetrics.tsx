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

  const filters = [
    { id: "all", label: `All Courses (${courses.length})`, activeColor: "bg-lemon" },
    { id: "in-progress", label: `In Progress (${inProgressCourses.length})`, activeColor: "bg-sky-pop" },
    { id: "completed", label: `Target Reached (${completedCourses.length})`, activeColor: "bg-mint" },
    { id: "behind", label: `Needs Focus (<50%) (${behindCourses.length})`, activeColor: "bg-tangerine" },
  ];

  const statCard = "doodle-card bg-white p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-1";
  const statIcon = "w-9 h-9 rounded-xl border-2 border-ink shadow-doodle-sm flex items-center justify-center";
  const statLabel = "text-xs font-semibold uppercase tracking-wider text-ink/60";

  return (
    <div className="space-y-6 mb-8">
      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hours */}
        <div className={`${statCard} hover:-rotate-1`}>
          <div className="flex items-center justify-between">
            <span className={statLabel}>Total Hours</span>
            <div className={`${statIcon} bg-lemon -rotate-6`}>
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-bold">
              {totalHoursCompleted.toFixed(1)}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-ink/50">
              / {totalTargetHours}h target
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-ink/60">
            <span className="font-bold text-ink bg-lemon/60 px-1 rounded">{hoursRemaining.toFixed(1)}h</span>
            <span className="ml-1">remaining to complete all</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className={`${statCard} hover:rotate-1`}>
          <div className="flex items-center justify-between">
            <span className={statLabel}>Completion Rate</span>
            <div className={`${statIcon} bg-mint rotate-6`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline flex-wrap gap-2">
            <span className="text-3xl sm:text-4xl font-bold">
              {overallPercentage}%
            </span>
            <span className={`doodle-chip ${
              overallPercentage >= 80 ? "bg-mint" :
              overallPercentage >= 50 ? "bg-sky-pop" :
              "bg-tangerine"
            }`}>
              {overallPercentage >= 80 ? "Excellent" : overallPercentage >= 50 ? "On Track" : "Building"}
            </span>
          </div>
          <div className="mt-2.5 w-full bg-white border-2 border-ink h-3.5 rounded-full overflow-hidden">
            <div 
              className="bg-mint h-full border-r-2 border-ink transition-all duration-500" 
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>

        {/* Courses Completed */}
        <div className={`${statCard} hover:-rotate-1`}>
          <div className="flex items-center justify-between">
            <span className={statLabel}>Goals Reached</span>
            <div className={`${statIcon} bg-sky-pop -rotate-3`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-bold">
              {completedCourses.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-ink/50">
              / {courses.length} courses
            </span>
          </div>
          <div className="mt-2 text-xs text-ink/60">
            {completedCourses.length === courses.length && courses.length > 0 
              ? "All subject targets met! 🎉" 
              : `${courses.length - completedCourses.length} subject(s) in progress`}
          </div>
        </div>

        {/* Study Velocity / Daily Pace */}
        <div className={`${statCard} hover:rotate-1 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className={statLabel}>Avg Pace / Day</span>
              <div className={`${statIcon} bg-bubblegum rotate-6`}>
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline flex-wrap gap-x-2 gap-y-1">
              <span className="text-3xl sm:text-4xl font-bold">
                {activePace.toFixed(1)}h
              </span>
              <span className="text-xs sm:text-sm font-semibold text-ink/50">
                / day
              </span>
              <span className={`doodle-chip ${
                activePace >= targetDailyPace && totalHoursCompleted > 0
                  ? "bg-mint"
                  : totalHoursCompleted === 0
                  ? "bg-white"
                  : "bg-tangerine"
              }`}>
                {paceMode === "elapsed" ? `Day ${daysElapsed} of 7` : "7-day avg"}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-ink/60 flex items-center justify-between pt-1">
            <span className="truncate">
              {hoursRemaining <= 0 ? (
                <span className="text-ink font-semibold">Weekly target met! 🎉</span>
              ) : paceMode === "elapsed" ? (
                <span>
                  Target: ~{targetDailyPace.toFixed(1)}h/d
                  {daysElapsed < 7 && (
                    <span className="text-ink/45 ml-1">
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
              className="text-[11px] text-ink font-bold ml-1.5 shrink-0 cursor-pointer underline decoration-wavy decoration-pink-400 hover:text-pink-600"
              title={paceMode === "elapsed" ? "Switch to 7-day flat average" : "Switch to elapsed days pace"}
            >
              {paceMode === "elapsed" ? "7d view" : "elapsed"}
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="doodle-card bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto p-1">
          {filters.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                id={`filter-${filter.id}`}
                onClick={() => onSelectFilter(filter.id)}
                className={`doodle-btn shrink-0 px-3 py-1.5 text-xs ${
                  isActive ? `${filter.activeColor}` : "bg-white shadow-none hover:shadow-doodle-sm"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-ink/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-courses"
            type="text"
            placeholder="Search by name, code, instructor..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="doodle-input w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};
