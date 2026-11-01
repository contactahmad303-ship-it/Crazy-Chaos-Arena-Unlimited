/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pause, Shield, Zap, Skull, Coins, Target } from 'lucide-react';
import { sounds } from '../game/audio';

interface GameHUDProps {
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpToNext: number;
  coinsCollectedThisRun: number;
  totalCoins: number;
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
  onPause: () => void;
  characterIcon: string;
  ultimateName: string;
  autoFire: boolean;
  onToggleAutoFire: () => void;
  onTriggerUltimate: () => void;
  onTriggerDash: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hp,
  maxHp,
  level,
  xp,
  xpToNext,
  coinsCollectedThisRun,
  totalCoins,
  kills,
  targetKills,
  objectiveType,
  coresCollected,
  targetCores,
  bossHp,
  bossMaxHp,
  ultimateCharge,
  ultimateMax,
  shieldActive,
  onPause,
  characterIcon,
  ultimateName,
  autoFire,
  onToggleAutoFire,
  onTriggerUltimate,
  onTriggerDash,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const xpPercent = Math.max(0, Math.min(100, (xp / xpToNext) * 100));
  const ultPercent = Math.max(0, Math.min(100, (ultimateCharge / ultimateMax) * 100));
  const isUltReady = ultimateCharge >= ultimateMax;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none font-sans">
      {/* Top Perimeter Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Player Vital Health Bar & Shield */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 px-3.5 py-2.5 rounded-xl pointer-events-auto shadow-lg">
          <div className="text-2xl">{characterIcon}</div>
          <div className="flex flex-col gap-1 w-32 sm:w-44">
            <div className="flex items-center justify-between text-xs font-mono-numbers">
              <span className="font-bold text-slate-300">HP</span>
              <span className={hpPercent < 25 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {hp}/{maxHp}
              </span>
            </div>
            {/* Health Meter */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-150 ${
                  hpPercent < 25
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    : hpPercent < 50
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            {/* Run XP Progress */}
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-cyan-400 transition-all duration-150"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Kinetic Shield Indicator */}
          {shieldActive && (
            <div className="flex items-center text-cyan-400" title="Aegis Shield Absorber Active">
              <Shield className="w-4 h-4 fill-cyan-400/20" />
            </div>
          )}
        </div>

        {/* Top-Center: Level & Mission Objective */}
        <div className="flex flex-col items-center">
          {/* Level Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-full shadow-md">
            <span className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider">
              Level {level}
            </span>
          </div>

          {/* Mission Target Objective */}
          {objectiveType === 'SURVIVE_KILLS' && (
            <div className="mt-1.5 flex items-center gap-2 text-xs font-mono-numbers bg-slate-950/70 border border-slate-800/60 px-3 py-0.5 rounded-md text-slate-300">
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              <span>
                Target: {kills}/{targetKills}
              </span>
            </div>
          )}

          {objectiveType === 'COLLECT_CORES' && (
            <div className="mt-1.5 flex items-center gap-2 text-xs font-mono-numbers bg-slate-950/70 border border-cyan-800/40 px-3 py-0.5 rounded-md text-cyan-300">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Cores: {coresCollected}/{targetCores}
              </span>
            </div>
          )}

          {objectiveType === 'CHAOS_RUSH' && (
            <div className="mt-1.5 flex items-center gap-2 text-xs font-mono-numbers bg-slate-950/70 border border-amber-800/40 px-3 py-0.5 rounded-md text-amber-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Frenzy Kills: {kills}/{targetKills}</span>
            </div>
          )}

          {/* Boss Encounter Health Bar */}
          {objectiveType === 'BOSS_HUNT' && bossHp !== undefined && bossMaxHp !== undefined && (
            <div className="mt-2 flex flex-col items-center w-64 sm:w-80 bg-slate-950/90 border border-rose-900/60 p-2 rounded-lg">
              <div className="flex items-center justify-between w-full text-xs font-mono-numbers text-rose-400 font-bold mb-1">
                <span className="flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5 text-rose-500" /> BOSS TITAN
                </span>
                <span>{bossHp}/{bossMaxHp}</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-rose-950">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_12px_#dc2626] transition-all duration-100"
                  style={{ width: `${Math.max(0, Math.min(100, (bossHp / bossMaxHp) * 100))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top-Right: Coins & Pause Controls */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Coin Loot Counter */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/20 px-3 py-1.5 rounded-xl font-mono-numbers text-amber-300 text-sm shadow-md">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-bold">+{coinsCollectedThisRun}</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={() => {
              sounds.uiClick();
              onPause();
            }}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors shadow-md"
            title="Pause Game (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Perimeter Cluster: Ultimate meter, Dash, and mobile touch buttons */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom-Left: Ultimate Ability & Dash Readiness */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Ultimate Button / Status */}
          <button
            onClick={() => {
              if (isUltReady) {
                onTriggerUltimate();
              }
            }}
            disabled={!isUltReady}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              isUltReady
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.4)] cursor-pointer scale-105 active:scale-95'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Zap className={`w-4 h-4 ${isUltReady ? 'text-amber-300 animate-bounce' : 'text-slate-400'}`} />
            <span>{ultimateName}</span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">[Space]</span>
            {/* Charge overlay */}
            {!isUltReady && (
              <div
                className="absolute inset-x-0 bottom-0 h-1 bg-amber-500/60 rounded-b-xl transition-all"
                style={{ width: `${ultPercent}%` }}
              />
            )}
          </button>

          {/* Dash Action Hint */}
          <button
            onClick={() => {
              onTriggerDash();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <span>DASH</span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">[Shift]</span>
          </button>
        </div>

        {/* Bottom-Right: Auto-fire toggle & Touch shortcuts */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              sounds.uiClick();
              onToggleAutoFire();
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              autoFire
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Auto-Fire: {autoFire ? 'ON' : 'OFF'}
          </button>

          {/* Mobile Dash / Ult buttons */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => onTriggerDash()}
              className="px-3 py-2 rounded-xl bg-blue-600/80 text-white font-bold text-xs"
            >
              Dash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
