import { PayoffMatrix, StrategyMap, RoundHistory } from './types';

// Game configuration
export const MAX_ROUNDS = 10;

// Payoff matrix for prisoner's dilemma
export const PAYOFF_MATRIX: PayoffMatrix = {
  CC: { player: 3, opponent: 3 },
  CD: { player: 0, opponent: 5 },
  DC: { player: 5, opponent: 0 },
  DD: { player: 1, opponent: 1 },
};

// Strategy implementations
export const STRATEGIES: StrategyMap = {
  random: {
    name: 'Random',
    icon: '🎲',
    getMove: () => (Math.random() < 0.5 ? 'C' : 'D'),
  },
  alwaysCooperate: {
    name: 'Always Cooperate',
    icon: '😊',
    getMove: () => 'C',
  },
  alwaysDefect: {
    name: 'Always Defect',
    icon: '😈',
    getMove: () => 'D',
  },
  titForTat: {
    name: 'Tit-for-Tat',
    icon: '🪞',
    getMove: (history: RoundHistory[]) =>
      history.length === 0 ? 'C' : history[history.length - 1].opponent,
  },
  titForTwoTats: {
    name: 'Tit-for-Two-Tats',
    icon: '⏰',
    getMove: (history: RoundHistory[]) =>
      history.length < 2
        ? 'C'
        : history.slice(-2).every((m) => m.opponent === 'D')
        ? 'D'
        : 'C',
  },
  generousTFT: {
    name: 'Generous Tit-for-Tat',
    icon: '💝',
    getMove: (history: RoundHistory[]) =>
      history.length === 0
        ? 'C'
        : history[history.length - 1].opponent === 'D' && Math.random() < 0.1
        ? 'C'
        : history[history.length - 1].opponent,
  },
  grudger: {
    name: 'Grudger',
    icon: '😠',
    getMove: (history: RoundHistory[]) =>
      history.some((m) => m.opponent === 'D') ? 'D' : 'C',
  },
  suspicious: {
    name: 'Suspicious',
    icon: '👀',
    getMove: (history: RoundHistory[]) =>
      history.length === 0 ? 'D' : history[history.length - 1].opponent,
  },
  pavlov: {
    name: 'Pavlov',
    icon: '🐕',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';
      const last = history[history.length - 1];
      return last.player === last.opponent
        ? last.player
        : last.player === 'C'
        ? 'D'
        : 'C';
    },
  },
  majority: {
    name: 'Majority',
    icon: '📊',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';
      const opponentMoves = history.map((m) => m.opponent);
      const cooperations = opponentMoves.filter((m) => m === 'C').length;
      const defections = opponentMoves.filter((m) => m === 'D').length;
      return cooperations >= defections ? 'C' : 'D';
    },
  },
};

// SVG configuration
export const SVG_CONFIG = {
  width: 1000,
  height: 600,
  baseRadius: 28,
  minGap: 20,
  totalPlatforms: 25,
  startY: 78, // Start position (13% of height)
};
