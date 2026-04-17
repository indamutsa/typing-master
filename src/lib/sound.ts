import { useSettingsStore } from "@/store/settings";
import { SoundProfile } from "@/types";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Noise buffer for mechanical key sounds
let noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  const size = ctx.sampleRate * 0.1; // 100ms of noise
  noiseBuffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

// --- Profile: Minimal (simple tones) ---
function minimalKeystroke(ctx: AudioContext, isError: boolean) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (isError) {
    osc.type = "square";
    osc.frequency.value = 220;
    gain.gain.value = 0.08;
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } else {
    osc.type = "sine";
    osc.frequency.value = 440;
    gain.gain.value = 0.05;
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }
}

// --- Profile: NK Cream (thocky linear mechanical switch) ---
function nkCreamKeystroke(ctx: AudioContext, isError: boolean) {
  const t = ctx.currentTime;

  // Bottom-out thock: filtered noise burst
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = isError ? 800 : 1800;
  noiseFilter.Q.value = 1.5;

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseGain.gain.setValueAtTime(isError ? 0.12 : 0.1, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  noise.start(t);
  noise.stop(t + 0.06);

  // Low-freq body resonance
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = isError ? 120 : 180;
  oscGain.gain.setValueAtTime(isError ? 0.06 : 0.04, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  osc.start(t);
  osc.stop(t + 0.05);

  // High click transient
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  click.connect(clickGain);
  clickGain.connect(ctx.destination);
  click.type = "square";
  click.frequency.value = isError ? 2000 : 3500;
  clickGain.gain.setValueAtTime(0.03, t);
  clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.01);
  click.start(t);
  click.stop(t + 0.015);
}

// --- Profile: Typewriter (old mechanical clack + carriage) ---
function typewriterKeystroke(ctx: AudioContext, isError: boolean) {
  const t = ctx.currentTime;

  // Sharp metallic clack: high-freq noise
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const noiseGain = ctx.createGain();
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = isError ? 1500 : 3000;

  noise.connect(hp);
  hp.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseGain.gain.setValueAtTime(isError ? 0.18 : 0.14, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  noise.start(t);
  noise.stop(t + 0.04);

  // Metallic ring
  const ring = ctx.createOscillator();
  const ringGain = ctx.createGain();
  ring.connect(ringGain);
  ringGain.connect(ctx.destination);
  ring.type = "sine";
  ring.frequency.value = isError ? 600 : 1200;
  ringGain.gain.setValueAtTime(0.06, t);
  ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  ring.start(t);
  ring.stop(t + 0.08);

  // Mechanical thud
  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thud.connect(thudGain);
  thudGain.connect(ctx.destination);
  thud.type = "sine";
  thud.frequency.setValueAtTime(isError ? 80 : 150, t);
  thud.frequency.exponentialRampToValueAtTime(40, t + 0.06);
  thudGain.gain.setValueAtTime(0.08, t);
  thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  thud.start(t);
  thud.stop(t + 0.07);
}

// --- Profile: Bubble (soft, satisfying pop) ---
function bubbleKeystroke(ctx: AudioContext, isError: boolean) {
  const t = ctx.currentTime;

  // Rising pop oscillator
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(isError ? 200 : 400, t);
  osc.frequency.exponentialRampToValueAtTime(isError ? 120 : 600, t + 0.06);
  gain.gain.setValueAtTime(isError ? 0.08 : 0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.start(t);
  osc.stop(t + 0.08);

  // Soft air noise
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const noiseGain = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = isError ? 600 : 1200;

  noise.connect(lp);
  lp.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseGain.gain.setValueAtTime(0.03, t + 0.01);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  noise.start(t);
  noise.stop(t + 0.07);
}

// --- Dispatch ---
const PROFILE_FN: Record<
  SoundProfile,
  (ctx: AudioContext, isError: boolean) => void
> = {
  minimal: minimalKeystroke,
  "nk-cream": nkCreamKeystroke,
  typewriter: typewriterKeystroke,
  bubble: bubbleKeystroke,
};

export function playKeystroke(isError: boolean) {
  if (!useSettingsStore.getState().soundEnabled) return;
  try {
    const ctx = getContext();
    const profile = useSettingsStore.getState().soundProfile || "nk-cream";
    PROFILE_FN[profile](ctx, isError);
  } catch {
    // Audio not available
  }
}

export function playSessionComplete() {
  if (!useSettingsStore.getState().soundEnabled) return;
  try {
    const ctx = getContext();
    const profile = useSettingsStore.getState().soundProfile || "nk-cream";
    const t = ctx.currentTime;

    if (profile === "typewriter") {
      // Typewriter bell
      const bell = ctx.createOscillator();
      const gain = ctx.createGain();
      bell.connect(gain);
      gain.connect(ctx.destination);
      bell.type = "sine";
      bell.frequency.value = 2000;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      bell.start(t);
      bell.stop(t + 0.8);
    } else {
      // Two-note ascending chime
      const notes = [523.25, 659.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3);
        osc.start(t + i * 0.15);
        osc.stop(t + i * 0.15 + 0.3);
      });
    }
  } catch {
    // Audio not available
  }
}
