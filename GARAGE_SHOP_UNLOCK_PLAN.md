# Garage Shop und Vehicle Unlock Plan

Stand: 2026-06-19

Implementierungsstatus: umgesetzt am 2026-06-19. Der Plan bleibt als Referenz fuer Shop-/Unlock-Regeln und Edgecases erhalten.

Dieses Dokument ist als Uebergabeplan fuer eine neue KI-Session gedacht. Ziel ist ein kleines, robustes Garage-Shop-System: Spieler sammeln Coins im Run, sehen in der Garage auch gesperrte Autos, koennen Coins ausgeben, Autos freischalten und danach mit ihnen starten.

## Kurzstatus im Projekt

Aktuell vorhanden:

- `GameApp` verwaltet `menu`, `garage`, `countdown`, `running`, `paused`, `gameOver`.
- `GarageSceneFactory` baut eine eigene 3D-Garage.
- `GarageShowroomController` zeigt aktuell nur die von `getUnlockedVehicles()` gelieferten Fahrzeuge.
- `VehicleCatalog` enthaelt aktuell nur `sports-car` und `drift-coupe`, beide `owned`.
- `SaveData` enthaelt bereits:
  - `totalCoins`
  - `selectedVehicleId`
  - `unlockedVehicleIds`
  - Audio/Quality Settings
- Coins werden im Run gesammelt und im Run-Score gezaehlt, aber `totalCoins` wird noch nicht nach einem Run persistent erhoeht.
- Settings-Zahnrad existiert und kann Musik/SFX/Mute steuern.
- Audio laeuft ueber `ProceduralAudioService` und `GameEvents`.

Aktuelle zentrale Dateien:

- `src/app/GameApp.ts`
- `src/game/vehicles/VehicleCatalog.ts`
- `src/game/progression/SaveData.ts`
- `src/game/progression/SaveDataStore.ts`
- `src/engine/rendering/GarageSceneFactory.ts`
- `src/game/garage/GarageShowroomController.ts`
- `src/game/garage/GarageTypes.ts`
- `src/engine/assets/ModelFactory.ts`
- `src/styles/global.css`

## Zielbild

In der Garage sieht der Spieler alle Autos:

- Owned Autos:
  - normal sichtbar
  - Start-Button startet mit diesem Auto
  - Status zeigt `Owned`

- Locked Autos:
  - ebenfalls als 3D-Modell sichtbar
  - optisch als gesperrt erkennbar, z. B. dunkleres Overlay, Lock-Label, Preistext
  - Starten ist nicht moeglich
  - Button wird zu `Unlock`
  - Preis wird angezeigt
  - Bei genug Coins kann gekauft werden
  - Bei zu wenig Coins bleibt Button disabled oder zeigt `Need X`

Coins sind die Shop-Waehrung:

- Im Run gesammelte Coins werden nach GameOver oder Run-Ende auf `saveData.totalCoins` addiert.
- Coins muessen nicht bei jedem einzelnen Coin sofort gespeichert werden; sicherer MVP: Beim GameOver die Run-Coins einmal addieren.
- Spater optional: auch bei `Main Menu`/Pause-Abbruch addieren, aber das braucht Anti-Duplicate-Schutz.

## Vehicle-Katalog erweitern

`VehicleCatalog.ts` soll von einem reinen Owned-Filter zu einer Source of Truth fuer Shop-Daten werden.

Empfohlene Typen:

```ts
export type VehicleUnlockState = "owned" | "locked";

export type VehicleEconomy = {
  price: number;
  tier: "starter" | "street" | "sport" | "elite" | "legend";
};

export type VehicleDefinition = {
  id: string;
  displayName: string;
  modelKey: VehicleModelKey;
  unlockState: VehicleUnlockState;
  economy: VehicleEconomy;
  run: {
    scale: number;
    forwardRotationY: number;
    bounds: VehicleBounds;
  };
  showroom: {
    scale: number;
    cameraFocusOffset: Vec3Like;
  };
};
```

MVP-Regel:

- Starter-Autos haben `price: 0` und `unlockState: "owned"`.
- Neue Shop-Autos haben `unlockState: "locked"`.
- Ob ein Auto wirklich owned ist, ergibt sich aus:
  - `vehicle.unlockState === "owned"` oder
  - `saveData.unlockedVehicleIds.includes(vehicle.id)`.

Neue Helper:

```ts
export function getAllVehicles(): VehicleDefinition[];

export function isVehicleOwned(vehicle: VehicleDefinition, unlockedVehicleIds: string[]): boolean;

export function getVehiclePrice(vehicle: VehicleDefinition): number;

export function canAffordVehicle(vehicle: VehicleDefinition, totalCoins: number): boolean;
```

