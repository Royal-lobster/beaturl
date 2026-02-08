# 🥁 BeatURL

A step sequencer / drum machine where the entire beat is encoded in the URL. Make a beat → share the link → anyone hears it instantly.

**No server. No database. Just a URL.**

## Features

- **16-step × 6-track** grid sequencer (kick, snare, hihat, clap, tom, rim)
- **Web Audio API** synthesized drums — no sample files needed
- **URL state encoding** — grid pattern, BPM, and swing packed into the URL hash
- **Swing control** for that human groove feel
- **One-click sharing** — copies the beat URL to clipboard
- **Keyboard shortcuts** — Space to play/stop
- **Responsive** — works on mobile
- **Zero dependencies** — single HTML file, ~11KB

## How It Works

Each track's 16 steps are packed into a 16-bit integer. The URL hash format is:

```
#BPM.SWING.KICK.SNARE.HIHAT.CLAP.TOM.RIM
```

For example, `#120.0.33.8200.21845.512.0.0` encodes a beat at 120 BPM with kick on beats 1 and 5, snare pattern, etc.

## Try It

Open `index.html` in any browser. That's it.

## Tech

- Vanilla HTML/CSS/JS — no build step, no framework
- Web Audio API oscillators + noise buffers for drum synthesis
- CSS Grid for the sequencer layout
- `history.replaceState` for live URL updates without page reloads

## License

MIT
