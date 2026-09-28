import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Trash2, Database, CheckCircle2 } from "lucide-react";
import { isQuotaExceededError, STORAGE_KEYS } from "../utils/storageUtils";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  quotaCleaned: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    quotaCleaned: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const isQuota = isQuotaExceededError(error);
    // If it's a quota exceeded error, automatically purge the heavy weekly reports cache
    if (isQuota && typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.WEEKLY_REPORTS);
      } catch (e) {
        console.warn("Could not purge weekly reports cache on quota error:", e);
      }
    }
    return { hasError: true, error, quotaCleaned: isQuota };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error caught by boundary:", error, errorInfo);
    if (isQuotaExceededError(error) && typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.WEEKLY_REPORTS);
        this.setState({ quotaCleaned: true });
      } catch (e) {
        console.warn("Could not clear weekly reports:", e);
      }
    }
  }

  private handleClearHistoryCache = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEYS.WEEKLY_REPORTS);
      }
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEYS.COURSES);
        window.localStorage.removeItem(STORAGE_KEYS.WEEKLY_REPORTS);
        window.localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
        window.localStorage.removeItem(STORAGE_KEYS.DAILY_NOTEPAD);
      }
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      const isQuota = isQuotaExceededError(this.state.error);

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
            <div className={`w-16 h-16 rounded-2xl ${isQuota ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} border mx-auto flex items-center justify-center`}>
              {isQuota ? <Database className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-white">
                {isQuota ? "Local Storage Quota Resolved" : "Application Notice"}
              </h1>
              <p className="text-sm text-slate-400">
                {isQuota
                  ? "Your browser's local report cache reached its storage limit during the Monday cycle. We have safely pruned the local history cache. Your courses, goals, and full server archives remain intact."
                  : "The tracker encountered a startup state issue. You can quickly reload or reset local cache to restore the tracker."}
              </p>
            </div>

            {isQuota && this.state.quotaCleaned && (
              <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Heavy report cache automatically cleaned. Ready to reload.</span>
              </div>
            )}

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs font-mono text-rose-400 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Tracker</span>
              </button>

              {isQuota ? (
                <button
                  type="button"
                  onClick={this.handleClearHistoryCache}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Free History Cache</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={this.handleResetData}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-amber-400" />
                  <span>Clear Cache & Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
