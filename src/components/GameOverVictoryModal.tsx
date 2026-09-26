import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { submitLeaderboardScore } from '../firebase/leaderboardService';
import { Trophy, RefreshCw, Play, Crown, Sparkles, Check, ArrowRight, Zap, Film } from 'lucide-react';

interface GameOverVictoryModalProps {
  type: 'VICTORY' | 'GAMEOVER';
  score: number;
  level: number;
  ghostsEaten: number;
  specialMovesUsed: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
  onOpenLevelSelect: () => void;
  onWatchReplay?: () => void;
}

export const GameOverVictoryModal: React.FC<GameOverVictoryModalProps> = ({
  type,
  score,
  level,
  ghostsEaten,
  specialMovesUsed,
  onNextLevel,
  onRestart,
  onOpenLeaderboard,
  onOpenLevelSelect,
  onWatchReplay,
}) => {
  const { user, profile, updateStats, signInWithGoogle, signInAsGuest } = useAuth();
  const [playerName, setPlayerName] = useState<string>(
    profile?.displayName || user?.displayName || 'Shinobi Master'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmitScore = async () => {
    if (!user) {
      // Auto guest sign in if not authenticated
      await signInAsGuest(playerName);
    }
    setIsSubmitting(true);
    try {
      await submitLeaderboardScore({
        score,
        level,
        playerName: playerName.slice(0, 50),
        avatarUrl: (profile?.photoURL || user?.photoURL) ?? undefined,
        powerMoveUsedMost: 'Kamehameha Wave',
      });
      await updateStats(score, level, ghostsEaten, specialMovesUsed);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting score:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVictory = type === 'VICTORY';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className={`bg-[#0c1029] border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden ${
          isVictory
            ? 'border-cyan-400 shadow-cyan-900/50'
            : 'border-rose-500 shadow-rose-950/60'
        }`}
      >
        {/* Animated Aura Glow backdrop */}
        <div
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isVictory ? 'bg-cyan-500' : 'bg-rose-500'
          }`}
        />

        {/* Icon Header */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-xl ${
            isVictory
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-cyan-500/30'
              : 'bg-rose-500/20 border border-rose-500 text-rose-400 shadow-rose-500/30'
          }`}
        >
          {isVictory ? (
            <Crown className="w-8 h-8 animate-bounce" />
          ) : (
            <Trophy className="w-8 h-8 text-rose-400" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider">
          {isVictory ? 'STAGE COMPLETE!' : 'GAME OVER'}
        </h2>
        <p className="text-xs text-zinc-400 mb-4 font-medium">
          {isVictory
            ? `Demon Yokai cleared from Stage ${level}!`
            : `Fallen in battle on Stage ${level}. Rise again!`}
        </p>

        {/* Stats Breakdown Card */}
        <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 mb-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Total Score</span>
            <span className="font-['Orbitron'] font-black text-base text-amber-400">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Stage Reached</span>
            <span className="font-mono font-bold text-white">Stage {level} / 1001</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Yokai Ghosts Vaporized</span>
            <span className="font-mono font-bold text-cyan-400">{ghostsEaten}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Special Moves Unleashed</span>
            <span className="font-mono font-bold text-purple-400">{specialMovesUsed}</span>
          </div>
        </div>

        {/* High Score Submission Form */}
        <div className="w-full bg-[#101533] border border-cyan-500/30 rounded-xl p-3 mb-5 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-cyan-300 font-['Orbitron'] flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              GLOBAL LEADERBOARD
            </span>
            {isSubmitted && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> SYNCED
              </span>
            )}
          </div>

          {!isSubmitted ? (
            <div className="space-y-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter Shinobi handle..."
                maxLength={30}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSubmitScore}
                disabled={isSubmitting || !playerName.trim()}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs font-['Orbitron'] rounded-lg shadow-md shadow-amber-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SUBMITTING...
                  </>
                ) : (
                  <>
                    <Trophy className="w-3.5 h-3.5" /> POST HIGH SCORE
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-1">
              <p className="text-xs text-emerald-400 font-bold">
                Score successfully recorded to global ranking!
              </p>
              <button
                onClick={onOpenLeaderboard}
                className="text-xs text-cyan-400 underline hover:text-cyan-300 mt-1 block mx-auto"
              >
                View Global Leaderboards
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {onWatchReplay && (
            <button
              onClick={onWatchReplay}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-black text-xs font-['Orbitron'] rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Film className="w-4 h-4 text-cyan-200" />
              <span>WATCH GHOST REPLAY</span>
            </button>
          )}

          <div className="w-full flex gap-2">
            {isVictory ? (
              <button
                onClick={onNextLevel}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:scale-[1.02] text-white font-black text-xs font-['Orbitron'] rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>NEXT STAGE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onRestart}
                className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 hover:scale-[1.02] text-white font-black text-xs font-['Orbitron'] rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RESTART STAGE</span>
              </button>
            )}

            <button
              onClick={onOpenLevelSelect}
              className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              Stages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
