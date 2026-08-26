import React from "react";
import { Send, Calendar, Download } from "lucide-react";
import { UserSettings } from "../types";

interface CountdownCardProps {
  weekLabel: string;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    percentageElapsed?: number;
  };
  settings?: UserSettings;
  onTriggerReset?: () => void;
  onOpenEmailReport: () => void;
  onOpenDesktopDownload?: () => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  weekLabel,
  countdown,
  settings,
  onTriggerReset,
  onOpenEmailReport,
  onOpenDesktopDownload,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white border border-slate-700/80 shadow-lg relative overflow-hidden mb-8">
      {/* Background ambient lighting */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Active Cycle & Status */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Active Weekly Cycle
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            {weekLabel}
          </h2>
        </div>

        {/* Right: Countdown Display & Trigger Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 bg-slate-800/60 lg:bg-transparent p-4 sm:p-5 lg:p-0 rounded-xl border border-slate-700/50 lg:border-none">
          {/* Countdown Digit Blocks */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-center">
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 min-w-[58px] shadow-inner">
              <div className="text-lg sm:text-xl font-extrabold font-mono text-white">
                {String(countdown.days).padStart(2, "0")}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Days</div>
            </div>
            <span className="text-slate-500 font-bold text-lg">:</span>
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 min-w-[58px] shadow-inner">
              <div className="text-lg sm:text-xl font-extrabold font-mono text-white">
                {String(countdown.hours).padStart(2, "0")}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hours</div>
            </div>
            <span className="text-slate-500 font-bold text-lg">:</span>
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 min-w-[58px] shadow-inner">
              <div className="text-lg sm:text-xl font-extrabold font-mono text-white">
                {String(countdown.minutes).padStart(2, "0")}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mins</div>
            </div>
            <span className="text-slate-500 font-bold text-lg">:</span>
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 min-w-[58px] shadow-inner">
              <div className="text-lg sm:text-xl font-extrabold font-mono text-indigo-400">
                {String(countdown.seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Secs</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2">
            {onOpenDesktopDownload && (
              <button
                id="btn-quick-download-desktop"
                onClick={onOpenDesktopDownload}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 hover:text-white border border-sky-400/30 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="Download Windows .EXE and Desktop App Launcher"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Desktop App (.EXE)</span>
              </button>
            )}

            <button
              id="btn-quick-preview-email"
              onClick={onOpenEmailReport}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
              title="Generate and preview weekly report email right now"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Weekly Report Email Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
