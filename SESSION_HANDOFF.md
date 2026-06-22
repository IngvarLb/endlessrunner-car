# Session-Handoff — Feudal Runner (für die nächste KI-Session)

> Stand: 2026-06-22. Diese Datei ist der **Einstiegspunkt** für die nächste Session. Ganz unten steht ein fertiger **Prompt** zum Kopieren.

---

## 1. Was ist das Projekt
- **Feudal Runner** — ein **Three.js / Vite / TypeScript** 3D-Endless-Runner (Auto-Runner im Neo-Ukiyo/Feudal-Japan-Stil). Browser-App, läuft als **installierbare PWA**.
- Ordner: `/Users/ingvar/Documents/Privat/Coding/games/endlessrunner`. Git aktiv (`main`).
- **Repo (public):** https://github.com/IngvarLb/endlessrunner-car · **Live:** https://ingvarlb.github.io/endlessrunner-car/
- **Auto-Deploy:** jeder `git push` auf `main` → GitHub-Actions (`.github/workflows/deploy.yml`) → GitHub Pages. Build-Base ist `/endlessrunner-car/` (in `vite.config.ts`, nur für `build`).

## 2. Aktueller Stand (fertig & live)
- **UI-Overhaul komplett** (Neo-Ukiyo-Print): alle Screens sind `.fr-*`-Overlays über der Live-3D-Szene — Menu, Garage, Settings, Run-HUD, Countdown, Pause, Game-Over. Legacy-UI vollständig entfernt. (Details: `DESIGN_OVERHAUL_PLAN.md`.)
- **PWA installierbar** (Manifest, Service Worker, 走-Hanko-Icons) und **iOS-Vollbild gefixt** (kein schwarzer/weißer Balken, nichts unter der Notch).
- **Garage** feinjustiert (transparentes Panel auf dunklem Raum, Auto im goldenen Schnitt; mobil: Panel oben, Auto unten, Action-Leiste unten; Lucide-Icons; Wisch-Richtung korrekt).
- `npm run build` ist grün.

## 3. Was als Nächstes ansteht — Progression & Fähigkeiten
Das **nächste große Feature** ist das Progressions-/Fähigkeitssystem. Es ist **vollständig durchgesprochen und geplant**, aber **noch nicht gebaut**. Drei Dokumente (in dieser Reihenfolge lesen):
1. **`PROGRESSION_KONZEPT.md`** — das Gesamtsystem + Motivationspsychologie.
2. **`FAEHIGKEITEN_KONZEPT.md`** — die **7 Auto-Fähigkeitspaare** (Main + Passive) mit allen Zahlen.
3. **`UMSETZUNGSPLAN.md`** — **Architektur, UI, Logik, Bau-Reihenfolge** (der eigentliche Bauplan).

**Kernsystem in einem Satz:** Pro Auto **1 Main** (mit Coins gekauft, 30 Ausbaustufen) + **1 Passive** (durch gefahrene Meter, 100 Meisterstufen, linear, voll bei 1.000.000 m). Mains zünden über eine **Ladeleiste** (Temple-Run-Stil) per **eigener Activate-Tap-Zone** (Boost bleibt separat).

**Getroffene Entscheidungen (gelten als gesetzt — siehe `UMSETZUNGSPLAN.md` §9):**
- Aktivierung = eigene Activate-Tap-Zone, nicht die Boost-Taste.
- Garage: die 速/握/操/力-Bars werden durch **Main/Passive-Karten** ersetzt.
- Polizei wird ein eigenes, parametrierbares **`PursuitSystem`**.
- **2D/UI** → über **Claude Design (DesignSync MCP)**; **3D/VFX** (Schwarzes Loch, Nacht, Speedstreifen, Titan, Coin-Partikel, Wracks) → in der Engine.

**Bau-Reihenfolge:** **Phase 0 Fundament** (Datenmodell `vehicleProgress` in `SaveData`, `src/game/abilities/`-Module: Catalog/Mastery/Upgrade/ChargeMeter/RunAbilityController, Garage-Panel mit Karten, HUD-Ladeleiste) → **Phase 1** (die 4 einfachen Paare 赤/藍/桜/狐) → **Phase 2** (Brocken 将/鬼/龍 + PursuitSystem/Nacht/Loch) → **Phase 3** (Juice/Tuning).

> **Wichtig:** Der User gibt **pro Schritt das „Go"**. Nicht ungefragt drauflosbauen — erst klären/abstimmen, dann bauen. Beim Start von Phase 0 vorab die **2D-Anzeigen (Ladeleiste, Extra-Fail-Indikator, Main/Passive-Karten) in Claude Design entwerfen**.

## 4. Wichtige Dateien (Codebase)
- `src/app/GameApp.ts` — Orchestrierung: UI-Template (`setupUi`, großer innerHTML-Block), State-Maschine-Anbindung, Input, alle Handler. Hier hängt das Ability-System in den Run-Loop.
- `src/styles/global.css` — Tokens (`:root`) + alle `.fr-*`-Screens. (Safe-Area-/Vollbild-Regeln oben; `.fr-*` unten.)
- `src/game/vehicles/VehicleCatalog.ts` — die 7 Autos (kanji/tier/paint/economy/stats…).
- `src/game/progression/SaveData.ts` + `SaveDataStore.ts` — Persistenz (hier kommt `vehicleProgress` rein, normalisiert).
- `src/engine/rendering/RunSceneFactory.ts` (`RunScene`) — der Run; `src/game/traffic/TrafficSystem.ts`, `src/game/runner/RunnerController.ts` — Verkehr/Spieler/Fails/Polizei (Integrationspunkte).
- `src/engine/rendering/GarageSceneFactory.ts` — 3D-Garage; `RendererService.ts`, `InputManager.ts` — Renderer/Kamera/Input.
- Neu: `src/game/abilities/…` (siehe `UMSETZUNGSPLAN.md` §3).

