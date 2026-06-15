export type ReaderTheme = "dark" | "light" | "sepia";
export type ReaderWidth = "narrow" | "medium" | "wide" | "full";
export type ReaderFont = "sans" | "serif" | "mono";

export interface ReaderPreferences {
  fontSize: number;      // px, 14–26
  lineHeight: number;    // 1.4–2.4
  width: ReaderWidth;
  theme: ReaderTheme;
  font: ReaderFont;
}

export const DEFAULT_PREFS: ReaderPreferences = {
  fontSize: 18,
  lineHeight: 1.9,
  width: "medium",
  theme: "dark",
  font: "sans",
};

const STORAGE_KEY = "reader-prefs";

export function loadPrefs(): ReaderPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: ReaderPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export const WIDTH_MAP: Record<ReaderWidth, string> = {
  narrow: "480px",
  medium: "680px",
  wide: "860px",
  full: "100%",
};

export const THEME_STYLES: Record<ReaderTheme, React.CSSProperties> = {
  dark: {
    background: "#0b0b0f",
    color: "#d1d5db",
  },
  light: {
    background: "#f9fafb",
    color: "#1f2937",
  },
  sepia: {
    background: "#f5efe0",
    color: "#3d2b1f",
  },
};
