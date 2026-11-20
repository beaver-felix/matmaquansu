import { Container, Graphics } from 'pixi.js';
import { BossRole, FactionId } from '../core/GameState';
import { VehicleConfig } from '../data/vehicles';

export type BulletBehavior = 'linear' | 'hover_then_drift';

export interface Bullet {
  active: boolean;
  fromPlayer: boolean;
  behavior: BulletBehavior;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  hoverStart: number;
  hoverDuration: number;
  resumeVx: number;
  resumeVy: number;
  radius: number;
  damage: number;
  color: number;
  age: number;
  maxAge: number;
  graphic: Graphics;
}

export interface BombZone {
  x: number;
  y: number;
  radius: number;
  warmup: number;
  blastDuration: number;
  elapsed: number;
  detonated: boolean;
}

/**
 * High-tension bullet-curtain + circular AoE bomb engine:
 * - Player fires ONLY 1 slim auto-tracking homing stream with tiny damage (no spread AoE).
 * - Boss deploys slow, dense geometric bullet curtains, suspended hovering bullets (đạn lơ lửng),
 *   and large circular AoE bomb strike zones (vùng tròn nổ bom AOE lớn) that force relocation.
 */
export class BulletEngine {
  private layer: Container;
  private hazardLayer: Graphics;
  private pool: Bullet[] = [];
  private bombs: BombZone[] = [];

  constructor(parent: Container, initialPoolSize = 560) {
    this.hazardLayer = new Graphics();
    this.layer = new Container();
    parent.addChild(this.hazardLayer);
    parent.addChild(this.layer);

    for (let i = 0; i < initialPoolSize; i++) {
      this.pool.push(this.createSlot());
    }
  }

  private createSlot(): Bullet {
    const g = new Graphics();
    g.visible = false;
    this.layer.addChild(g);
    return {
      active: false,
      fromPlayer: false,
      behavior: 'linear',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      speed: 0,
      hoverStart: 0,
      hoverDuration: 0,
      resumeVx: 0,
      resumeVy: 0,
      radius: 5.5,
      damage: 1,
      color: 0xc92424,
      age: 0,
      maxAge: 14,
      graphic: g
    };
  }

  spawnBullet(params: {
    fromPlayer: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    damage: number;
    color: number;
    behavior?: BulletBehavior;
    hoverStart?: number;
    hoverDuration?: number;
    resumeVx?: number;
    resumeVy?: number;
    maxAge?: number;
  }): void {
    let slot = this.pool.find((b) => !b.active);
    if (!slot) {
      slot = this.createSlot();
      this.pool.push(slot);
    }

    slot.active = true;
    slot.fromPlayer = params.fromPlayer;
    slot.behavior = params.behavior ?? 'linear';
    slot.x = params.x;
    slot.y = params.y;
    slot.vx = params.vx;
    slot.vy = params.vy;
    slot.speed = Math.hypot(params.vx, params.vy);
    slot.hoverStart = params.hoverStart ?? 0;
    slot.hoverDuration = params.hoverDuration ?? 0;
    slot.resumeVx = params.resumeVx ?? params.vx * 0.55;
    slot.resumeVy = params.resumeVy ?? 65;
    slot.radius = params.radius;
    slot.damage = params.damage;
    slot.color = params.color;
    slot.age = 0;
    slot.maxAge = params.maxAge ?? 14;

    const g = slot.graphic;
    g.clear();
    if (params.fromPlayer) {
      // Single slim guided tracer bolt (compact, low damage, auto-tracking)
      g.poly([0, -7, 3.2, 4, 0, 2, -3.2, 4])
        .fill({ color: params.color })
        .stroke({ color: 0x163822, width: 1.2 });
    } else if (slot.behavior === 'hover_then_drift') {
      g.circle(0, 0, params.radius + 2.5).stroke({ color: 0x3b1818, width: 1.2, alpha: 0.45 });
      g.circle(0, 0, params.radius).fill({ color: params.color }).stroke({ color: 0x2b0e0e, width: 1.6 });
      g.circle(0, 0, Math.max(2, params.radius * 0.44)).fill({ color: 0xfff9e0 });
    } else {
      g.circle(0, 0, params.radius).fill({ color: params.color }).stroke({ color: 0x291111, width: 1.5 });
      g.circle(0, 0, Math.max(2, params.radius * 0.45)).fill({ color: 0xffffff });
    }
    g.position.set(slot.x, slot.y);
    g.rotation = Math.atan2(slot.vy, slot.vx) + Math.PI / 2;
    g.scale.set(1);
    g.visible = true;
  }

