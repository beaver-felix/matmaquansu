import { Container, Graphics, Text } from 'pixi.js';
import { AudioEngine } from '../core/AudioEngine';
import { GameState, MAX_BOSSES_PER_REGION } from '../core/GameState';
import { InputManager } from '../core/InputManager';
import { GameScene, SceneManager } from '../core/SceneManager';
import { AmbushDef, getRegionConfig, RegionConfig, RoadNode } from '../data/regions';
import { LORE_TIMELINE } from '../data/loreTimeline';
import {
  createIndependencePalaceGate,
  createLorePickupSprite,
  createVehicleSprite,
  GateParts
} from '../render/SpriteFactory';
import { BulletEngine } from '../systems/BulletEngine';
import { CryptoSkillSystem } from '../systems/CryptoSkillSystem';
import { LoreToastUI } from '../systems/LoreToastUI';

interface LivePickup {
  id: string;
  x: number;
  y: number;
  sprite: Container;
  collected: boolean;
}

interface DebrisPiece {
  graphic: Graphics;
  vx: number;
  vy: number;
  vrot: number;
}

interface RoadSegment {
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

/**
 * Scene 2 (Open-World Branching Trail Map V1..V5) + Scene 6 (Saigon Boulevard & Dinh Độc Lập Gate Smash).
 * - Wide 2D sunlit open maps with multi-branching trails, forks, and shortcuts.
 * - Vehicle drives along the trail network (smooth sliding projection on road boundaries)
 *   and rotates smoothly toward movement direction.
 * - Miniature paper tactical minimap displays road topology, vehicle position, and destination
 *   (hiding ambushes unless detected by Crypto Skills).
 */
export class OverworldScene implements GameScene {
  readonly id = 'OVERWORLD' as const;
  private root = new Container();
  private world = new Container();
  private terrainLayer = new Graphics();
  private hintLayer = new Graphics();
  private pickupLayer = new Container();
  private actorLayer = new Container();
  private bulletLayer = new Container();
  private debrisLayer = new Container();
  private minimapLayer = new Graphics();

  private region!: RegionConfig;
  private roadSegments: RoadSegment[] = [];
  private playerSprite!: Container;
  private playerX = 550;
  private playerY = 1600;
  private playerHeading = 0;

  private skillSystem!: CryptoSkillSystem;
  private pickups: LivePickup[] = [];
  private ambushHintLabels = new Map<string, Text>();

  // Scene 6 Finale (V5 Independence Palace)
  private gateParts: GateParts | null = null;
  private finaleBullets: BulletEngine | null = null;
  private finaleFireTimer = 0;
  private finaleWave = 0;
  private finaleHp = 7;
  private finaleInvuln = 0;
  private gateSmashed = false;
  private gateSmashTimer = 0;
  private debris: DebrisPiece[] = [];
  private shakeTimer = 0;

  private hpFillEl!: HTMLDivElement;
  private hpTextEl!: HTMLSpanElement;
  private shieldTextEl!: HTMLSpanElement;
  private distTextEl!: HTMLDivElement;
  private loreCountEl!: HTMLDivElement;

  private width = 1280;
  private height = 720;
  private time = 0;
  private transitioning = false;

  constructor(
    private state: GameState,
    private input: InputManager,
    private audio: AudioEngine,
    private loreToast: LoreToastUI,
    private scenes: SceneManager
  ) {}

