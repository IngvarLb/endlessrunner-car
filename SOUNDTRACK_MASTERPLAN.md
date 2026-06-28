# SOUNDTRACK MASTERPLAN — `feudal-japan-endless-runner`

> Der definitive Plan für einen adaptiven, vollständig prozedural synthetisierten, **strikt instrumentalen** Web-Audio-Soundtrack.
> Zielengine: `src/engine/audio/ProceduralAudioService.ts` (96 BPM, 16 Steps/Bar, `SIXTEENTH_SECONDS = 0.15625`, Look-ahead-Step-Sequencer 25 ms / 0.12 s).
> Keine Audiodateien, keine Samples, keine Aufnahmen, keine Vocals. Alles aus OscillatorNodes, Noise-Buffern, BiquadFiltern und Gain-Envelopes.

---

## 0. Vision & Leitidee

Der Soundtrack ist **ein endloser, aufmerksamer Song-Raum**, kein geloopter Beat. Sein Rückgrat ist die **Nujabes / Samurai-Champloo-Welt**: warmer Lo-Fi-Hip-Hop mit jazzigen min7/9/11-Voicings, behind-the-beat-Swing und japanischen Instrumenten (Koto, Shamisen, Shakuhachi, Taiko) über dem Beat. Von diesem Spine biegt jedes Biom hörbar in sein eigenes Genre ab — das 電脳都市 Neon-City klingt als straffer, swing-freier Synthwave/Future-Funk-Pol *unmissverständlich anders* als das halftime-langsame, modal-treibende 奥山渓谷 Misty-Valley. Die Musik ist dabei kein Hintergrundteppich, sondern ein **Tachometer**: sie schichtet sich mit `speedRatio`, `combo` und `danger` auf, blendet an Leg-Grenzen beat-locked über und antwortet mit scale-locked Stingern auf Abilities — und sie wiederholt sich dank generativer Melodie, Song-Form-Statemachine und Per-Bar-Variation *nie exakt*, ermüdet also auch über eine 10-Minuten-Fahrt nicht.

---

## 1. Was guten (Game-)Soundtrack ausmacht

Die vier Grundtechniken adaptiver Spielmusik und die Handwerksprinzipien, die diesen Plan tragen:

### 1.1 Vertical Layering (additive Stems)
Eine harmonische Bett-Schicht, in 5–8 bar-gelockte Layer zerlegt, die per Intensitäts-Parameter ein-/ausfaden. *Wann* Noten passieren ändert sich nie, nur *wie viele* Layer hörbar sind — daher nahtlos. **Hades** (Darren Korb), **Journey** (Austin Wintory, Solo-Cello-Bett das mit dem Spieler atmet), **Koji Kondo** (Mario-64-Instrumentenwechsel pro Umgebung). Das ist unser **primäres Intensitäts-Tool**, gemappt auf `speedRatio`/`combo`/`danger`.

### 1.2 Horizontal Re-Sequencing (Phrasen-Pool)
Statt fester Loops wird die *nächste* musikalische Phrase aus einem Pool gewählt. **Ocarina of Time / Hyrule Field**: 8 Phrasen aus ~12 zur Laufzeit neu zusammengesteckt → praktisch nie identische Wiederholung. Das ist unser **Haupt-Anti-Fatigue-Werkzeug** für die Lead-Melodie (matched question/answer-Phrasen, alle 2 Bars neu gewählt).

### 1.3 Transitions / Crossfades (beat-synced)
Der Profi-Move: jeden State-Change auf eine **musikalische Grenze quantisieren** — nächster Beat (Stinger), nächster Bar (Layer), nächste Phrase / 8-Bar-Grenze (Section/Biom). Wintory: die *Nähte* musikalisch machen, nicht verstecken. **Harte Regel der Engine: jeder State-Change kommt in eine `pendingChanges`-Queue und wird erst an der passenden Grenze angewendet — nie sofort.**

### 1.4 Stingers (Event-Musik)
Kurze, nicht-loopende One-Shots auf diskrete Events (Ability 龍/鬼/将/狐/藍/赤, Coin, Near-Miss, Crash, Combo-Milestone). Mario-Coin/1-Up-Jingles als Archetyp — sie funktionieren, weil sie **scale-locked** in der aktuellen Mode/Akkord liegen. Combo-Pickups laufen die Skala hinauf (`degree = comboCount % scaleLen`), Reset bei Combo-Break.

### 1.5 Was eine kurze Loop wie einen *Song* klingen lässt
- **Question/Answer-Phrasing** (Antecedent/Consequent): Bars 1–2 fragen (unaufgelöst, steigende Kontur), Bars 3–4 antworten (aufgelöst auf Root/Terz, fallend). Das wichtigste „Song-ness"-Device.
- **Harmonic rhythm**: die Akkorde *bewegen sich* (mind. 1 Wechsel/Bar). 4-Akkord-Turnaround mit Rückzug in Bar 1.
- **Tension/Release über die Loop** + **Negative space** (Stille als Instrument — der Nujabes-Grund, warum Champloo-Beats nicht ermüden).
- **Song-Form über viele Loops**: Intro → A → A′ → B → A → Bridge → A (Re-Sequencing auf Form-Ebene).
- **Motif economy** (Kondo, Hisaishi, Shimomura): *ein* Motiv pro Biom, in Lead/Bass/Stinger wiederverwendet und reharmonisiert.
- **„Change one thing per repeat"** — das billigste Anti-Fatigue-Device überhaupt.

### 1.6 Hip-Hop-Beat-Bau (der Spine)
- **Backbeat**: Snare auf Beat 2 & 4 (Steps 4 & 12) — der Anker.
- **Boom-Bap/Lo-Fi**: Kick auf 0/6/10 + synkopierter Push, runde Sinus-Kick, gebürstete Snare (Bandpass ~1,6 kHz), sparsame Hats.
- **Swing**: ungerade 16tel verzögern. 56–60 % MPC = +18…+31 ms bei `SIXTEENTH = 156 ms`.
- **J-Dilla-„drunk"-Timing**: *kein globaler Swing*, sondern Per-Voice-Konflikt — Kick spät (+18 ms), Snare früh (−6 ms), Hats auf dem Swing-Grid.
- **Ghost-Notes** (Velocity 0,12–0,3) = der „played, not stamped"-Effekt, höchster ROI für Menschlichkeit.
- **Sidechain**: Bass/Pads unter jedem Kick ducken — räumt das Low-End frei *und* schafft Headroom (gegen Clipping).

