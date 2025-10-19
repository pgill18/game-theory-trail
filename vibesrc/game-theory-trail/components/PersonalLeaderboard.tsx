import React from 'react';
import { X } from 'lucide-react';
import { PersonalLeaderboardEntry } from '../types';

interface PersonalLeaderboardProps {
  entries: PersonalLeaderboardEntry[];
  expanded: boolean;
  onToggle: () => void;
}

export const PersonalLeaderboard: React.FC<PersonalLeaderboardProps> = ({
  entries,
  expanded,
  onToggle,
}) => {
  return (
    <div className="fixed top-4 left-4 z-40">
      <div
        className={`bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 rounded-lg border border-white/20 transition-all cursor-pointer ${
          expanded ? 'w-80' : 'w-20'
        }`}
        onClick={onToggle}
      >
        <div className="p-4">
          {expanded ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">👤 Personal LB</h2>
                <button className="text-emerald-200 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    .personal-scroll::-webkit-scrollbar {
                      width: 8px;
                    }
                    .personal-scroll::-webkit-scrollbar-track {
                      background: rgba(16, 185, 129, 0.1);
                      border-radius: 4px;
                    }
                    .personal-scroll::-webkit-scrollbar-thumb {
                      background: #10b981;
                      border-radius: 4px;
                    }
                    .personal-scroll::-webkit-scrollbar-thumb:hover {
                      background: #059669;
                    }
                  `,
                }}
              />

              <div
                className="personal-scroll max-h-80 overflow-y-auto space-y-2 pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#10b981 rgba(16, 185, 129, 0.1)',
                }}
              >
                {entries.length === 0 ? (
                  <p className="text-emerald-200 text-center py-4 text-sm">
                    Complete all platforms to record your score!
                  </p>
                ) : (
                  entries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 rounded p-2 border border-white/10 hover:border-emerald-400 transition-all"
                    >
                      <div className="flex justify-between items-start text-sm">
                        <div className="flex items-center gap-2">
                          <div className="text-lg text-yellow-400 w-6 text-center">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {entry.strategy}
                            </div>
                            <div className="text-xs text-emerald-200">
                              {entry.timestamp}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-400">
                            {entry.score}
                          </div>
                          <div className="text-xs text-emerald-200">
                            {entry.platformsCompleted}p
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-1">👤</div>
              <div className="text-xs text-emerald-200 font-semibold">LB</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
