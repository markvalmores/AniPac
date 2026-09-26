export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

export type GameDifficulty = 'EASY' | 'NORMAL' | 'HARD' | 'GHOSTLY' | 'HUNTER';

export type RenderPerspective = '2D_NEON' | '2_5D_ISO' | '3D_MATRIX';

export type ScreenDisplayMode = 'STANDARD' | 'FILL_SCREEN' | 'FULLSCREEN';

export interface GhostReplayGhostFrame {
  id: GhostType;
  x: number;
  y: number;
  dir: Direction;
  state: GhostState;
}

export interface GhostReplayFrame {
  t: number; // time in ms
  px: number;
  py: number;
  pDir: Direction;
  pAngle: number;
  mouthAngle: number;
  score: number;
  ki: number;
  combo: number;
  lives: number;
  activePower: ShonenPowerType | null;
  powerRemaining: number;
  isFever?: boolean;
  feverRemaining?: number;
  ghosts: GhostReplayGhostFrame[];
  event?: 'POWER_TRIGGER' | 'GHOST_EATEN' | 'ORB_CHOMP' | 'BONUS_EATEN' | 'LIFE_LOST' | 'STAGE_CLEAR' | 'FEVER_START';
  eventText?: string;
  eventColor?: string;
}

export interface GhostReplayData {
  replayId: string;
  userId: string;
  playerName: string;
  avatarUrl?: string;
  level: number;
  score: number;
  duration: number; // seconds
  difficulty: GameDifficulty;
  equippedSkin: string;
  equippedGhostSkin: string;
  equippedMazeSkin: string;
  totalDots: number;
  ghostsEaten: number;
  specialMovesUsed: number;
  replayData: string; // JSON encoded GhostReplayFrame[]
  createdAt: string;
}

export type MazeTextureStyle = 
  | 'NEON_GLOW'
  | 'GRADIENT_CYBER'
  | 'WOODBLOCK_UKIYOE'
  | 'GOLD_LEAF_SHRINE'
  | 'OBSIDIAN_CRYSTAL'
  | 'MAGMA_INFERNO'
  | 'SAKURA_PARCHMENT'
  | 'CARBON_FIBER';

export enum TileType {
  EMPTY = 0,
  WALL = 1,
  DOT = 2,
  POWER_ORB = 3,
  GHOST_PEN = 4,
  GHOST_DOOR = 5,
  WARP_TUNNEL = 6,
  BONUS_ITEM = 7,
}

// 36+ Shonen Power-Ups
export type ShonenPowerType = 
  | 'SUPER_SAIYAN'         // Dragon Ball
  | 'KAMEHAMEHA'           // Dragon Ball
  | 'DOMAIN_EXPANSION'     // Jujutsu Kaisen
  | 'BANKAI_SLASH'         // Bleach
  | 'RASENGAN_VACUUM'      // Naruto
  | 'GEAR_5_BOUNCE'        // One Piece
  | 'AMATERASU_FLAME'      // Naruto (Black flames incinerate dots & ghosts)
  | 'STAR_PLATINUM_TIME'   // JoJo (Time stop for 4s)
  | 'DETROIT_SMASH'        // MHA (Air shockwave clears row/column)
  | 'SPIRIT_GUN'           // Yu Yu Hakusho (Ki bullet piercing corridors)
  | 'SERIOUS_PUNCH'        // One Punch Man (Vast shockwave)
  | 'WATER_BREATHING_DRAGON' // Demon Slayer (Water dragon collects dots along trail)
  | 'UNLIMITED_BLADES'     // Fate (Swords rain down on ghosts)
  | 'DEATH_NOTE_MARK'      // Death Note (Instantly vanquishes furthest ghost)
  | 'GUM_GUM_GATLING'      // One Piece (Rapid fist barrage)
  | 'SHADOW_CLONE_JUTSU'   // Naruto (Spawns 2 mini shadow clones collecting dots)
  | 'FULL_COWL_DASH'       // MHA (Lightning green dash with wall bounce)
  | 'DRAGON_ROAR_BREATH'   // Fairy Tail (Fiery breath cone)
  | 'CHIDORI_LIGHTNING'    // Naruto (Electrified corridor traps)
  | 'ALCHEMIST_TRANSMUTE'  // FMA (Transmutes nearby walls into golden dots)
  | 'GIGA_DRILL_BREAK'     // Gurren Lagann (Drills straight through maze walls)
  | 'SPIRIT_BOMB'          // Dragon Ball (Massive slow orb absorbing dots & ghosts)
  | 'TITAN_ROAR_FEAR'      // AOT (Paralyzes all ghosts in terror)
  | 'HOLLOW_MASK_RAGE'     // Bleach (Hyper speed & 3x combo score multiplier)
  | 'ULTRA_INSTINCT'       // Dragon Ball (Auto-evades ghost collisions for 5s)
  | 'CONQUERORS_HAKI'      // One Piece (Knocks out all ghosts on screen back to pen)
  | 'TSUKUYOMI_ILLUSION'   // Naruto (Confuses ghosts causing them to spin in circles)
  | 'ICE_AGE_FREEZE'       // One Piece (Freezes entire maze and ghosts in ice)
  | 'FINAL_FLASH'          // Dragon Ball (Colossal wide screen-clearing beam)
  | 'SHADOW_MONARCH_ARISE' // Solo Leveling (Extracted ghosts become allied dot gatherers)
  | 'ROOM_SHAMBLES'        // One Piece (Swaps player position with furthest ghost)
  | 'SOLAR_FLARE_BLIND'    // Dragon Ball (Blinds all ghosts causing random wandering)
  | 'HEAVENLY_RESTRICTION' // JJK (Zero Ki cost speed boost and ghost stomper)
  | 'SUPER_TENGEN_TOPPA'   // Gurren Lagann (Cosmic giant form with galaxy aura)
  | 'NINE_TAILS_CLOAK'     // Naruto (Fiery chakra tails sweeping dots in radius)
  | 'THUNDER_CLAP_FLASH';  // Demon Slayer (Speed of sound lightning blitz)

