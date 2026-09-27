import React, { useState } from 'react';
import { X, BookOpen, ShieldAlert, Zap, Skull, Award, Sparkles, Flame, Eye } from 'lucide-react';
import { GameDifficulty } from '../game/types';

interface GhostBestiaryEntry {
  id: string;
  name: string;
  jpName: string;
  title: string;
  color: string;
  glowColor: string;
  role: string;
  minLevelToUnlock: number;
  minDifficultyToUnlock: GameDifficulty;
  speedRating: string;
  pointValue: string;
  lore: string;
  strategy: string;
  weakness: string;
}

const BESTIARY_GHOSTS: GhostBestiaryEntry[] = [
  {
    id: 'AKUMA',
    name: 'Akuma (Red Oni)',
    jpName: '赤鬼 • 悪魔',
    title: 'The Relentless Hunter',
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    role: 'Primary Hunter & Direct Pursuit',
    minLevelToUnlock: 1,
    minDifficultyToUnlock: 'EASY',
    speedRating: '⚡⚡⚡ Fast (1.0x)',
    pointValue: '200 - 1,600 pts',
    lore: 'An ancient crimson ogre spirit awakened from the nether realms of Mount Oedo. Akuma locks onto the shinobi’s chakra signature and relentlessly closes the distance with zero hesitation.',
    strategy: 'Akuma mirrors your path with predictive forward leading in higher difficulties. Use Shonen Jutsus like Domain Expansion or Kamehameha to vaporize him instantly.',
    weakness: 'Vulnerable to 100-pellet Rainbow Fever invincibility and linear beam attacks.',
  },
  {
    id: 'KITSUNE',
    name: 'Kitsune (Pink Fox)',
    jpName: '狐 • 妖狐',
    title: 'The Ambush Trickster',
    color: '#F472B6',
    glowColor: 'rgba(244, 114, 182, 0.7)',
    role: 'Ambusher & Corner Trapper',
    minLevelToUnlock: 3,
    minDifficultyToUnlock: 'HARD',
    speedRating: '⚡⚡⚡ Agile (0.95x)',
    pointValue: '200 - 1,600 pts',
    lore: 'A cunning nine-tailed fox Yokai that masters the art of deception. Kitsune does not chase directly; instead, she calculates ahead of your path to cut off escape routes at 4-way intersections.',
    strategy: 'Never blindly run down straight corridors when Kitsune is active. Look ahead at upcoming alleyways and utilize instantaneous Warp Tunnels to break her predictive trap.',
    weakness: 'Gets disoriented by sudden direction reversals and Shadow Clones.',
  },
  {
    id: 'RAIDEN',
    name: 'Raiden (Cyan Raijin)',
    jpName: '雷神 • 雷電',
    title: 'The Thunder Flanker',
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    role: 'Pincer Squeeze Coordinator',
    minLevelToUnlock: 5,
    minDifficultyToUnlock: 'GHOSTLY',
    speedRating: '⚡⚡⚡⚡ Blazing (0.92x)',
    pointValue: '200 - 1,600 pts',
    lore: 'Channeling the divine thunder of Raijin, this cyan specter coordinates with Akuma to establish a symmetric double-sided pincer squeeze, trapping shinobi between two elemental fronts.',
    strategy: 'Keep track of both Akuma and Raiden’s positions. Escaping the pincer requires timing your Ki energy dash or triggering Gear 5 Bounce to leap across obstacles.',
    weakness: 'Vulnerable when isolated from Akuma; slow recovery after missing an interception.',
  },
  {
    id: 'KAGE',
    name: 'Kage (Shadow Spectre)',
    jpName: '影 • 怨霊',
    title: 'The Wandering Phantom',
    color: '#F97316',
    glowColor: 'rgba(249, 115, 22, 0.7)',
    role: 'Patroller & Chokepoint Guard',
    minLevelToUnlock: 7,
    minDifficultyToUnlock: 'HUNTER',
    speedRating: '⚡⚡ Stealthy (0.88x)',
    pointValue: '200 - 1,600 pts',
    lore: 'A solitary phantom born from unfulfilled shinobi vengeance. Kage patrols remaining pellet stashes and guards corner chokepoints, shifting between stealth stalking and aggressive lockdown.',
    strategy: 'Kage is unpredictable when far away but retreats to his home corner when cornered. Clear power orbs to force him into a panicked fleeing state.',
    weakness: 'Extremely vulnerable during Rainbow Fever mode and Rasengan Vacuum pulls.',
  },
  {
    id: 'FEVER_PHANTOM',
    name: 'Fever Phantom (Rainbow Yokai)',
    jpName: '虹 • 幻影',
    title: 'The Rainbow Overlord',
    color: '#F43F5E',
    glowColor: 'rgba(244, 63, 94, 0.9)',
    role: 'Fever Manifestation',
    minLevelToUnlock: 10,
    minDifficultyToUnlock: 'HUNTER',
    speedRating: '⚡⚡⚡⚡⚡ Hyper (1.4x)',
    pointValue: '3,200 pts',
    lore: 'A mythical celestial Yokai that only materializes when the shinobi achieves 100-pellet Rainbow Fever. Imbued with prismatic chakra, granting massive multiplier bonuses upon exorcism.',
    strategy: 'Chase him aggressively during the 7-second Rainbow Fever window for maximum x16 combo points and Pac-Coin bounties!',
    weakness: 'Only exists while Rainbow Fever chakra aura is active.',
  },
];

