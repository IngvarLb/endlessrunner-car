# Design Overhaul Plan — "Neo-Ukiyo Print" (Claude Design import)

Stand: 2026-06-20 · Quelle: Claude-Design-Projekt `6ad9a379-08ca-4e00-b4ec-fa96caccaa77`, Datei `Feudal Runner.dc.html` (via DesignSync MCP). Dieses Dokument ist die verbindliche Referenz für den UI-Umbau. Die alte Vision (`DESIGN_VISION.md`/`DESIGN_SYSTEM.md`) wird hierdurch **abgelöst**.

Arbeitsmodus: autonom im Projektordner, regelmäßige Git-Commits pro Meilenstein.

---

## 1. Designsystem (aus dem Import destilliert)

### Fonts (Google Fonts)
- **Anton** — Monument-Display (Latein, all-caps, kondensiert). FEUDAL RUNNER, SETTINGS, Auto-Name, Section-Nummern 01/02/03. DAS Hero-Display.
- **Archivo** (500–900) — UI/Body/Buttons/Werte (meist 800–900).
- **Noto Sans JP** (500/700/900) — japanischer Text + Kanji-Akzente in der UI.
- **Shippori Mincho B1** (700/800) — riesige Geister-Kanji im Hintergrund (Mincho-Serif).
- **Space Mono** (400/700) — technische Microcopy (Kicker, N°.0X, Codes, Barcodes).

### Farben
- Paper: `#e9e2d3` (Bühne), `#ddd4c2` (Letterbox), Menu-Radial `#f8f4ec→#ece5d5→#e2d8c5`, Garage-Radial `#f9f5ec→#ece4d4→#ddd2bd`. Chips: `rgba(255,255,255,0.5)`, Cards `#faf6ee`.
- Ink (warm Sumi): `#1a130b`; muted `rgba(26,19,11,.45)`, `#8a7f6a`, `#6f6452`, `#a3987f`, `#9a8e78`.
- Vermillion (Akzent): `#e23b2e`, hover/press `#c92f24`.
- Gold (Wert/Coins): `#c79a3e`.
- Owned/Success: `#2e8b57` / `#3a7a52`.
- Tier-Farben: COMMON `#9a938a` (常), RARE `#4f97bd` (稀), EPIC `#a35fa8` (極), LEGEND `#cf9d2a` (伝).

### Motive / Effekte
- **Geister-Kanji** riesig im BG (Shippori Mincho, ~0.08–0.12 Alpha).
- **Comic-Halftone-Screentone** (radial-gradient Punkte, `mix-blend:multiply`, maskiert) über Geister-Kanji + Display-Wörtern.
- **Mono-Kicker** + `.01`/`N°.0X` + **Barcode**-Striche + **✦**-Dingbat + **`+`-Eckmarken** + **Korn** (feine horizontale Linien).
- **Vertikale Katakana** (`writing-mode:vertical-rl`).
- **Bottom-Strip** (© + Real-Time-3D-Vermerk + Barcode + ✦).
- Akzent-Detail: roter Punkt am Wortende ("RUNNER**.**").

### Typo-Rollen
- MONUMENT: Anton, riesig (Menu 188px, Settings 132px, Auto-Name 54px) — Latein, all-caps, `letter-spacing:-0.01em`, weicher warmer Schatten.
- GHOST: Shippori Mincho B1, 700–820px, niedrige Alpha, im BG.
- KICKER/TECH: Space Mono 700, `letter-spacing:0.3–0.4em`, uppercase, muted ink.
- LABEL/BODY/BUTTON: Archivo 800–900.
- JP-AKZENT: Noto Sans JP 700–900 (Kanji vor Latein, in Akzentfarbe).

---

## 2. Screens (aus dem Import)

### Menu
Paper-Radial + Geister-`走` rechts + Screentone + Ink-Hatch unten-links + Mittellinie (gestrichelt) + Vignette. Top-bar: Hanko-Seal (走 rot) + FEUDAL RUNNER + 封建ランナー; rechts Coin-Chip + LV/XP-Bar + 設-Button. Hero (links): Kicker „道 ENDLESS RUN · 江戸 · .01" + rote Linie, dann **FEUDAL / RUNNER.** (Anton 188px), JP-Untertitel, dann **走 START** (rot) + **車 GARAGE** (ghost-outline) Buttons, dann Stats-Reihe BEST/TIME/RUNS (Mono-Label + Archivo-Wert mit Trennstrichen). Rechts vertikale Katakana. Bottom-Strip.

