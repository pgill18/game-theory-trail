import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ScorecardEntry } from '../types';

interface CompleteScreenProps {
  totalScore: number;
  scorecard: ScorecardEntry[];
  onReset: () => void;
  onViewAllEncounters: () => void;
  onViewEncounterDetail: (entry: ScorecardEntry) => void;
}

export const CompleteScreen: React.FC<CompleteScreenProps> = ({
  totalScore,
  scorecard,
  onReset,
  onViewAllEncounters,
  onViewEncounterDetail,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">🏆 Trail Complete!</h2>
        <div className="text-6xl font-bold text-yellow-400 mb-2">{totalScore}</div>
        <p className="text-emerald-200 text-lg">Total Points Earned</p>
      </div>

      <div className="bg-white/5 rounded-lg p-6 mb-8 border border-white/20">
        <h3 className="text-white font-bold text-lg mb-4">Final Results</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          {scorecard.map((entry, idx) => (
            <div
              key={idx}
              className="bg-white/5 rounded p-2 text-center hover:bg-white/10 hover:border hover:border-emerald-400 transition-all cursor-pointer"
              onClick={() => onViewEncounterDetail(entry)}
            >
              <div className="text-xs text-emerald-200">{entry.opponent}</div>
              <div className="font-bold text-yellow-400">{entry.score} pts</div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw size={20} />
        Start New Trail
      </button>

      <button
        onClick={onViewAllEncounters}
        className="w-full mt-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold py-3 rounded-lg transition-all text-sm"
      >
        ⚔️ View All Encounters
      </button>
    </div>
  );
};
