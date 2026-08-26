export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  bg: string;
  text: string;
  lightBg: string;
  border: string;
  ring: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { 
    id: "indigo", 
    name: "Royal Indigo", 
    hex: "#6366f1", 
    rgb: "99, 102, 241", 
    bg: "bg-indigo-500", 
    text: "text-indigo-600", 
    lightBg: "bg-indigo-50", 
    border: "border-indigo-200", 
    ring: "ring-indigo-500" 
  },
  { 
    id: "blue", 
    name: "Ocean Blue", 
    hex: "#3b82f6", 
    rgb: "59, 130, 246", 
    bg: "bg-blue-500", 
    text: "text-blue-600", 
    lightBg: "bg-blue-50", 
    border: "border-blue-200", 
    ring: "ring-blue-500" 
  },
  { 
    id: "sky", 
    name: "Electric Sky", 
    hex: "#0ea5e9", 
    rgb: "14, 165, 233", 
    bg: "bg-sky-500", 
    text: "text-sky-600", 
    lightBg: "bg-sky-50", 
    border: "border-sky-200", 
    ring: "ring-sky-500" 
  },
  { 
    id: "cyan", 
    name: "Aqua Cyan", 
    hex: "#06b6d4", 
    rgb: "6, 182, 212", 
    bg: "bg-cyan-500", 
    text: "text-cyan-600", 
    lightBg: "bg-cyan-50", 
    border: "border-cyan-200", 
    ring: "ring-cyan-500" 
  },
  { 
    id: "teal", 
    name: "Forest Teal", 
    hex: "#14b8a6", 
    rgb: "20, 184, 166", 
    bg: "bg-teal-500", 
    text: "text-teal-600", 
    lightBg: "bg-teal-50", 
    border: "border-teal-200", 
    ring: "ring-teal-500" 
  },
  { 
    id: "emerald", 
    name: "Emerald Green", 
    hex: "#10b981", 
    rgb: "16, 185, 129", 
    bg: "bg-emerald-500", 
    text: "text-emerald-600", 
    lightBg: "bg-emerald-50", 
    border: "border-emerald-200", 
    ring: "ring-emerald-500" 
  },
  { 
    id: "lime", 
    name: "Sage Lime", 
    hex: "#84cc16", 
    rgb: "132, 204, 22", 
    bg: "bg-lime-500", 
    text: "text-lime-600", 
    lightBg: "bg-lime-50", 
    border: "border-lime-200", 
    ring: "ring-lime-500" 
  },
  { 
    id: "amber", 
    name: "Amber Gold", 
    hex: "#f59e0b", 
    rgb: "245, 158, 11", 
    bg: "bg-amber-500", 
    text: "text-amber-600", 
    lightBg: "bg-amber-50", 
    border: "border-amber-200", 
    ring: "ring-amber-500" 
  },
  { 
    id: "orange", 
    name: "Sunset Orange", 
    hex: "#f97316", 
    rgb: "249, 115, 22", 
    bg: "bg-orange-500", 
    text: "text-orange-600", 
    lightBg: "bg-orange-50", 
    border: "border-orange-200", 
    ring: "ring-orange-500" 
  },
  { 
    id: "rose", 
    name: "Coral Rose", 
    hex: "#f43f5e", 
    rgb: "244, 63, 94", 
    bg: "bg-rose-500", 
    text: "text-rose-600", 
    lightBg: "bg-rose-50", 
    border: "border-rose-200", 
    ring: "ring-rose-500" 
  },
  { 
    id: "red", 
    name: "Crimson Red", 
    hex: "#ef4444", 
    rgb: "239, 68, 68", 
    bg: "bg-red-500", 
    text: "text-red-600", 
    lightBg: "bg-red-50", 
    border: "border-red-200", 
    ring: "ring-red-500" 
  },
  { 
    id: "pink", 
    name: "Berry Pink", 
    hex: "#ec4899", 
    rgb: "236, 72, 153", 
    bg: "bg-pink-500", 
    text: "text-pink-600", 
    lightBg: "bg-pink-50", 
    border: "border-pink-200", 
    ring: "ring-pink-500" 
  },
  { 
    id: "fuchsia", 
    name: "Fuchsia Magenta", 
    hex: "#d946ef", 
    rgb: "217, 70, 239", 
    bg: "bg-fuchsia-500", 
    text: "text-fuchsia-600", 
    lightBg: "bg-fuchsia-50", 
    border: "border-fuchsia-200", 
    ring: "ring-fuchsia-500" 
  },
  { 
    id: "violet", 
    name: "Royal Violet", 
    hex: "#8b5cf6", 
    rgb: "139, 92, 246", 
    bg: "bg-violet-500", 
    text: "text-violet-600", 
    lightBg: "bg-violet-50", 
    border: "border-violet-200", 
    ring: "ring-violet-500" 
  },
  { 
    id: "purple", 
    name: "Deep Purple", 
    hex: "#a855f7", 
    rgb: "168, 85, 247", 
    bg: "bg-purple-500", 
    text: "text-purple-600", 
    lightBg: "bg-purple-50", 
    border: "border-purple-200", 
    ring: "ring-purple-500" 
  },
  { 
    id: "slate", 
    name: "Titanium Slate", 
    hex: "#64748b", 
    rgb: "100, 116, 139", 
    bg: "bg-slate-500", 
    text: "text-slate-600", 
    lightBg: "bg-slate-50", 
    border: "border-slate-200", 
    ring: "ring-slate-500" 
  },
];

