"use client";

import { memo, useCallback } from "react";

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
  const handleVolume = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onVolumeChange(rowIndex, Number(e.target.value) / 100);
    },
    [rowIndex, onVolumeChange]
  );

  return (
    <div className="flex items-stretch border-b border-[rgba(255,255,255,0.03)]" style={{ height: "calc((100vh - 56px) / 8)", minHeight: "40px" }}>
      {/* Track label */}
      <div
        className="w-[60px] md:w-[80px] shrink-0 flex items-center justify-end pr-2 text-[9px] md:text-[10px] tracking-[1.5px] font-semibold uppercase"
        style={{ fontFamily: "var(--font-mono)", color: track.color, textShadow: `0 0 10px ${track.color}30` }}
      >
        {track.name}
      </div>

      {/* Volume */}
      <div className="w-[32px] md:w-[40px] shrink-0 flex items-center px-1">
        <input
          type="range" min={0} max={100} step={5}
          value={Math.round(volume * 100)}
          onChange={handleVolume}
          className="w-full h-0.5 accent-[var(--dim)] opacity-40 hover:opacity-80 transition-opacity"
          style={{ accentColor: track.color }}
        />
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
              {/* Playhead column highlight */}
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
