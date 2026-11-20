import { Container, Graphics } from 'pixi.js';
import { AudioEngine } from '../core/AudioEngine';
import { GameState } from '../core/GameState';
import { GameScene, SceneId, SceneManager } from '../core/SceneManager';
import { CutsceneSlide, LORE_TIMELINE } from '../data/loreTimeline';

export class CutsceneScene implements GameScene {
  readonly id: SceneId;
  private root = new Container();
  private art = new Graphics();
  private slides: readonly CutsceneSlide[];
  private nextScene: SceneId;
  private tagLabel: string;
  private finalButtonText: string;

  private slideIndex = 0;
  private charCount = 0;
  private time = 0;
  private width = 1280;
  private height = 720;

  private overlayEl!: HTMLDivElement;
  private eraEl!: HTMLDivElement;
  private titleEl!: HTMLHeadingElement;
  private textEl!: HTMLParagraphElement;
  private statsEl!: HTMLDivElement;
  private progressEl!: HTMLSpanElement;
  private nextBtn!: HTMLButtonElement;

  constructor(
    id: SceneId,
    tagLabel: string,
    slides: readonly CutsceneSlide[],
    nextScene: SceneId,
    finalButtonText: string,
    private state: GameState,
    private scenes: SceneManager,
    private audio: AudioEngine
  ) {
    this.id = id;
    this.tagLabel = tagLabel;
    this.slides = slides;
    this.nextScene = nextScene;
    this.finalButtonText = finalButtonText;
  }

