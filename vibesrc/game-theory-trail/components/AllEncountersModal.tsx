import React from 'react';
import { X } from 'lucide-react';
import { GlobalEncounter } from '../types';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ScaleIn } from './ScaleIn';

interface AllEncountersModalProps {
  encounters: GlobalEncounter[];
  onClose: () => void;
  onViewEncounter: (encounter: GlobalEncounter) => void;
}

export const AllEncountersModal: React.FC<AllEncountersModalProps> = ({
  encounters,
  onClose,
  onViewEncounter,
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
      aria-labelledby="encounters-modal-title"
    >
      <ScaleIn>
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-lg border border-white/20 max-w-lg w-full max-h-96 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/20">
          <div className="flex justify-between items-center">
            <h2 id="encounters-modal-title" className="text-2xl font-bold text-white">⚔️ All Encounters</h2>
            <button onClick={onClose} className="text-purple-200 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {encounters.length === 0 ? (
            <p className="text-purple-200 text-center py-8">
              Play encounters to see battle history!
            </p>
          ) : (
            <div className="space-y-3">
              {[...encounters].reverse().map((entry, idx) => {
                const isUserEncounter = 'isUserEncounter' in entry && entry.isUserEncounter;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg p-4 border transition-all cursor-pointer ${
                      isUserEncounter
                        ? 'bg-green-500/20 border-green-400 hover:border-green-300'
                        : 'bg-white/10 border-white/20 hover:border-purple-400'
                    }`}
                    onClick={() => onViewEncounter(entry)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-purple-200">
                        {entry.timestamp} {isUserEncounter && '👤 USER'}
                      </div>
                      <div className="text-sm font-semibold text-yellow-400">
                        {entry.winner === 'Tie' ? '🤝 ' : '🥇 '}
                        {entry.winner}
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1 bg-white/5 rounded p-2">
                        <div className="text-xs text-purple-200">
                          {isUserEncounter ? entry.player : entry.npc1}
                        </div>
                        <div className="text-lg font-bold text-yellow-400">
                          {isUserEncounter ? entry.playerScore : entry.npc1Score}
                        </div>
                      </div>
                      <div className="text-white font-bold">vs</div>
                      <div className="flex-1 bg-white/5 rounded p-2 text-right">
                        <div className="text-xs text-purple-200">
                          {isUserEncounter ? entry.opponent : entry.npc2}
                        </div>
                        <div className="text-lg font-bold text-blue-400">
                          {isUserEncounter ? entry.opponentScore : entry.npc2Score}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </ScaleIn>
    </div>
  );
};
