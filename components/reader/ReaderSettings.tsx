"use client";

import { useState } from "react";
import { useReader } from "./ReaderWrapper";
import type { ReaderFont, ReaderTheme, ReaderWidth } from "@/lib/reader-settings";

const THEMES: { value: ReaderTheme; label: string; bg: string; fg: string }[] = [
  { value: "dark", label: "Dark", bg: "#0b0b0f", fg: "#d1d5db" },
  { value: "light", label: "Light", bg: "#f9fafb", fg: "#1f2937" },
  { value: "sepia", label: "Sepia", bg: "#f5efe0", fg: "#3d2b1f" },
];

const WIDTHS: { value: ReaderWidth; label: string }[] = [
  { value: "narrow", label: "Narrow" },
  { value: "medium", label: "Medium" },
  { value: "wide", label: "Wide" },
  { value: "full", label: "Full" },
];

const FONTS: { value: ReaderFont; label: string; style: string }[] = [
  { value: "sans", label: "Sans", style: "system-ui, sans-serif" },
  { value: "serif", label: "Serif", style: "Georgia, serif" },
  { value: "mono", label: "Mono", style: "'Courier New', monospace" },
];

export default function ReaderSettings() {
  const { prefs, updatePref } = useReader();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Settings trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Reader settings"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 200,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
        }}
      >
        Aa
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 190,
            }}
            onClick={() => setOpen(false)}
          />

          <div
            style={{
              position: "fixed",
              bottom: "5rem",
              right: "1.5rem",
              zIndex: 200,
              width: "280px",
              borderRadius: "16px",
              padding: "1.25rem",
              background: "rgba(19,19,26,0.97)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}
          >
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>
              Reader Settings
            </p>

            {/* Theme */}
            <Section label="Theme">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => updatePref("theme", t.value)}
                    style={{
                      flex: 1,
                      padding: "0.4rem 0",
                      borderRadius: "8px",
                      border: prefs.theme === t.value
                        ? "2px solid var(--accent)"
                        : "2px solid transparent",
                      background: t.bg,
                      color: t.fg,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Font */}
            <Section label="Font">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {FONTS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => updatePref("font", f.value)}
                    style={{
                      flex: 1,
                      padding: "0.4rem 0",
                      borderRadius: "8px",
                      border: prefs.font === f.value
                        ? "2px solid var(--accent)"
                        : "2px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: prefs.font === f.value ? "#fff" : "#9ca3af",
                      fontSize: "0.75rem",
                      fontFamily: f.style,
                      cursor: "pointer",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Font size */}
            <Section label={`Font Size — ${prefs.fontSize}px`}>
              <input
                type="range"
                min={14}
                max={26}
                step={1}
                value={prefs.fontSize}
                onChange={(e) => updatePref("fontSize", Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: "0.7rem" }}>
                <span>14</span><span>26</span>
              </div>
            </Section>

            {/* Line height */}
            <Section label={`Line Height — ${prefs.lineHeight.toFixed(1)}`}>
              <input
                type="range"
                min={1.4}
                max={2.4}
                step={0.1}
                value={prefs.lineHeight}
                onChange={(e) => updatePref("lineHeight", Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: "0.7rem" }}>
                <span>1.4</span><span>2.4</span>
              </div>
            </Section>

            {/* Width */}
            <Section label="Reading Width">
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {WIDTHS.map((w) => (
                  <button
                    key={w.value}
                    onClick={() => updatePref("width", w.value)}
                    style={{
                      flex: 1,
                      padding: "0.4rem 0",
                      borderRadius: "8px",
                      border: prefs.width === w.value
                        ? "2px solid var(--accent)"
                        : "2px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: prefs.width === w.value ? "#fff" : "#9ca3af",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                    }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Keyboard hint */}
            <p style={{ color: "#6b7280", fontSize: "0.7rem", margin: 0 }}>
              ← / → arrow keys to navigate chapters
            </p>
          </div>
        </>
      )}
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <span style={{ color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}
