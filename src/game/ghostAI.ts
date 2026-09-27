import { 
  Ghost, 
  GhostType, 
  GhostState, 
  Direction, 
  MapData, 
  TileType, 
  PlayerState, 
  GameDifficulty 
} from './types';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';

const OPPOSITE_DIR: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
  NONE: 'NONE',
};

export function createInitialGhosts(
  mapData: MapData, 
  level = 1, 
  difficulty: GameDifficulty = 'NORMAL'
): Ghost[] {
  let diffMultiplier = 1.0;
  if (difficulty === 'EASY') diffMultiplier = 0.8;
  if (difficulty === 'NORMAL') diffMultiplier = 1.0;
  if (difficulty === 'HARD') diffMultiplier = 1.2;
  if (difficulty === 'GHOSTLY') diffMultiplier = 1.35;
  if (difficulty === 'HUNTER') diffMultiplier = 1.55;

  // Level speed scaling (higher level = higher difficulty & speed)
  const levelSpeedMultiplier = 1.0 + Math.min(0.6, (level - 1) * 0.015);
  const baseSpeed = 0.075 * levelSpeedMultiplier * diffMultiplier;

  // Level exit reduction on higher levels
  const levelExitReduction = Math.min(3, Math.floor((level - 1) / 3));

  return [
    {
      id: 'AKUMA',
      name: 'Akuma (Red Oni)',
      title: 'The Relentless Hunter',
      color: '#EF4444',
      glowColor: 'rgba(239, 68, 68, 0.7)',
      x: mapData.ghostSpawns.AKUMA.x,
      y: mapData.ghostSpawns.AKUMA.y,
      gridX: Math.round(mapData.ghostSpawns.AKUMA.x),
      gridY: Math.round(mapData.ghostSpawns.AKUMA.y),
      dir: 'LEFT',
      speed: baseSpeed,
      baseSpeed,
      state: 'CHASE',
      frightenedTimer: 0,
      homeCorner: { x: GRID_WIDTH - 2, y: 1 }, // Top Right
      penExitDelay: 0,
      isInPen: false,
      targetTile: { x: mapData.playerStart.x, y: mapData.playerStart.y },
      pulse: 0,
      tacticalRole: 'HUNTER',
      thought: '🎯 LOCKING TARGET',
    },
    {
      id: 'KITSUNE',
      name: 'Kitsune (Pink Fox)',
      title: 'The Ambush Trickster',
      color: '#F472B6',
      glowColor: 'rgba(244, 114, 182, 0.7)',
      x: mapData.ghostSpawns.KITSUNE.x,
      y: mapData.ghostSpawns.KITSUNE.y,
      gridX: Math.round(mapData.ghostSpawns.KITSUNE.x),
      gridY: Math.round(mapData.ghostSpawns.KITSUNE.y),
      dir: 'UP',
      speed: baseSpeed * 0.95,
      baseSpeed: baseSpeed * 0.95,
      state: 'CHASE',
      frightenedTimer: 0,
      homeCorner: { x: 1, y: 1 }, // Top Left
      penExitDelay: Math.max(0.4, 1.5 - levelExitReduction * 0.3),
      isInPen: true,
      targetTile: { x: 1, y: 1 },
      pulse: 0,
      tacticalRole: 'AMBUSHER',
      thought: '🦊 PREPARING AMBUSH',
    },
    {
      id: 'RAIDEN',
      name: 'Raiden (Cyan Raijin)',
      title: 'The Thunder Flanker',
      color: '#06B6D4',
      glowColor: 'rgba(6, 182, 212, 0.7)',
      x: mapData.ghostSpawns.RAIDEN.x,
      y: mapData.ghostSpawns.RAIDEN.y,
      gridX: Math.round(mapData.ghostSpawns.RAIDEN.x),
      gridY: Math.round(mapData.ghostSpawns.RAIDEN.y),
      dir: 'UP',
      speed: baseSpeed * 0.92,
      baseSpeed: baseSpeed * 0.92,
      state: 'CHASE',
      frightenedTimer: 0,
      homeCorner: { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 }, // Bottom Right
      penExitDelay: Math.max(0.8, 3.0 - levelExitReduction * 0.5),
      isInPen: true,
      targetTile: { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 },
      pulse: 0,
      tacticalRole: 'PINCER',
      thought: '⚡ FORMING PINCER',
    },
    {
      id: 'KAGE',
      name: 'Kage (Shadow Spectre)',
      title: 'The Wandering Phantom',
      color: '#F97316',
      glowColor: 'rgba(249, 115, 22, 0.7)',
      x: mapData.ghostSpawns.KAGE.x,
      y: mapData.ghostSpawns.KAGE.y,
      gridX: Math.round(mapData.ghostSpawns.KAGE.x),
      gridY: Math.round(mapData.ghostSpawns.KAGE.y),
      dir: 'UP',
      speed: baseSpeed * 0.88,
      baseSpeed: baseSpeed * 0.88,
      state: 'CHASE',
      frightenedTimer: 0,
      homeCorner: { x: 1, y: GRID_HEIGHT - 2 }, // Bottom Left
      penExitDelay: Math.max(1.2, 4.5 - levelExitReduction * 0.7),
      isInPen: true,
      targetTile: { x: 1, y: GRID_HEIGHT - 2 },
      pulse: 0,
      tacticalRole: 'PATROLLER',
      thought: '👻 SHADOW HUNT',
    },
  ];
}

