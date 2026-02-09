"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TRACKS, STEPS, playSound, getAudioContext, getAnalyser, exportToWav, type KitName } from "@/lib/audio";
import { encodeState, decodeState } from "@/lib/url-state";
import { PRESETS } from "@/lib/presets";
import { Visualizer } from "./Visualizer";
import { TrackRow } from "./TrackRow";
import { Controls } from "./Controls";
import { ToastContainer, toastManager } from "./Toast";

const DEFAULT_VOLUMES = TRACKS.map(() => 0.8);

export function Sequencer() {
  const [grid, setGrid] = useState<number[][]>(() =>
    TRACKS.map(() => new Array(STEPS).fill(0))
  );
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(0);
  const [kit, setKit] = useState<KitName>("808");
  const [volumes, setVolumes] = useState<number[]>([...DEFAULT_VOLUMES]);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [zoom, setZoom] = useState(1); // 1 = default (fit), >1 = zoomed in, <1 = zoomed out
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const stepCount = grid[0]?.length || STEPS;

  // Undo/redo history
  const undoStackRef = useRef<number[][][]>([]);
  const redoStackRef = useRef<number[][][]>([]);
  const MAX_UNDO = 50;

  const updateUndoRedoFlags = useCallback(() => {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  const setGridWithHistory = useCallback((updater: number[][] | ((prev: number[][]) => number[][])) => {
    setGrid((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next === prev) return prev;
      undoStackRef.current.push(prev.map((r) => [...r]));
      if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift();
      redoStackRef.current = [];
      updateUndoRedoFlags();
      return next;
    });
  }, [updateUndoRedoFlags]);

  const undo = useCallback(() => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const prev = stack.pop()!;
    redoStackRef.current.push(gridRef.current.map((r) => [...r]));
    setGrid(prev);
    updateUndoRedoFlags();
  }, [updateUndoRedoFlags]);

  const redo = useCallback(() => {
    const stack = redoStackRef.current;
    if (stack.length === 0) return;
    const next = stack.pop()!;
    undoStackRef.current.push(gridRef.current.map((r) => [...r]));
    setGrid(next);
    updateUndoRedoFlags();
  }, [updateUndoRedoFlags]);

  const playingRef = useRef(false);
  const stepRef = useRef(-1);
  const bpmRef = useRef(bpm);
  const swingRef = useRef(swing);
  const kitRef = useRef(kit);
  const gridRef = useRef(grid);
  const volumesRef = useRef(volumes);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { swingRef.current = swing; }, [swing]);
  useEffect(() => { kitRef.current = kit; }, [kit]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { volumesRef.current = volumes; }, [volumes]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const state = decodeState(hash);
      if (state) {
        setGrid(state.grid);
        setBpm(state.bpm);
        setSwing(state.swing);
        setKit(state.kit);
        setVolumes(state.volumes);
      }
    }
  }, []);

  const updateURL = useCallback(() => {
    const g = gridRef.current;
    const data = encodeState({
      grid: g,
      bpm: bpmRef.current,
      swing: swingRef.current,
      kit: kitRef.current,
      volumes: volumesRef.current,
      stepCount: g[0]?.length || STEPS,
    });
    window.history.replaceState(null, "", "#" + data);
  }, []);

  useEffect(() => { updateURL(); }, [grid, bpm, swing, kit, volumes, updateURL]);

  const tick = useCallback(() => {
    if (!playingRef.current) return;
    const steps = gridRef.current[0]?.length || STEPS;
    stepRef.current = (stepRef.current + 1) % steps;
    const s = stepRef.current;
    setCurrentStep(s);

    const t = getAudioContext().currentTime;
    TRACKS.forEach((track, r) => {
      if (gridRef.current[r][s]) {
        playSound(kitRef.current, track.key, t, volumesRef.current[r]);
      }
    });

    const baseMs = 60000 / (bpmRef.current * 4);
    const swingOffset = s % 2 === 0 ? 0 : baseMs * (swingRef.current / 100) * 0.66;
    timerRef.current = setTimeout(tick, baseMs + swingOffset);
  }, []);

  const togglePlay = useCallback(() => {
    if (playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
      setCurrentStep(-1);
      stepRef.current = -1;
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      getAudioContext();
      playingRef.current = true;
      setPlaying(true);
      stepRef.current = -1;
      tick();
    }
  }, [tick]);

  const jumpToStep = useCallback((step: number) => {
    if (!playingRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    stepRef.current = step - 1; // tick will increment
    tick();
  }, [tick]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [togglePlay, undo, redo]);

  // Drawing state for click-and-drag
  const drawingRef = useRef<{ active: boolean; mode: number | null; snapshot: number[][] | null }>({ active: false, mode: null, snapshot: null });

  const toggleCell = useCallback((r: number, c: number) => {
    setGridWithHistory((prev) => {
      const next = prev.map((row) => [...row]);
      const wasOn = next[r][c];
      next[r][c] = wasOn ? 0 : 1;
      if (!wasOn) {
        const t = getAudioContext().currentTime;
        playSound(kitRef.current, TRACKS[r].key, t, volumesRef.current[r]);
      }
      return next;
    });
  }, [setGridWithHistory]);

  const setCellRaw = useCallback((r: number, c: number, value: number) => {
    setGrid((prev) => {
      if (prev[r][c] === value) return prev;
      const next = prev.map((row) => [...row]);
      next[r][c] = value;
      if (value === 1) {
        const t = getAudioContext().currentTime;
        playSound(kitRef.current, TRACKS[r].key, t, volumesRef.current[r]);
      }
      return next;
    });
  }, []);

  const handleCellPointerDown = useCallback((r: number, c: number) => {
    // Save snapshot for undo before drag starts
    const snapshot = gridRef.current.map((row) => [...row]);
    const currentVal = gridRef.current[r][c];
    const newVal = currentVal ? 0 : 1;
    drawingRef.current = { active: true, mode: newVal, snapshot };
    setCellRaw(r, c, newVal);
  }, [setCellRaw]);

  const handleCellPointerEnter = useCallback((r: number, c: number) => {
    if (drawingRef.current.active && drawingRef.current.mode !== null) {
      setCellRaw(r, c, drawingRef.current.mode);
    }
  }, [setCellRaw]);

  useEffect(() => {
    const stop = () => {
      if (drawingRef.current.active && drawingRef.current.snapshot) {
        undoStackRef.current.push(drawingRef.current.snapshot);
        if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift();
        redoStackRef.current = [];
        updateUndoRedoFlags();
      }
      drawingRef.current = { active: false, mode: null, snapshot: null };
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const setVolume = useCallback((r: number, v: number) => {
    setVolumes((prev) => {
      const next = [...prev];
      next[r] = v;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setGridWithHistory((prev) => TRACKS.map(() => new Array(prev[0].length).fill(0)));
  }, [setGridWithHistory]);

  const randomize = useCallback(() => {
    setGridWithHistory((prev) => {
      const len = prev[0].length;
      return TRACKS.map((_, r) => {
        const density = r === 0 ? 0.3 : r === 1 ? 0.2 : r === 2 ? 0.5 : 0.12;
        return new Array(len).fill(0).map(() => (Math.random() < density ? 1 : 0));
      });
    });
  }, [setGridWithHistory]);

  const loadPreset = useCallback((idx: number) => {
    const p = PRESETS[idx];
    setGridWithHistory(p.grid.map((r) => [...r]));
    setBpm(p.bpm);
    setSwing(p.swing);
    setKit(p.kit);
    toastManager.add({ title: `Loaded: ${p.name}` });
  }, [setGridWithHistory]);

  const addBar = useCallback(() => {
    setGridWithHistory((prev) => {
      const currentLen = prev[0].length;
      if (currentLen >= 256) return prev;
      return prev.map((row) => [...row, 0, 0, 0, 0]);
    });
  }, [setGridWithHistory]);

  const removeBar = useCallback(() => {
    setGridWithHistory((prev) => {
      const currentLen = prev[0].length;
      if (currentLen <= 4) return prev;
      return prev.map((row) => row.slice(0, currentLen - 4));
    });
  }, [setGridWithHistory]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(3, z + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.25, z - 0.25));
  }, []);

  // Trackpad pinch-to-zoom handler
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) handleZoomIn();
        else handleZoomOut();
      }
    };
    document.addEventListener('wheel', handler, { passive: false });
    return () => document.removeEventListener('wheel', handler);
  }, [handleZoomIn, handleZoomOut]);

  // Calculate cell min-width based on zoom. Always enforce a minimum so cells stay usable.
  const MIN_CELL_PX = 10;
  const cellMinWidth = Math.max(MIN_CELL_PX, Math.round(40 * zoom));

  const shareURL = useCallback(async () => {
    updateURL();
    try {
      await navigator.clipboard.writeText(window.location.href);
      toastManager.add({ title: "Link copied to clipboard!" });
    } catch {
      toastManager.add({ title: "Check URL bar for your beat link" });
    }
  }, [updateURL]);

  const handleExport = useCallback(async () => {
    toastManager.add({ title: "Rendering WAV..." });
    try {
      const blob = await exportToWav(grid, bpm, swing, kit, volumes);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beaturl-${bpm}bpm.wav`;
      a.click();
      URL.revokeObjectURL(url);
      toastManager.add({ title: "WAV exported!" });
    } catch {
      toastManager.add({ title: "Export failed" });
    }
  }, [grid, bpm, swing, kit, volumes]);

  const tapTimesRef = useRef<number[]>([]);
  const tapTempo = useCallback(() => {
    const now = Date.now();
    const taps = tapTimesRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      tapTimesRef.current = [];
    }
    taps.push(now);
    if (taps.length > 1) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
      const avg = intervals.reduce((a, b) => a + b) / intervals.length;
      const newBpm = Math.round(60000 / avg);
      setBpm(Math.max(40, Math.min(240, newBpm)));
    }
    if (taps.length > 6) taps.shift();
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Visualizer as full-screen background */}
      <Visualizer playing={playing} fullScreen />

      {/* Toolbar */}
      <Controls
        bpm={bpm} setBpm={setBpm}
        swing={swing} setSwing={setSwing}
        kit={kit} setKit={setKit}
        playing={playing} togglePlay={togglePlay}
        clearAll={clearAll} randomize={randomize}
        shareURL={shareURL} handleExport={handleExport}
        loadPreset={loadPreset}
        stepCount={stepCount}
        onAddBar={addBar} onRemoveBar={removeBar}
        zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut}
        onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo}
      />

      {/* Grid area */}
      <div className="flex-1 relative overflow-x-auto overflow-y-hidden p-0">
        <div style={{ minWidth: "100%", width: "max-content" }}>
        {/* Step indicators top */}
        <div className="flex h-4 shrink-0" style={{ position: "relative", zIndex: 1 }}>
          <div className="w-[50px] md:w-[70px] shrink-0 z-10" style={{ background: "#0e0e1a", position: "sticky", left: 0, borderRight: "1px solid rgba(255,255,255,0.04)" }} />
          <div className="flex-1 flex gap-px px-px">
            {Array.from({ length: stepCount }, (_, i) => {
              const effectiveCellWidth = cellMinWidth || (typeof window !== "undefined" ? (window.innerWidth - 70) / stepCount : 40);
              const showEvery = effectiveCellWidth < 12 ? 16 : effectiveCellWidth < 18 ? 8 : effectiveCellWidth < 28 ? 4 : 1;
              const showLabel = i % showEvery === 0 || currentStep === i;

              return (
                <div
                  key={i}
                  className="flex-1 text-center text-[7px] md:text-[8px] leading-4 overflow-hidden cursor-pointer select-none"
                  onClick={() => jumpToStep(i)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    minWidth: cellMinWidth ? `${cellMinWidth}px` : undefined,
                    color: currentStep === i ? "var(--hihat)" : i % 4 === 0 ? "var(--dim)" : "rgba(255,255,255,0.15)",
                    textShadow: currentStep === i ? "0 0 8px var(--hihat)" : "none",
                  }}
                >
                  {showLabel ? i + 1 : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Track rows */}
        <div className="flex flex-col" style={{ zIndex: 1, height: "calc(100% - 16px)" }}>
          {TRACKS.map((track, r) => (
            <TrackRow
              key={track.key}
              track={track}
              row={grid[r]}
              rowIndex={r}
              currentStep={currentStep}
              volume={volumes[r]}
              onToggle={toggleCell}
              onPointerDown={handleCellPointerDown}
              onPointerEnter={handleCellPointerEnter}
              onVolumeChange={setVolume}
              cellMinWidth={cellMinWidth}
            />
          ))}
        </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
