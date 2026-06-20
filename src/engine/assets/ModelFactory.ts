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
    // RYUJIN HYPERCAR — legend. Long low pearlescent-teal wedge, low canopy, heavy
    // gold-leaf pin-trim and restrained teal glow lines. Loud through finish, not clutter.
    const teal = this.materials.carRyujinPearl;
    const gold = this.materials.gold;
    const glow = this.materials.neonCyan;
    const g = this.buildCar({
      name: "char_ryujin_hypercar_low_poly",
      body: teal,
      lower: this.materials.carbon,
      roofMat: teal,
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
    const splitterGold = this.mesh(new THREE.BoxGeometry(1.3, 0.03, 0.05), gold, [0, 0.22, 1.52]);
    const frontGlow = this.mesh(new THREE.BoxGeometry(1.0, 0.03, 0.04), glow, [0, 0.26, 1.54]);
    const diffuser = this.mesh(new THREE.BoxGeometry(1.42, 0.14, 0.26), this.materials.carbon, [0, 0.22, -1.36]);
    const diffuserGlow = this.mesh(new THREE.BoxGeometry(0.9, 0.03, 0.04), glow, [0, 0.28, -1.48]);
    // Low rear wing on short supports rising off the deck (no tall pylons)
    const wing = this.mesh(new THREE.BoxGeometry(1.56, 0.06, 0.3), teal, [0, 0.82, -1.18]);
    const wingGold = this.mesh(new THREE.BoxGeometry(1.24, 0.03, 0.05), gold, [0, 0.86, -1.08]);
    const wingGlow = this.mesh(new THREE.BoxGeometry(1.24, 0.025, 0.04), glow, [0, 0.79, -1.3]);
    g.add(splitter, splitterGold, frontGlow, diffuser, diffuserGlow, wing, wingGold, wingGlow);

    for (const sx of [-1, 1]) {
      const support = this.mesh(new THREE.BoxGeometry(0.06, 0.22, 0.09), teal, [sx * 0.5, 0.71, -1.16]);
      const goldRail = this.mesh(new THREE.BoxGeometry(0.03, 0.04, 1.9), gold, [sx * 0.73, 0.52, -0.02]);
      const sideGlow = this.mesh(new THREE.BoxGeometry(0.035, 0.03, 1.6), glow, [sx * 0.76, 0.34, -0.02]);
      g.add(support, goldRail, sideGlow);
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

    return group;
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
