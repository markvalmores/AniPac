import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Lock, 
  Star, 
  Crown, 
  Gift, 
  Sparkles, 
  Zap, 
  Trophy, 
  Search, 
  Check, 
  Compass, 
  ChevronRight,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';
import { GameDifficulty } from '../game/types';
import { TOTAL_LEVELS, GACHA_PAC_SKINS } from '../game/constants';

interface CandyCrushMapSelectProps {
  currentLevel: number;
  maxUnlockedLevel: number;
  onSelectLevel: (lvl: number) => void;
  onBackToHome: () => void;
  coins: number;
  equippedSkinId: string;
  difficulty: GameDifficulty;
  onChangeDifficulty: (diff: GameDifficulty) => void;
}

interface BiomeInfo {
  id: number;
  name: string;
  subname: string;
  startLevel: number;
  endLevel: number;
  bgGradient: string;
  themeColor: string;
  borderColor: string;
  icon: string;
}

const BIOMES: BiomeInfo[] = [
  {
    id: 1,
    name: 'Neo-Tokyo Shinjuku',
    subname: 'Neon Cyber Alleys',
    startLevel: 1,
    endLevel: 10,
    bgGradient: 'from-cyan-950/80 via-blue-950/70 to-[#070b1e]',
    themeColor: '#00f0ff',
    borderColor: 'border-cyan-500/40',
    icon: '🏙️',
  },
  {
    id: 2,
    name: 'Cherry Blossom Shrine',
    subname: 'Sakura Petal Sanctuary',
    startLevel: 11,
    endLevel: 20,
    bgGradient: 'from-pink-950/80 via-rose-950/70 to-[#070b1e]',
    themeColor: '#ff77a9',
    borderColor: 'border-pink-500/40',
    icon: '🌸',
  },
  {
    id: 3,
    name: 'Demon Mountain Night',
    subname: 'Volcanic Onigashima',
    startLevel: 21,
    endLevel: 30,
    bgGradient: 'from-red-950/80 via-orange-950/70 to-[#070b1e]',
    themeColor: '#ef4444',
    borderColor: 'border-red-500/40',
    icon: '👹',
  },
  {
    id: 4,
    name: 'Thunder God Citadel',
    subname: 'Raijin Electric Spire',
    startLevel: 31,
    endLevel: 40,
    bgGradient: 'from-amber-950/80 via-yellow-950/70 to-[#070b1e]',
    themeColor: '#facc15',
    borderColor: 'border-amber-500/40',
    icon: '⚡',
  },
  {
    id: 5,
    name: 'Cosmic Void Sanctuary',
    subname: 'Infinite Domain Expansion',
    startLevel: 41,
    endLevel: 50,
    bgGradient: 'from-purple-950/80 via-indigo-950/70 to-[#070b1e]',
    themeColor: '#a855f7',
    borderColor: 'border-purple-500/40',
    icon: '🌌',
  },
  {
    id: 6,
    name: 'Edo Great Wave Shore',
    subname: 'Ukiyo-e Ocean Tempest',
    startLevel: 51,
    endLevel: 60,
    bgGradient: 'from-blue-950/80 via-sky-950/70 to-[#070b1e]',
    themeColor: '#38bdf8',
    borderColor: 'border-sky-500/40',
    icon: '🌊',
  },
  {
    id: 7,
    name: 'Mecha Cyber Matrix',
    subname: 'Carbon Fiber Core',
    startLevel: 61,
    endLevel: 70,
    bgGradient: 'from-emerald-950/80 via-teal-950/70 to-[#070b1e]',
    themeColor: '#10b981',
    borderColor: 'border-emerald-500/40',
    icon: '🤖',
  },
  {
    id: 8,
    name: 'Inferno Dragon Abyss',
    subname: 'Molten Dragon Forge',
    startLevel: 71,
    endLevel: 80,
    bgGradient: 'from-orange-950/80 via-red-950/70 to-[#070b1e]',
    themeColor: '#f97316',
    borderColor: 'border-orange-500/40',
    icon: '🐉',
  },
  {
    id: 9,
    name: 'Akihabara Gradient Neon',
    subname: 'Holographic Arcade Matrix',
    startLevel: 81,
    endLevel: 90,
    bgGradient: 'from-fuchsia-950/80 via-purple-950/70 to-[#070b1e]',
    themeColor: '#ec4899',
    borderColor: 'border-fuchsia-500/40',
    icon: '🎮',
  },
  {
    id: 10,
    name: 'Solar Zenith Palace',
    subname: 'Sun God Enlightenment',
    startLevel: 91,
    endLevel: 100,
    bgGradient: 'from-yellow-950/80 via-amber-950/70 to-[#070b1e]',
    themeColor: '#eab308',
    borderColor: 'border-yellow-500/40',
    icon: '☀️',
  },
];

