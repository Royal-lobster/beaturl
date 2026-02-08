"use client";

import { useState, useRef, useEffect } from "react";
import { PRESETS } from "@/lib/presets";
import type { KitName } from "@/lib/audio";
import {
  Play, Square, Minus, Plus, ChevronDown,
  Dice5, Trash2, Link, Download, Zap, ZoomIn, ZoomOut,
} from "lucide-react";

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
  tapTempo: () => void;
  loadPreset: (idx: number) => void;
  stepCount: number;
  onAddBar: () => void;
  onRemoveBar: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const kits: KitName[] = ["808", "acoustic", "electronic"];

export function Controls({
  bpm, setBpm, swing, setSwing, kit, setKit,
  playing, togglePlay, clearAll, randomize,
  shareURL, handleExport, tapTempo, loadPreset,
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

  const btnBase = "h-8 px-3 text-[10px] tracking-[1.5px] uppercase font-semibold border border-[rgba(255,255,255,0.08)] bg-transparent text-[var(--dim)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all duration-100 cursor-pointer whitespace-nowrap flex items-center gap-1.5";

  const bars = stepCount / 4;

  return (
    <div
      className="w-full bg-[var(--surface)] border-b border-[rgba(255,255,255,0.06)] px-0 py-0 flex flex-wrap items-center relative"
      style={{ zIndex: 50, fontFamily: "var(--font-mono)" }}
    >
      {/* Logo */}
      <div className="h-10 px-4 flex items-center border-r border-[rgba(255,255,255,0.06)] hidden md:flex">
        <span className="text-sm font-bold tracking-[3px] uppercase" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
          BeatURL
        </span>
      </div>

      {/* Play */}
      <button
        onClick={togglePlay}
        className="h-10 w-20 text-[10px] tracking-[1.5px] uppercase font-bold border-0 border-r border-r-[rgba(255,255,255,0.06)] cursor-pointer transition-all duration-100 flex items-center justify-center gap-1.5"
        style={playing ? {
          background: "var(--kick)",
          color: "#fff",
        } : {
          background: "rgba(255,255,255,0.04)",
          color: "#fff",
        }}
      >
        {playing ? <><Square size={10} /> STOP</> : <><Play size={10} /> PLAY</>}
      </button>

      {/* BPM */}
      <div className="h-10 flex items-center gap-1 px-3 border-r border-[rgba(255,255,255,0.06)]">
        <span className="text-[9px] text-[var(--dim)] tracking-[2px]">BPM</span>
        <button onClick={() => setBpm(Math.max(40, bpm - 1))} className="w-5 h-6 text-[var(--dim)] hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"><Minus size={10} /></button>
        <span className="text-xs font-semibold w-7 text-center" style={{ color: "var(--hihat)" }}>{bpm}</span>
        <button onClick={() => setBpm(Math.min(240, bpm + 1))} className="w-5 h-6 text-[var(--dim)] hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"><Plus size={10} /></button>
        <input
          type="range" min={40} max={240} value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-16 h-1 accent-[var(--hihat)] hidden md:block"
        />
      </div>

      {/* Swing */}
      <div className="h-10 flex items-center gap-1 px-3 border-r border-[rgba(255,255,255,0.06)]">
        <span className="text-[9px] text-[var(--dim)] tracking-[2px]">SWG</span>
        <input
          type="range" min={0} max={80} value={swing}
          onChange={(e) => setSwing(Number(e.target.value))}
          className="w-12 h-1 accent-[var(--clap)]"
        />
        <span className="text-[9px] w-6 text-center" style={{ color: "var(--clap)" }}>{swing}%</span>
      </div>

      {/* Kit */}
      <div className="h-10 flex items-center gap-0 border-r border-[rgba(255,255,255,0.06)]">
        <span className="text-[9px] text-[var(--dim)] tracking-[2px] px-3">KIT</span>
        <div className="flex h-10">
          {kits.map((k, i) => (
            <button
              key={k}
              onClick={() => setKit(k)}
              className="h-10 px-3 text-[9px] tracking-[1px] uppercase cursor-pointer transition-all duration-100"
              style={{
                background: kit === k ? "var(--tom)" : "transparent",
                color: kit === k ? "#fff" : "var(--dim)",
                border: "none",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className="h-10 flex items-center gap-1 px-2 border-r border-[rgba(255,255,255,0.06)]">
        <button onClick={onRemoveBar} className="w-5 h-6 text-[var(--dim)] hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center" disabled={stepCount <= 4}><Minus size={10} /></button>
        <span className="text-[9px] w-10 text-center" style={{ color: "var(--perc)" }}>{bars} BAR{bars !== 1 ? "S" : ""}</span>
        <button onClick={onAddBar} className="w-5 h-6 text-[var(--dim)] hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center" disabled={stepCount >= 256}><Plus size={10} /></button>
      </div>

      {/* Zoom */}
      <div className="h-10 flex items-center gap-1 px-2 border-r border-[rgba(255,255,255,0.06)]">
        <button onClick={onZoomOut} className="w-5 h-6 text-[var(--dim)] hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"><ZoomOut size={10} /></button>
        <span className="text-[9px] w-6 text-center" style={{ color: "var(--dim)" }}>{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="w-5 h-6 text-[var(--dim)] hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center"><ZoomIn size={10} /></button>
      </div>

      {/* Tap */}
      <button onClick={tapTempo} className={btnBase + " h-10 border-0 border-r border-r-[rgba(255,255,255,0.06)]"}>
        <Zap size={10} /> TAP
      </button>

      {/* Presets */}
      <div className="relative h-10" ref={presetsRef}>
        <button onClick={() => setPresetsOpen(!presetsOpen)} className={btnBase + " h-10 border-0 border-r border-r-[rgba(255,255,255,0.06)]"}>
          PRESETS <ChevronDown size={10} />
        </button>
        {presetsOpen && (
          <div className="absolute top-full left-0 bg-[var(--surface)] border border-[rgba(255,255,255,0.08)] py-0 min-w-[180px] z-50">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => { loadPreset(i); setPresetsOpen(false); }}
                className="block w-full text-left px-3 py-2 text-[10px] tracking-[1px] text-[var(--text)] hover:bg-[rgba(255,255,255,0.04)] transition-colors border-0 bg-transparent cursor-pointer border-b border-b-[rgba(255,255,255,0.04)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1 hidden md:block" />

      {/* Right actions */}
      <button onClick={randomize} className={btnBase + " h-10 border-0 border-l border-l-[rgba(255,255,255,0.06)]"}>
        <Dice5 size={11} /> RNG
      </button>
      <button onClick={clearAll} className={btnBase + " h-10 border-0 border-l border-l-[rgba(255,255,255,0.06)]"}>
        <Trash2 size={11} /> CLR
      </button>
      <button onClick={shareURL} className={btnBase + " h-10 border-0 border-l border-l-[rgba(255,255,255,0.06)] text-[var(--hihat)]"}>
        <Link size={11} /> SHARE
      </button>
      <button onClick={handleExport} className={btnBase + " h-10 border-0 border-l border-l-[rgba(255,255,255,0.06)] text-[var(--clap)]"}>
        <Download size={11} /> WAV
      </button>
    </div>
  );
}
