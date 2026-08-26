import React, { useState, useEffect, useRef } from "react";
import { X, BookOpen, Clock, Tag, User, Palette, Check, Image as ImageIcon, Upload, Link, Sliders, Trash2, Pipette } from "lucide-react";
import { Course } from "../types";
import { PRESET_BACKGROUND_IMAGES } from "../data/defaultCourses";
import { COLOR_OPTIONS, getCourseAccent } from "../utils/colorUtils";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (courseData: Partial<Course>) => void;
  initialCourse?: Course | null;
}

const CATEGORIES = [
  "Core Major",
  "Core STEM",
  "General Requirement",
  "Elective",
  "Lab & Practical",
  "Research / Honors",
  "Graduate Seminar",
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCourse,
}) => {
  // Initialize state directly from initialCourse
  const [name, setName] = useState(() => initialCourse?.name || "");
  const [code, setCode] = useState(() => initialCourse?.code || "");
  const [instructor, setInstructor] = useState(() => initialCourse?.instructor || "");
  const [category, setCategory] = useState(() => initialCourse?.category || CATEGORIES[0]);
  const [targetHours, setTargetHours] = useState<string | number>(() => initialCourse?.targetHours ?? 12);
  const [hoursCompleted, setHoursCompleted] = useState<string | number>(() => initialCourse?.hoursCompleted ?? 0);
  const [color, setColor] = useState(() => initialCourse?.color || "indigo");
  const [notes, setNotes] = useState(() => initialCourse?.notes || "");
  const [backgroundImage, setBackgroundImage] = useState(() => initialCourse?.backgroundImage || "");
  const [backgroundDim, setBackgroundDim] = useState<number>(() => initialCourse?.backgroundDim ?? 50);
  const [customUrlInput, setCustomUrlInput] = useState(() => initialCourse?.backgroundImage || "");
  const [bgTab, setBgTab] = useState<"presets" | "custom" | "upload">("presets");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const currentAccent = getCourseAccent(color);

  // Sync state whenever initialCourse or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setName(initialCourse?.name || "");
      setCode(initialCourse?.code || "");
      setInstructor(initialCourse?.instructor || "");
      setCategory(initialCourse?.category || CATEGORIES[0]);
      setTargetHours(initialCourse?.targetHours ?? 12);
      setHoursCompleted(initialCourse?.hoursCompleted ?? 0);
      setColor(initialCourse?.color || "indigo");
      setNotes(initialCourse?.notes || "");
      setBackgroundImage(initialCourse?.backgroundImage || "");
      setBackgroundDim(initialCourse?.backgroundDim ?? 50);
      setCustomUrlInput(initialCourse?.backgroundImage || "");
      setBgTab(initialCourse?.backgroundImage ? "custom" : "presets");

      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialCourse]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Please choose an image smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setBackgroundImage(result);
          setCustomUrlInput(result);
          if (backgroundDim > 70) setBackgroundDim(50);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setBackgroundImage(customUrlInput.trim());
    }
  };

  const handleCustomUrlChange = (val: string) => {
    setCustomUrlInput(val);
    if (val.trim()) {
      setBackgroundImage(val.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const parsedTarget = Number(targetHours) > 0 ? Number(targetHours) : 12;
    const parsedCompleted = Math.max(0, Math.min(parsedTarget, Number(hoursCompleted) || 0));

    const finalBg = (backgroundImage || (bgTab === "custom" ? customUrlInput : "")).trim() || undefined;

    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      instructor: instructor.trim(),
      category,
      targetHours: parsedTarget,
      hoursCompleted: parsedCompleted,
      color,
      notes: notes.trim(),
      backgroundImage: finalBg,
      backgroundDim: Number(backgroundDim) || 50,
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialCourse ? "Edit University Subject & Visuals" : "Add New University Subject"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Subject Code */}
            <div>
              <label htmlFor="input-course-code" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Code *
              </label>
              <input
                ref={firstInputRef}
                id="input-course-code"
                type="text"
                required
                autoFocus
                placeholder="e.g. CS 301"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
              />
            </div>

            {/* Subject Name */}
            <div className="sm:col-span-2">
              <label htmlFor="input-course-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject Name *
              </label>
              <input
                id="input-course-name"
                type="text"
                required
                placeholder="e.g. Algorithms & Data Structures"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Instructor */}
            <div>
              <label htmlFor="input-course-instructor" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Instructor / Professor
              </label>
              <input
                id="input-course-instructor"
                type="text"
                placeholder="e.g. Dr. Alan Turing"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="select-course-category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                id="select-course-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Hours and Initial Completed */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label htmlFor="input-course-target" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Hours / Week
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="input-course-target"
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                />
                <span className="text-xs font-semibold text-slate-500">hrs</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Set any weekly hour target</p>
            </div>

            <div>
              <label htmlFor="input-course-current-hours" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Logged Hours
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="input-course-current-hours"
                  type="number"
                  min="0"
                  max={Number(targetHours) || 60}
                  step="0.5"
                  value={hoursCompleted}
                  onChange={(e) => setHoursCompleted(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                />
                <span className="text-xs font-semibold text-slate-500">/ {targetHours || 12}h</span>
              </div>
            </div>
          </div>

          {/* Color Theme */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                <span>Subject Accent Color</span>
              </label>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: currentAccent.hex }}
                />
                {currentAccent.name} ({currentAccent.hex.toUpperCase()})
              </span>
            </div>

            {/* Presets and Custom Color Picker */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2.5">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = color.toLowerCase() === c.id.toLowerCase() || color.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                      isSelected 
                        ? "ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-md" 
                        : "hover:scale-105 opacity-90 hover:opacity-100"
                    }`}
                    title={`${c.name} (${c.hex})`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                  </button>
                );
              })}

              {/* Custom Hex Color Picker */}
              <div className="relative inline-flex items-center">
                <label 
                  htmlFor="custom-accent-color-picker"
                  title="Pick any custom hex color"
                  className={`h-7 px-2.5 rounded-full border flex items-center space-x-1 text-xs font-medium cursor-pointer transition-all ${
                    currentAccent.isCustom 
                      ? "ring-2 ring-offset-2 ring-slate-800 border-slate-400 bg-slate-100 shadow-xs font-bold" 
                      : "border-slate-300 hover:border-slate-400 bg-white text-slate-600"
                  }`}
                >
                  <Pipette className="w-3 h-3 text-slate-500" />
                  <span>Custom</span>
                  <input
                    id="custom-accent-color-picker"
                    type="color"
                    value={currentAccent.hex}
                    onChange={(e) => setColor(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Custom Hex Direct Text Input */}
              {currentAccent.isCustom && (
                <div className="flex items-center space-x-1 pl-1">
                  <input
                    type="text"
                    value={color.startsWith("#") ? color : `#${color}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      setColor(val);
                    }}
                    placeholder="#6366F1"
                    maxLength={7}
                    className="w-20 px-2 py-1 text-xs font-mono font-bold border border-slate-300 rounded-md uppercase bg-white focus:outline-none focus:ring-1 focus:ring-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Live Accent Preview Ribbon */}
            <div 
              className="p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all"
              style={{
                backgroundColor: currentAccent.lightBg,
                borderColor: `rgba(${currentAccent.rgb}, 0.35)`,
              }}
            >
              <div className="flex items-center space-x-2">
                <span 
                  style={currentAccent.badgeStyle}
                  className="px-2 py-0.5 rounded font-mono font-bold text-xs border"
                >
                  {code || "CS 301"}
                </span>
                <span className="font-semibold text-slate-700">
                  {name || "Course Name"} Accent Preview
                </span>
              </div>
              <span 
                style={{ color: currentAccent.hex }}
                className="font-bold font-mono text-[11px]"
              >
                {currentAccent.hex.toUpperCase()}
              </span>
            </div>
          </div>

          {/* COURSE BACKGROUND PICTURE SECTION */}
          <div className="pt-3 border-t border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Card Background Picture</span>
              </label>

              {backgroundImage && (
                <button
                  type="button"
                  onClick={() => {
                    setBackgroundImage("");
                    setCustomUrlInput("");
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Picture</span>
                </button>
              )}
            </div>

            {/* Sub-tabs for Background Options */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setBgTab("presets")}
                className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                  bgTab === "presets" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Curated Presets
              </button>
              <button
                type="button"
                onClick={() => setBgTab("upload")}
                className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                  bgTab === "upload" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setBgTab("custom")}
                className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                  bgTab === "custom" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Image URL
              </button>
            </div>

            {/* Presets Grid */}
            {bgTab === "presets" && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-1">
                {PRESET_BACKGROUND_IMAGES.map((preset) => {
                  const isSelected = backgroundImage === preset.url;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setBackgroundImage(preset.url)}
                      className={`group relative rounded-lg overflow-hidden h-16 border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? "ring-2 ring-indigo-600 border-indigo-600 shadow-xs" 
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-1.5">
                        <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">
                          {preset.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Local Upload */}
            {bgTab === "upload" && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5 group-hover:text-indigo-600" />
                  <p className="text-xs font-bold text-slate-700">Click to upload image file</p>
                  <p className="text-[11px] text-slate-500">Supports PNG, JPG, WebP (up to 5MB)</p>
                </div>
              </div>
            )}

            {/* Custom URL */}
            {bgTab === "custom" && (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="https://example.com/course-photo.jpg"
                      value={customUrlInput}
                      onChange={(e) => handleCustomUrlChange(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono cursor-text"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Set URL
                  </button>
                </div>
              </div>
            )}

            {/* Live Picture Preview and Darken / Contrast Slider */}
            {backgroundImage && (
              <div className="p-3 bg-slate-900 rounded-xl space-y-2 text-white border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Background Dimming & Contrast Overlay</span>
                  </span>
                  <span className="font-mono text-indigo-300 font-bold">{backgroundDim}%</span>
                </div>

                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={backgroundDim}
                  onChange={(e) => setBackgroundDim(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Bright & Clear (20%)</span>
                  <span>Balanced (50%)</span>
                  <span>Deep Dark (90%)</span>
                </div>

                {/* Mini Preview Box */}
                <div 
                  className="h-16 rounded-lg overflow-hidden relative flex items-center px-4 border border-slate-700/80"
                >
                  <img
                    src={backgroundImage}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div 
                    className="absolute inset-0 bg-slate-950"
                    style={{ opacity: backgroundDim / 100 }}
                  />
                  <div className="relative z-10 flex items-center space-x-2">
                    <span 
                      style={currentAccent.badgeWallpaperStyle}
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded border"
                    >
                      {code || "CS 301"}
                    </span>
                    <span className="text-xs font-bold text-white">{name || "Course Card Preview"}</span>
                    <p className="text-[10px] text-slate-300">({targetHours || 12}h Target)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-course"
              type="submit"
              style={currentAccent.buttonStyle}
              className="px-5 py-2 text-white rounded-lg text-sm font-bold shadow-md transition-all cursor-pointer hover:brightness-110"
            >
              {initialCourse ? "Save Changes" : "Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

