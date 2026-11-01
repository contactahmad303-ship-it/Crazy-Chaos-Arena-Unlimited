/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sounds } from './audio';
import { CRAZY_CHARACTERS, DIFFICULTY_PRESETS, PERMANENT_UPGRADES, IN_GAME_PERKS } from './data';
import { ActiveLevelConfig, CharacterDef, DifficultyMode, InGamePerk, PlayerStats, Skin, HudStats } from './types';

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vy: number;
  isCrit?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'spark' | 'ring' | 'star';
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  fromPlayer: boolean;
  pierce: number;
  bounces: number;
  explosive: boolean;
  projectileType: string;
  life: number;
  trail: { x: number; y: number }[];
}

export interface CoinPickup {
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  type: 'bronze' | 'silver' | 'gold' | 'gem';
  radius: number;
  collected: boolean;
  life: number;
}

export interface ChaosCorePickup {
  x: number;
  y: number;
  radius: number;
  pulseTimer: number;
}

export interface HazardPool {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  type: 'swarmer' | 'brute' | 'sniper' | 'spitter' | 'boss';
  color: string;
  secondaryColor: string;
  hitFlash: number;
  telegraphTimer: number;
  telegraphMax: number;
  isTelegraphing: boolean;
  telegraphTargetX?: number;
  telegraphTargetY?: number;
  attackCooldown: number;
  isElite?: boolean;
}

export interface GameCallbacks {
  onLevelComplete: (coinsEarned: number, kills: number, level: number) => void;
  onGameOver: (coinsEarned: number, kills: number, level: number) => void;
  onTriggerPerkChoice: (perks: InGamePerk[]) => void;
  onStatsUpdate: (stats: HudStats) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime = 0;

  // Arena Dimensions
  public arenaWidth = 2400;
  public arenaHeight = 1800;

  // Viewport / Camera
  private cameraX = 0;
  private cameraY = 0;
  private screenShake = 0;
  private hitstopTimer = 0;

  // Player State
  public playerX = 1200;
  public playerY = 900;
  private playerVx = 0;
  private playerVy = 0;
  public playerHp = 100;
  public playerMaxHp = 100;
  private playerSpeed = 300;
  private playerHitFlash = 0;
  private playerInvulnerable = 0;
  private aimAngle = 0;
  private shootCooldown = 0;
  private dashCooldown = 0;
  private isDashing = 0;
  private ultimateCharge = 0;
  private ultimateMax = 18;
  private isUltimateActive = 0;
  private shieldCount = 0;
  private shieldMax = 0;
  private shieldRechargeTimer = 0;

  // Squash & Stretch
  private squashX = 1;
  private squashY = 1;

  // Animation Timers
  private walkTimer = 0;
  private animTimer = 0;

  // Roguelite in-run stats
  private inRunLevel = 1;
  private inRunXp = 0;
  private inRunXpToNext = 50;
  private multiShot = 1;
  private bouncingBullets = 0;
  private explosiveRounds = false;
  private orbitingSaws = 0;
  private orbitingSawAngle = 0;
  private lightningChain = false;
  private lifesteal = 0;
  private cryoAura = false;
  private damageBonus = 1;
  private critChance = 0.05;

  // Collections
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private coins: CoinPickup[] = [];
  private chaosCores: ChaosCorePickup[] = [];
  private hazardPools: HazardPool[] = [];

  // Run Telemetry
  public kills = 0;
  public coinsCollectedThisRun = 0;
  public coresCollected = 0;
  private nextEnemyId = 1;
  private spawnTimer = 0;
  private activeLevel!: ActiveLevelConfig;

  // Input State
  private keys: Record<string, boolean> = {};
  public mouseX = 0;
  public mouseY = 0;
  public isMouseDown = false;
  public autoFire = true;

  // Character & Meta
  private character!: CharacterDef;
  private skin!: Skin;
  private playerStats!: PlayerStats;
  private callbacks: GameCallbacks;

  // Game Loop Flags
  public isRunning = false;
  public isPaused = false;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;

