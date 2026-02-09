import { TRACKS, STEPS, type KitName } from "./audio";

export interface BeatState {
  grid: number[][];
  bpm: number;
  swing: number;
  kit: KitName;
  volumes: number[];
  stepCount: number;
}

const KIT_INDEX: KitName[] = ["808", "acoustic", "electronic", "lofi", "industrial", "minimal"];
const TRACK_COUNT = 8;
const DEFAULT_VOLUME = 80;

// ── Base64url helpers ──────────────────────────────────────────────

function toBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (padded.length % 4)) % 4;
  const b64 = padded + "===".slice(0, pad);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── Adaptive arithmetic coder (order-2, bit-level, 48-bit BigInt) ──

const PRECISION = 48n;
const WHOLE = 1n << PRECISION;
const HALF = WHOLE >> 1n;
const QUARTER = WHOLE >> 2n;

type ContextModel = Map<string, [number, number]>;

function getProbs(model: ContextModel, ctx: string): [number, number] {
  return model.get(ctx) ?? [1, 1];
}

function updateModel(model: ContextModel, ctx: string, bit: number) {
  const counts = model.get(ctx);
  if (counts) {
    counts[bit]++;
  } else {
    const entry: [number, number] = [1, 1];
    entry[bit]++;
    model.set(ctx, entry);
  }
}

function arithmeticEncode(grid: number[][]): Uint8Array {
  const trackCount = grid.length;
  const stepCount = trackCount > 0 ? grid[0].length : 0;
  if (stepCount === 0) return new Uint8Array(0);

  let lo = 0n;
  let hi = WHOLE;
  let pending = 0;
  const outBits: number[] = [];

  function emitBit(b: number) {
    outBits.push(b);
    while (pending > 0) {
      outBits.push(b ^ 1);
      pending--;
    }
  }

  function encodeBit(bit: number, p0: number, total: number) {
    const range = hi - lo;
    const mid = lo + (range * BigInt(p0)) / BigInt(total);
    if (bit === 0) {
      hi = mid;
    } else {
      lo = mid;
    }

    for (;;) {
      if (hi <= HALF) {
        emitBit(0);
        lo = lo << 1n;
        hi = hi << 1n;
      } else if (lo >= HALF) {
        emitBit(1);
        lo = (lo - HALF) << 1n;
        hi = (hi - HALF) << 1n;
      } else if (lo >= QUARTER && hi <= HALF + QUARTER) {
        pending++;
        lo = (lo - QUARTER) << 1n;
        hi = (hi - QUARTER) << 1n;
      } else {
        break;
      }
    }
  }

  for (let t = 0; t < trackCount; t++) {
    const model: ContextModel = new Map();
    let prev2 = 0;
    let prev1 = 0;

    for (let s = 0; s < stepCount; s++) {
      const bit = grid[t][s] ? 1 : 0;
      const ctx = s < 2 ? "S" : `${prev2}${prev1}`;
      const [c0, c1] = getProbs(model, ctx);
      const total = c0 + c1;

      encodeBit(bit, c0, total);
      updateModel(model, ctx, bit);

      prev2 = prev1;
      prev1 = bit;
    }
  }

  pending++;
  emitBit(lo >= QUARTER ? 1 : 0);

  const byteCount = Math.ceil(outBits.length / 8);
  const out = new Uint8Array(byteCount);
  for (let i = 0; i < outBits.length; i++) {
    if (outBits[i]) out[i >> 3] |= 1 << (7 - (i & 7));
  }
  return out;
}

