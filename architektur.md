# Architekturplan: Feudal Japan Car Runner

Stand: 2026-06-18

Dieses Dokument legt die Architekturregeln fuer das Spiel fest. Ziel ist, dass zukuenftige Entwickler oder KI-Agenten das Projekt erweitern koennen, ohne zentrale Systeme unkontrolliert zu vermischen.

## Architekturziele

- Das Spiel bleibt modular.
- Gameplay, Rendering, Input, Fahrzeuge, Weltinhalt und UI bleiben getrennt.
- Neue Fahrzeuge sollen ueber Daten und ModelFactory-Erweiterungen integrierbar sein.
- Neue Biome sollen ueber Biome-/World-Content-Daten integrierbar sein.
- Traffic-Cars sollen ueber eigene Daten, Collider und Fairness-Regeln erweiterbar sein.
- Seitendeko wie traditionelle Haeuser soll ueber `BiomeContent` platzierbar bleiben, inklusive Rotation/Scale pro Placement.
- Garage, Run und spaetere Menues sollen eigene Szenen/Controller bekommen.
- `GameApp` darf nicht zu einem grossen Sammelobjekt fuer alle Logik werden.
- Three.js-Geometrien muessen sauber erzeugt und spaeter entsorgt werden.
- Audio bleibt copyrightfrei: keine externen Samples, keine bekannten Melodien, keine Stimmen ohne explizite Freigabe.

## Aktuelle Ordnerstruktur

```text
src/
  main.ts
  app/
    GameApp.ts
    GameConfig.ts
    GameEvents.ts
    GameLoop.ts
    ServiceRegistry.ts
  engine/
    audio/
      ProceduralAudioService.ts
    assets/
      MaterialFactory.ts
      ModelFactory.ts
    input/
      InputActions.ts
      InputManager.ts
    physics/
      Collider.ts
      CollisionSystem.ts
    rendering/
      AppScene.ts
      CameraController.ts
      GarageSceneFactory.ts
      LightingRig.ts
      RendererService.ts
      ResizeService.ts
      RunSceneFactory.ts
      disposeObject3D.ts
  game/
    collectibles/
      Collectible.ts
      CollectibleSystem.ts
    obstacles/
      Obstacle.ts
      ObstacleSystem.ts
    traffic/
      TrafficTypes.ts
      TrafficCar.ts
      TrafficSystem.ts
      TrafficFairness.ts
    powerups/
      PowerUpTypes.ts
    progression/
      SaveData.ts
      SaveDataStore.ts
      ScoreSystem.ts
    garage/
      GarageShowroomController.ts
      GarageTypes.ts
    runner/
      RunnerController.ts
    state/
      GameStateMachine.ts
      GameStateTypes.ts
    vehicles/
      VehicleCatalog.ts
    world/
      BiomeContent.ts
      LaneSystem.ts
      SegmentDefinitions.ts
```

## Modulverantwortung

### `src/app`

`GameApp.ts`

- orchestriert App-Lifecycle
- erstellt Services
- bindet Renderer, Resize, Input und State
- verarbeitet globalen UI-State
- verwaltet kompakte globale Settings-UI fuer Audio
- verwaltet `activeScene`, `runScene` und `garageScene`
- wechselt Szenen zentral ueber `activateScene`
- besitzt Helper fuer Run-/Garage-Lifecycle: `ensureRunScene`, `replaceRunScene`, `disposeGarageScene`
- darf nicht jedes Feature selbst implementieren

`GameLoop.ts`

- liefert `dt` und `elapsed`
- kennt keine Gameplay-Details

`GameConfig.ts`

- zentrale Konfiguration
- enthaelt Quality/Input/Basiswerte
- Audio-Basiswerte werden von gespeicherten Settings ueberschrieben

`GameEvents.ts`

- Event-Bus
- fuer lose Kopplung nutzen, nicht fuer chaotisches globales State-Management missbrauchen

### `src/engine/assets`

`MaterialFactory.ts`

- zentrale Materialpalette
- neue Farbmaterialien hier definieren
- keine lokalen Material-Duplikate in Gameplay-Systemen erzeugen, wenn sie wiederverwendbar sind

`ModelFactory.ts`

