import React from "react";
import { 
  GraduationCap, 
  Mail, 
  History, 
  Plus, 
  Settings as SettingsIcon,
  HardDrive,
  CheckCircle2
} from "lucide-react";
import { UserSettings } from "../types";

interface NavbarProps {
  weekLabel: string;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  settings: UserSettings;
  onOpenAddCourse: () => void;
  onOpenEmailReport: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenResetModal: () => void;
  completedCoursesCount: number;
  totalCoursesCount: number;
  lastSavedTime?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  weekLabel,
  countdown,
  settings,
  onOpenAddCourse,
  onOpenEmailReport,
  onOpenHistory,
  onOpenSettings,
  onOpenResetModal,
  completedCoursesCount,
  totalCoursesCount,
  lastSavedTime,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b-[3px] border-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-16 sm:h-20">
          {/* Brand & Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="max-[380px]:hidden w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-lemon border-[2.5px] border-ink shadow-doodle-sm flex items-center justify-center shrink-0 -rotate-6 hover:animate-wiggle">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-sm sm:text-xl tracking-tight leading-tight line-clamp-2">
                  {settings.universityName || "University"}
                  <span className="hidden sm:inline"> Course Tracker</span>
                </h1>
                <span className="hidden lg:inline-flex doodle-chip bg-mint">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Saved to disk</span>
                </span>
              </div>
              <p className="text-xs text-ink/60 hidden sm:block">
                {settings.termName} ✦ <span className="text-ink font-semibold">{settings.studentName}</span>
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Weekly Report & Email Button */}
            <button
              id="btn-weekly-report"
              onClick={onOpenEmailReport}
              className="doodle-btn bg-bubblegum px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Weekly Report</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-white border-2 border-ink rounded-full leading-none">
                {completedCoursesCount}/{totalCoursesCount}
              </span>
            </button>

            {/* Past History */}
            <button
              id="btn-history"
              onClick={onOpenHistory}
              className="doodle-btn bg-sky-pop p-2"
              title="Weekly Archives & History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Add Subject */}
            <button
              id="btn-add-subject"
              onClick={onOpenAddCourse}
              className="doodle-btn bg-mint p-2 sm:px-3 sm:py-2 text-xs sm:text-sm"
              title="Add New Course"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add Course</span>
            </button>

            {/* Settings */}
            <button
              id="btn-settings"
              onClick={onOpenSettings}
              className="doodle-btn bg-white p-2"
              title="Settings & Storage Backup"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
