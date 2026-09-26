import React, { useState } from 'react';
import { 
  GACHA_PAC_SKINS, 
  GACHA_GHOST_SKINS, 
  GACHA_MAZE_SKINS, 
  SHONEN_MOVES 
} from '../game/constants';
import { ShonenPowerType, GachaItem } from '../game/types';
import { useAuth } from '../firebase/AuthContext';
import { X, Sparkles, Zap, Flame, Crown, Gift, RefreshCw, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLocker: () => void;
}

export const GachaModal: React.FC<GachaModalProps> = ({ isOpen, onClose, onOpenLocker }) => {
  const { profile, unlockGachaItems, addCoins } = useAuth();
  const [isSummoning, setIsSummoning] = useState<boolean>(false);
  const [summonResults, setSummonResults] = useState<GachaItem[]>([]);
  const [bannerType, setBannerType] = useState<'ALL' | 'SKINS' | 'POWERS' | 'MAZES'>('ALL');

  if (!isOpen) return null;

  const coins = profile?.pacCoins || 0;
  const singleCost = 100;
  const multiCost = 900; // 10% discount for 10-pull!

  // Build pool of all gacha items
  const allGachaPool: GachaItem[] = [
    // Pac Skins
    ...GACHA_PAC_SKINS.map((s) => ({
      id: s.id,
      name: s.name,
      type: 'PAC_SKIN' as const,
      rarity: s.rarity,
      data: s,
      icon: s.previewIcon,
      source: s.animeSource,
    })),
    // Ghost Skins
    ...GACHA_GHOST_SKINS.map((g) => ({
      id: g.id,
      name: g.name,
      type: 'GHOST_SKIN' as const,
      rarity: g.rarity,
      data: g,
      icon: g.previewIcon,
      source: g.animeSource,
    })),
    // Maze Skins
    ...GACHA_MAZE_SKINS.map((m) => ({
      id: m.id,
      name: m.name,
      type: 'MAZE_SKIN' as const,
      rarity: m.rarity,
      data: m,
      icon: '🏛️',
      source: 'Stage Architecture',
    })),
    // Shonen Powers
    ...(Object.keys(SHONEN_MOVES) as ShonenPowerType[]).map((pKey) => {
      const p = SHONEN_MOVES[pKey];
      return {
        id: p.id,
        name: p.name,
        type: 'POWER_MOVE' as const,
        rarity: p.rarity,
        data: p,
        icon: p.icon,
        source: p.animeSource,
      };
    }),
  ];

  const performSummon = async (count: number) => {
    const cost = count === 1 ? singleCost : multiCost;
    if (coins < cost) return;

    setIsSummoning(true);
    setSummonResults([]);

    // Filter by banner if specified
    let pool = allGachaPool;
    if (bannerType === 'SKINS') pool = allGachaPool.filter((i) => i.type === 'PAC_SKIN' || i.type === 'GHOST_SKIN');
    if (bannerType === 'POWERS') pool = allGachaPool.filter((i) => i.type === 'POWER_MOVE');
    if (bannerType === 'MAZES') pool = allGachaPool.filter((i) => i.type === 'MAZE_SKIN');

    // Weighted roll based on rarity
    const pulled: GachaItem[] = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.random() * 100;
      let targetRarity = 'COMMON';
      if (roll > 96) targetRarity = 'MYTHIC';
      else if (roll > 86) targetRarity = 'LEGENDARY';
      else if (roll > 60) targetRarity = 'EPIC';
      else if (roll > 25) targetRarity = 'RARE';

      const matchedInRarity = pool.filter((item) => item.rarity === targetRarity);
      const chosen = matchedInRarity.length > 0
        ? matchedInRarity[Math.floor(Math.random() * matchedInRarity.length)]
        : pool[Math.floor(Math.random() * pool.length)];

      pulled.push(chosen);
    }

    // Save to Firebase profile
    const itemIds = pulled.map((p) => p.id);
    await unlockGachaItems(itemIds, cost);

    setTimeout(() => {
      setSummonResults(pulled);
      setIsSummoning(false);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FACC15', '#EC4899', '#38BDF8', '#A855F7'],
        });
      } catch {
        // ignore
      }
    }, 1200);
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'MYTHIC':
        return 'bg-gradient-to-r from-purple-500 to-rose-500 text-white border-purple-300 shadow-[0_0_10px_#a855f7]';
      case 'LEGENDARY':
        return 'bg-amber-500 text-black border-amber-300 shadow-[0_0_8px_#f59e0b]';
      case 'EPIC':
        return 'bg-purple-950 text-purple-300 border-purple-500/50';
      case 'RARE':
        return 'bg-blue-950 text-blue-300 border-blue-500/50';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0c1029] border border-amber-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-amber-900/50 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#080b1d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-['Orbitron'] tracking-wider flex items-center gap-2">
                <span>SHONEN GACHA SHRINE</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500 text-black">
                  36+ POWERS & SKINS
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Summon anime Pac-Man skins, Yokai spirits, maze textures & legendary special moves!
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

        {/* Balance & Banner Tabs */}
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['ALL', 'SKINS', 'POWERS', 'MAZES'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setBannerType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-['Orbitron'] transition-all ${
                  bannerType === t
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {t} BANNER
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#12193b] px-3 py-1 rounded-xl border border-amber-500/30">
            <span className="text-xs">🪙</span>
            <span className="text-sm font-black text-amber-400 font-['Orbitron']">
              {coins} Pac-Coins
            </span>
          </div>
        </div>

        {/* Summon Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center justify-center min-h-[300px]">
          {isSummoning ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-400 p-[3px] shadow-[0_0_40px_#f59e0b] animate-spin">
                <div className="w-full h-full bg-[#080b1d] rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-amber-400" />
                </div>
              </div>
              <h3 className="text-lg font-black text-white font-['Orbitron'] tracking-widest animate-bounce">
                SUMMONING SHONEN SPIRITS...
              </h3>
            </div>
          ) : summonResults.length > 0 ? (
            <div className="w-full space-y-4">
              <h3 className="text-center text-sm font-black text-amber-300 font-['Orbitron'] uppercase tracking-wider">
                ✨ CONGRATULATIONS! SUMMON RESULTS ✨
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-[320px] overflow-y-auto p-1">
                {summonResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border bg-[#111738] border-amber-500/40 flex flex-col items-center text-center justify-between shadow-lg shadow-black/40 animate-fadeIn"
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <div>
                      <div className="text-xs font-black text-white truncate font-['Rajdhani']">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{item.source}</div>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded border mt-2 ${getRarityBadge(
                        item.rarity
                      )}`}
                    >
                      {item.rarity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg text-center space-y-4 py-4">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141b42] to-[#0a0f26] border border-amber-500/30 shadow-xl relative overflow-hidden">
                <div className="text-4xl mb-2">⚡ 🌊 🌌 ⚔️ ☀️</div>
                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-rose-400 font-['Orbitron'] tracking-wider">
                  CELESTIAL CHAKRA BANNER
                </h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-sm mx-auto">
                  Unlock Super Saiyan, Joy Boy Sun God, Limitless Sorcerer, and 34+ Shonen Power-Ups!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summon Buttons */}
        <div className="px-5 py-4 border-t border-zinc-800 bg-[#080b1d] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenLocker();
            }}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Open Locker</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* 1x Summon */}
            <button
              onClick={() => performSummon(1)}
              disabled={coins < singleCost || isSummoning}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-black text-xs font-['Orbitron'] rounded-xl disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <span>1x SUMMON</span>
              <span className="text-[10px] text-zinc-400">(🪙100)</span>
            </button>

            {/* 10x Summon */}
            <button
              onClick={() => performSummon(10)}
              disabled={coins < multiCost || isSummoning}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:scale-105 text-black font-black text-xs font-['Orbitron'] rounded-xl shadow-lg shadow-amber-500/30 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>10x SUMMON</span>
              <span className="text-[10px] font-bold bg-black/30 px-1 rounded text-black">
                🪙900
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