- erzeugt primitive Low-Poly-Fallback-Modelle
- aktuell:
  - `createVehicle(modelKey)`
  - `createSportsCar()`
  - `createDriftCoupe()`
  - `createTokyoPoliceCar()`
  - `createTrafficCar(kind)`
  - `createMachiyaHouse()`
  - `createMinkaHouse()`
  - `createNagayaRowHouse()`
  - `createKuraStorehouse()`
  - Welt-/Deko-/Traffic-/Legacy-Obstacle-Primitives
- darf keine Gameplay-Logik enthalten
- Front spielbarer Fahrzeuge zeigt nach `+Z`
- Pivot spielbarer Fahrzeuge liegt am Boden-/Fahrzeugzentrum

### `src/engine/audio`

`ProceduralAudioService.ts`

- erzeugt Musik und SFX prozedural ueber Web Audio
- nutzt keine externen Samples
- liefert einen loopbaren 96-BPM Hip-Hop/Rap-Instrumental-Beat ohne Stimme
- unterstuetzt Music-Modes:
  - `menu`
  - `garage`
  - `run`
- unterstuetzt SFX:
  - Coin
  - Boost
  - Collision/GameOver
  - weak fail/stumble
  - Menu click
  - Garage switch
  - Countdown
- beruecksichtigt `masterVolume`, `musicVolume`, `sfxVolume`, `muted`
- AudioContext wird ueber `unlock()` nach User-Geste entsperrt
- Sequencer nutzt Lookahead-Scheduling und muss bei Stop/Dispose Timer und Nodes sauber freigeben

Regel:

- Audio-Trigger laufen ueber `GameEvents` oder klare App-State-Wechsel, nicht direkt aus Input-/Render-Interna.
- Settings-Aenderungen sollen ueber `SaveDataStore.saveSaveData()` persistiert und per `settings:changed` Event an Audio gemeldet werden.

### `src/engine/input`

`InputManager.ts`

- mappt Tastatur/Touch auf abstrakte Actions
- kennt keine Scene-Details
- aktuelle Actions:
  - `moveLeft`
  - `moveRight`
  - `boost`
  - `pause`
  - `confirm`
  - `cancel`

Regel:

- Kein direktes Aufrufen von Runner-/Scene-Methoden im InputManager.
- Garage bekommt spaeter eigene Interpretation der gleichen Actions.
- Touch-Taps auf die 3D-Flaeche duerfen kein globales `confirm` ausloesen; Start/Bestaetigung laufen ueber UI-Buttons oder Keyboard-Confirm.

### `src/engine/physics`

`CollisionSystem.ts`

- generischer AABB-Pair-Check
- registriert Collidables
- weiss nicht, was Runner, Coin, Traffic oder Obstacle spielerisch bedeuten

`Collider.ts`

- definiert Collider-Vertrag

Regel:

- Neue Gameplay-Systeme liefern Colliders, aber interpretieren Treffer selbst.

### `src/engine/rendering`

`AppScene.ts`

- gemeinsames Interface fuer renderbare Top-Level-Szenen
- enthaelt nur `scene`, `cameraController`, `update` und `dispose`
- Run- und Garage-spezifische Methoden bleiben in den jeweiligen Bundle-Typen

`RunSceneFactory.ts`

- baut aktuell die spielbare Run-Scene
- verbindet Runner, World, Collectibles, Traffic, Chaser und Camera
- akzeptiert eine `VehicleDefinition`
- berechnet den Run-Speed ueber `getRunSpeed()`
- Speed-Ramp-Regel: frueh linear lesbar schneller werden, spaeter asymptotisch langsamer Richtung Max-Speed steigen
- friert statische Child-Meshes von Deko und Ground-Segmenten ein, damit dichte Hausreihen weniger CPU-Transformkosten erzeugen

`RendererService.ts`

- Default/Medium ist auf Laptop-/Akku-taugliche Werte ausgelegt
- High-Performance-GPU-Profil nur bei `quality === "high"`
- Shadow-Map nur bei `quality === "high"`
- Pixelratio-Caps:
  - low: `1`
  - medium: `1.25`
  - high: `1.5`

`GarageSceneFactory.ts`

