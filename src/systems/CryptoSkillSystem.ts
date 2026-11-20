import { AudioEngine } from '../core/AudioEngine';
import { GameState } from '../core/GameState';
import { RoadNode } from '../data/regions';
import { CRYPTO_SKILLS, getSkillConfig, SkillId } from '../data/skills';

export interface AmbushTargetInfo {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface SkillRuntimeState {
  id: SkillId;
  cooldownElapsed: number;
  activeRemaining: number;
  intervalSec: number;
  activeDurationSec: number;
}

export interface SkillVisualSnapshot {
  radarWaveRadius: number;
  radarWaveAlpha: number;
  visionPulseActive: boolean;
  scanRangeScale: number;
  groundHintsActive: boolean;
  ambushShrinkFactor: number;
  /** Safest road node ahead toward destination suggested by Mã Dịch Song Song */
  safeWaypoint: { x: number; y: number } | null;
}

export class CryptoSkillSystem {
  private states = new Map<SkillId, SkillRuntimeState>();
  private skillHudEl: HTMLDivElement;
  private cipherTickerEl: HTMLDivElement;
  private edgeGlows: Record<'top' | 'bottom' | 'left' | 'right', HTMLDivElement>;
  private cardEls = new Map<SkillId, { card: HTMLDivElement; fill: HTMLDivElement; time: HTMLSpanElement }>();

  private edgeGlowTimer = 0;
  private safeWaypoint: { x: number; y: number } | null = null;
  private radarRadius = 0;

  constructor(uiRoot: HTMLElement, state: GameState) {
    this.edgeGlows = {
      top: this.createEdge(uiRoot, 'top'),
      bottom: this.createEdge(uiRoot, 'bottom'),
      left: this.createEdge(uiRoot, 'left'),
      right: this.createEdge(uiRoot, 'right')
    };

    this.skillHudEl = document.createElement('div');
    this.skillHudEl.className = 'skill-hud';
    uiRoot.appendChild(this.skillHudEl);

    this.cipherTickerEl = document.createElement('div');
    this.cipherTickerEl.className = 'offmap-cipher';
    uiRoot.appendChild(this.cipherTickerEl);

    this.syncFromGameState(state);
  }

  private createEdge(parent: HTMLElement, side: 'top' | 'bottom' | 'left' | 'right'): HTMLDivElement {
    const el = document.createElement('div');
    el.className = `edge-glow ${side}`;
    parent.appendChild(el);
    return el;
  }

  syncFromGameState(state: GameState): void {
    this.states.clear();
    this.skillHudEl.innerHTML = '';
    this.cardEls.clear();

    const intervalBoost = state.hasSkill('school_1951') ? 0.8 : 1.0;

    for (const skill of CRYPTO_SKILLS) {
      if (!state.hasSkill(skill.id)) continue;

      if (!skill.isPeriodic) {
        const chip = document.createElement('div');
        chip.className = `skill-bar-card${state.maxSkillsActive ? ' maxed' : ''}`;
        chip.innerHTML = `
          <div class="skill-bar-header">
            <span>${skill.name}</span>
            <span>BẬT</span>
          </div>
        `;
        this.skillHudEl.appendChild(chip);
        continue;
      }

      const rawInterval = state.maxSkillsActive ? skill.maxIntervalSec : skill.intervalSec;
      const intervalSec = Math.max(1.8, rawInterval * intervalBoost);
      const activeDurationSec = state.maxSkillsActive ? skill.maxDurationSec : skill.activeDurationSec;
      const stagger = this.states.size * 0.65;

      this.states.set(skill.id, {
        id: skill.id,
        cooldownElapsed: Math.max(0, intervalSec - 1.2 - stagger),
        activeRemaining: 0,
        intervalSec,
        activeDurationSec
      });

      const card = document.createElement('div');
      card.className = `skill-bar-card${state.maxSkillsActive ? ' maxed' : ''}`;
      card.innerHTML = `
        <div class="skill-bar-header">
          <span>${skill.name}${state.maxSkillsActive ? ' ★' : ''}</span>
          <span class="sk-time">${intervalSec.toFixed(1)}s</span>
        </div>
        <div class="skill-bar-track"><div class="skill-bar-fill"></div></div>
      `;
      this.skillHudEl.appendChild(card);

      this.cardEls.set(skill.id, {
        card,
        fill: card.querySelector('.skill-bar-fill') as HTMLDivElement,
        time: card.querySelector('.sk-time') as HTMLSpanElement
      });
    }
  }

