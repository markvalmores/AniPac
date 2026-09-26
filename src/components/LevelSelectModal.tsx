import React, { useState, useEffect } from 'react';
import { TOTAL_LEVELS } from '../game/constants';
import { generateLevelMap } from '../game/mapGenerator';
import { X, Layers, Play, Search, Zap, Shield, Flame, Film, Ghost as GhostIcon } from 'lucide-react';
import { getAllLocalReplays } from '../firebase/replayService';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  onSelectLevel: (lvl: number) => void;
  maxUnlockedLevel?: number;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onSelectLevel,
  maxUnlockedLevel = 1001,
}) => {
  const [targetLevelInput, setTargetLevelInput] = useState<string>('');
  const [page, setPage] = useState<number>(Math.floor((currentLevel - 1) / 50));
  const [savedReplayLevels, setSavedReplayLevels] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      const replays = getAllLocalReplays();
      setSavedReplayLevels(replays.map((r) => r.level));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pageSize = 50;
  const totalPages = Math.ceil(TOTAL_LEVELS / pageSize);
  const startLvl = page * pageSize + 1;
  const endLvl = Math.min(TOTAL_LEVELS, (page + 1) * pageSize);

  const levelsOnPage = Array.from({ length: endLvl - startLvl + 1 }, (_, i) => startLvl + i);

  const handleDirectJump = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(targetLevelInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= TOTAL_LEVELS) {
      onSelectLevel(parsed);
      onClose();
    }
  };

  const getRankTitle = (lvl: number) => {
    if (lvl < 20) return { title: 'Genin Academy', color: 'text-cyan-400' };
    if (lvl < 100) return { title: 'Chunin Warrior', color: 'text-emerald-400' };
    if (lvl < 300) return { title: 'Jonin Shinobi', color: 'text-amber-400' };
    if (lvl < 700) return { title: 'Kage Master', color: 'text-rose-400' };
    return { title: 'Cosmic Shonen Deity', color: 'text-purple-400' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0c1029] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-900/40 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#080b1d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-['Orbitron'] tracking-wider">
                1001 PROCEDURAL NEON STAGES
              </h2>
              <p className="text-xs text-zinc-400">
                Deterministic symmetrical arcade mazes with dynamic synth escalations
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

        {/* Quick Jump & Search Bar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 flex flex-wrap items-center justify-between gap-3">
          {/* Direct jump form */}
          <form onSubmit={handleDirectJump} className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={TOTAL_LEVELS}
              value={targetLevelInput}
              onChange={(e) => setTargetLevelInput(e.target.value)}
              placeholder="Stage (1 - 1001)..."
              className="w-36 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl font-['Orbitron']"
            >
              WARP
            </button>
          </form>

          {/* Page Range Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {[0, 1, 2, 5, 10, 15, 20].map((pIdx) => (
              <button
                key={pIdx}
                onClick={() => setPage(pIdx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  page === pIdx
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {pIdx * 50 + 1}-{Math.min(TOTAL_LEVELS, (pIdx + 1) * 50)}
              </button>
            ))}
          </div>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {levelsOnPage.map((lvl) => {
              const isCurrent = currentLevel === lvl;
              const hasReplay = savedReplayLevels.includes(lvl);
              const mapInfo = generateLevelMap(lvl);
              const rank = getRankTitle(lvl);

              return (
                <button
                  key={lvl}
                  onClick={() => {
                    onSelectLevel(lvl);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border flex flex-col justify-between text-left transition-all group relative overflow-hidden cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/30 scale-[1.02]'
                      : 'bg-[#0e1329] border-zinc-800 hover:border-zinc-600 hover:bg-[#131a38]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black font-['Orbitron'] text-white flex items-center gap-1">
                      #{lvl}
                      {hasReplay && (
                        <span className="text-[8px] bg-sky-950 text-sky-300 border border-sky-500/40 px-1 py-0.2 rounded font-bold" title="Ghost Replay Saved">
                          👻 REPLAY
                        </span>
                      )}
                    </span>
                    <div
                      className="w-3 h-3 rounded-full border border-white/50"
                      style={{ backgroundColor: mapInfo.wallColor }}
                    />
                  </div>

                  <div className="my-2">
                    <div className="text-[11px] font-bold text-zinc-200 truncate font-['Rajdhani']">
                      {mapInfo.name.split(':')[1]?.trim() || `Stage ${lvl}`}
                    </div>
                    <div className={`text-[9px] font-semibold ${rank.color}`}>
                      {rank.title}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 w-full text-[9px] text-zinc-400">
                    <span>{mapInfo.totalDots} Dots</span>
                    <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      PLAY <Play className="w-2.5 h-2.5 fill-current" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#080b1d] flex items-center justify-between text-xs text-zinc-400">
          <span>
            Page {page + 1} of {totalPages} (Showing Stages {startLvl} - {endLvl})
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold disabled:opacity-30 text-white"
            >
              PREV
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold disabled:opacity-30 text-white"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
