import { MapData, TileType, GhostType, MazeTextureStyle } from './types';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAGE_THEME_PALETTES: Array<{
  name: string;
  wallColor: string;
  wallGlow: string;
  dotColor: string;
  accentColor: string;
  textureStyle: MazeTextureStyle;
}> = [
  { name: 'Neo-Tokyo Shinjuku', wallColor: '#00f0ff', wallGlow: 'rgba(0, 240, 255, 0.7)', dotColor: '#fdfa72', accentColor: '#ff0077', textureStyle: 'NEON_GLOW' },
  { name: 'Cherry Blossom Shrine', wallColor: '#ff77a9', wallGlow: 'rgba(255, 119, 169, 0.7)', dotColor: '#ffffff', accentColor: '#ffd700', textureStyle: 'SAKURA_PARCHMENT' },
  { name: 'Demon Mountain Night', wallColor: '#ef4444', wallGlow: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff9999', accentColor: '#7700ff', textureStyle: 'MAGMA_INFERNO' },
  { name: 'Thunder God Citadel', wallColor: '#facc15', wallGlow: 'rgba(250, 204, 21, 0.7)', dotColor: '#00ffff', accentColor: '#ff5500', textureStyle: 'GOLD_LEAF_SHRINE' },
  { name: 'Cosmic Void Sanctuary', wallColor: '#a855f7', wallGlow: 'rgba(168, 85, 247, 0.7)', dotColor: '#38bdf8', accentColor: '#ec4899', textureStyle: 'OBSIDIAN_CRYSTAL' },
  { name: 'Edo Great Wave Shore', wallColor: '#3b82f6', wallGlow: 'rgba(59, 130, 246, 0.7)', dotColor: '#fef08a', accentColor: '#10b981', textureStyle: 'WOODBLOCK_UKIYOE' },
  { name: 'Mecha Cyber Matrix', wallColor: '#10b981', wallGlow: 'rgba(16, 185, 129, 0.7)', dotColor: '#a7f3d0', accentColor: '#06b6d4', textureStyle: 'CARBON_FIBER' },
  { name: 'Inferno Dragon Abyss', wallColor: '#f97316', wallGlow: 'rgba(249, 115, 22, 0.7)', dotColor: '#fed7aa', accentColor: '#ef4444', textureStyle: 'MAGMA_INFERNO' },
  { name: 'Akihabara Gradient Neon', wallColor: '#ec4899', wallGlow: 'rgba(236, 72, 153, 0.7)', dotColor: '#67e8f9', accentColor: '#eab308', textureStyle: 'GRADIENT_CYBER' },
  { name: 'Solar Zenith Palace', wallColor: '#eab308', wallGlow: 'rgba(234, 179, 8, 0.7)', dotColor: '#fffbeb', accentColor: '#f43f5e', textureStyle: 'GOLD_LEAF_SHRINE' },
];

export function generateLevelMap(levelNumber: number, customTextureStyle?: MazeTextureStyle): MapData {
  const level = Math.max(1, Math.min(1001, levelNumber));
  const rng = mulberry32(level * 7919 + 1337);
  const themeIndex = (level - 1) % STAGE_THEME_PALETTES.length;
  const palette = STAGE_THEME_PALETTES[themeIndex];

  const width = GRID_WIDTH;
  const height = GRID_HEIGHT;
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  const grid: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TileType.WALL)
  );

  // Outer rim path
  for (let x = 1; x < width - 1; x++) {
    grid[1][x] = TileType.DOT;
    grid[height - 2][x] = TileType.DOT;
  }
  for (let y = 1; y < height - 1; y++) {
    grid[y][1] = TileType.DOT;
    grid[y][width - 2] = TileType.DOT;
  }

  // Center cross roads
  for (let y = 1; y < height - 1; y++) {
    grid[y][midX] = TileType.DOT;
  }
  for (let x = 1; x < width - 1; x++) {
    grid[5][x] = TileType.DOT;
    grid[height - 6][x] = TileType.DOT;
    grid[midY + 4][x] = TileType.DOT;
  }

  // Procedural structure archetypes based on level
  const archetype = Math.floor(rng() * 5);

  if (archetype === 0) {
    // Quad-Hub Diamond Matrix
    for (let y = 3; y < height - 3; y += 2) {
      for (let x = 3; x < midX; x += 2) {
        if (rng() > 0.3) {
          grid[y][x] = TileType.DOT;
          if (x + 1 < midX) grid[y][x + 1] = TileType.DOT;
        }
      }
    }
  } else if (archetype === 1) {
    // Concentric Ring Loops
    for (let x = 3; x <= 7; x++) {
      grid[3][x] = TileType.DOT;
      grid[8][x] = TileType.DOT;
      grid[height - 4][x] = TileType.DOT;
      grid[height - 9][x] = TileType.DOT;
    }
    for (let y = 3; y <= 8; y++) {
      grid[y][3] = TileType.DOT;
      grid[y][7] = TileType.DOT;
    }
  } else if (archetype === 2) {
    // S-Curve Double Aisle
    for (let y = 3; y <= height - 4; y++) {
      if (y % 4 === 0) {
        for (let x = 2; x < midX; x++) grid[y][x] = TileType.DOT;
      }
    }
  } else if (archetype === 3) {
    // Colosseum Diagonal Hubs
    for (let i = 0; i < 4; i++) {
      if (3 + i < midX) grid[3 + i][3 + i] = TileType.DOT;
      if (height - 4 - i > midY) grid[height - 4 - i][3 + i] = TileType.DOT;
    }
  } else {
    // Open Grand Pagoda Courtyard
    for (let y = 3; y < 7; y++) {
      for (let x = 3; x < 7; x++) {
        grid[y][x] = TileType.DOT;
      }
    }
    for (let y = height - 8; y < height - 4; y++) {
      for (let x = 3; x < 7; x++) {
        grid[y][x] = TileType.DOT;
      }
    }
  }

  // Ghost House Construction (Fixed Center)
  const penStartX = midX - 3;
  const penEndX = midX + 3;
  const penStartY = midY - 2;
  const penEndY = midY + 1;

  for (let x = penStartX - 1; x <= penEndX + 1; x++) {
    grid[penStartY - 1][x] = TileType.DOT;
    grid[penEndY + 1][x] = TileType.DOT;
  }
  for (let y = penStartY - 1; y <= penEndY + 1; y++) {
    grid[y][penStartX - 1] = TileType.DOT;
    grid[y][penEndX + 1] = TileType.DOT;
  }

  for (let y = penStartY; y <= penEndY; y++) {
    for (let x = penStartX; x <= penEndX; x++) {
      if (y === penStartY || y === penEndY || x === penStartX || x === penEndX) {
        grid[y][x] = TileType.WALL;
      } else {
        grid[y][x] = TileType.GHOST_PEN;
      }
    }
  }
  grid[penStartY][midX] = TileType.GHOST_DOOR;

  // Warp Tunnels
  grid[midY][0] = TileType.WARP_TUNNEL;
  grid[midY][1] = TileType.DOT;
  grid[midY][2] = TileType.DOT;
  grid[midY][width - 3] = TileType.DOT;
  grid[midY][width - 2] = TileType.DOT;
  grid[midY][width - 1] = TileType.WARP_TUNNEL;

  // Mirror left to right
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < midX; x++) {
      const mirrorX = width - 1 - x;
      if (
        !(y >= penStartY && y <= penEndY && mirrorX >= penStartX && mirrorX <= penEndX) &&
        mirrorX !== 0 &&
        mirrorX !== width - 1
      ) {
        grid[y][mirrorX] = grid[y][x];
      }
    }
  }

  // Outer border walls
  for (let x = 0; x < width; x++) {
    grid[0][x] = TileType.WALL;
    grid[height - 1][x] = TileType.WALL;
  }
  for (let y = 0; y < height; y++) {
    if (y !== midY) {
      grid[y][0] = TileType.WALL;
      grid[y][width - 1] = TileType.WALL;
    }
  }

  // Power Orbs
  grid[2][2] = TileType.POWER_ORB;
  grid[2][width - 3] = TileType.POWER_ORB;
  grid[height - 3][2] = TileType.POWER_ORB;
  grid[height - 3][width - 3] = TileType.POWER_ORB;

  const playerStartY = height - 5;
  const playerStartX = midX;
  grid[playerStartY][playerStartX] = TileType.EMPTY;

  const ghostSpawns: Record<GhostType, { x: number; y: number }> = {
    AKUMA: { x: midX, y: penStartY - 1 },
    KITSUNE: { x: midX - 1, y: midY },
    RAIDEN: { x: midX, y: midY },
    KAGE: { x: midX + 1, y: midY },
  };

  let totalDots = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === TileType.DOT || grid[y][x] === TileType.POWER_ORB) {
        totalDots++;
      }
    }
  }

  return {
    level,
    name: `STAGE ${level}: ${palette.name.toUpperCase()}`,
    themeId: `theme_${themeIndex}`,
    width,
    height,
    grid,
    totalDots,
    remainingDots: totalDots,
    playerStart: { x: playerStartX, y: playerStartY },
    ghostSpawns,
    ghostPenDoor: { x: midX, y: penStartY },
    warpTunnels: {
      left: { x: 0, y: midY },
      right: { x: width - 1, y: midY },
    },
    bonusSpawn: { x: midX, y: penEndY + 2 },
    wallColor: palette.wallColor,
    wallGlow: palette.wallGlow,
    dotColor: palette.dotColor,
    accentColor: palette.accentColor,
    textureStyle: customTextureStyle || palette.textureStyle,
  };
}
