/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Coins, Sparkles, Check } from 'lucide-react';
import { PermanentUpgrade, PlayerStats } from '../game/types';
import { PERMANENT_UPGRADES } from '../game/data';
import { sounds } from '../game/audio';

interface ArmoryShopProps {
  stats: PlayerStats;
  onBuyUpgrade: (upgrade: PermanentUpgrade, cost: number) => void;
  onClose: () => void;
}

export const ArmoryShop: React.FC<ArmoryShopProps> = ({ stats, onBuyUpgrade, onClose }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 bg-slate-950/95 overflow-y-auto select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between w-full max-w-5xl mx-auto mb-6">
        <button
          onClick={() => {
            sounds.uiClick();
            onClose();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Arena</span>
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Armory & Permanent Upgrades</span>
          </h1>
          <p className="text-xs text-slate-400">Power up your stats across all crazy characters using coin bounties!</p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono-numbers">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm sm:text-base">{stats.coins.toLocaleString()}</span>
        </div>
      </header>

      {/* Upgrades Grid */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-auto">
        {PERMANENT_UPGRADES.map((upg) => {
          const currentLevel = stats.upgrades[upg.id] || 0;
          const isMaxed = currentLevel >= upg.maxLevel;
          const nextCost = Math.round(upg.baseCost * Math.pow(upg.costMultiplier, currentLevel));
          const canAfford = stats.coins >= nextCost && !isMaxed;

          return (
            <div
              key={upg.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                isMaxed
                  ? 'bg-slate-900/40 border-slate-800 opacity-90'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Icon + Name + Tier */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{upg.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{upg.name}</h3>
                      <span className="text-[11px] font-mono-numbers text-slate-400">
                        Tier {currentLevel} / {upg.maxLevel}
                      </span>
                    </div>
                  </div>

                  {isMaxed && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                      MAX
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{upg.description}</p>

                {/* Level Progress Pip Bars */}
                <div className="flex items-center gap-1.5 mb-4">
                  {Array.from({ length: upg.maxLevel }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full ${
                        idx < currentLevel
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Purchase Button */}
              <div>
                {isMaxed ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800/60 text-emerald-400 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Maximum Tier Reached</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sounds.uiClick();
                      onBuyUpgrade(upg, nextCost);
                    }}
                    disabled={!canAfford}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase font-mono-numbers tracking-wide transition-all flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Upgrade: {nextCost.toLocaleString()} Coins</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <footer className="text-center py-2 text-xs text-slate-500">
        All upgrades persist forever and apply instantly across every run and character.
      </footer>
    </div>
  );
};
