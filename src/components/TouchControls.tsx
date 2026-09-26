import React from 'react';
import { Direction, ShonenPowerType } from '../game/types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Flame, Shield, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  onDirectionChange: (dir: Direction) => void;
  onTriggerMove: (type: ShonenPowerType) => void;
  kiEnergy: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onDirectionChange,
  onTriggerMove,
  kiEnergy,
}) => {
  return (
    <div className="w-full flex items-center justify-between px-2 py-2 select-none md:hidden z-30">
      {/* 4-Way D-Pad on Left */}
      <div className="relative w-36 h-36 bg-zinc-950/70 border border-cyan-500/30 rounded-full p-2 flex items-center justify-center backdrop-blur-md shadow-lg shadow-black/50">
        {/* Center pivot */}
        <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-cyan-400/80 shadow-[0_0_8px_#06b6d4]" />
        </div>

        {/* UP */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange('UP');
          }}
          onMouseDown={() => onDirectionChange('UP')}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-zinc-900/90 active:bg-cyan-600 rounded-t-xl border border-cyan-500/40 flex items-center justify-center text-cyan-300 active:text-white shadow-md active:scale-95 transition-transform"
          aria-label="Move Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* DOWN */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange('DOWN');
          }}
          onMouseDown={() => onDirectionChange('DOWN')}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-zinc-900/90 active:bg-cyan-600 rounded-b-xl border border-cyan-500/40 flex items-center justify-center text-cyan-300 active:text-white shadow-md active:scale-95 transition-transform"
          aria-label="Move Down"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* LEFT */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange('LEFT');
          }}
          onMouseDown={() => onDirectionChange('LEFT')}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-zinc-900/90 active:bg-cyan-600 rounded-l-xl border border-cyan-500/40 flex items-center justify-center text-cyan-300 active:text-white shadow-md active:scale-95 transition-transform"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* RIGHT */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onDirectionChange('RIGHT');
          }}
          onMouseDown={() => onDirectionChange('RIGHT')}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-zinc-900/90 active:bg-cyan-600 rounded-r-xl border border-cyan-500/40 flex items-center justify-center text-cyan-300 active:text-white shadow-md active:scale-95 transition-transform"
          aria-label="Move Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Shonen Ability Action Buttons on Right */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Kamehameha */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onTriggerMove('KAMEHAMEHA');
            }}
            onMouseDown={() => onTriggerMove('KAMEHAMEHA')}
            disabled={kiEnergy < 40}
            className={`w-14 h-14 rounded-full border flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform ${
              kiEnergy >= 40
                ? 'bg-cyan-950/80 active:bg-cyan-600 border-cyan-400 text-cyan-300 shadow-cyan-500/30'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 opacity-50'
            }`}
          >
            <span className="text-base">🌊</span>
            <span className="text-[8px] font-black uppercase font-['Orbitron']">KAME</span>
          </button>

          {/* Super Saiyan */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onTriggerMove('SUPER_SAIYAN');
            }}
            onMouseDown={() => onTriggerMove('SUPER_SAIYAN')}
            disabled={kiEnergy < 25}
            className={`w-14 h-14 rounded-full border flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform ${
              kiEnergy >= 25
                ? 'bg-amber-950/80 active:bg-amber-500 border-amber-400 text-amber-300 shadow-amber-500/30'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 opacity-50'
            }`}
          >
            <span className="text-base">⚡</span>
            <span className="text-[8px] font-black uppercase font-['Orbitron']">AURA</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Domain Expansion */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onTriggerMove('DOMAIN_EXPANSION');
            }}
            onMouseDown={() => onTriggerMove('DOMAIN_EXPANSION')}
            disabled={kiEnergy < 50}
            className={`w-14 h-14 rounded-full border flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform ${
              kiEnergy >= 50
                ? 'bg-purple-950/80 active:bg-purple-600 border-purple-400 text-purple-300 shadow-purple-500/30'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 opacity-50'
            }`}
          >
            <span className="text-base">🌌</span>
            <span className="text-[8px] font-black uppercase font-['Orbitron']">VOID</span>
          </button>

          {/* Bankai */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onTriggerMove('BANKAI_SLASH');
            }}
            onMouseDown={() => onTriggerMove('BANKAI_SLASH')}
            disabled={kiEnergy < 35}
            className={`w-14 h-14 rounded-full border flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform ${
              kiEnergy >= 35
                ? 'bg-rose-950/80 active:bg-rose-600 border-rose-400 text-rose-300 shadow-rose-500/30'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 opacity-50'
            }`}
          >
            <span className="text-base">⚔️</span>
            <span className="text-[8px] font-black uppercase font-['Orbitron']">BANKAI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
