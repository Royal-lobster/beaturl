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
  {
    name: "House",
    bpm: 128,
    swing: 0,
    kit: "electronic",
    grid: [
      row([0, 4, 8, 12]),              // kick: four on the floor
      row([4, 12]),                     // snare on 2 & 4
      row([0, 2, 4, 6, 8, 10, 12, 14]),// hihats 8ths
      row([4, 12]),                     // clap layered with snare
      emptyRow(),
      emptyRow(),
      row([3, 7, 11, 15]),             // perc offbeats
      emptyRow(),
    ],
  },
  {
    name: "Lo-fi Hip Hop",
    bpm: 75,
    swing: 50,
    kit: "lofi",
    grid: [
      row([0, 5, 8, 13]),              // kick: lazy boom bap
      row([4, 12]),                     // snare on 2 & 4
      row([0, 2, 4, 6, 8, 10, 12, 14]),// hihats
      emptyRow(),
      emptyRow(),
      row([2, 10]),                     // rim ghost notes
      row([6, 14]),                     // perc texture
      emptyRow(),
    ],
  },
  {
    name: "Industrial",
    bpm: 135,
    swing: 0,
    kit: "industrial",
    grid: [
      row([0, 3, 4, 8, 11, 12]),       // kick: aggressive, syncopated
      row([4, 12]),                     // snare hits
      row([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]), // hihat: relentless
      row([2, 6, 10, 14]),             // clap: offbeat stabs
      row([7, 15]),                     // tom accents
      row([1, 5, 9, 13]),             // rim: metallic pings
      row([3, 11]),                     // perc FM blips
      emptyRow(),
    ],
  },
  {
    name: "Minimal Techno",
    bpm: 130,
    swing: 0,
    kit: "minimal",
    grid: [
      row([0, 4, 8, 12]),              // kick: steady
      emptyRow(),                       // no snare
      row([2, 6, 10, 14]),             // hihat: offbeats only
      row([4]),                         // clap: single hit per bar
      emptyRow(),
      row([7]),                         // rim: sparse accent
      row([3, 11]),                     // perc: hypnotic blips
      emptyRow(),
    ],
  },
  {
    name: "Afrobeat",
    bpm: 110,
    swing: 30,
    kit: "acoustic",
    grid: [
      row([0, 5, 8, 10, 14]),          // kick: complex
      row([4, 12]),                     // snare
      row([0, 1, 3, 4, 6, 8, 9, 11, 12, 14]), // hihat: dense
      row([4, 12]),                     // clap with snare
      row([7, 15]),                     // tom fills
      row([2, 6, 10, 13]),             // rim: shaker-like
      row([1, 5, 9, 13]),             // perc: clave pattern
      row([0, 3, 8, 11]),             // cowbell: bell pattern
    ],
  },
  {
    name: "Disco",
    bpm: 120,
    swing: 0,
    kit: "acoustic",
    grid: [
      row([0, 4, 8, 12]),              // kick: four on the floor
      row([4, 12]),                     // snare on 2 & 4
      row([1, 3, 5, 7, 9, 11, 13, 15]),// hihat: offbeats (open feel)
      emptyRow(),
      emptyRow(),
      emptyRow(),
      row([0, 4, 8, 12]),             // perc: on the beat
      row([2, 6, 10, 14]),            // cowbell: offbeats
    ],
  },
];
