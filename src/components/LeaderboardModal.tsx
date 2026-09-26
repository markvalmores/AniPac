import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, subscribeToLeaderboard } from '../firebase/leaderboardService';
import { useAuth } from '../firebase/AuthContext';
import { Trophy, Medal, Flame, Zap, Crown, User as UserIcon, X, RefreshCw } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const unsubscribe = subscribeToLeaderboard(50, (newEntries) => {
      setEntries(newEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredEntries = entries.filter((e) =>
    e.playerName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0c1029] border border-amber-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-amber-900/40 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#080b1d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-['Orbitron'] tracking-wider flex items-center gap-2">
                <span>GLOBAL ANIPAC HALL OF FAME</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                  REAL-TIME SYNC
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Top Shinobi Masters across 1001 procedural neon stages
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

        {/* Filter / Search Bar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-3">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search shinobi player handle..."
            className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
          <span className="text-xs font-semibold text-zinc-400">
            {filteredEntries.length} Ranked Players
          </span>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-semibold font-['Orbitron']">
                FETCHING CLOUD HIGH SCORES...
              </span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 space-y-2">
              <Crown className="w-10 h-10 text-amber-500/40 mx-auto" />
              <p className="text-sm font-bold text-zinc-300 font-['Orbitron']">
                NO RECORDS FOUND YET
              </p>
              <p className="text-xs text-zinc-500">
                Be the first Shinobi to conquer the stages and claim the #1 spot!
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => {
              const isCurrentUser = user && user.uid === entry.userId;
              const rank = index + 1;

              // Top 3 special styling
              let rankBadge = (
                <span className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-400">
                  #{rank}
                </span>
              );

              if (rank === 1) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-black shadow-[0_0_8px_#f59e0b]">
                    <Crown className="w-4 h-4" />
                  </div>
                );
              } else if (rank === 2) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-lg bg-slate-300/20 border border-slate-300 flex items-center justify-center text-slate-200 font-black">
                    <Medal className="w-4 h-4" />
                  </div>
                );
              } else if (rank === 3) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-600 flex items-center justify-center text-amber-500 font-black">
                    <Medal className="w-4 h-4" />
                  </div>
                );
              }

              return (
                <div
                  key={entry.id || index}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrentUser
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-md shadow-amber-900/30'
                      : rank <= 3
                      ? 'bg-[#121838] border-cyan-500/30'
                      : 'bg-[#0e1329] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Left: Rank & Avatar & Name */}
                  <div className="flex items-center gap-3">
                    {rankBadge}
                    <img
                      src={entry.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.userId}`}
                      alt={entry.playerName}
                      className="w-8 h-8 rounded-lg bg-zinc-800 border border-cyan-500/30 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-white font-['Rajdhani']">
                          {entry.playerName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-black px-1 rounded bg-amber-500 text-black">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span>STAGE {entry.level}</span>
                        <span>•</span>
                        <span className="text-cyan-400 truncate max-w-[90px] sm:max-w-none">
                          {entry.powerMoveUsedMost || 'Special Moves'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-black text-amber-400 font-['Orbitron'] tracking-wider">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-zinc-500 font-medium">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#080b1d] flex items-center justify-between text-xs text-zinc-400">
          <span>Synced with Firebase Real-Time Firestore</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg text-xs"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
