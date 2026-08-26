import React, { useState, useRef } from "react";
import { 
  X, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Check, 
  Sliders, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  Sun, 
  Moon,
  Trash2,
  Eye
} from "lucide-react";
import { UserSettings } from "../types";
import { FONT_OPTIONS, BACKGROUND_PRESETS, FontOption, BackgroundPreset } from "../data/themes";

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
  const [activeTab, setActiveTab] = useState<"fonts" | "backgrounds" | "custom-bg">("backgrounds");
  const [customUrlInput, setCustomUrlInput] = useState(settings.customBackgroundUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentFont = FONT_OPTIONS.find(f => f.id === (settings.fontFamily || "plus-jakarta")) || FONT_OPTIONS[0];
  const currentBg = BACKGROUND_PRESETS.find(b => b.id === (settings.backgroundStyle || "slate")) || BACKGROUND_PRESETS[0];

  const handleFontSelect = (fontId: string) => {
    onUpdateSettings({ fontFamily: fontId });
  };

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Fonts & Background Theme
              </h2>
              <p className="text-xs text-slate-500">
                Customize your typography and dashboard backdrop
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/40 shrink-0">
          <button
            onClick={() => setActiveTab("backgrounds")}
            className={`flex items-center space-x-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "backgrounds"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Canvas Backgrounds</span>
          </button>
          <button
            onClick={() => setActiveTab("fonts")}
            className={`flex items-center space-x-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "fonts"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Fonts & Typography</span>
          </button>
          <button
            onClick={() => setActiveTab("custom-bg")}
            className={`flex items-center space-x-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "custom-bg"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Custom Wallpaper / Image</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BACKGROUND THEMES */}
          {activeTab === "backgrounds" && (
            <div className="space-y-6">
              {/* Active Selection Readout */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg border border-slate-300 shadow-xs flex items-center justify-center text-white"
                    style={{
                      backgroundColor: currentBg.previewColor,
                      backgroundImage: currentBg.style.backgroundImage,
                      backgroundSize: "cover",
                    }}
                  >
                    <Sparkles className="w-4 h-4 drop-shadow-xs" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      Active: {currentBg.name}
                    </span>
                    <p className="text-[11px] text-slate-500">{currentBg.description}</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {currentBg.category}
                </span>
              </div>

              {/* Dark Palettes Section */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Dark & Midnight Canvas Themes</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BACKGROUND_PRESETS.filter(b => b.category === "Dark Palette").map((bg) => {
                    const isSelected = settings.backgroundStyle === bg.id || (!settings.backgroundStyle && bg.id === "slate");
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => handleBgSelect(bg.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-between h-24 ${
                          isSelected
                            ? "ring-2 ring-indigo-600 border-indigo-600 shadow-md shadow-indigo-500/10"
                            : "border-slate-200 hover:border-slate-400 hover:shadow-xs"
                        }`}
                        style={{
                          backgroundColor: bg.previewColor,
                          backgroundImage: bg.style.backgroundImage,
                        }}
                      >
                        <div className="flex items-center justify-between w-full relative z-10">
                          <span className="text-xs font-bold text-white drop-shadow-xs">
                            {bg.name}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-300 line-clamp-1 relative z-10 drop-shadow-xs">
                          {bg.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Light Palettes Section */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light & Paper Canvas Themes</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {BACKGROUND_PRESETS.filter(b => b.category === "Light Palette").map((bg) => {
                    const isSelected = settings.backgroundStyle === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => handleBgSelect(bg.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-between h-20 ${
                          isSelected
                            ? "ring-2 ring-indigo-600 border-indigo-600 shadow-md shadow-indigo-500/10"
                            : "border-slate-200 hover:border-slate-400 hover:shadow-xs"
                        }`}
                        style={{
                          backgroundColor: bg.previewColor,
                          backgroundImage: bg.style.backgroundImage,
                        }}
                      >
                        <div className="flex items-center justify-between w-full relative z-10">
                          <span className="text-xs font-bold text-slate-900">
                            {bg.name}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-600 line-clamp-1 relative z-10">
                          {bg.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Immersive Wallpapers Section */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>University & Study Wallpapers</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {BACKGROUND_PRESETS.filter(b => b.category === "Immersive Wallpaper").map((bg) => {
                    const isSelected = settings.backgroundStyle === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => handleBgSelect(bg.id)}
                        className={`group relative rounded-xl overflow-hidden h-24 border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-indigo-600 border-indigo-600 shadow-md"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <img
                          src={bg.thumbnailUrl || ""}
                          alt={bg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-between p-2.5">
                          <div className="flex justify-end">
                            {isSelected && (
                              <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white leading-tight block">
                              {bg.name}
                            </span>
                            <span className="text-[10px] text-slate-300 leading-tight line-clamp-1">
                              {bg.description}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wallpaper Dim & Blur Controls */}
              <div className="p-4 bg-slate-900 rounded-xl space-y-4 text-white border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Backdrop Dimming & Focus Controls</span>
                  </span>
                  <span className="text-xs text-slate-400">Live adjustment</span>
                </div>

                {/* Dimming Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Background Dimming</span>
                    <span className="font-mono text-indigo-300 font-bold">{settings.backgroundDim ?? 65}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={settings.backgroundDim ?? 65}
                    onChange={(e) => handleDimChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Bright (10%)</span>
                    <span>Standard (65%)</span>
                    <span>Maximum Contrast (90%)</span>
                  </div>
                </div>

                {/* Blur Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Background Blur</span>
                    <span className="font-mono text-indigo-300 font-bold">{settings.backgroundBlur ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="2"
                    value={settings.backgroundBlur ?? 0}
                    onChange={(e) => handleBlurChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Sharp (0px)</span>
                    <span>Subtle (6px)</span>
                    <span>Soft Focus (16px)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FONTS & TYPOGRAPHY */}
          {activeTab === "fonts" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                    Ag
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-950">
                      Active Typography: {currentFont.name}
                    </span>
                    <p className="text-[11px] text-indigo-700">{currentFont.description}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {currentFont.category}
                </span>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Choose Primary Font Family
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  {FONT_OPTIONS.map((font) => {
                    const isSelected = (settings.fontFamily || "plus-jakarta") === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => handleFontSelect(font.id)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? "bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors"
                              style={{ fontFamily: font.family }}
                            >
                              {font.name}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {font.category}
                            </span>
                          </div>

                          <p 
                            className="text-sm text-slate-600 font-medium"
                            style={{ fontFamily: font.family }}
                          >
                            {font.preview}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {font.description}
                          </p>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-slate-300 group-hover:border-indigo-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM WALLPAPER */}
          {activeTab === "custom-bg" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-indigo-600" />
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse wallpaper from your device
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports high-resolution PNG, JPG, WebP photos (up to 8MB)
                  </p>
                </div>
              </div>

              {/* Or Direct Image URL */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Or Paste Wallpaper URL
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="https://example.com/my-wallpaper.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Custom Image Active Status */}
              {settings.backgroundStyle === "custom" && settings.customBackgroundUrl && (
                <div className="p-4 bg-slate-900 rounded-xl space-y-3 text-white border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                      <Check className="w-4 h-4" />
                      <span>Custom Wallpaper Currently Active</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ backgroundStyle: "slate", customBackgroundUrl: "" })}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset to Default</span>
                    </button>
                  </div>

                  <div className="h-28 rounded-lg overflow-hidden relative border border-slate-700">
                    <img
                      src={settings.customBackgroundUrl}
                      alt="Custom Wallpaper Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <span className="text-xs text-slate-500">
            Changes apply instantly to the dashboard
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
