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

// Per-track gradient tints (subtle)
const trackGradients: Record<number, string> = {
  0: "rgba(255, 45, 85, 0.03)",
  1: "rgba(255, 149, 0, 0.03)",
  2: "rgba(0, 229, 255, 0.03)",
  3: "rgba(191, 90, 242, 0.03)",
  4: "rgba(48, 209, 88, 0.03)",
  5: "rgba(255, 107, 157, 0.03)",
  6: "rgba(255, 214, 10, 0.03)",
  7: "rgba(0, 199, 190, 0.03)",
};

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
    <div
      className="flex items-center gap-[3px] md:gap-1 mb-[3px] md:mb-1 rounded-lg px-1 py-[2px] transition-colors duration-300"
      style={{
        background: `linear-gradient(90deg, ${trackGradients[rowIndex] || "transparent"}, transparent)`,
      }}
    >
      {/* Track label */}
      <div
        className="w-[42px] md:w-[56px] text-[8px] md:text-[10px] tracking-[1.5px] text-right pr-1 md:pr-2 shrink-0 font-semibold uppercase"
        style={{
          fontFamily: "var(--font-mono)",
          color: track.color,
          textShadow: `0 0 12px ${track.color}40`,
        }}
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
            className="flex-1 aspect-square rounded-[4px] md:rounded-md transition-all duration-75 border relative overflow-hidden"
            style={{
              background: isOn
                ? `radial-gradient(circle at center, ${track.color}, color-mix(in srgb, ${track.color} 60%, black))`
                : isPlaying
                ? "rgba(255,255,255,0.03)"
                : "var(--surface)",
              borderColor: isOn
                ? `${track.color}60`
                : isBeat
                ? "rgba(255,255,255,0.07)"
                : "var(--border)",
              boxShadow: isOn
                ? `inset 0 0 ${isPlaying ? "10px" : "6px"} ${track.color}40, 0 0 ${isPlaying ? "16px" : "8px"} ${track.color}30`
                : "none",
              transform: isOn && isPlaying ? "scale(1.1)" : "scale(1)",
              opacity: isOn ? 1 : isPlaying ? 0.9 : 0.7,
            }}
          >
            {/* Playhead sweep — dramatic vertical light bar */}
            {isPlaying && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.12) 100%)",
                  boxShadow: "inset 0 0 12px rgba(0, 229, 255, 0.1)",
                }}
              />
            )}
            {/* Inner glow dot when active */}
            {isOn && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div
                  className="w-[3px] h-[3px] md:w-1 md:h-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    boxShadow: `0 0 4px rgba(255,255,255,0.4)`,
                  }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
});
