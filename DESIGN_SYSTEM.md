# Feudal Japan Car Runner — Design System

**Art direction:** Ukiyo-e Woodblock
**Scope:** All 2D UI / design language (DOM + CSS). The 3D world stays low-poly flat-shaded feudal Japan; this system governs UI color, type, layout, motion, components, and provides art direction for the garage 3D shell and per-tier vehicle visual language.
**Author:** UI/UX & Art Direction
**Status:** Implementable spec — real hex/px/ms/font values throughout. Drop straight into CSS custom properties + a small TS theme object.
**Implementiert:** 2026-06-19 in `index.html`, `src/styles/global.css`, `src/app/GameApp.ts`, `src/engine/rendering/GarageSceneFactory.ts`. Bestaetigte Entscheidungen (vgl. §11): Cyan aus UI verbannt = ja; Kanji-Akzente = ja (mutig); Garage-Stat-Balken = vorerst weggelassen (keine echten Fahrzeug-Stats); Fonts via Google CDN.

---

## 0. The single most important decision (read first)

**The current UI is neon-cyan-on-dark-slate (cyberpunk).** Ukiyo-e is the opposite: warm paper, ink, vermillion, indigo, gold leaf — heritage and craft, not glow.

**Decision: cyan is retired from the UI.**
- `#00e5ff` (neon cyan) does **not** survive as a UI accent. It reads as plastic/sci-fi and fights the washi-paper feel. It is replaced by **deep indigo (藍 ai)** as the cool/secondary accent and **vermillion (朱 shu)** as the primary hot accent.
- **Gold (`#ffc857`) survives**, recolored slightly warmer toward gold-leaf (`#d4a544` / `#caa54a`), because gold leaf (金箔 kinpaku) is canonical ukiyo-e/Rinpa and already reads as "valuable" for the coin economy.
- The dark slate scrim survives **only as a translucent ink scrim over the 3D scene** (we still need legible UI over a bright 3D world), but it is recolored from cold slate (`#0f172a`) to warm **sumi-ink charcoal (`#1c1714`)** so overlays feel like ink on paper, not glass on metal.
- **Where cyan lives on:** It is allowed to remain ONLY inside the 3D world as a tiny gameplay-signal emissive (police lights, boost VFX) — never in the 2D UI. The UI and the world thus diverge on purpose: the world is the lived feudal-Japan scene; the UI is the woodblock print *about* that world.

**Biggest single change vs. current UI:** the surface flips from *dark translucent glass* to *warm washi paper with ink edges and a torn/blocky print silhouette*, and the type goes from generic Inter to **bold mincho display (Shippori Mincho B1) + Zen Kaku Gothic New body** with confident oversized display sizing and small kana accents.

---

## 1. Design principles

1. **Paper first, ink second, color third.** Every surface is washi paper. Structure is drawn with sumi ink lines and blocks. Color (vermillion / indigo / gold) is used sparingly and deliberately, the way a woodblock uses 2–4 ink plates.
2. **Flat, layered, printed.** No glassmorphism, no blur, no neon glow, no realistic gradients. Depth comes from *stacked flat layers* with hard ink borders and soft paper-shadow offsets — like overprinted blocks.
3. **Bold type is the hero of the UI.** Display type is huge, confident, near-black ink. Kana/kanji accents add authenticity without requiring the player to read Japanese.
4. **The car is the hero of the garage.** UI frames the car; it never covers it. Chrome lives at the edges (corners, side rails, lower-third).
5. **Calm heritage, escalating spectacle.** Menus feel composed and crafted. Reward/legend moments (top-tier car, big combo) are where gold leaf and vermillion get loud.
6. **Legible over a moving 3D world.** Text always sits on a paper card or an ink scrim with guaranteed contrast — never raw text on the scene.

---

## 2. Color system

### 2.1 Raw palette (named swatches)

#### Washi / paper (backgrounds & surfaces)
| Name | Hex | Use |
|---|---|---|
| `washi-100` | `#f6efe0` | Brightest paper highlight |
| `washi-200` | `#efe5d2` | Primary paper surface (cards/panels) |
| `washi-300` | `#e6d8bf` | Paper edge / sunken / divider zone |
| `washi-400` | `#d8c7a3` | Aged paper (matches 3D `plaster` `#d8c7a3`) |
| `washi-shadow` | `#c8b territory` → use `#c8b694` | Paper shadow / pressed state |

> `washi-shadow` = `#c8b694`.

#### Sumi ink (text & structure)
| Name | Hex | Use |
|---|---|---|
| `sumi-900` | `#1c1714` | Darkest ink (display text, scrim base) |
| `sumi-800` | `#2a2320` | Primary ink text on paper |
| `sumi-700` | `#3a322c` | Secondary ink text |
| `sumi-500` | `#6b6157` | Muted ink / captions on paper |
| `sumi-400` | `#8c8174` | Disabled ink / hairlines on paper |

#### Vermillion 朱 (shu) — primary hot accent
| Name | Hex | Use |
|---|---|---|
| `shu-600` | `#b8331f` | Vermillion deep (pressed) |
| `shu-500` | `#d2401f` | Vermillion core (matches 3D `torii` family) |
| `shu-400` | `#e1502c` | Vermillion bright (hover) |
| `shu-tint` | `#f3d9cf` | Vermillion on-paper tint (chip bg) |

#### Indigo 藍 (ai) — secondary cool accent (replaces cyan)
| Name | Hex | Use |
|---|---|---|
| `ai-700` | `#1f2d50` | Indigo deep (scrim tint, dark surface) |
| `ai-600` | `#273c75` | Indigo core (matches 3D `cloth` `#273c75`) |
| `ai-500` | `#33508f` | Indigo mid (links, secondary accent line) |
| `ai-tint` | `#d6dded` | Indigo on-paper tint |

#### Gold leaf 金 (kin) — value / coins / legend
| Name | Hex | Use |
|---|---|---|
| `kin-600` | `#b8862f` | Gold deep (pressed/edge) |
| `kin-500` | `#caa54a` | Gold leaf core (coins, price) |
| `kin-400` | `#e0c266` | Gold bright (hover/highlight) |
| `kin-tint` | `#f3e6c2` | Gold on-paper tint |

