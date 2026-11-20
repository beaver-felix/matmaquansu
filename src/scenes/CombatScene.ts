import { Container, Graphics } from 'pixi.js';
import { AudioEngine } from '../core/AudioEngine';
import { ActiveAmbushContext, FactionId, GameState } from '../core/GameState';
import { InputManager } from '../core/InputManager';
import { GameScene, SceneManager } from '../core/SceneManager';
import { LORE_TIMELINE } from '../data/loreTimeline';
import { getRegionConfig } from '../data/regions';
import { createEnemySprite, createLorePickupSprite, createVehicleSprite } from '../render/SpriteFactory';
import { BulletEngine } from '../systems/BulletEngine';
import { LoreToastUI } from '../systems/LoreToastUI';

interface CombatPickup {
  x: number;
  y: number;
  baseY: number;
  sprite: Container;
  collected: boolean;
}

interface Spark {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
}

/**
 * Boss HP calibrated for ~60-72 seconds of sustained survival against a single
 * low-damage auto-tracking stream (V5 Saigon intentionally shorter as enemy collapses).
 */
const FACTION_HP: Record<FactionId, number> = {
  phap: 510,
  phap_plus: 640,
  nguy: 760,
  my: 940,
  nguy_minus: 420
};

const FACTION_FIRE_INTERVAL: Record<FactionId, number> = {
  phap: 1.45,
  phap_plus: 1.3,
  nguy: 1.2,
  my: 1.15,
  nguy_minus: 1.55
};

/** Opening bullet-fill delay before player's homing stream activates */
const PLAYER_FIRE_WARMUP_SEC = 4.5;

export class CombatScene implements GameScene {
  readonly id = 'COMBAT' as const;
  private root = new Container();
  private arenaBg = new Graphics();
  private bulletContainer = new Container();
  private actorContainer = new Container();
  private fxContainer = new Container();

  private bullets!: BulletEngine;
  private ambush!: ActiveAmbushContext;

  private arenaLeft = 100;
  private arenaTop = 104;
  private arenaWidth = 520;
  private arenaHeight = 500;

  private playerSprite!: Container;
  private playerX = 360;
  private playerY = 460;
  private playerHp = 2;
  private maxPlayerHp = 2;
  private invulnTimer = 0;
  private playerFireTimer = 0;
  private shotCount = 0;
  private weaponReadyAnnounced = false;

  private enemySprite!: Container;
  private enemyX = 360;
  private enemyY = 175;
  private enemyHp = 520;
  private maxEnemyHp = 520;
  private enemyFireTimer = 0.25;
  private waveIndex = 0;

  private pickups: CombatPickup[] = [];
  private pickupDropTimer = 10.0;
  private pickupsSpawned = 0;
  private sparks: Spark[] = [];

  private elapsed = 0;
  private shakeTimer = 0;
  private statePhase: 'FIGHT' | 'VICTORY_HOLD' | 'MODAL' = 'FIGHT';
  private victoryHoldTimer = 0;

  private uiRoot!: HTMLElement;
  private hpFillEl!: HTMLDivElement;
  private hpTextEl!: HTMLSpanElement;
  private shieldTextEl!: HTMLSpanElement;
  private bossFillEl!: HTMLDivElement;
  private bossTextEl!: HTMLSpanElement;
  private fireBtnEl!: HTMLButtonElement;
  private prepBarEl!: HTMLDivElement;
  private prepLabelEl!: HTMLSpanElement;
  private prepTimeEl!: HTMLSpanElement;
  private prepFillEl!: HTMLDivElement;

  constructor(
    private state: GameState,
    private input: InputManager,
    private audio: AudioEngine,
    private loreToast: LoreToastUI,
    private scenes: SceneManager
  ) {}

