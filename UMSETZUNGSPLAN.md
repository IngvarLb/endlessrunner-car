# Umsetzungsplan — Progression & Fähigkeiten (Feudal Runner)

> Status: **Planung** (Stand 2026-06-22). Noch nichts gebaut — erst Plan, dann gestaffelt umsetzen.
> Bezug: [PROGRESSION_KONZEPT.md](PROGRESSION_KONZEPT.md) · [FAEHIGKEITEN_KONZEPT.md](FAEHIGKEITEN_KONZEPT.md).

---

## 1. Ziel & Scope

Wir bauen **zwei Fortschritts-Tracks pro Auto** (Main via Coins, Passive via Meter) + eine **Ladeleiste** (Temple-Run-Stil) + die **7 Fähigkeitspaare** + die nötigen **HUD-/Garage-Anzeigen**. 2D-Design läuft über **Claude Design**, 3D/VFX über die Engine.

**Leitprinzip Architektur:** Die Fähigkeiten sind **Daten + austauschbare Effekt-Module** — nicht in Run-Code „eingenäht". Ein zentraler `RunAbilityController` orchestriert pro Run; jeder Effekt ist ein kleines Modul mit klarem Interface; die bestehenden Run-Systeme (Traffic, Fail/Polizei, Coins, Kamera) bekommen **Hooks**, die die Effekte ansteuern.

---

## 2. Datenmodell

### 2.1 `SaveData` erweitern ([SaveData.ts](src/game/progression/SaveData.ts))
```ts
vehicleProgress: Record<string /*vehicleId*/, {
  meters: number;     // kumulierte Meter mit diesem Auto → Meisterstufe
  mainLevel: number;  // gekaufte Ausbaustufe der Main (0–30)
}>;
```
- **Meisterstufe** wird daraus berechnet (nicht gespeichert): `min(100, floor(meters/10000))`.
- Normalisierung/Migration in [SaveDataStore.ts](src/game/progression/SaveDataStore.ts) (fehlend → `{}`, je Auto Default `{meters:0, mainLevel:0}`, Zahlen klemmen).
- `totalCoins` (existiert) bleibt die Coin-Währung für Käufe.

### 2.2 Fähigkeits-Definitionen — neu `src/game/abilities/AbilityCatalog.ts`
Reine Daten, nach `vehicleId` gekeyt:
```ts
type MainAbilityDef = {
  id; name; kanji;
  effect: EffectKey;          // "boostRam" | "hornClear" | "coinRain" | "titan" | "nightHunt" | "blackHole" | "hyperspeed"
  durationBase; durationStep; // s; Stufe 0..30 → base + level*step
  chargeCost: ChargeTier;     // low | midLow | mid | midHigh | high
  params?: Record<string, number>; // effekt-spezifisch (z. B. coinRain dichte/level)
};
type PassiveAbilityDef = {
  id; name; kanji;
  effect: PassiveKey;         // "crumpleZone" | "highBeam" | "piggyBank" | "secondLife" | "daredevil" | "siphon" | "tooFast"
  base; max;                  // linear über Meisterstufe 0..100
};
```
> **Entschieden:** Die 速/握/操/力-Bars werden in der Garage **durch die Main/Passive-Karten ersetzt**. Das `stats`-Feld im [VehicleCatalog.ts](src/game/vehicles/VehicleCatalog.ts) ist dann mechanisch ungenutzt — kann als Datenrest bleiben oder später raus.

---

## 3. Code-Architektur (neue Module)

```
src/game/abilities/
  AbilityCatalog.ts        // Daten: 7 Mains + 7 Passives
  AbilityTypes.ts          // Typen, EffectKey/PassiveKey
  MasteryService.ts        // meters→level, passiveValue(def,level), metersToNext()
  UpgradeService.ts        // mainUpgradeCost(level), mainDuration(def,level), purchase(save)→save
  ChargeMeter.ts           // add(), ratio(), isReady(), consume()
  RunAbilityController.ts  // Orchestrierung pro Run (Herzstück)
  RunEffectContext.ts      // Schnittstelle zu den Run-Systemen
  effects/
    BoostRamEffect.ts  HornClearEffect.ts  CoinRainEffect.ts
    TitanEffect.ts     NightHuntEffect.ts  BlackHoleEffect.ts  HyperspeedEffect.ts
```

### 3.1 `RunAbilityController` — Verantwortung
- Hält für das **aktive Auto**: Main-Def + `mainLevel`, Passive-Def + `meisterLevel` (aus `meters`), die `ChargeMeter`, den **aktiven Effekt** (eine `RunEffect`-Instanz) + Rest-Timer, den **Extra-Fail-Buffer** (赤).
- **Events rein:** `onCoinCollected(n)`, `onWeakFail()→FailOutcome`, `onFatalHit()→HitOutcome`, `onActivateInput()`, `onTapCar(car)`, `update(dt, speed)`.
- **State raus (fürs HUD):** `chargeRatio`, `activeEffect?{name,remaining}`, `bufferReady`, `meisterLevel`, `leveledUpThisFrame`.
- Akkumuliert `runMeters += dt*speed`; daraus Meisterstufe live (für Level-Up-Toast); am Run-Ende wird `runMeters` auf `save.vehicleProgress[id].meters` gebucht.