  mount(stage: Container, uiRoot: HTMLElement): void {
    this.region = getRegionConfig(this.state.regionIndex);
    this.finaleHp = this.state.getMaxHp();
    this.transitioning = false;
    this.gateSmashed = false;
    this.gateSmashTimer = 0;
    this.debris = [];
    this.playerHeading = 0;

    this.buildRoadSegments();

    stage.addChild(this.root);
    this.root.addChild(this.world);
    this.world.addChild(this.terrainLayer);
    this.world.addChild(this.hintLayer);
    this.world.addChild(this.pickupLayer);
    this.world.addChild(this.actorLayer);
    this.world.addChild(this.bulletLayer);
    this.world.addChild(this.debrisLayer);
    this.root.addChild(this.minimapLayer);

    this.drawOpenMapTerrain();

    if (this.state.savedMapPos) {
      this.playerX = this.state.savedMapPos.x;
      this.playerY = this.state.savedMapPos.y;
    } else {
      this.playerX = this.region.startX;
      this.playerY = this.region.startY;
    }

    this.playerSprite = createVehicleSprite(this.state.currentVehicle, false);
    this.playerSprite.position.set(this.playerX, this.playerY);
    this.playerSprite.rotation = this.playerHeading;
    this.actorLayer.addChild(this.playerSprite);

    this.pickups = [];
    for (const p of this.region.pickups) {
      if (this.state.collectedMapPickups.has(p.id)) continue;
      const sprite = createLorePickupSprite();
      sprite.position.set(p.x, p.y);
      this.pickupLayer.addChild(sprite);
      this.pickups.push({ id: p.id, x: p.x, y: p.y, sprite, collected: false });
    }

    if (this.region.hasIndependencePalaceGate) {
      this.gateParts = createIndependencePalaceGate();
      this.gateParts.container.position.set(this.region.destinationX, this.region.destinationY);
      this.actorLayer.addChildAt(this.gateParts.container, 0);
      this.finaleBullets = new BulletEngine(this.bulletLayer, 140);
    }

    this.ambushHintLabels.clear();
    for (const a of this.region.ambushes) {
      const lbl = new Text({
        text: '95300',
        style: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', fill: 0x8c1c1c }
      });
      lbl.anchor.set(0.5);
      lbl.visible = false;
      this.world.addChild(lbl);
      this.ambushHintLabels.set(a.id, lbl);
    }

    const hud = document.createElement('div');
    hud.className = 'hud-layer';
    const v = this.state.currentVehicle;
    hud.innerHTML = `
      <div class="hud-top">
        <div class="hud-pill">
          <div><strong>${this.region.code}: ${this.region.name}</strong> (${this.region.era})</div>
          <div style="color:#505b4e;">Địch: ${this.region.factionLabel} · Phương tiện: <strong>${v.name}</strong></div>
          <div class="hud-hp-bar">
            <span style="font-size:11px;font-weight:700;color:#1c7c4a;">ĐỘ BỀN</span>
            <div class="hp-track"><div class="hp-fill" id="ow-hp-fill" style="width:100%;"></div></div>
            <span id="ow-hp-text" style="font-family:monospace;font-size:11px;font-weight:700;">${this.finaleHp}/${this.state.getMaxHp()}</span>
            <span id="ow-shield" style="font-family:monospace;font-size:11px;font-weight:800;color:#9c680c;margin-left:4px;">🛡×${this.state.reviveShields}</span>
            ${this.state.tutorialWon ? '<span style="color:#b8861e;font-size:12px;">★</span>' : ''}
          </div>
        </div>
        <div class="hud-controls">
          <div class="hud-pill" style="text-align:right;">
            <div id="ow-dist" style="font-family:monospace;font-weight:800;color:#8c1c1c;">ĐÍCH ĐẾN</div>
            <div id="ow-lore" style="font-size:11px;color:#505b4e;">Hồ sơ: ${this.state.stats.loreCollected}/${LORE_TIMELINE.length} · Đụng độ: ${Math.min(MAX_BOSSES_PER_REGION, this.state.getRegionEncounters(this.region.index))}/${MAX_BOSSES_PER_REGION}</div>
          </div>
          <button id="ow-mute" class="btn btn-small">${this.audio.muted ? '🔇' : '🔊'}</button>
        </div>
      </div>
    `;
    uiRoot.appendChild(hud);

    this.hpFillEl = hud.querySelector('#ow-hp-fill') as HTMLDivElement;
    this.hpTextEl = hud.querySelector('#ow-hp-text') as HTMLSpanElement;
    this.shieldTextEl = hud.querySelector('#ow-shield') as HTMLSpanElement;
    this.distTextEl = hud.querySelector('#ow-dist') as HTMLDivElement;
    this.loreCountEl = hud.querySelector('#ow-lore') as HTMLDivElement;

    const muteBtn = hud.querySelector('#ow-mute') as HTMLButtonElement;
    muteBtn.addEventListener('click', () => {
      this.audio.unlock();
      muteBtn.textContent = this.audio.toggleMute() ? '🔇' : '🔊';
    });

    this.skillSystem = new CryptoSkillSystem(hud, this.state);
    this.input.clearDrag();

    // Big cinematic region title banner fading out on first entry to a new map
    if (!this.state.regionBannerShown.has(this.region.index)) {
      this.state.regionBannerShown.add(this.region.index);
      const card = document.createElement('div');
      card.className = 'region-title-card';
      card.innerHTML = `
        <div class="region-title-rule"></div>
        <div class="region-title-code">${this.region.code} · ${this.region.era}</div>
        <h1 class="region-title-name">${this.region.name.toUpperCase()}</h1>
        <div class="region-title-sub">${this.region.factionLabel}</div>
        <div class="region-title-rule"></div>
      `;
      hud.appendChild(card);
      window.setTimeout(() => card.remove(), 3750);
    }

    // Notify player once if they have reached the max 2 boss encounters cap for this region
    if (
      this.state.getRegionEncounters(this.region.index) >= MAX_BOSSES_PER_REGION &&
      !this.state.regionCapNotified.has(this.region.index)
    ) {
      this.state.regionCapNotified.add(this.region.index);
      this.loreToast.enqueueCustom(
        this.region.code,
        'Đường đã thông',
        `Đã hết chốt phục kích trong chặng này — tiến thẳng về ${this.region.destinationLabel}.`,
        'BÁO ĐƯỜNG',
        5.5
      );
    }

    if (this.state.regionIndex === 0 && !this.state.tutorialDone && !this.state.savedMapPos) {
      this.loreToast.enqueueCustom(
        'CHẶNG I',
        'Tới Cụm Mật mã Bắc Kạn',
        'Bám đường mòn tới ngôi sao đích trên bản đồ nhỏ. Lượm hồ sơ dọc đường để tích Giáp hồi sinh.',
        'LỆNH',
        6.0
      );
    } else if (this.region.hasIndependencePalaceGate && !this.state.savedMapPos) {
      this.loreToast.enqueueCustom(
        '30/4/1975',
        'Tiến vào Dinh Độc Lập',
        'Xe tăng T-54B & toàn bộ Cơ yếu đã tối đa. Theo đường sạch lên thẳng cổng sắt Dinh Độc Lập.',
        'LỆNH',
        6.0
      );
    }
  }

