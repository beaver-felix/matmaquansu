import { CRYPTO_SKILLS, SkillId } from '../data/skills';
import { getVehicleByRegion, VehicleConfig, VEHICLES } from '../data/vehicles';

export type FactionId = 'phap' | 'phap_plus' | 'nguy' | 'my' | 'nguy_minus';
export type BossRole = 'standard' | 'tutorial' | 'rematch';

export const MAX_BOSSES_PER_REGION = 2;

export interface ActiveAmbushContext {
  id: string;
  regionIndex: number;
  faction: FactionId;
  name: string;
  bossRole: BossRole;
}

export interface RunStats {
  ambushesEvaded: number;
  combatsWon: number;
  loreCollected: number;
  startTimeMs: number;
}

export class GameState {
  regionIndex = 0;
  unlockedSkills: SkillId[] = [];
  maxSkillsActive = false;
  loreCursor = 0;

  tutorialDone = false;
  tutorialWon = false;
  rematchWon = false;
  /** Revive armor charges earned by collecting lore on the Overworld map */
  reviveShields = 0;

  clearedAmbushes = new Set<string>();
  collectedMapPickups = new Set<string>();
  regionEncounters = new Map<number, number>();
  regionCapNotified = new Set<number>();
  regionBannerShown = new Set<number>();
  savedMapPos: { x: number; y: number } | null = null;
  activeAmbush: ActiveAmbushContext | null = null;

  /** Active when Mã Dịch Song Song is pulsing before combat */
  pipelineSlowActive = false;

  invincible = false;
  autoFire = true;

  stats: RunStats = {
    ambushesEvaded: 0,
    combatsWon: 0,
    loreCollected: 0,
    startTimeMs: Date.now()
  };

  reset(): void {
    this.regionIndex = 0;
    this.unlockedSkills = [];
    this.maxSkillsActive = false;
    this.loreCursor = 0;
    this.tutorialDone = false;
    this.tutorialWon = false;
    this.rematchWon = false;
    this.reviveShields = 0;
    this.clearedAmbushes.clear();
    this.collectedMapPickups.clear();
    this.regionEncounters.clear();
    this.regionCapNotified.clear();
    this.regionBannerShown.clear();
    this.savedMapPos = null;
    this.activeAmbush = null;
    this.pipelineSlowActive = false;
    this.invincible = false;
    this.autoFire = true;
    this.stats = {
      ambushesEvaded: 0,
      combatsWon: 0,
      loreCollected: 0,
      startTimeMs: Date.now()
    };
  }

  startDeveloperLevel(regionIndex: number): void {
    if (!Number.isInteger(regionIndex) || regionIndex < 0 || regionIndex >= VEHICLES.length) return;
    const invincible = this.invincible;
    this.reset();
    this.invincible = invincible;
    this.regionIndex = regionIndex;
    this.tutorialDone = regionIndex > 0;
    for (const skill of CRYPTO_SKILLS.slice(0, regionIndex)) this.unlockSkill(skill.id);
    if (regionIndex === VEHICLES.length - 1) this.activateFullNetworkMax();
  }

  get currentVehicle(): VehicleConfig {
    return getVehicleByRegion(this.regionIndex);
  }

  getMaxHp(): number {
    return this.currentVehicle.baseHp + (this.tutorialWon ? 1 : 0);
  }

  hasSkill(id: SkillId): boolean {
    return this.unlockedSkills.includes(id);
  }

  unlockSkill(id: SkillId): void {
    if (!this.unlockedSkills.includes(id)) {
      this.unlockedSkills.push(id);
    }
  }

  getRegionEncounters(regionIdx: number): number {
    return this.regionEncounters.get(regionIdx) ?? 0;
  }

  recordRegionEncounter(regionIdx: number): number {
    const next = this.getRegionEncounters(regionIdx) + 1;
    this.regionEncounters.set(regionIdx, next);
    return next;
  }

  addReviveShield(): number {
    this.reviveShields += 1;
    return this.reviveShields;
  }

  consumeReviveShield(): boolean {
    if (this.reviveShields <= 0) return false;
    this.reviveShields -= 1;
    return true;
  }

  /** Entering Region 5 (Saigon 1975): full crypto network unified at maximum strength */
  activateFullNetworkMax(): void {
    for (const s of CRYPTO_SKILLS) {
      if (!this.unlockedSkills.includes(s.id)) {
        this.unlockedSkills.push(s.id);
      }
    }
    this.maxSkillsActive = true;
  }

  resetCurrentRegionProgress(regionAmbushIds: string[]): void {
    this.savedMapPos = null;
    this.activeAmbush = null;
    this.regionEncounters.set(this.regionIndex, this.regionIndex === 0 && this.tutorialDone ? 1 : 0);
    this.regionCapNotified.delete(this.regionIndex);
    this.regionBannerShown.delete(this.regionIndex);
    for (const id of regionAmbushIds) {
      if (this.tutorialDone && id === 'v1_tutorial') {
        continue;
      }
      this.clearedAmbushes.delete(id);
    }
  }
}