interface GhostBestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  highestLevel: number;
  currentDifficulty: GameDifficulty;
  totalGhostsEaten: number;
}

export const GhostBestiaryModal: React.FC<GhostBestiaryModalProps> = ({
  isOpen,
  onClose,
  highestLevel,
  currentDifficulty,
  totalGhostsEaten,
}) => {
  const [selectedGhostId, setSelectedGhostId] = useState<string>('AKUMA');

  if (!isOpen) return null;

  const difficultyRank: Record<GameDifficulty, number> = {
    EASY: 1,
    NORMAL: 2,
    HARD: 3,
    GHOSTLY: 4,
    HUNTER: 5,
  };

  const currentDiffRank = difficultyRank[currentDifficulty] || 2;

  const isUnlocked = (ghost: GhostBestiaryEntry) => {
    if (ghost.id === 'AKUMA') return true;
    const reqDiffRank = difficultyRank[ghost.minDifficultyToUnlock] || 2;
    return highestLevel >= ghost.minLevelToUnlock || currentDiffRank >= reqDiffRank || totalGhostsEaten >= 10;
  };

  const selectedGhost = BESTIARY_GHOSTS.find((g) => g.id === selectedGhostId) || BESTIARY_GHOSTS[0];
  const unlockedCount = BESTIARY_GHOSTS.filter((g) => isUnlocked(g)).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#080d21] border-2 border-cyan-500/50 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b102b] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-300 to-rose-400 font-['Orbitron'] tracking-wider">
                YOKAI GHOST BESTIARY
              </h2>
              <p className="text-xs text-zinc-400 font-['Rajdhani'] font-bold">
                Discovered: <span className="text-cyan-300 font-mono font-black">{unlockedCount} / {BESTIARY_GHOSTS.length}</span> Spirits • Lore & Tactical Weaknesses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Ghost List */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-zinc-400 font-['Orbitron'] uppercase tracking-wider px-1">
              Encountered Spirits
            </span>
            {BESTIARY_GHOSTS.map((ghost) => {
              const unlocked = isUnlocked(ghost);
              const isSelected = ghost.id === selectedGhostId;

              return (
                <button
                  key={ghost.id}
                  onClick={() => unlocked && setSelectedGhostId(ghost.id)}
                  disabled={!unlocked}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center gap-3.5 relative overflow-hidden ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                      : unlocked
                      ? 'bg-zinc-900/70 hover:bg-zinc-800/80 border-zinc-700/60 cursor-pointer'
                      : 'bg-zinc-950/40 border-zinc-800/40 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md relative"
                    style={{
                      backgroundColor: unlocked ? ghost.color : '#27272a',
                      boxShadow: unlocked ? `0 0 12px ${ghost.glowColor}` : 'none',
                    }}
                  >
                    {unlocked ? (
                      <Skull className="w-5 h-5 text-black drop-shadow" />
                    ) : (
                      <Eye className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-black text-white font-['Orbitron'] truncate">
                      {unlocked ? ghost.name : '??? LOCKED SPIRIT'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-['Rajdhani'] font-bold truncate">
                      {unlocked ? ghost.jpName : `Unlock at Stage ${ghost.minLevelToUnlock}`}
                    </span>
                  </div>

                  {unlocked && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right 2 Columns: Detailed Lore & Tactics */}
          <div className="md:col-span-2 bg-[#090e24]/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shrink-0"
                  style={{
                    backgroundColor: selectedGhost.color,
                    boxShadow: `0 0 25px ${selectedGhost.glowColor}`,
                  }}
                >
                  <Skull className="w-8 h-8 text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-['Orbitron']">
                      {selectedGhost.jpName}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-['Orbitron']">
                      {selectedGhost.speedRating}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Orbitron'] tracking-wider mt-1">
                    {selectedGhost.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-['Rajdhani'] font-bold">
                    {selectedGhost.title} • {selectedGhost.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Lore Description */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-cyan-400 font-['Orbitron'] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Yokai Lore & Background
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-black/30 p-3.5 rounded-2xl border border-zinc-800">
                {selectedGhost.lore}
              </p>
            </div>

            {/* Tactical Strategy */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-amber-400 font-['Orbitron'] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Tactical Behavior & Strategy
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-black/30 p-3.5 rounded-2xl border border-zinc-800">
                {selectedGhost.strategy}
              </p>
            </div>

            {/* Combat Weakness */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-rose-400 font-['Orbitron'] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Exorcism Weakness & Bounty
              </span>
              <div className="bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-rose-200 font-medium">
                  {selectedGhost.weakness}
                </p>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-zinc-400 block font-bold">BOUNTY</span>
                  <span className="text-xs sm:text-sm font-black text-amber-300 font-['Orbitron']">
                    {selectedGhost.pointValue}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
