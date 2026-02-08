# BeatURL 🥁

> **Share beats via URL** — a drum machine that encodes your entire pattern in the URL hash.

Create drum patterns, switch between kits, add swing, and share your beat by simply copying the URL. No account needed, no database, no backend.

## Features

- **16-step sequencer** with 8 tracks (kick, snare, hihat, clap, tom, rim, perc, cowbell)
- **3 drum kits** — 808, Acoustic, Electronic (all synthesized via Web Audio API)
- **URL state** — entire beat (grid, BPM, swing, kit, volumes) encoded in the hash
- **Visual waveform** — real-time frequency visualization reacting to the beat
- **Tap tempo** — tap to set BPM by feel
- **Preset patterns** — 4-on-the-floor, Boom Bap, Trap, Reggaeton, D&B, Bossa Nova
- **Per-track volume** control
- **Export to WAV** — render your pattern as audio using OfflineAudioContext
- **Dark neon aesthetic** with smooth animations
- **Mobile responsive**

## Tech

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Web Audio API (all sounds synthesized, zero samples)

## Development

```bash
pnpm install
pnpm dev
```

## License

MIT
