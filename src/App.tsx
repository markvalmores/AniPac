import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { Header } from './components/Header';
import { GameHUD, ComboMultiplierBadge } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { GameOverVictoryModal } from './components/GameOverVictoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { BackgroundCustomizerModal } from './components/BackgroundCustomizerModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { MoveShowcaseModal } from './components/MoveShowcaseModal';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { GachaModal } from './components/GachaModal';
import { LockerModal } from './components/LockerModal';
import { GhostReplayModal } from './components/GhostReplayModal';
import { useAniPacGame } from './game/useAniPacGame';
import { CURATED_ANIME_THEMES } from './game/backgroundThemes';
import { BackgroundTheme, GameDifficulty, RenderPerspective, ScreenDisplayMode, ShonenPowerType } from './game/types';
import { audioEngine } from './game/audioEngine';
import { GRID_WIDTH, GRID_HEIGHT, BASE_TILE_SIZE } from './game/constants';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Gamepad2, 
  Trophy, 
  Layers, 
  BookOpen, 
  Crown, 
  Calendar, 
  Maximize2, 
  Minimize2, 
  Film,
  Tv,
  Eye,
  Zap,
  Flame,
  X
} from 'lucide-react';

function AniPacApp() {
  const { profile, updateMissionProgress, setDifficulty: setCloudDifficulty, setPerspective: setCloudPerspective } = useAuth();
  
  // Customization & Visual Themes
  const [currentLevel, setCurrentLevel] = useState<number>(profile?.maxLevelReached || 1);
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>(CURATED_ANIME_THEMES[0]);
  const [customGifUrl, setCustomGifUrl] = useState<string>('');
  const [bgOpacity, setBgOpacity] = useState<number>(0.35);
  const [enableCRT, setEnableCRT] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Screen Display Mode: STANDARD | FILL_SCREEN | FULLSCREEN
  const [displayMode, setDisplayMode] = useState<ScreenDisplayMode>(() => {
    return (localStorage.getItem('anipac_display_mode') as ScreenDisplayMode) || 'STANDARD';
  });

  // Difficulty & Perspective
  const [difficulty, setDifficulty] = useState<GameDifficulty>(profile?.selectedDifficulty || 'NORMAL');
  const [perspective, setPerspective] = useState<RenderPerspective>(profile?.renderPerspective || '2D_NEON');

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isThemesOpen, setIsThemesOpen] = useState<boolean>(false);
  const [isLevelsOpen, setIsLevelsOpen] = useState<boolean>(false);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isGachaOpen, setIsGachaOpen] = useState<boolean>(false);
  const [isLockerOpen, setIsLockerOpen] = useState<boolean>(false);
  const [isReplaysOpen, setIsReplaysOpen] = useState<boolean>(false);
  const [replayTargetLevel, setReplayTargetLevel] = useState<number | undefined>(undefined);

  // Victory / Game over stats
  const [modalType, setModalType] = useState<'VICTORY' | 'GAMEOVER' | null>(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    level: 1,
    ghostsEaten: 0,
    specialMoves: 0,
    coinsEarned: 0,
  });

  const equippedSkinId = profile?.equippedSkin || 'skin-classic-neon';
  const equippedGhostSkinId = profile?.equippedGhostSkin || 'ghost-classic-oni';
  const equippedMazeSkinId = profile?.equippedMazeSkin || 'maze-neon-cyber';
  const equippedPowers = profile?.equippedPowers || ['SUPER_SAIYAN', 'KAMEHAMEHA', 'DOMAIN_EXPANSION', 'BANKAI_SLASH', 'RASENGAN_VACUUM', 'GEAR_5_BOUNCE'];

  const handleLevelComplete = (stats: {
    score: number;
    level: number;
    ghostsEaten: number;
    specialMoves: number;
    coinsEarned: number;
  }) => {
    setGameStats(stats);
    setModalType('VICTORY');
  };

  const handleGameOver = (finalStats: {
    score: number;
    level: number;
    ghostsEaten: number;
    specialMoves: number;
    coinsEarned: number;
  }) => {
    setGameStats(finalStats);
    setModalType('GAMEOVER');
  };

  const {
    canvasRef,
    gameState,
    score,
    lives,
    level,
    kiEnergy,
    activePower,
    powerTimer,
    comboMultiplier,
    ghostChainCount,
    ghostChainTimer,
    maxGhostChainTimer,
    controllerInfo,
    mapData,
    ghostRacerEnabled,
    setGhostRacerEnabled,
    activeBestReplay,
    isFeverMode,
    feverTimer,
    feverPelletCount,
    startGame,
    restartCurrentLevel,
    triggerShonenMove,
    setPlayerDirection,
  } = useAniPacGame(
    currentLevel,
    currentTheme,
    difficulty,
    perspective,
    equippedSkinId,
    equippedGhostSkinId,
    equippedMazeSkinId,
    equippedPowers,
    updateMissionProgress,
    handleLevelComplete,
    handleGameOver
  );

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  // Display Mode toggle handler (Standard -> Fill Screen -> Fullscreen -> Standard)
  const handleToggleDisplayMode = useCallback(() => {
    setDisplayMode((current) => {
      let next: ScreenDisplayMode = 'STANDARD';
      if (current === 'STANDARD') {
        next = 'FILL_SCREEN';
      } else if (current === 'FILL_SCREEN') {
        next = 'FULLSCREEN';
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        next = 'STANDARD';
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      localStorage.setItem('anipac_display_mode', next);
      return next;
    });
  }, []);

  // Listen for fullscreen exit (e.g. Escape key)
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && displayMode === 'FULLSCREEN') {
        setDisplayMode('FILL_SCREEN');
        localStorage.setItem('anipac_display_mode', 'FILL_SCREEN');
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [displayMode]);

  // Global Hotkey 'F' for Fill Screen / Fullscreen toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'f' || e.key === 'F') {
        handleToggleDisplayMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleDisplayMode]);

  const handleNextLevel = () => {
    setModalType(null);
    setCurrentLevel((lvl) => Math.min(1001, lvl + 1));
    startGame();
  };

  const handleRestartFromModal = () => {
    setModalType(null);
    restartCurrentLevel();
  };

  const handleDifficultyChange = (diff: GameDifficulty) => {
    setDifficulty(diff);
    setCloudDifficulty(diff);
  };

  const handlePerspectiveChange = (persp: RenderPerspective) => {
    setPerspective(persp);
    setCloudPerspective(persp);
  };

  const canvasWidth = GRID_WIDTH * BASE_TILE_SIZE;
  const canvasHeight = GRID_HEIGHT * BASE_TILE_SIZE;
  const isFillOrFull = displayMode === 'FILL_SCREEN' || displayMode === 'FULLSCREEN';

  return (
    <div className={`bg-[#060814] text-white select-none font-sans relative overflow-x-hidden ${
      isFillOrFull ? 'fixed inset-0 h-screen w-screen overflow-hidden' : 'min-h-screen flex flex-col items-center'
    }`}>
      {/* Dynamic Animated Anime Background Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {currentTheme.gifUrl && (
          <div
            className="absolute inset-0 bg-center bg-cover transition-opacity duration-700 scale-105"
            style={{
              backgroundImage: `url('${currentTheme.gifUrl}')`,
              opacity: bgOpacity,
              filter: 'blur(2px)',
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: currentTheme.bgGradient,
            opacity: 0.85,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#060814_90%)]" />
      </div>

      {/* CRT Scanlines Filter */}
      {enableCRT && (
        <div className="fixed inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]" />
      )}

      {/* Standard Header (visible only when in STANDARD arcade view) */}
      {!isFillOrFull && (
        <Header
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenThemes={() => setIsThemesOpen(true)}
          onOpenLevels={() => setIsLevelsOpen(true)}
          onOpenShowcase={() => setIsShowcaseOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenGacha={() => setIsGachaOpen(true)}
          onOpenLocker={() => setIsLockerOpen(true)}
          onOpenReplays={() => {
            setReplayTargetLevel(currentLevel);
            setIsReplaysOpen(true);
          }}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          controllerConnected={controllerInfo.connected}
          controllerName={controllerInfo.name}
          difficulty={difficulty}
          onChangeDifficulty={handleDifficultyChange}
          perspective={perspective}
          onChangePerspective={handlePerspectiveChange}
          displayMode={displayMode}
          onToggleDisplayMode={handleToggleDisplayMode}
          ghostRacerEnabled={ghostRacerEnabled}
          onToggleGhostRacer={() => setGhostRacerEnabled((v) => !v)}
        />
      )}

      {/* ========================================================================= */}
      {/* UNIFIED PERSISTENT GAME VIEWPORT (Canvas is NEVER unmounted across modes)  */}
      {/* ========================================================================= */}
      <main className={
        isFillOrFull 
          ? "fixed inset-0 w-screen h-screen z-20 bg-black/95 flex flex-col items-center justify-center overflow-hidden"
          : "flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-start p-2 sm:p-4 z-10 gap-3"
      }>
        
        {/* Fill Screen Floating Top Header */}
        {isFillOrFull && (
          <div className="absolute top-2 left-2 right-2 z-30 flex items-center justify-between gap-2 max-w-4xl mx-auto pointer-events-none">
            {/* Score & Lives & Level pill */}
            <div className="flex items-center gap-2 bg-[#090d1f]/90 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3 py-1.5 shadow-lg shadow-black/60 pointer-events-auto">
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-['Orbitron']">
                  SCORE
                </span>
                <span className="text-sm font-black text-amber-300 font-['Orbitron']">
                  {score.toLocaleString()}
                </span>
              </div>

              {/* Persistent Combo Multiplier in Fill Screen / Fullscreen mode */}
              <ComboMultiplierBadge
                comboMultiplier={comboMultiplier}
                ghostChainCount={ghostChainCount}
                ghostChainTimer={ghostChainTimer}
                maxGhostChainTimer={maxGhostChainTimer}
                size="sm"
              />
              
              <div className="h-6 w-[1px] bg-zinc-800" />

              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full transition-all ${
                      i < lives
                        ? 'bg-amber-400 shadow-[0_0_8px_#facc15]'
                        : 'bg-zinc-800 border border-zinc-700'
                    }`}
                  />
                ))}
              </div>

              <div className="h-6 w-[1px] bg-zinc-800" />

              <span className="text-xs font-black text-cyan-300 font-['Orbitron']">
                STAGE {level}
              </span>

              {isFeverMode && (
                <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-red-500 via-yellow-400 to-cyan-400 text-black text-[9px] font-black font-['Orbitron'] animate-pulse">
                  3X FEVER ({feverTimer.toFixed(1)}s)
                </span>
              )}
            </div>

            {/* Center Active Shonen Power Banner */}
            {activePower && !isFeverMode && (
              <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-cyan-950/90 to-blue-950/90 backdrop-blur-md border border-cyan-400 px-3 py-1 rounded-xl shadow-lg shadow-cyan-500/30 animate-pulse pointer-events-auto">
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-xs font-black text-cyan-300 font-['Orbitron']">
                  {activePower.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {powerTimer.toFixed(1)}s
                </span>
              </div>
            )}

            {/* Right: Floating Actions */}
            <div className="flex items-center gap-1.5 bg-[#090d1f]/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-1 pointer-events-auto shadow-lg shadow-black/60">
              <button
                onClick={() => {
                  setReplayTargetLevel(currentLevel);
                  setIsReplaysOpen(true);
                }}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-cyan-950/60 text-cyan-300 transition-all cursor-pointer"
                title="Ghost Replay Vault"
              >
                <Film className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-all cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
              </button>

              <button
                onClick={handleToggleDisplayMode}
                className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all cursor-pointer"
                title="Exit Fill Screen Mode (Press 'F')"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Standard Arcade GameHUD (visible only in Standard mode) */}
        {!isFillOrFull && (
          <div className="w-full max-w-[504px]">
            <GameHUD
              score={score}
              lives={lives}
              level={level}
              stageName={mapData.name}
              kiEnergy={kiEnergy}
              activePower={activePower}
              powerTimer={powerTimer}
              comboMultiplier={comboMultiplier}
              ghostChainCount={ghostChainCount}
              ghostChainTimer={ghostChainTimer}
              maxGhostChainTimer={maxGhostChainTimer}
              equippedPowers={equippedPowers}
              difficulty={difficulty}
              perspective={perspective}
              isFeverMode={isFeverMode}
              feverTimer={feverTimer}
              feverPelletCount={feverPelletCount}
              onTriggerMove={triggerShonenMove}
            />
          </div>
        )}

        {/* Canvas Screen Viewport - SINGLE UNIFIED MOUNT POINT */}
        <div className={
          isFillOrFull 
            ? "relative w-full h-full flex items-center justify-center"
            : "relative w-full max-w-[504px] aspect-[21/23] rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-[#070a1a]/95 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex items-center justify-center"
        }>
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className={
              isFillOrFull 
                ? "max-h-[100dvh] max-w-[100vw] h-full w-auto object-contain block select-none" 
                : "w-full h-full object-contain block select-none"
            }
          />

          {/* Fill Screen Badge on canvas corner in Standard Mode */}
          {!isFillOrFull && (
            <button
              onClick={handleToggleDisplayMode}
              className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 hover:bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center gap-1 font-['Orbitron'] backdrop-blur-sm z-10 cursor-pointer transition-all hover:scale-105"
              title="Expand to Fill Screen View (or press 'F')"
            >
              <Maximize2 className="w-3 h-3 text-cyan-400" />
              <span>FILL SCREEN</span>
            </button>
          )}

          {/* START / READY OVERLAY */}
          {gameState === 'READY' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-400 p-[2px] shadow-2xl shadow-cyan-500/40 mb-3 animate-pulse">
                <div className="w-full h-full bg-[#090d1f] rounded-[14px] flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-amber-400 relative flex items-center justify-center shadow-[0_0_15px_#facc15]">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-[#090d1f]" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400 font-['Orbitron'] tracking-wider mb-1">
                AniPac • STAGE {level}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-zinc-300 font-semibold">
                  {mapData.name.split(':')[1]?.trim() || 'NEO TOKYO'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-['Orbitron']">
                  {difficulty} MODE
                </span>
              </div>

              <button
                onClick={startGame}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:scale-105 active:scale-95 text-black font-black text-sm font-['Orbitron'] tracking-wider rounded-xl shadow-xl shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START BATTLE</span>
              </button>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-400">
                <span className="bg-zinc-900/90 px-2 py-1 rounded border border-zinc-700">
                  ⌨️ Arrows / WASD
                </span>
                <span className="bg-zinc-900/90 px-2 py-1 rounded border border-zinc-700">
                  ⚡ Space / 1-6: Powers
                </span>
                <span className="bg-zinc-900/90 px-2 py-1 rounded border border-zinc-700">
                  🌈 100 Pellets = 7s Rainbow Fever
                </span>
                <span className="bg-zinc-900/90 px-2 py-1 rounded border border-zinc-700">
                  🖥️ 'F': Fill Screen Mode
                </span>
              </div>
            </div>
          )}

          {/* PAUSE OVERLAY */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <h2 className="text-2xl font-black text-cyan-400 font-['Orbitron'] tracking-widest mb-3">
                GAME PAUSED
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-['Orbitron'] rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  RESUME
                </button>
                <button
                  onClick={restartCurrentLevel}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  RESTART
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Touch & Hotbar Controls (Adapts dynamically between Standard & Fill Screen) */}
        <div className={
          isFillOrFull 
            ? "absolute bottom-2 left-2 right-2 z-30 max-w-lg mx-auto pointer-events-auto"
            : "w-full max-w-[504px]"
        }>
          <TouchControls
            onDirectionChange={setPlayerDirection}
            onTriggerMove={triggerShonenMove}
            kiEnergy={kiEnergy}
          />
        </div>
      </main>

      {/* ========================================================================= */}
      {/* Modals & Dialogs                                                          */}
      {/* ========================================================================= */}
      <GhostReplayModal
        isOpen={isReplaysOpen}
        onClose={() => setIsReplaysOpen(false)}
        initialLevel={replayTargetLevel}
      />

      <DailyMissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
      />

      <GachaModal
        isOpen={isGachaOpen}
        onClose={() => setIsGachaOpen(false)}
        onOpenLocker={() => setIsLockerOpen(true)}
      />

      <LockerModal
        isOpen={isLockerOpen}
        onClose={() => setIsLockerOpen(false)}
        onOpenGacha={() => setIsGachaOpen(true)}
      />

      <BackgroundCustomizerModal
        isOpen={isThemesOpen}
        onClose={() => setIsThemesOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        customGifUrl={customGifUrl}
        onSetCustomGifUrl={setCustomGifUrl}
        bgOpacity={bgOpacity}
        onSetBgOpacity={setBgOpacity}
        enableCRT={enableCRT}
        onToggleCRT={() => setEnableCRT(!enableCRT)}
      />

      <LevelSelectModal
        isOpen={isLevelsOpen}
        onClose={() => setIsLevelsOpen(false)}
        currentLevel={currentLevel}
        onSelectLevel={(lvl) => {
          setCurrentLevel(lvl);
          startGame();
        }}
      />

      <MoveShowcaseModal
        isOpen={isShowcaseOpen}
        onClose={() => setIsShowcaseOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {modalType && (
        <GameOverVictoryModal
          type={modalType}
          score={gameStats.score}
          level={gameStats.level}
          ghostsEaten={gameStats.ghostsEaten}
          specialMovesUsed={gameStats.specialMoves}
          onNextLevel={handleNextLevel}
          onRestart={handleRestartFromModal}
          onOpenLeaderboard={() => {
            setModalType(null);
            setIsLeaderboardOpen(true);
          }}
          onOpenLevelSelect={() => {
            setModalType(null);
            setIsLevelsOpen(true);
          }}
          onWatchReplay={() => {
            setModalType(null);
            setReplayTargetLevel(gameStats.level);
            setIsReplaysOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AniPacApp />
    </AuthProvider>
  );
}