  update(
    dt: number,
    playerX: number,
    playerY: number,
    destX: number,
    destY: number,
    roadNodes: RoadNode[],
    ambushes: AmbushTargetInfo[],
    state: GameState,
    audio: AudioEngine
  ): SkillVisualSnapshot {
    if (this.edgeGlowTimer > 0) {
      this.edgeGlowTimer = Math.max(0, this.edgeGlowTimer - dt);
      if (this.edgeGlowTimer === 0) {
        this.clearEdgeGlows();
      }
    }

    const scanRangeScale = state.hasSkill('split_1946') ? 1.35 : 1.0;

    for (const rt of this.states.values()) {
      if (rt.activeRemaining > 0) {
        rt.activeRemaining = Math.max(0, rt.activeRemaining - dt);
      }

      rt.cooldownElapsed += dt;
      if (rt.cooldownElapsed >= rt.intervalSec) {
        rt.cooldownElapsed -= rt.intervalSec;
        rt.activeRemaining = rt.activeDurationSec;
        this.triggerSkill(rt.id, playerX, playerY, destX, destY, roadNodes, ambushes, state, audio, scanRangeScale);
      }

      const ui = this.cardEls.get(rt.id);
      if (ui) {
        const pct = Math.min(100, (rt.cooldownElapsed / rt.intervalSec) * 100);
        ui.fill.style.width = `${pct.toFixed(0)}%`;
        const remain = Math.max(0, rt.intervalSec - rt.cooldownElapsed);
        ui.time.textContent = rt.activeRemaining > 0 ? 'QUÉT' : `${remain.toFixed(1)}s`;
        ui.card.classList.toggle('pulsing', rt.activeRemaining > 0);
      }
    }

    const visionRt = this.states.get('vision_1948');
    const visionActive = (visionRt?.activeRemaining ?? 0) > 0;
    const maxRadar = (state.maxSkillsActive ? 540 : 410) * scanRangeScale;
    if (visionActive && visionRt) {
      const progress = 1 - visionRt.activeRemaining / visionRt.activeDurationSec;
      this.radarRadius = Math.min(maxRadar, 70 + progress * maxRadar * 1.15);
    } else {
      this.radarRadius = 0;
    }

    const truongSonRt = this.states.get('truongson_1959');
    const groundHintsActive = (truongSonRt?.activeRemaining ?? 0) > 0;

    const pipeRt = this.states.get('pipeline_1975');
    const pipeActive = (pipeRt?.activeRemaining ?? 0) > 0;
    state.pipelineSlowActive = pipeActive || state.maxSkillsActive;
    if (!pipeActive) {
      this.cipherTickerEl.classList.remove('visible');
      this.safeWaypoint = null;
    }

    return {
      radarWaveRadius: this.radarRadius,
      radarWaveAlpha: visionActive && visionRt ? Math.min(0.85, visionRt.activeRemaining / visionRt.activeDurationSec) : 0,
      visionPulseActive: visionActive,
      scanRangeScale,
      groundHintsActive,
      ambushShrinkFactor: groundHintsActive ? 0.75 : 1.0,
      safeWaypoint: this.safeWaypoint
    };
  }

