import { DEFAULT_GAME_CONFIG, type GameConfig } from "./GameConfig";
import { GameEvents } from "./GameEvents";
import { GameLoop } from "./GameLoop";
import { ServiceRegistry } from "./ServiceRegistry";
import { ProceduralAudioService } from "../engine/audio/ProceduralAudioService";
import { PerfMonitor } from "../engine/diagnostics/PerfMonitor";
import { MaterialFactory } from "../engine/assets/MaterialFactory";
import { InputManager } from "../engine/input/InputManager";
import { ModelFactory } from "../engine/assets/ModelFactory";
import type { AppScene } from "../engine/rendering/AppScene";
import { GarageSceneFactory, type GarageSceneBundle } from "../engine/rendering/GarageSceneFactory";
import { RendererService } from "../engine/rendering/RendererService";
import { ResizeService } from "../engine/rendering/ResizeService";
import { RunSceneFactory, type RunScene } from "../engine/rendering/RunSceneFactory";
import {
  addRunCoins,
  loadSaveData,
  saveSaveData,
  saveSelectedVehicle,
  unlockVehicle
} from "../game/progression/SaveDataStore";
import type { SaveData } from "../game/progression/SaveData";
import type { RunStats } from "../game/progression/ScoreSystem";
import { GameStateMachine } from "../game/state/GameStateMachine";
import type { GameState } from "../game/state/GameStateTypes";
import {
  getAllVehicles,
  getOwnedVehicleDefinition,
  isVehicleOwned,
  type VehicleDefinition
} from "../game/vehicles/VehicleCatalog";
import { getVehicleKanji } from "../game/vehicles/vehicleKanji";

const countdownDurationMs = 720;
const idleFrameInterval = 1 / 24;
const garageFrameInterval = 1 / 40;

export function createGameApp(root: HTMLElement, config: Partial<GameConfig> = {}): GameApp {
  return new GameApp(root, mergeConfig(config));
}

export class GameApp {
  private readonly events = new GameEvents();
  private readonly loop = new GameLoop();
  private readonly services = new ServiceRegistry();
  private readonly stateMachine = new GameStateMachine(this.events);
  private renderer?: RendererService;
  private audio?: ProceduralAudioService;
  private input?: InputManager;
  private resize?: ResizeService;
  private materials?: MaterialFactory;
  private models?: ModelFactory;
  private activeScene?: AppScene;
  private runScene?: RunScene;
  private garageScene?: GarageSceneBundle;
  private ui?: HTMLElement;
  private stateLabel?: HTMLElement;
  private actionButton?: HTMLButtonElement;
  private garageButton?: HTMLButtonElement;
  private garageControls?: HTMLElement;
  private garageVehicleLabel?: HTMLElement;
  private garageTierBadge?: HTMLElement;
  private garageShopMeta?: HTMLElement;
  private garageBalanceLabel?: HTMLElement;
  private gameOverSummary?: HTMLElement;
  private mainMenuButton?: HTMLButtonElement;
  private garagePreviousButton?: HTMLButtonElement;
  private garageNextButton?: HTMLButtonElement;
  private garageStartButton?: HTMLButtonElement;
  private garageBackButton?: HTMLButtonElement;
  private settingsButton?: HTMLButtonElement;
  private settingsPanel?: HTMLElement;
  private musicVolumeInput?: HTMLInputElement;
  private sfxVolumeInput?: HTMLInputElement;
  private muteInput?: HTMLInputElement;
  private metaLabel?: HTMLElement;
  private coinsLabel?: HTMLElement;
  private comboLabel?: HTMLElement;
  private pressureLabel?: HTMLElement;
  private saveData = loadSaveData();
  private unlockedVehicleIds = [...this.saveData.unlockedVehicleIds];
  private selectedVehicle: VehicleDefinition = getOwnedVehicleDefinition(
    this.saveData.selectedVehicleId,
    this.saveData.unlockedVehicleIds
  );
  private lastRunStats?: RunStats;
  private viewportWidth = 1;
  private viewportHeight = 1;
  private countdownTimeout = 0;
  private audioUnlocked = false;
  private settingsOpen = false;
  private renderAccumulator = 0;
  private runRewardsClaimed = false;
  private perf?: PerfMonitor;
  private perfHud?: HTMLElement;
  private perfHudInput?: HTMLInputElement;
  private hankoRail?: HTMLElement;
  private lastHankoActiveId = "";
  private frMenuCoins?: HTMLElement;
  private frMenuLevel?: HTMLElement;
  private frMenuXpText?: HTMLElement;
  private frMenuXpFill?: HTMLElement;
  private frMenuBest?: HTMLElement;

  constructor(
    private readonly root: HTMLElement,
    private readonly config: GameConfig
  ) {}

