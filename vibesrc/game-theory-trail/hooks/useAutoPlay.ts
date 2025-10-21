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
  delay?: number; // Delay in ms between rounds (default 300, use 0 for instant)
}

export function useAutoPlay({
  playerStrategy,
  opponentStrategy,
  history,
  playerScore,
  opponentScore,
  onUpdateState,
  onSetAutoPlaying,
  delay = 300,
}: UseAutoPlayParams) {
  const autoPlay = useCallback(async () => {
    if (!playerStrategy) return;

    onSetAutoPlaying(true);
    let currentHistory = history;
    let currentPlayerScore = playerScore;
    let currentOpponentScore = opponentScore;

    for (let i = history.length; i < MAX_ROUNDS; i++) {
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

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
    delay,
  ]);

  return { autoPlay };
}