#### Functional
| Name | Hex | Use |
|---|---|---|
| `jade-500` | `#2e8b6f` | Success / owned (matcha green, period-appropriate) |
| `jade-tint` | `#d3e7df` | Owned chip bg |
| `amber-500` | `#caa54a` | Locked = uses gold (you *want* it; gold = price) |
| `warn-500` | `#c47a1e` | Warning / "need more coins" (burnt orange) |
| `warn-tint` | `#f3e2c8` | Warn chip bg |
| `danger-600` | `#9e2b22` | Danger / crash / game-over emphasis (deep crimson, matches 3D `carCrimson` `#8f1f2a`) |

### 2.2 Semantic tokens — ready-to-paste `:root` block

```css
:root {
  /* ---- Paper / surfaces ---- */
  --color-bg:            #e6d8bf;  /* app paper floor (behind everything 2D) */
  --color-surface:       #efe5d2;  /* card / menu-panel paper */
  --color-surface-raised:#f6efe0;  /* raised chip / inner highlight paper */
  --color-surface-sunken:#e0d0b3;  /* sunken track / inset */

  /* ---- Ink / text ---- */
  --color-ink:           #1c1714;  /* display + strongest text */
  --color-ink-strong:    #2a2320;  /* primary body text on paper */
  --color-ink-muted:     #6b6157;  /* secondary text / captions */
  --color-ink-faint:     #8c8174;  /* disabled / hairline */

  /* ---- Accents ---- */
  --color-accent:        #d2401f;  /* vermillion 朱 — primary action / brand */
  --color-accent-press:  #b8331f;
  --color-accent-hover:  #e1502c;
  --color-accent-2:      #273c75;  /* indigo 藍 — secondary accent (was cyan) */
  --color-accent-2-hover:#33508f;
  --color-gold:          #caa54a;  /* gold leaf — coins / price / legend */
  --color-gold-hover:    #e0c266;
  --color-gold-press:    #b8862f;

  /* ---- Functional ---- */
  --color-owned:         #2e8b6f;  /* success / owned */
  --color-owned-tint:    #d3e7df;
  --color-locked:        #caa54a;  /* locked uses gold (price affordance) */
  --color-warn:          #c47a1e;  /* not enough coins */
  --color-warn-tint:     #f3e2c8;
  --color-danger:        #9e2b22;  /* crash / game over */

  /* ---- Tints (chip backgrounds on paper) ---- */
  --color-accent-tint:   #f3d9cf;
  --color-accent-2-tint: #d6dded;
  --color-gold-tint:     #f3e6c2;

  /* ---- Borders / lines (ink edges) ---- */
  --color-border:        #2a2320;  /* primary ink border (hard) */
  --color-border-soft:   rgb(42 35 32 / 0.32); /* hairline divider */
  --color-border-ondark: rgb(246 239 224 / 0.22);

  /* ---- Scrim / overlay (UI over 3D scene) ---- */
  --color-scrim:         rgb(28 23 20 / 0.62);  /* warm sumi ink, NOT cold slate */
  --color-scrim-strong:  rgb(28 23 20 / 0.82);
  --color-onscrim:       #f6efe0;               /* paper-white text on scrim */
  --color-onscrim-muted: rgb(246 239 224 / 0.72);

  /* ---- On-accent text ---- */
  --color-on-accent:     #f6efe0;  /* paper-white on vermillion */
  --color-on-gold:       #1c1714;  /* ink on gold */
}
```

### 2.3 TS theme object shape

```ts
// src/ui/theme.ts
export const theme = {
  color: {
    bg: "#e6d8bf",
    surface: "#efe5d2",
    surfaceRaised: "#f6efe0",
    surfaceSunken: "#e0d0b3",
    ink: "#1c1714",
    inkStrong: "#2a2320",
    inkMuted: "#6b6157",
    inkFaint: "#8c8174",
    accent: "#d2401f",
    accentPress: "#b8331f",
    accentHover: "#e1502c",
    accent2: "#273c75",
    accent2Hover: "#33508f",
    gold: "#caa54a",
    goldHover: "#e0c266",
    goldPress: "#b8862f",
    owned: "#2e8b6f",
    ownedTint: "#d3e7df",
    locked: "#caa54a",
    warn: "#c47a1e",
    warnTint: "#f3e2c8",
    danger: "#9e2b22",
    accentTint: "#f3d9cf",
    accent2Tint: "#d6dded",
    goldTint: "#f3e6c2",
    border: "#2a2320",
    scrim: "rgba(28,23,20,0.62)",
    scrimStrong: "rgba(28,23,20,0.82)",
    onScrim: "#f6efe0",
    onAccent: "#f6efe0",
    onGold: "#1c1714",
  },
} as const;

export type Theme = typeof theme;
```

### 2.4 Contrast / accessibility

All target **WCAG AA (4.5:1 body, 3:1 large/UI)**. Verified ratios:

| Pair | Ratio | Verdict |
|---|---|---|
| `ink #1c1714` on `surface #efe5d2` | ~13.5:1 | AAA |
| `ink-muted #6b6157` on `surface #efe5d2` | ~4.8:1 | AA body |
| `on-accent #f6efe0` on `accent #d2401f` | ~4.7:1 | AA (incl. button text) |
| `on-gold #1c1714` on `gold #caa54a` | ~7.1:1 | AAA |
| `onscrim #f6efe0` on `scrim 0.62` over busy scene | ≥4.5:1 effective | AA — bump to `scrim-strong` for small text |
| `owned #2e8b6f` text on `owned-tint #d3e7df` | ~3.6:1 | Large/label only — pair with ink for body |

**Rules:**
- Body text on paper → `--color-ink-strong`. Never put `ink-muted` below 13px.
- Colored chip *labels* may use accent colors, but any value/number a player must read uses ink on the tint, not the saturated color on the tint.
- Over the 3D scene, always render text on a paper card or `--color-scrim`; never raw.

### 2.5 Paper grain (no image assets required)

Apply a subtle procedural grain so paper reads as woodblock paper, not flat fill. Layer this on `--color-bg` and large surfaces:

