import React, { useState, useRef } from "react";
import { 
  X, 
  Palette, 
  Image as ImageIcon, 
  Check, 
  Sliders, 
  Upload, 
  Link as LinkIcon, 
  Sun, 
  Moon,
  Trash2,
} from "lucide-react";
import { UserSettings } from "../types";
import { BACKGROUND_PRESETS, BackgroundPreset, DEFAULT_BACKGROUND_ID, resolveBackgroundPreset } from "../data/themes";

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (updated: Partial<UserSettings>) => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<"backgrounds" | "custom-bg">(
    settings.backgroundStyle === "custom" ? "custom-bg" : "backgrounds"
  );
  const [customUrlInput, setCustomUrlInput] = useState(settings.customBackgroundUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isCustomActive = settings.backgroundStyle === "custom" && Boolean(settings.customBackgroundUrl);
  const currentBg = resolveBackgroundPreset(settings.backgroundStyle);

  const handleBgSelect = (bgId: string) => {
    onUpdateSettings({ backgroundStyle: bgId });
  };

  const handleDimChange = (val: number) => {
    onUpdateSettings({ backgroundDim: val });
  };

  const handleBlurChange = (val: number) => {
    onUpdateSettings({ backgroundBlur: val });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert("Please choose an image under 8MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          onUpdateSettings({
            backgroundStyle: "custom",
            customBackgroundUrl: result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      onUpdateSettings({
        backgroundStyle: "custom",
        customBackgroundUrl: customUrlInput.trim(),
      });
    }
  };

  const renderPresetTile = (bg: BackgroundPreset) => {
    const isSelected = !isCustomActive && currentBg.id === bg.id;
    const isDark = bg.themeMode === "dark";
    return (
      <button
        key={bg.id}
        type="button"
        onClick={() => handleBgSelect(bg.id)}
        className={`doodle-btn relative h-28 p-0 overflow-hidden flex-col items-stretch justify-end text-left ${
          isSelected ? "ring-4 ring-lemon" : ""
        }`}
        style={{ ...bg.style, backgroundSize: "180px 180px, 14px 14px" }}
      >
        {isSelected && (
          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-lemon border-2 border-ink flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </span>
        )}
        <span className={`m-2 px-2 py-1 rounded-lg border-2 border-ink ${isDark ? "bg-ink text-white" : "bg-white"}`}>
          <span className="block text-xs font-bold leading-tight">{bg.name}</span>
          <span className="flex gap-1 mt-1">
            {bg.swatches.map((c) => (
              <span key={c} className="w-3 h-3 rounded-full border border-ink" style={{ backgroundColor: c }} />
            ))}
          </span>
        </span>
      </button>
    );
  };

  const tabClass = (isActive: boolean) =>
    `doodle-btn px-3 py-1.5 text-xs sm:text-sm ${isActive ? "bg-lemon" : "bg-white shadow-none hover:shadow-doodle-sm"}`;

  return (
    <div 
      className="doodle-modal-overlay flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="doodle-modal max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-ink bg-grape shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-ink shadow-doodle-sm flex items-center justify-center -rotate-6">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold leading-tight">
                Doodle Themes
              </h2>
              <p className="text-xs text-ink/70">
                Pick a doodle backdrop or bring your own wallpaper
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="doodle-btn bg-white p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-6 py-3 border-b-2 border-dashed border-ink/30 shrink-0">
          <button onClick={() => setActiveTab("backgrounds")} className={tabClass(activeTab === "backgrounds")}>
            <ImageIcon className="w-4 h-4" />
            <span>Doodle Backgrounds</span>
          </button>
          <button onClick={() => setActiveTab("custom-bg")} className={tabClass(activeTab === "custom-bg")}>
            <Upload className="w-4 h-4" />
            <span>Custom Wallpaper</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "backgrounds" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Bright & Sunny</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {BACKGROUND_PRESETS.filter(b => b.category === "Doodle Light").map(renderPresetTile)}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>After Dark</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {BACKGROUND_PRESETS.filter(b => b.category === "Doodle Dark").map(renderPresetTile)}
                </div>
              </div>
            </div>
          )}

          {activeTab === "custom-bg" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Upload Custom Background Photo
                </h3>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[2.5px] border-dashed border-ink rounded-2xl p-6 text-center cursor-pointer bg-white hover:bg-lemon/30 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-bold">
                    Click to browse wallpaper from your device
                  </p>
                  <p className="text-xs text-ink/60 mt-1">
                    Supports high-resolution PNG, JPG, WebP photos (up to 8MB)
                  </p>
                </div>
              </div>

              {/* Or Direct Image URL */}
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider">
                  Or Paste Wallpaper URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-ink/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://example.com/my-wallpaper.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="doodle-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="doodle-btn bg-bubblegum px-4 py-2 text-xs"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Custom Image Active Status & controls */}
              {isCustomActive && (
                <div className="doodle-card bg-white p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="doodle-chip bg-mint">
                      <Check className="w-3.5 h-3.5" />
                      <span>Custom Wallpaper Active</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ backgroundStyle: DEFAULT_BACKGROUND_ID, customBackgroundUrl: "" })}
                      className="doodle-btn bg-white hover:bg-rose-200 px-2.5 py-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Back to Doodles</span>
                    </button>
                  </div>

                  <div className="h-28 rounded-xl overflow-hidden border-2 border-ink">
                    <img
                      src={settings.customBackgroundUrl}
                      alt="Custom Wallpaper Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <Sliders className="w-4 h-4" />
                    <span>Dimming & Blur</span>
                  </div>

                  {/* Dimming Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink/70">Background Dimming</span>
                      <span className="font-bold">{settings.backgroundDim ?? 65}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="5"
                      value={settings.backgroundDim ?? 65}
                      onChange={(e) => handleDimChange(parseInt(e.target.value))}
                      className="doodle-range"
                      style={{ "--accent": "#b9a2ff", "--fill": `${(((settings.backgroundDim ?? 65) - 10) / 80) * 100}%` } as React.CSSProperties}
                    />
                  </div>

                  {/* Blur Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink/70">Background Blur</span>
                      <span className="font-bold">{settings.backgroundBlur ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      step="2"
                      value={settings.backgroundBlur ?? 0}
                      onChange={(e) => handleBlurChange(parseInt(e.target.value))}
                      className="doodle-range"
                      style={{ "--accent": "#8cc8ff", "--fill": `${((settings.backgroundBlur ?? 0) / 16) * 100}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-dashed border-ink/30 shrink-0">
          <span className="text-xs text-ink/60">
            Changes apply instantly to the dashboard
          </span>
          <button
            type="button"
            onClick={onClose}
            className="doodle-btn bg-mint px-5 py-2 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
