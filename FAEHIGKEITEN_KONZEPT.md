# Fähigkeiten-Konzept — Main & Passive pro Auto (Feudal Runner)

> Status: **Phase 1 + Phase 2 umgesetzt** (Stand 2026-06-27). Alle 7 Autos (赤/藍/桜/狐/将/鬼/龍, je Main + Passive) sind im Spiel. Offen ist nur noch Phase 3 (Tuning/Balancing). Diese Datei bleibt die Referenz-Spezifikation; im Bau getunte Werte sind unten vermerkt.
> Ergänzt [PROGRESSION_KONZEPT.md](PROGRESSION_KONZEPT.md) · Umsetzung: [UMSETZUNGSPLAN.md](UMSETZUNGSPLAN.md).
> **Kein Thematik-Tausch** — Original-Zuordnung (bewusst so gewählt).

---

## 0. Das System in Kürze

Jedes Auto hat **genau 2 Fähigkeiten** — kein Skill-Baum. **Zwei getrennte Tracks:**

| | Wie verbessert? | Stufen | Kurve |
|---|---|---|---|
| **🅼 Main** | mit **Coins gekauft** | **Ausbaustufe 0–30** | fester Schritt je Stufe (z. B. +0,2 s) |
| **🅿 Passive** | durch **gefahrene Meter** (automatisch) | **Meisterstufe 0–100** | **linear** bis Max |

**Meisterstufen-Formel:** `Level = min(100, floor(GesamtmeterMitDiesemAuto / 10.000))`.
- **+1 Level je 10.000 m** (= 1 % von 1.000.000). **Voll gemeistert bei 1.000.000 m (= 1.000 km)** — bewusst ein **langer Grind** (soll Arbeit erfordern).
- Passive linear: `Wert = Basis + (Max − Basis) · Level/100`. Jedes Auto sammelt seine Meter **getrennt**.
- Da jeder Schritt winzig ist: das **Level-Up-Ereignis** selbst wird gefeiert (Anzeige), nicht der Zahlenwert.

**Aktivierung der Main (Temple-Run-Prinzip):** eine **Ladeleiste** (Charge-Ring im HUD) füllt sich beim Fahren (über **gesammelte Coins**, + etwas Distanz). Bei **voll** → Zünden per **W / ↑ bzw. Doppeltipp aufs Display** (eigene Activate-Zone, **getrennt vom Boost**; Space = Pause) → läuft ihre Dauer → leert sich → lädt neu.
- Theoretisch **unendlich oft**, aber gebunden an „erst aufladen". Längere/stärkere Mains = **höhere Ladekosten**. Skaliert mit Run-Länge.
- **Loop-Schutz:** coin-erzeugende Mains (桜, 鬼) laden **nicht** über ihre eigenen Coins.

**Premium-Prinzip:** teurere Autos = **mehr Ertrag + mehr Sicherheit + stärkere Signature**, nicht „schneller = schwerer". Die **Schwierigkeit** kommt aus **steigendem Tempo + mehr Verkehr** über die Zeit (separates Balancing).

**Design-Aufteilung:** 2D/UI (HUD-Anzeigen, Garage-Karten, Store) → **Claude Design (DesignSync)**; 3D/VFX (Schwarzes Loch, Nacht, Speedstreifen, Titan-Skalierung, Coin-Partikel, Wracks) → **Engine (Three.js)**.

---

## 1. 赤 Crimson Bolt — *Common · 0*
- **🅼 Striker Boost** — Boost nach vorne, zerstört NPCs in der Spur. **3 s → 9 s** (30 Ausbaustufen, +0,2 s). Ladekosten *niedrig*.
- **🅿 Knautschzone** — **+1 Extra-Fail** (erst beim 3. statt 2. raus). Buffer verbraucht sich, **lädt nach** — Meisterstufe = schneller: Wiederaufladung **600 m (Lv0) → 300 m (Lv100)** *(−3 m/Level)*. HUD-Anzeige unten.

## 2. 藍 Indigo Drift — *Common · 0*
- **🅼 Hupe / Freie Bahn** — NPCs scheren weg, Mittelspur frei + Coin-Reihe. **6 s → 12 s** (+0,2 s). *niedrig–mittel*.
- **🅿 Lichthupe** — bei Auffahrgefahr gibt der Vordermann Gas & weicht. Cooldown **1200 m → 600 m** *(−6 m/Level)*.

## 3. 桜 Sakura Roadster — *Rare · 0* — Farm-Auto
- **🅼 Blütenregen** — **echte Coins (kirschblüten-gefärbt)** regnen überall (auch aufs Gelände); du sammelst, wo du fährst. Ungelevelt Niesel → hochgelevelt **dichter** (30 Ausbaustufen = mehr/dichter, Dauer ~10 s). *mittel* (über Distanz laden).
- **🅿 Sparbüchse** — *(nur 桜: kleiner Fehler kostet Coins)* Verlust **40 → 10** *(−0,3 Coins/Level)*.

