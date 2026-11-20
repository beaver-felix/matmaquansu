import { Container, Graphics, Text } from 'pixi.js';
import { AudioEngine } from '../core/AudioEngine';
import { GameState } from '../core/GameState';
import { GameScene, SceneManager } from '../core/SceneManager';

interface RouteNode {
  rx: number; // relative X (0..1)
  ry: number; // relative Y (0..1)
  name: string;
  year: string;
}

const ROUTE_NODES: readonly RouteNode[] = [
  { rx: 0.72, ry: 0.16, name: 'Việt Bắc', year: '1945' },
  { rx: 0.64, ry: 0.27, name: 'Điện Biên Phủ', year: '1954' },
  { rx: 0.75, ry: 0.51, name: 'Trường Sơn', year: '1959' },
  { rx: 0.81, ry: 0.69, name: 'Chiến khu Đ', year: '1961' },
  { rx: 0.77, ry: 0.84, name: 'Sài Gòn', year: '1975' }
];

export class TitleScene implements GameScene {
  readonly id = 'TITLE' as const;
  private root = new Container();
  private bgGraphics = new Graphics();
  private routeLayer = new Container();
  private nodeLabels: Text[] = [];
  private tickerText!: Text;
  private time = 0;
  private width = 1280;
  private height = 720;

  constructor(
    private state: GameState,
    private scenes: SceneManager,
    private audio: AudioEngine,
    private onResetToast: () => void
  ) {}

