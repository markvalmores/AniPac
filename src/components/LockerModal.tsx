import React, { useState } from 'react';
import { 
  GACHA_PAC_SKINS, 
  GACHA_GHOST_SKINS, 
  GACHA_MAZE_SKINS, 
  SHONEN_MOVES 
} from '../game/constants';
import { ShonenPowerType } from '../game/types';
import { useAuth } from '../firebase/AuthContext';
import { X, Layers, Check, Zap, Sparkles, User as UserIcon, Shield, Flame } from 'lucide-react';

interface LockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGacha: () => void;
}

export const LockerModal: React.FC<LockerModalProps> = ({ isOpen, onClose, onOpenGacha }) => {
  const { profile, equipSkin, equipPowerMove } = useAuth();
  const [tab, setTab] = useState<'PAC_SKINS' | 'GHOST_SKINS' | 'MAZE_SKINS' | 'POWER_LOADOUT'>('PAC_SKINS');
  const [selectedPowerSlot, setSelectedPowerSlot] = useState<number>(0);

  if (!isOpen) return null;

  const unlockedSet = new Set(profile?.unlockedItems || []);
  const equippedSkin = profile?.equippedSkin || 'skin-classic-neon';
  const equippedGhostSkin = profile?.equippedGhostSkin || 'ghost-classic-oni';
  const equippedMazeSkin = profile?.equippedMazeSkin || 'maze-neon-cyber';
  const equippedPowers = profile?.equippedPowers || ['SUPER_SAIYAN', 'KAMEHAMEHA', 'DOMAIN_EXPANSION', 'BANKAI_SLASH', 'RASENGAN_VACUUM', 'GEAR_5_BOUNCE'];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0c1029] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-900/50 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#080b1d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-['Orbitron'] tracking-wider">
                SHINOBI LOCKER & CUSTOMIZER
              </h2>
              <p className="text-xs text-zinc-400">
                Equip your anime character skins, Yokai designs, maze styles, and 6-slot power loadout
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-5 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('PAC_SKINS')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              tab === 'PAC_SKINS'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Pac-Man Skins
          </button>
          <button
            onClick={() => setTab('GHOST_SKINS')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              tab === 'GHOST_SKINS'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Ghost Skins
          </button>
          <button
            onClick={() => setTab('MAZE_SKINS')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              tab === 'MAZE_SKINS'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Maze Textures
          </button>
          <button
            onClick={() => setTab('POWER_LOADOUT')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              tab === 'POWER_LOADOUT'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            6-Power Loadout
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: PAC-MAN SKINS */}
          {tab === 'PAC_SKINS' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {GACHA_PAC_SKINS.map((skin) => {
                const isUnlocked = unlockedSet.has(skin.id) || skin.rarity === 'COMMON';
                const isEquipped = equippedSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    onClick={() => {
                      if (isUnlocked) equipSkin('PAC', skin.id);
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-500 shadow-lg shadow-amber-500/20'
                        : isUnlocked
                        ? 'border-zinc-800 bg-[#101633] hover:border-zinc-600 hover:bg-[#151d42] cursor-pointer'
                        : 'border-zinc-900 bg-zinc-950/60 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{skin.previewIcon}</span>
                      {isEquipped ? (
                        <span className="p-1 rounded-full bg-amber-500 text-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : !isUnlocked ? (
                        <span className="text-[10px] uppercase font-bold text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded">
                          LOCKED
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <div className="text-xs font-black text-white truncate font-['Rajdhani']">
                        {skin.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{skin.animeSource}</div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/40"
                        style={{ backgroundColor: skin.color }}
                      />
                      <span className="text-[9px] font-black uppercase text-amber-300">
                        {skin.rarity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: GHOST SKINS */}
          {tab === 'GHOST_SKINS' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {GACHA_GHOST_SKINS.map((skin) => {
                const isUnlocked = unlockedSet.has(skin.id) || skin.rarity === 'COMMON';
                const isEquipped = equippedGhostSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    onClick={() => {
                      if (isUnlocked) equipSkin('GHOST', skin.id);
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'border-rose-400 bg-rose-950/40 ring-2 ring-rose-500 shadow-lg shadow-rose-500/20'
                        : isUnlocked
                        ? 'border-zinc-800 bg-[#101633] hover:border-zinc-600 hover:bg-[#151d42] cursor-pointer'
                        : 'border-zinc-900 bg-zinc-950/60 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{skin.previewIcon}</span>
                      {isEquipped && (
                        <span className="p-1 rounded-full bg-rose-500 text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-black text-white truncate font-['Rajdhani']">
                        {skin.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{skin.animeSource}</div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.akumaColor }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.kitsuneColor }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.raidenColor }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.kageColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: MAZE SKINS */}
          {tab === 'MAZE_SKINS' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {GACHA_MAZE_SKINS.map((skin) => {
                const isUnlocked = unlockedSet.has(skin.id) || skin.rarity === 'COMMON';
                const isEquipped = equippedMazeSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    onClick={() => {
                      if (isUnlocked) equipSkin('MAZE', skin.id);
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20'
                        : isUnlocked
                        ? 'border-zinc-800 bg-[#101633] hover:border-zinc-600 hover:bg-[#151d42] cursor-pointer'
                        : 'border-zinc-900 bg-zinc-950/60 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white font-['Orbitron']">
                        {skin.name}
                      </span>
                      {isEquipped && (
                        <span className="p-1 rounded-full bg-cyan-500 text-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-zinc-400 font-mono">{skin.style}</div>

                    <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: skin.primaryColor }} />
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: skin.dotColor }} />
                      </div>
                      <span className="text-[9px] font-black uppercase text-cyan-300">
                        {skin.rarity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: 6-POWER HOTBAR LOADOUT */}
          {tab === 'POWER_LOADOUT' && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-black text-purple-300 uppercase tracking-wider block mb-2 font-['Orbitron']">
                  Active 6-Slot Battle Hotbar (Click a slot to replace power)
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {equippedPowers.map((pKey, slotIdx) => {
                    const move = SHONEN_MOVES[pKey] || SHONEN_MOVES.SUPER_SAIYAN;
                    const isSelectedSlot = selectedPowerSlot === slotIdx;

                    return (
                      <button
                        key={slotIdx}
                        onClick={() => setSelectedPowerSlot(slotIdx)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                          isSelectedSlot
                            ? 'border-purple-400 bg-purple-950/60 ring-2 ring-purple-500 scale-105'
                            : 'border-zinc-800 bg-[#111738] hover:border-zinc-600'
                        }`}
                      >
                        <span className="text-lg">{move.icon}</span>
                        <span className="text-[10px] font-black text-white truncate max-w-full font-['Rajdhani']">
                          {move.name.split(' ')[0]}
                        </span>
                        <span className="text-[8px] font-bold text-zinc-400">SLOT {slotIdx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-xs font-black text-zinc-300 uppercase tracking-wider block mb-2 font-['Orbitron']">
                  Available Shonen Moves to Assign to Slot {selectedPowerSlot + 1}:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {(Object.keys(SHONEN_MOVES) as ShonenPowerType[]).map((pKey) => {
                    const move = SHONEN_MOVES[pKey];
                    const isUnlocked = unlockedSet.has(pKey) || move.rarity === 'COMMON';
                    const isEquippedInActive = equippedPowers.includes(pKey);

                    return (
                      <button
                        key={pKey}
                        onClick={() => {
                          if (isUnlocked) equipPowerMove(selectedPowerSlot, pKey);
                        }}
                        disabled={!isUnlocked}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                          isEquippedInActive
                            ? 'border-purple-500/60 bg-purple-950/30'
                            : isUnlocked
                            ? 'border-zinc-800 bg-[#0e142e] hover:border-purple-400 hover:bg-[#141b3d]'
                            : 'border-zinc-900 bg-zinc-950/50 opacity-35 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{move.icon}</span>
                          <span className="text-[9px] font-black text-cyan-300 font-mono">
                            {move.kiCost}% KI
                          </span>
                        </div>
                        <div className="my-1">
                          <div className="text-xs font-black text-white truncate font-['Rajdhani']">
                            {move.name}
                          </div>
                          <div className="text-[9px] text-zinc-400 truncate">{move.animeSource}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#080b1d] flex items-center justify-between text-xs text-zinc-400">
          <button
            onClick={() => {
              onClose();
              onOpenGacha();
            }}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black rounded-lg text-xs font-['Orbitron'] flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summon More in Gacha Shrine</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-xs"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
