import { Container, Graphics } from 'pixi.js';
import { AudioEngine } from '../core/AudioEngine';
import { GameState } from '../core/GameState';
import { GameScene, SceneManager } from '../core/SceneManager';
import { REGION_TRANSITIONS } from '../data/loreTimeline';
import { CRYPTO_SKILLS, SkillId } from '../data/skills';
import { getVehicleByRegion } from '../data/vehicles';

/**
 * Scene 5 — Region Exit Modal (2 Columns):
 * - Left pane (dominant): Historical Lore narrative + Automatic Vehicle Upgrade summary.
 * - Right pane (compact): Choose 1 of 3 Cryptography Upgrades showing ONLY their historical names!
 */
export class RegionExitOverlay implements GameScene {
  readonly id = 'REGION_EXIT' as const;
  private root = new Container();
  private bg = new Graphics();

  constructor(
    private state: GameState,
    private scenes: SceneManager,
    private audio: AudioEngine
  ) {}

  mount(stage: Container, uiRoot: HTMLElement): void {
    stage.addChild(this.root);
    this.root.addChild(this.bg);

    const fromIndex = this.state.regionIndex;
    const nextIndex = Math.min(4, fromIndex + 1);
    const transition = REGION_TRANSITIONS[Math.min(fromIndex, REGION_TRANSITIONS.length - 1)];
    const prevVehicle = getVehicleByRegion(fromIndex);
    const nextVehicle = getVehicleByRegion(nextIndex);

    // Always offer exactly 3 unacquired historical crypto upgrades
    const unacquired = CRYPTO_SKILLS.filter((s) => !this.state.hasSkill(s.id));
    const offeredSkills = unacquired.slice(0, 3);
    const enteringSaigon = nextIndex === 4;
    const bonusHp = this.state.tutorialWon ? 1 : 0;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="region-modal">
        <div class="region-modal-header">
          <div class="era-line">${transition.eraTransition}</div>
          <h2>${transition.headline}</h2>
        </div>

        ${
          enteringSaigon
            ? `<div class="max-banner">★ MÙA XUÂN 1975 · XE TĂNG T-54B &amp; TOÀN MẠNG CƠ YẾU TỐI ĐA</div>`
            : ''
        }

        <div class="region-modal-grid">
          <div class="region-pane">
            <h3>Diễn Biến Chiến Trường</h3>
            <p class="story-body">${transition.storyText}</p>
            <div class="upgrade-box">
              <div class="upgrade-title">PHƯƠNG TIỆN MỚI</div>
              <div class="upgrade-row">
                <span>${prevVehicle.name}</span>
                <span class="upgrade-arrow">→</span>
                <strong style="color:#8c1c1c;">${nextVehicle.name}</strong>
              </div>
              <div class="upgrade-row">
                <span>Độ bền:</span>
                <span>${prevVehicle.baseHp + bonusHp} → <strong style="color:#1c7c4a;">${nextVehicle.baseHp + bonusHp}</strong></span>
              </div>
              <div class="upgrade-row">
                <span>Vũ khí:</span>
                <span><strong>${nextVehicle.weaponDesc}</strong></span>
              </div>
            </div>
          </div>

          <div class="region-pane">
            <h3>Chọn 1 Cải Tiến Cơ Yếu</h3>
            <div class="skill-choice-list" id="skill-list"></div>
          </div>
        </div>
      </div>
    `;

    uiRoot.appendChild(backdrop);

    const listEl = backdrop.querySelector('#skill-list') as HTMLDivElement;
    for (const skill of offeredSkills) {
      const btn = document.createElement('button');
      btn.className = 'skill-name-card';
      btn.textContent = skill.name;
      btn.addEventListener('click', () => this.selectSkill(skill.id, nextIndex, enteringSaigon));
      listEl.appendChild(btn);
    }
  }

  private selectSkill(skillId: SkillId, nextRegionIndex: number, enteringSaigon: boolean): void {
    this.audio.unlock();
    this.audio.playDopamineFanfare();
    this.state.unlockSkill(skillId);
    if (enteringSaigon) {
      this.state.activateFullNetworkMax();
    }
    this.state.regionIndex = nextRegionIndex;
    this.state.savedMapPos = null;
    this.state.activeAmbush = null;
    this.scenes.goTo('OVERWORLD');
  }

  resize(width: number, height: number): void {
    this.bg.clear();
    this.bg.rect(0, 0, width, height).fill({ color: 0xe6dec9 });
  }

  update(_dt: number): void {
    // Modal awaits player choice
  }

  unmount(): void {
    this.root.destroy({ children: true });
  }
}
