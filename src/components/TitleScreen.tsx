/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Shield, Users, Volume2, VolumeX, Sparkles, Trophy, Skull, Coins, Flame } from 'lucide-react';
import { PlayerStats, DifficultyMode } from '../game/types';
import { CRAZY_CHARACTERS, DIFFICULTY_PRESETS } from '../game/data';
import { sounds } from '../game/audio';
import { CharacterCanvasPreview } from './CharacterCanvasPreview';

interface TitleScreenProps {
  stats: PlayerStats;
  onStartGame: () => void;
  onOpenLocker: () => void;
  onOpenArmory: () => void;
  onChangeDifficulty: (mode: DifficultyMode) => void;
  onToggleAudio: () => void;
  onToggleMusic: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  stats,
  onStartGame,
  onOpenLocker,
  onOpenArmory,
  onChangeDifficulty,
  onToggleAudio,
  onToggleMusic,
}) => {
  const activeChar =
    CRAZY_CHARACTERS.find((c) => c.id === stats.selectedCharacterId) || CRAZY_CHARACTERS[0];
  const activeSkinId = stats.selectedSkinId[activeChar.id] || activeChar.skins[0].id;
  const activeSkin = activeChar.skins.find((s) => s.id === activeSkinId) || activeChar.skins[0];

  const currentDiff = DIFFICULTY_PRESETS[stats.difficulty];

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 select-none bg-radial from-slate-950/70 via-slate-950/95 to-slate-950">
      {/* Top Header Cluster: Coins, Level record, Sound controls */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          {/* Total Coins */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono-numbers">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-base font-bold tracking-tight">{stats.coins.toLocaleString()}</span>
            <span className="text-xs text-amber-400/80 font-sans uppercase font-semibold">Coins</span>
          </div>

          {/* Highest Level */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono-numbers">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-400/80 font-sans uppercase font-semibold">Max Level:</span>
            <span className="text-base font-bold">{stats.highestLevel}</span>
          </div>

          {/* Total Kills */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono-numbers">
            <Skull className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-rose-400/80 font-sans uppercase font-semibold">Total Kills:</span>
            <span className="text-base font-bold">{stats.totalKills.toLocaleString()}</span>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.uiClick();
              onToggleAudio();
            }}
            className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title={stats.audioMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {stats.audioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              sounds.uiClick();
              onToggleMusic();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Toggle Dynamic Synthwave Music"
          >
            Music: {stats.musicMuted ? 'OFF' : 'ON'}
          </button>
        </div>
      </header>

      {/* Main Centerpiece: Bespoke Title Lockup + Hero Character Centerpiece */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-4xl mx-auto w-full">
        {/* Inline Bespoke SVG Title Lockup */}
        <div className="w-full max-w-2xl px-2">
          <svg
            viewBox="0 0 800 150"
            className="w-full h-auto drop-shadow-[0_0_35px_rgba(56,189,248,0.35)]"
            aria-label="CRAZY CHAOS ARENA: UNLIMITED"
          >
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="40%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <linearGradient id="strokeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#bae6fd" />
              </linearGradient>
            </defs>

            {/* Subtitle kicker */}
            <text
              x="400"
              y="32"
              textAnchor="middle"
              className="font-black text-sm tracking-[0.45em] fill-cyan-400 font-sans"
            >
              INFINITE ROGUELITE BRAWLER
            </text>

            {/* Main Title Text */}
            <text
              x="400"
              y="98"
              textAnchor="middle"
              fill="url(#titleGrad)"
              stroke="url(#strokeGrad)"
              strokeWidth="2.5"
              className="font-black text-6xl tracking-wider font-sans uppercase"
              style={{ fontStretch: 'condensed', letterSpacing: '0.04em' }}
            >
              CRAZY CHAOS ARENA
            </text>

            {/* Tagline */}
            <text
              x="400"
              y="134"
              textAnchor="middle"
              className="font-extrabold text-xs tracking-[0.6em] fill-amber-300/90 font-sans"
            >
              UNLIMITED LEVELS · CRAZY CHARACTERS · ENDLESS REWARDS
            </text>
          </svg>
        </div>

        {/* Selected Character Preview Badge */}
        <div className="mt-4 mb-6 flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="shrink-0">
            <CharacterCanvasPreview charId={activeChar.id} skin={activeSkin} size={70} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{activeChar.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/20 font-medium">
                {activeSkin.name}
              </span>
            </div>
            <p className="text-xs text-slate-400">{activeChar.title}</p>
          </div>
          <button
            onClick={() => {
              sounds.uiClick();
              onOpenLocker();
            }}
            className="ml-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
          >
            Change
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg mt-2">
          {/* Primary Big Start Battle CTA */}
          <button
            onClick={() => {
              sounds.uiClick();
              onStartGame();
            }}
            className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-lg tracking-wide uppercase shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-cyan-300/40"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Level {stats.highestLevel}</span>
          </button>
        </div>

        {/* Secondary Hub Buttons: Locker, Armory, Difficulty */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-lg mt-3">
          <button
            onClick={() => {
              sounds.uiClick();
              onOpenLocker();
            }}
            className="py-3 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Characters & Skins</span>
          </button>

          <button
            onClick={() => {
              sounds.uiClick();
              onOpenArmory();
            }}
            className="py-3 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Armory & Upgrades</span>
          </button>

          <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
            {/* Difficulty cycler */}
            <button
              onClick={() => {
                sounds.uiClick();
                const modes: DifficultyMode[] = ['CASUAL', 'CHAOS', 'INSANE', 'NIGHTMARE'];
                const nextIdx = (modes.indexOf(stats.difficulty) + 1) % modes.length;
                onChangeDifficulty(modes[nextIdx]);
              }}
              className={`w-full py-3 px-3 rounded-lg border font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${currentDiff.badgeColor}`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{currentDiff.name}</span>
            </button>
          </div>
        </div>

        {/* Difficulty description */}
        <p className="text-xs text-slate-400 mt-2 font-mono-numbers">
          {currentDiff.description} · <span className="text-amber-400 font-bold">{currentDiff.coinMultiplier}x Coins</span>
        </p>
      </div>

      {/* Flat Single Control-Hint Line */}
      <footer className="w-full text-center py-2 text-xs text-slate-400 tracking-wide font-sans">
        <span className="font-semibold text-slate-300">WASD / Arrows</span> Move ·{' '}
        <span className="font-semibold text-slate-300">Mouse</span> Aim & Auto-Shoot ·{' '}
        <span className="font-semibold text-slate-300">Shift</span> Dash ·{' '}
        <span className="font-semibold text-slate-300">Space</span> Ultimate ·{' '}
        <span className="font-semibold text-slate-300">Esc</span> Pause
      </footer>
    </div>
  );
};
