import React from 'react';
import { 
  Play, 
  Map, 
  Sparkles, 
  Gamepad2, 
  Trophy, 
  Layers, 
  Gift, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Film,
  Crown,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { GameDifficulty, RenderPerspective } from '../game/types';
import { GACHA_PAC_SKINS } from '../game/constants';

interface HomeScreenProps {
  currentLevel: number;
  highestLevelReached: number;
  coins: number;
  displayName: string;
  avatarUrl?: string;
  equippedSkinId: string;
  difficulty: GameDifficulty;
  onChangeDifficulty: (diff: GameDifficulty) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onStartCampaign: () => void; // Opens Candy Crush Map Selection
  onQuickPlay: () => void; // Starts current level immediately
  onOpenGacha: () => void;
  onOpenLocker: () => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
  onOpenThemes: () => void;
  onOpenShowcase: () => void;
  onOpenReplays: () => void;
  onOpenBestiary: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentLevel,
  highestLevelReached,
  coins,
  displayName,
  avatarUrl,
  equippedSkinId,
  difficulty,
  onChangeDifficulty,
  isMuted,
  onToggleMute,
  onStartCampaign,
  onQuickPlay,
  onOpenGacha,
  onOpenLocker,
  onOpenMissions,
  onOpenLeaderboard,
  onOpenThemes,
  onOpenShowcase,
  onOpenReplays,
  onOpenBestiary,
}) => {
  const skin = GACHA_PAC_SKINS.find((s) => s.id === equippedSkinId) || GACHA_PAC_SKINS[0];

  const getRankBadge = (lvl: number) => {
    if (lvl >= 100) return { title: 'KAGE DEITY', color: 'bg-rose-500/20 text-rose-300 border-rose-500/50' };
    if (lvl >= 50) return { title: 'JONIN ELITE', color: 'bg-amber-500/20 text-amber-300 border-amber-500/50' };
    if (lvl >= 20) return { title: 'CHUNIN WARRIOR', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' };
    return { title: 'GENIN RECRUIT', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' };
  };

  const rank = getRankBadge(highestLevelReached);

  return (
    <div className="w-full min-h-[92vh] max-w-5xl mx-auto flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-fadeIn">
      {/* Top Player Profile Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-[#0b0f24]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/30 shadow-xl shadow-black/50">
        {/* Left: Player Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-400 p-[2px] shadow-md shadow-cyan-500/30">
            <div className="w-full h-full rounded-[10px] bg-[#070a1a] flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: skin.color || '#facc15' }}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white font-['Orbitron'] truncate max-w-[140px] sm:max-w-[200px]">
                {displayName}
              </span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${rank.color}`}>
                {rank.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>STAGE {highestLevelReached} REACHED</span>
              <span>•</span>
              <span className="text-amber-400 font-bold font-mono">🪙 {coins.toLocaleString()} COINS</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Settings & Difficulty */}
        <div className="flex items-center gap-2">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-700/60 rounded-xl px-2.5 py-1">
            <span className="text-[10px] text-zinc-400 font-bold">MODE:</span>
            <select
              value={difficulty}
              onChange={(e) => onChangeDifficulty(e.target.value as GameDifficulty)}
              className="bg-transparent text-[11px] font-bold text-amber-300 font-['Orbitron'] focus:outline-none cursor-pointer"
            >
              <option value="EASY" className="bg-zinc-900 text-white">EASY</option>
              <option value="NORMAL" className="bg-zinc-900 text-white">NORMAL</option>
              <option value="HARD" className="bg-zinc-900 text-white">HARD</option>
              <option value="GHOSTLY" className="bg-zinc-900 text-white">GHOSTLY</option>
              <option value="HUNTER" className="bg-zinc-900 text-white">HUNTER</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition-all cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>
        </div>
      </div>

      {/* Hero Showcase Centerpiece */}
      <div className="flex flex-col items-center text-center my-6 sm:my-8 relative">
        {/* Glowing Background Radial */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-cyan-500/20 via-amber-400/20 to-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Kanji Subtitle */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-bold font-['Orbitron'] tracking-widest mb-2 shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>鬼滅パック • SHONEN ARCADE CHRONICLES</span>
        </div>

        {/* Grand Title Logo */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-300 to-rose-500 drop-shadow-[0_0_35px_rgba(6,182,212,0.6)]">
          AniPac
        </h1>

        <p className="text-xs sm:text-sm text-zinc-300 max-w-md mt-1 font-medium">
          1001 Infinite Neon Mazes • Shonen Jutsu Powers • Ghost Combo Multipliers
        </p>

        {/* Character Facing Oni Ghosts Lineup */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mt-6 p-3 rounded-2xl bg-black/40 border border-zinc-800/80 backdrop-blur-sm">
          {/* Pac-Man Hero */}
          <div className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center shadow-[0_0_20px_#facc15] relative animate-bounce">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-black" />
            </div>
            <span className="text-[10px] font-black text-amber-300 font-['Orbitron']">
              {skin.name.split(' ')[0]}
            </span>
          </div>

          <div className="text-rose-500 font-black text-lg font-['Orbitron'] animate-pulse">
            VS
          </div>

          {/* 4 Oni Ghosts */}
          <div className="flex items-center gap-2">
            {[
              { name: 'Akuma', color: '#EF4444', glow: '#ef4444' },
              { name: 'Kitsune', color: '#F472B6', glow: '#f472b6' },
              { name: 'Raiden', color: '#38BDF8', glow: '#38bdf8' },
              { name: 'Kage', color: '#FB923C', glow: '#fb923c' },
            ].map((g) => (
              <div key={g.name} className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-t-full relative flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                  style={{
                    backgroundColor: g.color,
                    boxShadow: `0 0 12px ${g.glow}`,
                  }}
                >
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-blue-900" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-blue-900" />
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-zinc-400">
                  {g.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-6 w-full max-w-md">
          {/* Main Campaign Map Selection (Candy Crush Style) */}
          <button
            onClick={onStartCampaign}
            className="w-full flex-1 py-4 px-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-black font-black text-base font-['Orbitron'] tracking-wider rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Map className="w-5 h-5 fill-current text-black group-hover:rotate-12 transition-transform" />
            <span>MAP CAMPAIGN</span>
            <ChevronRight className="w-5 h-5 text-black/70 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Quick Play at current level */}
          <button
            onClick={onQuickPlay}
            className="w-full sm:w-auto py-4 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-black text-sm font-['Orbitron'] tracking-wider rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>STAGE {currentLevel}</span>
          </button>
        </div>
      </div>

      {/* Navigation Hub Cards Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Candy Crush World Map */}
        <button
          onClick={onStartCampaign}
          className="p-3 sm:p-4 rounded-xl bg-[#090d20]/80 hover:bg-[#0f1736] border border-cyan-500/30 hover:border-cyan-400/70 transition-all flex flex-col items-start text-left group shadow-lg shadow-black/40 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
            <Map className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white font-['Orbitron']">
            WORLD MAPS
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            Candy Crush Level Trail
          </span>
        </button>

        {/* Shonen Gacha */}
        <button
          onClick={onOpenGacha}
          className="p-3 sm:p-4 rounded-xl bg-[#090d20]/80 hover:bg-[#0f1736] border border-amber-500/30 hover:border-amber-400/70 transition-all flex flex-col items-start text-left group shadow-lg shadow-black/40 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mb-2 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white font-['Orbitron']">
            SHONEN GACHA
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            Skins, Mazes & Ghosts
          </span>
        </button>

        {/* Shinobi Locker */}
        <button
          onClick={onOpenLocker}
          className="p-3 sm:p-4 rounded-xl bg-[#090d20]/80 hover:bg-[#0f1736] border border-purple-500/30 hover:border-purple-400/70 transition-all flex flex-col items-start text-left group shadow-lg shadow-black/40 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 mb-2 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white font-['Orbitron']">
            NINJA LOCKER
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            Equip Skins & Powers
          </span>
        </button>

        {/* Daily Missions */}
        <button
          onClick={onOpenMissions}
          className="p-3 sm:p-4 rounded-xl bg-[#090d20]/80 hover:bg-[#0f1736] border border-emerald-500/30 hover:border-emerald-400/70 transition-all flex flex-col items-start text-left group shadow-lg shadow-black/40 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white font-['Orbitron']">
            DAILY MISSIONS
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            Earn Pac-Coins
          </span>
        </button>

        {/* Global Leaderboards */}
        <button
          onClick={onOpenLeaderboard}
          className="p-3 sm:p-4 rounded-xl bg-[#090d20]/80 hover:bg-[#0f1736] border border-yellow-500/30 hover:border-yellow-400/70 transition-all flex flex-col items-start text-left group shadow-lg shadow-black/40 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white font-['Orbitron']">
            LEADERBOARD
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            Top Shinobi Rankings
          </span>
        </button>

        {/* Themes & Anime GIF Studio */}
        <button
          onClick={onOpenThemes}
          className="p-3 sm:p-4 rounded-xl bg-[#090d20]/80 hover:bg-[#0f1736] border border-rose-500/30 hover:border-rose-400/70 transition-all flex flex-col items-start text-left group shadow-lg shadow-black/40 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 mb-2 group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white font-['Orbitron']">
            ANIME GIF STUDIO
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            Live Otakugifs API
          </span>
        </button>

        {/* Move Showcase */}
        <button
          onClick={onOpenShowcase}
          className="p-3 sm:p-4 rounded-xl bg-[#090d20]/80 hover:bg-[#0f1736] border border-blue-500/30 hover:border-blue-400/70 transition-all flex flex-col items-start text-left group shadow-lg shadow-black/40 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 mb-2 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white font-['Orbitron']">
            JUTSU POWERS
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            Saiyan, Bankai & Void
          </span>
        </button>

        {/* Ghost Bestiary */}
        <button
          onClick={onOpenBestiary}
          className="p-3 sm:p-4 rounded-xl bg-[#090d20]/80 hover:bg-[#0f1736] border border-cyan-500/30 hover:border-cyan-400/70 transition-all flex flex-col items-start text-left group shadow-lg shadow-black/40 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white font-['Orbitron']">
            GHOST BESTIARY
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            Yokai Lore & Weaknesses
          </span>
        </button>

        {/* Replay Vault */}
        <button
          onClick={onOpenReplays}
          className="p-3 sm:p-4 rounded-xl bg-[#090d20]/80 hover:bg-[#0f1736] border border-sky-500/30 hover:border-sky-400/70 transition-all flex flex-col items-start text-left group shadow-lg shadow-black/40 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 mb-2 group-hover:scale-110 transition-transform">
            <Film className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white font-['Orbitron']">
            GHOST RACER
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            Ghost Replay Vault
          </span>
        </button>
      </div>

      {/* Retro Arcade Controls Footer */}
      <div className="mt-4 py-2 px-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-400">
        <span>⌨️ <strong className="text-zinc-200">Arrows / WASD</strong> to Move</span>
        <span>•</span>
        <span>⚡ <strong className="text-zinc-200">Space / 1-6</strong> Shonen Jutsus</span>
        <span>•</span>
        <span>🌈 <strong className="text-zinc-200">100 Pellets</strong> = 7s Rainbow Fever</span>
        <span>•</span>
        <span>🖥️ <strong className="text-zinc-200">'F'</strong> Toggle Fill Screen</span>
      </div>
    </div>
  );
};
