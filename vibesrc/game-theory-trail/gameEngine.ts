import {
  Move,
  RoundHistory,
  NPCRoundHistory,
  Payoff,
  StrategyKey,
  NPCEncounter,
  Outcome,
} from './types';
import { PAYOFF_MATRIX, STRATEGIES, MAX_ROUNDS } from './constants';
import { getTimestamp } from './utils';

/**
 * Get payoff for a given combination of moves
 */
export function getPayoff(playerMove: Move, opponentMove: Move): Payoff {
  const key = (playerMove + opponentMove) as keyof typeof PAYOFF_MATRIX;
  return PAYOFF_MATRIX[key];
}

/**
 * Execute a single round of the game
 */
export function playRound(
  playerMove: Move,
  opponentStrategy: StrategyKey,
  history: RoundHistory[]
): {
  newHistory: RoundHistory[];
  payoff: Payoff;
  roundResult: {
    player: Move;
    opponent: Move;
    playerPoints: number;
    opponentPoints: number;
  };
} {
  const strategy = STRATEGIES[opponentStrategy];
  const opponentMove = strategy.getMove(history);
  const payoff = getPayoff(playerMove, opponentMove);

  const newHistory = [...history, { player: playerMove, opponent: opponentMove }];
  const roundResult = {
    player: playerMove,
    opponent: opponentMove,
    playerPoints: payoff.player,
    opponentPoints: payoff.opponent,
  };

  return { newHistory, payoff, roundResult };
}

/**
 * Simulate a complete game between player and opponent
 */
export function simulateGame(
  playerStrategy: StrategyKey,
  opponentStrategy: StrategyKey
): {
  playerScore: number;
  opponentScore: number;
  history: RoundHistory[];
} {
  let playerScore = 0;
  let opponentScore = 0;
  let history: RoundHistory[] = [];

  const playerStrat = STRATEGIES[playerStrategy];
  const opponentStrat = STRATEGIES[opponentStrategy];

  for (let i = 0; i < MAX_ROUNDS; i++) {
    // Get player's move from player's perspective
    const playerMove = playerStrat.getMove(history);

    // Get opponent's move from opponent's perspective (flip history)
    const opponentMove = opponentStrat.getMove(
      history.map(h => ({ player: h.opponent, opponent: h.player }))
    );

    const payoff = getPayoff(playerMove, opponentMove);
    playerScore += payoff.player;
    opponentScore += payoff.opponent;

    history.push({ player: playerMove, opponent: opponentMove });
  }

  return { playerScore, opponentScore, history };
}

/**
 * Simulate an NPC vs NPC encounter
 */
export function simulateNPCEncounter(
  npc1Strategy: StrategyKey,
  npc2Strategy: StrategyKey
): NPCEncounter {
  const npc1Strat = STRATEGIES[npc1Strategy];
  const npc2Strat = STRATEGIES[npc2Strategy];

  let npc1Score = 0;
  let npc2Score = 0;
  let history: NPCRoundHistory[] = [];

  for (let i = 0; i < MAX_ROUNDS; i++) {
    const npc1Move = npc1Strat.getMove(
      history.map((h) => ({ player: h.npc1, opponent: h.npc2 }))
    );
    const npc2Move = npc2Strat.getMove(
      history.map((h) => ({ player: h.npc2, opponent: h.npc1 }))
    );

    const payoff = getPayoff(npc1Move, npc2Move);
    npc1Score += payoff.player;
    npc2Score += payoff.opponent;

    history.push({ npc1: npc1Move, npc2: npc2Move });
  }

  const npc1Name = npc1Strat.name;
  const npc2Name = npc2Strat.name;

  return {
    npc1: npc1Name,
    npc2: npc2Name,
    npc1Score,
    npc2Score,
    winner:
      npc1Score > npc2Score ? npc1Name : npc2Score > npc1Score ? npc2Name : 'Tie',
    timestamp: getTimestamp(),
    history,
  };
}

/**
 * Determine outcome from scores
 */
export function determineOutcome(
  playerScore: number,
  opponentScore: number
): Outcome {
  if (playerScore > opponentScore) return 'win';
  if (playerScore < opponentScore) return 'loss';
  return 'tie';
}

/**
 * Generate NPC encounters to balance the leaderboard
 * Ensures all NPCs have equal number of encounters
 */
export function generateBalancedNPCEncounters(
  encounterCounts: Record<string, number>,
  targetEncounters: number,
  strategyKeys: StrategyKey[],
  excludeStrategyName?: string // Exclude player's strategy from NPC encounters
): NPCEncounter[] {
  const newEncounters: NPCEncounter[] = [];
  const usedPairs = new Set<string>();

  // Get list of NPCs that need more encounters (excluding player's strategy)
  let npcsThatNeed = Object.entries(encounterCounts)
    .filter(([name, count]) => count < targetEncounters && name !== excludeStrategyName)
    .map(([name]) => name);

  while (npcsThatNeed.length > 0) {
    const npc1Name = npcsThatNeed[0];

    // Find second NPC
    let npc2Name = '';
    let found = false;
    let attempts = 0;

    while (attempts < 50 && !found) {
      if (npcsThatNeed.length > 1) {
        // Prefer another NPC that needs encounters
        const candidates = npcsThatNeed.filter((name) => name !== npc1Name);
        npc2Name = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        // Pair with any other NPC (excluding player's strategy)
        const allNames = Object.keys(encounterCounts);
        const others = allNames.filter((name) => name !== npc1Name && name !== excludeStrategyName);
        npc2Name = others[Math.floor(Math.random() * others.length)];
      }

      // Check if this pair hasn't been used yet
      const pairKey = [npc1Name, npc2Name].sort().join('|');
      if (!usedPairs.has(pairKey)) {
        usedPairs.add(pairKey);
        found = true;
      }

      attempts++;
    }

    if (!found) break;

    // Find strategy keys
    const npc1Key = strategyKeys.find((key) => STRATEGIES[key].name === npc1Name);
    const npc2Key = strategyKeys.find((key) => STRATEGIES[key].name === npc2Name);

    if (npc1Key && npc2Key) {
      const encounter = simulateNPCEncounter(npc1Key, npc2Key);
      newEncounters.push(encounter);

      // Update counts
      encounterCounts[npc1Name]++;
      encounterCounts[npc2Name]++;
    }

    // Recalculate NPCs that still need encounters (excluding player's strategy)
    npcsThatNeed = Object.entries(encounterCounts)
      .filter(([name, count]) => count < targetEncounters && name !== excludeStrategyName)
      .map(([name]) => name);
  }

  return newEncounters;
}
