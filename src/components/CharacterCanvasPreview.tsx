/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { drawCharacterModel } from '../game/characterRenderer';
import { Skin } from '../game/types';

interface CharacterCanvasPreviewProps {
  charId: string;
  skin: Skin;
  size?: number;
}

export const CharacterCanvasPreview: React.FC<CharacterCanvasPreviewProps> = ({
  charId,
  skin,
  size = 140,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let animTimer = 0;

    const render = () => {
      animTimer += 0.035;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Center and scale up for prominent display
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(1.7, 1.7);

      const walkBob = Math.sin(animTimer * 4) * 2;
      const legSwing = Math.sin(animTimer * 6) * 6;

      drawCharacterModel(
        ctx,
        charId,
        skin.colorScheme,
        walkBob,
        legSwing,
        true,
        skin.styleType,
        animTimer
      );

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [charId, skin]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner"
    />
  );
};
