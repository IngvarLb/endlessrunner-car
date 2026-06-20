# Garage MVP Prompt: 3D Car Showroom For Feudal Japan Runner

## Ziel

Erweitere das bestehende Three.js/Vite/TypeScript-Spiel um einen ersten spielbaren 3D-Garage-Abschnitt. Die Garage ist kein Marketing-Screen und kein reines HTML-Menue, sondern ein kleiner, echter 3D-Showroom im bisherigen stylized Low-Poly-Look.

Der Garage-MVP soll nur das liefern, was fuer den ersten stabilen Fahrzeugwechsel noetig ist:

- Garage-State oeffnen
- aktuelles Auto in einer 3D-Garage anzeigen
- zwischen zwei vorhandenen Autos wechseln
- Auto auswaehlen
- zurueck ins Hauptmenue
- Run mit ausgewaehltem Auto starten

Nicht im MVP enthalten:

- Shop
- Upgrades
- Echtgeld-/Premium-Logik
- komplexe Fahrzeugwerte
- Lackiereditor
- grosse Sammlung gesperrter Autos
- umfangreiche Karriere- oder Tuning-Systeme

Das MVP muss architektonisch sauber vorbereitet sein, damit diese Features spaeter ergaenzt werden koennen.

## Inspirationsrahmen

Orientiere dich konzeptionell an erfolgreichen Rennspielen und Arcade-Racern, ohne sie zu kopieren:

- Auto steht als Hauptobjekt gross und zentral im Bild.
- Kamera, Licht und Plattform lassen das Auto wertig wirken.
- UI verdeckt die Silhouette nicht.
- Fahrzeugwechsel fuehlt sich smooth und unmittelbar an.
- Auswahlzustand ist immer eindeutig.
- Der Spieler versteht sofort: links/rechts wechseln, bestaetigen, starten.

Die Umsetzung bleibt eigenstaendig:

- kein Nachbau eines konkreten Menues
- keine Logos
- keine echten Automarken
- keine fotorealistische Garage
- keine ueberladene Featureliste
- bestehende Low-Poly-Feudal-Japan-Aesthetik bleibt erhalten

## Aktueller Projektstand

Vorarbeit existiert bereits:

- `src/game/vehicles/VehicleCatalog.ts`
- `sports-car` als `Akai Striker`
- `drift-coupe` als `Aoi Drift Coupe`
- `ModelFactory.createVehicle(modelKey)`
- `SceneFactory.create(..., vehicle)`
- `SaveData.selectedVehicleId`
- `SaveData.unlockedVehicleIds`

Aktuell ist `selectedVehicle` noch statisch in `GameApp`. Die Garage soll diese Stelle spaeter ersetzen.

## Architekturziel

Die Garage darf nicht in `SceneFactory.ts` hineingemischt werden. `SceneFactory.ts` ist aktuell die Run-Scene. Fuer die Garage braucht es eine getrennte Scene-Struktur.

Fuehre oder bereite ein gemeinsames Scene-Konzept vor:

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

Run-spezifische Methoden bleiben getrennt:

```ts
export type RunScene = AppScene & {
  resetRun(): void;
  moveLane(direction: -1 | 1): void;
  activateBoost(): void;
  getRunStats(): RunStats;
  consumeGameOver(): GameOverInfo | undefined;
};
```

Garage-spezifische Methoden bleiben ebenfalls getrennt:

```ts
export type GarageScene = AppScene & {
  moveSelection(direction: -1 | 1): void;
  confirmSelection(): string;
  getSelectedVehicleId(): string;
};
```

Wichtig:

- `GameApp` rendert `activeScene: AppScene`.
- `GameApp` haelt Run- und Garage-spezifische Referenzen getrennt.
- Run-Methoden wie `resetRun`, `getRunStats`, `consumeGameOver`, `moveLane` werden nur auf einer aktiven RunScene aufgerufen.
- Garage-Methoden wie `moveSelection`, `confirmSelection`, `getSelectedVehicleId` werden nur auf einer aktiven GarageScene aufgerufen.
- Run-Input und Garage-Input werden getrennt behandelt.
- Garage-UI darf nicht mit Run-HUD/Run-Stats vermischt werden.
- Fahrzeuge kommen ausschliesslich aus `VehicleCatalog`.
- 3D-Modelle werden ueber `ModelFactory.createVehicle(modelKey)` erzeugt.
- Bei jedem Top-Level-State-Wechsel wird der Input-Buffer geleert oder alle unpassenden Actions werden aktiv verworfen.