/**
 * Intelligent Multi-Threaded Tactical Ghost Brain
 */
export function updateGhostAI(
  ghost: Ghost,
  player: PlayerState,
  allGhosts: Ghost[],
  mapData: MapData,
  dt: number,
  globalMode: 'CHASE' | 'SCATTER' | 'DOMAIN_FROZEN',
  difficulty: GameDifficulty = 'NORMAL',
  level = 1
) {
  ghost.pulse += dt * 4;

  // Handle Domain Expansion & Time Stop Freeze
  if (globalMode === 'DOMAIN_FROZEN' && ghost.state !== 'EATEN') {
    ghost.state = 'FROZEN';
    ghost.thought = '❄️ DOMAIN FROZEN';
    return;
  } else if (ghost.state === 'FROZEN' && globalMode !== 'DOMAIN_FROZEN') {
    ghost.state = 'CHASE';
  }

  // Handle Pen Exit Logic
  if (ghost.isInPen) {
    if (ghost.penExitDelay > 0) {
      ghost.penExitDelay -= dt;
      // Gentle hovering animation inside pen
      const spawn = mapData.ghostSpawns[ghost.id] || { x: mapData.ghostPenDoor.x, y: mapData.ghostPenDoor.y };
      ghost.x = spawn.x;
      ghost.y = spawn.y + Math.sin(ghost.pulse * 3) * 0.15;
      ghost.thought = `⏳ DEPLOYING IN ${Math.ceil(ghost.penExitDelay)}s`;

      if (ghost.penExitDelay < -4.0) {
        ghost.penExitDelay = 0;
      }
      return;
    } else {
      // Step smoothly out through the ghost door
      const doorX = mapData.ghostPenDoor.x;
      const targetExitY = mapData.ghostPenDoor.y - 1;

      // First align with door X
      if (Math.abs(ghost.x - doorX) > 0.08) {
        ghost.x += Math.sign(doorX - ghost.x) * ghost.baseSpeed * dt * 60;
        ghost.dir = doorX > ghost.x ? 'RIGHT' : 'LEFT';
        ghost.thought = '🚪 MOVING TO GATE';
        return;
      } else {
        ghost.x = doorX;
      }

      // Then move up through door Y
      ghost.y -= ghost.baseSpeed * dt * 60;
      ghost.dir = 'UP';
      ghost.thought = '⚡ EXITING GHOST PEN';

      if (ghost.y <= targetExitY + 0.08 || ghost.y < targetExitY) {
        // Successfully exited into the active maze!
        ghost.x = doorX;
        ghost.y = targetExitY;
        ghost.gridX = doorX;
        ghost.gridY = targetExitY;
        ghost.isInPen = false;
        ghost.dir = 'LEFT';
        ghost.state = player.isFeverMode ? 'FRIGHTENED' : 'CHASE';
        ghost.thought = '🔥 HUNTING SHINOBI';
      }
      return;
    }
  }

  // Handle Frightened Timer (including Rainbow Fever mode)
  if (player.isFeverMode) {
    if (ghost.state !== 'EATEN') {
      ghost.state = 'FRIGHTENED';
      ghost.thought = '🌈 FEVER PANIC!';
    }
  } else if (ghost.state === 'FRIGHTENED') {
    ghost.frightenedTimer -= dt;
    if (ghost.frightenedTimer <= 0) {
      ghost.state = 'CHASE';
      ghost.thought = '⚡ SENSES RESTORED';
    }
  }

  // =========================================================================
  // CRITICAL THINKING & TACTICAL BRAIN CALCULATION
  // =========================================================================
  const levelAdvantage = Math.min(4, Math.floor((level - 1) / 5));

  if (ghost.state === 'EATEN') {
    ghost.targetTile = { x: mapData.ghostPenDoor.x, y: mapData.ghostPenDoor.y };
    ghost.thought = '👁️ RETURNING TO RECHARGE';
    if (Math.hypot(ghost.x - mapData.ghostPenDoor.x, ghost.y - mapData.ghostPenDoor.y) < 0.6) {
      const spawn = mapData.ghostSpawns[ghost.id] || { x: mapData.ghostPenDoor.x, y: mapData.ghostPenDoor.y };
      ghost.x = spawn.x;
      ghost.y = spawn.y;
      ghost.gridX = Math.round(spawn.x);
      ghost.gridY = Math.round(spawn.y);
      ghost.state = 'CHASE';
      ghost.isInPen = true;
      ghost.penExitDelay = 1.0; // Quick 1 second regeneration before exiting cage again
      ghost.thought = '💥 REGENERATING IN CAGE';
    }
  } else if (ghost.state === 'FRIGHTENED' || ghost.state === 'BLINDED') {
    // Tactical evasion: run to opposite corner of player
    const awayX = player.gridX < GRID_WIDTH / 2 ? GRID_WIDTH - 2 : 1;
    const awayY = player.gridY < GRID_HEIGHT / 2 ? GRID_HEIGHT - 2 : 1;
    ghost.targetTile = { x: awayX, y: awayY };
    ghost.thought = '😱 FLEEING TO SAFEZONE';
  } else if (ghost.state === 'CONFUSED') {
    ghost.targetTile = {
      x: Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1,
      y: Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1,
    };
    ghost.thought = '🌀 ILLUSION CONFUSION';
  } else if (globalMode === 'SCATTER') {
    ghost.targetTile = ghost.homeCorner;
    ghost.thought = '🛡️ RETREATING TO HOME CORNER';
  } else {
    // ACTIVE TACTICAL CHASE BY PERSONALITY
    switch (ghost.id) {
      case 'AKUMA': {
        // Red Oni (Hunter): Direct pursuit with forward lead based on difficulty & level
        let tx = player.gridX;
        let ty = player.gridY;
        let lead = 0;
        if (difficulty === 'HARD') lead = 2 + (levelAdvantage > 0 ? 1 : 0);
        if (difficulty === 'GHOSTLY') lead = 3 + (levelAdvantage > 0 ? 1 : 0);
        if (difficulty === 'HUNTER') lead = 4 + (levelAdvantage > 0 ? 2 : 0);

        if (lead > 0) {
          if (player.dir === 'RIGHT') tx += lead;
          if (player.dir === 'LEFT') tx -= lead;
          if (player.dir === 'DOWN') ty += lead;
          if (player.dir === 'UP') ty -= lead;
          ghost.thought = `🎯 INTERCEPTING (${lead}T LEAD)`;
        } else {
          ghost.thought = '🗡️ DIRECT PURSUIT';
        }
        ghost.targetTile = { x: tx, y: ty };
        break;
      }

      case 'KITSUNE': {
        // Pink Fox (Ambusher): Calculates 4 to 6 steps ahead to block escape corridors
        let leadDistance = 4;
        if (difficulty === 'EASY') leadDistance = 2;
        if (difficulty === 'HARD') leadDistance = 5;
        if (difficulty === 'GHOSTLY' || difficulty === 'HUNTER') leadDistance = 6 + levelAdvantage;

        let targetX = player.gridX;
        let targetY = player.gridY;

        if (player.dir === 'UP') {
          targetY -= leadDistance;
          targetX -= leadDistance;
        } else if (player.dir === 'DOWN') {
          targetY += leadDistance;
        } else if (player.dir === 'LEFT') {
          targetX -= leadDistance;
        } else if (player.dir === 'RIGHT') {
          targetX += leadDistance;
        }

        ghost.targetTile = { x: targetX, y: targetY };
        ghost.thought = `🦊 CORRIDOR AMBUSH (+${leadDistance})`;
        break;
      }

      case 'RAIDEN': {
        // Cyan Thunder (Pincer): Coordinates with Akuma to squeeze player in a double-sided trap
        const akuma = allGhosts.find((g) => g.id === 'AKUMA');
        const ax = akuma ? akuma.gridX : player.gridX;
        const ay = akuma ? akuma.gridY : player.gridY;

        let pFrontX = player.gridX;
        let pFrontY = player.gridY;
        const offset = difficulty === 'HUNTER' ? 3 : 2;

        if (player.dir === 'UP') pFrontY -= offset;
        if (player.dir === 'DOWN') pFrontY += offset;
        if (player.dir === 'LEFT') pFrontX -= offset;
        if (player.dir === 'RIGHT') pFrontX += offset;

        // Symmetric pincer point
        const targetX = pFrontX + (pFrontX - ax);
        const targetY = pFrontY + (pFrontY - ay);
        ghost.targetTile = { x: targetX, y: targetY };
        ghost.thought = '⚡ PINCER SQUEEZE TRAP';
        break;
      }

      case 'KAGE': {
        // Orange Shadow (Patroller): Protects remaining dots & power orbs, or traps near exits
        const dist = Math.hypot(ghost.gridX - player.gridX, ghost.gridY - player.gridY);
        const triggerDistance = difficulty === 'HUNTER' ? 5 : difficulty === 'HARD' ? 6 : 8;

        if (dist > triggerDistance) {
          ghost.targetTile = { x: player.gridX, y: player.gridY };
          ghost.thought = '👁️ STALKING FROM SHADOWS';
        } else {
          ghost.targetTile = ghost.homeCorner;
          ghost.thought = '🕸️ PATROLLING CHOKEPOINT';
        }
        break;
      }
    }
  }

  // =========================================================================
  // SPEED & PACING MODIFIERS
  // =========================================================================
  let currentSpeed = ghost.baseSpeed;
  if (ghost.state === 'FRIGHTENED') currentSpeed = ghost.baseSpeed * 0.55;
  if (ghost.state === 'EATEN') currentSpeed = ghost.baseSpeed * 2.4;

  // Level & Hunter Enrage Acceleration when dots get low
  const dotsRatio = mapData.totalDots > 0 ? mapData.remainingDots / mapData.totalDots : 1;
  if (difficulty === 'HUNTER' && dotsRatio < 0.4) {
    currentSpeed *= 1.25;
    ghost.thought = '🔥 ENRAGED SPEED +25%';
  } else if (difficulty === 'GHOSTLY' && dotsRatio < 0.3) {
    currentSpeed *= 1.15;
  }

  // =========================================================================
  // SMOOTH GRID TILE MOVEMENT & INTERSECTION DECISION-MAKING
  // =========================================================================
  let vx = 0;
  let vy = 0;
  if (ghost.dir === 'LEFT') vx = -1;
  if (ghost.dir === 'RIGHT') vx = 1;
  if (ghost.dir === 'UP') vy = -1;
  if (ghost.dir === 'DOWN') vy = 1;

  const step = currentSpeed * dt * 60;
  const prevX = ghost.x;
  const prevY = ghost.y;

  ghost.x += vx * step;
  ghost.y += vy * step;

  // Warp tunnel wrap
  if (ghost.x < -0.5) ghost.x = GRID_WIDTH - 0.5;
  if (ghost.x > GRID_WIDTH - 0.5) ghost.x = -0.5;

  const currTileX = Math.round(ghost.x);
  const currTileY = Math.round(ghost.y);

  // Detect when crossing tile center threshold
  const crossedCenterX = (prevX <= currTileX && ghost.x >= currTileX) || (prevX >= currTileX && ghost.x <= currTileX);
  const crossedCenterY = (prevY <= currTileY && ghost.y >= currTileY) || (prevY >= currTileY && ghost.y <= currTileY);

  if (crossedCenterX && crossedCenterY) {
    ghost.gridX = Math.max(0, Math.min(GRID_WIDTH - 1, currTileX));
    ghost.gridY = Math.max(0, Math.min(GRID_HEIGHT - 1, currTileY));

    // Choose next turn direction at intersection
    const nextDir = chooseNextGhostDirection(ghost, mapData, difficulty);
    ghost.dir = nextDir;
  }

  // Fallback collision check: If ghost is blocked directly ahead by a wall, immediately turn!
  if (!canGhostMove(ghost.x, ghost.y, ghost.dir, mapData, ghost.state === 'EATEN')) {
    ghost.x = currTileX;
    ghost.y = currTileY;
    ghost.gridX = currTileX;
    ghost.gridY = currTileY;
    ghost.dir = chooseNextGhostDirection(ghost, mapData, difficulty);
  }
}

