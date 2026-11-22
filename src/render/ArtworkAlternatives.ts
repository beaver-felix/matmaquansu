import { Container, Graphics } from 'pixi.js';

import type { GateParts } from './OriginalArtwork';
function vietnamFlag(g: Graphics, x: number, y: number, width: number): void {
  const height = width * 2 / 3;
  g.rect(x - width / 2, y - height / 2, width, height).fill({ color: 0xc92b27 });
  g.star(x, y, 5, height * 0.36, height * 0.14).fill({ color: 0xffdf5a });
}

export function createBicycleAlternative(packed: boolean): Container {
  const root = new Container();
  const halfHeight = packed ? 17 : 14;
  const shadow = new Graphics();
  shadow.ellipse(2, 3, packed ? 12 : 8, halfHeight - 1).fill({ color: 0x25382c, alpha: 0.18 });
  const frame = new Graphics();
  for (const y of [-halfHeight + 4, halfHeight - 4]) {
    frame.roundRect(-1.8, y - 4, 3.6, 8, 1.8).fill({ color: 0x1d2926 });
    frame.moveTo(-0.7, y - 3).lineTo(-0.7, y + 3).stroke({ color: 0x89968a, width: 0.7 });
  }
  frame.moveTo(0, -halfHeight + 3).lineTo(0, halfHeight - 3).stroke({ color: 0x789576, width: 2 });
  frame.moveTo(-6.5, -halfHeight + 7).lineTo(-4, -halfHeight + 8).lineTo(4, -halfHeight + 8)
    .lineTo(6.5, -halfHeight + 7).stroke({ color: 0x263831, width: 1.3 });
  const load = new Graphics();
  if (packed) {
    for (const x of [-11, 5]) {
      load.roundRect(x + 1, -3, 6, 17, 2).fill({ color: 0x594a33 });
      load.roundRect(x, -5, 6, 17, 2).fill({ color: 0xb9a071 });
      load.moveTo(x + 1, -3).lineTo(x + 1, 10).stroke({ color: 0xe0c994, width: 0.8 });
      load.moveTo(x + 3, -5).lineTo(x + 3, 12).stroke({ color: 0x6e6445, width: 1 });
      load.moveTo(x, 2).lineTo(x + 6, 2).stroke({ color: 0x6e6445, width: 1 });
    }
  }
  const rider = new Graphics();
  rider.moveTo(-3, 1).lineTo(-4, 7).lineTo(-2, 10).moveTo(3, 1).lineTo(4, 7).lineTo(2, 10)
    .stroke({ color: 0x263f2e, width: 2.5 });
  rider.moveTo(-5, -3).lineTo(-6, -7).lineTo(-5, -halfHeight + 8)
    .moveTo(5, -3).lineTo(6, -7).lineTo(5, -halfHeight + 8).stroke({ color: 0x6b8351, width: 2 });
  rider.moveTo(-5, -4).quadraticCurveTo(0, -7, 5, -4).lineTo(4, 5)
    .quadraticCurveTo(0, 7, -4, 5).closePath().fill({ color: 0x4e6f43 });
  rider.moveTo(-4, -3).lineTo(-3, 4).stroke({ color: 0x98ab73, width: 1 });
  vietnamFlag(rider, 0, 1, 7);
  rider.ellipse(0, -7, 4.5, 3).fill({ color: 0x5b633f });
  rider.ellipse(-0.5, -8, 3.8, 3).fill({ color: 0xb2af79 });
  rider.moveTo(-3, -9).quadraticCurveTo(-1, -11, 1, -10).stroke({ color: 0xe0d7a0, width: 0.8 });
  root.addChild(shadow, frame, load, rider);
  return root;
}