## 5. Workflow & Gotchas
- **Autonom im Projektordner** arbeiten; nur bei Installationen/Änderungen außerhalb des Ordners nachfragen.
- **Nach jedem logischen Schritt committen** (Trailer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`), dann `git push` → deployt automatisch. Bei neuem Release **`public/sw.js` `CACHE_VERSION` bumpen** (v4 aktuell), damit installierte PWAs den neuen Stand ziehen.
- **Build grün halten:** `npm run build` (tsc strict — unbenutzte Felder/Methoden = Fehler).
- **Visuelle Prüfung:** System-Chrome via `puppeteer-core` (schon installiert, keine neue Dependency). Chrome-Pfad `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; headless-WebGL-Flags `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. Muster: `garage-shot.mjs` (gitignored). **Echte** Klick-Verifikation mit `page.click()` (nicht `el.click()` — das umgeht `pointer-events`!). Temp-Skripte als `_*.mjs` (gitignored).
- **Achtung pointer-events:** `.game-ui` ist `pointer-events:none`; jeder interaktive `.fr-*`-Screen-Root muss `pointer-events:auto` setzen (sonst tote Buttons).
- **Design (2D):** **Claude Design via DesignSync MCP**, projectId `6ad9a379-08ca-4e00-b4ec-fa96caccaa77` (Datei `Feudal Runner.dc.html` = Menu/Garage/Settings). Für die Ability-UI dort **neue HUD-/Karten-Designs anlegen**. Falls Auth nötig: User bitten, **`/design-login`** auszuführen. 3D macht Claude Design **nicht**.
- **Deploy-Status prüfen** (public Repo, ohne `gh`): `curl -s "https://api.github.com/repos/IngvarLb/endlessrunner-car/actions/runs?per_page=1"`.
- **Git:** `gh` ist NICHT installiert; plain `git` über den macOS-Keychain-Credential. Netzwerk-Bash ggf. mit `dangerouslyDisableSandbox`.

## 6. Offene Detail-Punkte (vor/während Phase 1 zu tunen)
- Konkrete **Coin-/Upgrade-Kosten-Kurve** und **Ladekosten** final festzurren (Startwerte in `UMSETZUNGSPLAN.md` §7).
- Run-Schwierigkeit (Tempo ↑, Verkehr ↑ mit der Zeit) muss mit den starken Autos zusammen gebalanced werden.
- Tap-to-Lift-Raycast (鬼), VFX-Performance Mobile, Coin-Regen-aufs-Gelände sauber trennen (§9 Restrisiken).

---

## 7. PROMPT für die nächste Session (kopieren)

```
Wir arbeiten am Spiel in /Users/ingvar/Documents/Privat/Coding/games/endlessrunner
(Three.js/Vite/TS Endless-Runner, „Feudal Runner"). Das Spiel ist als installierbare
PWA live auf GitHub Pages (Repo: github.com/IngvarLb/endlessrunner-car, jeder push auf
main deployt automatisch).

Lies zuerst SESSION_HANDOFF.md (komplett), dann UMSETZUNGSPLAN.md, FAEHIGKEITEN_KONZEPT.md
und PROGRESSION_KONZEPT.md. Das UI ist bereits komplett überarbeitet (Neo-Ukiyo-.fr-*-
Overlays über der Live-3D-Szene) — Referenz dafür ist DESIGN_OVERHAUL_PLAN.md.

Nächste Aufgabe: das geplante PROGRESSION-/FÄHIGKEITSSYSTEM umsetzen. Das Konzept ist
fertig durchgesprochen (siehe die drei Dokumente), die Entscheidungen stehen
(UMSETZUNGSPLAN.md §9). Pro Auto: 1 Main (Coins, 30 Ausbaustufen) + 1 Passive (Meter,
100 Meisterstufen, linear). Ladeleiste (Temple-Run-Stil) + eigene Activate-Tap-Zone.
Garage-Stat-Bars werden durch Main/Passive-Karten ersetzt. Polizei = eigenes PursuitSystem.

Beginne mit PHASE 0 (Fundament: vehicleProgress in SaveData, src/game/abilities/-Module,
Garage-Panel mit Karten, HUD-Ladeleiste) — aber NUR nach meinem Go pro Schritt, nicht
ungefragt drauflosbauen. Für alle 2D-/UI-Anzeigen die Optik über Claude Design (DesignSync
MCP, projectId 6ad9a379-08ca-4e00-b4ec-fa96caccaa77) entwerfen und mit dem Spiel abstimmen;
3D/VFX macht die Engine. Falls DesignSync Auth braucht, sag mir, dass ich /design-login
ausführen soll.

Arbeitsweise: autonom im Projektordner; nur bei Installationen/Änderungen außerhalb
nachfragen. Nach jedem logischen Schritt committen (Co-Authored-By-Trailer) und pushen
(deployt automatisch); bei Release public/sw.js CACHE_VERSION bumpen. npm run build grün
halten (tsc strict). Visuell verifizieren via puppeteer-core (echte page.click(), Flags
--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader, Muster garage-shot.mjs,
Temp-Skripte _*.mjs). Achtung: .fr-*-Screen-Roots brauchen pointer-events:auto.

Fang an, indem du den aktuellen Stand bestätigst und mir einen konkreten Phase-0-Schnitt
vorschlägst, auf den ich mein Go geben kann.
```
