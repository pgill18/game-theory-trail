import React from 'react';
import { ScorecardEntry } from '../types';

interface ScorecardProps {
  scorecard: ScorecardEntry[];
  onViewEncounter: (entry: ScorecardEntry) => void;
}

export const Scorecard: React.FC<ScorecardProps> = ({
  scorecard,
  onViewEncounter,
}) => {
  if (scorecard.length === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 max-w-3xl mx-auto">
      <h3 className="text-white font-bold mb-4">📊 Trail Progress</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scorecard.map((entry, idx) => (
          <div
            key={idx}
            className="bg-white/5 rounded p-3 border border-white/10 hover:border-emerald-400 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => onViewEncounter(entry)}
          >
            <div className="text-xs text-emerald-200">
              Platform {entry.platform}
            </div>
            <div className="text-sm font-semibold text-white">
              {entry.opponent}
            </div>
            <div className="text-lg font-bold text-yellow-400">{entry.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
