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

const mono = "var(--font-mono)";

/* Divider between toolbar sections */
function Sep() {
  return <div className="shrink-0" style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />;
}

/* Icon-only button */
function IcoBtn({ onClick, title, disabled, opacity, children }: {
  onClick: () => void; title?: string; disabled?: boolean; opacity?: number; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="shrink-0 flex items-center justify-center hover:text-white transition-colors"
      style={{
        background: "none", border: "none", color: "#888", cursor: disabled ? "default" : "pointer",
        width: 30, height: 40, opacity: opacity ?? 1,
      }}
    >
      {children}
    </button>
  );
}

export function Controls({
  bpm, setBpm, swing, setSwing, kit, setKit,
  playing, togglePlay, clearAll, randomize,
  shareURL, handleExport, loadPreset,
  stepCount, onAddBar, onRemoveBar,
  zoom, onZoomIn, onZoomOut,
  onUndo, onRedo, canUndo, canRedo,
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

  return (
    <div style={{ background: "var(--surface)", borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 50, position: "relative" }}>
      {/* Main toolbar row */}
      <div className="flex items-center h-10 overflow-x-auto overflow-y-hidden" style={{ fontFamily: mono }}>
        {/* Logo */}
        <div className="shrink-0 px-2.5 sm:px-4 flex items-center h-full" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>
            BeatURL
          </span>
        </div>

        {/* Play/Stop */}
        <button
          onClick={togglePlay}
          className="shrink-0 flex items-center justify-center gap-1.5 h-full"
          style={{
            width: 64, border: "none", cursor: "pointer",
            fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: mono,
            background: playing ? "var(--kick)" : "rgba(255,255,255,0.04)", color: "#fff",
            borderRight: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {playing ? <><Square size={9} /> STOP</> : <><Play size={9} /> PLAY</>}
        </button>

        {/* BPM */}
        <BpmControl bpm={bpm} setBpm={setBpm} />

        {/* Swing — hidden on small screens */}
        <div className="hidden md:flex shrink-0 items-center gap-1 px-2.5 h-full" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: 9, color: "#666", letterSpacing: 2, fontFamily: mono }}>SWG</span>
          <input
            type="range" min={0} max={80} value={swing}
            onChange={(e) => setSwing(Number(e.target.value))}
            style={{ width: 48, height: 4, accentColor: "var(--clap)" }}
          />
          <span style={{ fontSize: 9, color: "var(--clap)", width: 24, textAlign: "center" }}>{swing}%</span>
        </div>

        {/* Kit — cycle button on small, full buttons on large */}
        <button
          onClick={cycleKit}
          className="lg:hidden shrink-0 flex items-center gap-1 h-full"
          style={{
            padding: "0 8px", border: "none", cursor: "pointer",
            fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", fontFamily: mono,
            background: "rgba(48, 209, 88, 0.15)", color: "var(--tom)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Drum size={11} /> {kitLabels[kit]}
        </button>
        <div className="hidden lg:flex shrink-0 items-center h-full" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="px-2.5" style={{ fontSize: 9, color: "#666", letterSpacing: 2, fontFamily: mono }}>KIT</span>
          {kits.map((k) => (
            <button
              key={k}
              onClick={() => setKit(k)}
              title={k}
              className="shrink-0 h-full"
              style={{
                padding: "0 10px", fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                cursor: "pointer", border: "none",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                background: kit === k ? "var(--tom)" : "rgba(255,255,255,0.04)",
                color: kit === k ? "#fff" : "#aaa", fontFamily: mono, fontWeight: 600,
              }}
            >
              {kitLabels[k]}
            </button>
          ))}
        </div>

        <Sep />

        {/* Bars */}
        <div className="shrink-0 flex items-center gap-0.5 px-1">
          <IcoBtn onClick={onRemoveBar} disabled={stepCount <= 4} opacity={stepCount <= 4 ? 0.3 : 1}><Minus size={10} /></IcoBtn>
          <span className="text-center whitespace-nowrap" style={{ fontSize: 9, color: "var(--perc)", width: 28 }}>
            {bars}<span className="hidden sm:inline"> BAR{bars !== 1 ? "S" : ""}</span><span className="sm:hidden">B</span>
          </span>
          <IcoBtn onClick={onAddBar} disabled={stepCount >= 256} opacity={stepCount >= 256 ? 0.3 : 1}><Plus size={10} /></IcoBtn>
        </div>

        <Sep />

        {/* Zoom */}
        <div className="shrink-0 flex items-center gap-0.5 px-1">
          <IcoBtn onClick={onZoomOut}><ZoomOut size={10} /></IcoBtn>
          <span className="text-center whitespace-nowrap" style={{ fontSize: 9, color: "#666", width: 24 }}>{Math.round(zoom * 100)}%</span>
          <IcoBtn onClick={onZoomIn}><ZoomIn size={10} /></IcoBtn>
        </div>

        <Sep />

        {/* Undo/Redo */}
        <div className="shrink-0 flex items-center">
          <IcoBtn onClick={onUndo} title="Undo (Ctrl+Z)" disabled={!canUndo} opacity={canUndo ? 1 : 0.3}><Undo2 size={12} /></IcoBtn>
          <IcoBtn onClick={onRedo} title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} opacity={canRedo ? 1 : 0.3}><Redo2 size={12} /></IcoBtn>
        </div>

        <Sep />

        {/* Presets dropdown */}
        <div ref={presetsRef} className="shrink-0 relative h-full">
          <button
            onClick={() => setPresetsOpen(!presetsOpen)}
            className="flex items-center gap-1.5 h-full px-2.5 hover:text-white transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: mono }}
          >
            <span className="hidden sm:inline">PRESETS</span>
            <span className="sm:hidden">PRE</span>
            <ChevronDown size={10} style={{ transform: presetsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
          {presetsOpen && (
            <div style={{
              position: "absolute", top: "100%", left: 0,
              background: "var(--surface)", border: "1px solid rgba(255,255,255,0.08)",
              minWidth: 180, zIndex: 50,
            }}>
              {PRESETS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => { loadPreset(i); setPresetsOpen(false); }}
                  className="block w-full text-left hover:bg-white/5 transition-colors"
                  style={{
                    padding: "8px 12px", fontSize: 10, letterSpacing: 1,
                    color: "var(--text)", background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer", fontFamily: mono,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-2" />

        {/* Actions — icons only on small, with labels on xl */}
        <div className="shrink-0 flex items-center">
          <IcoBtn onClick={randomize} title="Randomize"><Dice5 size={12} /></IcoBtn>
          <IcoBtn onClick={clearAll} title="Clear"><Trash2 size={12} /></IcoBtn>
          <button
            onClick={shareURL}
            title="Copy Share Link"
            className="shrink-0 flex items-center gap-1.5 h-10 px-2.5 hover:brightness-125 transition-all"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--hihat)", fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: mono, borderLeft: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Link size={11} /> <span className="hidden xl:inline">SHARE</span>
          </button>
          <button
            onClick={handleExport}
            title="Export as WAV"
            className="shrink-0 flex items-center gap-1.5 h-10 px-2.5 hover:brightness-125 transition-all"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clap)", fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: mono, borderLeft: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Download size={11} /> <span className="hidden xl:inline">WAV</span>
          </button>

          <Sep />

          <a
            href="https://github.com/Royal-lobster/beaturl"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center justify-center hover:text-white transition-colors"
            style={{ width: 36, height: 40, color: "#888", textDecoration: "none" }}
          >
            <Github size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
