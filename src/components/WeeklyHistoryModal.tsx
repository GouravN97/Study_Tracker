import React, { useState } from "react";
import { 
  X, 
  History, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Mail, 
  Download, 
  Sparkles, 
  Clock, 
  BookOpen,
  Trash2
} from "lucide-react";
import { WeeklyReport, UserSettings } from "../types";

interface WeeklyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: WeeklyReport[];
  settings: UserSettings;
  onViewReport: (report: WeeklyReport) => void;
  onDeleteReport: (reportId: string) => void;
}

export const WeeklyHistoryModal: React.FC<WeeklyHistoryModalProps> = ({
  isOpen,
  onClose,
  reports,
  settings,
  onViewReport,
  onDeleteReport,
}) => {
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Weekly Archives & Historical Reports
              </h2>
              <p className="text-xs text-slate-500">
                Review past weekly study cycles and email logs
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
              <h3 className="text-sm font-bold text-slate-700">No Weekly Reports Archived Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Reports are automatically created when the timer resets on Monday 12 AM, or when you click "Simulate Monday Reset".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => {
                const completionRate = rep.totalTargetHours > 0 
                  ? Math.round((rep.totalHours / rep.totalTargetHours) * 100) 
                  : 0;

                return (
                  <div
                    key={rep.id}
                    className="p-4 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/90 hover:border-indigo-200 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          {rep.weekLabel}
                        </span>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {rep.weekId}
                        </span>
                        {rep.emailSentTo && (
                          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            <Mail className="w-3 h-3 mr-1" />
                            Emailed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>
                          <strong>{rep.totalHours.toFixed(1)}h</strong> / {rep.totalTargetHours}h ({completionRate}%)
                        </span>
                        <span>•</span>
                        <span>{rep.coursesSnapshot?.length || 0} subjects</span>
                        {rep.aiSummary?.grade && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-indigo-600">Grade: {rep.aiSummary.grade}</span>
                          </>
                        )}
                      </div>

                      {rep.aiSummary?.executiveSummary && (
                        <p className="text-xs text-slate-600 line-clamp-1 italic pt-1">
                          "{rep.aiSummary.executiveSummary}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          onViewReport(rep);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteReport(rep.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete archived report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
