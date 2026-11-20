export interface MoveSample {
  /** Normalized keyboard direction (-1..1) */
  axisX: number;
  axisY: number;
  /** Direct pixel delta from mobile touch drag since last frame */
  dragDx: number;
  dragDy: number;
  /** True while actively dragging via pointer/touch */
  isTouchDragging: boolean;
}

export class InputManager {
  private keys = new Set<string>();
  private pointerId: number | null = null;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private accumDragDx = 0;
  private accumDragDy = 0;
  private onToggleAutoFire?: () => void;
  private targetEl: HTMLElement;

  constructor(targetEl: HTMLElement, onToggleAutoFire?: () => void) {
    this.targetEl = targetEl;
    this.onToggleAutoFire = onToggleAutoFire;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);

    this.targetEl.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const code = e.code;
    if (
      code === 'KeyW' ||
      code === 'KeyA' ||
      code === 'KeyS' ||
      code === 'KeyD' ||
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight'
    ) {
      this.keys.add(code);
    } else if (code === 'Space' && !e.repeat) {
      this.onToggleAutoFire?.();
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  private handleBlur = (): void => {
    this.keys.clear();
    this.pointerId = null;
    this.accumDragDx = 0;
    this.accumDragDy = 0;
  };

  private handlePointerDown = (e: PointerEvent): void => {
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (this.pointerId !== e.pointerId) return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.accumDragDx += dx;
    this.accumDragDy += dy;
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (this.pointerId !== e.pointerId) return;
    this.pointerId = null;
  };

  sample(): MoveSample {
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y += 1;

    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.SQRT2;
      x *= inv;
      y *= inv;
    }

    const dragDx = this.accumDragDx;
    const dragDy = this.accumDragDy;
    this.accumDragDx = 0;
    this.accumDragDy = 0;

    return {
      axisX: x,
      axisY: y,
      dragDx,
      dragDy,
      isTouchDragging: this.pointerId !== null
    };
  }

  clearDrag(): void {
    this.accumDragDx = 0;
    this.accumDragDy = 0;
    this.pointerId = null;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.targetEl.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
  }
}