  mount(stage: Container, uiRoot: HTMLElement): void {
    this.uiRoot = uiRoot;
    this.ambush = this.state.activeAmbush ?? {
      id: 'fallback',
      regionIndex: this.state.regionIndex,
      faction: getRegionConfig(this.state.regionIndex).faction,
      name: 'Ổ Phục Kích Địch',
      bossRole: 'standard'
    };

    stage.addChild(this.root);
    this.root.addChild(this.arenaBg);
    this.root.addChild(this.bulletContainer);
    this.root.addChild(this.actorContainer);
    this.root.addChild(this.fxContainer);

    this.bullets = new BulletEngine(this.bulletContainer, 640);
    this.shotCount = 0;
    this.weaponReadyAnnounced = false;

    const vehicle = this.state.currentVehicle;
    this.maxPlayerHp = this.state.getMaxHp();
    this.playerHp = this.maxPlayerHp;
    this.maxEnemyHp =
      this.ambush.bossRole === 'tutorial'
        ? 520
        : this.ambush.bossRole === 'rematch'
          ? 960
          : FACTION_HP[this.ambush.faction];
    this.enemyHp = this.maxEnemyHp;

    this.playerSprite = createVehicleSprite(vehicle, true);
    this.enemySprite = createEnemySprite(this.ambush.faction, this.ambush.bossRole);
    this.actorContainer.addChild(this.enemySprite);
    this.actorContainer.addChild(this.playerSprite);

    this.input.clearDrag();
    this.buildHud(uiRoot);

    if (this.ambush.bossRole === 'tutorial') {
      this.loreToast.enqueueCustom(
        'PHỤC KÍCH',
        'Đụng ổ phục kích bất ngờ',
        'Né đạn trong lúc nạp vũ khí. Lượm hồ sơ giữa sân trừ ngay 25% máu hiện tại của địch.',
        'CẢNH BÁO',
        6.2
      );
    } else if (this.ambush.bossRole === 'rematch') {
      this.loreToast.enqueueCustom(
        'TÁI ĐẤU',
        'Biên đội B-52 chặn cửa ngõ Trường Sơn',
        'Cùng kiểu lưới đạn năm nào ở quy mô lớn hơn — hạ gục để mở đường vào Sài Gòn.',
        '★ TÁI ĐẤU',
        6.5
      );
    } else if (this.state.pipelineSlowActive) {
      this.loreToast.enqueueCustom(
        'MÃ DỊCH SONG SONG',
        'Đọc trước đợt bắn đầu',
        'Đạn mở màn của địch chậm lại 20%.',
        'CƠ YẾU',
        4.0
      );
    }
  }

  private buildHud(uiRoot: HTMLElement): void {
    const v = this.state.currentVehicle;
    const hud = document.createElement('div');
    hud.className = 'hud-layer';
    hud.innerHTML = `
      <div class="hud-top">
        <div class="hud-pill">
          <div><strong>GIAO TRANH PHỤC KÍCH</strong> · ${v.name}</div>
          <div class="hud-hp-bar">
            <span style="font-size:11px;font-weight:700;color:#1c7c4a;">ĐỘ BỀN</span>
            <div class="hp-track"><div class="hp-fill" id="cb-hp-fill" style="width:100%;"></div></div>
            <span id="cb-hp-text" style="font-family:monospace;font-size:11px;font-weight:700;">${this.playerHp}/${this.maxPlayerHp}</span>
            <span id="cb-shield" style="font-family:monospace;font-size:11px;font-weight:800;color:#9c680c;margin-left:4px;">🛡×${this.state.reviveShields}</span>
          </div>
        </div>
        <div class="hud-controls">
          <button id="cb-autofire" class="btn btn-small">NẠP ĐẠN: ${PLAYER_FIRE_WARMUP_SEC.toFixed(1)}s</button>
          <button id="cb-mute" class="btn btn-small">${this.audio.muted ? '🔇' : '🔊'}</button>
        </div>
      </div>

      <div class="combat-boss-bar">
        <div class="combat-boss-header">
          <span>${this.ambush.name}</span>
          <span id="cb-boss-text">${Math.ceil(this.enemyHp)} / ${this.maxEnemyHp}</span>
        </div>
        <div class="boss-hp-track"><div class="boss-hp-fill" id="cb-boss-fill" style="width:100%;"></div></div>
      </div>

      <div class="weapon-prep-bar" id="cb-prep-bar">
        <div class="weapon-prep-header">
          <span id="cb-prep-label">ĐANG CHUẨN BỊ VŨ KHÍ...</span>
          <span id="cb-prep-time">0% · ${PLAYER_FIRE_WARMUP_SEC.toFixed(1)}s</span>
        </div>
        <div class="weapon-prep-track"><div class="weapon-prep-fill" id="cb-prep-fill"></div></div>
      </div>
    `;
    uiRoot.appendChild(hud);

    this.hpFillEl = hud.querySelector('#cb-hp-fill') as HTMLDivElement;
    this.hpTextEl = hud.querySelector('#cb-hp-text') as HTMLSpanElement;
    this.shieldTextEl = hud.querySelector('#cb-shield') as HTMLSpanElement;
    this.bossFillEl = hud.querySelector('#cb-boss-fill') as HTMLDivElement;
    this.bossTextEl = hud.querySelector('#cb-boss-text') as HTMLSpanElement;
    this.fireBtnEl = hud.querySelector('#cb-autofire') as HTMLButtonElement;
    this.prepBarEl = hud.querySelector('#cb-prep-bar') as HTMLDivElement;
    this.prepLabelEl = hud.querySelector('#cb-prep-label') as HTMLSpanElement;
    this.prepTimeEl = hud.querySelector('#cb-prep-time') as HTMLSpanElement;
    this.prepFillEl = hud.querySelector('#cb-prep-fill') as HTMLDivElement;

    this.fireBtnEl.addEventListener('click', () => {
      this.state.autoFire = !this.state.autoFire;
      this.syncAutoFireButton();
    });

    const muteBtn = hud.querySelector('#cb-mute') as HTMLButtonElement;
    muteBtn.addEventListener('click', () => {
      this.audio.unlock();
      muteBtn.textContent = this.audio.toggleMute() ? '🔇' : '🔊';
    });
  }