export function createOutpostAlternative(kind: 'fort' | 'scout' | 'remnant'): Container {
  const root = new Container();
  const shadow = new Graphics();
  const base = new Graphics();
  const top = new Graphics();
  if (kind === 'scout') {
    shadow.roundRect(-29, -17, 64, 42, 8).fill({ color: 0x302b22, alpha: 0.2 });
    for (const x of [-32, 23]) {
      for (const y of [-15, 7]) {
        base.roundRect(x, y, 9, 12, 3).fill({ color: 0x242d28 });
        base.moveTo(x + 2, y + 2).lineTo(x + 2, y + 10).stroke({ color: 0x7b7e6a, width: 1 });
      }
    }
    base.poly([-23, -21, 23, -21, 28, 12, 19, 22, -19, 22, -28, 12]).fill({ color: 0x4b4d3c });
    base.poly([-22, -21, 22, -21, 25, 10, -25, 10]).fill({ color: 0x8b8868 });
    base.poly([-25, 10, 25, 10, 18, 20, -18, 20]).fill({ color: 0xaaa17b });
    base.moveTo(-22, -19).lineTo(-24, 8).stroke({ color: 0xc0ba91, width: 1.2 });
    for (let y = -16; y < -5; y += 3) {
      base.moveTo(-14, y).lineTo(2, y).stroke({ color: 0x555f48, width: 1.2 });
    }
    top.ellipse(4, 4, 13, 11).fill({ color: 0x303d2b, alpha: 0.3 });
    top.poly([-8, -9, 7, -10, 13, -3, 10, 8, -7, 10, -13, 3]).fill({ color: 0x505b42 });
    top.poly([-8, -11, 7, -12, 12, -5, 9, 5, -7, 7, -12, 0]).fill({ color: 0x9c9a70 });
    top.moveTo(-10, -3).lineTo(-7, -9).lineTo(5, -10).stroke({ color: 0xc5c29a, width: 1 });
    top.roundRect(-2, 2, 5, 24, 1).fill({ color: 0x344231 });
    top.rect(-1, 3, 1.3, 21).fill({ color: 0xadb58a });
    top.roundRect(3, -7, 5, 5, 1.5).fill({ color: 0x6c7655 });
    for (const x of [-19, 15]) top.rect(x, 16, 4, 2).fill({ color: 0xe8d8a2 });
  } else {
    const w = kind === 'fort' ? 88 : 60;
    const h = kind === 'fort' ? 56 : 36;
    shadow.roundRect(-w / 2 + 4, -h / 2 + 5, w, h, 5).fill({ color: 0x352b22, alpha: 0.2 });
    base.poly([-w / 2, -h / 2 + 7, -w / 2 + 9, -h / 2, w / 2 - 9, -h / 2,
      w / 2, -h / 2 + 7, w / 2, h / 2, -w / 2, h / 2]).fill({ color: 0x6e6451 });
    base.rect(-w / 2 + 4, h / 2 - 9, w - 8, 9).fill({ color: 0x494638 });
    for (let x = -w / 2 + 4; x < w / 2 - 6; x += 12) {
      base.roundRect(x, h / 2 - 3, 11, 6, 2).fill({ color: 0xa28e67 });
      base.moveTo(x + 2, h / 2 - 2).lineTo(x + 8, h / 2 - 2).stroke({ color: 0xcdba8f, width: 0.8 });
    }
    top.poly([-w / 2 + 5, -h / 2 + 7, -w / 2 + 11, -h / 2 + 2, w / 2 - 11, -h / 2 + 2,
      w / 2 - 5, -h / 2 + 7, w / 2 - 5, h / 2 - 12, -w / 2 + 5, h / 2 - 12])
      .fill({ color: kind === 'fort' ? 0xa69b7d : 0x979783 });
    top.moveTo(-w / 2 + 6, h / 2 - 13).lineTo(-w / 2 + 6, -h / 2 + 8)
      .lineTo(-w / 2 + 12, -h / 2 + 3).lineTo(w / 2 - 12, -h / 2 + 3)
      .stroke({ color: 0xd6caab, width: 1.2 });
    for (const x of kind === 'fort' ? [-23, 23] : [0]) {
      top.roundRect(x - 10, h / 2 - 13, 20, 6, 1).fill({ color: 0x202b26 });
      top.rect(x - 2, h / 2 - 10, 4, 12).fill({ color: 0x3d4d3e });
      top.rect(x - 1, h / 2 - 10, 1, 10).fill({ color: 0x8d9b7f });
    }
    top.roundRect(-9, -h / 2 + 7, 18, 9, 2).fill({ color: 0x6c725c });
    for (let x = -6; x <= 6; x += 3) top.moveTo(x, -h / 2 + 9).lineTo(x, -h / 2 + 14).stroke({ color: 0x454d40, width: 1 });
    if (kind === 'remnant') {
      top.moveTo(14, -14).lineTo(9, -8).lineTo(15, -4).lineTo(11, 3).stroke({ color: 0x5e6252, width: 1.4 });
      top.poly([-25, -8, -20, -10, -22, -3]).fill({ color: 0x5f6957 });
    }
  }
  root.addChild(shadow, base, top);
  return root;
}

