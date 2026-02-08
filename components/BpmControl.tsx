"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface BpmControlProps {
  bpm: number;
  setBpm: (v: number) => void;
}

export function BpmControl({ bpm, setBpm }: BpmControlProps) {
  const [mode, setMode] = useState<"display" | "edit" | "tap">("display");
  const [isDragging, setIsDragging] = useState(false);
  const [editValue, setEditValue] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartX = useRef(0);
  const dragStartBpm = useRef(0);
  const hasDragged = useRef(false);
  const tapTimesRef = useRef<number[]>([]);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamp = (v: number) => Math.max(40, Math.min(240, v));

  // Focus input when entering edit mode
  useEffect(() => {
    if (mode === "edit" && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [mode]);

  // Wheel handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.shiftKey ? 5 : 1;
      setBpm(clamp(bpm + (e.deltaY < 0 ? delta : -delta)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [bpm, setBpm]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode === "edit") return;
    if (mode === "tap") {
      // Count as a tap
      const now = Date.now();
      const taps = tapTimesRef.current;
      taps.push(now);
      if (taps.length > 1) {
        const intervals = [];
        for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
        const avg = intervals.reduce((a, b) => a + b) / intervals.length;
        setBpm(clamp(Math.round(60000 / avg)));
      }
      if (taps.length > 6) taps.shift();
      // Reset timeout
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = setTimeout(() => setMode("display"), 2000);
      return;
    }
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartBpm.current = bpm;
    hasDragged.current = false;
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStartX.current;
      if (Math.abs(dx) > 2) hasDragged.current = true;
      setBpm(clamp(dragStartBpm.current + Math.round(dx / 3)));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setIsDragging(false);
      if (!hasDragged.current) {
        // Single click → edit mode
        setEditValue(String(bpm));
        setMode("edit");
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [bpm, setBpm, mode]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === "edit") return;
    tapTimesRef.current = [Date.now()];
    setMode("tap");
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => setMode("display"), 2000);
  }, [mode]);

  const confirmEdit = () => {
    const v = parseInt(editValue, 10);
    if (!isNaN(v)) setBpm(clamp(v));
    setMode("display");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") confirmEdit();
    if (e.key === "Escape") setMode("display");
  };

  const handleBlur = () => {
    if (mode === "edit") confirmEdit();
    if (mode === "tap") setMode("display");
  };

  // Pulsing animation for tap mode
  const pulseAnim = mode === "tap" ? "bpmPulse 0.6s ease-in-out infinite" : "none";

  return (
    <>
      <style>{`
        @keyframes bpmPulse {
          0%, 100% { border-color: var(--hihat); }
          50% { border-color: transparent; }
        }
      `}</style>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        tabIndex={0}
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "0 10px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          cursor: mode === "edit" ? "text" : "ew-resize",
          userSelect: "none",
          outline: "none",
          borderTop: mode === "tap" ? "1px solid var(--hihat)" : "none",
          borderBottom: mode === "tap" ? "1px solid var(--hihat)" : "none",
          borderLeft: mode === "tap" ? "1px solid var(--hihat)" : "none",
          borderRight: mode === "tap" ? "1px solid var(--hihat)" : "1px solid rgba(255,255,255,0.08)",
          animation: pulseAnim,
        }}
      >
        {mode === "edit" ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            style={{
              width: 40,
              fontSize: 16,
              fontWeight: 700,
              color: "var(--hihat)",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid var(--hihat)",
              outline: "none",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              padding: 0,
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--hihat)",
              fontFamily: "var(--font-mono)",
              minWidth: 30,
              textAlign: "center",
              textShadow: isDragging ? "0 0 8px var(--hihat)" : "none",
              transition: "text-shadow 0.15s",
            }}
          >
            {bpm}
          </span>
        )}
        <span
          style={{
            fontSize: 8,
            color: mode === "tap" ? "var(--hihat)" : "#666",
            letterSpacing: 1.5,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            textTransform: "uppercase" as const,
          }}
        >
          {mode === "tap" ? "TAP" : "BPM"}
        </span>
      </div>
    </>
  );
}