### Aktiver Scene-Wechsel

Der MVP braucht eine zentrale Lifecycle-Methode in `GameApp`, z. B.:

```ts
setActiveScene(next: AppScene): void
```

Diese Methode ist verantwortlich fuer:

- alte temporaere Scene disposen oder bewusst behalten
- `activeScene` setzen
- aktuelle Renderer-Groesse auf neue Scene anwenden
- Input-Buffer leeren
- sicherstellen, dass nur die aktive Scene geupdated und gerendert wird

Fuer den Garage-MVP ist es okay, die Run-Scene beim Start aus der Garage neu zu bauen. Das ist klarer als eine halb rekonfigurierte bestehende Run-Scene.

## Neuer GameState

Fuege einen neuen State hinzu:

```text
garage
```

Transition-Ziel:

```text
menu -> garage
garage -> menu
garage -> countdown
garage -> running optional spaeter, falls Countdown uebersprungen wird
gameOver -> menu
gameOver -> countdown
```

MVP-Regel:

- Start aus Garage darf ruhig denselben Countdown nutzen wie Start aus Menu.
- Garage ist nicht Pause.
- Escape/Back in Garage geht zurueck ins Menu.
- Kein `running -> garage`.
- Kein `paused -> garage`.
- Beim Start aus Garage: Vehicle ID validieren, RunScene mit dieser VehicleDefinition neu erzeugen oder aktualisieren, aktive Scene auf RunScene setzen, dann `countdown`.

## Garage Scene

Erstelle eine eigene Garage-Scene, z. B.:

```text
src/engine/rendering/GarageSceneFactory.ts
src/game/garage/GarageShowroomController.ts
src/game/garage/GarageTypes.ts
```

### 3D-Layout

Die Garage soll klein, fokussiert und lesbar sein:

- Bodenplatte mit dunklem Werkstattmaterial
- zentrale Drehscheibe oder Plattform
- Rueckwand
- seitliche Low-Poly-Werkstattdetails
- Reifenstapel
- Werkzeugregal als simple Boxen
- dezente Bambus-/Torii-Elemente im Hintergrund
- tuerkise Lichtleisten als Akzent
- warme Laternen- oder Spotlights

Die Garage darf wie ein stylized Racing-Game-Showroom wirken, aber im bestehenden Feudal-Japan-Look:

- Torii-Rot als Akzent
- Bambus-Gruen fuer dezente Deko
- Tuerkis fuer UI-/Showroom-Highlights
- dunkles Indigo/Dark-Metal fuer Boden und Werkstattteile
- Gold nur sparsam fuer kleine Highlights

### Auto-Praesentation

Das Auto ist das wichtigste Objekt im ersten Blick:

- zentral auf Plattform
- voll sichtbar
- keine UI ueber dem Auto
- sanfte Rotation oder sehr dezenter Platform-Turn
- kleine Federung/Idle-Bewegung moeglich
- Kamera leicht frontal, nicht direkt von oben
- Fahrzeugfront zeigt nach `+Z`, Kamera schaut aus positiver Z-Richtung auf das Auto

Empfohlene Kamera:

```text
position: x 0, y 1.25-1.55, z 4.2-4.8
target:   x 0, y 0.55,     z 0
fov:      45-55
```

### Fahrzeuge im MVP

Nur zwei Fahrzeuge:

1. `sports-car`
   - Display: `Akai Striker`
   - roter flacher Supercar-Keil
   - Standardauswahl

2. `drift-coupe`
   - Display: `Aoi Drift Coupe`
   - blaues kompaktes Drift-Coupe
   - Overfender
   - Ducktail
   - bereits im `VehicleCatalog` vorbereitet

Keine weiteren Fahrzeuge im MVP.

### VehicleCatalog als Source of Truth

Die Garage darf Fahrzeugnamen, Scales oder Model-Keys nicht duplizieren.

Sie nutzt:

- `VEHICLE_CATALOG`
- `vehicle.displayName`
- `vehicle.modelKey`
- `vehicle.showroom.scale`
- `vehicle.showroom.cameraFocusOffset`
- `vehicle.unlockState`

Fuer den MVP werden nur Fahrzeuge angezeigt, die `owned` oder fuer den Test explizit freigeschaltet sind. Gesperrte Fahrzeuge werden erst spaeter umgesetzt.

