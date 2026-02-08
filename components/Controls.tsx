"use client";

import { useState, useRef, useEffect } from "react";
import { PRESETS } from "@/lib/presets";
import type { KitName } from "@/lib/audio";
import {
  Play, Square, Minus, Plus, ChevronDown,
  Dice5, Trash2, Link, Download, ZoomIn, ZoomOut,
} from "lucide-react";
import { BpmControl } from "./BpmControl";

interface ControlsProps {
  bpm: number;
  setBpm: (v: number) => void;
  swing: number;
  setSwing: (v: number) => void;
  kit: KitName;
  setKit: (k: KitName) => void;
  playing: boolean;
  togglePlay: () => void;
  clearAll: () => void;
  randomize: () => void;
  shareURL: () => void;
  handleExport: () => void;
  loadPreset: (idx: number) => void;
  stepCount: number;
  onAddBar: () => void;
  onRemoveBar: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const kits: KitName[] = ["808", "acoustic", "electronic", "lofi", "industrial", "minimal"];

/* Shared styles as objects to avoid Tailwind class conflicts */
const section: React.CSSProperties = {
  height: 40,
  display: "flex",
  alignItems: "center",
  borderRight: "1px solid rgba(255,255,255,0.08)",
};

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#888",
  cursor: "pointer",
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const actionBtn: React.CSSProperties = {
  height: 40,
  padding: "0 16px",
  background: "none",
  border: "none",
  borderLeft: "1px solid rgba(255,255,255,0.08)",
  color: "#888",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: "uppercase" as const,
  whiteSpace: "nowrap" as const,
  fontFamily: "var(--font-mono)",
};

const mobileActionBtn: React.CSSProperties = {
  ...actionBtn,
  padding: "0 8px",
  borderLeft: "none",
  gap: 0,
};

const label: React.CSSProperties = {
  fontSize: 9,
  color: "#666",
  letterSpacing: 2,
  fontFamily: "var(--font-mono)",
};

export function Controls({
  bpm, setBpm, swing, setSwing, kit, setKit,
  playing, togglePlay, clearAll, randomize,
  shareURL, handleExport, loadPreset,
  stepCount, onAddBar, onRemoveBar,
  zoom, onZoomIn, onZoomOut,
}: ControlsProps) {
  const [presetsOpen, setPresetsOpen] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setPresetsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const bars = stepCount / 4;

  const cycleKit = () => {
    const idx = kits.indexOf(kit);
    setKit(kits[(idx + 1) % kits.length]);
  };

  const mobileToolbar = (
      <div className="md:hidden">
      <div style={{
        width: "100%",
        background: "var(--surface)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 50,
        fontFamily: "var(--font-mono)",
      }}>
        {/* Row 1: Play, BPM, Kit */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={togglePlay}
            style={{
              ...section,
              width: 64,
              justifyContent: "center",
              gap: 4,
              border: "none",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              background: playing ? "var(--kick)" : "rgba(255,255,255,0.04)",
              color: "#fff",
            }}
          >
            {playing ? <><Square size={10} /> STOP</> : <><Play size={10} /> PLAY</>}
          </button>

          <BpmControl bpm={bpm} setBpm={setBpm} />

          <button
            onClick={cycleKit}
            style={{
              ...section,
              padding: "0 10px",
              border: "none",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              background: "var(--tom)",
              color: "#fff",
              gap: 4,
            }}
          >
            {kit}
          </button>

          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 4, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", fontFamily: "var(--font-display)", paddingRight: 12 }}>
            BEATURL
          </span>
        </div>

        {/* Row 2: All actions as icon-only */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap", overflowX: "auto" }}>
          <button onClick={randomize} style={mobileActionBtn} title="Randomize"><Dice5 size={13} /></button>
          <button onClick={clearAll} style={mobileActionBtn} title="Clear"><Trash2 size={13} /></button>
          <button onClick={shareURL} style={{ ...mobileActionBtn, color: "var(--hihat)" }} title="Share"><Link size={13} /></button>
          <button onClick={handleExport} style={{ ...mobileActionBtn, color: "var(--clap)" }} title="Export WAV"><Download size={13} /></button>

          {/* Presets */}
          <div ref={presetsRef} style={{ position: "relative", height: 40 }}>
            <button onClick={() => setPresetsOpen(!presetsOpen)} style={mobileActionBtn} title="Presets">
              <ChevronDown size={13} />
            </button>
            {presetsOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "var(--surface)",
                border: "1px solid rgba(255,255,255,0.08)",
                minWidth: 180,
                zIndex: 50,
              }}>
                {PRESETS.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => { loadPreset(i); setPresetsOpen(false); }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: 10,
                      letterSpacing: 1,
                      color: "var(--text)",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

          {/* Bars */}
          <button onClick={onRemoveBar} style={{ ...mobileActionBtn, opacity: stepCount <= 4 ? 0.3 : 1 }} disabled={stepCount <= 4} title="Remove Bar"><Minus size={11} /></button>
          <span style={{ fontSize: 8, color: "var(--perc)", whiteSpace: "nowrap" }}>{bars}B</span>
          <button onClick={onAddBar} style={{ ...mobileActionBtn, opacity: stepCount >= 256 ? 0.3 : 1 }} disabled={stepCount >= 256} title="Add Bar"><Plus size={11} /></button>

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

          {/* Zoom */}
          <button onClick={onZoomOut} style={mobileActionBtn} title="Zoom Out"><ZoomOut size={11} /></button>
          <span style={{ fontSize: 8, color: "#666", whiteSpace: "nowrap" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={onZoomIn} style={mobileActionBtn} title="Zoom In"><ZoomIn size={11} /></button>
        </div>
      </div>
      </div>
    );

  const desktopToolbar = (
    <div className="hidden md:block">
    <div style={{
      width: "100%",
      background: "var(--surface)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      position: "relative",
      zIndex: 50,
      fontFamily: "var(--font-mono)",
    }}>
      {/* Logo */}
      <div style={{ ...section, padding: "0 16px" }} className="hidden md:flex">
        <span style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>
          BeatURL
        </span>
      </div>

      {/* Play */}
      <button
        onClick={togglePlay}
        style={{
          ...section,
          width: 80,
          justifyContent: "center",
          gap: 6,
          border: "none",
          cursor: "pointer",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: "var(--font-mono)",
          background: playing ? "var(--kick)" : "rgba(255,255,255,0.04)",
          color: "#fff",
        }}
      >
        {playing ? <><Square size={10} /> STOP</> : <><Play size={10} /> PLAY</>}
      </button>

      {/* BPM */}
      <BpmControl bpm={bpm} setBpm={setBpm} />

      {/* Swing */}
      <div style={{ ...section, gap: 4, padding: "0 12px" }}>
        <span style={label}>SWG</span>
        <input
          type="range" min={0} max={80} value={swing}
          onChange={(e) => setSwing(Number(e.target.value))}
          style={{ width: 48, height: 4, accentColor: "var(--clap)" }}
        />
        <span style={{ fontSize: 9, color: "var(--clap)", width: 24, textAlign: "center" }}>{swing}%</span>
      </div>

      {/* Kit */}
      <div style={{ ...section, padding: 0 }}>
        <span style={{ ...label, padding: "0 12px" }}>KIT</span>
        {kits.map((k) => (
          <button
            key={k}
            onClick={() => setKit(k)}
            style={{
              height: 40,
              padding: "0 12px",
              fontSize: 9,
              letterSpacing: 1,
              textTransform: "uppercase",
              cursor: "pointer",
              border: "none",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              background: kit === k ? "var(--tom)" : "rgba(255,255,255,0.04)",
              color: kit === k ? "#fff" : "#aaa",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Bars */}
      <div style={{ ...section, gap: 4, padding: "0 8px" }}>
        <button onClick={onRemoveBar} style={{ ...iconBtn, opacity: stepCount <= 4 ? 0.3 : 1 }} disabled={stepCount <= 4}><Minus size={10} /></button>
        <span style={{ fontSize: 9, color: "var(--perc)", width: 40, textAlign: "center" }}>{bars} BAR{bars !== 1 ? "S" : ""}</span>
        <button onClick={onAddBar} style={{ ...iconBtn, opacity: stepCount >= 256 ? 0.3 : 1 }} disabled={stepCount >= 256}><Plus size={10} /></button>
      </div>

      {/* Zoom */}
      <div style={{ ...section, gap: 4, padding: "0 8px" }}>
        <button onClick={onZoomOut} style={iconBtn}><ZoomOut size={10} /></button>
        <span style={{ fontSize: 9, color: "#666", width: 24, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} style={iconBtn}><ZoomIn size={10} /></button>
      </div>

      {/* Presets */}
      <div ref={presetsRef} style={{ position: "relative", height: 40 }}>
        <button onClick={() => setPresetsOpen(!presetsOpen)} style={{ ...actionBtn, borderLeft: "none", borderRight: "none" }}>
          PRESETS <ChevronDown size={10} />
        </button>
        {presetsOpen && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.08)",
            minWidth: 180,
            zIndex: 50,
          }}>
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => { loadPreset(i); setPresetsOpen(false); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: 10,
                  letterSpacing: 1,
                  color: "var(--text)",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <button onClick={randomize} style={actionBtn} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}>
        <Dice5 size={11} /> RNG
      </button>
      <button onClick={clearAll} style={actionBtn} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}>
        <Trash2 size={11} /> CLR
      </button>
      <button onClick={shareURL} style={{ ...actionBtn, color: "var(--hihat)" }}>
        <Link size={11} /> SHARE
      </button>
      <button onClick={handleExport} style={{ ...actionBtn, color: "var(--clap)" }}>
        <Download size={11} /> WAV
      </button>
    </div>
    </div>
  );

  return (
    <>
      {mobileToolbar}
      {desktopToolbar}
    </>
  );
}
