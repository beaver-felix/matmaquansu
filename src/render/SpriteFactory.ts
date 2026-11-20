import { Container, Graphics } from 'pixi.js';
import { BossRole, FactionId } from '../core/GameState';
import { VehicleConfig } from '../data/vehicles';

/**
 * Draws player vehicles at exact chassis dimensions (facing up / -Y).
 */
export function createVehicleSprite(vehicle: VehicleConfig, showHullOutline = false): Container {
  const root = new Container();
  const w = vehicle.width;
  const h = vehicle.height;
  const hw = w / 2;
  const hh = h / 2;

  const g = new Graphics();

  // Subtle sunlit ground shadow
  g.roundRect(-hw + 3, -hh + 4, w, h, 4).fill({ color: 0x1e261c, alpha: 0.22 });

  switch (vehicle.id) {
    case 'bicycle': {
      g.rect(-2.5, -hh + 1, 5, 7).fill({ color: 0x1a1e1c });
      g.rect(-2.5, hh - 8, 5, 7).fill({ color: 0x1a1e1c });
      g.rect(-hw + 1, -hh + 6, w - 2, 3).fill({ color: 0x5c5340 });
      g.rect(-2, -hh + 6, 4, h - 12).fill({ color: vehicle.bodyColor });
      g.roundRect(-6.5, -3, 13, 12, 4).fill({ color: 0x456b3d }).stroke({ color: 0x1b2618, width: 1.2 });
      g.circle(0, -1, 4.8).fill({ color: vehicle.accentColor }).stroke({ color: 0x4a3d1f, width: 1 });
      g.circle(0, -1, 1.6).fill({ color: 0xc92424 });
      break;
    }
    case 'pack_bike': {
      g.rect(-3, -hh + 1, 6, 8).fill({ color: 0x181a18 });
      g.rect(-3, hh - 9, 6, 8).fill({ color: 0x181a18 });
      g.rect(-hw + 2, -hh + 6, w - 4, 3).fill({ color: 0x5c5340 });
      g.roundRect(-hw + 1, -7, 7, 19, 2).fill({ color: 0x9c8456 }).stroke({ color: 0x3b311e, width: 1.2 });
      g.roundRect(hw - 8, -7, 7, 19, 2).fill({ color: 0x9c8456 }).stroke({ color: 0x3b311e, width: 1.2 });
      g.roundRect(-6, -4, 12, 13, 3).fill({ color: vehicle.bodyColor }).stroke({ color: 0x1c2618, width: 1 });
      g.circle(0, -3, 5).fill({ color: vehicle.accentColor }).stroke({ color: 0x4a3d1f, width: 1 });
      g.circle(0, -3, 1.7).fill({ color: 0xc92424 });
      break;
    }
    case 'jeep': {
      g.rect(-hw, -hh + 5, 4, 10).fill({ color: 0x171918 });
      g.rect(hw - 4, -hh + 5, 4, 10).fill({ color: 0x171918 });
      g.rect(-hw, hh - 15, 4, 10).fill({ color: 0x171918 });
      g.rect(hw - 4, hh - 15, 4, 10).fill({ color: 0x171918 });
      g.roundRect(-hw + 3, -hh + 2, w - 6, h - 4, 4)
        .fill({ color: vehicle.bodyColor })
        .stroke({ color: 0x1b291d, width: 1.6 });
      g.rect(-hw + 6, -hh + 5, w - 12, 11).fill({ color: 0x4d7754 });
      g.rect(-hw + 6, -hh + 15, w - 12, 4).fill({ color: 0xaad9e6, alpha: 0.9 });
      g.circle(0, 5, 4.5).fill({ color: 0xc92424 });
      g.circle(0, 5, 2.2).fill({ color: 0xffe45c });
      g.rect(-hw + 5, -hh + 1, 4, 2).fill({ color: 0xfff3b0 });
      g.rect(hw - 9, -hh + 1, 4, 2).fill({ color: 0xfff3b0 });
      break;
    }
    case 'truck': {
      for (const wy of [-hh + 7, hh - 22, hh - 11]) {
        g.rect(-hw, wy, 4, 9).fill({ color: 0x141614 });
        g.rect(hw - 4, wy, 4, 9).fill({ color: 0x141614 });
      }
      g.roundRect(-hw + 4, -hh + 2, w - 8, 17, 4)
        .fill({ color: 0x3b5233 })
        .stroke({ color: 0x1a2617, width: 1.5 });
      g.rect(-hw + 7, -hh + 9, w - 14, 5).fill({ color: 0x9cd1de, alpha: 0.9 });
      g.roundRect(-hw + 3, -hh + 20, w - 6, h - 22, 3)
        .fill({ color: 0x5c6d4a })
        .stroke({ color: 0x26311d, width: 1.5 });
      for (let ry = -hh + 26; ry < hh - 6; ry += 7) {
        g.moveTo(-hw + 5, ry).lineTo(hw - 5, ry).stroke({ color: 0x3e4d31, width: 1.3 });
      }
      g.circle(0, -hh + 16, 3.5).fill({ color: 0xc92424 });
      g.rect(-hw + 6, -hh + 1, 5, 2.5).fill({ color: 0xfff3b0 });
      g.rect(hw - 11, -hh + 1, 5, 2.5).fill({ color: 0xfff3b0 });
      break;
    }
    case 'tank': {
      g.roundRect(-hw, -hh + 3, 9, h - 6, 2).fill({ color: 0x1d201d }).stroke({ color: 0x3b403b, width: 1 });
      g.roundRect(hw - 9, -hh + 3, 9, h - 6, 2).fill({ color: 0x1d201d }).stroke({ color: 0x3b403b, width: 1 });
      for (let ty = -hh + 7; ty < hh - 5; ty += 6) {
        g.moveTo(-hw + 1, ty).lineTo(-hw + 8, ty).stroke({ color: 0x494f49, width: 1 });
        g.moveTo(hw - 8, ty).lineTo(hw - 1, ty).stroke({ color: 0x494f49, width: 1 });
      }
      g.roundRect(-hw + 7, -hh + 6, w - 14, h - 12, 4)
        .fill({ color: vehicle.bodyColor })
        .stroke({ color: 0x1d3520, width: 2 });
      g.rect(-hw + 11, hh - 16, w - 22, 8).fill({ color: 0x26442a });
      g.ellipse(0, 1, 13, 14)
        .fill({ color: 0x4c8554 })
        .stroke({ color: 0x1d3520, width: 1.6 });
      g.rect(-3, -hh - 6, 6, 28).fill({ color: 0x2f5a35 }).stroke({ color: 0x1a301d, width: 1.2 });
      g.rect(-4, -hh - 7, 8, 4).fill({ color: 0x628c67 });
      g.circle(0, 1, 5.5).fill({ color: 0xd92626 });
      g.circle(0, 1, 2.3).fill({ color: 0xffe45c });
      break;
    }
  }

  if (showHullOutline) {
    const chW = vehicle.hitboxWidth;
    const chH = vehicle.hitboxHeight;
    g.roundRect(-chW / 2, -chH / 2, chW, chH, 3).stroke({ color: 0x1c7c4a, width: 1.4, alpha: 0.65 });
  }

  root.addChild(g);
  return root;
}

