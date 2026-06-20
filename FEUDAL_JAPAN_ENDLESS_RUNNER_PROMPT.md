# Build-Prompt: Stylized Low-Poly Feudal Japan Car Runner

## Kurzfassung fuer den Build-Agenten

Baue ein browserbasiertes 3D-Endless-Runner-Spiel mit Three.js, TypeScript und Vite. Das Spiel orientiert sich am klaren Spielgefuehl klassischer 3D-Endless-Runner, hat aber eigene Figuren, eigene Assets, eigene UI und eine eigene visuelle Identitaet.

Das Setting bleibt eine stilisierte Low-Poly-Version des feudalen Japans: Torii-Tore, Bambus, Steinlaternen, Tempelwege, Koban-Muenzen, klare Silhouetten und kraeftige Farben. Der spielbare Charakter ist jetzt kein Mensch mehr, sondern ein generischer, keilfoermiger Supercar im Stil eines flachen exotischen Sportwagens. Keine Logos, keine echten Markenabzeichen, keine exakte Kopie eines realen Lamborghini-Modells.

Der Verfolger ist ein generisches, tokio-inspiriertes Polizeiauto: weiss-schwarzer Patrol-Car-Look, kantige Sedan-Silhouette, rot/blaue Lightbar und aggressive Front. Keine echten Behoerdenlogos, keine realen Markenzeichen, keine exakte Kopie eines realen Polizeifahrzeugs.

Der MCP steht in diesem Dokument fuer "Minimum Core Playable": der kleinste spielbare Kernumfang. Dieser Kern muss zuerst stabil funktionieren, bevor groessere Meta-Systeme, neue Biome, Shop, Upgrades oder aufwendige VFX ergaenzt werden.

## Aktueller MCP-Fokus

Die aktuelle Version soll folgende Kernmechaniken enthalten:

- automatische Vorwaertsbewegung auf einer endlosen Strecke
- 3-Spur-System mit linkem, mittlerem und rechtem Fahrstreifen
- Spurwechsel links/rechts per Tastatur und Touch-Swipe
- keine Sprung-, Duck- oder Schleichfunktion
- `Space`, `ArrowUp` und `W` aktivieren eine kurze Boost-Faehigkeit
- Boost gibt kurzzeitig Unverwundbarkeit und hoehere Geschwindigkeit
- Hindernisse verursachen ohne Boost einen starken Fehler und sofort Game Over
- Hindernisse werden waehrend Boost zerstoert bzw. in der ersten Version ausgeblendet
- schwache Fehler, z. B. gegen den Spurrand steuern, erzeugen Pressure und Camera Shake
- zwei schwache Fehler zaehlen wie ein starker Fehler und beenden den Run
- Coins/Koban koennen gesammelt werden
- Score basiert auf Distanz, Coins und Combo
- Verfolgerdruck wird als Pressure angezeigt
- Polizeiverfolger ist nach einem sauberen Start nicht dauerhaft sichtbar
- Polizeiverfolger kommt bei Pressure oder Fehlern wieder naeher ins Bild
- Start, Pause, Game Over und Restart funktionieren stabil
- Start- und Restart-Zustand duerfen nie ins Void zeigen
- die Welt muss vor und hinter der Kamera genug Track-Backfill besitzen

## Steuerung

Desktop:

- `ArrowLeft` / `A`: Spurwechsel nach links aus Spielerperspektive
- `ArrowRight` / `D`: Spurwechsel nach rechts aus Spielerperspektive
- `ArrowUp` / `W` / `Space`: Boost aktivieren
- `Escape`: Pause / Resume
- `Enter`: Start / Restart / Primaeraktion

Touch:

- horizontaler Swipe: Spurwechsel
- Swipe nach oben: Boost
- Tap: Primaeraktion in Menu/Game Over

Nicht mehr verwenden:

- kein Springen
- kein Ducken
- kein Schleichen
- keine Hindernisse, die nur durch alte Vertikal- oder Duck-Aktionen geloest werden

## Fehler- und Kollisionsmodell

Es gibt zwei Fehlerklassen.

### Schwacher Fehler

Ein schwacher Fehler ist ein kleiner Fahrfehler ohne sofortigen Crash.

Beispiele:

- Spieler versucht ueber den linken oder rechten Spurrand hinaus zu wechseln
- kurzer Kontakt mit seitlicher Begrenzung, sobald diese Mechanik ergaenzt wird

Effekt:

- Pressure steigt
- Camera Shake wird ausgeloest
- Polizeiverfolger wird wieder sichtbar oder kommt naeher
- Combo kann zurueckgesetzt werden
- nach zwei schwachen Fehlern endet der Run als Game Over

### Starker Fehler

Ein starker Fehler beendet den Run sofort.

Beispiele:

- direkte Kollision mit Steinbarriere
- direkte Kollision mit Bambus-Hindernis
- direkte Kollision mit Banner-/Tor-Hindernis

Effekt:

- sofort Game Over
- klarer Recoil des Autos
- deutlicher Camera Shake
- Pressure wird auf Maximum gesetzt
- Restart muss danach die Welt komplett zuruecksetzen

### Boost-Kollision

Wenn Boost aktiv ist und das Auto ein Hindernis trifft:

- der Spieler bleibt am Leben
- das Hindernis wird deaktiviert und verschwindet sofort
- der Run geht weiter
- ein kurzer Camera Shake bestaetigt den Impact
- spaeter soll hier eine kleine stilisierte Explosion entstehen

Die spaetere Explosion ist als Folgefeature notiert:

- Low-poly Splitter
- orange/weisse Funken
- kurzer Shockwave-Ring
- staerkere Boost-Flammen
- optional Speed-Lines

## Art Direction

Der Stil ist stylized low-poly:

- wenige, klare Flaechen
- saubere primitive Formen
- starke Silhouetten
- keine fotorealistischen Texturen
- kraeftige Farben
- hohe Lesbarkeit bei schneller Bewegung
- UI und Spielobjekte muessen auch auf kleiner Ansicht erkennbar bleiben

### Farbpalette

Welt:

- Torii-Rot / Vermilion: `#E9442E`
- Bambus-Gruen: `#35A853`
- Dunkles Indigo: `#273C75`
- Warmes Laternen-Gelb: `#FFC857`
- Stein-Grau: `#7E858B`
- Holz-Braun: `#8B5A2B`
- Himmel-Blau: `#58C7F3`

Akzentfarbe:

- Leuchtendes Tuerkis: `#00E5FF`

Akzentfarbe verwenden fuer:

- Boost-Aura
- UI-Hervorhebungen
- Power-up-VFX
- Debug-Markierungen
- wichtige interaktive Signale

Fahrzeuge:

- Player-Car: kraeftiges Rot/Orange oder Rot mit dunklen Panels
- Police-Car: Weiss/Schwarz mit rot/blauer Lightbar
- Boost-Flammen: Orange/Gelb mit leichter Emissive-Wirkung
- Headlights: warmes Weiss
- Tail lights: klares Rot

## Player-Modell: Generischer Low-Poly Supercar

Das Auto soll aus der Third-Person-Kamera sofort als flacher, schneller Sportwagen lesbar sein. Es darf sportlich und exotisch wirken, aber keine echte Marke kopieren.

Achsen:

- `+Z` ist Fahrtrichtung
- `X` ist Spurwechsel
- `Y` ist Hoehe
- Front des Autos zeigt nach `+Z`

Primitive-Hierarchie:

```text
PlayerCarRoot
- lower body
- front nose
- rear deck
- dark rear panel
- low glass cabin
- front splitter
- rear spoiler
- spoiler supports
- four wheels
- headlights
- tail lights
- boost exhaust cones
```

