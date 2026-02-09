<div align="center">

<img src="https://beaturl.vercel.app/icon" width="50" /> 

# BeatURL

A drum machine that encodes your entire beat in the URL. No database. No backend. Just a link.

**[→ beaturl.vercel.app](https://beaturl.vercel.app)**

![BeatURL Screenshot](https://raw.githubusercontent.com/Royal-lobster/beaturl/refs/heads/main/screenshot.png)

</div>

## 🎶 What is this?

BeatURL is a step sequencer that runs entirely in your browser. Every beat you create is encoded directly in the URL hash — copy the link, share it, and anyone who opens it hears your exact pattern instantly.

## ✨ Features

- **8 tracks** — kick, snare, hihat, clap, tom, rim, perc, cowbell
- **6 drum kits** — 808, Acoustic, Electronic, Lo-fi, Industrial, Minimal
- **Variable length** — 1 to 64 bars, add or remove as needed
- **12 presets** — 4-on-the-floor, Boom Bap, Trap, Reggaeton, D&B, Bossa Nova, House, Lo-fi Hip Hop, Industrial, Minimal Techno, Afrobeat, Disco
- **Click & drag painting** — click and drag across cells to paint or erase patterns
- **Sound preview** — hear each sound instantly when toggling a cell on
- **Undo / redo** — Ctrl+Z / Ctrl+Shift+Z with full history (drag strokes count as one step)
- **BPM scrub control** — drag to scrub, click to type, scroll to nudge, double-click for tap tempo
- **Zoom in/out** — buttons or trackpad pinch
- **Per-track volume** — tap the track label to cycle levels
- **Live visualizer** — full-screen frequency visualizer reacts to your beat in real-time
- **Responsive toolbar** — fluid layout adapts from mobile to tablet to desktop
- **WAV export** — render your pattern as audio via OfflineAudioContext
- **URL sharing** — the entire state (grid, BPM, swing, kit, volumes, bar count) lives in the URL hash

## 🔊 No Samples

All drum sounds are synthesized in real-time using the Web Audio API — oscillators, noise generators, filters, and waveshapers. Zero audio files are loaded.

## 🔗 URL Encoding

The entire beat state is compressed into the URL hash using **adaptive arithmetic coding** — an information-theoretic compression technique that gets within 1–2 bytes of the Shannon entropy limit for beat pattern data.

### Format

The hash is a base64url-encoded binary payload:

```
Byte 0:    bpm - 40              (0–200 → BPM 40–240)
Byte 1:    swing                 (0–80)
Byte 2:    kitIdx | volFlag<<7   (bit 7 = all volumes are default 80)
Byte 3:    stepCount / 4         (1–64 → 4–256 steps)
Bytes 4–11: volumes              (only present if volFlag = 0)
Remaining:  arithmetic-coded grid bitstream
```

### How it works

The grid (8 tracks × N steps of on/off cells) is compressed with an **order-2 adaptive arithmetic coder**:

1. Each track is encoded bit-by-bit, using the previous 2 bits as context
2. The coder maintains per-context probability tables that adapt as it encodes (starting from a Laplace [1,1] prior)
3. A 48-bit BigInt range coder converts these probabilities into a near-optimal bitstream

A typical 16-step beat compresses to just **22 characters**.

Copy the URL → share it → anyone hears your beat.

> **Deep dive:** [COMPRESSION.md](./COMPRESSION.md) — the information theory, algorithm comparisons, and benchmarks behind this encoding.

## 🛠️ Tech

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Web Audio API
- Deployed on Vercel

## 🚀 Development

```bash
pnpm install
pnpm dev
````

Open [localhost:3000](http://localhost:3000).

## 📄 License

MIT
