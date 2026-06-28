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

// --- Song-form arrangement (Phase 2) ---
// A run is not a 4-bar loop on repeat — it walks an 8-section macro form (8 bars each = 64 bars
// ≈ 2.7 min), so the same groove keeps re-contextualising. The bridge MANDATORILY drops the drums
// (negative space resets the ear's habituation — the Nujabes trick), and the last bar of each
// section fills.
type SectionName = "intro" | "A" | "A2" | "B" | "bridge" | "build";

interface SectionDef {
  name: SectionName;
  bars: number;
  drums: "full" | "half" | "out";
  /** A floor the section asserts on the musical intensity (B/build lift energy regardless of speed). */
  intensityFloor: number;
}

const RUN_SECTIONS: SectionDef[] = [
  { name: "intro", bars: 8, drums: "half", intensityFloor: 0 },
  { name: "A", bars: 8, drums: "full", intensityFloor: 0 },
  { name: "A2", bars: 8, drums: "full", intensityFloor: 0 },
  { name: "B", bars: 8, drums: "full", intensityFloor: 0.2 },
  { name: "A", bars: 8, drums: "full", intensityFloor: 0 },
  { name: "bridge", bars: 8, drums: "out", intensityFloor: 0 },
  { name: "A2", bars: 8, drums: "full", intensityFloor: 0 },
  { name: "build", bars: 8, drums: "full", intensityFloor: 0.15 },
];

interface DrumGrid {
  kick: number[];
  snare: number[];
  hat: number[];
  openHat: number[];
}

// 2–3 groove variants rotated per bar so the backbeat skeleton itself changes (pure humanisation
// alone fatigues after a few minutes — the unchanged grid is the real culprit).
const RUN_DRUM_VARIANTS: DrumGrid[] = [
  { kick: [0, 6, 10], snare: [4, 12], hat: [0, 2, 4, 6, 7, 8, 10, 12, 14, 15], openHat: [15] },
  { kick: [0, 6, 10, 14], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], openHat: [7, 15] },
  { kick: [0, 3, 6, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 11, 12, 14], openHat: [15] },
];

// --- Generative lead melody (Phase 3) ---
// D "yo" pentatonic (D–E–G–A–B): the bright, no-minor-2nd village scale. The lead is regenerated
// every 2 bars as a directional drunken-walk over scale degrees (stepwise motion = singable), with
// question/answer phrasing (antecedent rises, the consequent falls and resolves to the root) and a
// per-section motif shift — so it never exactly repeats yet always stays in key and coherent.
const RUN_SCALE = [0, 2, 5, 7, 9];
const RUN_TONIC_HZ = NOTE_FREQUENCIES.D4;
const SECTION_LEAD: Record<SectionName, { degreeShift: number; octave: number; densityMul: number }> = {
  intro: { degreeShift: 0, octave: 0, densityMul: 0.45 },
  A: { degreeShift: 0, octave: 0, densityMul: 1 },
  A2: { degreeShift: 1, octave: 0, densityMul: 1 },
  B: { degreeShift: 2, octave: 0, densityMul: 1.2 },
  bridge: { degreeShift: 0, octave: -1, densityMul: 0.55 },
  build: { degreeShift: 0, octave: 0, densityMul: 1.35 },
};
// Candidate lead onsets within a bar (the downbeat always fires; the rest pass a density roll).
const LEAD_ONSETS = [0, 2, 3, 6, 8, 10, 11, 14];

type LeadPhrase = Map<number, { freq: number; vel: number }>;

// --- Per-biome themes (Phase 4) ---
// Every theme locks to the same 96 BPM / 16-step grid, so leg-boundary crossfades are pure
// gain ramps with no retiming. What differs is the *world*: scale + tonic, swing/feel, drum kit,
// lead timbre, bass style, pad/noise-bed texture, and the chord-root progression. That divergence
// is what makes the neon city sound nothing like the misty valley.
type DrumKit = "boombap" | "brushed" | "electronic" | "taiko";
type LeadStyle = "koto" | "rhodes" | "supersaw" | "shakuhachi";
type BassStyle = "round" | "funk" | "drone";

type AccentKind = "none" | "synthBell" | "panFlute";

interface BiomeTheme {
  key: string;
  tonicHz: number;
  scale: number[]; // semitone offsets from the tonic (the lead/bass pitch set)
  swing: number;
  drumVariants: DrumGrid[];
  kit: DrumKit;
  bassSteps: number[]; // which 16th steps the bass articulates
  bassStyle: BassStyle;
  leadStyle: LeadStyle;
  chordRootSemis: number[]; // chord-root semitone offsets from the tonic, cycled every chordBars (drives the bass)
  chordBars: number;
  accent: AccentKind; // a per-biome "evolution" voice layered over the shared village spine
}

// All biomes share ONE soundtrack — the warm D lo-fi-hip-hop village spine (same tonic, swing, kit
// family + koto lead) — and merely EVOLVE it from leg to leg rather than cutting to a new genre:
// autumn reharmonises to in-sen + Rhodes; the neon city keeps the beat but adds a bright synth-bell
// sparkle; the forest stays calm + soft and floats a pan-flute counter-melody over the koto.
const BIOME_THEMES: BiomeTheme[] = [
  {
    key: "village",
    tonicHz: RUN_TONIC_HZ,
    scale: RUN_SCALE, // D yo — bright, no minor 2nd
    swing: DEFAULT_SWING,
    drumVariants: RUN_DRUM_VARIANTS,
    kit: "boombap",
    bassSteps: [0, 6, 10],
    bassStyle: "round",
    leadStyle: "koto",
    chordRootSemis: [0, 5, 7, 9], // D – G – A – B
    chordBars: 2,
    accent: "none",
  },
  {
    key: "village_autumn",
    tonicHz: NOTE_FREQUENCIES.D4,
    scale: [0, 1, 5, 7, 10], // D in-sen — the ♭2/♭7 ache; same tonic so the season-flip glides
    swing: 0.18,
    drumVariants: RUN_DRUM_VARIANTS,
    kit: "brushed",
    bassSteps: [0, 6, 10],
    bassStyle: "round",
    leadStyle: "rhodes",
    chordRootSemis: [0, 5, 2, 7], // D – G – E – A
    chordBars: 2,
    accent: "none",
  },
  {
    // 電脳都市 — the SAME village beat at night, lifted by a bright electronic sparkle (no genre
    // change): same D key, swing + koto lead, with a shimmering synth-bell arp layered on top.
    key: "neon",
    tonicHz: NOTE_FREQUENCIES.D4,
    scale: [0, 2, 5, 7, 9], // D yo — stay in the village key
    swing: 0.16,
    drumVariants: RUN_DRUM_VARIANTS,
    kit: "boombap",
    bassSteps: [0, 6, 10],
    bassStyle: "round",
    leadStyle: "koto",
    chordRootSemis: [0, 7, 9, 5], // D – A – B – G (a brighter, lifted turn, still in D)
    chordBars: 2,
    accent: "synthBell",
  },
  {
    // 奥山渓谷 — the same spine, calmer + more open: softer brushed kit, slower harmonic motion and
    // a gentle pan-flute counter-melody floating over the koto.
    key: "forest",
    tonicHz: NOTE_FREQUENCIES.D4,
    scale: [0, 2, 5, 7, 9], // D yo — stay in the village key
    swing: 0.14,
    drumVariants: RUN_DRUM_VARIANTS,
    kit: "brushed",
    bassSteps: [0, 10],
    bassStyle: "round",
    leadStyle: "koto",
    chordRootSemis: [0, 5, 0, 7], // D – G – D – A (restful, pedal-ish)
    chordBars: 4,
    accent: "panFlute",
  },
];