export function createAircraftAlternative(kind: 'b26' | 'f4' | 'b52'): Container {
  const root = new Container();
  const swept = kind !== 'b26';
  const span = kind === 'b52' ? 72 : kind === 'f4' ? 58 : 56;
  const nose = kind === 'b52' ? 52 : kind === 'f4' ? 46 : 38;
  const tail = kind === 'b52' ? -49 : kind === 'f4' ? -40 : -39;
  const wings = swept
    ? [-9, 9, -span, -16, -span + 4, -25, -10, -14, 10, -14, span - 4, -25, span, -16, 9, 9]
    : [-10, -13, -span, -5, -span + 2, 7, -9, 10, 9, 10, span - 2, 7, span, -5, 10, -13];
  const shadow = new Graphics();
  shadow.poly(wings).fill({ color: 0x1d2b31, alpha: 0.12 });
  shadow.ellipse(0, -1, 9, nose - 4).fill({ color: 0x1d2b31, alpha: 0.12 });
  shadow.position.set(4, 5);
  const airframe = new Graphics();
  airframe.poly([-5, tail + 8, -27, tail - 2, -24, tail - 7, -4, tail + 1,
    4, tail + 1, 24, tail - 7, 27, tail - 2, 5, tail + 8]).fill({ color: 0x596e74 });
  airframe.poly(wings).fill({ color: kind === 'b26' ? 0x7d8c79 : 0x879da7 }).stroke({ color: 0x354c53, width: 1.2 });
  for (const sign of [-1, 1]) {
    airframe.poly(swept
      ? [sign * 10, -13, sign * (span - 5), -23, sign * (span - 2), -18, sign * 10, -7]
      : [sign * 10, -12, sign * (span - 2), -4, sign * (span - 3), -1, sign * 10, -8])
      .fill({ color: 0xc2cbbf, alpha: 0.75 });
    airframe.moveTo(sign * 15, swept ? -1 : 6).lineTo(sign * (span - 7), swept ? -17 : 4)
      .stroke({ color: 0x536a6d, width: 1 });
  }
  const engines = new Graphics();
  if (kind === 'b26') {
    for (const x of [-23, 23]) {
      engines.roundRect(x - 6, -10, 12, 27, 5).fill({ color: 0x485d50 });
      engines.roundRect(x - 4, -10, 7, 24, 3).fill({ color: 0x9ca88a });
      engines.ellipse(x, 18, 13, 2.5).fill({ color: 0x71837b, alpha: 0.3 });
      engines.moveTo(x - 12, 18).lineTo(x + 12, 18).stroke({ color: 0x283d36, width: 1.5 });
      engines.circle(x, 17, 2.5).fill({ color: 0xc6c8a7 });
    }
  } else if (kind === 'b52') {
    for (const [x, y] of [[-47, -12], [-27, -3], [27, -3], [47, -12]]) {
      engines.roundRect(x - 5, y - 9, 10, 21, 4).fill({ color: 0x3b535e });
      for (const dx of [-2.5, 2.5]) {
        engines.roundRect(x + dx - 1.8, y - 8, 3.6, 18, 1.8).fill({ color: 0x9eb0b5 });
        engines.ellipse(x + dx, y + 9, 1.8, 2.3).fill({ color: 0x253f4b });
      }
    }
  } else {
    for (const sign of [-1, 1]) {
      engines.poly([sign * 8, 13, sign * 16, 8, sign * 15, -17, sign * 9, -24]).fill({ color: 0x536f7a });
      engines.poly([sign * 10, 12, sign * 15, 8, sign * 14, 3, sign * 10, 4]).fill({ color: 0x253f4b });
      engines.ellipse(sign * 5, tail + 1, 3, 4).fill({ color: 0x344a53 });
      engines.ellipse(sign * 5, tail + 1, 1.4, 2.5).fill({ color: 0xc78452 });
    }
  }
  const body = new Graphics();
  body.moveTo(0, nose).bezierCurveTo(-7, nose - 8, -9, 14, -8, -9)
    .lineTo(-4, tail).quadraticCurveTo(0, tail - 4, 4, tail).lineTo(8, -9)
    .bezierCurveTo(9, 14, 7, nose - 8, 0, nose).closePath().fill({ color: 0xa4b6b6 }).stroke({ color: 0x3a5359, width: 1 });
  body.moveTo(0, nose - 3).quadraticCurveTo(8, 19, 7, -7).lineTo(3, tail + 1)
    .lineTo(1, tail + 1).lineTo(2, 14).closePath().fill({ color: 0x66808a });
  body.moveTo(-2, nose - 12).quadraticCurveTo(-6, 12, -4, -9).lineTo(-2, tail + 4)
    .stroke({ color: 0xd9e2d8, width: 1.5 });
  body.poly([0, nose, -4, nose - 10, 4, nose - 10]).fill({ color: 0x354d57 });
  body.ellipse(0, nose - 22, 4.5, kind === 'f4' ? 12 : 7).fill({ color: 0x244955 });
  body.ellipse(-1, nose - 23, 2.4, kind === 'f4' ? 9 : 4.5).fill({ color: 0x89c5c4 });
  body.moveTo(-3, nose - 23).lineTo(3, nose - 23).stroke({ color: 0x345862, width: 1 });
  body.poly([-1.5, tail - 2, 1.5, tail - 2, 3, tail + 15, -2, tail + 13]).fill({ color: 0x47616c });
  const markings = new Graphics();
  for (const sign of [-1, 1]) {
    const x = sign * (span - 17);
    const y = swept ? -16 : 1;
    if (kind === 'b26') {
      markings.circle(x, y, 4.5).fill({ color: 0xc33b39 });
      markings.circle(x, y, 3).fill({ color: 0xf1eee0 });
      markings.circle(x, y, 1.6).fill({ color: 0x355c83 });
    } else {
      markings.rect(x - 6, y - 1.5, 12, 3).fill({ color: 0xe6ede5 });
      markings.circle(x, y, 4.5).fill({ color: 0x34516b });
      markings.star(x, y, 5, 3.6, 1.5).fill({ color: 0xf2f3e7 });
    }
  }
  root.addChild(shadow, airframe, engines, body, markings);
  return root;
}

