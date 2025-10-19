import { useCallback } from 'react';
import { StrategyKey, RoundHistory } from '../types';
import { STRATEGIES, MAX_ROUNDS } from '../constants';
import { playRound } from '../gameEngine';

interface UseAutoPlayParams {
  playerStrategy: StrategyKey | null;
  opponentStrategy: StrategyKey;
  history: RoundHistory[];
  playerScore: number;
  opponentScore: number;
  onUpdateState: (state: {
    history: RoundHistory[];
    playerScore: number;
    opponentScore: number;
    lastRoundResult: {
      player: 'C' | 'D';
      opponent: 'C' | 'D';
      playerPoints: number;
      opponentPoints: number;
    };
  }) => void;
  onSetAutoPlaying: (playing: boolean) => void;
}

export function useAutoPlay({
  playerStrategy,
  opponentStrategy,
  history,
  playerScore,
  opponentScore,
  onUpdateState,
  onSetAutoPlaying,
}: UseAutoPlayParams) {
  const autoPlay = useCallback(async () => {
    if (!playerStrategy) return;

    onSetAutoPlaying(true);
    let currentHistory = history;
    let currentPlayerScore = playerScore;
    let currentOpponentScore = opponentScore;

    for (let i = history.length; i < MAX_ROUNDS; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const playerStrategyFunc = STRATEGIES[playerStrategy];
      const playerMove = playerStrategyFunc.getMove(currentHistory);

      const { newHistory, payoff, roundResult } = playRound(
        playerMove,
        opponentStrategy,
        currentHistory
      );

      currentHistory = newHistory;
      currentPlayerScore += payoff.player;
      currentOpponentScore += payoff.opponent;

      onUpdateState({
        history: currentHistory,
        playerScore: currentPlayerScore,
        opponentScore: currentOpponentScore,
        lastRoundResult: roundResult,
      });
    }

    onSetAutoPlaying(false);
  }, [
    playerStrategy,
    opponentStrategy,
    history,
    playerScore,
    opponentScore,
    onUpdateState,
    onSetAutoPlaying,
  ]);

  return { autoPlay };
}
