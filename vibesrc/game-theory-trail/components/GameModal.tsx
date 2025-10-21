import React from 'react';
import { X } from 'lucide-react';
import { Move, ModalState, StrategyKey, RoundHistory } from '../types';
import { STRATEGIES, MAX_ROUNDS } from '../constants';
import { getMoveEmoji } from '../utils';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ScaleIn } from './ScaleIn';

interface GameModalProps {
  platformIndex: number;
  opponentStrategy: StrategyKey;
  modalState: ModalState;
  history: RoundHistory[];
  playerScore: number;
  opponentScore: number;
  lastRoundResult: {
    player: Move;
    opponent: Move;
    playerPoints: number;
    opponentPoints: number;
  } | null;
  autoPlaying: boolean;
  onPlayRound: (move: Move) => void;
  onAutoPlay: () => void;
  onComplete: () => void;
  onClose: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  platformIndex,
  opponentStrategy,
  modalState,
  history,
  playerScore,
  opponentScore,
  lastRoundResult,
  autoPlaying,
  onPlayRound,
  onAutoPlay,
  onComplete,
  onClose,
}) => {
  const opponent = STRATEGIES[opponentStrategy];

  // Keyboard navigation: C for cooperate, D for defect, Escape to close
  useKeyboardNavigation({
    enabled: modalState === 'playing' && !autoPlaying,
    onEscape: onClose,
    onEnter: modalState === 'platformComplete' ? onComplete : undefined,
  });

  // Additional key handling for C/D
  React.useEffect(() => {
    if (modalState !== 'playing' || autoPlaying) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        onPlayRound('C');
      } else if (e.key.toLowerCase() === 'd') {
        onPlayRound('D');
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [modalState, autoPlaying, onPlayRound]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-modal-title"
    >
      <ScaleIn>
        <div className="bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 rounded-lg border border-white/20 max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 id="game-modal-title" className="text-2xl font-bold text-white">
                Platform {platformIndex + 1}
              </h2>
              <p className="text-emerald-200">
                vs {opponent.name} {opponent.icon}
              </p>
            </div>
            <button onClick={onClose} className="text-emerald-200 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {modalState === 'playing' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <div className="text-sm text-emerald-200">You</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {playerScore}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-emerald-200">Opponent</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {opponentScore}
                  </div>
                </div>
              </div>

              <div className="mb-4 text-center text-white">
                <p>
                  Round {history.length + 1} of {MAX_ROUNDS}
                </p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(history.length / MAX_ROUNDS) * 100}%` }}
                  />
                </div>
              </div>

              {lastRoundResult && (
                <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/20">
                  <p className="text-white text-center">
                    <span className="text-2xl">
                      {getMoveEmoji(lastRoundResult.player)}
                    </span>
                    <span className="text-white mx-2">vs</span>
                    <span className="text-2xl">
                      {getMoveEmoji(lastRoundResult.opponent)}
                    </span>
                  </p>
                  <p className="text-emerald-200 text-center text-xs mt-1">
                    +{lastRoundResult.playerPoints} vs +{lastRoundResult.opponentPoints}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => onPlayRound('C')}
                  disabled={autoPlaying}
                  className="bg-green-500/30 hover:bg-green-500/50 border-2 border-green-400 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                  aria-label="Cooperate (Press C)"
                  title="Cooperate (Press C)"
                >
                  🤝
                </button>
                <button
                  onClick={() => onPlayRound('D')}
                  disabled={autoPlaying}
                  className="bg-red-500/30 hover:bg-red-500/50 border-2 border-red-400 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                  aria-label="Defect (Press D)"
                  title="Defect (Press D)"
                >
                  ⚔️
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onClose}
                  disabled={autoPlaying}
                  className="bg-gray-500/30 hover:bg-gray-500/50 border border-gray-400 text-white font-semibold py-2 rounded text-sm transition-all disabled:opacity-50"
                >
                  Exit
                </button>
                <button
                  onClick={onAutoPlay}
                  disabled={autoPlaying}
                  className="bg-purple-500/30 hover:bg-purple-500/50 border border-purple-400 text-white font-semibold py-2 rounded text-sm transition-all disabled:opacity-50"
                >
                  ⚡ Auto
                </button>
              </div>
            </>
          )}

          {modalState === 'platformComplete' && (
            <div className="text-center">
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <div className="text-sm font-bold text-white mb-1">
                    Your Score
                  </div>
                  <div className="text-4xl font-bold text-yellow-400">
                    {playerScore}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white mb-1">Opponent</div>
                  <div className="text-4xl font-bold text-blue-400">
                    {opponentScore}
                  </div>
                </div>
              </div>

              <div className="text-2xl font-bold text-white mb-6">
                {playerScore > opponentScore
                  ? '🎉 You Won!'
                  : playerScore === opponentScore
                  ? '🤝 Tie!'
                  : '😢 You Lost'}
              </div>

              <button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all"
              >
                Continue Trail →
              </button>
            </div>
          )}
        </div>
      </div>
      </ScaleIn>
    </div>
  );
};