  mount(stage: Container, uiRoot: HTMLElement): void {
    stage.addChild(this.root);
    this.root.addChild(this.bgGraphics);
    this.root.addChild(this.routeLayer);

    // Subtle map node labels on right-side cartographic arc
    this.nodeLabels = [];
    for (const node of ROUTE_NODES) {
      const lbl = new Text({
        text: `${node.name} · ${node.year}`,
        style: {
          fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
          fontSize: 11,
          fontWeight: 'bold',
          fill: 0x5c4f36
        }
      });
      lbl.alpha = 0.72;
      this.routeLayer.addChild(lbl);
      this.nodeLabels.push(lbl);
    }

    // Quiet historical telegraph cipher tape drifting near bottom
    this.tickerText = new Text({
      text: '47216 + 58194 = 95300   ·   KTB · ĐẠI ĐOÀN 308   ·   17:30 / 19:00 · 07.05.1954   ·   ĐOÀN 559   ·   30.04.1975   ·   47216 + 58194 = 95300   ·   KTB · ĐẠI ĐOÀN 308',
      style: {
        fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
        fontSize: 11.5,
        letterSpacing: 1.5,
        fill: 0x736345
      }
    });
    this.tickerText.alpha = 0.24;
    this.root.addChild(this.tickerText);

    // Ultra-clean editorial title overlay (zero bloat, zero filler)
    const screen = document.createElement('div');
    screen.className = 'title-screen';
    screen.innerHTML = `
      <div class="title-topbar">
        <span class="title-archive-code">12.09.1945 — 30.04.1975</span>
        <button id="btn-mute" class="btn-icon" aria-label="Âm thanh">${this.audio.muted ? '🔇' : '🔊'}</button>
      </div>

      <div class="title-hero">
        <div class="title-seal" aria-hidden="true">★</div>
        <div class="title-kicker">CƠ YẾU QUÂN ĐỘI NHÂN DÂN VIỆT NAM</div>
        <h1 class="title-main">MẬT ĐIỆN CƠ YẾU</h1>
        <div class="title-rule"></div>
        <div class="title-actions">
          <button id="btn-start" class="btn-hero-start">BẮT ĐẦU</button>
        </div>
      </div>

      <div class="title-footnote">
        WASD / Mũi tên · Chạm &amp; kéo · Space bật/tắt bắn
      </div>
    `;
    uiRoot.appendChild(screen);

    const startBtn = screen.querySelector('#btn-start') as HTMLButtonElement;
    startBtn.addEventListener('click', () => {
      this.audio.unlock();
      this.audio.playPickup();
      this.state.reset();
      this.onResetToast();
      this.scenes.goTo('INTRO');
    });

    const muteBtn = screen.querySelector('#btn-mute') as HTMLButtonElement;
    muteBtn.addEventListener('click', () => {
      this.audio.unlock();
      muteBtn.textContent = this.audio.toggleMute() ? '🔇' : '🔊';
    });
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  update(dt: number): void {
    this.time += dt;
    const g = this.bgGraphics;
    g.clear();

    const w = this.width;
    const h = this.height;
    const isWide = w >= 860;

    // 1. Warm archival sunlit parchment base
    g.rect(0, 0, w, h).fill({ color: 0xf3ecdc });

    // Soft layered warm paper shading at outer corners
    g.rect(0, 0, w, 90).fill({ color: 0xe3d6b8, alpha: 0.35 });
    g.rect(0, h - 90, w, 90).fill({ color: 0xe3d6b8, alpha: 0.38 });

    // 2. Crisp cartographic coordinate grid
    const grid = 64;
    for (let x = grid; x < w; x += grid) {
      g.moveTo(x, 0).lineTo(x, h).stroke({ color: 0x9e8c68, width: 1, alpha: 0.16 });
    }
    for (let y = grid; y < h; y += grid) {
      g.moveTo(0, y).lineTo(w, y).stroke({ color: 0x9e8c68, width: 1, alpha: 0.16 });
    }

    // 3. Organic topographic contour rings (subtle mountain/highland map lines)
    const topoCenters = [
      { x: w * 0.16, y: h * 0.24, rx: 160, ry: 110 },
      { x: w * 0.84, y: h * 0.3, rx: 190, ry: 130 },
      { x: w * 0.24, y: h * 0.82, rx: 210, ry: 120 },
      { x: w * 0.78, y: h * 0.78, rx: 175, ry: 115 }
    ];
    for (const tc of topoCenters) {
      for (let k = 1; k <= 4; k++) {
        g.ellipse(tc.x, tc.y, tc.rx * (k * 0.32), tc.ry * (k * 0.32)).stroke({
          color: 0x8f7c58,
          width: 1.1,
          alpha: 0.16 - k * 0.02
        });
      }
    }

    // 4. Antique double-line map border with corner hairlines
    const m = Math.max(14, Math.min(26, w * 0.022));
    g.rect(m, m, w - m * 2, h - m * 2).stroke({ color: 0x8a7248, width: 1.5, alpha: 0.45 });
    g.rect(m + 5, m + 5, w - (m + 5) * 2, h - (m + 5) * 2).stroke({ color: 0x8a7248, width: 0.8, alpha: 0.3 });

    // 5. Rotating brass cartographic compass rose (lower-left architectural anchor)
    const compassX = isWide ? w * 0.13 : w * 0.16;
    const compassY = h * 0.76;
    const compassR = isWide ? 82 : 54;
    this.drawCompassRose(g, compassX, compassY, compassR, this.time * 0.05);

    // 6. North-to-South Historical Cipher Route (Việt Bắc -> Điện Biên Phủ -> Trường Sơn -> Chiến khu Đ -> Sài Gòn)
    const pts = ROUTE_NODES.map((n) => ({
      x: isWide ? n.rx * w : (0.18 + (n.rx - 0.62) * 2.5) * w,
      y: isWide ? n.ry * h : (0.14 + n.ry * 0.74) * h,
      node: n
    }));

    if (isWide) {
      // Draw refined route polyline with dashed glow
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color: 0x9c2626, width: 2.2, alpha: 0.32 });
      }

      // Animated encrypted dispatch pulses traveling segment by segment
      const totalSegs = pts.length - 1;
      const cycle = (this.time * 0.32) % totalSegs;
      const segIdx = Math.floor(cycle);
      const frac = cycle - segIdx;
      const a = pts[segIdx];
      const b = pts[segIdx + 1];
      const pulseX = a.x + (b.x - a.x) * frac;
      const pulseY = a.y + (b.y - a.y) * frac;

