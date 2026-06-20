# Design-Vision: „Neo-Ukiyo Riso-Print" — eine lebende Druckgrafik, durch die man fährt

Stand: 2026-06-19 · Status: **Vision / Nordstern** (noch keine Implementierungs-Specs). Diese Datei definiert die Emotion und die Gestaltungsidee. Der konkrete Token-/Pixel-Plan (`DESIGN_SYSTEM.md`) wird erst NACH deiner Bestätigung daran angepasst.

---

## 0. Der Nordstern in einem Satz

> **Das ganze Spiel sieht aus wie ein limitiertes Tokyo-Siebdruck-Poster, das zum Leben erwacht ist — Papier, Tusche und ein schreiendes Rot, durch das du mit deinem Auto hindurchfährst. Die UI liegt nicht auf dem Spiel; das Spiel SPIELT INNERHALB der Grafik.**

Drei Worte als Gefühl: **kraftvoll · handgedruckt · gefährlich-cool.**

---

## 1. Warum sich das aktuelle Design falsch anfühlt (ehrliche Diagnose)

Damit die Vision klar wird, muss benannt sein, was nicht funktioniert:

1. **Es liegt obendrauf.** Papier-Panels schweben als HTML-Kästen vor einem 3D-Viewport. Zwei getrennte Welten. Kein gemeinsamer Raum, keine geteilten Ebenen → es liest sich wie „Website über Spiel".
2. **Kein Größenkontrast in der Typo.** Alles ist „mittel-fett, lesbar, brav". Die Referenzen leben von **extremem** Kontrast: gigantisch ↔ winzig, nichts dazwischen. Typo ist dort *Architektur und Hauptdarsteller*, bei mir ist sie nur Beschriftung.
3. **Keine Tiefe.** Flache Flächen, ein bisschen Grain. Die Referenzen haben klare Vorder-/Hintergrund-Ebenen, Dinge überlappen, der Held *durchbricht* den Hintergrund. Daraus entsteht der WOW.
4. **Zu warm, zu gedämpft, zu sicher.** Mein Vermillion (#d2401f) ist hübsch, aber leise. Die Referenzen brüllen mit einem heißen, gesättigten Scharlach-Rot auf kühlem Papier. Wenig Farben, maximaler Kontrast.
5. **Die Garage ist ein flacher Parallelraum.** Frontale Kamera auf eine gerade Rückwand = Schuhkarton. Tot. Keine Perspektive, kein Sog.

Kurz: Es ist *Design am Spiel*, nicht *Design im Spiel*. Das drehen wir um.

---

## 2. Die Design-DNA der vier Referenzen (genaue Analyse)

### Bild 1 — Techwear-Samurai-Poster (Cream / Schwarz / Rot)
- **Komposition:** Figur ¾-seitlich im Vordergrund; dahinter **riesige rote Kanji**, angeschnitten, überlappend, als bauliche Hintergrund-Architektur. Der Held steht *vor* der Typo.
- **Farbe:** nur drei Töne — Cream-Papier, Tinten-Schwarz, ein hartes Rot. Maximaler Kontrast.
- **Effekte:** Siebdruck/Riso-Textur, leichte Fehlregistrierung, Tinten-Spritzer, gestempelte Patches mit Kanji auf der Jacke, verstreute Mini-Annotationen (wie Druckvermerke).
- **Lehre:** Typo als Hintergrund-Bühne. Held durchbricht die Ebene. Drei Farben reichen für maximale Wucht.

### Bild 2 — Tokyo-Gebäude (Cream / Indigo-Blau / Orange-Rot)
- **Komposition:** detailreiche Tusche-Illustration; **fette rote Katakana** vertikal+horizontal als Anker oben links; winzige, spaltige Fließtext-Blöcke wie in einer Archiv-Zeitschrift.
- **Farbe:** Cream, Indigo-Tinte, ein orange-rotes Akzent, Gelb-Tupfer.
- **Effekte:** Hand-Tuschelinien, Editorial-Layout, „Dokument-Charakter" durch technische Mikrotexte.
- **Lehre:** Vertikale japanische Typo als dekorative Wirbelsäule. Mikrotext als „Möblierung", die ein Objekt echt/gedruckt wirken lässt. Indigo als ruhiger Gegenspieler zum Rot.

### Bild 3 — „FUTURE FLAIR" Magazine-Cover (Cream / Rot / Schwarz / Weiß)
- **Komposition:** Figur trägt einen großen Case; **monumentales „FUTURE"** in rotem Schwergewicht blutet *hinter* die Figur, „FLAIR" als Serif-Kontrast, „.02" riesig unten, „未来" Kanji. Header-Leiste mit Pfeilen + Marke, Footer-Leiste mit Legal-Text + Icons. Rahmen drumherum.
- **Farbe:** Cream-Grund, hartes Rot, Schwarz, Weiß, Coral-Rahmen.
- **Typo:** DER Star — gigantischer Sans-Display + eleganter Serif + winzige Mono-Labels + vertikale JP-Läufe + **Zahlen als Designelemente** (.02, 2024).
- **Effekte:** Barcodes, Registrierkreuze, ©/CE/Recycling-Icons, Dingbats (✦ ✕ →) als System-Möblierung. Gemischte Schriften, expressiver Raster-Bruch.
- **Lehre:** Das ist die Magazin-Cover-Logik: dramatischer Typo-Hintergrund ← Held ← scharfe Edge-Chrome (Header/Footer/Rahmen). Genau diese Schichtung = WOW. Das Cover ist EIN gestaltetes Objekt, kein „Bild + UI".

### Bild 4 — „WITCH / ARSENAL — AGENTS" Game-UI (Hell / Schwarz / Rot)  ⟵ direkt relevant
- **Komposition:** echter Character-Select. Held mittig-rechts vor einem **dramatischen, zackigen roten Aura-Shape** (wie Sonne/Explosion/Heiligenschein), das Tiefe und Energie erzeugt und den Helden rahmt. Linke Vertikal-Navi, große „WITCH"-Type, Eyebrow „ARSENAL — AGENTS", Beschreibungstext, unten Auswahl-Thumbnails, „RECRUIT"-CTA, „VIEW CONTRACT".
- **Farbe:** helles Grau/Weiß, Schwarz, vibrierendes Rot.
- **Effekte:** das rote Zacken-Shape = günstigste, stärkste Tiefenquelle. Held hat 3D-Präsenz vor 2D-Grafik. Viel Negativraum, minimale, an die Ränder geschobene Chrome. Held *bricht aus seinem Rahmen*.
- **Lehre:** **Das ist unsere Garage.** Auto = Held. Dramatischer Grafik-Backdrop dahinter. UI an den Rändern, nie davor. Held angeschnitten/herausbrechend. So bekommt ein Auswahl-Screen Wucht und Tiefe.

### Gemeinsamer Nenner (die DNA, die wir übernehmen)
1. **Drastisch reduzierte Palette** — Papier + Tinte + EIN heißes Rot (Indigo selten). Kontrast statt Vielfalt.
2. **Typo als Held & Architektur** — monumental, angeschnitten, hinter dem Subjekt; extremer Größenkontrast; gemischte Schriften & Schriftsysteme; Zahlen als Grafik.
3. **Druck-Textur & „Möblierung"** — Riso/Halftone, Fehlregistrierung, Registrierkreuze, Barcodes, Dingbats, Mikro-Codes. Das macht „handgedrucktes Objekt" statt „digitales Widget".
4. **Schichtung = Tiefe = WOW** — Backdrop-Grafik → Held → Edge-Chrome. Der Held überlappt/durchbricht die Ebenen.
5. **Eine gestaltete Einheit** — Header-Eyebrow + Footer-Microcopy + Rahmen lassen das Bild als *Poster/Cover* lesen, nicht als „Spiel + Overlay".

---

## 3. Das Leitkonzept: „Neo-Ukiyo Riso-Print"

Wir behalten das Fundament (Washi-Papier, Sumi-Tusche, feudales Japan im 3D) — aber wir laden es auf mit **Siebdruck-Energie, monumentaler Typo, Druck-Textur und echter Tiefe**. Das Ergebnis ist ein lebendes, modernes Tokyo-Druck-Poster.

Der entscheidende Trick gegen „liegt obendrauf": **UI und 3D-Welt teilen sich denselben Raum und dieselben Ebenen.** In der Garage ist der Fahrzeugname kein HTML-Kasten, sondern **monumentale Typo IM Raum hinter dem Auto** (auf der Wand / als Grafikebene in der 3D-Szene). Tier/Preis sind ein gestempeltes Plakat an der Wand. META und Coins sind Boden-/Wand-Beschriftungen. Die verbleibende HTML-Chrome schrumpft auf eine dünne, scharfe „Druckvermerk"-Schicht, die die Szene wie ein Magazin-Cover *rahmt*. Damit liest sich alles als EIN Objekt.

---

## 4. Emotionaler Bogen & die WOW-Momente

Jeder Zustand hat ein Gefühl und mindestens einen inszenierten Moment:

- **Menü — „Ehrfurcht / Ruhe vor dem Sturm":** monumentaler Titel, viel Papier, ein einzelnes rotes Element atmet. Still, aber gewaltig.
- **Garage — „Begehren / Stolz":** du betrittst einen tiefen, lichtdurchfluteten Werkstattraum; das Auto thront im Lichtkegel, hinter ihm brennt sein Kanji riesig an der Wand. WOW-Moment: **der Fahrzeugwechsel als Kino** — Licht wandert, das Wand-Kanji schlägt um, das neue Auto gleitet herein, ein Siebdruck-„Stempel" blitzt. Man WILL das nächste Auto sehen.
- **Run — „Adrenalin / Flow":** Tiefe durch Parallax, Tore über die Straße, Tempo-Linien beim Boost, rote Tinte blüht an den Rändern bei Druck/Combo. WOW-Moment: **Meilenstein-Stempel** — alle X META knallt eine riesige gestempelte Zahl + Kanji über den Bildschirm wie ein Druckabzug.
- **Game Over — „Wucht / Bedeutung":** ein monumentales gestempeltes **終** und deine **META-Zahl** schlagen wie ein Plakatdruck ein. Kein nüchterner Dialog — ein Abschluss mit Gewicht.

Leitsatz: **Jeder Übergang ist ein Druckvorgang.** Dinge werden gestempelt, blitzen, registrieren sich — als würde gerade ein Abzug gezogen.

---

## 5. Farbe (Richtung, exakte Werte später)

Von „warm & gedämpft" zu **„kühles Papier, heißes Rot, harter Kontrast"**:

- **Papier (Grund):** sauberes warmes Cream, eine Spur kühler/heller als bisher, damit Rot härter knallt (~`#ECE5D6`).
- **Sumi-Tinte (Struktur/Text):** fast-schwarz, leicht kühl (~`#15141A`).
- **HERO-ROT (der Schrei):** heißes Scharlach-Vermillion, gesättigter & energetischer als bisher (~`#E1261C`). Trägt Energie, Gefahr, Marke. Wird *sparsam und groß* eingesetzt — wie eine zweite Druckplatte.
- **Indigo 藍 (seltener Gegenspieler):** tiefes Blau (~`#20305C`) für Ruhe/„Nacht"-Akzente.
- **Weiß (Knockout):** papierweiß (~`#F7F3EA`) für ausgesparte Typo auf Rot/Tinte.
- **Gold 金 (nur Wert):** sparsam für Coins/Preis.

Regel: **2–3 Farben pro Screen, wie eine Riso mit wenigen Platten.** Rot ist kein „Akzent unter vielen", sondern DAS Ereignis.

---

## 6. Typografie — die große Korrektur (Typo als Architektur)

Hier liegt der größte Hebel. Wir definieren **Rollen mit extremem Größenkontrast** — nichts „mittel":

- **MONUMENT** — die gigantische Held-Typo. Für Menü-Titel, Garagen-Fahrzeugname (im Raum), Game-Over-Stempel, Meilenstein-Zahlen. Mischung aus schwerem, kondensiertem Grotesk (Latein, Poster-Wucht) **+** schwerer Mincho/Gothic-Kanji. Blutet aus dem Rahmen, sitzt *hinter/um* den Helden. Das ist der WOW-Träger.
- **EYEBROW / KICKER** — winzig, weit gesperrt, technisch: Kanji + Latein + ein Registrier-/Code-Motiv. Z. B. „蔵 GARAGE · N°.02 · SELECT".
- **TECHNICAL MICROCOPY** — Mono, sehr klein, wie Druckvermerke/Legal. Als „Möblierung", die jeden Screen wie ein gestaltetes Objekt wirken lässt (Fake-Katalognummern, ©, CE, Fahrzeug-Spec-Codes in einer Footer-Leiste).
- **VERTIKALER JP-LAUF (tate-gaki)** — eine Spalte vertikaler japanischer Schrift an einer Kante als dekorative Wirbelsäule.
- **ZAHLEN ALS GRAFIK** — META-Zahl, Preis, „.02"-artige Marken großformatig als Designelement.

Schrift-Richtung (final später): ein **schweres kondensiertes Grotesk** für Latein-Monumente (Poster-Impact) + **schwere Mincho/Gothic** für Kanji-Monumente + **Mono** für Mikrocopy. Bewusst kontrastreich gepaart — nicht eine brave Familie für alles.

Faustregel: **Wenn man zögert, ob etwas groß genug ist — ist es zu klein.**

---

## 7. Textur & Effekte (das „handgedruckt"-Gefühl)

Das hebt es von „flachem Webdesign" zu „Objekt":

- **Riso-Fehlregistrierung:** Rot minimal gegen Schwarz versetzt bei Schlüssel-Headlines → Siebdruck-Charakter.
- **Halftone / Punktraster** hinter großer Typo und in Schatten/Verläufen.
- **Korn / Papierfaser** auf allen Flächen (subtil, statisch).
- **Tinten-Kanten & Stempel-Bleed** auf Siegeln, Badges, CTAs — als wären sie aufgedruckt.
- **Druck-Möblierung:** Registrierkreuze, Barcodes, Dingbats (✦ ✕ → ▮), feine Trennlinien, technische Codes. Sparsam, aber konsequent → System.

Wichtig: Effekte sind **performant** (CSS-Gradients/Masken/SVG-Noise, keine teuren Filter im Run). Im 3D wird Tiefe durch Licht/Geometrie erzeugt, nicht durch teure Postprocessing-Stacks.

---

## 8. Tiefe — die Drei-Ebenen-Doktrin

**Jeder Screen hat drei Ebenen (z-Schichtung):**
1. **Backdrop-Grafik** — riesige Typo, Halftone, Aura-Shapes; leicht zurückgenommen (entsättigt/weicher), sitzt „weit hinten".
2. **Held** — das 3D-Auto bzw. eine Schlüsselkarte; scharf, beleuchtet, mit Präsenz.
3. **Chrome** — scharfe, kleine UI an den Rändern + Rahmen; die „Druckvermerk"-Schicht.

Der **Held überlappt/durchbricht** die Backdrop-Ebene (Typo verschwindet hinter dem Auto) → sofort Tiefe. Bei Interaktion bewegen sich die Ebenen mit leichter **Parallaxe** gegeneinander.

**In 3D (Garage & Run):** Tiefe entsteht physisch — gestaffelte Vorder-/Mittel-/Hintergrund-Objekte, Lichtschächte, Dunst, Fluchtpunkt, angeschnittene Vordergrund-Occluder. Die 2D-Grafik (Typo) wird teils ALS Ebene IN die 3D-Szene gesetzt, damit UI und Welt verschmelzen.

---

## 9. Die Garage neu gedacht (Herzstück)

Heute: frontale Kamera, gerade Rückwand, Schuhkarton, tot. Neu: **ein echter, tiefer Raum, schräg betrachtet.**

- **Kamera:** ¾-Winkel, *in die Länge* einer tiefen Werkstatt/Lagerhalle blickend. Starke Perspektive, klarer Fluchtpunkt. Das Auto steht angewinkelt (Flanke + Front sichtbar) in einem Lichtkegel. Kein Parallelraum mehr.
- **Tiefen-Ebenen:**
  - **Vordergrund:** angeschnittene, leicht unscharfe Occluder — ein hängendes Noren, ein Reifenstapel, ein Werkzeugträger, der ins Bild ragt. Rahmt und erzeugt Nähe.
  - **Mittelgrund:** der Held — Auto auf der Drehscheibe im Lichtpool, Gold-Lichtring darunter.
  - **Hintergrund:** ein tief zulaufender Raum mit **gigantischem Kanji des Autos** an der Seiten-/Rückwand (z. B. 龍 für Ryujin), recedierende Laternen, Torii-Silhouette, **Lichtschächte/God-Rays**, Staubpartikel.
- **Typo IM Raum:** der **Fahrzeugname** erscheint monumental als Backdrop-Grafik — auf die Wand „gedruckt"/projiziert oder als 2D-Ebene in 3D hinter dem Auto. Riesig, angeschnitten, mit Kanji. Genau die „Schrift hinter dem Auto", die du wolltest.
- **Tier & Preis** als gestempeltes Plakat/Hängebanner an der Wand — nicht als HTML-Chip davor.
- **Wechsel = Kino (WOW):** Lichter sweepen, das Wand-Kanji schlägt um/cross-fadet zum neuen Auto, das Auto gleitet mit Schwung herein, ein Siebdruck-„Stempel" blitzt + Sound. Begehren wecken.
- **Chrome:** dünner Eyebrow oben, Mikrocopy-Footer (Fake-Spec-Codes), fette Pfeile an den Rändern, EIN CTA (走 DRIVE / 金 UNLOCK), Coin-Stand als kleines Goldsiegel. Alles scharf, minimal, rahmend — die Szene ist der Held.

So ist das Design **in der Garage Teil des Spiels**, nicht davor.

---

## 10. Diegetisches HUD — Anzeigen IM Spiel statt darüber

Statt flacher Counter oben fließen Werte in die Welt:

- **META (= deine Distanz/„Meter", dein Fortschritt):** der zentrale, gebrandete Wert. Diegetisch gezeigt:
  - **Straßenschilder / km-Marker / Mini-Torii** am Fahrbahnrand, die im Vorbeifahren den aktuellen META-Stand tragen.
  - gelegentlich **Zahlen auf dem Asphalt**, über die man fährt.
  - **Meilenstein-Tore:** alle X META ein Torii-/Banner-Tor mit der Zahl → plus der gestempelte Meilenstein-Blitz (WOW).
  - Minimaler scharfer Live-Wert nur als kleine Druckmarke am Rand, falls überhaupt nötig.
- **Coins (金 Koban):** beim Einsammeln ein winziger **„+金"-Tinten-Stempel** im Weltraum am Auto; Stand als kleines pulsierendes Goldsiegel.
- **Combo:** ein **vertikaler Kanji-Streak** an der Seite, der wächst; bei hoher Combo blüht **rote Tinte / Aura** an den Bildschirmrändern (Echo von Bild 4).
- **Boost:** **Manga-Tempo-Linien**, rote Tinten-Blüte an den Rändern, ein kurz über den Screen geschlagenes Kanji (加速 / 疾走).
- **Pressure / Polizei:** Rot- und Aura-Intensität steigen — die ganze Grafik „brennt" mehr.

Philosophie: **So wenig schwebende Chrome wie möglich.** Was bleiben muss, sieht aus wie eine Druckmarke, nicht wie ein Web-Widget. Der Rest wird Welt.

(Hinweis: Ich interpretiere „META" als deine **gefahrene Distanz** und schlage vor, sie als gebrandeten Wert „META" zu führen — Doppeldeutigkeit: META = die Strecke UND der Sinn des Runs. Bitte bestätigen oder korrigieren.)

---

## 11. Bewegung & „Juice" (der WOW lebt in der Bewegung)

- **Slam-Ins:** Monument-Typo schlägt ein (schnell rein, leichtes Settle), nicht sanftes Fade.
- **Stempel-Reveals:** Übergänge wie ein aufgedrückter Stempel (Scale-Down + Ink-Bleed + Mikro-Versatz).
- **Parallaxe** zwischen den drei Ebenen bei Auswahl/Eingabe.
- **Druck-Glitch sparsam:** ein kurzer Registrier-Versatz bei Schlüsselmomenten (Unlock, Meilenstein).
- **Respektiert `reducedMotion`:** dann snappen Werte/Positionen ohne Tweens.

---

## 12. Was konkret anders wird vs. jetzt (Diff)

| Bereich | Jetzt | Vision |
|---|---|---|
| Verhältnis UI↔Spiel | UI-Kästen über Viewport | geteilte Ebenen, Typo im 3D-Raum, „ein Objekt" |
| Typo | mittel, brav, lesbar | extremer Größenkontrast, Monument hinter Held, gemischte Systeme |
| Farbe | warm, gedämpft, mehrfarbig | Papier + Tinte + EIN heißes Rot, harter Kontrast |
| Tiefe | flach, etwas Grain | 3-Ebenen-Doktrin, Held durchbricht Backdrop, Parallaxe |
| Garage-Kamera | frontal, gerade Wand, flach | ¾-Winkel, tiefer Raum, Fluchtpunkt, God-Rays |
| HUD | flache Counter oben | diegetisch: Straßenschilder, Asphalt-Zahlen, Welt-Stempel |
| Textur | flach | Riso, Halftone, Tinten-Kanten, Druck-Möblierung |
| Emotion | neutral | Ehrfurcht → Begehren → Adrenalin → Wucht |

---

## 13. Entscheidungen (bestätigt 2026-06-19)

1. **META = gefahrene Distanz/Meter, der gebrandete Hero-Wert** ✅ bestätigt. Diegetisch inszeniert (Schilder, Meilenstein-Stempel) + dezenter Live-Wert am Rand (Pflicht, §15.7). META ist die zentrale Zahl des Spiels; der bisherige abstrakte „Score" tritt dahinter zurück bzw. geht in META auf.
2. **Cyber-Anteil:** feudal = 3D-Welt; „Cyber-Print" lebt nur in **Layout/Druck**, nie in Licht/Glow (§14.6, §15.3). ✅
3. **HUD:** nicht voll diegetisch — Live-META am Rand bleibt Pflicht, Diegetik ist die Inszenierung drumherum (§15.7). ✅
4. **Rot:** **heißes Scharlach ~#E1261C** als der eine Schrei pro Screen ✅ bestätigt.
5. **Sammel-Hanko-Leiste (E6):** ✅ ins Konzept aufgenommen — Garage wird „Wand der Eroberungen".

---

*Nächster Schritt: Diese Vision wird von einem WOW-/Art-Direction-Experten gegengeprüft (Abschnitt 14 wird angehängt). Danach: deine Bestätigung → erst dann Detail-Spec & Umsetzung.*

---

## 14. Experten-Review: WOW & Emotion

*Schonungsloser Creative-/Art-Direction-Pass. Maßstab: AAA-Garage/Agent-Select, Valorant, Tokyo-Siebdruck-Editorial. Kein Höflichkeits-Review.*

### 14.1 WOW-Urteil — die ehrliche Note

**Als Dokument: 8/10. Als Garantie für WOW im fertigen Spiel: aktuell 5,5/10.** Die Lücke zwischen diesen beiden Zahlen ist das eigentliche Problem — und sie ist typisch.

Was stark ist: Die Diagnose in §1 ist goldrichtig und mutiger als 90 % aller Design-Docs. Du hast die richtige Krankheit erkannt („Design AM Spiel statt IM Spiel"), du hast die richtige Medizin verschrieben (Typo als Architektur, 3-Ebenen-Doktrin, Held durchbricht Backdrop, diegetisches HUD). Die Referenz-Analyse in §2 ist präzise. Das ist kein braves Dokument.

**Aber — und das ist der harte Teil — das Dokument selbst ist an entscheidenden Stellen genau die Sünde, die es anprangert: es ist beschreibend, wo es brutal sein müsste.** Drei konkrete Stellen, an denen die Vision noch zu „Designsystem-sicher" ist:

1. **„Monumentale Typo hinter dem Auto" bleibt eine Behauptung, keine Komposition.** Die Referenzbilder leben nicht davon, *dass* Typo groß ist — sie leben von einer **brutalen, asymmetrischen, angeschnittenen Setzung**: Das Wort sitzt nicht zentriert-brav hinter dem Helden, es ist **halb aus dem Frame gefallen, gekippt, von der Figur zerschnitten, mit einem Kanji das 3× größer ist als alles andere.** Die Vision sagt „riesig, angeschnitten" — aber ein Umsetzer wird daraus eine zentrierte, vollständig sichtbare, ordentliche Headline machen, und dann ist der WOW tot. Das Dokument muss *verbieten*, dass die Typo „ordentlich" wird. Regel fehlt: **Wenn die ganze Headline lesbar ins Bild passt, ist sie zu klein und zu zentriert gesetzt.**

2. **Drei Farben werden gefordert, aber das Dokument selbst führt sechs.** §5 listet Papier, Sumi, Hero-Rot, Indigo, Weiß, Gold. Das ist keine Riso-Disziplin, das ist eine reduzierte Webpalette. Die Referenzen schreien mit **buchstäblich zwei Tinten plus Papier.** Solange Gold UND Indigo UND Rot pro Screen auftauchen dürfen, wird der Schrei zum Gemurmel. Härtere Regel nötig: **Pro Screen exakt EINE Akzentfarbe neben Papier+Tinte. Garage = Rot. Wert-Momente (Unlock) = Gold. Niemals beide gleichzeitig laut.**

3. **„Wechsel = Kino" ist als Stichwortliste beschrieben, nicht als Sekunden-genaue Choreografie.** „Lichter sweepen, Kanji schlägt um, Auto gleitet rein, Stempel blitzt" — das sind vier gute Zutaten ohne Timing, ohne Dramaturgie, ohne den einen Frame, der das Wallpaper wird. Ein Kino-Moment braucht einen **Beat** (Anti­zipation → Impact → Settle), keine Aufzählung. Mehr dazu in 14.3.

Kurz: Die Vision hat den Mut im Kopf, aber an drei Stellen noch nicht in den Fingerspitzen. Sie beschreibt WOW, statt ihn zu erzwingen.

### 14.2 Die emotionale Achillesferse — was den WOW im echten Spielmoment killt

Hier sind die Mörder, ehrlich und nach Tödlichkeit sortiert:

1. **Mobile-Hochformat frisst die 3-Ebenen-Doktrin bei lebendigem Leib.** Das ist die größte Gefahr. Auf einem 9:19,5-Display ist *kein Platz* für „Backdrop-Typo neben dem Helden". Wenn das Auto vertikal zentriert steht, ist links und rechts nichts, oben/unten alles. Die monumentale Seiten-Typo aus den Querformat-Referenzen (alle vier Referenzen sind Quer-/Hochkant-**Poster**, kein einziges ist ein 9:19,5-Phone-Frame!) kollabiert. **Wenn die Komposition nicht für Hochformat NEU erfunden wird — Typo vertikal als tate-gaki-Wirbelsäule, Auto angeschnitten von unten, Kanji oben aus dem Frame fallend — dann sieht Mobile aus wie ein beschnittenes Desktop-Poster, und das ist genau das „Webdesign über dem Spiel"-Gefühl zurück.** Die Vision erwähnt Hochformat nicht ein einziges Mal als eigene Komposition. Das ist das gefährlichste Loch.

2. **Lesbarkeit über der bewegten Run-Szene tötet die diegetische Reinheit.** Cream-Papier-Typo über einem hellen Himmel + heller Straße + buntem Verkehr = Matsch. Die Vision will „so wenig schwebende Chrome wie möglich" und „Asphalt-Zahlen, über die man fährt" — romantisch, aber: Asphalt-Zahlen sind in Fahrtrichtung perspektivisch gestaucht, kommen entgegen, sind 0,4 s sichtbar und während eines Ausweichmanövers schaut niemand auf den Boden. Der **live-kritische Wert (META) MUSS eine permanente, knallharte, kontrastsichere Druckmarke am Rand haben** — sonst opferst du Spielbarkeit für Reinheit, und der Spieler fühlt sich verloren statt beeindruckt. Diegetik ist Würze, nicht Hauptgericht.

3. **Wiederholung killt jeden Stempel-Effekt im Endless-Run.** Der „Meilenstein-Stempel, der über den Screen knallt" ist beim ersten Mal WOW, beim fünften Mal Belästigung, beim zwanzigsten Mal verdeckt er im falschen Moment das Polizeiauto und verursacht einen Crash → Wut. Jeder Full-Screen-Effekt im Run hat eine **Halbwertszeit von ~3 Auslösungen.** Entweder er eskaliert (jeder Meilenstein größer/seltener) oder er muss aus der Sichtachse raus (Rand statt Mitte). Die Vision feiert diese Momente, ohne ihre Abnutzung zu bedenken.

4. **God-Rays + Halftone + Grain + Riso-Versatz + Aura-Shape im selben Frame = visueller Lärm, nicht Tiefe.** Die Referenzen sind *sauber* — viel Negativraum, wenige Elemente, brutal gesetzt. Die Gefahr dieser Vision ist **Akkumulation**: Wenn jeder Effekt aus §7 + §11 gleichzeitig an ist, entsteht Brei, kein Poster. WOW kommt aus **Kontrast und Leere**, nicht aus „alles an".

5. **Performance-Realität der Backdrop-Typo in 3D.** Eine CanvasTexture mit monumentaler Typo, die bei jedem Auto-Wechsel neu gerendert wird, ist billig — *solange sie nicht pro Frame neu gezeichnet wird.* Das ist machbar, aber der Stempel-Glitch/Riso-Versatz „live im 3D" verleitet zu Per-Frame-Canvas-Redraws → Ruckler. Muss als statische Textur + Shader-uv-Offset gelöst werden, nie als Canvas-Redraw.

### 14.3 Konkrete Elevations — von „gut" zu „atemberaubend"

Sechs präzise Hebel. Aufwand markiert für einen Low-Poly-Three.js-Runner.

**E1 — Der Garagen-Wechsel als echter Kino-Beat (statt Zutatenliste).** *[mittel]*
Choreografiere den Wechsel als 0,9-s-Drei-Akter, nicht als „alles gleichzeitig":
- **Frame 0–0,15 s (Antizipation):** Das alte Auto sackt 4° weg + Key-Light dimmt um 30 %, das Wand-Kanji *entsättigt* und rutscht 40 px zur Seite raus. Kurze Stille. (Das „Luftholen" ist der Trick — ohne Antizipation kein Impact.)
- **0,15–0,35 s (Impact):** Harter Schnitt — neues Wand-Kanji **knallt herein per Scale-Down von 1,15→1,0 + Riso-Versatz, der sich in 2 Frames einrastet** (das ist der Druck-Moment), gleichzeitig ein weißer 1-Frame-Flash quer übers Bild (der „Abzug wird gezogen"). Sound: ein einziger satter Stempel-*Thunk*.
- **0,35–0,9 s (Settle):** Neues Auto gleitet mit Überschwinger auf die Drehscheibe, Gold-Lichtring atmet einmal auf, Lichter faden auf 100 % zurück. Das Auto „landet".
Der WOW liegt im **harten Cut mit Flash auf Beat 2**, nicht im sanften Crossfade. Technisch: Kanji-Tausch = uv-Offset/Material-Swap auf einer Plane (billig); Flash = Fullscreen-Quad mit Alpha-Tween (billig); Auto-Slide = Position-Tween (existiert quasi schon im Controller).

**E2 — Hochformat-Komposition NEU erfinden: die vertikale Wirbelsäule.** *[mittel, aber zwingend]*
Im Hochformat wird die Backdrop-Typo **vertikal (tate-gaki) entlang einer Kante** zur Wirbelsäule, der Fahrzeugname läuft als JP-Spalte von oben aus dem Frame, das Latein-Monument schrumpft zu einem angeschnittenen Riesen-Kanji oben rechts, das Auto wird **von unten angeschnitten** (Kühlerhaube + Front füllen das untere Drittel, Dach fällt aus dem Frame) — Held bricht aus, exakt wie Referenz 1. Die Edge-Chrome (Eyebrow/Footer) klemmt oben/unten. **Das ist keine Anpassung des Querformats, das ist eine eigene Bühne.** Ohne diese Elevation bleibt Mobile das schwächste Glied — und Mobile ist die Mehrheit der Spieler.

**E3 — Der „Held durchbricht die Ebene" wird im 3D physisch echt.** *[billig]*
Die stärkste, billigste Tiefenquelle: Setze die Backdrop-Typo-Plane **hinter** das Auto in die 3D-Szene (nicht ins DOM), sodass das Auto sie real verdeckt und das Key-Light einen **Schlagschatten des Autos auf die Typo-Wand** wirft. Das eine Detail — Auto-Schatten fällt auf das riesige Kanji — verkauft „ein Raum, ein Objekt" sofort und kostet fast nichts (Schatten existiert bereits, Plane ist ein Quad mit CanvasTexture). Das ist der diegetische Knaller, der „UI liegt obendrauf" endgültig killt.

**E4 — Die Aura/Sonnen-Shape aus Referenz 4 als Garagen-Backdrop.** *[billig]*
Das zackige rote Aura-Shape hinter dem Valorant-Agenten ist laut §2 „die günstigste, stärkste Tiefenquelle" — aber die Vision baut sie nicht ein, sie baut stattdessen einen realistischen God-Ray-Werkstattraum. **Nimm beides nicht, nimm das Shape.** Ein einzelnes, riesiges, gezacktes Scharlach-Sonnen-/Strahlen-Shape (flache Geometrie oder Alpha-Card als billige Plane) direkt hinter dem Auto erzeugt mehr fokussierte Energie und Begehrlichkeit als ein ganzer dunstiger Raum mit Laternen — und es ist radikal billiger und stilkohärenter (Hinomaru-Strahlen sind feudal-japanisch, nicht cyberpunk). **Der Raum kann sparsamer/dunkler werden, das Strahlen-Shape wird der Held-Rahmen.**

**E5 — Eine einzige Typo-Regel, die alles diszipliniert: „Drei Größen, kein Dazwischen".** *[billig, reine Spec-Disziplin]*
Erzwinge pro Screen **genau drei Typo-Größen: MONUMENT (füllt >60 % einer Bildachse, immer angeschnitten), MIKRO (Druckvermerk, winzig), und NICHTS dazwischen.** Verbiete explizit jede „mittlere" Headline. Das ist der einzelne wirksamste Satz gegen Rückfall ins Brave — er macht „brav" technisch unmöglich. Kostet nur Konsequenz im Doc.

**E6 — Das Wand-Kanji wird zum kollektionierbaren Trophäen-Stempel.** *[mittel]*
Verbinde Begehren mit Fortschritt: Jedes freigeschaltete Auto „brennt" sein Kanji dauerhaft als kleiner gestempelter Abdruck in eine **Sammel-Leiste am unteren Garagen-Rand** (wie eine Reihe Hanko-Stempel auf einem Dokument). Gesperrte Autos = leere Stempel-Geister. So wird die Garage zu einer Wand der Eroberungen — man *sieht* was fehlt, und das nächste Auto wird begehrt. Das macht aus einem Car-Select eine Sammlung. *(Risiko gering, Wirkung auf Retention hoch.)*

### 14.4 Der EINE höchste-Hebel-Move

**E3 + E1 zusammen, aber wenn nur EINE Sache: E3 — die monumentale Typo als echte 3D-Plane hinter dem Auto, mit Auto-Schlagschatten darauf.**

Begründung: Es ist **billig** (Quad + CanvasTexture + vorhandener Schatten), es ist **der Kern der gesamten Vision** (es löst „Design IM Spiel statt obendrauf" buchstäblich und sichtbar in einem Bild ein), und es ist **der eine Moment, der auf einem Screenshot sofort WOW erzeugt** — das Auto, das vor seinem eigenen riesigen brennenden Kanji steht und seinen Schatten darauf wirft, IST das Poster. Alles andere (Halftone, God-Rays, Stempel-Juice) ist Veredelung obendrauf. Dieser eine Move ist das Fundament, das den höchsten WOW pro Aufwand liefert. Wenn dieser eine Frame nicht funktioniert, retten ihn auch zehn Effekte nicht.

### 14.5 Feasibility-Reality-Check (gegen die echte Codebase)

Die reale Garage (`GarageSceneFactory.ts`) ist heute: Kamera bei `(0, 1.45, 5.85)`, FOV 48, schaut fast frontal auf eine flache `cloth`-Wand bei z=-2,15; alles BoxGeometry/Cylinder; eine kleine zentrierte Torii (Scale 0,58); PointLights, ein DirectionalLight mit Shadow. Das ist genau der „Schuhkarton" aus §1 — die Diagnose stimmt mit dem Code überein. Was die Vision verlangt, gemessen daran:

| Vision-Punkt | Aufwand | Konkreter machbarer Weg |
|---|---|---|
| Monumentale Typo-Plane im 3D hinter Auto | **billig** | `THREE.PlaneGeometry` + `CanvasTexture` (Kanji + Latein einmalig gezeichnet, `needsUpdate` nur bei Wechsel). An die Backwall-Position bei z≈-2,1 setzen. Kein Per-Frame-Redraw. |
| Auto wirft Schatten auf die Typo-Wand (E3) | **billig** | Shadow-System existiert bereits (`key.castShadow`). Plane braucht `receiveShadow=true`. Quasi gratis. |
| ¾-Kamerawinkel, Fluchtpunkt, Tiefensog | **billig–mittel** | `basePosition` auf z. B. `(2.6, 1.5, 4.8)` + Auto leicht gedreht. Reiner Zahlen-Tausch. Risiko: Hochformat-Framing muss separat getuned werden (`resize()` macht das ansatzweise schon über `pullback`). |
| Aura-/Strahlen-Shape (E4) | **billig** | Eine `PlaneGeometry` mit radialer Zacken-Textur (CanvasTexture/SVG→Texture) oder fächerförmig angeordnete dünne Box-Strahlen in `torii`-Rot. Flach hinter dem Auto. |
| God-Rays (volumetrisch) | **riskant/teuer** | NICHT als echte Volumetrics. Stattdessen 3–5 schräge, halbtransparente `PlaneGeometry`-„Licht-Cards" mit additivem Alpha-Verlauf — billiger Fake, 60 fps-sicher. Oder ganz weglassen zugunsten E4. |
| Halftone / Riso / Grain (UI) | **billig** | CSS — existiert teils (`.washi-grain`). Halftone = `radial-gradient`-Raster oder ein statisches SVG-`feTurbulence`/Pattern-PNG. Fehlregistrierung = zwei versetzte Text-Layer (rot/schwarz) per CSS. Alles statisch, kein Filter im Run. |
| Kino-Wechsel-Choreografie (E1) | **mittel** | Material-Swap + Position-Tweens (Controller kann das Grundgerüst schon, `getSwitchState()`/`isSwitching()` existieren). Flash = Fullscreen-Quad oder CSS-Overlay-Div. Timing-Disziplin ist die eigentliche Arbeit, nicht die Technik. |
| Slam-In / Stempel-Reveal (UI) | **billig** | CSS `transform: scale()` + `cubic-bezier` mit Overshoot; `clip-path`/Mask für Ink-Bleed. Reduced-Motion-Gate existiert bereits. |
| Diegetisches HUD: Asphalt-Zahlen, Welt-Schilder | **mittel–riskant** | Schilder = Sprites/Planes am Fahrbahnrand, machbar. Asphalt-Zahlen = Decal/Texture auf der Straße, machbar — aber **Lesbarkeit/Nutzen fraglich** (siehe 14.2.2). Empfehlung: als Deko ja, als alleiniger META-Träger nein. |
| Live-Meilenstein-Stempel über Screen | **billig technisch / riskant fürs Gameplay** | CSS/Canvas-Overlay trivial. Das Risiko ist Verdeckung + Abnutzung (14.2.3), nicht die Technik. Aus der Sichtachse halten, eskalieren lassen. |
| Parallaxe zwischen 3 Ebenen (UI-States) | **billig** | `transform: translate` auf 2–3 Layer, getrieben von Pointer/Tilt. Im Run sparsam. |

**Fazit Feasibility:** Erstaunlich viel von der Vision ist in dieser Codebase **billig** — gerade die wichtigsten WOW-Träger (E3, E4, Kamerawinkel) sind Zahlen-/Quad-Arbeit, kein neues Asset-Pipeline-Risiko. Das echte Risiko liegt nicht in der Technik, sondern in **Disziplin** (nicht alle Effekte gleichzeitig) und in **Hochformat-Komposition** (E2).

### 14.6 Stilkohärenz — bleibt es feudales Japan oder kippt es in generischen Cyberpunk?

**Aktuell: stilkohärent — aber an einer klaren Kippkante.** Die Vision nennt sich selbst „Neo-Ukiyo" und „Cyber-Editorial" — das ist eine ehrliche Spannung, kein Widerspruch, *solange die Grenze gezogen wird.* Sie ist es teils, aber nicht scharf genug. Hier die Grenze, hart gezogen:

**Bleibt feudal (erlaubt, sogar gewollt):**
- Strahlen-/Sonnen-Shape = Hinomaru/Rising-Sun-Motiv → uralt japanisch, NICHT cyberpunk. (Deshalb ist E4 stilsicher.)
- Monumentale Kanji, tate-gaki-Spalten, Hanko-Stempel, Riso/Holzschnitt-Textur, Washi, Sumi, Vermillion, Indigo, Gold-Leaf → alles Edo/Ukiyo-e-DNA.
- Torii, Noren, Laternen, Drehscheibe im Lichtkegel → feudale Werkstatt.

**Kippt in generischen Cyberpunk (Grenze, hier stoppen):**
- **Neon-Glow, Emissive-Halos, Cyan-Leuchten in der UI** → §0 des DESIGN_SYSTEM verbannt Cyan zu Recht. Hält die Vision das? Sie sagt „Cyber-Print-Gefühl in Typo/Layout" — gut, *solange* das nie zu Glow wird. **Grenze: Cyber lebt im LAYOUT (Editorial-Raster, Barcodes, Mono-Microcopy, Registrierkreuze), NIE im LICHT.** Sobald etwas in der UI *leuchtet*, ist es Cyberpunk.
- **Glitch-Effekte** (§11 „Druck-Glitch"): Vorsicht. Ein *Druck*-Versatz (Fehlregistrierung, Riso) ist feudal-Handwerk. Ein *digitaler* RGB-Split-Glitch ist Cyberpunk. Die Vision meint richtigerweise ersteres — aber das Wort „Glitch" verführt den Umsetzer zum zweiten. Begriff schärfen: **„Registrier-Versatz", nicht „Glitch".**
- **Barcodes/Tech-Codes/„N°.02"**: grenzwertig. In Maßen = Editorial-Charme (Referenz 3). Im Übermaß = generisches „Sci-Fi-HUD". Regel: Microcopy darf nach *Druckvermerk/Katalog* aussehen (Holzschnitt-Werkstatt-Katalog), nicht nach *Raumschiff-Interface*.

**Die Kohärenz-Regel in einem Satz:** *Das Moderne darf nur als gedrucktes Editorial-Handwerk erscheinen (Tinte, Raster, Stempel, Setzung) — niemals als Licht, Glas oder Glow.* Solange nichts leuchtet, was nicht eine Laterne oder das Ryujin-Auto ist, bleibt es feudales Japan.

### 14.7 Zwei offene Antworten auf §13

- **§13.2 (Cyber-Anteil):** Dein Vorschlag „feudal = 3D-Welt, Cyber-Print = Typo/Layout/Effekte" ist richtig — mit der Präzisierung aus 14.6: Cyber = Layout/Druck, nie Licht/Glow.
- **§13.3 (HUD-Radikalität):** Nicht voll diegetisch. Ein dünner, knallharter Live-META-Wert am Rand ist Pflicht (14.2.2) — die Diegetik ist die Inszenierung drumherum, nicht der Ersatz für Lesbarkeit.

---

## 15. Synthese & verbindliche Leitplanken (nach Experten-Review)

Diese Regeln sind das Destillat aus Vision + Review. Sie sind **bindend** für die spätere Detail-Spec und Umsetzung — sie machen „brav" technisch unmöglich.

1. **Drei-Größen-Typo-Regel.** Pro Screen exakt: **MONUMENT** (füllt >60 % einer Bildachse, **immer angeschnitten/aus dem Frame fallend**, nie zentriert-vollständig), **MIKRO** (Druckvermerk, winzig), und **NICHTS dazwischen**. Faustregel/Verbot: *Passt die ganze Headline ordentlich und lesbar zentriert ins Bild, ist sie falsch gesetzt.*
2. **Eine Akzentfarbe pro Screen.** Papier + Sumi-Tinte + **genau EINE** laute Farbe. Garage/Run = Rot. Wert-Momente (Unlock) = Gold. **Nie Rot und Gold und Indigo gleichzeitig laut.** Disziplin schlägt Effekte.
3. **Kohärenz-Regel (ein Satz).** Das Moderne erscheint **nur als gedrucktes Editorial-Handwerk** (Tinte, Raster, Stempel, Setzung) — **niemals als Licht, Glas oder Glow**. Begriff: **„Registrier-Versatz", nie „Glitch".** Es leuchtet nichts in der UI, außer einer Laterne oder dem Ryujin-Auto im 3D.
4. **Tiefe wird physisch (höchster Hebel, E3).** Die Monument-Typo ist eine **echte 3D-Plane hinter dem Auto** in der Szene; das Auto **verdeckt sie und wirft seinen Schatten darauf**. Das ist der eine Frame, der „Design IM Spiel" beweist. Statische Textur + uv-Offset, **kein Per-Frame-Canvas-Redraw**.
5. **Garage = dunkler, moody Showroom mit Hero-Spotlight auf der Plattform; monumentales Kanji auf der (mittel-beleuchteten) Rückwand.** KEIN Sonnen-/Strahlen-Shape. *(Verlauf der Entscheidungen: 2026-06-19 zuerst Hinomaru-Strahlen verworfen (Flaggen-Klischee) → helle Washi-Bühne. 2026-06-20 hat der User per eigenem Mockup + direkter Anweisung auf DUNKLER Raum + Spotlight-Pool umgestellt. Das ist jetzt die verbindliche Garagen-Richtung und ersetzt die fruehere „helle Buehne". Reviews bitte gegen DIESE Zeile pruefen, nicht gegen die alte Hell-Variante.)*
6. **Hochformat ist eine eigene Bühne (E2), kein beschnittenes Querformat.** Vertikale tate-gaki-Wirbelsäule, Auto von unten angeschnitten, Riesen-Kanji oben aus dem Frame. Mobile zuerst denken.
7. **Live-META am Rand ist Pflicht.** Eine permanente, kontrastsichere Druckmarke. Diegetik (Schilder, Asphalt-Zahlen, Meilenstein-Stempel) ist die **Inszenierung drumherum**, nicht der Ersatz für Lesbarkeit.
8. **Run-Effekte aus der Sichtachse + eskalierend.** Kein Full-Screen-Effekt verdeckt je das Polizeiauto/Hindernisse. Meilenstein-Momente werden seltener/größer, nicht repetitiv. Halbwertszeit ~3 Auslösungen beachten.
9. **Kino-Wechsel als Beat, nicht als Liste (E1).** ~0,9 s in drei Akten: Antizipation (Luftholen) → Impact → Settle (Auto landet mit Überschwinger). *(Korrektur 2026-06-20: KEIN weißer Aufhell-Blitz — der User hat ihn explizit verworfen. Die Wucht kommt aus Bewegung + Kanji-Stempel-Punch + ggf. einem kurzen Scharlach-/Tinten-Akzent, nicht aus Helligkeit/Glow.)*
10. **Sammel-Hanko-Leiste (E6, bestätigt).** Freigeschaltete Autos brennen ihr Kanji als Stempel in eine untere Sammelleiste; gesperrte = Geister-Stempel. Macht aus Car-Select eine Sammlung → Begehren + Retention.

**Disziplin-Mantra:** WOW kommt aus **Kontrast und Leere**, nicht aus „alle Effekte gleichzeitig an". Im Zweifel: weniger Elemente, brutaler gesetzt.

