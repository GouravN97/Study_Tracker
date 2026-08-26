export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: "Sans-Serif" | "Serif" | "Monospace" | "Display";
  description: string;
  preview: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  category: "Dark Palette" | "Light Palette" | "Immersive Wallpaper";
  themeMode: "dark" | "light";
  description: string;
  style: {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
  };
  cardStyle?: "dark" | "light" | "glass";
  textColorClass: string;
  navBgClass: string;
  accentColorClass: string;
  previewColor: string;
  thumbnailUrl?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "plus-jakarta",
    name: "Plus Jakarta Sans",
    family: "'Plus Jakarta Sans', sans-serif",
    category: "Sans-Serif",
    description: "Modern, geometric, clean and highly legible",
    preview: "Algorithms & Quantum Systems 12.0h",
  },
  {
    id: "inter",
    name: "Inter",
    family: "'Inter', sans-serif",
    category: "Sans-Serif",
    description: "Universal, crisp, neutral interface typography",
    preview: "Algorithms & Quantum Systems 12.0h",
  },
  {
    id: "outfit",
    name: "Outfit",
    family: "'Outfit', sans-serif",
    category: "Display",
    description: "Contemporary, energetic, premium tech aesthetic",
    preview: "Algorithms & Quantum Systems 12.0h",
  },
  {
    id: "poppins",
    name: "Poppins",
    family: "'Poppins', sans-serif",
    category: "Sans-Serif",
    description: "Friendly, balanced, rounded geometric curves",
    preview: "Algorithms & Quantum Systems 12.0h",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    family: "'Playfair Display', serif",
    category: "Serif",
    description: "Editorial, prestigious academic & classic style",
    preview: "Algorithms & Quantum Systems 12.0h",
  },
  {
    id: "cinzel",
    name: "Cinzel",
    family: "'Cinzel', serif",
    category: "Serif",
    description: "Classical university heritage & collegiate Latin flair",
    preview: "ALGORITHMS & QUANTUM SYSTEMS 12.0H",
  },
  {
    id: "lora",
    name: "Lora",
    family: "'Lora', serif",
    category: "Serif",
    description: "Contemporary literary serif designed for long study",
    preview: "Algorithms & Quantum Systems 12.0h",
  },
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    family: "'JetBrains Mono', monospace",
    category: "Monospace",
    description: "Developer & STEM code editor monospace",
    preview: "Algorithms & Quantum Systems 12.0h",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    family: "'Space Grotesk', sans-serif",
    category: "Display",
    description: "Futuristic engineering & brutalist clarity",
    preview: "Algorithms & Quantum Systems 12.0h",
  },
];

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "slate",
    name: "Midnight Slate",
    category: "Dark Palette",
    themeMode: "dark",
    description: "Deep charcoal slate with subtle indigo undertones",
    style: {
      backgroundColor: "#0f172a",
    },
    textColorClass: "text-slate-100",
    navBgClass: "bg-slate-950/90 border-slate-800",
    accentColorClass: "indigo",
    previewColor: "#0f172a",
  },
  {
    id: "navy",
    name: "Oxford Navy",
    category: "Dark Palette",
    themeMode: "dark",
    description: "Prestigious deep sapphire and dark nautical blue",
    style: {
      backgroundColor: "#060e24",
      backgroundImage: "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(30, 58, 138, 0.45), rgba(6, 14, 36, 1))",
    },
    textColorClass: "text-slate-100",
    navBgClass: "bg-[#040816]/95 border-blue-950",
    accentColorClass: "blue",
    previewColor: "#0a1936",
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    category: "Dark Palette",
    themeMode: "dark",
    description: "Rich dark botanical green for calm deep focus",
    style: {
      backgroundColor: "#031710",
      backgroundImage: "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(6, 78, 59, 0.5), rgba(3, 23, 16, 1))",
    },
    textColorClass: "text-slate-100",
    navBgClass: "bg-[#02110c]/95 border-emerald-950",
    accentColorClass: "emerald",
    previewColor: "#063d2c",
  },
  {
    id: "obsidian",
    name: "Obsidian Violet",
    category: "Dark Palette",
    themeMode: "dark",
    description: "Luxury deep violet and dark obsidian atmosphere",
    style: {
      backgroundColor: "#0f081d",
      backgroundImage: "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(88, 28, 135, 0.45), rgba(15, 8, 29, 1))",
    },
    textColorClass: "text-slate-100",
    navBgClass: "bg-[#090412]/95 border-purple-950",
    accentColorClass: "purple",
    previewColor: "#22113d",
  },
  {
    id: "mocha",
    name: "Espresso Mocha",
    category: "Dark Palette",
    themeMode: "dark",
    description: "Cozy warm dark roasted coffee and cedar tones",
    style: {
      backgroundColor: "#160e0a",
      backgroundImage: "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120, 53, 15, 0.35), rgba(22, 14, 10, 1))",
    },
    textColorClass: "text-amber-50",
    navBgClass: "bg-[#0d0805]/95 border-amber-950",
    accentColorClass: "amber",
    previewColor: "#2a1a12",
  },
  {
    id: "twilight",
    name: "Twilight Gradient",
    category: "Dark Palette",
    themeMode: "dark",
    description: "Smooth twilight gradient blending indigo and rose",
    style: {
      backgroundColor: "#0d0e1f",
      backgroundImage: "linear-gradient(135deg, #0b0f2a 0%, #170d24 50%, #1f0b1a 100%)",
    },
    textColorClass: "text-slate-100",
    navBgClass: "bg-[#080914]/95 border-slate-800",
    accentColorClass: "indigo",
    previewColor: "#170d24",
  },
  {
    id: "light-minimal",
    name: "Clean Light",
    category: "Light Palette",
    themeMode: "light",
    description: "Bright crisp daylight theme with slate borders",
    style: {
      backgroundColor: "#f8fafc",
      backgroundImage: "linear-gradient(180deg, #f1f5f9 0%, #f8fafc 100%)",
    },
    textColorClass: "text-slate-900",
    navBgClass: "bg-slate-900 text-white border-slate-800",
    accentColorClass: "indigo",
    previewColor: "#f1f5f9",
  },
  {
    id: "warm-paper",
    name: "Academic Parchment",
    category: "Light Palette",
    themeMode: "light",
    description: "Gentle eye-friendly warm paper & amber undertones",
    style: {
      backgroundColor: "#faf7f2",
      backgroundImage: "linear-gradient(180deg, #f3ece1 0%, #faf7f2 100%)",
    },
    textColorClass: "text-stone-900",
    navBgClass: "bg-stone-900 text-white border-stone-800",
    accentColorClass: "amber",
    previewColor: "#f3ece1",
  },
  {
    id: "library",
    name: "Grand University Library",
    category: "Immersive Wallpaper",
    themeMode: "dark",
    description: "Majestic historic university study hall & bookshelves",
    style: {
      backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    thumbnailUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=300&q=80",
    textColorClass: "text-slate-100",
    navBgClass: "bg-slate-950/90 backdrop-blur-md border-slate-800",
    accentColorClass: "amber",
    previewColor: "#2c1e13",
  },
  {
    id: "cosmos",
    name: "Starry Cosmos & Nebula",
    category: "Immersive Wallpaper",
    themeMode: "dark",
    description: "Deep space universe for late-night hyper-focus",
    style: {
      backgroundImage: "url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    thumbnailUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80",
    textColorClass: "text-slate-100",
    navBgClass: "bg-slate-950/90 backdrop-blur-md border-slate-800",
    accentColorClass: "indigo",
    previewColor: "#0d102a",
  },
  {
    id: "campus",
    name: "Collegiate Quad & Ivy",
    category: "Immersive Wallpaper",
    themeMode: "dark",
    description: "Iconic university campus grounds & architecture",
    style: {
      backgroundImage: "url('https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1920&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    thumbnailUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=300&q=80",
    textColorClass: "text-slate-100",
    navBgClass: "bg-slate-950/90 backdrop-blur-md border-slate-800",
    accentColorClass: "emerald",
    previewColor: "#172b1d",
  },
  {
    id: "study-sanctuary",
    name: "Study Sanctuary & Plants",
    category: "Immersive Wallpaper",
    themeMode: "dark",
    description: "Minimal modern student study desk and ambient light",
    style: {
      backgroundImage: "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1920&q=80')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80",
    textColorClass: "text-slate-100",
    navBgClass: "bg-slate-950/90 backdrop-blur-md border-slate-800",
    accentColorClass: "sky",
    previewColor: "#121b28",
  },
];
