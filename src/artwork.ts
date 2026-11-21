import { Application, Container } from 'pixi.js';
import { createAircraftAlternative, createBicycleAlternative, createOutpostAlternative, createJeepAlternative, createTruckAlternative, createPalaceAlternative } from './render/ArtworkAlternatives';
import { VEHICLES } from './data/vehicles';
import { createEnemySprite, createIndependencePalaceGate, createLorePickupSprite, createVehicleSprite } from './render/SpriteFactory';

async function showArtwork(): Promise<void> {
  const host = document.getElementById('gallery');
  if (!host) return;
  const app = new Application();
  await app.init({ width: 1, height: 1, antialias: true, backgroundAlpha: 0 });
  app.stop();
  host.textContent = '';

  const sections: { title: string; pieces: { name: string; note: string; make: () => Container; alternative?: () => Container; critique?: string; wide?: boolean }[] }[] = [
    {
      title: 'Player vehicles — all five levels',
      pieces: VEHICLES.map((vehicle) => ({
        name: vehicle.name,
        note: `${vehicle.subtitle}${vehicle.id === 'tank' ? ' · Earlier artwork restored' : ''}`,
        make: () => createVehicleSprite(vehicle),
        alternative: vehicle.id === 'bicycle' || vehicle.id === 'pack_bike'
          ? () => createBicycleAlternative(vehicle.id === 'pack_bike')
          : vehicle.id === 'jeep' ? createJeepAlternative
          : vehicle.id === 'truck' ? createTruckAlternative : undefined,
        critique: vehicle.id === 'bicycle' || vehicle.id === 'pack_bike'
          ? 'Weak silhouette: the current rider reads as a button, not a cyclist. Proposed: exposed wheels, handlebars, rider posture and a red flag with a yellow star.'
          : vehicle.id === 'jeep' ? 'Proposed: an open cabin, seats, spare wheel and a defined hood. Vietnam’s red flag and yellow star stay visible.'
          : vehicle.id === 'truck' ? 'Proposed: a shaped cab, split windshield and curved canvas cargo cover, with the Vietnamese flag retained.' : undefined
      }))
    },
    {
      title: 'Enemies and bosses',
      pieces: [
        { name: 'Opening blockhouse', note: 'Tutorial boss · Chặng I', make: () => createEnemySprite('phap', 'tutorial'), alternative: () => createOutpostAlternative('fort'), critique: 'Weakest enemy: oversized target circles dominate a plain box. Proposed: roof planes, recessed firing ports and sandbag protection.' },
        { name: 'French armored outpost', note: 'Chặng I', make: () => createEnemySprite('phap', 'standard'), alternative: () => createOutpostAlternative('scout'), critique: 'Weakest vehicle: a circle on a rectangle, without a readable chassis. Proposed: wheels, sloped armor and a distinct turret.' },
        { name: 'B-26 bomber', note: 'Chặng II', make: () => createEnemySprite('phap_plus', 'standard'), alternative: () => createAircraftAlternative('b26'), critique: 'Recognizable but flat. Proposed: rounded fuselage, separated engines, propellers and restrained panel shading.' },
        { name: 'M113 patrol vehicle', note: 'Chặng III · Earlier artwork restored', make: () => createEnemySprite('nguy', 'standard') },
        { name: 'F-4 fighter', note: 'Chặng IV', make: () => createEnemySprite('my', 'standard'), alternative: () => createAircraftAlternative('f4'), critique: 'Recognizable but heavy outlines flatten the wings. Proposed: swept-wing highlights, recessed intakes and a continuous canopy.' },
        { name: 'B-52 bomber', note: 'Chặng IV rematch boss', make: () => createEnemySprite('my', 'rematch'), alternative: () => createAircraftAlternative('b52'), critique: 'The red center marker and bright engine dots distract from the plane. Proposed: long fuselage, paired engine pods and quieter markings.' },
        { name: 'Retreating outpost', note: 'Chặng V', make: () => createEnemySprite('nguy_minus', 'standard'), alternative: () => createOutpostAlternative('remnant'), critique: 'Too abstract: mostly a box and orange dot. Proposed: a damaged concrete position with a recessed firing slit.' }
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
        }, alternative: createPalaceAlternative, wide: true, critique: 'Proposed: layered balconies, shaded glazing and colonnades, entry steps, reflecting pool, landscaped grounds and a detailed gate. The original finale flag is preserved.' }
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
        article.append(title, note);
        const pair = document.createElement('div');
        pair.className = piece.alternative ? 'pair' : '';
        if (piece.alternative) article.classList.add('has-alternative');
        if (piece.wide) article.classList.add('wide-art');
        const versions = [{ label: 'Current — in game', make: piece.make }];
        if (piece.alternative) versions.push({ label: 'Proposed — preview only', make: piece.alternative });
        for (const version of versions) {
          const panel = document.createElement('div');
          const label = document.createElement('h4');
          label.textContent = version.label;
          const art = document.createElement('div');
          art.className = 'art';
          const sprite = version.make();
          try {
            const canvas = app.renderer.extract.canvas({ target: sprite, resolution: 3 }) as HTMLCanvasElement;
            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', `${piece.name}: ${version.label}`);
            art.append(canvas);
          } finally {
            sprite.destroy({ children: true });
          }
          panel.append(label, art);
          pair.append(panel);
        }
        article.append(pair);
        if (piece.critique) {
          const critique = document.createElement('p');
          critique.className = 'critique';
          critique.textContent = piece.critique;
          article.append(critique);
        }
        grid.append(article);
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
