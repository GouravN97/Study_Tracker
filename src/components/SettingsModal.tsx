import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Settings as SettingsIcon, 
  Mail, 
  User, 
  School, 
  Calendar, 
  Check, 
  Save, 
  Palette, 
  Sparkles, 
  HardDrive, 
  Download, 
  Upload, 
  Database,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { UserSettings } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings, applyToExistingCourses?: boolean) => void;
  onOpenAppearance?: () => void;
  lastSavedTime?: string | null;
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => Promise<{ success: boolean; message?: string }>;
  onManualSaveToDisk?: () => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenAppearance,
  lastSavedTime,
  onExportBackup,
  onImportBackup,
  onManualSaveToDisk,
}) => {
  const [formData, setFormData] = useState<UserSettings>({ ...settings });
  const [applyToAllCourses, setApplyToAllCourses] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...settings });
      setApplyToAllCourses(true);
      setImportStatus(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData, applyToAllCourses);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleManualSync = async () => {
    if (!onManualSaveToDisk) return;
    setIsSyncing(true);
    try {
      await onManualSaveToDisk();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportBackup) return;

    setImportStatus("Importing backup data...");
    try {
      const result = await onImportBackup(file);
      if (result.success) {
        setImportStatus("Backup successfully restored from local file!");
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1200);
      } else {
        setImportStatus(result.message || "Failed to import file.");
      }
    } catch (err: any) {
      setImportStatus("Import error: " + (err?.message || "Invalid file format"));
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Settings & Storage
              </h2>
              <p className="text-[11px] text-slate-500">
                Student Profile • Automation • Local Disk Persistence
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

        {/* Form Body (Scrollable) */}
        <div className="overflow-y-auto p-6 flex-1 space-y-5 text-xs sm:text-sm">
          <form id="settings-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Student Profile */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Student Profile</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Name
                  </label>
                  <input
                    id="input-settings-student-name"
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Report Recipient Email
                  </label>
                  <input
                    id="input-settings-email"
                    type="email"
                    required
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    University / College
                  </label>
                  <input
                    id="input-settings-university"
                    type="text"
                    value={formData.universityName}
                    onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Term / Semester
                  </label>
                  <input
                    id="input-settings-term"
                    type="text"
                    value={formData.termName}
                    onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Local Storage & Disk Persistence Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Local Disk Storage & Backup</span>
                </h3>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Disk Persisted</span>
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start space-x-2.5">
                  <Database className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-800">
                      Persistent File Storage: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-indigo-700 text-[11px] font-mono">data/study-tracker-data.json</code>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your courses, weekly targets, logged study hours, and archived reports are written to your local computer's disk file. <strong>Clearing browser history, cache, or cookies will no longer wipe your study records</strong> because data is read directly from your local file.
                    </p>
                    {lastSavedTime && (
                      <p className="text-[10px] text-slate-400">
                        Last synced to disk: {new Date(lastSavedTime).toLocaleTimeString()} ({new Date(lastSavedTime).toLocaleDateString()})
                      </p>
                    )}
                  </div>
                </div>

                {/* Backup & Restore Controls */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                  {onExportBackup && (
                    <button
                      type="button"
                      id="btn-export-backup"
                      onClick={onExportBackup}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      title="Download full study data as JSON backup file"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Export JSON Backup</span>
                    </button>
                  )}

                  {onImportBackup && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                        id="input-import-backup-file"
                      />
                      <button
                        type="button"
                        id="btn-import-backup"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        title="Import and restore from a previously saved JSON file"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Restore from JSON File</span>
                      </button>
                    </>
                  )}

                  {onManualSaveToDisk && (
                    <button
                      type="button"
                      id="btn-manual-sync"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer ml-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>{isSyncing ? "Saving..." : "Flush to Disk"}</span>
                    </button>
                  )}
                </div>

                {importStatus && (
                  <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-800">
                    {importStatus}
                  </div>
                )}
              </div>
            </div>

            {/* Automation Rules */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Automation & Reset Schedule
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      Automatic Monday 12:00 AM Reset
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Automatically archive week progress and clear sliders at Monday midnight.
                    </p>
                  </div>
                  <input
                    id="toggle-auto-reset"
                    type="checkbox"
                    checked={formData.autoResetMonday}
                    onChange={(e) => setFormData({ ...formData, autoResetMonday: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      Auto-Generate Email Summary Report
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Draft and dispatch weekly progress report with AI evaluation on weekly reset.
                    </p>
                  </div>
                  <input
                    id="toggle-auto-email"
                    type="checkbox"
                    checked={formData.autoEmailReport}
                    onChange={(e) => setFormData({ ...formData, autoEmailReport: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Appearance & Typography */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Appearance, Theme & Palette</span>
                </h3>
                {onOpenAppearance && (
                  <button
                    type="button"
                    id="btn-open-palette-modal"
                    onClick={() => {
                      onClose();
                      onOpenAppearance();
                    }}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer border border-indigo-200"
                  >
                    <Palette className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Theme & Wallpaper Studio</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Font Family
                  </label>
                  <select
                    value={formData.fontFamily || "plus-jakarta"}
                    onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="plus-jakarta">Plus Jakarta Sans (Modern Clean)</option>
                    <option value="inter">Inter (Neutral & Crisp)</option>
                    <option value="outfit">Outfit (Contemporary Display)</option>
                    <option value="poppins">Poppins (Geometric Sans)</option>
                    <option value="playfair">Playfair Display (Academic Serif)</option>
                    <option value="cinzel">Cinzel (Collegiate Heritage Serif)</option>
                    <option value="lora">Lora (Literary Study Serif)</option>
                    <option value="jetbrains-mono">JetBrains Mono (Developer Code)</option>
                    <option value="space-grotesk">Space Grotesk (Modern Tech)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dashboard Canvas Theme
                  </label>
                  <select
                    value={formData.backgroundStyle || "slate"}
                    onChange={(e) => setFormData({ ...formData, backgroundStyle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="slate">Midnight Slate (Dark)</option>
                    <option value="navy">Oxford Navy (Deep Blue)</option>
                    <option value="emerald">Emerald Forest (Dark Green)</option>
                    <option value="obsidian">Obsidian Violet (Deep Purple)</option>
                    <option value="mocha">Espresso Mocha (Warm Dark)</option>
                    <option value="twilight">Twilight Gradient</option>
                    <option value="light-minimal">Clean Light (Bright White)</option>
                    <option value="warm-paper">Academic Parchment (Warm Light)</option>
                    <option value="library">Grand University Library (Wallpaper)</option>
                    <option value="cosmos">Starry Cosmos & Nebula (Wallpaper)</option>
                    <option value="campus">Collegiate Quad & Ivy (Wallpaper)</option>
                    <option value="study-sanctuary">Study Sanctuary & Plants (Wallpaper)</option>
                    {formData.backgroundStyle === "custom" && <option value="custom">Custom Uploaded Wallpaper</option>}
                  </select>
                </div>
              </div>
            </div>

            {/* Target Hours Default */}
            <div className="pt-2 space-y-2">
              <div>
                <label htmlFor="input-default-target" className="block text-xs font-bold text-slate-700 mb-1">
                  Default Target Study Hours per Subject (Slider Maximum)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="input-default-target"
                    type="number"
                    min="1"
                    max="80"
                    value={formData.defaultSubjectTarget}
                    onChange={(e) => setFormData({ ...formData, defaultSubjectTarget: parseInt(e.target.value) || 12 })}
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-600">hours/week</span>
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  id="checkbox-apply-target-all"
                  type="checkbox"
                  checked={applyToAllCourses}
                  onChange={(e) => setApplyToAllCourses(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700">
                  Update slider maximum for all current subjects to <strong className="text-indigo-600">{formData.defaultSubjectTarget} hours</strong>
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="text-[11px] text-slate-500">
            {saved ? (
              <span className="text-emerald-600 font-bold flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>All changes saved to disk</span>
              </span>
            ) : (
              <span>Autosaves to local disk file</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-settings"
              type="submit"
              form="settings-form"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
