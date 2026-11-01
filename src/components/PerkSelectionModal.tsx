/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { InGamePerk } from '../game/types';
import { sounds } from '../game/audio';
import { Sparkles } from 'lucide-react';

interface PerkSelectionModalProps {
  perks: InGamePerk[];
  onSelectPerk: (perk: InGamePerk) => void;
}

export const PerkSelectionModal: React.FC<PerkSelectionModalProps> = ({ perks, onSelectPerk }) => {
  // Allow hotkeys 1, 2, 3 for keyboard warriors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' && perks[0]) {
        sounds.uiClick();
        onSelectPerk(perks[0]);
      } else if (e.key === '2' && perks[1]) {
        sounds.uiClick();
        onSelectPerk(perks[1]);
      } else if (e.key === '3' && perks[2]) {
        sounds.uiClick();
        onSelectPerk(perks[2]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [perks, onSelectPerk]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-extrabold uppercase tracking-widest mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Level Up Upgrade</span>
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
          CHOOSE YOUR CHAOS PERK
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Equip an instant tactical modifier to conquer this arena sector!
        </p>

        {/* 3 Perk Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
          {perks.map((perk, index) => {
            const tierColors = {
              common: 'border-slate-700 bg-slate-950/80 hover:border-cyan-400',
              rare: 'border-blue-500/40 bg-blue-950/20 hover:border-blue-400',
              epic: 'border-purple-500/40 bg-purple-950/20 hover:border-purple-400',
              legendary: 'border-amber-500/50 bg-amber-950/30 hover:border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]',
            };

            const tierBadge = {
              common: 'text-slate-400',
              rare: 'text-blue-400',
              epic: 'text-purple-400',
              legendary: 'text-amber-400 font-bold',
            };

            return (
              <button
                key={perk.id}
                onClick={() => {
                  sounds.uiClick();
                  onSelectPerk(perk);
                }}
                className={`p-4 rounded-xl border flex flex-col items-center text-center justify-between transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer group ${
                  tierColors[perk.tier]
                }`}
              >
                <div>
                  <div className="text-4xl my-2 group-hover:scale-110 transition-transform">
                    {perk.icon}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider ${tierBadge[perk.tier]}`}>
                    {perk.tier}
                  </span>
                  <h3 className="text-sm font-black text-white mt-1 group-hover:text-cyan-300 transition-colors">
                    {perk.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {perk.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80 w-full text-[11px] text-cyan-400/80 font-mono-numbers">
                  Press [{index + 1}] or Click
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
