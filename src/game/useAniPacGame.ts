import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  PlayerState, 
  Ghost, 
  MapData, 
  TileType, 
  Direction, 
  ShonenPowerType, 
  BackgroundTheme, 
  BonusItem,
  GameDifficulty,
  RenderPerspective,
  PlayerSkinItem,
  GhostSkinItem,
  ShadowClone,
  GhostReplayFrame,
  GhostReplayData
} from './types';
import { 
  GRID_WIDTH, 
  GRID_HEIGHT, 
  BASE_TILE_SIZE, 
  SHONEN_MOVES, 
  ANIME_BONUS_ITEMS,
  GACHA_PAC_SKINS,
  GACHA_GHOST_SKINS,
  GACHA_MAZE_SKINS
} from './constants';
import { generateLevelMap } from './mapGenerator';
import { createInitialGhosts, updateGhostAI } from './ghostAI';
import { VFXEngine } from './vfx';
import { audioEngine } from './audioEngine';
import { InputManager } from './inputManager';
import { saveGhostReplay, getLocalBestReplay } from '../firebase/replayService';
import confetti from 'canvas-confetti';

export function useAniPacGame(
  currentLevel: number,
  theme: BackgroundTheme,
  difficulty: GameDifficulty,
  perspective: RenderPerspective,
  equippedSkinId: string,
  equippedGhostSkinId: string,
  equippedMazeSkinId: string,
  equippedPowers: ShonenPowerType[],
  onMissionUpdate: (category: 'DOTS' | 'GHOSTS' | 'POWERS' | 'STAGES' | 'SCORE' | 'DIFFICULTY', amount: number) => void,
  onLevelComplete: (stats: { score: number; level: number; ghostsEaten: number; specialMoves: number; coinsEarned: number }) => void,
  onGameOver: (finalStats: { score: number; level: number; ghostsEaten: number; specialMoves: number; coinsEarned: number }) => void
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER'>('READY');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(currentLevel);
  const [kiEnergy, setKiEnergy] = useState<number>(100);
  const [activePower, setActivePower] = useState<ShonenPowerType | null>(null);
  const [powerTimer, setPowerTimer] = useState<number>(0);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [ghostChainCount, setGhostChainCount] = useState<number>(0);
  const [ghostChainTimer, setGhostChainTimer] = useState<number>(0);
  const [controllerInfo, setControllerInfo] = useState<{ connected: boolean; name: string }>({ connected: false, name: '' });
  const [coinsEarnedThisRun, setCoinsEarnedThisRun] = useState<number>(0);

  // Stats
  const [moveStats, setMoveStats] = useState<Record<string, number>>({});
  const [ghostsEatenTotal, setGhostsEatenTotal] = useState<number>(0);
  const [dotsEatenThisStage, setDotsEatenThisStage] = useState<number>(0);

  // Rainbow Fever Mode State (7 seconds duration, triggered every 100 pellets)
  const [isFeverMode, setIsFeverMode] = useState<boolean>(false);
  const [feverTimer, setFeverTimer] = useState<number>(0);
  const [feverPelletCount, setFeverPelletCount] = useState<number>(0);

  // Engine references
  const vfxRef = useRef<VFXEngine>(new VFXEngine());
  const inputRef = useRef<InputManager>(new InputManager());
  const customMazeSkin = GACHA_MAZE_SKINS.find((m) => m.id === equippedMazeSkinId);
  const mapDataRef = useRef<MapData>(generateLevelMap(currentLevel, customMazeSkin?.style));
  const ghostsRef = useRef<Ghost[]>(createInitialGhosts(mapDataRef.current, currentLevel, difficulty));
  const bonusItemRef = useRef<BonusItem | null>(null);
  const shadowClonesRef = useRef<ShadowClone[]>([]);

  const currentSkinData = GACHA_PAC_SKINS.find((s) => s.id === equippedSkinId) || GACHA_PAC_SKINS[0];
  const currentGhostSkinData = GACHA_GHOST_SKINS.find((s) => s.id === equippedGhostSkinId) || GACHA_GHOST_SKINS[0];

  const playerRef = useRef<PlayerState>({
    x: mapDataRef.current.playerStart.x,
    y: mapDataRef.current.playerStart.y,
    gridX: mapDataRef.current.playerStart.x,
    gridY: mapDataRef.current.playerStart.y,
    dir: 'NONE',
    nextDir: 'NONE',
    speed: 0.1,
    lives: 3,
    score: 0,
    ki: 100,
    comboMultiplier: 1,
    activePower: null,
    powerTimeRemaining: 0,
    isInvulnerable: false,
    isFeverMode: false,
    feverTimer: 0,
    feverPelletCounter: 0,
    angle: 0,
    mouthAngle: 0.2,
    mouthSpeed: 4,
    ghostsEatenInPower: 0,
    ghostChainCount: 0,
    ghostChainTimer: 0,
    characterSkin: equippedSkinId,
    equippedSkinData: currentSkinData,
    equippedGhostSkinData: currentGhostSkinData,
  });

  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameIdRef = useRef<number | null>(null);
  const globalGhostModeRef = useRef<'CHASE' | 'SCATTER' | 'DOMAIN_FROZEN'>('CHASE');
  const dotChompCounter = useRef<number>(0);
  const bonusSpawnTimer = useRef<number>(15);

  // Ghost Replay & Ghost Racer Recording References
  const replayFramesRef = useRef<GhostReplayFrame[]>([]);
  const levelStartTimeRef = useRef<number>(performance.now());
  const recordSampleTimer = useRef<number>(0);
  const activeBestReplayRef = useRef<GhostReplayData | null>(null);
  const [ghostRacerEnabled, setGhostRacerEnabled] = useState<boolean>(true);

  // Sync Level, Skins & Map
  useEffect(() => {
    setLevel(currentLevel);
    const mSkin = GACHA_MAZE_SKINS.find((m) => m.id === equippedMazeSkinId);
    mapDataRef.current = generateLevelMap(currentLevel, mSkin?.style);
    ghostsRef.current = createInitialGhosts(mapDataRef.current, currentLevel, difficulty);
    resetPlayerPosition();
    vfxRef.current.floatingTexts = [];
    vfxRef.current.particles = [];
    shadowClonesRef.current = [];
    setDotsEatenThisStage(0);
    setIsFeverMode(false);
    setFeverTimer(0);
    setFeverPelletCount(0);
    playerRef.current.isFeverMode = false;
    playerRef.current.feverTimer = 0;
    playerRef.current.feverPelletCounter = 0;

    // Load existing best ghost replay for this level for Ghost Racer
    const existingReplay = getLocalBestReplay(currentLevel);
    activeBestReplayRef.current = existingReplay;
    replayFramesRef.current = [];
  }, [currentLevel, difficulty, equippedMazeSkinId]);

  useEffect(() => {
    playerRef.current.equippedSkinData = GACHA_PAC_SKINS.find((s) => s.id === equippedSkinId) || GACHA_PAC_SKINS[0];
    playerRef.current.equippedGhostSkinData = GACHA_GHOST_SKINS.find((s) => s.id === equippedGhostSkinId) || GACHA_GHOST_SKINS[0];
  }, [equippedSkinId, equippedGhostSkinId]);

  // Input bindings
  useEffect(() => {
    const input = inputRef.current;
    input.setOnTriggerPower((power) => {
      triggerShonenMove(power);
    });

    input.setOnTogglePause(() => {
      setGameState((prev) => {
        if (prev === 'PLAYING') {
          audioEngine.stopMusic();
          return 'PAUSED';
        } else if (prev === 'PAUSED') {
          audioEngine.startMusic();
          return 'PLAYING';
        }
        return prev;
      });
    });

    const controllerCheckInterval = setInterval(() => {
      setControllerInfo(input.getGamepadInfo());
    }, 1000);

    return () => clearInterval(controllerCheckInterval);
  }, []);

  const resetPlayerPosition = () => {
    const p = playerRef.current;
    const startX = mapDataRef.current?.playerStart?.x ?? 10;
    const startY = mapDataRef.current?.playerStart?.y ?? 18;
    p.x = startX;
    p.y = startY;
    p.gridX = startX;
    p.gridY = startY;
    p.dir = 'NONE';
    p.nextDir = 'NONE';
    p.angle = 0;
    p.mouthAngle = 0.2;
    p.speed = 0.1;
    inputRef.current.setDirection('NONE');
  };

  const recordFrame = useCallback((
    event?: 'POWER_TRIGGER' | 'GHOST_EATEN' | 'ORB_CHOMP' | 'BONUS_EATEN' | 'LIFE_LOST' | 'STAGE_CLEAR' | 'FEVER_START',
    eventText?: string,
    eventColor?: string
  ) => {
    const p = playerRef.current;
    const elapsed = Math.max(0, performance.now() - levelStartTimeRef.current);
    const ghostSnapshots = ghostsRef.current.map((g) => ({
      id: g.id,
      x: Math.round(g.x * 100) / 100,
      y: Math.round(g.y * 100) / 100,
      dir: g.dir,
      state: g.state,
    }));

    replayFramesRef.current.push({
      t: Math.round(elapsed),
      px: Math.round(p.x * 100) / 100,
      py: Math.round(p.y * 100) / 100,
      pDir: p.dir,
      pAngle: Math.round(p.angle * 100) / 100,
      mouthAngle: Math.round(p.mouthAngle * 100) / 100,
      score: p.score,
      ki: Math.round(p.ki),
      combo: p.comboMultiplier,
      lives: p.lives,
      activePower: p.activePower,
      powerRemaining: Math.round(p.powerTimeRemaining * 10) / 10,
      ghosts: ghostSnapshots,
      event,
      eventText,
      eventColor,
    });
  }, []);

  const triggerShonenMove = useCallback(
    (powerType: ShonenPowerType) => {
      const p = playerRef.current;
      const move = SHONEN_MOVES[powerType];
      if (!move) return;

      if (p.ki < move.kiCost) {
        vfxRef.current.addFloatingText('NOT ENOUGH KI!', p.x * BASE_TILE_SIZE + 12, p.y * BASE_TILE_SIZE, '#EF4444', 'Gather Spirit Pellets', 14);
        return;
      }

      // Deduct Ki & Activate
      p.ki = Math.max(0, p.ki - move.kiCost);
      setKiEnergy(p.ki);
      p.activePower = powerType;
      p.powerTimeRemaining = move.duration;
      p.ghostsEatenInPower = 0;
      setActivePower(powerType);
      setPowerTimer(move.duration);

      recordFrame('POWER_TRIGGER', move.name.toUpperCase(), move.color);

      // Track Missions & Stats
      onMissionUpdate('POWERS', 1);
      setMoveStats((prev) => ({
        ...prev,
        [powerType]: (prev[powerType] || 0) + 1,
      }));

      const px = p.x * BASE_TILE_SIZE + 12;
      const py = p.y * BASE_TILE_SIZE + 12;

      vfxRef.current.addFloatingText(
        move.name.toUpperCase() + '!',
        px,
        py - 10,
        move.color,
        move.japaneseName,
        20
      );

      inputRef.current.triggerHaptics(250, 0.7, 0.9);

      // Unique Execution Logic for all 36 Shonen Moves
      switch (powerType) {
        case 'SUPER_SAIYAN': {
          audioEngine.playPowerOrb();
          ghostsRef.current.forEach((g) => {
            if (g.state !== 'EATEN') {
              g.state = 'FRIGHTENED';
              g.frightenedTimer = move.duration;
            }
          });
          break;
        }
        case 'KAMEHAMEHA':
        case 'FINAL_FLASH': {
          audioEngine.playKamehameha();
          const beamLength = 18 * BASE_TILE_SIZE;
          const facingDir = p.dir === 'NONE' ? 'RIGHT' : p.dir;
          vfxRef.current.triggerKamehameha(px, py, facingDir, beamLength);

          ghostsRef.current.forEach((g) => {
            if (g.state !== 'EATEN') {
              const inLine =
                (facingDir === 'RIGHT' && g.y >= p.y - 1.5 && g.y <= p.y + 1.5 && g.x >= p.x) ||
                (facingDir === 'LEFT' && g.y >= p.y - 1.5 && g.y <= p.y + 1.5 && g.x <= p.x) ||
                (facingDir === 'DOWN' && g.x >= p.x - 1.5 && g.x <= p.x + 1.5 && g.y >= p.y) ||
                (facingDir === 'UP' && g.x >= p.x - 1.5 && g.x <= p.x + 1.5 && g.y <= p.y);

              if (inLine) eatGhost(g, true);
            }
          });
          break;
        }
        case 'DOMAIN_EXPANSION':
        case 'STAR_PLATINUM_TIME':
        case 'ICE_AGE_FREEZE': {
          audioEngine.playDomainExpansion();
          globalGhostModeRef.current = 'DOMAIN_FROZEN';
          break;
        }
        case 'BANKAI_SLASH':
        case 'THUNDER_CLAP_FLASH': {
          audioEngine.playBankaiSlash();
          vfxRef.current.triggerBankaiSlash(px, py, p.angle);
          let dx = 0;
          let dy = 0;
          if (p.dir === 'RIGHT') dx = 4;
          if (p.dir === 'LEFT') dx = -4;
          if (p.dir === 'DOWN') dy = 4;
          if (p.dir === 'UP') dy = -4;

          const targetX = Math.max(1, Math.min(GRID_WIDTH - 2, p.gridX + dx));
          const targetY = Math.max(1, Math.min(GRID_HEIGHT - 2, p.gridY + dy));
          p.x = targetX;
          p.y = targetY;
          p.gridX = targetX;
          p.gridY = targetY;

          ghostsRef.current.forEach((g) => {
            if (g.state !== 'EATEN' && Math.hypot(g.x - p.x, g.y - p.y) < 4.5) {
              eatGhost(g, true);
            }
          });
          break;
        }
        case 'SERIOUS_PUNCH': {
          audioEngine.playKamehameha();
          vfxRef.current.triggerScreenShake(20);
          ghostsRef.current.forEach((g) => {
            if (g.state !== 'EATEN') eatGhost(g, true);
          });
          break;
        }
        case 'CONQUERORS_HAKI': {
          audioEngine.playDomainExpansion();
          vfxRef.current.triggerScreenShake(14);
          ghostsRef.current.forEach((g) => {
            if (g.state !== 'EATEN') {
              g.x = mapDataRef.current.ghostPenDoor.x;
              g.y = mapDataRef.current.ghostPenDoor.y;
              g.state = 'CHASE';
              g.isInPen = true;
              g.penExitDelay = 5;
            }
          });
          vfxRef.current.addFloatingText('KNOCKED OUT!', px, py, '#A855F7', 'Supreme Haki', 24);
          break;
        }
        case 'SHADOW_CLONE_JUTSU': {
          audioEngine.playRasengan();
          shadowClonesRef.current = [
            { x: p.x - 1, y: p.y, gridX: p.gridX - 1, gridY: p.gridY, dir: 'LEFT', speed: 0.1, life: 7 },
            { x: p.x + 1, y: p.y, gridX: p.gridX + 1, gridY: p.gridY, dir: 'RIGHT', speed: 0.1, life: 7 },
          ];
          break;
        }
        case 'ALCHEMIST_TRANSMUTE': {
          audioEngine.playBonusItem();
          const map = mapDataRef.current;
          let transmutedCount = 0;
          for (let y = Math.max(1, p.gridY - 2); y <= Math.min(GRID_HEIGHT - 2, p.gridY + 2); y++) {
            for (let x = Math.max(1, p.gridX - 2); x <= Math.min(GRID_WIDTH - 2, p.gridX + 2); x++) {
              if (map.grid[y][x] === TileType.WALL && transmutedCount < 6) {
                map.grid[y][x] = TileType.DOT;
                map.remainingDots++;
                map.totalDots++;
                transmutedCount++;
                vfxRef.current.spawnDotAbsorb(x * BASE_TILE_SIZE + 12, y * BASE_TILE_SIZE + 12, '#EAB308');
              }
            }
          }
          break;
        }
        case 'TSUKUYOMI_ILLUSION': {
          audioEngine.playDomainExpansion();
          ghostsRef.current.forEach((g) => {
            if (g.state !== 'EATEN') {
              g.state = 'CONFUSED';
              g.frightenedTimer = 6;
            }
          });
          break;
        }
        case 'SOLAR_FLARE_BLIND': {
          audioEngine.playPowerOrb();
          ghostsRef.current.forEach((g) => {
            if (g.state !== 'EATEN') {
              g.state = 'BLINDED';
              g.frightenedTimer = 5;
            }
          });
          break;
        }
        case 'DEATH_NOTE_MARK': {
          audioEngine.playDomainExpansion();
          let furthestGhost: Ghost | null = null;
          let maxDist = -1;
          ghostsRef.current.forEach((g) => {
            if (g.state !== 'EATEN') {
              const d = Math.hypot(g.x - p.x, g.y - p.y);
              if (d > maxDist) {
                maxDist = d;
                furthestGhost = g;
              }
            }
          });
          if (furthestGhost) {
            eatGhost(furthestGhost, true);
          }
          break;
        }
        case 'ROOM_SHAMBLES': {
          audioEngine.playRasengan();
          const targetGhost = ghostsRef.current.find((g) => g.state !== 'EATEN');
          if (targetGhost) {
            const oldPx = p.x;
            const oldPy = p.y;
            p.x = targetGhost.x;
            p.y = targetGhost.y;
            p.gridX = targetGhost.gridX;
            p.gridY = targetGhost.gridY;
            targetGhost.x = oldPx;
            targetGhost.y = oldPy;
            targetGhost.gridX = Math.round(oldPx);
            targetGhost.gridY = Math.round(oldPy);
            vfxRef.current.spawnGhostEatenBurst(p.x * BASE_TILE_SIZE + 12, p.y * BASE_TILE_SIZE + 12, '#0284C7');
          }
          break;
        }
        case 'RASENGAN_VACUUM': {
          audioEngine.playRasengan();
          break;
        }
        case 'GEAR_5_BOUNCE': {
          audioEngine.playGear5Bounce();
          break;
        }
      }
    },
    [onMissionUpdate]
  );

  const eatGhost = (ghost: Ghost, isInstantVaporize = false) => {
    const p = playerRef.current;
    p.ghostsEatenInPower = (p.ghostsEatenInPower || 0) + 1;
    p.ghostChainCount = (p.ghostChainCount || 0) + 1;
    p.ghostChainTimer = 6.0; // 6 seconds window to chain the next ghost!

    // Multiplier tiers: 1 ghost -> x2, 2 ghosts -> x4, 3 ghosts -> x8, 4+ ghosts -> x16 MAX!
    const newMultiplier = Math.min(16, Math.pow(2, p.ghostChainCount));
    p.comboMultiplier = newMultiplier;
    setComboMultiplier(newMultiplier);
    setGhostChainCount(p.ghostChainCount);
    setGhostChainTimer(6.0);

    const basePts = 200 * Math.pow(2, Math.min(3, p.ghostChainCount - 1));
    const feverBonus = p.isFeverMode ? 3 : 1;
    const totalPts = Math.floor(basePts * feverBonus);

    p.score += totalPts;
    setScore(p.score);
    setGhostsEatenTotal((prev) => prev + 1);

    // Pac-Coins reward from ghost eating
    const coinBonus = 15 * p.ghostChainCount;
    setCoinsEarnedThisRun((prev) => prev + coinBonus);

    p.ki = Math.min(100, p.ki + 20);
    setKiEnergy(p.ki);

    ghost.state = 'EATEN';
    ghost.frightenedTimer = 0;

    onMissionUpdate('GHOSTS', 1);
    onMissionUpdate('SCORE', totalPts);

    audioEngine.playGhostEaten(p.ghostChainCount);
    recordFrame('GHOST_EATEN', isInstantVaporize ? 'VAPORIZED' : `CHAIN x${newMultiplier}`, '#38BDF8');
    vfxRef.current.spawnGhostEatenBurst(ghost.x * BASE_TILE_SIZE + 12, ghost.y * BASE_TILE_SIZE + 12, ghost.color);
    
    // Tier-based text colors
    const comboColor = newMultiplier >= 16 ? '#F43F5E' : newMultiplier >= 8 ? '#A855F7' : newMultiplier >= 4 ? '#EAB308' : '#10B981';
    vfxRef.current.addFloatingText(
      `+${totalPts}`,
      ghost.x * BASE_TILE_SIZE + 12,
      ghost.y * BASE_TILE_SIZE,
      comboColor,
      isInstantVaporize ? 'VAPORIZED! 🪙+' + coinBonus : `CHAIN x${newMultiplier} 🪙+` + coinBonus,
      newMultiplier >= 8 ? 24 : 18
    );
    inputRef.current.triggerHaptics(180, 0.5, 0.8);
  };

  const handlePlayerDeath = () => {
    const p = playerRef.current;
    p.lives -= 1;
    setLives(p.lives);
    recordFrame('LIFE_LOST', 'NANI?!', '#EF4444');
    vfxRef.current.triggerScreenShake(15);
    vfxRef.current.spawnGhostEatenBurst(p.x * BASE_TILE_SIZE + 12, p.y * BASE_TILE_SIZE + 12, '#EF4444');
    vfxRef.current.addFloatingText('NANI?!', p.x * BASE_TILE_SIZE + 12, p.y * BASE_TILE_SIZE, '#EF4444', 'Life Lost!', 24);
    inputRef.current.triggerHaptics(400, 0.9, 1.0);

    if (p.lives <= 0) {
      audioEngine.stopMusic();
      audioEngine.playGameOver();
      setGameState('GAMEOVER');
      const totalSpecialMoves = Object.values(moveStats).reduce((a, b) => a + b, 0);
      onGameOver({
        score: p.score,
        level,
        ghostsEaten: ghostsEatenTotal,
        specialMoves: totalSpecialMoves,
        coinsEarned: coinsEarnedThisRun,
      });
    } else {
      audioEngine.playGameOver();
      resetPlayerPosition();
      ghostsRef.current = createInitialGhosts(mapDataRef.current, level, difficulty);
    }
  };

  const handleLevelClear = () => {
    audioEngine.stopMusic();
    audioEngine.playLevelClear();
    setGameState('VICTORY');

    recordFrame('STAGE_CLEAR', 'STAGE CLEARED!', '#10B981');

    const levelCoins = 100 + level * 5;
    setCoinsEarnedThisRun((prev) => prev + levelCoins);

    try {
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff0077', '#fdfa72', '#a855f7', '#10b981'],
      });
    } catch {
      // ignore
    }

    onMissionUpdate('STAGES', 1);
    if (difficulty === 'HARD' || difficulty === 'GHOSTLY' || difficulty === 'HUNTER') {
      onMissionUpdate('DIFFICULTY', 1);
    }

    const totalSpecialMoves = Object.values(moveStats).reduce((a, b) => a + b, 0);
    const finalDuration = Math.max(1, (performance.now() - levelStartTimeRef.current) / 1000);

    // Save Ghost Replay to Firestore and localStorage
    try {
      const serializedFrames = JSON.stringify(replayFramesRef.current);
      saveGhostReplay({
        level,
        score: playerRef.current.score,
        duration: finalDuration,
        difficulty,
        equippedSkin: equippedSkinId,
        equippedGhostSkin: equippedGhostSkinId,
        equippedMazeSkin: equippedMazeSkinId,
        totalDots: mapDataRef.current.totalDots,
        ghostsEaten: ghostsEatenTotal,
        specialMovesUsed: totalSpecialMoves,
        replayData: serializedFrames,
        playerName: '',
      }).then((saved) => {
        if (saved) {
          activeBestReplayRef.current = saved;
        }
      });
    } catch (err) {
      console.error('Error auto-saving ghost replay:', err);
    }

    onLevelComplete({
      score: playerRef.current.score,
      level,
      ghostsEaten: ghostsEatenTotal,
      specialMoves: totalSpecialMoves,
      coinsEarned: coinsEarnedThisRun + levelCoins,
    });
  };

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    lastTimeRef.current = performance.now();

    const gameLoop = (timestamp: number) => {
      if (!isRunning) return;

      if (!lastTimeRef.current || isNaN(lastTimeRef.current) || lastTimeRef.current > timestamp) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Safe clamp dt (between 1ms and 50ms) to prevent physics glitches when switching modes
      const dt = Math.max(0.001, Math.min(0.05, isNaN(elapsed) || !isFinite(elapsed) ? 0.016 : elapsed));

      inputRef.current.pollGamepad();

      if (gameState === 'PLAYING') {
        updateGame(dt);
      }

      renderGame(ctx);

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [gameState, level, theme, perspective, difficulty]);

  const updateGame = (dt: number) => {
    const p = playerRef.current;
    const map = mapDataRef.current;
    const vfx = vfxRef.current;

    // Sanity check for player coordinates
    if (!isFinite(p.x) || !isFinite(p.y) || isNaN(p.x) || isNaN(p.y)) {
      resetPlayerPosition();
    }
    if (!isFinite(p.speed) || p.speed <= 0) p.speed = 0.1;
    if (!isFinite(p.angle)) p.angle = 0;
    if (!isFinite(p.mouthAngle)) p.mouthAngle = 0.2;

    audioEngine.setGameState(
      level,
      p.activePower === 'SUPER_SAIYAN',
      p.activePower === 'DOMAIN_EXPANSION',
      p.lives === 1
    );

    vfx.spawnWeatherParticles(theme.particles, GRID_WIDTH * BASE_TILE_SIZE, GRID_HEIGHT * BASE_TILE_SIZE);
    vfx.update(dt);

    // Sample Replay Frame at regular intervals
    recordSampleTimer.current += dt;
    if (recordSampleTimer.current >= 0.08) {
      recordSampleTimer.current = 0;
      recordFrame();
    }

    // Rainbow Fever Timer (7 seconds)
    if (p.isFeverMode) {
      p.feverTimer -= dt;
      setFeverTimer(Math.max(0, p.feverTimer));
      vfx.spawnRainbowTrail(p.x * BASE_TILE_SIZE + 12, p.y * BASE_TILE_SIZE + 12);
      vfx.spawnRainbowFeverSparks(p.x * BASE_TILE_SIZE + 12, p.y * BASE_TILE_SIZE + 12, 2);

      if (p.feverTimer <= 0) {
        p.isFeverMode = false;
        p.feverTimer = 0;
        setIsFeverMode(false);
        setFeverTimer(0);
      }
    }

    // Ghost Chain Combo Decay Timer
    if (p.ghostChainTimer > 0) {
      p.ghostChainTimer -= dt;
      setGhostChainTimer(Math.max(0, p.ghostChainTimer));
      if (p.ghostChainTimer <= 0) {
        p.ghostChainTimer = 0;
        p.ghostChainCount = 0;
        p.comboMultiplier = 1;
        setGhostChainTimer(0);
        setGhostChainCount(0);
        setComboMultiplier(1);
      }
    }

    // Power Timer
    if (p.activePower) {
      p.powerTimeRemaining -= dt;
      setPowerTimer(Math.max(0, p.powerTimeRemaining));
      if (p.powerTimeRemaining <= 0) {
        if (p.activePower === 'DOMAIN_EXPANSION' || p.activePower === 'STAR_PLATINUM_TIME' || p.activePower === 'ICE_AGE_FREEZE') {
          globalGhostModeRef.current = 'CHASE';
        }
        p.activePower = null;
        setActivePower(null);
      }
    }

    // Ki regeneration
    p.ki = Math.min(100, p.ki + dt * 2.8);
    setKiEnergy(p.ki);

    // Rasengan vacuum
    if (p.activePower === 'RASENGAN_VACUUM' || p.activePower === 'NINE_TAILS_CLOAK') {
      vfx.spawnRasenganVortex(p.x * BASE_TILE_SIZE + 12, p.y * BASE_TILE_SIZE + 12);
      const rad = 3.5;
      for (let y = Math.max(0, Math.floor(p.y - rad)); y <= Math.min(GRID_HEIGHT - 1, Math.floor(p.y + rad)); y++) {
        for (let x = Math.max(0, Math.floor(p.x - rad)); x <= Math.min(GRID_WIDTH - 1, Math.floor(p.x + rad)); x++) {
          if (map.grid[y][x] === TileType.DOT) {
            map.grid[y][x] = TileType.EMPTY;
            map.remainingDots--;
            const scoreGain = (p.isFeverMode ? 3 : 1) * 10 * p.comboMultiplier;
            p.score += scoreGain;
            setScore(p.score);
            p.ki = Math.min(100, p.ki + 0.8);
            vfx.spawnDotAbsorb(x * BASE_TILE_SIZE + 12, y * BASE_TILE_SIZE + 12, '#38BDF8');
            audioEngine.playDotChomp(dotChompCounter.current++);
            onMissionUpdate('DOTS', 1);
            onMissionUpdate('SCORE', 10);
          }
        }
      }
    }

    // Shadow Clones dot collecting
    shadowClonesRef.current.forEach((clone, idx) => {
      clone.life -= dt;
      let cx = Math.round(clone.x);
      let cy = Math.round(clone.y);
      if (cx >= 0 && cx < GRID_WIDTH && cy >= 0 && cy < GRID_HEIGHT) {
        if (map.grid[cy][cx] === TileType.DOT) {
          map.grid[cy][cx] = TileType.EMPTY;
          map.remainingDots--;
          p.score += (p.isFeverMode ? 3 : 1) * 10;
          setScore(p.score);
          vfx.spawnDotAbsorb(cx * BASE_TILE_SIZE + 12, cy * BASE_TILE_SIZE + 12, '#F97316');
        }
      }
    });
    shadowClonesRef.current = shadowClonesRef.current.filter((c) => c.life > 0);

    // Bonus Item
    bonusSpawnTimer.current -= dt;
    if (bonusSpawnTimer.current <= 0 && !bonusItemRef.current) {
      const randomItem = ANIME_BONUS_ITEMS[Math.floor(Math.random() * ANIME_BONUS_ITEMS.length)];
      bonusItemRef.current = {
        ...randomItem,
        x: map.bonusSpawn.x,
        y: map.bonusSpawn.y,
        gridX: map.bonusSpawn.x,
        gridY: map.bonusSpawn.y,
        duration: 10,
        active: true,
      };
      bonusSpawnTimer.current = 25;
    }

    if (bonusItemRef.current) {
      bonusItemRef.current.duration -= dt;
      if (bonusItemRef.current.duration <= 0) bonusItemRef.current = null;
    }

    // Direction & Movement
    const queued = inputRef.current.getQueuedDirection();
    if (queued !== 'NONE') p.nextDir = queued;

    if (p.nextDir !== 'NONE' && p.nextDir !== p.dir) {
      if (canMoveInDirection(p.x, p.y, p.nextDir, map)) p.dir = p.nextDir;
    }

    let moveSpeed = p.speed;
    if (p.isFeverMode) moveSpeed *= 1.4; // +40% Speed during Rainbow Fever
    if (p.activePower === 'DOMAIN_EXPANSION' || p.activePower === 'FULL_COWL_DASH') moveSpeed *= 1.4;
    if (p.activePower === 'GEAR_5_BOUNCE' || p.activePower === 'HOLLOW_MASK_RAGE') moveSpeed *= 1.3;

    let vx = 0;
    let vy = 0;
    if (p.dir === 'LEFT') {
      vx = -1;
      p.angle = Math.PI;
    } else if (p.dir === 'RIGHT') {
      vx = 1;
      p.angle = 0;
    } else if (p.dir === 'UP') {
      vy = -1;
      p.angle = -Math.PI / 2;
    } else if (p.dir === 'DOWN') {
      vy = 1;
      p.angle = Math.PI / 2;
    }

    p.mouthAngle = 0.2 + Math.abs(Math.sin(performance.now() * 0.012 * p.mouthSpeed)) * 0.25;

    if (vx !== 0 || vy !== 0) {
      if (canMoveInDirection(p.x, p.y, p.dir, map)) {
        p.x += vx * moveSpeed * dt * 60;
        p.y += vy * moveSpeed * dt * 60;
      } else {
        p.x = Math.round(p.x);
        p.y = Math.round(p.y);
      }
    }

    if (p.x < -0.5) p.x = GRID_WIDTH - 0.5;
    if (p.x > GRID_WIDTH - 0.5) p.x = -0.5;

    p.gridX = Math.round(p.x);
    p.gridY = Math.round(p.y);

    // Eat Dots & Orbs
    const curTileX = Math.floor(p.x + 0.5);
    const curTileY = Math.floor(p.y + 0.5);

    if (curTileX >= 0 && curTileX < GRID_WIDTH && curTileY >= 0 && curTileY < GRID_HEIGHT) {
      const tile = map.grid[curTileY][curTileX];
      if (tile === TileType.DOT) {
        map.grid[curTileY][curTileX] = TileType.EMPTY;
        map.remainingDots--;
        const multiplier = (p.isFeverMode ? 3 : 1) * p.comboMultiplier;
        p.score += 10 * multiplier;
        setScore(p.score);
        p.ki = Math.min(100, p.ki + 0.6);
        setKiEnergy(p.ki);
        setDotsEatenThisStage((prev) => prev + 1);
        setCoinsEarnedThisRun((prev) => prev + (p.isFeverMode ? 3 : 1));

        // Fever mode counter (100 pellets trigger 7s Rainbow Fever)
        p.feverPelletCounter += 1;
        setFeverPelletCount(p.feverPelletCounter);

        if (p.feverPelletCounter >= 100) {
          p.feverPelletCounter = 0;
          setFeverPelletCount(0);
          p.isFeverMode = true;
          p.feverTimer = 7.0; // Exactly 7 seconds duration
          setIsFeverMode(true);
          setFeverTimer(7.0);

          audioEngine.playFeverStart();
          vfx.triggerScreenShake(14);
          vfx.addFloatingText('🌈 RAINBOW FEVER!', p.x * BASE_TILE_SIZE + 12, p.y * BASE_TILE_SIZE, '#F43F5E', '7s Invincible 3x Score!', 26);
          recordFrame('FEVER_START', '🌈 RAINBOW FEVER (7s)', '#F43F5E');

          try {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
            });
          } catch {}
        }

        onMissionUpdate('DOTS', 1);
        onMissionUpdate('SCORE', 10);
        vfx.spawnDotAbsorb(curTileX * BASE_TILE_SIZE + 12, curTileY * BASE_TILE_SIZE + 12, p.isFeverMode ? '#F43F5E' : map.dotColor);
        if (p.isFeverMode) {
          audioEngine.playFeverChomp();
        } else {
          audioEngine.playDotChomp(dotChompCounter.current++);
        }
      } else if (tile === TileType.POWER_ORB) {
        map.grid[curTileY][curTileX] = TileType.EMPTY;
        map.remainingDots--;
        const multiplier = (p.isFeverMode ? 3 : 1) * p.comboMultiplier;
        p.score += 50 * multiplier;
        setScore(p.score);
        p.ki = Math.min(100, p.ki + 15);
        setKiEnergy(p.ki);
        setCoinsEarnedThisRun((prev) => prev + 5);
        onMissionUpdate('SCORE', 50);
        triggerShonenMove('SUPER_SAIYAN');
      }

      // Bonus item
      if (
        bonusItemRef.current &&
        bonusItemRef.current.active &&
        curTileX === bonusItemRef.current.gridX &&
        curTileY === bonusItemRef.current.gridY
      ) {
        const item = bonusItemRef.current;
        const multiplier = p.isFeverMode ? 3 : 1;
        p.score += item.points * multiplier;
        setScore(p.score);
        p.ki = Math.min(100, p.ki + 30);
        setKiEnergy(p.ki);
        setCoinsEarnedThisRun((prev) => prev + 50);
        audioEngine.playBonusItem();
        vfx.addFloatingText(`+${item.points * multiplier}`, item.x * BASE_TILE_SIZE + 12, item.y * BASE_TILE_SIZE, '#FBBF24', item.name + ' 🪙+50', 22);
        vfx.spawnGhostEatenBurst(item.x * BASE_TILE_SIZE + 12, item.y * BASE_TILE_SIZE + 12, '#FBBF24');
        bonusItemRef.current = null;
      }
    }

    if (map.remainingDots <= 0) {
      handleLevelClear();
      return;
    }

    // Ghosts update with dynamic difficulty & stage level intelligence
    ghostsRef.current.forEach((ghost) => {
      updateGhostAI(ghost, p, ghostsRef.current, map, dt, globalGhostModeRef.current, difficulty, level);

      const dist = Math.hypot(ghost.x - p.x, ghost.y - p.y);
      if (dist < 0.65) {
        if (ghost.state === 'FRIGHTENED' || p.isFeverMode) {
          eatGhost(ghost);
        } else if (p.activePower === 'ULTRA_INSTINCT') {
          // Ultra instinct auto dodge
          vfx.addFloatingText('DODGE!', p.x * BASE_TILE_SIZE + 12, p.y * BASE_TILE_SIZE, '#E2E8F0', 'Ultra Instinct', 16);
        } else if (p.activePower === 'GEAR_5_BOUNCE' || p.activePower === 'HEAVENLY_RESTRICTION') {
          audioEngine.playGear5Bounce();
          ghost.x = map.ghostPenDoor.x;
          ghost.y = map.ghostPenDoor.y;
          ghost.dir = 'UP';
          vfx.spawnGear5JoySparks(ghost.x * BASE_TILE_SIZE + 12, ghost.y * BASE_TILE_SIZE + 12);
          vfx.addFloatingText('BOING!', ghost.x * BASE_TILE_SIZE + 12, ghost.y * BASE_TILE_SIZE, '#EC4899', 'Joy Boy Bounce', 18);
        } else if (ghost.state === 'CHASE' || ghost.state === 'SCATTER' || ghost.state === 'CONFUSED') {
          handlePlayerDeath();
        }
      }
    });
  };

  const canMoveInDirection = (x: number, y: number, dir: Direction, map: MapData): boolean => {
    let nx = Math.round(x);
    let ny = Math.round(y);
    if (dir === 'LEFT') nx -= 1;
    if (dir === 'RIGHT') nx += 1;
    if (dir === 'UP') ny -= 1;
    if (dir === 'DOWN') ny += 1;

    if (nx < 0 || nx >= GRID_WIDTH) return true;
    if (ny < 0 || ny >= GRID_HEIGHT) return false;

    const tile = map.grid[ny][nx];
    return tile !== TileType.WALL && tile !== TileType.GHOST_DOOR;
  };

  // --- VISUAL THOUGHT BUBBLE RENDERER ---
  const drawGhostThoughtBubble = (
    ctx: CanvasRenderingContext2D,
    g: Ghost,
    gx: number,
    gy: number,
    isFrightened: boolean,
    isFrozen: boolean,
    isConfused: boolean,
    isFeverMode: boolean,
    diff: GameDifficulty
  ) => {
    if (!g.thought) return;

    ctx.save();

    const thoughtText = g.thought;
    ctx.font = '900 6.5px "Orbitron", sans-serif';
    const textMetrics = ctx.measureText(thoughtText);
    const textWidth = textMetrics.width;
    const bubbleWidth = Math.max(38, textWidth + 12);
    const bubbleHeight = 13.5;

    // Organic bobbing animation
    const bob = Math.sin(g.pulse * 2.5) * 1.5;
    const bx = gx;
    const by = gy - 19 + bob;
    const halfW = bubbleWidth / 2;
    const halfH = bubbleHeight / 2;

    if (isFeverMode || isFrightened) {
      // -------------------------------------------------------------
      // SCARED / FLEEING / PANIC MODE: Wobbly cloud thought bubble with connector bubbles
      // -------------------------------------------------------------
      const jitter = Math.sin(performance.now() * 0.03 + gx) * 1.2;
      const cloudY = by + jitter;

      // 3 Rising connector thought bubbles
      const dot1X = gx + 1;
      const dot1Y = gy - 9 + jitter * 0.3;
      const dot2X = gx + 2.5;
      const dot2Y = gy - 12.5 + jitter * 0.6;
      const dot3X = gx + 1.5;
      const dot3Y = gy - 15.5 + jitter * 0.8;

      const cloudBorderColor = isFeverMode
        ? `hsl(${(performance.now() * 0.5) % 360}, 100%, 70%)`
        : (g.frightenedTimer < 2.5 && Math.floor(performance.now() / 150) % 2 === 0 ? '#FFFFFF' : '#38BDF8');
      const cloudBgColor = 'rgba(6, 18, 42, 0.94)';
      const cloudGlowColor = isFeverMode ? 'rgba(244, 63, 94, 0.7)' : 'rgba(56, 189, 248, 0.8)';

      ctx.fillStyle = cloudBgColor;
      ctx.strokeStyle = cloudBorderColor;
      ctx.lineWidth = 1.2;
      ctx.shadowColor = cloudGlowColor;
      ctx.shadowBlur = 6;

      // Connector bubbles
      ctx.beginPath();
      ctx.arc(dot1X, dot1Y, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(dot2X, dot2Y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(dot3X, dot3Y, 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cloud bubble body
      const left = bx - halfW;
      const top = cloudY - halfH;

      ctx.beginPath();
      ctx.roundRect(left, top, bubbleWidth, bubbleHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Additional cloud puffs along top for wavy anime cloud aesthetic
      ctx.beginPath();
      ctx.arc(bx - halfW * 0.45, top, 2.8, Math.PI, Math.PI * 2);
      ctx.arc(bx + halfW * 0.45, top, 2.8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 4;
      ctx.shadowColor = '#000000';
      ctx.fillStyle = isFeverMode ? '#FFD700' : '#FDE047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(thoughtText, bx, cloudY);

    } else if (isFrozen) {
      // -------------------------------------------------------------
      // FROZEN / TIME STOP: Crystalline Diamond Ice Bubble
      // -------------------------------------------------------------
      ctx.fillStyle = 'rgba(8, 26, 56, 0.94)';
      ctx.strokeStyle = '#67E8F9';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 8;

      const left = bx - halfW;
      const right = bx + halfW;
      const top = by - halfH;
      const bottom = by + halfH;
      const notch = 3.5;

      ctx.beginPath();
      ctx.moveTo(left + notch, top);
      ctx.lineTo(right - notch, top);
      ctx.lineTo(right, top + notch);
      ctx.lineTo(right, bottom - notch);
      ctx.lineTo(right - notch, bottom);
      // Downward ice spike connector
      ctx.lineTo(bx + 3, bottom);
      ctx.lineTo(bx, bottom + 4);
      ctx.lineTo(bx - 3, bottom);
      ctx.lineTo(left + notch, bottom);
      ctx.lineTo(left, bottom - notch);
      ctx.lineTo(left, top + notch);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 3;
      ctx.shadowColor = '#000000';
      ctx.fillStyle = '#CFFAFE';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(thoughtText, bx, by);

    } else if (isConfused) {
      // -------------------------------------------------------------
      // CONFUSED / ILLUSION: Wobbly Spiral Magenta Comic Bubble
      // -------------------------------------------------------------
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.sin(g.pulse * 3) * 0.07);

      ctx.fillStyle = 'rgba(32, 8, 38, 0.94)';
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = '#EC4899';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.roundRect(-halfW, -halfH, bubbleWidth, bubbleHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Comic pointer
      ctx.beginPath();
      ctx.moveTo(-3, halfH);
      ctx.lineTo(0, halfH + 3.5);
      ctx.lineTo(3, halfH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 3;
      ctx.shadowColor = '#000000';
      ctx.fillStyle = '#FBCFE8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(thoughtText, 0, 0);
      ctx.restore();

    } else if (g.state === 'SCATTER') {
      // -------------------------------------------------------------
      // SCATTER / RETREAT: Emerald Cyber Visor Badge
      // -------------------------------------------------------------
      ctx.fillStyle = 'rgba(2, 26, 20, 0.94)';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 6;

      const left = bx - halfW;
      const right = bx + halfW;
      const top = by - halfH;
      const bottom = by + halfH;
      const notch = 2.5;

      ctx.beginPath();
      ctx.moveTo(left + notch, top);
      ctx.lineTo(right - notch, top);
      ctx.lineTo(right, top + notch);
      ctx.lineTo(right, bottom - notch);
      ctx.lineTo(right - notch, bottom);
      // Laser connector
      ctx.lineTo(bx + 2.5, bottom);
      ctx.lineTo(bx, bottom + 3.5);
      ctx.lineTo(bx - 2.5, bottom);
      ctx.lineTo(left + notch, bottom);
      ctx.lineTo(left, bottom - notch);
      ctx.lineTo(left, top + notch);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 3;
      ctx.shadowColor = '#000000';
      ctx.fillStyle = '#A7F3D0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(thoughtText, bx, by);

    } else {
      // -------------------------------------------------------------
      // AGGRESSIVE / HUNTER MODE (CHASE): Jagged Combat Callout Bubble
      // -------------------------------------------------------------
      const isHunterDiff = diff === 'HUNTER';
      const isAkuma = g.id === 'AKUMA';
      const borderColor = isHunterDiff
        ? '#EF4444'
        : isAkuma
        ? '#F43F5E'
        : g.id === 'RAIDEN'
        ? '#06B6D4'
        : g.id === 'KITSUNE'
        ? '#F472B6'
        : '#FB923C';
      const glowColor = isHunterDiff ? 'rgba(239, 68, 68, 0.9)' : borderColor;

      ctx.fillStyle = 'rgba(20, 4, 10, 0.94)';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isHunterDiff ? 1.5 : 1.2;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isHunterDiff ? 10 : 6;

      const left = bx - halfW;
      const right = bx + halfW;
      const top = by - halfH;
      const bottom = by + halfH;
      const spike = isHunterDiff ? 2 : 1.5;

      // Angular aggressive combat callout box with jagged corners & downward spear pointer
      ctx.beginPath();
      ctx.moveTo(left + 3, top);
      ctx.lineTo(bx - halfW * 0.2, top - (isHunterDiff ? 1 : 0));
      ctx.lineTo(right - 3, top);
      ctx.lineTo(right + spike, by);
      ctx.lineTo(right - 3, bottom);
      // Downward aggressive spear pointer
      ctx.lineTo(bx + 3.5, bottom);
      ctx.lineTo(bx, bottom + 4.5);
      ctx.lineTo(bx - 3.5, bottom);
      ctx.lineTo(left - spike, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (isHunterDiff) {
        ctx.strokeStyle = 'rgba(254, 202, 202, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.shadowBlur = 4;
      ctx.shadowColor = '#000000';
      ctx.fillStyle = isHunterDiff ? '#FCA5A5' : '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(thoughtText, bx, by);
    }

    ctx.restore();
  };

  // --- CANVAS RENDERING (2D, 2.5D Isometric, 3D Cyber Matrix) ---
  const renderGame = (ctx: CanvasRenderingContext2D) => {
    const map = mapDataRef.current;
    const p = playerRef.current;
    const vfx = vfxRef.current;
    const width = GRID_WIDTH * BASE_TILE_SIZE;
    const height = GRID_HEIGHT * BASE_TILE_SIZE;

    ctx.save();

    if (vfx.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * vfx.screenShake;
      const shakeY = (Math.random() - 0.5) * vfx.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    ctx.clearRect(0, 0, width, height);

    // Apply 2.5D Isometric Tilt or 3D Matrix Perspective Transformation
    if (perspective === '2_5D_ISO') {
      ctx.translate(width * 0.05, height * 0.05);
      ctx.scale(0.9, 0.9);
    }

    // 1. Draw Maze Walls with Texture Styles
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = map.wallColor;
    ctx.shadowColor = map.wallGlow;
    ctx.shadowBlur = 10;

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const tile = map.grid[y][x];
        const px = x * BASE_TILE_SIZE;
        const py = y * BASE_TILE_SIZE;

        if (tile === TileType.WALL) {
          // 2.5D Extrusion Shadow
          if (perspective === '2_5D_ISO') {
            ctx.fillStyle = '#02040a';
            ctx.fillRect(px + 4, py + 4, BASE_TILE_SIZE - 2, BASE_TILE_SIZE - 2);
          }

          // Wall Pattern Texture
          if (map.textureStyle === 'WOODBLOCK_UKIYOE') {
            ctx.fillStyle = '#081d42';
            ctx.fillRect(px + 1, py + 1, BASE_TILE_SIZE - 2, BASE_TILE_SIZE - 2);
            ctx.strokeRect(px + 2, py + 2, BASE_TILE_SIZE - 4, BASE_TILE_SIZE - 4);
          } else if (map.textureStyle === 'GOLD_LEAF_SHRINE') {
            ctx.fillStyle = '#261a04';
            ctx.fillRect(px + 1, py + 1, BASE_TILE_SIZE - 2, BASE_TILE_SIZE - 2);
            ctx.strokeRect(px + 2, py + 2, BASE_TILE_SIZE - 4, BASE_TILE_SIZE - 4);
          } else if (map.textureStyle === 'OBSIDIAN_CRYSTAL') {
            ctx.fillStyle = '#1c0d2e';
            ctx.fillRect(px + 1, py + 1, BASE_TILE_SIZE - 2, BASE_TILE_SIZE - 2);
            ctx.strokeRect(px + 2, py + 2, BASE_TILE_SIZE - 4, BASE_TILE_SIZE - 4);
          } else {
            ctx.fillStyle = '#090d1f';
            ctx.fillRect(px + 1, py + 1, BASE_TILE_SIZE - 2, BASE_TILE_SIZE - 2);
            ctx.strokeRect(px + 2, py + 2, BASE_TILE_SIZE - 4, BASE_TILE_SIZE - 4);
          }
        } else if (tile === TileType.GHOST_DOOR) {
          ctx.fillStyle = '#F472B6';
          ctx.fillRect(px, py + BASE_TILE_SIZE / 2 - 2, BASE_TILE_SIZE, 4);
        } else if (tile === TileType.DOT) {
          ctx.fillStyle = map.dotColor;
          ctx.shadowColor = map.dotColor;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(px + BASE_TILE_SIZE / 2, py + BASE_TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === TileType.POWER_ORB) {
          const pulse = Math.sin(performance.now() * 0.008) * 1.5;
          ctx.fillStyle = '#FACC15';
          ctx.shadowColor = '#FBBF24';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(px + BASE_TILE_SIZE / 2, py + BASE_TILE_SIZE / 2, 6 + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(px + BASE_TILE_SIZE / 2, py + BASE_TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Bonus Anime Item
    if (bonusItemRef.current && bonusItemRef.current.active) {
      const item = bonusItemRef.current;
      const bx = item.x * BASE_TILE_SIZE + 12;
      const by = item.y * BASE_TILE_SIZE + 12 + Math.sin(performance.now() * 0.006) * 3;
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 12;
      ctx.fillText(item.icon, bx, by);
    }

    // 3. Shadow Clones
    shadowClonesRef.current.forEach((clone) => {
      const cx = clone.x * BASE_TILE_SIZE + 12;
      const cy = clone.y * BASE_TILE_SIZE + 12;
      ctx.save();
      ctx.fillStyle = 'rgba(249, 115, 22, 0.7)';
      ctx.shadowColor = '#F97316';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 4. Kamehameha Beam
    if (vfx.kamehameha.active) {
      const beam = vfx.kamehameha;
      ctx.save();
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 25;
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = beam.width;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(beam.startX, beam.startY);
      let endX = beam.startX;
      let endY = beam.startY;
      if (beam.dir === 'RIGHT') endX += beam.length;
      if (beam.dir === 'LEFT') endX -= beam.length;
      if (beam.dir === 'DOWN') endY += beam.length;
      if (beam.dir === 'UP') endY -= beam.length;
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = beam.width * 0.45;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Draw Ghosts with Custom Ghost Skins & Tactical Thoughts
    ghostsRef.current.forEach((g) => {
      const gx = g.x * BASE_TILE_SIZE + 12;
      const gy = g.y * BASE_TILE_SIZE + 12;
      const isFrightened = g.state === 'FRIGHTENED';
      const isEaten = g.state === 'EATEN';
      const isFrozen = g.state === 'FROZEN';
      const isConfused = g.state === 'CONFUSED';

      ctx.save();
      if (isEaten) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(gx - 4, gy, 3, 0, Math.PI * 2);
        ctx.arc(gx + 4, gy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(gx - 4, gy, 1.5, 0, Math.PI * 2);
        ctx.arc(gx + 4, gy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const gSkin = p.equippedGhostSkinData || currentGhostSkinData;
        let ghostColor = g.id === 'AKUMA' ? gSkin.akumaColor : g.id === 'KITSUNE' ? gSkin.kitsuneColor : g.id === 'RAIDEN' ? gSkin.raidenColor : gSkin.kageColor;
        let ghostGlow = g.glowColor;

        if (p.isFeverMode || isFrightened) {
          if (p.isFeverMode) {
            const fHue = (performance.now() * 0.4 + (g.id === 'AKUMA' ? 0 : g.id === 'KITSUNE' ? 90 : g.id === 'RAIDEN' ? 180 : 270)) % 360;
            ghostColor = `hsl(${fHue}, 100%, 70%)`;
            ghostGlow = `hsl(${fHue}, 100%, 60%)`;
          } else {
            const isFlashing = g.frightenedTimer < 2.5 && Math.floor(performance.now() / 150) % 2 === 0;
            ghostColor = isFlashing ? '#FFFFFF' : '#38BDF8';
            ghostGlow = isFlashing ? 'rgba(255,255,255,0.8)' : 'rgba(56,189,248,0.8)';
          }
        } else if (isFrozen) {
          ghostColor = '#818CF8';
          ghostGlow = 'rgba(129,140,248,0.9)';
        } else if (isConfused) {
          ghostColor = '#F43F5E';
        }

        ctx.shadowColor = ghostGlow;
        ctx.shadowBlur = 12;
        ctx.fillStyle = ghostColor;

        ctx.beginPath();
        ctx.arc(gx, gy - 2, 9, Math.PI, 0, false);
        const wave = Math.sin(g.pulse * 3) * 2;
        ctx.lineTo(gx + 9, gy + 8 + wave);
        ctx.lineTo(gx + 3, gy + 5 - wave);
        ctx.lineTo(gx - 3, gy + 8 + wave);
        ctx.lineTo(gx - 9, gy + 5 - wave);
        ctx.closePath();
        ctx.fill();

        if (!isFrightened && !p.isFeverMode) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(gx - 4, gy - 3, 2.8, 0, Math.PI * 2);
          ctx.arc(gx + 4, gy - 3, 2.8, 0, Math.PI * 2);
          ctx.fill();

          let eyeDx = 0;
          let eyeDy = 0;
          if (g.dir === 'LEFT') eyeDx = -1.5;
          if (g.dir === 'RIGHT') eyeDx = 1.5;
          if (g.dir === 'UP') eyeDy = -1.5;
          if (g.dir === 'DOWN') eyeDy = 1.5;

          ctx.fillStyle = '#090D1F';
          ctx.beginPath();
          ctx.arc(gx - 4 + eyeDx, gy - 3 + eyeDy, 1.4, 0, Math.PI * 2);
          ctx.arc(gx + 4 + eyeDx, gy - 3 + eyeDy, 1.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(gx - 4, gy - 2, 2, 0, Math.PI * 2);
          ctx.arc(gx + 4, gy - 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Tactical Thought Bubble Indicator (Dynamic shape, color & icon based on state intent)
      if (g.thought && !isEaten && (gameState === 'PLAYING' || gameState === 'PAUSED')) {
        drawGhostThoughtBubble(
          ctx,
          g,
          gx,
          gy,
          isFrightened,
          isFrozen,
          isConfused,
          p.isFeverMode,
          difficulty
        );
      }
    });

    // 5.5. Draw Shadow Ghost Racer (Translucent Holographic Silhouette of Personal Best Run)
    if (ghostRacerEnabled && activeBestReplayRef.current && gameState === 'PLAYING') {
      try {
        const replay = activeBestReplayRef.current;
        const frames: GhostReplayFrame[] = JSON.parse(replay.replayData);
        const elapsed = performance.now() - levelStartTimeRef.current;
        
        // Find closest replay frame
        let rFrame: GhostReplayFrame | null = null;
        for (let i = 0; i < frames.length; i++) {
          if (frames[i].t <= elapsed) {
            rFrame = frames[i];
          } else {
            break;
          }
        }

        if (rFrame) {
          const rx = rFrame.px * BASE_TILE_SIZE + 12;
          const ry = rFrame.py * BASE_TILE_SIZE + 12;
          
          ctx.save();
          ctx.translate(rx, ry);
          ctx.rotate(rFrame.pAngle || 0);

          // Ethereal Ghost Racer Halo
          ctx.globalAlpha = 0.55;
          ctx.shadowColor = '#38BDF8';
          ctx.shadowBlur = 16;
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(0, 0, 9, (rFrame.mouthAngle || 0.2) * Math.PI, (2 - (rFrame.mouthAngle || 0.2)) * Math.PI);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Text tag over Shadow Ghost
          ctx.save();
          ctx.globalAlpha = 0.75;
          ctx.font = '800 8px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#38BDF8';
          ctx.shadowColor = '#0284C7';
          ctx.shadowBlur = 6;
          ctx.fillText('⚡ RECORD GHOST', rx, ry - 12);
          ctx.restore();
        }
      } catch {
        // ignore parse errors
      }
    }

    // 6. Draw Pac-Man with Equipped Character Skin & Headgear (or Rainbow Fever Aura)
    const validX = isFinite(p.x) && !isNaN(p.x) ? p.x : (map.playerStart?.x ?? 10);
    const validY = isFinite(p.y) && !isNaN(p.y) ? p.y : (map.playerStart?.y ?? 18);
    const validAngle = isFinite(p.angle) && !isNaN(p.angle) ? p.angle : 0;
    const validMouth = isFinite(p.mouthAngle) && !isNaN(p.mouthAngle) ? Math.min(0.45, Math.max(0.05, p.mouthAngle)) : 0.2;

    const px = validX * BASE_TILE_SIZE + 12;
    const py = validY * BASE_TILE_SIZE + 12;
    const skin = p.equippedSkinData || currentSkinData;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(validAngle);

    // Rainbow Fever or Regular Aura
    const rainbowHue = (performance.now() * 0.35) % 360;
    const rainbowColor = `hsl(${rainbowHue}, 100%, 65%)`;

    if (p.isFeverMode) {
      ctx.shadowColor = rainbowColor;
      ctx.shadowBlur = 32;
      ctx.fillStyle = rainbowColor;
    } else {
      ctx.shadowColor = skin.auraColor || '#FACC15';
      ctx.shadowBlur = p.activePower ? 26 : 14;
      ctx.fillStyle = skin.color;
    }

    const pacRadius = p.activePower === 'GEAR_5_BOUNCE' || p.activePower === 'SUPER_TENGEN_TOPPA' || p.isFeverMode ? 13 : 10;
    ctx.beginPath();
    ctx.arc(0, 0, pacRadius, validMouth * Math.PI, (2 - validMouth) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Anime Headgear / Props
    if (!p.isFeverMode) {
      if (skin.headgear === 'straw_hat') {
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(-8, -12, 16, 3);
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(-5, -14, 10, 2);
      } else if (skin.headgear === 'super_hair') {
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.moveTo(-6, -8);
        ctx.lineTo(-2, -16);
        ctx.lineTo(4, -8);
        ctx.lineTo(8, -14);
        ctx.lineTo(8, -6);
        ctx.closePath();
        ctx.fill();
      } else if (skin.headgear === 'blindfold') {
        ctx.fillStyle = '#1E1B4B';
        ctx.fillRect(-2, -7, 6, 4);
      } else if (skin.headgear === 'hollow_mask') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, -7, 5, 5);
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(1, -6, 2, 3);
      } else {
        ctx.fillStyle = '#06B6D4';
        ctx.beginPath();
        ctx.arc(2, -4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Rainbow Crown
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.lineTo(-3, -14);
      ctx.lineTo(0, -9);
      ctx.lineTo(3, -14);
      ctx.lineTo(6, -8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Rainbow Fever Top Banner
    if (p.isFeverMode) {
      ctx.save();
      const rHue = (performance.now() * 0.3) % 360;
      ctx.font = '900 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `hsl(${rHue}, 100%, 65%)`;
      ctx.shadowColor = `hsl(${rHue}, 100%, 65%)`;
      ctx.shadowBlur = 16;
      ctx.fillText(`🌈 RAINBOW FEVER! 3X MULTIPLIER (${p.feverTimer.toFixed(1)}s)`, width / 2, 22);
      ctx.restore();
    }

    // 7. Particles
    vfx.particles.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      if (pt.shape === 'petal') {
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rotation || 0);
        ctx.ellipse(0, 0, pt.size * 1.5, pt.size * 0.7, 0, 0, Math.PI * 2);
      } else if (pt.shape === 'spark') {
        ctx.rect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size * 2);
      } else {
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    });

    // 8. Floating Combat Texts
    vfx.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.font = `900 ${ft.size}px 'Orbitron', 'Rajdhani', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, ft.x, ft.y);

      if (ft.subtext) {
        ctx.font = `700 12px 'Rajdhani', sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(ft.subtext, ft.x, ft.y + 14);
      }
      ctx.restore();
    });

    ctx.restore();
  };

  const startGame = () => {
    levelStartTimeRef.current = performance.now();
    replayFramesRef.current = [];
    activeBestReplayRef.current = getLocalBestReplay(level);
    recordFrame();
    audioEngine.startMusic();
    setGameState('PLAYING');
  };

  const restartCurrentLevel = () => {
    const mSkin = GACHA_MAZE_SKINS.find((m) => m.id === equippedMazeSkinId);
    mapDataRef.current = generateLevelMap(level, mSkin?.style);
    ghostsRef.current = createInitialGhosts(mapDataRef.current, level, difficulty);
    playerRef.current.lives = 3;
    playerRef.current.score = 0;
    playerRef.current.ki = 100;
    playerRef.current.isFeverMode = false;
    playerRef.current.feverTimer = 0;
    playerRef.current.feverPelletCounter = 0;
    playerRef.current.ghostChainCount = 0;
    playerRef.current.ghostChainTimer = 0;
    playerRef.current.comboMultiplier = 1;
    setIsFeverMode(false);
    setFeverTimer(0);
    setFeverPelletCount(0);
    setGhostChainCount(0);
    setGhostChainTimer(0);
    setComboMultiplier(1);
    setLives(3);
    setScore(0);
    setKiEnergy(100);
    resetPlayerPosition();
    levelStartTimeRef.current = performance.now();
    replayFramesRef.current = [];
    activeBestReplayRef.current = getLocalBestReplay(level);
    recordFrame();
    audioEngine.startMusic();
    setGameState('PLAYING');
  };

  const setPlayerDirection = (dir: Direction) => {
    inputRef.current.setDirection(dir);
  };

  return {
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
    maxGhostChainTimer: 6.0,
    controllerInfo,
    mapData: mapDataRef.current,
    ghostRacerEnabled,
    setGhostRacerEnabled,
    activeBestReplay: activeBestReplayRef.current,
    isFeverMode,
    feverTimer,
    feverPelletCount,
    startGame,
    restartCurrentLevel,
    triggerShonenMove,
    setPlayerDirection,
  };
}