Beim Laden oder Starten muss jede Vehicle ID validiert werden:

- ID existiert im Catalog
- ID ist unlocked/owned
- sonst Fallback auf `DEFAULT_VEHICLE_ID`

## Wechselanimation

Der Fahrzeugwechsel ist wichtig fuer das Spielgefuehl. Er muss aber MVP-tauglich bleiben.

Minimal-Animation:

1. aktuelles Auto rotiert leicht und gleitet seitlich heraus
2. neues Auto wird seitlich vorbereitet
3. neues Auto gleitet auf die Plattform
4. Auswahl wird aktualisiert

Controller-Zustaende:

```text
idle
switchingOut
switchingIn
```

Regeln:

- Waehrend `switchingOut` und `switchingIn` keine neuen Wechsel starten.
- Optional darf genau ein Wechsel gepuffert werden, aber keine Queue-Liste.
- `moveSelection()` darf nur in `idle` einen Wechsel starten.
- `confirmSelection()` darf nur in `idle` erfolgreich sein.
- Auto-Instanzen muessen sauber aus der Scene entfernt oder kontrolliert wiederverwendet werden.
- Materialien bleiben in `MaterialFactory`; Geometrien alter Preview-Instanzen muessen bei Dispose weg.
- Back/Escape waehrend eines Wechsels bricht die Animation ab, entfernt transiente Preview-Objekte und kehrt mit der zuletzt bestaetigten Auswahl ins Menu zurueck.

### Preview vs. bestaetigte Auswahl

Die Garage muss zwei IDs getrennt halten:

- `previewVehicleId`: das gerade angezeigte Fahrzeug
- `confirmedVehicleId`: das wirklich ausgewaehlte Fahrzeug fuer den Run

Links/Rechts aendert nur `previewVehicleId`.

Der MVP nutzt eine klare Primaeraktion:

- `Starten`: bestaetigt das aktuelle `previewVehicleId`, setzt es als `confirmedVehicleId`, aktualisiert `selectedVehicle`, baut/aktiviert die RunScene und startet den Countdown.
- `Zurueck`: verwirft unbestaetigte Preview-Aenderungen und geht ins Menu zurueck.

Ein separater `Auswaehlen`-Button, der nur speichert aber nicht startet, ist nicht Teil des MVP. Er kann spaeter ergaenzt werden.

## UI MVP

Die UI soll knapp, funktional und spielnah sein.

Elemente:

- Fahrzeugname
- Button/Icon links
- Button/Icon rechts
- `Starten`
- `Zurueck`

Desktop-Steuerung:

- `ArrowLeft` / `A`: vorheriges Fahrzeug
- `ArrowRight` / `D`: naechstes Fahrzeug
- `Enter`: aktuell angezeigtes Fahrzeug bestaetigen und Run-Countdown starten
- `Escape`: zurueck ins Menu

Touch:

- Swipe links/rechts: Fahrzeug wechseln
- Tap auf Buttons
- UI-Buttons muessen verhindern, dass derselbe Touch zusaetzlich als globaler `confirm` verarbeitet wird.
- Globaler Tap/Confirm wird in Garage nur akzeptiert, wenn kein UI-Control getroffen wurde und der Showroom-Controller `idle` ist.

Nicht im MVP:

- lange Fahrzeugbeschreibung
- Performance-Balken
- Upgrade-Buttons
- Lock-Grid
- Shop-Preis

## Datenfluss

MVP-Datenfluss:

```text
VehicleCatalog
  -> GarageScene zeigt Fahrzeug
  -> User previewt Vehicle ID
  -> Starten bestaetigt Vehicle ID
  -> GameApp setzt selectedVehicle
  -> RunScene wird mit selectedVehicle neu erzeugt oder aktualisiert
  -> activeScene wird RunScene
  -> countdown startet
```

Persistenz:

- `selectedVehicleId` in `SaveData`
- `unlockedVehicleIds` in `SaveData`
- Falls kein Save-Service existiert, im MVP erstmal in-memory halten und SaveData-Typen nur vorbereitet lassen.

Validation:

- jede gespeicherte Vehicle ID gegen `VehicleCatalog` pruefen
- fallback auf `DEFAULT_VEHICLE_ID`
- `unlockedVehicleIds` ebenfalls gegen Catalog filtern

## HUD- und UI-Abgrenzung

Im Garage-State darf das Run-HUD nicht aktiv wirken.