/**
 * Unmistakable top-down enemy sprites facing downward (+Y) toward player:
 * - Pháp++: Twin-propeller B-26 bomber aircraft
 * - Mỹ: Twin-engine swept-wing F-4 Phantom fighter-bomber jet
 */
export function createEnemySprite(faction: FactionId, bossRole: BossRole): Container {
  const c = new Container();
  const g = new Graphics();

  if (bossRole === 'tutorial') {
    // Opening ultra-hard fortified command blockhouse
    g.roundRect(-44, -28, 88, 56, 6).fill({ color: 0x6b4537 }).stroke({ color: 0x3b1f17, width: 2.6 });
    g.rect(-34, -18, 68, 36).fill({ color: 0x4d3026 });
    g.circle(-21, 0, 10).fill({ color: 0x8a5b4a }).stroke({ color: 0x2e1a14, width: 1.4 });
    g.circle(21, 0, 10).fill({ color: 0x8a5b4a }).stroke({ color: 0x2e1a14, width: 1.4 });
    g.rect(-24, 8, 6, 19).fill({ color: 0x241715 });
    g.rect(18, 8, 6, 19).fill({ color: 0x241715 });
    g.circle(0, 0, 12).fill({ color: 0xc91e3a }).stroke({ color: 0xffe45c, width: 2 });
    c.addChild(g);
    return c;
  }

  if (bossRole === 'rematch') {
    // Rematch Climax: Imposing B-52 Stratofortress Strategic Bomber (end of Tuyến Lửa Trường Sơn, facing +Y!)
    g.poly([8, 52, 74, -6, 68, -20, 14, -36, -14, -36, -68, -20, -74, -6]).fill({ color: 0x161a1f, alpha: 0.16 });
    // Rear swept tailplane stabilizers (-Y)
    g.poly([-8, -32, -34, -46, -32, -52, -4, -44, 4, -44, 32, -52, 34, -46, 8, -32])
      .fill({ color: 0x4d5661 })
      .stroke({ color: 0x1c2229, width: 1.8 });
    // Massive high-aspect swept B-52 main wings (span 144px!)
    g.poly([-10, 12, -72, -16, -68, -26, -12, -14, 12, -14, 68, -26, 72, -16, 10, 12])
      .fill({ color: 0x5c6672 })
      .stroke({ color: 0x1c2229, width: 2.2 });
    // 4 twin-jet engine pods slung under swept wings (iconic B-52 silhouette!)
    for (const [ex, ey] of [
      [-48, -12],
      [-26, -2],
      [26, -2],
      [48, -12]
    ]) {
      g.roundRect(ex - 4, ey - 10, 8, 22, 3).fill({ color: 0x2d343d }).stroke({ color: 0x14181c, width: 1.2 });
      g.circle(ex, ey - 11, 2.8).fill({ color: 0xff6e1a });
    }
    // Long strategic fuselage pointing down (+Y)
    g.poly([0, 52, 7, 38, 9, 10, 9, -40, 5, -49, -5, -49, -9, -40, -9, 10, -7, 38])
      .fill({ color: 0x737f8c })
      .stroke({ color: 0x1c2229, width: 2.2 });
    // Dark bomber nose & wide cockpit windscreen
    g.poly([0, 52, 5, 40, -5, 40]).fill({ color: 0x252b33 });
    g.roundRect(-6, 22, 12, 9, 3).fill({ color: 0x3b99cc }).stroke({ color: 0x152c3b, width: 1.4 });
    // Tall vertical tailfin ridge
    g.rect(-2.2, -51, 4.4, 22).fill({ color: 0x323a44 });
    // Crimson command ring + insignia stars on wings
    g.star(-56, -15, 5, 6, 2.5).fill({ color: 0xf4f7fa }).stroke({ color: 0x1b365d, width: 1 });
    g.star(56, -15, 5, 6, 2.5).fill({ color: 0xf4f7fa }).stroke({ color: 0x1b365d, width: 1 });
    g.circle(0, 2, 7).fill({ color: 0xc91e3a }).stroke({ color: 0xffe45c, width: 1.8 });
    c.addChild(g);
    return c;
  }

  switch (faction) {
    case 'phap': {
      // French armored recon outpost
      g.roundRect(-34, -22, 68, 44, 6).fill({ color: 0x635748 }).stroke({ color: 0x2b241d, width: 2.2 });
      g.circle(0, 0, 14).fill({ color: 0x80705e }).stroke({ color: 0x2b241d, width: 1.5 });
      g.rect(-4, 6, 8, 19).fill({ color: 0x2b251f });
      g.circle(0, 0, 6).fill({ color: 0xc92424 });
      break;
    }

    case 'phap_plus': {
      // Unmistakable Top-Down Twin-Propeller Bomber Aircraft (B-26 Invader, facing +Y)
      // Drop shadow offset
      g.ellipse(6, 8, 52, 10).fill({ color: 0x1a1a1a, alpha: 0.16 });
      // Main straight tapered wings (span 112px)
      g.poly([-56, -4, -10, -14, 10, -14, 56, -4, 54, 8, 10, 12, -10, 12, -54, 8])
        .fill({ color: 0x6f756b })
        .stroke({ color: 0x2b3029, width: 1.8 });
      // Tailplane horizontal stabilizer (at top / rear -Y)
      g.poly([-24, -36, 24, -36, 20, -27, -20, -27])
        .fill({ color: 0x62695f })
        .stroke({ color: 0x2b3029, width: 1.5 });
      // Long cylindrical fuselage pointing down (+Y)
      g.poly([0, 38, 7, 26, 8, -14, 4, -39, -4, -39, -8, -14, -7, 26])
        .fill({ color: 0x7f877b })
        .stroke({ color: 0x2b3029, width: 1.8 });
      // Twin wing engine nacelles
      g.roundRect(-27, -8, 10, 26, 4).fill({ color: 0x4c524a }).stroke({ color: 0x222621, width: 1.4 });
      g.roundRect(17, -8, 10, 26, 4).fill({ color: 0x4c524a }).stroke({ color: 0x222621, width: 1.4 });
      // Spinning propeller discs in front of nacelles (+Y)
      g.rect(-34, 18, 24, 3).fill({ color: 0x222222, alpha: 0.72 });
      g.rect(10, 18, 24, 3).fill({ color: 0x222222, alpha: 0.72 });
      // Cockpit glass canopy
      g.roundRect(-4.5, 6, 9, 15, 4).fill({ color: 0x4fa3d1 }).stroke({ color: 0x1d3f54, width: 1.2 });
      // Vertical tailfin ridge
      g.rect(-1.8, -40, 3.6, 15).fill({ color: 0x3b4039 });
      // Wing roundels
      g.circle(-39, 2, 5.5).fill({ color: 0xc92424 });
      g.circle(-39, 2, 3.2).fill({ color: 0xffffff });
      g.circle(-39, 2, 1.5).fill({ color: 0x1e4ea8 });
      g.circle(39, 2, 5.5).fill({ color: 0xc92424 });
      g.circle(39, 2, 3.2).fill({ color: 0xffffff });
      g.circle(39, 2, 1.5).fill({ color: 0x1e4ea8 });
      break;
    }

    case 'nguy': {
      // M113 Armored Patrol Vehicle facing +Y
      g.roundRect(-30, -26, 60, 52, 6).fill({ color: 0x4c5e4e }).stroke({ color: 0x222d24, width: 2 });
      g.rect(-34, -22, 6, 44).fill({ color: 0x242925 });
      g.rect(28, -22, 6, 44).fill({ color: 0x242925 });
      g.rect(-20, -16, 40, 28).fill({ color: 0x3a4a3c });
      g.circle(0, 2, 11).fill({ color: 0x5c735f }).stroke({ color: 0x1e261f, width: 1.5 });
      g.rect(-3, 8, 6, 20).fill({ color: 0x1f2420 });
      g.circle(0, 2, 4.5).fill({ color: 0xd96b14 });
      break;
    }

    case 'my': {
      // Unmistakable Top-Down Swept-Wing Twin-Jet Fighter-Bomber (F-4 Phantom, facing +Y!)
      // Subtle altitude shadow
      g.poly([6, 44, 60, -2, 56, -12, 14, -28, -14, -28, -56, -12, -60, -2])
        .fill({ color: 0x141a22, alpha: 0.14 });

      // Swept-back horizontal tail stabilizers (rear -Y)
      g.poly([-8, -26, -32, -39, -30, -45, -4, -38, 4, -38, 30, -45, 32, -39, 8, -26])
        .fill({ color: 0x5b6570 })
        .stroke({ color: 0x222930, width: 1.6 });

      // Swept delta main wings (span 116px!)
      g.poly([
        -10, 10,
        -58, -12,
        -56, -22,
        -14, -18,
        14, -18,
        56, -22,
        58, -12,
        10, 10
      ])
        .fill({ color: 0x6c7782 })
        .stroke({ color: 0x222930, width: 2 });

      // Underwing bomb pylons (4 ordnance pods)
      for (const px of [-36, -24, 24, 36]) {
        g.roundRect(px - 2.5, -14, 5, 16, 2).fill({ color: 0x343b42 }).stroke({ color: 0x181c20, width: 1 });
      }

      // Twin side air intakes
      g.poly([-14, 12, -16, -8, -8, -10, -8, 12]).fill({ color: 0x4d5661 }).stroke({ color: 0x20262c, width: 1.2 });
      g.poly([14, 12, 16, -8, 8, -10, 8, 12]).fill({ color: 0x4d5661 }).stroke({ color: 0x20262c, width: 1.2 });

      // Long pointed supersonic fuselage & nose cone pointing down (+Y)
      g.poly([0, 46, 6, 30, 9, 8, 9, -32, 6, -40, -6, -40, -9, -32, -9, 8, -6, 30])
        .fill({ color: 0x828e99 })
        .stroke({ color: 0x222930, width: 2 });

      // Dark radome nose tip
      g.poly([0, 46, 4.5, 33, -4.5, 33]).fill({ color: 0x2a3038 });

      // Tandem glass fighter cockpit canopy
      g.ellipse(0, 14, 4.5, 13).fill({ color: 0x3399cc }).stroke({ color: 0x142c3b, width: 1.4 });
      g.ellipse(-1, 16, 1.5, 7).fill({ color: 0xaee6ff, alpha: 0.7 });

      // Central vertical tailfin stripe
      g.rect(-2, -41, 4, 18).fill({ color: 0x3e4752 });

      // Twin glowing jet afterburner nozzles at rear (-Y)
      g.circle(-4.2, -42, 3.6).fill({ color: 0xff6e1a });
      g.circle(4.2, -42, 3.6).fill({ color: 0xff6e1a });
      g.circle(-4.2, -43, 1.8).fill({ color: 0xfff5a8 });
      g.circle(4.2, -43, 1.8).fill({ color: 0xfff5a8 });

      // Star insignia on swept wings
      g.star(-38, -11, 5, 5.5, 2.3).fill({ color: 0xf4f7fa }).stroke({ color: 0x1b365d, width: 1 });
      g.star(38, -11, 5, 5.5, 2.3).fill({ color: 0xf4f7fa }).stroke({ color: 0x1b365d, width: 1 });
      break;
    }

    case 'nguy_minus': {
      // Weakened retreating remnant barrier outpost
      g.roundRect(-30, -18, 60, 36, 5).fill({ color: 0x6b6861 }).stroke({ color: 0x33312d, width: 1.8 });
      g.rect(-4, 10, 8, 12).fill({ color: 0x2b2a27 });
      g.circle(0, 0, 9).fill({ color: 0xc95a2b });
      break;
    }
  }

  c.addChild(g);
  return c;
}