## 4. 狐 Kitsune GT — *Rare · 1200*
- **🅼 Titan** — Auto wird groß, füllt 3 Spuren, **unzerstörbar**, sammelt Coins aller Spuren. **3 s → 9 s** (+0,2 s). *mittel–hoch*.
- **🅿 Zweites Leben** — Extra-Leben, bei tödlichem Treffer **automatisch** verbraucht; lädt **alle 2000 m → 1000 m** *(−10 m/Level)*. Getrennt vom Revive-Booster.

## 5. 将 Daimyo Coupe — *Epic · 3500*
- **🅼 Nachtjagd** — es wird **Nacht**; NPCs **seitlich rammbar** (gerammtes Auto dropt **10 Coins** + bleibt als **Wrack** stehen). **20 s → 50 s** (+1 s). *hoch* (lange Fähigkeit).
- **🅿 Draufgänger** — seitliche Treffer **überlebbar**, aber **Polizei** kommt von hinten; ein kleiner Fehler zählt jetzt **doppelt** → aus. Polizei **60 s → 30 s** *(−0,3 s/Level)*. (Passive = Dauerzustand; Main = entfesselte, gefahrlose Nacht-Version.)

## 6. 鬼 Oni Racer — *Epic · 6000*
- **🅼 Schwarzes Loch** — **angetippte** Autos (Finger/Maus) werden hochgehoben (du fährst drunter), streamen Coins **ins Loch → aufs Konto**. Lila-VFX, Umgebung verdunkelt. **10 s → 20 s**. *mittel–hoch*. (Antippen = bewusst, mehr Spieler-Aktivität.)
- **🅿 Anzapfen** — Autos droppen Coins zu dir, **nur wenn Polizei direkt hinter dir** (bewusst Fehler bauen). Coins/Auto/s **1 → 7** linear *(+0,06/Level)*; Anzahl gleichzeitig **1 → 2 (Lv34) → 3 (Lv67) → 4 (Lv100)** *(ganzzahlig)*.

## 7. 龍 Dragon Zero — *Legend · 12000* — Krönung
- **🅼 Überschall** — sehr schnell; NPCs stärker rechts → **linke Spur deutlich weniger befahren** (nicht ganz frei, ab und zu rechts überholen); Coins eher links; **FOV weitet sich + Speedstreifen**. **10 s → 40 s** (+1 s). *hoch*.
- **🅿 Zu schnell für die Polizei** — Verlier-Fenster nach kleinem Fehler **10 s → 1 s** *(−0,09 s/Level)*. Bei 1 s ≈ **Weak-Fail-Immunität** am Max.

---

## 8. Ladeleiste & Anzeigen
- Füllung: primär eingesammelte Coins (+ Distanz). Ladekosten relativ: 赤 niedrig · 藍 niedrig–mittel · 桜 mittel · 狐 mittel–hoch · 将 hoch · 鬼 mittel–hoch · 龍 hoch.
  - *Bau-Tuning:* 桜 und 狐 Ladekosten wurden im Spiel **reduziert** (kürzer bis einsetzbar); 桜 lädt **nur über Distanz** (Loop-Schutz). Aktuelle Werte: siehe [ChargeMeter.ts](src/game/abilities/ChargeMeter.ts).
- Zünden: **W / ↑ / Doppeltipp** bei voller Leiste (nicht Boost). 鬼-Loch zusätzlich: Autos antippen während aktiv (Pointer→Raycast).
- HUD: **Charge-Ring** (unten rechts) + **Passiv-Aufladeanzeige** (unten links: 赤/藍/狐) + **Aktive-Fähigkeit-Chip** (Restzeit, oben).

## 9. Offene Hinweise
- **Polizei-System** trägt 3 Autos (将/鬼/龍) → muss früh robust stehen.
- **Neue Mechaniken** (gestaffelt bauen): seitliches Rammen + Wracks (将), Nacht (将), Schwarzes-Loch-VFX + Antippen (鬼), „Fehler kostet Coins" **nur 桜**, FOV/Speedstreifen + Spur-Umverteilung (龍), großes Auto über 3 Spuren (狐), Extra-Leben (狐), Knautschzone-Buffer (赤).
- **Zwei Farm-Autos** (桜 chillig-Regen · 鬼 aktiv-riskant) — bewusst verschieden, aber im Auge behalten.

## 10. Keywords / spätere Ideen
Wetter (Regen → weniger Autos), Tag/Nacht-Zyklus, Helikopter (Polizei-Eskalation), Tricks/Style (2. Score-Schicht / Ladequelle), Perk-Bausteine (Sicht weiter, schneller abhauen, mehr Leben, mehr Coins), VFX-Set.