Bestehende Helper anpassen:

- `getUnlockedVehicles()` darf fuer alte Pfade bleiben, sollte aber intern `isVehicleOwned()` nutzen.
- `resolveVehicleId()` darf locked IDs nicht als selected zulassen.
- `getDefaultUnlockedVehicleIds()` liefert nur Starter/owned Autos.

## Vorgeschlagene Preisstaffel

Die Werte sind bewusst MVP-tauglich und koennen spaeter im Balancing angepasst werden.

```text
Akai Striker        owned      0
Aoi Drift Coupe    owned      0
Sakura Roadster     street     350
Kitsune Rally       sport      850
Shogun GTR          sport      1600
Oni Interceptor     elite      2800
Ryujin Hypercar     legend     5000
```

Design-Regel:

- Je teurer, desto auffaelliger und hochwertiger muss das Modell wirken.
- Teure Autos sollen im Showroom begehrenswert aussehen, auch wenn locked.
- Keine echten Marken, keine Logos.

## SaveData erweitern

Aktuell:

```ts
totalCoins: number;
unlockedVehicleIds: string[];
selectedVehicleId: string;
```

Das reicht fuer den MVP. Wichtig ist aber, neue Store-Funktionen zu ergaenzen:

```ts
export type UnlockVehicleResult =
  | { ok: true; saveData: SaveData; vehicleId: string }
  | { ok: false; reason: "already-owned" | "not-found" | "not-enough-coins"; saveData: SaveData };

export function addRunCoins(amount: number, current?: SaveData): SaveData;

export function unlockVehicle(vehicleId: string, current?: SaveData): UnlockVehicleResult;
```

Regeln fuer `unlockVehicle`:

1. Fahrzeug im Catalog suchen.
2. Wenn nicht gefunden: `not-found`.
3. Wenn bereits owned: `already-owned`.
4. Preis aus Catalog lesen.
5. Wenn `totalCoins < price`: `not-enough-coins`.
6. Sonst:
   - `totalCoins -= price`
   - `unlockedVehicleIds` um `vehicleId` erweitern
   - optional `selectedVehicleId = vehicleId`, aber nur wenn UX gewuenscht
   - `saveSaveData(next)`

Wichtig:

- `unlockedVehicleIds` muss eindeutig bleiben.
- `totalCoins` darf nie negativ werden.
- Speichern immer ueber `saveSaveData()`, damit Normalisierung greift.

## Coins nach Run speichern

`GameApp` hat `lastRunStats`.

Beim Uebergang `running -> gameOver`:

```ts
this.lastRunStats = this.runScene.getRunStats();
this.saveData = addRunCoins(this.lastRunStats.coins, this.saveData);
```

Edgecase:

- Coins duerfen pro Run nur einmal addiert werden.
- `lastRunStats` oder eine neue Flag wie `runRewardsClaimed` nutzen.
- Bei `restart()` oder `beginCountdown()` Flag zuruecksetzen.

Empfohlene Felder in `GameApp`:

```ts
private runRewardsClaimed = false;
```

Beim Start/Restart:

```ts
this.runRewardsClaimed = false;
```

Beim GameOver:

```ts
if (!this.runRewardsClaimed) {
  this.saveData = addRunCoins(stats.coins, this.saveData);
  this.runRewardsClaimed = true;
}
```

## Garage mit locked Autos

Aktuell:

```ts
const vehicles = getUnlockedVehicles(unlockedVehicleIds);
```

Soll:

```ts
const vehicles = getAllVehicles();
```

`GarageSceneFactory.create()` braucht zusaetzlich:

- `saveData.totalCoins`
- `unlockedVehicleIds`

Oder sauberer:

```ts
GarageSceneFactory.create(
  config,
  models,
  materials,
  selectedVehicleId,
  saveData
)
```

Aber nicht zu viel Verantwortung in die SceneFactory legen. Die Scene soll anzeigen, nicht kaufen.

## GarageShowroomController

Aktuell:

- kennt nur `vehicles`
- kann Auswahl bewegen
- `confirmSelection()` gibt immer ok, solange nicht switching

MVP-Anpassung:

- Controller darf alle Fahrzeuge anzeigen.
- Controller sollte keine Coins abbuchen.
- Controller soll Preview-Daten liefern:

```ts
export type GarageVehiclePreview = {
  vehicle: VehicleDefinition;
  owned: boolean;
  price: number;
  canAfford: boolean;
};
```

Neue Methoden:

```ts
getPreview(): GarageVehiclePreview;
refreshOwnership(unlockedVehicleIds: string[], totalCoins: number): void;
```

