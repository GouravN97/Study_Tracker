import React, { useEffect, useState } from "react";
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
import { Course, CourseNote } from "../types";
import { getCourseAccent } from "../utils/colorUtils";

interface CourseCardProps {
  course: Course;
  onUpdateHours: (id: string, hours: number) => void;
  onUpdateNotes: (id: string, noteList: CourseNote[]) => void;
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
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [bannerFailed, setBannerFailed] = useState(false);

  // Retry the banner whenever the picture changes
  useEffect(() => {
    setBannerFailed(false);
  }, [course.backgroundImage]);

  const effectiveNotes = course.noteList ? [...course.noteList] : [];
  if (course.notes && !effectiveNotes.find(n => n.id === 'legacy')) {
    effectiveNotes.unshift({
      id: 'legacy',
      text: course.notes,
      createdAt: course.lastUpdated || new Date().toISOString()
    });
  }

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      text: newNoteText.trim(),
      createdAt: new Date().toISOString()
    };
    onUpdateNotes(course.id, [...effectiveNotes, newNote]);
    setNewNoteText("");
    setIsAddingNote(false);
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateNotes(course.id, effectiveNotes.filter(n => n.id !== noteId));
  };

  const accent = getCourseAccent(course.color);
  const isGoalReached = course.hoursCompleted >= course.targetHours;

  const hasBg = Boolean(course.backgroundImage && course.backgroundImage.trim()) && !bannerFailed;
  // Photos are shown as a taped-on banner; the dim setting only lightly tints it
  const bannerTint = Math.max(0.05, Math.min(0.5, ((course.backgroundDim ?? 50) / 100) * 0.5));
  const accentTint = `rgba(${accent.rgb}, 0.18)`;
  // Strong enough to read as the course color, light enough to keep ink text legible
  const accentFill = `rgba(${accent.rgb}, 0.55)`;
  const fillPercent = course.targetHours > 0
    ? Math.min(100, Math.max(0, (course.hoursCompleted / course.targetHours) * 100))
    : 0;
  const stepButton = "doodle-btn bg-white px-2 py-1 text-xs";

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

  return (
    <div 
      id={`course-card-${course.id}`}
      className={`doodle-card relative flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:-rotate-[0.6deg] ${
        isGoalReached ? "bg-[#effcf6]" : "bg-white"
      }`}
    >
      {/* Photo banner taped onto the card, or a colored accent strip */}
      {hasBg ? (
        <div className="relative h-28 -mb-1">
          <span className="doodle-tape -top-2.5 left-1/2 -translate-x-1/2 -rotate-3 z-20" />
          <div className="absolute inset-0 rounded-t-[1.05rem] overflow-hidden border-b-[2.5px] border-ink">
            <img
              src={course.backgroundImage}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              style={{ backgroundColor: accentTint }}
              onError={() => setBannerFailed(true)}
            />
            <div className="absolute inset-0 bg-ink pointer-events-none" style={{ opacity: bannerTint }} />
          </div>
        </div>
      ) : (
        <div
          className="h-4 rounded-t-[1.05rem] border-b-[2.5px] border-ink"
          style={{ backgroundColor: accent.hex }}
        />
      )}

      <div className="p-5 sm:p-6 pt-4 sm:pt-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Top Header info */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span 
                  className="doodle-chip text-xs"
                  style={{ backgroundColor: accentTint }}
                >
                  {course.code}
                </span>

                {course.category && (
                  <span className="doodle-chip bg-white border-dashed font-medium">
                    {course.category}
                  </span>
                )}

                {isGoalReached && (
                  <span className="doodle-chip bg-lemon -rotate-2">
                    <Sparkles className="w-3 h-3" />
                    {course.targetHours}h Goal Met!
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-bold leading-snug">
                {course.name}
              </h3>

              {course.instructor && (
                <div className="flex items-center text-xs text-ink/60">
                  <User className="w-3 h-3 mr-1" />
                  <span>{course.instructor}</span>
                </div>
              )}
            </div>

            {/* Action icons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id={`btn-edit-${course.id}`}
                onClick={() => onEditCourse(course)}
                className="doodle-btn bg-white p-1.5 rounded-lg"
                title="Edit Subject & Target Hours"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                id={`btn-delete-${course.id}`}
                onClick={() => onDeleteCourse(course.id)}
                className="doodle-btn bg-white hover:bg-rose-200 p-1.5 rounded-lg"
                title="Delete Subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Interactive Hours Slider Section */}
          <div 
            className="rounded-2xl p-4 border-2 border-dashed border-ink/40 space-y-3"
            style={{ backgroundColor: accentTint }}
          >
            {/* Hours readout */}
            <div className="flex items-baseline justify-between">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Completed Hours:
                </span>
              </div>

              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl sm:text-4xl font-bold tabular-nums">
                  {course.hoursCompleted.toFixed(1)}
                </span>
                <button
                  type="button"
                  onClick={() => onEditCourse(course)}
                  title="Click to edit course target hours"
                  className="text-sm font-bold text-ink/60 hover:text-ink transition-colors cursor-pointer hover:underline decoration-wavy"
                >
                  / {course.targetHours}h
                </button>
              </div>
            </div>

            {/* Interactive Range Slider - dynamically uses the chosen Accent color */}
            <div className="space-y-1">
              <input
                id={`slider-${course.id}`}
                type="range"
                min="0"
                max={course.targetHours}
                step="0.25"
                value={course.hoursCompleted}
                onChange={handleSliderChange}
                style={{ "--accent": accent.hex, "--fill": `${fillPercent}%` } as React.CSSProperties}
                className="doodle-range"
                aria-label={`Hours completed for ${course.name} out of ${course.targetHours} hours`}
              />

              {/* Dynamic Tick Markers */}
              <div className="flex justify-between text-[11px] font-semibold px-0.5 text-ink/50">
                <span>0h</span>
                <span>{(course.targetHours * 0.25).toFixed(course.targetHours % 4 === 0 ? 0 : 1)}h</span>
                <span>{(course.targetHours * 0.5).toFixed(course.targetHours % 2 === 0 ? 0 : 1)}h</span>
                <span>{(course.targetHours * 0.75).toFixed(course.targetHours % 4 === 0 ? 0 : 1)}h</span>
                <span className="font-bold text-ink">
                  {course.targetHours}h Target
                </span>
              </div>
            </div>

            {/* Quick Stepper Buttons */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <button
                  id={`btn-minus-1h-${course.id}`}
                  onClick={() => handleAdjustHours(-1)}
                  disabled={course.hoursCompleted <= 0}
                  className={stepButton}
                >
                  -1.0h
                </button>
                <button
                  id={`btn-minus-half-h-${course.id}`}
                  onClick={() => handleAdjustHours(-0.5)}
                  disabled={course.hoursCompleted <= 0}
                  className={stepButton}
                >
                  -0.5h
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id={`btn-plus-half-h-${course.id}`}
                  onClick={() => handleAdjustHours(0.5)}
                  disabled={course.hoursCompleted >= course.targetHours}
                  className={stepButton}
                >
                  +0.5h
                </button>
                <button
                  id={`btn-plus-1h-${course.id}`}
                  onClick={() => handleAdjustHours(1)}
                  disabled={course.hoursCompleted >= course.targetHours}
                  className={stepButton}
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
                  style={{ backgroundColor: accentFill }}
                  className="doodle-btn px-2.5 py-1 text-xs font-bold"
                >
                  Target ({course.targetHours}h)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Notes & Topics Covered (Collapsible) */}
        <div className="border-t-2 border-dashed border-ink/30 pt-3">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center justify-between w-full text-xs font-semibold text-ink/70 hover:text-ink transition-colors cursor-pointer"
          >
            <span className="flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Weekly Study Notes & Topics</span>
              {effectiveNotes.length > 0 && (
                <span className="doodle-chip bg-lemon px-1.5 py-0 text-[10px]">{effectiveNotes.length}</span>
              )}
            </span>
            {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showNotes && (
            <div className="mt-3 pt-1 space-y-2.5">
              {effectiveNotes.length > 0 ? (
                <div className="space-y-2.5">
                  {effectiveNotes.map((note, i) => (
                    <div 
                      key={note.id}
                      className={`p-2.5 rounded-lg border-2 border-ink bg-[#fff6b3] shadow-doodle-sm text-sm group flex justify-between items-start ${
                        i % 2 === 0 ? "-rotate-[0.6deg]" : "rotate-[0.6deg]"
                      }`}
                    >
                      <p className="leading-relaxed flex-1 pr-2 whitespace-pre-wrap">{note.text}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-ink/60 hover:text-rose-600 hover:bg-white/70"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                !isAddingNote && (
                  <div 
                    onClick={() => setIsAddingNote(true)}
                    className="p-3 rounded-lg border-2 border-dashed border-ink/40 text-xs cursor-pointer text-center text-ink/60 hover:text-ink hover:bg-lemon/30 transition-colors"
                  >
                    <p>No notes logged this week. Click to add key topics studied...</p>
                  </div>
                )
              )}

              {isAddingNote ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="E.g., Solved homework set 4, revised chapter 5 lecture slides..."
                    rows={2}
                    className="doodle-input w-full p-2.5 text-sm resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setNewNoteText("");
                        setIsAddingNote(false);
                      }}
                      className="doodle-btn bg-white px-2.5 py-1 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      style={{ backgroundColor: accentFill }}
                      className="doodle-btn px-3 py-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Note</span>
                    </button>
                  </div>
                </div>
              ) : (
                effectiveNotes.length > 0 && (
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="flex items-center space-x-1 mt-2 text-xs font-semibold cursor-pointer text-ink/60 hover:text-ink transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add another note</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