export function createJeepAlternative(): Container {
  const root = new Container();
  const shadow = new Graphics();
  shadow.roundRect(-11, -17, 27, 40, 6).fill({ color: 0x25382c, alpha: 0.2 });
  const chassis = new Graphics();
  for (const x of [-15, 10]) {
    for (const y of [-16, 8]) {
      chassis.roundRect(x, y, 5, 10, 1.5).fill({ color: 0x1c2b25 });
      chassis.moveTo(x + 1, y + 2).lineTo(x + 1, y + 8).stroke({ color: 0x7c8871, width: 0.7 });
    }
  }
  chassis.roundRect(-12, -20, 24, 41, 4).fill({ color: 0x294733 });
  const body = new Graphics();
  body.poly([-9, -21, 9, -21, 12, -15, 12, 17, 9, 20, -9, 20, -12, 17, -12, -15])
    .fill({ color: 0x5f8051 });
  body.roundRect(-9, -19, 18, 13, 2).fill({ color: 0x87a16a });
  body.moveTo(-8, -18).lineTo(-8, -7).stroke({ color: 0xc3cfa0, width: 0.8 });
  body.rect(8, -17, 2, 10).fill({ color: 0x4f7047 });
  vietnamFlag(body, 0, -12, 10);
  body.roundRect(-9, -1, 18, 16, 2).fill({ color: 0x263d2e });
  for (const x of [-7, 1]) {
    body.roundRect(x, 1, 6, 9, 1.5).fill({ color: 0x9b966a });
    body.roundRect(x, 7, 6, 4, 1).fill({ color: 0x6a724f });
  }
  body.circle(-4, 0, 2).stroke({ color: 0xc1c4a0, width: 0.8 });
  body.roundRect(-10, -6, 20, 5, 1).fill({ color: 0x23483f });
  body.poly([-9, -5, -1, -5, -1, -2, -9, -2]).fill({ color: 0x9ac9bd });
  body.poly([1, -5, 9, -5, 9, -2, 1, -2]).fill({ color: 0x6ca49a });
  body.moveTo(-10, -6).lineTo(10, -6).stroke({ color: 0xc6ce9e, width: 0.9 });
  body.roundRect(-5, 14, 10, 7, 2.5).fill({ color: 0x20372b });
  body.ellipse(0, 17, 2.5, 2).fill({ color: 0x6c8556 });
  body.rect(-11, -22, 22, 2).fill({ color: 0x5f7154 });
  for (const x of [-9, 6]) body.roundRect(x, -21, 3, 2, 0.5).fill({ color: 0xf3dda1 });
  root.addChild(shadow, chassis, body);
  return root;
}