### Garage (mit 3D-Slot!)
Paper-Radial + Geister-Auto-Kanji rechts. Top-bar: ZURÜCK (戻) + „車庫 · GARAGE / N°.0X · 蔵 SELECT"; rechts Coin + LV/XP + 設.
Mitte: **Anton-Auto-Wort** (z. B. „CRIMSON") rot als Backdrop + Screentone; **Spotlight** (radialer Gold-Verlauf) + **Drehscheibe** (Ellipse, Goldrand, dreht); **[ PLATZHALTER ]-Slot** = **HIER 3D-Auto-Render**. Overlay-Pills: Tier-Pill + Auto-Kanji-Pill. Oben-rechts großes **Auto-Kanji** (Shippori) + Romaji + Tag.
Pfeile ◀ ▶ (links/rechts neben dem Slot). **Links Info-Panel**: Tier-Badge + N°.0X, Auto-Name (Anton 54px), Kanji+Romaji+Tag, **STATS** (速/握/操/力 = SPEED/GRIP/HANDLE/POWER als 10-Segment-Balken in Auto-Farbe), Divider, **DRIVE** (owned) / **UNLOCK · 解放** (afford, schwarz) / **金 不足 · INSUFFICIENT** (locked, disabled) mit Kosten. **Roster-Rail** unten: 7 Karten (Kanji + Name, Tier-Farbstreifen, 鍵 für locked, selektiert = weiß + roter Rahmen).

### Settings (Overlay)
Geister-設 + Screentone. Top: Brand + CLOSE (✕ 閉). Titel **SETTINGS** (Anton 132px) + 設定 + Untertitel. **01 音響 AUDIO** (Master/Music/SFX Slider, accent rot). **02 表示 DISPLAY** (Mute-Toggle, Perf-HUD-Toggle als Pill-Switches). **03 画質 GRAPHICS** (低/中/高 = LOW/MED/HIGH Buttons, aktiv = schwarz). Footer + **DONE · 完了**.

---

## 3. Auto-Daten (aus dem Import — Catalog angleichen)

| # | Kanji | Romaji | Name | Tier | Cost | Color | SPD | GRIP | HND | PWR | Tag |
|---|---|---|---|---|---|---|---|---|---|---|---|
|1|赤|AKA|Crimson Bolt|COMMON|0|#e23b2e|6|5|7|6|江戸 ・ 街道仕様|
|2|藍|AI|Indigo Drift|COMMON|0|#3f6f9e|5|7|6|5|藍染 ・ 夜行型|
|3|桜|SAKURA|Sakura Roadster|RARE|0|#e0738d|7|6|8|6|花見 ・ 限定塗装|
|4|狐|KITSUNE|Kitsune GT|RARE|1200|#e08a2a|8|6|7|8|稲荷 ・ 高速仕様|
|5|将|SHOGUN|Daimyo Coupe|EPIC|3500|#9a5fa6|8|8|6|9|武家 ・ 重装型|
|6|鬼|ONI|Oni Racer|EPIC|6000|#b8332b|9|7|7|9|鬼門 ・ 攻撃的|
|7|龍|RYU|Dragon Zero|LEGEND|12000|#cf9d2a|10|9|9|10|昇龍 ・ 伝説機|

Hinweis: Das sind kosmetische Stats (4 Achsen) — passend zu früherer User-Entscheidung „Stat-Balken vorerst kosmetisch". Catalog bekommt `kanji, romaji, tier, displayName, economy.price, paint, stats{speed,grip,handle,power}, tag`. 3D-Modelle bleiben die bestehenden (sports-car=赤, drift-coupe=藍, sakura-roadster=桜, kitsune-rally=狐, shogun-gtr=将, oni-interceptor=鬼, ryujin-hypercar=龍).

---

## 4. Integration mit 3D (der Kern) — KORRIGIERT 2026-06-20

**Wichtigstes Prinzip (User-Klarstellung):** Die neuen Design-Screens sind **transparente Druck-/Comic-Overlays ÜBER der LIVE-3D-Szene** — sie decken das 3D NICHT mit Papier zu. Der Import (`Feudal Runner.dc.html`) hat einen flachen Papier-Hintergrund + einen „PLATZHALTER"-Slot, weil dort kein echtes 3D lief; im Spiel ist die 3D-Szene der Hintergrund.

- **Menu:** Die **3D-Run-Szene (Spielstart: Torii-Straße + Auto) ist live sichtbar**; darüber liegen Comic-Textur (Screentone/Geister-Kanji/Korn) + die Print-Chrome (Monument-Titel, Top-Bar, START/GARAGE, Stats, Bottom-Strip). KEIN opakes Paper. (✅ bereits umgesetzt: `.fr-bg--menu` ist transparent, nur leichte Vignette/Legibility-Wash; das Spiel scheint durch.)
- **Garage:** Die **3D-Garage (Raum + Auto + Spotlight) bleibt voll sichtbar** als Hintergrund. NUR die darüberliegenden Chrome-Elemente werden das neue Editorial-Design (Top-Bar, linkes Info-Panel mit Stats, Roster-Rail unten, großes Auto-Wort/Kanji). Das Auto wird **NICHT** in einen kleinen Slot geschrumpft — die echte 3D-Garage ist der „Slot". Das **Wort/Kanji hinter dem Auto** (Import-Platzhalter) darf als **2D-Layer über dem 3D** liegen (oder das bestehende 3D-Backdrop-Kanji nutzen).
- **Run:** Vollbild-3D + HUD in neuer Sprache (abgeleitet).
- **Settings:** Overlay über dem Spiel (kann etwas stärker abdunkeln für Lesbarkeit, aber Spiel darf durchscheinen).

**Renderer:** bleibt **Vollbild** und sichtbar in allen States (Menu/Garage/Run). `alpha`/Slot-Placement ist damit **NICHT nötig** — die Screens overlayen einfach. (Step 5 entfällt weitgehend; statt „transparent + Slot" nur sicherstellen, dass die Overlays transparent sind und das 3D nicht verdecken.) Für die Garage ggf. die bestehende 3D-Garage beibehalten/leicht anpassen statt ersetzen — die alte HTML-Chrome (unteres Band/Hanko-Rail/Diegetik-Stencil) wird durch die neue Editorial-Chrome ersetzt.

Responsiv: Der Import nutzt eine fixe 1600×900-Bühne (scale-to-fit). Wir bauen **responsiv/fluid** in derselben Bildsprache (besser für Mobile). Legibility der dunklen Print-Chrome über der hellen 3D-Szene: leichte Wash/Vignette/Text-Schatten wo nötig; Comic-Textur darf gern etwas kräftiger sein, damit sie über dem Spiel sichtbar bleibt (tunable).

---

## 5. Migrationsschritte (Reihenfolge, je Schritt 1 Commit)

1. **Foundation** — Fonts (index.html) + Tokens/Type-Roles/Helfer (screentone, grain, ghost, corner-marks) in `global.css`. ⟵ zuerst
2. **Catalog** — `VehicleCatalog` um kanji/romaji/tier/paint/stats/tag erweitern (Import-Daten); Helfer für Tier-Meta.
3. **UI-Gerüst** — `setupUi` auf getrennte Screen-Container umstellen (menu / garage / settings-overlay / run-hud), state-getrieben; gemeinsame Top-Bar-Bausteine.
4. **Menu-Screen** bauen (kein 3D) — Poster-Layout, verifizieren, commit.
5. **Renderer** auf transparent + per-State-Canvas-Placement umstellen.
6. **Garage-Screen** bauen + 3D-Auto in den Slot integrieren (2D-Spotlight/Drehscheibe/Stats/Roster), alte 3D-Shell entfernen.
7. **Settings-Overlay** bauen (Slider/Toggles/Quality an bestehende SaveData/Config binden; Quality-Switch live).
8. **Run-HUD + Game-Over** in der neuen Sprache ableiten.
9. **Mobile** je Screen kompakt nachziehen.
10. Aufräumen: alte `DESIGN_VISION/SYSTEM`-bezogene tote CSS/DOM entfernen; `plan.md` updaten.

Jeder Schritt: `npm run build` grün + (wo sinnvoll) Screenshot-Check + Git-Commit.

---

## 7. ÜBERGABE-STATUS (Stand 2026-06-20, für neue KI-Session)

Git ist aktiv (`main`). Arbeitsmodus: **autonom im Projektordner, pro Meilenstein committen** (Co-Authored-By-Trailer; nur bei Installationen/Änderungen außerhalb des Ordners nachfragen).

### Erledigt (committed)
- `ba45e13` Baseline (Stand vor Umbau: enthält noch die ALTE 3D-Garage mit Spotlight/Diegetik-Wand-Stencil/Hanko-Rail).
- `cb93334` Step 1 Foundation: `index.html` Fonts (Anton/Archivo/Noto Sans JP/Shippori/Space Mono) + `global.css` `:root`-Tokens (neue Palette).
- `d35aa0e` Step 2 `VehicleCatalog`: neue Felder `kanji/romaji/tier/paint/tag/stats` + `TIER_META`; neue Namen/Kosten; sakura jetzt owned.
- `977972f` Step 3-4 Menu-Screen: `.fr-menu` in `GameApp.setupUi()` (großer innerHTML-Block) + `.fr-*` CSS am Ende von `global.css` + `updateMenuUi()` + Buttons verdrahtet (`.fr-start-action`→start, `.fr-garage-action`→openGarage, `.fr-settings-open`→toggleSettingsPanel). Legacy-UI wird im `menu`-State per CSS ausgeblendet.
- **Step 6 Garage-Screen `.fr-garage` ✅** (dieser Commit): Editorial-Chrome als transparentes Overlay über der LIVE-3D-Garage. Top-Bar (戻 ZURÜCK + 車庫/GARAGE/N°.0X + Coin/LV + 設), **linkes Info-Panel** als helle Washi-Card (Tier-Badge aus `TIER_META`, Auto-Name Anton, Kanji+Romaji+Tag, **Stats-Balken** aus `vehicle.stats` in `vehicle.paint`, Divider, **DRIVE/UNLOCK·解放/金不足·INSUFFICIENT** je nach owned/afford), **Roster-Rail unten** (7 Karten, 鍵 für locked, selektiert = weiß+roter Rahmen, Klick = Direktauswahl), großes **Auto-Wort** (Anton, `vehicle.paint`, center-maskiert damit das 3D-Auto davor liest) + großes **Kanji top-right** (Shippori) als 2D-Layer, ◀▶-Pfeile. Gebunden an `handleGarageMove(±1)`/`startFromGarage()`/`getPreview()`/neu `jumpToVehicle(id)` (Roster). Legacy-Garage-Chrome im `garage`-State per CSS ausgeblendet. **3D-`GarageBackdrop` entfernt** (Datei gelöscht) — das 2D-Chrome besitzt jetzt Wort/Kanji/Tier/Preis; in `GarageSceneFactory` eine schlichte dunkle Rückwand ergänzt, damit das Auto nicht im Void schwebt. Legibility über dem dunklen Spotlight-Raum: helle Cards/Chips + Wash-Vignette + helle Top-/Roster-Labels. Per Screenshot verifiziert (common/epic/legend, Roster-Klick, mobil).

- **Step 7 Settings-Overlay `.fr-settings` ✅** (dieser Commit): Paper-Print-Modal über dem Spiel (3D scheint leicht durch, ~0.95 Papier-Wash für Lesbarkeit). Geister-設 + Screentone, Titel SETTINGS (Anton), **01 音響 AUDIO** (Master/Music/SFX-Slider 0–100 → `updateAudioSettings`), **02 表示 DISPLAY** (Mute → `muted`, Perf-HUD → `showPerfHud` als Pill-Switches), **03 画質 GRAPHICS** (低/中/高 → `saveData.settings.quality`, live via neuem `RendererService.setQuality()` = PixelRatio + Shadows; AA/Power-Pref erst bei nächster Szene/Reload). **`masterVolume` neu in SaveData** (+ Normalisierung/Migration in `SaveDataStore`, durch Audio-Pipeline gezogen). Ersetzt die alte `.settings-panel` (jetzt dauerhaft `hidden`); alle 設-Buttons (Menu/Garage) + die alte Top-Bar-Zahnrad öffnen jetzt `.fr-settings`. Per Screenshot (desktop/garage/mobile) + Funktionstest (Quality/Mute/Perf/Slider persistieren in localStorage) verifiziert.

- **Step 8 Run-HUD + Countdown + Pause + Game-Over ✅** (dieser Commit): abgeleitete Print-Screens über dem Vollbild-3D-Run. `.fr-hud` (running/countdown/paused): META=Distanz als roter Hero-Chip oben-links + 金/×/圧-Micro-Chips + 止-Pause-Button oben-rechts. `.fr-countdown`: zentrales 用意 / READY (Shippori). `.fr-pause`: Scrim + PAUSED-Monument + 続 RESUME / 戻 MENU. `.fr-gameover`: Stempel — 終 RUN COMPLETE + große 走 META-Zahl (Anton) + KOBAN/SCORE-Chips + 再 RESTART / 戻 MAIN MENU. Werte aus `runScene.getRunStats()` (HUD live in `updateStats()`, Game-Over in `updateGameOverUi()`). Legacy `.top-bar`/`.menu-panel`/`.print-frame` in running/countdown/paused/gameOver per CSS ausgeblendet. Buttons gebunden an `pause`/`resume`/`returnToMainMenu`/`start`. Verifiziert: HUD/Pause/Game-Over per Screenshot, Countdown-Overlay per Computed-Style (Screenshot rennt gegen das 720ms-Fenster), Transitionen (countdown→running→gameOver, RESTART→countdown, MAIN MENU→menu) funktional.

### Als Nächstes
**Mobile-Feinschliff je Screen** (v. a. **Garage portrait**: das Info-Panel als Bottom-Sheet verdeckt aktuell das tief stehende 3D-Auto — Panel kompakter/höher oder Portrait-Kamera anheben). Run-HUD/Pause/Game-Over auf Mobile gegenchecken (sollten dank fluid-clamp passen, aber prüfen).

Danach **Aufräumen**: alte `DESIGN_VISION/SYSTEM`-bezogenes totes CSS/DOM entfernen. Alle States sind jetzt von `.fr-*`-Screens abgedeckt → Legacy-DOM (`.top-bar`, `.menu-panel`, `.settings-panel`, `.hanko-rail`, `.garage-balance`, `.print-frame`) + zugehörige `GameApp`-Refs/Updater (`updateMenuUi`/legacy `updateGarageUi`-Teile/`renderHankoRail`/`getStateLabel`/`getActionLabel`/`updateGameOverUi`-innerHTML) und das große Legacy-CSS in `global.css` können raus — vorsichtig pro Commit + Build grün halten, da viele Felder/Methoden noch referenziert sind (tsc strict). `vehicleKanji.ts` erst entfernen, wenn `renderHankoRail` weg ist.

**Garage-Tunables** (falls Look justiert werden soll): `.fr-gword` opacity/Mask + `top` in `global.css`; `.fr-bg--garage::after` Wash-Stärke; Garage-3D-Licht in `GarageSceneFactory.buildLighting()` (dunkler Spotlight-Raum bleibt bewusst). Die `paint`-Farbe ist die Marken-/Chrome-Farbe pro Auto und stimmt nicht zwingend mit der 3D-Modellfarbe überein (z. B. Ryujin-Modell ist türkis, Chrome-`paint` gold) — bewusst.

### Wichtige Dateien
- `src/app/GameApp.ts` — UI-Template (`setupUi`), State-getriebene Sichtbarkeit (`updateUi`), alle Handler. Hier kommen `.fr-garage`/`.fr-settings`/`.fr-hud` rein.
- `src/styles/global.css` — Tokens (`:root`) + `.fr-*`-CSS (am Dateiende). Legacy-CSS davor wird später entfernt.
- `src/game/vehicles/VehicleCatalog.ts` — Auto-Daten + `TIER_META`.
- `src/engine/rendering/RendererService.ts` — alpha/Canvas-Placement (Step 5).
- `src/engine/rendering/GarageSceneFactory.ts` + `GarageBackdrop.ts` — alte 3D-Garage, in Step 6/7 stark vereinfachen/ersetzen.
- `index.html` — Fonts.

### Workflow / Gotchas
- Build: `npm run build` (tsc strict — unbenutzte Felder/Methoden = Fehler, also beim Entfernen aufräumen).
- Visuelle Prüfung: System-Chrome via `puppeteer-core` (bereits `--no-save` installiert). Dev-Server `npm run dev` (Port 5173/5174). Ein Screenshot-Skript-Muster liegt als `garage-shot.mjs` (gitignored) im Ordner; headless-WebGL braucht die Flags `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`.
- Design erneut abrufen: **DesignSync MCP**, `projectId 6ad9a379-08ca-4e00-b4ec-fa96caccaa77`, Datei `Feudal Runner.dc.html` (enthält Menu/Garage/Settings + die `Component`-State mit Auto-Daten). Falls DesignSync Auth braucht: User `/design-login`.
- `.fr-*`-Konventionen: jeder Screen = `<section class="fr-xxx">` absolute inset:0, eigene BG-Layer (`.fr-bg`/`.fr-ghost`/`.fr-screentone`/`.fr-grain`), per CSS nur im passenden `data-state` sichtbar; Legacy-UI im selben State ausblenden.

## 6. Offene Punkte / bewusste Abweichungen
- **LV/XP** existiert im Spiel noch nicht — vorerst Platzhalter (LV aus einer simplen Ableitung von totalCoins/distance) oder ausblenden, bis ein echtes Level-System kommt.
- **BEST/TIME/RUNS** im Menu: BEST/Distance haben wir (SaveData.bestDistance); TIME/RUNS müssten ergänzt werden (oder vorerst Platzhalter/ableiten).
- Auto-Namen ändern sich (Akai Striker → Crimson Bolt etc.) — Catalog-Display-Namen auf Import angleichen.
- Letterbox vs. responsiv: wir gehen responsiv (s. §4).
