import { Container, Graphics } from 'pixi.js';
import type { BossRole, FactionId } from '../core/GameState';
import type { VehicleConfig } from '../data/vehicles';
import {
  createVehicleSprite as createOriginalVehicle,
  createEnemySprite as createOriginalEnemy,
} from './OriginalArtwork';
import {
  createAircraftAlternative,
  createBicycleAlternative,
  createJeepAlternative,
  createOutpostAlternative,
  createTruckAlternative,
  createPalaceArtwork,
} from './ArtworkAlternatives';

export { createLorePickupSprite } from './OriginalArtwork';
export type { GateParts } from './OriginalArtwork';
export const createIndependencePalaceGate = createPalaceArtwork;

export function createVehicleSprite(vehicle: VehicleConfig, showHullOutline = false): Container {
  if (vehicle.id === 'tank') return createOriginalVehicle(vehicle, showHullOutline);
  const sprite = vehicle.id === 'bicycle' || vehicle.id === 'pack_bike'
    ? createBicycleAlternative(vehicle.id === 'pack_bike')
    : vehicle.id === 'jeep' ? createJeepAlternative() : createTruckAlternative();
  if (showHullOutline) {
    const outline = new Graphics();
    outline.roundRect(-vehicle.hitboxWidth / 2, -vehicle.hitboxHeight / 2,
      vehicle.hitboxWidth, vehicle.hitboxHeight, 3)
      .stroke({ color: 0x1c7c4a, width: 1.4, alpha: 0.65 });
    sprite.addChild(outline);
  }
  return sprite;
}

export function createEnemySprite(faction: FactionId, bossRole: BossRole): Container {
  if (bossRole === 'tutorial') return createOutpostAlternative('fort');
  if (bossRole === 'rematch') return createAircraftAlternative('b52');
  if (faction === 'phap') return createOutpostAlternative('scout');
  if (faction === 'phap_plus') return createAircraftAlternative('b26');
  if (faction === 'my') return createAircraftAlternative('f4');
  if (faction === 'nguy_minus') return createOutpostAlternative('remnant');
  return createOriginalEnemy(faction, bossRole);
}
