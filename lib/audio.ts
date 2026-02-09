// Audio engine with multiple drum kits using Web Audio API synthesis

export type KitName = "808" | "acoustic" | "electronic" | "lofi" | "industrial" | "minimal";

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyser: AnalyserNode | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.8;
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  // Always try to resume — on iOS this needs to happen in a user gesture call stack
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Ensure AudioContext is running. Must be called from a user gesture handler.
 * On iOS WebKit the context starts suspended and resume() is async —
 * we await it and play a silent buffer via <audio> to bypass the mute switch,
 * then unlock the Web Audio context.
 */
export async function ensureAudioUnlocked(): Promise<AudioContext> {
  const ctx = getAudioContext();

  // On iOS, playing a tiny <audio> element from a user gesture overrides the
  // silent/mute switch for the entire page's audio session.
  try {
    const audio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwMHAAAAAAD/+1DEAAAHAAGf9AAAIiSAM/80AAATQASABMH5cHwfB8HwfB+Xf/B8Hw//8uD4f//5cHw////+XB8AAAAAAB8HwfB8HwfB8H///y4Pg+D4Pg+D7////////lwAAAAAAAAAVEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==");
    audio.volume = 0.01;
    await audio.play();
  } catch (_) { /* ignore — best effort mute switch bypass */ }

  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  // Also play silent buffer through Web Audio to fully activate it
  try {
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch (_) { /* ignore */ }
  return ctx;
}

export function getAnalyser(): AnalyserNode | null {
  return analyser;
}

function getOutput(): GainNode {
  getAudioContext();
  return masterGain!;
}

// --- Noise buffer helper ---
function noiseBuffer(ctx: AudioContext, length: number): AudioBuffer {
  const buf = ctx.createBuffer(1, length, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// ====== 808 Kit ======
const kit808 = {
  kick(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 0.2);
    g.gain.setValueAtTime(vol * 0.95, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.4);
    // Sub click
    const o2 = c.createOscillator(), g2 = c.createGain();
    o2.type = "sine"; o2.frequency.setValueAtTime(400, t);
    o2.frequency.exponentialRampToValueAtTime(50, t + 0.02);
    g2.gain.setValueAtTime(vol * 0.4, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    o2.connect(g2); g2.connect(out);
    o2.start(t); o2.stop(t + 0.03);
  },
  snare(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain();
    n.buffer = noiseBuffer(c, 6000);
    nf.type = "highpass"; nf.frequency.value = 1500;
    ng.gain.setValueAtTime(vol * 0.55, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    n.connect(nf); nf.connect(ng); ng.connect(out);
    n.start(t); n.stop(t + 0.25);
    const o = c.createOscillator(), og = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.08);
    og.gain.setValueAtTime(vol * 0.45, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(og); og.connect(out);
    o.start(t); o.stop(t + 0.1);
  },
  hihat(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 2048);
    f.type = "highpass"; f.frequency.value = 8000;
    g.gain.setValueAtTime(vol * 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    n.connect(f); f.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.06);
  },
  clap(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 4000);
    f.type = "bandpass"; f.frequency.value = 1200; f.Q.value = 0.8;
    g.gain.setValueAtTime(0, t);
    for (let i = 0; i < 3; i++) {
      g.gain.setValueAtTime(vol * 0.6, t + i * 0.01);
      g.gain.setValueAtTime(0.001, t + i * 0.01 + 0.005);
    }
    g.gain.setValueAtTime(vol * 0.6, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    n.connect(f); f.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.18);
  },
  tom(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
    g.gain.setValueAtTime(vol * 0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.3);
  },
  rim(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(800, t);
    g.gain.setValueAtTime(vol * 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.03);
  },
  perc(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(600, t);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.05);
    g.gain.setValueAtTime(vol * 0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.08);
  },
  cowbell(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o1 = c.createOscillator(), o2 = c.createOscillator();
    const g = c.createGain(), bp = c.createBiquadFilter();
    o1.type = "square"; o1.frequency.value = 800;
    o2.type = "square"; o2.frequency.value = 540;
    bp.type = "bandpass"; bp.frequency.value = 800; bp.Q.value = 3;
    g.gain.setValueAtTime(vol * 0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o1.connect(bp); o2.connect(bp); bp.connect(g); g.connect(out);
    o1.start(t); o2.start(t); o1.stop(t + 0.15); o2.stop(t + 0.15);
  },
};

// ====== Acoustic Kit ======
const kitAcoustic = {
  kick(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(100, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.12);
    g.gain.setValueAtTime(vol * 0.85, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.2);
    // Attack transient
    const n = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain();
    n.buffer = noiseBuffer(c, 512);
    nf.type = "lowpass"; nf.frequency.value = 2000;
    ng.gain.setValueAtTime(vol * 0.3, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    n.connect(nf); nf.connect(ng); ng.connect(out);
    n.start(t); n.stop(t + 0.015);
  },
  snare(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain();
    n.buffer = noiseBuffer(c, 8000);
    nf.type = "bandpass"; nf.frequency.value = 3000; nf.Q.value = 0.6;
    ng.gain.setValueAtTime(vol * 0.5, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    n.connect(nf); nf.connect(ng); ng.connect(out);
    n.start(t); n.stop(t + 0.15);
    const o = c.createOscillator(), og = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(250, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.04);
    og.gain.setValueAtTime(vol * 0.55, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(og); og.connect(out);
    o.start(t); o.stop(t + 0.06);
  },
  hihat(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 1500);
    f.type = "highpass"; f.frequency.value = 9000;
    g.gain.setValueAtTime(vol * 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    n.connect(f); f.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.04);
  },
  clap(t: number, vol: number) { kit808.clap(t, vol); },
  tom(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.15);
    g.gain.setValueAtTime(vol * 0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.2);
  },
  rim(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(1200, t);
    g.gain.setValueAtTime(vol * 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.02);
  },
  perc(t: number, vol: number) { kit808.perc(t, vol); },
  cowbell(t: number, vol: number) { kit808.cowbell(t, vol); },
};

// ====== Electronic Kit ======
const kitElectronic = {
  kick(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    const dist = c.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = (Math.PI + 2) * x / (Math.PI + 2 * Math.abs(x)); }
    dist.curve = curve;
    o.type = "sine";
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(25, t + 0.15);
    g.gain.setValueAtTime(vol * 0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(dist); dist.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.35);
  },
  snare(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain();
    n.buffer = noiseBuffer(c, 5000);
    nf.type = "highpass"; nf.frequency.value = 2000;
    ng.gain.setValueAtTime(vol * 0.6, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    n.connect(nf); nf.connect(ng); ng.connect(out);
    n.start(t); n.stop(t + 0.12);
    const o = c.createOscillator(), og = c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    og.gain.setValueAtTime(vol * 0.35, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(og); og.connect(out);
    o.start(t); o.stop(t + 0.06);
  },
  hihat(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), f2 = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 3000);
    f.type = "highpass"; f.frequency.value = 7000;
    f2.type = "peaking"; f2.frequency.value = 10000; f2.gain.value = 8;
    g.gain.setValueAtTime(vol * 0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    n.connect(f); f.connect(f2); f2.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.08);
  },
  clap(t: number, vol: number) { kit808.clap(t, vol); },
  tom(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    g.gain.setValueAtTime(vol * 0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.22);
  },
  rim(t: number, vol: number) { kit808.rim(t, vol); },
  perc(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(800, t);
    o.frequency.exponentialRampToValueAtTime(300, t + 0.04);
    g.gain.setValueAtTime(vol * 0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.06);
  },
  cowbell(t: number, vol: number) { kit808.cowbell(t, vol); },
};

// ====== Lo-fi Kit ======
const kitLofi = {
  kick(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(78, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.1);
    o.detune.value = -15;
    g.gain.setValueAtTime(vol * 0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.15);
  },
  snare(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 2000);
    f.type = "bandpass"; f.frequency.value = 2500; f.Q.value = 1.5;
    g.gain.setValueAtTime(vol * 0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    n.connect(f); f.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.08);
  },
  hihat(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 1024);
    f.type = "highpass"; f.frequency.value = 7000;
    g.gain.setValueAtTime(vol * 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    n.connect(f); f.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.04);
  },
  clap(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 2000);
    f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 2;
    g.gain.setValueAtTime(vol * 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    n.connect(f); f.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.07);
  },
  tom(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(100, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.2);
    g.gain.setValueAtTime(vol * 0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.25);
  },
  rim(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(900, t);
    g.gain.setValueAtTime(vol * 0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.02);
  },
  perc(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(700, t);
    o.frequency.exponentialRampToValueAtTime(400, t + 0.03);
    f.type = "lowpass"; f.frequency.value = 1500;
    g.gain.setValueAtTime(vol * 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(f); f.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.06);
  },
  cowbell(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o1 = c.createOscillator(), o2 = c.createOscillator();
    const g = c.createGain(), f = c.createBiquadFilter();
    o1.type = "sine"; o1.frequency.value = 620;
    o2.type = "sine"; o2.frequency.value = 430;
    f.type = "lowpass"; f.frequency.value = 2000;
    g.gain.setValueAtTime(vol * 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(out);
    o1.start(t); o2.start(t); o1.stop(t + 0.1); o2.stop(t + 0.1);
  },
};

