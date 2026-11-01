/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Coins, Check, Lock, Zap, Shield, Heart, FastForward, Sparkles } from 'lucide-react';
import { CharacterDef, PlayerStats, Skin } from '../game/types';
import { CRAZY_CHARACTERS } from '../game/data';
import { sounds } from '../game/audio';
import { CharacterCanvasPreview } from './CharacterCanvasPreview';

interface CharacterLockerProps {
  stats: PlayerStats;
  onSelectCharacter: (charId: string) => void;
  onSelectSkin: (charId: string, skinId: string) => void;
  onUnlockCharacter: (char: CharacterDef) => void;
  onUnlockSkin: (skin: Skin) => void;
  onClose: () => void;
}

export const CharacterLocker: React.FC<CharacterLockerProps> = ({
  stats,
  onSelectCharacter,
  onSelectSkin,
  onUnlockCharacter,
  onUnlockSkin,
  onClose,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(stats.selectedCharacterId);

  const activeChar = CRAZY_CHARACTERS.find((c) => c.id === selectedCharId) || CRAZY_CHARACTERS[0];
  const isCharUnlocked = stats.unlockedCharacters.includes(activeChar.id);
  const activeSkinId = stats.selectedSkinId[activeChar.id] || activeChar.skins[0].id;
  const activeSkin = activeChar.skins.find((s) => s.id === activeSkinId) || activeChar.skins[0];

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 bg-slate-950/95 overflow-y-auto select-none">
      {/* Top Bar: Back & Coins balance */}
      <header className="flex items-center justify-between w-full max-w-6xl mx-auto mb-6">
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
          <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            Crazy Roster & Skin Locker
          </h1>
          <p className="text-xs text-slate-400">Unlock insane heroes and hyper-chromatic skins with coins!</p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono-numbers">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm sm:text-base">{stats.coins.toLocaleString()}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
        {/* Left Column: Characters Selection Carousel/Grid */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Choose Character
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CRAZY_CHARACTERS.map((char) => {
              const unlocked = stats.unlockedCharacters.includes(char.id);
              const isSelected = char.id === selectedCharId;
              const isEquipped = char.id === stats.selectedCharacterId;

              return (
                <button
                  key={char.id}
                  onClick={() => {
                    sounds.uiClick();
                    setSelectedCharId(char.id);
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02]'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-3xl my-1">{char.icon}</div>
                  <span className="text-xs font-bold text-white text-center line-clamp-1">
                    {char.name}
                  </span>

                  <div className="mt-2 text-[11px] font-mono-numbers">
                    {unlocked ? (
                      isEquipped ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Equipped
                        </span>
                      ) : (
                        <span className="text-slate-400">Ready</span>
                      )
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {char.price} Coins
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Character Action Button (Unlock or Equip) */}
          <div className="mt-2">
            {!isCharUnlocked ? (
              <button
                onClick={() => {
                  sounds.uiClick();
                  onUnlockCharacter(activeChar);
                }}
                disabled={stats.coins < activeChar.price}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  stats.coins >= activeChar.price
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 shadow-[0_0_18px_rgba(245,158,11,0.4)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Unlock {activeChar.name} ({activeChar.price} Coins)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sounds.uiClick();
                  onSelectCharacter(activeChar.id);
                }}
                disabled={stats.selectedCharacterId === activeChar.id}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  stats.selectedCharacterId === activeChar.id
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                }`}
              >
                {stats.selectedCharacterId === activeChar.id ? 'Currently Equipped' : `Equip ${activeChar.name}`}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Character Specs & Skin Wardrobe */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          {/* Active Character Bio Header */}
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <CharacterCanvasPreview charId={activeChar.id} skin={activeSkin} size={88} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{activeChar.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/20 font-mono-numbers">
                  {activeChar.projectileType.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-amber-400 font-semibold">{activeChar.title}</p>
              <p className="text-xs text-slate-300 mt-1">{activeChar.description}</p>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-3 gap-2 font-mono-numbers text-xs">
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-[10px] font-sans text-slate-400 uppercase">Health</div>
                <div className="font-bold text-white">{activeChar.baseHp} HP</div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
              <FastForward className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] font-sans text-slate-400 uppercase">Speed</div>
                <div className="font-bold text-white">{activeChar.baseSpeed}</div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] font-sans text-slate-400 uppercase">Damage</div>
                <div className="font-bold text-white">{activeChar.baseDamage}</div>
              </div>
            </div>
          </div>

          {/* Passive & Ultimate */}
          <div className="flex flex-col gap-2 bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl text-xs">
            <div>
              <span className="font-bold text-cyan-400">Passive: </span>
              <span className="text-slate-300">{activeChar.passiveDesc}</span>
            </div>
            <div>
              <span className="font-bold text-amber-400">Ultimate ({activeChar.ultimateName}): </span>
              <span className="text-slate-300">{activeChar.ultimateDesc}</span>
            </div>
          </div>

          {/* Crazy Skins Carousel */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Crazy Skins for {activeChar.name}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {activeChar.skins.map((skin) => {
                const isSkinUnlocked = stats.unlockedSkins.includes(skin.id);
                const isEquipped = activeSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between text-left transition-all ${
                      isEquipped
                        ? 'bg-slate-800 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div>
                      {/* Color Preview Swatch */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: skin.colorScheme.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: skin.colorScheme.accent }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white block line-clamp-1">
                        {skin.name}
                      </span>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                        {skin.description}
                      </p>
                    </div>

                    <div className="mt-3">
                      {isSkinUnlocked ? (
                        <button
                          onClick={() => {
                            sounds.uiClick();
                            onSelectSkin(activeChar.id, skin.id);
                          }}
                          disabled={isEquipped}
                          className={`w-full py-1.5 px-2 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-colors ${
                            isEquipped
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                          }`}
                        >
                          {isEquipped ? 'Equipped' : 'Wear Skin'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            sounds.uiClick();
                            onUnlockSkin(skin);
                          }}
                          disabled={stats.coins < skin.price}
                          className={`w-full py-1.5 px-2 rounded-lg font-bold text-[10px] uppercase font-mono-numbers transition-colors ${
                            stats.coins >= skin.price
                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Unlock: {skin.price} Coins
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