/**
 * Glowing collectible historical cipher document pickup (high visibility on bright daylight maps).
 */
export function createLorePickupSprite(): Container {
  const c = new Container();
  const g = new Graphics();
  g.circle(0, 0, 18).fill({ color: 0xd99b1e, alpha: 0.25 });
  g.circle(0, 0, 13).stroke({ color: 0x8c1c1c, width: 2, alpha: 0.85 });
  g.roundRect(-8, -9, 16, 18, 2).fill({ color: 0xfff8e3 }).stroke({ color: 0x7a5618, width: 1.8 });
  g.moveTo(-4, -3).lineTo(4, -3).stroke({ color: 0x5c3e10, width: 1.6 });
  g.moveTo(-4, 1).lineTo(4, 1).stroke({ color: 0x5c3e10, width: 1.6 });
  g.moveTo(-4, 5).lineTo(2, 5).stroke({ color: 0x5c3e10, width: 1.6 });
  c.addChild(g);
  return c;
}

export interface GateParts {
  container: Container;
  leftLeaf: Graphics;
  rightLeaf: Graphics;
  flag: Container;
}

/**
 * Iconic Sunlit Dinh Độc Lập Iron Gate & Palace backdrop at northern end of Region 5.
 */
export function createIndependencePalaceGate(): GateParts {
  const container = new Container();

  const palace = new Graphics();
  palace.rect(-360, -240, 720, 230).fill({ color: 0x7cb06f });
  palace.rect(-230, -215, 460, 120).fill({ color: 0xf4f0e4 }).stroke({ color: 0x8c8575, width: 2.2 });
  for (let lx = -210; lx <= 210; lx += 16) {
    palace.rect(lx, -200, 6, 88).fill({ color: 0xc9c2b0 });
  }
  palace.rect(-95, -110, 190, 26).fill({ color: 0xa69f8f });
  container.addChild(palace);

  const pillars = new Graphics();
  pillars.rect(-360, -14, 260, 20).fill({ color: 0xd9d2be }).stroke({ color: 0x6b6557, width: 2 });
  pillars.rect(100, -14, 260, 20).fill({ color: 0xd9d2be }).stroke({ color: 0x6b6557, width: 2 });
  pillars.roundRect(-108, -22, 26, 36, 3).fill({ color: 0xebe5d5 }).stroke({ color: 0x595346, width: 2 });
  pillars.roundRect(82, -22, 26, 36, 3).fill({ color: 0xebe5d5 }).stroke({ color: 0x595346, width: 2 });
  container.addChild(pillars);

  const leftLeaf = new Graphics();
  leftLeaf.position.set(-82, 0);
  leftLeaf.rect(0, -10, 81, 16).fill({ color: 0x353f42, alpha: 0.92 }).stroke({ color: 0x7d8a8f, width: 2 });
  for (let gx = 8; gx < 78; gx += 10) {
    leftLeaf.moveTo(gx, -10).lineTo(gx, 6).stroke({ color: 0xc2ccd1, width: 1.5 });
  }
  container.addChild(leftLeaf);

  const rightLeaf = new Graphics();
  rightLeaf.position.set(82, 0);
  rightLeaf.rect(-81, -10, 81, 16).fill({ color: 0x353f42, alpha: 0.92 }).stroke({ color: 0x7d8a8f, width: 2 });
  for (let gx = -74; gx < -4; gx += 10) {
    rightLeaf.moveTo(gx, -10).lineTo(gx, 6).stroke({ color: 0xc2ccd1, width: 1.5 });
  }
  container.addChild(rightLeaf);

  const flag = new Container();
  flag.position.set(0, -140);
  flag.visible = false;
  const fg = new Graphics();
  fg.rect(-3, -60, 6, 90).fill({ color: 0x6e6e6e });
  fg.rect(3, -58, 74, 24).fill({ color: 0xd92323 });
  fg.rect(3, -34, 74, 24).fill({ color: 0x1e66c9 });
  fg.star(40, -34, 5, 13, 5.5).fill({ color: 0xffe44d });
  flag.addChild(fg);
  container.addChild(flag);

  return { container, leftLeaf, rightLeaf, flag };
}