  async init(): Promise<void> {
    this.root.innerHTML = "";
    this.root.classList.add("game-root");

    this.materials = new MaterialFactory();
    this.models = new ModelFactory(this.materials);
    this.audio = new ProceduralAudioService({
      ...this.config.audio,
      musicVolume: this.saveData.settings.musicVolume,
      sfxVolume: this.saveData.settings.sfxVolume,
      muted: this.saveData.settings.muted
    });
    this.input = new InputManager(window, this.config.input);
    this.renderer = new RendererService(this.root, this.config.quality);
    this.replaceRunScene(this.selectedVehicle, true);

    this.resize = new ResizeService(this.root, (width, height) => {
      this.viewportWidth = width;
      this.viewportHeight = height;
      this.renderer?.setSize(width, height);
      this.activeScene?.cameraController.resize(width, height);
    });

    this.services.register("events", this.events);
    this.services.register("state", this.stateMachine);
    this.services.register("input", this.input);
    this.services.register("renderer", this.renderer);

    this.setupUi();
    this.bindAudioEvents();
    this.input.bind();
    this.bindState();
    this.resize.bind();
    this.loop.onFrame((dt, elapsed) => this.update(dt, elapsed));
    this.loop.start();

    this.stateMachine.transition("loading", "init");
    queueMicrotask(() => this.stateMachine.transition("menu", "ready"));
  }

  private createRunScene(vehicle: VehicleDefinition): RunScene {
    if (!this.models || !this.materials) {
      throw new Error("Cannot create run scene before assets are initialized");
    }

    return RunSceneFactory.create(this.config, this.models, this.materials, vehicle, this.events);
  }

  private createGarageScene(): GarageSceneBundle {
    if (!this.models || !this.materials) {
      throw new Error("Cannot create garage scene before assets are initialized");
    }

    return GarageSceneFactory.create(
      this.config,
      this.models,
      this.materials,
      this.selectedVehicle.id,
      this.unlockedVehicleIds,
      this.saveData.totalCoins
    );
  }

  private activateScene(scene: AppScene): void {
    this.activeScene = scene;
    scene.cameraController.resize(this.viewportWidth, this.viewportHeight);
    this.input?.clearBuffer();
  }

  private ensureRunScene(): RunScene {
    if (!this.runScene) {
      return this.replaceRunScene(this.selectedVehicle, false);
    }

    return this.runScene;
  }

  private replaceRunScene(vehicle: VehicleDefinition, activate: boolean): RunScene {
    const previousRunScene = this.runScene;
    const nextRunScene = this.createRunScene(vehicle);
    this.runScene = nextRunScene;

    if (activate) {
      this.activateScene(nextRunScene);
    }

    previousRunScene?.dispose();
    return nextRunScene;
  }

  private disposeGarageScene(cancelPreview = false): void {
    const garageScene = this.garageScene;
    if (!garageScene) {
      return;
    }

    if (cancelPreview) {
      garageScene.cancelPreview();
    }

    this.garageScene = undefined;
    garageScene.dispose();
  }

  private beginCountdown(reason: string): void {
    if (!this.runScene) {
      return;
    }

    window.clearTimeout(this.countdownTimeout);
    this.runScene.resetRun();
    this.lastRunStats = undefined;
    this.runRewardsClaimed = false;
    this.stateMachine.transition("countdown", reason);
    this.countdownTimeout = window.setTimeout(() => {
      if (this.stateMachine.getState() === "countdown" && this.stateMachine.canTransition("running")) {
        this.stateMachine.transition("running", "countdown-complete");
      }
    }, countdownDurationMs);
  }

  start(): void {
    const state = this.stateMachine.getState();
    if (state === "garage") {
      this.startFromGarage();
      return;
    }

    if (state !== "menu" && state !== "gameOver") {
      return;
    }

    this.activateScene(this.ensureRunScene());
    this.beginCountdown("start");
  }

  pause(): void {
    if (this.stateMachine.getState() !== "running") {
      return;
    }

    this.stateMachine.transition("paused", "user");
  }

  resume(): void {
    if (this.stateMachine.getState() !== "paused") {
      return;
    }

    this.stateMachine.transition("running", "user");
  }

  restart(): void {
    const state = this.stateMachine.getState();
    if (state === "running" || state === "paused") {
      this.stateMachine.transition("gameOver", "restart");
    }

    if (this.stateMachine.getState() === "gameOver" || this.stateMachine.getState() === "menu") {
      this.start();
    }
  }

  dispose(): void {
    window.clearTimeout(this.countdownTimeout);
    this.loop.stop();
    this.input?.unbind();
    this.resize?.unbind();
    this.disposeGarageScene();
    this.runScene?.dispose();
    this.audio?.dispose();
    this.materials?.dispose();
    this.renderer?.dispose();
    this.events.clear();
    this.services.clear();
    this.root.innerHTML = "";
  }