export interface ResolvedCourseAccent {
  hex: string;
  rgb: string;
  name: string;
  isCustom: boolean;
  lightBg: string;
  badgeStyle: React.CSSProperties;
  badgeWallpaperStyle: React.CSSProperties;
  barGradient: string;
  buttonStyle: React.CSSProperties;
  subtleButtonStyle: React.CSSProperties;
  sliderAccentStyle: React.CSSProperties;
  borderGlowStyle: React.CSSProperties;
  textStyle: React.CSSProperties;
}

// Convert Hex to RGB string
function hexToRgb(hex: string): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return "99, 102, 241"; // fallback indigo
}

export function getCourseAccent(colorIdOrHex: string = "indigo"): ResolvedCourseAccent {
  const preset = COLOR_OPTIONS.find(
    c => c.id.toLowerCase() === colorIdOrHex.toLowerCase() || c.hex.toLowerCase() === colorIdOrHex.toLowerCase()
  );

  let hex = "#6366f1";
  let rgb = "99, 102, 241";
  let name = "Custom Accent";
  let isCustom = true;

  if (preset) {
    hex = preset.hex;
    rgb = preset.rgb;
    name = preset.name;
    isCustom = false;
  } else if (colorIdOrHex.startsWith("#")) {
    hex = colorIdOrHex;
    rgb = hexToRgb(colorIdOrHex);
    name = colorIdOrHex.toUpperCase();
    isCustom = true;
  }

  return {
    hex,
    rgb,
    name,
    isCustom,
    lightBg: `rgba(${rgb}, 0.12)`,
    badgeStyle: {
      backgroundColor: `rgba(${rgb}, 0.12)`,
      color: hex,
      borderColor: `rgba(${rgb}, 0.3)`,
    },
    badgeWallpaperStyle: {
      backgroundColor: `rgba(${rgb}, 0.28)`,
      color: "#ffffff",
      borderColor: `rgba(${rgb}, 0.65)`,
      boxShadow: `0 0 12px rgba(${rgb}, 0.25)`,
    },
    barGradient: `linear-gradient(90deg, ${hex} 0%, rgba(${rgb}, 0.4) 100%)`,
    buttonStyle: {
      backgroundColor: hex,
      color: "#ffffff",
      boxShadow: `0 2px 10px rgba(${rgb}, 0.35)`,
    },
    subtleButtonStyle: {
      backgroundColor: `rgba(${rgb}, 0.15)`,
      color: hex,
      borderColor: `rgba(${rgb}, 0.35)`,
    },
    sliderAccentStyle: {
      accentColor: hex,
    },
    borderGlowStyle: {
      borderColor: `rgba(${rgb}, 0.6)`,
      boxShadow: `0 0 15px rgba(${rgb}, 0.15)`,
    },
    textStyle: {
      color: hex,
    },
  };
}