function canGhostMove(
  x: number, 
  y: number, 
  dir: Direction, 
  mapData: MapData, 
  isEaten = false
): boolean {
  let nx = Math.round(x);
  let ny = Math.round(y);
  if (dir === 'LEFT') nx -= 1;
  if (dir === 'RIGHT') nx += 1;
  if (dir === 'UP') ny -= 1;
  if (dir === 'DOWN') ny += 1;

  if (nx < 0 || nx >= GRID_WIDTH) return true; // Warp tunnel open
  if (ny < 0 || ny >= GRID_HEIGHT) return false;

  const tile = mapData.grid[ny][nx];
  if (tile === TileType.WALL) return false;
  if (tile === TileType.GHOST_DOOR && !isEaten) return false;
  return true;
}

function chooseNextGhostDirection(
  ghost: Ghost, 
  mapData: MapData, 
  difficulty: GameDifficulty
): Direction {
  const directions: Direction[] = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
  const opposite = OPPOSITE_DIR[ghost.dir];
  const validTurns: Direction[] = [];

  for (const d of directions) {
    // Avoid immediate 180° reverse unless frightened or dead-end
    if (d === opposite && ghost.state !== 'FRIGHTENED' && ghost.state !== 'CONFUSED') {
      continue;
    }

    let nx = ghost.gridX;
    let ny = ghost.gridY;
    if (d === 'UP') ny -= 1;
    if (d === 'DOWN') ny += 1;
    if (d === 'LEFT') nx -= 1;
    if (d === 'RIGHT') nx += 1;

    // Wrap tunnel exits
    if (nx < 0 || nx >= GRID_WIDTH) {
      validTurns.push(d);
      continue;
    }

    if (ny >= 0 && ny < GRID_HEIGHT) {
      const tile = mapData.grid[ny][nx];
      if (tile !== TileType.WALL) {
        if (tile === TileType.GHOST_DOOR && ghost.state !== 'EATEN') {
          continue;
        }
        validTurns.push(d);
      }
    }
  }

  // If dead end, allow reverse turn
  if (validTurns.length === 0) {
    return opposite !== 'NONE' ? opposite : 'LEFT';
  }

  // Easy mode: 20% random wandering
  if (difficulty === 'EASY' && Math.random() < 0.2) {
    return validTurns[Math.floor(Math.random() * validTurns.length)];
  }

  // Frightened / Confused: random evasive turns
  if (ghost.state === 'FRIGHTENED' || ghost.state === 'CONFUSED') {
    return validTurns[Math.floor(Math.random() * validTurns.length)];
  }

  // Shortest Euclidean distance to Target Tile
  let bestDir = validTurns[0];
  let minDistance = Infinity;

  for (const d of validTurns) {
    let nx = ghost.gridX;
    let ny = ghost.gridY;
    if (d === 'UP') ny -= 1;
    if (d === 'DOWN') ny += 1;
    if (d === 'LEFT') nx -= 1;
    if (d === 'RIGHT') nx += 1;

    const dist = Math.hypot(nx - ghost.targetTile.x, ny - ghost.targetTile.y);
    if (dist < minDistance) {
      minDistance = dist;
      bestDir = d;
    }
  }

  return bestDir;
}
