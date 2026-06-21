# Progression-System — Konzept, Forschung & Ideen (Feudal Runner)

> Status: **Diskussionsgrundlage** (Stand 2026-06-21). Noch nichts implementiert — erst besprechen, dann bauen.
> Ziel dieses Dokuments: Ein konkretes, durchdachtes Progressions-/Wirtschaftssystem entwerfen, das den Spieler langfristig „fesselt" — fundiert auf Motivationspsychologie und auf dem, was erfolgreiche Racing-/Runner-Games gut gemacht haben.

---

## 0. TL;DR — die Kernidee in einem Absatz

**Zwei-Achsen-Progression.** Du fährst Runs (Endless-Runner: Verkehr überholen, Coins sammeln, boosten, weit kommen). Daraus entstehen zwei getrennte Fortschritts-Ströme:

- **金 Koban (Coins) → Breite.** Globale Währung aus jedem Run. Gibst du im **Store** aus: neue Autos, Lackierungen/Kosmetik, Pre-Run-Booster. „Was kaufe ich als Nächstes?"
- **里 Meisterschaft (gefahrene Meter pro Auto) → Tiefe.** Jedes Auto hat einen **eigenen Meisterschafts-Baum**. Je mehr Meter du *mit diesem Auto* fährst, desto stärker/eigenständiger wird *genau dieses Auto* (Fähigkeiten freischalten & aufleveln). „Mit welchem Auto verbeiße ich mich?"

Dazu eine dünne **Status-Achse** (Rang/Titel im Feudal-Japan-Flavor) als sichtbare Leiter mit benannten Zielen, plus ein **Tages-/Wochen-Layer** (Missionen, Streak, Festival) als Wiederkomm-Grund. Das Ganze bewusst **fair und nicht-räuberisch** (keine Energie-Timer, kein Pay-to-Win) — die Sucht kommt aus *Meisterschaft, Sammeln und „nur noch ein Run"*, nicht aus Frust-Gates.

```
            ┌─────────────────────────────────────────────┐
            │                  EIN RUN                     │
            │  fahren · Verkehr überholen · Coins · Boost  │
            │  Near-Miss/Takedown · Distanz · Combo        │
            └───────────────┬───────────────┬──────────────┘
                            │               │
                    +金 Koban        +里 Meter (für DIESES Auto)
                            │               │
              ┌─────────────▼──┐      ┌─────▼──────────────┐
              │  STORE (Breite)│      │ MEISTERSCHAFT(Tiefe)│
              │ Autos, Skins,  │      │ Skill-Baum pro Auto │
              │ Booster        │      │ Fähigkeiten leveln  │
              └─────────┬──────┘      └─────────┬──────────┘
                        └────────► macht den nächsten Run
                                   stärker / neuer / variabler
                                          │
                ┌─────────────────────────▼───────────────────────┐
                │  META: Rang/Titel · Tagesmissionen · Streak ·    │
                │        Festival · Bestenliste  → "komm morgen"   │
                └──────────────────────────────────────────────────┘
```

---

## 1. Designziel & Haltung

**Was wir wollen:** Dass jemand nach dem Game-Over reflexartig „nochmal" drückt, abends an „mein 龍 ist gleich auf Meisterstufe 8" denkt, und morgen zurückkommt, um die Streak nicht zu reißen. Eintauchen über **Können, Besitz und Vollendung** — nicht über Manipulation.

**Was wir NICHT wollen** (siehe auch §7): Energie-/Sprit-Gates wie CSR Racing, die das Spielen künstlich rationieren; Pay-to-Win; aggressive FOMO. Diese Muster steigern kurzfristig Kennzahlen, kosten aber Vertrauen und Spielspaß — und für ein (vermutlich) nicht-monetarisiertes Spiel gibt es keinen Grund dafür. Wir nehmen die *gesunden* Hooks und lassen die *toxischen* weg.

Leitsatz: **„Respektiere die Zeit des Spielers, belohne sein Können, mach den nächsten Schritt immer sichtbar."**

---

## 2. Die Wissenschaft des „Verbeißens"

Sieben Prinzipien, jeweils: *Erkenntnis → was es für uns heißt.*

