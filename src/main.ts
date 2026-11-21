import './styles.css';
import { Application, Ticker } from 'pixi.js';
import { AudioEngine } from './core/AudioEngine';
import { GameState } from './core/GameState';
import { InputManager } from './core/InputManager';
import { SceneManager } from './core/SceneManager';
import { CREDITS_AND_AFTER_SLIDES, END_GAME_SLIDES, INTRO_SLIDES } from './data/loreTimeline';
import { CombatScene } from './scenes/CombatScene';
import { CutsceneScene } from './scenes/CutsceneScene';
import { OverworldScene } from './scenes/OverworldScene';
import { RegionExitOverlay } from './scenes/RegionExitOverlay';
import { TitleScene } from './scenes/TitleScene';
import { DeveloperSettingsUI } from './systems/DeveloperSettingsUI';
import { LoreToastUI } from './systems/LoreToastUI';

async function bootstrap(): Promise<void> {
  const appEl = document.getElementById('app');
  const canvasRoot = document.getElementById('canvas-root');
  const uiRoot = document.getElementById('ui-root');
  if (!appEl || !canvasRoot || !uiRoot) {
    throw new Error('Missing root mount containers');
  }

  const app = new Application();
  await app.init({
    resizeTo: window,
    backgroundColor: 0xeae3cf,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true
  });
  canvasRoot.appendChild(app.canvas);

  const state = new GameState();
  const audio = new AudioEngine();
  const loreToast = new LoreToastUI(appEl);
  const input = new InputManager(canvasRoot, () => {
    state.autoFire = !state.autoFire;
  });

  // Unlock Web Audio revolutionary march BGM cleanly on first click/touch/key press
  const unlockAudioOnce = (): void => {
    audio.unlock();
  };
  window.addEventListener('pointerdown', unlockAudioOnce, { once: true });
  window.addEventListener('keydown', unlockAudioOnce, { once: true });

  const scenes = new SceneManager(app, uiRoot, (sceneId) => {
    if (sceneId === 'TITLE' || sceneId === 'INTRO') {
      audio.setMusicMode('title');
    } else if (sceneId === 'COMBAT') {
      audio.setMusicMode('combat');
    } else if (sceneId === 'END_GAME' || sceneId === 'AFTER_CREDIT') {
      audio.setMusicMode('victory');
    } else {
      audio.setMusicMode('overworld');
    }
  });

  scenes.register('TITLE', () => new TitleScene(state, scenes, audio, () => loreToast.clear()));
  scenes.register(
    'INTRO',
    () =>
      new CutsceneScene(
        'INTRO',
        'MỞ ĐẦU',
        INTRO_SLIDES,
        'OVERWORLD',
        'VÀO CHẶNG I →',
        state,
        scenes,
        audio
      )
  );
  scenes.register('OVERWORLD', () => new OverworldScene(state, input, audio, loreToast, scenes));
  scenes.register('COMBAT', () => new CombatScene(state, input, audio, loreToast, scenes));
  scenes.register('REGION_EXIT', () => new RegionExitOverlay(state, scenes, audio));
  scenes.register(
    'END_GAME',
    () =>
      new CutsceneScene(
        'END_GAME',
        '30.04.1975',
        END_GAME_SLIDES,
        'AFTER_CREDIT',
        'TIẾP TỤC →',
        state,
        scenes,
        audio
      )
  );
  scenes.register(
    'AFTER_CREDIT',
    () =>
      new CutsceneScene(
        'AFTER_CREDIT',
        'SAU 1975',
        CREDITS_AND_AFTER_SLIDES,
        'TITLE',
        'VỀ MÀN HÌNH CHÍNH ↺',
        state,
        scenes,
        audio
      )
  );

  const developerSettings = new DeveloperSettingsUI(appEl, state, input, scenes, loreToast);
  scenes.goTo('TITLE');

  window.addEventListener('resize', () => {
    scenes.resize(app.screen.width, app.screen.height);
  });

  app.ticker.add((ticker: Ticker) => {
    if (developerSettings.isOpen) return;
    const dt = Math.min(ticker.deltaMS / 1000, 0.05);
    scenes.update(dt);
    loreToast.update(dt);
  });
}

void bootstrap();