const BIOME_THEME_BY_KEY: Record<string, BiomeTheme> = Object.fromEntries(
  BIOME_THEMES.map((theme) => [theme.key, theme]),
);

interface ArrangerState {
  barCounter: number;
  sectionIdx: number;
  sectionBar: number;
  variantIdx: number;
  drumsMode: "full" | "half" | "out";
  intensityFloor: number;
  isFillBar: boolean;
  phraseHalf: number; // which bar (0/1) of the current 2-bar lead phrase
  leadPhrase: LeadPhrase; // precomputed lead notes for the 2-bar phrase, keyed by 0..31 step
  chordIdx: number; // index into the active theme's chordRootSemis progression
  chordRoot: number; // current chord-root semitone offset from the tonic (drives the bass)
}

// --- Per-car engine voice (the continuous EV motor) ---
// Each car gets its own character, keyed by its ability-kanji and refined by its price tier:
// waveform + pitch register + harmony interval + sub weight + EV coil-whine + brightness shape
// the "personality" so a heavy 鬼 Oni growls dark and low while a 龍 Dragon sings deep but bright.
// --- Per-car melodic engine voice ---
// The car "engine" is NOT a held drone — it's a quiet, key-locked D-pentatonic arpeggio the player
// accelerates THROUGH. Speed raises the arp rate, register (stepped), note density and brightness
// (never just raw pitch or level), so going faster feels musical, not shrill. Each car has its own
// motif + timbre; a whisper of sub-pad gives body; two slow LFOs let it "breathe". Strictly
// consonant in D, low in the mix, non-fatiguing over a long run.
// --- Per-car EV engine voice (continuous, NOT a melody) ---
// Real EV sounds (BMW/Vitale, Porsche, Hyundai e-ASD …) are built from the authentic raw material of
// an electric drivetrain: a stack of harmonic "orders" (a fundamental + integer-multiple partials
// that all sweep up in lockstep with the motor RPM), a tamed inverter/coil whine (the "this is
// electric" tell), a sub for weight, and a filtered noise bed (tyre/aero). Speed → a simulated
// rotational fundamental f0, from which we GLIDE (never step) pitch, brightness, level + whine.
// One engine, re-voiced per car. No notes, no key, no scheduler — purely continuous.
interface EngineVoice {
  f0Idle: number; // fundamental at idle (Hz)
  f0Max: number; // fundamental flat-out (Hz)
  orderAmps: Array<[number, number]>; // [harmonic order, amplitude] → the car's PeriodicWave timbre
  detuneCents: number; // unison width between the two order oscillators (±3–9 ¢ → chorus, not beat)
  subLevel: number; // sub weight
  subOctaveDown: boolean; // true ⇒ sub at f0/2 (chest-thump for heavy cars)
  whineHz: number; // inverter carrier (2–8 kHz)
  whineSpeedHz: number; // weak speed coupling on the carrier (never sweeps into a siren)
  whineLevel: number; // inverter whine level (very low)
  warmth: number; // WaveShaper soft-saturation drive (0.1–0.45)
  brightCap: number; // ceiling the order lowpass opens toward with speed (Hz)
  noiseLevel: number; // tyre/aero bed level
}

// Build a 32-bin sine-harmonic table for createPeriodicWave (index n = nth order amplitude).
const orderWave = (amps: Array<[number, number]>): Float32Array => {
  const imag = new Float32Array(32);
  for (const [n, a] of amps) {
    if (n > 0 && n < 32) {
      imag[n] = a;
    }
  }
  return imag;
};

// 赤 Crimson Bolt — warm, eager, friendly hero (also the default/fallback voice).
const DEFAULT_VOICE: EngineVoice = {
  f0Idle: 70,
  f0Max: 240,
  orderAmps: [
    [1, 1],
    [2, 0.6],
    [3, 0.4],
    [4, 0.2],
    [6, 0.22],
    [8, 0.1],
  ],
  detuneCents: 6,
  subLevel: 0.5,
  subOctaveDown: false,
  whineHz: 3200,
  whineSpeedHz: 300,
  whineLevel: 0.5,
  warmth: 0.2,
  brightCap: 6500,
  noiseLevel: 0.5,
};

