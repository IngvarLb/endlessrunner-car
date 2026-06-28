import * as THREE from "three";
import type { TrafficCarKind } from "../../game/traffic/TrafficTypes";
import type { VehicleModelKey } from "../../game/vehicles/VehicleCatalog";
import { MaterialFactory } from "./MaterialFactory";

export class ModelFactory {
  constructor(private readonly materials: MaterialFactory) {}

  createVehicle(modelKey: VehicleModelKey): THREE.Group {
    switch (modelKey) {
      case "sports-car":
        return this.createSportsCar();
      case "drift-coupe":
        return this.createDriftCoupe();
      case "sakura-roadster":
        return this.createSakuraRoadster();
      case "kitsune-rally":
        return this.createKitsuneRally();
      case "shogun-gtr":
        return this.createShogunGTR();
      case "oni-interceptor":
        return this.createOniInterceptor();
      case "ryujin-hypercar":
        return this.createRyujinHypercar();
    }
  }

  createSportsCar(): THREE.Group {
    // AKAI STRIKER — starter. Deliberately ORDINARY: upright friendly commuter coupe,
    // tall greenhouse, soft edges, small wheels, dark plastic trim. Dusty matte vermillion.
    const group = new THREE.Group();
    group.name = "char_akai_striker_low_poly";

    const body = this.materials.carAkaiRed;
    const trim = this.materials.darkTrim;

    // Lower body + soft rounded shoulders (chamfer strips give a faceted "rounded" feel)
    const lowerBody = this.mesh(new THREE.BoxGeometry(1.46, 0.34, 2.42), body, [0, 0.4, 0]);
    const beltline = this.mesh(new THREE.BoxGeometry(1.5, 0.12, 2.34), body, [0, 0.58, 0]);
    const hood = this.mesh(new THREE.BoxGeometry(1.34, 0.16, 0.86), body, [0, 0.6, 0.78]);
    hood.rotation.x = -0.04;
    const trunk = this.mesh(new THREE.BoxGeometry(1.36, 0.18, 0.6), body, [0, 0.61, -0.92]);
    // Tall upright greenhouse (commuter proportions)
    const cabin = this.mesh(new THREE.BoxGeometry(1.16, 0.46, 1.18), body, [0, 0.86, -0.06]);
    const windshield = this.mesh(new THREE.BoxGeometry(1.0, 0.34, 0.2), this.materials.glass, [0, 0.86, 0.55]);
    windshield.rotation.x = -0.24;
    const rearGlass = this.mesh(new THREE.BoxGeometry(1.0, 0.34, 0.2), this.materials.glass, [0, 0.86, -0.66]);
    rearGlass.rotation.x = 0.22;
    const roof = this.mesh(new THREE.BoxGeometry(1.04, 0.08, 0.86), body, [0, 1.07, -0.06]);

    const grille = this.mesh(new THREE.BoxGeometry(0.78, 0.16, 0.06), trim, [0, 0.44, 1.21]);
    const frontBumper = this.mesh(new THREE.BoxGeometry(1.42, 0.18, 0.16), trim, [0, 0.3, 1.18]);
    const rearBumper = this.mesh(new THREE.BoxGeometry(1.4, 0.18, 0.16), trim, [0, 0.31, -1.18]);
    const leftHeadlight = this.mesh(new THREE.BoxGeometry(0.28, 0.12, 0.06), this.materials.headlight, [-0.46, 0.5, 1.21]);
    const rightHeadlight = this.mesh(new THREE.BoxGeometry(0.28, 0.12, 0.06), this.materials.headlight, [0.46, 0.5, 1.21]);
    const leftTail = this.mesh(new THREE.BoxGeometry(0.3, 0.12, 0.06), this.materials.tailLight, [-0.48, 0.52, -1.21]);
    const rightTail = this.mesh(new THREE.BoxGeometry(0.3, 0.12, 0.06), this.materials.tailLight, [0.48, 0.52, -1.21]);

    group.add(
      lowerBody,
      beltline,
      hood,
      trunk,
      cabin,
      windshield,
      rearGlass,
      roof,
      grille,
      frontBumper,
      rearBumper,
      leftHeadlight,
      rightHeadlight,
      leftTail,
      rightTail
    );

    for (const side of [-1, 1]) {
      const rocker = this.mesh(new THREE.BoxGeometry(0.08, 0.12, 1.9), trim, [side * 0.74, 0.32, -0.02]);
      const pillar = this.mesh(new THREE.BoxGeometry(0.06, 0.44, 0.08), trim, [side * 0.58, 0.86, -0.06]);
      const mirror = this.mesh(new THREE.BoxGeometry(0.12, 0.08, 0.1), trim, [side * 0.62, 0.78, 0.4]);
      group.add(
        rocker,
        pillar,
        mirror,
        this.createWheel([side * 0.72, 0.2, 0.78], 0.2, 0.16, 0.1),
        this.createWheel([side * 0.72, 0.2, -0.78], 0.2, 0.16, 0.1)
      );
    }

    this.enableShadows(group);
    return group;
  }

  createDriftCoupe(): THREE.Group {
    // AOI DRIFT COUPE — starter. Humble coupe roofline, deep ukiyo-e indigo,
    // sumi-black accents, modest gold side-stripe + ducktail. Calm.
    const group = new THREE.Group();
    group.name = "char_aoi_drift_coupe_low_poly";

    const body = this.materials.carAoiIndigo;
    const sumi = this.materials.carSumi;

    const lowerBody = this.mesh(new THREE.BoxGeometry(1.42, 0.32, 2.42), body, [0, 0.38, 0]);
    const shoulder = this.mesh(new THREE.BoxGeometry(1.48, 0.12, 2.3), body, [0, 0.56, 0]);
    const hood = this.mesh(new THREE.BoxGeometry(1.3, 0.16, 0.96), body, [0, 0.56, 0.74]);
    hood.rotation.x = -0.06;
    const rearDeck = this.mesh(new THREE.BoxGeometry(1.36, 0.2, 0.66), body, [0, 0.58, -0.92]);
    // Lower coupe roofline, raked
    const cabin = this.mesh(new THREE.BoxGeometry(1.04, 0.38, 1.06), body, [0, 0.8, -0.12]);
    const windshield = this.mesh(new THREE.BoxGeometry(0.92, 0.3, 0.2), this.materials.glass, [0, 0.82, 0.46]);
    windshield.rotation.x = -0.34;
    const rearGlass = this.mesh(new THREE.BoxGeometry(0.92, 0.3, 0.22), this.materials.glass, [0, 0.82, -0.66]);
    rearGlass.rotation.x = 0.4;
    const roof = this.mesh(new THREE.BoxGeometry(0.92, 0.07, 0.62), body, [0, 1.0, -0.08]);

    const frontBumper = this.mesh(new THREE.BoxGeometry(1.36, 0.16, 0.14), sumi, [0, 0.3, 1.18]);
    const rearBumper = this.mesh(new THREE.BoxGeometry(1.36, 0.16, 0.14), sumi, [0, 0.32, -1.18]);
    const grille = this.mesh(new THREE.BoxGeometry(0.66, 0.14, 0.06), sumi, [0, 0.42, 1.2]);
    const ducktail = this.mesh(new THREE.BoxGeometry(1.2, 0.1, 0.22), sumi, [0, 0.72, -1.04]);
    ducktail.rotation.x = 0.18;
    const leftHeadlight = this.mesh(new THREE.BoxGeometry(0.3, 0.09, 0.06), this.materials.headlight, [-0.44, 0.49, 1.2]);
    const rightHeadlight = this.mesh(new THREE.BoxGeometry(0.3, 0.09, 0.06), this.materials.headlight, [0.44, 0.49, 1.2]);
    const leftTail = this.mesh(new THREE.BoxGeometry(0.32, 0.09, 0.06), this.materials.tailLight, [-0.46, 0.5, -1.2]);
    const rightTail = this.mesh(new THREE.BoxGeometry(0.32, 0.09, 0.06), this.materials.tailLight, [0.46, 0.5, -1.2]);

    group.add(
      lowerBody,
      shoulder,
      hood,
      rearDeck,
      cabin,
      windshield,
      rearGlass,
      roof,
      frontBumper,
      rearBumper,
      grille,
      ducktail,
      leftHeadlight,
      rightHeadlight,
      leftTail,
      rightTail
    );

    for (const side of [-1, 1]) {
      const rocker = this.mesh(new THREE.BoxGeometry(0.09, 0.12, 1.86), sumi, [side * 0.72, 0.3, -0.02]);
      const goldStripe = this.mesh(new THREE.BoxGeometry(0.04, 0.05, 1.5), this.materials.gold, [side * 0.7, 0.52, -0.02]);
      const pillar = this.mesh(new THREE.BoxGeometry(0.06, 0.36, 0.08), sumi, [side * 0.5, 0.8, -0.42]);
      const mirror = this.mesh(new THREE.BoxGeometry(0.13, 0.07, 0.09), sumi, [side * 0.6, 0.72, 0.36]);
      mirror.rotation.z = -side * 0.12;
      group.add(
        rocker,
        goldStripe,
        pillar,
        mirror,
        this.createWheel([side * 0.7, 0.21, 0.76], 0.21, 0.16, 0.1),
        this.createWheel([side * 0.7, 0.21, -0.76], 0.21, 0.16, 0.1)
      );
    }

    this.enableShadows(group);
    return group;
  }

  createSakuraRoadster(): THREE.Group {
    // SAKURA ROADSTER — street. Cheerful open-top roadster, sakura pink + washi-cream
    // lower, chrome trim, recessed cockpit, twin roll hoops. Clean and friendly.
    const pink = this.materials.carSakuraGloss;
    const chrome = this.materials.chrome;
    const g = this.buildCar({
      name: "char_sakura_roadster_low_poly",
      body: pink,
      lower: this.materials.carCream,
      roof: false,
      length: 2.34,
      width: 1.46,
      ride: 0.38,
      bodyH: 0.32,
      wheelR: 0.2,
      rake: 0.06
    });

    const tub = this.mesh(new THREE.BoxGeometry(0.86, 0.16, 0.82), this.materials.carSumi, [0, 0.6, -0.08]);
    const windscreen = this.mesh(new THREE.BoxGeometry(0.74, 0.2, 0.05), this.materials.glass, [0, 0.72, 0.34]);
    windscreen.rotation.x = -0.52;
    const screenFrame = this.mesh(new THREE.BoxGeometry(0.78, 0.04, 0.06), chrome, [0, 0.82, 0.31]);
    screenFrame.rotation.x = -0.52;
    const ducktail = this.mesh(new THREE.BoxGeometry(1.0, 0.07, 0.18), pink, [0, 0.66, -0.98]);
    ducktail.rotation.x = 0.16;
    g.add(tub, windscreen, screenFrame, ducktail);

    for (const sx of [-1, 1]) {
      g.add(
        this.mesh(new THREE.BoxGeometry(0.09, 0.18, 0.09), chrome, [sx * 0.26, 0.72, -0.42]),
        this.mesh(new THREE.BoxGeometry(0.035, 0.05, 1.66), chrome, [sx * 0.7, 0.5, -0.02])
      );
    }

    this.enableShadows(g);
    return g;
  }

  createKitsuneRally(): THREE.Group {
    // KITSUNE RALLY — sport. Raised rally hatch: glossy orange + sumi accents, a sumi
    // hood blaze, a roof-edge spoiler, a front light bar and mudflaps. Clean & purposeful.
    const orange = this.materials.carKitsuneGloss;
    const sumi = this.materials.carSumi;
    const g = this.buildCar({
      name: "char_kitsune_rally_low_poly",
      body: orange,
      lower: sumi,
      roofMat: orange,
      length: 2.36,
      width: 1.5,
      ride: 0.46,
      bodyH: 0.38,
      cabinH: 0.44,
      wheelR: 0.25,
      wheelW: 0.2,
      rake: 0.04
    });

    const hoodBlaze = this.mesh(new THREE.BoxGeometry(0.46, 0.04, 0.66), sumi, [0, 0.715, 0.66]);
    const scoop = this.mesh(new THREE.BoxGeometry(0.34, 0.1, 0.32), sumi, [0, 0.75, 0.46]);
    const roofSpoiler = this.mesh(new THREE.BoxGeometry(0.96, 0.06, 0.18), sumi, [0, 1.12, -0.62]);
    g.add(hoodBlaze, scoop, roofSpoiler);

    // front light bar integrated on the bumper
    for (const x of [-0.44, -0.15, 0.15, 0.44]) {
      const lamp = this.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 10), this.materials.headlight, [x, 0.52, 1.18]);
      lamp.rotation.x = Math.PI * 0.5;
      g.add(lamp);
    }

    for (const sx of [-1, 1]) {
      g.add(
        this.mesh(new THREE.BoxGeometry(0.05, 0.24, 0.13), sumi, [sx * 0.74, 0.26, -1.02]),
        this.mesh(new THREE.BoxGeometry(0.045, 0.26, 0.36), this.materials.carCream, [sx * 0.755, 0.56, -0.04])
      );
    }

    this.enableShadows(g);
    return g;
  }

  createShogunGTR(): THREE.Group {
    // SHOGUN GTR — sport. Low wide gloss-black GT, "samurai armor" read via gold-leaf
    // pin-trim along the shoulder, a gold splitter line and a modest deck-mounted wing.
    const black = this.materials.carShogunBlack;
    const gold = this.materials.gold;
    const g = this.buildCar({
      name: "char_shogun_gtr_low_poly",
      body: black,
      lower: this.materials.carbon,
      roofMat: black,
      length: 2.58,
      width: 1.56,
      ride: 0.36,
      bodyH: 0.3,
      cabinLen: 1.02,
      cabinH: 0.34,
      cabinW: 1.0,
      wheelR: 0.24,
      rake: 0.08
    });

    const splitter = this.mesh(new THREE.BoxGeometry(1.6, 0.06, 0.22), this.materials.carbon, [0, 0.21, 1.32]);
    const splitterGold = this.mesh(new THREE.BoxGeometry(1.3, 0.03, 0.05), gold, [0, 0.25, 1.42]);
    const diffuser = this.mesh(new THREE.BoxGeometry(1.46, 0.14, 0.18), this.materials.carbon, [0, 0.24, -1.3]);
    // Modest rear wing on short supports rising off the deck
    const wing = this.mesh(new THREE.BoxGeometry(1.42, 0.06, 0.24), this.materials.carbon, [0, 0.78, -1.08]);
    const wingGold = this.mesh(new THREE.BoxGeometry(1.12, 0.03, 0.05), gold, [0, 0.82, -1.0]);
    g.add(splitter, splitterGold, diffuser, wing, wingGold);

    for (const sx of [-1, 1]) {
      const support = this.mesh(new THREE.BoxGeometry(0.06, 0.22, 0.08), this.materials.carbon, [sx * 0.5, 0.68, -1.06]);
      const goldPin = this.mesh(new THREE.BoxGeometry(0.03, 0.035, 1.78), gold, [sx * 0.77, 0.57, -0.02]);
      const skirt = this.mesh(new THREE.BoxGeometry(0.1, 0.1, 1.5), this.materials.carbon, [sx * 0.77, 0.27, -0.02]);
      const exhaust = this.mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.14, 10), this.materials.steelTrim, [sx * 0.26, 0.3, -1.4]);
      exhaust.rotation.x = Math.PI * 0.5;
      g.add(support, goldPin, skirt, exhaust);
    }

    this.enableShadows(g);
    return g;
  }

  createOniInterceptor(): THREE.Group {
    // ONI INTERCEPTOR — elite. Aggressive low-wide deep violet over sumi, gold-leaf
    // trim, a deck wing, flat gold canard fins and ONE subtle red underglow strip.
    const violet = this.materials.carOniGloss;
    const sumi = this.materials.carSumi;
    const gold = this.materials.gold;
    const glow = this.materials.oniGlow;
    const g = this.buildCar({
      name: "char_oni_interceptor_low_poly",
      body: violet,
      lower: sumi,
      roofMat: sumi,
      length: 2.6,
      width: 1.58,
      ride: 0.34,
      bodyH: 0.3,
      cabinLen: 1.0,
      cabinH: 0.32,
      cabinW: 1.0,
      wheelR: 0.25,
      rake: 0.1
    });

    const splitter = this.mesh(new THREE.BoxGeometry(1.66, 0.07, 0.24), this.materials.carbon, [0, 0.2, 1.34]);
    const splitterGold = this.mesh(new THREE.BoxGeometry(1.32, 0.03, 0.05), gold, [0, 0.24, 1.45]);
    const diffuser = this.mesh(new THREE.BoxGeometry(1.46, 0.14, 0.22), sumi, [0, 0.24, -1.3]);
    const wing = this.mesh(new THREE.BoxGeometry(1.5, 0.07, 0.26), this.materials.carbon, [0, 0.8, -1.12]);
    const wingGold = this.mesh(new THREE.BoxGeometry(1.16, 0.03, 0.05), gold, [0, 0.84, -1.04]);
    g.add(splitter, splitterGold, diffuser, wing, wingGold);

    for (const sx of [-1, 1]) {
      const support = this.mesh(new THREE.BoxGeometry(0.07, 0.24, 0.08), sumi, [sx * 0.52, 0.69, -1.1]);
      // flat gold canard on the front fender — attached, swept, low
      const canard = this.mesh(new THREE.BoxGeometry(0.3, 0.03, 0.14), gold, [sx * 0.62, 0.42, 1.08]);
      canard.rotation.z = sx * 0.12;
      const skirt = this.mesh(new THREE.BoxGeometry(0.1, 0.1, 1.5), sumi, [sx * 0.78, 0.26, -0.02]);
      const underglow = this.mesh(new THREE.BoxGeometry(0.04, 0.03, 1.5), glow, [sx * 0.74, 0.2, -0.02]);
      const exhaust = this.mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.14, 10), this.materials.steelTrim, [sx * 0.3, 0.3, -1.4]);
      exhaust.rotation.x = Math.PI * 0.5;
      g.add(support, canard, skirt, underglow, exhaust);
    }

    this.enableShadows(g);
    return g;
  }

  createRyujinHypercar(): THREE.Group {
    // RYUJIN HYPERCAR — legend. Long low lustrous-GOLD wedge over a carbon underbody,
    // bright chrome-gold pin-trim and warm gold glow lines. The 12k legend looks the part.
    const goldBody = this.materials.carRyujinGold;
    const trim = this.materials.chrome; // bright chrome highlights pop against the gold body
    const goldGlow = this.materials.ryujinGlow;
    const g = this.buildCar({
      name: "char_ryujin_hypercar_low_poly",
      body: goldBody,
      lower: this.materials.carbon,
      roofMat: goldBody,
      length: 2.72,
      width: 1.5,
      ride: 0.32,
      bodyH: 0.3,
      cabinLen: 0.92,
      cabinH: 0.3,
      cabinW: 0.9,
      cabinZ: -0.12,
      wheelR: 0.24,
      rake: 0.13
    });

    const splitter = this.mesh(new THREE.BoxGeometry(1.66, 0.06, 0.26), this.materials.carbon, [0, 0.18, 1.42]);
    const splitterTrim = this.mesh(new THREE.BoxGeometry(1.3, 0.03, 0.05), trim, [0, 0.22, 1.52]);
    const frontGlow = this.mesh(new THREE.BoxGeometry(1.0, 0.03, 0.04), goldGlow, [0, 0.26, 1.54]);
    const diffuser = this.mesh(new THREE.BoxGeometry(1.42, 0.14, 0.26), this.materials.carbon, [0, 0.22, -1.36]);
    const diffuserGlow = this.mesh(new THREE.BoxGeometry(0.9, 0.03, 0.04), goldGlow, [0, 0.28, -1.48]);
    // Low rear wing on short supports rising off the deck (no tall pylons)
    const wing = this.mesh(new THREE.BoxGeometry(1.56, 0.06, 0.3), goldBody, [0, 0.82, -1.18]);
    const wingTrim = this.mesh(new THREE.BoxGeometry(1.24, 0.03, 0.05), trim, [0, 0.86, -1.08]);
    const wingGlow = this.mesh(new THREE.BoxGeometry(1.24, 0.025, 0.04), goldGlow, [0, 0.79, -1.3]);
    g.add(splitter, splitterTrim, frontGlow, diffuser, diffuserGlow, wing, wingTrim, wingGlow);

    for (const sx of [-1, 1]) {
      const support = this.mesh(new THREE.BoxGeometry(0.06, 0.22, 0.09), goldBody, [sx * 0.5, 0.71, -1.16]);
      const rail = this.mesh(new THREE.BoxGeometry(0.03, 0.04, 1.9), trim, [sx * 0.73, 0.52, -0.02]);
      const sideGlow = this.mesh(new THREE.BoxGeometry(0.035, 0.03, 1.6), goldGlow, [sx * 0.76, 0.34, -0.02]);
      g.add(support, rail, sideGlow);
    }

    this.enableShadows(g);
    return g;
  }

  createTokyoPoliceCar(): THREE.Group {
    const group = new THREE.Group();
    group.name = "enemy_tokyo_style_police_car_fallback";

    const body = this.mesh(new THREE.BoxGeometry(1.55, 0.42, 2.62), this.materials.carWhite, [0, 0.46, 0]);
    const hood = this.mesh(new THREE.BoxGeometry(1.42, 0.18, 0.82), this.materials.carWhite, [0, 0.58, 0.74]);
    const trunk = this.mesh(new THREE.BoxGeometry(1.32, 0.22, 0.58), this.materials.carWhite, [0, 0.6, -0.86]);
    const cabin = this.mesh(new THREE.BoxGeometry(1.02, 0.48, 0.98), this.materials.glass, [0, 0.9, -0.04]);
    const leftDoor = this.mesh(new THREE.BoxGeometry(0.06, 0.32, 1.02), this.materials.carBlack, [-0.8, 0.56, -0.05]);
    const rightDoor = this.mesh(new THREE.BoxGeometry(0.06, 0.32, 1.02), this.materials.carBlack, [0.8, 0.56, -0.05]);
    const grill = this.mesh(new THREE.BoxGeometry(0.72, 0.16, 0.08), this.materials.carBlack, [0, 0.48, 1.34]);
    const bullBarTop = this.mesh(new THREE.BoxGeometry(1.05, 0.06, 0.08), this.materials.darkMetal, [0, 0.7, 1.44]);
    const bullBarBottom = this.mesh(new THREE.BoxGeometry(1.05, 0.06, 0.08), this.materials.darkMetal, [0, 0.42, 1.44]);
    const bullBarLeft = this.mesh(new THREE.BoxGeometry(0.06, 0.32, 0.08), this.materials.darkMetal, [-0.42, 0.56, 1.44]);
    const bullBarRight = this.mesh(new THREE.BoxGeometry(0.06, 0.32, 0.08), this.materials.darkMetal, [0.42, 0.56, 1.44]);
    const lightbarBase = this.mesh(new THREE.BoxGeometry(0.82, 0.06, 0.2), this.materials.carBlack, [0, 1.18, -0.08]);
    const redLight = this.mesh(new THREE.BoxGeometry(0.36, 0.08, 0.18), this.materials.policeRed, [-0.22, 1.24, -0.08]);
    const blueLight = this.mesh(new THREE.BoxGeometry(0.36, 0.08, 0.18), this.materials.policeBlue, [0.22, 1.24, -0.08]);
    const leftHeadlight = this.mesh(new THREE.BoxGeometry(0.28, 0.06, 0.06), this.materials.headlight, [-0.38, 0.52, 1.34]);
    const rightHeadlight = this.mesh(new THREE.BoxGeometry(0.28, 0.06, 0.06), this.materials.headlight, [0.38, 0.52, 1.34]);

    group.add(
      body,
      hood,
      trunk,
      cabin,
      leftDoor,
      rightDoor,
      grill,
      bullBarTop,
      bullBarBottom,
      bullBarLeft,
      bullBarRight,
      lightbarBase,
      redLight,
      blueLight,
      leftHeadlight,
      rightHeadlight,
      this.createWheel([-0.82, 0.24, 0.82]),
      this.createWheel([0.82, 0.24, 0.82]),
      this.createWheel([-0.82, 0.24, -0.82]),
      this.createWheel([0.82, 0.24, -0.82])
    );
    this.enableShadows(group);

    return group;
  }

  createTrafficCar(kind: TrafficCarKind): THREE.Group {
    switch (kind) {
      case "traffic-kei-hatch":
        return this.createTrafficKeiHatch();
      case "traffic-city-sedan":
        return this.createTrafficCitySedan();
      case "traffic-box-van":
        return this.createTrafficBoxVan();
    }
  }

  private createTrafficKeiHatch(): THREE.Group {
    const group = new THREE.Group();
    group.name = "traffic_kei_hatch_low_poly";

    const body = this.mesh(new THREE.BoxGeometry(1.22, 0.5, 1.68), this.materials.trafficYellow, [0, 0.44, 0]);
    const hood = this.mesh(new THREE.BoxGeometry(1.1, 0.24, 0.58), this.materials.trafficYellow, [0, 0.56, 0.66]);
    hood.rotation.x = -0.05;
    const hatch = this.mesh(new THREE.BoxGeometry(1.06, 0.52, 0.76), this.materials.trafficYellow, [0, 0.78, -0.36]);
    hatch.rotation.x = 0.04;
    const windshield = this.mesh(new THREE.BoxGeometry(0.86, 0.34, 0.18), this.materials.glass, [0, 0.78, 0.27]);
    windshield.rotation.x = -0.18;
    const rearWindow = this.mesh(new THREE.BoxGeometry(0.84, 0.34, 0.16), this.materials.glass, [0, 0.82, -0.78]);
    rearWindow.rotation.x = 0.16;
    const bumper = this.mesh(new THREE.BoxGeometry(1.08, 0.12, 0.12), this.materials.carBlack, [0, 0.31, 0.9]);
    const rearBumper = this.mesh(new THREE.BoxGeometry(1.02, 0.12, 0.12), this.materials.carBlack, [0, 0.34, -0.9]);
    const leftStripe = this.mesh(new THREE.BoxGeometry(0.08, 0.08, 1.22), this.materials.trafficMint, [-0.48, 0.68, -0.04]);
    const rightStripe = this.mesh(new THREE.BoxGeometry(0.08, 0.08, 1.22), this.materials.trafficMint, [0.48, 0.68, -0.04]);
    const leftHeadlight = this.mesh(new THREE.BoxGeometry(0.22, 0.055, 0.055), this.materials.headlight, [-0.28, 0.5, 0.88]);
    const rightHeadlight = this.mesh(new THREE.BoxGeometry(0.22, 0.055, 0.055), this.materials.headlight, [0.28, 0.5, 0.88]);
    const leftTail = this.mesh(new THREE.BoxGeometry(0.22, 0.055, 0.055), this.materials.tailLight, [-0.3, 0.5, -0.95]);
    const rightTail = this.mesh(new THREE.BoxGeometry(0.22, 0.055, 0.055), this.materials.tailLight, [0.3, 0.5, -0.95]);

    group.add(
      body,
      hood,
      hatch,
      windshield,
      rearWindow,
      bumper,
      rearBumper,
      leftStripe,
      rightStripe,
      leftHeadlight,
      rightHeadlight,
      leftTail,
      rightTail,
      this.createWheel([-0.66, 0.24, 0.56], 0.18, 0.13, 0.08),
      this.createWheel([0.66, 0.24, 0.56], 0.18, 0.13, 0.08),
      this.createWheel([-0.66, 0.24, -0.55], 0.18, 0.13, 0.08),
      this.createWheel([0.66, 0.24, -0.55], 0.18, 0.13, 0.08)
    );
    this.enableShadows(group);
    this.addBlinkers(group, 0.52, 0.52, -0.92);
    this.addWreckSmoke(group);

    return group;
  }

  private createTrafficCitySedan(): THREE.Group {
    const group = new THREE.Group();
    group.name = "traffic_city_sedan_low_poly";

    const body = this.mesh(new THREE.BoxGeometry(1.45, 0.42, 2.28), this.materials.trafficMint, [0, 0.42, 0]);
    const hood = this.mesh(new THREE.BoxGeometry(1.28, 0.18, 0.78), this.materials.trafficMint, [0, 0.55, 0.72]);
    hood.rotation.x = -0.05;
    const trunk = this.mesh(new THREE.BoxGeometry(1.28, 0.22, 0.64), this.materials.trafficMint, [0, 0.56, -0.82]);
    const cabin = this.mesh(new THREE.BoxGeometry(0.96, 0.44, 0.84), this.materials.glass, [0, 0.82, -0.08]);
    cabin.rotation.x = -0.04;
    const roofStripe = this.mesh(new THREE.BoxGeometry(0.9, 0.06, 0.76), this.materials.trafficCream, [0, 1.08, -0.08]);
    const frontBumper = this.mesh(new THREE.BoxGeometry(1.28, 0.13, 0.12), this.materials.carBlack, [0, 0.32, 1.2]);
    const rearBumper = this.mesh(new THREE.BoxGeometry(1.24, 0.13, 0.12), this.materials.carBlack, [0, 0.34, -1.2]);
    const leftHeadlight = this.mesh(new THREE.BoxGeometry(0.28, 0.055, 0.055), this.materials.headlight, [-0.36, 0.5, 1.18]);
    const rightHeadlight = this.mesh(new THREE.BoxGeometry(0.28, 0.055, 0.055), this.materials.headlight, [0.36, 0.5, 1.18]);
    const leftTail = this.mesh(new THREE.BoxGeometry(0.28, 0.055, 0.055), this.materials.tailLight, [-0.38, 0.5, -1.25]);
    const rightTail = this.mesh(new THREE.BoxGeometry(0.28, 0.055, 0.055), this.materials.tailLight, [0.38, 0.5, -1.25]);

    group.add(
      body,
      hood,
      trunk,
      cabin,
      roofStripe,
      frontBumper,
      rearBumper,
      leftHeadlight,
      rightHeadlight,
      leftTail,
      rightTail,
      this.createWheel([-0.75, 0.23, 0.72], 0.2, 0.15, 0.09),
      this.createWheel([0.75, 0.23, 0.72], 0.2, 0.15, 0.09),
      this.createWheel([-0.75, 0.23, -0.76], 0.2, 0.15, 0.09),
      this.createWheel([0.75, 0.23, -0.76], 0.2, 0.15, 0.09)
    );
    this.enableShadows(group);
    this.addBlinkers(group, 0.58, 0.52, -1.2);
    this.addWreckSmoke(group);

    return group;
  }

  private createTrafficBoxVan(): THREE.Group {
    const group = new THREE.Group();
    group.name = "traffic_box_van_low_poly";

    const lowerBody = this.mesh(new THREE.BoxGeometry(1.42, 0.52, 2.18), this.materials.trafficOrange, [0, 0.48, 0]);
    const cabin = this.mesh(new THREE.BoxGeometry(1.28, 0.56, 0.86), this.materials.trafficOrange, [0, 0.86, 0.56]);
    cabin.rotation.x = -0.03;
    const cargoBox = this.mesh(new THREE.BoxGeometry(1.34, 0.72, 1.18), this.materials.trafficCream, [0, 0.88, -0.48]);
    const windshield = this.mesh(new THREE.BoxGeometry(0.92, 0.32, 0.14), this.materials.glass, [0, 0.95, 1.0]);
    windshield.rotation.x = -0.2;
    const sidePanelLeft = this.mesh(new THREE.BoxGeometry(0.06, 0.42, 0.92), this.materials.trafficYellow, [-0.72, 0.9, -0.46]);
    const sidePanelRight = this.mesh(new THREE.BoxGeometry(0.06, 0.42, 0.92), this.materials.trafficYellow, [0.72, 0.9, -0.46]);
    const frontBumper = this.mesh(new THREE.BoxGeometry(1.22, 0.14, 0.12), this.materials.carBlack, [0, 0.34, 1.12]);
    const rearBumper = this.mesh(new THREE.BoxGeometry(1.18, 0.14, 0.12), this.materials.carBlack, [0, 0.36, -1.14]);
    const leftHeadlight = this.mesh(new THREE.BoxGeometry(0.24, 0.055, 0.055), this.materials.headlight, [-0.32, 0.62, 1.1]);
    const rightHeadlight = this.mesh(new THREE.BoxGeometry(0.24, 0.055, 0.055), this.materials.headlight, [0.32, 0.62, 1.1]);
    const leftTail = this.mesh(new THREE.BoxGeometry(0.22, 0.06, 0.055), this.materials.tailLight, [-0.42, 0.62, -1.2]);
    const rightTail = this.mesh(new THREE.BoxGeometry(0.22, 0.06, 0.055), this.materials.tailLight, [0.42, 0.62, -1.2]);

    group.add(
      lowerBody,
      cabin,
      cargoBox,
      windshield,
      sidePanelLeft,
      sidePanelRight,
      frontBumper,
      rearBumper,
      leftHeadlight,
      rightHeadlight,
      leftTail,
      rightTail,
      this.createWheel([-0.74, 0.25, 0.68], 0.22, 0.16, 0.1),
      this.createWheel([0.74, 0.25, 0.68], 0.22, 0.16, 0.1),
      this.createWheel([-0.74, 0.25, -0.72], 0.22, 0.16, 0.1),
      this.createWheel([0.74, 0.25, -0.72], 0.22, 0.16, 0.1)
    );
    this.enableShadows(group);
    this.addBlinkers(group, 0.62, 0.62, -1.16);
    this.addWreckSmoke(group);

    return group;
  }

  /**
   * Four smoke puffs above the car, hidden by default. TrafficCar shows + animates
   * them (rise/drift/dissipate) into a wispy column while the car is a 将 wreck.
   */
  private addWreckSmoke(group: THREE.Group): void {
    const geometry = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    for (const name of ["smoke0", "smoke1", "smoke2", "smoke3"]) {
      const puff = new THREE.Mesh(geometry, this.materials.smoke);
      puff.name = name;
      puff.visible = false;
      puff.castShadow = false;
      puff.receiveShadow = false;
      group.add(puff);
    }
  }

  /**
   * Amber turn-signal lights at the two rear corners, hidden by default. TrafficCar
   * looks them up by name ("blinker_px" at +x, "blinker_nx" at -x) and blinks the
   * one on the side it's merging toward.
   */
  private addBlinkers(group: THREE.Group, halfWidth: number, y: number, rearZ: number): void {
    const geometry = new THREE.BoxGeometry(0.17, 0.12, 0.1);
    for (const [name, x] of [["blinker_px", halfWidth], ["blinker_nx", -halfWidth]] as const) {
      const light = this.mesh(geometry, this.materials.blinker, [x, y, rearZ]);
      light.name = name;
      light.visible = false;
      light.castShadow = false;
      light.receiveShadow = false;
      group.add(light);
    }
  }

  createTorii(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_torii_fallback";

    const leftPost = this.mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), this.materials.torii, [-3.72, 1.6, 0]);
    const rightPost = this.mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), this.materials.torii, [3.72, 1.6, 0]);
    const topBeam = this.mesh(new THREE.BoxGeometry(8.35, 0.32, 0.34), this.materials.torii, [0, 3.22, 0]);
    const upperBeam = this.mesh(new THREE.BoxGeometry(7.45, 0.24, 0.3), this.materials.torii, [0, 2.82, 0]);
    const darkCaps = this.mesh(new THREE.BoxGeometry(8.8, 0.16, 0.38), this.materials.darkMetal, [0, 3.5, 0]);

    group.add(leftPost, rightPost, topBeam, upperBeam, darkCaps);
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });

    return group;
  }

  createBambooCluster(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_bamboo_cluster_fallback";

    for (let index = 0; index < 5; index += 1) {
      const height = 2.2 + index * 0.22;
      const stalk = this.mesh(
        new THREE.CylinderGeometry(0.06, 0.08, height, 6),
        index % 2 === 0 ? this.materials.foliage : this.materials.foliageDark,
        [(index - 2) * 0.16, height * 0.5, (index % 2) * 0.18]
      );
      stalk.rotation.z = (index - 2) * 0.04;
      group.add(stalk);
    }

    return group;
  }

  createMapleTree(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_maple_tree";

    const trunk = this.mesh(new THREE.CylinderGeometry(0.12, 0.2, 2.4, 6), this.materials.darkWood, [0, 1.2, 0]);
    group.add(trunk);
    const branchL = this.mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.0, 5), this.materials.darkWood, [-0.28, 2.0, 0.05]);
    branchL.rotation.z = 0.7;
    const branchR = this.mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.0, 5), this.materials.darkWood, [0.3, 2.05, -0.05]);
    branchR.rotation.z = -0.8;
    group.add(branchL, branchR);

    // Fiery faceted canopy: overlapping low-poly icosahedron blobs across the 3 maple
    // materials so each tree blends crimson/orange/gold in autumn (green in summer).
    const mats = [this.materials.mapleLeafRed, this.materials.mapleLeafOrange, this.materials.mapleLeafGold];
    const blobs: Array<[number, number, number, number, number]> = [
      [0, 2.7, 0, 1.15, 0],
      [0.6, 3.05, 0.2, 0.82, 1],
      [-0.62, 2.95, -0.18, 0.8, 2],
      [0.1, 3.35, -0.35, 0.74, 1],
      [-0.25, 3.4, 0.32, 0.66, 0],
      [0.4, 2.55, -0.5, 0.6, 2]
    ];
    for (const [x, y, z, r, mi] of blobs) {
      const blob = this.mesh(new THREE.IcosahedronGeometry(r, 0), mats[mi], [x, y, z]);
      blob.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(blob);
    }

    this.enableShadows(group);
    return group;
  }

  createStoneLantern(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_stone_lantern_fallback";

    group.add(
      this.mesh(new THREE.BoxGeometry(0.54, 0.18, 0.54), this.materials.stone, [0, 0.09, 0]),
      this.mesh(new THREE.BoxGeometry(0.24, 0.68, 0.24), this.materials.stone, [0, 0.5, 0]),
      this.mesh(new THREE.BoxGeometry(0.52, 0.38, 0.52), this.materials.stone, [0, 1.04, 0]),
      this.mesh(new THREE.BoxGeometry(0.68, 0.16, 0.68), this.materials.torii, [0, 1.33, 0]),
      this.mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), this.materials.ember, [0, 1.04, -0.27])
    );

    return group;
  }

  createMachiyaHouse(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_machiya_house_low_poly";

    group.add(
      this.mesh(new THREE.BoxGeometry(3.05, 1.65, 2.05), this.materials.plaster, [0, 0.825, 0]),
      this.mesh(new THREE.BoxGeometry(3.16, 1.18, 0.08), this.materials.warmWood, [0, 0.7, 1.06]),
      this.createGableRoof(3.62, 2.56, 0.58, 1.72, this.materials.roofTile),
      this.mesh(new THREE.BoxGeometry(3.5, 0.1, 0.12), this.materials.darkWood, [0, 2.33, 0]),
      this.mesh(new THREE.BoxGeometry(3.58, 0.12, 0.14), this.materials.darkWood, [0, 1.72, 1.34]),
      this.mesh(new THREE.BoxGeometry(3.58, 0.12, 0.14), this.materials.darkWood, [0, 1.72, -1.34]),
      this.mesh(new THREE.BoxGeometry(3.1, 0.1, 0.1), this.materials.darkWood, [0, 1.38, 1.11]),
      this.mesh(new THREE.BoxGeometry(3.1, 0.1, 0.1), this.materials.darkWood, [0, 0.18, 1.11]),
      this.mesh(new THREE.BoxGeometry(0.62, 1.1, 0.08), this.materials.darkWood, [-0.16, 0.68, 1.12]),
      this.mesh(new THREE.BoxGeometry(0.38, 0.74, 0.04), this.materials.paperWindow, [-0.16, 0.75, 1.17]),
      this.mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), this.materials.gold, [0.17, 0.72, 1.2]),
      this.mesh(new THREE.BoxGeometry(0.3, 0.68, 0.08), this.materials.warmWood, [1.42, 1.08, 1.15]),
      this.createHangingLantern([1.18, 1.28, 1.18], 0.92)
    );

    for (const x of [-1.48, -0.52, 0.52, 1.48]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.1, 1.44, 0.12), this.materials.darkWood, [x, 0.86, 1.13]));
    }

    this.addFrontLatticePanel(group, [-1.02, 0.78, 1.15], [0.78, 0.92], this.materials.paperWindow, this.materials.darkWood, 4, 3);
    this.addFrontLatticePanel(group, [0.95, 0.8, 1.15], [0.86, 0.86], this.materials.paperWindow, this.materials.darkWood, 5, 3);
    this.addFrontLatticePanel(group, [0, 1.5, 1.13], [2.05, 0.36], this.materials.paperWindow, this.materials.darkWood, 8, 1);

    this.enableShadows(group);
    return group;
  }

  createMinkaHouse(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_minka_house_low_poly";

    group.add(
      this.mesh(new THREE.BoxGeometry(3.76, 0.24, 2.26), this.materials.stone, [0, 0.12, 0]),
      this.mesh(new THREE.BoxGeometry(3.54, 1.34, 2.06), this.materials.earthWall, [0, 0.91, 0]),
      this.createHippedRoof(4.34, 3.12, 1.18, 1.46, this.materials.thatch, 0, 0.42),
      this.mesh(new THREE.BoxGeometry(1.86, 0.1, 0.14), this.materials.darkWood, [0, 2.68, 0]),
      this.mesh(new THREE.BoxGeometry(3.86, 0.12, 0.16), this.materials.darkWood, [0, 1.43, 1.35]),
      this.mesh(new THREE.BoxGeometry(3.86, 0.12, 0.16), this.materials.darkWood, [0, 1.43, -1.35]),
      this.mesh(new THREE.BoxGeometry(3.56, 0.12, 0.1), this.materials.darkWood, [0, 1.2, 1.09]),
      this.mesh(new THREE.BoxGeometry(0.62, 1.04, 0.08), this.materials.darkWood, [0, 0.78, 1.13]),
      this.mesh(new THREE.BoxGeometry(0.44, 0.72, 0.04), this.materials.paperWindow, [0, 0.86, 1.18]),
      this.mesh(new THREE.BoxGeometry(0.8, 0.22, 0.08), this.materials.warmWood, [0, 1.32, 1.16])
    );

    for (const x of [-1.65, -0.55, 0.55, 1.65]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.12, 1.34, 0.14), this.materials.darkWood, [x, 0.79, 1.15]));
    }

    for (const x of [-1.8, -1.08, -0.36, 0.36, 1.08, 1.8]) {
      const rafter = this.mesh(new THREE.BoxGeometry(0.08, 0.08, 0.5), this.materials.darkWood, [x, 1.35, 1.48]);
      rafter.rotation.x = -0.18;
      group.add(rafter);
    }

    this.addFrontLatticePanel(group, [-1.05, 0.84, 1.15], [0.82, 0.72], this.materials.paperWindow, this.materials.darkWood, 4, 2);
    this.addFrontLatticePanel(group, [1.05, 0.84, 1.15], [0.82, 0.72], this.materials.paperWindow, this.materials.darkWood, 4, 2);
    this.addFrontLatticePanel(group, [0, 1.28, 1.16], [0.62, 0.32], this.materials.paperWindow, this.materials.darkWood, 3, 1);
    group.add(this.createHangingLantern([-1.62, 1.12, 1.23], 0.78));

    this.enableShadows(group);
    return group;
  }

  createNagayaRowHouse(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_nagaya_row_house_low_poly";

    group.add(
      this.mesh(new THREE.BoxGeometry(4.08, 1.56, 1.86), this.materials.plaster, [0, 0.78, 0]),
      this.mesh(new THREE.BoxGeometry(4.16, 0.18, 1.98), this.materials.stone, [0, 0.09, 0]),
      this.createGableRoof(4.48, 2.42, 0.68, 1.56, this.materials.roofTile),
      this.mesh(new THREE.BoxGeometry(4.34, 0.1, 0.12), this.materials.darkWood, [0, 2.27, 0]),
      this.mesh(new THREE.BoxGeometry(4.44, 0.12, 0.14), this.materials.darkWood, [0, 1.56, 1.28]),
      this.mesh(new THREE.BoxGeometry(4.44, 0.12, 0.14), this.materials.darkWood, [0, 1.56, -1.28]),
      this.mesh(new THREE.BoxGeometry(4.08, 0.12, 0.1), this.materials.darkWood, [0, 1.34, 0.99])
    );

    for (const x of [-2.0, -0.68, 0.68, 2.0]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.1, 1.48, 0.12), this.materials.darkWood, [x, 0.82, 1.02]));
    }

    for (const x of [-1.36, 0, 1.36]) {
      group.add(
        this.mesh(new THREE.BoxGeometry(0.42, 1.04, 0.08), this.materials.darkWood, [x - 0.28, 0.62, 1.05]),
        this.mesh(new THREE.BoxGeometry(0.9, 0.22, 0.06), this.materials.cloth, [x, 1.12, 1.08]),
        this.createHangingLantern([x + 0.54, 1.17, 1.17], 0.62)
      );
      this.addFrontLatticePanel(group, [x + 0.28, 0.7, 1.08], [0.48, 0.78], this.materials.paperWindow, this.materials.darkWood, 3, 2);
      this.addFrontLatticePanel(group, [x, 1.3, 1.07], [0.9, 0.28], this.materials.paperWindow, this.materials.darkWood, 5, 1);
    }

    this.enableShadows(group);
    return group;
  }

  createKuraStorehouse(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_kura_storehouse_low_poly";

    group.add(
      this.mesh(new THREE.BoxGeometry(2.42, 0.3, 2.02), this.materials.stone, [0, 0.15, 0]),
      this.mesh(new THREE.BoxGeometry(2.18, 1.86, 1.78), this.materials.plaster, [0, 1.08, 0]),
      this.createGableRoof(2.86, 2.34, 0.62, 2.02, this.materials.roofTile),
      this.mesh(new THREE.BoxGeometry(2.72, 0.1, 0.12), this.materials.darkWood, [0, 2.67, 0]),
      this.mesh(new THREE.BoxGeometry(2.84, 0.12, 0.14), this.materials.darkWood, [0, 2.02, 1.24]),
      this.mesh(new THREE.BoxGeometry(2.84, 0.12, 0.14), this.materials.darkWood, [0, 2.02, -1.24]),
      this.mesh(new THREE.BoxGeometry(2.2, 0.12, 0.1), this.materials.darkWood, [0, 1.96, 0.93]),
      this.mesh(new THREE.BoxGeometry(2.2, 0.1, 0.1), this.materials.darkWood, [0, 0.42, 0.93]),
      this.mesh(new THREE.BoxGeometry(0.74, 1.28, 0.08), this.materials.darkWood, [0, 0.92, 0.94]),
      this.mesh(new THREE.BoxGeometry(0.58, 0.1, 0.1), this.materials.darkMetal, [0, 1.16, 1.0]),
      this.mesh(new THREE.BoxGeometry(0.58, 0.1, 0.1), this.materials.darkMetal, [0, 0.76, 1.0])
    );

    for (const x of [-1.13, 1.13]) {
      for (const z of [-0.93, 0.93]) {
        group.add(this.mesh(new THREE.BoxGeometry(0.12, 1.92, 0.12), this.materials.darkWood, [x, 1.1, z]));
      }
    }

    this.addFrontLatticePanel(group, [0.64, 1.54, 0.96], [0.46, 0.38], this.materials.paperWindow, this.materials.darkWood, 2, 1);

    this.enableShadows(group);
    return group;
  }

  createGroundSegment(length: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "seg_torii_straight_fallback";

    const path = this.mesh(new THREE.BoxGeometry(6.4, 0.16, length), this.materials.path, [0, -0.08, length * 0.5]);
    const leftGrass = this.mesh(new THREE.BoxGeometry(5, 0.12, length), this.materials.grass, [-5.7, -0.1, length * 0.5]);
    const rightGrass = this.mesh(new THREE.BoxGeometry(5, 0.12, length), this.materials.grass, [5.7, -0.1, length * 0.5]);
    const leftEdgeLine = this.mesh(new THREE.BoxGeometry(0.08, 0.012, length), this.materials.roadLine, [-3.03, 0.012, length * 0.5]);
    const rightEdgeLine = this.mesh(new THREE.BoxGeometry(0.08, 0.012, length), this.materials.roadLine, [3.03, 0.012, length * 0.5]);

    group.add(path, leftGrass, rightGrass, leftEdgeLine, rightEdgeLine);

    const laneMarkerXs = [-1.2, 1.2];
    const dashLength = 1.85;
    const dashSpacing = 4.1;
    for (let z = 1.05; z < length; z += dashSpacing) {
      for (const x of laneMarkerXs) {
        group.add(this.mesh(new THREE.BoxGeometry(0.08, 0.014, dashLength), this.materials.roadLine, [x, 0.018, z]));
      }
    }

    return group;
  }

  createKoban(): THREE.Mesh {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 8), this.materials.gold);
    coin.name = "col_koban_fallback";
    coin.rotation.x = Math.PI * 0.5;
    coin.castShadow = true;
    return coin;
  }

  createShieldPowerUp(): THREE.Group {
    const group = new THREE.Group();
    group.name = "pwr_shield_fallback";
    const core = this.mesh(new THREE.OctahedronGeometry(0.38, 0), this.materials.turquoise, [0, 0.7, 0]);
    const ring = this.mesh(new THREE.TorusGeometry(0.48, 0.035, 6, 18), this.materials.turquoise, [0, 0.7, 0]);
    ring.rotation.x = Math.PI * 0.5;
    group.add(core, ring);
    return group;
  }

  createFallenBambooObstacle(): THREE.Group {
    const group = new THREE.Group();
    group.name = "obs_bamboo_fallen_fallback";

    const bamboo = this.mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.65, 6), this.materials.foliageDark, [0, 0.42, 0]);
    bamboo.rotation.z = Math.PI * 0.5;
    const warning = this.mesh(new THREE.BoxGeometry(1.85, 0.04, 0.18), this.materials.fire, [0, 0.1, -0.36]);

    group.add(bamboo, warning);
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  createLowBannerObstacle(): THREE.Group {
    const group = new THREE.Group();
    group.name = "obs_low_banner_fallback";

    const leftPost = this.mesh(new THREE.BoxGeometry(0.12, 1.9, 0.12), this.materials.wood, [-0.7, 0.95, 0]);
    const rightPost = this.mesh(new THREE.BoxGeometry(0.12, 1.9, 0.12), this.materials.wood, [0.7, 0.95, 0]);
    const banner = this.mesh(new THREE.BoxGeometry(1.5, 0.42, 0.08), this.materials.torii, [0, 1.35, 0]);
    const trim = this.mesh(new THREE.BoxGeometry(1.6, 0.08, 0.1), this.materials.gold, [0, 1.12, -0.02]);

    group.add(leftPost, rightPost, banner, trim);
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });

    return group;
  }

  createStoneBarrierObstacle(): THREE.Group {
    const group = new THREE.Group();
    group.name = "obs_stone_barrier_fallback";

    const base = this.mesh(new THREE.BoxGeometry(1.25, 0.8, 0.72), this.materials.stone, [0, 0.4, 0]);
    const cap = this.mesh(new THREE.BoxGeometry(1.42, 0.18, 0.84), this.materials.darkMetal, [0, 0.9, 0]);
    const warning = this.mesh(new THREE.BoxGeometry(1.18, 0.08, 0.08), this.materials.fire, [0, 0.82, -0.39]);

    group.add(base, cap, warning);
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  /**
   * Builds a clean, coherent low-poly car body: one main volume + sloped hood and
   * deck + a connected glass greenhouse (raked screens, pillars, narrower roof) +
   * wheels tucked into the body. Per-car character is added by the caller as a few
   * RESTRAINED, attached accents — never floating detail boxes. Front faces +Z.
   */
  private buildCar(spec: {
    name: string;
    body: THREE.Material;
    lower?: THREE.Material;
    glass?: THREE.Material;
    roofMat?: THREE.Material;
    headlight?: THREE.Material;
    tail?: THREE.Material;
    length?: number;
    width?: number;
    ride?: number;
    bodyH?: number;
    roof?: boolean;
    cabinLen?: number;
    cabinH?: number;
    cabinZ?: number;
    cabinW?: number;
    wheelR?: number;
    wheelW?: number;
    trackX?: number;
    axle?: number;
    rake?: number;
  }): THREE.Group {
    const g = new THREE.Group();
    g.name = spec.name;

    const body = spec.body;
    const lower = spec.lower ?? this.materials.darkTrim;
    const glass = spec.glass ?? this.materials.glass;
    const roofMat = spec.roofMat ?? body;
    const head = spec.headlight ?? this.materials.headlight;
    const tail = spec.tail ?? this.materials.tailLight;
    const L = spec.length ?? 2.5;
    const W = spec.width ?? 1.5;
    const ride = spec.ride ?? 0.4;
    const bodyH = spec.bodyH ?? 0.34;
    const wheelR = spec.wheelR ?? 0.22;
    const wheelW = spec.wheelW ?? 0.18;
    const trackX = spec.trackX ?? W * 0.5 - 0.05;
    const axle = spec.axle ?? L * 0.33;
    const rake = spec.rake ?? 0.05;
    const halfL = L / 2;
    const topY = ride + bodyH * 0.5;

    // Main volume + defined shoulder + sloped hood / deck
    g.add(
      this.mesh(new THREE.BoxGeometry(W, bodyH, L), body, [0, ride, 0]),
      this.mesh(new THREE.BoxGeometry(W + 0.03, bodyH * 0.4, L - 0.2), body, [0, topY + bodyH * 0.18, 0])
    );
    const hood = this.mesh(new THREE.BoxGeometry(W - 0.16, bodyH * 0.46, L * 0.32), body, [0, topY + bodyH * 0.12, halfL - L * 0.2]);
    hood.rotation.x = -rake;
    const deck = this.mesh(new THREE.BoxGeometry(W - 0.12, bodyH * 0.5, L * 0.28), body, [0, topY + bodyH * 0.14, -halfL + L * 0.17]);
    deck.rotation.x = rake * 0.5;
    g.add(hood, deck);

    // Bumpers + lights
    const frontZ = halfL - 0.03;
    const rearZ = -halfL + 0.03;
    g.add(
      this.mesh(new THREE.BoxGeometry(W - 0.04, 0.16, 0.14), lower, [0, ride - bodyH * 0.08, frontZ - 0.03]),
      this.mesh(new THREE.BoxGeometry(W - 0.06, 0.16, 0.14), lower, [0, ride - bodyH * 0.08, rearZ + 0.03]),
      this.mesh(new THREE.BoxGeometry(0.28, 0.1, 0.05), head, [-W * 0.3, topY, frontZ]),
      this.mesh(new THREE.BoxGeometry(0.28, 0.1, 0.05), head, [W * 0.3, topY, frontZ]),
      this.mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), tail, [-W * 0.3, topY, rearZ]),
      this.mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), tail, [W * 0.3, topY, rearZ])
    );

    // Connected glass greenhouse: glass cabin, narrower body-colour roof, raked
    // screens, corner pillars that physically tie the roof to the body.
    if (spec.roof !== false) {
      const cabinLen = spec.cabinLen ?? L * 0.42;
      const cabinH = spec.cabinH ?? 0.4;
      const cabinZ = spec.cabinZ ?? -0.05;
      const cabinW = spec.cabinW ?? W - 0.36;
      const gy = topY + bodyH * 0.18 + cabinH * 0.5;
      const cabin = this.mesh(new THREE.BoxGeometry(cabinW, cabinH, cabinLen), glass, [0, gy, cabinZ]);
      const roof = this.mesh(new THREE.BoxGeometry(cabinW + 0.05, 0.08, cabinLen * 0.66), roofMat, [0, gy + cabinH * 0.5, cabinZ - cabinLen * 0.06]);
      const windshield = this.mesh(new THREE.BoxGeometry(cabinW - 0.02, cabinH * 0.94, 0.14), glass, [0, gy, cabinZ + cabinLen * 0.5]);
      windshield.rotation.x = -0.36;
      const rearGlass = this.mesh(new THREE.BoxGeometry(cabinW - 0.02, cabinH * 0.86, 0.14), glass, [0, gy, cabinZ - cabinLen * 0.5]);
      rearGlass.rotation.x = 0.42;
      g.add(cabin, roof, windshield, rearGlass);
      for (const sx of [-1, 1]) {
        const aPillar = this.mesh(new THREE.BoxGeometry(0.06, cabinH * 1.04, 0.07), roofMat, [sx * (cabinW * 0.5 - 0.01), gy, cabinZ + cabinLen * 0.44]);
        aPillar.rotation.x = -0.36;
        const cPillar = this.mesh(new THREE.BoxGeometry(0.06, cabinH * 1.02, 0.07), roofMat, [sx * (cabinW * 0.5 - 0.01), gy, cabinZ - cabinLen * 0.44]);
        cPillar.rotation.x = 0.42;
        g.add(aPillar, cPillar);
      }
    }

    // Per-side rockers + wheels tucked under the body
    for (const sx of [-1, 1]) {
      g.add(
        this.mesh(new THREE.BoxGeometry(0.08, 0.12, L * 0.72), lower, [sx * (W * 0.5 - 0.01), ride - bodyH * 0.28, 0]),
        this.createWheel([sx * trackX, wheelR, axle], wheelR, wheelW, wheelR * 0.5),
        this.createWheel([sx * trackX, wheelR, -axle], wheelR, wheelW, wheelR * 0.5)
      );
      if (spec.roof !== false) {
        const cz = (spec.cabinZ ?? -0.05) + (spec.cabinLen ?? L * 0.42) * 0.5 + 0.08;
        g.add(this.mesh(new THREE.BoxGeometry(0.11, 0.07, 0.1), lower, [sx * (W * 0.5 + 0.02), topY + bodyH * 0.2, cz]));
      }
    }

    return g;
  }

  private createWheel(
    position: [number, number, number],
    radius = 0.22,
    width = 0.18,
    rimRadius = 0.11
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.set(...position);

    const tire = this.mesh(new THREE.CylinderGeometry(radius, radius, width, 14), this.materials.tire, [0, 0, 0]);
    tire.rotation.z = Math.PI * 0.5;
    // Dished rim face slightly outboard of the tire on each side
    const rimFace = this.mesh(new THREE.CylinderGeometry(rimRadius, rimRadius, width * 0.6, 8), this.materials.rim, [0, 0, 0]);
    rimFace.rotation.z = Math.PI * 0.5;
    const hub = this.mesh(new THREE.CylinderGeometry(rimRadius * 0.32, rimRadius * 0.32, width + 0.04, 6), this.materials.steelTrim, [0, 0, 0]);
    hub.rotation.z = Math.PI * 0.5;
    group.add(tire, rimFace, hub);

    // Faceted low-poly spokes (one set, mirrored to both faces by the wide hub read)
    const spokeCount = 5;
    const spokeLen = rimRadius * 0.82;
    for (let i = 0; i < spokeCount; i += 1) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const spoke = this.mesh(
        new THREE.BoxGeometry(width * 0.66, spokeLen, 0.025),
        this.materials.rim,
        [0, Math.sin(angle) * spokeLen * 0.5, Math.cos(angle) * spokeLen * 0.5]
      );
      spoke.rotation.x = angle;
      group.add(spoke);
    }

    return group;
  }

  private enableShadows(group: THREE.Object3D): void {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  private addFrontLatticePanel(
    group: THREE.Group,
    center: [number, number, number],
    size: [number, number],
    panelMaterial: THREE.Material,
    frameMaterial: THREE.Material,
    verticalBars: number,
    horizontalBars: number
  ): void {
    const [x, y, z] = center;
    const [width, height] = size;
    const frame = 0.055;
    const depth = 0.065;
    const frontZ = z + 0.028;

    group.add(
      this.mesh(new THREE.BoxGeometry(width, height, 0.035), panelMaterial, [x, y, z]),
      this.mesh(new THREE.BoxGeometry(width + frame, frame, depth), frameMaterial, [x, y + height * 0.5, frontZ]),
      this.mesh(new THREE.BoxGeometry(width + frame, frame, depth), frameMaterial, [x, y - height * 0.5, frontZ]),
      this.mesh(new THREE.BoxGeometry(frame, height + frame, depth), frameMaterial, [x - width * 0.5, y, frontZ]),
      this.mesh(new THREE.BoxGeometry(frame, height + frame, depth), frameMaterial, [x + width * 0.5, y, frontZ])
    );

    for (let index = 1; index <= verticalBars; index += 1) {
      const barX = x - width * 0.5 + (width * index) / (verticalBars + 1);
      group.add(this.mesh(new THREE.BoxGeometry(frame * 0.7, height, depth + 0.01), frameMaterial, [barX, y, frontZ]));
    }

    for (let index = 1; index <= horizontalBars; index += 1) {
      const barY = y - height * 0.5 + (height * index) / (horizontalBars + 1);
      group.add(this.mesh(new THREE.BoxGeometry(width, frame * 0.7, depth + 0.01), frameMaterial, [x, barY, frontZ]));
    }
  }

  private createHangingLantern(position: [number, number, number], scale: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(...position);

    group.add(
      this.mesh(new THREE.BoxGeometry(0.025 * scale, 0.18 * scale, 0.025 * scale), this.materials.darkWood, [
        0,
        0.22 * scale,
        0
      ]),
      this.mesh(new THREE.CylinderGeometry(0.12 * scale, 0.14 * scale, 0.28 * scale, 8), this.materials.lanternPaper, [
        0,
        0,
        0
      ]),
      this.mesh(new THREE.BoxGeometry(0.22 * scale, 0.04 * scale, 0.22 * scale), this.materials.darkWood, [
        0,
        0.16 * scale,
        0
      ]),
      this.mesh(new THREE.BoxGeometry(0.18 * scale, 0.04 * scale, 0.18 * scale), this.materials.darkWood, [
        0,
        -0.16 * scale,
        0
      ])
    );

    return group;
  }

  private createGableRoof(
    width: number,
    depth: number,
    height: number,
    baseY: number,
    material: THREE.Material
  ): THREE.Mesh {
    return this.mesh(this.createRoofGeometry(width, depth, height, 1), material, [0, baseY, 0]);
  }

  private createHippedRoof(
    width: number,
    depth: number,
    height: number,
    baseY: number,
    material: THREE.Material,
    positionZ: number,
    ridgeWidthRatio: number
  ): THREE.Mesh {
    return this.mesh(this.createRoofGeometry(width, depth, height, ridgeWidthRatio), material, [0, baseY, positionZ]);
  }

  private createRoofGeometry(width: number, depth: number, height: number, ridgeWidthRatio: number): THREE.BufferGeometry {
    const halfW = width * 0.5;
    const halfD = depth * 0.5;
    const ridgeHalfW = halfW * ridgeWidthRatio;
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          -halfW,
          0,
          -halfD,
          halfW,
          0,
          -halfD,
          -halfW,
          0,
          halfD,
          halfW,
          0,
          halfD,
          -ridgeHalfW,
          height,
          0,
          ridgeHalfW,
          height,
          0
        ],
        3
      )
    );
    geometry.setIndex([0, 5, 1, 0, 4, 5, 2, 3, 5, 2, 5, 4, 0, 2, 4, 1, 5, 3, 0, 3, 2, 0, 1, 3]);
    geometry.computeVertexNormals();

    return geometry;
  }

  // ===== 電脳都市 Neon Cyber-City props (procedural, agent-authored + reviewed) =====
  createCyberSlabTower(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_cyber_slab_tower";

    const width = 5.5;
    const depth = 5.5;
    const height = 22;
    const halfW = width * 0.5;
    const frontZ = depth * 0.5;

    // Core slab: sheer dark curtain-wall mass rising far above the houses.
    group.add(
      this.mesh(new THREE.BoxGeometry(width, height, depth), this.materials.towerDark, [0, height * 0.5, 0]),
      // Slightly recessed darker glass spine on the sides to break the flat mass.
      this.mesh(new THREE.BoxGeometry(width + 0.08, height - 1.4, 0.6), this.materials.darkGlass, [0, height * 0.5, -frontZ + 0.28]),
      // Ground plinth / lobby band.
      this.mesh(new THREE.BoxGeometry(width + 0.6, 1.0, depth + 0.6), this.materials.towerSteel, [0, 0.5, 0]),
      this.mesh(new THREE.BoxGeometry(width + 0.2, 0.7, 0.16), this.materials.litWindowCool, [0, 0.55, frontZ + 0.22])
    );

    // Vertical structural mullions running the full height on the front corners.
    for (const x of [-halfW + 0.18, halfW - 0.18]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.32, height - 0.6, 0.3), this.materials.towerSteel, [x, (height - 0.6) * 0.5 + 0.3, frontZ + 0.02]));
    }
    // Inner brushedSteel mullions framing the window matrix.
    for (const x of [-1.45, 0, 1.45]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.16, height - 3.2, 0.22), this.materials.brushedSteel, [x, (height - 3.2) * 0.5 + 1.6, frontZ + 0.06]));
    }

    // Dense regular GRID of small lit-window boxes on the +Z face.
    // 4 columns across the inset face, stacked floors up the tower.
    const colX = [-2.0, -0.68, 0.68, 2.0];
    const floors = 15;
    const floorBaseY = 2.0;
    const floorStep = 1.18;
    const winW = 0.92;
    const winH = 0.78;
    const winZ = frontZ + 0.04;

    for (let f = 0; f < floors; f += 1) {
      const y = floorBaseY + f * floorStep;
      // Thin brushedSteel spandrel band between floors for the grid read.
      group.add(this.mesh(new THREE.BoxGeometry(width - 0.7, 0.12, 0.16), this.materials.brushedSteel, [0, y + floorStep * 0.5, frontZ + 0.05]));
      for (let c = 0; c < colX.length; c += 1) {
        const r = Math.random();
        // ~15% dark windows, otherwise alternate warm / cool by a checker pattern.
        let winMat: THREE.Material;
        if (r < 0.15) {
          winMat = this.materials.towerDark;
        } else {
          winMat = (f + c) % 2 === 0 ? this.materials.litWindowWarm : this.materials.litWindowCool;
        }
        group.add(this.mesh(new THREE.BoxGeometry(winW, winH, 0.05), winMat, [colX[c], y, winZ]));
      }
    }

    // Two emissive lattice accent panels (lobby double-height + a sky-lounge strip)
    // built from the shared helper so the grid reads as a glowing matrix wall.
    this.addFrontLatticePanel(group, [0, 2.5, frontZ + 0.02], [width - 0.8, 1.7], this.materials.litWindowCool, this.materials.brushedSteel, 5, 2);
    this.addFrontLatticePanel(group, [0, height - 2.6, frontZ + 0.02], [width - 0.8, 1.5], this.materials.litWindowWarm, this.materials.brushedSteel, 5, 2);

    // Rooftop crown: stepped cap plus a thin neonCyan ribbon outlining the crown.
    const crownY = height + 0.18;
    group.add(
      this.mesh(new THREE.BoxGeometry(width + 0.3, 0.36, depth + 0.3), this.materials.towerSteel, [0, height + 0.18, 0]),
      this.mesh(new THREE.BoxGeometry(width - 1.0, 0.9, depth - 1.0), this.materials.towerDark, [0, height + 0.7, 0])
    );
    // neonCyan ribbon: four edges of the crown.
    const ribbonY = crownY + 0.16;
    group.add(
      this.mesh(new THREE.BoxGeometry(width + 0.34, 0.1, 0.1), this.materials.neonCyan, [0, ribbonY, frontZ + 0.16]),
      this.mesh(new THREE.BoxGeometry(width + 0.34, 0.1, 0.1), this.materials.neonCyan, [0, ribbonY, -frontZ - 0.16]),
      this.mesh(new THREE.BoxGeometry(0.1, 0.1, depth + 0.34), this.materials.neonCyan, [halfW + 0.16, ribbonY, 0]),
      this.mesh(new THREE.BoxGeometry(0.1, 0.1, depth + 0.34), this.materials.neonCyan, [-halfW - 0.16, ribbonY, 0])
    );

    // Antenna mast and two red towerBeacon dots at the very top.
    group.add(this.mesh(new THREE.CylinderGeometry(0.07, 0.12, 2.2, 6), this.materials.brushedSteel, [0, height + 2.2, 0]));
    group.add(
      this.mesh(new THREE.IcosahedronGeometry(0.16, 0), this.materials.towerBeacon, [0, height + 3.3, 0]),
      this.mesh(new THREE.IcosahedronGeometry(0.12, 0), this.materials.towerBeacon, [0, height + 1.5, 0])
    );

    return group;
  }

  createCyberSetbackTower(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_cyber_setback_tower";

    // ---- Three stacked towerSteel volumes (ziggurat setback) ----
    // Tier 1: wide podium  | Tier 2: mid block | Tier 3: slim crown
    const t1w = 6.0, t1d = 6.0, t1h = 8.0;   // podium      y: 0    -> 8
    const t2w = 4.4, t2d = 4.4, t2h = 6.0;   // mid block   y: 8    -> 14
    const t3w = 2.8, t3d = 2.8, t3h = 4.4;   // crown       y: 14   -> 18.4
    const t1y = t1h * 0.5;
    const t2y = t1h + t2h * 0.5;
    const t3y = t1h + t2h + t3h * 0.5;

    group.add(
      this.mesh(new THREE.BoxGeometry(t1w, t1h, t1d), this.materials.towerSteel, [0, t1y, 0]),
      this.mesh(new THREE.BoxGeometry(t2w, t2h, t2d), this.materials.towerSteel, [0, t2y, 0]),
      this.mesh(new THREE.BoxGeometry(t3w, t3h, t3d), this.materials.towerSteel, [0, t3y, 0])
    );

    // Dark recessed shadow-gap collars under each setback (reads the step)
    group.add(
      this.mesh(new THREE.BoxGeometry(t1w * 0.97, 0.22, t1d * 0.97), this.materials.towerDark, [0, t1h - 0.11, 0]),
      this.mesh(new THREE.BoxGeometry(t2w * 0.96, 0.2, t2d * 0.96), this.materials.towerDark, [0, t1h + t2h - 0.1, 0])
    );

    // ---- Neon light-lines tracing every setback edge ----
    // Helper inline: a thin glowing rim ring around the top of a tier on all four sides.
    const neonRim = (w: number, d: number, y: number, mat: THREE.Material) => {
      const t = 0.1;
      group.add(
        this.mesh(new THREE.BoxGeometry(w + 0.06, t, t), mat, [0, y, d * 0.5 + 0.03]),
        this.mesh(new THREE.BoxGeometry(w + 0.06, t, t), mat, [0, y, -d * 0.5 - 0.03]),
        this.mesh(new THREE.BoxGeometry(t, t, d + 0.06), mat, [w * 0.5 + 0.03, y, 0]),
        this.mesh(new THREE.BoxGeometry(t, t, d + 0.06), mat, [-w * 0.5 - 0.03, y, 0])
      );
    };
    // Podium top edge — magenta; the top ledge each tier sits back from — blue.
    neonRim(t1w, t1d, t1h - 0.02, this.materials.neonMagenta);     // podium roofline
    neonRim(t2w, t2d, t1h + 0.04, this.materials.neonBlue);         // mid base setback
    neonRim(t2w, t2d, t1h + t2h - 0.02, this.materials.neonMagenta); // mid roofline
    neonRim(t3w, t3d, t1h + t2h + 0.04, this.materials.neonBlue);   // crown base setback
    neonRim(t3w, t3d, t1h + t2h + t3h - 0.02, this.materials.neonMagenta); // crown roofline

    // ---- litWindowCool window grids wrapping the +Z face of each tier ----
    this.addFrontLatticePanel(group, [0, 4.0, t1d * 0.5 + 0.02], [4.8, 6.4], this.materials.litWindowCool, this.materials.brushedSteel, 5, 6);
    this.addFrontLatticePanel(group, [0, 11.0, t2d * 0.5 + 0.02], [3.4, 4.6], this.materials.litWindowCool, this.materials.brushedSteel, 4, 4);
    this.addFrontLatticePanel(group, [0, 16.2, t3d * 0.5 + 0.02], [2.0, 3.2], this.materials.litWindowCool, this.materials.brushedSteel, 3, 3);

    // Side-face window slivers on the podium for depth (cool glow on +X / -X)
    group.add(
      this.mesh(new THREE.BoxGeometry(0.04, 5.8, 0.5), this.materials.litWindowCool, [t1w * 0.5 + 0.01, 4.0, 1.4]),
      this.mesh(new THREE.BoxGeometry(0.04, 5.8, 0.5), this.materials.litWindowCool, [t1w * 0.5 + 0.01, 4.0, -1.4]),
      this.mesh(new THREE.BoxGeometry(0.04, 5.8, 0.5), this.materials.litWindowCool, [-t1w * 0.5 - 0.01, 4.0, 1.4]),
      this.mesh(new THREE.BoxGeometry(0.04, 5.8, 0.5), this.materials.litWindowCool, [-t1w * 0.5 - 0.01, 4.0, -1.4])
    );

    // ---- Vertical neonPurple spine running the full height on the +Z face ----
    // Recessed steel channel + the glowing purple strip inside it.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.5, 18.4, 0.12), this.materials.towerDark, [0, 9.2, t1d * 0.5 + 0.06]),
      this.mesh(new THREE.BoxGeometry(0.18, 18.0, 0.14), this.materials.neonPurple, [0, 9.0, t1d * 0.5 + 0.11])
    );
    // The spine breaks forward as the tower steps back, hugging mid + crown faces too.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.18, 6.0, 0.14), this.materials.neonPurple, [0, 11.0, t2d * 0.5 + 0.1]),
      this.mesh(new THREE.BoxGeometry(0.18, 4.4, 0.14), this.materials.neonPurple, [0, 16.2, t3d * 0.5 + 0.1])
    );

    // ---- Crown rooftop machinery + antenna mast + amber beacon ----
    const crownTop = t1h + t2h + t3h; // 18.4
    group.add(
      // rooftop service block
      this.mesh(new THREE.BoxGeometry(1.6, 0.5, 1.6), this.materials.towerDark, [0, crownTop + 0.25, 0]),
      this.mesh(new THREE.BoxGeometry(0.7, 0.35, 0.7), this.materials.brushedSteel, [0.4, crownTop + 0.65, 0.3]),
      // antenna mast
      this.mesh(new THREE.CylinderGeometry(0.06, 0.1, 2.4, 8), this.materials.brushedSteel, [0, crownTop + 1.7, 0]),
      // mast guy struts
      this.mesh(new THREE.BoxGeometry(0.04, 0.04, 1.0), this.materials.brushedSteel, [0, crownTop + 1.1, 0.0]),
      // amber beacon at the very top
      this.mesh(new THREE.IcosahedronGeometry(0.18, 0), this.materials.neonAmber, [0, crownTop + 3.0, 0]),
      this.mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), this.materials.towerBeacon, [0, crownTop + 3.0, 0])
    );
    // Secondary shorter mast + amber pip for an industrial rooftop silhouette
    group.add(
      this.mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.2, 6), this.materials.brushedSteel, [-0.5, crownTop + 1.0, -0.3]),
      this.mesh(new THREE.IcosahedronGeometry(0.1, 0), this.materials.neonAmber, [-0.5, crownTop + 1.7, -0.3])
    );

    // Non-shadow-casting hero tower — intentionally no enableShadows().
    return group;
  }

  createCyberCapsuleTower(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_cyber_capsule_tower";

    // --- Central service core (the slim towerDark shaft the capsules cling to) ---
    const coreH = 15.4;
    const coreW = 1.5;
    group.add(
      // main core stud
      this.mesh(new THREE.BoxGeometry(coreW, coreH, coreW), this.materials.towerDark, [0, coreH * 0.5, 0]),
      // recessed cyberConcrete spine band on the front/back for shaft texture
      this.mesh(new THREE.BoxGeometry(coreW + 0.08, coreH * 0.96, 0.5), this.materials.cyberConcrete, [
        0,
        coreH * 0.5,
        0
      ]),
      // squat plinth / lobby block
      this.mesh(new THREE.BoxGeometry(2.4, 1.0, 2.4), this.materials.cyberConcrete, [0, 0.5, 0]),
      this.mesh(new THREE.BoxGeometry(2.7, 0.18, 2.7), this.materials.towerDark, [0, 1.02, 0]),
      // rooftop mechanical cap + slim mast + beacon
      this.mesh(new THREE.BoxGeometry(1.7, 0.5, 1.7), this.materials.towerDark, [0, coreH + 0.25, 0]),
      this.mesh(new THREE.BoxGeometry(0.9, 0.34, 0.9), this.materials.brushedSteel, [0, coreH + 0.62, 0]),
      this.mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.3, 6), this.materials.brushedSteel, [0.4, coreH + 1.4, 0.4]),
      this.mesh(new THREE.IcosahedronGeometry(0.12, 0), this.materials.neonGreen, [0.4, coreH + 2.1, 0.4])
    );

    // --- Plug-in capsules clustered up the shaft in an irregular checker ---
    // Each capsule is a small cube box with one litWindowWarm porthole on its outward face.
    // Capsules hang off all four faces of the core; a handful are tinted neonGreen.
    const capW = 1.15; // capsule body width
    const capH = 0.9; // capsule body height
    const cap = coreW * 0.5; // shaft half-width (mount line)
    const reach = cap + capW * 0.5 - 0.12; // how far the cube protrudes from the core
    const portOff = capW * 0.5 + 0.04; // porthole sits just proud of the body's outer face

    // [level (0..15), face (0=+Z front, 1=+X right, 2=-Z back, 3=-X left), neonTint]
    const capsules: Array<[number, number, boolean]> = [
      [0, 0, false],
      [1, 3, true],
      [2, 1, false],
      [3, 2, false],
      [4, 0, true],
      [5, 3, false],
      [6, 1, false],
      [7, 0, true],
      [8, 2, false],
      [9, 3, false],
      [10, 1, true],
      [11, 0, false],
      [12, 2, false],
      [13, 3, true],
      [14, 1, false],
      [14, 0, false]
    ];

    for (const [level, face, neon] of capsules) {
      // irregular vertical spacing + small jitter for the quirky bumpy profile
      const y = 1.4 + level * 0.92 + (Math.random() - 0.5) * 0.18;
      const jx = (Math.random() - 0.5) * 0.1;
      const bodyMat = neon ? this.materials.neonGreen : this.materials.towerDark;

      // mount the capsule body depending on which face it plugs into
      let bx = 0;
      let bz = 0;
      let rotY = 0;
      if (face === 0) {
        bz = reach;
        rotY = 0;
      } else if (face === 1) {
        bx = reach;
        rotY = Math.PI * 0.5;
      } else if (face === 2) {
        bz = -reach;
        rotY = Math.PI;
      } else {
        bx = -reach;
        rotY = -Math.PI * 0.5;
      }

      // capsule body
      const body = this.mesh(new THREE.BoxGeometry(capW, capH, capW), bodyMat, [bx + jx, y, bz]);
      body.rotation.y = rotY;
      group.add(body);

      // outward-facing porthole: derive the outward axis from the face
      const ox = face === 1 ? 1 : face === 3 ? -1 : 0;
      const oz = face === 0 ? 1 : face === 2 ? -1 : 0;
      const portX = bx + jx + ox * portOff;
      const portZ = bz + oz * portOff;

      // brushedSteel trim ring framing the porthole
      const trim = this.mesh(new THREE.BoxGeometry(0.78, 0.66, 0.06), this.materials.brushedSteel, [portX, y, portZ]);
      trim.rotation.y = rotY;
      // round porthole window — emissive warm light glowing out of the capsule face
      const win = this.mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.05, 8),
        this.materials.litWindowWarm,
        [portX, y, portZ]
      );
      // orient the disc so its flat face points outward along the capsule's facing axis
      if (face === 0 || face === 2) {
        win.rotation.x = Math.PI * 0.5;
      } else {
        win.rotation.z = Math.PI * 0.5;
      }
      group.add(trim, win);
    }

    // --- neonGreen accent stripe stepping up one corner of the shaft ---
    const stripeCorner = coreW * 0.5 + 0.02;
    for (let s = 0; s < 13; s += 1) {
      const sy = 1.6 + s * 1.06;
      // alternate the stripe segment between the front and the right face at each step,
      // so it visibly "steps" up the +X / +Z corner
      const onFront = s % 2 === 0;
      if (onFront) {
        group.add(
          this.mesh(new THREE.BoxGeometry(0.16, 0.95, 0.06), this.materials.neonGreen, [stripeCorner, sy, stripeCorner])
        );
      } else {
        group.add(
          this.mesh(new THREE.BoxGeometry(0.06, 0.95, 0.16), this.materials.neonGreen, [stripeCorner, sy, stripeCorner])
        );
      }
    }
    // little horizontal neon tie-backs linking the stepped stripe to the core
    group.add(
      this.mesh(new THREE.BoxGeometry(0.22, 0.07, 0.07), this.materials.neonGreen, [stripeCorner, 1.6, stripeCorner]),
      this.mesh(new THREE.BoxGeometry(0.22, 0.07, 0.07), this.materials.neonGreen, [stripeCorner, 8.3, stripeCorner]),
      this.mesh(new THREE.BoxGeometry(0.22, 0.07, 0.07), this.materials.neonGreen, [stripeCorner, 13.9, stripeCorner])
    );

    // Tall building: deliberately NOT calling enableShadows.
    return group;
  }

  createCyberOfficeMidrise(): THREE.Group {
  const group = new THREE.Group();
  group.name = "deco_cyber_office_midrise";

  const width = 5;
  const depth = 5;
  const bodyHeight = 10.4;
  const bodyCenterY = bodyHeight * 0.5;

  // Soft litWindowCool glow core — sits just inside the glass so the whole
  // block reads as a softly lit office interior behind the curtain wall.
  group.add(
    this.mesh(new THREE.BoxGeometry(width - 0.5, bodyHeight - 0.5, depth - 0.5), this.materials.litWindowCool, [
      0,
      bodyCenterY,
      0
    ])
  );

  // tealGlass curtain-wall block wrapping the glow core.
  group.add(
    this.mesh(new THREE.BoxGeometry(width, bodyHeight, depth), this.materials.tealGlass, [0, bodyCenterY, 0])
  );

  // Slim towerSteel structural corner mullions — give the glass block edges.
  const cornerX = width * 0.5 - 0.07;
  const cornerZ = depth * 0.5 - 0.07;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      group.add(
        this.mesh(new THREE.BoxGeometry(0.16, bodyHeight, 0.16), this.materials.towerSteel, [
          sx * cornerX,
          bodyCenterY,
          sz * cornerZ
        ])
      );
    }
  }

  // brushedSteel horizontal floor-band lines — one per storey, wrapping all
  // four faces so the spandrels catch light between the glazing.
  const floors = 7;
  const bandThickness = 0.16;
  const bandDepth = 0.09;
  for (let floor = 1; floor < floors; floor += 1) {
    const bandY = (bodyHeight * floor) / floors;
    group.add(
      this.mesh(new THREE.BoxGeometry(width + 0.05, bandThickness, bandDepth), this.materials.brushedSteel, [
        0,
        bandY,
        depth * 0.5 + 0.005
      ]),
      this.mesh(new THREE.BoxGeometry(width + 0.05, bandThickness, bandDepth), this.materials.brushedSteel, [
        0,
        bandY,
        -depth * 0.5 - 0.005
      ]),
      this.mesh(new THREE.BoxGeometry(bandDepth, bandThickness, depth + 0.05), this.materials.brushedSteel, [
        width * 0.5 + 0.005,
        bandY,
        0
      ]),
      this.mesh(new THREE.BoxGeometry(bandDepth, bandThickness, depth + 0.05), this.materials.brushedSteel, [
        -width * 0.5 - 0.005,
        bandY,
        0
      ])
    );
  }

  // Vertical brushedSteel mullions on the front face — subdivide the glass
  // into a slick curtain-wall grid (paired with the floor bands).
  for (let bay = 1; bay <= 4; bay += 1) {
    const mullionX = -width * 0.5 + (width * bay) / 5;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.07, bodyHeight - 0.2, bandDepth), this.materials.brushedSteel, [
        mullionX,
        bodyCenterY,
        depth * 0.5 + 0.004
      ])
    );
  }

  // Base spandrel + ground-floor entrance band in towerSteel.
  group.add(
    this.mesh(new THREE.BoxGeometry(width + 0.12, 0.5, depth + 0.12), this.materials.towerSteel, [0, 0.25, 0])
  );

  // A single bright vertical neonPink edge accent running the full height on
  // the front-right corner — the signature glow that pops between hero towers.
  group.add(
    this.mesh(new THREE.BoxGeometry(0.1, bodyHeight - 0.3, 0.1), this.materials.neonPink, [
      width * 0.5 - 0.02,
      bodyCenterY,
      depth * 0.5 - 0.02
    ])
  );

  // Rooftop parapet — thin towerSteel lip around the roof edge.
  const roofY = bodyHeight;
  const parapetH = 0.34;
  const parapetY = roofY + parapetH * 0.5;
  group.add(
    this.mesh(new THREE.BoxGeometry(width + 0.1, parapetH, 0.16), this.materials.towerSteel, [
      0,
      parapetY,
      depth * 0.5 - 0.05
    ]),
    this.mesh(new THREE.BoxGeometry(width + 0.1, parapetH, 0.16), this.materials.towerSteel, [
      0,
      parapetY,
      -depth * 0.5 + 0.05
    ]),
    this.mesh(new THREE.BoxGeometry(0.16, parapetH, depth - 0.1), this.materials.towerSteel, [
      width * 0.5 - 0.05,
      parapetY,
      0
    ]),
    this.mesh(new THREE.BoxGeometry(0.16, parapetH, depth - 0.1), this.materials.towerSteel, [
      -width * 0.5 + 0.05,
      parapetY,
      0
    ]),
    // recessed roof deck
    this.mesh(new THREE.BoxGeometry(width - 0.3, 0.1, depth - 0.3), this.materials.towerSteel, [0, roofY + 0.05, 0])
  );

  // Rooftop cylindrical water tank on a short brushedSteel cradle (rear-left).
  const tankX = -1.1;
  const tankZ = -1.0;
  group.add(
    this.mesh(new THREE.BoxGeometry(1.0, 0.3, 1.0), this.materials.brushedSteel, [tankX, roofY + 0.2, tankZ]),
    this.mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.2, 10), this.materials.brushedSteel, [
      tankX,
      roofY + 0.95,
      tankZ
    ]),
    // domed cap
    this.mesh(new THREE.CylinderGeometry(0.2, 0.62, 0.28, 10), this.materials.towerSteel, [
      tankX,
      roofY + 1.69,
      tankZ
    ])
  );

  // Cluster of rooftop AC / mechanical unit boxes (front-right of the roof).
  group.add(
    this.mesh(new THREE.BoxGeometry(1.1, 0.55, 0.85), this.materials.towerSteel, [1.2, roofY + 0.28, 0.9]),
    this.mesh(new THREE.BoxGeometry(0.7, 0.4, 0.7), this.materials.brushedSteel, [1.3, roofY + 0.6, 1.4]),
    this.mesh(new THREE.BoxGeometry(0.55, 0.3, 0.55), this.materials.towerSteel, [0.4, roofY + 0.18, 1.5]),
    // vent fan caps on top of the big unit
    this.mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8), this.materials.brushedSteel, [0.95, roofY + 0.61, 0.75]),
    this.mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8), this.materials.brushedSteel, [1.45, roofY + 0.61, 0.75])
  );

  // Slim rooftop mast with a faint cool beacon — extends the neon accent skyward.
  group.add(
    this.mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), this.materials.brushedSteel, [
      width * 0.5 - 0.4,
      roofY + 0.55,
      depth * 0.5 - 0.4
    ]),
    this.mesh(new THREE.IcosahedronGeometry(0.13, 0), this.materials.neonPink, [
      width * 0.5 - 0.4,
      roofY + 1.18,
      depth * 0.5 - 0.4
    ])
  );

  // Tall buildings do not cast shadows — intentionally skip enableShadows.
  return group;
  }

  createNeonShophouse(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_neon_shophouse";

    const w = 4.2;
    const d = 3.0;
    const frontZ = d * 0.5;

    // --- Core concrete shell: stacked 3-storey block ---
    group.add(
      this.mesh(new THREE.BoxGeometry(w, 5.0, d), this.materials.cyberConcrete, [0, 2.5, 0]),
      // lighter cornice slabs between floors that catch the neon
      this.mesh(new THREE.BoxGeometry(w + 0.12, 0.18, d + 0.12), this.materials.cyberConcreteLight, [0, 2.0, 0]),
      this.mesh(new THREE.BoxGeometry(w + 0.12, 0.18, d + 0.12), this.materials.cyberConcreteLight, [0, 3.5, 0]),
      // flat parapet cap
      this.mesh(new THREE.BoxGeometry(w + 0.16, 0.22, d + 0.16), this.materials.cyberConcreteLight, [0, 4.96, 0])
    );

    // --- GROUND FLOOR SHOPFRONT: glowing teal glass with warm interior ---
    // warm interior glow plate sits just behind the glass
    group.add(
      this.mesh(new THREE.BoxGeometry(3.5, 1.5, 0.06), this.materials.litWindowWarm, [0, 0.95, frontZ - 0.18]),
      // big teal glass storefront pane in front of the warm glow
      this.mesh(new THREE.BoxGeometry(3.6, 1.62, 0.05), this.materials.tealGlass, [0, 0.96, frontZ + 0.02]),
      // brushed-steel shopfront frame (sill, lintel, mullions)
      this.mesh(new THREE.BoxGeometry(3.78, 0.12, 0.16), this.materials.brushedSteel, [0, 1.78, frontZ + 0.04]),
      this.mesh(new THREE.BoxGeometry(3.78, 0.16, 0.16), this.materials.brushedSteel, [0, 0.16, frontZ + 0.04]),
      this.mesh(new THREE.BoxGeometry(0.1, 1.62, 0.14), this.materials.brushedSteel, [-1.82, 0.96, frontZ + 0.04]),
      this.mesh(new THREE.BoxGeometry(0.1, 1.62, 0.14), this.materials.brushedSteel, [1.82, 0.96, frontZ + 0.04])
    );
    for (const mx of [-1.2, -0.4, 0.4, 1.2]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.07, 1.5, 0.12), this.materials.brushedSteel, [mx, 0.96, frontZ + 0.05]));
    }

    // --- DOORWAY: recessed dark entry with warm glow + neon doorframe ---
    group.add(
      this.mesh(new THREE.BoxGeometry(0.84, 1.7, 0.06), this.materials.litWindowWarm, [0, 0.85, frontZ - 0.1]),
      this.mesh(new THREE.BoxGeometry(0.96, 1.84, 0.06), this.materials.tealGlass, [0, 0.92, frontZ + 0.08]),
      // neon-cyan tube outline around the door
      this.mesh(new THREE.BoxGeometry(0.06, 1.86, 0.05), this.materials.neonCyan, [-0.52, 0.92, frontZ + 0.12]),
      this.mesh(new THREE.BoxGeometry(0.06, 1.86, 0.05), this.materials.neonCyan, [0.52, 0.92, frontZ + 0.12]),
      this.mesh(new THREE.BoxGeometry(1.1, 0.06, 0.05), this.materials.neonCyan, [0, 1.85, frontZ + 0.12])
    );

    // --- SIGN BAND: horizontally stacked coloured kanji plaques over the door ---
    // mounting rail
    group.add(this.mesh(new THREE.BoxGeometry(3.9, 0.1, 0.08), this.materials.brushedSteel, [0, 1.96, frontZ + 0.08]));
    const plaqueMats = [this.materials.kanjiRed, this.materials.neonCyan, this.materials.neonAmber, this.materials.neonMagenta];
    const plaqueX = [-1.5, -0.5, 0.5, 1.5];
    for (let i = 0; i < plaqueX.length; i += 1) {
      const px = plaqueX[i];
      const ph = 0.46 + Math.random() * 0.16;
      group.add(
        // dark backing board
        this.mesh(new THREE.BoxGeometry(0.86, ph + 0.08, 0.07), this.materials.towerDark, [px, 2.3, frontZ + 0.1]),
        // glowing kanji plaque face
        this.mesh(new THREE.BoxGeometry(0.74, ph, 0.05), plaqueMats[i], [px, 2.3, frontZ + 0.15])
      );
    }
    // vertical hanging kanji sign off the corner
    group.add(
      this.mesh(new THREE.BoxGeometry(0.34, 1.5, 0.08), this.materials.towerDark, [2.18, 2.6, frontZ - 0.2]),
      this.mesh(new THREE.BoxGeometry(0.24, 1.34, 0.05), this.materials.kanjiRed, [2.24, 2.6, frontZ - 0.18]),
      this.mesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), this.materials.brushedSteel, [2.0, 3.32, frontZ - 0.2])
    );

    // --- UPPER FLOOR WINDOWS: warm/cool lattice panels ---
    this.addFrontLatticePanel(group, [-1.25, 2.95, frontZ - 0.02], [0.92, 0.78], this.materials.litWindowWarm, this.materials.brushedSteel, 2, 1);
    this.addFrontLatticePanel(group, [1.25, 2.95, frontZ - 0.02], [0.92, 0.78], this.materials.tealGlass, this.materials.brushedSteel, 2, 1);
    this.addFrontLatticePanel(group, [-1.25, 4.2, frontZ - 0.02], [0.92, 0.7], this.materials.tealGlass, this.materials.brushedSteel, 2, 1);
    this.addFrontLatticePanel(group, [1.25, 4.2, frontZ - 0.02], [0.92, 0.7], this.materials.litWindowWarm, this.materials.brushedSteel, 2, 1);

    // --- STACKED BALCONIES with railing bars ---
    for (const by of [2.5, 3.75]) {
      // balcony floor slab cantilevered out front
      group.add(this.mesh(new THREE.BoxGeometry(2.9, 0.08, 0.5), this.materials.cyberConcreteLight, [-0.2, by, frontZ + 0.22]));
      // top rail
      group.add(this.mesh(new THREE.BoxGeometry(2.9, 0.06, 0.06), this.materials.brushedSteel, [-0.2, by + 0.42, frontZ + 0.44]));
      group.add(this.mesh(new THREE.BoxGeometry(0.06, 0.46, 0.06), this.materials.brushedSteel, [-1.62, by + 0.2, frontZ + 0.44]));
      group.add(this.mesh(new THREE.BoxGeometry(0.06, 0.46, 0.06), this.materials.brushedSteel, [1.22, by + 0.2, frontZ + 0.44]));
      // vertical railing balusters
      for (let i = 0; i < 9; i += 1) {
        const rx = -1.55 + i * 0.355;
        group.add(this.mesh(new THREE.BoxGeometry(0.035, 0.4, 0.035), this.materials.brushedSteel, [rx, by + 0.18, frontZ + 0.44]));
      }
    }

    // --- AC UNIT bolted to the side wall ---
    group.add(
      this.mesh(new THREE.BoxGeometry(0.14, 0.6, 0.5), this.materials.cyberConcreteLight, [w * 0.5 + 0.08, 2.7, 0.4]),
      this.mesh(new THREE.BoxGeometry(0.08, 0.46, 0.46), this.materials.brushedSteel, [w * 0.5 + 0.18, 2.7, 0.4]),
      // little drip pipe
      this.mesh(new THREE.BoxGeometry(0.05, 1.4, 0.05), this.materials.rustSteel, [w * 0.5 + 0.06, 1.9, 0.62])
    );

    // --- TANGLE OF NEON ACCENT TUBES (magenta + green thin boxes) ---
    // magenta tube running up the left edge, kinked
    group.add(
      this.mesh(new THREE.BoxGeometry(0.07, 2.2, 0.07), this.materials.neonMagenta, [-2.04, 2.0, frontZ + 0.02]),
      this.mesh(new THREE.BoxGeometry(0.07, 1.3, 0.07), this.materials.neonMagenta, [-2.04, 4.0, frontZ - 0.3]),
      this.mesh(new THREE.BoxGeometry(1.1, 0.07, 0.07), this.materials.neonMagenta, [-1.6, 1.92, frontZ + 0.18])
    );
    // green tube tracing the cornice and dropping down the right
    group.add(
      this.mesh(new THREE.BoxGeometry(w - 0.4, 0.07, 0.07), this.materials.neonGreen, [0, 3.46, frontZ + 0.06]),
      this.mesh(new THREE.BoxGeometry(0.07, 1.0, 0.07), this.materials.neonGreen, [1.96, 4.0, frontZ + 0.02]),
      this.mesh(new THREE.BoxGeometry(0.07, 0.9, 0.07), this.materials.neonGreen, [-1.96, 0.5, frontZ + 0.14])
    );
    // a couple of diagonal stray tubes for the "tangle" look
    const diag1 = this.mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), this.materials.neonMagenta, [0.9, 3.6, frontZ - 0.05]);
    diag1.rotation.z = 0.5;
    const diag2 = this.mesh(new THREE.BoxGeometry(0.06, 0.8, 0.06), this.materials.neonGreen, [-0.7, 3.7, frontZ - 0.08]);
    diag2.rotation.z = -0.7;
    group.add(diag1, diag2);

    // --- under-sign neon spill bar (cyan) just above shopfront ---
    group.add(this.mesh(new THREE.BoxGeometry(3.5, 0.05, 0.05), this.materials.neonCyan, [0, 1.7, frontZ + 0.1]));

    this.enableShadows(group);
    return group;
  }

  createPachinkoFacade(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_pachinko_facade";

    const width = 5.5;
    const height = 6;
    const depth = 3.2;
    const frontZ = depth * 0.5;

    // ---- Main dark slab (the canvas everything glows against) ----
    group.add(
      this.mesh(new THREE.BoxGeometry(width, height, depth), this.materials.towerDark, [0, height * 0.5, 0]),
      // recessed crown lip
      this.mesh(new THREE.BoxGeometry(width + 0.3, 0.32, depth + 0.3), this.materials.towerDark, [0, height - 0.16, 0])
    );

    // ---- Full-height vertical light columns: alternating magenta / cyan / gold ----
    const columnMats = [this.materials.neonMagenta, this.materials.neonCyan, this.materials.kanjiGold];
    const columnCount = 7;
    const columnGap = width / columnCount;
    const columnW = columnGap * 0.42;
    const columnLeft = -width * 0.5 + columnGap * 0.5;
    for (let i = 0; i < columnCount; i += 1) {
      const cx = columnLeft + i * columnGap;
      const mat = columnMats[i % columnMats.length];
      // glowing strip starts above the canopy, runs to crown
      group.add(this.mesh(new THREE.BoxGeometry(columnW, height - 2.1, 0.12), mat, [cx, 1.85 + (height - 2.1) * 0.5, frontZ + 0.02]));
      // thin dark divider sliver between columns for a louvered read
      group.add(this.mesh(new THREE.BoxGeometry(0.06, height - 2.1, 0.16), this.materials.towerDark, [cx + columnGap * 0.5, 1.85 + (height - 2.1) * 0.5, frontZ + 0.04]));
    }

    // ---- Giant glowing vertical sign column on the right edge ----
    const signX = width * 0.5 - 0.55;
    const signColZ = frontZ + 0.22;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.9, 4.6, 0.4), this.materials.towerDark, [signX, 3.0, frontZ + 0.16]),
      this.mesh(new THREE.BoxGeometry(0.66, 4.4, 0.12), this.materials.kanjiRed, [signX, 3.0, signColZ])
    );
    // stacked kanji-block glyphs down the sign column (alternating gold/cyan)
    const glyphMats = [this.materials.kanjiGold, this.materials.neonCyan, this.materials.kanjiGold, this.materials.neonAmber];
    for (let i = 0; i < 4; i += 1) {
      const gy = 4.7 - i * 1.02;
      group.add(this.mesh(new THREE.BoxGeometry(0.46, 0.46, 0.1), glyphMats[i], [signX, gy, signColZ + 0.06]));
    }

    // ---- Oversized horizontal marquee sign (kanjiRed) above the entrance ----
    const marqueeY = 3.05;
    const marqueeZ = frontZ + 0.14;
    group.add(
      this.mesh(new THREE.BoxGeometry(3.5, 1.1, 0.28), this.materials.brushedSteel, [-0.45, marqueeY, frontZ + 0.08]),
      this.mesh(new THREE.BoxGeometry(3.3, 0.92, 0.1), this.materials.kanjiRed, [-0.45, marqueeY, marqueeZ])
    );
    // glowing glyph plaques across the marquee
    const marqueeGlyphs = [this.materials.kanjiGold, this.materials.neonMagenta, this.materials.kanjiGold];
    for (let i = 0; i < 3; i += 1) {
      group.add(this.mesh(new THREE.BoxGeometry(0.66, 0.66, 0.08), marqueeGlyphs[i], [-1.45 + i * 1.0, marqueeY, marqueeZ + 0.06]));
    }

    // ---- Chasing-light dot border framing the marquee (rows of tiny emissive cubes) ----
    const dotMats = [this.materials.neonAmber, this.materials.kanjiGold, this.materials.neonMagenta, this.materials.neonCyan];
    const dot = 0.13;
    const mLeft = -0.45 - 1.75;
    const mRight = -0.45 + 1.75;
    const mTop = marqueeY + 0.62;
    const mBot = marqueeY - 0.62;
    let dotIndex = 0;
    const placeDot = (x: number, y: number) => {
      group.add(this.mesh(new THREE.BoxGeometry(dot, dot, dot), dotMats[dotIndex % dotMats.length], [x, y, marqueeZ + 0.04]));
      dotIndex += 1;
    };
    const hDots = 16;
    for (let i = 0; i <= hDots; i += 1) {
      const x = mLeft + (mRight - mLeft) * (i / hDots);
      placeDot(x, mTop);
      placeDot(x, mBot);
    }
    const vDots = 5;
    for (let i = 1; i < vDots; i += 1) {
      const y = mBot + (mTop - mBot) * (i / vDots);
      placeDot(mLeft, y);
      placeDot(mRight, y);
    }

    // ---- Over-illuminated entry canopy + entrance ----
    const entryX = -0.45;
    // recessed dark entrance well
    group.add(this.mesh(new THREE.BoxGeometry(2.4, 1.9, 0.2), this.materials.towerDark, [entryX, 0.95, frontZ + 0.01]));
    // bright warm-lit doorway glow
    group.add(this.mesh(new THREE.BoxGeometry(2.0, 1.7, 0.08), this.materials.litWindowWarm, [entryX, 0.92, frontZ + 0.06]));
    // door split pillar
    group.add(this.mesh(new THREE.BoxGeometry(0.12, 1.7, 0.1), this.materials.brushedSteel, [entryX, 0.92, frontZ + 0.1]));

    // canopy slab jutting toward the road, lit underside
    const canopyY = 2.05;
    const canopyZ = frontZ + 0.55;
    group.add(
      this.mesh(new THREE.BoxGeometry(2.9, 0.22, 1.1), this.materials.brushedSteel, [entryX, canopyY, canopyZ]),
      // glowing underside light box
      this.mesh(new THREE.BoxGeometry(2.6, 0.08, 0.9), this.materials.neonAmber, [entryX, canopyY - 0.13, canopyZ])
    );
    // canopy support struts
    group.add(
      this.mesh(new THREE.BoxGeometry(0.1, canopyY - 0.1, 0.1), this.materials.brushedSteel, [entryX - 1.25, (canopyY - 0.1) * 0.5 + 0.1, canopyZ + 0.45]),
      this.mesh(new THREE.BoxGeometry(0.1, canopyY - 0.1, 0.1), this.materials.brushedSteel, [entryX + 1.25, (canopyY - 0.1) * 0.5 + 0.1, canopyZ + 0.45])
    );
    // chasing dots ringing the canopy front edge
    const canopyDotMats = [this.materials.kanjiGold, this.materials.neonMagenta, this.materials.neonCyan];
    const cdCount = 12;
    for (let i = 0; i <= cdCount; i += 1) {
      const x = entryX - 1.4 + (2.8 * i) / cdCount;
      group.add(this.mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), canopyDotMats[i % canopyDotMats.length], [x, canopyY - 0.02, canopyZ + 0.56]));
    }

    // ---- Crown header band: full-width glowing top sign ----
    group.add(
      this.mesh(new THREE.BoxGeometry(width - 0.2, 0.62, 0.16), this.materials.towerDark, [0, height - 0.55, frontZ + 0.06]),
      this.mesh(new THREE.BoxGeometry(width - 0.5, 0.42, 0.08), this.materials.kanjiGold, [0, height - 0.55, frontZ + 0.12])
    );
    // crown kanji glyph row (magenta on gold)
    for (let i = 0; i < 6; i += 1) {
      group.add(this.mesh(new THREE.BoxGeometry(0.36, 0.36, 0.06), this.materials.neonMagenta, [-2.1 + i * 0.84, height - 0.55, frontZ + 0.17]));
    }

    // ---- Rooftop beacon poles ----
    group.add(
      this.mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6), this.materials.brushedSteel, [-2.2, height + 0.35, 0]),
      this.mesh(new THREE.IcosahedronGeometry(0.16, 0), this.materials.towerBeacon, [-2.2, height + 0.78, 0]),
      this.mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6), this.materials.brushedSteel, [2.2, height + 0.35, 0]),
      this.mesh(new THREE.IcosahedronGeometry(0.16, 0), this.materials.towerBeacon, [2.2, height + 0.78, 0])
    );

    // ---- A couple of small upper windows for human scale (warm) ----
    this.addFrontLatticePanel(group, [-2.2, 4.6, frontZ - 0.02], [0.7, 0.7], this.materials.litWindowWarm, this.materials.brushedSteel, 2, 2);
    this.addFrontLatticePanel(group, [-2.2, 5.4, frontZ - 0.02], [0.7, 0.55], this.materials.litWindowWarm, this.materials.brushedSteel, 2, 1);

    // Tall building: deliberately NOT calling enableShadows.
    return group;
  }

  createCapsuleHotelBlock(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_capsule_hotel_block";

    const width = 5;
    const depth = 4;
    const bodyH = 9;

    // Main cyberConcreteLight slab body.
    group.add(this.mesh(new THREE.BoxGeometry(width, bodyH, depth), this.materials.cyberConcreteLight, [0, bodyH * 0.5, 0]));

    // Slim recessed front facade plate (a touch darker steel set behind the windows)
    // so the capsule window grid reads as inset shadow boxes against the slab.
    const facadeZ = depth * 0.5 - 0.12;
    group.add(this.mesh(new THREE.BoxGeometry(width - 0.5, bodyH - 1.4, 0.18), this.materials.towerSteel, [0, bodyH * 0.5 + 0.1, facadeZ - 0.18]));

    // Tight regular 6x4 array of small uniform square capsule windows.
    // A few are randomly dark (unlit) for life; the rest glow cool.
    const cols = 6;
    const rows = 4;
    const winW = 0.5;
    const winH = 0.5;
    const gridW = width - 0.9;
    const gridLeft = -gridW * 0.5;
    const gridBottomY = 2.4;
    const gridTopY = bodyH - 1.4;
    const rowSpan = gridTopY - gridBottomY;
    const winZ = facadeZ;
    for (let c = 0; c < cols; c += 1) {
      const wx = gridLeft + (gridW * c) / (cols - 1);
      for (let r = 0; r < rows; r += 1) {
        const wy = gridBottomY + (rowSpan * r) / (rows - 1);
        const lit = Math.random() > 0.18;
        const winMat = lit ? this.materials.litWindowCool : this.materials.towerDark;
        // Pane.
        group.add(this.mesh(new THREE.BoxGeometry(winW, winH, 0.08), winMat, [wx, wy, winZ + 0.05]));
        // Thin steel capsule frame around each pane.
        group.add(this.mesh(new THREE.BoxGeometry(winW + 0.12, 0.05, 0.1), this.materials.towerSteel, [wx, wy + winH * 0.5, winZ + 0.06]));
        group.add(this.mesh(new THREE.BoxGeometry(winW + 0.12, 0.05, 0.1), this.materials.towerSteel, [wx, wy - winH * 0.5, winZ + 0.06]));
        // Slim recessed balcony shadow lip under each window row's lower edge.
        group.add(this.mesh(new THREE.BoxGeometry(winW + 0.18, 0.06, 0.14), this.materials.towerDark, [wx, wy - winH * 0.5 - 0.12, winZ + 0.08]));
      }
    }

    // Thin neonBlue cornice line wrapping the top edge of the slab.
    const corniceY = bodyH - 0.22;
    group.add(
      this.mesh(new THREE.BoxGeometry(width + 0.06, 0.1, depth + 0.06), this.materials.neonBlue, [0, corniceY, 0])
    );
    // Subtle vertical neonBlue accent fillets at the two front corners.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.07, bodyH - 2.6, 0.07), this.materials.neonBlue, [-width * 0.5 + 0.06, bodyH * 0.5 + 0.1, depth * 0.5 - 0.06]),
      this.mesh(new THREE.BoxGeometry(0.07, bodyH - 2.6, 0.07), this.materials.neonBlue, [width * 0.5 - 0.06, bodyH * 0.5 + 0.1, depth * 0.5 - 0.06])
    );

    // Lit lobby canopy at street level: a flat steel awning projecting toward the road (+Z).
    const canopyZ = depth * 0.5 + 0.55;
    group.add(
      this.mesh(new THREE.BoxGeometry(width - 0.3, 0.14, 1.2), this.materials.towerSteel, [0, 1.85, canopyZ - 0.25]),
      // Warm-cool underside glow strip lighting the entrance.
      this.mesh(new THREE.BoxGeometry(width - 0.9, 0.06, 0.9), this.materials.litWindowCool, [0, 1.77, canopyZ - 0.25]),
      // Two slim support posts.
      this.mesh(new THREE.BoxGeometry(0.1, 1.78, 0.1), this.materials.towerSteel, [-(width * 0.5 - 0.5), 0.89, canopyZ + 0.2]),
      this.mesh(new THREE.BoxGeometry(0.1, 1.78, 0.1), this.materials.towerSteel, [width * 0.5 - 0.5, 0.89, canopyZ + 0.2])
    );

    // Glowing lobby doorway recessed into the slab.
    group.add(
      this.mesh(new THREE.BoxGeometry(2.0, 1.5, 0.1), this.materials.litWindowCool, [0, 0.9, depth * 0.5 + 0.02]),
      this.mesh(new THREE.BoxGeometry(2.2, 0.08, 0.14), this.materials.towerSteel, [0, 1.66, depth * 0.5 + 0.03]),
      this.mesh(new THREE.BoxGeometry(0.08, 1.5, 0.14), this.materials.towerSteel, [-1.0, 0.9, depth * 0.5 + 0.03]),
      this.mesh(new THREE.BoxGeometry(0.08, 1.5, 0.14), this.materials.towerSteel, [1.0, 0.9, depth * 0.5 + 0.03])
    );

    // neonBlue logo strip across the canopy fascia, with a kanjiGold accent tile.
    group.add(
      this.mesh(new THREE.BoxGeometry(width - 0.5, 0.34, 0.06), this.materials.neonBlue, [0, 1.95, canopyZ + 0.32]),
      this.mesh(new THREE.BoxGeometry(0.42, 0.42, 0.07), this.materials.kanjiGold, [-(width * 0.5 - 0.7), 1.95, canopyZ + 0.34]),
      // A short kanjiGold vertical hanging sign blade by the entrance corner.
      this.mesh(new THREE.BoxGeometry(0.26, 1.1, 0.06), this.materials.kanjiGold, [width * 0.5 - 0.28, 2.7, depth * 0.5 + 0.18])
    );

    // Rooftop parapet ring.
    const roofY = bodyH;
    group.add(
      this.mesh(new THREE.BoxGeometry(width, 0.3, 0.18), this.materials.cyberConcreteLight, [0, roofY + 0.15, depth * 0.5 - 0.09]),
      this.mesh(new THREE.BoxGeometry(width, 0.3, 0.18), this.materials.cyberConcreteLight, [0, roofY + 0.15, -depth * 0.5 + 0.09]),
      this.mesh(new THREE.BoxGeometry(0.18, 0.3, depth), this.materials.cyberConcreteLight, [-width * 0.5 + 0.09, roofY + 0.15, 0]),
      this.mesh(new THREE.BoxGeometry(0.18, 0.3, depth), this.materials.cyberConcreteLight, [width * 0.5 - 0.09, roofY + 0.15, 0])
    );

    // Rooftop HVAC + water-tank cluster.
    // HVAC condenser boxes.
    group.add(
      this.mesh(new THREE.BoxGeometry(1.3, 0.7, 1.0), this.materials.towerSteel, [-1.0, roofY + 0.35, -0.4]),
      this.mesh(new THREE.BoxGeometry(0.9, 0.5, 0.8), this.materials.towerSteel, [-1.2, roofY + 0.25, 0.7]),
      // Fan grille caps glowing faintly cool.
      this.mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 10), this.materials.litWindowCool, [-1.3, roofY + 0.73, -0.4]),
      this.mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 10), this.materials.litWindowCool, [-0.7, roofY + 0.73, -0.4])
    );
    // Cylindrical water tank on a low frame.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), this.materials.towerSteel, [0.9, roofY + 0.25, 0.5]),
      this.mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), this.materials.towerSteel, [1.6, roofY + 0.25, 0.5]),
      this.mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), this.materials.towerSteel, [0.9, roofY + 0.25, 1.1]),
      this.mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), this.materials.towerSteel, [1.6, roofY + 0.25, 1.1]),
      this.mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.0, 12), this.materials.cyberConcreteLight, [1.25, roofY + 1.0, 0.8]),
      this.mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 12), this.materials.towerSteel, [1.25, roofY + 1.56, 0.8])
    );
    // A slim rooftop beacon mast tipped with a neonBlue marker light.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.07, 1.0, 0.07), this.materials.towerSteel, [-0.2, roofY + 0.5, 1.2]),
      this.mesh(new THREE.IcosahedronGeometry(0.14, 0), this.materials.neonBlue, [-0.2, roofY + 1.05, 1.2])
    );

    // Non-shadow-casting tall filler building: do NOT call enableShadows.
    return group;
  }

  createRooftopBillboard(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_rooftop_billboard";

    // ----- Ground catwalk + A-frame support legs (brushedSteel) -----
    // A small steel deck the frame stands on, sitting at y=0.
    group.add(
      this.mesh(new THREE.BoxGeometry(5.4, 0.12, 1.2), this.materials.brushedSteel, [0, 0.06, 0]),
      // Two longitudinal catwalk rails (raised lip so it reads as a walkway).
      this.mesh(new THREE.BoxGeometry(5.4, 0.06, 0.08), this.materials.brushedSteel, [0, 0.16, 0.52]),
      this.mesh(new THREE.BoxGeometry(5.4, 0.06, 0.08), this.materials.brushedSteel, [0, 0.16, -0.52])
    );

    // A-frame legs: each panel-corner is held by a splayed pair of struts that
    // meet up high, like a billboard back-brace. Front legs near +Z, raked back.
    const legPairX = [-2.0, 2.0];
    for (const lx of legPairX) {
      // Vertical inner mast.
      group.add(this.mesh(new THREE.BoxGeometry(0.14, 4.0, 0.14), this.materials.brushedSteel, [lx, 2.0, -0.1]));
      // Raked back brace forming the "A".
      const brace = this.mesh(new THREE.BoxGeometry(0.1, 3.4, 0.1), this.materials.brushedSteel, [lx, 1.7, -0.55]);
      brace.rotation.x = -0.28;
      group.add(brace);
      // Front kicker strut for stability.
      const kicker = this.mesh(new THREE.BoxGeometry(0.09, 2.2, 0.09), this.materials.brushedSteel, [lx, 1.1, 0.4]);
      kicker.rotation.x = 0.34;
      group.add(kicker);
    }

    // Cross-bracing diagonals between the two masts (open truss look).
    const diagA = this.mesh(new THREE.BoxGeometry(4.6, 0.07, 0.07), this.materials.brushedSteel, [0, 1.2, -0.1]);
    diagA.rotation.z = 0.32;
    const diagB = this.mesh(new THREE.BoxGeometry(4.6, 0.07, 0.07), this.materials.brushedSteel, [0, 1.2, -0.1]);
    diagB.rotation.z = -0.32;
    group.add(
      diagA,
      diagB,
      // Horizontal tie beams top and bottom of the support zone.
      this.mesh(new THREE.BoxGeometry(4.4, 0.09, 0.09), this.materials.brushedSteel, [0, 0.5, -0.1]),
      this.mesh(new THREE.BoxGeometry(4.4, 0.09, 0.09), this.materials.brushedSteel, [0, 1.95, -0.1])
    );

    // ----- The billboard face, raised on the frame -----
    // Panel centre height ~ 3.0m; the face is split neonMagenta (left) / neonCyan (right).
    const faceY = 3.0;
    const faceZ = 0.18;
    const faceW = 5.8;
    const faceH = 2.4;
    // Dark backing board behind the lit field.
    group.add(this.mesh(new THREE.BoxGeometry(faceW + 0.2, faceH + 0.2, 0.16), this.materials.towerDark, [0, faceY, faceZ - 0.12]));
    // Split emissive field.
    group.add(
      this.mesh(new THREE.BoxGeometry(faceW * 0.5, faceH, 0.08), this.materials.neonMagenta, [-faceW * 0.25, faceY, faceZ]),
      this.mesh(new THREE.BoxGeometry(faceW * 0.5, faceH, 0.08), this.materials.neonCyan, [faceW * 0.25, faceY, faceZ])
    );

    // ----- Big glowing kanji blocks (kanjiGold + neonCyan) -----
    // Built as chunky bar strokes so each block reads as a character at distance.
    const faceFrontZ = faceZ + 0.06;
    // Block 1 (left, on magenta field) — kanjiGold strokes.
    const k1x = -1.55;
    group.add(
      this.mesh(new THREE.BoxGeometry(1.3, 0.18, 0.06), this.materials.kanjiGold, [k1x, faceY + 0.62, faceFrontZ]),
      this.mesh(new THREE.BoxGeometry(0.18, 1.4, 0.06), this.materials.kanjiGold, [k1x, faceY, faceFrontZ]),
      this.mesh(new THREE.BoxGeometry(1.0, 0.18, 0.06), this.materials.kanjiGold, [k1x, faceY - 0.05, faceFrontZ]),
      this.mesh(new THREE.BoxGeometry(1.2, 0.18, 0.06), this.materials.kanjiGold, [k1x, faceY - 0.66, faceFrontZ])
    );
    // Block 2 (centre seam) — neonCyan strokes for contrast on the magenta half edge.
    const k2x = 0.05;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.18, 1.5, 0.06), this.materials.neonCyan, [k2x - 0.42, faceY, faceFrontZ]),
      this.mesh(new THREE.BoxGeometry(0.18, 1.5, 0.06), this.materials.neonCyan, [k2x + 0.42, faceY, faceFrontZ]),
      this.mesh(new THREE.BoxGeometry(1.05, 0.18, 0.06), this.materials.neonCyan, [k2x, faceY + 0.6, faceFrontZ]),
      this.mesh(new THREE.BoxGeometry(0.85, 0.16, 0.06), this.materials.neonCyan, [k2x, faceY - 0.55, faceFrontZ])
    );
    // Block 3 (right, on cyan field) — kanjiGold strokes.
    const k3x = 1.7;
    group.add(
      this.mesh(new THREE.BoxGeometry(1.25, 0.18, 0.06), this.materials.kanjiGold, [k3x, faceY + 0.6, faceFrontZ]),
      this.mesh(new THREE.BoxGeometry(0.18, 1.2, 0.06), this.materials.kanjiGold, [k3x - 0.4, faceY - 0.1, faceFrontZ]),
      this.mesh(new THREE.BoxGeometry(0.18, 1.2, 0.06), this.materials.kanjiGold, [k3x + 0.4, faceY - 0.1, faceFrontZ]),
      this.mesh(new THREE.BoxGeometry(1.25, 0.16, 0.06), this.materials.kanjiGold, [k3x, faceY - 0.62, faceFrontZ])
    );

    // ----- Chasing border of small emissive cubes around the panel edge -----
    // Alternating cyan/magenta marquee lamps; small per-lamp jitter for life.
    const borderMats = [this.materials.neonCyan, this.materials.neonMagenta];
    const cube = 0.16;
    const halfW = faceW * 0.5 + 0.05;
    const halfH = faceH * 0.5 + 0.05;
    const lampZ = faceFrontZ + 0.02;
    let lampIndex = 0;
    const cols = 18;
    for (let i = 0; i <= cols; i += 1) {
      const x = -halfW + (2 * halfW * i) / cols;
      const j = (Math.random() - 0.5) * 0.03;
      group.add(
        this.mesh(new THREE.BoxGeometry(cube, cube, 0.06), borderMats[lampIndex++ % 2], [x, faceY + halfH + j, lampZ]),
        this.mesh(new THREE.BoxGeometry(cube, cube, 0.06), borderMats[lampIndex++ % 2], [x, faceY - halfH + j, lampZ])
      );
    }
    const rows = 7;
    for (let i = 1; i < rows; i += 1) {
      const y = faceY - halfH + (2 * halfH * i) / rows;
      const j = (Math.random() - 0.5) * 0.03;
      group.add(
        this.mesh(new THREE.BoxGeometry(cube, cube, 0.06), borderMats[lampIndex++ % 2], [-halfW + j, y, lampZ]),
        this.mesh(new THREE.BoxGeometry(cube, cube, 0.06), borderMats[lampIndex++ % 2], [halfW + j, y, lampZ])
      );
    }

    // ----- Maintenance ladder up the right mast -----
    const ladderX = 2.0;
    const ladderZ = 0.32;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.05, 3.6, 0.05), this.materials.brushedSteel, [ladderX - 0.18, 1.8, ladderZ]),
      this.mesh(new THREE.BoxGeometry(0.05, 3.6, 0.05), this.materials.brushedSteel, [ladderX + 0.18, 1.8, ladderZ])
    );
    for (let r = 0; r < 9; r += 1) {
      const ry = 0.4 + r * 0.38;
      group.add(this.mesh(new THREE.BoxGeometry(0.42, 0.04, 0.04), this.materials.brushedSteel, [ladderX, ry, ladderZ]));
    }

    // ----- Service walkway along the bottom of the panel (where the ladder lands) -----
    group.add(
      this.mesh(new THREE.BoxGeometry(faceW + 0.3, 0.08, 0.34), this.materials.brushedSteel, [0, faceY - halfH - 0.12, faceZ + 0.1]),
      // Walkway hand-rail.
      this.mesh(new THREE.BoxGeometry(faceW + 0.3, 0.04, 0.04), this.materials.brushedSteel, [0, faceY - halfH + 0.2, faceZ + 0.26])
    );

    this.enableShadows(group);
    return group;
  }

  createVerticalKanjiBlade(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_vertical_kanji_blade";

    // --- Base + slim pole (cool steel, structural) ---
    const footPad = this.mesh(new THREE.BoxGeometry(0.5, 0.1, 0.42), this.materials.towerDark, [0, 0.05, 0]);
    const footTrim = this.mesh(new THREE.BoxGeometry(0.36, 0.06, 0.3), this.materials.brushedSteel, [0, 0.12, 0]);
    const pole = this.mesh(new THREE.CylinderGeometry(0.05, 0.07, 5.9, 8), this.materials.brushedSteel, [0, 2.95, 0]);
    const poleCap = this.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 8), this.materials.brushedSteel, [0, 5.92, 0]);
    group.add(footPad, footTrim, pole, poleCap);

    // The blade hangs to the +Z (road) side of the pole, sitting just off-centre.
    const bladeZ = 0.12;
    const bladeX = 0.0;
    const bladeW = 0.46;
    const bladeBottom = 0.9;
    const bladeTop = 5.7;
    const bladeH = bladeTop - bladeBottom;
    const bladeCY = bladeBottom + bladeH * 0.5;
    const faceZ = bladeZ + 0.13; // front plane where tiles + tube live

    // --- Bracket arm(s) tying the blade back to the pole ---
    const bracketTop = this.mesh(new THREE.BoxGeometry(0.06, 0.05, 0.34), this.materials.brushedSteel, [0, bladeTop - 0.25, bladeZ * 0.5]);
    const bracketBot = this.mesh(new THREE.BoxGeometry(0.06, 0.05, 0.34), this.materials.brushedSteel, [0, bladeBottom + 0.25, bladeZ * 0.5]);
    const bracketHub = this.mesh(new THREE.BoxGeometry(0.08, 0.16, 0.1), this.materials.brushedSteel, [0, bladeCY, 0]);
    group.add(bracketTop, bracketBot, bracketHub);

    // --- towerDark backer blade ---
    const backer = this.mesh(new THREE.BoxGeometry(bladeW, bladeH, 0.18), this.materials.towerDark, [bladeX, bladeCY, bladeZ]);
    const backerRim = this.mesh(new THREE.BoxGeometry(bladeW + 0.04, bladeH + 0.04, 0.1), this.materials.towerDark, [bladeX, bladeCY, bladeZ - 0.05]);
    const topFinial = this.mesh(new THREE.BoxGeometry(bladeW + 0.08, 0.1, 0.2), this.materials.brushedSteel, [bladeX, bladeTop + 0.04, bladeZ]);
    const botFinial = this.mesh(new THREE.BoxGeometry(bladeW + 0.08, 0.1, 0.2), this.materials.brushedSteel, [bladeX, bladeBottom - 0.04, bladeZ]);
    group.add(backer, backerRim, topFinial, botFinial);

    // --- Stacked column of glowing kanji tiles (alternating red / gold) ---
    const tileCount = 5;
    const tileGap = 0.12;
    const colTop = bladeTop - 0.28;
    const colBottom = bladeBottom + 0.28;
    const colH = colTop - colBottom;
    const tileH = (colH - tileGap * (tileCount - 1)) / tileCount;
    const tileW = bladeW - 0.12;
    for (let i = 0; i < tileCount; i += 1) {
      const tileCY = colTop - tileH * 0.5 - i * (tileH + tileGap);
      const glowMat = i % 2 === 0 ? this.materials.kanjiRed : this.materials.kanjiGold;
      // recessed dark cell, raised glowing kanji face, plus tiny cut-marks to read as a character
      const cell = this.mesh(new THREE.BoxGeometry(tileW + 0.06, tileH + 0.04, 0.06), this.materials.towerDark, [bladeX, tileCY, faceZ - 0.04]);
      const face = this.mesh(new THREE.BoxGeometry(tileW, tileH, 0.07), glowMat, [bladeX, tileCY, faceZ]);
      const notchH = this.mesh(new THREE.BoxGeometry(tileW * 0.62, tileH * 0.14, 0.085), this.materials.towerDark, [bladeX, tileCY + tileH * 0.16, faceZ + 0.01]);
      const notchV = this.mesh(new THREE.BoxGeometry(tileW * 0.16, tileH * 0.5, 0.085), this.materials.towerDark, [bladeX + tileW * (i % 2 === 0 ? -0.18 : 0.18), tileCY - tileH * 0.08, faceZ + 0.01]);
      group.add(cell, face, notchH, notchV);
    }

    // --- neonCyan tube outline running the full blade height (4 edges + crossbars) ---
    const tubeT = 0.04;
    const tubeHalfW = bladeW * 0.5;
    const tubeLeft = this.mesh(new THREE.BoxGeometry(tubeT, bladeH, tubeT), this.materials.neonCyan, [bladeX - tubeHalfW, bladeCY, faceZ]);
    const tubeRight = this.mesh(new THREE.BoxGeometry(tubeT, bladeH, tubeT), this.materials.neonCyan, [bladeX + tubeHalfW, bladeCY, faceZ]);
    const tubeTop = this.mesh(new THREE.BoxGeometry(bladeW + tubeT, tubeT, tubeT), this.materials.neonCyan, [bladeX, bladeTop - 0.02, faceZ]);
    const tubeBot = this.mesh(new THREE.BoxGeometry(bladeW + tubeT, tubeT, tubeT), this.materials.neonCyan, [bladeX, bladeBottom + 0.02, faceZ]);
    group.add(tubeLeft, tubeRight, tubeTop, tubeBot);

    // small cyan accent caps at top + an arrow flag pointing into the alley
    const beacon = this.mesh(new THREE.IcosahedronGeometry(0.07, 0), this.materials.neonCyan, [bladeX, bladeTop + 0.16, bladeZ]);
    beacon.rotation.set(Math.random(), Math.random(), Math.random());
    const arrow = this.mesh(new THREE.BoxGeometry(0.16, 0.08, 0.06), this.materials.neonCyan, [bladeX + tubeHalfW + 0.12, bladeBottom + 0.18, faceZ]);
    arrow.rotation.z = -0.5;
    group.add(beacon, arrow);

    return group;
  }

  createHologramAdPanel(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_hologram_ad_panel";

    // --- Brushed-steel base post (slim free-standing pillar) ---
    // Soft glow puddle on the ground beneath the projector
    const glowBase = this.mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.06, 12), this.materials.hologramBlue, [0, 0.03, 0]);
    group.add(glowBase);

    // Heavy footing + tapered post
    group.add(
      this.mesh(new THREE.BoxGeometry(0.6, 0.16, 0.5), this.materials.towerDark, [0, 0.08, 0]),
      this.mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.18, 8), this.materials.brushedSteel, [0, 0.25, 0]),
      this.mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.0, 8), this.materials.brushedSteel, [0, 0.85, 0]),
      // Projector head at the top of the post that "casts" the hologram
      this.mesh(new THREE.BoxGeometry(0.5, 0.16, 0.4), this.materials.brushedSteel, [0, 1.42, 0]),
      this.mesh(new THREE.BoxGeometry(0.42, 0.06, 0.34), this.materials.hologramBlue, [0, 1.53, 0]),
      // Steel side struts framing the projected slab
      this.mesh(new THREE.BoxGeometry(0.05, 2.9, 0.06), this.materials.brushedSteel, [-0.46, 3.0, 0]),
      this.mesh(new THREE.BoxGeometry(0.05, 2.9, 0.06), this.materials.brushedSteel, [0.46, 3.0, 0])
    );

    // --- The tall holographic ad slab (slightly tapered, semi-transparent read) ---
    // Stacked thin layers give the tapered, glowing volume without heavy poly.
    const slabBottomY = 1.62;
    const slabLayers = 5;
    const slabHeight = 2.7;
    for (let i = 0; i < slabLayers; i += 1) {
      const t = i / (slabLayers - 1);
      const layerW = 0.86 - t * 0.22; // taper toward the top
      const layerY = slabBottomY + (slabHeight * (i + 0.5)) / slabLayers;
      const layerH = slabHeight / slabLayers + 0.02;
      group.add(this.mesh(new THREE.BoxGeometry(layerW, layerH, 0.04), this.materials.hologramBlue, [0, layerY, 0.02]));
    }

    // Bright leading edge so the hologram catches the eye from the road
    group.add(this.mesh(new THREE.BoxGeometry(0.7, slabHeight, 0.015), this.materials.hologramBlue, [0, slabBottomY + slabHeight * 0.5, 0.05]));

    // --- Faint figure / kanji silhouette via darker inset boxes (towerDark) ---
    const figCx = 0;
    const figCy = slabBottomY + slabHeight * 0.52;
    group.add(
      // head
      this.mesh(new THREE.BoxGeometry(0.26, 0.3, 0.012), this.materials.towerDark, [figCx, figCy + 0.85, 0.045]),
      // shoulders / torso
      this.mesh(new THREE.BoxGeometry(0.52, 0.78, 0.012), this.materials.towerDark, [figCx, figCy + 0.18, 0.045]),
      // splayed arms
      this.mesh(new THREE.BoxGeometry(0.62, 0.12, 0.012), this.materials.towerDark, [figCx, figCy + 0.42, 0.045]),
      // kanji-like accent strokes below the figure
      this.mesh(new THREE.BoxGeometry(0.46, 0.06, 0.012), this.materials.towerDark, [figCx, figCy - 0.5, 0.045]),
      this.mesh(new THREE.BoxGeometry(0.06, 0.36, 0.012), this.materials.towerDark, [figCx - 0.12, figCy - 0.68, 0.045]),
      this.mesh(new THREE.BoxGeometry(0.06, 0.36, 0.012), this.materials.towerDark, [figCx + 0.12, figCy - 0.68, 0.045]),
      this.mesh(new THREE.BoxGeometry(0.3, 0.05, 0.012), this.materials.towerDark, [figCx, figCy - 0.86, 0.045])
    );

    // --- Horizontal neonCyan scan-line strips sweeping across the slab ---
    const scanCount = 7;
    for (let i = 0; i < scanCount; i += 1) {
      const ty = i / (scanCount - 1);
      const scanY = slabBottomY + 0.12 + ty * (slabHeight - 0.24);
      const scanW = 0.82 - ty * 0.2; // follow the slab taper
      // every other line is thinner, for a flickering-CRT read
      const scanH = i % 2 === 0 ? 0.035 : 0.018;
      group.add(this.mesh(new THREE.BoxGeometry(scanW, scanH, 0.012), this.materials.neonCyan, [0, scanY, 0.052]));
    }

    // Glowing cyan cap + base trims that bracket the hologram
    group.add(
      this.mesh(new THREE.BoxGeometry(0.78, 0.05, 0.05), this.materials.neonCyan, [0, slabBottomY + slabHeight + 0.02, 0.03]),
      this.mesh(new THREE.BoxGeometry(0.86, 0.05, 0.05), this.materials.neonCyan, [0, slabBottomY - 0.02, 0.03])
    );

    return group;
  }

  createExpresswaySignGantry(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_expressway_sign_gantry";

    const steel = this.materials.brushedSteel;
    const guard = this.materials.guardSteel;
    const beamY = 9.5; // high clearance so the chase camera passes cleanly underneath

    // ---- Two lattice legs at x = ±3.4 ----
    for (const side of [-1, 1]) {
      const legX = side * 3.4;

      // Base plate + footing
      group.add(
        this.mesh(new THREE.BoxGeometry(0.9, 0.16, 0.9), guard, [legX, 0.08, 0]),
        this.mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), steel, [legX, 0.3, 0])
      );

      // Two vertical chords spaced in Z, running from base up to the beam
      for (const cz of [-0.26, 0.26]) {
        group.add(this.mesh(new THREE.BoxGeometry(0.16, beamY + 0.2, 0.16), steel, [legX, (beamY + 0.2) / 2, cz]));
      }

      // Lattice diagonals zig-zagging up the leg (in the X/Y plane, faceted)
      for (let i = 0; i < 16; i += 1) {
        const segY = 0.5 + i * 0.62;
        if (segY > beamY) break;
        const brace = this.mesh(new THREE.BoxGeometry(0.085, 0.78, 0.5), steel, [legX, segY, 0]);
        brace.rotation.x = (i % 2 === 0 ? 1 : -1) * 0.62;
        group.add(brace);
        // horizontal rungs tying the two chords
        group.add(this.mesh(new THREE.BoxGeometry(0.1, 0.09, 0.6), guard, [legX, segY + 0.31, 0]));
      }
    }

    // ---- Deep truss beam spanning the road (centred at x=0) ----
    const beamSpan = 7.4;
    // Top & bottom chords, doubled in Z
    for (const cz of [-0.3, 0.3]) {
      group.add(
        this.mesh(new THREE.BoxGeometry(beamSpan, 0.18, 0.16), steel, [0, beamY + 0.42, cz]),
        this.mesh(new THREE.BoxGeometry(beamSpan, 0.18, 0.16), steel, [0, beamY - 0.42, cz])
      );
    }
    // End posts of the beam
    for (const px of [-3.4, 3.4]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.16, 1.0, 0.74), steel, [px, beamY, 0]));
    }
    // Truss web: alternating diagonals along the span (faceted X-pattern)
    for (let i = 0; i < 11; i += 1) {
      const wx = -3.1 + i * 0.62;
      const diag = this.mesh(new THREE.BoxGeometry(0.075, 1.02, 0.5), steel, [wx, beamY, 0]);
      diag.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.55;
      group.add(diag);
      // vertical posts every other bay
      if (i % 2 === 1) group.add(this.mesh(new THREE.BoxGeometry(0.09, 0.84, 0.5), guard, [wx, beamY, 0]));
    }

    // ---- Maintenance catwalk slung under the beam ----
    group.add(
      this.mesh(new THREE.BoxGeometry(7.0, 0.07, 0.62), guard, [0, beamY - 0.66, 0.18]),
      // handrails (front + back)
      this.mesh(new THREE.BoxGeometry(7.0, 0.05, 0.05), steel, [0, beamY - 0.28, 0.48]),
      this.mesh(new THREE.BoxGeometry(7.0, 0.05, 0.05), steel, [0, beamY - 0.46, 0.48])
    );
    // catwalk stanchions
    for (let i = 0; i < 8; i += 1) {
      const sx = -3.0 + i * 0.857;
      group.add(this.mesh(new THREE.BoxGeometry(0.045, 0.4, 0.045), steel, [sx, beamY - 0.48, 0.48]));
    }

    // ---- Green directional sign panel hung below the beam ----
    const signY = beamY - 1.9;
    const signZ = 0.42;
    // hangers from beam down to sign
    for (const hx of [-2.6, 2.6]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.09, 1.0, 0.09), steel, [hx, beamY - 1.0, signZ]));
    }
    // sign field + steel frame
    group.add(
      this.mesh(new THREE.BoxGeometry(6.4, 1.7, 0.1), this.materials.busLanePaint, [0, signY, signZ]),
      this.mesh(new THREE.BoxGeometry(6.6, 0.1, 0.14), guard, [0, signY + 0.85, signZ + 0.02]),
      this.mesh(new THREE.BoxGeometry(6.6, 0.1, 0.14), guard, [0, signY - 0.85, signZ + 0.02]),
      this.mesh(new THREE.BoxGeometry(0.1, 1.9, 0.14), guard, [-3.2, signY, signZ + 0.02]),
      this.mesh(new THREE.BoxGeometry(0.1, 1.9, 0.14), guard, [3.2, signY, signZ + 0.02])
    );

    // White kanji-style block + destination bars (laneWhite, on the sign face)
    const faceZ = signZ + 0.07;
    group.add(
      // two stacked "text" bars on the left
      this.mesh(new THREE.BoxGeometry(2.2, 0.28, 0.03), this.materials.laneWhite, [-1.6, signY + 0.42, faceZ]),
      this.mesh(new THREE.BoxGeometry(2.6, 0.28, 0.03), this.materials.laneWhite, [-1.4, signY - 0.18, faceZ]),
      // a small kanji-block glyph cluster
      this.mesh(new THREE.BoxGeometry(0.42, 0.42, 0.03), this.materials.laneWhite, [-2.9, signY + 0.45, faceZ]),
      this.mesh(new THREE.BoxGeometry(0.42, 0.42, 0.03), this.materials.laneWhite, [-2.9, signY - 0.15, faceZ])
    );
    // Big direction arrow on the right (shaft + chevron head from two rotated bars)
    group.add(this.mesh(new THREE.BoxGeometry(1.7, 0.26, 0.03), this.materials.laneWhite, [1.7, signY + 0.1, faceZ]));
    const headA = this.mesh(new THREE.BoxGeometry(0.7, 0.26, 0.03), this.materials.laneWhite, [2.35, signY + 0.4, faceZ]);
    headA.rotation.z = -0.85;
    const headB = this.mesh(new THREE.BoxGeometry(0.7, 0.26, 0.03), this.materials.laneWhite, [2.35, signY - 0.2, faceZ]);
    headB.rotation.z = 0.85;
    group.add(headA, headB);

    // ---- Under-mounted box lane lights (litWindowCool) glowing down on the road ----
    for (let i = 0; i < 5; i += 1) {
      const lx = -2.4 + i * 1.2;
      group.add(
        this.mesh(new THREE.BoxGeometry(0.5, 0.12, 0.32), guard, [lx, signY - 0.95, signZ - 0.1]),
        this.mesh(new THREE.BoxGeometry(0.42, 0.06, 0.26), this.materials.litWindowCool, [lx, signY - 1.02, signZ - 0.1])
      );
    }

    // ---- Row of neonAmber lamp dots along the leading (top, +Z) edge ----
    for (let i = 0; i < 13; i += 1) {
      const dx = -3.0 + i * 0.5;
      group.add(this.mesh(new THREE.BoxGeometry(0.14, 0.1, 0.06), this.materials.neonAmber, [dx, beamY + 0.42, signZ + 0.36]));
    }

    // ---- reflectorAmber strip on the leading edge (warns of low clearance) ----
    group.add(this.mesh(new THREE.BoxGeometry(7.2, 0.16, 0.04), this.materials.reflectorAmber, [0, beamY + 0.62, signZ + 0.38]));

    this.enableShadows(group);
    return group;
  }

  createGlassSkybridge(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_glass_skybridge";

    const bridgeY = 9.0;        // high deck — chase camera passes cleanly beneath the span + arch
    const tubeW = 7.2;          // glass corridor span (x)
    const tubeH = 2.0;          // corridor height
    const tubeD = 1.7;          // corridor depth (z)
    const abutX = 3.6;          // shoulder tower centre offset

    // ---- Shoulder abutments: short cyberConcrete stair-towers on each shoulder ----
    for (const sx of [-1, 1]) {
      const x = sx * abutX;

      // Main tower shaft (rises from ground to just above the deck)
      group.add(
        this.mesh(new THREE.BoxGeometry(1.7, bridgeY + tubeH * 0.5 + 0.3, 1.7), this.materials.cyberConcrete, [x, (bridgeY + tubeH * 0.5 + 0.3) * 0.5, 0])
      );
      // Lighter offset core for facet variety + a recessed lift shaft slot
      group.add(
        this.mesh(new THREE.BoxGeometry(0.7, bridgeY + tubeH * 0.5, 0.78), this.materials.cyberConcreteLight, [x - sx * 0.55, (bridgeY) * 0.55, 0.46]),
        this.mesh(new THREE.BoxGeometry(0.46, bridgeY - 0.6, 0.05), this.materials.tealGlass, [x - sx * 0.55, (bridgeY) * 0.5, 0.86])
      );
      // Capping parapet + brushedSteel coping
      group.add(
        this.mesh(new THREE.BoxGeometry(1.9, 0.32, 1.9), this.materials.cyberConcreteLight, [x, bridgeY + tubeH * 0.5 + 0.46, 0]),
        this.mesh(new THREE.BoxGeometry(1.96, 0.08, 1.96), this.materials.brushedSteel, [x, bridgeY + tubeH * 0.5 + 0.66, 0]),
        this.mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), this.materials.brushedSteel, [x, bridgeY + tubeH * 0.5 + 0.92, 0])
      );
      // Beacon on the parapet
      group.add(this.mesh(new THREE.IcosahedronGeometry(0.12, 0), this.materials.towerBeacon, [x, bridgeY + tubeH * 0.5 + 1.18, 0]));

      // Lit window stack down the front of each tower
      this.addFrontLatticePanel(group, [x + sx * 0.3, bridgeY - 1.4, 0.86], [0.78, 2.2], this.materials.litWindowCool, this.materials.brushedSteel, 1, 5);
      this.addFrontLatticePanel(group, [x + sx * 0.3, bridgeY + 0.3, 0.86], [0.78, 0.9], this.materials.litWindowCool, this.materials.brushedSteel, 1, 2);
      // Entry glow at the base
      group.add(this.mesh(new THREE.BoxGeometry(0.9, 0.9, 0.06), this.materials.litWindowCool, [x, 0.5, 0.86]));
      // Reflective ground-level reflector strip
      group.add(this.mesh(new THREE.BoxGeometry(1.74, 0.06, 0.05), this.materials.reflectorAmber, [x, 0.12, 0.87]));
    }

    // ---- Enclosed glass tube corridor spanning the road ----
    // Floor deck + ceiling slab (brushedSteel structure)
    group.add(
      this.mesh(new THREE.BoxGeometry(tubeW + 0.4, 0.22, tubeD + 0.12), this.materials.brushedSteel, [0, bridgeY - tubeH * 0.5 - 0.08, 0]),
      this.mesh(new THREE.BoxGeometry(tubeW + 0.4, 0.2, tubeD + 0.12), this.materials.brushedSteel, [0, bridgeY + tubeH * 0.5 + 0.06, 0])
    );
    // Soft interior glow slab (the lit corridor) sandwiched inside the glass
    group.add(this.mesh(new THREE.BoxGeometry(tubeW - 0.1, tubeH - 0.5, tubeD - 0.7), this.materials.litWindowCool, [0, bridgeY, 0]));
    // Glass skins front (+Z, toward camera) and back
    group.add(
      this.mesh(new THREE.BoxGeometry(tubeW, tubeH, 0.06), this.materials.tealGlass, [0, bridgeY, tubeD * 0.5]),
      this.mesh(new THREE.BoxGeometry(tubeW, tubeH, 0.06), this.materials.tealGlass, [0, bridgeY, -tubeD * 0.5]),
      // Curved-read top glazing chamfers
      this.mesh(new THREE.BoxGeometry(tubeW, 0.5, tubeD - 0.12), this.materials.tealGlass, [0, bridgeY + tubeH * 0.5 - 0.18, 0])
    );

    // brushedSteel mullion rib grid across the front face of the tube
    const ribCount = 11;
    for (let i = 0; i <= ribCount; i += 1) {
      const rx = -tubeW * 0.5 + (tubeW * i) / ribCount;
      group.add(this.mesh(new THREE.BoxGeometry(0.07, tubeH, 0.09), this.materials.brushedSteel, [rx, bridgeY, tubeD * 0.5 + 0.02]));
    }
    // Horizontal mid-rail and sill mullions front + back
    for (const sz of [1, -1]) {
      group.add(
        this.mesh(new THREE.BoxGeometry(tubeW, 0.08, 0.08), this.materials.brushedSteel, [0, bridgeY + tubeH * 0.18, sz * (tubeD * 0.5 + 0.02)]),
        this.mesh(new THREE.BoxGeometry(tubeW, 0.1, 0.08), this.materials.brushedSteel, [0, bridgeY - tubeH * 0.5 + 0.06, sz * (tubeD * 0.5 + 0.02)])
      );
    }

    // ---- Grand arch beneath the span (the gateway the player drives through) ----
    const archTop = bridgeY - tubeH * 0.5 - 0.2;   // underside of the deck
    const archInnerW = 6.8;                        // clear opening spanning the 6.4 m road; posts land on the shoulders
    // Sweep arch made of short rotated brushedSteel segments hugging each tower
    const archSegs = 7;
    for (let i = 0; i <= archSegs; i += 1) {
      const t = i / archSegs;                      // 0..1 left->right
      const ang = Math.PI * t;                      // 0..PI
      const px = -Math.cos(ang) * (archInnerW * 0.5);
      const py = Math.sin(ang) * 1.5;               // rise of the arch
      const seg = this.mesh(new THREE.BoxGeometry(0.9, 0.16, 0.5), this.materials.brushedSteel, [px, archTop - 1.5 + py, 0.2]);
      seg.rotation.z = (t - 0.5) * Math.PI * 0.9;
      group.add(seg);
      // Cyan accent under-run echoing the arch sweep
      const accent = this.mesh(new THREE.BoxGeometry(0.7, 0.05, 0.1), this.materials.neonCyan, [px, archTop - 1.5 + py - 0.14, 0.46]);
      accent.rotation.z = (t - 0.5) * Math.PI * 0.9;
      group.add(accent);
    }
    // Keystone medallion at the crown of the arch
    group.add(
      this.mesh(new THREE.IcosahedronGeometry(0.34, 0), this.materials.cyberConcreteLight, [0, archTop - 0.1, 0.36]),
      this.mesh(new THREE.BoxGeometry(0.4, 0.4, 0.05), this.materials.neonCyan, [0, archTop - 0.1, 0.6])
    );

    // Tall non-shadow landmark — deliberately skip enableShadows on the span.
    return group;
  }

  createMonorailPillar(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_monorail_pillar";

    // Wide footing pad + chamfer block grounding the mass at y=0.
    group.add(
      this.mesh(new THREE.BoxGeometry(1.5, 0.3, 1.5), this.materials.barrierConcrete, [0, 0.15, 0]),
      this.mesh(new THREE.BoxGeometry(1.2, 0.28, 1.2), this.materials.cyberConcrete, [0, 0.44, 0])
    );

    // Tapered shaft: stacked boxes shrinking with height = a clean concrete batter.
    const shaftLevels = 5;
    for (let i = 0; i < shaftLevels; i += 1) {
      const t = i / (shaftLevels - 1); // 0..1 bottom->top
      const w = 1.0 - 0.34 * t; // 1.0 -> 0.66
      const d = 0.95 - 0.30 * t; // 0.95 -> 0.65
      const segH = 1.18;
      const y = 0.58 + i * segH + segH * 0.5;
      const mat = i % 2 === 0 ? this.materials.cyberConcrete : this.materials.barrierConcrete;
      group.add(this.mesh(new THREE.BoxGeometry(w, segH, d), mat, [0, y, 0]));
    }

    // Shaft head where the T splays out, around y ~ 6.5.
    const headY = 6.55;
    group.add(this.mesh(new THREE.BoxGeometry(0.72, 0.55, 0.72), this.materials.cyberConcrete, [0, headY, 0]));

    // T-arm: the splaying cantilever cap that carries the guideway beam stub.
    const armY = headY + 0.5;
    group.add(
      this.mesh(new THREE.BoxGeometry(1.55, 0.42, 0.95), this.materials.cyberConcrete, [0, armY, 0]),
      // angled haunch brackets under each arm tip for structural read.
      this.mesh(new THREE.BoxGeometry(0.45, 0.5, 0.62), this.materials.barrierConcrete, [-0.5, armY - 0.42, 0]),
      this.mesh(new THREE.BoxGeometry(0.45, 0.5, 0.62), this.materials.barrierConcrete, [0.5, armY - 0.42, 0])
    );
    const haunchL = this.mesh(new THREE.BoxGeometry(0.42, 0.62, 0.55), this.materials.cyberConcrete, [-0.52, armY - 0.3, 0]);
    haunchL.rotation.z = 0.42;
    const haunchR = this.mesh(new THREE.BoxGeometry(0.42, 0.62, 0.55), this.materials.cyberConcrete, [0.52, armY - 0.3, 0]);
    haunchR.rotation.z = -0.42;
    group.add(haunchL, haunchR);

    // Wide guideway beam stub riding high overhead (~7 m) — the running surface.
    const beamY = armY + 0.5;
    group.add(
      this.mesh(new THREE.BoxGeometry(1.75, 0.5, 1.05), this.materials.cyberConcrete, [0, beamY, 0]),
      // lower flange lip for an I-beam silhouette.
      this.mesh(new THREE.BoxGeometry(1.85, 0.12, 0.72), this.materials.barrierConcrete, [0, beamY - 0.28, 0]),
      // running rail caps on top (guideway grooves).
      this.mesh(new THREE.BoxGeometry(1.85, 0.1, 0.16), this.materials.guardSteel, [0, beamY + 0.28, -0.3]),
      this.mesh(new THREE.BoxGeometry(1.85, 0.1, 0.16), this.materials.guardSteel, [0, beamY + 0.28, 0.3]),
      // power rail seam glowing along the beam underside.
      this.mesh(new THREE.BoxGeometry(1.88, 0.05, 0.05), this.materials.neonBlue, [0, beamY - 0.18, 0.46])
    );

    // neonBlue identification band wrapping the shaft head (front + sides).
    group.add(
      this.mesh(new THREE.BoxGeometry(0.74, 0.14, 0.05), this.materials.neonBlue, [0, headY + 0.05, 0.37]),
      this.mesh(new THREE.BoxGeometry(0.05, 0.14, 0.74), this.materials.neonBlue, [0.37, headY + 0.05, 0]),
      this.mesh(new THREE.BoxGeometry(0.05, 0.14, 0.74), this.materials.neonBlue, [-0.37, headY + 0.05, 0])
    );

    // Numbered plate on the front face (front = +Z): frame + lit field.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.5, 0.34, 0.04), this.materials.guardSteel, [0, 2.6, 0.5]),
      this.mesh(new THREE.BoxGeometry(0.4, 0.24, 0.05), this.materials.litWindowCool, [0, 2.6, 0.51])
    );

    // guardSteel maintenance ladder + cage running up the back face (-Z).
    const railZ = -0.5;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.05, 5.2, 0.05), this.materials.guardSteel, [-0.16, 3.3, railZ]),
      this.mesh(new THREE.BoxGeometry(0.05, 5.2, 0.05), this.materials.guardSteel, [0.16, 3.3, railZ])
    );
    for (let r = 0; r < 9; r += 1) {
      const ry = 1.1 + r * 0.6;
      // rungs
      group.add(this.mesh(new THREE.BoxGeometry(0.36, 0.045, 0.045), this.materials.guardSteel, [0, ry, railZ]));
      // safety cage hoops every other rung.
      if (r % 2 === 0) {
        group.add(
          this.mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), this.materials.guardSteel, [0, ry, railZ - 0.24]),
          this.mesh(new THREE.BoxGeometry(0.04, 0.04, 0.24), this.materials.guardSteel, [-0.25, ry, railZ - 0.12]),
          this.mesh(new THREE.BoxGeometry(0.04, 0.04, 0.24), this.materials.guardSteel, [0.25, ry, railZ - 0.12])
        );
      }
    }

    // Inspection light (litWindowCool) on a small guardSteel bracket at the arm.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.08, 0.08, 0.3), this.materials.guardSteel, [0.78, armY - 0.05, 0.2]),
      this.mesh(new THREE.BoxGeometry(0.18, 0.16, 0.1), this.materials.guardSteel, [0.78, armY - 0.05, 0.38]),
      this.mesh(new THREE.BoxGeometry(0.12, 0.1, 0.05), this.materials.litWindowCool, [0.78, armY - 0.05, 0.44])
    );

    return group;
  }

  createCyberStreetLamp(): THREE.Group {
  const group = new THREE.Group();
  group.name = "deco_cyber_street_lamp";

  const steel = this.materials.brushedSteel;
  const concrete = this.materials.cyberConcrete;

  // --- Base & foundation -------------------------------------------------
  // Cast concrete footing with a chamfered collar, then the steel base shoe.
  const footing = this.mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), concrete, [0, 0.06, 0]);
  const footingChamfer = this.mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), concrete, [0, 0.15, 0]);
  const baseShoe = this.mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.22, 8), steel, [0, 0.29, 0]);
  // Four anchor-bolt nubs around the shoe for a touch of mechanical detail.
  const boltA = this.mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), steel, [0.14, 0.21, 0.14]);
  const boltB = this.mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), steel, [-0.14, 0.21, 0.14]);
  const boltC = this.mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), steel, [0.14, 0.21, -0.14]);
  const boltD = this.mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), steel, [-0.14, 0.21, -0.14]);
  group.add(footing, footingChamfer, baseShoe, boltA, boltB, boltC, boltD);

  // --- Tapered pole ------------------------------------------------------
  // Two stacked cylinder segments so the taper reads from fat base to slim top.
  const poleLower = this.mesh(new THREE.CylinderGeometry(0.095, 0.13, 3.0, 8), steel, [0, 1.9, 0]);
  const poleUpper = this.mesh(new THREE.CylinderGeometry(0.06, 0.095, 2.4, 8), steel, [0, 4.6, 0]);
  group.add(poleLower, poleUpper);

  // Maintenance-hatch plate low on the pole, facing the road (+Z).
  const hatch = this.mesh(new THREE.BoxGeometry(0.1, 0.34, 0.03), concrete, [0, 0.9, 0.12]);
  group.add(hatch);

  // --- neonCyan accent collar near the top ------------------------------
  // A glowing ring band wrapped with two steel pinch-rings above and below.
  const collar = this.mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 8), this.materials.neonCyan, [0, 5.55, 0]);
  const collarTrimTop = this.mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.04, 8), steel, [0, 5.64, 0]);
  const collarTrimBot = this.mesh(new THREE.CylinderGeometry(0.08, 0.085, 0.04, 8), steel, [0, 5.46, 0]);
  group.add(collar, collarTrimTop, collarTrimBot);

  // Pole cap finial above the collar.
  const cap = this.mesh(new THREE.CylinderGeometry(0.02, 0.06, 0.16, 8), steel, [0, 5.78, 0]);
  group.add(cap);

  // --- Forward-cranked arm ----------------------------------------------
  // Short knuckle off the pole, a long arm angled forward, plus a tension stay.
  const armBaseY = 5.3;
  const knuckle = this.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 8), steel, [0, armBaseY, 0.06]);
  knuckle.rotation.x = Math.PI / 2;
  // Main arm: cranked forward and tilted slightly downward toward the road.
  const arm = this.mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.0, 8), steel, [0, armBaseY + 0.04, 0.62]);
  arm.rotation.x = Math.PI / 2 - 0.22;
  // Diagonal tension stay from upper pole down to the arm for that expressway look.
  const stay = this.mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.78, 6), steel, [0, armBaseY + 0.26, 0.34]);
  stay.rotation.x = 0.72;
  group.add(knuckle, arm, stay);

  // --- Flat LED head -----------------------------------------------------
  // A wedge housing in steel slung under the arm tip, with a wide flat
  // litWindowCool LED lens on its underside casting the cool downlight.
  const headX = 0;
  const headY = 5.1;
  const headZ = 1.16;
  const housing = this.mesh(new THREE.BoxGeometry(0.3, 0.12, 0.5), steel, [headX, headY, headZ]);
  housing.rotation.x = -0.1;
  const housingNose = this.mesh(new THREE.BoxGeometry(0.26, 0.09, 0.12), steel, [headX, headY - 0.01, headZ + 0.3]);
  housingNose.rotation.x = -0.1;
  // The glowing LED lens, set just below the housing, faces down/forward.
  const ledLens = this.mesh(new THREE.BoxGeometry(0.26, 0.04, 0.44), this.materials.litWindowCool, [headX, headY - 0.07, headZ]);
  ledLens.rotation.x = -0.1;
  // A faint downward glow slab to suggest the cast pool of light.
  const ledSpill = this.mesh(new THREE.BoxGeometry(0.2, 0.02, 0.34), this.materials.litWindowCool, [headX, headY - 0.12, headZ - 0.02]);
  ledSpill.rotation.x = -0.1;
  group.add(housing, housingNose, ledLens, ledSpill);

  // --- Banner-flag bracket + kanji pennant ------------------------------
  // A small bracket arm off the road-side of the pole carrying a vertical
  // glowing pennant. Slight random sway so a row of lamps isn't identical.
  const sway = (Math.random() - 0.5) * 0.12;
  const bracketY = 4.4;
  const bracketArm = this.mesh(new THREE.BoxGeometry(0.28, 0.035, 0.035), steel, [0.18, bracketY + 0.02, 0.08]);
  const bracketDrop = this.mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.06, 6), steel, [0.31, bracketY - 0.01, 0.08]);
  // The glowing neonMagenta pennant hanging from the bracket tip.
  const pennant = this.mesh(new THREE.BoxGeometry(0.16, 0.5, 0.02), this.materials.neonMagenta, [0.31, bracketY - 0.27, 0.09]);
  pennant.rotation.z = sway;
  pennant.rotation.y = 0.18;
  // A darker concrete border strip down one edge so the "kanji" reads as a sign.
  const pennantEdge = this.mesh(new THREE.BoxGeometry(0.03, 0.5, 0.025), concrete, [0.385, bracketY - 0.27, 0.09]);
  pennantEdge.rotation.z = sway;
  pennantEdge.rotation.y = 0.18;
  group.add(bracketArm, bracketDrop, pennant, pennantEdge);

  this.enableShadows(group);

  return group;
  }

  createVendingMachineBank(): THREE.Group {
  const group = new THREE.Group();
  group.name = "deco_vending_machine_bank";

  // --- Bank layout: a row of 4 glowing machines side by side ---------------
  const count = 4;
  const unitW = 0.7;          // single machine width
  const gap = 0.02;           // tight seam between cabinets
  const machineH = 1.78;      // cabinet height (base + body + header)
  const machineD = 0.72;      // depth (front at +Z)
  const pitch = unitW + gap;
  const startX = -((count - 1) * pitch) * 0.5;

  // Header band colours alternate cyan / pink across the bank for that
  // iconic neon-strip read; warm/cool product glow alternates too.
  const headerMats = [this.materials.neonCyan, this.materials.neonPink];
  const glowMats = [this.materials.litWindowWarm, this.materials.litWindowCool];

  // Shared low plinth tying the whole bank together
  group.add(
    this.mesh(
      new THREE.BoxGeometry(count * pitch + 0.12, 0.06, machineD + 0.1),
      this.materials.towerDark,
      [0, 0.03, 0]
    )
  );

  for (let i = 0; i < count; i += 1) {
    const cx = startX + i * pitch;
    const header = headerMats[i % 2];
    const glow = glowMats[i % 2];
    const frontZ = machineD * 0.5;

    // 1) Dark cabinet body
    group.add(
      this.mesh(
        new THREE.BoxGeometry(unitW, machineH, machineD),
        this.materials.towerDark,
        [cx, 0.06 + machineH * 0.5, 0]
      )
    );

    // 2) Dark recessed base / coin tray block at the bottom front
    const baseH = 0.34;
    group.add(
      this.mesh(
        new THREE.BoxGeometry(unitW - 0.06, baseH, 0.08),
        this.materials.towerDark,
        [cx, 0.06 + baseH * 0.5, frontZ + 0.02]
      )
    );

    // 3) Bright top header band — the signature neon strip ------------------
    const headerH = 0.2;
    const headerY = 0.06 + machineH - headerH * 0.5;
    group.add(
      this.mesh(
        new THREE.BoxGeometry(unitW - 0.04, headerH, 0.06),
        header,
        [cx, headerY, frontZ + 0.02]
      )
    );
    // thin emissive lip wrapping the very top edge for extra spill
    group.add(
      this.mesh(
        new THREE.BoxGeometry(unitW, 0.04, machineD * 0.5),
        header,
        [cx, 0.06 + machineH + 0.01, 0.04]
      )
    );

    // 4) tealGlass product window, backlit warm/cool --------------------------
    const winH = machineH - headerH - baseH - 0.16;
    const winY = 0.06 + baseH + 0.08 + winH * 0.5;
    // backlight panel sits just behind the glass and spills light forward
    group.add(
      this.mesh(
        new THREE.BoxGeometry(unitW - 0.12, winH, 0.04),
        glow,
        [cx, winY, frontZ - 0.05]
      )
    );
    // the tealGlass front pane
    group.add(
      this.mesh(
        new THREE.BoxGeometry(unitW - 0.1, winH, 0.04),
        this.materials.tealGlass,
        [cx, winY, frontZ + 0.005]
      )
    );

    // 5) Glowing product rows — little backlit cans on 3 shelves -------------
    const rows = 3;
    const cols = 3;
    for (let r = 0; r < rows; r += 1) {
      const shelfY = winY - winH * 0.5 + (winH * (r + 0.55)) / rows;
      // shelf divider (dark)
      group.add(
        this.mesh(
          new THREE.BoxGeometry(unitW - 0.12, 0.03, 0.05),
          this.materials.towerDark,
          [cx, shelfY - winH / rows * 0.42, frontZ - 0.04]
        )
      );
      for (let c = 0; c < cols; c += 1) {
        const px = cx - (unitW - 0.26) * 0.5 + ((unitW - 0.26) * c) / (cols - 1);
        // alternate warm/cool cans for variety
        const canMat = (r + c) % 2 === 0 ? this.materials.litWindowWarm : this.materials.litWindowCool;
        group.add(
          this.mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8),
            canMat,
            [px, shelfY, frontZ - 0.05]
          )
        );
      }
    }

    // 6) Small kanjiRed sign on the header / upper face ----------------------
    group.add(
      this.mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.05),
        this.materials.kanjiRed,
        [cx + unitW * 0.28, headerY, frontZ + 0.04]
      )
    );

    // 7) Selection / button column down the right side of the front ---------
    const btnCol = cx + unitW * 0.5 - 0.07;
    for (let b = 0; b < 3; b += 1) {
      const btnY = winY - winH * 0.3 + b * 0.16;
      group.add(
        this.mesh(
          new THREE.BoxGeometry(0.05, 0.05, 0.03),
          b === 0 ? this.materials.neonCyan : this.materials.litWindowWarm,
          [btnCol, btnY, frontZ + 0.02]
        )
      );
    }

    // 8) bright coin-slot / payment glow on the base
    group.add(
      this.mesh(
        new THREE.BoxGeometry(0.1, 0.05, 0.03),
        header,
        [cx + unitW * 0.22, 0.06 + baseH * 0.55, frontZ + 0.05]
      )
    );
    // delivery flap (dark, lower-left)
    group.add(
      this.mesh(
        new THREE.BoxGeometry(0.22, 0.1, 0.03),
        this.materials.towerDark,
        [cx - unitW * 0.18, 0.06 + 0.1, frontZ + 0.05]
      )
    );

    // 9) thin vertical neon seam between this cabinet and the next ----------
    if (i < count - 1) {
      group.add(
        this.mesh(
          new THREE.BoxGeometry(0.02, machineH * 0.84, 0.04),
          glow,
          [cx + pitch * 0.5, 0.06 + machineH * 0.46, frontZ + 0.01]
        )
      );
    }
  }

  this.enableShadows(group);

  return group;
  }

  createTrafficSignal(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_traffic_signal";

    // --- Foundation & cranked L-pole (brushedSteel) ---
    // Bolted base plate so it reads as anchored to the kerb.
    const basePlate = this.mesh(new THREE.BoxGeometry(0.34, 0.07, 0.34), this.materials.towerDark, [0, 0.035, 0]);
    const baseCollar = this.mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.14, 8), this.materials.brushedSteel, [0, 0.14, 0]);
    // Four foundation bolts for low-poly detail.
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      group.add(
        this.mesh(new THREE.BoxGeometry(0.045, 0.05, 0.045), this.materials.brushedSteel, [
          Math.cos(a) * 0.12,
          0.075,
          Math.sin(a) * 0.12
        ])
      );
    }

    // Main vertical mast climbing to the crank.
    const mastH = 4.85;
    const mast = this.mesh(new THREE.CylinderGeometry(0.075, 0.09, mastH, 8), this.materials.brushedSteel, [0, 0.18 + mastH / 2, 0]);

    // Outrigger arm reaching out over the roadside (+Z, toward the road).
    const armReach = 1.05;
    const armY = 4.55;
    const arm = this.mesh(new THREE.CylinderGeometry(0.05, 0.055, armReach, 8), this.materials.brushedSteel, [0, armY, armReach / 2 + 0.06]);
    arm.rotation.x = Math.PI / 2;
    // Cranked elbow gusset where the mast meets the arm.
    const elbow = this.mesh(new THREE.BoxGeometry(0.13, 0.18, 0.13), this.materials.brushedSteel, [0, armY, 0.05]);
    const gusset = this.mesh(new THREE.BoxGeometry(0.06, 0.32, 0.32), this.materials.brushedSteel, [0, armY - 0.18, 0.22]);
    gusset.rotation.x = Math.PI / 4;
    // Short drop bracket holding the housing under the arm tip.
    const armTipZ = armReach + 0.06;
    const dropBracket = this.mesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), this.materials.brushedSteel, [0, armY - 0.13, armTipZ]);

    group.add(basePlate, baseCollar, mast, arm, elbow, gusset, dropBracket);

    // --- Horizontal lamp housing (towerDark) hanging over the road ---
    const housingY = 4.2;
    const housingZ = armTipZ;
    const housing = this.mesh(new THREE.BoxGeometry(1.42, 0.42, 0.3), this.materials.towerDark, [0, housingY, housingZ]);
    // Slim top brow / sun-visor cap.
    const brow = this.mesh(new THREE.BoxGeometry(1.5, 0.06, 0.36), this.materials.towerDark, [0, housingY + 0.24, housingZ + 0.02]);
    // Black back-plate that frames the housing against the sky (visibility plate).
    const backPlate = this.mesh(new THREE.BoxGeometry(1.62, 0.56, 0.05), this.materials.towerDark, [0, housingY, housingZ - 0.16]);
    group.add(housing, brow, backPlate);

    // The three lamps face the road (+Z). Order red-amber-green; red is LIT (brightest).
    const lampFrontZ = housingZ + 0.155;
    const lampDefs: Array<{ x: number; mat: THREE.Material; lit: boolean }> = [
      { x: -0.44, mat: this.materials.signalRed, lit: true },
      { x: 0, mat: this.materials.signalAmber, lit: false },
      { x: 0.44, mat: this.materials.signalGreen, lit: false }
    ];
    for (const lamp of lampDefs) {
      // Recessed dark bezel hood per lamp + individual sun visor.
      const bezel = this.mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 10), this.materials.towerDark, [lamp.x, housingY, lampFrontZ - 0.03]);
      bezel.rotation.x = Math.PI / 2;
      const visor = this.mesh(new THREE.BoxGeometry(0.34, 0.04, 0.16), this.materials.towerDark, [lamp.x, housingY + 0.16, lampFrontZ + 0.02]);
      visor.rotation.x = -0.35;
      // Emissive lens disc.
      const lensR = lamp.lit ? 0.155 : 0.14;
      const lens = this.mesh(new THREE.CylinderGeometry(lensR, lensR, 0.05, 10), lamp.mat, [lamp.x, housingY, lampFrontZ + 0.02]);
      lens.rotation.x = Math.PI / 2;
      group.add(bezel, visor, lens);
      // The lit red lamp gets a faceted glow halo to read as "active".
      if (lamp.lit) {
        const halo = this.mesh(new THREE.IcosahedronGeometry(0.21, 0), lamp.mat, [lamp.x, housingY, lampFrontZ + 0.04]);
        halo.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        group.add(halo);
      }
    }

    // --- Street-name sub-plate (laneWhite) slung under the housing ---
    const plate = this.mesh(new THREE.BoxGeometry(1.15, 0.24, 0.04), this.materials.laneWhite, [0, housingY - 0.42, housingZ + 0.12]);
    const plateFrameTop = this.mesh(new THREE.BoxGeometry(1.2, 0.03, 0.06), this.materials.brushedSteel, [0, housingY - 0.3, housingZ + 0.12]);
    const plateFrameBot = this.mesh(new THREE.BoxGeometry(1.2, 0.03, 0.06), this.materials.brushedSteel, [0, housingY - 0.54, housingZ + 0.12]);
    // Two short hanger straps from housing to plate.
    const strapL = this.mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), this.materials.brushedSteel, [-0.45, housingY - 0.27, housingZ + 0.06]);
    const strapR = this.mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), this.materials.brushedSteel, [0.45, housingY - 0.27, housingZ + 0.06]);
    group.add(plate, plateFrameTop, plateFrameBot, strapL, strapR);

    // --- Pedestrian signal box mounted lower on the mast, facing the road ---
    const pedY = 2.35;
    const pedZ = 0.16;
    const pedBox = this.mesh(new THREE.BoxGeometry(0.4, 0.62, 0.22), this.materials.towerDark, [0, pedY, pedZ]);
    const pedBrow = this.mesh(new THREE.BoxGeometry(0.46, 0.05, 0.26), this.materials.towerDark, [0, pedY + 0.34, pedZ + 0.01]);
    const pedBracket = this.mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), this.materials.brushedSteel, [0, pedY, pedZ - 0.16]);
    // Two stacked pedestrian lenses: top red (stop, lit), bottom green (walk).
    const pedFrontZ = pedZ + 0.115;
    const pedStop = this.mesh(new THREE.BoxGeometry(0.26, 0.2, 0.04), this.materials.signalRed, [0, pedY + 0.14, pedFrontZ]);
    const pedWalk = this.mesh(new THREE.BoxGeometry(0.26, 0.2, 0.04), this.materials.signalGreen, [0, pedY - 0.14, pedFrontZ]);
    const pedStopBezel = this.mesh(new THREE.BoxGeometry(0.32, 0.26, 0.03), this.materials.towerDark, [0, pedY + 0.14, pedFrontZ - 0.02]);
    const pedWalkBezel = this.mesh(new THREE.BoxGeometry(0.32, 0.26, 0.03), this.materials.towerDark, [0, pedY - 0.14, pedFrontZ - 0.02]);
    group.add(pedBox, pedBrow, pedBracket, pedStopBezel, pedWalkBezel, pedStop, pedWalk);

    this.enableShadows(group);

    return group;
  }

  createUtilityPoleWires(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_utility_pole_wires";

    const rust = this.materials.rustSteel;
    const concrete = this.materials.cyberConcrete;
    const steel = this.materials.brushedSteel;
    const wire = this.materials.towerDark;
    const glass = this.materials.darkGlass;
    const amber = this.materials.neonAmber;

    // --- Main pole: a tapered concrete shaft sleeved in a rust steel collar at the base ---
    const poleHeight = 7;
    const pole = this.mesh(new THREE.CylinderGeometry(0.1, 0.16, poleHeight, 8), concrete, [0, poleHeight * 0.5, 0]);
    const baseCollar = this.mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.5, 8), rust, [0, 0.25, 0]);
    const baseBolt = this.mesh(new THREE.BoxGeometry(0.34, 0.06, 0.34), rust, [0, 0.04, 0]);
    const capPlate = this.mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.08, 8), rust, [0, poleHeight - 0.02, 0]);
    group.add(pole, baseCollar, baseBolt, capPlate);

    // Climbing pegs up one side — cluttered hardware detail.
    for (let i = 0; i < 5; i += 1) {
      const py = 1.3 + i * 0.55;
      const side = i % 2 === 0 ? 1 : -1;
      group.add(this.mesh(new THREE.BoxGeometry(0.04, 0.04, 0.34), rust, [side * 0.13, py, 0]));
    }

    // --- Stacked crossarms (brushedSteel) with insulators and short jumper wires ---
    // Each arm sits across the X axis; insulators are little stacked cylinders riding on top.
    const armLevels = [
      { y: poleHeight - 0.45, w: 2.0, n: 4 },
      { y: poleHeight - 1.05, w: 2.4, n: 5 },
      { y: poleHeight - 1.75, w: 1.6, n: 3 }
    ];
    const insulatorXs: { x: number; y: number }[] = [];
    for (const arm of armLevels) {
      const crossarm = this.mesh(new THREE.BoxGeometry(arm.w, 0.1, 0.13), steel, [0, arm.y, 0.02]);
      const armBack = this.mesh(new THREE.BoxGeometry(arm.w * 0.95, 0.07, 0.1), steel, [0, arm.y, -0.12]);
      // Diagonal brace tying the arm back to the pole.
      const braceL = this.mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), steel, [-arm.w * 0.28, arm.y - 0.26, 0.02]);
      braceL.rotation.z = 0.5;
      const braceR = this.mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), steel, [arm.w * 0.28, arm.y - 0.26, 0.02]);
      braceR.rotation.z = -0.5;
      group.add(crossarm, armBack, braceL, braceR);

      for (let i = 0; i < arm.n; i += 1) {
        const ix = -arm.w * 0.5 + (arm.w * (i + 0.5)) / arm.n;
        const pin = this.mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 6), steel, [ix, arm.y + 0.11, 0.02]);
        const insulator = this.mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.13, 6), glass, [ix, arm.y + 0.22, 0.02]);
        const insulatorCap = this.mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.06, 6), glass, [ix, arm.y + 0.31, 0.02]);
        group.add(pin, insulator, insulatorCap);
        insulatorXs.push({ x: ix, y: arm.y + 0.28 });
      }
    }

    // --- Grey transformer cans (cyberConcrete cylinders) hung off the pole ---
    const transformerY = poleHeight - 2.6;
    const transformerA = this.mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.72, 10), concrete, [0.34, transformerY, 0.18]);
    const transformerB = this.mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 10), concrete, [-0.34, transformerY - 0.2, 0.16]);
    const transLidA = this.mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.07, 10), rust, [0.34, transformerY + 0.39, 0.18]);
    const transLidB = this.mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.06, 10), rust, [-0.34, transformerY + 0.13, 0.16]);
    // Mounting brackets clamping the cans to the pole.
    const bracketA = this.mesh(new THREE.BoxGeometry(0.42, 0.06, 0.1), rust, [0.18, transformerY + 0.18, 0.1]);
    const bracketB = this.mesh(new THREE.BoxGeometry(0.42, 0.06, 0.1), rust, [-0.18, transformerY - 0.32, 0.1]);
    // Bushings poking out the tops of the transformers.
    const bushA = this.mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.16, 6), glass, [0.34, transformerY + 0.5, 0.18]);
    const bushB = this.mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.14, 6), glass, [-0.34, transformerY + 0.27, 0.16]);
    group.add(transformerA, transformerB, transLidA, transLidB, bracketA, bracketB, bushA, bushB);

    // --- Junction box (darkGlass) bolted to the pole face ---
    const junctionY = poleHeight - 4.3;
    const junctionBox = this.mesh(new THREE.BoxGeometry(0.36, 0.5, 0.22), glass, [0, junctionY, 0.22]);
    const junctionLid = this.mesh(new THREE.BoxGeometry(0.4, 0.07, 0.24), rust, [0, junctionY + 0.27, 0.22]);
    const junctionConduit = this.mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 6), rust, [0.12, junctionY + 0.7, 0.27]);
    group.add(junctionBox, junctionLid, junctionConduit);

    // --- Small glowing neonAmber address plate near eye level ---
    const plateBack = this.mesh(new THREE.BoxGeometry(0.34, 0.46, 0.04), rust, [0, 1.7, 0.18]);
    const plate = this.mesh(new THREE.BoxGeometry(0.28, 0.4, 0.03), amber, [0, 1.7, 0.205]);
    group.add(plateBack, plate);

    // --- Sagging catenary wires: long thin towerDark boxes angled toward the next pole (+Z) ---
    // Each spans from an insulator on this pole and dips forward into the distance.
    const span = 5.4;
    for (let i = 0; i < insulatorXs.length; i += 1) {
      const src = insulatorXs[i];
      // Stagger the drop so wires sag at slightly different heights — messy silhouette.
      const drop = 0.6 + ((i * 0.13) % 0.7);
      const midY = src.y - drop * 0.45;
      const wireMesh = this.mesh(new THREE.BoxGeometry(0.02, 0.02, span), wire, [src.x * 0.7, midY, span * 0.5 + 0.1]);
      // Tilt the wire downward as it heads to the far (lower) pole, plus a touch of lateral fan.
      wireMesh.rotation.x = -0.12 - (i % 3) * 0.015;
      wireMesh.rotation.y = (src.x > 0 ? -1 : 1) * 0.04;
      group.add(wireMesh);
    }

    // A couple of heavier feeder lines arcing across the very top.
    for (let i = 0; i < 2; i += 1) {
      const fy = poleHeight - 0.6 - i * 0.5;
      const feeder = this.mesh(new THREE.BoxGeometry(0.035, 0.035, span + 0.6), wire, [(i === 0 ? -0.6 : 0.6), fy - 0.2, span * 0.5]);
      feeder.rotation.x = -0.1;
      group.add(feeder);
    }

    // Stray service drop sagging steeply toward a building behind (−Z) for clutter.
    const serviceDrop = this.mesh(new THREE.BoxGeometry(0.018, 0.018, 2.4), wire, [0.2, poleHeight - 2.0, -1.0]);
    serviceDrop.rotation.x = 0.55;
    group.add(serviceDrop);

    this.enableShadows(group);
    return group;
  }

  createConcreteSteelBarrier(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_concrete_steel_barrier";

    const length = 4; // tiles continuously along Z
    const halfLen = length / 2;

    // ---- Jersey concrete wall (chamfered profile, base at y=0) ----
    // Wide footing
    const footing = this.mesh(
      new THREE.BoxGeometry(0.5, 0.14, length),
      this.materials.barrierConcrete,
      [0, 0.07, 0]
    );
    // Sloped lower flare (front + back faces are battered via narrower tiers)
    const lowerFlare = this.mesh(
      new THREE.BoxGeometry(0.42, 0.2, length),
      this.materials.barrierConcrete,
      [0, 0.24, 0]
    );
    // Upright body
    const body = this.mesh(
      new THREE.BoxGeometry(0.26, 0.4, length),
      this.materials.barrierConcrete,
      [0, 0.5, 0]
    );
    // Chamfered top cap (rotated box reads as a bevelled crown)
    const cap = this.mesh(
      new THREE.BoxGeometry(0.2, 0.18, length),
      this.materials.barrierConcrete,
      [0, 0.74, 0]
    );
    const capChamferL = this.mesh(new THREE.BoxGeometry(0.13, 0.13, length), this.materials.barrierConcrete, [-0.07, 0.78, 0]);
    capChamferL.rotation.z = Math.PI / 4;
    const capChamferR = this.mesh(new THREE.BoxGeometry(0.13, 0.13, length), this.materials.barrierConcrete, [0.07, 0.78, 0]);
    capChamferR.rotation.z = Math.PI / 4;

    group.add(footing, lowerFlare, body, cap, capChamferL, capChamferR);

    // Faint expansion-joint seams scored across the wall (tile rhythm)
    for (let s = -1; s <= 1; s++) {
      const seam = this.mesh(
        new THREE.BoxGeometry(0.28, 0.34, 0.025),
        this.materials.towerDark,
        [0, 0.5, s * (length / 3)]
      );
      group.add(seam);
    }

    // ---- Double horizontal guardSteel rail on short posts (front, +Z side) ----
    const railZFront = 0.16; // stands proud of the concrete face toward traffic
    const railTopY = 1.0;
    const railBotY = 0.78;

    const railTop = this.mesh(
      new THREE.CylinderGeometry(0.045, 0.045, length, 8),
      this.materials.guardSteel,
      [0, railTopY, railZFront]
    );
    railTop.rotation.x = Math.PI / 2;
    const railBot = this.mesh(
      new THREE.CylinderGeometry(0.045, 0.045, length, 8),
      this.materials.guardSteel,
      [0, railBotY, railZFront]
    );
    railBot.rotation.x = Math.PI / 2;
    group.add(railTop, railBot);

    // Short posts mounting the rails to the wall, evenly spaced
    // (offset toward +Z so the rails visually rest on them)
    const postCount = 5;
    for (let i = 0; i < postCount; i++) {
      const pz = -halfLen + (length * (i + 0.5)) / postCount;
      // upright post
      const post = this.mesh(
        new THREE.BoxGeometry(0.06, 0.34, 0.07),
        this.materials.guardSteel,
        [0, railBotY + 0.08, railZFront - 0.03]
      );
      post.position.z = pz; // keep the post on its run slot, not overwritten above
      // little base plate bolted to the concrete crown
      const plate = this.mesh(
        new THREE.BoxGeometry(0.1, 0.05, 0.11),
        this.materials.guardSteel,
        [0, 0.84, pz]
      );
      group.add(post, plate);
    }

    // ---- Inset reflector dots facing +Z (traffic), alternating red/amber ----
    const reflCount = 6;
    for (let i = 0; i < reflCount; i++) {
      const rz = -halfLen + (length * (i + 0.5)) / reflCount;
      const mat = i % 2 === 0 ? this.materials.reflectorRed : this.materials.reflectorAmber;
      // recessed mount housing on the concrete body
      const housing = this.mesh(
        new THREE.BoxGeometry(0.11, 0.11, 0.04),
        this.materials.towerDark,
        [0, 0.56, rz]
      );
      // glowing reflector face standing slightly proud
      const dot = this.mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.03),
        mat,
        [0, 0.56, rz]
      );
      dot.position.z = rz; // centre the dot on its slot
      group.add(housing, dot);
    }

    // Two larger end-marker reflectors low on the wall to catch headlights
    const endRed = this.mesh(new THREE.BoxGeometry(0.1, 0.06, 0.03), this.materials.reflectorRed, [0, 0.3, halfLen - 0.1]);
    const endAmber = this.mesh(new THREE.BoxGeometry(0.1, 0.06, 0.03), this.materials.reflectorAmber, [0, 0.3, -halfLen + 0.1]);
    group.add(endRed, endAmber);

    this.enableShadows(group);
    return group;
  }

  createNeonSakuraTree(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_neon_sakura_tree";

    // Square planter (planterDark) with a glowing neonCyan rim strip on all four faces.
    group.add(this.mesh(new THREE.BoxGeometry(1.6, 0.42, 1.6), this.materials.planterDark, [0, 0.21, 0]));
    group.add(this.mesh(new THREE.BoxGeometry(1.66, 0.07, 1.66), this.materials.neonCyan, [0, 0.42, 0]));
    group.add(this.mesh(new THREE.BoxGeometry(1.4, 0.16, 1.4), this.materials.planterDark, [0, 0.5, 0]));

    // Dark trunk + a couple of leaning branch stubs (same shape vocabulary as the maple).
    const trunk = this.mesh(new THREE.CylinderGeometry(0.13, 0.22, 2.6, 6), this.materials.towerDark, [0, 1.75, 0]);
    group.add(trunk);
    const branchL = this.mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.05, 5), this.materials.towerDark, [-0.3, 2.55, 0.06]);
    branchL.rotation.z = 0.72;
    const branchR = this.mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.0, 5), this.materials.towerDark, [0.32, 2.6, -0.05]);
    branchR.rotation.z = -0.82;
    const branchF = this.mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.78, 5), this.materials.towerDark, [0.05, 2.78, 0.34]);
    branchF.rotation.x = -0.7;
    group.add(branchL, branchR, branchF);

    // Thin neonPink tube spiralling up the trunk: short box segments stepped around the stem.
    const spiralSegs = 7;
    for (let i = 0; i < spiralSegs; i++) {
      const t = i / (spiralSegs - 1);
      const a = t * Math.PI * 2.4;
      const y = 0.6 + t * 2.0;
      const seg = this.mesh(new THREE.BoxGeometry(0.07, 0.34, 0.07), this.materials.neonPink, [
        Math.cos(a) * 0.22,
        y,
        Math.sin(a) * 0.22
      ]);
      seg.rotation.y = a;
      seg.rotation.z = 0.5;
      group.add(seg);
    }

    // Glowing pink blossom canopy: overlapping faceted Icosahedron(r,0) blobs in sakuraNeon,
    // with a few neonMagenta highlight blobs — reuses the maple blob pattern, randomised per blob.
    const mats = [
      this.materials.sakuraNeon,
      this.materials.sakuraNeon,
      this.materials.sakuraNeon,
      this.materials.neonMagenta
    ];
    const blobs: Array<[number, number, number, number, number]> = [
      [0, 3.05, 0, 0.78, 0],
      [0.5, 3.32, 0.18, 0.6, 1],
      [-0.52, 3.22, -0.16, 0.58, 2],
      [0.08, 3.42, -0.3, 0.54, 0],
      [-0.2, 3.44, 0.28, 0.48, 3],
      [0.36, 2.95, -0.42, 0.46, 1],
      [-0.4, 2.98, 0.4, 0.44, 3],
      [0.22, 3.45, 0.42, 0.42, 2]
    ];
    for (const [x, y, z, r, mi] of blobs) {
      const blob = this.mesh(new THREE.IcosahedronGeometry(r, 0), mats[mi], [x, y, z]);
      blob.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(blob);
    }

    this.enableShadows(group);
    return group;
  }

  createLitGinkgoTree(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_lit_ginkgo_tree";

    // --- Low planter box (square tub) ---------------------------------------
    group.add(
      this.mesh(new THREE.BoxGeometry(1.0, 0.34, 1.0), this.materials.planterDark, [0, 0.17, 0]),
      // Soil cap, slightly inset and darker so the trunk reads as "planted"
      this.mesh(new THREE.BoxGeometry(0.82, 0.06, 0.82), this.materials.towerDark, [0, 0.36, 0])
    );

    // --- Ground-level cool uplight box facing the road ----------------------
    // A flush bar at the front of the planter glowing upward into the canopy.
    const uplight = this.mesh(new THREE.BoxGeometry(0.66, 0.1, 0.16), this.materials.litWindowCool, [0, 0.41, 0.42]);
    uplight.rotation.x = -0.32; // tilt the glowing face up toward the leaves
    group.add(uplight);
    // Two small recessed spots flanking it for extra cool wash
    group.add(
      this.mesh(new THREE.BoxGeometry(0.14, 0.08, 0.14), this.materials.litWindowCool, [-0.34, 0.42, 0.3]),
      this.mesh(new THREE.BoxGeometry(0.14, 0.08, 0.14), this.materials.litWindowCool, [0.34, 0.42, 0.3])
    );

    // --- Slim trunk with a slight taper -------------------------------------
    group.add(
      this.mesh(new THREE.CylinderGeometry(0.08, 0.13, 1.7, 6), this.materials.towerDark, [0, 1.18, 0])
    );
    // Two short upward branches that splay into the crown
    const branchL = this.mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.7, 5), this.materials.towerDark, [-0.18, 1.95, 0.04]);
    branchL.rotation.z = 0.5;
    const branchR = this.mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.7, 5), this.materials.towerDark, [0.2, 2.0, -0.04]);
    branchR.rotation.z = -0.55;
    group.add(branchL, branchR);

    // --- Rounded golden ginkgo canopy: overlapping faceted Icosahedron blobs -
    // Tall, slightly fan-shaped crown of ginkgoNeon emissive gold-yellow leaves.
    const blobs: Array<[number, number, number, number]> = [
      [0, 2.55, 0, 0.62],
      [0.42, 2.78, 0.16, 0.46],
      [-0.44, 2.7, -0.14, 0.45],
      [0.05, 3.0, -0.28, 0.42],
      [-0.18, 3.05, 0.3, 0.4],
      [0.3, 2.45, -0.34, 0.36],
      [-0.3, 2.5, 0.32, 0.34],
      [0.02, 3.28, 0.02, 0.32]
    ];
    for (const [x, y, z, r] of blobs) {
      const leaf = this.mesh(new THREE.IcosahedronGeometry(r, 0), this.materials.ginkgoNeon, [x, y, z]);
      leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(leaf);
    }

    this.enableShadows(group);
    return group;
  }

  createPlanterHedge(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_planter_hedge";

    // --- Concrete trough: a long low planter box with a slightly inset cavity look ---
    // Outer shell built from four thin walls so the top reads as an open trough.
    const length = 3.5;
    const depth = 0.7;
    const wallH = 0.46;
    const wallT = 0.1;
    group.add(
      // base slab
      this.mesh(new THREE.BoxGeometry(length, 0.12, depth), this.materials.barrierConcrete, [0, 0.06, 0]),
      // long front wall (faces +Z / road) — barrierConcrete for a brighter kerb-like face
      this.mesh(new THREE.BoxGeometry(length, wallH, wallT), this.materials.barrierConcrete, [0, 0.23, depth / 2 - wallT / 2]),
      // long back wall — darker so the planter has depth from the front
      this.mesh(new THREE.BoxGeometry(length, wallH, wallT), this.materials.planterDark, [0, 0.23, -depth / 2 + wallT / 2]),
      // short end caps
      this.mesh(new THREE.BoxGeometry(wallT, wallH, depth - wallT * 1.6), this.materials.barrierConcrete, [-length / 2 + wallT / 2, 0.23, 0]),
      this.mesh(new THREE.BoxGeometry(wallT, wallH, depth - wallT * 1.6), this.materials.barrierConcrete, [length / 2 - wallT / 2, 0.23, 0])
    );

    // Dark soil bed sitting inside the trough, just below the rim.
    group.add(this.mesh(new THREE.BoxGeometry(length - wallT * 2, 0.06, depth - wallT * 2), this.materials.planterDark, [0, 0.4, 0]));

    // --- Clipped rectangular hedge: a row of faceted box tops, clustered & jittered ---
    // A continuous low body plus individual clipped crowns so the top reads as a
    // hand-trimmed, faceted rectangular hedge rather than one flat slab.
    // Kept low so the whole prop stays within the ~0.9 m height envelope.
    const hedgeBaseY = 0.43;
    const hedgeBody = this.mesh(
      new THREE.BoxGeometry(length - wallT * 2.4, 0.3, depth - wallT * 2.4),
      this.materials.planterDark,
      [0, hedgeBaseY + 0.15, 0]
    );
    group.add(hedgeBody);

    // Row of clipped crown blocks across the length, each slightly offset/rotated.
    const crowns = 7;
    const spanX = length - 0.5;
    const crownW = spanX / crowns;
    for (let i = 0; i < crowns; i++) {
      const cx = -spanX / 2 + crownW * (i + 0.5);
      const jY = (Math.random() - 0.5) * 0.06;
      const jZ = (Math.random() - 0.5) * 0.05;
      const crown = this.mesh(
        new THREE.BoxGeometry(crownW * 0.94, 0.18 + Math.random() * 0.04, depth - wallT * 2.6),
        this.materials.planterDark,
        [cx, hedgeBaseY + 0.3 + jY, jZ]
      );
      crown.rotation.y = (Math.random() - 0.5) * 0.12;
      crown.rotation.x = (Math.random() - 0.5) * 0.05;
      group.add(crown);
    }

    // A few faceted leaf nubs poking from the foliage front for low-poly greenery texture.
    for (let i = 0; i < 5; i++) {
      const nub = this.mesh(
        new THREE.IcosahedronGeometry(0.09 + Math.random() * 0.04, 0),
        this.materials.planterDark,
        [-spanX / 2 + Math.random() * spanX, hedgeBaseY + 0.2 + Math.random() * 0.14, depth / 2 - 0.16 - Math.random() * 0.06]
      );
      nub.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(nub);
    }

    // --- Thin neonGreen LED accent strip glowing along the front rim ---
    const stripY = wallH - 0.04;
    group.add(this.mesh(new THREE.BoxGeometry(length - 0.06, 0.04, 0.03), this.materials.neonGreen, [0, stripY, depth / 2 - 0.005]));
    // Wrap-around stubs at the two front corners so the strip reads as continuous.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.03, 0.04, depth * 0.4), this.materials.neonGreen, [-length / 2 + 0.005, stripY, depth / 4 - 0.05]),
      this.mesh(new THREE.BoxGeometry(0.03, 0.04, depth * 0.4), this.materials.neonGreen, [length / 2 - 0.005, stripY, depth / 4 - 0.05])
    );

    // A couple of small neonGreen marker dots glowing on the rim top.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.06, 0.04, 0.06), this.materials.neonGreen, [-length / 2 + 0.35, wallH + 0.005, depth / 2 - 0.06]),
      this.mesh(new THREE.BoxGeometry(0.06, 0.04, 0.06), this.materials.neonGreen, [length / 2 - 0.35, wallH + 0.005, depth / 2 - 0.06])
    );

    this.enableShadows(group);
    return group;
  }

  createBroadcastTower(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_broadcast_tower";

    // --- Footprint geometry: four corners that splay wide at the base and pinch
    // inward as the spire tapers to its needle tip. We sample the corner radius at
    // any height so legs, X-bracing and edge-rails all share one silhouette. ---
    const baseHalf = 2.7; // splayed leg footprint (half-width) at y=0
    const deckY = 16.5; // observation deck height
    const trunkTop = 21.0; // where the open lattice trunk ends, mast begins
    const mastTop = 30.0; // needle tip / beacon
    const cornerAt = (y: number): number => {
      // Smooth concave taper (Tokyo-Tower curve) from base to trunk top.
      const t = Math.min(Math.max(y / trunkTop, 0), 1);
      const eased = Math.pow(t, 0.72);
      return baseHalf * (1 - eased) + 0.34 * eased;
    };
    const corners: Array<[number, number]> = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1]
    ];

    // --- Splayed four legs: thick tapered cylinders raking outward to the base. ---
    const legBottom = 5.4;
    for (const [sx, sz] of corners) {
      const topR = cornerAt(legBottom * 0.5);
      const cx = ((baseHalf + topR) * 0.5) * sx;
      const cz = ((baseHalf + topR) * 0.5) * sz;
      const leg = this.mesh(
        new THREE.CylinderGeometry(0.16, 0.34, legBottom + 0.6, 6),
        this.materials.rustSteel,
        [cx, (legBottom + 0.6) * 0.5, cz]
      );
      // Rake each leg outward toward its base corner.
      leg.rotation.x = sz * 0.28;
      leg.rotation.z = -sx * 0.28;
      group.add(leg);
      // A glowing reflectorRed foot pad so the splay reads in fog.
      group.add(
        this.mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), this.materials.reflectorRed, [baseHalf * sx, 0.25, baseHalf * sz])
      );
    }

    // Heavy base ring tying the four feet together (red/steel banded plinth).
    group.add(
      this.mesh(new THREE.BoxGeometry(baseHalf * 2 + 1.0, 0.6, baseHalf * 2 + 1.0), this.materials.brushedSteel, [0, 0.3, 0]),
      this.mesh(new THREE.BoxGeometry(baseHalf * 2 + 0.4, 0.4, baseHalf * 2 + 0.4), this.materials.reflectorRed, [0, 0.78, 0])
    );

    // --- Open lattice trunk: stacked horizontal collar rings + diagonal X-bracing
    // on all four faces, alternately banded reflectorRed and brushedSteel. ---
    const ringYs = [1.4, 4.0, 6.8, 9.6, 12.2, deckY, 18.6, trunkTop];
    for (let i = 0; i < ringYs.length; i += 1) {
      const y = ringYs[i];
      const r = cornerAt(y);
      const bandMat = i % 2 === 0 ? this.materials.brushedSteel : this.materials.reflectorRed;
      // Square collar ring (four thin beams).
      const span = r * 2;
      group.add(
        this.mesh(new THREE.BoxGeometry(span + 0.16, 0.18, 0.14), bandMat, [0, y, r]),
        this.mesh(new THREE.BoxGeometry(span + 0.16, 0.18, 0.14), bandMat, [0, y, -r]),
        this.mesh(new THREE.BoxGeometry(0.14, 0.18, span + 0.16), bandMat, [r, y, 0]),
        this.mesh(new THREE.BoxGeometry(0.14, 0.18, span + 0.16), bandMat, [-r, y, 0])
      );
    }

    // Diagonal cross-bracing between consecutive rings on the front (+Z) and back faces.
    for (let i = 0; i < ringYs.length - 1; i += 1) {
      const yA = ringYs[i];
      const yB = ringYs[i + 1];
      const midY = (yA + yB) * 0.5;
      const segH = yB - yA;
      const r = cornerAt(midY);
      const span = r * 2;
      const diagLen = Math.hypot(span, segH);
      const angle = Math.atan2(span, segH);
      const braceMat = this.materials.brushedSteel;
      for (const faceZ of [r, -r]) {
        const a = this.mesh(new THREE.BoxGeometry(0.1, diagLen, 0.08), braceMat, [0, midY, faceZ]);
        a.rotation.z = angle;
        const b = this.mesh(new THREE.BoxGeometry(0.1, diagLen, 0.08), braceMat, [0, midY, faceZ]);
        b.rotation.z = -angle;
        group.add(a, b);
      }
      for (const faceX of [r, -r]) {
        const a = this.mesh(new THREE.BoxGeometry(0.08, diagLen, 0.1), braceMat, [faceX, midY, 0]);
        a.rotation.x = -angle;
        const b = this.mesh(new THREE.BoxGeometry(0.08, diagLen, 0.1), braceMat, [faceX, midY, 0]);
        b.rotation.x = angle;
        group.add(a, b);
      }
    }

    // --- Lit lattice outline: thin glowing kanjiRed edge-rails tracing the four
    // corners all the way up the tapered trunk, so the silhouette glows in fog. ---
    for (let i = 0; i < ringYs.length - 1; i += 1) {
      const yA = ringYs[i];
      const yB = ringYs[i + 1];
      const midY = (yA + yB) * 0.5;
      const segH = yB - yA + 0.2;
      const rA = cornerAt(yA);
      const rB = cornerAt(yB);
      const r = (rA + rB) * 0.5;
      const lean = Math.atan2(rA - rB, segH); // edge-rails lean inward as it tapers
      for (const [sx, sz] of corners) {
        const rail = this.mesh(new THREE.BoxGeometry(0.07, segH, 0.07), this.materials.kanjiRed, [r * sx, midY, r * sz]);
        rail.rotation.x = -sz * lean;
        rail.rotation.z = sx * lean;
        group.add(rail);
      }
    }

    // --- Mid observation-deck bulge: a wider banded drum with cool-lit windows. ---
    const deckR = cornerAt(deckY) + 1.05;
    group.add(
      // Underside flare + deck floor.
      this.mesh(new THREE.CylinderGeometry(deckR, deckR * 0.55, 0.9, 8), this.materials.brushedSteel, [0, deckY - 0.7, 0]),
      this.mesh(new THREE.CylinderGeometry(deckR + 0.18, deckR + 0.18, 0.3, 8), this.materials.reflectorRed, [0, deckY - 0.15, 0]),
      // Glazed observation body (cool window glow wrapped as a faceted drum).
      this.mesh(new THREE.CylinderGeometry(deckR, deckR, 1.8, 8), this.materials.litWindowCool, [0, deckY + 0.85, 0]),
      // Roof cap + crowning red band.
      this.mesh(new THREE.CylinderGeometry(deckR * 0.55, deckR, 0.7, 8), this.materials.brushedSteel, [0, deckY + 2.1, 0]),
      this.mesh(new THREE.CylinderGeometry(deckR * 0.5, deckR * 0.5, 0.22, 8), this.materials.reflectorRed, [0, deckY + 2.5, 0])
    );
    // Crisp front-facing observation windows (faces +Z toward the road).
    this.addFrontLatticePanel(
      group,
      [0, deckY + 0.85, deckR + 0.04],
      [deckR * 1.4, 1.5],
      this.materials.litWindowCool,
      this.materials.brushedSteel,
      6,
      1
    );
    // Mooring beacons around the deck rim.
    for (const [sx, sz] of corners) {
      group.add(
        this.mesh(new THREE.IcosahedronGeometry(0.16, 0), this.materials.reflectorRed, [
          deckR * 0.78 * sx,
          deckY + 1.95,
          deckR * 0.78 * sz
        ])
      );
    }

    // --- Upper antenna mast: slim tapered spire above the trunk with neon rings. ---
    const mastBaseR = cornerAt(trunkTop);
    group.add(
      this.mesh(new THREE.CylinderGeometry(0.12, mastBaseR, mastTop - trunkTop, 6), this.materials.brushedSteel, [
        0,
        (trunkTop + mastTop) * 0.5,
        0
      ])
    );
    // Glowing neonCyan rings climbing the mast, with kanjiRed accents between.
    const mastBands: Array<[number, THREE.Material]> = [
      [22.0, this.materials.neonCyan],
      [23.4, this.materials.kanjiRed],
      [24.8, this.materials.neonCyan],
      [26.2, this.materials.kanjiRed],
      [27.6, this.materials.neonCyan]
    ];
    for (const [by, mat] of mastBands) {
      const br = 0.12 + mastBaseR * (1 - (by - trunkTop) / (mastTop - trunkTop));
      group.add(this.mesh(new THREE.CylinderGeometry(br, br, 0.22, 6), mat, [0, by, 0]));
    }

    // --- Bright needle tip beacon: layered glow so it punches through the fog. ---
    group.add(
      this.mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.2, 6), this.materials.brushedSteel, [0, mastTop - 0.6, 0]),
      this.mesh(new THREE.IcosahedronGeometry(0.4, 0), this.materials.towerBeacon, [0, mastTop, 0]),
      this.mesh(new THREE.IcosahedronGeometry(0.18, 0), this.materials.reflectorRed, [0, mastTop + 0.45, 0])
    );

    // Skyline landmark: deliberately NO enableShadows (rises out of distant fog).
    return group;
  }

  createDistantTowerCluster(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_distant_tower_cluster";

    // Skyline filler: a tight cluster of simplified silhouette slabs at staggered
    // heights, read as a flat parallax backdrop. Edge neon outlines + a few warm-cool
    // window dots + a red aircraft beacon per tower. Cheap, non-shadow-casting.
    // Each entry: [centreX, width, depth, neonMaterial]; height comes from `heights`.
    const towers: Array<[number, number, number, THREE.Material]> = [
      [-4.4, 3.0, 1.4, this.materials.neonCyan],
      [-1.5, 3.4, 1.6, this.materials.neonMagenta],
      [1.7, 2.6, 1.3, this.materials.neonCyan],
      [4.4, 3.2, 1.5, this.materials.neonMagenta]
    ];
    const heights = [11.5, 18.0, 14.2, 9.2];

    towers.forEach(([cx, w, d, neon], i) => {
      const h = heights[i];
      const halfW = w * 0.5;
      const frontZ = d * 0.5;

      // Main dark slab — the silhouette. Set slightly back so neon edges pop in front.
      group.add(this.mesh(new THREE.BoxGeometry(w, h, d), this.materials.towerDark, [cx, h * 0.5, 0]));

      // A stepped-back upper section on the two taller slabs for skyline variety.
      if (i === 1 || i === 2) {
        const capW = w * 0.6;
        const capH = h * 0.18;
        group.add(this.mesh(new THREE.BoxGeometry(capW, capH, d * 0.8), this.materials.towerDark, [cx, h + capH * 0.5, 0]));
      }

      // Neon edge outlines: thin emissive bars tracing the two front vertical corners
      // plus a crowning horizontal band — pure silhouette glow, no panels.
      const barT = 0.12;
      group.add(
        this.mesh(new THREE.BoxGeometry(barT, h, barT), neon, [cx - halfW, h * 0.5, frontZ]),
        this.mesh(new THREE.BoxGeometry(barT, h, barT), neon, [cx + halfW, h * 0.5, frontZ]),
        this.mesh(new THREE.BoxGeometry(w + barT, barT, barT), neon, [cx, h - 0.4, frontZ])
      );

      // A single vertical accent strip glowing down the centre face.
      group.add(this.mesh(new THREE.BoxGeometry(barT, h * 0.82, 0.06), neon, [cx, h * 0.46, frontZ + 0.02]));

      // Sprinkle of cool window dots scattered up the front face — sparse, cheap.
      const dotRows = Math.floor(h / 2.4);
      for (let r = 0; r < dotRows; r += 1) {
        const dotsThisRow = 1 + Math.floor(Math.random() * 3);
        for (let c = 0; c < dotsThisRow; c += 1) {
          const dy = 1.6 + r * 2.0 + Math.random() * 0.6;
          if (dy > h - 0.8) continue;
          const dx = cx + (Math.random() - 0.5) * (w - 0.6);
          group.add(this.mesh(new THREE.BoxGeometry(0.22, 0.3, 0.04), this.materials.litWindowCool, [dx, dy, frontZ + 0.03]));
        }
      }

      // Red aircraft warning beacon crowning each tower.
      group.add(this.mesh(new THREE.IcosahedronGeometry(0.18, 0), this.materials.towerBeacon, [cx, h + 0.34, 0]));
      group.add(this.mesh(new THREE.BoxGeometry(0.08, 0.34, 0.08), this.materials.towerDark, [cx, h + 0.17, 0]));
    });

    return group;
  }

  createReflectorStrip(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_reflector_strip";

    // Low thin asphalt base spine running 4 m along Z, lifted just above the road.
    const baseY = 0.05;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.15, 0.06, 4.0), this.materials.wetAsphalt, [0, baseY + 0.03, 0]),
      // Brushed-steel mounting rail giving the strip a machined edge.
      this.mesh(new THREE.BoxGeometry(0.09, 0.05, 3.96), this.materials.brushedSteel, [0, baseY + 0.075, 0])
    );

    // Alternating angled cat's-eye reflectors strung along the rail so a glowing
    // dashed line streaks past. Each is a small box tilted to catch the light,
    // amber on one face, red on the other, mounted on a tiny steel stem.
    const studY = baseY + 0.13;
    const count = 10;
    const spacing = 3.6 / (count - 1);
    for (let i = 0; i < count; i++) {
      const z = -1.8 + i * spacing;
      const amber = i % 2 === 0;
      const refMat = amber ? this.materials.reflectorAmber : this.materials.reflectorRed;
      const tilt = (amber ? 1 : -1) * 0.5;

      // Steel stem the lens sits on.
      group.add(this.mesh(new THREE.BoxGeometry(0.07, 0.05, 0.07), this.materials.brushedSteel, [0, baseY + 0.085, z]));

      // Angled emissive lens — alternating tilt makes the dashes flicker as you pass.
      const lens = this.mesh(new THREE.BoxGeometry(0.11, 0.05, 0.16), refMat, [0, studY, z]);
      lens.rotation.x = tilt;
      group.add(lens);

      // Tiny side cheek-reflectors picking out the lane edge in the opposite colour.
      const sideMat = amber ? this.materials.reflectorRed : this.materials.reflectorAmber;
      group.add(
        this.mesh(new THREE.BoxGeometry(0.025, 0.04, 0.08), sideMat, [0.07, studY - 0.01, z]),
        this.mesh(new THREE.BoxGeometry(0.025, 0.04, 0.08), sideMat, [-0.07, studY - 0.01, z])
      );
    }

    // Skip enableShadows — emissive road element.
    return group;
  }

  createDrainGrateKerb(): THREE.Group {
  const group = new THREE.Group();
  group.name = "deco_drain_grate_kerb";

  // The unit runs along Z (parallel to the road). The road/gutter side is +Z;
  // the raised kerb stone sits toward the back (-Z). Overall ~0.6w x 0.4h x 1.4d.

  // --- Gutter pan: a shallow sidewalkGrey channel that the grate drops into ---
  const gutterFloor = this.mesh(new THREE.BoxGeometry(0.46, 0.05, 1.38), this.materials.sidewalkGrey, [0.02, 0.025, 0.18]);
  group.add(gutterFloor);

  // Dark recessed slot beneath the grate — sells depth under the bars.
  const drainSlot = this.mesh(new THREE.BoxGeometry(0.34, 0.12, 1.18), this.materials.cyberConcrete, [0.02, 0.05, 0.2]);
  group.add(drainSlot);

  // --- Raised kerb stone (kerbWhite) on the sidewalk side ---
  const kerbBody = this.mesh(new THREE.BoxGeometry(0.26, 0.34, 1.4), this.materials.kerbWhite, [-0.16, 0.17, 0]);
  const kerbChamfer = this.mesh(new THREE.BoxGeometry(0.2, 0.06, 1.4), this.materials.kerbWhite, [-0.13, 0.37, 0]);
  kerbChamfer.rotation.z = 0.32; // bevelled top lip toward the road
  group.add(kerbBody, kerbChamfer);

  // Expansion joints scored into the kerb face — thin dark gaps every ~0.45 m.
  for (let i = -1; i <= 1; i++) {
    const joint = this.mesh(new THREE.BoxGeometry(0.27, 0.34, 0.02), this.materials.cyberConcrete, [-0.16, 0.17, i * 0.46]);
    group.add(joint);
  }

  // --- Drain grate frame: guardSteel surround sitting in the gutter pan ---
  const frameZ = this.mesh(new THREE.BoxGeometry(0.04, 0.08, 1.22), this.materials.guardSteel, [0.0, 0.12, 0.2]);
  const frameZ2 = this.mesh(new THREE.BoxGeometry(0.04, 0.08, 1.22), this.materials.guardSteel, [0.22, 0.12, 0.2]);
  const frameX1 = this.mesh(new THREE.BoxGeometry(0.26, 0.08, 0.04), this.materials.guardSteel, [0.11, 0.12, 0.81]);
  const frameX2 = this.mesh(new THREE.BoxGeometry(0.26, 0.08, 0.04), this.materials.guardSteel, [0.11, 0.12, -0.41]);
  group.add(frameZ, frameZ2, frameX1, frameX2);

  // Ribbed parallel bars across the slot — thin guardSteel slats, the heart of the grate.
  const barCount = 9;
  for (let i = 0; i < barCount; i++) {
    const z = -0.36 + (i / (barCount - 1)) * 1.12;
    const bar = this.mesh(new THREE.BoxGeometry(0.2, 0.05, 0.04), this.materials.guardSteel, [0.11, 0.135, z]);
    group.add(bar);
  }
  // Two longitudinal stiffeners tying the bars together.
  group.add(
    this.mesh(new THREE.BoxGeometry(0.025, 0.04, 1.1), this.materials.guardSteel, [0.04, 0.125, 0.2]),
    this.mesh(new THREE.BoxGeometry(0.025, 0.04, 1.1), this.materials.guardSteel, [0.18, 0.125, 0.2])
  );

  // --- Tactile-paving truncated-dome strip along the top edge of the kerb ---
  // A small grid of tiny reflectorAmber-tinged domes; warns of the road edge.
  const domeMat = this.materials.reflectorAmber;
  const baseMat = this.materials.sidewalkGrey;
  // Pad the domes sit on, capping the kerb top.
  const tactilePad = this.mesh(new THREE.BoxGeometry(0.2, 0.03, 1.36), baseMat, [-0.16, 0.355, 0]);
  group.add(tactilePad);
  const domeCols = [-0.22, -0.16, -0.1];
  for (let r = 0; r < 9; r++) {
    const dz = -0.6 + r * 0.15;
    for (let c = 0; c < domeCols.length; c++) {
      const jitter = (Math.random() - 0.5) * 0.012;
      const dome = this.mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.03, 6), domeMat, [domeCols[c], 0.385, dz + jitter]);
      group.add(dome);
    }
  }

  // Small amber reflector eye on the road-facing kerb face for night visibility.
  const reflector = this.mesh(new THREE.BoxGeometry(0.02, 0.05, 0.1), this.materials.reflectorAmber, [-0.04, 0.22, 0]);
  group.add(reflector);

  this.enableShadows(group);
  return group;
  }

  createBusLaneMarking(): THREE.Group {
  const group = new THREE.Group();
  group.name = "deco_bus_lane_marking";

  // Painted teal-green longitudinal field laid flat on the tarmac.
  // Sits ~0.012 m above y=0 so cars visibly drive over it without z-fighting.
  const paintY = 0.012;
  const fieldW = 1.5;
  const fieldD = 5.9;

  group.add(
    this.mesh(new THREE.BoxGeometry(fieldW, 0.012, fieldD), this.materials.busLanePaint, [0, paintY, 0])
  );

  // Crisp white hairline border framing the field (thin flat strips, slightly higher).
  const lineY = paintY + 0.004;
  const line = 0.07;
  const halfW = fieldW * 0.5 - line * 0.5;
  const halfD = fieldD * 0.5 - line * 0.5;
  group.add(
    this.mesh(new THREE.BoxGeometry(line, 0.01, fieldD), this.materials.laneWhite, [-halfW, lineY, 0]),
    this.mesh(new THREE.BoxGeometry(line, 0.01, fieldD), this.materials.laneWhite, [halfW, lineY, 0]),
    this.mesh(new THREE.BoxGeometry(fieldW, 0.01, line), this.materials.laneWhite, [0, lineY, halfD]),
    this.mesh(new THREE.BoxGeometry(fieldW, 0.01, line), this.materials.laneWhite, [0, lineY, -halfD])
  );

  // ---- Bus pictogram (flat white boxes), placed toward the front (+Z) of the marking ----
  const glyphY = paintY + 0.006;
  const busZ = 1.55;

  // Bus body silhouette: a rounded-ish block approximated by a wide body + slightly inset roof strip.
  group.add(
    this.mesh(new THREE.BoxGeometry(0.62, 0.008, 1.05), this.materials.laneWhite, [0, glyphY, busZ]),
    this.mesh(new THREE.BoxGeometry(0.5, 0.008, 0.16), this.materials.laneWhite, [0, glyphY, busZ + 0.6])
  );

  // Punch two "window band" + lower "wheel" gaps back out with the teal paint to read as a bus.
  const cutY = glyphY + 0.003;
  group.add(
    // window band gap (upper deck stripe)
    this.mesh(new THREE.BoxGeometry(0.46, 0.006, 0.12), this.materials.busLanePaint, [0, cutY, busZ + 0.28]),
    // door / mid stripe
    this.mesh(new THREE.BoxGeometry(0.46, 0.006, 0.1), this.materials.busLanePaint, [0, cutY, busZ - 0.02]),
    // two wheel arch gaps at the bottom
    this.mesh(new THREE.BoxGeometry(0.12, 0.006, 0.14), this.materials.busLanePaint, [-0.18, cutY, busZ - 0.4]),
    this.mesh(new THREE.BoxGeometry(0.12, 0.006, 0.14), this.materials.busLanePaint, [0.18, cutY, busZ - 0.4])
  );

  // ---- Kanji legend ("バス" feel) rendered as a small grid of flat white strokes toward the rear (-Z) ----
  const kanjiZ = -1.45;
  const stroke = 0.05;
  // First glyph block: a few crossing strokes.
  group.add(
    this.mesh(new THREE.BoxGeometry(0.42, 0.008, stroke), this.materials.laneWhite, [0, glyphY, kanjiZ + 0.34]),
    this.mesh(new THREE.BoxGeometry(stroke, 0.008, 0.34), this.materials.laneWhite, [-0.14, glyphY, kanjiZ + 0.16]),
    this.mesh(new THREE.BoxGeometry(stroke, 0.008, 0.46), this.materials.laneWhite, [0.12, glyphY, kanjiZ + 0.1]),
    this.mesh(new THREE.BoxGeometry(0.26, 0.008, stroke), this.materials.laneWhite, [0.02, glyphY, kanjiZ - 0.18])
  );
  // Second glyph block (just below), a tighter cluster of strokes.
  group.add(
    this.mesh(new THREE.BoxGeometry(0.34, 0.008, stroke), this.materials.laneWhite, [0, glyphY, kanjiZ - 0.62]),
    this.mesh(new THREE.BoxGeometry(stroke, 0.008, 0.3), this.materials.laneWhite, [-0.1, glyphY, kanjiZ - 0.78]),
    this.mesh(new THREE.BoxGeometry(stroke, 0.008, 0.3), this.materials.laneWhite, [0.1, glyphY, kanjiZ - 0.78])
  );

  // ---- Reflector studs: a few amber dots running down each painted edge ----
  const studY = paintY + 0.018;
  for (let i = 0; i < 4; i += 1) {
    const z = -fieldD * 0.36 + (i * fieldD * 0.72) / 3;
    const jitter = (Math.random() - 0.5) * 0.06;
    group.add(
      this.mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.022, 8), this.materials.reflectorAmber, [
        -halfW - 0.02,
        studY,
        z + jitter
      ]),
      this.mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.022, 8), this.materials.reflectorAmber, [
        halfW + 0.02,
        studY,
        z - jitter
      ])
    );
  }

  // Flat ground marking — no shadows.
  return group;
  }

  // ===== 奥山渓谷 Mountain-Forest Valley props (procedural, agent-authored + reviewed) =====
  createSugiCedar(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_sugi_cedar";

    // Dead-straight tapered trunk: thick base, slim top. Centre at y=4.75 so the
    // 9.5 m cylinder runs from the ground (y=0) up to y=9.5 where the crown takes over.
    const trunk = this.mesh(
      new THREE.CylinderGeometry(0.28, 0.55, 9.5, 6),
      this.materials.cedarBark,
      [0, 4.75, 0]
    );
    group.add(trunk);

    // A small flared root collar to seat it in the ground.
    group.add(
      this.mesh(new THREE.CylinderGeometry(0.55, 0.74, 0.5, 6), this.materials.cedarBarkDark, [0, 0.25, 0])
    );

    // 2-3 darker vertical bark strips, hugging the trunk surface and tapering with it.
    // Each is a thin box rotated to sit around the hexagonal trunk.
    const strips: Array<[number, number, number]> = [
      [0.46, 0.0, 0.0],   // facing +X
      [-0.32, 0.0, 0.34], // back-left
      [0.1, 0.0, -0.5]    // back-right
    ];
    for (const [bx, , bz] of strips) {
      const strip = this.mesh(
        new THREE.BoxGeometry(0.12, 8.6, 0.16),
        this.materials.cedarBarkDark,
        [bx, 4.7, bz]
      );
      strip.rotation.y = Math.atan2(bx, bz);
      // a barely-perceptible taper-following lean inward as it rises
      strip.rotation.x = (Math.random() - 0.5) * 0.04;
      group.add(strip);
    }

    // A few short, downward-drooping branch cylinders near the crown base (y~7-8),
    // leaning OUTWARD and DOWN so nothing reaches across the road. Kept short.
    const droops: Array<[number, number, number, number, number]> = [
      // x, y, z, zRot(drape), yRot(spread)
      [0.0, 7.4, 0.36, -0.5, 0.0],
      [0.34, 7.0, -0.16, -0.7, -1.9],
      [-0.36, 7.7, -0.1, 0.7, 1.9],
      [-0.06, 8.1, -0.4, 0.55, 3.0]
    ];
    for (const [dx, dy, dz, zr, yr] of droops) {
      const branch = this.mesh(
        new THREE.CylinderGeometry(0.04, 0.07, 0.85, 5),
        this.materials.cedarBarkDark,
        [dx, dy, dz]
      );
      branch.rotation.y = yr;
      branch.rotation.z = zr;
      group.add(branch);
      // A little dark-canopy tuft drooping at the branch tip.
      group.add(
        this.mesh(
          new THREE.IcosahedronGeometry(0.42, 0),
          this.materials.sugiCanopyDeep,
          [dx + Math.sin(yr) * 0.5, dy - 0.45, dz + Math.cos(yr) * 0.5]
        )
      );
    }

    // Crown: a TALL NARROW conical column (ovoid spire) of overlapping faceted blobs.
    // Radius shrinks from ~0.9 at the base to ~0.5 at the tip; stacked y~7.0 -> y~13.5.
    // Slight x/z jitter (all within ~1.2 m of centre) gives a craggy cedar silhouette.
    // [x, y, z, r, matIndex]  (0 = sugiCanopy bright, 1 = sugiCanopyDeep)
    const mats = [this.materials.sugiCanopy, this.materials.sugiCanopyDeep];
    const blobs: Array<[number, number, number, number, number]> = [
      [0.0, 7.1, 0.0, 0.95, 1],
      [0.42, 7.45, 0.2, 0.78, 0],
      [-0.44, 7.6, -0.18, 0.76, 1],
      [0.18, 8.05, -0.36, 0.82, 0],
      [-0.28, 8.25, 0.34, 0.74, 1],
      [0.36, 8.7, 0.1, 0.78, 0],
      [-0.34, 8.9, -0.24, 0.72, 0],
      [0.1, 9.35, 0.3, 0.74, 1],
      [-0.2, 9.6, -0.3, 0.68, 0],
      [0.28, 9.95, -0.05, 0.7, 1],
      [-0.24, 10.35, 0.22, 0.64, 0],
      [0.16, 10.7, -0.26, 0.66, 1],
      [-0.2, 11.05, 0.08, 0.6, 0],
      [0.18, 11.45, 0.2, 0.58, 1],
      [-0.14, 11.85, -0.16, 0.56, 0],
      [0.1, 12.25, 0.1, 0.54, 1],
      [-0.08, 12.7, -0.08, 0.5, 0],
      [0.04, 13.15, 0.04, 0.5, 1],
      [0.0, 13.55, 0.0, 0.46, 0]
    ];
    for (const [x, y, z, r, mi] of blobs) {
      const blob = this.mesh(new THREE.IcosahedronGeometry(r, 0), mats[mi], [x, y, z]);
      blob.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      group.add(blob);
    }

    // Tall hero tree — deliberately skip enableShadows (per convention for tall trees).
    return group;
  }

  createMountainPine(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_mountain_pine";

    // Lean direction is chosen per-instance and always tilts OUTWARD toward a
    // verge (never inward over the road). Side picks -x or +x; all kink/lean
    // and foliage stay within the prop's own ~1.4 m footprint.
    const side = Math.random() < 0.5 ? -1 : 1;
    const lean = (0.05 + Math.random() * 0.04) * side;

    // Lower trunk: tapered cedarBark cylinder rising from the base, leaning out.
    const lowerH = 3.7;
    const lowerTrunk = this.mesh(
      new THREE.CylinderGeometry(0.27, 0.34, lowerH, 6),
      this.materials.cedarBark,
      [0, lowerH * 0.5, 0]
    );
    lowerTrunk.rotation.z = -lean;
    group.add(lowerTrunk);

    // Upper trunk: kinks slightly further outward at the bend, thinning to a
    // craggy red-pine crown. Offset so the two segments meet at the kink.
    const upperH = 3.4;
    const kinkX = -lean * lowerH * 0.5;
    const upperTrunk = this.mesh(
      new THREE.CylinderGeometry(0.2, 0.27, upperH, 6),
      this.materials.cedarBark,
      [kinkX - lean * 0.55, lowerH + upperH * 0.5 - 0.1, 0]
    );
    upperTrunk.rotation.z = -(lean + 0.06 * side);
    group.add(upperTrunk);

    // Windswept tiers: each branch is a horizontal cylinder that fans OUTWARD,
    // capped by a flattened wide blob plate. Tiers sit at different heights with
    // sky-mist gaps between them, giving the akamatsu its craggy layered look.
    // Reaches are trimmed so the widest plate stays within ~1.4 m of the trunk
    // (well inside the 3.0-wide footprint — no inward overhang over the road).
    // [trunkY, branchReach(signed outward-biased), plateSpread]
    const tiers: Array<[number, number, number]> = [
      [2.75, 0.78 * side, 1.0],
      [3.85, -0.58 * side, 0.85],
      [4.95, 0.7 * side, 0.78],
      [5.95, -0.4 * side, 0.6]
    ];

    const plateMats = [this.materials.pineCanopy, this.materials.sugiCanopyDeep];

    for (let t = 0; t < tiers.length; t += 1) {
      const [trunkY, reach, spread] = tiers[t];
      // Follow the lean so branches sprout from the actual (kinked) trunk axis.
      const axisX =
        trunkY <= lowerH ? -lean * trunkY : kinkX - (lean + 0.06 * side) * (trunkY - lowerH);
      const tipX = axisX + reach;

      // Branch limb angling up-and-out from the trunk to its plate.
      const limbLen = Math.abs(reach) + 0.25;
      const branch = this.mesh(
        new THREE.CylinderGeometry(0.05, 0.09, limbLen, 5),
        this.materials.cedarBark,
        [axisX + reach * 0.5, trunkY + 0.05, 0]
      );
      branch.rotation.z = reach >= 0 ? -Math.PI / 2 + 0.45 : Math.PI / 2 - 0.45;
      group.add(branch);

      // Flattened plate cluster: 2-3 overlapping wide icosahedron blobs squashed
      // in Y so the tier reads as a windswept horizontal shelf, not a ball.
      const plateBlobs: Array<[number, number, number]> = [
        [tipX, trunkY + 0.12, 0],
        [tipX - reach * 0.32, trunkY + 0.02, reach * 0.22],
        [tipX + reach * 0.06, trunkY + 0.18, -reach * 0.24]
      ];
      for (let b = 0; b < plateBlobs.length; b += 1) {
        const [bx, by, bz] = plateBlobs[b];
        const r = (0.58 - t * 0.07) * spread * (b === 0 ? 1 : 0.78);
        const blob = this.mesh(
          new THREE.IcosahedronGeometry(r, 0),
          plateMats[(t + b) % 2],
          [bx, by, bz]
        );
        blob.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        // Squash vertically into a wide tier plate, widen horizontally (kept
        // modest so the plate stays inside the prop's footprint).
        blob.scale.set(1.2, 0.5, 1.1);
        group.add(blob);
      }
    }

    // Sparse craggy crown cap atop the upper trunk — a small flattened tuft so
    // the silhouette tips out rather than rounding off.
    const crownX = kinkX - (lean + 0.06 * side) * upperH;
    const crown = this.mesh(
      new THREE.IcosahedronGeometry(0.5, 0),
      this.materials.pineCanopy,
      [crownX + 0.3 * side, lowerH + upperH - 0.15, 0]
    );
    crown.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    crown.scale.set(1.15, 0.55, 1.05);
    group.add(crown);

    // Tall tree: deliberately NOT calling enableShadows.
    return group;
  }

  createBambooGrove(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_bamboo_grove";

    // Dense thicket of thin culms packed into a ~1.3 m footprint. Each stalk
    // alternates the two pale-green bamboo materials so the column reads as a
    // luminous, slightly translucent screen of vertical lines.
    const stalkMats = [this.materials.bambooStalk, this.materials.bambooStalkPale];
    const count = 9 + Math.floor(Math.random() * 4); // 9..12 culms

    for (let i = 0; i < count; i++) {
      // Spread the bases over a tight ~1.3 m disc, biased toward a clustered core.
      const ang = Math.random() * Math.PI * 2;
      const rad = 0.12 + Math.random() * 0.5; // keep within the 1.3 m footprint
      const bx = Math.cos(ang) * rad;
      const bz = Math.sin(ang) * rad;
      const h = 3.5 + Math.random() * 1.5; // 3.5..5.0 m
      const mat = stalkMats[i % 2];

      // Slight outward/forward lean + jitter so the grove feels organic but the
      // canopy never sweeps inward over the road.
      const leanZ = (Math.random() - 0.4) * 0.1;
      const leanX = bx * 0.12 + (Math.random() - 0.5) * 0.05;

      const culm = this.mesh(new THREE.CylinderGeometry(0.05, 0.07, h, 6), mat, [bx, h / 2, bz]);
      culm.rotation.z = -leanX;
      culm.rotation.x = leanZ;
      group.add(culm);

      // 3-4 dark node rings clasping the culm at even-ish intervals.
      const rings = 3 + (i % 2);
      for (let r = 0; r < rings; r++) {
        const ny = (h * (r + 1)) / (rings + 1) + (Math.random() - 0.5) * 0.1;
        // Follow the lean so rings stay on the culm as it tilts.
        const ring = this.mesh(
          new THREE.CylinderGeometry(0.075, 0.075, 0.05, 6),
          this.materials.darkBeam,
          [bx - leanX * (ny / h), ny, bz + leanZ * (ny / h)]
        );
        ring.rotation.z = -leanX;
        ring.rotation.x = leanZ;
        group.add(ring);
      }

      // Small fern-green leaf-spray near the crown: 2-3 tiny flattened icos blobs
      // fanning slightly outward from the culm tip.
      const tipX = bx - leanX;
      const tipZ = bz + leanZ;
      const sprays = 2 + (i % 2);
      for (let s = 0; s < sprays; s++) {
        const sa = ang + (s - 0.5) * 1.4 + Math.random() * 0.5;
        const sr = 0.12 + Math.random() * 0.12;
        const lx = tipX + Math.cos(sa) * sr;
        const lz = tipZ + Math.sin(sa) * sr;
        const ly = h - 0.15 - s * 0.18 + Math.random() * 0.1;
        const leaf = this.mesh(
          new THREE.IcosahedronGeometry(0.13 + Math.random() * 0.06, 0),
          this.materials.fernGreen,
          [lx, ly, lz]
        );
        // Flatten into a leaf-spray and randomise orientation per blob.
        leaf.scale.set(1.3, 0.35, 0.8);
        leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        group.add(leaf);
      }
    }

    // Tall thin tree-style prop: intentionally skip enableShadows().
    return group;
  }

  createValleyMapleTree(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_valley_maple_tree";

    // Slender cedarBark trunk: tapers from a wider base up to a thin crown stem.
    const trunk = this.mesh(new THREE.CylinderGeometry(0.12, 0.22, 2.6, 6), this.materials.cedarBark, [0, 1.3, 0]);
    group.add(trunk);

    // Two short branch stubs reaching up-and-out into the canopy (lean OUTWARD, tilt toward the verge).
    const branchL = this.mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.78, 5), this.materials.cedarBark, [-0.24, 2.18, 0.06]);
    branchL.rotation.z = 0.78;
    const branchR = this.mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.72, 5), this.materials.cedarBark, [0.26, 2.28, -0.08]);
    branchR.rotation.z = -0.86;
    group.add(branchL, branchR);

    // Round fiery canopy: 6 overlapping faceted blobs. Mostly mapleEmber/mapleGold (warm
    // crimson-orange) so the red pops as a rare highlight, with a couple mossGreen for depth.
    // Footprint stays narrow (|x| <= ~1.2) so nothing overhangs the road centre.
    const blobs: Array<[number, number, number, number, THREE.Material]> = [
      [0, 2.78, 0, 0.92, this.materials.mapleEmber],
      [0.5, 3.05, 0.18, 0.66, this.materials.mapleGold],
      [-0.52, 2.98, -0.16, 0.64, this.materials.mapleEmber],
      [0.08, 3.34, -0.28, 0.6, this.materials.mapleGold],
      [-0.2, 3.3, 0.26, 0.52, this.materials.mossGreen],
      [0.36, 2.62, -0.4, 0.46, this.materials.mossGreen]
    ];
    for (const [x, y, z, r, mat] of blobs) {
      const blob = this.mesh(new THREE.IcosahedronGeometry(r, 0), mat, [x, y, z]);
      blob.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(blob);
    }

    this.enableShadows(group);
    return group;
  }

  createFernShrub(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_fern_shrub";

    // Tiny earthy root mound the fronds erupt from.
    const mound = this.mesh(new THREE.IcosahedronGeometry(0.16, 0), this.materials.mossGreenDeep, [0, 0.07, 0]);
    mound.scale.set(1.0, 0.55, 1.0);
    mound.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    group.add(mound);

    // Radial rosette of thin elongated fronds splayed outward, tilted up 25-55 deg
    // with a slight forward droop so the clump reads as a faceted fern.
    const fronds = 7;
    const frondMats = [this.materials.fernGreen, this.materials.mossGreen];
    for (let i = 0; i < fronds; i++) {
      const angle = (i / fronds) * Math.PI * 2 + Math.random() * 0.35;
      const tilt = 0.44 + Math.random() * 0.52; // ~25-55 deg from vertical
      const len = 0.62 + Math.random() * 0.16;
      // Place each frond's pivot just outside the mound, leaning the box outward.
      const reach = 0.1 + Math.sin(tilt) * len * 0.28;
      const x = Math.cos(angle) * reach;
      const z = Math.sin(angle) * reach;
      const y = 0.1 + Math.cos(tilt) * len * 0.42;
      const frond = this.mesh(new THREE.BoxGeometry(0.06, len, 0.14), frondMats[i % 2], [x, y, z]);
      // Lean the frond out along its radial direction, then add a slight droop.
      frond.rotation.y = -angle;
      frond.rotation.x = tilt * 0.18; // gentle forward droop
      frond.rotation.z = tilt;        // splay outward from centre
      group.add(frond);
    }

    // 2-3 tiny flattened leaf blobs nestled low for faceted volume.
    const leafSpots: Array<[number, number, number, number]> = [
      [0.12, 0.16, 0.08, 0.15],
      [-0.14, 0.14, -0.06, 0.13],
      [0.02, 0.2, -0.13, 0.12]
    ];
    for (const [x, y, z, r] of leafSpots) {
      const leaf = this.mesh(new THREE.IcosahedronGeometry(r, 0), this.materials.fernGreen, [x, y, z]);
      leaf.scale.set(1.3, 0.4, 1.0);
      leaf.rotation.set(Math.random() * 0.6, Math.random() * Math.PI, Math.random() * 0.6);
      group.add(leaf);
    }

    this.enableShadows(group);
    return group;
  }

  createUndergrowthShrub(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_undergrowth_shrub";

    // Stubby cedar stem barely poking out from under the foliage.
    const stem = this.mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.32, 5), this.materials.cedarBark, [0, 0.16, 0]);
    stem.rotation.y = Math.random() * Math.PI;
    group.add(stem);

    // Rounded leafy mound: overlapping faceted icosahedron blobs across the three
    // green tones so the bush reads soft and clumpy, topping out around ~0.9 m.
    const greens = [this.materials.mossGreen, this.materials.fernGreen, this.materials.mossGreenDeep];
    const blobs: Array<[number, number, number, number, number]> = [
      [0, 0.46, 0, 0.55, 0],
      [0.32, 0.4, 0.18, 0.44, 1],
      [-0.3, 0.42, -0.16, 0.46, 2],
      [0.06, 0.66, -0.1, 0.4, 1]
    ];
    for (const [x, y, z, r, mi] of blobs) {
      const blob = this.mesh(new THREE.IcosahedronGeometry(r * (0.92 + Math.random() * 0.16), 0), greens[mi], [x, y, z]);
      blob.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(blob);
    }

    // A couple of tiny ember berry accents nestled in the leaves.
    const berries: Array<[number, number, number]> = [
      [0.26, 0.52, 0.3],
      [-0.18, 0.58, 0.22]
    ];
    for (const [x, y, z] of berries) {
      const berry = this.mesh(new THREE.IcosahedronGeometry(0.07, 0), this.materials.mapleEmber, [x, y, z]);
      berry.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(berry);
    }

    this.enableShadows(group);
    return group;
  }

  createSusukiGrass(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_susuki_grass";

    // Susuki / pampas tuft: a fan of very thin tapered blades splaying up-and-out
    // from a tight base clump. Blades alternate pale-green and dry-gold; a few are
    // tipped with a small fluffy thatch seed-head. ~1.2 m tall.
    const bladeCount = 9 + Math.floor(Math.random() * 4); // 9-12 blades

    for (let i = 0; i < bladeCount; i += 1) {
      const t = bladeCount === 1 ? 0 : i / (bladeCount - 1);
      // Even fan around the vertical, with small per-blade jitter.
      const azimuth = t * Math.PI * 2 + Math.random() * 0.5;
      const lean = 0.22 + Math.random() * 0.28; // splay outward
      const len = 1.0 + Math.random() * 0.2; // ~1.0-1.2 m (matches spec 1.2)

      const bladeMat = i % 3 === 0 ? this.materials.mapleGold : this.materials.bambooStalkPale;
      const blade = this.mesh(
        new THREE.CylinderGeometry(0.015, 0.03, len, 4),
        bladeMat,
        // Base tucked near origin; pivot lifts the blade so its foot stays low.
        [Math.cos(azimuth) * 0.04, len * 0.5 - 0.02, Math.sin(azimuth) * 0.04]
      );
      // Lean outward along its azimuth (tilt the up-axis away from centre).
      blade.rotation.z = -Math.cos(azimuth) * lean;
      blade.rotation.x = Math.sin(azimuth) * lean;
      group.add(blade);

      // Roughly a third of blades carry a fluffy seed-head plume at the tip.
      if (i % 3 === 1) {
        const head = this.mesh(
          new THREE.BoxGeometry(0.1, 0.16, 0.1),
          this.materials.thatchForest,
          [
            Math.cos(azimuth) * (0.04 + lean * len * 0.5),
            len - 0.08,
            Math.sin(azimuth) * (0.04 + lean * len * 0.5)
          ]
        );
        head.rotation.set(
          Math.random() * 0.6 - 0.3,
          Math.random() * Math.PI,
          Math.random() * 0.6 - 0.3
        );
        group.add(head);
      }
    }

    // A couple of short inner sprigs to thicken the base of the clump.
    for (let j = 0; j < 3; j += 1) {
      const a = j * 2.1 + 0.4;
      const sprig = this.mesh(
        new THREE.CylinderGeometry(0.015, 0.028, 0.55 + Math.random() * 0.2, 4),
        this.materials.bambooStalkPale,
        [Math.cos(a) * 0.05, 0.3, Math.sin(a) * 0.05]
      );
      sprig.rotation.z = -Math.cos(a) * 0.12;
      sprig.rotation.x = Math.sin(a) * 0.12;
      group.add(sprig);
    }

    return group;
  }

  createMossBoulder(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_moss_boulder";

    // Slightly buried: origin a touch below 0 so the rock bottom is hidden in earth.
    const buryY = -0.12;

    // --- Core rock body: 2-3 merged squashed icosahedron lumps in grey wet rock ---
    // Each lump is squashed on Y (~0.8) so the boulder reads low and rounded, and
    // given a random tumble so the facets never line up between neighbours.
    const rockMats = [this.materials.wetRock, this.materials.wetRockDark];
    const lumps: Array<[number, number, number, number, number]> = [
      // x,    y,                  z,     radius, matIndex
      [0.0, buryY + 0.58, 0.0, 1.05, 0],
      [-0.42, buryY + 0.44, -0.18, 0.74, 1],
      [0.46, buryY + 0.46, 0.2, 0.8, 1]
    ];
    for (const [x, y, z, r, mi] of lumps) {
      const lump = this.mesh(new THREE.IcosahedronGeometry(r, 0), rockMats[mi], [x, y, z]);
      lump.scale.y = 0.78 + Math.random() * 0.06; // squashed, slight per-rock variety
      lump.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      group.add(lump);
    }

    // --- Mossy crown: a thin green icos skin capping each main lump's top ---
    // Same centres as the rock lumps but pushed up & scaled flat so only the
    // upper dome wears moss — grey below, green on top.
    const mossMats = [this.materials.mossGreen, this.materials.mossGreenDeep];
    const caps: Array<[number, number, number, number, number]> = [
      [0.0, buryY + 0.8, 0.02, 0.9, 0],
      [-0.42, buryY + 0.62, -0.18, 0.66, 1],
      [0.46, buryY + 0.64, 0.2, 0.7, 0]
    ];
    for (const [x, y, z, r, mi] of caps) {
      const cap = this.mesh(new THREE.IcosahedronGeometry(r, 0), mossMats[mi], [x, y, z]);
      cap.scale.set(1.04, 0.34, 1.04); // thin flattened skin hugging the rock top
      cap.rotation.y = Math.random() * Math.PI;
      group.add(cap);
    }

    // --- Loose moss patches: a few small boxes clinging to the upper faces ---
    // Breaks the cap's silhouette and lets moss creep a little down the shoulders.
    const patches: Array<[number, number, number, number, number, number]> = [
      // x,    y,                 z,     w,    h,    d
      [0.26, buryY + 0.86, 0.38, 0.4, 0.1, 0.32],
      [-0.3, buryY + 0.72, 0.26, 0.34, 0.09, 0.28],
      [0.08, buryY + 0.94, -0.3, 0.44, 0.1, 0.34],
      [-0.5, buryY + 0.56, 0.0, 0.26, 0.08, 0.24]
    ];
    for (let i = 0; i < patches.length; i += 1) {
      const [x, y, z, w, h, d] = patches[i];
      const patch = this.mesh(
        new THREE.BoxGeometry(w, h, d),
        i % 2 === 0 ? this.materials.mossGreen : this.materials.mossGreenDeep,
        [x, y, z]
      );
      patch.rotation.set(
        (Math.random() - 0.5) * 0.3,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.3
      );
      group.add(patch);
    }

    this.enableShadows(group);
    return group;
  }

  createRockCluster(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_rock_cluster";

    // Angular boulders: low-poly icosahedra scattered & flattened so they read as
    // weathered river stones sitting on the verge. [x, y, z, r, materialIndex, mossed]
    const stoneMats = [this.materials.wetRock, this.materials.cliffStone];
    const boulders: Array<[number, number, number, number, number, boolean]> = [
      [-0.62, 0.34, 0.18, 0.52, 0, false],
      [0.18, 0.42, -0.22, 0.62, 1, true],
      [0.7, 0.3, 0.34, 0.44, 0, false],
      [-0.18, 0.26, 0.5, 0.38, 1, true],
      [0.52, 0.22, -0.46, 0.34, 0, false],
      [-0.74, 0.2, -0.34, 0.3, 1, false]
    ];
    for (const [x, y, z, r, mi, mossed] of boulders) {
      const rock = this.mesh(new THREE.IcosahedronGeometry(r, 0), stoneMats[mi], [x, y, z]);
      // Flatten slightly so they nestle into the ground rather than float as spheres,
      // and rotate each freely for facet variety.
      rock.scale.set(1, 0.72 + Math.random() * 0.18, 1);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(rock);
      // A couple wear a small cap of moss perched on the sunlit top.
      if (mossed) {
        const moss = this.mesh(
          new THREE.IcosahedronGeometry(r * 0.62, 0),
          this.materials.mossGreen,
          [x + (Math.random() - 0.5) * 0.12, y + r * 0.4, z + (Math.random() - 0.5) * 0.12]
        );
        moss.scale.set(1, 0.4, 1);
        moss.rotation.y = Math.random() * Math.PI;
        group.add(moss);
      }
    }

    // Loose dirtPath gravel filling the gaps between the boulders, low and flat.
    const gravel: Array<[number, number, number, number, number, number]> = [
      [-0.32, 0.06, -0.02, 0.42, 0.1, 0.34],
      [0.42, 0.05, 0.12, 0.3, 0.08, 0.28],
      [0.0, 0.07, 0.42, 0.34, 0.12, 0.24],
      [-0.5, 0.05, 0.42, 0.22, 0.08, 0.2]
    ];
    for (const [x, y, z, w, h, d] of gravel) {
      const bit = this.mesh(new THREE.BoxGeometry(w, h, d), this.materials.dirtPath, [x, y, z]);
      bit.rotation.y = Math.random() * Math.PI;
      group.add(bit);
    }

    this.enableShadows(group);
    return group;
  }

  createRockCairn(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_rock_cairn";

    // Hand-stacked trail-marker: flattened stones of decreasing size piled into a
    // ~0.8 m tapering tower, each slab nudged off-axis with a small spin so the
    // pile reads as carefully balanced by hand rather than machined.
    // [w, h, d, x, z, yaw, material]
    const stones: Array<[number, number, number, number, number, number, THREE.Material]> = [
      [0.46, 0.16, 0.42, 0.0, 0.0, 0.05, this.materials.wetRock],
      [0.4, 0.13, 0.37, 0.04, -0.02, -0.22, this.materials.cliffStone],
      [0.36, 0.14, 0.33, -0.05, 0.04, 0.34, this.materials.wetRock],
      [0.3, 0.12, 0.28, 0.06, -0.01, -0.18, this.materials.cliffStone],
      [0.24, 0.13, 0.22, -0.03, -0.05, 0.46, this.materials.wetRock],
      [0.18, 0.11, 0.17, 0.02, 0.05, -0.3, this.materials.cliffStone]
    ];

    let y = 0;
    for (const [w, h, d, x, z, yaw, mat] of stones) {
      y += h / 2;
      const stone = this.mesh(new THREE.BoxGeometry(w, h, d), mat, [x, y, z]);
      stone.rotation.y = yaw;
      // Tiny settle-tilt so slabs lean into one another instead of sitting flat.
      stone.rotation.z = (Math.random() - 0.5) * 0.1;
      group.add(stone);
      y += h / 2;
    }

    // A crowning pebble to finish the taper.
    group.add(this.mesh(new THREE.IcosahedronGeometry(0.07, 0), this.materials.wetRock, [0.0, y + 0.05, 0.02]));

    // A little moss clinging to the shaded base stone, facing the verge side.
    const moss1 = this.mesh(new THREE.IcosahedronGeometry(0.1, 0), this.materials.mossGreen, [-0.2, 0.07, -0.16]);
    moss1.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const moss2 = this.mesh(new THREE.IcosahedronGeometry(0.07, 0), this.materials.mossGreen, [0.18, 0.05, -0.2]);
    moss2.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    group.add(moss1, moss2);

    this.enableShadows(group);
    return group;
  }

  createCliffWall(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_cliff_wall";

    // ── Core vertical face: large stacked boxes forming a rugged ~11 m wall.
    // Each block is offset/tilted slightly so the silhouette reads craggy, not
    // like a flat slab. Footprint stays narrow in x (background, off-road left).
    const blocks: Array<[number, number, number, number, number, number, THREE.Material, number]> = [
      // x,    y,    z,    w,    h,    d,    material,                      tilt
      [-0.2, 1.6, -0.1, 5.0, 3.4, 2.7, this.materials.cliffStone, 0.04],
      [0.3, 4.3, 0.15, 4.4, 3.1, 2.4, this.materials.wetRockDark, -0.06],
      [-0.4, 6.9, -0.05, 4.0, 2.9, 2.2, this.materials.cliffStone, 0.05],
      [0.2, 9.2, 0.1, 3.2, 2.6, 1.9, this.materials.wetRockDark, -0.04],
      [-0.1, 10.6, -0.2, 2.4, 1.7, 1.5, this.materials.cliffStone, 0.07]
    ];
    for (const [x, y, z, w, h, d, mat, tilt] of blocks) {
      const block = this.mesh(new THREE.BoxGeometry(w, h, d), mat, [x, y, z]);
      block.rotation.z = tilt;
      block.rotation.y = (Math.random() - 0.5) * 0.18;
      group.add(block);
    }

    // ── Big faceted rock chunks bulging from the face for rugged relief.
    const chunks: Array<[number, number, number, number, THREE.Material]> = [
      [-1.7, 2.4, 1.0, 1.35, this.materials.cliffStone],
      [1.8, 3.6, 0.9, 1.25, this.materials.wetRockDark],
      [-1.4, 5.6, 1.05, 1.2, this.materials.wetRockDark],
      [1.55, 6.8, 0.95, 1.1, this.materials.cliffStone],
      [-0.9, 8.4, 1.1, 1.05, this.materials.wetRockDark],
      [1.1, 9.8, 0.85, 0.85, this.materials.cliffStone],
      [0.0, 11.4, 0.6, 0.8, this.materials.cliffStone],
      [-1.9, 1.0, 1.1, 1.1, this.materials.wetRockDark]
    ];
    for (const [x, y, z, r, mat] of chunks) {
      const chunk = this.mesh(new THREE.IcosahedronGeometry(r, 0), mat, [x, y, z]);
      chunk.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(chunk);
    }

    // ── Thin dark recessed crack grooves cut into the face (front, +Z).
    const cracks: Array<[number, number, number, number, number]> = [
      [-0.6, 4.4, 1.25, 5.2, 0.22],
      [0.9, 7.6, 1.15, 4.0, -0.32],
      [-1.3, 9.6, 1.0, 3.0, 0.18]
    ];
    for (const [x, y, z, len, rot] of cracks) {
      const crack = this.mesh(new THREE.BoxGeometry(0.14, len, 0.18), this.materials.wetRockDark, [x, y, z]);
      crack.rotation.z = rot;
      group.add(crack);
    }

    // ── Mossy ledges: flat slabs jutting from the face where shrubs cling.
    const ledges: Array<[number, number, number, number, number]> = [
      [-1.0, 3.2, 1.35, 2.2, 0.9],
      [1.3, 6.0, 1.25, 1.8, 0.8],
      [-0.7, 8.7, 1.15, 1.6, 0.75]
    ];
    for (const [x, y, z, lw, ld] of ledges) {
      group.add(this.mesh(new THREE.BoxGeometry(lw, 0.28, ld), this.materials.mossGreen, [x, y, z]));
    }

    // ── Sugi shrub blobs clinging to the ledges (faceted foliage).
    const shrubs: Array<[number, number, number, number]> = [
      [-1.05, 3.7, 1.45, 0.62],
      [-0.6, 3.55, 1.3, 0.42],
      [1.35, 6.45, 1.35, 0.55],
      [1.0, 6.3, 1.2, 0.38],
      [-0.65, 9.15, 1.25, 0.5]
    ];
    for (const [x, y, z, r] of shrubs) {
      const shrub = this.mesh(new THREE.IcosahedronGeometry(r, 0), this.materials.sugiCanopy, [x, y, z]);
      shrub.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(shrub);
    }

    // Background hero cliff — skip enableShadows per camera/shadow conventions.
    return group;
  }

  createRiverSegment(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_river_segment";

    // HERO rushing mountain river. Origin at base centre; flows along local Z (length 12),
    // ~5 m wide, only ~0.3 m thick. The layout drops this low + off-road to the left.
    const water = this.materials.riverWater;
    const deep = this.materials.riverWaterDeep;
    const foam = this.materials.riverFoam;
    const rock = this.materials.wetRock;

    // Deep base slab: the full riverbed channel sits lowest so the lighter surface
    // facets read as a shallow rushing skin over darker water.
    const bed = this.mesh(new THREE.BoxGeometry(5.0, 0.3, 12.0), deep, [0, 0.15, 0]);
    group.add(bed);

    // Broken surface: a run of slightly tilted thin plane facets along the current so
    // the water never reads as one dead flat board. Alternate lateral banking + pitch
    // down the slope, and nudge the side facets toward their bank.
    const facets: Array<[number, number, number, number, number, number, number, number]> = [
      // x,    z,     w,    d,    tiltX,  tiltZ,  y,    matIsDeep(0=water)
      [-1.5, -5.2, 1.7, 2.6, 0.05, 0.07, 0.32, 0],
      [1.4, -5.0, 1.8, 2.5, -0.06, -0.05, 0.31, 0],
      [0.1, -2.6, 2.2, 2.7, 0.07, 0.02, 0.33, 0],
      [-1.6, -0.2, 1.6, 2.6, 0.04, 0.08, 0.32, 1],
      [1.5, 0.1, 1.7, 2.5, -0.05, -0.06, 0.31, 0],
      [-0.1, 2.5, 2.3, 2.8, 0.08, -0.01, 0.33, 0],
      [1.5, 4.9, 1.7, 2.6, -0.06, -0.07, 0.32, 1],
      [-1.5, 5.1, 1.7, 2.6, 0.06, 0.06, 0.31, 0]
    ];
    for (const [x, z, w, d, tx, tz, y, deepFlag] of facets) {
      const f = this.mesh(new THREE.BoxGeometry(w, 0.06, d), deepFlag ? deep : water, [x, y, z]);
      f.rotation.x = tx;
      f.rotation.z = tz;
      group.add(f);
    }

    // Rapids: a couple of wet-rock stones breaking the surface mid-stream. Faceted icos
    // boulders sitting just proud of the water, randomly rotated for low-poly variety.
    const stones: Array<[number, number, number]> = [
      [-0.9, -3.4, 0.62],
      [1.1, 1.3, 0.7],
      [-0.2, 4.2, 0.52]
    ];
    const boulders: THREE.Vector3[] = [];
    for (const [sx, sz, r] of stones) {
      const stone = this.mesh(new THREE.IcosahedronGeometry(r, 0), rock, [sx, 0.28, sz]);
      stone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      stone.scale.y = 0.7;
      group.add(stone);
      boulders.push(new THREE.Vector3(sx, 0, sz));
    }

    // White-water: bright foam boxes churning just upstream (+Z side) of each rapids stone,
    // plus a scatter of small foam icos crests for spray. lanternEmber-class glow material.
    for (const b of boulders) {
      const crest = this.mesh(new THREE.BoxGeometry(0.95, 0.1, 0.7), foam, [b.x, 0.36, b.z + 0.55]);
      crest.rotation.x = 0.12;
      group.add(crest);
      const wakeL = this.mesh(new THREE.BoxGeometry(0.4, 0.08, 0.9), foam, [b.x - 0.55, 0.35, b.z + 0.2]);
      const wakeR = this.mesh(new THREE.BoxGeometry(0.4, 0.08, 0.9), foam, [b.x + 0.55, 0.35, b.z + 0.2]);
      wakeL.rotation.z = 0.18;
      wakeR.rotation.z = -0.18;
      group.add(wakeL, wakeR);
    }

    // Loose foam spray crests scattered along the fastest centre channel.
    const spray: Array<[number, number, number]> = [
      [-0.6, -4.4, 0.16],
      [0.5, -1.5, 0.2],
      [-0.3, 0.6, 0.15],
      [0.7, 2.0, 0.18],
      [-0.5, 3.3, 0.16],
      [0.2, 5.2, 0.2]
    ];
    for (const [sx, sz, r] of spray) {
      const blob = this.mesh(new THREE.IcosahedronGeometry(r, 0), foam, [sx, 0.37, sz]);
      blob.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(blob);
    }

    // No enableShadows: flat hero water prop placed below road level.
    return group;
  }

  createRapidsRock(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_rapids_rock";

    // Half-sunk mid-river boulder: a big faceted icosahedron core dropped below the
    // waterline so only its crown breaks the surface, with a couple of smaller
    // shoulder blocks clustered against it for an eroded, weather-split silhouette.
    const core = this.mesh(new THREE.IcosahedronGeometry(0.62, 0), this.materials.wetRockDark, [0, -0.12, 0]);
    core.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    group.add(core);

    // Lighter wet-rock highlights catching the sky on the upstream crown.
    const cap = this.mesh(new THREE.IcosahedronGeometry(0.34, 0), this.materials.wetRock, [0.06, 0.34, 0.1]);
    cap.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    group.add(cap);

    const shoulders: Array<[number, number, number, number]> = [
      [-0.38, 0.02, -0.18, 0.3],
      [0.42, -0.04, 0.22, 0.26],
      [0.12, 0.1, -0.36, 0.24]
    ];
    for (const [x, y, z, r] of shoulders) {
      const block = this.mesh(new THREE.IcosahedronGeometry(r, 0), this.materials.wetRock, [x, y, z]);
      block.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(block);
    }

    // White-water wake: low riverFoam wedges (cones laid on their sides, tip pointing
    // downstream toward -Z) fanning out behind the boulder where the current splits.
    const wedges: Array<[number, number, number, number, number, number]> = [
      [0, 0.02, -0.58, 0.34, 0.82, 0],
      [-0.34, 0.0, -0.48, 0.26, 0.7, 0.42],
      [0.34, 0.0, -0.48, 0.26, 0.7, -0.42],
      [-0.16, -0.02, -0.7, 0.2, 0.56, 0.18],
      [0.16, -0.02, -0.7, 0.2, 0.56, -0.18]
    ];
    for (const [x, y, z, r, h, yaw] of wedges) {
      const wedge = this.mesh(new THREE.ConeGeometry(r, h, 5), this.materials.riverFoam, [x, y, z]);
      // Tip the cone forward so it lies flat over the water, apex aimed downstream (-Z).
      wedge.rotation.x = -Math.PI / 2;
      wedge.rotation.z = yaw;
      group.add(wedge);
    }

    // Spray cap: a scatter of tiny riverFoam cubes bursting off the upstream face
    // where the boulder shears the current, giving a frothy crest of churned water.
    const spray: Array<[number, number, number, number]> = [
      [0, 0.5, 0.28, 0.16],
      [-0.22, 0.42, 0.2, 0.12],
      [0.24, 0.44, 0.16, 0.13],
      [0.04, 0.58, 0.04, 0.1],
      [-0.1, 0.34, 0.34, 0.11]
    ];
    for (const [x, y, z, s] of spray) {
      const fleck = this.mesh(new THREE.BoxGeometry(s, s, s), this.materials.riverFoam, [x, y, z]);
      fleck.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(fleck);
    }

    // In-river prop: no shadows (the boulder sits in flat reflective water).
    return group;
  }

  createWaterfall(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_waterfall";

    // Thin wetRockDark backing slab the water cascades against — set back at -Z
    // so the veil reads in front of it. Slightly tapered for a carved-cliff feel.
    group.add(this.mesh(new THREE.BoxGeometry(1.5, 8.0, 0.22), this.materials.wetRockDark, [0, 4.0, -0.18]));
    group.add(this.mesh(new THREE.BoxGeometry(1.1, 3.0, 0.18), this.materials.wetRockDark, [0.12, 6.4, -0.1]));
    group.add(this.mesh(new THREE.BoxGeometry(1.2, 2.4, 0.16), this.materials.wetRockDark, [-0.1, 1.6, -0.12]));

    // Three stepped tiers of the soft emissive waterfallVeil, each slightly
    // offset in x and z so the cascade steps down and outward over rock lips.
    const tiers: Array<[number, number, number, number, number, number]> = [
      // [w, h, x, y, z, ledgeDepth-offset]
      [1.2, 3.4, 0.0, 5.9, 0.02, 0],
      [1.1, 2.8, 0.14, 3.6, 0.07, 0],
      [1.15, 2.6, -0.04, 1.5, 0.12, 0]
    ];
    for (const [w, h, x, y, z] of tiers) {
      group.add(this.mesh(new THREE.BoxGeometry(w, h, 0.2), this.materials.waterfallVeil, [x, y, z]));
    }

    // Dark rock lips/ledges between tiers where the water breaks and steps over.
    group.add(this.mesh(new THREE.BoxGeometry(1.0, 0.22, 0.34), this.materials.wetRockDark, [0.08, 4.7, 0.12]));
    group.add(this.mesh(new THREE.BoxGeometry(1.0, 0.2, 0.34), this.materials.wetRockDark, [0.04, 2.5, 0.18]));

    // Foam splash-blobs at the top lip where water first pours over.
    const lipFoam: Array<[number, number, number, number]> = [
      [-0.32, 7.55, 0.16, 0.3],
      [0.18, 7.62, 0.2, 0.34],
      [0.42, 7.48, 0.12, 0.26],
      [-0.05, 7.7, 0.24, 0.28]
    ];
    for (const [x, y, z, r] of lipFoam) {
      const f = this.mesh(new THREE.IcosahedronGeometry(r, 0), this.materials.riverFoam, [x, y, z]);
      f.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(f);
    }

    // Foaming plunge pool at the base: chunky riverFoam boxes churning where the
    // fall lands, kept inside the prop's own narrow footprint.
    group.add(this.mesh(new THREE.BoxGeometry(1.7, 0.4, 0.9), this.materials.riverFoam, [0, 0.2, 0.34]));
    group.add(this.mesh(new THREE.BoxGeometry(1.2, 0.5, 0.7), this.materials.riverFoam, [-0.12, 0.32, 0.5]));
    group.add(this.mesh(new THREE.BoxGeometry(0.9, 0.36, 0.6), this.materials.riverFoam, [0.34, 0.26, 0.46]));

    // Plunge-pool foam crowns — small bright icosahedrons bursting up from impact.
    const poolFoam: Array<[number, number, number, number]> = [
      [-0.1, 0.5, 0.42, 0.34],
      [0.3, 0.46, 0.5, 0.3],
      [-0.42, 0.44, 0.38, 0.26],
      [0.05, 0.58, 0.6, 0.28]
    ];
    for (const [x, y, z, r] of poolFoam) {
      const f = this.mesh(new THREE.IcosahedronGeometry(r, 0), this.materials.riverFoam, [x, y, z]);
      f.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(f);
    }

    // Drifting mist veil at the base — a soft emissive plane in front of the splash,
    // plus a couple of low mist puffs hugging the pool.
    const baseMist = this.mesh(new THREE.BoxGeometry(1.9, 1.4, 0.06), this.materials.mistVeil, [0, 0.9, 0.62]);
    group.add(baseMist);
    group.add(this.mesh(new THREE.IcosahedronGeometry(0.5, 0), this.materials.mistVeil, [-0.5, 0.7, 0.55]));
    group.add(this.mesh(new THREE.IcosahedronGeometry(0.46, 0), this.materials.mistVeil, [0.55, 0.85, 0.58]));

    // A faint full-height mist plane in front of the whole cascade for atmosphere.
    const frontMist = this.mesh(new THREE.BoxGeometry(1.5, 7.0, 0.05), this.materials.mistVeil, [0, 4.2, 0.42]);
    group.add(frontMist);

    // No enableShadows: tall off-road waterfall against the far cliff.
    return group;
  }

  createSteppingStones(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_stepping_stones";

    // A line of flat-topped stepping stones marching across the river along +X.
    const count = 5 + Math.floor(Math.random() * 3); // 5–7 discs
    const span = 3.6; // keep within the ~4 m local footprint
    const startX = -span * 0.5;
    const step = span / (count - 1);

    for (let i = 0; i < count; i += 1) {
      // Gentle serpentine + size variety so the line never reads as a ruler.
      const x = startX + step * i + (Math.random() - 0.5) * 0.12;
      const z = Math.sin(i * 0.9) * 0.16 + (Math.random() - 0.5) * 0.08;
      const r = 0.42 + Math.random() * 0.12;
      const h = 0.2 + Math.random() * 0.08;
      const yaw = Math.random() * Math.PI * 2;
      const tilt = (Math.random() - 0.5) * 0.06;

      // Alternate the two stone tones for a hand-laid, mottled look.
      const stoneMat = i % 2 === 0 ? this.materials.wetRock : this.materials.cliffStone;

      // Flattened hexagonal disc — the wet stone body, just clearing the surface.
      const stone = this.mesh(new THREE.CylinderGeometry(r * 0.92, r, h, 6), stoneMat, [x, h * 0.5, z]);
      stone.rotation.y = yaw;
      stone.rotation.x = tilt;
      stone.rotation.z = (Math.random() - 0.5) * 0.05;
      group.add(stone);

      // Mossy cap riding the flat top — a thinner, slightly inset hex slab.
      const moss = this.mesh(
        new THREE.CylinderGeometry(r * 0.74, r * 0.8, 0.05, 6),
        this.materials.mossGreen,
        [x, h + 0.018, z]
      );
      moss.rotation.y = yaw + 0.4;
      moss.rotation.x = tilt;
      group.add(moss);

      // Foam ripple lapping the base on the upstream/downstream sides.
      const fLen = r * (1.4 + Math.random() * 0.3);
      const foamFront = this.mesh(
        new THREE.BoxGeometry(fLen, 0.04, 0.14),
        this.materials.riverFoam,
        [x + (Math.random() - 0.5) * 0.08, 0.045, z + r * 0.92]
      );
      foamFront.rotation.y = (Math.random() - 0.5) * 0.3;
      const foamBack = this.mesh(
        new THREE.BoxGeometry(fLen * 0.78, 0.035, 0.12),
        this.materials.riverFoam,
        [x + (Math.random() - 0.5) * 0.08, 0.04, z - r * 0.9]
      );
      foamBack.rotation.y = (Math.random() - 0.5) * 0.3;
      group.add(foamFront, foamBack);
    }

    // A couple of stray foam flecks between stones to knit the crossing together.
    for (let f = 0; f < 3; f += 1) {
      const fx = startX + Math.random() * span;
      group.add(
        this.mesh(
          new THREE.BoxGeometry(0.22 + Math.random() * 0.12, 0.03, 0.1),
          this.materials.riverFoam,
          [fx, 0.035, (Math.random() - 0.5) * 0.5]
        )
      );
    }

    // In the river: no shadow casting.
    return group;
  }

  createForestFootbridge(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_forest_footbridge";

    // The bridge spans the river along its OWN x-axis (~3.5 m). The caller turns
    // it to lie across the water; locally x is the span, z is the deck width.
    const span = 3.5;
    const deckW = 1.1;

    // --- Two stone-based piers (one at each bank) ---
    // wetRock footing sitting in/at the water, capped with a squat darkBeam post.
    for (const sx of [-1, 1]) {
      const px = sx * (span / 2 - 0.32);
      // Mossy wet-rock pier base, slightly irregular per instance.
      const baseH = 0.46 + Math.random() * 0.06;
      const pierBase = this.mesh(
        new THREE.BoxGeometry(0.52, baseH, deckW + 0.12),
        this.materials.wetRock,
        [px, baseH / 2, 0]
      );
      pierBase.rotation.y = (Math.random() - 0.5) * 0.12;
      group.add(pierBase);
      // A second, smaller wet-rock boulder clustered at the footing for a natural look.
      group.add(
        this.mesh(
          new THREE.BoxGeometry(0.3, 0.28, 0.34),
          this.materials.wetRock,
          [px + sx * 0.22, 0.14, deckW * 0.34]
        )
      );
      // darkBeam timber post rising off the stone to carry the deck.
      group.add(
        this.mesh(
          new THREE.BoxGeometry(0.26, 0.5, 0.7),
          this.materials.darkBeam,
          [px, baseH + 0.25, 0]
        )
      );
      // A creeping patch of moss on the cool, damp stone.
      group.add(
        this.mesh(
          new THREE.BoxGeometry(0.4, 0.1, 0.22),
          this.materials.mossGreen,
          [px - sx * 0.06, baseH - 0.03, deckW * 0.3]
        )
      );
    }

    // --- Two long darkBeam stringers under the deck (the bridge's spine) ---
    const stringerY = 1.0;
    for (const sz of [-1, 1]) {
      group.add(
        this.mesh(
          new THREE.BoxGeometry(span + 0.1, 0.16, 0.14),
          this.materials.darkBeam,
          [0, stringerY - 0.12, sz * (deckW / 2 - 0.12)]
        )
      );
    }

    // --- Gently cambered rusticWood plank deck ---
    // A row of planks each lifted slightly toward the centre to arch the deck.
    const plankCount = 11;
    const plankW = 0.27;
    for (let i = 0; i < plankCount; i++) {
      const t = i / (plankCount - 1); // 0..1 across the span
      const x = (t - 0.5) * (span - 0.2);
      // Parabolic camber: highest in the middle, dipping toward the banks.
      const camber = 0.18 * (1 - Math.pow((t - 0.5) * 2, 2));
      const tilt = -((t - 0.5) * 2) * 0.16; // planks tip with the arch
      const plank = this.mesh(
        new THREE.BoxGeometry(plankW, 0.07, deckW),
        this.materials.rusticWood,
        [x, stringerY + camber, 0]
      );
      plank.rotation.z = tilt;
      // Subtle weathered unevenness plank-to-plank.
      plank.rotation.x = (Math.random() - 0.5) * 0.03;
      plank.position.y += (Math.random() - 0.5) * 0.015;
      group.add(plank);
    }

    // --- Handrails with vertical pickets, both sides ---
    const railTopBase = stringerY + 0.62;
    for (const sz of [-1, 1]) {
      const rz = sz * (deckW / 2 - 0.04);
      // Vertical pickets following the cambered deck height.
      const picketCount = 7;
      for (let i = 0; i < picketCount; i++) {
        const t = i / (picketCount - 1);
        const x = (t - 0.5) * (span - 0.5);
        const camber = 0.18 * (1 - Math.pow((t - 0.5) * 2, 2));
        const deckTop = stringerY + camber + 0.035;
        const railTop = railTopBase + camber * 0.85;
        const h = railTop - deckTop;
        group.add(
          this.mesh(
            new THREE.BoxGeometry(0.06, h, 0.06),
            this.materials.rusticWood,
            [x, deckTop + h / 2, rz]
          )
        );
      }
      // Cambered top rail: a few short segments stepped up over the arch.
      const railSegs = 6;
      for (let i = 0; i < railSegs; i++) {
        const t = (i + 0.5) / railSegs;
        const x = (t - 0.5) * (span - 0.3);
        const camber = 0.18 * (1 - Math.pow((t - 0.5) * 2, 2));
        const tilt = -((t - 0.5) * 2) * 0.16;
        const seg = this.mesh(
          new THREE.BoxGeometry((span - 0.3) / railSegs + 0.04, 0.08, 0.09),
          this.materials.rusticWood,
          [x, railTopBase + camber * 0.85, rz]
        );
        seg.rotation.z = tilt;
        group.add(seg);
      }
      // Stubby corner newel posts where the rail meets each bank.
      for (const sx of [-1, 1]) {
        group.add(
          this.mesh(
            new THREE.BoxGeometry(0.1, 0.78, 0.1),
            this.materials.darkBeam,
            [sx * (span / 2 - 0.28), stringerY + 0.32, rz]
          )
        );
      }
    }

    // --- A little moss tucked onto the weathered deck and rail ---
    group.add(
      this.mesh(
        new THREE.BoxGeometry(0.34, 0.04, 0.18),
        this.materials.mossGreen,
        [-0.2 + Math.random() * 0.4, stringerY + 0.21, -(deckW / 2 - 0.18)]
      )
    );

    this.enableShadows(group);
    return group;
  }

  createChayaTeahouse(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_chaya_teahouse";

    // --- 石垣 wetRock stone plinth (the teahouse sits on a raised stone base) ---
    group.add(
      this.mesh(new THREE.BoxGeometry(3.52, 0.34, 2.72), this.materials.wetRock, [0, 0.17, 0]),
      this.mesh(new THREE.BoxGeometry(3.28, 0.12, 2.5), this.materials.wetRock, [0, 0.4, 0])
    );
    // a couple of foundation stones nudging out from the plinth for rustic variety
    group.add(
      this.mesh(new THREE.BoxGeometry(0.5, 0.22, 0.46), this.materials.wetRock, [-1.42, 0.11, 1.18]),
      this.mesh(new THREE.BoxGeometry(0.44, 0.2, 0.4), this.materials.wetRock, [1.5, 0.1, -0.9])
    );

    // --- rusticWood plank walls sitting on the plinth ---
    const wallY = 1.18;
    group.add(
      this.mesh(new THREE.BoxGeometry(3.18, 1.5, 2.36), this.materials.rusticWood, [0, wallY, 0]),
      // back + side faces faintly recessed plank lines (thin darkBeam battens)
      this.mesh(new THREE.BoxGeometry(3.22, 0.06, 2.4), this.materials.darkBeam, [0, 0.9, 0]),
      this.mesh(new THREE.BoxGeometry(3.22, 0.06, 2.4), this.materials.darkBeam, [0, 1.46, 0])
    );

    // --- darkBeam corner posts (four exposed structural columns) ---
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        group.add(
          this.mesh(new THREE.BoxGeometry(0.16, 1.86, 0.16), this.materials.darkBeam, [sx * 1.56, 0.98, sz * 1.16])
        );
      }
    }

    // --- exposed top plate beams running around the eave line ---
    group.add(
      this.mesh(new THREE.BoxGeometry(3.36, 0.14, 0.16), this.materials.darkBeam, [0, 1.96, 1.18]),
      this.mesh(new THREE.BoxGeometry(3.36, 0.14, 0.16), this.materials.darkBeam, [0, 1.96, -1.18]),
      this.mesh(new THREE.BoxGeometry(0.16, 0.14, 2.5), this.materials.darkBeam, [-1.56, 1.96, 0]),
      this.mesh(new THREE.BoxGeometry(0.16, 0.14, 2.5), this.materials.darkBeam, [1.56, 1.96, 0]),
      // a central exposed tie-beam spanning the front opening
      this.mesh(new THREE.BoxGeometry(3.0, 0.12, 0.1), this.materials.darkBeam, [0, 1.74, 1.16])
    );

    // exposed rafter tails poking out under the front eave
    for (const x of [-1.4, -0.7, 0, 0.7, 1.4]) {
      const rafter = this.mesh(new THREE.BoxGeometry(0.08, 0.08, 0.62), this.materials.darkBeam, [x, 2.0, 1.5]);
      rafter.rotation.x = -0.22;
      group.add(rafter);
    }

    // --- 茅葺 DEEP overhanging thatched hipped roof ---
    // wide + deep overhang well beyond the walls, low ridge ratio for a fat thatch cap
    group.add(this.createHippedRoof(4.5, 3.7, 1.18, 1.98, this.materials.thatchForest, 0, 0.34));
    // chunky thatch under-skirt so the eave reads thick from the road
    group.add(
      this.mesh(new THREE.BoxGeometry(4.4, 0.22, 0.3), this.materials.thatchForest, [0, 2.04, 1.7]),
      this.mesh(new THREE.BoxGeometry(4.4, 0.22, 0.3), this.materials.thatchForest, [0, 2.04, -1.7])
    );
    // ridge cap log
    group.add(this.mesh(new THREE.BoxGeometry(1.7, 0.16, 0.2), this.materials.darkBeam, [0, 3.12, 0]));

    // --- tiny smoke-vent box on the ridge ---
    group.add(
      this.mesh(new THREE.BoxGeometry(0.42, 0.3, 0.42), this.materials.thatchForest, [0, 3.32, 0]),
      this.mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), this.materials.darkBeam, [0, 3.5, 0])
    );

    // --- 縁側 engawa veranda: low rusticWood deck facing +Z, with short posts ---
    const deckY = 0.46;
    group.add(
      this.mesh(new THREE.BoxGeometry(3.4, 0.14, 0.92), this.materials.rusticWood, [0, deckY, 1.72]),
      // deck edge fascia
      this.mesh(new THREE.BoxGeometry(3.46, 0.1, 0.08), this.materials.darkBeam, [0, deckY - 0.02, 2.16])
    );
    // plank seams across the deck
    for (const z of [1.46, 1.72, 1.98]) {
      group.add(this.mesh(new THREE.BoxGeometry(3.4, 0.04, 0.03), this.materials.darkBeam, [0, deckY + 0.08, z]));
    }
    // 2-3 short veranda support posts dropping from the deck edge
    for (const x of [-1.5, 0, 1.5]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.12, 0.4, 0.12), this.materials.darkBeam, [x, 0.2, 2.12]));
    }

    // --- warm interior glow: lanternEmber backing behind a paperWindow shoji ---
    // central doorway recess (dark) flanked by two glowing paper windows
    group.add(
      this.mesh(new THREE.BoxGeometry(0.92, 1.16, 0.06), this.materials.darkBeam, [0, 1.04, 1.17]),
      // lanternEmber glow slab sitting just behind the front paper panels
      this.mesh(new THREE.BoxGeometry(2.4, 0.96, 0.04), this.materials.lanternEmber, [0, 1.18, 1.12])
    );
    this.addFrontLatticePanel(group, [-1.02, 1.2, 1.18], [0.78, 0.86], this.materials.paperWindow, this.materials.darkBeam, 3, 2);
    this.addFrontLatticePanel(group, [1.02, 1.2, 1.18], [0.78, 0.86], this.materials.paperWindow, this.materials.darkBeam, 3, 2);

    // --- 暖簾 noren cloth strip hung over the doorway ---
    group.add(
      this.mesh(new THREE.BoxGeometry(0.96, 0.04, 0.06), this.materials.darkBeam, [0, 1.66, 1.2]),
      this.mesh(new THREE.BoxGeometry(0.42, 0.46, 0.03), this.materials.paperWindow, [-0.26, 1.42, 1.21]),
      this.mesh(new THREE.BoxGeometry(0.42, 0.46, 0.03), this.materials.paperWindow, [0.26, 1.42, 1.21])
    );

    // --- hanging lantern under the front eave ---
    group.add(this.createHangingLantern([1.48, 1.66, 1.56], 0.9));

    this.enableShadows(group);
    return group;
  }

  createWaterMillHut(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_water_mill_hut";

    // --- wetRock base / foundation the shed sits on ---
    group.add(
      this.mesh(new THREE.BoxGeometry(2.6, 0.4, 2.8), this.materials.wetRock, [0, 0.2, 0]),
      this.mesh(new THREE.BoxGeometry(0.5, 0.34, 0.5), this.materials.wetRock, [-1.0, 0.17, 1.1]),
      this.mesh(new THREE.BoxGeometry(0.5, 0.34, 0.5), this.materials.wetRock, [1.0, 0.17, -1.1])
    );

    // --- rusticWood plank shed body (~2.4 m) ---
    group.add(
      this.mesh(new THREE.BoxGeometry(2.2, 2.0, 2.4), this.materials.rusticWood, [0, 1.4, 0]),
      // corner posts (darkBeam) ground the box
      this.mesh(new THREE.BoxGeometry(0.16, 2.04, 0.16), this.materials.darkBeam, [-1.04, 1.42, 1.16]),
      this.mesh(new THREE.BoxGeometry(0.16, 2.04, 0.16), this.materials.darkBeam, [1.04, 1.42, 1.16]),
      this.mesh(new THREE.BoxGeometry(0.16, 2.04, 0.16), this.materials.darkBeam, [-1.04, 1.42, -1.16]),
      this.mesh(new THREE.BoxGeometry(0.16, 2.04, 0.16), this.materials.darkBeam, [1.04, 1.42, -1.16]),
      // horizontal plank beams (sill + lintel) on the side faces
      this.mesh(new THREE.BoxGeometry(2.26, 0.12, 2.46), this.materials.darkBeam, [0, 0.5, 0]),
      this.mesh(new THREE.BoxGeometry(2.26, 0.12, 2.46), this.materials.darkBeam, [0, 2.34, 0])
    );

    // --- small plank door on the -Z (away from road) face + a window toward road side ---
    group.add(
      this.mesh(new THREE.BoxGeometry(0.7, 1.2, 0.08), this.materials.darkBeam, [0.0, 1.0, -1.22]),
      this.mesh(new THREE.BoxGeometry(0.5, 0.5, 0.06), this.materials.darkBeam, [-1.13, 1.5, 0.0])
    );

    // --- gable roof (thatchForest) with a rusticWood ridge cap ---
    group.add(
      this.createGableRoof(2.7, 2.9, 0.9, 2.4, this.materials.thatchForest),
      this.mesh(new THREE.BoxGeometry(0.2, 0.16, 3.0), this.materials.rusticWood, [0, 3.24, 0]),
      // exposed rafter ends under the eaves (front)
      this.mesh(new THREE.BoxGeometry(2.5, 0.1, 0.12), this.materials.darkBeam, [0, 2.42, 1.46]),
      this.mesh(new THREE.BoxGeometry(2.5, 0.1, 0.12), this.materials.darkBeam, [0, 2.42, -1.46])
    );

    // --- darkBeam axle protruding to the +Z (river/road-facing) side ---
    const axleY = 1.3;
    const axleZ = 1.55;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.7, 0.22, 0.22), this.materials.darkBeam, [0, axleY, 0.9]),
      ((): THREE.Mesh => {
        const axle = this.mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.4, 8), this.materials.darkBeam, [0, axleY, axleZ]);
        axle.rotation.x = Math.PI / 2;
        return axle;
      })()
    );

    // --- large vertical WATERWHEEL on +Z, in the X-Y plane (faces the road) ---
    const wheelR = 1.0;
    const spokeCount = 8;
    // two hub discs flanking the paddle ring
    for (const hz of [axleZ - 0.34, axleZ + 0.34]) {
      const hub = this.mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 8), this.materials.darkBeam, [0, axleY, hz]);
      hub.rotation.x = Math.PI / 2;
      group.add(hub);
    }
    for (let i = 0; i < spokeCount; i++) {
      const ang = (i / spokeCount) * Math.PI * 2;
      const sx = Math.cos(ang);
      const sy = Math.sin(ang);
      // rusticWood spoke box from hub to rim
      const spoke = this.mesh(
        new THREE.BoxGeometry(0.1, wheelR, 0.1),
        this.materials.rusticWood,
        [sx * wheelR * 0.5, axleY + sy * wheelR * 0.5, axleZ]
      );
      spoke.rotation.z = ang - Math.PI / 2;
      group.add(spoke);
      // paddle box at the rim (slightly tangential)
      const paddle = this.mesh(
        new THREE.BoxGeometry(0.34, 0.12, 0.76),
        this.materials.rusticWood,
        [sx * wheelR, axleY + sy * wheelR, axleZ]
      );
      paddle.rotation.z = ang;
      group.add(paddle);
      // darkBeam rim segment connecting consecutive paddles
      const nextAng = ((i + 0.5) / spokeCount) * Math.PI * 2;
      const rim = this.mesh(
        new THREE.BoxGeometry(0.08, 0.78, 0.12),
        this.materials.darkBeam,
        [Math.cos(nextAng) * wheelR, axleY + Math.sin(nextAng) * wheelR, axleZ]
      );
      rim.rotation.z = nextAng - Math.PI / 2;
      group.add(rim);
    }

    // --- wetRock millrace trough the wheel half-dips into ---
    group.add(
      this.mesh(new THREE.BoxGeometry(0.9, 0.5, 1.5), this.materials.wetRock, [0, 0.25, axleZ + 0.5]),
      this.mesh(new THREE.BoxGeometry(0.7, 0.3, 1.3), this.materials.wetRock, [0, 0.45, axleZ + 0.5]),
      // trough walls
      this.mesh(new THREE.BoxGeometry(0.12, 0.5, 1.5), this.materials.wetRock, [-0.44, 0.45, axleZ + 0.5]),
      this.mesh(new THREE.BoxGeometry(0.12, 0.5, 1.5), this.materials.wetRock, [0.44, 0.45, axleZ + 0.5])
    );

    // --- riverFoam splash boxes where paddles meet the race ---
    group.add(
      this.mesh(new THREE.BoxGeometry(0.6, 0.18, 0.5), this.materials.riverFoam, [0, 0.42, axleZ + 0.2]),
      this.mesh(new THREE.BoxGeometry(0.3, 0.22, 0.3), this.materials.riverFoam, [-0.18, 0.5, axleZ + 0.05]),
      this.mesh(new THREE.BoxGeometry(0.26, 0.16, 0.34), this.materials.riverFoam, [0.2, 0.46, axleZ + 0.35])
    );

    // --- rusticWood flume feeding water from above the wheel ---
    const flume = this.mesh(new THREE.BoxGeometry(0.4, 0.22, 1.3), this.materials.rusticWood, [0, axleY + wheelR - 0.1, axleZ + 0.9]);
    flume.rotation.x = 0.32;
    group.add(
      flume,
      // flume support post
      this.mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), this.materials.darkBeam, [0, 1.0, axleZ + 1.45]),
      // little lip of foam spilling from the flume onto the wheel
      this.mesh(new THREE.BoxGeometry(0.34, 0.14, 0.2), this.materials.riverFoam, [0, axleY + wheelR + 0.05, axleZ + 0.42])
    );

    this.enableShadows(group);
    return group;
  }

  createHokoraShrine(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_hokora_shrine";

    // ----- Stepped wetRock base (two shrinking tiers, the prop sits on top) -----
    group.add(
      this.mesh(new THREE.BoxGeometry(0.9, 0.14, 0.8), this.materials.wetRock, [0, 0.07, 0]),
      this.mesh(new THREE.BoxGeometry(0.74, 0.12, 0.64), this.materials.wetRock, [0, 0.2, 0])
    );
    // A couple of loose facet stones tucked at the base for a hand-stacked read.
    group.add(
      this.mesh(new THREE.IcosahedronGeometry(0.09, 0), this.materials.wetRock, [-0.38, 0.07, 0.3]),
      this.mesh(new THREE.IcosahedronGeometry(0.08, 0), this.materials.wetRock, [0.36, 0.07, -0.28])
    );

    // ----- Shrine body: rusticWood box sat on the base (0.7 x 0.5 x 0.5) -----
    const bodyY = 0.26;
    const bodyH = 0.5;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.7, bodyH, 0.5), this.materials.rusticWood, [0, bodyY + bodyH * 0.5, 0]),
      // darkBeam sill + corner posts to frame the timber.
      this.mesh(new THREE.BoxGeometry(0.74, 0.06, 0.54), this.materials.darkBeam, [0, bodyY + 0.03, 0])
    );
    for (const px of [-0.3, 0.3]) {
      group.add(this.mesh(new THREE.BoxGeometry(0.06, bodyH, 0.06), this.materials.darkBeam, [px, bodyY + bodyH * 0.5, 0.24]));
    }

    // ----- Dark recessed doorway with a faint lanternEmber glow inside -----
    const doorY = bodyY + 0.04;
    const doorH = 0.32;
    // Glow sits deep in the recess so only a faint ember bleeds out of the opening.
    group.add(this.mesh(new THREE.BoxGeometry(0.18, doorH - 0.06, 0.04), this.materials.lanternEmber, [0, doorY + doorH * 0.5, 0.18]));
    // darkBeam doorway frame (jambs + lintel) standing proud of the front face at z=0.25.
    const frontZ = 0.26;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.06, doorH + 0.08, 0.05), this.materials.darkBeam, [-0.14, doorY + doorH * 0.5, frontZ]),
      this.mesh(new THREE.BoxGeometry(0.06, doorH + 0.08, 0.05), this.materials.darkBeam, [0.14, doorY + doorH * 0.5, frontZ]),
      this.mesh(new THREE.BoxGeometry(0.34, 0.06, 0.05), this.materials.darkBeam, [0, doorY + doorH + 0.05, frontZ]),
      this.mesh(new THREE.BoxGeometry(0.34, 0.05, 0.05), this.materials.darkBeam, [0, doorY + 0.025, frontZ])
    );

    // ----- Steep miniature gable roof: darkBeam ridge structure + thatchForest cap -----
    const roofBaseY = bodyY + bodyH;
    group.add(
      this.createGableRoof(0.86, 0.66, 0.3, roofBaseY, this.materials.thatchForest),
      // darkBeam ridge cap + barge boards along the eaves.
      this.mesh(new THREE.BoxGeometry(0.84, 0.05, 0.07), this.materials.darkBeam, [0, roofBaseY + 0.3, 0]),
      this.mesh(new THREE.BoxGeometry(0.9, 0.05, 0.06), this.materials.darkBeam, [0, roofBaseY + 0.02, 0.33]),
      this.mesh(new THREE.BoxGeometry(0.9, 0.05, 0.06), this.materials.darkBeam, [0, roofBaseY + 0.02, -0.33])
    );

    // ----- Tiny shimenawaRope strand strung across the front, just under the eaves -----
    const ropeY = roofBaseY - 0.02;
    const rope = this.mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.66, 6), this.materials.shimenawaRope, [0, ropeY, 0.3]);
    rope.rotation.z = Math.PI * 0.5;
    rope.position.y -= 0.02; // gentle sag toward the centre
    group.add(rope);
    // Three little shide-like rope knots dangling from the strand.
    for (const kx of [-0.22, 0, 0.22]) {
      group.add(this.mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.1, 5), this.materials.shimenawaRope, [kx, ropeY - 0.07, 0.31]));
    }

    // ----- Two mossy stone offering cups flanking the doorway on the base -----
    for (const cx of [-0.26, 0.26]) {
      group.add(
        this.mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.08, 6), this.materials.wetRock, [cx, 0.3, 0.3]),
        // mossy rim accent + tiny rope-tied bundle reading as an offering.
        this.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 6), this.materials.shimenawaRope, [cx, 0.34, 0.3])
      );
    }

    this.enableShadows(group);
    return group;
  }

  createTrailheadTorii(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_trailhead_torii";

    // Two main posts (hashira), ~10 m tall, leaning very slightly inward toward the
    // top like a classic myojin torii. Kept entirely at x=±3.3 so nothing crosses
    // the road centre — only the beams up high span across.
    for (const side of [-1, 1] as const) {
      const post = this.mesh(
        new THREE.CylinderGeometry(0.34, 0.42, 9.6, 10),
        this.materials.toriiVermillion,
        [side * 3.3, 4.8, 0]
      );
      post.rotation.z = side * 0.015;
      group.add(post);

      // Dark weathered base collar (kamebara) wrapping each foot.
      group.add(
        this.mesh(
          new THREE.CylinderGeometry(0.5, 0.56, 0.5, 10),
          this.materials.darkBeam,
          [side * 3.3, 0.25, 0]
        )
      );

      // Mossy green streaks creeping up the base of each post.
      const moss1 = this.mesh(
        new THREE.BoxGeometry(0.7, 1.5, 0.18),
        this.materials.mossGreen,
        [side * 3.3, 1.1, 0.34]
      );
      moss1.rotation.z = side * 0.06;
      const moss2 = this.mesh(
        new THREE.BoxGeometry(0.18, 1.1, 0.7),
        this.materials.mossGreen,
        [side * (3.3 + 0.34), 0.85, 0]
      );
      group.add(moss1, moss2);
    }

    // Lower crossbeam (nuki): runs between the posts. Centred at y=9.6 with height
    // 0.6 -> UNDERSIDE at y=9.3 (well above the y>=9.0 road-clearance rule).
    // Spans only x=±3.3 (length 6.9, a touch past each post).
    const nuki = this.mesh(
      new THREE.BoxGeometry(6.9, 0.6, 0.46),
      this.materials.toriiVermillion,
      [0, 9.6, 0]
    );
    group.add(nuki);

    // The nuki traditionally pierces the posts and pokes out the far side.
    for (const side of [-1, 1] as const) {
      group.add(
        this.mesh(
          new THREE.BoxGeometry(0.55, 0.52, 0.5),
          this.materials.toriiVermillion,
          [side * 3.62, 9.6, 0]
        )
      );
    }

    // Central plaque tablet (gakuzuka) standing between nuki and kasagi.
    group.add(
      this.mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.3),
        this.materials.darkBeam,
        [0, 10.05, 0.06]
      )
    );

    // Upper beam structure (kasagi + shimaki) at ~y=10.5, the widest span, ends at
    // x=±4. Slightly stacked, classic two-tier crown.
    const shimaki = this.mesh(
      new THREE.BoxGeometry(7.8, 0.4, 0.56),
      this.materials.toriiVermillion,
      [0, 10.45, 0]
    );
    group.add(shimaki);
    const kasagi = this.mesh(
      new THREE.BoxGeometry(8.0, 0.46, 0.66),
      this.materials.toriiVermillion,
      [0, 10.82, 0]
    );
    group.add(kasagi);

    // Classic curved-up top-beam ends (sorimukae): short angled tips lifting at each
    // end, capped in dark weathered timber. They stay out at x≈±3.9..±5.0, well
    // clear of road centre.
    for (const side of [-1, 1] as const) {
      const tipUpper = this.mesh(
        new THREE.BoxGeometry(0.9, 0.46, 0.66),
        this.materials.toriiVermillion,
        [side * 4.32, 10.92, 0]
      );
      tipUpper.rotation.z = side * -0.22;
      const tipLower = this.mesh(
        new THREE.BoxGeometry(0.86, 0.4, 0.56),
        this.materials.toriiVermillion,
        [side * 4.24, 10.55, 0]
      );
      tipLower.rotation.z = side * -0.22;
      // Dark end-cap on each curved tip.
      const cap = this.mesh(
        new THREE.BoxGeometry(0.24, 0.5, 0.7),
        this.materials.darkBeam,
        [side * 4.74, 11.06, 0]
      );
      cap.rotation.z = side * -0.22;
      group.add(tipUpper, tipLower, cap);
    }

    // Sacred shimenawa rope strand slung beneath the nuki, sagging gently in the
    // middle. Each strand has radius 0.16, so its centre is kept at y>=9.22 to keep
    // the LOWEST point of the rope at y>=9.06 across x=0 (above the y>=9.0 rule).
    const ropeSegs: Array<[number, number, number, number]> = [
      [-2.6, 9.32, 0.28, 0.16],
      [-1.5, 9.24, 0.36, -0.1],
      [0, 9.22, 0.4, 0],
      [1.5, 9.24, 0.36, 0.1],
      [2.6, 9.32, 0.28, -0.16]
    ];
    for (const [x, y, z, rot] of ropeSegs) {
      const rope = this.mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 1.35, 7),
        this.materials.shimenawaRope,
        [x, y, z]
      );
      rope.rotation.z = Math.PI / 2;
      rope.rotation.y = rot;
      group.add(rope);
    }
    // A thicker bundled knot at the rope's centre. Radius 0.26 -> centre at y=9.32
    // keeps its lowest point at y=9.06, still clear of the road-centre limit.
    group.add(
      this.mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.5, 8),
        this.materials.shimenawaRope,
        [0, 9.32, 0.42]
      )
    );

    return group;
  }

  createShimenawaSacredTree(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_shimenawa_sacred_tree";

    // --- Exposed gnarled roots flaring at the base (kept within ~0.9 m of trunk) ---
    const roots: Array<[number, number, number, number, number]> = [
      [0.62, 0.16, 0.18, 0.55, 0.9],
      [-0.58, 0.14, 0.28, 0.4, -0.85],
      [0.22, 0.13, 0.6, 0.7, 0.5],
      [-0.3, 0.15, -0.55, 0.45, -0.5],
      [0.5, 0.12, -0.42, 0.55, 0.75]
    ];
    for (const [x, y, z, rot, lean] of roots) {
      const root = this.mesh(new THREE.CylinderGeometry(0.1, 0.22, 0.7, 5), this.materials.cedarBark, [x, y, z]);
      root.rotation.set(Math.PI * 0.5 * (lean < 0 ? -0.55 : 0.55), rot, lean * 0.45);
      group.add(root);
    }

    // --- Thick gnarled cedar trunk + a slightly offset upper trunk section for an ancient lean ---
    const trunk = this.mesh(new THREE.CylinderGeometry(0.6, 0.9, 5.5, 7), this.materials.cedarBark, [0, 2.75, 0]);
    group.add(trunk);
    const upperTrunk = this.mesh(new THREE.CylinderGeometry(0.42, 0.62, 1.6, 7), this.materials.cedarBark, [0.12, 5.7, -0.05]);
    upperTrunk.rotation.z = -0.06;
    group.add(upperTrunk);

    // A couple of stubby ancient branch knuckles reaching up into the crown (stay near trunk).
    const knuckleL = this.mesh(new THREE.CylinderGeometry(0.13, 0.22, 1.4, 5), this.materials.cedarBark, [-0.5, 5.0, 0.1]);
    knuckleL.rotation.z = 0.6;
    const knuckleR = this.mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.3, 5), this.materials.cedarBark, [0.55, 5.2, -0.12]);
    knuckleR.rotation.z = -0.7;
    group.add(knuckleL, knuckleR);

    // --- Shimenawa rope ring wrapped around the trunk at ~1.6 m ---
    // Built as a thick torus plus stacked rope-coil boxes so it reads as braided straw.
    const ropeY = 1.6;
    const ropeRing = this.mesh(new THREE.TorusGeometry(0.78, 0.16, 6, 12), this.materials.shimenawaRope, [0, ropeY, 0]);
    ropeRing.rotation.x = Math.PI * 0.5;
    group.add(ropeRing);
    // Tapered coil reads (thicker centre, like a braided shimenawa) stacked just above/below the ring.
    const coilSegs = 8;
    for (let i = 0; i < coilSegs; i += 1) {
      const a = (i / coilSegs) * Math.PI * 2;
      const cr = 0.82;
      const coil = this.mesh(
        new THREE.BoxGeometry(0.26, 0.2, 0.2),
        this.materials.shimenawaRope,
        [Math.cos(a) * cr, ropeY + Math.sin(a * 2) * 0.06, Math.sin(a) * cr]
      );
      coil.rotation.y = -a;
      coil.rotation.z = 0.5;
      group.add(coil);
    }

    // --- Hanging white zig-zag shide paper streamers (folded box strips) around the rope ---
    const shideAngles = [0.35, 1.5, 2.7, 3.9, 5.2];
    for (const a of shideAngles) {
      const sr = 0.84;
      const sx = Math.cos(a) * sr;
      const sz = Math.sin(a) * sr;
      // Three stepped folds descending from the rope, each offset to suggest a zig-zag cut.
      const folds: Array<[number, number, number]> = [
        [0, ropeY - 0.22, 0.14],
        [0.12, ropeY - 0.46, 0],
        [-0.1, ropeY - 0.7, 0.1]
      ];
      for (let f = 0; f < folds.length; f += 1) {
        const [ox, fy, oz] = folds[f];
        const shide = this.mesh(
          new THREE.BoxGeometry(0.2, 0.24, 0.03),
          this.materials.shideWhite,
          [sx + Math.cos(a) * 0.06 + ox * Math.sin(a), fy, sz + Math.sin(a) * 0.06 + oz]
        );
        // Face the streamer outward from the trunk and give each fold a slight kink.
        shide.rotation.y = -a + Math.PI * 0.5;
        shide.rotation.z = (f % 2 === 0 ? 1 : -1) * 0.18;
        group.add(shide);
      }
    }

    // --- Broad ancient crown: overlapping faceted sugiCanopy + mossGreen blobs, all within ~1.8 m of trunk ---
    const crownMats = [
      this.materials.sugiCanopy,
      this.materials.sugiCanopy,
      this.materials.mossGreen,
      this.materials.sugiCanopy
    ];
    const crownBlobs: Array<[number, number, number, number, number]> = [
      [0.1, 7.2, 0, 1.7, 0],
      [1.05, 7.0, 0.25, 1.15, 1],
      [-1.0, 6.9, -0.2, 1.1, 2],
      [0.35, 8.0, -0.45, 1.05, 0],
      [-0.4, 8.15, 0.5, 0.95, 1],
      [0.55, 6.5, 0.7, 0.85, 3],
      [-0.6, 6.4, -0.7, 0.85, 2],
      [0.0, 8.65, 0.1, 0.8, 0]
    ];
    for (const [x, y, z, r, mi] of crownBlobs) {
      const blob = this.mesh(new THREE.IcosahedronGeometry(r, 0), crownMats[mi], [x, y, z]);
      blob.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(blob);
    }

    // --- Moss patches clinging to the base of the trunk and over the roots ---
    const mossPatches: Array<[number, number, number, number]> = [
      [0.55, 0.22, 0.42, 0.34],
      [-0.5, 0.2, 0.3, 0.3],
      [0.2, 0.18, -0.58, 0.32],
      [-0.35, 0.5, 0.62, 0.26],
      [0.4, 0.7, 0.5, 0.22]
    ];
    for (const [x, y, z, r] of mossPatches) {
      const moss = this.mesh(new THREE.IcosahedronGeometry(r, 0), this.materials.mossGreen, [x, y, z]);
      moss.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      moss.scale.y = 0.45;
      group.add(moss);
    }

    // Tall sacred tree: deliberately NOT calling enableShadows.
    return group;
  }

  createMossStoneLantern(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_moss_stone_lantern";

    // Inner stack we tilt (so the returned group's transform stays clean for the caller).
    const stack = new THREE.Group();

    // ---- Stacked stone tiers (base -> shaft -> fire-box -> cap) ----
    // Sunk foot pad in the ground, weathered wetRock.
    stack.add(this.mesh(new THREE.BoxGeometry(0.66, 0.14, 0.66), this.materials.wetRock, [0, 0.07, 0]));

    // Broad plinth, lighter jizoStone.
    stack.add(this.mesh(new THREE.BoxGeometry(0.56, 0.16, 0.56), this.materials.jizoStone, [0, 0.22, 0]));

    // Tapered shaft column (octagonal-ish via cylinder), the slender waist.
    const shaft = this.mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.5, 8), this.materials.wetRock, [0, 0.55, 0]);
    stack.add(shaft);

    // Mid-platform (the dish the fire-box rests on).
    stack.add(this.mesh(new THREE.BoxGeometry(0.46, 0.1, 0.46), this.materials.jizoStone, [0, 0.85, 0]));

    // Fire-box (the light chamber): hollow-looking jizoStone block.
    stack.add(this.mesh(new THREE.BoxGeometry(0.38, 0.34, 0.38), this.materials.jizoStone, [0, 1.07, 0]));
    // Corner posts of the fire-box to read as a windowed cage.
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        stack.add(this.mesh(new THREE.BoxGeometry(0.07, 0.36, 0.07), this.materials.wetRock, [sx * 0.16, 1.07, sz * 0.16]));
      }
    }
    // Warm ember glow box in the front window (+Z, toward road/camera).
    stack.add(this.mesh(new THREE.BoxGeometry(0.2, 0.22, 0.12), this.materials.lanternEmber, [0, 1.07, 0.17]));
    // A fainter back-glow so the side windows read as lit too.
    stack.add(this.mesh(new THREE.BoxGeometry(0.12, 0.2, 0.2), this.materials.lanternEmber, [0, 1.07, -0.02]));

    // Cap / roof stone: wide flared lid sitting on the fire-box.
    stack.add(this.mesh(new THREE.BoxGeometry(0.52, 0.1, 0.52), this.materials.jizoStone, [0, 1.29, 0]));
    // Pyramidal stone roof.
    stack.add(this.mesh(new THREE.ConeGeometry(0.36, 0.22, 4), this.materials.wetRock, [0, 1.45, 0]));
    // Tiny finial knob on top.
    stack.add(this.mesh(new THREE.IcosahedronGeometry(0.06, 0), this.materials.jizoStone, [0, 1.6, 0]));

    // ---- Moss: green patch boxes clinging to cap and base (noticeably mossy) ----
    // Cap moss, draped over the roof shoulders.
    stack.add(this.mesh(new THREE.BoxGeometry(0.3, 0.05, 0.18), this.materials.mossGreen, [0.06, 1.36, 0.18]));
    stack.add(this.mesh(new THREE.BoxGeometry(0.16, 0.05, 0.26), this.materials.mossGreen, [-0.2, 1.34, -0.04]));
    stack.add(this.mesh(new THREE.BoxGeometry(0.14, 0.08, 0.14), this.materials.mossGreen, [0.18, 1.46, -0.14]));
    // Base moss, creeping up the foot and plinth (the dampest, mossiest part).
    stack.add(this.mesh(new THREE.BoxGeometry(0.28, 0.1, 0.14), this.materials.mossGreen, [-0.04, 0.12, 0.27]));
    stack.add(this.mesh(new THREE.BoxGeometry(0.16, 0.12, 0.2), this.materials.mossGreen, [-0.26, 0.16, 0.06]));
    stack.add(this.mesh(new THREE.BoxGeometry(0.2, 0.08, 0.16), this.materials.mossGreen, [0.2, 0.1, -0.2]));
    // A streak of moss climbing the shaft.
    stack.add(this.mesh(new THREE.BoxGeometry(0.08, 0.22, 0.1), this.materials.mossGreen, [-0.16, 0.56, 0.08]));

    // ---- Weathered tilt: lean the whole stack slightly OUTWARD (away from road, -Z),
    // with a touch of sideways list so it reads as old and settling. Applied to the inner
    // stack so the returned group keeps a clean transform for the caller. ----
    stack.rotation.x = -0.06;
    stack.rotation.z = 0.045 + (Math.random() - 0.5) * 0.02;
    group.add(stack);

    this.enableShadows(group);
    return group;
  }

  createJizoCluster(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_jizo_cluster";

    // Low mossy plinth: a flat wetRock slab with a thin mossGreen cap creeping over the top,
    // so the little stone guardians sit on a damp, lichen-softened ledge.
    const plinth = this.mesh(new THREE.BoxGeometry(1.52, 0.12, 0.4), this.materials.wetRock, [0, 0.06, 0]);
    const plinthMoss = this.mesh(new THREE.BoxGeometry(1.46, 0.04, 0.36), this.materials.mossGreen, [0, 0.135, 0.01]);
    // A couple of rounded wetRock cobbles spilling off the front edge for an unkempt roadside look.
    const cobbleL = this.mesh(new THREE.IcosahedronGeometry(0.12, 0), this.materials.wetRock, [-0.6, 0.11, 0.2]);
    cobbleL.rotation.set(0.4, 0.7, 0.2);
    const cobbleR = this.mesh(new THREE.IcosahedronGeometry(0.1, 0), this.materials.wetRock, [0.66, 0.1, 0.16]);
    cobbleR.rotation.set(0.2, 1.1, 0.5);
    const cobbleMossL = this.mesh(new THREE.IcosahedronGeometry(0.07, 0), this.materials.mossGreen, [-0.58, 0.16, 0.22]);
    cobbleMossL.rotation.set(0.6, 0.3, 0.4);
    group.add(plinth, plinthMoss, cobbleL, cobbleR, cobbleMossL);

    // Four small jizo statues in a gentle row across the 1.6 m footprint.
    // [x, baseRot, scale, knitCap?] — tiny per-statue variation so the row feels hand-carved.
    const statues: Array<[number, number, number, boolean]> = [
      [-0.58, 0.12, 0.96, false],
      [-0.2, -0.08, 1.04, true],
      [0.22, 0.05, 1.0, false],
      [0.6, -0.14, 0.9, false]
    ];

    for (const [sx, yaw, s, knitCap] of statues) {
      const statue = new THREE.Group();
      const baseY = 0.18; // sits on the mossy plinth top

      // Stacked stone shaft: a wide footing block + a rounded tapering pillar body.
      const footing = this.mesh(new THREE.BoxGeometry(0.26 * s, 0.08 * s, 0.22 * s), this.materials.jizoStone, [0, baseY + 0.04 * s, 0]);
      const shaft = this.mesh(new THREE.CylinderGeometry(0.11 * s, 0.14 * s, 0.4 * s, 8), this.materials.jizoStone, [0, baseY + 0.28 * s, 0]);
      // Rounded icosahedron head, slightly squashed into a soft pebble of a face.
      const head = this.mesh(new THREE.IcosahedronGeometry(0.15 * s, 0), this.materials.jizoStone, [0, baseY + 0.56 * s, 0]);
      head.scale.set(1.0, 1.1, 0.92);
      head.rotation.set(0.15 + Math.random() * 0.1, Math.random() * Math.PI, 0);
      statue.add(footing, shaft, head);

      // Little red cloth bib wrapped around the shaft/shoulders — a slim box on the +Z front.
      const bib = this.mesh(new THREE.BoxGeometry(0.2 * s, 0.18 * s, 0.06 * s), this.materials.redBib, [0, baseY + 0.34 * s, 0.1 * s]);
      bib.rotation.x = -0.12;
      // A thin red collar boxlet tucked under the chin tying the bib on.
      const collar = this.mesh(new THREE.BoxGeometry(0.18 * s, 0.05 * s, 0.16 * s), this.materials.redBib, [0, baseY + 0.46 * s, 0]);
      statue.add(bib, collar);

      if (knitCap) {
        // One statue wears a knitted cap: a red box pulled over the crown with a little brim.
        const cap = this.mesh(new THREE.BoxGeometry(0.26 * s, 0.13 * s, 0.24 * s), this.materials.redBib, [0, baseY + 0.66 * s, 0]);
        const brim = this.mesh(new THREE.BoxGeometry(0.3 * s, 0.05 * s, 0.28 * s), this.materials.redBib, [0, baseY + 0.59 * s, 0]);
        statue.add(cap, brim);
      }

      // Moss creeping up the base: a small mossGreen blob hugging the footing.
      const baseMoss = this.mesh(new THREE.IcosahedronGeometry(0.1 * s, 0), this.materials.mossGreen, [0.05 * s, baseY + 0.06 * s, 0.06 * s]);
      baseMoss.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      baseMoss.scale.set(1.0, 0.6, 1.0);
      statue.add(baseMoss);

      statue.position.x = sx;
      statue.rotation.y = yaw;
      group.add(statue);
    }

    this.enableShadows(group);
    return group;
  }

  createWoodenSignpost(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_wooden_signpost";

    // Slim roadside trail post: a weathered darkBeam mast with a rusticWood
    // sheath, angled plank arrow-boards bearing recessed darkBeam kanji strips,
    // mossy footing, and a tiny lanternEmber mini-lantern hung off the side.
    const r = () => (Math.random() - 0.5);

    // --- Footing: a low mossy clod and a rusticWood base block at y=0 ---
    group.add(
      this.mesh(new THREE.BoxGeometry(0.34, 0.1, 0.34), this.materials.mossGreen, [0, 0.05, 0]),
      this.mesh(new THREE.BoxGeometry(0.26, 0.12, 0.26), this.materials.mossGreen, [0.04, 0.13, -0.03]),
      this.mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), this.materials.rusticWood, [0, 0.18, 0])
    );

    // --- Main post: dark weathered core + a rusticWood facing plank up front ---
    const post = this.mesh(new THREE.BoxGeometry(0.12, 1.32, 0.12), this.materials.darkBeam, [0, 0.84, 0]);
    post.rotation.y = 0.04;
    group.add(post);
    // Rough-hewn rusticWood facing on the road-facing (+Z) side of the post.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.1, 1.22, 0.04), this.materials.rusticWood, [0, 0.86, 0.07]),
      // A short iron-grey cap so the post-top reads as finished, not cut.
      this.mesh(new THREE.BoxGeometry(0.16, 0.05, 0.16), this.materials.darkBeam, [0, 1.5, 0])
    );

    // --- Two angled plank arrow-boards on alternating sides of the mast ---
    // Each board: a rusticWood plank, a thin recessed darkBeam kanji strip on
    // its face, and a darkBeam peg fixing it to the post. Pointed ends angle
    // slightly down/outward like a real trail marker.
    const boards: Array<[number, number, number]> = [
      // [centreY, sideSign, tilt]
      [1.12, 1, -0.14],
      [0.82, -1, 0.12]
    ];
    for (const [cy, side, tilt] of boards) {
      const plankW = 0.46;
      const cx = side * (0.06 + plankW * 0.5 - 0.03);

      const plank = this.mesh(new THREE.BoxGeometry(plankW, 0.2, 0.06), this.materials.rusticWood, [cx, cy, 0.04]);
      plank.rotation.z = tilt;
      // Splay each board a touch toward the road so the kanji faces the camera.
      plank.rotation.y = side * -0.18;
      group.add(plank);

      // Pointed arrow tip: a small wedge plank at the outer end, same tilt.
      const tip = this.mesh(new THREE.BoxGeometry(0.12, 0.14, 0.06), this.materials.rusticWood, [
        cx + side * (plankW * 0.5 + 0.02),
        cy - side * 0.0,
        0.04
      ]);
      tip.rotation.z = tilt + side * 0.55;
      tip.rotation.y = side * -0.18;
      group.add(tip);

      // Recessed darkBeam strip suggesting carved kanji, set just proud of face.
      const kanji = this.mesh(new THREE.BoxGeometry(plankW * 0.74, 0.12, 0.02), this.materials.darkBeam, [
        cx,
        cy,
        0.075
      ]);
      kanji.rotation.z = tilt;
      kanji.rotation.y = side * -0.18;
      group.add(kanji);

      // Dark fixing peg into the post.
      group.add(
        this.mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), this.materials.darkBeam, [side * 0.07, cy, 0.04])
      );
    }

    // --- Tiny lanternEmber mini-lantern hung off a short darkBeam arm ---
    const armSide = -1;
    group.add(
      this.mesh(new THREE.BoxGeometry(0.16, 0.03, 0.03), this.materials.darkBeam, [armSide * 0.11, 1.28, 0.04]),
      this.mesh(new THREE.BoxGeometry(0.02, 0.06, 0.02), this.materials.darkBeam, [armSide * 0.18, 1.24, 0.04])
    );
    const lantern = this.mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.13, 6),
      this.materials.lanternEmber,
      [armSide * 0.18, 1.15, 0.04]
    );
    group.add(
      lantern,
      // little dark caps top and bottom of the lantern
      this.mesh(new THREE.BoxGeometry(0.11, 0.02, 0.11), this.materials.darkBeam, [armSide * 0.18, 1.22, 0.04]),
      this.mesh(new THREE.BoxGeometry(0.09, 0.02, 0.09), this.materials.darkBeam, [armSide * 0.18, 1.08, 0.04])
    );

    // --- Weathering: a couple of mossGreen patches creeping up the post ---
    for (const my of [0.34, 0.58]) {
      const moss = this.mesh(new THREE.BoxGeometry(0.13, 0.1, 0.13), this.materials.mossGreen, [
        r() * 0.04,
        my,
        0.02 + r() * 0.02
      ]);
      moss.scale.set(1, 0.7 + Math.random() * 0.4, 1);
      group.add(moss);
    }

    this.enableShadows(group);
    return group;
  }

  createSikaDeer(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_sika_deer";

    const hide = this.materials.deerHide;
    const white = this.materials.shideWhite;
    const antler = this.materials.darkBeam;
    const muzzle = this.materials.paperWindow;

    // --- Legs: four slender cylinders reaching the ground (y=0) --------------
    // Hindquarters sit slightly back (-Z), forelegs forward (+Z, toward road).
    // Shoulder/back of the body rides at ~0.92 so the withers reach ~1.3 m.
    const legH = 0.86;
    const legY = legH / 2; // base at y=0, top meets the belly
    const legXY: Array<[number, number]> = [
      [0.22, 0.34], // front-right
      [-0.22, 0.34], // front-left
      [0.2, -0.42], // hind-right
      [-0.2, -0.42] // hind-left
    ];
    for (const [lx, lz] of legXY) {
      // Upper leg slightly thicker, tapering into a thin lower shank + dark hoof.
      group.add(this.mesh(new THREE.CylinderGeometry(0.055, 0.04, legH, 6), hide, [lx, legY, lz]));
      group.add(this.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 6), antler, [lx, 0.035, lz]));
    }

    // --- Body: a tapered box; deeper at the chest, lighter at the rump -------
    const body = this.mesh(new THREE.BoxGeometry(0.42, 0.46, 1.0), hide, [0, 0.94, -0.04]);
    group.add(body);
    // Chest swell up front and a softened rump cap so the silhouette isn't a slab.
    group.add(this.mesh(new THREE.BoxGeometry(0.46, 0.4, 0.32), hide, [0, 0.9, 0.4]));
    group.add(this.mesh(new THREE.BoxGeometry(0.38, 0.4, 0.28), hide, [0, 0.96, -0.5]));

    // --- Rump patch + flank dapples (shideWhite) ----------------------------
    // Pale rump patch on the rear face (-Z), the deer's classic white blaze.
    group.add(this.mesh(new THREE.BoxGeometry(0.3, 0.3, 0.04), white, [0, 0.97, -0.66]));
    // Short upturned tail tipped white.
    const tail = this.mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), white, [0, 1.08, -0.62]);
    tail.rotation.x = 0.5;
    group.add(tail);
    // A handful of white dapple spots scattered along each flank.
    const dapples: Array<[number, number, number]> = [
      [0.215, 1.02, 0.18],
      [0.215, 0.92, -0.12],
      [0.215, 1.05, -0.32],
      [0.215, 0.88, 0.32],
      [-0.215, 1.0, 0.1],
      [-0.215, 0.94, -0.22],
      [-0.215, 1.06, -0.04],
      [-0.215, 0.9, 0.3]
    ];
    for (const [dx, dy, dz] of dapples) {
      group.add(this.mesh(new THREE.BoxGeometry(0.02, 0.06, 0.06), white, [dx, dy, dz]));
    }

    // --- Neck: rising forward from the chest toward +Z ----------------------
    const neck = this.mesh(new THREE.BoxGeometry(0.22, 0.5, 0.24), hide, [0, 1.16, 0.5]);
    neck.rotation.x = 0.6; // lean the neck up-and-forward
    group.add(neck);

    // --- Head: a small wedge turned toward the road (+Z), alert ------------
    const head = this.mesh(new THREE.BoxGeometry(0.2, 0.22, 0.32), hide, [0, 1.4, 0.66]);
    head.rotation.x = 0.18;
    group.add(head);
    // Tapered muzzle in pale paperWindow with a dark nose tip.
    const snout = this.mesh(new THREE.BoxGeometry(0.13, 0.12, 0.18), muzzle, [0, 1.36, 0.84]);
    snout.rotation.x = 0.18;
    group.add(snout);
    group.add(this.mesh(new THREE.BoxGeometry(0.09, 0.07, 0.05), antler, [0, 1.34, 0.93]));
    // Two upright ears flanking the crown.
    const earL = this.mesh(new THREE.BoxGeometry(0.05, 0.14, 0.1), hide, [-0.11, 1.52, 0.6]);
    earL.rotation.z = 0.4;
    const earR = this.mesh(new THREE.BoxGeometry(0.05, 0.14, 0.1), hide, [0.11, 1.52, 0.6]);
    earR.rotation.z = -0.4;
    group.add(earL, earR);
    // Tiny dark eyes catching the light on either side of the wedge.
    group.add(this.mesh(new THREE.BoxGeometry(0.03, 0.05, 0.05), antler, [0.095, 1.42, 0.74]));
    group.add(this.mesh(new THREE.BoxGeometry(0.03, 0.05, 0.05), antler, [-0.095, 1.42, 0.74]));

    // --- Antlers: two slim darkBeam forks sweeping up and back -------------
    for (const side of [-1, 1]) {
      // Main beam off the crown, leaning outward and slightly back.
      const beam = this.mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.36, 5), antler, [
        side * 0.08,
        1.66,
        0.5
      ]);
      beam.rotation.z = side * 0.35;
      beam.rotation.x = -0.25;
      group.add(beam);
      // A single forward tine forking off each beam.
      const tine = this.mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.2, 5), antler, [
        side * 0.18,
        1.78,
        0.56
      ]);
      tine.rotation.z = side * 0.7;
      tine.rotation.x = 0.4;
      group.add(tine);
    }

    this.enableShadows(group);
    return group;
  }

  createFallenMossyLog(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_fallen_mossy_log";

    // Toppled cedar trunk lying along +Z. Cylinder's length runs up Y by default,
    // so rotate +90deg about X to lay it down the road verge. Centre sits a little
    // above y=0 so the rounded barrel rests on the ground.
    const barrelY = 0.34;
    const log = this.mesh(new THREE.CylinderGeometry(0.28, 0.34, 3.2, 7), this.materials.cedarBark, [0, barrelY, 0]);
    log.rotation.x = Math.PI / 2;
    log.rotation.z = 0.04; // faint roll so it doesn't read perfectly machined
    group.add(log);

    // Sawn / snapped cut-face at the thick root end (-Z): a darkBeam ring cap.
    const cutFace = this.mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.06, 7), this.materials.darkBeam, [0, barrelY, -1.61]);
    cutFace.rotation.x = Math.PI / 2;
    group.add(cutFace);
    // Shattered splinter stub off the cut end for a broken-trunk silhouette.
    const splinter = this.mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.42, 5), this.materials.cedarBark, [0.1, barrelY + 0.12, -1.78]);
    splinter.rotation.x = Math.PI / 2.4;
    splinter.rotation.z = 0.5;
    group.add(splinter);

    // Moss carpet running the top spine of the log: overlapping flattened strips in
    // two greens, hugging the barrel crown (top of barrel ~ y 0.62) and draping a
    // touch down the +X flank.
    const mossMats = [this.materials.mossGreen, this.materials.mossGreenDeep];
    const mossStrips: Array<[number, number, number, number, number, number]> = [
      // x,    y,    z,     w,    d,    matIndex
      [-0.02, 0.595, -0.9, 0.5, 1.0, 0],
      [0.06, 0.6, 0.1, 0.46, 1.2, 1],
      [-0.05, 0.59, 1.05, 0.42, 0.9, 0],
      [0.14, 0.5, -0.4, 0.22, 0.7, 1],
      [-0.13, 0.5, 0.6, 0.2, 0.8, 0]
    ];
    for (const [x, y, z, w, d, mi] of mossStrips) {
      const strip = this.mesh(new THREE.BoxGeometry(w, 0.07, d), mossMats[mi], [x, y + Math.random() * 0.01, z]);
      strip.rotation.y = (Math.random() - 0.5) * 0.18;
      group.add(strip);
    }
    // A few mossy chunk clumps for faceted texture along the crown.
    const clumps: Array<[number, number, number, number, number]> = [
      [0.0, 0.62, -0.5, 0.16, 1],
      [-0.06, 0.61, 0.45, 0.14, 0],
      [0.08, 0.6, 1.25, 0.12, 1]
    ];
    for (const [x, y, z, r, mi] of clumps) {
      const clump = this.mesh(new THREE.IcosahedronGeometry(r, 0), mossMats[mi], [x, y, z]);
      clump.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(clump);
    }

    // Cluster of little mushrooms sprouting from the shaded flank near the cut end:
    // pale darkBeam stems with mossGreenDeep caps tucked low against the bark.
    const shrooms: Array<[number, number, number]> = [
      [-0.26, 0.3, -1.0],
      [-0.3, 0.26, -0.78],
      [-0.22, 0.34, -1.18]
    ];
    for (const [x, baseY, z] of shrooms) {
      const stem = this.mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.13, 5), this.materials.darkBeam, [x, baseY + 0.065, z]);
      stem.rotation.z = (Math.random() - 0.5) * 0.4;
      const cap = this.mesh(new THREE.ConeGeometry(0.07, 0.06, 7), this.materials.mossGreenDeep, [x, baseY + 0.14, z]);
      group.add(stem, cap);
    }

    // A small fern sprouting from a crack atop the log: faceted fronds fanning up
    // and outward (away from the road) from a single tuft.
    const fernBase: [number, number, number] = [-0.18, 0.6, 0.2];
    const fronds: Array<[number, number, number]> = [
      [0.0, 0.34, 0.0],
      [-0.18, 0.28, 0.05],
      [-0.1, 0.3, -0.16],
      [-0.05, 0.26, 0.2]
    ];
    for (const [dx, len, dz] of fronds) {
      const frond = this.mesh(new THREE.ConeGeometry(0.05, len, 5), this.materials.fernGreen, [fernBase[0] + dx, fernBase[1] + len * 0.45, fernBase[2] + dz]);
      frond.rotation.z = dx * 1.6;
      frond.rotation.x = dz * 1.4;
      group.add(frond);
    }

    this.enableShadows(group);
    return group;
  }

  createMushroomCluster(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_mushroom_cluster";

    // Low mossy ground patch the mushrooms sprout from — two overlapping faceted
    // blobs squashed flat so they read as a soft cushion of moss, base at y=0.
    const patchA = this.mesh(new THREE.IcosahedronGeometry(0.18, 0), this.materials.mossGreen, [0, 0.015, 0]);
    patchA.scale.set(1.0, 0.28, 1.0);
    patchA.rotation.y = Math.random() * Math.PI;
    const patchB = this.mesh(new THREE.IcosahedronGeometry(0.11, 0), this.materials.mossGreen, [0.08, 0.01, -0.05]);
    patchB.scale.set(1.0, 0.26, 1.0);
    patchB.rotation.y = Math.random() * Math.PI;
    group.add(patchA, patchB);

    // 3-5 mushrooms scattered across the patch; alternate pale stalk materials and
    // give each a tiny outward lean so the clump feels hand-grown rather than gridded.
    const stalkMats = [this.materials.paperWindow, this.materials.thatchForest];
    const shrooms: Array<[number, number, number, boolean]> = [
      // x, z, scale, spotted-cap?
      [0.0, 0.02, 1.0, true],
      [-0.11, 0.06, 0.78, false],
      [0.12, -0.04, 0.86, true],
      [0.04, 0.13, 0.62, false],
      [-0.09, -0.1, 0.7, false]
    ];
    const count = 3 + Math.floor(Math.random() * 3); // 3..5

    for (let i = 0; i < count; i += 1) {
      const [bx, bz, s, spotted] = shrooms[i];
      const stalkH = 0.12 * s;
      const stalkMat = stalkMats[i % stalkMats.length];

      // Slightly tapered stalk (wider at the base), seated just into the moss patch.
      const stalk = this.mesh(
        new THREE.CylinderGeometry(0.03 * s, 0.05 * s, stalkH, 5),
        stalkMat,
        [bx, 0.025 + stalkH * 0.5, bz]
      );
      // Gentle lean away from the cluster centre (outward), staying within footprint.
      const leanX = bx * 0.6;
      const leanZ = bz * 0.6;
      stalk.rotation.z = -leanX;
      stalk.rotation.x = leanZ;
      group.add(stalk);

      // Domed cap: a faceted icosahedron squashed into a half-sphere, ember-red.
      const capR = 0.07 * s;
      const capY = 0.025 + stalkH + capR * 0.32;
      const capX = bx + leanX * (stalkH * 0.4);
      const capZ = bz + leanZ * (stalkH * 0.4);
      const cap = this.mesh(new THREE.IcosahedronGeometry(capR, 0), this.materials.mapleEmber, [capX, capY, capZ]);
      cap.scale.set(1.0, 0.62, 1.0);
      cap.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(cap);

      // A couple of caps get little white storybook spots dotted across the dome.
      if (spotted) {
        const spots: Array<[number, number]> = [
          [0.0, 0.0],
          [capR * 0.55, capR * 0.4],
          [-capR * 0.5, -capR * 0.35]
        ];
        for (const [sx, sz] of spots) {
          const spot = this.mesh(
            new THREE.BoxGeometry(0.022 * s, 0.014 * s, 0.022 * s),
            this.materials.paperWindow,
            [capX + sx, capY + capR * 0.22, capZ + sz]
          );
          group.add(spot);
        }
      }
    }

    // Micro detail prop — skip enableShadows per spec.
    return group;
  }

  createMossPatch(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_moss_patch";

    // Flat decal-like ground cover: a few very thin flattened boxes laid at slight
    // overlaps and Y-rotations, alternating the two moss tones so the patch reads as
    // mottled organic moss rather than a single flat quad. ~0.05 m total height.
    const slabs: Array<[number, number, number, number, number, number]> = [
      // [w, d, x, z, yRot, mat(0=mossGreen,1=mossGreenDeep)]
      [1.1, 1.0, 0.0, 0.0, 0.0, 0],
      [0.85, 0.9, 0.32, -0.22, 0.5, 1],
      [0.7, 0.78, -0.34, 0.26, -0.4, 1],
      [0.62, 0.66, 0.1, 0.36, 0.9, 0],
      [0.6, 0.6, -0.22, -0.32, 1.3, 0]
    ];
    for (const [w, d, x, z, yRot, mi] of slabs) {
      // Tiny per-slab height jitter (~0.04 m) so overlapping decals don't z-fight flatly.
      const y = 0.02 + Math.random() * 0.012;
      const slab = this.mesh(
        new THREE.BoxGeometry(w, 0.04, d),
        mi === 0 ? this.materials.mossGreen : this.materials.mossGreenDeep,
        [x, y, z]
      );
      slab.rotation.y = yRot + (Math.random() - 0.5) * 0.2;
      group.add(slab);
    }

    // A couple of tiny raised faceted moss bumps for a hint of clumpy relief.
    const bumps: Array<[number, number, number, number]> = [
      [0.18, 0.07, -0.12, 0],
      [-0.16, 0.055, 0.2, 1],
      [0.04, 0.045, 0.05, 1]
    ];
    for (const [x, r, z, mi] of bumps) {
      const bump = this.mesh(
        new THREE.IcosahedronGeometry(r, 0),
        mi === 0 ? this.materials.mossGreen : this.materials.mossGreenDeep,
        [x, 0.035, z]
      );
      bump.scale.y = 0.55;
      bump.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(bump);
    }

    // Flat ground cover — intentionally no enableShadows().
    return group;
  }

  createForestLogEdging(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_forest_log_edging";

    // Continuous half-round log running along Z (the Feldweg lip). A cylinder
    // laid horizontal: rotate about X so its length aligns with the Z axis.
    // Sunk slightly so it reads as a half-round resting in the earth (y<0.4).
    const logR = 0.18;
    const logLen = 8;
    const log = this.mesh(
      new THREE.CylinderGeometry(logR, logR, logLen, 7),
      this.materials.cedarBark,
      [0, logR - 0.04, 0]
    );
    log.rotation.x = Math.PI / 2;
    group.add(log);

    // A second, slimmer rustic-wood log offset slightly outward (-Z, the verge
    // side) and a touch lower, so the border reads as a stacked pair of logs
    // rather than a single pipe. Subtle length variation per instance.
    const log2 = this.mesh(
      new THREE.CylinderGeometry(logR * 0.82, logR * 0.82, logLen - 0.3, 6),
      this.materials.rusticWood,
      [0, logR - 0.07, -0.13]
    );
    log2.rotation.x = Math.PI / 2;
    log2.rotation.z = 0.04;
    group.add(log2);

    // Short cut-end caps so the tiled segments read as discrete sawn logs.
    for (const zEnd of [logLen / 2 - 0.06, -(logLen / 2 - 0.06)]) {
      const cap = this.mesh(
        new THREE.CylinderGeometry(logR * 1.02, logR * 1.02, 0.05, 7),
        this.materials.rusticWood,
        [0, logR - 0.04, zEnd]
      );
      cap.rotation.x = Math.PI / 2;
      group.add(cap);
    }

    // Mossy strip riding the top of the main log: a run of low, flattened
    // moss-green blobs that overlap into a continuous ridge of growth.
    const mossTiles = 9;
    for (let i = 0; i < mossTiles; i++) {
      const t = i / (mossTiles - 1);
      const z = (t - 0.5) * (logLen - 0.6);
      const moss = this.mesh(
        new THREE.BoxGeometry(0.2 + Math.random() * 0.06, 0.07, 0.78),
        this.materials.mossGreen,
        [(Math.random() - 0.5) * 0.05, logR + 0.07, z]
      );
      moss.rotation.y = (Math.random() - 0.5) * 0.12;
      group.add(moss);

      // Occasional faceted moss tuft for a clumpy, hand-built silhouette.
      if (i % 2 === 0) {
        const tuft = this.mesh(
          new THREE.IcosahedronGeometry(0.08 + Math.random() * 0.03, 0),
          this.materials.mossGreen,
          [(Math.random() - 0.5) * 0.16, logR + 0.1, z + (Math.random() - 0.5) * 0.3]
        );
        tuft.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        group.add(tuft);
      }
    }

    this.enableShadows(group);
    return group;
  }

  createMossyPathEdging(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_mossy_path_edging";

    // A short run of flat flagstone kerb that hems the side of a stone-paved
    // path. The unit runs along Z (parallel to the road); the path side is +Z.
    // Overall footprint ~0.6w x 0.12h x 1.4d, set LOW so it reads as flush kerb.
    // Mottled grey-green: cliffStone / mossPaver / dirtPath flags, a little
    // mossGreen creeping into the joints. No enableShadows (flat ground prop).

    // --- Bedding course: a thin packed dirtPath strip the flags rest on, so the
    // gaps between stones read as earth rather than void.
    const bedding = this.mesh(
      new THREE.BoxGeometry(0.56, 0.04, 1.4),
      this.materials.dirtPath,
      [0, 0.02, 0]
    );
    group.add(bedding);

    // --- The flagstone run: 5 irregular slabs laid end-to-end along Z, each a
    // slightly different height and a touch of x-jitter so the kerb line wanders.
    // Alternate the stone material for the mottled grey-green look.
    const flagMats = [
      this.materials.cliffStone,
      this.materials.mossPaver,
      this.materials.dirtPath,
    ];
    const flagCount = 5;
    const segLen = 1.4 / flagCount; // ~0.28 m per flag
    for (let i = 0; i < flagCount; i++) {
      const z = -0.7 + segLen * (i + 0.5);
      // Uneven heights — flags sit a few mm proud or sunk.
      const h = 0.06 + Math.random() * 0.05;
      const w = 0.46 + Math.random() * 0.08;
      const d = segLen - 0.03; // hairline joint between flags
      const xJit = (Math.random() - 0.5) * 0.05;
      const mat = flagMats[i % flagMats.length];
      const flag = this.mesh(
        new THREE.BoxGeometry(w, h, d),
        mat,
        [xJit, 0.04 + h / 2, z]
      );
      // A whisper of tilt so no two flags sit perfectly flush.
      flag.rotation.x = (Math.random() - 0.5) * 0.05;
      flag.rotation.y = (Math.random() - 0.5) * 0.08;
      group.add(flag);
    }

    // --- Outer kerb lip: a slightly taller cliffStone stone on the OUTWARD x
    // flank (-x, away from the path centre), running the full length to define
    // the verge edge of the paved run.
    const lip = this.mesh(
      new THREE.BoxGeometry(0.12, 0.1, 1.4),
      this.materials.cliffStone,
      [-0.24, 0.07, 0]
    );
    lip.rotation.z = 0.06; // leans outward, away from the path
    group.add(lip);

    // A couple of cobble nubs breaking the kerb lip line, for a hand-laid feel.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.13, 0.12, 0.22), this.materials.mossPaver, [-0.24, 0.08, -0.42]),
      this.mesh(new THREE.BoxGeometry(0.13, 0.11, 0.2), this.materials.cliffStone, [-0.24, 0.075, 0.5])
    );

    // --- Moss creeping into the joints: small low mossGreen pads tucked between
    // and around the flags. Faceted icosahedron blobs flattened to hug the stone.
    const mossSpots: [number, number, number][] = [
      [0.12, 0.05, -0.5],
      [-0.08, 0.05, -0.18],
      [0.16, 0.05, 0.14],
      [-0.05, 0.05, 0.46],
      [0.1, 0.05, 0.62],
    ];
    for (const [x, y, z] of mossSpots) {
      const r = 0.05 + Math.random() * 0.03;
      const moss = this.mesh(
        new THREE.IcosahedronGeometry(r, 0),
        Math.random() > 0.5 ? this.materials.mossGreen : this.materials.mossGreenDeep,
        [x, y, z]
      );
      moss.scale.y = 0.4; // pressed flat onto the stone
      moss.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(moss);
    }

    // A longer ribbon of moss bleeding along the joint behind the kerb lip.
    const mossRibbon = this.mesh(
      new THREE.BoxGeometry(0.06, 0.02, 0.9),
      this.materials.mossGreen,
      [-0.17, 0.05, -0.05]
    );
    group.add(mossRibbon);

    // Flat ground prop — deliberately NOT calling this.enableShadows(group).
    return group;
  }

  createDirtShoulder(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_dirt_shoulder";

    // Main earthen bank: a long packed-earth slab forms the buried bulk, with a
    // dirtPath cap on top so the walkable crest reads lighter than the cut below.
    const bank = this.mesh(new THREE.BoxGeometry(1.9, 0.36, 8), this.materials.packedEarth, [0, 0.18, 0]);
    group.add(bank);
    const crest = this.mesh(new THREE.BoxGeometry(1.86, 0.14, 8), this.materials.dirtPath, [0, 0.43, 0]);
    group.add(crest);

    // The exposed cut face: a wedge tilted so the dirt slopes away off-road (its
    // top edge sits high on the verge side, its toe drops toward the road shoulder).
    const slope = this.mesh(new THREE.BoxGeometry(0.7, 0.5, 8), this.materials.packedEarth, [0.78, 0.28, 0]);
    slope.rotation.z = -0.42;
    group.add(slope);
    const slopeDirt = this.mesh(new THREE.BoxGeometry(0.36, 0.46, 8), this.materials.dirtPath, [-0.78, 0.26, 0]);
    slopeDirt.rotation.z = 0.46;
    group.add(slopeDirt);

    // Three stepped clods break the long edge so the wedge isn't a clean plank.
    const clods: Array<[number, number, number, number, number, number]> = [
      [-0.5, 0.34, -2.6, 0.7, 0.26, 1.5],
      [0.34, 0.3, 0.4, 0.6, 0.22, 1.8],
      [-0.18, 0.36, 2.9, 0.66, 0.24, 1.6]
    ];
    for (const [x, y, z, w, h, d] of clods) {
      const clod = this.mesh(new THREE.BoxGeometry(w, h, d), this.materials.packedEarth, [x, y, z]);
      clod.rotation.y = (Math.random() - 0.5) * 0.3;
      group.add(clod);
    }

    // Protruding roots (darkBeam): gnarled boxes that jut out of the cut face,
    // each tilted and twisted so they snake out of the bank at varied angles.
    const roots: Array<[number, number, number, number, number, number, number, number]> = [
      [-0.62, 0.3, -2.9, 0.1, 0.1, 0.9, 0.5, 0.2],
      [-0.7, 0.16, -1.1, 0.08, 0.08, 0.7, 0.35, -0.3],
      [-0.58, 0.34, 0.6, 0.11, 0.11, 1.0, 0.6, 0.15],
      [-0.66, 0.2, 2.0, 0.09, 0.09, 0.62, 0.28, 0.4],
      [-0.6, 0.4, 3.3, 0.1, 0.1, 0.8, 0.7, -0.18],
      [-0.5, 0.12, -0.2, 0.07, 0.07, 0.5, 0.2, 0.5]
    ];
    for (const [x, y, z, rt, rb, len, tiltZ, twist] of roots) {
      const root = this.mesh(new THREE.CylinderGeometry(rt, rb, len, 5), this.materials.darkBeam, [x, y, z]);
      root.rotation.z = Math.PI / 2 - tiltZ; // lay it roughly horizontal, poking out sideways
      root.rotation.y = twist;
      group.add(root);
      // a small forked offshoot on the thicker roots
      if (rt > 0.09) {
        const fork = this.mesh(new THREE.CylinderGeometry(rt * 0.6, rt * 0.7, len * 0.55, 5), this.materials.darkBeam, [x - 0.18, y + 0.12, z + 0.18]);
        fork.rotation.z = Math.PI / 2 - tiltZ - 0.5;
        fork.rotation.y = twist + 0.6;
        group.add(fork);
      }
    }

    // Embedded pebbles (wetRock): small angled boxes pressed into the dirt face,
    // scattered the length of the strip and tipped randomly so none sit flush.
    const pebbles: Array<[number, number, number, number]> = [
      [-0.4, 0.12, -3.3, 0.16],
      [0.2, 0.46, -2.1, 0.12],
      [-0.55, 0.24, -0.7, 0.2],
      [0.46, 0.18, 0.2, 0.14],
      [-0.3, 0.4, 1.2, 0.13],
      [0.3, 0.1, 2.3, 0.18],
      [-0.48, 0.3, 3.0, 0.15],
      [0.1, 0.44, 3.6, 0.11]
    ];
    for (const [x, y, z, s] of pebbles) {
      const pebble = this.mesh(new THREE.BoxGeometry(s, s * 0.7, s * 0.9), this.materials.wetRock, [x, y, z]);
      pebble.rotation.set((Math.random() - 0.5) * 0.6, Math.random() * Math.PI, (Math.random() - 0.5) * 0.6);
      group.add(pebble);
    }

    // Moss patches: flat mossGreen tiles bedded into the crest and slope so the
    // shoulder reads damp and overgrown along the verge side.
    const moss: Array<[number, number, number, number, number]> = [
      [-0.55, 0.51, -2.4, 0.5, 1.4],
      [0.3, 0.51, 0.0, 0.42, 1.1],
      [-0.4, 0.51, 2.6, 0.46, 1.5],
      [-0.78, 0.4, 1.4, 0.3, 1.2]
    ];
    for (const [x, y, z, w, d] of moss) {
      const patch = this.mesh(new THREE.BoxGeometry(w, 0.04, d), this.materials.mossGreen, [x, y, z]);
      patch.rotation.y = (Math.random() - 0.5) * 0.3;
      group.add(patch);
    }

    return group;
  }

  createMistyPeaks(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_misty_peaks";

    // Distant mountain skyline backdrop — a flat parallax band of broad triangular
    // peak silhouettes layered at staggered depths. Far ridges are pale (mountainFar),
    // near ridges are darker (ridgeSilhouette), and a few faint mistVeil blooms drift
    // across the bases where the fog swallows the edges. Non-shadow-casting backdrop.
    // Each peak: [centreX, baseWidth, height, depthZ, material]. Larger -depthZ = further
    // back = paler; the whole thing reads as a soft layered chevron horizon ~40 m wide.
    const peaks: Array<[number, number, number, number, THREE.Material]> = [
      // Far layer — pale, pushed back, tall and broad, low saturation.
      [-13.5, 17.0, 21.0, -2.6, this.materials.mountainFar],
      [-2.0, 19.0, 25.0, -2.9, this.materials.mountainFar],
      [11.0, 16.0, 19.5, -2.4, this.materials.mountainFar],
      // Near layer — darker ridges overlapping in front, slightly lower.
      [-8.5, 14.0, 16.5, -0.4, this.materials.ridgeSilhouette],
      [4.5, 15.0, 18.0, -0.7, this.materials.ridgeSilhouette],
      [15.5, 11.0, 13.5, -0.2, this.materials.ridgeSilhouette]
    ];

    peaks.forEach(([cx, w, h, z, mat], i) => {
      // Flattened 3-sided cone reads as a clean triangular silhouette ridge.
      // radialSegments=3 gives a crisp low-poly chevron; rotated so a face fronts +Z.
      const peak = this.mesh(new THREE.ConeGeometry(w * 0.5, h, 3), mat, [cx, h * 0.5, z]);
      peak.rotation.y = Math.PI; // flat face toward the road/camera (+Z)
      group.add(peak);

      // A secondary shorter shoulder offset to one side breaks the perfect symmetry,
      // so each summit gets a craggy double-hump silhouette rather than a lone triangle.
      const shoulderW = w * (0.5 + Math.random() * 0.18);
      const shoulderH = h * (0.5 + Math.random() * 0.14);
      const shoulderX = cx + (i % 2 === 0 ? 1 : -1) * w * 0.28;
      const shoulder = this.mesh(
        new THREE.ConeGeometry(shoulderW * 0.5, shoulderH, 3),
        mat,
        [shoulderX, shoulderH * 0.5, z - 0.15]
      );
      shoulder.rotation.y = Math.PI;
      group.add(shoulder);
    });

    // Snow-pale caps on the two tallest far summits — small pale chevrons sitting just
    // below each apex to suggest distant snowfields catching the light.
    const capPeaks: Array<[number, number, number]> = [
      [-2.0, 25.0, -2.9],
      [4.5, 18.0, -0.7]
    ];
    capPeaks.forEach(([cx, h, z]) => {
      const capH = h * 0.22;
      const cap = this.mesh(
        new THREE.ConeGeometry(h * 0.11, capH, 3),
        this.materials.mountainFar,
        [cx, h - capH * 0.45, z + 0.1]
      );
      cap.rotation.y = Math.PI;
      group.add(cap);
    });

    // Faint mist blooms — flat emissive slabs drifting low across the ridge bases where
    // the valleys fill with fog. Wide, thin and soft; placed in front so they bleed over
    // the silhouettes and dissolve the hard cone edges into the haze.
    const mistBands: Array<[number, number, number, number, number]> = [
      // [centreX, width, height, y, z]
      [-9.0, 22.0, 5.5, 4.0, 1.0],
      [3.0, 24.0, 6.5, 6.5, 1.3],
      [13.0, 16.0, 4.5, 3.2, 0.9]
    ];
    mistBands.forEach(([cx, w, h, y, z]) => {
      group.add(this.mesh(new THREE.BoxGeometry(w, h, 0.2), this.materials.mistVeil, [cx, y, z]));
    });

    // A couple of small high mist puffs clinging to the tallest summit for atmosphere.
    group.add(
      this.mesh(new THREE.IcosahedronGeometry(2.6, 0), this.materials.mistVeil, [-3.5, 18.5, 0.6]),
      this.mesh(new THREE.IcosahedronGeometry(2.2, 0), this.materials.mistVeil, [5.5, 13.5, 0.8])
    );

    // Far backdrop — fog swallows the edges, so no shadows.
    return group;
  }

  createCedarRidge(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_cedar_ridge";

    // Mid-distance backdrop band: a long, low ridge silhouette wall whose top edge is a
    // serrated saw-tooth row of small triangular cedar spires. Read as a flat parallax
    // band placed off-road to the side — no shadows, modest poly. Spans ~40 m along x,
    // origin at base centre, base at y=0, faces toward the road (+Z).
    const span = 40;
    const depth = 1.4;
    const frontZ = depth * 0.5;

    // ---- Ridge body: a continuous undulating silhouette wall ----------------------
    // A row of overlapping box panels at gently varied heights forms a rolling ridge
    // crest, so the base wall itself isn't a dead-flat line. Slightly back from the
    // cedar spires so the spires read as a darker crowning layer in front.
    const panelCount = 16;
    const panelW = span / panelCount;
    let prevTop = 3.2;
    for (let i = 0; i < panelCount; i += 1) {
      const cx = -span * 0.5 + panelW * (i + 0.5);
      // Smoothly wander the crest height with a little random jitter for a natural roll.
      const wave = Math.sin((i / panelCount) * Math.PI * 2.2) * 0.9;
      const target = 3.1 + wave + (Math.random() - 0.5) * 0.5;
      const h = THREE.MathUtils.lerp(prevTop, target, 0.6);
      prevTop = h;
      // Overlap neighbours horizontally so there are no silhouette gaps.
      group.add(
        this.mesh(
          new THREE.BoxGeometry(panelW * 1.12, h, depth),
          this.materials.ridgeSilhouette,
          [cx, h * 0.5, -0.1]
        )
      );
    }

    // ---- Serrated cedar-spire crest: jagged saw-tooth row of small cone trees -------
    // Densely packed slim cones march along the whole top edge, riding the crest. They
    // are a touch darker (sugiCanopyDeep) than the misty wall so the saw-tooth reads as
    // depth. Heights, lean and z-offset jitter per spire to break any mechanical line.
    const spireCount = 64;
    const spireStep = span / spireCount;
    for (let i = 0; i < spireCount; i += 1) {
      const cx = -span * 0.5 + spireStep * (i + 0.5) + (Math.random() - 0.5) * spireStep * 0.4;
      // Follow the same crest wave the body uses, so spires sit ON the ridge top.
      const t = i / spireCount;
      const crest = 3.1 + Math.sin(t * Math.PI * 2.2) * 0.9;
      const baseY = crest + (Math.random() - 0.5) * 0.25;
      const spireH = 1.1 + Math.random() * 1.4;
      const spireR = 0.26 + Math.random() * 0.12;
      const cone = this.mesh(
        new THREE.ConeGeometry(spireR, spireH, 5),
        this.materials.sugiCanopyDeep,
        [cx, baseY + spireH * 0.5, frontZ - 0.15 + (Math.random() - 0.5) * 0.2]
      );
      // Tiny per-spire sway and spin so the saw-tooth looks hand-grown, not stamped.
      cone.rotation.z = (Math.random() - 0.5) * 0.18;
      cone.rotation.y = Math.random() * Math.PI;
      group.add(cone);

      // Every few spires, tuck a shorter sibling beside the taller one to thicken the
      // serration and add a second tier of teeth.
      if (i % 3 === 0) {
        const sh = spireH * (0.5 + Math.random() * 0.25);
        const sr = spireR * 0.8;
        const sx = cx + (Math.random() - 0.5) * spireStep * 0.7;
        group.add(
          this.mesh(
            new THREE.ConeGeometry(sr, sh, 5),
            this.materials.sugiCanopyDeep,
            [sx, baseY + sh * 0.5 - 0.1, frontZ - 0.05]
          )
        );
      }
    }

    // ---- Soft mist band hugging the base ------------------------------------------
    // A faint translucent veil lies across the foot of the ridge so the band dissolves
    // into the distance rather than sitting on a hard ground line. A few overlapping
    // low slabs of mistVeil, set just in front of the wall.
    for (let i = 0; i < 6; i += 1) {
      const cx = -span * 0.5 + (span / 6) * (i + 0.5) + (Math.random() - 0.5) * 1.0;
      const mw = span / 6 + 1.5;
      const mh = 0.7 + Math.random() * 0.5;
      group.add(
        this.mesh(
          new THREE.BoxGeometry(mw, mh, 0.12),
          this.materials.mistVeil,
          [cx, mh * 0.4 + 0.1, frontZ + 0.25]
        )
      );
    }

    // A thin upper haze line drifting across the spire bases, fading the saw-tooth into
    // the wall so the two layers merge atmospherically.
    group.add(
      this.mesh(
        new THREE.BoxGeometry(span + 1.0, 0.5, 0.1),
        this.materials.mistVeil,
        [0, 3.0, frontZ + 0.18]
      )
    );

    // Tall backdrop band — deliberately NOT shadow-casting (per spec).
    return group;
  }

  createDistantWaterfall(): THREE.Group {
    const group = new THREE.Group();
    group.name = "deco_distant_waterfall";

    // Far skyline filler: a small faceted ridge-cliff in cool atmospheric blue, a
    // single pale waterfall streak cleaving it, and a faint mist bloom pooling at the
    // base. Read as a flat parallax silhouette on the horizon band, so everything is
    // kept inside a narrow ~1.2 m footprint and there is no over-road overhang.
    const v = (Math.random() - 0.5) * 0.18; // tiny per-instance variety

    // --- Distant mini-cliff: a stack of overlapping low-poly mountainFar blobs that
    //     pile up into a craggy bluff, with a deeper ridgeSilhouette shoulder behind.
    //     Radii kept modest and z-centres pulled in so the silhouette stays flat. ---
    const cliffBlobs: Array<[number, number, number, number, THREE.Material]> = [
      // [x, y, z, radius, material]
      [-0.20, 0.55, -0.03, 0.42, this.materials.mountainFar],
      [0.18, 0.74, -0.02, 0.44, this.materials.mountainFar],
      [-0.02, 1.5, -0.02, 0.48, this.materials.mountainFar],
      [-0.24, 2.3, -0.02, 0.34, this.materials.mountainFar],
      [0.24, 2.6, -0.02, 0.38, this.materials.mountainFar],
      [0.02, 3.3, -0.03, 0.42, this.materials.mountainFar],
      [-0.1, 4.05, -0.03, 0.34, this.materials.mountainFar]
    ];
    for (const [x, y, z, r, mat] of cliffBlobs) {
      const blob = this.mesh(new THREE.IcosahedronGeometry(r * (1 + v), 0), mat, [x, y + v, z]);
      blob.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(blob);
    }
    // Deeper-toned shoulder ridges set a touch further back so the cliff reads with depth.
    const shoulders: Array<[number, number, number, number]> = [
      [-0.28, 2.05, -0.07, 0.34],
      [0.3, 1.65, -0.08, 0.32],
      [0.06, 4.55, -0.06, 0.28]
    ];
    for (const [x, y, z, r] of shoulders) {
      const s = this.mesh(new THREE.IcosahedronGeometry(r, 0), this.materials.ridgeSilhouette, [x, y, z]);
      s.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(s);
    }

    // --- Waterfall streak: a slender pale waterfallVeil ribbon dropping down the face,
    //     faceted into a few flat panels so it catches the light like cut paper. The
    //     panels sit just in front of the cliff (+z) so the cliff never clips through. ---
    const fallX = -0.04;
    const fallZ = 0.11;
    const drops: Array<[number, number, number, number]> = [
      // [y, width, height, zNudge] — narrows and recedes slightly toward the lip.
      [3.65, 0.16, 0.7, 0.0],
      [3.0, 0.18, 0.8, 0.01],
      [2.25, 0.2, 0.95, 0.0],
      [1.4, 0.22, 1.0, -0.01],
      [0.72, 0.18, 0.72, 0.0]
    ];
    for (const [y, w, h, zN] of drops) {
      const sway = (Math.random() - 0.5) * 0.04;
      const panel = this.mesh(
        new THREE.BoxGeometry(w, h, 0.03),
        this.materials.waterfallVeil,
        [fallX + sway, y, fallZ + zN]
      );
      panel.rotation.z = sway * 1.5;
      group.add(panel);
    }
    // Bright lip cap where the water spills over the top edge.
    group.add(
      this.mesh(new THREE.BoxGeometry(0.24, 0.16, 0.05), this.materials.waterfallVeil, [fallX, 4.08, fallZ])
    );
    // A couple of faceted spray nuggets bouncing off mid-ledges.
    group.add(
      this.mesh(new THREE.IcosahedronGeometry(0.09, 0), this.materials.waterfallVeil, [fallX - 0.12, 2.05, fallZ + 0.02]),
      this.mesh(new THREE.IcosahedronGeometry(0.08, 0), this.materials.waterfallVeil, [fallX + 0.1, 2.7, fallZ + 0.02])
    );

    // --- Mist bloom: soft mistVeil blobs pooling where the fall lands, fanning out a
    //     little wider than the streak but staying within the prop footprint and above
    //     the y=0 base plane. ---
    const mist: Array<[number, number, number, number]> = [
      [fallX, 0.4, fallZ + 0.03, 0.3],
      [fallX - 0.2, 0.3, fallZ + 0.01, 0.24],
      [fallX + 0.22, 0.32, fallZ + 0.02, 0.24],
      [fallX, 0.72, fallZ + 0.02, 0.22],
      [fallX - 0.06, 0.26, fallZ + 0.04, 0.2]
    ];
    for (const [x, y, z, r] of mist) {
      const puff = this.mesh(new THREE.IcosahedronGeometry(r, 0), this.materials.mistVeil, [x, y, z]);
      puff.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(puff);
    }

    // Far backdrop only — emissive veils + skyline band, so deliberately skip enableShadows.
    return group;
  }

  private mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: [number, number, number]
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    return mesh;
  }
}
