"use client";

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
  presetsOpen: boolean;
  setPresetsOpen: (v: boolean) => void;
  loadPreset: (idx: number) => void;
}

const kits: KitName[] = ["808", "acoustic", "electronic"];

function Btn({
  children,
  onClick,
  active,
  accentColor,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  accentColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`btn-tactile ${active ? "active" : ""}`}
      style={{ "--accent-color": accentColor || "var(--kick)" } as React.CSSProperties}
    >
      {children}
    </button>
  );
}

export function Controls({
  bpm,
  setBpm,
  swing,
  setSwing,
  kit,
  setKit,
  playing,
  togglePlay,
  clearAll,
  randomize,
  shareURL,
  handleExport,
  tapTempo,
  presetsOpen,
  setPresetsOpen,
  loadPreset,
}: ControlsProps) {
  return (
    <div className="w-full max-w-[900px] mb-6 space-y-3">
      {/* Row 1: Play, Clear, Random, Share, Export */}
      <div className="glass-panel px-4 py-3 md:px-6 md:py-4 flex flex-wrap gap-2 justify-center">
        <Btn onClick={togglePlay} active={playing} accentColor="var(--kick)">
          {playing ? "⏸ STOP" : "▶ PLAY"}
        </Btn>
        <Btn onClick={clearAll}>✕ CLEAR</Btn>
        <Btn onClick={randomize}>🎲 RANDOM</Btn>
        <Btn onClick={shareURL} accentColor="var(--hihat)">🔗 SHARE</Btn>
        <Btn onClick={handleExport} accentColor="var(--clap)">💾 WAV</Btn>
      </div>

      {/* Row 2: BPM, Swing, Tap + Kit + Presets */}
      <div className="glass-panel px-4 py-3 md:px-6 md:py-4 flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-[9px] md:text-[10px] text-[var(--dim)] tracking-[2px]" style={{ fontFamily: "var(--font-mono)" }}>BPM</span>
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(+e.target.value)}
            className="w-[70px] md:w-[90px]"
          />
          <span
            className="text-xs md:text-sm w-[32px] text-center font-semibold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--hihat)", textShadow: "0 0 10px rgba(0,229,255,0.3)" }}
          >
            {bpm}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] md:text-[10px] text-[var(--dim)] tracking-[2px]" style={{ fontFamily: "var(--font-mono)" }}>SWING</span>
          <input
            type="range"
            min="0"
            max="80"
            value={swing}
            onChange={(e) => setSwing(+e.target.value)}
            className="w-[45px] md:w-[60px]"
          />
          <span
            className="text-[9px] md:text-[10px] w-[28px] text-center"
            style={{ fontFamily: "var(--font-mono)", color: "var(--clap)", textShadow: "0 0 8px rgba(191,90,242,0.3)" }}
          >
            {swing}%
          </span>
        </div>

        <Btn onClick={tapTempo}>🥁 TAP</Btn>

        <div className="w-px h-5 bg-[var(--border)] hidden md:block" />

        <div className="flex items-center gap-2">
          <span className="text-[9px] md:text-[10px] text-[var(--dim)] tracking-[2px]" style={{ fontFamily: "var(--font-mono)" }}>KIT</span>
          {kits.map((k) => (
            <Btn key={k} onClick={() => setKit(k)} active={kit === k} accentColor="var(--tom)">
              {k.toUpperCase()}
            </Btn>
          ))}
        </div>

        <div className="relative">
          <Btn onClick={() => setPresetsOpen(!presetsOpen)} active={presetsOpen} accentColor="var(--perc)">
            📋 PRESETS
          </Btn>
          {presetsOpen && (
            <div
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-40 glass-panel py-1 min-w-[180px] overflow-hidden"
            >
              {PRESETS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => loadPreset(i)}
                  className="block w-full text-left px-4 py-2.5 text-[9px] md:text-[10px] tracking-[1.5px] hover:bg-white/5 transition-all duration-150"
                  style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