// 7 EV signatures — one engine, distinct voices. Cheaper/sportier = brighter + higher f0 + less
// warmth + more edge; pricier = deeper + fuller even-order stack + sub-octave + more warmth (richer,
// never louder/sharper). Orders 5 & 7 are kept weak (the harsh motor harmonics).
const ENGINE_VOICES: Record<string, EngineVoice> = {
  "赤": DEFAULT_VOICE,
  // 藍 Indigo Drift — clean, glassy, futuristic; near-pure body, silky high whine.
  "藍": { f0Idle: 78, f0Max: 250, orderAmps: [[1, 1], [2, 0.45], [3, 0.12], [4, 0.06]], detuneCents: 4, subLevel: 0.3, subOctaveDown: false, whineHz: 2600, whineSpeedHz: 260, whineLevel: 0.7, warmth: 0.1, brightCap: 7000, noiseLevel: 0.4 },
  // 桜 Sakura Roadster — soft, gentle, sweet (calmest); even-rich + airy, rolled-off top.
  "桜": { f0Idle: 80, f0Max: 230, orderAmps: [[1, 1], [2, 0.5], [3, 0.08], [4, 0.3], [6, 0.12], [8, 0.06]], detuneCents: 5, subLevel: 0.4, subOctaveDown: false, whineHz: 3600, whineSpeedHz: 220, whineLevel: 0.25, warmth: 0.15, brightCap: 5000, noiseLevel: 0.45 },
  // 狐 Kitsune GT — quick, nimble, mischievous; peaky slot-whine, steepest rise.
  "狐": { f0Idle: 85, f0Max: 300, orderAmps: [[1, 0.9], [2, 0.3], [3, 0.4], [6, 0.45], [12, 0.3]], detuneCents: 7, subLevel: 0.3, subOctaveDown: false, whineHz: 4200, whineSpeedHz: 360, whineLevel: 0.6, warmth: 0.25, brightCap: 6800, noiseLevel: 0.5 },
  // 将 Daimyo Coupe — stately, full, noble turbine; dense + open.
  "将": { f0Idle: 60, f0Max: 200, orderAmps: [[1, 1], [2, 0.6], [3, 0.5], [4, 0.25], [6, 0.2], [8, 0.22], [12, 0.18]], detuneCents: 9, subLevel: 0.7, subOctaveDown: false, whineHz: 3000, whineSpeedHz: 240, whineLevel: 0.4, warmth: 0.3, brightCap: 5500, noiseLevel: 0.45 },
  // 鬼 Oni Racer — dark, heavy, menace-but-smooth; growl + sub rise, brightness clamped dark.
  "鬼": { f0Idle: 55, f0Max: 190, orderAmps: [[1, 1], [2, 0.55], [3, 0.45], [4, 0.2], [6, 0.4], [9, 0.12]], detuneCents: 9, subLevel: 0.8, subOctaveDown: true, whineHz: 5000, whineSpeedHz: 200, whineLevel: 0.2, warmth: 0.45, brightCap: 3400, noiseLevel: 0.4 },
  // 龍 Dragon Zero — majestic, deep-but-bright hyperdrive; full even stack, jewel whine.
  "龍": { f0Idle: 50, f0Max: 200, orderAmps: [[1, 1], [2, 0.6], [3, 0.35], [4, 0.4], [6, 0.3], [8, 0.25], [10, 0.15], [12, 0.18], [16, 0.1], [24, 0.06]], detuneCents: 6, subLevel: 0.7, subOctaveDown: true, whineHz: 2400, whineSpeedHz: 280, whineLevel: 0.55, warmth: 0.4, brightCap: 7000, noiseLevel: 0.4 },
};

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
  // The EV motor is ONE continuous, speed-driven voice (no notes, no key): a harmonic-"orders" stack
  // (two PeriodicWave oscillators, detuned + panned) shaped by a speed-opening lowpass + soft
  // saturation, a tamed inverter whine, a sub, a tyre/aero noise bed, and two slow breath LFOs.
  // Re-voiced per car. See EngineVoice / ENGINE_VOICES.
  private engine: {
    bus: GainNode;
    ceilingLP: BiquadFilterNode;
    orderA: OscillatorNode;
    orderB: OscillatorNode;
    panA: StereoPannerNode;
    panB: StereoPannerNode;
    orderGain: GainNode;
    brightLP: BiquadFilterNode;
    shaper: WaveShaperNode;
    sub: OscillatorNode;
    subGain: GainNode;
    whine: OscillatorNode;
    whineBP: BiquadFilterNode;
    whineGain: GainNode;
    noise: AudioBufferSourceNode;
    noiseHP: BiquadFilterNode;
    noiseLP: BiquadFilterNode;
    noiseGain: GainNode;
    breathA: OscillatorNode;
    breathADepth: GainNode;
    breathB: OscillatorNode;
    breathBDepth: GainNode;
  } | null = null;
  private runIntensity = 0.4;
  private voice: EngineVoice = DEFAULT_VOICE;
  // Coin-chime pitch climbs over a quick streak but resets after a 2 s gap (so it doesn't sit high).
  private coinSoundStep = 0;
  private lastCoinSoundTime = -10;

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
  // Active biome theme (scale/tonic/kit/lead/chords). The run cycles through these per leg.
  private theme: BiomeTheme = BIOME_THEMES[0];
  private currentBiomeKey = "village";
  private pendingBiomeKey: string | null = null;
  // A master lowpass swept on biome changes to glide between themes (otherwise the cut is abrupt).
  private musicSweepLP: BiquadFilterNode | null = null;
  // Run-mode song-form cursor; advanced once per bar at the bar boundary.
  private arranger: ArrangerState = {
    barCounter: 0,
    sectionIdx: 0,
    sectionBar: -1,
    variantIdx: 0,
    drumsMode: "half",
    intensityFloor: 0,
    isFillBar: false,
    phraseHalf: 0,
    leadPhrase: new Map(),
    chordIdx: 0,
    chordRoot: 0,
  };

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
      const theme = BIOME_THEME_BY_KEY[this.currentBiomeKey] ?? BIOME_THEMES[0];
      this.pendingBiomeKey = null;
      this.arranger = {
        barCounter: 0,
        sectionIdx: 0,
        sectionBar: -1,
        variantIdx: 0,
        drumsMode: RUN_SECTIONS[0].drums,
        intensityFloor: RUN_SECTIONS[0].intensityFloor,
        isFillBar: false,
        phraseHalf: 0,
        leadPhrase: new Map(),
        chordIdx: 0,
        chordRoot: theme.chordRootSemis[0] ?? 0,
      };
      this.activateBiome(theme.key, true);
    } else {
      this.musicIntensityTarget = mode === "menu" ? 0.5 : 0.45;
      this.musicIntensitySmoothed = this.musicIntensityTarget;
      this.theme = BIOME_THEMES[0]; // menu/garage use the village feel (swing/koto), no biome textures
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
    this.pendingBiomeKey = null;
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

  /**
   * Give the EV motor the character of the selected car by swapping its voice. `kanji` is the car's
   * ability glyph (its personality); `tierRank` (0 common … 3 legend) refines pricier cars — a hair
   * more warmth + chorus width — never louder or sharper. Live-swappable while running.
   */
  setVehicleEngine(kanji: string, tierRank = 0): void {
    const base = ENGINE_VOICES[kanji] ?? DEFAULT_VOICE;
    const rank = Math.max(0, Math.min(3, Math.floor(tierRank)));
    this.voice = {
      ...base,
      warmth: Math.min(0.5, base.warmth + rank * 0.03),
      detuneCents: base.detuneCents + rank * 0.6,
    };
    if (this.engine) {
      this.rebuildEngineTimbre();
    }
    this.applyEngineIntensity();
  }

  /** Soft tanh saturation curve for the WaveShaper (warmth, gentle even-harmonic colour). */
  private makeShaperCurve(drive: number) {
    const n = 1024;
    const curve = new Float32Array(n);
    const k = drive * 8 + 0.01;
    for (let i = 0; i < n; i += 1) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = Math.tanh(k * x) / Math.tanh(k);
    }
    return curve;
  }

  /** Re-voice a running engine: swap the order timbre (PeriodicWave) + saturation for the new car. */
  private rebuildEngineTimbre(): void {
    const engine = this.engine;
    const ctx = this.context;
    if (!engine || !ctx) {
      return;
    }
    const wave = ctx.createPeriodicWave(new Float32Array(32), orderWave(this.voice.orderAmps));
    engine.orderA.setPeriodicWave(wave);
    engine.orderB.setPeriodicWave(wave);
    engine.orderB.detune.setValueAtTime(this.voice.detuneCents, ctx.currentTime);
    engine.shaper.curve = this.makeShaperCurve(this.voice.warmth);
  }

  private startEngine(): void {
    if (this.engine) {
      return;
    }
    const ctx = this.ensureContext();
    const out = this.sfxGain ?? ctx.destination;
    const v = this.voice;

    // Master bus → warm ceiling lowpass (anti-sharpness) → sfx.
    const bus = ctx.createGain();
    bus.gain.value = 0.0001;
    const ceilingLP = ctx.createBiquadFilter();
    ceilingLP.type = "lowpass";
    ceilingLP.frequency.value = 8500;
    ceilingLP.Q.value = 0.5;
    bus.connect(ceilingLP);
    ceilingLP.connect(out);

    // ENGINE ORDERS (the body): two PeriodicWave oscillators (the car's harmonic timbre) detuned +
    // panned for width → order gain → a speed-opening lowpass → soft saturation → bus.
    const wave = ctx.createPeriodicWave(new Float32Array(32), orderWave(v.orderAmps));
    const orderA = ctx.createOscillator();
    orderA.setPeriodicWave(wave);
    const orderB = ctx.createOscillator();
    orderB.setPeriodicWave(wave);
    orderB.detune.setValueAtTime(v.detuneCents, ctx.currentTime);
    const panA = ctx.createStereoPanner();
    panA.pan.value = -0.4;
    const panB = ctx.createStereoPanner();
    panB.pan.value = 0.4;
    const orderGain = ctx.createGain();
    orderGain.gain.value = 0.06;
    const brightLP = ctx.createBiquadFilter();
    brightLP.type = "lowpass";
    brightLP.frequency.value = 350;
    brightLP.Q.value = 0.7;
    const shaper = ctx.createWaveShaper();
    shaper.curve = this.makeShaperCurve(v.warmth);
    shaper.oversample = "4x";
    orderA.connect(panA);
    orderB.connect(panB);
    panA.connect(orderGain);
    panB.connect(orderGain);
    orderGain.connect(brightLP);
    brightLP.connect(shaper);
    shaper.connect(bus);

    // SUB (weight): a sine at the fundamental (or an octave below for heavy cars).
    const sub = ctx.createOscillator();
    sub.type = "sine";
    const subGain = ctx.createGain();
    subGain.gain.value = 0.0001;
    sub.connect(subGain);
    subGain.connect(bus);

    // INVERTER WHINE (the "electric" tell): a faint, bandpassed high sine, gated up with speed.
    const whine = ctx.createOscillator();
    whine.type = "sine";
    whine.frequency.value = v.whineHz;
    const whineBP = ctx.createBiquadFilter();
    whineBP.type = "bandpass";
    whineBP.frequency.value = v.whineHz;
    whineBP.Q.value = 10;
    const whineGain = ctx.createGain();
    whineGain.gain.value = 0.0001;
    whine.connect(whineBP);
    whineBP.connect(whineGain);
    whineGain.connect(bus);

    // NOISE BED (tyre/aero): high-passed, speed-opening lowpassed loop — non-tonal presence.
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    noise.loop = true;
    const noiseHP = ctx.createBiquadFilter();
    noiseHP.type = "highpass";
    noiseHP.frequency.value = 200;
    const noiseLP = ctx.createBiquadFilter();
    noiseLP.type = "lowpass";
    noiseLP.frequency.value = 800;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.0001;
    noise.connect(noiseHP);
    noiseHP.connect(noiseLP);
    noiseLP.connect(noiseGain);
    noiseGain.connect(bus);

    // Two very slow "breathing" LFOs (well below the 4 Hz fluctuation peak) so a held speed lives.
    const breathA = ctx.createOscillator();
    breathA.type = "sine";
    breathA.frequency.value = 0.05;
    const breathADepth = ctx.createGain();
    breathADepth.gain.value = 0.05; // ± on bus gain (~10% breathing)
    breathA.connect(breathADepth);
    breathADepth.connect(bus.gain);
    const breathB = ctx.createOscillator();
    breathB.type = "sine";
    breathB.frequency.value = 0.067;
    const breathBDepth = ctx.createGain();
    breathBDepth.gain.value = 350; // ± on the order-brightness cutoff (Hz)
    breathB.connect(breathBDepth);
    breathBDepth.connect(brightLP.frequency);

    orderA.start();
    orderB.start();
    sub.start();
    whine.start();
    noise.start();
    breathA.start();
    breathB.start();

    this.engine = {
      bus,
      ceilingLP,
      orderA,
      orderB,
      panA,
      panB,
      orderGain,
      brightLP,
      shaper,
      sub,
      subGain,
      whine,
      whineBP,
      whineGain,
      noise,
      noiseHP,
      noiseLP,
      noiseGain,
      breathA,
      breathADepth,
      breathB,
      breathBDepth,
    };
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
    engine.bus.gain.cancelScheduledValues(now);
    engine.bus.gain.setTargetAtTime(0.0001, now, 0.12);
    const stopAt = now + 0.8; // let the fade reach silence before the hard stop
    const oscillators = [engine.orderA, engine.orderB, engine.sub, engine.whine, engine.noise, engine.breathA, engine.breathB];
    let pending = oscillators.length;
    const cleanup = () => {
      for (const node of [
        engine.orderA,
        engine.orderB,
        engine.sub,
        engine.whine,
        engine.noise,
        engine.breathA,
        engine.breathB,
        engine.panA,
        engine.panB,
        engine.orderGain,
        engine.brightLP,
        engine.shaper,
        engine.subGain,
        engine.whineBP,
        engine.whineGain,
        engine.noiseHP,
        engine.noiseLP,
        engine.noiseGain,
        engine.breathADepth,
        engine.breathBDepth,
        engine.ceilingLP,
        engine.bus,
      ]) {
        try {
          node.disconnect();
        } catch {
          // already gone
        }
      }
    };
    for (const osc of oscillators) {
      osc.onended = () => {
        pending -= 1;
        if (pending <= 0) {
          cleanup();
        }
      };
      try {
        osc.stop(stopAt);
      } catch {
        pending -= 1;
        if (pending <= 0) {
          cleanup();
        }
      }
    }
  }

  /** Speed is the ONLY input: glide the continuous EV voice (no notes, no scheduler). */
  private applyEngineIntensity(): void {
    const engine = this.engine;
    const ctx = this.context;
    if (!engine || !ctx) {
      return;
    }
    const t = ctx.currentTime;
    const v = this.voice;
    const s = this.clamp01((this.runIntensity - 0.5) / 0.5); // 0 idle → 1 flat-out
    const boost = this.clamp01((this.runIntensity - 1.0) / 0.8); // 0 → 1 only when boosted

    // Simulated rotational fundamental: geometric pitch glide (perceived as linear acceleration).
    const f0 = v.f0Idle * Math.pow(v.f0Max / v.f0Idle, Math.min(s, 1));
    engine.orderA.frequency.setTargetAtTime(f0, t, 0.05);
    engine.orderB.frequency.setTargetAtTime(f0, t, 0.05);
    engine.sub.frequency.setTargetAtTime(v.subOctaveDown ? f0 / 2 : f0, t, 0.12);
    // The spectrum "opens up" with speed — one moving lowpass on the order stack (the AVAS trick).
    engine.brightLP.frequency.setTargetAtTime(350 * Math.pow(v.brightCap / 350, s), t, 0.25);
    engine.subGain.gain.setTargetAtTime(v.subLevel * 0.12 * (1 - 0.4 * s), t, 0.3); // eases back at speed
    engine.bus.gain.setTargetAtTime(0.45 + 0.12 * s, t, 0.3); // master — low, behind the music
    engine.noiseLP.frequency.setTargetAtTime(800 + 4000 * s, t, 0.3);
    engine.noiseGain.gain.setTargetAtTime(v.noiseLevel * 0.02 * (0.4 + 0.6 * s), t, 0.3);
    const whineHz = v.whineHz + v.whineSpeedHz * s;
    engine.whine.frequency.setTargetAtTime(whineHz, t, 0.1);
    engine.whineBP.frequency.setTargetAtTime(whineHz, t, 0.1);
    const whineGate = Math.max(boost, this.clamp01((s - 0.6) / 0.4));
    engine.whineGain.gain.setTargetAtTime(v.whineLevel * whineGate * 0.02, t, 0.2);
  }

  setSettings(settings: Partial<ProceduralAudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.applySettings();
  }

  playCoin(_combo = 0): void {
    const context = this.ensureContext();
    const now = context.currentTime;
    // The chime climbs only while coins keep coming; a >2 s gap resets it to the base pitch, so it
    // doesn't sit permanently "up". Driven by real time here, not the game combo (which can persist).
    if (now - this.lastCoinSoundTime > 2) {
      this.coinSoundStep = 0;
    } else {
      this.coinSoundStep = Math.min(this.coinSoundStep + 1, 16);
    }
    this.lastCoinSoundTime = now;
    const f = 820 * Math.pow(2, this.coinSoundStep / 16); // pitch climbs up to an octave over a streak
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
    this.musicSweepLP?.disconnect();
    this.masterGain?.disconnect();
    this.musicGain?.disconnect();
    this.sfxGain?.disconnect();
    this.compressor?.disconnect();
    this.noiseBuffer = null;

    this.context = null;
    this.duckBus = null;
    this.autoScaleGain = null;
    this.musicSweepLP = null;
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
    if (this.musicMode === "run") {
      if (localStep === 0) {
        this.advanceBar();
      }
      this.scheduleRunStep(localStep, time);
    } else {
      this.scheduleAmbientStep(step, localStep, bar, time);
    }
  }

  /** Walk the song-form one bar at the bar boundary. Cheap (no allocation) — safe to run N times
   *  in a catch-up tick without causing the very lateness it guards against. */
  private advanceBar(): void {
    const arr = this.arranger;

    // Apply a queued biome change on the bar boundary — a beat-locked crossfade.
    let biomeChanged = false;
    if (this.pendingBiomeKey && this.pendingBiomeKey !== this.currentBiomeKey) {
      this.activateBiome(this.pendingBiomeKey, false);
      biomeChanged = true;
    }
    this.pendingBiomeKey = null;

    arr.barCounter += 1;
    arr.sectionBar += 1;
    let section = RUN_SECTIONS[arr.sectionIdx];
    if (arr.sectionBar >= section.bars) {
      arr.sectionIdx = (arr.sectionIdx + 1) % RUN_SECTIONS.length;
      arr.sectionBar = 0;
      section = RUN_SECTIONS[arr.sectionIdx];
    }
    arr.drumsMode = section.drums;
    arr.intensityFloor = section.intensityFloor;
    arr.isFillBar = arr.sectionBar === section.bars - 1;
    // Rotate the groove variant per bar — usually the home variant, occasionally a cousin.
    arr.variantIdx =
      Math.random() < 0.62 ? 0 : 1 + Math.floor(Math.random() * Math.max(1, this.theme.drumVariants.length - 1));

    // Chord progression → moving bass root.
    const chordIdx = Math.floor((arr.barCounter - 1) / this.theme.chordBars) % this.theme.chordRootSemis.length;
    if (chordIdx !== arr.chordIdx) {
      arr.chordIdx = chordIdx;
      arr.chordRoot = this.theme.chordRootSemis[chordIdx];
    }

    // Lead phrasing: regenerate a fresh 2-bar question/answer phrase at the start of each pair,
    // or immediately on a biome change so the new timbre never plays the old key's notes.
    const firstOfPair = arr.barCounter % 2 === 1;
    arr.phraseHalf = firstOfPair ? 0 : 1;
    if (firstOfPair || biomeChanged) {
      arr.leadPhrase = this.generateLeadPhrase();
    }
  }

  /** Theme-driven run step: drum grid + section drum-mode (bridge drop / intro half) + fills. */
  private scheduleRunStep(localStep: number, time: number): void {
    const arr = this.arranger;
    const theme = this.theme;
    const grid = theme.drumVariants[arr.variantIdx % theme.drumVariants.length];
    const kit = theme.kit;
    const swung = time + this.swingOffset(localStep);
    const onZero = localStep === 0;
    const drumsOut = arr.drumsMode === "out";
    const drumsHalf = arr.drumsMode === "half";

    if (!drumsOut) {
      const kickHit = drumsHalf ? localStep === 0 || localStep === 8 : grid.kick.includes(localStep);
      if (kickHit) {
        this.scheduleKick(this.clampStart(swung + 0.018 + this.tri(0.006)), kit);
      }

      const snareHit = drumsHalf ? localStep === 12 : grid.snare.includes(localStep);
      if (snareHit) {
        const early = onZero ? 0 : 0.006;
        this.scheduleSnare(this.clampStart(swung - early + this.tri(0.006)), this.humanVel(1), kit);
      } else if (!drumsHalf && (localStep === 3 || localStep === 7 || localStep === 11) && Math.random() < 0.12) {
        this.scheduleSnare(this.clampStart(swung + this.tri(0.006)), 0.3, kit); // ghost
      }

      const hatHit = drumsHalf ? localStep % 4 === 0 : grid.hat.includes(localStep);
      if (hatHit && Math.random() < 0.92) {
        const accent = (localStep % 4 === 0 ? 1 : 0.72) * this.humanVel(1);
        this.scheduleClosedHat(this.clampStart(swung + this.tri(0.006)), accent);
      }

      if (!drumsHalf && !arr.isFillBar && grid.openHat.includes(localStep)) {
        this.scheduleOpenHat(this.clampStart(swung + this.tri(0.006)));
      }

      // Section-end fill: a quick 1/64 hat roll across the last beat.
      if (arr.isFillBar && localStep === 14) {
        for (let i = 0; i < 4; i += 1) {
          this.scheduleClosedHat(
            this.clampStart(swung + (i * SIXTEENTH_SECONDS) / 4 + this.tri(0.004)),
            (0.55 + i * 0.12) * this.humanVel(1),
          );
        }
      }
    }

    // Bass follows the chord root (sub register). Keeps a downbeat pedal through the bridge.
    if (theme.bassSteps.includes(localStep) && (!drumsOut || localStep === 0)) {
      this.scheduleBassVoice(
        this.clampStart(swung + this.tri(0.004)),
        this.bassFreqForRoot(arr.chordRoot),
        theme.bassStyle,
        localStep,
      );
    }

    // Generative lead (L4): play this step's precomputed note in the biome's lead timbre.
    if (this.layerLive("L4")) {
      const note = arr.leadPhrase.get(arr.phraseHalf * STEPS_PER_BAR + localStep);
      if (note) {
        this.scheduleLead(this.clampStart(swung + this.tri(0.012)), note.freq, note.vel * this.humanVel(1), theme.leadStyle);
        // Octave grace-note sparkle at high intensity (L6).
        if (this.layerLive("L6") && Math.random() < 0.1) {
          this.scheduleLead(
            this.clampStart(swung + SIXTEENTH_SECONDS / 2 + this.tri(0.012)),
            note.freq * 2,
            note.vel * 0.4,
            theme.leadStyle,
          );
        }
      }
    }

    // Per-biome "evolution" accent — same song, gently developed. Comes in with the lead (L4):
    // a bright synth-bell sparkle in the neon city, a soft pan-flute counter-melody in the forest.
    if (theme.accent !== "none" && this.layerLive("L4")) {
      if (theme.accent === "synthBell" && (localStep === 2 || localStep === 6 || localStep === 10 || localStep === 14)) {
        const bellDeg = [5, 7, 9, 7][((localStep - 2) / 4) | 0]; // D5 · G5 · B5 · G5 — a bright arp
        this.scheduleSynthBell(this.clampStart(swung + this.tri(0.01)), this.degreeToFreq(bellDeg), 0.07 * this.humanVel(1));
      } else if (theme.accent === "panFlute" && localStep === 0) {
        const fluteLine = [3, 4, 2, 3, 0, 2, 4, 3]; // a slow lyrical counter-line over 8 bars
        const deg = fluteLine[arr.barCounter % fluteLine.length];
        this.scheduleAccentFlute(this.clampStart(swung + this.tri(0.01)), this.degreeToFreq(deg), 0.1);
      }
    }
  }

  /** Chord-root semitone offset → a bass frequency, dropped into the sub register (~55–110 Hz). */
  private bassFreqForRoot(rootSemis: number): number {
    let f = this.chordRootHz(rootSemis);
    while (f > 110) {
      f /= 2;
    }
    return f;
  }

  /** Menu/garage: the calmer, non-arranged groove (humanised), unchanged in feel. */
  private scheduleAmbientStep(step: number, localStep: number, bar: number, time: number): void {
    const swung = time + this.swingOffset(localStep);
    const onZero = localStep === 0;

    if (this.shouldPlayKick(localStep, bar)) {
      this.scheduleKick(this.clampStart(swung + 0.018 + this.tri(0.006)));
    }

    if (this.shouldPlaySnare(localStep)) {
      this.scheduleSnare(this.clampStart(swung - (onZero ? 0 : 0.006) + this.tri(0.006)), this.humanVel(1));
    }

    if (this.shouldPlayHat(localStep) && Math.random() < 0.92) {
      const accent = (localStep % 4 === 0 ? 1 : 0.72) * this.humanVel(1);
      this.scheduleClosedHat(this.clampStart(swung + this.tri(0.006)), accent);
    }

    this.scheduleMelodicPluck(step, swung);
  }

  /** Generate the next 2-bar lead phrase: a directional pentatonic walk with question/answer
   *  shape, strong-beat chord-tone gravity, a per-section motif shift, and a root resolution. */
  private generateLeadPhrase(): LeadPhrase {
    const phrase: LeadPhrase = new Map();
    const arr = this.arranger;
    const lead = SECTION_LEAD[RUN_SECTIONS[arr.sectionIdx].name];
    const intensity = Math.max(this.musicIntensitySmoothed, arr.intensityFloor);
    const density = Math.min(0.95, (0.4 + 0.5 * intensity) * lead.densityMul);
    const shift = lead.degreeShift + lead.octave * this.theme.scale.length;

    let degree = 2; // start a little above the root
    for (let half = 0; half < 2; half += 1) {
      const rising = half === 0; // antecedent climbs, consequent falls
      for (const s of LEAD_ONSETS) {
        if (s !== 0 && Math.random() >= density) {
          continue; // rest (the downbeat always sounds, for grounding)
        }
        const strong = s === 0 || s === 8;
        degree = this.nextDegree(degree, rising);
        if (strong && Math.random() < 0.6) {
          degree = Math.random() < 0.5 ? 0 : 3; // chord tone (root / 5th) on the strong beats
        }
        const vel = (strong ? 0.15 : 0.11) * (1 - Math.random() * 0.15);
        phrase.set(half * STEPS_PER_BAR + s, { freq: this.degreeToFreq(degree + shift), vel });
      }
    }

    // The consequent must resolve: force the final note of the phrase to the root.
    let lastStep = -1;
    for (const step of phrase.keys()) {
      if (step > lastStep) {
        lastStep = step;
      }
    }
    if (lastStep >= 0) {
      // Resolve to the actual tonic (drop the per-section degree shift, keep its octave) so A2/B
      // don't "resolve" onto the 2nd/3rd degree.
      phrase.set(lastStep, { freq: this.degreeToFreq(lead.octave * this.theme.scale.length), vel: 0.15 });
    }
    return phrase;
  }

  /** Weighted scale-step walk: mostly stepwise (singable), occasional small leaps, register-clamped. */
  private nextDegree(current: number, rising: boolean): number {
    const r = Math.random();
    let delta: number;
    if (r < 0.45) {
      delta = rising ? 1 : -1; // step with the phrase direction
    } else if (r < 0.7) {
      delta = rising ? -1 : 1; // step against (gives contour, avoids a scale-run)
    } else if (r < 0.85) {
      delta = 0; // repeat
    } else if (r < 0.95) {
      delta = rising ? 2 : -2; // small leap with direction
    } else {
      delta = rising ? -2 : 2; // small leap against
    }
    let next = current + delta;
    if (next < 0) {
      next = 1;
    }
    if (next > 8) {
      next = 7; // keep within ~1.5 octaves so it stays in a vocal-like register
    }
    return next;
  }

  /** Scale-degree (any integer, octave-wrapping) → frequency from the active theme's tonic + scale. */
  private degreeToFreq(degree: number): number {
    const scale = this.theme.scale;
    const len = scale.length;
    const idx = ((degree % len) + len) % len;
    const octave = Math.floor(degree / len);
    return this.theme.tonicHz * Math.pow(2, (scale[idx] + 12 * octave) / 12);
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

  private scheduleKick(time: number, kit: DrumKit = "boombap"): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L0");
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";

    let peak = 0.62;
    let end = 0.28;
    let stop = 0.3;
    if (kit === "brushed") {
      peak = 0.5;
      end = 0.3;
      stop = 0.32;
      oscillator.frequency.setValueAtTime(110, time);
      oscillator.frequency.exponentialRampToValueAtTime(44, time + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(33, time + 0.24);
    } else if (kit === "electronic") {
      peak = 0.6;
      end = 0.2;
      stop = 0.22;
      oscillator.frequency.setValueAtTime(150, time);
      oscillator.frequency.exponentialRampToValueAtTime(50, time + 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(40, time + 0.18);
    } else if (kit === "taiko") {
      peak = 0.55;
      end = 0.34;
      stop = 0.36;
      oscillator.frequency.setValueAtTime(95, time);
      oscillator.frequency.exponentialRampToValueAtTime(52, time + 0.07);
    } else {
      oscillator.frequency.setValueAtTime(132, time);
      oscillator.frequency.exponentialRampToValueAtTime(47, time + 0.09);
      oscillator.frequency.exponentialRampToValueAtTime(34, time + 0.22);
    }

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + end);
    oscillator.connect(gain);
    gain.connect(destination);

    const sources: Array<{ node: AudioScheduledSourceNode; stop: number }> = [{ node: oscillator, stop: time + stop }];
    const chain: AudioNode[] = [gain];

    // Electronic click / taiko thwack — a brief filtered-noise transient layered on the body.
    if (kit === "electronic" || kit === "taiko") {
      const noise = context.createBufferSource();
      noise.buffer = this.getNoiseBuffer(context);
      const hp = context.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = kit === "taiko" ? 1500 : 3500;
      const ng = context.createGain();
      ng.gain.setValueAtTime(kit === "taiko" ? 0.15 : 0.12, time);
      ng.gain.exponentialRampToValueAtTime(0.0001, time + (kit === "taiko" ? 0.05 : 0.02));
      noise.connect(hp);
      hp.connect(ng);
      ng.connect(destination);
      sources.push({ node: noise, stop: time + 0.06 });
      chain.push(hp, ng);
    }

    this.duckOnKick(time); // sidechain the melodic bus under the kick (pump + headroom)
    this.trackChain(sources, chain, time, "music");
  }

  private scheduleSnare(time: number, velocity = 1, kit: DrumKit = "boombap"): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L1");

    // Per-kit snare character: boombap (dusty), brushed (soft/long), electronic (clap), taiko ("ka" rim).
    let bodyF0 = 182;
    let bodyF1 = 145;
    let bodyVol = 0.18;
    let bodyDecay = 0.16;
    let bodyStop = 0.18;
    let noiseHz = 1800;
    let noiseQ = 0.7;
    let noiseVol = 0.22;
    let noiseDecay = 0.14;
    let noiseStop = 0.16;
    if (kit === "brushed") {
      bodyF0 = 150;
      bodyF1 = 120;
      bodyVol = 0.1;
      bodyDecay = 0.2;
      bodyStop = 0.22;
      noiseHz = 1300;
      noiseQ = 1;
      noiseVol = 0.16;
      noiseDecay = 0.22;
      noiseStop = 0.24;
    } else if (kit === "electronic") {
      bodyF0 = 200;
      bodyF1 = 160;
      bodyVol = 0.06;
      bodyDecay = 0.08;
      bodyStop = 0.1;
      noiseHz = 2000;
      noiseQ = 1.2;
      noiseVol = 0.24;
      noiseDecay = 0.16;
      noiseStop = 0.18;
    } else if (kit === "taiko") {
      bodyF0 = 300;
      bodyF1 = 200;
      bodyVol = 0.05;
      bodyDecay = 0.05;
      bodyStop = 0.07;
      noiseHz = 1200;
      noiseQ = 1.5;
      noiseVol = 0.12;
      noiseDecay = 0.06;
      noiseStop = 0.08;
    }

    const body = context.createOscillator();
    const bodyGain = context.createGain();
    const noise = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();

    body.type = "triangle";
    body.frequency.setValueAtTime(bodyF0, time);
    body.frequency.exponentialRampToValueAtTime(bodyF1, time + 0.09);
    bodyGain.gain.setValueAtTime(Math.max(bodyVol * velocity, 0.0001), time);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + bodyDecay);

    noise.buffer = this.getNoiseBuffer(context);
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(noiseHz, time);
    noiseFilter.Q.value = noiseQ;
    noiseGain.gain.setValueAtTime(Math.max(noiseVol * velocity, 0.0001), time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + noiseDecay);

    body.connect(bodyGain);
    bodyGain.connect(destination);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);

    this.trackChain(
      [
        { node: body, stop: time + bodyStop },
        { node: noise, stop: time + noiseStop },
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

  // ---- Lead-timbre builders (Phase 4) — dispatched per biome ----

  private scheduleLead(time: number, frequency: number, velocity: number, style: LeadStyle): void {
    if (style === "rhodes") {
      this.scheduleRhodes(time, frequency, velocity);
    } else if (style === "supersaw") {
      this.scheduleSupersaw(time, frequency, velocity);
    } else if (style === "shakuhachi") {
      this.scheduleShakuhachi(time, frequency, velocity);
    } else {
      this.schedulePluck(time, frequency, velocity); // koto/shamisen
    }
  }

  /** Autumn Rhodes: a sine fundamental + a quieter octave "tine", soft attack, lowpassed warmth. */
  private scheduleRhodes(time: number, frequency: number, velocity: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L4");
    const fund = context.createOscillator();
    const tine = context.createOscillator();
    const fundGain = context.createGain();
    const tineGain = context.createGain();
    const lp = context.createBiquadFilter();
    const v = Math.max(velocity, 0.0001);

    fund.type = "sine";
    fund.frequency.setValueAtTime(frequency, time);
    tine.type = "sine";
    tine.frequency.setValueAtTime(frequency * 2, time);
    tine.detune.setValueAtTime(4, time);
    lp.type = "lowpass";
    lp.frequency.value = 3000;

    fundGain.gain.setValueAtTime(0.0001, time);
    fundGain.gain.exponentialRampToValueAtTime(v, time + 0.008);
    fundGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);
    tineGain.gain.setValueAtTime(0.0001, time);
    tineGain.gain.exponentialRampToValueAtTime(v * 0.3, time + 0.006);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);

    fund.connect(fundGain);
    fundGain.connect(lp);
    tine.connect(tineGain);
    tineGain.connect(lp);
    lp.connect(destination);
    this.trackChain(
      [
        { node: fund, stop: time + 0.52 },
        { node: tine, stop: time + 0.17 },
      ],
      [fundGain, tineGain, lp],
      time,
      "music",
    );
  }

  /** Neon supersaw: detuned saws through a quick filter-bloom — bright synthwave lead. */
  private scheduleSupersaw(time: number, frequency: number, velocity: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L4");
    const lp = context.createBiquadFilter();
    const gain = context.createGain();
    const v = Math.max(velocity, 0.0001);

    lp.type = "lowpass";
    lp.Q.value = 1;
    lp.frequency.setValueAtTime(1800, time);
    lp.frequency.exponentialRampToValueAtTime(3200, time + 0.04);
    lp.frequency.exponentialRampToValueAtTime(2000, time + 0.25);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(v * 0.4, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.26);

    const detunes = [-12, -5, 5, 12];
    const sources: Array<{ node: AudioScheduledSourceNode; stop: number }> = [];
    for (const d of detunes) {
      const osc = context.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(frequency, time);
      osc.detune.setValueAtTime(d, time);
      osc.connect(lp);
      sources.push({ node: osc, stop: time + 0.28 });
    }
    lp.connect(gain);
    gain.connect(destination);
    this.trackChain(sources, [lp, gain], time, "music");
  }

  /** Forest shakuhachi: two detuned triangles + breath noise, soft attack, long reverb-like tail. */
  private scheduleShakuhachi(time: number, frequency: number, velocity: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L4");
    const t1 = context.createOscillator();
    const t2 = context.createOscillator();
    const tone = context.createGain();
    const lp = context.createBiquadFilter();
    const noise = context.createBufferSource();
    const bp = context.createBiquadFilter();
    const noiseGain = context.createGain();
    const v = Math.max(velocity, 0.0001);

    t1.type = "triangle";
    t1.frequency.setValueAtTime(frequency, time);
    t1.detune.setValueAtTime(-6, time);
    t2.type = "triangle";
    t2.frequency.setValueAtTime(frequency, time);
    t2.detune.setValueAtTime(6, time);
    lp.type = "lowpass";
    lp.frequency.value = 2100;

    tone.gain.setValueAtTime(0.0001, time);
    tone.gain.exponentialRampToValueAtTime(v, time + 0.08); // breathy attack
    tone.gain.exponentialRampToValueAtTime(0.0001, time + 0.55); // long tail

    noise.buffer = this.getNoiseBuffer(context);
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(frequency, time);
    bp.Q.value = 4;
    noiseGain.gain.setValueAtTime(v * 0.12, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);

    t1.connect(tone);
    t2.connect(tone);
    tone.connect(lp);
    noise.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(lp);
    lp.connect(destination);
    this.trackChain(
      [
        { node: t1, stop: time + 0.6 },
        { node: t2, stop: time + 0.6 },
        { node: noise, stop: time + 0.3 },
      ],
      [tone, lp, bp, noiseGain],
      time,
      "music",
    );
  }

  // ---- Per-biome evolution accents (route to the always-on L3 bus) ----

  /** Neon sparkle: a bright, slightly inharmonic sine bell — the city evolution over the koto. */
  private scheduleSynthBell(time: number, frequency: number, velocity: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L3");
    const fund = context.createOscillator();
    const partial = context.createOscillator();
    const fundGain = context.createGain();
    const partialGain = context.createGain();
    const lp = context.createBiquadFilter();
    const v = Math.max(velocity, 0.0001);

    fund.type = "sine";
    fund.frequency.setValueAtTime(frequency, time);
    partial.type = "sine";
    partial.frequency.setValueAtTime(frequency * 2.01, time); // slight inharmonic shimmer
    lp.type = "lowpass";
    lp.frequency.value = 6000;

    fundGain.gain.setValueAtTime(0.0001, time);
    fundGain.gain.exponentialRampToValueAtTime(v, time + 0.004);
    fundGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
    partialGain.gain.setValueAtTime(0.0001, time);
    partialGain.gain.exponentialRampToValueAtTime(v * 0.4, time + 0.004);
    partialGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

    fund.connect(fundGain);
    fundGain.connect(lp);
    partial.connect(partialGain);
    partialGain.connect(lp);
    lp.connect(destination);
    this.trackChain(
      [
        { node: fund, stop: time + 0.32 },
        { node: partial, stop: time + 0.2 },
      ],
      [fundGain, partialGain, lp],
      time,
      "music",
    );
  }

  /** Forest pan flute: a soft, breathy triangle counter-melody with a long tail — the forest evolution. */
  private scheduleAccentFlute(time: number, frequency: number, velocity: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L3");
    const tone = context.createOscillator();
    const gain = context.createGain();
    const lp = context.createBiquadFilter();
    const noise = context.createBufferSource();
    const bp = context.createBiquadFilter();
    const noiseGain = context.createGain();
    const v = Math.max(velocity, 0.0001);

    tone.type = "triangle";
    tone.frequency.setValueAtTime(frequency, time);
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(v, time + 0.1); // gentle breathy attack
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.7); // long, soft tail

    noise.buffer = this.getNoiseBuffer(context);
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(frequency, time);
    bp.Q.value = 5;
    noiseGain.gain.setValueAtTime(v * 0.1, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);

    tone.connect(gain);
    gain.connect(lp);
    noise.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(lp);
    lp.connect(destination);
    this.trackChain(
      [
        { node: tone, stop: time + 0.75 },
        { node: noise, stop: time + 0.25 },
      ],
      [gain, lp, bp, noiseGain],
      time,
      "music",
    );
  }

  // ---- Bass-style builders (Phase 4) ----

  private scheduleBassVoice(time: number, frequency: number, style: BassStyle, localStep: number): void {
    if (style === "funk") {
      this.scheduleFunkBass(time, frequency, localStep);
    } else if (style === "drone") {
      this.scheduleDroneBass(time, frequency);
    } else {
      this.scheduleBass(time, frequency); // round
    }
  }

  /** Neon funk bass: saw through a resonant filter-envelope ("talking" pluck) + octave pops. */
  private scheduleFunkBass(time: number, frequency: number, localStep: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L2");
    const octavePop = localStep === 7 || localStep === 14;
    const osc = context.createOscillator();
    const lp = context.createBiquadFilter();
    const gain = context.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(octavePop ? frequency * 2 : frequency, time);
    lp.type = "lowpass";
    lp.Q.value = 7;
    lp.frequency.setValueAtTime(250, time);
    lp.frequency.exponentialRampToValueAtTime(1500, time + 0.04);
    lp.frequency.exponentialRampToValueAtTime(300, time + 0.16);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.26, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(destination);
    this.trackChain([{ node: osc, stop: time + 0.2 }], [lp, gain], time, "music");
  }

  /** Forest drone bass: a long, slow sub sine — one sustained note per chord. */
  private scheduleDroneBass(time: number, frequency: number): void {
    const context = this.ensureContext();
    const destination = this.layerDestination("L2");
    const osc = context.createOscillator();
    const lp = context.createBiquadFilter();
    const gain = context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, time);
    lp.type = "lowpass";
    lp.frequency.value = 180;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.22, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.6);

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(destination);
    this.trackChain([{ node: osc, stop: time + 1.65 }], [lp, gain], time, "music");
  }

  // ---- Harmony helper ----
  // (The sustained tonal pad AND the continuous noise bed were removed — they muddied the mix and
  //  resembled the EV engine drone. Harmony now comes from the moving bass root + the lead.)

  /** Chord-root semitone offset (from the active theme's tonic) → frequency. */
  private chordRootHz(semis: number): number {
    return this.theme.tonicHz * Math.pow(2, semis / 12);
  }

  /** Swap the active biome theme and, for in-run leg changes, smooth the cut with a master filter
   *  sweep + a gentle engine downshift (so the transition glides instead of jumping). */
  private activateBiome(key: string, instant: boolean): void {
    const theme = BIOME_THEME_BY_KEY[key];
    if (!theme) {
      return;
    }
    this.theme = theme;
    this.currentBiomeKey = key;
    this.arranger.chordRoot = theme.chordRootSemis[this.arranger.chordIdx % theme.chordRootSemis.length] ?? 0;
    if (!instant) {
      this.sweepMusicTransition(); // mask the theme cut; engine stays speed-driven only
    }
  }

  /** Briefly muffle then re-open the whole music bus — masks the hard cut between biome themes. */
  private sweepMusicTransition(): void {
    const lp = this.musicSweepLP;
    const context = this.context;
    if (!lp || !context) {
      return;
    }
    const now = context.currentTime;
    lp.frequency.cancelScheduledValues(now);
    lp.frequency.setValueAtTime(Math.max(lp.frequency.value, 1), now);
    lp.frequency.exponentialRampToValueAtTime(520, now + 0.18); // close into the change
    lp.frequency.exponentialRampToValueAtTime(20000, now + 2); // open back over ~2 bars
  }

  /** Tell the music which macro-biome the run is in (0 village · 1 neon · 2 forest; autumn = village
   *  in its autumn season). Applied beat-locked at the next bar while running; stored otherwise. */
  setBiome(legIndex: number, autumn = false): void {
    const idx = ((Math.floor(legIndex) % 3) + 3) % 3;
    const key = autumn && idx === 0 ? "village_autumn" : ["village", "neon", "forest"][idx];
    if (key === this.currentBiomeKey && this.pendingBiomeKey === null) {
      return;
    }
    if (this.musicMode === "run" && this.isMusicRunning) {
      this.pendingBiomeKey = key;
    } else {
      this.currentBiomeKey = key; // applied when the run (re)starts
    }
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
    // Derived from the live set so it can't drift out of sync across stop/start boundaries.
    if (group === "music" && this.activeMusicNodes.size + sources.length > MAX_MUSIC_VOICES) {
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
  }

  /** Build the per-layer gain buses + the kick-sidechained duck bus + the headroom auto-scaler. */
  private buildMusicBuses(context: AudioContext, musicGain: GainNode): void {
    const duckBus = context.createGain();
    duckBus.gain.value = 1;
    const autoScale = context.createGain();
    autoScale.gain.value = 0.9;
    // A transparent-by-default lowpass we sweep shut + back open on biome changes to glide the cut.
    const sweepLP = context.createBiquadFilter();
    sweepLP.type = "lowpass";
    sweepLP.frequency.value = 20000;
    sweepLP.Q.value = 0.7;
    duckBus.connect(autoScale);
    autoScale.connect(sweepLP);
    sweepLP.connect(musicGain);
    this.duckBus = duckBus;
    this.autoScaleGain = autoScale;
    this.musicSweepLP = sweepLP;

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
    // The current song-form section can assert a floor (a B/build lifts layers regardless of speed).
    const floor = this.musicMode === "run" ? this.arranger.intensityFloor : 0;
    const v = Math.max(this.musicIntensitySmoothed, floor);

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
    // Ramp DOWN over ~6 ms (not an instantaneous step) so a sustained pad/bass on the duck bus
    // doesn't get a waveform discontinuity = a sidechain click on every kick. Anchor at the
    // current value so overlapping ducks ramp from where they are.
    duck.gain.cancelScheduledValues(time);
    duck.gain.setValueAtTime(duck.gain.value, time);
    duck.gain.linearRampToValueAtTime(0.6, time + 0.006);
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
    return localStep % 2 === 1 ? this.theme.swing * SIXTEENTH_SECONDS : 0;
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
