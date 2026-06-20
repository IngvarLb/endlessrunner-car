# Projektplan: Feudal Japan Car Runner

Stand: 2026-06-18

Dieses Dokument ist der Arbeitsplan fuer zukuenftige KI-Sessions. Es beschreibt, wo wir aufgehört haben, welche Probleme bekannt sind und in welcher Reihenfolge das Spiel weiterentwickelt werden soll.

## Visual-/Design-Overhaul (2026-06-19)

In dieser Session wurde ein durchgehendes Designsystem eingefuehrt und Grafik/Modelle aufgewertet. `npm run build` laeuft sauber.

- **Designsystem**: `DESIGN_SYSTEM.md` ist die Single Source of Truth. Art-Direction = Ukiyo-e Woodblock (warmes Washi-Papier, Sumi-Tusche, Vermillion 朱 `#d2401f`, Indigo 藍 `#273c75`, Blattgold 金 `#caa54a`). Cyan ist aus der 2D-UI verbannt (nur noch 3D-Emissive am Ryujin/Polizei/Boost).
- **Typo**: Google Fonts in `index.html` (Shippori Mincho B1 Display, Zen Kaku Gothic New Body, Yuji Syuku Brush). Mutige Display-Groessen, Kanji-Kicker (走/蔵/金 …) ueberall, Hanko-Siegel als Marke.
- **`global.css`** komplett auf Tokens umgestellt (Farbe, Typo, Spacing, Radius, Border, Schatten, Motion). Opakes Papier statt Glas/Blur, 2px-Tuschekanten, warme Papier-Schatten, Papier-Grain.
- **Garage-UI neu**: Das zentrale Panel ist aufgeloest. Auto bleibt freier Held; Coins oben-rechts (金), Settings/Pfeile am Rand, Name+Tier+Preis+Status in einem unteren Papier-Scrim-Streifen, ein DRIVE/UNLOCK/LOCKED-Button. Stat-Balken bewusst weggelassen (Fahrzeuge haben noch keine echten Gameplay-Werte).
- **Grafik hoch**: `RendererService` nutzt jetzt AA in medium+high, Pixelratio-Caps 1.25/1.75/2.0, ACES-Filmic-Tonemapping (Exposure 1.18). Shadows auch in medium. `LightingRig` mit groesserer Shadow-Map + Bias. (Behebt das gemeldete Kantenflimmern; Akku bewusst nachrangig.)
- **Autos neu gebaut**: Alle 7 Player-Fahrzeuge in `ModelFactory` neu (Tier-Eskalation: Akai Striker bewusst gewoehnlich → Ryujin spektakulaer). Neue Materialien in `MaterialFactory`, mehrteilige Wheels, `VehicleCatalog` bounds/scale nachgezogen.
- **Garage-3D**: `GarageSceneFactory` von kaltem Neonkasten zu laternenbeleuchteter Werkstatt: warmes Dusk-BG, Holzboden + Gold-Ring-Drehscheibe, zentrierter Vermillion-Torii-Backdrop, haengende Papierlaternen, Indigo-Noren, Gold-Wainscot; Lichter auf lantern-warm + Indigo-Rim umgefarbt.

Offen / als Naechstes sinnvoll: User-Playtest (Look, Tonemapping-Exposure feinjustieren, Garage-Layout Hoch-/Querformat), optional echte Fahrzeug-Stats fuer die Stat-Balken.

## Design-Vision „Neo-Ukiyo Riso-Print" (2026-06-19)

