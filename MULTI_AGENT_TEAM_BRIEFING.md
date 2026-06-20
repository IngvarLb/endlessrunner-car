# Multi-Agent Team Briefing: Feudal Japan Endless Runner

## Zweck

Dieses Dokument briefed ein eng koordiniertes Agenten-Team fuer die Umsetzung des Spiels aus `FEUDAL_JAPAN_ENDLESS_RUNNER_PROMPT.md`.

Ziel ist nicht, dass mehrere Agenten unabhaengig "irgendwas bauen", sondern dass sie wie ein abgestimmtes Entwicklungsteam arbeiten:

- klare Expertenrollen
- feste Ownership-Grenzen
- gemeinsame Datenvertraege
- kleine Integrationsschritte
- explizite Pruefung pro Rolle
- kein stilles Aendern fremder Module
- keine widerspruechlichen Architekturentscheidungen

Der Orchestrator ist die zentrale Integrationsinstanz. Die Fach-Agenten liefern Ergebnisse, Patches, Pruefberichte oder konkrete Empfehlungen an den Orchestrator. Der Orchestrator prueft Konflikte, fuegt Ergebnisse zusammen und entscheidet bei Schnittstellenfragen.

## Ehrliche Rahmenbedingung

Die Agenten koennen nicht wie ein echter Echtzeit-Teamchat direkt miteinander diskutieren. Enge Zusammenarbeit wird deshalb ueber folgende Mechanismen hergestellt:

- ein gemeinsames Prompt- und Architektur-Dokument
- eindeutige Modulverantwortung
- gemeinsame TypeScript-Vertraege
- klar definierte Handoff-Formate
- keine parallelen Edits an denselben Dateien
- regelmaessige Integration durch den Orchestrator
- QA-Gates nach jedem groesseren Schritt

Wenn ein Agent eine Entscheidung braucht, die sein Ownership-Gebiet verlaesst, darf er nicht raten. Er muss die Frage an den Orchestrator eskalieren.

## Gemeinsame Projektquelle

Primaere Spezifikation:

```text
FEUDAL_JAPAN_ENDLESS_RUNNER_PROMPT.md
```

Dieses Team-Briefing ist nachrangig zur Spezifikation, aber konkreter fuer die Zusammenarbeit. Bei Widerspruechen gilt:

1. Sicherheit, IP-Regeln und User-Ziel
2. MCP/MVP-Pflichtumfang
3. gemeinsame Datenvertraege
4. dieses Team-Briefing
5. individuelle Agentenannahmen

## Teamrollen

### Orchestrator

Verantwortung:

- Gesamtarchitektur konsistent halten
- Agenten briefen
- Arbeitspakete schneiden
- Merge-Konflikte vermeiden
- Schnittstellenentscheidungen treffen
- finale Integration
- finale QA-Zusammenfassung

Der Orchestrator bearbeitet bevorzugt:

- `src/app/`
- gemeinsame Contracts
- Build-Konfiguration
- Integration zwischen Systemen
- finale Bugfixes
- Dokumentation und Abnahme

Der Orchestrator darf die Arbeit einzelner Agenten anpassen, wenn sie mit Gesamtziel, Architektur oder QA kollidiert.

### Agent 1: Architecture & Integration Lead

Primaere Verantwortung:

- Projektstruktur
- Engine/Game-Trennung
- gemeinsame TypeScript-Vertraege
- Event-System
- Service-Registry
- GameLoop
- StateMachine
- Datenfluss zwischen Systemen
- technische Erweiterbarkeit

Primaere Dateien oder Module:

```text
src/app/
src/engine/time/
src/engine/debug/
src/game/state/
src/game/data/
src/shared/ oder src/app/contracts/
```

Muss pruefen:

- keine zyklischen Abhaengigkeiten zwischen Engine und Game
- keine versteckten globalen Mutable States
- gemeinsame Events sind typisiert
- alle anderen Agenten koennen gegen stabile Contracts arbeiten
- Architektur erlaubt spaeter neue Biome, Hindernisse, Power-ups, Gegner und Skins