  /**
   * Spawns a large circular AoE bomb strike zone with clear countdown telegraph.
   */
  spawnBombZone(x: number, y: number, radius: number, warmup = 1.75, blastDuration = 0.45): void {
    this.bombs.push({
      x,
      y,
      radius,
      warmup,
      blastDuration,
      elapsed: 0,
      detonated: false
    });
  }

  /**
   * Fires 1 rapid straight auto-aimed tracer bolt toward the enemy boss (no curved homing).
   */
  firePlayerAutoAimShot(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    targetVx: number,
    vehicle: VehicleConfig
  ): void {
    const topY = y - vehicle.height * 0.45;
    const speed = 560;
    const rawDist = Math.hypot(targetX - x, targetY - topY);
    const leadTime = Math.min(0.32, rawDist / speed);
    const aimX = targetX + targetVx * leadTime * 0.65;
    const ang = Math.atan2(targetY - topY, aimX - x);
    const color = vehicle.id === 'tank' ? 0xd97316 : 0x1f9c54;

    this.spawnBullet({
      fromPlayer: true,
      behavior: 'linear',
      x,
      y: topY,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      radius: 3.4,
      damage: vehicle.bulletDamage,
      color,
      maxAge: 2.5
    });
  }

  /**
   * Emits dense, slow bullet curtains, hovering bullets (đạn lơ lửng),
   * and large circular AoE bomb targets (vùng tròn nổ bom lớn).
   */
  fireEnemyPattern(params: {
    faction: FactionId;
    bossRole: BossRole;
    waveIndex: number;
    enraged: boolean;
    ex: number;
    ey: number;
    px: number;
    py: number;
    arenaLeft: number;
    arenaTop: number;
    arenaWidth: number;
    arenaHeight: number;
    speedScale: number;
    onBombWarn?: () => void;
  }): void {
    const {
      faction,
      bossRole,
      waveIndex,
      enraged,
      ex,
      ey,
      px,
      py,
      arenaLeft,
      arenaTop,
      arenaWidth,
      arenaHeight,
      speedScale,
      onBombWarn
    } = params;

    const clampBombX = (x: number, r: number): number =>
      Math.max(arenaLeft + r * 0.65, Math.min(arenaLeft + arenaWidth - r * 0.65, x));
    const clampBombY = (y: number, r: number): number =>
      Math.max(arenaTop + 135, Math.min(arenaTop + arenaHeight - r * 0.65, y));

    if (bossRole === 'tutorial' || bossRole === 'rematch') {
      // Signature ultra-hard boss pattern shared between Opening Tutorial & Tuyến Lửa Trường Sơn Rematch!
      const ringCount = enraged ? 28 : 22;
      const offset = waveIndex * 0.23;
      const ringSpeed = (enraged ? 90 : 78) * speedScale;
      for (let i = 0; i < ringCount; i++) {
        const ang = offset + (i / ringCount) * Math.PI * 2;
        this.spawnBullet({
          fromPlayer: false,
          x: ex,
          y: ey,
          vx: Math.cos(ang) * ringSpeed,
          vy: Math.sin(ang) * ringSpeed,
          radius: 5.5,
          damage: 1,
          color: i % 2 === 0 ? 0xc91e3a : 0xd96b14
        });
      }

      if (waveIndex % 2 === 0) {
        const hoverCount = enraged ? 13 : 10;
        for (let i = 0; i < hoverCount; i++) {
          const ang = Math.PI * 0.1 + (i / (hoverCount - 1)) * Math.PI * 0.8;
          const travelSpeed = (102 + (i % 3) * 32) * speedScale;
          this.spawnBullet({
            fromPlayer: false,
            behavior: 'hover_then_drift',
            x: ex,
            y: ey,
            vx: Math.cos(ang) * travelSpeed,
            vy: Math.sin(ang) * travelSpeed,
            hoverStart: 1.15 + (i % 3) * 0.35,
            hoverDuration: 2.7,
            resumeVx: Math.cos(ang) * 24,
            resumeVy: 60 * speedScale,
            radius: 6,
            damage: 1,
            color: 0x7b2cbf
          });
        }
      }

      if (waveIndex % 2 === 1) {
        const r1 = bossRole === 'rematch' ? (enraged ? 108 : 96) : 84;
        this.spawnBombZone(clampBombX(px, r1), clampBombY(py, r1), r1, 1.8);
        if (bossRole === 'rematch' || enraged) {
          const altX = arenaLeft + arenaWidth * (waveIndex % 4 === 1 ? 0.28 : 0.72);
          const altY = arenaTop + arenaHeight * 0.62;
          this.spawnBombZone(clampBombX(altX, 88), clampBombY(altY, 88), 88, 2.05);
        }
        onBombWarn?.();
      }
      return;
    }

    switch (faction) {
      case 'phap': {
        const cols = enraged ? 11 : 9;
        const safeCol = (waveIndex * 2 + 3) % cols;
        const gapStep = arenaWidth / (cols + 1);
        for (let i = 0; i < cols; i++) {
          if (i === safeCol || i === (safeCol + 1) % cols) continue;
          const bx = arenaLeft + gapStep * (i + 1);
          this.spawnBullet({
            fromPlayer: false,
            x: bx,
            y: ey + 8,
            vx: Math.sin(waveIndex + i) * 14,
            vy: 74 * speedScale,
            radius: 5.5,
            damage: 1,
            color: 0xc92b2b
          });
        }
        if (waveIndex % 2 === 1) {
          for (let i = 0; i < 6; i++) {
            const ang = Math.PI * 0.16 + (i / 5) * Math.PI * 0.68;
            this.spawnBullet({
              fromPlayer: false,
              behavior: 'hover_then_drift',
              x: ex,
              y: ey,
              vx: Math.cos(ang) * 95 * speedScale,
              vy: Math.sin(ang) * 95 * speedScale,
              hoverStart: 1.25,
              hoverDuration: 2.2,
              resumeVx: 0,
              resumeVy: 58 * speedScale,
              radius: 6,
              damage: 1,
              color: 0xbf5b04
            });
          }
        }
        if (waveIndex % 4 === 2) {
          const r = 74;
          this.spawnBombZone(clampBombX(px, r), clampBombY(py, r), r, 1.85);
          onBombWarn?.();
        }
        break;
      }

      case 'phap_plus': {
        // B-26 Bomber: Dual-layer slow curtains + hovering mines + heavy circular AoE bombs
        const count = enraged ? 22 : 18;
        const spin = waveIndex * 0.28;
        for (let i = 0; i < count; i++) {
          const ang = spin + (i / count) * Math.PI * 2;
          const slowLayer = i % 2 === 0;
          const v = (slowLayer ? 66 : 94) * speedScale;
          this.spawnBullet({
            fromPlayer: false,
            x: ex,
            y: ey,
            vx: Math.cos(ang) * v,
            vy: Math.sin(ang) * v,
            radius: slowLayer ? 6 : 5.2,
            damage: 1,
            color: slowLayer ? 0xb81d24 : 0xd46a10
          });
        }
        if (waveIndex % 2 === 0) {
          for (let i = 0; i < 8; i++) {
            const ang = Math.PI * 0.14 + (i / 7) * Math.PI * 0.72;
            this.spawnBullet({
              fromPlayer: false,
              behavior: 'hover_then_drift',
              x: ex,
              y: ey,
              vx: Math.cos(ang) * 108 * speedScale,
              vy: Math.sin(ang) * 108 * speedScale,
              hoverStart: 1.2 + (i % 2) * 0.45,
              hoverDuration: 2.5,
              resumeVx: (i - 3.5) * 10,
              resumeVy: 60 * speedScale,
              radius: 6,
              damage: 1,
              color: 0x6f2da8
            });
          }
        }
        if (waveIndex % 3 === 1) {
          const r = 88;
          this.spawnBombZone(clampBombX(px, r), clampBombY(py, r), r, 1.8);
          if (enraged) {
            this.spawnBombZone(
              clampBombX(arenaLeft + arenaWidth * (waveIndex % 2 === 0 ? 0.28 : 0.72), 78),
              clampBombY(arenaTop + arenaHeight * 0.65, 78),
              78,
              2.0
            );
          }
          onBombWarn?.();
        }
        break;
      }

      case 'nguy': {
        const count = enraged ? 24 : 20;
        const spin = waveIndex * 0.34;
        for (let i = 0; i < count; i++) {
          const ang = spin + (i / count) * Math.PI * 2;
          const v = 86 * speedScale;
          this.spawnBullet({
            fromPlayer: false,
            x: ex,
            y: ey,
            vx: Math.cos(ang) * v,
            vy: Math.sin(ang) * v,
            radius: 5.5,
            damage: 1,
            color: i % 2 === 0 ? 0xc42847 : 0xc9620e
          });
        }
        if (waveIndex % 2 === 0) {
          const cols = 12;
          const gap1 = (waveIndex * 3 + 2) % cols;
          const step = arenaWidth / (cols + 1);
          for (let i = 0; i < cols; i++) {
            if (i === gap1 || i === (gap1 + 1) % cols) continue;
            this.spawnBullet({
              fromPlayer: false,
              behavior: 'hover_then_drift',
              x: arenaLeft + step * (i + 1),
              y: ey + 10,
              vx: 0,
              vy: 96 * speedScale,
              hoverStart: 1.1 + (i % 2) * 0.35,
              hoverDuration: 2.3,
              resumeVx: 0,
              resumeVy: 62 * speedScale,
              radius: 5.6,
              damage: 1,
              color: 0x1d4e89
            });
          }
        }
        if (waveIndex % 3 === 2) {
          const r = 84;
          this.spawnBombZone(clampBombX(px, r), clampBombY(py, r), r, 1.8);
          onBombWarn?.();
        }
        break;
      }

      case 'my': {
        // US F-4 Fighter-Bomber (Peak difficulty): Dense slow bullet labyrinth + hovering mines + MULTIPLE HUGE AoE BOMB CIRCLES!
        const count = enraged ? 28 : 24;
        const spin = waveIndex * 0.25;
        for (let i = 0; i < count; i++) {
          const ang = spin + (i / count) * Math.PI * 2;
          const v = (i % 3 === 0 ? 100 : 74) * speedScale;
          this.spawnBullet({
            fromPlayer: false,
            x: ex,
            y: ey,
            vx: Math.cos(ang) * v,
            vy: Math.sin(ang) * v,
            radius: 5.6,
            damage: 1,
            color: i % 3 === 0 ? 0xb5173e : i % 3 === 1 ? 0xd15c0e : 0x5c2b99
          });
        }
        const hoverCols = 11;
        const safeSlot = (waveIndex * 4 + 1) % hoverCols;
        const step = arenaWidth / (hoverCols + 1);
        for (let i = 0; i < hoverCols; i++) {
          if (i === safeSlot || i === (safeSlot + 1) % hoverCols) continue;
          this.spawnBullet({
            fromPlayer: false,
            behavior: 'hover_then_drift',
            x: arenaLeft + step * (i + 1),
            y: ey + 12,
            vx: 0,
            vy: 96 * speedScale,
            hoverStart: 1.2 + (i % 3) * 0.38,
            hoverDuration: 2.7,
            resumeVx: ((i % 2) * 2 - 1) * 14,
            resumeVy: 60 * speedScale,
            radius: 5.8,
            damage: 1,
            color: 0x1a508b
          });
        }
        // Heavy US aerial carpet-bombing: large circular AoE zones (radius 96..110px)!
        if (waveIndex % 2 === 1) {
          const r1 = enraged ? 108 : 96;
          this.spawnBombZone(clampBombX(px, r1), clampBombY(py, r1), r1, 1.8);
          const secondX = arenaLeft + arenaWidth * (waveIndex % 4 === 1 ? 0.26 : 0.74);
          const secondY = arenaTop + arenaHeight * 0.62;
          this.spawnBombZone(clampBombX(secondX, 92), clampBombY(secondY, 92), 92, 2.05);
          onBombWarn?.();
        }
        break;
      }

      case 'nguy_minus': {
        // Weakened 1975 Saigon remnant: sparse slow rings, wide safe gaps
        const count = enraged ? 11 : 8;
        const spin = waveIndex * 0.3;
        for (let i = 0; i < count; i++) {
          const ang = spin + (i / count) * Math.PI * 2;
          const v = 66 * speedScale;
          this.spawnBullet({
            fromPlayer: false,
            x: ex,
            y: ey,
            vx: Math.cos(ang) * v,
            vy: Math.sin(ang) * v,
            radius: 5.5,
            damage: 1,
            color: 0xc45a1e
          });
        }
        break;
      }
    }
  }

