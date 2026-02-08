"use client";

import { memo, useCallback } from "react";
import { STEPS } from "@/lib/audio";

interface TrackRowProps {
  track: { name: string; key: string; color: string };
  row: number[];
  rowIndex: number;
  currentStep: number;
  volume: number;
  onToggle: (r: number, c: number) => void;
  onVolumeChange: (r: number, v: number) => void;
}

export const TrackRow = memo(function TrackRow({
  track,
  row,
  rowIndex,
  currentStep,
  volume,
  onToggle,
  onVolumeChange,
}: TrackRowProps) {
  const handleVolume = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onVolumeChange(rowIndex, parseFloat(e.target.value));
    },
    [rowIndex, onVolumeChange]
  );

  return (
    <div className="flex items-center gap-[3px] md:gap-1 mb-[3px] md:mb-1">
      {/* Track label */}
      <div
        className="w-[42px] md:w-[56px] text-[9px] md:text-[10px] tracking-[1px] text-right pr-1 md:pr-2 shrink-0 font-semibold"
        style={{ color: track.color }}
      >
        {track.name}
      </div>

      {/* Volume slider */}
      <div className="w-[28px] md:w-[40px] shrink-0 flex items-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolume}
          className="w-full h-[3px] cursor-pointer"
          style={
            {
              "--tw-accent": track.color,
            } as React.CSSProperties
          }
        />
      </div>

      {/* Cells */}
      {row.map((on, c) => {
        const isPlaying = currentStep === c;
        const isOn = on === 1;
        const isBeat = c % 4 === 0;

        return (
          <button
            key={c}
            onClick={() => onToggle(rowIndex, c)}
            className="flex-1 aspect-square rounded-[3px] md:rounded transition-all duration-100 border relative"
            style={{
              background: isOn ? track.color : isPlaying ? "rgba(255,255,255,0.04)" : "var(--surface)",
              borderColor: isOn ? "transparent" : isBeat ? "rgba(255,255,255,0.08)" : "var(--border)",
              boxShadow: isOn
                ? `0 0 ${isPlaying ? "14px" : "6px"} ${track.color}50`
                : "none",
              transform: isOn && isPlaying ? "scale(1.12)" : "scale(1)",
              opacity: isOn ? 1 : isPlaying ? 0.85 : 0.75,
            }}
          >
            {/* Playhead indicator */}
            {isPlaying && (
              <div
                className="absolute inset-0 rounded-[3px] md:rounded pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 8px rgba(255,255,255,0.15)`,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
});
