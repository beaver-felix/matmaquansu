import { Application, Container } from 'pixi.js';
import { VEHICLES } from './data/vehicles';
import { createEnemySprite, createIndependencePalaceGate, createLorePickupSprite, createVehicleSprite } from './render/SpriteFactory';

async function showArtwork(): Promise<void> {
  const host = document.getElementById('gallery');
  if (!host) return;
  const app = new Application();
  await app.init({ width: 1, height: 1, antialias: true, backgroundAlpha: 0 });
  app.stop();
  host.textContent = '';

  const sections: { title: string; pieces: { name: string; note: string; make: () => Container }[] }[] = [
    {
      title: 'Player vehicles — all five levels',
      pieces: VEHICLES.map((vehicle) => ({
        name: vehicle.name,
        note: `${vehicle.subtitle}${vehicle.id === 'tank' ? ' · Earlier artwork restored' : ''}`,
        make: () => createVehicleSprite(vehicle)
      }))
    },
    {
      title: 'Enemies and bosses',
      pieces: [
        { name: 'Opening blockhouse', note: 'Tutorial boss · Chặng I', make: () => createEnemySprite('phap', 'tutorial') },
        { name: 'French armored outpost', note: 'Chặng I', make: () => createEnemySprite('phap', 'standard') },
        { name: 'B-26 bomber', note: 'Chặng II', make: () => createEnemySprite('phap_plus', 'standard') },
        { name: 'M113 patrol vehicle', note: 'Chặng III · Earlier artwork restored', make: () => createEnemySprite('nguy', 'standard') },
        { name: 'F-4 fighter', note: 'Chặng IV', make: () => createEnemySprite('my', 'standard') },
        { name: 'B-52 bomber', note: 'Chặng IV rematch boss', make: () => createEnemySprite('my', 'rematch') },
        { name: 'Retreating outpost', note: 'Chặng V', make: () => createEnemySprite('nguy_minus', 'standard') }
      ]
    },
    {
      title: 'Collectible and finale',
      pieces: [
        { name: 'Cipher document', note: 'Historical lore pickup', make: () => createLorePickupSprite() },
        { name: 'Independence Palace and gate', note: 'Includes the original finale flag; shown raised here', make: () => {
          const gate = createIndependencePalaceGate();
          gate.flag.visible = true;
          return gate.container;
        } }
      ]
    }
  ];

  try {
    for (const section of sections) {
      const heading = document.createElement('h2');
      heading.textContent = section.title;
      const grid = document.createElement('div');
      grid.className = 'gallery';
      host.append(heading, grid);
      for (const piece of section.pieces) {
        const article = document.createElement('article');
        const title = document.createElement('h3');
        title.textContent = piece.name;
        const note = document.createElement('p');
        note.textContent = piece.note;
        const art = document.createElement('div');
        art.className = 'art';
        const sprite = piece.make();
        const canvas = app.renderer.extract.canvas({ target: sprite, resolution: 3 }) as HTMLCanvasElement;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', piece.name);
        art.append(canvas);
        article.append(title, note, art);
        grid.append(article);
        sprite.destroy({ children: true });
      }
    }
  } finally {
    app.destroy(true);
    host.setAttribute('aria-busy', 'false');
  }
}

void showArtwork().catch(() => {
  const host = document.getElementById('gallery');
  if (host) {
    host.setAttribute('aria-busy', 'false');
    host.textContent = 'Artwork could not load. Please refresh in a browser with WebGL enabled.';
  }
});