export function createTruckAlternative(): Container {
  const root = new Container();
  const shadow = new Graphics();
  shadow.roundRect(-13, -23, 32, 53, 6).fill({ color: 0x25382c, alpha: 0.2 });
  const chassis = new Graphics();
  chassis.roundRect(-13, -25, 26, 52, 3).fill({ color: 0x293e2d });
  for (const x of [-18, 13]) {
    for (const y of [-19, 8, 19]) {
      chassis.roundRect(x, y, 5, 8, 1.5).fill({ color: 0x192b23 });
      chassis.moveTo(x + 1, y + 1).lineTo(x + 1, y + 7).stroke({ color: 0x78866b, width: 0.8 });
    }
  }
  const cab = new Graphics();
  cab.roundRect(-14, -27, 28, 18, 4).fill({ color: 0x4c7248 });
  cab.poly([-10, -27, 10, -27, 13, -22, -13, -22]).fill({ color: 0x93a974 });
  cab.moveTo(-12, -21).lineTo(-12, -12).stroke({ color: 0xb1c38d, width: 1 });
  cab.roundRect(-11, -22, 22, 6, 1.5).fill({ color: 0x294e45 });
  cab.poly([-10, -21, -1, -21, -1, -17, -9, -17]).fill({ color: 0x9acabd });
  cab.poly([1, -21, 10, -21, 9, -17, 1, -17]).fill({ color: 0x709f91 });
  vietnamFlag(cab, 0, -12, 10);
  cab.rect(-13, -28, 26, 2).fill({ color: 0x566c4c });
  for (const x of [-11, 7]) cab.roundRect(x, -27, 4, 2, 0.5).fill({ color: 0xf3dda1 });
  const cargo = new Graphics();
  cargo.roundRect(-14, -6, 28, 34, 2).fill({ color: 0x3b5238 });
  cargo.moveTo(-14, 24).lineTo(-14, -2).quadraticCurveTo(-13, -8, -8, -8)
    .lineTo(8, -8).quadraticCurveTo(13, -8, 14, -2).lineTo(14, 24).closePath().fill({ color: 0x7d8960 });
  cargo.moveTo(-8, -7).lineTo(-8, 24).lineTo(7, 24).lineTo(7, -7).closePath().fill({ color: 0x9b9e72 });
  cargo.poly([7, -7, 12, -4, 14, 24, 7, 24]).fill({ color: 0x606f4b });
  for (const y of [-1, 8, 17]) {
    cargo.moveTo(-13, y + 2).quadraticCurveTo(0, y - 3, 13, y + 2).stroke({ color: 0x566a49, width: 1 });
    cargo.moveTo(-7, y).quadraticCurveTo(0, y - 2, 6, y).stroke({ color: 0xc3c297, width: 0.8 });
  }
  cargo.rect(-13, 24, 26, 3).fill({ color: 0x4a6541 });
  for (const x of [-10, 9]) cargo.rect(x, 24, 2, 3).fill({ color: 0xbbbd86 });
  root.addChild(shadow, chassis, cab, cargo);
  return root;
}

export function createPalaceAlternative(): Container {
  const parts = createPalaceArtwork();
  parts.flag.visible = true;
  return parts.container;
}

