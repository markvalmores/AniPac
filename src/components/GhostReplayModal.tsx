import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Trophy, 
  X, 
  Film, 
  Zap, 
  Clock, 
  Flame, 
  Ghost as GhostIcon, 
  Sparkles,
  ChevronRight,
  Eye,
  Trash2,
  Share2,
  Maximize2
} from 'lucide-react';
import { GhostReplayData, GhostReplayFrame, TileType, RenderPerspective } from '../game/types';
import { BASE_TILE_SIZE, GRID_HEIGHT, GRID_WIDTH, GACHA_PAC_SKINS, GACHA_GHOST_SKINS, GACHA_MAZE_SKINS } from '../game/constants';
import { generateLevelMap } from '../game/mapGenerator';
import { fetchAllUserReplays, deleteGhostReplay } from '../firebase/replayService';
import { useAuth } from '../firebase/AuthContext';

interface GhostReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLevel?: number;
}

export const GhostReplayModal: React.FC<GhostReplayModalProps> = ({
  isOpen,
  onClose,
  initialLevel,
}) => {
  const { user } = useAuth();
  const [replays, setReplays] = useState<GhostReplayData[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<GhostReplayData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [showGhostTrail, setShowGhostTrail] = useState<boolean>(true);

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parsedFramesRef = useRef<GhostReplayFrame[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const mapDataRef = useRef<any>(null);
  const trailPointsRef = useRef<{ x: number; y: number; alpha: number }[]>([]);

  // Load replays
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const uid = user ? user.uid : 'guest_player';
    fetchAllUserReplays(uid).then((list) => {
      setReplays(list);
      if (list.length > 0) {
        const found = initialLevel ? list.find((r) => r.level === initialLevel) : list[0];
        setSelectedReplay(found || list[0]);
      } else {
        setSelectedReplay(null);
      }
      setLoading(false);
    });
  }, [isOpen, user, initialLevel]);

  // When selected replay changes, parse frames and generate map
  useEffect(() => {
    if (!selectedReplay) {
      parsedFramesRef.current = [];
      return;
    }

    try {
      const frames: GhostReplayFrame[] = JSON.parse(selectedReplay.replayData);
      parsedFramesRef.current = frames;
      setCurrentTimeMs(0);
      setIsPlaying(true);
      trailPointsRef.current = [];

      // Generate map for this level & skin
      const mazeSkin = GACHA_MAZE_SKINS.find((m) => m.id === selectedReplay.equippedMazeSkin);
      mapDataRef.current = generateLevelMap(selectedReplay.level, mazeSkin?.style);
    } catch (err) {
      console.error('Error parsing replay frames:', err);
    }
  }, [selectedReplay]);

  // Main playback loop
  useEffect(() => {
    if (!isOpen || !selectedReplay || parsedFramesRef.current.length === 0) return;

    let isRunning = true;
    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      if (!isRunning) return;
      const dt = Math.min(0.1, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      if (isPlaying) {
        setCurrentTimeMs((prev) => {
          const maxTime = (selectedReplay.duration || 1) * 1000;
          const next = prev + dt * 1000 * playbackSpeed;
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }

      renderReplayFrame();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, selectedReplay, isPlaying, playbackSpeed, showGhostTrail]);

  // Get frame closest to currentTimeMs
  const getCurrentFrame = useCallback((): GhostReplayFrame | null => {
    const frames = parsedFramesRef.current;
    if (frames.length === 0) return null;
    let low = 0;
    let high = frames.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (frames[mid].t <= currentTimeMs) {
        if (mid === frames.length - 1 || frames[mid + 1].t > currentTimeMs) {
          return frames[mid];
        }
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return frames[0];
  }, [currentTimeMs]);

  // Render function for Replay canvas
  const renderReplayFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = getCurrentFrame();
    const map = mapDataRef.current;
    if (!map || !frame) return;

    const width = GRID_WIDTH * BASE_TILE_SIZE;
    const height = GRID_HEIGHT * BASE_TILE_SIZE;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Maze Walls
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = map.wallColor;
    ctx.shadowColor = map.wallGlow;
    ctx.shadowBlur = 8;

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const tile = map.grid[y][x];
        const px = x * BASE_TILE_SIZE;
        const py = y * BASE_TILE_SIZE;

        if (tile === TileType.WALL) {
          ctx.fillStyle = '#090d1f';
          ctx.fillRect(px + 1, py + 1, BASE_TILE_SIZE - 2, BASE_TILE_SIZE - 2);
          ctx.strokeRect(px + 2, py + 2, BASE_TILE_SIZE - 4, BASE_TILE_SIZE - 4);
        } else if (tile === TileType.GHOST_DOOR) {
          ctx.fillStyle = '#F472B6';
          ctx.fillRect(px, py + BASE_TILE_SIZE / 2 - 2, BASE_TILE_SIZE, 4);
        } else if (tile === TileType.DOT) {
          ctx.fillStyle = map.dotColor;
          ctx.shadowColor = map.dotColor;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(px + BASE_TILE_SIZE / 2, py + BASE_TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === TileType.POWER_ORB) {
          ctx.fillStyle = '#FACC15';
          ctx.shadowColor = '#FBBF24';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(px + BASE_TILE_SIZE / 2, py + BASE_TILE_SIZE / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Ghost Trail Points
    if (showGhostTrail) {
      const ppx = frame.px * BASE_TILE_SIZE + 12;
      const ppy = frame.py * BASE_TILE_SIZE + 12;
      trailPointsRef.current.push({ x: ppx, y: ppy, alpha: 0.8 });
      if (trailPointsRef.current.length > 25) trailPointsRef.current.shift();

      trailPointsRef.current.forEach((pt, i) => {
        ctx.save();
        const a = (i / trailPointsRef.current.length) * 0.45;
        ctx.globalAlpha = a;
        ctx.fillStyle = '#06B6D4';
        ctx.shadowColor = '#06B6D4';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4 + (i / trailPointsRef.current.length) * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // 3. Draw Ghosts from recorded frame
    frame.ghosts.forEach((g) => {
      const gx = g.x * BASE_TILE_SIZE + 12;
      const gy = g.y * BASE_TILE_SIZE + 12;

      ctx.save();
      const ghostSkin = GACHA_GHOST_SKINS.find((s) => s.id === selectedReplay?.equippedGhostSkin) || GACHA_GHOST_SKINS[0];
      let gColor = g.id === 'AKUMA' ? ghostSkin.akumaColor : g.id === 'KITSUNE' ? ghostSkin.kitsuneColor : g.id === 'RAIDEN' ? ghostSkin.raidenColor : ghostSkin.kageColor;
      
      if (g.state === 'FRIGHTENED') gColor = '#38BDF8';
      if (g.state === 'FROZEN') gColor = '#818CF8';
      if (g.state === 'EATEN') gColor = 'rgba(255,255,255,0.4)';

      ctx.fillStyle = gColor;
      ctx.shadowColor = gColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(gx, gy - 2, 8, Math.PI, 0, false);
      ctx.lineTo(gx + 8, gy + 8);
      ctx.lineTo(gx - 8, gy + 8);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(gx - 3, gy - 3, 2.5, 0, Math.PI * 2);
      ctx.arc(gx + 3, gy - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#090D1F';
      ctx.beginPath();
      ctx.arc(gx - 3, gy - 3, 1.2, 0, Math.PI * 2);
      ctx.arc(gx + 3, gy - 3, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 4. Draw Ghost Replay Player Avatar (Translucent Holographic Shinobi Ghost)
    const px = frame.px * BASE_TILE_SIZE + 12;
    const py = frame.py * BASE_TILE_SIZE + 12;
    const skin = GACHA_PAC_SKINS.find((s) => s.id === selectedReplay?.equippedSkin) || GACHA_PAC_SKINS[0];

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(frame.pAngle);

    // Holographic Ghost Aura
    ctx.shadowColor = '#06B6D4';
    ctx.shadowBlur = 20;

    // Glowing Ghost Pac Body
    ctx.fillStyle = skin.color;
    ctx.beginPath();
    ctx.arc(0, 0, 10, (frame.mouthAngle || 0.2) * Math.PI, (2 - (frame.mouthAngle || 0.2)) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Replay Ghost Crown Indicator
    ctx.restore();

    ctx.save();
    ctx.font = '900 9px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#0284C7';
    ctx.shadowBlur = 6;
    ctx.fillText('👻 GHOST RUN', px, py - 14);
    ctx.restore();

    // 5. Draw Event Overlay FX if present in this frame
    if (frame.event && frame.eventText) {
      ctx.save();
      ctx.font = '900 16px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = frame.eventColor || '#FACC15';
      ctx.shadowColor = frame.eventColor || '#FACC15';
      ctx.shadowBlur = 15;
      ctx.fillText(frame.eventText, px, py - 24);
      ctx.restore();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTimeMs(val);
    trailPointsRef.current = [];
  };

  const handleDelete = async (rep: GhostReplayData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete ghost replay recording for Stage ${rep.level}?`)) return;
    await deleteGhostReplay(rep.replayId, rep.level);
    const updated = replays.filter((r) => r.replayId !== rep.replayId);
    setReplays(updated);
    if (selectedReplay?.replayId === rep.replayId) {
      setSelectedReplay(updated[0] || null);
    }
  };

  if (!isOpen) return null;

  const currentFrame = getCurrentFrame();
  const totalDuration = (selectedReplay?.duration || 1) * 1000;
  const currentSec = Math.floor(currentTimeMs / 1000);
  const totalSec = Math.floor(totalDuration / 1000);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#090d1f] border border-cyan-500/40 rounded-2xl w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        
        {/* Header */}
        <div className="px-4 py-3 bg-[#0d1430] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 font-['Orbitron'] tracking-wider">
                GHOST REPLAY VAULT
              </h2>
              <p className="text-[11px] text-zinc-400">
                Frame-by-frame recordings of your personal best runs saved to Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: Replay List Sidebar */}
          <div className="w-full md:w-72 bg-[#060916] border-r border-cyan-500/20 flex flex-col h-48 md:h-auto overflow-y-auto">
            <div className="p-3 bg-[#0a1024] border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-['Orbitron']">
                Saved Stage Runs ({replays.length})
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center p-6 text-zinc-500 text-xs">
                Loading saved replays...
              </div>
            ) : replays.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400 gap-2">
                <GhostIcon className="w-8 h-8 text-cyan-500/40 animate-pulse" />
                <p className="text-xs font-semibold">No Ghost Replays Yet</p>
                <p className="text-[11px] text-zinc-500">
                  Complete any level to automatically record and save your best run to Firestore!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60 overflow-y-auto">
                {replays.map((rep) => {
                  const isSel = selectedReplay?.replayId === rep.replayId;
                  return (
                    <div
                      key={rep.replayId}
                      onClick={() => setSelectedReplay(rep)}
                      className={`p-3 cursor-pointer transition-all flex items-center justify-between group ${
                        isSel
                          ? 'bg-cyan-950/60 border-l-4 border-cyan-400 text-white'
                          : 'hover:bg-zinc-900/80 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-['Orbitron'] ${
                          isSel ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-cyan-400'
                        }`}>
                          {rep.level}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <span>Stage {rep.level}</span>
                            <span className="text-[10px] px-1 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                              {rep.difficulty || 'NORMAL'}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span className="text-amber-300 font-bold">{rep.score.toLocaleString()} pts</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-zinc-400">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTime(Math.round(rep.duration))}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDelete(rep, e)}
                          title="Delete replay"
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className={`w-4 h-4 ${isSel ? 'text-cyan-400' : 'text-zinc-600'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Interactive Replay Theater */}
          <div className="flex-1 flex flex-col bg-[#070b1a] overflow-hidden p-3 sm:p-4 gap-3">
            {selectedReplay ? (
              <>
                {/* Replay Telemetry Top Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0d1430] p-2.5 rounded-xl border border-cyan-500/20 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-medium">STAGE & RUNNER</span>
                    <span className="font-bold text-white font-['Orbitron'] truncate">
                      Stage {selectedReplay.level} • {selectedReplay.playerName}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-medium">LIVE REPLAY SCORE</span>
                    <span className="font-black text-amber-300 font-['Orbitron']">
                      {(currentFrame?.score || selectedReplay.score).toLocaleString()} pts
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-medium">GHOSTS EATEN</span>
                    <span className="font-bold text-cyan-300 font-['Orbitron'] flex items-center gap-1">
                      <GhostIcon className="w-3 h-3" />
                      {selectedReplay.ghostsEaten || 0} Yokai
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-medium">ACTIVE MOVE</span>
                    <span className="font-bold text-rose-300 font-['Orbitron'] truncate">
                      {currentFrame?.activePower ? currentFrame.activePower.replace(/_/g, ' ') : 'None'}
                    </span>
                  </div>
                </div>

                {/* Canvas Screen */}
                <div className="flex-1 min-h-[300px] flex items-center justify-center relative bg-[#040610] rounded-xl border border-cyan-500/30 overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={GRID_WIDTH * BASE_TILE_SIZE}
                    height={GRID_HEIGHT * BASE_TILE_SIZE}
                    className="max-h-full max-w-full object-contain block"
                  />

                  {/* Watermark Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center gap-1 font-['Orbitron']">
                    <Film className="w-3 h-3 text-cyan-400" />
                    FIRESTORE GHOST REPLAY
                  </div>

                  {/* Speed Badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm border border-zinc-700 text-[10px] font-bold text-amber-300 font-['Orbitron']">
                    {playbackSpeed}x SPEED
                  </div>
                </div>

                {/* Video Playback Scrubber & Timeline Bar */}
                <div className="flex flex-col gap-2 bg-[#0c1229] p-3 rounded-xl border border-cyan-500/20">
                  {/* Scrubber slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-cyan-400 min-w-[38px]">
                      {formatTime(currentSec)}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={totalDuration}
                      step={50}
                      value={currentTimeMs}
                      onChange={handleSeek}
                      className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                    />
                    <span className="text-xs font-mono text-zinc-400 min-w-[38px]">
                      {formatTime(totalSec)}
                    </span>
                  </div>

                  {/* Playback Controls Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentTimeMs(0);
                          trailPointsRef.current = [];
                          setIsPlaying(true);
                        }}
                        title="Restart Replay"
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTimeMs((t) => Math.max(0, t - 3000));
                          trailPointsRef.current = [];
                        }}
                        title="Rewind 3s"
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Rewind className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsPlaying((v) => !v)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-black font-black text-xs font-['Orbitron'] flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTimeMs((t) => Math.min(totalDuration, t + 3000));
                          trailPointsRef.current = [];
                        }}
                        title="Forward 3s"
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        <FastForward className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800">
                      {[0.5, 1, 1.5, 2, 4].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-2 py-1 rounded text-[11px] font-bold font-['Orbitron'] transition-all cursor-pointer ${
                            playbackSpeed === spd
                              ? 'bg-cyan-500 text-black'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    {/* Trail Effect Toggle */}
                    <button
                      onClick={() => setShowGhostTrail((v) => !v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        showGhostTrail
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ghost Trail {showGhostTrail ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-400">
                <Film className="w-12 h-12 text-cyan-500/30 mb-2" />
                <h3 className="text-sm font-bold text-white mb-1 font-['Orbitron']">
                  SELECT A SAVED RUN
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Play and complete stages in AniPac. Every victory records your inputs and routes straight into your Ghost Vault!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
