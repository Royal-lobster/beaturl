import { TRACKS, STEPS } from "./audio";
import type { KitName } from "./audio";

export interface Preset {
  name: string;
  bpm: number;
  swing: number;
  kit: KitName;
  grid: number[][];
}

// Helper: convert step indices to a row array
function row(steps: number[]): number[] {
  const r = new Array(STEPS).fill(0);
  steps.forEach((s) => (r[s] = 1));
  return r;
}

function emptyRow(): number[] {
  return new Array(STEPS).fill(0);
}

export const PRESETS: Preset[] = [
  {
    name: "4 on the Floor",
    bpm: 128,
    swing: 0,
    kit: "electronic",
    grid: [
      row([0, 4, 8, 12]),        // kick
      row([4, 12]),               // snare
      row([0, 2, 4, 6, 8, 10, 12, 14]), // hihat
      emptyRow(),                 // clap
      emptyRow(),                 // tom
      emptyRow(),                 // rim
      emptyRow(),                 // perc
      emptyRow(),                 // cowbell
    ],
  },
  {
    name: "Boom Bap",
    bpm: 90,
    swing: 40,
    kit: "808",
    grid: [
      row([0, 5, 8, 13]),        // kick
      row([4, 12]),               // snare
      row([0, 2, 4, 6, 8, 10, 12, 14]), // hihat
      emptyRow(),
      emptyRow(),
      row([2, 10]),               // rim
      emptyRow(),
      emptyRow(),
    ],
  },
  {
    name: "Trap",
    bpm: 140,
    swing: 0,
    kit: "808",
    grid: [
      row([0, 7, 8]),             // kick
      row([4, 12]),               // snare
      row([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]), // hihat
      row([4, 12]),               // clap
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
    ],
  },
  {
    name: "Reggaeton",
    bpm: 100,
    swing: 0,
    kit: "808",
    grid: [
      row([0, 3, 4, 7, 8, 11, 12, 15]), // kick (dembow)
      row([4, 12]),
      row([0, 2, 4, 6, 8, 10, 12, 14]),
      row([3, 7, 11, 15]),        // clap on offbeats
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
    ],
  },
  {
    name: "Drum & Bass",
    bpm: 174,
    swing: 0,
    kit: "electronic",
    grid: [
      row([0, 6, 10]),            // kick
      row([4, 12]),               // snare
      row([0, 2, 4, 6, 8, 10, 12, 14]),
      emptyRow(),
      emptyRow(),
      row([3, 11]),
      emptyRow(),
      emptyRow(),
    ],
  },
  {
    name: "Bossa Nova",
    bpm: 110,
    swing: 30,
    kit: "acoustic",
    grid: [
      row([0, 6, 10]),
      row([4, 12]),
      row([0, 3, 4, 6, 8, 10, 12, 14]),
      emptyRow(),
      emptyRow(),
      row([2, 5, 8, 13]),
      emptyRow(),
      row([0, 4, 8, 12]),
    ],
  },
];
