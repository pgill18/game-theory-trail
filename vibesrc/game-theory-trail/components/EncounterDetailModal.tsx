import React from 'react';
import { X } from 'lucide-react';
import { ScorecardEntry } from '../types';
import { PAYOFF_MATRIX } from '../constants';
import { getMoveEmoji } from '../utils';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ScaleIn } from './ScaleIn';

interface EncounterDetailModalProps {
  encounter: ScorecardEntry;
  onClose: () => void;
}

export const EncounterDetailModal: React.FC<EncounterDetailModalProps> = ({
  encounter,
  onClose,
}) => {
  useKeyboardNavigation({
    enabled: true,
    onEscape: onClose,
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="encounter-modal-title"
    >
      <ScaleIn>
        <div className="bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 rounded-lg border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h2 id="encounter-modal-title" className="text-2xl font-bold text-white">
                Platform {encounter.platform}
              </h2>
              <p className="text-emerald-200">
                {encounter.playerStrategy} vs {encounter.opponent}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-emerald-200 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="text-center">
              <div className="text-sm font-bold text-white mb-1">Your Score</div>
              <div className="text-4xl font-bold text-yellow-400">
                {encounter.score}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white mb-1">
                Opponent Score
              </div>
              <div className="text-4xl font-bold text-blue-400">
                {encounter.opponentScore}
              </div>
            </div>
          </div>

          <div className="text-2xl font-bold text-white mb-4 text-center">
            {encounter.score > encounter.opponentScore
              ? '🎉 You Won!'
              : encounter.score === encounter.opponentScore
              ? '🤝 Tie!'
              : '😢 You Lost'}
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-bold mb-3">Round by Round:</h3>
            {encounter.history.map((round, idx) => {
              const key = (round.player + round.opponent) as keyof typeof PAYOFF_MATRIX;
              const payoff = PAYOFF_MATRIX[key];
              return (
                <div
                  key={idx}
                  className="bg-white/5 rounded-lg p-3 border border-white/20"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-emerald-200">Round {idx + 1}</div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl">{getMoveEmoji(round.player)}</div>
                        <div className="text-xs text-yellow-400 font-bold">
                          +{payoff.player}
                        </div>
                      </div>
                      <div className="text-white font-bold">vs</div>
                      <div className="text-center">
                        <div className="text-2xl">{getMoveEmoji(round.opponent)}</div>
                        <div className="text-xs text-blue-400 font-bold">
                          +{payoff.opponent}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </ScaleIn>
    </div>
  );
};