### Agent 2: Gameplay Systems Lead

Primaere Verantwortung:

- RunnerController
- Input-Mapping aus Aktionen in Gameplay
- LaneSystem
- TurnController
- PathDirectionSystem
- WorldController
- SegmentGenerator
- Hindernisse
- Collectibles
- Power-ups
- Verfolgerdruck
- Feueratem
- Fairness-Regeln

Primaere Dateien oder Module:

```text
src/engine/input/
src/engine/physics/
src/game/runner/
src/game/world/
src/game/obstacles/
src/game/collectibles/
src/game/powerups/
src/game/enemy/
src/game/progression/
```

Muss pruefen:

- links/rechts, Sprung, Slide und Turn funktionieren
- kein Segment erzeugt unmoegliche Situationen
- Feueratem blockiert nicht unfair alle Optionen
- Runner-Collider aendert sich korrekt bei Slide und Jump
- Power-ups interagieren korrekt mit Score, Kollision und Collectibles
- Verfolgerdruck ist spielbar, sichtbar und fair

### Agent 3: 3D Art, Rendering & Asset Pipeline Lead

Primaere Verantwortung:

- Three.js Renderer
- Szene, Kamera, Lighting, Fog
- Low-poly-Primitive-Fallbacks
- GLB-Asset-Konventionen
- Materialien und Farbpalette
- VFX
- Performance-Budgets
- Canvas-Sichtbarkeit
- Mobile/desktop visuelle Lesbarkeit

Primaere Dateien oder Module:

```text
src/engine/rendering/
src/engine/assets/
src/game/effects/
src/game/data/biomes.feudalJapan.ts
src/styles/
public/assets/ falls vorhanden
```

Muss pruefen:

- Kleinkind-Ritter ist erkennbar
- Feuer-Oni-Automat ist eigenstaendig und IP-sicher
- feudal-japanisches Biom ist im ersten Viewport klar erkennbar
- Power-ups nutzen Tuerkis als Akzentfarbe
- Hindernisse sind von Deko unterscheidbar
- Szene ist nicht leer, nicht falsch gerahmt, nicht visuell ueberladen
- Performance-Ziele bleiben realistisch

### Agent 4: QA, Tests & Verification Lead

Primaere Verantwortung:

- Unit-Test-Plan
- Integrationstest-Plan
- Browser-Verifikation
- Mobile- und Desktop-Eingabepruefung
- Performance-Gates
- Canvas-Pixel-Checks
- Regression-Risiken
- finale Abnahme

Primaere Dateien oder Module:

```text
src/tests/ oder tests/
playwright.config.ts falls verwendet
qa/
docs/verification/
```

Muss pruefen:

- alle MCP-Pflichtmechaniken sind testbar
- Akzeptanzkriterien sind nicht schwacher als der Pflichtumfang
- 30-Sekunden-Lauf ohne Crash
- Segment-/Objekt-Pooling verhindert ungebremstes Wachstum
- Desktop- und Mobile-Eingaben funktionieren
- Screenshots zeigen echte 3D-Szene mit Runner, Pfad, Hindernissen und Verfolger
- UI ueberlappt keine wichtigen Spielelemente

## Detaillierte Agenten-Briefings

### Agent 1 Detailbrief: Architektur und Integration

Agent 1 setzt zuerst die technische Grundlage. Ohne diese Grundlage duerfen Gameplay-, Rendering- und QA-Agenten keine alternativen Parallelstrukturen erfinden.

Pflichtentscheidungen:

- `app/` enthaelt Lifecycle, GameLoop, StateMachine, EventBus, Config und ServiceRegistry.
- `engine/` enthaelt wiederverwendbare technische Systeme: Time, Input, Rendering, Assets, Audio, Physics, Debug.
- `game/` enthaelt domaenenspezifische Systeme: Runner, World, Obstacles, Collectibles, PowerUps, Enemy, Progression, UI, Effects, Data.
- `game/data/` ist die einzige Quelle fuer Balancing-, Segment-, Hindernis-, Power-up-, Coin-Pattern- und Biome-Definitionen.
- Three.js-Objekte duerfen nicht in Score-, Difficulty-, Save-, UI-State- oder reinen Datenmodulen auftauchen.