### 2.1 Selbstbestimmungstheorie (SDT / PENS) — der Motor der *intrinsischen* Motivation
Ryan, Rigby & Przybylski (2006) zeigten, dass Spiele dann fesseln und sogar das Wohlbefinden heben, wenn sie drei psychologische Grundbedürfnisse erfüllen: **Kompetenz** (Meisterung durch Herausforderung), **Autonomie** (echte Wahl/Selbstbestimmung) und **Verbundenheit** (sozialer Bezug). Das daraus entstandene PENS-Modell ist *der* Standard für „warum macht ein Spiel süchtig im guten Sinn".
**→ Für uns:** Kompetenz = spürbares Besser-Werden (Meisterschaftsbaum, weiter kommen). Autonomie = echte Entscheidungen (welches Auto maine ich, welchen Build, welcher Spielstil, welche Kosmetik). Verbundenheit = leichte soziale Schicht (Bestenliste, Geist/Ghost, geteilte Festival-Challenge). Diese drei sind unser **Fundament** — alles andere sind Verstärker.

### 2.2 Flow (Csikszentmihalyi) — die Balance Können ↔ Herausforderung
Zu schwer → Angst; zu leicht → Langeweile; passend → **Flow** (völlige Vertiefung, Zeitvergessen). Flow braucht außerdem *klare Ziele* und *unmittelbares, eindeutiges Feedback*.
**→ Für uns:** Die Run-Geschwindigkeit steigt ohnehin. Progression muss die Herausforderung *mitwachsen* lassen (stärkere Autos → schaffe schwierigere Distrikte/Tempo, statt alles trivial zu machen). Sub-Ziele im Run (alle 1000 m ein „Meilenstein-Tor" mit Coin-Schauer) liefern „klare Ziele + Feedback" → Flow-Komponenten.

### 2.3 Variable-Ratio-Belohnung / Compulsion Loop — die Dopamin-Mechanik
Unvorhersehbare Belohnungen (mal nach 3, mal nach 7 Aktionen) erzeugen *mehr* Dopamin und *robusteres* Weiterspielen als feste Belohnungen — Dopamin schießt schon in der **Erwartung** hoch, nicht erst bei der Belohnung. Das ist die Maschine hinter Lootboxen, Slot-Spins, „Mystery Boxes".
**→ Für uns, ethisch:** Wir nutzen die *Erwartungs-Spannung*, aber **ohne Geld und ohne Gates**: eine **おみくじ Fortune-Slip** (Glücks-Los) am Run-Ende, **Mystery-Box** als Missions-Belohnung, und — am elegantesten — **Near-Miss/Takedown** im Run selbst (knapp am Verkehr vorbei = Bonus): das ist *könnens-basierte* Varianz, die Burnout berühmt gemacht hat.

### 2.4 Goal-Gradient & Endowed Progress — „so nah dran!"
Hull (1932): Motivation steigt, je näher das Ziel. Kivetz/Urminsky/Zheng (2006): Kund:innen beschleunigen messbar Richtung Belohnung. Nunes & Drèze: eine Stempelkarte „2 von 10 schon gestempelt" wird **fast doppelt so oft** eingelöst wie „0 von 8" — obwohl beide 8 echte Stempel brauchen. *Sichtbarer, vor-gefüllter Fortschritt zieht.*
**→ Für uns:** Überall **Fortschrittsbalken nah an der nächsten Belohnung** zeigen („noch 240 m bis 狐 Stufe 4"). Neue Spieler bekommen **Vorsprung geschenkt** (Start-Auto schon auf Meisterstufe 2, erste Mission halb erfüllt). Niemals ein leerer „0 %"-Balken am Anfang.

### 2.5 Hook-Modell (Nir Eyal) — Gewohnheit in 4 Schritten
**Trigger → Action → Variable Reward → Investment**, im Kreis. Der Clou ist die **Investment**-Phase: was der Spieler reinsteckt (geleveltes Auto, Skins, Streak, gemeisterte Builds), macht das *nächste* Zurückkommen wertvoller. Eyal nennt drei Belohnungstypen: *Hunt* (Ressourcen jagen = Coins), *Self* (Meisterung/Vollendung = unser Meisterschaftsbaum), *Tribe* (sozial = Bestenliste).
**→ Für uns:** Trigger = Tages-Reset/Push „deine Streak läuft ab". Action = ein Run (10–90 s). Variable Reward = Coins/Drop/Fortune-Slip. Investment = Auto leveln/Skin/Streak → genau das fesselt langfristig.

### 2.6 Verlustaversion & Streaks — „bloß die Kette nicht reißen"
Menschen hassen Verlust ~2× so stark, wie sie Gewinn lieben. Eine **Serie** (Login-/Tages-Streak) verwandelt „heute spielen" in „nicht verlieren, was ich aufgebaut habe". Ein **Revive** im Run nutzt denselben Hebel (gerade weit gekommen → Verlust droht → kleine Belohnung/Token rettet).
**→ Für uns:** Tages-Streak mit eskalierenden Belohnungen + **1 Gnaden-Token** („Streak-Schutz"), damit ein verpasster Tag nicht alles killt (sonst Frust-Abbruch). Revive-Token-Ökonomie pro Run.

### 2.7 Zeigarnik & Vollendung — Unfertiges nagt
Unabgeschlossene Aufgaben bleiben im Kopf (Zeigarnik-Effekt). **Sammlungen mit Lücken** (6/7 Autos gemeistert, 8/10 Lackierungen) erzeugen einen Drang zur Vervollständigung — der **stärkste Langzeit-Hook** überhaupt, weil er aus dem Spieler selbst kommt.
**→ Für uns:** Sichtbare Sammel-Raster: 7 Autos × Meister-Sterne, Lackierungs-Sets, Distrikt-Abzeichen, „Geheime Künste" (秘伝) je Auto. Das **Octalysis**-Framework (Yu-kai Chou) bündelt diese Treiber (Accomplishment, Ownership, Scarcity, Unpredictability …) — wir wollen *mehrere* gleichzeitig bedienen, nicht nur einen.

---

## 3. Was die Großen richtig gemacht haben (und was wir klauen)

### Racing
- **NFS Underground / Most Wanted:** Performance-Teile in klaren **Stufen** (Stock → Street → Pro → Extreme → Unique); **REP/Style-Punkte** als zweite Achse neben Geld; Most Wanted's **„Blacklist"** = 15 benannte Rivalen als Leiter → *immer ein konkreter nächster Boss*. **→ Klauen:** benannte Meilenstein-Ziele (unsere Rang-Titel), Upgrade-Stufen statt linearer Zahlen.
- **Forza Horizon:** **Car-Mastery** — Autos sammeln *eigene* XP durch Fahren (Kurven, Überholen, Drift/Near-Miss → **Skill-Chains** mit Multiplikatoren), die in **auto-spezifische Perk-Bäume** fließen. Plus **Wheelspins** (Glücksrad) und die rotierende **Festival-Playlist**. **→ Klauen:** *exakt unsere Kernidee* — Meter pro Auto → Auto-Perk-Baum; Skill-Chains aus Near-Miss/Takedown; Festival = unser Wochen-Event; Wheelspin = おみくじ.
- **Burnout:** **Boost verdient man durch Risiko** (Near-Miss, Gegenverkehr, Drift) → **Takedowns**. Risiko/Belohnung im Sekundentakt. **→ Klauen:** Boost-Ökonomie an riskantes Fahren koppeln; knappes Überholen belohnen.
- **CSR Racing:** sauberer **Dual-Currency-Loop** (Cash fürs Tunen, Premium fürs Nachfüllen) und **Auto-Tiers**. ABER: **Sprit-/Energie-Gate** (≈10 Runs, dann warten) — *bewusst räuberisch*. **→ Klauen:** Dual-Currency-Klarheit. **→ Weglassen:** das Energie-Gate.
- **Hill Climb Racing:** simpler, *tiefer* Upgrade-Loop pro Fahrzeug (Motor/Reifen/Federung) mit Coins — minimalistisch, aber extrem klebrig. **→ Klauen:** Tiefe schlägt Breite; wenige, fühlbare Upgrade-Achsen.

### Endless Runner (unser Genre!)
- **Jetpack Joyride** (Goldstandard): **3 Missionen gleichzeitig**, eskalierend („Star-Level"); **The Stash**-Spin am Run-Ende (Slot-Machine); Shop mit Gadgets/Utilities/Kosmetik; **permanenter Score-Multiplikator** zum Hochleveln. **→ Klauen:** 3-Missionen-Format, End-of-Run-Spin, klare Trennung Gadgets (Gameplay) vs. Kosmetik (Ausdruck).
- **Subway Surfers:** Charaktere + **Hoverboards** (Kosmetik + kleine Powers), **Word Hunt / Daily Challenge**, **Mystery Box**, **Score-Multiplier** der dauerhaft wächst, **wöchentliche Hunt-Events** mit exklusiven Belohnungen. **→ Klauen:** wachsender Multiplikator, Daily/Weekly-Events, Sammel-Kosmetik.
- **Temple Run:** **Power-ups mit Coins aufleveln** (Coin-Magnet, Boost, Mega-Coin …) und **3 Objectives** zugleich. **→ Klauen:** aufrüstbare Power-ups, parallele Ziele.

**Roter Faden:** Die besten kombinieren **(a)** eine *Breiten*-Ökonomie (kaufen/sammeln), **(b)** eine *Tiefen*-Meisterschaft (ein Ding richtig stark machen), **(c)** *parallele kurze Ziele* (Missionen), **(d)** *variable Belohnung* (Spin/Box/Near-Miss) und **(e)** *benannte Langzeit-Leitern* (Rivalen/Ränge). Genau das bauen wir — feudal-japanisch eingefärbt.

---

## 4. Das vorgeschlagene System

### 4.1 Überblick: drei Achsen

| Achse | Ressource | Quelle | Wofür | Psychologie |
|---|---|---|---|---|
| **A — Breite** | 金 **Koban** (Coins) | jeder Run (Pickups + Distanz + Combo) | **Store:** Autos, Skins, Booster | Hunt, Autonomie, Ownership |
| **B — Tiefe** | 里 **Meisterschaft** (gefahrene Meter **pro Auto**) | nur das *aktive* Auto sammelt | **Auto-Skill-Baum:** Fähigkeiten freischalten/leveln | Kompetenz/Mastery, Zeigarnik |
| **C — Status** | 名 **Rang/Renommee** (Account-XP) | Runs, PBs, Missionen, Festival | **Titel-Leiter** + schaltet Store-Tiers/Distrikte frei | Accomplishment, Goal-Gradient |

> **Designentscheidung zur Diskussion:** A + B sind die zwei *ausgebbaren* Ströme (genau deine Idee: Coins kaufen, Meter leveln). C ist bewusst **nicht ausgebbar**, sondern eine *sichtbare Leiter mit Toren* — sie hält das „Big Picture"-Ziel wach, ohne eine dritte Wirtschaft zu balancieren. (Alternative: C ganz weglassen oder als ausgebbare Skill-Punkte führen — siehe §9.)

### 4.2 Achse A — 金 Koban & der Store

**Verdienen** (pro Run): Coin-Pickups (wie heute) + Distanz-Bonus + Combo/Near-Miss-Bonus + Missions-/Streak-/Festival-Auszahlungen. **First-Win-of-the-Day** gibt einen Bonus.

**Ausgeben** im Store — vier Kategorien, damit Coins *nie wertlos* werden (wichtiges Spät-Spiel-Problem: wenn man alle Autos hat, müssen Coins weiter Sinn haben):
1. **Autos** — die 7 + spätere; gegated durch Rang **und** Preis (NFS-Style „du musst es dir verdienen *und* leisten").
2. **Kosmetik (reiner Ausdruck, kein Power):** Lackierungen/Liveries je Auto, Decals (Mon/Wappen), Boost-Trail-FX, **Garagen-Hintergründe**, Hanko-Siegel. → SDT-Autonomie/Kreativität, Octalysis-Ownership. Sammelbar in **Sets** (Zeigarnik).
3. **Pre-Run-Booster (Verbrauch, wiederkaufbar = Dauer-Coin-Senke):** *Head Start* (starte mit Tempo/+500 m), *Coin-Doppler* (1 Run), *Extra-Boost-Ladung*, *Revive-Token*. Bewusst **mild** (kein Pay-to-Win, da nicht kaufbar mit Geld), aber sie geben Coins dauerhaft Zweck.
4. **Re-Rolls / Schlüssel:** Missions-Tausch, Mystery-Box-Schlüssel.

### 4.3 Achse B — Per-Auto-Meisterschaft (der Hauptbrocken, dein Kerngedanke)

**Grundmechanik:** Während du fährst, sammelt **nur das aktive Auto** „里"-Meter. Schwellen → **Meisterstufe** (z. B. Lv 1–20 + danach „秘伝"-Prestige). Jede Stufe gibt einen **Meisterpunkt** und/oder schaltet automatisch einen **Baum-Knoten** frei. Das verwandelt die heute **kosmetischen** Stat-Balken (速/握/操/力) in **echte** Modifikatoren — pro Auto individuell investierbar.

**Der Baum (4 Äste = die 4 Stats) + Signatur:**

| Ast | Kanji | Knoten-Beispiele (eskalierend) |
|---|---|---|
| **SPEED 速** | Tempo | höheres Max-Tempo · schnellerer Speed-Ramp · „Slipstream" (hinter Verkehr beschleunigen) |
| **GRIP 握** | Haftung | weichere Spurwechsel · weniger Weak-Fails am Rand · kleinerer Fehler-Toleranzpuffer |
| **HANDLE 操** | Kontrolle | schnellerer Lane-Change · kleinere Hitbox · kurzer Slow-Mo bei Near-Miss |
| **POWER 力** | Kraft | längerer/stärkerer Boost · Boost zerstört Verkehr · schnellere Boost-Aufladung |
| **Signatur (Ult)** | je Auto | freigeschaltet bei Meilenstein-Stufen; macht das Auto *einzigartig* (siehe 4.5) |

**Warum das fesselt:** Jedes Auto wird ein **eigenes Projekt** (Zeigarnik + Mastery). „Mein 鬼 ist mein Verkehrs-Brecher-Build, mein 桜 mein Coin-Farm-Build." → Du willst **alle sammeln *und* alle meistern** (doppelte Sammlung). Und es belohnt **Maining** (tief) *und* gibt einen Grund, **Variety** zu fahren (Tagesmissionen „fahre 狐 1500 m").

**Balance-Wächter (kritisch, zur Diskussion):** Wenn Upgrades nur „stärker" machen, wird der Runner irgendwann trivial → Flow kippt in Langeweile (§2.2). Drei Gegenmittel: **(1)** Distrikte/Tempo-Bänder skalieren mit (stärkeres Auto ⇒ Zugang zu härterem Content statt leichterem alten), **(2)** Upgrades sind eher *Stil/Optionen* als nackte Macht (Coin-Build vs. Distanz-Build vs. Aggro-Build — *horizontal*, nicht nur vertikal), **(3)** Diminishing Returns + „秘伝"-Prestige für Endlos-Spieler.

### 4.4 Achse C — Rang / Renommee (名)

Eine **benannte Leiter** (à la Most Wanted Blacklist), feudal eingefärbt:

`足軽 Ashigaru → 浪人 Rōnin → 侍 Samurai → 旗本 Hatamoto → 国主 Kokushu → 大名 Daimyō → 将軍 Shōgun`

- Rang-XP aus Runs, neuen PBs, Missionen, Festival.
- Jeder Rang-Up = **Belohnungs-Moment** (Coins, Kosmetik, Mystery-Box) **+ Tor** (schaltet Store-Tier / nächsten Distrikt / Auto-Slot frei).
- Liefert das „Big Picture"-Ziel und macht Goal-Gradient sichtbar („noch 2 Runs bis 侍").

### 4.5 Fähigkeiten-/Skill-Katalog (an echte Runner-Mechaniken gebunden)

Damit es konkret wird — gebunden an *unsere* Mechaniken (Lanes, Verkehr, Boost, Weak-Fail/Pressure, Police, Coins):

**Passive Mastery-Knoten** (aus Baum, pro Auto): Top-Speed↑, Boost-Dauer↑, Boost-Cooldown↓, Coin-Wert↑, Coin-Magnet-Radius↑, Lane-Change-Speed↑, Hitbox↓, Weak-Fail-Toleranz↑, Slipstream, Near-Miss-Coin-Bonus↑, Start-Tempo↑.

**Aktive/Signatur-Fähigkeiten** (je Auto eine, thematisch — Identität!):
| Auto | Signatur | Effekt (Vorschlag) |
|---|---|---|
| 赤 Crimson Bolt | **Striker Boost** | verlässlicher Allround-Boost (Tutorial-Auto) |
| 藍 Indigo Drift | **Night Drift** | perfekte Spurwechsel bauen eine Drift-Combo → Bonus-Coins |
| 桜 Sakura Roadster | **Blossom Bloom** | periodischer Coin-Regen / Magnet-Aura |
| 狐 Kitsune GT | **Foxfire Phase** | kurze Phase/Unverwundbarkeit *durch* ein Auto (Trickster) |
| 将 Daimyo Coupe | **War Banner** | Score-/Combo-Multiplikator-Aura (defensiv/wert-orientiert) |
| 鬼 Oni Racer | **Oni Charge** | Boost rammt & zerstört Verkehr wie ein Sturmbock |
| 龍 Dragon Zero | **Ascending Dragon** | langer Drachen-Dash, lange Unverwundbarkeit + Coin-Sturm |

→ Jedes Auto „spielt sich anders" = echte Autonomie + ein Grund, jedes zu meistern.

**Offene Frage:** Aktive Fähigkeit per *Tap* auslösen (mehr Tiefe, aber zweiter Input auf einem Ein-Daumen-Runner) **oder** rein passiv/automatisch? → §9.

### 4.6 Variable-Reward-Layer (ethisch, ohne Geld)

- **おみくじ Fortune-Slip** (Run-Ende): ein kleines Glücks-Los, das Coins / Meister-Boost / Kosmetik-Splitter / Booster ausschüttet. Frei (1× pro Run oder per Ticket). Das ist unser „Wheelspin/Stash" — Variable-Ratio-Dopamin **ohne** Bezahl-Lootbox.
- **Mystery-Box** als Missions-/Rang-Belohnung (gestaffelte Seltenheit, sichtbare Odds = fair).
- **Near-Miss / Takedown im Run** (Burnout-Prinzip): knapp überholen / mit Boost durch Verkehr = sofortiger Funken-Bonus + Combo. **Bestes** Varianz-System, weil **könnens-basiert**, nicht Zufall pur.

### 4.7 Täglich / Wöchentlich (Wiederkomm-Schicht)

- **3 Tagesmissionen** (Jetpack-Format, eskalierend): „Sammle 300 金", „Erreiche 2000 m", „Zerstöre 10 Verkehr per Boost", „Fahre 狐 1500 m" (treibt Variety + Achse B), „5 Near-Miss in einem Run". Ein **Re-Roll** gratis/Tag.
- **Tages-Streak** mit eskalierenden Belohnungen + **1 Gnaden-Token** (Streak-Schutz) gegen Frust-Abbruch.
- **First-Win-of-the-Day-Bonus.**
- **Wöchentliches Festival (祭):** rotierendes Thema (z. B. „Kirschblüten-Lauf"), eigene Bestenliste, exklusive **Saison-Kosmetik** (sanfte Scarcity/FOMO — *kosmetisch*, nie Power).

### 4.8 Der vollständige Loop über drei Zeithorizonte

- **Sekunde-zu-Sekunde (Flow):** fahren, ausweichen, Near-Miss-Funken, Coin-Klingeln, Boost-Rush, Meilenstein-Tore.
- **Run-zu-Run (Compulsion):** Game-Over → Fortune-Slip → „+里 für 龍, noch 240 m bis Stufe 8" → Missions-Häkchen → **„nochmal"**.
- **Tag-zu-Tag / Woche-zu-Woche (Habit/Hook):** Streak, Tagesmissionen, Rang-Aufstieg, neues Auto gekauft, Festival, Sammlung füllt sich → **Grund zurückzukommen**.

---

## 5. Beispiel-Zahlen (erster Entwurf zum Drüberdiskutieren)

> Bewusst grob — nur damit wir etwas Konkretes zum Reagieren haben. Alles tunebar.

**Coin-Verdienst/Run (mittlerer Lauf ~1500 m):** ~40 Pickup-Coins + ~30 Distanz-Bonus + ~20 Combo/Near-Miss ≈ **~90 金**. Guter Lauf (3000 m) ≈ 200 金.

**Auto-Preise (Koban):** Crimson/Indigo/Sakura 0 (Start-Trio) · Kitsune 1.200 · Daimyo 3.500 · Oni 6.000 · Dragon 12.000. *(= heutige Catalog-Werte — passt.)*

**Meisterschaft pro Auto:** Lv 1→20. XP = gefahrene Meter mit dem Auto. Beispiel-Kurve: Lv 2 bei 500 m kumuliert, Lv 5 ~5k m, Lv 10 ~25k m, Lv 20 ~120k m, dann „秘伝"-Prestige endlos. Frühe Stufen **schnell** (Dopamin früh), späte Stufen Langzeit-Projekt.

**Rang-Leiter:** Ashigaru (Start) → Shōgun über ~15–20 Spielstunden Gesamt, jeder Rang ein spürbarer Belohnungs-Moment.

**Onboarding-Endowment:** Start-Auto schon **Meisterstufe 2**, erste Tagesmission **halb erfüllt**, ~150 金 geschenkt → kein leerer Balken (§2.4).

---

## 6. Onboarding & die ersten 10 Minuten

1. **Run 1:** sofort fahren (kein Tutorial-Wall), Coins klingeln, erstes Game-Over → Fortune-Slip schenkt Booster.
2. **Run 2–3:** erste Tagesmission fast voll → klick → Belohnung; Meisterstufe-Up des Start-Autos (sichtbarer Baum-Knoten).
3. **~Run 5:** genug Koban gefühlt nah am 2. Auto (Goal-Gradient: „noch 200 金!").
4. **Tag 1 Ende:** Streak-Tag 1 gesetzt, Rang-Balken sichtbar, 1 Auto gekauft oder fast → **klarer Grund für Tag 2**.

Front-load: die ersten ~10 Runs schütten viel aus (das „Was-kommt-als-Nächstes" darf früh nie leer laufen).

---

## 7. Ethische Leitplanken — was wir bewusst NICHT tun

- **Kein Energie-/Sprit-Gate** (CSR-Falle): unbegrenzt spielbar.
- **Kein Pay-to-Win / keine Geld-Lootboxen:** Varianz ja (Fortune-Slip), aber spielbar verdient, Odds sichtbar.
- **Keine nackte Power-Treppe**, die alten Content trivialisiert (Flow-Schutz, §4.3-Wächter).
- **Sanfte FOMO:** Festival-Exklusiva sind **kosmetisch**, nicht Gameplay-Power; Streak hat **Gnaden-Token**.
- **Ehrliche Trigger:** höchstens *eine* dezente Tages-Erinnerung, kein Spam.
- Begründung: Für ein faires (vermutlich nicht-monetarisiertes) Spiel maximieren diese Leitplanken sowohl Spielspaß als auch Langzeit-Bindung — die „guten" Hooks (Kompetenz, Besitz, Vollendung) tragen weiter als die toxischen.

---

## 8. Mapping auf den bestehenden Code (nur grob — noch nicht bauen)

Vorhanden in `SaveData`: `totalCoins`, `bestDistance`, `highScore`, `selectedVehicleId`, `unlockedVehicleIds`. `VehicleCatalog` hat bereits `stats {speed,grip,handle,power}` (heute kosmetisch), `tier`, `economy.price`, `paint`, `kanji`.

Neu nötig (high-level): pro-Auto-Meister-XP + freigeschaltete Knoten (`Record<vehicleId, {xp, nodes[]}>`), Account-Rang/-XP, Missions-/Streak-/Festival-State, Besitz von Kosmetik, Booster-Inventar. Die heutigen `stats` werden **Basiswerte**, auf die Mastery-Knoten Modifikatoren legen. UI-seitig: der bestehende **Garage-Stats-Block** wird vom Anzeige-Element zum **interaktiven Skill-Baum**; Store-Screen neu (passt in die `.fr-*`-Designsprache).

---

## 9. Offene Entscheidungen für dich (das besprechen wir)

1. **Achsen-Zahl:** A+B+C wie vorgeschlagen — oder C (Rang) weglassen / stattdessen als *ausgebbare* Skill-Punkte führen?
2. **Tiefe vs. Breite-Balance:** Soll das System **Maining** belohnen (ein Auto perfektionieren) oder **alle fahren** erzwingen? (Beeinflusst Missions-Design + ob Mastery übertragbar ist.)
3. **Echte Stats vs. nur Fähigkeiten:** Werden die Stat-Balken zu **echten Werten** (Power-Creep-Risiko, braucht skalierenden Content) oder bleiben Stats kosmetisch und nur **Fähigkeiten/Builds** sind die Progression?
4. **Aktive Fähigkeit (Tap)** vs. rein passiv — zweiter Input auf einem Ein-Daumen-Runner ja/nein?
5. **Monetarisierung** je geplant? (Ändert die Leitplanken & ob es eine Premium-Währung gibt.)
6. **Plattform-/Session-Fokus:** eher Mobile-Kurzsessions oder Desktop? (Beeinflusst Missions-Länge & Streak-Härte.)
7. **Revive-Ökonomie:** Revive per Token/Coins/Fortune — wie hart soll der „Verlust-Moment" sein?
8. **Soziales:** lokale Bestenliste + Geist-Auto reichen, oder echte Online-Bestenliste/Freunde (Verbundenheit ↑, aber Backend nötig)?

---

## 10. Quellen

**Motivationspsychologie**
- Ryan, Rigby & Przybylski (2006), *The Motivational Pull of Video Games: A Self-Determination Theory Approach* — [ResearchGate](https://www.researchgate.net/publication/225998888_The_Motivational_Pull_of_Video_Games_A_Self-Determination_Theory_Approach) · [PENS-Modell, selfdeterminationtheory.org](https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/)
- Flow: [Flow applied to game design (Game Developer)](https://www.gamedeveloper.com/design/the-flow-applied-to-game-design) · [Jenova Chen, *Flow in Games* (MFA-Thesis)](https://www.jenovachen.com/flowingames/Flow_in_games_final.pdf) · [Yu-kai Chou: Flow-Theory-Guide](https://yukaichou.com/gamification-analysis/flow-theory-complete-guide-csikszentmihalyi-optimal-experience/)
- Variable-Ratio / Compulsion Loop: [Compulsion loop (Wikipedia)](https://en.wikipedia.org/wiki/Compulsion_loop) · [*Engineered highs: Reward variability and frequency…* (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S0306460323000217) · [„The Vegas Effect of Our Screens" (Psychology Today)](https://www.psychologytoday.com/us/blog/tech-happy-life/201901/the-vegas-effect-of-our-screens)
- Goal-Gradient / Endowed Progress: [Kivetz, Urminsky & Zheng (2006), *The Goal-Gradient Hypothesis Resurrected*](https://www.researchgate.net/publication/239776073_The_Goal-Gradient_Hypothesis_Resurrected_Purchase_Acceleration_Illusionary_Goal_Progress_and_Customer_Retention) · [Endowed-Progress-Effekt (Nunes & Drèze; learningloop.io)](https://learningloop.io/plays/psychology/endowed-progress-effect)
- Hook-Modell: [Nir Eyal, *How to Manufacture Desire / Hooked*](https://www.nirandfar.com/how-to-manufacture-desire/) · [Hook Model (Amplitude)](https://amplitude.com/blog/the-hook-model)

**Game-Design-Referenzen**
- NFS Underground Performance-Tiers: [nfs.fandom.com](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground/Customisation/Performance)
- Forza Car-Mastery/Upgrades: [Forza Motorsport Car Progression (forza.net)](https://forza.net/news/forza-motorsport-car-progression-updates)
- CSR Racing (Dual-Currency + Energie-Gate, *was wir weglassen*): [CSR Racing Deconstructed (Deconstructor of Fun)](https://www.deconstructoroffun.com/blog//2012/07/csr-racing-dissected.html)
- Endless-Runner-Retention (Daily/Missions/Events): [Cubix: Subway-Surfers-like Design-Analyse](https://www.cubix.co/blog/top-subway-surfers-like-games/)
- Octalysis (8 Core Drives, Gamification-Linse): [Yu-kai Chou](https://yukaichou.com/gamification-analysis/flow-theory-complete-guide-csikszentmihalyi-optimal-experience/)