  update(
    dt: number,
    bounds: { left: number; right: number; top: number; bottom: number },
    playerBox: { x: number; y: number; halfW: number; halfH: number },
    enemyCircle: { x: number; y: number; radius: number } | null,
    onPlayerHit: () => void,
    onEnemyHit: (damage: number) => void,
    onBombDetonate?: () => void
  ): void {
    // 1. Update & render Circular AoE Bomb Strike Zones
    this.hazardLayer.clear();
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bz = this.bombs[i];
      bz.elapsed += dt;
      const total = bz.warmup + bz.blastDuration;
      if (bz.elapsed >= total) {
        this.bombs.splice(i, 1);
        continue;
      }

      if (bz.elapsed < bz.warmup) {
        // Readable daylight bomb reticle + shrinking countdown ring
        const progress = bz.elapsed / bz.warmup;
        const innerR = Math.max(4, bz.radius * (1 - progress));
        const pulse = 0.12 + progress * 0.18 + Math.abs(Math.sin(bz.elapsed * 10)) * 0.08;

        this.hazardLayer
          .circle(bz.x, bz.y, bz.radius)
          .fill({ color: 0xc92424, alpha: pulse })
          .stroke({ color: 0x9c1414, width: 2.5, alpha: 0.85 });

        // Shrinking timing circle showing exact detonation instant
        this.hazardLayer
          .circle(bz.x, bz.y, innerR)
          .stroke({ color: 0xd96b14, width: 2.2, alpha: 0.9 });

        // Tactical crosshair center
        this.hazardLayer
          .moveTo(bz.x - 10, bz.y)
          .lineTo(bz.x + 10, bz.y)
          .moveTo(bz.x, bz.y - 10)
          .lineTo(bz.x, bz.y + 10)
          .stroke({ color: 0x8c1414, width: 1.8, alpha: 0.85 });
      } else {
        if (!bz.detonated) {
          bz.detonated = true;
          onBombDetonate?.();
        }
        const blastT = (bz.elapsed - bz.warmup) / bz.blastDuration;
        const fade = Math.max(0, 1 - blastT);

        // Fiery AoE explosion sphere + expanding shockwave ring
        this.hazardLayer
          .circle(bz.x, bz.y, bz.radius * (0.95 + blastT * 0.14))
          .fill({ color: 0xd9381e, alpha: fade * 0.68 })
          .stroke({ color: 0x5c140a, width: 3, alpha: fade * 0.9 });
        this.hazardLayer
          .circle(bz.x, bz.y, bz.radius * 0.62 * (1 - blastT * 0.25))
          .fill({ color: 0xffd24d, alpha: fade * 0.85 });

        // Lethal AoE damage check during first 75% of blast
        if (blastT < 0.75) {
          const closestX = Math.max(playerBox.x - playerBox.halfW, Math.min(bz.x, playerBox.x + playerBox.halfW));
          const closestY = Math.max(playerBox.y - playerBox.halfH, Math.min(bz.y, playerBox.y + playerBox.halfH));
          const dx = bz.x - closestX;
          const dy = bz.y - closestY;
          const killR = bz.radius * 0.9;
          if (dx * dx + dy * dy <= killR * killR) {
            onPlayerHit();
          }
        }
      }
    }

