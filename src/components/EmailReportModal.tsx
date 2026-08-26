import React, { useState, useEffect } from "react";
import { 
  X, 
  Mail, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  FileText, 
  Code, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Clock,
  BookOpen
} from "lucide-react";
import { Course, WeeklyReport, UserSettings, AISummary } from "../types";
import { generateReportHtml, generatePlainTextSummary, createMailtoUrl } from "../utils/emailTemplate";

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  weekLabel: string;
  weekId: string;
  settings: UserSettings;
  onUpdateEmail: (email: string) => void;
  onSaveReportToArchive: (report: WeeklyReport) => void;
  existingReport?: WeeklyReport | null;
}

export const EmailReportModal: React.FC<EmailReportModalProps> = ({
  isOpen,
  onClose,
  courses,
  weekLabel,
  weekId,
  settings,
  onUpdateEmail,
  onSaveReportToArchive,
  existingReport,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(settings.studentEmail);
  const [viewMode, setViewMode] = useState<"preview" | "text" | "raw">("preview");
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; deliveryId?: string; message: string } | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(existingReport?.aiSummary || null);

  const totalHours = courses.reduce((sum, c) => sum + c.hoursCompleted, 0);
  const totalTargetHours = courses.reduce((sum, c) => sum + c.targetHours, 0);
  const completionPercentage = totalTargetHours > 0 
    ? Math.round((totalHours / totalTargetHours) * 100) 
    : 0;

  const currentReport: WeeklyReport = existingReport || {
    id: "rep-" + weekId,
    weekId,
    weekStartDate: new Date().toISOString(),
    weekEndDate: new Date().toISOString(),
    weekLabel,
    archivedAt: new Date().toISOString(),
    totalHours,
    totalTargetHours,
    completionPercentage,
    coursesSnapshot: courses,
    aiSummary: aiSummary || undefined,
  };

  useEffect(() => {
    setRecipientEmail(settings.studentEmail);
  }, [settings.studentEmail]);

  useEffect(() => {
    if (isOpen && !aiSummary && !existingReport?.aiSummary) {
      handleGenerateAISummary();
    }
  }, [isOpen]);

  const handleGenerateAISummary = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekLabel,
          totalHours,
          targetHours: totalTargetHours,
          courses,
          userEmail: recipientEmail,
          studentName: settings.studentName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSummary(data);
        currentReport.aiSummary = data;
        return;
      }
    } catch (err) {
      console.warn("Network issue fetching AI summary, using local academic synthesis:", err);
    } finally {
      setIsGeneratingAI(false);
    }

    // Client-side fallback if server fails
    const completionRate = totalTargetHours > 0 ? Math.round((totalHours / totalTargetHours) * 100) : 0;
    const grade = completionRate >= 90 ? "A" : completionRate >= 75 ? "B+" : completionRate >= 50 ? "B" : "C+";
    const topCourse = [...courses].sort((a, b) => b.hoursCompleted - a.hoursCompleted)[0];
    const fallback: AISummary = {
      executiveSummary: `During ${weekLabel}, you logged ${totalHours} hours across ${courses.length} courses (${completionRate}% weekly target completion rate).`,
      grade,
      highlightSubject: topCourse ? `${topCourse.name} (${topCourse.hoursCompleted}h)` : "University Study",
      attentionSubject: courses.find(c => c.hoursCompleted < (c.targetHours || 12) * 0.6)?.name || "All courses in healthy pacing",
      strengths: [
        `Maintained tracking across ${courses.length} active courses.`,
        "Recorded study hours consistently before the weekly deadline."
      ],
      actionablePlan: [
        "Plan 2-hour morning deep work blocks for higher focus.",
        "Review key concept flashcards or problem sets within 24 hours of each lecture."
      ],
      encouragementQuote: "Consistency is the DNA of academic mastery.",
      aiGenerated: false,
    };
    setAiSummary(fallback);
    currentReport.aiSummary = fallback;
  };

  const htmlReport = generateReportHtml(
    { ...currentReport, aiSummary: aiSummary || undefined },
    { ...settings, studentEmail: recipientEmail }
  );
  const textReport = generatePlainTextSummary(
    { ...currentReport, aiSummary: aiSummary || undefined },
    { ...settings, studentEmail: recipientEmail }
  );
  const mailtoLink = createMailtoUrl(
    { ...currentReport, aiSummary: aiSummary || undefined },
    { ...settings, studentEmail: recipientEmail }
  );

  const handleCopy = (type: "html" | "text") => {
    const content = type === "html" ? htmlReport : textReport;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) return;
    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/send-email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: recipientEmail,
          subject: `Weekly University Course Progress Report: ${weekLabel} - ${settings.studentName}`,
          htmlContent: htmlReport,
          textContent: textReport,
          weekLabel,
          stats: {
            totalHours,
            totalTargetHours,
            completionPercentage,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSendResult({
          success: true,
          deliveryId: data.deliveryId,
          message: `Weekly report successfully delivered to ${recipientEmail}!`,
        });

        // Save report snapshot to history
        onSaveReportToArchive({
          ...currentReport,
          aiSummary: aiSummary || undefined,
          emailSentTo: recipientEmail,
          emailSentAt: new Date().toISOString(),
          deliveryId: data.deliveryId,
        });
      } else {
        setSendResult({
          success: false,
          message: data.error || "Failed to send email.",
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err.message || "Network error while sending email report.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = (format: "html" | "txt") => {
    const blob = new Blob([format === "html" ? htmlReport : textReport], {
      type: format === "html" ? "text/html" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Study-Report-${weekId}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-inner">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Weekly Course Progress Report
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  {weekLabel}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Automated weekly summary & academic evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Recipient Email Input */}
          <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              To Email:
            </span>
            <input
              id="input-recipient-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                onUpdateEmail(e.target.value);
              }}
              placeholder="your-email@university.edu"
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* View Mode Switches */}
          <div className="flex items-center space-x-1 bg-slate-200/80 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === "preview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Email Preview
            </button>
            <button
              onClick={() => setViewMode("text")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === "text" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Plain Text
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === "raw" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              HTML Source
            </button>
          </div>
        </div>

        {/* Delivery status alert banner if sent */}
        {sendResult && (
          <div className={`px-6 py-2.5 flex items-center justify-between text-xs font-semibold ${
            sendResult.success ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200" : "bg-rose-50 text-rose-800 border-b border-rose-200"
          }`}>
            <div className="flex items-center space-x-2">
              {sendResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{sendResult.message}</span>
              {sendResult.deliveryId && (
                <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-[11px] text-emerald-900">
                  Ref: {sendResult.deliveryId}
                </span>
              )}
            </div>
            <button onClick={() => setSendResult(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Report Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          {/* AI Advisor Card Header */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-indigo-100 shadow-xs mb-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Academic Advisor Weekly Evaluation
                </h3>
                {aiSummary?.grade && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold text-xs rounded-md">
                    Grade: {aiSummary.grade}
                  </span>
                )}
              </div>
              <button
                onClick={handleGenerateAISummary}
                disabled={isGeneratingAI}
                className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? "animate-spin" : ""}`} />
                <span>{isGeneratingAI ? "Analyzing with Gemini..." : "Refresh Insights"}</span>
              </button>
            </div>

            {isGeneratingAI ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                <p className="text-xs font-semibold">Gemini is analyzing your weekly course progress and notes...</p>
              </div>
            ) : aiSummary ? (
              <div className="space-y-3 text-xs sm:text-sm">
                <p className="text-slate-700 leading-relaxed font-medium">
                  {aiSummary.executiveSummary}
                </p>

                {aiSummary.highlightSubject && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200/80 text-emerald-900 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Top Course:</strong> {aiSummary.highlightSubject}</span>
                  </div>
                )}

                {aiSummary.strengths && aiSummary.strengths.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      Strengths & Positive Habits
                    </h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-xs">
                      {aiSummary.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.actionablePlan && aiSummary.actionablePlan.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      Focus Areas for Upcoming Week
                    </h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-xs">
                      {aiSummary.actionablePlan.map((plan, idx) => (
                        <li key={idx}>{plan}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.encouragementQuote && (
                  <div className="pt-2 border-t border-slate-100 text-center italic text-slate-500 text-xs">
                    "{aiSummary.encouragementQuote}"
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Click "Refresh Insights" to generate customized AI academic feedback.
              </p>
            )}
          </div>

          {/* Main View Mode Render */}
          {viewMode === "preview" && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
              <div 
                className="p-1 sm:p-2"
                dangerouslySetInnerHTML={{ __html: htmlReport }}
              />
            </div>
          )}

          {viewMode === "text" && (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {textReport}
              </pre>
            </div>
          )}

          {viewMode === "raw" && (
            <div className="bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto shadow-xs">
              <pre className="whitespace-pre-wrap">{htmlReport}</pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            {/* Copy Button */}
            <button
              id="btn-copy-report"
              onClick={() => handleCopy(viewMode === "raw" ? "html" : "text")}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? "Copied!" : "Copy Report"}</span>
            </button>

            {/* Download */}
            <button
              onClick={() => handleDownload("html")}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Download HTML transcript"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Open in Native Mail Client */}
            <a
              id="btn-mailto"
              href={mailtoLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Open prepared email in your default mail app"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Mail Client</span>
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Close
            </button>

            {/* Main Primary Send Action */}
            <button
              id="btn-send-email-now"
              onClick={handleSendEmail}
              disabled={isSending || !recipientEmail}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Send className={`w-4 h-4 ${isSending ? "animate-pulse" : ""}`} />
              <span>{isSending ? "Dispatching Report..." : `Send Email to ${recipientEmail}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
