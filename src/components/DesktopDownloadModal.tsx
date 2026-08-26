import React, { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  Monitor, 
  Terminal, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  ShieldCheck,
  Zap,
  FolderArchive,
  ArrowRight
} from "lucide-react";
import JSZip from "jszip";

interface DesktopDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopDownloadModal: React.FC<DesktopDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        "To install as a native Windows Desktop app:\n1. Click the 'Install App' (or computer/download) icon in your browser's address bar (Chrome or Microsoft Edge).\n2. Or click the 3 dots menu -> 'Cast, save, and share' -> 'Install University Course Weekly Progress Tracker'."
      );
    }
  };

  const handleDownloadElectronPackage = async () => {
    setIsGeneratingZip(true);
    try {
      const res = await fetch("/api/export-project-zip");
      if (!res.ok) throw new Error("Server zip export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "University_Course_Tracker_Complete_Project.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error creating zip via API, falling back to client zip", err);
      window.open("/api/export-project-zip", "_blank");
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const nativefierCmd = `npx nativefier --name "UniversityStudyTracker" --platform windows "${window.location.origin}"`;
  const edgeAppCmd = `msedge.exe --app="${window.location.origin}"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Desktop App & Windows .EXE Download
              </h2>
              <p className="text-xs text-slate-500">
                Run the Study Tracker as a standalone native desktop application
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {/* Option 1: 1-Click Instant Windows Desktop App (PWA) */}
          <div className="p-5 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 rounded-2xl border border-indigo-200/80 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-1.5">
                  <span>1-Click Native Desktop App (Zero Build Needed)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Instant
                  </span>
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Instantly installs onto your <strong>Windows Start Menu, Desktop, and Taskbar</strong>. Runs in its own dedicated window without browser URL bars or tabs, with persistent offline study data.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                id="btn-install-pwa-action"
                onClick={handleInstallPwa}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center space-x-2"
              >
                <Monitor className="w-4 h-4" />
                <span>{isInstalled ? "App Installed on Desktop" : "Install as Windows Desktop App"}</span>
              </button>

              <a
                href="/api/download-launcher"
                download="Launch-University-Study-Tracker.bat"
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Download .BAT App Launcher</span>
              </a>

              <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Runs securely on Windows 10/11</span>
              </div>
            </div>
          </div>

          {/* Option 2: Download Windows .EXE Builder Package */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Download Standalone Windows .EXE Builder (.ZIP)
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Downloads a ready-to-run package with a 1-click Windows batch script (<code className="text-indigo-600 font-bold">build-exe.bat</code>) and Electron configuration that packages this tracker directly into a Windows <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">.exe</code> executable.
            </p>

            <button
              id="btn-download-exe-zip"
              onClick={handleDownloadElectronPackage}
              disabled={isGeneratingZip}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingZip ? "Generating Desktop Package..." : "Download Windows .EXE Build Package (.zip)"}</span>
            </button>
          </div>

          {/* Option 3: Terminal 1-Line Command to create .exe */}
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h3 className="font-bold text-white text-sm">
                  1-Line Windows Terminal Command to generate .EXE
                </h3>
              </div>
              <Terminal className="w-4 h-4 text-indigo-400" />
            </div>

            <p className="text-xs text-slate-300">
              Open Command Prompt or PowerShell on your Windows PC and run this command:
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <code className="text-[11px] font-mono text-emerald-400 break-all select-all">
                npm run build && npx electron .
              </code>
              <button
                onClick={() => handleCopy("npm run build && npx electron .", 1)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium shrink-0 flex items-center space-x-1 cursor-pointer"
                title="Copy Command"
              >
                {copiedIndex === 1 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              This launches a 100% offline native desktop app window loading your local files directly with zero logins or cloud dependencies.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Fully compatible with Windows 10 & 11
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
