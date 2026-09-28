import React, { useState, useMemo } from "react";
import { 
  X, 
  History, 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  FileText,
  TrendingUp,
  Award,
  Target
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { WeeklyReport } from "../types";

interface PreviousWeeksDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: WeeklyReport[];
}

export const PreviousWeeksDashboardModal: React.FC<PreviousWeeksDashboardModalProps> = ({
  isOpen,
  onClose,
  reports,
}) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

  // Prepare trend data for up to the last 5 archived weeks
  const trendData = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    // Sort chronological: older weeks first, most recent week last
    const sorted = [...reports].sort((a, b) => {
      const timeA = new Date(a.weekStartDate || a.archivedAt || 0).getTime();
      const timeB = new Date(b.weekStartDate || b.archivedAt || 0).getTime();
      return timeA - timeB;
    });

    // Take the last 5 weeks
    const last5 = sorted.slice(-5);

    return last5.map((rep) => {
      const completionRate = rep.totalTargetHours > 0 
        ? Math.round((rep.totalHours / rep.totalTargetHours) * 100) 
        : (rep.completionPercentage || 0);

      // Clean label for chart X-axis (e.g. "Aug 24–30" or weekId)
      let shortLabel = rep.weekLabel;
      if (shortLabel && shortLabel.includes("–")) {
        // e.g. "Aug 24 – 30, 2026" -> "Aug 24–30"
        shortLabel = shortLabel.replace(/,\s*\d{4}/, "").trim();
      } else if (!shortLabel) {
        shortLabel = rep.weekId;
      }

      return {
        id: rep.id,
        weekId: rep.weekId,
        fullLabel: rep.weekLabel || rep.weekId,
        shortLabel,
        completion: completionRate,
        hours: Number(rep.totalHours.toFixed(1)),
        targetHours: rep.totalTargetHours,
        subjectCount: rep.coursesSnapshot?.length || 0,
      };
    });
  }, [reports]);

  // Compute summary stats for the 5-week window
  const summaryStats = useMemo(() => {
    if (trendData.length === 0) return null;
    const avgCompletion = Math.round(
      trendData.reduce((acc, curr) => acc + curr.completion, 0) / trendData.length
    );
    const totalHoursStudied = trendData
      .reduce((acc, curr) => acc + curr.hours, 0)
      .toFixed(1);
    const highestWeek = [...trendData].sort((a, b) => b.completion - a.completion)[0];
    const latestWeek = trendData[trendData.length - 1];

    let trendDirection: "up" | "down" | "neutral" = "neutral";
    if (trendData.length >= 2) {
      const prevWeek = trendData[trendData.length - 2];
      if (latestWeek.completion > prevWeek.completion) trendDirection = "up";
      else if (latestWeek.completion < prevWeek.completion) trendDirection = "down";
    }

    return {
      avgCompletion,
      totalHoursStudied,
      highestWeek,
      latestWeek,
      trendDirection,
      count: trendData.length,
    };
  }, [trendData]);

  if (!isOpen) return null;

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Past Stats & Notes
              </h2>
              <p className="text-xs text-slate-500">
                Visualize multi-week completion trends, subject hours, and study logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {reports.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No Past Weeks Data Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once a week is completed or reset, your completion trend chart, subject stats, and notes will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* 5-Week Completion Trend Chart Section */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 text-white shadow-md border border-slate-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold tracking-tight text-white">
                        Completion Percentage Trend (Last {trendData.length} {trendData.length === 1 ? "Week" : "Weeks"})
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300">
                      Long-term performance tracking against your target study hours
                    </p>
                  </div>

                  {summaryStats && (
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 flex items-center space-x-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-300" />
                        <span className="text-slate-300">Avg:</span>
                        <span className="font-bold text-white">{summaryStats.avgCompletion}%</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-200">Best:</span>
                        <span className="font-bold text-emerald-300">{summaryStats.highestWeek.completion}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recharts Line Chart Container */}
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 12, right: 16, left: -16, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                        strokeOpacity={0.6}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="shortLabel"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#475569" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#475569" }}
                        tickFormatter={(val) => `${val}%`}
                        ticks={[0, 25, 50, 75, 100]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[150px]">
                                <p className="font-bold text-white border-b border-slate-800 pb-1">
                                  {data.fullLabel}
                                </p>
                                <div className="flex items-center justify-between text-slate-300">
                                  <span>Completion:</span>
                                  <span className="font-bold text-emerald-400 text-sm">
                                    {data.completion}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>Time Studied:</span>
                                  <span className="font-semibold text-slate-200">
                                    {data.hours}h / {data.targetHours}h
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>Subjects:</span>
                                  <span className="font-semibold text-slate-200">
                                    {data.subjectCount}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Target 100% Goal Reference Line */}
                      <ReferenceLine
                        y={100}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeOpacity={0.5}
                      />
                      <Line
                        type="monotone"
                        dataKey="completion"
                        stroke="url(#lineGlow)"
                        strokeWidth={3}
                        dot={{
                          r: 4.5,
                          fill: "#10b981",
                          stroke: "#ffffff",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6.5,
                          fill: "#06b6d4",
                          stroke: "#ffffff",
                          strokeWidth: 2.5,
                        }}
                        isAnimationActive={true}
                        animationDuration={900}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Sub-bar metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-slate-700/60 text-xs">
                  <div className="bg-slate-800/60 rounded-lg p-2">
                    <span className="text-[11px] text-slate-400 block">Total Hours (5 wks)</span>
                    <span className="text-sm font-bold text-white">{summaryStats?.totalHoursStudied} hrs</span>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2">
                    <span className="text-[11px] text-slate-400 block">Average Completion</span>
                    <span className="text-sm font-bold text-indigo-300">{summaryStats?.avgCompletion}%</span>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2">
                    <span className="text-[11px] text-slate-400 block">Latest Week Score</span>
                    <span className="text-sm font-bold text-emerald-400">{summaryStats?.latestWeek.completion}%</span>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2">
                    <span className="text-[11px] text-slate-400 block">Target Threshold</span>
                    <span className="text-sm font-bold text-amber-300">100% Goal</span>
                  </div>
                </div>
              </div>

              {/* Past Weeks List & Notes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                  Archived Weekly Logs & Subject Notes
                </h3>
                <div className="space-y-4">
                  {reports.map((rep) => {
                    const completionRate = rep.totalTargetHours > 0 
                      ? Math.round((rep.totalHours / rep.totalTargetHours) * 100) 
                      : 0;
                    const isExpanded = expandedWeeks[rep.id];

                    return (
                      <div
                        key={rep.id}
                        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-colors"
                      >
                        {/* Week Header */}
                        <div 
                          className="p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                          onClick={() => toggleWeek(rep.id)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-slate-900">
                                {rep.weekLabel}
                              </span>
                              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                {rep.weekId}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-slate-500">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{rep.totalHours.toFixed(1)}h / {rep.totalTargetHours}h ({completionRate}%)</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{rep.coursesSnapshot?.length || 0} subjects</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-slate-400">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                        </div>

                        {/* Week Details: Courses & Notes */}
                        {isExpanded && (
                          <div className="p-4 sm:p-6 border-t border-slate-200 bg-white space-y-4">
                            {(!rep.coursesSnapshot || rep.coursesSnapshot.length === 0) ? (
                              <p className="text-xs text-slate-500">No subjects logged for this week.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rep.coursesSnapshot.map(course => {
                                  const coursePercent = course.targetHours > 0 
                                    ? Math.round((course.hoursCompleted / course.targetHours) * 100) 
                                    : 0;
                                  return (
                                    <div key={course.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 shadow-xs">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
                                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: course.color === 'indigo' ? '#6366f1' : course.color === 'emerald' ? '#10b981' : course.color === 'rose' ? '#f43f5e' : course.color === 'amber' ? '#f59e0b' : course.color === 'sky' ? '#0ea5e9' : course.color === 'violet' ? '#8b5cf6' : course.color === 'pink' ? '#ec4899' : course.color === 'fuchsia' ? '#d946ef' : course.color === 'teal' ? '#14b8a6' : course.color === 'cyan' ? '#06b6d4' : '#64748b' }} />
                                          <span>{course.code}: {course.name}</span>
                                        </h4>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                          {course.hoursCompleted.toFixed(1)}h / {course.targetHours}h ({coursePercent}%)
                                        </span>
                                      </div>
                                      
                                      <div className="mt-3 bg-white rounded-md p-3 border border-slate-100">
                                        <div className="flex items-center space-x-1.5 mb-1.5 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                                          <FileText className="w-3.5 h-3.5" />
                                          <span>Notes & Topics</span>
                                        </div>
                                        {course.noteList && course.noteList.length > 0 ? (
                                          <ul className="space-y-1.5 list-disc pl-4 mt-2 text-xs text-slate-700">
                                            {course.noteList.map(note => (
                                              <li key={note.id} className="leading-relaxed">
                                                {note.text}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : course.notes ? (
                                          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed mt-2">
                                            {course.notes}
                                          </p>
                                        ) : (
                                          <p className="text-xs text-slate-400 italic mt-2">No notes recorded for this subject.</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