Referenz-Komponisten, die den Ansatz prägen: **Nujabes / Fat Jon / Uyama Hiroto** (Spine), **Hideki Naganuma** (Cut-up-Funk-Grammatik → Neon-City & Warp-Stutter), **Joe Hisaishi** (offene Intervalle → Forest), **Koji Kondo** (Motif-Ökonomie + Interaktivität), **Austin Wintory / Darren Korb** (adaptive Layering-Architektur), **Disasterpeace / Lena Raine** (sus/add9-Loops ohne Kadenz, sanfte Modulation).

---

## 2. Musiksprache pro Biom

| Biom | Genre / Referenz | Key / Scale | Tempo-Feel | Groove / Swing | Lead-Instrument | Stimmung |
|---|---|---|---|---|---|---|
| **Village Summer** 緑陰 | Nujabes Lo-Fi-Hip-Hop | D yo (D–E–G–A–B) / D Dorian Bett | 96, full-time | +30 ms Swing (~58 %); Kick spät, Snare früh | Koto/Shamisen-Pluck | warm, sonnig, head-nodding |
| **Village Autumn** 紅葉雨 | melancholischer Jazz-Lo-Fi | D in-sen (D–E♭–G–A–C) | 96, ~88-Feel | +40 ms Swing (lazy, near-triplet) | Rhodes E-Piano + Muted-Trumpet | bittersüß, regnerisch, smoky |
| **Neon City** 電脳都市 | Naganuma × Synthwave × City-Pop | F♯ minor / Dorian-Lift / harm. minor | 96, **double-time** | **0 Swing** (dead straight 16tel) | Supersaw-Lead + Funk-Horn-Stab | elektrisch, cocky, neon-noir |
| **Forest Valley** 奥山渓谷 | Ambient/Downtempo + Shakuhachi/Taiko | A minor pent / modal (A–B–D–E–G) | 96, **half-time** | +19 ms Swing (~54 %); Taiko spät | Shakuhachi (Bambusflöte) | weit, andächtig, treibend-meditativ |
| **Menu** 控室の灯 | warmer Lobby-Lo-Fi | D yo / Dmaj9-Bett | 96, half-time | +25 ms Swing | Koto-Theme-Pluck + Rhodes | einladend, cozy, anticipatory |
| **Garage** | mechanical-cool (Brücke zu Neon) | D Dorian / D natural minor | 96, straight 16tel | **0 Swing** | PWM-Saw-Blip | sleek, confident, „tuning up" |

**Geteilter Master-Clock:** Alle Biome locken auf 96 BPM / 16 Steps / 4-Bar-Loop. Tempo-Charakter kommt aus **Subdivision** (half/double-time) und **Swing**, NIE aus dem Retunen des Schedulers. Dadurch sind alle Crossfades beat-locked ohne Retiming.

**Transition-Pivots** (geteilte Töne für saubere Übergänge):

| Von → Nach | Pivot-Trick |
|---|---|
| Menu/Garage → Village | identischer D-Tonic — direkter Beat-Lock + Key-Lock |
| Village → Autumn | gleicher D-Tonic; nur Scale-Farbe (yo→in-sen) crossfaden |
| Village/Autumn → Neon | **A** geteilt (D-Quinte = ♭3 von F♯m); A im Pad halten |
| Neon → Forest | **A** Pivot; F♯m → A-Pentatonik = Relativ-Dur-Öffnung |
| Forest → Village | A → D = sanfter V→I-Rückgang |

> **Authoring-Constraint (aus der Kritik):** Jedes Biom-`intro`-Pad-Voicing MUSS den Pivot-Ton physisch enthalten, sonst „bumpt" der Crossfade statt zu gleiten. Das ist Content-Disziplin, kein Code. → Checkliste in §9.

---

### 2.1 Village-Summer — 緑陰 „Green Shade" (der Anker)