Gemeinsame Contracts muessen frueh stabilisiert werden:

- `GameConfig`
- `GameEventMap`
- `GameState`
- `LaneIndex`
- `TurnDirection`
- `SegmentKind`
- `Collider`
- `CollisionEvent`
- `TrackSegment`
- `SegmentDefinition`
- `SegmentContext`
- `DifficultyState`
- `RunnerCapabilities`
- `ObstacleDefinition`
- `PowerUpDefinition`
- `SaveData`

Contract-Regel:

- Bestehende Feldnamen, Union-Werte und Semantik werden nicht ohne Orchestrator-Freigabe geaendert.
- Neue Felder sollen zuerst optional oder additive Typen sein.
- Wenn zwei Agenten dieselbe Information brauchen, wird sie in einen gemeinsamen Contract gezogen.

Event-Bus-Regel:

- Gameplay-Systeme publizieren Events.
- UI, Audio und VFX hoeren auf Events.
- UI, Audio und VFX mutieren keine Gameplay-Controller direkt.
- App-Commands wie `start`, `pause`, `resume`, `restart` laufen ueber `GameApp` oder eine klar benannte Command-Schicht.

Verbindliche MVP-Events:

```text
state:changed
runner:hit
runner:laneChanged
runner:turned
coin:collected
powerup:activated
powerup:expired
chaser:pressureChanged
chaser:fireTelegraph
chaser:fireActive
score:changed
settings:changed
```

Architecture-Gates:

- App kann sauber `init`, `start`, `pause`, `resume`, `restart`, `dispose`.
- `restart` setzt alle gameplay-relevanten Systeme deterministisch zurueck.
- `pause` stoppt Gameplay-Zeit, aber nicht zwingend UI.
- Keine zyklischen Imports zwischen Engine und Game.
- Keine versteckten globalen Mutable States ausser klar registrierten Services.
- Alle Feature-Agenten koennen mit Platzhalter-Assets und Placeholder-Audio arbeiten.

### Agent 2 Detailbrief: Gameplay-Systeme

Agent 2 verantwortet den spielbaren Core-Loop. Seine Arbeit gilt erst als fertig, wenn ein kompletter Lauf vom Menue bis Game Over mit Restart funktioniert.

Owned Systeme:

- `InputManager`
- `RunnerController`
- `LaneSystem`
- `TurnController`
- `PathDirectionSystem`
- `WorldController`
- `SegmentGenerator`
- `SegmentPool`
- `ObstacleSpawner`
- `CollectibleSpawner`
- `PowerUpSystem`
- `ChaserDistanceSystem`
- `FireBreathAttack`
- `DifficultyDirector`
- `SegmentValidator`

Runner- und Input-Gates:

- Links/Rechts wechselt genau eine Spur und nie ueber die Randspuren hinaus.
- Kein zweiter Spurwechsel startet parallel waehrend einer laufenden Lane-Transition.
- Jump hat reproduzierbare Dauer, Hoehe, Apex und Grounded-State.
- Slide reduziert Collider-Hoehe temporaer und endet deterministisch.
- Keyboard und Touch erzeugen dieselben `InputAction`s.
- Input wird in `menu`, `paused`, `gameOver` und `countdown` korrekt gefiltert.
- Input-Buffer erlaubt knappe Jump-, Slide- und Turn-Eingaben, ohne sie doppelt zu konsumieren.

Lane-, Turn- und Pfad-Gates:

- Lanes sind stabil als `-1 | 0 | 1` modelliert.
- `LaneSystem` arbeitet relativ zur aktuellen Pfadachse.
- `PathDirectionSystem` rotiert Forward/Right korrekt nach links/rechts Kurven.
- `TurnController` kennt Turn-Fenster, Grace-Time und verpasste Kurven.
- Verpasste Kurven erzeugen definierten Hit, Pressure-Anstieg oder Game Over.
- Lane-Wechsel direkt vor oder nach Kurven erzeugt keine Teleports und keine vertauschten Achsen.

World- und Segment-Gates:

- Aktive Segmente decken immer genug Sichtweite vor dem Runner ab.
- Recycelte Segmente entfernen alte Collider, Coins, Power-ups und VFX-Zustaende.
- Der MVP enthaelt gerade Strecken, linke Kurven, rechte Kurven und mindestens ein klar lesbares feudal-japanisches Biom.
- Schwierigkeit steigt stufenweise, nicht sprunghaft zufaellig.
- Nach schweren Mustern kann Erholungsraum generiert werden.
- Generator produziert keine Sequenz, die ohne gueltige Aktion alle Optionen blockiert.

Hindernis-Gates:

- Jedes Hindernis definiert `requiredAction`, `lanesBlocked`, `colliderSize`, `warningTime`, `minSpeed`.
- Mindestens sechs Hindernistypen decken Jump, Slide, LaneChange und Timing ab.
- Visuell aehnliche Hindernisse verlangen konsistente Spielerantworten.
- Collider sind fairer und einfacher als Mesh-Kollisionen.
- Timing-Hindernisse erscheinen erst, wenn `DifficultyState` sie erlaubt.

Collectible- und Power-up-Gates:

- Coins erhoehen Score, Coins und Combo und feuern `coin:collected`.
- Magnet zieht Coins sichtbar an und verhindert Doppelcollection.
- Shield absorbiert genau einen Treffer oder laeuft nach Dauer ab.
- Multiplier wirkt nur waehrend aktiver Dauer.
- Power-ups nutzen Tuerkis als positive Gameplay-Akzentfarbe.

Chaser- und Feuer-Gates:

- Verfolger bleibt sichtbar und reagiert auf Pressure.
- Kleine Fehler erhoehen Pressure.
- Perfektes Spiel oder Power-ups koennen Pressure reduzieren.
- Bei Max-Pressure fuehrt ein schwerer Treffer zu Game Over.
- Feueratem hat Telegraph, aktive Collider und Ablaufphase.
- Feuer blockiert nie unfair alle sicheren Optionen.
- Feuer-Collider werden nach Ablauf deregistriert.

Gameplay-Edge-Cases, die explizit behandelt werden muessen:

- Restart waehrend aktiver Power-ups, Feuerzonen, Turn-Segmente oder Magnet-Fluege.
- Pause waehrend Jump, Slide, Fire-Telegraph oder Fire-Active.
- Treffer im selben Frame wie Coin- oder Power-up-Collection.
- Schildtreffer bei gleichzeitigem Hindernis- und Feuerkontakt.
- Lane-Wechsel exakt beim Segment- oder Kurvenachsenwechsel.
- Touch-Swipe waehrend Countdown, Pause oder Game Over.
- Runner landet nach gepuffertem Jump auf Brueckenluecke oder Feuerpfuetze.
- Segment-Recycling mit noch aktiven Collidern oder VFX.
- Sehr niedrige FPS: `dt` clampen und Tunneling vermeiden.

### Agent 3 Detailbrief: 3D, Rendering und Asset-Pipeline

Agent 3 sorgt dafuer, dass das Spiel nicht wie ein grauer Prototyp wirkt, sondern sofort als stylized low-poly Feudal-Japan-Runner lesbar ist. Gameplay-Funktion darf aber nie von externen GLB-Dateien abhaengen.

Visuelle Pflichtsignale im ersten spielbaren Build:

