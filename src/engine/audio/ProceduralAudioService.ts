export type ProceduralAudioMode = "menu" | "run" | "garage";

export interface ProceduralAudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

type AudioContextConstructor = new () => AudioContext;

interface ScheduledNode {
  stop(when?: number): void;
}

const DEFAULT_SETTINGS: ProceduralAudioSettings = {
  masterVolume: 0.85,
  musicVolume: 0.38,
  sfxVolume: 0.82,
  muted: false,
};

const BPM = 96;
const STEPS_PER_BAR = 16;
const LOOP_STEPS = STEPS_PER_BAR * 4;
const SIXTEENTH_SECONDS = 60 / BPM / 4;
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SECONDS = 0.12;

// --- Adaptive-music infrastructure (Phase 1) ---
// The arrangement is split into vertical layers (additive stems). Each layer owns a gain bus;
// the bus fades in/out as the smoothed musical intensity crosses the layer's gate, so drivers
// (speed/combo/danger) make the music thicken/thin without ever changing *when* notes land.
type LayerId = "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";
const LAYER_IDS: LayerId[] = ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"];
// Smoothed-intensity threshold at which each layer fades in (hysteresis applied at runtime).
// L0 kick+sub · L1 snare/hat · L2 bass · L3 pad · L4 lead · L5 counter/stabs · L6 garnish · L7 ornament.
const LAYER_GATES: Record<LayerId, number> = {
  L0: 0,
  L1: 0,
  L2: 0,
  L3: 0,
  L4: 0.25,
  L5: 0.55,
  L6: 0.7,
  L7: 0.8,
};
const LAYER_HYSTERESIS = 0.08;
// Hard ceiling on simultaneously-tracked music source nodes — a backstop against voice pile-up.
const MAX_MUSIC_VOICES = 32;
// Swing for the current single beat (Village feel): odd 16ths are pushed late by this fraction.
const DEFAULT_SWING = 0.16;

const NOTE_FREQUENCIES: Record<string, number> = {
  D1: 36.71,
  F1: 43.65,
  G1: 49.0,
  A1: 55.0,
  C2: 65.41,
  D2: 73.42,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  C3: 130.81,
  D3: 146.83,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
};

const BASS_PATTERN: Array<string | null> = [
  "D1",
  null,
  null,
  "D1",
  null,
  null,
  "A1",
  null,
  "C2",
  null,
  "A1",
  null,
  null,
  "G1",
  null,
  null,
];

const PLUCK_PATTERN: Array<string | null> = [
  "D4",
  null,
  null,
  "F4",
  null,
  "G4",
  null,
  null,
  "A4",
  null,
  null,
  "G4",
  null,
  "C5",
  null,
  null,
];

export class ProceduralAudioService {
  private settings: ProceduralAudioSettings;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicMode: ProceduralAudioMode = "menu";
  private isMusicRunning = false;
  private isMusicPaused = false;
  private nextStepTime = 0;
  private nextStepIndex = 0;
  private activeMusicNodes = new Set<ScheduledNode>();
  private activeSfxNodes = new Set<ScheduledNode>();
  // Continuous EV motor sound: a deep, SINGING two-tone harmony (a fundamental + a perfect
  // fifth, slightly detuned for a chorus shimmer) warmed by a master lowpass, with a faint
  // sub for depth, a hint of inverter coil-whine, airy road noise + a sport-sound tremolo.
  // Pitch + brightness rise with the player's speed.
  private engine: {
    toneA: OscillatorNode;
    toneB: OscillatorNode;
    sub: OscillatorNode;
    inverter: OscillatorNode;
    noise: AudioBufferSourceNode;
    lfo: OscillatorNode;
    gA: GainNode;
    gInv: GainNode;
    air: GainNode;
    lp: BiquadFilterNode;
    gain: GainNode;
  } | null = null;
  private runIntensity = 0.4;

  // Adaptive-music buses + state. Melodic layers (L2..L7) route through `duckBus` (kick-
  // sidechained for pump + headroom); drum layers (L0/L1) bypass it. `autoScaleGain` trims the
  // sum as more layers stack so the output keeps headroom. Layer gates open/close on the
  // smoothed musical intensity (driven by speed/combo/danger).
  private layerGain: Partial<Record<LayerId, GainNode>> = {};
  private duckBus: GainNode | null = null;
  private autoScaleGain: GainNode | null = null;
  private musicIntensityTarget = 0;
  private musicIntensitySmoothed = 0;
  private comboNorm = 0;
  private dangerNorm = 0;
  private layerOn: Record<LayerId, boolean> = {
    L0: true,
    L1: true,
    L2: true,
    L3: true,
    L4: false,
    L5: false,
    L6: false,
    L7: false,
  };
  private musicVoiceCount = 0;

