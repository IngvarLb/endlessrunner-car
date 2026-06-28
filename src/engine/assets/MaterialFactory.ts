import * as THREE from "three";

export class MaterialFactory {
  readonly metal = this.standard(0xd9e0e8, 0.65, 0.2);
  readonly darkMetal = this.standard(0x334155, 0.7, 0.25);
  readonly wood = this.standard(0x8b5a2b, 0.85, 0.05);
  readonly darkWood = this.standard(0x3a2418, 0.9, 0.02);
  readonly warmWood = this.standard(0xb8793e, 0.82, 0.03);
  readonly plaster = this.standard(0xd8c7a3, 0.94, 0.01);
  readonly earthWall = this.standard(0x9b7a55, 0.96, 0.01);
  readonly roofTile = this.standard(0x27343c, 0.88, 0.03);
  readonly thatch = this.standard(0x8f7548, 0.98, 0.01);
  readonly paperWindow = this.standard(0xf2e8c8, 0.86, 0.01);
  readonly lanternPaper = this.emissive(0xffd58a, 0.5);
  readonly stone = this.standard(0x7e858b, 0.9, 0.02);
  readonly foliage = this.standard(0x35a853, 0.95, 0.02);
  readonly foliageDark = this.standard(0x1f7a42, 0.95, 0.02);
  // 紅葉 Autumn Momiji maple canopy — summer-green base colors; the run scene morphs
  // these toward fiery crimson/orange/gold as the season crossfades (one shared trio,
  // so every maple shifts together with no pop). Only the run scene uses them.
  readonly mapleLeafRed = this.standard(0x4f9e3a, 0.95, 0.02);
  readonly mapleLeafOrange = this.standard(0x5aa83e, 0.95, 0.02);
  readonly mapleLeafGold = this.standard(0x74b23f, 0.95, 0.02);
  // 柿 Persimmon fruit — a fixed saturated autumn orange (does NOT season-morph, so
  // ripe fruit reads warm in both the green summer leg and the crimson autumn leg).
  readonly persimmon = this.standard(0xe8651e, 0.85, 0.03);

  // ===== 電脳都市 Neon Cyber-City (blue hour) — structure (matte/metal/glass) + emissive neon =====
  // Matte concrete / asphalt / paint
  readonly cyberConcrete = this.standard(0x3a4049, 0.92, 0.04);
  readonly cyberConcreteLight = this.standard(0x525a64, 0.9, 0.04);
  readonly towerDark = this.standard(0x1c2230, 0.85, 0.06);
  readonly rustSteel = this.standard(0x6e4a38, 0.88, 0.05);
  readonly wetAsphalt = this.standard(0x14171d, 0.5, 0.12); // glossy black tarmac
  readonly sidewalkGrey = this.standard(0x4a4e57, 0.9, 0.03);
  readonly kerbWhite = this.standard(0xc6c2b4, 0.85, 0.02);
  readonly barrierConcrete = this.standard(0x6a6f78, 0.9, 0.03);
  readonly planterDark = this.standard(0x2c3138, 0.9, 0.03);
  readonly busLanePaint = this.standard(0x1f6e5a, 0.8, 0.02);
  readonly laneWhite = this.standard(0xe8e6da, 0.8, 0.02);
  // Metallic steel (→ MeshPhong sheen)
  readonly towerSteel = this.standard(0x2a3340, 0.5, 0.5);
  readonly brushedSteel = this.standard(0x8b96a4, 0.45, 0.6);
  readonly guardSteel = this.standard(0x9aa3ad, 0.45, 0.55);
  // Glass
  readonly darkGlass = this.standard(0x0e1a2a, 0.34, 0.08);
  readonly tealGlass = this.standard(0x16384a, 0.32, 0.1);
  // Emissive — lit windows
  readonly litWindowWarm = this.emissive(0xffd27a, 1.0);
  readonly litWindowCool = this.emissive(0xbfe6ff, 1.0);
  // Emissive — neon tubes / kanji / hologram
  readonly neonCyan = this.emissive(0x1ef0ff, 1.4);
  readonly neonMagenta = this.emissive(0xff2bd0, 1.4);
  readonly neonPink = this.emissive(0xff4f8b, 1.4);
  readonly neonPurple = this.emissive(0x9b3bff, 1.4);
  readonly neonBlue = this.emissive(0x2f6bff, 1.4);
  readonly neonGreen = this.emissive(0x39ff8e, 1.4);
  readonly neonAmber = this.emissive(0xffab1f, 1.4);
  readonly kanjiRed = this.emissive(0xff2d4a, 1.5);
  readonly kanjiGold = this.emissive(0xffd64a, 1.5);
  readonly hologramBlue = this.emissive(0x5ad8ff, 1.3);
  // Emissive — reflectors / signals / beacons
  readonly reflectorAmber = this.emissive(0xff9a1a, 1.5);
  readonly reflectorRed = this.emissive(0xff2233, 1.5);
  readonly signalRed = this.emissive(0xff3322, 1.6);
  readonly signalAmber = this.emissive(0xffb01f, 1.6);
  readonly signalGreen = this.emissive(0x2bff7a, 1.6);
  readonly towerBeacon = this.emissive(0xff3a2a, 1.7);
  // Emissive — glowing vegetation
  readonly sakuraNeon = this.emissive(0xff9ad5, 1.2);
  readonly ginkgoNeon = this.emissive(0xffe23a, 1.2);

