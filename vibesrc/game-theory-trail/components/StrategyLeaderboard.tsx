import React from 'react';
import { X } from 'lucide-react';
import { StrategyKey } from '../types';
import { STRATEGIES } from '../constants';

interface StrategyLeaderboardProps {
  npcLeaderboard: Record<string, number>;
  playerStrategy: StrategyKey | null;
  expanded: boolean;
  onToggle: () => void;
}

export const StrategyLeaderboard: React.FC<StrategyLeaderboardProps> = ({
  npcLeaderboard,
  playerStrategy,
  expanded,
  onToggle,
}) => {
  const sortedEntries = Object.entries(npcLeaderboard).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="fixed top-4 right-4 z-40">
      <div
        className={`bg-gradient-to-br from-slate-900 via-yellow-900 to-amber-900 rounded-lg border border-white/20 transition-all cursor-pointer ${
          expanded ? 'w-80' : 'w-20'
        }`}
        onClick={onToggle}
      >
        <div className="p-4">
          {expanded ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">📊 Strategy LB</h2>
                <button className="text-yellow-200 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    .strategy-scroll::-webkit-scrollbar {
                      width: 8px;
                    }
                    .strategy-scroll::-webkit-scrollbar-track {
                      background: rgba(251, 191, 36, 0.1);
                      border-radius: 4px;
                    }
                    .strategy-scroll::-webkit-scrollbar-thumb {
                      background: #fbbf24;
                      border-radius: 4px;
                    }
                    .strategy-scroll::-webkit-scrollbar-thumb:hover {
                      background: #f59e0b;
                    }
                  `,
                }}
              />

              <div
                className="strategy-scroll max-h-80 overflow-y-auto space-y-2 pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#fbbf24 rgba(251, 191, 36, 0.1)',
                }}
              >
                {sortedEntries.length === 0 ? (
                  <p className="text-yellow-200 text-center py-4 text-sm">
                    Play to see scores!
                  </p>
                ) : (
                  sortedEntries.map(([strategyName, score], idx) => {
                    const isUserStrategy =
                      playerStrategy && STRATEGIES[playerStrategy].name === strategyName;
                    return (
                      <div
                        key={strategyName}
                        className="bg-white/10 rounded p-2 border border-white/10 hover:border-yellow-400 transition-all"
                      >
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className="text-lg text-yellow-400 w-6 text-center">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                            </div>
                            <div className="font-semibold text-white">
                              {strategyName.length > 12
                                ? strategyName.substring(0, 12) + '...'
                                : strategyName}{' '}
                              {isUserStrategy && '👤'}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-yellow-400">
                            {score}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-xs text-yellow-200 font-semibold">LB</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