```css
.washi-grain {
  background-color: var(--color-surface);
  background-image:
    /* fine fiber noise via repeating tiny radial dots */
    radial-gradient(rgb(42 35 32 / 0.035) 0.5px, transparent 0.6px),
    radial-gradient(rgb(42 35 32 / 0.025) 0.5px, transparent 0.6px),
    /* warm vignette toward edges (aged paper) */
    radial-gradient(120% 140% at 50% 0%, transparent 55%, rgb(120 95 60 / 0.10) 100%);
  background-size: 3px 3px, 7px 7px, 100% 100%;
  background-position: 0 0, 2px 3px, 0 0;
}
```
Optional upgrade: a single inline SVG `feTurbulence` noise as a `::before` at `opacity: 0.04`, `mix-blend-mode: multiply`. Keep it static (no animation) and gate it behind `prefers-reduced-motion` only if you ever animate it (you shouldn't).

---

## 3. Typography

### 3.1 Fonts (Google Fonts — exact families + rationale)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Yuji+Syuku&family=Zen+Kaku+Gothic+Antique:wght@500;700&display=swap" rel="stylesheet">
```

| Role | Family | Weights | Rationale |
|---|---|---|---|
| **Display / H1** | **Shippori Mincho B1** | 700, 800 | Bold, high-contrast mincho (serifed brush-derived) with full Japanese glyph coverage. Reads as confident woodblock-print title type and supports both Latin and kana/kanji in one family. This is the brand voice. |
| **Brush accent (optional)** | **Yuji Syuku** | 400 | A genuine brush-calligraphy face. Use ONLY for single decorative kanji/kana accents (e.g. 朱, 走, 蔵) — never for readable UI strings. Adds craft. |
| **Body / labels / buttons** | **Zen Kaku Gothic New** | 400, 500, 700, 900 | Clean humanist gothic with excellent JP + Latin coverage and a heavy 900 weight for bold chips/buttons. Highly legible at small sizes over busy backgrounds. |
| **Numeric / stats (optional)** | **Zen Kaku Gothic Antique** 700 *or* tabular `Zen Kaku Gothic New` 700 with `font-variant-numeric: tabular-nums` | 700 | Keep numbers in the gothic family for unity; force tabular nums so score/coins don't jitter while counting. A mono is unnecessary and would clash with the heritage feel. |

**Why not Rozha One / display latin faces:** they lack JP glyphs, so kana accents would require font-swapping mid-string. Shippori Mincho B1 gives one coherent voice across Latin + Japanese, which is exactly what a bilingual ukiyo-e UI needs.

CSS family stacks:
```css
:root {
  --font-display: "Shippori Mincho B1", "Hiragino Mincho ProN", "Yu Mincho", serif;
  --font-brush:   "Yuji Syuku", "Shippori Mincho B1", serif;
  --font-body:    "Zen Kaku Gothic New", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif;
}
```

### 3.2 Type scale

Use `clamp()` for responsive. `rem` base = 16px.

| Token | Family | Weight | Size (`clamp`) | Line-height | Letter-spacing | Transform | Use |
|---|---|---|---|---|---|---|---|
| `display` | display | 800 | `clamp(40px, 9vw, 88px)` | 0.92 | `-0.01em` | none | Menu title, game-over headline. BE BOLD. |
| `h1` | display | 800 | `clamp(30px, 6vw, 56px)` | 0.95 | `-0.005em` | none | Garage vehicle name, section title |
| `h2` | display | 700 | `clamp(22px, 4vw, 34px)` | 1.05 | 0 | none | Sub-headline / tier name |
| `title` | body | 900 | `clamp(16px, 2.4vw, 20px)` | 1.15 | `0.01em` | none | Card title, button label (primary) |
| `body` | body | 500 | `clamp(14px, 1.9vw, 16px)` | 1.5 | 0 | none | Paragraph, descriptions |
| `label` | body | 700 | `13px` | 1.2 | `0.04em` | none | Chip labels, stat names, buttons |
| `caption` | body | 700 | `11px` | 1.2 | `0.14em` | `uppercase` | State label (朱 kicker), tier badge, eyebrows |
| `kicker-jp` | brush | 400 | `clamp(13px, 2vw, 18px)` | 1 | `0.06em` | none | Decorative kanji accent only |
| `numeric` | body | 700 | inherits | — | 0 | — | add `font-variant-numeric: tabular-nums` |

```css
.t-display { font-family: var(--font-display); font-weight: 800; font-size: clamp(40px,9vw,88px); line-height: .92; letter-spacing: -.01em; }
.t-h1      { font-family: var(--font-display); font-weight: 800; font-size: clamp(30px,6vw,56px); line-height: .95; }
.t-h2      { font-family: var(--font-display); font-weight: 700; font-size: clamp(22px,4vw,34px); line-height: 1.05; }
.t-title   { font-family: var(--font-body); font-weight: 900; font-size: clamp(16px,2.4vw,20px); line-height: 1.15; letter-spacing:.01em; }
.t-body    { font-family: var(--font-body); font-weight: 500; font-size: clamp(14px,1.9vw,16px); line-height: 1.5; }
.t-label   { font-family: var(--font-body); font-weight: 700; font-size: 13px; line-height:1.2; letter-spacing:.04em; }
.t-caption { font-family: var(--font-body); font-weight: 700; font-size: 11px; line-height:1.2; letter-spacing:.14em; text-transform:uppercase; }
.t-num     { font-variant-numeric: tabular-nums; }
```

### 3.3 Japanese kana/kanji accents (without hurting non-readers)

Rule: **kanji is decoration that reinforces meaning the Latin already states.** Never make a kanji the *only* carrier of information.

Recommended placements:
- **State-label kicker:** small brush kanji + Latin, e.g. `蔵 GARAGE`, `走 START`, `終 RUN COMPLETE`, `店 SHOP`. Latin in `caption`, kanji in `kicker-jp` colored `--color-accent` or `--color-gold`.
- **Brand mark:** replace the cyan polygon brand-mark with a small vermillion seal (hanko) square containing 走 (run) in paper-white. (See §6 Brand seal.)
- **Coin label:** prefix balance with 金 in gold, e.g. `金 12,400`. Still shows the number, so non-readers lose nothing.
- **Tier badges:** optional kanji per tier (see §9). Always paired with the romaji tier name.

Suggested kanji set (single glyphs, safe meanings): 走 run · 蔵 storehouse/garage · 店 shop · 金 gold · 朱 vermillion · 終 end · 速 speed · 鬼 oni · 龍 dragon · 桜 sakura · 狐 fox · 将 general.

---

## 4. Spacing & layout

### 4.1 Spacing scale (8px base, with 4px half-steps)

```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
}
```

### 4.2 Radius — ukiyo-e radius language

**Decision: go nearly square.** Woodblock prints and paper cards have crisp cut edges, not rounded UI corners. Current UI used 8px everywhere; we drop to **2–4px** for a printed/cut-paper feel. Pills (toggles, seal) are the only round things.

```css
:root {
  --radius-0: 0;
  --radius-sm: 2px;   /* chips, inputs */
  --radius-md: 4px;   /* cards, panels, buttons (DEFAULT) */
  --radius-lg: 6px;   /* large hero panels only */
  --radius-pill: 999px;
  --radius-seal: 3px; /* hanko seal square */
}
```

### 4.3 Border widths (ink edges)

```css
:root {
  --border-hair: 1px;   /* dividers, soft */
  --border-line: 2px;   /* default card/chip ink edge (DEFAULT) */
  --border-bold: 3px;   /* primary button / focus emphasis */
  --border-block: 4px;  /* hero panel woodblock frame */
}
```
Default component border = `var(--border-line) solid var(--color-border)`. This hard 2px ink line is the signature look (replaces the old translucent white hairline + blur).

### 4.4 Elevation / shadows (ink-style, soft & warm — never cold)

No glow, no glass. Shadows are warm and offset like ink bleed / paper lift. Pair every shadow with the ink border.

```css
:root {
  /* offset paper-lift shadows in warm sumi */
  --shadow-1: 2px 2px 0 rgb(42 35 32 / 0.18);                      /* chips */
  --shadow-2: 3px 4px 0 rgb(42 35 32 / 0.20),
              0 8px 18px rgb(42 35 32 / 0.14);                      /* cards/panels */
  --shadow-3: 4px 6px 0 rgb(42 35 32 / 0.24),
              0 18px 36px rgb(28 23 20 / 0.22);                     /* hero panel / modal */
  --shadow-press: inset 0 2px 0 rgb(42 35 32 / 0.22);              /* pressed */
  /* over-scene text legibility (no blur panel) */
  --textshadow-onscene: 0 1px 2px rgb(28 23 20 / 0.55);
}
```

### 4.5 Z-index layers

```css
:root {
  --z-canvas: 1;     /* 3D scene */
  --z-ui: 10;        /* HUD / menu layer */
  --z-rail: 15;      /* garage side rails / corner chrome */
  --z-panel: 20;     /* menu-panel / cards */
  --z-popover: 30;   /* settings panel */
  --z-scrim: 40;     /* full-screen scrim (countdown/pause) */
  --z-modal: 50;     /* game-over over scrim */
  --z-toast: 60;
}
```

---

## 5. Motion

```css
:root {
  --dur-instant: 90ms;
  --dur-fast: 150ms;     /* button press, hover */
  --dur-base: 240ms;     /* chip/toggle, default */
  --dur-panel: 320ms;    /* panel enter */
  --dur-slow: 420ms;     /* garage car switch / hero reveal */

  --ease-standard: cubic-bezier(0.2, 0, 0, 1);     /* enter/most UI */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);       /* expressive enter */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);           /* exit */
  --ease-press: cubic-bezier(0.3, 0, 0.2, 1);      /* button down/up */
}
```

Patterns:
- **Button press:** `transform: translate(1px,1px)` + swap `--shadow-1`→`--shadow-press`, `--dur-fast`, `--ease-press`. (Feels like stamping a seal.)
- **Panel enter (menu/garage/gameOver):** fade `opacity 0→1` + `translateY(12px→0)`, `--dur-panel`, `--ease-out`.
- **Settings popover:** scale `0.96→1` from top-right origin + fade, `--dur-base`.
- **Garage car switch (UI side):** the prev/next press triggers name + stat-rail to cross-fade/slide (`--dur-slow`, `--ease-out`): old name slides out 16px + fades, new slides in. (3D turntable rotation is owned by `GarageShowroomController`; UI just times to ~`--dur-slow`.)
- **Stat bars fill:** `width`/`transform: scaleX` transition `--dur-slow` `--ease-out` when vehicle changes.
- **Coin/score count-up:** numeric tween in JS over `--dur-base`; UI element only needs `font-variant-numeric: tabular-nums` to avoid reflow.

**Reduced motion** (honor the existing `reducedMotion` config flag AND `prefers-reduced-motion`):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```
Also gate JS-driven count-ups and the garage cross-fade: when `config.reducedMotion` is true, snap values/positions instantly (no tween) and skip the camera sway already present in `GarageCameraController`. Hover transforms become instant; the press *visual* (shadow swap) may stay but without translate.

