import React from 'react';
import { useAuth } from '../firebase/AuthContext';
import { 
  Trophy, 
  Sparkles, 
  Gamepad2, 
  Volume2, 
  VolumeX, 
  Layers, 
  BookOpen, 
  LogIn, 
  LogOut, 
  Calendar,
  Crown,
  Sliders,
  Eye,
  ShieldAlert,
  Film,
  Maximize,
  Maximize2,
  Minimize2,
  Ghost as GhostIcon,
  Tv,
  Home,
  Map
} from 'lucide-react';
import { GameDifficulty, RenderPerspective, ScreenDisplayMode } from '../game/types';

interface HeaderProps {
  onGoHome?: () => void;
  onOpenMapCampaign?: () => void;
  onOpenLeaderboard: () => void;
  onOpenThemes: () => void;
  onOpenLevels: () => void;
  onOpenShowcase: () => void;
  onOpenMissions: () => void;
  onOpenGacha: () => void;
  onOpenLocker: () => void;
  onOpenReplays: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  controllerConnected: boolean;
  controllerName: string;
  difficulty: GameDifficulty;
  onChangeDifficulty: (diff: GameDifficulty) => void;
  perspective: RenderPerspective;
  onChangePerspective: (persp: RenderPerspective) => void;
  displayMode: ScreenDisplayMode;
  onToggleDisplayMode: () => void;
  ghostRacerEnabled: boolean;
  onToggleGhostRacer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenMapCampaign,
  onOpenLeaderboard,
  onOpenThemes,
  onOpenLevels,
  onOpenShowcase,
  onOpenMissions,
  onOpenGacha,
  onOpenLocker,
  onOpenReplays,
  isMuted,
  onToggleMute,
  controllerConnected,
  controllerName,
  difficulty,
  onChangeDifficulty,
  perspective,
  onChangePerspective,
  displayMode,
  onToggleDisplayMode,
  ghostRacerEnabled,
  onToggleGhostRacer,
}) => {
  const { user, profile, dailyMissions, signInWithGoogle, signInAsGuest, logout } = useAuth();

  const uncompletedMissions = dailyMissions.filter((m) => m.completed && !m.claimed).length;

  const getDifficultyColor = (diff: GameDifficulty) => {
    switch (diff) {
      case 'EASY':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
      case 'NORMAL':
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
      case 'HARD':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
      case 'GHOSTLY':
        return 'text-purple-400 border-purple-500/40 bg-purple-950/40';
      case 'HUNTER':
        return 'text-rose-400 border-rose-500/50 bg-rose-950/60 font-black animate-pulse';
    }
  };

  return (
    <header className="w-full bg-[#090d1f]/90 backdrop-blur-md border-b border-cyan-500/20 px-3 py-2.5 sm:px-6 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Icon */}
        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer" onClick={onOpenShowcase}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-400 p-[2px] shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090d1f] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-amber-400 relative flex items-center justify-center shadow-[0_0_12px_#facc15]">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] border-r-[#090d1f]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute top-1 left-2 shadow-[0_0_4px_#06b6d4]" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-rose-500 text-[9px] font-black px-1 rounded uppercase tracking-wider text-white">
              1001
            </div>
          </div>

          <div className="cursor-pointer" onClick={onGoHome}>
            <div className="flex items-center gap-1.5">
              <h1 className="font-['Orbitron'] font-black text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:brightness-110 transition-all">
                AniPac
              </h1>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 tracking-widest hidden sm:inline-block">
                SHONEN ARCADE
              </span>
            </div>
          </div>

          {/* Quick Nav: Home & Maps */}
          <div className="flex items-center gap-1 ml-1 sm:ml-2">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="px-2 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-cyan-500/50 text-[11px] font-black font-['Orbitron'] text-zinc-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                title="Return to Home Menu & Title Screen"
              >
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">HOME</span>
              </button>
            )}

            {onOpenMapCampaign && (
              <button
                onClick={onOpenMapCampaign}
                className="px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-[11px] font-black font-['Orbitron'] text-amber-300 flex items-center gap-1 transition-all cursor-pointer shadow-md"
                title="Candy Crush Style World Map Selection"
              >
                <Map className="w-3.5 h-3.5 text-amber-400" />
                <span>MAPS</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Difficulty & View & Replays */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-zinc-400 text-[10px] font-bold">AI PACING:</span>
            <select
              value={difficulty}
              onChange={(e) => onChangeDifficulty(e.target.value as GameDifficulty)}
              className={`px-2 py-1 rounded-lg text-xs font-['Orbitron'] font-bold border outline-none cursor-pointer ${getDifficultyColor(
                difficulty
              )}`}
            >
              <option value="EASY" className="bg-[#0c1029] text-emerald-400">EASY</option>
              <option value="NORMAL" className="bg-[#0c1029] text-cyan-400">NORMAL</option>
              <option value="HARD" className="bg-[#0c1029] text-amber-400">HARD</option>
              <option value="GHOSTLY" className="bg-[#0c1029] text-purple-400">GHOSTLY (ADAPTIVE)</option>
              <option value="HUNTER" className="bg-[#0c1029] text-rose-400">HUNTER (NIGHTMARE)</option>
            </select>
          </div>

          {/* Perspective View Toggle */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-zinc-400 text-[10px] font-bold">VIEW:</span>
            <button
              onClick={() => {
                const next = perspective === '2D_NEON' ? '2_5D_ISO' : '2D_NEON';
                onChangePerspective(next);
              }}
              className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-cyan-400 text-xs font-['Orbitron'] text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>{perspective === '2D_NEON' ? '2D NEON' : '2.5D ISO'}</span>
            </button>
          </div>

          {/* Ghost Racer Toggle */}
          <button
            onClick={onToggleGhostRacer}
            className={`px-2 py-1 rounded-lg border text-xs font-['Orbitron'] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              ghostRacerEnabled
                ? 'bg-sky-950/80 border-sky-400 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                : 'bg-zinc-900 border-zinc-700 text-zinc-500'
            }`}
            title="Toggle Shadow Ghost Racer of your best level run in real-time"
          >
            <GhostIcon className="w-3 h-3" />
            <span>GHOST RACER {ghostRacerEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fill Screen / Full Screen Mode Toggle Button */}
          <button
            onClick={onToggleDisplayMode}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-['Orbitron'] font-bold transition-all border cursor-pointer ${
              displayMode === 'FILL_SCREEN'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : displayMode === 'FULLSCREEN'
                ? 'bg-purple-950/80 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-zinc-900/80 hover:bg-cyan-950/60 border-zinc-700/60 hover:border-cyan-400 text-zinc-200'
            }`}
            title={`Current View: ${displayMode}. Click to toggle Fill Screen Mode / Fullscreen / Standard`}
          >
            {displayMode === 'FILL_SCREEN' ? (
              <Tv className="w-3.5 h-3.5 text-emerald-400" />
            ) : displayMode === 'FULLSCREEN' ? (
              <Minimize2 className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline">
              {displayMode === 'FILL_SCREEN' ? 'FILL SCREEN' : displayMode === 'FULLSCREEN' ? 'FULLSCREEN' : 'FILL SCREEN'}
            </span>
          </button>

          {/* Ghost Replay Vault Button */}
          <button
            onClick={onOpenReplays}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-cyan-950/60 border border-zinc-700/60 hover:border-cyan-400 text-xs text-cyan-300 transition-all font-semibold font-['Orbitron'] cursor-pointer"
            title="Watch recordings of your best runs saved to Firestore"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Replays</span>
          </button>

          {/* Pac-Coins Gacha Button */}
          <button
            onClick={onOpenGacha}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/50 text-amber-300 text-xs font-black font-['Orbitron'] transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            title="Shonen Gacha Shrine"
          >
            <span>🪙</span>
            <span>{profile?.pacCoins || 0}</span>
            <Sparkles className="w-3 h-3 text-amber-400 hidden sm:inline" />
          </button>

          {/* Daily Missions */}
          <button
            onClick={onOpenMissions}
            className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-amber-950/60 border border-zinc-700/60 hover:border-amber-500/40 text-xs text-zinc-200 transition-all font-semibold cursor-pointer"
            title="Daily Shinobi Missions"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Missions</span>
            {uncompletedMissions > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center animate-bounce">
                {uncompletedMissions}
              </span>
            )}
          </button>

          {/* Shinobi Locker */}
          <button
            onClick={onOpenLocker}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-purple-950/60 border border-zinc-700/60 hover:border-purple-500/40 text-xs text-zinc-200 transition-all font-semibold cursor-pointer"
            title="Skins & Power Loadout Locker"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Locker</span>
          </button>

          {/* Backgrounds & Themes */}
          <button
            onClick={onOpenThemes}
            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-rose-950/60 border border-zinc-700/60 hover:border-rose-500/40 text-zinc-300 transition-all cursor-pointer"
            title="Anime Visual Themes & GIF API"
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
          </button>

          {/* Rankings */}
          <button
            onClick={onOpenLeaderboard}
            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-amber-950/60 border border-zinc-700/60 hover:border-amber-500/40 text-zinc-300 transition-all cursor-pointer"
            title="Global Leaderboards"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </button>

          {/* Audio */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                : 'bg-zinc-900/80 border-zinc-700/60 text-zinc-300 hover:text-cyan-400'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Dynamic Synth Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* User Auth */}
          <div className="h-5 w-[1px] bg-zinc-800 mx-0.5" />

          {user ? (
            <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-1 pr-2">
              <img
                src={profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                alt="Avatar"
                className="w-6 h-6 rounded-md bg-zinc-800 border border-cyan-500/40 object-cover"
              />
              <button
                onClick={logout}
                className="text-zinc-400 hover:text-rose-400 p-0.5 ml-0.5 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