  syncAutoFireButton(): void {
    if (!this.fireBtnEl) return;
    if (this.elapsed < PLAYER_FIRE_WARMUP_SEC) {
      const pct = Math.min(100, (this.elapsed / PLAYER_FIRE_WARMUP_SEC) * 100);
      const left = Math.max(0, PLAYER_FIRE_WARMUP_SEC - this.elapsed);
      this.fireBtnEl.textContent = `CHUẨN BỊ VŨ KHÍ: ${left.toFixed(1)}s`;
      this.prepFillEl.style.width = `${pct.toFixed(0)}%`;
      this.prepTimeEl.textContent = `${pct.toFixed(0)}% · ${left.toFixed(1)}s`;
      return;
    }

    if (!this.weaponReadyAnnounced) {
      this.weaponReadyAnnounced = true;
      this.audio.playPickup();
      this.prepBarEl.classList.add('ready');
      this.prepLabelEl.textContent = '★ VŨ KHÍ SẴN SÀNG — KHAI HỎA!';
      this.prepTimeEl.textContent = '100%';
      this.prepFillEl.style.width = '100%';
    } else if (this.elapsed >= PLAYER_FIRE_WARMUP_SEC + 1.35) {
      this.prepBarEl.classList.add('hidden');
    }

    this.fireBtnEl.textContent = this.state.autoFire ? 'TỰ NGẮM BẮN: BẬT' : 'TỰ NGẮM BẮN: TẮT';
  }

  resize(width: number, height: number): void {
    const topMargin = 104;
    const bottomMargin = height > 680 ? 118 : 96;
    const sideMargin = width > 740 ? Math.max(24, (width - 700) / 2) : 8;

    this.arenaLeft = sideMargin;
    this.arenaTop = topMargin;
    this.arenaWidth = Math.max(260, width - sideMargin * 2);
    this.arenaHeight = Math.max(280, height - topMargin - bottomMargin);

    if (this.elapsed === 0) {
      this.playerX = this.arenaLeft + this.arenaWidth / 2;
      this.playerY = this.arenaTop + this.arenaHeight * 0.84;
      this.enemyX = this.arenaLeft + this.arenaWidth / 2;
      this.enemyY = this.arenaTop + Math.min(82, this.arenaHeight * 0.18);
    }

    this.drawDaylightArena(width, height);
  }

  private drawDaylightArena(w: number, h: number): void {
    const g = this.arenaBg;
    g.clear();
    g.rect(0, 0, w, h).fill({ color: 0xe3dbc6 });
    g.roundRect(this.arenaLeft, this.arenaTop, this.arenaWidth, this.arenaHeight, 10)
      .fill({ color: 0xf4efe0 })
      .stroke({ color: this.ambush.bossRole !== 'standard' ? 0xb52424 : 0x8a6c34, width: 2.5, alpha: 0.9 });

    const step = 46;
    for (let x = this.arenaLeft + step; x < this.arenaLeft + this.arenaWidth; x += step) {
      g.moveTo(x, this.arenaTop)
        .lineTo(x, this.arenaTop + this.arenaHeight)
        .stroke({ color: 0x8a7d60, width: 1, alpha: 0.2 });
    }
    for (let y = this.arenaTop + step; y < this.arenaTop + this.arenaHeight; y += step) {
      g.moveTo(this.arenaLeft, y)
        .lineTo(this.arenaLeft + this.arenaWidth, y)
        .stroke({ color: 0x8a7d60, width: 1, alpha: 0.2 });
    }
  }

