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
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-[6px] md:px-4 md:py-2 rounded-md text-[10px] md:text-xs font-medium tracking-wide transition-all border"
      style={{
        background: active ? (color || "var(--kick)") : "var(--surface)",
        borderColor: active ? (color || "var(--kick)") : "var(--border)",
        color: active ? "#fff" : "var(--text)",
      }}
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
    <div className="w-full max-w-[900px] mb-5 space-y-3">
      {/* Row 1: Play, Clear, Random, Share, Export */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Btn onClick={togglePlay} active={playing}>
          {playing ? "⏸ STOP" : "▶ PLAY"}
        </Btn>
        <Btn onClick={clearAll}>✕ CLEAR</Btn>
        <Btn onClick={randomize}>🎲 RANDOM</Btn>
        <Btn onClick={shareURL}>🔗 SHARE</Btn>
        <Btn onClick={handleExport}>💾 WAV</Btn>
      </div>

      {/* Row 2: BPM, Swing, Tap Tempo */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-xs text-[var(--dim)] tracking-wide">BPM</span>
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(+e.target.value)}
            className="w-[80px] md:w-[100px]"
          />
          <span className="text-xs md:text-sm text-[var(--hihat)] w-[32px] text-center font-mono">
            {bpm}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-xs text-[var(--dim)] tracking-wide">SWING</span>
          <input
            type="range"
            min="0"
            max="80"
            value={swing}
            onChange={(e) => setSwing(+e.target.value)}
            className="w-[50px] md:w-[70px]"
          />
          <span className="text-[10px] md:text-xs text-[var(--clap)] w-[28px] text-center font-mono">
            {swing}%
          </span>
        </div>

        <Btn onClick={tapTempo}>🥁 TAP</Btn>
      </div>

      {/* Row 3: Kit selector, Presets */}
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <span className="text-[10px] md:text-xs text-[var(--dim)] tracking-wide">KIT</span>
        {kits.map((k) => (
          <Btn key={k} onClick={() => setKit(k)} active={kit === k} color="var(--tom)">
            {k.toUpperCase()}
          </Btn>
        ))}
        <div className="relative">
          <Btn onClick={() => setPresetsOpen(!presetsOpen)} active={presetsOpen}>
            📋 PRESETS
          </Btn>
          {presetsOpen && (
            <div
              className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-40 rounded-lg border py-1 min-w-[160px]"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {PRESETS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => loadPreset(i)}
                  className="block w-full text-left px-4 py-2 text-[10px] md:text-xs tracking-wide hover:bg-white/5 transition-colors"
                  style={{ color: "var(--text)" }}
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
