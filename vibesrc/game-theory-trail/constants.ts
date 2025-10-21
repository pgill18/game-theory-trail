import { PayoffMatrix, StrategyMap, RoundHistory } from './types';

// Version tracking - Axelrod's First Tournament Edition
export const VERSION = '3.1.0';

// Game configuration - matching Axelrod's original tournament
export const MAX_ROUNDS = 200;

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
      // Round 1: Cooperate
      if (history.length === 0) return 'C';

      // Rounds 2-3: Play Tit for Tat with one exception
      if (history.length < 3) {
        // Exception: If round 1 was (C,D) and round 2 was (D,C), defect on round 3
        if (history.length === 2) {
          const first = history[0];
          const second = history[1];
          if (first.player === 'C' && first.opponent === 'D' &&
              second.player === 'D' && second.opponent === 'C') {
            return 'D';
          }
        }
        // Otherwise TFT: copy opponent's last move
        return history[history.length - 1].opponent;
      }

      // After round 3: Use Nydegger formula on last 3 moves
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
      // Cooperate for first 10 moves
      if (history.length < 10) return 'C';

      // After round 10, play Grudger: defect if opponent ever defected
      return history.some((m) => m.opponent === 'D') ? 'D' : 'C';
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

      const lastMove = history[history.length - 1].opponent;

      // Always defect after opponent defects
      if (lastMove === 'D') return 'D';

      // If opponent cooperated, gradually decrease cooperation probability
      // Start at 1.0, decrease to 0.5 by round 200
      const round = history.length + 1;
      const cooperationProbability = Math.max(0.5, 1.0 - (0.5 * round / 200));

      return Math.random() < cooperationProbability ? 'C' : 'D';
    },
  },

  // Joss
  joss: {
    name: 'Joss',
    icon: '🎰',
    getMove: (history: RoundHistory[]) => {
      if (history.length === 0) return 'C';

      // Play Tit for Tat, but occasionally defect when should cooperate
      const tftMove = history[history.length - 1].opponent;

      if (tftMove === 'C') {
        // TFT would cooperate, but Joss defects 10% of the time
        return Math.random() < 0.9 ? 'C' : 'D';
      } else {
        // TFT would defect, so Joss always defects
        return 'D';
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
