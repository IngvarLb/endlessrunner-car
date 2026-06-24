import { DEFAULT_GAME_CONFIG, type GameConfig, type QualityMode } from "./GameConfig";
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
  addVehicleMeters,
  getVehicleProgress,
  loadSaveData,
  purchaseMainUpgrade,
  saveSaveData,
  saveSelectedVehicle,
  unlockVehicle
} from "../game/progression/SaveDataStore";
import { RunAbilityController } from "../game/abilities/RunAbilityController";
import { getMainAbility, getPassiveAbility } from "../game/abilities/AbilityCatalog";
import { MAIN_MAX_LEVEL, mainDuration, mainUpgradeCost } from "../game/abilities/UpgradeService";
import type { ChargeTier, PassiveAbilityDef } from "../game/abilities/AbilityTypes";
import { masteryLevel, masteryProgressRatio, metersToNextLevel, passiveValue } from "../game/abilities/MasteryService";
import type { SaveData } from "../game/progression/SaveData";
import type { RunStats } from "../game/progression/ScoreSystem";
import { GameStateMachine } from "../game/state/GameStateMachine";
import type { GameState } from "../game/state/GameStateTypes";
import {
  getAllVehicles,
  getOwnedVehicleDefinition,
  isVehicleOwned,
  TIER_META,
  type VehicleDefinition
} from "../game/vehicles/VehicleCatalog";
import type { GarageVehiclePreview } from "../game/garage/GarageTypes";

const countdownDurationMs = 720;
const idleFrameInterval = 1 / 24;
const garageFrameInterval = 1 / 40;