  private update(dt: number, elapsed: number): void {
    if (!this.renderer || !this.activeScene) {
      return;
    }

    if (document.hidden) {
      return;
    }

    this.perf?.frame();
    this.input?.update();
    this.handleBufferedInput(this.stateMachine.getState());
    const state = this.stateMachine.getState();
    const frameInterval = this.getFrameInterval(state);
    if (frameInterval > 0) {
      this.renderAccumulator += dt;
      if (this.renderAccumulator < frameInterval) {
        return;
      }
      dt = Math.min(this.renderAccumulator, 0.1);
      this.renderAccumulator = 0;
    } else {
      this.renderAccumulator = 0;
    }

    this.updateStats();
    this.activeScene.update(dt, elapsed, state);
    if (state === "garage") {
      this.updateGarageUi();
    }

    if (this.activeScene === this.runScene && state === "running" && this.runScene) {
      const gameOver = this.runScene.consumeGameOver();
      if (gameOver && this.stateMachine.canTransition("gameOver")) {
        this.lastRunStats = this.runScene.getRunStats();
        this.stateMachine.transition("gameOver", gameOver.reason);
      }
    }

    this.renderer.render(this.activeScene.scene, this.activeScene.cameraController.camera);
  }

  private getFrameInterval(state: GameState): number {
    switch (state) {
      case "garage":
        return garageFrameInterval;
      case "menu":
      case "paused":
      case "gameOver":
        return idleFrameInterval;
      case "boot":
      case "loading":
      case "countdown":
      case "running":
      case "reviving":
        return 0;
    }
  }

