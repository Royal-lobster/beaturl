# BeatURL

> A drum machine that encodes your entire beat in the URL. No database. No backend. Just a link.

**[→ beaturl.vercel.app](https://beaturl.vercel.app)**

## What is this?

BeatURL is a step sequencer that runs entirely in your browser. Every beat you create is encoded directly in the URL hash — copy the link, share it, and anyone who opens it hears your exact pattern instantly.

## Features

- **8 tracks** — kick, snare, hihat, clap, tom, rim, perc, cowbell
- **6 drum kits** — 808, Acoustic, Electronic, Lo-fi, Industrial, Minimal
- **Variable length** — 1 to 64 bars, add or remove as needed
- **12 presets** — 4-on-the-floor, Boom Bap, Trap, Reggaeton, D&B, Bossa Nova, House, Lo-fi Hip Hop, Industrial, Minimal Techno, Afrobeat, Disco
- **BPM scrub control** — drag to scrub, click to type, scroll to nudge, double-click for tap tempo
- **Zoom in/out** — buttons or trackpad pinch
- **Per-track volume** — tap the track label to cycle levels
- **WAV export** — render your pattern as audio via OfflineAudioContext
- **URL sharing** — the entire state (grid, BPM, swing, kit, volumes, bar count) lives in the URL hash

## No Samples

All drum sounds are synthesized in real-time using the Web Audio API — oscillators, noise generators, filters, and waveshapers. Zero audio files are loaded.

## URL Encoding

The URL hash contains everything:

```
#120.0.2.16.ff03.0c00.ffff.0000.0000.0000.0000.0000.80.80.80.80.80.80.80.80
 │   │ │ │   │     └─ track grid data (hex-encoded bitfields)
 │   │ │ │   └─ kick pattern
 │   │ │ └─ step count
 │   │ └─ kit index
 │   └─ swing
 └─ BPM
```

Copy the URL → share it → anyone hears your beat.

## Tech

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Web Audio API
- Deployed on Vercel

## Development

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

## License

MIT