// Lucide `lock` icon (lucide.dev, ISC license), reshaped angular (square body +
// rectangular shackle, square caps + miter joins) to match the game's cut-paper
// edges. Drawn with an opaque colour so overlapping strokes don't double up.
const LOCK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><rect x="3" y="11" width="18" height="11"/><path d="M7 11V6h10v5"/></svg>';
// Same padlock with the shackle swung open (right leg lifted clear of the body) — owned marker.
const LOCK_OPEN_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';

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
  private saveData = loadSaveData();
  private unlockedVehicleIds = [...this.saveData.unlockedVehicleIds];
  private selectedVehicle: VehicleDefinition = getOwnedVehicleDefinition(
    this.saveData.selectedVehicleId,
    this.saveData.unlockedVehicleIds
  );
  private lastRunStats?: RunStats;
  private runAbilities?: RunAbilityController;
  private viewportWidth = 1;
  private viewportHeight = 1;
  private countdownTimeout = 0;
  private audioUnlocked = false;
  private settingsOpen = false;
  private renderAccumulator = 0;
  private runRewardsClaimed = false;
  private perf?: PerfMonitor;
  private perfHud?: HTMLElement;
  private frMenuCoins?: HTMLElement;
  private frMenuLevel?: HTMLElement;
  private frMenuXpText?: HTMLElement;
  private frMenuXpFill?: HTMLElement;
  private frMenuBest?: HTMLElement;
  private frGarage?: HTMLElement;
  private frgEls: Record<string, HTMLElement | undefined> = {};
  private lastFrGarageVehicleId = "";
  private frSettings?: HTMLElement;
  private setMasterInput?: HTMLInputElement;
  private setMusicInput?: HTMLInputElement;
  private setSfxInput?: HTMLInputElement;
  private hudMeta?: HTMLElement;
  private hudCoins?: HTMLElement;
  private hudCombo?: HTMLElement;
  private hudPressure?: HTMLElement;
  private hudCharge?: HTMLElement;
  private hudChargeRing?: HTMLElement;
  private hudChargeKanji?: HTMLElement;
  private hudChargeTag?: HTMLElement;
  private hudToast?: HTMLElement;
  private hudToastLvl?: HTMLElement;
  private hudToastTimeout = 0;
  private hudActive?: HTMLElement;
  private hudActiveKanji?: HTMLElement;
  private hudActiveName?: HTMLElement;
  private hudActiveTime?: HTMLElement;
  private goMeta?: HTMLElement;
  private goCoins?: HTMLElement;
  private goScore?: HTMLElement;

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
      masterVolume: this.saveData.settings.masterVolume,
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
    this.bindAbilityEvents();
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
    const progress = getVehicleProgress(this.selectedVehicle.id, this.saveData);
    this.runAbilities = new RunAbilityController(this.selectedVehicle.id, {
      mainLevel: progress.mainLevel,
      meters: progress.meters
    });
    this.resetChargeHud(this.selectedVehicle);
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
      this.runAbilities?.update(dt, this.runScene.getEffectContext());

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
      <section class="fr-garage" data-fr-garage>
        <div class="fr-bg fr-bg--garage"></div>
        <div class="fr-ghost fr-ghost--garage" data-frg-ghost>赤</div>
        <div class="fr-grain"></div>
        <span class="fr-corner fr-corner--tl">+</span>
        <span class="fr-corner fr-corner--br">+</span>

        <div class="fr-gword" data-frg-word>CRIMSON</div>

        <header class="fr-topbar fr-topbar--garage">
          <div class="fr-gtop-left">
            <button class="fr-back-btn fr-garage-back2" type="button"><span class="fr-back-jp">戻</span>ZURÜCK</button>
            <div class="fr-gtop-label">
              <div class="fr-gtop-kicker">車庫 · GARAGE</div>
              <div class="fr-gtop-no"><span data-frg-no>N°.01</span> <span class="fr-gtop-no-sub">· 蔵 SELECT</span></div>
            </div>
          </div>
          <div class="fr-topright">
            <div class="fr-chip fr-chip--coin"><span class="fr-coin-k">金</span><span data-frg-coins>0</span></div>
            <div class="fr-chip fr-lvl">
              <div class="fr-lvl-row"><span class="fr-lvl-num">LV.<span data-frg-level>1</span></span><span class="fr-lvl-pct" data-frg-xptext>0%</span></div>
              <div class="fr-lvl-bar"><div class="fr-lvl-fill" data-frg-xpfill></div></div>
            </div>
            <button class="fr-iconbtn fr-garage-settings" type="button" aria-label="Settings" title="Settings">設</button>
          </div>
        </header>

        <div class="fr-gkanji">
          <div class="fr-gkanji-big" data-frg-kanji>赤</div>
          <div class="fr-gkanji-romaji" data-frg-romaji>AKA</div>
          <div class="fr-gkanji-tag" data-frg-tag></div>
        </div>

        <aside class="fr-gpanel">
          <div class="fr-gmeta">
            <span class="fr-gmeta-k" data-frg-mk>赤</span>
            <span class="fr-gmeta-romaji" data-frg-mr>AKA</span>
            <span class="fr-gmeta-div"></span>
            <span class="fr-gmeta-tag" data-frg-mt></span>
          </div>
          <div class="fr-gname" data-frg-name>CRIMSON BOLT</div>
          <div class="fr-gstats-label">能力 · FÄHIGKEITEN</div>
          <div class="fr-gabilities" data-frg-abilities></div>
          <div class="fr-gaction" data-frg-action></div>
        </aside>

        <div class="fr-roster">
          <div class="fr-roster-head">
            <span class="fr-roster-title">車両 ROSTER · 七台</span>
            <span class="fr-roster-hint">← → SELECT</span>
          </div>
          <div class="fr-roster-cards" data-frg-roster></div>
        </div>
      </section>
      <section class="fr-settings" data-fr-settings hidden aria-label="Settings">
        <div class="fr-bg fr-bg--settings"></div>
        <div class="fr-ghost fr-ghost--settings">設</div>
        <div class="fr-screentone fr-screentone--settings"></div>
        <div class="fr-grain"></div>
        <span class="fr-corner fr-corner--tl">+</span>
        <span class="fr-corner fr-corner--br">+</span>

        <header class="fr-topbar fr-topbar--settings">
          <div class="fr-brand">
            <span class="fr-seal">走</span>
            <span class="fr-brand-name">FEUDAL RUNNER</span>
          </div>
          <button class="fr-close-btn fr-settings-close" type="button"><span class="fr-close-x">✕</span><span class="fr-close-jp">閉</span>CLOSE</button>
        </header>

        <div class="fr-set-body">
          <div class="fr-set-title">
            <div class="fr-kicker">
              <span class="fr-kicker-jp">設</span>
              <span class="fr-kicker-en">SYSTEM CONFIG</span>
              <span class="fr-kicker-rule"></span>
              <span class="fr-kicker-no">.SYS</span>
            </div>
            <h1 class="fr-monument fr-set-monument">SETTINGS</h1>
            <div class="fr-set-sub"><span class="fr-set-sub-jp">設定</span><span class="fr-set-sub-div"></span><span class="fr-set-sub-tx">環境設定 ・ オーディオと表示</span></div>
          </div>

          <div class="fr-set-divider"></div>

          <div class="fr-set-cols">
            <div class="fr-set-col">
              <div class="fr-set-secthead"><span class="fr-set-num">01</span><span class="fr-set-sectlabel">音響 · AUDIO</span></div>
              <div class="fr-set-sliders">
                <label class="fr-srow"><span class="fr-srow-label"><span class="fr-srow-jp">主</span>MASTER</span><input type="range" min="0" max="100" data-set-master class="fr-range"><span class="fr-srow-val" data-set-master-val>0</span></label>
                <label class="fr-srow"><span class="fr-srow-label"><span class="fr-srow-jp">楽</span>MUSIC</span><input type="range" min="0" max="100" data-set-music class="fr-range"><span class="fr-srow-val" data-set-music-val>0</span></label>
                <label class="fr-srow"><span class="fr-srow-label"><span class="fr-srow-jp">効</span>SFX</span><input type="range" min="0" max="100" data-set-sfx class="fr-range"><span class="fr-srow-val" data-set-sfx-val>0</span></label>
              </div>
            </div>
            <div class="fr-set-col fr-set-col--right">
              <div class="fr-set-secthead"><span class="fr-set-num">02</span><span class="fr-set-sectlabel">表示 · DISPLAY</span></div>
              <div class="fr-set-toggles">
                <button class="fr-toggle fr-set-mute" type="button" aria-pressed="false"><span class="fr-toggle-label"><span class="fr-srow-jp">無音</span>MUTE</span><span class="fr-switch"><span class="fr-switch-thumb"></span></span></button>
                <button class="fr-toggle fr-set-perf" type="button" aria-pressed="false"><span class="fr-toggle-label"><span class="fr-srow-jp">性能</span>PERF HUD</span><span class="fr-switch"><span class="fr-switch-thumb"></span></span></button>
              </div>
              <div class="fr-set-secthead fr-set-secthead--gfx"><span class="fr-set-num">03</span><span class="fr-set-sectlabel">画質 · GRAPHICS</span></div>
              <div class="fr-set-quality">
                <button class="fr-qbtn fr-set-q" type="button" data-quality="low"><span class="fr-srow-jp">低</span>LOW</button>
                <button class="fr-qbtn fr-set-q" type="button" data-quality="medium"><span class="fr-srow-jp">中</span>MED</button>
                <button class="fr-qbtn fr-set-q" type="button" data-quality="high"><span class="fr-srow-jp">高</span>HIGH</button>
              </div>
            </div>
          </div>
        </div>

        <div class="fr-set-footer">
          <span class="fr-set-build">BUILD 2026.06 · 江戸 · FEUDAL RUNNER</span>
          <button class="fr-set-done fr-settings-close" type="button"><span class="fr-gbtn-jp">閉</span>DONE · 完了</button>
        </div>
      </section>
      <section class="fr-hud" data-fr-hud aria-hidden="true">
        <div class="fr-hud-top">
          <div class="fr-hud-meta">
            <span class="fr-hud-meta-k">走</span>
            <span class="fr-hud-meta-val" data-hud-meta>0</span>
            <span class="fr-hud-meta-unit">M</span>
          </div>
          <div class="fr-hud-chips">
            <div class="fr-hud-chip fr-hud-chip--coin"><span class="fr-hud-chip-k">金</span><span data-hud-coins>0</span></div>
            <div class="fr-hud-chip"><span class="fr-hud-chip-k">×</span><span data-hud-combo>0</span></div>
            <div class="fr-hud-chip"><span class="fr-hud-chip-k">圧</span><span data-hud-pressure>0</span></div>
            <button class="fr-hud-pause fr-hud-pause-action" type="button" aria-label="Pause" title="Pause">止</button>
          </div>
        </div>

        <div class="fr-hud-toast" data-hud-toast aria-hidden="true">
          <span class="fr-hud-toast-star">里</span>
          <span class="fr-hud-toast-txt"><span class="fr-hud-toast-k">MEISTERSCHAFT</span><span class="fr-hud-toast-big">Stufe <b data-hud-toast-lvl>2</b></span></span>
        </div>

        <div class="fr-hud-active" data-hud-active aria-hidden="true">
          <span class="fr-hud-active-k" data-hud-active-k>赤</span>
          <span class="fr-hud-active-nm" data-hud-active-nm>STRIKER BOOST</span>
          <span class="fr-hud-active-t" data-hud-active-t>0,0 s</span>
        </div>

        <div class="fr-hud-bottom">
          <button class="fr-charge fr-charge-action" type="button" data-hud-charge aria-label="Fähigkeit aktivieren">
            <span class="fr-charge-ring" data-hud-charge-ring></span>
            <span class="fr-charge-core"><span class="fr-charge-kanji" data-hud-charge-kanji>赤</span></span>
            <span class="fr-charge-tag" data-hud-charge-tag>0%</span>
          </button>
        </div>
      </section>
      <div class="fr-countdown" data-fr-countdown aria-hidden="true">
        <span class="fr-countdown-jp">用意</span>
        <span class="fr-countdown-en">READY</span>
      </div>
      <section class="fr-pause" data-fr-pause aria-hidden="true">
        <div class="fr-bg fr-bg--scrim"></div>
        <div class="fr-pause-card">
          <div class="fr-kicker">
            <span class="fr-kicker-jp">止</span>
            <span class="fr-kicker-en">PAUSED</span>
            <span class="fr-kicker-rule"></span>
            <span class="fr-kicker-no">.II</span>
          </div>
          <h1 class="fr-monument fr-pause-title">PAUSED</h1>
          <div class="fr-pause-actions">
            <button class="fr-btn fr-btn--primary fr-resume-action" type="button"><span class="fr-btn-jp">続</span>RESUME</button>
            <button class="fr-btn fr-btn--ghost fr-pause-menu-action" type="button"><span class="fr-btn-jp fr-accent">戻</span>MENU</button>
          </div>
        </div>
      </section>
      <section class="fr-gameover" data-fr-gameover aria-hidden="true">
        <div class="fr-bg fr-bg--scrim"></div>
        <div class="fr-go-card">
          <div class="fr-kicker">
            <span class="fr-kicker-jp">終</span>
            <span class="fr-kicker-en">RUN COMPLETE</span>
            <span class="fr-kicker-rule"></span>
            <span class="fr-kicker-no">江戸</span>
          </div>
          <div class="fr-go-meta">
            <span class="fr-go-meta-k">走</span>
            <span class="fr-go-meta-val" data-go-meta>0</span>
            <span class="fr-go-meta-unit">M</span>
          </div>
          <div class="fr-go-chips">
            <div class="fr-go-chip fr-go-chip--coin"><span class="fr-go-chip-lab"><span class="fr-go-chip-k">金</span>KOBAN</span><b data-go-coins>0</b></div>
            <div class="fr-go-chip"><span class="fr-go-chip-lab"><span class="fr-go-chip-k">点</span>SCORE</span><b data-go-score>0</b></div>
          </div>
          <div class="fr-go-actions">
            <button class="fr-btn fr-btn--primary fr-restart-action" type="button"><span class="fr-btn-jp">再</span>RESTART</button>
            <button class="fr-btn fr-btn--ghost fr-go-menu-action" type="button"><span class="fr-btn-jp fr-accent">戻</span>MAIN MENU</button>
          </div>
        </div>
      </section>
      <pre class="perf-hud" data-perf-hud hidden aria-hidden="true"></pre>
    `;

    this.root.appendChild(ui);
    this.ui = ui;
    this.perfHud = ui.querySelector("[data-perf-hud]") ?? undefined;
    if (this.perfHud && this.renderer) {
      this.perf = new PerfMonitor(this.perfHud, this.renderer.renderer);
    }
    this.frMenuCoins = ui.querySelector("[data-fr-coins]") ?? undefined;
    this.frMenuLevel = ui.querySelector("[data-fr-level]") ?? undefined;
    this.frMenuXpText = ui.querySelector("[data-fr-xptext]") ?? undefined;
    this.frMenuXpFill = ui.querySelector("[data-fr-xpfill]") ?? undefined;
    this.frMenuBest = ui.querySelector("[data-fr-best]") ?? undefined;
    this.cacheFrGarageRefs(ui);
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-start-action") ?? undefined, () => this.start());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-garage-action") ?? undefined, () => this.openGarage());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-settings-open") ?? undefined, () => this.toggleSettingsPanel());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-garage-back2") ?? undefined, () => this.returnToMenuFromGarage());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-garage-settings") ?? undefined, () => this.toggleSettingsPanel());
    this.bindFrGarageDelegates();
    this.cacheAndBindFrSettings(ui);
    this.hudMeta = ui.querySelector("[data-hud-meta]") ?? undefined;
    this.hudCoins = ui.querySelector("[data-hud-coins]") ?? undefined;
    this.hudCombo = ui.querySelector("[data-hud-combo]") ?? undefined;
    this.hudPressure = ui.querySelector("[data-hud-pressure]") ?? undefined;
    this.hudCharge = ui.querySelector("[data-hud-charge]") ?? undefined;
    this.hudChargeRing = ui.querySelector("[data-hud-charge-ring]") ?? undefined;
    this.hudChargeKanji = ui.querySelector("[data-hud-charge-kanji]") ?? undefined;
    this.hudChargeTag = ui.querySelector("[data-hud-charge-tag]") ?? undefined;
    this.hudToast = ui.querySelector("[data-hud-toast]") ?? undefined;
    this.hudToastLvl = ui.querySelector("[data-hud-toast-lvl]") ?? undefined;
    this.hudActive = ui.querySelector("[data-hud-active]") ?? undefined;
    this.hudActiveKanji = ui.querySelector("[data-hud-active-k]") ?? undefined;
    this.hudActiveName = ui.querySelector("[data-hud-active-nm]") ?? undefined;
    this.hudActiveTime = ui.querySelector("[data-hud-active-t]") ?? undefined;
    this.goMeta = ui.querySelector("[data-go-meta]") ?? undefined;
    this.goCoins = ui.querySelector("[data-go-coins]") ?? undefined;
    this.goScore = ui.querySelector("[data-go-score]") ?? undefined;
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-hud-pause-action") ?? undefined, () => this.pause());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-charge-action") ?? undefined, () => this.handleActivateAbility());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-resume-action") ?? undefined, () => this.resume());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-pause-menu-action") ?? undefined, () => this.returnToMainMenu());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-restart-action") ?? undefined, () => this.start());
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-go-menu-action") ?? undefined, () => this.returnToMainMenu());
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

  private bindAbilityEvents(): void {
    // Coins feed the charge meter; fires once per pickup while a run is active.
    // Distance is synced per frame in updateStats (no score:changed event exists).
    this.events.on("coin:collected", ({ amount }) => this.runAbilities?.onCoinCollected(amount));
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
        masterVolume: settings.masterVolume,
        musicVolume: settings.musicVolume,
        sfxVolume: settings.sfxVolume,
        muted: settings.muted
      });
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
    if (this.frSettings) {
      this.frSettings.hidden = !this.settingsOpen;
    }
    this.syncFrSettings();
    this.perf?.setEnabled(this.saveData.settings.showPerfHud);
  }

  private cacheAndBindFrSettings(ui: HTMLElement): void {
    this.frSettings = ui.querySelector("[data-fr-settings]") ?? undefined;
    this.setMasterInput = ui.querySelector("[data-set-master]") ?? undefined;
    this.setMusicInput = ui.querySelector("[data-set-music]") ?? undefined;
    this.setSfxInput = ui.querySelector("[data-set-sfx]") ?? undefined;

    this.setMasterInput?.addEventListener("input", () => {
      this.updateAudioSettings({ masterVolume: this.getRangePercent(this.setMasterInput, this.saveData.settings.masterVolume) });
    });
    this.setMusicInput?.addEventListener("input", () => {
      this.updateAudioSettings({ musicVolume: this.getRangePercent(this.setMusicInput, this.saveData.settings.musicVolume) });
    });
    this.setSfxInput?.addEventListener("input", () => {
      this.updateAudioSettings({ sfxVolume: this.getRangePercent(this.setSfxInput, this.saveData.settings.sfxVolume) });
    });

    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-set-mute") ?? undefined, () =>
      this.updateAudioSettings({ muted: !this.saveData.settings.muted })
    );
    this.bindButton(ui.querySelector<HTMLButtonElement>(".fr-set-perf") ?? undefined, () =>
      this.setPerfHud(!this.saveData.settings.showPerfHud)
    );
    for (const button of Array.from(ui.querySelectorAll<HTMLButtonElement>(".fr-set-q"))) {
      const quality = button.dataset.quality as QualityMode | undefined;
      if (quality) {
        this.bindButton(button, () => this.setQualitySetting(quality));
      }
    }
    for (const button of Array.from(ui.querySelectorAll<HTMLButtonElement>(".fr-settings-close"))) {
      this.bindButton(button, () => this.toggleSettingsPanel());
    }
  }

  private syncFrSettings(): void {
    if (!this.frSettings) {
      return;
    }

    const settings = this.saveData.settings;
    this.setRangeUi(this.setMasterInput, "[data-set-master-val]", settings.masterVolume);
    this.setRangeUi(this.setMusicInput, "[data-set-music-val]", settings.musicVolume);
    this.setRangeUi(this.setSfxInput, "[data-set-sfx-val]", settings.sfxVolume);
    this.setToggleUi(".fr-set-mute", settings.muted);
    this.setToggleUi(".fr-set-perf", settings.showPerfHud);
    for (const button of Array.from(this.frSettings.querySelectorAll<HTMLButtonElement>(".fr-set-q"))) {
      button.classList.toggle("is-active", button.dataset.quality === settings.quality);
    }
  }

  private setRangeUi(input: HTMLInputElement | undefined, valSelector: string, value01: number): void {
    const percent = Math.round(this.clamp01(value01) * 100);
    if (input) {
      input.value = String(percent);
    }
    const valEl = this.frSettings?.querySelector(valSelector);
    if (valEl) {
      valEl.textContent = String(percent);
    }
  }

  private setToggleUi(selector: string, on: boolean): void {
    const toggle = this.frSettings?.querySelector(selector);
    if (toggle) {
      toggle.classList.toggle("is-on", on);
      toggle.setAttribute("aria-pressed", String(on));
    }
  }

  private getRangePercent(input: HTMLInputElement | undefined, fallback: number): number {
    if (!input) {
      return fallback;
    }
    const value = Number.parseFloat(input.value);
    return Number.isFinite(value) ? this.clamp01(value / 100) : fallback;
  }

  private setQualitySetting(quality: QualityMode): void {
    if (this.saveData.settings.quality === quality) {
      return;
    }

    this.saveData = saveSaveData({
      ...this.saveData,
      settings: { ...this.saveData.settings, quality }
    });
    this.config.quality = quality;
    this.renderer?.setQuality(quality);
    this.syncSettingsUi();
  }

  private updateAudioSettings(settings: Partial<SaveData["settings"]>): void {
    const nextSettings = {
      ...this.saveData.settings,
      ...settings,
      masterVolume: this.clamp01(settings.masterVolume ?? this.saveData.settings.masterVolume),
      musicVolume: this.clamp01(settings.musicVolume ?? this.saveData.settings.musicVolume),
      sfxVolume: this.clamp01(settings.sfxVolume ?? this.saveData.settings.sfxVolume)
    };

    this.saveData = saveSaveData({
      ...this.saveData,
      settings: nextSettings
    });
    this.config.audio.masterVolume = nextSettings.masterVolume;
    this.config.audio.musicVolume = nextSettings.musicVolume;
    this.config.audio.sfxVolume = nextSettings.sfxVolume;
    this.config.audio.muted = nextSettings.muted;
    this.events.emit("settings:changed", { settings: this.saveData.settings });
    this.syncSettingsUi();
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
    this.lastFrGarageVehicleId = ""; // force a fresh chrome rebuild (coins/ownership may have changed)
    this.updateGarageUi();
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
      this.lastFrGarageVehicleId = ""; // ownership changed without an id change → force chrome rebuild
      this.updateGarageUi();
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
    if (this.runAbilities) {
      this.saveData = addVehicleMeters(this.runAbilities.vehicleId, this.runAbilities.metersThisRun, this.saveData);
    }
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
      // Swipe/press direction = the direction the car flies out: swipe left →
      // current car exits left → next car in the row (+1); swipe right → -1.
      if (this.input.consumeAction("moveLeft")) {
        this.unlockAudio();
        this.audio?.playGarageSwitch();
        this.handleGarageMove(1);
      }

      if (this.input.consumeAction("moveRight")) {
        this.unlockAudio();
        this.audio?.playGarageSwitch();
        this.handleGarageMove(-1);
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

    // The free tap-to-boost is gone: boost now only comes from 赤's charged Main.
    // Drain the buffered boost action so it doesn't queue up.
    this.input.consumeAction("boost");
  }

  private updateUi(state: GameState): void {
    if (!this.ui) {
      return;
    }

    // State-driven visibility is fully handled in CSS via [data-state]; each
    // .fr-* screen shows itself in the right state.
    this.ui.dataset.state = state;
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
    const stats = this.lastRunStats ?? this.runScene?.getRunStats();

    if (stats) {
      if (this.goMeta) {
        this.goMeta.textContent = Math.round(stats.distance).toLocaleString("en-US");
      }
      if (this.goCoins) {
        this.goCoins.textContent = stats.coins.toLocaleString("en-US");
      }
      if (this.goScore) {
        this.goScore.textContent = stats.score.toLocaleString("en-US");
      }
    }
  }

  private updateGarageUi(): void {
    const preview = this.garageScene?.getPreview();

    // New editorial chrome (.fr-garage): rebuild the heavy DOM only on vehicle change.
    if (this.frGarage && preview && preview.vehicle.id !== this.lastFrGarageVehicleId) {
      this.renderFrGarage();
    }
  }

  private cacheFrGarageRefs(ui: HTMLElement): void {
    this.frGarage = ui.querySelector("[data-fr-garage]") ?? undefined;
    const keys = [
      "ghost",
      "word",
      "no",
      "coins",
      "level",
      "xptext",
      "xpfill",
      "kanji",
      "romaji",
      "tag",
      "name",
      "mk",
      "mr",
      "mt",
      "abilities",
      "action",
      "roster"
    ];
    for (const key of keys) {
      this.frgEls[key] = ui.querySelector<HTMLElement>(`[data-frg-${key}]`) ?? undefined;
    }
  }

  private bindFrGarageDelegates(): void {
    this.frgEls.action?.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest("button");
      if (!button || button.disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.unlockAudio();
      this.audio?.playMenuClick();
      this.startFromGarage();
    });

    this.frgEls.roster?.addEventListener("click", (event) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>("[data-roster-id]");
      if (!card) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.unlockAudio();
      this.audio?.playGarageSwitch();
      this.handleGarageJump(card.dataset.rosterId ?? "");
    });

    this.frgEls.abilities?.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button.fr-gab-upgrade");
      if (!button || button.disabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.handleMainUpgrade();
    });
  }

  private handleMainUpgrade(): void {
    if (this.stateMachine.getState() !== "garage" || !this.garageScene) {
      return;
    }

    const vehicleId = this.garageScene.getPreview().vehicle.id;
    const result = purchaseMainUpgrade(vehicleId, this.saveData);
    if (!result.ok) {
      this.updateGarageUi();
      return;
    }

    this.saveData = result.saveData;
    this.garageScene.refreshOwnership(this.unlockedVehicleIds, this.saveData.totalCoins);
    this.unlockAudio();
    this.audio?.playMenuClick();
    this.lastFrGarageVehicleId = ""; // same vehicle, but level/coins changed → force re-render
    this.updateGarageUi();
  }

  private handleGarageJump(vehicleId: string): void {
    if (this.stateMachine.getState() !== "garage" || !this.garageScene || !vehicleId) {
      return;
    }

    this.garageScene.jumpToVehicle(vehicleId);
    this.updateGarageUi();
  }

  private renderFrGarage(): void {
    const garageScene = this.garageScene;
    if (!this.frGarage || !garageScene) {
      return;
    }

    const preview = garageScene.getPreview();
    const vehicle = preview.vehicle;
    const index = Math.max(0, getAllVehicles().findIndex((entry) => entry.id === vehicle.id));
    const carNo = `N°.0${index + 1}`;
    const word = vehicle.displayName.split(" ")[0].toUpperCase();
    const els = this.frgEls;

    if (els.ghost) {
      els.ghost.textContent = vehicle.kanji;
      els.ghost.style.color = this.hexToRgba(vehicle.paint, 0.1);
    }
    if (els.word) {
      els.word.textContent = word;
      els.word.style.color = vehicle.paint;
    }
    if (els.no) {
      els.no.textContent = carNo;
    }
    if (els.kanji) {
      els.kanji.textContent = vehicle.kanji;
      els.kanji.style.color = vehicle.paint;
    }
    if (els.romaji) {
      els.romaji.textContent = vehicle.romaji;
    }
    if (els.tag) {
      els.tag.textContent = vehicle.tag;
    }
    if (els.name) {
      els.name.textContent = vehicle.displayName;
    }
    if (els.mk) {
      els.mk.textContent = vehicle.kanji;
      els.mk.style.color = vehicle.paint;
    }
    if (els.mr) {
      els.mr.textContent = vehicle.romaji;
    }
    if (els.mt) {
      els.mt.textContent = vehicle.tag;
    }
    if (els.abilities) {
      els.abilities.innerHTML = this.renderFrGarageAbilities(vehicle);
    }
    if (els.action) {
      els.action.innerHTML = this.renderFrGarageAction(preview);
    }
    if (els.roster) {
      els.roster.innerHTML = this.renderFrGarageRoster(vehicle.id);
    }

    this.updateFrGarageProfile(preview.totalCoins);
    this.lastFrGarageVehicleId = vehicle.id;
  }

  private renderFrGarageAbilities(vehicle: VehicleDefinition): string {
    const main = getMainAbility(vehicle.id);
    const passive = getPassiveAbility(vehicle.id);
    if (!main || !passive) {
      return "";
    }

    const progress = getVehicleProgress(vehicle.id, this.saveData);
    const paint = vehicle.paint;

    // Main — coin-bought, 30 upgrade levels
    const duration = mainDuration(main, progress.mainLevel);
    const levelPct = Math.round((progress.mainLevel / MAIN_MAX_LEVEL) * 100);
    const maxed = progress.mainLevel >= MAIN_MAX_LEVEL;
    const cost = mainUpgradeCost(progress.mainLevel);
    const affordable = Number.isFinite(cost) && this.saveData.totalCoins >= cost;
    const tier = this.chargeTierMeta(main.chargeCost);
    const upgrade = maxed
      ? `<div class="fr-gab-max">最大 · VOLL AUSGEBAUT</div>`
      : `<button class="fr-gab-upgrade${affordable ? "" : " is-disabled"}" type="button"${affordable ? "" : " disabled"}>
           <span class="fr-gab-up-lab"><span class="fr-gab-up-jp">強化</span>UPGRADE</span>
           <span class="fr-gab-up-cost"><span class="fr-gab-up-k">金</span>${this.formatCoinsShort(cost)}<span class="fr-gab-up-next">→ ${this.formatDuration(mainDuration(main, progress.mainLevel + 1))}</span></span>
         </button>`;

    // Passive — meters-driven, 100 mastery levels
    const level = masteryLevel(progress.meters);
    const value = passiveValue(passive, level);
    const masteryPct = Math.round(masteryProgressRatio(progress.meters) * 100);
    const toGo = Math.ceil(metersToNextLevel(progress.meters));
    const togo =
      level >= 100
        ? "完全習得 · voll gemeistert"
        : `自動 · noch <b>${toGo.toLocaleString("en-US")} m</b> → Stufe ${level + 1}`;

    return `
      <div class="fr-gab fr-gab--main">
        <div class="fr-gab-head">
          <span class="fr-gab-kanji fr-gab-kanji--paint" style="background:${paint}">${vehicle.kanji}</span>
          <span class="fr-gab-role">主 · <b>MAIN</b><span class="fr-gab-name">${main.name}</span></span>
          <span class="fr-gab-badge"><span class="fr-gab-badge-jp">${tier.jp}</span>${tier.en}</span>
        </div>
        <div class="fr-gab-now"><span class="fr-gab-val">${this.formatDuration(duration)}</span> · ${main.blurb ?? ""}</div>
        <div class="fr-gab-lvl">
          <span class="fr-gab-track"><span class="fr-gab-fill" style="width:${levelPct}%;background:${paint}"></span></span>
          <span class="fr-gab-lvlval">${progress.mainLevel} / ${MAIN_MAX_LEVEL}</span>
        </div>
        ${upgrade}
      </div>
      <div class="fr-gab fr-gab--passive">
        <div class="fr-gab-head">
          <span class="fr-gab-kanji fr-gab-kanji--line">${vehicle.kanji}</span>
          <span class="fr-gab-role">匠 · <b>PASSIVE</b><span class="fr-gab-name">${passive.name}</span></span>
          <span class="fr-gab-badge"><span class="fr-gab-badge-jp">里</span>MASTERY</span>
        </div>
        <div class="fr-gab-now"><span class="fr-gab-val">${this.formatPassiveValue(passive, value)}</span></div>
        <div class="fr-gab-mhead"><span class="fr-gab-mlab">MEISTERSTUFE</span><span class="fr-gab-mval">${level} <span class="fr-gab-slash">/ 100</span></span></div>
        <div class="fr-gab-track fr-gab-track--m"><span class="fr-gab-fill" style="width:${masteryPct}%;background:${paint}"></span></div>
        <div class="fr-gab-togo">${togo}</div>
      </div>`;
  }

  private chargeTierMeta(tier: ChargeTier): { jp: string; en: string } {
    const meta: Record<ChargeTier, { jp: string; en: string }> = {
      low: { jp: "低", en: "LOW" },
      midLow: { jp: "中低", en: "MID·LO" },
      mid: { jp: "中", en: "MID" },
      midHigh: { jp: "中高", en: "MID·HI" },
      high: { jp: "高", en: "HIGH" }
    };
    return meta[tier];
  }

  private formatDuration(seconds: number): string {
    const rounded = Math.round(seconds * 10) / 10;
    const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(".", ",");
    return `${text} s`;
  }

  private formatPassiveValue(passive: PassiveAbilityDef, value: number): string {
    const amount = Math.round(value).toLocaleString("en-US");
    const unit = passive.unit ? ` ${passive.unit}` : "";
    return `${passive.blurb ? `${passive.blurb} ` : ""}${amount}${unit}`;
  }

  private renderFrGarageAction(preview: GarageVehiclePreview): string {
    const cost = this.formatCoinsShort(preview.price);
    if (preview.owned) {
      return `<button class="fr-gbtn fr-gbtn--drive" type="button"><span class="fr-gbtn-jp">走</span>DRIVE</button>`;
    }

    const costRow = `
      <div class="fr-cost-row"><span class="fr-cost-lab">解放コスト</span><span class="fr-cost-val"><span class="fr-cost-k">金</span><b>${cost}</b></span></div>`;
    if (preview.canAfford) {
      return `${costRow}
        <button class="fr-gbtn fr-gbtn--unlock" type="button"><span class="fr-gbtn-jp">鍵</span>UNLOCK · 解放</button>`;
    }

    return `${costRow}
      <button class="fr-gbtn fr-gbtn--locked" type="button" disabled><span class="fr-gbtn-jp">鍵</span>金 不足 · INSUFFICIENT</button>`;
  }

  private renderFrGarageRoster(selectedId: string): string {
    return getAllVehicles()
      .map((vehicle) => {
        const owned = isVehicleOwned(vehicle, this.unlockedVehicleIds);
        const selected = vehicle.id === selectedId;
        const classes = ["fr-rcard"];
        if (selected) {
          classes.push("is-selected");
        }
        if (!owned) {
          classes.push("is-locked");
        }
        const tier = TIER_META[vehicle.tier];
        const lock = owned
          ? `<span class="fr-rcard-lock fr-rcard-lock--open">${LOCK_OPEN_ICON}</span>`
          : `<span class="fr-rcard-lock">${LOCK_ICON}</span>`;
        return `
          <button class="${classes.join(" ")}" type="button" data-roster-id="${vehicle.id}">
            <span class="fr-rcard-tier" style="background:${tier.color}">${tier.en}</span>
            <span class="fr-rcard-k" style="color:${vehicle.paint}">${vehicle.kanji}</span>
            <span class="fr-rcard-name">${vehicle.displayName}</span>
            ${lock}
          </button>`;
      })
      .join("");
  }

  private updateFrGarageProfile(totalCoins: number): void {
    const coins = Math.max(0, Math.floor(totalCoins));
    const level = 1 + Math.floor(coins / 1500);
    const intoLevel = (coins % 1500) / 1500;
    const pct = `${Math.round(intoLevel * 100)}%`;
    if (this.frgEls.coins) {
      this.frgEls.coins.textContent = coins.toLocaleString("en-US");
    }
    if (this.frgEls.level) {
      this.frgEls.level.textContent = String(level);
    }
    if (this.frgEls.xptext) {
      this.frgEls.xptext.textContent = pct;
    }
    if (this.frgEls.xpfill) {
      this.frgEls.xpfill.style.width = pct;
    }
  }

  private hexToRgba(hex: string, alpha: number): string {
    const value = hex.replace("#", "");
    const int = Number.parseInt(value.length === 3 ? value.replace(/(.)/g, "$1$1") : value, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgb(${r} ${g} ${b} / ${alpha})`;
  }

  private updateStats(): void {
    if (!this.runScene) {
      return;
    }

    const stats = this.runScene.getRunStats();
    // Accumulate mastery meters + distance charge (monotonic; resets safely between runs).
    this.runAbilities?.syncDistance(stats.distance);
    this.updateChargeHud();

    // Print-language run HUD (.fr-hud)
    if (this.hudMeta) {
      this.hudMeta.textContent = Math.round(stats.distance).toLocaleString("en-US");
    }
    if (this.hudCoins) {
      this.hudCoins.textContent = stats.coins.toLocaleString("en-US");
    }
    if (this.hudCombo) {
      this.hudCombo.textContent = String(stats.combo);
    }
    if (this.hudPressure) {
      this.hudPressure.textContent = String(Math.round(stats.pressure));
    }
  }

  /** Configure the on-screen charge ring for the vehicle about to run. */
  private resetChargeHud(vehicle: VehicleDefinition): void {
    if (this.hudChargeKanji) {
      this.hudChargeKanji.textContent = vehicle.kanji;
    }
    this.hudCharge?.style.setProperty("--cc", vehicle.paint);
    this.hudChargeRing?.style.setProperty("--p", "0%");
    this.hudCharge?.classList.remove("is-ready");
    if (this.hudChargeTag) {
      this.hudChargeTag.textContent = "0%";
    }
    if (this.hudActiveKanji) {
      this.hudActiveKanji.textContent = vehicle.kanji;
    }
    this.hudActive?.style.setProperty("--cc", vehicle.paint);
    this.hudActive?.classList.remove("is-show");
  }

  /** Per-frame: charge-ring fill/ready state + mastery level-up toast. */
  private updateChargeHud(): void {
    const abilities = this.runAbilities;
    if (!abilities) {
      return;
    }

    const ratio = abilities.chargeRatio();
    const ready = abilities.isReady();
    this.hudChargeRing?.style.setProperty("--p", `${(ratio * 100).toFixed(1)}%`);
    this.hudCharge?.classList.toggle("is-ready", ready);
    if (this.hudChargeTag) {
      this.hudChargeTag.textContent = ready ? "発動" : `${Math.round(ratio * 100)}%`;
    }

    const active = abilities.activeEffectState();
    if (this.hudActive) {
      if (active) {
        this.hudActive.classList.add("is-show");
        if (this.hudActiveName) {
          this.hudActiveName.textContent = active.name;
        }
        if (this.hudActiveTime) {
          this.hudActiveTime.textContent = this.formatDuration(active.remaining);
        }
      } else {
        this.hudActive.classList.remove("is-show");
      }
    }

    const levelUps = abilities.consumeLevelUp();
    if (levelUps > 0) {
      this.showMasteryToast(abilities.masteryLevel());
    }
  }

  /** Activate the Main ability — starts its run effect (no-op if not charged or not implemented). */
  private handleActivateAbility(): void {
    if (this.stateMachine.getState() !== "running" || !this.runAbilities || !this.runScene) {
      return;
    }
    if (!this.runAbilities.tryActivate(this.runScene.getEffectContext())) {
      return; // not charged, already active, or effect not implemented yet
    }
    this.unlockAudio();
    this.audio?.playBoost();
    this.hudCharge?.classList.remove("is-ready");
    this.hudCharge?.classList.add("is-fired");
    window.setTimeout(() => this.hudCharge?.classList.remove("is-fired"), 360);
  }

  private showMasteryToast(level: number): void {
    if (!this.hudToast) {
      return;
    }
    if (this.hudToastLvl) {
      this.hudToastLvl.textContent = String(level);
    }
    this.hudToast.classList.add("is-show");
    window.clearTimeout(this.hudToastTimeout);
    this.hudToastTimeout = window.setTimeout(() => this.hudToast?.classList.remove("is-show"), 2600);
  }

  private formatCoinsShort(value: number): string {
    return Math.max(0, Math.floor(value)).toLocaleString("en-US");
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
