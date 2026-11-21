import { Container, Graphics } from 'pixi.js';

// Gallery-only concepts. Gameplay continues to use SpriteFactory until a design is approved.
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
