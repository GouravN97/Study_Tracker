import React, { useState } from "react";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  MoreVertical, 
  Plus, 
  Minus, 
  Sparkles, 
  Trash2, 
  BookOpen, 
  User, 
  FileText,
  Clock
} from "lucide-react";
import confetti from "canvas-confetti";
import { Course } from "../types";
import { getCourseAccent } from "../utils/colorUtils";

interface CourseCardProps {
  course: Course;
  onUpdateHours: (id: string, hours: number) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onUpdateHours,
  onUpdateNotes,
  onEditCourse,
  onDeleteCourse,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(course.notes || "");
  const [isHovered, setIsHovered] = useState(false);

  const accent = getCourseAccent(course.color);
  const isGoalReached = course.hoursCompleted >= course.targetHours;

  const hasBg = Boolean(course.backgroundImage && course.backgroundImage.trim());
  const dimOpacity = Math.max(0.15, Math.min(0.85, (course.backgroundDim ?? 50) / 100));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const clamped = Math.min(course.targetHours, Math.max(0, val));
    onUpdateHours(course.id, clamped);

    if (clamped >= course.targetHours && course.hoursCompleted < course.targetHours) {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {
        // ignore if not supported
      }
    }
  };

  const handleAdjustHours = (delta: number) => {
    const newVal = Math.min(course.targetHours, Math.max(0, parseFloat((course.hoursCompleted + delta).toFixed(2))));
    onUpdateHours(course.id, newVal);

    if (newVal >= course.targetHours && course.hoursCompleted < course.targetHours) {
      try {
        confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.7 },
        });
      } catch (err) {}
    }
  };

  const handleSaveNotes = () => {
    onUpdateNotes(course.id, notesText);
    setIsEditingNotes(false);
  };

  return (
    <div 
      id={`course-card-${course.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={isHovered ? accent.borderGlowStyle : undefined}
      className={`rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-xs relative overflow-hidden flex flex-col justify-between group ${
        isGoalReached 
          ? "border-emerald-400 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10" 
          : "border-slate-700/80 hover:shadow-xl"
      } ${hasBg ? "text-white bg-slate-950" : "bg-white text-slate-900"}`}
    >
      {/* Dynamic Top Accent Bar Indicator */}
      <div 
        className="h-1.5 w-full absolute top-0 left-0 right-0 z-20 transition-all duration-300"
        style={{ background: accent.barGradient }}
      />

      {/* Background Image Layer */}
      {hasBg && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src={course.backgroundImage}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div 
            className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
            style={{ opacity: dimOpacity }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
        </div>
      )}

      <div className="relative z-10 pt-1">
        {/* Top Header info */}
        <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {/* Dynamic Accent Course Code Badge */}
              <span 
                style={hasBg ? accent.badgeWallpaperStyle : accent.badgeStyle}
                className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border backdrop-blur-xs transition-colors"
              >
                {course.code}
              </span>

              {course.category && (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                  hasBg 
                    ? "bg-slate-800/80 text-slate-200 border border-slate-700/70 backdrop-blur-xs" 
                    : "text-slate-500 bg-slate-100"
                }`}>
                  {course.category}
                </span>
              )}

              {isGoalReached && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                  {course.targetHours}h Goal Met!
                </span>
              )}
            </div>

            <h3 className={`text-base sm:text-lg font-bold leading-snug ${hasBg ? "text-white drop-shadow-xs" : "text-slate-900"}`}>
              {course.name}
            </h3>

            {course.instructor && (
              <div className={`flex items-center text-xs ${hasBg ? "text-slate-300" : "text-slate-500"}`}>
                <User className="w-3 h-3 mr-1 text-slate-400" />
                <span>{course.instructor}</span>
              </div>
            )}
          </div>

          {/* Action icons */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              id={`btn-edit-${course.id}`}
              onClick={() => onEditCourse(course)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                hasBg 
                  ? "text-slate-300 hover:text-white hover:bg-slate-800/80 bg-slate-900/60 border border-slate-700/60" 
                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              }`}
              title="Edit Subject & Target Hours"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id={`btn-delete-${course.id}`}
              onClick={() => onDeleteCourse(course.id)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                hasBg 
                  ? "text-slate-300 hover:text-rose-400 hover:bg-rose-950/60 bg-slate-900/60 border border-slate-700/60" 
                  : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              }`}
              title="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Interactive Hours Slider Section */}
        <div className={`rounded-xl p-4 border space-y-4 mb-4 relative z-10 ${
          hasBg 
            ? "bg-slate-950/70 border-slate-700/80 backdrop-blur-md" 
            : "bg-slate-50/80 border-slate-200/70"
        }`}>
          {/* Hours readout */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-center space-x-1.5">
              <Clock 
                className="w-4 h-4 transition-colors"
                style={{ color: accent.hex }}
              />
              <span className={`text-xs font-bold uppercase tracking-wider ${hasBg ? "text-slate-300" : "text-slate-600"}`}>
                Completed Hours:
              </span>
            </div>

            <div className="flex items-baseline space-x-1.5">
              <span className={`text-2xl sm:text-3xl font-black font-mono ${hasBg ? "text-white" : "text-slate-900"}`}>
                {course.hoursCompleted.toFixed(1)}
              </span>
              <button
                type="button"
                onClick={() => onEditCourse(course)}
                title="Click to edit course target hours"
                className={`text-sm font-bold transition-colors cursor-pointer hover:underline ${hasBg ? "text-slate-400 hover:text-white" : "text-slate-500"}`}
              >
                / {course.targetHours}h
              </button>
            </div>
          </div>

          {/* Interactive Range Slider - dynamically uses the chosen Accent color */}
          <div className="space-y-1.5">
            <input
              id={`slider-${course.id}`}
              type="range"
              min="0"
              max={course.targetHours}
              step="0.25"
              value={course.hoursCompleted}
              onChange={handleSliderChange}
              style={{ accentColor: accent.hex }}
              className={`w-full h-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none ${
                hasBg ? "bg-slate-800" : "bg-slate-200"
              }`}
              aria-label={`Hours completed for ${course.name} out of ${course.targetHours} hours`}
            />

            {/* Dynamic Tick Markers */}
            <div className={`flex justify-between text-[11px] font-semibold px-0.5 ${hasBg ? "text-slate-400" : "text-slate-400"}`}>
              <span>0h</span>
              <span>{(course.targetHours * 0.25).toFixed(course.targetHours % 4 === 0 ? 0 : 1)}h</span>
              <span>{(course.targetHours * 0.5).toFixed(course.targetHours % 2 === 0 ? 0 : 1)}h</span>
              <span>{(course.targetHours * 0.75).toFixed(course.targetHours % 4 === 0 ? 0 : 1)}h</span>
              <span 
                style={{ color: accent.hex }}
                className="font-bold"
              >
                {course.targetHours}h Target
              </span>
            </div>
          </div>

          {/* Quick Stepper Buttons */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1 flex-wrap">
            <div className="flex items-center space-x-1">
              <button
                id={`btn-minus-1h-${course.id}`}
                onClick={() => handleAdjustHours(-1)}
                disabled={course.hoursCompleted <= 0}
                className={`px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed border rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                  hasBg 
                    ? "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700" 
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                -1.0h
              </button>
              <button
                id={`btn-minus-half-h-${course.id}`}
                onClick={() => handleAdjustHours(-0.5)}
                disabled={course.hoursCompleted <= 0}
                className={`px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed border rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                  hasBg 
                    ? "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700" 
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                -0.5h
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                id={`btn-plus-half-h-${course.id}`}
                onClick={() => handleAdjustHours(0.5)}
                disabled={course.hoursCompleted >= course.targetHours}
                className={`px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed border rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                  hasBg 
                    ? "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700" 
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                +0.5h
              </button>
              <button
                id={`btn-plus-1h-${course.id}`}
                onClick={() => handleAdjustHours(1)}
                disabled={course.hoursCompleted >= course.targetHours}
                className={`px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed border rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                  hasBg 
                    ? "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700" 
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                +1.0h
              </button>

              {/* Target Action Button with dynamic accent */}
              <button
                id={`btn-max-${course.id}`}
                onClick={() => {
                  onUpdateHours(course.id, course.targetHours);
                  try {
                    confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
                  } catch (e) {}
                }}
                style={hasBg ? accent.buttonStyle : accent.subtleButtonStyle}
                className="px-2.5 py-1 border rounded-md text-xs font-bold transition-all cursor-pointer hover:brightness-110"
              >
                Target ({course.targetHours}h)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Notes & Topics Covered (Collapsible) */}
      <div className={`border-t pt-3 relative z-10 ${hasBg ? "border-slate-700/80" : "border-slate-100"}`}>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`flex items-center justify-between w-full text-xs font-semibold transition-colors cursor-pointer ${
            hasBg ? "text-slate-300 hover:text-white" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Weekly Study Notes & Topics</span>
            {course.notes && (
              <span 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: accent.hex }}
              />
            )}
          </span>
          {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showNotes && (
          <div className="mt-2.5 pt-1 space-y-2">
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  id={`textarea-notes-${course.id}`}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="E.g., Solved homework set 4, revised chapter 5 lecture slides, worked on semester project..."
                  rows={2}
                  className={`w-full p-2.5 border rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 resize-none ${
                    hasBg 
                      ? "bg-slate-900/90 border-slate-700 text-white placeholder-slate-500" 
                      : "bg-slate-50 border-slate-300 text-slate-800 focus:bg-white"
                  }`}
                  style={{
                    borderColor: isEditingNotes ? accent.hex : undefined,
                  }}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setNotesText(course.notes || "");
                      setIsEditingNotes(false);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium cursor-pointer ${
                      hasBg ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    style={accent.buttonStyle}
                    className="px-3 py-1 text-white rounded-md text-xs font-semibold shadow-2xs cursor-pointer hover:brightness-110 transition-all"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingNotes(true)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer group transition-colors ${
                  hasBg 
                    ? "bg-slate-950/70 hover:bg-slate-900/80 border-slate-700/80 text-slate-200" 
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700"
                }`}
                title="Click to edit weekly study notes"
              >
                {course.notes ? (
                  <p className={`italic leading-relaxed ${hasBg ? "text-slate-200" : "text-slate-700"}`}>"{course.notes}"</p>
                ) : (
                  <p className={`${hasBg ? "text-slate-400" : "text-slate-400"} italic`}>
                    No notes logged this week. Click to add key topics studied or homework finished...
                  </p>
                )}
                <div className="mt-1 flex justify-end">
                  <span 
                    style={{ color: accent.hex }}
                    className="text-[10px] font-semibold group-hover:underline"
                  >
                    Edit notes
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