`confirmSelection()`:

- Wenn Preview owned: `{ ok: true, action: "select", vehicleId }`
- Wenn Preview locked: `{ ok: false, reason: "locked" }`

Oder getrennt halten:

- `confirmSelection()` nur fuer owned Autos.
- `GameApp` ruft bei locked Autos `unlockVehicle()`.

Empfehlung fuer weniger Fehler:

- `confirmSelection()` bleibt Auswahl/Start.
- `GameApp` entscheidet anhand `garageScene.getPreview()`:
  - owned -> Start
  - locked + can afford -> Unlock
  - locked + cannot afford -> kein Start, UI zeigt fehlende Coins

## Garage UI

Aktuell:

- Label zeigt nur Fahrzeugname.
- Startbutton startet aus Garage.

Neue UI im bestehenden `.menu-panel`:

- Coin-Balance in Garage sichtbar:
  - `Coins 1234`
- Vehicle Label:
  - Name
  - Status `Owned` oder `Locked`
  - Preis `850 coins`
  - Bei zu wenig Coins: `Need 230 more`
- Primary Button:
  - Owned: `Starten`
  - Locked + enough coins: `Unlock`
  - Locked + not enough coins: `Locked`
- Back bleibt `Zurueck`.

Wichtig:

- Locked Autos muessen im 3D-Showroom sichtbar bleiben.
- Optional visuell:
  - locked Auto etwas dunkler anzeigen
  - kleines Schloss/Preis-Text im HTML, nicht als 3D-Text
  - Kein Start mit locked Auto moeglich

Minimaler DOM-Ausbau:

```html
<p class="garage-vehicle-label" data-garage-vehicle hidden></p>
<div class="garage-shop-meta" data-garage-shop hidden>
  <span data-garage-owned></span>
  <span data-garage-price></span>
  <span data-garage-balance></span>
</div>
```

## GameApp Ablauf

Beim Oeffnen der Garage:

```ts
this.garageScene = this.createGarageScene();
this.updateGarageUi();
```

`createGarageScene()` bekommt alle Fahrzeuge und SaveData-Kontext.

`updateGarageUi()`:

1. Preview aus GarageScene holen.
2. Owned/locked berechnen.
3. Label + Preis + Balance setzen.
4. Buttons setzen:
   - Previous/Next disabled bei switching
   - Startbutton:
     - owned: enabled, text `Starten`
     - locked and can afford: enabled, text `Unlock`
     - locked and not afford: disabled, text `Locked`

`startFromGarage()` umbauen:

```ts
const preview = this.garageScene.getPreview();

if (!preview.owned) {
  const result = unlockVehicle(preview.vehicle.id, this.saveData);
  this.saveData = result.saveData;
  this.unlockedVehicleIds = [...this.saveData.unlockedVehicleIds];
  this.garageScene.refreshOwnership(this.unlockedVehicleIds, this.saveData.totalCoins);
  this.updateGarageUi();
  if (result.ok) {
    // optional: Unlock-SFX, Auto bleibt previewed, Button wechselt zu Starten
  }
  return;
}

// bisheriger Startflow
```

Wichtig:

- Kaufen darf nicht automatisch den Run starten.
- Nach Kauf soll der Spieler sehen: Auto ist jetzt owned, Button wird `Starten`.
- Erst ein weiterer Klick startet den Run. Das verhindert versehentliche Starts.

## Vehicle Models integrieren

Der 3D-Modellierer hat folgende `ModelFactory`-Methoden erstellt:

- `createSakuraRoadster()`
- `createKitsuneRally()`
- `createShogunGTR()`
- `createOniInterceptor()`
- `createRyujinHypercar()`

Status:

- Die Methoden existieren in `src/engine/assets/ModelFactory.ts`.
- Neue zentrale Materialien existieren in `src/engine/assets/MaterialFactory.ts`.
- Die Modelle sind noch nicht in `VehicleCatalog.ts` oder `ModelFactory.createVehicle()` verdrahtet.
- Das ist bewusst offen fuer die naechste KI-Session, die Shop und Unlock-System als zusammenhaengenden Schritt implementiert.

Naechste KI muss:

1. `VehicleModelKey` erweitern:

```ts
export type VehicleModelKey =
  | "sports-car"
  | "drift-coupe"
  | "sakura-roadster"
  | "kitsune-rally"
  | "shogun-gtr"
  | "oni-interceptor"
  | "ryujin-hypercar";
```

2. `ModelFactory.createVehicle(modelKey)` erweitern:

```ts
case "sakura-roadster":
  return this.createSakuraRoadster();
```

