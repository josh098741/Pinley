import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import {
  ACCENTS,
  LIGHT_COLORS,
  DARK_COLORS,
  DEFAULT_APPEARANCE,
  buildClay,
} from "./palette";

const ThemeContext = createContext(null);

const PREFS_KEY = "profilePrefs";

export function ThemeProvider({ children }) {
  const { user } = useUser();
  const scheme = useColorScheme();

  const appearance = useMemo(() => {
    const stored = user?.unsafeMetadata?.[PREFS_KEY]?.appearance;
    return { ...DEFAULT_APPEARANCE, ...(stored || {}) };
  }, [user?.unsafeMetadata]);

  const accentKey = ACCENTS[appearance.accentColor] ? appearance.accentColor : "purple";
  const accent = ACCENTS[accentKey];

  const isDark =
    appearance.theme === "dark" ||
    (appearance.theme === "system" && scheme === "dark");

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const clayPalette = useMemo(() => buildClay(accent, isDark), [accent, isDark]);

  const saveAppearance = useCallback(
    async (patch) => {
      if (!user) return false;
      try {
        const current = user.unsafeMetadata?.[PREFS_KEY]?.appearance || {};
        const merged = { ...DEFAULT_APPEARANCE, ...current, ...patch };
        const profilePrefs = {
          ...(user.unsafeMetadata?.[PREFS_KEY] || {}),
          appearance: merged,
        };
        await user.update({
          unsafeMetadata: { ...user.unsafeMetadata, [PREFS_KEY]: profilePrefs },
        });
        return true;
      } catch (err) {
        console.error("Failed to save appearance:", err);
        return false;
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      appearance,
      theme: appearance.theme,
      accentKey,
      accent,
      isDark,
      colors,
      clay: clayPalette,
      reduceMotion: !!appearance.reduceMotion,
      saveAppearance,
    }),
    [appearance, accentKey, accent, isDark, colors, clayPalette, saveAppearance]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

// Convenience hook returning the theme-aware `clay` palette.
export function useClay() {
  return useTheme().clay;
}