- baut die 3D-Garage als eigene Szene
- verwendet eigene Garage-Kamera statt Run-Kamera
- erzeugt Garage-Shell, Licht, Deko und Showroom-Controller
- folgt dem `AppScene`-Interface

`disposeObject3D.ts`

- kleine Dispose-Hilfe fuer temporaere Object3D-Hierarchien
- Geometrien werden entsorgt
- geteilte Materialien werden standardmaessig nicht entsorgt

Ziel:

- `RunSceneFactory` und `GarageSceneFactory` folgen einem gemeinsamen Scene-Interface.
- Neue Top-Level-Szenen bekommen eigene Factories statt in bestehende Factories gemischt zu werden.

`CameraController.ts`

- Run-Kamera
- nicht fuer Garage wiederverwenden, wenn Garage andere Kamera braucht

`LightingRig.ts`

- gemeinsame Licht-Helfer

## GameState-Architektur

Aktuelle States:

```text
boot
loading
menu
garage
countdown
running
paused
reviving
gameOver
```

Aktuelle relevante Transition:

```text
menu -> garage
garage -> menu
garage -> countdown
gameOver -> menu
gameOver -> countdown
paused -> menu
```

Regeln:

- `garage` ist ein Top-Level-State, weil eine eigene 3D-Szene laeuft.
- DOM-Unteransichten wie Optionen koennen spaeter Menu-Substates sein.
- `running` bleibt rein fuer Gameplay.
- `paused` rendert weiter die Run-Scene.
- Direkte `menu -> running` oder `gameOver -> running` Transitions sind nicht erlaubt; Start laeuft ueber `countdown`.

## Scene-Architektur

Aktueller Stand:

- `GameApp` besitzt eine generische `activeScene?: AppScene`.
- `runScene?: RunScene` und `garageScene?: GarageSceneBundle` bleiben getrennt.
- Run-Methoden werden nur auf `runScene` aufgerufen.
- Garage-Methoden werden nur auf `garageScene` aufgerufen.
- Beim Szenenwechsel wird der Input-Buffer geleert.

Basisinterface:

```ts
export type AppScene = {
  scene: THREE.Scene;
  cameraController: {
    camera: THREE.Camera;
    resize(width: number, height: number): void;
  };
  update(dt: number, elapsed: number, state: GameState): void;
  dispose(): void;
};
```

Run-spezifisch:

```ts
export type RunScene = AppScene & {
  resetRun(): void;
  moveLane(direction: -1 | 1): void;
  activateBoost(): void;
  getRunStats(): RunStats;
  consumeGameOver(): GameOverInfo | undefined;
};
```

Garage-spezifisch:

```ts
export type GarageScene = AppScene & {
  moveSelection(direction: -1 | 1): void;
  confirmSelection(): GarageSelectionResult;
  cancelPreview(): void;
  isSwitching(): boolean;
  getPreviewVehicle(): VehicleDefinition;
  getPreview(): GarageVehiclePreview;
  refreshOwnership(unlockedVehicleIds: string[], totalCoins: number): void;
  getConfirmedVehicle(): VehicleDefinition;
};
```

Regel:

- `GameApp` rendert die aktive `AppScene`.
- State-spezifische Input-Handler delegieren nur an die passende Scene.
- Nicht jede Methode in ein riesiges Universal-Scene-Interface kippen.

## Fahrzeug-Architektur

Datei:

- `src/game/vehicles/VehicleCatalog.ts`

Aktuelle Typen:

```ts
export type VehicleModelKey =
  | "sports-car"
  | "drift-coupe"
  | "sakura-roadster"
  | "kitsune-rally"
  | "shogun-gtr"
  | "oni-interceptor"
  | "ryujin-hypercar";

export type VehicleDefinition = {
  id: string;
  displayName: string;
  modelKey: VehicleModelKey;
  unlockState: "owned" | "locked";
  economy: {
    price: number;
    tier: "starter" | "street" | "sport" | "elite" | "legend";
  };
  run: {
    scale: number;
    forwardRotationY: number;
    bounds: { x: number; y: number; z: number };
  };
  showroom: {
    scale: number;
    cameraFocusOffset: Vec3Like;
  };
};
```

Aktuelle Fahrzeuge:

- `sports-car`
  - Name: `Akai Striker`
  - Modell: roter Supercar-Keil
  - Default