      g.circle(pulseX, pulseY, 13).fill({ color: 0x1c7c4a, alpha: 0.18 });
      g.circle(pulseX, pulseY, 5).fill({ color: 0x1c7c4a }).stroke({ color: 0xfffaf0, width: 1.5 });

      // Station nodes + radio pulse ripples
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const isLast = i === pts.length - 1;
        const ripple = ((this.time * 32 + i * 24) % 52) + 6;
        const rippleAlpha = Math.max(0, 1 - ripple / 58) * 0.3;
        g.circle(p.x, p.y, ripple).stroke({ color: isLast ? 0x9c2626 : 0x1c7c4a, width: 1.4, alpha: rippleAlpha });

        if (isLast) {
          g.star(p.x, p.y, 5, 9, 4).fill({ color: 0xb52424 }).stroke({ color: 0xe6b83a, width: 1.2 });
        } else {
          g.circle(p.x, p.y, 5).fill({ color: 0xfaf5e8 }).stroke({ color: 0x8c1c1c, width: 2 });
        }

        const lbl = this.nodeLabels[i];
        lbl.visible = true;
        lbl.position.set(p.x + 14, p.y - 7);
      }
    } else {
      // On narrow mobile screens keep background airy and hide side map labels so title shines cleanly
      for (const lbl of this.nodeLabels) {
        lbl.visible = false;
      }
      // Subtle centered radio waves behind mobile title
      const cx = w / 2;
      const cy = h * 0.44;
      for (let i = 0; i < 3; i++) {
        const r = ((this.time * 55 + i * 110) % 330) + 30;
        g.circle(cx, cy, r).stroke({ color: 0x1c7c4a, width: 1.4, alpha: Math.max(0, 1 - r / 360) * 0.25 });
      }
    }

    // 7. Gentle horizontal drift for bottom telegraph cipher tape
    const tapeW = this.tickerText.width || 900;
    const offset = (this.time * 26) % (tapeW * 0.5);
    this.tickerText.position.set(m + 18 - offset, h - m - 46);
  }

  private drawCompassRose(g: Graphics, cx: number, cy: number, r: number, rot: number): void {
    g.circle(cx, cy, r).stroke({ color: 0x8a7248, width: 1.5, alpha: 0.35 });
    g.circle(cx, cy, r * 0.84).stroke({ color: 0x8a7248, width: 0.9, alpha: 0.28 });

    // Degree tick marks
    for (let i = 0; i < 24; i++) {
      const a = rot + (i / 24) * Math.PI * 2;
      const major = i % 6 === 0;
      const r0 = r * (major ? 0.72 : 0.84);
      g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
        .lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
        .stroke({ color: 0x7a6239, width: major ? 1.8 : 1, alpha: 0.35 });
    }

    // 4-point brass needle
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      const tipX = cx + Math.cos(a) * r * 0.72;
      const tipY = cy + Math.sin(a) * r * 0.72;
      const leftX = cx + Math.cos(a + 0.35) * r * 0.18;
      const leftY = cy + Math.sin(a + 0.35) * r * 0.18;
      const rightX = cx + Math.cos(a - 0.35) * r * 0.18;
      const rightY = cy + Math.sin(a - 0.35) * r * 0.18;
      g.poly([cx, cy, leftX, leftY, tipX, tipY])
        .fill({ color: i === 3 ? 0xa82424 : 0x8a7248, alpha: 0.35 });
      g.poly([cx, cy, tipX, tipY, rightX, rightY])
        .fill({ color: 0x6b5632, alpha: 0.22 });
    }
    g.circle(cx, cy, 4).fill({ color: 0xf3ecdc }).stroke({ color: 0x8a7248, width: 1.5, alpha: 0.55 });
  }

  unmount(): void {
    this.nodeLabels = [];
    this.root.destroy({ children: true });
  }
}