export function createPalaceArtwork(): GateParts {
  const root = new Container();
  const grounds = new Graphics();
  grounds.rect(-360, -240, 720, 250).fill({ color: 0x839969 });
  grounds.rect(-340, -220, 680, 212).fill({ color: 0x9aae78 });
  grounds.poly([-94, -80, 94, -80, 130, 2, -130, 2]).fill({ color: 0xd6cbb4 });
  grounds.ellipse(0, -42, 47, 18).fill({ color: 0x6e8860 });
  grounds.ellipse(0, -46, 44, 16).fill({ color: 0xdfdcc6 });
  grounds.ellipse(0, -47, 37, 11).fill({ color: 0x72aaa4 });
  grounds.ellipse(-6, -49, 26, 5).fill({ color: 0xadd1bd });
  for (const x of [-300, -260, 260, 300]) {
    for (const y of [-170, -110, -50]) {
      grounds.ellipse(x + 5, y + 5, 13, 10).fill({ color: 0x536d47, alpha: 0.35 });
      grounds.circle(x, y, 12).fill({ color: 0x4c7451 });
      grounds.circle(x - 3, y - 3, 8).fill({ color: 0x779761 });
    }
  }
  const building = new Graphics();
  building.rect(-225, -207, 464, 121).fill({ color: 0x5f6a55, alpha: 0.3 });
  building.rect(-230, -218, 460, 120).fill({ color: 0xbab8a1 });
  building.rect(-222, -211, 444, 105).fill({ color: 0xe2ddc5 });
  building.rect(-215, -200, 430, 77).fill({ color: 0x42605b });
  for (let x = -208; x < 210; x += 24) {
    building.rect(x, -196, 15, 29).fill({ color: 0x8aa69a });
    building.rect(x, -160, 15, 30).fill({ color: 0x708f83 });
    building.rect(x, -196, 2, 66).fill({ color: 0xd4d4b8 });
  }
  for (let x = -216; x <= 210; x += 16) {
    building.poly([x, -202, x + 4, -205, x + 7, -203, x + 7, -123, x + 4, -120, x, -122])
      .fill({ color: 0xece6ce });
    building.rect(x + 4, -201, 3, 77).fill({ color: 0xb5b79e });
  }
  building.rect(-230, -218, 460, 9).fill({ color: 0xf3ecd5 });
  building.rect(-230, -209, 460, 3).fill({ color: 0x9b9f89 });
  building.rect(-230, -169, 460, 5).fill({ color: 0xe8e1c8 });
  building.rect(-230, -124, 460, 8).fill({ color: 0xf0e6ce });
  building.roundRect(-100, -232, 200, 14, 2).fill({ color: 0xc8c6ae });
  building.rect(-105, -234, 210, 4).fill({ color: 0xf0e8d1 });
  building.rect(-44, -124, 88, 25).fill({ color: 0x34534c });
  for (const x of [-41, -14, 13]) building.rect(x, -121, 25, 20).fill({ color: 0x749b89 });
  building.rect(-65, -128, 130, 5).fill({ color: 0xd3cdb5 });
  for (let step = 0; step < 4; step++) {
    building.rect(-72 - step * 7, -99 + step * 4, 144 + step * 14, 4).fill({ color: step % 2 === 0 ? 0xe5dbc3 : 0xc0bba4 });
  }
  const fence = new Graphics();
  for (const x of [-360, 100]) {
    fence.rect(x, -13, 260, 21).fill({ color: 0xaaa993 });
    fence.rect(x, -15, 260, 5).fill({ color: 0xe8dfc7 });
  }
  const leftLeaf = new Graphics();
  const rightLeaf = new Graphics();
  leftLeaf.position.set(-82, 0);
  rightLeaf.position.set(82, 0);
  for (const [leaf, start] of [[leftLeaf, 0], [rightLeaf, -82]] as const) {
    leaf.rect(start, -9, 82, 18).fill({ color: 0x243e39 });
    for (let x = start + 4; x < start + 82; x += 8) {
      leaf.moveTo(x, -12).lineTo(x, 8).stroke({ color: 0x9dada0, width: 1.7 });
      leaf.poly([x - 2, -11, x, -15, x + 2, -11]).fill({ color: 0xd2c79d });
    }
    leaf.moveTo(start, -4).lineTo(start + 82, -4).stroke({ color: 0xc0c4aa, width: 1.5 });
  }
  for (const x of [-108, 82]) {
    fence.roundRect(x + 4, -18, 26, 32, 2).fill({ color: 0x52644f, alpha: 0.3 });
    fence.rect(x, -24, 26, 34).fill({ color: 0xc5bea5 });
    fence.rect(x, -24, 18, 34).fill({ color: 0xe3dcc4 });
    fence.rect(x - 3, -28, 32, 6).fill({ color: 0xf0e7cf });
    fence.circle(x + 13, -31, 4).fill({ color: 0xddcfaa });
  }
  const flag = new Container();
  const flagArt = new Graphics();
  flag.addChild(flagArt);
  flag.visible = false;
  // Keep the existing finale flag's red/blue fields and yellow star unchanged.
  flagArt.rect(-2, -226, 4, 100).fill({ color: 0x6a7c70 });
  flagArt.rect(-2, -226, 1, 100).fill({ color: 0xcbd0b8 });
  flagArt.rect(2, -225, 54, 18).fill({ color: 0xd92323 });
  flagArt.rect(2, -207, 54, 18).fill({ color: 0x1e66c9 });
  flagArt.star(29, -207, 5, 10, 4.2).fill({ color: 0xffe44d });
  root.addChild(grounds, building, fence, leftLeaf, rightLeaf, flag);
  return { container: root, leftLeaf, rightLeaf, flag };
}
