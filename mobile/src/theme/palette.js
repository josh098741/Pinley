// Central design tokens for Pinley's theme system.
//
// The Appearance settings (Profile -> Appearance) store `theme`, `accentColor`
// and `reduceMotion` in Clerk `unsafeMetadata.profilePrefs.appearance`. These
// tokens are the single source of truth that the rest of the app reads from so
// changing the accent or theme updates the whole UI.

export const DEFAULT_APPEARANCE = {
  theme: "system", // "system" | "light" | "dark"
  accentColor: "purple", // key into ACCENTS
  reduceMotion: false,
};

// Each accent expands to a small palette so every surface that references the
// brand color stays in sync (buttons, tab bar, headers, switches, chips…).
export const ACCENTS = {
  purple: {
    key: "purple",
    primary: "#5B3FD6",
    deep: "#4C1D95",
    light: "#A78BFA",
    soft: "#EDE9FE",
    border: "rgba(91,63,214,0.16)",
    tint: "#C4B5FD",
    gradient: ["#A78BFA", "#5B3FD6"],
  },
  blue: {
    key: "blue",
    primary: "#2563EB",
    deep: "#1D4ED8",
    light: "#60A5FA",
    soft: "#DBEAFE",
    border: "rgba(37,99,235,0.16)",
    tint: "#93C5FD",
    gradient: ["#60A5FA", "#2563EB"],
  },
  emerald: {
    key: "emerald",
    primary: "#059669",
    deep: "#047857",
    light: "#34D399",
    soft: "#D1FAE5",
    border: "rgba(5,150,105,0.16)",
    tint: "#6EE7B7",
    gradient: ["#34D399", "#059669"],
  },
  rose: {
    key: "rose",
    primary: "#E11D48",
    deep: "#BE123C",
    light: "#FB7185",
    soft: "#FFE4E6",
    border: "rgba(225,29,72,0.16)",
    tint: "#FDA4AF",
    gradient: ["#FB7185", "#E11D48"],
  },
  amber: {
    key: "amber",
    primary: "#D97706",
    deep: "#B45309",
    light: "#FBBF24",
    soft: "#FEF3C7",
    border: "rgba(217,119,6,0.16)",
    tint: "#FCD34D",
    gradient: ["#FBBF24", "#D97706"],
  },
};

// Semantic colors for each mode. Components reference these instead of raw
// hardcoded Tailwind/hex values so dark mode "just works".
export const LIGHT_COLORS = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  text: "#0F172A",
  textMuted: "#64748B",
  textFaint: "#94A3B8",
  border: "#E2E8F0",
  divider: "#E2E8F0",
  soft: "#F1F5F9",
  onAccent: "#FFFFFF",
  statusBar: "dark-content",
};

export const DARK_COLORS = {
  bg: "#0B0B12",
  surface: "#15151F",
  card: "#1B1B27",
  text: "#F2F2F7",
  textMuted: "#9CA3AF",
  textFaint: "#6B7280",
  border: "#2A2A38",
  divider: "#26262F",
  soft: "#1E1E2A",
  onAccent: "#FFFFFF",
  statusBar: "light-content",
};

// Build the `clay` palette used by components/clay.js. Accent-dependent keys
// come from the chosen accent; mode-dependent keys flip for dark mode.
export function buildClay(accent, isDark) {
  return {
    isDark,
    bg: isDark ? "#0B0B12" : "#F7F5FF",
    card: isDark ? "#1B1B27" : "#FFFFFF",
    primary: accent.primary,
    primaryDeep: accent.deep,
    primarySoft: accent.soft,
    primaryBorder: accent.border,
    purple: accent.primary, // legacy alias used by some screens
    ink: isDark ? "#F2F2F7" : "#1E1B2E",
    muted: isDark ? "#9CA3AF" : "#6C7280",
    faint: isDark ? "#6B7280" : "#A5A3B8",
    line: isDark ? "#2A2A38" : "#EAE7F5",
    success: "#059669",
    successSoft: "#ECFDF5",
    danger: "#E11D48",
    dangerSoft: "#FFF1F2",
    warning: "#B45309",
  };
}

// Convert a #RRGGBB / #RGB hex into an rgba() string with the given alpha.
export function withAlpha(hex, alpha) {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