- `drift-coupe`
  - Name: `Aoi Drift Coupe`
  - Modell: blaues Drift-Coupe
  - zweites Testfahrzeug fuer Garage

- Shop-Fahrzeuge:
  - `sakura-roadster`
  - `kitsune-rally`
  - `shogun-gtr`
  - `oni-interceptor`
  - `ryujin-hypercar`
  - locked per Default, ueber Coins freischaltbar

Regeln fuer neue Fahrzeuge:

- Kein echtes Markenmodell kopieren.
- Kein Logo.
- Front zeigt nach `+Z`.
- Pivot am Boden-/Fahrzeugzentrum.
- Run-Collider muss fair bleiben.
- `ModelFactory.createVehicle(modelKey)` muss fuer jeden neuen `VehicleModelKey` verdrahtet werden.
- `VehicleCatalog` muss eine Definition bekommen.
- Showroom-Scale und Run-Scale getrennt pflegen.

## Runner-Architektur

Datei:

- `src/game/runner/RunnerController.ts`

Aufgaben:

- Lane-Wechsel
- schwache Fehler am Rand
- Boost-Zeit
- Speed-Multiplier
- Recoil bei starkem Treffer
- Collidable fuer Player

Regeln:

- Keine Sprung-/Duck-/Schleichmechanik wieder einfuehren.
- Kollisionswerte kommen aus `VehicleDefinition.run.bounds`.
- Boost bleibt die primaere aktive Faehigkeit.

## Welt- und Biome-Architektur

Datei:

- `src/game/world/BiomeContent.ts`

Aktueller Inhalt:

- Track-Segmentdaten
- Content-Loop-Laenge
- Deko-Platzierungen
- Coin-Pattern
- Hindernis-Platzierungen

Aktueller Stand:

- Statische Content-Listen sind fuer den MVP aktuell ausreichend dicht.
- Der User hat bestaetigt, dass keine sichtbaren Leerstellen mehr auftreten.
- Fuer spaetere Biome und dynamische Schwierigkeit bleibt ein Scheduler sinnvoll.

Ziel:

- `BiomeContent` beschreibt Muster und Regeln.
- Ein zukuenftiger `WorldContentScheduler` sorgt fuer kontinuierlich gefuellte Sichtweite.

Empfohlener Scheduler:

```ts
type WorldContentScheduler = {
  reset(): void;
  update(distance: number, fillAheadDistance: number): void;
};
```

Der Scheduler soll:

- bis `distance + fillAheadDistance` Content sicherstellen
- Objekte aus Pools wiederverwenden
- Pattern aus `BiomeContent` lesen
- Deko, Coins und Traffic getrennt verwalten
- keine Fairness-Probleme erzeugen

Regeln fuer neue Biome:

- eigenes `BiomeContentDefinition`
- eigene Deko- und Traffic-Kinds nur erweitern, wenn ModelFactory sie bauen kann
- Decoration-Placements duerfen `rotationY` und `scale` nutzen, damit Seitendeko sauber zur Strasse ausgerichtet werden kann
- keine Biome-spezifischen Direkt-Hardcodings in `GameApp`
- spaeter Biome-Wechsel ueber Segment-/Scheduler-System, nicht ueber manuelle Ifs

## Traffic-Architektur

Aktiv im Run:

- `src/game/traffic/TrafficTypes.ts`
- `src/game/traffic/TrafficCar.ts`
- `src/game/traffic/TrafficSystem.ts`
- `src/game/traffic/TrafficFairness.ts`

Verantwortung:

- `TrafficTypes.ts` definiert Traffic-Car-Kinds, Collider-Formen, Speeds und Row-Daten.
- `TrafficCar.ts` ist ein bewegliches `Collidable` mit shape-basiertem AABB-Collider.
- `TrafficSystem.ts` bewegt Traffic-Cars, recycelt sie, behandelt Kollisionen und deaktiviert sie bei Boost.
- `TrafficFairness.ts` validiert `trafficRows`, bevor die Run-Scene spielbar wird.

Aktuelle MVP-Regeln:

- Traffic-Cars fahren mit `trackZ += speed * dt` in derselben Richtung wie der Spieler.
- Spieler-Speed ist aktuell `9.5`, Traffic-Speed aktuell `5.0`.
- Alle Traffic-Cars muessen im MVP denselben Speed haben, damit validierte Row-Abstaende nicht ueber lange Runs durch Drift zerfallen.
- Unterschiedliche Traffic-Speeds erst erlauben, wenn ein Scheduler oder ein Traffic-Pattern-System dynamische Drift sicher pruefen kann.
- Nie alle drei Lanes in einer Row oder einem kurzen Hazard-Band blockieren.
- Jede Row besitzt eine `safeLane`.
- Coins duerfen nicht direkt in eine nahe blockierte Traffic-Lane fuehren.
- Kollision ohne Boost ist ein starker Fail und fuehrt zu Game Over.
- Kollision mit Boost deaktiviert das Traffic-Car im MVP; spaeter soll hier ein Destroy-VFX entstehen.

## Legacy-Obstacle-Architektur

Dateien:

- `src/game/obstacles/Obstacle.ts`
- `src/game/obstacles/ObstacleSystem.ts`

Status:

- Nicht mehr im aktiven Run verdrahtet.
- Als Legacy-Code vorhanden, bis Traffic final visuell/playtest-seitig bestaetigt ist oder statische Spezialgefahren wieder gebraucht werden.

ObstacleAction:

- `low`
- `tall`
- `barrier`

Wichtig:

- Diese Actions sind Collider-/Form-Kategorien, keine Jump/Slide-Anforderungen.
- Ohne Boost ist jeder Hindernistreffer ein starker Fehler.
- Mit Boost wird das Hindernis deaktiviert.

Naechste Erweiterung:

- Destroy-VFX statt sofortigem Ausblenden.
- Siehe `GAMEPLAY_NOTES.md`.

## Collectible-Architektur

Dateien:

- `src/game/collectibles/Collectible.ts`
- `src/game/collectibles/CollectibleSystem.ts`

Aufgaben:

- Coin-Visual rotieren
- Coin-Kollision
- Coin-Recycling

Ziel:

- Spaeter Coin-Patterns ueber WorldContentScheduler erzeugen.

## SaveData-Architektur

Datei:

- `src/game/progression/SaveData.ts`
- `src/game/progression/SaveDataStore.ts`

Aktuelle Felder:

- `highScore`
- `bestDistance`
- `totalCoins`
- `selectedVehicleId`
- `unlockedVehicleIds`
- Settings

Aktuell umgesetzt:

- `SaveDataStore` laedt aus `localStorage`.
- `SaveDataStore` speichert die ausgewaehlte Vehicle ID.
- `SaveDataStore.addRunCoins()` addiert Run-Coins genau einmal durch App-Orchestrierung.
- `SaveDataStore.unlockVehicle()` zieht Coins ab und persistiert neue Unlocks.
- gespeicherte Vehicle IDs werden gegen `VehicleCatalog` validiert.
- `selectedVehicleId` wird bei Normalisierung nie auf ein locked Auto gesetzt.
- bei ungueltigen Daten faellt das Spiel auf Defaults zurueck.

Noch offen:

- Migration bei Versionswechsel
- Persistenz weiterer Progression-Werte wie Highscore

Regel:

- Nie blind gespeicherte IDs verwenden. Immer gegen Catalog validieren und auf Default zurueckfallen.

## Garage-Architektur

Die Garage-MVP-Basis ist implementiert.

Module:

```text
src/game/garage/
  GarageShowroomController.ts
  GarageTypes.ts

src/engine/rendering/
  GarageSceneFactory.ts
```

Garage-Aufgaben:

- 3D-Garage erstellen
- aktuelles Fahrzeug anzeigen
- Fahrzeugwechsel animieren
- alle Katalogfahrzeuge previewbar anzeigen, auch locked
- Auswahl bestaetigen
- locked Fahrzeuge nicht als Startauswahl bestaetigen
- ausgewaehlte Vehicle ID an App/SaveData melden
- Run-Scene beim Start aus Garage mit bestaetigtem Fahrzeug neu erzeugen

Showroom-State-Machine:

```text
idle
switchingOut
switchingIn
```

Regeln:

