import { TRACKS, STEPS, type KitName } from "./audio";

export interface BeatState {
  grid: number[][];
  bpm: number;
  swing: number;
  kit: KitName;
  volumes: number[];
}

const KIT_INDEX: KitName[] = ["808", "acoustic", "electronic"];

export function encodeState(state: BeatState): string {
  const gridNums = state.grid.map((row) => {
    let n = 0;
    row.forEach((v, i) => { if (v) n |= 1 << i; });
    return n;
  });
  // volumes: encode as integers 0-100
  const vols = state.volumes.map((v) => Math.round(v * 100));
  const kitIdx = KIT_INDEX.indexOf(state.kit);
  const data = [state.bpm, state.swing, kitIdx, ...gridNums, ...vols].join(".");
  return data;
}

export function decodeState(hash: string): BeatState | null {
  if (!hash) return null;
  try {
    const parts = hash.split(".").map(Number);
    const trackCount = TRACKS.length;
    // bpm, swing, kitIdx, [trackCount grid nums], [trackCount volumes]
    if (parts.length < 3 + trackCount) return null;

    const bpm = Math.max(40, Math.min(240, parts[0] || 120));
    const swing = Math.max(0, Math.min(80, parts[1] || 0));
    const kitIdx = parts[2] ?? 0;
    const kit = KIT_INDEX[kitIdx] || "808";

    const grid: number[][] = [];
    for (let r = 0; r < trackCount; r++) {
      const n = parts[3 + r] || 0;
      const row: number[] = [];
      for (let c = 0; c < STEPS; c++) row.push((n >> c) & 1);
      grid.push(row);
    }

    const volumes: number[] = [];
    for (let r = 0; r < trackCount; r++) {
      const v = parts[3 + trackCount + r];
      volumes.push(v !== undefined && !isNaN(v) ? v / 100 : 0.8);
    }

    return { grid, bpm, swing, kit, volumes };
  } catch {
    return null;
  }
}
