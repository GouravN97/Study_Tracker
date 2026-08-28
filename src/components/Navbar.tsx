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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  {settings.universityName || "University"} Course Tracker
                </h1>
                <span className="hidden lg:inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Local Disk Saved</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {settings.termName} • <span className="text-slate-300 font-medium">{settings.studentName}</span>
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Weekly Report & Email Button */}
            <button
              id="btn-weekly-report"
              onClick={onOpenEmailReport}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Weekly Report</span>
              <span className="sm:hidden">Report</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-indigo-800 rounded-full">
                {completedCoursesCount}/{totalCoursesCount}
              </span>
            </button>

            {/* Past History */}
            <button
              id="btn-history"
              onClick={onOpenHistory}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Weekly Archives & History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Add Subject */}
            <button
              id="btn-add-subject"
              onClick={onOpenAddCourse}
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center space-x-1.5 text-xs sm:text-sm font-medium cursor-pointer"
              title="Add New Course"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Add Course</span>
            </button>

            {/* Settings */}
            <button
              id="btn-settings"
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
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
