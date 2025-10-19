import { useReducer } from 'react';
import {
  GameState,
  GameAction,
  StrategyKey,
  ScorecardEntry,
  GlobalEncounter,
  UserEncounter,
} from './types';
import { STRATEGIES } from './constants';
import { getTimestamp } from './utils';
import {
  playRound,
  determineOutcome,
  generateBalancedNPCEncounters,
} from './gameEngine';

// Initial state
const initialState: GameState = {
  phase: 'setup',
  playerStrategy: null,
  platformCount: 10,
  platforms: [],
  scorecard: [],
  totalScore: 0,
  completedPlatforms: [],
  personalLeaderboard: [],
  npcLeaderboard: {},
  globalEncounters: [],
  currentPlatformIndex: null,
  modalState: 'playing',
  history: [],
  playerScore: 0,
  opponentScore: 0,
  lastRoundResult: null,
  showGameModal: false,
  showNPCEncounters: false,
  showEncounterDetail: false,
  selectedEncounter: null,
  strategyLeaderboardExpanded: false,
  personalLeaderboardExpanded: false,
  autoPlayEnabled: false,
  autoPlaying: false,
};

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER_STRATEGY':
      return { ...state, playerStrategy: action.payload };

    case 'SET_PLATFORM_COUNT':
      return { ...state, platformCount: action.payload };

    case 'START_TRAIL': {
      if (!state.playerStrategy) return state;

      // Generate platforms
      const strategyKeys = Object.keys(STRATEGIES) as StrategyKey[];
      const platforms = Array.from({ length: state.platformCount }, (_, i) => {
        return strategyKeys[i % strategyKeys.length];
      });

      return {
        ...state,
        phase: 'trail',
        platforms,
        scorecard: [],
        totalScore: 0,
        completedPlatforms: [],
      };
    }

    case 'OPEN_PLATFORM': {
      const platformIndex = action.payload;
      const isCompleted = state.completedPlatforms.includes(platformIndex);

      // Don't allow opening completed platforms unless auto-play is enabled
      if (isCompleted && !state.autoPlayEnabled) return state;

      return {
        ...state,
        currentPlatformIndex: platformIndex,
        history: [],
        playerScore: 0,
        opponentScore: 0,
        lastRoundResult: null,
        modalState: 'playing',
        showGameModal: true,
      };
    }

    case 'PLAY_ROUND': {
      if (
        state.currentPlatformIndex === null ||
        !state.playerStrategy ||
        state.autoPlaying
      ) {
        return state;
      }

      const opponentStrategy = state.platforms[state.currentPlatformIndex];
      const { newHistory, payoff, roundResult } = playRound(
        action.payload,
        opponentStrategy,
        state.history
      );

      const newPlayerScore = state.playerScore + payoff.player;
      const newOpponentScore = state.opponentScore + payoff.opponent;

      return {
        ...state,
        history: newHistory,
        playerScore: newPlayerScore,
        opponentScore: newOpponentScore,
        lastRoundResult: roundResult,
        modalState: newHistory.length >= 10 ? 'platformComplete' : 'playing',
      };
    }

    case 'UPDATE_AUTO_PLAY_STATE':
      return {
        ...state,
        history: action.payload.history,
        playerScore: action.payload.playerScore,
        opponentScore: action.payload.opponentScore,
        lastRoundResult: action.payload.lastRoundResult,
        modalState: 'platformComplete',
      };

    case 'SET_AUTO_PLAYING':
      return { ...state, autoPlaying: action.payload };

    case 'COMPLETE_PLATFORM': {
      if (state.currentPlatformIndex === null || !state.playerStrategy) {
        return state;
      }

      const outcome = determineOutcome(state.playerScore, state.opponentScore);
      const opponentStrategy = state.platforms[state.currentPlatformIndex];

      // Create scorecard entry
      const newScorecardEntry: ScorecardEntry = {
        platform: state.currentPlatformIndex + 1,
        opponent: STRATEGIES[opponentStrategy].name,
        score: state.playerScore,
        opponentScore: state.opponentScore,
        history: state.history,
        playerStrategy: STRATEGIES[state.playerStrategy].name,
        outcome,
      };

      const newScorecard = [...state.scorecard, newScorecardEntry];
      const newTotalScore = state.totalScore + state.playerScore;
      const newCompletedPlatforms = [
        ...state.completedPlatforms,
        state.currentPlatformIndex,
      ];

      // Create user encounter for global leaderboard
      const userStrategyName = STRATEGIES[state.playerStrategy].name;
      const opponentStrategyName = STRATEGIES[opponentStrategy].name;

      const userEncounter: UserEncounter = {
        isUserEncounter: true,
        player: userStrategyName,
        opponent: opponentStrategyName,
        playerScore: state.playerScore,
        opponentScore: state.opponentScore,
        winner:
          state.playerScore > state.opponentScore
            ? userStrategyName
            : state.opponentScore > state.playerScore
            ? opponentStrategyName
            : 'Tie',
        timestamp: getTimestamp(),
        history: state.history,
      };

      // Calculate encounter counts
      const encounterCounts: Record<string, number> = {};
      Object.keys(STRATEGIES).forEach((key) => {
        encounterCounts[STRATEGIES[key as StrategyKey].name] = 0;
      });

      // Count NPC vs NPC encounters
      state.globalEncounters.forEach((encounter) => {
        if ('npc1' in encounter) {
          encounterCounts[encounter.npc1]++;
          encounterCounts[encounter.npc2]++;
        }
      });

      // Count user encounters
      state.scorecard.forEach((entry) => {
        encounterCounts[entry.opponent]++;
      });

      // Count current encounter
      encounterCounts[opponentStrategyName]++;
      encounterCounts[userStrategyName] = Math.max(
        encounterCounts[userStrategyName],
        newCompletedPlatforms.length
      );

      // Generate balanced NPC encounters
      const strategyKeys = Object.keys(STRATEGIES) as StrategyKey[];
      const newNPCEncounters = generateBalancedNPCEncounters(
        encounterCounts,
        newCompletedPlatforms.length,
        strategyKeys
      );

      // Update NPC leaderboard
      const updatedNpcLeaderboard = { ...state.npcLeaderboard };
      updatedNpcLeaderboard[userStrategyName] =
        (updatedNpcLeaderboard[userStrategyName] || 0) + state.playerScore;
      updatedNpcLeaderboard[opponentStrategyName] =
        (updatedNpcLeaderboard[opponentStrategyName] || 0) + state.opponentScore;

      newNPCEncounters.forEach((encounter) => {
        updatedNpcLeaderboard[encounter.npc1] =
          (updatedNpcLeaderboard[encounter.npc1] || 0) + encounter.npc1Score;
        updatedNpcLeaderboard[encounter.npc2] =
          (updatedNpcLeaderboard[encounter.npc2] || 0) + encounter.npc2Score;
      });

      // Update global encounters
      const newGlobalEncounters: GlobalEncounter[] = [
        ...state.globalEncounters,
        userEncounter,
        ...newNPCEncounters,
      ];

      // Check if trail is complete
      let newPhase = state.phase;
      let newPersonalLeaderboard = state.personalLeaderboard;

      if (newCompletedPlatforms.length === state.platforms.length) {
        newPhase = 'complete';
        const leaderboardEntry = {
          rank: state.personalLeaderboard.length + 1,
          score: newTotalScore,
          strategy: userStrategyName,
          platformsCompleted: state.platforms.length,
          timestamp: getTimestamp(),
        };
        newPersonalLeaderboard = [...state.personalLeaderboard, leaderboardEntry]
          .sort((a, b) => b.score - a.score)
          .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      }

      return {
        ...state,
        scorecard: newScorecard,
        totalScore: newTotalScore,
        completedPlatforms: newCompletedPlatforms,
        npcLeaderboard: updatedNpcLeaderboard,
        globalEncounters: newGlobalEncounters,
        phase: newPhase,
        personalLeaderboard: newPersonalLeaderboard,
        showGameModal: false,
      };
    }

    case 'RESET_GAME':
      return {
        ...initialState,
        personalLeaderboard: state.personalLeaderboard,
      };

    case 'CLOSE_GAME_MODAL':
      return { ...state, showGameModal: false };

    case 'TOGGLE_NPC_ENCOUNTERS':
      return { ...state, showNPCEncounters: !state.showNPCEncounters };

    case 'TOGGLE_STRATEGY_LEADERBOARD':
      return {
        ...state,
        strategyLeaderboardExpanded: !state.strategyLeaderboardExpanded,
      };

    case 'TOGGLE_PERSONAL_LEADERBOARD':
      return {
        ...state,
        personalLeaderboardExpanded: !state.personalLeaderboardExpanded,
      };

    case 'TOGGLE_AUTO_PLAY':
      return { ...state, autoPlayEnabled: !state.autoPlayEnabled };

    case 'VIEW_ENCOUNTER_DETAIL':
      return {
        ...state,
        selectedEncounter: action.payload,
        showEncounterDetail: true,
      };

    case 'CLOSE_ENCOUNTER_DETAIL':
      return { ...state, showEncounterDetail: false };

    case 'VIEW_GLOBAL_ENCOUNTER': {
      const encounter = action.payload;
      const transformed: ScorecardEntry = {
        platform:
          'isUserEncounter' in encounter && encounter.isUserEncounter
            ? 0
            : -1,
        playerStrategy:
          'isUserEncounter' in encounter && encounter.isUserEncounter
            ? encounter.player
            : encounter.npc1,
        opponent:
          'isUserEncounter' in encounter && encounter.isUserEncounter
            ? encounter.opponent
            : encounter.npc2,
        score:
          'isUserEncounter' in encounter && encounter.isUserEncounter
            ? encounter.playerScore
            : encounter.npc1Score,
        opponentScore:
          'isUserEncounter' in encounter && encounter.isUserEncounter
            ? encounter.opponentScore
            : encounter.npc2Score,
        history:
          'isUserEncounter' in encounter && encounter.isUserEncounter
            ? encounter.history
            : encounter.history.map((h) => ({
                player: h.npc1,
                opponent: h.npc2,
              })),
        outcome: determineOutcome(
          'isUserEncounter' in encounter && encounter.isUserEncounter
            ? encounter.playerScore
            : encounter.npc1Score,
          'isUserEncounter' in encounter && encounter.isUserEncounter
            ? encounter.opponentScore
            : encounter.npc2Score
        ),
      };
      return {
        ...state,
        selectedEncounter: transformed,
        showEncounterDetail: true,
      };
    }

    default:
      return state;
  }
}

// Custom hook
export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return { state, dispatch };
}
