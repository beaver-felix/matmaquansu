export type VehicleId = 'bicycle' | 'pack_bike' | 'jeep' | 'truck' | 'tank';

export interface VehicleConfig {
  id: VehicleId;
  regionIndex: number;
  name: string;
  subtitle: string;
  /** Visual sprite width in px */
  width: number;
  /** Visual sprite height in px */
  height: number;
  /** Collision hitbox width in px (V1..V4 share compact 18x28 core; Tank keeps full 44x64) */
  hitboxWidth: number;
  /** Collision hitbox height in px */
  hitboxHeight: number;
  baseHp: number;
  mapSpeed: number;
  combatSpeed: number;
  fireInterval: number;
  bulletDamage: number;
  weaponDesc: string;
  bodyColor: number;
  accentColor: number;
}

export const VEHICLES: readonly VehicleConfig[] = [
  {
    id: 'bicycle',
    regionIndex: 0,
    name: 'Xe đạp',
    subtitle: 'Chặng I · 1945–1949',
    width: 18,
    height: 28,
    hitboxWidth: 18,
    hitboxHeight: 28,
    baseHp: 2,
    mapSpeed: 235,
    combatSpeed: 255,
    fireInterval: 0.095,
    bulletDamage: 0.8,
    weaponDesc: 'Liên thanh tự ngắm',
    bodyColor: 0x4d6b47,
    accentColor: 0xd9c282
  },
  {
    id: 'pack_bike',
    regionIndex: 1,
    name: 'Xe đạp thồ',
    subtitle: 'Chặng II · 1950–1954',
    width: 24,
    height: 34,
    hitboxWidth: 18,
    hitboxHeight: 28,
    baseHp: 3,
    mapSpeed: 245,
    combatSpeed: 252,
    fireInterval: 0.09,
    bulletDamage: 0.9,
    weaponDesc: 'Liên thanh nhanh',
    bodyColor: 0x627345,
    accentColor: 0xe6c674
  },
  {
    id: 'jeep',
    regionIndex: 2,
    name: 'Xe bốn bánh',
    subtitle: 'Chặng III · 1955–1964',
    width: 30,
    height: 44,
    hitboxWidth: 18,
    hitboxHeight: 28,
    baseHp: 4,
    mapSpeed: 258,
    combatSpeed: 250,
    fireInterval: 0.085,
    bulletDamage: 1.02,
    weaponDesc: 'Liên thanh tầm xa',
    bodyColor: 0x3f6346,
    accentColor: 0xf0d27a
  },
  {
    id: 'truck',
    regionIndex: 3,
    name: 'Xe tải Trường Sơn',
    subtitle: 'Chặng IV · 1965–1972',
    width: 36,
    height: 56,
    hitboxWidth: 18,
    hitboxHeight: 28,
    baseHp: 5,
    mapSpeed: 268,
    combatSpeed: 246,
    fireInterval: 0.08,
    bulletDamage: 1.09,
    weaponDesc: 'Liên thanh xuyên giáp',
    bodyColor: 0x4a5f3e,
    accentColor: 0xffc857
  },
  {
    id: 'tank',
    regionIndex: 4,
    name: 'Xe tăng T-54B',
    subtitle: 'Chặng V · 1975',
    width: 44,
    height: 64,
    hitboxWidth: 44,
    hitboxHeight: 64,
    baseHp: 7,
    mapSpeed: 282,
    combatSpeed: 262,
    fireInterval: 0.075,
    bulletDamage: 1.31,
    weaponDesc: 'Đại bác tự ngắm',
    bodyColor: 0x3b6e42,
    accentColor: 0xffe27a
  }
];

export function getVehicleByRegion(regionIndex: number): VehicleConfig {
  const clamped = Math.max(0, Math.min(VEHICLES.length - 1, regionIndex));
  return VEHICLES[clamped];
}
