"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TRACKS, STEPS, playSound, getAudioContext, getAnalyser, exportToWav, type KitName } from "@/lib/audio";
import { encodeState, decodeState } from "@/lib/url-state";
import { PRESETS } from "@/lib/presets";
import { Visualizer } from "./Visualizer";
import { TrackRow } from "./TrackRow";
import { Controls } from "./Controls";

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
  const [toast, setToast] = useState("");
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const playingRef = useRef(false);
  const stepRef = useRef(-1);
  const bpmRef = useRef(bpm);
  const swingRef = useRef(swing);
  const kitRef = useRef(kit);
  const gridRef = useRef(grid);
  const volumesRef = useRef(volumes);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger mount animations
  useEffect(() => { setMounted(true); }, []);

  // Sync refs
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { swingRef.current = swing; }, [swing]);
  useEffect(() => { kitRef.current = kit; }, [kit]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { volumesRef.current = volumes; }, [volumes]);

  // Load state from URL on mount
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

  // Encode state to URL on change
  const updateURL = useCallback(() => {
    const data = encodeState({
      grid: gridRef.current,
      bpm: bpmRef.current,
      swing: swingRef.current,
      kit: kitRef.current,
      volumes: volumesRef.current,
    });
    window.history.replaceState(null, "", "#" + data);
  }, []);

  useEffect(() => { updateURL(); }, [grid, bpm, swing, kit, volumes, updateURL]);

  // Playback
  const tick = useCallback(() => {
    if (!playingRef.current) return;
    stepRef.current = (stepRef.current + 1) % STEPS;
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
      getAudioContext(); // init
      playingRef.current = true;
      setPlaying(true);
      stepRef.current = -1;
      tick();
    }
  }, [tick]);

  // Keyboard: space to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [togglePlay]);

  const toggleCell = useCallback((r: number, c: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = next[r][c] ? 0 : 1;
      return next;
    });
  }, []);

  const setVolume = useCallback((r: number, v: number) => {
    setVolumes((prev) => {
      const next = [...prev];
      next[r] = v;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setGrid(TRACKS.map(() => new Array(STEPS).fill(0)));
  }, []);

  const randomize = useCallback(() => {
    setGrid(
      TRACKS.map((_, r) => {
        const density = r === 0 ? 0.3 : r === 1 ? 0.2 : r === 2 ? 0.5 : 0.12;
        return new Array(STEPS).fill(0).map(() => (Math.random() < density ? 1 : 0));
      })
    );
  }, []);

  const loadPreset = useCallback((idx: number) => {
    const p = PRESETS[idx];
    setGrid(p.grid.map((r) => [...r]));
    setBpm(p.bpm);
    setSwing(p.swing);
    setKit(p.kit);
    setPresetsOpen(false);
  }, []);

  const shareURL = useCallback(async () => {
    updateURL();
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("Link copied!");
    } catch {
      setToast("Check URL bar!");
    }
    setTimeout(() => setToast(""), 2000);
  }, [updateURL]);

  const handleExport = useCallback(async () => {
    setToast("Rendering...");
    try {
      const blob = await exportToWav(grid, bpm, swing, kit, volumes);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beaturl-${bpm}bpm.wav`;
      a.click();
      URL.revokeObjectURL(url);
      setToast("Exported!");
    } catch {
      setToast("Export failed");
    }
    setTimeout(() => setToast(""), 2000);
  }, [grid, bpm, swing, kit, volumes]);

  // Tap tempo
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
    <div className="min-h-screen flex flex-col items-center px-3 py-8 md:px-6 md:py-14 relative" style={{ zIndex: 2 }}>
      {/* Header */}
      <div className={mounted ? "animate-drop-in" : "opacity-0"}>
        <h1
          className="text-5xl md:text-7xl font-normal mb-1 tracking-wide"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, var(--kick), var(--clap), var(--hihat))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 30px rgba(255, 45, 85, 0.2))",
          }}
        >
          BeatURL
        </h1>
      </div>
      <p
        className={`text-[var(--dim)] text-[9px] md:text-[11px] tracking-[5px] mb-8 uppercase ${mounted ? "animate-fade-up" : "opacity-0"}`}
        style={{ fontFamily: "var(--font-mono)", animationDelay: "0.15s" }}
      >
        encode beats in urls
      </p>

      {/* Visualizer */}
      <div className={`w-full flex justify-center ${mounted ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.25s" }}>
        <Visualizer playing={playing} />
      </div>

      {/* Controls */}
      <div className={`w-full flex justify-center ${mounted ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.35s" }}>
        <Controls
          bpm={bpm}
          setBpm={setBpm}
          swing={swing}
          setSwing={setSwing}
          kit={kit}
          setKit={setKit}
          playing={playing}
          togglePlay={togglePlay}
          clearAll={clearAll}
          randomize={randomize}
          shareURL={shareURL}
          handleExport={handleExport}
          tapTempo={tapTempo}
          presetsOpen={presetsOpen}
          setPresetsOpen={setPresetsOpen}
          loadPreset={loadPreset}
        />
      </div>

      {/* Grid */}
      <div className="w-full max-w-[900px] overflow-x-auto pb-2">
        <div className="min-w-[640px]">
          {TRACKS.map((track, r) => (
            <div
              key={track.key}
              className={mounted ? "animate-slide-in" : "opacity-0"}
              style={{ animationDelay: `${0.4 + r * 0.06}s` }}
            >
              <TrackRow
                track={track}
                row={grid[r]}
                rowIndex={r}
                currentStep={currentStep}
                volume={volumes[r]}
                onToggle={toggleCell}
                onVolumeChange={setVolume}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Step indicators */}
      <div className="w-full max-w-[900px] overflow-x-auto">
        <div className="min-w-[640px] flex pl-[72px] md:pl-[100px] pr-1 gap-[3px] md:gap-1 mt-1">
          {Array.from({ length: STEPS }, (_, i) => (
            <div
              key={i}
              className="flex-1 text-center text-[7px] md:text-[8px] font-medium"
              style={{
                fontFamily: "var(--font-mono)",
                color: currentStep === i ? "var(--hihat)" : i % 4 === 0 ? "var(--dim)" : "transparent",
                textShadow: currentStep === i ? "0 0 8px var(--hihat)" : "none",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Hints */}
      <p
        className={`text-[var(--dim)] text-[8px] md:text-[10px] tracking-[3px] mt-8 ${mounted ? "animate-fade-up" : "opacity-0"}`}
        style={{ fontFamily: "var(--font-mono)", animationDelay: "0.9s" }}
      >
        SPACE = PLAY/STOP · ENTIRE BEAT IS IN THE URL
      </p>

      {/* Footer badge */}
      <div
        className={`mt-6 px-4 py-2 rounded-full border ${mounted ? "animate-fade-up" : "opacity-0"}`}
        style={{
          animationDelay: "1s",
          fontFamily: "var(--font-mono)",
          fontSize: "8px",
          letterSpacing: "1.5px",
          color: "var(--dim)",
          borderColor: "var(--border)",
          background: "rgba(14, 14, 24, 0.5)",
        }}
      >
        MADE WITH WEB AUDIO API · NO DATABASE · BEAT ENCODED IN URL
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 z-50 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
        style={{
          background: "linear-gradient(135deg, var(--hihat), var(--clap))",
          color: "#000",
          fontFamily: "var(--font-mono)",
          boxShadow: "0 4px 20px rgba(0, 229, 255, 0.3)",
        }}
      >
        {toast}
      </div>
    </div>
  );
}