- Kleinkind-Ritter: kleiner Koerper, uebergrosser Helm, helle Metallruestung, cartoonhafte Proportion.
- Feuer-Oni-Automat: asymmetrische Maske, Bauchofen, Rauchschlot, kurze schwere Beine, keine Kapsel-/Crewmate-Silhouette.
- Feudal-Japan-Biom: Torii, Steinlaternen, Bambus, Tempel-/Dachformen oder Marktstaende.
- Tuerkis `#00E5FF` nur fuer positive/interaktive Signale.
- Orange/Rot fuer Gefahr und Feuer.
- Gold fuer Koban/Score.

Asset-Reihenfolge:

1. Primitive-Blockout in Three.js fuer alle MVP-Objekte.
2. Gameplay-Validierung mit klaren Collidern.
3. GLB-Ersatz fuer Hero-Assets: Runner, Chaser, Torii-Segment, sechs Hindernisse, Koban, drei Power-ups.
4. Deko-Varianten und weitere Biome erst nach gesichertem Gameplay.

Primitive-Fallbacks sind Pflicht fuer:

- `char_toddler_knight`
- `enemy_fire_oni_automaton`
- Torii
- Steinlaterne
- Bambus
- Bruecke
- Marktkarre
- Trainingsdummy
- Banner
- Feuerpfuetze
- Brueckenluecke
- Koban
- Shield
- Magnet
- Multiplier

Fallbacks und GLBs muessen dieselben Annahmen teilen:

- 1 Three.js Unit ist ungefaehr 1 Meter.
- Runner/Chaser-Pivot liegt auf Bodenmitte zwischen den Fuessen.
- Hindernis-Pivot liegt am geometrischen Bodenmittelpunkt.
- Segment-Pivot liegt am Segmentanfang auf mittlerer Spur.
- Collectible-Pivot liegt im visuellen Zentrum.
- Forward-Achse ist lokale positive Z-Richtung, ausser `PathDirectionSystem` dokumentiert zentral etwas anderes.

Materialsystem:

- `MaterialFactory` ist die einzige Quelle fuer Gameplay-Materialien.
- Keine willkuerlichen Inline-Materialien in Spawnern oder Controllern.
- Pflichtmaterialien: Metall, Holz, Stein, Foliage, Torii-Rot, Gold, Tuerkis-Akzent, Feuer.

Kamera-Schnittstellen:

- Von Runner: Position, Lane, Grounded, Jump, Slide, Speed.
- Von PathDirectionSystem: Forward/Right.
- Von TurnController: kommende Kurve, aktiver Turn, Richtung.
- Von Chaser: Position und Pressure.
- Von Settings: Quality und Reduced Motion.

Kamera-Gates:

- Hindernisse sind frueh genug sichtbar.
- Kurven und Feuer-Telegraphen sind vor der Reaktion sichtbar.
- Lane-Following ist sanft.
- FOV darf mit Speed leicht steigen.
- Screen-Shake ist kurz, skalierbar und bei Reduced Motion reduziert.

VFX-Gates:

- VFX hoert auf Events, nicht auf direkte Controller-Aufrufe.
- Coin-Pickup, Shield, Magnet, Multiplier, Fire-Telegraph, Fire-Active, Hit, Laufstaub und Speedlines existieren.
- Partikel, Flammen, Sparks und Trails sind gepoolt.
- Keine Geometrie-/Material-Erzeugung im Frame-Update.

Performance-Gates fuer Agent 3:

- Desktop-Ziel 60 FPS.
- Mobile-Ziel 30 bis 60 FPS.
- Draw Calls grob unter 150 Desktop.
- Sichtbare Desktop-Tris grob 80k bis 150k.
- Aktive Segmente unter 12.
- Instancing fuer Coins, Bambus, Laternen und wiederholte Deko.
- Debug-Zahlen fuer FPS, Draw Calls, aktive Segmente, aktive VFX, aktive Coins.

Visuelle Missverstaendnisse vermeiden:

