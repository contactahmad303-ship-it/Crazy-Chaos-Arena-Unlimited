/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PERK_CHOICE'
  | 'LEVEL_VICTORY'
  | 'GAME_OVER'
  | 'PAUSED'
  | 'CHARACTER_LOCKER'
  | 'ARMORY_SHOP';

export type DifficultyMode = 'CASUAL' | 'CHAOS' | 'INSANE' | 'NIGHTMARE';

export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  unlocked: boolean;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    trail: string;
    glow: string;
  };
  styleType: 'classic' | 'gold' | 'void' | 'rainbow' | 'cyberpunk' | 'magma';
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  unlocked: boolean;
  baseHp: number;
  baseSpeed: number;
  baseDamage: number;
  fireRate: number; // shots per sec
  bulletSpeed: number;
  projectileType: 'laser' | 'banana' | 'plasma' | 'glitch' | 'star' | 'rocket';
  passiveDesc: string;
  ultimateName: string;
  ultimateDesc: string;
  ultimateCooldown: number; // in seconds
  icon: string;
  skins: Skin[];
}

export interface PermanentUpgrade {
  id: string;
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectPerLevel: number;
  icon: string;
  statKey: 'damage' | 'maxHp' | 'speed' | 'fireRate' | 'magnet' | 'critChance' | 'shield';
}

export interface InGamePerk {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerStats {
  coins: number;
  highestLevel: number;
  totalKills: number;
  selectedCharacterId: string;
  selectedSkinId: Record<string, string>; // characterId -> skinId
  unlockedCharacters: string[];
  unlockedSkins: string[];
  upgrades: Record<string, number>;
  difficulty: DifficultyMode;
  audioMuted: boolean;
  musicMuted: boolean;
}

export interface ActiveLevelConfig {
  levelNumber: number;
  objectiveType: 'SURVIVE_KILLS' | 'BOSS_HUNT' | 'COLLECT_CORES' | 'CHAOS_RUSH';
  targetKills: number;
  targetCores: number;
  biome: 'NEON_GRID' | 'MAGMA_CORE' | 'TOXIC_LAB' | 'VOID_RIFT' | 'GOLD_VAULT';
  difficulty: DifficultyMode;
  bossType?: 'TITAN_SKULL' | 'CYBER_WORM' | 'VOID_COLOSSUS' | 'OMEGA_WARLORD';
  bossHp?: number;
  coinReward: number;
}

export interface HudStats {
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpToNext: number;
  coinsCollectedThisRun: number;
  kills: number;
  targetKills: number;
  objectiveType: string;
  coresCollected: number;
  targetCores: number;
  bossHp?: number;
  bossMaxHp?: number;
  ultimateCharge: number;
  ultimateMax: number;
  shieldActive: boolean;
}