Regeln:

- `.run-stats` nur in `countdown`, `running`, `paused`, `gameOver` sichtbar oder relevant
- Garage bekommt eigene Controls und Labels
- `updateStats()` darf keine GarageScene wie eine RunScene behandeln
- UI darf das Auto nicht verdecken
- Mobile Touch-Ziele mindestens 44-48 px hoch/breit
- Safe-Area Insets auf Mobile beachten

## Edgecase-Anforderungen

Ein Edgecase-Experte muss bei jeder Garage-/Scene-/Vehicle-Aenderung pruefen:

- Was passiert bei schneller Links/Rechts-Eingabe?
- Was passiert, wenn man waehrend einer Wechselanimation bestaetigt?
- Was passiert bei Escape waehrend `switchingOut`?
- Bleiben `previewVehicleId` und `confirmedVehicleId` korrekt getrennt?
- Wird das richtige Auto im Run verwendet?
- Wird die alte Run-Scene disposed, falls eine neue Scene gebaut wird?
- Bleiben Geometrien alter Preview-Autos im Scene Graph?
- Werden nur Geometrien disposed, waehrend shared Materials aus `MaterialFactory` erhalten bleiben?
- Funktioniert Resize in Garage und Run?
- Wird der Input-Buffer bei Top-Level-State-Wechseln geleert?
- Gibt es einen Fallback, wenn `selectedVehicleId` ungueltig ist?
- Wird `gameOver`, `pause`, `running` nicht versehentlich mit Garage-Input vermischt?
- Sind UI-Buttons auf Mobile gross genug?
- Verdeckt die UI nicht das Auto?
- Fuehrt ein Touch auf einen Button nicht doppelt zu Button-Click und globalem Confirm?

## Umsetzungsschritte

### Schritt 1: Scene-Interface vorbereiten

- `AppScene` definieren
- Run-Scene-Typ davon ableiten
- `GameApp` auf aktive Scene vorbereiten
- `setActiveScene(next)` mit Dispose/Resize/Input-Clear vorbereiten

### Schritt 2: State erweitern

- `garage` in `GameStateTypes`
- Transitionen in `GameStateMachine`
- UI-State in `GameApp`

### Schritt 3: GarageSceneFactory

- eigene Scene
- eigene Kamera
- Licht
- Garage-Primitives
- Plattform
- erstes Fahrzeug anzeigen

### Schritt 4: GarageShowroomController

- Vehicle-Liste aus `VehicleCatalog`
- aktueller Index
- Wechselzustand
- Animationen
- confirmSelection

### Schritt 5: UI anbinden

- Garage-Button im Menu
- Zurueck
- Links/Rechts
- Starten als einzige Primaeraktion
- Run-HUD im Garage-State ausblenden oder trennen

### Schritt 6: Run mit Auswahl starten

- `previewVehicleId` validieren und als `confirmedVehicleId` setzen
- `selectedVehicle` in `GameApp` setzen
- Run-Scene mit Definition neu bauen oder aktualisieren
- activeScene auf RunScene setzen
- Countdown starten

### Schritt 7: Verifikation

- `npm run build`
- Garage oeffnen
- zwischen beiden Autos wechseln
- Starten bestaetigt das angezeigte Auto
- Run starten
- pruefen, ob richtiges Auto im Run steht
- Resize testen
- Escape/Back testen
- schnelle Eingaben testen

## Akzeptanzkriterien

Der Garage-MVP ist fertig, wenn:

- `npm run build` ohne Fehler laeuft
- `garage` State existiert
- Menu hat einen Garage-Zugang
- Garage zeigt eine echte 3D-Szene
- beide Autos koennen angezeigt werden
- Links/Rechts wechselt zwischen den Autos
- Wechselanimation ist smooth genug und blockiert Spam-Eingaben
- ausgewaehltes Auto wird im Run verwendet
- Zurueck ins Menu funktioniert
- Start aus Garage funktioniert
- keine Runtime-Errors in der Browser-Konsole
- keine sichtbaren Geometrie-Leaks bei mehreren Wechseln

## Nicht jetzt bauen

- Shop
- echtes Unlocking
- Tuning
- Paint Editor
- Fahrzeugwerte mit Gameplay-Auswirkung
- Garage-Kamera frei drehen
- grosse Car Collection
- komplexe Save-Migration

Diese Features werden erst geplant, wenn der MVP stabil ist.
