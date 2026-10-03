import React from "react";
import { Send, Calendar, Star, Sparkles } from "lucide-react";
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
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  weekLabel,
  countdown,
  settings,
  onTriggerReset,
  onOpenEmailReport,
}) => {
  const blocks = [
    { label: "Days", value: countdown.days, color: "bg-lemon", tilt: "-rotate-3" },
    { label: "Hours", value: countdown.hours, color: "bg-bubblegum", tilt: "rotate-2" },
    { label: "Mins", value: countdown.minutes, color: "bg-mint", tilt: "-rotate-2" },
    { label: "Secs", value: countdown.seconds, color: "bg-sky-pop", tilt: "rotate-3" },
  ];

  return (
    <div className="doodle-card bg-white p-5 sm:p-6 relative overflow-hidden mb-8">
      {/* Corner doodles */}
      <Star className="absolute right-4 top-3 w-6 h-6 text-ink fill-lemon rotate-12 animate-bob pointer-events-none hidden sm:block" />
      <Sparkles className="absolute left-[46%] bottom-3 w-5 h-5 text-pink-500 pointer-events-none hidden lg:block" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Active Cycle & Status */}
        <div className="space-y-3 max-w-xl">
          <span className="doodle-chip bg-mint">
            <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
            Active Weekly Cycle
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-grape border-[2.5px] border-ink shadow-doodle-sm flex items-center justify-center rotate-3 shrink-0">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="doodle-squiggle">{weekLabel}</span>
          </h2>
          <p className="text-sm text-ink/70">
            Fresh start every Monday at midnight. Keep those hours climbing!
          </p>
        </div>

        {/* Right: Countdown Display & Trigger Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4">
          {/* Countdown Digit Blocks */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-center">
            {blocks.map((block, i) => (
              <React.Fragment key={block.label}>
                {i > 0 && <span className="font-bold text-xl">:</span>}
                <div className={`${block.color} ${block.tilt} border-[2.5px] border-ink rounded-xl px-2 sm:px-3 py-2 min-w-[52px] sm:min-w-[60px] shadow-doodle-sm`}>
                  <div className="text-xl sm:text-3xl font-bold tabular-nums leading-none">
                    {String(block.value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider mt-1">{block.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-1">
            <button
              id="btn-quick-preview-email"
              onClick={onOpenEmailReport}
              className="doodle-btn bg-grape flex-1 sm:flex-none px-4 py-2 text-xs"
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