  constructor(settings: Partial<ProceduralAudioSettings> = {}) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
  }

  async unlock(): Promise<void> {
    const context = this.ensureContext();

    if (context.state === "suspended") {
      await context.resume();
    }
  }

  startMusic(mode: ProceduralAudioMode = "run"): void {
    const context = this.ensureContext();

    this.stopMusic();
    this.musicMode = mode;
    this.isMusicRunning = true;
    this.isMusicPaused = false;
    this.nextStepTime = context.currentTime + 0.05;
    this.nextStepIndex = 0;
    // In a run the music intensity builds from the player's speed (starts thin). In the
    // menu/garage there is no speed signal, so park it at a fixed, fully-audible level.
    if (mode === "run") {
      this.musicIntensityTarget = 0;
      this.musicIntensitySmoothed = 0;
    } else {
      this.musicIntensityTarget = mode === "menu" ? 0.5 : 0.45;
      this.musicIntensitySmoothed = this.musicIntensityTarget;
    }
    this.updateMusicModeGain();
    this.scheduleMusic();
    this.musicTimer = setInterval(() => this.scheduleMusic(), LOOKAHEAD_MS);
    if (mode === "run") {
      this.startEngine();
    } else {
      this.stopEngine();
    }
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }

    const context = this.context;
    const stopTime = context ? context.currentTime + 0.02 : undefined;
    for (const node of this.activeMusicNodes) {
      this.stopNode(node, stopTime);
    }

    this.activeMusicNodes.clear();
    this.musicVoiceCount = 0;
    this.musicIntensitySmoothed = 0;
    this.isMusicRunning = false;
    this.isMusicPaused = false;
    this.nextStepIndex = 0;
    this.stopEngine();
  }

  pauseMusic(): void {
    if (!this.isMusicRunning || this.isMusicPaused) {
      return;
    }

    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }

    this.isMusicPaused = true;
    this.stopEngine();
  }

  resumeMusic(): void {
    if (!this.isMusicRunning || !this.isMusicPaused) {
      return;
    }

    const context = this.ensureContext();
    this.isMusicPaused = false;
    this.nextStepTime = context.currentTime + 0.05;
    this.musicTimer = setInterval(() => this.scheduleMusic(), LOOKAHEAD_MS);
    if (this.musicMode === "run") {
      this.startEngine();
    }
  }

  /** Drive the EV motor whine pitch + brightness from the player's speed (0 = base, ~1.8 = boosted). */
  setRunIntensity(value: number): void {
    this.runIntensity = Math.min(1.8, Math.max(0, Number.isFinite(value) ? value : 0));
    this.applyEngineIntensity();
    // Feed the music arranger too: speed dominates, combo/danger reserve the top layers so they
    // feel "earned" (see setMusicDynamics). speedNorm: idle (~0.5 ratio) → 0, flat-out (1.0) → 1.
    const speedNorm = this.clamp01((this.runIntensity - 0.5) / 0.5);
    this.musicIntensityTarget = this.clamp01(0.85 * speedNorm + 0.3 * this.comboNorm + 0.2 * this.dangerNorm);
  }

  /** Optional gameplay coupling for the music: combo + danger lift the upper "earned" layers. */
  setMusicDynamics(comboNorm: number, dangerNorm: number): void {
    this.comboNorm = this.clamp01(Number.isFinite(comboNorm) ? comboNorm : 0);
    this.dangerNorm = this.clamp01(Number.isFinite(dangerNorm) ? dangerNorm : 0);
  }

  private startEngine(): void {
    if (this.engine) {
      return;
    }
    const ctx = this.ensureContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;

    // Master lowpass keeps the whole sound deep + warm (the two tones sing rather than buzz).
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    lp.Q.value = 0.7;

    // The two singing tones: a deep fundamental + a perfect fifth above it. Equal-ish
    // weight so you clearly hear a two-note harmony.
    const toneA = ctx.createOscillator();
    toneA.type = "sawtooth";
    const gA = ctx.createGain();
    gA.gain.value = 0.34;
    const toneB = ctx.createOscillator();
    toneB.type = "sawtooth";
    const gB = ctx.createGain();
    gB.gain.value = 0.3;

    // Faint sub an octave below the fundamental for body / "tiefer".
    const sub = ctx.createOscillator();
    sub.type = "sine";
    const gSub = ctx.createGain();
    gSub.gain.value = 0.12;

    // Just a hint of high inverter coil-whine for EV character (mostly tamed by the lowpass).
    const inverter = ctx.createOscillator();
    inverter.type = "sine";
    const gInv = ctx.createGain();
    gInv.gain.value = 0.004;

    // Airy high-passed road noise (faint hiss, no rumble).
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    noise.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2400;
    const air = ctx.createGain();
    air.gain.value = 0.008;

    // Slow sport-sound tremolo so the harmony gently breathes/sings.
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 5;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.07;

    toneA.connect(gA);
    gA.connect(gain);
    toneB.connect(gB);
    gB.connect(gain);
    sub.connect(gSub);
    gSub.connect(gain);
    inverter.connect(gInv);
    gInv.connect(gain);
    noise.connect(hp);
    hp.connect(air);
    air.connect(gain);
    lfo.connect(lfoDepth);
    lfoDepth.connect(gA.gain); // breathe the fundamental for the singing pulse
    gain.connect(lp);
    lp.connect(this.sfxGain ?? ctx.destination);

    toneA.start();
    toneB.start();
    sub.start();
    inverter.start();
    noise.start();
    lfo.start();
    this.engine = { toneA, toneB, sub, inverter, noise, lfo, gA, gInv, air, lp, gain };
    this.applyEngineIntensity();
  }

  private stopEngine(): void {
    const engine = this.engine;
    if (!engine) {
      return;
    }
    this.engine = null;
    const ctx = this.context;
    const now = ctx ? ctx.currentTime : 0;
    engine.gain.gain.setTargetAtTime(0.0001, now, 0.12);
    const stopAt = now + 0.4;
    for (const node of [engine.toneA, engine.toneB, engine.sub, engine.inverter, engine.noise, engine.lfo]) {
      try {
        node.stop(stopAt);
        node.onended = () => node.disconnect();
      } catch {
        // already stopped
      }
    }
  }

  private applyEngineIntensity(): void {
    const engine = this.engine;
    const ctx = this.context;
    if (!engine || !ctx) {
      return;
    }
    const v = this.runIntensity;
    const t = ctx.currentTime;
    // Deep, singing two-tone harmony: a low fundamental + a perfect fifth (×1.5), the
    // fifth nudged +0.4% for a slow chorus beat. Much lower than a whine.
    const fund = 55 + v * 205; // ~55 Hz idle → ~430 Hz flat-out (deep, not a high whine)
    engine.toneA.frequency.setTargetAtTime(fund, t, 0.09);
    engine.toneB.frequency.setTargetAtTime(fund * 1.5 * 1.004, t, 0.09);
    engine.sub.frequency.setTargetAtTime(fund * 0.5, t, 0.09);
    engine.inverter.frequency.setTargetAtTime(1400 + v * 2400, t, 0.1);
    engine.gInv.gain.setTargetAtTime(0.003 + v * 0.01, t, 0.12);
    engine.lp.frequency.setTargetAtTime(700 + v * 1500, t, 0.12); // warmth opens with speed
    engine.air.gain.setTargetAtTime(0.005 + v * 0.03, t, 0.12);
    engine.lfo.frequency.setTargetAtTime(4 + v * 3, t, 0.2);
    engine.gain.gain.setTargetAtTime(0.032 + v * 0.026, t, 0.12); // sits behind the music
  }

  setSettings(settings: Partial<ProceduralAudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.applySettings();
  }

  playCoin(combo = 0): void {
    const context = this.ensureContext();
    const now = context.currentTime;
    const step = Math.min(Math.max(0, combo), 16);
    const f = 820 * Math.pow(2, step / 16); // pitch climbs up to an octave as the combo grows
    this.playTone(now, f, 0.07, "sine", 0.16, this.sfxGain, 0.008);
    this.playTone(now + 0.05, f * 1.5, 0.09, "triangle", 0.12, this.sfxGain, 0.004);
  }

  playBoost(): void {
    const context = this.ensureContext();
    const now = context.currentTime;

    this.playSweep(now, 160, 720, 0.34, "sawtooth", 0.18, this.sfxGain);
    this.playNoiseBurst(now, 0.28, 0.16, 900, 5200, "bandpass", this.sfxGain);
  }

  /** 龍 Überschall activation — a sonic boom + dragon roar tearing into warp speed. */
  playHyperspeed(): void {
    const now = this.ensureContext().currentTime;
    // sonic boom: a deep, hard impact
    this.playSweep(now, 240, 38, 0.5, "sawtooth", 0.3, this.sfxGain);
    this.playNoiseBurst(now, 0.5, 0.32, 1900, 110, "lowpass", this.sfxGain);
    // rising whoosh into the warp tunnel
    this.playNoiseBurst(now + 0.04, 0.42, 0.13, 300, 3400, "bandpass", this.sfxGain);
    // dragon roar: a layered low growl that swells then falls
    this.playSweep(now + 0.05, 86, 150, 0.34, "sawtooth", 0.17, this.sfxGain);
    this.playSweep(now + 0.2, 150, 58, 0.55, "square", 0.12, this.sfxGain);
  }

  /** 藍 Freie Bahn activation — a two-tone car horn blast. */
  playHorn(): void {
    const now = this.ensureContext().currentTime;
    this.playTone(now, 440, 0.5, "sawtooth", 0.14, this.sfxGain, 0.01); // A4
    this.playTone(now, 554, 0.5, "sawtooth", 0.12, this.sfxGain, 0.01); // C#5 → a horn chord
  }

  playCollision(): void {
    const context = this.ensureContext();
    const now = context.currentTime;

    this.playSweep(now, 110, 38, 0.34, "sine", 0.42, this.sfxGain);
    this.playNoiseBurst(now, 0.24, 0.38, 110, 900, "lowpass", this.sfxGain);
    this.playNoiseBurst(now + 0.04, 0.18, 0.16, 1200, 3200, "bandpass", this.sfxGain);
  }

  playWeakFail(): void {
    const context = this.ensureContext();
    const now = context.currentTime;

    this.playSweep(now, 360, 170, 0.22, "triangle", 0.17, this.sfxGain);
    this.playNoiseBurst(now, 0.08, 0.07, 500, 1400, "bandpass", this.sfxGain);
  }

  playMenuClick(): void {
    const context = this.ensureContext();
    const now = context.currentTime;

    this.playTone(now, 740, 0.035, "square", 0.08, this.sfxGain, 0.002);
    this.playNoiseBurst(now, 0.025, 0.04, 1800, 5200, "bandpass", this.sfxGain);
  }

  playGarageSwitch(): void {
    const context = this.ensureContext();
    const now = context.currentTime;

    this.playSweep(now, 260, 410, 0.13, "square", 0.1, this.sfxGain);
    this.playSweep(now + 0.09, 410, 300, 0.1, "square", 0.07, this.sfxGain);
    this.playMenuClick();
  }

  playCountdown(): void {
    const context = this.ensureContext();
    const now = context.currentTime;

    this.playTone(now, 880, 0.13, "sine", 0.23, this.sfxGain, 0.004);
    this.playTone(now, 1760, 0.05, "triangle", 0.07, this.sfxGain, 0.002);
  }

  playGameOver(): void {
    const context = this.ensureContext();
    const now = context.currentTime;

    this.playSweep(now, 330, 70, 0.7, "sawtooth", 0.22, this.sfxGain);
    this.playSweep(now + 0.04, 247, 55, 0.8, "sine", 0.18, this.sfxGain);
    this.playNoiseBurst(now, 0.55, 0.13, 900, 110, "lowpass", this.sfxGain);
  }

  playLevelUp(): void {
    const context = this.ensureContext();
    const now = context.currentTime;
    const arpeggio = [NOTE_FREQUENCIES.C4, NOTE_FREQUENCIES.G4, NOTE_FREQUENCIES.C5];
    arpeggio.forEach((frequency, index) => {
      this.playTone(now + index * 0.08, frequency, 0.2, "triangle", 0.16, this.sfxGain, 0.004);
      this.playTone(now + index * 0.08, frequency * 2, 0.12, "sine", 0.06, this.sfxGain, 0.003);
    });
  }

  /** Lane change — a quick, subtle tyre whoosh (plays on every successful swerve). */
  playSwerve(): void {
    const now = this.ensureContext().currentTime;
    this.playNoiseBurst(now, 0.13, 0.045, 2600, 650, "bandpass", this.sfxGain);
  }

  /** Charge meter just filled — a bright "ready!" chime. */
  playChargeReady(): void {
    const now = this.ensureContext().currentTime;
    this.playTone(now, NOTE_FREQUENCIES.G4, 0.1, "triangle", 0.15, this.sfxGain, 0.004);
    this.playTone(now + 0.09, NOTE_FREQUENCIES.C5, 0.18, "triangle", 0.18, this.sfxGain, 0.004);
    this.playTone(now + 0.09, NOTE_FREQUENCIES.C5 * 2, 0.1, "sine", 0.06, this.sfxGain, 0.003);
  }

  /** 鬼 Schwarzes Loch: a car sucked up — a rising swoosh. */
  playLift(): void {
    const now = this.ensureContext().currentTime;
    this.playSweep(now, 200, 1500, 0.3, "sine", 0.13, this.sfxGain);
    this.playNoiseBurst(now, 0.3, 0.07, 400, 3000, "bandpass", this.sfxGain);
  }

  /** 将 Nachtjagd: ramming a car — a low crunch. */
  playRam(): void {
    const now = this.ensureContext().currentTime;
    this.playSweep(now, 150, 48, 0.2, "square", 0.28, this.sfxGain);
    this.playNoiseBurst(now, 0.18, 0.3, 220, 1400, "lowpass", this.sfxGain);
    this.playNoiseBurst(now + 0.02, 0.1, 0.15, 1600, 4200, "bandpass", this.sfxGain);
  }

  /** 狐 Geschützturm: a turret shot — a quick laser pew. */
  playTurret(): void {
    const now = this.ensureContext().currentTime;
    this.playSweep(now, 1500, 320, 0.11, "square", 0.11, this.sfxGain);
    this.playNoiseBurst(now, 0.05, 0.05, 2200, 5200, "bandpass", this.sfxGain);
  }

  /** 赤 Boost / 狐 Titan smashing a car aside — a soft poof. */
  playPoof(): void {
    const now = this.ensureContext().currentTime;
    this.playNoiseBurst(now, 0.16, 0.16, 1200, 280, "lowpass", this.sfxGain);
    this.playSweep(now, 190, 70, 0.16, "sine", 0.13, this.sfxGain);
  }

  /** 狐 Zweites Leben spent — a warm "saved" chime. */
  playSave(): void {
    const now = this.ensureContext().currentTime;
    [NOTE_FREQUENCIES.G3, NOTE_FREQUENCIES.C4, NOTE_FREQUENCIES.G4].forEach((f, i) =>
      this.playTone(now + i * 0.07, f, 0.22, "sine", 0.15, this.sfxGain, 0.006),
    );
  }

  /** Garage upgrade bought — a little cha-ching. */
  playPurchase(): void {
    const now = this.ensureContext().currentTime;
    this.playTone(now, NOTE_FREQUENCIES.C5, 0.1, "triangle", 0.15, this.sfxGain, 0.003);
    this.playTone(now + 0.08, NOTE_FREQUENCIES.C5 * 1.5, 0.16, "triangle", 0.15, this.sfxGain, 0.003);
    this.playTone(now + 0.08, NOTE_FREQUENCIES.C5 * 3, 0.1, "sine", 0.05, this.sfxGain, 0.002);
  }

  dispose(): void {
    this.stopMusic();

    const context = this.context;
    const stopTime = context ? context.currentTime + 0.02 : undefined;
    for (const node of this.activeSfxNodes) {
      this.stopNode(node, stopTime);
    }
    this.activeSfxNodes.clear();

    for (const id of LAYER_IDS) {
      this.layerGain[id]?.disconnect();
    }
    this.layerGain = {};
    this.duckBus?.disconnect();
    this.autoScaleGain?.disconnect();
    this.masterGain?.disconnect();
    this.musicGain?.disconnect();
    this.sfxGain?.disconnect();
    this.compressor?.disconnect();
    this.noiseBuffer = null;

    this.context = null;
    this.duckBus = null;
    this.autoScaleGain = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.compressor = null;

    if (context && context.state !== "closed") {
      void context.close();
    }
  }

  private ensureContext(): AudioContext {
    if (this.context) {
      return this.context;
    }

    const AudioContextClass = this.getAudioContextConstructor();
    const context = new AudioContextClass();
    const masterGain = context.createGain();
    const musicGain = context.createGain();
    const sfxGain = context.createGain();
    const compressor = context.createDynamicsCompressor();

    compressor.threshold.value = -10;
    compressor.knee.value = 14;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.18;

    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(compressor);
    compressor.connect(context.destination);

    this.context = context;
    this.masterGain = masterGain;
    this.musicGain = musicGain;
    this.sfxGain = sfxGain;
    this.compressor = compressor;
    this.buildMusicBuses(context, musicGain);
    this.noiseBuffer = this.createNoiseBuffer(context);
    this.applySettings();

    return context;
  }

  private getAudioContextConstructor(): AudioContextConstructor {
    const audioGlobal = globalThis as typeof globalThis & {
      webkitAudioContext?: AudioContextConstructor;
    };
    const AudioContextClass = audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("Web Audio API is not available in this environment.");
    }

    return AudioContextClass;
  }

  private applySettings(): void {
    const context = this.context;
    if (!context) {
      return;
    }

    const masterVolume = this.settings.muted ? 0 : this.clamp01(this.settings.masterVolume);
    this.masterGain?.gain.setTargetAtTime(masterVolume, context.currentTime, 0.015);
    this.sfxGain?.gain.setTargetAtTime(this.clamp01(this.settings.sfxVolume), context.currentTime, 0.015);
    this.updateMusicModeGain();
  }

  private updateMusicModeGain(): void {
    const context = this.context;
    if (!context || !this.musicGain) {
      return;
    }

    const modeScale = this.musicMode === "run" ? 1 : this.musicMode === "garage" ? 0.64 : 0.52;
    this.musicGain.gain.setTargetAtTime(
      this.clamp01(this.settings.musicVolume) * modeScale,
      context.currentTime,
      0.03,
    );
  }

  private scheduleMusic(): void {
    const context = this.context;
    if (!context || !this.isMusicRunning || this.isMusicPaused) {
      return;
    }

    // Backgrounded tabs throttle setInterval; keep the clock in sync so we never burst-schedule
    // a pile of past-due notes on refocus (a prime cause of clicks).
    if (typeof document !== "undefined" && document.hidden) {
      this.nextStepTime = context.currentTime;
      return;
    }

    // Lateness guard: if a GC pause / throttle dropped us far behind, snap to the next bar
    // boundary instead of frantically scheduling every missed step into the past.
    if (context.currentTime - this.nextStepTime > 0.5) {
      this.nextStepTime = context.currentTime + 0.05;
      this.nextStepIndex = (Math.ceil(this.nextStepIndex / STEPS_PER_BAR) * STEPS_PER_BAR) % LOOP_STEPS;
    }

    this.updateMusicIntensity();

    while (this.nextStepTime < context.currentTime + SCHEDULE_AHEAD_SECONDS) {
      this.scheduleStep(this.nextStepIndex, this.nextStepTime);
      this.nextStepTime += SIXTEENTH_SECONDS;
      this.nextStepIndex = (this.nextStepIndex + 1) % LOOP_STEPS;
    }
  }

  private scheduleStep(step: number, time: number): void {
    const localStep = step % STEPS_PER_BAR;
    const bar = Math.floor(step / STEPS_PER_BAR);
    // Global swing pushes odd 16ths late; per-voice micro-offsets add the J-Dilla "drunk" feel
    // (kick a hair late, snare a hair early) on top. Never let an offset put a Step-0 hit in the
    // past — clampStart floors every start time at currentTime + 5 ms.
    const swung = time + this.swingOffset(localStep);
    const onZero = localStep === 0;

    if (this.shouldPlayKick(localStep, bar)) {
      this.scheduleKick(this.clampStart(swung + 0.018 + this.tri(0.006)));
    }

    if (this.shouldPlaySnare(localStep)) {
      const early = onZero ? 0 : 0.006; // snare pulled slightly early, but never on the downbeat
      this.scheduleSnare(this.clampStart(swung - early + this.tri(0.006)), this.humanVel(1));
    } else if (this.musicMode === "run" && (localStep === 3 || localStep === 7 || localStep === 11) && Math.random() < 0.12) {
      // Ghost snares — the "played, not stamped" feel.
      this.scheduleSnare(this.clampStart(swung + this.tri(0.006)), 0.3);
    }

    if (this.shouldPlayHat(localStep) && Math.random() < 0.92) {
      const accent = (localStep % 4 === 0 ? 1 : 0.72) * this.humanVel(1);
      this.scheduleClosedHat(this.clampStart(swung + this.tri(0.006)), accent);
    }

    if (this.musicMode === "run" && (step === 15 || step === 31 || step === 47)) {
      this.scheduleOpenHat(this.clampStart(swung + this.tri(0.006)));
    }

    if (this.musicMode === "run" && localStep % 2 === 0) {
      const bassNote = BASS_PATTERN[localStep];
      if (bassNote) {
        this.scheduleBass(
          this.clampStart(swung + this.tri(0.004)),
          NOTE_FREQUENCIES[bassNote],
          localStep === 10 ? NOTE_FREQUENCIES.G1 : undefined,
        );
      }
    }

    this.scheduleMelodicPluck(step, swung);
  }

  private shouldPlayKick(localStep: number, bar: number): boolean {
    if (this.musicMode === "menu") {
      return localStep === 0 && bar % 2 === 0;
    }

    if (this.musicMode === "garage") {
      return localStep === 0 || (bar === 3 && localStep === 10);
    }

    return localStep === 0 || localStep === 6 || localStep === 10 || (bar % 2 === 1 && localStep === 14);
  }

  private shouldPlaySnare(localStep: number): boolean {
    if (this.musicMode === "menu") {
      return localStep === 12;
    }

    return localStep === 4 || localStep === 12;
  }

  private shouldPlayHat(localStep: number): boolean {
    if (this.musicMode === "menu") {
      return localStep === 2 || localStep === 10;
    }

    if (this.musicMode === "garage") {
      return localStep % 4 === 2;
    }

    return localStep % 2 === 0 || localStep === 7 || localStep === 15;
  }

  private scheduleMelodicPluck(step: number, time: number): void {
    // The pluck is the lead layer (L4) — at low speed it stays silent so the beat can breathe.
    if (!this.layerLive("L4")) {
      return;
    }

    if (this.musicMode === "menu" && step % 16 !== 0 && step % 16 !== 10) {
      return;
    }

    if (this.musicMode === "garage" && step % 8 !== 0) {
      return;
    }

    const noteName = PLUCK_PATTERN[(step + (this.musicMode === "garage" ? 5 : 0)) % PLUCK_PATTERN.length];
    if (!noteName) {
      return;
    }

    const velocity = (this.musicMode === "run" ? 0.13 : 0.08) * this.humanVel(1);
    this.schedulePluck(this.clampStart(time + this.tri(0.012)), NOTE_FREQUENCIES[noteName], velocity);

    // Occasional grace-note octave echo — a touch of generative sparkle at higher intensity.
    if (this.musicMode === "run" && this.layerLive("L6") && Math.random() < 0.1) {
      this.schedulePluck(
        this.clampStart(time + SIXTEENTH_SECONDS / 2 + this.tri(0.012)),
        NOTE_FREQUENCIES[noteName] * 2,
        velocity * 0.4,
      );
    }
  }

  private scheduleKick(time: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L0");
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(132, time);
    oscillator.frequency.exponentialRampToValueAtTime(47, time + 0.09);
    oscillator.frequency.exponentialRampToValueAtTime(34, time + 0.22);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.62, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);

    oscillator.connect(gain);
    gain.connect(destination);
    this.duckOnKick(time); // sidechain the melodic bus under the kick (pump + headroom)
    this.trackChain([{ node: oscillator, stop: time + 0.3 }], [gain], time, "music");
  }

  private scheduleSnare(time: number, velocity = 1): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L1");
    const body = context.createOscillator();
    const bodyGain = context.createGain();
    const noise = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();

    body.type = "triangle";
    body.frequency.setValueAtTime(182, time);
    body.frequency.exponentialRampToValueAtTime(145, time + 0.09);
    bodyGain.gain.setValueAtTime(0.18 * velocity, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

    noise.buffer = this.getNoiseBuffer(context);
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1800, time);
    noiseFilter.Q.value = 0.7;
    noiseGain.gain.setValueAtTime(0.22 * velocity, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

    body.connect(bodyGain);
    bodyGain.connect(destination);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);

    this.trackChain(
      [
        { node: body, stop: time + 0.18 },
        { node: noise, stop: time + 0.16 },
      ],
      [bodyGain, noiseFilter, noiseGain],
      time,
      "music",
    );
  }

  private scheduleClosedHat(time: number, accent: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L1");
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = this.getNoiseBuffer(context);
    filter.type = "highpass";
    filter.frequency.setValueAtTime(6400, time);
    gain.gain.setValueAtTime(0.055 * accent, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    this.trackChain([{ node: source, stop: time + 0.055 }], [filter, gain], time, "music");
  }

  private scheduleOpenHat(time: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L1");
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = this.getNoiseBuffer(context);
    filter.type = "highpass";
    filter.frequency.setValueAtTime(5200, time);
    gain.gain.setValueAtTime(0.105, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    this.trackChain([{ node: source, stop: time + 0.2 }], [filter, gain], time, "music");
  }

  private scheduleBass(time: number, frequency: number, slideTo?: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L2");
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, time);
    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(slideTo, time + 0.1);
    }

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(140, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.28, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.34);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    this.trackChain([{ node: oscillator, stop: time + 0.36 }], [filter, gain], time, "music");
  }

  private schedulePluck(time: number, frequency: number, velocity: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L4");
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.detune.setValueAtTime(-7, time);
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(frequency * 2.6, time);
    filter.Q.setValueAtTime(5.5, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(velocity, 0.0001), time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    this.trackChain([{ node: oscillator, stop: time + 0.18 }], [filter, gain], time, "music");
  }

  private playTone(
    time: number,
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    destination: AudioNode | null,
    attack: number,
  ): void {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), time + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    oscillator.connect(gain);
    gain.connect(destination ?? context.destination);
    this.trackChain([{ node: oscillator, stop: time + duration + 0.02 }], [gain], time, "sfx");
  }

  private playSweep(
    time: number,
    startFrequency: number,
    endFrequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    destination: AudioNode | null,
  ): void {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), time + duration);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    oscillator.connect(gain);
    gain.connect(destination ?? context.destination);
    this.trackChain([{ node: oscillator, stop: time + duration + 0.02 }], [gain], time, "sfx");
  }

  private playNoiseBurst(
    time: number,
    duration: number,
    volume: number,
    startFrequency: number,
    endFrequency: number,
    filterType: BiquadFilterType,
    destination: AudioNode | null,
  ): void {
    const context = this.ensureContext();
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = this.getNoiseBuffer(context);
    filter.type = filterType;
    filter.frequency.setValueAtTime(startFrequency, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), time + duration);
    filter.Q.setValueAtTime(0.9, time);
    gain.gain.setValueAtTime(Math.max(volume, 0.0001), time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination ?? context.destination);
    this.trackChain([{ node: source, stop: time + duration + 0.02 }], [filter, gain], time, "sfx");
  }

  /**
   * Start + track a voice and — critically — disconnect its WHOLE node chain when it ends, not
   * just the source. The previous startAndTrack left the per-note gain/filter nodes connected to
   * the graph until GC, inflating the audio-thread graph and feeding the click/crackle build-up.
   * Cleanup fires once every source in the voice has ended (a voice can be multi-source, e.g. the
   * snare's body + noise), so nothing is double- or under-disconnected.
   */
  private trackChain(
    sources: Array<{ node: AudioScheduledSourceNode; stop: number }>,
    chain: AudioNode[],
    startTime: number,
    group: "music" | "sfx",
  ): void {
    if (sources.length === 0) {
      return;
    }

    // Voice-cap backstop: never let music voices pile up unboundedly (a runaway-scheduler guard).
    if (group === "music" && this.musicVoiceCount + sources.length > MAX_MUSIC_VOICES) {
      for (const { node } of sources) {
        try {
          node.disconnect();
        } catch {
          // not yet connected
        }
      }
      for (const node of chain) {
        try {
          node.disconnect();
        } catch {
          // not yet connected
        }
      }
      return;
    }

    const activeNodes = group === "music" ? this.activeMusicNodes : this.activeSfxNodes;
    let pending = sources.length;
    const cleanup = () => {
      for (const { node } of sources) {
        activeNodes.delete(node);
        try {
          node.disconnect();
        } catch {
          // already disconnected
        }
      }
      for (const node of chain) {
        try {
          node.disconnect();
        } catch {
          // already disconnected
        }
      }
      if (group === "music") {
        this.musicVoiceCount = Math.max(0, this.musicVoiceCount - sources.length);
      }
    };

    for (const { node, stop } of sources) {
      activeNodes.add(node);
      node.onended = () => {
        pending -= 1;
        if (pending <= 0) {
          cleanup();
        }
      };
      node.start(startTime);
      node.stop(stop);
    }

    if (group === "music") {
      this.musicVoiceCount += sources.length;
    }
  }

  /** Build the per-layer gain buses + the kick-sidechained duck bus + the headroom auto-scaler. */
  private buildMusicBuses(context: AudioContext, musicGain: GainNode): void {
    const duckBus = context.createGain();
    duckBus.gain.value = 1;
    const autoScale = context.createGain();
    autoScale.gain.value = 0.9;
    duckBus.connect(autoScale);
    autoScale.connect(musicGain);
    this.duckBus = duckBus;
    this.autoScaleGain = autoScale;

    this.layerGain = {};
    for (const id of LAYER_IDS) {
      const bus = context.createGain();
      const on = LAYER_GATES[id] <= 0;
      bus.gain.value = on ? 1 : 0.0001;
      this.layerOn[id] = on;
      // Drums (L0/L1) bypass the sidechain; melodic layers (L2..L7) duck under the kick.
      bus.connect(id === "L0" || id === "L1" ? autoScale : duckBus);
      this.layerGain[id] = bus;
    }
  }

  private layerDestination(id: LayerId): AudioNode {
    if (!this.layerGain[id]) {
      this.ensureContext();
    }
    return this.layerGain[id] ?? this.getMusicDestination();
  }

  /** Whether a layer's gate is currently open (used to skip scheduling silent melodic layers). */
  private layerLive(id: LayerId): boolean {
    // In the menu/garage the speed-driven intensity isn't meaningful — keep melodic layers audible.
    if (this.musicMode !== "run") {
      return true;
    }
    return this.layerOn[id];
  }

  /** Per-tick: smooth the intensity, flip layer gates (with hysteresis), keep output headroom. */
  private updateMusicIntensity(): void {
    const context = this.context;
    if (!context) {
      return;
    }

    this.musicIntensitySmoothed += (this.musicIntensityTarget - this.musicIntensitySmoothed) * 0.025;
    const v = this.musicIntensitySmoothed;

    for (const id of LAYER_IDS) {
      const gate = LAYER_GATES[id];
      if (gate <= 0) {
        continue; // L0..L3 are always on
      }
      const on = this.layerOn[id];
      const threshold = on ? gate - LAYER_HYSTERESIS : gate + LAYER_HYSTERESIS;
      const next = v >= threshold;
      if (next !== on) {
        this.layerOn[id] = next;
        this.layerGain[id]?.gain.setTargetAtTime(next ? 1 : 0.0001, context.currentTime, 0.2);
      }
    }

    this.updateAutoScale();
  }

  /** Trim the summed music level as more layers stack so the output keeps headroom. */
  private updateAutoScale(): void {
    const context = this.context;
    const node = this.autoScaleGain;
    if (!context || !node) {
      return;
    }
    let count = 0;
    for (const id of LAYER_IDS) {
      if (this.layerOn[id]) {
        count += 1;
      }
    }
    const scale = Math.min(1, 1.4 / Math.sqrt(Math.max(1, count)));
    node.gain.setTargetAtTime(scale, context.currentTime, 0.1);
  }

  /** Sidechain: duck the melodic bus under each kick, recovering over ~120 ms (the "pump"). */
  private duckOnKick(time: number): void {
    const duck = this.duckBus;
    if (!duck) {
      return;
    }
    duck.gain.cancelScheduledValues(time);
    duck.gain.setValueAtTime(0.6, time);
    duck.gain.linearRampToValueAtTime(1, time + 0.12);
  }

  /** Triangular jitter in seconds (sum of two uniforms ≈ centred, natural-feeling micro-timing). */
  private tri(maxSeconds: number): number {
    return ((Math.random() + Math.random()) / 2) * 2 * maxSeconds - maxSeconds;
  }

  /** Humanised velocity: scale a base level down by up to 18% at random. */
  private humanVel(base: number): number {
    return base * (1 - Math.random() * 0.18);
  }

  /** Swing: delay odd 16ths by a fraction of a 16th (MPC-style behind-the-beat groove). */
  private swingOffset(localStep: number): number {
    return localStep % 2 === 1 ? DEFAULT_SWING * SIXTEENTH_SECONDS : 0;
  }

  /** Never schedule a start in the past — Web Audio would clamp it to "now" and click/flam. */
  private clampStart(time: number): number {
    const context = this.context;
    return context ? Math.max(time, context.currentTime + 0.005) : time;
  }

  private stopNode(node: ScheduledNode, when?: number): void {
    try {
      node.stop(when);
    } catch {
      // Already stopped nodes are expected when clearing scheduled audio.
    }
  }

  private createNoiseBuffer(context: AudioContext): AudioBuffer {
    const length = Math.max(1, Math.floor(context.sampleRate * 1.5));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  private getNoiseBuffer(context: AudioContext): AudioBuffer {
    if (!this.noiseBuffer) {
      this.noiseBuffer = this.createNoiseBuffer(context);
    }

    return this.noiseBuffer;
  }

  private getMusicDestination(): GainNode {
    if (!this.musicGain) {
      this.ensureContext();
    }

    if (!this.musicGain) {
      throw new Error("Music gain node could not be initialized.");
    }

    return this.musicGain;
  }

  private clamp01(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.min(1, Math.max(0, value));
  }
}