  private triggerSkill(
    id: SkillId,
    playerX: number,
    playerY: number,
    destX: number,
    destY: number,
    roadNodes: RoadNode[],
    ambushes: AmbushTargetInfo[],
    state: GameState,
    audio: AudioEngine,
    scanRangeScale: number
  ): void {
    const cfg = getSkillConfig(id);

    if (id === 'vision_1948') {
      audio.playRadarPing();
      return;
    }

    if (id === 'ktb_1951') {
      const nearest = this.findNearestAmbush(playerX, playerY, ambushes);
      if (!nearest) return;
      const dx = nearest.x - playerX;
      const dy = nearest.y - playerY;
      const dist = Math.hypot(dx, dy);
      const closeness = Math.max(0, Math.min(1, 1 - dist / (760 * scanRangeScale)));

      this.clearEdgeGlows();
      const intensity = Math.max(0.35, Math.min(0.95, 0.28 + closeness * 0.72));
      if (dy < -40) this.edgeGlows.top.style.opacity = intensity.toFixed(2);
      if (dy > 40) this.edgeGlows.bottom.style.opacity = intensity.toFixed(2);
      if (dx < -40) this.edgeGlows.left.style.opacity = intensity.toFixed(2);
      if (dx > 40) this.edgeGlows.right.style.opacity = intensity.toFixed(2);
      this.edgeGlowTimer = state.maxSkillsActive ? cfg.maxDurationSec : cfg.activeDurationSec;

      audio.playMorse(closeness);
      return;
    }

    if (id === 'truongson_1959') {
      audio.playRadarPing();
      return;
    }

    if (id === 'pipeline_1975') {
      // Pick the safest open-map trail junction moving closer to destination
      const curDistToDest = Math.hypot(destX - playerX, destY - playerY);
      let bestNode: RoadNode | null = null;
      let bestScore = -Infinity;

      for (const n of roadNodes) {
        const distFromPlayer = Math.hypot(n.x - playerX, n.y - playerY);
        if (distFromPlayer < 130 || distFromPlayer > 900) continue;
        const nodeDistToDest = Math.hypot(destX - n.x, destY - n.y);
        const progressGain = curDistToDest - nodeDistToDest;
        let minAmbushClearance = 600;
        for (const a of ambushes) {
          const d = Math.hypot(a.x - n.x, a.y - n.y) - a.radius;
          if (d < minAmbushClearance) minAmbushClearance = d;
        }
        const score = progressGain * 0.75 + Math.min(260, minAmbushClearance) * 1.4;
        if (score > bestScore) {
          bestScore = score;
          bestNode = n;
        }
      }

      const targetX = bestNode ? bestNode.x : destX;
      const targetY = bestNode ? bestNode.y : destY;
      this.safeWaypoint = { x: targetX, y: targetY };

      const compassLabel = this.getCompassLabel(targetX - playerX, targetY - playerY);
      const g1 = Math.floor(10000 + Math.random() * 89999);
      const key = 58194;
      const enc = this.mod10Add5(g1, key);
      this.cipherTickerEl.innerHTML = `
        <div>GIẢI MÃ TỔNG HÀNH DINH</div>
        <div>${g1} + ${key} → ${enc}</div>
        <div style="color:#8c1c1c;margin-top:2px;">NHÁNH AN TOÀN: ${compassLabel}</div>
      `;
      this.cipherTickerEl.classList.add('visible');
    }
  }

  private getCompassLabel(dx: number, dy: number): string {
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (ang >= -22.5 && ang < 22.5) return 'ĐÔNG →';
    if (ang >= 22.5 && ang < 67.5) return 'ĐÔNG NAM ↘';
    if (ang >= 67.5 && ang < 112.5) return 'NAM ↓';
    if (ang >= 112.5 && ang < 157.5) return 'TÂY NAM ↙';
    if (ang >= -67.5 && ang < -22.5) return 'ĐÔNG BẮC ↗';
    if (ang >= -112.5 && ang < -67.5) return 'BẮC ↑';
    if (ang >= -157.5 && ang < -112.5) return 'TÂY BẮC ↖';
    return 'TÂY ←';
  }

  private mod10Add5(a: number, b: number): string {
    const sa = String(a).padStart(5, '0');
    const sb = String(b).padStart(5, '0');
    let out = '';
    for (let i = 0; i < 5; i++) {
      out += String((Number(sa[i]) + Number(sb[i])) % 10);
    }
    return out;
  }

  private findNearestAmbush(x: number, y: number, ambushes: AmbushTargetInfo[]): AmbushTargetInfo | null {
    let best: AmbushTargetInfo | null = null;
    let bestDist = Infinity;
    for (const a of ambushes) {
      const d = Math.hypot(a.x - x, a.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = a;
      }
    }
    return best;
  }

  private clearEdgeGlows(): void {
    this.edgeGlows.top.style.opacity = '0';
    this.edgeGlows.bottom.style.opacity = '0';
    this.edgeGlows.left.style.opacity = '0';
    this.edgeGlows.right.style.opacity = '0';
  }
}
