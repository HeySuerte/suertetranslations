"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  DEFAULT_PREFS,
  loadPrefs,
  savePrefs,
  THEME_STYLES,
  WIDTH_MAP,
  type ReaderPreferences,
} from "@/lib/reader-settings";

interface ReaderContextValue {
  prefs: ReaderPreferences;
  setPrefs: (p: ReaderPreferences) => void;
  updatePref: <K extends keyof ReaderPreferences>(key: K, value: ReaderPreferences[K]) => void;
  scrollProgress: number;
}

const ReaderContext = createContext<ReaderContextValue>({
  prefs: DEFAULT_PREFS,
  setPrefs: () => {},
  updatePref: () => {},
  scrollProgress: 0,
});

export function useReader() {
  return useContext(ReaderContext);
}

interface ReaderWrapperProps {
  children: React.ReactNode;
  novelSlug: string;
  currentChapter: number;
  prevChapter: number | null;
  nextChapter: number | null;
}

export default function ReaderWrapper({
  children,
  novelSlug,
  currentChapter,
  prevChapter,
  nextChapter,
}: ReaderWrapperProps) {
  const [prefs, setPrefsState] = useState<ReaderPreferences>(DEFAULT_PREFS);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPrefsState(loadPrefs());
    setMounted(true);
  }, []);

  const setPrefs = useCallback((p: ReaderPreferences) => {
    setPrefsState(p);
    savePrefs(p);
  }, []);

  const updatePref = useCallback(
    <K extends keyof ReaderPreferences>(key: K, value: ReaderPreferences[K]) => {
      setPrefsState((prev) => {
        const next = { ...prev, [key]: value };
        savePrefs(next);
        return next;
      });
    },
    []
  );

  // Scroll progress
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setScrollProgress(total > 0 ? scrolled / total : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as Element)?.tagName)) return;
      if (e.key === "ArrowLeft" && prevChapter !== null) {
        window.location.href = `/read/${novelSlug}/${prevChapter}`;
      }
      if (e.key === "ArrowRight" && nextChapter !== null) {
        window.location.href = `/read/${novelSlug}/${nextChapter}`;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [novelSlug, prevChapter, nextChapter]);

  const themeStyle = THEME_STYLES[prefs.theme];
  const fontMap: Record<string, string> = {
    sans: "var(--font-geist-sans), system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "var(--font-geist-mono), 'Courier New', monospace",
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0b0f" }}>
        {children}
      </div>
    );
  }

  return (
    <ReaderContext.Provider value={{ prefs, setPrefs, updatePref, scrollProgress }}>
      <div
        style={{
          minHeight: "100vh",
          ...themeStyle,
          fontFamily: fontMap[prefs.font],
          transition: "background 0.2s, color 0.2s",
        }}
      >
        {/* Scroll progress bar */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: `${scrollProgress * 100}%`,
            height: "3px",
            background: "var(--accent)",
            zIndex: 100,
            transition: "width 0.1s",
          }}
        />

        {/* Content with dynamic width */}
        <div
          style={{
            maxWidth: WIDTH_MAP[prefs.width],
            margin: "0 auto",
            padding: "2.5rem 1.5rem",
          }}
        >
          <div
            style={{
              fontSize: `${prefs.fontSize}px`,
              lineHeight: prefs.lineHeight,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </ReaderContext.Provider>
  );
}