- Deko darf keine Collider-Erwartung erzeugen.
- Hindernisse brauchen eindeutige Action-Silhouetten: springen, rutschen oder Spurwechsel.
- Fire-Telegraph nutzt Bodenform plus Farbe, nicht nur Farbe.
- GLB-Previews werden aus Runner-Kamera und Mobile-Viewport geprueft.
- Jede visuelle Aenderung an Runner, Chaser, Hindernissen oder Feuer wird mit Collider-Debug-Overlay geprueft.
- Keine Asset-Datei darf bekannte fremde IP-Formen nachbauen.

### Agent 4 Detailbrief: QA, Tests und Verification

Agent 4 ist nicht nur ein finaler Pruefer. Er definiert Gates, die alle anderen Agenten vor Integration erfuellen muessen.

Unit-Test-Gates:

- `LaneSystem`: Lane `-1/0/1`, Clamp/Reject, `getLaneX`, `worldToLane`.
- `RunnerController`: Auto-Run, Lane-Transition-Sperre, Jump-State, Slide-Dauer, Slide-Collider, Shield-Hit.
- `InputManager`: Keyboard, Touch, Buffer, Consume-once.
- `TurnController` und `PathDirectionSystem`: Left/Right-Turns, Grace-Time, Forward/Right nach Kurve.
- `CollisionSystem`/`Bounds`: disabled Collider, Runner gegen Obstacle/Coin/PowerUp/Fire.
- `SegmentValidator`: sicherer Pfad, keine Feuer-plus-Hindernis-Vollsperre, Reaktionszeit bei Max-Speed.
- `DifficultyDirector`: Speed-Ramp, Max-Speed, Dichte, PowerUp-/Fire-Chance.
- `ScoreSystem`: Distanz, Coins, Combo, Multiplier, Reset.
- `PowerUpSystem`: Shield, Magnet, Multiplier, Ablauf, Reaktivierung.
- `HighScoreStore`: Default-Werte, Versionierung, Highscore, Settings.

Integrationstest-Gates:

- `boot -> loading -> menu -> countdown -> running`.
- `running -> paused -> running`.
- `running -> gameOver -> restart -> running`.
- `Straight -> TurnLeft -> Straight`.
- `Straight -> TurnRight -> Straight`.
- Verpasster Turn erzeugt definierten Hit, Pressure-Anstieg oder Game Over.
- Shield-Hit setzt Lauf fort.
- Hit ohne Shield fuehrt zu Pressure/GameOver gemaess Balancing.
- Coin Collection aktualisiert Score, Coins und Combo.
- Magnet zieht Coins logisch und sichtbar.
- Multiplier wirkt nur waehrend Aktivzeit.
- FireBreath: Telegraph -> active collider -> expire.
- Segment-Recycling haelt aktive Segmente begrenzt.
- Settings speichern und laden korrekt.
- SFX-Hooks feuern bei Lane, Jump, Coin, PowerUp, Hit, Fire, GameOver.

Browser-Gates:

- Desktop `1440x900`.
- Mobile `390x844`.
- Screenshots: Startscreen, Gameplay nach 10 Sekunden, Pause, Game Over, Mobile Gameplay.
- Canvas ist sichtbar, korrekt skaliert und nicht leer.
- Runner, Bahn, Hindernisse, Coins/Power-ups und Chaser sind sichtbar.
- HUD zeigt Score, Distanz, Coins, Combo, PowerUps, Pressure und Pause.
- Keine UI-Ueberlappung mit Safe Areas oder wichtigen Spielelementen.
- Restart funktioniert nach Game Over.
- 30-Sekunden-Lauf crasht nicht.
- Console enthaelt keine uncaught errors.

Input-Gates:

- Desktop: ArrowLeft/A, ArrowRight/D, Space/ArrowUp/W, Shift/S/ArrowDown, Escape, UI-Pause.
- Mobile: Swipe left/right/up/down, Tap start, Tap pause/resume.
- Jede Eingabe hat sichtbare Wirkung und wird nicht doppelt konsumiert.

Canvas-Pixel-Check:

