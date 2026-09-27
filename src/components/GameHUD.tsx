import React from 'react';
import { ShonenPowerType, GameDifficulty, RenderPerspective } from '../game/types';
import { SHONEN_MOVES } from '../game/constants';
import { Zap, Heart, Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface GameHUDProps {
  score: number;
  lives: number;
  level: number;
  stageName: string;
  kiEnergy: number;
  activePower: ShonenPowerType | null;
  powerTimer: number;
  comboMultiplier: number;
  ghostChainCount?: number;
  ghostChainTimer?: number;
  maxGhostChainTimer?: number;
  equippedPowers: ShonenPowerType[];
  difficulty: GameDifficulty;
  perspective: RenderPerspective;
  isFeverMode?: boolean;
  feverTimer?: number;
  feverPelletCount?: number;
  fps?: number;
  rayTracingActive?: boolean;
  frameGenActive?: boolean;
  onToggleRayTracing?: () => void;
  onToggleFrameGen?: () => void;
  onTriggerMove: (type: ShonenPowerType) => void;
}

export interface ComboMultiplierBadgeProps {
  comboMultiplier: number;
  ghostChainCount?: number;
  ghostChainTimer?: number;
  maxGhostChainTimer?: number;
  size?: 'sm' | 'md';
}

export const ComboMultiplierBadge: React.FC<ComboMultiplierBadgeProps> = ({
  comboMultiplier,
  ghostChainCount = 0,
  ghostChainTimer = 0,
  maxGhostChainTimer = 6.0,
  size = 'md',
}) => {
  const isChaining = comboMultiplier > 1 && ghostChainTimer > 0;
  const timerPercent = isChaining
    ? Math.min(100, Math.max(0, (ghostChainTimer / maxGhostChainTimer) * 100))
    : 0;

  // Tier calculation:
  // 1x -> Tier 0 (Ready / Standby)
  // 2x -> Tier 1 (1 Ghost Chained)
  // 4x -> Tier 2 (2 Ghosts Chained)
  // 8x -> Tier 3 (3 Ghosts Chained)
  // 16x -> Tier 4 (4+ Ghosts Chained - Max Overdrive)
  let tier = 0;
  if (comboMultiplier >= 16 || ghostChainCount >= 4) tier = 4;
  else if (comboMultiplier >= 8 || ghostChainCount >= 3) tier = 3;
  else if (comboMultiplier >= 4 || ghostChainCount >= 2) tier = 2;
  else if (comboMultiplier >= 2 || ghostChainCount >= 1) tier = 1;

  const tierConfigs = [
    {
      label: '1x',
      status: 'READY',
      containerBg: 'bg-zinc-900/80 border-zinc-700/60',
      glowShadow: 'shadow-none',
      textColor: 'text-zinc-400 font-semibold',
      badgeBg: 'bg-zinc-800 text-zinc-400',
      barColor: 'bg-zinc-700',
      pipActive: 'bg-zinc-600',
    },
    {
      label: '2x',
      status: 'CHAIN',
      containerBg: 'bg-emerald-950/85 border-emerald-500/70',
      glowShadow: 'shadow-[0_0_14px_rgba(16,185,129,0.5)] ring-1 ring-emerald-400/50',
      textColor: 'text-emerald-300 font-extrabold',
      badgeBg: 'bg-emerald-500 text-emerald-950 font-black',
      barColor: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
      pipActive: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
    },
    {
      label: '4x',
      status: 'MEGA',
      containerBg: 'bg-amber-950/90 border-amber-400',
      glowShadow: 'shadow-[0_0_22px_rgba(245,158,11,0.7)] ring-1 ring-amber-400/60 animate-pulse',
      textColor: 'text-amber-300 font-black',
      badgeBg: 'bg-amber-400 text-black font-black',
      barColor: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
      pipActive: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    },
    {
      label: '8x',
      status: 'ULTRA',
      containerBg: 'bg-purple-950/90 border-purple-400',
      glowShadow: 'shadow-[0_0_30px_rgba(168,85,247,0.85)] ring-2 ring-purple-400/70 animate-pulse',
      textColor: 'text-purple-200 font-black',
      badgeBg: 'bg-purple-400 text-black font-black',
      barColor: 'bg-purple-400 shadow-[0_0_12px_#c084fc]',
      pipActive: 'bg-purple-400 shadow-[0_0_10px_#c084fc]',
    },
    {
      label: '16x',
      status: 'OVERDRIVE',
      containerBg: 'bg-gradient-to-r from-rose-950/95 via-red-900/95 to-amber-950/95 border-rose-500',
      glowShadow: 'shadow-[0_0_38px_rgba(244,63,94,0.95)] ring-2 ring-rose-400 animate-pulse',
      textColor: 'text-rose-100 font-black',
      badgeBg: 'bg-gradient-to-r from-rose-500 to-amber-400 text-black font-black',
      barColor: 'bg-gradient-to-r from-rose-500 via-yellow-400 to-cyan-400 shadow-[0_0_14px_#f43f5e]',
      pipActive: 'bg-rose-400 shadow-[0_0_12px_#f43f5e]',
    },
  ];

  const cfg = tierConfigs[tier];

  return (
    <div
      className={`relative flex flex-col justify-center rounded-xl border backdrop-blur-md transition-all duration-300 select-none ${cfg.containerBg} ${cfg.glowShadow} ${
        size === 'sm' ? 'px-2 py-1 min-w-[95px]' : 'px-2.5 py-1.5 min-w-[125px] sm:min-w-[140px]'
      }`}
      title={
        isChaining
          ? `Ghost Chain Combo: ${comboMultiplier}x Multiplier! (${ghostChainTimer.toFixed(1)}s left)`
          : 'Persistent Combo Multiplier: Capture ghosts in succession to chain multipliers up to 16x!'
      }
    >
      {/* Top Header Row: Multiplier & Status Badge */}
      <div className="flex items-center justify-between gap-1.5 leading-none">
        <div className="flex items-center gap-1">
          {tier >= 4 ? (
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce fill-current" />
          ) : tier >= 2 ? (
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          ) : (
            <Zap className={`w-3 h-3 ${isChaining ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
          )}
          <span className={`font-['Orbitron'] tracking-wider ${size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm'} ${cfg.textColor}`}>
            {cfg.label}
          </span>
        </div>

        <span className={`px-1 py-0.5 rounded text-[8px] tracking-wider uppercase font-['Orbitron'] ${cfg.badgeBg}`}>
          {cfg.status}
        </span>
      </div>

      {/* Ghost Chain Pips (4 ghosts in stage) & Timer readout */}
      <div className="flex items-center justify-between gap-1 mt-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }).map((_, i) => {
            const isFilled = i < ghostChainCount;
            return (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full border transition-all duration-200 ${
                  isFilled ? `${cfg.pipActive} scale-110` : 'bg-zinc-800/80 border-zinc-700/60'
                }`}
                title={`Ghost Chain ${i + 1}/4`}
              />
            );
          })}
        </div>

        {/* Seconds remaining or status */}
        <span className="text-[8px] font-mono font-semibold text-zinc-400">
          {isChaining ? `${ghostChainTimer.toFixed(1)}s` : 'IDLE'}
        </span>
      </div>

      {/* Dynamic Timer Decay Progress Bar */}
      <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden mt-1 border border-black/40">
        <div
          className={`h-full transition-all duration-100 ease-linear rounded-full ${cfg.barColor}`}
          style={{ width: `${isChaining ? timerPercent : 0}%` }}
        />
      </div>
    </div>
  );
};

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  lives,
  level,
  stageName,
  kiEnergy,
  activePower,
  powerTimer,
  comboMultiplier,
  ghostChainCount = 0,
  ghostChainTimer = 0,
  maxGhostChainTimer = 6.0,
  equippedPowers,
  difficulty,
  perspective,
  isFeverMode = false,
  feverTimer = 0,
  feverPelletCount = 0,
  fps = 500,
  rayTracingActive = true,
  frameGenActive = true,
  onToggleRayTracing,
  onToggleFrameGen,
  onTriggerMove,
}) => {
  const activeMoveInfo = activePower ? SHONEN_MOVES[activePower] : null;

  return (
    <div className="w-full flex flex-col gap-2 pointer-events-none">
      {/* Top Stats Bar */}
      <div className="flex items-center justify-between bg-[#0b0f24]/90 backdrop-blur-md px-3 sm:px-4 py-2 rounded-xl border border-cyan-500/30 shadow-lg shadow-black/40 gap-2">
        {/* Stage & Level */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-['Orbitron'] truncate max-w-[110px] sm:max-w-none">
              {stageName}
            </span>
            <span className="text-[8px] font-black px-1 rounded bg-zinc-800 text-zinc-300">
              {difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400 font-medium">STAGE</span>
            <span className="text-sm sm:text-base font-black text-white font-['Orbitron']">
              {level} <span className="text-xs text-zinc-500 font-normal">/ 1001</span>
            </span>
          </div>
        </div>

        {/* GPU Hardware Acceleration & AI Frame Gen Badge (Capped at 500 FPS) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#060a1d]/90 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)] pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono font-black text-emerald-300">
            {fps} FPS
          </span>
          <div className="flex items-center gap-1 border-l border-zinc-700/80 pl-1.5 text-[8px] font-mono font-bold">
            <button
              onClick={onToggleRayTracing}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-all flex items-center gap-0.5 ${
                rayTracingActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-zinc-500'
              }`}
              title="Magical Sparkling Shimmer & Stardust Effect"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>SPARKLE</span>
            </button>
            <button
              onClick={onToggleFrameGen}
              className={`px-1 py-0.5 rounded cursor-pointer transition-all ${
                frameGenActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-zinc-500'
              }`}
              title="AI Sub-Frame Generation & Motion Interpolation (500 FPS Target)"
            >
              AI-FG
            </button>
          </div>
        </div>

        {/* Score & Persistent Combo Multiplier Display */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-['Orbitron']">
              SCORE
            </span>
            {isFeverMode && (
              <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-red-500 via-yellow-400 to-cyan-400 text-black text-[8px] font-black animate-bounce font-['Orbitron']">
                3X FEVER
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 font-['Orbitron'] tracking-wider drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              {score.toLocaleString()}
            </span>

            {/* Persistent Combo Multiplier Indicator */}
            <ComboMultiplierBadge
              comboMultiplier={comboMultiplier}
              ghostChainCount={ghostChainCount}
              ghostChainTimer={ghostChainTimer}
              maxGhostChainTimer={maxGhostChainTimer}
              size="md"
            />
          </div>
        </div>

        {/* Lives Counter */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-['Orbitron']">
            LIVES
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  idx < lives
                    ? 'bg-amber-400 shadow-[0_0_8px_#facc15] scale-100'
                    : 'bg-zinc-800/80 border border-zinc-700/60 opacity-30 scale-90'
                }`}
              >
                {idx < lives && (
                  <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[4px] border-r-[#0b0f24] translate-x-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chakra / Ki Energy Gauge & Rainbow Fever Gauge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* KI GAUGE */}
        <div className="bg-[#090d1f]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/20 flex items-center gap-2">
          <div className="flex items-center gap-1 min-w-[65px]">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black text-cyan-300 font-['Orbitron']">
              KI GAUGE
            </span>
          </div>

          <div className="flex-1 h-3 bg-zinc-950 rounded-full overflow-hidden p-[2px] border border-cyan-500/30 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-yellow-400 transition-all duration-200 relative"
              style={{ width: `${Math.min(100, Math.max(0, kiEnergy))}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-[pulse_1.5s_infinite]" />
            </div>
          </div>

          <span className="text-[11px] font-black text-cyan-200 font-['Orbitron'] min-w-[36px] text-right">
            {Math.floor(kiEnergy)}%
          </span>
        </div>

        {/* RAINBOW FEVER GAUGE */}
        <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
          isFeverMode 
            ? 'bg-gradient-to-r from-red-950/80 via-yellow-950/80 to-purple-950/80 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse'
            : 'bg-[#090d1f]/90 border-amber-500/30'
        }`}>
          <div className="flex items-center gap-1 min-w-[70px]">
            <Sparkles className={`w-3.5 h-3.5 ${isFeverMode ? 'text-amber-300 animate-spin' : 'text-amber-400'}`} />
            <span className="text-[10px] font-black text-amber-300 font-['Orbitron'] truncate">
              {isFeverMode ? 'FEVER (7s)' : 'FEVER (100)'}
            </span>
          </div>

          <div className="flex-1 h-3 bg-zinc-950 rounded-full overflow-hidden p-[2px] border border-amber-500/30 relative">
            <div
              className={`h-full rounded-full transition-all duration-200 relative ${
                isFeverMode
                  ? 'bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-cyan-400 to-purple-500 animate-[pulse_0.6s_infinite]'
                  : 'bg-gradient-to-r from-amber-600 to-yellow-400'
              }`}
              style={{
                width: isFeverMode
                  ? `${Math.min(100, Math.max(0, (feverTimer / 7.0) * 100))}%`
                  : `${Math.min(100, (feverPelletCount / 100) * 100)}%`,
              }}
            >
              <div className="absolute inset-0 bg-white/30" />
            </div>
          </div>

          <span className="text-[11px] font-black text-amber-200 font-['Orbitron'] min-w-[36px] text-right">
            {isFeverMode ? `${feverTimer.toFixed(1)}s` : `${feverPelletCount}/100`}
          </span>
        </div>
      </div>

      {/* Active Power-up Countdown Banner */}
      {activeMoveInfo && (
        <div 
          className="px-3 py-1.5 rounded-xl border flex items-center justify-between shadow-lg animate-pulse"
          style={{
            backgroundColor: `${activeMoveInfo.color}15`,
            borderColor: `${activeMoveInfo.color}60`,
            boxShadow: `0 0 16px ${activeMoveInfo.color}40`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeMoveInfo.icon}</span>
            <div>
              <div className="text-xs font-black text-white uppercase font-['Orbitron'] flex items-center gap-1.5">
                <span>{activeMoveInfo.name}</span>
                <span className="text-[10px] text-zinc-300 font-normal">{activeMoveInfo.japaneseName}</span>
              </div>
              <span className="text-[10px] text-zinc-300">{activeMoveInfo.animeSource}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-black font-['Orbitron'] text-white">
              {powerTimer.toFixed(1)}s
            </span>
          </div>
        </div>
      )}

      {/* Equipped 6-Power Hotbar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 pointer-events-auto">
        {equippedPowers.map((type, idx) => {
          const move = SHONEN_MOVES[type] || SHONEN_MOVES.SUPER_SAIYAN;
          const hasKi = kiEnergy >= move.kiCost;
          const isActive = activePower === type;
          const hotkeyNum = idx + 1;

          return (
            <button
              key={`${type}-${idx}`}
              onClick={() => onTriggerMove(type)}
              disabled={!hasKi}
              className={`relative group p-1.5 sm:p-2 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer select-none text-left ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_#facc15]'
                  : hasKi
                  ? 'bg-[#0e142e]/90 hover:bg-[#151f42] border-cyan-500/40 hover:border-cyan-400 shadow-md shadow-black/40 hover:scale-[1.02]'
                  : 'bg-zinc-950/60 border-zinc-800/80 opacity-45 cursor-not-allowed'
              }`}
            >
              <div className="w-full flex items-center justify-between gap-1">
                <span className="text-base sm:text-lg">{move.icon}</span>
                <span
                  className={`text-[9px] font-black px-1 py-0.5 rounded ${
                    hasKi ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/40' : 'bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {move.kiCost}%
                </span>
              </div>

              <div className="w-full mt-1">
                <div className="text-[10px] font-black text-zinc-100 truncate font-['Rajdhani'] leading-tight">
                  {move.name.split(' ')[0]}
                </div>
                <div className="text-[8px] text-zinc-400 truncate">
                  {move.japaneseName}
                </div>
              </div>

              <div className="w-full mt-1 flex justify-end">
                <span className="text-[8px] font-mono font-bold text-zinc-400 bg-black/50 px-1 rounded border border-zinc-700/50">
                  {idx === 0 ? 'Space' : `Key ${hotkeyNum}`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