---

## 6. Component specs

All components: paper surface, 2px ink border, near-square radius, warm offset shadow, no blur. Focus-visible is a uniform vermillion outline.

**Global focus ring:**
```css
:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
```

### 6.1 Brand seal (replaces `.brand-mark` cyan polygon)
```css
.brand-mark {
  width: 26px; height: 26px;
  border-radius: var(--radius-seal);
  background: var(--color-accent);          /* vermillion hanko */
  color: var(--color-on-accent);
  display: grid; place-items: center;
  font-family: var(--font-brush);
  font-size: 16px; line-height: 1;
  box-shadow: var(--shadow-1);
}
/* content: 走 (run) via ::before or text node */
```
`.brand-block strong` → `--font-display`, weight 800, color `--color-onscrim` (it sits over the scene; keep `--textshadow-onscene`).

### 6.2 Primary button (`.primary-action`)
Vermillion, paper-white text, ink border, stamp press.
```css
.primary-action {
  width: 100%; min-height: 48px;
  padding: 0 20px;
  font: 900 16px/1 var(--font-body); letter-spacing: .02em;
  color: var(--color-on-accent);
  background: var(--color-accent);
  border: var(--border-bold) solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-2);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-standard),
              transform var(--dur-fast) var(--ease-press),
              box-shadow var(--dur-fast) var(--ease-press);
}
.primary-action:hover    { background: var(--color-accent-hover); }
.primary-action:active    { background: var(--color-accent-press);
                            transform: translate(1px,1px); box-shadow: var(--shadow-press); }
.primary-action:disabled  { background: var(--color-surface-sunken); color: var(--color-ink-faint);
                            border-color: var(--color-ink-faint); box-shadow: none; cursor: not-allowed; }
```
**Gold variant** for the garage UNLOCK affordance — use `.primary-action--buy` switching bg to `--color-gold`, text to `--color-on-gold`. **Running-state pause button:** was cyan; now uses `--color-accent-2` (indigo) bg with `--color-on-accent` text so "pause" reads as cool/neutral vs the hot vermillion "go".