// ====== Industrial Kit ======
const kitIndustrial = {
  kick(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    const dist = c.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = Math.tanh(x * 4); }
    dist.curve = curve;
    o.type = "sine";
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(25, t + 0.1);
    g.gain.setValueAtTime(vol * 1.0, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(dist); dist.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.25);
  },
  snare(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), ng = c.createGain();
    const dist = c.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = Math.tanh(x * 6); }
    dist.curve = curve;
    n.buffer = noiseBuffer(c, 5000);
    ng.gain.setValueAtTime(vol * 0.7, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    n.connect(dist); dist.connect(ng); ng.connect(out);
    n.start(t); n.stop(t + 0.15);
  },
  hihat(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 3000);
    f.type = "peaking"; f.frequency.value = 6000; f.gain.value = 12; f.Q.value = 5;
    g.gain.setValueAtTime(vol * 0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    n.connect(f); f.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.05);
  },
  clap(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const dist = c.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = Math.tanh(x * 5); }
    dist.curve = curve;
    for (let i = 0; i < 3; i++) {
      const n = c.createBufferSource(), g = c.createGain();
      n.buffer = noiseBuffer(c, 1500);
      g.gain.setValueAtTime(vol * 0.5, t + i * 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.012 + 0.04);
      n.connect(dist); dist.connect(g); g.connect(out);
      n.start(t + i * 0.012); n.stop(t + i * 0.012 + 0.04);
    }
  },
  tom(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(80, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.1);
    g.gain.setValueAtTime(vol * 0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.12);
  },
  rim(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(3000, t);
    o.frequency.exponentialRampToValueAtTime(1500, t + 0.01);
    g.gain.setValueAtTime(vol * 0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.015);
  },
  perc(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const carrier = c.createOscillator(), mod = c.createOscillator();
    const modGain = c.createGain(), g = c.createGain();
    mod.type = "sine"; mod.frequency.value = 1200;
    modGain.gain.value = 800;
    carrier.type = "sine"; carrier.frequency.value = 400;
    mod.connect(modGain); modGain.connect(carrier.frequency);
    g.gain.setValueAtTime(vol * 0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    carrier.connect(g); g.connect(out);
    mod.start(t); carrier.start(t); mod.stop(t + 0.05); carrier.stop(t + 0.05);
  },
  cowbell(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o1 = c.createOscillator(), o2 = c.createOscillator();
    const g = c.createGain();
    o1.type = "square"; o1.frequency.value = 850;
    o2.type = "square"; o2.frequency.value = 620;
    o1.detune.value = 30; o2.detune.value = -25;
    g.gain.setValueAtTime(vol * 0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o1.connect(g); o2.connect(g); g.connect(out);
    o1.start(t); o2.start(t); o1.stop(t + 0.1); o2.stop(t + 0.1);
  },
};

// ====== Minimal Kit ======
const kitMinimal = {
  kick(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.08);
    g.gain.setValueAtTime(vol * 0.85, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.15);
  },
  snare(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain();
    n.buffer = noiseBuffer(c, 2000);
    nf.type = "highpass"; nf.frequency.value = 3000;
    ng.gain.setValueAtTime(vol * 0.4, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    n.connect(nf); nf.connect(ng); ng.connect(out);
    n.start(t); n.stop(t + 0.06);
    const o = c.createOscillator(), og = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(220, t);
    og.gain.setValueAtTime(vol * 0.3, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    o.connect(og); og.connect(out);
    o.start(t); o.stop(t + 0.04);
  },
  hihat(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 512);
    f.type = "highpass"; f.frequency.value = 10000;
    g.gain.setValueAtTime(vol * 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    n.connect(f); f.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.02);
  },
  clap(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = noiseBuffer(c, 2000);
    f.type = "bandpass"; f.frequency.value = 1500; f.Q.value = 1;
    g.gain.setValueAtTime(vol * 0.45, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    n.connect(f); f.connect(g); g.connect(out);
    n.start(t); n.stop(t + 0.08);
  },
  tom(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    g.gain.setValueAtTime(vol * 0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.15);
  },
  rim(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(1000, t);
    g.gain.setValueAtTime(vol * 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.015);
  },
  perc(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(500, t);
    g.gain.setValueAtTime(vol * 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.04);
  },
  cowbell(t: number, vol: number) {
    const c = getAudioContext(), out = getOutput();
    const o1 = c.createOscillator(), o2 = c.createOscillator();
    const g = c.createGain();
    o1.type = "sine"; o1.frequency.value = 800;
    o2.type = "sine"; o2.frequency.value = 540;
    g.gain.setValueAtTime(vol * 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o1.connect(g); o2.connect(g); g.connect(out);
    o1.start(t); o2.start(t); o1.stop(t + 0.1); o2.stop(t + 0.1);
  },
};

export const KITS: Record<KitName, Record<string, (t: number, vol: number) => void>> = {
  "808": kit808,
  acoustic: kitAcoustic,
  electronic: kitElectronic,
  lofi: kitLofi,
  industrial: kitIndustrial,
  minimal: kitMinimal,
};

export const TRACKS = [
  { name: "KICK", key: "kick", color: "var(--kick)" },
  { name: "SNARE", key: "snare", color: "var(--snare)" },
  { name: "HIHAT", key: "hihat", color: "var(--hihat)" },
  { name: "CLAP", key: "clap", color: "var(--clap)" },
  { name: "TOM", key: "tom", color: "var(--tom)" },
  { name: "RIM", key: "rim", color: "var(--rim)" },
  { name: "PERC", key: "perc", color: "var(--perc)" },
  { name: "COWBELL", key: "cowbell", color: "var(--cowbell)" },
] as const;

export const STEPS = 16;

export function playSound(kit: KitName, trackKey: string, time: number, volume: number) {
  const synth = KITS[kit]?.[trackKey];
  if (synth) synth(time, volume);
}

// --- Export to WAV ---
export async function exportToWav(
  grid: number[][],
  bpm: number,
  swing: number,
  kit: KitName,
  volumes: number[]
): Promise<Blob> {
  const stepCount = grid[0]?.length || STEPS;
  const stepDuration = 60 / (bpm * 4);
  const totalDuration = stepCount * stepDuration + 1; // extra second for decay
  const sampleRate = 44100;
  const offCtx = new OfflineAudioContext(2, totalDuration * sampleRate, sampleRate);

  // We need to recreate synths targeting offCtx... For simplicity, render by scheduling
  // Actually let's create a simpler approach: record from real-time for one loop
  // Better: use OfflineAudioContext with inline synth functions

  const offMaster = offCtx.createGain();
  offMaster.gain.value = 0.8;
  offMaster.connect(offCtx.destination);

  function offNoise(length: number): AudioBuffer {
    const buf = offCtx.createBuffer(1, length, sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // Simplified: just schedule kick/snare/hihat/etc using the 808 synths inline
  for (let step = 0; step < stepCount; step++) {
    const baseTime = step * stepDuration;
    const swingOffset = step % 2 === 1 ? stepDuration * (swing / 100) * 0.66 : 0;
    const t = baseTime + swingOffset;

    TRACKS.forEach((track, r) => {
      if (!grid[r][step]) return;
      const vol = volumes[r];
      const key = track.key;

      // Inline simplified synthesis for offline context
      if (key === "kick") {
        const o = offCtx.createOscillator(), g = offCtx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(28, t + 0.2);
        g.gain.setValueAtTime(vol * 0.95, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        o.connect(g); g.connect(offMaster); o.start(t); o.stop(t + 0.4);
      } else if (key === "snare") {
        const n = offCtx.createBufferSource(), nf = offCtx.createBiquadFilter(), ng = offCtx.createGain();
        n.buffer = offNoise(6000); nf.type = "highpass"; nf.frequency.value = 1500;
        ng.gain.setValueAtTime(vol * 0.55, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        n.connect(nf); nf.connect(ng); ng.connect(offMaster); n.start(t); n.stop(t + 0.25);
      } else if (key === "hihat") {
        const n = offCtx.createBufferSource(), f = offCtx.createBiquadFilter(), g = offCtx.createGain();
        n.buffer = offNoise(2048); f.type = "highpass"; f.frequency.value = 8000;
        g.gain.setValueAtTime(vol * 0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        n.connect(f); f.connect(g); g.connect(offMaster); n.start(t); n.stop(t + 0.06);
      } else if (key === "clap") {
        const n = offCtx.createBufferSource(), f = offCtx.createBiquadFilter(), g = offCtx.createGain();
        n.buffer = offNoise(4000); f.type = "bandpass"; f.frequency.value = 1200;
        g.gain.setValueAtTime(vol * 0.6, t + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        n.connect(f); f.connect(g); g.connect(offMaster); n.start(t); n.stop(t + 0.18);
      } else if (key === "tom") {
        const o = offCtx.createOscillator(), g = offCtx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
        g.gain.setValueAtTime(vol * 0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.connect(g); g.connect(offMaster); o.start(t); o.stop(t + 0.3);
      } else if (key === "rim") {
        const o = offCtx.createOscillator(), g = offCtx.createGain();
        o.type = "square"; o.frequency.setValueAtTime(800, t);
        g.gain.setValueAtTime(vol * 0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        o.connect(g); g.connect(offMaster); o.start(t); o.stop(t + 0.03);
      } else if (key === "perc") {
        const o = offCtx.createOscillator(), g = offCtx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(200, t + 0.05);
        g.gain.setValueAtTime(vol * 0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.connect(g); g.connect(offMaster); o.start(t); o.stop(t + 0.08);
      } else if (key === "cowbell") {
        const o1 = offCtx.createOscillator(), o2 = offCtx.createOscillator();
        const g = offCtx.createGain(), bp = offCtx.createBiquadFilter();
        o1.type = "square"; o1.frequency.value = 800; o2.type = "square"; o2.frequency.value = 540;
        bp.type = "bandpass"; bp.frequency.value = 800; bp.Q.value = 3;
        g.gain.setValueAtTime(vol * 0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o1.connect(bp); o2.connect(bp); bp.connect(g); g.connect(offMaster);
        o1.start(t); o2.start(t); o1.stop(t + 0.15); o2.stop(t + 0.15);
      }
    });
  }

  const rendered = await offCtx.startRendering();
  return audioBufferToWav(rendered);
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const arrayBuffer = new ArrayBuffer(headerLength + dataLength);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let ch = 0; ch < numChannels; ch++) channels.push(buffer.getChannelData(ch));

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}