  private setupUi(): void {
    const ui = document.createElement("div");
    ui.className = "game-ui";
    ui.innerHTML = `
      <header class="top-bar">
        <div class="brand-block">
          <span class="brand-mark">走</span>
          <strong>Feudal Runner</strong>
        </div>
        <div class="top-actions">
          <div class="run-stats" aria-label="Run stats">
            <span data-stat="meta" title="Meta (Distanz)">走 0</span>
            <span data-stat="coins" title="Koban">金 0</span>
            <span data-stat="combo" title="Combo">× 0</span>
            <span data-stat="pressure" title="Pressure">圧 0</span>
          </div>
          <button class="settings-action" type="button" aria-label="Settings" title="Settings">&#9881;</button>
        </div>
      </header>
      <section class="settings-panel" data-settings-panel hidden aria-label="Settings">
        <label class="settings-toggle">
          <input type="checkbox" data-setting-muted />
          <span>Mute</span>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-setting-perf />
          <span>Perf HUD</span>
        </label>
        <label>
          <span>Music</span>
          <input type="range" min="0" max="1" step="0.01" data-setting-music />
        </label>
        <label>
          <span>SFX</span>
          <input type="range" min="0" max="1" step="0.01" data-setting-sfx />
        </label>
      </section>
      <section class="menu-panel" aria-live="polite">
        <p class="state-label">Loading</p>
        <h1>Feudal Runner</h1>
        <p class="garage-vehicle-label" data-garage-vehicle hidden></p>
        <span class="garage-tier-badge" data-garage-tier hidden></span>
        <div class="garage-shop-meta" data-garage-shop hidden>
          <span class="garage-shop-status" data-garage-status></span>
          <span data-garage-price></span>
          <span class="garage-shop-need" data-garage-need></span>
        </div>
        <div class="game-over-summary" data-game-over-summary hidden></div>
        <div class="menu-actions">
          <button class="primary-action" type="button">Start</button>
          <button class="secondary-action garage-entry-action" type="button">Garage</button>
          <button class="secondary-action main-menu-action" type="button" hidden>Main Menu</button>
        </div>
        <div class="garage-controls" hidden>
          <div class="garage-switch-row">
            <button class="icon-action garage-prev-action" type="button" aria-label="Previous vehicle">&lsaquo;</button>
            <button class="primary-action garage-start-action" type="button">Starten</button>
            <button class="icon-action garage-next-action" type="button" aria-label="Next vehicle">&rsaquo;</button>
          </div>
          <button class="secondary-action garage-back-action" type="button">戻 ZURÜCK</button>
        </div>
      </section>
      <section class="fr-menu" data-fr-menu>
        <div class="fr-bg fr-bg--menu"></div>
        <div class="fr-ghost fr-ghost--menu">走</div>
        <div class="fr-screentone fr-screentone--menu"></div>
        <div class="fr-grain"></div>
        <span class="fr-corner fr-corner--tl">+</span>
        <span class="fr-corner fr-corner--br">+</span>

        <header class="fr-topbar">
          <div class="fr-brand">
            <span class="fr-seal">走</span>
            <div class="fr-brand-text">
              <span class="fr-brand-name">FEUDAL RUNNER</span>
              <span class="fr-brand-sub">封建 ランナー</span>
            </div>
          </div>
          <div class="fr-topright">
            <div class="fr-chip fr-chip--coin"><span class="fr-coin-k">金</span><span data-fr-coins>0</span></div>
            <div class="fr-chip fr-lvl">
              <div class="fr-lvl-row"><span class="fr-lvl-num">LV.<span data-fr-level>1</span></span><span class="fr-lvl-pct" data-fr-xptext>0%</span></div>
              <div class="fr-lvl-bar"><div class="fr-lvl-fill" data-fr-xpfill></div></div>
            </div>
            <button class="fr-iconbtn fr-settings-open" type="button" aria-label="Settings" title="Settings">設</button>
          </div>
        </header>

        <div class="fr-hero">
          <div class="fr-kicker">
            <span class="fr-kicker-jp">道</span>
            <span class="fr-kicker-en">ENDLESS RUN</span>
            <span class="fr-kicker-sub">· 江戸</span>
            <span class="fr-kicker-rule"></span>
            <span class="fr-kicker-no">.01</span>
          </div>
          <h1 class="fr-monument">FEUDAL</h1>
          <h1 class="fr-monument">RUNNER<span class="fr-dot">.</span></h1>
          <div class="fr-subtitle">無限走行 ・ 終わりなき道</div>
          <div class="fr-cta">
            <button class="fr-btn fr-btn--primary fr-start-action" type="button"><span class="fr-btn-jp">走</span>START</button>
            <button class="fr-btn fr-btn--ghost fr-garage-action" type="button"><span class="fr-btn-jp fr-accent">車</span>GARAGE</button>
          </div>
          <div class="fr-stats">
            <div class="fr-stat"><div class="fr-stat-label">最長 BEST</div><div class="fr-stat-val"><span data-fr-best>0</span><span class="fr-stat-unit">M</span></div></div>
            <div class="fr-stat-div"></div>
            <div class="fr-stat"><div class="fr-stat-label">記録 TIME</div><div class="fr-stat-val">—</div></div>
            <div class="fr-stat-div"></div>
            <div class="fr-stat"><div class="fr-stat-label">走行 RUNS</div><div class="fr-stat-val" data-fr-runs>—</div></div>
          </div>
        </div>

        <div class="fr-vkana">エンドレス・ランナー</div>

        <div class="fr-bottomstrip">
          <span>© 2026 FEUDAL RUNNER</span>
          <span class="fr-strip-right">［ REAL-TIME 3D · 江戸大通り ］<span class="fr-barcode"></span><span class="fr-accent">✦</span></span>
        </div>
      </section>
      <pre class="perf-hud" data-perf-hud hidden aria-hidden="true"></pre>
      <div class="hanko-rail" data-hanko-rail hidden aria-hidden="true"></div>
      <span class="garage-balance" data-garage-balance hidden></span>
      <div class="print-frame" aria-hidden="true">
        <span class="reg-mark reg-tl"></span>
        <span class="reg-mark reg-tr"></span>
        <span class="reg-mark reg-bl"></span>
        <span class="reg-mark reg-br"></span>
        <p class="print-footer">走 FEUDAL RUNNER · 江戸 NEO-UKIYO PRESS · CAT. N°.02 · © 2026</p>
      </div>
    `;

    this.root.appendChild(ui);
    this.ui = ui;
    this.stateLabel = ui.querySelector(".state-label") ?? undefined;
    this.actionButton = ui.querySelector(".menu-actions .primary-action") ?? undefined;
    this.garageButton = ui.querySelector(".garage-entry-action") ?? undefined;
    this.garageControls = ui.querySelector(".garage-controls") ?? undefined;
    this.garageVehicleLabel = ui.querySelector('[data-garage-vehicle]') ?? undefined;
    this.garageTierBadge = ui.querySelector("[data-garage-tier]") ?? undefined;
    this.garageShopMeta = ui.querySelector("[data-garage-shop]") ?? undefined;
    this.garageBalanceLabel = ui.querySelector("[data-garage-balance]") ?? undefined;
    this.gameOverSummary = ui.querySelector('[data-game-over-summary]') ?? undefined;
    this.mainMenuButton = ui.querySelector(".main-menu-action") ?? undefined;
    this.garagePreviousButton = ui.querySelector(".garage-prev-action") ?? undefined;
    this.garageNextButton = ui.querySelector(".garage-next-action") ?? undefined;
    this.garageStartButton = ui.querySelector(".garage-start-action") ?? undefined;
    this.garageBackButton = ui.querySelector(".garage-back-action") ?? undefined;
    this.settingsButton = ui.querySelector(".settings-action") ?? undefined;
    this.settingsPanel = ui.querySelector("[data-settings-panel]") ?? undefined;
    this.musicVolumeInput = ui.querySelector("[data-setting-music]") ?? undefined;
    this.sfxVolumeInput = ui.querySelector("[data-setting-sfx]") ?? undefined;
    this.muteInput = ui.querySelector("[data-setting-muted]") ?? undefined;
    this.perfHudInput = ui.querySelector("[data-setting-perf]") ?? undefined;
    this.perfHud = ui.querySelector("[data-perf-hud]") ?? undefined;
    this.hankoRail = ui.querySelector("[data-hanko-rail]") ?? undefined;
    if (this.perfHud && this.renderer) {
      this.perf = new PerfMonitor(this.perfHud, this.renderer.renderer);
    }
    this.metaLabel = ui.querySelector('[data-stat="meta"]') ?? undefined;
    this.coinsLabel = ui.querySelector('[data-stat="coins"]') ?? undefined;
    this.comboLabel = ui.querySelector('[data-stat="combo"]') ?? undefined;
    this.pressureLabel = ui.querySelector('[data-stat="pressure"]') ?? undefined;
    this.frMenuCoins = ui.querySelector("[data-fr-coins]") ?? undefined;
    this.frMenuLevel = ui.querySelector("[data-fr-level]") ?? undefined;
    this.frMenuXpText = ui.querySelector("[data-fr-xptext]") ?? undefined;
    this.frMenuXpFill = ui.querySelector("[data-fr-xpfill]") ?? undefined;
    this.frMenuBest = ui.querySelector("[data-fr-best]") ?? undefined;
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-start-action") ?? undefined, () => this.start());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-garage-action") ?? undefined, () => this.openGarage());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-settings-open") ?? undefined, () => this.toggleSettingsPanel());
    this.bindButton(this.actionButton, () => this.handlePrimaryAction());
    this.bindButton(this.garageButton, () => this.openGarage());
    this.bindButton(this.mainMenuButton, () => this.returnToMainMenu());
    this.bindButton(this.garagePreviousButton, () => this.handleGarageMove(-1), "garageSwitch");
    this.bindButton(this.garageNextButton, () => this.handleGarageMove(1), "garageSwitch");
    this.bindButton(this.garageStartButton, () => this.startFromGarage());
    this.bindButton(this.garageBackButton, () => this.returnToMenuFromGarage());
    this.bindSettingsControls();
    this.syncSettingsUi();
  }

  private bindState(): void {
    this.stateMachine.onChange((_previous, next) => {
      if (next === "gameOver") {
        this.claimRunRewards(this.lastRunStats ?? this.runScene?.getRunStats());
      }

      this.updateUi(next);
    });
  }

  private bindAudioEvents(): void {
    const audio = this.audio;
    if (!audio) {
      return;
    }

    this.events.on("state:changed", ({ next }) => {
      this.syncAudioForState(next);
      if (next === "countdown") {
        audio.playCountdown();
      }
    });
    this.events.on("coin:collected", () => audio.playCoin());
    this.events.on("powerup:activated", () => audio.playBoost());
    this.events.on("runner:hit", ({ hit }) => {
      if (hit.severity === "minor") {
        audio.playWeakFail();
      } else {
        audio.playCollision();
      }
    });
    this.events.on("settings:changed", ({ settings }) => {
      audio.setSettings({
        musicVolume: settings.musicVolume,
        sfxVolume: settings.sfxVolume,
        muted: settings.muted
      });
    });
  }

  private bindSettingsControls(): void {
    this.bindButton(this.settingsButton, () => this.toggleSettingsPanel());

    this.musicVolumeInput?.addEventListener("input", () => {
      this.updateAudioSettings({ musicVolume: this.getRangeValue(this.musicVolumeInput, this.saveData.settings.musicVolume) });
    });
    this.sfxVolumeInput?.addEventListener("input", () => {
      this.updateAudioSettings({ sfxVolume: this.getRangeValue(this.sfxVolumeInput, this.saveData.settings.sfxVolume) });
    });
    this.muteInput?.addEventListener("change", () => {
      this.updateAudioSettings({ muted: this.muteInput?.checked ?? this.saveData.settings.muted });
    });
    this.perfHudInput?.addEventListener("change", () => {
      this.setPerfHud(this.perfHudInput?.checked ?? this.saveData.settings.showPerfHud);
    });
  }

  private setPerfHud(enabled: boolean): void {
    this.saveData = saveSaveData({
      ...this.saveData,
      settings: { ...this.saveData.settings, showPerfHud: enabled }
    });
    this.perf?.setEnabled(enabled);
    this.syncSettingsUi();
  }

  private toggleSettingsPanel(): void {
    this.settingsOpen = !this.settingsOpen;
    this.syncSettingsUi();
  }

  private syncSettingsUi(): void {
    if (this.settingsPanel) {
      this.settingsPanel.hidden = !this.settingsOpen;
    }

    if (this.settingsButton) {
      this.settingsButton.setAttribute("aria-expanded", String(this.settingsOpen));
    }

    if (this.musicVolumeInput) {
      this.musicVolumeInput.value = String(this.saveData.settings.musicVolume);
    }
    if (this.sfxVolumeInput) {
      this.sfxVolumeInput.value = String(this.saveData.settings.sfxVolume);
    }
    if (this.muteInput) {
      this.muteInput.checked = this.saveData.settings.muted;
    }
    if (this.perfHudInput) {
      this.perfHudInput.checked = this.saveData.settings.showPerfHud;
    }
    this.perf?.setEnabled(this.saveData.settings.showPerfHud);
  }

  private updateAudioSettings(settings: Partial<SaveData["settings"]>): void {
    const nextSettings = {
      ...this.saveData.settings,
      ...settings,
      musicVolume: this.clamp01(settings.musicVolume ?? this.saveData.settings.musicVolume),
      sfxVolume: this.clamp01(settings.sfxVolume ?? this.saveData.settings.sfxVolume)
    };

    this.saveData = saveSaveData({
      ...this.saveData,
      settings: nextSettings
    });
    this.config.audio.musicVolume = nextSettings.musicVolume;
    this.config.audio.sfxVolume = nextSettings.sfxVolume;
    this.config.audio.muted = nextSettings.muted;
    this.events.emit("settings:changed", { settings: this.saveData.settings });
    this.syncSettingsUi();
  }

  private getRangeValue(input: HTMLInputElement | undefined, fallback: number): number {
    if (!input) {
      return fallback;
    }

    const value = Number.parseFloat(input.value);
    return Number.isFinite(value) ? value : fallback;
  }

  private clamp01(value: number): number {
    return Math.min(1, Math.max(0, value));
  }

  private syncAudioForState(state: GameState): void {
    const audio = this.audio;
    if (!audio) {
      return;
    }

    switch (state) {
      case "menu":
        audio.startMusic("menu");
        return;
      case "garage":
        audio.startMusic("garage");
        return;
      case "running":
        audio.startMusic("run");
        return;
      case "paused":
        audio.pauseMusic();
        return;
      case "gameOver":
        audio.stopMusic();
        return;
      case "countdown":
      case "boot":
      case "loading":
      case "reviving":
        return;
    }
  }

  private unlockAudio(): void {
    if (!this.audio || this.audioUnlocked) {
      return;
    }

    void this.audio
      .unlock()
      .then(() => {
        this.audioUnlocked = true;
        this.syncAudioForState(this.stateMachine.getState());
      })
      .catch(() => {
        this.audioUnlocked = false;
      });
  }

  private bindButton(
    button: HTMLButtonElement | undefined,
    handler: () => void,
    sound: "click" | "garageSwitch" = "click"
  ): void {
    if (!button) {
      return;
    }

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.unlockAudio();
      if (sound === "garageSwitch") {
        this.audio?.playGarageSwitch();
      } else {
        this.audio?.playMenuClick();
      }
      handler();
    });
    button.addEventListener("touchstart", (event) => event.stopPropagation(), { passive: true });
    button.addEventListener("touchend", (event) => event.stopPropagation(), { passive: true });
  }

  private openGarage(): void {
    if (this.stateMachine.getState() !== "menu") {
      return;
    }

    this.disposeGarageScene();
    this.garageScene = this.createGarageScene();
    this.activateScene(this.garageScene);
    this.stateMachine.transition("garage", "garage-open");
    this.updateGarageUi();
    this.renderHankoRail();
  }

  private returnToMenuFromGarage(): void {
    if (this.stateMachine.getState() !== "garage") {
      return;
    }

    this.activateScene(this.ensureRunScene());
    this.disposeGarageScene(true);
    this.stateMachine.transition("menu", "garage-back");
  }

  private returnToMainMenu(): void {
    const state = this.stateMachine.getState();
    if (state !== "gameOver" && state !== "paused") {
      return;
    }

    window.clearTimeout(this.countdownTimeout);
    const runScene = this.ensureRunScene();
    this.activateScene(runScene);
    runScene.resetRun();
    this.stateMachine.transition("menu", "main-menu");
  }

  private handleGarageMove(direction: -1 | 1): void {
    if (this.stateMachine.getState() !== "garage" || !this.garageScene) {
      return;
    }

    this.garageScene.moveSelection(direction);
    this.updateGarageUi();
  }

  private renderHankoRail(): void {
    if (!this.hankoRail) {
      return;
    }
    const previewId = this.garageScene?.getPreviewVehicle().id ?? "";
    this.hankoRail.innerHTML = getAllVehicles()
      .map((vehicle) => {
        const owned = isVehicleOwned(vehicle, this.unlockedVehicleIds);
        const classes = ["hanko"];
        if (!owned) {
          classes.push("is-locked");
        }
        if (vehicle.id === previewId) {
          classes.push("is-active");
        }
        return `<span class="${classes.join(" ")}" data-hanko-id="${vehicle.id}">${getVehicleKanji(vehicle.id)}</span>`;
      })
      .join("");
    this.lastHankoActiveId = previewId;
  }

  private startFromGarage(): void {
    if (this.stateMachine.getState() !== "garage" || !this.garageScene) {
      return;
    }

    const preview = this.garageScene.getPreview();
    if (!preview.owned) {
      if (!preview.canAfford) {
        this.updateGarageUi();
        return;
      }

      const result = unlockVehicle(preview.vehicle.id, this.saveData);
      this.saveData = result.saveData;
      this.syncVehicleStateFromSaveData();
      this.garageScene.refreshOwnership(this.unlockedVehicleIds, this.saveData.totalCoins);
      this.updateGarageUi();
      this.renderHankoRail();
      return;
    }

    const selection = this.garageScene.confirmSelection();
    if (!selection.ok) {
      this.updateGarageUi();
      return;
    }

    this.saveData = saveSelectedVehicle(selection.vehicleId, this.saveData);
    this.syncVehicleStateFromSaveData();
    this.replaceRunScene(this.selectedVehicle, true);
    this.disposeGarageScene();
    this.beginCountdown("garage-start");
  }

  private claimRunRewards(stats: RunStats | undefined): void {
    if (this.runRewardsClaimed || !stats) {
      return;
    }

    this.saveData = addRunCoins(stats.coins, this.saveData);
    this.syncVehicleStateFromSaveData();
    this.runRewardsClaimed = true;
  }

  private syncVehicleStateFromSaveData(): void {
    this.unlockedVehicleIds = [...this.saveData.unlockedVehicleIds];
    this.selectedVehicle = getOwnedVehicleDefinition(this.saveData.selectedVehicleId, this.unlockedVehicleIds);
  }

  private handlePrimaryAction(): void {
    const state = this.stateMachine.getState();
    if (state === "garage") {
      this.startFromGarage();
      return;
    }

    if (state === "paused") {
      this.resume();
      return;
    }

    if (state === "running") {
      this.pause();
      return;
    }

    if (state === "menu" || state === "gameOver") {
      this.start();
    }
  }

  private handleBufferedInput(state: GameState): void {
    if (!this.input) {
      return;
    }

    if (this.input.consumeAction("pause")) {
      this.unlockAudio();
      this.audio?.playMenuClick();
      if (state === "garage") {
        this.returnToMenuFromGarage();
      } else if (state === "gameOver") {
        this.returnToMainMenu();
      } else if (state === "paused") {
        this.resume();
      } else if (state === "running") {
        this.pause();
      }
      return;
    }

    if (this.input.consumeAction("confirm")) {
      this.unlockAudio();
      this.audio?.playMenuClick();
      this.handlePrimaryAction();
      return;
    }

    if (state === "garage") {
      if (this.input.consumeAction("moveLeft")) {
        this.unlockAudio();
        this.audio?.playGarageSwitch();
        this.handleGarageMove(-1);
      }

      if (this.input.consumeAction("moveRight")) {
        this.unlockAudio();
        this.audio?.playGarageSwitch();
        this.handleGarageMove(1);
      }

      return;
    }

    if (state !== "running" || !this.runScene) {
      return;
    }

    if (this.input.consumeAction("moveLeft")) {
      this.runScene.moveLane(1);
    }

    if (this.input.consumeAction("moveRight")) {
      this.runScene.moveLane(-1);
    }

    if (this.input.consumeAction("boost")) {
      this.unlockAudio();
      this.runScene.activateBoost();
    }
  }

  private updateUi(state: GameState): void {
    if (!this.ui || !this.stateLabel || !this.actionButton) {
      return;
    }

    this.ui.dataset.state = state;
    this.stateLabel.innerHTML = this.getStateLabel(state);
    this.actionButton.textContent = this.getActionLabel(state);
    this.actionButton.disabled = state === "loading" || state === "countdown";
    this.actionButton.hidden = state === "garage";
    if (this.garageButton) {
      this.garageButton.hidden = state !== "menu";
    }
    if (this.mainMenuButton) {
      this.mainMenuButton.hidden = state !== "gameOver";
    }
    if (this.garageControls) {
      this.garageControls.hidden = state !== "garage";
    }
    if (this.garageVehicleLabel) {
      this.garageVehicleLabel.hidden = state !== "garage";
    }
    if (this.garageBalanceLabel) {
      this.garageBalanceLabel.hidden = state !== "garage";
    }
    if (this.hankoRail) {
      this.hankoRail.hidden = state !== "garage";
    }
    // Tier + shop chips are now printed diegetically on the 3D wall stencil.
    if (this.garageTierBadge) {
      this.garageTierBadge.hidden = true;
    }
    if (this.garageShopMeta) {
      this.garageShopMeta.hidden = true;
    }
    if (this.gameOverSummary) {
      this.gameOverSummary.hidden = state !== "gameOver";
    }
    this.updateGarageUi();
    this.updateGameOverUi();
    this.updateMenuUi();
    this.updateStats();
  }

  private updateMenuUi(): void {
    const coins = Math.max(0, Math.floor(this.saveData.totalCoins));
    const best = Math.max(0, Math.floor(this.saveData.bestDistance));
    const level = 1 + Math.floor(coins / 1500);
    const intoLevel = (coins % 1500) / 1500;
    if (this.frMenuCoins) {
      this.frMenuCoins.textContent = coins.toLocaleString("en-US");
    }
    if (this.frMenuLevel) {
      this.frMenuLevel.textContent = String(level);
    }
    if (this.frMenuXpText) {
      this.frMenuXpText.textContent = `${Math.round(intoLevel * 100)}%`;
    }
    if (this.frMenuXpFill) {
      this.frMenuXpFill.style.width = `${Math.round(intoLevel * 100)}%`;
    }
    if (this.frMenuBest) {
      this.frMenuBest.textContent = best.toLocaleString("en-US");
    }
  }

  private updateGameOverUi(): void {
    if (!this.gameOverSummary) {
      return;
    }

    const stats = this.lastRunStats ?? this.runScene?.getRunStats();
    if (!stats) {
      this.gameOverSummary.textContent = "";
      return;
    }

    this.gameOverSummary.innerHTML = `
      <div class="go-meta">
        <span class="t-micro"><span class="kicker-jp">終</span> META</span>
        <strong>${Math.round(stats.distance).toLocaleString("en-US")}</strong>
      </div>
      <div class="go-chips">
        <span class="go-chip-coins"><small class="t-micro">金 KOBAN</small><b>${stats.coins.toLocaleString("en-US")}</b></span>
        <span><small class="t-micro">点 SCORE</small><b>${stats.score.toLocaleString("en-US")}</b></span>
      </div>
    `;
  }

  private updateGarageUi(): void {
    const garageScene = this.garageScene;
    const isGarageState = this.stateMachine.getState() === "garage";
    const isSwitching = garageScene?.isSwitching() ?? true;
    const preview = garageScene?.getPreview();

    if (this.garageVehicleLabel && preview) {
      this.garageVehicleLabel.textContent = preview.vehicle.displayName;
    }
    if (this.hankoRail && preview && preview.vehicle.id !== this.lastHankoActiveId) {
      this.lastHankoActiveId = preview.vehicle.id;
      for (const seal of Array.from(this.hankoRail.querySelectorAll("[data-hanko-id]"))) {
        seal.classList.toggle("is-active", seal.getAttribute("data-hanko-id") === preview.vehicle.id);
      }
    }

    // Tier / price / owned are printed diegetically on the 3D wall stencil now;
    // only the coin balance stays as minimal corner chrome.
    if (this.garageBalanceLabel && preview) {
      this.garageBalanceLabel.textContent = `金 ${this.formatCoinsShort(preview.totalCoins)}`;
    }

    if (this.garagePreviousButton) {
      this.garagePreviousButton.disabled = !isGarageState || isSwitching;
    }
    if (this.garageNextButton) {
      this.garageNextButton.disabled = !isGarageState || isSwitching;
    }
    if (this.garageStartButton) {
      const blockedByLock = preview ? !preview.owned && !preview.canAfford : true;
      this.garageStartButton.disabled = !isGarageState || isSwitching || blockedByLock;
      const canBuy = !!preview && !preview.owned && preview.canAfford;
      this.garageStartButton.textContent = preview?.owned ? "走 DRIVE" : preview?.canAfford ? "金 UNLOCK" : "鍵 LOCKED";
      this.garageStartButton.classList.toggle("primary-action--buy", canBuy);
    }
    if (this.garageBackButton) {
      this.garageBackButton.disabled = !isGarageState;
    }
  }

  private updateStats(): void {
    if (!this.runScene || !this.metaLabel || !this.coinsLabel || !this.comboLabel || !this.pressureLabel) {
      return;
    }

    const stats = this.runScene.getRunStats();
    this.metaLabel.textContent = `走 ${Math.round(stats.distance).toLocaleString("en-US")}`;
    this.coinsLabel.textContent = `金 ${stats.coins.toLocaleString("en-US")}`;
    this.comboLabel.textContent = `× ${stats.combo}`;
    this.pressureLabel.textContent = `圧 ${Math.round(stats.pressure)}`;
  }

  private formatCoinsShort(value: number): string {
    return Math.max(0, Math.floor(value)).toLocaleString("en-US");
  }

  private getStateLabel(state: GameState): string {
    const kicker = (kanji: string, latin: string): string =>
      `<span class="kicker-jp">${kanji}</span><span>${latin}</span>`;

    switch (state) {
      case "loading":
        return kicker("読", "LOADING");
      case "countdown":
        return kicker("用", "READY");
      case "running":
        return kicker("走", "RUNNING");
      case "paused":
        return kicker("止", "PAUSED");
      case "gameOver":
        return kicker("終", "RUN COMPLETE");
      case "garage":
        return kicker("蔵", "GARAGE");
      case "menu":
        return kicker("道", "ENDLESS RUN · 江戸");
      case "boot":
      case "reviving":
        return kicker("待", "STANDBY");
    }
  }

  private getActionLabel(state: GameState): string {
    switch (state) {
      case "running":
        return "止 PAUSE";
      case "paused":
        return "続 RESUME";
      case "gameOver":
        return "再 RESTART";
      case "countdown":
        return "用 READY";
      case "garage":
        return "走 START";
      default:
        return "走 START";
    }
  }

}

function mergeConfig(partial: Partial<GameConfig>): GameConfig {
  return {
    ...DEFAULT_GAME_CONFIG,
    ...partial,
    audio: {
      ...DEFAULT_GAME_CONFIG.audio,
      ...partial.audio
    },
    input: {
      ...DEFAULT_GAME_CONFIG.input,
      ...partial.input
    }
  };
}
