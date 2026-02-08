"use client";

import { memo, useCallback } from "react";

const ABBREVS: Record<string, string> = {
  kick: "KCK", snare: "SNR", hihat: "HH", clap: "CLP",
  tom: "TOM", rim: "RIM", perc: "PRC", cowbell: "COW",
};

interface TrackRowProps {
  track: { name: string; key: string; color: string };
  row: number[];
  rowIndex: number;
  currentStep: number;
  volume: number;
  onToggle: (r: number, c: number) => void;
  onVolumeChange: (r: number, v: number) => void;
  cellMinWidth?: number;
}

export const TrackRow = memo(function TrackRow({
  track, row, rowIndex, currentStep, volume, onToggle, onVolumeChange, cellMinWidth,
}: TrackRowProps) {
  const cycleVolume = useCallback(() => {
    const levels = [0, 0.25, 0.5, 0.75, 1.0];
    const current = levels.reduce((prev, curr) =>
      Math.abs(curr - volume) < Math.abs(prev - volume) ? curr : prev
    );
    const idx = levels.indexOf(current);
    onVolumeChange(rowIndex, levels[(idx + 1) % levels.length]);
  }, [rowIndex, volume, onVolumeChange]);

  const abbrev = ABBREVS[track.key] || track.name.slice(0, 3).toUpperCase();

  return (
    <div className="flex items-stretch border-b border-[rgba(255,255,255,0.03)]" style={{ height: "calc((100vh - 56px) / 8)", minHeight: "40px" }}>
      {/* Sticky left label */}
      <div
        className="w-[50px] md:w-[70px] shrink-0 flex flex-col items-center justify-center gap-0.5 cursor-pointer sticky left-0 z-10"
        style={{ fontFamily: "var(--font-mono)", background: "var(--surface)" }}
        onClick={cycleVolume}
        title={`${track.name} — Vol: ${Math.round(volume * 100)}% (click to cycle)`}
      >
        <span
          className="text-[8px] md:text-[9px] tracking-[1px] font-bold uppercase leading-none"
          style={{ color: track.color, textShadow: `0 0 8px ${track.color}30` }}
        >
          {abbrev}
        </span>
        {/* Volume bar */}
        <div className="w-[32px] md:w-[36px] h-[6px] md:h-[4px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{ width: `${volume * 100}%`, background: track.color, opacity: 0.8 }}
          />
        </div>
        <span className="text-[7px] md:text-[8px] leading-none" style={{ color: "rgba(255,255,255,0.3)" }}>
          {volume === 0 ? "MUTE" : `${Math.round(volume * 100)}%`}
        </span>
      </div>

      {/* Cells */}
      <div className="flex-1 flex gap-px p-px">
        {row.map((on, c) => {
          const isPlaying = currentStep === c;
          const isOn = on === 1;
          const isBeatStart = c % 4 === 0;

          return (
            <button
              key={c}
              onClick={() => onToggle(rowIndex, c)}
              className="flex-1 relative border-0 cursor-pointer transition-all duration-[50ms]"
              style={{
                minWidth: cellMinWidth ? `${cellMinWidth}px` : undefined,
                background: isOn
                  ? track.color
                  : isBeatStart
                  ? "rgba(255,255,255,0.025)"
                  : "rgba(255,255,255,0.012)",
                opacity: isOn ? 1 : 0.9,
                boxShadow: isOn
                  ? `inset 0 1px 3px rgba(0,0,0,0.4), 0 0 ${isPlaying ? "12px" : "4px"} ${track.color}40`
                  : "none",
                borderLeft: isBeatStart && c > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              {isPlaying && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: isOn
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,229,255,0.06)",
                  borderLeft: "1px solid rgba(0,229,255,0.3)",
                  borderRight: "1px solid rgba(0,229,255,0.3)",
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