  mount(stage: Container, uiRoot: HTMLElement): void {
    stage.addChild(this.root);
    this.root.addChild(this.art);

    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'cutscene-overlay interactive';
    this.overlayEl.innerHTML = `
      <div class="cutscene-topbar">
        <div class="cutscene-tag">${this.tagLabel}</div>
        <button id="btn-skip" class="btn btn-small">BỎ QUA ⏭</button>
      </div>
      <div class="cutscene-box">
        <div class="cutscene-era" id="cs-era"></div>
        <h2 class="cutscene-title" id="cs-title"></h2>
        <p class="cutscene-text" id="cs-text"></p>
        <div id="cs-stats"></div>
        <div class="cutscene-footer">
          <span class="cutscene-progress" id="cs-progress"></span>
          <button id="btn-next" class="btn btn-primary btn-small">TIẾP TỤC →</button>
        </div>
      </div>
    `;
    uiRoot.appendChild(this.overlayEl);

    this.eraEl = this.overlayEl.querySelector('#cs-era') as HTMLDivElement;
    this.titleEl = this.overlayEl.querySelector('#cs-title') as HTMLHeadingElement;
    this.textEl = this.overlayEl.querySelector('#cs-text') as HTMLParagraphElement;
    this.statsEl = this.overlayEl.querySelector('#cs-stats') as HTMLDivElement;
    this.progressEl = this.overlayEl.querySelector('#cs-progress') as HTMLSpanElement;
    this.nextBtn = this.overlayEl.querySelector('#btn-next') as HTMLButtonElement;

    const skipBtn = this.overlayEl.querySelector('#btn-skip') as HTMLButtonElement;
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.unlock();
      this.finish();
    });

    this.nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.unlock();
      this.advance();
    });

    this.overlayEl.addEventListener('click', () => {
      this.audio.unlock();
      this.advance();
    });

    window.addEventListener('keydown', this.handleKey);
    this.loadSlide(0);
  }

  private handleKey = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      this.advance();
    }
  };

  private loadSlide(idx: number): void {
    this.slideIndex = idx;
    this.charCount = 0;
    const slide = this.slides[idx];

    this.overlayEl.classList.toggle('cyber-mode', Boolean(slide.cyberTheme));
    this.eraEl.textContent = slide.era;
    this.titleEl.textContent = slide.title;
    this.textEl.textContent = '';
    this.progressEl.textContent = `TRANG ${idx + 1} / ${this.slides.length}`;
    this.nextBtn.textContent = idx === this.slides.length - 1 ? this.finalButtonText : 'TIẾP TỤC →';

    if (slide.showStats) {
      const elapsedSec = Math.max(1, Math.round((Date.now() - this.state.stats.startTimeMs) / 1000));
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      this.statsEl.innerHTML = `
        <div class="stats-grid">
          <div class="stat-chip">
            <div class="stat-chip-label">Phục kích đã né</div>
            <div class="stat-chip-val">${this.state.stats.ambushesEvaded}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Trận đã thắng</div>
            <div class="stat-chip-val">${this.state.stats.combatsWon}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Hồ sơ lịch sử</div>
            <div class="stat-chip-val">${this.state.stats.loreCollected} / ${LORE_TIMELINE.length}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Chốt mở màn</div>
            <div class="stat-chip-val">${this.state.tutorialWon ? '★ THẮNG' : 'ĐÃ QUA'}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Tái đấu Trường Sơn</div>
            <div class="stat-chip-val">${this.state.rematchWon ? '★ THẮNG' : 'ĐÃ QUA'}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Thời gian</div>
            <div class="stat-chip-val">${mins}p ${String(secs).padStart(2, '0')}s</div>
          </div>
        </div>
      `;
    } else {
      this.statsEl.innerHTML = '';
    }
  }

  private advance(): void {
    const slide = this.slides[this.slideIndex];
    if (this.charCount < slide.text.length) {
      this.charCount = slide.text.length;
      this.textEl.textContent = slide.text;
      return;
    }

    this.audio.playPickup();
    if (this.slideIndex + 1 < this.slides.length) {
      this.loadSlide(this.slideIndex + 1);
    } else {
      this.finish();
    }
  }

  private finish(): void {
    this.scenes.goTo(this.nextScene);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  update(dt: number): void {
    this.time += dt;
    const slide = this.slides[this.slideIndex];

    if (this.charCount < slide.text.length) {
      this.charCount = Math.min(slide.text.length, this.charCount + dt * 62);
      this.textEl.textContent = slide.text.slice(0, Math.floor(this.charCount));
    }

    this.drawIllustration(slide);
  }

  private drawIllustration(slide: CutsceneSlide): void {
    const g = this.art;
    g.clear();
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h * 0.34;

    if (slide.cyberTheme) {
      // Bright daylight sky-white modern digital backdrop
      g.rect(0, 0, w, h).fill({ color: 0xeaf5fb });
      const step = 44;
      for (let x = 0; x < w; x += step) {
        g.moveTo(x, 0).lineTo(x, h).stroke({ color: 0x7cb9d4, width: 1, alpha: 0.25 });
      }
      for (let y = (this.time * 24) % step; y < h; y += step) {
        g.moveTo(0, y).lineTo(w, y).stroke({ color: 0x7cb9d4, width: 1, alpha: 0.25 });
      }
      for (let i = 0; i < 6; i++) {
        const ang = this.time * 0.5 + (i / 6) * Math.PI * 2;
        const nx = cx + Math.cos(ang) * 125;
        const ny = cy + Math.sin(ang) * 75;
        g.moveTo(cx, cy).lineTo(nx, ny).stroke({ color: 0x0f6f96, width: 1.8, alpha: 0.45 });
        g.circle(nx, ny, 7).fill({ color: 0x0f6f96, alpha: 0.85 });
      }
      g.poly([cx, cy - 54, cx + 46, cy - 26, cx + 38, cy + 32, cx, cy + 58, cx - 38, cy + 32, cx - 46, cy - 26])
        .fill({ color: 0xd0ebf7, alpha: 0.95 })
        .stroke({ color: 0x0f6f96, width: 3 });
      g.circle(cx, cy, 18 + Math.sin(this.time * 4) * 3).stroke({ color: 0x1c7c4a, width: 2.5 });
      return;
    }

    // Bright sunlit parchment & wartime map backdrop
    g.rect(0, 0, w, h).fill({ color: 0xefe8d5 });
    for (let x = 0; x < w; x += 56) {
      g.moveTo(x, 0).lineTo(x, h).stroke({ color: 0x998b6b, width: 1, alpha: 0.2 });
    }
    for (let y = 0; y < h; y += 56) {
      g.moveTo(0, y).lineTo(w, y).stroke({ color: 0x998b6b, width: 1, alpha: 0.2 });
    }

    switch (slide.visualKey) {
      case 'founding_1945': {
        g.poly([cx, cy - 85, cx - 38, cy + 65, cx + 38, cy + 65]).stroke({ color: 0x6b5324, width: 3 });
        g.moveTo(cx - 24, cy + 15).lineTo(cx + 24, cy + 15).stroke({ color: 0x6b5324, width: 2.2 });
        g.moveTo(cx - 14, cy - 25).lineTo(cx + 14, cy - 25).stroke({ color: 0x6b5324, width: 2.2 });
        for (let i = 0; i < 3; i++) {
          const r = ((this.time * 90 + i * 70) % 210) + 18;
          g.circle(cx, cy - 85, r).stroke({ color: 0x1c7c4a, width: 2.2, alpha: Math.max(0, 1 - r / 230) });
        }
        break;
      }
      case 'two_dispatches_1954': {
        const lx = cx - Math.min(180, w * 0.22);
        const rx = cx + Math.min(180, w * 0.22);
        g.circle(lx, cy, 48).fill({ color: 0xc92424, alpha: 0.14 }).stroke({ color: 0xb52424, width: 2.5 });
        g.moveTo(lx - 20, cy - 20).lineTo(lx + 20, cy + 20).stroke({ color: 0xb52424, width: 3.5 });
        g.moveTo(lx + 20, cy - 20).lineTo(lx - 20, cy + 20).stroke({ color: 0xb52424, width: 3.5 });

        g.circle(rx, cy, 48).fill({ color: 0x1c7c4a, alpha: 0.16 }).stroke({ color: 0x1c7c4a, width: 2.5 });
        g.star(rx, cy, 5, 22, 9).fill({ color: 0xd99b1e });

        const p = (this.time * 0.6) % 1;
        g.moveTo(cx, cy + 50).lineTo(rx, cy).stroke({ color: 0x1c7c4a, width: 2.4, alpha: 0.55 });
        g.circle(cx + (rx - cx) * p, cy + 50 - 50 * p, 6).fill({ color: 0x1c7c4a });
        break;
      }
      case 'victory_1975': {
        // Sunlit blue-cream sky behind Dinh Độc Lập
        g.rect(cx - 220, cy - 110, 440, 184).fill({ color: 0xd9ecf5, alpha: 0.65 });
        g.rect(cx - 160, cy + 12, 320, 62).fill({ color: 0xf0ece0 }).stroke({ color: 0x7c7868, width: 2 });
        for (let lx = cx - 144; lx <= cx + 144; lx += 16) {
          g.rect(lx, cy + 20, 5, 44).fill({ color: 0xb5afa0 });
        }
        const wave = Math.sin(this.time * 5) * 4;
        g.rect(cx - 3, cy - 92, 6, 108).fill({ color: 0x7a7a7a });
        g.rect(cx + 3, cy - 88 + wave * 0.3, 110, 32).fill({ color: 0xd92323 });
        g.rect(cx + 3, cy - 56 + wave * 0.3, 110, 32).fill({ color: 0x1e66c9 });
        g.star(cx + 58, cy - 56 + wave * 0.3, 5, 16, 7).fill({ color: 0xffe44d });
        break;
      }
      default: {
        const span = Math.min(440, w * 0.72);
        const startX = cx - span / 2;
        g.moveTo(startX, cy).lineTo(startX + span, cy).stroke({ color: 0x8a6c34, width: 3, alpha: 0.75 });
        for (let i = 0; i < 5; i++) {
          const nx = startX + (span * i) / 4;
          const active = Math.floor(this.time * 1.4) % 5 === i;
          g.circle(nx, cy, active ? 13 : 9).fill({ color: i === 4 ? 0xb52424 : 0x1c7c4a, alpha: active ? 1 : 0.75 });
          g.circle(nx, cy, active ? 20 : 14).stroke({ color: 0xb8861e, width: 2, alpha: 0.6 });
        }
        break;
      }
    }
  }

  unmount(): void {
    window.removeEventListener('keydown', this.handleKey);
    this.root.destroy({ children: true });
  }
}
