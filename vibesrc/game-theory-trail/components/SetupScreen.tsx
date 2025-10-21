import React from 'react';
import { StrategyKey } from '../types';
import { STRATEGIES } from '../constants';

interface SetupScreenProps {
  playerStrategy: StrategyKey | null;
  platformCount: number;
  onSelectStrategy: (strategy: StrategyKey) => void;
  onSetPlatformCount: (count: number) => void;
  onStartTrail: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  playerStrategy,
  platformCount,
  onSelectStrategy,
  onSetPlatformCount,
  onStartTrail,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Welcome to the Trail
      </h2>

      <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/20">
        <p className="text-emerald-200 mb-3">
          Hike through platforms, each with a different opponent strategy. Choose
          one strategy and see how far it takes you!
        </p>
        <p className="text-emerald-200 text-sm flex items-center flex-wrap gap-1">
          Trail has{' '}
          <select
            value={platformCount}
            onChange={(e) => onSetPlatformCount(Number(e.target.value))}
            className="bg-white/5 text-white font-bold px-3 py-1 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all cursor-pointer mx-1"
          >
            <option value={13}>13</option>
            <option value={14}>14</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
          </select>{' '}
          platforms, each platform has 10 rounds of prisoner's dilemma
        </p>
      </div>

      <div className="mb-6">
        <label className="text-white block font-bold mb-4">
          Select Your Strategy:
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(STRATEGIES) as StrategyKey[]).map((key) => {
            const strategy = STRATEGIES[key];
            return (
              <button
                key={key}
                onClick={() => onSelectStrategy(key)}
                className={`p-3 rounded-lg border-2 transition-all text-left text-sm ${
                  playerStrategy === key
                    ? 'bg-emerald-500/30 border-emerald-400'
                    : 'bg-white/5 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="font-bold text-white">
                  {strategy.icon} {strategy.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onStartTrail}
        disabled={!playerStrategy}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
      >
        Start Hiking 🔥
      </button>
    </div>
  );
};
