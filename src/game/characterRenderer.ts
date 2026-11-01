/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Skin } from './types';

export function drawCharacterModel(
  ctx: CanvasRenderingContext2D,
  charId: string,
  colors: Skin['colorScheme'],
  walkBob: number,
  legSwing: number,
  isMoving: boolean,
  styleType: string,
  animTimer: number
) {
  if (charId === 'cyber_pug') {
    drawCyberPug(ctx, colors, walkBob, legSwing, isMoving, styleType, animTimer);
  } else if (charId === 'dr_bananas') {
    drawDrBananas(ctx, colors, walkBob, legSwing, isMoving, styleType, animTimer);
  } else if (charId === 'mecha_rex') {
    drawMechaRex(ctx, colors, walkBob, legSwing, isMoving, styleType, animTimer);
  } else if (charId === 'glitch_phantom') {
    drawGlitchPhantom(ctx, colors, walkBob, legSwing, isMoving, styleType, animTimer);
  } else if (charId === 'neon_valkyrie') {
    drawNeonValkyrie(ctx, colors, walkBob, legSwing, isMoving, styleType, animTimer);
  } else if (charId === 'turbo_taco') {
    drawTurboTaco(ctx, colors, walkBob, legSwing, isMoving, styleType, animTimer);
  } else {
    drawCyberPug(ctx, colors, walkBob, legSwing, isMoving, styleType, animTimer);
  }
}

// 1. CYBER PUG
export function drawCyberPug(
  ctx: CanvasRenderingContext2D,
  colors: Skin['colorScheme'],
  walkBob: number,
  legSwing: number,
  isMoving: boolean,
  styleType: string,
  animTimer: number
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
  const tailWag = Math.sin(animTimer * 12) * 0.35;
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
  ctx.ellipse(8, -13, 6, 9, -0.3 + (isMoving ? Math.sin(animTimer * 10) * 0.2 : 0), 0, Math.PI * 2);
  ctx.ellipse(8, 13, 6, 9, 0.3 - (isMoving ? Math.sin(animTimer * 10) * 0.2 : 0), 0, Math.PI * 2);
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

// 2. DR. QUANTUM BANANAS
export function drawDrBananas(
  ctx: CanvasRenderingContext2D,
  colors: Skin['colorScheme'],
  walkBob: number,
  legSwing: number,
  _isMoving: boolean,
  _styleType: string,
  animTimer: number
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
  const tailWiggle = Math.sin(animTimer * 5) * 6;
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
  ctx.fillStyle = '#10b981';
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

// 3. MECHA REX
export function drawMechaRex(
  ctx: CanvasRenderingContext2D,
  colors: Skin['colorScheme'],
  walkBob: number,
  legSwing: number,
  _isMoving: boolean,
  _styleType: string,
  animTimer: number
) {
  ctx.save();
  ctx.translate(0, walkBob);

  // Hydraulic Dinosaur Legs with 3 Steel Razor Talons
  ctx.fillStyle = '#334155';
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
  const tailSwing = Math.sin(animTimer * 6) * 8;
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
  const jawSnap = Math.sin(animTimer * 8) * 3;
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

// 4. GLITCH PHANTOM
export function drawGlitchPhantom(
  ctx: CanvasRenderingContext2D,
  colors: Skin['colorScheme'],
  walkBob: number,
  _legSwing: number,
  _isMoving: boolean,
  _styleType: string,
  animTimer: number
) {
  ctx.save();
  ctx.translate(0, walkBob);

  // Glitching Cloak Trails
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

  // Disembodied Floating Mechanical Gauntlets with Electric Arcs
  const handFloat = Math.sin(animTimer * 10) * 3;
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

  ctx.restore();
}

// 5. NEON VALKYRIE
export function drawNeonValkyrie(
  ctx: CanvasRenderingContext2D,
  colors: Skin['colorScheme'],
  walkBob: number,
  legSwing: number,
  _isMoving: boolean,
  _styleType: string,
  animTimer: number
) {
  ctx.save();
  ctx.translate(0, walkBob);

  // Large Articulated Plasma Wings
  const wingFlap = Math.sin(animTimer * 7) * 0.25;
  ctx.save();
  ctx.fillStyle = colors.accent;
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.quadraticCurveTo(-14, -32 + wingFlap * 15, 6, -38 + wingFlap * 20);
  ctx.lineTo(-2, -20);
  ctx.closePath();
  ctx.fill();
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

  // Flowing Cyber Hair
  const hairSway = Math.sin(animTimer * 8) * 4;
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

  // Radiant Plasma Halo
  ctx.strokeStyle = '#facc15';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(8, -16, 7, 3, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// 6. TURBO TACO
export function drawTurboTaco(
  ctx: CanvasRenderingContext2D,
  _colors: Skin['colorScheme'],
  walkBob: number,
  legSwing: number,
  _isMoving: boolean,
  _styleType: string,
  animTimer: number
) {
  ctx.save();
  ctx.translate(0, walkBob);

  // Cowboy Boots with Golden Spurs
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

  // Taco Fillings (Lettuce, Cheese, Tomatoes)
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(-6, -12, 5, 0, Math.PI * 2);
  ctx.arc(2, -13, 6, 0, Math.PI * 2);
  ctx.arc(8, -12, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-4, -15, 4, 4);
  ctx.fillRect(4, -16, 4, 4);

  ctx.fillStyle = '#fde047';
  ctx.fillRect(-8, -11, 8, 2);
  ctx.fillRect(0, -12, 8, 2);

  // Dual Hot Sauce Rocket Blasters
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

  // Giant Wide-Brim Mexican Sombrero
  ctx.save();
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Sombrero Cone
  ctx.fillStyle = '#c2410c';
  ctx.beginPath();
  ctx.ellipse(-4, 0, 7, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pom-Poms
  const pomSway = Math.sin(animTimer * 10) * 2;
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(0, -22 + pomSway, 2.5, 0, Math.PI * 2);
  ctx.arc(0, 22 - pomSway, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}
