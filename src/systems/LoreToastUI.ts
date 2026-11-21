import { AudioEngine } from '../core/AudioEngine';
import { GameState } from '../core/GameState';
import { LoreItem, LORE_TIMELINE } from '../data/loreTimeline';

interface QueuedDialog {
  speaker: string;
  date: string;
  title: string;
  body: string;
  tag: string;
  icon: string;
  roleBadge: string;
  durationSec: number;
}

/**
 * Visual Novel-style Historical Dialogue Box anchored cleanly at the bottom edge.
 * Uses adaptive reading duration so rich historical texts are always comfortable to read
 * while pointer-events: none guarantees zero interruption to gameplay movement.
 */
export class LoreToastUI {
  private host: HTMLDivElement;
  private queue: QueuedDialog[] = [];
  private active: QueuedDialog | null = null;
  private elapsed = 0;
  private fullText = '';
  private typedChars = 0;
  private bodyEl: HTMLDivElement | null = null;
  private timerFillEl: HTMLDivElement | null = null;

  constructor(appRoot: HTMLElement) {
    this.host = document.createElement('div');
    this.host.className = 'vn-dialog-host';
    appRoot.appendChild(this.host);
  }

  collectNextTimelineItem(state: GameState, audio: AudioEngine): LoreItem | null {
    if (state.loreCursor >= LORE_TIMELINE.length) {
      return null;
    }
    const item = LORE_TIMELINE[state.loreCursor];
    state.loreCursor += 1;
    state.stats.loreCollected += 1;
    audio.playPickup();

    const adaptiveSec = Math.max(6.8, Math.min(10.0, 3.8 + item.body.length * 0.032));
    this.enqueue({
      speaker: `${item.title} (${item.speaker})`,
      date: item.date,
      title: item.title,
      body: item.body,
      tag: `${item.index}/${LORE_TIMELINE.length}`,
      icon: '📜',
      roleBadge: 'CƠ YẾU',
      durationSec: adaptiveSec
    });
    return item;
  }

  enqueueCustom(
    date: string,
    title: string,
    body: string,
    tag = 'MẬT ĐIỆN',
    durationSec?: number
  ): void {
    const adaptiveSec = durationSec ?? Math.max(6.2, Math.min(10.5, 3.6 + body.length * 0.03));
    this.enqueue({
      speaker: title,
      date,
      title,
      body,
      tag,
      icon: '📻',
      roleBadge: 'CHỈ HUY',
      durationSec: adaptiveSec
    });
  }

  private enqueue(entry: QueuedDialog): void {
    this.queue.push(entry);
    if (!this.active) {
      this.showNext();
    }
  }

  private showNext(): void {
    const next = this.queue.shift() ?? null;
    this.active = next;
    this.elapsed = 0;
    this.typedChars = 0;
    this.host.innerHTML = '';
    this.bodyEl = null;
    this.timerFillEl = null;

    if (!next) return;

    this.fullText = next.body;

    const box = document.createElement('div');
    box.className = 'vn-dialog';
    box.innerHTML = `
      <div class="vn-portrait">
        <div class="vn-portrait-icon">${next.icon}</div>
        <div class="vn-portrait-label">${next.roleBadge}</div>
      </div>
      <div class="vn-content">
        <div class="vn-header">
          <div class="vn-speaker">${next.speaker}</div>
          <div class="vn-meta">${next.date} · ${next.tag}</div>
        </div>
        <div class="vn-body"></div>
        <div class="vn-timer"><div class="vn-timer-fill"></div></div>
      </div>
    `;
    this.host.appendChild(box);
    this.bodyEl = box.querySelector('.vn-body');
    this.timerFillEl = box.querySelector('.vn-timer-fill');
    if (this.bodyEl) {
      // Reserve the full message before typewriting so the combat arena stays stable.
      this.bodyEl.textContent = this.fullText;
      this.bodyEl.style.minHeight = `${this.bodyEl.offsetHeight}px`;
      this.bodyEl.textContent = '';
    }
  }

  getReservedBottom(): number {
    return this.active ? this.host.offsetHeight + 18 : 16;
  }

  update(dt: number): void {
    if (!this.active) return;
    this.elapsed += dt;

    if (this.typedChars < this.fullText.length && this.bodyEl) {
      this.typedChars = Math.min(this.fullText.length, this.typedChars + dt * 115);
      this.bodyEl.textContent = this.fullText.slice(0, Math.floor(this.typedChars));
    }

    const remain = Math.max(0, 1 - this.elapsed / this.active.durationSec);
    if (this.timerFillEl) {
      this.timerFillEl.style.width = `${(remain * 100).toFixed(1)}%`;
    }
    if (this.elapsed >= this.active.durationSec) {
      this.showNext();
    }
  }

  clear(): void {
    this.queue = [];
    this.active = null;
    this.elapsed = 0;
    this.typedChars = 0;
    this.fullText = '';
    this.host.innerHTML = '';
    this.bodyEl = null;
    this.timerFillEl = null;
  }
}