Die **hellste** und einzige fully-major-leaning Region — D yo hat *kein* b2 (das E♭ ist für Autumn reserviert, damit der Season-Flip als „Farbe ausbluten" liest). Das Bett ist D Dorian, sodass die große Sexte (B) und kleine Terz (F) koexistieren: warm mit wehmütiger Kante.

**Akkord-Progressionen (1 Akkord/Bar):**
| Section | Akkorde | Bars |
|---|---|---|
| A (home) | Dm9 – Gmaj7 – Am7 – Bm7 | 4 |
| A2 (reharm) | Dm9 – Gmaj7 – Em7 – A7sus4 | 4 |
| B (Lift) | Gmaj7 – Bm7 – Em7 – A7sus4 | 4 |
| Bridge | Dm9 Pedal-D (Oberstimmen driften Dm9→Dm6→Gadd9) | 4 |
| Turnaround | Em7 – A7sus4 | 1 |

**Motive (echte Noten):**
- *Ryokuin-Frage* (Antecedent): `D4 – E4 – G4 . . A4` — steigend, endet unaufgelöst auf der 6 (A) über Dm9.
- *Ryokuin-Antwort* (Consequent): `B4 – A4 – G4 – E4 . D4` — fallend, landet auf Root D.
- *Koto-Flourish*: `D5 – B4 – A4 – G4 – E4 – D4` schnelle absteigende yo-Kaskade (nur an Turnarounds).
- *Blue-Note*: `…G4 – F4 (b3 passing) – E4…` nur auf schwachen Beats.

**Drums:** dusty Boom-Bap, behind-the-beat. Kick Sinus 132→47→34 Hz auf Steps 0/6/10 (+Push auf 14 in ungeraden Bars). Snare zweischichtig (Triangle-Body 182→145 Hz + Noise-Bandpass 1700 Hz Q1,3) auf 4/12. Ghost-Snares auf 3/7/11 @ vel 0,18 (p=0,12). Hats highpass 6,4 kHz, 8tel swung. Fills: letzter Bar jeder 8-Bar-Section → Hat-Roll auf 14–15.

**Layer (Gate-Schwelle):** L0 Kick+Sub (always) · L1 Snare+Hats (always) · L2 Rhodes/Pad-Bett (≥0,0, schwillt mit Speed) · L3 Koto-Lead (≥0,25) · L4 Shakuhachi-Counter (≥0,55) · L5 16tel-Hats+Shaker+Taiko (≥0,70) · L6 Ornament/Koto-Kaskaden+Filter offen (≥0,80).

**Kontrast:** swung + akustisch + dusty + hellste Scala — gegen Neon (straight, elektronisch, Moll) und Forest (half-time, sparse, drone).

---

### 2.2 Village-Autumn — 紅葉雨 „Maple-leaf Rain" (der Jazz-Cousin)

Eine **Reharmonisierung** von Summer, nicht ein neuer Song — gleicher D-Tonic, damit der Übergang „derselbe Ort, andere Jahreszeit" liest. yo→in-sen + maj7→min7/♭9 lässt die Wärme ausbluten.

**Akkord-Progressionen:**
| Section | Akkorde | Bars |
|---|---|---|
| A (home) | Dm9 \| Gm7 \| Em7♭5 \| A7♭9 | 4 |
| A′ (reharm) | Dm6 \| Gm7 \| Bm7♭5 \| A7♭9 | 4 |
| B (ii–V Lift) | Gm7 \| C7 \| Fmaj9 \| E♭maj7(♯11) | 4 |
| Bridge | Dm(add9) Pedal-D | 4 |
| Turnaround | Em7♭5 \| A7♭9 (chromatischer Walk C♯→D) | 2 |

**Motive:** *Momiji-Fall* (Frage): `A4 – G4 – F4 – D4` absteigend, hängt auf D. *Antwort*: `E♭4 – D4 – C4 – A3` (das E♭ = der „Seufzer" / b2 in-sen). Coin-Run: `D–E♭–G–A–C–D′` aufwärts.

**Drums:** weicher, gebürstet. Kick 95→48 Hz auf 0/6/10. Brushed-Snare (Bandpass 1,3 kHz Q1,0, 200 ms Decay) auf 4/12, Ghosts auf 7/14. **Rain-Bed** ersetzt Vinyl-Crackle (lowpass ~6 kHz / highpass ~400 Hz Noise, 0,3-Hz-Shimmer). Fill: gelegentlicher Taiko-„Donner"-Thud auf 12.

**Signatur-Stimme:** Rhodes E-Piano (Sinus-Fundamental + Tine-Oktave @ 0,3 Gain kurzes Decay) als Chord-Stabs auf synkopierten Off-Beats. Muted-Trumpet (Saw→Lowpass 1,2 kHz, slow Vibrato) als Solo nur in B/High-Intensity.

**Kontrast:** harmonisch reichster/jazzigster Pol; gleicher Key wie Summer, gegensätzliche Farbe.

---

### 2.3 Neon City — 電脳都市 „Tokyo Midnight Overdrive" (der laute Pol)

Muss **sofort** anders klingen, wenn die Fahrt hineinfährt. F♯ minor Heimat, F♯ Dorian (raised 6 = D♯) für JSR-Funk-Lift, harmonic minor (E♯) für Synthwave-Drama in B.

**Akkord-Progressionen:**
| Section | Akkorde | Bars |
|---|---|---|
| A | F♯m – D – E – C♯m (i–♭VI–♭VII–v) | 4 |
| A2 | F♯m – D – E – Bsus2 | 4 |
| B (City-Pop ii–V) | F♯m9 – Bm9 – E9 – Amaj7 | 4 |
| B-Turnaround | G♯m7♭5 – C♯7♭9 – F♯m9 (harm.-minor Kadenz) | 2 |
| Bridge | F♯m(add9) – Amaj9 (Vamp auf A-Pivot) | 4 |

**Motive:** *Skyline* (Frage): `F♯5 – A5 – B5 – C♯6`, hängt auf C♯. *Antwort*: `B5 – A5 – F♯5` löst auf Tonic. *Funk-Stab-Cell*: rootless `A4–C♯5–E5` auf Steps 3/7/11. *Bass-Slap*: `F♯2(0) – F♯2(3) – C♯3(6) – F♯3-pop(7) – E2(10) – F♯2(13) – F♯3-pop(14)`. *龍-Warp-Glitch*: ein Ton (C♯6) alle 1–2 Steps retriggert, +1 Halbton pro Retrigger, öffnender Filter.

**Drums:** elektronisch, gated. Four-on-the-floor Kick (0/4/8/12, Sinus 130→52 Hz + Highpass-Noise-Click). Clap/Snare auf 4/12 (Noise-Bandpass 2 kHz + 3-tap Micro-Flam +0/+8/+16 ms). Straight 16tel-Hats. Synkopierte Ghost-Kicks auf 7/13.

**Bass = das Naganuma-Element:** elastischer Funk-Synth-Bass — Saw durch resonanten Lowpass (Q 6–8) mit **Per-Note-Filter-Env** (Cutoff 250→1800 Hz in 40 ms, zurück in 120 ms = das „talking" Pluck), Oktav-Pops auf den „a"-Steps, Legato-Slides.

**Layer:** L4 Supersaw-Lead (≥0,25) · L5 Funk-Horn-Stabs (≥0,55) · L6 Chip-Funk-16tel-Arp (≥0,70) · L7 Vowel-Wah-Answers + 1/32-Rolls + Filter offen (≥0,80).

**Kontrast:** der einzige fully-electronic, no-swing, four-on-floor Leg — jede Achse flippt vs. alle Nachbarn.

---

### 2.4 Forest Valley — 奥山渓谷 „Drifting Through the Mist" (der ruhige Pol)

Tonic A, A minor pent / modal (A–B–D–E–G), Shakuhachi borgt in-sen-Farbe (B♭ nur als „meri"-Bend-Ornament, nie harmonisiert). **Keine** Leading-Tones, **keine** starke V→i-Kadenz — sus/add9/offene Quinten, damit die Loop nie „enden will".

**Akkord-Progressionen (jeweils 2 Bars, 8-Bar-Zyklus):**
| Section | Akkorde |
|---|---|
| A (Mist) | Am(add9) \| Am(add9) \| Fmaj7 \| Fmaj7 (Bass pedalt A) |
| A2 (Drift) | Am(add9) \| Cmaj7 \| Fmaj7 \| G6sus2 |
| B (Clearing) | Cmaj7 \| G6 \| Fmaj7 \| Fmaj7 (+2-Lift optional) |
| Bridge | Am(add9) Drone, keine Bewegung — Pad+Sub+Shakuhachi-Solo |
| Build | Fmaj7 \| G6sus2 \| Am(add9) \| Am(add9) + Taiko-Tom-Run |

**Motive:** *Mist Call* (Frage): `A4 — (Pause) — G4 — E4 … D4` (mit meri-Bend hoch von C♯4), endet unaufgelöst auf der 4 (D). *Valley Answer*: `E4 — G4 — A4 … A4` (lang gehalten, steigt zur Tonic). *Koto-Drift*: `A4–B4–D5–E4`.

**Drums:** half-time, taiko-forward, viel Negative Space. **Großes Taiko** (ō-daiko) auf Step 8 only (+12 ms spät): Sinus 90→55 Hz + 250–350 ms Body + Highpass-Noise-„thwack". „Ka"-Holzrim auf 6/14. Mallet-Hats sparse (HAT_KEEP_P 0,85). Fill: Taiko-Tom-Run `A1→D2→E2→A2` auf 10/12/14/15.

**Bass:** tiefe, langsame, fast drone-artige Sinus-Sub, ein Ton pro Akkord (2 Bars), Legato-Portamento 80 ms, BASS_MOVE_P nur ~0,25 (meditativ statisch).

**Lead:** Shakuhachi = Triangle + Breath-Noise (Bandpass tracking, ~12 % Gain), Vibrato-LFO 5 Hz das über 200 ms *einblüht*, meri-Bend (Portamento von Halbton unter, 90 ms), Lowpass 2,2 kHz, langer Release 400–700 ms (fake Reverb-Tail).

**Kontrast:** half-time (langsamster Puls), meiste Stille, akustisches Taiko+Shakuhachi, modal/drone — die explizite Antithese zu Neon.

---

### 2.5 Menu / Garage — 控室の灯 „Waiting-Room Light"

Beide in **D** (lockt nahtlos in Village leg0). Menu = wärmster/ruhigster Pol; Garage = Brücke zwischen Lobby-Ruhe und Neon-Energie.

**Menu** (half-time, light Swing +25 ms): `Dmaj9 – Gmaj7 – Em7 – Asus4(add9)` (A), Turnaround `Em7 – A7sus4 – F♯m7 – Gmaj9`. Solo-Koto stellt das **Lobby-Theme** (`D4 – E4 – G4 – A4` Frage / `B4 – A4 – G4 – D4` Antwort) — dessen Fragmente in Village leg0 wiederverwendet werden, sodass der Run-Start den musikalischen Satz *vollendet*. Weicher Kick auf 0/10, Brushed-Snare auf 8, Vinyl-Crackle-Bed.

**Garage** (**0 Swing**, straight 16tel-Hats): `Dm9 – Dm9 – B♭maj7 – C(add9)` (A), `Dm9 – Cmaj7 – B♭maj7 – A7sus4` (B). Clicky-Kick auf 0/8, mechanischer „Clank" (Bandpass-3 kHz-Noise-Click, 8 ms) auf Step 6 von Bar 3 als „tuning-up"-Tell. PWM-Saw-Blip-Lead. Garage-Motiv: `D4 – F4 – E4 – D4` (Moll-Reharm des Lobby-Calls).

**Menu↔Garage-Swap** = horizontales Re-Sequencing, quantisiert auf nächsten Bar: Rhodes-Bett raus / PWM-Bett rein über 1 Bar, Swing 0,16→0, D-Pedal + Koto-Motiv durchgehend.

---

## 3. Anti-Monotonie- & Variations-Engine

**Kernproblem:** Eine fixe 4-Bar-Loop wird in ~30–60 s vorhersagbar und kippt dann von „Musik" zu „Reizung". Bei 96 BPM = 4-Bar-Loop = 10 s → nervt nach ~90 s–2,5 min, mitten in einem Biom-Leg. **Faustregel zum Ausliefern:** *nichts oberhalb des Kick-Patterns darf länger als ~30 s (≈12 Bars) identisch wiederholen.* Volle A-Section-Rückkehr erst nach 64–128 Bars (~2,5–5 min).

### 3.1 Mikro-Variation (pro Bar, im `scheduleStep`)
- **Swing**: ungerade Steps verzögern um `swing × SIXTEENTH` (Village 0,16 · Autumn 0,18 · Neon 0,0 · Forest 0,12).
- **Per-Voice-Jitter** (triangulär, `tri() = (rand+rand)/2*2-1`): Drums ±6 ms, Pluck ±12 ms, Bass ±4 ms.
- **Velocity-Humanize**: Accent-Map (Downbeat 1,0 / On 0,85 / Off 0,7) × `(1 − rand·0,18)`.
- **Ghost-Notes**: Snare auf 3/7/11 (p=0,12), Hat-Drop (HAT_KEEP_P 0,92), Extra-Pluck (p=0,10).
- **Hat-Rolls**: letzter Beat eines Bars (p=0,18), garantiert im letzten Bar jeder Section.
- **Filter-Bewegung**: gemeinsamer Lowpass auf dem Pluck/Pad-Bus, 8-Bar-Cosinus-Swell `cutoff = base + depth·(0.5 − 0.5·cos(2π·(bar%8)/8))` — ein Node, größter „lebendig"-Effekt.

> **Per-Bar-Budget:** ~15–25 % der Events pro Bar ändern — **nie** den Kick auf Step 0.

### 3.2 Makro-Variation / Song-Form (8-Bar-Sections)
Section-Statemachine über einen 64-Bar-Macro-Zyklus:
```
SECTIONS = [intro, A, A2, B, A, bridge, A2, build]   // 8 × 8 Bars = 64 Bars ≈ 2,7 min
```
- **intro** — sparse: Pad+Bass+Noise-Bed, Filter zu, kein Lead (nach Biom-Crossfade / Combo-Break-Exhale).
- **A / A2** — Home-Groove; A2 = Motif transponiert, Drums voller.
- **B** — Kontrast: Mode hellt auf, Counter-Lead antwortet, busier Hats.
- **bridge** — **Drums mandatorisch raus/half** (nicht probabilistisch — Kritik-Fix!), Pad + Solo-Lead, Pedal-Point. Negative Space, der die Habituation *resettet*.
- **build** — Layer einzeln pro Bar zurück, Filter öffnet, 2-Bar-Fill als Turnaround.

> **Kritik-Fix — Groove-Variation, nicht nur Ornament:** Pro Section zwischen **2–3 Kick/Snare-Grid-Varianten** rotieren. Reine Humanisierung überlebt nur ~3–4 min; das unveränderte Backbeat-Skelett ist der eigentliche Fatigue-Treiber. Die Bridge-Drum-Drop ist **Pflicht**.

### 3.3 Generative Melodie (Markov + Motif-Transform)
- **Scale-Degree-Repräsentation** + Per-Biom `markov[][]` (Transitions-Gewichte Grad→Grad, zeilen-normalisiert), favorisiert Schritte über Sprünge, Chord-Tones auf starken Beats.
- Regeln pro Noten-Slot: Rhythmus per Density-Maske × Intensität; Pitch aus `MARKOV[current]`; Strong-Beat-Gravity (Steps 0/8 → 60 % Root/Quinte); Sprung >5 Grade erzwingt Step-Back (Contour-Smoothing → singbar); `REST_P = restPBase − 0.25·intensity`.
- **Motif-Transforms** auf den Degree/Time-Arrays — *transformieren* statt regenerieren, damit die Melodie sich *entwickelt*:

| Section | Transform |
|---|---|
| A | identity |
| A2 | transpose +2 |
| B | retrograde |
| bridge | augment(invert) |
| build | ornament(grace notes ∝ intensity) |

- **Phrasen-Pool** (Hyrule-Field): 6–12 matched question/answer-Phrasen, alle 2 Bars neu gewählt, letzte 2 vermeiden, dichter/höher bei hoher Intensität, B-Pool nur in B.

### 3.4 Die Endless-Garantie
- Längste identische *hörbare* Phrase: ≤ 8 Bars (und auch die variieren per §3.1).
- Volle strukturelle Rückkehr (Section + Key + Motif-State): durch Section-Zyklus × Key-Rotation (alle 128 Bars, `[0,−2,+3,−5]` Halbtöne) × Motif-Transform jenseits ~256 Bars (~10 min) geschoben.

---

## 4. Adaptive Kopplung ans Gameplay

`setRunIntensity` füttert weiterhin den Drone (`applyEngineIntensity`) UND, geglättet, den Arranger:
```
intensityTarget = clamp01(0.50·speedNorm + 0.30·comboNorm + 0.20·dangerNorm)
// in advanceBar: intensitySmoothed += (intensityTarget − intensitySmoothed) · 0.05   (~1 s Lag)
```

### 4.1 Was Intensität treibt
- **Layer-Gates** (mit Hysterese ±0,08, Fade ~0,6 s via `setTargetAtTime`). Speed → untere Layer; Combo/Danger → L5–L7 (reserviert, damit hohe Layer „verdient" wirken).
- **`restP`, Hat-Subdivision, Swing→0 bei hoher Intensität, Master-Lowpass-Cutoff.**
- **Section-Forcing**: Combo-Milestone (×8/×16) → früh in `build` + Fill; Crash/Combo-Break → 4 Bars `intro`-Dichte (musikalischer Exhale).

### 4.2 Layer-Gate-Tabelle (Smoothed Intensity)
| Layer | Inhalt | Gate on |
|---|---|---|
| L0 | Kick + Sub | 0,0 |
| L1 | Snare/Hat | 0,0 |
| L2 | Bass | 0,0 |
| L3 | Pad/Chord-Bett | 0,0 (leise) |
| L4 | Lead | 0,25 |
| L5 | Counter/Stabs | 0,55 |
| L6 | Garnish/Arp | 0,70 |
| L7 | Ornament/Rolls | 0,80 |

### 4.3 Biom-Crossfade (beat-locked)
Da alle Themes denselben 96-BPM-Grid teilen, sind Crossfades **reine Gain-Ramps an einer Phrasen-Grenze** — kein Tempo-Reconciliation. `setBiome(nextKey)` setzt nur `pendingBiome`; angewendet an der nächsten 8-Bar-Grenze: eingehende Persistent-Voices bei 0,0001 bauen → über `CROSSFADE_BARS=2` Gains kreuzen → Theme an Mid-Crossfade-Bar swappen (eingehend startet auf `intro`) → EV-Drone durchgehend → ausgehende Voices erst nach `stopTime+release+0.05` abbauen. Pivot-Ton im ersten eingehenden Voicing halten.

### 4.4 Event-Stinger
`fireStinger(type)` quantisiert auf nächsten Beat, scale-locked aus aktuellem Akkord:
- **龍** Hyperspeed = Naganuma-Stutter (ein Ton retriggert, +1 Halbton, öffnender Filter).
- **赤** Boost = Filter-Sweep + Oktav-Sprung.
- **鬼** Black-Hole = absteigender chromatischer Sub-Glide.
- **Coin** läuft die Skala hinauf; Combo-Break resettet.

> **Kritik-Entscheidung (§9):** Stinger sind **Musik** (über `duckBus`, gesidechained), NICHT SFX — sonst umgehen sie den musikalischen Sidechain. Die EV-Engine bleibt auf `sfxGain`.

---

## 5. Synthese-Palette

Alle Rezepte folgen dem Engine-Stil: `createOscillator/Gain/BiquadFilter`, `setValueAtTime` + `exponentialRampToValueAtTime` auf Floor `0.0001`, Attack ≥6 ms.

### 5.1 Transiente One-Shot-Voices
| Instrument | Oszillator(en) | Filter | Envelope / Spezial |
|---|---|---|---|
| **Koto/Shamisen-Pluck** | Saw, Pitch-Blip +30 cents → settle 18 ms | Bandpass `note×2.6`, Q6 | 2 ms Noise-Exciter (HP 3 kHz) am Onset; Attack 5 ms, Decay 250 ms (V) / 280 ms (Autumn); wow-LFO 0,7 Hz ±10 cents |
| **Shakuhachi** | 2× Triangle ±6 cents | Lowpass 1,8–2,2 kHz | Breath-Noise → Bandpass(note,Q4) @0,12; Vibrato-LFO 5 Hz ±12 cents, blüht über 200 ms ein; meri-Bend Portamento 90 ms; Attack 80 ms, Release 400–700 ms |
| **Taiko** | Sinus 90→55 Hz exp/70 ms | — | 3 ms Noise-thwack (HP 1,5 kHz @0,15); Attack 6 ms→0,5, Decay 250–350 ms |
| **Rhodes E-Piano** | Sinus-Fund. + Sinus +1 Okt @0,3 (Tine) ±5 cents | Lowpass 2,8–3 kHz | Voice A Decay 800 ms, B 150 ms; Tremolo-LFO 5 Hz, Depth 15 %; Chop-Mode: Attack 5 ms, Gate 70 ms |
| **Round-Bass** (V) | Sinus + Triangle +1 Okt @0,15 | Lowpass 140 Hz | Attack 12 ms, Decay 340 ms; Legato linearRamp 60–80 ms |
| **Funk-Synth-Bass** (Neon/Garage) | Saw + Sinus-Sub (nur Downbeat) | resonant LP Q6–8, **Per-Note-Env** 250→1800→250 Hz | Oktav-Pop +12 auf „a"-Steps; Legato-Ramp 50 ms; Attack 6 ms, Decay 180 ms |
| **JSR-Funk-Horn-Stab** (Neon) | 1 Square + 1 Saw ±6 cents | LP mit Downward-Blip im Release | Attack 3 ms, gated Release 60–90 ms |
| **Chip-Funk-Arp** (Neon L6) | Square (od. Square/Saw alternierend) | — | Decay 18 ms; PWM-Feel via 2 detunte Squares + slow Width-LFO |
| **Vowel-Wah-Lead** (Neon-Accent) | Saw | **3× parallel Bandpass** (Formant-Trios) + scripted Vokal-Glide | siehe Kritik §9 — NICHT „Talkbox" nennen |

### 5.2 Persistente Textur-Voices (einmal pro aktivem Biom gebaut)
| Pad-Variante | Oszillatoren | Filter |
|---|---|---|
| **Village warm** | 2× Saw ±7 cents pro Chord-Tone | LP swellt 1,2→3 kHz über 4-Bar-Phrase |
| **Autumn min7** | 3× Triangle ±7 cents + 2× Saw airy | LP 0,07-Hz-Cutoff-LFO (8-Bar-Swell) |
| **Neon PWM** | 4× Square (Paare ±8, ±15 cents) | LP 1,5 kHz base + 0,15-Hz-LFO ±600 Hz |
| **Forest Mist** | 3–4 detunte Tri/Sinus über Oktaven | LP 0,08-Hz-LFO 600→2500 Hz |

**Noise-Beds** (eine `noiseBuffer`-Source, `loop=true`, HP+LP, −34 dB, 0,3-Hz-Shimmer): Vinyl-Crackle (V) / Rain (Autumn) / Wind-Air (Forest).
**Shared-LFO-Pool** (einmal bei `startMusic`): `wowLfo` 0,7 Hz · `vibratoLfo` 5 Hz · `tremoloLfo` 5 Hz · `padSwellLfo` 0,08 Hz. Voices connecten ihre `gain.gain`/`detune` daran.

---

## 6. Technische Architektur

Rein additiv auf die bestehende Engine. Der 25-ms/0,12-s-Scheduler bleibt unverändert; nur *was* `scheduleStep` entscheidet, ändert sich.

### 6.1 Datenmodell (deklarativ, ersetzt hardcodierte `BASS_PATTERN`/`PLUCK_PATTERN` + `if(musicMode)`-Branches)
```ts
type ScaleDegrees = number[];   // Halbton-Offsets vom Tonic, yo = [0,2,5,7,9]
type Voicing = number[];        // Halbtöne über Chord-Root (rootless)
interface ChordDef  { rootDegree: number; voicing: Voicing; }
interface SectionDef {
  name: "intro"|"A"|"A2"|"B"|"bridge"|"build"; bars: number;
  chords: ChordDef[]; eligibleLayers: LayerId[];
  motifTransform: "identity"|"transpose2"|"retrograde"|"invert"|"ornament";
  intensityFloor?: number;
}
interface DrumLayer {
  kickSteps: number[]; snareSteps: number[]; hatSteps: number[];
  ghostSnareSteps: number[]; ghostSnareP: number;
  hatKeepP: number; openHatSteps: number[];
  kit: "boombap"|"brushed"|"electronic"|"taiko";
  gridVariants?: DrumLayer[];   // 2–3 Groove-Varianten pro Section (Kritik-Fix)
}
interface BiomeTheme {
  key: BiomeKey; tonicHz: number;
  leadScale: ScaleDegrees; chordBedScale: ScaleDegrees;
  swing: number; microOffsetMs: {kick;snare;hat;pluck;bass};
  jitterMs: {drums;pluck;bass};
  drums: DrumLayer; bass: {kind:"round"|"walking"|"funk"|"drone"; moveP:number};
  chordProgressions: Record<string, ChordDef[]>;
  sections: SectionDef[]; layerGates: Record<LayerId,{on;off}>;
  instruments: {lead;counter;pad;bass};
  phrasePool: {question:Phrase[]; answer:Phrase[]; bPool?:Phrase[]};
  markov: number[][]; variation: {restPBase;pluckAddP;hatRollP};
  noiseBed: "vinyl"|"rain"|"wind"|"none";
}
type Phrase = Array<{step;degree;durSteps;vel}>;
type LayerId = "L0"|"L1"|"L2"|"L3"|"L4"|"L5"|"L6"|"L7";
```
Pitch-Helper: `freq = tonicHz · 2^((scale[degree%len] + 12·octave + rootRotation)/12)` ersetzt `NOTE_FREQUENCIES` für melodischen Content (Tabelle bleibt für SFX).

### 6.2 Arranger-State + Bar-Boundary-Precompute
```ts
private arr = {
  theme, barCounter, sectionIdx, sectionBar, chordIdx,
  rootRotation, intensitySmoothed, intensityTarget,
  layerGain: Record<LayerId, GainNode>,   // persistente Busse
  barPlan,                                  // pro Bar vorberechnet, In-Place wiederverwendet
};
```
In `scheduleStep`, wenn `step % STEPS_PER_BAR === 0` → `advanceBar()` VOR Step-0-Dispatch:
- `barCounter++`, `sectionBar++`, Section-Advance, alle 128 Bars `rootRotation` rotieren.
- Bar-Akkord wählen, persistentes Pad via `setTargetAtTime` umpitchen.
- alle 2 Bars: question/answer aus Pool, `motifTransform`, in `barPlan.leadNotes: Map<step,{freq,vel}>` flatten.
- Drum-Hits, Ghost-Coin-Flips, Fill-Flag, Bass-Noten vorberechnen.

**Alle Zufalls-Rolls passieren HIER** (in `barPlan`-Arrays). Der heiße 25-ms-Tick liest nur `barPlan` und baut Nodes — kein RNG/keine Musiklogik im Scheduler. **`advanceBar` muss billig sein (keine Allokation, `barPlan` in-place)** — sonst kann ein Catch-up-Burst 8× `advanceBar` in einem Tick die Lateness selbst verursachen (Kritik §9).

### 6.3 Per-Step-Dispatch (neuer `scheduleStep`-Body)
```ts
private scheduleStep(step, time) {
  const local = step % STEPS_PER_BAR;
  if (local === 0) this.advanceBar();
  const sw = this.swingOffset(local);             // theme.swing wenn local ungerade
  if (this.layerLive("L0")) this.dispatchDrumsLow(local, time + sw);
  if (this.layerLive("L1")) this.dispatchDrumsHigh(local, time + sw);
  if (this.layerLive("L2")) this.dispatchBass(local, time + sw);
  // L3 Pad persistent — nur gain-gated, kein Per-Step-Work
  if (this.layerLive("L4")) this.dispatchLead(step, time + sw);
  if (this.layerLive("L5")) this.dispatchCounter(step, time + sw);
  if (this.layerLive("L6")) this.dispatchGarnish(local, time + sw);
  if (this.layerLive("L7")) this.dispatchOrnament(local, time + sw);
}
```
Jeder `dispatch*` addiert `microOffset + jitter` (Dilla-Konflikt). **Zeit-Clamp (Kritik-Fix P0):**
```ts
const t = Math.max(time + offsetMs/1000 + tri(jitterMs)/1000, ctx.currentTime + 0.005);
```
**Negative Offsets (Snare früh −6 ms) NIE auf Step 0** — sonst clampt Web Audio auf „jetzt" und produziert Click/Flam statt Push.

### 6.4 Mapping auf den realen `ProceduralAudioService`
| Real-Seam | Änderung |
|---|---|
| `scheduleStep` (~607) | Body → Layer-Dispatch + `advanceBar` |
| `shouldPlayKick/Snare/Hat` (~638–668) | → Theme-Grid-Lookups |
| `BASS_PATTERN`/`PLUCK_PATTERN` (~53–89) | → Generator |
| `startAndTrack` (~903–915) | → `trackChain` (Multi-Source, siehe §7) |
| `scheduleMusic` (~594) | + Lateness-Guard |
| `setRunIntensity`/`applyEngineIntensity` (~205/310) | + Music-Intensity-Smoothing |
| `activeMusicNodes` (~105) | Cleanup disconnectet ALLE Intermediates |
| BiomeManager | ruft `setBiome(legKey)`, deferred auf Phrasen-Grenze |
| `musicGain` (Base 0,38 × modeScale, ~16–21/586) | NICHT überschreiben — Auto-Scale als separater Node |

---

## 7. Performance & Knack-Vermeidung

Die dokumentierte Crackle = GC-Churn + **nicht-disconnectete Intermediate-Gain/Filter-Nodes**. `startAndTrack` disconnectet nur die Source.

### 7.1 Multi-Source-`trackChain` (Kritik-Fix P0 — der zentrale Bug)
`scheduleSnare` trackt HEUTE schon `body` UND `noise` als zwei Sources (je eigenes `onended`); `bodyGain`/`noiseFilter`/`noiseGain` sind verwaist. Eine Single-Source-`trackChain` würde bei Snare/Rhodes/Taiko/Shakuhachi/Funk-Bass (alle multi-source) **doppelt oder zu wenig disconnecten**. Lösung — Cleanup an die **zuletzt endende** Source hängen:
```ts
private trackChain(sources: AudioScheduledSourceNode[], chain: AudioNode[],
                   startTime, stopTime, group) {
  const set = group === "music" ? this.activeMusicNodes : this.activeSfxNodes;
  const last = sources.reduce((a,b) => (b.__stop > a.__stop ? b : a));
  for (const s of sources) { set.add(s); s.start(startTime); s.stop(s.__stop ?? stopTime); }
  last.onended = () => {
    for (const s of sources) { set.delete(s); s.disconnect(); }
    for (const n of chain) n.disconnect();     // DER FIX: Gains + Filter auch
  };
}
```
Für lange Tails (Shakuhachi 400–700 ms, Pad 1–2 s): `stopTime = noteEnd + release + 0.05`.

### 7.2 Pooling & Reuse
Pads, Drone-Leads, Supersaw, alle LFOs, Noise-Bed und Per-Layer-Gain-Busse **einmal pro aktivem Biom** gebaut, nur via `setTargetAtTime` moduliert. Einzige `noiseBuffer` für Hats/Snare/Shaker/Rain/Air via `playbackRate`+Filter — nie `createBuffer` pro Step.

### 7.3 Voice-Cap — mit ehrlichem Budget (Kritik-Fix P1)
Persistente Oszillatoren zählen als **always-on Floor**. Neon-Peak ehrlich: EV-Drone (6) + PWM-Pad (4) + Supersaw (5) + Bass (2) = **17 persistente Oszillatoren** vor dem ersten Drum; mit Transienten real ~25–30 Nodes.
→ **`MAX_MUSIC_VOICES = 32`** (nicht 24), ODER Supersaw auf 3 Saws ausdünnen (immer noch breit). Bei Überschreitung niedrigste Priorität zuerst droppen: Ornaments/Ghosts → Garnish → Counter → Lead; **nie L0/L1/Bass**. Hat-Rolls ≤4 Sub-Hits (≤6 Neon).

### 7.4 Headroom / Limiter
Alle melodischen Voices → `duckBus` → unter jedem Kick gesidechained (`duckBus.gain → 0.5` am Kick, linearRamp → 1,0 über 120 ms) = Pump + Headroom. Auto-Scale als **separater Node** vor dem Compressor (NICHT `musicGain.gain` überschreiben, sonst Kampf mit User-`musicVolume`): `≈ baseMusicVol · 0.9/sqrt(activeLayers)`. Bestehender Compressor (Threshold −10, Ratio 4) bleibt Safety-Limiter.

### 7.5 Lateness- & Background-Tab-Guard (Kritik-Fix P0)
Ein backgroundeter Tab drosselt `setInterval` → Node-Burst bei Rückkehr. Guard: wenn `ctx.currentTime − nextStepTime > 0.5`, **auf nächste Bar-Grenze snappen** und `advanceBar()` für JEDEN übersprungenen Bar synchron laufen lassen (billige Array-Mathe) — sonst friert die Song-Form ein während der Grid springt (Pad pitcht nicht um, Chord auf stale). Zusätzlich: Musik-Scheduling auf `document.hidden` pausieren.

### 7.6 Keine Zipper-Clicks
Jeder Attack ≥6 ms, jeder `exponentialRampToValueAtTime`-Floor ≥0,0001 (nie 0).

---

## 8. Umsetzungs-Roadmap in Phasen

Jede Phase unabhängig auslieferbar & testbar.

### Phase 1 — MVP-Slice (fixt Crackle + macht den BESTEHENDEN Beat lebendig)
1. **Multi-Source-`trackChain`** (§7.1) + Voice-Cap-Instrumentierung (§7.3) + Lateness/Background-Guard (§7.5).
2. **`duckBus` + Sidechain + Per-Layer-Gain-Busse** (§7.4) zwischen Voices und `musicGain`.
3. **Humanisierung des bestehenden Loops**: Swing + Jitter + Velocity + Ghost/Drop in die aktuellen Builder (§3.1), mit Zeit-Clamp (§6.3).
4. **Smoothed Intensity + Layer-Gating** off `setRunIntensity` (§4) — Pluck/Pad auf Intensität gaten.
→ *Liefert ~80 % des Werts ohne Datenmodell: crackle-frei + atmet mit Speed.*

### Phase 2 — Song-Form & Datenmodell
5. **`BiomeTheme`-Datenmodell + Arranger-State + `advanceBar`-Precompute** (§6); hardcodierte Grids in Theme-Daten.
6. **8-Bar-Section-Statemachine + Fills + mandatorische Bridge-Drum-Drop + 2–3 Groove-Grid-Varianten** (§3.2).

### Phase 3 — Generative Melodie
7. **Markov + Motif-Transforms** ersetzen `PLUCK_PATTERN`/`BASS_PATTERN` (§3.3).

### Phase 4 — Per-Biom-Themes & Instrumente
8. **Persistente Pad/Drone/Noise-Bed-Voices + neue Instrument-Builder** (§5) pro Biom.
9. **Biom-Crossfade** (§4.3) — riskantester Teil (Persistent-Voice-Lifecycle), braucht Phase-1-Instrumentierung zum Debuggen.

### Phase 5 — Polish
10. **Ability-Stinger** (§4.4), **Key-Rotation** (§3.4), Vowel-Wah-Accent, Combo-Section-Forcing.

---

## 9. Risiken & offene Fragen

### Top-Risiken (aus der adversariellen Kritik)
| # | Risiko | Mitigation |
|---|---|---|
| P0 | **`trackChain` single-source ist ein echter Bug** für ~halbe neue Voices (Snare ist schon multi-source) | Multi-Source-Signatur, Cleanup an zuletzt-endende Source (§7.1) |
| P0 | **Negative Micro-Offsets** können `time < currentTime` ergeben → Click/Flam | `Math.max(t, currentTime+0.005)`; negative Offsets nie auf Step 0 (§6.3) |
| P0 | **Catch-up-Guard desynct Arranger vom Grid** | `advanceBar` pro übersprungenem Bar synchron (§7.5) |
| P1 | **Voice-Budget ~2× zu optimistisch** (EV-Drone = 6 Oszillatoren nicht gezählt) | Cap auf 32 ODER Supersaw 5→3 Saws (§7.3) |
| P1 | **„Talkbox" überpromised** — 2 statische Bandpässe = Vowel-Wah | 3 Formanten + Vokal-Glide ODER als „Vowel-Wah" labeln (§5.1) |
| P2 | **Crossfade-Pivots brauchen Authoring-Disziplin** — `intro`-Pad muss Pivot-Ton enthalten | Content-Checkliste unten |
| P2 | **Reine Ornament-Variation überlebt 10 min nicht** | Groove-Grid-Varianten pro Section + Pflicht-Bridge-Drop (§3.2) |
| P3 | **Crossfade-Lifecycle (§4.3) = höchstes Bug-Risiko** (stuck/leaked Oszillatoren) | Zuletzt in Roadmap, erst mit Phase-1-Instrumentierung |

### Content-Checkliste (Pivot-Authoring)
- [ ] Village endet auf A → Neon-`intro`-Pad voiced ein A obenauf.
- [ ] Forest A-Tonic → Village-D: A = D-Quinte (ok).
- [ ] Village ↔ Autumn: gleicher D-Tonic, nur Scale-Farb-Fade.
- [ ] Neon F♯m → Forest A: A als gemeinsamer Brücken-Ton im Pad.

### Entscheidungen für den User
1. **Voice-Cap 32 vs. Supersaw ausdünnen?** Empfehlung: erst Cap 32 + CPU messen (Puppeteer/Performance-Profil über 20-min-Run), dann ggf. ausdünnen.
2. **Stinger = Musik oder SFX?** Empfehlung: **Musik** (über `duckBus`, gesidechained), damit sie nicht den musikalischen Sidechain umgehen. EV-Engine bleibt auf `sfxGain`.
3. **Seedbare PRNG (mulberry32) jetzt oder später?** Empfehlung: später (Polish) — `Math.random` nur für inaudible ±ms-Humanisierung, Arrangement-Decisions in `advanceBar`; reproduzierbares Debugging ist nice-to-have, kein MVP-Blocker.
4. **MVP-Scope bestätigen:** Phase 1 (Steps 1–4) liefert crackle-frei + speed-reaktiv auf dem EINEN bestehenden Beat — bestätigen, dass das die erste auslieferbare Einheit ist?

### No-Go-Reminder
- **Strikt instrumental** — Formanten sind Filter, keine Samples; keine „Choir-Pad"-Versuchung.
- **Keine Audiodateien/Samples/Aufnahmen** — alles aus Oszillatoren/Noise/Filter/Envelopes.
- **`musicGain`-Base (0,38 × modeScale) respektieren** — Auto-Scale als separater Node, User-`musicVolume` nie überschreiben.