### 3.2 `RunEffect`-Interface (jede Main ein Modul)
```ts
interface RunEffect {
  start(ctx: RunEffectContext, opts: { durationSec: number; level: number }): void;
  update(dt: number, ctx: RunEffectContext): void;  // läuft bis Dauer abgelaufen
  end(ctx: RunEffectContext): void;
  onTapCar?(car: TrafficCarRef, ctx: RunEffectContext): void; // nur 鬼
}
```

### 3.3 `RunEffectContext` — Brücke zu den Run-Systemen
Bündelt, was Effekte brauchen, ohne dass sie die Systeme direkt kennen:
```ts
traffic: { destroyLane(); clearLane(lane); redistribute(rightBias); enableLateralRam(on); liftCar(car); nearestCars(n); leaveWreck(car); }
coins:   { spawnRain(densityPerLevel); creditAccount(n); magnet(radius); }
player:  { setScale(s); setInvincible(on); }
camera:  { setFov(deg); }
scene:   { setNight(on); blackHoleVfx(on); speedLines(on); }
pursuit: { trigger(durationSec); isActive(); remaining(); setWindow(sec); }
```

---

## 4. Integration in bestehende Systeme (Hooks)

| System (Datei) | Neue Hooks |
|---|---|
| **TrafficSystem** ([TrafficSystem.ts](src/game/traffic/TrafficSystem.ts)) | `destroyInLane`, `clearMiddleLane`, `redistribute(rightBias)`, `enableLateralRam`, `liftCar`/`leaveWreck`, `nearestCars`, `coinDropOnRam`, `siphonCoins(while pursuit)` |
| **Runner/Fail** ([RunnerController.ts](src/game/runner/RunnerController.ts)) | Weak-Fail/Fatal-Hit **durch den AbilityController routen** (Buffer/Coins/2.Leben/Polizei-Fenster entscheiden) |
| **Pursuit/Polizei** (heute im Run, wird zu `PursuitSystem`) | `trigger(durationSec)`, `isActive()`, `remaining()`, parametrierbares Verlier-Fenster (将/鬼/龍 hängen dran) |
| **Coins/Spawner** ([BiomeContent.ts](src/game/world/BiomeContent.ts) / RunScene) | Coin-Regen-Modus (auch aufs Gelände), Magnet, „Konto-Gutschrift" für 鬼-Stream |
| **Renderer/Kamera** ([RendererService.ts](src/engine/rendering/RendererService.ts), CameraController) | FOV-Änderung (龍), Nacht-Tint (将), Schwarzes-Loch-/Speedline-Overlay (鬼/龍) |
| **Input** ([InputManager.ts](src/engine/input/InputManager.ts)) | **„Activate"** = eigene Tap-Zone/Button (getrennt vom Boost) zündet die Fähigkeit; „TapCar" (Pointer→Raycast auf Traffic, nur 鬼) |
| **GameApp** ([GameApp.ts](src/app/GameApp.ts)) | AbilityController in den Run-Loop hängen; Meter am Run-Ende buchen; HUD-Updates; Garage-Upgrade-Käufe |

---

## 5. UI-Elemente