- Keine Run-Stats im Garage-State.
- Keine Hindernisse/Coins in Garage.
- Garage nutzt `VehicleCatalog` und `ModelFactory.createVehicle`.
- Fahrzeug-Instanzen beim Wechsel sauber aus Scene entfernen und Geometrien entsorgen oder kontrolliert cachen.
- `previewIndex` und `confirmedIndex` bleiben getrennt.
- Confirm ist waehrend `switchingOut`/`switchingIn` gesperrt.
- Back/Escape verwirft die Preview und nutzt die zuletzt bestaetigte Auswahl.
- Garage-Kamera muss auf Portrait-Viewports zurueckziehen, damit das Auto nicht zu stark croppt.
- Garage-Kamera nutzt `VehicleDefinition.showroom.cameraFocusOffset`, damit spaetere Fahrzeuge ohne Kamera-Hardcoding sauber geframed werden.

## UI-Architektur

Aktuell:

- UI wird direkt in `GameApp.setupUi()` per HTML-String erzeugt.

Problem:

- Fuer Garage, Optionen, Highscore wird `GameApp` sonst zu gross.

Ziel:

- UI in kleinere Controller oder Renderer aufteilen, z. B.:
  - `MainMenuView`
  - `RunHudView`
  - `GarageHudView`

Kurzfristig ist kleine Erweiterung in `GameApp` akzeptabel, aber keine grossen UI-Flows dort stapeln.

## Rendering- und Asset-Regeln

- Three.js bleibt Rendering-Basis.
- Low-Poly-Primitives sind bevorzugt.
- Keine externen Assets ohne bewusste Entscheidung.
- Keine Logos.
- Keine echten Auto-Marken kopieren.
- Materialien zentral in `MaterialFactory`.
- Geometrien bei Dispose entsorgen.
- Nach visuellen Aenderungen Browser testen, wenn moeglich.

## Test- und Verifikationsregeln

Immer mindestens:

```bash
npm run build
```

Bei Gameplay-/Rendering-Aenderungen:

- Dev-Server starten
- Browser oeffnen
- Startbild pruefen
- 30-60 Sekunden laufen lassen
- Restart pruefen
- Console auf Errors pruefen

Bei Content-Gap-Fixes:

- langer Lauf
- auf leere Strassenabschnitte achten
- pruefen, ob Deko/Coins/Traffic nicht clustern oder komplett fehlen

Bei Vehicle-Aenderungen:

- beide Fahrzeuge im Run erzeugen koennen
- Collider nicht unfair
- Scale und Rotation korrekt
- Front zeigt nach vorne

Bei Garage-/Scene-Aenderungen:

- Fachreview fuer UX/Architektur einholen
- Edgecase-Review fuer State, Input, Scene-Lifecycle, Resize, Dispose und SaveData einholen
- `previewVehicleId` und `confirmedVehicleId` getrennt halten
- Confirm waehrend Showroom-Wechselanimation blockieren
- Input-Buffer bei Top-Level-State-Wechseln leeren

## Do Not

- Kein `git reset --hard`.
- Keine User-Aenderungen revertieren.
- Keine Jump/Slide/Sneak-Mechanik wieder einfuehren.
- Keine echte Lamborghini-/Police-/Marken-Kopie bauen.
- Keine Garage in `RunSceneFactory` hineinmischen.
- Keine Biome-Logik in `GameApp` hartcodieren.
- Keine lokalen Material-Duplikate fuer globale Farben.
- Keine grossen Refactors ohne Build.

## Empfohlener naechster Architektur-Schritt

Der naechste sinnvolle Code-Schritt ist:

1. Optional Biome-Content als Option in `RunSceneFactory` injizieren, sobald mehr als ein Biome existiert.
2. Optional UI aus `GameApp.setupUi()` herausloesen, sobald Garage/Options/Highscore groesser werden.
3. Police-Car visuell staerker inszenieren, z. B. Sirenenlicht oder Warn-VFX im 10-Sekunden-Fenster.
4. `WorldContentScheduler` erst spaeter bauen, wenn neue Biome, echte Segmentwechsel oder dynamische Content-Patterns ihn brauchen.

Diese Reihenfolge passt zum aktuellen Stand, weil der User den Content-Gap visuell als geloest bestaetigt hat und die Garage-Basis nun steht.
