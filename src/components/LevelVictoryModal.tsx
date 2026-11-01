/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Trophy, Coins, Skull, ArrowRight, Sparkles, Home, ShieldAlert } from 'lucide-react';
import { sounds } from '../game/audio';

interface LevelVictoryModalProps {
  level: number;
  clearBonus: number;
  kills: number;
  totalRunCoins: number;
  totalBankCoins: number;
  onNextLevel: () => void;
  onOpenArmory: () => void;
  onReturnTitle: () => void;
  onWatchAdForCoins?: () => void;
}

export const LevelVictoryModal: React.FC<LevelVictoryModalProps> = ({
  level,
  clearBonus,
  kills,
  totalRunCoins,
  totalBankCoins,
  onNextLevel,
  onOpenArmory,
  onReturnTitle,
  onWatchAdForCoins,
}) => {
  const [animatedCoins, setAnimatedCoins] = useState(0);

  // Dynamic counter rollup effect
  useEffect(() => {
    let start = 0;
    const end = totalRunCoins;
    const duration = 1200;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setAnimatedCoins(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [totalRunCoins]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col items-center">
        {/* Victory Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.5)] mb-4 animate-bounce">
          <Trophy className="w-9 h-9 fill-current" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
          Arena Cleared
        </span>
        <h2 className="text-3xl font-black uppercase text-white mt-1 tracking-tight">
          LEVEL {level} VICTORY!
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Sector pacified. Massive bounty reward deposited into your vault!
        </p>

        {/* Reward Card */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 my-6 flex flex-col gap-3 font-mono-numbers text-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-sans">
              <Skull className="w-4 h-4 text-rose-400" /> Hostiles Defeated
            </span>
            <span className="font-bold text-slate-200">{kills}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-sans">
              <Sparkles className="w-4 h-4 text-amber-400" /> Clear Bounty Chest
            </span>
            <span className="font-bold text-amber-300">+{clearBonus} Coins</span>
          </div>

          <div className="h-px bg-slate-800 my-0.5" />

          {/* Animated Total Rollup */}
          <div className="flex items-center justify-between text-base">
            <span className="font-sans font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" /> Reward Collected
            </span>
            <span className="font-extrabold text-xl text-amber-400">
              +{animatedCoins.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Bank Total Reminder */}
        <div className="text-xs text-slate-400 mb-6 flex items-center gap-2 font-mono-numbers">
          <span>Total Vault Balance:</span>
          <span className="font-bold text-amber-300">{totalBankCoins.toLocaleString()} Coins</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Primary: Continue to Unlimited Next Level */}
          <button
            onClick={() => {
              sounds.uiClick();
              onNextLevel();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Level {level + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* CrazyGames Rewarded Ad Bonus */}
          {onWatchAdForCoins && (
            <button
              onClick={onWatchAdForCoins}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Watch CrazyGames Ad (+500 Free Coins)</span>
            </button>
          )}

          {/* Secondary: Armory Upgrades */}
          <button
            onClick={() => {
              sounds.uiClick();
              onOpenArmory();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Spend Coins in Armory</span>
          </button>

          {/* Tertiary: Return to Title Screen */}
          <button
            onClick={() => {
              sounds.uiClick();
              onReturnTitle();
            }}
            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Title Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
