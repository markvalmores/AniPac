import React from 'react';
import { SHONEN_MOVES, ANIME_BONUS_ITEMS } from '../game/constants';
import { ShonenPowerType } from '../game/types';
import { X, BookOpen, Gamepad2, Keyboard, Smartphone, Sparkles, Zap, Flame } from 'lucide-react';

interface MoveShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoveShowcaseModal: React.FC<MoveShowcaseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0c1029] border border-purple-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-purple-900/40 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#080b1d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-['Orbitron'] tracking-wider">
                SHONEN SPECIAL MOVES & ARCADE MANUAL
              </h2>
              <p className="text-xs text-zinc-400">
                Master legendary anime powers, controller bindings, and Yokai enemy behaviors
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* SECTION 1: SHONEN POWER-UPS */}
          <div>
            <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 font-['Orbitron'] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Legendary Shonen Special Moves</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(Object.keys(SHONEN_MOVES) as ShonenPowerType[]).map((type) => {
                const move = SHONEN_MOVES[type];
                return (
                  <div
                    key={type}
                    className="p-3.5 rounded-xl border bg-[#101533] border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{move.icon}</span>
                          <div>
                            <div className="text-sm font-black text-white font-['Rajdhani']">
                              {move.name}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              {move.japaneseName} • <span className="text-cyan-400">{move.animeSource}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                          {move.kiCost}% KI
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed my-2">
                        {move.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 font-medium">
                        Duration: {move.duration}s
                      </span>
                      <span className="font-mono font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-zinc-700">
                        {move.hotkey}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: CONTROLLER & KEYBOARD BINDINGS */}
          <div>
            <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-['Orbitron'] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>Full Cross-Platform Controls</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Keyboard */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 font-['Orbitron']">
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>KEYBOARD</span>
                </div>
                <div className="text-xs text-zinc-300 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Move:</span>
                    <span>Arrows / WASD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Saiyan Aura:</span>
                    <span>Space</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Kamehameha:</span>
                    <span>J / 1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Domain Void:</span>
                    <span>K / 2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Bankai Dash:</span>
                    <span>L / 3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Rasengan:</span>
                    <span>U / 4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Gear 5:</span>
                    <span>I / 5</span>
                  </div>
                </div>
              </div>

              {/* Gamepad / Controller */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-['Orbitron']">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>GAMEPAD / XBOX</span>
                </div>
                <div className="text-xs text-zinc-300 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Steer:</span>
                    <span>D-Pad / Left Stick</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Saiyan Aura:</span>
                    <span>A / Cross</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Kamehameha:</span>
                    <span>X / Square</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Domain Void:</span>
                    <span>Y / Triangle</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Bankai Dash:</span>
                    <span>B / Circle</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Rasengan / G5:</span>
                    <span>LB / RB Triggers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Haptics:</span>
                    <span className="text-emerald-400">Rumble Active</span>
                  </div>
                </div>
              </div>

              {/* Mobile Touch */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-['Orbitron']">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>MOBILE TOUCH</span>
                </div>
                <div className="text-xs text-zinc-300 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Movement:</span>
                    <span>Virtual 4-Way D-Pad</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Special Moves:</span>
                    <span>Action Orb Buttons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Chakra HUD:</span>
                    <span>Tap any Move Bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Orientation:</span>
                    <span>Portrait / Landscape</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: ANIME BONUS ITEMS */}
          <div>
            <h3 className="text-sm font-black text-amber-400 font-['Orbitron'] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>Rare Anime Treasures & Bonus Items</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ANIME_BONUS_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white truncate font-['Rajdhani']">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-amber-400 font-bold">
                      +{item.points} PTS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#080b1d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs font-['Orbitron'] rounded-xl"
          >
            UNDERSTOOD, SENSEI
          </button>
        </div>
      </div>
    </div>
  );
};
