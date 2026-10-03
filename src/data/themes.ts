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
  category: "Doodle Light" | "Doodle Dark";
  themeMode: "dark" | "light";
  description: string;
  style: {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
  };
  previewColor: string;
  /** Pop colors used by the doodles, shown as swatches in the theme picker */
  swatches: string[];
}

export const PIXEL_FONT_FAMILY = "'Pixelify Sans', ui-sans-serif, system-ui, sans-serif";

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "pixelify-sans",
    name: "Pixelify Sans",
    family: PIXEL_FONT_FAMILY,
    category: "Display",
    description: "Chunky, playful pixel lettering",
    preview: "Algorithms & Quantum Systems 12.0h",
  },
];

interface DoodlePalette {
  /** Stroke color of the doodle line work */
  ink: string;
  inkOpacity: number;
  /** Fill colors for stars, hearts, clouds etc. */
  fills: string[];
  fillOpacity: number;
  /** Color of the dotted notebook grid behind the doodles */
  dots: string;
}

const DOODLE_TILE_SIZE = 280;

/**
 * Builds a seamless, hand-drawn style doodle tile (stars, hearts, spirals, pencils, clouds...)
 * as an SVG data URI, layered over a dotted notebook grid.
 */
function buildDoodleBackground(p: DoodlePalette): Pick<BackgroundPreset["style"], "backgroundImage" | "backgroundSize"> {
  const fill = (i: number) => `fill='${p.fills[i % p.fills.length]}' fill-opacity='${p.fillOpacity}'`;
  const solidInk = `fill='${p.ink}' fill-opacity='${p.inkOpacity}' stroke='none'`;

  const doodles = [
    // Star
    `<path transform='translate(34 38) rotate(-12)' ${fill(0)} d='M0,-13 L3.8,-4.3 L13,-4 L6,2.2 L8.2,12 L0,6.8 L-8.2,12 L-6,2.2 L-13,-4 L-3.8,-4.3 Z'/>`,
    // Squiggle
    `<path transform='translate(122 32)' d='M-28,0 q7,-11 14,0 t14,0 t14,0 t14,0'/>`,
    // Heart
    `<path transform='translate(226 46) rotate(10) scale(1.3)' ${fill(1)} d='M0,6 C-7,0 -13,-5 -10,-10 C-7,-15 -1,-13 0,-8 C1,-13 7,-15 10,-10 C13,-5 7,0 0,6 Z'/>`,
    // Plus signs
    `<path transform='translate(88 84) rotate(8)' d='M-6,0 h12 M0,-6 v12'/>`,
    `<path transform='translate(178 74) rotate(-6)' d='M-5,0 h10 M0,-5 v10'/>`,
    // Spiral
    `<path transform='translate(58 132)' d='M0,0 c1,-4 6,-3 6,1 c0,6 -8,7 -11,2 c-4,-7 2,-14 10,-13 c10,1 13,12 7,19 c-6,8 -20,6 -23,-3'/>`,
    // Sparkle
    `<path transform='translate(128 122) rotate(12)' ${fill(1)} d='M0,-10 Q1.2,-1.2 10,0 Q1.2,1.2 0,10 Q-1.2,1.2 -10,0 Q-1.2,-1.2 0,-10 Z'/>`,
    // Cloud
    `<path transform='translate(176 128)' ${fill(2)} d='M-17,8 C-27,8 -27,-5 -16,-5 C-15,-15 -2,-17 2,-9 C7,-15 19,-12 17,-3 C27,-2 26,8 16,8 Z'/>`,
    // Lightning bolt
    `<path transform='translate(250 140) rotate(8)' ${fill(0)} d='M3,-15 L-8,2 L0,2 L-4,15 L9,-3 L1,-3 Z'/>`,
    // Little circles
    `<circle cx='150' cy='176' r='4'/>`,
    `<circle cx='20' cy='176' r='3'/>`,
    `<circle cx='262' cy='84' r='3'/>`,
    // Pencil
    `<g transform='translate(116 214) rotate(-28)'><path ${fill(3)} d='M-24,-6 h32 l11,6 l-11,6 h-32 z'/><path d='M8,-6 v12 M-18,-6 v12'/><path ${solidInk} d='M15,-2.2 L19,0 L15,2.2 Z'/></g>`,
    // Open book
    `<path transform='translate(42 228) rotate(-6)' ${fill(2)} d='M-15,-10 q7.5,-4 15,1 q7.5,-5 15,-1 v21 q-7.5,-4 -15,1 q-7.5,-5 -15,-1 z M0,-9 v21'/>`,
    // Smiley
    `<g transform='translate(226 224) rotate(-8)'><circle r='13' ${fill(0)}/><circle cx='-4.5' cy='-3' r='1.7' ${solidInk}/><circle cx='4.5' cy='-3' r='1.7' ${solidInk}/><path d='M-6,3 q6,6 12,0'/></g>`,
    // Zigzag
    `<path transform='translate(176 256)' d='M-18,0 l6,-6 l6,6 l6,-6 l6,6 l6,-6'/>`,
    // Tiny star
    `<path transform='translate(92 262) rotate(18) scale(0.6)' ${fill(1)} d='M0,-13 L3.8,-4.3 L13,-4 L6,2.2 L8.2,12 L0,6.8 L-8.2,12 L-6,2.2 L-13,-4 L-3.8,-4.3 Z'/>`,
  ].join("");

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${DOODLE_TILE_SIZE}' height='${DOODLE_TILE_SIZE}' viewBox='0 0 ${DOODLE_TILE_SIZE} ${DOODLE_TILE_SIZE}'>` +
    `<g fill='none' stroke='${p.ink}' stroke-opacity='${p.inkOpacity}' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'>` +
    doodles +
    `</g></svg>`;

  return {
    backgroundImage: [
      `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
      `radial-gradient(circle, ${p.dots} 1.3px, transparent 1.6px)`,
    ].join(", "),
    backgroundSize: `${DOODLE_TILE_SIZE}px ${DOODLE_TILE_SIZE}px, 22px 22px`,
  };
}

function doodlePreset(
  preset: Omit<BackgroundPreset, "style" | "swatches">,
  palette: DoodlePalette
): BackgroundPreset {
  return {
    ...preset,
    swatches: palette.fills,
    style: {
      backgroundColor: preset.previewColor,
      ...buildDoodleBackground(palette),
      backgroundRepeat: "repeat",
      backgroundPosition: "0 0",
    },
  };
}

export const DEFAULT_BACKGROUND_ID = "doodle-notebook";

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  doodlePreset(
    {
      id: "doodle-notebook",
      name: "Doodle Notebook",
      category: "Doodle Light",
      themeMode: "light",
      description: "Cream notebook paper covered in margin doodles",
      previewColor: "#fff8e8",
    },
    {
      ink: "#3b2f5c",
      inkOpacity: 0.32,
      fills: ["#ffd84d", "#ff8fb8", "#8fd3ff", "#9be7c4"],
      fillOpacity: 0.55,
      dots: "rgba(59, 47, 92, 0.12)",
    }
  ),
  doodlePreset(
    {
      id: "bubblegum",
      name: "Bubblegum Pop",
      category: "Doodle Light",
      themeMode: "light",
      description: "Sweet pink paper with candy-colored scribbles",
      previewColor: "#ffe4ef",
    },
    {
      ink: "#c2306b",
      inkOpacity: 0.3,
      fills: ["#fff07a", "#ff9cc6", "#a8e0ff", "#c9b6ff"],
      fillOpacity: 0.65,
      dots: "rgba(194, 48, 107, 0.12)",
    }
  ),
  doodlePreset(
    {
      id: "minty",
      name: "Minty Fresh",
      category: "Doodle Light",
      themeMode: "light",
      description: "Cool mint green with sunny little doodles",
      previewColor: "#e2f8ef",
    },
    {
      ink: "#17775a",
      inkOpacity: 0.3,
      fills: ["#ffe16b", "#ffb3c7", "#9fe3cf", "#b4d8ff"],
      fillOpacity: 0.65,
      dots: "rgba(23, 119, 90, 0.12)",
    }
  ),
  doodlePreset(
    {
      id: "sky-scribbles",
      name: "Sky Scribbles",
      category: "Doodle Light",
      themeMode: "light",
      description: "Daydreamy blue sky full of clouds and stars",
      previewColor: "#e3f0ff",
    },
    {
      ink: "#2f5fc4",
      inkOpacity: 0.3,
      fills: ["#ffe36e", "#ffb0c8", "#ffffff", "#cbbcff"],
      fillOpacity: 0.7,
      dots: "rgba(47, 95, 196, 0.12)",
    }
  ),
  doodlePreset(
    {
      id: "lemonade",
      name: "Lemonade",
      category: "Doodle Light",
      themeMode: "light",
      description: "Bright sunshine yellow with zesty sketches",
      previewColor: "#fff6c7",
    },
    {
      ink: "#a36400",
      inkOpacity: 0.32,
      fills: ["#ffb13d", "#ff9fb2", "#9fe0ff", "#a6ecc4"],
      fillOpacity: 0.6,
      dots: "rgba(163, 100, 0, 0.12)",
    }
  ),
  doodlePreset(
    {
      id: "grape-soda",
      name: "Grape Soda",
      category: "Doodle Light",
      themeMode: "light",
      description: "Fizzy lavender with bubbly purple doodles",
      previewColor: "#efe7ff",
    },
    {
      ink: "#5b3fc4",
      inkOpacity: 0.3,
      fills: ["#ffe36e", "#ff9cc6", "#9fe3cf", "#c3b0ff"],
      fillOpacity: 0.65,
      dots: "rgba(91, 63, 196, 0.12)",
    }
  ),
  doodlePreset(
    {
      id: "chalkboard",
      name: "Chalkboard",
      category: "Doodle Dark",
      themeMode: "dark",
      description: "Classroom green board with chalky sketches",
      previewColor: "#264034",
    },
    {
      ink: "#f3f1e7",
      inkOpacity: 0.38,
      fills: ["#fff3a3", "#ffc1d6", "#bfe8ff", "#c9f2d9"],
      fillOpacity: 0.22,
      dots: "rgba(243, 241, 231, 0.08)",
    }
  ),
  doodlePreset(
    {
      id: "midnight-doodles",
      name: "Midnight Doodles",
      category: "Doodle Dark",
      themeMode: "dark",
      description: "Late-night study vibes with neon scribbles",
      previewColor: "#1d1a3a",
    },
    {
      ink: "#9ee7ff",
      inkOpacity: 0.36,
      fills: ["#ffe36e", "#ff7eb6", "#7ef0d0", "#b49cff"],
      fillOpacity: 0.32,
      dots: "rgba(158, 231, 255, 0.08)",
    }
  ),
];

export function resolveBackgroundPreset(id?: string): BackgroundPreset {
  return BACKGROUND_PRESETS.find(b => b.id === id) || BACKGROUND_PRESETS[0];
}
