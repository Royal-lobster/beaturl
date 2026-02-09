"use client";

import { useState, useRef, useEffect } from "react";
import { PRESETS } from "@/lib/presets";
import type { KitName } from "@/lib/audio";
import {
  Play, Square, Minus, Plus, ChevronDown,
  Dice5, Trash2, Link, Download, ZoomIn, ZoomOut, Github, Drum,
  Undo2, Redo2,
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
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const kits: KitName[] = ["808", "acoustic", "electronic", "lofi", "industrial", "minimal"];
const kitLabels: Record<KitName, string> = { "808": "808", acoustic: "ACOU", electronic: "ELEC", lofi: "LOFI", industrial: "INDL", minimal: "MINL" };

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
  padding: "0 10px",
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
  onUndo, onRedo, canUndo, canRedo,
}: ControlsProps) {
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [mobilePresetsOpen, setMobilePresetsOpen] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);
  const mobilePresetsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setPresetsOpen(false);
      }
      if (mobilePresetsRef.current && !mobilePresetsRef.current.contains(e.target as Node) &&
          !(e.target as Element)?.closest?.('[data-mobile-presets-toggle]')) {
        setMobilePresetsOpen(false);
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
        {/* Row 1: Logo, Play, BPM, Kit, Bars, Zoom */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ ...section, padding: "0 10px" }}>
            <span style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>
              BeatURL
            </span>
          </div>

          <BpmControl bpm={bpm} setBpm={setBpm} />

          <button
            onClick={cycleKit}
            title={`Kit: ${kit}`}
            style={{
              ...section,
              padding: "0 8px",
              border: "none",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              background: "rgba(48, 209, 88, 0.15)",
              color: "var(--tom)",
              gap: 4,
            }}
          >
            <Drum size={11} /> {kitLabels[kit]}
          </button>

          {/* Presets toggle */}
          <button data-mobile-presets-toggle onClick={() => setMobilePresetsOpen(!mobilePresetsOpen)} style={{
            ...section, padding: "0 8px", border: "none", borderLeft: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer", fontSize: 8, fontWeight: 600, letterSpacing: 1, fontFamily: "var(--font-mono)",
            color: mobilePresetsOpen ? "#fff" : "#888", gap: 3, background: "none",
          }}>
            <span>PRE</span>
            <ChevronDown size={10} style={{ transform: mobilePresetsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={togglePlay}
            style={{
              ...section,
              width: 56,
              justifyContent: "center",
              gap: 3,
              border: "none",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              background: playing ? "var(--kick)" : "rgba(255,255,255,0.04)",
              color: "#fff",
            }}
          >
            {playing ? <><Square size={9} /> STOP</> : <><Play size={9} /> PLAY</>}
          </button>
        </div>

        {/* Row 2: Bars, Zoom, Actions */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap" }}>
          {/* Bars */}
          <button onClick={onRemoveBar} style={{ ...mobileActionBtn, opacity: stepCount <= 4 ? 0.3 : 1 }} disabled={stepCount <= 4}><Minus size={10} /></button>
          <span style={{ fontSize: 8, color: "var(--perc)", whiteSpace: "nowrap" }}>{bars}B</span>
          <button onClick={onAddBar} style={{ ...mobileActionBtn, opacity: stepCount >= 256 ? 0.3 : 1 }} disabled={stepCount >= 256}><Plus size={10} /></button>

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

          {/* Zoom */}
          <button onClick={onZoomOut} style={mobileActionBtn}><ZoomOut size={10} /></button>
          <span style={{ fontSize: 8, color: "#666", whiteSpace: "nowrap" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={onZoomIn} style={mobileActionBtn}><ZoomIn size={10} /></button>

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

          <button onClick={onUndo} style={{ ...mobileActionBtn, opacity: canUndo ? 1 : 0.3 }} disabled={!canUndo} title="Undo"><Undo2 size={13} /></button>
          <button onClick={onRedo} style={{ ...mobileActionBtn, opacity: canRedo ? 1 : 0.3 }} disabled={!canRedo} title="Redo"><Redo2 size={13} /></button>

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

          <button onClick={randomize} style={mobileActionBtn} title="Randomize"><Dice5 size={13} /></button>
          <button onClick={clearAll} style={mobileActionBtn} title="Clear"><Trash2 size={13} /></button>
          <button onClick={shareURL} style={{ ...mobileActionBtn, color: "var(--hihat)" }} title="Share"><Link size={13} /></button>
          <button onClick={handleExport} style={{ ...mobileActionBtn, color: "var(--clap)" }} title="Export WAV"><Download size={13} /></button>

          <div style={{ flex: 1 }} />
          <a href="https://github.com/Royal-lobster/beaturl" target="_blank" rel="noopener noreferrer" style={{ ...mobileActionBtn, color: "#888" }} title="GitHub"><Github size={13} /></a>
        </div>

        {/* Presets panel (rendered outside overflow container) */}
        {mobilePresetsOpen && (
          <div ref={mobilePresetsRef} style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "var(--surface)",
            display: "flex",
            flexWrap: "wrap",
          }}>
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => { loadPreset(i); setMobilePresetsOpen(false); }}
                style={{
                  flex: "1 1 auto",
                  padding: "10px 14px",
                  fontSize: 10,
                  letterSpacing: 1,
                  color: "var(--text)",
                  background: "transparent",
                  border: "none",
                  borderRight: "1px solid rgba(255,255,255,0.04)",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  textAlign: "center",
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
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
      flexWrap: "nowrap",
      alignItems: "center",
      position: "relative",
      zIndex: 50,
      fontFamily: "var(--font-mono)",
      overflowX: "auto",
      overflowY: "hidden",
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
            title={k}
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
            {kitLabels[k]}
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

      {/* Undo/Redo */}
      <div style={{ ...section, gap: 0, padding: 0 }}>
        <button onClick={onUndo} title="Undo (Ctrl+Z)" style={{ ...iconBtn, opacity: canUndo ? 1 : 0.3, width: 32, height: 40 }} disabled={!canUndo}><Undo2 size={12} /></button>
        <button onClick={onRedo} title="Redo (Ctrl+Shift+Z)" style={{ ...iconBtn, opacity: canRedo ? 1 : 0.3, width: 32, height: 40 }} disabled={!canRedo}><Redo2 size={12} /></button>
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

      {/* GitHub */}
      <a
        href="https://github.com/Royal-lobster/beaturl"
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...actionBtn, textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
      >
        <Github size={13} />
      </a>

      {/* Right actions */}
      <button onClick={randomize} title="Randomize" style={actionBtn} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}>
        <Dice5 size={11} /> <span className="hidden lg:inline">RNG</span>
      </button>
      <button onClick={clearAll} title="Clear All" style={actionBtn} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}>
        <Trash2 size={11} /> <span className="hidden lg:inline">CLR</span>
      </button>
      <button onClick={shareURL} title="Copy Share Link" style={{ ...actionBtn, color: "var(--hihat)" }}>
        <Link size={11} /> <span className="hidden lg:inline">SHARE</span>
      </button>
      <button onClick={handleExport} title="Export as WAV" style={{ ...actionBtn, color: "var(--clap)" }}>
        <Download size={11} /> <span className="hidden lg:inline">WAV</span>
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
