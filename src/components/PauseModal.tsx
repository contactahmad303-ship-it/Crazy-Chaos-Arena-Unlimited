/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music } from 'lucide-react';
import { sounds } from '../game/audio';

interface PauseModalProps {
  level: number;
  audioMuted: boolean;
  musicMuted: boolean;
  onResume: () => void;
  onRetry: () => void;
  onReturnTitle: () => void;
  onToggleAudio: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  audioMuted,
  musicMuted,
  onResume,
  onRetry,
  onReturnTitle,
  onToggleAudio,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
          Simulation Suspended
        </span>
        <h2 className="text-2xl font-black uppercase text-white mt-1 mb-6">
          GAME PAUSED · LEVEL {level}
        </h2>

        {/* Audio Toggles */}
        <div className="grid grid-cols-2 gap-2 w-full mb-6">
          <button
            onClick={() => {
              sounds.uiClick();
              onToggleAudio();
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>SFX: {audioMuted ? 'Muted' : 'On'}</span>
          </button>

          <button
            onClick={() => {
              sounds.uiClick();
              onToggleMusic();
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Music className={`w-4 h-4 ${musicMuted ? 'text-slate-500' : 'text-amber-400'}`} />
            <span>Music: {musicMuted ? 'Off' : 'On'}</span>
          </button>
        </div>

        {/* Primary Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              sounds.uiClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Battle</span>
          </button>

          <button
            onClick={() => {
              sounds.uiClick();
              onRetry();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Level {level}</span>
          </button>

          <button
            onClick={() => {
              sounds.uiClick();
              onReturnTitle();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Title Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