3. `VEHICLE_CATALOG` um die neuen Autos erweitern.

Vorschlag:

```ts
{
  id: "sakura-roadster",
  displayName: "Sakura Roadster",
  modelKey: "sakura-roadster",
  unlockState: "locked",
  economy: { price: 350, tier: "street" },
  run: { scale: 0.88, forwardRotationY: 0, bounds: { x: 1.12, y: 0.7, z: 1.9 } },
  showroom: { scale: 1.06, cameraFocusOffset: { x: 0, y: 0.5, z: 0 } }
}
```

Bounds muessen pro Modell grob passen. Nicht alle blind auf dieselben Werte setzen, wenn die Modelle sichtbar deutlich breiter/laenger sind.

## Edgecases

Pflichtpruefungen:

- Garage kann auch mit 0 Coins geoeffnet werden.
- Locked Autos sind sichtbar, aber nicht startbar.
- Kaufen mit zu wenig Coins veraendert SaveData nicht.
- Kaufen mit genug Coins zieht exakt den Preis ab.
- Gekauftes Auto bleibt nach Reload unlocked.
- SelectedVehicle darf nie auf locked Auto zeigen.
- Wenn SaveData alte/ungueltige IDs enthaelt, Normalisierung repariert sie.
- Coin-Reward nach GameOver wird nur einmal addiert, auch wenn UI mehrfach updated.
- Restart nach GameOver darf Coins nicht erneut buchen.
- Main Menu nach GameOver darf Coins nicht erneut buchen.
- Garage-Preview darf beim Zurueckgehen nicht automatisch selected werden.
- Nach Kauf sollte Preview bestehen bleiben.
- Start aus Garage mit owned Auto erzeugt neue RunScene mit diesem Fahrzeug.
- Audio/SFX fuer Unlock optional, aber darf nicht crashen, wenn AudioContext noch gesperrt ist.

## Akzeptanzkriterien

- `npm run build` erfolgreich.
- In Garage sind owned und locked Autos sichtbar.
- Locked Autos zeigen Preis und Lock-Status.
- Coin-Balance wird in Garage angezeigt.
- Genug Coins -> Unlock moeglich.
- Zu wenig Coins -> Unlock nicht moeglich.
- Nach Unlock wird Auto owned und kann gestartet werden.
- Nach Reload bleibt Unlock erhalten.
- Nach Run werden gesammelte Coins zum persistenten Kontostand addiert.
- Keine Moeglichkeit, mit locked Auto zu starten.
- Keine Duplikate in `unlockedVehicleIds`.

## Empfohlene Implementierungsreihenfolge fuer naechste KI

1. Modellierer-Output in `ModelFactory.createVehicle()` und `VehicleCatalog` verdrahten.
2. `VehicleCatalog` um `economy`/Helper erweitern.
3. `SaveDataStore` um `addRunCoins()` und `unlockVehicle()` erweitern.
4. `GarageSceneFactory` auf alle Fahrzeuge statt nur unlocked Fahrzeuge umstellen.
5. `GarageShowroomController` um Preview-Meta/Ownership-Refresh erweitern.
6. `GameApp.updateGarageUi()` fuer Preis/Balance/Button-Status erweitern.
7. `startFromGarage()` in Unlock-oder-Start-Flow umbauen.
8. Run-Coin-Rewards beim GameOver persistent addieren.
9. CSS fuer Shop-Meta und locked Status ergaenzen.
10. Build ausfuehren.
11. User-Playtest fuer Garage-UX und Preisbalance.

## Uebergabe-Prompt fuer eine neue KI-Session

Implementiere das Garage-Shop-/Vehicle-Unlock-System anhand von `GARAGE_SHOP_UNLOCK_PLAN.md`. Verwende die bestehenden Dateien und Architekturregeln aus `architektur.md`. Wichtig: Locked Autos muessen in der Garage sichtbar sein, Preis und Coin-Balance muessen angezeigt werden, Kaufen muss Coins abziehen und persistent speichern, und locked Autos duerfen nicht gestartet werden. Sammle Run-Coins nach GameOver genau einmal in `saveData.totalCoins`. Verdrahte die fuenf neuen ModelFactory-Methoden des Fahrzeug-Modeling-Agenten in `VehicleCatalog` und `ModelFactory.createVehicle()`. Halte `GameApp` orchestration-only; Shop-Berechnung gehoert in `VehicleCatalog`/`SaveDataStore`, Anzeige in Garage/UI, 3D-Modelle in `ModelFactory`. Fuehre `npm run build` aus und dokumentiere alle offenen Edgecases.
