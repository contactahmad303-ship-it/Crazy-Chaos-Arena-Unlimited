/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerStats, DifficultyMode } from './types';

const STORAGE_KEY = 'crazy_chaos_arena_save_v1';

const DEFAULT_STATS: PlayerStats = {
  coins: 250, // Initial bonus so player can immediately test an upgrade or save for a character
  highestLevel: 1,
  totalKills: 0,
  selectedCharacterId: 'cyber_pug',
  selectedSkinId: {
    cyber_pug: 'pug_classic',
    dr_bananas: 'banana_classic',
    mecha_rex: 'rex_classic',
    glitch_phantom: 'glitch_classic',
    neon_valkyrie: 'valk_classic',
    turbo_taco: 'taco_classic',
  },
  unlockedCharacters: ['cyber_pug'],
  unlockedSkins: [
    'pug_classic',
    'banana_classic',
    'rex_classic',
    'glitch_classic',
    'valk_classic',
    'taco_classic',
  ],
  upgrades: {},
  difficulty: 'CHAOS',
  audioMuted: false,
  musicMuted: false,
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      selectedSkinId: {
        ...DEFAULT_STATS.selectedSkinId,
        ...(parsed.selectedSkinId || {}),
      },
      unlockedCharacters: Array.from(
        new Set([...DEFAULT_STATS.unlockedCharacters, ...(parsed.unlockedCharacters || [])])
      ),
      unlockedSkins: Array.from(
        new Set([...DEFAULT_STATS.unlockedSkins, ...(parsed.unlockedSkins || [])])
      ),
    };
  } catch (err) {
    console.error('Failed to parse saved game stats:', err);
    return { ...DEFAULT_STATS };
  }
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save game stats:', err);
  }
}
