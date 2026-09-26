import React from 'react';
import { DailyMission } from '../game/types';
import { useAuth } from '../firebase/AuthContext';
import { X, Calendar, Check, Gift, Zap, Trophy, Flame, Sparkles } from 'lucide-react';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({ isOpen, onClose }) => {
  const { dailyMissions, claimDailyMissionReward, profile } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0c1029] border border-amber-500/40 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl shadow-amber-900/40 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#080b1d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-['Orbitron'] tracking-wider">
                  DAILY SHINOBI MISSIONS
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                  RESET 00:00 UTC
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Complete daily challenges to earn Pac-Coins, Ki boosts & score multipliers
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

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {dailyMissions.map((mission) => {
            const pct = Math.min(100, Math.floor((mission.currentProgress / mission.targetCount) * 100));

            return (
              <div
                key={mission.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                  mission.claimed
                    ? 'bg-zinc-950/60 border-zinc-800/80 opacity-60'
                    : mission.completed
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-md shadow-amber-900/20'
                    : 'bg-[#101633] border-zinc-800/90'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white font-['Rajdhani']">
                        {mission.title}
                      </span>
                      {mission.rewardMultiplierBoost && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                          +1x MULTIPLIER
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5">{mission.description}</p>
                  </div>

                  {/* Reward Badge */}
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    <span className="text-xs">🪙</span>
                    <span className="text-xs font-black text-amber-400 font-['Orbitron']">
                      +{mission.rewardCoins}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Claim Button */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-800/80">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                      <span>Progress</span>
                      <span>
                        {mission.currentProgress} / {mission.targetCount} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-[1px]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          mission.completed
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    {mission.claimed ? (
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 text-[11px] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> CLAIMED
                      </span>
                    ) : mission.completed ? (
                      <button
                        onClick={() => claimDailyMissionReward(mission.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs font-['Orbitron'] shadow-md shadow-amber-500/30 flex items-center gap-1 cursor-pointer animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" /> CLAIM
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-zinc-500 px-2 py-1">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#080b1d] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1 text-amber-300 font-bold">
            <span>Your Balance:</span>
            <span className="font-['Orbitron'] text-amber-400 font-black">
              🪙 {profile?.pacCoins || 0} Pac-Coins
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-xs"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