    this.bindEvents();
    this.handleResize();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('resize', this.handleResize);
  }

  public destroy() {
    this.stop();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    this.keys[e.code] = true;

    if (e.key === ' ' || e.code === 'Space') {
      this.triggerUltimate();
    }
    if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key.toLowerCase() === 'e') {
      this.triggerDash();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
    this.keys[e.code] = false;
  };

  private onBlur = () => {
    this.keys = {};
    this.isMouseDown = false;
  };

  private onMouseMove = (e: MouseEvent) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = true;
    } else if (e.button === 2) {
      this.triggerDash();
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  };

  // --- INITIALIZATION ---

  public startLevel(levelConfig: ActiveLevelConfig, stats: PlayerStats) {
    this.activeLevel = levelConfig;
    this.playerStats = stats;

    const charDef = CRAZY_CHARACTERS.find((c) => c.id === stats.selectedCharacterId) || CRAZY_CHARACTERS[0];
    this.character = charDef;

    const skinId = stats.selectedSkinId[charDef.id] || charDef.skins[0].id;
    this.skin = charDef.skins.find((s) => s.id === skinId) || charDef.skins[0];

    // Compute upgrades
    let bonusHp = 0;
    let bonusDamage = 1;
    let bonusSpeed = 1;
    let bonusFireRate = 1;
    let bonusCrit = 0;
    let bonusMagnet = 1;
    let shieldLevels = 0;

    PERMANENT_UPGRADES.forEach((upg) => {
      const lvl = stats.upgrades[upg.id] || 0;
      if (lvl > 0) {
        if (upg.statKey === 'maxHp') bonusHp += lvl * upg.effectPerLevel;
        if (upg.statKey === 'damage') bonusDamage += lvl * upg.effectPerLevel;
        if (upg.statKey === 'speed') bonusSpeed += lvl * upg.effectPerLevel;
        if (upg.statKey === 'fireRate') bonusFireRate += lvl * upg.effectPerLevel;
        if (upg.statKey === 'critChance') bonusCrit += lvl * upg.effectPerLevel;
        if (upg.statKey === 'magnet') bonusMagnet += lvl * upg.effectPerLevel;
        if (upg.statKey === 'shield') shieldLevels += lvl;
      }
    });

    this.playerMaxHp = Math.round(this.character.baseHp + bonusHp);
    this.playerHp = this.playerMaxHp;
    this.playerSpeed = this.character.baseSpeed * bonusSpeed;
    this.damageBonus = bonusDamage;
    this.critChance = 0.05 + bonusCrit;
    this.shieldMax = shieldLevels;
    this.shieldCount = shieldLevels;
    this.shieldRechargeTimer = 0;

    // Reset entities
    this.playerX = this.arenaWidth / 2;
    this.playerY = this.arenaHeight / 2;
    this.playerVx = 0;
    this.playerVy = 0;
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.floatingTexts = [];
    this.coins = [];
    this.chaosCores = [];
    this.hazardPools = [];

    this.kills = 0;
    this.coresCollected = 0;
    this.coinsCollectedThisRun = 0;
    this.inRunLevel = 1;
    this.inRunXp = 0;
    this.inRunXpToNext = 50;

    this.multiShot = 1;
    this.bouncingBullets = 0;
    this.explosiveRounds = false;
    this.orbitingSaws = 0;
    this.lightningChain = false;
    this.lifesteal = 0;
    this.cryoAura = false;

    this.ultimateCharge = 0;
    this.ultimateMax = this.character.ultimateCooldown;
    this.isUltimateActive = 0;
    this.isDashing = 0;
    this.dashCooldown = 0;
    this.shootCooldown = 0;

    this.cameraX = this.playerX - this.canvas.width / 2;
    this.cameraY = this.playerY - this.canvas.height / 2;

    // Spawn initial cores if objective
    if (this.activeLevel.objectiveType === 'COLLECT_CORES') {
      for (let i = 0; i < this.activeLevel.targetCores; i++) {
        this.spawnChaosCore();
      }
    }

    // Spawn Boss if Boss Hunt
    if (this.activeLevel.objectiveType === 'BOSS_HUNT') {
      this.spawnBoss();
    }

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(this.gameLoop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (!paused) {
      this.lastTime = performance.now();
    }
  }

  public applyPerk(perk: InGamePerk) {
    if (perk.id === 'multishot') this.multiShot++;
    if (perk.id === 'bouncing_bullets') this.bouncingBullets += 2;
    if (perk.id === 'explosive_rounds') this.explosiveRounds = true;
    if (perk.id === 'plasma_saw') this.orbitingSaws += 2;
    if (perk.id === 'lightning_chain') this.lightningChain = true;
    if (perk.id === 'lifesteal_nanites') this.lifesteal += 5;
    if (perk.id === 'frost_nova') this.cryoAura = true;
    if (perk.id === 'hyper_dash') this.playerSpeed *= 1.15;
    if (perk.id === 'overdrive_damage') this.damageBonus *= 1.3;
    if (perk.id === 'super_nova') {
      this.ultimateMax = Math.max(8, this.ultimateMax * 0.65);
    }

    this.addFloatingText(this.playerX, this.playerY - 40, `+${perk.name.toUpperCase()}!`, '#38bdf8', 22, true);
    sounds.levelUp();
  }

  // --- ACTIONS ---

  public triggerDash() {
    if (this.dashCooldown > 0 || this.isDashing > 0) return;
    this.isDashing = 0.22; // 220ms duration
    this.dashCooldown = 1.4; // 1.4s cooldown
    this.playerInvulnerable = 0.28;
    sounds.dash();

    // Dash trail burst
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: this.playerX + (Math.random() - 0.5) * 20,
        y: this.playerY + (Math.random() - 0.5) * 20,
        vx: -this.playerVx * 0.3 + (Math.random() - 0.5) * 60,
        vy: -this.playerVy * 0.3 + (Math.random() - 0.5) * 60,
        size: Math.random() * 8 + 4,
        color: this.skin.colorScheme.accent,
        alpha: 0.9,
        life: 0.35,
        maxLife: 0.35,
        shape: 'spark',
      });
    }
  }

  public triggerUltimate() {
    if (this.ultimateCharge < this.ultimateMax || this.isUltimateActive > 0) return;
    this.ultimateCharge = 0;
    this.isUltimateActive = 4.0; // 4 seconds of mayhem
    this.playerInvulnerable = 4.0;
    this.screenShake = 18;
    sounds.ultimateSpecial();

    this.addFloatingText(this.playerX, this.playerY - 50, `${this.character.ultimateName.toUpperCase()}!`, '#fbbf24', 28, true);

    // Shockwave radial pulse
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const speed = Math.random() * 300 + 400;
      this.particles.push({
        x: this.playerX,
        y: this.playerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 10 + 6,
        color: this.skin.colorScheme.primary,
        alpha: 1,
        life: 0.8,
        maxLife: 0.8,
        shape: 'ring',
      });
    }

    // Special instant effects per character
    if (this.character.id === 'mecha_rex') {
      // Screen wipe damage
      this.enemies.forEach((en) => {
        this.damageEnemy(en, 250, true);
      });
      sounds.explosion(true);
    } else if (this.character.id === 'glitch_phantom') {
      // Screen laser grid
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        this.bullets.push({
          x: this.playerX,
          y: this.playerY,
          vx: Math.cos(angle) * 700,
          vy: Math.sin(angle) * 700,
          radius: 12,
          damage: 120,
          color: '#22c55e',
          fromPlayer: true,
          pierce: 99,
          bounces: 3,
          explosive: true,
          projectileType: 'glitch',
          life: 3,
          trail: [],
        });
      }
    } else if (this.character.id === 'turbo_taco') {
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        this.bullets.push({
          x: this.playerX,
          y: this.playerY,
          vx: Math.cos(angle) * 550,
          vy: Math.sin(angle) * 550,
          radius: 14,
          damage: 85,
          color: '#f97316',
          fromPlayer: true,
          pierce: 3,
          bounces: 1,
          explosive: true,
          projectileType: 'rocket',
          life: 2.5,
          trail: [],
        });
      }
      sounds.explosion(true);
    }
  }

  // --- SPAWNING ---

  private spawnEnemy() {
    const diff = DIFFICULTY_PRESETS[this.activeLevel.difficulty];
    const lvlScalar = 1 + (this.activeLevel.levelNumber - 1) * 0.16;

    // Pick spawn position just outside camera view
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(this.canvas.width, this.canvas.height) * 0.7 + 100;
    const x = Math.max(50, Math.min(this.arenaWidth - 50, this.playerX + Math.cos(angle) * spawnDist));
    const y = Math.max(50, Math.min(this.arenaHeight - 50, this.playerY + Math.sin(angle) * spawnDist));

    const rand = Math.random();
    let type: Enemy['type'] = 'swarmer';
    let hp = 30 * lvlScalar * diff.hpMultiplier;
    let speed = (160 + Math.random() * 40) * Math.min(1.8, 1 + (this.activeLevel.levelNumber - 1) * 0.03) * diff.speedMultiplier;
    let radius = 18;
    let damage = Math.round(10 * lvlScalar);
    let color = '#ef4444';
    let secondaryColor = '#991b1b';

    if (rand < 0.25) {
      // Brute
      type = 'brute';
      hp = 110 * lvlScalar * diff.hpMultiplier;
      speed = 110 * diff.speedMultiplier;
      radius = 32;
      damage = Math.round(25 * lvlScalar);
      color = '#f97316';
      secondaryColor = '#c2410c';
    } else if (rand < 0.45) {
      // Sniper
      type = 'sniper';
      hp = 45 * lvlScalar * diff.hpMultiplier;
      speed = 130 * diff.speedMultiplier;
      radius = 20;
      damage = Math.round(20 * lvlScalar);
      color = '#a855f7';
      secondaryColor = '#6b21a8';
    } else if (rand < 0.6) {
      // Spitter
      type = 'spitter';
      hp = 60 * lvlScalar * diff.hpMultiplier;
      speed = 120 * diff.speedMultiplier;
      radius = 22;
      damage = Math.round(15 * lvlScalar);
      color = '#84cc16';
      secondaryColor = '#4d7c0f';
    }

    const isElite = Math.random() < diff.eliteChance;
    if (isElite) {
      hp *= 2.2;
      radius *= 1.3;
      damage *= 1.4;
      color = '#e11d48';
      secondaryColor = '#881337';
    }

    this.enemies.push({
      id: this.nextEnemyId++,
      x,
      y,
      vx: 0,
      vy: 0,
      radius,
      hp,
      maxHp: hp,
      speed,
      damage,
      type,
      color,
      secondaryColor,
      hitFlash: 0,
      telegraphTimer: 0,
      telegraphMax: type === 'sniper' ? 1.0 : type === 'brute' ? 0.7 : 0.5,
      isTelegraphing: false,
      attackCooldown: 1.0 + Math.random(),
      isElite,
    });
  }

  private spawnBoss() {
    const diff = DIFFICULTY_PRESETS[this.activeLevel.difficulty];
    const lvlScalar = 1 + (this.activeLevel.levelNumber - 1) * 0.25;
    const baseHp = 1200 * lvlScalar * diff.hpMultiplier;

    this.enemies.push({
      id: this.nextEnemyId++,
      x: this.arenaWidth / 2,
      y: 250,
      vx: 0,
      vy: 0,
      radius: 64,
      hp: baseHp,
      maxHp: baseHp,
      speed: 125 * diff.speedMultiplier,
      damage: 35,
      type: 'boss',
      color: '#dc2626',
      secondaryColor: '#7f1d1d',
      hitFlash: 0,
      telegraphTimer: 0,
      telegraphMax: 1.2,
      isTelegraphing: false,
      attackCooldown: 2.0,
      isElite: true,
    });

    sounds.bossRoar();
    this.screenShake = 25;
  }

  private spawnChaosCore() {
    const margin = 200;
    this.chaosCores.push({
      x: margin + Math.random() * (this.arenaWidth - margin * 2),
      y: margin + Math.random() * (this.arenaHeight - margin * 2),
      radius: 24,
      pulseTimer: Math.random() * Math.PI * 2,
    });
  }

  public dropCoins(x: number, y: number, enemy: Enemy) {
    const diff = DIFFICULTY_PRESETS[this.activeLevel.difficulty];
    const count = enemy.type === 'boss' ? 30 : enemy.isElite ? 6 : Math.random() < 0.5 ? 2 : 1;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 120 + 30;

      let type: CoinPickup['type'] = 'bronze';
      let val = 1;
      const roll = Math.random();

      if (enemy.type === 'boss') {
        type = roll < 0.3 ? 'gem' : 'gold';
        val = type === 'gem' ? 50 : 20;
      } else if (roll < 0.05) {
        type = 'gem';
        val = 50;
      } else if (roll < 0.25) {
        type = 'gold';
        val = 20;
      } else if (roll < 0.55) {
        type = 'silver';
        val = 5;
      }

      val = Math.round(val * diff.coinMultiplier);

      this.coins.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        value: val,
        type,
        radius: type === 'gem' ? 12 : type === 'gold' ? 10 : 8,
        collected: false,
        life: 30, // 30 seconds persistence
      });
    }

    // Drop XP
    this.inRunXp += enemy.isElite ? 25 : 8;
    if (this.inRunXp >= this.inRunXpToNext) {
      this.levelUpInRun();
    }
  }

  private levelUpInRun() {
    this.inRunLevel++;
    this.inRunXp -= this.inRunXpToNext;
    this.inRunXpToNext = Math.round(this.inRunXpToNext * 1.4);

    sounds.levelUp();
    this.callbacks.onTriggerPerkChoice(this.pickRandomPerks(3));
  }

  private pickRandomPerks(count: number): InGamePerk[] {
    const shuffled = [...IN_GAME_PERKS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // --- GAME LOOP ---

  private gameLoop = (time: number) => {
    if (!this.isRunning) return;

    const rawDt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    // Frame delta clamp for simulation stability
    const dt = Math.min(rawDt, 0.05);

    if (!this.isPaused) {
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.update(dt);
      }
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.gameLoop);
  };

  // --- UPDATE ---

  private update(dt: number) {
    this.updatePlayer(dt);
    this.updateShooting(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);
    this.updateCamera(dt);
    this.checkWinLossConditions();

    // Notify UI React layer
    const boss = this.enemies.find((e) => e.type === 'boss');
    this.callbacks.onStatsUpdate({
      hp: Math.max(0, Math.round(this.playerHp)),
      maxHp: this.playerMaxHp,
      level: this.inRunLevel,
      xp: this.inRunXp,
      xpToNext: this.inRunXpToNext,
      coinsCollectedThisRun: this.coinsCollectedThisRun,
      kills: this.kills,
      targetKills: this.activeLevel.targetKills,
      objectiveType: this.activeLevel.objectiveType,
      coresCollected: this.coresCollected,
      targetCores: this.activeLevel.targetCores,
      bossHp: boss ? Math.max(0, Math.round(boss.hp)) : undefined,
      bossMaxHp: boss ? boss.maxHp : undefined,
      ultimateCharge: Math.min(this.ultimateMax, this.ultimateCharge),
      ultimateMax: this.ultimateMax,
      shieldActive: this.shieldCount > 0,
    });
  }

  private updatePlayer(dt: number) {
    // Input Vector
    let moveX = 0;
    let moveY = 0;

    if (this.keys['w'] || this.keys['arrowup'] || this.keys['KeyW']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown'] || this.keys['KeyS']) moveY += 1;
    if (this.keys['a'] || this.keys['arrowleft'] || this.keys['KeyA']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright'] || this.keys['KeyD']) moveX += 1;

    const len = Math.hypot(moveX, moveY);
    if (len > 0) {
      moveX /= len;
      moveY /= len;
    }

    // Handle Dash
    let currentSpeed = this.playerSpeed;
    if (this.isDashing > 0) {
      this.isDashing -= dt;
      currentSpeed *= 3.2; // High burst speed
    }
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }

    if (this.isUltimateActive > 0) {
      this.isUltimateActive -= dt;
      currentSpeed *= 1.35;
    }

    // Ultimate passive charge over time
    this.ultimateCharge += dt * 0.9;

    // Movement Physics
    const accel = 18;
    this.playerVx += (moveX * currentSpeed - this.playerVx) * accel * dt;
    this.playerVy += (moveY * currentSpeed - this.playerVy) * accel * dt;

    this.playerX += this.playerVx * dt;
    this.playerY += this.playerVy * dt;

    // Animation Timers
    const isMoving = Math.hypot(this.playerVx, this.playerVy) > 15;
    if (isMoving) {
      this.walkTimer += dt * 12;
    }
    this.animTimer += dt;

    // Clamp inside arena walls
    const pRadius = 26;
    this.playerX = Math.max(pRadius, Math.min(this.arenaWidth - pRadius, this.playerX));
    this.playerY = Math.max(pRadius, Math.min(this.arenaHeight - pRadius, this.playerY));

    // Aim Angle
    const screenPlayerX = this.playerX - this.cameraX;
    const screenPlayerY = this.playerY - this.cameraY;
    this.aimAngle = Math.atan2(this.mouseY - screenPlayerY, this.mouseX - screenPlayerX);

    // Timers
    if (this.playerHitFlash > 0) this.playerHitFlash -= dt;
    if (this.playerInvulnerable > 0) this.playerInvulnerable -= dt;

    // Shield Recharge
    if (this.shieldCount < this.shieldMax) {
      this.shieldRechargeTimer += dt;
      if (this.shieldRechargeTimer >= 15) {
        this.shieldCount++;
        this.shieldRechargeTimer = 0;
        this.addFloatingText(this.playerX, this.playerY - 30, 'SHIELD RESTORED!', '#38bdf8', 18);
      }
    }

    // Squash & Stretch restoration
    this.squashX += (1 - this.squashX) * 12 * dt;
    this.squashY += (1 - this.squashY) * 12 * dt;

    // Orbiting Sawblades
    if (this.orbitingSaws > 0) {
      this.orbitingSawAngle += dt * 5.0;
      const sawDist = 75;
      for (let i = 0; i < this.orbitingSaws; i++) {
        const angle = this.orbitingSawAngle + (i / this.orbitingSaws) * Math.PI * 2;
        const sawX = this.playerX + Math.cos(angle) * sawDist;
        const sawY = this.playerY + Math.sin(angle) * sawDist;

        // Damage enemies colliding with saw
        this.enemies.forEach((en) => {
          if (Math.hypot(en.x - sawX, en.y - sawY) < en.radius + 18) {
            this.damageEnemy(en, 80 * dt * this.damageBonus, false);
            if (Math.random() < 0.2) sounds.hit();
          }
        });
      }
    }

    // Cryo Aura
    if (this.cryoAura) {
      const freezeDist = 180;
      this.enemies.forEach((en) => {
        if (Math.hypot(en.x - this.playerX, en.y - this.playerY) < freezeDist) {
          en.vx *= 0.85;
          en.vy *= 0.85;
        }
      });
    }
  }

  private updateShooting(dt: number) {
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    const wantToShoot = this.isMouseDown || this.autoFire;

    if (wantToShoot && this.shootCooldown <= 0) {
      this.fireWeapon();
      const fireRate = this.character.fireRate * (1 + (this.playerStats.upgrades['rapid_fire'] || 0) * 0.08);
      this.shootCooldown = 1 / fireRate;
    }
  }

  private fireWeapon() {
    sounds.shoot(this.character.projectileType);

    // Squash on fire
    this.squashX = 0.85;
    this.squashY = 1.25;

    const baseDmg = this.character.baseDamage * this.damageBonus;
    const speed = this.character.bulletSpeed;

    const shots = this.multiShot;
    const spreadAngle = 0.16; // radians
    const startAngle = this.aimAngle - ((shots - 1) * spreadAngle) / 2;

    for (let i = 0; i < shots; i++) {
      const angle = startAngle + i * spreadAngle;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.bullets.push({
        x: this.playerX + Math.cos(angle) * 25,
        y: this.playerY + Math.sin(angle) * 25,
        vx,
        vy,
        radius: this.character.projectileType === 'plasma' ? 9 : 6,
        damage: baseDmg,
        color: this.skin.colorScheme.accent,
        fromPlayer: true,
        pierce: this.character.projectileType === 'glitch' ? 3 : 1,
        bounces: this.bouncingBullets + (this.character.id === 'dr_bananas' ? 2 : 0),
        explosive: this.explosiveRounds || this.character.projectileType === 'rocket',
        projectileType: this.character.projectileType,
        life: 2.2,
        trail: [],
      });
    }
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      // Trail recording
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 5) b.trail.shift();

      // Bounce off walls
      if (b.x < 10 || b.x > this.arenaWidth - 10) {
        if (b.bounces > 0) {
          b.vx = -b.vx;
          b.bounces--;
        } else {
          b.life = 0;
        }
      }
      if (b.y < 10 || b.y > this.arenaHeight - 10) {
        if (b.bounces > 0) {
          b.vy = -b.vy;
          b.bounces--;
        } else {
          b.life = 0;
        }
      }

      // Collisions with Player (if from enemy)
      if (!b.fromPlayer) {
        if (Math.hypot(b.x - this.playerX, b.y - this.playerY) < b.radius + 20) {
          this.damagePlayer(b.damage);
          b.life = 0;
        }
      } else {
        // Collisions with Enemies
        for (let j = 0; j < this.enemies.length; j++) {
          const en = this.enemies[j];
          if (Math.hypot(b.x - en.x, b.y - en.y) < b.radius + en.radius) {
            // Hit!
            const isCrit = Math.random() < this.critChance;
            const finalDmg = isCrit ? b.damage * 2.2 : b.damage;
            this.damageEnemy(en, finalDmg, isCrit);

            if (b.explosive) {
              this.triggerExplosion(b.x, b.y, 80, b.damage * 0.8);
            }

            if (this.lightningChain) {
              this.triggerLightningChain(en, b.damage * 0.6);
            }

            b.pierce--;
            if (b.pierce <= 0) {
              b.life = 0;
              break;
            }
          }
        }
      }

      if (b.life <= 0) {
        this.bullets.splice(i, 1);
      }
    }
  }

  private triggerLightningChain(sourceEnemy: Enemy, damage: number) {
    const nearby = this.enemies
      .filter((e) => e.id !== sourceEnemy.id && Math.hypot(e.x - sourceEnemy.x, e.y - sourceEnemy.y) < 220)
      .slice(0, 3);

    nearby.forEach((target) => {
      this.damageEnemy(target, damage, false);
      // Spark line particles
      for (let k = 0; k < 6; k++) {
        const lerp = k / 6;
        this.particles.push({
          x: sourceEnemy.x + (target.x - sourceEnemy.x) * lerp,
          y: sourceEnemy.y + (target.y - sourceEnemy.y) * lerp,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          size: 4,
          color: '#38bdf8',
          alpha: 1,
          life: 0.2,
          maxLife: 0.2,
          shape: 'spark',
        });
      }
    });
  }

  private triggerExplosion(x: number, y: number, radius: number, damage: number) {
    sounds.explosion();
    this.screenShake = Math.max(this.screenShake, 10);

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 200 + 50;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        color: '#f97316',
        alpha: 1,
        life: 0.45,
        maxLife: 0.45,
        shape: 'spark',
      });
    }

    this.enemies.forEach((en) => {
      if (Math.hypot(en.x - x, en.y - y) < radius + en.radius) {
        this.damageEnemy(en, damage, false);
      }
    });
  }

  private updateEnemies(dt: number) {
    // Spawning logic
    this.spawnTimer += dt;
    const spawnInterval = Math.max(0.35, 1.4 - (this.activeLevel.levelNumber - 1) * 0.05);

    if (this.activeLevel.objectiveType === 'CHAOS_RUSH') {
      if (this.spawnTimer >= spawnInterval * 0.45) {
        this.spawnEnemy();
        this.spawnTimer = 0;
      }
    } else {
      if (this.spawnTimer >= spawnInterval && this.enemies.length < 90) {
        this.spawnEnemy();
        this.spawnTimer = 0;
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      if (en.hitFlash > 0) en.hitFlash -= dt;

      const dx = this.playerX - en.x;
      const dy = this.playerY - en.y;
      const dist = Math.hypot(dx, dy);

      // Distinct enemy AI behaviors
      if (en.type === 'swarmer') {
        // Direct swarm
        en.vx += ((dx / dist) * en.speed - en.vx) * 6 * dt;
        en.vy += ((dy / dist) * en.speed - en.vy) * 6 * dt;
      } else if (en.type === 'brute') {
        // Charge attack with windup
        if (!en.isTelegraphing && dist < 320 && en.attackCooldown <= 0) {
          en.isTelegraphing = true;
          en.telegraphTimer = en.telegraphMax;
          en.telegraphTargetX = this.playerX;
          en.telegraphTargetY = this.playerY;
        }

        if (en.isTelegraphing) {
          en.telegraphTimer -= dt;
          en.vx *= 0.85;
          en.vy *= 0.85;
          if (en.telegraphTimer <= 0) {
            // Rush forward!
            en.isTelegraphing = false;
            en.attackCooldown = 2.5;
            const chargeAngle = Math.atan2(en.telegraphTargetY! - en.y, en.telegraphTargetX! - en.x);
            en.vx = Math.cos(chargeAngle) * en.speed * 3.5;
            en.vy = Math.sin(chargeAngle) * en.speed * 3.5;
            sounds.dash();
          }
        } else {
          en.attackCooldown -= dt;
          en.vx += ((dx / dist) * en.speed - en.vx) * 4 * dt;
          en.vy += ((dy / dist) * en.speed - en.vy) * 4 * dt;
        }
      } else if (en.type === 'sniper') {
        // Kites player and telegraphs beam
        if (dist < 400) {
          // Back up
          en.vx += ((-dx / dist) * en.speed - en.vx) * 4 * dt;
          en.vy += ((-dy / dist) * en.speed - en.vy) * 4 * dt;
        } else {
          en.vx *= 0.9;
          en.vy *= 0.9;
        }

        en.attackCooldown -= dt;
        if (en.attackCooldown <= 0 && !en.isTelegraphing) {
          en.isTelegraphing = true;
          en.telegraphTimer = en.telegraphMax;
        }

        if (en.isTelegraphing) {
          en.telegraphTimer -= dt;
          if (en.telegraphTimer <= 0) {
            en.isTelegraphing = false;
            en.attackCooldown = 3.0;
            // Fire high-speed sniper beam
            const angle = Math.atan2(this.playerY - en.y, this.playerX - en.x);
            this.bullets.push({
              x: en.x,
              y: en.y,
              vx: Math.cos(angle) * 650,
              vy: Math.sin(angle) * 650,
              radius: 7,
              damage: en.damage,
              color: '#c084fc',
              fromPlayer: false,
              pierce: 1,
              bounces: 0,
              explosive: false,
              projectileType: 'laser',
              life: 3,
              trail: [],
            });
            sounds.shoot('laser');
          }
        }
      } else if (en.type === 'spitter') {
        // Lob acid puddle
        en.attackCooldown -= dt;
        en.vx += ((dx / dist) * en.speed - en.vx) * 4 * dt;
        en.vy += ((dy / dist) * en.speed - en.vy) * 4 * dt;

        if (en.attackCooldown <= 0) {
          en.attackCooldown = 3.5;
          this.hazardPools.push({
            x: this.playerX + (Math.random() - 0.5) * 60,
            y: this.playerY + (Math.random() - 0.5) * 60,
            radius: 45,
            life: 6.0,
            maxLife: 6.0,
            color: 'rgba(132, 204, 22, 0.45)',
          });
        }
      } else if (en.type === 'boss') {
        // Boss Multi-Pattern AI
        en.vx += ((dx / dist) * en.speed - en.vx) * 3 * dt;
        en.vy += ((dy / dist) * en.speed - en.vy) * 3 * dt;
        en.attackCooldown -= dt;

        if (en.attackCooldown <= 0) {
          en.attackCooldown = 2.4;
          // 360 degree ring barrage
          for (let k = 0; k < 14; k++) {
            const angle = (k / 14) * Math.PI * 2 + Math.random() * 0.2;
            this.bullets.push({
              x: en.x,
              y: en.y,
              vx: Math.cos(angle) * 260,
              vy: Math.sin(angle) * 260,
              radius: 9,
              damage: en.damage,
              color: '#ef4444',
              fromPlayer: false,
              pierce: 1,
              bounces: 0,
              explosive: false,
              projectileType: 'plasma',
              life: 4,
              trail: [],
            });
          }
          sounds.shoot('rocket');
        }
      }

      en.x += en.vx * dt;
      en.y += en.vy * dt;

      // Contact damage with player
      if (dist < en.radius + 20) {
        if (this.isUltimateActive > 0) {
          // Player crushes enemies while ultimate active!
          this.damageEnemy(en, 150, true);
        } else {
          this.damagePlayer(en.damage * dt * 2.5);
        }
      }

      if (en.hp <= 0) {
        this.killEnemy(en, i);
      }
    }

    // Hazard Pool damage to player
    for (let i = this.hazardPools.length - 1; i >= 0; i--) {
      const pool = this.hazardPools[i];
      pool.life -= dt;
      if (Math.hypot(this.playerX - pool.x, this.playerY - pool.y) < pool.radius + 15) {
        this.damagePlayer(18 * dt);
      }
      if (pool.life <= 0) {
        this.hazardPools.splice(i, 1);
      }
    }
  }

  private damageEnemy(en: Enemy, damage: number, isCrit: boolean) {
    en.hp -= damage;
    en.hitFlash = 0.1;
    sounds.hit();

    if (isCrit) {
      this.hitstopTimer = 0.045; // 45ms satisfying hitstop
      this.screenShake = Math.max(this.screenShake, 7);
      this.addFloatingText(en.x, en.y - en.radius, `${Math.round(damage)} CRIT!`, '#f43f5e', 22, true);
    } else {
      this.addFloatingText(en.x, en.y - en.radius, `${Math.round(damage)}`, '#fbbf24', 16);
    }
  }

  private killEnemy(en: Enemy, index: number) {
    this.enemies.splice(index, 1);
    this.kills++;
    this.dropCoins(en.x, en.y, en);

    if (this.lifesteal > 0) {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + this.lifesteal);
    }

    // Death shatter explosion
    const count = en.type === 'boss' ? 60 : 15;
    for (let k = 0; k < count; k++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 220 + 40;
      this.particles.push({
        x: en.x,
        y: en.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 7 + 3,
        color: en.color,
        alpha: 1,
        life: 0.5,
        maxLife: 0.5,
        shape: 'spark',
      });
    }

    if (en.type === 'boss') {
      sounds.explosion(true);
      this.screenShake = 24;
    }
  }

  private damagePlayer(amount: number) {
    if (this.playerInvulnerable > 0 || this.isUltimateActive > 0) return;

    if (this.shieldCount > 0) {
      this.shieldCount--;
      this.playerInvulnerable = 0.8;
      this.screenShake = 12;
      sounds.heavyHit();
      this.addFloatingText(this.playerX, this.playerY - 30, 'SHIELD ABSORBED!', '#38bdf8', 20, true);
      return;
    }

    this.playerHp -= amount;
    this.playerHitFlash = 0.12;
    this.playerInvulnerable = 0.25;
    this.screenShake = Math.max(this.screenShake, 14);
    sounds.hit();

    if (this.playerHp <= 0) {
      this.playerHp = 0;
      this.triggerGameOver();
    }
  }

  private updatePickups(dt: number) {
    // Magnet radius
    const baseMagnet = 140;
    const magnetUpgrade = (this.playerStats.upgrades['coin_magnet'] || 0) * 0.3;
    const magnetRadius = baseMagnet * (1 + magnetUpgrade);

    // Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vx *= 0.94;
      c.vy *= 0.94;
      c.life -= dt;

      const dist = Math.hypot(this.playerX - c.x, this.playerY - c.y);
      if (dist < magnetRadius) {
        // Accelerate towards player
        const speed = 480;
        c.vx += ((this.playerX - c.x) / dist) * speed * dt;
        c.vy += ((this.playerY - c.y) / dist) * speed * dt;
      }

      if (dist < c.radius + 24) {
        // Collected!
        this.coinsCollectedThisRun += c.value;
        this.playerStats.coins += c.value;
        sounds.coin();
        this.addFloatingText(c.x, c.y, `+${c.value}`, '#fbbf24', 15);
        this.coins.splice(i, 1);
        continue;
      }

      if (c.life <= 0) {
        this.coins.splice(i, 1);
      }
    }

    // Chaos Cores
    for (let i = this.chaosCores.length - 1; i >= 0; i--) {
      const core = this.chaosCores[i];
      core.pulseTimer += dt * 4;

      if (Math.hypot(this.playerX - core.x, this.playerY - core.y) < core.radius + 24) {
        this.coresCollected++;
        sounds.coin();
        this.addFloatingText(core.x, core.y, 'ENERGY CORE SECURED!', '#38bdf8', 20, true);
        this.chaosCores.splice(i, 1);

        if (this.coresCollected < this.activeLevel.targetCores) {
          this.spawnChaosCore();
        }
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string, size = 16, isCrit = false) {
    this.floatingTexts.push({
      x: x + (Math.random() - 0.5) * 20,
      y,
      text,
      color,
      size,
      life: isCrit ? 0.9 : 0.65,
      maxLife: isCrit ? 0.9 : 0.65,
      vy: isCrit ? -65 : -45,
      isCrit,
    });
  }

  private updateCamera(dt: number) {
    // Smooth camera follow player
    const targetCamX = this.playerX - this.canvas.width / 2;
    const targetCamY = this.playerY - this.canvas.height / 2;

    this.cameraX += (targetCamX - this.cameraX) * 8 * dt;
    this.cameraY += (targetCamY - this.cameraY) * 8 * dt;

    // Decay screen shake
    if (this.screenShake > 0) {
      this.screenShake -= dt * 25;
      if (this.screenShake < 0) this.screenShake = 0;
    }
  }

  private checkWinLossConditions() {
    if (!this.isRunning) return;

    let levelWon = false;
    if (this.activeLevel.objectiveType === 'SURVIVE_KILLS' && this.kills >= this.activeLevel.targetKills) {
      levelWon = true;
    } else if (this.activeLevel.objectiveType === 'BOSS_HUNT') {
      const bossRemaining = this.enemies.some((e) => e.type === 'boss');
      if (!bossRemaining) levelWon = true;
    } else if (this.activeLevel.objectiveType === 'COLLECT_CORES' && this.coresCollected >= this.activeLevel.targetCores) {
      levelWon = true;
    } else if (this.activeLevel.objectiveType === 'CHAOS_RUSH' && this.kills >= this.activeLevel.targetKills) {
      levelWon = true;
    }

    if (levelWon) {
      this.triggerLevelVictory();
    }
  }

  private triggerLevelVictory() {
    this.stop();
    const diff = DIFFICULTY_PRESETS[this.activeLevel.difficulty];
    const clearBonus = Math.round((150 + this.activeLevel.levelNumber * 80) * diff.coinMultiplier);
    this.coinsCollectedThisRun += clearBonus;
    this.playerStats.coins += clearBonus;
    this.playerStats.totalKills += this.kills;

    if (this.activeLevel.levelNumber >= this.playerStats.highestLevel) {
      this.playerStats.highestLevel = this.activeLevel.levelNumber + 1;
    }

    sounds.victoryFanfare();
    this.callbacks.onLevelComplete(clearBonus, this.kills, this.activeLevel.levelNumber);
  }

  private triggerGameOver() {
    this.stop();
    this.playerStats.totalKills += this.kills;
    sounds.explosion(true);
    this.callbacks.onGameOver(this.coinsCollectedThisRun, this.kills, this.activeLevel.levelNumber);
  }

  // --- RENDERING ---

  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();

    // Camera transform with screen shake
    const shakeOffsetX = (Math.random() - 0.5) * this.screenShake;
    const shakeOffsetY = (Math.random() - 0.5) * this.screenShake;
    ctx.translate(-this.cameraX + shakeOffsetX, -this.cameraY + shakeOffsetY);

    // 1. Draw Biome Background Arena
    this.drawArenaGrid(ctx);

    // 2. Draw Hazard Pools
    this.hazardPools.forEach((pool) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pool.x, pool.y, pool.radius, 0, Math.PI * 2);
      ctx.fillStyle = pool.color;
      ctx.fill();
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    // 3. Draw Pickups (Coins, Chaos Cores)
    this.drawPickups(ctx);

    // 4. Draw Bullets & Trails
    this.drawBullets(ctx);

    // 5. Draw Enemies
    this.drawEnemies(ctx);

    // 6. Draw Orbiting Saws
    if (this.orbitingSaws > 0) {
      this.drawOrbitingSaws(ctx);
    }

    // 7. Draw Player
    this.drawPlayer(ctx);

    // 8. Draw Particles
    this.drawParticles(ctx);

    // 9. Draw Floating Combat Numbers
    this.drawFloatingTexts(ctx);

    ctx.restore();
  }

  private drawArenaGrid(ctx: CanvasRenderingContext2D) {
    // Outer Arena Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, this.arenaWidth, this.arenaHeight);

    // Neon Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    for (let x = 0; x <= this.arenaWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.arenaHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= this.arenaHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.arenaWidth, y);
      ctx.stroke();
    }

    // Center Arena Insignia
    ctx.beginPath();
    ctx.arc(this.arenaWidth / 2, this.arenaHeight / 2, 160, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  private drawPickups(ctx: CanvasRenderingContext2D) {
    // Coins
    this.coins.forEach((c) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);

      if (c.type === 'gem') {
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
      } else if (c.type === 'gold') {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
      } else if (c.type === 'silver') {
        ctx.fillStyle = '#cbd5e1';
      } else {
        ctx.fillStyle = '#b45309';
      }

      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

    // Chaos Cores
    this.chaosCores.forEach((core) => {
      ctx.save();
      const scale = 1 + Math.sin(core.pulseTimer) * 0.15;
      ctx.beginPath();
      ctx.arc(core.x, core.y, core.radius * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    });
  }

  private drawBullets(ctx: CanvasRenderingContext2D) {
    this.bullets.forEach((b) => {
      ctx.save();

      // Bullet trail
      if (b.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(b.trail[0].x, b.trail[0].y);
        for (let i = 1; i < b.trail.length; i++) {
          ctx.lineTo(b.trail[i].x, b.trail[i].y);
        }
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.radius * 0.8;
        ctx.globalAlpha = 0.35;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    });
  }

  private drawEnemies(ctx: CanvasRenderingContext2D) {
    this.enemies.forEach((en) => {
      ctx.save();

      // Draw Telegraph lines if aiming
      if (en.isTelegraphing) {
        ctx.beginPath();
        if (en.type === 'sniper') {
          ctx.moveTo(en.x, en.y);
          ctx.lineTo(this.playerX, this.playerY);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.stroke();
        } else if (en.type === 'brute' && en.telegraphTargetX !== undefined) {
          ctx.moveTo(en.x, en.y);
          ctx.lineTo(en.telegraphTargetX, en.telegraphTargetY!);
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)';
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 5]);
          ctx.stroke();
        }
      }

      // Draw Character Body - NOT A BALL!
      this.drawDetailedEnemy(ctx, en);

      // Elite indicator halo
      if (en.isElite) {
        ctx.beginPath();
        ctx.arc(en.x, en.y, en.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Overhead health bar
      if (en.hp < en.maxHp) {
        const barW = en.radius * 2.2;
        const barH = 5;
        const barX = en.x - barW / 2;
        const barY = en.y - en.radius - 14;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(barX, barY, (en.hp / en.maxHp) * barW, barH);
      }

      ctx.restore();
    });
  }

  private drawDetailedEnemy(ctx: CanvasRenderingContext2D, en: Enemy) {
    ctx.save();
    ctx.translate(en.x, en.y);

    const faceAngle = Math.atan2(this.playerY - en.y, this.playerX - en.x);
    ctx.rotate(faceAngle);

    const hitFlash = en.hitFlash > 0;
    const bodyColor = hitFlash ? '#ffffff' : en.color;
    const secColor = hitFlash ? '#e2e8f0' : en.secondaryColor;

    if (en.type === 'swarmer') {
      // Swarmer Drone Insectoid: 2 fluttering wings, segmented shell, pincers, glowing red eye
      const wingFlutter = Math.sin(this.animTimer * 35) * 0.4;
      // Wings
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-4, -14, 12, 5, -0.4 + wingFlutter, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-4, 14, 12, 5, 0.4 - wingFlutter, 0, Math.PI * 2);
      ctx.fill();

      // Thorax & Abdomen
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(-6, 0, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pincers
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(8, -6);
      ctx.lineTo(16, -3);
      ctx.lineTo(8, -1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(16, 3);
      ctx.lineTo(8, 1);
      ctx.closePath();
      ctx.fill();

      // Glowing Eye
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(6, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (en.type === 'brute') {
      // Cyber Brute Golem: Heavy square chest, spiked pauldrons, giant fist gauntlets, glowing visor slit
      const fistSwing = Math.sin(this.animTimer * 8) * 6;

      // Heavy Fists
      ctx.fillStyle = secColor;
      ctx.fillRect(8, -26 + fistSwing, 14, 12);
      ctx.fillRect(8, 14 - fistSwing, 14, 12);
      // Spikes on fists
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(22, -24 + fistSwing, 4, 4);
      ctx.fillRect(22, 16 - fistSwing, 4, 4);

      // Torso Armor
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.roundRect(-20, -18, 30, 36, 6);
      ctx.fill();
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spiked Pauldrons
      ctx.fillStyle = secColor;
      ctx.fillRect(-14, -26, 12, 8);
      ctx.fillRect(-14, 18, 12, 8);

      // Angry Visor Slit
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillRect(2, -8, 6, 16);
    } else if (en.type === 'sniper') {
      // Spider Sniper Droid: 3 mechanical crawler legs, sleek rifle barrel, optic dome
      const legStep = Math.sin(this.animTimer * 10) * 4;

      // 3 Mechanical Legs
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 3;
      // Leg 1
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(-14, -18 + legStep);
      ctx.lineTo(-20, -12 + legStep);
      ctx.stroke();
      // Leg 2
      ctx.beginPath();
      ctx.moveTo(-6, 10);
      ctx.lineTo(-14, 18 - legStep);
      ctx.lineTo(-20, 12 - legStep);
      ctx.stroke();
      // Rear leg
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-22, 0);
      ctx.stroke();

      // Long Sniper Barrel
      ctx.fillStyle = '#334155';
      ctx.fillRect(4, -3, 24, 6);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(26, -2, 4, 4);

      // Sensor Body
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Purple Optical Lens
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(4, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (en.type === 'spitter') {
      // Toxic Alien Toad/Beetle: 4 splayed crawler legs, bloated pustule belly, gaping maw
      const crawl = Math.sin(this.animTimer * 10) * 3;

      // 4 Crawler Legs
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-4, -14);
      ctx.lineTo(-2, -22 + crawl);
      ctx.moveTo(-4, 14);
      ctx.lineTo(-2, 22 - crawl);
      ctx.moveTo(8, -12);
      ctx.lineTo(16, -20 - crawl);
      ctx.moveTo(8, 12);
      ctx.lineTo(16, 20 + crawl);
      ctx.stroke();

      // Bloated Belly
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(-2, 0, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Acid Pustules on Back
      ctx.fillStyle = '#a3e635';
      ctx.shadowColor = '#84cc16';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(-8, -5, 4, 0, Math.PI * 2);
      ctx.arc(-8, 5, 4, 0, Math.PI * 2);
      ctx.arc(-2, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Wide Maw
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(10, 0, 6, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
    } else if (en.type === 'boss') {
      // Boss: Giant Horned Cyber Skull Titan with snapping jaws, exhaust jets, and glowing horns!
      const jawSnap = Math.sin(this.animTimer * 6) * 4;

      // Turbo Exhaust Jets behind
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(-45, -20);
      ctx.lineTo(-65 + Math.random() * 8, -20);
      ctx.lineTo(-45, -12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-45, 12);
      ctx.lineTo(-65 + Math.random() * 8, 20);
      ctx.lineTo(-45, 20);
      ctx.closePath();
      ctx.fill();

      // Curved Cyber Horns
      ctx.fillStyle = secColor;
      ctx.beginPath();
      ctx.moveTo(-10, -35);
      ctx.quadraticCurveTo(10, -65, 30, -55);
      ctx.lineTo(20, -35);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-10, 35);
      ctx.quadraticCurveTo(10, 65, 30, 55);
      ctx.lineTo(20, 35);
      ctx.closePath();
      ctx.fill();

      // Main Cranium Armor
      ctx.fillStyle = bodyColor;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(-40, -35, 55, 70, 16);
      ctx.fill();
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Snapping Steel Jaw
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(8, -22 + jawSnap, 32, 44 - jawSnap * 2, 8);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Razor Teeth
      ctx.fillStyle = '#f1f5f9';
      for (let t = -16; t <= 16; t += 8) {
        ctx.beginPath();
        ctx.moveTo(12, t);
        ctx.lineTo(22, t + 4);
        ctx.lineTo(12, t + 8);
        ctx.closePath();
        ctx.fill();
      }

      // Fiery Red Eye Sockets
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(-5, -16, 10, 7, 0.2, 0, Math.PI * 2);
      ctx.ellipse(-5, 16, 10, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Center Reactor Core
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(-22, 0, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawOrbitingSaws(ctx: CanvasRenderingContext2D) {
    const sawDist = 75;
    for (let i = 0; i < this.orbitingSaws; i++) {
      const angle = this.orbitingSawAngle + (i / this.orbitingSaws) * Math.PI * 2;
      const sawX = this.playerX + Math.cos(angle) * sawDist;
      const sawY = this.playerY + Math.sin(angle) * sawDist;

      ctx.save();
      ctx.translate(sawX, sawY);
      ctx.rotate(this.orbitingSawAngle * 4);
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Saw teeth
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let t = 0; t < 6; t++) {
        ctx.rotate((Math.PI * 2) / 6);
        ctx.strokeRect(-2, -22, 4, 8);
      }
      ctx.restore();
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.playerX, this.playerY);

    const isAimingLeft = Math.cos(this.aimAngle) < 0;
    ctx.rotate(this.aimAngle);
    if (isAimingLeft) {
      // Prevents the character from being inverted upside down while aiming left!
      ctx.scale(1, -1);
    }
    ctx.scale(this.squashX, this.squashY);

    // Invulnerability Blink
    if (this.playerInvulnerable > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Ultimate Aura Glow
    if (this.isUltimateActive > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 25;
      ctx.fill();
    }

    // Shield Dome
    if (this.shieldCount > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.stroke();
    }

    // Character Model
    const colors = this.skin.colorScheme;
    const isMoving = Math.hypot(this.playerVx, this.playerVy) > 15;
    const walkBob = isMoving ? Math.sin(this.walkTimer) * 2.5 : Math.sin(this.animTimer * 3) * 1.2;
    const legSwing = isMoving ? Math.sin(this.walkTimer) * 14 : 0;
    const styleType = this.skin.styleType;

    if (this.character.id === 'cyber_pug') {
      this.drawCyberPug(ctx, colors, walkBob, legSwing, isMoving, styleType);
    } else if (this.character.id === 'dr_bananas') {
      this.drawDrBananas(ctx, colors, walkBob, legSwing, isMoving, styleType);
    } else if (this.character.id === 'mecha_rex') {
      this.drawMechaRex(ctx, colors, walkBob, legSwing, isMoving, styleType);
    } else if (this.character.id === 'glitch_phantom') {
      this.drawGlitchPhantom(ctx, colors, walkBob, legSwing, isMoving, styleType);
    } else if (this.character.id === 'neon_valkyrie') {
      this.drawNeonValkyrie(ctx, colors, walkBob, legSwing, isMoving, styleType);
    } else if (this.character.id === 'turbo_taco') {
      this.drawTurboTaco(ctx, colors, walkBob, legSwing, isMoving, styleType);
    } else {
      this.drawCyberPug(ctx, colors, walkBob, legSwing, isMoving, styleType);
    }

    ctx.restore();
  }

  // --- 1. CYBER PUG (Real Pug Body, Animated Paws, Wagging Tail, Floppy Ears, Snout, Visor) ---
  private drawCyberPug(
    ctx: CanvasRenderingContext2D,
    colors: Skin['colorScheme'],
    walkBob: number,
    legSwing: number,
    isMoving: boolean,
    styleType: string
  ) {
    ctx.save();
    ctx.translate(0, walkBob);

    // 4 Animated Cyber Paws
    ctx.fillStyle = colors.secondary;
    // Back paws
    ctx.beginPath();
    ctx.roundRect(-16, -16 - legSwing * 0.4, 10, 7, 3);
    ctx.roundRect(-16, 10 + legSwing * 0.4, 10, 7, 3);
    ctx.fill();
    // Front paws
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.roundRect(8, -15 + legSwing * 0.4, 11, 7, 3);
    ctx.roundRect(8, 9 - legSwing * 0.4, 11, 7, 3);
    ctx.fill();

    // Curled Pug Tail with wagging animation
    const tailWag = Math.sin(this.animTimer * 12) * 0.35;
    ctx.save();
    ctx.translate(-20, 0);
    ctx.rotate(tailWag);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -6, 8, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.restore();

    // Chubby Pug Torso (with Cyber Armor Vest)
    ctx.fillStyle = colors.primary;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cyber Harness & Reactor Core
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, -12, 10, 24);
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(-3, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Shoulder Plasma Blasters
    ctx.fillStyle = '#475569';
    ctx.fillRect(-2, -18, 18, 5);
    ctx.fillRect(-2, 13, 18, 5);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(16, -18, 3, 5);
    ctx.fillRect(16, 13, 3, 5);

    // Pug Head
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.ellipse(12, 0, 13, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floppy Pug Ears
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(8, -13, 6, 9, -0.3 + (isMoving ? Math.sin(this.animTimer * 10) * 0.2 : 0), 0, Math.PI * 2);
    ctx.ellipse(8, 13, 6, 9, 0.3 - (isMoving ? Math.sin(this.animTimer * 10) * 0.2 : 0), 0, Math.PI * 2);
    ctx.fill();

    // Black Pug Snout
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(18, 0, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute Open Mouth & Pink Tongue
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(22, 2, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Big Pug Eyes & Cyber Visor Monocle
    // Left eye (Natural)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14, -6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(16, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Right eye (Cyber HUD Lens)
    ctx.fillStyle = colors.accent;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(14, 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Skin Hat / Accessory
    if (styleType === 'gold') {
      // Golden Crown
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(10, -8);
      ctx.lineTo(8, -16);
      ctx.lineTo(12, -12);
      ctx.lineTo(15, -18);
      ctx.lineTo(17, -12);
      ctx.lineTo(20, -16);
      ctx.lineTo(18, -8);
      ctx.closePath();
      ctx.fill();
    } else if (styleType === 'void') {
      // Void Demon Horns
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.quadraticCurveTo(4, -18, 12, -22);
      ctx.lineTo(12, -10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // --- 2. DR. QUANTUM BANANAS (Chimp Scientist, Lab Coat, Glasses, Furry Tail, Banana Blaster) ---
  private drawDrBananas(
    ctx: CanvasRenderingContext2D,
    colors: Skin['colorScheme'],
    walkBob: number,
    legSwing: number,
    isMoving: boolean,
    styleType: string
  ) {
    ctx.save();
    ctx.translate(0, walkBob);

    // Monkey Feet in Red Sneakers
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-12, -16 - legSwing * 0.4, 12, 7);
    ctx.fillRect(-12, 9 + legSwing * 0.4, 12, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -16 - legSwing * 0.4, 3, 7);
    ctx.fillRect(-2, 9 + legSwing * 0.4, 3, 7);

    // Long Curling Ape Tail
    const tailWiggle = Math.sin(this.animTimer * 5) * 6;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.quadraticCurveTo(-28, tailWiggle, -30, -14);
    ctx.stroke();

    // Scientist White Lab Coat (Body)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-14, -12, 22, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Lab Coat Collar & Buttons
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-2, -12, 4, 24);
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, -6, 2, 0, Math.PI * 2);
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.arc(0, 6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Left Arm holding Bubbling Flask
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-4, -18, 12, 5);
    // Erlenmeyer Flask
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(8, -18);
    ctx.lineTo(14, -14);
    ctx.lineTo(14, -22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#10b981'; // green glowing formula
    ctx.fillRect(10, -18, 4, 4);

    // Right Arm wielding Banana Launcher Cannon
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 12, 14, 5);
    // Yellow Banana Cannon
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(10, 10, 18, 8, 4);
    ctx.fill();

    // Chimp Head
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(10, 0, 13, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Big Chimp Ears
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(6, -14, 6, 0, Math.PI * 2);
    ctx.arc(6, 14, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(6, -14, 3, 0, Math.PI * 2);
    ctx.arc(6, 14, 3, 0, Math.PI * 2);
    ctx.fill();

    // Peach Muzzle & Tooth Grin
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(16, 0, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Funny smiling teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(17, -3, 4, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(19, -3, 1, 6);

    // Wild Mad Scientist Hair (Einstein Tufts!)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(3, -10, 5, 0, Math.PI * 2);
    ctx.arc(0, -5, 6, 0, Math.PI * 2);
    ctx.arc(3, 10, 5, 0, Math.PI * 2);
    ctx.arc(0, 5, 6, 0, Math.PI * 2);
    ctx.fill();

    // Round Scientist Glasses / Goggles
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.arc(14, -5, 4.5, 0, Math.PI * 2);
    ctx.arc(14, 5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // --- 3. MECHA REX (Armored T-Rex, Hydraulic Legs, Spiked Tail Mace, Snapping Jaws, Railguns) ---
  private drawMechaRex(
    ctx: CanvasRenderingContext2D,
    colors: Skin['colorScheme'],
    walkBob: number,
    legSwing: number,
    isMoving: boolean,
    styleType: string
  ) {
    ctx.save();
    ctx.translate(0, walkBob);

    // Hydraulic Dinosaur Legs with 3 Steel Razor Talons
    ctx.fillStyle = '#334155';
    // Left leg
    ctx.beginPath();
    ctx.roundRect(-10, -22 - legSwing * 0.4, 18, 9, 3);
    ctx.roundRect(-10, 13 + legSwing * 0.4, 18, 9, 3);
    ctx.fill();
    // Sharp Talons
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(6, -23 - legSwing * 0.4, 4, 3);
    ctx.fillRect(6, -18 - legSwing * 0.4, 4, 3);
    ctx.fillRect(6, 14 + legSwing * 0.4, 4, 3);
    ctx.fillRect(6, 19 + legSwing * 0.4, 4, 3);

    // Heavy Articulated Spiked Tail Mace
    const tailSwing = Math.sin(this.animTimer * 6) * 8;
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.moveTo(-18, -6);
    ctx.lineTo(-34, -4 + tailSwing * 0.5);
    ctx.lineTo(-46, tailSwing);
    ctx.lineTo(-34, 4 + tailSwing * 0.5);
    ctx.lineTo(-18, 6);
    ctx.closePath();
    ctx.fill();
    // Spiked mace ball on tail tip
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(-48, tailSwing, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.accent;
    ctx.fillRect(-53, tailSwing - 2, 4, 4);

    // Armored Torso with Glowing Heat Exhaust Vents
    ctx.fillStyle = colors.primary;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(-20, -14, 30, 28, 8);
    ctx.fill();
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Twin Dorsal Heavy Railguns
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, -20, 24, 6);
    ctx.fillRect(-12, 14, 24, 6);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(10, -19, 4, 4);
    ctx.fillRect(10, 15, 4, 4);

    // Tiny Funny T-Rex Arms
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(4, -8, 8, 4);
    ctx.fillRect(4, 4, 8, 4);

    // Roaring Robotic T-Rex Head with Snapping Jaws
    const jawSnap = Math.sin(this.animTimer * 8) * 3;
    ctx.fillStyle = colors.primary;
    // Upper Jaw & Cranium
    ctx.beginPath();
    ctx.moveTo(8, -12);
    ctx.lineTo(28, -8);
    ctx.lineTo(34, -3);
    ctx.lineTo(24, 0);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();

    // Lower Jaw
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(24, 0);
    ctx.lineTo(32, 4 + jawSnap);
    ctx.lineTo(26, 10 + jawSnap);
    ctx.lineTo(8, 12);
    ctx.closePath();
    ctx.fill();

    // Sharp Razor Teeth
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(16, -2, 2, 4);
    ctx.fillRect(22, -2, 2, 4);
    ctx.fillRect(28, -2, 2, 4);

    // Glowing Predator Eye Lens
    ctx.fillStyle = colors.accent;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(18, -7, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- 4. GLITCH PHANTOM (Holographic Cloak, Cyber Mask, Disembodied Hands, Code Runes) ---
  private drawGlitchPhantom(
    ctx: CanvasRenderingContext2D,
    colors: Skin['colorScheme'],
    walkBob: number,
    legSwing: number,
    isMoving: boolean,
    styleType: string
  ) {
    ctx.save();
    ctx.translate(0, walkBob);

    // Glitching Cloak Trails (Disintegrating into pixels)
    const flicker = (Math.random() - 0.5) * 4;
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(-24 + flicker, -18);
    ctx.lineTo(-32 + flicker, -6);
    ctx.lineTo(-26 + flicker, 0);
    ctx.lineTo(-32 + flicker, 8);
    ctx.lineTo(-22 + flicker, 16);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.fill();

    // Orbiting Binary Glitch Blocks
    ctx.fillStyle = colors.accent;
    ctx.font = "bold 9px monospace";
    ctx.fillText("01", -28, -18 + Math.sin(this.animTimer * 8) * 4);
    ctx.fillText("NULL", -32, 18 + Math.cos(this.animTimer * 8) * 4);

    // Disembodied Floating Mechanical Gauntlets with Electric Arcs
    const handFloat = Math.sin(this.animTimer * 10) * 3;
    ctx.fillStyle = colors.primary;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 10;
    ctx.fillRect(2, -22 + handFloat, 10, 8);
    ctx.fillRect(2, 14 - handFloat, 10, 8);

    // Floating Beam Cannon on Right
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(12, 12, 16, 6);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(26, 13, 4, 4);

    // Cyber Hood & Menacing Digital Visor Mask
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(8, 0, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing Evil Digital Slit Eyes
    ctx.fillStyle = colors.accent;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 12;
    ctx.fillRect(12, -7, 5, 3);
    ctx.fillRect(12, 4, 5, 3);

    // Horizontal Scanning Lines across visor
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(18, -4);
    ctx.moveTo(8, 2);
    ctx.lineTo(18, 2);
    ctx.stroke();

    ctx.restore();
  }

  // --- 5. NEON VALKYRIE (Mecha Anime Angel, Plasma Wings, Flowing Cyber Hair, Halo) ---
  private drawNeonValkyrie(
    ctx: CanvasRenderingContext2D,
    colors: Skin['colorScheme'],
    walkBob: number,
    legSwing: number,
    isMoving: boolean,
    styleType: string
  ) {
    ctx.save();
    ctx.translate(0, walkBob);

    // Large Articulated Plasma Wings (Flapping rhythm)
    const wingFlap = Math.sin(this.animTimer * 7) * 0.25;
    ctx.save();
    ctx.fillStyle = colors.accent;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 15;
    // Upper Wing Blades
    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.quadraticCurveTo(-14, -32 + wingFlap * 15, 6, -38 + wingFlap * 20);
    ctx.lineTo(-2, -20);
    ctx.closePath();
    ctx.fill();
    // Lower Wing Blades
    ctx.beginPath();
    ctx.moveTo(-6, 10);
    ctx.quadraticCurveTo(-14, 32 - wingFlap * 15, 6, 38 - wingFlap * 20);
    ctx.lineTo(-2, 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Running Armored Boots
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-10, -12 - legSwing * 0.35, 12, 6);
    ctx.fillRect(-10, 6 + legSwing * 0.35, 12, 6);

    // Slender Humanoid Mecha Torso
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.ellipse(-2, 0, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Arc Reactor on Chest
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(4, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Twin-Barrel Plasma Rifle in Hands
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 2, 22, 6);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(28, 3, 4, 4);

    // Mecha Helmet
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(8, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Flowing Cybernetic Hair Streamers (Billowing behind)
    const hairSway = Math.sin(this.animTimer * 8) * 4;
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.quadraticCurveTo(-14, -12 + hairSway, -24, -8 + hairSway);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();

    // Glowing Cyan Visor
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(12, -4, 4, 8);

    // Radiant Plasma Halo hovering above
    ctx.strokeStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(8, -16, 7, 3, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // --- 6. TURBO TACO (Sentient Taco, Sombrero with Fringe, Lettuce, Cheese, Cowboy Boots, Mustache) ---
  private drawTurboTaco(
    ctx: CanvasRenderingContext2D,
    colors: Skin['colorScheme'],
    walkBob: number,
    legSwing: number,
    isMoving: boolean,
    styleType: string
  ) {
    ctx.save();
    ctx.translate(0, walkBob);

    // Cowboy Boots with Golden Spurs running underneath
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-12, -15 - legSwing * 0.4, 11, 7);
    ctx.fillRect(-12, 8 + legSwing * 0.4, 11, 7);
    // Golden Spurs
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-13, -12 - legSwing * 0.4, 2.5, 0, Math.PI * 2);
    ctx.arc(-13, 11 + legSwing * 0.4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Golden Folded Taco Shell Body
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(-2, 0, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Taco Fillings (Wavy Green Lettuce, Cheddar Cheese, Diced Red Tomato)
    ctx.fillStyle = '#22c55e'; // Lettuce
    ctx.beginPath();
    ctx.arc(-6, -12, 5, 0, Math.PI * 2);
    ctx.arc(2, -13, 6, 0, Math.PI * 2);
    ctx.arc(8, -12, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444'; // Red Tomato cubes
    ctx.fillRect(-4, -15, 4, 4);
    ctx.fillRect(4, -16, 4, 4);

    ctx.fillStyle = '#fde047'; // Shredded Cheddar Cheese
    ctx.fillRect(-8, -11, 8, 2);
    ctx.fillRect(0, -12, 8, 2);

    // Dual Hot Sauce Bottle Rocket Blasters
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(8, -14, 16, 5);
    ctx.fillRect(8, 9, 16, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, -14, 3, 5);
    ctx.fillRect(22, 9, 3, 5);

    // Badass Outlaw Mustache!
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.quadraticCurveTo(18, -6, 24, -8);
    ctx.quadraticCurveTo(18, -2, 14, 0);
    ctx.quadraticCurveTo(18, 2, 24, 8);
    ctx.quadraticCurveTo(18, 6, 14, 0);
    ctx.fill();

    // Dark Aviator Sunglasses
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, -8, 6, 6);
    ctx.fillRect(10, 2, 6, 6);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, -8, 6, 6);
    ctx.strokeRect(10, 2, 6, 6);

    // Giant Wide-Brim Mexican Sombrero with Dangling Fringe Pom-Poms
    ctx.save();
    ctx.translate(0, 0);
    // Sombrero Brim
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sombrero Crown/Cone
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.ellipse(-4, 0, 7, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dangling Fringe Pom-Poms around brim
    const pomSway = Math.sin(this.animTimer * 10) * 2;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -22 + pomSway, 2.5, 0, Math.PI * 2);
    ctx.arc(0, 22 - pomSway, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'ring') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private drawFloatingTexts(ctx: CanvasRenderingContext2D) {
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.font = `${ft.isCrit ? 'bold' : 'normal'} ${ft.size}px 'Outfit', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }
}