function arithmeticDecode(data: Uint8Array, trackCount: number, stepCount: number): number[][] {
  if (stepCount === 0) return Array.from({ length: trackCount }, () => []);

  const totalBits = data.length * 8;
  let bitPos = 0;

  function readBit(): number {
    if (bitPos >= totalBits) return 0;
    const byte = data[bitPos >> 3];
    const bit = (byte >> (7 - (bitPos & 7))) & 1;
    bitPos++;
    return bit;
  }

  let lo = 0n;
  let hi = WHOLE;
  let value = 0n;
  for (let i = 0; i < PRECISION; i++) {
    value = (value << 1n) | BigInt(readBit());
  }

  function decodeBit(p0: number, total: number): number {
    const range = hi - lo;
    const mid = lo + (range * BigInt(p0)) / BigInt(total);
    const bit = value >= mid ? 1 : 0;

    if (bit === 0) {
      hi = mid;
    } else {
      lo = mid;
    }

    for (;;) {
      if (hi <= HALF) {
        lo = lo << 1n;
        hi = hi << 1n;
        value = (value << 1n) | BigInt(readBit());
      } else if (lo >= HALF) {
        lo = (lo - HALF) << 1n;
        hi = (hi - HALF) << 1n;
        value = ((value - HALF) << 1n) | BigInt(readBit());
      } else if (lo >= QUARTER && hi <= HALF + QUARTER) {
        lo = (lo - QUARTER) << 1n;
        hi = (hi - QUARTER) << 1n;
        value = ((value - QUARTER) << 1n) | BigInt(readBit());
      } else {
        break;
      }
    }

    return bit;
  }

  const grid: number[][] = [];
  for (let t = 0; t < trackCount; t++) {
    const model: ContextModel = new Map();
    let prev2 = 0;
    let prev1 = 0;
    const row: number[] = [];

    for (let s = 0; s < stepCount; s++) {
      const ctx = s < 2 ? "S" : `${prev2}${prev1}`;
      const [c0, c1] = getProbs(model, ctx);
      const total = c0 + c1;

      const bit = decodeBit(c0, total);
      updateModel(model, ctx, bit);
      row.push(bit);

      prev2 = prev1;
      prev1 = bit;
    }
    grid.push(row);
  }

  return grid;
}

// ── Old format helpers (kept for decode backwards-compat) ──────────

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

// ── Encode (new arithmetic format) ────────────────────────────────

export function encodeState(state: BeatState): string {
  const kitIdx = KIT_INDEX.indexOf(state.kit);
  const volsInt = state.volumes.map((v) => Math.round(v * 100));
  const allDefault = volsInt.every((v) => v === DEFAULT_VOLUME);
  const volFlag = allDefault ? 1 : 0;

  const headerSize = 4 + (allDefault ? 0 : TRACK_COUNT);
  const gridBytes = arithmeticEncode(state.grid);
  const buf = new Uint8Array(headerSize + gridBytes.length);

  buf[0] = Math.max(0, Math.min(200, state.bpm - 40));
  buf[1] = Math.max(0, Math.min(80, state.swing));
  buf[2] = (kitIdx & 0x7f) | (volFlag << 7);
  buf[3] = Math.max(1, Math.min(64, state.stepCount / 4));

  if (!allDefault) {
    for (let i = 0; i < TRACK_COUNT; i++) {
      buf[4 + i] = Math.max(0, Math.min(100, volsInt[i] ?? DEFAULT_VOLUME));
    }
  }

  buf.set(gridBytes, headerSize);
  return toBase64url(buf);
}

// ── Decode (auto-detects format) ──────────────────────────────────

export function decodeState(hash: string): BeatState | null {
  if (!hash) return null;
  try {
    if (!hash.includes(".")) {
      return decodeArithmeticFormat(hash);
    }
    return decodeOldFormat(hash);
  } catch {
    return null;
  }
}

function decodeArithmeticFormat(hash: string): BeatState | null {
  const buf = fromBase64url(hash);
  if (buf.length < 4) return null;

  const bpm = (buf[0] + 40) | 0;
  const swing = buf[1];
  const volFlag = (buf[2] >> 7) & 1;
  const kitIdx = buf[2] & 0x7f;
  const kit = KIT_INDEX[kitIdx] || "808";
  const stepCount = buf[3] * 4;

  if (stepCount < 4 || stepCount > 256) return null;

  let offset = 4;
  const volumes: number[] = [];
  if (volFlag === 0) {
    for (let i = 0; i < TRACK_COUNT; i++) {
      volumes.push((buf[offset + i] ?? DEFAULT_VOLUME) / 100);
    }
    offset += TRACK_COUNT;
  } else {
    for (let i = 0; i < TRACK_COUNT; i++) volumes.push(DEFAULT_VOLUME / 100);
  }

  const gridData = buf.slice(offset);
  const grid = arithmeticDecode(gridData, TRACK_COUNT, stepCount);

  return {
    grid,
    bpm: Math.max(40, Math.min(240, bpm)),
    swing: Math.max(0, Math.min(80, swing)),
    kit,
    volumes,
    stepCount,
  };
}

function decodeOldFormat(hash: string): BeatState | null {
  const parts = hash.split(".");
  const trackCount = TRACKS.length;

  const maybeStepCount = Number(parts[3]);
  if (parts.length >= 4 + trackCount && maybeStepCount >= 4 && maybeStepCount <= 256 && maybeStepCount % 4 === 0 && /^[0-9a-f]+$/i.test(parts[4])) {
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
}
