import { Application, Container } from 'pixi.js';

export type SceneId =
  | 'TITLE'
  | 'INTRO'
  | 'OVERWORLD'
  | 'COMBAT'
  | 'REGION_EXIT'
  | 'END_GAME'
  | 'AFTER_CREDIT';

export interface GameScene {
  readonly id: SceneId;
  mount(stage: Container, uiRoot: HTMLElement): void;
  update(dt: number): void;
  resize?(width: number, height: number): void;
  unmount(): void;
}

export class SceneManager {
  private app: Application;
  private uiRoot: HTMLElement;
  private factories = new Map<SceneId, () => GameScene>();
  private current: GameScene | null = null;
  private sceneLayer: Container;
  private onSceneChange?: (id: SceneId) => void;

  constructor(app: Application, uiRoot: HTMLElement, onSceneChange?: (id: SceneId) => void) {
    this.app = app;
    this.uiRoot = uiRoot;
    this.onSceneChange = onSceneChange;
    this.sceneLayer = new Container();
    this.app.stage.addChild(this.sceneLayer);
  }

  register(id: SceneId, factory: () => GameScene): void {
    this.factories.set(id, factory);
  }

  goTo(id: SceneId): void {
    if (this.current) {
      this.current.unmount();
      this.sceneLayer.removeChildren();
      this.uiRoot.innerHTML = '';
      this.current = null;
    }

    const factory = this.factories.get(id);
    if (!factory) {
      throw new Error(`Scene not registered: ${id}`);
    }

    const next = factory();
    this.current = next;
    this.onSceneChange?.(id);
    next.mount(this.sceneLayer, this.uiRoot);
    next.resize?.(this.app.screen.width, this.app.screen.height);
  }

  update(dt: number): void {
    this.current?.update(dt);
  }

  resize(width: number, height: number): void {
    this.current?.resize?.(width, height);
  }
}