Nach User-Feedback („Design wirkt leblos, liegt obendrauf, keine Tiefe, WOW fehlt") wurde eine vollstaendige Design-Vision erarbeitet und vom User bestaetigt: `DESIGN_VISION.md` (inkl. Bildanalyse, Experten-WOW-Review §14 und verbindlichen Leitplanken §15). Bestaetigte Eckpunkte: META = Distanz als gebrandeter Hero-Wert; heisses Scharlach `#E1261C` als der eine Schrei pro Screen; Sammel-Hanko-Leiste in der Garage; „Druck statt Glow"; Drei-Groessen-Typo; Tiefe physisch (Kanji-Plane mit Auto-Schatten); Hochformat als eigene Buehne.

Umsetzung gestaffelt. **Stufe 1 umgesetzt (Garage-Tiefe / hoechster Hebel):**
- `src/engine/rendering/GarageBackdrop.ts`: monumentales per-Fahrzeug-Kanji (赤/藍/桜/狐/将/鬼/龍) als 3D-Plane auf einer hellen Washi-Papierwand hinter dem Auto (CanvasTexture, nur bei Wechsel neu gezeichnet). Auto verdeckt das Kanji und wirft Schatten auf die Papierwand (E3 = „Tinte auf Papier", reference-true).
- `GarageSceneFactory`: ¾-Kamera in einen tieferen Raum (statt frontal auf flache Wand); Key-Light-Shadow-Frustum auf die Wand ausgerichtet; Raum entschlackt (Torii/Noren/Wainscot/Reifen raus), Laternen als Tiefen-Rail an der Seitenwand, ein beleuchtetes Werkzeugregal links als Tiefen-Detail.
- Playtest-Korrektur (Screenshots geprueft): die zuerst eingebauten Hinomaru-Strahlen wurden wieder entfernt (nicht reference-true, Flaggen-Klischee), und der Raum wurde von dunklem Dusk auf eine HELLE Papier-Buehne umgestellt (heller Hintergrund/Hemisphere, helle Plaster-Waende, warmer Holzboden) — damit Scharlach-Kanji + Auto wie Druck auf Papier wirken.

**Stufe 2 umgesetzt (Designsprache ueber die ganze UI):** `global.css` auf Riso-Print umgestellt — heisses Scharlach `#E1261C` (eine Akzentfarbe pro Screen), Drei-Groessen-Typo (Monument-Display vs. Micro, nichts dazwischen), Gold nur fuer Wert, Riso-Versatz auf Monumenten, Papier-Grain. Druck-„Moeblierung": Eck-Registriermarken + Mono-Microcopy-Footer (`.print-frame`, nur Menue/GameOver). Menue = Poster (monumentaler Titel, Eyebrow-Kicker mit Kanji + Scharlach-Linie, Papier-Band ueber der Szene). HUD: META (Distanz) als Scharlach-Hero-Chip + 金 Coins (Gold) + × Combo + 圧 Pressure, je mit Kanji-Micro. Game-Over = Stempel (monumentale META-Zahl + 終 + Chips). `score`-Feld im HUD zu `meta` (Distanz) umbenannt.

**Stufe 3 umgesetzt (Garage-WOW):** Kino-Wechsel (E1) — `GarageBackdrop.update()` macht beim Fahrzeugwechsel einen Kanji-Stempel-Punch (Back-Ease-Overshoot), plus `.garage-flash` Papier-Weiss-Blitz (WAAPI, respektiert reducedMotion) und der bestehende Slide/SFX. Sammel-Hanko-Leiste (E6) — `.hanko-rail` oben-mittig: owned = Scharlach-Siegel, locked = Geister-Stempel, aktives mit Ring; gebaut in `GameApp.renderHankoRail()`, aktiv-Highlight wird leichtgewichtig nur bei Wechsel aktualisiert. Geteiltes `src/game/vehicles/vehicleKanji.ts` fuer Backdrop + Leiste.

**Auto-Modelle neu gebaut (2026-06-19, nach Screenshot-Review):** Die „detaillierten" Autos des Modelling-Agenten (Kitsune/Shogun/Oni/Ryujin) sahen in der nahen Garage-Ansicht aus wie Haufen loser Boxen (schwebende Dach-Klötze, abstehende Räder, Ryujin als flaches „Floß" mit Stangen). Fix: ein gemeinsamer `ModelFactory.buildCar(spec)`-Helfer baut jetzt eine kohärente Low-Poly-Silhouette (ein Hauptvolumen + schräge Haube/Heck + verbundenes Glas-Greenhouse mit Eck-Pillars + Räder in Radkästen). Die 5 schwachen Autos (Sakura, Kitsune, Shogun, Oni, Ryujin) wurden schlank darauf neu aufgebaut, mit nur wenigen FEST VERBUNDENEN Akzenten (kein schwebendes Detail). Per Screenshot verifiziert: alle 7 lesen sich jetzt als echte Autos mit klarer Tier-Eskalation. Akai/Aoi (Starter) blieben unveraendert (waren schon okay). Verifikation lief ueber System-Chrome via `puppeteer-core --no-save` + headless Screenshots der Garage.

Offen/optional bei den Autos: Wings/Heckpartien sind noch schlichte Flat-Slabs; VehicleCatalog-`bounds`/`scale` wurden NICHT nachgezogen (Footprints aehnlich, Collision-AABB unkritisch) — bei Bedarf spaeter pruefen.

**UI-Politur (2026-06-20, nach Feedback):** Der weisse Switch-Flash (E1) wurde entfernt (wirkte als Aufhell-Blitz stoerend) — der 3D-Kanji-Stempel-Punch bleibt. Der untere Garagen-Streifen ist nicht mehr ein dunkler „Web-Footer"-Kasten, sondern ein helles Washi-Papier-Band (Verlauf, das vom Boden aufsteigt) mit Tinte-Text. Die ‹ ›-Pfeil-Icons wurden von duennen Chevron-Glyphen zu kraeftigen Papier-Siegeln mit klaren Scharlach-Dreiecken (CSS-Triangle via `::before`) umgebaut. Per Screenshot verifiziert (Quer + Hoch).

**Garage-Spotlight (2026-06-20, nach Mockup-Referenz):** Der Garagenraum wurde wieder abgedunkelt (dunkler BG `0x17121a`, Hemisphere-Ambient auf 0.42, Seitenwaende auf `darkWood`) und bekommt jetzt ein Hero-`THREE.SpotLight` von oben-vorne auf die Drehscheibe (Pool of Light, weicher Penumbra, Shadow). Plus dezenter Directional-Fill, warmer Gold-Lift aus dem Ring, kuehler Rim und ein warmer `wallWash`-Point, damit das Backdrop-Kanji im dunklen Raum lesbar bleibt. Ergebnis (per Screenshot verifiziert, quer + hoch): moody dunkler Raum mit Spotlight-Buehne auf dem Auto — entspricht der Mockup-Richtung. Tunables: `spot` intensity/angle/penumbra in `buildLighting()`.

Stufe 4 (offen): diegetisches Run-HUD (META-Schilder am Strassenrand, Meilenstein-Stempel, Boost-Tempo-Linien/Tinten-Rand, Combo-Aura). Optional: Kanji noch brutaler anschneiden (§15.1), Game-Over-Stempel animieren.

Tunables, falls etwas zu dunkel/hell wirkt: `RendererService.toneMappingExposure` und die Garage-Lichtintensitaeten in `GarageSceneFactory.buildLighting()`.

## Kurzstatus

Das Projekt ist ein Three.js/Vite/TypeScript 3D-Endless-Runner im stylized Low-Poly-Feudal-Japan-Setting. Der spielbare Charakter ist aktuell ein generischer Sportwagen, verfolgt von einem tokio-inspirierten Police-Car. Das Spiel laeuft als Browser-App.

Aktuell umgesetzt:

- automatische Vorwaertsbewegung
- 3-Lane-System
- Links/Rechts-Steuerung aus Spielerperspektive
- Boost-Faehigkeit ueber `Space`, `ArrowUp`, `W`
- kein Springen, kein Ducken, kein Schleichen
- Coins/Koban sammeln
- Score, Coins, Combo, Pressure im HUD
- Traffic-Cars ohne Boost fuehren zu Game Over
- Traffic-Cars mit Boost werden ausgeblendet und der Run geht weiter
- alte Bambus-/Stein-/Banner-Hindernisse sind nicht mehr im aktiven Run
- Traffic-Cars fahren langsamer als der Spieler und werden ueber Lanes ueberholt
- Traffic-Pattern werden beim Erstellen der Run-Scene gegen Full-Lane-Blocks und unmoegliche Spurwechsel validiert
- Traffic ist dichter geworden: 9 Traffic-Rows pro 120m-Loop statt 6
- Run-Speed steigt mit der Zeit: erst linear, danach asymptotisch langsamer bis zu einem hohen Max-Speed
- traditionelle japanische Haus-Deko steht rechts/links dicht am Randstreifen, damit die Welt geschlossener wirkt
- Hausreihen wurden deutlich vergroessert und dichter gesetzt, damit zwischen den Haeusern weniger Void sichtbar ist
- prozeduraler Hip-Hop/Rap-Instrumental-Beat ohne Stimme ist als Web-Audio-Service vorbereitet und angebunden
- SFX fuer Coins, Boost, Kollision/GameOver, weak fail, UI-Klicks, Garage-Switch und Countdown sind angebunden
- Fahrbahn hat Markierungen: durchgehende Randlinien und gestrichelte Lane-Grenzen
- Torii-Bogen-Saeulen stehen nicht mehr auf der Fahrbahn, sondern beginnen am Gruenstreifen neben der Strasse
- Settings-Zahnrad ist im UI vorhanden und steuert/persistiert `Mute`, `Music` und `SFX`
- Garage-Shop-/Unlock-System ist umgesetzt; Details und Edgecases stehen in `GARAGE_SHOP_UNLOCK_PLAN.md`
- Performance-/Akku-Optimierung:
  - Medium nutzt niedrigere Pixelratio und keine Shadow-Map mehr
  - Renderer erzwingt nur noch in High-Quality das High-Performance-GPU-Profil
  - Menu/Pause/GameOver und Garage rendern gedrosselt statt dauerhaft mit voller Rate
  - statische Child-Meshes von Weltdeko/Straßensegmenten werden eingefroren
- schwache Fehler durch falschen Spurwechsel am Rand erhoehen Pressure
- zwei schwache Fehler fuehren zu Game Over
- Police-Car ist am Run-Start fuer ein paar Sekunden sichtbar
- Police-Car faehrt im Intro bewusst naeher und seitlich versetzt hinter dem Spieler, damit es im Kamerabild erkennbar ist
- Nach einem schwachen Fehler ist das Police-Car fuer 10 Sekunden sichtbar und gefaehrlich
- Nur ein zweiter schwacher Fehler innerhalb dieses 10-Sekunden-Fensters fuehrt zu Game Over
- Wenn das 10-Sekunden-Fenster ablaeuft, wird der schwache Fehler wieder zurueckgesetzt
- Start-/Restart-Backfill wurde verbessert
- Fahrzeuge sind ueber `VehicleCatalog` vorbereitet
- zweites Testauto `Aoi Drift Coupe` existiert als Primitive-Modell
- Weltinhalt ist ueber `BiomeContent` teilweise datengetrieben
- Garage-MVP-Basis ist umgesetzt:
  - eigener `garage` GameState
  - eigene `GarageSceneFactory`
  - eigener `GarageShowroomController`
  - `AppScene`-Interface fuer Run/Garage
  - aktive Szene wird in `GameApp` zentral gewechselt
  - Fahrzeugwechsel zwischen `Akai Striker` und `Aoi Drift Coupe`
  - Garage-Fahrzeuge werden vorab erzeugt und beim Wechsel nur sichtbar/unsichtbar geschaltet
  - Garage-Autowechsel nutzt eine gleichzeitige Carousel-Bewegung statt eines Umschaltpunkts
  - Garage-Kamera bleibt vertikal stabil und interpoliert nur weich zum neuen Fokus
- Start aus Garage erzeugt eine neue Run-Scene mit bestaetigtem Fahrzeug
- Garage zeigt owned und locked Fahrzeuge, locked Fahrzeuge sind previewbar und per Coins freischaltbar
- Run-Coins werden nach GameOver einmalig auf `totalCoins` gebucht
- Zurueck aus Garage verwirft Preview und geht ins Menu
- GameOver zeigt Run-Stats im Ergebnis-Panel
- GameOver bietet `Restart` und `Main Menu`
- `Main Menu` nach GameOver setzt die Run-Scene wieder in den Startzustand und macht die Garage wieder erreichbar

Wichtige Dateien:

- `src/app/GameApp.ts`
- `src/engine/rendering/AppScene.ts`
- `src/engine/rendering/RunSceneFactory.ts`
- `src/engine/rendering/GarageSceneFactory.ts`
- `src/engine/audio/ProceduralAudioService.ts`
- `src/engine/assets/ModelFactory.ts`
- `src/engine/assets/MaterialFactory.ts`
- `src/game/garage/GarageShowroomController.ts`
- `src/game/traffic/TrafficTypes.ts`
- `src/game/traffic/TrafficCar.ts`
- `src/game/traffic/TrafficSystem.ts`
- `src/game/traffic/TrafficFairness.ts`
- `src/game/runner/RunnerController.ts`
- `src/game/vehicles/VehicleCatalog.ts`
- `src/game/world/BiomeContent.ts`
- `src/game/progression/SaveData.ts`
- `src/game/progression/SaveDataStore.ts`
- `FEUDAL_JAPAN_ENDLESS_RUNNER_PROMPT.md`
- `GARAGE_MVP_PROMPT.md`
- `GAMEPLAY_NOTES.md`
- `AUDIO_MUSIC_SFX_PLAN.md`
- `GARAGE_SHOP_UNLOCK_PLAN.md`
- `architektur.md`

## Letzte bekannte Verifikation

Letzter erfolgreicher Build:

```bash
npm run build
```

Ergebnis:

- TypeScript sauber
- Vite build erfolgreich
- bekannte Vite-Warnung: Three.js Bundle ist knapp ueber 500 kB

Zuletzt umgesetzt:

- Traffic-/World-MVP wurde erweitert:
  - drei Traffic-Car-Modelle in `ModelFactory`
  - eigene Traffic-Typen und shape-basierte Collider
  - eigenes `TrafficSystem` fuer Bewegung, Recycling, Kollision und Boost-Destruction
  - `BiomeContent` nutzt aktive `trafficRows` statt alter `obstacles`
  - `RunSceneFactory` nutzt `TrafficSystem` statt `ObstacleSystem`
  - Coins werden bei Naehe zu Traffic-Rows nicht direkt in blockierte Lanes gelegt
  - `TrafficFairness` validiert Rows gegen Full-Lane-Blocks, Hazard-Bands und unmoegliche Lane-Wechsel
  - fuer den MVP haben alle Traffic-Cars denselben Speed `5.0`, damit die validierten Rows ueber lange Runs nicht durch Speed-Drift unfair werden
  - Traffic-Rows wurden dichter gesetzt und bleiben validiert
  - Run-Speed nutzt jetzt `baseSpeed`, linearen Frueh-Ramp und spaeteren asymptotischen Ramp bis `maxSpeed`
  - traditionelle Hausmodelle wurden als neue Decoration-Kinds eingebunden
  - Haus-Placements nutzen `rotationY`/`scale`, damit links/rechts zur Strasse ausgerichtete Bebauung moeglich ist
  - Haus-Placements wurden auf 4m Abstand und Skalen um ca. `1.56` bis `1.82` verdichtet
  - Audio-Expertenagent hat `AUDIO_MUSIC_SFX_PLAN.md` und `ProceduralAudioService` erstellt
  - `GameApp` startet Menu-/Garage-/Run-Musik je nach State und triggert SFX ueber `GameEvents`
  - Strassenmarkierungen wurden in `ModelFactory.createGroundSegment()` ergaenzt
  - Torii-Bogenbreite wurde in `ModelFactory.createTorii()` vergroessert, damit die Saeulen ausserhalb der Fahrbahn stehen
  - Settings-Zahnrad mit Audio-Slidern wurde in `GameApp`/`global.css` umgesetzt
  - `GARAGE_SHOP_UNLOCK_PLAN.md` beschreibt Coin-Waehrung, Fahrzeugpreise, locked Garage UI, SaveData-Erweiterungen und Edgecases fuer die naechste KI-Session
  - Fahrzeug-Modeling-Agent hat fuenf neue Unlock-Automodelle in `ModelFactory` vorbereitet:
    - `createSakuraRoadster()`
    - `createKitsuneRally()`
    - `createShogunGTR()`
    - `createOniInterceptor()`
    - `createRyujinHypercar()`
  - Diese fuenf Autos sind noch nicht im `VehicleCatalog`/Shop verdrahtet; das ist Aufgabe der naechsten KI-Session nach `GARAGE_SHOP_UNLOCK_PLAN.md`
  - Performance-Defaults wurden fuer Laptop/Akku gesenkt:
    - `RendererService` Pixelratio-Caps: low `1`, medium `1.25`, high `1.5`
    - Shadows nur noch in `high`
    - Garage-Lichtschatten nur noch in `high`
    - statische Run-Deko nutzt eingefrorene Child-Matrizen

Zusaetzliche Browser-Pruefung in dieser Session:

- vorhandener lokaler Dev-Server auf `http://127.0.0.1:5174/` konnte genutzt werden
- Garage-Button im Menu sichtbar
- Garage-State oeffnet eigene 3D-Garage
- Fahrzeugwechsel zeigt `Aoi Drift Coupe`
- Start aus Garage geht in `countdown` und danach in den Run
- Zurueck aus Garage geht sauber ins Menu
- Desktop- und Mobile-Screenshots zeigten keine Text-/Button-Ueberlaeufe
- lokale Server-Neustartfreigabe wurde nicht erteilt; es wurde der bereits laufende Dev-Server genutzt

Implementierungsreview nach Garage-Basis:

- Architektur-Review: keine Blocker; MVP-Struktur passt. Nacharbeiten empfohlen fuer Lifecycle-Zentralisierung, strengere State-Transitions, spaetere Biome-Injection und Nutzung der Showroom-Kameradaten.
- Edgecase-Review: relevante Bugs gefunden und gefixt:
  - Run-Links/Rechts wieder auf `moveLane(-1)` / `moveLane(1)` korrigiert.
  - `GameApp.update()` liest State nach Input-Transitions neu.
  - Pending GameOver wird nur noch im aktiven Run-`running`-State konsumiert.
  - Globaler Touch-Tap auf die 3D-Flaeche bestaetigt nicht mehr automatisch.
  - Direkte `menu/gameOver -> running` Transitions wurden entfernt.
  - `ServiceRegistry` registriert keine stale RunScene mehr.
  - Garage-Kamera nutzt `VehicleDefinition.showroom.cameraFocusOffset`.
  - Garage-Dispose traversiert die Szene und leert sie.

Zusaetzliche User-Verifikation:

- Der User hat nach dem letzten Content-Gap-Fix einen Lauf getestet und berichtet, dass keine Luecken mehr sichtbar sind.
- Damit ist der Content-Gap aktuell kein Blocker fuer die Garage-Basis.

## Bekannte Probleme

### 1. Content-Gap ist aktuell geloest, Traffic ist aktiv

Status:

- Der User hat getestet: Es gibt keine sichtbaren Luecken mehr.
- `BiomeContent` ist dichter geworden und deckt die aktuelle Loop ausreichend ab.
- Statische Obstacle-Definitionen wurden im aktiven Run durch `trafficRows` ersetzt.
- `TrafficFairness` validiert die aktuelle Loop beim Erstellen der Run-Scene.
- Es gibt noch keinen `WorldContentScheduler`; das ist jetzt kein Muss fuer den naechsten Schritt.

Restrisiko:

- Das Spiel recycelt aktuell feste Listen von Deko, Coins und Traffic-Cars.
- Fuer spaetere Biome, laengere Pattern, dynamische Schwierigkeit oder echte Segmentwechsel kann dieses System wieder zu starr werden.
- Unterschiedliche Traffic-Geschwindigkeiten pro Row sind bewusst gesperrt, bis ein Scheduler Speed-Drift fair aufloesen kann.

Aktueller Zustand:

- `FEUDAL_JAPAN_CONTENT_LOOP_LENGTH = 120`
- Coins: 33 Stueck, Start Z 7, Spacing 3.45
- Traffic-Rows: 9 Rows, bis Z 116
- Traffic-Speed: `5.0` fuer alle Traffic-Cars
- Deko: Torii/Bambus/Laternen plus traditionelle Hausreihen bis fast Loop-Ende
- Hausarten: Machiya, Minka, Nagaya-Rowhouse, Kura-Storehouse
- Haus-Placements stehen links/rechts am Randstreifen, sind zur Strasse gedreht, deutlich groesser und alle 4m gesetzt
- Run-Speed:
  - Start `9.5`
  - frueher linearer Ramp bis `11.9`
  - danach asymptotischer Ramp bis maximal `18.5`
- Audio:
  - `ProceduralAudioService` nutzt Web Audio, keine externen Samples
  - 96-BPM Hip-Hop/Rap-Instrumental ohne Stimme
  - Menu/Garage/Run haben unterschiedliche Music-Modes
  - SFX laufen ueber bestehende `GameEvents`
  - AudioContext wird bei User-Geste ueber `unlock()` entsperrt

Spaeterer technischer Schritt:

- `WorldContentScheduler` oder `TrackContentManager` erst einfuehren, wenn neue Biome, echte Segmentwechsel oder dynamischere Hindernispattern gebraucht werden.
- Bis dahin reicht die aktuelle `BiomeContent`-Loop fuer den MVP.

Akzeptanzkriterium:

- In einem 60-Sekunden-Testlauf gibt es keinen sichtbaren Abschnitt, in dem ausschliesslich Strasse ohne Deko, Coins oder Traffic zu sehen ist.
- Deko darf dichter oder duenner sein, aber die Welt darf nie leer wirken.

### 2. Garage-MVP-Basis ist umgesetzt, Persistenz fehlt noch

Status:

- `garage` ist ein echter Top-Level-State.
- `GarageSceneFactory` baut eine eigene Low-Poly-Garage mit Drehscheibe, Lichtleisten, Torii-Akzent, Reifen und Regal.
- `GarageShowroomController` trennt Preview und bestaetigte Auswahl.
- Confirm ist waehrend `switchingOut`/`switchingIn` gesperrt.
- `GameApp` verwaltet `activeScene`, `runScene` und `garageScene` getrennt.
- Start aus Garage bestaetigt das Preview-Fahrzeug, erzeugt eine neue RunScene und startet den Countdown.
- Escape/Back aus Garage verwirft die Preview und kehrt ins Menu zurueck.

Noch offen:

- Locked/owned UI fuer spaetere Garage-Features.
- Optional: Garage-UI weiter ausbauen, aber ohne Shop-/Upgrade-Feature-Creep.
- Edgecase-Review bei jeder groesseren Garage-/Scene-/Vehicle-Aenderung beibehalten.

Review-Ergebnis zum Garage-MVP-Prompt:

- Fachreview: Prompt ist geeignet, aber Scene-Wechsel, Start aus Garage, UI-Semantik, VehicleCatalog als Source of Truth und Dispose-Regeln mussten geschaerft werden.
- Edgecase-Review: Prompt ist solide, aber harte Regeln fuer Preview vs. bestaetigte Auswahl, Confirm waehrend Animation, Input-Buffer-Clear, Scene-Lifecycle, Resize und Touch-Doppel-Confirm sind Pflicht.
- Beide Reviews wurden in `GARAGE_MVP_PROMPT.md` eingearbeitet.

## Naechste Phasen

### Phase A: Garage-MVP planen und absichern

Ziel:

Der naechste Entwicklungsblock ist die Garage-Basis: ein echter 3D-Showroom mit zwei Autos, Fahrzeugwechsel, Auswahl und Start mit ausgewaehltem Auto.

Status:

- Umgesetzt.
- Build und Browser-Grundflow wurden geprueft.
- Fach-/Edgecase-Review fuer die konkrete Implementierung wurde in dieser Session erneut angefordert.

Vorgehen:

1. `GARAGE_MVP_PROMPT.md` als Umsetzungsgrundlage verwenden.
2. Reviews sind erledigt und eingearbeitet.
3. Bei der Implementierung zuerst Scene-/Lifecycle-Abstraktion bauen.
4. Danach `garage` State und GarageScene.
5. Danach UI und Vehicle-Auswahl.

Nicht tun:

- Keine Shop-/Upgrade-/Tuning-Features in den MVP ziehen.
- Garage nicht in die bestehende `RunSceneFactory` hineinbauen.
- Keine Fahrzeugwerte balancen, bevor Anzeige und Auswahl stabil sind.
- Keine getrennten `Auswaehlen`/`Starten`-Semantiken im MVP vermischen: `Starten` bestaetigt das Preview-Fahrzeug und startet den Countdown.

### Phase B: Scene-Abstraktion vorbereiten

Ziel:

Garage und Run sollen nicht in einer riesigen `GameApp`/`RunSceneFactory` vermischt werden.

Status:

- Umgesetzt mit `src/engine/rendering/AppScene.ts`.
- `GameApp` rendert `activeScene`.
- Run- und Garage-spezifische Methoden bleiben in ihren jeweiligen Scene-Bundles.

Vorgehen:

1. Gemeinsames Interface definieren, z. B. `AppScene`.
2. Run-Scene als `RunSceneBundle` oder `RunScene` benennen.
3. Garage spaeter als `GarageSceneBundle`.
4. `GameApp` rendert aktive Szene statt immer nur `sceneBundle`.
5. `GameApp` haelt Run- und Garage-spezifische Referenzen getrennt.
6. Run-Methoden werden nur auf RunScene aufgerufen.

Skizze:

```ts
export type AppScene = {
  scene: THREE.Scene;
  cameraController: CameraController;
  update(dt: number, elapsed: number, state: GameState): void;
  dispose(): void;
};
```

Run-spezifische Methoden wie `moveLane`, `activateBoost`, `getRunStats`, `consumeGameOver` sollten nicht in das Basisinterface.

Zentrale Lifecycle-Regel:

- Jede aktive Scene wird ueber eine zentrale Methode wie `activateScene(next)` gewechselt.
- Diese Methode setzt `activeScene`, resized die neue Scene und leert den Input-Buffer.
- Dispose-/Ownership-Regeln bleiben aktuell bei den expliziten Scene-Slots (`runScene`, `garageScene`) und sollen bei mehr Top-Level-Szenen weiter zentralisiert werden.

### Phase C: Garage-State einfuehren

Ziel:

Die Garage wird ein echter 3D-Showroom.

Status:

- Umgesetzt.
- `menu -> garage`, `garage -> menu`, `garage -> countdown` sind in der State-Machine erlaubt.

GameState erweitern:

```text
menu -> garage
garage -> menu
garage -> countdown
```

Dateien:

- `src/game/state/GameStateTypes.ts`
- `src/game/state/GameStateMachine.ts`
- `src/app/GameApp.ts`

Wichtig:

- `garage` ist kein normales Pause-Menu.
- `garage` bekommt eigene Input-Regeln.
- Run-Stats sollen im Garage-State nicht angezeigt oder nicht aktualisiert werden.
- `running -> garage` und `paused -> garage` sind im MVP nicht erlaubt.
- `garage -> countdown` baut oder aktiviert vorher die RunScene mit dem bestaetigten Fahrzeug.

### Phase D: Garage-Scene bauen

Ziel:

3D-Garage im Stil eines Racing-Game-Car-Select-Screens.

Status:

- Umgesetzt als MVP.
- Kamera ist fuer schmale Portrait-Viewports mit Pullback angepasst.
- UI-Panel wurde kompakt gehalten, damit das Auto sichtbar bleibt.

Geplante Dateien:

- `src/engine/rendering/GarageSceneFactory.ts`
- `src/game/garage/GarageShowroomController.ts`
- optional `src/game/garage/GarageTypes.ts`

Szene:

- kleine Low-Poly-Garage
- Bodenplattform oder Drehscheibe
- Rueckwand
- Lichtleisten in Tuerkis
- dezente Torii-/Bambus-/Werkstatt-Akzente
- Reifenstapel, Werkzeugregal, Poster oder Banner als Low-Poly-Details
- Auto zentral gross sichtbar

Kamera:

- leicht frontal
- niedrig genug, damit das Auto heroisch wirkt
- nicht zu nah, damit ganze Silhouette sichtbar ist
- kein starker Marketing-Hero, sondern direkt nutzbare Auswahl

Interaktion:

- Links/Rechts: Fahrzeug wechseln
- Confirm/Enter: aktuell angezeigtes Fahrzeug bestaetigen und Run-Countdown starten
- Back/Escape: zurueck ins Menu
- Start aus Garage: Run mit ausgewaehltem Auto

Animation:

- altes Auto gleitet/rotiert seitlich heraus
- neues Auto gleitet auf Plattform
- Eingaben waehrend Wechsel ignorieren oder puffern
- Controller-Zustaende: `idle`, `switchingOut`, `switchingIn`
- `previewVehicleId` und `confirmedVehicleId` bleiben getrennt
- Confirm ist waehrend `switchingOut`/`switchingIn` deaktiviert
- Escape/Back waehrend Wechsel bricht transiente Preview ab und nutzt die zuletzt bestaetigte Auswahl

### Phase E: Vehicle-Auswahl persistieren

Ziel:

Auswahl bleibt nach Restart/Reload erhalten.

Bereits vorbereitet:

- `SaveData.selectedVehicleId`
- `SaveData.unlockedVehicleIds`

Noch noetig:

- Save/load Service oder Progression-Service
- Validation gegen `VehicleCatalog`
- Fallback auf `DEFAULT_VEHICLE_ID`
- UI zeigt locked/owned spaeter

### Phase F: WorldContentScheduler spaeter einfuehren

Ziel:

Das aktuelle `BiomeContent`-Loop-System ist fuer den MVP ausreichend. Wenn spaeter mehrere Biome, wechselnde Track-Segmente oder dynamischere Schwierigkeit kommen, soll ein Scheduler eingefuehrt werden.

Geplanter Scheduler:

1. Fuehrendes Modul: `src/game/world/WorldContentScheduler.ts`
2. Fuellt ein Sichtfenster vor dem Spieler, z. B. `distance + 140`
3. Verwaltet Deko-, Coin- und Traffic-Pools
4. Liest Muster aus `BiomeContent`
5. Verhindert leere Abschnitte, Clustering und unfairen Traffic
6. Ersetzt langfristig die statische Content-Erzeugung in `RunSceneFactory`

### Phase G: Garage erweitern

Erst nach stabiler Basis:

- Unlocks
- Coins ausgeben
- Fahrzeugwerte anzeigen
- Paint/Accent-Farben
- Highscore/Stats pro Auto
- Audio-Feedback
- Controller-Support

### Phase H: Hindernisse durch langsamen Verkehr ersetzen

Ziel:

Alle bisherigen Hindernisse werden durch langsam fahrende normale Autos ersetzt. Der Spieler faehrt schneller als diese Traffic-Cars und muss sie ueber die drei Lanes ueberholen. Es darf nie ein Muster entstehen, bei dem alle drei Lanes gleichzeitig blockiert sind oder ein Spurwechsel physisch unmoeglich wird.

Status:

- Umgesetzt im MVP.
- Build erfolgreich am 2026-06-18 mit `npm run build`.
- Keine Browser-/MCP-Pruefung in dieser Umsetzung, weil der User visuelle Pruefungen selbst schneller uebernimmt.
- 3D-Model-/Gameplay-Experte hat den Plan read-only geprueft.
- Zentrale Expertenhinweise:
  - Traffic-Cars sollen `trackZ += speed * dt` nutzen, damit sie langsamer in Fahrtrichtung fahren.
  - `ObstacleAction` ist semantisch alt; fuer Traffic besser shape-basierte Collider-Daten oder ein eigenes Traffic-System verwenden.
  - Coin-Patterns muessen direkt mit abgesichert werden, damit Coins nicht in blockierte Lanes fuehren.
  - Unterschiedliche Traffic-Speeds koennen in einer statischen Loop ueber lange Runs unfair driften. Deshalb nutzt der MVP einen gemeinsamen Traffic-Speed; unterschiedliche Speeds erst mit Scheduler.

Design-Regeln:

- Keine echten Automarken, keine Logos.
- Low-Poly, kraeftige Farben, passend zur bisherigen Optik.
- Traffic-Cars fahren in derselben Richtung wie der Spieler.
- Traffic-Cars sind deutlich langsamer als der Spieler.
- Der Spieler ueberholt sie durch Spurwechsel.
- Jedes Traffic-Car ist ein starker Fail, wenn man ohne Boost kollidiert.
- Mit Boost darf das Traffic-Car im MVP wie bisher verschwinden; spaeter VFX/Explosion nachziehen.
- Es gibt keine Jump-/Duck-/Sneak-Loesung fuer Traffic-Cars.

Traffic-Car-Modelle:

1. `traffic-kei-hatch`
   - kleines Kei-Car/Hatchback
   - Farbe: sattes Gelb oder Mint
   - grob: Breite 1.35, Hoehe 0.9, Laenge 2.1
   - Collider: x 1.35, y 0.82, z 2.05

2. `traffic-city-sedan`
   - normales Stadtauto/Sedan
   - Farbe: Gruen/Tuerkis oder Weiss mit dunklem Dach
   - grob: Breite 1.55, Hoehe 0.85, Laenge 2.6
   - Collider: x 1.5, y 0.78, z 2.45

3. `traffic-box-van`
   - kompakter Van/Lieferwagen
   - Farbe: Orange/Creme oder Blau
   - grob: Breite 1.5, Hoehe 1.15, Laenge 2.35
   - Collider: x 1.48, y 1.05, z 2.25

Groessen-Regel:

- Lane width ist aktuell `2.4`.
- Traffic-Cars duerfen nicht breiter als ca. `1.5` Collider-x werden.
- Zwischen zwei nebeneinanderliegenden Traffic-Cars soll visuell noch Luft bleiben, aber die Lane muss spielerisch als blockiert gelten.
- Modelle zeigen mit der Front nach `+Z`, so wie spielbare Fahrzeuge.
- Pivot liegt am Boden-/Fahrzeugzentrum.

Technische Zielarchitektur:

Neue Dateien:

- `src/game/traffic/TrafficTypes.ts`
- `src/game/traffic/TrafficCar.ts`
- `src/game/traffic/TrafficSystem.ts`
- `src/game/traffic/TrafficFairness.ts`
- optional spaeter `src/game/traffic/TrafficPatterns.ts`

Bestehende Dateien anpassen:

- `src/engine/assets/ModelFactory.ts`
  - `createTrafficCar(kind)`
  - `createTrafficKeiHatch()`
  - `createTrafficCitySedan()`
  - `createTrafficBoxVan()`
- `src/game/world/BiomeContent.ts`
  - bisherige `obstacles` durch `traffic` oder `trafficRows` ersetzen
- `src/engine/rendering/RunSceneFactory.ts`
  - statt `ObstacleSystem` kuenftig `TrafficSystem` nutzen
- `src/game/obstacles/*`
  - langfristig entfernen oder nur als Legacy behalten, bis Traffic stabil ist

Traffic-Datenmodell:

```ts
export type TrafficCarKind = "traffic-kei-hatch" | "traffic-city-sedan" | "traffic-box-van";

export type TrafficCarPlacement = {
  id: string;
  kind: TrafficCarKind;
  lane: LaneIndex;
  trackZ: number;
  speed: number;
  collider: { centerY: number; width: number; height: number; depth: number };
  patternId: string;
};

export type TrafficRow = {
  trackZ: number;
  cars: Array<{
    kind: TrafficCarKind;
    lane: LaneIndex;
    speed: number;
  }>;
  safeLane: LaneIndex;
};
```

Bewegungsmodell:

- Spieler-Speed aktuell ca. `9.5`.
- Traffic-Speed fuer MVP: alle Traffic-Cars `5.0`.
- Grund: Bei statisch validierten Rows wuerden unterschiedliche Geschwindigkeiten ueber laengere Runs die Abstaende veraendern und potenziell faire Patterns zerstoeren.
- Unterschiedliche Speeds duerfen spaeter erst wieder aktiviert werden, wenn `WorldContentScheduler`/`TrafficPatterns` dynamische Drift pruefen oder Rows als sichere Gruppen neu erzeugen.
- Traffic-Car bewegt sich in Weltkoordinaten nach vorne:

```ts
traffic.trackZ += traffic.speed * dt;
relativeZ = traffic.trackZ - playerDistance;
```

- Dadurch holt der Spieler das langsamere Auto ein.
- Relative Schliessgeschwindigkeit liegt bei ca. `4.5`, also lesbar und ueberholbar.
- Recycling passiert, wenn `relativeZ < -12`.
- Beim Recycling wird das Auto wieder vor dem Spieler platziert. Weil alle Traffic-Cars denselben Speed nutzen, bleiben die validierten Row-Abstaende stabil.

Fairness-Regeln nach Subway-Surfer-Prinzip:

- Nie drei Autos im selben Z-Band.
- Hazard-Band: Autos mit `abs(trackZ delta) < 6` gelten als gleichzeitig blockierend.
- Maximal zwei Lanes pro Row blockiert.
- Jede Row hat mindestens eine `safeLane`.
- Abstand zwischen Traffic-Rows mindestens `12m`.
- Wenn die `safeLane` direkt von links nach rechts oder rechts nach links wechselt, braucht es mindestens `20m` Abstand, damit ein doppelter Spurwechsel moeglich ist.
- Nach einer Doppelblockade muss die naechste Row entweder dieselbe SafeLane behalten oder genug Distanz fuer einen Wechsel geben.
- Keine Coin-Spur darf den Spieler direkt in eine blockierte Lane fuehren.
- Pattern muessen lesbar sein: ein einzelnes Auto, dann zwei Autos, dann wieder ein einzelnes Auto ist besser als dauerhaft dichtes Clustering.
- Im MVP muessen alle Traffic-Cars dieselbe Geschwindigkeit haben. Die Validierung bricht sonst hart ab.
- Erstes Traffic-Car fruehestens bei `z >= 24`.

Aktuelles Pattern fuer 120er Loop:

```text
Z 20:  lane -1, compact, safe lane 0
Z 32:  lanes -1/1, sedan + compact, safe lane 0
Z 44:  lanes -1/0, van + sedan, safe lane 1
Z 56:  lane 0, compact, safe lane 1
Z 68:  lanes -1/1, sedan + van, safe lane 0
Z 80:  lanes 0/1, van + sedan, safe lane -1
Z 92:  lane 1, compact, safe lane -1
Z 104: lanes -1/1, compact + sedan, safe lane 0
Z 116: lanes -1/0, van + compact, safe lane 1
```

Wichtig:

- Das Pattern oben ist die aktuelle validierte MVP-Basis.
- Der Validator prueft die Rows beim Erstellen der Run-Scene und schlaegt bei unfairen Mustern hart fehl.
- Der Abstand vom letzten Spawn zum ersten Spawn des naechsten Loops ist `20 + 120 - 116 = 24`, also fuer das aktuelle Lane-Pattern ausreichend.

Fairness-Validator:

```ts
type SafePathState = {
  possibleLanes: Set<LaneIndex>;
  previousZ: number;
};
```

Regeln fuer `validateTrafficRows(rows)`:

1. Rows nach `trackZ` sortieren.
2. Pro Row `blockedLanes` bilden.
3. Wenn `blockedLanes.size >= 3`, Fehler.
4. `openLanes = lanes - blockedLanes`.
5. Aus vorherigen moeglichen Lanes pruefen:
   - gleiche Lane bleibt moeglich
   - ein Lane-Schritt ist moeglich, wenn Abstand >= `minimumLaneChangeDistance`
   - zwei Lane-Schritte sind moeglich, wenn Abstand >= `doubleLaneChangeDistance`
6. Wenn keine moegliche Lane uebrig bleibt, Fehler.
7. Ergebnis als `possibleLanes` fuer die naechste Row speichern.
8. Mindestens zwei Loops simulieren, damit Loop-Uebergaenge fair bleiben.
9. Alle Traffic-Speeds muessen im MVP identisch sein, damit validierte Abstaende nicht durch Drift kaputtgehen.

Akzeptanzkriterien:

- Es gibt keine alten Bambus-/Stein-/Banner-Hindernisse mehr im Run.
- Im Run erscheinen nur noch Traffic-Cars als Hindernisse.
- Es gibt mindestens drei unterschiedliche normale Auto-Modelle.
- Traffic-Cars fahren langsamer als der Spieler.
- Man kann Traffic-Cars ueber die drei Lanes ueberholen.
- Nie spawnen drei Autos so nebeneinander, dass alle Lanes blockiert sind.
- In einem 60-Sekunden-Test gibt es immer einen sichtbaren und spielbaren Weg.
- Kollision ohne Boost fuehrt zu Game Over.
- Boost laesst Traffic-Cars im MVP verschwinden und der Run geht weiter.
- `npm run build` laeuft ohne Fehler. Stand: erledigt.
- Nach der Dichte-/Speed-/Haus-Erweiterung lief `npm run build` am 2026-06-19 erfolgreich.

Implementierungsreihenfolge:

1. Traffic-Datenmodell in `BiomeContent` planen. Erledigt.
2. Drei Traffic-Car-Modelle in `ModelFactory` bauen. Erledigt.
3. `TrafficCar` und `TrafficSystem` erstellen. Erledigt.
4. Fairness-Validator fuer Traffic-Rows schreiben. Erledigt.
5. `RunSceneFactory` von `ObstacleSystem` auf `TrafficSystem` umstellen. Erledigt.
6. Alte Obstacle-Definitionen aus dem aktiven Run entfernen. Erledigt.
7. Collider und Groessen im Spiel testen. Offen fuer User-Playtest.
8. Coin-Patterns so anpassen, dass sie nicht in blockierte Lanes fuehren. Erledigt im MVP.
9. Optional spaeter: Traffic-Car-Destruction-VFX fuer Boost.

## Garage-Konzept

Die Garage soll sich wie ein kleiner echter Ort anfuehlen, nicht wie ein reines HTML-Menu.

Referenzlogik aus erfolgreichen Rennspielen:

- Auto ist Hauptobjekt, gross und zentral.
- UI ist knapp und darf die Silhouette nicht verdecken.
- Kamera bleibt stabil und hochwertig.
- Fahrzeugwechsel ist smooth und bestaetigt die Auswahl visuell.
- Gesperrte Fahrzeuge koennen spaeter als Silhouette/abgedunkelt erscheinen.
- Ein Auto kann vor dem Start betrachtet werden, ohne gleich in den Run zu gehen.

Umsetzung in bisheriger Optik:

- Low-Poly statt realistisch
- kraeftige Farben
- Tuerkis als Akzent
- feudal-japanische Details bleiben subtil
- keine Logos, keine echten Marken

Aktuelle Fahrzeuge:

1. `sports-car`
   - Display: `Akai Striker`
   - rot
   - flacher Supercar-Keil
   - Standard-Fahrzeug

2. `drift-coupe`
   - Display: `Aoi Drift Coupe`
   - blau
   - kompakter Drift-Coupe
   - Overfender
   - Ducktail
   - zweites Testauto fuer Garage-Switch

## Technische Prioritaeten

Abgeschlossen:

1. Scene-Abstraktion eingefuehrt.
2. Zentrale `activateScene`-Lifecycle-Methode gebaut.
3. `garage` State eingefuehrt.
4. Garage-Scene gebaut.
5. Garage-Showroom-Controller mit `idle/switchingOut/switchingIn` gebaut.
6. Garage-UI angebunden.
7. Vehicle-Auswahl wird beim Start aus Garage in den Run uebernommen.
8. Browser-Grundflow fuer Garage und Run geprueft.

Naechste sinnvolle Reihenfolge:

1. Optional: Biome-Content als Option in die RunScene injizieren, sobald mehr als ein Biome existiert.
2. Garage-UI nur minimal erweitern, z. B. locked/owned Status, wenn wirklich Unlocks eingebaut werden.
3. Police-Car visuell staerker inszenieren, z. B. Sirenenlicht oder Warn-VFX im 10-Sekunden-Fenster.
4. WorldContentScheduler erst spaeter bauen, wenn neue Biome/Segmentwechsel ihn wirklich brauchen.

## Review-Prozess

Ab jetzt soll es fuer groessere Garage-, Scene-, Vehicle- oder State-Aenderungen immer zwei Reviews geben:

1. Fachreview
   - prueft UX, Architektur, MVP-Fokus und Anschluss an bestehende Systeme
   - fuer Garage: Racing-Game-Showroom-Logik ohne Feature-Creep

2. Edgecase-Review
   - prueft State-Transitions
   - prueft Input-Spam
   - prueft Scene-Lifecycle und Dispose
   - prueft Resize
   - prueft ungueltige Vehicle IDs
   - prueft Garage/Run-Input-Verwechslung
   - prueft Mobile UI und schnelle Auswahlbestaetigung
   - prueft bei Traffic-Aenderungen Full-Lane-Blocks, Speed-Drift, Coin-Lanes und Loop-Uebergaenge

Die Ergebnisse muessen vor groesserer Implementierung in `plan.md` oder in einem passenden Prompt-Dokument eingearbeitet werden.

## Akzeptanzkriterien fuer naechsten Meilenstein

Der naechste Meilenstein ist erreicht, wenn:

- `npm run build` ohne Fehler laeuft.
- Ein laengerer Run zeigt keine leeren Nur-Strasse-Abschnitte mehr.
- Start/Restart funktionieren weiterhin.
- Coins und Traffic bleiben sichtbar und kollidierbar.
- `sports-car` bleibt Standardfahrzeug.
- `drift-coupe` ist im Catalog und kann technisch erzeugt werden.
- `GARAGE_MVP_PROMPT.md` ist fachlich und auf Edgecases geprueft.
- GarageScene existiert, ohne `RunSceneFactory` weiter aufzublasen.
- Garage oeffnet aus dem Menu.
- Fahrzeugwechsel in der Garage funktioniert.
- Start aus Garage startet den Run mit dem ausgewaehlten Fahrzeug.
- Zurueck aus Garage geht ins Menu.

Naechster Meilenstein danach:

- Auswahl wird persistent gespeichert und nach Reload wiederhergestellt.

## Hinweise fuer zukuenftige KIs

- Bitte zuerst `plan.md` und `architektur.md` lesen.
- Vor groesseren Edits `src/app/GameApp.ts`, `src/engine/rendering/RunSceneFactory.ts`, `src/game/vehicles/VehicleCatalog.ts` und `src/game/world/BiomeContent.ts` lesen.
- Keine Rueckkehr zu Character-Jump/Slide-Mechaniken.
- Keine echten Auto-Marken oder Logos einbauen.
- Keine grossen Refactors ohne Build.
- Browser-/MCP-Pruefung nicht automatisch als Default verwenden. Der User prueft visuelle Spielaenderungen oft schneller selbst und sagt explizit, wenn eine Browser-/MCP-Pruefung gewuenscht ist.
- `npm run build` bleibt die minimale technische Pruefung nach Codeaenderungen.
