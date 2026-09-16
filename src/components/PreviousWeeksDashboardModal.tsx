import React, { useState } from "react";
import { X, History, Calendar, Clock, BookOpen, ChevronDown, ChevronRight, FileText } from "lucide-react";
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
                Past Weeks Dashboard
              </h2>
              <p className="text-xs text-slate-500">
                Review your time spent per subject and study notes from previous weeks
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
        <div className="flex-1 overflow-y-auto p-6">
          {reports.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No Past Weeks Data Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once a week is completed or reset, your stats and notes will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => {
                const completionRate = rep.totalTargetHours > 0 
                  ? Math.round((rep.totalHours / rep.totalTargetHours) * 100) 
                  : 0;
                const isExpanded = expandedWeeks[rep.id];

                return (
                  <div
                    key={rep.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