    // 2. Update all pooled bullets (including auto-tracking homing player bolts & hovering enemy orbs)
    const margin = 52;
    for (const b of this.pool) {
      if (!b.active) continue;
      b.age += dt;

      let moveVx = b.vx;
      let moveVy = b.vy;

      if (b.behavior === 'hover_then_drift') {
        const hoverEnd = b.hoverStart + b.hoverDuration;
        if (b.age >= b.hoverStart && b.age < hoverEnd) {
          moveVx = 0;
          moveVy = 0;
          const pulse = 1 + Math.sin((b.age - b.hoverStart) * 9) * 0.12;
          b.graphic.scale.set(pulse);
        } else if (b.age >= hoverEnd) {
          moveVx = b.resumeVx;
          moveVy = b.resumeVy;
          b.graphic.scale.set(1);
        } else if (b.age > b.hoverStart * 0.65) {
          const decel = Math.max(0.08, 1 - (b.age - b.hoverStart * 0.65) / (b.hoverStart * 0.35));
          moveVx = b.vx * decel;
          moveVy = b.vy * decel;
        }
      }

      b.x += moveVx * dt;
      b.y += moveVy * dt;

      if (
        b.age >= b.maxAge ||
        b.x < bounds.left - margin ||
        b.x > bounds.right + margin ||
        b.y < bounds.top - margin ||
        b.y > bounds.bottom + margin
      ) {
        this.deactivate(b);
        continue;
      }

      b.graphic.position.set(b.x, b.y);

      if (b.fromPlayer) {
        if (enemyCircle) {
          const dx = b.x - enemyCircle.x;
          const dy = b.y - enemyCircle.y;
          const hitR = enemyCircle.radius + b.radius;
          if (dx * dx + dy * dy <= hitR * hitR) {
            onEnemyHit(b.damage);
            this.deactivate(b);
          }
        }
      } else {
        const closestX = Math.max(playerBox.x - playerBox.halfW, Math.min(b.x, playerBox.x + playerBox.halfW));
        const closestY = Math.max(playerBox.y - playerBox.halfH, Math.min(b.y, playerBox.y + playerBox.halfH));
        const dx = b.x - closestX;
        const dy = b.y - closestY;
        const r = b.radius * 0.86;
        if (dx * dx + dy * dy <= r * r) {
          this.deactivate(b);
          onPlayerHit();
        }
      }
    }
  }

  clearAllEnemyBullets(): void {
    this.bombs = [];
    this.hazardLayer.clear();
    for (const b of this.pool) {
      if (b.active && !b.fromPlayer) {
        this.deactivate(b);
      }
    }
  }

  clearAll(): void {
    this.bombs = [];
    this.hazardLayer.clear();
    for (const b of this.pool) {
      if (b.active) this.deactivate(b);
    }
  }

  private deactivate(b: Bullet): void {
    b.active = false;
    b.graphic.visible = false;
  }
}
