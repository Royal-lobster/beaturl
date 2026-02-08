import { TRACKS, STEPS, type KitName } from "./audio";

export interface BeatState {
  grid: number[][];
  bpm: number;
  swing: number;
  kit: KitName;
  volumes: number[];
  stepCount: number;
}

const KIT_INDEX: KitName[] = ["808", "acoustic", "electronic"];

// Convert a row of 0/1 values to a hex string
function rowToHex(row: number[]): string {
  // Each 4 bits = 1 hex char, MSB first within each nibble
  const bytes = Math.ceil(row.length / 4);
  let hex = "";
  for (let i = 0; i < bytes; i++) {
    let nibble = 0;
    for (let b = 0; b < 4; b++) {
      const idx = i * 4 + b;
      if (idx < row.length && row[idx]) nibble |= 1 << b;
    }
    hex += nibble.toString(16);
  }
  return hex;
}

// Convert hex string back to a row of 0/1 values
function hexToRow(hex: string, stepCount: number): number[] {
  const row: number[] = new Array(stepCount).fill(0);
  for (let i = 0; i < hex.length; i++) {
    const nibble = parseInt(hex[i], 16);
    for (let b = 0; b < 4; b++) {
      const idx = i * 4 + b;
      if (idx < stepCount) row[idx] = (nibble >> b) & 1;
    }
  }
  return row;
}

export function encodeState(state: BeatState): string {
  const kitIdx = KIT_INDEX.indexOf(state.kit);
  const hexRows = state.grid.map((row) => rowToHex(row));
  const vols = state.volumes.map((v) => Math.round(v * 100));
  const parts = [state.bpm, state.swing, kitIdx, state.stepCount, ...hexRows, ...vols];
  return parts.join(".");
}

export function decodeState(hash: string): BeatState | null {
  if (!hash) return null;
  try {
    const parts = hash.split(".");
    const trackCount = TRACKS.length;

    // Try new format: bpm.swing.kitIdx.stepCount.hexRows...vols...
    // Detect: if parts[3] looks like a step count (number 4-64, divisible by 4)
    // and parts[4] contains hex chars
    const maybeStepCount = Number(parts[3]);
    if (parts.length >= 4 + trackCount && maybeStepCount >= 4 && maybeStepCount <= 64 && maybeStepCount % 4 === 0 && /^[0-9a-f]+$/i.test(parts[4])) {
      // New hex format
      const bpm = Math.max(40, Math.min(240, Number(parts[0]) || 120));
      const swing = Math.max(0, Math.min(80, Number(parts[1]) || 0));
      const kitIdx = Number(parts[2]) ?? 0;
      const kit = KIT_INDEX[kitIdx] || "808";
      const stepCount = maybeStepCount;

      const grid: number[][] = [];
      for (let r = 0; r < trackCount; r++) {
        grid.push(hexToRow(parts[4 + r] || "", stepCount));
      }

      const volumes: number[] = [];
      for (let r = 0; r < trackCount; r++) {
        const v = Number(parts[4 + trackCount + r]);
        volumes.push(!isNaN(v) ? v / 100 : 0.8);
      }

      return { grid, bpm, swing, kit, volumes, stepCount };
    }

    // Legacy format: bpm.swing.kitIdx.gridNum0...gridNumN.vol0...volN
    const nums = parts.map(Number);
    if (nums.length < 3 + trackCount) return null;

    const bpm = Math.max(40, Math.min(240, nums[0] || 120));
    const swing = Math.max(0, Math.min(80, nums[1] || 0));
    const kitIdx = nums[2] ?? 0;
    const kit = KIT_INDEX[kitIdx] || "808";

    const grid: number[][] = [];
    for (let r = 0; r < trackCount; r++) {
      const n = nums[3 + r] || 0;
      const row: number[] = [];
      for (let c = 0; c < STEPS; c++) row.push((n >> c) & 1);
      grid.push(row);
    }

    const volumes: number[] = [];
    for (let r = 0; r < trackCount; r++) {
      const v = nums[3 + trackCount + r];
      volumes.push(v !== undefined && !isNaN(v) ? v / 100 : 0.8);
    }

    return { grid, bpm, swing, kit, volumes, stepCount: STEPS };
  } catch {
    return null;
  }
}
