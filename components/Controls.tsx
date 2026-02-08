"use client";

import { useState, useRef, useEffect } from "react";
import { PRESETS } from "@/lib/presets";
import type { KitName } from "@/lib/audio";

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
}

const kits: KitName[] = ["808", "acoustic", "electronic"];

export function Controls({
  bpm, setBpm, swing, setSwing, kit, setKit,
  playing, togglePlay, clearAll, randomize,
  shareURL, handleExport, tapTempo, loadPreset,
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

  const btnBase = "h-8 px-3 text-[10px] tracking-[1.5px] uppercase font-semibold border border-[rgba(255,255,255,0.1)] rounded bg-transparent text-[var(--dim)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all duration-150 cursor-pointer whitespace-nowrap";

  return (
    <div className="w-full bg-[var(--surface)] border-b border-[rgba(255,255,255,0.06)] px-3 py-2 flex flex-wrap items-center gap-2 relative" style={{ zIndex: 50, fontFamily: "var(--font-mono)" }}>
      {/* Logo */}
      <span className="text-sm font-bold tracking-tight mr-2 hidden md:block" style={{
        fontFamily: "var(--font-display)",
        color: "#fff",
      }}>BeatURL</span>

      {/* Play */}
      <button
        onClick={togglePlay}
        className="h-8 w-20 rounded-full text-[10px] tracking-[1.5px] uppercase font-bold border-0 cursor-pointer transition-all duration-150 flex items-center justify-center gap-1"
        style={playing ? {
          background: "var(--kick)",
          color: "#fff",
          boxShadow: "0 0 20px rgba(255,45,85,0.4)",
        } : {
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
        }}
      >
        {playing ? "⏹ STOP" : "▶ PLAY"}
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-[rgba(255,255,255,0.08)] hidden md:block" />

      {/* BPM */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-[var(--dim)] tracking-[2px]">BPM</span>
        <button onClick={() => setBpm(Math.max(40, bpm - 1))} className="w-5 h-6 text-[11px] text-[var(--dim)] hover:text-white bg-transparent border-0 cursor-pointer">−</button>
        <span className="text-xs font-semibold w-7 text-center" style={{ color: "var(--hihat)" }}>{bpm}</span>
        <button onClick={() => setBpm(Math.min(240, bpm + 1))} className="w-5 h-6 text-[11px] text-[var(--dim)] hover:text-white bg-transparent border-0 cursor-pointer">+</button>
        <input
          type="range" min={40} max={240} value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-16 h-1 accent-[var(--hihat)] hidden md:block"
        />
      </div>

      {/* Swing */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-[var(--dim)] tracking-[2px]">SWG</span>
        <input
          type="range" min={0} max={80} value={swing}
          onChange={(e) => setSwing(Number(e.target.value))}
          className="w-12 h-1 accent-[var(--clap)]"
        />
        <span className="text-[9px] w-6 text-center" style={{ color: "var(--clap)" }}>{swing}%</span>
      </div>

      <div className="w-px h-5 bg-[rgba(255,255,255,0.08)] hidden md:block" />

      {/* Kit */}
      <div className="flex items-center gap-0.5">
        <span className="text-[9px] text-[var(--dim)] tracking-[2px] mr-1">KIT</span>
        {kits.map((k) => (
          <button
            key={k}
            onClick={() => setKit(k)}
            className="h-6 px-2 text-[9px] tracking-[1px] uppercase rounded cursor-pointer border-0 transition-all duration-150"
            style={kit === k ? {
              background: "var(--tom)",
              color: "#fff",
              boxShadow: "0 0 10px rgba(48,209,88,0.3)",
            } : {
              background: "transparent",
              color: "var(--dim)",
            }}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-[rgba(255,255,255,0.08)] hidden md:block" />

      {/* Tap */}
      <button onClick={tapTempo} className={btnBase}>TAP</button>

      {/* Presets */}
      <div className="relative" ref={presetsRef}>
        <button onClick={() => setPresetsOpen(!presetsOpen)} className={btnBase}>PRESETS ▾</button>
        {presetsOpen && (
          <div className="absolute top-full left-0 mt-1 bg-[var(--surface)] border border-[rgba(255,255,255,0.1)] rounded-md py-1 min-w-[180px] z-50 shadow-xl">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => { loadPreset(i); setPresetsOpen(false); }}
                className="block w-full text-left px-3 py-2 text-[10px] tracking-[1px] text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)] transition-colors border-0 bg-transparent cursor-pointer"
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
      <button onClick={randomize} className={btnBase}>🎲 RNG</button>
      <button onClick={clearAll} className={btnBase}>✕ CLR</button>
      <button onClick={shareURL} className={btnBase + " !border-[rgba(0,229,255,0.3)]"}>🔗 SHARE</button>
      <button onClick={handleExport} className={btnBase + " !border-[rgba(191,90,242,0.3)]"}>💾 WAV</button>

      {/* URL badge */}
      <span className="text-[7px] tracking-[2px] text-[var(--dim)] opacity-50 hidden lg:block">URL ENCODED</span>
    </div>
  );
}
