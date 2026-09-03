import React from "react";
import { X, RefreshCw, AlertTriangle, CheckCircle2, Mail, Archive, Sparkles, Clock } from "lucide-react";
import { UserSettings, Course } from "../types";

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  courses: Course[];
  weekLabel: string;
  settings: UserSettings;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  courses,
  weekLabel,
  settings,
  countdown,
}) => {
  if (!isOpen) return null;

  const totalHours = courses.reduce((sum, c) => sum + c.hoursCompleted, 0);
  const totalTargetHours = courses.reduce((sum, c) => sum + c.targetHours, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Monday 12:00 AM Reset Engine
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-slate-700 text-xs sm:text-sm">
          {/* Active Countdown info */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-900 font-medium text-xs">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Next Automatic Reset scheduled in:</span>
            </div>
            <span className="font-mono font-bold text-indigo-700 text-xs sm:text-sm bg-white px-2.5 py-1 rounded-md border border-indigo-100">
              {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-slate-600 leading-relaxed">
              When the weekly cycle ends on <strong>Monday at 12:00 AM</strong>, the following operations run automatically:
            </p>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-start space-x-2.5">
                <Archive className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-900 text-xs">1. Store Away Previous Week into Local Folder:</strong>
                  <p className="text-[11px] text-slate-500">
                    Saves full snapshot ({totalHours.toFixed(1)}h / {totalTargetHours}h across {courses.length} subjects) into <span className="font-mono text-slate-800">data/archives/week-[ID].json</span> and stores in history.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-900 text-xs">2. Generate Weekly Report & Email:</strong>
                  <p className="text-[11px] text-slate-500">
                    Prepares breakdown and AI study audit for <span className="font-mono text-slate-800">{settings.studentEmail}</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <RefreshCw className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-900 text-xs">3. Reset Sliders to 0.0 Hours & Start Afresh:</strong>
                  <p className="text-[11px] text-slate-500">
                    Clears active subject sliders to 0.0h and wipes notes to start the new week with a clean slate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Clicking <strong>"Run Manual Reset Now"</strong> simulates the Monday 12 AM rollover immediately: it archives current hours, opens the email report, and clears sliders to 0.0h.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-confirm-reset-now"
            type="button"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run Manual Reset Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