- Canvas ist nicht schwarz, weiss, transparent oder einfarbig.
- Mehrere Farbcluster sind sichtbar.
- Tuerkis-Akzent ist sichtbar.
- Feuer-Warnfarben sind sichtbar.
- Canvas-Inhalt ist korrekt gerahmt.

Finale QA-Abnahme:

- `npm install`, Dev-Server und Tests laufen.
- Alle MVP-Mechaniken sind spielbar.
- Unit- und Integrationstests sind gruen oder Ausnahmen sind konkret begruendet.
- Browser-Verifikation fuer Desktop und Mobile ist bestanden.
- 30-Sekunden-Run ohne Crash und ohne ungebremstes Speicherwachstum.
- Performance-Ziele erreicht oder Abweichungen konkret dokumentiert.
- Keine offenen TODOs fuer MCP-Pflichtmechaniken.

## Kommunikationsregeln

Jeder Agent liefert Ergebnisse in diesem Format:

```text
Rolle:
Bearbeiteter Scope:
Geaenderte Dateien:
Abhaengigkeiten zu anderen Agenten:
Getroffene Annahmen:
Pruefung:
Offene Fragen:
Risiken:
Naechster sinnvoller Schritt:
```

Wenn ein Agent Dateien aendert, muss er nennen:

- welche Dateien er geaendert hat
- welche Contracts er verwendet hat
- welche Tests oder Checks er ausgefuehrt hat
- welche Tests nicht ausgefuehrt werden konnten

## Konfliktvermeidung

- Kein Agent editiert Dateien ausserhalb seines Ownership-Bereichs ohne Orchestrator-Freigabe.
- Gemeinsame Contracts werden nur vom Orchestrator oder Architecture Lead geaendert.
- Gameplay-Agenten duerfen Rendering-Details nur ueber Interfaces anfordern.
- Rendering-Agenten duerfen Gameplay-Regeln nicht veraendern.
- QA-Agenten duerfen Tests und Pruefskripte bearbeiten, aber keine Produktlogik ohne Ruecksprache.
- Wenn zwei Systeme dieselbe Information brauchen, wird sie in einen gemeinsamen Contract verschoben.
- Keine "schnellen" lokalen Sonderloesungen, die spaeter andere Module umgehen.

## Gemeinsame Definition of Done

Ein Arbeitspaket gilt nur als fertig, wenn:

- es gegen die aktuelle Spezifikation arbeitet
- es keine fremde Ownership verletzt
- es die vereinbarten Contracts nutzt
- es mindestens eine passende Pruefung hat
- es keine stillen TODOs fuer MCP-Pflichtumfang hinterlaesst
- es im finalen Spielablauf integrierbar ist

## Integrationsreihenfolge

1. Contracts, Projektstruktur, GameLoop, StateMachine
2. Renderer, Basis-Szene, Kamera, Resize
3. Runner, Input, Lane-System
4. Turn-System und Pfadachsen
5. Segmentgenerator und Segmentpool
6. Hindernisse und Kollision
7. Collectibles, Score, Power-ups
8. Verfolgerdruck und Feueratem
9. UI, Menues, Pause, Game Over, Settings, SaveData
10. Primitive-Fallback-Art-Pass und feudal-japanisches Biom
11. VFX und Audio-Hooks
12. Tests, Browser-Verifikation, Performance-Pass

## User-Eskalation

Der Orchestrator fragt den User nur, wenn:

- eine Designentscheidung mehrere sinnvolle Richtungen hat und spaeter schwer zu aendern ist
- externe Abhaengigkeiten installiert werden muessen und Genehmigung noetig ist
- der Umfang den gewuenschten Zeit-/Qualitaetsrahmen sprengt
- IP-, Gewalt-, Kinder- oder Markenaehnlichkeitsrisiken entstehen
- unklar ist, ob zuerst Prompt/Plan oder direkt Implementierung gewuenscht ist

Aktueller Stand: Dieses Dokument ist ein Team-Briefing. Die eigentliche Spielimplementierung startet erst, wenn der Orchestrator den Implementierungsauftrag gibt oder der User ihn bestaetigt.