  update(dt: number): void {
    this.syncAutoFireButton();
    this.updateSparks(dt);

    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
      const amp = this.shakeTimer * 22;
      this.root.position.set((Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp);
    } else {
      this.root.position.set(0, 0);
    }

    if (this.statePhase === 'MODAL') return;

    if (this.statePhase === 'VICTORY_HOLD') {
      this.victoryHoldTimer += dt;
      if (this.victoryHoldTimer >= 0.95) {
        this.scenes.goTo('OVERWORLD');
      }
      return;
    }

    this.elapsed += dt;
    const v = this.state.currentVehicle;
    const sample = this.input.sample();

    const moveDx = sample.axisX * v.combatSpeed * dt + sample.dragDx * 1.15;
    const moveDy = sample.axisY * v.combatSpeed * dt + sample.dragDy * 1.15;
    this.playerX += moveDx;
    this.playerY += moveDy;

    const visualHalfW = v.width / 2;
    const visualHalfH = v.height / 2;
    const hitHalfW = v.hitboxWidth / 2;
    const hitHalfH = v.hitboxHeight / 2;
    this.playerX = Math.max(
      this.arenaLeft + visualHalfW + 4,
      Math.min(this.arenaLeft + this.arenaWidth - visualHalfW - 4, this.playerX)
    );
    this.playerY = Math.max(
      this.arenaTop + visualHalfH + 4,
      Math.min(this.arenaTop + this.arenaHeight - visualHalfH - 4, this.playerY)
    );
    this.playerSprite.position.set(this.playerX, this.playerY);

    const targetTilt = Math.max(-0.16, Math.min(0.16, moveDx * 0.03));
    this.playerSprite.rotation += (targetTilt - this.playerSprite.rotation) * Math.min(1, dt * 14);

    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - dt);
      this.playerSprite.alpha = Math.floor(this.invulnTimer * 18) % 2 === 0 ? 0.3 : 1;
    } else {
      this.playerSprite.alpha = 1;
    }

    const prevEnemyX = this.enemyX;
    const swayAmp = Math.min(175, this.arenaWidth * 0.34);
    const swaySpeed = this.ambush.faction === 'my' || this.ambush.bossRole !== 'standard' ? 0.85 : 0.7;
    this.enemyX = this.arenaLeft + this.arenaWidth / 2 + Math.sin(this.elapsed * swaySpeed) * swayAmp;
    this.enemyY = this.arenaTop + Math.min(82, this.arenaHeight * 0.18) + Math.sin(this.elapsed * 1.4) * 10;
    const enemyVx = dt > 0 ? (this.enemyX - prevEnemyX) / dt : 0;
    this.enemySprite.position.set(this.enemyX, this.enemyY);

    // Player fires rapid straight auto-aim stream ONLY AFTER the 4.5s weapon preparation bar fills
    if (this.state.autoFire && this.elapsed >= PLAYER_FIRE_WARMUP_SEC) {
      this.playerFireTimer += dt;
      if (this.playerFireTimer >= v.fireInterval) {
        this.playerFireTimer = 0;
        this.shotCount += 1;
        this.bullets.firePlayerAutoAimShot(this.playerX, this.playerY, this.enemyX, this.enemyY, enemyVx, v);
        if (this.shotCount % 2 === 1) {
          this.audio.playShoot();
        }
      }
    }

    const enraged = this.enemyHp < this.maxEnemyHp * 0.5;
    const baseFireInterval =
      this.ambush.bossRole !== 'standard' ? 1.2 : FACTION_FIRE_INTERVAL[this.ambush.faction];
    const fireInterval = enraged ? baseFireInterval * 0.86 : baseFireInterval;
    const speedScale = this.state.pipelineSlowActive && this.elapsed < 3.0 ? 0.8 : 1.0;

    this.enemyFireTimer -= dt;
    if (this.enemyFireTimer <= 0) {
      this.enemyFireTimer = fireInterval;
      this.waveIndex += 1;
      this.bullets.fireEnemyPattern({
        faction: this.ambush.faction,
        bossRole: this.ambush.bossRole,
        waveIndex: this.waveIndex,
        enraged,
        ex: this.enemyX,
        ey: this.enemyY + 14,
        px: this.playerX,
        py: this.playerY,
        arenaLeft: this.arenaLeft,
        arenaTop: this.arenaTop,
        arenaWidth: this.arenaWidth,
        arenaHeight: this.arenaHeight,
        speedScale,
        onBombWarn: () => this.audio.playBombWarn()
      });
    }

    // Mid-combat stationary random-position historical pickups (does NOT drift off-screen!)
    if (this.pickupsSpawned < 3 && this.state.loreCursor < LORE_TIMELINE.length) {
      this.pickupDropTimer -= dt;
      if (this.pickupDropTimer <= 0) {
        this.pickupDropTimer = 16.0;
        this.pickupsSpawned += 1;

        const minX = this.arenaLeft + 52;
        const maxX = Math.max(minX + 10, this.arenaLeft + this.arenaWidth - 52);
        const minY = this.arenaTop + Math.min(155, this.arenaHeight * 0.36);
        const maxY = Math.max(minY + 10, this.arenaTop + this.arenaHeight - 52);

        let px = minX + Math.random() * (maxX - minX);
        let py = minY + Math.random() * (maxY - minY);
        // Avoid spawning directly on top of player
        for (let tries = 0; tries < 6; tries++) {
          if (Math.hypot(px - this.playerX, py - this.playerY) >= 90) break;
          px = minX + Math.random() * (maxX - minX);
          py = minY + Math.random() * (maxY - minY);
        }

        const sprite = createLorePickupSprite();
        sprite.position.set(px, py);
        this.actorContainer.addChild(sprite);
        this.pickups.push({ x: px, y: py, baseY: py, sprite, collected: false });
      }
    }

    for (const p of this.pickups) {
      if (p.collected) continue;
      // Stationary gentle hover bob in place (no downward drift)
      p.y = p.baseY + Math.sin(this.elapsed * 4 + p.x) * 3.5;
      p.sprite.position.set(p.x, p.y);

      const dx = this.playerX - p.x;
      const dy = this.playerY - p.y;
      const grabR = Math.max(visualHalfW, visualHalfH) + 20;
      if (dx * dx + dy * dy <= grabR * grabR) {
        p.collected = true;
        p.sprite.visible = false;
        this.loreToast.collectNextTimelineItem(this.state, this.audio);

        // Lore strike: immediately cut 25% of boss's CURRENT HP + brief firing pause to read Visual Novel dialog
        const chunkDamage = Math.ceil(this.enemyHp * 0.25);
        this.spawnSparks(this.enemyX, this.enemyY, 26, 0xe6a61e);
        this.shakeTimer = Math.max(this.shakeTimer, 0.2);
        this.enemyFireTimer = Math.max(this.enemyFireTimer, 1.4);
        this.onEnemyDamaged(chunkDamage);
      }
    }

    this.bullets.update(
      dt,
      {
        left: this.arenaLeft,
        right: this.arenaLeft + this.arenaWidth,
        top: this.arenaTop,
        bottom: this.arenaTop + this.arenaHeight
      },
      { x: this.playerX, y: this.playerY, halfW: hitHalfW, halfH: hitHalfH },
      { x: this.enemyX, y: this.enemyY, radius: 36 },
      () => this.onPlayerDamaged(),
      (damage) => this.onEnemyDamaged(damage),
      () => {
        this.audio.playBombExplosion();
        this.shakeTimer = Math.max(this.shakeTimer, 0.24);
      }
    );
  }

  private onPlayerDamaged(): void {
    if (this.invulnTimer > 0 || this.statePhase !== 'FIGHT') return;
    this.playerHp = Math.max(0, this.playerHp - 1);
    this.invulnTimer = 0.95;
    this.shakeTimer = 0.28;
    this.audio.playHit();
    this.spawnSparks(this.playerX, this.playerY, 12, 0xc92424);

    this.hpFillEl.style.width = `${(this.playerHp / this.maxPlayerHp) * 100}%`;
    this.hpTextEl.textContent = `${this.playerHp}/${this.maxPlayerHp}`;

    if (this.playerHp <= 0) {
      if (this.state.consumeReviveShield()) {
        // Trigger Revive Armor earned from Overworld map lore!
        this.playerHp = this.maxPlayerHp;
        this.invulnTimer = 2.2;
        this.shakeTimer = 0.4;
        this.bullets.clearAllEnemyBullets();
        this.audio.playDopamineFanfare();
        this.spawnSparks(this.playerX, this.playerY, 44, 0x229954);
        this.hpFillEl.style.width = '100%';
        this.hpTextEl.textContent = `${this.playerHp}/${this.maxPlayerHp}`;
        this.shieldTextEl.textContent = `🛡×${this.state.reviveShields}`;
        this.loreToast.enqueueCustom(
          'GIÁP HỒI SINH',
          'Chặn đòn chí mạng',
          `Đã quét sạch đạn địch và hồi đầy độ bền (còn ${this.state.reviveShields} giáp).`,
          '🛡',
          4.0
        );
        return;
      }
      this.handleDefeat();
    }
  }

  private onEnemyDamaged(damage: number): void {
    if (this.statePhase !== 'FIGHT') return;
    this.enemyHp = Math.max(0, this.enemyHp - damage);
    this.bossFillEl.style.width = `${(this.enemyHp / this.maxEnemyHp) * 100}%`;
    this.bossTextEl.textContent = `${Math.ceil(this.enemyHp)} / ${this.maxEnemyHp}`;

    if (this.enemyHp <= 0) {
      this.handleVictory();
    }
  }

  private handleVictory(): void {
    this.bullets.clearAllEnemyBullets();
    this.enemySprite.visible = false;
    this.state.clearedAmbushes.add(this.ambush.id);
    this.state.recordRegionEncounter(this.ambush.regionIndex);
    this.state.stats.combatsWon += 1;
    this.state.activeAmbush = null;

    if (this.ambush.bossRole === 'tutorial') {
      this.state.tutorialDone = true;
      this.state.tutorialWon = true;
      // Teleport right next to Chặng I Cụm Mật Mã Bắc Kạn on the safe West road
      const reg = getRegionConfig(this.ambush.regionIndex);
      this.state.savedMapPos = {
        x: reg.destinationX - reg.destinationRadius - 48,
        y: reg.destinationY + 6
      };
      this.statePhase = 'MODAL';
      this.shakeTimer = 0.6;
      this.audio.playDopamineFanfare();
      this.spawnSparks(this.enemyX, this.enemyY, 72, 0xd4961a);

      this.loreToast.enqueueCustom(
        'CHẶNG I',
        'Phá chốt mở màn thành công!',
        'Mở thẳng lối tới sát Cụm Mật mã Bắc Kạn và +1 độ bền tối đa suốt game.',
        '★',
        6.0
      );

      this.showOutcomeModal({
        variant: 'dopamine',
        title: '★ PHÁ CHỐT MỞ MÀN ★',
        body:
          'Bạn đã hạ được chốt phục kích mở màn trên chiếc Xe đạp 2 độ bền.\nThưởng: Dịch chuyển sát đích Bắc Kạn và +1 độ bền tối đa cho mọi xe.',
        buttonLabel: 'TỚI ĐÍCH →',
        onConfirm: () => this.scenes.goTo('OVERWORLD')
      });
      return;
    }

    if (this.ambush.bossRole === 'rematch') {
      this.state.rematchWon = true;
      const reg = getRegionConfig(this.ambush.regionIndex);
      this.state.savedMapPos = {
        x: reg.destinationX + reg.destinationRadius + 46,
        y: reg.destinationY
      };
      this.statePhase = 'MODAL';
      this.shakeTimer = 0.65;
      this.audio.playDopamineFanfare();
      this.spawnSparks(this.enemyX, this.enemyY, 80, 0xd4961a);

      this.loreToast.enqueueCustom(
        'TRƯỜNG SƠN',
        'Hạ biên đội B-52!',
        'Cửa ngõ Đông Nam Bộ đã mở — tiến vào đích sang Sài Gòn 1975.',
        '★',
        6.0
      );

      this.showOutcomeModal({
        variant: 'dopamine',
        title: '★ THẮNG TRẬN TÁI ĐẤU ★',
        body:
          'Biên đội B-52 đã bị đẩy lùi khỏi cửa ngõ Trường Sơn.\nLối vào đích mở ngay trước mắt — sẵn sàng sang Sài Gòn 1975.',
        buttonLabel: 'VÀO ĐÍCH →',
        onConfirm: () => this.scenes.goTo('OVERWORLD')
      });
      return;
    }

    this.statePhase = 'VICTORY_HOLD';
    this.victoryHoldTimer = 0;
    this.audio.playEnemyDefeat();
    this.spawnSparks(this.enemyX, this.enemyY, 36, 0xd98a18);
  }

  private handleDefeat(): void {
    this.statePhase = 'MODAL';
    this.bullets.clearAll();

    if (this.ambush.bossRole === 'tutorial') {
      this.state.tutorialDone = true;
      this.state.clearedAmbushes.add(this.ambush.id);
      this.state.recordRegionEncounter(this.ambush.regionIndex);
      this.state.activeAmbush = null;

      this.showOutcomeModal({
        variant: 'normal',
        title: 'BỨC ĐIỆN ĐẾN MUỘN',
        body:
          'Thiếu thông tin, rơi vào ổ phục kích rất khó chống đỡ.\nTiếp tục bám nhánh đường mòn sạch về Bắc Kạn, nâng cấp Cơ yếu và hẹn gặp lại ở cuối Trường Sơn.',
        buttonLabel: 'ĐI TIẾP →',
        onConfirm: () => this.scenes.goTo('OVERWORLD')
      });
      return;
    }

    if (this.ambush.bossRole === 'rematch') {
      this.showOutcomeModal({
        variant: 'danger',
        title: 'CHƯA QUA ĐƯỢC B-52',
        body:
          'Cửa ngõ Trường Sơn vẫn bị khóa.\nChạy lại Chặng IV theo nhánh sạch, lượm Giáp hồi sinh dọc đường rồi quay lại hạ nó.',
        buttonLabel: 'CHƠI LẠI CHẶNG IV ↺',
        onConfirm: () => {
          const reg = getRegionConfig(this.state.regionIndex);
          this.state.resetCurrentRegionProgress(reg.ambushes.map((a) => a.id));
          this.scenes.goTo('OVERWORLD');
        }
      });
      return;
    }

    this.showOutcomeModal({
      variant: 'danger',
      title: 'XE BỊ CHẶN TRONG Ổ PHỤC KÍCH',
      body: 'Chạy lại từ đầu chặng hiện tại (giữ nguyên xe và kĩ năng đã mở).',
      buttonLabel: 'CHƠI LẠI CHẶNG NÀY ↺',
      onConfirm: () => {
        const reg = getRegionConfig(this.state.regionIndex);
        this.state.resetCurrentRegionProgress(reg.ambushes.map((a) => a.id));
        this.scenes.goTo('OVERWORLD');
      }
    });
  }

  private showOutcomeModal(opts: {
    variant: 'dopamine' | 'normal' | 'danger';
    title: string;
    body: string;
    buttonLabel: string;
    onConfirm: () => void;
  }): void {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    const cls = opts.variant === 'dopamine' ? 'dopamine' : opts.variant === 'danger' ? 'danger' : '';
    backdrop.innerHTML = `
      <div class="outcome-modal ${cls}">
        <h2>${opts.title}</h2>
        <p>${opts.body}</p>
        <button id="btn-outcome" class="btn btn-primary">${opts.buttonLabel}</button>
      </div>
    `;
    this.uiRoot.appendChild(backdrop);

    const btn = backdrop.querySelector('#btn-outcome') as HTMLButtonElement;
    btn.addEventListener('click', () => {
      this.audio.unlock();
      opts.onConfirm();
    });
  }

  private spawnSparks(x: number, y: number, count: number, color: number): void {
    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      g.circle(0, 0, 2.5 + (i % 4)).fill({ color });
      g.position.set(x, y);
      this.fxContainer.addChild(g);
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const spd = 80 + Math.random() * 230;
      this.sparks.push({ g, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 0.7 + Math.random() * 0.4 });
    }
  }

  private updateSparks(dt: number): void {
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt;
      if (s.life <= 0) {
        s.g.destroy();
        this.sparks.splice(i, 1);
        continue;
      }
      s.g.x += s.vx * dt;
      s.g.y += s.vy * dt;
      s.g.alpha = Math.min(1, s.life * 1.4);
    }
  }

  unmount(): void {
    this.root.destroy({ children: true });
  }
}
