"use client";

import { memo, useCallback } from "react";
import { STEPS } from "@/lib/audio";
import { Slider } from "@/components/ui/slider";

interface TrackRowProps {
  track: { name: string; key: string; color: string };
  row: number[];
  rowIndex: number;
  currentStep: number;
  volume: number;
  onToggle: (r: number, c: number) => void;
  onVolumeChange: (r: number, v: number) => void;
}

const trackGradients: Record<number, string> = {
  0: "rgba(255, 45, 85, 0.04)",
  1: "rgba(255, 149, 0, 0.04)",
  2: "rgba(0, 229, 255, 0.04)",
  3: "rgba(191, 90, 242, 0.04)",
  4: "rgba(48, 209, 88, 0.04)",
  5: "rgba(255, 107, 157, 0.04)",
  6: "rgba(255, 214, 10, 0.04)",
  7: "rgba(0, 199, 190, 0.04)",
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
    (v: number | readonly number[]) => {
      const val = Array.isArray(v) ? v[0] : v;
      onVolumeChange(rowIndex, val / 100);
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

      {/* Volume slider - coss */}
      <div className="w-[28px] md:w-[40px] shrink-0 flex items-center volume-slider">
        <Slider
          min={0}
          max={100}
          step={5}
          value={Math.round(volume * 100)}
          onValueChange={handleVolume}
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
            className="flex-1 aspect-square rounded-[4px] md:rounded-md transition-all duration-75 relative overflow-hidden"
            style={{
              background: isOn
                ? `radial-gradient(circle at center, ${track.color}, color-mix(in srgb, ${track.color} 50%, black))`
                : isPlaying
                ? "rgba(255,255,255,0.04)"
                : "var(--surface)",
              border: `1px solid ${
                isOn
                  ? `${track.color}60`
                  : isBeat
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.03)"
              }`,
              boxShadow: isOn
                ? `inset 0 0 ${isPlaying ? "12px" : "6px"} ${track.color}50, 0 0 ${isPlaying ? "20px" : "10px"} ${track.color}30`
                : isPlaying
                ? "inset 0 0 8px rgba(0, 229, 255, 0.08)"
                : "none",
              transform: isOn && isPlaying ? "scale(1.12)" : "scale(1)",
              opacity: isOn ? 1 : isPlaying ? 0.95 : 0.7,
            }}
          >
            {/* Playhead sweep */}
            {isPlaying && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
                  boxShadow: "inset 0 0 12px rgba(0, 229, 255, 0.12)",
                }}
              />
            )}
            {/* Inner glow dot when active */}
            {isOn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-[3px] h-[3px] md:w-1 md:h-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    boxShadow: `0 0 6px rgba(255,255,255,0.5)`,
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