Silhouette:

- sehr flach
- breiter als hoch
- Front niedrig und aggressiv
- Heck breiter und etwas hoeher
- kleine Kabine weit hinten
- sichtbarer Spoiler
- rote Ruecklichter fuer Third-Person-Lesbarkeit

Kollisionsvolumen:

- nicht volle optische Breite verwenden
- Collider soll fairer sein als das sichtbare Auto
- empfohlene Groesse: ca. `1.15 x 0.72 x 1.96`

Animation:

- leichte Federung/Bob bei Bewegung
- Roll beim Spurwechsel
- Recoil nach starkem Treffer
- Boost laesst Fahrzeug minimal groesser/energetischer wirken

## Verfolger-Modell: Tokio-inspiriertes Police-Car

Das Police-Car ist generisch, nicht real markengebunden und nicht mit echten Behoerdensiegeln versehen.

Primitive-Hierarchie:

```text
PoliceCarRoot
- white sedan body
- hood
- trunk
- dark cabin glass
- black side panels
- front grill
- simple bull bar
- roof lightbar base
- red light block
- blue light block
- four wheels
- headlights
```

Silhouette:

- etwas hoeher und massiver als der Player
- kantiger Patrol-Sedan
- klarer Weiss/Schwarz-Kontrast
- Lightbar muss auch aus Distanz lesbar sein
- Frontmasse wirkt bedrohlicher als Player-Car

Verhalten:

- im Menu und Countdown nicht dominant sichtbar
- beim sauberen Lauf nach kurzer Zeit aus der Sicht
- bei Pressure oder Fehlern wieder im Bild
- bei hohem Pressure naeher zur Kamera

## Welt und Track

Die Welt bleibt feudal-japanisch:

- grauer Tempelpfad
- gruene Seitenbereiche
- Torii-Tore
- Bambuscluster
- Steinlaternen
- Koban-Muenzen
- einfache Hindernisse aus Bambus, Stein und Banner-Elementen

Wichtig fuer Start und Restart:

- Track-Segmente muessen auch hinter der Startposition existieren
- Kamera darf nie nur Himmel/Void unter sich sehen
- beim Restart muessen Ground- und Deko-Pieces auf ihre initiale Z-Position zurueck
- Coins und Hindernisse muessen ebenfalls auf initiale Track-Positionen zurueck
- Recycling darf nach einem langen Run keine leere Startumgebung hinterlassen

## Hindernisse

Hindernisse sind nicht mehr an alte Vertikal-Ausweichaktionen gekoppelt. Sie sind Kollisionsformen:

- `low`: bodennahe Barriere, z. B. umgefallener Bambus
- `tall`: hoehere/aufrechte Barriere, z. B. Banner oder Torsegment
- `barrier`: feste Blockade, z. B. Steinbarriere

Alle Hindernisse sind starke Fehler, wenn kein Boost aktiv ist.

Boost-Regel:

- bei aktivem Boost wird das Hindernis zerstoert/deaktiviert
- spaeter VFX statt einfachem Ausblenden

## Systems und Architektur

Die Codebasis muss modular bleiben. Gameplay, Rendering, Input, Collision und Progression sollen getrennt sein.

Aktuelle Struktur:

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
      CameraController.ts
      LightingRig.ts
      RendererService.ts
      ResizeService.ts
      SceneFactory.ts
  game/
    collectibles/
      Collectible.ts
      CollectibleSystem.ts
    obstacles/
      Obstacle.ts
      ObstacleSystem.ts
    powerups/
      PowerUpTypes.ts
    progression/
      SaveData.ts
      ScoreSystem.ts
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

Architekturregeln:

- `GameApp` orchestriert State, UI, Loop und Scene
- `SceneFactory` baut die aktuelle spielbare Szene und verbindet Systeme
- `InputManager` kennt Eingabegeraete, aber keine Gameplay-Details
- `RunnerController` kennt Lane, Boost, Recoil und Collider des Players
- `VehicleCatalog` definiert spielbare Autos datengetrieben mit Model-Key, Run-Scale, Showroom-Scale, Collider-Bounds und Unlock-State
- `ObstacleSystem` kennt Hindernis-Recycling und Kollisionen
- `CollectibleSystem` kennt Coin-Recycling und Coin-Kollisionen
- `BiomeContent` definiert Track-, Deko-, Coin- und Hindernisverteilung pro Biome
- `CollisionSystem` bleibt generisch und AABB-basiert
- `ModelFactory` erzeugt primitive Fallback-Modelle ohne externe Assets
- `MaterialFactory` kapselt Farben und Materialwerte
- neue Biome oder Fahrzeuge duerfen nicht direkt in `GameApp` hartcodiert werden

## Garage- und Menueplanung

Die Garage wird ein eigener 3D-Showroom, nicht nur ein DOM-Untermenue. Sie soll spaeter als eigener Top-Level-State umgesetzt werden:

```text
menu -> garage
garage -> menu
garage -> countdown/running
```

Konzept:

- kleine echte 3D-Garage im bisherigen Low-Poly-Stil
- zentrale Drehscheibe fuer das ausgewaehlte Auto
- Kamera leicht frontal und niedrig wie in erfolgreichen Racing-Game-Car-Select-Screens
- Torii-/Werkstatt-Mix mit tuerkisen Lichtleisten, Reifenstapeln, Low-Poly-Werkzeug und japanischen Akzenten
- Links/Rechts wechselt Fahrzeuge
- altes Auto gleitet/rotiert seitlich heraus, neues Auto gleitet smooth auf die Plattform
- Eingaben waehrend des Wechsels werden ignoriert oder gepuffert
- UI bleibt knapp: Start, Garage, Zurueck, Links/Rechts, Auswaehlen
- SaveData speichert spaeter `selectedVehicleId` und `unlockedVehicleIds`
- Garage nutzt `VehicleCatalog`, Run-World nutzt `BiomeContent`; beide teilen nur Asset-/Material-/Model-Factories

Erstes Test-Setup:

- `sports-car`: roter flacher Supercar
- `drift-coupe`: blaues kompaktes Drift-Coupe mit Overfendern und Ducktail

## Erweiterungen nach dem MCP

Naechste sinnvolle Ausbaustufen:

1. Boost-Cooldown und HUD-Anzeige fuer Ability-Status
2. Zerstörungs-VFX fuer Hindernisse
3. Police-Lightbar-Blinken und Siren-Visuals
4. besser sichtbare Player-Car-Kamera-Komposition
5. weitere Hindernisformen und faire Telegraphing-Zonen
6. Speed-Kurven und dynamische Schwierigkeit
7. echtes Segment-System mit Biomen
8. Audio-Hooks fuer Coins, Boost, Crash, Police-Pressure
9. Mobile-Tuning fuer Swipe-Laengen und UI-Groessen
10. Persistenter Highscore

## Pruefkriterien

Vor Abschluss einer Phase muss geprueft werden:

- `npm run build` laeuft ohne TypeScript-Fehler
- Browser-Konsole hat keine Runtime-Errors
- Startbild zeigt Track, nicht Void
- Restart zeigt wieder Track und Umgebung, nicht nur Coins/Hindernisse im Nichts
- Links/Rechts-Steuerung stimmt aus Spielerperspektive
- `Space`, `ArrowUp`, `W` aktivieren Boost
- Hindernis ohne Boost fuehrt zu Game Over
- Hindernis mit Boost wird deaktiviert und der Run geht weiter
- Coins werden weiter gesammelt
- schwache Fehler erhoehen Pressure
- zwei schwache Fehler fuehren zu Game Over
- Police-Car ist nicht dauerhaft dominant im Bild
- Japanese Setting und Farbpalette bleiben klar erkennbar