### 6.3 Secondary button (`.secondary-action`)
Paper surface, ink text, ink border (ghost on paper). Over the scene it sits on its own paper chip so it's always legible.
```css
.secondary-action {
  min-height: 46px; padding: 0 18px;
  font: 700 15px/1 var(--font-body); letter-spacing: .02em;
  color: var(--color-ink-strong);
  background: var(--color-surface);
  border: var(--border-line) solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-1);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-press);
}
.secondary-action:hover   { background: var(--color-surface-raised); }
.secondary-action:active  { transform: translate(1px,1px); box-shadow: var(--shadow-press); }
.secondary-action:disabled{ color: var(--color-ink-faint); border-color: var(--color-ink-faint);
                            background: var(--color-surface-sunken); cursor: not-allowed; }
```

### 6.4 Icon button — garage arrows (`.icon-action`)
Big tap target, vermillion-on-paper, lives at screen edges (see §7). Min 56px for thumb reach.
```css
.icon-action {
  width: 56px; height: 56px;
  display: grid; place-items: center;
  font: 800 32px/1 var(--font-display);
  color: var(--color-accent);
  background: var(--color-surface);
  border: var(--border-line) solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-2);
  cursor: pointer;
}
.icon-action:hover   { background: var(--color-accent-tint); }
.icon-action:active  { transform: translate(1px,1px); box-shadow: var(--shadow-press); }
.icon-action:disabled{ color: var(--color-ink-faint); background: var(--color-surface-sunken);
                       border-color: var(--color-ink-faint); cursor: not-allowed; opacity: .9; }
```

### 6.5 Panel / card (`.menu-panel` surface)
The hero paper card. **Remove `backdrop-filter` and translucent dark bg.** Use opaque washi + woodblock frame + warm shadow.
```css
.menu-panel {
  background: var(--color-surface);
  /* apply .washi-grain image layers here too */
  border: var(--border-block) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  padding: var(--space-5);
  color: var(--color-ink-strong);
}
```
Optional craft detail: a 1px inner indigo keyline `box-shadow: inset 0 0 0 1px var(--color-accent-2-tint)` to suggest a registration border around the print.

### 6.6 Top bar (`.top-bar`)
Sits over the scene. No paper plate across the whole bar (keep the world visible) — each item carries its own chip/seal. Brand + score chips on paper; settings as icon button.
```css
.top-bar { gap: var(--space-4); min-height: 56px; padding: var(--space-2) var(--space-3); }
```
Settings gear (`.settings-action`): same recipe as `.icon-action` but 44px, char `⚙`/`設`. Replace cyan hover/focus with vermillion.

### 6.7 Run-stat chip (`.run-stats span`) — HUD
Small paper chips with ink border so they read over a bright sky. Label in caption, value in tabular num.
```css
.run-stats span {
  min-width: 84px; padding: 6px 10px;
  background: var(--color-surface);
  border: var(--border-line) solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-1);
  color: var(--color-ink-strong);
  font: 700 13px/1.1 var(--font-body);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
```
Recommended: split into a `<span class="t-caption">SCORE</span>` + value, value colored `--color-ink`, coins value colored `--color-gold-press` (`#b8862f`) for readability. Combo at high values can flash `--color-accent`.

### 6.8 Settings panel + sliders + toggle (`.settings-panel`)
Opaque paper popover, no blur.
```css
.settings-panel {
  background: var(--color-surface);
  border: var(--border-line) solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-3);
  padding: var(--space-3);
  color: var(--color-ink-strong);
}
.settings-panel input[type="range"] { width: 100%; accent-color: var(--color-accent); height: 4px; }
.settings-panel input[type="range"]::-webkit-slider-runnable-track { background: var(--color-surface-sunken); height: 4px; border-radius: 2px; }
.settings-toggle input[type="checkbox"] { width: 20px; height: 20px; accent-color: var(--color-gold); } /* mute toggle = gold */
```
States: track = `--color-surface-sunken`; filled/thumb = `--color-accent` (was cyan). Focus → global vermillion ring. Disabled → `--color-ink-faint`.

### 6.9 Game-over summary chips (`.game-over-summary span`)
Three chips: Score / Coins / Distance. Coins chip uses gold tint; the panel headline reads e.g. `終 RUN COMPLETE` with display type. Crash emphasis (state-label kicker) may use `--color-danger`.
```css
.game-over-summary span {
  background: var(--color-surface-raised);
  border: var(--border-line) solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-1);
  color: var(--color-ink-strong);
  font: 700 14px/1.2 var(--font-body);
  font-variant-numeric: tabular-nums;
  padding: 10px 8px; text-align: center;
}
.game-over-summary [data-stat="coins"] { background: var(--color-gold-tint); }
```