### 5.1 Garage — Fähigkeits-Panel *(2D · Claude Design)*
Ersetzt/ergänzt den heutigen Stats-Block ([.fr-gpanel]):
- **Main-Karte:** Kanji/Icon · Name · aktuelle Dauer (z. B. „BOOST 4,2 s") · **Ausbaustufe X/30** · **Upgrade-Button** mit Coin-Kosten der nächsten Stufe.
- **Passive-Karte:** Kanji/Icon · Name · aktueller Wert · **Meisterstufe X/100** · Fortschrittsbalken + „noch Y m bis Level N+1".
- Tier-Badge bleibt. **Ersetzt die bisherigen 速/握/操/力-Bars vollständig.**
- **Activate-Element** im HUD: eigene Tap-Zone/Button (getrennt vom Boost), zündet die Fähigkeit bei voller Ladeleiste.

### 5.2 Run-HUD *(2D · Claude Design + 3D · Engine)*
- **2D:** **Ladeleiste** (füllt sich, leuchtet bei voll) · **Extra-Fail-Indikator** (赤) · **Aktive-Fähigkeit-Chip** (Icon + Restsekunden) · **Level-Up-Toast**. Sitzt unten (über der Safe-Area).
- **3D (Engine):** die Effekt-Optik selbst — Schwarzes Loch (lila), Nacht-Tint, Speedstreifen, Titan-Skalierung, Coin-Regen-Partikel, Wracks, Coin-Streams.

### 5.3 Store
- **Main-Upgrades passieren im Garage-Panel** (kein eigener Ability-Store nötig). Der breitere Store (Autos/Kosmetik) ist ein **separates, späteres** Thema.

---

## 6. Logik-Flows

1. **Meter/Meisterschaft:** je Frame `runMeters += dt*speed`; bei Run-Ende `save.vehicleProgress[id].meters += runMeters`; Level = `floor(meters/10000)` (cap 100). Level-Up im Run → Toast.
2. **Aufladen:** je eingesammeltem Coin (+ etwas Distanz/Near-Miss) `ChargeMeter.add()`; bei `isReady()` leuchtet die Leiste.
3. **Zünden:** **eigene Activate-Tap-Zone** (getrennt vom Boost) → wenn Leiste voll: Effekt `start()` (Dauer = `mainDuration(def, mainLevel)`), Leiste `consume()`. Effekt `update()` bis Dauer aus → `end()`. **Boost bleibt unabhängig** die normale Boost-Aktion (man kann boosten *und* die Fähigkeit aufsparen).
4. **Weak-Fail:** → `AbilityController.onWeakFail()` entscheidet: 赤 Buffer fängt ab (verbraucht, lädt nach) · 桜 zieht Coins ab · 龍 verkürzt Polizei-Fenster · sonst Standard (2. Fail im Fenster = aus).
5. **Tödlicher Treffer:** → `onFatalHit()`: 狐 verbraucht 2. Leben & überlebt; sonst Game-Over.
6. **Kauf:** Garage-Upgrade-Klick → `UpgradeService.purchase` (Coins abziehen, `mainLevel++`), speichern, Panel neu rendern.

---

## 7. Balance-Zahlen (Startwerte, tunebar)

- **Meisterstufe:** +1/10.000 m, Max 100 @ 1.000.000 m. Passives linear (Endpunkte je Auto in [FAEHIGKEITEN_KONZEPT.md](FAEHIGKEITEN_KONZEPT.md)).
- **Main-Dauer:** 30 Ausbaustufen, Werte je Auto (Doc).
- **Upgrade-Kosten (Main):** eskalierend, z. B. `kosten(stufe) ≈ 100 · stufe^1,6` → Stufe 1 ~100 金, Stufe 30 ~5.000 金, gesamt ~45.000 金 pro Auto. (Coin-Senke fürs Spätspiel.)
- **Ladekosten (Coins bis voll):** low ~150 · midLow ~220 · mid ~300 · midHigh ~400 · high ~550 (relativ; Loop-Schutz bei 桜/鬼 = über Distanz statt eigene Coins).

---

## 8. Bau-Reihenfolge (Phasen)

- **Phase 0 — Fundament (keine sichtbaren Effekte):** `vehicleProgress` in SaveData; AbilityCatalog; Mastery-/Upgrade-/ChargeMeter-Services; `RunAbilityController`-Gerüst; Meter-Akkumulation + Buchung; **Garage-Panel** (Main/Passive-Karten, Upgrade-Kauf, Meisterstufe-Balken); **HUD-Ladeleiste** (Dummy). → Tracks + Wirtschaft + UI stehen.
- **Phase 1 — Einfache Paare** (reuse bestehender Systeme): 赤 (Boost-Ram + Knautschzone) · 藍 (Hupe + Lichthupe) · 桜 (Blütenregen + Sparbüchse) · 狐 (Titan + 2. Leben). Brauchen: Traffic-Destroy/Lane-Clear, Coin-Spawn, Player-Scale, Extra-Life, Weak-Fail-Hooks.
- **Phase 2 — Brocken:** `PursuitSystem` ausbauen; 将 (Nachtjagd + Draufgänger) · 鬼 (Schwarzes Loch: Tap-Raycast + Coin-Stream + VFX, + Anzapfen) · 龍 (Überschall: FOV/Stripes/Spur-Umverteilung + Zu-schnell).
- **Phase 3 — Juice/Tuning:** VFX-Politur, Indikator-Design (Claude Design), Balancing, Performance (Mobile).

Jede Phase: `npm run build` grün + Screenshot-Check + Commit.

---

## 9. Entscheidungen & technische Restrisiken

**Entschieden:**
- **Aktivierung:** eigene **Activate-Tap-Zone** (getrennt vom Boost) — Boost bleibt Boost, Fähigkeit ist aufsparbar.
- **Garage:** 速/握/操/力-Bars werden **durch Main/Passive-Karten ersetzt**.
- **Polizei:** wird als eigenes, parametrierbares **`PursuitSystem`** sauber ausgebaut (trägt 将/鬼/龍).

**Technische Restrisiken (im Bau zu lösen):**
1. **Tap-to-Lift (鬼):** Pointer→Raycast auf Traffic-Meshes — Performance + Treffsicherheit auf Mobile.
2. **VFX-Performance** (Partikel, Nacht-Tint, Speedlines, Loch) auf Mobile-GPUs.
3. **Coin-Regen aufs Gelände:** Coins neben der Straße schön zeigen, aber **nur auf dem Fahrweg** einsammelbar — sauber trennen.