  // ===== 奥山渓谷 Misty Mountain-Forest Valley — cedar/moss/rock/water/thatch palette =====
  readonly cedarBark = this.standard(0x5a4631, 0.92, 0.02);
  readonly cedarBarkDark = this.standard(0x3f3120, 0.92, 0.02);
  readonly sugiCanopy = this.standard(0x23492e, 0.95, 0.02);
  readonly sugiCanopyDeep = this.standard(0x173524, 0.95, 0.02);
  readonly pineCanopy = this.standard(0x2f5e3d, 0.95, 0.02);
  readonly bambooStalk = this.standard(0x7fa84a, 0.9, 0.02);
  readonly bambooStalkPale = this.standard(0xa7c466, 0.9, 0.02);
  readonly mossGreen = this.standard(0x4f7a3a, 0.95, 0.02);
  readonly mossGreenDeep = this.standard(0x35592a, 0.95, 0.02);
  readonly fernGreen = this.standard(0x5e8c3f, 0.95, 0.02);
  readonly mapleEmber = this.standard(0xc2451f, 0.9, 0.02);
  readonly mapleGold = this.standard(0xd98a2b, 0.9, 0.02);
  readonly wetRock = this.standard(0x5c6066, 0.85, 0.03);
  readonly wetRockDark = this.standard(0x3d4146, 0.85, 0.03);
  readonly cliffStone = this.standard(0x6a6d70, 0.9, 0.02);
  readonly dirtPath = this.standard(0x7a5f42, 0.95, 0.01);
  readonly packedEarth = this.standard(0x8a6f4e, 0.95, 0.01);
  readonly mossPaver = this.standard(0x6f7857, 0.92, 0.02);
  readonly riverWater = this.standard(0x3f7d86, 0.4, 0.06);
  readonly riverWaterDeep = this.standard(0x235a66, 0.4, 0.06);
  readonly riverFoam = this.emissive(0xe8f2ef, 0.7);
  readonly waterfallVeil = this.emissive(0xcfe6e8, 0.85);
  readonly thatchForest = this.standard(0x9b7d4a, 0.98, 0.01);
  readonly rusticWood = this.standard(0x6b4a2e, 0.9, 0.02);
  readonly darkBeam = this.standard(0x33241a, 0.9, 0.02);
  readonly toriiVermillion = this.standard(0xc64a2f, 0.8, 0.04);
  readonly shimenawaRope = this.standard(0xc9b079, 0.95, 0.01);
  readonly shideWhite = this.standard(0xf2ede0, 0.9, 0.01);
  readonly jizoStone = this.standard(0x8b8f8c, 0.92, 0.02);
  readonly redBib = this.standard(0xcc3b39, 0.9, 0.02);
  readonly lanternEmber = this.emissive(0xffcf8a, 1.1);
  readonly deerHide = this.standard(0xa9794e, 0.9, 0.02);
  readonly mistVeil = this.emissive(0xb9cdc9, 0.6);
  readonly mountainFar = this.standard(0x7d97a0, 0.95, 0.01);
  readonly ridgeSilhouette = this.standard(0x4d6b63, 0.95, 0.01);
  readonly torii = this.standard(0xe9442e, 0.75, 0.05);
  readonly gold = this.standard(0xffc857, 0.45, 0.25);
  readonly turquoise = this.emissive(0x00e5ff, 0.35);
  readonly fire = this.emissive(0xff6a1a, 0.65);
  readonly ember = this.emissive(0xffc857, 0.45);
  readonly cloth = this.standard(0x273c75, 0.85, 0.05);
  readonly path = this.standard(0x9aa1a8, 0.95, 0.01);
  readonly roadLine = this.standard(0xf5f1d8, 0.78, 0.03);
  readonly grass = this.standard(0x4caf50, 0.95, 0.01);
  readonly carRed = this.standard(0xe23b2e, 0.65, 0.15);
  readonly carAzure = this.standard(0x1677ff, 0.58, 0.14);
  // Player-vehicle dedicated finishes (escalating calm -> insane)
  readonly carAkaiRed = this.standard(0xd2401f, 0.78, 0.06); // starter: dusty matte vermillion
  readonly carAoiIndigo = this.standard(0x273c75, 0.62, 0.12); // starter: deep ukiyo-e indigo, semi-matte
  readonly carSumi = this.standard(0x15171a, 0.5, 0.16); // sumi-black accents / body
  readonly carCream = this.standard(0xf2f2eb, 0.46, 0.12); // washi-cream lower (roadster)
  readonly carSakuraGloss = this.standard(0xff5fac, 0.34, 0.22); // street: semi-gloss sakura
  readonly carKitsuneGloss = this.standard(0xff7a24, 0.3, 0.26); // sport: glossy rally orange
  readonly carShogunBlack = this.standard(0x15171a, 0.28, 0.34); // sport: gloss metallic black
  readonly carOniGloss = this.standard(0x6536c9, 0.3, 0.42); // elite: deep metallic violet
  readonly carRyujinGold = this.standard(0xf0c12e, 0.26, 0.42); // legend: bright lustrous gold
  readonly chrome = this.standard(0xeef2f6, 0.22, 0.85); // bright chrome trim
  readonly steelTrim = this.standard(0xb9c0c8, 0.4, 0.55); // brushed steel surrounds
  readonly oniGlow = this.emissive(0xff2a4d, 0.55); // elite: subtle single underglow strip
  readonly carBlack = this.standard(0x15171a, 0.55, 0.12);
  readonly carWhite = this.standard(0xf2f2eb, 0.5, 0.08);
  readonly carSakuraPink = this.standard(0xff5fac, 0.58, 0.1);
  readonly carKitsuneOrange = this.standard(0xff7a24, 0.62, 0.12);
  readonly carCrimson = this.standard(0x8f1f2a, 0.5, 0.18);
  readonly carOniViolet = this.standard(0x6536c9, 0.48, 0.2);
  readonly carRyujinCyan = this.standard(0x00b7ff, 0.42, 0.24);
  readonly carbon = this.standard(0x0b1118, 0.6, 0.3);
  readonly darkTrim = this.standard(0x242833, 0.66, 0.18);
  readonly neonRed = this.emissive(0xff2448, 1.25);
  readonly ryujinGlow = this.emissive(0xffe08a, 1.05); // legend: warm gold glow lines
  readonly trafficYellow = this.standard(0xffc928, 0.66, 0.08);
  readonly trafficMint = this.standard(0x2ed39c, 0.7, 0.06);
  readonly trafficOrange = this.standard(0xff7a1a, 0.66, 0.08);
  readonly trafficCream = this.standard(0xfff1c7, 0.72, 0.04);
  readonly glass = this.standard(0x162838, 0.35, 0.05);
  readonly tire = this.standard(0x111111, 0.78, 0.18);
  readonly rim = this.standard(0xc7c9cc, 0.45, 0.25);
  readonly policeRed = this.emissive(0xff2638, 1.8);
  readonly policeBlue = this.emissive(0x2f7dff, 1.8);
  readonly headlight = this.emissive(0xfff1c2, 1.05);
  readonly tailLight = this.emissive(0xff1f2d, 1);
  readonly blinker = this.emissive(0xffa01f, 1.9); // amber turn signal
  readonly smoke = new THREE.MeshBasicMaterial({
    color: 0x6b7079,
    transparent: true,
    opacity: 0.4,
    depthWrite: false
  }); // wreck smoke puff (unlit; mid-grey reads against both day and night, many overlap)

  dispose(): void {
    for (const value of Object.values(this)) {
      if (value instanceof THREE.Material) {
        value.dispose();
      }
    }
  }

  /**
   * Stylised low-poly doesn't need PBR. Matte materials become the much cheaper
   * (per-fragment-light-free) MeshLambertMaterial; the few metallic accents become a
   * cheap MeshPhongMaterial so they keep a sheen. Both are a fraction of the fragment
   * cost of MeshStandardMaterial — big GPU/thermal saving, near-identical look.
   */
  private standard(color: number, roughness: number, metalness: number): THREE.Material & { color: THREE.Color } {
    if (metalness >= 0.35) {
      return new THREE.MeshPhongMaterial({
        color,
        specular: 0x70757c,
        shininess: Math.max(8, (1 - roughness) * 140),
        flatShading: true
      });
    }
    return new THREE.MeshLambertMaterial({ color, flatShading: true });
  }

  private emissive(color: number, intensity: number): THREE.Material & { color: THREE.Color } {
    return new THREE.MeshLambertMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
      flatShading: true
    });
  }
}
