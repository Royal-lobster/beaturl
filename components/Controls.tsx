"use client";

import { PRESETS } from "@/lib/presets";
import type { KitName } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, Toggle as ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverTrigger, PopoverPopup } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipPopup, TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

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
  loadPreset,
}: ControlsProps) {
  return (
    <TooltipProvider>
      <div className="w-full max-w-[900px] mb-6 space-y-3">
        {/* Row 1: Main actions */}
        <div className="glass-panel px-4 py-3 md:px-6 md:py-4 flex flex-wrap gap-2 justify-center items-center">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={playing ? "default" : "outline"}
                  size="sm"
                  onClick={togglePlay}
                  className="font-mono text-[10px] tracking-[1.5px] uppercase"
                  style={playing ? {
                    background: "linear-gradient(180deg, var(--kick), color-mix(in srgb, var(--kick) 70%, black))",
                    borderColor: "var(--kick)",
                    boxShadow: "0 0 16px rgba(255, 45, 85, 0.3)",
                  } : {}}
                />
              }
            >
              {playing ? "⏸ STOP" : "▶ PLAY"}
            </TooltipTrigger>
            <TooltipPopup>Space to toggle</TooltipPopup>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger render={
              <Button variant="outline" size="sm" onClick={clearAll}
                className="font-mono text-[10px] tracking-[1.5px] uppercase" />
            }>
              ✕ CLEAR
            </TooltipTrigger>
            <TooltipPopup>Clear all cells</TooltipPopup>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger render={
              <Button variant="outline" size="sm" onClick={randomize}
                className="font-mono text-[10px] tracking-[1.5px] uppercase" />
            }>
              🎲 RANDOM
            </TooltipTrigger>
            <TooltipPopup>Generate random pattern</TooltipPopup>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger render={
              <Button variant="outline" size="sm" onClick={shareURL}
                className="font-mono text-[10px] tracking-[1.5px] uppercase"
                style={{ borderColor: "rgba(0, 229, 255, 0.3)" }} />
            }>
              🔗 SHARE
            </TooltipTrigger>
            <TooltipPopup>Copy beat URL to clipboard</TooltipPopup>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger render={
              <Button variant="outline" size="sm" onClick={handleExport}
                className="font-mono text-[10px] tracking-[1.5px] uppercase"
                style={{ borderColor: "rgba(191, 90, 242, 0.3)" }} />
            }>
              💾 WAV
            </TooltipTrigger>
            <TooltipPopup>Export as WAV file</TooltipPopup>
          </Tooltip>
        </div>

        {/* Row 2: Parameters */}
        <div className="glass-panel px-4 py-3 md:px-6 md:py-4 flex flex-wrap gap-4 items-center justify-center">
          {/* BPM */}
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="text-[9px] md:text-[10px] text-[var(--dim)] tracking-[2px] font-mono shrink-0">BPM</span>
            <Slider
              min={40} max={240} value={bpm}
              onValueChange={(v) => setBpm(Array.isArray(v) ? v[0] : v)}
              className="w-[70px] md:w-[90px]"
            />
            <span
              className="text-xs md:text-sm w-[32px] text-center font-semibold font-mono"
              style={{ color: "var(--hihat)", textShadow: "0 0 10px rgba(0,229,255,0.3)" }}
            >
              {bpm}
            </span>
          </div>

          {/* Swing */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-[9px] md:text-[10px] text-[var(--dim)] tracking-[2px] font-mono shrink-0">SWING</span>
            <Slider
              min={0} max={80} value={swing}
              onValueChange={(v) => setSwing(Array.isArray(v) ? v[0] : v)}
              className="w-[50px] md:w-[60px]"
            />
            <span
              className="text-[9px] md:text-[10px] w-[28px] text-center font-mono"
              style={{ color: "var(--clap)", textShadow: "0 0 8px rgba(191,90,242,0.3)" }}
            >
              {swing}%
            </span>
          </div>

          <Tooltip>
            <TooltipTrigger render={
              <Button variant="outline" size="sm" onClick={tapTempo}
                className="font-mono text-[10px] tracking-[1.5px] uppercase" />
            }>
              🥁 TAP
            </TooltipTrigger>
            <TooltipPopup>Tap to set tempo</TooltipPopup>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 hidden md:block opacity-20" />

          {/* Kit selector */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] md:text-[10px] text-[var(--dim)] tracking-[2px] font-mono">KIT</span>
            <ToggleGroup
              value={[kit]}
              onValueChange={(val) => { if (val.length > 0) setKit(val[val.length - 1] as KitName); }}
              variant="outline"
              size="sm"
            >
              {kits.map((k) => (
                <ToggleGroupItem
                  key={k}
                  value={k}
                  className="font-mono text-[10px] tracking-[1.5px] uppercase px-3"
                  style={kit === k ? {
                    background: "linear-gradient(180deg, var(--tom), color-mix(in srgb, var(--tom) 60%, black))",
                    borderColor: "var(--tom)",
                    color: "#fff",
                    boxShadow: "0 0 12px rgba(48, 209, 88, 0.25)",
                  } : {}}
                >
                  {k.toUpperCase()}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Presets popover */}
          <Popover>
            <Tooltip>
              <TooltipTrigger render={
                <PopoverTrigger render={
                  <Button variant="outline" size="sm"
                    className="font-mono text-[10px] tracking-[1.5px] uppercase"
                    style={{ borderColor: "rgba(255, 214, 10, 0.3)" }} />
                }>
                  📋 PRESETS
                </PopoverTrigger>
              } />
              <TooltipPopup>Load a preset pattern</TooltipPopup>
            </Tooltip>
            <PopoverPopup side="bottom" align="center" sideOffset={8}
              className="min-w-[200px] !bg-[var(--surface)] !border-[var(--border-glow)]">
              <div className="py-1">
                <p className="px-4 pb-2 text-[9px] tracking-[2px] text-[var(--dim)] font-mono uppercase">Load Preset</p>
                {PRESETS.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => loadPreset(i)}
                    className="block w-full text-left px-4 py-2.5 text-[10px] tracking-[1.5px] hover:bg-white/5 transition-all duration-150 font-mono"
                    style={{ color: "var(--text)" }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </PopoverPopup>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
}
