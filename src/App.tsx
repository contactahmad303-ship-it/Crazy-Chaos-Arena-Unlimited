/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { sounds } from './game/audio';
import { loadPlayerStats, savePlayerStats } from './game/storage';
import {
  ActiveLevelConfig,
  CharacterDef,
  DifficultyMode,
  GameState,
  HudStats,
  InGamePerk,
  PermanentUpgrade,
  PlayerStats,
  Skin,
} from './game/types';
import { CRAZY_CHARACTERS, DIFFICULTY_PRESETS } from './game/data';

import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { LevelVictoryModal } from './components/LevelVictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { CharacterLocker } from './components/CharacterLocker';
import { ArmoryShop } from './components/ArmoryShop';
import { PerkSelectionModal } from './components/PerkSelectionModal';
import { PauseModal } from './components/PauseModal';
import { crazyGames } from './game/crazygames';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistent Player Stats State
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());

  // Game State Machine
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(() => stats.highestLevel);

  // In-Run Telemetry for HUD (updated via engine callback)
  const [hudStats, setHudStats] = useState<HudStats>({
    hp: 100,
    maxHp: 100,
    level: 1,
    xp: 0,
    xpToNext: 50,
    coinsCollectedThisRun: 0,
    kills: 0,
    targetKills: 30,
    objectiveType: 'SURVIVE_KILLS',
    coresCollected: 0,
    targetCores: 5,
    bossHp: undefined,
    bossMaxHp: undefined,
    ultimateCharge: 0,
    ultimateMax: 18,
    shieldActive: false,
  });

  // Modals Data
  const [activePerks, setActivePerks] = useState<InGamePerk[]>([]);
  const [levelClearBonus, setLevelClearBonus] = useState(0);
  const [lastKills, setLastKills] = useState(0);
  const [lastCoinsEarned, setLastCoinsEarned] = useState(0);
  const [autoFire, setAutoFire] = useState(true);

  // Save changes to storage whenever stats change
  useEffect(() => {
    savePlayerStats(stats);
  }, [stats]);

  // Sync audio mute settings
  useEffect(() => {
    sounds.setSfxMuted(stats.audioMuted);
    sounds.setMusicMuted(stats.musicMuted);
  }, [stats.audioMuted, stats.musicMuted]);

  // Generate Unlimited Level Configuration
  const generateLevelConfig = useCallback(
    (levelNum: number): ActiveLevelConfig => {
      const diff = DIFFICULTY_PRESETS[stats.difficulty];

      let objectiveType: ActiveLevelConfig['objectiveType'] = 'SURVIVE_KILLS';
      let targetKills = 25 + levelNum * 8;
      let targetCores = 0;
      let bossType: ActiveLevelConfig['bossType'] = undefined;

      // Every 5th level is a Boss Hunt
      if (levelNum % 5 === 0) {
        objectiveType = 'BOSS_HUNT';
        targetKills = 1;
        const bossPool: ActiveLevelConfig['bossType'][] = [
          'TITAN_SKULL',
          'CYBER_WORM',
          'VOID_COLOSSUS',
          'OMEGA_WARLORD',
        ];
        bossType = bossPool[(Math.floor(levelNum / 5) - 1) % bossPool.length];
      } else if (levelNum % 3 === 0) {
        objectiveType = 'COLLECT_CORES';
        targetCores = Math.min(10, 4 + Math.floor(levelNum / 3));
      } else if (levelNum % 4 === 0) {
        objectiveType = 'CHAOS_RUSH';
        targetKills = 35 + levelNum * 10;
      }

      const biomes: ActiveLevelConfig['biome'][] = [
        'NEON_GRID',
        'MAGMA_CORE',
        'TOXIC_LAB',
        'VOID_RIFT',
        'GOLD_VAULT',
      ];
      const biome = biomes[(levelNum - 1) % biomes.length];

      const coinReward = Math.round((150 + levelNum * 80) * diff.coinMultiplier);

      return {
        levelNumber: levelNum,
        objectiveType,
        targetKills,
        targetCores,
        biome,
        difficulty: stats.difficulty,
        bossType,
        coinReward,
      };
    },
    [stats.difficulty]
  );

  // Initialize Canvas & Engine & CrazyGames SDK
  useEffect(() => {
    crazyGames.init();
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onLevelComplete: (clearBonus, kills, level) => {
        crazyGames.gameplayStop();
        crazyGames.happyTime();
        setLevelClearBonus(clearBonus);
        setLastKills(kills);
        setGameState('LEVEL_VICTORY');

        setStats((prev) => ({
          ...prev,
          coins: prev.coins + clearBonus,
          totalKills: prev.totalKills + kills,
          highestLevel: Math.max(prev.highestLevel, level + 1),
        }));
      },
      onGameOver: (coinsEarned, kills, _level) => {
        crazyGames.gameplayStop();
        setLastCoinsEarned(coinsEarned);
        setLastKills(kills);
        setGameState('GAME_OVER');

        setStats((prev) => ({
          ...prev,
          totalKills: prev.totalKills + kills,
        }));
      },
      onTriggerPerkChoice: (perks) => {
        setActivePerks(perks);
        setGameState('PERK_CHOICE');
        if (engineRef.current) {
          engineRef.current.setPaused(true);
        }
      },
      onStatsUpdate: (updated) => {
        setHudStats(updated);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  // Keyboard shortcut listener for Title start and Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'TITLE_MENU') {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
          handleStartGame();
        }
      } else if (gameState === 'PLAYING') {
        if (e.key === 'Escape') {
          handlePause();
        }
      } else if (gameState === 'PAUSED') {
        if (e.key === 'Escape') {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentLevelNumber, stats]);

  // --- ACTIONS ---

  const handleStartGame = (lvlNum = currentLevelNumber) => {
    sounds.uiClick();
    crazyGames.gameplayStart();
    if (!stats.musicMuted) {
      sounds.startMusic();
    }
    const config = generateLevelConfig(lvlNum);
    setCurrentLevelNumber(lvlNum);
    setGameState('PLAYING');

    if (engineRef.current) {
      engineRef.current.autoFire = autoFire;
      engineRef.current.startLevel(config, stats);
    }
  };

  const handlePause = () => {
    if (gameState !== 'PLAYING') return;
    crazyGames.gameplayStop();
    setGameState('PAUSED');
    if (engineRef.current) {
      engineRef.current.setPaused(true);
    }
  };

  const handleResume = () => {
    crazyGames.gameplayStart();
    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.setPaused(false);
    }
  };

  const handleNextLevel = () => {
    const nextLvl = currentLevelNumber + 1;
    setCurrentLevelNumber(nextLvl);
    handleStartGame(nextLvl);
  };

  const handleRetry = () => {
    handleStartGame(currentLevelNumber);
  };

  const handleReturnToTitle = () => {
    crazyGames.gameplayStop();
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setGameState('TITLE_MENU');
  };

  const handleWatchAdForCoins = () => {
    sounds.uiClick();
    crazyGames.requestRewardedAd(() => {
      setStats((prev) => ({
        ...prev,
        coins: prev.coins + 500,
      }));
      sounds.coin();
    });
  };

  const handleSelectPerk = (perk: InGamePerk) => {
    if (engineRef.current) {
      engineRef.current.applyPerk(perk);
      engineRef.current.setPaused(false);
    }
    setGameState('PLAYING');
  };

  // Character & Skin management
  const handleSelectCharacter = (charId: string) => {
    setStats((prev) => ({
      ...prev,
      selectedCharacterId: charId,
    }));
  };

  const handleSelectSkin = (charId: string, skinId: string) => {
    setStats((prev) => ({
      ...prev,
      selectedSkinId: {
        ...prev.selectedSkinId,
        [charId]: skinId,
      },
    }));
  };

  const handleUnlockCharacter = (char: CharacterDef) => {
    if (stats.coins < char.price) return;
    sounds.coin();
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - char.price,
      unlockedCharacters: [...prev.unlockedCharacters, char.id],
      selectedCharacterId: char.id,
    }));
  };

  const handleUnlockSkin = (skin: Skin) => {
    if (stats.coins < skin.price) return;
    sounds.coin();
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - skin.price,
      unlockedSkins: [...prev.unlockedSkins, skin.id],
      selectedSkinId: {
        ...prev.selectedSkinId,
        [stats.selectedCharacterId]: skin.id,
      },
    }));
  };

  const handleBuyUpgrade = (upgrade: PermanentUpgrade, cost: number) => {
    if (stats.coins < cost) return;
    sounds.coin();
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      upgrades: {
        ...prev.upgrades,
        [upgrade.id]: (prev.upgrades[upgrade.id] || 0) + 1,
      },
    }));
  };

  const handleToggleAudio = () => {
    setStats((prev) => {
      const next = !prev.audioMuted;
      sounds.setSfxMuted(next);
      return { ...prev, audioMuted: next };
    });
  };

  const handleToggleMusic = () => {
    setStats((prev) => {
      const next = !prev.musicMuted;
      sounds.setMusicMuted(next);
      return { ...prev, musicMuted: next };
    });
  };

  const handleToggleAutoFire = () => {
    setAutoFire((prev) => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.autoFire = next;
      }
      return next;
    });
  };

  const activeChar =
    CRAZY_CHARACTERS.find((c) => c.id === stats.selectedCharacterId) || CRAZY_CHARACTERS[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Isolated High-Performance 60fps Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair"
      />

      {/* Game Shell States */}

      {/* 1. Title Screen */}
      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          stats={stats}
          onStartGame={() => handleStartGame()}
          onOpenLocker={() => setGameState('CHARACTER_LOCKER')}
          onOpenArmory={() => setGameState('ARMORY_SHOP')}
          onChangeDifficulty={(diff) => setStats((prev) => ({ ...prev, difficulty: diff }))}
          onToggleAudio={handleToggleAudio}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* 2. In-Game Low-Occlusion HUD */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'PERK_CHOICE') && (
        <GameHUD
          hp={hudStats.hp}
          maxHp={hudStats.maxHp}
          level={currentLevelNumber}
          xp={hudStats.xp}
          xpToNext={hudStats.xpToNext}
          coinsCollectedThisRun={hudStats.coinsCollectedThisRun}
          totalCoins={stats.coins}
          kills={hudStats.kills}
          targetKills={hudStats.targetKills}
          objectiveType={hudStats.objectiveType}
          coresCollected={hudStats.coresCollected}
          targetCores={hudStats.targetCores}
          bossHp={hudStats.bossHp}
          bossMaxHp={hudStats.bossMaxHp}
          ultimateCharge={hudStats.ultimateCharge}
          ultimateMax={hudStats.ultimateMax}
          shieldActive={hudStats.shieldActive}
          onPause={handlePause}
          characterIcon={activeChar.icon}
          ultimateName={activeChar.ultimateName}
          autoFire={autoFire}
          onToggleAutoFire={handleToggleAutoFire}
          onTriggerUltimate={() => engineRef.current?.triggerUltimate()}
          onTriggerDash={() => engineRef.current?.triggerDash()}
        />
      )}

      {/* 3. In-Game Roguelite Perk Choice */}
      {gameState === 'PERK_CHOICE' && (
        <PerkSelectionModal perks={activePerks} onSelectPerk={handleSelectPerk} />
      )}

      {/* 4. Level Victory Modal */}
      {gameState === 'LEVEL_VICTORY' && (
        <LevelVictoryModal
          level={currentLevelNumber}
          clearBonus={levelClearBonus}
          kills={lastKills}
          totalRunCoins={hudStats.coinsCollectedThisRun}
          totalBankCoins={stats.coins}
          onNextLevel={handleNextLevel}
          onOpenArmory={() => setGameState('ARMORY_SHOP')}
          onReturnTitle={handleReturnToTitle}
          onWatchAdForCoins={handleWatchAdForCoins}
        />
      )}

      {/* 5. Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          level={currentLevelNumber}
          kills={lastKills}
          coinsEarned={lastCoinsEarned}
          totalCoins={stats.coins}
          onRetry={handleRetry}
          onOpenArmory={() => setGameState('ARMORY_SHOP')}
          onReturnTitle={handleReturnToTitle}
        />
      )}

      {/* 6. Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          level={currentLevelNumber}
          audioMuted={stats.audioMuted}
          musicMuted={stats.musicMuted}
          onResume={handleResume}
          onRetry={handleRetry}
          onReturnTitle={handleReturnToTitle}
          onToggleAudio={handleToggleAudio}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* 7. Character & Skin Locker */}
      {gameState === 'CHARACTER_LOCKER' && (
        <CharacterLocker
          stats={stats}
          onSelectCharacter={handleSelectCharacter}
          onSelectSkin={handleSelectSkin}
          onUnlockCharacter={handleUnlockCharacter}
          onUnlockSkin={handleUnlockSkin}
          onClose={() => setGameState('TITLE_MENU')}
        />
      )}

      {/* 8. Armory & Upgrades */}
      {gameState === 'ARMORY_SHOP' && (
        <ArmoryShop
          stats={stats}
          onBuyUpgrade={handleBuyUpgrade}
          onClose={() => setGameState('TITLE_MENU')}
        />
      )}
    </div>
  );
}