export const CandyCrushMapSelect: React.FC<CandyCrushMapSelectProps> = ({
  currentLevel,
  maxUnlockedLevel,
  onSelectLevel,
  onBackToHome,
  coins,
  equippedSkinId,
  difficulty,
  onChangeDifficulty,
}) => {
  const [selectedStage, setSelectedStage] = useState<number>(currentLevel);
  const [activeBiomeId, setActiveBiomeId] = useState<number>(() => {
    const b = BIOMES.find((bm) => currentLevel >= bm.startLevel && currentLevel <= bm.endLevel);
    return b ? b.id : 1;
  });
  const [searchJump, setSearchJump] = useState<string>('');
  const [claimedChests, setClaimedChests] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('anipac_claimed_map_chests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentNodeRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const skin = GACHA_PAC_SKINS.find((s) => s.id === equippedSkinId) || GACHA_PAC_SKINS[0];

  // Auto-scroll to current active stage node on load
  useEffect(() => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeBiomeId]);

  // Selected biome range: display 20 levels around the selected biome
  const currentBiome = BIOMES.find((b) => b.id === activeBiomeId) || BIOMES[0];
  const biomeStart = (activeBiomeId - 1) * 10 + 1;
  const biomeEnd = Math.min(TOTAL_LEVELS, biomeStart + 9);
  const levelsInView = Array.from({ length: biomeEnd - biomeStart + 1 }, (_, i) => biomeStart + i);

  // Candy crush serpentine horizontal offsets for snake trail
  // pattern: 50% -> 72% -> 85% -> 72% -> 50% -> 28% -> 15% -> 28% -> 50%
  const getSnakeOffsetPercent = (lvl: number) => {
    const cycle = (lvl - 1) % 8;
    switch (cycle) {
      case 0: return 50;
      case 1: return 72;
      case 2: return 85;
      case 3: return 72;
      case 4: return 50;
      case 5: return 28;
      case 6: return 15;
      case 7: return 28;
      default: return 50;
    }
  };

  const handleClaimChest = (milestoneLvl: number) => {
    if (claimedChests.includes(milestoneLvl)) return;
    const updated = [...claimedChests, milestoneLvl];
    setClaimedChests(updated);
    localStorage.setItem('anipac_claimed_map_chests', JSON.stringify(updated));
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(searchJump, 10);
    if (!isNaN(val) && val >= 1 && val <= TOTAL_LEVELS) {
      setSelectedStage(val);
      const b = BIOMES.find((bm) => val >= bm.startLevel && val <= bm.endLevel);
      if (b) setActiveBiomeId(b.id);
    }
  };

  return (
    <div className="w-full h-full min-h-[92vh] max-w-4xl mx-auto flex flex-col bg-[#070a1a] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl relative select-none animate-fadeIn">
      {/* Top Map Selection Header Bar */}
      <div className="w-full px-4 py-3 bg-[#0a0e27]/95 backdrop-blur-md border-b border-cyan-500/30 flex items-center justify-between gap-2 z-20 shadow-lg">
        {/* Back to Home Button */}
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-cyan-950/80 border border-zinc-700/80 hover:border-cyan-500/60 text-xs font-bold font-['Orbitron'] text-cyan-300 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>HOME</span>
        </button>

        {/* Biome Title & Level Indicator */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-black font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300">
            <span>{currentBiome.icon}</span>
            <span>{currentBiome.name.toUpperCase()}</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">
            STAGES {biomeStart} - {biomeEnd} • CANDY TRAIL
          </span>
        </div>

        {/* Quick Stage Jump & Search */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={TOTAL_LEVELS}
            value={searchJump}
            onChange={(e) => setSearchJump(e.target.value)}
            placeholder="Stage #..."
            className="w-20 sm:w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-['Orbitron']"
          />
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all cursor-pointer"
            title="Jump to Stage"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Biome / World Tabs Slider */}
      <div className="w-full px-3 py-2 bg-[#080b1d] border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none z-10">
        {BIOMES.map((b) => {
          const isCurrent = activeBiomeId === b.id;
          const isUnlocked = maxUnlockedLevel >= b.startLevel;
          return (
            <button
              key={b.id}
              onClick={() => setActiveBiomeId(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-['Orbitron'] whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                  : isUnlocked
                  ? 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                  : 'bg-zinc-950/60 text-zinc-600 border border-zinc-900'
              }`}
            >
              <span>{b.icon}</span>
              <span>W{b.id}: {b.name.split(' ')[0]}</span>
              {!isUnlocked && <Lock className="w-3 h-3 text-zinc-600 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Main Candy Crush Serpentine Trail Canvas Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 relative bg-gradient-to-b from-[#090d24] via-[#050716] to-[#090d24]"
      >
        {/* Dynamic Biome Background Atmosphere */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${currentBiome.bgGradient} opacity-30 pointer-events-none transition-all duration-700`}
        />

        {/* Ambient Star particles in backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#000000_90%)] pointer-events-none" />

        {/* Winding Trail Column */}
        <div className="relative w-full max-w-md mx-auto py-8 min-h-[700px] flex flex-col justify-end">
          {/* SVG Serpentine Road Connecting Path */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="candyRoadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#facc15" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Smooth curvy path connecting all levels in view */}
            <path
              d={levelsInView
                .map((lvl, idx) => {
                  const x = getSnakeOffsetPercent(lvl);
                  const y = 92 - (idx / (levelsInView.length - 1 || 1)) * 84;
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="url(#candyRoadGrad)"
              strokeWidth="3.5"
              strokeDasharray="4 2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
            />
          </svg>

          {/* Level Nodes on the Path (Bottom to Top) */}
          <div className="relative z-10 flex flex-col-reverse gap-10 sm:gap-14">
            {levelsInView.map((lvl) => {
              const isCurrent = lvl === currentLevel;
              const isSelected = lvl === selectedStage;
              const isUnlocked = lvl <= maxUnlockedLevel;
              const isBossMilestone = lvl % 5 === 0;
              const xOffset = getSnakeOffsetPercent(lvl);

              return (
                <div
                  key={lvl}
                  ref={isCurrent ? currentNodeRef : null}
                  style={{
                    marginLeft: `${Math.max(5, Math.min(85, xOffset - 10))}%`,
                  }}
                  className="relative flex items-center justify-start w-fit group"
                >
                  {/* Pac-Man Character Avatar sitting on Current Active Level */}
                  {isCurrent && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 animate-bounce">
                      <div className="px-2 py-0.5 rounded-full bg-cyan-500 text-black font-black text-[9px] font-['Orbitron'] shadow-[0_0_12px_#00f0ff] uppercase whitespace-nowrap">
                        YOU ARE HERE
                      </div>
                      <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-[0_0_16px_#facc15] relative mt-0.5">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-black" />
                      </div>
                    </div>
                  )}

                  {/* Level Node Jewel Button */}
                  <button
                    onClick={() => {
                      setSelectedStage(lvl);
                    }}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer select-none ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-cyan-400 via-yellow-300 to-amber-400 ring-4 ring-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.9)] scale-110'
                        : isUnlocked
                        ? isBossMilestone
                          ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 ring-2 ring-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:scale-105'
                          : 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105'
                        : 'bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700/60 opacity-60'
                    }`}
                  >
                    {/* Top Gloss Highlight */}
                    <div className="absolute top-1 left-2 right-2 h-4 rounded-full bg-white/30 blur-[1px] pointer-events-none" />

                    {/* Level Number or Lock */}
                    {isUnlocked ? (
                      <div className="flex flex-col items-center leading-none">
                        {isBossMilestone && (
                          <Crown className="w-3.5 h-3.5 text-yellow-200 fill-current mb-0.5 drop-shadow" />
                        )}
                        <span className="text-base sm:text-lg font-black text-white font-['Orbitron'] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {lvl}
                        </span>
                      </div>
                    ) : (
                      <Lock className="w-5 h-5 text-zinc-400" />
                    )}

                    {/* 3 Candy Stars Underneath */}
                    {isUnlocked && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-black/80 px-1.5 py-0.5 rounded-full border border-black/50 shadow-md">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <Star className={`w-2.5 h-2.5 ${lvl < maxUnlockedLevel ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
                        <Star className={`w-2.5 h-2.5 ${lvl < maxUnlockedLevel - 1 ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
                      </div>
                    )}
                  </button>

                  {/* Milestone Reward Chest beside the trail on 5th & 10th stages */}
                  {isBossMilestone && (
                    <div className="ml-3 flex items-center">
                      <button
                        onClick={() => handleClaimChest(lvl)}
                        className={`p-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                          claimedChests.includes(lvl)
                            ? 'bg-zinc-900/90 text-zinc-500 border border-zinc-800'
                            : isUnlocked
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black animate-pulse shadow-lg shadow-amber-500/40 hover:scale-110'
                            : 'bg-zinc-900/60 text-zinc-600 border border-zinc-800'
                        }`}
                        title={claimedChests.includes(lvl) ? 'Chest Claimed!' : `Milestone Chest: +${lvl * 30} Pac-Coins!`}
                      >
                        <Gift className="w-4 h-4 fill-current" />
                        <span className="text-[10px] font-black font-['Orbitron']">
                          {claimedChests.includes(lvl) ? 'CLAIMED' : `+${lvl * 30} 🪙`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Stage Launch Drawer / Action Bar */}
      <div className="w-full px-4 py-3 bg-[#0a0e27]/95 backdrop-blur-md border-t border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 z-20 shadow-2xl">
        {/* Left: Selected Stage Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-400 p-[2px] shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-[#070a1a] flex flex-col items-center justify-center">
              <span className="text-[8px] text-zinc-400 font-bold uppercase font-['Orbitron']">STAGE</span>
              <span className="text-base font-black text-amber-300 font-['Orbitron'] leading-none">
                {selectedStage}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white font-['Orbitron']">
                {currentBiome.name}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-cyan-500/30">
                {difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span>Goal: Eat all Pellets & Power Orbs</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">4 Oni Ghosts</span>
            </div>
          </div>
        </div>

        {/* Right: Difficulty & Start Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-[11px] text-zinc-400">
            <span>Target: 25,000 Pts ⭐⭐⭐</span>
            <span className="text-amber-400 font-mono font-bold">🪙 {coins.toLocaleString()} Coins</span>
          </div>

          <button
            onClick={() => onSelectLevel(selectedStage)}
            className="py-3 px-6 sm:px-8 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-black font-black text-sm font-['Orbitron'] tracking-wider rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START BATTLE</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
