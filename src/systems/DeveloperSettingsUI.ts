import { GameState } from '../core/GameState';
import { InputManager } from '../core/InputManager';
import { SceneManager } from '../core/SceneManager';
import { REGIONS } from '../data/regions';
import { LoreToastUI } from './LoreToastUI';

export class DeveloperSettingsUI {
  private dialog = document.createElement('dialog');
  private button = document.createElement('button');

  constructor(private host: HTMLElement, private state: GameState, input: InputManager, scenes: SceneManager, lore: LoreToastUI) {
    const button = this.button;
    button.className = 'btn btn-small developer-button';
    button.textContent = 'DEV · CÀI ĐẶT';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'developer-settings');
    button.addEventListener('keydown', (event) => event.stopPropagation());
    button.addEventListener('keyup', (event) => event.stopPropagation());

    this.dialog.id = 'developer-settings';
    this.dialog.className = 'developer-settings';
    this.dialog.setAttribute('aria-labelledby', 'developer-title');
    this.dialog.innerHTML = `
      <h2 id="developer-title">Cài đặt nhà phát triển</h2>
      <p>Trò chơi tạm dừng khi mở bảng này.</p>
      <label class="developer-toggle"><input type="checkbox" id="developer-invincible"> Bất tử — không nhận sát thương</label>
      <label for="developer-level">Chuyển đến chặng</label>
      <select id="developer-level">
        ${REGIONS.map((region) => `<option value="${region.index}">${region.code} · ${region.name} (${region.era})</option>`).join('')}
      </select>
      <p id="developer-reset-note">Bắt đầu lượt mới tại chặng đã chọn, với xe và kỹ năng tương ứng. Xóa tiến trình hiện tại; giữ lựa chọn bất tử.</p>
      <div class="developer-actions">
        <button class="btn btn-primary" id="developer-jump" aria-describedby="developer-reset-note">BẮT ĐẦU CHẶNG</button>
        <button class="btn" id="developer-close">ĐÓNG</button>
      </div>
    `;
    host.append(button, this.dialog);
    const invincible = this.dialog.querySelector('#developer-invincible') as HTMLInputElement;
    const level = this.dialog.querySelector('#developer-level') as HTMLSelectElement;
    button.addEventListener('click', () => {
      invincible.checked = state.invincible;
      level.value = String(state.regionIndex);
      input.setEnabled(false);
      this.dialog.showModal();
    });
    invincible.addEventListener('change', () => {
      state.invincible = invincible.checked;
    });
    this.dialog.querySelector('#developer-jump')!.addEventListener('click', () => {
      state.startDeveloperLevel(Number(level.value));
      lore.clear();
      scenes.goTo('OVERWORLD');
      this.dialog.close();
    });
    this.dialog.querySelector('#developer-close')!.addEventListener('click', () => this.dialog.close());
    this.dialog.addEventListener('keydown', (event) => event.stopPropagation());
    this.dialog.addEventListener('keyup', (event) => event.stopPropagation());
    this.dialog.addEventListener('close', () => {
      input.setEnabled(true);
      const canvas = host.querySelector('canvas');
      if (canvas) {
        canvas.tabIndex = -1;
        canvas.focus({ preventScroll: true });
      }
    });
  }

  sync(): void {
    const target = this.host.querySelector('.hud-controls, .title-topbar') ?? this.host;
    if (this.button.parentElement !== target) target.appendChild(this.button);
    this.button.classList.toggle('developer-floating', target === this.host);
    this.button.classList.toggle('developer-active', this.state.invincible);
    const label = this.state.invincible ? 'DEV · BẤT TỬ: BẬT' : 'DEV · CÀI ĐẶT';
    if (this.button.textContent !== label) this.button.textContent = label;
  }

  get isOpen(): boolean {
    return this.dialog.open;
  }
}