### 6.10 Garage shop-meta chips (`.garage-shop-meta`) — owned / locked / price / balance / need
Recolored from cyan/slate to semantic ink+tint. Each chip = label (caption) + value.
```css
.garage-shop-meta span {
  background: var(--color-surface-raised);
  border: var(--border-line) solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-ink-strong);
  font: 700 12px/1.15 var(--font-body);
  font-variant-numeric: tabular-nums;
  padding: 8px 10px; text-align: center;
  box-shadow: var(--shadow-1);
}
/* OWNED */
.garage-shop-meta[data-lock-state="owned"] .garage-shop-status {
  background: var(--color-owned-tint); border-color: var(--color-owned); color: #1d4f3f;
}
/* LOCKED */
.garage-shop-meta[data-lock-state="locked"] .garage-shop-status {
  background: var(--color-gold-tint); border-color: var(--color-gold-press); color: var(--color-gold-press);
}
/* PRICE = gold */
.garage-shop-meta [data-garage-price] { background: var(--color-gold-tint); border-color: var(--color-gold-press); }
/* NEED-MORE = warn */
.garage-shop-need { grid-column: 1 / -1; background: var(--color-warn-tint) !important;
                    border-color: var(--color-warn) !important; color: #8a4f10 !important; }
.garage-shop-need:empty { display: none; }
```
Add a 🔒 affordance for locked via a small lock glyph or `鍵` in the status chip — but the lock NEVER overlays the car (see §7).

---

## 7. Garage car-select layout (CRITICAL)

### 7.1 Problem & principle
Current garage stacks name + 4 shop chips + Starten + arrows + back into one centered `.menu-panel` at the bottom-center that **covers the car**. Successful racing garages (Asphalt / Forza / NFS) keep the **car as the unobstructed hero**, push chrome to the **edges**, and use a **side stat rail** + **lower-third bar** + **edge arrows** + **single bottom-center CTA**.

**New rule:** in `data-state="garage"`, the `.menu-panel` box is dissolved. Its children are re-parented (CSS grid placement / absolute regions) into edge zones. The center stays empty for the 3D car.