  private buildRoadSegments(): void {
    const map = new Map<string, RoadNode>();
    for (const n of this.region.roadNodes) {
      map.set(n.id, n);
    }
    this.roadSegments = [];
    for (const [aId, bId] of this.region.roadEdges) {
      const a = map.get(aId);
      const b = map.get(bId);
      if (a && b) {
        this.roadSegments.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y });
      }
    }
  }

  /**
   * Finds the closest point on the region's open-map trail network for smooth trail-following.
   */
  private closestPointOnTrails(x: number, y: number): { x: number; y: number; dist: number } {
    let bestX = this.region.startX;
    let bestY = this.region.startY;
    let bestDistSq = Infinity;

    for (const seg of this.roadSegments) {
      const abx = seg.bx - seg.ax;
      const aby = seg.by - seg.ay;
      const lenSq = abx * abx + aby * aby;
      const t = lenSq > 0 ? Math.max(0, Math.min(1, ((x - seg.ax) * abx + (y - seg.ay) * aby) / lenSq)) : 0;
      const cx = seg.ax + abx * t;
      const cy = seg.ay + aby * t;
      const dx = x - cx;
      const dy = y - cy;
      const dSq = dx * dx + dy * dy;
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        bestX = cx;
        bestY = cy;
      }
    }

    return { x: bestX, y: bestY, dist: Math.sqrt(bestDistSq) };
  }

  private drawOpenMapTerrain(): void {
    const g = this.terrainLayer;
    const r = this.region;
    const pal = r.palette;
    g.clear();

    // 1. Sunlit open-world ground
    g.rect(0, 0, r.mapWidth, r.mapHeight).fill({ color: pal.ground });

    for (let i = 0; i < 65; i++) {
      const px = ((i * 257 + r.index * 97) % (r.mapWidth - 180)) + 90;
      const py = ((i * 389 + r.index * 131) % (r.mapHeight - 180)) + 90;
      const rx = 68 + (i % 4) * 36;
      const ry = 46 + (i % 3) * 28;
      g.ellipse(px, py, rx, ry).fill({ color: pal.groundAlt, alpha: 0.65 });
    }

    // Light cartographic coordinate grid
    const gridStep = 140;
    for (let x = gridStep; x < r.mapWidth; x += gridStep) {
      g.moveTo(x, 0).lineTo(x, r.mapHeight).stroke({ color: pal.gridColor, width: 1, alpha: 0.16 });
    }
    for (let y = gridStep; y < r.mapHeight; y += gridStep) {
      g.moveTo(0, y).lineTo(r.mapWidth, y).stroke({ color: pal.gridColor, width: 1, alpha: 0.16 });
    }

    // 2. Render branching dirt trail / boulevard network (outer bank + inner trail surface + rounded junctions)
    const outerW = r.roadHalfWidth * 2 + 18;
    const innerW = r.roadHalfWidth * 2;

    for (const seg of this.roadSegments) {
      g.moveTo(seg.ax, seg.ay).lineTo(seg.bx, seg.by).stroke({ color: pal.roadBorder, width: outerW, cap: 'round' });
    }
    for (const n of r.roadNodes) {
      g.circle(n.x, n.y, r.roadHalfWidth + 10).fill({ color: pal.roadBorder });
    }

    for (const seg of this.roadSegments) {
      g.moveTo(seg.ax, seg.ay).lineTo(seg.bx, seg.by).stroke({ color: pal.road, width: innerW, cap: 'round' });
    }
    for (const n of r.roadNodes) {
      g.circle(n.x, n.y, r.roadHalfWidth + 2).fill({ color: pal.road });
    }

    // Subtle wheel-rut / center dashed markings along trails
    for (const seg of this.roadSegments) {
      const len = Math.hypot(seg.bx - seg.ax, seg.by - seg.ay);
      const steps = Math.max(2, Math.floor(len / 48));
      for (let i = 0; i < steps; i += 2) {
        const t0 = i / steps;
        const t1 = Math.min(1, (i + 0.9) / steps);
        g.moveTo(seg.ax + (seg.bx - seg.ax) * t0, seg.ay + (seg.by - seg.ay) * t0)
          .lineTo(seg.ax + (seg.bx - seg.ax) * t1, seg.ay + (seg.by - seg.ay) * t1)
          .stroke({ color: r.hasIndependencePalaceGate ? 0xf7f2de : pal.roadBorder, width: 3, alpha: 0.55 });
      }
    }

    // 3. Dense daylight foliage / hills / craters placed strictly OUTSIDE trails so roads stay clean!
    for (let i = 0; i < 210; i++) {
      const px = ((i * 211 + r.index * 71) % (r.mapWidth - 110)) + 55;
      const py = ((i * 313 + r.index * 89) % (r.mapHeight - 110)) + 55;
      const near = this.closestPointOnTrails(px, py);
      if (near.dist < r.roadHalfWidth + 38) continue;
      if (r.hasIndependencePalaceGate && Math.hypot(px - r.destinationX, py - r.destinationY) < 380) continue;

      if (r.index === 3) {
        g.circle(px, py, 16 + (i % 3) * 8)
          .fill({ color: pal.propDark, alpha: 0.55 })
          .stroke({ color: pal.propLight, width: 2, alpha: 0.7 });
      } else {
        g.circle(px + 4, py + 5, 16 + (i % 3) * 7).fill({ color: 0x22331f, alpha: 0.16 });
        g.circle(px, py, 16 + (i % 3) * 7).fill({ color: pal.propDark, alpha: 0.86 });
        g.circle(px - 3, py - 3, 10 + (i % 2) * 5).fill({ color: pal.propLight, alpha: 0.8 });
      }
    }

    // 4. Destination Checkpoint Beacon (for V1..V4)
    if (!r.hasIndependencePalaceGate) {
      g.circle(r.destinationX, r.destinationY, r.destinationRadius)
        .fill({ color: 0x1c7c4a, alpha: 0.24 })
        .stroke({ color: 0x1c7c4a, width: 3.5, alpha: 0.95 });
      g.star(r.destinationX, r.destinationY, 5, 22, 9).fill({ color: 0xd92626 }).stroke({ color: 0xffe45c, width: 2 });
    }

    g.rect(14, 14, r.mapWidth - 28, r.mapHeight - 28).stroke({ color: 0x705f3e, width: 3, alpha: 0.5 });

    const destText = new Text({
      text: r.hasIndependencePalaceGate
        ? '★ DINH ĐỘC LẬP — HÚC THẲNG QUA CỔNG! ★'
        : `★ ${r.destinationLabel} ★`,
      style: {
        fontFamily: 'sans-serif',
        fontSize: 17,
        fontWeight: 'bold',
        fill: r.hasIndependencePalaceGate ? 0x8c1c1c : 0x145734
      }
    });
    destText.anchor.set(0.5);
    destText.position.set(
      r.destinationX,
      r.hasIndependencePalaceGate ? r.destinationY - 245 : r.destinationY - r.destinationRadius - 22
    );
    this.world.addChild(destText);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  update(dt: number): void {
    this.time += dt;
    if (this.transitioning) return;

    if (this.gateSmashed) {
      this.updateGateSmash(dt);
      return;
    }

    const vehicle = this.state.currentVehicle;
    const sample = this.input.sample();
    const speed = vehicle.mapSpeed;

    const rawDx = sample.axisX * speed * dt + sample.dragDx * 1.15;
    const rawDy = sample.axisY * speed * dt + sample.dragDy * 1.15;

    const prevX = this.playerX;
    const prevY = this.playerY;
    let candX = prevX + rawDx;
    let candY = prevY + rawDy;

    // Keep vehicle strictly ON the open-map trail network (smooth sliding along road edges!)
    const allowedOffset = Math.max(16, this.region.roadHalfWidth - Math.min(vehicle.width, vehicle.height) * 0.35);
    const nearest = this.closestPointOnTrails(candX, candY);
    if (nearest.dist > allowedOffset) {
      const pull = allowedOffset / nearest.dist;
      candX = nearest.x + (candX - nearest.x) * pull;
      candY = nearest.y + (candY - nearest.y) * pull;
    }

    this.playerX = Math.max(36, Math.min(this.region.mapWidth - 36, candX));
    this.playerY = Math.max(36, Math.min(this.region.mapHeight - 36, candY));

    const actualDx = this.playerX - prevX;
    const actualDy = this.playerY - prevY;
    if (Math.hypot(actualDx, actualDy) > 0.3) {
      const targetAngle = Math.atan2(actualDy, actualDx) + Math.PI / 2;
      let diff = targetAngle - this.playerHeading;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.playerHeading += diff * Math.min(1, dt * 14);
    }

    this.playerSprite.position.set(this.playerX, this.playerY);
    this.playerSprite.rotation = this.playerHeading;

    if (this.finaleInvuln > 0) {
      this.finaleInvuln = Math.max(0, this.finaleInvuln - dt);
      this.playerSprite.alpha = Math.floor(this.finaleInvuln * 16) % 2 === 0 ? 0.35 : 1;
    } else {
      this.playerSprite.alpha = 1;
    }

    const capReached = this.state.getRegionEncounters(this.region.index) >= MAX_BOSSES_PER_REGION;
    const activeAmbushes = this.region.ambushes.filter((a) => {
      if (this.state.clearedAmbushes.has(a.id)) return false;
      // Opening tutorial & Tuyến Lửa Trường Sơn rematch bosses always trigger regardless of normal patrol cap
      if (a.bossRole === 'tutorial' || a.bossRole === 'rematch') return true;
      return !capReached;
    });

    const skillVis = this.skillSystem.update(
      dt,
      this.playerX,
      this.playerY,
      this.region.destinationX,
      this.region.destinationY,
      this.region.roadNodes,
      activeAmbushes,
      this.state,
      this.audio
    );

    const detectedIds = this.renderCryptoHints(activeAmbushes, skillVis);

    // Collect historical documents
    for (const p of this.pickups) {
      if (p.collected) continue;
      p.sprite.y = p.y + Math.sin(this.time * 4 + p.x) * 4;
      const dx = this.playerX - p.x;
      const dy = this.playerY - p.y;
      const grabR = Math.max(vehicle.width, vehicle.height) * 0.55 + 22;
      if (dx * dx + dy * dy <= grabR * grabR) {
        p.collected = true;
        p.sprite.visible = false;
        this.state.collectedMapPickups.add(p.id);
        this.state.addReviveShield();
        this.shieldTextEl.textContent = `🛡×${this.state.reviveShields}`;
        this.loreToast.collectNextTimelineItem(this.state, this.audio);
        const enc = Math.min(MAX_BOSSES_PER_REGION, this.state.getRegionEncounters(this.region.index));
        this.loreCountEl.textContent = `Hồ sơ: ${this.state.stats.loreCollected}/${LORE_TIMELINE.length} · Đụng độ: ${enc}/${MAX_BOSSES_PER_REGION}`;
      }
    }

    // Check ambush trigger using compact vehicle hitbox (V1..V4 = 18x28, Tank = 44x64)
    const halfW = vehicle.hitboxWidth / 2;
    const halfH = vehicle.hitboxHeight / 2;
    const cosH = Math.cos(-this.playerHeading);
    const sinH = Math.sin(-this.playerHeading);

    for (const ambush of activeAmbushes) {
      const effectiveR = ambush.radius * skillVis.ambushShrinkFactor;
      const relX = ambush.x - this.playerX;
      const relY = ambush.y - this.playerY;
      const localX = relX * cosH - relY * sinH;
      const localY = relX * sinH + relY * cosH;
      const closestX = Math.max(-halfW, Math.min(localX, halfW));
      const closestY = Math.max(-halfH, Math.min(localY, halfH));
      const dx = localX - closestX;
      const dy = localY - closestY;
      if (dx * dx + dy * dy <= effectiveR * effectiveR) {
        this.triggerAmbush(ambush);
        return;
      }
    }

    if (this.region.hasIndependencePalaceGate) {
      this.updateSaigonFinale(dt);
    } else {
      const distToDest = Math.hypot(this.playerX - this.region.destinationX, this.playerY - this.region.destinationY);
      if (distToDest <= this.region.destinationRadius) {
        this.state.stats.ambushesEvaded += activeAmbushes.length;
        this.transitioning = true;
        this.audio.playPickup();
        this.scenes.goTo('REGION_EXIT');
        return;
      }
    }

    const dxDest = this.region.destinationX - this.playerX;
    const dyDest = this.region.destinationY - this.playerY;
    const distMeters = Math.max(0, Math.round(Math.hypot(dxDest, dyDest) * 0.5));
    const arrow = this.getArrow(dxDest, dyDest);
    this.distTextEl.textContent = `${this.region.hasIndependencePalaceGate ? 'DINH ĐỘC LẬP' : 'TRẠM ĐÍCH'}: ${distMeters}m ${arrow}`;

    this.updateCamera();
    this.renderMinimap(activeAmbushes, detectedIds);
  }

  private getArrow(dx: number, dy: number): string {
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (ang >= -22.5 && ang < 22.5) return '→';
    if (ang >= 22.5 && ang < 67.5) return '↘';
    if (ang >= 67.5 && ang < 112.5) return '↓';
    if (ang >= 112.5 && ang < 157.5) return '↙';
    if (ang >= -67.5 && ang < -22.5) return '↗';
    if (ang >= -112.5 && ang < -67.5) return '↑';
    if (ang >= -157.5 && ang < -112.5) return '↖';
    return '←';
  }

  private renderCryptoHints(
    ambushes: AmbushDef[],
    skillVis: ReturnType<CryptoSkillSystem['update']>
  ): Set<string> {
    const g = this.hintLayer;
    g.clear();
    const detectedIds = new Set<string>();

    for (const lbl of this.ambushHintLabels.values()) {
      lbl.visible = false;
    }

    if (skillVis.radarWaveRadius > 0) {
      g.circle(this.playerX, this.playerY, skillVis.radarWaveRadius)
        .fill({ color: 0x1c7c4a, alpha: skillVis.radarWaveAlpha * 0.09 })
        .stroke({ color: 0x1c7c4a, width: 3, alpha: skillVis.radarWaveAlpha });
    }

    if (skillVis.safeWaypoint) {
      const wx = skillVis.safeWaypoint.x;
      const wy = skillVis.safeWaypoint.y;
      g.circle(wx, wy, 28 + Math.sin(this.time * 6) * 4)
        .fill({ color: 0x1c7c4a, alpha: 0.16 })
        .stroke({ color: 0x1c7c4a, width: 3, alpha: 0.85 });
    }

    const groundRevealDist = 560 * skillVis.scanRangeScale;
    for (const a of ambushes) {
      const dist = Math.hypot(a.x - this.playerX, a.y - this.playerY);
      const effectiveR = a.radius * skillVis.ambushShrinkFactor;

      const revealedByRadar = skillVis.visionPulseActive && dist <= skillVis.radarWaveRadius + a.radius;
      const revealedByGround = skillVis.groundHintsActive && dist <= groundRevealDist;

      if (revealedByRadar) {
        detectedIds.add(a.id);
        g.circle(a.x, a.y, effectiveR)
          .fill({ color: 0xc92424, alpha: 0.24 })
          .stroke({ color: 0x9e1616, width: 2.8, alpha: 0.92 });
      } else if (revealedByGround) {
        detectedIds.add(a.id);
        g.circle(a.x, a.y, effectiveR)
          .fill({ color: 0xd98a18, alpha: 0.15 })
          .stroke({ color: 0x9e5908, width: 2.2, alpha: 0.85 });
        const codeText = this.ambushHintLabels.get(a.id);
        if (codeText) {
          codeText.position.set(a.x, a.y - effectiveR - 12);
          codeText.visible = true;
        }
      }
    }

    return detectedIds;
  }

  /**
   * Compact paper tactical minimap (top-right below HUD controls) showing open-map trails,
   * live vehicle position, destination star, and ONLY currently skill-detected ambushes.
   */
  private renderMinimap(activeAmbushes: AmbushDef[], detectedIds: Set<string>): void {
    const g = this.minimapLayer;
    g.clear();

    const mapW = this.width < 600 ? 116 : 156;
    const mapH = Math.round(mapW * (this.region.mapHeight / this.region.mapWidth));
    const mx = this.width - mapW - 10;
    const my = 122;
    const sx = mapW / this.region.mapWidth;
    const sy = mapH / this.region.mapHeight;

    g.roundRect(mx, my, mapW, mapH, 7)
      .fill({ color: 0xf7f1e0, alpha: 0.88 })
      .stroke({ color: 0x7a6539, width: 2 });

    // Road lines on minimap
    for (const seg of this.roadSegments) {
      g.moveTo(mx + seg.ax * sx, my + seg.ay * sy)
        .lineTo(mx + seg.bx * sx, my + seg.by * sy)
        .stroke({ color: 0x9c8252, width: 3.2, cap: 'round' });
    }

    // Only skill-detected ambushes blink red on minimap
    for (const a of activeAmbushes) {
      if (!detectedIds.has(a.id)) continue;
      g.circle(mx + a.x * sx, my + a.y * sy, 4.5).fill({ color: 0xc92424 });
    }

    // Destination star
    g.star(mx + this.region.destinationX * sx, my + this.region.destinationY * sy, 5, 6.5, 2.8)
      .fill({ color: 0xd92626 })
      .stroke({ color: 0xffe45c, width: 1 });

    // Player live marker
    g.circle(mx + this.playerX * sx, my + this.playerY * sy, 4.5)
      .fill({ color: 0x1c7c4a })
      .stroke({ color: 0xffffff, width: 1.5 });
  }

  private updateSaigonFinale(dt: number): void {
    if (!this.finaleBullets || !this.gateParts) return;

    if (this.playerY < 1050 && this.playerY > this.region.destinationY + 40) {
      this.finaleFireTimer += dt;
      if (this.finaleFireTimer >= 1.55) {
        this.finaleFireTimer = 0;
        this.finaleWave += 1;
        const leftGunX = this.region.destinationX - 115;
        const rightGunX = this.region.destinationX + 115;
        const gunY = this.region.destinationY + 25;
        for (const gx of [leftGunX, rightGunX]) {
          const baseAng = Math.atan2(this.playerY - gunY, this.playerX - gx);
          for (let k = -1; k <= 1; k++) {
            const ang = baseAng + k * 0.28 + Math.sin(this.finaleWave) * 0.08;
            this.finaleBullets.spawnBullet({
              fromPlayer: false,
              x: gx,
              y: gunY,
              vx: Math.cos(ang) * 84,
              vy: Math.sin(ang) * 84,
              radius: 5.5,
              damage: 1,
              color: 0xc95218
            });
          }
        }
      }
    }

    const v = this.state.currentVehicle;
    this.finaleBullets.update(
      dt,
      { left: 0, right: this.region.mapWidth, top: 0, bottom: this.region.mapHeight },
      { x: this.playerX, y: this.playerY, halfW: v.hitboxWidth / 2, halfH: v.hitboxHeight / 2 },
      null,
      () => {
        if (this.finaleInvuln > 0) return;
        // Tank armor never drops below 1 HP in front of Dinh Độc Lập
        this.finaleHp = Math.max(1, this.finaleHp - 1);
        this.finaleInvuln = 0.9;
        this.shakeTimer = 0.22;
        this.audio.playHit();
        const maxHp = this.state.getMaxHp();
        this.hpFillEl.style.width = `${(this.finaleHp / maxHp) * 100}%`;
        this.hpTextEl.textContent = `${this.finaleHp}/${maxHp}`;
      },
      () => {
        // No target HP in finale dash
      }
    );

    if (
      Math.abs(this.playerX - this.region.destinationX) < 105 &&
      this.playerY <= this.region.destinationY + 52
    ) {
      this.triggerGateSmash();
    }
  }

  private triggerGateSmash(): void {
    this.gateSmashed = true;
    this.gateSmashTimer = 0;
    this.shakeTimer = 0.85;
    this.playerHeading = 0;
    this.playerSprite.rotation = 0;
    this.finaleBullets?.clearAll();
    this.audio.playGateCrash();

    const uncleared = this.region.ambushes.filter((a) => !this.state.clearedAmbushes.has(a.id));
    this.state.stats.ambushesEvaded += uncleared.length;

    if (this.gateParts) {
      this.gateParts.flag.visible = true;
    }

    for (let i = 0; i < 36; i++) {
      const piece = new Graphics();
      const isSpark = i % 3 === 0;
      if (isSpark) {
        piece.circle(0, 0, 3 + (i % 4)).fill({ color: 0xe6a61e });
      } else {
        piece.rect(-6, -3, 12, 6).fill({ color: i % 2 === 0 ? 0x525d63 : 0xb5ae9b });
      }
      piece.position.set(this.region.destinationX + (Math.random() - 0.5) * 130, this.region.destinationY);
      this.debrisLayer.addChild(piece);
      const ang = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7;
      const spd = 110 + Math.random() * 260;
      this.debris.push({
        graphic: piece,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        vrot: (Math.random() - 0.5) * 10
      });
    }

    this.loreToast.enqueueCustom(
      '30/4/1975 · 11:30',
      'Cổng Dinh Độc Lập đã vỡ!',
      'Xe tăng T-54B tiến thẳng vào sân Dinh Độc Lập.',
      'THẮNG LỢI',
      3.8
    );
  }

  private updateGateSmash(dt: number): void {
    this.gateSmashTimer += dt;
    if (this.gateSmashTimer < 1.2) {
      this.playerY -= 95 * dt;
      this.playerSprite.position.set(this.playerX, this.playerY);
    }

    if (this.gateParts) {
      const t = Math.min(1, this.gateSmashTimer / 0.55);
      this.gateParts.leftLeaf.rotation = -t * 1.85;
      this.gateParts.rightLeaf.rotation = t * 1.85;
      this.gateParts.leftLeaf.y = -t * 28;
      this.gateParts.rightLeaf.y = -t * 28;
    }

    for (const d of this.debris) {
      d.graphic.x += d.vx * dt;
      d.graphic.y += d.vy * dt;
      d.graphic.rotation += d.vrot * dt;
      d.graphic.alpha = Math.max(0, 1 - this.gateSmashTimer / 2.2);
    }

    this.updateCamera();

    if (this.gateSmashTimer >= 2.6) {
      this.transitioning = true;
      this.scenes.goTo('END_GAME');
    }
  }

  private triggerAmbush(ambush: AmbushDef): void {
    this.transitioning = true;
    this.audio.playAmbushAlarm();
    this.state.savedMapPos = { x: this.playerX, y: this.playerY };
    const resolvedRole =
      ambush.bossRole === 'tutorial' && this.state.tutorialDone
        ? 'standard'
        : (ambush.bossRole ?? 'standard');
    this.state.activeAmbush = {
      id: ambush.id,
      regionIndex: this.region.index,
      faction: this.region.faction,
      name: ambush.name,
      bossRole: resolvedRole
    };
    this.scenes.goTo('COMBAT');
  }

  private updateCamera(): void {
    let camX = this.width / 2 - this.playerX;
    let camY = this.height * 0.52 - this.playerY;

    if (this.region.mapWidth > this.width) {
      camX = Math.min(0, Math.max(this.width - this.region.mapWidth, camX));
    } else {
      camX = (this.width - this.region.mapWidth) / 2;
    }
    if (this.region.mapHeight > this.height) {
      camY = Math.min(0, Math.max(this.height - this.region.mapHeight, camY));
    } else {
      camY = (this.height - this.region.mapHeight) / 2;
    }

    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - 0.016);
      const amp = this.shakeTimer * 18;
      camX += (Math.random() - 0.5) * amp;
      camY += (Math.random() - 0.5) * amp;
    }

    this.world.position.set(camX, camY);
  }

  unmount(): void {
    this.root.destroy({ children: true });
  }
}
