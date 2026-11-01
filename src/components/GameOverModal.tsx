/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, Skull, Coins, Sparkles, Home } from 'lucide-react';
import { sounds } from '../game/audio';

interface GameOverModalProps {
  level: number;
  kills: number;
  coinsEarned: number;
  totalCoins: number;
  onRetry: () => void;
  onOpenArmory: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  kills,
  coinsEarned,
  totalCoins,
  onRetry,
  onOpenArmory,
  onReturnTitle,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/90 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-rose-900/40 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(225,29,72,0.25)] flex flex-col items-center">
        {/* Skull Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-500 mb-4">
          <Skull className="w-9 h-9" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
          Chassis Destroyed
        </span>
        <h2 className="text-3xl font-black uppercase text-white mt-1 tracking-tight">
          SECTOR OVERRUN
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Fell in battle during Level {level}. All salvaged coins are preserved in your vault!
        </p>

        {/* Telemetry Box */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 my-6 flex flex-col gap-2.5 font-mono-numbers text-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-sans">Level Reached</span>
            <span className="font-bold text-white">Level {level}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="font-sans">Hostiles Defeated</span>
            <span className="font-bold text-slate-200">{kills}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="font-sans flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" /> Coins Salvaged
            </span>
            <span className="font-bold text-amber-400">+{coinsEarned}</span>
          </div>

          <div className="h-px bg-slate-800 my-1" />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-sans">Vault Balance</span>
            <span className="font-bold text-amber-300">{totalCoins.toLocaleString()} Coins</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              sounds.uiClick();
              onRetry();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again (Level {level})</span>
          </button>

          <button
            onClick={() => {
              sounds.uiClick();
              onOpenArmory();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Upgrade Stats in Armory</span>
          </button>

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
