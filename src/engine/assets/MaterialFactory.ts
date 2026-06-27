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

  private standard(color: number, roughness: number, metalness: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      flatShading: true
    });
  }

  private emissive(color: number, intensity: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.55,
      metalness: 0.05,
      flatShading: true
    });
  }
}