export interface ShonenMoveInfo {
  id: ShonenPowerType;
  name: string;
  japaneseName: string;
  animeSource: string;
  description: string;
  kiCost: number;
  cooldown: number;
  duration: number;
  icon: string;
  color: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  soundKey: string;
  hotkey?: string;
}

export interface PlayerSkinItem {
  id: string;
  name: string;
  animeSource: string;
  color: string;
  auraColor: string;
  headgear: 'none' | 'headband' | 'straw_hat' | 'super_hair' | 'hollow_mask' | 'blindfold' | 'tanjiro_earrings' | 'flame_crown' | 'titan_eyes' | 'monarch_shadow';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  previewIcon: string;
}

export interface GhostSkinItem {
  id: string;
  name: string;
  animeSource: string;
  akumaColor: string;
  kitsuneColor: string;
  raidenColor: string;
  kageColor: string;
  pattern: 'standard' | 'akatsuki_clouds' | 'espada_white' | 'demon_slayer_haori' | 'cyber_mecha' | 'retro_pixel' | 'shinigami_robes';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  previewIcon: string;
}

export interface MazeSkinItem {
  id: string;
  name: string;
  style: MazeTextureStyle;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  dotColor: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface GachaItem {
  id: string;
  name: string;
  type: 'PAC_SKIN' | 'GHOST_SKIN' | 'MAZE_SKIN' | 'POWER_MOVE' | 'BG_THEME';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  data: any;
  icon: string;
  source: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: 'DOTS' | 'GHOSTS' | 'POWERS' | 'STAGES' | 'SCORE' | 'DIFFICULTY';
  targetCount: number;
  currentProgress: number;
  rewardCoins: number;
  rewardKiBoost?: number;
  rewardMultiplierBoost?: number;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  dir: Direction;
  nextDir: Direction;
  speed: number;
  lives: number;
  score: number;
  ki: number;
  comboMultiplier: number;
  activePower: ShonenPowerType | null;
  powerTimeRemaining: number;
  isInvulnerable: boolean;
  isFeverMode: boolean;
  feverTimer: number; // 7.0 seconds
  feverPelletCounter: number; // 0 to 100
  angle: number;
  mouthAngle: number;
  mouthSpeed: number;
  ghostsEatenInPower: number;
  ghostChainCount: number;
  ghostChainTimer: number;
  characterSkin: string;
  equippedSkinData?: PlayerSkinItem;
  equippedGhostSkinData?: GhostSkinItem;
}

export type GhostType = 'AKUMA' | 'KITSUNE' | 'RAIDEN' | 'KAGE';

export type GhostState = 'CHASE' | 'SCATTER' | 'FRIGHTENED' | 'EATEN' | 'FROZEN' | 'BLINDED' | 'CONFUSED';

export interface Ghost {
  id: GhostType;
  name: string;
  title: string;
  color: string;
  glowColor: string;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  dir: Direction;
  nextDir?: Direction;
  speed: number;
  baseSpeed: number;
  state: GhostState;
  frightenedTimer: number;
  homeCorner: { x: number; y: number };
  penExitDelay: number;
  isInPen: boolean;
  targetTile: { x: number; y: number };
  pulse: number;
  tacticalRole: 'HUNTER' | 'AMBUSHER' | 'PINCER' | 'PATROLLER';
  thought?: string;
}

export interface ShadowClone {
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  dir: Direction;
  speed: number;
  life: number;
}

export interface BonusItem {
  name: string;
  japanese: string;
  icon: string;
  points: number;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  duration: number;
  active: boolean;
}

export interface MapData {
  level: number;
  name: string;
  themeId: string;
  width: number;
  height: number;
  grid: TileType[][];
  totalDots: number;
  remainingDots: number;
  playerStart: { x: number; y: number };
  ghostSpawns: { [key in GhostType]: { x: number; y: number } };
  ghostPenDoor: { x: number; y: number };
  warpTunnels: { left: { x: number; y: number }; right: { x: number; y: number } };
  bonusSpawn: { x: number; y: number };
  wallColor: string;
  wallGlow: string;
  dotColor: string;
  accentColor: string;
  textureStyle: MazeTextureStyle;
}

export interface BackgroundTheme {
  id: string;
  name: string;
  description: string;
  category: 'neon' | 'cyberpunk' | 'scenic' | 'cosmic' | 'minimal' | 'gacha';
  gifUrl?: string;
  bgGradient: string;
  wallColor: string;
  wallGlow: string;
  dotGlow: string;
  overlayOpacity: number;
  particles: 'sakura' | 'cyber_rain' | 'embers' | 'stardust' | 'neon_lines' | 'lightning' | 'none';
  thumbnailUrl?: string;
}

export interface AnimeGifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  category: string;
}

export interface FloatingCombatText {
  id: string;
  text: string;
  subtext?: string;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'petal' | 'spark' | 'ring' | 'lightning' | 'blade' | 'flame';
  rotation?: number;
  rotSpeed?: number;
}

export interface KamehamehaBeam {
  active: boolean;
  startX: number;
  startY: number;
  dir: Direction;
  length: number;
  width: number;
  timer: number;
  maxTimer: number;
  color?: string;
}
