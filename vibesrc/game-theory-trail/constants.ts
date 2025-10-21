import { PayoffMatrix, StrategyMap, RoundHistory } from './types';

// Version tracking - Axelrod's First Tournament Edition
export const VERSION = '3.0.0';

// Game configuration
export const MAX_ROUNDS = 10;

// Payoff matrix for prisoner's dilemma
export const PAYOFF_MATRIX: PayoffMatrix = {
  CC: { player: 3, opponent: 3 },
  CD: { player: 0, opponent: 5 },
  DC: { player: 5, opponent: 0 },
  DD: { player: 1, opponent: 1 },
};

// Strategy implementations - Axelrod's First Tournament (1980)
// Based on "Effective Choice in the Prisoner's Dilemma" by Robert Axelrod
export const STRATEGIES: StrategyMap = {
  // 1st Place - Anatol Rapoport
  titForTat: {
    name: 'Tit For Tat',
    icon: '🪞',
    getMove: (history: RoundHistory[]) =>
      history.length === 0 ? 'C' : history[history.length - 1].opponent,
  },

  // 2nd Place - Tideman and Chieruzzi
  tidemanAndChieruzzi: {
    name: 'Tideman and Chieruzzi',
    icon: '⚖️',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';

      // Start with Tit for Tat, but add escalating punishment
      const last = history[history.length - 1];

      // Count defection runs by opponent
      let defectionRuns = 0;
      let inRun = false;
      for (const round of history) {
        if (round.opponent === 'D' && !inRun) {
          defectionRuns++;
          inRun = true;
        } else if (round.opponent === 'C') {
          inRun = false;
        }
      }

      // After second defection run, escalate punishment
      if (defectionRuns >= 2) {
        // Count how many rounds to punish
        const punishmentRounds = defectionRuns - 1;
        const recentDefections = history.slice(-punishmentRounds).filter(h => h.player === 'D').length;
        if (recentDefections < punishmentRounds) {
          return 'D'; // Still punishing
        }
      }

      // Otherwise play Tit for Tat
      return last.opponent;
    },
  },

  // 3rd Place - Nydegger
  nydegger: {
    name: 'Nydegger',
    icon: '🔢',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';
      if (history.length === 1) {
        // If only one cooperated on first move and only one defected on second, defect on third
        return history[0].player === 'C' && history[0].opponent === 'D' ? 'D' : history[0].opponent;
      }
      if (history.length === 2) {
        const first = history[0];
        const second = history[1];
        if (first.player === 'C' && first.opponent === 'D' &&
            second.player === 'D' && second.opponent === 'C') {
          return 'D';
        }
        return second.opponent;
      }

      // Use Nydegger formula for last 3 moves
      const last3 = history.slice(-3);
      let A = 0;
      const weights = [16, 4, 1];

      for (let i = 0; i < 3; i++) {
        const round = last3[i];
        let a_i = 0;
        if (round.player === 'D' && round.opponent === 'D') a_i = 3;
        else if (round.player === 'C' && round.opponent === 'D') a_i = 2;
        else if (round.player === 'D' && round.opponent === 'C') a_i = 1;
        // CC = 0

        A += weights[i] * a_i;
      }

      // Defect if A is in this specific set
      const defectSet = [1, 6, 7, 17, 22, 23, 26, 29, 30, 31, 33, 38, 39, 45, 49, 54, 55, 58, 61];
      return defectSet.includes(A) ? 'D' : 'C';
    },
  },

  // 4th Place - Grofman
  grofman: {
    name: 'Grofman',
    icon: '🎯',
    getMove: (history: RoundHistory[]) => {
      // Cooperate on first two moves
      if (history.length < 2) return 'C';

      // Mirror opponent for next 5 moves (rounds 2-6)
      if (history.length < 7) {
        return history[history.length - 1].opponent;
      }

      // After that, cooperate if both did same thing last round
      const last = history[history.length - 1];
      if (last.player === last.opponent) {
        return 'C';
      }

      // Otherwise cooperate with probability 2/7
      return Math.random() < 2/7 ? 'C' : 'D';
    },
  },

  // 5th Place - Shubik
  shubik: {
    name: 'Shubik',
    icon: '📈',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';

      // Cooperate until opponent defects
      const firstDefection = history.findIndex(h => h.opponent === 'D');
      if (firstDefection === -1) return 'C';

      // Count defection runs
      let defectionRuns = 0;
      let inRun = false;
      for (const round of history) {
        if (round.opponent === 'D' && !inRun) {
          defectionRuns++;
          inRun = true;
        } else if (round.opponent === 'C') {
          inRun = false;
        }
      }

      // Retaliate with increasing length
      const retaliationLength = defectionRuns;

      // Simple approximation: defect N times after Nth defection run
      const recentPlayerDefections = history.slice(-retaliationLength).filter(h => h.player === 'D').length;
      if (recentPlayerDefections < retaliationLength && history[history.length - 1].opponent === 'D') {
        return 'D';
      }

      return 'C';
    },
  },

  // Stein and Rapoport
  steinAndRapoport: {
    name: 'Stein and Rapoport',
    icon: '🧪',
    getMove: (history: RoundHistory[]) => {
      // Cooperate on first 4 moves
      if (history.length < 4) return 'C';

      // Defect on last 2 moves (if playing a long game)
      if (history.length >= MAX_ROUNDS - 2) return 'D';

      // Every 15 moves, check if opponent is random using simplified chi-squared test
      if (history.length % 15 === 0 && history.length >= 15) {
        const last15 = history.slice(-15);
        const opponentCoops = last15.filter(h => h.opponent === 'C').length;
        // If close to 50/50, assume random and defect
        if (opponentCoops >= 6 && opponentCoops <= 9) {
          return 'D';
        }
      }

      // Otherwise play Tit for Tat
      return history[history.length - 1].opponent;
    },
  },

  // Grudger (Friedman)
  grudger: {
    name: 'Grudger',
    icon: '😠',
    getMove: (history: RoundHistory[]) =>
      history.some((m) => m.opponent === 'D') ? 'D' : 'C',
  },

  // Davis
  davis: {
    name: 'Davis',
    icon: '🎓',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';

      // Cooperate for first 10 moves
      if (history.length < 10) return 'C';

      // Then play based on opponent's pattern
      const last10 = history.slice(-10);
      const opponentDefections = last10.filter(h => h.opponent === 'D').length;

      // If opponent defected more than 5 times in last 10, defect
      if (opponentDefections > 5) return 'D';

      // Otherwise cooperate
      return 'C';
    },
  },

  // Graaskamp
  graaskamp: {
    name: 'Graaskamp',
    icon: '🔬',
    getMove: (history: RoundHistory[]) => {
      // Play Tit for Tat for first 50 moves
      if (history.length < 50) {
        return history.length === 0 ? 'C' : history[history.length - 1].opponent;
      }

      // Defect on move 51
      if (history.length === 50) return 'D';

      // Continue with Tit for Tat for 5 more moves
      if (history.length < 56) {
        return history[history.length - 1].opponent;
      }

      // Check if opponent seems random
      const last50 = history.slice(-50);
      const opponentCoops = last50.filter(h => h.opponent === 'C').length;
      if (opponentCoops >= 20 && opponentCoops <= 30) {
        return 'D'; // Seems random, defect
      }

      // Check if opponent is Tit for Tat or similar
      const mirrorMatches = history.slice(-20).filter((h, i) => {
        if (i === 0) return true;
        return h.opponent === history[history.length - 20 + i - 1].player;
      }).length;

      if (mirrorMatches >= 18) {
        return history[history.length - 1].opponent; // Play Tit for Tat
      }

      // Otherwise randomly defect every 5-15 moves
      return Math.random() < 0.1 ? 'D' : history[history.length - 1].opponent;
    },
  },

  // Downing (First by Downing)
  downing: {
    name: 'Downing',
    icon: '🧮',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';
      if (history.length === 1) return 'C';

      // Track opponent's response patterns
      // If opponent mostly cooperates after we defect, exploit them
      const myDefections = history.filter(h => h.player === 'D');
      if (myDefections.length > 0) {
        const cooperationsAfterMyDefection = myDefections.filter((h) => {
          const index = history.indexOf(h);
          return index < history.length - 1 && history[index + 1].opponent === 'C';
        }).length;

        // If opponent cooperates > 60% after we defect, defect more
        if (cooperationsAfterMyDefection / myDefections.length > 0.6) {
          return 'D';
        }
      }

      // Otherwise play Tit for Tat
      return history[history.length - 1].opponent;
    },
  },

  // Feld
  feld: {
    name: 'Feld',
    icon: '⚡',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';

      // Start with Tit for Tat
      // But weight recent history more heavily
      const windowSize = Math.min(10, history.length);
      const recentHistory = history.slice(-windowSize);

      const opponentCoops = recentHistory.filter(h => h.opponent === 'C').length;
      const cooperationRate = opponentCoops / recentHistory.length;

      // Mirror opponent's cooperation rate with slight optimism
      return Math.random() < cooperationRate + 0.1 ? 'C' : 'D';
    },
  },

  // Joss
  joss: {
    name: 'Joss',
    icon: '🎰',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';

      // Play Tit for Tat, but cooperate only 90% of the time
      const tftMove = history[history.length - 1].opponent;

      if (tftMove === 'C') {
        return 'C';
      } else {
        // Should defect, but cooperate 10% of the time instead
        return Math.random() < 0.9 ? 'D' : 'C';
      }
    },
  },

  // Tullock
  tullock: {
    name: 'Tullock',
    icon: '📉',
    getMove: (history: RoundHistory[]) => {
      // Cooperate on first 11 moves
      if (history.length < 11) return 'C';

      // Then cooperate 10% less than opponent did in last 10 moves
      const last10 = history.slice(-10);
      const opponentCoops = last10.filter(h => h.opponent === 'C').length;
      const opponentCoopRate = opponentCoops / 10;
      const myCoopRate = Math.max(0, opponentCoopRate - 0.1);

      return Math.random() < myCoopRate ? 'C' : 'D';
    },
  },

  // Random
  random: {
    name: 'Random',
    icon: '🎲',
    getMove: () => (Math.random() < 0.5 ? 'C' : 'D'),
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
