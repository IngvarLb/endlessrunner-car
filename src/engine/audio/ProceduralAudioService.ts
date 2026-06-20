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
    this.updateMusicModeGain();
    this.scheduleMusic();
    this.musicTimer = setInterval(() => this.scheduleMusic(), LOOKAHEAD_MS);
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
    this.isMusicRunning = false;
    this.isMusicPaused = false;
    this.nextStepIndex = 0;
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
  }

  resumeMusic(): void {
    if (!this.isMusicRunning || !this.isMusicPaused) {
      return;
    }

    const context = this.ensureContext();
    this.isMusicPaused = false;
    this.nextStepTime = context.currentTime + 0.05;
    this.musicTimer = setInterval(() => this.scheduleMusic(), LOOKAHEAD_MS);
  }

  setSettings(settings: Partial<ProceduralAudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.applySettings();
  }

  playCoin(): void {
    const context = this.ensureContext();
    const now = context.currentTime;
    this.playTone(now, 880, 0.08, "sine", 0.17, this.sfxGain, 0.01);
    this.playTone(now + 0.055, 1320, 0.1, "triangle", 0.14, this.sfxGain, 0.005);
  }

  playBoost(): void {
    const context = this.ensureContext();
    const now = context.currentTime;

    this.playSweep(now, 160, 720, 0.34, "sawtooth", 0.18, this.sfxGain);
    this.playNoiseBurst(now, 0.28, 0.16, 900, 5200, "bandpass", this.sfxGain);
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

  dispose(): void {
    this.stopMusic();

    const context = this.context;
    const stopTime = context ? context.currentTime + 0.02 : undefined;
    for (const node of this.activeSfxNodes) {
      this.stopNode(node, stopTime);
    }
    this.activeSfxNodes.clear();

    this.masterGain?.disconnect();
    this.musicGain?.disconnect();
    this.sfxGain?.disconnect();
    this.compressor?.disconnect();
    this.noiseBuffer = null;

    this.context = null;
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

    while (this.nextStepTime < context.currentTime + SCHEDULE_AHEAD_SECONDS) {
      this.scheduleStep(this.nextStepIndex, this.nextStepTime);
      this.nextStepTime += SIXTEENTH_SECONDS;
      this.nextStepIndex = (this.nextStepIndex + 1) % LOOP_STEPS;
    }
  }

  private scheduleStep(step: number, time: number): void {
    const localStep = step % STEPS_PER_BAR;
    const bar = Math.floor(step / STEPS_PER_BAR);

    if (this.shouldPlayKick(localStep, bar)) {
      this.scheduleKick(time);
    }

    if (this.shouldPlaySnare(localStep)) {
      this.scheduleSnare(time);
    }

    if (this.shouldPlayHat(localStep)) {
      const accent = localStep % 4 === 0 ? 1 : 0.72;
      this.scheduleClosedHat(time, accent);
    }

    if (this.musicMode === "run" && (step === 15 || step === 31 || step === 47)) {
      this.scheduleOpenHat(time);
    }

    if (this.musicMode === "run" && localStep % 2 === 0) {
      const bassNote = BASS_PATTERN[localStep];
      if (bassNote) {
        this.scheduleBass(time, NOTE_FREQUENCIES[bassNote], localStep === 10 ? NOTE_FREQUENCIES.G1 : undefined);
      }
    }

    this.scheduleMelodicPluck(step, time);
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

    const velocity = this.musicMode === "run" ? 0.13 : 0.08;
    this.schedulePluck(time, NOTE_FREQUENCIES[noteName], velocity);
  }

  private scheduleKick(time: number): void {
    const context = this.ensureContext();
    const destination = this.getMusicDestination();
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
    this.startAndTrack(oscillator, time, time + 0.3, "music");
  }

  private scheduleSnare(time: number): void {
    const context = this.ensureContext();
    const destination = this.getMusicDestination();
    const body = context.createOscillator();
    const bodyGain = context.createGain();
    const noise = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();

    body.type = "triangle";
    body.frequency.setValueAtTime(182, time);
    body.frequency.exponentialRampToValueAtTime(145, time + 0.09);
    bodyGain.gain.setValueAtTime(0.18, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

    noise.buffer = this.getNoiseBuffer(context);
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1800, time);
    noiseFilter.Q.value = 0.7;
    noiseGain.gain.setValueAtTime(0.22, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

    body.connect(bodyGain);
    bodyGain.connect(destination);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);

    this.startAndTrack(body, time, time + 0.18, "music");
    this.startAndTrack(noise, time, time + 0.16, "music");
  }

  private scheduleClosedHat(time: number, accent: number): void {
    const context = this.ensureContext();
    const destination = this.getMusicDestination();
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
    this.startAndTrack(source, time, time + 0.055, "music");
  }

  private scheduleOpenHat(time: number): void {
    const context = this.ensureContext();
    const destination = this.getMusicDestination();
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
    this.startAndTrack(source, time, time + 0.2, "music");
  }

  private scheduleBass(time: number, frequency: number, slideTo?: number): void {
    const context = this.ensureContext();
    const destination = this.getMusicDestination();
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
    this.startAndTrack(oscillator, time, time + 0.36, "music");
  }

  private schedulePluck(time: number, frequency: number, velocity: number): void {
    const context = this.ensureContext();
    const destination = this.getMusicDestination();
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
    gain.gain.exponentialRampToValueAtTime(velocity, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    this.startAndTrack(oscillator, time, time + 0.18, "music");
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
    this.startAndTrack(oscillator, time, time + duration + 0.02, "sfx");
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
    this.startAndTrack(oscillator, time, time + duration + 0.02, "sfx");
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
    this.startAndTrack(source, time, time + duration + 0.02, "sfx");
  }

  private startAndTrack<T extends AudioScheduledSourceNode>(
    node: T,
    startTime: number,
    stopTime: number,
    group: "music" | "sfx",
  ): void {
    const activeNodes = group === "music" ? this.activeMusicNodes : this.activeSfxNodes;
    activeNodes.add(node);

    node.onended = () => {
      activeNodes.delete(node);
      node.disconnect();
    };

    node.start(startTime);
    node.stop(stopTime);
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