### 7.2 Region map
- **Top-left corner:** coin balance (gold seal chip) — `金 12,400`.
- **Top-right corner:** settings gear + Back/Exit (蔵→ exit) secondary button.
- **Side stat rail:** vertical stack of stat bars (Speed/Accel/Handling/Boost). Right edge in landscape, collapses to a thin row under the name in portrait.
- **Lower-third bar:** vehicle name (h1) + tier badge + price/owned status, on a translucent paper-scrim strip that hugs the bottom but is only ~26% tall, leaving the car visible above it.
- **Far edges, vertically centered:** prev (`‹`) left, next (`›`) right — large `.icon-action`.
- **Bottom-center, above lower-third text:** the single primary CTA — `DRIVE` (owned) / `UNLOCK · 金850` (affordable) / `LOCKED` (can't afford, disabled).

Stat data source: derive 4 bars (0–100) from `VehicleDefinition` by tier (starter low → legend high) until real stats exist. See §7.6.

### 7.3 Portrait wireframe
```
┌──────────────────────────────────────┐
│ [金 12,400]                  ⚙  蔵→  │  top corners
│                                        │
│                                        │
│              ╱▔▔▔▔▔╲                   │
│            ◄  C A R  ►   ← edge arrows │  car is the hero, centered
│              ╲_____╱        (vert ctr) │
│                                        │
│   SPEED   ▓▓▓▓▓▓▓░░░  78               │  stat rail = horizontal
│   ACCEL   ▓▓▓▓▓░░░░░  55               │  bars stacked here in portrait
│   HANDLE  ▓▓▓▓▓▓░░░░  62               │  (compact)
├────────────────────────────────────────┤
│  将 SPORT                              │  lower-third paper-scrim strip
│  SHOGUN GTR              金 1,600      │  name (h1) + tier + price
│        ┌────────────────────┐          │
│        │      UNLOCK 金1,600 │          │  primary CTA bottom-center
│        └────────────────────┘          │
└──────────────────────────────────────┘
```

### 7.4 Landscape wireframe
```
┌───────────────────────────────────────────────────────────┐
│ [金 12,400]                                       ⚙   蔵→  │
│                                                             │
│                       ╱▔▔▔▔▔▔▔╲              SPEED  ▓▓▓▓▓▓▓░ │  stat rail
│  ‹                  ◄   C A R   ►            ACCEL  ▓▓▓▓▓░░░ │  pinned right
│ (arrow                ╲________╱             HANDLE ▓▓▓▓▓▓░░ │  edge, vert ctr
│  far left,                                   BOOST  ▓▓▓░░░░░ │
│  vert ctr)                                             ›     │  next arrow far right
│                                                             │
├───────────────────────────────────────────────────────────┤
│  将 SPORT    SHOGUN GTR                 ┌──────────────┐    │
│              owned / 金 1,600           │  DRIVE        │    │  lower-third + CTA
└───────────────────────────────────────────────────────────┘
```
Arrows sit at the *very* screen edges (`left/right: max(8px, safe-area)`), vertically centered; the right-side stat rail is inset from the right arrow so they don't collide (arrow at far edge, rail ~80–96px in).

### 7.5 Implementation sketch (re-parent via CSS, no DOM rewrite required)
Keep the existing elements; in garage state, position regions absolutely inside `.game-ui`:
```css
.game-ui[data-state="garage"] .menu-panel {
  position: absolute; inset: auto 0 0 0;   /* dissolve into lower-third */
  width: 100%; max-width: none; margin: 0;
  background: var(--color-scrim);           /* paper-scrim strip, not full card */
  border: 0; border-top: var(--border-line) solid var(--color-border);
  border-radius: 0; box-shadow: none; backdrop-filter: none;
  padding: var(--space-3) var(--space-4) max(var(--space-4), env(safe-area-inset-bottom));
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--space-3);
}
/* name + tier left, price center-ish, CTA spans/anchors center */
.game-ui[data-state="garage"] .garage-vehicle-label { /* -> h1, ink/onscrim, left col */ }
.game-ui[data-state="garage"] .garage-switch-row {
  /* split: arrows become fixed edge buttons; only the start button stays in CTA slot */
}
.garage-prev-action, .garage-next-action {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: var(--z-rail);
}
.garage-prev-action { left: max(8px, env(safe-area-inset-left)); }
.garage-next-action { right: max(8px, env(safe-area-inset-right)); }
/* coin balance to top-left */
.game-ui[data-state="garage"] [data-garage-balance] {
  position: absolute; top: max(8px,env(safe-area-inset-top)); left: max(8px,env(safe-area-inset-left));
  z-index: var(--z-rail); background: var(--color-gold-tint);
  border: var(--border-line) solid var(--color-gold-press); border-radius: var(--radius-sm);
}
/* stat rail = the garage-shop-meta repurposed, or a new .garage-stat-rail */
```
On the lower-third scrim strip the name uses `--color-onscrim` (paper-white over warm ink scrim) so it stays legible whatever the car color.

### 7.6 Locked treatment (never covers the car)
- Car stays fully visible and rendered normally (don't darken the 3D model — the *world* desaturation/lock is communicated by UI only).
- **Lower-third price** shows `金 1,600` in gold; **status chip** shows `LOCKED 鍵`.
- **CTA** becomes `UNLOCK · 金1,600` (gold variant `.primary-action--buy`) when affordable, or `LOCKED` (disabled, ink-faint) when not.
- **Need-more** appears as a small warn chip in the lower-third only when short: `あと 金420` / `NEED 420`.
- Optional tasteful affordance: a small gold padlock glyph badge in the top-right of the stat rail header — small, never over the car body.

### 7.7 Stat bar component
```css
.stat-bar { display:grid; grid-template-columns: 64px 1fr 36px; align-items:center; gap: var(--space-2); }
.stat-bar .t-caption { color: var(--color-onscrim-muted); }
.stat-bar__track { height: 8px; background: rgb(246 239 224 / 0.22); border-radius: 2px; overflow: hidden;
                   border: 1px solid var(--color-border-ondark); }
.stat-bar__fill  { height: 100%; background: var(--color-gold);
                   transform-origin: left; transition: transform var(--dur-slow) var(--ease-out); }
.stat-bar__val   { color: var(--color-onscrim); font: 700 12px/1 var(--font-body); font-variant-numeric: tabular-nums; }
```
Suggested per-tier default stat seeds (until real stats exist), 0–100 [Speed, Accel, Handling, Boost]:
- starter: [55, 50, 60, 40] · street: [66, 62, 64, 55] · sport: [76, 72, 68, 66] · elite: [86, 82, 74, 80] · legend: [98, 95, 82, 95]

---

## 8. Garage 3D environment art direction (low-poly, THREE primitives only)

Goal: evolve the plain box garage (cold slate `#182335` bg, cyan/gold point lights, dark-metal walls) into a **lantern-lit feudal workshop / 蔵 (storehouse) at dusk** — warm, crafted, premium. Keep all primitives; no new asset pipeline.

**Mood & background**
- Replace cold `scene.background`/`fog` `#182335` with warm dusk indigo-to-charcoal: background `#241d2b` → fog `#2a2230`. Reads like dusk paper rather than a server room.
- Lower overall exposure slightly so the car (and its emissives) pop.

**Floor & turntable**
- Floor: swap `darkMetal` for a dark warm-wood plank look (`darkWood #3a2418`) with a stone (`stone #7e858b`) inlaid ring under the turntable.
- Turntable: `stone`/`path` disc with a **gold** (not cyan) torus trim (`gold #ffc857`) — gold ring of light under the hero.

**Walls & backdrop (the cheap part to fix)**
- Back wall: indigo `cloth #273c75` stays, but add a large **vermillion torii silhouette** centered behind the car (you already build a small `createTorii()` — scale it up to ~1.0–1.2 and center it, framed by two columns). This gives a true ukiyo-e backdrop instead of a flat banner.
- Add a horizontal **gold-leaf band** (`gold`) as a wainscot line across the back wall at ~1.1m — instantly premium.
- Replace cyan light strips with **paper-lantern emissives**: a row of 3–5 small `lanternPaper` (`#ffd58a` emissive) box/cylinder lanterns hung along the top of the back wall; vertical `cloth` noren-style banners flanking the torii.

**Lighting (recolor, keep structure)**
- Key light: keep warm `#fff1c2` directional.
- Replace `cyanStrip` PointLight with a **lantern-warm** point `#ffb066` (intensity ~1.4) on the left.
- Keep a single cool rim, but recolor from cyan `#00e5ff` to soft **indigo** `#5b6fb0` (low intensity ~0.8) on the right for separation — cool enough to read as moonlight, not neon.
- Hemisphere: warm sky `#ffd9a8` / ground `#2a2230` instead of cyan/grey.

**Accent props (primitives you already have patterns for)**
- Stacked tires → fine to keep (workshop), but tint rims gold.
- Tool shelf → keep; add 1–2 small `lanternPaper` lanterns on it for warm fill.
- Add 2–3 low **stone lantern (tōrō)** silhouettes (stacked cylinders/boxes in `stone`) at the back corners.
- A subtle **paper-grain feel in 3D**: not needed; the lantern light + warm palette carries it.

Net effect: from "cheap empty box with neon strips" to "intimate lantern-lit storehouse with a torii shrine backdrop and a gold ring of light under the car." All boxes/cylinders/torus — no new geometry types.

---

## 9. Per-tier vehicle visual language (for the car-modeling agent)

Principle: **escalate calm → insane with price.** Starter = a normal, sensible car a commuter would drive. Legend = a jaw-dropping, clearly-fast hypercar. Palette pulls from the ukiyo-e set (vermillion, indigo, sakura pink, gold leaf, sumi black, kitsune orange, oni violet, dragon teal) and *intensifies* (more saturation, more gold trim, more glowing accent) up the ladder. Keep low-poly flat-shaded; "glow" = emissive accent strips, used sparingly and only on elite/legend.

| Tier | Read (calm↔insane) | Finish / material | Silhouette aggression | Accent / glow |
|---|---|---|---|---|
| **starter** (kanji 初) | Deliberately plain, sensible, "normal" | Matte to semi-matte, no metallic flake | Upright, tall greenhouse, soft edges, small wheels | None. Maybe a thin painted pin-stripe. |
| **street** (街) | A bit sporty, weekend car | Semi-gloss, light metalness | Lower roof, slightly raked, mild rear lip | Small chrome/steel trim, painted accent |
| **sport** (走) | Clearly fast, purposeful | Gloss metallic | Wide low stance, defined shoulder line, larger wheels, small wing | Tasteful gold or ink trim; tinted glass |
| **elite** (極) | Exotic, expensive, intimidating | Deep metallic + gold-leaf trim accents | Very low, wide, aggressive intakes, big wing/diffuser | Gold trim mandatory + one subtle emissive underglow/light strip |
| **legend** (龍) | Jaw-dropping, otherworldly fast | Pearlescent/metallic body + prominent gold-leaf + emissive accents | Extreme: long low wedge, huge rear, dramatic aero | Gold leaf + animated emissive accent strips (teal/gold), glowing details |

### Per-vehicle recommendations (matching `MaterialFactory` where possible)

| # | Vehicle | Tier | Price | Body color (hex) | Material / finish | Silhouette & accents |
|---|---|---|---|---|---|---|
| 1 | **Akai Striker** | starter | 0 | Vermillion red `#d2401f` (align to torii/`carRed #e23b2e`, slightly dustier) | Matte–semi-matte, low metalness | The "normal car." Upright, friendly, small wheels, dark plastic trim (`darkTrim #242833`). No gold, no glow. Make it look deliberately ordinary so the ladder has somewhere to climb. |
| 2 | **Aoi Drift Coupe** | starter | 0 | Indigo `#273c75` (`carAzure`-adjacent but deeper, ukiyo-e ai) | Semi-matte | Same humble class as #1 but coupe roofline; sumi-black `#15171a` accents. Calm. |
| 3 | **Sakura Roadster** | street | 350 | Sakura pink `#ff5fac` (`carSakuraPink`) body, washi-cream `#f2f2eb` lower | Semi-gloss, light metalness | Open-top roadster, cheerful, chrome window surrounds, petal-motif decal okay. First "fun" car. |
| 4 | **Kitsune Rally** | sport | 850 | Kitsune orange `#ff7a24` (`carKitsuneOrange`) with sumi-black `#15171a` rally graphics | Gloss, rally-spec | Raised rally stance, hood vents, mud-flaps, fox-tail accent; chunky wheels. Energetic. |
| 5 | **Shogun GTR** | sport | 1600 | Sumi black `#15171a` body with gold-leaf `#caa54a` pin-trim | Gloss metallic, gold trim begins here | Low wide GT, defined shoulder line, modest rear wing, tinted glass `#162838`. "Samurai armor" reads as black + gold. |
| 6 | **Oni Interceptor** | elite | 2800 | Oni violet `#6536c9` (`carOniViolet`) deep metallic, sumi-black lower | Deep metallic + gold-leaf intakes/trim + first emissive | Aggressive, wide, big intakes and diffuser; a single vermillion/teal emissive underglow strip; oni-horn aero hints. Intimidating. |
| 7 | **Ryujin Hypercar** | legend | 5000 | Dragon teal-cyan `#00b7ff` (`carRyujinCyan`) **pearlescent**, heavy gold-leaf `#caa54a` accents | Pearlescent/metallic + gold leaf + animated emissive | Extreme low wedge, dramatic active-aero rear, glowing teal+gold accent strips that pulse (respect reduced-motion). The "龍 dragon" — jaw-dropping. This is the only car allowed to be visually loud. |

> Note the deliberate tension: Ryujin keeps a cyan family color — but as a *3D-world emissive on the hero car*, which is consistent with §0 ("cyan survives only in the 3D world, never in the 2D UI"). It reads as dragon/electric energy, not UI chrome.

---

## 10. Migration checklist (current → ukiyo-e)

1. Add Google Fonts `<link>` (§3.1) to `index.html`; set `--font-*` and base `font-family` to `--font-body`; `color: var(--color-ink-strong)`, `background: var(--color-bg)`.
2. Paste the `:root` token block (§2.2). Replace every hardcoded color in `global.css`:
   - `#00e5ff` → `--color-accent` (vermillion) for actions / `--color-accent-2` (indigo) for the running-state pause + focus on cool elements; remove all cyan glows/`box-shadow` halos.
   - `#ffc857` → `--color-gold`.
   - `#0f172a`/`#111827`/`rgb(15 23 42 …)` slate → `--color-ink`/`--color-scrim` (warm).
   - `#f8fafc` text → `--color-ink-strong` on paper, `--color-onscrim` over scene.
3. Remove all `backdrop-filter: blur(...)` (panels become opaque washi).
4. Drop radii from 8px → `--radius-md` (4px); borders → 2px ink (`--border-line`); shadows → warm offset (`--shadow-*`).
5. Apply `.washi-grain` to `.menu-panel` and the app root.
6. Rebuild garage layout per §7 (dissolve panel into edge regions, edge arrows, lower-third, stat rail). This is the highest-impact change.
7. Swap brand-mark polygon → vermillion hanko seal (§6.1).
8. Recolor garage 3D shell + lights per §8.
9. Add focus-visible vermillion ring globally; verify contrast table (§2.4).
10. Honor `config.reducedMotion` + `prefers-reduced-motion` (§5).

---

## 11. Open decisions for the human to confirm

1. **Cyan fully retired from UI** — confirmed in this spec. If you want a nostalgic nod, the only sanctioned place is the Ryujin legend car emissive (3D world). OK?
2. **Garage panel dissolution (§7)** requires light CSS re-positioning of existing elements and ideally a small DOM addition for the stat rail (`.garage-stat-rail` with 4 `.stat-bar`s). Stats are currently *seeded by tier* (§7.6) since `VehicleDefinition` has no perf stats — confirm you're OK adding nominal stat fields later, or keep them UI-only.
3. **Japanese glyph accents**: I've kept them strictly decorative (always paired with Latin). Confirm you want kanji kickers (走/蔵/店/金) at all — some teams prefer Latin-only for global QA.
4. **Self-hosting fonts**: spec uses Google Fonts CDN. For a game you may want to self-host (`@fontsource`) for offline/perf; trivial swap, just flagging.
5. **Owned starter cars (#1, #2) both priced 0** — fine, but consider making #2 the first soft unlock so the shop has something to buy early. Economy decision, not design-system-blocking.
6. **`MaterialFactory` recolors (§8/§9)**: I reused existing material names where possible, but new lantern/indigo-rim lights and a centered scaled torii are additions. Confirm before the modeling agent runs.
